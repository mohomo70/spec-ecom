"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, isAdmin, isLoading as authIsLoading } from "@/lib/auth";
import AdminNav from "@/components/admin/AdminNav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (authIsLoading()) {
        return;
      }

      const user = getCurrentUser();
      const admin = isAdmin();

      if (!user || !admin) {
        router.push("/login");
      }
    };

    checkAdminAccess();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}

