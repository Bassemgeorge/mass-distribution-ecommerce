"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { ShoppingBag, ChevronDown, ChevronUp, Loader2, ArrowLeft } from "lucide-react";

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Order {
  id: string;
  created_at: string;
  total: number;
  status: string;
  notes?: string;
  order_items?: OrderItem[];
}

const STATUS_COLORS: Record<string, string> = {
  pending:    "bg-yellow-50 text-yellow-700 border-yellow-200",
  confirmed:  "bg-blue-50 text-blue-700 border-blue-200",
  processing: "bg-purple-50 text-purple-700 border-purple-200",
  shipped:    "bg-indigo-50 text-indigo-700 border-indigo-200",
  delivered:  "bg-green-50 text-[#1B4D2E] border-green-200",
  cancelled:  "bg-red-50 text-red-700 border-red-200",
};

const ALL_STATUSES = ["All", "pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

export default function OrdersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState("All");
  const [loadingItems, setLoadingItems] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/account/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("orders")
      .select("id, created_at, total, status, notes")
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setOrders((data as Order[]) ?? []);
        setOrdersLoading(false);
      });
  }, [user]);

  async function toggleExpand(orderId: string) {
    if (expanded === orderId) { setExpanded(null); return; }
    setExpanded(orderId);
    const order = orders.find((o) => o.id === orderId);
    if (order?.order_items) return;
    setLoadingItems(orderId);
    const { data } = await supabase
      .from("order_items")
      .select("id, product_name, quantity, unit_price, total_price")
      .eq("order_id", orderId);
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, order_items: (data as OrderItem[]) ?? [] } : o));
    setLoadingItems(null);
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#F7F7F5] flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-[#1B4D2E]" />
      </div>
    );
  }

  const filtered = filter === "All" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="min-h-screen bg-[#F7F7F5]">
      <div className="bg-[#111111] text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link href="/account/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-4 transition-colors">
            <ArrowLeft size={14} /> Dashboard
          </Link>
          <h1 className="text-2xl font-bold">Order History</h1>
          <p className="text-gray-400 text-sm mt-1" dir="rtl">سجل الطلبات</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Filter */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                filter === s
                  ? "bg-[#1B4D2E] text-white border-[#1B4D2E]"
                  : "bg-white text-gray-500 border-gray-200 hover:border-[#1B4D2E]"
              }`}
            >
              {s === "All" ? "All Orders" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* Orders */}
        {ordersLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={24} className="animate-spin text-[#1B4D2E]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 text-center py-16">
            <ShoppingBag size={32} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">{filter === "All" ? "No orders yet" : `No ${filter} orders`}</p>
            {filter === "All" && (
              <Link href="/products" className="mt-3 inline-block text-sm text-[#1B4D2E] hover:underline">Browse products →</Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((order) => (
              <div key={order.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* Order row */}
                <button
                  onClick={() => toggleExpand(order.id)}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-sm font-semibold text-[#111111]">#{order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(order.created_at).toLocaleDateString("en-EG", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_COLORS[order.status] ?? "bg-gray-50 text-gray-600 border-gray-200"}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-[#111111]">EGP {(order.total ?? 0).toLocaleString()}</span>
                    {expanded === order.id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                  </div>
                </button>

                {/* Expanded items */}
                {expanded === order.id && (
                  <div className="border-t border-gray-100 bg-gray-50">
                    {loadingItems === order.id ? (
                      <div className="flex justify-center py-6">
                        <Loader2 size={18} className="animate-spin text-gray-300" />
                      </div>
                    ) : (
                      <div className="px-6 py-4">
                        {order.order_items && order.order_items.length > 0 ? (
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-xs text-gray-400 border-b border-gray-200">
                                <th className="text-left pb-2 font-medium">Product</th>
                                <th className="text-right pb-2 font-medium">Qty</th>
                                <th className="text-right pb-2 font-medium">Unit Price</th>
                                <th className="text-right pb-2 font-medium">Total</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {order.order_items.map((item) => (
                                <tr key={item.id}>
                                  <td className="py-2.5 text-[#111111] font-medium pr-4">{item.product_name}</td>
                                  <td className="py-2.5 text-right text-gray-500">{item.quantity}</td>
                                  <td className="py-2.5 text-right text-gray-500">EGP {(item.unit_price ?? 0).toLocaleString()}</td>
                                  <td className="py-2.5 text-right font-semibold text-[#111111]">EGP {(item.total_price ?? 0).toLocaleString()}</td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot>
                              <tr className="border-t border-gray-200">
                                <td colSpan={3} className="pt-3 text-sm font-semibold text-[#111111]">Order Total</td>
                                <td className="pt-3 text-right text-sm font-bold text-[#1B4D2E]">EGP {(order.total ?? 0).toLocaleString()}</td>
                              </tr>
                            </tfoot>
                          </table>
                        ) : (
                          <p className="text-gray-400 text-sm text-center py-4">No items found</p>
                        )}
                        {order.notes && (
                          <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-200">
                            <span className="font-medium">Notes:</span> {order.notes}
                          </p>
                        )}
                        <div className="mt-4 flex justify-end">
                          <Link
                            href={`/order-confirmation/${order.id}`}
                            className="text-xs text-[#1B4D2E] hover:underline font-medium"
                          >
                            View full order →
                          </Link>
                        </div>
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
