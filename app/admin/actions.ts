'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

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
  const cookieStore = await cookies();
  const auth = cookieStore.get('kxg_admin_auth');

  if (auth?.value !== 'authenticated') {
    throw new Error('Unauthorized access. Please log in.');
  }

  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const price = parseFloat(formData.get('price') as string) || 0;
  const category = formData.get('category') as string;
  const image = formData.get('image') as string;
  const hoverImage = formData.get('hoverImage') as string; // Extracted hover image URL

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
      hoverImage: hoverImage || null, // Saved to database
      inStock: true,
    },
  });

  revalidatePath('/', 'page');
  revalidatePath('/admin', 'page');
}

export async function getProducts() {
  const cookieStore = await cookies();
  const auth = cookieStore.get('kxg_admin_auth');

  if (auth?.value !== 'authenticated') {
    throw new Error('Unauthorized access.');
  }

  return await db.product.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export async function toggleStock(productId: string, currentStatus: boolean) {
  const cookieStore = await cookies();
  const auth = cookieStore.get('kxg_admin_auth');

  if (auth?.value !== 'authenticated') {
    throw new Error('Unauthorized access.');
  }

  await db.product.update({
    where: { id: productId },
    data: { inStock: !currentStatus },
  });

  // Revalidate both the root homepage and dynamic product detail pages
  revalidatePath('/', 'page');
  revalidatePath(`/product/${productId}`, 'page');
  revalidatePath('/admin', 'page');
}

export async function deleteProduct(productId: string) {
  const cookieStore = await cookies();
  const auth = cookieStore.get('kxg_admin_auth');

  if (auth?.value !== 'authenticated') {
    throw new Error('Unauthorized access.');
  }

  await db.product.delete({
    where: { id: productId },
  });

  revalidatePath('/', 'page');
  revalidatePath('/admin', 'page');
}

export async function getSubscribers() {
  const cookieStore = await cookies();
  const auth = cookieStore.get('kxg_admin_auth');

  if (auth?.value !== 'authenticated') {
    throw new Error('Unauthorized access.');
  }

  return await db.newsletterSubscriber.findMany({
    orderBy: { createdAt: 'desc' },
  });
}