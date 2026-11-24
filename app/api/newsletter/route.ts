import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { subscribeToNewsletter } from '@/lib/newsletter';

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  if (
    typeof body !== 'object' ||
    body === null ||
    !('email' in body) ||
    typeof body.email !== 'string'
  ) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  }

  const result = await subscribeToNewsletter(body.email);
  if (result.status === 'invalid') {
    return NextResponse.json({ error: result.message }, { status: 400 });
  }
  if (result.status === 'failed') {
    return NextResponse.json({ error: result.message }, { status: 500 });
  }

  return NextResponse.json(
    { message: result.message, welcomeEmailSent: result.status === 'subscribed' && result.welcomeEmailSent },
    { status: result.status === 'subscribed' ? 201 : 200 },
  );
}

export async function GET() {
  const cookieStore = await cookies();
  if (cookieStore.get('kxg_admin_auth')?.value !== 'authenticated') {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const subscribers = await db.newsletterSubscriber.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ subscribers });
  } catch (error) {
    console.error('Failed to load newsletter subscribers:', error);
    return NextResponse.json(
      { error: 'Failed to load subscribers.' },
      { status: 500 },
    );
  }
}
