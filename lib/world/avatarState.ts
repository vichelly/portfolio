import type { Containment, StationId } from "@/lib/world/trail"

/**
 * The avatar's live state, mutated in place every frame by the controller and
 * read directly by other useFrame consumers (station panels, camera, trail).
 * Deliberately not React state: nothing here should cause a re-render, because
 * it changes 60 times a second.
 *
 * Anything the DOM needs is published separately, only when it actually
 * changes, through the world store.
 */
export const avatarState = {
  x: 0,
  y: 0,
  z: 0,
  /** Arc-length position along the trail, 0..1. */
  t: 0,
  /** Horizontal speed in units/second. */
  speed: 0,
  grounded: true,
  containment: "trail" as Containment,
  station: null as StationId | null,
  /** Set by anything that needs to place the avatar; the controller consumes it. */
  teleport: null as { x: number; y: number; z: number } | null,
  /** Height of the panel currently on screen, 0 when none. The camera frames
   *  from this, so a small panel is read from close up and a large one from
   *  far enough back to fit - rather than every stop sharing one distance. */
  panelHeight: 0,
  /** Current motion state, so effects can react to walking and landing. */
  motion: "idle" as "idle" | "walk" | "jump" | "fall" | "land",
}

// In development the live state is reachable from the console (and from
// automated walkthroughs), which is the only practical way to inspect a world
// whose truth lives in a render loop rather than in the DOM.
if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
  ;(window as unknown as { __avatarState: typeof avatarState }).__avatarState = avatarState
}
