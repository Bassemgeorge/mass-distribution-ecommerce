"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Fuse from "fuse.js";
import ProductCard from "@/components/ProductCard";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";
import { getProducts, getCategoryCounts, getBrandCounts, toProduct, formatSize, MappedProduct } from "@/lib/db";
import { Search, SlidersHorizontal, X, AlertCircle, ChevronDown } from "lucide-react";

type FacetKey = "type" | "line" | "pack" | "size";

type Facet = {
  key: FacetKey;
  get: (p: MappedProduct) => string | null;
  label: string;
  labelAr: string;
  order?: string[];
  numeric?: boolean;
  optionLabels?: Record<string, string>;
  tagLabels?: Record<string, string>;
  format?: (v: string) => string;
};

const TYPE_FACET: Facet = {
  key: "type",
  get: (p) => p.productType,
  label: "Type",
  labelAr: "النوع",
  order: ["Sunflower", "Corn", "Blend", "Ghee", "Frying oil"],
  optionLabels: {
    Sunflower: "Sunflower · عباد الشمس",
    Corn: "Corn · ذرة",
    Blend: "Blend · خليط",
    Ghee: "Ghee · سمن",
    "Frying oil": "Frying oil (Olein) · زيت قلي (أولين)",
    "Soft drink": "Soft drink · مشروبات غازية",
    Juice: "Juice · عصير",
    "Energy drink": "Energy drink · مشروبات طاقة",
    Water: "Water · مياه",
    "Malt drink": "Malt drink · مشروب شعير",
    Syrup: "Syrup · سيرب",
  },
};

const LINE_FACET: Facet = { key: "line", get: (p) => p.productLine, label: "Brand", labelAr: "الماركة" };

const PACK_FACET: Facet = {
  key: "pack",
  get: (p) => p.packType,
  label: "Pack",
  labelAr: "العبوة",
  order: ["Can", "Plastic bottle", "Glass bottle", "Carton"],
  optionLabels: {
    Can: "Can · كانز",
    "Plastic bottle": "Plastic bottle · بلاستيك",
    "Glass bottle": "Glass bottle · زجاج",
    Carton: "Carton · كرتون (تتراباك)",
  },
};

const SIZE_BAND_FACET: Facet = {
  key: "size",
  get: (p) => p.sizeBand,
  label: "Size",
  labelAr: "الحجم",
  order: ["small", "medium", "large", "bulk"],
  optionLabels: {
    small: "Small (up to 1 L/kg) · صغير",
    medium: "Medium (1.3–2.5) · وسط",
    large: "Large (4–5) · كبير",
    bulk: "Bulk & catering (10+) · جملة ومطاعم",
  },
  tagLabels: { small: "Small", medium: "Medium", large: "Large", bulk: "Bulk" },
};

// Used when a category has sizes but no size bands: one option per actual size, e.g. "250ml"
const SIZE_VALUE_FACET: Facet = {
  key: "size",
  get: (p) => (p.sizeValue == null ? null : `${p.sizeValue}${p.sizeUnit ?? ""}`),
  label: "Size",
  labelAr: "الحجم",
  numeric: true,
  format: (v) => {
    const m = v.match(/^([\d.]+)(.*)$/);
    return m ? formatSize(Number(m[1]), m[2]) : v;
  },
};

// Data-driven: a facet shows for a category once it has ≥2 distinct non-null values there.
const FACETS: Facet[] = [TYPE_FACET, LINE_FACET, PACK_FACET, SIZE_BAND_FACET];

function optionLabel(f: Facet, v: string) {
  return f.optionLabels?.[v] ?? f.format?.(v) ?? v;
}

function tagLabel(f: Facet, v: string) {
  return f.tagLabels?.[v] ?? f.format?.(v) ?? v;
}

// Extra search terms per product_type, for spellings not in the product names
const TYPE_SEARCH_TERMS: Record<string, string[]> = {
  "Frying oil": ["Olein", "اولين", "أولين"],
};

function sortValues(values: string[], f: Facet) {
  if (f.numeric) return [...values].sort((a, b) => parseFloat(a) - parseFloat(b));
  const rank = (v: string) => {
    const i = f.order?.indexOf(v) ?? -1;
    return i === -1 ? Number.MAX_SAFE_INTEGER : i;
  };
  return [...values].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [allProducts, setAllProducts]       = useState<MappedProduct[]>([]);
  const [categories,  setCategories]        = useState<string[]>([]);
  const [brands,      setBrands]            = useState<string[]>([]);
  const [loading,     setLoading]           = useState(true);
  const [error,       setError]             = useState<string | null>(null);

  const [search,         setSearch]         = useState("");
  const [showFilters,    setShowFilters]    = useState(false);

  // Filters live in the URL so links are shareable and back/forward works
  const activeCategories = useMemo(() => searchParams.getAll("category"), [searchParams]);
  const activeBrand = searchParams.get("brand") ?? "All";
  const saleOnly = searchParams.get("sale") === "true";
  const facetParams: Record<FacetKey, string | null> = {
    type: searchParams.get("type"),
    line: searchParams.get("line"),
    pack: searchParams.get("pack"),
    size: searchParams.get("size"),
  };

  // Search text is typed locally; only sync it when the URL's value changes
  const urlSearch = searchParams.get("search") ?? "";
  useEffect(() => {
    setSearch(urlSearch);
  }, [urlSearch]);

  function updateParams(mutate: (p: URLSearchParams) => void, searchText = search) {
    const p = new URLSearchParams(searchParams.toString());
    mutate(p);
    if (searchText.trim()) p.set("search", searchText);
    else p.delete("search");
    const qs = p.toString();
    router.push(qs ? `/products?${qs}` : "/products", { scroll: false });
  }

  function setCategoryList(next: string[]) {
    updateParams((p) => {
      p.delete("category");
      next.forEach((c) => p.append("category", c));
      p.delete("type");
      p.delete("line");
      p.delete("pack");
      p.delete("size");
      const brand = p.get("brand");
      if (brand && next.length > 0 && !allProducts.some((x) => x.brand === brand && next.includes(x.category))) {
        p.delete("brand");
      }
    });
  }

  function setParam(key: string, value: string | null) {
    updateParams((p) => {
      if (value) p.set(key, value);
      else p.delete(key);
    });
  }

  // Fetch from Supabase
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [{ data: rows, error: err }, catCounts, brandCounts] = await Promise.all([
          getProducts(),
          getCategoryCounts(),
          getBrandCounts(),
        ]);
        if (err) { setError(err); return; }
        setAllProducts(rows.map(toProduct));
        setCategories(catCounts.map((c) => c.category));
        setBrands(brandCounts.map((b) => b.brand));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load products");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);
  const fuse = useMemo(
    () =>
      new Fuse(allProducts, {
        keys: [
          "nameEn",
          "nameAr",
          "brand",
          "category",
          { name: "typeTerms", getFn: (p) => TYPE_SEARCH_TERMS[p.productType ?? ""] ?? [] },
        ],
        // 0.5 = more permissive: catches worse typos at the cost of a few extra loose matches
        threshold: 0.5,
        includeScore: true,
      }),
    [allProducts]
  );

  // Brand chips are scoped to the selected categories
  const brandOptions = useMemo(() => {
    if (activeCategories.length === 0) return brands.map((b) => ({ brand: b, count: null as number | null }));
    const counts = new Map<string, number>();
    allProducts.forEach((p) => {
      if (activeCategories.includes(p.category)) counts.set(p.brand, (counts.get(p.brand) ?? 0) + 1);
    });
    return [...counts.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([brand, count]) => ({ brand, count }));
  }, [allProducts, activeCategories, brands]);

  // Facets available for the single selected category
  const activeFacets = useMemo(() => {
    if (activeCategories.length !== 1) return [];
    const inCat = allProducts.filter((p) => p.category === activeCategories[0]);
    const hasSizeBands = inCat.some((p) => p.sizeBand);
    return FACETS.map((f) => (f === SIZE_BAND_FACET && !hasSizeBands ? SIZE_VALUE_FACET : f))
      .map((f) => {
        const values = new Set<string>();
        inCat.forEach((p) => {
          const v = f.get(p);
          if (v) values.add(v);
        });
        return { ...f, values: sortValues([...values], f) };
      })
      .filter((f) => f.values.length >= 2);
  }, [allProducts, activeCategories]);

  const hasLineSort =
    activeCategories.length === 1 &&
    allProducts.some((p) => p.category === activeCategories[0] && p.productLine);

  // Products matching everything except the facet dropdowns
  const basePool = useMemo(() => {
    const pool = allProducts.filter((p) => {
      const matchCat   = activeCategories.length === 0 || activeCategories.includes(p.category);
      const matchBrand = activeBrand === "All" || p.brand === activeBrand;
      const matchSale  = !saleOnly || p.isOnSale;
      return matchCat && matchBrand && matchSale;
    });

    if (!search.trim()) return pool;

    // fuse.search() already returns results ordered best-match-first — preserve
    // that order instead of falling back to the original catalog order.
    const poolIds = new Set(pool.map((p) => p.id));
    return fuse
      .search(search)
      .map((r) => r.item)
      .filter((p) => poolIds.has(p.id));
  }, [allProducts, activeCategories, activeBrand, saleOnly, search, fuse]);

  function matchesFacets(p: MappedProduct, except?: FacetKey) {
    return activeFacets.every((f) => {
      const selected = facetParams[f.key];
      return f.key === except || !selected || f.get(p) === selected;
    });
  }

  const filtered = useMemo(() => {
    const result = basePool.filter((p) => matchesFacets(p));
    if (search.trim() || !hasLineSort) return result;
    return [...result].sort(
      (a, b) =>
        (a.productLine ?? "").localeCompare(b.productLine ?? "") ||
        (a.productType ?? "").localeCompare(b.productType ?? "") ||
        (a.sizeValue ?? Infinity) - (b.sizeValue ?? Infinity)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [basePool, activeFacets, facetParams.type, facetParams.line, facetParams.pack, facetParams.size, hasLineSort, search]);

  const activeFacetTags = activeFacets.filter((f) => facetParams[f.key]);
  const hideBrandChips = activeFacets.some((f) => f.key === "line");

  const hasActiveFilters =
  activeCategories.length > 0 ||
  activeBrand !== "All" ||
  search !== "" ||
  saleOnly ||
  activeFacetTags.length > 0;

  function clearAll() {
    setSearch("");
    router.push("/products", { scroll: false });
  }
  return (
    <div className="min-h-screen bg-white">
      {/* Page header */}
      <div className="bg-[#F7F7F5] border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold text-[#111111]">Product Catalog</h1>
          <p className="text-gray-400 text-sm mt-0.5" dir="rtl">كتالوج المنتجات</p>
          <p className="text-gray-500 text-sm mt-1">
            {loading ? "Loading…" : `${filtered.length} of ${allProducts.length} products`} · Credit pricing (ex-VAT)
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Error state */}
        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Search + filter toggle */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products in English or Arabic..."
              value={search}
              onChange={(e) => {
                const val = e.target.value;
                // Starting a fresh search (box was empty, now has text) — drop any
                // active brand/category/sale filters so the search isn't silently
                // scoped down to a subset the user didn't intend.
                if (search.trim() === "" && val.trim() !== "") {
                  updateParams((p) => {
                    ["category", "brand", "sale", "type", "line", "pack", "size"].forEach((k) => p.delete(k));
                  }, "");
                }
                setSearch(val);
              }}
              className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#1B4D2E] transition-colors bg-white"
            />
          </div>
          <button
            onClick={() => setParam("sale", saleOnly ? null : "true")}
            className={`flex items-center gap-1.5 px-4 py-2.5 border rounded-lg text-sm font-medium transition-colors ${
              saleOnly ? "border-red-500 bg-red-600 text-white" : "border-gray-200 text-gray-600 hover:border-red-300 bg-white"
            }`}
          >
            🏷️ Sale
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-medium transition-colors ${
              showFilters ? "border-[#1B4D2E] bg-[#1B4D2E] text-white" : "border-gray-200 text-gray-600 hover:border-gray-400 bg-white"
            }`}
          >
            <SlidersHorizontal size={15} />
            Filters
            {hasActiveFilters && <span className="w-1.5 h-1.5 bg-current rounded-full" />}
          </button>
          {hasActiveFilters && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1.5 px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-500 hover:text-red-500 hover:border-red-200 transition-colors bg-white"
            >
              <X size={14} /> Clear
            </button>
          )}
        </div>

        {/* Expandable filter panel */}
        {showFilters && (
          <div className="bg-[#F7F7F5] border border-gray-200 rounded-xl p-5 mb-6 space-y-4">
            {!hideBrandChips && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2.5">Brand</p>
              <div className="flex flex-wrap gap-2">
                {[{ brand: "All", count: null as number | null }, ...brandOptions].map(({ brand: b, count }) => (
                  <button
                    key={b}
                    onClick={() => setParam("brand", b === "All" ? null : b)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                      activeBrand === b
                        ? "bg-[#1B4D2E] text-white border-[#1B4D2E]"
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    {b}
                    {count != null && <span className="ml-1 opacity-60">{count}</span>}
                  </button>
                ))}
              </div>
            </div>
            )}

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2.5"  >Category</p>
              <div className="flex flex-wrap gap-2">
                {["All", ...categories].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      if (cat === "All") {
                        setCategoryList([]);
                        return;
                      }
                      setCategoryList(
                        activeCategories.includes(cat)
                          ? activeCategories.filter((c) => c !== cat)
                          : [...activeCategories, cat]
                      );
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                      (cat === "All"
                          ? activeCategories.length === 0
                          : activeCategories.includes(cat))
                          ? "bg-[#111111] text-white border-[#111111]"
                         : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Category-specific dropdowns */}
        {!loading && activeFacets.length > 0 && (
          <div className="bg-[#F7F7F5] border border-gray-200 rounded-xl p-4 mb-6">
            <div
              className={`grid gap-3 ${
                activeFacets.length >= 4
                  ? "grid-cols-2 lg:grid-cols-4"
                  : activeFacets.length === 3
                    ? "grid-cols-1 md:grid-cols-3"
                    : "grid-cols-1 md:grid-cols-2"
              }`}
            >
              {activeFacets.map((f) => {
                const selected = facetParams[f.key] ?? "";
                const others = basePool.filter((p) => matchesFacets(p, f.key));
                return (
                  <label key={f.key} className="block min-w-0">
                    <span className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                      {f.label} · <span dir="rtl">{f.labelAr}</span>
                    </span>
                    <span className="relative block">
                      <select
                        value={selected}
                        onChange={(e) => setParam(f.key, e.target.value || null)}
                        className={`w-full appearance-none rounded-lg border bg-white pl-3 pr-9 py-2.5 text-sm transition-colors focus:outline-none focus:border-[#1B4D2E] ${
                          selected ? "border-[#1B4D2E] text-[#1B4D2E] font-semibold" : "border-gray-200 text-gray-700"
                        }`}
                      >
                        <option value="">All ({others.length})</option>
                        {f.values.map((v) => {
                          const n = others.filter((p) => f.get(p) === v).length;
                          return (
                            <option key={v} value={v} disabled={n === 0 && v !== selected}>
                              {optionLabel(f, v)} ({n})
                            </option>
                          );
                        })}
                      </select>
                      <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </span>
                  </label>
                );
              })}
            </div>

            {activeFacetTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {activeFacetTags.map((f) => {
                  const v = facetParams[f.key]!;
                  return (
                    <span
                      key={f.key}
                      className="flex items-center gap-1.5 px-3 py-1 bg-[#1B4D2E] text-white text-xs font-medium rounded-full"
                    >
                      {tagLabel(f, v)}
                      <button onClick={() => setParam(f.key, null)} aria-label={`Remove ${v}`}>
                        <X size={11} />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Active filter chips */}
        {!showFilters && hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-4">
          {activeCategories.length > 0 &&
  activeCategories.map((cat) => (
    <span
      key={cat}
      className="flex items-center gap-1.5 px-3 py-1 bg-[#111111] text-white text-xs font-medium rounded-full"
    >
      {cat}
      <button
        onClick={() => setCategoryList(activeCategories.filter((c) => c !== cat))}
      >
        <X size={11} />
      </button>
    </span>
  ))}
          </div>
        )}

        {/* Loading skeleton grid */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-24 text-gray-400">
            <p className="text-lg font-semibold text-gray-600">No products found</p>
            <p className="text-sm mt-1">Try adjusting your filters or search term.</p>
            {hasActiveFilters && (
              <button onClick={clearAll} className="mt-4 text-sm text-[#1B4D2E] font-medium hover:underline">
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Product grid */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white">
        <div className="bg-[#F7F7F5] border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="h-7 w-40 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        </div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
