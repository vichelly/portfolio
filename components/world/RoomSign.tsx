"use client"

import { Billboard, Text } from "@react-three/drei"
import type { ZoneDef } from "@/lib/world/layout"

interface RoomSignProps {
  zone: ZoneDef
  height?: number
}

/**
 * A signboard planted above a room: two posts, a backing panel, and
 * billboarded 3D text (name + tagline) that always faces the camera so it
 * reads clearly from any approach angle - makes each room identifiable
 * and descriptive from across the hub.
 */
export default function RoomSign({ zone, height = 6.5 }: RoomSignProps) {
  // Place the sign on the edge of the zone facing the hub (origin), so it's
  // the first thing a visitor sees walking in from the hub.
  const dist = Math.hypot(zone.center[0], zone.center[1]) || 1
  const towardHubX = -zone.center[0] / dist
  const towardHubZ = -zone.center[1] / dist
  const signX = zone.center[0] + towardHubX * zone.radius * 0.6
  const signZ = zone.center[1] + towardHubZ * zone.radius * 0.6

  return (
    <group position={[signX, 0, signZ]}>
      {/* posts */}
      <mesh position={[-2.1, height / 2, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.18, height, 6]} />
        <meshStandardMaterial color={zone.accent} flatShading />
      </mesh>
      <mesh position={[2.1, height / 2, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.18, height, 6]} />
        <meshStandardMaterial color={zone.accent} flatShading />
      </mesh>

      {/* backing panel */}
      <mesh position={[0, height, 0]} castShadow>
        <boxGeometry args={[5, 1.7, 0.25]} />
        <meshStandardMaterial color={zone.color} flatShading />
      </mesh>
      <mesh position={[0, height, 0.14]}>
        <boxGeometry args={[4.6, 1.3, 0.06]} />
        <meshStandardMaterial color="#fffaf0" flatShading />
      </mesh>

      <Billboard position={[0, height, 0.2]}>
        <Text fontSize={0.62} color={zone.accent} anchorY="middle" anchorX="center" position={[0, 0.28, 0]}>
          {zone.label}
        </Text>
        <Text fontSize={0.26} color="#555" anchorY="middle" anchorX="center" position={[0, -0.28, 0]}>
          {zone.tagline}
        </Text>
      </Billboard>
    </group>
  )
}
