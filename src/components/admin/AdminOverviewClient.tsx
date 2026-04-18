"use client";

import Link from "next/link";
import { Users, BookOpen, GraduationCap, Star, ArrowRight } from "lucide-react";
import { AdminAnalyticsCharts } from "@/components/admin/AdminAnalyticsCharts";
import { CourseApplyStatus } from "@/components/course/CourseApplyStatus";
import { useLanguage } from "@/contexts/LanguageContext";

type PopularCourse = {
  id: number;
  title: string;
  category: string;
  enrollment_count: number;
  rating: number;
  status: string;
};

export function AdminOverviewClient({
  usersCount,
  coursesCount,
  enrollmentCount,
  avgRating,
  popular,
}: {
  usersCount: number;
  coursesCount: number;
  enrollmentCount: number;
  avgRating: number;
  popular: PopularCourse[];
}) {
  const { t, isRTL } = useLanguage();
  const ao = t.adminOverview;

  const statCards = [
    { label: ao.totalUsers, value: usersCount.toLocaleString(), icon: Users, color: "text-blue-600", bg: "bg-blue-600/10" },
    { label: ao.totalCourses, value: coursesCount.toLocaleString(), icon: BookOpen, color: "text-indigo-600", bg: "bg-indigo-600/10" },
    { label: ao.enrollments, value: enrollmentCount.toLocaleString(), icon: GraduationCap, color: "text-sky-600", bg: "bg-sky-600/10" },
    { label: ao.avgRating, value: avgRating.toFixed(1), icon: Star, color: "text-amber-500", bg: "bg-amber-500/10" },
  ];

  return (
    <div className="mx-auto max-w-7xl pb-16 space-y-8" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900">{ao.title}</h1>
          <p className="mt-0.5 text-sm text-slate-500">{ao.subtitle}</p>
        </div>
        <Link
          href="/dashboard/admin/courses"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700"
        >
          {ao.manageCourses}
          <ArrowRight className={`h-3.5 w-3.5 ${isRTL ? "rotate-180" : ""}`} />
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {statCards.map((s) => (
          <div key={s.label} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm transition hover:border-blue-100 hover:shadow-md">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${s.bg}`}>
              <s.icon className={s.color} style={{ width: 18, height: 18 }} />
            </div>
            <div className="min-w-0">
              <p className="font-heading text-xl font-bold leading-none text-slate-900">{s.value}</p>
              <p className="mt-0.5 truncate text-[11px] font-medium uppercase tracking-wider text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <AdminAnalyticsCharts />

      {/* Most Popular Courses */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-sm font-semibold text-slate-900">{ao.mostPopular}</h2>
          <Link href="/dashboard/admin/courses" className="text-xs font-medium text-blue-600 hover:text-blue-800">
            {ao.viewAll}
          </Link>
        </div>
        {popular.length === 0 ? (
          <p className="px-6 py-8 text-sm text-slate-500">{ao.noCourses}</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {popular.map((c, i) => (
              <li key={c.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-6 py-3 transition hover:bg-slate-50/60">
                <span className="w-5 shrink-0 text-center text-xs font-bold text-slate-400">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <Link href={`/dashboard/admin/courses/${c.id}/edit`} className="truncate text-sm font-medium text-slate-900 hover:text-blue-700">
                    {c.title}
                  </Link>
                  <p className="truncate text-xs text-slate-500">{c.category}</p>
                </div>
                <span className="flex items-center gap-1 text-xs text-slate-600 tabular-nums">
                  <GraduationCap className="h-3.5 w-3.5 text-slate-400" />
                  {c.enrollment_count.toLocaleString()}
                </span>
                <span className="flex items-center gap-1 text-xs text-amber-600 tabular-nums">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  {Number(c.rating || 0).toFixed(1)}
                </span>
                <CourseApplyStatus status={c.status} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
