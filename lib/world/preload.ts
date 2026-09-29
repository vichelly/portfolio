import { useTexture } from "@react-three/drei"
import { FONT_BOLD, FONT_REGULAR } from "@/lib/world/panelLayout"

/**
 * Every asset the world draws text or crests with, fetched once at module
 * load rather than at the moment a plaza first comes into view.
 *
 * The Suspense boundaries around each panel and crest are the correctness
 * guarantee - a still-loading asset can only ever blank its own object. This
 * is why the visitor does not notice them: by the time they walk up to a
 * plaza, its logo and both fonts are already in cache, so nothing suspends.
 *
 * Before this, the first approach to each plaza fetched its crest on the spot,
 * and because every plaza shared one Suspense boundary, that single fetch took
 * the whole world off screen until it landed.
 */

/** Every crest the world can show. Keep in step with Station's PLAZA_BADGE. */
export const PLAZA_IMAGES = [
  "/logos/itau.jpg",
  "/logos/agile-inc.jpg",
  "/logos/fei.jpg",
  "/logos/fiap.jpg",
  "/logos/devin.jpg",
  "/logos/claude.png",
] as const

let started = false

export function preloadWorldAssets(): void {
  if (started || typeof window === "undefined") return
  started = true

  useTexture.preload([...PLAZA_IMAGES])

  // The fonts are warmed through the HTTP cache rather than through troika's
  // own preloadFont. troika is a transitive dependency of drei with no type
  // declarations, and reaching past drei to call into it directly would tie
  // this file to a package the project never chose. Fetching the same URL the
  // text renderer will ask for gets the bytes there first, which is the slow
  // part; parsing happens in troika's worker either way.
  for (const font of [FONT_REGULAR, FONT_BOLD]) {
    void fetch(font, { cache: "force-cache" }).catch(() => {
      // An offline or blocked fetch just means the font loads on demand, the
      // way it did before. The Suspense boundaries cover that case.
    })
  }
}
