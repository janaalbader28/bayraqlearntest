"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  ScrollText,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  User as UserIcon,
  Globe,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { NotificationDropdown } from "@/components/dashboard/NotificationDropdown";
import { useLanguage } from "@/contexts/LanguageContext";

export function AdminChrome({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const logoutStore = useAuthStore((s) => s.logout);
  const router = useRouter();
  const { t, lang, setLang } = useLanguage();

  const navItems = [
    { icon: LayoutDashboard, label: t.dashboard.dashboard, href: "/dashboard/admin" },
    { icon: BookOpen, label: t.dashboard.courses, href: "/dashboard/admin/courses" },
    { icon: Users, label: t.dashboard.users, href: "/dashboard/admin/users" },
    { icon: ScrollText, label: t.dashboard.logs, href: "/dashboard/admin/logs" },
    { icon: Settings, label: t.dashboard.settings, href: "/dashboard/admin/settings" },
  ] as const;

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    logoutStore();
    router.push("/");
  };

  const w = open ? "w-64" : "w-20";
  const ml = open ? "md:ml-64" : "md:ml-20";

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
        className={`fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-slate-200 bg-white transition-all duration-300 md:z-40 ${w} ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex items-center gap-3 p-6">
          <img src="/logo.png" alt="BayraqLearn" className="h-8 w-8 shrink-0 object-contain" />
          {open && (
            <span className="font-heading font-semibold tracking-tight">
              Admin<span className="text-blue-600">Panel</span>
            </span>
          )}
        </div>
        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 pb-4">
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard/admin"
                ? pathname === "/dashboard/admin"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={[
                  "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition",
                  isActive
                    ? "border border-blue-200 bg-blue-600/10 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                ].join(" ")}
              >
                <Icon className={`h-5 w-5 shrink-0 ${isActive ? "text-blue-700" : ""}`} />
                {open && item.label}
              </Link>
            );
          })}
        </nav>
        <div className="space-y-1 border-t border-slate-200 p-3">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <Home className="h-5 w-5 shrink-0" />
            {open && <span className="text-sm font-medium">{t.dashboard.home}</span>}
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-slate-500 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {open && <span className="text-sm font-medium">{t.dashboard.logout}</span>}
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
              onClick={() => setOpen((o) => !o)}
              className="hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:inline-flex"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <span className="text-sm font-medium text-slate-500 md:hidden">{t.dashboard.admin}</span>
          </div>
          <div className="flex flex-1 items-center justify-end gap-3">
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
            <div className="hidden items-center gap-3 border-l border-slate-200 pl-3 sm:flex">
              <div className="text-right text-sm">
                <div className="font-semibold text-slate-900">{user?.username}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-blue-600">{user?.role}</div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white">
                <UserIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
