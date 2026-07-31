"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  MessageSquare,
  LogOut,
  Menu,
  ChevronRight,
  Upload,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/import-prices", label: "Import Prices", icon: Upload },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/inquiries", label: "Inquiries", icon: MessageSquare },
];

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [authed, setAuthed] = useState<boolean | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isLogin = pathname === "/admin/login";

  useEffect(() => {
    let cancelled = false;

    async function checkAdminAccess() {
      if (isLogin) {
        setAuthed(true);
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        if (!cancelled) {
          setAuthed(false);
          router.replace("/admin/login");
        }
        return;
      }

      const { data: isAdmin, error } = await supabase.rpc("is_admin");

      if (cancelled) return;

      if (error || isAdmin !== true) {
        await supabase.auth.signOut();
        setAuthed(false);
        router.replace("/admin/login");
        return;
      }

      setAuthed(true);
    }

    checkAdminAccess();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      checkAdminAccess();
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [isLogin, router]);

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  if (isLogin) return <>{children}</>;

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
      <div className="px-5 py-5 border-b border-white/10">
        <Link href="/" className="block mb-1">
          <Image
            src="/logo-green.png.png"
            alt="Mass Distribution"
            width={130}
            height={40}
            className="h-8 w-auto"
          />
        </Link>

        <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">
          Admin Panel
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setMobileOpen(false)}
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

      <div className="px-3 py-4 border-t border-white/10 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          ← Back to store
        </Link>

        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex">
      <aside className="hidden md:flex w-56 bg-[#111111] flex-col fixed top-0 left-0 h-screen z-40 flex-shrink-0">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-56 bg-[#111111] flex flex-col">
            <SidebarContent />
          </div>

          <div
            className="flex-1 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
        </div>
      )}

      <div className="flex-1 md:ml-56 flex flex-col min-h-screen">
        <div className="md:hidden bg-[#111111] text-white flex items-center gap-3 px-4 py-3 flex-shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-gray-400 hover:text-white"
            aria-label="Open admin menu"
          >
            <Menu size={20} />
          </button>

          <Image
            src="/logo-green.png.png"
            alt="Mass Distribution"
            width={100}
            height={30}
            className="h-7 w-auto"
          />

          <span className="text-xs text-gray-500 ml-1">Admin</span>

          <button
            onClick={signOut}
            className="ml-auto text-gray-500 hover:text-red-400"
            aria-label="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}