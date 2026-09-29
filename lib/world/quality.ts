import { useCallback, useEffect, useMemo, useState } from "react"

export type QualityTier = "low" | "medium" | "high"

export interface TierSettings {
  effects: "off" | "basic" | "full"
  shadowMapSize: number
  /** Half-width of the sun's shadow box, in world units. */
  shadowExtent: number
  /** Whether the avatar gets a contact shadow under its feet. */
  contactShadow: boolean
  terrainSegments: [number, number]
  dustCount: number
  /** Fraction of decorative props to draw. */
  decorDensity: number
  /** How far along the trail props are drawn, in world units. */
  decorRadius: number
  dprCap: number
}

/**
 * What each tier actually costs, in one table.
 *
 * `dprCap` is the biggest single lever here: it squares. Dropping the cap from
 * 2 to 1.75 is a 23% cut in fragments shaded for every pass - the sky, the
 * terrain, the shadow receive, and every post-processing pass - and at this
 * flat-shaded art level it is very close to invisible.
 *
 * `shadowExtent` came down from a fixed 70 when the shadow camera started
 * following the avatar (see SunRig): a smaller box over the same map is
 * sharper as well as cheaper, so this is not a quality trade at all.
 */
export const TIERS: Record<QualityTier, TierSettings> = {
  low: {
    effects: "off",
    shadowMapSize: 1024,
    shadowExtent: 26,
    contactShadow: false,
    terrainSegments: [60, 70],
    dustCount: 0,
    decorDensity: 0.5,
    decorRadius: 55,
    dprCap: 1.25,
  },
  medium: {
    effects: "basic",
    shadowMapSize: 1536,
    shadowExtent: 30,
    contactShadow: true,
    terrainSegments: [110, 125],
    dustCount: 90,
    decorDensity: 0.85,
    decorRadius: 80,
    dprCap: 1.5,
  },
  high: {
    effects: "full",
    shadowMapSize: 2048,
    shadowExtent: 32,
    contactShadow: true,
    terrainSegments: [160, 180],
    dustCount: 220,
    decorDensity: 1,
    decorRadius: 110,
    dprCap: 1.75,
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

/**
 * Renderer strings that indicate a discrete GPU, or an Apple Silicon GPU,
 * which is the positive evidence `high` now requires.
 *
 * Integrated Intel parts (HD/UHD/Iris) are deliberately absent: they are the
 * machines this detection was getting wrong. A 1440p window on an integrated
 * laptop used to be handed a 2048 shadow map, dpr 2, 300 dust motes, full
 * decor and 4x multisampled post-processing purely because the window was
 * wide - and `PerformanceMonitor` could only walk that back one tier at a
 * time, after the visitor had already seen it stutter.
 */
const STRONG_GPU = /\b(nvidia|geforce|rtx|gtx|radeon|rx\s?\d{3,4}|apple m[1-9])\b/i

function detectTier(): QualityTier {
  if (typeof window === "undefined") return "medium"

  const width = window.innerWidth

  let renderer = ""
  try {
    const canvas = document.createElement("canvas")
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl")
    const info = gl?.getExtension("WEBGL_debug_renderer_info")
    if (gl && info) renderer = String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL))
  } catch {
    // Blocked by privacy settings; the conservative default below applies.
  }

  if (WEAK_GPU.test(renderer)) return "low"
  // A phone-sized viewport is a phone-sized budget regardless of the GPU.
  if (width < 700) return "low"
  // `high` must be earned. Anything unrecognised - including a renderer string
  // the browser refused to hand over - lands on medium and stays there, which
  // is a world that runs rather than one that has to be walked back.
  if (width >= 1200 && STRONG_GPU.test(renderer)) return "high"
  return "medium"
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
  // The tier the device was detected at. Never steps down - it is what the
  // rebuild-expensive knobs below stay pinned to.
  const [detectedTier, setDetectedTier] = useState<QualityTier>("medium")

  useEffect(() => {
    const detected = detectTier()
    setDetectedTier(detected)
    setTier(detected)
  }, [])

  const stepDown = useCallback(() => {
    setTier(stepDownTier)
  }, [])

  // The two knobs that cannot be moved without a rebuild are fixed at the tier
  // the device was detected at, and a later step-down leaves them alone.
  //
  // `terrainSegments` regenerates up to ~29k segments of displaced geometry on
  // the main thread, and `shadowMapSize` reallocates the shadow render target.
  // Both used to move on a step-down, which meant the world's response to
  // "frames are being dropped" was to stall outright - at the exact moment it
  // could least afford to. Terrain tessellation is a load-time build and a
  // single draw call either way, so pinning it costs almost nothing per frame.
  //
  // `dpr` stays adjustable because it is the one lever that squares, and
  // changing it resizes targets rather than rebuilding geometry.
  const settings = useMemo<TierSettings>(
    () => ({
      ...TIERS[tier],
      terrainSegments: TIERS[detectedTier].terrainSegments,
      shadowMapSize: TIERS[detectedTier].shadowMapSize,
    }),
    [tier, detectedTier],
  )

  return { tier, settings, stepDown }
}

// Reachable from the console in development, so a walkthrough can confirm
// which tier a given machine actually landed on.
if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
  Object.assign(window as unknown as Record<string, unknown>, { __detectTier: detectTier })
}
