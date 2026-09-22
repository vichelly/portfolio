"use client"

import ZoneFloor from "@/components/world/ZoneFloor"
import PointOfInterest from "@/components/world/PointOfInterest"
import { ZONES, zoneFor } from "@/lib/world/layout"
import type { AvatarHandle } from "@/components/world/Avatar"

interface HubProps {
  avatarRef: React.RefObject<AvatarHandle | null>
  onTrigger: (id: string) => void
}

const ENTRANCE_TARGETS = ["experience", "skills", "certifications", "projects"] as const

export default function Hub({ avatarRef, onTrigger }: HubProps) {
  const hub = zoneFor("hub")

  return (
    <group>
      <ZoneFloor zone={hub} />

      {/* Pathways: simple strips of ground connecting the hub to each zone,
          plus an entrance marker pillar at the hub boundary pointing there. */}
      {ZONES.filter((z) => z.id !== "hub").map((zone) => {
        const dx = zone.center[0] - hub.center[0]
        const dz = zone.center[1] - hub.center[1]
        const dist = Math.hypot(dx, dz)
        const midX = hub.center[0] + dx / 2
        const midZ = hub.center[1] + dz / 2
        const angle = Math.atan2(dx, dz)
        const entranceX = hub.center[0] + (dx / dist) * (hub.radius - 0.5)
        const entranceZ = hub.center[1] + (dz / dist) * (hub.radius - 0.5)

        return (
          <group key={zone.id}>
            <mesh position={[midX, -0.02, midZ]} rotation={[-Math.PI / 2, 0, angle]} receiveShadow>
              <planeGeometry args={[2.5, dist - hub.radius - zone.radius]} />
              <meshStandardMaterial color="#d8cfa8" flatShading />
            </mesh>
            {ENTRANCE_TARGETS.includes(zone.id as (typeof ENTRANCE_TARGETS)[number]) && (
              <group position={[entranceX, 0, entranceZ]} rotation={[0, angle, 0]}>
                <mesh position={[-1.3, 1.4, 0]} castShadow>
                  <cylinderGeometry args={[0.22, 0.26, 2.8, 6]} />
                  <meshStandardMaterial color={zone.accent} flatShading />
                </mesh>
                <mesh position={[1.3, 1.4, 0]} castShadow>
                  <cylinderGeometry args={[0.22, 0.26, 2.8, 6]} />
                  <meshStandardMaterial color={zone.accent} flatShading />
                </mesh>
                <mesh position={[0, 2.85, 0]}>
                  <boxGeometry args={[3.1, 0.3, 0.35]} />
                  <meshStandardMaterial color={zone.accent} flatShading />
                </mesh>
                {/* peaked roof */}
                <mesh position={[0, 3.35, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
                  <coneGeometry args={[1.9, 0.9, 4]} />
                  <meshStandardMaterial color={zone.color} flatShading />
                </mesh>
                {/* pennant flag */}
                <mesh position={[0, 4.1, 0]}>
                  <coneGeometry args={[0.28, 0.5, 3]} />
                  <meshStandardMaterial color={zone.color} flatShading />
                </mesh>
              </group>
            )}
          </group>
        )
      })}

      {/* Contact kiosk - reachable directly in the hub, not gated behind any room */}
      <PointOfInterest
        id="contact"
        position={[4, 1.4, 4]}
        color="#ffd166"
        label="Contact"
        avatarRef={avatarRef}
        onTrigger={onTrigger}
        triggerRadius={2.4}
      />
    </group>
  )
}
