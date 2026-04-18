"use client";

import Link from "next/link";
import { Plus, Pencil, BookOpen, BadgeCheck, TrendingUp, Bell, Loader2 } from "lucide-react";
import { useState } from "react";
import { AdminDeleteCourseButton } from "@/components/admin/AdminDeleteCourseButton";
import { CourseApplyStatus } from "@/components/course/CourseApplyStatus";
import { useLanguage } from "@/contexts/LanguageContext";

type CourseRow = {
  id: number;
  title: string;
  category: string;
  level: string;
  status: string;
  is_live_course: boolean;
};

export function AdminCoursesListClient({
  courses,
  totalCourses,
  openCourses,
  mostEnrolledTitle,
  mostEnrolledCount,
}: {
  courses: CourseRow[];
  totalCourses: number;
  openCourses: number;
  mostEnrolledTitle: string | null;
  mostEnrolledCount: number;
}) {
  const { t, isRTL } = useLanguage();
  const ac = t.adminCoursesList;
  const [sendingId, setSendingId] = useState<number | null>(null);
  const [reminderMsg, setReminderMsg] = useState<{ id: number; msg: string } | null>(null);

  async function handleSendReminders(courseId: number) {
    setSendingId(courseId);
    setReminderMsg(null);
    try {
      const res = await fetch(`/api/admin/courses/${courseId}/send-reminders`, { method: "POST" });
      const data = await res.json();
      setReminderMsg({ id: courseId, msg: data.message ?? (res.ok ? "Sent!" : "Failed.") });
    } catch {
      setReminderMsg({ id: courseId, msg: "Network error." });
    } finally {
      setSendingId(null);
    }
  }

  const levelLabel = (level: string) => {
    switch (level.toLowerCase()) {
      case "beginner": return t.courses.levelBeginner;
      case "intermediate": return t.courses.levelIntermediate;
      case "advanced": return t.courses.levelAdvanced;
      default: return level.charAt(0).toUpperCase() + level.slice(1);
    }
  };

  const statCards = [
    { label: ac.totalCourses, val: `+${totalCourses.toLocaleString()}`, icon: BookOpen },
    { label: ac.openCourses, val: `+${openCourses.toLocaleString()}`, icon: BadgeCheck },
    {
      label: ac.topEnrollment,
      val: `+${mostEnrolledCount.toLocaleString()}`,
      sub: mostEnrolledTitle ?? ac.noCourses,
      icon: TrendingUp,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl pb-12" dir={isRTL ? "rtl" : "ltr"}>
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-900">{ac.title}</h1>
          <p className="mt-1 text-sm text-slate-600">{ac.subtitle}</p>
        </div>
        <Link
          href="/dashboard/admin/courses/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          {ac.addCourse}
        </Link>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {statCards.map((stat) => (
          <div key={stat.label} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm transition hover:border-blue-100 hover:shadow-md">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600/10">
              <stat.icon style={{ width: 18, height: 18 }} className="text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="font-heading text-xl font-bold leading-none text-slate-900">{stat.val}</p>
              <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-slate-500">{stat.label}</p>
              {"sub" in stat && stat.sub ? (
                <p className="mt-0.5 truncate text-xs text-slate-400">{stat.sub}</p>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className={`w-full min-w-[720px] border-collapse text-sm ${isRTL ? "text-right" : "text-left"}`}>
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="px-4 py-3 font-semibold text-slate-700">{ac.colTitle}</th>
                <th className="px-4 py-3 font-semibold text-slate-700">{ac.colCategory}</th>
                <th className="px-4 py-3 font-semibold text-slate-700">{ac.colLevel}</th>
                <th className="px-4 py-3 font-semibold text-slate-700">{ac.colStatus}</th>
                <th className={`px-4 py-3 font-semibold text-slate-700 ${isRTL ? "text-left" : "text-right"}`}>{ac.colActions}</th>
              </tr>
            </thead>
            <tbody>
              {courses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-16 text-center text-slate-500">{ac.noCourses}</td>
                </tr>
              ) : (
                courses.map((course) => (
                  <tr key={course.id} className="border-b border-slate-100 transition hover:bg-slate-50/80">
                    <td className="px-4 py-4 font-medium text-slate-900">{course.title}</td>
                    <td className="px-4 py-4 text-slate-600">{course.category}</td>
                    <td className="px-4 py-4 text-slate-600">{levelLabel(course.level)}</td>
                    <td className="px-4 py-4"><CourseApplyStatus status={course.status} /></td>
                    <td className="px-4 py-4">
                      <div className={`flex flex-wrap gap-1 ${isRTL ? "justify-start" : "justify-end"}`}>
                        {course.is_live_course && (
                          <div className="flex flex-col items-end gap-0.5">
                            <button
                              onClick={() => handleSendReminders(course.id)}
                              disabled={sendingId === course.id}
                              className="inline-flex items-center gap-1 rounded-lg p-2 text-teal-600 transition hover:bg-teal-50 disabled:opacity-50"
                              title="Send reminder emails to enrolled students"
                            >
                              {sendingId === course.id
                                ? <Loader2 className="h-4 w-4 animate-spin" />
                                : <Bell className="h-4 w-4" />}
                            </button>
                            {reminderMsg?.id === course.id && (
                              <span className="text-[10px] text-teal-700 max-w-[120px] text-right">{reminderMsg.msg}</span>
                            )}
                          </div>
                        )}
                        <Link href={`/dashboard/admin/courses/${course.id}/edit`} className="inline-flex items-center gap-1 rounded-lg p-2 text-blue-600 transition hover:bg-blue-50" title="Edit">
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <AdminDeleteCourseButton courseId={course.id} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
