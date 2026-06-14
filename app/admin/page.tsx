"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { products as localProducts, brands, categories } from "@/lib/products";
import type { DbOrder, DbCustomer } from "@/lib/database.types";
import {
  Package, Users, TrendingUp, ShoppingCart, DollarSign,
  Search, ChevronRight, BarChart2, AlertCircle, ArrowUpRight,
  Loader2, RefreshCw,
} from "lucide-react";

const tabs = ["Overview", "Products", "Orders", "Customers"] as const;
type Tab = typeof tabs[number];

const statusColor: Record<string, string> = {
  delivered:  "bg-green-50 text-green-700",
  confirmed:  "bg-blue-50 text-blue-700",
  processing: "bg-yellow-50 text-yellow-700",
  pending:    "bg-gray-100 text-gray-600",
  cancelled:  "bg-red-50 text-red-700",
};

type OrderWithCustomer = DbOrder & { customers: Pick<DbCustomer, "business_name" | "contact_name"> | null };

export default function AdminPage() {
  const [activeTab, setActiveTab]     = useState<Tab>("Overview");
  const [productSearch, setProductSearch] = useState("");

  // Supabase data
  const [orders, setOrders]         = useState<OrderWithCustomer[]>([]);
  const [customers, setCustomers]   = useState<DbCustomer[]>([]);
  const [dbProductCount, setDbProductCount] = useState<number | null>(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ordersRes, custRes, prodCountRes] = await Promise.all([
        supabase
          .from("orders")
          .select("*, customers(business_name, contact_name)")
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("customers")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("products")
          .select("*", { count: "exact", head: true }),
      ]);

      if (ordersRes.error) throw new Error(ordersRes.error.message);
      if (custRes.error) throw new Error(custRes.error.message);

      setOrders((ordersRes.data as OrderWithCustomer[]) ?? []);
      setCustomers(custRes.data ?? []);
      setDbProductCount(prodCountRes.count ?? null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Computed stats
  const totalRevenue     = orders.reduce((s, o) => s + Number(o.total_amount), 0);
  const pendingOrders    = orders.filter((o) => o.status === "pending").length;
  const deliveredOrders  = orders.filter((o) => o.status === "delivered").length;
  const taxableCount     = localProducts.filter((p) => p.hasTax).length;

  const filteredProducts = localProducts.filter((p) => {
    const q = productSearch.toLowerCase();
    return !q || p.nameEn.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-[#F7F7F5]">
      {/* Header */}
      <div className="bg-[#1B4D2E] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
              <p className="text-white/60 text-sm">Mass Distribution · Internal</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={fetchAll}
                disabled={loading}
                className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm transition-colors"
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
              </button>
              <Link href="/" className="text-white/70 hover:text-white text-sm transition-colors">← Site</Link>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-5 overflow-x-auto">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 flex items-center gap-2 text-sm">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* ── OVERVIEW ─────────────────────────────────────────────── */}
        {activeTab === "Overview" && (
          <div className="space-y-6">
            {/* KPI cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  icon: Package,
                  label: "Total SKUs",
                  value: dbProductCount !== null ? dbProductCount.toString() : localProducts.length.toString(),
                  sub: dbProductCount !== null ? "in Supabase" : `${brands.length} brands (local)`,
                  color: "text-[#1B4D2E]",
                },
                {
                  icon: Users,
                  label: "Customers",
                  value: customers.length > 0 ? customers.length.toString() : "—",
                  sub: "registered",
                  color: "text-blue-600",
                },
                {
                  icon: ShoppingCart,
                  label: "Total Orders",
                  value: orders.length.toString(),
                  sub: `${pendingOrders} pending`,
                  color: "text-yellow-600",
                },
                {
                  icon: DollarSign,
                  label: "Total Revenue",
                  value: `EGP ${Math.round(totalRevenue / 1000)}K`,
                  sub: `${deliveredOrders} delivered`,
                  color: "text-green-600",
                },
              ].map(({ icon: Icon, label, value, sub, color }) => (
                <div key={label} className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</p>
                    <Icon size={16} className={color} />
                  </div>
                  {loading ? (
                    <div className="h-7 w-16 bg-gray-100 rounded animate-pulse" />
                  ) : (
                    <>
                      <p className="text-2xl font-bold text-[#111111]">{value}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Two-column section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Brand breakdown */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-[#111111]">Catalog by Brand</h3>
                  <BarChart2 size={16} className="text-gray-300" />
                </div>
                <div className="space-y-3">
                  {brands.map((brand) => {
                    const count = localProducts.filter((p) => p.brand === brand).length;
                    const pct   = Math.round((count / localProducts.length) * 100);
                    return (
                      <div key={brand}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-medium text-gray-700">{brand}</span>
                          <span className="text-gray-400">{count} SKUs · {pct}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-[#1B4D2E] rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Catalog stats */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-[#111111]">Catalog Stats</h3>
                  <TrendingUp size={16} className="text-gray-300" />
                </div>
                <div className="space-y-3">
                  {[
                    { label: "Total SKUs (local)",   value: localProducts.length.toString() },
                    { label: "SKUs in Supabase",     value: dbProductCount !== null ? dbProductCount.toString() : "Not seeded" },
                    { label: "Brands",               value: brands.length.toString() },
                    { label: "Categories",           value: categories.length.toString() },
                    { label: "VAT-applicable",       value: `${taxableCount} SKUs` },
                    { label: "Registered customers", value: customers.length.toString() },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between text-sm border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                      <span className="text-gray-500">{label}</span>
                      <span className="font-semibold text-[#111111]">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent orders */}
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-[#111111]">Recent Orders</h3>
                <button onClick={() => setActiveTab("Orders")} className="text-xs font-medium text-[#1B4D2E] hover:underline flex items-center gap-1">
                  View all <ArrowUpRight size={12} />
                </button>
              </div>
              {loading ? (
                <div className="flex items-center gap-2 text-gray-400 p-5">
                  <Loader2 size={16} className="animate-spin" /> Loading…
                </div>
              ) : orders.length === 0 ? (
                <div className="p-5 text-center text-gray-400 text-sm">No orders yet.</div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center gap-4 px-5 py-3.5">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#111111] truncate">
                          {order.customers?.business_name ?? "Unknown customer"}
                        </p>
                        <p className="text-xs text-gray-400">{order.order_number} · {new Date(order.created_at).toLocaleDateString("en-EG")}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold">EGP {Number(order.total_amount).toFixed(2)}</p>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${statusColor[order.status] ?? "bg-gray-100 text-gray-600"}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Alert: missing images */}
            {dbProductCount === null || dbProductCount === 0 ? (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Products not yet seeded to Supabase</p>
                  <p className="text-xs text-amber-600 mt-0.5">
                    Run <code className="font-mono bg-amber-100 px-1 rounded">npm run seed</code> to populate the products table from the local catalog.
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* ── PRODUCTS ─────────────────────────────────────────────── */}
        {activeTab === "Products" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[#111111]">
                {filteredProducts.length} Products
                {dbProductCount !== null && dbProductCount > 0 && (
                  <span className="ml-2 text-xs font-normal text-[#1B4D2E]">({dbProductCount} in Supabase)</span>
                )}
              </h2>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search…"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="border border-gray-200 rounded-lg pl-8 pr-4 py-2 text-sm focus:outline-none focus:border-[#1B4D2E] bg-white w-56"
                />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#F7F7F5] border-b border-gray-200">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">SKU</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Brand</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Category</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Unit Price</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Carton</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">VAT</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-[#F7F7F5] transition-colors">
                        <td className="px-4 py-3 text-xs text-gray-400 font-mono">{p.id}</td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-[#111111] text-xs leading-snug">{p.nameEn}</p>
                          <p className="text-gray-400 text-xs" dir="rtl">{p.nameAr}</p>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <span className="text-xs bg-[#1B4D2E]/10 text-[#1B4D2E] px-2 py-0.5 rounded-full font-medium">{p.brand}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 hidden md:table-cell">{p.category}</td>
                        <td className="px-4 py-3 text-right text-xs font-semibold text-[#111111]">EGP {p.pricePerPiece.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right text-xs text-gray-500 hidden lg:table-cell">EGP {p.pricePerCarton.toFixed(2)}</td>
                        <td className="px-4 py-3 text-center hidden sm:table-cell">
                          <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${p.hasTax ? "bg-yellow-50 text-yellow-600" : "bg-gray-100 text-gray-400"}`}>
                            {p.hasTax ? "14%" : "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Link href={`/products/${p.id}`} className="text-gray-300 hover:text-[#1B4D2E] transition-colors">
                            <ChevronRight size={14} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── ORDERS ───────────────────────────────────────────────── */}
        {activeTab === "Orders" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[#111111]">
                Orders <span className="text-gray-400 font-normal text-sm">({orders.length})</span>
              </h2>
              <button onClick={fetchAll} disabled={loading} className="flex items-center gap-1.5 text-xs text-[#1B4D2E] font-medium hover:underline">
                <RefreshCw size={12} className={loading ? "animate-spin" : ""} /> Refresh
              </button>
            </div>

            {loading ? (
              <div className="flex items-center gap-2 text-gray-400 py-8">
                <Loader2 size={18} className="animate-spin" /> Loading orders…
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
                <ShoppingCart size={28} className="mx-auto mb-2 text-gray-200" />
                <p className="text-sm">No orders yet. Orders placed via checkout will appear here.</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[#F7F7F5] border-b border-gray-200">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Date</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-[#F7F7F5] transition-colors">
                          <td className="px-4 py-3 text-xs font-mono font-medium text-[#111111]">{order.order_number}</td>
                          <td className="px-4 py-3">
                            <p className="text-sm font-medium text-[#111111] truncate max-w-[160px]">
                              {order.customers?.business_name ?? "—"}
                            </p>
                            {order.customers?.contact_name && (
                              <p className="text-xs text-gray-400">{order.customers.contact_name}</p>
                            )}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-400 hidden sm:table-cell whitespace-nowrap">
                            {new Date(order.created_at).toLocaleDateString("en-EG", { day: "numeric", month: "short", year: "numeric" })}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-bold">EGP {Number(order.total_amount).toFixed(2)}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusColor[order.status] ?? "bg-gray-100 text-gray-600"}`}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── CUSTOMERS ────────────────────────────────────────────── */}
        {activeTab === "Customers" && (
          <div>
            <h2 className="text-base font-bold text-[#111111] mb-4">
              Customers <span className="text-gray-400 font-normal text-sm">({customers.length} registered)</span>
            </h2>

            {loading ? (
              <div className="flex items-center gap-2 text-gray-400 py-8">
                <Loader2 size={18} className="animate-spin" /> Loading customers…
              </div>
            ) : customers.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
                <Users size={28} className="mx-auto mb-2 text-gray-200" />
                <p className="text-sm">No customers yet. Customer records are created when an order is placed via checkout.</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[#F7F7F5] border-b border-gray-200">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Business</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Contact</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Area</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Type</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Phone</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Since</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {customers.map((c) => (
                        <tr key={c.id} className="hover:bg-[#F7F7F5] transition-colors">
                          <td className="px-4 py-3">
                            <p className="font-medium text-[#111111] text-sm">{c.business_name}</p>
                            {c.email && <p className="text-xs text-gray-400">{c.email}</p>}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 hidden sm:table-cell">{c.contact_name ?? "—"}</td>
                          <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">{c.area ?? "—"}</td>
                          <td className="px-4 py-3 hidden lg:table-cell">
                            <span className="text-xs capitalize bg-[#1B4D2E]/10 text-[#1B4D2E] px-2 py-0.5 rounded-full">{c.customer_type ?? "—"}</span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500 hidden sm:table-cell">{c.phone ?? "—"}</td>
                          <td className="px-4 py-3 text-xs text-gray-400 hidden lg:table-cell whitespace-nowrap">
                            {new Date(c.created_at).toLocaleDateString("en-EG", { day: "numeric", month: "short", year: "numeric" })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
