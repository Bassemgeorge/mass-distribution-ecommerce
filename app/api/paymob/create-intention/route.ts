import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const PAYMOB_BASE = "https://accept.paymob.com";

function createSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase server environment variables.");
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(request: Request) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  try {
    // ── Env checks ────────────────────────────────────────────────────────────
    const secretKey = process.env.PAYMOB_SECRET_KEY;
    const publicKey = process.env.PAYMOB_PUBLIC_KEY;
    if (!secretKey || !publicKey) {
      return NextResponse.json({ error: "Payment service not configured." }, { status: 500 });
    }

    // ── Parse body — accept orderId only; amount comes from the DB ────────────
    const body = await request.json() as { orderId?: string };
    if (!body.orderId) {
      return NextResponse.json({ error: "Missing orderId." }, { status: 400 });
    }
    const orderId = body.orderId;

    // ── Auth check — caller must own this order ───────────────────────────────
    const authHeader = request.headers.get("authorization") ?? "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    const supabase = createSupabaseAdmin();

    if (token) {
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) {
        // Verify the order's company belongs to this login (a login can own several companies)
        const { data: ownership } = await supabase
          .from("orders")
          .select("id, customers!inner(user_id)")
          .eq("id", orderId)
          .eq("customers.user_id", user.id)
          .maybeSingle();

        if (!ownership) {
          return NextResponse.json({ error: "Order not found for this account." }, { status: 403 });
        }
      }
    }

    // ── Load order from DB — never trust the browser's amount ─────────────────
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select(`
        id, customer_id, total, total_incl_vat, payment_method, payment_status, status,
        order_items ( product_name, quantity, unit_price, subtotal, vat_amount ),
        customers ( name, email, phone, address, business_name )
      `)
      .eq("id", orderId)
      .single();

    if (orderErr || !order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    // ── Validate payment state ─────────────────────────────────────────────────
    if (order.payment_method !== "paymob") {
      return NextResponse.json({ error: "Order is not set to Paymob payment." }, { status: 400 });
    }
    if (!["pending", "failed"].includes(order.payment_status ?? "")) {
      return NextResponse.json({ error: "Order cannot be paid in its current state." }, { status: 400 });
    }

    // ── Compute amount server-side ─────────────────────────────────────────────
    type OrderItem = { vat_amount: number | null; product_name: string; quantity: number; unit_price: number; subtotal: number };
    const items = (order.order_items ?? []) as OrderItem[];
    const vatSum = items.reduce((s, i) => s + (i.vat_amount ?? 0), 0);
    const amount: number = order.total_incl_vat ?? (order.total + vatSum);
    const amountCents = Math.round(amount * 100);

    // ── Build payment methods array from env ───────────────────────────────────
    const paymentMethods: number[] = [];
    if (process.env.PAYMOB_CARD_INTEGRATION_ID)
      paymentMethods.push(Number(process.env.PAYMOB_CARD_INTEGRATION_ID));
    if (process.env.PAYMOB_WALLET_INTEGRATION_ID)
      paymentMethods.push(Number(process.env.PAYMOB_WALLET_INTEGRATION_ID));
    if (process.env.PAYMOB_APPLE_PAY_INTEGRATION_ID)
      paymentMethods.push(Number(process.env.PAYMOB_APPLE_PAY_INTEGRATION_ID));
    if (paymentMethods.length === 0) {
      return NextResponse.json({ error: "No payment integrations configured." }, { status: 500 });
    }

    // ── Customer details ───────────────────────────────────────────────────────
    type Customer = { name: string; email: string | null; phone: string; address: string; business_name: string } | null;
    const customer = order.customers as unknown as Customer;
    const fullName = customer?.name ?? "Customer";
    const [firstName, ...rest] = fullName.trim().split(" ");
    const lastName = rest.join(" ") || firstName;
    const phone = customer?.phone ?? "";
    const email = customer?.email || "info@mass-dis.com";
    const address = customer?.address ?? "Cairo, Egypt";
    const ref = orderId.slice(0, 8).toUpperCase();

    // ── Call Paymob ────────────────────────────────────────────────────────────
    const specialReference = `mass-${orderId}-${Date.now()}`;

    const paymobRes = await fetch(`${PAYMOB_BASE}/v1/intention/`, {
      method: "POST",
      headers: {
        Authorization: `Token ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amountCents,
        currency: "EGP",
        payment_methods: paymentMethods,
        // Single line item matching total — avoids per-item rounding issues
        items: [
          {
            name: `Mass Distribution order #${ref}`,
            amount: amountCents,
            description: `Order ${ref}`,
            quantity: 1,
          },
        ],
        billing_data: {
          first_name: firstName || "Customer",
          last_name: lastName,
          email,
          phone_number: phone || "NA",
          street: address,
          city: "Cairo",
          country: "EG",
          state: "Cairo",
          postal_code: "00000",
        },
        customer: {
          first_name: firstName || "Customer",
          last_name: lastName,
          email,
        },
        extras: { supabase_order_id: orderId },
        special_reference: specialReference,
        redirection_url: `${siteUrl}/payment/result?orderId=${orderId}`,
        notification_url: `${siteUrl}/api/paymob/webhook`,
      }),
    });

    const paymobData = await paymobRes.json();

    if (!paymobRes.ok) {
      // Log details server-side only; never send to browser
      console.error("[paymob] intention creation failed", paymobData);
      return NextResponse.json(
        { error: "Payment service error. Please try again." },
        { status: 502 }
      );
    }

    const clientSecret: string | undefined = paymobData.client_secret ?? paymobData.cs;
    if (!clientSecret) {
      console.error("[paymob] no client_secret in response", paymobData);
      return NextResponse.json({ error: "Payment service error. Please try again." }, { status: 502 });
    }

    // ── Save intention id (best-effort — column may not exist yet) ─────────────
    if (paymobData.id) {
      await supabase
        .from("orders")
        .update({ paymob_intention_id: String(paymobData.id) } as Record<string, unknown>)
        .eq("id", orderId);
    }

    const checkoutUrl = `${PAYMOB_BASE}/unifiedcheckout/?publicKey=${publicKey}&clientSecret=${clientSecret}`;

    return NextResponse.json({ checkoutUrl });

  } catch (err) {
    console.error("[paymob] create-intention error", err);
    return NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
  }
}
