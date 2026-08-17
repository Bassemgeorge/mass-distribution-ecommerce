"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="bg-[#111111] text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-flex mb-5">
              <Image
                src="/logo-green.png.png"
                alt="Mass Distribution"
                width={120}
                height={36}
                className="h-9 w-auto"
              />
            </Link>
            <p className="text-white/60 text-sm leading-relaxed">
              B2B FMCG distribution for Egypt&apos;s HORECA sector. Premium supplies by carton for restaurants, cafés, hotels, and catering businesses.
            </p>
            <p className="text-white/40 text-xs mt-3" dir="rtl">
              توزيع منتجات قطاع الضيافة في مصر للمطاعم والكافيهات والفنادق
            </p>
          </div>

          {/* Shop links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Shop</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/products" className="text-white/60 hover:text-white transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/products?category=Oil%20%26%20Ghee" className="text-white/60 hover:text-white transition-colors">
                  Oil &amp; Ghee
                </Link>
              </li>
              <li>
                <Link href="/products?category=Pasta" className="text-white/60 hover:text-white transition-colors">
                  Pasta
                </Link>
              </li>
              <li>
                <Link href="/products?category=Beverages" className="text-white/60 hover:text-white transition-colors">
                  Beverages
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-white/60 hover:text-white transition-colors">
                  Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Policies</h4>
            <ul className="space-y-3 text-sm text-white/60">
              <li>
                <span className="block text-white/80 font-medium">Privacy Policy</span>
                <span className="text-xs text-white/45">
                  Customer information is used only to process orders and contact customers about their requests.
                </span>
              </li>
              <li>
                <span className="block text-white/80 font-medium">Refund Policy</span>
                <span className="text-xs text-white/45">
                  Refunds and returns are reviewed according to product condition and company approval.
                </span>
              </li>
              <li>
                <span className="block text-white/80 font-medium">Shipping Policy</span>
                <span className="text-xs text-white/45">
                  Minimum order is 1 carton. Delivery is available across Cairo &amp; Giza within 24–48 hours.
                </span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Contact</h4>
            <ul className="space-y-2.5 text-sm">
              <li className="text-white/60">
                Mobile: <a href="tel:+201124112104" className="hover:text-white transition-colors">+20 1124112104</a>
              </li>
              <li className="text-white/60">
                Email: <a href="mailto:info@massdistribution.com" className="hover:text-white transition-colors">info@massdistribution.com</a>
              </li>
              <li className="text-white/60">Address: Cairo, Egypt</li>
              <li>
                <Link href="/contact" className="text-white/60 hover:text-white transition-colors">
                  Send an Inquiry
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs gap-2">
          <p className="text-white/40">&copy; {new Date().getFullYear()} Mass Distribution. All rights reserved.</p>
          <p className="text-white/40">HORECA · Egypt · B2B</p>
        </div>
      </div>
    </footer>
  );
}
