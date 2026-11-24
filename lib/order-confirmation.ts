import { Prisma } from '@/app/generated/prisma/client';
import { db } from '@/lib/db';
import { decrementSizeStock, getSizeStock, getTotalStock, parseSizesToMap } from '@/lib/inventory';
import { Resend } from 'resend';

type JsonRecord = Record<string, unknown>;

type ConfirmationResult =
  | { status: 'sent' }
  | { status: 'invalid' }
  | { status: 'refund-pending' }
  | { status: 'failed'; reason: string };

type InventoryOrderItem = {
  id: string;
  size: string;
  quantity: number;
};

type InventoryDeductionResult =
  | { status: 'deducted' }
  | { status: 'already-deducted' }
  | { status: 'invalid' }
  | { status: 'insufficient-stock' };

const DEFAULT_FROM_EMAIL = 'KXG <hello@fitbykxg.com>';
const DEFAULT_REPLY_TO = 'fitbykxg@gmail.com';
const KXG_LOGO_URL =
  'https://res.cloudinary.com/rl3bynob/image/upload/v1795515682/photo_2026-11-24_11-20-45.jpg';

class InsufficientStockError extends Error {}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseOrderItems(metadata: unknown): InventoryOrderItem[] | null {
  if (!isRecord(metadata) || !Array.isArray(metadata.cartItems) || metadata.cartItems.length === 0) {
    return null;
  }

  const items = metadata.cartItems.flatMap((item): InventoryOrderItem[] => {
    if (
      !isRecord(item) ||
      typeof item.id !== 'string' ||
      typeof item.size !== 'string' ||
      !Number.isSafeInteger(item.quantity) ||
      Number(item.quantity) <= 0
    ) {
      return [];
    }

    return [{ id: item.id, size: item.size, quantity: Number(item.quantity) }];
  });

  return items.length === metadata.cartItems.length ? items : null;
}

async function deductPaidOrderInventory(
  reference: string
): Promise<InventoryDeductionResult> {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await db.$transaction(async (tx): Promise<InventoryDeductionResult> => {
        await tx.$queryRaw<Array<{ reference: string }>>`
          SELECT "reference" FROM "PendingPaystackCheckout"
          WHERE "reference" = ${reference}
          FOR UPDATE
        `;

        const checkout = await tx.pendingPaystackCheckout.findUnique({ where: { reference } });
        if (!checkout) return { status: 'invalid' };

        const existing = await tx.$queryRaw<Array<{ reference: string }>>`
          SELECT "reference" FROM "ProcessedPaystackPayment"
          WHERE "reference" = ${reference}
        `;
        if (existing.length > 0 || checkout.status === 'PAID') {
          return { status: 'already-deducted' };
        }

        const reservedItems = parseOrderItems({ cartItems: checkout.items });
        if (!reservedItems) return { status: 'invalid' };
        const requested = new Map<string, InventoryOrderItem>();
        for (const item of reservedItems) {
          const size = item.size.trim().toUpperCase();
          const key = `${item.id}:${size}`;
          const current = requested.get(key);
          requested.set(key, {
            id: item.id,
            size,
            quantity: (current?.quantity ?? 0) + item.quantity,
          });
        }
        const requests = [...requested.values()];
        const productIds = [...new Set(requests.map((item) => item.id))].sort();

        await tx.$queryRaw<Array<{ id: string }>>`
          SELECT "id" FROM "Product"
          WHERE "id" IN (${Prisma.join(productIds)})
          ORDER BY "id"
          FOR UPDATE
        `;

        const products = await tx.product.findMany({
          where: { id: { in: productIds } },
          orderBy: { id: 'asc' },
        });
        if (products.length !== productIds.length) return { status: 'invalid' };

        const now = new Date();
        const otherReservations = await tx.pendingPaystackCheckout.findMany({
          where: {
            reference: { not: reference },
            status: 'PENDING',
            expiresAt: { gt: now },
          },
          select: { items: true },
        });
        const reservedCounts = new Map<string, number>();
        for (const other of otherReservations) {
          const activeItems = parseOrderItems({ cartItems: other.items });
          if (!activeItems) return { status: 'invalid' };
          for (const item of activeItems) {
            const key = `${item.id}:${item.size.trim().toUpperCase()}`;
            reservedCounts.set(key, (reservedCounts.get(key) ?? 0) + item.quantity);
          }
        }

        const productsById = new Map(products.map((product) => [product.id, product]));
        const updatedSizes = new Map<string, ReturnType<typeof parseSizesToMap>>();
        for (const item of requests) {
          const product = productsById.get(item.id);
          if (!product) return { status: 'invalid' };

          const sizes = updatedSizes.get(item.id) ?? parseSizesToMap(product.sizes);
          const key = `${item.id}:${item.size}`;
          const availableToThisOrder = getSizeStock(sizes, item.size) - (reservedCounts.get(key) ?? 0);
          if (availableToThisOrder < item.quantity) throw new InsufficientStockError();
          const decreased = decrementSizeStock(sizes, item.size, item.quantity);
          if (!decreased) throw new InsufficientStockError();
          updatedSizes.set(item.id, decreased);
        }

        for (const product of products) {
          const sizes = updatedSizes.get(product.id);
          if (!sizes) continue;
          await tx.product.update({
            where: { id: product.id },
            data: {
              sizes,
              inStock: getTotalStock(sizes) > 0,
            },
          });
        }

        await tx.$executeRaw`
          INSERT INTO "ProcessedPaystackPayment" ("reference", "processedAt")
          VALUES (${reference}, CURRENT_TIMESTAMP)
        `;
        await tx.pendingPaystackCheckout.update({
          where: { reference },
          data: { status: 'PAID' },
        });

        return { status: 'deducted' };
      }, { isolationLevel: 'Serializable' });
    } catch (error) {
      if (error instanceof InsufficientStockError) {
        return { status: 'insufficient-stock' };
      }

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2034' &&
        attempt < 2
      ) {
        continue;
      }
      throw error;
    }
  }

  return { status: 'invalid' };
}

async function requestRefund(reference: string): Promise<ConfirmationResult> {
  const claimed = await db.pendingPaystackCheckout.updateMany({
    where: { reference, status: { in: ['PENDING', 'CANCELLED'] } },
    data: { status: 'REFUND_REQUESTED' },
  });
  if (claimed.count !== 1) return { status: 'refund-pending' };

  const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
  if (!paystackSecret) {
    console.error('Refund requires manual action: Paystack is not configured for reference:', reference);
    return { status: 'refund-pending' };
  }

  try {
    const response = await fetch('https://api.paystack.co/refund', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ transaction: reference, reason: 'Item unavailable after checkout reservation expired' }),
    });
    const result: unknown = await response.json();
    if (!response.ok || !isRecord(result) || result.status !== true) {
      console.error('Paystack refund request needs manual review for reference:', reference);
      return { status: 'refund-pending' };
    }

    await db.pendingPaystackCheckout.update({
      where: { reference },
      data: { status: 'REFUND_INITIATED' },
    });
  } catch (error) {
    console.error('Paystack refund request needs manual review for reference:', reference, error);
  }

  return { status: 'refund-pending' };
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return entities[character];
  });
}

function formatOrderedItems(metadata: unknown): string {
  if (!isRecord(metadata) || !Array.isArray(metadata.cartItems)) {
    return '<li style="margin-bottom:6px;">Your KXG order</li>';
  }

  const rows = metadata.cartItems.flatMap((item): string[] => {
    if (!isRecord(item) || typeof item.name !== 'string') return [];
    const size = typeof item.size === 'string' ? ` · Size ${item.size}` : '';
    const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
    return [
      `<li style="margin-bottom:6px;"><strong>${escapeHtml(item.name)}</strong>${escapeHtml(size)} &times; ${quantity}</li>`,
    ];
  });

  return rows.length ? rows.join('') : '<li style="margin-bottom:6px;">Your KXG order</li>';
}

export async function sendVerifiedOrderConfirmation(reference: string): Promise<ConfirmationResult> {
  const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
  if (!paystackSecret) return { status: 'failed', reason: 'Payment verification is not configured.' };
  let verificationResponse: Response;
  try {
    verificationResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: { Authorization: `Bearer ${paystackSecret}` },
        cache: 'no-store',
      }
    );
  } catch (error) {
    console.error('Could not verify Paystack transaction:', error);
    return { status: 'failed', reason: 'Could not verify payment.' };
  }

  if (!verificationResponse.ok) {
    console.error('Paystack transaction verification returned HTTP', verificationResponse.status);
    return { status: 'failed', reason: 'Could not verify payment.' };
  }

  let verification: unknown;
  try {
    verification = await verificationResponse.json();
  } catch (error) {
    console.error('Paystack returned invalid transaction verification data:', error);
    return { status: 'failed', reason: 'Could not verify payment.' };
  }

  if (!isRecord(verification) || verification.status !== true || !isRecord(verification.data)) {
    return { status: 'invalid' };
  }

  const data = verification.data;
  const transactionAmount = data.amount;
  const customer = data.customer;
  if (
    data.status !== 'success' ||
    data.reference !== reference ||
    data.currency !== 'NGN' ||
    typeof transactionAmount !== 'number' ||
    transactionAmount <= 0 ||
    !isRecord(customer) ||
    typeof customer.email !== 'string'
  ) {
    return { status: 'invalid' };
  }

  const metadata = data.metadata;
  if (
    !isRecord(metadata) ||
    metadata.checkoutReference !== reference
  ) {
    return { status: 'invalid' };
  }

  let checkout: Awaited<ReturnType<typeof db.pendingPaystackCheckout.findUnique>>;
  try {
    checkout = await db.pendingPaystackCheckout.findUnique({ where: { reference } });
  } catch (error) {
    console.error('Could not load reserved checkout for verified payment:', error);
    return { status: 'failed', reason: 'Could not load the reserved order.' };
  }
  if (!checkout || checkout.amountKobo !== transactionAmount) return { status: 'invalid' };
  if (checkout.status.startsWith('REFUND_')) return { status: 'refund-pending' };

  const orderItems = parseOrderItems({ cartItems: checkout.items });
  if (!orderItems) return { status: 'invalid' };

  let inventoryResult: InventoryDeductionResult;
  try {
    inventoryResult = await deductPaidOrderInventory(reference);
  } catch (error) {
    console.error('Failed to deduct inventory for verified payment:', error);
    return { status: 'failed', reason: 'Could not update order inventory.' };
  }
  if (inventoryResult.status === 'invalid') return { status: 'invalid' };
  if (inventoryResult.status === 'insufficient-stock') {
    console.error('Payment verified but reserved inventory is no longer available:', reference);
    try {
      return await requestRefund(reference);
    } catch (error) {
      console.error('Could not create refund request for verified payment:', reference, error);
      return { status: 'failed', reason: 'Payment succeeded but the order needs a manual refund.' };
    }
  }

  const orderEmailMetadata = { ...metadata, cartItems: checkout.items };
  const resendApiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || DEFAULT_FROM_EMAIL;
  if (!resendApiKey) {
    console.error('Order email is not configured: RESEND_API_KEY is missing.');
    return { status: 'failed', reason: 'Order was processed but email is not configured.' };
  }

  const customFields = Array.isArray(metadata.custom_fields) ? metadata.custom_fields : [];
  const customerField = customFields.find(
    (field) => isRecord(field) && field.variable_name === 'customer_name'
  );
  const customerName =
    isRecord(customerField) && typeof customerField.value === 'string'
      ? customerField.value
      : 'KXG customer';
  const amount = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
  }).format(transactionAmount / 100);
  const safeName = escapeHtml(customerName);
  const safeReference = escapeHtml(reference);

  try {
    const resend = new Resend(resendApiKey);
    const { error } = await resend.emails.send(
      {
        from,
        to: [customer.email],
        replyTo: DEFAULT_REPLY_TO,
        subject: `KXG Order Confirmed — #${reference}`,
        html: `
          <div style="background-color:#F5EED8;padding:28px 12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#2C1509;">
            <div style="max-width:560px;margin:0 auto;background-color:#FFFDF7;border:2px solid #2C1509;border-radius:12px;overflow:hidden;">

              <!-- Message Body -->
              <div style="padding:28px 24px 20px;line-height:1.65;font-size:15px;color:#2C1509;">
                <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#6B4A38;">
                  Order Reference: ${safeReference}
                </p>

                <h1 style="margin:0 0 12px;font-size:22px;font-weight:800;letter-spacing:0.6px;text-transform:uppercase;color:#2C1509;">
                  ORDER CONFIRMED.
                </h1>

                <p style="margin:0 0 14px;color:#2C1509;">
                  Hi ${safeName}, your payment was successful. Thanks for shopping with <strong>KXG</strong>.
                </p>

                <div style="margin:16px 0;padding:14px 16px;background-color:#FBF6E6;border:1px solid #E5DBC0;border-radius:8px;">
                  <p style="margin:0 0 6px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.6px;color:#2C1509;">
                    Items Ordered
                  </p>
                  <ul style="margin:0;padding-left:20px;color:#3B2012;font-size:14px;">
                    ${formatOrderedItems(orderEmailMetadata)}
                  </ul>
                </div>

                <p style="margin:0 0 16px;font-size:15px;font-weight:700;color:#2C1509;">
                  Total Paid: ${escapeHtml(amount)}
                </p>

                <p style="margin:0 0 14px;color:#4A2A18;">
                  We're getting your order ready. Reply directly to this email if you have any questions.
                </p>

                <p style="margin:0;font-weight:700;color:#2C1509;">
                  Always Stay Fly, Never Follow.<br />
                  &mdash; Team KXG
                </p>
              </div>

              <!-- Bottom KXG Logo -->
              <div style="background-color:#F5EED8;padding:20px 24px;text-align:center;border-top:1px solid #E5DBC0;">
                <img
                  src="${KXG_LOGO_URL}"
                  alt="KXG"
                  width="200"
                  style="display:inline-block;width:200px;max-width:100%;height:auto;border:0;border-radius:8px;"
                />
              </div>

            </div>
          </div>
        `,
      },
      { headers: { 'Idempotency-Key': `kxg-order-${reference}` } }
    );

    if (error) {
      console.error('Resend could not send the order confirmation:', error);
      return { status: 'failed', reason: 'Email provider rejected the message.' };
    }
  } catch (error) {
    console.error('Order confirmation email failed:', error);
    return { status: 'failed', reason: 'Email could not be sent.' };
  }

  return { status: 'sent' };
}