import { Mail, Phone, MapPin, Clock } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="text-center mb-14">
        <span className="inline-block text-[#1B4D2E] text-xs font-bold uppercase tracking-widest mb-3 border border-[#1B4D2E]/30 px-4 py-1.5 rounded-full">
          Let&apos;s Connect for Growth · لنتواصل من أجل النمو
        </span>
        <h1 className="text-5xl font-black uppercase tracking-tight mt-4">Contact Us</h1>
        <p className="text-gray-400 text-sm mt-1" dir="rtl">تواصل معنا</p>
        <p className="text-gray-500 mt-3 text-base max-w-xl mx-auto">
          Ready to bring your brand into Egypt&apos;s HORECA sector? Reach out — we&apos;re here to help you grow.
        </p>
        <p className="text-gray-400 text-sm mt-1 max-w-xl mx-auto" dir="rtl">
          هل أنت مستعد لإطلاق علامتك التجارية في قطاع الضيافة المصري؟ تواصل معنا.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Form */}
        <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-black uppercase tracking-tight mb-1">Send a Message</h2>
          <p className="text-gray-400 text-xs mb-6" dir="rtl">أرسل رسالة</p>
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1.5">Name · الاسم</label>
                <input type="text" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1B4D2E] transition-colors" placeholder="Your name" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1.5">Company · الشركة</label>
                <input type="text" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1B4D2E] transition-colors" placeholder="Your company" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1.5">Email · البريد الإلكتروني</label>
              <input type="email" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1B4D2E] transition-colors" placeholder="you@company.com" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1.5">Phone · الهاتف</label>
              <input type="tel" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1B4D2E] transition-colors" placeholder="+20 XXX XXX XXXX" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1.5">Subject · الموضوع</label>
              <select className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1B4D2E] transition-colors bg-white">
                <option>Distribution Partnership · شراكة توزيع</option>
                <option>Product Inquiry · استفسار عن منتج</option>
                <option>Bulk / Wholesale Pricing · أسعار الجملة</option>
                <option>HORECA Consulting · استشارات الضيافة</option>
                <option>Order Issue · مشكلة في الطلب</option>
                <option>Other · أخرى</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1.5">Message · الرسالة</label>
              <textarea rows={5} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1B4D2E] transition-colors resize-none" placeholder="Tell us how we can help..." />
            </div>
            <button className="w-full bg-[#1B4D2E] text-white font-black uppercase tracking-wide py-4 rounded-xl hover:bg-[#1B4D2E] hover:text-[#111111] transition-colors">
              Send Message · إرسال
            </button>
          </div>
        </div>

        {/* Contact details */}
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight mb-1">Get in Touch</h2>
            <p className="text-gray-400 text-xs mb-6" dir="rtl">معلومات التواصل</p>
            <div className="space-y-5">
              {[
                {
                  icon: Mail,
                  label: "Email · البريد الإلكتروني",
                  value: "info@mass-dis.com",
                  href: "mailto:info@mass-dis.com",
                },
                {
                  icon: Phone,
                  label: "Phone · الهاتف",
                  value: "+20 128 988 8087",
                  href: "tel:+201289888087",
                },
                {
                  icon: MapPin,
                  label: "Location · الموقع",
                  value: "Egypt — Nationwide HORECA Coverage",
                  href: null,
                },
              ].map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="flex items-start gap-4">
                  <div className="w-11 h-11 bg-[#1B4D2E]/10 border border-[#1B4D2E]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon size={18} className="text-[#1B4D2E]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-400">{label}</p>
                    {href ? (
                      <a href={href} className="font-semibold text-sm mt-0.5 hover:text-[#1B4D2E] transition-colors">
                        {value}
                      </a>
                    ) : (
                      <p className="font-semibold text-sm mt-0.5">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* What we do */}
          <div className="bg-[#1B4D2E] text-white rounded-2xl p-6">
            <h3 className="font-black uppercase tracking-wide text-sm mb-1">Who We Serve</h3>
            <p className="text-gray-400 text-xs mb-4" dir="rtl">من نخدم</p>
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              Mass Distribution proudly serves over <strong className="text-[#1B4D2E]">800 customers</strong> across
              Egypt, with more than <strong className="text-[#1B4D2E]">4,000 touchpoints</strong> in the HORECA sector —
              hotels, restaurants, and cafés.
            </p>
            <p className="text-gray-500 text-xs leading-relaxed" dir="rtl">
              تخدم ماس للتوزيع أكثر من 800 عميل في جميع أنحاء مصر بأكثر من 4,000 نقطة تواصل في قطاع الضيافة.
            </p>
          </div>

          {/* Hours */}
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={16} className="text-[#1B4D2E]" />
              <h3 className="font-black uppercase tracking-wide text-sm">Business Hours · ساعات العمل</h3>
            </div>
            <div className="space-y-2 text-sm">
              {[
                { day: "Sunday – Thursday · الأحد – الخميس", hours: "9:00 AM – 6:00 PM" },
                { day: "Saturday · السبت",                    hours: "10:00 AM – 3:00 PM" },
                { day: "Friday · الجمعة",                     hours: "Closed · مغلق" },
              ].map(({ day, hours }) => (
                <div key={day} className="flex justify-between items-start gap-4">
                  <span className="text-gray-500 text-xs leading-snug">{day}</span>
                  <span className="font-semibold text-xs flex-shrink-0">{hours}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

