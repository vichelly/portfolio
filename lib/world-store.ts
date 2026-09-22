import { create } from "zustand"
import type { Containment, StationId } from "@/lib/world/trail"
import { STORAGE_KEY, type Locale } from "@/lib/i18n/locale"

export type InputMode = "keyboard" | "touch"

interface WorldState {
  /** Display language. Chosen by the visitor, remembered on this device. */
  locale: Locale
  setLocale: (locale: Locale) => void
  toggleLocale: () => void

  /** Which curve owns lateral containment - the main trail or the detour. */
  containment: Containment
  setContainment: (containment: Containment) => void

  /** Published by the controller only when it changes, for the DOM HUD. */
  activeStationId: StationId | null
  setActiveStationId: (id: StationId | null) => void

  /** Trail progress as a whole percent, so the HUD updates ~100 times total. */
  progressPercent: number
  setProgressPercent: (percent: number) => void

  inputMode: InputMode
  setInputMode: (mode: InputMode) => void

  fallbackOpen: boolean
  openFallback: () => void
  closeFallback: () => void
}

export const useWorldStore = create<WorldState>((set, get) => ({
  // Server and first client render must agree, so this starts fixed and the
  // visitor's real preference is applied in an effect after hydration.
  locale: "pt",
  setLocale: (locale) => {
    set({ locale })
    try {
      window.localStorage.setItem(STORAGE_KEY, locale)
    } catch {
      // Blocked site data just means the choice lasts for this visit only.
    }
  },
  toggleLocale: () => get().setLocale(get().locale === "pt" ? "en" : "pt"),

  containment: "trail",
  setContainment: (containment) => set({ containment }),

  activeStationId: null,
  setActiveStationId: (activeStationId) => set({ activeStationId }),

  progressPercent: 0,
  setProgressPercent: (progressPercent) => set({ progressPercent }),

  inputMode: "keyboard",
  setInputMode: (mode) => set({ inputMode: mode }),

  fallbackOpen: false,
  openFallback: () => set({ fallbackOpen: true }),
  closeFallback: () => set({ fallbackOpen: false }),
}))
