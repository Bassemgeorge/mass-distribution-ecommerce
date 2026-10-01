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
  vat_rate?: number | null;
  product_line?: string | null;
  product_type?: string | null;
  size_value?: number | string | null;
  size_unit?: string | null;
  size_band?: string | null;
  pack_type?: string | null;
}

export function formatSize(value: number, unit: string | null | undefined): string {
  if (unit === "ml" && value >= 1000) return `${value / 1000} L`;
  if (unit === "g" && value >= 1000) return `${value / 1000} kg`;
  return unit ? `${value} ${unit}` : String(value);
}

export function formatEGP(n: number): string {
  return "EGP " + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
    vatRate: p.vat_rate == null ? 0.14 : Number(p.vat_rate),
    hasTax: (p.vat_rate == null ? 0.14 : Number(p.vat_rate)) > 0,
    image: p.image_url ?? "/placeholder-product.svg",
    isOnSale: p.is_on_sale ?? false,
    originalCartonPrice: p.original_carton_price ?? null,
    // null means "unknown / not tracked"; treat as in-stock
    isSoldOut: p.stock !== null && p.stock <= 0,
    productLine: p.product_line ?? null,
    productType: p.product_type ?? null,
    // numeric columns arrive from PostgREST as strings
    sizeValue: p.size_value == null || p.size_value === "" ? null : Number(p.size_value),
    sizeUnit: p.size_unit ?? null,
    sizeBand: p.size_band ?? null,
    packType: p.pack_type ?? null,
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