export type Locale = "pt" | "en"

export const LOCALES: Locale[] = ["pt", "en"]

/** A string that exists in both languages. */
export interface Localized {
  pt: string
  en: string
}

export function t(value: Localized, locale: Locale): string {
  return value[locale]
}

export const LOCALE_LABEL: Record<Locale, string> = { pt: "PT", en: "EN" }
export const LOCALE_NAME: Record<Locale, string> = { pt: "Português", en: "English" }

export const STORAGE_KEY = "portfolio-locale"

/** The visitor's language, from their last choice or their browser. */
export function detectLocale(): Locale {
  if (typeof window === "undefined") return "pt"
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (saved === "pt" || saved === "en") return saved
  } catch {
    // Private browsing and blocked site data both land here; fall through to
    // the browser's own language rather than failing.
  }
  return navigator.language?.toLowerCase().startsWith("pt") ? "pt" : "en"
}
