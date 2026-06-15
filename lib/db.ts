/**
 * lib/db.ts
 * Supabase fetch helpers + type mapper.
 * All pages import from here instead of from lib/products.ts.
 */

import { supabase } from "./supabase";

// ── Database row type ─────────────────────────────────────────────────────────
export interface DbProduct {
  id: number;
  name_en: string;
  name_ar: string;
  brand: string;
  category: string;
  price: number;              // unit/piece price, ex-VAT (EGP)
  carton_price: number | null; // price per carton (what customer pays)
  pack_size: string | null;   // e.g. "Case of 12 pcs"
  case_count: string | null;  // e.g. "12 pcs per carton"
  image_url: string | null;
  is_active: boolean;
  stock: number;
}

// ── Map DbProduct → the existing Product shape ────────────────────────────────
// Keeps ProductCard, ProductImage, cartStore working without changes.
export function toProduct(p: DbProduct) {
  const packCount = p.pack_size ? parseInt(p.pack_size.match(/\d+/)?.[0] ?? "1") : 1;
  return {
    id:             String(p.id),
    brand:          p.brand,
    category:       p.category,
    nameEn:         p.name_en,
    nameAr:         p.name_ar,
    packSize:       p.pack_size ?? `Case of ${packCount} pcs`,
    caseCount:      packCount,
    pricePerPiece:  p.price,
    // Use DB carton_price if set, otherwise compute from unit price × case count
    pricePerCarton: p.carton_price ?? (p.price * packCount),
    hasTax:         false,
    image:          p.image_url ?? "/placeholder-product.svg",
  };
}

export type MappedProduct = ReturnType<typeof toProduct>;

// ── Fetch helpers ─────────────────────────────────────────────────────────────

export async function getProducts(opts?: {
  category?: string;
  brand?: string;
  limit?: number;
}): Promise<{ data: DbProduct[]; error: string | null }> {
  let q = supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("id");

  if (opts?.category) q = q.eq("category", opts.category);
  if (opts?.brand)    q = q.eq("brand",    opts.brand);
  if (opts?.limit)    q = q.limit(opts.limit);

  const { data, error } = await q;
  return { data: (data as DbProduct[]) ?? [], error: error?.message ?? null };
}

export async function getProductById(id: number): Promise<{ data: DbProduct | null; error: string | null }> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();
  return { data: data as DbProduct | null, error: error?.message ?? null };
}

/** Returns [{ category, count }] sorted alphabetically */
export async function getCategoryCounts(): Promise<{ category: string; count: number }[]> {
  const { data } = await supabase
    .from("products")
    .select("category")
    .eq("is_active", true);
  if (!data) return [];
  const map: Record<string, number> = {};
  data.forEach(({ category }) => { map[category] = (map[category] ?? 0) + 1; });
  return Object.entries(map).map(([category, count]) => ({ category, count })).sort((a, b) => a.category.localeCompare(b.category));
}

/** Returns [{ brand, count }] sorted alphabetically */
export async function getBrandCounts(): Promise<{ brand: string; count: number }[]> {
  const { data } = await supabase
    .from("products")
    .select("brand")
    .eq("is_active", true);
  if (!data) return [];
  const map: Record<string, number> = {};
  data.forEach(({ brand }) => { map[brand] = (map[brand] ?? 0) + 1; });
  return Object.entries(map).map(([brand, count]) => ({ brand, count })).sort((a, b) => a.brand.localeCompare(b.brand));
}
