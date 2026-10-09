import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAnon, supabaseUrl } from "@/lib/supabase";

const GENERIC_ERROR = "Wrong mobile number or password / رقم الموبايل أو كلمة السر غير صحيحة";
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000;

// Best-effort per-instance limiter (serverless instances don't share memory).
const attempts = new Map<string, { count: number; resetAt: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || entry.resetAt <= now) {
    attempts.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT;
}

function clientIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

export async function POST(request: Request) {
  const url = supabaseUrl;
  const anonKey = supabaseAnon;

  if (rateLimited(clientIp(request))) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait a few minutes and try again. / محاولات كتير، حاول تاني بعد شوية." },
      { status: 429 }
    );
  }

  let phone = "";
  let password = "";
  try {
    const body = (await request.json()) as { phone?: string; password?: string };
    phone = String(body.phone ?? "");
    password = String(body.password ?? "");
  } catch {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  if (phone.replace(/\D/g, "").length < 10 || !password) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    return NextResponse.json({ error: "Sign-in is temporarily unavailable." }, { status: 500 });
  }

  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: email, error: lookupError } = await admin.rpc("auth_email_for_phone", { p_phone: phone });
  if (lookupError || typeof email !== "string" || !email) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  const anon = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await anon.auth.signInWithPassword({ email, password });
  if (error || !data.session) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  // Only the session tokens go back to the browser — never the email
  return NextResponse.json({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  });
}
