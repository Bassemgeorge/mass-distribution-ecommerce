"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatEGP } from "@/lib/db";
import {
  CHANNEL_LABELS,
  FOLLOW_UP_COLORS,
  FOLLOW_UP_LABELS,
  FollowUpChannel,
  cairoDate,
  formatDate,
  orderTotalInclVat,
  telLink,
  timeAgo,
  whatsappLink,
} from "@/lib/followups";
import { CheckCircle, ClipboardList, Loader2, MessageCircle, Phone, X } from "lucide-react";

// ── Badge ────────────────────────────────────────────────────────────────────
export function FollowUpBadge({ status }: { status: string | null | undefined }) {
  const s = status ?? "new";
  if (s === "internal") return null;
  return (
    <span
      className={`inline-flex whitespace-nowrap text-xs font-medium px-2 py-0.5 rounded-full border ${
        FOLLOW_UP_COLORS[s] ?? FOLLOW_UP_COLORS.new
      }`}
    >
      {FOLLOW_UP_LABELS[s] ?? s}
    </span>
  );
}

// ── WhatsApp / Call ──────────────────────────────────────────────────────────
export function ContactButtons({ phone, name, compact = false }: { phone: string | null; name: string | null; compact?: boolean }) {
  const wa = whatsappLink(phone, name);
  const tel = telLink(phone);
  if (!wa && !tel) return null;
  const base = `inline-flex items-center gap-1 rounded-lg text-xs font-semibold transition-colors ${compact ? "px-2 py-1" : "px-2.5 py-1.5"}`;
  return (
    <span className="inline-flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
      {wa && (
        <a href={wa} target="_blank" rel="noopener noreferrer" className={`${base} bg-[#25D366]/10 text-[#128C4A] hover:bg-[#25D366]/20`}>
          <MessageCircle size={13} /> WhatsApp
        </a>
      )}
      {tel && (
        <a href={tel} className={`${base} bg-gray-100 text-gray-700 hover:bg-gray-200`}>
          <Phone size={13} /> Call
        </a>
      )}
    </span>
  );
}

// ── Toast ────────────────────────────────────────────────────────────────────
export function useToast() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!message) return;
    const t = window.setTimeout(() => setMessage(null), 3000);
    return () => window.clearTimeout(t);
  }, [message]);

  const toast = message ? (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[70] flex items-center gap-2 bg-[#111111] text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg">
      <CheckCircle size={15} className="text-[#3AE18B]" /> {message}
    </div>
  ) : null;

  return { toast, showToast: setMessage };
}

// ── Log follow-up modal ──────────────────────────────────────────────────────
const RESULTS = ["contacted", "call_back", "ordered", "not_interested"] as const;
type Result = (typeof RESULTS)[number];

interface OrderOption {
  id: string;
  created_at: string;
  total: number | null;
  total_incl_vat?: number | null;
  vat_amount?: number | null;
}

export interface FollowUpTarget {
  id: string;
  business_name: string | null;
  name: string | null;
}

export function LogFollowUpModal({
  customer,
  defaultOrderId = null,
  onClose,
  onSaved,
}: {
  customer: FollowUpTarget;
  defaultOrderId?: string | null;
  onClose: () => void;
  onSaved: (status: Result) => void;
}) {
  const [result, setResult] = useState<Result>("contacted");
  const [channel, setChannel] = useState<FollowUpChannel>("call");
  const [note, setNote] = useState("");
  const [nextDate, setNextDate] = useState(cairoDate(1));
  const [orderId, setOrderId] = useState<string>(defaultOrderId ?? "");
  const [orders, setOrders] = useState<OrderOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("orders")
      .select("id, created_at, total, total_incl_vat, vat_amount")
      .eq("customer_id", customer.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setOrders((data as OrderOption[]) ?? []));
  }, [customer.id]);

  async function save() {
    setError(null);
    if (result === "not_interested" && !note.trim()) {
      setError("Please add a note explaining why they're not interested.");
      return;
    }
    if (result === "call_back" && !nextDate) {
      setError("Please pick the next follow-up date.");
      return;
    }

    setSaving(true);
    const { data: userData } = await supabase.auth.getUser();
    const { error: insertError } = await supabase.from("customer_followups").insert({
      customer_id: customer.id,
      order_id: orderId || null,
      status: result,
      channel,
      note: note.trim() || null,
      next_follow_up_date: result === "call_back" ? nextDate : null,
      created_by: userData.user?.id,
    });
    setSaving(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }
    onSaved(result);
  }

  const field = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#1B4D2E]";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between px-5 py-4 border-b border-gray-100">
          <div className="min-w-0">
            <h2 className="font-bold text-[#111111]">Log follow-up</h2>
            <p className="text-xs text-gray-400 truncate" dir="auto">
              {customer.business_name ?? "—"} · {customer.name ?? ""}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1.5">Result</p>
            <div className="grid grid-cols-2 gap-2">
              {RESULTS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setResult(r)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    result === r ? "bg-[#1B4D2E] text-white border-[#1B4D2E]" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                  }`}
                >
                  {FOLLOW_UP_LABELS[r]}
                </button>
              ))}
            </div>
          </div>

          <label className="block">
            <span className="block text-xs font-semibold text-gray-500 mb-1.5">Channel</span>
            <select value={channel} onChange={(e) => setChannel(e.target.value as FollowUpChannel)} className={field}>
              {(Object.keys(CHANNEL_LABELS) as FollowUpChannel[]).map((c) => (
                <option key={c} value={c}>
                  {CHANNEL_LABELS[c]}
                </option>
              ))}
            </select>
          </label>

          {result === "call_back" && (
            <label className="block">
              <span className="block text-xs font-semibold text-gray-500 mb-1.5">Next follow-up date *</span>
              <input type="date" value={nextDate} min={cairoDate(0)} onChange={(e) => setNextDate(e.target.value)} className={field} required />
            </label>
          )}

          <label className="block">
            <span className="block text-xs font-semibold text-gray-500 mb-1.5">
              Note{result === "not_interested" ? " *" : ""}
            </span>
            <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} dir="auto" className={`${field} resize-none`} />
          </label>

          {orders.length > 0 && (
            <label className="block">
              <span className="block text-xs font-semibold text-gray-500 mb-1.5">Related order (optional)</span>
              <select value={orderId} onChange={(e) => setOrderId(e.target.value)} className={field}>
                <option value="">None</option>
                {orders.map((o) => (
                  <option key={o.id} value={o.id}>
                    #{o.id.slice(0, 8).toUpperCase()} · {formatDate(o.created_at)} · {formatEGP(orderTotalInclVat(o))}
                  </option>
                ))}
              </select>
            </label>
          )}

          {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100">
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-[#1B4D2E] text-white hover:bg-[#163d24] disabled:opacity-60"
          >
            {saving && <Loader2 size={14} className="animate-spin" />} Save
          </button>
        </div>
      </div>
    </div>
  );
}

export function LogFollowUpButton({ onClick, label = "Log follow-up" }: { onClick: () => void; label?: string }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#1B4D2E]/10 text-[#1B4D2E] hover:bg-[#1B4D2E]/20 transition-colors whitespace-nowrap"
    >
      <ClipboardList size={13} /> {label}
    </button>
  );
}

// ── Customer drawer ──────────────────────────────────────────────────────────
interface DrawerCustomer {
  id: string;
  business_name: string | null;
  name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  created_at: string;
  follow_up_status: string | null;
  next_follow_up_date: string | null;
}

interface DrawerOrder extends OrderOption {
  status: string;
}

interface FollowUpRow {
  id: number;
  created_at: string;
  status: string;
  channel: string | null;
  note: string | null;
  next_follow_up_date: string | null;
  created_by_name: string | null;
  order_id: string | null;
}

export function CustomerDrawer({
  customerId,
  onClose,
  onChanged,
}: {
  customerId: string;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [customer, setCustomer] = useState<DrawerCustomer | null>(null);
  const [orders, setOrders] = useState<DrawerOrder[]>([]);
  const [history, setHistory] = useState<FollowUpRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [logging, setLogging] = useState(false);
  const { toast, showToast } = useToast();

  const load = useCallback(async () => {
    const [c, o, h] = await Promise.all([
      supabase
        .from("customers")
        .select("id, business_name, name, phone, email, address, created_at, follow_up_status, next_follow_up_date")
        .eq("id", customerId)
        .single(),
      supabase
        .from("orders")
        .select("id, created_at, total, total_incl_vat, vat_amount, status")
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false }),
      supabase
        .from("customer_followups")
        .select("id, created_at, status, channel, note, next_follow_up_date, created_by_name, order_id")
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false }),
    ]);
    setCustomer((c.data as DrawerCustomer) ?? null);
    setOrders((o.data as DrawerOrder[]) ?? []);
    setHistory((h.data as FollowUpRow[]) ?? []);
    setLoading(false);
  }, [customerId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={onClose}>
      <aside className="w-full max-w-lg h-full bg-white shadow-xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-start justify-between gap-3 z-10">
          <div className="min-w-0">
            <h2 className="font-bold text-[#111111] truncate" dir="auto">
              {customer?.business_name ?? "Customer"}
            </h2>
            {customer && (
              <div className="mt-1">
                <FollowUpBadge status={customer.follow_up_status} />
              </div>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {loading || !customer ? (
          <div className="flex justify-center py-16">
            <Loader2 size={20} className="animate-spin text-gray-300" />
          </div>
        ) : (
          <div className="p-5 space-y-6">
            <section className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
              <Detail label="Contact" value={customer.name} />
              <Detail label="Phone" value={customer.phone} />
              <Detail label="Email" value={customer.email} />
              <Detail label="Address" value={customer.address} />
              <Detail label="Registered" value={`${formatDate(customer.created_at)} (${timeAgo(customer.created_at)})`} />
              {customer.follow_up_status === "call_back" && customer.next_follow_up_date && (
                <Detail label="Call back on" value={formatDate(customer.next_follow_up_date)} />
              )}
              <div className="flex flex-wrap gap-2 pt-2">
                <ContactButtons phone={customer.phone} name={customer.name} />
                <LogFollowUpButton onClick={() => setLogging(true)} />
              </div>
            </section>

            <section>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Orders ({orders.length})</h3>
              {orders.length === 0 ? (
                <p className="text-sm text-gray-400">No orders yet.</p>
              ) : (
                <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl">
                  {orders.map((o) => (
                    <div key={o.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                      <div>
                        <p className="font-mono text-xs text-gray-500">#{o.id.slice(0, 8).toUpperCase()}</p>
                        <p className="text-xs text-gray-400">{formatDate(o.created_at)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatEGP(orderTotalInclVat(o))}</p>
                        <p className="text-xs text-gray-400 capitalize">{o.status.replace(/_/g, " ")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Follow-up history</h3>
              {history.length === 0 ? (
                <p className="text-sm text-gray-400">No follow-ups logged yet.</p>
              ) : (
                <ol className="space-y-3">
                  {history.map((h) => (
                    <li key={h.id} className="border border-gray-100 rounded-xl px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
                        <span>{new Date(h.created_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</span>
                        <FollowUpBadge status={h.status} />
                        {h.channel && <span>{CHANNEL_LABELS[h.channel as FollowUpChannel] ?? h.channel}</span>}
                        {h.created_by_name && <span>· by {h.created_by_name}</span>}
                      </div>
                      {h.note && (
                        <p className="text-sm text-[#111111] mt-1.5 whitespace-pre-line" dir="auto">
                          {h.note}
                        </p>
                      )}
                      {(h.next_follow_up_date || h.order_id) && (
                        <p className="text-xs text-gray-400 mt-1">
                          {h.next_follow_up_date && <>Next: {formatDate(h.next_follow_up_date)} </>}
                          {h.order_id && <>· Order #{h.order_id.slice(0, 8).toUpperCase()}</>}
                        </p>
                      )}
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </div>
        )}
      </aside>
    </div>

      {logging && customer && (
        <LogFollowUpModal
          customer={customer}
          onClose={() => setLogging(false)}
          onSaved={() => {
            setLogging(false);
            showToast("Follow-up saved");
            load();
            onChanged();
          }}
        />
      )}
      {toast}
    </>
  );
}

function Detail({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex gap-3">
      <span className="w-24 flex-shrink-0 text-xs text-gray-400 pt-0.5">{label}</span>
      <span className="text-[#111111] min-w-0 break-words" dir="auto">
        {value || "—"}
      </span>
    </div>
  );
}
