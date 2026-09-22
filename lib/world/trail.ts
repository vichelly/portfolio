import * as THREE from "three"

export type StationId =
  | "intro"
  | "itau-rpa"
  | "itau-intern"
  | "agile-inc"
  | "fei"
  | "fiap"
  | "certifications"
  | "contact"

export interface StationAnchor {
  id: StationId
  /** XZ position of the station's plaza center. */
  point: [number, number]
}

/**
 * The stations in narrative order. This array IS the order the visitor meets
 * the content in - there is no other ordering anywhere in the app.
 */
export const STATION_ANCHORS: StationAnchor[] = [
  { id: "intro", point: [0, 4] },
  { id: "itau-rpa", point: [0, -16] },
  { id: "itau-intern", point: [-7, -34] },
  { id: "agile-inc", point: [7, -52] },
  { id: "fei", point: [0, -70] },
  { id: "fiap", point: [-7, -88] },
  { id: "certifications", point: [7, -106] },
  { id: "contact", point: [0, -124] },
]

/** Corridor half width between plazas - narrow enough to read as guided. */
export const CORRIDOR_HALF_WIDTH = 4.2
/** Plaza radius around a station anchor - room to stand and read. */
export const PLAZA_RADIUS = 9

const SAMPLE_COUNT = 480

function buildCurve(points: [number, number][]) {
  return new THREE.CatmullRomCurve3(
    points.map(([x, z]) => new THREE.Vector3(x, 0, z)),
    false,
    "centripetal",
    0.5,
  )
}

/** Lead-in before the first station and lead-out after the last, so the curve
 *  does not kink at its endpoints where the visitor actually stands. */
export const TRAIL_CURVE = buildCurve([
  [0, 16],
  ...STATION_ANCHORS.map((s) => s.point),
  [0, -140],
])

export const TRAIL_LENGTH = TRAIL_CURVE.getLength()

/** The parkour detour: branches off the main trail between FEI and FIAP. The
 *  arena end point is kept > DETOUR_ARENA_RADIUS away from every plaza anchor
 *  (fiap and certifications in particular, the two closest) - the arena's
 *  containment radius otherwise reaches into a neighbouring plaza and the
 *  world reports "Parkour detour" while the avatar is standing at a station. */
export const DETOUR_CURVE = buildCurve([
  [1.5, -79],
  [11, -79.5],
  [21, -84],
  [27, -88],
  [32, -90],
])

export const DETOUR_LENGTH = DETOUR_CURVE.getLength()
export const DETOUR_HALF_WIDTH = 5
/** Open area at the end of the detour where the course itself sits. It has to
 *  cover the whole course, or containment would clamp the visitor off it. */
export const DETOUR_ARENA_RADIUS = 26

export interface TrailProjection {
  /** Arc-length position along the curve, normalized 0..1. */
  t: number
  /** Signed distance from the centerline; positive is to the curve's left. */
  lateral: number
  /** Closest point on the centerline, in world XZ (y is always 0). */
  closest: THREE.Vector3
  /** Unit tangent at `t` - the "forward" direction of the trail here. */
  tangent: THREE.Vector3
}

interface SampledCurve {
  curve: THREE.CatmullRomCurve3
  samples: THREE.Vector3[]
  length: number
}

function sample(curve: THREE.CatmullRomCurve3, length: number): SampledCurve {
  return { curve, samples: curve.getSpacedPoints(SAMPLE_COUNT), length }
}

const TRAIL = sample(TRAIL_CURVE, TRAIL_LENGTH)
const DETOUR = sample(DETOUR_CURVE, DETOUR_LENGTH)

// Scratch vectors - projection runs every frame and must not allocate.
const _p = new THREE.Vector3()
const _seg = new THREE.Vector3()
const _toP = new THREE.Vector3()

/**
 * Nearest point on a sampled curve. Scans the sample table for the closest
 * sample, then refines against the two adjacent segments so the result is
 * exact rather than quantized to the sample spacing.
 */
function project(sampled: SampledCurve, x: number, z: number): TrailProjection {
  const { samples, curve } = sampled
  _p.set(x, 0, z)

  let bestIndex = 0
  let bestDistSq = Infinity
  for (let i = 0; i < samples.length; i++) {
    const s = samples[i]
    const dx = x - s.x
    const dz = z - s.z
    const d = dx * dx + dz * dz
    if (d < bestDistSq) {
      bestDistSq = d
      bestIndex = i
    }
  }

  // Refine against the segments on either side of the nearest sample.
  let bestT = bestIndex / (samples.length - 1)
  let refinedDistSq = Infinity
  const closest = new THREE.Vector3()
  for (const i of [bestIndex - 1, bestIndex]) {
    if (i < 0 || i + 1 >= samples.length) continue
    const a = samples[i]
    const b = samples[i + 1]
    _seg.subVectors(b, a)
    const segLenSq = _seg.lengthSq()
    if (segLenSq === 0) continue
    _toP.subVectors(_p, a)
    const u = THREE.MathUtils.clamp(_toP.dot(_seg) / segLenSq, 0, 1)
    const px = a.x + _seg.x * u
    const pz = a.z + _seg.z * u
    const dx = x - px
    const dz = z - pz
    const d = dx * dx + dz * dz
    if (d < refinedDistSq) {
      refinedDistSq = d
      closest.set(px, 0, pz)
      bestT = (i + u) / (samples.length - 1)
    }
  }

  const t = THREE.MathUtils.clamp(bestT, 0, 1)
  const tangent = curve.getTangentAt(t).setY(0).normalize()

  // Signed lateral offset: positive to the tangent's left in the XZ plane.
  const leftX = tangent.z
  const leftZ = -tangent.x
  const lateral = (x - closest.x) * leftX + (z - closest.z) * leftZ

  return { t, lateral, closest, tangent }
}

export function projectToTrail(x: number, z: number): TrailProjection {
  return project(TRAIL, x, z)
}

export function projectToDetour(x: number, z: number): TrailProjection {
  return project(DETOUR, x, z)
}

/** Arc-length `t` of each station, derived from the curve rather than authored. */
export const STATION_T: Record<StationId, number> = Object.fromEntries(
  STATION_ANCHORS.map((s) => [s.id, projectToTrail(s.point[0], s.point[1]).t]),
) as Record<StationId, number>

/**
 * Half width of the walkable trail at `t`: the corridor, widened into a
 * circular plaza wherever a station sits. Taking the max of the corridor and
 * every plaza's circular profile means plazas blend into the path instead of
 * stepping out from it.
 */
export function halfWidth(t: number): number {
  let w = CORRIDOR_HALF_WIDTH
  for (const station of STATION_ANCHORS) {
    const along = Math.abs(t - STATION_T[station.id]) * TRAIL_LENGTH
    if (along >= PLAZA_RADIUS) continue
    // Circular plaza: half width falls off as the chord of a circle.
    const plaza = Math.sqrt(PLAZA_RADIUS * PLAZA_RADIUS - along * along)
    if (plaza > w) w = plaza
  }
  return w
}

/** Half width of the detour: a corridor opening into the course arena. */
export function detourHalfWidth(t: number): number {
  const along = Math.abs(t - 1) * DETOUR_LENGTH
  if (along >= DETOUR_ARENA_RADIUS) return DETOUR_HALF_WIDTH
  const arena = Math.sqrt(DETOUR_ARENA_RADIUS * DETOUR_ARENA_RADIUS - along * along)
  return Math.max(DETOUR_HALF_WIDTH, arena)
}

export type Containment = "trail" | "detour"

export interface ClampResult {
  x: number
  z: number
  projection: TrailProjection
  /** True when the position had to be pushed back onto the path. */
  clamped: boolean
}

function clampTo(
  projection: TrailProjection,
  x: number,
  z: number,
  limit: number,
): ClampResult {
  const over = Math.abs(projection.lateral) - limit
  if (over <= 0) return { x, z, projection, clamped: false }

  const leftX = projection.tangent.z
  const leftZ = -projection.tangent.x
  const sign = Math.sign(projection.lateral) || 1
  return {
    x: projection.closest.x + leftX * limit * sign,
    z: projection.closest.z + leftZ * limit * sign,
    projection,
    clamped: true,
  }
}

export function clampToTrail(x: number, z: number): ClampResult {
  const projection = projectToTrail(x, z)
  return clampTo(projection, x, z, halfWidth(projection.t))
}

export function clampToDetour(x: number, z: number): ClampResult {
  const projection = projectToDetour(x, z)
  return clampTo(projection, x, z, detourHalfWidth(projection.t))
}

export function clampFor(containment: Containment, x: number, z: number): ClampResult {
  return containment === "detour" ? clampToDetour(x, z) : clampToTrail(x, z)
}

/**
 * Entrance band thresholds, expressed in the detour's own arc-length `t`.
 * The exit threshold sits below the entry threshold, so the band the visitor
 * must cross to leave is wider than the one that let them in - standing still
 * anywhere inside it cannot flip the owner back and forth.
 */
const DETOUR_ENTER_T = 0.1
const DETOUR_EXIT_T = 0.03

/** Which curve should own lateral containment for this position. */
export function containmentFor(current: Containment, x: number, z: number): Containment {
  const detour = projectToDetour(x, z)
  if (current === "trail") {
    const inside = Math.abs(detour.lateral) < detourHalfWidth(detour.t)
    return inside && detour.t > DETOUR_ENTER_T ? "detour" : "trail"
  }
  return detour.t < DETOUR_EXIT_T ? "trail" : "detour"
}

/** World position where the detour leaves the main trail - used for signage. */
export const DETOUR_ENTRANCE = DETOUR_CURVE.getPointAt(0)

/** Where the detour meets the main trail, in main-trail `t`. */
export const DETOUR_BRANCH_T = projectToTrail(DETOUR_ENTRANCE.x, DETOUR_ENTRANCE.z).t

/** The station whose content should currently be shown, or null between stations. */
export function activeStationAt(t: number): StationId | null {
  let best: StationId | null = null
  let bestAlong = Infinity
  for (const station of STATION_ANCHORS) {
    const along = Math.abs(t - STATION_T[station.id]) * TRAIL_LENGTH
    if (along < PLAZA_RADIUS && along < bestAlong) {
      bestAlong = along
      best = station.id
    }
  }
  return best
}

/** 0..1 how fully a station's content should be shown, by distance along the curve. */
export function stationPresence(t: number, id: StationId): number {
  const along = Math.abs(t - STATION_T[id]) * TRAIL_LENGTH
  if (along >= PLAZA_RADIUS) return 0
  // Fully present in the inner half of the plaza, fading out toward its edge.
  return THREE.MathUtils.clamp(1 - (along - PLAZA_RADIUS * 0.45) / (PLAZA_RADIUS * 0.55), 0, 1)
}

/** Stations close enough to `t` to be worth having in the scene graph at all. */
export function stationsInMountWindow(t: number, windowUnits = PLAZA_RADIUS * 3.5): StationId[] {
  return STATION_ANCHORS.filter(
    (s) => Math.abs(t - STATION_T[s.id]) * TRAIL_LENGTH <= windowUnits,
  ).map((s) => s.id)
}

/** Ground height of the world surface. The trail is flat; the parkour course
 *  supplies its own solids through the collision resolver. */
export const GROUND_Y = 0

export const TRAIL_START = TRAIL_CURVE.getPointAt(STATION_T.intro)
