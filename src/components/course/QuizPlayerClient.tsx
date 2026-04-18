"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Loader2,
  PartyPopper,
  AlertTriangle,
  Star,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { CourseSidebar } from "./CourseSidebar";
import type { PlayerModule, PlayerQuiz } from "./CoursePlayerClient";

type QuizAnswer = { id: number; answer_text: string };
type QuizQuestion = {
  id: number;
  question_text: string;
  question_type: string;
  answers: QuizAnswer[];
};
type QuizData = {
  id: number;
  title: string;
  passing_score: number;
  questions: QuizQuestion[];
};
type DetailedResult = {
  questionId: number;
  selectedAnswerId: number;
  correctAnswerId: number;
  isCorrect: boolean;
};

export function QuizPlayerClient(props: {
  courseId: number;
  courseTitle: string;
  modules: PlayerModule[];
  quizzes: PlayerQuiz[];
  currentQuizId: number;
  progressPct: number;
  completedLessonIds: number[];
  passedQuizIds: number[];
  allLessonsDone: boolean;
  quiz: QuizData;
  prevItemUrl: string | null;
  nextItemUrl: string | null;
}) {
  const { t, isRTL } = useLanguage();
  const cp = t.coursePlayer;

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [completedSet] = useState(() => new Set(props.completedLessonIds));
  const [passedQuizSet, setPassedQuizSet] = useState(() => new Set(props.passedQuizIds));
  const [progressPct, setProgressPct] = useState(props.progressPct);

  const alreadyPassed = passedQuizSet.has(props.currentQuizId);

  // Quiz state
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Result state
  type SubmitResult = {
    score: number;
    passed: boolean;
    progressPct: number;
    isCourseComplete: boolean;
    attempt: { answers_data: string };
  };
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [detailedResults, setDetailedResults] = useState<DetailedResult[]>([]);

  // Completion/rating modal (same flow as lesson player)
  const [showCompletion, setShowCompletion] = useState(false);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [starRating, setStarRating] = useState(0);
  const [hoverStar, setHoverStar] = useState(0);
  const [comment, setComment] = useState("");
  const [submittingRating, setSubmittingRating] = useState(false);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  const handleSubmit = async () => {
    // Validate all questions answered
    const unanswered = props.quiz.questions.filter((q) => answers[q.id] === undefined);
    if (unanswered.length > 0) {
      setSubmitError(cp.allAnswersRequired);
      return;
    }
    setSubmitError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/courses/quizzes/submit", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizId: props.quiz.id, answers }),
      });
      if (!res.ok) {
        setSubmitError("Submission failed. Please try again.");
        return;
      }
      const data: SubmitResult = await res.json();
      setResult(data);
      setProgressPct(data.progressPct);

      const parsed: DetailedResult[] = JSON.parse(data.attempt.answers_data || "[]");
      setDetailedResults(parsed);

      if (data.passed) {
        setPassedQuizSet((prev) => new Set([...prev, props.currentQuizId]));
      }
      if (data.isCourseComplete) {
        setShowCompletion(true);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setResult(null);
    setDetailedResults([]);
    setAnswers({});
    setSubmitError("");
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

      {/* ── Main Layout ── */}
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
          currentQuizId={props.currentQuizId}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen((o) => !o)}
        />

        {/* Main content */}
        <main className="min-w-0 flex-1">
          <div className="border-b border-slate-200 px-6 py-5">
            <div className="flex items-center gap-3">
              <h1 className="truncate font-heading text-2xl font-bold text-slate-900">
                {props.quiz.title}
              </h1>
              {alreadyPassed && !result && (
                <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" /> {cp.quizPassed}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {props.quiz.questions.length} questions · Passing score: {props.quiz.passing_score}%
            </p>
          </div>

          <div className="px-6 py-6">
            {/* Warning if lessons not done */}
            {!props.allLessonsDone && !result && (
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                <p className="text-xs text-amber-800">{cp.lessonsNotDone}</p>
              </div>
            )}

            {/* Already passed notice */}
            {alreadyPassed && !result && (
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                <p className="text-xs text-emerald-800">{cp.quizAlreadyPassed}</p>
              </div>
            )}

            {/* ── Result view ── */}
            {result ? (
              <div className="space-y-5">
                {/* Score card */}
                <div
                  className={`rounded-2xl border p-6 text-center ${
                    result.passed
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-red-200 bg-red-50"
                  }`}
                >
                  <div
                    className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full ${
                      result.passed ? "bg-emerald-100" : "bg-red-100"
                    }`}
                  >
                    {result.passed ? (
                      <CheckCircle2 className="h-7 w-7 text-emerald-600" />
                    ) : (
                      <XCircle className="h-7 w-7 text-red-600" />
                    )}
                  </div>
                  <p
                    className={`text-lg font-bold ${
                      result.passed ? "text-emerald-700" : "text-red-700"
                    }`}
                  >
                    {result.passed ? cp.quizPassed : cp.quizFailed}
                  </p>
                  <p className="mt-1 text-3xl font-bold text-slate-900">
                    {Math.round(result.score)}%
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {cp.quizScore} · Passing: {props.quiz.passing_score}%
                  </p>
                </div>

                {/* Per-question results */}
                <div className="space-y-3">
                  {props.quiz.questions.map((q, qIdx) => {
                    const detail = detailedResults.find((r) => r.questionId === q.id);
                    const isCorrect = detail?.isCorrect ?? false;
                    return (
                      <div
                        key={q.id}
                        className={`rounded-xl border p-4 ${
                          isCorrect
                            ? "border-emerald-200 bg-emerald-50/50"
                            : "border-red-200 bg-red-50/50"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {isCorrect ? (
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                          ) : (
                            <XCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-slate-800">
                              {qIdx + 1}. {q.question_text}
                            </p>
                            <div className="mt-2 space-y-1">
                              {q.answers.map((a) => {
                                const isSelected = detail?.selectedAnswerId === a.id;
                                const isCorrectAnswer = detail?.correctAnswerId === a.id;
                                return (
                                  <div
                                    key={a.id}
                                    className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs ${
                                      isCorrectAnswer
                                        ? "bg-emerald-100 text-emerald-800 font-medium"
                                        : isSelected
                                        ? "bg-red-100 text-red-700"
                                        : "text-slate-500"
                                    }`}
                                  >
                                    <span className="shrink-0">
                                      {isCorrectAnswer ? "✓" : isSelected ? "✗" : "·"}
                                    </span>
                                    {a.answer_text}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Navigation after result */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    {cp.quizRetry}
                  </button>

                  {result.passed && (
                    props.nextItemUrl ? (
                      <Link
                        href={props.nextItemUrl}
                        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                      >
                        {cp.quizContinue}
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    ) : (
                      <Link
                        href={`/dashboard/courses/${props.courseId}`}
                        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                      >
                        {cp.backToOverview}
                      </Link>
                    )
                  )}
                </div>
              </div>
            ) : (
              /* ── Quiz form ── */
              <div className="space-y-5">
                {props.quiz.questions.map((q, qIdx) => (
                  <div key={q.id} className="rounded-xl border border-slate-200 p-5">
                    <p className="mb-4 text-sm font-semibold text-slate-800">
                      {qIdx + 1}. {q.question_text}
                    </p>
                    <div className="space-y-2">
                      {q.answers.map((a) => {
                        const selected = answers[q.id] === a.id;
                        return (
                          <label
                            key={a.id}
                            className={[
                              "flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition",
                              selected
                                ? "border-blue-300 bg-blue-50 text-blue-800"
                                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
                            ].join(" ")}
                          >
                            <input
                              type="radio"
                              name={`q-${q.id}`}
                              value={a.id}
                              checked={selected}
                              onChange={() =>
                                setAnswers((prev) => ({ ...prev, [q.id]: a.id }))
                              }
                              className="accent-blue-600"
                            />
                            {a.answer_text}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {submitError && (
                  <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {submitError}
                  </p>
                )}

                {/* Navigation */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
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

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    {cp.submitQuiz}
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
