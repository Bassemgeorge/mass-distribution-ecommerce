export type FollowUpStatus = "new" | "contacted" | "call_back" | "ordered" | "not_interested" | "internal";
export type FollowUpChannel = "call" | "whatsapp" | "email" | "visit" | "other";

export const FOLLOW_UP_LABELS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  call_back: "Call back",
  ordered: "Ordered",
  not_interested: "Not interested",
  internal: "Internal",
};

export const FOLLOW_UP_COLORS: Record<string, string> = {
  new: "bg-gray-100 text-gray-600 border-gray-200",
  contacted: "bg-blue-50 text-blue-700 border-blue-200",
  call_back: "bg-amber-50 text-amber-700 border-amber-200",
  ordered: "bg-[#177A41]/10 text-[#177A41] border-[#177A41]/30",
  not_interested: "bg-red-50 text-red-700 border-red-200",
};

export const CHANNEL_LABELS: Record<FollowUpChannel, string> = {
  call: "Call",
  whatsapp: "WhatsApp",
  email: "Email",
  visit: "Visit",
  other: "Other",
};

/** YYYY-MM-DD in Cairo time, optionally shifted by whole days. */
export function cairoDate(offsetDays = 0): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Cairo" }).format(
    new Date(Date.now() + offsetDays * 86_400_000)
  );
}

/** Egyptian number → international digits for wa.me / tel: (e.g. 01012345678 → 201012345678). */
export function normalizeEgyptPhone(phone: string | null | undefined): string | null {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("20")) return digits;
  if (digits.startsWith("0")) return `20${digits.slice(1)}`;
  if (digits.length === 10 && digits.startsWith("1")) return `20${digits}`;
  return digits;
}

export function whatsappLink(phone: string | null | undefined, name: string | null | undefined): string | null {
  const number = normalizeEgyptPhone(phone);
  if (!number) return null;
  const greetingName = (name ?? "").trim();
  const message =
    `أهلاً ${greetingName}، معاك نور من Mass Distribution. ` +
    "شكراً لتسجيلك على موقعنا massdistributioneg.com — حابة أساعدك في أول أوردر " +
    "(خصم ٥٪ على أول أوردر أونلاين لحد ٣١ أكتوبر).";
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function telLink(phone: string | null | undefined): string | null {
  const number = normalizeEgyptPhone(phone);
  return number ? `tel:+${number}` : null;
}

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

export function timeAgo(iso: string | null | undefined): string {
  if (!iso) return "—";
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days < 1) return "today";
  if (days < 30) return rtf.format(-days, "day");
  if (days < 365) return rtf.format(-Math.floor(days / 30), "month");
  return rtf.format(-Math.floor(days / 365), "year");
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export interface OrderTotals {
  total: number | null;
  total_incl_vat?: number | null;
  vat_amount?: number | null;
}

export function orderTotalInclVat(o: OrderTotals): number {
  if (o.total_incl_vat != null) return Number(o.total_incl_vat);
  return Number(o.total ?? 0) + Number(o.vat_amount ?? 0);
}
