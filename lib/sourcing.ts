// Sourcing Desk (مكتب التوريد): shared labels and helpers.

export type SourcingStatus =
  | "received"
  | "sourcing"
  | "pending_approval"
  | "quoted"
  | "accepted"
  | "declined"
  | "expired"
  | "unavailable"
  | "cancelled";

export const SOURCING_BUCKET = "sourcing-uploads";
export const MAX_FILES = 5;
export const MAX_FILE_BYTES = 10 * 1024 * 1024;
export const ACCEPTED_FILE_TYPES = "image/jpeg,image/png,image/webp,image/heic,image/heif,application/pdf";
export const MIN_MARGIN = 0.08;

// Customer-facing: pending_approval is shown exactly like sourcing.
const CUSTOMER_STATUS: Record<string, { en: string; ar: string; className: string }> = {
  received: { en: "Received", ar: "تم الاستلام", className: "bg-gray-100 text-gray-700 border-gray-200" },
  sourcing: { en: "Preparing your quote", ar: "بنجهز عرض السعر", className: "bg-blue-50 text-blue-700 border-blue-200" },
  quoted: { en: "Quote ready", ar: "عرض السعر جاهز", className: "bg-[#177A41]/10 text-[#177A41] border-[#177A41]/30" },
  accepted: { en: "Accepted – order placed", ar: "تم القبول", className: "bg-[#1B4D2E] text-white border-[#1B4D2E]" },
  declined: { en: "Declined", ar: "مرفوض", className: "bg-gray-100 text-gray-500 border-gray-200" },
  expired: { en: "Quote expired", ar: "انتهت صلاحية العرض", className: "bg-amber-50 text-amber-800 border-amber-200" },
  unavailable: { en: "Not available", ar: "غير متاح", className: "bg-red-50 text-red-700 border-red-200" },
  cancelled: { en: "Cancelled", ar: "ملغي", className: "bg-gray-100 text-gray-500 border-gray-200" },
};

export function customerStatus(status: string) {
  return CUSTOMER_STATUS[status === "pending_approval" ? "sourcing" : status] ?? CUSTOMER_STATUS.received;
}

// Staff / admin labels (internal statuses shown as they are)
export const STAFF_STATUS_LABEL: Record<string, string> = {
  received: "Received",
  sourcing: "Sourcing",
  pending_approval: "Waiting for Bassem",
  quoted: "Quoted",
  accepted: "Accepted",
  declined: "Declined",
  expired: "Expired",
  unavailable: "Unavailable",
  cancelled: "Cancelled",
};

export const OPEN_STATUSES = ["received", "sourcing", "pending_approval"];

/** Token-link pages for staff (no site header/footer, token never sent anywhere). */
export function isSourcingStaffPath(pathname: string) {
  return pathname.startsWith("/sourcing/quote") || pathname.startsWith("/sourcing/approve");
}

export function kindLabel(kind: string) {
  return kind === "invoice" ? { en: "Beat my invoice", ar: "قارن فاتورتي" } : { en: "Item request", ar: "طلب صنف" };
}

/** e.g. "Mon 19 Oct, 7:00 PM" in Cairo time */
export function formatCairo(iso: string | null | undefined): string {
  if (!iso) return "—";
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Cairo",
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).formatToParts(new Date(iso));
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("weekday")} ${get("day")} ${get("month")}, ${get("hour")}:${get("minute")} ${get("dayPeriod").toUpperCase()}`;
}

export function formatCairoDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Cairo", day: "numeric", month: "short", year: "numeric" }).format(
    new Date(iso)
  );
}

export function money(n: number | null | undefined): string {
  return `EGP ${Number(n ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** ASCII letters/digits/dash/dot only, keeping the extension. */
export function safeFileName(name: string): string {
  const dot = name.lastIndexOf(".");
  const base = (dot > 0 ? name.slice(0, dot) : name).replace(/[^A-Za-z0-9-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  const ext = dot > 0 ? name.slice(dot + 1).replace(/[^A-Za-z0-9]/g, "").toLowerCase() : "";
  return `${base || "file"}${ext ? `.${ext}` : ""}`;
}

/** "uid/1729340000000-invoice.pdf" → "invoice.pdf" */
export function attachmentName(path: string): string {
  const file = path.split("/").pop() ?? path;
  return file.replace(/^\d+-/, "");
}

export function margin(price: number, cost: number): number | null {
  if (!(price > 0) || !(cost >= 0)) return null;
  return (price - cost) / price;
}

/** Lowest price giving the minimum margin, rounded up to 0.25. */
export function priceAtMinMargin(cost: number): number {
  return Math.ceil((cost / (1 - MIN_MARGIN)) * 4) / 4;
}

export function remainingLabel(iso: string | null | undefined, now = Date.now()): string | null {
  if (!iso) return null;
  const ms = new Date(iso).getTime() - now;
  if (ms <= 0) return null;
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return h > 0 ? `${h}h ${m}m left` : `${m}m left`;
}
