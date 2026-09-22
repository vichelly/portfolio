import { GROUND_Y } from "@/lib/world/trail"

export type GroundRegion = (x: number, z: number) => number | null

/**
 * Ground height overrides contributed by whatever is mounted. The world is flat
 * by default; the parkour course uses this to open a pit under itself, so a
 * missed jump is a real fall rather than a step onto the lawn.
 */
const regions = new Map<string, GroundRegion>()

export function registerGroundRegion(key: string, region: GroundRegion) {
  regions.set(key, region)
}

export function unregisterGroundRegion(key: string) {
  regions.delete(key)
}

export function groundYAt(x: number, z: number): number {
  for (const region of regions.values()) {
    const y = region(x, z)
    if (y !== null) return y
  }
  return GROUND_Y
}
