"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function checkExistingAdminSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        if (!cancelled) setChecking(false);
        return;
      }

      const { data: isAdmin, error: adminErr } = await supabase.rpc("is_admin");

      if (cancelled) return;

      if (!adminErr && isAdmin === true) {
        router.replace("/admin");
        return;
      }

      setChecking(false);
    }

    checkExistingAdminSession();

    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError(null);
    setLoading(true);

    const { error: loginErr } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (loginErr) {
      setError("Invalid email or password.");
      setLoading(false);
      return;
    }

    const { data: isAdmin, error: adminErr } = await supabase.rpc("is_admin");

    if (adminErr || isAdmin !== true) {
      await supabase.auth.signOut();
      setError("Access denied. This account is not an admin.");
      setLoading(false);
      return;
    }

    router.replace("/admin");
  }

  const inputClass =
    "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1B4D2E] transition-colors bg-white";

  if (checking) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#1B4D2E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/logo-color.png.png"
            alt="Mass Distribution"
            width={140}
            height={42}
            className="h-11 w-auto mb-3"
          />

          <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest bg-white border border-gray-200 px-3 py-1 rounded-full">
            Admin Panel
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <h1 className="text-lg font-bold text-[#111111] mb-1">Admin Sign In</h1>
          <p className="text-gray-400 text-xs mb-6">
            Restricted access — authorised personnel only
          </p>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2.5 mb-4">
              <AlertCircle size={14} className="flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="admin@massdistribution.com"
                autoComplete="email"
                autoFocus
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClass} pr-10`}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1B4D2E] text-white font-semibold py-2.5 rounded-lg hover:bg-[#163d24] transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}