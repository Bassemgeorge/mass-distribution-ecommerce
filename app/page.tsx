import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import HomeSearchBar from "@/components/HomeSearchBar";
import { toProduct } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import {
  ArrowRight, Package, Truck,
  CheckCircle, TrendingUp, Users, Clock, Star,
} from "lucide-react";

export const dynamic = "force-dynamic";

// ── Category config (direct Unsplash URLs + Arabic label) ────────────────────
const CATEGORY_CONFIG: Record<string, { photo: string; ar: string }> = {
  "Soft Drinks":   { photo: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=300&h=300&fit=crop", ar: "مشروبات غازية" },
  "Cooking Oil":   { photo: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300&h=300&fit=crop", ar: "زيت طهي" },
  "Olive Oil":     { photo: "https://images.unsplash.com/photo-1550411294-25b20cb4b977?w=300&h=300&fit=crop", ar: "زيت زيتون" },
  "Pasta":         { photo: "https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=300&h=300&fit=crop", ar: "معكرونة" },
  "Tomato Paste":  { photo: "https://images.unsplash.com/photo-1607305387299-a3d9611cd469?w=300&h=300&fit=crop", ar: "صلصة طماطم" },
  "Sauces":        { photo: "https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=300&h=300&fit=crop", ar: "صوصات" },
  "Milk":          { photo: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&h=300&fit=crop", ar: "ألبان" },
  "Rice":          { photo: "https://images.unsplash.com/photo-1536304993881-ff86e0c9d60?w=300&h=300&fit=crop", ar: "أرز" },
  "Seasonings":    { photo: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300&h=300&fit=crop", ar: "توابل" },
  "Coffee":        { photo: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&h=300&fit=crop", ar: "قهوة" },
  "Water":         { photo: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=300&h=300&fit=crop", ar: "مياه" },
  "Olives":        { photo: "https://images.unsplash.com/photo-1611843467160-25afb8df1074?w=300&h=300&fit=crop", ar: "زيتون" },
  "Pickles":       { photo: "https://images.unsplash.com/photo-1589621316382-008455b857cd?w=300&h=300&fit=crop", ar: "مخللات" },
  "Vinegar":       { photo: "https://images.unsplash.com/photo-1585237672814-8f85a8118bf6?w=300&h=300&fit=crop", ar: "خل" },
  "Beans":         { photo: "https://images.unsplash.com/photo-1515543904379-3d757afe72e4?w=300&h=300&fit=crop", ar: "بقوليات" },
  "Energy Drinks": { photo: "https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=300&h=300&fit=crop", ar: "مشروبات طاقة" },
  "Tonic Water":   { photo: "https://images.unsplash.com/photo-1559181567-c3190900d8be?w=300&h=300&fit=crop", ar: "مياه الصودا" },
  "Speciality":    { photo: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=300&h=300&fit=crop", ar: "منتجات خاصة" },
  "Sugar":         { photo: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300&h=300&fit=crop", ar: "سكر" },
  "Ketchup":       { photo: "https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=300&h=300&fit=crop", ar: "كاتشب" },
  "Beverages":     { photo: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=300&h=300&fit=crop", ar: "مشروبات" },
  "BIB Syrup":     { photo: "https://images.unsplash.com/photo-1559181567-c3190900d8be?w=300&h=300&fit=crop", ar: "شراب" },
};

// ── Brand partners — 13 confirmed brands ─────────────────────────────────────
const BRAND_PARTNERS = [
  { name: "Wadi Food", color: "#1B4D2E",  text: "#fff" },
  { name: "Juhayna",   color: "#0066B3",  text: "#fff" },
  { name: "Heinz",     color: "#CC1C16",  text: "#fff" },
  { name: "Knorr",     color: "#4CAF50",  text: "#fff" },
  { name: "Pepsi",     color: "#004B93",  text: "#fff" },
  { name: "Savola",    color: "#E31E24",  text: "#fff" },
  { name: "Unilever",  color: "#1F36C7",  text: "#fff" },
  { name: "Nestlé",    color: "#009DE0",  text: "#fff" },
  { name: "Sunshine",  color: "#F5A623",  text: "#fff" },
  { name: "DaVinci",   color: "#8B0000",  text: "#fff" },
  { name: "El Doha",   color: "#1B4D2E",  text: "#fff" },
  { name: "AddMe",     color: "#FF4500",  text: "#fff" },
  { name: "Lipton",    color: "#FFD700",  text: "#333" },
];

// ── Hero photo grid (9 cells, direct Unsplash URLs) ───────────────────────────
const HERO_PHOTOS = [
  { url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop", alt: "Restaurant kitchen" },
  { url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=400&fit=crop", alt: "Plated food" },
  { url: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&h=400&fit=crop", alt: "Chef cooking" },
  { url: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=400&fit=crop", alt: "Food spread" },
  { url: "https://images.unsplash.com/photo-1493770348161-369560ae357d?w=400&h=400&fit=crop", alt: "Healthy food" },
  { url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400&fit=crop", alt: "Food hero" },
  { url: "https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?w=400&h=400&fit=crop", alt: "Professional chef" },
  { url: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=400&h=400&fit=crop", alt: "Restaurant bar" },
  { url: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=400&fit=crop", alt: "Burger" },
];

export default async function HomePage() {
  const [featuredRes, countRes, catRes, brandRes] = await Promise.all([
    supabase.from("products").select("*").eq("is_active", true).order("id").limit(8),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("products").select("category").eq("is_active", true),
    supabase.from("products").select("brand").eq("is_active", true),
  ]);

  const featured   = (featuredRes.data ?? []).map(toProduct);
  const totalCount = countRes.count ?? 0;

  const catMap: Record<string, number> = {};
  (catRes.data ?? []).forEach(({ category }: { category: string }) => {
    catMap[category] = (catMap[category] ?? 0) + 1;
  });
  const categoryCounts = Object.entries(catMap)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count); // sort by count descending

  const brandMap: Record<string, number> = {};
  (brandRes.data ?? []).forEach(({ brand }: { brand: string }) => {
    brandMap[brand] = (brandMap[brand] ?? 0) + 1;
  });
  const brandCounts = Object.entries(brandMap).length;

  return (
    <>
      {/* ── CSS animations ───────────────────────────────────────────────── */}
      <style>{`
        @keyframes brand-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .brand-scroll-track { animation: brand-scroll 28s linear infinite; }
        .brand-scroll-track:hover { animation-play-state: paused; }
      `}</style>

      {/* ── HERO — mosaic photo grid ──────────────────────────────────────── */}
      <section className="relative h-[480px] sm:h-[560px] overflow-hidden">
        {/* 3×3 photo grid as background */}
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
          {HERO_PHOTOS.map((photo, i) => (
            <div key={i} className="relative overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.url}
                alt={photo.alt}
                className="w-full h-full object-cover"
                loading={i < 3 ? "eager" : "lazy"}
              />
            </div>
          ))}
        </div>

        {/* Radial dark-green overlay — darkest at center for text legibility */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 65% 75% at 50% 50%, rgba(27,77,46,0.93) 0%, rgba(27,77,46,0.65) 55%, rgba(10,30,18,0.45) 100%)",
          }}
        />

        {/* Hero content centered */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-white text-center px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full mb-5">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
            HORECA Distribution · Egypt
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-3 max-w-2xl drop-shadow-lg">
            Your Trusted Supply Partner for Egypt&apos;s HORECA Sector
          </h1>
          <p className="text-white/70 text-base mb-1 max-w-xl leading-relaxed">
            {totalCount} products across {brandCounts} top brands — delivered across Cairo &amp; Giza.
          </p>
          <p className="text-white/50 text-sm mb-8" dir="rtl">
            شريكك الموثوق في توريد احتياجات قطاع الضيافة في مصر
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 bg-white text-[#1B4D2E] font-bold px-7 py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm shadow-lg"
            >
              Browse Products <ArrowRight size={15} />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 border border-white/40 text-white font-medium px-7 py-3 rounded-xl hover:border-white hover:bg-white/10 transition-colors text-sm"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </section>

      {/* ── SEARCH BAR ───────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100 py-6 px-4 shadow-sm">
        <HomeSearchBar />
      </section>

      {/* ── STATS STRIP ──────────────────────────────────────────────────── */}
      <section className="bg-[#F7F7F5] border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { icon: Package,    value: `${totalCount}+`, label: "Products" },
              { icon: Users,      value: "800+",           label: "Customers" },
              { icon: TrendingUp, value: "4,000+",         label: "Touchpoints" },
              { icon: Clock,      value: "Since 2017",     label: "In the Market" },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <Icon size={16} className="text-[#1B4D2E] mb-1" />
                <p className="text-xl font-bold text-[#111111] leading-none">{value}</p>
                <p className="text-gray-500 text-xs">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES — photo cards ──────────────────────────────────────── */}
      <section className="bg-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#111111]">Shop by Category</h2>
            <p className="text-gray-400 text-sm mt-0.5" dir="rtl">تسوق حسب الفئة</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categoryCounts.map(({ category, count }) => {
              const cfg = CATEGORY_CONFIG[category];
              const photoUrl = cfg?.photo
                ?? "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=300&h=300&fit=crop";
              const arLabel = cfg?.ar ?? category;
              return (
                <Link
                  key={category}
                  href={`/products?category=${encodeURIComponent(category)}`}
                  className="group relative aspect-square rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.04]"
                >
                  {/* Background photo */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoUrl}
                    alt={category}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  {/* Dark gradient overlay at bottom */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  {/* Product count badge top-right */}
                  <span className="absolute top-2.5 right-2.5 bg-[#1B4D2E] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {count}
                  </span>
                  {/* Category name at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white font-bold text-xs sm:text-sm leading-tight drop-shadow">{category}</p>
                    <p className="text-white/70 text-xs mt-0.5" dir="rtl">{arLabel}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── BRAND PARTNERS STRIP — auto-scrolling ────────────────────────── */}
      <section className="bg-white border-t border-b border-gray-100 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 text-center">
          <h2 className="text-lg font-bold text-[#111111]">Our Brand Partners</h2>
          <p className="text-gray-400 text-xs mt-0.5" dir="rtl">علاماتنا التجارية</p>
        </div>
        <div className="overflow-hidden">
          <div className="flex gap-4 w-max brand-scroll-track px-4">
            {[...BRAND_PARTNERS, ...BRAND_PARTNERS].map((b, i) => (
              <div
                key={i}
                className="flex items-center justify-center w-[160px] h-[72px] rounded-xl bg-white border border-gray-200 hover:border-[#1B4D2E] hover:shadow-md transition-all flex-shrink-0 cursor-default"
              >
                <span className="text-sm font-bold" style={{ color: b.color }}>
                  {b.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY ORDER ONLINE ─────────────────────────────────────────────── */}
      <section className="bg-[#F7F7F5] py-14 border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-[#111111]">Why Order Online?</h2>
            <p className="text-gray-400 text-sm mt-0.5" dir="rtl">لماذا تطلب عبر الإنترنت؟</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              {
                icon:    Clock,
                title:   "Order Anytime",
                titleAr: "اطلب في أي وقت",
                desc:    "24/7 online ordering, delivered within 24–48 hours across Cairo and Giza.",
              },
              {
                icon:    Package,
                title:   "Carton Pricing",
                titleAr: "أسعار الكرتونة",
                desc:    "Transparent B2B carton prices, minimum 1 carton per SKU, no hidden fees.",
              },
              {
                icon:    Truck,
                title:   "Cairo & Giza Delivery",
                titleAr: "توصيل القاهرة والجيزة",
                desc:    "Fast, reliable delivery across Cairo and Giza within 24–48 hours.",
              },
            ].map(({ icon: Icon, title, titleAr, desc }) => (
              <div key={title} className="bg-white border border-gray-200 rounded-2xl p-6 text-center hover:border-[#1B4D2E] hover:shadow-sm transition-all">
                <div className="w-16 h-16 bg-[#E8F5E9] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon size={32} className="text-[#1B4D2E]" />
                </div>
                <h3 className="font-bold text-[#111111] mb-0.5">{title}</h3>
                <p className="text-xs text-gray-400 mb-3" dir="rtl">{titleAr}</p>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ────────────────────────────────────────────── */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-[#111111] leading-tight">Featured Products</h2>
              <p className="text-gray-400 text-sm mt-1" dir="rtl">منتجات مختارة</p>
            </div>
            <Link
              href="/products"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-[#1B4D2E] hover:underline"
            >
              View all {totalCount} <ArrowRight size={15} />
            </Link>
          </div>
          {featured.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Package size={32} className="mx-auto mb-3 text-gray-200" />
              <p className="text-sm">No products yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featured.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
          <div className="mt-10 text-center">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-[#1B4D2E] text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-[#163d24] transition-colors text-sm shadow-md"
            >
              View All Products <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── WHY MASS DISTRIBUTION ────────────────────────────────────────── */}
      <section className="bg-[#F7F7F5] border-t border-gray-100 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-[#111111]">Why Mass Distribution?</h2>
            <p className="text-gray-400 text-sm mt-0.5" dir="rtl">لماذا ماس للتوزيع؟</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: CheckCircle, title: "100% HORECA Focused",      titleAr: "متخصصون في الضيافة",         desc: "Every product and service is designed specifically for hotels, restaurants, and cafés." },
              { icon: TrendingUp,  title: "Strong Annual Growth",      titleAr: "نمو سنوي قوي",               desc: "Consistent year-on-year growth backed by deep operator relationships across Egypt." },
              { icon: Package,     title: `${brandCounts} Brands, ${totalCount} Products`, titleAr: `${brandCounts} علامات تجارية`, desc: "All your HORECA essentials from one trusted distribution partner." },
              { icon: Truck,       title: "35+ Truck Fleet",           titleAr: "أكثر من 35 شاحنة",           desc: "Owned trucks and contractor network ensuring nationwide delivery coverage." },
              { icon: Users,       title: "17-Person Sales Team",      titleAr: "فريق مبيعات من 17 شخصاً",   desc: "Field, tele-sales, and customer service — always available when you need us." },
              { icon: Star,        title: "Trusted Since 2017",        titleAr: "موثوق منذ 2017",              desc: "8 years of building Egypt's HORECA ecosystem, one relationship at a time." },
            ].map(({ icon: Icon, title, titleAr, desc }) => (
              <div key={title} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-[#1B4D2E] hover:shadow-sm transition-all">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-[#1B4D2E]/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon size={16} className="text-[#1B4D2E]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-[#111111] leading-snug">{title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5 mb-2" dir="rtl">{titleAr}</p>
                    <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="bg-[#1B4D2E] text-white py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Ready to grow your business?</h2>
          <p className="text-white/60 text-sm mb-2" dir="rtl">هل أنت مستعد لتنمية أعمالك؟</p>
          <p className="text-white/70 mb-8 text-base">800+ clients. 4,000+ touchpoints. Nationwide reach across Egypt.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 bg-white text-[#1B4D2E] font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors text-sm"
            >
              Browse Products <ArrowRight size={16} />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 border border-white/30 text-white font-medium px-6 py-3 rounded-lg hover:border-white hover:bg-white/10 transition-colors text-sm"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
