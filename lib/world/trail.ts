import * as THREE from "three"

export type StationId =
  | "intro"
  | "itau-rpa"
  | "itau-rpa-2"
  | "itau-intern"
  | "agile-inc"
  | "agile-inc-2"
  | "fei"
  | "fiap"
  | "certifications"
  | "certifications-2"
  | "contact"

export interface StationAnchor {
  id: StationId
  /** XZ position of the station's plaza center. */
  point: [number, number]
}

/**
 * The stations in narrative order. This array IS the order the visitor meets
 * the content in - there is no other ordering anywhere in the app.
 *
 * Three zones are walked as a pair of plazas rather than one. That is not a
 * layout preference: on a 360px-wide screen a panel has to be read from far
 * enough back that its type falls under the 16px floor unless the panel stops
 * being scaled down, and a panel stops being scaled down only when it carries
 * less. `itau-rpa`, `agile-inc` and `certifications` are the three that could
 * not be made to fit, so each continues onto a second plaza - which is the
 * remedy `career-content-discovery` names for exactly this case.
 *
 * Spacing and the alternating lateral offset are unchanged; the trail is
 * simply longer.
 */
export const STATION_ANCHORS: StationAnchor[] = [
  { id: "intro", point: [0, 4] },
  { id: "itau-rpa", point: [0, -16] },
  { id: "itau-rpa-2", point: [-7, -34] },
  { id: "itau-intern", point: [7, -52] },
  { id: "agile-inc", point: [0, -70] },
  { id: "agile-inc-2", point: [-7, -88] },
  { id: "fei", point: [7, -106] },
  { id: "fiap", point: [0, -124] },
  { id: "certifications", point: [-7, -142] },
  { id: "certifications-2", point: [7, -160] },
  { id: "contact", point: [0, -178] },
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
  [0, -194],
])

export const TRAIL_LENGTH = TRAIL_CURVE.getLength()

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

// Scratch vectors - projection runs every frame and must not allocate.
const _p = new THREE.Vector3()
const _seg = new THREE.Vector3()
const _toP = new THREE.Vector3()
// The returned `closest` too. Every consumer reads it within the call that
// produced it, so one vector is enough and the per-frame allocation the
// comment above asks for is actually avoided rather than only intended.
const _closest = new THREE.Vector3()
const _tangent = new THREE.Vector3()

/**
 * How many samples either side of the hint the tracked search looks at.
 *
 * The avatar moves at most `MAX_SPEED` (6.5) times the capped frame step
 * (1/20 s) = 0.325 units between frames, against a sample spacing of
 * TRAIL_LENGTH / SAMPLE_COUNT = 0.36 units. So one frame moves the nearest
 * sample by about one index, and 24 is two orders of magnitude of headroom -
 * wide enough that the fallback below is for teleports and first calls, not
 * for walking.
 */
const SEARCH_RADIUS = 24

/** Index the tracked search starts from; -1 means "no idea, scan everything". */
let _hint = -1
/** Index the last `project` call landed on, read back by the tracked wrapper. */
let _lastIndex = -1

/**
 * Index of the sample nearest `x, z`, searched over `[from, to]` inclusive.
 */
function nearestSample(samples: THREE.Vector3[], x: number, z: number, from: number, to: number) {
  let bestIndex = from
  let bestDistSq = Infinity
  for (let i = from; i <= to; i++) {
    const s = samples[i]
    const dx = x - s.x
    const dz = z - s.z
    const d = dx * dx + dz * dz
    if (d < bestDistSq) {
      bestDistSq = d
      bestIndex = i
    }
  }
  return bestIndex
}

/**
 * Nearest point on a sampled curve. Finds the closest sample, then refines
 * against the two adjacent segments so the result is exact rather than
 * quantized to the sample spacing.
 *
 * `hint` is the index the previous call landed on, or -1 for no hint. With a
 * hint the search covers a window around it and falls back to the full scan
 * when the best lands on the window's edge - which is the only way the true
 * nearest could lie outside it. So a wrong hint costs one extra window scan
 * and never a wrong answer, and the common case (the avatar, one frame later,
 * about one sample further along) is O(1) instead of O(480).
 */
function project(sampled: SampledCurve, x: number, z: number, hint: number): TrailProjection {
  const { samples, curve } = sampled
  const last = samples.length - 1
  _p.set(x, 0, z)

  let bestIndex: number
  if (hint < 0) {
    bestIndex = nearestSample(samples, x, z, 0, last)
  } else {
    const from = Math.max(0, hint - SEARCH_RADIUS)
    const to = Math.min(last, hint + SEARCH_RADIUS)
    bestIndex = nearestSample(samples, x, z, from, to)
    // On the edge of the window, and the window did not already reach the end
    // of the curve: the true nearest may be outside it, so start again.
    const openLow = from > 0 && bestIndex === from
    const openHigh = to < last && bestIndex === to
    if (openLow || openHigh) bestIndex = nearestSample(samples, x, z, 0, last)
  }

  // Refine against the segments on either side of the nearest sample.
  let bestT = bestIndex / (samples.length - 1)
  let refinedDistSq = Infinity
  const closest = _closest
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

  // Where this call landed, so a tracked caller can seed the next one.
  _lastIndex = bestIndex

  const t = THREE.MathUtils.clamp(bestT, 0, 1)
  const tangent = curve.getTangentAt(t, _tangent).setY(0).normalize()

  // Signed lateral offset: positive to the tangent's left in the XZ plane.
  const leftX = tangent.z
  const leftZ = -tangent.x
  const lateral = (x - closest.x) * leftX + (z - closest.z) * leftZ

  return { t, lateral, closest, tangent }
}

/**
 * Project a position onto the trail, scanning the whole sample table.
 *
 * Use this for one-off and scattered queries - the terrain generator calls it
 * once per vertex, at points that have no relation to each other, where a hint
 * from the previous call would only ever be wrong.
 */
export function projectToTrail(x: number, z: number): TrailProjection {
  return project(TRAIL, x, z, -1)
}

/**
 * Project a position onto the trail, seeded from where the last tracked call
 * landed. For the avatar: successive positions are within a sample or two of
 * each other, so this is O(1) where the full scan is O(480), every frame.
 *
 * Correctness does not depend on the seed being right - a bad seed falls back
 * to the full scan inside `project` - so a teleport, a resumed background tab
 * or the very first call all resolve exactly, just without the saving.
 */
export function projectToTrailTracked(x: number, z: number): TrailProjection {
  const projection = project(TRAIL, x, z, _hint)
  _hint = _lastIndex
  return projection
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

export interface ClampResult {
  x: number
  z: number
  projection: TrailProjection
  /** True when the position had to be pushed back onto the path. */
  clamped: boolean
}

/**
 * How much along-curve overshoot is treated as "on the trail". The sampled
 * polyline's closest point is exact against its own segment, but `tangent`
 * comes from the analytic curve, so the two disagree by a fraction of a sample
 * spacing in the middle of the trail. Without this slack that residue would
 * read as a clamp on every frame, and the controller damps velocity by 5x
 * whenever it clamps - the avatar would barely be able to walk.
 */
const ALONG_SLACK = 0.1

/**
 * `t` is clamped to 0..1, so for a position past either end of the curve the
 * projection returns the end point and the overshoot survives as a component
 * along the tangent. Anywhere in the middle that component is zero by
 * definition - the closest point on a curve has no along-curve offset - so
 * measuring it costs nothing and only bites at the two ends.
 */
function alongOvershoot(projection: TrailProjection, x: number, z: number): number {
  return (
    (x - projection.closest.x) * projection.tangent.x +
    (z - projection.closest.z) * projection.tangent.z
  )
}

/**
 * The one clamping rule in the world: the trail owns every position. There is
 * exactly one walkable route, so there is nothing to arbitrate between and no
 * state to carry from frame to frame.
 *
 * The position is rebuilt from the curve frame - the closest point, plus a
 * bounded sideways offset, plus a bounded along-curve offset. Bounding the
 * second one is what stops the avatar walking straight off the end of the
 * world: without it, running past the last station keeps lateral at zero
 * forever, so nothing ever pushes back and the visitor ends up in unauthored
 * space with nothing rendered around them.
 */
export function clampToTrail(x: number, z: number): ClampResult {
  // The tracked projection: this is the per-frame path, and the avatar is
  // always within a sample or two of where it was last frame.
  const projection = projectToTrailTracked(x, z)
  const limit = halfWidth(projection.t)

  const lateral = THREE.MathUtils.clamp(projection.lateral, -limit, limit)
  // The target along-curve offset is always zero: the walkable trail is the
  // curve itself, so any overshoot is outside the world and is simply removed.
  const overshoot = alongOvershoot(projection, x, z)

  const clamped = lateral !== projection.lateral || Math.abs(overshoot) > ALONG_SLACK
  if (!clamped) return { x, z, projection, clamped: false }

  const leftX = projection.tangent.z
  const leftZ = -projection.tangent.x
  return {
    x: projection.closest.x + leftX * lateral,
    z: projection.closest.z + leftZ * lateral,
    projection,
    clamped: true,
  }
}

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

/** Ground height of the world surface. The trail is flat everywhere; anything
 *  the avatar can stand on above it is a solid, resolved by the collision
 *  resolver rather than by a height override. */
export const GROUND_Y = 0

export const TRAIL_START = TRAIL_CURVE.getPointAt(STATION_T.intro)
