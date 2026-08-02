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

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      orderId?: string;
      transactionId?: string | null;
    };

    if (!body.orderId) {
      return NextResponse.json(
        { error: "Missing orderId." },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdmin();

    const { data: order, error: findError } = await supabase
      .from("orders")
      .select("id, payment_method, payment_status")
      .eq("id", body.orderId)
      .eq("payment_method", "paymob")
      .single();

    if (findError || !order) {
      return NextResponse.json(
        { error: "Paymob order not found." },
        { status: 404 }
      );
    }

    const { error: updateError } = await supabase
      .from("orders")
      .update({
        payment_status: "paid",
        status: "confirmed",
        paymob_transaction_id: body.transactionId || "success-page-confirmed",
      })
      .eq("id", body.orderId);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      orderId: body.orderId,
      payment_status: "paid",
      status: "confirmed",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unexpected error.",
      },
      { status: 500 }
    );
  }
}