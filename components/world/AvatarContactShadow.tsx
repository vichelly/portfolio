"use client"

import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { avatarState } from "@/lib/world/avatarState"

/**
 * The soft contact shadow under the avatar's feet.
 *
 * This replaces a `<ContactShadows>` rig that had two problems. It was pinned
 * at the world origin with a 9-unit box, so it only existed near the intro
 * plaza and the avatar walked the rest of the trail visually ungrounded. And
 * it ran with `frames={Infinity}`, which re-renders a depth pass of the scene
 * into a render target and blurs it on *every* frame - a real per-frame cost,
 * paid everywhere, to draw something that was invisible almost everywhere.
 *
 * A projected blob is the right tool at this art level: the world is flat
 * where the avatar walks, the figure is a single compact silhouette, and the
 * true shadow is already drawn by the sun's own shadow map. So this is one
 * transparent quad with a generated radial falloff - no render target, no
 * blur pass, no texture file - that follows the avatar and softens as it
 * rises, which is what actually sells the contact.
 */
export default function AvatarContactShadow({ enabled }: { enabled: boolean }) {
  const mesh = useRef<THREE.Mesh>(null)

  // A radial falloff, generated rather than downloaded - the world ships no
  // image files, and this keeps it that way.
  const texture = useMemo(() => {
    const size = 128
    const canvas = document.createElement("canvas")
    canvas.width = canvas.height = size
    const ctx = canvas.getContext("2d")
    if (ctx) {
      const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
      g.addColorStop(0, "rgba(0,0,0,0.55)")
      g.addColorStop(0.55, "rgba(0,0,0,0.22)")
      g.addColorStop(1, "rgba(0,0,0,0)")
      ctx.fillStyle = g
      ctx.fillRect(0, 0, size, size)
    }
    const t = new THREE.CanvasTexture(canvas)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [])

  useFrame(() => {
    const m = mesh.current
    if (!m) return

    m.position.set(avatarState.x, 0.02, avatarState.z)

    // Higher off the ground: wider and fainter, the way a real contact shadow
    // loses definition with distance from the surface casting onto.
    const height = THREE.MathUtils.clamp(avatarState.y, 0, 3)
    const spread = 1 + height * 0.35
    m.scale.set(spread, spread, 1)

    const material = m.material as THREE.MeshBasicMaterial
    material.opacity = THREE.MathUtils.clamp(1 - height / 3.2, 0, 1)
  })

  if (!enabled) return null

  return (
    <mesh ref={mesh} rotation={[-Math.PI / 2, 0, 0]} renderOrder={1}>
      <planeGeometry args={[2.6, 2.6]} />
      <meshBasicMaterial
        map={texture}
        transparent
        depthWrite={false}
        opacity={1}
        toneMapped={false}
      />
    </mesh>
  )
}
