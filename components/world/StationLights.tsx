"use client"

import { useEffect, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { avatarState } from "@/lib/world/avatarState"
import {
  PLAZA_FRAME,
  PLAZA_LIGHT,
  PLAZA_LIGHT_COUNT,
  nearestPlazas,
} from "@/lib/world/plaza"
import { STATION_ACCENT } from "@/lib/world/theme"
import type { StationId } from "@/lib/world/trail"

/**
 * The accent lights at the plazas - two of them, for the whole session.
 *
 * Every station used to carry its own `pointLight`, which meant the scene's
 * light count changed every time one mounted or unmounted. Three.js keys its
 * compiled-program cache on the light configuration, so each of those changes
 * recompiled every material in the world. Measured on this scene: adding one
 * point light compiled ten new programs and took 281.9 ms in a single frame,
 * and a full walk crossed a mount boundary fifteen times.
 *
 * So the number of lights is now a constant of the world rather than a
 * function of where the avatar is standing. The two lights track the two
 * nearest plazas, taking their position and accent colour; a light whose
 * plaza is out of reach simply contributes nothing, because `distance`
 * attenuates it to zero, rather than being removed from the scene.
 *
 * Reassignment is safe precisely because of the budget this rig is sized to:
 * a plaza only drops out of the nearest two when two others are nearer, and
 * `assertPlazaLightBudget` guarantees no more than two are ever within reach -
 * so a light is always already dark at the moment it is handed a new plaza,
 * and the switch cannot be seen.
 */
export default function StationLights() {
  const lights = useRef<(THREE.PointLight | null)[]>([])
  const assigned = useRef<(StationId | null)[]>(
    Array.from({ length: PLAZA_LIGHT_COUNT }, () => null),
  )
  const nearest = useRef<StationId[]>([])

  // Place them once before the first frame, so the intro plaza is lit on the
  // frame it is first drawn rather than one frame later.
  useEffect(() => {
    apply(lights.current, assigned.current, nearest.current, avatarState.x, avatarState.z)
  }, [])

  useFrame(() => {
    apply(lights.current, assigned.current, nearest.current, avatarState.x, avatarState.z)
  })

  return (
    <>
      {Array.from({ length: PLAZA_LIGHT_COUNT }, (_, i) => (
        <pointLight
          key={i}
          ref={(l) => {
            lights.current[i] = l
          }}
          intensity={PLAZA_LIGHT.intensity}
          distance={PLAZA_LIGHT.distance}
        />
      ))}
    </>
  )
}

function apply(
  lights: (THREE.PointLight | null)[],
  assigned: (StationId | null)[],
  nearest: StationId[],
  x: number,
  z: number,
) {
  nearestPlazas(x, z, nearest)

  // Keep a light on the plaza it already holds whenever that plaza is still
  // one of the nearest two. Only the light whose plaza has dropped out gets
  // reassigned, so the lights do not swap places every time the ranking does.
  for (let i = 0; i < PLAZA_LIGHT_COUNT; i++) {
    const held = assigned[i]
    if (held !== null && !nearest.includes(held)) assigned[i] = null
  }
  for (const id of nearest) {
    if (assigned.includes(id)) continue
    const free = assigned.indexOf(null)
    if (free !== -1) assigned[free] = id
  }

  for (let i = 0; i < PLAZA_LIGHT_COUNT; i++) {
    const light = lights[i]
    const id = assigned[i]
    if (!light || id === null) continue
    const { panelAnchor } = PLAZA_FRAME[id]
    light.position.set(panelAnchor[0], PLAZA_LIGHT.height, panelAnchor[1])
    light.color.set(STATION_ACCENT[id])
  }
}
