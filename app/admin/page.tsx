"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ShoppingBag, Users, DollarSign, MessageSquare, TrendingUp, Loader2, ChevronRight } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  pending:    "bg-amber-50 text-amber-700 border-amber-200",
  confirmed:  "bg-blue-50 text-blue-700 border-blue-200",
  processing: "bg-purple-50 text-purple-700 border-purple-200",
  shipped:    "bg-indigo-50 text-indigo-700 border-indigo-200",
  delivered:  "bg-green-50 text-[#1B4D2E] border-green-200",
  cancelled:  "bg-red-50 text-red-700 border-red-200",
};

interface RecentOrder {
  id: string;
  created_at: string;
  total: number;
  status: string;
  customers: { business_name: string } | null;
}

export default function AdminDashboard() {
  const [stats, setStats]   = useState({ orders: 0, pending: 0, revenue: 0, inquiries: 0 });
  const [recent, setRecent] = useState<RecentOrder[]>([]);
  const [loading, setLoad]  = useState(true);

  useEffect(() => {
    async function load() {
      const [ordersRes, pendingRes, revenueRes, inquiriesRes, recentRes] = await Promise.all([
        supabase.from("orders").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("orders").select("total"),
        supabase.from("inquiries").select("id", { count: "exact", head: true }).eq("status", "new"),
        supabase.from("orders").select("id, created_at, total, status, customers(business_name)").order("created_at", { ascending: false }).limit(10),
      ]);

      const revenue = (revenueRes.data ?? []).reduce((s: number, o: { total: number }) => s + (o.total ?? 0), 0);
      setStats({
        orders:    ordersRes.count   ?? 0,
        pending:   pendingRes.count  ?? 0,
        revenue,
        inquiries: inquiriesRes.count ?? 0,
      });
      setRecent((recentRes.data as unknown as RecentOrder[]) ?? []);
      setLoad(false);
    }
    load();
  }, []);

  const cards = [
    { label: "Total Orders",   value: stats.orders,                         icon: ShoppingBag,   color: "bg-blue-50 text-blue-600" },
    { label: "Pending Orders", value: stats.pending,                        icon: TrendingUp,    color: "bg-amber-50 text-amber-600" },
    { label: "Total Revenue",  value: `EGP ${stats.revenue.toLocaleString()}`, icon: DollarSign, color: "bg-green-50 text-[#1B4D2E]" },
    { label: "New Inquiries",  value: stats.inquiries,                      icon: MessageSquare, color: "bg-red-50 text-red-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#111111]">Dashboard</h1>
        <p className="text-gray-400 text-sm">Mass Distribution · Admin Panel</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center mb-3`}>
              <Icon size={18} />
            </div>
            {loading ? (
              <div className="h-7 w-14 bg-gray-100 rounded animate-pulse mb-1" />
            ) : (
              <p className="text-2xl font-bold text-[#111111]">{value}</p>
            )}
            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-sm text-[#111111]">Recent Orders</h2>
          <Link href="/admin/orders" className="text-xs text-[#1B4D2E] hover:underline flex items-center gap-1">
            View all <ChevronRight size={12} />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 size={20} className="animate-spin text-gray-300" />
          </div>
        ) : recent.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-10">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Order #</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Customer</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden sm:table-cell">Date</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Total</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recent.map((o) => (
                  <Link key={o.id} href="/admin/orders" legacyBehavior>
                    <tr className="hover:bg-gray-50 transition-colors cursor-pointer">
                      <td className="px-5 py-3 font-mono text-xs text-gray-500">#{o.id.slice(0, 8).toUpperCase()}</td>
                      <td className="px-5 py-3 text-sm font-medium text-[#111111]">{o.customers?.business_name ?? "—"}</td>
                      <td className="px-5 py-3 text-xs text-gray-400 hidden sm:table-cell whitespace-nowrap">
                        {new Date(o.created_at).toLocaleDateString("en-EG", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-5 py-3 text-right text-sm font-bold">EGP {(o.total ?? 0).toLocaleString()}</td>
                      <td className="px-5 py-3 text-center">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_COLORS[o.status] ?? "bg-gray-50 text-gray-600 border-gray-200"}`}>
                          {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  </Link>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { href: "/admin/orders",    label: "Manage Orders",    icon: ShoppingBag },
          { href: "/admin/products",  label: "Manage Products",  icon: Users },
          { href: "/admin/customers", label: "Customers",        icon: Users },
          { href: "/admin/inquiries", label: "Inquiries",        icon: MessageSquare },
        ].map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className="bg-white rounded-xl border border-gray-200 p-4 hover:border-[#1B4D2E] transition-colors flex items-center gap-3">
            <Icon size={16} className="text-[#1B4D2E]" />
            <span className="text-xs font-medium text-gray-600">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
