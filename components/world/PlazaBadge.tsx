"use client"

import { useRef } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { Text } from "@react-three/drei"
import * as THREE from "three"
import { FONT_BOLD } from "@/lib/world/panelLayout"
import { PALETTE } from "@/lib/world/theme"

interface PlazaBadgeProps {
  /** World XZ position to float above - the panel's own anchor, so the
   *  crest reads as sitting atop the panel rather than floating somewhere
   *  else in the plaza where it could overlap the panel on screen from a
   *  following camera. */
  position: [number, number]
  /** Short label - the employer or school this plaza belongs to. */
  label: string
  accent: string
}

/** Above the panel's tallest possible extent (MAX_HEIGHT in StationPanel,
 *  plus its floor clearance and settle bounce), so the crest never overlaps
 *  the panel's own text on screen regardless of camera angle. */
const HEIGHT = 8.2
const DISC_RADIUS = 0.85

/**
 * A small crest floating above a plaza: the employer or school's name on a
 * flat disc in the station's accent colour. Stands in for a real company
 * logo without downloading one - the world's art direction is entirely
 * procedural low-poly shapes and type, never an image texture, so a crest
 * reads as "in the same world" the way an imported PNG logo would not.
 * Billboards to the camera so it stays legible from whichever side the
 * visitor approaches the plaza from.
 */
export default function PlazaBadge({ position, label, accent }: PlazaBadgeProps) {
  const group = useRef<THREE.Group>(null)
  const { camera } = useThree()

  useFrame((state) => {
    const g = group.current
    if (!g) return
    g.quaternion.copy(camera.quaternion)
    g.position.y = HEIGHT + Math.sin(state.clock.elapsedTime * 0.6) * 0.12
  })

  return (
    <group ref={group} position={[position[0], HEIGHT, position[1]]}>
      <mesh>
        <circleGeometry args={[DISC_RADIUS, 24]} />
        <meshBasicMaterial color={PALETTE.panel} transparent opacity={0.86} />
      </mesh>
      <mesh position={[0, 0, -0.02]}>
        <ringGeometry args={[DISC_RADIUS * 0.92, DISC_RADIUS, 32]} />
        <meshBasicMaterial color={accent} />
      </mesh>
      <Text
        font={FONT_BOLD}
        fontSize={label.length > 5 ? 0.24 : 0.32}
        color={PALETTE.text}
        anchorX="center"
        anchorY="middle"
        maxWidth={DISC_RADIUS * 1.7}
        textAlign="center"
        position={[0, 0, 0.01]}
      >
        {label}
      </Text>
    </group>
  )
}
