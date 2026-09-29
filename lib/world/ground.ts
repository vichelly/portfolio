import { GROUND_Y } from "@/lib/world/trail"

/**
 * Ground height of the world surface. The world is flat: anything the avatar
 * can stand on above it is a solid resolved by the collision resolver, not a
 * height override, so this is a constant rather than a registry.
 *
 * It stays a function because the character controller calls it per frame with
 * the position it is resolving, and because a future raised region would slot
 * in here without touching the controller.
 */
export function groundYAt(_x: number, _z: number): number {
  return GROUND_Y
}
