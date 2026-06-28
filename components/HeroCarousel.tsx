"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import Image from "next/image";

import "swiper/css";
import "swiper/css/pagination";

const images = [
  "/hero/صور تسوق.jpg",
  "/hero/صور سوبرماركت.jpeg",
  "/hero/صور مطعم.jpeg",
  "/hero/صور شيف.jpg",
  
];

export default function HeroCarousel() {
  return (
    <Swiper
      modules={[Autoplay, Pagination]}
      autoplay={{
        delay: 4000,
        disableOnInteraction: false,
      }}
      pagination={{ clickable: true }}
      loop
      className="w-full h-screen"
    >
      {images.map((image, index) => (
        <SwiperSlide key={index}>
          <div className="relative w-full h-screen">
            <Image
              src={image}
              alt={`slide-${index}`}
              fill
              className="object-cover"
              priority={index === 0}
              sizes="100vw"
            />
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}