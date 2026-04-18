"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Award,
  Settings,
  LogOut,
  Menu,
  X,
  User as UserIcon,
  Home,
  Globe,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { NotificationDropdown } from "@/components/dashboard/NotificationDropdown";
import { useLanguage } from "@/contexts/LanguageContext";

export function StudentChrome({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const logoutStore = useAuthStore((state) => state.logout);
  const router = useRouter();
  const { t, lang, setLang } = useLanguage();

  const navItems = [
    { icon: LayoutDashboard, label: t.dashboard.overview, href: "/dashboard" },
    { icon: BookOpen, label: t.dashboard.myCourses, href: "/dashboard/courses" },
    { icon: Award, label: t.dashboard.certificates, href: "/dashboard/certificates" },
    { icon: Settings, label: t.dashboard.settings, href: "/dashboard/settings" },
  ];

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    logoutStore();
    router.push("/");
  };

  const w = isSidebarOpen ? "w-64" : "w-20";
  const ml = isSidebarOpen ? "md:ml-64" : "md:ml-20";

  useEffect(() => {
    fetch("/api/user/ping", { method: "POST" }).catch(() => null);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-900/40 md:hidden"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-slate-200 bg-white/95 backdrop-blur transition-all duration-300 md:z-40 ${w} ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex items-center gap-3 p-6">
          <img src="/logo.png" alt="BayraqLearn" className="h-8 w-8 shrink-0 object-contain" />
          {isSidebarOpen && (
            <span className="font-heading font-semibold tracking-tight">
              {t.brandPrefix}<span className="text-blue-600"> {t.brandSuffix}</span>
            </span>
          )}
        </div>

        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 pb-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-all group ${
                pathname === item.href
                  ? "border border-blue-200 bg-blue-600/10 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <item.icon
                className={`h-5 w-5 shrink-0 ${pathname === item.href ? "text-blue-700" : "group-hover:text-slate-900"}`}
              />
              {isSidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="space-y-1 border-t border-slate-200 p-3">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <Home className="h-5 w-5 shrink-0" />
            {isSidebarOpen && <span className="text-sm font-medium">{t.dashboard.home}</span>}
          </Link>
          <Link
            href="/courses"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <BookOpen className="h-5 w-5 shrink-0" />
            {isSidebarOpen && <span className="text-sm font-medium">{t.dashboard.courses}</span>}
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-slate-500 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {isSidebarOpen && <span className="text-sm font-medium">{t.dashboard.logout}</span>}
          </button>
        </div>
      </aside>

      <div className={`flex min-h-screen flex-col transition-[margin] duration-300 ${ml}`}>
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-8">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="inline-flex rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:inline-flex"
            >
              {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <span className="text-sm font-medium text-slate-500 md:hidden">{t.dashboard.dashboard}</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Language toggle */}
            <button
              type="button"
              onClick={() => setLang(lang === "en" ? "ar" : "en")}
              className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              aria-label="Toggle language"
            >
              <Globe className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{lang === "en" ? "EN" : "AR"}</span>
            </button>
            <NotificationDropdown />
            <div className="flex items-center gap-3 border-l border-slate-200 pl-3">
              <div className="hidden text-right sm:block">
                <div className="text-sm font-bold text-slate-900">{user?.username || "Student"}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-blue-600 opacity-70">
                  {user?.role || "student"}
                </div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white">
                <UserIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">{children}</main>
      </div>
    </div>
  );
}
