'use server';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export async function createPaystackCheckout(items: CartItem[], userEmail?: string) {
  if (!items || items.length === 0) {
    return { success: false, error: 'Cart is empty.' };
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  if (!secretKey) {
    return { success: false, error: 'Paystack secret key is missing in environment variables.' };
  }

  // Use provided email or auto-generate a guest email for Paystack
  const emailToUse = userEmail && userEmail.includes('@')
    ? userEmail.toLowerCase().trim()
    : `customer_${Date.now()}@kxgstore.com`;

  // Paystack expects amount in lowest currency unit (kobo/cents -> multiply by 100)
  const totalAmount = Math.round(
    items.reduce((acc, item) => acc + item.price * item.quantity, 0) * 100
  );

  // Fallback to localhost if no environment base URL is specified
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  try {
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: emailToUse,
        amount: totalAmount,
        callback_url: `${baseUrl}/cart`,
        metadata: {
          cartItems: items,
          isGuestCheckout: !userEmail,
        },
      }),
    });

    const data = await response.json();

    if (!data.status) {
      return { success: false, error: data.message || 'Payment initialization failed.' };
    }

    return { success: true, url: data.data.authorization_url };
  } catch (error) {
    console.error('Paystack Initialization Error:', error);
    return { success: false, error: 'Failed to connect to payment gateway.' };
  }
}