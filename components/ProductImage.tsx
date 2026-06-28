"use client";

import Image from "next/image";
import { useState } from "react";
import { CartProduct } from "@/lib/cartStore";

interface ProductImageProps {
  product: CartProduct;
  fill?: boolean;
  className?: string;
  sizes?: string;
}

function buildSrcList(product: CartProduct): string[] {
  const id    = product.id;
  const brand = product.brand;
  const srcs: string[] = [];

  // 1 — Supabase Storage URL (set from DB image_url)
  if (product.image && !product.image.includes("placeholder")) {
    srcs.push(product.image);
  }

  // 2 — Local public folder fallbacks
  srcs.push(
    `/products/${id}.jpg`,
    `/products/${id}.png`,
    `/products/${id}.webp`,
    `/brands/${brand}.jpg`,
    `/brands/${brand}.png`,
    `/brands/${brand}.webp`,
    `/placeholder-product.svg`,
  );

  return srcs;
}

export default function ProductImage({ product, fill = false, className = "", sizes }: ProductImageProps) {
  const srcList = buildSrcList(product);
  const [index, setIndex] = useState(0);

  const src = srcList[Math.min(index, srcList.length - 1)];

  function handleError() {
    setIndex((i) => Math.min(i + 1, srcList.length - 1));
  }

  if (fill) {
    return (
      <Image
        key={src}
        src={src}
        alt={product.nameEn}
        fill
        sizes={sizes ?? "(max-width: 768px) 100vw, 400px"}
        className={className}
        onError={handleError}
        unoptimized={src.includes("supabase.co")}
      />
    );
  }

  return (
    <Image
      key={src}
      src={src}
      alt={product.nameEn}
      width={400}
      height={400}
      className={className}
      onError={handleError}
      unoptimized={src.includes("supabase.co")}
    />
  );
}
