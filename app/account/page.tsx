"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { DbOrder } from "@/lib/database.types";
import { User, Package, MapPin, Bell, LogOut, ChevronRight, ShoppingBag, Loader2, AlertCircle } from "lucide-react";

const tabs = ["Overview", "Orders", "Addresses", "Notifications"] as const;
type Tab = typeof tabs[number];

const statusColor: Record<string, string> = {
  delivered:  "bg-green-50 text-green-700 border-green-200",
  confirmed:  "bg-blue-50 text-blue-700 border-blue-200",
  processing: "bg-yellow-50 text-yellow-700 border-yellow-200",
  pending:    "bg-gray-100 text-gray-600 border-gray-200",
  cancelled:  "bg-red-50 text-red-700 border-red-200",
};

function fmt(date: string) {
  return new Date(date).toLocaleDateString("en-EG", { day: "numeric", month: "short", year: "numeric" });
}

export default function AccountPage() {
  const [activeTab, setActiveTab]   = useState<Tab>("Overview");
  const [orders, setOrders]         = useState<DbOrder[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    if (err) setError(err.message);
    else setOrders(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const totalSpent = orders.reduce((s, o) => s + Number(o.total_amount), 0);
  const lastOrder  = orders[0];

  return (
    <div className="min-h-screen bg-[#F7F7F5]">
      {/* Header */}
      <div className="bg-[#1B4D2E] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
              <User size={26} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">My Account</h1>
              <p className="text-white/70 text-sm">HORECA Customer Portal</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab
                    ? "bg-white text-[#1B4D2E]"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ── OVERVIEW ─────────────────────────────────────────────── */}
        {activeTab === "Overview" && (
          <div className="space-y-5">
            {loading ? (
              <div className="flex items-center gap-2 text-gray-400 py-8">
                <Loader2 size={18} className="animate-spin" /> Loading your account…
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 flex items-center gap-2 text-sm">
                <AlertCircle size={16} /> {error}
              </div>
            ) : (
              <>
                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: "Total Orders",   value: orders.length.toString(),                         sub: "lifetime" },
                    { label: "Total Spent",    value: `EGP ${totalSpent.toLocaleString("en-EG", { maximumFractionDigits: 0 })}`, sub: "ex-VAT" },
                    { label: "Last Order",     value: lastOrder ? fmt(lastOrder.created_at) : "—",      sub: lastOrder?.order_number ?? "" },
                    { label: "Pending Orders", value: orders.filter(o => o.status === "pending").toString(), sub: "awaiting confirmation" },
                  ].map(({ label, value, sub }) => (
                    <div key={label} className="bg-white rounded-xl p-4 border border-gray-200">
                      <p className="text-xs text-gray-400 mb-1">{label}</p>
                      <p className="font-bold text-[#111111] text-sm leading-tight">{value}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
                    </div>
                  ))}
                </div>

                {/* Quick actions */}
                <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                  {[
                    { icon: ShoppingBag, label: "Browse Products",  href: "/products", desc: "237 products available" },
                    { icon: Package,     label: "View All Orders",  href: "#",          desc: `${orders.length} orders total` },
                    { icon: MapPin,      label: "Manage Addresses", href: "#",          desc: "Saved delivery addresses" },
                  ].map(({ icon: Icon, label, href, desc }) => (
                    <Link key={label} href={href} className="flex items-center gap-4 px-5 py-4 hover:bg-[#F7F7F5] transition-colors group">
                      <div className="w-9 h-9 bg-[#1B4D2E]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon size={16} className="text-[#1B4D2E]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[#111111]">{label}</p>
                        <p className="text-xs text-gray-400">{desc}</p>
                      </div>
                      <ChevronRight size={16} className="text-gray-300 group-hover:text-[#1B4D2E] transition-colors" />
                    </Link>
                  ))}
                </div>

                {/* Recent orders */}
                {orders.length > 0 && (
                  <div>
                    <h2 className="text-sm font-semibold text-[#111111] mb-3">Recent Orders</h2>
                    <div className="space-y-2">
                      {orders.slice(0, 3).map((order) => (
                        <OrderRow key={order.id} order={order} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── ORDERS ───────────────────────────────────────────────── */}
        {activeTab === "Orders" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[#111111]">Order History</h2>
              <button onClick={fetchOrders} className="text-xs text-[#1B4D2E] font-medium hover:underline">Refresh</button>
            </div>
            {loading ? (
              <div className="flex items-center gap-2 text-gray-400 py-8">
                <Loader2 size={18} className="animate-spin" /> Loading orders…
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Package size={32} className="mx-auto mb-3 text-gray-200" />
                <p className="text-sm">No orders yet. Start by browsing our products.</p>
                <Link href="/products" className="mt-4 inline-block text-sm text-[#1B4D2E] font-medium hover:underline">Browse Products</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => <OrderRow key={order.id} order={order} expanded />)}
              </div>
            )}
          </div>
        )}

        {/* ── ADDRESSES ────────────────────────────────────────────── */}
        {activeTab === "Addresses" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[#111111]">Saved Addresses</h2>
              <button className="text-sm font-medium text-[#1B4D2E] hover:underline">+ Add Address</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Main Branch",   addr: "123 Tahrir Square, Downtown Cairo", phone: "+20 10 1234 5678", def: true },
                { label: "Second Branch", addr: "45 Corniche El Nile, Maadi",        phone: "+20 11 9876 5432", def: false },
              ].map(({ label, addr, phone, def }) => (
                <div key={label} className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-[#111111]">{label}</span>
                    {def && <span className="text-xs font-medium bg-[#1B4D2E]/10 text-[#1B4D2E] px-2 py-0.5 rounded-full">Default</span>}
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">{addr}</p>
                  <p className="text-xs text-gray-400 mt-1">{phone}</p>
                  <div className="mt-3 pt-3 border-t border-gray-100 flex gap-3">
                    <button className="text-xs font-medium text-[#1B4D2E] hover:underline">Edit</button>
                    <button className="text-xs font-medium text-gray-400 hover:text-red-500">Remove</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── NOTIFICATIONS ────────────────────────────────────────── */}
        {activeTab === "Notifications" && (
          <div>
            <h2 className="text-base font-bold text-[#111111] mb-4">Notification Preferences</h2>
            <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
              {[
                { label: "Order Updates",  desc: "Confirmations, dispatch, delivery status", on: true },
                { label: "New Products",   desc: "When new SKUs or brands are added",          on: true },
                { label: "Price Changes",  desc: "Price list updates from your brands",         on: false },
                { label: "Promotions",     desc: "Special deals and seasonal offers",           on: false },
              ].map(({ label, desc, on }) => (
                <div key={label} className="flex items-center justify-between px-5 py-4">
                  <div>
                    <p className="text-sm font-medium text-[#111111]">{label}</p>
                    <p className="text-xs text-gray-400">{desc}</p>
                  </div>
                  <div className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${on ? "bg-[#1B4D2E]" : "bg-gray-200"}`}>
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${on ? "translate-x-5" : "translate-x-0.5"}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sign out */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-500 transition-colors">
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

// Reusable order row component
function OrderRow({ order, expanded = false }: { order: DbOrder; expanded?: boolean }) {
  const statusColor: Record<string, string> = {
    delivered:  "bg-green-50 text-green-700",
    confirmed:  "bg-blue-50 text-blue-700",
    processing: "bg-yellow-50 text-yellow-700",
    pending:    "bg-gray-100 text-gray-600",
    cancelled:  "bg-red-50 text-red-700",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold text-sm text-[#111111]">{order.order_number}</p>
          <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString("en-EG", { day: "numeric", month: "short", year: "numeric" })}</p>
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusColor[order.status] ?? "bg-gray-100 text-gray-600"}`}>
          {order.status}
        </span>
      </div>
      {expanded && order.delivery_address && (
        <p className="text-xs text-gray-400 mt-1.5 truncate">{order.delivery_address}</p>
      )}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
        <span className="font-bold text-sm text-[#111111]">EGP {Number(order.total_amount).toFixed(2)}</span>
        {expanded && (
          <div className="flex gap-2">
            <button className="text-xs font-medium text-[#1B4D2E] hover:underline">View Items</button>
            <span className="text-gray-200">·</span>
            <button className="text-xs font-medium text-gray-400 hover:text-[#1B4D2E]">Reorder</button>
          </div>
        )}
      </div>
    </div>
  );
}
