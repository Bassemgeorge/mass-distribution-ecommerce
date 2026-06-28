"use client";

import Image from "next/image";

interface LogoImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}

export default function LogoImage({ src, alt, width, height, className }: LogoImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={(e) => {
        (e.target as HTMLImageElement).style.display = "none";
      }}
    />
  );
}
