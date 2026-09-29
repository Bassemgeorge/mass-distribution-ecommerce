import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { CheckCircle, XCircle, ShieldAlert, ArrowRight } from "lucide-react";
import { verifyRedirectHmac } from "@/lib/paymob";
import PaymentRetryButton from "./PaymentRetryButton";
import SwitchToCashButton from "./SwitchToCashButton";

function createSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key, { auth: { persistSession: false } });
}

export default async function PaymentResultPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;

  // Reconstruct URLSearchParams from the flat searchParams object
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (typeof v === "string") params.set(k, v);
    else if (Array.isArray(v)) params.set(k, v[0] ?? "");
  }

  const hmacValid = verifyRedirectHmac(params);
  const orderId = typeof sp.orderId === "string" ? sp.orderId : null;
  const isSuccess = params.get("success") === "true";
  const isPending = params.get("pending") === "true";
  const txId = params.get("id") ?? null;
  const ref = orderId ? orderId.slice(0, 8).toUpperCase() : null;

  // ── If HMAC is invalid — neutral message, touch nothing ──────────────────────
  if (!hmacValid) {
    return (
      <ResultShell
        icon={<ShieldAlert size={36} className="text-amber-500" />}
        iconBg="bg-amber-50"
        heading="Checking your payment…"
        headingAr="نتحقق من حالة الدفع"
        body="We&apos;re verifying your payment. We&apos;ll confirm by email once complete."
      >
        <Link
          href="/products"
          className="block w-full text-center bg-[#1B4D2E] text-white font-semibold py-3 rounded-xl hover:bg-[#163d24] transition-colors text-sm"
        >
          Continue Shopping
        </Link>
      </ResultShell>
    );
  }

  const paid = isSuccess && !isPending;

  // ── Apply the same "paid" update as the webhook (idempotent) ──────────────────
  if (paid && orderId) {
    const supabase = createSupabaseAdmin();

    // Load order to check amount and current state
    const { data: order } = await supabase
      .from("orders")
      .select("id, total, total_incl_vat, payment_status, status")
      .eq("id", orderId)
      .single();

    if (order && order.payment_status !== "paid" && order.payment_status !== "amount_mismatch") {
      const expectedCents = Math.round((order.total_incl_vat ?? order.total) * 100);
      const actualCents = Number(params.get("amount_cents") ?? 0);

      if (actualCents === expectedCents) {
        const newStatus = order.status === "pending" ? "confirmed" : order.status;
        await supabase
          .from("orders")
          .update({
            payment_status: "paid",
            status: newStatus,
            paymob_transaction_id: txId,
          })
          .eq("id", orderId);
      }
    }
  }

  // ── Load order total for display ──────────────────────────────────────────────
  let totalPaid: number | null = null;
  if (paid && orderId) {
    const supabase = createSupabaseAdmin();
    const { data } = await supabase
      .from("orders")
      .select("total, total_incl_vat")
      .eq("id", orderId)
      .single();
    totalPaid = data?.total_incl_vat ?? data?.total ?? null;
  }

  // ── Success ───────────────────────────────────────────────────────────────────
  if (paid) {
    return (
      <ResultShell
        icon={<CheckCircle size={36} className="text-[#1B4D2E]" />}
        iconBg="bg-[#E8F5E9]"
        heading="Payment Successful"
        headingAr="تم الدفع بنجاح"
        body={
          <>
            {ref && <p className="text-gray-500 text-sm">Order <span className="font-mono font-bold text-[#1B4D2E]">#{ref}</span></p>}
            {totalPaid != null && (
              <p className="text-gray-500 text-sm mt-0.5">
                Total paid: <span className="font-semibold text-[#111111]">EGP {totalPaid.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
              </p>
            )}
          </>
        }
      >
        {orderId && (
          <Link
            href={`/order-confirmation/${orderId}`}
            className="flex items-center justify-center gap-2 w-full text-center bg-[#1B4D2E] text-white font-semibold py-3 rounded-xl hover:bg-[#163d24] transition-colors text-sm"
          >
            View Order <ArrowRight size={16} />
          </Link>
        )}
        <Link
          href="/products"
          className="block w-full text-center border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:border-[#1B4D2E] hover:text-[#1B4D2E] transition-colors text-sm"
        >
          Continue Shopping
        </Link>
      </ResultShell>
    );
  }

  // ── Failed ────────────────────────────────────────────────────────────────────
  const errorMsg = params.get("data.message") ?? null;

  if (orderId) {
    const supabase = createSupabaseAdmin();
    const { data: order } = await supabase
      .from("orders")
      .select("payment_status")
      .eq("id", orderId)
      .single();
    if (order && order.payment_status !== "paid") {
      await supabase
        .from("orders")
        .update({ payment_status: "failed" })
        .eq("id", orderId);
    }
  }

  return (
    <ResultShell
      icon={<XCircle size={36} className="text-red-500" />}
      iconBg="bg-red-50"
      heading="Payment Didn't Go Through"
      headingAr="لم تتم عملية الدفع"
      body={
        errorMsg
          ? <p className="text-gray-500 text-sm">{errorMsg}</p>
          : <p className="text-gray-500 text-sm">The payment was not completed. You can try again or pay cash on delivery.</p>
      }
    >
      {orderId && <PaymentRetryButton orderId={orderId} />}
      {orderId && <SwitchToCashButton orderId={orderId} />}
      <Link
        href="/products"
        className="block w-full text-center border border-gray-200 text-gray-500 font-semibold py-3 rounded-xl hover:border-[#1B4D2E] hover:text-[#1B4D2E] transition-colors text-sm"
      >
        Continue Shopping
      </Link>
    </ResultShell>
  );
}

// ── Layout shell ──────────────────────────────────────────────────────────────
function ResultShell({
  icon,
  iconBg,
  heading,
  headingAr,
  body,
  children,
}: {
  icon: React.ReactNode;
  iconBg: string;
  heading: string;
  headingAr: string;
  body: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F7F7F5] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white border border-gray-200 rounded-2xl p-8 shadow-sm text-center">
        <div className={`w-16 h-16 rounded-2xl ${iconBg} flex items-center justify-center mx-auto mb-5`}>
          {icon}
        </div>

        <h1 className="text-2xl font-bold text-[#111111] mb-1">{heading}</h1>
        <p className="text-gray-400 text-sm mb-4" dir="rtl">{headingAr}</p>

        <div className="mb-6">{body}</div>

        <div className="flex flex-col gap-3">{children}</div>
      </div>
    </div>
  );
}
