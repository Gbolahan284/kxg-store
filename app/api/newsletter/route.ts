import { NextResponse } from 'next/server';

// Temporary list to save emails in memory
let subscribers: { email: string; date: string }[] = [];

// 1. THIS SAVES THE EMAIL WHEN SOMEONE SUBSCRIBES
export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Don't add duplicate emails
    if (!subscribers.some((sub) => sub.email === email)) {
      subscribers.push({
        email,
        date: new Date().toLocaleDateString(),
      });
    }

    return NextResponse.json({ message: 'Subscribed successfully', subscribers });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 2. THIS SHOWS THE EMAILS TO YOUR ADMIN PAGE
export async function GET() {
  return NextResponse.json({ subscribers });
}