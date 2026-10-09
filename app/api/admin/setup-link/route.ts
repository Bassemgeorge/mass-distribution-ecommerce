import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAnon, supabaseUrl } from "@/lib/supabase";

// Generates a password-setup (recovery) link for a customer's login, for staff to send on WhatsApp.
export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    return NextResponse.json({ error: "Not authorised." }, { status: 401 });
  }

  // Check the caller's role with their own JWT so RLS / is_sales() see the real user
  const asCaller = createClient(supabaseUrl, supabaseAnon, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: userData } = await asCaller.auth.getUser(token);
  if (!userData.user) {
    return NextResponse.json({ error: "Not authorised." }, { status: 401 });
  }
  const { data: isSales, error: roleError } = await asCaller.rpc("is_sales");
  if (roleError || isSales !== true) {
    return NextResponse.json({ error: "Not authorised." }, { status: 403 });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    return NextResponse.json({ error: "Server not configured." }, { status: 500 });
  }

  let customerId = "";
  try {
    customerId = String(((await request.json()) as { customer_id?: string }).customer_id ?? "");
  } catch {
    // fall through to the validation below
  }
  if (!customerId) {
    return NextResponse.json({ error: "Missing customer_id." }, { status: 400 });
  }

  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

  const { data: customer } = await admin.from("customers").select("user_id").eq("id", customerId).maybeSingle();
  if (!customer?.user_id) {
    return NextResponse.json({ error: "This customer has no login account yet." }, { status: 400 });
  }

  const { data: authUser, error: userError } = await admin.auth.admin.getUserById(customer.user_id);
  const email = authUser?.user?.email;
  if (userError || !email) {
    return NextResponse.json({ error: "Couldn't find the customer's login." }, { status: 400 });
  }

  const site = (process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin).replace(/\/$/, "");
  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "recovery",
    email,
    options: { redirectTo: `${site}/account/reset-password` },
  });
  const link = linkData?.properties?.action_link;
  if (linkError || !link) {
    console.error("[setup-link] generateLink failed", linkError?.message);
    return NextResponse.json({ error: "Couldn't create the setup link. Please try again." }, { status: 502 });
  }

  return NextResponse.json({ link });
}
