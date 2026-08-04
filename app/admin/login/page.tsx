"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

const inputClass =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-gray-300 focus:border-[#1B4D2E] focus:ring-2 focus:ring-[#1B4D2E]/15 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500";

export default function AdminLoginPage() {
  const router = useRouter();
  const submittingRef = useRef(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function checkExistingAdminSession() {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session?.user) return;

        const { data: isAdmin, error: adminError } = await supabase.rpc(
          "is_admin",
        );

        if (!adminError && isAdmin === true && !cancelled) {
          router.replace("/admin");
        }
      } catch {
        // Keep the sign-in form available if the existing session check fails.
      } finally {
        if (!cancelled) setChecking(false);
      }
    }

    void checkExistingAdminSession();

    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submittingRef.current) return;

    submittingRef.current = true;
    setError(null);
    setLoading(true);

    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (loginError) {
        setError("Invalid email or password.");
        return;
      }

      const { data: isAdmin, error: adminError } = await supabase.rpc(
        "is_admin",
      );

      if (adminError) {
        await supabase.auth.signOut();
        setError("We couldn't verify your access. Please try again.");
        return;
      }

      if (isAdmin !== true) {
        await supabase.auth.signOut();
        setError("Access denied. This account is not an admin.");
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch {
      await supabase.auth.signOut().catch(() => undefined);
      setError("Something went wrong. Please try again.");
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-[#F5F5F5]"
        role="status"
        aria-live="polite"
      >
        <Loader2
          className="h-6 w-6 animate-spin text-[#1B4D2E]"
          aria-hidden="true"
        />
        <span className="sr-only">Checking your session…</span>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F5F5F5] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center">
          <Image
            src="/logo-color.png.png"
            alt="Mass Distribution"
            width={140}
            height={42}
            className="mb-3 h-11 w-auto"
            priority
          />

          <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-widest text-gray-400">
            Admin Panel
          </span>
        </div>

        <section
          className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm"
          aria-labelledby="admin-sign-in-title"
        >
          <h1 id="admin-sign-in-title" className="mb-1 text-lg font-bold text-[#111111]">
            Admin Sign In
          </h1>
          <p className="mb-6 text-xs text-gray-400">
            Restricted access — authorised personnel only
          </p>

          {error && (
            <div
              id="login-error"
              role="alert"
              className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
            >
              <AlertCircle size={14} className="shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate={false}>
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-xs font-medium text-gray-500"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={inputClass}
                placeholder="admin@massdistribution.com"
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                autoFocus
                required
                disabled={loading}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "login-error" : undefined}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-xs font-medium text-gray-500"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className={`${inputClass} pr-12`}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  disabled={loading}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? "login-error" : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  disabled={loading}
                  className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4D2E] disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? (
                    <EyeOff size={16} aria-hidden="true" />
                  ) : (
                    <Eye size={16} aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1B4D2E] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#163d24] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4D2E] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                  Signing in…
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
