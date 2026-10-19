"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

/** Sends signed-out visitors to the login page, returning them here afterwards. */
export function useRequireLogin() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading || user) return;
    const here = window.location.pathname + window.location.search;
    router.replace(`/account/login?next=${encodeURIComponent(here)}`);
  }, [user, loading, router]);

  return { user, loading };
}
