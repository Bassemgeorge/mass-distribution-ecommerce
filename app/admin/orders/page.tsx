"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, RefreshCw, X, CheckCircle, XCircle, Eye } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  pending:    "bg-amber-50 text-amber-700 border-amber-200",
  confirmed:  "bg-blue-50 text-blue-700 border-blue-200",
  processing: "bg-purple-50 text-purple-700 border-purple-200",
  shipped:    "bg-indigo-50 text-indigo-700 border-indigo-200",
  delivered:  "bg-green-50 text-[#1B4D2E] border-green-200",
  cancelled:  "bg-red-50 text-red-700 border-red-200",
};

const FILTERS = ["All", "pending", "confirmed", "delivered", "cancelled"];

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

interface AdminOrder {
  id: string;
  created_at: string;
  total: number;
  status: string;
  notes: string | null;
  customer_id: string;
  customers: { business_name: string; name: string; phone: string; address: string } | null;
  items?: OrderItem[];
}

export default function AdminOrdersPage() {
  const [orders,  setOrders]  = useState<AdminOrder[]>([]);
  const [loading, setLoad]    = useState(true);
  const [filter,  setFilter]  = useState("All");
  const [modal,   setModal]   = useState<AdminOrder | null>(null);
  const [modalLoading, setML] = useState(false);
  const [updating, setUpd]    = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoad(true);
    const { data } = await supabase
      .from("orders")
      .select("id, created_at, total, status, notes, customer_id, customers(business_name, name, phone, address)")
      .order("created_at", { ascending: false });
    setOrders((data as unknown as AdminOrder[]) ?? []);
    setLoad(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function updateStatus(id: string, status: string) {
    setUpd(id);
    await supabase.from("orders").update({ status }).eq("id", id);
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o));
    if (modal?.id === id) setModal((m) => m ? { ...m, status } : null);
    setUpd(null);
  }

  async function openModal(order: AdminOrder) {
    setModal(order);
    if (order.items) return;
    setML(true);
    const { data } = await supabase
      .from("order_items")
      .select("id, product_name, quantity, unit_price, subtotal")
      .eq("order_id", order.id);
    const items = (data as OrderItem[]) ?? [];
    setOrders((prev) => prev.map((o) => o.id === order.id ? { ...o, items } : o));
    setModal((m) => m ? { ...m, items } : null);
    setML(false);
  }

  const filtered = filter === "All" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#111111]">Orders</h1>
          <p className="text-gray-400 text-sm">{orders.length} total orders</p>
        </div>
        <button onClick={load} disabled={loading} className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1B4D2E] transition-colors">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              filter === f ? "bg-[#111111] text-white border-[#111111]" : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
            }`}
          >
            {f === "All" ? `All (${orders.length})` : `${f.charAt(0).toUpperCase() + f.slice(1)} (${orders.filter((o) => o.status === f).length})`}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={24} className="animate-spin text-gray-300" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-16">No orders in this category.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["Order #", "Customer", "Date", "Total", "Status", "Actions"].map((h) => (
                    <th key={h} className={`px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide ${h === "Total" || h === "Actions" ? "text-right" : "text-left"} ${h === "Date" ? "hidden sm:table-cell" : ""}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">#{o.id.slice(0, 8).toUpperCase()}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-[#111111] leading-tight">{o.customers?.business_name ?? "—"}</p>
                      <p className="text-xs text-gray-400">{o.customers?.name}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 hidden sm:table-cell whitespace-nowrap">
                      {new Date(o.created_at).toLocaleDateString("en-EG", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-[#111111]">EGP {(o.total ?? 0).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full border ${STATUS_COLORS[o.status] ?? "bg-gray-50 text-gray-500 border-gray-200"}`}>
                        {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        {o.status === "pending" && (
                          <>
                            <button
                              onClick={() => updateStatus(o.id, "confirmed")}
                              disabled={updating === o.id}
                              className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1"
                            >
                              <CheckCircle size={11} /> Confirm
                            </button>
                            <button
                              onClick={() => updateStatus(o.id, "cancelled")}
                              disabled={updating === o.id}
                              className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1"
                            >
                              <XCircle size={11} /> Cancel
                            </button>
                          </>
                        )}
                        {o.status === "confirmed" && (
                          <button
                            onClick={() => updateStatus(o.id, "delivered")}
                            disabled={updating === o.id}
                            className="text-xs px-2 py-1 bg-green-50 text-[#1B4D2E] rounded-lg hover:bg-green-100 transition-colors flex items-center gap-1"
                          >
                            <CheckCircle size={11} /> Delivered
                          </button>
                        )}
                        <button
                          onClick={() => openModal(o)}
                          className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1"
                        >
                          <Eye size={11} /> View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order detail modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
              <div>
                <h2 className="font-bold text-[#111111]">Order #{modal.id.slice(0, 8).toUpperCase()}</h2>
                <p className="text-xs text-gray-400">{new Date(modal.created_at).toLocaleDateString("en-EG", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_COLORS[modal.status] ?? "bg-gray-50 text-gray-600 border-gray-200"}`}>
                  {modal.status.charAt(0).toUpperCase() + modal.status.slice(1)}
                </span>
                <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600">
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer */}
              {modal.customers && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Customer Details</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><p className="text-xs text-gray-400">Business</p><p className="font-semibold">{modal.customers.business_name}</p></div>
                    <div><p className="text-xs text-gray-400">Contact</p><p className="font-semibold">{modal.customers.name}</p></div>
                    <div><p className="text-xs text-gray-400">Phone</p><p className="font-semibold">{modal.customers.phone}</p></div>
                    <div><p className="text-xs text-gray-400">Address</p><p className="font-semibold">{modal.customers.address}</p></div>
                  </div>
                </div>
              )}

              {/* Items */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Order Items</h3>
                {modalLoading ? (
                  <div className="flex justify-center py-6"><Loader2 size={18} className="animate-spin text-gray-300" /></div>
                ) : modal.items && modal.items.length > 0 ? (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 text-xs text-gray-400">
                        <th className="text-left pb-2 font-medium">Product</th>
                        <th className="text-right pb-2 font-medium">Qty</th>
                        <th className="text-right pb-2 font-medium">Unit</th>
                        <th className="text-right pb-2 font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {modal.items.map((item) => (
                        <tr key={item.id}>
                          <td className="py-2.5 font-medium text-[#111111] pr-4">{item.product_name}</td>
                          <td className="py-2.5 text-right text-gray-500">{item.quantity}</td>
                          <td className="py-2.5 text-right text-gray-500">EGP {(item.unit_price ?? 0).toLocaleString()}</td>
                          <td className="py-2.5 text-right font-bold">EGP {(item.subtotal ?? 0).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-gray-200">
                        <td colSpan={3} className="pt-3 font-semibold text-sm">Order Total</td>
                        <td className="pt-3 text-right font-bold text-[#1B4D2E]">EGP {(modal.total ?? 0).toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  </table>
                ) : (
                  <p className="text-gray-400 text-sm">No items found.</p>
                )}
              </div>

              {/* Notes */}
              {modal.notes && (
                <div className="bg-amber-50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-amber-700 mb-1">Notes / Delivery Instructions</p>
                  <p className="text-sm text-amber-800">{modal.notes}</p>
                </div>
              )}

              {/* Status actions */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Update Status</h3>
                <div className="flex flex-wrap gap-2">
                  {["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"].map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(modal.id, s)}
                      disabled={modal.status === s || updating === modal.id}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors disabled:opacity-40 ${
                        modal.status === s
                          ? `${STATUS_COLORS[s]} opacity-100`
                          : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
