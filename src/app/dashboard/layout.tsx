"use client";

import { usePathname } from "next/navigation";
import { AdminChrome } from "@/components/dashboard/AdminChrome";
import { StudentChrome } from "@/components/dashboard/StudentChrome";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/dashboard/admin")) {
    return <AdminChrome>{children}</AdminChrome>;
  }
  // Standalone pages inside /dashboard (no sidebar/header chrome)
  if (pathname.includes("/checkout")) {
    return <>{children}</>;
  }
  return <StudentChrome>{children}</StudentChrome>;
}
