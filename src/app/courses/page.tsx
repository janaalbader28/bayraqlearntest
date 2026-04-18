"use client";

import { HomeNav } from "@/components/marketing/HomeNav";
import { CoursesBrowser } from "@/app/courses/CoursesBrowser";
import { useLanguage } from "@/contexts/LanguageContext";

export default function PublicCoursesPage() {
  const { t, isRTL } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900" dir={isRTL ? "rtl" : "ltr"}>
      <HomeNav />

      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="text-center">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {t.courses.explorePageHeading}
          </h1>
        </div>

        <CoursesBrowser />

      </main>

      <footer className="border-t border-slate-200/80 bg-white py-8">
        <p className="text-center text-sm text-slate-500">{t.footer}</p>
      </footer>
    </div>
  );
}
