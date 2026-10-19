import type { Metadata } from "next";

// Approval link pages carry a secret token in the URL: keep them out of search engines and referrers.
export const metadata: Metadata = {
  title: "Sourcing approval — Mass Distribution",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
