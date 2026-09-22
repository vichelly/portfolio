"use client"

import { useMemo } from "react"
import * as THREE from "three"
import StationPanel from "@/components/world/StationPanel"
import LinkSignpost from "@/components/world/LinkSignpost"
import PlazaBadge from "@/components/world/PlazaBadge"
import { PALETTE, STATION_ACCENT } from "@/lib/world/theme"
import { PLAZA_RADIUS, STATION_T, TRAIL_CURVE, type StationId } from "@/lib/world/trail"
import { stationsFor } from "@/lib/world/stations"
import { useWorldStore } from "@/lib/world-store"

interface StationProps {
  id: StationId
  anchor: [number, number]
  /** Index along the trail - used to alternate which side the panel stands on. */
  index: number
}

/** Short crest label for the plazas that belong to a real employer or
 *  school - not shown at intro, certifications, or contact, which are not
 *  tied to a single place. */
const PLAZA_BADGE: Partial<Record<StationId, string>> = {
  "itau-rpa": "Itaú",
  "itau-intern": "Itaú",
  "agile-inc": "Agile inc",
  fei: "FEI",
  fiap: "FIAP",
}

/** The panel stands past the plaza centre, off to one side: the visitor walks
 *  toward it, reads it head-on, and then walks past it. */
const PANEL_FORWARD = 5.5
const PANEL_LATERAL = 3.2
/** Posts sit on an arc across the plaza, clear of the walking line but inside
 *  the frame the visitor is looking at when they arrive. */
const SIGNPOST_ARC = 2.1

/**
 * One stop on the trail: the plaza that frames it, the content panel standing
 * to one side, and a signpost for every entry that links out. The panel
 * alternates sides from station to station so the path ahead is never blocked
 * and the walk gains a rhythm.
 */
export default function Station({ id, anchor, index }: StationProps) {
  const locale = useWorldStore((s) => s.locale)
  const content = useMemo(() => stationsFor(locale)[id], [locale, id])
  const accent = STATION_ACCENT[id]

  const frame = useMemo(() => {
    const tangent = TRAIL_CURVE.getTangentAt(STATION_T[id]).setY(0).normalize()
    const left = new THREE.Vector3(tangent.z, 0, -tangent.x)
    const panelSide = index % 2 === 0 ? 1 : -1
    return { tangent, left, panelSide }
  }, [id, index])

  const { tangent, left, panelSide } = frame

  const panelOffset: [number, number] = [
    left.x * PANEL_LATERAL * panelSide + tangent.x * PANEL_FORWARD,
    left.z * PANEL_LATERAL * panelSide + tangent.z * PANEL_FORWARD,
  ]
  const panelAnchor: [number, number] = [anchor[0] + panelOffset[0], anchor[1] + panelOffset[1]]

  // The panel faces the plaza, angled toward the direction the visitor arrives
  // from - square-on while walking up, still readable while standing in front.
  const facing = new THREE.Vector3()
    .addScaledVector(left, -0.8 * panelSide)
    .addScaledVector(tangent, -0.6)
    .normalize()
  const panelRotation = Math.atan2(facing.x, facing.z)

  const linked = content.entries.filter((e) => e.links?.length)
  // A couple of posts sit closer in; a crowd of them needs the room.
  const signpostRadius = linked.length > 2 ? 7.8 : 6.2

  const signposts = linked.map((entry, i) => {
    // Centred on the side opposite the panel, but biased forward so the posts
    // stand in front of the visitor rather than out at ninety degrees.
    const side = -panelSide
    const aim = new THREE.Vector3()
      .addScaledVector(left, 0.62 * side)
      .addScaledVector(tangent, 0.78)
      .normalize()
    const base = Math.atan2(aim.x, aim.z)
    const spread = linked.length > 1 ? (i / (linked.length - 1) - 0.5) * SIGNPOST_ARC : 0
    const angle = base + spread
    const x = anchor[0] + Math.sin(angle) * signpostRadius
    const z = anchor[1] + Math.cos(angle) * signpostRadius
    return { entry, position: [x, 0, z] as [number, number, number] }
  })

  const pylons: [number, number][] = [
    [anchor[0] + tangent.x * PLAZA_RADIUS * 0.88, anchor[1] + tangent.z * PLAZA_RADIUS * 0.88],
    [anchor[0] - tangent.x * PLAZA_RADIUS * 0.88, anchor[1] - tangent.z * PLAZA_RADIUS * 0.88],
  ]

  return (
    <group>
      {/* Plaza ring: marks where the stop begins without walling it off. */}
      <mesh position={[anchor[0], 0.015, anchor[1]]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[PLAZA_RADIUS * 0.82, PLAZA_RADIUS * 0.88, 64]} />
        <meshBasicMaterial color={accent} transparent opacity={0.5} />
      </mesh>

      {/* Gate pylons on the trail axis - the visitor walks between them. */}
      {pylons.map((p, i) =>
        [1, -1].map((side) => (
          <group
            key={`${i}-${side}`}
            position={[p[0] + left.x * 3.4 * side, 0, p[1] + left.z * 3.4 * side]}
          >
            <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.28, 0.36, 2.2, 6]} />
              <meshStandardMaterial color={PALETTE.stone} flatShading />
            </mesh>
            <mesh position={[0, 2.35, 0]} castShadow>
              <octahedronGeometry args={[0.3, 0]} />
              <meshStandardMaterial
                color={accent}
                emissive={accent}
                emissiveIntensity={0.7}
                flatShading
              />
            </mesh>
          </group>
        )),
      )}

      {/* Plinth under the panel, so the content is planted rather than floating */}
      <mesh position={[panelAnchor[0], 0.25, panelAnchor[1]]} castShadow receiveShadow>
        <cylinderGeometry args={[1.5, 1.8, 0.5, 8]} />
        <meshStandardMaterial color={PALETTE.stoneDark} flatShading />
      </mesh>
      <pointLight
        position={[panelAnchor[0], 3, panelAnchor[1]]}
        color={accent}
        intensity={8}
        distance={14}
      />

      <StationPanel
        content={content}
        anchor={anchor}
        offset={panelOffset}
        rotationY={panelRotation}
      />

      {signposts.map(({ entry, position }) => (
        <LinkSignpost
          key={entry.id}
          caption={entry.heading}
          links={entry.links ?? []}
          position={position}
          accent={accent}
        />
      ))}

      {PLAZA_BADGE[id] && (
        <PlazaBadge position={panelAnchor} label={PLAZA_BADGE[id]!} accent={accent} />
      )}
    </group>
  )
}
