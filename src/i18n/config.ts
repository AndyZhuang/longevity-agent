import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "./locales/en.json";
import zh from "./locales/zh.json";
import fr from "./locales/fr.json";
import es from "./locales/es.json";
import pt from "./locales/pt.json";

export const SUPPORTED_LANGUAGES = ["en", "zh", "fr", "es", "pt"] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

export const LANGUAGE_LABELS: Record<Language, { native: string; english: string; flag: string }> = {
  en: { native: "English", english: "English", flag: "EN" },
  zh: { native: "中文", english: "Chinese", flag: "ZH" },
  fr: { native: "Français", english: "French", flag: "FR" },
  es: { native: "Español", english: "Spanish", flag: "ES" },
  pt: { native: "Português", english: "Portuguese", flag: "PT" },
};

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      zh: { translation: zh },
      fr: { translation: fr },
      es: { translation: es },
      pt: { translation: pt },
    },
    supportedLngs: SUPPORTED_LANGUAGES as unknown as string[],
    fallbackLng: "en",
    detection: {
      order: ["path", "localStorage", "navigator", "htmlTag"],
      lookupFromPathIndex: 0,
      caches: ["localStorage"],
    },
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });

export default i18n;

/** Read the current language from the URL path, e.g. "/zh/tracks" -> "zh" */
export function getLangFromPath(pathname: string): Language {
  const seg = pathname.split("/").filter(Boolean)[0];
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(seg)
    ? (seg as Language)
    : "en";
}

/** Build a path with a (possibly different) language prefix. */
export function withLang(pathname: string, lang: Language): string {
  const cleaned = "/" + pathname.split("/").filter(Boolean).join("/");
  const seg = cleaned.split("/").filter(Boolean)[0];
  if ((SUPPORTED_LANGUAGES as readonly string[]).includes(seg)) {
    return "/" + lang + cleaned.slice(("/" + seg).length);
  }
  return lang === "en" ? cleaned : "/" + lang + cleaned;
}
