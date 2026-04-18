"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { Users, UserPlus } from "lucide-react";

type UserRow = { id: number; username: string; email: string; role: string; created_at: string };

export function AdminUsersClient({
  users,
  totalUsers,
  newUsersThisMonth,
}: {
  users: UserRow[];
  totalUsers: number;
  newUsersThisMonth: number;
}) {
  const { t, lang, isRTL } = useLanguage();
  const au = t.adminUsers;

  const statCards = [
    { label: au.totalUsers, value: `+${totalUsers.toLocaleString()}`, icon: Users },
    { label: au.newThisMonth, value: `+${newUsersThisMonth.toLocaleString()}`, icon: UserPlus },
  ];

  return (
    <div className="mx-auto max-w-7xl pb-12" dir={isRTL ? "rtl" : "ltr"}>
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-900">{au.title}</h1>
        <p className="mt-1 text-sm text-slate-600">{au.subtitle}</p>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        {statCards.map((s) => (
          <div key={s.label} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm transition hover:border-blue-100 hover:shadow-md">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600/10">
              <s.icon style={{ width: 18, height: 18 }} className="text-blue-600" />
            </div>
            <div>
              <p className="font-heading text-xl font-bold leading-none text-slate-900">{s.value}</p>
              <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className={`w-full min-w-[600px] border-collapse text-sm ${isRTL ? "text-right" : "text-left"}`}>
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="px-4 py-3 font-semibold text-slate-700">{au.colName}</th>
                <th className="px-4 py-3 font-semibold text-slate-700">{au.colEmail}</th>
                <th className="px-4 py-3 font-semibold text-slate-700">{au.colRole}</th>
                <th className="px-4 py-3 font-semibold text-slate-700">{au.colJoined}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50/80">
                  <td className="px-4 py-4 font-medium text-slate-900">{u.username}</td>
                  <td className="px-4 py-4 text-slate-600">{u.email}</td>
                  <td className="px-4 py-4 text-slate-600">{u.role}</td>
                  <td className="px-4 py-4 text-slate-600 tabular-nums">
                    {new Date(u.created_at).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US", { dateStyle: "medium" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
