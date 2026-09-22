"use client"

import { useEffect, useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Text } from "@react-three/drei"
import * as THREE from "three"
import { avatarState } from "@/lib/world/avatarState"
import { registerSolids, unregisterSolids } from "@/lib/world/solids"
import { registerGroundRegion, unregisterGroundRegion } from "@/lib/world/ground"
import type { Solid } from "@/lib/world/physics"
import { DETOUR_CURVE } from "@/lib/world/trail"
import { DETOUR_ACCENT, PALETTE } from "@/lib/world/theme"
import { useWorldStore } from "@/lib/world-store"
import { UI } from "@/lib/i18n/strings"
import { t } from "@/lib/i18n/locale"
import { FONT_BOLD, FONT_REGULAR } from "@/lib/world/panelLayout"

const KEY = "parkour"

/** Arena centre: the far end of the detour curve. */
const ARENA = DETOUR_CURVE.getPointAt(1)
/** The pit opens *past* the start pad, so walking in from the trail is safe and
 *  only stepping off the course drops you. */
const PIT_CENTER: [number, number] = [ARENA.x - 1, ARENA.z - 13]
const PIT_RADIUS = 12
const PIT_Y = -9
const RESPAWN_Y = -4

const local = (dx: number, dz: number): [number, number] => [ARENA.x + dx, ARENA.z + dz]

interface PlatformDef {
  id: string
  center: [number, number]
  /** Top surface height; the box is drawn down to the pit floor's shadow depth. */
  top: number
  size: [number, number]
  color: string
}

const PLATFORMS: PlatformDef[] = [
  { id: "start", center: local(0, 0), top: 0.9, size: [5, 5], color: PALETTE.stone },
  { id: "p1", center: local(2.6, -5.2), top: 1.7, size: [2.8, 2.8], color: DETOUR_ACCENT },
  { id: "p2", center: local(6.4, -8.6), top: 2.5, size: [2.6, 2.6], color: DETOUR_ACCENT },
  { id: "p3", center: local(5.0, -13.2), top: 3.3, size: [2.4, 2.4], color: DETOUR_ACCENT },
]

const MOVER_CENTER: [number, number, number] = [ARENA.x - 1.5, 4.0, ARENA.z - 17]
const MOVER_TRAVEL = 3.4
const MOVER_SPEED = 0.9
const MOVER_SIZE: [number, number] = [2.6, 2.6]

const FINISH_CENTER: [number, number] = local(-5.6, -20.5)
const FINISH_TOP = 4.8

/** Entrance arch over solid ground: walk under it, or crack your head on it. */
const ARCH_CENTER: [number, number] = local(0, 4.5)
const ARCH_CLEARANCE = 2.2
const ARCH_TOP = 3.0
const ARCH_SPAN = 7

const SPAWN = { x: PLATFORMS[0].center[0], y: PLATFORMS[0].top, z: PLATFORMS[0].center[1] }

function boxSolid(id: string, center: [number, number], top: number, size: [number, number], thickness = 1): Solid {
  return {
    id,
    min: [center[0] - size[0] / 2, top - thickness, center[1] - size[1] / 2],
    max: [center[0] + size[0] / 2, top, center[1] + size[1] / 2],
  }
}

/**
 * The optional parkour course. It contributes collision boxes and a pit to the
 * shared world; the avatar that jumps around it is the same body, driven by the
 * same controller, as the one that walks the trail - so nothing about the
 * controls changes at the arena's edge.
 */
export default function ParkourCourse() {
  const locale = useWorldStore((s) => s.locale)
  const moverMesh = useRef<THREE.Mesh>(null)
  const finishMarker = useRef<THREE.Group>(null)
  const moverX = useRef(MOVER_CENTER[0])

  const solids = useMemo<Solid[]>(() => {
    const list = PLATFORMS.map((p) => boxSolid(p.id, p.center, p.top, p.size))
    list.push(boxSolid("finish", FINISH_CENTER, FINISH_TOP, [4.4, 4.4]))
    list.push({
      id: "arch",
      min: [ARCH_CENTER[0] - ARCH_SPAN / 2, ARCH_CLEARANCE, ARCH_CENTER[1] - 0.5],
      max: [ARCH_CENTER[0] + ARCH_SPAN / 2, ARCH_TOP, ARCH_CENTER[1] + 0.5],
    })
    list.push({
      id: "mover",
      min: [MOVER_CENTER[0] - MOVER_SIZE[0] / 2, MOVER_CENTER[1] - 0.6, MOVER_CENTER[2] - MOVER_SIZE[1] / 2],
      max: [MOVER_CENTER[0] + MOVER_SIZE[0] / 2, MOVER_CENTER[1], MOVER_CENTER[2] + MOVER_SIZE[1] / 2],
      delta: [0, 0, 0],
    })
    return list
  }, [])

  useEffect(() => {
    registerSolids(KEY, solids)
    registerGroundRegion(KEY, (x, z) => {
      const dx = x - PIT_CENTER[0]
      const dz = z - PIT_CENTER[1]
      return dx * dx + dz * dz < PIT_RADIUS * PIT_RADIUS ? PIT_Y : null
    })
    return () => {
      unregisterSolids(KEY)
      unregisterGroundRegion(KEY)
    }
  }, [solids])

  useFrame((state) => {
    // Moving platform: authored motion, with the per-frame delta published so
    // the controller can carry whoever is standing on it.
    const mover = solids.find((s) => s.id === "mover")!
    const nextX = MOVER_CENTER[0] + Math.sin(state.clock.elapsedTime * MOVER_SPEED) * MOVER_TRAVEL
    const delta = nextX - moverX.current
    moverX.current = nextX
    mover.min[0] = nextX - MOVER_SIZE[0] / 2
    mover.max[0] = nextX + MOVER_SIZE[0] / 2
    mover.delta = [delta, 0, 0]
    if (moverMesh.current) moverMesh.current.position.x = nextX

    if (finishMarker.current) {
      finishMarker.current.rotation.y = state.clock.elapsedTime * 1.3
      finishMarker.current.position.y =
        FINISH_TOP + 1.1 + Math.sin(state.clock.elapsedTime * 2) * 0.16
    }

    // A missed jump falls into the pit and starts over. Nothing else changes -
    // no content, no trail progress.
    if (avatarState.y < RESPAWN_Y) {
      avatarState.teleport = { ...SPAWN, y: SPAWN.y + 0.6 }
    }
  })

  return (
    <group>
      {/* Pit floor and walls, so the drop reads as a drop */}
      <mesh position={[PIT_CENTER[0], PIT_Y, PIT_CENTER[1]]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[PIT_RADIUS, 48]} />
        <meshStandardMaterial color={PALETTE.stoneDark} flatShading />
      </mesh>
      <mesh position={[PIT_CENTER[0], PIT_Y / 2, PIT_CENTER[1]]}>
        <cylinderGeometry args={[PIT_RADIUS, PIT_RADIUS, Math.abs(PIT_Y), 48, 1, true]} />
        <meshStandardMaterial color={PALETTE.stoneDark} side={THREE.BackSide} flatShading />
      </mesh>

      {/* entrance arch */}
      <mesh
        position={[ARCH_CENTER[0], (ARCH_CLEARANCE + ARCH_TOP) / 2, ARCH_CENTER[1]]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[ARCH_SPAN, ARCH_TOP - ARCH_CLEARANCE, 1]} />
        <meshStandardMaterial color={PALETTE.stone} flatShading />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[ARCH_CENTER[0] + (ARCH_SPAN / 2 - 0.3) * side, ARCH_CLEARANCE / 2, ARCH_CENTER[1]]}
          castShadow
        >
          <boxGeometry args={[0.6, ARCH_CLEARANCE, 0.9]} />
          <meshStandardMaterial color={PALETTE.stoneDark} flatShading />
        </mesh>
      ))}

      {PLATFORMS.map((p) => (
        <mesh
          key={p.id}
          position={[p.center[0], p.top - 0.5, p.center[1]]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[p.size[0], 1, p.size[1]]} />
          <meshStandardMaterial color={p.color} flatShading />
        </mesh>
      ))}

      <mesh
        ref={moverMesh}
        position={[MOVER_CENTER[0], MOVER_CENTER[1] - 0.3, MOVER_CENTER[2]]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[MOVER_SIZE[0], 0.6, MOVER_SIZE[1]]} />
        <meshStandardMaterial color="#e6635a" flatShading />
      </mesh>

      <mesh position={[FINISH_CENTER[0], FINISH_TOP - 0.5, FINISH_CENTER[1]]} castShadow receiveShadow>
        <boxGeometry args={[4.4, 1, 4.4]} />
        <meshStandardMaterial color="#3aa38f" flatShading />
      </mesh>
      <group ref={finishMarker} position={[FINISH_CENTER[0], FINISH_TOP + 1.1, FINISH_CENTER[1]]}>
        <mesh castShadow>
          <octahedronGeometry args={[0.6, 0]} />
          <meshStandardMaterial
            color={DETOUR_ACCENT}
            emissive={DETOUR_ACCENT}
            emissiveIntensity={0.9}
            flatShading
          />
        </mesh>
        <pointLight color={DETOUR_ACCENT} intensity={12} distance={9} />
      </group>

      <Text
        font={FONT_BOLD}
        fontSize={0.45}
        color={DETOUR_ACCENT}
        anchorX="center"
        anchorY="middle"
        position={[SPAWN.x, 2.4, SPAWN.z + 2.6]}
        outlineWidth={0.014}
        outlineColor={PALETTE.ink}
      >
        {t(UI.courseTitle, locale)}
      </Text>
      <Text
        font={FONT_REGULAR}
        fontSize={0.24}
        color={PALETTE.text}
        anchorX="center"
        anchorY="middle"
        position={[SPAWN.x, 1.95, SPAWN.z + 2.6]}
        outlineWidth={0.012}
        outlineColor={PALETTE.ink}
      >
        {t(UI.courseSubtitle, locale)}
      </Text>
    </group>
  )
}
