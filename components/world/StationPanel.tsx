"use client"

import { useMemo, useRef } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { Text } from "@react-three/drei"
import * as THREE from "three"
import { avatarState } from "@/lib/world/avatarState"
import { stationPresence, type StationId } from "@/lib/world/trail"
import { PALETTE, STATION_ACCENT } from "@/lib/world/theme"
import { FONT_BOLD, FONT_REGULAR, SIZES, layoutStation } from "@/lib/world/panelLayout"
import type { StationContent } from "@/lib/world/stations"

interface StationPanelProps {
  content: StationContent
  /** Plaza centre, in world XZ. */
  anchor: [number, number]
  /** Where the panel stands relative to the plaza centre, on a wide screen. */
  offset: [number, number]
  /** Facing, so the panel greets whoever is walking up the trail. */
  rotationY: number
}

const PADDING = 0.34
const FLOOR_CLEARANCE = 1.2
/** No panel is allowed to grow taller than this on screen. */
const MAX_HEIGHT = 5.8

/**
 * Panel shapes to try, narrowest first. Height is what forces the fit-scale
 * down and makes the type small, so a stop that carries a lot of text is given
 * more width and more columns rather than being allowed to grow upward.
 */
const SHAPES = [
  { width: 6, columns: 1 },
  { width: 9, columns: 2 },
  { width: 12, columns: 2 },
  { width: 13, columns: 3 },
]
const NARROW_SHAPES = [
  { width: 5.2, columns: 1 },
  { width: 7.5, columns: 2 },
]

/** Text must fill at least this much of the panel; the rest is margin. */
const MIN_FILL = 0.75
/** The spec's floor for body text, in CSS pixels on screen. */
const MIN_BODY_PIXELS = 16

/** How much of the panel's height the text occupies. */
function fillRatio(height: number) {
  return height / (height + PADDING * 2)
}

/**
 * The first shape that both fits the frame and is dense enough; the widest if
 * none qualify. Density is checked here rather than trusted, because bigger
 * type in the same box just makes a taller panel that `fit` then shrinks -
 * undoing the gain it was supposed to deliver.
 */
function fitShape(content: StationContent, narrow: boolean) {
  const shapes = narrow ? NARROW_SHAPES : SHAPES
  for (const shape of shapes) {
    const layout = layoutStation(content, shape.width, shape.columns)
    if (layout.height <= MAX_HEIGHT && fillRatio(layout.height) >= MIN_FILL) return layout
  }
  const last = shapes[shapes.length - 1]
  return layoutStation(content, last.width, last.columns)
}

/**
 * A station's content, standing in the world. Its visibility is a pure function
 * of how far the avatar is along the trail from this station's anchor - there is
 * no open/closed state anywhere, which is what makes "walk away to dismiss"
 * true by construction rather than by remembering to implement it.
 */
export default function StationPanel({
  content,
  anchor,
  offset,
  rotationY,
}: StationPanelProps) {
  const group = useRef<THREE.Group>(null)
  const { viewport, camera } = useThree()

  // On a phone the panel is narrower and, being narrower, taller - so it is
  // also allowed to sit closer to the reader via a larger scale.
  const isNarrow = viewport.aspect < 0.9
  const layout = useMemo(() => fitShape(content, isNarrow), [content, isNarrow])
  const accent = STATION_ACCENT[content.id]
  // A tall panel is scaled down to fit the frame rather than running off it.
  const fit = Math.min(1, MAX_HEIGHT / layout.height)

  // A phone frames a much narrower slice of the world, so the panel pulls in
  // toward the trail centre rather than standing out at the plaza edge where
  // it would sit half off-screen.
  const pull = isNarrow ? 0.4 : 1
  const position: [number, number, number] = [
    anchor[0] + offset[0] * pull,
    FLOOR_CLEARANCE,
    anchor[1] + offset[1] * pull,
  ]

  const presence = useRef(0)
  const yaw = useRef(rotationY)
  const checked = useRef(false)

  useFrame((state, delta) => {
    const g = group.current
    if (!g) return

    const target = stationPresence(avatarState.t, content.id as StationId)
    presence.current = THREE.MathUtils.lerp(
      presence.current,
      target,
      1 - Math.exp(-6 * delta),
    )
    const p = presence.current

    // Keep the facing current even while hidden, so a panel is never caught
    // edge-on at the moment it appears.
    const want = Math.atan2(camera.position.x - g.position.x, camera.position.z - g.position.z)

    g.visible = p > 0.01
    if (!g.visible) {
      yaw.current = want
      g.rotation.y = want
      return
    }

    // Tell the camera how much it has to frame here.
    if (p > 0.5) avatarState.panelHeight = layout.height * fit

    // Rise and settle as it comes in, rather than simply appearing.
    g.scale.setScalar(fit * (0.94 + p * 0.06))
    g.position.y = FLOOR_CLEARANCE + (layout.height / 2) * fit + (1 - p) * 0.5

    // Turn to face the reader, around Y only so the panel stays upright, and
    // damped so it settles into place instead of tracking every camera twitch.
    let diff = want - yaw.current
    diff = Math.atan2(Math.sin(diff), Math.cos(diff))
    yaw.current += diff * (1 - Math.exp(-3.5 * delta))
    g.rotation.y = yaw.current

    g.traverse((child) => {
      const mesh = child as THREE.Mesh
      const material = mesh.material as THREE.Material & { opacity: number }
      if (!material || typeof material.opacity !== "number") return
      material.transparent = true
      material.opacity = (material.userData.baseOpacity ?? 1) * p
      material.depthWrite = false
    })

  })

  const toneColor = (tone: "text" | "muted" | "accent") =>
    tone === "accent" ? accent : tone === "muted" ? PALETTE.textMuted : PALETTE.text

  return (
    <group ref={group} position={position} rotation={[0, rotationY, 0]}>
      {/* Backing slab */}
      <mesh position={[0, 0, -0.06]}>
        <planeGeometry args={[layout.width + PADDING * 2, layout.height + PADDING * 2]} />
        <meshBasicMaterial
          color={PALETTE.panel}
          transparent
          opacity={0}
          onUpdate={(m) => void (m.userData.baseOpacity = 0.82)}
        />
      </mesh>
      {/* Accent rule down the left edge - the station's only colour signature */}
      <mesh position={[-(layout.width / 2 + PADDING * 0.55), 0, -0.04]}>
        <planeGeometry args={[0.08, layout.height + PADDING * 1.4]} />
        <meshBasicMaterial
          color={accent}
          transparent
          opacity={0}
          onUpdate={(m) => void (m.userData.baseOpacity = 1)}
        />
      </mesh>

      <group position={[0, layout.height / 2, 0]}>
        {layout.blocks.map((block) => (
          <Text
            key={block.key}
            font={block.weight === "bold" ? FONT_BOLD : FONT_REGULAR}
            fontSize={block.size}
            color={toneColor(block.tone)}
            anchorX="left"
            anchorY="top"
            maxWidth={block.maxWidth}
            lineHeight={1.4}
            position={[block.x, block.y, 0]}
            outlineWidth={0.012}
            outlineColor={PALETTE.ink}
            material-transparent
            material-depthWrite={false}
          >
            {block.text}
          </Text>
        ))}
      </group>
    </group>
  )
}
