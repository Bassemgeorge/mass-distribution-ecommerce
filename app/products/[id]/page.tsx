"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProductImage from "@/components/ProductImage";
import ProductCard from "@/components/ProductCard";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";
import { getProductById, getProducts, toProduct, MappedProduct } from "@/lib/db";
import { useCart } from "@/lib/cartStore";
import { ShoppingCart, Check, ArrowLeft, Package, Zap, Shield, AlertCircle } from "lucide-react";

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router  = useRouter();

  const [product,  setProduct]  = useState<MappedProduct | null>(null);
  const [related,  setRelated]  = useState<MappedProduct[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const [qty,   setQty]   = useState(1);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const numId = parseInt(id, 10);
      if (isNaN(numId)) { router.replace("/products"); return; }

      const { data, error: err } = await getProductById(numId);
      if (err || !data) {
        if (!data) { router.replace("/products"); return; }
        setError(err);
        setLoading(false);
        return;
      }

      const mapped = toProduct(data);
      setProduct(mapped);

      // Fetch related (same category, excluding this one)
      const { data: relDb } = await getProducts({ category: data.category, limit: 4 });
      setRelated(
        relDb
          .filter((p) => p.id !== data.id)
          .slice(0, 3)
          .map(toProduct)
      );
      setLoading(false);
    }
    load();
  }, [id, router]);

  function handleAdd() {
    if (!product) return;
    for (let i = 0; i < qty; i++) add(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="bg-[#F7F7F5] border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="bg-gray-100 rounded-2xl aspect-square animate-pulse" />
            <div className="flex flex-col gap-4">
              <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
              <div className="h-8 w-3/4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-1/2 bg-gray-100 rounded animate-pulse" />
              <div className="h-24 w-full bg-gray-100 rounded-xl animate-pulse" />
              <div className="h-12 w-full bg-gray-200 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={32} className="mx-auto mb-3 text-red-400" />
          <p className="text-gray-600 font-medium mb-4">{error ?? "Product not found"}</p>
          <Link href="/products" className="text-sm text-[#1B4D2E] font-medium hover:underline">
            ← Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-[#F7F7F5] border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/products" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1B4D2E] font-medium transition-colors">
            <ArrowLeft size={15} /> Back to Products
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
          {/* Image */}
          <div className="bg-[#F7F7F5] rounded-2xl aspect-square flex items-center justify-center p-10 border border-gray-100">
            <ProductImage product={product} className="object-contain w-full h-full" />
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-[#1B4D2E] text-white text-xs font-medium px-3 py-1 rounded-full">
                {product.brand}
              </span>
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                {product.category}
              </span>
            </div>

            <h1 className="text-2xl font-bold text-[#111111] leading-tight mb-1">{product.nameEn}</h1>
            <p className="text-base text-gray-400 mb-6 text-right" dir="rtl">{product.nameAr}</p>

            {/* Price block */}
            <div className="bg-[#F7F7F5] rounded-xl p-5 mb-4 border border-gray-100">
              <p className="text-xs font-medium text-gray-400 mb-1">Price per Carton (ex-VAT)</p>
              <p className="text-3xl font-bold text-[#1B4D2E]">EGP {product.pricePerCarton.toFixed(2)}</p>
              <p className="text-xs text-gray-400 mt-2">Unit price: EGP {product.pricePerPiece.toFixed(2)} / pc</p>
            </div>

            {/* Case contents */}
            <div className="flex items-center gap-3 bg-[#E8F5E9] border border-green-200 rounded-xl px-4 py-3 mb-4">
              <span className="text-lg">📦</span>
              <div>
                <p className="text-sm font-semibold text-[#1B4D2E]">Case contains: {product.caseCount} pcs</p>
                <p className="text-xs text-[#1B4D2E]/70">{product.packSize}</p>
              </div>
            </div>

            {/* Min order notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5">
              <p className="text-xs font-semibold text-amber-700">Minimum order: 1 carton</p>
              <p className="text-xs text-amber-600 mt-0.5" dir="rtl">الحد الأدنى للطلب: كرتونة واحدة</p>
            </div>

            {/* Qty + Add */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex flex-col items-center">
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 py-2.5 text-base font-semibold hover:bg-gray-50 transition-colors">−</button>
                  <span className="px-4 py-2.5 text-sm font-semibold border-x border-gray-200 min-w-[3rem] text-center">{qty}</span>
                  <button onClick={() => setQty(qty + 1)} className="px-4 py-2.5 text-base font-semibold hover:bg-gray-50 transition-colors">+</button>
                </div>
                <p className="text-xs text-gray-400 mt-1">{qty === 1 ? "1 carton" : `${qty} cartons`} = {qty * product.caseCount} pcs</p>
              </div>
              <button
                onClick={handleAdd}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${
                  added ? "bg-[#1B4D2E] text-white" : "bg-[#111111] text-white hover:bg-[#1B4D2E]"
                }`}
              >
                {added ? <Check size={16} /> : <ShoppingCart size={16} />}
                {added ? "Added to Cart!" : "Add to Cart"}
              </button>
            </div>

            <Link
              href="/checkout"
              className="text-center border border-gray-200 rounded-lg py-3 font-medium text-sm hover:border-[#1B4D2E] hover:text-[#1B4D2E] transition-colors mb-8"
            >
              Proceed to Checkout
            </Link>

            {/* Perks */}
            <div className="grid grid-cols-3 gap-3 pt-5 border-t border-gray-100">
              {[
                { icon: Zap,     label: "Same-Day Processing" },
                { icon: Package, label: "Bulk Discounts" },
                { icon: Shield,  label: "Quality Guaranteed" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="text-center">
                  <div className="w-9 h-9 bg-[#1B4D2E]/10 rounded-lg flex items-center justify-center mx-auto mb-1.5">
                    <Icon size={16} className="text-[#1B4D2E]" />
                  </div>
                  <p className="text-xs text-gray-500 leading-tight">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-[#111111] mb-5">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
