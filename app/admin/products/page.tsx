"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Search, Loader2, Edit2, X, Plus, Check } from "lucide-react";

// Matches the actual Supabase products table schema (products-schema.sql)
interface Product {
  id: number;
  name_en: string;
  name_ar: string;
  brand: string;
  category: string;
  price: number;          // per piece, ex-VAT (EGP)
  pack_size: string | null;
  image_url: string | null;
  is_active: boolean;
  stock: number;
}

const emptyProduct: Omit<Product, "id"> = {
  name_en: "", name_ar: "", brand: "", category: "",
  price: 0, pack_size: null, image_url: null, is_active: true, stock: 999,
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading,  setLoad]     = useState(true);
  const [search,   setSearch]   = useState("");
  const [editItem, setEdit]     = useState<Product | null>(null);
  const [addOpen,  setAdd]      = useState(false);
  const [newProd,  setNewProd]  = useState<Omit<Product, "id">>({ ...emptyProduct });
  const [saving,   setSave]     = useState(false);
  const [saved,    setSaved]    = useState<number | null>(null);
  const [fetchErr, setFetchErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoad(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id");
    if (error) {
      console.error("Products fetch error:", error.message);
      setFetchErr(error.message);
    } else {
      setFetchErr(null);
    }
    setProducts((data as Product[]) ?? []);
    setLoad(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    return !q
      || p.name_en.toLowerCase().includes(q)
      || (p.brand ?? "").toLowerCase().includes(q)
      || (p.category ?? "").toLowerCase().includes(q);
  });

  async function saveEdit() {
    if (!editItem) return;
    setSave(true);
    const { error } = await supabase.from("products").update({
      price:     editItem.price,
      pack_size: editItem.pack_size,
      stock:     editItem.stock,
      is_active: editItem.is_active,
    }).eq("id", editItem.id);
    if (error) console.error("Product update error:", error.message);
    setProducts((prev) => prev.map((p) => p.id === editItem.id ? { ...p, ...editItem } : p));
    setSaved(editItem.id);
    setTimeout(() => { setSaved(null); setEdit(null); }, 800);
    setSave(false);
  }

  async function addProduct() {
    if (!newProd.name_en || !newProd.brand || !newProd.category) return;
    setSave(true);
    const { data, error } = await supabase.from("products").insert({ ...newProd }).select("*").single();
    if (error) console.error("Add product error:", error.message);
    if (data) setProducts((prev) => [...prev, data as Product]);
    setAdd(false);
    setNewProd({ ...emptyProduct });
    setSave(false);
  }

  const inp = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1B4D2E] transition-colors bg-white";

  return (
    <div className="space-y-5">
      {fetchErr && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          <strong>Supabase error:</strong> {fetchErr}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#111111]">Products</h1>
          <p className="text-gray-400 text-sm">{products.length} products in Supabase</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text" placeholder="Search products…" value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-200 rounded-lg pl-8 pr-4 py-2 text-sm focus:outline-none focus:border-[#1B4D2E] bg-white w-52"
            />
          </div>
          <button
            onClick={() => setAdd(true)}
            className="flex items-center gap-2 bg-[#1B4D2E] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#163d24] transition-colors"
          >
            <Plus size={14} /> Add Product
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={24} className="animate-spin text-gray-300" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">ID</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden sm:table-cell">Brand</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden md:table-cell">Category</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Price/Unit</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden lg:table-cell">Pack Size</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden sm:table-cell">Stock</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden sm:table-cell">Active</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((p) => (
                  <tr key={p.id} className={`hover:bg-gray-50 transition-colors ${p.is_active === false ? "opacity-50" : ""}`}>
                    <td className="px-4 py-3 text-xs text-gray-400 font-mono">{p.id}</td>
                    <td className="px-4 py-3 max-w-[180px]">
                      <p className="text-sm font-medium text-[#111111] truncate">{p.name_en}</p>
                      <p className="text-xs text-gray-400 truncate" dir="rtl">{p.name_ar}</p>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-xs bg-[#E8F5E9] text-[#1B4D2E] px-2 py-0.5 rounded-full font-medium">{p.brand}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 hidden md:table-cell">{p.category}</td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-[#111111]">
                      EGP {(p.price ?? 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 hidden lg:table-cell">{p.pack_size ?? "—"}</td>
                    <td className="px-4 py-3 text-center text-xs text-gray-500 hidden sm:table-cell">{p.stock ?? 999}</td>
                    <td className="px-4 py-3 text-center hidden sm:table-cell">
                      <span className={`inline-block w-2 h-2 rounded-full ${p.is_active === false ? "bg-gray-300" : "bg-green-400"}`} />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setEdit({ ...p })}
                        className="text-gray-400 hover:text-[#1B4D2E] transition-colors"
                      >
                        {saved === p.id ? <Check size={13} className="text-green-500" /> : <Edit2 size={13} />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit modal */}
      {editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-[#111111]">Edit Product #{editItem.id}</h2>
              <button onClick={() => setEdit(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-5">{editItem.name_en}</p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Unit Price (EGP, ex-VAT)</label>
                <input
                  type="number" step="0.01" value={editItem.price}
                  onChange={(e) => setEdit({ ...editItem, price: parseFloat(e.target.value) || 0 })}
                  className={inp}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Pack Size</label>
                <input
                  type="text" value={editItem.pack_size ?? ""}
                  onChange={(e) => setEdit({ ...editItem, pack_size: e.target.value || null })}
                  className={inp} placeholder="Case of 12 pcs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Stock</label>
                <input
                  type="number" value={editItem.stock}
                  onChange={(e) => setEdit({ ...editItem, stock: parseInt(e.target.value) || 0 })}
                  className={inp}
                />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox" checked={editItem.is_active !== false}
                  onChange={(e) => setEdit({ ...editItem, is_active: e.target.checked })}
                  className="accent-[#1B4D2E] w-4 h-4"
                />
                <span className="text-sm text-gray-600">Product is active (visible on store)</span>
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEdit(null)} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button
                onClick={saveEdit} disabled={saving}
                className="flex-1 bg-[#1B4D2E] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#163d24] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add product modal */}
      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-[#111111]">Add Product</h2>
              <button onClick={() => { setAdd(false); setNewProd({ ...emptyProduct }); }} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3">
              {[
                { label: "English Name *", field: "name_en" },
                { label: "Arabic Name",    field: "name_ar" },
                { label: "Brand *",        field: "brand"   },
                { label: "Category *",     field: "category"},
              ].map(({ label, field }) => (
                <div key={field}>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">{label}</label>
                  <input
                    type="text"
                    value={(newProd as Record<string, unknown>)[field] as string ?? ""}
                    onChange={(e) => setNewProd((p) => ({ ...p, [field]: e.target.value }))}
                    className={inp}
                  />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Unit Price (EGP)</label>
                  <input
                    type="number" step="0.01" value={newProd.price}
                    onChange={(e) => setNewProd((p) => ({ ...p, price: parseFloat(e.target.value) || 0 }))}
                    className={inp}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Stock</label>
                  <input
                    type="number" value={newProd.stock}
                    onChange={(e) => setNewProd((p) => ({ ...p, stock: parseInt(e.target.value) || 0 }))}
                    className={inp}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Pack Size</label>
                <input
                  type="text" value={newProd.pack_size ?? ""}
                  onChange={(e) => setNewProd((p) => ({ ...p, pack_size: e.target.value || null }))}
                  className={inp} placeholder="Case of 12 pcs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Image URL (optional)</label>
                <input
                  type="text" value={newProd.image_url ?? ""}
                  onChange={(e) => setNewProd((p) => ({ ...p, image_url: e.target.value || null }))}
                  className={inp} placeholder="https://…"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox" checked={newProd.is_active !== false}
                  onChange={(e) => setNewProd((p) => ({ ...p, is_active: e.target.checked }))}
                  className="accent-[#1B4D2E]"
                />
                Active (visible on store)
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setAdd(false); setNewProd({ ...emptyProduct }); }}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addProduct}
                disabled={saving || !newProd.name_en || !newProd.brand}
                className="flex-1 bg-[#1B4D2E] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#163d24] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Add Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
