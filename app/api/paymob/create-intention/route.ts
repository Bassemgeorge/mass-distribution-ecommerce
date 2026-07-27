import { NextResponse } from "next/server";

type CheckoutItem = {
  product: {
    id: string;
    nameEn: string;
    pricePerCarton: number;
  };
  quantity: number;
};

type RequestBody = {
  orderId: string;
  total: number;
  items: CheckoutItem[];
  customer: {
    name: string;
    email?: string;
    phone: string;
    address: string;
    city?: string;
  };
};

const PAYMOB_BASE_URL = "https://accept.paymob.com";

export async function POST(request: Request) {
  try {
    const secretKey = process.env.PAYMOB_SECRET_KEY;
    const publicKey = process.env.PAYMOB_PUBLIC_KEY;
    const cardIntegrationId = process.env.PAYMOB_CARD_INTEGRATION_ID;

    if (!secretKey || !publicKey || !cardIntegrationId) {
      return NextResponse.json(
        { error: "Missing Paymob environment variables." },
        { status: 500 }
      );
    }

    const body = (await request.json()) as RequestBody;

    if (!body.orderId || !body.total || !body.customer?.name || !body.customer?.phone) {
      return NextResponse.json(
        { error: "Missing required checkout data." },
        { status: 400 }
      );
    }

    const [firstName, ...restName] = body.customer.name.trim().split(" ");
    const lastName = restName.join(" ") || firstName || "Customer";

    const amountCents = Math.round(body.total * 100);

    const paymobResponse = await fetch(`${PAYMOB_BASE_URL}/v1/intention/`, {
      method: "POST",
      headers: {
        Authorization: `Token ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amountCents,
        currency: "EGP",
        payment_methods: [Number(cardIntegrationId)],
        items: [
  {
    name: `Mass Distribution Order ${body.orderId}`,
    amount: amountCents,
    description: `Order ${body.orderId}`,
    quantity: 1,
  },
],
        billing_data: {
          first_name: firstName || "Customer",
          last_name: lastName,
          email: body.customer.email || "customer@example.com",
          phone_number: body.customer.phone,
          street: body.customer.address || "NA",
          city: body.customer.city || "Cairo",
          country: "EG",
          state: body.customer.city || "Cairo",
          postal_code: "00000",
        },
        customer: {
          first_name: firstName || "Customer",
          last_name: lastName,
          email: body.customer.email || "customer@example.com",
        },
        extras: {
          supabase_order_id: body.orderId,
        },
        special_reference: `mass-${body.orderId}`,
      }),
    });

    const data = await paymobResponse.json();

    if (!paymobResponse.ok) {
      return NextResponse.json(
        {
          error: "Paymob intention creation failed.",
          details: data,
        },
        { status: paymobResponse.status }
      );
    }

    const clientSecret = data.client_secret || data.cs;

    if (!clientSecret) {
      return NextResponse.json(
        {
          error: "Paymob did not return a client secret.",
          details: data,
        },
        { status: 500 }
      );
    }

    const checkoutUrl = `${PAYMOB_BASE_URL}/unifiedcheckout/?publicKey=${publicKey}&clientSecret=${clientSecret}`;

    return NextResponse.json({
      checkoutUrl,
      clientSecret,
      intention: data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unexpected server error.",
      },
      { status: 500 }
    );
  }
}