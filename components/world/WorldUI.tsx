"use client"

import { useState } from "react"
import { ListChecks } from "lucide-react"
import { useWorldStore } from "@/lib/world-store"
import { ZONES } from "@/lib/world/layout"
import VirtualJoystick from "@/components/world/VirtualJoystick"
import InfoPanel from "@/components/world/InfoPanel"
import FallbackMenu from "@/components/world/FallbackMenu"
import { ALL_PANELS } from "@/lib/world/panelContent"

interface WorldUIProps {
  setTouchVector: (x: number, y: number) => void
  setTouchJump: (jump: boolean) => void
}

export default function WorldUI({ setTouchVector, setTouchJump }: WorldUIProps) {
  const activeRoom = useWorldStore((s) => s.activeRoom)
  const inputMode = useWorldStore((s) => s.inputMode)
  const openPanelId = useWorldStore((s) => s.openPanelId)
  const closePanel = useWorldStore((s) => s.closePanel)
  const fallbackOpen = useWorldStore((s) => s.fallbackOpen)
  const openFallback = useWorldStore((s) => s.openFallback)
  const closeFallback = useWorldStore((s) => s.closeFallback)

  const [jumpPressed, setJumpPressed] = useState(false)
  const jumpEnabled = activeRoom === "parkour"

  const zoneLabel = ZONES.find((z) => z.id === activeRoom)?.label ?? "Hub"
  const panel = openPanelId ? ALL_PANELS[openPanelId] ?? null : null

  return (
    <>
      {/* Persistent, keyboard-focusable skip control - reachable in one tab/click, independent of 3D control */}
      <button
        type="button"
        onClick={openFallback}
        className="fixed top-4 right-4 z-30 inline-flex items-center gap-2 rounded-full bg-card/90 backdrop-blur border border-border px-4 py-2.5 text-sm font-medium shadow-lg min-h-11"
      >
        <ListChecks className="h-4 w-4" />
        Skip to info
      </button>

      {/* Current zone label */}
      <div className="fixed top-4 left-4 z-30 rounded-full bg-card/80 backdrop-blur border border-border px-4 py-2 text-sm font-medium shadow">
        {zoneLabel}
      </div>

      {inputMode === "touch" && (
        <div className="fixed bottom-6 left-6 z-30">
          <VirtualJoystick onChange={setTouchVector} />
        </div>
      )}

      {inputMode === "touch" && jumpEnabled && (
        <button
          type="button"
          onTouchStart={(e) => {
            e.preventDefault()
            setJumpPressed(true)
            setTouchJump(true)
          }}
          onTouchEnd={(e) => {
            e.preventDefault()
            setJumpPressed(false)
            setTouchJump(false)
          }}
          className="fixed bottom-10 right-6 z-30 h-16 w-16 rounded-full bg-primary text-primary-foreground font-bold shadow-lg active:scale-95 touch-none select-none"
          style={{ opacity: jumpPressed ? 0.8 : 1 }}
        >
          Jump
        </button>
      )}

      <InfoPanel content={panel} onClose={closePanel} />
      <FallbackMenu open={fallbackOpen} onClose={closeFallback} />
    </>
  )
}
