## Why

The 3D portfolio currently branches: a central hub with four separate zones (Experience, Skills, Certifications, Projects) radiating out in different directions, each reached through its own gateway. Visitors have to decide where to go before they know what is there, and the career story arrives out of order. Content is delivered through a DOM modal that dims the scene and holds the visitor hostage until they click a close button with the mouse — the single most immersion-breaking moment in the experience. Jumping only works inside the parkour zone, so the rest of the world feels like a sliding camera rather than a game. And the avatar, meant to read as an Ultraman-inspired human, currently reads as a robot: a capsule torso, a sphere head, and stick limbs with no neck, hands, feet, or silhouette.

## What Changes

- **BREAKING** Replace the hub-and-four-rooms layout with a single continuous linear trail. Stations sit along it in narrative order — Intro → Itaú → Agile inc → FEI → Skills → Certifications → Projects → Contact — with the parkour course as a clearly marked optional detour beside the trail, never on it.
- Move jump and gravity into the shared avatar controller so the visitor can jump **anywhere in the world**, not only in the parkour zone. Movement gains grounded game feel: gravity, jump buffering, coyote time, air control, and landing recovery, plus tuned acceleration/braking.
- Run the whole world — trail and parkour alike — on one kinematic character controller, so jumping feels identical everywhere. This drops the `@react-three/rapier` dependency; the parkour course keeps its own code-split bundle and stays proximity-mounted.
- **BREAKING** Retire the modal `InfoPanel` as the primary content surface. Career content is presented diegetically: 3D text panels anchored at each station that fade in as the avatar arrives and fade out as it leaves. No overlay, no click-to-close, no interruption of movement.
- Turn outbound links (LinkedIn, GitHub, project URLs, email) into interactive in-world signposts at their station rather than buttons inside a dialog.
- Rebuild the avatar as a readable Ultraman-inspired humanoid: proper proportions, neck, shoulders, hands, feet, silhouette detail, and a walk/idle/jump/fall animation set driven by the new physics state.
- Raise overall art direction: trail-side environment art, station framing, lighting and palette coherence, a progress indicator tied to trail position, and a redesigned HUD.
- Keep the accessible non-3D fallback ("Skip to info") as a complete path to every piece of career content, restyled to match the new design.
- Make the whole experience bilingual: every piece of content and interface copy exists in Portuguese and English, the visitor switches with one control in the HUD, and the choice is remembered on their device.

## Capabilities

`openspec/specs/` is currently empty — the predecessor change `add-3d-portfolio-game` has not been archived, so its requirements are not yet the project baseline. These deltas reuse that change's capability paths and are written as ADDED requirements that describe the target behavior; where they overlap the predecessor's requirements (hub-and-rooms structure, modal panels, parkour-only jump), they supersede them.

### New Capabilities

None. All four capability paths below already exist in the in-flight predecessor change and are reused rather than duplicated.

### Modified Capabilities

- `portfolio-world`: world structure becomes a single linear trail with ordered stations instead of a hub with four radiating zones; art direction requirements extended to cover trail environment, station framing, and design coherence.
- `avatar-control`: jump and gravity apply world-wide with a defined game-feel contract (coyote time, jump buffer, air control); avatar visual identity becomes an explicit humanoid requirement; camera follows the trail.
- `career-content-discovery`: content is presented diegetically in 3D with proximity-driven appear/dismiss and no blocking modal or required close interaction; outbound links become in-world signposts; the accessible fallback remains mandatory.
- `parkour-challenge`: parkour becomes an optional detour off the linear trail, and jump is no longer exclusive to it.
- `portfolio-world`: also gains the visitor's language choice, since the control and its persistence are part of the world's interface.
- `career-content-discovery`: also gains bilingual parity - every entry and every label exists in both languages, in the world and in the fallback view.

## Impact

- **Layout / routing**: `lib/world/layout.ts` (zone model → trail-segment model), `lib/world/journey.ts` (waypoints become the authoritative station list), `components/world/Hub.tsx` and `components/world/rooms/*` (hub gateways and the four room components are removed or replaced by station components).
- **Physics / input**: `components/world/Avatar.tsx` (gravity, jump, grounded state, humanoid rebuild + animation), `lib/input/useMovementInput.ts` (jump edge detection / buffering), `components/world/parkour/ParkourZone.tsx` (rebuilt on the shared controller, Rapier removed), `components/world/CameraRig.tsx` (trail-aware framing).
- **Content presentation**: `components/world/InfoPanel.tsx` (demoted to the fallback path), `components/world/AnimatedPanel.tsx` (replaced by a 3D station panel), `components/world/PointOfInterest.tsx`, `components/world/WorldUI.tsx`, `components/world/FallbackMenu.tsx`, `lib/world/panelContent.ts`, `lib/input/useJourneyProgress.ts`, `lib/world-store.ts`.
- **Dependencies**: no new runtime dependencies. `@react-three/drei` `<Text>` (troika SDF) renders diegetic copy; `@react-three/rapier` is removed from `package.json`.
- **Language**: new `lib/i18n/` (locale type, detection, persistence, interface strings); every text field in `lib/content/*.ts` becomes a `{ en, pt }` pair; `lib/world/stations.ts` becomes a function of locale; `lib/world-store.ts` gains `locale`.
- **Content data**: `lib/content/*.ts` remains the single source of truth; every existing entry must still be reachable. Long entries also carry a short `summary` for the in-world panel, with the full text kept for the fallback view.
- **Not affected**: `components/ui/**` (shadcn primitives), Next.js app shell, build tooling.
