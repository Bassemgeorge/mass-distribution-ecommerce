"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { accountLabel, displayEmail } from "@/lib/identity";
import { AlertCircle, Eye, EyeOff, Loader2, MessageCircle } from "lucide-react";

type Phase = "checking" | "ready" | "expired";
type RecoveryResult = { ok: boolean; email: string | null };

/**
 * Applies the recovery link from the URL. A session already in this browser is signed out first
 * (locally), otherwise the new password would be saved on whoever happened to be logged in.
 * Must run at most once per page load: running it again would sign out the recovery session itself.
 */
async function applyRecoveryLink(): Promise<RecoveryResult> {
  try {
    const url = new URL(window.location.href);
    const hash = new URLSearchParams(url.hash.replace(/^#/, ""));
    const query = url.searchParams;

    const accessToken = hash.get("access_token");
    const refreshToken = hash.get("refresh_token");
    const code = query.get("code");
    const tokenHash = query.get("token_hash");
    const hasLink =
      !!accessToken || !!code || !!tokenHash || query.get("type") === "recovery" || hash.get("type") === "recovery";

    if (!hasLink || hash.get("error") || query.get("error")) return { ok: false, email: null };

    const { data: existing } = await supabase.auth.getSession();
    if (existing.session) await supabase.auth.signOut({ scope: "local" });

    let error: unknown = null;
    if (accessToken && refreshToken) {
      ({ error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken }));
    } else if (code) {
      ({ error } = await supabase.auth.exchangeCodeForSession(code));
    } else if (tokenHash) {
      ({ error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "recovery" }));
    } else {
      error = new Error("No recovery token in link");
    }

    if (error) return { ok: false, email: null };
    const { data } = await supabase.auth.getUser();
    return data.user ? { ok: true, email: data.user.email ?? null } : { ok: false, email: null };
  } catch {
    return { ok: false, email: null };
  }
}

// Module-level (not a ref): survives component remounts, e.g. when Next re-renders after the URL changes.
let recoveryRun: Promise<RecoveryResult> | null = null;
function applyRecoveryLinkOnce() {
  recoveryRun ??= applyRecoveryLink();
  return recoveryRun;
}

export default function ResetPasswordPage() {
  const router = useRouter();

  const [phase, setPhase] = useState<Phase>("checking");
  const [email, setEmail] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSub] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    applyRecoveryLinkOnce().then(({ ok, email: linkEmail }) => {
      if (!active) return;
      setEmail(linkEmail);
      setPhase(ok ? "ready" : "expired");
    });
    return () => {
      active = false;
    };
  }, []);

  // Don't leave tokens in the address bar / history. Next's router can write its initial URL back while it
  // is still settling, so strip again shortly after if the tokens reappear. History only — nothing auth-related.
  useEffect(() => {
    if (phase === "checking") return;
    const strip = () => {
      if (window.location.hash || window.location.search) {
        window.history.replaceState(window.history.state, "", window.location.pathname);
      }
    };
    strip();
    const timers = [300, 1000, 2500].map((ms) => window.setTimeout(strip, ms));
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [phase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) { setError("Password must be at least 6 characters. / كلمة السر لازم تكون ٦ حروف على الأقل."); return; }
    if (password !== confirmPassword) { setError("Passwords do not match. / كلمتين السر مش متطابقين."); return; }
    setError(null);
    setSub(true);

    // Supabase errors are never shown raw here; a missing session or a failed save means the link is no good
    const { data: current } = await supabase.auth.getSession();
    if (!current.session) {
      setSub(false);
      setPhase("expired");
      return;
    }
    const { error: err } = await supabase.auth.updateUser({ password });
    if (err) {
      setSub(false);
      setPhase("expired");
      return;
    }
    // Saved: end the recovery session so the customer signs in fresh with the new password
    await supabase.auth.signOut({ scope: "local" });
    const isPhoneAccount = !!email && !displayEmail(email);
    router.replace(`/account/login?reset=${isPhoneAccount ? "phone" : "email"}`);
  }

  const inp = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1B4D2E] transition-colors bg-white";
  const who = accountLabel(email);

  return (
    <div className="min-h-screen bg-[#F7F7F5] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Link href="/">
            <Image src="/logo-color.png.png" alt="Mass Distribution" width={160} height={48} className="h-12 w-auto" />
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          {phase === "checking" ? (
            <div className="flex justify-center py-8">
              <Loader2 size={22} className="animate-spin text-gray-300" />
            </div>
          ) : phase === "expired" ? (
            <div className="text-center">
              <AlertCircle size={40} className="text-red-400 mx-auto mb-4" />
              <h1 className="text-lg font-bold text-[#111111] mb-2">Link expired</h1>
              <p className="text-gray-600 text-sm">This link has expired. Contact us on WhatsApp for a new one.</p>
              <p className="text-gray-500 text-sm mt-1 mb-6" dir="rtl">اللينك ده انتهى، كلمنا واتساب نبعتلك لينك جديد.</p>
              <a
                href="https://wa.me/201288895916"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 bg-[#25D366] text-white font-semibold py-3 rounded-lg hover:bg-[#1ebe5d] transition-colors text-sm"
              >
                <MessageCircle size={16} /> WhatsApp <span dir="ltr">+20 128 889 5916</span>
              </a>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold text-[#111111] mb-1">Set New Password</h1>
              <p className="text-gray-400 text-sm mb-4" dir="rtl">تعيين كلمة مرور جديدة</p>

              {who && (
                <div className="mb-5 rounded-lg bg-[#F7F7F5] border border-gray-200 px-3 py-2.5 text-sm">
                  <p className="text-gray-500">
                    Setting a password for: <span className="font-semibold text-[#111111]" dir="ltr">{who}</span>
                  </p>
                  <p className="text-gray-500 mt-0.5" dir="rtl">
                    تعيين كلمة سر لـ: <span className="font-semibold text-[#111111]" dir="ltr">{who}</span>
                  </p>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2.5 mb-5">
                  <AlertCircle size={15} className="flex-shrink-0" /> {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">New Password · <span dir="rtl">كلمة السر الجديدة</span></label>
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
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Confirm New Password · <span dir="rtl">تأكيد كلمة السر</span></label>
                  <input
                    type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    className={inp} placeholder="Repeat password" autoComplete="new-password"
                  />
                </div>

                <button
                  type="submit" disabled={submitting}
                  className="w-full bg-[#1B4D2E] text-white font-semibold py-3 rounded-lg hover:bg-[#163d24] transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {submitting ? <><Loader2 size={15} className="animate-spin" /> Saving…</> : "Save Password / حفظ كلمة السر"}
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
