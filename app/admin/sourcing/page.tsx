"use client";

import { useCallback, useEffect, useState } from "react";
import { ExternalLink, Loader2, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { OPEN_STATUSES, STAFF_STATUS_LABEL, formatCairo, kindLabel } from "@/lib/sourcing";

// Read-only overview. Costs/suppliers live in an admin-only table and are deliberately not queried here.
interface Row {
  id: string;
  ref: string;
  created_at: string;
  kind: string;
  status: string;
  handler: string | null;
  due_at: string | null;
  order_id: string | null;
  customers: { business_name: string | null; name: string | null } | null;
}

const FILTERS = ["all", "open", ...Object.keys(STAFF_STATUS_LABEL)];

const STATUS_COLORS: Record<string, string> = {
  received: "bg-gray-100 text-gray-700",
  sourcing: "bg-blue-50 text-blue-700",
  pending_approval: "bg-amber-50 text-amber-800",
  quoted: "bg-[#177A41]/10 text-[#177A41]",
  accepted: "bg-[#1B4D2E] text-white",
  declined: "bg-gray-100 text-gray-500",
  expired: "bg-amber-50 text-amber-700",
  unavailable: "bg-red-50 text-red-700",
  cancelled: "bg-gray-100 text-gray-500",
};

export default function AdminSourcingPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("open");

  const load = useCallback(async () => {
    setError(null);
    const { data, error: err } = await supabase
      .from("sourcing_requests")
      .select("id, ref, created_at, kind, status, handler, due_at, order_id, customers(business_name, name)")
      .order("created_at", { ascending: false });
    if (err) setError(err.message);
    setRows((data as unknown as Row[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const visible = rows.filter((r) =>
    filter === "all" ? true : filter === "open" ? OPEN_STATUSES.includes(r.status) : r.status === filter
  );
  const count = (f: string) =>
    f === "all" ? rows.length : f === "open" ? rows.filter((r) => OPEN_STATUSES.includes(r.status)).length : rows.filter((r) => r.status === f).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#111111]">Sourcing Desk</h1>
          <p className="text-gray-400 text-sm">Item requests and &quot;beat my invoice&quot; quotes · مكتب التوريد</p>
        </div>
        <button
          onClick={() => {
            setLoading(true);
            load();
          }}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1B4D2E]"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>}

      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border ${
              filter === f ? "bg-[#111111] text-white border-[#111111]" : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
            }`}
          >
            {f === "all" ? "All" : f === "open" ? "Open" : STAFF_STATUS_LABEL[f]} ({count(f)})
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={24} className="animate-spin text-gray-300" />
          </div>
        ) : visible.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-16">No requests here.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  <th className="text-left px-4 py-3">Ref</th>
                  <th className="text-left px-4 py-3">Created</th>
                  <th className="text-left px-4 py-3">Customer</th>
                  <th className="text-left px-4 py-3">Type</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Handler</th>
                  <th className="text-left px-4 py-3">Due</th>
                  <th className="text-left px-4 py-3">Order</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {visible.map((r) => {
                  const overdue = OPEN_STATUSES.includes(r.status) && !!r.due_at && new Date(r.due_at).getTime() < Date.now();
                  return (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs font-semibold">{r.ref}</td>
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatCairo(r.created_at)}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-[#111111]" dir="auto">
                          {r.customers?.business_name ?? "—"}
                        </p>
                        <p className="text-xs text-gray-400" dir="auto">
                          {r.customers?.name}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{kindLabel(r.kind).en}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${STATUS_COLORS[r.status] ?? "bg-gray-100"}`}>
                          {STAFF_STATUS_LABEL[r.status] ?? r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">{r.handler ?? "—"}</td>
                      <td className={`px-4 py-3 text-xs whitespace-nowrap ${overdue ? "text-red-600 font-semibold" : "text-gray-500"}`}>
                        {formatCairo(r.due_at)}
                        {overdue ? " · overdue" : ""}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {r.order_id ? (
                          <a
                            href={`/order-confirmation/${r.order_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-mono text-[#1B4D2E] hover:underline"
                          >
                            #{r.order_id.slice(0, 8).toUpperCase()} <ExternalLink size={11} />
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
