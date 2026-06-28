"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Target, Eye, TrendingUp, Users, Truck, BarChart2, Zap } from "lucide-react";
import { CSSProperties } from "react";

// ── Animated counter hook ─────────────────────────────────────────────────────
function useCountUp(target: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(ease * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

// ── Intersection observer hook ────────────────────────────────────────────────
function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// ── Brand partners ────────────────────────────────────────────────────────────
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

// ── Stat counter card ─────────────────────────────────────────────────────────
function StatCard({ value, suffix = "", label, labelAr, started }: {
  value: number; suffix?: string; label: string; labelAr: string; started: boolean;
}) {
  const count = useCountUp(value, 2000, started);
  return (
     
    <div className="stat-card flex flex-col items-center gap-1 px-4 py-6 rounded-2xl border border-white/10 hover:border-green-400/50 transition-all duration-300 hover:scale-105 hover:bg-white/5 cursor-default">
      <p className="font-black text-white leading-none" style={{ fontSize: 48 }}>
        {count}{suffix}
      </p>
      <p className="text-green-400 text-xs font-bold uppercase tracking-widest">{label}</p>
      <p className="text-white/40 text-xs" dir="rtl">{labelAr}</p>
    </div>
  );
}

// ── 3D tilt card ──────────────────────────────────────────────────────────────
function TiltCard({
  children,
  className = "",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}){
  const ref = useRef<HTMLDivElement>(null);
  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const { left, top, width, height } = el.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    el.style.transform = `perspective(600px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) scale(1.03)`;
  };
  const handleLeave = () => {
    if (ref.current) ref.current.style.transform = "perspective(600px) rotateY(0deg) rotateX(0deg) scale(1)";
  };
 return (
  <div
    ref={ref}
    className={className}
    style={style}
    onMouseMove={handleMove}
    onMouseLeave={handleLeave}
  >
    {children}
  </div>
);
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AboutPage() {

  const { ref: statsRef, inView: statsInView } = useInView(0.3);
  const [activeStep, setActiveStep] = useState(0);
  const { ref: fadeRef1, inView: fade1 } = useInView(0.1);
  const { ref: fadeRef2, inView: fade2 } = useInView(0.1);
  const { ref: fadeRef3, inView: fade3 } = useInView(0.1);

  // auto-cycle steps
  useEffect(() => {
    const t = setInterval(() => setActiveStep(p => (p + 1) % 4), 2500);
    return () => clearInterval(t);
  }, []);

  return (
    <>
    
      <style>{`
        @keyframes brand-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .brand-scroll-track { animation: brand-scroll 28s linear infinite; }
        .brand-scroll-track:hover { animation-play-state: paused; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(40px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.7s ease forwards; }

        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .shimmer-text {
          background: linear-gradient(90deg, #fff 0%, #4ade80 40%, #fff 60%, #4ade80 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 4s linear infinite;
        }

        @keyframes pulse-ring {
          0%   { transform: scale(1);   opacity: 0.6; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        .pulse-ring::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          border: 2px solid #4ade80;
          animation: pulse-ring 1.8s ease-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-8px); }
        }
        .float { animation: float 3s ease-in-out infinite; }

        .step-bar {
          transition: width 2.5s linear;
        }
      `}</style>

      {/* ── HERO — parallax feel + shimmer headline ───────────────────────── */}
      <section className="relative bg-[#0d2b1a] text-white py-28 overflow-hidden">
        {/* background grid */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "linear-gradient(#4ade8022 1px, transparent 1px), linear-gradient(90deg, #4ade8022 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

        {/* floating blobs */}
        <div className="absolute top-10 right-20 w-72 h-72 bg-green-500/10 rounded-full blur-3xl float" />
        <div className="absolute bottom-0 left-10 w-56 h-56 bg-green-700/15 rounded-full blur-2xl float" style={{ animationDelay: "1.5s" }} />

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <span className="inline-block text-green-300 text-xs font-bold uppercase tracking-widest mb-6 border border-green-400/40 px-4 py-1.5 rounded-full backdrop-blur-sm bg-green-900/20">
            Your Commercial Enablers · شركاء نجاحك التجاري
          </span>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight mb-6 leading-none">
            <span className="shimmer-text">Company</span>
            <br />
            <span className="text-white">Profile</span>
          </h1>
          <p className="text-gray-300 text-lg leading-relaxed max-w-2xl mx-auto">
            Founded in 2017, Mass Distribution operates within the HORECA sector,
            enabling brands to access and thrive in Egypt&apos;s hospitality landscape.
          </p>
          <p className="text-gray-500 text-sm mt-3" dir="rtl">
            تأسست عام 2017، تعمل ماس للتوزيع في قطاع الضيافة لتمكين العلامات التجارية من النمو في مصر
          </p>
          {/* scroll hint */}
          <div className="mt-12 flex justify-center">
            <div className="relative w-8 h-12 border-2 border-white/20 rounded-full flex items-start justify-center pt-2">
              <div className="w-1.5 h-3 bg-green-400 rounded-full" style={{ animation: "float 1.5s ease-in-out infinite" }} />
            </div>
          </div>
        </div>
      </section>

      {/* ── ANIMATED STATS ───────────────────────────────────────────────── */}
      <section ref={statsRef} className="bg-[#1B4D2E] py-16">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard value={2017} suffix=""  label="Founded"    labelAr="تأسست"           started={statsInView} />
          <StatCard value={800}  suffix="+" label="Customers"  labelAr="عميل"             started={statsInView} />
          <StatCard value={4000} suffix="+" label="Touchpoints" labelAr="نقطة تواصل"     started={statsInView} />
          <StatCard value={35}   suffix="+" label="Trucks"     labelAr="شاحنة"            started={statsInView} />
        </div>
      </section>

      {/* ── VISION & MISSION — 3D tilt cards ─────────────────────────────── */}
      <section
        ref={fadeRef1}
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
        style={{ opacity: fade1 ? 1 : 0, transform: fade1 ? "none" : "translateY(40px)", transition: "all 0.8s ease" }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <TiltCard className="bg-[#1B4D2E] text-white rounded-2xl p-8 cursor-default">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-5 relative pulse-ring">
              <Eye size={22} className="text-white relative z-10" />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight mb-1">Our Vision</h2>
            <p className="text-green-400 text-xs font-bold uppercase tracking-widest mb-4">رؤيتنا</p>
            <p className="text-gray-300 leading-relaxed">
              To <strong className="text-white">elevate and modernize</strong> Egypt&apos;s HORECA ecosystem
              by fostering strong connections between brands and operators for sustainable growth.
            </p>
            <p className="text-gray-500 text-sm mt-3 leading-relaxed" dir="rtl">
              الارتقاء بمنظومة الضيافة في مصر وتحديثها من خلال تعزيز الروابط بين العلامات التجارية والمشغلين.
            </p>
          </TiltCard>

          <TiltCard className="bg-gray-50 border border-gray-100 rounded-2xl p-8 cursor-default">
            <div className="w-12 h-12 bg-[#1B4D2E] rounded-xl flex items-center justify-center mb-5">
              <Target size={22} className="text-white" />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight mb-1">Our Mission</h2>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">مهمتنا</p>
            <p className="text-gray-700 leading-relaxed">
              To <strong className="text-black">empower brands</strong> with strategic market access,
              delivering value and innovation through exceptional execution capabilities.
            </p>
            <p className="text-gray-500 text-sm mt-3 leading-relaxed" dir="rtl">
              تمكين العلامات التجارية من الوصول الاستراتيجي للسوق وتقديم القيمة والابتكار.
            </p>
          </TiltCard>
        </div>
      </section>

      {/* ── INTERACTIVE FOUR-STEP TIMELINE ───────────────────────────────── */}
      <section className="bg-[#0d2b1a] py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black uppercase tracking-tight text-center text-white mb-1">Our Four-Step Approach</h2>
          <p className="text-green-400/60 text-sm text-center mb-14" dir="rtl">نهجنا في أربع خطوات</p>

          {/* step selector */}
          <div className="flex gap-3 mb-10 justify-center flex-wrap">
            {["01 Understand", "02 Design", "03 Execute", "04 Optimize"].map((s, i) => (
              <button
                key={i}
                onClick={() => setActiveStep(i)}
                className={`px-5 py-2.5 rounded-full text-sm font-bold uppercase tracking-wide transition-all duration-300 ${
                  activeStep === i
                    ? "bg-green-400 text-[#0d2b1a] scale-105 shadow-lg shadow-green-400/30"
                    : "border border-white/20 text-white/50 hover:border-green-400/50 hover:text-white"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* active step detail */}
          <div className="relative border border-green-400/20 rounded-2xl p-8 bg-white/5 backdrop-blur-sm overflow-hidden"
            style={{ minHeight: 180 }}>
            {/* progress bar */}
            <div className="absolute top-0 left-0 h-1 bg-green-400/20 w-full">
              <div key={activeStep} className="h-full bg-green-400 step-bar" style={{ width: "100%" }} />
            </div>

            {[
              { titleAr: "فهم",   desc: "In-depth market analysis to identify customer needs and preferences. We study the HORECA landscape deeply before recommending any strategy." },
              { titleAr: "تصميم", desc: "Tailored strategies that align with brand objectives to maximize market impact. Every plan is custom-built for the Egyptian hospitality sector." },
              { titleAr: "تنفيذ", desc: "On-ground activation ensuring seamless distribution and brand visibility. Our 17-person field team brings every strategy to life." },
              { titleAr: "تحسين", desc: "Continuous feedback loops to enhance performance. We measure, learn, and optimize every quarter to drive compounding results." },
            ].map((item, i) => (
              activeStep === i && (
                <div key={i} className="fade-up">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-6xl font-black text-green-400/20 leading-none">0{i + 1}</span>
                    <div>
                      <h3 className="text-2xl font-black text-white uppercase">
                        {["Understand", "Design", "Execute", "Optimize"][i]}
                      </h3>
                      <p className="text-green-400 text-xs font-bold uppercase tracking-widest" dir="rtl">{item.titleAr}</p>
                    </div>
                  </div>
                  <p className="text-gray-300 leading-relaxed text-base">{item.desc}</p>
                </div>
              )
            ))}
          </div>
        </div>
      </section>

      {/* ── CORE SERVICES — hover lift cards ─────────────────────────────── */}
      <section
        ref={fadeRef2}
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
        style={{ opacity: fade2 ? 1 : 0, transform: fade2 ? "none" : "translateY(40px)", transition: "all 0.8s ease 0.1s" }}
      >
        <h2 className="text-3xl font-black uppercase tracking-tight text-center mb-1">Core Services</h2>
        <p className="text-gray-400 text-sm text-center mb-12" dir="rtl">خدماتنا الأساسية</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Truck,      title: "Distribution Excellence",  titleAr: "التميز في التوزيع",     desc: "Reliable supply chain solutions ensuring seamless delivery across Egypt's HORECA sector." },
            { icon: BarChart2,  title: "Market Access Consulting", titleAr: "استشارات الوصول للسوق", desc: "Growth strategy development to help brands penetrate and expand in the Egyptian market." },
            { icon: TrendingUp, title: "Category Development",     titleAr: "تطوير الفئات",           desc: "Targeted initiatives for product growth, building category presence with operators." },
            { icon: Target,     title: "Commercial Strategy",      titleAr: "الاستراتيجية التجارية",  desc: "Aligning brand goals with market reality through data-driven commercial planning." },
          ].map(({ icon: Icon, title, titleAr, desc }, i) => (
            <div
              key={title}
              className="group bg-white border border-gray-100 rounded-2xl p-6 hover:border-[#1B4D2E] hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-default"
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              <div className="w-11 h-11 bg-[#1B4D2E] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <Icon size={20} className="text-white" />
              </div>
              <h3 className="font-black text-sm uppercase tracking-wide mb-0.5">{title}</h3>
              <p className="text-xs text-gray-400 mb-3" dir="rtl">{titleAr}</p>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── OPERATIONAL STRENGTH — glassmorphism ─────────────────────────── */}
      <section className="relative bg-[#0d2b1a] text-white py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "linear-gradient(#4ade8022 1px, transparent 1px), linear-gradient(90deg, #4ade8022 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black uppercase tracking-tight text-center mb-1">Operational Strength</h2>
          <p className="text-green-400/60 text-sm text-center mb-12" dir="rtl">قوتنا التشغيلية</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: Users, value: "17", suffix: "-Person", label: "Sales Organization", labelAr: "فريق المبيعات",  desc: "Field, tele sales, and customer service teams working across Egypt." },
              { icon: Truck, value: "6",  suffix: " Owned",  label: "Trucks",             labelAr: "شاحنات مملوكة", desc: "Supported by a central warehouse for fast, reliable dispatch." },
              { icon: Zap,   value: "35", suffix: "+",       label: "Contractor Trucks",  labelAr: "شاحنات مقاولين", desc: "Extensive logistics network ensuring full HORECA coverage nationwide." },
            ].map(({ icon: Icon, value, suffix, label, labelAr, desc }) => (
              <TiltCard
                key={label}
                className="rounded-2xl p-6 cursor-default"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(74,222,128,0.15)",
                } as React.CSSProperties}
              >
                <div className="w-11 h-11 bg-green-400/10 border border-green-400/20 rounded-xl flex items-center justify-center mb-4">
                  <Icon size={20} className="text-green-400" />
                </div>
                <p className="font-black text-green-400 leading-none" style={{ fontSize: 44 }}>
                  {value}<span className="text-2xl">{suffix}</span>
                </p>
                <p className="font-black text-sm uppercase tracking-wide mt-2 text-white">{label}</p>
                <p className="text-green-400/50 text-xs mb-3" dir="rtl">{labelAr}</p>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── BRAND PARTNERS — scrolling ────────────────────────────────────── */}
      <section className="border-t border-b border-gray-100 py-10" style={{ background: "#F8F8F6" }}>
        <div className="max-w-7xl mx-auto px-4 mb-7 text-center">
          <h2 className="text-2xl font-black uppercase tracking-tight text-[#111111]">Our Brand Partners</h2>
          <p className="text-gray-400 text-sm mt-1" dir="rtl">شركاؤنا من العلامات التجارية</p>
        </div>
        <div className="overflow-hidden">
          <div className="flex gap-4 w-max brand-scroll-track px-4">
            {[...BRAND_PARTNERS, ...BRAND_PARTNERS].map((b, i) => (
              <div key={i} className="flex items-center justify-center rounded-xl bg-white border border-gray-200 hover:border-[#1B4D2E] hover:shadow-md hover:scale-105 transition-all shrink-0 px-4" style={{ width: 180, height: 80 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.logo} alt={b.name} style={{ maxHeight: 50, maxWidth: 140, objectFit: "contain" }} loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPETITIVE ADVANTAGES — fade-in grid ────────────────────────── */}
      <section
        ref={fadeRef3}
        className="bg-gray-50 py-20"
        style={{ opacity: fade3 ? 1 : 0, transform: fade3 ? "none" : "translateY(40px)", transition: "all 0.8s ease" }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black uppercase tracking-tight text-center mb-1">Competitive Advantages</h2>
          <p className="text-gray-400 text-sm text-center mb-12" dir="rtl">مزايانا التنافسية</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { title: "Market Building",      titleAr: "بناء الأسواق",         desc: "We create sustainable markets that ensure long-term growth, beyond mere sales transactions." },
              { title: "Strategic Mindset",    titleAr: "العقلية الاستراتيجية", desc: "Decisions driven by data and insights, ensuring we adapt to market needs effectively." },
              { title: "Portfolio Strength",   titleAr: "قوة المحفظة",          desc: "A diverse range of products enabling cross-category opportunities and enhanced market presence." },
              { title: "Collaborative Growth", titleAr: "النمو التشاركي",       desc: "Continuous feedback loops between operators and manufacturers, driving shared success." },
              { title: "Fast Access",          titleAr: "وصول سريع",            desc: "Deep relationships provide brands with rapid access to Egypt's hospitality ecosystem." },
              { title: "Future Focus",         titleAr: "التركيز على المستقبل", desc: "Expanding capabilities and investing in market intelligence to drive long-term value." },
            ].map(({ title, titleAr, desc }, i) => (
              <div
                key={title}
                className="group bg-white border border-gray-100 rounded-2xl p-6 hover:border-[#1B4D2E] hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#1B4D2E] mt-2 shrink-0 group-hover:scale-150 transition-transform duration-300" />
                  <div>
                    <h3 className="font-black text-sm uppercase tracking-wide mb-0.5">{title}</h3>
                    <p className="text-xs text-gray-400 mb-2" dir="rtl">{titleAr}</p>
                    <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA — animated gradient background ───────────────────────────── */}
      <section className="relative text-white py-24 overflow-hidden" style={{ background: "#0d2b1a" }}>
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "linear-gradient(#4ade8033 1px, transparent 1px), linear-gradient(90deg, #4ade8033 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-75 bg-green-500/15 rounded-full blur-3xl float" />

        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-3 leading-none">
            Let&apos;s Connect
            <br />
            <span className="shimmer-text">for Growth!</span>
          </h2>
          <p className="text-gray-500 text-sm mb-3" dir="rtl">لنتواصل من أجل النمو</p>
          <p className="text-gray-400 mb-10">800+ clients trust Mass Distribution across Cairo &amp; Giza.</p>
          <Link
            href="/contact"
            className="group inline-flex items-center gap-3 bg-green-400 text-[#0d2b1a] font-black uppercase tracking-wide px-10 py-4 rounded-xl hover:bg-white transition-colors text-base shadow-xl shadow-green-400/20"
          >
            Contact Us
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </>
  );
}
