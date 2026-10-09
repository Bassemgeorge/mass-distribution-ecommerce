import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function createSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase server environment variables.");
  return createClient(url, key, { auth: { persistSession: false } });
}

// Lets an authenticated customer switch a failed Paymob order to cash on delivery.
export async function POST(request: Request) {
  try {
    const body = await request.json() as { orderId?: string };
    if (!body.orderId) {
      return NextResponse.json({ error: "Missing orderId." }, { status: 400 });
    }

    const authHeader = request.headers.get("authorization") ?? "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const supabase = createSupabaseAdmin();
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    // Verify ownership: the order's company must belong to this login (which may own several companies)
    const { data: order } = await supabase
      .from("orders")
      .select("id, payment_method, payment_status, customers!inner(user_id)")
      .eq("id", body.orderId)
      .eq("customers.user_id", user.id)
      .maybeSingle();

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    if (order.payment_status === "paid") {
      return NextResponse.json({ error: "Order is already paid." }, { status: 400 });
    }

    await supabase
      .from("orders")
      .update({ payment_method: "cash", payment_status: "unpaid" })
      .eq("id", body.orderId);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[switch-to-cash] error", err);
    return NextResponse.json({ error: "Unexpected error." }, { status: 500 });
  }
}
