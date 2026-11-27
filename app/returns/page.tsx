export const metadata = {
  title: 'Refunds & Returns | KXG Store',
};

export default function ReturnsPage() {
  return (
    <main className="min-h-screen bg-[#F5EED8] text-[#2C1509] px-6 py-24">
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-3xl sm:text-4xl font-black tracking-wider uppercase text-[#2C1509]">
          Refunds &amp; Returns
        </h1>

        <div className="space-y-6 text-[#2C1509]/85 font-mono text-sm leading-relaxed border-t border-[#2C1509]/20 pt-8">
          <div>
            <h2 className="text-[#2C1509] font-bold text-base uppercase tracking-widest mb-2">
              Sales Policy
            </h2>
            <p>
              All sales are final and non-refundable.
            </p>
          </div>

          <div>
            <h2 className="text-[#2C1509] font-bold text-base uppercase tracking-widest mb-2">
              Damaged Items &amp; Exceptions
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
