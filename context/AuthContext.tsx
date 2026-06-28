"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { signUp as authSignUp, signIn as authSignIn, signOut as authSignOut, SignUpData } from "@/lib/auth";
import type { User, Session } from "@supabase/supabase-js";

export interface CustomerProfile {
  id: string;
  name: string;
  business_name: string;
  phone: string;
  email: string;
  address: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  customer: CustomerProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  signUp: (data: SignUpData) => Promise<{ error: string | null; needsConfirmation: boolean }>;
  refreshCustomer: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

async function fetchCustomerProfile(userId: string): Promise<CustomerProfile | null> {
  const { data } = await supabase
    .from("customers")
    .select("*")
    .eq("id", userId)
    .single();
  return data as CustomerProfile | null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,     setUser]     = useState<User | null>(null);
  const [session,  setSession]  = useState<Session | null>(null);
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [loading,  setLoading]  = useState(true);

  async function refreshCustomer() {
    if (!user) { setCustomer(null); return; }
    const profile = await fetchCustomerProfile(user.id);
    setCustomer(profile);
  }

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        const profile = await fetchCustomerProfile(s.user.id);
        setCustomer(profile);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        const profile = await fetchCustomerProfile(s.user.id);
        setCustomer(profile);
      } else {
        setCustomer(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signIn(email: string, password: string) {
    const result = await authSignIn(email, password);
    return { error: result.error };
  }

  async function signOut() {
    await authSignOut();
    setUser(null);
    setSession(null);
    setCustomer(null);
  }

  async function signUp(data: SignUpData) {
    return authSignUp(data).then((r) => ({
      error: r.error,
      needsConfirmation: r.needsConfirmation,
    }));
  }

  return (
    <AuthContext.Provider value={{ user, session, customer, loading, signIn, signOut, signUp, refreshCustomer }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
