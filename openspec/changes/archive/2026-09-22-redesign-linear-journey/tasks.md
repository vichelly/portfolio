## 1. Trail and physics foundations

- [x] 1.1 Create `lib/world/trail.ts` with the ordered station list (intro, Itaú, Agile inc, FEI, skills, certifications, projects, contact), a centripetal `CatmullRomCurve3` through their anchors, a precomputed sample table, and `projectToTrail(x, z) → { t, lateral, tangent }`; verify by logging the projection for a handful of known points and confirming `t` increases monotonically along the station order and `lateral` is ~0 on the anchors
- [x] 1.2 Add `halfWidth(t)` to `trail.ts` (wide at station plazas, narrow between) plus `clampToTrail(x, z)`, and verify a point far off the path is returned on the boundary at the same `t`
- [x] 1.3 Add the parkour detour as a second curve branching at a main-trail `t`, with entrance-band detection and hysteresis (exit band wider than entry band), and verify the owner does not oscillate when standing still inside the band
- [x] 1.4 Create `lib/world/physics.ts` exporting the single tuning object (`GRAVITY -26`, `JUMP_VELOCITY 9.5`, `COYOTE_TIME 0.12`, `JUMP_BUFFER 0.15`, `AIR_CONTROL 0.45`, `MAX_SPEED 6.5`) and the swept-AABB resolver (Y first, then X and Z independently, reporting the surface landed on); verify with a scripted box-drop case that the body rests exactly on the surface and does not tunnel at max fall speed
- [x] 1.5 Extend `lib/input/useMovementInput.ts` to expose `jumpQueuedAt` (set on keydown/touchstart) and `consumeJump()` in place of the boolean `jump`; verify holding Space sets the timestamp once and a consumed jump clears it

## 2. World-wide character controller

- [x] 2.1 Rewrite `Avatar.tsx` movement to own a 3D velocity with gravity integration, grounded state, and trail clamping from `clampToTrail`; verify the avatar falls to the ground on spawn and cannot walk off the trail surface
- [x] 2.2 Implement jump with coyote time and jump buffering against `consumeJump()`; verify jumping off a ledge late still jumps, pressing jump just before landing jumps on contact, and holding jump yields exactly one jump per landing
- [x] 2.3 Implement air control at `AIR_CONTROL` authority and landing detection; verify mid-air steering visibly changes the arc but with less authority than ground movement
- [x] 2.4 Update `CameraRig.tsx` to frame along the trail tangent with look-ahead and to keep the avatar framed through a full jump arc; verify by jumping at several points along the trail with no camera snap
- [x] 2.5 Delete `lib/world/layout.ts` and `lib/input/useJourneyProgress.ts` and update every import; verify `npx tsc --noEmit` passes

## 3. Linear world and stations

- [x] 3.1 Build the trail geometry (path surface following the curve, station plazas, edge treatment) as a `Trail` component; verify the rendered surface visually matches where `clampToTrail` allows movement
- [x] 3.2 Create `lib/world/stations.ts` projecting `lib/content/*.ts` into station content (heading, period/subtitle, body, links), covering every experience entry, the FEI education entry, all skill categories, all certifications, all six projects, and contact; verify a count assertion that no content entry is left unassigned
- [x] 3.3 Create the `Station` component (framing geometry, accent color, anchor) and mount stations by proximity window around the current `t` in `World.tsx`; verify only nearby stations are present in the scene graph while walking
- [x] 3.4 Replace the scene contents in `World.tsx`: remove `Hub`, `rooms/*`, `ZoneFloor`, `RoomSign`, `PointOfInterest`, and the hardcoded waypoint spheres; verify walking start to end encounters every station exactly once in narrative order
- [x] 3.5 Add the trail progress indicator to the HUD, driven by normalized `t`; verify it advances as the avatar moves forward and decreases when backtracking
- [x] 3.6 Delete `Hub.tsx`, `components/world/rooms/*`, `ZoneFloor.tsx`, `RoomSign.tsx`, `PointOfInterest.tsx`; verify `npx tsc --noEmit` passes and the app builds

## 4. Diegetic content surface

- [x] 4.1 Add a self-hosted text font under `public/fonts/` and wire it explicitly into every drei `<Text>`; verify no network request to an external font host when the world loads
- [x] 4.2 Build `StationPanel` rendering heading, period/subtitle, and wrapped body as drei `<Text>` on a billboarded 3D backing panel, with opacity derived per-frame from distance along the curve to the anchor; verify content fades in on approach and out on departure with no click, key press, or timeout involved
- [x] 4.3 Verify content never blocks input: hold a movement key while crossing a station and jump while content is displayed — the avatar must keep moving at full speed and the jump must execute with the content unaffected
- [x] 4.4 Handle long bodies (the Itaú entry) with `maxWidth` wrapping and per-station scale, plus viewport-aspect-driven scale and camera distance for narrow screens; verify the full Itaú text is readable without camera manipulation at both desktop and 360px width
- [x] 4.5 Build `LinkSignpost` as a scene object with a labeled destination and an `onClick` calling `window.open(href, "_blank", "noopener,noreferrer")`, placed at the relevant stations; verify each project link, GitHub link, LinkedIn, and email opens in a new tab with the world still interactive in the original tab
- [x] 4.6 Delete `AnimatedPanel.tsx`, remove `activeRoom`/`openPanelId` from `lib/world-store.ts` in favor of `inputMode`, `fallbackOpen`, and `containment`, and publish derived station/progress to the HUD without re-rendering the scene per frame; verify with React DevTools that walking does not re-render the canvas tree

## 5. Parkour detour on the shared controller

- [x] 5.1 Rebuild `parkour/ParkourZone.tsx` to supply AABB platform definitions to the shared resolver instead of Rapier rigid bodies, keeping it dynamically imported and proximity-mounted; verify the course never mounts when the visitor walks past without entering
- [x] 5.2 Implement the moving platform as an authored per-frame translation with carry (the avatar grounded on it moves with it); verify the avatar rides the platform without sliding off or falling through
- [x] 5.3 Implement fall-and-respawn at the course start with no effect on station state or trail progress; verify falling off mid-course leaves the progress indicator unchanged
- [x] 5.4 Mark the branch point as an optional detour (signage, distinct treatment) and verify walking past it continues the main trail, while walking back through it from inside returns to the trail at the same point
- [x] 5.5 Verify jump parity: jump on the trail, enter the course, jump immediately — height, responsiveness, and binding must be identical
- [x] 5.6 Remove `@react-three/rapier` from `package.json`, reinstall, and verify the app builds and the course still plays

## 6. Avatar rebuild

- [x] 6.1 Build the nested joint hierarchy (`root → hips → spine → chest → neck → head`, `chest → shoulder → upperArm → forearm → hand`, `hips → thigh → shin → foot`) with human proportions; verify feet rest at ground level and no joint is visibly detached
- [x] 6.2 Model the Ultraman identity pass — silver/red panel split, emissive chest color timer, head crest, slanted emissive eyes, distinct hands and feet; verify at default camera distance the silhouette reads as a human figure and front is distinguishable from back
- [x] 6.3 Implement the weighted animation state machine (`idle`, `walk`, `jump`, `fall`, `land`) selected from physics state, with per-state blend rates; verify each of the five states produces a visibly distinct pose and transitions blend rather than snap
- [x] 6.4 Tune the walk cycle rate to track horizontal speed and add the landing response; verify walking slowly and quickly produce proportionally different cadence and that landing plays before returning to idle

## 7. Design pass and accessibility

- [x] 7.1 Define one palette and material treatment in a shared module and apply it across trail, stations, signposts, avatar accents, lighting, and sky; verify any two stations differ only in accent color and content
- [x] 7.2 Add trail-side environment art (props, silhouettes framing the path ahead) tuned so the next station is visible from the previous one; verify by walking the full trail without losing sight of where to go next
- [x] 7.3 Redesign the HUD (progress indicator, station label, fallback entry point, touch controls) against the new palette; verify at 360px width that joystick, jump button, and progress indicator are all visible, non-overlapping, and at least 44x44px
- [x] 7.4 Restyle `FallbackMenu` and the `InfoPanel` detail renderer to the new design, and confirm they list every experience, education, skill, certification, project link, and contact item present in the world; verify parity by comparing against `lib/world/stations.ts`
- [x] 7.5 Verify the fallback view is fully keyboard-operable with Tab/Shift+Tab/Enter/Escape and that its entry control is reachable by tabbing from the top of the page

## 8. Final verification

- [x] 8.1 Walk the complete trail on desktop and confirm every spec scenario in `specs/portfolio-world` and `specs/career-content-discovery` holds: correct order, no missed content, no modal, no close button, proximity dismissal, progress updates on backtrack
- [x] 8.2 Walk the complete trail in a 360px touch emulation and confirm every scenario in `specs/avatar-control` holds for touch: joystick movement, jump button present everywhere, readable content, no obstruction
- [x] 8.3 Run `npm run build` and confirm it succeeds, `@react-three/rapier` is absent from the bundle, and the parkour chunk is code-split
- [x] 8.4 Confirm the URL never changes and the canvas is never torn down across a full trail traversal including the parkour detour

## 9. Bilingual Portuguese / English

- [x] 9.1 Create `lib/i18n/locale.ts` with the `Locale` type, the `Localized` pair, browser detection and per-device persistence; verify a pt-BR browser and an en-US browser each start in their own language
- [x] 9.2 Convert every text field in `lib/content/*.ts` to a `{ en, pt }` pair and translate all of it, and make `lib/world/stations.ts` a function of locale; verify `tsc --noEmit` passes and the coverage assertion still places every entry
- [x] 9.3 Add `lib/i18n/strings.ts` for interface copy and localize the HUD, fallback view, detour sign and parkour course text; verify no English string remains on screen in Portuguese and vice versa
- [x] 9.4 Add `locale` to the world store with a hydration-safe default applied after mount, and the language control to the HUD; verify switching re-renders panels and signposts without moving the avatar or resetting progress
- [x] 9.5 Verify the choice survives a reload, and that the fallback view follows the language in both directions

## 10. Content correction and two-tier bodies

- [x] 10.1 Split the Itaú entry into two roles - Software Engineer Intern (Digital Achievement, Conquista PF, Jul 2024 - Jul 2025) and Junior Software Engineer (Hyperautomation RPA, Jul 2025 - Present) - and place both at the Itaú station, most recent first; verify the trail still meets every station once in narrative order
- [x] 10.2 Add the RPA role's real work: API Gateway consolidation with the 59% to 100% governance score, generative AI agents on AWS ECS with Dataverse and DynamoDB, Datadog observability, Terraform and CloudFormation, and the FinOps savings; verify both roles appear on the Itaú panel with their periods
- [x] 10.3 Give long entries an optional short `summary` for the in-world panel while the fallback view keeps the full text; verify the Itaú panel is readable at the default camera distance and the text view still carries every paragraph
- [x] 10.4 Choose the station panel's shape by its laid-out height rather than its entry count, trying successively wider column layouts; verify no station's panel is scaled below legibility
