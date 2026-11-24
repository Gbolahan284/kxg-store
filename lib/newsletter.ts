import { Prisma } from '@/app/generated/prisma/client';
import { db } from '@/lib/db';
import { Resend } from 'resend';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEFAULT_FROM_EMAIL = 'KXG <onboarding@resend.dev>';

export type NewsletterSubscriptionResult =
  | { status: 'invalid'; message: string }
  | { status: 'already-subscribed'; message: string }
  | { status: 'failed'; message: string }
  | { status: 'subscribed'; message: string; welcomeEmailSent: boolean };

export async function subscribeToNewsletter(email: string): Promise<NewsletterSubscriptionResult> {
  const cleanEmail = email.trim().toLowerCase();
  if (!EMAIL_PATTERN.test(cleanEmail)) {
    return { status: 'invalid', message: 'Please enter a valid email address.' };
  }

  try {
    await db.newsletterSubscriber.create({ data: { email: cleanEmail } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { status: 'already-subscribed', message: 'You are already subscribed.' };
    }

    console.error('Failed to save newsletter subscriber:', error);
    return { status: 'failed', message: 'Failed to subscribe. Please try again later.' };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('Welcome email was not sent: RESEND_API_KEY is not configured.');
    return {
      status: 'subscribed',
      message: 'You are subscribed, but we could not send your welcome email. Please try again later.',
      welcomeEmailSent: false,
    };
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || DEFAULT_FROM_EMAIL,
      to: [cleanEmail],
      subject: 'Welcome to the KXG Inner Circle',
      html: `
        <div style="font-family: Arial, sans-serif; background: #000; color: #fff; padding: 32px; border-radius: 12px;">
          <p style="color: #aaa; font-size: 12px; letter-spacing: 3px; text-transform: uppercase;">KXG</p>
          <h1 style="font-size: 24px; text-transform: uppercase;">Welcome to the Inner Circle.</h1>
          <p style="color: #ddd; line-height: 1.6;">You’re on the list. We’ll email you about new drops, early access, and exclusive releases.</p>
          <p style="color: #aaa; font-size: 13px;">Always stay fly, never follow.</p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend could not deliver the newsletter welcome email:', error);
      return {
        status: 'subscribed',
        message:
          'You are subscribed, but we could not send your welcome email. Check that your Resend sender address uses a verified domain.',
        welcomeEmailSent: false,
      };
    }
  } catch (error) {
    console.error('Failed to send newsletter welcome email:', error);
    return {
      status: 'subscribed',
      message:
        'You are subscribed, but we could not send your welcome email. Check your Resend configuration and try again later.',
      welcomeEmailSent: false,
    };
  }

  return {
    status: 'subscribed',
    message: 'Welcome to the KXG Inner Circle! Check your inbox for our welcome email.',
    welcomeEmailSent: true,
  };
}
