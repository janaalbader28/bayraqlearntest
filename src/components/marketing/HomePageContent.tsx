"use client";

import Link from "next/link";
import {
  BookOpen, Clock, Star, Users, TrendingUp, Sparkles,
  ArrowRight, Linkedin, Twitter, CheckCircle2, Mail,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ContactForm } from "@/components/marketing/ContactForm";
import { AnimatedStats } from "@/components/marketing/AnimatedStats";
import { levelBadgeClass } from "@/lib/course-level";
import { CourseApplyStatus } from "@/components/course/CourseApplyStatus";

type DisplayCourse = {
  id: number;
  title: string;
  title_ar: string | null;
  short_description: string | null;
  short_description_ar: string | null;
  thumbnail: string | null;
  category: string;
  level: string;
  duration_hours: number;
  rating: number;
  rating_count: number;
  price: number;
  status: string;
};

type Props = {
  displayCourses: DisplayCourse[];
  hoursTarget: number;
  coursesTarget: number;
  learnersTarget: number;
  ratingTarget: number;
};

function truncate(text: string | null | undefined, max: number) {
  if (!text) return "";
  const t = text.trim();
  return t.length <= max ? t : `${t.slice(0, max).trim()}…`;
}

export function HomePageContent({
  displayCourses,
  hoursTarget,
  coursesTarget,
  learnersTarget,
  ratingTarget,
}: Props) {
  const { t, lang, isRTL } = useLanguage();

  const translateLevel = (level: string) => {
    switch (level.toLowerCase()) {
      case "beginner": return t.courses.levelBeginner;
      case "intermediate": return t.courses.levelIntermediate;
      case "advanced": return t.courses.levelAdvanced;
      default: return level.charAt(0).toUpperCase() + level.slice(1);
    }
  };

  const translateCategory = (cat: string) => {
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

  const statItems = [
    { label: t.stats.hours,   icon: "clock" as const, target: hoursTarget,    decimals: 0, prefix: "+" },
    { label: t.stats.courses, icon: "book"  as const, target: coursesTarget,  decimals: 0, prefix: "+" },
    { label: t.stats.learners,icon: "users" as const, target: learnersTarget, decimals: 0 },
    { label: t.stats.rating,  icon: "star"  as const, target: ratingTarget,   decimals: 1 },
  ];

  return (
    <div id="top" className="min-h-screen bg-slate-50 text-slate-900">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-gradient-to-b from-blue-50/80 via-white to-slate-50">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-cyan-300/15 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 pb-12 pt-16 text-center sm:px-6 sm:pt-20 md:pt-24">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-3 py-1 text-xs font-medium text-blue-700 shadow-sm">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            {t.hero.badge}
          </p>
          <h1 className="mx-auto max-w-3xl font-heading text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
            {t.hero.title}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-500 md:text-base">
            {t.hero.subtitle}
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#courses"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700"
            >
              {isRTL ? (
                <><ArrowRight className="h-4 w-4 rotate-180" />{t.hero.browseCourses}</>
              ) : (
                <>{t.hero.browseCourses}<ArrowRight className="h-4 w-4" /></>
              )}
            </a>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
            >
              {t.hero.startJourney}
            </Link>
          </div>

          {/* Partner logos */}
          <div className="mx-auto mt-10 w-[70%]">
            <div className="h-px bg-slate-200/80" />
            <div className="mt-8 flex flex-wrap items-center justify-center gap-10 sm:gap-14">
              <img src="https://www.systecom.gr/wp-content/uploads/2025/05/offsec.png" alt="OffSec" className="h-12 w-auto object-contain" />
              <img src="https://us-east-1.graphassets.com/AwCYQkwjSUCbfkm08Ct1Mz/5WfWcFUsSt6bRSuxLy2B" alt="I&E" className="h-12 w-auto object-contain" />
              <img src="https://lending.sdb.gov.sa/assets/sdb-logos-&-icons/SDBLogo.svg" alt="Social Development Bank" className="h-12 w-auto object-contain" />
              <img src="https://iconape.com/wp-content/png_logo_vector/%D8%AC%D8%A7%D8%AF%D8%A9-30.png" alt="Jada" className="h-12 w-auto object-contain" />
            </div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="border-b border-slate-200/80 bg-white py-10 sm:py-12">
        <AnimatedStats items={statItems} />
      </section>

      {/* About */}
      <section id="about" className="scroll-mt-24 border-b border-slate-200/80 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              {t.about.heading}
            </h2>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {[
              { icon: TrendingUp, title: t.about.missionTitle, text: t.about.missionText },
              { icon: CheckCircle2, title: t.about.goalTitle, text: t.about.goalText },
              { icon: Sparkles, title: t.about.visionTitle, text: t.about.visionText },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-slate-900">{title}</h3>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses */}
      <section id="courses" className="scroll-mt-24 bg-slate-50 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 max-w-2xl">
              <h2 className="font-heading text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                {t.courses.heading}
              </h2>
              <p className={`mt-3 text-sm leading-relaxed text-slate-600 ${isRTL ? "text-right" : "text-left"}`}>
                {t.courses.subheading}
              </p>
            </div>
            <Link
              href="/courses"
              className="inline-flex shrink-0 items-center gap-1 self-start text-sm font-semibold text-blue-600 hover:text-blue-800 sm:mt-1 sm:self-auto"
            >
              {isRTL ? (
                <><ArrowRight className="h-4 w-4 rotate-180" />{t.courses.exploreMore}</>
              ) : (
                <>{t.courses.exploreMore}<ArrowRight className="h-4 w-4" /></>
              )}
            </Link>
          </div>

          <div className="mt-12 grid gap-8 text-left md:grid-cols-3">
            {displayCourses.map((course, idx) => {
              const href = course.id > 0 ? `/courses/${course.id}` : "/courses";
              const displayTitle = lang === "ar" && course.title_ar ? course.title_ar : course.title;
              const rawDesc = lang === "ar" && course.short_description_ar
                ? course.short_description_ar
                : course.short_description;
              const desc = truncate(rawDesc, 120) || "Structured lessons, clear outcomes, and support along the way.";
              const priceLabel =
                course.price === 0
                  ? t.courses.free
                  : `${course.price.toLocaleString()} SAR`;
              const thumb = (course.thumbnail ?? "").trim();
              const safeThumbUrl = thumb && (thumb.startsWith("http://") || thumb.startsWith("https://") || thumb.startsWith("/")) ? thumb : null;

              return (
                <article
                  key={`${course.id}-${idx}`}
                  className="flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition hover:border-blue-100 hover:shadow-md"
                  dir={isRTL ? "rtl" : "ltr"}
                >
                  <div className="relative h-40 overflow-hidden border-b border-slate-100 bg-gradient-to-br from-blue-600/5 to-indigo-50/80">
                    {safeThumbUrl ? (
                      <img src={safeThumbUrl} alt={displayTitle} className="h-full w-full object-cover" loading="lazy" />
                    ) : null}
                    <div className={`absolute top-3 flex flex-wrap items-center gap-2 ${isRTL ? "right-3" : "left-3"}`}>
                      <span className="rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-medium text-blue-700 shadow-sm ring-1 ring-blue-100">
                        {translateCategory(course.category)}
                      </span>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${levelBadgeClass(course.level)}`}>
                        {translateLevel(course.level)}
                      </span>
                    </div>
                  </div>
                  <div className="border-b border-slate-100 bg-white px-6 py-4">
                    <h3 className="font-heading text-xl font-bold leading-snug text-slate-900">
                      {displayTitle}
                    </h3>
                  </div>
                  <div className="flex flex-1 flex-col px-6 pb-6 pt-4">
                    <p className="text-sm leading-relaxed text-slate-600">{desc}</p>
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
                        {course.rating.toFixed(1)}
                        <span className="text-slate-400">({course.rating_count.toLocaleString()})</span>
                      </span>
                      <span className="font-semibold text-slate-800">{priceLabel}</span>
                    </div>
                    <div className="mt-6">
                      <Link
                        href={href}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                      >
                        {t.courses.viewCourse}
                        <ArrowRight className={`h-4 w-4 ${isRTL ? "rotate-180" : ""}`} />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="scroll-mt-24 border-t border-slate-200/80 bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                {t.contact.label}
              </p>
              <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                {t.contact.heading}
              </h2>
              <p className="mt-4 text-slate-600">{t.contact.text}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="https://x.com/BayraqLearn" target="_blank" rel="noopener noreferrer"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  aria-label="X (Twitter)">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="https://www.linkedin.com/company/bayraqlearn/" target="_blank" rel="noopener noreferrer"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  aria-label="LinkedIn">
                  <Linkedin className="h-5 w-5" />
                </a>
                <a href="mailto:bayraqlearn.noreply@gmail.com"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  aria-label="Email">
                  <Mail className="h-5 w-5" />
                </a>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-6 sm:p-8">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-slate-50 py-10">
        <p className="text-center text-sm text-slate-500">{t.footer}</p>
      </footer>
    </div>
  );
}
