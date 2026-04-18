"use client";

import Link from "next/link";
import { ArrowLeft, Clock, PlayCircle } from "lucide-react";
import { CourseApplyStatus } from "@/components/course/CourseApplyStatus";
import { useLanguage } from "@/contexts/LanguageContext";

type ModuleSummary = {
  title: string;
  lessonCount: number;
  durationMinutes: number;
  hasQuiz: boolean;
};

type DashboardCourseProps = {
  courseId: number;
  title: string;
  title_ar: string | null;
  short_description: string | null;
  description: string | null;
  status: string;
  thumbnail: string | null;
  totalMinutes: number;
  lessonCount: number;
  quizCount: number;
  moduleSummaries: ModuleSummary[];
  firstLessonId: number | null;
};

export function DashboardCourseClient({
  courseId,
  title,
  title_ar,
  short_description,
  description,
  status,
  thumbnail,
  totalMinutes,
  lessonCount,
  quizCount,
  moduleSummaries,
  firstLessonId,
}: DashboardCourseProps) {
  const { t, lang, isRTL } = useLanguage();
  const dc = t.dashboardCourse;

  const displayTitle = lang === "ar" && title_ar ? title_ar : title;
  const displayDesc = short_description || description || "";

  return (
    <div className="mx-auto max-w-6xl pb-16" dir={isRTL ? "rtl" : "ltr"}>
      <div className="mb-8">
        <Link
          href="/dashboard/courses"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className={`h-4 w-4 ${isRTL ? "rotate-180" : ""}`} />
          {dc.backToCourses}
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-900">{displayTitle}</h1>
            {displayDesc && (
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">{displayDesc}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <CourseApplyStatus status={status} />
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <section className="space-y-6 lg:col-span-2">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="aspect-[16/7] bg-gradient-to-br from-blue-600/10 via-indigo-50/80 to-slate-50">
              {thumbnail ? (
                <img src={thumbnail} alt={displayTitle} className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-slate-900">{dc.whatYoullLearn}</h2>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-4 w-4 text-blue-600" />
                  {Math.round(totalMinutes / 60)}{dc.hTotal}
                </span>
                <span>{lessonCount} {dc.lessons}</span>
                <span>{quizCount} {dc.quizzes}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">{dc.modules}</h2>
            <div className="mt-4 space-y-3">
              {moduleSummaries.length === 0 ? (
                <p className="text-sm text-slate-500">{dc.noModules}</p>
              ) : (
                moduleSummaries.map((m) => (
                  <div key={m.title} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="font-semibold text-slate-900">{m.title}</div>
                      <div className="text-xs text-slate-500">
                        {m.lessonCount} {dc.lessons} · {m.durationMinutes} {dc.min}
                        {m.hasQuiz ? ` · ${dc.quiz}` : ""}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">{dc.readyToStart}</h3>
          <p className="mt-2 text-sm text-slate-600">{dc.startDesc}</p>

          <div className="mt-6">
            {firstLessonId ? (
              <Link
                href={`/dashboard/courses/${courseId}/learn/${firstLessonId}`}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <PlayCircle className="h-4 w-4" />
                {dc.startLearning}
              </Link>
            ) : (
              <button
                disabled
                className="inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-slate-200 py-3 text-sm font-semibold text-slate-500"
              >
                <PlayCircle className="h-4 w-4" />
                {dc.startLearning}
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
