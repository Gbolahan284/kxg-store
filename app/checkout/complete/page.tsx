import Link from 'next/link';

interface CheckoutCompletePageProps {
  searchParams: Promise<{
    payment?: string;
    email?: string;
  }>;
}

export default async function CheckoutCompletePage({
  searchParams,
}: CheckoutCompletePageProps) {
  const { payment, email } = await searchParams;
  const confirmed = payment === 'confirmed';
  const unverified = payment === 'unverified';

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="max-w-lg w-full text-center border border-neutral-800 bg-neutral-950 rounded-2xl p-8">
        <h1 className="text-2xl font-black uppercase tracking-wide">
          {confirmed ? 'Thank you for your order' : unverified ? 'Payment not confirmed' : 'Order status'}
        </h1>
        <p className="mt-4 text-sm text-neutral-300">
          {confirmed
            ? email === 'sent'
              ? 'Your payment is confirmed. Your order confirmation email is on its way.'
              : 'Your payment is confirmed, but we could not send the order email. Please contact us with your Paystack payment reference.'
            : unverified
              ? 'We could not confirm this payment. Please check your Paystack transaction before trying again.'
              : 'If your payment completed, check your email for an order confirmation.'}
        </p>
        <Link
          href="/"
          className="inline-block mt-8 bg-white text-black px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-neutral-200"
        >
          Return to store
        </Link>
      </div>
    </main>
  );
}
