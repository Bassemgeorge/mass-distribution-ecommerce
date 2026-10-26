"use client";

import { useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
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
  PhoneCall,
  PackageSearch,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { STAFF_ROLES, StaffInfo, StaffRole, StaffRoleProvider, canAccess, homeFor, roleLabel } from "@/context/StaffRoleContext";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/follow-ups", label: "Follow-ups", icon: PhoneCall },
  { href: "/admin/sourcing", label: "Sourcing Desk", icon: PackageSearch },
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
  const [staff, setStaff] = useState<StaffInfo | null>(null);
  const [checkFailed, setCheckFailed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  // user id whose staff role is resolved (or being resolved); undefined = nothing checked yet
  const checkedUserId = useRef<string | null | undefined>(undefined);

  const isLogin = pathname === "/admin/login";

  useEffect(() => {
    if (isLogin) {
      setAuthed(true);
      return;
    }

    let cancelled = false;

    // Resolves panel access once per user. Token refreshes keep the same user, so they don't re-check.
    async function resolveAccess(user: User | null) {
      const uid = user?.id ?? null;
      if (checkedUserId.current === uid) return;
      checkedUserId.current = uid;

      if (!user) {
        setStaff(null);
        setAuthed(false);
        router.replace("/admin/login");
        return;
      }

      // A transient error (e.g. mid token refresh) is not "no role": retry before deciding
      let role: unknown = null;
      let error: unknown = null;
      for (let attempt = 0; attempt < 3; attempt++) {
        ({ data: role, error } = await supabase.rpc("my_staff_role"));
        if (!error) break;
        await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
      }
      if (cancelled || checkedUserId.current !== uid) return;

      if (error) {
        checkedUserId.current = undefined; // allow a manual retry
        setCheckFailed(true);
        return;
      }

      if (!STAFF_ROLES.includes(role as StaffRole)) {
        // Not staff. Don't sign out: the session is shared across tabs and may be a customer's
        // (e.g. a password reset in another tab). Just leave the admin area.
        setStaff(null);
        setAuthed(false);
        router.replace("/admin/login?denied=1");
        return;
      }

      const { data: staffRow } = await supabase.from("staff_roles").select("name").eq("user_id", uid).maybeSingle();
      if (cancelled || checkedUserId.current !== uid) return;

      setCheckFailed(false);
      const staffRole = role as StaffRole;
      setStaff({ role: staffRole, userId: user.id, name: staffRow?.name || user.email || roleLabel(staffRole) });
      setAuthed(true);
    }

    supabase.auth.getSession().then(({ data }) => {
      if (!cancelled) resolveAccess(data.session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "INITIAL_SESSION") return; // handled by getSession() above
      // Calling Supabase from inside the auth callback can deadlock the client; defer it
      window.setTimeout(() => {
        if (!cancelled) resolveAccess(session?.user ?? null);
      }, 0);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [isLogin, router]);

  const blocked = !isLogin && staff !== null && !canAccess(staff.role, pathname);

  // Sales/accounts users opening a page they can't use by URL land on their own start page instead
  const staffRole = staff?.role ?? null;
  useEffect(() => {
    if (blocked && staffRole) router.replace(homeFor(staffRole));
  }, [blocked, staffRole, router]);

  async function signOut() {
    await supabase.auth.signOut();
    checkedUserId.current = undefined;
    setStaff(null);
    setAuthed(null);
    router.push("/admin/login");
  }

  if (isLogin) return <>{children}</>;

  if (checkFailed) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center px-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center max-w-sm">
          <p className="text-sm text-gray-600 mb-4">We couldn&apos;t verify your access. Please check your connection and try again.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#1B4D2E] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#163d24]"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (authed === null || (authed && (!staff || blocked))) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#1B4D2E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!authed || !staff) return null;

  const nav = NAV.filter(({ href }) => canAccess(staff.role, href));

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
        {nav.map(({ href, label, icon: Icon }) => (
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
        <div className="px-3 pb-2 flex items-center gap-2 min-w-0">
          <span className="text-sm text-gray-200 font-medium truncate" dir="auto" title={staff.name}>
            {staff.name}
          </span>
          <span
            className={`ml-auto flex-shrink-0 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${
              staff.role === "admin"
                ? "bg-[#3AE18B]/15 text-[#3AE18B]"
                : staff.role === "accounts"
                  ? "bg-amber-400/15 text-amber-300"
                  : "bg-sky-400/15 text-sky-300"
            }`}
          >
            {roleLabel(staff.role)}
          </span>
        </div>
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

        <main className="flex-1 p-6">
          <StaffRoleProvider value={staff}>{children}</StaffRoleProvider>
        </main>
      </div>
    </div>
  );
}