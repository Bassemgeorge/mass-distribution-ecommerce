"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/lib/cartStore";
import { DbProduct, toProduct } from "@/lib/db";
import { setOrderVia } from "@/lib/source";
import { track } from "@/lib/track";

const NOTICE_KEY = "md_reorder_notice";

export interface ReorderNotice {
  skipped: string[];
  special: boolean;
}

interface OrderRow {
  id: string;
  status: string;
  sourcing_request_id: string | null;
  order_items: { product_id: number | null; quantity: number; product_name: string }[];
}

function isAvailable(p: DbProduct) {
  return p.is_active !== false && p.coming_soon !== true && !(p.stock !== null && p.stock <= 0);
}

export function saveReorderNotice(notice: ReorderNotice) {
  try {
    sessionStorage.setItem(NOTICE_KEY, JSON.stringify(notice));
  } catch {
    // ignore
  }
}

export function takeReorderNotice(): ReorderNotice | null {
  try {
    const raw = sessionStorage.getItem(NOTICE_KEY);
    sessionStorage.removeItem(NOTICE_KEY);
    return raw ? (JSON.parse(raw) as ReorderNotice) : null;
  } catch {
    return null;
  }
}

export function ReorderNoticeText({ notice }: { notice: ReorderNotice }) {
  return (
    <div className="space-y-1">
      {notice.skipped.length > 0 && (
        <p>
          Some items are not available right now and were skipped: <span dir="auto">{notice.skipped.join(", ")}</span>
          <span className="block" dir="rtl">
            بعض الأصناف مش متاحة حالياً واتشالت: {notice.skipped.join("، ")}
          </span>
        </p>
      )}
      {notice.special && (
        <p>
          Special-order items need a new request from the{" "}
          <a href="/sourcing/new" className="underline font-semibold">
            Sourcing Desk
          </a>
          <span className="block" dir="rtl">
            الأصناف الخاصة محتاجة طلب جديد من مكتب التوريد
          </span>
        </p>
      )}
    </div>
  );
}

type Via = "reorder" | "reorder_email";

/**
 * Rebuilds the cart from a past order: same carton quantities, today's prices (always from `products`).
 * Unavailable and special-order items are skipped.
 */
export function useReorder() {
  const { items, add, update, clear } = useCart();
  const router = useRouter();
  const [busyOrder, setBusyOrder] = useState<string | null>(null);
  const [ask, setAsk] = useState<{ orderId: string; via: Via } | null>(null);
  const [message, setMessage] = useState<ReorderNotice | { error: string } | null>(null);

  async function run(orderId: string, via: Via, mode: "add" | "replace") {
    setAsk(null);
    setBusyOrder(orderId);
    setMessage(null);

    const { data } = await supabase
      .from("orders")
      .select("id, status, sourcing_request_id, order_items(product_id, quantity, product_name)")
      .eq("id", orderId)
      .maybeSingle();
    const order = data as OrderRow | null;
    if (!order) {
      setBusyOrder(null);
      setMessage({ error: "Order not found. / الطلب مش موجود." });
      return false;
    }

    // Combine repeated lines of the same product
    const wanted = new Map<number, { quantity: number; name: string }>();
    for (const it of order.order_items ?? []) {
      if (it.product_id == null) continue;
      const prev = wanted.get(it.product_id);
      wanted.set(it.product_id, { quantity: (prev?.quantity ?? 0) + it.quantity, name: prev?.name ?? it.product_name });
    }

    const ids = [...wanted.keys()];
    const { data: rows } = ids.length
      ? await supabase.from("products").select("*").in("id", ids)
      : { data: [] as DbProduct[] };
    const byId = new Map(((rows as DbProduct[] | null) ?? []).map((p) => [p.id, p]));

    const toAdd: { product: ReturnType<typeof toProduct>; quantity: number }[] = [];
    const skipped: string[] = [];
    let special = !!order.sourcing_request_id;
    for (const [id, w] of wanted) {
      const p = byId.get(id);
      if (order.sourcing_request_id || p?.brand === "Special order") {
        special = true;
        continue;
      }
      if (!p || !isAvailable(p)) {
        skipped.push(p?.name_en ?? w.name);
        continue;
      }
      toAdd.push({ product: toProduct(p), quantity: w.quantity });
    }

    if (toAdd.length === 0) {
      setBusyOrder(null);
      setMessage({ skipped, special });
      return false;
    }

    if (mode === "replace") clear();
    for (const { product, quantity } of toAdd) {
      const existing = mode === "add" ? (items.find((i) => i.product.id === product.id)?.quantity ?? 0) : 0;
      add(product);
      update(product.id, existing + quantity);
    }

    setOrderVia(via);
    track("reorder_click", { order_ref: order.id.slice(0, 8).toUpperCase(), items: toAdd.length });
    if (skipped.length || special) saveReorderNotice({ skipped, special });
    router.push("/cart");
    return true;
  }

  /** Starts a reorder; asks "add or replace?" first when the cart already has items. */
  function startReorder(orderId: string, via: Via = "reorder") {
    if (items.length > 0) setAsk({ orderId, via });
    else run(orderId, via, "add");
  }

  const ui = (
    <>
      {ask && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" onClick={() => setAsk(null)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <p className="font-bold text-[#111111]">Add to your current cart or replace it?</p>
            <p className="text-sm text-gray-500 mt-1" dir="rtl">
              تضيف للسلة ولا تستبدلها؟
            </p>
            <div className="mt-5 grid gap-2">
              <button
                onClick={() => run(ask.orderId, ask.via, "add")}
                className="w-full rounded-lg bg-[#1B4D2E] py-2.5 text-sm font-semibold text-white hover:bg-[#163d24]"
              >
                Add to cart / أضف للسلة
              </button>
              <button
                onClick={() => run(ask.orderId, ask.via, "replace")}
                className="w-full rounded-lg border border-gray-300 py-2.5 text-sm font-semibold text-gray-700 hover:border-[#1B4D2E]"
              >
                Replace cart / استبدل السلة
              </button>
              <button onClick={() => setAsk(null)} className="w-full py-2 text-sm text-gray-500">
                Cancel / إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
      {message && (
        <div className="fixed bottom-5 left-1/2 z-[70] flex w-max max-w-[92vw] -translate-x-1/2 items-start gap-2 rounded-xl bg-[#111111] px-4 py-3 text-sm text-white shadow-lg">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0 text-amber-300" />
          <div>{"error" in message ? message.error : <ReorderNoticeText notice={message} />}</div>
          <button onClick={() => setMessage(null)} className="text-white/60 hover:text-white" aria-label="Close">
            <X size={14} />
          </button>
        </div>
      )}
    </>
  );

  return { startReorder, busyOrder, ui };
}

export function ReorderButton({
  orderId,
  startReorder,
  busy,
  className = "",
}: {
  orderId: string;
  startReorder: (id: string) => void;
  busy: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        startReorder(orderId);
      }}
      disabled={busy}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#1B4D2E] px-3 py-1.5 text-xs font-semibold text-[#1B4D2E] hover:bg-[#1B4D2E] hover:text-white transition-colors disabled:opacity-60 ${className}`}
    >
      {busy && <Loader2 size={12} className="animate-spin" />}
      Reorder / <span dir="rtl">اطلب نفس الطلب تاني</span>
    </button>
  );
}
