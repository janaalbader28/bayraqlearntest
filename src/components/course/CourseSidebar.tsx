"use client";

import Link from "next/link";
import { CheckCircle2, Menu, ClipboardList } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { PlayerModule, PlayerQuiz } from "./CoursePlayerClient";

export function CourseSidebar({
  courseId,
  courseTitle,
  modules,
  quizzes,
  completedSet,
  passedQuizSet,
  progressPct,
  currentLessonId,
  currentQuizId,
  isOpen,
  onToggle,
}: {
  courseId: number;
  courseTitle: string;
  modules: PlayerModule[];
  quizzes: PlayerQuiz[];
  completedSet: Set<number>;
  passedQuizSet: Set<number>;
  progressPct: number;
  currentLessonId?: number;
  currentQuizId?: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const { t } = useLanguage();
  const cp = t.coursePlayer;

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={onToggle}
        className="m-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50"
        aria-label="Open sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>
    );
  }

  return (
    <aside className="w-80 shrink-0 border-r border-slate-200 bg-slate-50">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-slate-900">{courseTitle}</div>
          <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
            <span>{cp.progress}</span>
            <span className="tabular-nums text-slate-700">{progressPct}%</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white ring-1 ring-slate-200">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="rounded-lg p-2 text-slate-500 hover:bg-white hover:text-slate-700"
          aria-label="Collapse sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      <nav className="h-[calc(100vh-64px-73px)] overflow-y-auto p-3">
        {modules.map((m) => (
          <details
            key={m.title}
            className="group mb-2 rounded-xl border border-slate-200 bg-white p-3"
            open
          >
            <summary className="cursor-pointer list-none">
              <div className="flex items-start justify-between gap-3">
                <div className="font-semibold text-slate-900">{m.title}</div>
                <div className="text-xs text-slate-500 tabular-nums">{m.durationMinutes} min</div>
              </div>
              <div className="mt-1 text-xs text-slate-500">{m.lessons.length} lessons</div>
            </summary>
            <div className="mt-3 space-y-1">
              {m.lessons.map((l) => {
                const active = l.id === currentLessonId;
                const done = completedSet.has(l.id);
                return (
                  <Link
                    key={l.id}
                    href={`/dashboard/courses/${courseId}/learn/${l.id}`}
                    className={[
                      "flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm transition",
                      active
                        ? "bg-blue-600/10 text-blue-800 ring-1 ring-blue-200"
                        : "text-slate-700 hover:bg-slate-50",
                    ].join(" ")}
                  >
                    <span className="min-w-0 truncate">{l.title}</span>
                    <span className="shrink-0 text-xs text-slate-500 tabular-nums">
                      {done ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      ) : (
                        `${l.duration_minutes}m`
                      )}
                    </span>
                  </Link>
                );
              })}
            </div>
          </details>
        ))}

        {quizzes.length > 0 && (
          <div className="mb-2 rounded-xl border border-slate-200 bg-white p-3">
            <div className="mb-2 text-sm font-semibold text-slate-900">{cp.quizzesSectionTitle}</div>
            <div className="space-y-1">
              {quizzes.map((q) => {
                const active = q.id === currentQuizId;
                const passed = passedQuizSet.has(q.id);
                return (
                  <Link
                    key={q.id}
                    href={`/dashboard/courses/${courseId}/quiz/${q.id}`}
                    className={[
                      "flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm transition",
                      active
                        ? "bg-blue-600/10 text-blue-800 ring-1 ring-blue-200"
                        : "text-slate-700 hover:bg-slate-50",
                    ].join(" ")}
                  >
                    <span className="min-w-0 truncate">{q.title}</span>
                    {passed ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    ) : (
                      <ClipboardList className="h-4 w-4 text-slate-400 shrink-0" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>
    </aside>
  );
}
