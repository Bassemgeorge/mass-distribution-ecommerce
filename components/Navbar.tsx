"use client";

import Link from "next/link";
import { useCart } from "@/lib/cartStore";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 bg-[#1B4D2E] rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-sm leading-none">M</span>
          </div>
          <span className="text-[#1B4D2E] font-bold text-lg tracking-tight">
            Mass Distribution
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-gray-600 hover:text-[#1B4D2E] text-sm font-medium transition-colors">
            Home
          </Link>
          <Link href="/products" className="text-gray-600 hover:text-[#1B4D2E] text-sm font-medium transition-colors">
            Products
          </Link>
          <Link href="/about" className="text-gray-600 hover:text-[#1B4D2E] text-sm font-medium transition-colors">
            About
          </Link>
          <Link href="/contact" className="text-gray-600 hover:text-[#1B4D2E] text-sm font-medium transition-colors">
            Contact
          </Link>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <Link href="/cart" className="relative p-2 text-gray-600 hover:text-[#1B4D2E] transition-colors">
            <ShoppingCart size={20} />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-[#1B4D2E] text-white text-xs font-bold w-4.5 h-4.5 flex items-center justify-center rounded-full leading-none" style={{width:'18px',height:'18px',fontSize:'10px'}}>
                {count > 9 ? "9+" : count}
              </span>
            )}
          </Link>
          <Link href="/account" className="hidden sm:inline-flex items-center gap-1.5 bg-[#1B4D2E] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#163d24] transition-colors">
            My Account
          </Link>
          <button
            className="md:hidden text-gray-600 p-2"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-1">
          {[
            { href: "/", label: "Home" },
            { href: "/products", label: "Products" },
            { href: "/about", label: "About" },
            { href: "/contact", label: "Contact" },
            { href: "/account", label: "My Account" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="text-gray-700 hover:text-[#1B4D2E] font-medium py-2.5 border-b border-gray-50 last:border-0 transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
