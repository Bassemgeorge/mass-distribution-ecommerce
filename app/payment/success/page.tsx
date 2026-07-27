"use client";

import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { useEffect } from "react";
import { useCart } from "@/lib/cartStore";

export default function PaymentSuccessPage() {
  const { clear } = useCart();

  useEffect(() => {
    clear();
  }, [clear]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center border border-gray-200 rounded-2xl p-8 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="text-[#1B4D2E]" size={36} />
        </div>

        <h1 className="text-2xl font-bold text-[#111111] mb-2">
          Payment Successful
        </h1>

        <p className="text-gray-500 text-sm mb-6">
          Thank you. Your payment was received and your order is being processed.
        </p>

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