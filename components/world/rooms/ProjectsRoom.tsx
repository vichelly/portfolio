"use client"

import ZoneFloor, { ringPositions } from "@/components/world/ZoneFloor"
import PointOfInterest from "@/components/world/PointOfInterest"
import RoomSign from "@/components/world/RoomSign"
import { zoneFor } from "@/lib/world/layout"
import { projects } from "@/lib/content/projects"
import type { AvatarHandle } from "@/components/world/Avatar"

interface RoomProps {
  avatarRef: React.RefObject<AvatarHandle | null>
  onTrigger: (id: string) => void
}

export default function ProjectsRoom({ avatarRef, onTrigger }: RoomProps) {
  const zone = zoneFor("projects")
  const positions = ringPositions(zone, projects.length)

  return (
    <group>
      <ZoneFloor zone={zone} />
      <RoomSign zone={zone} />
      {projects.map((p, i) => (
        <PointOfInterest
          key={p.id}
          id={p.id}
          position={positions[i]}
          color="#e76f51"
          label={p.title}
          avatarRef={avatarRef}
          onTrigger={onTrigger}
        />
      ))}
    </group>
  )
}
