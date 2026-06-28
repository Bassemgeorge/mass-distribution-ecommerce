"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [loading,  setLoading]  = useState(false);

  useEffect(() => {
    if (localStorage.getItem("admin_authenticated") === "true") {
      router.replace("/admin");
    }
  }, [router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setTimeout(() => {
      if (username === "admin" && password === "massadmin2024") {
        localStorage.setItem("admin_authenticated", "true");
        router.push("/admin");
      } else {
        setError("Invalid username or password.");
        setLoading(false);
      }
    }, 400);
  }

  const inp = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1B4D2E] transition-colors bg-white";

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <Image src="/logo-color.png.png" alt="Mass Distribution" width={140} height={42} className="h-11 w-auto mb-3" />
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest bg-white border border-gray-200 px-3 py-1 rounded-full">
            Admin Panel
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <h1 className="text-lg font-bold text-[#111111] mb-1">Sign In</h1>
          <p className="text-gray-400 text-xs mb-6">Restricted access — authorised personnel only</p>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2.5 mb-4">
              <AlertCircle size={14} className="flex-shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Username</label>
              <input
                type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                className={inp} placeholder="admin" autoComplete="username" autoFocus
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
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full bg-[#1B4D2E] text-white font-semibold py-2.5 rounded-lg hover:bg-[#163d24] transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? <><Loader2 size={14} className="animate-spin" /> Signing in…</> : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
