'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { createHmac, timingSafeEqual } from 'crypto';
import { getTotalStock, parseSizesToMap } from '@/lib/inventory';

// ---------------------------------------------------------------
// AUTH HELPERS (not exported, so they are not callable from the browser)
// ---------------------------------------------------------------

function getSecret(): string {
  const key = process.env.ADMIN_SECRET_KEY;
  if (!key) {
    throw new Error('ADMIN_SECRET_KEY is not set.');
  }
  return key;
}

// The cookie value is derived from the secret, so nobody can guess or fake it
function sessionToken(): string {
  return createHmac('sha256', getSecret()).update('kxg-admin-session').digest('hex');
}

function safeEqual(a: string, b: string): boolean {
  const A = Buffer.from(a);
  const B = Buffer.from(b);
  return A.length === B.length && timingSafeEqual(A, B);
}

async function checkAuth() {
  const cookieStore = await cookies();
  const auth = cookieStore.get('kxg_admin_auth')?.value ?? '';
  if (!safeEqual(auth, sessionToken())) {
    throw new Error('Unauthorized access.');
  }
}

// ---------------------------------------------------------------
// SIZE HELPERS
// ---------------------------------------------------------------

// Cleans the sizes sent from the admin form: valid names, whole numbers, never below 0
function parseAdminSizes(raw: string | null) {
  const sizes = parseSizesToMap(raw);
  if (raw && Object.keys(sizes).length === 0) {
    throw new Error('Invalid size inventory data.');
  }
  return sizes;
}

// ---------------------------------------------------------------
// LOGIN
// ---------------------------------------------------------------

export async function verifyAdminPasscode(passcode: string) {
  let secret: string;
  try {
    secret = getSecret();
  } catch {
    return { success: false, error: 'Admin is not configured.' };
  }

  if (!safeEqual((passcode || '').trim(), secret)) {
    return { success: false, error: 'Invalid secret passcode.' };
  }

  const cookieStore = await cookies();
  cookieStore.set('kxg_admin_auth', sessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 1 day session
    path: '/',
  });

  return { success: true };
}

// ---------------------------------------------------------------
// PRODUCTS
// ---------------------------------------------------------------

export async function createProduct(formData: FormData) {
  await checkAuth();

  const name = ((formData.get('name') as string) || '').trim();
  const description = (formData.get('description') as string) || '';
  const price = parseFloat(formData.get('price') as string) || 0;
  const category = ((formData.get('category') as string) || '').trim();
  const image = ((formData.get('image') as string) || '').trim();
  const hoverImage = ((formData.get('hoverImage') as string) || '').trim();

  const sizes = parseAdminSizes(formData.get('sizes') as string);
  const totalStock = getTotalStock(sizes);

  if (!name || !price) {
    throw new Error('Name and price are required.');
  }

  await db.product.create({
    data: {
      name,
      description,
      price,
      category: category || 'Drop 01',
      image,
      hoverImage: hoverImage || null,
      sizes,
      // If every size is 0, the product is automatically Sold Out
      inStock: totalStock > 0,
    },
  });

  revalidatePath('/');
  revalidatePath('/admin');
}

export async function updateProduct(productId: string, formData: FormData) {
  await checkAuth();

  if (!productId) {
    throw new Error('Product ID is required.');
  }

  const name = ((formData.get('name') as string) || '').trim();
  const description = (formData.get('description') as string) || '';
  const price = parseFloat(formData.get('price') as string) || 0;
  const category = ((formData.get('category') as string) || '').trim();
  const image = ((formData.get('image') as string) || '').trim();
  const hoverImage = ((formData.get('hoverImage') as string) || '').trim();

  const sizes = parseAdminSizes(formData.get('sizes') as string);
  const totalStock = getTotalStock(sizes);

  if (!name || !price) {
    throw new Error('Name and price are required.');
  }

  await db.product.update({
    where: { id: productId },
    data: {
      name,
      description,
      price,
      category: category || 'Drop 01',
      image,
      hoverImage: hoverImage || null,
      sizes,
      // Restocking any size flips the product back to In Stock
      inStock: totalStock > 0,
    },
  });

  revalidatePath('/');
  revalidatePath(`/product/${productId}`);
  revalidatePath('/admin');
}

export async function getProducts() {
  await checkAuth();

  return await db.product.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export async function toggleStock(productId: string, currentStatus: boolean) {
  await checkAuth();

  // Don't allow "Mark In Stock" when every size is at 0
  if (!currentStatus) {
    const product = await db.product.findUnique({ where: { id: productId } });
    const sizes = parseSizesToMap(product?.sizes);
    if (getTotalStock(sizes) === 0) {
      throw new Error('All sizes are at 0. Add stock to a size first.');
    }
  }

  await db.product.update({
    where: { id: productId },
    data: { inStock: !currentStatus },
  });

  revalidatePath('/');
  revalidatePath(`/product/${productId}`);
  revalidatePath('/admin');
}

export async function deleteProduct(productId: string) {
  await checkAuth();

  await db.product.delete({
    where: { id: productId },
  });

  revalidatePath('/');
  revalidatePath('/admin');
}

// ---------------------------------------------------------------
// SUBSCRIBERS
// ---------------------------------------------------------------

export async function getSubscribers() {
  await checkAuth();

  return await db.newsletterSubscriber.findMany({
    orderBy: { createdAt: 'desc' },
  });
}
