"use client";

import Link from "next/link";
import { useCart, CartProduct } from "@/lib/cartStore";
import { Check, Minus, Plus, ShoppingCart } from "lucide-react";
import ProductImage from "./ProductImage";
import { useState } from "react";

interface Props {
  product: CartProduct;
}

export default function ProductCard({ product }: Props) {
  const { items, add, update, remove } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const cartItem = items.find((i) => i.product.id === product.id);
  const qty = cartItem?.quantity ?? 0;

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    add(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  }

  function handleInc(e: React.MouseEvent) {
    e.preventDefault();
    update(product.id, qty + 1);
  }

  function handleDec(e: React.MouseEvent) {
    e.preventDefault();
    if (qty <= 1) remove(product.id);
    else update(product.id, qty - 1);
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
        <span className="inline-block bg-[#E8F5E9] text-[#1B4D2E] text-xs font-semibold px-2 py-0.5 rounded-full mt-1">
          {product.caseCount} pcs / carton
        </span>

        <div className="mt-auto pt-4 flex items-center justify-between gap-2">
          <div>
            <p className="text-xs text-gray-400">Per Carton</p>
            <span className="text-base font-bold text-[#1B4D2E]">
              EGP {product.pricePerCarton.toFixed(2)}
            </span>
            <p className="text-xs text-gray-400 mt-0.5">Min. 1 carton · الحد الأدنى كرتونة</p>
          </div>

          {/* Show quantity controls if item already in cart, else Add button */}
          {qty > 0 ? (
            <div className="flex items-center border border-[#1B4D2E] rounded-lg overflow-hidden" onClick={(e) => e.preventDefault()}>
              <button
                onClick={handleDec}
                className="px-2 py-1.5 text-[#1B4D2E] hover:bg-[#1B4D2E] hover:text-white transition-colors"
              >
                <Minus size={12} />
              </button>
              <span className="px-2.5 py-1.5 text-xs font-bold text-[#1B4D2E] border-x border-[#1B4D2E] min-w-[1.75rem] text-center">
                {qty}
              </span>
              <button
                onClick={handleInc}
                className="px-2 py-1.5 text-[#1B4D2E] hover:bg-[#1B4D2E] hover:text-white transition-colors"
              >
                <Plus size={12} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                justAdded
                  ? "bg-[#1B4D2E] text-white"
                  : "bg-[#111111] text-white hover:bg-[#1B4D2E]"
              }`}
            >
              {justAdded ? <Check size={13} /> : <ShoppingCart size={13} />}
              {justAdded ? "Added ✓" : "Add"}
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
