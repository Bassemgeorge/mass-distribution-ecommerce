// Traffic source (first touch) and order "via", stored in this browser.

export interface FirstTouch {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  referrer: string | null;
  landing_path: string;
  first_seen_at: string;
}

export type OrderVia = "web" | "reorder" | "reorder_email";

const FIRST_TOUCH_KEY = "md_first_touch";
const SESSION_SEEN_KEY = "md_session_seen";
const VIA_KEY = "md_cart_via";

function read(storage: Storage | undefined, key: string): string | null {
  try {
    return storage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function write(storage: Storage | undefined, key: string, value: string | null) {
  try {
    if (!storage) return;
    if (value === null) storage.removeItem(key);
    else storage.setItem(key, value);
  } catch {
    // storage blocked (private mode etc.) — tracking just won't persist
  }
}

const local = () => (typeof window === "undefined" ? undefined : window.localStorage);
const session = () => (typeof window === "undefined" ? undefined : window.sessionStorage);

/**
 * On the first page view of a browser session, remember where the visitor came from.
 * First touch wins: an existing value is never overwritten.
 */
export function captureFirstTouch() {
  if (typeof window === "undefined") return;
  if (read(session(), SESSION_SEEN_KEY)) return;
  write(session(), SESSION_SEEN_KEY, "1");
  if (read(local(), FIRST_TOUCH_KEY)) return;

  const params = new URLSearchParams(window.location.search);
  // Short links on printed invoices / price lists / QR codes: ?src=invoice | qr | whatsapp
  const src = params.get("src");
  const utmSource = params.get("utm_source") || (src && /^[a-z0-9_-]{1,40}$/i.test(src) ? src.toLowerCase() : null);

  let referrer: string | null = null;
  try {
    if (document.referrer) {
      const ref = new URL(document.referrer);
      if (ref.host !== window.location.host) referrer = `${ref.protocol}//${ref.host}`; // host only, no path/query
    }
  } catch {
    referrer = null;
  }

  const utmMedium = params.get("utm_medium");
  const utmCampaign = params.get("utm_campaign");
  if (!utmSource && !utmMedium && !utmCampaign && !referrer) return;

  const touch: FirstTouch = {
    utm_source: utmSource,
    utm_medium: utmMedium,
    utm_campaign: utmCampaign,
    referrer,
    landing_path: window.location.pathname,
    first_seen_at: new Date().toISOString(),
  };
  write(local(), FIRST_TOUCH_KEY, JSON.stringify(touch));
}

export function getFirstTouch(): FirstTouch | null {
  const raw = read(local(), FIRST_TOUCH_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as FirstTouch;
  } catch {
    return null;
  }
}

/** Marks the current cart as coming from a reorder (so the next order is tagged). */
export function setOrderVia(via: Exclude<OrderVia, "web">) {
  write(local(), VIA_KEY, via);
}

export function getOrderVia(): OrderVia {
  const v = read(local(), VIA_KEY);
  return v === "reorder" || v === "reorder_email" ? v : "web";
}

export function clearOrderVia() {
  write(local(), VIA_KEY, null);
}

/** Value for customers.signup_source (null when the visitor came direct). */
export function signupSource(): FirstTouch | null {
  return getFirstTouch();
}

/** Value for orders.source. */
export function orderSource(): (Partial<FirstTouch> & { via: OrderVia }) {
  return { ...(getFirstTouch() ?? {}), via: getOrderVia() };
}
