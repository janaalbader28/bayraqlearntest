"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { AdminAddLogModal } from "@/components/admin/AdminAddLogModal";

type LogRow = {
  id: number;
  action: string;
  resource: string | null;
  details: string | null;
  created_at: string;
  username: string | null;
};

const COURSE_ACTIONS = new Set(["CREATE_COURSE", "UPDATE_COURSE", "DELETE_COURSE"]);

export function AdminLogsClient({ logs }: { logs: LogRow[] }) {
  const { t, isRTL } = useLanguage();
  const al = t.adminLogs;
  const [activeTab, setActiveTab] = useState<"course" | "admin">("course");

  const courseLogs = logs.filter((l) => COURSE_ACTIONS.has(l.action));
  const adminLogs = logs.filter((l) => !COURSE_ACTIONS.has(l.action));
  const visibleLogs = activeTab === "course" ? courseLogs : adminLogs;

  return (
    <div className="mx-auto max-w-7xl pb-12" dir={isRTL ? "rtl" : "ltr"}>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-900">{al.title}</h1>
          <p className="mt-1 text-sm text-slate-600">{al.subtitle}</p>
        </div>
        <AdminAddLogModal />
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("course")}
          className={[
            "rounded-lg px-5 py-2 text-sm font-semibold transition",
            activeTab === "course"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700",
          ].join(" ")}
        >
          Course Logs
          <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">
            {courseLogs.length}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("admin")}
          className={[
            "rounded-lg px-5 py-2 text-sm font-semibold transition",
            activeTab === "admin"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700",
          ].join(" ")}
        >
          Admin Logs
          <span className="ml-2 rounded-full bg-slate-200 px-2 py-0.5 text-xs font-bold text-slate-600">
            {adminLogs.length}
          </span>
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <ul className="divide-y divide-slate-100">
          {visibleLogs.length === 0 ? (
            <li className="px-6 py-12 text-center text-sm text-slate-500">{al.noLogs}</li>
          ) : (
            visibleLogs.map((log) => (
              <li key={log.id} className="px-6 py-4 hover:bg-slate-50/50">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-semibold text-slate-900">{log.action}</span>
                  <span className="text-xs text-slate-400 tabular-nums">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  {log.username || al.system}
                  {log.resource ? ` · ${log.resource}` : ""}
                </p>
                {log.details ? <p className="mt-1 text-xs text-slate-500">{log.details}</p> : null}
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
