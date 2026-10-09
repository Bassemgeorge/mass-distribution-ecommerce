"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

export interface Company {
  id: string;
  business_name: string;
  name: string;
  is_credit: boolean;
  credit_terms: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  created_at: string | null;
  login_phone: string | null;
}

interface ActiveCompanyContextType {
  companies: Company[];
  activeCompany: Company | null;
  setActiveCompanyId: (id: string) => void;
  loading: boolean;
  refresh: () => Promise<void>;
}

const STORAGE_KEY = "md_active_company";

const ActiveCompanyContext = createContext<ActiveCompanyContextType | null>(null);

function readStored(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStored(id: string) {
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // storage unavailable (private mode) — selection just won't persist
  }
}

// A login can own several customers rows (group buyers); one of them is "active" for ordering.
export function ActiveCompanyProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (userId: string | null) => {
    if (!userId) {
      setCompanies([]);
      setActiveId(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data: list } = await supabase.rpc("my_companies");
    const ids = ((list as { id: string }[] | null) ?? []).map((c) => c.id);

    let rows: Company[] = [];
    if (ids.length > 0) {
      const { data: profiles } = await supabase
        .from("customers")
        .select("id, business_name, name, is_credit, credit_terms, phone, email, address, created_at, login_phone")
        .in("id", ids);
      const byId = new Map(((profiles as Company[] | null) ?? []).map((p) => [p.id, p]));
      // keep my_companies() ordering; fall back to its fields if the profile row didn't load
      rows = (list as Company[]).map((c) => ({ ...c, ...byId.get(c.id) }));
    }

    const stored = readStored();
    setCompanies(rows);
    setActiveId(rows.some((c) => c.id === stored) ? stored : (rows[0]?.id ?? null));
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    load(user?.id ?? null);
  }, [user?.id, authLoading, load]);

  const setActiveCompanyId = useCallback(
    (id: string) => {
      if (!companies.some((c) => c.id === id)) return;
      setActiveId(id);
      writeStored(id);
    },
    [companies]
  );

  const value = useMemo<ActiveCompanyContextType>(
    () => ({
      companies,
      activeCompany: companies.find((c) => c.id === activeId) ?? null,
      setActiveCompanyId,
      loading: authLoading || loading,
      refresh: () => load(user?.id ?? null),
    }),
    [companies, activeId, setActiveCompanyId, authLoading, loading, load, user?.id]
  );

  return <ActiveCompanyContext.Provider value={value}>{children}</ActiveCompanyContext.Provider>;
}

export function useActiveCompany() {
  const ctx = useContext(ActiveCompanyContext);
  if (!ctx) throw new Error("useActiveCompany must be used within ActiveCompanyProvider");
  return ctx;
}
