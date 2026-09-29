"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2, Banknote } from "lucide-react";

export default function SwitchToCashButton({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function switchToCash() {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        setError("Please log in to switch payment method.");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/paymob/switch-to-cash", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not switch payment.");
      router.push(`/order-confirmation/${orderId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <>
      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
      )}
      <button
        onClick={switchToCash}
        disabled={loading}
        className="flex items-center justify-center gap-2 w-full border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:border-[#1B4D2E] hover:text-[#1B4D2E] transition-colors text-sm disabled:opacity-60"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Banknote size={16} />}
        Pay Cash on Delivery Instead
      </button>
    </>
  );
}
