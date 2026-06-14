import Link from "next/link";
import { ArrowRight, Target, Eye, TrendingUp, Users, Truck, BarChart2, Handshake, Zap } from "lucide-react";

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-[#1B4D2E] text-white py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <span className="inline-block text-[#1B4D2E] text-xs font-bold uppercase tracking-widest mb-4 border border-[#1B4D2E]/30 px-4 py-1.5 rounded-full">
            Your Commercial Enablers · شركاء نجاحك التجاري
          </span>
          <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tight mb-6">
            Company <span className="text-[#1B4D2E]">Profile</span>
          </h1>
          <p className="text-gray-300 text-lg leading-relaxed max-w-2xl mx-auto">
            Founded in 2017, Mass Distribution operates within the HORECA sector,
            enabling brands to access and thrive in Egypt&apos;s hospitality landscape.
          </p>
          <p className="text-gray-500 text-sm mt-3" dir="rtl">
            تأسست عام 2017، تعمل ماس للتوزيع في قطاع الضيافة لتمكين العلامات التجارية من النمو في مصر
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-[#1B4D2E] py-12">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {[
            { value: "2017",  label: "Founded · تأسست" },
            { value: "800+",  label: "Customers · عميل" },
            { value: "4,000+", label: "Touchpoints · نقطة تواصل" },
            { value: "35+",   label: "Trucks · شاحنة" },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-4xl font-black text-black">{value}</p>
              <p className="text-black/70 font-bold uppercase tracking-wide text-xs mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Vision */}
          <div className="bg-[#1B4D2E] text-white rounded-2xl p-8">
            <div className="w-12 h-12 bg-[#1B4D2E] rounded-xl flex items-center justify-center mb-5">
              <Eye size={22} className="text-black" />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight mb-1">Our Vision</h2>
            <p className="text-[#1B4D2E] text-xs font-bold uppercase tracking-widest mb-4">رؤيتنا</p>
            <p className="text-gray-300 leading-relaxed">
              To <strong className="text-white">elevate and modernize</strong> Egypt&apos;s HORECA ecosystem
              by fostering strong connections between brands and operators for sustainable growth.
            </p>
            <p className="text-gray-500 text-sm mt-3 leading-relaxed" dir="rtl">
              الارتقاء بمنظومة الضيافة في مصر وتحديثها من خلال تعزيز الروابط بين العلامات التجارية والمشغلين لتحقيق نمو مستدام.
            </p>
          </div>

          {/* Mission */}
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-8">
            <div className="w-12 h-12 bg-[#1B4D2E] rounded-xl flex items-center justify-center mb-5">
              <Target size={22} className="text-black" />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight mb-1">Our Mission</h2>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">مهمتنا</p>
            <p className="text-gray-700 leading-relaxed">
              To <strong className="text-black">empower brands</strong> with strategic market access,
              delivering value and innovation through exceptional execution capabilities
              in the hospitality sector.
            </p>
            <p className="text-gray-500 text-sm mt-3 leading-relaxed" dir="rtl">
              تمكين العلامات التجارية من الوصول الاستراتيجي للسوق وتقديم القيمة والابتكار من خلال قدرات تنفيذية استثنائية في قطاع الضيافة.
            </p>
          </div>
        </div>
      </section>

      {/* Our Journey */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-black uppercase tracking-tight mb-1">Our Journey</h2>
          <p className="text-gray-400 text-sm mb-8" dir="rtl">مسيرتنا</p>
          <p className="text-gray-600 text-lg leading-relaxed">
            Founded in 2017, Mass Distribution was established to help companies navigate
            Egypt&apos;s complex hospitality landscape. By combining{" "}
            <strong className="text-black">strategy, relationships, and execution</strong>, we ensure
            that brands can thrive while meeting the evolving needs of the sector. Today, we are a
            trusted partner in shaping the industry.
          </p>
          <p className="text-gray-400 text-sm mt-6 leading-relaxed" dir="rtl">
            تأسست ماس للتوزيع عام 2017 لمساعدة الشركات على التنقل في المشهد الضيافي المعقد في مصر.
            من خلال الجمع بين الاستراتيجية والعلاقات والتنفيذ، نضمن أن تزدهر العلامات التجارية.
          </p>
        </div>
      </section>

      {/* Core Services */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-black uppercase tracking-tight text-center mb-1">Core Services</h2>
        <p className="text-gray-400 text-sm text-center mb-12" dir="rtl">خدماتنا الأساسية</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Truck,      title: "Distribution Excellence",    titleAr: "التميز في التوزيع",     desc: "Reliable supply chain solutions ensuring seamless delivery across Egypt's HORECA sector." },
            { icon: BarChart2,  title: "Market Access Consulting",   titleAr: "استشارات الوصول للسوق", desc: "Growth strategy development to help brands penetrate and expand in the Egyptian market." },
            { icon: TrendingUp, title: "Category Development",       titleAr: "تطوير الفئات",           desc: "Targeted initiatives for product growth, building category presence with operators." },
            { icon: Target,     title: "Commercial Strategy",        titleAr: "الاستراتيجية التجارية",  desc: "Aligning brand goals with market reality through data-driven commercial planning." },
          ].map(({ icon: Icon, title, titleAr, desc }) => (
            <div key={title} className="bg-white border border-gray-100 rounded-2xl p-6 hover:border-[#1B4D2E] transition-colors">
              <div className="w-11 h-11 bg-[#1B4D2E] rounded-xl flex items-center justify-center mb-4">
                <Icon size={20} className="text-black" />
              </div>
              <h3 className="font-black text-sm uppercase tracking-wide mb-0.5">{title}</h3>
              <p className="text-xs text-gray-400 mb-3" dir="rtl">{titleAr}</p>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Operational Strength */}
      <section className="bg-[#1B4D2E] text-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black uppercase tracking-tight text-center mb-1">Operational Strength</h2>
          <p className="text-gray-400 text-sm text-center mb-12" dir="rtl">قوتنا التشغيلية</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: Users, value: "17-Person",  label: "Sales Organization",  labelAr: "فريق المبيعات",    desc: "Field, tele sales, and customer service teams working across Egypt." },
              { icon: Truck, value: "6 Owned",    label: "Trucks",               labelAr: "شاحنات مملوكة",    desc: "Supported by a central warehouse for fast, reliable dispatch." },
              { icon: Zap,   value: "35+",        label: "Contractor Trucks",    labelAr: "شاحنات مقاولين",   desc: "Extensive logistics network ensuring full HORECA coverage nationwide." },
            ].map(({ icon: Icon, value, label, labelAr, desc }) => (
              <div key={label} className="border border-white/10 rounded-2xl p-6 hover:border-[#1B4D2E] transition-colors">
                <div className="w-11 h-11 bg-[#1B4D2E]/10 border border-[#1B4D2E]/20 rounded-xl flex items-center justify-center mb-4">
                  <Icon size={20} className="text-[#1B4D2E]" />
                </div>
                <p className="text-3xl font-black text-[#1B4D2E]">{value}</p>
                <p className="font-black text-sm uppercase tracking-wide mt-1">{label}</p>
                <p className="text-gray-500 text-xs mb-3" dir="rtl">{labelAr}</p>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Four-Step Approach */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-black uppercase tracking-tight text-center mb-1">Our Four-Step Approach</h2>
        <p className="text-gray-400 text-sm text-center mb-12" dir="rtl">نهجنا في أربع خطوات</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { step: "01", title: "Understand", titleAr: "فهم", desc: "In-depth market analysis to identify customer needs and preferences for effective strategies." },
            { step: "02", title: "Design",     titleAr: "تصميم", desc: "Tailored strategies that align with brand objectives to maximize market impact and success." },
            { step: "03", title: "Execute",    titleAr: "تنفيذ", desc: "On-ground activation ensuring seamless distribution and brand visibility in the market." },
            { step: "04", title: "Optimize",   titleAr: "تحسين", desc: "Continuous feedback loops to enhance performance and drive ongoing improvements." },
          ].map(({ step, title, titleAr, desc }) => (
            <div key={step} className="relative">
              <div className="text-6xl font-black text-gray-100 leading-none mb-3">{step}</div>
              <h3 className="text-xl font-black uppercase tracking-tight mb-0.5">{title}</h3>
              <p className="text-xs text-[#1B4D2E] font-bold uppercase tracking-widest mb-3" dir="rtl">{titleAr}</p>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Competitive Advantages */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black uppercase tracking-tight text-center mb-1">Competitive Advantages</h2>
          <p className="text-gray-400 text-sm text-center mb-12" dir="rtl">مزايانا التنافسية</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { title: "Market Building",        titleAr: "بناء الأسواق",         desc: "We create sustainable markets that ensure long-term growth, beyond mere sales transactions." },
              { title: "Strategic Mindset",      titleAr: "العقلية الاستراتيجية", desc: "Decisions driven by data and insights, ensuring we adapt to market needs effectively." },
              { title: "Portfolio Strength",     titleAr: "قوة المحفظة",          desc: "A diverse range of products enabling cross-category opportunities and enhanced market presence." },
              { title: "Collaborative Growth",   titleAr: "النمو التشاركي",       desc: "Continuous feedback loops between operators and manufacturers, driving shared success." },
              { title: "Fast Access",            titleAr: "وصول سريع",            desc: "Deep relationships provide brands with rapid access to Egypt's hospitality ecosystem." },
              { title: "Future Focus",           titleAr: "التركيز على المستقبل", desc: "Expanding capabilities and investing in market intelligence to drive long-term value." },
            ].map(({ title, titleAr, desc }) => (
              <div key={title} className="bg-white border border-gray-100 rounded-2xl p-6 hover:border-[#1B4D2E] transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#1B4D2E] mt-2 flex-shrink-0" />
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

      {/* CTA */}
      <section className="bg-[#1B4D2E] text-white py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-black uppercase tracking-tight mb-3">
            Let&apos;s Connect <span className="text-[#1B4D2E]">for Growth!</span>
          </h2>
          <p className="text-gray-400 text-sm mb-8" dir="rtl">لنتواصل من أجل النمو</p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-[#1B4D2E] text-black font-black uppercase tracking-wide px-10 py-4 rounded-xl hover:bg-white hover:text-[#1B4D2E] transition-colors text-base"
          >
            Contact Us <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </>
  );
}

