"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import {
  signUp as authSignUp,
  signIn as authSignIn,
  signOut as authSignOut,
  resetPasswordForEmail as authResetPasswordForEmail,
  updatePassword as authUpdatePassword,
  SignUpData,
} from "@/lib/auth";
import type { User, Session } from "@supabase/supabase-js";

// Company/customer rows for the logged-in user live in ActiveCompanyContext (a login can own several).
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  signUp: (data: SignUpData) => Promise<{ error: string | null; needsConfirmation: boolean }>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,     setUser]     = useState<User | null>(null);
  const [session,  setSession]  = useState<Session | null>(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
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
  }

  async function signUp(data: SignUpData) {
    return authSignUp(data).then((r) => ({
      error: r.error,
      needsConfirmation: r.needsConfirmation,
    }));
  }

  async function resetPassword(email: string) {
    return authResetPasswordForEmail(email);
  }

  async function updatePassword(newPassword: string) {
    return authUpdatePassword(newPassword);
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signOut, signUp, resetPassword, updatePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
