"use client"

import { Suspense, useEffect, useMemo } from "react"
import dynamic from "next/dynamic"
import { Canvas } from "@react-three/fiber"
import { PerformanceMonitor } from "@react-three/drei"
import { Text } from "@react-three/drei"
import Avatar from "@/components/world/Avatar"
import CameraRig from "@/components/world/CameraRig"
import Trail from "@/components/world/Trail"
import Station from "@/components/world/Station"
import Decor from "@/components/world/Decor"
import Sky from "@/components/world/Sky"
import Terrain from "@/components/world/Terrain"
import Dust from "@/components/world/Dust"
import Effects from "@/components/world/Effects"
import { ContactShadows } from "@react-three/drei"
import { useQualityTier } from "@/lib/world/quality"
import WorldUI from "@/components/world/WorldUI"
import { useMovementInput } from "@/lib/input/useMovementInput"
import { useInputModeDetection } from "@/lib/input/useInputModeDetection"
import { useWorldStore } from "@/lib/world-store"
import { PALETTE, DETOUR_ACCENT, SUN_POSITION } from "@/lib/world/theme"
import { FONT_BOLD, FONT_REGULAR } from "@/lib/world/panelLayout"
import {
  DETOUR_BRANCH_T,
  DETOUR_ENTRANCE,
  STATION_ANCHORS,
  stationsInMountWindow,
} from "@/lib/world/trail"
import { assertContentCoverage } from "@/lib/world/stations"
import { UI } from "@/lib/i18n/strings"
import { t, type Locale } from "@/lib/i18n/locale"

const ParkourCourse = dynamic(() => import("@/components/world/parkour/ParkourCourse"), {
  ssr: false,
  loading: () => null,
})

/** How close to the branch (in trail `t`) the course starts existing. */
const COURSE_MOUNT_WINDOW = 0.06

function DetourSign({ locale }: { locale: Locale }) {
  return (
    <group position={[DETOUR_ENTRANCE.x + 1.5, 0, DETOUR_ENTRANCE.z + 1]} rotation={[0, -0.5, 0]}>
      <mesh position={[0, 1.3, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.13, 2.6, 6]} />
        <meshStandardMaterial color={PALETTE.stoneDark} flatShading />
      </mesh>
      <mesh position={[0, 2.7, 0]} castShadow>
        <boxGeometry args={[3.4, 0.9, 0.12]} />
        <meshStandardMaterial
          color={PALETTE.panel}
          emissive={DETOUR_ACCENT}
          emissiveIntensity={0.25}
          flatShading
        />
      </mesh>
      <Text
        font={FONT_BOLD}
        fontSize={0.3}
        color={DETOUR_ACCENT}
        anchorX="center"
        anchorY="middle"
        position={[0, 2.84, 0.07]}
      >
        {t(UI.detourSign, locale)}
      </Text>
      <Text
        font={FONT_REGULAR}
        fontSize={0.19}
        color={PALETTE.textMuted}
        anchorX="center"
        anchorY="middle"
        position={[0, 2.52, 0.07]}
      >
        {t(UI.detourSignSub, locale)}
      </Text>
    </group>
  )
}

export default function World() {
  const input = useMovementInput()
  useInputModeDetection()

  const { settings, stepDown } = useQualityTier()
  const progressPercent = useWorldStore((s) => s.progressPercent)
  const locale = useWorldStore((s) => s.locale)
  const containment = useWorldStore((s) => s.containment)

  // Station mounting is driven by whole-percent progress, so the scene graph
  // changes a handful of times per trail rather than every frame.
  const mounted = useMemo(() => stationsInMountWindow(progressPercent / 100), [progressPercent])
  const courseNearby =
    containment === "detour" ||
    Math.abs(progressPercent / 100 - DETOUR_BRANCH_T) < COURSE_MOUNT_WINDOW

  useEffect(() => {
    // Career content going missing is the one failure the world must not ship.
    if (process.env.NODE_ENV !== "production") assertContentCoverage()
  }, [])

  return (
    <div className="fixed inset-0 h-dvh w-dvw overflow-hidden" style={{ background: PALETTE.skyHaze }}>
      <Canvas shadows dpr={[1, settings.dprCap]} camera={{ fov: 55, near: 0.1, far: 260 }}>
        {/* Only ever steps down: a tier whose cost straddles the target would
            otherwise flip back and forth forever. */}
        <PerformanceMonitor onDecline={stepDown} />

        <color attach="background" args={[PALETTE.skyHaze]} />
        {/* Fog takes the horizon's colour, not the zenith's - that is what
            makes a far ridge sit in front of the sky instead of dissolving
            into it. Exponential, so the falloff reads as depth of air. */}
        <fogExp2 attach="fog" args={[PALETTE.skyHaze, 0.0068]} />

        <Sky />

        <hemisphereLight args={[PALETTE.skyMid, PALETTE.terrainHigh, 0.55]} />
        <ambientLight intensity={0.26} />
        <directionalLight
          position={SUN_POSITION.toArray()}
          color={PALETTE.sun}
          intensity={2.8}
          castShadow
          shadow-mapSize={[settings.shadowMapSize, settings.shadowMapSize]}
          shadow-camera-left={-70}
          shadow-camera-right={70}
          shadow-camera-top={70}
          shadow-camera-bottom={-70}
          shadow-camera-far={300}
          shadow-bias={-0.0012}
          shadow-normalBias={0.02}
        />

        {/* Terrain the trail is cut into. Relief only outside the corridor. */}
        <Terrain segments={settings.terrainSegments} />

        <Trail />
        <Decor density={settings.decorDensity} />

        {/* Everything that renders text suspends while the font loads, so it
            sits behind its own boundary - the world itself never waits on it. */}
        <Suspense fallback={null}>
          <DetourSign locale={locale} />

          {STATION_ANCHORS.map((anchor, index) =>
            mounted.includes(anchor.id) ? (
              <Station key={anchor.id} id={anchor.id} anchor={anchor.point} index={index} />
            ) : null,
          )}

          {courseNearby && <ParkourCourse />}
        </Suspense>

        <Dust count={settings.dustCount} />

        <Avatar input={input} />
        {/* Cheap contact grounding under the avatar - a tenth of SSAO's cost
            for most of what SSAO would buy at this art level. */}
        <ContactShadows
          position={[0, 0.02, 0]}
          scale={9}
          blur={2.4}
          opacity={0.45}
          far={6}
          frames={Infinity}
        />
        <CameraRig />

        <Effects mode={settings.effects} />
      </Canvas>

      <WorldUI setTouchVector={input.setTouchVector} setTouchJump={input.setTouchJump} />
    </div>
  )
}
