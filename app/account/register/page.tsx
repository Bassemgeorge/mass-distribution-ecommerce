"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from "lucide-react";

const AREAS = ["Cairo", "Giza", "Alexandria", "New Cairo", "Sheikh Zayed", "6th of October", "Other"];
const CUSTOMER_TYPES = ["Restaurant", "Hotel", "Café", "Catering", "Other"];

export default function RegisterPage() {
  const { signUp, user, loading } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    businessName: "", contactName: "", phone: "",
    email: "", password: "", confirmPassword: "",
    area: "Cairo", customerType: "Restaurant", agreed: false,
  });
  const [showPw,   setShowPw]   = useState(false);
  const [submitting, setSub]    = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [done,     setDone]     = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/account/dashboard");
  }, [user, loading, router]);

  function set(field: string, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.businessName || !form.contactName || !form.phone || !form.email || !form.password) {
      setError("Please fill in all required fields."); return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters."); return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match."); return;
    }
    if (!form.agreed) {
      setError("Please agree to the terms and conditions."); return;
    }

    setSub(true);
    const { error: err, needsConfirmation } = await signUp({
      email: form.email, password: form.password,
      businessName: form.businessName, contactName: form.contactName,
      phone: form.phone, area: form.area, customerType: form.customerType,
    });

    if (err) {
      setError(err.includes("already registered") ? "An account with this email already exists." : err);
      setSub(false);
    } else if (needsConfirmation) {
      setDone(true);
    } else {
      router.push("/account/dashboard");
    }
  }

  const inp = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1B4D2E] transition-colors bg-white";
  const lbl = "block text-xs font-medium text-gray-500 mb-1.5";

  if (done) {
    return (
      <div className="min-h-screen bg-[#F7F7F5] flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-200 p-8 text-center">
          <CheckCircle size={40} className="text-[#1B4D2E] mx-auto mb-4" />
          <h1 className="text-lg font-bold text-[#111111] mb-2">Check your email</h1>
          <p className="text-gray-500 text-sm mb-2">We sent a confirmation link to <strong>{form.email}</strong>.</p>
          <p className="text-gray-400 text-xs">Click the link to activate your account, then sign in.</p>
          <Link href="/account/login" className="mt-6 inline-block text-sm font-medium text-[#1B4D2E] hover:underline">Go to Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F5] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link href="/">
            <Image src="/logo-color.png.png" alt="Mass Distribution" width={160} height={48} className="h-12 w-auto" />
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <h1 className="text-xl font-bold text-[#111111] mb-1">Create Account</h1>
          <p className="text-gray-400 text-sm mb-6" dir="rtl">إنشاء حساب جديد</p>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2.5 mb-5">
              <AlertCircle size={15} className="flex-shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={lbl}>Business / Outlet Name <span className="text-red-400">*</span></label>
              <input type="text" value={form.businessName} onChange={(e) => set("businessName", e.target.value)} className={inp} placeholder="Cairo Marriott Hotel" />
            </div>
            <div>
              <label className={lbl}>Contact Name <span className="text-red-400">*</span></label>
              <input type="text" value={form.contactName} onChange={(e) => set("contactName", e.target.value)} className={inp} placeholder="Ahmed Hassan" />
            </div>
            <div>
              <label className={lbl}>Phone Number <span className="text-red-400">*</span></label>
              <input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} className={inp} placeholder="+20 10 xxxx xxxx" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Area</label>
                <select value={form.area} onChange={(e) => set("area", e.target.value)} className={inp}>
                  {AREAS.map((a) => <option key={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Business Type</label>
                <select value={form.customerType} onChange={(e) => set("customerType", e.target.value)} className={inp}>
                  {CUSTOMER_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <div>
                <label className={lbl}>Email Address <span className="text-red-400">*</span></label>
                <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className={inp} placeholder="ahmed@restaurant.eg" autoComplete="email" />
              </div>
            </div>
            <div>
              <label className={lbl}>Password <span className="text-red-400">*</span></label>
              <div className="relative">
                <input type={showPw ? "text" : "password"} value={form.password} onChange={(e) => set("password", e.target.value)} className={`${inp} pr-10`} placeholder="Min. 6 characters" autoComplete="new-password" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div>
              <label className={lbl}>Confirm Password <span className="text-red-400">*</span></label>
              <input type="password" value={form.confirmPassword} onChange={(e) => set("confirmPassword", e.target.value)} className={inp} placeholder="Repeat password" autoComplete="new-password" />
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={form.agreed} onChange={(e) => set("agreed", e.target.checked)} className="mt-0.5 accent-[#1B4D2E]" />
              <span className="text-xs text-gray-500 leading-relaxed">
                I agree to the <span className="text-[#1B4D2E] font-medium">terms and conditions</span> of Mass Distribution.
              </span>
            </label>

            <button type="submit" disabled={submitting} className="w-full bg-[#1B4D2E] text-white font-semibold py-3 rounded-lg hover:bg-[#163d24] transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-60">
              {submitting ? <><Loader2 size={15} className="animate-spin" /> Creating account…</> : "Create Account"}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            Already have an account?{" "}
            <Link href="/account/login" className="text-[#1B4D2E] font-medium hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
