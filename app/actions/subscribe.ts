'use server';

import { db } from '@/lib/db';

export async function subscribeToNewsletter(email: string) {
  if (!email || !email.includes('@')) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  const cleanEmail = email.toLowerCase().trim();

  try {
    const subscriber = await db.subscriber.create({
      data: { email: cleanEmail },
    });
    return { success: true, subscriber };
  } catch (error: any) {
    // P2002 is Prisma's code for unique constraint failure (email already exists)
    if (error?.code === 'P2002') {
      return { success: true, message: 'You are already subscribed!' };
    }
    console.error('Newsletter Server Action Error:', error);
    return { success: false, error: 'Failed to subscribe. Please try again later.' };
  }
}