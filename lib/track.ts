import { track as vercelTrack } from "@vercel/analytics";

// Only ids, counts, amounts and short labels — never names, phones, emails or free text.
type TrackProps = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function track(event: string, props: TrackProps = {}) {
  const clean: Record<string, string | number | boolean | null> = {};
  for (const [k, v] of Object.entries(props)) if (v !== undefined) clean[k] = v;
  try {
    vercelTrack(event, clean);
  } catch {
    // analytics must never break the site
  }
  try {
    if (typeof window !== "undefined" && typeof window.gtag === "function") window.gtag("event", event, clean);
  } catch {
    // ignore
  }
}
