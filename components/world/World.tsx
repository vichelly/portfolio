"use client"

import { useEffect, useMemo, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { PerformanceMonitor, Preload } from "@react-three/drei"
import Avatar from "@/components/world/Avatar"
import CameraRig from "@/components/world/CameraRig"
import Trail from "@/components/world/Trail"
import Station from "@/components/world/Station"
import Decor from "@/components/world/Decor"
import Sky from "@/components/world/Sky"
import Terrain from "@/components/world/Terrain"
import Dust from "@/components/world/Dust"
import SkillMotes from "@/components/world/SkillMotes"
import Effects from "@/components/world/Effects"
import SunRig from "@/components/world/SunRig"
import StationLights from "@/components/world/StationLights"
import AvatarContactShadow from "@/components/world/AvatarContactShadow"
import { useQualityTier } from "@/lib/world/quality"
import WorldUI from "@/components/world/WorldUI"
import { useMovementInput } from "@/lib/input/useMovementInput"
import { useInputModeDetection } from "@/lib/input/useInputModeDetection"
import { useWorldStore } from "@/lib/world-store"
import TrailObstacles from "@/components/world/TrailObstacles"
import { PALETTE } from "@/lib/world/theme"
import { STATION_ANCHORS, STATION_T } from "@/lib/world/trail"
import { useMountWindow } from "@/lib/world/mountWindow"
import { OBSTACLES, assertObstaclePlacement } from "@/lib/world/obstacles"
import { assertPlazaLightBudget } from "@/lib/world/plaza"
import { preloadWorldAssets } from "@/lib/world/preload"
import { assertContentCoverage } from "@/lib/world/stations"

// Fonts and plaza crests start loading as soon as the module is evaluated, so
// the per-object Suspense boundaries below almost never actually suspend.
preloadWorldAssets()

/**
 * Everything whose presence depends on where the avatar is.
 *
 * This sits inside the Canvas because the windowing now reads the avatar's
 * live position in a frame callback rather than a progress value from the
 * store. Keeping it in its own component also keeps a mount change from
 * re-rendering the Canvas, the lights, the terrain and the effects chain along
 * with it: when a plaza enters, only this subtree reconciles.
 */
function WindowedContent() {
  const stationItems = useMemo(
    () => STATION_ANCHORS.map((a) => ({ id: a.id, t: STATION_T[a.id], anchor: a })),
    [],
  )
  // Both sets go through the same windowing rule, so they enter and leave
  // together with the same hysteresis rather than each having its own idea of
  // "near".
  const mountedStations = useMountWindow(stationItems)
  const mountedObstacles = useMountWindow(OBSTACLES)

  return (
    <>
      <TrailObstacles obstacles={mountedObstacles} />
      {mountedStations.map(({ anchor }) => (
        <Station key={anchor.id} id={anchor.id} anchor={anchor.point} />
      ))}
    </>
  )
}

export default function World() {
  const input = useMovementInput()
  useInputModeDetection()

  const { settings, stepDown } = useQualityTier()
  const locale = useWorldStore((s) => s.locale)

  // A hidden page renders nothing. Browsers throttle animation frames in a
  // background tab but do not stop them, and every callback in the scene would
  // keep ticking against a clock nobody is watching.
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const sync = () => setVisible(document.visibilityState !== "hidden")
    sync()
    document.addEventListener("visibilitychange", sync)
    return () => document.removeEventListener("visibilitychange", sync)
  }, [])

  useEffect(() => {
    if (process.env.NODE_ENV === "production") return
    // Career content going missing is the one failure the world must not ship.
    assertContentCoverage()
    // An obstacle that walls off the trail is the other one.
    assertObstaclePlacement()
    // A plaza that silently stops being lit is the third.
    assertPlazaLightBudget()
  }, [])

  return (
    <div className="fixed inset-0 h-dvh w-dvw overflow-hidden" style={{ background: PALETTE.skyHaze }}>
      {/* `far` and the fog density below are one decision, not two. At the old
          pairing (far 260, density 0.0068) geometry was still 4.4% visible
          when the far plane cut it, which reads as a hard edge along the
          horizon. 340 against 0.0072 leaves 0.25% - fully dissolved before it
          is clipped - while barely touching the mid-distance haze (17% at 60
          units, against 15% before). `near` moves out to 0.5 to buy back the
          depth precision the longer far plane costs; nothing ever gets closer
          to the camera than the avatar, several units away. */}
      <Canvas
        shadows
        frameloop={visible ? "always" : "never"}
        dpr={[1, settings.dprCap]}
        camera={{ fov: 55, near: 0.5, far: 340 }}
      >
        {/* Only ever steps down: a tier whose cost straddles the target would
            otherwise flip back and forth forever.

            Sampled in short windows so a wrong initial guess is corrected
            within roughly a second, rather than after the visitor has already
            watched it stutter. Two consecutive bad windows are required, so a
            single hitch - a shader compiling, a texture decoding - does not
            cost the visitor a tier. */}
        <PerformanceMonitor ms={200} iterations={4} flipflops={2} onDecline={stepDown} />

        <color attach="background" args={[PALETTE.skyHaze]} />
        {/* Fog takes the horizon's colour, not the zenith's - that is what
            makes a far ridge sit in front of the sky instead of dissolving
            into it. Exponential, so the falloff reads as depth of air. */}
        <fogExp2 attach="fog" args={[PALETTE.skyHaze, 0.0072]} />

        <Sky />

        <hemisphereLight args={[PALETTE.skyMid, PALETTE.terrainHigh, 0.55]} />
        <ambientLight intensity={0.26} />
        <SunRig
          shadowMapSize={settings.shadowMapSize}
          shadowExtent={settings.shadowExtent}
        />
        {/* The world's accent lights, fixed in number for the session. A light
            per station changed the scene's light configuration as the avatar
            walked, and three.js recompiles every material in the world when
            that happens - ten programs and 281.9 ms, measured, per crossing. */}
        <StationLights />

        {/* Terrain the trail is cut into. Relief only outside the corridor. */}
        <Terrain segments={settings.terrainSegments} />

        <Trail />
        <Decor density={settings.decorDensity} radius={settings.decorRadius} />

        <SkillMotes locale={locale} />
        <WindowedContent />

        <Dust count={settings.dustCount} />

        <Avatar input={input} />
        {/* Cheap contact grounding under the avatar - a tenth of SSAO's cost
            for most of what SSAO would buy at this art level. It travels with
            the avatar: pinned at the origin it only existed near the intro
            plaza, so the avatar lost its grounding for most of the walk. */}
        <AvatarContactShadow enabled={settings.contactShadow} />
        <CameraRig />

        <Effects mode={settings.effects} />

        {/* Compiles every material present at load, so the first frame the
            visitor sees is also the first frame that had to compile anything.
            Without it a plaza's materials compile in the frame it becomes
            visible - which is the frame the visitor is walking toward it. */}
        <Preload all />
      </Canvas>

      <WorldUI setTouchVector={input.setTouchVector} setTouchJump={input.setTouchJump} />
    </div>
  )
}
