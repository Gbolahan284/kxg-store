import { NextResponse } from 'next/server';

type JsonRecord = Record<string, unknown>;

interface PaystackItem {
  name: string;
  size: string;
  quantity: number;
  price: number;
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

  const { email, firstName, lastName, phone, amount } = body;
  if (
    typeof email !== 'string' ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
    typeof firstName !== 'string' ||
    typeof lastName !== 'string' ||
    typeof phone !== 'string' ||
    typeof amount !== 'number' ||
    !Number.isSafeInteger(amount) ||
    amount <= 0
  ) {
    return NextResponse.json({ error: 'Invalid checkout details.' }, { status: 400 });
  }

  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    console.error('Paystack checkout is not configured: PAYSTACK_SECRET_KEY is missing.');
    return NextResponse.json({ error: 'Payment is not configured.' }, { status: 500 });
  }

  const rawItems = Array.isArray(body.items) ? body.items : [];
  const items: PaystackItem[] = rawItems.flatMap((item): PaystackItem[] => {
    if (!isRecord(item) || typeof item.name !== 'string') return [];
    return [{
      name: item.name,
      size: typeof item.size === 'string' ? item.size : 'N/A',
      quantity: Math.max(1, Math.floor(Number(item.quantity) || 1)),
      price: Math.max(0, Number(item.price) || 0),
    }];
  });

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
        callback_url: new URL('/api/paystack/confirm-order', request.url).toString(),
        first_name: firstName,
        last_name: lastName,
        phone,
        metadata: {
          ...suppliedMetadata,
          custom_fields: customFields,
          cartItems: items,
        },
      }),
    });

    const data: unknown = await response.json();
    return NextResponse.json(data, { status: response.ok ? 200 : 502 });
  } catch (error) {
    console.error('Paystack initialization error:', error);
    return NextResponse.json({ error: 'Failed to initialize payment.' }, { status: 502 });
  }
}
