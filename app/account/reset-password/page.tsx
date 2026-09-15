"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AlertCircle, CheckCircle, Eye, EyeOff, Loader2 } from "lucide-react";

export default function ResetPasswordPage() {
  const { user, loading, updatePassword } = useAuth();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSub] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    setError(null);
    setSub(true);
    const { error: err } = await updatePassword(password);
    setSub(false);
    if (err) {
      setError(err);
    } else {
      setDone(true);
      setTimeout(() => router.push("/account/dashboard"), 1800);
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
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 size={22} className="animate-spin text-gray-300" />
            </div>
          ) : done ? (
            <div className="text-center">
              <CheckCircle size={40} className="text-[#1B4D2E] mx-auto mb-4" />
              <h1 className="text-lg font-bold text-[#111111] mb-2">Password updated</h1>
              <p className="text-gray-500 text-sm">Taking you to your dashboard…</p>
            </div>
          ) : !user ? (
            <div className="text-center">
              <AlertCircle size={40} className="text-red-400 mx-auto mb-4" />
              <h1 className="text-lg font-bold text-[#111111] mb-2">Link expired or invalid</h1>
              <p className="text-gray-500 text-sm mb-6">
                This password reset link is no longer valid. Request a new one below.
              </p>
              <Link
                href="/account/forgot-password"
                className="inline-block w-full bg-[#1B4D2E] text-white font-semibold py-3 rounded-lg hover:bg-[#163d24] transition-colors text-sm"
              >
                Request New Link
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold text-[#111111] mb-1">Set New Password</h1>
              <p className="text-gray-400 text-sm mb-6" dir="rtl">تعيين كلمة مرور جديدة</p>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2.5 mb-5">
                  <AlertCircle size={15} className="flex-shrink-0" /> {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">New Password</label>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                      className={`${inp} pr-10`} placeholder="Min. 6 characters" autoComplete="new-password"
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Confirm New Password</label>
                  <input
                    type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    className={inp} placeholder="Repeat password" autoComplete="new-password"
                  />
                </div>

                <button
                  type="submit" disabled={submitting}
                  className="w-full bg-[#1B4D2E] text-white font-semibold py-3 rounded-lg hover:bg-[#163d24] transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {submitting ? <><Loader2 size={15} className="animate-spin" /> Updating…</> : "Update Password"}
                </button>
              </form>
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
