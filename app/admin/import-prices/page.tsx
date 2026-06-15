"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Download, Upload, CheckCircle, XCircle, Loader2, AlertTriangle } from "lucide-react";

interface CsvRow {
  id: string;
  name_en: string;
  carton_price: string;
  price: string;
  brand: string;
  category: string;
  pack_size: string;
  [key: string]: string;
}

interface ImportResult {
  id: number;
  name_en: string;
  carton_price: number;
  ok: boolean;
  error?: string;
}

export default function ImportPricesPage() {
  const [products, setProducts]     = useState<{ id: number; name_en: string; name_ar: string; brand: string; category: string; pack_size: string | null; price: number; carton_price: number | null }[]>([]);
  const [loadingDb, setLoadingDb]   = useState(true);
  const [dragging, setDragging]     = useState(false);
  const [fileName, setFileName]     = useState<string | null>(null);
  const [rows, setRows]             = useState<CsvRow[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importing, setImporting]   = useState(false);
  const [results, setResults]       = useState<ImportResult[] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.from("products").select("id,name_en,name_ar,brand,category,pack_size,price,carton_price").order("id")
      .then(({ data }) => { setProducts((data as typeof products) ?? []); setLoadingDb(false); });
  }, []);

  // ── CSV Export ────────────────────────────────────────────────────────────
  function exportCSV(source: typeof products) {
    const header = ["id", "name_en", "name_ar", "brand", "category", "pack_size", "price", "carton_price"];
    const csvRows = source.map((p) => [
      p.id,
      `"${(p.name_en  ?? "").replace(/"/g, '""')}"`,
      `"${(p.name_ar  ?? "").replace(/"/g, '""')}"`,
      `"${(p.brand    ?? "").replace(/"/g, '""')}"`,
      `"${(p.category ?? "").replace(/"/g, '""')}"`,
      `"${(p.pack_size ?? "").replace(/"/g, '""')}"`,
      p.price ?? 0,
      p.carton_price ?? "",
    ]);
    const csv  = [header.join(","), ...csvRows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `mass-dist-prices-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── CSV Parse ─────────────────────────────────────────────────────────────
  function parseCSV(text: string): CsvRow[] {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) throw new Error("File has no data rows.");
    const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, "").toLowerCase());
    if (!headers.includes("id") || !headers.includes("carton_price")) {
      throw new Error('CSV must have "id" and "carton_price" columns.');
    }
    return lines.slice(1).map((line) => {
      // Simple CSV split — handles quoted fields with commas
      const cols: string[] = [];
      let cur = "", inQuote = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') { inQuote = !inQuote; }
        else if (ch === "," && !inQuote) { cols.push(cur); cur = ""; }
        else { cur += ch; }
      }
      cols.push(cur);
      const row: CsvRow = {} as CsvRow;
      headers.forEach((h, i) => { row[h] = (cols[i] ?? "").trim(); });
      return row;
    });
  }

  function handleFile(file: File) {
    setParseError(null);
    setResults(null);
    if (!file.name.endsWith(".csv")) {
      setParseError("Please upload a .csv file.");
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = parseCSV(e.target?.result as string);
        setRows(parsed);
      } catch (err: unknown) {
        setParseError(err instanceof Error ? err.message : "Failed to parse CSV.");
        setRows([]);
      }
    };
    reader.readAsText(file);
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  // ── Import ────────────────────────────────────────────────────────────────
  async function runImport() {
    setImporting(true);
    setResults(null);

    const updates = rows
      .map((r) => ({ id: parseInt(r.id, 10), carton_price: parseFloat(r.carton_price), name_en: r.name_en ?? "" }))
      .filter((r) => !isNaN(r.id) && !isNaN(r.carton_price) && r.carton_price > 0);

    const out: ImportResult[] = [];
    const BATCH = 20;
    for (let i = 0; i < updates.length; i += BATCH) {
      const slice = updates.slice(i, i + BATCH);
      await Promise.all(
        slice.map(async ({ id, carton_price, name_en }) => {
          const { error } = await supabase.from("products").update({ carton_price }).eq("id", id);
          out.push({ id, name_en, carton_price, ok: !error, error: error?.message });
        })
      );
    }

    setResults(out);
    setImporting(false);
  }

  const skipped   = rows.filter((r) => !r.carton_price || isNaN(parseFloat(r.carton_price)) || parseFloat(r.carton_price) <= 0);
  const toImport  = rows.filter((r) => r.carton_price && !isNaN(parseFloat(r.carton_price)) && parseFloat(r.carton_price) > 0);
  const succeeded = results?.filter((r) => r.ok).length ?? 0;
  const failed    = results?.filter((r) => !r.ok).length ?? 0;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-[#111111]">Import Prices</h1>
        <p className="text-gray-400 text-sm mt-0.5">Bulk update carton prices from a CSV file</p>
      </div>

      {/* Instructions */}
      <div className="bg-[#E8F5E9] border border-green-200 rounded-xl px-5 py-4 text-sm text-[#1B4D2E] space-y-1.5">
        <p className="font-semibold">How to update prices:</p>
        <ol className="list-decimal list-inside space-y-1 text-[#1B4D2E]/80">
          <li>Download the current price list using the button below.</li>
          <li>Open the CSV in Excel and fill in the <strong>carton_price</strong> column for each product.</li>
          <li>Save the file as CSV (keep the same column headers).</li>
          <li>Upload the updated file here — only rows with a valid carton_price will be updated.</li>
        </ol>
      </div>

      {/* Download button */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-sm text-[#111111]">Step 1 — Download Current Price List</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {loadingDb ? "Loading…" : `${products.length} products · CSV with id, name, brand, category, pack_size, price, carton_price`}
          </p>
        </div>
        <button
          onClick={() => exportCSV(products)}
          disabled={loadingDb || products.length === 0}
          className="flex items-center gap-2 bg-[#1B4D2E] text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-[#163d24] transition-colors disabled:opacity-40 flex-shrink-0"
        >
          <Download size={14} /> Download Price List
        </button>
      </div>

      {/* Upload area */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <p className="font-semibold text-sm text-[#111111]">Step 2 — Upload Updated CSV</p>

        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
            dragging ? "border-[#1B4D2E] bg-[#E8F5E9]" : "border-gray-200 hover:border-[#1B4D2E] hover:bg-[#F7F7F5]"
          }`}
        >
          <Upload size={28} className={`mx-auto mb-3 ${dragging ? "text-[#1B4D2E]" : "text-gray-300"}`} />
          {fileName ? (
            <>
              <p className="text-sm font-semibold text-[#1B4D2E]">{fileName}</p>
              <p className="text-xs text-gray-400 mt-1">Click to change file</p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-gray-500">Drag & drop your CSV here, or click to browse</p>
              <p className="text-xs text-gray-400 mt-1">.csv files only</p>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
          />
        </div>

        {parseError && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
            <AlertTriangle size={15} className="flex-shrink-0" /> {parseError}
          </div>
        )}
      </div>

      {/* Preview table */}
      {rows.length > 0 && !parseError && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="font-semibold text-sm text-[#111111]">Step 3 — Preview & Import</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {toImport.length} rows will be updated · {skipped.length} skipped (empty carton_price)
              </p>
            </div>
            <button
              onClick={runImport}
              disabled={importing || toImport.length === 0}
              className="flex items-center gap-2 bg-[#1B4D2E] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#163d24] transition-colors disabled:opacity-40"
            >
              {importing
                ? <><Loader2 size={14} className="animate-spin" /> Importing…</>
                : <><Upload size={14} /> Import {toImport.length} Prices</>}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-3 py-2 font-semibold text-gray-400 uppercase tracking-wide">ID</th>
                  <th className="text-left px-3 py-2 font-semibold text-gray-400 uppercase tracking-wide">Name</th>
                  <th className="text-left px-3 py-2 font-semibold text-gray-400 uppercase tracking-wide">Brand</th>
                  <th className="text-right px-3 py-2 font-semibold text-gray-400 uppercase tracking-wide">Current Price</th>
                  <th className="text-right px-3 py-2 font-semibold text-gray-400 uppercase tracking-wide">New Carton Price</th>
                  <th className="text-center px-3 py-2 font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rows.slice(0, 10).map((r, i) => {
                  const hasPrice  = r.carton_price && !isNaN(parseFloat(r.carton_price)) && parseFloat(r.carton_price) > 0;
                  const result    = results?.find((res) => res.id === parseInt(r.id, 10));
                  return (
                    <tr key={i} className={`${!hasPrice ? "opacity-40" : ""}`}>
                      <td className="px-3 py-2 font-mono text-gray-400">{r.id}</td>
                      <td className="px-3 py-2 text-gray-700 max-w-[180px] truncate">{r.name_en}</td>
                      <td className="px-3 py-2 text-gray-500">{r.brand}</td>
                      <td className="px-3 py-2 text-right text-gray-500">
                        {r.price ? `EGP ${parseFloat(r.price).toFixed(2)}` : "—"}
                      </td>
                      <td className="px-3 py-2 text-right font-semibold text-[#1B4D2E]">
                        {hasPrice ? `EGP ${parseFloat(r.carton_price).toFixed(2)}` : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {result ? (
                          result.ok
                            ? <CheckCircle size={14} className="inline text-green-500" />
                            : <XCircle    size={14} className="inline text-red-400" />
                        ) : hasPrice ? (
                          <span className="inline-block w-2 h-2 rounded-full bg-amber-400" title="Pending" />
                        ) : (
                          <span className="text-gray-300 text-xs">skip</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {rows.length > 10 && (
              <p className="text-xs text-gray-400 text-center pt-2">
                Showing 10 of {rows.length} rows — all {toImport.length} valid rows will be imported.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Import results summary */}
      {results && (
        <div className={`rounded-xl border px-5 py-4 ${failed === 0 ? "bg-[#E8F5E9] border-green-200" : "bg-red-50 border-red-200"}`}>
          <div className="flex items-center gap-2 mb-1">
            {failed === 0
              ? <CheckCircle size={16} className="text-[#1B4D2E]" />
              : <XCircle    size={16} className="text-red-500" />}
            <p className="font-semibold text-sm">
              {failed === 0
                ? `Import complete — ${succeeded} prices updated successfully.`
                : `Import finished with errors — ${succeeded} succeeded, ${failed} failed.`}
            </p>
          </div>
          {failed > 0 && (
            <ul className="text-xs text-red-600 mt-2 space-y-0.5">
              {results.filter((r) => !r.ok).map((r) => (
                <li key={r.id}>#{r.id} {r.name_en}: {r.error}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
