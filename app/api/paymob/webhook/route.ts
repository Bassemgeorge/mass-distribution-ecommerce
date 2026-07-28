// Receive Paymob payment result Verify it
//Update Supabase order payment_status = paid

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function createSupabaseAdmin() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Missing Supabase server environment variables.");
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey);
}

function getPaymentObject(payload: Record<string, unknown>) {
  if (payload.obj && typeof payload.obj === "object") {
    return payload.obj as Record<string, unknown>;
  }

  return payload;
}

function extractSupabaseOrderId(payload: Record<string, unknown>) {
  const obj = getPaymentObject(payload);

  const specialReference = String(obj.special_reference || "");

  if (specialReference.startsWith("mass-")) {
    return specialReference.replace("mass-", "");
  }

  const extras = obj.extras;

  if (extras && typeof extras === "object") {
    const extrasObj = extras as Record<string, unknown>;

    if (extrasObj.supabase_order_id) {
      return String(extrasObj.supabase_order_id);
    }
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const obj = getPaymentObject(payload);

    const supabaseOrderId = extractSupabaseOrderId(payload);

    if (!supabaseOrderId) {
      return NextResponse.json(
        { error: "Could not find Supabase order id in Paymob payload." },
        { status: 400 }
      );
    }

    const isSuccess = obj.success === true || obj.success === "true";
    const isPending = obj.pending === true || obj.pending === "true";
    const transactionId = obj.id ? String(obj.id) : null;

    const supabase = createSupabaseAdmin();

    const { error } = await supabase
      .from("orders")
      .update({
        payment_status: isSuccess && !isPending ? "paid" : "failed",
        status: isSuccess && !isPending ? "confirmed" : "payment_failed",
        paymob_transaction_id: transactionId,
      })
      .eq("id", supabaseOrderId);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      received: true,
      orderId: supabaseOrderId,
      paymentStatus: isSuccess && !isPending ? "paid" : "failed",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unexpected webhook error.",
      },
      { status: 500 }
    );
  }
}