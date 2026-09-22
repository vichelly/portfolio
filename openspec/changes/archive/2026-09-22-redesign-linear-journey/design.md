## Context

See proposal.md — Why. Constraints that shape the approach:

- Next.js 15 App Router, React 19, one client component tree under a single `<Canvas>` (`app/page.tsx` → `components/world/World.tsx`). There is no router-level navigation in the world and none is being introduced.
- The current world model is circular zones (`lib/world/layout.ts`): a point is "in" a zone when its distance to the zone center is under a radius, and the avatar is clamped inside one big `WORLD_BOUNDS_RADIUS` circle. A linear trail is a fundamentally different containment model, so this file is replaced rather than extended.
- Physics today is split in two: `Avatar.tsx` does flat XZ movement with no Y axis at all, and `parkour/ParkourZone.tsx` runs a Rapier rigid body that takes over the avatar's visible position while inside the zone. The two controllers do not share tuning, and jump exists only in one of them.
- Content lives in `lib/content/*.ts` and is projected into panels by `lib/world/panelContent.ts`. That data layer is sound and stays; only its presentation changes.
- No test framework is configured in this project. Verification is by running the app and walking the trail; acceptance criteria come from the spec scenarios.

## Goals / Non-Goals

**Goals:**

- One containment model (the trail curve) that drives movement clamping, station activation, progress, and camera framing from a single source of truth.
- One physics controller for the entire world, so the game-feel contract in `specs/avatar-control` holds identically on the trail and in the parkour course.
- A content surface that is part of the scene, with appearance and dismissal derived purely from avatar position — no imperative open/close state to get stuck.
- An avatar rig with enough joints that procedural animation reads as a person walking, jumping, and landing.

**Non-Goals:**

- No skeletal/GLTF character asset or external model pipeline. The avatar stays procedural primitives, just rigged properly — this keeps the low-poly art direction and avoids a multi-megabyte download.
- No terrain heightmap, slopes, or arbitrary collision geometry. Ground height is a small authored function; obstacles are axis-aligned boxes.
- No save/restore of trail progress across sessions.
- No new content. Every entry in `lib/content/*.ts` is carried over as written; the only change to that data's shape is that each text field holds both languages.

## Decisions

### 1. Trail as a sampled curve, not a chain of zones

`lib/world/trail.ts` replaces `lib/world/layout.ts`. It owns an ordered list of stations and a `THREE.CatmullRomCurve3` (centripetal) through their anchor points.

Everything derives from one query, `projectToTrail(x, z) → { t, lateral, tangent }`, computed by searching a precomputed sample table (~400 points) for the nearest sample, then refining locally:

- **Lateral clamp**: if `|lateral| > halfWidth(t)`, push the position back to the boundary. `halfWidth` widens at stations (a plaza) and narrows between them, which is what makes the path read as guided without invisible walls.
- **Station activation**: the active station is the one whose anchor `t` is nearest, within its activation window — a distance along the curve, not a radius, so activation cannot fire from across a bend.
- **Progress**: `t` itself, normalized 0..1.
- **Camera framing**: the curve tangent at `t` is the forward direction to look toward.

*Alternative considered*: keeping circular zones and just placing them in a line. Rejected — it still needs a separate mechanism for "which way is forward", cannot express a narrowing corridor, and leaves two sources of truth for progress.

*Alternative considered*: a spline of straight segments. Rejected — the nearest-point math is barely simpler and bends become visible corners.

### 2. The parkour detour is a second curve that takes over containment

The detour is its own short `CatmullRomCurve3` branching at a main-trail `t`. A store field records which curve currently owns lateral clamping. Crossing the branch entrance in either direction swaps the owner; the avatar's world position is never teleported, so the swap is invisible. This satisfies "course exit is always available" without an explicit exit trigger — walking back through the branch point swaps it back.

### 3. One kinematic character controller; Rapier is removed

`Avatar.tsx` becomes the sole owner of avatar transform. It integrates:

```
velocity.y += GRAVITY * dt
horizontal velocity → exponential approach to target, rate = grounded ? ACCEL : ACCEL * AIR_CONTROL
position += velocity * dt
resolve against ground height + obstacle AABBs
```

Tuning constants live in one exported object in `lib/world/physics.ts` so trail and course cannot drift apart:

| Constant | Value | Why |
| --- | --- | --- |
| `GRAVITY` | `-26 u/s²` | Snappier than real gravity; standard for platformers at this scale |
| `JUMP_VELOCITY` | `9.5 u/s` | ≈1.7u apex, just over the avatar's own height — reads as a real jump |
| `COYOTE_TIME` | `0.12 s` | Forgiveness after leaving a ledge |
| `JUMP_BUFFER` | `0.15 s` | Forgiveness before landing |
| `AIR_CONTROL` | `0.45` | Partial steering in air, per spec |
| `MAX_SPEED` | `6.5 u/s` | Slightly above current 6 |

Collision resolution is swept-axis against a list of AABBs supplied by whatever is mounted (only the parkour course supplies any): resolve Y first (sets `grounded`, zeroes `velocity.y`), then X and Z independently. Boxes only, so this is ~80 lines and fully deterministic.

*Alternative considered*: keep Rapier and extend it to the whole world. Rejected — it puts a WASM physics engine in the initial bundle for a world whose only collision geometry is a flat path, and matching "feel" between a rigid body and authored movement is exactly the tuning drift the spec forbids.

*Alternative considered*: keep Rapier only in the course and mirror the constants. Rejected — mirroring is a promise that decays; a rigid body's contact response and a kinematic controller's never feel identical under the same numbers.

**Moving platform**: the mover's per-frame delta is applied to the avatar's position when the avatar is grounded on it (carry), which the AABB pass detects by recording the surface it landed on.

### 4. Jump input is an event, not a level

`useMovementInput` currently exposes `jump: boolean`, which cannot express buffering. It gains `jumpQueuedAt: number | null` set on keydown/touchstart and a `consumeJump()` the controller calls when it actually jumps. This makes both "pressed too early" and "held continuously" fall out of the same mechanism: holding sets the timestamp once, and a consumed jump clears it.

### 5. Diegetic content via drei `<Text>`, not `<Html>`

Station content renders as `@react-three/drei` `<Text>` (troika SDF text) on a 3D backing panel, billboarded to face the camera.

- SDF text stays crisp at any camera distance and is genuinely in the scene — it sorts, lights, and occludes with the world, which `<Html>` does not.
- Appearance is a pure function of avatar position: opacity is driven per-frame from distance along the curve to the station anchor. There is no open/close state to leave stuck, which is what makes "no close button" structurally true rather than a behavior we remember to implement.
- Long bodies (the Itaú entry runs several paragraphs) use `maxWidth` wrapping plus a per-station scale so the panel fits the vertical frame; on narrow viewports the panel scale and camera distance both adjust from `viewport.aspect`.

Trade-off: troika needs a font file. A single `.woff` is committed under `public/fonts/` and passed to every `<Text>` explicitly — no CDN fetch, no FOUT mid-walk.

**`<Text>` suspends, and that is load-bearing.** drei's `Text` suspends through `suspend-react` while its font loads. With no `<Suspense>` boundary *inside* the `<Canvas>`, the suspension reaches the R3F root, which then never mounts: the canvas stays at its default 300x150, nothing renders, and no error is thrown anywhere. Every text-bearing part of the scene therefore sits behind its own boundary, so the trail and the avatar appear immediately and the type arrives a moment later.

*Alternative considered*: `<Html>` with `transform` and `occlude`. Rejected — it is the same DOM surface being retired, it does not depth-sort correctly against station geometry, and it reintroduces pointer-event capture over the canvas.

### 6. Links are scene objects, activation is `window.open`

Each link becomes a signpost mesh with a `<Text>` label and an `onClick` that calls `window.open(href, "_blank", "noopener,noreferrer")`. Hover/proximity raises its emissive intensity and shows the destination. Keyboard users reach links through the fallback view, which remains the accessible path — the spec puts that obligation there, not on the canvas.

### 7. State splits by who reads it

`activeRoom` and `openPanelId` are gone. What remains splits in two by who reads it.

Anything consumed inside the render loop lives in `lib/world/avatarState.ts`, a plain object the controller mutates in place each frame — position, `t`, speed, grounded, containment, active station. Station panels, the camera and the trail all read it from their own `useFrame`, so none of it can cause a React render.

The store keeps what the DOM needs: `inputMode`, `fallbackOpen`, `containment`, `locale`, plus `activeStationId` and `progressPercent` republished from the loop *only when they change*. Progress is a whole percent, so a full traversal re-renders the HUD about a hundred times rather than sixty times a second. That same percent drives which stations are mounted, which is why the scene graph changes on the order of a hundred times per walk instead of per frame.

In development both `avatarState` and the camera are also exposed on `window` (`__avatarState`, `__camera`). A world whose truth lives in a render loop cannot be inspected through the DOM, and an automated walkthrough needs somewhere to read position from and somewhere to project a click through.

### 8. Avatar rig and animation

Nested groups, each a real pivot: `root → hips → spine → chest → neck → head`, `chest → shoulder.L/R → upperArm → forearm → hand`, `hips → thigh.L/R → shin → foot`. Tapered capsules and boxes; Ultraman identity via silver/red panel split, chest color timer (an emissive disc), head crest, and slanted emissive eyes. Hands and feet are separate small meshes — those two details do most of the work in making a silhouette read as human rather than as sticks.

Animation is a small weighted state machine (`idle`, `walk`, `jump`, `fall`, `land`) rather than blended clips: each state writes target rotations per joint, and the controller lerps toward the active state's targets with a per-state blend rate. States are selected from physics state (`grounded`, `velocity.y`, horizontal speed), so animation can never disagree with what the body is doing.

### 9. Ground height is a registry, not a constant

The trail is flat, but the parkour course needs a hole under it or a missed jump is just a step onto the lawn. `lib/world/ground.ts` holds a small registry of ground-height regions that mounted content contributes to; the controller asks it for the height under the body each step. The course registers a circular pit at `y = -9`, positioned to open *past* the start pad so walking in from the trail is safe and only stepping off the course drops you.

The same registry pattern gives the course its solids: an entrance arch with 2.2 units of clearance, which a walking avatar passes under and a jumping one hits — the one place in the world where the collision resolver's upward pass is reachable by a visitor.

### 10. Deletions

`Hub.tsx`, `rooms/*.tsx`, `ZoneFloor.tsx`, `RoomSign.tsx`, `PointOfInterest.tsx`, `AnimatedPanel.tsx`, `lib/world/layout.ts`, and `lib/input/useJourneyProgress.ts` are removed. `InfoPanel.tsx` survives only as the fallback view's detail renderer, no longer reachable from the world.

## Risks / Trade-offs

- **Nearest-point-on-curve jitter near the branch point, where two curves are close** → the containment owner only swaps inside an explicit entrance band and has hysteresis (the band to leave is wider than the band to enter), so it cannot oscillate frame to frame.
- **Per-frame `<Text>` opacity updates on many stations cost draw calls and material updates** → only stations within a mount window around the current `t` are mounted at all; the rest are not in the scene graph.
- **Hand-rolled AABB collision can tunnel at high speed** → velocity is capped and the Y axis is resolved with a swept test against the previous position, which covers the only fast axis (falling).
- **Losing Rapier means losing any future non-box collision for free** → accepted; the Non-Goals rule out terrain and arbitrary geometry, and the controller is small enough to extend if that changes.
- **Troika font file adds ~40–80KB** → one weight only, self-hosted, loaded with the canvas rather than blocking first paint.
- **A long linear trail can feel slow to traverse compared to a hub** → station spacing is tuned so the next station's silhouette is visible from the previous one, and the progress indicator tells the visitor how much remains; the fallback view remains the shortcut for anyone who does not want to walk.
- **Replacing the world model and the physics model in one change is a wide blast radius** → the task order below lands the trail model first and keeps the world runnable at each step, so a regression is attributable to one step rather than to the whole rewrite.

## Migration Plan

This is a single client-rendered page with no persisted state or API surface, so there is no data migration and no staged rollout. Sequence and rollback:

1. Land `lib/world/trail.ts` + `lib/world/physics.ts` alongside the existing code (nothing imports them yet).
2. Switch `Avatar.tsx` to the new controller and trail containment; the old zones still render but are no longer authoritative.
3. Replace the scene contents (stations in, hub/rooms out).
4. Replace the content surface (3D panels in, `AnimatedPanel` out).
5. Rebuild the parkour course on the shared controller; remove `@react-three/rapier`.
6. Rebuild the avatar rig and animation.
7. Restyle HUD and fallback view; delete dead files.

Rollback at any step is `git revert` of that step's commit — steps 1–2 and 3–4 are each independently revertible because the trail model is additive until step 2 and the scene swap is confined to `World.tsx`.

## Open Questions

Both settled by walking the built world:

- The trail is ~165 units long, with station anchors about 18-20 units apart and a 9-unit plaza radius at each. That spacing keeps the next station's pylons visible from the last one.
- FEI has its own station. The pacing carried it, and giving education its own stop keeps the narrative order literal rather than folding it into an adjacent job.
