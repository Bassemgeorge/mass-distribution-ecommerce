/**
 * Seed the Supabase `products` table from lib/products.ts.
 *
 * Run AFTER executing supabase/products-schema.sql in the SQL editor.
 *
 *   npm run seed
 *
 * Uses --env-file so no dotenv import needed.
 */
import { createClient } from "@supabase/supabase-js";
import { products } from "../lib/products";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or key. Check .env.local");
  process.exit(1);
}

const supabase = createClient(url, key);

const rows = products.map((p) => ({
  id:        parseInt(p.id, 10),
  name_en:   p.nameEn,
  name_ar:   p.nameAr,
  brand:     p.brand,
  category:  p.category,
  price:     p.pricePerPiece,
  pack_size: `Case of ${p.caseCount} pcs`,
  image_url: null,          // ProductImage component handles fallback chain
  is_active: true,
  stock:     999,
}));

async function seed() {
  console.log(`Seeding ${rows.length} products…`);

  // Upsert in batches of 50
  const BATCH = 50;
  let done = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error } = await supabase.from("products").upsert(batch, { onConflict: "id" });
    if (error) {
      console.error(`  ✗ batch ${i}–${i + batch.length}:`, error.message);
    } else {
      done += batch.length;
      console.log(`  ✓ ${done}/${rows.length}`);
    }
  }

  const { count } = await supabase.from("products").select("*", { count: "exact", head: true });
  console.log(`\nDone. Products in Supabase: ${count}`);
}

seed().catch(console.error);
