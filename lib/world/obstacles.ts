import * as THREE from "three"
import type { Solid } from "@/lib/world/physics"
import { PHYSICS } from "@/lib/world/physics"
import {
  CORRIDOR_HALF_WIDTH,
  PLAZA_RADIUS,
  STATION_ANCHORS,
  STATION_T,
  TRAIL_CURVE,
  TRAIL_LENGTH,
  halfWidth,
} from "@/lib/world/trail"

/**
 * Simple things to jump on the way between plazas.
 *
 * Every dimension here is derived from the jump the avatar already has, not
 * chosen by eye. From `PHYSICS` (JUMP_VELOCITY 9.5, GRAVITY -26, MAX_SPEED
 * 6.5): apex 1.736 units, airtime 0.731 s, horizontal reach 4.75 units. No
 * obstacle top comes near that apex and no gap comes near that reach, because
 * these are scenery with collision - not a skill test, and never a gate.
 *
 * The bypass rule is the important one: every obstacle leaves a continuous
 * walkable lane beside it, so a visitor who never presses jump still reaches
 * every plaza. `assertObstaclePlacement` checks that arithmetically at
 * startup rather than trusting the numbers below to stay right.
 */

export type ObstacleKind = "block" | "steps" | "beam"

/** One box of an obstacle, in trail-local terms. */
interface Pad {
  /** Extent across the trail (the lateral axis). */
  across: number
  /** Extent along the trail. */
  along: number
  /** Height of the top surface above the ground. */
  top: number
  /** Offset along the trail from the obstacle's own centre, in units. */
  offsetAlong: number
}

/**
 * The three kinds, as pad sets. Tops are 0.55-1.0 against an apex of 1.736:
 * about half the available height, so clearing one does not need a
 * well-timed press.
 */
const KINDS: Record<ObstacleKind, Pad[]> = {
  // A single low block: the plain hop.
  block: [{ across: 1.8, along: 1.4, top: 0.9, offsetAlong: 0 }],
  // Two rising pads. The 1.5-unit gap is crossed in 0.23 s at full speed,
  // by which point the jump arc is 1.50 units up - far more than the 0.45
  // rise between the pads.
  steps: [
    { across: 1.2, along: 1.1, top: 0.55, offsetAlong: -1.3 },
    { across: 1.2, along: 1.1, top: 1.0, offsetAlong: 1.3 },
  ],
  // Long across, thin along: jumped in the direction of travel, or walked
  // around laterally.
  beam: [{ across: 3.0, along: 0.45, top: 0.7, offsetAlong: 0 }],
}

/** Total extent along the trail, used for the plaza-clearance check. */
function alongExtent(kind: ObstacleKind): number {
  const pads = KINDS[kind]
  const min = Math.min(...pads.map((p) => p.offsetAlong - p.along / 2))
  const max = Math.max(...pads.map((p) => p.offsetAlong + p.along / 2))
  return max - min
}

/** Widest extent across the trail, used for the clear-lane check. */
function acrossExtent(kind: ObstacleKind): number {
  return Math.max(...KINDS[kind].map((p) => p.across))
}

interface Placement {
  /** Index of the gap: the obstacle sits between anchor `gap` and `gap + 1`. */
  gap: number
  kind: ObstacleKind
  /** Offset from the trail centreline; sign picks the side. */
  lateral: number
}

/**
 * One group per gap between adjacent plazas, alternating side.
 *
 * The kind is dictated by how much room the gap actually has. Measured arc
 * lengths between anchors are 19.4-23.4 units, and a plaza eats PLAZA_RADIUS
 * (9) at each end, so five of the seven gaps leave only ~1.4-2.2 units of
 * usable trail - room for a beam, but not for a block or a stepping pair.
 * The two wide gaps (23.0 and 23.4 units, leaving ~5 units) take those.
 */
const PLACEMENTS: Placement[] = [
  { gap: 0, kind: "beam", lateral: 1.2 }, // intro -> itau-rpa
  { gap: 1, kind: "beam", lateral: -1.2 }, // itau-rpa -> itau-rpa-2
  { gap: 2, kind: "steps", lateral: 0 }, // itau-rpa-2 -> itau-intern (wide)
  { gap: 3, kind: "beam", lateral: 1.2 }, // itau-intern -> agile-inc
  { gap: 4, kind: "beam", lateral: -1.2 }, // agile-inc -> agile-inc-2
  { gap: 5, kind: "block", lateral: 1.6 }, // agile-inc-2 -> fei (wide)
  { gap: 6, kind: "beam", lateral: 1.2 }, // fei -> fiap
  { gap: 7, kind: "beam", lateral: -1.2 }, // fiap -> certifications
  { gap: 8, kind: "steps", lateral: 0 }, // certifications -> certifications-2 (wide)
  { gap: 9, kind: "block", lateral: 1.6 }, // certifications-2 -> contact (wide)
]

export interface ObstaclePad {
  id: string
  /** World-space centre of the top face. */
  position: [number, number, number]
  /** Box dimensions: width (across), height, depth (along). */
  size: [number, number, number]
  /** Rotation about Y so the box lines up with the trail here. */
  rotationY: number
  top: number
  solid: Solid
}

export interface Obstacle {
  id: string
  kind: ObstacleKind
  /** Arc-length position of the group's centre. */
  t: number
  lateral: number
  pads: ObstaclePad[]
}

/** Box drawn from the top face down to the ground, so it reads as planted. */
const DEPTH_BELOW = 0.6

function buildObstacle({ gap, kind, lateral }: Placement, index: number): Obstacle {
  const a = STATION_T[STATION_ANCHORS[gap].id]
  const b = STATION_T[STATION_ANCHORS[gap + 1].id]
  const t = (a + b) / 2

  const point = TRAIL_CURVE.getPointAt(t)
  const tangent = TRAIL_CURVE.getTangentAt(t).setY(0).normalize()
  const left = new THREE.Vector3(tangent.z, 0, -tangent.x)
  const rotationY = Math.atan2(tangent.x, tangent.z)

  const pads = KINDS[kind].map((pad, i) => {
    const centre = point
      .clone()
      .addScaledVector(left, lateral)
      .addScaledVector(tangent, pad.offsetAlong)

    // The collision resolver only handles axis-aligned boxes, but the drawn
    // box is rotated to follow the trail. This is the AABB of that rotated
    // rectangle - the tight one, from projecting both footprint axes onto X
    // and Z. Taking the larger footprint axis for both instead would make the
    // beam's solid a 3x3 square, three times deeper along the trail than the
    // beam the visitor can see.
    const halfX = (pad.across / 2) * Math.abs(left.x) + (pad.along / 2) * Math.abs(tangent.x)
    const halfZ = (pad.across / 2) * Math.abs(left.z) + (pad.along / 2) * Math.abs(tangent.z)

    return {
      id: `obstacle-${index}-${i}`,
      position: [centre.x, pad.top, centre.z] as [number, number, number],
      size: [pad.across, pad.top + DEPTH_BELOW, pad.along] as [number, number, number],
      rotationY,
      top: pad.top,
      solid: {
        id: `obstacle-${index}-${i}`,
        min: [centre.x - halfX, pad.top - DEPTH_BELOW, centre.z - halfZ],
        max: [centre.x + halfX, pad.top, centre.z + halfZ],
      } satisfies Solid,
    }
  })

  return { id: `obstacle-${index}`, kind, t, lateral, pads }
}

export const OBSTACLES: Obstacle[] = PLACEMENTS.map(buildObstacle)

export const OBSTACLE_SOLIDS: Solid[] = OBSTACLES.flatMap((o) => o.pads.map((p) => p.solid))

/** A lane this wide always remains beside every obstacle. Two avatar widths. */
export const MIN_LANE = PHYSICS.RADIUS * 2 * 2

/**
 * The widest continuous walkable lane left beside an obstacle, in units.
 *
 * The corridor runs from -w to +w and the obstacle occupies
 * [lateral - across/2, lateral + across/2], so the two candidate lanes are the
 * strips on either side of it. Only the wider one matters: a visitor who will
 * not jump needs one way past, not two. Pushing an obstacle hard to one side
 * therefore makes this *larger*, not smaller - the dangerous case is an
 * obstacle wide enough to span the corridor from the middle.
 *
 * Separate and exported so the invariant can be checked against values the
 * three current kinds cannot actually produce.
 */
export function laneBeside(lateral: number, across: number, w: number): number {
  const half = across / 2
  return Math.max(w - (lateral + half), lateral - half + w)
}

/**
 * Checks the two properties the spec actually cares about, arithmetically:
 * no obstacle sits inside a plaza, and every obstacle leaves a walkable lane
 * beside it. Called in development only, from the same place the content
 * coverage assertion runs - a careless edit to PLACEMENTS should fail loudly
 * at startup, not quietly wall the portfolio off from the visitor.
 */
export function assertObstaclePlacement(): void {
  const problems: string[] = []

  for (const obstacle of OBSTACLES) {
    const halfAlong = alongExtent(obstacle.kind) / 2
    const halfAcross = acrossExtent(obstacle.kind) / 2

    // 1. The whole group, end to end, stays outside every plaza circle.
    for (const anchor of STATION_ANCHORS) {
      const along = Math.abs(obstacle.t - STATION_T[anchor.id]) * TRAIL_LENGTH
      if (along - halfAlong < PLAZA_RADIUS) {
        problems.push(
          `${obstacle.id} (${obstacle.kind}) reaches within ${(along - halfAlong).toFixed(2)}u of ` +
            `the "${anchor.id}" plaza, inside its ${PLAZA_RADIUS}u radius`,
        )
      }
    }

    // 2. A continuous lane at least MIN_LANE wide remains on one side.
    const w = halfWidth(obstacle.t)
    const lane = laneBeside(obstacle.lateral, halfAcross * 2, w)
    if (lane < MIN_LANE) {
      problems.push(
        `${obstacle.id} (${obstacle.kind}) leaves only ${lane.toFixed(2)}u to walk around, ` +
          `below the ${MIN_LANE.toFixed(2)}u minimum - a visitor who cannot jump would be stuck`,
      )
    }

    // 3. Nothing is taller than the avatar can clear from flat ground.
    const apex = (PHYSICS.JUMP_VELOCITY * PHYSICS.JUMP_VELOCITY) / (2 * -PHYSICS.GRAVITY)
    for (const pad of obstacle.pads) {
      if (pad.top >= apex) {
        problems.push(
          `${obstacle.id} pad top ${pad.top}u is at or above the ${apex.toFixed(2)}u jump apex`,
        )
      }
    }
  }

  if (problems.length > 0) {
    throw new Error(`Trail obstacle placement is invalid:\n  - ${problems.join("\n  - ")}`)
  }
}

/** Exported for the placement report the verification task reads. */
export const OBSTACLE_GEOMETRY_REPORT = () =>
  OBSTACLES.map((o) => ({
    id: o.id,
    kind: o.kind,
    t: +o.t.toFixed(4),
    lateral: o.lateral,
    corridorHalfWidth: +halfWidth(o.t).toFixed(2),
    tops: o.pads.map((p) => p.top),
    nearestPlazaAlong: +Math.min(
      ...STATION_ANCHORS.map((a) => Math.abs(o.t - STATION_T[a.id]) * TRAIL_LENGTH),
    ).toFixed(2),
    lane: +Math.max(
      halfWidth(o.t) - (o.lateral + acrossExtent(o.kind) / 2),
      o.lateral - acrossExtent(o.kind) / 2 + halfWidth(o.t),
    ).toFixed(2),
  }))

// Referenced so the corridor constant stays tied to this module's assumptions.
export const OBSTACLE_CORRIDOR_HALF_WIDTH = CORRIDOR_HALF_WIDTH

// Same rationale as avatarState: in development the placement is reachable
// from the console, which is the only practical way to check geometry whose
// truth lives in a render loop rather than in the DOM.
if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
  Object.assign(window as unknown as Record<string, unknown>, {
    __obstacles: OBSTACLES,
    __obstacleReport: OBSTACLE_GEOMETRY_REPORT,
    __assertObstacles: assertObstaclePlacement,
    __laneBeside: laneBeside,
    __minLane: MIN_LANE,
  })
}
