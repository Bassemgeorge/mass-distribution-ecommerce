"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const { signIn, user, loading } = useAuth();
  const router = useRouter();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [submitting, setSub]    = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  // Already logged in → go to dashboard
  useEffect(() => {
    if (!loading && user) router.replace("/account/dashboard");
  }, [user, loading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) { setError("Please enter your email and password."); return; }
    setError(null);
    setSub(true);
    const { error: err } = await signIn(email, password);
    if (err) {
      setError(err.includes("Invalid") ? "Incorrect email or password." : err);
      setSub(false);
    } else {
      router.push("/account/dashboard");
    }
  }

  const inp = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1B4D2E] transition-colors bg-white";

  return (
    <div className="min-h-screen bg-[#F7F7F5] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/">
            <Image src="/logo-color.png.png" alt="Mass Distribution" width={160} height={48} className="h-12 w-auto" />
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <h1 className="text-xl font-bold text-[#111111] mb-1">Sign In</h1>
          <p className="text-gray-400 text-sm mb-6" dir="rtl">تسجيل الدخول</p>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2.5 mb-5">
              <AlertCircle size={15} className="flex-shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Email address</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className={inp} placeholder="ahmed@restaurant.eg" autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                  className={`${inp} pr-10`} placeholder="••••••••" autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link href="/account/forgot-password" className="text-xs text-[#1B4D2E] hover:underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit" disabled={submitting}
              className="w-full bg-[#1B4D2E] text-white font-semibold py-3 rounded-lg hover:bg-[#163d24] transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {submitting ? <><Loader2 size={15} className="animate-spin" /> Signing in…</> : "Sign In"}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/account/register" className="text-[#1B4D2E] font-medium hover:underline">Register</Link>
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          <Link href="/" className="hover:text-[#1B4D2E] transition-colors">← Back to store</Link>
        </p>
      </div>
    </div>
  );
}
