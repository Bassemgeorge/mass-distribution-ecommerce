"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard, ShoppingBag, Package, Users, MessageSquare,
  LogOut, Menu, X, ChevronRight, Upload,
} from "lucide-react";

const NAV = [
  { href: "/admin",                label: "Dashboard",    icon: LayoutDashboard },
  { href: "/admin/orders",         label: "Orders",       icon: ShoppingBag },
  { href: "/admin/products",       label: "Products",     icon: Package },
  { href: "/admin/import-prices",  label: "Import Prices",icon: Upload },
  { href: "/admin/customers",      label: "Customers",    icon: Users },
  { href: "/admin/inquiries",      label: "Inquiries",    icon: MessageSquare },
];

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname  = usePathname();
  const router    = useRouter();
  const [authed,  setAuthed]  = useState<boolean | null>(null);
  const [mobileOpen, setMob]  = useState(false);

  const isLogin = pathname === "/admin/login";

  useEffect(() => {
    const ok = localStorage.getItem("admin_authenticated") === "true";
    setAuthed(ok);
    if (!ok && !isLogin) router.replace("/admin/login");
  }, [isLogin, router]);

  function signOut() {
    localStorage.removeItem("admin_authenticated");
    router.push("/admin/login");
  }

  // Login page: render bare (no sidebar)
  if (isLogin) return <>{children}</>;

  // While checking auth
  if (authed === null) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#1B4D2E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!authed) return null;

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <Link href="/" className="block mb-1">
          <Image src="/logo-green.png.png" alt="Mass Distribution" width={130} height={40} className="h-8 w-auto" />
        </Link>
        <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Admin Panel</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setMob(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive(href)
                ? "bg-[#1B4D2E] text-white"
                : "text-gray-400 hover:text-white hover:bg-white/10"
            }`}
          >
            <Icon size={16} />
            {label}
            {isActive(href) && <ChevronRight size={12} className="ml-auto" />}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/10 space-y-1">
        <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-gray-500 hover:text-gray-300 transition-colors">
          ← Back to store
        </Link>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 bg-[#111111] flex-col fixed top-0 left-0 h-screen z-40 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-56 bg-[#111111] flex flex-col">
            <SidebarContent />
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setMob(false)} />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 md:ml-56 flex flex-col min-h-screen">
        {/* Mobile top bar */}
        <div className="md:hidden bg-[#111111] text-white flex items-center gap-3 px-4 py-3 flex-shrink-0">
          <button onClick={() => setMob(true)} className="text-gray-400 hover:text-white">
            <Menu size={20} />
          </button>
          <Image src="/logo-green.png.png" alt="" width={100} height={30} className="h-7 w-auto" />
          <span className="text-xs text-gray-500 ml-1">Admin</span>
          <button onClick={signOut} className="ml-auto text-gray-500 hover:text-red-400">
            <LogOut size={16} />
          </button>
        </div>

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
