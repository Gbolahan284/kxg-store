import { Prisma } from '@/app/generated/prisma/client';
import { db } from '@/lib/db';
import { getSizeStock, parseSizesToMap } from '@/lib/inventory';

export interface CheckoutInventoryItem {
  id: string;
  name: string;
  size: string;
  quantity: number;
  price: number;
  image: string;
}

type JsonRecord = Record<string, unknown>;

type ReserveResult =
  | { status: 'reserved'; items: CheckoutInventoryItem[]; amountKobo: number }
  | { status: 'unavailable'; message: string }
  | { status: 'invalid'; message: string };

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readReservedItems(value: unknown): Array<Pick<CheckoutInventoryItem, 'id' | 'size' | 'quantity'>> {
  if (!Array.isArray(value)) {
    throw new Error('Pending checkout contains invalid reserved inventory.');
  }

  return value.map((item) => {
    if (
      !isRecord(item) ||
      typeof item.id !== 'string' ||
      typeof item.size !== 'string' ||
      !Number.isSafeInteger(item.quantity) ||
      Number(item.quantity) <= 0
    ) {
      throw new Error('Pending checkout contains invalid reserved inventory.');
    }

    return {
      id: item.id,
      size: item.size.trim().toUpperCase(),
      quantity: Number(item.quantity),
    };
  });
}

export async function reserveCheckoutInventory(
  reference: string,
  requestedItems: Array<Pick<CheckoutInventoryItem, 'id' | 'size' | 'quantity'>>,
  shippingMethod: 'ISLAND' | 'MAINLAND'
): Promise<ReserveResult> {
  const productIds = [...new Set(requestedItems.map((item) => item.id))].sort();
  if (requestedItems.length === 0 || productIds.length === 0) {
    return { status: 'invalid', message: 'Your cart is empty.' };
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 10 * 60 * 1000);

  try {
    return await db.$transaction(async (tx): Promise<ReserveResult> => {
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
      if (products.length !== productIds.length) {
        return { status: 'unavailable', message: 'A product in your cart is no longer available.' };
      }

      const productsById = new Map(products.map((product) => [product.id, product]));
      const activeReservations = await tx.pendingPaystackCheckout.findMany({
        where: {
          status: 'PENDING',
          expiresAt: { gt: now },
        },
        select: { items: true },
      });

      const reservedCounts = new Map<string, number>();
      for (const reservation of activeReservations) {
        for (const item of readReservedItems(reservation.items)) {
          const key = `${item.id}:${item.size}`;
          reservedCounts.set(key, (reservedCounts.get(key) ?? 0) + item.quantity);
        }
      }

      const requestedCounts = new Map<string, number>();
      const items: CheckoutInventoryItem[] = [];
      for (const request of requestedItems) {
        const product = productsById.get(request.id);
        if (!product || !product.inStock) {
          return { status: 'unavailable', message: 'A product in your cart is sold out.' };
        }

        const size = request.size.trim().toUpperCase();
        const key = `${product.id}:${size}`;
        const quantity = (requestedCounts.get(key) ?? 0) + request.quantity;
        requestedCounts.set(key, quantity);
        const alreadyReserved = reservedCounts.get(key) ?? 0;
        const available = getSizeStock(parseSizesToMap(product.sizes), size);
        if (!size || !Number.isSafeInteger(quantity) || quantity <= 0 || available < alreadyReserved + quantity) {
          return {
            status: 'unavailable',
            message: `${product.name} in size ${size || request.size} is no longer available in that quantity.`,
          };
        }

        items.push({
          id: product.id,
          name: product.name,
          size,
          quantity: request.quantity,
          price: product.price,
          image: product.image,
        });
      }

      const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const tax = Math.round(subtotal * 0.075);
      const shipping = shippingMethod === 'ISLAND' ? 8000 : 5000;
      const amountKobo = Math.round((subtotal + tax + shipping) * 100);
      if (!Number.isSafeInteger(amountKobo) || amountKobo <= 0) {
        return { status: 'invalid', message: 'Could not calculate a valid order total.' };
      }

      const reservationItems: Prisma.InputJsonArray = items.map((item) => ({
        id: item.id,
        name: item.name,
        size: item.size,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
      }));

      await tx.pendingPaystackCheckout.create({
        data: {
          reference,
          items: reservationItems,
          amountKobo,
          expiresAt,
        },
      });

      return { status: 'reserved', items, amountKobo };
    });
  } catch (error) {
    console.error('Could not reserve checkout inventory:', error);
    throw error;
  }
}
