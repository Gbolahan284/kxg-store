'use server';

import { db } from '../../lib/db';
import { Resend } from 'resend';

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY);

export async function subscribeToNewsletter(email: string) {
  if (!email || !email.includes('@')) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  const cleanEmail = email.toLowerCase().trim();

  try {
    // 1. Save subscriber into your database via Prisma
    const subscriber = await db.newsletterSubscriber.create({
      data: {
        email: cleanEmail,
      },
    });

    // 2. Trigger email notification via Resend
    await resend.emails.send({
      from: 'KXG Support <onboarding@resend.dev>', // Or your verified custom domain
      to: ['fitbykxg@gmail.com'], // Receives subscriber alert in your inbox
      replyTo: cleanEmail,
      subject: `🔥 New Newsletter Subscriber: ${cleanEmail}`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #000; color: #fff; padding: 24px; border-radius: 8px;">
          <h2 style="text-transform: uppercase; letter-spacing: 1px; color: #fff; border-bottom: 1px solid #333; padding-bottom: 10px;">
            New KXG Subscriber Joined
          </h2>
          <p style="margin-top: 16px;">A new user has subscribed to the KXG mailing list:</p>
          <div style="background-color: #111; padding: 16px; border-radius: 6px; border: 1px solid #222; margin-top: 12px;">
            <p style="margin: 0; color: #fff; font-weight: bold; font-size: 16px;">${cleanEmail}</p>
          </div>
          <p style="color: #888; font-size: 12px; margin-top: 16px;">Saved in Prisma Database & Resend Logs.</p>
        </div>
      `,
    });

    return { success: true, subscriber };
  } catch (error: any) {
    // Handle duplicate subscriber error in Prisma (P2002)
    if (error?.code === 'P2002') {
      return { success: true, message: 'You are already subscribed!' };
    }
    console.error('Newsletter Server Action Error:', error);
    return { success: false, error: 'Failed to subscribe. Please try again later.' };
  }
}