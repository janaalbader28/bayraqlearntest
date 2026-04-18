"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Loader2, Plus, Trash2, ChevronRight, ChevronLeft,
  Video, BookOpen, Calendar, Bell, Upload, Link2,
} from "lucide-react";
export const dynamic = "force-dynamic";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-200 focus:bg-white focus:ring-4 focus:ring-blue-600/10";

type LessonInput = { title: string; video_url: string; duration_minutes: string };
type ModuleInput = { title: string; lessons: LessonInput[] };
type QuestionInput = {
  question_text: string;
  question_type: "multiple_choice" | "true_false" | "text";
  options: string[];
  correct_index: number;
};
type QuizInput = {
  title: string;
  scope: "module" | "final";
  module_index: number;
  passing_score: string;
  questions: QuestionInput[];
};
type SessionDay = { day: string; start_time: string; end_time: string };

export default function AdminNewCoursePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    title_ar: "",
    short_description: "",
    short_description_ar: "",
    description: "",
    description_ar: "",
    instructor_name: "Instructor",
    category: "Programming",
    level: "beginner",
    price: "0",
    duration_hours: "10",
    status: "published",
    thumbnail: "",
    is_featured: false,
    is_live_course: false,
    zoom_link: "",
    whatsapp_link: "",
  });

  const [sessions, setSessions] = useState<SessionDay[]>([
    { day: "Monday", start_time: "18:00", end_time: "20:00" },
  ]);
  const [sessionCount, setSessionCount] = useState("8");
  const [sendReminders, setSendReminders] = useState(false);
  const [reminderHours, setReminderHours] = useState<"12" | "24" | "48">("24");
  const [thumbMode, setThumbMode] = useState<"url" | "upload">("url");
  const [thumbUploading, setThumbUploading] = useState(false);

  const [modules, setModules] = useState<ModuleInput[]>([
    { title: "Introduction", lessons: [{ title: "Welcome", video_url: "", duration_minutes: "10" }] },
  ]);
  const [quizzes, setQuizzes] = useState<QuizInput[]>([]);

  // Steps differ based on course type
  const steps = form.is_live_course
    ? ["Course Info", "Schedule", "Settings"]
    : ["Course Info", "Course Content", "Tests", "Settings"];
  const totalSteps = steps.length;

  function addModule() {
    setModules((m) => [...m, { title: "", lessons: [{ title: "", video_url: "", duration_minutes: "10" }] }]);
  }

  function addQuiz() {
    setQuizzes((q) => [
      ...q,
      {
        title: "",
        scope: "module",
        module_index: 0,
        passing_score: "70",
        questions: [
          { question_text: "", question_type: "multiple_choice", options: ["", "", "", ""], correct_index: 0 },
        ],
      },
    ]);
  }

  function addQuestion(quizIndex: number) {
    setQuizzes((prev) =>
      prev.map((quiz, i) =>
        i === quizIndex
          ? {
              ...quiz,
              questions: [
                ...quiz.questions,
                { question_text: "", question_type: "multiple_choice", options: ["", "", "", ""], correct_index: 0 },
              ],
            }
          : quiz,
      ),
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const validationError = validateCurrentStep();
    if (validationError) { setError(validationError); return; }
    setLoading(true);
    setError("");
    try {
      const scheduleJson = form.is_live_course
        ? JSON.stringify({
            sessions,
            session_count: Number(sessionCount),
            send_reminders: sendReminders,
            reminder_hours: sendReminders ? Number(reminderHours) : null,
          })
        : null;

      const res = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          schedule_json: scheduleJson,
          modules: form.is_live_course ? [] : modules,
          quizzes: form.is_live_course ? [] : quizzes.map((quiz) => ({
            ...quiz,
            module_title:
              quiz.scope === "final" ? "Final Quiz" : modules[quiz.module_index]?.title || `Module ${quiz.module_index + 1}`,
            questions: quiz.questions.map((q) => ({
              ...q,
              options:
                q.question_type === "multiple_choice"
                  ? q.options
                  : q.question_type === "true_false"
                    ? ["True", "False"]
                    : [],
            })),
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create course");
      router.push("/dashboard/admin/courses");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  function validateCurrentStep(): string | null {
    if (section === "info") {
      if (!form.title.trim()) return "Course title (English) is required.";
      if (!form.short_description.trim()) return "Short description (EN) is required.";
      if (!form.description.trim()) return "Full description (EN) is required.";
      if (!form.instructor_name.trim()) return "Instructor name is required.";
    }
    if (section === "schedule") {
      if (!form.zoom_link.trim()) return "Zoom link is required for live courses.";
    }
    if (section === "content") {
      for (let i = 0; i < modules.length; i++) {
        if (!modules[i].title.trim()) return `Module ${i + 1} title is required.`;
        for (let j = 0; j < modules[i].lessons.length; j++) {
          if (!modules[i].lessons[j].title.trim())
            return `Lesson ${j + 1} in Module ${i + 1} title is required.`;
        }
      }
    }
    return null;
  }

  // Map step number (1-based) to logical section
  const getSection = (s: number) => {
    if (form.is_live_course) {
      if (s === 1) return "info";
      if (s === 2) return "schedule";
      return "settings";
    } else {
      if (s === 1) return "info";
      if (s === 2) return "content";
      if (s === 3) return "tests";
      return "settings";
    }
  };
  const section = getSection(step);

  return (
    <div className="mx-auto max-w-5xl pb-12">
      <Link
        href="/dashboard/admin/courses"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to courses
      </Link>
      <h1 className="font-heading text-3xl font-bold text-slate-900">Create course</h1>
      <p className="mt-1 text-sm text-slate-600">Step-based builder.</p>

      {/* Course type toggle */}
      <div className="mt-5 flex items-center gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4">
        <span className="text-sm font-medium text-slate-700">Course type:</span>
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="radio"
            name="course_type"
            checked={!form.is_live_course}
            onChange={() => { setForm((f) => ({ ...f, is_live_course: false })); setStep(1); }}
          />
          <BookOpen className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-slate-700">E-Learning (Self-paced)</span>
        </label>
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="radio"
            name="course_type"
            checked={form.is_live_course}
            onChange={() => { setForm((f) => ({ ...f, is_live_course: true })); setStep(1); }}
          />
          <Video className="h-4 w-4 text-teal-500" />
          <span className="text-sm font-medium text-slate-700">Live Course (Zoom)</span>
        </label>
      </div>

      {/* Step tabs */}
      <div className={`mt-4 grid gap-2 rounded-xl border border-slate-200 bg-white p-2`} style={{ gridTemplateColumns: `repeat(${totalSteps}, 1fr)` }}>
        {steps.map((label, idx) => (
          <button
            key={label}
            type="button"
            onClick={() => setStep(idx + 1)}
            className={`rounded-lg px-3 py-2 text-xs font-semibold ${
              step === idx + 1 ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            {idx + 1}. {label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : null}

        {/* ── STEP 1: Course Info ── */}
        {section === "info" ? (
          <div className="space-y-5">
            {/* Title (bilingual) */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-slate-500">Title (English) <span className="text-red-500">*</span></label>
                <input required className={`mt-1 ${inputClass}`} placeholder="Course title in English" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500">العنوان (عربي)</label>
                <input dir="rtl" className={`mt-1 ${inputClass}`} placeholder="عنوان الدورة بالعربية" value={form.title_ar} onChange={(e) => setForm((f) => ({ ...f, title_ar: e.target.value }))} />
              </div>
            </div>

            {/* Short description (bilingual) */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-slate-500">Short description (EN) <span className="text-red-500">*</span></label>
                <textarea required rows={2} className={`mt-1 ${inputClass}`} value={form.short_description} onChange={(e) => setForm((f) => ({ ...f, short_description: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500">الوصف المختصر (عربي)</label>
                <textarea dir="rtl" rows={2} className={`mt-1 ${inputClass}`} value={form.short_description_ar} onChange={(e) => setForm((f) => ({ ...f, short_description_ar: e.target.value }))} />
              </div>
            </div>

            {/* Full description (bilingual) */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-slate-500">Full description (EN) <span className="text-red-500">*</span></label>
                <textarea required rows={4} className={`mt-1 ${inputClass}`} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500">الوصف الكامل (عربي)</label>
                <textarea dir="rtl" rows={4} className={`mt-1 ${inputClass}`} value={form.description_ar} onChange={(e) => setForm((f) => ({ ...f, description_ar: e.target.value }))} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-slate-500">Instructor <span className="text-red-500">*</span></label>
                <input required className={`mt-1 ${inputClass}`} value={form.instructor_name} onChange={(e) => setForm((f) => ({ ...f, instructor_name: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500">Category <span className="text-red-500">*</span></label>
                <select className={`mt-1 ${inputClass}`} value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                  <option>Programming</option><option>Cybersecurity</option><option>Cloud</option><option>AI</option><option>Data Science</option><option>Mobile Development</option><option>Networks</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500">Level</label>
                <select className={`mt-1 ${inputClass}`} value={form.level} onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))}>
                  <option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500">Duration (hours)</label>
                <input type="number" min={0} className={`mt-1 ${inputClass}`} value={form.duration_hours} onChange={(e) => setForm((f) => ({ ...f, duration_hours: e.target.value }))} />
              </div>
            </div>
          </div>
        ) : null}

        {/* ── STEP 2 (live): Schedule ── */}
        {section === "schedule" ? (
          <div className="space-y-5">
            <div className="flex items-center gap-2 rounded-xl border border-teal-100 bg-teal-50 px-4 py-3">
              <Calendar className="h-5 w-5 shrink-0 text-teal-600" />
              <p className="text-sm text-teal-800">
                Define the recurring schedule for this live course. Students will receive these details with the Zoom link after purchase.
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-500">Zoom link <span className="text-red-500">*</span></label>
              <input
                type="url"
                required={form.is_live_course}
                className={`mt-1 ${inputClass}`}
                placeholder="https://zoom.us/j/..."
                value={form.zoom_link}
                onChange={(e) => setForm((f) => ({ ...f, zoom_link: e.target.value }))}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-500">Total number of sessions</label>
              <input type="number" min={1} className={`mt-1 w-40 ${inputClass}`} value={sessionCount} onChange={(e) => setSessionCount(e.target.value)} />
            </div>

            <div className="space-y-3">
              <label className="text-xs font-medium text-slate-500">Session schedule (repeating weekly)</label>
              {sessions.map((session, idx) => (
                <div key={idx} className="grid items-center gap-2 rounded-xl border border-slate-100 p-3 sm:grid-cols-4">
                  <select
                    className={inputClass}
                    value={session.day}
                    onChange={(e) => setSessions((prev) => prev.map((s, i) => i === idx ? { ...s, day: e.target.value } : s))}
                  >
                    {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                  <input
                    type="time"
                    className={inputClass}
                    value={session.start_time}
                    onChange={(e) => setSessions((prev) => prev.map((s, i) => i === idx ? { ...s, start_time: e.target.value } : s))}
                  />
                  <input
                    type="time"
                    className={inputClass}
                    value={session.end_time}
                    onChange={(e) => setSessions((prev) => prev.map((s, i) => i === idx ? { ...s, end_time: e.target.value } : s))}
                  />
                  <button
                    type="button"
                    onClick={() => setSessions((prev) => prev.filter((_, i) => i !== idx))}
                    className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                    disabled={sessions.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setSessions((prev) => [...prev, { day: "Monday", start_time: "18:00", end_time: "20:00" }])}
                className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                <Plus className="h-4 w-4" /> Add day
              </button>
            </div>

            {/* ── Reminder emails ── */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={sendReminders}
                  onChange={(e) => setSendReminders(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 accent-blue-600"
                />
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-blue-600 shrink-0" />
                  <span className="text-sm font-medium text-slate-800">
                    Send automatic reminder emails before each session
                  </span>
                </div>
              </label>

              {sendReminders && (
                <div className="ml-7 space-y-3">
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-medium text-slate-500 shrink-0">Remind students</label>
                    <div className="flex gap-3">
                      {(["12", "24", "48"] as const).map((h) => (
                        <label key={h} className="flex cursor-pointer items-center gap-1.5 text-sm">
                          <input
                            type="radio"
                            name="reminder_hours"
                            checked={reminderHours === h}
                            onChange={() => setReminderHours(h)}
                            className="accent-blue-600"
                          />
                          {h}h before
                        </label>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">
                    Enrolled students will receive an email with the Zoom link and session details before each session.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : null}

        {/* ── STEP 2 (e-learning): Content ── */}
        {section === "content" ? (
          <div className="space-y-4">
            {modules.map((module, mIdx) => (
              <div key={mIdx} className="rounded-xl border border-slate-200 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <input className={inputClass} value={module.title} placeholder={`Module ${mIdx + 1} title *`} onChange={(e) => setModules((prev) => prev.map((m, i) => i === mIdx ? { ...m, title: e.target.value } : m))} />
                  <button type="button" onClick={() => setModules((prev) => prev.filter((_, i) => i !== mIdx))} className="rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                </div>
                <div className="space-y-3">
                  {module.lessons.map((lesson, lIdx) => (
                    <div key={lIdx} className="grid gap-2 rounded-lg border border-slate-100 p-3 sm:grid-cols-12">
                      <input className={`sm:col-span-4 ${inputClass}`} placeholder="Lesson title *" value={lesson.title} onChange={(e) => setModules((prev) => prev.map((m, i) => i === mIdx ? { ...m, lessons: m.lessons.map((l, j) => j === lIdx ? { ...l, title: e.target.value } : l) } : m))} />
                      <input className={`sm:col-span-6 ${inputClass}`} placeholder="Video URL (YouTube) *" value={lesson.video_url} onChange={(e) => setModules((prev) => prev.map((m, i) => i === mIdx ? { ...m, lessons: m.lessons.map((l, j) => j === lIdx ? { ...l, video_url: e.target.value } : l) } : m))} />
                      <input type="number" min={0} className={`sm:col-span-2 ${inputClass}`} placeholder="Min" value={lesson.duration_minutes} onChange={(e) => setModules((prev) => prev.map((m, i) => i === mIdx ? { ...m, lessons: m.lessons.map((l, j) => j === lIdx ? { ...l, duration_minutes: e.target.value } : l) } : m))} />
                    </div>
                  ))}
                </div>
                <button type="button" onClick={() => setModules((prev) => prev.map((m, i) => i === mIdx ? { ...m, lessons: [...m.lessons, { title: "", video_url: "", duration_minutes: "10" }] } : m))} className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800">
                  <Plus className="h-4 w-4" /> Add lesson
                </button>
              </div>
            ))}
            <button type="button" onClick={addModule} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              <Plus className="h-4 w-4" /> Add module
            </button>
          </div>
        ) : null}

        {/* ── STEP 3 (e-learning): Tests ── */}
        {section === "tests" ? (
          <div className="space-y-4">
            {quizzes.map((quiz, qIdx) => (
              <div key={qIdx} className="rounded-xl border border-slate-200 p-4">
                <div className="grid gap-3 sm:grid-cols-4">
                  <input className={inputClass} placeholder="Quiz title *" value={quiz.title} onChange={(e) => setQuizzes((prev) => prev.map((q, i) => i === qIdx ? { ...q, title: e.target.value } : q))} />
                  <select className={inputClass} value={quiz.scope} onChange={(e) => setQuizzes((prev) => prev.map((q, i) => i === qIdx ? { ...q, scope: e.target.value as "module" | "final" } : q))}>
                    <option value="module">Module Quiz</option>
                    <option value="final">Final Quiz</option>
                  </select>
                  {quiz.scope === "module" ? (
                    <select className={inputClass} value={quiz.module_index} onChange={(e) => setQuizzes((prev) => prev.map((q, i) => i === qIdx ? { ...q, module_index: Number(e.target.value) || 0 } : q))}>
                      {modules.map((m, mIdx) => (
                        <option key={mIdx} value={mIdx}>{m.title || `Module ${mIdx + 1}`}</option>
                      ))}
                    </select>
                  ) : (
                    <input className={inputClass} value="Final Quiz" readOnly />
                  )}
                  <input type="number" min={0} className={inputClass} placeholder="Passing score" value={quiz.passing_score} onChange={(e) => setQuizzes((prev) => prev.map((q, i) => i === qIdx ? { ...q, passing_score: e.target.value } : q))} />
                  <button type="button" onClick={() => setQuizzes((prev) => prev.filter((_, i) => i !== qIdx))} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50">Remove quiz</button>
                </div>

                <div className="mt-3 space-y-3">
                  {quiz.questions.map((question, questionIdx) => (
                    <div key={questionIdx} className="rounded-lg border border-slate-100 p-3">
                      <div className="grid gap-2 sm:grid-cols-3">
                        <input className={`sm:col-span-2 ${inputClass}`} placeholder="Question *" value={question.question_text} onChange={(e) => setQuizzes((prev) => prev.map((q, i) => i === qIdx ? { ...q, questions: q.questions.map((qq, j) => j === questionIdx ? { ...qq, question_text: e.target.value } : qq) } : q))} />
                        <select className={inputClass} value={question.question_type} onChange={(e) => setQuizzes((prev) => prev.map((q, i) => i === qIdx ? { ...q, questions: q.questions.map((qq, j) => j === questionIdx ? { ...qq, question_type: e.target.value as "multiple_choice" | "true_false" | "text", options: e.target.value === "multiple_choice" ? ["", "", "", ""] : e.target.value === "true_false" ? ["True", "False"] : [], correct_index: 0 } : qq) } : q))}>
                          <option value="multiple_choice">Multiple choice</option>
                          <option value="true_false">True/False</option>
                          <option value="text">Text input</option>
                        </select>
                      </div>
                      {question.question_type === "multiple_choice" ? (
                        <div className="mt-2 grid gap-2 sm:grid-cols-2">
                          {question.options.map((option, optionIdx) => (
                            <label key={optionIdx} className="flex items-center gap-2">
                              <input type="radio" name={`q-${qIdx}-${questionIdx}`} checked={question.correct_index === optionIdx} onChange={() => setQuizzes((prev) => prev.map((q, i) => i === qIdx ? { ...q, questions: q.questions.map((qq, j) => j === questionIdx ? { ...qq, correct_index: optionIdx } : qq) } : q))} />
                              <input className={`flex-1 ${inputClass}`} placeholder={`Option ${optionIdx + 1} *`} value={option} onChange={(e) => setQuizzes((prev) => prev.map((q, i) => i === qIdx ? { ...q, questions: q.questions.map((qq, j) => j === questionIdx ? { ...qq, options: qq.options.map((o, k) => k === optionIdx ? e.target.value : o) } : qq) } : q))} />
                            </label>
                          ))}
                        </div>
                      ) : null}
                      {question.question_type === "true_false" ? (
                        <div className="mt-2 flex gap-4 text-sm">
                          {["True", "False"].map((label, idx) => (
                            <label key={label} className="inline-flex items-center gap-2">
                              <input type="radio" name={`q-${qIdx}-${questionIdx}`} checked={question.correct_index === idx} onChange={() => setQuizzes((prev) => prev.map((q, i) => i === qIdx ? { ...q, questions: q.questions.map((qq, j) => j === questionIdx ? { ...qq, correct_index: idx } : qq) } : q))} />
                              {label}
                            </label>
                          ))}
                        </div>
                      ) : null}
                      <div className="mt-2">
                        <button type="button" onClick={() => setQuizzes((prev) => prev.map((q, i) => i === qIdx ? { ...q, questions: q.questions.filter((_, j) => j !== questionIdx) } : q))} className="text-xs font-medium text-red-600 hover:text-red-700">Remove question</button>
                      </div>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={() => addQuestion(qIdx)} className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800">
                  <Plus className="h-4 w-4" /> Add question
                </button>
              </div>
            ))}
            <button type="button" onClick={addQuiz} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              <Plus className="h-4 w-4" /> Add quiz
            </button>
          </div>
        ) : null}

        {/* ── Last step: Settings ── */}
        {section === "settings" ? (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-slate-500">Status</label>
                <select className={`mt-1 ${inputClass}`} value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500">Price (SAR)</label>
                <input type="number" min={0} step="0.01" className={`mt-1 ${inputClass}`} value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
              </div>
            </div>
            {/* Thumbnail — URL or file upload */}
            <div>
              <label className="text-xs font-medium text-slate-500">Course thumbnail</label>
              <div className="mt-1 flex gap-2">
                <button
                  type="button"
                  onClick={() => setThumbMode("url")}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition ${thumbMode === "url" ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                >
                  <Link2 className="h-3.5 w-3.5" /> URL
                </button>
                <button
                  type="button"
                  onClick={() => setThumbMode("upload")}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition ${thumbMode === "upload" ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                >
                  <Upload className="h-3.5 w-3.5" /> Upload
                </button>
              </div>

              {thumbMode === "url" ? (
                <input
                  className={`mt-2 ${inputClass}`}
                  value={form.thumbnail}
                  onChange={(e) => setForm((f) => ({ ...f, thumbnail: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                />
              ) : (
                <div className="mt-2">
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 transition hover:border-blue-300 hover:bg-blue-50/40">
                    {thumbUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600 shrink-0" />
                    ) : (
                      <Upload className="h-4 w-4 text-slate-400 shrink-0" />
                    )}
                    <span className="text-sm text-slate-600">
                      {thumbUploading ? "Uploading…" : form.thumbnail ? "Replace image" : "Click to upload an image"}
                    </span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      className="hidden"
                      disabled={thumbUploading}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setThumbUploading(true);
                        try {
                          const fd = new FormData();
                          fd.append("file", file);
                          const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
                          const data = await res.json();
                          if (res.ok && data.url) setForm((f) => ({ ...f, thumbnail: data.url }));
                        } catch {}
                        finally { setThumbUploading(false); e.target.value = ""; }
                      }}
                    />
                  </label>
                  {form.thumbnail && (
                    <div className="mt-2 flex items-center gap-3">
                      <img src={form.thumbnail} alt="Preview" className="h-16 w-24 rounded-lg object-cover border border-slate-200" />
                      <span className="text-xs text-slate-500 truncate flex-1">{form.thumbnail}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            {form.is_live_course && (
              <div>
                <label className="text-xs font-medium text-slate-500">WhatsApp group link (optional)</label>
                <input
                  type="url"
                  className={`mt-1 ${inputClass}`}
                  value={form.whatsapp_link}
                  onChange={(e) => setForm((f) => ({ ...f, whatsapp_link: e.target.value }))}
                  placeholder="https://chat.whatsapp.com/..."
                />
                <p className="mt-1 text-[10px] text-slate-400">If provided, this link will be included in enrollment and reminder emails.</p>
              </div>
            )}
          </div>
        ) : null}

        <div className="flex items-center justify-between border-t border-slate-100 pt-6">
          <button type="button" onClick={() => setStep((s) => Math.max(1, s - 1))} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50" disabled={step === 1}>
            <ChevronLeft className="h-4 w-4" /> Previous
          </button>

          {step < totalSteps ? (
            <button
              type="button"
              onClick={() => {
                const err = validateCurrentStep();
                if (err) { setError(err); return; }
                setError("");
                setStep((s) => Math.min(totalSteps, s + 1));
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button disabled={loading} type="submit" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Create course
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
