"use client"

import { useEffect, useMemo } from "react"
import { Languages, ListTree } from "lucide-react"
import { useWorldStore } from "@/lib/world-store"
import { stationsFor } from "@/lib/world/stations"
import { UI } from "@/lib/i18n/strings"
import { LOCALE_LABEL, detectLocale, t } from "@/lib/i18n/locale"
import { STATION_ANCHORS, STATION_T } from "@/lib/world/trail"
import { PALETTE, STATION_ACCENT } from "@/lib/world/theme"
import VirtualJoystick from "@/components/world/VirtualJoystick"
import FallbackMenu from "@/components/world/FallbackMenu"

interface WorldUIProps {
  setTouchVector: (x: number, y: number) => void
  setTouchJump: (jump: boolean) => void
}

export default function WorldUI({ setTouchVector, setTouchJump }: WorldUIProps) {
  const inputMode = useWorldStore((s) => s.inputMode)
  const activeStationId = useWorldStore((s) => s.activeStationId)
  const progressPercent = useWorldStore((s) => s.progressPercent)
  const containment = useWorldStore((s) => s.containment)
  const fallbackOpen = useWorldStore((s) => s.fallbackOpen)
  const locale = useWorldStore((s) => s.locale)
  const setLocale = useWorldStore((s) => s.setLocale)
  const toggleLocale = useWorldStore((s) => s.toggleLocale)
  const openFallback = useWorldStore((s) => s.openFallback)
  const closeFallback = useWorldStore((s) => s.closeFallback)

  // Applied after hydration so the server's markup and the first client render
  // agree; the visitor's remembered choice wins from then on.
  useEffect(() => {
    setLocale(detectLocale())
  }, [setLocale])

  const stations = useMemo(() => stationsFor(locale), [locale])
  const station = activeStationId ? stations[activeStationId] : null
  const accent = activeStationId ? STATION_ACCENT[activeStationId] : PALETTE.panelEdge
  const here =
    containment === "detour"
      ? t(UI.parkourDetour, locale)
      : station
        ? station.label
        : t(UI.onTheTrail, locale)

  return (
    <>
      {/* Progress rail: where the visitor is along the whole walk. */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-30 px-3 pt-3">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <div
            className="pointer-events-auto flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold text-white backdrop-blur"
            style={{ background: "rgba(11,26,36,0.72)", boxShadow: `inset 0 0 0 1px ${accent}55` }}
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ background: accent, boxShadow: `0 0 10px ${accent}` }}
            />
            <span className="truncate" data-hud="here">{here}</span>
          </div>

          <div
            className="relative h-2 flex-1 overflow-hidden rounded-full"
            style={{ background: "rgba(11,26,36,0.55)" }}
            data-hud="progress"
            data-percent={progressPercent}
          >
            <div
              className="h-full rounded-full transition-[width] duration-300 ease-out"
              style={{ width: `${progressPercent}%`, background: accent }}
            />
            {/* Station ticks, so the remaining stops are legible at a glance */}
            {STATION_ANCHORS.map((anchor) => (
              <span
                key={anchor.id}
                className="absolute top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full"
                style={{
                  // Ticks sit at each station's real position along the trail,
                  // so the rail measures the walk rather than approximating it.
                  left: `calc(${STATION_T[anchor.id] * 100}% - 3px)`,
                  background: "rgba(255,255,255,0.55)",
                }}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={toggleLocale}
            aria-label={t(UI.switchLanguage, locale)}
            className="pointer-events-auto inline-flex min-h-11 min-w-11 shrink-0 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-white/90 backdrop-blur hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            style={{ background: "rgba(11,26,36,0.72)" }}
          >
            <Languages className="h-4 w-4" />
            {LOCALE_LABEL[locale]}
          </button>

          <button
            type="button"
            onClick={openFallback}
            className="pointer-events-auto inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full px-3 text-sm font-medium text-white/90 backdrop-blur hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:px-4"
            style={{ background: "rgba(11,26,36,0.72)" }}
          >
            <ListTree className="h-4 w-4" />
            <span className="hidden sm:inline">{t(UI.readAsText, locale)}</span>
          </button>
        </div>
      </div>

      {/* Keyboard hint, desktop only, fades out of the way visually */}
      {inputMode === "keyboard" && (
        <p className="pointer-events-none fixed bottom-4 left-1/2 z-30 -translate-x-1/2 rounded-full px-4 py-2 text-xs text-white/70 backdrop-blur"
          style={{ background: "rgba(11,26,36,0.5)" }}
        >
          {t(UI.keyboardHint, locale)}
        </p>
      )}

      {inputMode === "touch" && (
        <>
          <div className="fixed bottom-6 left-5 z-30">
            <VirtualJoystick onChange={setTouchVector} />
          </div>
          {/* Jump is available everywhere, so its control is too. */}
          <button
            type="button"
            aria-label={t(UI.jump, locale)}
            onTouchStart={(e) => {
              e.preventDefault()
              setTouchJump(true)
            }}
            onTouchEnd={(e) => {
              e.preventDefault()
              setTouchJump(false)
            }}
            className="fixed bottom-8 right-5 z-30 h-20 w-20 touch-none select-none rounded-full text-base font-bold text-[#0b1a24] shadow-lg active:scale-95"
            style={{ background: PALETTE.panelEdge }}
          >
            {t(UI.jump, locale)}
          </button>
        </>
      )}

      <FallbackMenu open={fallbackOpen} onClose={closeFallback} />
    </>
  )
}
