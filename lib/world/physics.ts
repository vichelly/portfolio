/**
 * The single source of tuning for character movement. Every part of the world -
 * the trail and the parkour course alike - runs through the same controller and
 * the same numbers, so jumping cannot feel different in one place than another.
 */
export const PHYSICS = {
  GRAVITY: -26,
  JUMP_VELOCITY: 9.5,
  /** Seconds after walking off a ledge during which a jump still counts. */
  COYOTE_TIME: 0.12,
  /** Seconds before landing during which a jump press is remembered. */
  JUMP_BUFFER: 0.15,
  /** Steering authority while airborne, as a fraction of ground authority. */
  AIR_CONTROL: 0.45,
  MAX_SPEED: 6.5,
  ACCELERATION: 16,
  DECELERATION: 20,
  MAX_FALL_SPEED: 40,
  /** Avatar collision box. */
  RADIUS: 0.38,
  HEIGHT: 1.8,
} as const

export interface Solid {
  id: string
  /** World-space axis-aligned bounds. */
  min: [number, number, number]
  max: [number, number, number]
  /** Per-frame translation of a moving solid, used to carry riders. */
  delta?: [number, number, number]
}

export interface MoveInput {
  /** Position at the start of the step - the feet, not the center. */
  prev: { x: number; y: number; z: number }
  /** Position the integrator wants to move to, before collision. */
  next: { x: number; y: number; z: number }
  velocity: { x: number; y: number; z: number }
  solids: readonly Solid[]
  groundY: number
}

export interface MoveResult {
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
  grounded: boolean
  /** The solid the body came to rest on, if any - the rider carry surface. */
  groundSolid: Solid | null
  /** True when the body's head hit the underside of a solid this step. */
  bumpedHead: boolean
}

const EPS = 1e-3

function overlapsHorizontally(x: number, z: number, s: Solid) {
  const r = PHYSICS.RADIUS
  return x + r > s.min[0] && x - r < s.max[0] && z + r > s.min[2] && z - r < s.max[2]
}

function overlapsVertically(y: number, s: Solid) {
  // Feet lifted slightly so resting exactly on a surface is not an overlap.
  return y + PHYSICS.HEIGHT > s.min[1] + EPS && y + EPS < s.max[1]
}

/**
 * Moves a body from `prev` toward `next`, resolving against the ground plane
 * and a list of axis-aligned solids. The vertical axis is resolved first with a
 * swept test - comparing where the body was against where it wants to be, so a
 * fast fall cannot pass through a thin platform - then X and Z are resolved
 * independently against the settled vertical position.
 */
export function resolveMove({ prev, next, velocity, solids, groundY }: MoveInput): MoveResult {
  let { x, y, z } = next
  let { x: vx, y: vy, z: vz } = velocity
  let grounded = false
  let groundSolid: Solid | null = null
  let bumpedHead = false

  // --- Y axis (swept) -------------------------------------------------
  if (vy <= 0) {
    let highestTop = -Infinity
    let landedOn: Solid | null = null
    for (const s of solids) {
      if (!overlapsHorizontally(x, z, s)) continue
      const top = s.max[1]
      // Crossed the surface between the previous and the desired position.
      if (prev.y >= top - EPS && y <= top + EPS && top > highestTop) {
        highestTop = top
        landedOn = s
      }
    }
    if (landedOn) {
      y = highestTop
      vy = 0
      grounded = true
      groundSolid = landedOn
    } else if (y <= groundY) {
      y = groundY
      vy = 0
      grounded = true
    }
  } else {
    for (const s of solids) {
      if (!overlapsHorizontally(x, z, s)) continue
      const bottom = s.min[1]
      if (prev.y + PHYSICS.HEIGHT <= bottom + EPS && y + PHYSICS.HEIGHT >= bottom - EPS) {
        y = bottom - PHYSICS.HEIGHT
        vy = 0
        bumpedHead = true
      }
    }
  }

  // Standing still on a surface keeps reporting grounded, so walking along a
  // platform does not flicker between grounded and airborne.
  if (!grounded && vy <= 0) {
    for (const s of solids) {
      if (!overlapsHorizontally(x, z, s)) continue
      if (Math.abs(y - s.max[1]) <= EPS * 4) {
        grounded = true
        groundSolid = s
        y = s.max[1]
        break
      }
    }
    if (!grounded && Math.abs(y - groundY) <= EPS * 4) {
      grounded = true
      y = groundY
    }
  }

  // --- X axis ---------------------------------------------------------
  const r = PHYSICS.RADIUS
  for (const s of solids) {
    if (!overlapsVertically(y, s)) continue
    if (!(z + r > s.min[2] && z - r < s.max[2])) continue
    if (!(x + r > s.min[0] && x - r < s.max[0])) continue
    // Push out through whichever X face the body came from.
    x = prev.x < s.min[0] ? s.min[0] - r : prev.x > s.max[0] ? s.max[0] + r : x
    vx = 0
  }

  // --- Z axis ---------------------------------------------------------
  for (const s of solids) {
    if (!overlapsVertically(y, s)) continue
    if (!(x + r > s.min[0] && x - r < s.max[0])) continue
    if (!(z + r > s.min[2] && z - r < s.max[2])) continue
    z = prev.z < s.min[2] ? s.min[2] - r : prev.z > s.max[2] ? s.max[2] + r : z
    vz = 0
  }

  return { x, y, z, vx, vy, vz, grounded, groundSolid, bumpedHead }
}
