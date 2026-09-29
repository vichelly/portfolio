"use client"

import { Suspense, useMemo } from "react"
import * as THREE from "three"
import StationPanel from "@/components/world/StationPanel"
import LinkSignpost from "@/components/world/LinkSignpost"
import PlazaBadge from "@/components/world/PlazaBadge"
import DistanceFade from "@/components/world/DistanceFade"
import { PALETTE, STATION_ACCENT } from "@/lib/world/theme"
import { PLAZA_FRAME } from "@/lib/world/plaza"
import { PLAZA_RADIUS, STATION_T, type StationId } from "@/lib/world/trail"
import { stationsFor } from "@/lib/world/stations"
import { useWorldStore } from "@/lib/world-store"

interface StationProps {
  id: StationId
  anchor: [number, number]
}

/** Real employer/school logo for the plazas tied to a single place - not
 *  shown at intro, certifications, or contact, which aren't. */
const PLAZA_BADGE: Partial<Record<StationId, string>> = {
  "itau-rpa": "/logos/itau.jpg",
  "itau-rpa-2": "/logos/itau.jpg",
  "itau-intern": "/logos/itau.jpg",
  "agile-inc": "/logos/agile-inc.jpg",
  "agile-inc-2": "/logos/agile-inc.jpg",
  fei: "/logos/fei.jpg",
  fiap: "/logos/fiap.jpg",
}

/** Daily tools, shown as a small row of icons above the certifications
 *  plaza rather than as their own badge slot. */
const TOOL_ICONS = ["/logos/devin.jpg", "/logos/claude.png"]
const TOOL_ICON_SPACING = 2.1

/** Posts sit on an arc across the plaza, clear of the walking line but inside
 *  the frame the visitor is looking at when they arrive. */
const SIGNPOST_ARC = 2.1

/**
 * One stop on the trail: the plaza that frames it, the content panel standing
 * to one side, and a signpost for every entry that links out. The panel
 * alternates sides from station to station so the path ahead is never blocked
 * and the walk gains a rhythm.
 */
export default function Station({ id, anchor }: StationProps) {
  const locale = useWorldStore((s) => s.locale)
  const content = useMemo(() => stationsFor(locale)[id], [locale, id])
  const accent = STATION_ACCENT[id]

  // The plaza's frame is derived once at module load and shared with
  // StationLights, so the panel and the light that lights it cannot disagree
  // about where the panel stands.
  const { tangent, left, panelSide, panelOffset, panelAnchor } = PLAZA_FRAME[id]

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
      {/* The plaza's own structure fades up with distance. The panel below
          keeps its own presence fade, which is tighter and tied to arriving
          rather than to approaching, so it is deliberately left out. */}
      <DistanceFade t={STATION_T[id]}>
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
      </DistanceFade>

      {/* The accent light that used to stand here is now part of the world's
          fixed two-light rig - see components/world/StationLights. A light
          mounted per station changed the scene's light count as the avatar
          walked, and every one of those changes recompiled every material in
          the world. */}

      {/* Each thing that can suspend gets its own boundary, so a font or a
          logo still in flight can only ever blank itself. One boundary shared
          across the world is what used to take every plaza, signpost and
          skill mote off screen the moment a single crest was fetched. */}
      <Suspense fallback={null}>
        <StationPanel
          content={content}
          anchor={anchor}
          offset={panelOffset}
          rotationY={panelRotation}
        />
      </Suspense>

      {signposts.map(({ entry, position }) => (
        <Suspense key={entry.id} fallback={null}>
          <LinkSignpost
            caption={entry.heading}
            links={entry.links ?? []}
            position={position}
            accent={accent}
          />
        </Suspense>
      ))}

      {PLAZA_BADGE[id] && (
        <Suspense fallback={null}>
          <PlazaBadge position={panelAnchor} image={PLAZA_BADGE[id]!} accent={accent} />
        </Suspense>
      )}

      {id === "certifications" &&
        TOOL_ICONS.map((image, i) => (
          <Suspense key={image} fallback={null}>
            <PlazaBadge
              position={[
                panelAnchor[0] + (i - (TOOL_ICONS.length - 1) / 2) * TOOL_ICON_SPACING,
                panelAnchor[1],
              ]}
              image={image}
              accent={accent}
            />
          </Suspense>
        ))}
    </group>
  )
}
