"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Search, Loader2, ChevronDown, ChevronUp, ShoppingBag } from "lucide-react";

interface CustomerOrder {
  id: string;
  created_at: string;
  total: number;
  status: string;
}

interface Customer {
  id: string;
  business_name: string;
  name: string;
  phone: string;
  email: string | null;
  address: string;
  created_at: string;
  orders?: CustomerOrder[];
  ordersLoaded?: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  pending:   "bg-amber-50 text-amber-700",
  confirmed: "bg-blue-50 text-blue-700",
  delivered: "bg-green-50 text-[#1B4D2E]",
  cancelled: "bg-red-50 text-red-600",
};

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading,   setLoad]      = useState(true);
  const [search,    setSearch]    = useState("");
  const [expanded,  setExpanded]  = useState<string | null>(null);
  const [loadingOrders, setLO]    = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoad(true);
    const { data } = await supabase
      .from("customers")
      .select("id, business_name, name, phone, email, address, created_at")
      .order("created_at", { ascending: false });
    setCustomers((data as Customer[]) ?? []);
    setLoad(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function toggleExpand(id: string) {
    if (expanded === id) { setExpanded(null); return; }
    setExpanded(id);
    const c = customers.find((c) => c.id === id);
    if (c?.ordersLoaded) return;
    setLO(id);
    const { data } = await supabase
      .from("orders")
      .select("id, created_at, total, status")
      .eq("customer_id", id)
      .order("created_at", { ascending: false });
    setCustomers((prev) => prev.map((c) =>
      c.id === id ? { ...c, orders: (data as CustomerOrder[]) ?? [], ordersLoaded: true } : c
    ));
    setLO(null);
  }

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    return !q || c.business_name?.toLowerCase().includes(q) || c.name?.toLowerCase().includes(q) || c.phone?.includes(q);
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#111111]">Customers</h1>
          <p className="text-gray-400 text-sm">{customers.length} registered customers</p>
        </div>
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text" placeholder="Search by name or phone…" value={search} onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-200 rounded-lg pl-8 pr-4 py-2 text-sm focus:outline-none focus:border-[#1B4D2E] bg-white w-56"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-gray-300" /></div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-16">No customers found.</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((c) => (
              <div key={c.id}>
                {/* Customer row */}
                <button
                  onClick={() => toggleExpand(c.id)}
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="w-9 h-9 rounded-full bg-[#E8F5E9] flex items-center justify-center flex-shrink-0 text-sm font-bold text-[#1B4D2E]">
                    {(c.business_name ?? "?")[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#111111] truncate">{c.business_name}</p>
                    <p className="text-xs text-gray-400 truncate">{c.name} · {c.phone}</p>
                  </div>
                  <div className="hidden sm:block text-right flex-shrink-0">
                    <p className="text-xs text-gray-400">{c.email ?? "—"}</p>
                    <p className="text-xs text-gray-300">{c.address}</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="text-xs text-gray-400">
                      {new Date(c.created_at).toLocaleDateString("en-EG", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <div className="text-gray-300 flex-shrink-0">
                    {expanded === c.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>

                {/* Orders expansion */}
                {expanded === c.id && (
                  <div className="bg-gray-50 border-t border-gray-100 px-5 py-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Order History</p>
                    {loadingOrders === c.id ? (
                      <div className="flex justify-center py-4"><Loader2 size={16} className="animate-spin text-gray-300" /></div>
                    ) : c.orders && c.orders.length > 0 ? (
                      <div className="space-y-2">
                        {c.orders.map((o) => (
                          <div key={o.id} className="flex items-center justify-between bg-white rounded-lg border border-gray-100 px-4 py-3">
                            <div>
                              <p className="text-xs font-mono text-gray-500">#{o.id.slice(0, 8).toUpperCase()}</p>
                              <p className="text-xs text-gray-400">
                                {new Date(o.created_at).toLocaleDateString("en-EG", { day: "numeric", month: "short", year: "numeric" })}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[o.status] ?? "bg-gray-100 text-gray-500"}`}>
                                {o.status}
                              </span>
                              <span className="text-sm font-bold text-[#111111]">EGP {(o.total ?? 0).toLocaleString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-400 text-sm py-2">
                        <ShoppingBag size={14} /> No orders yet
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
