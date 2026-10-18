'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';

// All 36 States in Nigeria + Federal Capital Territory (Abuja)
const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT - Abuja', 'Gombe',
  'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos',
  'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto',
  'Taraba', 'Yobe', 'Zamfara',
];

function CheckoutContent() {
  const searchParams = useSearchParams();
  const { cart = [], subtotal: globalSubtotal = 0 } = useCart() as any;

  // Check if this is a single "Buy It Now" checkout
  const isBuyNow = searchParams.get('buyNow') === 'true';

  // Construct items list based on checkout mode
  const checkoutItems: any[] = isBuyNow
    ? [
        {
          id: searchParams.get('id') || 'buy-now-item',
          name: searchParams.get('name') || 'Product',
          price: parseFloat(searchParams.get('price') || '0'),
          size: searchParams.get('size') || '',
          image: searchParams.get('image') || '',
          quantity: 1,
        },
      ]
    : cart;

  // Calculate dynamic subtotal
  const subtotal = isBuyNow
    ? checkoutItems.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0)
    : globalSubtotal;

  // Form State
  const [email, setEmail] = useState('');
  const [saveInfo, setSaveInfo] = useState(false);
  const [country, setCountry] = useState('Nigeria');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [apartment, setApartment] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Lagos');
  const [postalCode, setPostalCode] = useState('');
  const [phone, setPhone] = useState('');
  const [shippingMethod, setShippingMethod] = useState<'ISLAND' | 'MAINLAND'>('ISLAND');
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);

  // Loading & Modal State
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeModal, setActiveModal] = useState<'refund' | 'shipping' | 'privacy' | null>(null);

  // Tax & Shipping Calculations
  const taxRate = 0.075; // 7.5% VAT
  const estimatedTax = Math.round(subtotal * taxRate);
  const shippingCost = shippingMethod === 'ISLAND' ? 8000 : 5000;
  const totalAmount = subtotal + shippingCost + estimatedTax;

  const isFormValid = Boolean(
    email.trim() &&
    firstName.trim() &&
    address.trim() &&
    city.trim() &&
    phone.trim()
  );

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      alert('Please fill in all required delivery fields (Email, First Name, Address, City, Phone).');
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
          amount: totalAmount * 100, // Paystack requires amount in Kobo
          items: checkoutItems, // Passes product names, prices & sizes (e.g. XL)
          metadata: {
            custom_fields: [
              {
                display_name: 'Customer Name',
                variable_name: 'customer_name',
                value: `${firstName.trim()} ${lastName.trim()}`.trim(),
              },
              {
                display_name: 'Phone Number',
                variable_name: 'phone_number',
                value: phone.trim(),
              },
              {
                display_name: 'Shipping Address',
                variable_name: 'shipping_address',
                value: `${address.trim()}${apartment.trim() ? `, ${apartment.trim()}` : ''}, ${city.trim()}, ${state}, ${country}`,
              },
              {
                display_name: 'Ordered Items & Sizes',
                variable_name: 'ordered_items',
                value: checkoutItems.map((item) => `${item.name} (Size: ${item.size || 'N/A'}) x${item.quantity}`).join(', '),
              },
            ],
          },
        }),
      });

      const data = await response.json();

      if (data.status && data.data?.authorization_url) {
        window.location.href = data.data.authorization_url;
      } else {
        alert(data.error || 'Payment initialization failed. Please try again.');
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Payment initialization error:', error);
      alert('An unexpected error occurred. Please check your connection.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col md:flex-row">
      {/* Left Column - Form */}
      <div className="w-full md:w-7/12 p-6 md:p-16 space-y-8">
        <form onSubmit={handlePayment} className="max-w-xl mx-auto space-y-6">
          {/* Contact Section */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">Contact</h2>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3.5 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black"
              />
              <div className="group absolute right-3 top-3.5 cursor-pointer text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block w-48 bg-black text-white text-[11px] p-2 rounded shadow-lg text-center z-10">
                  Used for your order confirmation and cart reminders
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Section */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">Delivery</h2>
            
            {/* Country Selector */}
            <div className="relative border border-gray-300 rounded-lg p-2.5 bg-white">
              <label className="block text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Country/Region</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-transparent text-sm focus:outline-none font-medium text-gray-800 cursor-pointer"
              >
                <option value="Nigeria">Nigeria</option>
                <option value="Ghana">Ghana</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="United States">United States</option>
              </select>
            </div>

            {/* Name Inputs */}
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                required
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full p-3.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black"
              />
              <input
                type="text"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full p-3.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            {/* Address Inputs */}
            <input
              type="text"
              required
              placeholder="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-3.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black"
            />

            <input
              type="text"
              placeholder="Apartment, suite, etc. (optional)"
              value={apartment}
              onChange={(e) => setApartment(e.target.value)}
              className="w-full p-3.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black"
            />

            {/* City, State, Postal Code Grid */}
            <div className="grid grid-cols-3 gap-3">
              <input
                type="text"
                required
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full p-3.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black"
              />
              <div className="relative border border-gray-300 rounded-lg p-2.5 bg-white">
                <label className="block text-[10px] text-gray-500 uppercase tracking-wider font-semibold">State</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full bg-transparent text-sm focus:outline-none font-medium text-gray-800 cursor-pointer"
                >
                  {NIGERIAN_STATES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
              <input
                type="text"
                placeholder="Postal code (optional)"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="w-full p-3.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            {/* Phone */}
            <div className="relative">
              <input
                type="tel"
                required
                placeholder="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-3.5 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black"
              />
              <div className="group absolute right-3 top-3.5 cursor-pointer text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block w-44 bg-black text-white text-[11px] p-2 rounded shadow-lg text-center z-10">
                  In case we need to contact you regarding delivery
                </div>
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={saveInfo}
                onChange={(e) => setSaveInfo(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 accent-black"
              />
              Save this information for next time
            </label>
          </div>

          {/* Shipping Method Section */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Shipping method</h2>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <label
                className={`flex justify-between items-center p-4 border-b border-gray-200 cursor-pointer ${
                  shippingMethod === 'ISLAND' ? 'bg-blue-50/40 border-l-4 border-l-blue-600' : 'bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="shipping"
                    checked={shippingMethod === 'ISLAND'}
                    onChange={() => setShippingMethod('ISLAND')}
                    className="w-4 h-4 text-blue-600 accent-blue-600"
                  />
                  <span className="font-semibold text-xs tracking-wider uppercase">ISLAND/OTHER STATES</span>
                </div>
                <span className="font-bold text-sm">₦8,000.00</span>
              </label>

              <label
                className={`flex justify-between items-center p-4 cursor-pointer ${
                  shippingMethod === 'MAINLAND' ? 'bg-blue-50/40 border-l-4 border-l-blue-600' : 'bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="shipping"
                    checked={shippingMethod === 'MAINLAND'}
                    onChange={() => setShippingMethod('MAINLAND')}
                    className="w-4 h-4 text-blue-600 accent-blue-600"
                  />
                  <span className="font-semibold text-xs tracking-wider uppercase">MAINLAND</span>
                </div>
                <span className="font-bold text-sm">₦5,000.00</span>
              </label>
            </div>
          </div>

          {/* Payment Section */}
          <div>
            <h2 className="text-xl font-bold text-gray-900">Payment</h2>
            <p className="text-xs text-gray-500 mb-3">All transactions are secure and encrypted.</p>

            <div className="border border-blue-500 rounded-lg overflow-hidden bg-blue-50/20">
              <div className="flex items-center justify-between p-4 bg-blue-50/30 border-b border-gray-200">
                <span className="font-semibold text-sm">Paystack</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] bg-red-600 text-white font-bold px-1.5 py-0.5 rounded">Mastercard</span>
                  <span className="text-[10px] bg-blue-700 text-white font-bold px-1.5 py-0.5 rounded">VISA</span>
                  <span className="text-[10px] bg-yellow-500 text-black font-bold px-1.5 py-0.5 rounded">Verve</span>
                  <span className="text-[10px] text-gray-500 font-medium pl-1">+5</span>
                </div>
              </div>
              <div className="p-8 text-center text-xs text-gray-600 bg-gray-50/50">
                You&apos;ll be redirected to Paystack to complete your purchase.
              </div>
            </div>
          </div>

          {/* Billing Address Section */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Billing address</h2>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <label
                className={`flex items-center gap-3 p-4 border-b border-gray-200 cursor-pointer ${
                  billingSameAsShipping ? 'bg-blue-50/40 border-l-4 border-l-blue-600' : 'bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="billing"
                  checked={billingSameAsShipping}
                  onChange={() => setBillingSameAsShipping(true)}
                  className="w-4 h-4 accent-blue-600"
                />
                <span className="text-sm font-medium">Same as shipping address</span>
              </label>

              <label
                className={`flex items-center gap-3 p-4 cursor-pointer ${
                  !billingSameAsShipping ? 'bg-blue-50/40 border-l-4 border-l-blue-600' : 'bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="billing"
                  checked={!billingSameAsShipping}
                  onChange={() => setBillingSameAsShipping(false)}
                  className="w-4 h-4 accent-blue-600"
                />
                <span className="text-sm font-medium">Use a different billing address</span>
              </label>
            </div>
          </div>

          {/* Pay Button */}
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-4 bg-black text-white font-bold rounded-md hover:bg-neutral-800 transition text-center cursor-pointer block text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Processing Payment...' : 'Pay now'}
          </button>

          {/* Footer Policy Links */}
          <div className="pt-6 border-t border-gray-200 flex gap-4 text-xs text-blue-600 underline">
            <button
              type="button"
              onClick={() => setActiveModal('refund')}
              className="hover:text-blue-800 cursor-pointer"
            >
              Refund policy
            </button>
            <button
              type="button"
              onClick={() => setActiveModal('shipping')}
              className="hover:text-blue-800 cursor-pointer"
            >
              Shipping
            </button>
            <button
              type="button"
              onClick={() => setActiveModal('privacy')}
              className="hover:text-blue-800 cursor-pointer"
            >
              Privacy policy
            </button>
          </div>
        </form>
      </div>

      {/* Right Column - Cart Summary */}
      <div className="w-full md:w-5/12 bg-neutral-50 p-6 md:p-16 border-t md:border-t-0 md:border-l border-gray-200">
        <div className="max-w-md mx-auto space-y-6">
          {checkoutItems.map((item: any, idx: number) => (
            <div key={`${item.id || idx}-${item.size || idx}`} className="flex items-center justify-between gap-4">
              <div className="relative flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-200 rounded-md border overflow-hidden relative flex-shrink-0">
                  {item.image && (
                    <img src={item.image} alt={item.name || 'Product'} className="w-full h-full object-cover" />
                  )}
                  <span className="absolute -top-2 -right-2 bg-neutral-700 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {item.quantity}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-sm uppercase">{item.name}</h3>
                  {item.size && <p className="text-xs text-gray-500">Size: {item.size}</p>}
                </div>
              </div>
              <span className="font-semibold text-sm">
                ₦{(item.price * item.quantity).toLocaleString()}
              </span>
            </div>
          ))}

          <div className="border-t border-gray-200 pt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">₦{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span className="font-medium">₦{shippingCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Estimated taxes</span>
              <span className="font-medium">₦{estimatedTax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-200">
              <span>Total</span>
              <span>NGN ₦{totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Policy Modals */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 md:p-8 relative shadow-2xl max-h-[85vh] flex flex-col">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-6 right-6 text-gray-400 hover:text-black text-xl font-light cursor-pointer z-10"
            >
              ✕
            </button>

            {activeModal === 'refund' && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-black">Refund policy</h2>
                <div className="space-y-4 text-sm text-gray-700 pt-2">
                  <p className="font-bold text-black">No Refund Policy</p>
                  <p>All payments made for our products are non-refundable.</p>
                  <p>
                    Exceptions: A Refund or an exchange will only be issued if product is damaged upon arrival.
                  </p>
                </div>
              </div>
            )}

            {activeModal === 'shipping' && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-black">SHIPPING</h2>
                <div className="space-y-4 text-sm text-gray-700 pt-2">
                  <p>
                    Shipping of products may vary from 12 to 15 Business days depending on the product and location.
                  </p>
                  <p>
                    All customers outside Nigeria are responsible for Custom Fees/Duties that may be charged by their country for import.
                  </p>
                </div>
              </div>
            )}

            {activeModal === 'privacy' && (
              <div className="flex flex-col h-full overflow-hidden">
                <h2 className="text-2xl font-bold text-black mb-4 flex-shrink-0">Privacy policy</h2>
                <div className="overflow-y-auto space-y-4 text-xs md:text-sm text-gray-700 pr-2 pt-2 leading-relaxed">
                  <p>
                    KXG operates this store and website, including all related information, content, features, tools, products and services, in order to provide you, the customer, with a curated shopping experience (the &quot;Services&quot;).
                  </p>

                  <h3 className="font-bold text-black text-sm pt-2">Personal Information We Collect or Process</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Contact details:</strong> including your name, address, billing address, shipping address, phone number, and email address.</li>
                    <li><strong>Financial information:</strong> including transaction details, payment confirmation, and standard payment card data.</li>
                    <li><strong>Transaction information:</strong> including items viewed, placed in cart, or purchased.</li>
                  </ul>

                  <h3 className="font-bold text-black text-sm pt-2">How We Use Your Personal Information</h3>
                  <p>
                    We use your personal information to process orders, facilitate fulfillment, send order updates, communicate regarding purchases, and ensure account security.
                  </p>

                  <h3 className="font-bold text-black text-sm pt-2">Contact</h3>
                  <p>
                    Should you have any questions or wish to exercise your rights, please call{' '}
                    <a href="tel:07067913025" className="font-bold hover:underline">
                      07067913025
                    </a>{' '}
                    or email us at{' '}
                    <a href="mailto:FITBYKXG@GMAIL.COM" className="font-bold hover:underline">
                      FITBYKXG@GMAIL.COM
                    </a>.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white text-black p-8 text-center">Loading checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}