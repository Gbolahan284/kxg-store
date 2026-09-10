'use client';

import React from 'react';
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

    initializePayment({
      onSuccess: (reference: any) => {
        alert('Payment successful! Reference: ' + reference.reference);
        if (clearCart) clearCart();
        window.location.href = '/';
      },
      onClose: () => console.log('Payment modal closed'),
    });
  };

  return (
    <button
      type="button"
      onClick={handlePayNow}
      className="w-full py-4 bg-black text-white font-bold rounded-md hover:bg-neutral-800 transition cursor-pointer"
    >
      Pay now
    </button>
  );
}