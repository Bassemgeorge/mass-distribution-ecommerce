"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { StaffRole } from "@/context/StaffRoleContext";

export const ORDER_STATUSES = ["pending", "confirmed", "processing", "delivered", "cancelled"] as const;
const FLOW = ["pending", "confirmed", "processing", "delivered"];

export const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  processing: "bg-purple-50 text-purple-700 border-purple-200",
  delivered: "bg-green-50 text-[#1B4D2E] border-green-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
  payment_failed: "bg-red-50 text-red-700 border-red-200",
};

export function label(value: string | null | undefined) {
  return (value || "unknown")
    .replace(/_/g, " ")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Next statuses a role may pick. Sales only move forward (or cancel); admins can pick anything. */
export function nextStatuses(role: StaffRole, current: string): string[] {
  if (role === "admin") return ORDER_STATUSES.filter((s) => s !== current);
  if (role !== "sales") return [];
  const i = FLOW.indexOf(current);
  if (i === -1 || current === "delivered") return []; // delivered / cancelled / unknown: admin only
  return [...FLOW.slice(i + 1), "cancelled"];
}

type Notify = (text: string, opts?: { error?: boolean }) => void;

// ── Order status ─────────────────────────────────────────────────────────────
export function OrderStatusControl({
  orderId,
  status,
  role,
  onChanged,
  notify,
}: {
  orderId: string;
  status: string;
  role: StaffRole;
  onChanged: (status: string) => void;
  notify: Notify;
}) {
  const [cancelling, setCancelling] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const options = nextStatuses(role, status);

  async function apply(next: string, why?: string) {
    setBusy(true);
    const { data, error } = await supabase.rpc("set_order_status", {
      p_order: orderId,
      p_status: next,
      p_reason: why?.trim() || null,
    });
    setBusy(false);
    const res = data as { ok?: boolean; status?: string } | null;
    if (error || !res?.ok) {
      notify(error?.message ?? "Couldn't change the order status.", { error: true });
      return;
    }
    setCancelling(false);
    setReason("");
    notify(`Order marked ${label(res.status ?? next)}`);
    onChanged(res.status ?? next);
  }

  return (
    <div className="flex flex-col gap-1.5" onClick={(e) => e.stopPropagation()}>
      <span
        title="Order status (changed by admin)"
        className={`w-fit text-xs font-medium px-2 py-1 rounded-full border ${STATUS_COLORS[status] ?? "bg-gray-50 text-gray-500 border-gray-200"}`}
      >
        {label(status)}
      </span>

      {options.length > 0 && !cancelling && (
        <select
          value=""
          disabled={busy}
          onChange={(e) => {
            const next = e.target.value;
            if (!next) return;
            if (next === "cancelled") setCancelling(true);
            else apply(next);
          }}
          className="w-fit max-w-[9.5rem] border border-gray-200 rounded-lg px-2 py-1 text-xs bg-white text-gray-600 focus:outline-none focus:border-[#1B4D2E] disabled:opacity-50"
          aria-label="Change order status"
        >
          <option value="">{busy ? "Saving…" : "Change to…"}</option>
          {options.map((s) => (
            <option key={s} value={s}>
              {label(s)}
            </option>
          ))}
        </select>
      )}

      {cancelling && (
        <div className="flex flex-col gap-1.5 rounded-lg border border-red-200 bg-red-50 p-2 w-56">
          <input
            autoFocus
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            dir="auto"
            placeholder="Reason (required)"
            className="w-full border border-red-200 rounded-md px-2 py-1 text-xs bg-white focus:outline-none focus:border-red-400"
          />
          <div className="flex gap-1.5">
            <button
              onClick={() => (reason.trim() ? apply("cancelled", reason) : notify("Please give a reason for cancelling.", { error: true }))}
              disabled={busy}
              className="inline-flex items-center gap-1 rounded-md bg-red-600 px-2 py-1 text-xs font-semibold text-white disabled:opacity-60"
            >
              {busy && <Loader2 size={11} className="animate-spin" />} Cancel order
            </button>
            <button
              onClick={() => {
                setCancelling(false);
                setReason("");
              }}
              disabled={busy}
              className="px-2 py-1 text-xs text-gray-600"
            >
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Payment (cash / credit only; Paymob updates itself) ──────────────────────
export function PaymentStatusControl({
  orderId,
  paymentMethod,
  paymentStatus,
  role,
  onChanged,
  notify,
}: {
  orderId: string;
  paymentMethod: string | null;
  paymentStatus: string | null;
  role: StaffRole;
  onChanged: (paymentStatus: string) => void;
  notify: Notify;
}) {
  const [mode, setMode] = useState<"pay" | "unpay" | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const method = (paymentMethod ?? "cash").toLowerCase();
  const paid = paymentStatus === "paid";
  const canChange = (role === "admin" || role === "accounts") && (method === "cash" || method === "credit");

  async function apply(markPaid: boolean) {
    setBusy(true);
    const { data, error } = await supabase.rpc("set_order_payment", {
      p_order: orderId,
      p_paid: markPaid,
      p_note: note.trim() || null,
    });
    setBusy(false);
    const res = data as { ok?: boolean; payment_status?: string } | null;
    if (error || !res?.ok) {
      notify(error?.message ?? "Couldn't change the payment status.", { error: true });
      return;
    }
    setMode(null);
    setNote("");
    notify(markPaid ? "Order marked Paid" : "Order marked Unpaid");
    onChanged(res.payment_status ?? (markPaid ? "paid" : "unpaid"));
  }

  if (!canChange) return null;

  return (
    <div onClick={(e) => e.stopPropagation()}>
      {mode === null ? (
        <button
          onClick={() => setMode(paid ? "unpay" : "pay")}
          className={`text-xs font-semibold rounded-md px-2 py-1 border ${
            paid ? "border-gray-200 text-gray-500 hover:text-red-600" : "border-[#1B4D2E] text-[#1B4D2E] hover:bg-[#1B4D2E] hover:text-white"
          }`}
        >
          {paid ? "Mark unpaid" : "Mark paid"}
        </button>
      ) : (
        <div className={`flex flex-col gap-1.5 rounded-lg border p-2 w-56 ${mode === "pay" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
          <p className="text-xs font-semibold text-[#111111]">{mode === "pay" ? "Mark this order paid?" : "Mark this order unpaid?"}</p>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            dir="auto"
            placeholder={mode === "pay" ? "Note (optional) – e.g. cash received by driver" : "Note (optional)"}
            className="w-full border border-gray-200 rounded-md px-2 py-1 text-xs bg-white focus:outline-none focus:border-[#1B4D2E]"
          />
          <div className="flex gap-1.5">
            <button
              onClick={() => apply(mode === "pay")}
              disabled={busy}
              className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-white disabled:opacity-60 ${
                mode === "pay" ? "bg-[#1B4D2E]" : "bg-red-600"
              }`}
            >
              {busy && <Loader2 size={11} className="animate-spin" />} {mode === "pay" ? "Mark paid" : "Mark unpaid"}
            </button>
            <button onClick={() => setMode(null)} disabled={busy} className="px-2 py-1 text-xs text-gray-600">
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── History ──────────────────────────────────────────────────────────────────
interface LogRow {
  id: number;
  field: string;
  old_value: string | null;
  new_value: string | null;
  reason: string | null;
  changed_by_name: string | null;
  changed_at: string;
}

function cairo(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Cairo",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(iso));
}

/** order_status_log for one order, newest first. `refreshKey` changes after each update. */
export function OrderHistory({ orderId, refreshKey }: { orderId: string; refreshKey: number }) {
  const [rows, setRows] = useState<LogRow[] | null>(null);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("order_status_log")
      .select("id, field, old_value, new_value, reason, changed_by_name, changed_at")
      .eq("order_id", orderId)
      .order("changed_at", { ascending: false });
    setRows((data as LogRow[]) ?? []);
  }, [orderId]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">History</h3>
      {rows === null ? (
        <Loader2 size={16} className="animate-spin text-gray-300" />
      ) : rows.length === 0 ? (
        <p className="text-sm text-gray-400">No changes yet.</p>
      ) : (
        <ol className="space-y-2">
          {rows.map((r) => (
            <li key={r.id} className="text-sm border-l-2 border-gray-200 pl-3">
              <p className="text-[#111111]">
                <span className="text-xs text-gray-400">{cairo(r.changed_at)}</span>{" "}
                · <span className="font-medium">{r.changed_by_name ?? "System"}</span>:{" "}
                {r.field === "payment_status" ? "Payment" : "Status"} {label(r.old_value)} → <span className="font-semibold">{label(r.new_value)}</span>
              </p>
              {r.reason && (
                <p className="text-xs text-gray-500 mt-0.5" dir="auto">
                  {r.reason}
                </p>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
