/**
 * Seed the Supabase products table from the local products catalog.
 *
 * Usage:
 *   npx tsx scripts/seed-products.ts
 *
 * Requires SUPABASE_SERVICE_KEY in .env.local for admin access (bypasses RLS).
 * OR relies on the permissive INSERT policy created in schema.sql.
 */

import { createClient } from "@supabase/supabase-js";
import { products } from "../lib/products";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or key in .env.local");
  process.exit(1);
}

const supabase = createClient(url, key);

const rows = products.map((p) => ({
  sku:           p.id,
  name_ar:       p.nameAr,
  name_en:       p.nameEn,
  brand:         p.brand,
  category:      p.category,
  unit_price:    p.pricePerPiece,
  pack_size:     `${p.caseCount} pcs/case`,
  min_order_qty: 1,
  stock_quantity: 9999,
  image_url:     null,
  is_active:     true,
}));

async function seed() {
  console.log(`Seeding ${rows.length} products into Supabase…`);

  // Upsert in batches of 50
  const BATCH = 50;
  let total = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error, count } = await supabase
      .from("products")
      .upsert(batch, { onConflict: "sku" });

    if (error) {
      console.error(`Batch ${i}–${i + batch.length} FAILED:`, error.message);
    } else {
      total += batch.length;
      console.log(`  ✓ ${total}/${rows.length}`);
    }
  }

  console.log("\nDone. Verifying count…");
  const { count } = await supabase.from("products").select("*", { count: "exact", head: true });
  console.log(`Products in Supabase: ${count}`);
}

seed().catch(console.error);
