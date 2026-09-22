"use client"

import { useRef, useState } from "react"

interface VirtualJoystickProps {
  onChange: (x: number, y: number) => void
}

const MAX_RADIUS = 42

export default function VirtualJoystick({ onChange }: VirtualJoystickProps) {
  const baseRef = useRef<HTMLDivElement>(null)
  const [knob, setKnob] = useState({ x: 0, y: 0 })
  const activeTouchId = useRef<number | null>(null)

  const handleStart = (clientX: number, clientY: number, id: number) => {
    activeTouchId.current = id
    updateFromPoint(clientX, clientY)
  }

  const updateFromPoint = (clientX: number, clientY: number) => {
    const base = baseRef.current
    if (!base) return
    const rect = base.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    let dx = clientX - centerX
    let dy = clientY - centerY
    const dist = Math.hypot(dx, dy)
    if (dist > MAX_RADIUS) {
      dx = (dx / dist) * MAX_RADIUS
      dy = (dy / dist) * MAX_RADIUS
    }
    setKnob({ x: dx, y: dy })
    onChange(dx / MAX_RADIUS, dy / MAX_RADIUS)
  }

  const handleEnd = () => {
    activeTouchId.current = null
    setKnob({ x: 0, y: 0 })
    onChange(0, 0)
  }

  return (
    <div
      ref={baseRef}
      role="presentation"
      aria-hidden="true"
      className="relative h-28 w-28 rounded-full bg-black/20 backdrop-blur-sm border border-white/30 touch-none select-none"
      onTouchStart={(e) => {
        const t = e.changedTouches[0]
        handleStart(t.clientX, t.clientY, t.identifier)
      }}
      onTouchMove={(e) => {
        for (const t of Array.from(e.changedTouches)) {
          if (t.identifier === activeTouchId.current) {
            updateFromPoint(t.clientX, t.clientY)
          }
        }
      }}
      onTouchEnd={(e) => {
        for (const t of Array.from(e.changedTouches)) {
          if (t.identifier === activeTouchId.current) handleEnd()
        }
      }}
      onTouchCancel={handleEnd}
    >
      <div
        className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/80 shadow-lg"
        style={{ transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))` }}
      />
    </div>
  )
}
