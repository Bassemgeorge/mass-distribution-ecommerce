"use client";

import { use, useCallback, useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { STAFF_STATUS_LABEL, money } from "@/lib/sourcing";
import StaffRequestHeader, { StaffView } from "@/components/sourcing/StaffRequestHeader";
import StaffLinesTable from "@/components/sourcing/StaffLinesTable";

export default function SourcingApprovePage({
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
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) {
      setInvalid(true);
      return;
    }
    const { data, error: err } = await supabase.rpc("sourcing_approval_view", { p_request: id, p_token: token });
    const v = data as StaffView | null;
    if (err || !v || !v.ok) {
      setInvalid(true);
      return;
    }
    setView(v);
  }, [id, token]);

  useEffect(() => {
    load();
  }, [load]);

  async function decide(decision: "approve" | "reject") {
    if (decision === "reject" && !note.trim()) {
      setError("Please write what needs to change before sending it back.");
      return;
    }
    setBusy(true);
    setError(null);
    const { data, error: err } = await supabase.rpc("sourcing_approve", {
      p_request: id,
      p_token: token,
      p_decision: decision,
      p_note: note.trim() || null,
    });
    setBusy(false);
    const res = data as { ok?: boolean } | null;
    if (err || !res?.ok) {
      setError(err?.message ?? "Couldn't save your decision.");
      return;
    }
    setResult(decision === "approve" ? "Approved and sent to the customer." : "Sent back to the team with your note.");
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

  const subtotal = view.lines.reduce((s, l) => s + Number(l.unit_price) * l.quantity, 0);
  const cost = view.lines.reduce((s, l) => s + Number(l.unit_cost ?? 0) * l.quantity, 0);
  const pending = view.status === "pending_approval";

  return (
    <div className="min-h-screen bg-[#F7F7F5]">
      <div className="bg-[#1B4D2E] text-white px-4 py-3">
        <p className="max-w-3xl mx-auto text-sm font-semibold">Mass Distribution · Sourcing Desk · Approval</p>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-5 space-y-4">
        <StaffRequestHeader view={view} />

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

        <section className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Quote lines</p>
          {view.lines.length > 0 ? <StaffLinesTable lines={view.lines} /> : <p className="text-sm text-gray-400">No lines.</p>}
          {view.lines.length > 0 && (
            <p className="text-sm text-gray-600">
              Total {money(subtotal)} ex VAT · cost {money(cost)} · overall margin{" "}
              <span className="font-semibold">{subtotal > 0 ? `${(((subtotal - cost) / subtotal) * 100).toFixed(1)}%` : "—"}</span>
            </p>
          )}
          {view.customer_note && (
            <p className="text-sm bg-gray-50 rounded-lg px-3 py-2" dir="auto">
              <span className="text-gray-400">Note to customer:</span> {view.customer_note}
            </p>
          )}
        </section>

        {pending ? (
          <section className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
            <label className="block">
              <span className="block text-[11px] font-semibold text-gray-500 mb-1">Note (required to send back)</span>
              <textarea
                rows={3}
                dir="auto"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm resize-none focus:outline-none focus:border-[#1B4D2E]"
              />
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => decide("approve")}
                disabled={busy}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold bg-[#1B4D2E] text-white disabled:opacity-50"
              >
                {busy && <Loader2 size={15} className="animate-spin" />} Approve and send to customer
              </button>
              <button
                onClick={() => decide("reject")}
                disabled={busy}
                className="flex-1 py-3 rounded-lg text-sm font-semibold border border-amber-400 text-amber-800 disabled:opacity-50"
              >
                Send back
              </button>
            </div>
          </section>
        ) : (
          <p className="text-sm text-gray-600 bg-white border border-gray-200 rounded-xl p-4">
            Status: <span className="font-semibold">{STAFF_STATUS_LABEL[view.status] ?? view.status}</span> — nothing to approve.
          </p>
        )}
      </div>
    </div>
  );
}
