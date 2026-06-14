import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const { data, error, count } = await supabase
    .from("products")
    .select("id, name_en", { count: "exact" })
    .limit(3);

  return NextResponse.json({
    env: {
      url_set:  !!url,
      url_prefix: url?.slice(0, 30),
      key_set:  !!key,
      key_prefix: key?.slice(0, 20),
    },
    query: { data, error, count },
  });
}
