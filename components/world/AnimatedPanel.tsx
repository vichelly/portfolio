"use client"

import { useEffect, useState } from "react"
import { Html } from "@react-three/drei"
import type { Waypoint } from "@/lib/world/journey"

interface AnimatedPanelProps {
  waypoint: Waypoint | null
  isActive: boolean
}

/**
 * A 3D-positioned animated panel that fades in/out as the avatar progresses
 * through waypoints along the guided journey path.
 */
export default function AnimatedPanel({ waypoint, isActive }: AnimatedPanelProps) {
  const [opacity, setOpacity] = useState(0)
  const [scale, setScale] = useState(0.8)

  useEffect(() => {
    if (isActive && waypoint) {
      // Fade in + scale animation
      const timer = setTimeout(() => {
        setOpacity(1)
        setScale(1)
      }, 50)
      return () => clearTimeout(timer)
    } else {
      // Fade out + scale down
      setOpacity(0)
      setScale(0.8)
    }
  }, [isActive, waypoint])

  if (!waypoint) return null

  return (
    <Html position={waypoint.position} distanceFactor={1.5} occlude={false}>
      <div
        className="transition-all duration-500 ease-out pointer-events-auto"
        style={{
          opacity: isActive ? 1 : 0,
          transform: `scale(${isActive ? 1 : 0.9})`,
        }}
      >
        {/* Holographic panel background */}
        <div
          className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-300/50 rounded-lg backdrop-blur-md shadow-2xl p-6 max-w-sm"
          style={{
            background: "radial-gradient(circle at top-left, rgba(59,130,246,0.2), rgba(139,92,246,0.1))",
            boxShadow: "0 0 20px rgba(59,130,246,0.3), inset 0 0 20px rgba(255,255,255,0.1)",
            border: "1px solid rgba(59,130,246,0.5)",
          }}
        >
          {/* Glowing accent */}
          <div
            className="absolute inset-0 rounded-lg pointer-events-none"
            style={{
              background:
                "linear-gradient(45deg, rgba(59,130,246,0.1), transparent 50%, rgba(139,92,246,0.05))",
              animation: "shimmer 3s infinite",
            }}
          />

          {/* Content */}
          <div className="relative z-10">
            <h3 className="text-xl font-bold text-white mb-2 drop-shadow-lg">{waypoint.title}</h3>
            {waypoint.description && (
              <p className="text-sm text-blue-100 leading-relaxed drop-shadow-md">{waypoint.description}</p>
            )}

            {/* Progress indicator */}
            <div className="mt-4 text-xs text-blue-300 font-mono">
              ▶ Continue walking to discover more
            </div>
          </div>
        </div>

        {/* Floating animation keyframes */}
        <style>{`
          @keyframes shimmer {
            0%, 100% { transform: translateX(-100%); }
            50% { transform: translateX(100%); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
        `}</style>
      </div>
    </Html>
  )
}
