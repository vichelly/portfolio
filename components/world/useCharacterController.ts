"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { PHYSICS } from "@/lib/world/physics"
import { resolveMove } from "@/lib/world/physics"
import { activeSolids } from "@/lib/world/solids"
import { avatarState } from "@/lib/world/avatarState"
import { groundYAt } from "@/lib/world/ground"
import {
  activeStationAt,
  clampFor,
  containmentFor,
  type Containment,
} from "@/lib/world/trail"
import { useWorldStore } from "@/lib/world-store"
import type { useMovementInput } from "@/lib/input/useMovementInput"

export type MovementInput = ReturnType<typeof useMovementInput>

export type MotionState = "idle" | "walk" | "jump" | "fall" | "land"

export interface ControllerState {
  velocity: THREE.Vector3
  grounded: boolean
  motion: MotionState
  /** Seconds since the last landing, used to time the landing response. */
  sinceLanded: number
  facing: number
}

const LAND_RECOVERY = 0.22

/**
 * The one character controller in the app. Owns gravity, jumping, containment,
 * and collision for the avatar everywhere in the world - the trail and the
 * parkour course both run through it, which is what makes jumping feel the
 * same in both.
 */
export function useCharacterController(
  group: React.RefObject<THREE.Group | null>,
  input: MovementInput,
) {
  const state = useRef<ControllerState>({
    velocity: new THREE.Vector3(),
    grounded: true,
    motion: "idle",
    sinceLanded: LAND_RECOVERY,
    facing: 0,
  })
  const lastGroundedAt = useRef(0)
  const containment = useRef<Containment>("trail")
  const publishedStation = useRef<string | null>(null)
  const publishedPercent = useRef(-1)

  useFrame((_, rawDelta) => {
    const g = group.current
    if (!g) return
    // Cap the step so a background tab that wakes up cannot fling the avatar.
    const delta = Math.min(rawDelta, 1 / 20)
    const s = state.current
    const now = performance.now() / 1000

    // A pending teleport (parkour respawn) is applied before anything else, so
    // the rest of the step integrates from the new position.
    if (avatarState.teleport) {
      g.position.set(avatarState.teleport.x, avatarState.teleport.y, avatarState.teleport.z)
      s.velocity.set(0, 0, 0)
      s.grounded = false
      avatarState.teleport = null
    }

    // --- horizontal intent ------------------------------------------
    const { x: ix, y: iy } = input.vector.current
    const hasInput = ix !== 0 || iy !== 0
    const len = Math.hypot(ix, iy) || 1
    const targetX = hasInput ? (ix / len) * PHYSICS.MAX_SPEED : 0
    const targetZ = hasInput ? (iy / len) * PHYSICS.MAX_SPEED : 0

    // Airborne steering has real but reduced authority (spec: air control).
    const authority = s.grounded ? 1 : PHYSICS.AIR_CONTROL
    const rate = (hasInput ? PHYSICS.ACCELERATION : PHYSICS.DECELERATION) * authority
    const smoothing = 1 - Math.exp(-rate * delta)
    s.velocity.x += (targetX - s.velocity.x) * smoothing
    s.velocity.z += (targetZ - s.velocity.z) * smoothing

    // --- jump: coyote time + buffered press -------------------------
    const canCoyote = s.grounded || now - lastGroundedAt.current <= PHYSICS.COYOTE_TIME
    if (canCoyote && input.consumeJump(PHYSICS.JUMP_BUFFER)) {
      s.velocity.y = PHYSICS.JUMP_VELOCITY
      s.grounded = false
      // Spend the coyote window so one press cannot produce two jumps.
      lastGroundedAt.current = -Infinity
      s.motion = "jump"
    }

    // --- gravity ----------------------------------------------------
    s.velocity.y = Math.max(s.velocity.y + PHYSICS.GRAVITY * delta, -PHYSICS.MAX_FALL_SPEED)

    // --- integrate, contain, collide --------------------------------
    const prev = { x: g.position.x, y: g.position.y, z: g.position.z }

    containment.current = containmentFor(containment.current, prev.x, prev.z)

    let nx = prev.x + s.velocity.x * delta
    let nz = prev.z + s.velocity.z * delta
    const ny = prev.y + s.velocity.y * delta

    // Lateral containment first: it is a soft boundary, so collision has the
    // final say over where the body actually ends up.
    const clamped = clampFor(containment.current, nx, nz)
    if (clamped.clamped) {
      nx = clamped.x
      nz = clamped.z
      s.velocity.x *= 0.2
      s.velocity.z *= 0.2
    }

    const solids = activeSolids()
    const result = resolveMove({
      prev,
      next: { x: nx, y: ny, z: nz },
      velocity: { x: s.velocity.x, y: s.velocity.y, z: s.velocity.z },
      solids,
      groundY: groundYAt(nx, nz),
    })

    const wasGrounded = s.grounded
    s.grounded = result.grounded
    s.velocity.set(result.vx, result.vy, result.vz)

    g.position.set(result.x, result.y, result.z)

    // Riding a moving solid: carry the body with it.
    const carry = result.groundSolid?.delta
    if (carry) {
      g.position.x += carry[0]
      g.position.z += carry[2]
    }

    if (s.grounded) {
      lastGroundedAt.current = now
      if (!wasGrounded) s.sinceLanded = 0
      else s.sinceLanded += delta
    } else {
      s.sinceLanded += delta
    }

    // --- facing -----------------------------------------------------
    const speed = Math.hypot(s.velocity.x, s.velocity.z)
    if (speed > 0.2) {
      const target = Math.atan2(s.velocity.x, s.velocity.z)
      let diff = target - s.facing
      diff = Math.atan2(Math.sin(diff), Math.cos(diff))
      s.facing += diff * Math.min(1, 12 * delta)
      g.rotation.y = s.facing
    }

    // --- motion state ------------------------------------------------
    if (!s.grounded) {
      s.motion = s.velocity.y > 0.5 ? "jump" : "fall"
    } else if (s.sinceLanded < LAND_RECOVERY) {
      s.motion = "land"
    } else {
      s.motion = speed > 0.4 ? "walk" : "idle"
    }

    // --- publish ------------------------------------------------------
    const projection = clamped.projection
    avatarState.x = g.position.x
    avatarState.y = g.position.y
    avatarState.z = g.position.z
    avatarState.speed = speed
    avatarState.grounded = s.grounded
    avatarState.motion = s.motion
    avatarState.containment = containment.current
    avatarState.t = containment.current === "trail" ? projection.t : avatarState.t
    avatarState.station = activeStationAt(avatarState.t)
    avatarState.facing = s.facing

    // The DOM only hears about changes, never about frames.
    const store = useWorldStore.getState()
    if (avatarState.station !== publishedStation.current) {
      publishedStation.current = avatarState.station
      store.setActiveStationId(avatarState.station)
    }
    const percent = Math.round(avatarState.t * 100)
    if (percent !== publishedPercent.current) {
      publishedPercent.current = percent
      store.setProgressPercent(percent)
    }
    if (store.containment !== containment.current) {
      store.setContainment(containment.current)
    }
  })

  return state
}
