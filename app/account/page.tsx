"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function AccountPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!loading) {
      router.replace(user ? "/account/dashboard" : "/account/login");
    }
  }, [user, loading, router]);
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-[#1B4D2E] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
