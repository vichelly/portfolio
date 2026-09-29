"use client"

import { useRef } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"
import { avatarState } from "@/lib/world/avatarState"
import { TRAIL_CURVE } from "@/lib/world/trail"

/** How far behind the avatar, along the trail, the camera sits. */
const BEHIND = 11
const HEIGHT = 8.5
/** At a stop the camera raises what it looks at, so a full panel sits inside
 *  the frame instead of running off the top of it. */
const STATION_HEIGHT = 6.6
const STATION_LOOK_LIFT = 2.2
/** Distance is derived from the panel, not fixed: just far enough that it fits
 *  the frame with a margin, and never closer than this. */
const MIN_STATION_BEHIND = 7
/**
 * Headroom on the exact fit distance.
 *
 * This used to be applied to the panel's height directly - `panelHeight * 1.35`
 * - which is a tuned approximation of the exact vertical fit and has no
 * horizontal term at all. That is why a two-column panel that fitted vertically
 * still ran off both side edges of a tall, narrow screen.
 *
 * The exact vertical fit at fov 55 is `(H/2) / tan(27.5 deg)` = 0.96 x H, so
 * the old 1.35 carried about 1.4x of margin on top of a snug fit. 1.4 here
 * reproduces that framing on a desktop viewport, where the vertical term still
 * binds, while the horizontal term below takes over exactly when it needs to.
 */
const FRAME_MARGIN = 1.4
/** How far ahead of the avatar the camera looks, so the path ahead is visible. */
const LOOK_AHEAD = 6

/**
 * Damping rates, as time constants in the `1 - exp(-k * dt)` form: a channel
 * with rate k closes roughly 1/e of its remaining distance every 1/k seconds,
 * independent of frame rate.
 *
 * These were previously written as `1 - pow(0.001, dt)` and `1 - pow(0.0008, dt)`,
 * which at 60fps are ~0.109 and ~0.113 per frame - a time constant near 0.14 s,
 * close enough to a snap that every bump in the avatar's motion went straight
 * into the frame. Now the camera trails the avatar rather than tracking it
 * rigidly, which matters more than it used to: with obstacles on the main
 * trail the visitor jumps regularly, not just in one optional side area.
 */
const FORWARD_RATE = 4
const POSITION_RATE = 5.5
const LOOK_RATE = 4.5
/** Deliberately slower than POSITION_RATE, so a jump reads as the avatar
 *  rising rather than the world dropping away under a camera chasing every bob. */
const VERTICAL_RATE = 3.5
const FRAMING_RATE = 2.2

/**
 * Follows the avatar from behind along the trail's own direction, rather than
 * from a fixed world offset - so on a bend the camera swings around to keep the
 * next station in frame instead of showing the scenery beside it.
 */
export default function CameraRig() {
  const { camera, scene, gl } = useThree()

  // Same rationale as avatarState: in development the camera is reachable so a
  // walkthrough can work out where a thing in the world lands on screen. The
  // renderer comes with it, so a walkthrough can also read draw-call counts
  // rather than guessing at what the scene costs.
  if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
    const w = window as unknown as {
      __camera: THREE.Camera
      __scene: THREE.Scene
      __gl: THREE.WebGLRenderer
    }
    w.__camera = camera
    w.__scene = scene
    w.__gl = gl
  }
  const desired = useRef(new THREE.Vector3())
  const target = useRef(new THREE.Vector3())
  const forward = useRef(new THREE.Vector3(0, 0, -1))
  const rawForward = useRef(new THREE.Vector3(0, 0, -1))
  const lookScratch = useRef(new THREE.Vector3())
  const smoothedY = useRef(0)
  const framing = useRef(0)

  useFrame((_, delta) => {
    // Forward has exactly one source: the trail curve itself. `t` always
    // reflects where the avatar actually is, so the heading is always live -
    // there is no second curve it could be reading the wrong one of.
    rawForward.current.copy(TRAIL_CURVE.getTangentAt(THREE.MathUtils.clamp(avatarState.t, 0, 1)))
    forward.current.lerp(rawForward.current.setY(0).normalize(), 1 - Math.exp(-FORWARD_RATE * delta))

    // Vertical follow is damped separately and more slowly than the horizontal
    // follow, so a jump arc reads as the avatar rising rather than the world
    // dropping away under a camera that chases every bob.
    smoothedY.current = THREE.MathUtils.lerp(
      smoothedY.current,
      avatarState.y,
      1 - Math.exp(-VERTICAL_RATE * delta),
    )

    // Ease between travelling framing and reading framing.
    framing.current = THREE.MathUtils.lerp(
      framing.current,
      avatarState.station ? 1 : 0,
      1 - Math.exp(-FRAMING_RATE * delta),
    )
    // How far back the panel has to be read from, in both dimensions.
    //
    //   vertical:   d = (H / 2) / tan(fov / 2)
    //   horizontal: d = (W / 2) / (tan(fov / 2) * aspect)
    //
    // `fov` is the vertical field of view, so the horizontal half-angle is
    // `tan(fov/2) * aspect` - which is why a tall narrow viewport frames a much
    // narrower slice of the world and a wide panel has to be read from further
    // away there than on a desktop. Aspect is read live, so rotating a phone
    // or resizing a window re-frames rather than staying wrong until the
    // visitor walks away and comes back.
    const perspective = camera as THREE.PerspectiveCamera
    const halfFov = THREE.MathUtils.degToRad(perspective.fov) / 2
    const tanHalfFov = Math.tan(halfFov)
    const fitVertical = avatarState.panelHeight / 2 / tanHalfFov
    const fitHorizontal = avatarState.panelWidth / 2 / (tanHalfFov * perspective.aspect)

    const stationBehind = Math.max(
      MIN_STATION_BEHIND,
      FRAME_MARGIN * Math.max(fitVertical, fitHorizontal),
    )
    const behind = THREE.MathUtils.lerp(BEHIND, stationBehind, framing.current)
    const height = THREE.MathUtils.lerp(HEIGHT, STATION_HEIGHT, framing.current)

    desired.current.set(
      avatarState.x - forward.current.x * behind,
      smoothedY.current + height,
      avatarState.z - forward.current.z * behind,
    )
    camera.position.lerp(desired.current, 1 - Math.exp(-POSITION_RATE * delta))

    lookScratch.current.set(
      avatarState.x + forward.current.x * LOOK_AHEAD,
      smoothedY.current + 1.2 + STATION_LOOK_LIFT * framing.current,
      avatarState.z + forward.current.z * LOOK_AHEAD,
    )
    target.current.lerp(lookScratch.current, 1 - Math.exp(-LOOK_RATE * delta))
    camera.lookAt(target.current)
  })

  return null
}
