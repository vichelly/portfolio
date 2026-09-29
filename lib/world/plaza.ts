import * as THREE from "three"
import { STATION_ANCHORS, STATION_T, TRAIL_CURVE, type StationId } from "@/lib/world/trail"

/**
 * The geometry of a plaza, in one place.
 *
 * `Station` lays its panel out from the trail's own frame at the station's
 * anchor, and `StationLights` has to put a light exactly where that panel
 * ends up. Those are two components with one formula between them, so the
 * formula lives here rather than being written twice and left to drift.
 */

/** The panel stands past the plaza centre, off to one side: the visitor walks
 *  toward it, reads it head-on, and then walks past it. */
export const PANEL_FORWARD = 5.5
export const PANEL_LATERAL = 3.2

export interface PlazaFrame {
  /** Unit tangent of the trail at the station, flattened to the XZ plane. */
  tangent: THREE.Vector3
  /** Unit left of the tangent, in the XZ plane. */
  left: THREE.Vector3
  /** Which side of the trail the panel stands on: +1 or -1, alternating along
   *  the trail so the path ahead is never blocked and the walk gains a rhythm. */
  panelSide: number
  /** The panel's XZ offset from the plaza anchor. */
  panelOffset: [number, number]
  /** The panel's XZ position in world space. */
  panelAnchor: [number, number]
}

function frameFor(id: StationId, index: number, anchor: [number, number]): PlazaFrame {
  const tangent = TRAIL_CURVE.getTangentAt(STATION_T[id]).setY(0).normalize()
  const left = new THREE.Vector3(tangent.z, 0, -tangent.x)
  const panelSide = index % 2 === 0 ? 1 : -1
  const panelOffset: [number, number] = [
    left.x * PANEL_LATERAL * panelSide + tangent.x * PANEL_FORWARD,
    left.z * PANEL_LATERAL * panelSide + tangent.z * PANEL_FORWARD,
  ]
  return {
    tangent,
    left,
    panelSide,
    panelOffset,
    panelAnchor: [anchor[0] + panelOffset[0], anchor[1] + panelOffset[1]],
  }
}

/** Every plaza's frame, derived once from the trail curve at module load. */
export const PLAZA_FRAME: Record<StationId, PlazaFrame> = Object.fromEntries(
  STATION_ANCHORS.map((a, index) => [a.id, frameFor(a.id, index, a.point)]),
) as Record<StationId, PlazaFrame>

/**
 * The accent light at a plaza. These were per-station lights until the light
 * count was found to be the largest single stall in the world: three.js keys
 * its compiled-program cache on the scene's light configuration, so mounting
 * one more `pointLight` recompiles every material in the world. Measured on
 * this scene: ten new programs and 281.9 ms in the frame that added it.
 *
 * The values are unchanged from the per-station lights they replace; only the
 * number of light objects is now fixed. See `components/world/StationLights`.
 */
export const PLAZA_LIGHT = {
  /** Height above the panel anchor. */
  height: 3,
  intensity: 8,
  /** Reach, in world units. Beyond this the light contributes nothing. */
  distance: 14,
} as const

/**
 * How many lights the fixed rig carries. Two, because no point on the trail is
 * within `PLAZA_LIGHT.distance` of more than two plazas - which is what
 * `assertPlazaLightBudget` checks rather than assumes.
 */
export const PLAZA_LIGHT_COUNT = 2

/**
 * The two plazas nearest `x, z`, nearest first, written into `out`.
 *
 * Allocation-free: it runs every frame. Eight stations means a linear scan is
 * both the simplest and the fastest thing here.
 */
export function nearestPlazas(x: number, z: number, out: StationId[]): void {
  let firstId: StationId | null = null
  let secondId: StationId | null = null
  let firstD = Infinity
  let secondD = Infinity

  for (const station of STATION_ANCHORS) {
    const { panelAnchor } = PLAZA_FRAME[station.id]
    const dx = x - panelAnchor[0]
    const dz = z - panelAnchor[1]
    const d = dx * dx + dz * dz
    if (d < firstD) {
      secondD = firstD
      secondId = firstId
      firstD = d
      firstId = station.id
    } else if (d < secondD) {
      secondD = d
      secondId = station.id
    }
  }

  out[0] = firstId as StationId
  out[1] = secondId as StationId
}

/**
 * The fixed two-light rig is only correct while no point the avatar can reach
 * is lit by more than two plazas. That is a property of where the anchors sit,
 * so moving an anchor could quietly break it and the only symptom would be a
 * plaza that stops glowing. Checked in development, like content coverage and
 * obstacle placement, so it fails loudly at the moment it is broken.
 */
export function assertPlazaLightBudget(): void {
  const SAMPLES = 600
  let worst = 0
  let worstT = 0

  for (let i = 0; i <= SAMPLES; i++) {
    const t = i / SAMPLES
    const here = TRAIL_CURVE.getPointAt(t)
    let within = 0
    for (const station of STATION_ANCHORS) {
      const { panelAnchor } = PLAZA_FRAME[station.id]
      const d = Math.hypot(here.x - panelAnchor[0], here.z - panelAnchor[1])
      if (d <= PLAZA_LIGHT.distance) within++
    }
    if (within > worst) {
      worst = within
      worstT = t
    }
  }

  if (worst > PLAZA_LIGHT_COUNT) {
    throw new Error(
      `Plaza light budget exceeded: ${worst} plazas are within ${PLAZA_LIGHT.distance} units ` +
        `of the trail at t=${worstT.toFixed(3)}, but the fixed rig carries ${PLAZA_LIGHT_COUNT} ` +
        `lights. Either move the anchors apart, shorten PLAZA_LIGHT.distance, or raise ` +
        `PLAZA_LIGHT_COUNT - but raising it adds a light to the scene for the whole session, ` +
        `which is the cost this rig exists to bound.`,
    )
  }
}
