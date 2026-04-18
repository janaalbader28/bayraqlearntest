"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Mail,
  Lock,
  User,
  Loader2,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Globe,
  Eye,
  EyeOff,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

function safeNextPath(raw: string | null): string | null {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return null;
  return raw;
}

function RegisterFormInner() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, lang, setLang, isRTL } = useLanguage();
  const nextRaw = searchParams.get("next");
  const nextPath = safeNextPath(nextRaw);
  const loginAfter = nextPath ? `/login?next=${encodeURIComponent(nextPath)}` : "/login";

  function validateForm(): string | null {
    if (formData.password.length < 8)
      return lang === "ar"
        ? "كلمة المرور يجب أن تكون 8 أحرف على الأقل."
        : "Password must be at least 8 characters.";
    if (!/[A-Z]/.test(formData.password))
      return lang === "ar"
        ? "كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل."
        : "Password must contain at least one uppercase letter.";
    if (!/[^A-Za-z0-9]/.test(formData.password))
      return lang === "ar"
        ? "كلمة المرور يجب أن تحتوي على رمز خاص واحد على الأقل."
        : "Password must contain at least one special character.";
    if (formData.password !== formData.confirmPassword)
      return lang === "ar"
        ? "كلمتا المرور غير متطابقتين."
        : "Passwords do not match.";
    return null;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) { setError(validationError); return; }
    setLoading(true);
    setError("");

    try {
      const { confirmPassword: _, ...payload } = formData;
      const res = await fetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      setSuccess(true);
      setTimeout(() => router.push(loginAfter), 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
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

        <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center overflow-y-auto p-6">
          <div className="w-full max-w-md py-10">
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
              <p className="text-sm font-medium text-slate-700">{t.auth.signUpTitle}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              {success ? (
                <div className="py-10 text-center">
                  <CheckCircle2 className="mx-auto mb-6 h-16 w-16 animate-pulse text-blue-600" />
                  <h2 className="mb-2 text-xl font-bold">{t.auth.allSet}</h2>
                  <p className="text-sm text-slate-600">{t.auth.redirecting}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      {error}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500">
                      {t.auth.usernameLabel} <span className="text-red-500">*</span>
                    </label>
                    <div className="group relative">
                      <User className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 ${isRTL ? "right-3" : "left-3"}`} />
                      <input
                        type="text"
                        required
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className={`w-full rounded-lg border border-slate-200 bg-white py-3 text-sm text-slate-900 transition-all focus:border-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-600/10 ${isRTL ? "pr-10 pl-4" : "pl-10 pr-4"}`}
                        placeholder={t.auth.usernamePlaceholder}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500">
                      {t.auth.emailLabel} <span className="text-red-500">*</span>
                    </label>
                    <div className="group relative">
                      <Mail className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 ${isRTL ? "right-3" : "left-3"}`} />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                      <Lock className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 ${isRTL ? "right-3" : "left-3"}`} />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className={`w-full rounded-lg border border-slate-200 bg-white py-3 text-sm text-slate-900 transition-all focus:border-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-600/10 ${isRTL ? "pr-10 pl-10" : "pl-10 pr-10"}`}
                        placeholder="••••••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className={`absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 ${isRTL ? "left-3" : "right-3"}`}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      {lang === "ar"
                        ? "٨ أحرف على الأقل، حرف كبير، ورمز خاص"
                        : "Min 8 chars, one uppercase, one special character"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500">
                      {lang === "ar" ? "تأكيد كلمة المرور" : "Confirm Password"}
                    </label>
                    <div className="group relative">
                      <Lock className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 ${isRTL ? "right-3" : "left-3"}`} />
                      <input
                        type={showConfirm ? "text" : "password"}
                        required
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className={`w-full rounded-lg border border-slate-200 bg-white py-3 text-sm text-slate-900 transition-all focus:border-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-600/10 ${isRTL ? "pr-10 pl-10" : "pl-10 pr-10"}`}
                        placeholder="••••••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm((v) => !v)}
                        className={`absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 ${isRTL ? "left-3" : "right-3"}`}
                      >
                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      required
                      className="h-4 w-4 rounded border-slate-300 accent-blue-600"
                    />
                    <span className="text-[10px] leading-none text-slate-600">
                      {t.auth.terms}{" "}
                      <Link href="#" className="underline hover:text-slate-900">
                        {t.auth.termsLink}
                      </Link>
                    </span>
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
                        {t.auth.signUpButton}
                        <ChevronRight className={`h-4 w-4 ${isRTL ? "rotate-180" : ""}`} />
                      </>
                    )}
                  </button>
                </form>
              )}

              {!success && (
                <div className="mt-8 border-t border-slate-200/80 pt-8 text-center">
                  <span className="text-sm font-light text-slate-500">{t.auth.haveAccount} </span>
                  <Link
                    href={nextPath ? `/login?next=${encodeURIComponent(nextPath)}` : "/login"}
                    className="text-sm font-semibold text-blue-600 hover:underline"
                  >
                    {t.auth.signIn}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </main>
      }
    >
      <RegisterFormInner />
    </Suspense>
  );
}
