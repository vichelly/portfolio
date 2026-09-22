import * as THREE from "three"
import { CORRIDOR_HALF_WIDTH, halfWidth, projectToTrail } from "@/lib/world/trail"

/**
 * Terrain height, in world units. Pure scenery: relief only exists outside the
 * walkable corridor, so the surface the avatar stands on stays exactly flat.
 *
 * See design.md, decision 2 - the character controller is deliberately not told
 * about this, which is safe only because containment forbids the avatar from
 * leaving the corridor.
 */

const RELIEF_START = 2
const RELIEF_RAMP = 12
const RELIEF_HEIGHT = 9

function hash(x: number, z: number) {
  const n = Math.sin(x * 127.1 + z * 311.7) * 43758.5453
  return n - Math.floor(n)
}

function valueNoise(x: number, z: number) {
  const xi = Math.floor(x)
  const zi = Math.floor(z)
  const xf = x - xi
  const zf = z - zi
  const u = xf * xf * (3 - 2 * xf)
  const v = zf * zf * (3 - 2 * zf)
  const a = hash(xi, zi)
  const b = hash(xi + 1, zi)
  const c = hash(xi, zi + 1)
  const d = hash(xi + 1, zi + 1)
  return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v
}

/** Four octaves, matching the shader's `surfFbm` in feel if not in bytes. */
function fbm(x: number, z: number) {
  let sum = 0
  let amp = 0.5
  let fx = x
  let fz = z
  for (let i = 0; i < 4; i++) {
    sum += valueNoise(fx, fz) * amp
    fx *= 2.02
    fz *= 2.02
    amp *= 0.5
  }
  return sum
}

/**
 * How much relief applies at this point: zero inside the corridor plus a
 * margin, ramping to full over the next stretch. This is what makes the trail
 * ribbon and the ground meet with no step.
 */
export function reliefFalloff(x: number, z: number): number {
  const projection = projectToTrail(x, z)
  const lateral = Math.abs(projection.lateral)
  const inner = halfWidth(projection.t) + RELIEF_START
  const outer = inner + RELIEF_RAMP
  if (lateral <= inner) return 0
  if (lateral >= outer) return 1
  const t = (lateral - inner) / (outer - inner)
  return t * t * (3 - 2 * t)
}

export function terrainHeight(x: number, z: number): number {
  const falloff = reliefFalloff(x, z)
  if (falloff === 0) return 0
  // Two scales: broad hills, plus a smaller undulation so ridgelines are not
  // all the same size.
  const broad = fbm(x / 46, z / 46) - 0.5
  const fine = (fbm(x / 13, z / 13) - 0.5) * 0.35
  return (broad + fine) * RELIEF_HEIGHT * falloff
}

export interface TerrainOptions {
  width: number
  depth: number
  center: [number, number]
  segmentsX: number
  segmentsZ: number
}

/** Builds the displaced ground once. Never animated. */
export function buildTerrain({
  width,
  depth,
  center,
  segmentsX,
  segmentsZ,
}: TerrainOptions): THREE.BufferGeometry {
  const geometry = new THREE.PlaneGeometry(width, depth, segmentsX, segmentsZ)
  geometry.rotateX(-Math.PI / 2)
  geometry.translate(center[0], 0, center[1])

  const position = geometry.attributes.position as THREE.BufferAttribute
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i)
    const z = position.getZ(i)
    position.setY(i, terrainHeight(x, z))
  }
  position.needsUpdate = true
  geometry.computeVertexNormals()
  return geometry
}

export { CORRIDOR_HALF_WIDTH }
