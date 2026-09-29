"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, RefreshCw } from "lucide-react";

export default function PaymentRetryButton({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function retry() {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch("/api/paymob/create-intention", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Payment service error.");
      window.location.href = data.checkoutUrl;
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
        onClick={retry}
        disabled={loading}
        className="flex items-center justify-center gap-2 w-full bg-[#1B4D2E] text-white font-semibold py-3 rounded-xl hover:bg-[#163d24] transition-colors text-sm disabled:opacity-60"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
        Try Again
      </button>
    </>
  );
}
