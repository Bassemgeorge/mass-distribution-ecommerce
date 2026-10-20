"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Plus, RotateCcw } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useActiveCompany } from "@/context/ActiveCompanyContext";
import { useCart } from "@/lib/cartStore";
import { DbProduct, MappedProduct, toProduct } from "@/lib/db";
import { track } from "@/lib/track";
import ProductImage from "@/components/ProductImage";
import { useReorder } from "@/components/reorder/useReorder";

interface RecentOrder {
  id: string;
  order_items: { product_id: number | null; quantity: number }[];
}

/** "Order again" strip: frequent products from the customer's last 3 orders. Hidden for guests / no orders. */
export default function OrderAgainStrip() {
  const { user } = useAuth();
  const { companies, loading: companiesLoading } = useActiveCompany();
  const { add } = useCart();
  const { startReorder, busyOrder, ui } = useReorder();
  const [products, setProducts] = useState<MappedProduct[]>([]);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const companyIdsKey = companies.map((c) => c.id).join(",");

  useEffect(() => {
    if (!user || companiesLoading || !companyIdsKey) {
      setProducts([]);
      setLastOrderId(null);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("orders")
        .select("id, order_items(product_id, quantity)")
        .in("customer_id", companyIdsKey.split(","))
        .neq("status", "cancelled")
        .is("sourcing_request_id", null)
        .order("created_at", { ascending: false })
        .limit(3);
      const orders = (data as RecentOrder[] | null) ?? [];
      if (cancelled || orders.length === 0) return;

      // Most frequent first: in how many of the orders it appears, then total cartons
      const score = new Map<number, { orders: number; qty: number }>();
      for (const o of orders) {
        const seen = new Set<number>();
        for (const it of o.order_items ?? []) {
          if (it.product_id == null) continue;
          const s = score.get(it.product_id) ?? { orders: 0, qty: 0 };
          if (!seen.has(it.product_id)) s.orders += 1;
          s.qty += it.quantity;
          seen.add(it.product_id);
          score.set(it.product_id, s);
        }
      }
      const ranked = [...score.entries()].sort((a, b) => b[1].orders - a[1].orders || b[1].qty - a[1].qty).map(([id]) => id);
      if (ranked.length === 0) return;

      const { data: rows } = await supabase.from("products").select("*").in("id", ranked);
      const byId = new Map(((rows as DbProduct[] | null) ?? []).map((p) => [p.id, p]));
      const available = ranked
        .map((id) => byId.get(id))
        .filter((p): p is DbProduct => !!p && p.is_active !== false && p.coming_soon !== true && !(p.stock !== null && p.stock <= 0) && p.brand !== "Special order")
        .slice(0, 8)
        .map(toProduct);

      if (cancelled) return;
      setLastOrderId(orders[0].id);
      setProducts(available);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, companiesLoading, companyIdsKey]);

  if (!user || !lastOrderId || products.length === 0) return null;

  return (
    <section className="bg-[#F7F7F5] border-b border-gray-100 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-bold text-[#111111]">
              Order again <span className="text-gray-300">/</span> <span dir="rtl">اطلب تاني</span>
            </h2>
            <p className="text-xs text-gray-500">From your recent orders · today&apos;s prices</p>
          </div>
          <button
            onClick={() => startReorder(lastOrderId)}
            disabled={busyOrder === lastOrderId}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#1B4D2E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163d24] disabled:opacity-60"
          >
            <RotateCcw size={14} /> Reorder last order / <span dir="rtl">اطلب آخر طلب</span>
          </button>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x">
          {products.map((p) => (
            <div key={p.id} className="snap-start flex-shrink-0 w-40 sm:w-44 bg-white border border-gray-200 rounded-xl p-3 flex flex-col">
              <Link href={`/products/${p.id}`} className="block">
                <div className="h-24 bg-[#F7F7F5] rounded-lg overflow-hidden mb-2">
                  <ProductImage product={p} className="object-contain w-full h-full p-2" />
                </div>
                <p className="text-xs font-semibold text-[#111111] leading-snug line-clamp-2 min-h-[2rem]">{p.nameEn}</p>
              </Link>
              <p className="text-sm font-bold text-[#1B4D2E] mt-1">EGP {Math.round(p.pricePerCarton).toLocaleString("en-US")}</p>
              <button
                onClick={() => {
                  add(p);
                  track("add_to_cart", { product_id: p.id, cartons: 1 });
                  setJustAdded(p.id);
                  window.setTimeout(() => setJustAdded((cur) => (cur === p.id ? null : cur)), 1500);
                }}
                className={`mt-2 inline-flex items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-semibold transition-colors ${
                  justAdded === p.id ? "bg-[#1B4D2E] text-white" : "bg-[#111111] text-white hover:bg-[#1B4D2E]"
                }`}
              >
                {justAdded === p.id ? <Check size={12} /> : <Plus size={12} />} {justAdded === p.id ? "Added" : "Add"}
              </button>
            </div>
          ))}
        </div>
      </div>
      {ui}
    </section>
  );
}
