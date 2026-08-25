
"use client";
import Link from "next/link";
import { useCart, CartProduct } from "@/lib/cartStore";
import { Check, Minus, Plus, ShoppingCart } from "lucide-react";
import ProductImage from "./ProductImage";
import { useState, useEffect } from "react";

interface Props {
  product: CartProduct;
}

// Typeable quantity input — lets B2B buyers enter large carton counts directly
// instead of clicking +/- repeatedly. Falls back to previous value if left invalid.
function QtyInput({ quantity, onChange }: { quantity: number; onChange: (q: number) => void }) {
  const [raw, setRaw] = useState(String(quantity));

  useEffect(() => {
    setRaw(String(quantity));
  }, [quantity]);

  function commit() {
    const n = parseInt(raw, 10);
    if (!raw.trim() || isNaN(n) || n < 1) {
      setRaw(String(quantity));
      return;
    }
    onChange(n);
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      value={raw}
      onClick={(e) => e.preventDefault()}
      onChange={(e) => {
        const v = e.target.value;
        if (/^\d*$/.test(v)) setRaw(v);
      }}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
      }}
      className="w-9 px-0.5 py-1.5 text-xs font-bold text-[#1B4D2E] border-x border-[#1B4D2E] text-center focus:outline-none focus:bg-[#E8F5E9]"
    />
  );
}

export default function ProductCard({ product }: Props) {
  const { items, add, update, remove } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const cartItem = items.find((i) => i.product.id === product.id);
  const qty = cartItem?.quantity ?? 0;

  function formatPrice(value: number) {
    return Math.round(value).toLocaleString("en-US");
  }

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
        {product.isOnSale && (
          <span className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
            Sale
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <span className="text-xs text-gray-400 uppercase tracking-wider mb-1">
          {product.category}
        </span>

        <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-0.5 group-hover:text-[#1B4D2E] transition-colors">
          {product.nameEn}
        </h3>

        <p className="text-xs text-gray-400 mb-1 text-right" dir="rtl">
          {product.nameAr}
        </p>

        <span className="inline-block bg-[#E8F5E9] text-[#1B4D2E] text-xs font-semibold px-2 py-0.5 rounded-full mt-1">
          {product.caseCount} pcs / carton
        </span>

        <div className="mt-auto pt-4 flex items-center justify-between gap-2">
          <div>
            <p className="text-xs text-gray-400">Per Carton</p>
            {product.isOnSale && product.originalCartonPrice ? (
              <p className="text-xs text-gray-400 line-through leading-none mb-0.5">
                EGP {formatPrice(product.originalCartonPrice)}
              </p>
            ) : null}
            <span className={`text-base font-bold ${product.isOnSale ? "text-red-600" : "text-[#1B4D2E]"}`}>
              EGP {formatPrice(product.pricePerCarton)}
            </span>
            <p className="text-xs text-gray-400 mt-0.5">
              Min. 1 carton · الحد الأدنى كرتونة
            </p>
          </div>

          {qty > 0 ? (
            <div
              className="flex items-center border border-[#1B4D2E] rounded-lg overflow-hidden"
              onClick={(e) => e.preventDefault()}
            >
              <button
                onClick={handleDec}
                className="px-2 py-1.5 text-[#1B4D2E] hover:bg-[#1B4D2E] hover:text-white transition-colors"
              >
                <Minus size={12} />
              </button>

              <QtyInput quantity={qty} onChange={(q) => update(product.id, q)} />

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
