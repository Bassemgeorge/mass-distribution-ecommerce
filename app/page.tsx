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
  "Soft Drinks":     { photo: "https://images.unsplash.com/photo-1624552184280-9e31f7f5bbfa?w=300&h=300&fit=crop", ar: "مشروبات غازية" },
  "Cooking Oil":     { photo: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300&h=300&fit=crop", ar: "زيت طهي" },
  "Olive Oil":       { photo: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300&h=300&fit=crop", ar: "زيت زيتون" },
  "Pasta":           { photo: "https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=300&h=300&fit=crop", ar: "معكرونة" },
  "Tomato Paste":    { photo: "https://images.unsplash.com/photo-1549007953-2f2dc0b24019?w=300&h=300&fit=crop", ar: "صلصة طماطم" },
  "Sauces":          { photo: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=300&h=300&fit=crop", ar: "صوصات" },
  "Milk":            { photo: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&h=300&fit=crop", ar: "ألبان" },
  "Rice":            { photo: "https://images.unsplash.com/photo-1536304993881-ff86e0c9d60?w=300&h=300&fit=crop", ar: "أرز" },
  "Seasonings":      { photo: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300&h=300&fit=crop", ar: "توابل" },
  "Coffee":          { photo: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&h=300&fit=crop", ar: "قهوة" },
  "Water":           { photo: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=300&h=300&fit=crop", ar: "مياه" },
  "Olives":          { photo: "https://images.unsplash.com/photo-1593001872095-7d5b3868fb1d?w=300&h=300&fit=crop", ar: "زيتون" },
  "Pickles":         { photo: "https://images.unsplash.com/photo-1601000938259-4f8afe31f7ff?w=300&h=300&fit=crop", ar: "مخللات" },
  "Vinegar":         { photo: "https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?w=300&h=300&fit=crop", ar: "خل" },
  "Beans":           { photo: "https://images.unsplash.com/photo-1515543904379-3d757afe72e4?w=300&h=300&fit=crop", ar: "بقوليات" },
  "Energy Drinks":   { photo: "https://images.unsplash.com/photo-1606168094336-48f205522f2d?w=300&h=300&fit=crop", ar: "مشروبات طاقة" },
  "Tonic Water":     { photo: "https://images.unsplash.com/photo-1559181567-c3190900d8be?w=300&h=300&fit=crop", ar: "مياه الصودا" },
  "Malt Beverages":  { photo: "https://images.unsplash.com/photo-1618183479302-1e0aa382c36b?w=300&h=300&fit=crop", ar: "مشروبات مالت" },
  "Speciality":      { photo: "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=300&h=300&fit=crop", ar: "منتجات خاصة" },
  "Sugar":           { photo: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop", ar: "سكر" },
  "Ketchup":         { photo: "https://images.unsplash.com/photo-1607013407627-6352b8ec6456?w=300&h=300&fit=crop", ar: "كاتشب" },
  "Beverages":       { photo: "https://images.unsplash.com/photo-1624552184280-9e31f7f5bbfa?w=300&h=300&fit=crop", ar: "مشروبات" },
  "BIB Syrup":       { photo: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=300&h=300&fit=crop", ar: "شراب" },
};

// ── Brand partners — 13 confirmed brands ─────────────────────────────────────
const BRAND_PARTNERS = [
  { name: "Wadi Food", logo: "/brand-logos/wadi-food.png" },
  { name: "Juhayna",   logo: "/brand-logos/juhayna.png"   },
  { name: "Heinz",     logo: "/brand-logos/heinz.png"     },
  { name: "Knorr",     logo: "/brand-logos/knorr.png"     },
  { name: "Pepsi",     logo: "/brand-logos/pepsi.png"     },
  { name: "Savola",    logo: "/brand-logos/savola.png"    },
  { name: "Unilever",  logo: "/brand-logos/unilever.png"  },
  { name: "Nestlé",    logo: "/brand-logos/nestle.png"    },
  { name: "Sunshine",  logo: "/brand-logos/sunshine.svg"  },
  { name: "DaVinci",   logo: "/brand-logos/davinci.png"   },
  { name: "El Doha",   logo: "/brand-logos/eldoha.svg"    },
  { name: "AddMe",     logo: "/brand-logos/addme.png"     },
  { name: "Lipton",    logo: "/brand-logos/lipton.png"    },
];

const GLASS_BRANDS = [
  { dot: "#1B4D2E", name: "Wadi Food", count: 45 },
  { dot: "#CC1C16", name: "Heinz",     count: 18 },
  { dot: "#004B93", name: "Pepsi",     count: 62 },
];

export default async function HomePage() {
  const [featuredRes, countRes, catRes] = await Promise.all([
    supabase.from("products").select("*").eq("is_active", true).order("id").limit(8),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("products").select("category").eq("is_active", true),
  ]);

  const featured   = (featuredRes.data ?? []).map(toProduct);
  const totalCount = countRes.count ?? 0;

  const catMap: Record<string, number> = {};
  (catRes.data ?? []).forEach(({ category }: { category: string }) => {
    catMap[category] = (catMap[category] ?? 0) + 1;
  });
  const categoryCounts = Object.entries(catMap)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <>
      {/* ── CSS ────────────────────────────────────────────────────────────── */}
      <style>{`
        @keyframes brand-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .brand-scroll-track { animation: brand-scroll 28s linear infinite; }
        .brand-scroll-track:hover { animation-play-state: paused; }

        .cat-shop-btn {
          transform: translateY(100%);
          opacity: 0;
          transition: transform 0.3s ease, opacity 0.3s ease;
        }
        .cat-card:hover .cat-shop-btn {
          transform: translateY(0);
          opacity: 1;
        }
        .cat-card:hover .cat-overlay {
          background: linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.35) 60%, rgba(0,0,0,0.1) 100%);
        }
        .cat-overlay {
          background: linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.2) 60%, transparent 100%);
          transition: background 0.3s ease;
        }
      `}</style>

      {/* ── HERO — full-bleed photo ───────────────────────────────────────── */}
      <section
        className="relative w-full overflow-hidden"
        style={{
          height: "620px",
          backgroundImage: "url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&h=700&fit=crop&q=90')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Left-to-right gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to right, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.25) 100%)",
          }}
        />

        {/* Left content */}
        <div className="relative z-10 h-full flex flex-col justify-center px-8 sm:px-14 lg:px-20 max-w-2xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-[#1B4D2E]/70 border border-[#1B4D2E] text-green-300 text-xs font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full mb-6 self-start backdrop-blur-sm">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
            HORECA Distribution · Egypt
          </div>

          {/* Headline */}
          <h1 className="font-extrabold text-white leading-[1.1] mb-4" style={{ fontSize: "clamp(2rem,4.5vw,3.5rem)" }}>
            Egypt&apos;s #1 HORECA<br />
            Supply Platform
          </h1>

          {/* Arabic subtitle */}
          <p className="text-white/80 mb-3" style={{ fontSize: 20 }} dir="rtl">
            منصة توريد الضيافة الأولى في مصر
          </p>

          {/* Description */}
          <p className="text-white/85 text-base leading-relaxed mb-8 max-w-md">
            Order premium F&amp;B supplies by carton.<br />
            223+ products from 13 top brands.<br />
            Delivered across Cairo &amp; Giza in 24–48 hours.
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap gap-3 mb-8">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-white text-[#1B4D2E] font-semibold px-8 py-4 rounded-full hover:bg-gray-100 transition-colors text-sm shadow-lg"
            >
              Start Ordering <ArrowRight size={16} />
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 border-2 border-white/70 text-white font-medium px-8 py-4 rounded-full hover:border-white hover:bg-white/10 transition-colors text-sm backdrop-blur-sm"
            >
              Browse Catalog
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {["✓ Minimum 1 Carton", "✓ Cairo & Giza Delivery", "✓ 24–48 Hour Lead Time"].map((t) => (
              <span key={t} className="text-white/80 text-sm font-medium">{t}</span>
            ))}
          </div>
        </div>

        {/* Right — glass order card (desktop only) */}
        <div
          className="hidden md:block absolute right-16 top-1/2 -translate-y-1/2 z-10 w-[280px] rounded-2xl p-6"
          style={{
            background: "rgba(255,255,255,0.12)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.22)",
          }}
        >
          <p className="text-white font-bold text-lg mb-0.5">Quick Order</p>
          <p className="text-white/70 text-xs mb-4">Join 800+ HORECA businesses</p>
          <div className="border-t border-white/20 mb-4" />
          <div className="space-y-3 mb-5">
            {GLASS_BRANDS.map((b) => (
              <div key={b.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: b.dot }} />
                  <span className="text-white text-sm font-medium">{b.name}</span>
                </div>
                <span className="text-white/60 text-xs">{b.count} products</span>
              </div>
            ))}
          </div>
          <Link
            href="/products"
            className="flex items-center justify-center gap-2 w-full bg-[#1B4D2E] hover:bg-[#163d24] text-white text-sm font-semibold py-3 rounded-xl transition-colors"
          >
            View All Products <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* ── SEARCH BAR ───────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100 py-7 px-4 shadow-sm">
        <HomeSearchBar />
      </section>

      {/* ── STATS STRIP ──────────────────────────────────────────────────── */}
      <section className="bg-white border-t-2 border-[#1B4D2E] border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-200">
            {[
              { value: `${totalCount}+`, label: "Products" },
              { value: "800+",           label: "Customers" },
              { value: "4,000+",         label: "Monthly Orders" },
              { value: "Since 2017",     label: "In the Market" },
            ].map(({ value, label }) => (
              <div key={label} className="flex flex-col items-center gap-1 px-4 py-2">
                <p className="font-extrabold text-[#1B4D2E] leading-none" style={{ fontSize: 40 }}>{value}</p>
                <p className="text-gray-500 text-sm mt-1">{label}</p>
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
                ?? "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop";
              const arLabel = cfg?.ar ?? category;
              return (
                <Link
                  key={category}
                  href={`/products?category=${encodeURIComponent(category)}`}
                  className="cat-card group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.04] cursor-pointer"
                  style={{ height: 250 }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoUrl}
                    alt={category}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="cat-overlay absolute inset-0" />
                  {/* Count badge */}
                  <span className="absolute top-2.5 right-2.5 bg-[#1B4D2E] text-white text-xs font-bold px-2 py-0.5 rounded-full z-10">
                    {count}
                  </span>
                  {/* Bottom content */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 z-10 overflow-hidden">
                    <p className="text-white font-bold text-sm leading-tight drop-shadow">{category}</p>
                    <p className="text-white/80 text-xs mt-0.5" dir="rtl">{arLabel}</p>
                    <div className="cat-shop-btn mt-2">
                      <span className="inline-flex items-center gap-1 bg-[#1B4D2E] text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                        Shop Now <ArrowRight size={11} />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── BRAND PARTNERS STRIP — auto-scrolling ────────────────────────── */}
      <section className="border-t border-b border-gray-100 py-10" style={{ background: "#F8F8F6" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-7 text-center">
          <h2 className="text-2xl font-bold text-[#111111]">Trusted Brand Partners</h2>
          <p className="text-gray-400 text-sm mt-1" dir="rtl">علاماتنا التجارية الموثوقة</p>
        </div>
        <div className="overflow-hidden">
          <div className="flex gap-4 w-max brand-scroll-track px-4">
            {[...BRAND_PARTNERS, ...BRAND_PARTNERS].map((b, i) => (
              <div
                key={i}
                className="flex items-center justify-center rounded-xl bg-white border border-gray-200 hover:border-[#1B4D2E] hover:shadow-md transition-all flex-shrink-0 cursor-default px-4"
                style={{ width: 180, height: 80 }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={b.logo}
                  alt={b.name}
                  style={{ maxHeight: 50, maxWidth: 140, objectFit: "contain" }}
                  loading="lazy"
                />
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
              { icon: CheckCircle, title: "100% HORECA Focused",        titleAr: "متخصصون في الضيافة",       desc: "Every product and service is designed specifically for hotels, restaurants, and cafés." },
              { icon: TrendingUp,  title: "Strong Annual Growth",        titleAr: "نمو سنوي قوي",             desc: "Consistent year-on-year growth backed by deep operator relationships across Egypt." },
              { icon: Package,     title: `13 Brands, ${totalCount} Products`, titleAr: "13 علامات تجارية", desc: "All your HORECA essentials from one trusted distribution partner." },
              { icon: Truck,       title: "35+ Truck Fleet",             titleAr: "أكثر من 35 شاحنة",         desc: "Owned trucks and contractor network ensuring nationwide delivery coverage." },
              { icon: Users,       title: "17-Person Sales Team",        titleAr: "فريق مبيعات من 17 شخصاً", desc: "Field, tele-sales, and customer service — always available when you need us." },
              { icon: Star,        title: "Trusted Since 2017",          titleAr: "موثوق منذ 2017",            desc: "8 years of building Egypt's HORECA ecosystem, one relationship at a time." },
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
          <p className="text-white/70 mb-8 text-base">800+ clients. 4,000+ monthly orders. Cairo &amp; Giza coverage.</p>
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
