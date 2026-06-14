"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cartStore";
import { Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import ProductImage from "@/components/ProductImage";

export default function CartPage() {
  const { items, remove, update, total, count } = useCart();
  const [notes, setNotes] = useState("");

  if (count === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="max-w-sm mx-auto px-4 text-center">
          <div className="w-16 h-16 bg-[#F7F7F5] rounded-2xl flex items-center justify-center mx-auto mb-5">
            <ShoppingBag size={28} className="text-gray-300" />
          </div>
          <h1 className="text-xl font-bold text-[#111111] mb-1">Your Cart is Empty</h1>
          <p className="text-gray-400 text-sm mb-1" dir="rtl">سلة التسوق فارغة</p>
          <p className="text-gray-500 text-sm mb-6">Add some products to get started.</p>
          <Link href="/products" className="inline-flex items-center gap-2 bg-[#1B4D2E] text-white font-semibold px-6 py-3 rounded-lg hover:bg-[#163d24] transition-colors text-sm">
            Browse Products <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-[#F7F7F5] border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold text-[#111111]">
            Your Cart <span className="text-gray-400 text-lg font-normal">({count} {count === 1 ? "item" : "items"})</span>
          </h1>
          <p className="text-gray-400 text-sm mt-0.5" dir="rtl">سلة التسوق</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items list */}
          <div className="lg:col-span-2 space-y-3">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors">
                <div className="w-16 h-16 bg-[#F7F7F5] rounded-lg flex-shrink-0 overflow-hidden">
                  <ProductImage product={product} className="object-contain w-full h-full p-1.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-gray-400">{product.brand} · {product.category}</span>
                  <h3 className="font-semibold text-sm text-[#111111] leading-snug truncate">{product.nameEn}</h3>
                  <p className="text-xs text-gray-400 truncate" dir="rtl">{product.nameAr}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Case of {product.caseCount} pcs</p>
                  <p className="text-[#1B4D2E] font-semibold mt-0.5 text-sm">EGP {product.pricePerPiece.toFixed(2)} / pc</p>
                </div>
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                  <button
                    onClick={() => quantity > 1 ? update(product.id, quantity - 1) : remove(product.id)}
                    className="px-2.5 py-1.5 text-sm font-semibold hover:bg-gray-50 transition-colors"
                  >−</button>
                  <span className="px-2.5 py-1.5 text-sm font-semibold border-x border-gray-200 min-w-[2rem] text-center">{quantity}</span>
                  <button
                    onClick={() => update(product.id, quantity + 1)}
                    className="px-2.5 py-1.5 text-sm font-semibold hover:bg-gray-50 transition-colors"
                  >+</button>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-sm text-[#111111]">EGP {(product.pricePerPiece * quantity).toFixed(2)}</p>
                  <button onClick={() => remove(product.id)} className="mt-1 text-gray-300 hover:text-red-400 transition-colors" aria-label="Remove">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}

            {/* Notes field */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 mt-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Order Notes
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Delivery instructions, special requests, preferred time…"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#1B4D2E] resize-none transition-colors"
              />
            </div>
          </div>

          {/* Order summary */}
          <div>
            <div className="bg-[#F7F7F5] rounded-xl p-5 border border-gray-200 sticky top-24">
              <h2 className="text-base font-bold text-[#111111] mb-5">Order Summary</h2>
              <div className="space-y-2.5 text-sm mb-5">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal ({count} pcs)</span>
                  <span className="font-semibold text-[#111111]">EGP {total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Shipping</span>
                  <span className="font-medium text-[#1B4D2E]">At checkout</span>
                </div>
                <p className="text-xs text-gray-400">Prices ex-VAT. Tax calculated at checkout.</p>
                <div className="border-t border-gray-200 pt-2.5 flex justify-between font-bold text-sm">
                  <span>Total (ex-VAT)</span>
                  <span>EGP {total.toFixed(2)}</span>
                </div>
              </div>
              <Link
                href={`/checkout${notes ? `?notes=${encodeURIComponent(notes)}` : ""}`}
                className="block w-full text-center bg-[#1B4D2E] text-white font-semibold py-3 rounded-lg hover:bg-[#163d24] transition-colors text-sm"
              >
                Proceed to Checkout
              </Link>
              <Link href="/products" className="block w-full text-center text-gray-500 text-sm mt-3 hover:text-[#1B4D2E] transition-colors">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
