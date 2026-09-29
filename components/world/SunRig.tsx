"use client"

import { useEffect, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { avatarState } from "@/lib/world/avatarState"
import { PALETTE, SUN_DIRECTION } from "@/lib/world/theme"

interface SunRigProps {
  shadowMapSize: number
  /** Half-width of the shadow camera's box, in world units. */
  shadowExtent: number
}

/**
 * The sun, and the only shadow camera in the world.
 *
 * It follows the avatar. Before, the light sat at a fixed world position with
 * its target defaulting to the origin and a +/-70 unit shadow box, while the
 * trail runs from z = +16 to z = -140 - so everything past roughly z = -80
 * (the fiap, certifications and contact plazas) fell outside the box and
 * neither cast nor received a shadow. Half the walk had no shadows at all.
 *
 * Following the avatar also makes the shadows better *and* cheaper: the box
 * only has to cover what is on screen, so it shrinks from +/-70 to +/-32 and
 * the same shadow map spreads over a fifth of the area.
 *
 * The target is snapped to whole shadow-map texels. Without that the
 * projection slides continuously as the avatar walks and shadow edges crawl
 * and shimmer along every surface - the classic artefact of a moving
 * directional shadow camera, and very visible on flat ground like this trail.
 */
export default function SunRig({ shadowMapSize, shadowExtent }: SunRigProps) {
  const light = useRef<THREE.DirectionalLight>(null)
  const target = useRef<THREE.Object3D>(null)
  const snapped = useRef(new THREE.Vector3())

  // The distance the light sits back along the sun direction. Far enough that
  // the whole box is in front of its near plane.
  const back = shadowExtent * 2.6

  useEffect(() => {
    const l = light.current
    if (l && target.current) l.target = target.current
  }, [])

  useFrame(() => {
    const l = light.current
    const tgt = target.current
    if (!l || !tgt) return

    // One texel of the shadow map, in world units.
    const texel = (shadowExtent * 2) / shadowMapSize
    snapped.current.set(
      Math.round(avatarState.x / texel) * texel,
      0,
      Math.round(avatarState.z / texel) * texel,
    )

    tgt.position.copy(snapped.current)
    tgt.updateMatrixWorld()

    l.position.set(
      snapped.current.x + SUN_DIRECTION.x * back,
      SUN_DIRECTION.y * back,
      snapped.current.z + SUN_DIRECTION.z * back,
    )
    l.updateMatrixWorld()
  })

  return (
    <>
      <object3D ref={target} />
      <directionalLight
        ref={light}
        color={PALETTE.sun}
        intensity={2.8}
        castShadow
        shadow-mapSize={[shadowMapSize, shadowMapSize]}
        shadow-camera-left={-shadowExtent}
        shadow-camera-right={shadowExtent}
        shadow-camera-top={shadowExtent}
        shadow-camera-bottom={-shadowExtent}
        shadow-camera-near={0.5}
        shadow-camera-far={back * 2}
        shadow-bias={-0.0006}
        shadow-normalBias={0.02}
      />
    </>
  )
}
