"use client";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

// Staff sourcing links carry a secret token in the query string; never send it to analytics.
function stripStaffToken<T extends { url: string }>(event: T): T {
  try {
    const url = new URL(event.url);
    if (url.pathname.startsWith("/sourcing/quote") || url.pathname.startsWith("/sourcing/approve")) {
      return { ...event, url: `${url.origin}${url.pathname}` };
    }
  } catch {
    // leave the event as-is if the URL can't be parsed
  }
  return event;
}

export default function SiteAnalytics() {
  return (
    <>
      <Analytics beforeSend={stripStaffToken} />
      <SpeedInsights beforeSend={stripStaffToken} />
    </>
  );
}
