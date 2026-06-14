"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cartStore";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#111111] border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0">
          <Image
            src="/logo.png"
            alt="Mass Distribution"
            width={160}
            height={48}
            className="h-10 w-auto"
            priority
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {[
            { href: "/",        label: "Home"     },
            { href: "/products",label: "Products" },
            { href: "/about",   label: "About"    },
            { href: "/contact", label: "Contact"  },
          ].map(({ href, label }) => (
            <Link key={href} href={href} className="text-white/70 hover:text-white text-sm font-medium transition-colors">
              {label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <Link href="/cart" className="relative p-2 text-white/70 hover:text-white transition-colors">
            <ShoppingCart size={20} />
            {count > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 bg-[#1B4D2E] text-white font-bold rounded-full flex items-center justify-center"
                style={{ width: 18, height: 18, fontSize: 10 }}
              >
                {count > 9 ? "9+" : count}
              </span>
            )}
          </Link>
          <Link
            href="/account"
            className="hidden sm:inline-flex items-center gap-1.5 bg-[#1B4D2E] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#163d24] transition-colors"
          >
            My Account
          </Link>
          <button
            className="md:hidden text-white/70 hover:text-white p-2 transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-[#111111] border-t border-white/10 px-4 py-4 flex flex-col gap-1">
          {[
            { href: "/",         label: "Home"       },
            { href: "/products", label: "Products"   },
            { href: "/about",    label: "About"      },
            { href: "/contact",  label: "Contact"    },
            { href: "/account",  label: "My Account" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="text-white/70 hover:text-white font-medium py-2.5 border-b border-white/10 last:border-0 transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
