## 1. Palette and light rig

- [x] 1.1 Re-ground `lib/world/theme.ts` on the dawn direction: four sky stops, sun colour and direction vector, horizon haze, two terrain tints, two stone tints, and station accents re-tuned against warm ground; verify no component still hardcodes a colour by grepping for hex literals outside the theme
- [x] 1.2 Rebuild the light rig in `World.tsx` — sun at ~18° elevation in the same direction the sky will draw it, warmed colour, hemisphere fill down to 0.45, ambient to 0.18; verify shadows are long and the sun's direction is readable from them in a screenshot at three points along the trail

## 2. Sky and fog

- [x] 2.1 Build a `Sky` component: a back-side sphere with a gradient shader through the four stops plus a sun disc and halo, positioned from the shared sun vector; verify the sun in the sky and the shadow direction on the ground agree
- [x] 2.2 Replace linear fog with `FogExp2` coloured from the horizon stop, density tuned so the next station (~20u) is barely veiled and the trail's far end (~165u) is heavily veiled; verify in a screenshot that near terrain, far terrain and sky read as three distinct tones

## 3. Procedural surface detail

- [x] 3.1 Create the shared material helper: a GLSL chunk with `hash`, value noise, `fbm` and `bands`, plus an `onBeforeCompile` patcher that perturbs `diffuseColor` from world position and takes scale, contrast and tint uniforms; verify one patched material renders with lights, shadows and fog still working
- [x] 3.2 Apply it to the trail surface — fine grain at ~2u plus a ~30u tonal drift; verify at close camera distance the surface shows grain, and across a long stretch no seam or repeat is discernible
- [x] 3.3 Apply it to stone (pylons, plinths, rocks, signposts): `bands` strata along Y, fBm veining, faces darkened by slope; verify two rocks side by side do not read identically
- [x] 3.4 Apply it to vegetation with patchy tone at ~6u; verify no two trees look the same
- [x] 3.5 Verify the whole world loads with zero image-texture requests, by recording the network log of a fresh load

## 4. Terrain relief

- [x] 4.1 Replace the flat ground plane with a displaced height field (160×180 segments) using the same fBm as the shaders, displaced on the CPU in a `useMemo`; verify the horizon has shape from several points along the trail
- [x] 4.2 Apply the trail falloff so height is zero inside `halfWidth(t) + 2` and ramps in over the following 12 units; verify by walking to the lateral limit at three points that the trail and terrain meet with no step, gap or floating edge
- [x] 4.3 Verify movement is unchanged: re-run the trail walkthrough harness and confirm every station is still met once in narrative order, progress still advances monotonically, and the avatar stays grounded at y=0 throughout

## 5. Panel type and density

- [x] 5.1 Raise the type scale in `lib/world/panelLayout.ts` to label 0.58, kicker 0.30, heading 0.38, meta 0.25, body 0.30, tags 0.24; verify the Itaú and Projects panels still lay out without error
- [x] 5.2 Tighten spacing — `LINE_HEIGHT` 1.26, `PARAGRAPH_GAP` 0.12, `BLOCK_GAP` 0.10, `ENTRY_GAP` 0.36, `COLUMN_GAP` 0.7, `PADDING` 0.34 — and raise `MAX_HEIGHT` to 6.6; verify each panel's text occupies at least three quarters of its height
- [x] 5.3 Add the fill-ratio test to the shape search beside the height test, so a shape is only accepted when text fills at least 75% of the panel; verify every station picks a shape that passes both
- [x] 5.4 Bring the station camera framing from 8.6 to 7.6 behind; verify `fit` stays at 1 for every station in the world, so no panel is scaled down
- [x] 5.5 Add a dev-only assertion computing on-screen pixel height per panel from the fov/distance formula, warning under 16px; verify it stays silent at desktop and at 360px width for all eight stations
- [x] 5.6 Verify by screenshot at every station, desktop and 360px, that the body text is comfortable to read without leaning in

## 6. Life in the air

- [x] 6.1 Add drifting dust motes lit by the sun, as a points system whose count comes from the quality tier; verify they are visible against dark terrain and invisible against the sun without flickering
- [x] 6.2 Add wind to vegetation — a vertex-stage sway keyed to world position so no two props move in phase; verify a still avatar still sees motion in the frame
- [x] 6.3 Add foot dust on walking and a burst on landing, driven by the controller's motion state; verify the landing burst fires once per landing and not while idle

## 7. Post-processing and the quality ladder

- [x] 7.1 Add `@react-three/postprocessing` and build the effect stack: `Bloom` with its luminance threshold above the sky's brightest value, `Vignette`, `HueSaturation` and `BrightnessContrast`; verify the sky does not bloom and the emissive accents do
- [x] 7.2 Add `ContactShadows` under the avatar for contact grounding; verify the avatar reads as touching the ground at several points including mid-jump
- [x] 7.3 Build `useQualityTier` from viewport width, `devicePixelRatio` and the unmasked renderer string, wired to drei's `PerformanceMonitor` so the tier only ever steps down; verify a simulated low frame rate steps the tier down and never back up
- [x] 7.4 Wire the tier to post-processing, shadow map size, terrain segments, particle counts, decor density and the `dpr` cap; verify at each tier that every station, control and piece of content still works
- [x] 7.5 Verify on a 360px viewport that the low tier loads, the world is complete, and the frame rate holds

## 8. Final verification

- [x] 8.1 Walk the whole trail on desktop and confirm every scenario in `specs/portfolio-world` holds: one named direction throughout, procedural detail with no tiling, sky and fog separating the planes, terrain relief meeting the trail cleanly, motion in the air, and the tier behaving
- [x] 8.2 Walk the whole trail at 360px and confirm the readability scenarios in `specs/career-content-discovery`: body text at 16px or more, text filling at least three quarters of each panel
- [x] 8.3 Re-run the physics and parkour harnesses unchanged and confirm no movement, containment or collision behaviour has shifted
- [x] 8.4 Run `npm run build` and confirm it succeeds, that no image-texture asset entered the bundle, and record the change in first-load JS from adding the post-processing package
