"use client"

import { useMemo } from "react"
import * as THREE from "three"
import {
  PLAZA_RADIUS,
  STATION_ANCHORS,
  STATION_T,
  TRAIL_CURVE,
  TRAIL_LENGTH,
  halfWidth,
} from "@/lib/world/trail"
import { PALETTE } from "@/lib/world/theme"
import { makeSurface } from "@/lib/world/surface"
import { terrainHeight } from "@/lib/world/terrain"

// Deterministic pseudo-random so props never reshuffle between renders.
function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Shared across every prop of a kind, so the world is a handful of programs. */
const MATERIALS = {
  bark: makeSurface(
    { color: "#6d4c2f", flatShading: true, roughness: 0.95 },
    { grainScale: 0.7, grainStrength: 0.3, bandScale: 9, bandStrength: 0.22 },
  ),
  foliage: makeSurface(
    { color: PALETTE.terrainShade, flatShading: true, roughness: 1 },
    {
      grainScale: 1.1,
      grainStrength: 0.26,
      driftScale: 6,
      driftStrength: 0.5,
      tint: new THREE.Color(PALETTE.terrainLow),
      sway: 0.16,
      swayHeight: 3.2,
    },
  ),
  rock: makeSurface(
    { color: PALETTE.stone, flatShading: true, roughness: 0.88 },
    {
      grainScale: 1.2,
      grainStrength: 0.24,
      bandScale: 3.4,
      bandStrength: 0.26,
      slopeShade: 0.28,
      driftScale: 14,
      driftStrength: 0.35,
      tint: new THREE.Color(PALETTE.stoneDark),
    },
  ),
  grass: makeSurface(
    { color: PALETTE.terrainLow, flatShading: true, roughness: 1 },
    {
      grainScale: 0.9,
      grainStrength: 0.3,
      driftScale: 6,
      driftStrength: 0.45,
      tint: new THREE.Color(PALETTE.terrainHigh),
      sway: 0.1,
      swayHeight: 0.8,
    },
  ),
}

interface Prop {
  kind: "tree" | "rock" | "grass"
  position: [number, number, number]
  scale: number
  rotation: number
  hue: number
}

/**
 * Props placed in the trail's own frame: pushed just outside the walkable
 * width, on both sides, all the way along. They read as the banks of the path,
 * which is what tells the visitor where the path goes without a wall.
 *
 * Tall props are kept away from the plazas and thinned out on the inside of
 * the corridor, so the next station's pylons stay visible from the last one.
 */
const PROPS: Prop[] = (() => {
  const rand = mulberry32(20260922)
  const props: Prop[] = []
  const steps = 240

  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const point = TRAIL_CURVE.getPointAt(t)
    const tangent = TRAIL_CURVE.getTangentAt(t).setY(0).normalize()
    const left = new THREE.Vector3(tangent.z, 0, -tangent.x)

    const nearestPlaza = Math.min(
      ...STATION_ANCHORS.map((s) => Math.abs(t - STATION_T[s.id]) * TRAIL_LENGTH),
    )
    const inPlaza = nearestPlaza < PLAZA_RADIUS * 1.25

    for (const side of [1, -1]) {
      if (rand() > (inPlaza ? 0.35 : 0.8)) continue
      const margin = halfWidth(t) + 1.6 + rand() * 11
      const x = point.x + left.x * margin * side
      const z = point.z + left.z * margin * side
      // Keep tall silhouettes off the near bank so sightlines stay open.
      const tall = margin > halfWidth(t) + 5 && !inPlaza
      props.push({
        kind: tall ? (rand() > 0.35 ? "tree" : "rock") : rand() > 0.5 ? "grass" : "rock",
        // Props sit on the relief rather than floating above or sinking into it.
        position: [x, terrainHeight(x, z), z],
        scale: 0.6 + rand() * 0.9,
        rotation: rand() * Math.PI * 2,
        hue: rand(),
      })
    }
  }
  return props
})()

function Tree({ position, scale, rotation }: Prop) {
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      <mesh position={[0, 0.7, 0]} material={MATERIALS.bark} castShadow>
        <cylinderGeometry args={[0.13, 0.2, 1.4, 5]} />
      </mesh>
      <mesh position={[0, 1.9, 0]} material={MATERIALS.foliage} castShadow>
        <coneGeometry args={[0.95, 1.8, 6]} />
      </mesh>
      <mesh position={[0, 2.8, 0]} material={MATERIALS.foliage} castShadow>
        <coneGeometry args={[0.68, 1.3, 6]} />
      </mesh>
    </group>
  )
}

function Rock({ position, scale, rotation, hue }: Prop) {
  return (
    <mesh
      position={[position[0], position[1] + 0.28 * scale, position[2]]}
      rotation={[hue * 0.4, rotation, hue * 0.3]}
      scale={scale}
      material={MATERIALS.rock}
      castShadow
      receiveShadow
    >
      <dodecahedronGeometry args={[0.5, 0]} />
    </mesh>
  )
}

function Grass({ position, scale, rotation }: Prop) {
  return (
    <mesh
      position={[position[0], position[1] + 0.22 * scale, position[2]]}
      rotation={[0, rotation, 0]}
      scale={scale}
      material={MATERIALS.grass}
      castShadow
    >
      <coneGeometry args={[0.3, 0.7, 4]} />
    </mesh>
  )
}

interface DecorProps {
  /** Fraction of props to draw, from the quality tier. */
  density: number
}

export default function Decor({ density }: DecorProps) {
  // Take a deterministic stride through the list rather than the first N, so a
  // thinned world stays evenly populated instead of empty at one end.
  const items = useMemo(
    () => (density >= 1 ? PROPS : PROPS.filter((_, i) => i % Math.round(1 / density) === 0)),
    [density],
  )
  return (
    <group>
      {items.map((p, i) =>
        p.kind === "tree" ? (
          <Tree key={i} {...p} />
        ) : p.kind === "rock" ? (
          <Rock key={i} {...p} />
        ) : (
          <Grass key={i} {...p} />
        ),
      )}
    </group>
  )
}
