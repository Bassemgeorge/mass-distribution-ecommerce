"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { MapPin, Phone, Mail, Clock, CheckCircle, AlertCircle } from "lucide-react";

const BUSINESS_TYPES = ["Hotel", "Restaurant", "Café", "Catering", "Other"];
const AREAS = ["Cairo", "Giza"];
const HEARD_FROM = ["Google", "Instagram", "LinkedIn", "Referral", "Other"];

type Form = {
  businessName: string;
  contactName: string;
  phone: string;
  email: string;
  businessType: string;
  area: string;
  message: string;
  heardFrom: string;
};

const empty: Form = {
  businessName: "",
  contactName: "",
  phone: "",
  email: "",
  businessType: "Restaurant",
  area: "Cairo",
  message: "",
  heardFrom: "Google",
};

const WHATSAPP_NUMBER = "201124112104";
const PHONE_NUMBER = "+20 1124112104";
const EMAIL = "info@massdistribution.com";

function WhatsAppIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}

export default function ContactPage() {
  const [form, setForm] = useState<Form>({ ...empty });
  const [loading, setLoad] = useState(false);
  const [success, setOk] = useState(false);
  const [error, setErr] = useState<string | null>(null);

  function set(field: keyof Form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.businessName || !form.contactName || !form.phone || !form.email) {
      setErr("Please fill in all required fields.");
      return;
    }

    setErr(null);
    setLoad(true);

    try {
      const { error: dbErr } = await supabase.from("inquiries").insert({
        business_name: form.businessName,
        contact_name: form.contactName,
        phone: form.phone,
        email: form.email,
        business_type: form.businessType,
        area: form.area,
        message: form.message || null,
        heard_from: form.heardFrom,
      });

      if (dbErr) {
        console.error("Supabase inquiry error:", dbErr);
        setErr(dbErr.message || "Something went wrong. Please try WhatsApp instead.");
        return;
      }

      setOk(true);
      setForm({ ...empty });
    } catch (err) {
      console.error("Contact form error:", err);
      setErr("Connection error. Please try WhatsApp instead.");
    } finally {
      setLoad(false);
    }
  }

  const inp =
    "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1B4D2E] transition-colors bg-white";

  const lbl = "block text-xs font-medium text-gray-500 mb-1.5";
  const req = <span className="text-red-400 ml-0.5">*</span>;

  return (
    <div className="min-h-screen bg-[#F7F7F5]">
      <div className="bg-[#111111] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold">Get in Touch</h1>
          <p className="text-gray-400 text-sm mt-1" dir="rtl">
            تواصل معنا
          </p>
          <p className="text-gray-400 mt-3 text-sm max-w-lg">
            Ready to partner with us? Send an inquiry or reach us directly on WhatsApp — we respond within 24 hours.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2 space-y-6">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 bg-[#25D366] hover:bg-[#1ebe5d] transition-colors text-white rounded-xl px-5 py-4 font-semibold text-sm shadow-sm"
            >
              <span className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <WhatsAppIcon size={22} />
              </span>
              <div>
                <p className="font-bold text-base leading-tight">Chat on WhatsApp</p>
                <p className="text-white/80 text-xs font-normal mt-0.5" dir="rtl">
                  تواصل عبر واتساب
                </p>
              </div>
            </a>

            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
              {[
                { icon: MapPin, label: "Address", labelAr: "العنوان", value: "Cairo, Egypt", href: null },
                { icon: Phone, label: "Phone", labelAr: "الهاتف", value: PHONE_NUMBER, href: `tel:${WHATSAPP_NUMBER}` },
                { icon: Mail, label: "Email", labelAr: "البريد الإلكتروني", value: EMAIL, href: `mailto:${EMAIL}` },
                { icon: Clock, label: "Hours", labelAr: "ساعات العمل", value: "Sun–Thu, 9AM–6PM", href: null },
              ].map(({ icon: Icon, label, labelAr, value, href }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#E8F5E9] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon size={16} className="text-[#1B4D2E]" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-400">
                      {label} · <span dir="rtl">{labelAr}</span>
                    </p>

                    {href ? (
                      <a
                        href={href}
                        className="text-sm font-semibold text-[#111111] hover:text-[#1B4D2E] transition-colors mt-0.5 block"
                      >
                        {value}
                      </a>
                    ) : (
                      <p className="text-sm font-semibold text-[#111111] mt-0.5">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-bold text-[#111111] mb-1">
                Our Coverage Area
              </h3>
              <p className="text-xs text-gray-400 mb-3">
                We deliver across Cairo and Giza within 24–48 hours.
              </p>
              <p className="text-xs text-gray-400 mb-4" dir="rtl">
                نوصل في القاهرة والجيزة خلال 24 إلى 48 ساعة.
              </p>

              <div className="flex gap-2 flex-wrap">
                {[
                  { en: "Cairo", ar: "القاهرة" },
                  { en: "Giza", ar: "الجيزة" },
                ].map(({ en, ar }) => (
                  <span
                    key={en}
                    className="inline-flex items-center gap-1.5 bg-[#E8F5E9] text-[#1B4D2E] text-xs font-semibold px-3 py-1.5 rounded-full border border-green-200"
                  >
                    <MapPin size={11} /> {en} · <span dir="rtl">{ar}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-[#111111] mb-1">
                Send an Inquiry
              </h2>
              <p className="text-gray-400 text-sm mb-6" dir="rtl">
                إرسال الاستفسار
              </p>

              {success ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <CheckCircle size={48} className="text-[#1B4D2E] mb-4" />

                  <h3 className="text-lg font-bold text-[#111111] mb-2">
                    Thank you!
                  </h3>

                  <p className="text-gray-500 text-sm mb-1">
                    We&apos;ll contact you within 24 hours.
                  </p>

                  <p className="text-gray-400 text-sm" dir="rtl">
                    شكرًا! سنتواصل معك خلال 24 ساعة.
                  </p>

                  <button
                    onClick={() => setOk(false)}
                    className="mt-8 text-sm text-[#1B4D2E] hover:underline font-medium"
                  >
                    Send another inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2.5">
                      <AlertCircle size={15} className="flex-shrink-0" />
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={lbl}>Business Name {req}</label>
                      <input
                        type="text"
                        value={form.businessName}
                        onChange={(e) => set("businessName", e.target.value)}
                        className={inp}
                        placeholder="Cairo Marriott Hotel"
                      />
                    </div>

                    <div>
                      <label className={lbl}>Contact Name {req}</label>
                      <input
                        type="text"
                        value={form.contactName}
                        onChange={(e) => set("contactName", e.target.value)}
                        className={inp}
                        placeholder="Ahmed Hassan"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={lbl}>Phone Number {req}</label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => set("phone", e.target.value)}
                        className={inp}
                        placeholder="+20 10 xxxx xxxx"
                      />
                    </div>

                    <div>
                      <label className={lbl}>Email Address {req}</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => set("email", e.target.value)}
                        className={inp}
                        placeholder="ahmed@restaurant.eg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={lbl}>Business Type</label>
                      <select
                        value={form.businessType}
                        onChange={(e) => set("businessType", e.target.value)}
                        className={inp}
                      >
                        {BUSINESS_TYPES.map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={lbl}>Area</label>
                      <select
                        value={form.area}
                        onChange={(e) => set("area", e.target.value)}
                        className={inp}
                      >
                        {AREAS.map((a) => (
                          <option key={a}>{a}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={lbl}>Message / Special Requirements</label>
                    <textarea
                      rows={4}
                      value={form.message}
                      onChange={(e) => set("message", e.target.value)}
                      className={`${inp} resize-none`}
                      placeholder="Tell us about your volume needs, delivery frequency, preferred products…"
                    />
                  </div>

                  <div>
                    <label className={lbl}>How did you hear about us?</label>
                    <select
                      value={form.heardFrom}
                      onChange={(e) => set("heardFrom", e.target.value)}
                      className={inp}
                    >
                      {HEARD_FROM.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#1B4D2E] text-white font-semibold py-3 rounded-lg hover:bg-[#163d24] transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Sending…
                      </span>
                    ) : (
                      <>
                        Send Inquiry &nbsp;·&nbsp; <span dir="rtl">إرسال الاستفسار</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#1B4D2E] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
          <div className="flex-shrink-0 w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
            <MapPin size={32} className="text-white" />
          </div>

          <div className="text-center sm:text-left">
            <p className="text-xs font-semibold text-green-300 uppercase tracking-widest mb-1">
              Cairo &amp; Giza
            </p>

            <h2 className="text-xl font-bold leading-snug">
              Order today — delivered to your door within 24–48 hours
            </h2>

            <p className="text-green-300 text-sm mt-1" dir="rtl">
              اطلب اليوم — التوصيل لبابك خلال 24 إلى 48 ساعة
            </p>
          </div>

          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 sm:ml-auto flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] transition-colors text-white font-semibold px-6 py-3 rounded-xl text-sm"
          >
            <WhatsAppIcon size={18} /> Order Now
          </a>
        </div>
      </div>
    </div>
  );
}