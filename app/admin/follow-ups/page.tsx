"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, RefreshCw, Search } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { formatEGP } from "@/lib/db";
import { cairoDate, formatDate, orderTotalInclVat, timeAgo } from "@/lib/followups";
import {
  ContactButtons,
  CustomerDrawer,
  FollowUpBadge,
  FollowUpTarget,
  LogFollowUpButton,
  LogFollowUpModal,
  useToast,
} from "@/components/admin/FollowUpUI";

interface QueueCustomer {
  id: string;
  business_name: string | null;
  name: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
  follow_up_status: string | null;
  follow_up_note: string | null;
  next_follow_up_date: string | null;
  follow_up_updated_at: string | null;
  follow_up_updated_by: string | null;
  orderCount: number;
  totalSpent: number;
}

const TABS = [
  { key: "to_call", label: "To call" },
  { key: "callbacks", label: "Call backs" },
  { key: "contacted", label: "Contacted" },
  { key: "ordered", label: "Ordered" },
  { key: "not_interested", label: "Not interested" },
  { key: "all", label: "All" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function statusOf(c: QueueCustomer) {
  return c.follow_up_status ?? "new";
}

function inTab(c: QueueCustomer, tab: TabKey, today: string) {
  const s = statusOf(c);
  if (s === "internal") return false;
  switch (tab) {
    case "to_call":
      return s === "new" || (s === "call_back" && !!c.next_follow_up_date && c.next_follow_up_date <= today);
    case "callbacks":
      return s === "call_back";
    case "all":
      return true;
    default:
      return s === tab;
  }
}

function sortForTab(list: QueueCustomer[], tab: TabKey) {
  const byDate = (a: string | null, b: string | null) => (a ?? "9999").localeCompare(b ?? "9999");
  if (tab === "to_call") {
    // Due call-backs first (earliest date), then new sign-ups oldest first
    return [...list].sort((a, b) => {
      const aCb = statusOf(a) === "call_back" ? 0 : 1;
      const bCb = statusOf(b) === "call_back" ? 0 : 1;
      if (aCb !== bCb) return aCb - bCb;
      return aCb === 0 ? byDate(a.next_follow_up_date, b.next_follow_up_date) : a.created_at.localeCompare(b.created_at);
    });
  }
  if (tab === "callbacks") return [...list].sort((a, b) => byDate(a.next_follow_up_date, b.next_follow_up_date));
  return [...list].sort((a, b) => (b.follow_up_updated_at ?? b.created_at).localeCompare(a.follow_up_updated_at ?? a.created_at));
}

function FollowUpsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const tab: TabKey = TABS.some((t) => t.key === tabParam) ? (tabParam as TabKey) : "to_call";

  const [customers, setCustomers] = useState<QueueCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const [logging, setLogging] = useState<FollowUpTarget | null>(null);
  const { toast, showToast } = useToast();

  const today = cairoDate();

  const load = useCallback(async () => {
    setError(null);
    const [cRes, oRes] = await Promise.all([
      supabase
        .from("customers")
        .select(
          "id, business_name, name, phone, address, created_at, follow_up_status, follow_up_note, next_follow_up_date, follow_up_updated_at, follow_up_updated_by"
        ),
      supabase.from("orders").select("customer_id, total, total_incl_vat, vat_amount, status"),
    ]);

    if (cRes.error || oRes.error) {
      setError((cRes.error ?? oRes.error)!.message);
      setLoading(false);
      return;
    }

    const stats = new Map<string, { count: number; total: number }>();
    (oRes.data ?? []).forEach((o) => {
      if (o.status === "cancelled" || !o.customer_id) return;
      const s = stats.get(o.customer_id) ?? { count: 0, total: 0 };
      s.count += 1;
      s.total += orderTotalInclVat(o);
      stats.set(o.customer_id, s);
    });

    setCustomers(
      (cRes.data ?? []).map((c) => ({
        ...(c as Omit<QueueCustomer, "orderCount" | "totalSpent">),
        orderCount: stats.get(c.id)?.count ?? 0,
        totalSpent: stats.get(c.id)?.total ?? 0,
      }))
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const counts = useMemo(() => {
    const out = {} as Record<TabKey, number>;
    TABS.forEach((t) => (out[t.key] = customers.filter((c) => inTab(c, t.key, today)).length));
    return out;
  }, [customers, today]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const qDigits = q.replace(/\D/g, "");
    const list = customers.filter((c) => {
      if (!inTab(c, tab, today)) return false;
      if (!q) return true;
      return (
        c.business_name?.toLowerCase().includes(q) ||
        c.name?.toLowerCase().includes(q) ||
        (qDigits.length > 0 && (c.phone ?? "").replace(/\D/g, "").includes(qDigits))
      );
    });
    return sortForTab(list, tab);
  }, [customers, tab, today, search]);

  function setTab(key: TabKey) {
    router.replace(key === "to_call" ? "/admin/follow-ups" : `/admin/follow-ups?tab=${key}`, { scroll: false });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#111111]">Follow-ups</h1>
          <p className="text-gray-400 text-sm">Customers to call, call back and keep warm</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Business, name or phone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              dir="auto"
              className="border border-gray-200 rounded-lg pl-8 pr-4 py-2 text-sm focus:outline-none focus:border-[#1B4D2E] bg-white w-60"
            />
          </div>
          <button
            onClick={() => {
              setLoading(true);
              load();
            }}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1B4D2E] px-2"
            aria-label="Refresh"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              tab === t.key ? "bg-[#111111] text-white border-[#111111]" : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
            }`}
          >
            {t.label} ({loading ? "…" : counts[t.key]})
          </button>
        ))}
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={24} className="animate-spin text-gray-300" />
          </div>
        ) : rows.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-16">Nothing here right now.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {rows.map((c) => {
              const overdue = statusOf(c) === "call_back" && c.next_follow_up_date && c.next_follow_up_date < today;
              return (
                <li
                  key={c.id}
                  onClick={() => setDrawerId(c.id)}
                  className="px-5 py-4 hover:bg-gray-50 cursor-pointer transition-colors grid gap-3 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_auto] lg:items-center"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-[#111111] truncate" dir="auto">
                        {c.business_name || "—"}
                      </p>
                      <FollowUpBadge status={c.follow_up_status} />
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      <span dir="auto">{c.name || "—"}</span> · <span dir="ltr">{c.phone || "no phone"}</span>
                    </p>
                    <p className="text-xs text-gray-400 truncate" dir="auto">
                      {c.address || "—"}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Registered {timeAgo(c.created_at)} ·{" "}
                      {c.orderCount === 0 ? "no orders" : `${c.orderCount} order${c.orderCount === 1 ? "" : "s"} · ${formatEGP(c.totalSpent)}`}
                    </p>
                  </div>

                  <div className="min-w-0 text-xs">
                    {statusOf(c) === "call_back" && c.next_follow_up_date && (
                      <p className={`font-semibold mb-0.5 ${overdue ? "text-red-600" : "text-amber-700"}`}>
                        Call back {formatDate(c.next_follow_up_date)}
                        {overdue ? " (overdue)" : ""}
                      </p>
                    )}
                    {c.follow_up_updated_at ? (
                      <>
                        {c.follow_up_note && (
                          <p className="text-gray-700 line-clamp-2" dir="auto">
                            {c.follow_up_note}
                          </p>
                        )}
                        <p className="text-gray-400">
                          {c.follow_up_updated_by ?? "Someone"} · {timeAgo(c.follow_up_updated_at)}
                        </p>
                      </>
                    ) : (
                      <p className="text-gray-400">No follow-up yet</p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 lg:justify-end">
                    <ContactButtons phone={c.phone} name={c.name} compact />
                    <LogFollowUpButton onClick={() => setLogging(c)} label="Log" />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {drawerId && <CustomerDrawer customerId={drawerId} onClose={() => setDrawerId(null)} onChanged={load} />}

      {logging && (
        <LogFollowUpModal
          customer={logging}
          onClose={() => setLogging(null)}
          onSaved={() => {
            setLogging(null);
            showToast("Follow-up saved");
            load();
          }}
        />
      )}
      {toast}
    </div>
  );
}

export default function FollowUpsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-16">
          <Loader2 size={24} className="animate-spin text-gray-300" />
        </div>
      }
    >
      <FollowUpsContent />
    </Suspense>
  );
}
