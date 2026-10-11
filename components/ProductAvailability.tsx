"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, Clock, MessageCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/lib/cartStore";

const NOTIFY_NUMBER = "201288895916";

export const UNAVAILABLE_REMOVED_MSG =
  "Some items are not available yet and were removed from your cart. / بعض المنتجات غير متاحة حالياً واتشالت من السلة.";

// ── Pills ────────────────────────────────────────────────────────────────────
export function ComingSoonPill({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 bg-white/95 border border-[#177A41] text-[#177A41] text-xs font-bold px-2.5 py-1 rounded-full ${className}`}
    >
      Coming soon · new prices <span className="opacity-60">/</span> <span dir="rtl">قريباً · أسعار جديدة</span>
    </span>
  );
}

export function SoldOutPill({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 bg-gray-400 text-white text-xs font-bold px-2.5 py-1 rounded-full ${className}`}>
      Sold out <span className="opacity-70">/</span> <span dir="rtl">نفدت الكمية</span>
    </span>
  );
}

// ── Buttons ──────────────────────────────────────────────────────────────────
export function UnavailableButton({ kind, size = "sm" }: { kind: "coming_soon" | "sold_out"; size?: "sm" | "lg" }) {
  const label = kind === "coming_soon" ? <>Coming soon / <span dir="rtl">قريباً</span></> : <>Sold out / <span dir="rtl">نفدت</span></>;
  return (
    <button
      disabled
      onClick={(e) => e.preventDefault()}
      className={`flex items-center justify-center gap-1.5 rounded-lg font-semibold bg-gray-200 text-gray-500 cursor-not-allowed ${
        size === "lg" ? "w-full py-3 text-sm" : "px-3 py-2 text-xs"
      }`}
    >
      {kind === "coming_soon" && <Clock size={size === "lg" ? 15 : 12} />}
      {label}
    </button>
  );
}

export function notifyLink(nameEn: string, nameAr: string) {
  const text = `Hi, please notify me when ${nameEn} is available / من فضلك بلغني لما ${nameAr} يتوفر`;
  return `https://wa.me/${NOTIFY_NUMBER}?text=${encodeURIComponent(text)}`;
}

export function NotifyMeLink({ nameEn, nameAr, className = "" }: { nameEn: string; nameAr: string; className?: string }) {
  return (
    <a
      href={notifyLink(nameEn, nameAr)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className={`inline-flex items-center gap-1 text-xs font-semibold text-[#128C4A] hover:underline ${className}`}
    >
      <MessageCircle size={12} /> Notify me on WhatsApp / <span dir="rtl">بلغني على واتساب</span>
    </a>
  );
}

// ── Cart availability check ──────────────────────────────────────────────────
interface ProductAvailabilityRow {
  id: number;
  coming_soon: boolean | null;
  is_active: boolean | null;
  stock: number | null;
}

function isUnavailable(row: ProductAvailabilityRow | undefined) {
  if (!row) return true;
  return row.coming_soon === true || row.is_active === false || (row.stock !== null && row.stock <= 0);
}

/**
 * Removes coming-soon / sold-out / inactive products from the cart (including carts restored from
 * localStorage), and exposes `recheck()` to run right before placing an order.
 */
export function useCartAvailability() {
  const { items, remove } = useCart();
  const [message, setMessage] = useState<string | null>(null);
  const checked = useRef(new Set<string>());

  const recheck = useCallback(
    async (ids: string[]): Promise<{ removed: string[]; error: boolean }> => {
      if (ids.length === 0) return { removed: [], error: false };
      const { data, error } = await supabase
        .from("products")
        .select("id, coming_soon, is_active, stock")
        .in("id", ids.map((id) => parseInt(id, 10)));
      if (error) return { removed: [], error: true };
      const byId = new Map((data as ProductAvailabilityRow[]).map((r) => [String(r.id), r]));
      const removed = ids.filter((id) => isUnavailable(byId.get(id)));
      removed.forEach((id) => remove(id));
      if (removed.length > 0) setMessage(UNAVAILABLE_REMOVED_MSG);
      return { removed, error: false };
    },
    [remove]
  );

  // Items arrive after the cart hydrates from localStorage, so check any ids we haven't seen yet
  const idsKey = items.map((i) => i.product.id).join(",");
  useEffect(() => {
    const unchecked = (idsKey ? idsKey.split(",") : []).filter((id) => !checked.current.has(id));
    if (unchecked.length === 0) return;
    unchecked.forEach((id) => checked.current.add(id));
    recheck(unchecked);
  }, [idsKey, recheck]);

  useEffect(() => {
    if (!message) return;
    const t = window.setTimeout(() => setMessage(null), 6000);
    return () => window.clearTimeout(t);
  }, [message]);

  const toast = message ? (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[70] flex items-start gap-2 max-w-[92vw] w-max bg-[#111111] text-white text-sm font-medium px-4 py-3 rounded-xl shadow-lg">
      <AlertCircle size={16} className="text-amber-300 flex-shrink-0 mt-0.5" />
      <span>{message}</span>
    </div>
  ) : null;

  return { toast, recheck };
}
