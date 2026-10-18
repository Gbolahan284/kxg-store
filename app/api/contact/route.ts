import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { name, email, reason, message } = await req.json();

    const data = await resend.emails.send({
      from: 'KXG Support <onboarding@resend.dev>',
      to: ['fitbykxg@gmail.com'],
      replyTo: email,
      subject: `New Customer Inquiry (${reason}) - ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #000; color: #fff; padding: 24px; border-radius: 8px;">
          <h2 style="text-transform: uppercase; letter-spacing: 1px; color: #fff; border-bottom: 1px solid #333; padding-bottom: 10px;">
            New KXG Contact Form Submission
          </h2>
          <p style="margin-top: 16px;"><strong>Name:</strong> ${name}</p>
          <p><strong>Customer Email:</strong> ${email}</p>
          <p><strong>Reason:</strong> ${reason}</p>
          
          <div style="background-color: #111; padding: 16px; border-radius: 6px; border: 1px solid #222; margin-top: 20px;">
            <p style="margin: 0; color: #888; font-size: 12px; text-transform: uppercase; font-weight: bold;">Message:</p>
            <p style="margin-top: 8px; color: #eee; white-space: pre-line;">${message}</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Resend API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
