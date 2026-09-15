"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [submitting, setSub] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) { setError("Please enter your email address."); return; }
    setError(null);
    setSub(true);
    const { error: err } = await resetPassword(email);
    setSub(false);
    if (err) {
      setError(err);
    } else {
      setDone(true);
    }
  }

  const inp = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1B4D2E] transition-colors bg-white";

  return (
    <div className="min-h-screen bg-[#F7F7F5] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Link href="/">
            <Image src="/logo-color.png.png" alt="Mass Distribution" width={160} height={48} className="h-12 w-auto" />
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          {done ? (
            <div className="text-center">
              <CheckCircle size={40} className="text-[#1B4D2E] mx-auto mb-4" />
              <h1 className="text-lg font-bold text-[#111111] mb-2">Check your email</h1>
              <p className="text-gray-500 text-sm mb-2">
                If an account exists for <strong>{email}</strong>, we&apos;ve sent a link to reset your password.
              </p>
              <p className="text-gray-400 text-xs">Click the link in the email to choose a new password.</p>
              <Link href="/account/login" className="mt-6 inline-block text-sm font-medium text-[#1B4D2E] hover:underline">
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold text-[#111111] mb-1">Forgot Password</h1>
              <p className="text-gray-400 text-sm mb-6" dir="rtl">نسيت كلمة المرور</p>

              <p className="text-gray-500 text-sm mb-5">
                Enter the email address on your account and we&apos;ll send you a link to reset your password.
              </p>

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

                <button
                  type="submit" disabled={submitting}
                  className="w-full bg-[#1B4D2E] text-white font-semibold py-3 rounded-lg hover:bg-[#163d24] transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {submitting ? <><Loader2 size={15} className="animate-spin" /> Sending…</> : "Send Reset Link"}
                </button>
              </form>

              <p className="text-center text-xs text-gray-400 mt-6">
                Remembered your password?{" "}
                <Link href="/account/login" className="text-[#1B4D2E] font-medium hover:underline">Sign In</Link>
              </p>
            </>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          <Link href="/" className="hover:text-[#1B4D2E] transition-colors">← Back to store</Link>
        </p>
      </div>
    </div>
  );
}
