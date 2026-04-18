"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { type Lang, translations, type T } from "@/lib/i18n";

type LanguageCtx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: T;
  isRTL: boolean;
};

const LanguageContext = createContext<LanguageCtx>({
  lang: "en",
  setLang: () => {},
  t: translations.en,
  isRTL: false,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  // Restore from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("bayraq-lang") as Lang | null;
    if (stored === "ar" || stored === "en") setLangState(stored);
  }, []);

  // Apply dir + lang attrs whenever language changes
  useEffect(() => {
    const html = document.documentElement;
    html.lang = lang;
    html.dir = lang === "ar" ? "rtl" : "ltr";
    localStorage.setItem("bayraq-lang", lang);
  }, [lang]);

  return (
    <LanguageContext.Provider
      value={{ lang, setLang: setLangState, t: translations[lang], isRTL: lang === "ar" }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
