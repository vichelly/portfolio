"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { avatarState } from "@/lib/world/avatarState"
import { TRAIL_LENGTH } from "@/lib/world/trail"
import { fadeAt } from "@/lib/world/mountWindow"

/**
 * Fades everything inside it up as the avatar approaches `t` along the trail,
 * and back down as they leave. Paired with the mount window, whose thresholds
 * sit outside this band, so nothing is ever mounted while visible or visible
 * while unmounting - which is what stops plazas popping into existence.
 *
 * Opacity is written straight onto the materials in a useFrame rather than
 * held in React state: it changes every frame, and nothing here should cause
 * a re-render. The original opacity is remembered per material, so a surface
 * that was already semi-transparent stays that way at full fade.
 */
export default function DistanceFade({
  t,
  children,
}: {
  t: number
  children: React.ReactNode
}) {
  const group = useRef<THREE.Group>(null)
  const current = useRef(-1)

  useFrame(() => {
    const g = group.current
    if (!g) return

    const fade = fadeAt(Math.abs(avatarState.t - t) * TRAIL_LENGTH)
    // Materials are shared between meshes, so only walk the tree when the
    // value has actually moved - at rest this costs one subtraction a frame.
    if (Math.abs(fade - current.current) < 0.002) return
    current.current = fade

    g.visible = fade > 0
    if (!g.visible) return

    g.traverse((object) => {
      const mesh = object as THREE.Mesh
      const material = mesh.material as THREE.Material & { opacity: number }
      if (!mesh.isMesh || !material || typeof material.opacity !== "number") return

      if (material.userData.baseOpacity === undefined) {
        material.userData.baseOpacity = material.opacity
      }
      const base = material.userData.baseOpacity as number
      // Transparency is only switched on while actually fading: a transparent
      // material is sorted and blended rather than depth-tested, which is both
      // slower and prone to ordering artefacts.
      material.transparent = fade < 1 || base < 1
      material.opacity = base * fade
      material.depthWrite = material.transparent ? false : true
      material.needsUpdate = false
    })
  })

  return <group ref={group}>{children}</group>
}
