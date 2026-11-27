export const metadata = {
  title: 'Shipping Information | KXG Store',
};

export default function ShippingPage() {
  return (
    <main className="min-h-screen bg-[#F5EED8] text-[#2C1509] px-6 py-24">
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-3xl sm:text-4xl font-black tracking-wider uppercase text-[#2C1509]">
          Shipping Information
        </h1>

        <div className="space-y-6 text-[#2C1509]/85 font-mono text-sm leading-relaxed border-t border-[#2C1509]/20 pt-8">
          <div>
            <h2 className="text-[#2C1509] font-bold text-base uppercase tracking-widest mb-2">
              Delivery Timelines
            </h2>
            <p>
              Shipping of products may vary from 12 to 15 business days depending on the product and your location.
            </p>
          </div>

          <div>
            <h2 className="text-[#2C1509] font-bold text-base uppercase tracking-widest mb-2">
              Customs &amp; Import Duties
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
