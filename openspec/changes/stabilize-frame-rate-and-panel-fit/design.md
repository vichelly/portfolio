## Context

See proposal.md — Why for the measured causes. What matters for the approach is the shape of the current system:

- `useCharacterController` mutates `avatarState` every frame and publishes only *changes* to the zustand store: the active station id, and `progressPercent` rounded to whole percent.
- `World.tsx` subscribes to `progressPercent` and derives `t = progressPercent / 100`, which is the input to `useMountWindow` (stations, obstacles), to `Decor`, and to `SkillMotes`. So a value published for the HUD rail is what drives the 3D scene graph.
- Each mounted `Station` renders its own `pointLight` with `distance={14}`. Plazas are ~19.5 arc-length units apart along a 172.8-unit trail; the mount window is 26 units in / 32 units out. So at most three stations, and therefore at most three point lights, are in the scene at once, and the count changes 15 times on a single walk (measured — see tasks.md 0.3).
- `avatarState` already exists as the per-frame channel that deliberately causes no re-renders. Everything below leans on it rather than adding a new one.

Two constraints shape every decision here. The world must look the same when this is done — this is a cost and framing change, not an art change. And nothing may move content out of reach: the `A loading asset never removes placed content` and `Content appears and disappears by fading` requirements were hard-won in the previous change and must survive intact.

## Goals / Non-Goals

**Goals:**

- Frame timing continuous for the whole walk, with no freeze attributable to content entering or leaving the scene.
- The scene's *light configuration* constant for the session, so no material ever recompiles after load.
- React re-renders of the 3D tree proportional to real scene-graph changes (a handful per trail), not to progress (about a hundred per trail).
- A panel framed so it fits the viewport in both dimensions, at every supported size and aspect.

**Non-Goals:**

- No change to the station order, the content, the palette, or the art direction. (The trail's *layout* was also a non-goal, and stopped being one during apply — see Decision 9. The order and the content are unchanged; three zones are simply walked as two plazas each.)
- No new mechanic and no new navigation affordance.
- Not chasing a numeric FPS target on a named device. The requirement is *continuity* — no frame more than 4× the session's typical frame time — because a steady 40fps reads better than a 60fps walk punctuated by 300ms freezes, and the freezes are what the visitor actually notices.
- Not rewriting `Decor`'s instancing, `SunRig`'s shadow following, or the fade/mount threshold relationship. Those work; this change only changes *when* they are recomputed.

## Decisions

### Decision 1 — A fixed light rig replaces per-station point lights

Three.js caches a compiled program per material keyed on the scene's light configuration. Adding or removing a `pointLight` changes that key for **every** material in the world, so all of them recompile on that frame.

Measured, not inferred (tasks.md 0.3): adding one point light to the live scene compiled **10 new shader programs** and made that single render take **281.9 ms**; the render that removed it cost 25.1 ms. It fires **15 times** on one walk. This is the largest single freeze in the build.

**Chosen:** a `StationLights` component mounted once for the session, rendering a fixed **two** `pointLight`s. Each frame it finds the two nearest station anchors to the avatar and drives each light's position, colour (the station accent) and intensity toward them, fading intensity to zero with distance so a light that has nothing to illuminate simply goes dark rather than unmounting.

Two is sufficient, and now proven rather than assumed: sweeping 400 points along the real trail, the maximum number of station anchors within the point light's 14-unit reach of any single point is **2** (worst case at t=0.105). Task 1.2 makes that check permanent so a future anchor change cannot silently outgrow the rig.

**Alternatives considered:**

- *Remove the accent point lights entirely, lean on emissive materials.* Cheapest, and the crystals are already emissive — but the plinth and the panel's surroundings lose their accent wash, which is a visible art change. Rejected on the "looks the same" constraint.
- *Keep per-station lights but cap the mounted count.* Does not help: the count still changes, and changing it is the whole problem.

### Decision 2 — Mounting is decided in the frame loop, and only publishes real changes

`World` stops subscribing to `progressPercent`. A hook reads `avatarState.t` in `useFrame`, runs the existing pure `nextMounted` against it, compares the resulting id set to the previous one, and calls `setState` **only when the set differs**. The hysteresis already in `nextMounted` means a set change is a genuine crossing, so this fires roughly as many times per trail as there are stations and obstacles — not a hundred times.

`progressPercent` stays in the store exactly as it is: the HUD rail is a DOM consumer and a handful of small DOM updates per second is not the problem. The problem is that the 3D tree was subscribed to it.

**Alternative considered:** keep the percent-driven render and memoize harder. Rejected — memoizing the output does not prevent React from re-rendering and reconciling the subtree, nor from re-running every `useMemo` whose dependency list contains `t`. The re-render itself is the cost.

### Decision 3 — Decor recomputes on membership change, not on progress

`Decor` currently re-filters the whole prop table and produces five new arrays per progress tick; each new array identity re-runs the layout effect that writes every instance matrix and calls `computeBoundingSphere()` on five instanced meshes.

The prop table is generated in trail order, so the visible set is a **contiguous slice** by `t`. Replace the per-tick filter with a slice whose start and end indices are found from the avatar's `t` and the tier's radius, and published through the same change-detecting mechanism as Decision 2. The matrices are then rewritten only when the slice actually moves.

**The quantization has to be applied to where each edge sits, not to how wide the window is.** This was got wrong first and the measurement caught it: rounding the *width* to a coarse step and then centring it on a continuously moving avatar leaves both edges moving continuously, which is the thing the quantization exists to stop — that version produced 171 rewrites per walk at the `high` radius, *worse* than the 100 it replaced. Rounding each edge outward onto a fixed grid along the trail gives 8 (`high`), 12 (`medium`) and 15 (`low`), and the window still never covers less than the radius asked for.

`SkillMotes` gets the same treatment through the shared mount-window hook.

### Decision 4 — Compile before display

With Decision 1 removing the recompile-everything hazard, what remains is the *first* compile of a material and the build of a text geometry. Station materials are structurally identical across plazas — same geometries, same shader features, differing only in colour uniforms — so the program cache is warmed by the first station that renders, and every later plaza reuses it.

**Chosen:** drei's `<Preload all />` inside the Canvas, alongside the existing `preloadWorldAssets()` font and texture preloading, so the programs for everything present at load are compiled before the first frame is shown rather than on the frame the visitor walks into them.

Troika builds each `Text`'s geometry off the main thread on a worker, so new strings at a new plaza are not a main-thread stall; they are the reason a panel can appear a frame or two after its plaza, which the existing presence fade already covers.

**Alternative considered:** mount all eight stations off-screen at load to force every program. Rejected — it pays the full cost of the whole trail at load, which trades a mid-walk stutter for a slow start, and the shared-program argument makes it unnecessary.

### Decision 5 — Trail projection searches locally

`project()` scans all 481 samples every frame and allocates a `THREE.Vector3` for `closest`, contradicting the comment directly above it that says projection must not allocate.

**Chosen:** keep the previous frame's best index in module scope and search a window around it wide enough to cover far more than one frame of travel at `MAX_SPEED`. If the best sample lands on the window's edge — a teleport, a resume from a backgrounded tab, or a first call — fall back to the full scan and re-seed. Reuse a module-scratch vector for `closest`.

This is a small win next to Decisions 1 and 2, but it is per-frame and it removes a steady allocation, which is exactly the kind of thing that turns into a GC pause.

Measured: **1.8x** (0.80 µs → 0.45 µs per projection over 20,000 calls). Deliberately recorded rather than rounded up — the sample scan turns out not to be the dominant term, because `curve.getTangentAt` evaluates the Catmull-Rom curve and costs more than the scan it was sharing a function with. Caching the tangent off the sample table would go further but would make the result an approximation, and the exactness proved in task 4.2 is worth more than the microseconds.

### Decision 6 — Tier knobs are split by what they cost to change

A step-down currently changes `dpr`, `shadowMapSize` and `terrainSegments` together. All three force a reallocation or a rebuild: the drawing buffer and every post-processing target, the shadow render target, and up to ~29k terrain segments regenerated on the main thread. The world stalls hardest at the exact moment it steps down because the frame rate was already failing.

**Chosen:** `terrainSegments` and `shadowMapSize` are **chosen once at load and never changed by a step-down**. A step-down moves only `dpr` and the per-frame-cheap knobs (decor density and radius, dust count, contact shadow, effects mode).

Terrain tessellation is one geometry and one draw call whatever its segment count; its cost is a load-time build and some vertex work in the shadow pass, not a per-frame main-thread cost. Fixing it across tiers is close to free and removes the worst rebuild. `dpr` stays adjustable because it is the single biggest lever — it squares — and lowering it is a target resize, not a geometry rebuild.

### Decision 7 — Station framing is derived from both panel dimensions and the viewport aspect

`CameraRig` computes `stationBehind = max(MIN_STATION_BEHIND, panelHeight * FRAME_MARGIN)`. The `1.35` is a tuned approximation of the exact vertical fit — at fov 55 the exact distance is `(H/2) / tan(fov/2) ≈ 0.96·H` — with headroom folded in. It has no horizontal term at all, which is why a two-column panel overflows a tall narrow frame.

**Chosen:** compute both distances exactly and take the larger.

```
d_vertical   = (panelHeight / 2) / tan(fov / 2)
d_horizontal = (panelWidth  / 2) / (tan(fov / 2) * aspect)
behind       = max(MIN_STATION_BEHIND, FRAME_MARGIN * max(d_vertical, d_horizontal))
```

`aspect` is the camera's, read live so a resize or an orientation change re-frames. `avatarState` gains a `panelWidth` alongside the existing `panelHeight`, written by `StationPanel` at the same moment and by the same rule.

`FRAME_MARGIN` is retuned so desktop framing lands where it does today — the exact vertical term is `0.96·H` against the current `1.35·H`, so the margin absorbs the difference and the desktop walk is unchanged. That equivalence must be checked by screenshot, not assumed.

The consequence to watch: on a narrow viewport the camera now pulls further back, which shrinks on-screen type. The 16px body-text floor is a hard requirement and Decision 8 exists to keep it.

### Decision 8 — Narrow viewports get one column

`NARROW_SHAPES` offers `{width: 7.5, columns: 2}`. Under Decision 7 that shape forces the camera far enough back on a 0.5-aspect viewport that body text drops under the 16px floor — so the shape is unusable rather than merely tight, and it is the shape that produced the clipped Itaú columns.

**Chosen:** narrow viewports get a single-column table only. A station whose content then runs tall is handled by the mechanisms that already exist — the fit-scale, and, if that breaches the 16px floor, `career-content-discovery`'s existing rule that a zone too large for one panel is split across sequential plazas. Widening the panel is explicitly not the escape hatch on a narrow screen.

If a station is found at apply time to need that split, it is surfaced rather than absorbed: splitting a zone into more plazas changes the trail and belongs in its own change.

### Decision 9 — Three zones are walked as two plazas each

With Decision 8's revised cap, three zones are still scaled down at the narrow width and still miss the floor: `itau-rpa`, `agile-inc` and `certifications`. For those, the only remaining lever is less content per panel — which is exactly the remedy `career-content-discovery` already names ("the zone SHALL present its entries as sequential plazas").

**Chosen:** each of the three continues onto a second plaza. **11 plazas, not 8.** The continuation repeats the zone's header — period, title, company — under its own `-cont` id, so a visitor arriving at the second plaza knows whose job they are reading about and content coverage still counts each real entry exactly once; it carries no links, so no signpost stands twice for the same destination. A continuation keeps its zone's accent, so the pair reads as one stop carried over rather than two unrelated ones.

**Alternative considered:** one entry per panel throughout, the literal reading of the spec's remedy. Rejected on measurement — it needs 20 plazas *and still fails*, because `intro` and `fiap` are single entries already taller than the old cap, so no split can help them. It is the cap fix that rescues those two, and the split is only needed where the cap fix is not enough.

The trail keeps its 18-unit spacing and alternating lateral offset and simply gets longer: 172.8 → 235.2 units, with the obstacle groups rebalanced from 7 to 10.

## Risks / Trade-offs

- **The two-light rig looks different from four per-station lights.** → The lights are driven toward the same anchors with the same accents and the same reach, so the wash at a plaza should be indistinguishable. Verified by before/after screenshots at two plazas, not by argument. If a third light proves necessary, three fixed lights is still a constant configuration and still satisfies the requirement.
- **Two is asserted, not proven, as the maximum number of plazas within light reach.** → Assert it against the real anchor table at apply time, the way `assertObstaclePlacement` already guards obstacle spacing, so a future anchor change cannot silently break it.
- **Calling `setState` from `useFrame` renders outside the frame budget.** → It fires only on a genuine mount-set change (a handful per trail) and React batches it to the next tick. The pathological case is a set that changes every frame, which the existing 26/32 hysteresis makes impossible.
- **The local projection search can find the wrong local minimum on a tight bend, or after a teleport.** → Edge-of-window detection falls back to the full scan and re-seeds, so a wrong answer costs one full scan rather than persisting.
- **Fixing `terrainSegments` across tiers gives low-tier devices more vertices than before.** → The terrain is one geometry and one draw call; the cost is in the shadow pass, which `shadowExtent` already bounds. If a low-tier walkthrough shows it matters, the fix is to lower the fixed value for everyone rather than to reintroduce a mid-session rebuild.
- **Pulling the camera back on narrow viewports shrinks type toward the 16px floor.** → This risk materialised in full: the first version of the framing fix cleared the clipping and put all eight stations *under* the floor. Decisions 8 and 9 are the response. Measured after: 16.0px at 360x780, with nothing clipped, at every plaza in both languages.
- **The browser could not be used at all** — the window reports `visibilityState: "hidden"`, so no frame is ever drawn. → The panel-fit rule turned out not to need one: the layout, the fit-scale and the framing distance are pure functions of the content and the viewport aspect, so they were computed directly against the real content at six viewport sizes. The properties that genuinely need a running frame loop — frame timing, pop-in, the walkthrough — remain unverified and are marked as such in tasks.md rather than claimed.
- **A taller narrow panel is a 10.5-unit board standing on the trail.** → It is sized to the frame it is read from, so on a phone it fills the screen rather than towering over it; on a wide viewport the cap is unchanged at 5.8. Worth a look when a visible browser is available.
- **11 plazas is a longer walk.** → The spacing, the framing and the obstacle rhythm are unchanged; there is simply more trail. The progress rail derives its ticks from `STATION_T`, so it re-scales on its own.

## Migration Plan

No data, no API, no stored state. Everything here is client rendering. Deployment is the ordinary build; rollback is reverting the commit.

One ordering constraint: `remove-parkour-polish-world` is implemented but unarchived, so `openspec/specs/` does not yet contain the requirement text this change's deltas modify. It must be archived before these deltas are valid.
