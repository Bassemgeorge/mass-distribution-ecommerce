"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

const STORAGE_BASE = "https://niltkbrsuccfwlaistrz.supabase.co/storage/v1/object/public/product-images/wadifood/";

const IMAGE_BARCODES = [
  "6223000190029","6223000190036","6223000190135","6223000190296","6223000190401",
  "6223000190418","6223000190425","6223000190449","6223000190463","6223000190586",
  "6223000190623","6223000190630","6223000191118","6223000191125","6223000191132",
  "6223000191170","6223000191194","6223000191200","6223000191293","6223000191309",
  "6223000191385","6223000191392","6223000191408","6223000191439","6223000191569",
  "6223000192047","6223000192054","6223000192061","6223000192160","6223000192924",
  "6223000193532","6223000193761","6223000194737","6223000194812","6223000194881",
  "6223000194935","6223000196359","6223000197202","6223000198100","6223000198179",
  "6223000198407","6223000198414","6223000198650","6223000198667","6223000198865",
  "6223000198872","6223000198889","6223000198902","6223000198919","6223000198940",
  "6223000198995","6223000199008","6223000199039","6223000199046","6223000199053",
  "6223000199299","6223000199619","6223000199626","6223000199701","6223000199718",
  "6223000199725","6223000199732","6223000199749","6223000199756","6223000199763",
  "6223000199770","6223000199787","6223000199794","6223000199893","6223000200179",
  "6223000200223","6223000200315","6223000200322","6223008020007","6223008020090",
  "6223008020106","6223008020144","6223008020182",
];

interface Product {
  id: number;
  name_en: string;
  name_ar: string;
  image_url: string | null;
}

// barcode → product_id (pending changes)
type PendingMap = Record<string, number | "">;

export default function MatchImagesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  // current barcode → product_id assignment (from DB)
  const [currentMap, setCurrentMap] = useState<Record<string, number>>({});
  // pending overrides
  const [pending, setPending] = useState<PendingMap>({});
  const [copied, setCopied] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("products")
        .select("id, name_en, name_ar, image_url")
        .ilike("brand", "%wadi%")
        .order("category", { ascending: true })
        .order("name_en", { ascending: true });
      if (!data) return;

      const map: Record<string, number> = {};
      data.forEach((p: Product) => {
        if (p.image_url) {
          const match = p.image_url.match(/wadifood\/(\d+)\.png/);
          if (match) map[match[1]] = p.id;
        }
      });
      setCurrentMap(map);
      setProducts(data);
      setLoading(false);
    }
    load();
  }, []);

  const getAssigned = useCallback(
    (barcode: string): number | "" => {
      if (barcode in pending) return pending[barcode];
      return currentMap[barcode] ?? "";
    },
    [pending, currentMap]
  );

  const matchedCount = IMAGE_BARCODES.filter((b) => getAssigned(b) !== "").length;
  const pendingCount = Object.keys(pending).length;

  function handleChange(barcode: string, val: string) {
    setPending((prev) => ({ ...prev, [barcode]: val ? Number(val) : "" }));
  }

  function generateSQL() {
    const lines: string[] = [];
    for (const [barcode, productId] of Object.entries(pending)) {
      if (productId === "") {
        lines.push(`UPDATE products SET image_url = NULL WHERE id = ${productId};`);
      } else {
        lines.push(
          `UPDATE products SET image_url = '${STORAGE_BASE}${barcode}.png' WHERE id = ${productId};`
        );
      }
    }
    return lines.join("\n");
  }

  function copySQL() {
    const sql = generateSQL();
    if (!sql) return;
    navigator.clipboard.writeText(sql).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  const filteredBarcodes = search
    ? IMAGE_BARCODES.filter((b) => {
        const assignedId = getAssigned(b);
        if (b.includes(search)) return true;
        if (assignedId) {
          const p = products.find((x) => x.id === assignedId);
          if (p && (p.name_en.toLowerCase().includes(search.toLowerCase()) || p.name_ar.includes(search)))
            return true;
        }
        return false;
      })
    : IMAGE_BARCODES;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Loading products…
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Image ↔ Product Matching</h1>
          <p className="text-sm text-gray-500 mt-1">
            {matchedCount} of {IMAGE_BARCODES.length} images assigned
            {pendingCount > 0 && (
              <span className="ml-2 text-amber-600 font-medium">· {pendingCount} pending changes</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search barcode or product…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-56 focus:outline-none focus:border-[#1B4D2E]"
          />
          <button
            onClick={copySQL}
            disabled={pendingCount === 0}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              pendingCount === 0
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : copied
                ? "bg-green-600 text-white"
                : "bg-[#1B4D2E] text-white hover:bg-[#163d24]"
            }`}
          >
            {copied ? "✓ Copied!" : `Copy SQL (${pendingCount} changes)`}
          </button>
        </div>
      </div>

      {pendingCount > 0 && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          <strong>How to apply:</strong> Click &ldquo;Copy SQL&rdquo; → open{" "}
          <a
            href="https://supabase.com/dashboard/project/niltkbrsuccfwlaistrz/sql/new"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            Supabase SQL Editor
          </a>{" "}
          → paste → run.
        </div>
      )}

      {/* Progress bar */}
      <div className="w-full bg-gray-100 rounded-full h-2 mb-6">
        <div
          className="bg-[#1B4D2E] h-2 rounded-full transition-all"
          style={{ width: `${(matchedCount / IMAGE_BARCODES.length) * 100}%` }}
        />
      </div>

      {/* Image grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {filteredBarcodes.map((barcode) => {
          const assignedId = getAssigned(barcode);
          const isPending = barcode in pending;
          const assignedProduct = assignedId ? products.find((p) => p.id === assignedId) : null;

          return (
            <div
              key={barcode}
              className={`border rounded-xl overflow-hidden bg-white shadow-sm flex flex-col ${
                isPending ? "border-amber-400 ring-1 ring-amber-300" : assignedId ? "border-green-300" : "border-gray-200"
              }`}
            >
              {/* Image */}
              <div className="relative bg-gray-50 flex items-center justify-center" style={{ height: 150 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${STORAGE_BASE}${barcode}.png`}
                  alt={barcode}
                  className="max-w-full max-h-full object-contain p-2"
                  style={{ height: 146 }}
                />
                {assignedId && !isPending && (
                  <span className="absolute top-1 right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    ✓
                  </span>
                )}
                {isPending && (
                  <span className="absolute top-1 right-1 bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    !
                  </span>
                )}
              </div>

              {/* Barcode */}
              <div className="px-2 pt-1 pb-0.5 text-center text-[10px] text-gray-400 font-mono leading-tight">
                {barcode}
              </div>

              {/* Product dropdown */}
              <div className="p-2 pt-1">
                <select
                  value={assignedId === "" ? "" : String(assignedId)}
                  onChange={(e) => handleChange(barcode, e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-lg px-1.5 py-1 focus:outline-none focus:border-[#1B4D2E] bg-white"
                >
                  <option value="">— unassigned —</option>
                  {products.map((p) => (
                    <option key={p.id} value={String(p.id)}>
                      {p.name_en}
                    </option>
                  ))}
                </select>
                {assignedProduct && (
                  <p className="mt-0.5 text-[10px] text-gray-400 truncate text-center">
                    {assignedProduct.name_ar}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* SQL Preview */}
      {pendingCount > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">SQL Preview ({pendingCount} statements)</h2>
          <pre className="bg-gray-900 text-green-400 text-xs p-4 rounded-xl overflow-x-auto whitespace-pre-wrap">
            {generateSQL()}
          </pre>
        </div>
      )}
    </div>
  );
}
