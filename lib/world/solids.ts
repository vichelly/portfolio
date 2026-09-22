import type { Solid } from "@/lib/world/physics"

/**
 * Collision geometry currently present in the world, keyed by whatever mounted
 * it. The trail itself contributes nothing - it is flat - so this is empty
 * unless the parkour course is mounted. Kept outside React state because the
 * character controller reads it every frame.
 */
const registry = new Map<string, Solid[]>()
let flattened: Solid[] = []

function rebuild() {
  flattened = [...registry.values()].flat()
}

export function registerSolids(key: string, solids: Solid[]) {
  registry.set(key, solids)
  rebuild()
}

export function unregisterSolids(key: string) {
  registry.delete(key)
  rebuild()
}

export function activeSolids(): readonly Solid[] {
  return flattened
}
