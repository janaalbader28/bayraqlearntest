"use client";

import { useLanguage } from "@/contexts/LanguageContext";

export function AdminSettingsClient({
  username,
  email,
  role,
  memberSince,
  lastLogin,
}: {
  username: string;
  email: string;
  role: string;
  memberSince: string;
  lastLogin: string | null;
}) {
  const { t, lang, isRTL } = useLanguage();
  const as = t.adminSettings;

  const formattedMemberSince = new Date(memberSince).toLocaleDateString(
    lang === "ar" ? "ar-SA" : "en-US",
    { dateStyle: "long" }
  );

  const formattedLastLogin = lastLogin
    ? new Date(lastLogin).toLocaleString(lang === "ar" ? "ar-SA" : "en-US")
    : "—";

  return (
    <div className="mx-auto max-w-2xl pb-12" dir={isRTL ? "rtl" : "ltr"}>
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-900">{as.title}</h1>
        <p className="mt-1 text-sm text-slate-600">{as.subtitle}</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <dl className="space-y-4 text-sm">
          {[
            { label: as.username, value: username },
            { label: as.email, value: email },
            { label: as.role, value: role },
            { label: as.memberSince, value: formattedMemberSince },
            { label: as.lastLogin, value: formattedLastLogin },
          ].map((row) => (
            <div key={row.label}>
              <dt className="text-xs font-medium text-slate-500">{row.label}</dt>
              <dd className="mt-0.5 font-medium text-slate-900">{row.value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 text-xs text-slate-500">{as.extendNote}</p>
      </div>
    </div>
  );
}
