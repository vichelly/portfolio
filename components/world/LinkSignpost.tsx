"use client"

import { useRef, useState } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { Text } from "@react-three/drei"
import * as THREE from "three"
import { avatarState } from "@/lib/world/avatarState"
import { PALETTE } from "@/lib/world/theme"
import { FONT_BOLD, FONT_REGULAR } from "@/lib/world/panelLayout"
import type { StationLink } from "@/lib/world/stations"

interface LinkSignpostProps {
  /** Which entry this post belongs to, shown on the post head. */
  caption: string
  links: StationLink[]
  position: [number, number, number]
  accent: string
}

const NEAR_DISTANCE = 6

/**
 * A post standing in the plaza carrying one plaque per outbound link. Clicking
 * a plaque opens that URL in a new tab; the world keeps running in this one.
 */
export default function LinkSignpost({
  caption,
  links,
  position,
  accent,
}: LinkSignpostProps) {
  const { camera } = useThree()
  const group = useRef<THREE.Group>(null)
  const board = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState<string | null>(null)
  const near = useRef(false)

  useFrame(() => {
    const dx = avatarState.x - position[0]
    const dz = avatarState.z - position[2]
    near.current = Math.hypot(dx, dz) < NEAR_DISTANCE
    const g = group.current
    if (g) g.scale.setScalar(THREE.MathUtils.lerp(g.scale.x, near.current ? 1 : 0.92, 0.12))
    // The board turns to whoever is looking at it, so a link is never read
    // back-to-front no matter which way the visitor approached the plaza.
    if (board.current) {
      board.current.rotation.y = Math.atan2(
        camera.position.x - position[0],
        camera.position.z - position[2],
      )
    }
  })

  const open = (href: string) => {
    window.open(href, "_blank", "noopener,noreferrer")
  }

  return (
    <group ref={group} position={position}>
      {/* post */}
      <mesh position={[0, 0.75, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 1.5, 6]} />
        <meshStandardMaterial color={PALETTE.stoneDark} flatShading />
      </mesh>

      <group ref={board}>
      <Text
        font={FONT_REGULAR}
        fontSize={0.16}
        color={PALETTE.textMuted}
        anchorX="center"
        anchorY="bottom"
        maxWidth={2}
        textAlign="center"
        position={[0, 1.76, 0.03]}
        outlineWidth={0.01}
        outlineColor={PALETTE.ink}
      >
        {caption}
      </Text>

      {links.map((link, i) => {
        const isHovered = hovered === link.href
        return (
          <group key={`${i}-${link.href}`} position={[0, 1.36 - i * 0.34, 0]}>
            <mesh
              onClick={(e) => {
                e.stopPropagation()
                open(link.href)
              }}
              onPointerOver={(e) => {
                e.stopPropagation()
                setHovered(link.href)
                document.body.style.cursor = "pointer"
              }}
              onPointerOut={() => {
                setHovered((h) => (h === link.href ? null : h))
                document.body.style.cursor = "auto"
              }}
              castShadow
            >
              <boxGeometry args={[1.2, 0.3, 0.06]} />
              <meshStandardMaterial
                color={isHovered ? accent : PALETTE.panel}
                emissive={accent}
                emissiveIntensity={isHovered ? 0.75 : near.current ? 0.35 : 0.12}
                flatShading
              />
            </mesh>
            <Text
              font={FONT_BOLD}
              fontSize={0.145}
              color={isHovered ? PALETTE.ink : PALETTE.text}
              anchorX="center"
              anchorY="middle"
              position={[0, 0, 0.04]}
            >
              {link.label}
            </Text>
          </group>
        )
      })}
      </group>
    </group>
  )
}
