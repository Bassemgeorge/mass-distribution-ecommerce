"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export default function HomeSearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q) router.push(`/products?search=${encodeURIComponent(q)}`);
    else router.push("/products");
  }

  return (
    <form onSubmit={handleSearch} className="flex items-center gap-2 w-full mx-auto" style={{ maxWidth: 700 }}>
      <div className="relative flex-1">
        <Search size={20} className="absolute top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" style={{ left: 20 }} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products, brands or categories... / ابحث عن منتج"
          className="w-full border border-gray-200 rounded-full focus:outline-none focus:border-[#1B4D2E] shadow-sm bg-white transition-colors text-sm"
          style={{ height: 56, paddingLeft: 52, paddingRight: 20 }}
        />
      </div>
      <button
        type="submit"
        className="flex items-center gap-2 bg-[#1B4D2E] text-white font-semibold hover:bg-[#163d24] transition-colors whitespace-nowrap flex-shrink-0 rounded-full text-sm"
        style={{ height: 56, paddingLeft: 28, paddingRight: 28 }}
      >
        <Search size={16} />
        Search
      </button>
    </form>
  );
}
