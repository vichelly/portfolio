"use client"

import { useEffect, useMemo, useRef } from "react"
import * as THREE from "three"
import {
  PLAZA_RADIUS,
  STATION_ANCHORS,
  STATION_T,
  TRAIL_CURVE,
  TRAIL_LENGTH,
  halfWidth,
} from "@/lib/world/trail"
import { useFrameSlice } from "@/lib/world/mountWindow"
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
  /** Arc-length position along the trail, so props can be windowed by distance. */
  t: number
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
        t,
      })
    }
  }
  return props
})()

// Reachable from the console in development so a walkthrough can measure what
// the decor actually costs, rather than estimating it.
if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
  Object.assign(window as unknown as Record<string, unknown>, { __decorProps: PROPS })
}

/**
 * The five primitives every prop is built from. Each becomes ONE draw call
 * regardless of how many props are on screen.
 *
 * Before this, each prop was its own React element and a tree was three
 * separate meshes, so roughly 250 props meant ~370 meshes - every one of them
 * submitted twice a frame, once for the shadow map and once for colour, with
 * no distance culling at all. That was the single largest cost in the scene
 * and the main reason the world crawled on modest hardware.
 *
 * `offsetY` and `baseScale` reproduce exactly the per-prop placement the old
 * components applied, so the world looks the same; it is only submitted
 * differently.
 */
interface Batch {
  key: string
  kind: Prop["kind"]
  material: THREE.Material
  geometry: () => THREE.BufferGeometry
  offsetY: number
  tilt: boolean
}

const BATCHES: Batch[] = [
  {
    key: "trunk",
    kind: "tree",
    material: MATERIALS.bark,
    geometry: () => new THREE.CylinderGeometry(0.13, 0.2, 1.4, 5),
    offsetY: 0.7,
    tilt: false,
  },
  {
    key: "canopy-low",
    kind: "tree",
    material: MATERIALS.foliage,
    geometry: () => new THREE.ConeGeometry(0.95, 1.8, 6),
    offsetY: 1.9,
    tilt: false,
  },
  {
    key: "canopy-high",
    kind: "tree",
    material: MATERIALS.foliage,
    geometry: () => new THREE.ConeGeometry(0.68, 1.3, 6),
    offsetY: 2.8,
    tilt: false,
  },
  {
    key: "rock",
    kind: "rock",
    material: MATERIALS.rock,
    geometry: () => new THREE.DodecahedronGeometry(0.5, 0),
    offsetY: 0.28,
    tilt: true,
  },
  {
    key: "grass",
    kind: "grass",
    material: MATERIALS.grass,
    geometry: () => new THREE.ConeGeometry(0.3, 0.7, 4),
    offsetY: 0.22,
    tilt: false,
  },
]

const _m = new THREE.Matrix4()
const _q = new THREE.Quaternion()
const _e = new THREE.Euler()
const _pos = new THREE.Vector3()
const _scale = new THREE.Vector3()

function Batch({
  batch,
  props,
}: {
  batch: Batch
  props: Prop[]
}) {
  const geometry = useMemo(batch.geometry, [batch])
  const ref = useRef<THREE.InstancedMesh>(null)

  useEffect(() => {
    const mesh = ref.current
    if (!mesh) return
    props.forEach((p, i) => {
      // Every part scales about the prop's own origin, so its vertical offset
      // scales with it - matching the old `<group scale>` wrapping exactly.
      const offset = batch.offsetY * p.scale
      _pos.set(p.position[0], p.position[1] + offset, p.position[2])
      _e.set(batch.tilt ? p.hue * 0.4 : 0, p.rotation, batch.tilt ? p.hue * 0.3 : 0)
      _q.setFromEuler(_e)
      _scale.setScalar(p.scale)
      _m.compose(_pos, _q, _scale)
      mesh.setMatrixAt(i, _m)
    })
    mesh.count = props.length
    mesh.instanceMatrix.needsUpdate = true
    mesh.computeBoundingSphere()
  }, [props, batch])

  if (props.length === 0) return null

  return (
    <instancedMesh
      ref={ref}
      args={[geometry, batch.material, props.length]}
      castShadow
      receiveShadow={batch.key === "rock"}
      frustumCulled={false}
    />
  )
}

interface DecorProps {
  /** Fraction of props to draw, from the quality tier. */
  density: number
  /** How far along the trail props are drawn, in world units. */
  radius: number
}

export default function Decor({ density, radius }: DecorProps) {
  // Take a deterministic stride through the list rather than the first N, so a
  // thinned world stays evenly populated instead of empty at one end.
  const thinned = useMemo(
    () => (density >= 1 ? PROPS : PROPS.filter((_, i) => i % Math.round(1 / density) === 0)),
    [density],
  )

  // Distance windowing, on top of instancing: the far end of the trail is
  // behind the fog anyway, and a prop 150 units away still costs a shadow-map
  // draw if it is in the batch.
  //
  // PROPS is generated by walking the trail, so it is ordered by `t` and the
  // visible set is a contiguous slice. That is what lets this recompute only
  // when the slice's edges actually move, rather than on every tick of
  // progress: the effect below rewrites every instance matrix in every batch,
  // and it used to run about four times a second for the whole walk.
  const visible = useFrameSlice(thinned, radius)

  const byBatch = useMemo(
    () => BATCHES.map((batch) => ({ batch, props: visible.filter((p) => p.kind === batch.kind) })),
    [visible],
  )

  return (
    <group>
      {byBatch.map(({ batch, props }) => (
        <Batch key={batch.key} batch={batch} props={props} />
      ))}
    </group>
  )
}
