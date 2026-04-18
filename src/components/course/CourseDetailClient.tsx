"use client";

import Link from "next/link";
import { Clock, Star, Users, ArrowLeft } from "lucide-react";
import { levelBadgeClass, formatLevelLabel } from "@/lib/course-level";
import { useAuthStore } from "@/store/authStore";
import { CourseApplyStatus } from "@/components/course/CourseApplyStatus";
import { useLanguage } from "@/contexts/LanguageContext";

type CourseDetailProps = {
  id: number;
  title: string;
  title_ar: string | null;
  short_description: string | null;
  description: string | null;
  category: string;
  level: string | null;
  status: string;
  duration_hours: number;
  rating: number;
  enrollment_count: number;
  price: number;
  thumbnail: string | null;
  isFree: boolean;
  isLoggedIn: boolean;
  isEnrolled: boolean;
  loginHref: string;
  actionHref: string;
  continueLearningHref: string;
};

function buildRequirements(
  level: string,
  category: string,
  cd: ReturnType<typeof useLanguage>["t"]["courseDetail"]
): string[] {
  const lvl = (level || "").toLowerCase();
  const cat = (category || "").toLowerCase();

  const base = [cd.reqLaptop, cd.reqMotivation];
  const byLevel =
    lvl === "advanced"
      ? [cd.reqAdvanced1, cd.reqAdvanced2]
      : lvl === "intermediate"
        ? [cd.reqIntermediate1, cd.reqIntermediate2]
        : [cd.reqBeginner];

  const byCategory = (() => {
    if (cat.includes("cloud")) return [cd.reqCloud1, cd.reqCloud2];
    if (cat.includes("ai")) return [cd.reqAI1, cd.reqAI2];
    if (cat.includes("network")) return [cd.reqNetwork];
    if (cat.includes("cyber")) return [cd.reqCyber];
    if (cat.includes("mobile")) return [cd.reqMobile];
    if (cat.includes("program")) return [cd.reqProgramming];
    if (cat.includes("data")) return [cd.reqData];
    return [];
  })();

  return [...base, ...byLevel, ...byCategory];
}

function buildGoals(
  title: string,
  category: string,
  cd: ReturnType<typeof useLanguage>["t"]["courseDetail"]
): string[] {
  const cat = (category || "").toLowerCase();
  const focus = cat.includes("cloud")
    ? cd.focusCloud
    : cat.includes("ai")
      ? cd.focusAI
      : cat.includes("network")
        ? cd.focusNetwork
        : cat.includes("cyber")
          ? cd.focusCyber
          : cat.includes("mobile")
            ? cd.focusMobile
            : cd.focusDefault;

  return [
    `${cd.goalUnderstandPrefix} ${title}.`,
    `${cd.goalPracticePrefix} ${focus}.`,
    cd.goalRoadmap,
  ];
}

export function CourseDetailClient({
  title,
  title_ar,
  short_description,
  description,
  category,
  level,
  status,
  duration_hours,
  rating,
  enrollment_count,
  price,
  thumbnail,
  isFree,
  isLoggedIn,
  isEnrolled,
  loginHref,
  actionHref,
  continueLearningHref,
}: CourseDetailProps) {
  const { t, lang, isRTL } = useLanguage();
  const cd = t.courseDetail;
  const storeUser = useAuthStore((s) => s.user);
  const isAdmin = storeUser?.role === "admin" || storeUser?.role === "super_admin";

  const displayTitle = lang === "ar" && title_ar ? title_ar : title;
  const displayDesc = short_description || description || "";

  const requirements = buildRequirements(String(level), category, cd);
  const goals = buildGoals(displayTitle, category, cd);

  const primaryLabel = isEnrolled
    ? cd.continueLearning
    : isFree
      ? cd.startCourse
      : cd.buyCourse;
  const href = isEnrolled
    ? continueLearningHref
    : isLoggedIn
      ? actionHref
      : loginHref;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900" dir={isRTL ? "rtl" : "ltr"}>
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <Link
          href="/courses"
          className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className={`h-4 w-4 ${isRTL ? "rotate-180" : ""}`} />
          {cd.allCourses}
        </Link>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {thumbnail && (
            <div className="aspect-[16/6] overflow-hidden">
              <img src={thumbnail} alt={displayTitle} className="h-full w-full object-cover" />
            </div>
          )}
          <div className="relative border-b border-slate-100 bg-gradient-to-br from-blue-600/10 via-indigo-50/70 to-white px-8 py-10 sm:px-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/80 px-2.5 py-0.5 text-xs font-medium text-blue-800 shadow-sm ring-1 ring-blue-100">
                {category}
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm ${levelBadgeClass(level ?? "")}`}
              >
                {formatLevelLabel(level ?? "")}
              </span>
            </div>

            <h1 className="mt-4 font-heading text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              {displayTitle}
            </h1>

            {displayDesc && (
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600">
                {displayDesc}
              </p>
            )}

            <div className="mt-3">
              <CourseApplyStatus status={status} />
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm backdrop-blur">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <span aria-hidden className="inline-flex animate-pulse">
                    <Clock className="h-4 w-4 text-blue-600" />
                  </span>
                  {cd.duration}
                </div>
                <div className="mt-2 text-lg font-bold text-slate-900">
                  {duration_hours} {cd.hours}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm backdrop-blur">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <span aria-hidden className="inline-flex animate-pulse">
                    <Star className="h-4 w-4 text-amber-500" />
                  </span>
                  {cd.rating}
                </div>
                <div className="mt-2 text-lg font-bold text-slate-900">
                  {Number(rating).toFixed(1)}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm backdrop-blur">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <span aria-hidden className="inline-flex animate-pulse">
                    <Users className="h-4 w-4 text-blue-600" />
                  </span>
                  {cd.learners}
                </div>
                <div className="mt-2 text-lg font-bold text-slate-900">
                  {enrollment_count.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8 px-8 py-8 sm:px-10">
            <div className="grid gap-6 md:grid-cols-2">
              <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <h2 className="font-heading text-lg font-semibold text-slate-900">{cd.requirements}</h2>
                <ul className="mt-4 space-y-2 text-sm text-slate-600">
                  {requirements.map((r) => (
                    <li key={r} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <h2 className="font-heading text-lg font-semibold text-slate-900">{cd.whatCovers}</h2>
                <ul className="mt-4 space-y-2 text-sm text-slate-600">
                  {goals.map((g) => (
                    <li key={g} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                      <span>{g}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-100 pt-8 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-lg font-semibold text-slate-900">
                {isFree ? cd.free : `${price.toLocaleString()} ${cd.sar}`}
              </p>
              {!isAdmin && (
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Link
                    href={href}
                    className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                  >
                    {primaryLabel}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200/80 bg-white py-8">
        <p className="text-center text-sm text-slate-500">{t.footer}</p>
      </footer>
    </div>
  );
}
