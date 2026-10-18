import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initializes Resend with your API Key
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { name, email, reason, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required.' },
        { status: 400 }
      );
    }

    // Send email to fitbykxg@gmail.com via Resend
    await resend.emails.send({
      from: 'KXG Store <onboarding@resend.dev>', // Or your verified domain email
      to: 'fitbykxg@gmail.com',
      replyTo: email,
      subject: `[New Contact Message] ${reason} - ${name}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #111;">
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Reason:</strong> ${reason}</p>
          <hr style="border: none; border-top: 1px solid #ccc; margin: 20px 0;" />
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap; background: #f4f4f4; padding: 15px; border-radius: 8px;">${message}</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact API Error:', error);
    return NextResponse.json(
      { error: 'Failed to send message. Please try again.' },
      { status: 500 }
    );
  }
}