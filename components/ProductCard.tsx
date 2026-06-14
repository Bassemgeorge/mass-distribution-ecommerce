"use client";

import Link from "next/link";
import { useCart } from "@/lib/cartStore";
import { Product } from "@/lib/products";
import { ShoppingCart, Check } from "lucide-react";
import ProductImage from "./ProductImage";
import { useState } from "react";

export default function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    add(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <Link
      href={`/products/${product.id}`}
      className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md hover:border-[#1B4D2E] transition-all duration-200 flex flex-col"
    >
      {/* Image */}
      <div className="relative aspect-square bg-[#F7F7F5] overflow-hidden">
        <ProductImage
          product={product}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-contain p-6 group-hover:scale-105 transition-transform duration-300"
        />
        <span className="absolute top-3 left-3 bg-[#1B4D2E] text-white text-xs font-medium px-2.5 py-1 rounded-full">
          {product.brand}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <span className="text-xs text-gray-400 uppercase tracking-wider mb-1">{product.category}</span>

        <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-0.5 group-hover:text-[#1B4D2E] transition-colors">
          {product.nameEn}
        </h3>
        <p className="text-xs text-gray-400 mb-1 text-right" dir="rtl">{product.nameAr}</p>

        <p className="text-xs text-gray-500 mt-1">
          Case of {product.caseCount} pcs
        </p>

        <div className="mt-auto pt-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">Per Piece</p>
            <span className="text-base font-bold text-[#111111]">
              EGP {product.pricePerPiece.toFixed(2)}
            </span>
          </div>
          <button
            onClick={handleAdd}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
              added
                ? "bg-[#1B4D2E] text-white"
                : "bg-[#111111] text-white hover:bg-[#1B4D2E]"
            }`}
          >
            {added ? <Check size={13} /> : <ShoppingCart size={13} />}
            {added ? "Added" : "Add"}
          </button>
        </div>
      </div>
    </Link>
  );
}
