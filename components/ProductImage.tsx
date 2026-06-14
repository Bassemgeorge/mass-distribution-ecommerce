"use client";

import Image from "next/image";
import { useState } from "react";
import { Product } from "@/lib/products";

interface ProductImageProps {
  product: Product;
  fill?: boolean;
  className?: string;
  sizes?: string;
}

// Try each src in order — first one that loads wins
function buildSrcList(product: Product): string[] {
  const id = product.id;
  const brand = product.brand;
  return [
    `/products/${id}.jpg`,
    `/products/${id}.png`,
    `/products/${id}.webp`,
    `/brands/${brand}.jpg`,
    `/brands/${brand}.png`,
    `/brands/${brand}.webp`,
    `/placeholder-product.svg`,
  ];
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
    />
  );
}
