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
 * through waypoints along the guided journey path. Features holographic styling,
 * shimmer animations, and smooth transitions for immersive discovery.
 */
export default function AnimatedPanel({ waypoint, isActive }: AnimatedPanelProps) {
  const [opacity, setOpacity] = useState(0)
  const [scale, setScale] = useState(0.8)
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    if (isActive && waypoint) {
      setOpacity(1)
      setScale(1)
      const contentTimer = setTimeout(() => setShowContent(true), 100)
      return () => clearTimeout(contentTimer)
    } else {
      setOpacity(0)
      setScale(0.8)
      setShowContent(false)
    }
  }, [isActive, waypoint])

  if (!waypoint) return null

  return (
    <Html position={waypoint.position} distanceFactor={1.5} occlude={false}>
      <div className="pointer-events-none">
        {/* Outer glow layer */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: isActive ? 0.6 : 0,
            transform: `scale(${isActive ? 1.15 : 1})`,
            transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          <div
            className="absolute inset-0 rounded-lg"
            style={{
              background:
                "radial-gradient(circle at center, rgba(45,212,191,0.3), rgba(59,130,246,0.1))",
              filter: "blur(12px)",
              boxShadow:
                "0 0 40px rgba(45,212,191,0.4), 0 0 80px rgba(59,130,246,0.2)",
            }}
          />
        </div>

        {/* Main panel */}
        <div
          className="relative transition-all duration-500 ease-out"
          style={{
            opacity: isActive ? 1 : 0,
            transform: `scale(${isActive ? 1 : 0.9}) translateY(${isActive ? 0 : -20}px)`,
            pointerEvents: isActive ? "auto" : "none",
          }}
        >
          <div
            className="relative rounded-xl overflow-hidden backdrop-blur-xl p-6 min-w-sm max-w-sm shadow-2xl"
            style={{
              background:
                "linear-gradient(135deg, rgba(20,184,184,0.15) 0%, rgba(59,130,246,0.1) 50%, rgba(139,92,246,0.12) 100%)",
              border: "1.5px solid rgba(45,212,191,0.4)",
              boxShadow: `
                0 0 30px rgba(45,212,191,0.3),
                inset 0 1px 0 rgba(255,255,255,0.2),
                inset 0 -1px 0 rgba(0,0,0,0.1)
              `,
            }}
          >
            {/* Animated shimmer overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)",
                animation: isActive ? "shimmerSlide 3s ease-in-out infinite" : "none",
              }}
            />

            {/* Corner accent lights */}
            <div
              className="absolute top-0 right-0 w-20 h-20 pointer-events-none"
              style={{
                background: "radial-gradient(circle, rgba(45,212,191,0.2) 0%, transparent 70%)",
                filter: "blur(8px)",
              }}
            />
            <div
              className="absolute bottom-0 left-0 w-24 h-24 pointer-events-none"
              style={{
                background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)",
                filter: "blur(8px)",
              }}
            />

            {/* Content */}
            <div className="relative z-10">
              <div
                className="transition-all duration-700 ease-out"
                style={{
                  opacity: showContent ? 1 : 0,
                  transform: showContent ? "translateY(0)" : "translateY(8px)",
                }}
              >
                <h3 className="text-lg font-bold text-cyan-100 mb-2 drop-shadow-lg">
                  {waypoint.title}
                </h3>
                {waypoint.description && (
                  <p className="text-sm text-cyan-50/90 leading-relaxed drop-shadow-md">
                    {waypoint.description}
                  </p>
                )}
              </div>

              {/* Progress indicator */}
              <div
                className="mt-4 text-xs font-mono transition-all duration-700 ease-out"
                style={{
                  color: "rgba(45,212,191,0.7)",
                  opacity: showContent ? 1 : 0,
                  transform: showContent ? "translateY(0)" : "translateY(8px)",
                  transitionDelay: showContent ? "100ms" : "0ms",
                }}
              >
                ✦ Continue walking to discover more ✦
              </div>
            </div>
          </div>
        </div>

        {/* Animations */}
        <style>{`
          @keyframes shimmerSlide {
            0%, 100% {
              transform: translateX(-100%);
              opacity: 0;
            }
            50% {
              opacity: 1;
            }
          }

          @keyframes pulse-glow {
            0%, 100% {
              box-shadow: 0 0 20px rgba(45,212,191,0.3);
            }
            50% {
              box-shadow: 0 0 40px rgba(45,212,191,0.5), 0 0 60px rgba(59,130,246,0.3);
            }
          }
        `}</style>
      </div>
    </Html>
  )
}
