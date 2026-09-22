"use client"

import { forwardRef, useImperativeHandle, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import type { MovementVector } from "@/lib/input/useMovementInput"
import { WORLD_BOUNDS_RADIUS } from "@/lib/world/layout"
import { useWorldStore } from "@/lib/world-store"

export interface AvatarHandle {
  group: THREE.Group | null
}

interface AvatarProps {
  movementVector: React.MutableRefObject<MovementVector>
  maxSpeed?: number
  onMove?: (x: number, z: number) => void
}

const ACCELERATION = 14 // how fast the avatar reaches top speed (units/s^2-ish, via exponential smoothing)
const DECELERATION = 18 // how fast it brakes when input stops - gives it weight instead of stopping dead

/**
 * Low-poly, Ultraman-inspired humanoid built from primitives, animated with
 * a procedural walk cycle (swinging arms/legs from hip/shoulder pivots,
 * torso bob, forward lean while moving) so it reads as alive rather than a
 * sliding statue. Movement itself has simple momentum (accelerate/decelerate
 * toward the input direction rather than snapping to it) for a more
 * game-like feel.
 */
const Avatar = forwardRef<AvatarHandle, AvatarProps>(({ movementVector, maxSpeed = 6, onMove }, ref) => {
  const group = useRef<THREE.Group>(null)
  const bodyPivot = useRef<THREE.Group>(null)
  const leftLegPivot = useRef<THREE.Group>(null)
  const rightLegPivot = useRef<THREE.Group>(null)
  const leftArmPivot = useRef<THREE.Group>(null)
  const rightArmPivot = useRef<THREE.Group>(null)

  const facing = useRef(0)
  const velocity = useRef(new THREE.Vector2(0, 0))
  const walkPhase = useRef(0)
  const gait = useRef(0) // eased 0..1 blend between idle and full walk-cycle amplitude

  useImperativeHandle(ref, () => ({ group: group.current }), [])

  useFrame((_, delta) => {
    const g = group.current
    if (!g) return
    // While inside the parkour zone, ParkourZone.tsx drives this same group's
    // position from its physics body - yield ground-movement control to it.
    const inParkour = useWorldStore.getState().activeRoom === "parkour"

    if (!inParkour) {
      const { x, y } = movementVector.current
      const hasInput = x !== 0 || y !== 0
      const inputLen = Math.hypot(x, y) || 1
      const targetVX = hasInput ? (x / inputLen) * maxSpeed : 0
      const targetVZ = hasInput ? (y / inputLen) * maxSpeed : 0

      const rate = hasInput ? ACCELERATION : DECELERATION
      const smoothing = 1 - Math.exp(-rate * delta)
      velocity.current.x += (targetVX - velocity.current.x) * smoothing
      velocity.current.y += (targetVZ - velocity.current.y) * smoothing

      let nextX = g.position.x + velocity.current.x * delta
      let nextZ = g.position.z + velocity.current.y * delta

      const distFromCenter = Math.hypot(nextX, nextZ)
      if (distFromCenter > WORLD_BOUNDS_RADIUS) {
        const scale = WORLD_BOUNDS_RADIUS / distFromCenter
        nextX *= scale
        nextZ *= scale
        velocity.current.set(0, 0)
      }

      g.position.x = nextX
      g.position.z = nextZ

      const speed = Math.hypot(velocity.current.x, velocity.current.y)
      if (speed > 0.15) {
        const targetFacing = Math.atan2(velocity.current.x, velocity.current.y)
        // shortest-path angle lerp so it doesn't spin the long way around
        let diff = targetFacing - facing.current
        diff = Math.atan2(Math.sin(diff), Math.cos(diff))
        facing.current += diff * Math.min(1, 10 * delta)
        g.rotation.y = facing.current
      }

      // Report position while actually moving, plus the brief deceleration
      // tail after input stops, so zone-tracking stays accurate as it glides
      // to a stop instead of freezing the instant a key is released.
      if (hasInput || speed > 0.05) {
        onMove?.(g.position.x, g.position.z)
      }

      // --- procedural walk cycle ---
      const speedFraction = THREE.MathUtils.clamp(speed / maxSpeed, 0, 1)
      gait.current = THREE.MathUtils.lerp(gait.current, speedFraction, 1 - Math.exp(-8 * delta))
      walkPhase.current += delta * (4 + speedFraction * 5)

      const swing = Math.sin(walkPhase.current) * gait.current
      const counterSwing = Math.sin(walkPhase.current + Math.PI) * gait.current

      if (leftLegPivot.current) leftLegPivot.current.rotation.x = swing * 0.7
      if (rightLegPivot.current) rightLegPivot.current.rotation.x = counterSwing * 0.7
      if (leftArmPivot.current) leftArmPivot.current.rotation.x = counterSwing * 0.6
      if (rightArmPivot.current) rightArmPivot.current.rotation.x = swing * 0.6

      if (bodyPivot.current) {
        const bob = Math.abs(Math.sin(walkPhase.current * 2)) * gait.current * 0.08
        const idleBreath = Math.sin(walkPhase.current * 0.6) * (1 - gait.current) * 0.02
        bodyPivot.current.position.y = bob + idleBreath
        bodyPivot.current.rotation.x = gait.current * 0.12 // forward lean while moving
        bodyPivot.current.rotation.z = Math.sin(walkPhase.current) * gait.current * 0.04 // subtle side sway
      }
    }
  })

  return (
    <group ref={group} position={[0, 0, 6]}>
      <group ref={bodyPivot} position={[0, 0, 0]}>
        {/* body */}
        <mesh position={[0, 0.9, 0]} castShadow>
          <capsuleGeometry args={[0.4, 0.8, 4, 8]} />
          <meshStandardMaterial color="#d8d8e0" flatShading />
        </mesh>
        {/* chest stripe */}
        <mesh position={[0, 1.0, 0.36]}>
          <boxGeometry args={[0.5, 0.35, 0.08]} />
          <meshStandardMaterial color="#e63946" flatShading />
        </mesh>
        {/* head */}
        <mesh position={[0, 1.65, 0]} castShadow>
          <sphereGeometry args={[0.32, 8, 6]} />
          <meshStandardMaterial color="#c8c8d4" flatShading />
        </mesh>
        {/* visor / eye */}
        <mesh position={[0, 1.65, 0.28]}>
          <boxGeometry args={[0.4, 0.12, 0.1]} />
          <meshStandardMaterial color="#e63946" emissive="#e63946" emissiveIntensity={0.6} flatShading />
        </mesh>
        {/* head fin */}
        <mesh position={[0, 1.95, 0]}>
          <coneGeometry args={[0.12, 0.28, 4]} />
          <meshStandardMaterial color="#e63946" flatShading />
        </mesh>

        {/* arms - pivoted at the shoulder so they swing naturally */}
        <group ref={leftArmPivot} position={[-0.52, 1.25, 0]}>
          <mesh position={[0, -0.3, 0]} castShadow>
            <capsuleGeometry args={[0.12, 0.5, 4, 6]} />
            <meshStandardMaterial color="#d8d8e0" flatShading />
          </mesh>
        </group>
        <group ref={rightArmPivot} position={[0.52, 1.25, 0]}>
          <mesh position={[0, -0.3, 0]} castShadow>
            <capsuleGeometry args={[0.12, 0.5, 4, 6]} />
            <meshStandardMaterial color="#d8d8e0" flatShading />
          </mesh>
        </group>
      </group>

      {/* legs - pivoted at the hip (y=0.64, matching the capsule's full height so feet land at y=0), outside bodyPivot so bob doesn't lift feet off the ground */}
      <group ref={leftLegPivot} position={[-0.2, 0.64, 0]}>
        <mesh position={[0, -0.32, 0]} castShadow>
          <capsuleGeometry args={[0.14, 0.36, 4, 6]} />
          <meshStandardMaterial color="#3a3a44" flatShading />
        </mesh>
      </group>
      <group ref={rightLegPivot} position={[0.2, 0.64, 0]}>
        <mesh position={[0, -0.32, 0]} castShadow>
          <capsuleGeometry args={[0.14, 0.36, 4, 6]} />
          <meshStandardMaterial color="#3a3a44" flatShading />
        </mesh>
      </group>
    </group>
  )
})

Avatar.displayName = "Avatar"

export default Avatar
