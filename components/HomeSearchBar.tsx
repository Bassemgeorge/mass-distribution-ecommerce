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
    <form onSubmit={handleSearch} className="flex items-center gap-2 w-full max-w-2xl mx-auto">
      <div className="relative flex-1">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products... / ابحث عن منتج"
          className="w-full pl-11 pr-4 py-3.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#1B4D2E] shadow-sm bg-white transition-colors"
        />
      </div>
      <button
        type="submit"
        className="bg-[#1B4D2E] text-white px-6 py-3.5 rounded-xl text-sm font-semibold hover:bg-[#163d24] transition-colors whitespace-nowrap flex-shrink-0"
      >
        Search
      </button>
    </form>
  );
}
