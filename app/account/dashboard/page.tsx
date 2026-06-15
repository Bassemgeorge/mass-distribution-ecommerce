"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { ShoppingBag, Clock, DollarSign, CalendarDays, LogOut, ChevronRight, Loader2 } from "lucide-react";

interface Order {
  id: string;
  created_at: string;
  total: number;
  status: string;
  items_count?: number;
}

const STATUS_COLORS: Record<string, string> = {
  pending:    "bg-yellow-50 text-yellow-700 border-yellow-200",
  confirmed:  "bg-blue-50 text-blue-700 border-blue-200",
  processing: "bg-purple-50 text-purple-700 border-purple-200",
  shipped:    "bg-indigo-50 text-indigo-700 border-indigo-200",
  delivered:  "bg-green-50 text-[#1B4D2E] border-green-200",
  cancelled:  "bg-red-50 text-red-700 border-red-200",
};

export default function DashboardPage() {
  const { user, customer, loading, signOut } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.replace("/account/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("orders")
      .select("id, created_at, total, status")
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5)
      .then(({ data }) => {
        setOrders((data as Order[]) ?? []);
        setOrdersLoading(false);
      });
  }, [user]);

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#F7F7F5] flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-[#1B4D2E]" />
      </div>
    );
  }

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "pending" || o.status === "confirmed").length;
  const totalSpent = orders.reduce((s, o) => s + (o.total ?? 0), 0);
  const memberSince = customer?.created_at
    ? new Date(customer.created_at).toLocaleDateString("en-EG", { month: "long", year: "numeric" })
    : "—";

  return (
    <div className="min-h-screen bg-[#F7F7F5]">
      {/* Header */}
      <div className="bg-[#111111] text-white">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-gray-400 mb-1">Welcome back,</p>
              <h1 className="text-2xl font-bold">{customer?.business_name ?? user.email}</h1>
              {customer?.name && <p className="text-gray-400 text-sm mt-1">{customer.name}</p>}
              <p className="text-gray-500 text-xs mt-2" dir="rtl">مرحباً بك في لوحة التحكم</p>
            </div>
            <button onClick={handleSignOut} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg">
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Orders", labelAr: "إجمالي الطلبات", value: totalOrders, icon: ShoppingBag },
            { label: "Pending", labelAr: "قيد الانتظار", value: pendingOrders, icon: Clock },
            { label: "Total Spent", labelAr: "إجمالي الإنفاق", value: `EGP ${totalSpent.toLocaleString()}`, icon: DollarSign },
            { label: "Member Since", labelAr: "عضو منذ", value: memberSince, icon: CalendarDays },
          ].map(({ label, labelAr, value, icon: Icon }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="w-9 h-9 rounded-lg bg-[#E8F5E9] flex items-center justify-center mb-3">
                <Icon size={18} className="text-[#1B4D2E]" />
              </div>
              <p className="text-2xl font-bold text-[#111111]">{value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{label}</p>
              <p className="text-xs text-gray-300 mt-0.5" dir="rtl">{labelAr}</p>
            </div>
          ))}
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-[#111111]">Recent Orders</h2>
            <Link href="/account/orders" className="text-xs text-[#1B4D2E] hover:underline flex items-center gap-1">
              View all <ChevronRight size={12} />
            </Link>
          </div>

          {ordersLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 size={20} className="animate-spin text-gray-300" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag size={32} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No orders yet</p>
              <Link href="/products" className="mt-3 inline-block text-sm text-[#1B4D2E] hover:underline">Browse products →</Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {orders.map((order) => (
                <Link key={order.id} href={`/order-confirmation/${order.id}`} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors group">
                  <div>
                    <p className="text-sm font-medium text-[#111111] group-hover:text-[#1B4D2E] transition-colors">
                      Order #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(order.created_at).toLocaleDateString("en-EG", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_COLORS[order.status] ?? "bg-gray-50 text-gray-600 border-gray-200"}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    <span className="text-sm font-semibold text-[#111111]">EGP {(order.total ?? 0).toLocaleString()}</span>
                    <ChevronRight size={14} className="text-gray-300 group-hover:text-[#1B4D2E] transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Account Details */}
        {customer && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-[#111111] mb-5">Account Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {[
                { label: "Business Name", value: customer.business_name },
                { label: "Contact Name", value: customer.name },
                { label: "Email", value: customer.email ?? user.email },
                { label: "Phone", value: customer.phone },
                { label: "Address / Area", value: customer.address },
              ].map(({ label, value }) => value ? (
                <div key={label}>
                  <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                  <p className="text-[#111111] font-medium">{value}</p>
                </div>
              ) : null)}
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/products" className="flex items-center gap-3 bg-[#1B4D2E] text-white rounded-xl p-5 hover:bg-[#163d24] transition-colors">
            <ShoppingBag size={20} />
            <div>
              <p className="font-semibold text-sm">Browse Products</p>
              <p className="text-green-300 text-xs">225 items available</p>
            </div>
            <ChevronRight size={16} className="ml-auto" />
          </Link>
          <Link href="/account/orders" className="flex items-center gap-3 bg-white border border-gray-200 text-[#111111] rounded-xl p-5 hover:border-[#1B4D2E] transition-colors">
            <Clock size={20} className="text-[#1B4D2E]" />
            <div>
              <p className="font-semibold text-sm">Order History</p>
              <p className="text-gray-400 text-xs">All past orders</p>
            </div>
            <ChevronRight size={16} className="ml-auto text-gray-300" />
          </Link>
        </div>
      </div>
    </div>
  );
}
