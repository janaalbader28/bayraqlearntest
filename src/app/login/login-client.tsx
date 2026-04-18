"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Loader2, ChevronRight, AlertCircle, Globe } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { isAdminRole } from "@/lib/admin";
import { useLanguage } from "@/contexts/LanguageContext";

function safeNextPath(raw: string | null): string | null {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return null;
  return raw;
}

function LoginFormInner() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAuthStore((state) => state.setUser);
  const { t, lang, setLang, isRTL } = useLanguage();
  const nextRaw = searchParams.get("next");
  const nextPath = safeNextPath(nextRaw);
  const afterLogin = nextPath ?? "/dashboard";
  const registerHref = nextPath
    ? `/register?next=${encodeURIComponent(nextPath)}`
    : "/register";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      setUser(data.user);
      const admin = isAdminRole(data.user?.role);
      const dest =
        admin && (!nextPath || !nextPath.startsWith("/dashboard/admin"))
          ? "/dashboard/admin"
          : afterLogin;
      router.push(dest);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900" dir={isRTL ? "rtl" : "ltr"}>
      <div className="mesh-gradient">
        {/* Language toggle */}
        <div className="absolute right-4 top-4">
          <button
            type="button"
            onClick={() => setLang(lang === "en" ? "ar" : "en")}
            className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition hover:border-blue-200 hover:text-blue-700"
          >
            <Globe className="h-3.5 w-3.5" />
            {lang === "en" ? "EN" : "AR"}
          </button>
        </div>

        <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center p-6">
          <div className="w-full max-w-md">
            <div className="mb-10 text-center">
              <Link href="/" className="group mb-6 inline-flex flex-col items-center gap-3">
                <img
                  src="/logo.png"
                  alt="BayraqLearn"
                  className="h-16 w-16 object-contain transition-transform group-hover:scale-105"
                />
                <span className="font-heading text-2xl font-bold tracking-tight">
                  {t.brandPrefix}<span className="text-blue-600"> {t.brandSuffix}</span>
                </span>
              </Link>
              <p className="mt-1 text-sm text-slate-600">{t.auth.signInTitle}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <form onSubmit={handleSubmit} className="group space-y-6">
                {error && (
                  <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-500">
                    {t.auth.emailLabel} <span className="text-red-500">*</span>
                  </label>
                  <div className="group relative">
                    <Mail className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-600 ${isRTL ? "right-3" : "left-3"}`} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full rounded-lg border border-slate-200 bg-white py-3 text-sm text-slate-900 transition-all focus:border-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-600/10 ${isRTL ? "pr-10 pl-4" : "pl-10 pr-4"}`}
                      placeholder={t.auth.emailPlaceholder}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-500">
                    {t.auth.passwordLabel} <span className="text-red-500">*</span>
                  </label>
                  <div className="group relative">
                    <Lock className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-600 ${isRTL ? "right-3" : "left-3"}`} />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full rounded-lg border border-slate-200 bg-white py-3 text-sm text-slate-900 transition-all focus:border-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-600/10 ${isRTL ? "pr-10 pl-4" : "pl-10 pr-4"}`}
                      placeholder="••••••••••••"
                    />
                  </div>
                  <div className="pt-0.5">
                    <Link href="#" className="text-xs text-blue-600 underline-offset-2 hover:underline">
                      {t.auth.forgotPassword}
                    </Link>
                  </div>
                </div>

                <button
                  disabled={loading}
                  type="submit"
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      {t.auth.signInButton}
                      <ChevronRight className={`h-4 w-4 ${isRTL ? "rotate-180" : ""}`} />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 border-t border-slate-200/80 pt-8 text-center">
                <span className="text-sm font-light text-slate-500">{t.auth.newHere} </span>
                <Link href={registerHref} className="text-sm font-semibold text-blue-600 hover:underline">
                  {t.auth.createAccount}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export function LoginClient() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </main>
      }
    >
      <LoginFormInner />
    </Suspense>
  );
}
