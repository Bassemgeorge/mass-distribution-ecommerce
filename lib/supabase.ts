import { createClient } from "@supabase/supabase-js";

export const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? "https://niltkbrsuccfwlaistrz.supabase.co";
export const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "sb_publishable_vqGbSD64yqrc-kFECL0t9Q_ZrsYrw-k";

// Singleton — safe to import in any client component
export const supabase = createClient(supabaseUrl, supabaseAnon);
