"use client";

import { useState, Suspense } from "react";
import { useCart } from "@/lib/cartStore";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShoppingBag, Loader2 } from "lucide-react";

type FormState = {
  businessName: string;
  contactName: string;
  phone: string;
  address: string;
  area: string;
  paymentMethod: string;
  notes: string;
};

const AREAS = ["Cairo", "Giza", "Alexandria", "New Cairo", "Sheikh Zayed", "6th of October", "Sharm El Sheikh", "Hurghada", "Mansoura", "Other"];

const emptyForm: FormState = {
  businessName: "", contactName: "", phone: "",
  address: "", area: "Cairo", paymentMethod: "cash", notes: "",
};

function CheckoutContent() {
  const { items, total, count, clear } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [form, setForm]       = useState<FormState>({ ...emptyForm, notes: searchParams.get("notes") ?? "" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  function set(field: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function submitOrder() {
    if (!form.businessName || !form.contactName || !form.phone || !form.address) {
      setError("Please fill in all required fields.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      // 1 — insert customer
      const { data: customer, error: custErr } = await supabase
        .from("customers")
        .insert({
          name:          form.contactName,
          business_name: form.businessName,
          phone:         form.phone,
          address:       `${form.address}, ${form.area}`,
        })
        .select("id")
        .single();

      if (custErr) throw new Error(custErr.message);

      // 2 — insert order
      const { data: order, error: orderErr } = await supabase
        .from("orders")
        .insert({
          customer_id: customer.id,
          status:      "pending",
          total:       total,
          notes:       [form.notes, `Payment: ${form.paymentMethod}`].filter(Boolean).join(" | ") || null,
        })
        .select("id")
        .single();

      if (orderErr) throw new Error(orderErr.message);

      // 3 — insert order items
      const itemRows = items.map(({ product, quantity }) => ({
        order_id:     order.id,
        product_id:   parseInt(product.id, 10),
        product_name: product.nameEn,
        quantity,
        unit_price:   product.pricePerPiece,
        subtotal:     product.pricePerPiece * quantity,
      }));

      const { error: itemErr } = await supabase.from("order_items").insert(itemRows);
      if (itemErr) throw new Error(itemErr.message);

      // 4 — clear cart and redirect
      clear();
      router.push(`/order-confirmation/${order.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  if (count === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="max-w-sm mx-auto px-4 text-center">
          <div className="w-16 h-16 bg-[#F7F7F5] rounded-2xl flex items-center justify-center mx-auto mb-5">
            <ShoppingBag size={28} className="text-gray-300" />
          </div>
          <h1 className="text-xl font-bold text-[#111111] mb-2">Nothing to Check Out</h1>
          <p className="text-gray-500 text-sm mb-6">Your cart is empty.</p>
          <Link href="/products" className="inline-flex items-center gap-2 bg-[#1B4D2E] text-white font-semibold px-6 py-3 rounded-lg hover:bg-[#163d24] transition-colors text-sm">
            Shop Now
          </Link>
        </div>
      </div>
    );
  }

  const inp = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1B4D2E] transition-colors bg-white";
  const lbl = "block text-xs font-medium text-gray-500 mb-1.5";
  const req = <span className="text-red-400 ml-0.5">*</span>;

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-[#F7F7F5] border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/cart" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1B4D2E] font-medium transition-colors">
            <ArrowLeft size={15} /> Back to Cart
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-[#111111] mb-8">Checkout</h1>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* ── Form ─────────────────────────────────────────────────────── */}
          <div className="lg:col-span-3 space-y-8">
            {/* Business & Contact */}
            <section>
              <h2 className="text-sm font-semibold text-[#111111] uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">Business Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className={lbl}>Business / Outlet Name {req}</label>
                  <input type="text" value={form.businessName} onChange={(e) => set("businessName", e.target.value)} className={inp} placeholder="Cairo Marriott Hotel" />
                </div>
                <div className="sm:col-span-2">
                  <label className={lbl}>Contact Name {req}</label>
                  <input type="text" value={form.contactName} onChange={(e) => set("contactName", e.target.value)} className={inp} placeholder="Ahmed Hassan" />
                </div>
                <div className="sm:col-span-2">
                  <label className={lbl}>Phone Number {req}</label>
                  <input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} className={inp} placeholder="+20 10 xxxx xxxx" />
                </div>
              </div>
            </section>

            {/* Delivery */}
            <section>
              <h2 className="text-sm font-semibold text-[#111111] uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">Delivery Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className={lbl}>Street Address {req}</label>
                  <input type="text" value={form.address} onChange={(e) => set("address", e.target.value)} className={inp} placeholder="16 Nile Corniche, Maadi" />
                </div>
                <div className="sm:col-span-2">
                  <label className={lbl}>Area</label>
                  <select value={form.area} onChange={(e) => set("area", e.target.value)} className={inp}>
                    {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className={lbl}>Delivery Notes</label>
                  <textarea rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} className={`${inp} resize-none`} placeholder="Preferred delivery time, landmark, floor…" />
                </div>
              </div>
            </section>

            {/* Payment method */}
            <section>
              <h2 className="text-sm font-semibold text-[#111111] uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">Payment Method</h2>
              <div className="space-y-2">
                {[
                  { value: "cash",     label: "Cash on Delivery",  desc: "Pay in cash when your order arrives." },
                  { value: "transfer", label: "Bank Transfer",     desc: "We'll send bank details after confirming your order." },
                ].map(({ value, label, desc }) => (
                  <label key={value} className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${form.paymentMethod === value ? "border-[#1B4D2E] bg-[#1B4D2E]/5" : "border-gray-200 hover:border-gray-300"}`}>
                    <input
                      type="radio"
                      name="payment"
                      value={value}
                      checked={form.paymentMethod === value}
                      onChange={() => set("paymentMethod", value)}
                      className="mt-0.5 accent-[#1B4D2E]"
                    />
                    <div>
                      <p className="text-sm font-semibold text-[#111111]">{label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </section>

            <button
              onClick={submitOrder}
              disabled={loading}
              className="w-full bg-[#1B4D2E] text-white font-semibold py-3.5 rounded-lg hover:bg-[#163d24] transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Placing Order…</> : "Place Order"}
            </button>
            <p className="text-xs text-gray-400 text-center -mt-4">By placing this order you agree to our terms of service.</p>
          </div>

          {/* ── Order summary ─────────────────────────────────────────────── */}
          <div className="lg:col-span-2">
            <div className="bg-[#F7F7F5] rounded-xl p-5 border border-gray-200 sticky top-24">
              <h2 className="text-sm font-bold text-[#111111] uppercase tracking-wider mb-4">Order Summary</h2>
              <div className="space-y-2 mb-4 max-h-72 overflow-y-auto">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="flex justify-between text-xs">
                    <span className="text-gray-600 truncate mr-3 leading-snug">
                      {product.nameEn}
                      <span className="text-gray-400"> × {quantity}</span>
                    </span>
                    <span className="font-semibold flex-shrink-0">EGP {(product.pricePerPiece * quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal ({count} pcs)</span>
                  <span className="font-semibold text-[#111111]">EGP {total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Shipping</span>
                  <span className="text-[#1B4D2E] font-medium">To be confirmed</span>
                </div>
                <div className="flex justify-between font-bold text-sm pt-2 border-t border-gray-200">
                  <span>Total (ex-VAT)</span>
                  <span>EGP {total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center text-gray-400 text-sm">Loading…</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
