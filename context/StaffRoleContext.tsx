"use client";

import { createContext, useContext } from "react";

export type StaffRole = "admin" | "sales" | "accounts";

export const STAFF_ROLES: readonly StaffRole[] = ["admin", "sales", "accounts"];

export interface StaffInfo {
  role: StaffRole;
  name: string;
  userId: string;
}

const StaffRoleContext = createContext<StaffInfo | null>(null);

export const StaffRoleProvider = StaffRoleContext.Provider;

export function useStaffRole(): StaffInfo {
  const ctx = useContext(StaffRoleContext);
  if (!ctx) throw new Error("useStaffRole must be used inside the admin layout");
  return ctx;
}

// Routes a sales user may open; everything else under /admin is admin-only.
export const SALES_ROUTES = ["/admin", "/admin/follow-ups", "/admin/sourcing", "/admin/customers", "/admin/orders", "/admin/inquiries"];
// Accounts only work with orders (marking cash/credit orders paid).
export const ACCOUNTS_ROUTES = ["/admin/orders"];

const ROLE_LABELS: Record<StaffRole, string> = { admin: "Admin", sales: "Sales", accounts: "Accounts" };

export function roleLabel(role: StaffRole) {
  return ROLE_LABELS[role];
}

/** Where each role lands after signing in (and when it opens a page it can't use). */
export function homeFor(role: StaffRole) {
  return role === "sales" ? "/admin/follow-ups" : role === "accounts" ? "/admin/orders" : "/admin";
}

export function canAccess(role: StaffRole, pathname: string) {
  if (role === "admin") return true;
  const routes = role === "accounts" ? ACCOUNTS_ROUTES : SALES_ROUTES;
  return routes.some((r) => (r === "/admin" ? pathname === "/admin" : pathname === r || pathname.startsWith(`${r}/`)));
}
