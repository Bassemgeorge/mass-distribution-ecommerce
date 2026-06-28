import { toProduct } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import HomeClient from "@/components/HomeClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featuredRes, countRes, catRes] = await Promise.all([
    supabase.from("products").select("*").eq("is_active", true).order("id").limit(8),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("products").select("category").eq("is_active", true),
  ]);

  const featured   = (featuredRes.data ?? []).map(toProduct);
  const totalCount = countRes.count ?? 0;

  const catMap: Record<string, number> = {};
  (catRes.data ?? []).forEach(({ category }: { category: string }) => {
    catMap[category] = (catMap[category] ?? 0) + 1;
  });
  const categoryCounts = Object.entries(catMap)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <HomeClient
      featured={featured}
      totalCount={totalCount}
      categoryCounts={categoryCounts}
    />
  );
}
