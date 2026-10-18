export default function ReturnsPage() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-24">
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-3xl sm:text-4xl font-black tracking-wider uppercase">
          Refunds & Returns
        </h1>

        <div className="space-y-6 text-neutral-300 font-mono text-sm leading-relaxed border-t border-neutral-800 pt-8">
          <div>
            <h2 className="text-white font-bold text-base uppercase tracking-widest mb-2">
              Sales Policy
            </h2>
            <p>
              All sales are final and non-refundable.
            </p>
          </div>

          <div>
            <h2 className="text-white font-bold text-base uppercase tracking-widest mb-2">
              Damaged Items & Exceptions
            </h2>
            <p>
              We will happily issue a refund or exchange if your item arrives damaged. Please inspect your order upon delivery and contact us immediately if there are any issues.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}