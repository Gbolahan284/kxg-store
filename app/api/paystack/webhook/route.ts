import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { sendVerifiedOrderConfirmation } from '@/lib/order-confirmation';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  const signature = request.headers.get('x-paystack-signature');
  if (!secret || !signature) {
    return NextResponse.json({ error: 'Invalid webhook signature.' }, { status: 401 });
  }

  const rawBody = await request.text();
  const expected = createHmac('sha512', secret).update(rawBody).digest('hex');
  const expectedBytes = Buffer.from(expected);
  const signatureBytes = Buffer.from(signature);
  if (
    expectedBytes.length !== signatureBytes.length ||
    !timingSafeEqual(expectedBytes, signatureBytes)
  ) {
    return NextResponse.json({ error: 'Invalid webhook signature.' }, { status: 401 });
  }

  let event: unknown;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid webhook payload.' }, { status: 400 });
  }

  if (
    typeof event !== 'object' ||
    event === null ||
    !('event' in event) ||
    event.event !== 'charge.success'
  ) {
    return NextResponse.json({ received: true });
  }

  if (
    !('data' in event) ||
    typeof event.data !== 'object' ||
    event.data === null ||
    !('reference' in event.data) ||
    typeof event.data.reference !== 'string' ||
    !/^[A-Za-z0-9._-]{1,100}$/.test(event.data.reference)
  ) {
    return NextResponse.json({ error: 'Invalid transaction reference.' }, { status: 400 });
  }

  const result = await sendVerifiedOrderConfirmation(event.data.reference);
  if (result.status === 'failed') {
    return NextResponse.json({ error: result.reason }, { status: 500 });
  }
  if (result.status === 'invalid') {
    return NextResponse.json({ error: 'Transaction was not verified as successful.' }, { status: 400 });
  }

  if (result.status === 'refund-pending') {
    return NextResponse.json({ received: true, refundPending: true });
  }

  return NextResponse.json({ received: true });
}
