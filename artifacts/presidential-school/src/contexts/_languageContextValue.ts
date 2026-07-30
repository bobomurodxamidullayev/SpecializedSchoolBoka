import { createContext } from "react";
import type { Language } from "@/data/translations";

export type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (path: string) => string;
  tRaw: (path: string) => unknown;
};

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);
