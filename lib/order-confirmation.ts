import { Resend } from 'resend';

type JsonRecord = Record<string, unknown>;

type ConfirmationResult =
  | { status: 'sent' }
  | { status: 'invalid' }
  | { status: 'failed'; reason: string };

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return entities[character];
  });
}

function formatOrderedItems(metadata: unknown): string {
  if (!isRecord(metadata) || !Array.isArray(metadata.cartItems)) {
    return '<li>Your KXG order</li>';
  }

  const rows = metadata.cartItems.flatMap((item): string[] => {
    if (!isRecord(item) || typeof item.name !== 'string') return [];
    const size = typeof item.size === 'string' ? ` · Size ${item.size}` : '';
    const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
    return [`<li>${escapeHtml(item.name)}${escapeHtml(size)} × ${quantity}</li>`];
  });

  return rows.length ? rows.join('') : '<li>Your KXG order</li>';
}

export async function sendVerifiedOrderConfirmation(reference: string): Promise<ConfirmationResult> {
  const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
  const resendApiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!paystackSecret || !resendApiKey || !from) {
    console.error('Order confirmation requires PAYSTACK_SECRET_KEY, RESEND_API_KEY, and RESEND_FROM_EMAIL.');
    return { status: 'failed', reason: 'Email service is not configured.' };
  }

  let verificationResponse: Response;
  try {
    verificationResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: { Authorization: `Bearer ${paystackSecret}` },
        cache: 'no-store',
      }
    );
  } catch (error) {
    console.error('Could not verify Paystack transaction:', error);
    return { status: 'failed', reason: 'Could not verify payment.' };
  }

  if (!verificationResponse.ok) {
    console.error('Paystack transaction verification returned HTTP', verificationResponse.status);
    return { status: 'failed', reason: 'Could not verify payment.' };
  }

  let verification: unknown;
  try {
    verification = await verificationResponse.json();
  } catch (error) {
    console.error('Paystack returned invalid transaction verification data:', error);
    return { status: 'failed', reason: 'Could not verify payment.' };
  }

  if (!isRecord(verification) || verification.status !== true || !isRecord(verification.data)) {
    return { status: 'invalid' };
  }

  const data = verification.data;
  const transactionAmount = data.amount;
  const customer = data.customer;
  if (
    data.status !== 'success' ||
    data.reference !== reference ||
    data.currency !== 'NGN' ||
    typeof transactionAmount !== 'number' ||
    transactionAmount <= 0 ||
    !isRecord(customer) ||
    typeof customer.email !== 'string'
  ) {
    return { status: 'invalid' };
  }

  const metadata = data.metadata;
  const customFields =
    isRecord(metadata) && Array.isArray(metadata.custom_fields) ? metadata.custom_fields : [];
  const customerField = customFields.find(
    (field) => isRecord(field) && field.variable_name === 'customer_name'
  );
  const customerName =
    isRecord(customerField) && typeof customerField.value === 'string'
      ? customerField.value
      : 'KXG customer';
  const amount = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
  }).format(transactionAmount / 100);
  const safeName = escapeHtml(customerName);
  const safeReference = escapeHtml(reference);

  try {
    const resend = new Resend(resendApiKey);
    const { error } = await resend.emails.send(
      {
        from,
        to: [customer.email],
        subject: 'Your KXG order is confirmed',
        html: `
          <div style="font-family: Arial, sans-serif; background: #000; color: #fff; padding: 32px; border-radius: 12px;">
            <p style="color: #aaa; font-size: 12px; letter-spacing: 3px; text-transform: uppercase;">KXG</p>
            <h1 style="font-size: 24px; text-transform: uppercase;">Order confirmed</h1>
            <p style="color: #ddd; line-height: 1.6;">Hi ${safeName}, your payment was successful. Thank you for shopping with KXG.</p>
            <p style="color: #ddd;"><strong>Order reference:</strong> ${safeReference}</p>
            <p style="color: #ddd;"><strong>Total paid:</strong> ${amount}</p>
            <h2 style="font-size: 14px; text-transform: uppercase;">Items</h2>
            <ul style="color: #ddd; line-height: 1.8;">${formatOrderedItems(metadata)}</ul>
            <p style="color: #aaa; font-size: 13px;">Always stay fly, never follow.</p>
          </div>
        `,
      },
      { headers: { 'Idempotency-Key': `kxg-order-${reference}` } }
    );

    if (error) {
      console.error('Resend could not send the order confirmation:', error);
      return { status: 'failed', reason: 'Email provider rejected the message.' };
    }
  } catch (error) {
    console.error('Order confirmation email failed:', error);
    return { status: 'failed', reason: 'Email could not be sent.' };
  }

  return { status: 'sent' };
}
