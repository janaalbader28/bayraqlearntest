"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { BookOpen, Award, TrendingUp, Clock, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

type ContinueItem = {
  courseId: number;
  title: string;
  title_ar: string | null;
  category: string;
  thumbnail: string | null;
  progress: number;
  lastLessonId: number | null;
};

type Notification = {
  id: number;
  title: string;
  message: string | null;
  created_at: string;
  is_read: boolean;
  type: string;
};

type DashStats = {
  totalEnrolled: number;
  totalCompleted: number;
  avgProgress: number;
  totalHours: number;
  continueLearning: ContinueItem[];
  notifications: Notification[];
};

function progressBarStyle(pct: number): React.CSSProperties {
  const p = Math.min(100, Math.max(0, pct));
  const t = p / 100;
  const hue = 200 - t * 95;
  const sat = 55 + t * 35;
  const lightStart = 88 - t * 38;
  const lightEnd = 82 - t * 42;
  return {
    width: `${p}%`,
    background: `linear-gradient(90deg, hsl(${hue}, ${sat}%, ${lightStart}%) 0%, hsl(145, 62%, ${lightEnd}%) 100%)`,
    boxShadow: p > 0 ? "0 0 12px rgba(16, 185, 129, 0.25)" : undefined,
  };
}

function timeAgo(iso: string, lang: string): string {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(mins / 60);
    const days = Math.floor(hrs / 24);
    if (lang === "ar") {
      if (days > 0) return `منذ ${days} ${days === 1 ? "يوم" : "أيام"}`;
      if (hrs > 0) return `منذ ${hrs} ${hrs === 1 ? "ساعة" : "ساعات"}`;
      return `منذ ${mins} ${mins === 1 ? "دقيقة" : "دقائق"}`;
    }
    if (days > 0) return `${days}d ago`;
    if (hrs > 0) return `${hrs}h ago`;
    return `${mins}m ago`;
  } catch { return ""; }
}

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const { t, lang, isRTL } = useLanguage();
  const [lastActive, setLastActive] = useState<string | null>(null);
  const [streak, setStreak] = useState(1);
  const [stats, setStats] = useState<DashStats | null>(null);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const ping = await fetch("/api/user/ping", { method: "POST" });
        const pingData = await ping.json().catch(() => ({}));
        if (ping.ok && pingData.last_activity && !ignore) {
          setLastActive(pingData.last_activity);
        }
      } catch {}
    })();
    return () => { ignore = true; };
  }, []);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const res = await fetch("/api/dashboard/stats");
        if (res.ok && !ignore) {
          setStats(await res.json());
        }
      } catch {}
    })();
    return () => { ignore = true; };
  }, []);

  useEffect(() => {
    const key = `streak:${user?.id ?? "guest"}`;
    const today = new Date().toISOString().slice(0, 10);
    const raw = localStorage.getItem(key);
    const state = raw ? (JSON.parse(raw) as { lastDate: string; count: number }) : null;

    let nextCount = 1;
    if (state?.lastDate) {
      const prev = new Date(`${state.lastDate}T00:00:00Z`);
      const now = new Date(`${today}T00:00:00Z`);
      const diffDays = Math.floor((now.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 0) nextCount = state.count;
      else if (diffDays === 1) nextCount = state.count + 1;
      else nextCount = 1;
    }
    localStorage.setItem(key, JSON.stringify({ lastDate: today, count: nextCount }));
    setStreak(nextCount);
  }, [user?.id]);

  function formatLastActive(iso: string | null): string {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US", { dateStyle: "medium" });
    } catch { return "—"; }
  }

  const dp = t.dashboardPage;

  const quickStats = [
    { label: dp.statEnrolled, val: stats ? String(stats.totalEnrolled) : "—", icon: BookOpen, color: "text-blue-600" },
    { label: dp.statCompleted, val: stats ? String(stats.totalCompleted) : "—", icon: Award, color: "text-emerald-600" },
    { label: dp.statProgress, val: stats ? `${stats.avgProgress}%` : "—", icon: TrendingUp, color: "text-amber-600" },
    { label: dp.statHours, val: stats ? `${stats.totalHours}h` : "—", icon: Clock, color: "text-indigo-600" },
  ];

  const continueLearning = stats?.continueLearning ?? [];
  const notifications = stats?.notifications ?? [];

  return (
    <div className="mx-auto max-w-7xl" dir={isRTL ? "rtl" : "ltr"}>
      {/* Welcome banner */}
      <div className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-br from-blue-600/10 via-indigo-50/70 to-white px-6 py-8 sm:px-10 sm:py-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 max-w-2xl">
              <h1 className="font-heading text-3xl font-bold md:text-4xl">
                {dp.welcomePrefix}{" "}
                <span className="text-blue-700">{user?.username || "Student"}</span>
              </h1>
              <p className="mt-3 leading-relaxed text-slate-600">{dp.subtitle}</p>
            </div>
            <div className={`shrink-0 text-xs text-slate-500 lg:pt-1 ${isRTL ? "text-left" : "text-right"}`}>
              <p>
                <span className="font-medium text-slate-600">{dp.lastActive}</span>{" "}
                <span className="tabular-nums text-slate-500">{formatLastActive(lastActive)}</span>
              </p>
              <p className="mt-1 inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                🔥 {streak} {dp.dayStreak}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-100 hover:shadow-md"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-blue-200/60 bg-blue-600/10">
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div className="font-heading text-2xl font-bold">{stat.val}</div>
            <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Continue learning + notifications */}
      <div className="grid items-start gap-8 lg:grid-cols-3">
        <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm lg:col-span-2">
          <h2 className="text-xl font-bold text-slate-900">{dp.continueTitle}</h2>
          <div className="mt-6 space-y-4">
            {continueLearning.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center">
                <BookOpen className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                <p className="text-sm font-medium text-slate-600">
                  {lang === "ar" ? "لم تبدأ أي دورة بعد." : "No courses in progress yet."}
                </p>
                <Link href="/courses" className="mt-3 inline-flex text-sm font-semibold text-blue-600 hover:underline">
                  {lang === "ar" ? "تصفح الدورات" : "Browse courses"}
                </Link>
              </div>
            ) : (
              continueLearning.map((item) => {
                const displayTitle = lang === "ar" && item.title_ar ? item.title_ar : item.title;
                const learnHref = item.lastLessonId
                  ? `/dashboard/courses/${item.courseId}/learn/${item.lastLessonId}`
                  : `/dashboard/courses/${item.courseId}`;
                return (
                  <div
                    key={item.courseId}
                    className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/60 p-6 shadow-sm ring-1 ring-blue-100/80 transition hover:shadow-md"
                  >
                    <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/80 bg-white/90 text-lg font-bold text-blue-800 shadow-sm">
                        {item.thumbnail ? (
                          <img src={item.thumbnail} alt={displayTitle} className="h-full w-full object-cover" />
                        ) : (
                          <span>{item.progress}%</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="inline-block rounded-full border border-blue-200 bg-blue-600/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-blue-800">
                          {item.category}
                        </span>
                        <h3 className="mt-2 text-lg font-bold text-slate-900">{displayTitle}</h3>
                        <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-white/80 ring-1 ring-slate-200/90">
                          <div className="h-full rounded-full transition-all duration-700" style={progressBarStyle(item.progress)} />
                        </div>
                        <p className="mt-1 text-xs text-slate-500">{item.progress}%</p>
                      </div>
                      <Link
                        href={learnHref}
                        className="inline-flex shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-600 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 active:scale-[0.98]"
                      >
                        <ChevronRight className={`h-5 w-5 ${isRTL ? "rotate-180" : ""}`} />
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <aside className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">{dp.updatesTitle}</h2>
          <div className="mt-6 space-y-4">
            {notifications.length === 0 ? (
              <p className="text-sm text-slate-500">
                {lang === "ar" ? "لا توجد إشعارات." : "No notifications yet."}
              </p>
            ) : (
              notifications.slice(0, 5).map((n) => (
                <div key={n.id} className="flex gap-4">
                  <div className="mt-1.5 h-8 w-1 shrink-0 rounded-full bg-gradient-to-b from-blue-500 to-blue-300" />
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      {timeAgo(n.created_at, lang)}
                    </div>
                    <div className="mt-1 text-sm font-medium leading-snug text-slate-800">{n.title}</div>
                    {n.message && (
                      <div className="mt-0.5 text-xs leading-snug text-slate-600">{n.message}</div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
