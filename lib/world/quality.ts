import { useCallback, useEffect, useState } from "react"

export type QualityTier = "low" | "medium" | "high"

export interface TierSettings {
  effects: "off" | "basic" | "full"
  shadowMapSize: number
  terrainSegments: [number, number]
  dustCount: number
  /** Fraction of decorative props to draw. */
  decorDensity: number
  dprCap: number
}

export const TIERS: Record<QualityTier, TierSettings> = {
  low: {
    effects: "off",
    shadowMapSize: 1024,
    terrainSegments: [60, 70],
    dustCount: 0,
    decorDensity: 0.5,
    dprCap: 1.5,
  },
  medium: {
    effects: "basic",
    shadowMapSize: 2048,
    terrainSegments: [120, 135],
    dustCount: 120,
    decorDensity: 1,
    dprCap: 2,
  },
  high: {
    effects: "full",
    shadowMapSize: 2048,
    terrainSegments: [160, 180],
    dustCount: 300,
    decorDensity: 1,
    dprCap: 2,
  },
}

const ORDER: QualityTier[] = ["low", "medium", "high"]

/** One tier cheaper, or the same tier when already at the floor. */
export function stepDownTier(tier: QualityTier): QualityTier {
  const index = ORDER.indexOf(tier)
  return index <= 0 ? tier : ORDER[index - 1]
}

/** Renderer strings that reliably mean "software or very weak GPU". */
const WEAK_GPU = /swiftshader|llvmpipe|software|basic render|microsoft basic/i

function detectTier(): QualityTier {
  if (typeof window === "undefined") return "medium"

  const width = window.innerWidth
  const dpr = window.devicePixelRatio || 1

  let renderer = ""
  try {
    const canvas = document.createElement("canvas")
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl")
    const info = gl?.getExtension("WEBGL_debug_renderer_info")
    if (gl && info) renderer = String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL))
  } catch {
    // Blocked by privacy settings; fall back to the size heuristic alone.
  }

  if (WEAK_GPU.test(renderer)) return "low"
  if (width < 700) return "low"
  if (width < 1200 || dpr > 2.5) return "medium"
  return "high"
}

/**
 * The world's quality tier. Chosen from the device, then allowed to step DOWN
 * if the frame rate cannot hold - never up, so it cannot oscillate between two
 * tiers whose costs straddle the target.
 *
 * Every tier renders the same world with the same content; only fidelity moves.
 */
export function useQualityTier() {
  // Server and first client render must agree; detection runs after mount.
  const [tier, setTier] = useState<QualityTier>("medium")

  useEffect(() => {
    setTier(detectTier())
  }, [])

  const stepDown = useCallback(() => {
    setTier(stepDownTier)
  }, [])

  return { tier, settings: TIERS[tier], stepDown }
}
