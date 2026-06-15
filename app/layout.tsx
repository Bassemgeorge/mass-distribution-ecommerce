import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/lib/cartStore";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Mass Distribution — HORECA Supplies Egypt",
  description:
    "B2B FMCG distribution for hotels, restaurants, and cafés across Egypt. 225 products from top brands.",
  keywords: "HORECA, Egypt, distribution, FMCG, wholesale, Mass Distribution",
  icons: {
    icon: "/logo-color.png.png",
    apple: "/logo-color.png.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-white text-[#111111] font-sans">
        <CartProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
