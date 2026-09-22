"use client"

import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Text } from "@react-three/drei"
import * as THREE from "three"
import { skills } from "@/lib/content/skills"
import { t, type Locale } from "@/lib/i18n/locale"
import { FONT_REGULAR } from "@/lib/world/panelLayout"
import { PALETTE } from "@/lib/world/theme"
import { TRAIL_CURVE } from "@/lib/world/trail"

interface Mote {
  key: string
  term: string
  color: string
  basePosition: THREE.Vector3
  bobSpeed: number
  bobHeight: number
  rotateSpeed: number
  phase: number
}

const FONT_SIZE = 0.42
const LATERAL_SPREAD = 7
const HEIGHT_MIN = 2.2
const HEIGHT_MAX = 5.4
const OPACITY = 0.62
/** How many times each skill term repeats along the trail, spread at
 *  different points rather than stacked - the more visible, easier-to-spot
 *  version of the motes asked for after the first pass read as too faint
 *  and too sparse to notice while walking. */
const REPEAT_COUNT = 3
/** A few warm/teal tones already in the shared palette, cycled per mote so
 *  the field reads as colourful rather than one flat tint - kept inside the
 *  world's existing palette rather than introducing new hues. */
const MOTE_COLORS = [PALETTE.panelGlow, PALETTE.panelEdge, PALETTE.sun, PALETTE.sunDisc]

/** Flattens every skill category's comma-separated term list into individual
 *  words - "Go, Java, Spring Boot" becomes three separate motes rather than
 *  one blob of text, so each drifts and reads on its own. */
/** The "agile" category holds one certification sentence, not a comma
 *  separated tool list - it would float as one long unbroken phrase rather
 *  than a word. It already stands at the certifications plaza, so it is
 *  left out of the ambient motes rather than tokenized awkwardly. */
const MOTE_EXCLUDED_CATEGORY_IDS = ["agile"]

function termsFor(locale: Locale): string[] {
  const all = skills
    .filter((category) => !MOTE_EXCLUDED_CATEGORY_IDS.includes(category.id))
    .flatMap((category) =>
      t(category.skills, locale)
        .split(",")
        .map((term) => term.trim())
        .filter(Boolean),
    )
  return Array.from(new Set(all))
}

/**
 * Skill names as ambient, non-interactive typography drifting near the trail -
 * atmosphere rather than a station. There is no panel, no plaza, and nothing
 * to walk up to or dismiss: the full list stays enumerable in the fallback
 * view via `lib/content/skills.ts` directly.
 */
export default function SkillMotes({ locale }: { locale: Locale }) {
  const group = useRef<THREE.Group>(null)

  const motes = useMemo<Mote[]>(() => {
    const terms = termsFor(locale).flatMap((term) => Array(REPEAT_COUNT).fill(term) as string[])
    return terms.map((term, i) => {
      // Spread evenly along the trail's arc length, with a little jitter so
      // the row doesn't read as a ruled line.
      const tBase = (i + 0.5) / terms.length
      const jitterT = (Math.sin(i * 12.9898) * 43758.5453) % 1
      const tt = THREE.MathUtils.clamp(tBase + (jitterT - 0.5) * (1 / terms.length) * 0.6, 0.02, 0.98)
      const point = TRAIL_CURVE.getPointAt(tt)
      const tangent = TRAIL_CURVE.getTangentAt(tt).setY(0).normalize()
      const left = new THREE.Vector3(tangent.z, 0, -tangent.x)
      const side = i % 2 === 0 ? 1 : -1
      const lateral = LATERAL_SPREAD * (0.55 + 0.45 * Math.abs(Math.sin(i * 7.233))) * side

      const basePosition = point
        .clone()
        .addScaledVector(left, lateral)
        .setY(HEIGHT_MIN + Math.abs(Math.sin(i * 3.71)) * (HEIGHT_MAX - HEIGHT_MIN))

      return {
        key: `${term}-${i}`,
        term,
        color: MOTE_COLORS[i % MOTE_COLORS.length],
        basePosition,
        bobSpeed: 0.4 + (i % 5) * 0.07,
        bobHeight: 0.35 + (i % 3) * 0.12,
        rotateSpeed: 0.15 + (i % 4) * 0.05,
        phase: i * 1.7,
      }
    })
  }, [locale])

  useFrame((state) => {
    const g = group.current
    if (!g) return
    const time = state.clock.elapsedTime
    g.children.forEach((child, i) => {
      const mote = motes[i]
      if (!mote) return
      child.position.y = mote.basePosition.y + Math.sin(time * mote.bobSpeed + mote.phase) * mote.bobHeight
      // Billboard toward the camera first - flat text otherwise reads
      // mirrored from whichever side of the trail the visitor approaches
      // from - then layer a gentle wobble on top for drift, rather than a
      // free spin that would turn the text edge-on and unreadable.
      child.quaternion.copy(state.camera.quaternion)
      child.rotateZ(Math.sin(time * mote.rotateSpeed + mote.phase) * 0.08)
    })
  })

  return (
    <group ref={group}>
      {motes.map((mote) => (
        <Text
          key={mote.key}
          font={FONT_REGULAR}
          fontSize={FONT_SIZE}
          color={mote.color}
          anchorX="center"
          anchorY="middle"
          position={mote.basePosition}
          material-transparent
          material-opacity={OPACITY}
          material-depthWrite={false}
          raycast={() => null}
        >
          {mote.term}
        </Text>
      ))}
    </group>
  )
}
