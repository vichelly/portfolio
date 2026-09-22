"use client"

import ZoneFloor, { ringPositions } from "@/components/world/ZoneFloor"
import PointOfInterest from "@/components/world/PointOfInterest"
import RoomSign from "@/components/world/RoomSign"
import { zoneFor } from "@/lib/world/layout"
import { skills } from "@/lib/content/skills"
import type { AvatarHandle } from "@/components/world/Avatar"

interface RoomProps {
  avatarRef: React.RefObject<AvatarHandle | null>
  onTrigger: (id: string) => void
}

const certSkills = skills.filter((s) => s.id === "agile")

export default function CertificationsRoom({ avatarRef, onTrigger }: RoomProps) {
  const zone = zoneFor("certifications")
  const positions = ringPositions(zone, certSkills.length, zone.radius * 0.3)

  return (
    <group>
      <ZoneFloor zone={zone} />
      <RoomSign zone={zone} />
      {certSkills.map((s, i) => (
        <PointOfInterest
          key={s.id}
          id={s.id}
          position={positions[i]}
          color="#9d4edd"
          label="PSPO I"
          avatarRef={avatarRef}
          onTrigger={onTrigger}
        />
      ))}
    </group>
  )
}
