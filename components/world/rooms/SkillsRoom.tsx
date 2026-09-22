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

const nonCertSkills = skills.filter((s) => s.id !== "agile")

export default function SkillsRoom({ avatarRef, onTrigger }: RoomProps) {
  const zone = zoneFor("skills")
  const positions = ringPositions(zone, nonCertSkills.length)

  return (
    <group>
      <ZoneFloor zone={zone} />
      <RoomSign zone={zone} />
      {nonCertSkills.map((s, i) => (
        <PointOfInterest
          key={s.id}
          id={s.id}
          position={positions[i]}
          color="#2a9d8f"
          label={s.title}
          avatarRef={avatarRef}
          onTrigger={onTrigger}
        />
      ))}
    </group>
  )
}
