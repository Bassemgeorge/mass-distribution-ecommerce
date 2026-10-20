"use client";

import { useEffect } from "react";
import { captureFirstTouch } from "@/lib/source";
import { track } from "@/lib/track";

/** Captures the first-touch traffic source and tracks WhatsApp link clicks site-wide. */
export default function AnalyticsBridge() {
  useEffect(() => {
    captureFirstTouch();

    function onClick(e: MouseEvent) {
      const link = (e.target as HTMLElement | null)?.closest?.("a[href*='wa.me']") as HTMLAnchorElement | null;
      if (!link) return;
      const path = window.location.pathname;
      if (path.startsWith("/admin") || path.startsWith("/sourcing/quote") || path.startsWith("/sourcing/approve")) return; // staff, not customers
      // Where on the site, with ids removed (never the number or message)
      const place = link.dataset.place ?? (path.replace(/\/[0-9a-f-]{8,}|\/\d+/gi, "/:id") || "/");
      track("whatsapp_click", { place });
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
