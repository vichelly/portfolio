import * as THREE from "three"
import type { StationId } from "@/lib/world/trail"

/**
 * One palette for the whole world, grounded on a single direction: dawn in a
 * valley. A low sun, a sky graded from warm haze to cool zenith, warm sand and
 * stone, vegetation reading as dark silhouette.
 *
 * Every surface, light and interface accent draws from here. Nothing in the
 * scene specifies a colour of its own.
 */
export const PALETTE = {
  // --- sky, bottom to top -------------------------------------------
  skyHaze: "#f2c98f",
  skyWarm: "#e8a066",
  skyMid: "#8fb4d4",
  skyZenith: "#3d6b96",

  // --- the sun -------------------------------------------------------
  sun: "#ffd9a0",
  sunDisc: "#fff3dc",

  // --- ground --------------------------------------------------------
  terrainHigh: "#b9a066",
  terrainLow: "#5d7350",
  terrainShade: "#3f5138",

  // --- the path ------------------------------------------------------
  trail: "#e4c99b",
  trailEdge: "#b1906a",
  plaza: "#eed9b0",

  // --- stone ---------------------------------------------------------
  stone: "#a29280",
  stoneDark: "#6b5f52",

  // --- panels and type -----------------------------------------------
  panel: "#161d26",
  panelEdge: "#59d3c4",
  panelGlow: "#7ee8da",
  text: "#f6f2ea",
  textMuted: "#c3b9a8",
  ink: "#120f0c",
} as const

/** Direction the sun sits in - low, so shadows run long across the trail. */
export const SUN_ELEVATION = THREE.MathUtils.degToRad(24)
export const SUN_AZIMUTH = THREE.MathUtils.degToRad(38)
export const SUN_DISTANCE = 120

/** The one sun vector: the light, the sky's disc and the shadow camera share it. */
export const SUN_DIRECTION = new THREE.Vector3(
  Math.cos(SUN_ELEVATION) * Math.sin(SUN_AZIMUTH),
  Math.sin(SUN_ELEVATION),
  Math.cos(SUN_ELEVATION) * Math.cos(SUN_AZIMUTH),
)

export const SUN_POSITION = SUN_DIRECTION.clone().multiplyScalar(SUN_DISTANCE)

/** Per-station accent, re-tuned to sit against warm ground rather than green. */
export const STATION_ACCENT: Record<StationId, string> = {
  intro: "#4fd1c0",
  "itau-rpa": "#ff8a3d",
  "itau-intern": "#ffab6e",
  "agile-inc": "#7fa6f0",
  fei: "#8ecf6a",
  fiap: "#b78ef0",
  certifications: "#f5c451",
  contact: "#f57a8a",
}

/** Marker colour for the optional detour - deliberately outside the station set. */
export const DETOUR_ACCENT = "#f2e04e"
