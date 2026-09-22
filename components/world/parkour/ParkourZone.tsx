"use client"

import { useEffect, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Physics, RigidBody, CuboidCollider, type RapierRigidBody } from "@react-three/rapier"
import * as THREE from "three"
import { zoneFor } from "@/lib/world/layout"
import type { AvatarHandle } from "@/components/world/Avatar"
import type { MovementVector } from "@/lib/input/useMovementInput"

interface ParkourZoneProps {
  avatarRef: React.RefObject<AvatarHandle | null>
  movementVector: React.MutableRefObject<MovementVector>
  active: boolean
  onMove: (x: number, z: number) => void
}

const zone = zoneFor("parkour")
const SPAWN: [number, number, number] = [zone.center[0], 1, zone.center[1]]
const FALL_Y = -8
const SPEED = 5.5
const JUMP_VELOCITY = 7.5

const PLATFORMS: { pos: [number, number, number]; size: [number, number, number]; color: string }[] = [
  { pos: [zone.center[0], 0.5, zone.center[1]], size: [6, 1, 6], color: "#f2e94e" },
  { pos: [zone.center[0] + 4.2, 1.1, zone.center[1] - 2.2], size: [2.4, 1, 2.4], color: "#ffb703" },
  { pos: [zone.center[0] + 7.6, 1.8, zone.center[1] - 4.6], size: [2.1, 1, 2.1], color: "#fb8500" },
  { pos: [zone.center[0] + 7.6, 2.6, zone.center[1] - 8.2], size: [2.1, 1, 2.1], color: "#fb8500" },
  { pos: [zone.center[0] + 3.8, 3.4, zone.center[1] - 10.6], size: [2.1, 1, 2.1], color: "#ffb703" },
]

// A platform that slides back and forth - the one genuinely "physical"
// mechanic in the course (timing a jump onto a moving target).
const MOVER_CENTER: [number, number, number] = [zone.center[0] - 0.5, 4.1, zone.center[1] - 13.6]
const MOVER_AXIS: [number, number, number] = [2.6, 0, 0]
const MOVER_SPEED = 1.1

const FINISH: [number, number, number] = [zone.center[0] - 2.5, 5.1, zone.center[1] - 16.4]

/**
 * Physics-driven jump/platform mini-game. Dynamically imported and mounted
 * only when the visitor enters the parkour zone, so @react-three/rapier
 * never ships in the initial bundle. Drives the shared avatar's visible
 * position while active; on falling below FALL_Y it just respawns here -
 * it never touches career-content state (panels, fallback menu).
 */
export default function ParkourZone({ avatarRef, movementVector, active, onMove }: ParkourZoneProps) {
  const body = useRef<RapierRigidBody>(null)
  const mover = useRef<RapierRigidBody>(null)
  const grounded = useRef(false)
  const finishSpin = useRef<THREE.Group>(null)

  useEffect(() => {
    if (active && body.current) {
      body.current.setTranslation({ x: SPAWN[0], y: SPAWN[1] + 1, z: SPAWN[2] }, true)
      body.current.setLinvel({ x: 0, y: 0, z: 0 }, true)
      grounded.current = false
    }
  }, [active])

  useFrame((state) => {
    if (finishSpin.current) {
      finishSpin.current.rotation.y = state.clock.elapsedTime * 1.4
      finishSpin.current.position.y = FINISH[1] + 0.8 + Math.sin(state.clock.elapsedTime * 2) * 0.15
    }

    if (mover.current) {
      const t = Math.sin(state.clock.elapsedTime * MOVER_SPEED)
      mover.current.setNextKinematicTranslation({
        x: MOVER_CENTER[0] + MOVER_AXIS[0] * t,
        y: MOVER_CENTER[1] + MOVER_AXIS[1] * t,
        z: MOVER_CENTER[2] + MOVER_AXIS[2] * t,
      })
    }

    const rb = body.current
    if (!rb || !active) return

    const { x, y, jump } = movementVector.current
    const linvel = rb.linvel()
    rb.setLinvel({ x: x * SPEED, y: linvel.y, z: y * SPEED }, true)

    if (jump && grounded.current) {
      rb.setLinvel({ x: linvel.x, y: JUMP_VELOCITY, z: linvel.z }, true)
      grounded.current = false
    }

    const t = rb.translation()
    if (t.y < FALL_Y) {
      rb.setTranslation({ x: SPAWN[0], y: SPAWN[1] + 1, z: SPAWN[2] }, true)
      rb.setLinvel({ x: 0, y: 0, z: 0 }, true)
      grounded.current = false
    }

    const avatarGroup = avatarRef.current?.group
    if (avatarGroup) {
      avatarGroup.position.set(t.x, t.y - 0.9, t.z)
      if (x !== 0 || y !== 0) {
        avatarGroup.rotation.y = THREE.MathUtils.lerp(avatarGroup.rotation.y, Math.atan2(x, y), 0.35)
      }
    }
    onMove(t.x, t.z)
  })

  return (
    <Physics gravity={[0, -18, 0]}>
      <RigidBody
        ref={body}
        colliders="ball"
        position={[SPAWN[0], SPAWN[1] + 1, SPAWN[2]]}
        enabledRotations={[false, false, false]}
        onCollisionEnter={() => {
          grounded.current = true
        }}
        onCollisionExit={() => {
          grounded.current = false
        }}
      >
        <mesh visible={false}>
          <sphereGeometry args={[0.4]} />
        </mesh>
      </RigidBody>

      {PLATFORMS.map((p, i) => (
        <RigidBody key={i} type="fixed" position={p.pos}>
          <mesh receiveShadow castShadow>
            <boxGeometry args={p.size} />
            <meshStandardMaterial color={p.color} flatShading />
          </mesh>
        </RigidBody>
      ))}

      {/* the moving platform - a "type=kinematicPosition" body driven by setNextKinematicTranslation each frame */}
      <RigidBody ref={mover} type="kinematicPosition" position={MOVER_CENTER}>
        <mesh receiveShadow castShadow>
          <boxGeometry args={[2.2, 0.6, 2.2]} />
          <meshStandardMaterial color="#e63946" flatShading />
        </mesh>
      </RigidBody>

      {/* finish platform + spinning star */}
      <RigidBody type="fixed" position={FINISH}>
        <mesh receiveShadow castShadow>
          <cylinderGeometry args={[2, 2, 0.6, 8]} />
          <meshStandardMaterial color="#2a9d8f" flatShading />
        </mesh>
      </RigidBody>
      <group ref={finishSpin} position={FINISH}>
        <mesh>
          <octahedronGeometry args={[0.5, 0]} />
          <meshStandardMaterial color="#ffd166" emissive="#ffd166" emissiveIntensity={0.7} flatShading />
        </mesh>
        <pointLight color="#ffd166" intensity={3} distance={5} />
      </group>

      {/* Safety floor beneath the course so a missed jump respawns via FALL_Y, not through the world */}
      <CuboidCollider args={[30, 0.5, 30]} position={[zone.center[0], FALL_Y - 1, zone.center[1]]} />
    </Physics>
  )
}
