import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyWebhookHmac } from "@/lib/paymob";

function createSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase server environment variables.");
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(request: NextRequest) {
  try {
    // ── Parse body ────────────────────────────────────────────────────────────
    const payload = await request.json() as Record<string, unknown>;
    const obj = (payload.obj ?? payload) as Record<string, unknown>;

    // ── HMAC verification — must come first ───────────────────────────────────
    const hmac = request.nextUrl.searchParams.get("hmac") ?? "";
    if (!verifyWebhookHmac(obj, hmac)) {
      console.warn("[webhook] HMAC mismatch — rejecting");
      return NextResponse.json({ error: "Invalid HMAC." }, { status: 401 });
    }

    // ── Extract order id from special_reference or extras ─────────────────────
    const specialRef = String(obj.special_reference ?? "");
    let supabaseOrderId: string | null = null;

    // Format: "mass-{uuid}-{timestamp}" — extract the UUID portion
    const refMatch = specialRef.match(
      /^mass-([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i
    );
    if (refMatch) {
      supabaseOrderId = refMatch[1];
    } else {
      const extras = obj.extras as Record<string, unknown> | undefined;
      if (extras?.supabase_order_id) supabaseOrderId = String(extras.supabase_order_id);
    }

    if (!supabaseOrderId) {
      console.warn("[webhook] cannot find order id in payload");
      return NextResponse.json({ ok: true });
    }

    // ── Load the order to check expected amount ────────────────────────────────
    const supabase = createSupabaseAdmin();
    const { data: order } = await supabase
      .from("orders")
      .select("id, total, total_incl_vat, payment_status, status")
      .eq("id", supabaseOrderId)
      .single();

    if (!order) {
      console.warn("[webhook] order not found:", supabaseOrderId);
      return NextResponse.json({ ok: true }); // return 200 so Paymob stops retrying
    }

    // ── Amount check ──────────────────────────────────────────────────────────
    const expectedCents = Math.round((order.total_incl_vat ?? order.total) * 100);
    const actualCents = Number(obj.amount_cents ?? 0);
    const isSuccess = obj.success === true || obj.success === "true";
    const isPending = obj.pending === true || obj.pending === "true";
    const transactionId = obj.id ? String(obj.id) : null;

    // Idempotency — do not re-process an already-paid order
    if (order.payment_status === "paid") {
      return NextResponse.json({ ok: true, note: "already paid" });
    }

    if (isSuccess && !isPending) {
      if (actualCents !== expectedCents) {
        console.error(
          `[webhook] amount mismatch order=${supabaseOrderId} expected=${expectedCents} got=${actualCents}`
        );
        await supabase
          .from("orders")
          .update({ payment_status: "amount_mismatch" })
          .eq("id", supabaseOrderId);
        return NextResponse.json({ ok: true });
      }

      // ── Mark paid ───────────────────────────────────────────────────────────
      const newStatus = order.status === "pending" ? "confirmed" : order.status;
      await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          status: newStatus,
          paymob_transaction_id: transactionId,
        })
        .eq("id", supabaseOrderId);

    } else {
      // Failed — do not overwrite a paid order
      await supabase
        .from("orders")
        .update({ payment_status: "failed" })
        .eq("id", supabaseOrderId);
    }

    return NextResponse.json({ ok: true });

  } catch (err) {
    console.error("[webhook] error", err);
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}
