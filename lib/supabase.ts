import { createClient } from "@supabase/supabase-js";

export const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? "https://niltkbrsuccfwlaistrz.supabase.co";
export const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "sb_publishable_vqGbSD64yqrc-kFECL0t9Q_ZrsYrw-k";

// The reset-password page handles its recovery link itself (it must sign out any existing session first),
// so the client must not auto-consume tokens from the URL there.
const onResetPasswordPage =
  typeof window !== "undefined" && window.location.pathname.startsWith("/account/reset-password");

// Singleton — safe to import in any client component
export const supabase = createClient(supabaseUrl, supabaseAnon, {
  auth: { detectSessionInUrl: !onResetPasswordPage },
});
