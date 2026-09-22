"use client"

import ZoneFloor, { ringPositions } from "@/components/world/ZoneFloor"
import PointOfInterest from "@/components/world/PointOfInterest"
import RoomSign from "@/components/world/RoomSign"
import { zoneFor } from "@/lib/world/layout"
import { experience } from "@/lib/content/experience"
import type { AvatarHandle } from "@/components/world/Avatar"

interface RoomProps {
  avatarRef: React.RefObject<AvatarHandle | null>
  onTrigger: (id: string) => void
}

export default function ExperienceRoom({ avatarRef, onTrigger }: RoomProps) {
  const zone = zoneFor("experience")
  const positions = ringPositions(zone, experience.length)

  return (
    <group>
      <ZoneFloor zone={zone} />
      <RoomSign zone={zone} />
      {experience.map((entry, i) => (
        <PointOfInterest
          key={entry.id}
          id={entry.id}
          position={positions[i]}
          color="#1d3557"
          label={entry.company}
          avatarRef={avatarRef}
          onTrigger={onTrigger}
        />
      ))}
    </group>
  )
}
