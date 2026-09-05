import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, firstName, lastName, phone, amount, items = [], metadata = {} } = body;

    // 1. Format the items array into a clear string for the Paystack dashboard display
    const formattedItemsString = items.length > 0
      ? items.map((item: any) => `${item.name || 'Product'} (${item.size ? `Size: ${item.size}` : 'No Size'}) x${item.quantity || 1}`).join(', ')
      : 'No items recorded';

    // 2. Ensure custom_fields exists and update or attach the 'Ordered Items & Sizes' field
    const existingCustomFields = metadata.custom_fields || [];
    
    // Check if ordered_items field is already in custom_fields; if not, add it
    const hasOrderedItemsField = existingCustomFields.some(
      (field: any) => field.variable_name === 'ordered_items'
    );

    const updatedCustomFields = hasOrderedItemsField
      ? existingCustomFields.map((field: any) => 
          field.variable_name === 'ordered_items' 
            ? { ...field, value: formattedItemsString }
            : field
        )
      : [
          ...existingCustomFields,
          {
            display_name: 'Ordered Items & Sizes',
            variable_name: 'ordered_items',
            value: formattedItemsString,
          },
        ];

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        amount: amount,
        first_name: firstName,
        last_name: lastName,
        phone: phone,
        metadata: {
          ...metadata,
          custom_fields: updatedCustomFields, // Pass custom_fields back to Paystack
          cartItems: items.map((item: any) => ({
            name: item.name,
            size: item.size || 'N/A',
            quantity: item.quantity,
            price: item.price,
          })),
        },
      }),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Paystack initialization error:', error);
    return NextResponse.json({ error: 'Failed to initialize payment' }, { status: 500 });
  }
}