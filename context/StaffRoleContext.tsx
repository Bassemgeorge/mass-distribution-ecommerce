"use client";

import { createContext, useContext } from "react";

export type StaffRole = "admin" | "sales";

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
export const SALES_ROUTES = ["/admin", "/admin/follow-ups", "/admin/customers", "/admin/orders", "/admin/inquiries"];

export function canAccess(role: StaffRole, pathname: string) {
  if (role === "admin") return true;
  return SALES_ROUTES.some((r) => (r === "/admin" ? pathname === "/admin" : pathname === r || pathname.startsWith(`${r}/`)));
}
