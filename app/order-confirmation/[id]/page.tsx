"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { CheckCircle, MessageCircle, ArrowRight, Package } from "lucide-react";

interface OrderItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

interface Order {
  id: string;
  status: string;
  total: number;
  notes: string | null;
  created_at: string;
  customers: { name: string; business_name: string; phone: string; address: string } | null;
  order_items: OrderItem[];
}

export default function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data, error: err } = await supabase
        .from("orders")
        .select(`
          id, status, total, notes, created_at,
          customers ( name, business_name, phone, address ),
          order_items ( product_name, quantity, unit_price, subtotal )
        `)
        .eq("id", id)
        .single();

      if (err || !data) {
        setError("Order not found.");
      } else {
        setOrder(data as unknown as Order);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  // Short readable order reference from UUID
  const shortId = id.split("-")[0].toUpperCase();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="w-8 h-8 border-2 border-[#1B4D2E] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Loading your order…</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-sm mb-4">{error ?? "Order not found."}</p>
          <Link href="/products" className="text-sm text-[#1B4D2E] font-medium hover:underline">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F5]">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Success header */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center mb-4">
          <div className="w-16 h-16 bg-[#1B4D2E]/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={36} className="text-[#1B4D2E]" />
          </div>

          <h1 className="text-2xl font-bold text-[#111111] mb-1">Order Received!</h1>
          <p className="text-gray-400 text-sm mb-4" dir="rtl">تم استلام طلبك</p>

          <div className="bg-[#F7F7F5] rounded-xl px-5 py-3 inline-block mb-5">
            <p className="text-xs text-gray-400 mb-0.5">Order Reference</p>
            <p className="text-xl font-bold text-[#1B4D2E] font-mono">#{shortId}</p>
          </div>

          <p className="text-gray-600 text-sm leading-relaxed mb-1">
            Your order has been received. Our team will contact you within 2 hours to confirm delivery.
          </p>
          <p className="text-gray-400 text-sm leading-relaxed" dir="rtl">
            تم استلام طلبك. سيتواصل معك فريقنا خلال ساعتين لتأكيد التوصيل.
          </p>
        </div>

        {/* Order items */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
          <h2 className="text-sm font-bold text-[#111111] uppercase tracking-wider mb-4 flex items-center gap-2">
            <Package size={15} className="text-[#1B4D2E]" /> Order Items
          </h2>
          <div className="space-y-2.5 mb-4">
            {order.order_items.map((item, i) => (
              <div key={i} className="flex justify-between items-start text-sm">
                <div className="flex-1 mr-4">
                  <p className="font-medium text-[#111111] leading-snug">{item.product_name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {item.quantity} × EGP {item.unit_price.toFixed(2)}
                  </p>
                </div>
                <p className="font-semibold text-[#111111] flex-shrink-0">EGP {item.subtotal.toFixed(2)}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-sm">
            <span>Total (ex-VAT)</span>
            <span className="text-[#1B4D2E]">EGP {order.total.toFixed(2)}</span>
          </div>
          {order.notes && (
            <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100">
              <span className="font-medium">Notes:</span> {order.notes}
            </p>
          )}
        </div>

        {/* Customer info */}
        {order.customers && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
            <h2 className="text-sm font-bold text-[#111111] uppercase tracking-wider mb-3">Delivery To</h2>
            <p className="text-sm font-semibold text-[#111111]">{order.customers.business_name}</p>
            <p className="text-sm text-gray-500">{order.customers.name}</p>
            <p className="text-sm text-gray-500">{order.customers.phone}</p>
            <p className="text-sm text-gray-500">{order.customers.address}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href="https://wa.me/201000000000"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-white font-semibold py-3 rounded-xl hover:bg-[#1ebe5d] transition-colors text-sm"
          >
            <MessageCircle size={18} />
            Follow up on WhatsApp
          </a>
          <Link
            href="/products"
            className="flex-1 flex items-center justify-center gap-2 border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:border-[#1B4D2E] hover:text-[#1B4D2E] transition-colors text-sm"
          >
            Continue Shopping <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
