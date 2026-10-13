// Promotion: minimum order EGP 5,000 until 31 Oct 2026 23:59 Cairo time, then EGP 10,000.
export const MIN_ORDER_PROMO_END = new Date("2026-10-31T23:59:59+02:00");

export function isMinOrderPromoActive(now: Date = new Date()): boolean {
  return now <= MIN_ORDER_PROMO_END;
}

export function getMinOrderTotal(now: Date = new Date()): number {
  return isMinOrderPromoActive(now) ? 5000 : 10000;
}

export const MIN_ORDER_PROMO_NOTE = "Until 31 October / حتى ٣١ أكتوبر";
