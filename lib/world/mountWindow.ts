import { useRef, useState } from "react"
import { useFrame } from "@react-three/fiber"
import { avatarState } from "@/lib/world/avatarState"
import { TRAIL_LENGTH } from "@/lib/world/trail"

/**
 * How the world decides what is in the scene graph at all.
 *
 * Two thresholds, not one. Mounting and unmounting at the same distance means
 * an avatar standing exactly on that distance flips the object on and off with
 * every small movement - the object flickers, and the scene graph churns. The
 * exit threshold sits further out than the entry threshold, so the band a
 * thing must cross to leave is wider than the one that let it in, and standing
 * still anywhere inside it cannot flip the decision.
 *
 * The entry distance is also deliberately wider than the distance at which a
 * station's content starts fading up, so a thing is always fully transparent
 * before it is unmounted and fully mounted before it starts to appear. That is
 * what makes content fade rather than pop.
 */
export const MOUNT_ENTER_UNITS = 26
export const MOUNT_EXIT_UNITS = 32

/**
 * The band over which a mounted thing fades up, in units of distance along the
 * trail. It sits strictly inside the mount window and strictly outside the
 * plaza radius:
 *
 *   32 unmount .. 26 mount .. 24 fade starts .. 16 fully opaque .. 9 plaza
 *
 * so a thing is always mounted before it is visible and always invisible
 * before it is unmounted. That ordering is the whole trick - it is what turns
 * a pop into a fade, and it is why the two pairs of numbers have to be read
 * together rather than tuned independently.
 */
export const FADE_START_UNITS = 24
export const FADE_END_UNITS = 16

/** 0 at the far edge of the fade band, 1 once inside it. Smooth, not linear. */
export function fadeAt(distance: number): number {
  if (distance <= FADE_END_UNITS) return 1
  if (distance >= FADE_START_UNITS) return 0
  const x = (FADE_START_UNITS - distance) / (FADE_START_UNITS - FADE_END_UNITS)
  return x * x * (3 - 2 * x)
}

export interface Windowed {
  id: string
  /** Arc-length position along the trail, 0..1. */
  t: number
}

/** Arc-length distance between two normalized trail positions, in world units. */
export function distanceAlong(a: number, b: number): number {
  return Math.abs(a - b) * TRAIL_LENGTH
}

/**
 * The next mounted set, given the previous one. Pure, so it can be tested and
 * reasoned about without a React tree: an item already mounted stays mounted
 * until it passes the exit distance; one not mounted waits for the entry
 * distance.
 */
export function nextMounted<T extends Windowed>(
  previous: ReadonlySet<string>,
  t: number,
  items: readonly T[],
): Set<string> {
  const next = new Set<string>()
  for (const item of items) {
    const d = distanceAlong(t, item.t)
    const limit = previous.has(item.id) ? MOUNT_EXIT_UNITS : MOUNT_ENTER_UNITS
    if (d <= limit) next.add(item.id)
  }
  return next
}

/** True when two sets hold exactly the same ids. */
function sameSet(a: ReadonlySet<string>, b: ReadonlySet<string>): boolean {
  if (a.size !== b.size) return false
  for (const id of a) if (!b.has(id)) return false
  return true
}

/**
 * The mounted subset of `items` for the avatar's current position.
 *
 * Evaluated against the live avatar position every frame, but it re-renders
 * only when the mounted SET actually changes. That distinction is the whole
 * point of this hook.
 *
 * This used to be driven from `progressPercent` in the world store - a value
 * published for the HUD's progress rail. Every whole percent of progress
 * re-rendered the entire 3D tree: about a hundred times per walk, roughly four
 * times a second, each one re-running every `useMemo` keyed on `t`, refiltering
 * the decor table and rewriting instance matrices. The mounted set, meanwhile,
 * changes fifteen times on that same walk. Reading the position directly and
 * publishing only real changes closes a 100:15 ratio to 15:15.
 *
 * Calling `setState` from a frame callback is safe here precisely because of
 * the hysteresis in `nextMounted`: a set change means a threshold was genuinely
 * crossed, and the entry and exit thresholds are far enough apart that no
 * amount of standing still or jittering at a boundary can flip it.
 */
export function useMountWindow<T extends Windowed>(items: readonly T[]): T[] {
  // The set the world starts with, so the server render, the first client
  // render, and the first frame all agree.
  const previous = useRef<Set<string>>(nextMounted(new Set(), 0, items))
  const [mounted, setMounted] = useState<T[]>(() =>
    items.filter((item) => previous.current.has(item.id)),
  )

  useFrame(() => {
    const next = nextMounted(previous.current, avatarState.t, items)
    if (sameSet(next, previous.current)) return
    previous.current = next
    setMounted(items.filter((item) => next.has(item.id)))
  })

  return mounted
}

/**
 * The grid the edges of a distance-windowed slice snap to, in world units
 * along the trail.
 *
 * The snapping has to be applied to where each edge SITS, not to how wide the
 * window is. Rounding the width and then centring it on a continuously moving
 * avatar leaves both edges moving continuously, which is the thing this is
 * meant to stop - measured, that version was worse than no windowing at all
 * (171 rewrites per walk against 100). Rounding each edge outward onto a fixed
 * grid means the edges only move when the avatar crosses a grid line.
 *
 * It matters because the decor table holds roughly 480 props over 172.8 units:
 * with a freely moving edge a prop crosses it about eighteen times a second,
 * and every crossing rewrites every instance matrix in every batch. On a
 * 16-unit grid each edge moves 172.8/16 ≈ 11 times over a whole walk, and the
 * window never covers less than the radius asked for - only up to 16 units
 * more, which is far enough out to sit behind the fog.
 */
export const SLICE_QUANTUM = 16

export interface Placed {
  /** Arc-length position along the trail, 0..1. */
  t: number
}

/**
 * The contiguous run of `items` within `radius` of the avatar, as a slice.
 *
 * `items` MUST be ordered by `t` ascending - the decor table is generated by
 * walking the trail, so it already is. That ordering is what makes the visible
 * set a contiguous range rather than a filter over the whole table, and a range
 * can be compared in two numbers rather than by rebuilding an array to find out
 * whether anything changed.
 */
export function useFrameSlice<T extends Placed>(items: readonly T[], radius: number): T[] {
  const bounds = useRef<[number, number]>([-1, -1])
  const [slice, setSlice] = useState<readonly T[]>(items)

  useFrame(() => {
    // Each edge is pushed outward onto the grid, so the window always covers
    // at least `radius` and its edges only move when the avatar crosses a
    // grid line. A tier change moves `radius` and is picked up here on the
    // next frame, with no separate code path.
    const here = avatarState.t * TRAIL_LENGTH
    const lowT = (Math.floor((here - radius) / SLICE_QUANTUM) * SLICE_QUANTUM) / TRAIL_LENGTH
    const highT = (Math.ceil((here + radius) / SLICE_QUANTUM) * SLICE_QUANTUM) / TRAIL_LENGTH

    let start = 0
    while (start < items.length && items[start].t < lowT) start++
    let end = items.length
    while (end > start && items[end - 1].t > highT) end--

    const [prevStart, prevEnd] = bounds.current
    if (start === prevStart && end === prevEnd) return
    bounds.current = [start, end]
    setSlice(items.slice(start, end))
  })

  return slice as T[]
}
