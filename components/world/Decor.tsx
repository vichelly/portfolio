"use client"

import { useMemo } from "react"
import { WORLD_BOUNDS_RADIUS, ZONES, distanceToZone } from "@/lib/world/layout"

// Deterministic pseudo-random so positions never reshuffle across re-renders.
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

function farFromAllZones(x: number, z: number) {
  return ZONES.every((zone) => distanceToZone(x, z, zone) > zone.radius + 3)
}

interface Prop {
  kind: "tree" | "rock"
  position: [number, number, number]
  scale: number
  rotation: number
  hue: number
}

const PROPS: Prop[] = (() => {
  const rand = mulberry32(1337)
  const props: Prop[] = []
  let attempts = 0
  while (props.length < 70 && attempts < 2000) {
    attempts++
    const angle = rand() * Math.PI * 2
    const radius = 14 + rand() * (WORLD_BOUNDS_RADIUS - 16)
    const x = Math.cos(angle) * radius
    const z = Math.sin(angle) * radius
    if (!farFromAllZones(x, z)) continue
    props.push({
      kind: rand() > 0.45 ? "tree" : "rock",
      position: [x, 0, z],
      scale: 0.7 + rand() * 0.9,
      rotation: rand() * Math.PI * 2,
      hue: rand(),
    })
  }
  return props
})()

function Tree({ position, scale, rotation, hue }: Prop) {
  const green = `hsl(${100 + hue * 40}, 45%, ${32 + hue * 10}%)`
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.22, 1.2, 5]} />
        <meshStandardMaterial color="#7a5230" flatShading />
      </mesh>
      <mesh position={[0, 1.7, 0]} castShadow>
        <coneGeometry args={[0.9, 1.6, 6]} />
        <meshStandardMaterial color={green} flatShading />
      </mesh>
      <mesh position={[0, 2.5, 0]} castShadow>
        <coneGeometry args={[0.65, 1.2, 6]} />
        <meshStandardMaterial color={green} flatShading />
      </mesh>
    </group>
  )
}

function Rock({ position, scale, rotation, hue }: Prop) {
  const gray = `hsl(${30 + hue * 10}, 12%, ${45 + hue * 15}%)`
  return (
    <mesh position={[position[0], 0.3 * scale, position[2]]} rotation={[0, rotation, hue]} scale={scale} castShadow>
      <dodecahedronGeometry args={[0.55, 0]} />
      <meshStandardMaterial color={gray} flatShading />
    </mesh>
  )
}

/** Sparse, deterministic decorative props scattered outside room zones for atmosphere. */
export default function Decor() {
  const items = useMemo(() => PROPS, [])
  return (
    <group>
      {items.map((p, i) =>
        p.kind === "tree" ? <Tree key={i} {...p} /> : <Rock key={i} {...p} />,
      )}
    </group>
  )
}
