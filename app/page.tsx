import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { toProduct } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import {
  ArrowRight, Droplet, FlaskConical, Utensils, Star, Leaf,
  CircleDot, Archive, Flame, ChefHat, GlassWater, Coffee,
  UtensilsCrossed, Package, Search, ShoppingCart, Truck,
  CheckCircle, TrendingUp, Users, Clock,
} from "lucide-react";

// Always fetch fresh from Supabase — don't statically generate
export const dynamic = "force-dynamic";

const categoryIcons: Record<string, React.ElementType> = {
  "Olive Oil":    Droplet,
  "Cooking Oil":  Droplet,
  "Vinegar":      FlaskConical,
  "Tomato Paste": CircleDot,
  "Ketchup":      Utensils,
  "Speciality":   Star,
  "Beans":        Leaf,
  "Olives":       Archive,
  "Pickles":      Archive,
  "Seasonings":   Flame,
  "Sauces":       ChefHat,
  "Milk":         GlassWater,
  "Syrup":        Coffee,
  "Pasta":        UtensilsCrossed,
  "Beverages":    GlassWater,
  "Soft Drinks":  GlassWater,
  "Water":        Droplet,
  "Rice":         Package,
  "Sugar":        Package,
  "Coffee":       Coffee,
};

const categoryAr: Record<string, string> = {
  "Olive Oil":    "زيت زيتون",
  "Cooking Oil":  "زيت طهي",
  "Vinegar":      "خل",
  "Tomato Paste": "صلصة طماطم",
  "Ketchup":      "كاتشب",
  "Speciality":   "منتجات خاصة",
  "Beans":        "بقوليات",
  "Olives":       "زيتون",
  "Pickles":      "مخللات",
  "Seasonings":   "توابل",
  "Sauces":       "صوصات",
  "Milk":         "ألبان",
  "Syrup":        "سيرب",
  "Pasta":        "معكرونة",
  "Beverages":    "مشروبات",
  "Soft Drinks":  "مشروبات غازية",
  "Water":        "مياه",
  "Rice":         "أرز",
  "Sugar":        "سكر",
  "Coffee":       "قهوة",
};

export default async function HomePage() {
  // Fetch directly via supabase client — same pattern as /api/debug which confirmed working
  const [featuredRes, countRes, catRes, brandRes] = await Promise.all([
    supabase.from("products").select("*").eq("is_active", true).order("id").limit(8),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("products").select("category").eq("is_active", true),
    supabase.from("products").select("brand").eq("is_active", true),
  ]);

  if (featuredRes.error) console.error("homepage featured:", featuredRes.error.message);
  if (countRes.error)    console.error("homepage count:",    countRes.error.message);
  if (catRes.error)      console.error("homepage cats:",     catRes.error.message);
  if (brandRes.error)    console.error("homepage brands:",   brandRes.error.message);

  const featured   = (featuredRes.data ?? []).map(toProduct);
  const totalCount = countRes.count ?? 0;

  // Build category counts
  const catMap: Record<string, number> = {};
  (catRes.data ?? []).forEach(({ category }: { category: string }) => {
    catMap[category] = (catMap[category] ?? 0) + 1;
  });
  const categoryCounts = Object.entries(catMap)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => a.category.localeCompare(b.category));

  // Build brand counts
  const brandMap: Record<string, number> = {};
  (brandRes.data ?? []).forEach(({ brand }: { brand: string }) => {
    brandMap[brand] = (brandMap[brand] ?? 0) + 1;
  });
  const brandCounts = Object.entries(brandMap)
    .map(([brand, count]) => ({ brand, count }))
    .sort((a, b) => a.brand.localeCompare(b.brand));

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="bg-[#1B4D2E] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 text-xs font-medium uppercase tracking-widest px-3 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 bg-white rounded-full" />
              HORECA Distribution · Egypt
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
              Your Trusted Supply Partner for Egypt&apos;s HORECA Sector
            </h1>
            <p className="text-white/70 text-base md:text-lg mb-2 leading-relaxed">
              {totalCount} products across {brandCounts.length} top brands — delivered to your door across Egypt.
            </p>
            <p className="text-white/50 text-sm mb-10" dir="rtl">
              {totalCount} منتج من {brandCounts.length} علامات تجارية — توصيل لجميع أنحاء مصر
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/products" className="inline-flex items-center justify-center gap-2 bg-white text-[#1B4D2E] font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors text-sm">
                Browse Products <ArrowRight size={16} />
              </Link>
              <Link href="/contact" className="inline-flex items-center justify-center gap-2 border border-white/30 text-white font-medium px-6 py-3 rounded-lg hover:border-white hover:bg-white/10 transition-colors text-sm">
                Get in Touch
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ──────────────────────────────────────────── */}
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

      {/* ── CATEGORY GRID ────────────────────────────────────────── */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#111111]">Shop by Category</h2>
            <p className="text-gray-400 text-sm mt-0.5" dir="rtl">تسوق حسب الفئة</p>
          </div>
          {categoryCounts.length === 0 ? (
            <p className="text-gray-400 text-sm">No categories available yet.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {categoryCounts.map(({ category, count }) => {
                const Icon = categoryIcons[category] ?? Package;
                const ar   = categoryAr[category] ?? category;
                return (
                  <Link
                    key={category}
                    href={`/products?category=${encodeURIComponent(category)}`}
                    className="group flex flex-col items-center gap-2.5 p-4 bg-[#F7F7F5] border border-gray-100 rounded-xl hover:border-[#1B4D2E] hover:bg-white hover:shadow-sm transition-all text-center"
                  >
                    <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center group-hover:border-[#1B4D2E] group-hover:bg-[#1B4D2E] transition-all">
                      <Icon size={18} className="text-gray-500 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <p className="font-medium text-xs text-gray-800 leading-tight">{category}</p>
                      <p className="text-gray-400 text-xs mt-0.5" dir="rtl">{ar}</p>
                      <p className="text-[#1B4D2E] text-xs font-semibold mt-0.5">{count}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
      <section className="bg-[#F7F7F5] py-16 border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-[#111111]">How It Works</h2>
            <p className="text-gray-400 text-sm mt-0.5" dir="rtl">كيف يعمل</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { step: "01", icon: Search,       title: "Browse",  titleAr: "تصفح",  desc: `Explore ${totalCount} products across ${brandCounts.length} top HORECA brands. Filter by category or brand.` },
              { step: "02", icon: ShoppingCart, title: "Order",   titleAr: "اطلب",  desc: "Add items to your cart and submit your order. Credit pricing, ex-VAT." },
              { step: "03", icon: Truck,        title: "Receive", titleAr: "استلم", desc: "We process same-day and deliver across Egypt via our fleet of 35+ trucks." },
            ].map(({ step, icon: Icon, title, titleAr, desc }) => (
              <div key={step} className="flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-[#1B4D2E] rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon size={22} className="text-white" />
                  </div>
                  <span className="text-xs font-bold text-[#1B4D2E] uppercase tracking-widest">{step}</span>
                </div>
                <h3 className="text-lg font-bold text-[#111111] mb-0.5">{title}</h3>
                <p className="text-gray-400 text-xs mb-2" dir="rtl">{titleAr}</p>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ────────────────────────────────────── */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-[#111111]">Featured Products</h2>
              <p className="text-gray-400 text-sm mt-0.5" dir="rtl">منتجات مختارة</p>
            </div>
            <Link href="/products" className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-[#1B4D2E] hover:underline">
              View all {totalCount} <ArrowRight size={15} />
            </Link>
          </div>
          {featured.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Package size={32} className="mx-auto mb-3 text-gray-200" />
              <p className="text-sm">No products yet — run <code className="font-mono bg-gray-100 px-1 rounded text-xs">npm run seed</code> to populate the catalog.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featured.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
          <div className="mt-6 text-center sm:hidden">
            <Link href="/products" className="inline-flex items-center gap-1 text-sm font-medium text-[#1B4D2E] hover:underline">
              View All Products <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── WHY MASS DISTRIBUTION ────────────────────────────────── */}
      <section className="bg-[#F7F7F5] border-t border-gray-100 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-[#111111]">Why Mass Distribution?</h2>
            <p className="text-gray-400 text-sm mt-0.5" dir="rtl">لماذا ماس للتوزيع؟</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: CheckCircle, title: "100% HORECA Focused",      titleAr: "متخصصون في الضيافة",                        desc: "Every product and service is designed specifically for hotels, restaurants, and cafés." },
              { icon: TrendingUp,  title: "Strong Annual Growth",      titleAr: "نمو سنوي قوي",                              desc: "Consistent year-on-year growth backed by deep operator relationships across Egypt." },
              { icon: Package,     title: `${brandCounts.length} Brands, ${totalCount} Products`, titleAr: `${brandCounts.length} علامات تجارية`, desc: "All your HORECA essentials from one trusted distribution partner." },
              { icon: Truck,       title: "35+ Truck Fleet",           titleAr: "أكثر من 35 شاحنة",                          desc: "Owned trucks and contractor network ensuring nationwide delivery coverage." },
              { icon: Users,       title: "17-Person Sales Team",      titleAr: "فريق مبيعات من 17 شخصاً",                   desc: "Field, tele-sales, and customer service — always available when you need us." },
              { icon: Star,        title: "Trusted Since 2017",        titleAr: "موثوق منذ 2017",                             desc: "8 years of building Egypt's HORECA ecosystem, one relationship at a time." },
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

      {/* ── BRANDS STRIP ─────────────────────────────────────────── */}
      <section className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-5">Our Brand Partners · العلامات التجارية</p>
          <div className="flex flex-wrap gap-2">
            {brandCounts.map(({ brand, count }) => (
              <Link key={brand} href={`/products?brand=${encodeURIComponent(brand)}`}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-full text-sm font-medium hover:border-[#1B4D2E] hover:text-[#1B4D2E] transition-all"
              >
                {brand}
                <span className="text-xs text-gray-400">{count}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="bg-[#1B4D2E] text-white py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Ready to grow your business?</h2>
          <p className="text-white/60 text-sm mb-2" dir="rtl">هل أنت مستعد لتنمية أعمالك؟</p>
          <p className="text-white/70 mb-8 text-base">800+ clients. 4,000+ touchpoints. Nationwide reach across Egypt.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/products" className="inline-flex items-center justify-center gap-2 bg-white text-[#1B4D2E] font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors text-sm">
              Browse Products <ArrowRight size={16} />
            </Link>
            <Link href="/contact" className="inline-flex items-center justify-center gap-2 border border-white/30 text-white font-medium px-6 py-3 rounded-lg hover:border-white hover:bg-white/10 transition-colors text-sm">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
