import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { Prisma } from '../../generated/prisma/client';
import { db } from '@/lib/db';

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

  const email = body.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  }

  try {
    const subscriber = await db.newsletterSubscriber.create({
      data: { email },
    });

    return NextResponse.json(
      { message: 'Subscribed successfully.', subscriber },
      { status: 201 },
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return NextResponse.json({ message: 'You are already subscribed.' });
    }

    console.error('Newsletter subscription failed:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe. Please try again later.' },
      { status: 500 },
    );
  }
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
