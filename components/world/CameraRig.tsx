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
/** Distance is derived from the panel, not fixed: just far enough that its
 *  height fits the frame with a margin, and never closer than this. */
const MIN_STATION_BEHIND = 7
const FRAME_MARGIN = 1.35
/** How far ahead of the avatar the camera looks, so the path ahead is visible. */
const LOOK_AHEAD = 6

/**
 * Follows the avatar from behind along the trail's own direction, rather than
 * from a fixed world offset - so on a bend the camera swings around to keep the
 * next station in frame instead of showing the scenery beside it.
 */
export default function CameraRig() {
  const { camera, scene } = useThree()

  // Same rationale as avatarState: in development the camera is reachable so a
  // walkthrough can work out where a thing in the world lands on screen.
  if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
    const w = window as unknown as { __camera: THREE.Camera; __scene: THREE.Scene }
    w.__camera = camera
    w.__scene = scene
  }
  const desired = useRef(new THREE.Vector3())
  const target = useRef(new THREE.Vector3())
  const forward = useRef(new THREE.Vector3(0, 0, -1))
  const rawForward = useRef(new THREE.Vector3(0, 0, -1))
  const lookScratch = useRef(new THREE.Vector3())
  const smoothedY = useRef(0)
  const framing = useRef(0)

  useFrame((_, delta) => {
    // On the trail, forward comes from the trail curve itself - t always
    // reflects where the avatar actually is. Inside the parkour detour, t is
    // frozen at the point of entry (it is arc-length along the MAIN trail,
    // which the avatar has left), so it cannot supply a heading there; the
    // avatar's own movement-derived facing is used instead.
    if (avatarState.containment === "detour") {
      rawForward.current.set(Math.sin(avatarState.facing), 0, Math.cos(avatarState.facing))
    } else {
      rawForward.current.copy(TRAIL_CURVE.getTangentAt(THREE.MathUtils.clamp(avatarState.t, 0, 1)))
    }
    forward.current.lerp(rawForward.current.setY(0).normalize(), 1 - Math.exp(-4 * delta))

    // Vertical follow is damped separately and more slowly than the horizontal
    // follow, so a jump arc reads as the avatar rising rather than the world
    // dropping away under a camera that chases every bob.
    smoothedY.current = THREE.MathUtils.lerp(
      smoothedY.current,
      avatarState.y,
      1 - Math.exp(-3.5 * delta),
    )

    // Ease between travelling framing and reading framing.
    framing.current = THREE.MathUtils.lerp(
      framing.current,
      avatarState.station ? 1 : 0,
      1 - Math.exp(-2.2 * delta),
    )
    const stationBehind = Math.max(
      MIN_STATION_BEHIND,
      avatarState.panelHeight * FRAME_MARGIN,
    )
    const behind = THREE.MathUtils.lerp(BEHIND, stationBehind, framing.current)
    const height = THREE.MathUtils.lerp(HEIGHT, STATION_HEIGHT, framing.current)

    desired.current.set(
      avatarState.x - forward.current.x * behind,
      smoothedY.current + height,
      avatarState.z - forward.current.z * behind,
    )
    camera.position.lerp(desired.current, 1 - Math.pow(0.001, delta))

    lookScratch.current.set(
      avatarState.x + forward.current.x * LOOK_AHEAD,
      smoothedY.current + 1.2 + STATION_LOOK_LIFT * framing.current,
      avatarState.z + forward.current.z * LOOK_AHEAD,
    )
    target.current.lerp(lookScratch.current, 1 - Math.pow(0.0008, delta))
    camera.lookAt(target.current)
  })

  return null
}
