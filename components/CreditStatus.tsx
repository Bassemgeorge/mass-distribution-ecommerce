import { Loader2, MessageCircle, Mail, Phone } from "lucide-react";

export const CREDIT_PAYMENT_LABEL = "Credit (on account) / آجل";

const PILLS: Record<string, { en: string; ar: string; className: string }> = {
  checking: { en: "Checking your credit…", ar: "جاري مراجعة الآجل", className: "bg-gray-100 text-gray-600 border-gray-200" },
  approved: { en: "Confirmed · on credit", ar: "تم التأكيد · آجل", className: "bg-[#177A41]/10 text-[#177A41] border-[#177A41]/30" },
  held: {
    en: "Awaiting approval: credit limit exceeded",
    ar: "في انتظار الموافقة: تم تجاوز حد الائتمان",
    className: "bg-amber-50 text-amber-800 border-amber-200",
  },
  rejected: { en: "Not approved, please contact us", ar: "لم تتم الموافقة، برجاء التواصل معنا", className: "bg-red-50 text-red-700 border-red-200" },
};

// Customer-facing only: never pass credit_check details or staff names into these.
export function CreditStatusPill({ status }: { status: string | null | undefined }) {
  const pill = PILLS[status ?? "checking"] ?? PILLS.checking;
  return (
    <span className={`inline-flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs font-medium px-2.5 py-1 rounded-full border ${pill.className}`}>
      {(status ?? "checking") === "checking" && <Loader2 size={11} className="animate-spin" />}
      <span>{pill.en}</span>
      <span className="opacity-70">/</span>
      <span dir="rtl">{pill.ar}</span>
    </span>
  );
}

export function CreditStatusNote({ status }: { status: string | null | undefined }) {
  if (status === "held") {
    return (
      <p className="text-xs text-amber-800 mt-2">
        Our team will confirm your order shortly. / <span dir="rtl">فريقنا هيأكد طلبك قريباً.</span>
      </p>
    );
  }
  if (status === "rejected") {
    return (
      <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-xs">
        <a
          href="https://wa.me/201288895916"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-lg bg-[#25D366]/10 text-[#128C4A] px-2.5 py-1.5 font-semibold"
        >
          <MessageCircle size={13} /> WhatsApp
        </a>
        <a href="tel:+201288895916" className="inline-flex items-center gap-1 rounded-lg bg-gray-100 text-gray-700 px-2.5 py-1.5 font-semibold" dir="ltr">
          <Phone size={13} /> +20 128 889 5916
        </a>
        <a href="mailto:info@mass-dis.com" className="inline-flex items-center gap-1 rounded-lg bg-gray-100 text-gray-700 px-2.5 py-1.5 font-semibold">
          <Mail size={13} /> info@mass-dis.com
        </a>
      </div>
    );
  }
  return null;
}
