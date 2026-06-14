"use client";

import { use, useState } from "react";
import Link from "next/link";
import ProductImage from "@/components/ProductImage";
import { notFound } from "next/navigation";
import { getProduct, products } from "@/lib/products";
import { useCart } from "@/lib/cartStore";
import ProductCard from "@/components/ProductCard";
import { ShoppingCart, Check, ArrowLeft, Package, Zap, Shield } from "lucide-react";

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const productData = getProduct(id);
  if (!productData) notFound();
  const product = productData;

  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const [qty, setQty] = useState(1);

  function handleAdd() {
    for (let i = 0; i < qty; i++) add(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  const related = products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 3);

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
            <ProductImage
              product={product}
              className="object-contain w-full h-full"
            />
          </div>

          {/* Info */}
          <div className="flex flex-col">
            {/* Brand + category */}
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-[#1B4D2E] text-white text-xs font-medium px-3 py-1 rounded-full">
                {product.brand}
              </span>
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                {product.category}
              </span>
            </div>

            {/* Bilingual name */}
            <h1 className="text-2xl font-bold text-[#111111] leading-tight mb-1">
              {product.nameEn}
            </h1>
            <p className="text-base text-gray-400 mb-6 text-right" dir="rtl">{product.nameAr}</p>

            {/* Price block */}
            <div className="bg-[#F7F7F5] rounded-xl p-5 mb-5 border border-gray-100">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-400 mb-1">Per Piece</p>
                  <p className="text-2xl font-bold text-[#111111]">EGP {product.pricePerPiece.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400 mb-1">Per Carton ({product.caseCount} pcs)</p>
                  <p className="text-2xl font-bold text-[#1B4D2E]">EGP {product.pricePerCarton.toFixed(2)}</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-200">
                {product.hasTax ? "14% VAT applies · Prices shown ex-VAT" : "VAT-exempt · Prices shown ex-VAT"}
                {" · "}Credit pricing
              </p>
            </div>

            {/* Qty + Add */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 py-2.5 text-base font-semibold hover:bg-gray-50 transition-colors">−</button>
                <span className="px-4 py-2.5 text-sm font-semibold border-x border-gray-200 min-w-[3rem] text-center">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="px-4 py-2.5 text-base font-semibold hover:bg-gray-50 transition-colors">+</button>
              </div>
              <button
                onClick={handleAdd}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${
                  added
                    ? "bg-[#1B4D2E] text-white"
                    : "bg-[#111111] text-white hover:bg-[#1B4D2E]"
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

        {/* Related */}
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
