"use client"

import { useMemo } from "react"
import { buildTerrain } from "@/lib/world/terrain"
import { makeSurface } from "@/lib/world/surface"
import { PALETTE } from "@/lib/world/theme"
import * as THREE from "three"

interface TerrainProps {
  /** Segment count comes from the quality tier. */
  segments: [number, number]
}

export default function Terrain({ segments }: TerrainProps) {
  const geometry = useMemo(
    () =>
      buildTerrain({
        width: 300,
        depth: 340,
        center: [0, -62],
        segmentsX: segments[0],
        segmentsZ: segments[1],
      }),
    [segments],
  )

  const material = useMemo(
    () =>
      makeSurface(
        { color: PALETTE.terrainLow, flatShading: true, roughness: 0.95 },
        {
          grainScale: 6,
          grainStrength: 0.16,
          driftScale: 40,
          driftStrength: 0.55,
          tint: new THREE.Color(PALETTE.terrainHigh),
          slopeShade: 0.22,
        },
      ),
    [],
  )

  return <mesh geometry={geometry} material={material} receiveShadow castShadow />
}
