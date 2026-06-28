"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cartStore";
import { useAuth } from "@/context/AuthContext";
import { ShoppingCart, Menu, X, User, LayoutDashboard, ClipboardList, LogOut, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
  const { count } = useCart();
  const { user, customer, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (pathname.startsWith("/admin")) return null;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleSignOut() {
    setDropdownOpen(false);
    setOpen(false);
    await signOut();
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-50 bg-[#111111] border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0">
          <Image
            src="/logo-green.png.png"
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
            { href: "/",         label: "Home"     },
            { href: "/products", label: "Products" },
            { href: "/about",    label: "About"    },
            { href: "/contact",  label: "Contact"  },
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

          {user ? (
            /* Auth dropdown */
            <div className="hidden sm:block relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 bg-[#1B4D2E] text-white text-sm font-medium px-3 py-2 rounded-lg hover:bg-[#163d24] transition-colors"
              >
                <User size={15} />
                <span className="max-w-[120px] truncate">{customer?.business_name ?? user.email?.split("@")[0]}</span>
                <ChevronDown size={13} className={`transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl border border-gray-200 shadow-lg py-1.5 overflow-hidden">
                  <div className="px-3 py-2 border-b border-gray-100 mb-1">
                    <p className="text-xs font-semibold text-[#111111] truncate">{customer?.business_name ?? "My Account"}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                  <Link href="/account/dashboard" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-3 py-2 text-sm text-[#111111] hover:bg-gray-50 transition-colors">
                    <LayoutDashboard size={14} className="text-[#1B4D2E]" /> Dashboard
                  </Link>
                  <Link href="/account/orders" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-3 py-2 text-sm text-[#111111] hover:bg-gray-50 transition-colors">
                    <ClipboardList size={14} className="text-[#1B4D2E]" /> My Orders
                  </Link>
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button onClick={handleSignOut} className="flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors">
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/account/login"
              className="hidden sm:inline-flex items-center gap-1.5 bg-[#1B4D2E] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#163d24] transition-colors"
            >
              Sign In
            </Link>
          )}

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
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="text-white/70 hover:text-white font-medium py-2.5 border-b border-white/10 transition-colors"
            >
              {label}
            </Link>
          ))}

          {user ? (
            <>
              <Link href="/account/dashboard" onClick={() => setOpen(false)} className="text-white/70 hover:text-white font-medium py-2.5 border-b border-white/10 transition-colors flex items-center gap-2">
                <LayoutDashboard size={14} /> Dashboard
              </Link>
              <Link href="/account/orders" onClick={() => setOpen(false)} className="text-white/70 hover:text-white font-medium py-2.5 border-b border-white/10 transition-colors flex items-center gap-2">
                <ClipboardList size={14} /> My Orders
              </Link>
              <button onClick={handleSignOut} className="text-red-400 hover:text-red-300 font-medium py-2.5 text-left flex items-center gap-2 transition-colors">
                <LogOut size={14} /> Sign Out
              </button>
            </>
          ) : (
            <Link href="/account/login" onClick={() => setOpen(false)} className="text-white/70 hover:text-white font-medium py-2.5 transition-colors">
              Sign In
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
