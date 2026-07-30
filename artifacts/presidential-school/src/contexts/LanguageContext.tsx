import { useState, useEffect, ReactNode } from "react";
import { translations, Language } from "@/data/translations";
import { LanguageContext } from "@/contexts/_languageContextValue";

export { LanguageContext } from "@/contexts/_languageContextValue";

function resolve(lang: Language, path: string): unknown {
  const keys = path.split(".");
  let current: unknown = translations[lang];
  for (const key of keys) {
    if (current == null || typeof current !== "object" || !(key in (current as object))) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("uz");

  useEffect(() => {
    const saved = localStorage.getItem("app_lang") as Language;
    if (saved && translations[saved]) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("app_lang", lang);
  };

  const tRaw = (path: string): unknown => {
    const value = resolve(language, path);
    if (value !== undefined) return value;
    return resolve("en", path);
  };

  const t = (path: string): string => {
    const value = tRaw(path);
    return typeof value === "string" ? value : path;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, tRaw }}>
      {children}
    </LanguageContext.Provider>
  );
}
