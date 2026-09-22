"use client"

import { useMemo } from "react"
import * as THREE from "three"
import {
  DETOUR_CURVE,
  TRAIL_CURVE,
  detourHalfWidth,
  halfWidth,
} from "@/lib/world/trail"
import { PALETTE } from "@/lib/world/theme"
import { makeSurface } from "@/lib/world/surface"

/**
 * Builds a ribbon along `curve`, its width at every point taken from the same
 * function the character controller clamps against. The surface the visitor
 * sees and the surface they can stand on are therefore the same object,
 * described once.
 */
function buildRibbon(
  curve: THREE.CatmullRomCurve3,
  widthAt: (t: number) => number,
  samples: number,
  widen = 0,
) {
  const positions: number[] = []
  const indices: number[] = []
  const uvs: number[] = []

  for (let i = 0; i <= samples; i++) {
    const t = i / samples
    const point = curve.getPointAt(t)
    const tangent = curve.getTangentAt(t).setY(0).normalize()
    const leftX = tangent.z
    const leftZ = -tangent.x
    const w = widthAt(t) + widen

    positions.push(point.x + leftX * w, 0, point.z + leftZ * w)
    positions.push(point.x - leftX * w, 0, point.z - leftZ * w)
    uvs.push(0, t * 20, 1, t * 20)

    if (i > 0) {
      const a = (i - 1) * 2
      indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2)
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}

export default function Trail() {
  // Fine grain at ~2u so the surface has tooth up close, plus a slow ~30u
  // drift so a long straight stretch never reads as one flat fill.
  const sand = useMemo(
    () =>
      makeSurface(
        { color: PALETTE.trail, flatShading: true, roughness: 0.92 },
        {
          grainScale: 2,
          grainStrength: 0.14,
          driftScale: 30,
          driftStrength: 0.2,
          tint: new THREE.Color(PALETTE.trailEdge),
        },
      ),
    [],
  )
  const bank = useMemo(
    () =>
      makeSurface(
        { color: PALETTE.trailEdge, flatShading: true, roughness: 0.95 },
        { grainScale: 3, grainStrength: 0.2, driftScale: 22, driftStrength: 0.25 },
      ),
    [],
  )
  const detourStone = useMemo(
    () =>
      makeSurface(
        { color: PALETTE.stone, flatShading: true, roughness: 0.9 },
        { grainScale: 1.6, grainStrength: 0.22, bandScale: 2.2, bandStrength: 0.18 },
      ),
    [],
  )
  const detourBank = useMemo(
    () =>
      makeSurface({ color: PALETTE.stoneDark, flatShading: true }, { grainScale: 2.4, grainStrength: 0.2 }),
    [],
  )

  const surface = useMemo(() => buildRibbon(TRAIL_CURVE, halfWidth, 360), [])
  const edge = useMemo(() => buildRibbon(TRAIL_CURVE, halfWidth, 360, 0.9), [])
  const detourSurface = useMemo(() => buildRibbon(DETOUR_CURVE, detourHalfWidth, 180), [])
  const detourEdge = useMemo(() => buildRibbon(DETOUR_CURVE, detourHalfWidth, 180, 0.7), [])

  return (
    <group>
      {/* Edge band sits just below the walking surface, so the path reads as
          raised ground rather than a decal painted on the terrain. */}
      <mesh geometry={edge} material={bank} position={[0, -0.08, 0]} receiveShadow />
      <mesh geometry={surface} material={sand} position={[0, 0.001, 0]} receiveShadow />

      <mesh geometry={detourEdge} material={detourBank} position={[0, -0.09, 0]} receiveShadow />
      <mesh geometry={detourSurface} material={detourStone} position={[0, -0.002, 0]} receiveShadow />
    </group>
  )
}
