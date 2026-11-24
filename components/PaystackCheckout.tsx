'use client';

import React, { useState } from 'react';
import { usePaystackPayment } from 'react-paystack';

interface PaystackCheckoutProps {
  email: string;
  amount: number;
  publicKey: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  clearCart: () => void;
}

export default function PaystackCheckout({
  email,
  amount,
  publicKey,
  firstName,
  lastName,
  address,
  city,
  state,
  phone,
  clearCart,
}: PaystackCheckoutProps) {
  const [loading, setLoading] = useState(false);

  const config = {
    reference: `kxg_${new Date().getTime()}`,
    email: email.trim() || `customer_${Date.now()}@kxgstore.com`,
    amount: Math.round(amount * 100),
    publicKey,
    metadata: {
      custom_fields: [
        { display_name: 'Customer Name', variable_name: 'customer_name', value: `${firstName} ${lastName}` },
        { display_name: 'Shipping Address', variable_name: 'shipping_address', value: `${address}, ${city}, ${state}` },
        { display_name: 'Phone Number', variable_name: 'phone_number', value: phone },
      ],
    },
  };

  const initializePayment = usePaystackPayment(config);

  const handlePayNow = (e: React.FormEvent) => {
    e.preventDefault();

    if (!publicKey) {
      alert('Paystack Public Key is missing or invalid in your .env file.');
      return;
    }

    if (!firstName || !address || !phone) {
      alert('Please fill in all required delivery fields.');
      return;
    }

    setLoading(true);

    initializePayment({
      onSuccess: async (reference: any) => {
        // 1. Fire Meta Pixel Purchase Event
        if (typeof window !== 'undefined' && (window as any).fbq) {
          (window as any).fbq('track', 'Purchase', {
            value: amount,
            currency: 'NGN',
            order_id: reference?.reference || config.reference,
          });
        }

        // 2. Trigger Resend Email API Route
        try {
          await fetch('/api/send-order-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: email.trim() || config.email,
              customerName: `${firstName} ${lastName}`,
              orderId: reference?.reference || config.reference,
              amount,
              address: `${address}, ${city}, ${state}`,
              phone,
            }),
          });
        } catch (err) {
          console.error('Failed to trigger order confirmation email:', err);
        }

        alert('Payment successful! Reference: ' + reference.reference);
        if (clearCart) clearCart();

        // Brief delay ensures requests finish sending before redirect
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      },
      onClose: () => {
        setLoading(false);
        console.log('Payment modal closed');
      },
    });
  };

  return (
    <button
      type="button"
      onClick={handlePayNow}
      disabled={loading}
      className="w-full py-4 bg-black text-white font-bold rounded-md hover:bg-neutral-800 transition cursor-pointer disabled:opacity-50"
    >
      {loading ? 'Processing...' : 'Pay now'}
    </button>
  );
}