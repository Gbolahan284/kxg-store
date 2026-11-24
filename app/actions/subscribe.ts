'use server';

import { subscribeToNewsletter as subscribe } from '@/lib/newsletter';

export async function subscribeToNewsletter(email: string) {
  const result = await subscribe(email);
  if (result.status === 'already-subscribed') {
    return { success: false, isAlreadySubscribed: true, message: result.message };
  }
  if (result.status !== 'subscribed') {
    return { success: false, error: result.message };
  }

  return {
    success: true,
    message: result.message,
    welcomeEmailSent: result.welcomeEmailSent,
  };
}