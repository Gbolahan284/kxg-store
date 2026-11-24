import { NextResponse } from 'next/server';
import { sendVerifiedOrderConfirmation } from '@/lib/order-confirmation';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const reference = url.searchParams.get('reference') ?? '';
  const completeUrl = new URL('/checkout/complete', request.url);

  if (!/^[A-Za-z0-9._-]{1,100}$/.test(reference)) {
    completeUrl.searchParams.set('payment', 'unverified');
    return NextResponse.redirect(completeUrl);
  }

  const result = await sendVerifiedOrderConfirmation(reference);
  if (result.status === 'sent') {
    completeUrl.searchParams.set('payment', 'confirmed');
    completeUrl.searchParams.set('email', 'sent');
  } else if (result.status === 'invalid') {
    completeUrl.searchParams.set('payment', 'unverified');
  } else {
    console.error('Order confirmation was not sent:', result.reason);
    completeUrl.searchParams.set('payment', 'confirmed');
    completeUrl.searchParams.set('email', 'failed');
  }

  return NextResponse.redirect(completeUrl);
}
