"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { products, categories, brands } from "@/lib/products";
import { Search, SlidersHorizontal, X } from "lucide-react";

function ProductsContent() {
  const searchParams = useSearchParams();
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeBrand, setActiveBrand]       = useState("All");
  const [search, setSearch]                 = useState("");
  const [showFilters, setShowFilters]       = useState(false);

  useEffect(() => {
    const cat   = searchParams.get("category");
    const brand = searchParams.get("brand");
    if (cat)   setActiveCategory(cat);
    if (brand) setActiveBrand(brand);
  }, [searchParams]);

  const filtered = products.filter((p) => {
    const matchCat    = activeCategory === "All" || p.category === activeCategory;
    const matchBrand  = activeBrand    === "All" || p.brand    === activeBrand;
    const q = search.toLowerCase();
    const matchSearch = !q || p.nameEn.toLowerCase().includes(q) || p.nameAr.includes(q) || p.brand.toLowerCase().includes(q);
    return matchCat && matchBrand && matchSearch;
  });

  const hasActiveFilters = activeCategory !== "All" || activeBrand !== "All" || search !== "";

  function clearAll() {
    setActiveCategory("All");
    setActiveBrand("All");
    setSearch("");
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Page header */}
      <div className="bg-[#F7F7F5] border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold text-[#111111]">Product Catalog</h1>
          <p className="text-gray-400 text-sm mt-0.5" dir="rtl">كتالوج المنتجات</p>
          <p className="text-gray-500 text-sm mt-1">{filtered.length} of {products.length} products · Credit pricing (ex-VAT)</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search + filter toggle */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products in English or Arabic..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#1B4D2E] transition-colors bg-white"
            />
          </div>
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
            {/* Brand filter */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2.5">Brand</p>
              <div className="flex flex-wrap gap-2">
                {["All", ...brands].map((b) => (
                  <button
                    key={b}
                    onClick={() => setActiveBrand(b)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                      activeBrand === b
                        ? "bg-[#1B4D2E] text-white border-[#1B4D2E]"
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Category filter */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2.5">Category</p>
              <div className="flex flex-wrap gap-2">
                {["All", ...categories].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                      activeCategory === cat
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

        {/* Active filter chips */}
        {!showFilters && hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-4">
            {activeCategory !== "All" && (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-[#111111] text-white text-xs font-medium rounded-full">
                {activeCategory}
                <button onClick={() => setActiveCategory("All")}><X size={11} /></button>
              </span>
            )}
            {activeBrand !== "All" && (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-[#1B4D2E] text-white text-xs font-medium rounded-full">
                {activeBrand}
                <button onClick={() => setActiveBrand("All")}><X size={11} /></button>
              </span>
            )}
          </div>
        )}

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <p className="text-lg font-semibold text-gray-600">No products found</p>
            <p className="text-sm mt-1">Try adjusting your filters or search term.</p>
            <button onClick={clearAll} className="mt-4 text-sm text-[#1B4D2E] font-medium hover:underline">Clear all filters</button>
          </div>
        ) : (
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
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center text-gray-400">Loading...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
