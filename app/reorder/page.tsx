"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2, PackageX } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRequireLogin } from "@/lib/useRequireLogin";
import { useActiveCompany } from "@/context/ActiveCompanyContext";
import { useReorder } from "@/components/reorder/useReorder";

// Used by the weekly reminder email: /reorder?order={id}&utm_source=reorder_email
function ReorderContent() {
  const { user } = useRequireLogin();
  const { companies, loading: companiesLoading } = useActiveCompany();
  const params = useSearchParams();
  const orderId = params.get("order") ?? "";
  const via = params.get("utm_source") === "reorder_email" ? "reorder_email" : "reorder";
  const { startReorder, ui } = useReorder();
  const started = useRef(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!user || companiesLoading || started.current) return;
    started.current = true;
    (async () => {
      if (!/^[0-9a-f-]{36}$/i.test(orderId)) {
        setNotFound(true);
        return;
      }
      // Normal RLS read, plus an explicit check that the order belongs to one of this login's companies
      // (staff accounts can read every order).
      const { data } = await supabase.from("orders").select("id, customer_id").eq("id", orderId).maybeSingle();
      if (!data || !companies.some((c) => c.id === data.customer_id)) {
        setNotFound(true);
        return;
      }
      startReorder(orderId, via);
    })();
  }, [user, companiesLoading, companies, orderId, via, startReorder]);

  if (notFound) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <PackageX size={36} className="text-gray-300 mx-auto mb-3" />
          <p className="font-semibold text-[#111111]">Order not found</p>
          <p className="text-sm text-gray-500" dir="rtl">
            الطلب مش موجود
          </p>
          <Link href="/account/orders" className="mt-4 inline-block text-sm font-semibold text-[#1B4D2E] hover:underline">
            My orders / طلباتي →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-gray-500 text-sm">
        <Loader2 size={24} className="animate-spin text-[#1B4D2E]" />
        Preparing your cart… <span dir="rtl">بنجهز السلة…</span>
        <Link href="/account/orders" className="mt-2 text-xs font-semibold text-[#1B4D2E] hover:underline">
          My orders / طلباتي
        </Link>
      </div>
      {ui}
    </div>
  );
}

export default function ReorderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 size={24} className="animate-spin text-[#1B4D2E]" />
        </div>
      }
    >
      <ReorderContent />
    </Suspense>
  );
}
