"use client"

import { useEffect, useMemo, useRef } from "react"
import { X } from "lucide-react"
import InfoPanel from "@/components/world/InfoPanel"
import { stationListFor } from "@/lib/world/stations"
import { useWorldStore } from "@/lib/world-store"
import { UI } from "@/lib/i18n/strings"
import { t } from "@/lib/i18n/locale"
import { PALETTE, STATION_ACCENT } from "@/lib/world/theme"

interface FallbackMenuProps {
  open: boolean
  onClose: () => void
}

/**
 * Every station's content as a plain document, in the same order as the trail.
 * Built from the same `STATIONS` data the world is built from, so the two
 * cannot drift apart: anything standing on the trail is listed here, and
 * nothing here is missing from the trail.
 */
export default function FallbackMenu({ open, onClose }: FallbackMenuProps) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const locale = useWorldStore((s) => s.locale)
  const stations = useMemo(() => stationListFor(locale), [locale])

  useEffect(() => {
    if (!open) return
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{ background: PALETTE.ink }}
      role="dialog"
      aria-modal="true"
      aria-label={t(UI.fallbackTitle, locale)}
    >
      <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
        <div className="mb-10 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
              {t(UI.fallbackKicker, locale)}
            </p>
            <h1 className="mt-2 text-3xl font-bold text-white">Vitor Lucas Fujita Felício</h1>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/80 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            aria-label={t(UI.fallbackClose, locale)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {stations.map((station) => (
          <section key={station.id} className="mb-12">
            <div className="mb-5">
              <h2 className="text-xl font-bold text-white">{station.label}</h2>
              <p className="text-sm" style={{ color: STATION_ACCENT[station.id] }}>
                {station.kicker}
              </p>
            </div>
            <div className="space-y-4">
              {station.entries.map((entry) => (
                <InfoPanel key={entry.id} entry={entry} accent={STATION_ACCENT[station.id]} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
