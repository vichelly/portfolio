import type { RoomId } from "@/lib/world-store"

export interface ZoneDef {
  id: RoomId
  label: string
  tagline: string
  center: [number, number]
  radius: number
  activationRadius: number
  color: string
  accent: string
}

/**
 * All zones sit on one continuous ground plane (XZ), so moving between them
 * never triggers a route change or scene teardown - only proximity-based
 * mount/unmount of that zone's detail content.
 */
export const ZONES: ZoneDef[] = [
  {
    id: "hub",
    label: "Hub",
    tagline: "Start here",
    center: [0, 0],
    radius: 12,
    activationRadius: 16,
    color: "#f6c453",
    accent: "#e0a020",
  },
  {
    id: "experience",
    label: "Experience",
    tagline: "Where the career happened",
    center: [0, -38],
    radius: 12,
    activationRadius: 20,
    color: "#4ea8f2",
    accent: "#1d3557",
  },
  {
    id: "skills",
    label: "Skills",
    tagline: "The toolbox",
    center: [38, 0],
    radius: 12,
    activationRadius: 20,
    color: "#4ef2a8",
    accent: "#1b7a53",
  },
  {
    id: "certifications",
    label: "Certifications",
    tagline: "Official stamps of approval",
    center: [0, 38],
    radius: 12,
    activationRadius: 20,
    color: "#c589f7",
    accent: "#6a2c91",
  },
  {
    id: "projects",
    label: "Projects",
    tagline: "Things that got shipped",
    center: [-38, 0],
    radius: 12,
    activationRadius: 20,
    color: "#f28e4e",
    accent: "#b3491a",
  },
  {
    id: "parkour",
    label: "Parkour Course",
    tagline: "Optional - just for fun",
    center: [40, -40],
    radius: 10,
    activationRadius: 22,
    color: "#f2e94e",
    accent: "#a89400",
  },
]

export const WORLD_BOUNDS_RADIUS = 62

export function zoneFor(id: RoomId): ZoneDef {
  const zone = ZONES.find((z) => z.id === id)
  if (!zone) throw new Error(`Unknown zone: ${id}`)
  return zone
}

export function distanceToZone(x: number, z: number, zone: ZoneDef) {
  const dx = x - zone.center[0]
  const dz = z - zone.center[1]
  return Math.sqrt(dx * dx + dz * dz)
}

export function activeZoneAt(x: number, z: number): RoomId {
  for (const zone of ZONES) {
    if (zone.id === "hub") continue
    if (distanceToZone(x, z, zone) <= zone.radius) return zone.id
  }
  return "hub"
}
