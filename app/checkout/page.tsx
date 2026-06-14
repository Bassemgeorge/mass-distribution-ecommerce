"use client";

import { useState } from "react";
import { useCart } from "@/lib/cartStore";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { ArrowLeft, Lock, ShoppingBag, CheckCircle, Loader2 } from "lucide-react";

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  businessName: string;
  address: string;
  area: string;
  customerType: string;
  notes: string;
};

const emptyForm: FormState = {
  firstName: "", lastName: "", email: "", phone: "",
  businessName: "", address: "", area: "Cairo", customerType: "restaurant", notes: "",
};

const AREAS = ["Cairo","Giza","Alexandria","New Cairo","Sheikh Zayed","6th of October","Sharm El Sheikh","Hurghada","Mansoura","Other"];

export default function CheckoutPage() {
  const { items, total, count, clear } = useCart();
  const [form, setForm]       = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [orderNum, setOrderNum] = useState<string | null>(null);
  const [error, setError]     = useState<string | null>(null);

  function update(field: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function submitOrder() {
    if (!form.firstName || !form.phone || !form.businessName || !form.address) {
      setError("Please fill in all required fields.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      // 1 — upsert customer
      const { data: customer, error: custErr } = await supabase
        .from("customers")
        .upsert(
          {
            business_name: form.businessName,
            contact_name: `${form.firstName} ${form.lastName}`.trim(),
            phone: form.phone,
            email: form.email || null,
            address: form.address,
            area: form.area,
            customer_type: form.customerType,
          },
          { onConflict: "email", ignoreDuplicates: false }
        )
        .select("id")
        .single();

      if (custErr) throw new Error(custErr.message);

      // 2 — create order
      const { data: order, error: orderErr } = await supabase
        .from("orders")
        .insert({
          customer_id:      customer.id,
          status:           "pending",
          total_amount:     total,
          delivery_address: `${form.address}, ${form.area}`,
          notes:            form.notes || null,
        })
        .select("id, order_number")
        .single();

      if (orderErr) throw new Error(orderErr.message);

      // 3 — create order items
      const itemRows = items.map(({ product, quantity }) => ({
        order_id:     order.id,
        product_sku:  product.id,
        product_name: product.nameEn,
        quantity,
        unit_price:   product.pricePerPiece,
        subtotal:     product.pricePerPiece * quantity,
      }));

      const { error: itemErr } = await supabase.from("order_items").insert(itemRows);
      if (itemErr) throw new Error(itemErr.message);

      // 4 — success
      setOrderNum(order.order_number);
      clear();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── Success screen ────────────────────────────────────────────────────────
  if (orderNum) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="w-16 h-16 bg-[#1B4D2E]/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={32} className="text-[#1B4D2E]" />
          </div>
          <h1 className="text-2xl font-bold text-[#111111] mb-1">Order Placed!</h1>
          <p className="text-gray-400 text-sm mb-4" dir="rtl">تم تقديم طلبك بنجاح</p>
          <div className="bg-[#F7F7F5] rounded-xl p-4 mb-6 border border-gray-200">
            <p className="text-xs text-gray-400 mb-1">Your Order Number</p>
            <p className="text-2xl font-bold text-[#1B4D2E] font-mono">{orderNum}</p>
          </div>
          <p className="text-gray-500 text-sm mb-8">
            Our team will contact you shortly to confirm delivery details and timing.
          </p>
          <Link href="/products" className="inline-flex items-center gap-2 bg-[#1B4D2E] text-white font-semibold px-6 py-3 rounded-lg hover:bg-[#163d24] transition-colors text-sm">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  // ── Empty cart ────────────────────────────────────────────────────────────
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

  const inputClass = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1B4D2E] transition-colors bg-white";
  const labelClass = "block text-xs font-medium text-gray-500 mb-1.5";
  const required   = <span className="text-red-400 ml-0.5">*</span>;

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
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* ── Form ────────────────────────────────────────────────────── */}
          <div className="lg:col-span-3 space-y-8">
            {/* Contact */}
            <section>
              <h2 className="text-sm font-semibold text-[#111111] uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">Contact Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>First Name {required}</label>
                  <input type="text" value={form.firstName} onChange={(e) => update("firstName", e.target.value)} className={inputClass} placeholder="Ahmed" />
                </div>
                <div>
                  <label className={labelClass}>Last Name</label>
                  <input type="text" value={form.lastName} onChange={(e) => update("lastName", e.target.value)} className={inputClass} placeholder="Hassan" />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Email</label>
                  <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className={inputClass} placeholder="ahmed@restaurant.eg" />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Phone {required}</label>
                  <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} className={inputClass} placeholder="+20 10 xxxx xxxx" />
                </div>
              </div>
            </section>

            {/* Delivery */}
            <section>
              <h2 className="text-sm font-semibold text-[#111111] uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">Delivery Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className={labelClass}>Business / Outlet Name {required}</label>
                  <input type="text" value={form.businessName} onChange={(e) => update("businessName", e.target.value)} className={inputClass} placeholder="Cairo Marriott Hotel" />
                </div>
                <div>
                  <label className={labelClass}>Customer Type</label>
                  <select value={form.customerType} onChange={(e) => update("customerType", e.target.value)} className={inputClass}>
                    <option value="restaurant">Restaurant</option>
                    <option value="hotel">Hotel</option>
                    <option value="cafe">Café</option>
                    <option value="catering">Catering</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Area</label>
                  <select value={form.area} onChange={(e) => update("area", e.target.value)} className={inputClass}>
                    {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Street Address {required}</label>
                  <input type="text" value={form.address} onChange={(e) => update("address", e.target.value)} className={inputClass} placeholder="16 Nile Corniche, Maadi" />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Delivery Notes</label>
                  <textarea rows={2} value={form.notes} onChange={(e) => update("notes", e.target.value)} className={`${inputClass} resize-none`} placeholder="Preferred delivery time, landmark, floor…" />
                </div>
              </div>
            </section>

            {/* Payment info */}
            <section>
              <h2 className="text-sm font-semibold text-[#111111] uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">Payment</h2>
              <div className="bg-[#F7F7F5] border border-gray-200 rounded-xl p-4 flex items-center gap-3 text-gray-500 text-sm">
                <Lock size={16} className="flex-shrink-0 text-[#1B4D2E]" />
                <div>
                  <p className="font-medium text-gray-700">Invoice on delivery</p>
                  <p className="text-xs text-gray-400 mt-0.5">Credit account customers receive an invoice with order. Cash customers pay on delivery.</p>
                </div>
              </div>
            </section>

            <button
              onClick={submitOrder}
              disabled={loading}
              className="w-full bg-[#1B4D2E] text-white font-semibold py-3.5 rounded-lg hover:bg-[#163d24] transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> Placing Order…</>
              ) : (
                "Place Order"
              )}
            </button>
            <p className="text-xs text-gray-400 text-center -mt-4">
              By placing this order you agree to our terms of service.
            </p>
          </div>

          {/* ── Order summary ───────────────────────────────────────────── */}
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
              <p className="text-xs text-gray-400 mt-3">VAT applies to taxable products per Egyptian regulations.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
