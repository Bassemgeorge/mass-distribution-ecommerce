"use client";

import { ChevronDown } from "lucide-react";
import { useActiveCompany } from "@/context/ActiveCompanyContext";

// Only rendered for logins that own 2+ companies.
export default function CompanySwitcher({ dark = false }: { dark?: boolean }) {
  const { companies, activeCompany, setActiveCompanyId } = useActiveCompany();
  if (companies.length < 2) return null;

  return (
    <label className="block">
      <span className={`block text-[11px] font-semibold mb-1 ${dark ? "text-white/50" : "text-gray-400"}`}>
        Ordering for · <span dir="rtl">الطلب باسم</span>
      </span>
      <span className="relative block">
        <select
          value={activeCompany?.id ?? ""}
          onChange={(e) => setActiveCompanyId(e.target.value)}
          dir="auto"
          className={`w-full appearance-none rounded-lg border pl-2.5 pr-8 py-1.5 text-sm font-semibold focus:outline-none ${
            dark
              ? "bg-white/10 border-white/20 text-white focus:border-white/50"
              : "bg-white border-gray-200 text-[#111111] focus:border-[#1B4D2E]"
          }`}
        >
          {companies.map((c) => (
            <option key={c.id} value={c.id} className="text-[#111111]">
              {c.business_name}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className={`pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 ${dark ? "text-white/60" : "text-gray-400"}`} />
      </span>
    </label>
  );
}
