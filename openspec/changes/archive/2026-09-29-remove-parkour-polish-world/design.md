## Context

See proposal.md — Why for motivation. The constraints that shape the approach:

- **The physics layer is sound and stays.** `lib/world/physics.ts` (swept vertical resolution, per-axis push-out, rider carry) and `lib/world/solids.ts` (a keyed registry read every frame) already do exactly what trail obstacles need. The parkour course was their only consumer; the obstacles become the new one. Nothing in either file changes.
- **Jump geometry is fixed by existing tuning.** With `JUMP_VELOCITY 9.5` and `GRAVITY -26`: apex = 9.5² / (2 × 26) = **1.736 units**; airtime = 2 × 9.5 / 26 = **0.731 s**; horizontal reach at `MAX_SPEED 6.5` = **4.75 units**. Obstacle dimensions are derived from these numbers, not guessed.
- **The corridor is narrow.** `CORRIDOR_HALF_WIDTH` is 4.2, so 8.4 units wide between plazas, and `PHYSICS.RADIUS` is 0.38. That is the budget an obstacle must fit inside while still leaving a walkable lane.
- **The render loop must not allocate.** `projectToTrail` runs every frame and deliberately uses module-scope scratch vectors. Anything added to `useFrame` follows the same rule.
- **`avatarState` is the frame-rate-domain channel; the zustand store is the DOM-domain channel.** Values that change per frame must not cross into React state. Removing `containment` removes one such channel entirely.
- **Sequencing constraint.** `openspec/changes/redesign-world-experience/` is implemented but unarchived, and its `parkour-challenge` delta *adds* a camera requirement to the capability this change *removes*. Archiving it first is required; see Migration Plan.

## Goals / Non-Goals

**Goals:**

- Delete the two-curve containment model so the camera and control defects cannot recur, rather than patching their symptoms again.
- Give the flat corridor something to do with the jump that already exists, without ever letting an obstacle stand between a visitor and the portfolio content.
- Make the world's visual treatment position-independent — what the visitor sees at the last plaza must match what they saw at the first.
- Cut the frame cost enough that an integrated-graphics laptop gets a usable experience on first load, before any adaptive step-down fires.
- Keep every change inside the existing dawn-in-a-valley art direction.

**Non-Goals:**

- No new art direction, palette, sky model, or terrain generator. Materials and colours are tuned in place, within `PALETTE`.
- No change to career content, station layout, plaza count, or panel layout logic. This change does not touch `lib/content/**` or `lib/world/panelLayout.ts`.
- No new rendering dependency. The instancing work uses `three`'s own `InstancedMesh`, already available.
- No scoring, timing, collectibles, or completion state for the obstacles. They are scenery with collision.
- No attempt to make the world run on software rendering (`swiftshader`/`llvmpipe`); the existing `low` tier remains the floor for those.

## Decisions

### Decision 1 — Delete the detour rather than disable it

Removing the *feature* while keeping the *machinery* (a `Containment` union with one member, a `clampFor` that always takes one branch) would leave every defect's precondition in place and invite the branch back. So the deletion is total: `Containment`, `containmentFor`, `clampFor`, `projectToDetour`, `clampToDetour`, `detourHalfWidth`, `DETOUR_CURVE`, `DETOUR_LENGTH`, `DETOUR_HALF_WIDTH`, `DETOUR_ARENA_RADIUS`, `DETOUR_ENTRANCE`, `DETOUR_BRANCH_T`, `DETOUR_ENTER_T`, `DETOUR_EXIT_T`, `avatarState.containment`, the store's `containment` slice, and `DETOUR_ACCENT`.

Two consequences fall out for free and are the real prize:

- `CameraRig` loses its `if (containment === "detour")` branch. The camera's forward vector has exactly one source again — the trail tangent at a `t` that now always advances. The bug class is gone by construction, not by fix.
- `useCharacterController` sets `avatarState.t = projection.t` unconditionally, and calls `clampToTrail` directly. The per-frame `project()` scan (481 samples) runs once instead of twice.

`lib/world/ground.ts`'s region registry loses its only caller (the pit). It is deleted and `groundYAt` collapses to the `GROUND_Y` constant — the trail is flat and the obstacles are solids, not ground overrides.

**Alternative considered:** keep the detour geometry as non-interactive scenery. Rejected — it preserves the containment duality that caused the defects, which is the whole point of removing it.

### Decision 2 — Obstacles are data, placed in trail-space, validated at startup

A new `lib/world/obstacles.ts` declares obstacles in *trail* coordinates — an arc-length `t` and a signed lateral offset — rather than world XZ, so they follow the trail's curve automatically and their placement can be checked against `STATION_T` and `PLAZA_RADIUS` arithmetically instead of by eye.

```
kind:     "block" | "steps" | "beam"
t:        arc-length along TRAIL_CURVE
lateral:  signed offset from the centreline
```

World transforms and `Solid` boxes are derived once at module load from `TRAIL_CURVE.getPointAt(t)` and its tangent, exactly as `Station` and `Decor` already do.

Dimensions, from the jump numbers in Context:

| kind | top height | footprint | rationale |
|---|---|---|---|
| `block` | 0.9 | 1.8 × 1.4 | ~half the 1.736 apex — clearable without a precise press |
| `steps` | 0.55 / 1.0 | 1.2 × 1.2 each | two hops, or a walk-up; gap 1.6 ≪ the 4.75 reach |
| `beam` | 0.7 | 3.2 × 0.5 | long and low: jumped along the trail axis, walked around laterally |

**The bypass invariant is the point of the requirement and is enforced, not assumed.** With a corridor half-width of 4.2 and a max obstacle span of 3.2, placement requires `|lateral| + span/2 ≤ 4.2 − (RADIUS × 2 + 0.4)`, leaving ≥ 1.16 units of clear lane — over 1.5 avatar diameters. A development-mode assertion (in the spirit of the existing `assertContentCoverage`) checks every obstacle for that clearance, for a minimum distance of `PLAZA_RADIUS + 2` from every `STATION_T` anchor, and for non-overlap with each plaza's panel plinth and signpost radii. It throws at startup if any obstacle violates them, so a careless future edit cannot quietly wall off the portfolio.

**Alternative considered:** author obstacles in world XZ. Rejected — placement would have to be re-derived by hand if a plaza ever moves, and the clearance invariant could not be checked mechanically.

### Decision 3 — Mount windowing and instancing, as one shared mechanism

The disappearing content, the pop-in, and most of the lag share a root: how much of the world is in the scene graph at once, and how it enters. One mechanism addresses all three.

**a. Per-object Suspense.** The single `<Suspense fallback={null}>` in `World.tsx` is replaced by a boundary *inside* each `Station` (wrapping its panel and crest) and one inside `SkillMotes`. A suspending logo then blanks only its own crest. This alone satisfies the "A loading asset never removes placed content" requirement.

**b. Preload before mount.** The five plaza logos and the two fonts are preloaded (`useTexture.preload`, drei's font preload) at module scope, so in practice the boundaries in (a) rarely suspend at all. (a) is the correctness guarantee; (b) is why the visitor does not notice.

**c. Instanced decor — the largest single win.** `Decor` currently emits roughly 250 props as individual elements, and a `Tree` is three meshes, so on the order of 350–400 meshes are submitted twice per frame (shadow + colour). Grouping by primitive (trunk cylinder, large cone, small cone, rock dodecahedron, grass cone) into five `InstancedMesh` batches collapses that to **5 draw calls**, with identical geometry, identical materials, and identical output. Per-instance hue variation moves to `instanceColor`. This is a mechanical transformation of existing data with no visual change and no design risk.

**d. Distance windowing with hysteresis.** Decor and skill motes gain the same arc-length window stations use. The window is driven by `progressPercent` (integer, ~2.9 world units per percent on the ~290-unit trail) and widened with **separate enter and exit thresholds**, so an avatar hovering at a boundary cannot flicker a station on and off — the same hysteresis idea the deleted `DETOUR_ENTER_T`/`DETOUR_EXIT_T` pair used, applied where it is actually needed.

**e. Fade, don't pop.** `stationPresence(t, id)` already returns a 0..1 value and is already consumed by `StationPanel`. The mount window is widened past the point where presence reaches 0, and the station group's material opacity is driven from presence — so an object is always fully transparent before it is unmounted, and the visitor never sees a hard appearance.

**Alternative considered for (c):** thin decor further on weak tiers instead of instancing. Rejected — it trades the world's density for frame rate on exactly the machines that most need to be impressed, and instancing gives both.

### Decision 4 — Lighting follows the avatar

Two fixed-at-origin rigs are why the world degrades with distance:

- The `directionalLight`'s shadow camera is a ±70 orthographic box with its target defaulting to `(0,0,0)`, while the trail runs z ≈ +16 → −140. Past roughly z ≈ −80 — `fiap`, `certifications`, `contact` — nothing casts or receives a shadow.
- `ContactShadows` is pinned at `[0, 0.02, 0]` with `scale={9}`, so the avatar's grounding shadow exists only near the intro plaza.

Both are attached to the avatar instead. The light and its `target` are moved each frame to follow `avatarState.x/z` (snapped to a texel grid so the shadow does not shimmer while walking), and the contact shadow is moved with it.

Because the shadow camera now only ever needs to cover what is on screen, its box shrinks from ±70 to roughly ±32. At an unchanged 2048 map that is **4.8× the shadow texel density** — the shadows get sharper and cheaper at the same time, which is the rare case where the fix for a visual bug is also the fix for a performance one. `ContactShadows` also drops `frames={Infinity}`; it no longer re-renders a depth pass and blurs it on every frame.

The same distance logic applies to the camera's `far: 260` against `fogExp2` density `0.0068`. At that density the fog reaches ~99% at ≈ 675 units, so geometry between 260 and 675 units is clipped while still visible — a hard edge at the horizon. Fog density is raised so it saturates at or before the far plane. Tuning the fog (rather than pushing `far` out to 675) is chosen because it costs nothing, whereas a distant far plane reduces depth-buffer precision everywhere.

### Decision 5 — Quality tiers state a budget, and detection must earn `high`

`detectTier()` returns `high` for any viewport ≥ 1200px unless the renderer string matches a software-rasterizer pattern, so an integrated-graphics laptop at 1440p receives a 2048 shadow map, `dpr` cap 2, 300 dust motes, full decor, and 4× multisampled post-processing.

Detection is made conservative: `high` requires positive evidence from `WEBGL_debug_renderer_info` (a discrete-GPU signal), and anything unrecognised — including a blocked renderer string — lands on `medium` rather than being promoted on window width alone. `dpr` caps come down (`high` 2 → 1.75, `medium` 2 → 1.5), which is the cheapest large fragment-cost saving available and is nearly invisible at these art-style edges.

`PerformanceMonitor` keeps its step-down-only behaviour — a tier whose cost straddles the target would otherwise oscillate forever — but is tuned to react sooner, so a wrong guess is corrected within the first seconds rather than after the visitor has formed an impression.

Tier settings become an explicit per-tier budget covering the *new* knobs too (decor window radius, mote window radius, shadow box size, contact-shadow update rate), so "what does `low` actually do" is answerable from one table.

**Alternative considered:** benchmark a few frames at load and pick a tier from measured frame time. Rejected for now — it makes the first seconds of the experience a measurement rather than an arrival, and the conservative-default-plus-step-down path gets most of the benefit. Recorded under Open Questions.

### Decision 6 — Camera damping, restated in real units

`CameraRig` currently damps position with `1 - Math.pow(0.001, delta)` and the look target with `1 - Math.pow(0.0008, delta)`. At 60fps those are ≈ 0.109 and ≈ 0.113 per frame — a ~0.14 s time constant, close enough to a snap that every bump in the avatar's motion is transmitted straight to the frame.

These are restated as explicit time constants in the `1 - Math.exp(-k * delta)` form the file already uses elsewhere (`k ≈ 4` for forward, `3.5` for vertical), with position and look target given slower constants than the avatar's own motion so the camera trails it rather than tracking it rigidly. The vertical channel keeps its separate, slower damping — that is what makes a jump read as the avatar rising rather than the world dropping — and the obstacles make it matter more, since the visitor now jumps regularly on the main trail.

## Risks / Trade-offs

- **An obstacle blocks a visitor despite the invariant** (worst outcome in the change: the portfolio becomes unreachable) → The startup assertion in Decision 2 is the primary defence, checking clearance arithmetically rather than trusting placement. Backed by a manual walkthrough of the full trail with the jump control never pressed, which is a listed task and a spec scenario.
- **Instancing `Decor` changes how the world looks** → The transformation is mechanical: same geometry, same materials, same positions, with hue moved to `instanceColor`. Verified by a before/after screenshot at fixed camera positions, not by eye.
- **A following shadow camera introduces shadow swim or popping as it moves** → Snap the light's target to a shadow-map texel grid so the projection steps in whole texels rather than sliding continuously. This is the standard remedy and is why the task is written as "snapped", not merely "follows".
- **Conservative tier detection under-serves genuinely capable machines** → `PerformanceMonitor` only steps down, so a machine that lands on `medium` stays there for the visit. Accepted deliberately: on a portfolio whose visitors arrive once, a slightly plainer world that runs is worth more than a richer one that stutters. Revisit via the Open Question below if it proves too conservative.
- **Removing `parkour-challenge` loses a capability the previous change just extended** → Intentional and stated in that spec delta's Reason. The sequencing in the Migration Plan keeps the two changes from contradicting each other in the spec tree.
- **The three concerns (removal, obstacles, performance) are large enough to be separate changes** → They are deliberately kept together because they share a subject: obstacles reuse the solids registry the removal frees up, and the windowing that fixes the disappearing content is the same mechanism that fixes the lag. Splitting them would mean touching `World.tsx`'s mount structure three times. The task groups are ordered so each is independently verifiable.

## Migration Plan

1. **Archive `redesign-world-experience` first.** It is implemented but unarchived, and its `parkour-challenge` delta adds a requirement to a capability this change removes. Applying this change's deltas over an unarchived contradictory delta would leave the spec tree incoherent. Its two open tasks (4.3 and 6.4 — narrow-viewport verification, previously blocked by browser-automation tooling) are about a code path this change does not touch; they should be resolved or explicitly carried forward, not silently dropped.
2. Apply this change's task groups in order. Group 1 (removal) leaves the world shippable on its own — a trail with no obstacles is the pre-existing experience minus the detour.
3. No data migration, no persisted state, no API surface. The only persisted value is the visitor's language choice in `localStorage`, which is untouched.
4. **Rollback** is per-group `git revert`. Group 1 is the only irreversible-feeling step (deleted files), and it is a clean revert since nothing else writes to those paths.

## Open Questions

- Should tier selection eventually measure a few frames at load rather than inferring from the renderer string (Decision 5's rejected alternative)? Deferred: it changes neither the specs nor the task breakdown, and the conservative default plus step-down can be evaluated against real devices first.
- Exact obstacle count and spacing along the trail. The design fixes the *shape* of the answer (kinds, dimensions, the clearance invariant); how many read as pleasant rather than cluttered is a tuning question best settled by walking it. Starting point: one obstacle group between each adjacent pair of plazas, which given the current 8 anchors means 7 groups.
