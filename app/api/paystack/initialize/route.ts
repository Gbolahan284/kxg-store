import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { reserveCheckoutInventory } from '@/lib/inventory-reservations';

type JsonRecord = Record<string, unknown>;

interface PaystackItem {
  id: string;
  name: string;
  size: string;
  quantity: number;
  price: number;
  image?: string;
}

interface PaystackCustomField {
  display_name: string;
  variable_name: string;
  value: string;
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  if (!isRecord(body)) {
    return NextResponse.json({ error: 'Invalid checkout details.' }, { status: 400 });
  }

  const { email, firstName, lastName, phone, shippingMethod } = body;
  if (
    typeof email !== 'string' ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
    typeof firstName !== 'string' ||
    typeof lastName !== 'string' ||
    typeof phone !== 'string' ||
    (shippingMethod !== 'ISLAND' && shippingMethod !== 'MAINLAND')
  ) {
    return NextResponse.json({ error: 'Invalid checkout details.' }, { status: 400 });
  }

  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    console.error('Paystack checkout is not configured: PAYSTACK_SECRET_KEY is missing.');
    return NextResponse.json({ error: 'Payment is not configured.' }, { status: 500 });
  }

  const rawItems = Array.isArray(body.items) ? body.items : [];
  const requestedItems = rawItems.flatMap(
    (item): Array<{ id: string; size: string; quantity: number }> => {
      if (
        !isRecord(item) ||
        typeof item.id !== 'string' ||
        typeof item.size !== 'string' ||
        !Number.isSafeInteger(item.quantity) ||
        Number(item.quantity) <= 0
      ) return [];
      return [{
        id: item.id,
        size: item.size,
        quantity: Number(item.quantity),
      }];
    }
  );

  if (requestedItems.length === 0 || requestedItems.length !== rawItems.length) {
    return NextResponse.json({ error: 'Your cart has invalid product or size details.' }, { status: 400 });
  }

  const reference = `kxg_${randomUUID()}`;
  let reservation: Awaited<ReturnType<typeof reserveCheckoutInventory>>;
  try {
    reservation = await reserveCheckoutInventory(
      reference,
      requestedItems,
      shippingMethod
    );
  } catch (error) {
    console.error('Could not reserve product inventory before payment:', error);
    return NextResponse.json({ error: 'Could not reserve cart inventory. Please try again.' }, { status: 500 });
  }

  if (reservation.status !== 'reserved') {
    return NextResponse.json(
      { error: reservation.message },
      { status: reservation.status === 'unavailable' ? 409 : 400 }
    );
  }

  const items: PaystackItem[] = reservation.items;
  const amount = reservation.amountKobo;
  const suppliedMetadata = isRecord(body.metadata) ? body.metadata : {};
  const customFields: PaystackCustomField[] = Array.isArray(suppliedMetadata.custom_fields)
    ? suppliedMetadata.custom_fields.flatMap((field): PaystackCustomField[] => {
        if (
          !isRecord(field) ||
          typeof field.display_name !== 'string' ||
          typeof field.variable_name !== 'string'
        ) {
          return [];
        }
        return [{
          display_name: field.display_name,
          variable_name: field.variable_name,
          value: String(field.value ?? ''),
        }];
      })
    : [];
  const formattedItems = items.length
    ? items.map((item) => `${item.name} (Size: ${item.size}) x${item.quantity}`).join(', ')
    : 'No items recorded';
  const orderedItemsField = customFields.find((field) => field.variable_name === 'ordered_items');
  if (orderedItemsField) {
    orderedItemsField.value = formattedItems;
  } else {
    customFields.push({
      display_name: 'Ordered Items & Sizes',
      variable_name: 'ordered_items',
      value: formattedItems,
    });
  }

  try {
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.trim(),
        amount,
        reference,
        callback_url: new URL('/api/paystack/confirm-order', request.url).toString(),
        first_name: firstName,
        last_name: lastName,
        phone,
        metadata: {
          ...suppliedMetadata,
          custom_fields: customFields,
          cartItems: items,
          expectedTotalKobo: amount,
          shippingMethod,
          checkoutReference: reference,
        },
      }),
    });

    let data: unknown;
    try {
      data = await response.json();
    } catch {
      await cancelReservation(reference);
      return NextResponse.json({ error: 'Paystack returned an invalid response.' }, { status: 502 });
    }

    if (!response.ok || !isRecord(data) || data.status !== true) {
      await cancelReservation(reference);
      const message = isRecord(data) && typeof data.message === 'string'
        ? data.message
        : 'Payment initialization failed.';
      return NextResponse.json({ error: message }, { status: 502 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Paystack initialization error:', error);
    await cancelReservation(reference);
    return NextResponse.json({ error: 'Failed to initialize payment.' }, { status: 502 });
  }
}

async function cancelReservation(reference: string) {
  try {
    await db.pendingPaystackCheckout.updateMany({
      where: { reference, status: 'PENDING' },
      data: { status: 'CANCELLED' },
    });
  } catch (error) {
    console.error('Could not release inventory reservation after payment initialization failed:', error);
  }
}
