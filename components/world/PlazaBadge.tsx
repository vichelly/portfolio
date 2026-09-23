"use client"

import { useRef } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { useTexture } from "@react-three/drei"
import * as THREE from "three"

interface PlazaBadgeProps {
  /** World XZ position to float above - the panel's own anchor, so the
   *  crest reads as sitting atop the panel rather than floating somewhere
   *  else in the plaza where it could overlap the panel on screen from a
   *  following camera. */
  position: [number, number]
  /** The employer or school's real logo, from `public/logos/`. */
  image: string
  accent: string
}

/** Above the panel's tallest possible extent (MAX_HEIGHT in StationPanel,
 *  plus its floor clearance and settle bounce), so the crest never overlaps
 *  the panel's own text on screen regardless of camera angle. */
const HEIGHT = 8.2
const DISC_RADIUS = 0.85

/**
 * A small crest floating above a plaza: the employer or school's real logo,
 * ringed in the station's accent colour. Billboards to the camera so it
 * stays legible from whichever side the visitor approaches the plaza from.
 */
export default function PlazaBadge({ position, image, accent }: PlazaBadgeProps) {
  const group = useRef<THREE.Group>(null)
  const { camera } = useThree()
  const texture = useTexture(image)

  useFrame((state) => {
    const g = group.current
    if (!g) return
    g.quaternion.copy(camera.quaternion)
    g.position.y = HEIGHT + Math.sin(state.clock.elapsedTime * 0.6) * 0.12
  })

  return (
    <group ref={group} position={[position[0], HEIGHT, position[1]]}>
      <mesh position={[0, 0, -0.02]}>
        <ringGeometry args={[DISC_RADIUS * 0.94, DISC_RADIUS * 1.08, 32]} />
        <meshBasicMaterial color={accent} />
      </mesh>
      <mesh>
        <circleGeometry args={[DISC_RADIUS, 32]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
    </group>
  )
}
