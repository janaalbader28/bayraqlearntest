"use client";

import { CoursesBrowser } from "@/app/courses/CoursesBrowser";
import { useLanguage } from "@/contexts/LanguageContext";

export default function DashboardCoursesPage() {
  const { t, isRTL } = useLanguage();
  return (
    <div className="mx-auto max-w-7xl pb-20" dir={isRTL ? "rtl" : "ltr"}>
      <h1 className="mb-8 font-heading text-3xl font-bold tracking-tight text-slate-900">
        {t.dashboard.myCourses}
      </h1>
      <CoursesBrowser variant="dashboard" />
    </div>
  );
}
