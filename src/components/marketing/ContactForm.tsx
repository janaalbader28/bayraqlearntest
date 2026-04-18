"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const { t } = useLanguage();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">{t.contact.nameLabel}</span>
          <input
            name="name"
            type="text"
            required
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none ring-blue-500/0 transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
            placeholder={t.contact.namePlaceholder}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">{t.contact.emailLabel}</span>
          <input
            name="email"
            type="email"
            required
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
            placeholder={t.contact.emailPlaceholder}
          />
        </label>
      </div>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-slate-700">{t.contact.messageLabel}</span>
        <textarea
          name="message"
          required
          rows={4}
          className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
          placeholder={t.contact.messagePlaceholder}
        />
      </label>
      <button
        type="submit"
        className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 sm:w-auto sm:px-8"
      >
        {t.contact.sendButton}
      </button>
      {sent && (
        <p className="text-sm text-emerald-600" role="status">
          {t.contact.successMessage}
        </p>
      )}
    </form>
  );
}
