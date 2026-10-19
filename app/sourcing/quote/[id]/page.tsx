"use client";

import { use, useCallback, useEffect, useState } from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, Loader2, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { MIN_MARGIN, STAFF_STATUS_LABEL, margin, money, priceAtMinMargin } from "@/lib/sourcing";
import StaffRequestHeader, { StaffLine, StaffView } from "@/components/sourcing/StaffRequestHeader";
import StaffLinesTable from "@/components/sourcing/StaffLinesTable";

const HANDLERS = ["Abdelrahman", "Kiro"] as const;
const HANDLER_KEY = "md_sourcing_handler";

interface LineDraft {
  item_name: string;
  pack: string;
  quantity: string;
  unit_cost: string;
  unit_price: string;
  vat_rate: "0.14" | "0";
  lead_time_days: string;
  customer_current_price: string;
  supplier: string;
  notes: string;
}

const emptyLine = (): LineDraft => ({
  item_name: "",
  pack: "",
  quantity: "1",
  unit_cost: "",
  unit_price: "",
  vat_rate: "0.14",
  lead_time_days: "1",
  customer_current_price: "",
  supplier: "",
  notes: "",
});

function toDraft(l: StaffLine): LineDraft {
  const s = (v: number | string | null | undefined) => (v == null ? "" : String(v));
  return {
    item_name: l.item_name ?? "",
    pack: s(l.pack),
    quantity: s(l.quantity) || "1",
    unit_cost: s(l.unit_cost),
    unit_price: s(l.unit_price),
    vat_rate: Number(l.vat_rate) === 0 ? "0" : "0.14",
    lead_time_days: s(l.lead_time_days),
    customer_current_price: s(l.customer_current_price),
    supplier: s(l.supplier),
    notes: s(l.notes),
  };
}

const num = (v: string) => (v.trim() === "" ? NaN : Number(v));

export default function StaffQuotePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const { id } = use(params);
  const { t: token = "" } = use(searchParams);

  const [view, setView] = useState<StaffView | null>(null);
  const [invalid, setInvalid] = useState(false);
  const [handler, setHandler] = useState<string>("");
  const [lines, setLines] = useState<LineDraft[]>([emptyLine()]);
  const [customerNote, setCustomerNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [showUnavailable, setShowUnavailable] = useState(false);
  const [reason, setReason] = useState("");
  const [alternative, setAlternative] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(HANDLER_KEY);
      if (saved && (HANDLERS as readonly string[]).includes(saved)) setHandler(saved);
    } catch {
      // storage unavailable — they just pick again
    }
  }, []);

  const load = useCallback(async () => {
    if (!token) {
      setInvalid(true);
      return;
    }
    const { data, error: err } = await supabase.rpc("sourcing_staff_view", { p_request: id, p_token: token });
    const v = data as StaffView | null;
    if (err || !v || !v.ok) {
      setInvalid(true);
      return;
    }
    setView(v);
    setLines(v.lines.length > 0 ? v.lines.map(toDraft) : [emptyLine()]);
    if (v.customer_note) setCustomerNote(v.customer_note);
  }, [id, token]);

  useEffect(() => {
    load();
  }, [load]);

  function pickHandler(h: string) {
    setHandler(h);
    try {
      localStorage.setItem(HANDLER_KEY, h);
    } catch {
      // ignore
    }
  }

  function updateLine(i: number, patch: Partial<LineDraft>) {
    setLines((prev) => prev.map((l, j) => (j === i ? { ...l, ...patch } : l)));
  }

  async function startWork() {
    if (!handler) return setError("Choose who you are first.");
    setBusy(true);
    setError(null);
    const { data, error: err } = await supabase.rpc("sourcing_staff_start", { p_request: id, p_token: token, p_handler: handler });
    if (err || !(data as { ok?: boolean })?.ok) setError(err?.message ?? "Couldn't start this request.");
    setBusy(false);
    load();
  }

  async function sendQuote() {
    if (!handler) return setError("Choose who you are first.");
    setError(null);
    for (const [i, l] of lines.entries()) {
      const n = i + 1;
      if (!l.item_name.trim()) return setError(`Line ${n}: item name is required.`);
      if (!(Number.isInteger(num(l.quantity)) && num(l.quantity) > 0)) return setError(`Line ${n}: cartons must be a whole number above 0.`);
      if (!(num(l.unit_cost) >= 0)) return setError(`Line ${n}: cost per carton is required.`);
      if (!(num(l.unit_price) > 0)) return setError(`Line ${n}: our price per carton is required.`);
    }
    setBusy(true);
    const payload = lines.map((l) => ({
      item_name: l.item_name.trim(),
      pack: l.pack.trim() || null,
      quantity: num(l.quantity),
      unit_price: num(l.unit_price),
      unit_cost: num(l.unit_cost),
      supplier: l.supplier.trim() || null,
      vat_rate: Number(l.vat_rate),
      lead_time_days: Number.isFinite(num(l.lead_time_days)) ? Math.round(num(l.lead_time_days)) : null,
      customer_current_price: Number.isFinite(num(l.customer_current_price)) ? num(l.customer_current_price) : null,
      notes: l.notes.trim() || null,
    }));
    const { data, error: err } = await supabase.rpc("sourcing_staff_quote", {
      p_request: id,
      p_token: token,
      p_handler: handler,
      p_lines: payload,
      p_customer_note: customerNote.trim() || null,
      p_unavailable: false,
    });
    setBusy(false);
    const res = data as { ok?: boolean; status?: string } | null;
    if (err || !res?.ok) return setError(err?.message ?? "Couldn't send the quote.");
    setResult(res.status === "pending_approval" ? "Sent to Bassem for approval (a line is below 8% margin)." : "Sent to the customer.");
    load();
  }

  async function markUnavailable() {
    if (!handler) return setError("Choose who you are first.");
    if (!reason.trim()) return setError("Please give a reason.");
    setBusy(true);
    setError(null);
    const { data, error: err } = await supabase.rpc("sourcing_staff_quote", {
      p_request: id,
      p_token: token,
      p_handler: handler,
      p_lines: [],
      p_unavailable: true,
      p_reason: reason.trim(),
      p_alternative: alternative.trim() || null,
    });
    setBusy(false);
    const res = data as { ok?: boolean } | null;
    if (err || !res?.ok) return setError(err?.message ?? "Couldn't update the request.");
    setResult("Marked as not available. The customer will be told.");
    setShowUnavailable(false);
    load();
  }

  if (invalid) {
    return (
      <div className="min-h-screen bg-[#F7F7F5] flex items-center justify-center px-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center max-w-sm">
          <AlertCircle size={32} className="text-red-400 mx-auto mb-3" />
          <p className="font-semibold text-[#111111]">This link is not valid.</p>
        </div>
      </div>
    );
  }

  if (!view) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-[#1B4D2E]" />
      </div>
    );
  }

  const editable = view.status === "received" || view.status === "sourcing";
  const isInvoice = view.kind === "invoice";
  const inp = "w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm bg-white focus:outline-none focus:border-[#1B4D2E]";
  const lbl = "block text-[11px] font-semibold text-gray-500 mb-1";

  return (
    <div className="min-h-screen bg-[#F7F7F5]">
      <div className="bg-[#1B4D2E] text-white px-4 py-3">
        <p className="max-w-3xl mx-auto text-sm font-semibold">Mass Distribution · Sourcing Desk · Quote</p>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-5 space-y-4">
        <StaffRequestHeader view={view} />

        {view.approval_note && (
          <div className="bg-amber-50 border border-amber-300 text-amber-900 text-sm rounded-xl px-4 py-3">
            <span className="font-semibold">Bassem sent this back:</span> <span dir="auto">{view.approval_note}</span>
          </div>
        )}

        {result && (
          <div className="bg-[#177A41]/10 border border-[#177A41]/30 text-[#177A41] text-sm font-semibold rounded-xl px-4 py-3 flex items-center gap-2">
            <CheckCircle2 size={16} /> {result}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 flex items-start gap-2">
            <AlertCircle size={15} className="mt-0.5 flex-shrink-0" /> {error}
          </div>
        )}

        {!editable ? (
          <section className="bg-white border border-gray-200 rounded-xl p-4 text-sm space-y-3">
            <p className="font-semibold">Status: {STAFF_STATUS_LABEL[view.status] ?? view.status} — this request can&apos;t be edited.</p>
            {view.unavailable_reason && (
              <p className="text-gray-600">
                Reason: <span dir="auto">{view.unavailable_reason}</span>
                {view.alternative ? <> · Alternative: <span dir="auto">{view.alternative}</span></> : null}
              </p>
            )}
            {view.lines.length > 0 && <StaffLinesTable lines={view.lines} />}
          </section>
        ) : (
          <>
            <section className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold text-gray-500">Who are you?</p>
              <div className="flex gap-2">
                {HANDLERS.map((h) => (
                  <button
                    key={h}
                    onClick={() => pickHandler(h)}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border ${
                      handler === h ? "bg-[#1B4D2E] text-white border-[#1B4D2E]" : "bg-white text-gray-700 border-gray-200"
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
              {view.status === "received" && (
                <button
                  onClick={startWork}
                  disabled={busy || !handler}
                  className="w-full py-2.5 rounded-lg text-sm font-semibold bg-[#177A41] text-white disabled:opacity-50"
                >
                  I&apos;m on it
                </button>
              )}
            </section>

            <section className="space-y-3">
              {lines.map((l, i) => {
                const cost = num(l.unit_cost);
                const price = num(l.unit_price);
                const m = margin(price, cost);
                const low = m !== null && m < MIN_MARGIN;
                return (
                  <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-[#111111]">Line {i + 1}</p>
                      {lines.length > 1 && (
                        <button
                          onClick={() => setLines((prev) => prev.filter((_, j) => j !== i))}
                          className="text-gray-400 hover:text-red-500"
                          aria-label={`Remove line ${i + 1}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="col-span-2">
                        <span className={lbl}>Item name *</span>
                        <input className={inp} dir="auto" value={l.item_name} onChange={(e) => updateLine(i, { item_name: e.target.value })} />
                      </label>
                      <label className="col-span-2">
                        <span className={lbl}>Pack (e.g. carton 24 × 500g)</span>
                        <input className={inp} dir="auto" value={l.pack} onChange={(e) => updateLine(i, { pack: e.target.value })} />
                      </label>
                      <label>
                        <span className={lbl}>Cartons *</span>
                        <input className={inp} inputMode="numeric" value={l.quantity} onChange={(e) => updateLine(i, { quantity: e.target.value })} />
                      </label>
                      <label>
                        <span className={lbl}>Lead time (days)</span>
                        <input className={inp} inputMode="numeric" value={l.lead_time_days} onChange={(e) => updateLine(i, { lead_time_days: e.target.value })} />
                      </label>
                      <label>
                        <span className={lbl}>Cost / carton (ex VAT) *</span>
                        <input className={inp} inputMode="decimal" value={l.unit_cost} onChange={(e) => updateLine(i, { unit_cost: e.target.value })} />
                      </label>
                      <label>
                        <span className={lbl}>Our price / carton (ex VAT) *</span>
                        <input className={inp} inputMode="decimal" value={l.unit_price} onChange={(e) => updateLine(i, { unit_price: e.target.value })} />
                      </label>
                      <div className="col-span-2 flex flex-wrap items-center gap-2">
                        {m !== null && (
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${low ? "bg-red-50 text-red-700" : "bg-[#177A41]/10 text-[#177A41]"}`}>
                            Margin {(m * 100).toFixed(1)}%
                          </span>
                        )}
                        {cost >= 0 && Number.isFinite(cost) && (
                          <button
                            type="button"
                            onClick={() => updateLine(i, { unit_price: priceAtMinMargin(cost).toFixed(2) })}
                            className="text-xs font-semibold text-[#1B4D2E] border border-[#1B4D2E]/30 rounded-full px-2.5 py-1"
                          >
                            Set price at 8% ({money(priceAtMinMargin(cost))})
                          </button>
                        )}
                        {low && (
                          <p className="w-full text-xs text-red-700 flex items-center gap-1">
                            <AlertTriangle size={12} /> Below 8% – this quote will go to Bassem for approval first
                          </p>
                        )}
                      </div>
                      <label>
                        <span className={lbl}>VAT</span>
                        <select className={inp} value={l.vat_rate} onChange={(e) => updateLine(i, { vat_rate: e.target.value as LineDraft["vat_rate"] })}>
                          <option value="0.14">14%</option>
                          <option value="0">0%</option>
                        </select>
                      </label>
                      <label>
                        <span className={lbl}>Supplier</span>
                        <input className={inp} dir="auto" value={l.supplier} onChange={(e) => updateLine(i, { supplier: e.target.value })} />
                      </label>
                      {isInvoice && (
                        <label className="col-span-2">
                          <span className={lbl}>Customer&apos;s current price / carton (from their invoice)</span>
                          <input
                            className={inp}
                            inputMode="decimal"
                            value={l.customer_current_price}
                            onChange={(e) => updateLine(i, { customer_current_price: e.target.value })}
                          />
                        </label>
                      )}
                      <label className="col-span-2">
                        <span className={lbl}>Notes (shown to the customer)</span>
                        <input className={inp} dir="auto" value={l.notes} onChange={(e) => updateLine(i, { notes: e.target.value })} />
                      </label>
                    </div>
                  </div>
                );
              })}
              <button
                onClick={() => setLines((prev) => [...prev, emptyLine()])}
                className="w-full flex items-center justify-center gap-1.5 border-2 border-dashed border-gray-300 rounded-xl py-3 text-sm font-semibold text-gray-600"
              >
                <Plus size={15} /> Add line
              </button>
            </section>

            <section className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
              <label className="block">
                <span className={lbl}>Note to customer</span>
                <textarea rows={3} className={`${inp} resize-none`} dir="auto" value={customerNote} onChange={(e) => setCustomerNote(e.target.value)} />
              </label>
              <button
                onClick={sendQuote}
                disabled={busy || !handler}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold bg-[#1B4D2E] text-white disabled:opacity-50"
              >
                {busy && <Loader2 size={15} className="animate-spin" />} Send quote
              </button>
            </section>

            <section className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
              {!showUnavailable ? (
                <button onClick={() => setShowUnavailable(true)} className="text-sm font-semibold text-red-600">
                  Can&apos;t source this
                </button>
              ) : (
                <>
                  <p className="text-sm font-semibold text-red-700">Can&apos;t source this</p>
                  <label className="block">
                    <span className={lbl}>Reason *</span>
                    <textarea rows={2} className={`${inp} resize-none`} dir="auto" value={reason} onChange={(e) => setReason(e.target.value)} />
                  </label>
                  <label className="block">
                    <span className={lbl}>Suggested alternative (optional)</span>
                    <input className={inp} dir="auto" value={alternative} onChange={(e) => setAlternative(e.target.value)} />
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={markUnavailable}
                      disabled={busy || !handler}
                      className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-red-600 text-white disabled:opacity-50"
                    >
                      Mark as not available
                    </button>
                    <button onClick={() => setShowUnavailable(false)} className="px-4 text-sm text-gray-500">
                      Back
                    </button>
                  </div>
                </>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
