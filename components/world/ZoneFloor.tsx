"use client"

import type { ZoneDef } from "@/lib/world/layout"

interface ZoneFloorProps {
  zone: ZoneDef
}

/** A low raised platform (not a flat decal) with a contrasting rim, so each room reads as a distinct place. */
export default function ZoneFloor({ zone }: ZoneFloorProps) {
  return (
    <group position={[zone.center[0], 0, zone.center[1]]}>
      {/* top face sits exactly at y=0, so avatar/POI Y assumptions stay valid; the puck extends downward for depth */}
      <mesh position={[0, -0.09, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[zone.radius, zone.radius + 0.4, 0.18, 32]} />
        <meshStandardMaterial color={zone.color} flatShading />
      </mesh>
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[zone.radius + 0.45, zone.radius + 0.45, 0.16, 32]} />
        <meshStandardMaterial color={zone.accent} flatShading />
      </mesh>
    </group>
  )
}

/** Arranges `count` points evenly on a ring inside a zone, in world XZ space. */
export function ringPositions(zone: ZoneDef, count: number, ringRadius?: number): [number, number, number][] {
  const r = ringRadius ?? zone.radius * 0.6
  const positions: [number, number, number][] = []
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2
    positions.push([zone.center[0] + Math.cos(angle) * r, 1.4, zone.center[1] + Math.sin(angle) * r])
  }
  return positions
}
