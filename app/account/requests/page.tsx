"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronRight, Loader2, PackageSearch, Plus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRequireLogin } from "@/lib/useRequireLogin";
import { useActiveCompany } from "@/context/ActiveCompanyContext";
import SourcingStatusPill from "@/components/SourcingStatusPill";
import { OPEN_STATUSES, formatCairo, formatCairoDate, kindLabel } from "@/lib/sourcing";

// Customer-safe columns only (no handler, internal notes or costs)
const COLUMNS = "id, ref, kind, details, status, created_at, due_at, quote_expires_at, customer_id";

interface RequestRow {
  id: string;
  ref: string;
  kind: string;
  details: string;
  status: string;
  created_at: string;
  due_at: string | null;
  quote_expires_at: string | null;
  customer_id: string;
}

export default function MyRequestsPage() {
  const { user } = useRequireLogin();
  const { companies, loading: companiesLoading } = useActiveCompany();
  const companyIdsKey = companies.map((c) => c.id).join(",");
  const multiCompany = companies.length > 1;
  const companyName = (id: string) => companies.find((c) => c.id === id)?.business_name ?? "—";
  const [rows, setRows] = useState<RequestRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || companiesLoading) return;
    const ids = companyIdsKey ? companyIdsKey.split(",") : [];
    if (ids.length === 0) {
      setRows([]);
      return;
    }
    // Filter by the login's own companies (staff accounts can otherwise read everyone's requests)
    supabase
      .from("sourcing_requests")
      .select(COLUMNS)
      .in("customer_id", ids)
      .order("created_at", { ascending: false })
      .then(({ data, error: err }) => {
        if (err) setError(err.message);
        setRows((data as RequestRow[]) ?? []);
      });
  }, [user, companiesLoading, companyIdsKey]);

  return (
    <div className="min-h-screen bg-[#F7F7F5]">
      <div className="bg-[#111111] text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link href="/account/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-4">
            <ArrowLeft size={14} /> Dashboard
          </Link>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold">My requests</h1>
              <p className="text-gray-400 text-sm mt-1" dir="rtl">طلباتي</p>
            </div>
            <Link
              href="/sourcing/new"
              className="inline-flex items-center gap-1.5 bg-white text-[#1B4D2E] text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-100"
            >
              <Plus size={15} /> New request / طلب جديد
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
        {rows === null ? (
          <div className="flex justify-center py-20">
            <Loader2 size={24} className="animate-spin text-[#1B4D2E]" />
          </div>
        ) : rows.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 text-center py-16 px-4">
            <PackageSearch size={32} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No requests yet.</p>
            <p className="text-gray-400 text-sm" dir="rtl">مفيش طلبات لسه.</p>
            <Link href="/sourcing/new" className="mt-3 inline-block text-sm text-[#1B4D2E] font-medium hover:underline">
              Request an item or beat your invoice →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {rows.map((r) => {
              const kind = kindLabel(r.kind);
              const firstLine = (r.details ?? "").split("\n")[0];
              const timing =
                r.status === "quoted" && r.quote_expires_at
                  ? `Valid until ${formatCairo(r.quote_expires_at)}`
                  : OPEN_STATUSES.includes(r.status) && r.due_at
                    ? `Quote by ${formatCairo(r.due_at)}`
                    : null;
              return (
                <Link
                  key={r.id}
                  href={`/account/requests/${r.id}`}
                  className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 px-5 py-4 hover:border-[#1B4D2E] transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-semibold text-[#111111]">{r.ref}</span>
                      <span className="text-xs text-gray-400">{formatCairoDate(r.created_at)}</span>
                      <span className="text-xs text-gray-500">
                        · {kind.en} / <span dir="rtl">{kind.ar}</span>
                      </span>
                    </div>
                    {multiCompany && (
                      <p className="text-xs font-medium text-[#1B4D2E] truncate mt-1" dir="auto">
                        <span className="text-gray-400 font-normal">Company · الشركة:</span> {companyName(r.customer_id)}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 truncate mt-1" dir="auto">
                      {firstLine}
                    </p>
                    {timing && <p className="text-xs text-gray-400 mt-1">{timing}</p>}
                  </div>
                  <SourcingStatusPill status={r.status} />
                  <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
