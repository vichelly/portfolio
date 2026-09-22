## Context

See `proposal.md` - Why for the three problems this change addresses. The relevant current mechanics:

- `avatarState.t` (`lib/world/avatarState.ts`) only advances while `containment === "trail"` (`useCharacterController.ts:178`: `avatarState.t = containment.current === "trail" ? projection.t : avatarState.t`). `CameraRig` (`components/world/CameraRig.tsx`) derives its forward vector purely from `TRAIL_CURVE.getTangentAt(t)`, so once the avatar enters the detour, the camera's forward direction is whatever it was at the moment of entry, forever, until the avatar returns to the trail.
- The controller already computes a true movement-derived heading every frame - `s.facing = atan2(velocity.x, velocity.z)`, smoothed and applied to the avatar mesh's own rotation (`useCharacterController.ts:150-157`) - but never publishes it to `avatarState`, so nothing else in the app can read it.
- `StationPanel`'s `fitShape` (`components/world/StationPanel.tsx:60-68`) tries progressively wider `SHAPES`/`NARROW_SHAPES` and, if none keeps the panel under `MAX_HEIGHT` (5.8 world units) at a "dense enough" fill ratio, falls back to the widest shape and lets `fit = min(1, MAX_HEIGHT / layout.height)` shrink everything - type included - below whatever size the content needed. This is how the 16px floor gets silently broken today at the Itaú and skills stations, which already carry more than one entry.
- `lib/world/stations.ts` assembles `StationContent` per `StationId` from `lib/content/{experience,skills,projects,contact}.ts`; `lib/world/trail.ts` owns the `StationId` union, the anchors, and the detour branch geometry.

## Goals / Non-Goals

**Goals:**
- Camera stays correctly oriented to the avatar's real position and movement while inside the parkour detour.
- The trail visits exactly 3 content zones plus the existing intro/contact bookends and the parkour detour, with every entry meeting the existing 16px/three-quarters-fill rule for real, not on paper.
- Content matches the visitor's current resume (FinOps figure, RAAS entry, FIAP entry).

**Non-Goals:**
- Not touching the diegetic, no-modal panel philosophy (`career-content-discovery` - Content is presented diegetically) - the fix for density is more plazas, not a different UI paradigm.
- Not reworking movement, physics, or the parkour course's obstacles/geometry - only the camera's framing while inside it.
- Not redesigning the art direction, palette, or environment systems (`portfolio-world`'s procedural-surface, sky, and quality-tier requirements are unaffected).

## Decisions

### 1. Camera: publish a real detour-relative heading instead of reusing trail `t`

Add `avatarState.facing: number` (radians, world-space, same convention as `s.facing`), published every frame in `useCharacterController.ts` regardless of containment. `CameraRig` picks its forward vector by `avatarState.containment`:
- `"trail"`: unchanged - `TRAIL_CURVE.getTangentAt(t)`, smoothed as today.
- `"detour"`: `(sin(facing), 0, cos(facing))` from `avatarState.facing`, smoothed with the same time constant so the camera doesn't snap.

This reuses a value the controller already computes for the avatar's own rotation, so no new per-frame cost, and it keeps `CameraRig` a pure function of `avatarState` rather than reaching into `trail.ts` detour internals.

*Alternative considered*: keep advancing `avatarState.t` against `DETOUR_CURVE` while in the detour, and have `CameraRig` use the detour's tangent the way it uses the trail's. Rejected: the detour arena is a 2D platforming space (platforms at different heights and lateral offsets, a moving platform, a pit), not a corridor the avatar advances along linearly the way the trail is - a single arc-length `t` doesn't correspond to "the direction the avatar is facing" there the way it does on the trail. Following the avatar's actual velocity-derived heading is the correct signal for "what should the camera be looking at."

*Alternative considered*: look-at target locked to the nearest unclaimed platform/finish marker. Rejected as a larger behavior change than the bug calls for, and it would fight the visitor's own aim during a jump they're lining up sideways or backward.

### 2. Panel density: split into sequential plazas instead of shrinking type

`lib/world/stations.ts` changes from producing one `StationContent` per `StationId` with a flat `entries[]` to producing, for the two content zones, an ordered list of plazas, each a normal `StationContent` with one experience/education entry. Concretely: `professionalExperience(locale): StationContent[]` and `educationAndCertifications(locale): StationContent[]`, each returning one panel per entry (Itaú current role, Itaú internship, Agile inc; FEI, FIAP, PSPO I, and the remaining certifications respectively). `lib/world/trail.ts`'s `StationId` union and `STATION_ANCHORS` gain one anchor per plaza (e.g. `itau-rpa`, `itau-intern`, `agile-inc` under the experience zone's stretch of trail; `fei`, `fiap`, `certifications` under education) instead of one anchor per old station id. `StationPanel`/`fitShape` do not change: each plaza's panel already carries only one entry, which is exactly the case the existing `SHAPES` table and 16px floor were designed for - the bug was cramming multiple entries into one `StationContent`, not the fitting algorithm itself.

*Alternative considered*: keep one panel per zone and add internal pagination (next/prev cycling through entries) driven by proximity or a timer. Rejected: `career-content-discovery` requires content to dismiss itself only by walking away, with no click/tap/timeout-driven state change to "show the next thing" - a paging panel would need exactly that kind of internal state, which cuts against the walk-to-read model the rest of the world already uses successfully for multiple stops.

*Alternative considered*: raise `MAX_HEIGHT` and let panels grow taller instead of splitting. Rejected: a panel taller than the frame runs off the top or requires backing the camera up so far that everything reads small again - the 16px floor and `MAX_HEIGHT` cap already documented in `StationPanel.tsx` exist for this reason, and increasing one just moves the failure rather than removing it.

### 3. Skills as ambient typography

New small component, `components/world/SkillMotes.tsx`, rendered once (not per-zone): a handful of `Text` (troika via `@react-three/drei`) instances, one per skill name pulled from `lib/content/skills.ts`, drifting slowly in place near the trail (gentle vertical bob and slow rotation, similar in spirit to `Dust.tsx`'s existing particle motion) rather than parented to a plaza `group`. Not interactive, not dismissible, no plaza, no `StationId`. The full skills list stays enumerable in `InfoPanel`'s fallback view via `lib/content/skills.ts` directly (unchanged import), so `career-content-discovery` - Fallback content view mirrors the world stays satisfied without a station to draw from.

*Alternative considered*: attach skill words to the terrain/props system (`Decor.tsx`) as static, non-animated signage. Rejected: static text sitting in the landscape reads as another station the visitor might expect to "arrive at," which is exactly the mental model this change is moving away from; slow ambient motion signals "atmosphere," not "stop and read."

### 4. Projects fold into their originating entry, no station

Project descriptions currently in `lib/content/projects.ts` (Scrum Day 2023, Agile School back-office, etc.) become short clauses appended to the `summary`/`description` text of the experience entry that produced them (Agile inc already mentions Scrum Day 2023 in its summary; FEI's entry gains a one-line mention of the TCC). `lib/content/projects.ts` and the `projects` station branch in `lib/world/stations.ts` are deleted; `assertContentCoverage` drops its project-specific checks. Project `href`s that are worth keeping as links move onto the owning entry's `links[]` (already a `StationEntry` field, currently used for certification credentials and contact).

## Risks / Trade-offs

- [More plazas means a longer trail for the two content zones] → Anchors are spaced no wider than the current Itaú/Agile-inc/FEI spacing already is; walking time increases only by the few extra seconds per new stop, not by a new mechanic. Acceptable given the explicit request to make the "most important" zone (experience) richer, not shorter.
- [Splitting `itau-rpa` and `itau-intern` into separate plazas changes `StationId` and every place that switches on it - `theme.ts` `STATION_ACCENT`, `lib/i18n/strings.ts` labels, `WorldUI.tsx`'s progress ticks] → All of these are already keyed by `StationId`/`Record<StationId, …>`, so TypeScript will fail the build at every call site that isn't updated; the tasks in this change touch each one explicitly rather than relying on runtime discovery.
- [Publishing `avatarState.facing` from the controller and consuming it in `CameraRig` couples two previously separate systems a little more tightly] → Both already read/write `avatarState` every frame; adding one numeric field is consistent with how `panelHeight`, `containment`, and `station` are already shared the same way.
- [Ambient skill motes could visually clash with the "no clutter" readability goal that motivated the redesign in the first place] → Keep the mote count small (one per `skills.ts` category-worth of terms, not per individual technology) and their opacity/contrast well below panel text, so they read as atmosphere rather than competing for attention.

## Migration Plan

No data migration (this is a static content site). Deploy as a normal build: update content and world modules, run the existing dev walkthrough to confirm the trail order, panel legibility, and parkour camera by hand (no automated visual regression suite exists in this project), then ship. Rollback is a normal revert, since nothing here is stateful across a deploy.
