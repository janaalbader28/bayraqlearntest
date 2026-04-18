"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Star,
  Loader2,
  PartyPopper,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { CourseSidebar } from "./CourseSidebar";

export type PlayerLesson = {
  id: number;
  title: string;
  duration_minutes: number;
  content: string | null;
};

export type PlayerModule = {
  title: string;
  durationMinutes: number;
  lessons: PlayerLesson[];
};

export type PlayerQuiz = {
  id: number;
  title: string;
  passing_score: number;
};

function extractVideoUrl(content: string | null): string | null {
  if (!content) return null;
  const match = content.match(/Video URL:\s*(https?:\/\/\S+)/i);
  return match?.[1] ?? null;
}

function toEmbedUrl(url: string): string {
  if (url.includes("youtube.com/watch?v=")) {
    const id = url.split("v=")[1]?.split("&")[0];
    return id ? `https://www.youtube.com/embed/${id}` : url;
  }
  if (url.includes("youtu.be/")) {
    const id = url.split("youtu.be/")[1]?.split("?")[0];
    return id ? `https://www.youtube.com/embed/${id}` : url;
  }
  return url;
}

export function CoursePlayerClient(props: {
  courseId: number;
  courseTitle: string;
  modules: PlayerModule[];
  quizzes: PlayerQuiz[];
  currentLessonId: number;
  progressPct: number;
  completedLessonIds: number[];
  passedQuizIds: number[];
  prevItemUrl: string | null;
  nextItemUrl: string | null;
}) {
  const { t, isRTL } = useLanguage();
  const cp = t.coursePlayer;

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [completedSet, setCompletedSet] = useState(
    () => new Set(props.completedLessonIds),
  );
  const [passedQuizSet] = useState(() => new Set(props.passedQuizIds));
  const [progressPct, setProgressPct] = useState(props.progressPct);
  const [marking, setMarking] = useState(false);

  const [showCompletion, setShowCompletion] = useState(false);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [starRating, setStarRating] = useState(0);
  const [hoverStar, setHoverStar] = useState(0);
  const [comment, setComment] = useState("");
  const [submittingRating, setSubmittingRating] = useState(false);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  const flatLessons = useMemo(
    () => props.modules.flatMap((m) => m.lessons),
    [props.modules],
  );
  const lesson = useMemo(
    () => flatLessons.find((l) => l.id === props.currentLessonId) ?? null,
    [flatLessons, props.currentLessonId],
  );

  const isCurrentCompleted = completedSet.has(props.currentLessonId);
  const videoUrl = extractVideoUrl(lesson?.content ?? null);
  const embedUrl = videoUrl ? toEmbedUrl(videoUrl) : null;

  const lessonText = lesson?.content
    ? lesson.content
        .split("\n")
        .filter(
          (l) =>
            !l.toLowerCase().startsWith("video url:") &&
            !l.toLowerCase().startsWith("module:"),
        )
        .join("\n")
        .trim()
    : "";

  const handleMarkComplete = async () => {
    const willComplete = !isCurrentCompleted;
    setMarking(true);
    try {
      const res = await fetch("/api/courses/progress", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId: props.currentLessonId,
          isCompleted: willComplete,
        }),
      });
      if (!res.ok) return;

      const data = (await res.json()) as {
        progressPct: number;
        isCourseComplete: boolean;
      };

      setCompletedSet((prev) => {
        const next = new Set(prev);
        if (willComplete) next.add(props.currentLessonId);
        else next.delete(props.currentLessonId);
        return next;
      });
      setProgressPct(data.progressPct);

      if (data.isCourseComplete) {
        setShowCompletion(true);
      }
    } finally {
      setMarking(false);
    }
  };

  const handleSubmitRating = async () => {
    if (starRating === 0) return;
    setSubmittingRating(true);
    try {
      await fetch(`/api/courses/${props.courseId}/review`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: starRating, comment }),
      });
      setRatingSubmitted(true);
    } finally {
      setSubmittingRating(false);
    }
  };

  return (
    <>
      {/* ── Completion / Rating Modal ── */}
      {showCompletion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl text-center">
            {!showRatingForm && !ratingSubmitted && (
              <>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                  <PartyPopper className="h-8 w-8 text-emerald-600" />
                </div>
                <h2 className="font-heading text-2xl font-bold text-slate-900">{cp.congratsTitle}</h2>
                <p className="mt-2 text-sm text-slate-600">{cp.congratsMessage}</p>
                <button
                  onClick={() => setShowRatingForm(true)}
                  className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  {cp.rateNow}
                </button>
                <button
                  onClick={() => setShowCompletion(false)}
                  className="mt-3 block w-full text-sm text-slate-500 hover:text-slate-700"
                >
                  {cp.rateLater}
                </button>
              </>
            )}

            {showRatingForm && !ratingSubmitted && (
              <>
                <h2 className="font-heading text-xl font-bold text-slate-900">{cp.rateTitle}</h2>
                <p className="mt-1 text-sm text-slate-500">{cp.rateSubtitle}</p>
                <div className="mt-5 flex items-center justify-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setStarRating(star)}
                      onMouseEnter={() => setHoverStar(star)}
                      onMouseLeave={() => setHoverStar(0)}
                      className="rounded p-0.5 focus:outline-none"
                    >
                      <Star
                        className={`h-9 w-9 transition ${
                          star <= (hoverStar || starRating)
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-200"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={cp.feedbackPlaceholder}
                  rows={3}
                  className="mt-4 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                />
                <button
                  onClick={handleSubmitRating}
                  disabled={starRating === 0 || submittingRating}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submittingRating && <Loader2 className="h-4 w-4 animate-spin" />}
                  {cp.rateSubmit}
                </button>
                <button
                  onClick={() => setShowCompletion(false)}
                  className="mt-3 block w-full text-sm text-slate-500 hover:text-slate-700"
                >
                  {cp.rateLater}
                </button>
              </>
            )}

            {ratingSubmitted && (
              <>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                  <CheckCircle2 className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="font-heading text-xl font-bold text-slate-900">{cp.rateSuccess}</h2>
                <Link
                  href={`/dashboard/courses/${props.courseId}`}
                  className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  {cp.backToOverview}
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Main Player Layout ── */}
      <div
        className="flex min-h-[calc(100vh-64px)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <CourseSidebar
          courseId={props.courseId}
          courseTitle={props.courseTitle}
          modules={props.modules}
          quizzes={props.quizzes}
          completedSet={completedSet}
          passedQuizSet={passedQuizSet}
          progressPct={progressPct}
          currentLessonId={props.currentLessonId}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen((o) => !o)}
        />

        {/* Main content */}
        <main className="min-w-0 flex-1">
          <div className="border-b border-slate-200 px-6 py-5">
            <h1 className="truncate font-heading text-2xl font-bold text-slate-900">
              {lesson?.title ?? "Lesson"}
            </h1>
          </div>

          <div className="px-6 py-6">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
              <div className="aspect-video bg-black">
                {embedUrl ? (
                  <iframe
                    src={embedUrl}
                    title={lesson?.title ?? "Lesson video"}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-white/70">
                    Video not set (add a YouTube URL in the lesson).
                  </div>
                )}
              </div>
              {lessonText && (
                <div className="border-t border-slate-200 bg-white px-5 py-4">
                  <p className="whitespace-pre-line text-sm text-slate-600">{lessonText}</p>
                </div>
              )}
            </div>

            {/* Navigation + Mark Complete */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              {props.prevItemUrl ? (
                <Link
                  href={props.prevItemUrl}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  {cp.previousLesson}
                </Link>
              ) : (
                <span />
              )}

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleMarkComplete}
                  disabled={marking}
                  className={[
                    "inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition",
                    isCurrentCompleted
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                    "disabled:cursor-not-allowed disabled:opacity-60",
                  ].join(" ")}
                >
                  {marking ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2
                      className={`h-4 w-4 ${isCurrentCompleted ? "text-emerald-600" : "text-slate-400"}`}
                    />
                  )}
                  {isCurrentCompleted ? cp.markIncomplete : cp.markComplete}
                </button>

                {props.nextItemUrl ? (
                  <Link
                    href={props.nextItemUrl}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    {cp.nextLesson}
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <Link
                    href={`/dashboard/courses/${props.courseId}`}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    {cp.backToOverview}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
