"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Award, Download, Share2, Medal, Lock, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { BADGE_DEFINITIONS } from "@/lib/badge-definitions";

type CertRow = {
  id: number;
  issue_date: string;
  course: { title: string; title_ar: string | null; category: string };
};

type BadgeData = {
  key: string;
  name: string;
  name_ar: string;
  description: string;
  description_ar: string;
  icon: string;
  earned: boolean;
  earned_at: string | null;
};

export function CertificatesClient({
  certificates,
}: {
  certificates: CertRow[];
  completedCount: number; // kept for API compat but unused (real data from API)
}) {
  const { t, lang, isRTL } = useLanguage();
  const cp = t.certificatesPage;
  const [badges, setBadges] = useState<BadgeData[]>([]);

  useEffect(() => {
    // Pre-populate with all badges as unearned while we fetch
    setBadges(
      BADGE_DEFINITIONS.map((d) => ({
        key: d.key,
        name: d.name,
        name_ar: d.name_ar,
        description: d.description,
        description_ar: d.description_ar,
        icon: d.icon,
        earned: false,
        earned_at: null,
      }))
    );
    fetch("/api/user/badges")
      .then((r) => r.json())
      .then((data) => {
        if (data?.badges) setBadges(data.badges);
      })
      .catch(() => null);
  }, []);

  return (
    <div className="mx-auto max-w-7xl pb-20" dir={isRTL ? "rtl" : "ltr"}>
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-900">{cp.title}</h1>
        <p className="mt-1 text-sm text-slate-600">{cp.subtitle}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <section className="space-y-4 lg:col-span-2">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Award className="h-5 w-5 text-blue-600" />
            {cp.certificatesHeading}
          </h2>

          {certificates.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center text-slate-500">
              <Award className="mx-auto mb-3 h-10 w-10 text-slate-300" />
              <p className="font-medium text-slate-700">{cp.noCerts}</p>
              <p className="mt-1 text-sm">{cp.noCertsHint}</p>
              <ul className={`mx-auto mt-5 max-w-sm space-y-2 text-xs text-slate-600 ${isRTL ? "text-right" : "text-left"}`}>
                {([cp.step1, cp.step2, cp.step3] as string[]).map((step) => (
                  <li key={step} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
              <Link href="/courses" className="mt-6 inline-flex text-sm font-semibold text-blue-600 hover:text-blue-800">
                {cp.browseCourses}
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {certificates.map((cert) => {
                const courseTitle = lang === "ar" && cert.course.title_ar ? cert.course.title_ar : cert.course.title;
                const issuedDate = new Date(cert.issue_date).toLocaleDateString(
                  lang === "ar" ? "ar-SA" : "en-US",
                  { dateStyle: "medium" }
                );
                return (
                  <li key={cert.id} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">{cert.course.category}</p>
                      <p className="mt-1 font-heading text-lg font-bold text-slate-900">{courseTitle}</p>
                      <p className="mt-1 text-xs text-slate-500">{cp.issued} {issuedDate}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <a
                        href={`/api/user/certificates/${cert.id}`}
                        download
                        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                      >
                        <Download className="h-4 w-4" />
                        {cp.download}
                      </a>
                      <a
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`I completed "${cert.course.title}" on BayraqLearn!`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50"
                      >
                        <Share2 className="h-4 w-4" />
                        {cp.share}
                      </a>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <aside className="rounded-2xl border border-slate-200 bg-gradient-to-b from-blue-50/80 to-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Medal className="h-5 w-5 text-amber-500" />
            {cp.badgesHeading}
          </h2>
          <ul className="mt-5 space-y-3">
            {badges
              .slice()
              .sort((a, b) => (b.earned ? 1 : 0) - (a.earned ? 1 : 0))
              .slice(0, 3)
              .map((b) => {
                const name = lang === "ar" ? b.name_ar : b.name;
                const desc = lang === "ar" ? b.description_ar : b.description;
                const earnedDate = b.earned_at
                  ? new Date(b.earned_at).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US", { dateStyle: "medium" })
                  : null;
                const initials = name.slice(0, 2).toUpperCase();
                return (
                  <li
                    key={b.key}
                    className={`rounded-xl border px-4 py-3 shadow-sm transition ${
                      b.earned
                        ? "border-amber-200/80 bg-gradient-to-br from-amber-50/80 to-white"
                        : "border-slate-200/80 bg-white/90 opacity-60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          b.earned ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"
                        }`}>
                          {initials}
                        </div>
                        <p className="font-semibold text-slate-900">{name}</p>
                      </div>
                      {b.earned ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                      ) : (
                        <Lock className="h-4 w-4 shrink-0 text-slate-400" />
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {b.earned && earnedDate
                        ? `${cp.issued} ${earnedDate}`
                        : desc}
                    </p>
                  </li>
                );
              })}
          </ul>
        </aside>
      </div>
    </div>
  );
}
