/**
 * lib/db.ts
 * Supabase fetch helpers + type mapper.
 * All pages import from here instead of from lib/products.ts.
 */

import { supabase } from "./supabase";

function normalizeCategory(category: string) {
  return category === "Vinegar" ? "Essentials" : category;
}

export interface DbProduct {
  id: number;
  name_en: string;
  name_ar: string;
  brand: string;
  category: string;
  price: number;
  carton_price: number | null;
  pack_size: string | null;
  case_count: string | null;
  image_url: string | null;
  is_active: boolean;
  stock: number;
  is_on_sale: boolean | null;
  original_carton_price: number | null;
}

function extractNumber(value: string | null | undefined) {
  if (!value) return 0;

  const match = value.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

export function toProduct(p: DbProduct) {
  const caseCountFromDb = extractNumber(p.case_count);
  const caseCountFromPackSize = extractNumber(p.pack_size);
  const caseCount = caseCountFromDb || caseCountFromPackSize || 1;

  return {
    id: String(p.id),
    brand: p.brand,
    category: normalizeCategory(p.category),
    nameEn: p.name_en,
    nameAr: p.name_ar,
    packSize: p.pack_size ?? "",
    caseCount,
    pricePerPiece: p.price,
    pricePerCarton: p.carton_price ?? p.price * caseCount,
    hasTax: false,
    image: p.image_url ?? "/placeholder-product.svg",
    onSale: p.is_on_sale ?? false,
    originalCartonPrice: p.original_carton_price ?? null,
  };
}

export type MappedProduct = ReturnType<typeof toProduct>;

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
  if (opts?.brand) q = q.eq("brand", opts.brand);
  if (opts?.limit) q = q.limit(opts.limit);

  const { data, error } = await q;

  return {
    data: (data as DbProduct[]) ?? [],
    error: error?.message ?? null,
  };
}

export async function getProductById(
  id: number
): Promise<{ data: DbProduct | null; error: string | null }> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  return {
    data: data as DbProduct | null,
    error: error?.message ?? null,
  };
}

export async function getCategoryCounts(): Promise<
  { category: string; count: number }[]
> {
  const { data } = await supabase
    .from("products")
    .select("category")
    .eq("is_active", true);

  if (!data) return [];

  const map: Record<string, number> = {};

  data.forEach(({ category }) => {
    const normalized = normalizeCategory(category);
    map[normalized] = (map[normalized] ?? 0) + 1;
  });

  return Object.entries(map)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => a.category.localeCompare(b.category));
}

export async function getBrandCounts(): Promise<
  { brand: string; count: number }[]
> {
  const { data } = await supabase
    .from("products")
    .select("brand")
    .eq("is_active", true);

  if (!data) return [];

  const map: Record<string, number> = {};

  data.forEach(({ brand }) => {
    map[brand] = (map[brand] ?? 0) + 1;
  });

  return Object.entries(map)
    .map(([brand, count]) => ({ brand, count }))
    .sort((a, b) => a.brand.localeCompare(b.brand));
}