"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Brain,
  Cloud,
  Code2,
  ShieldCheck,
  Smartphone,
  Network,
  Search,
  Clock,
  Star,
  BadgeCheck,
  X,
  BarChart3,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { levelBadgeClass } from "@/lib/course-level";
import { CourseApplyStatus } from "@/components/course/CourseApplyStatus";
import { useLanguage } from "@/contexts/LanguageContext";

type CourseListItem = {
  id: number;
  title: string;
  title_ar: string | null;
  short_description: string | null;
  short_description_ar: string | null;
  description: string | null;
  instructor_name: string;
  category: string;
  level: string;
  price: number;
  duration_hours: number;
  rating: number;
  rating_count: number;
  enrollment_count: number;
  thumbnail: string | null;
  status: string;
  first_lesson_id: number | null;
};

type CoursesResponse = {
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
  items: CourseListItem[];
};

type CoursesBrowserVariant = "public" | "dashboard";

const SAMPLE_COURSE: CourseListItem = {
  id: 9999,
  title: "Sample Course",
  title_ar: "دورة تجريبية",
  short_description: "Demo course for testing learning flow",
  short_description_ar: "دورة تجريبية لاختبار مسار التعلم",
  description: "Demo course for testing learning flow",
  instructor_name: "Demo Instructor",
  category: "Programming",
  level: "beginner",
  price: 0,
  duration_hours: 5,
  rating: 4.5,
  rating_count: 10,
  enrollment_count: 100,
  thumbnail: null,
  status: "published",
  first_lesson_id: null,
};

function coursePriceLabel(price: number, freeLabel: string): string {
  if (!Number.isFinite(price) || price <= 0) return freeLabel;
  return `${price.toLocaleString()} SAR`;
}

function safeThumb(url: string | null): string | null {
  const raw = (url ?? "").trim();
  if (!raw) return null;
  if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("/")) return raw;
  return null;
}

export function CoursesBrowser({ variant = "public" }: { variant?: CoursesBrowserVariant }) {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const { t, lang, isRTL } = useLanguage();

  // Category tabs built from translations
  const CATEGORY_TABS: Array<{ key: string; label: string; icon: LucideIcon }> = [
    { key: "All", label: t.courses.catAll, icon: BookOpen },
    { key: "Mobile Development", label: t.courses.catMobile, icon: Smartphone },
    { key: "Cloud", label: t.courses.catCloud, icon: Cloud },
    { key: "AI", label: t.courses.catAI, icon: Brain },
    { key: "Programming", label: t.courses.catProgramming, icon: Code2 },
    { key: "Data Science", label: t.courses.catDataScience, icon: BarChart3 },
    { key: "Cybersecurity", label: t.courses.catCybersecurity, icon: ShieldCheck },
    { key: "Networks", label: t.courses.catNetworks, icon: Network },
  ];

  const DURATION_OPTIONS = [
    { value: "", label: t.courses.anyDuration },
    { value: "0-5", label: t.courses.dur0to5 },
    { value: "6-10", label: t.courses.dur6to10 },
    { value: "11-20", label: t.courses.dur11to20 },
    { value: "20+", label: t.courses.dur20plus },
  ];

  const LEVEL_OPTIONS = [
    { value: "", label: t.courses.allLevels },
    { value: "beginner", label: t.courses.levelBeginner },
    { value: "intermediate", label: t.courses.levelIntermediate },
    { value: "advanced", label: t.courses.levelAdvanced },
  ];

  const levelLabel = (level: string) => {
    switch (level.toLowerCase()) {
      case "beginner": return t.courses.levelBeginner;
      case "intermediate": return t.courses.levelIntermediate;
      case "advanced": return t.courses.levelAdvanced;
      default: return level.charAt(0).toUpperCase() + level.slice(1);
    }
  };

  const categoryLabel = (cat: string) => {
    const c = cat.toLowerCase();
    if (c.includes("mobile")) return t.courses.catMobile;
    if (c.includes("cloud")) return t.courses.catCloud;
    if (c === "ai" || c.includes("artificial")) return t.courses.catAI;
    if (c.includes("program")) return t.courses.catProgramming;
    if (c.includes("data")) return t.courses.catDataScience;
    if (c.includes("cyber")) return t.courses.catCybersecurity;
    if (c.includes("network")) return t.courses.catNetworks;
    return cat;
  };

  const [enrolledIds, setEnrolledIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!user) return;
    fetch("/api/user/enrolled-ids")
      .then((r) => r.ok ? r.json() : { ids: [] })
      .then((data: { ids: number[] }) => setEnrolledIds(new Set(data.ids)))
      .catch(() => null);
  }, [user]);

  const [activeCategory, setActiveCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [duration, setDuration] = useState("");
  const [level, setLevel] = useState("");

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [items, setItems] = useState<CourseListItem[]>([]);

  const requestKey = useMemo(
    () => JSON.stringify({ activeCategory, query, duration, level }),
    [activeCategory, query, duration, level]
  );

  useEffect(() => {
    setPage(1);
  }, [requestKey]);

  useEffect(() => {
    let ignore = false;

    async function run() {
      setLoading(true);
      setError(null);
      try {
        if (variant === "dashboard") {
          const res = await fetch("/api/dashboard/courses");
          if (res.status === 401) {
            // Not logged in — middleware should have caught this, but handle gracefully
            if (ignore) return;
            setItems([]);
            setHasMore(false);
            return;
          }
          if (!res.ok) throw new Error("Failed to load enrolled courses");
          const data = (await res.json()) as CoursesResponse;
          const apiItems = data.items || [];
          if (ignore) return;
          setHasMore(false);
          setItems(apiItems);
          return;
        }

        const sp = new URLSearchParams();
        if (query.trim()) sp.set("q", query.trim());
        if (activeCategory && activeCategory !== "All") sp.set("category", activeCategory);
        if (duration) sp.set("duration", duration);
        if (level) sp.set("level", level);
        sp.set("page", String(page));
        sp.set("pageSize", "9");

        const res = await fetch(`/api/courses?${sp.toString()}`);
        const data = (await res.json()) as CoursesResponse & { error?: string };
        if (!res.ok) throw new Error(data.error || "Failed to load courses");

        if (ignore) return;
        setHasMore(Boolean(data.hasMore));
        setItems((prev) => (page === 1 ? data.items : [...prev, ...data.items]));
      } catch (e) {
        if (ignore) return;
        setError(e instanceof Error ? e.message : "Failed to load courses");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    run();
    return () => {
      ignore = true;
    };
  }, [requestKey, page, activeCategory, query, duration, level, variant]);

  const onClearSearch = () => setQuery("");

  return (
    <section className="mt-10" dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <BadgeCheck className="h-4 w-4 shrink-0 text-blue-600" />
            {t.courses.browseFree}
          </div>
          <div className="hidden sm:block text-sm text-slate-500">
            {items.length} {t.courses.shown}
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {CATEGORY_TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeCategory === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveCategory(tab.key)}
                className={[
                  "group inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition",
                  active
                    ? "border-blue-200 bg-blue-600 text-white shadow-sm"
                    : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50",
                ].join(" ")}
              >
                <Icon
                  className={[
                    "h-4 w-4 transition",
                    active ? "text-white" : "text-slate-500 group-hover:text-blue-700",
                  ].join(" ")}
                />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search + filters */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="grid gap-3 md:grid-cols-12 md:items-center">
            <div className="md:col-span-6">
              <div className="group relative">
                <Search className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-600 ${isRTL ? "right-3" : "left-3"}`} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t.courses.searchPlaceholder}
                  className={`w-full rounded-xl border border-slate-200 bg-slate-50 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-200 focus:bg-white focus:ring-4 focus:ring-blue-600/10 ${isRTL ? "pr-10 pl-10" : "pl-10 pr-10"}`}
                />
                {query.trim() ? (
                  <button
                    type="button"
                    onClick={onClearSearch}
                    className={`absolute top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 ${isRTL ? "left-3" : "right-3"}`}
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
            </div>

            <div className="md:col-span-3">
              <label className="sr-only">Duration</label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-200 focus:bg-white focus:ring-4 focus:ring-blue-600/10"
              >
                {DURATION_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3">
              <label className="sr-only">Level</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-200 focus:bg-white focus:ring-4 focus:ring-blue-600/10"
              >
                {LEVEL_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {items.length === 0 && !loading ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center text-slate-500"
              >
                <BookOpen className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                <p className="font-medium text-slate-700">{t.courses.noMatches}</p>
                <p className="mt-1 text-sm">{t.courses.noMatchesHint}</p>
              </motion.div>
            ) : (
              items.map((course) => {
                const thumb = safeThumb(course.thumbnail);
                const isFree = course.price <= 0;
                const priceLabel = coursePriceLabel(course.price, t.courses.free);

                // Bilingual display
                const displayTitle =
                  lang === "ar" && course.title_ar ? course.title_ar : course.title;
                const displayDesc =
                  lang === "ar" && course.short_description_ar
                    ? course.short_description_ar
                    : course.short_description || course.description || t.courses.defaultDesc;

                const isEnrolled = enrolledIds.has(course.id);
                const nextPath = isFree
                  ? `/dashboard/courses/${course.id}`
                  : `/dashboard/courses/${course.id}/checkout`;
                const isSample = course.id === 9999;
                const dashboardOpenHref = isSample ? `/courses` : `/dashboard/courses/${course.id}`;
                // Enrolled users go to dashboard; others get enroll/buy flow
                const ctaHref =
                  variant === "dashboard"
                    ? dashboardOpenHref
                    : isAdmin
                      ? `/courses/${course.id}`
                      : isEnrolled
                        ? `/dashboard/courses/${course.id}`
                        : user
                          ? nextPath
                          : `/login?next=${encodeURIComponent(`/courses/${course.id}`)}`;

                return (
                  <motion.article
                    key={course.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.25 }}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition hover:border-blue-100 hover:shadow-md"
                  >
                    <div className="relative h-44 overflow-hidden border-b border-slate-100 bg-gradient-to-br from-blue-600/10 via-indigo-50/80 to-slate-50">
                      {thumb ? (
                        <img
                          src={thumb}
                          alt={displayTitle}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : null}
                      <div className={`absolute top-4 flex flex-wrap items-center gap-2 ${isRTL ? "right-4" : "left-4"}`}>
                        <span className="rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-medium text-blue-800 shadow-sm ring-1 ring-blue-100">
                          {categoryLabel(course.category)}
                        </span>
                        <span
                          className={[
                            "rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm",
                            levelBadgeClass(course.level),
                          ].join(" ")}
                        >
                          {levelLabel(course.level)}
                        </span>
                      </div>
                    </div>

                    <div className={`flex flex-1 flex-col px-6 pb-6 pt-5 ${isRTL ? "text-right" : "text-left"}`}>
                      <h3 className="font-heading text-xl font-bold leading-snug text-slate-900">
                        {displayTitle}
                      </h3>
                      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">
                        {displayDesc}
                      </p>

                      <div className="mt-3">
                        <CourseApplyStatus status={course.status} />
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {course.duration_hours}{t.courses.hours}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 text-amber-500" />
                          {Number(course.rating || 0).toFixed(1)}
                        </span>
                        <span className="font-semibold text-slate-800">{priceLabel}</span>
                      </div>

                      <div className="mt-5 grid gap-2">
                        {variant === "dashboard" ? (
                          <Link
                            href={ctaHref}
                            className="inline-flex w-full items-center justify-center rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                          >
                            {t.courses.openCourse}
                          </Link>
                        ) : (
                          <>
                            <Link
                              href={`/courses/${course.id}`}
                              className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-800 transition hover:border-blue-200 hover:bg-blue-50"
                            >
                              {t.courses.viewDetails}
                            </Link>
                            {!isAdmin && (
                              <Link
                                href={ctaHref}
                                className="inline-flex w-full items-center justify-center rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                              >
                                {isEnrolled
                                  ? (t.courseDetail.continueLearning ?? "Continue learning")
                                  : isFree
                                    ? t.courses.startCourse
                                    : t.courses.buyCourse}
                              </Link>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </motion.article>
                );
              })
            )}
          </AnimatePresence>
        </div>

        <div className="mt-10 flex items-center justify-center">
          {hasMore ? (
            <button
              type="button"
              onClick={() => setPage((p) => p + 1)}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? t.courses.loading : t.courses.loadMore}
            </button>
          ) : (
            <p className="text-sm text-slate-500">
              {t.courses.endOfList}{" "}
              <Link href="/courses" className="text-blue-600 hover:underline">
                {t.courses.checkMore}
              </Link>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
