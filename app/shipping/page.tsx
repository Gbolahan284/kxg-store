export const metadata = {
  title: 'Shipping Information | KXG Store',
};

export default function ShippingPage() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-24">
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-3xl sm:text-4xl font-black tracking-wider uppercase">
          Shipping Information
        </h1>

        <div className="space-y-6 text-neutral-300 font-mono text-sm leading-relaxed border-t border-neutral-800 pt-8">
          <div>
            <h2 className="text-white font-bold text-base uppercase tracking-widest mb-2">
              Delivery Timelines
            </h2>
            <p>
              Shipping of products may vary from 12 to 15 business days depending on the product and your location.
            </p>
          </div>

          <div>
            <h2 className="text-white font-bold text-base uppercase tracking-widest mb-2">
              Customs & Import Duties
            </h2>
            <p>
              All customers outside Nigeria are responsible for any custom fees, duties, or taxes that may be charged by their country for import.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}