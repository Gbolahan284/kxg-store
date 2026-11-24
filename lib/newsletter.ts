import { Prisma } from '@/app/generated/prisma/client';
import { db } from '@/lib/db';
import { Resend } from 'resend';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEFAULT_FROM_EMAIL = 'KXG <hello@fitbykxg.com>';
const WELCOME_TEMPLATE_ID =
  process.env.RESEND_WELCOME_TEMPLATE_ID || '85462a57-be26-4431-b087-7d7f6925d163';

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
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || DEFAULT_FROM_EMAIL,
      to: [cleanEmail],
      replyTo: 'fitbykxg@gmail.com',
      template: {
        id: WELCOME_TEMPLATE_ID,
      },
    });

    if (error) {
      console.error('Resend template send error:', JSON.stringify(error, null, 2));
      return {
        status: 'subscribed',
        message: `You are subscribed, but we could not send your welcome email (${error.message}).`,
        welcomeEmailSent: false,
      };
    }

    console.log('Resend welcome email queued:', data);
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
    message: "YOU'RE OFFICIALLY KXG. Check your inbox for our welcome email.",
    welcomeEmailSent: true,
  };
}