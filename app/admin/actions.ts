'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

async function checkAuth() {
  const cookieStore = await cookies();
  const auth = cookieStore.get('kxg_admin_auth');
  if (auth?.value !== 'authenticated') {
    throw new Error('Unauthorized access.');
  }
}

export async function verifyAdminPasscode(passcode: string) {
  const envKey = process.env.ADMIN_SECRET_KEY || '314200Bolu';

  if (passcode.trim() === envKey) {
    const cookieStore = await cookies();
    cookieStore.set('kxg_admin_auth', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day session
      path: '/',
    });
    return { success: true };
  }

  return { success: false, error: 'Invalid secret passcode.' };
}

export async function createProduct(formData: FormData) {
  await checkAuth();

  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const price = parseFloat(formData.get('price') as string) || 0;
  const category = formData.get('category') as string;
  const image = formData.get('image') as string;
  const hoverImage = formData.get('hoverImage') as string;

  // Extract and parse size inventory JSON safely
  const rawSizes = formData.get('sizes') as string;
  let parsedSizes = [];
  try {
    const parsed = rawSizes ? JSON.parse(rawSizes) : [];
    parsedSizes = Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    parsedSizes = [];
  }

  // Calculate total stock safely from sizes array
  const totalStock = parsedSizes.reduce(
    (sum: number, item: { stock?: number }) => sum + (Number(item?.stock) || 0),
    0
  );

  if (!name || !price) {
    throw new Error('Name and price are required.');
  }

  await db.product.create({
    data: {
      name,
      description: description || '',
      price,
      category: category || 'Drop 01',
      image: image || '',
      hoverImage: hoverImage || null,
      sizes: parsedSizes,
      inStock: totalStock > 0,
    },
  });

  revalidatePath('/');
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

export async function getSubscribers() {
  await checkAuth();

  return await db.newsletterSubscriber.findMany({
    orderBy: { createdAt: 'desc' },
  });
}