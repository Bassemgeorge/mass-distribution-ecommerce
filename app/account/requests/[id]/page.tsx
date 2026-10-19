"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, Check, Clock, FileText, Loader2, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRequireLogin } from "@/lib/useRequireLogin";
import SourcingStatusPill from "@/components/SourcingStatusPill";
import {
  OPEN_STATUSES,
  attachmentName,
  formatCairo,
  kindLabel,
  money,
  remainingLabel,
} from "@/lib/sourcing";

// Customer-safe columns only: no handler, approval notes or anything cost-related
const REQUEST_COLUMNS =
  "id, ref, kind, details, quantity, attachments, status, created_at, due_at, quoted_at, quote_expires_at, customer_note, unavailable_reason, alternative, order_id, customer_id";
const LINE_COLUMNS = "line_no, item_name, pack, quantity, unit_price, vat_rate, lead_time_days, customer_current_price, notes";

interface SourcingRequest {
  id: string;
  ref: string;
  kind: string;
  details: string;
  quantity: string | null;
  attachments: string[] | null;
  status: string;
  created_at: string;
  due_at: string | null;
  quoted_at: string | null;
  quote_expires_at: string | null;
  customer_note: string | null;
  unavailable_reason: string | null;
  alternative: string | null;
  order_id: string | null;
  customer_id: string;
}

interface QuoteLine {
  line_no: number;
  item_name: string;
  pack: string | null;
  quantity: number;
  unit_price: number;
  vat_rate: number;
  lead_time_days: number | null;
  customer_current_price: number | null;
  notes: string | null;
}

const STEPS = [
  { en: "Received", ar: "تم الاستلام" },
  { en: "Preparing quote", ar: "بنجهز العرض" },
  { en: "Quote ready", ar: "العرض جاهز" },
];

function Timeline({ status }: { status: string }) {
  const reached =
    status === "received" ? 0 : OPEN_STATUSES.includes(status) ? 1 : status === "quoted" || status === "expired" ? 2 : 3;
  const final =
    status === "declined"
      ? { en: "Declined", ar: "مرفوض" }
      : { en: "Accepted", ar: "تم القبول" };
  const steps = [...STEPS, final];
  return (
    <ol className="grid grid-cols-4 gap-1">
      {steps.map((s, i) => {
        const done = i <= reached;
        return (
          <li key={s.en} className="text-center">
            <div className={`h-1.5 rounded-full ${done ? "bg-[#177A41]" : "bg-gray-200"}`} />
            <p className={`text-[11px] mt-1.5 font-medium ${done ? "text-[#111111]" : "text-gray-400"}`}>{s.en}</p>
            <p className="text-[11px] text-gray-400" dir="rtl">
              {s.ar}
            </p>
          </li>
        );
      })}
    </ol>
  );
}

export default function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useRequireLogin();
  const router = useRouter();

  const [request, setRequest] = useState<SourcingRequest | null>(null);
  const [lines, setLines] = useState<QuoteLine[]>([]);
  const [isCredit, setIsCredit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"accept" | "decline" | null>(null);
  const [payment, setPayment] = useState<"cash" | "credit">("cash");
  const [note, setNote] = useState("");
  const [now, setNow] = useState(() => Date.now());

  const load = useCallback(async () => {
    const { data: r } = await supabase.from("sourcing_requests").select(REQUEST_COLUMNS).eq("id", id).maybeSingle();
    if (!r) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    const req = r as SourcingRequest;
    const [linesRes, custRes] = await Promise.all([
      supabase.from("sourcing_quote_lines").select(LINE_COLUMNS).eq("request_id", id).order("line_no"),
      supabase.from("customers").select("is_credit").eq("id", req.customer_id).maybeSingle(),
    ]);
    setRequest(req);
    setLines((linesRes.data as QuoteLine[]) ?? []);
    const credit = custRes.data?.is_credit === true;
    setIsCredit(credit);
    setPayment(credit ? "credit" : "cash");
    setLoading(false);
  }, [id]);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  // keep the "valid until" countdown fresh
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(t);
  }, []);

  async function respond(accept: boolean) {
    if (!request) return;
    setBusy(true);
    setError(null);
    const { data, error: err } = await supabase.rpc("sourcing_respond", {
      p_request: request.id,
      p_accept: accept,
      p_payment_method: accept ? payment : "cash",
      p_note: note.trim() || null,
    });
    if (err) {
      setError(err.message);
      setBusy(false);
      load();
      return;
    }
    const result = data as { ok: boolean; status: string; order_id?: string };
    if (accept && result.order_id) {
      router.push(`/order-confirmation/${result.order_id}`);
      return;
    }
    setMode(null);
    setBusy(false);
    load();
  }

  async function cancelRequest() {
    if (!request) return;
    if (!window.confirm("Cancel this request? / تلغي الطلب ده؟")) return;
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.rpc("sourcing_cancel", { p_request: request.id });
    if (err) setError(err.message);
    setBusy(false);
    load();
  }

  if (loading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-[#1B4D2E]" />
      </div>
    );
  }

  if (notFound || !request) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-sm text-gray-500">
        Request not found.
        <Link href="/account/requests" className="text-[#1B4D2E] font-medium hover:underline">
          ← My requests
        </Link>
      </div>
    );
  }

  const kind = kindLabel(request.kind);
  const subtotal = lines.reduce((s, l) => s + Number(l.unit_price) * l.quantity, 0);
  const vat = lines.reduce((s, l) => s + Number(l.unit_price) * l.quantity * Number(l.vat_rate ?? 0), 0);
  const savings = lines.reduce(
    (s, l) =>
      l.customer_current_price != null && Number(l.customer_current_price) > Number(l.unit_price)
        ? s + (Number(l.customer_current_price) - Number(l.unit_price)) * l.quantity
        : s,
    0
  );
  const remaining = request.status === "quoted" ? remainingLabel(request.quote_expires_at, now) : null;
  const showQuote = ["quoted", "accepted", "declined", "expired"].includes(request.status) && lines.length > 0;
  const files = request.attachments ?? [];

  return (
    <div className="min-h-screen bg-[#F7F7F5]">
      <div className="bg-[#111111] text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link href="/account/requests" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-4">
            <ArrowLeft size={14} /> My requests / طلباتي
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold font-mono">{request.ref}</h1>
            <SourcingStatusPill status={request.status} />
          </div>
          <p className="text-gray-400 text-sm mt-1">
            {kind.en} / <span dir="rtl">{kind.ar}</span> · {formatCairo(request.created_at)}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-5">
        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2.5">
            <AlertCircle size={15} className="flex-shrink-0 mt-0.5" /> <span>{error}</span>
          </div>
        )}

        {!["unavailable", "cancelled"].includes(request.status) && (
          <section className="bg-white rounded-xl border border-gray-200 p-5">
            <Timeline status={request.status} />
            {OPEN_STATUSES.includes(request.status) && request.due_at && (
              <p className="text-sm text-gray-600 mt-4 flex items-center gap-1.5">
                <Clock size={14} className="text-[#177A41]" /> Your quote will be ready by{" "}
                <span className="font-semibold">{formatCairo(request.due_at)}</span>
              </p>
            )}
          </section>
        )}

        {request.status === "unavailable" && (
          <section className="bg-red-50 border border-red-200 rounded-xl p-5 text-sm">
            <p className="font-semibold text-red-800">
              Sorry, we couldn&apos;t source this. / <span dir="rtl">للأسف مقدرناش نوفر الصنف ده.</span>
            </p>
            {request.unavailable_reason && (
              <p className="text-red-700 mt-2" dir="auto">
                {request.unavailable_reason}
              </p>
            )}
            {request.alternative && (
              <p className="mt-3 text-gray-700">
                <span className="font-semibold">Suggested alternative / بديل مقترح:</span>{" "}
                <span dir="auto">{request.alternative}</span>
              </p>
            )}
          </section>
        )}

        {/* Request details */}
        <section className="bg-white rounded-xl border border-gray-200 p-5 text-sm space-y-3">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Your request · طلبك</h2>
          <p className="text-[#111111] whitespace-pre-line" dir="auto">
            {request.details}
          </p>
          {request.quantity && (
            <p className="text-gray-600">
              <span className="text-gray-400">Quantity / الكمية:</span> <span dir="auto">{request.quantity}</span>
            </p>
          )}
          {files.length > 0 && (
            <ul className="space-y-1">
              {files.map((p) => (
                <li key={p} className="flex items-center gap-2 text-gray-600">
                  <FileText size={14} className="text-gray-400" /> {attachmentName(p)}
                </li>
              ))}
            </ul>
          )}
          {OPEN_STATUSES.includes(request.status) && (
            <button
              onClick={cancelRequest}
              disabled={busy}
              className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
            >
              Cancel request / إلغاء الطلب
            </button>
          )}
        </section>

        {/* Quote */}
        {showQuote && (
          <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Our quote · عرض السعر</h2>
              {request.status === "quoted" && request.quote_expires_at && (
                <p className="text-xs font-semibold text-amber-700 flex items-center gap-1">
                  <Clock size={12} /> Valid until {formatCairo(request.quote_expires_at)}
                  {remaining ? ` · ${remaining}` : ""}
                </p>
              )}
            </div>

            <div className="overflow-x-auto -mx-5 px-5">
              <table className="w-full text-sm min-w-[620px]">
                <thead>
                  <tr className="text-xs text-gray-400 border-b border-gray-100">
                    <th className="text-left pb-2 font-medium">Item</th>
                    <th className="text-right pb-2 font-medium">Cartons</th>
                    <th className="text-right pb-2 font-medium">Lead time</th>
                    <th className="text-right pb-2 font-medium">Your current price</th>
                    <th className="text-right pb-2 font-medium">Our price / carton</th>
                    <th className="text-right pb-2 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {lines.map((l) => (
                    <tr key={l.line_no}>
                      <td className="py-2.5 pr-3">
                        <p className="font-medium text-[#111111]" dir="auto">
                          {l.item_name}
                        </p>
                        {l.pack && <p className="text-xs text-gray-400" dir="auto">{l.pack}</p>}
                        {l.notes && <p className="text-xs text-gray-500 mt-0.5" dir="auto">{l.notes}</p>}
                      </td>
                      <td className="py-2.5 text-right">{l.quantity}</td>
                      <td className="py-2.5 text-right text-gray-500">
                        {l.lead_time_days != null ? `${l.lead_time_days} day${l.lead_time_days === 1 ? "" : "s"}` : "—"}
                      </td>
                      <td className="py-2.5 text-right text-gray-400">
                        {l.customer_current_price != null ? <s>{money(l.customer_current_price)}</s> : "—"}
                      </td>
                      <td className="py-2.5 text-right font-semibold text-[#1B4D2E]">{money(l.unit_price)}</td>
                      <td className="py-2.5 text-right font-semibold">{money(Number(l.unit_price) * l.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t border-gray-100 pt-3 space-y-1.5 text-sm max-w-xs ml-auto">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal (excl. VAT)</span>
                <span className="font-semibold text-[#111111]">{money(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>VAT</span>
                <span className="font-semibold text-[#111111]">{money(vat)}</span>
              </div>
              <div className="flex justify-between font-bold border-t border-gray-100 pt-1.5">
                <span>Total (incl. VAT)</span>
                <span className="text-[#1B4D2E]">{money(subtotal + vat)}</span>
              </div>
            </div>

            {savings > 0 && (
              <p className="bg-[#177A41]/10 text-[#177A41] text-sm font-semibold rounded-lg px-3 py-2">
                You save {money(savings)} vs your current supplier · <span dir="rtl">هتوفر {money(savings)} عن موردك الحالي</span>
              </p>
            )}

            {request.customer_note && (
              <p className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2 whitespace-pre-line" dir="auto">
                {request.customer_note}
              </p>
            )}

            {request.status === "quoted" && (
              <div className="border-t border-gray-100 pt-4 space-y-3">
                {mode === null && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setMode("accept")}
                      className="inline-flex items-center gap-1.5 bg-[#1B4D2E] text-white font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-[#163d24]"
                    >
                      <Check size={15} /> Accept / قبول
                    </button>
                    <button
                      onClick={() => setMode("decline")}
                      className="inline-flex items-center gap-1.5 border border-gray-300 text-gray-700 font-semibold text-sm px-5 py-2.5 rounded-lg hover:border-red-300 hover:text-red-600"
                    >
                      <X size={15} /> Decline / رفض
                    </button>
                  </div>
                )}

                {mode === "accept" && (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-gray-600">Payment · الدفع</p>
                    {isCredit && (
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="radio" checked={payment === "credit"} onChange={() => setPayment("credit")} className="accent-[#1B4D2E]" />
                        On credit (your account terms) / <span dir="rtl">آجل حسب شروط حسابك</span>
                      </label>
                    )}
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="radio" checked={payment === "cash"} onChange={() => setPayment("cash")} className="accent-[#1B4D2E]" />
                      Cash on delivery / <span dir="rtl">كاش عند الاستلام</span>
                    </label>
                    <textarea
                      rows={2}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      dir="auto"
                      placeholder="Note (optional) — e.g. delivery day / ملاحظة (اختياري)"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-[#1B4D2E]"
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => respond(true)}
                        disabled={busy}
                        className="inline-flex items-center gap-1.5 bg-[#1B4D2E] text-white font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-[#163d24] disabled:opacity-60"
                      >
                        {busy ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} Confirm order / تأكيد الطلب
                      </button>
                      <button onClick={() => setMode(null)} disabled={busy} className="text-sm text-gray-500 px-3">
                        Back
                      </button>
                    </div>
                  </div>
                )}

                {mode === "decline" && (
                  <div className="space-y-3">
                    <textarea
                      rows={2}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      dir="auto"
                      placeholder="Reason (optional) / السبب (اختياري)"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-[#1B4D2E]"
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => respond(false)}
                        disabled={busy}
                        className="inline-flex items-center gap-1.5 bg-red-600 text-white font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-red-700 disabled:opacity-60"
                      >
                        {busy ? <Loader2 size={15} className="animate-spin" /> : <X size={15} />} Decline quote / رفض العرض
                      </button>
                      <button onClick={() => setMode(null)} disabled={busy} className="text-sm text-gray-500 px-3">
                        Back
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {request.status === "accepted" && request.order_id && (
              <Link href={`/order-confirmation/${request.order_id}`} className="inline-block text-sm font-semibold text-[#1B4D2E] hover:underline">
                View your order →
              </Link>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
