"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Loader2 } from "lucide-react";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [updating, setUpdating] = useState(true);
  const [updated, setUpdated] = useState(false);

  useEffect(() => {
    async function markOrderPaid() {
      if (!orderId) {
        setUpdating(false);
        return;
      }

      try {
        const response = await fetch("/api/paymob/mark-paid", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId,
          }),
        });

        setUpdated(response.ok);
      } catch (error) {
        console.error("Mark paid error:", error);
        setUpdated(false);
      } finally {
        setUpdating(false);
      }
    }

    markOrderPaid();
  }, [orderId]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center border border-gray-200 rounded-2xl p-8 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="text-[#1B4D2E]" size={36} />
        </div>

        <h1 className="text-2xl font-bold text-[#111111] mb-2">
          Payment Successful
        </h1>

        <p className="text-gray-500 text-sm mb-4">
          Thank you. Your payment was received and your order is being processed.
        </p>

        {updating && (
          <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mb-4">
            <Loader2 size={14} className="animate-spin" />
            Updating order payment status...
          </div>
        )}

        {!updating && orderId && updated && (
          <p className="text-xs text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2 mb-4">
            Order payment status updated successfully.
          </p>
        )}

        {!updating && orderId && !updated && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-4">
            Payment succeeded, but the order status could not be updated automatically.
            Please contact support with your order ID.
          </p>
        )}

        <div className="flex flex-col gap-3">
          <Link
            href="/products"
            className="bg-[#1B4D2E] text-white font-semibold py-3 rounded-lg hover:bg-[#163d24] transition-colors"
          >
            Continue Shopping
          </Link>

          <Link
            href="/"
            className="border border-gray-200 text-gray-700 font-semibold py-3 rounded-lg hover:border-[#1B4D2E] transition-colors"
          >
            Back Home
          </Link>
        </div>
      </div>
    </div>
  );
}