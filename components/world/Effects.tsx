"use client"

import {
  BrightnessContrast,
  Bloom,
  EffectComposer,
  HueSaturation,
  Vignette,
} from "@react-three/postprocessing"
import type { TierSettings } from "@/lib/world/quality"

interface EffectsProps {
  mode: TierSettings["effects"]
}

/**
 * The grade. Bloom's threshold sits above the brightest value the sky reaches,
 * so only genuinely emissive surfaces - the station crystals, the avatar's
 * colour timer and eyes, the finish star - are allowed to glow. A dawn sky is
 * bright enough to bloom the whole frame otherwise.
 */
export default function Effects({ mode }: EffectsProps) {
  if (mode === "off") return null

  return (
    <EffectComposer multisampling={mode === "full" ? 4 : 0}>
      <Bloom
        intensity={0.55}
        luminanceThreshold={0.92}
        luminanceSmoothing={0.28}
        mipmapBlur
      />
      <Vignette offset={0.28} darkness={0.42} />
      {mode === "full" ? (
        <>
          <HueSaturation saturation={0.06} />
          <BrightnessContrast brightness={0.01} contrast={0.07} />
        </>
      ) : (
        <></>
      )}
    </EffectComposer>
  )
}
