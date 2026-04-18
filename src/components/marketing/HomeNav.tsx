"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Globe, User, ChevronDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function HomeNav() {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [user, setUser] = useState<{ username: string } | null>(null);
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { lang, setLang, t, isRTL } = useLanguage();

  const sections = [
    { label: t.nav.home, hash: "#top" },
    { label: t.nav.about, hash: "#about" },
    { label: t.nav.courses, hash: "#courses" },
    { label: t.nav.contact, hash: "#contact" },
  ];

  const href = (hash: string) => (isHome ? hash : `/${hash}`);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/user/me", { credentials: "include" });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.user?.username) setUser({ username: data.user.username });
      } catch {}
    })();
  }, []);

  async function logout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      window.location.href = "/";
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-md" dir={isRTL ? "rtl" : "ltr"}>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-slate-900">
          <img src="/logo.png" alt="BayraqLearn logo" className="h-9 w-9 shrink-0 object-contain" />
          <span className="font-heading text-lg font-semibold tracking-tight">
            {t.brandPrefix}<span className="text-blue-600"> {t.brandSuffix}</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {sections.map((item) => (
            <a
              key={item.hash}
              href={href(item.hash)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:ml-3">
          <button
            type="button"
            onClick={() => setLang(lang === "en" ? "ar" : "en")}
            className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:border-blue-200 hover:bg-blue-50/80 hover:text-blue-700"
            aria-label="Toggle language"
          >
            <Globe className="h-3.5 w-3.5" />
            <span>{lang === "en" ? "EN" : "AR"}</span>
          </button>
          {user ? (
            <div
              className="relative hidden sm:block"
              onMouseEnter={() => {
                if (closeTimer.current) clearTimeout(closeTimer.current);
                setMenuOpen(true);
              }}
              onMouseLeave={() => {
                closeTimer.current = setTimeout(() => setMenuOpen(false), 150);
              }}
            >
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-2.5 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                <span className="max-w-[120px] truncate text-left">{user.username}</span>
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">
                  <User className="h-4 w-4" />
                </span>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>
              {menuOpen ? (
                <div className="absolute right-0 mt-2 w-44 rounded-xl bg-white/95 p-1.5 text-sm text-slate-700 shadow-md ring-1 ring-slate-200/70">
                  <Link href="/dashboard" className="block rounded-lg px-3 py-1.5 hover:bg-slate-50">
                    {t.nav.dashboard}
                  </Link>
                  <Link href="/dashboard/settings" className="block rounded-lg px-3 py-1.5 hover:bg-slate-50">
                    {t.nav.settings}
                  </Link>
                  <button
                    type="button"
                    onClick={logout}
                    className="mt-0.5 block w-full rounded-lg px-3 py-1.5 text-left text-red-600 hover:bg-red-50"
                  >
                    {t.nav.logout}
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-600/25 transition hover:bg-blue-700 sm:inline"
            >
              {t.nav.join}
            </Link>
          )}

          <button
            type="button"
            className="inline-flex rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-slate-100 bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {sections.map((item) => (
              <a
                key={item.hash}
                href={href(item.hash)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <div className="mt-2 border-t border-slate-100 pt-3">
              {user ? (
                <div className="space-y-1">
                  <Link href="/dashboard" className="block rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                    {t.nav.dashboard}
                  </Link>
                  <Link href="/dashboard/settings" className="block rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                    {t.nav.settings}
                  </Link>
                  <button
                    type="button"
                    onClick={logout}
                    className="block w-full rounded-lg px-3 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                  >
                    {t.nav.logout}
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="block rounded-lg bg-blue-600 px-3 py-2.5 text-center text-sm font-semibold text-white"
                  onClick={() => setOpen(false)}
                >
                  {t.nav.join}
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
