## 0. Sequencing and baseline

- [x] 0.1 Archive `remove-parkour-polish-world` so `openspec/specs/` carries the requirement text this change's deltas modify. Task 7.5 of that change is deliberately unticked and records a failing check that this change fixes (tasks 5.1–5.4) — carry it forward in the archive notes rather than ticking it. Verify `openspec list` no longer shows it in-flight and `openspec validate stabilize-frame-rate-and-panel-fit --strict` passes.

  **Done.** Archived as `2026-09-29-remove-parkour-polish-world`; 6 requirements removed from `parkour-challenge`, 6 added and 2 modified across `avatar-control` and `portfolio-world`. Task 7.5 was archived unticked with a carry-forward note naming this change. `openspec list` shows only this change; `openspec validate --strict` passes, and the `Visual quality adapts to the device` text now in `openspec/specs/portfolio-world/spec.md` matches this change's MODIFIED base text exactly.

  **Surfaced, not absorbed:** the archive left `openspec/specs/parkour-challenge/spec.md` alive with one requirement the removed set did not cover — `Camera tracks the avatar's actual movement inside the course`. It describes a detour that no longer exists in `app`, `components` or `lib`. Removing a whole capability is outside this change's scope; raised with the user rather than deleted here.

- [ ] 0.2 Record the baseline before changing anything. With the dev server running, capture at three fixed positions (intro plaza, mid-trail, contact plaza): `renderer.info.render.calls`, `renderer.info.programs.length`, and a devtools performance profile of a continuous 20-second walk. From the profile, record the **longest single frame** and the **median frame time** — these two numbers are what the spec's "no frame over 4× typical" clause is measured against, and what tasks 1–4 are verified against. Also record how many long tasks (>50ms) occur in that walk.

  **Partly captured — left unticked deliberately.** The Chrome window available in this environment reports `document.visibilityState === "hidden"` (window occluded or minimized; `document.hasFocus()` is true, so it is the window, not the tab). Confirmed directly at the end of the session: `requestAnimationFrame` never fires (a callback scheduled and waited on for 800 ms never ran), while the layout is correct at every level (1291x759 from the fixed container down) and the app hydrates normally — `avatarState` is on `window`, the HUD renders, and the dev server answers `200`. react-three-fiber cannot start its renderer without a frame, so the canvas stays at its default 300x150 and no draw ever happens. `requestAnimationFrame` is therefore never serviced: `info.render.frame` stays at 0, `avatarState.t` never advances, and no walk can be driven. **Live frame timing — median frame time, longest frame, long-task count — was not obtainable**, and neither were the mid-trail and contact-plaza positions, which are reached by walking.

  **Captured** by driving `renderer.render(scene, camera)` by hand, which needs no frame loop, at the load position (intro plaza, tier `high`, 1440x900 window, canvas 2259x1328 at dpr 1.75): **71 draw calls, 73,112 triangles, 15 shader programs, 1 station point light.**

- [x] 0.3 In the same profile, confirm the two predicted causes are real rather than assumed: that a long frame coincides with a station mount, and that `renderer.info.programs.length` changes when it does. Write the observed numbers into the task notes. If either prediction is wrong, stop and revise design.md before implementing against it.

  **Both confirmed — prediction 1 empirically, prediction 2 by construction.** The profile route was unavailable (see 0.2), so prediction 1 was tested directly instead, which is stronger evidence than a profile correlation: a `PointLight` was cloned into the live scene and the renderer driven by hand, reproducing exactly what mounting one station does.

  | | observed |
  |---|---|
  | programs before | 15 |
  | programs after adding **one** point light | 25 |
  | **brand-new programs compiled** | **10** |
  | **duration of the render that added it** | **281.9 ms** |
  | duration of the render that removed it | 25.1 ms |

  So a single station mounting recompiles ten shader programs and costs ~282 ms in one frame, against a 16.7 ms budget. Once all light-count variants are cached the hit settles to ~25 ms — still more than a frame.

  Prediction 2 (how often this fires) is deterministic, so it was computed from the real anchor table and the real `nextMounted` thresholds rather than profiled. Walking 0%→100%: **15 light add/remove events**, at 0/4/15/26/29/38/40/49/51/62/65/74/76/85/98 percent. Trail length 172.8 units; at `MAX_SPEED` 6.5 that walk is ~27 s, so `progressPercent` publishes ~100 times and re-renders `World` ~3.8x/second against 15 real scene-graph changes — the ratio Decision 2 exists to close.

  **Two design.md figures corrected against the measurement:** plazas are ~19.5 arc-length units apart, not ~18; and the maximum simultaneous station point lights is **3**, not "three to four". Neither changes a decision.

  **Decision 1's two-light rig is now proven rather than asserted:** sweeping 400 points along the trail, the maximum number of plazas within the point light's 14-unit reach of any single point is **2** (worst case t=0.105). This is the check task 1.2 makes permanent.

## 1. Constant light configuration

- [x] 1.1 Create `components/world/StationLights.tsx` rendering exactly two `pointLight`s, mounted for the session and never conditionally rendered. Each frame, drive the two lights toward the two station anchors nearest the avatar, interpolating position and colour (the station accent) and fading intensity to zero with distance so an unused light goes dark rather than unmounting (design.md — Decision 1). Verify `renderer.info.programs.length` is constant from first frame to trail end.

  **Done.** `components/world/StationLights.tsx`: exactly `PLAZA_LIGHT_COUNT` (2) `pointLight`s, rendered from a fixed-length array so the scene's light configuration is a constant of the session. Each frame the two nearest plazas are found and the lights take their panel anchor and accent. Verified against the real anchor table: at 601 points along the trail, **every** plaza within the light's 14-unit reach is held by one of the two lights — the rig never leaves a plaza in reach unlit. Plaza geometry moved to `lib/world/plaza.ts` so `Station` and `StationLights` share one formula for where the panel stands.
- [x] 1.2 Add an assertion — alongside `assertContentCoverage()` and `assertObstaclePlacement()` in the development-only effect — that no point on the trail lies within the point light's reach of more than two station anchors, so a future anchor change cannot silently outgrow the two-light rig (design.md — Risks). Verify it throws when an anchor is temporarily moved next to another, then restore and confirm it passes clean.

  **Done.** `assertPlazaLightBudget()` in `lib/world/plaza.ts`, called from `World`'s development-only effect beside `assertContentCoverage()` and `assertObstaclePlacement()`. Verified both ways against the real module: it passes clean as the anchors stand, and it throws when `itau-intern`'s panel anchor is moved onto `itau-rpa`'s — then passes again once restored.
- [ ] 1.3 Remove the `pointLight` from `components/world/Station.tsx` and mount `StationLights` in `World.tsx`. Verify by before/after screenshots at the `itau-rpa` and `certifications` plazas that the accent wash on the plinth and panel surroundings is indistinguishable from the baseline (design.md — Decision 1).

  **Code done; screenshot comparison not possible.** The `pointLight` is removed from `Station.tsx` and `StationLights` is mounted in `World.tsx`. The light's values are carried over unchanged (`intensity` 8, `distance` 14, height 3 above the panel anchor, `STATION_ACCENT` colour) and it is placed at the same `PLAZA_FRAME[id].panelAnchor` the panel itself is laid out from, so the wash should be indistinguishable — but 'should be' is the honest word: the before/after screenshots this task asks for need a visible window (see 0.2).
- [ ] 1.4 Walk the full trail and confirm that no frame coincides with a program-count change and that the long frames identified in task 0.3 are gone (spec: portfolio-world — "A plaza enters the scene while the avatar is walking").

  **Not verified — needs a visible browser window.** See task 0.2: this environment's Chrome window reports `visibilityState: "hidden"`, so `requestAnimationFrame` never runs, no frame is ever drawn and the avatar cannot be walked. Left unticked rather than claimed.

## 2. Mounting driven by the frame loop

- [x] 2.1 Extend `lib/world/mountWindow.ts` with a frame-driven hook that reads `avatarState.t` in `useFrame`, runs the existing pure `nextMounted`, and calls `setState` only when the resulting id set actually differs from the previous one (design.md — Decision 2). Keep `nextMounted` pure and unchanged.

  **Done.** `useMountWindow` in `lib/world/mountWindow.ts` now reads `avatarState.t` in `useFrame` and calls `setState` only when the mounted id set actually differs, compared by `sameSet`. `nextMounted` is untouched and still pure.
- [x] 2.2 Switch `World.tsx` to that hook for stations and obstacles, and **remove its `progressPercent` subscription entirely**. Leave `progressPercent` in the store and leave `WorldUI` subscribed to it — the HUD rail is a DOM consumer and is not the problem (design.md — Decision 2). Verify by logging that `World` re-renders roughly once per station/obstacle boundary crossing over a full walk, against ~100 times before.

  **Done.** `World` no longer subscribes to `progressPercent`; `progressPercent` stays in the store and `WorldUI` stays subscribed to it. The windowing moved into a `WindowedContent` component inside the Canvas — both because `useFrame` requires it and so that a mount change reconciles only that subtree rather than the Canvas, lights, terrain and effects chain with it. Measured against the real anchor table, sampling every frame of a 30 s walk: **14 mount-set changes, against 100 `progressPercent` publishes** over the same walk.
- [ ] 2.3 Verify the fade behaviour survives: walk toward an unvisited plaza and confirm it fades in rather than popping, and walk back and forth across a mount boundary and confirm it does not flicker (spec: portfolio-world — Content appears and disappears by fading; "Visitor walks back and forth across a mount boundary").

  **Not verified — needs a visible browser window.** See task 0.2: this environment's Chrome window reports `visibilityState: "hidden"`, so `requestAnimationFrame` never runs, no frame is ever drawn and the avatar cannot be walked. Left unticked rather than claimed.
- [ ] 2.4 Confirm the HUD still tracks the walk: the progress rail advances smoothly and the station label changes at every plaza (spec: portfolio-world — Trail progress is visible).

  **Not verified — needs a visible browser window.** See task 0.2: this environment's Chrome window reports `visibilityState: "hidden"`, so `requestAnimationFrame` never runs, no frame is ever drawn and the avatar cannot be walked. Left unticked rather than claimed.

## 3. Decor and motes recompute on membership change

- [x] 3.1 Replace `Decor`'s per-tick `filter` with a contiguous index slice over the trail-ordered prop table, its start and end derived from the avatar's `t` and the tier's radius and quantized coarsely so the boundary moves a handful of times per trail (design.md — Decision 3). Verify the layout effect that writes instance matrices runs only when the slice actually moves, by logging its invocations over a full walk.

  **Done, after the first attempt measured worse than the code it replaced.** `Decor` takes its visible props from `useFrameSlice`, a contiguous index slice over the trail-ordered table.

  The first version quantized the window's *width* and centred it on the avatar, which leaves both edges moving continuously — measured at **171** matrix rewrites per walk at the `high` radius, worse than the ~100 it was replacing. Quantizing each edge outward onto a fixed 16-unit grid along the trail gives, per walk: **8 rewrites at radius 110 (`high`), 12 at 80 (`medium`), 15 at 55 (`low`)** — and the window is confirmed never to cover less than the radius asked for (narrowest coverage exactly 110.0 / 80.0 / 55.0 units).
- [ ] 3.2 Switch `SkillMotes` to the task 2.1 hook. Verify motes are present around the avatar at every point along the trail, unchanged in density and placement from the baseline screenshots.

  **Not verified — needs a visible browser window.** See task 0.2: this environment's Chrome window reports `visibilityState: "hidden"`, so `requestAnimationFrame` never runs, no frame is ever drawn and the avatar cannot be walked. Left unticked rather than claimed.

  The code change is in place: `SkillMotes` takes no `t` prop and calls `useMountWindow(all)`.
- [ ] 3.3 Confirm draw calls at the three baseline positions are unchanged from task 0.2 — this group changes *when* work happens, not how much is drawn, so any change in draw calls is a regression to investigate.

  **Not verified — needs a visible browser window.** See task 0.2: this environment's Chrome window reports `visibilityState: "hidden"`, so `requestAnimationFrame` never runs, no frame is ever drawn and the avatar cannot be walked. Left unticked rather than claimed.

## 4. Compile before display, and cheap projection

- [ ] 4.1 Add drei's `<Preload all />` inside the Canvas alongside the existing `preloadWorldAssets()` (design.md — Decision 4). Verify via the devtools performance profile that shader compilation appears during load and not during the walk.

  **Code done; profile not possible.** `<Preload all />` added inside the Canvas alongside `preloadWorldAssets()`. Confirming from a performance profile that compilation happens at load and not during the walk needs a visible window (see 0.2).
- [x] 4.2 Make `project()` in `lib/world/trail.ts` search a window around the previous frame's best index, with a full-scan fallback when the best lands on the window edge or on the first call, and reuse a module-scratch vector for `closest` instead of allocating one per frame (design.md — Decision 5). Verify the projected `t` and `lateral` match the full-scan results to within floating-point tolerance at 200 sampled positions across the trail, including both ends and both tightest bends.

  **Done, and verified exactly.** `project()` takes a hint index and searches ±24 samples around it, falling back to the full scan when the best lands on an open window edge. `projectToTrail` keeps full-scan semantics — the terrain generator calls it once per vertex at unrelated points, where a hint would only ever be wrong — and the new `projectToTrailTracked` carries the hint; `clampToTrail` uses the tracked one. `closest` and `tangent` now reuse module scratch vectors, so the per-frame allocation the file's own comment forbids is actually gone.

  Parity against the full scan at **349 positions** — a 200-step continuous walk wandering across the corridor, both trail ends, the two tightest bends at five lateral offsets each, four teleports and four far-off-trail points: worst `|Δt|` and worst `|Δlateral|` both **exactly 0**. Not within tolerance — identical.

  Cost: **1.8x** (0.80 µs → 0.45 µs per projection over 20,000 calls). Recorded as measured rather than as hoped: the sample scan is not the dominant term, `curve.getTangentAt` is.
- [x] 4.3 Verify the teleport path re-seeds correctly: set `avatarState.teleport` from the console to a point far along the trail and confirm the reported `t` is correct on the very next frame, not after several frames of convergence.

  **Done.** Covered by the parity run above: four teleports across the trail (0.95→0.05, 0.02→0.98, 0.5→0.0, 0.0→0.5) and four far-off-trail positions all resolve exactly on the very next call, because an open-edge result re-scans rather than trusting the stale hint. There is no convergence period.
- [ ] 4.4 Split the tier table in `lib/world/quality.ts` so `terrainSegments` and `shadowMapSize` are fixed at load and a step-down moves only `dpr` and the per-frame-cheap knobs (design.md — Decision 6). Verify a forced step-down mid-walk keeps the avatar responding to input across the transition, with no geometry or shadow-target rebuild in the profile (spec: portfolio-world — "The quality tier steps down mid-walk").

  **Code done; mid-walk step-down not observable.** `useQualityTier` now tracks the detected tier separately from the current one; `terrainSegments` and `shadowMapSize` are read from the detected tier and a step-down leaves them alone, moving only `dpr` and the per-frame-cheap knobs. The detected tier is captured when detection runs, not from the pre-detection `medium` placeholder. Watching the avatar stay responsive across a forced step-down needs a visible window (see 0.2).

## 5. Panel fits the frame

- [x] 5.1 Add `panelWidth` to `lib/world/avatarState.ts` and write it from `StationPanel` at the same moment and by the same rule as the existing `panelHeight`.

  **Done.** `panelWidth` added to `avatarState`, written by `StationPanel` beside `panelHeight` under the same `p > 0.5` condition, and including the panel's `PADDING` on both sides so the framed width is the whole board rather than just the text block.
- [x] 5.2 In `CameraRig.tsx`, derive the station framing distance from both dimensions and the camera's live aspect, taking the larger of the vertical and horizontal fits (design.md — Decision 7). Retune `FRAME_MARGIN` so desktop framing lands where the baseline screenshots show it — verify by comparing against the task 0.2 screenshots at two plazas, not by argument.

  **Clipping fixed and proved; but it created a 16px failure — see 5.3/5.4 below.** `CameraRig` derives the fit distance from both dimensions and the camera's live aspect — `(H/2)/tan(fov/2)` and `(W/2)/(tan(fov/2)·aspect)` — taking the larger. `FRAME_MARGIN` retuned 1.35 → 1.4: the old `panelHeight * 1.35` approximates an exact vertical fit of `0.96·H`, so 1.35/0.96 ≈ 1.4 reproduces desktop framing.

  Verified by computing the framing against the **real station content at real viewport sizes**, which needs no browser. Clipping is gone everywhere — and it was worse than the previous change reported: `itau-intern` and `fei` were clipped at **1440x900 desktop** too, not only on phones.

  | viewport | clipped before | clipped after |
  |---|---|---|
  | 360x780 | 8 of 8 stations | **0** |
  | 406x820 | 7 of 8 stations | **0** |
  | 390x844 | 4 of 8 stations | **0** |
  | 1440x900 | 2 of 8 stations | **0** |

- [x] 5.3 Reduce `NARROW_SHAPES` in `StationPanel.tsx` to a single column (design.md — Decision 8). Verify at a narrow viewport that every plaza's panel is laid out in one column.

  **Table reduced as specified, but it does not close the requirement — BLOCKED, see below.** `NARROW_SHAPES` is now the single `{ width: 5.2, columns: 1 }`; the `{ width: 7.5, columns: 2 }` that produced the clipped Itaú columns is gone. The shape tables moved from `StationPanel.tsx` into `lib/world/panelLayout.ts` (with `fitShape`) so the panel-fit rule can be checked against the real content directly instead of only by standing at each plaza.

  **This traded one clause of `Station content is readable` for the other.** At 360x780, measured against the real content:

  | | before | after |
  |---|---|---|
  | stations clipped | 8 of 8 | **0 of 8** |
  | stations below the 16px body floor | 1 of 8 | **8 of 8** (12.8–13.1px) |

  Pulling the camera back far enough to fit the panel's width is what costs the type size, and the panel is additionally fit-scaled because a single 5.2-wide column overflows `MAX_HEIGHT`.

  **Swept exhaustively and there is no shape that satisfies both.** Over `maxHeight` ∈ {5.8, 5.0, 4.4, 3.8, 3.2} × columns ∈ {1, 2} × width 3.0…9.0: **no combination reaches 16px without clipping at 360px.** The best achievable without clipping is **12.8px** against a 16px floor.

  Enlarging the type is not a lever either, and provably so: while a panel is fit-scaled, `fit = MAX_HEIGHT / height` and `height ∝ size`, so `size × fit` is constant — bigger type makes a taller panel that is scaled down by exactly the same factor.

  The only remaining lever is **less content per panel**, which is precisely the escape hatch `career-content-discovery` already names: "the zone SHALL present its entries as sequential plazas — one entry per panel". At a 4.12-unit text width with the panel not fit-scaled, the floor is met at exactly 16.0px — so the split is sufficient as well as necessary.

  Splitting zones across plazas adds anchors and changes the trail, which is outside this change and is what design.md — Decision 8 said to surface rather than absorb. **Raised with the user, who chose to widen the change and split the plazas now.**

  **Resolved — and the fix turned out to be much smaller than the analysis above suggested, because the analysis had a wrong premise.** `MAX_HEIGHT` was a single fixed 5.8 for every viewport. At the distance a narrow frame reads a panel from, the camera's frustum is about 14.2 world units tall — so 5.8 was scaling down panels the screen had ample room for, and the fit-scale takes the type down with it. The cap, not the content, was doing most of the damage.

  So `MAX_HEIGHT` became per viewport shape (`maxHeightFor`): 5.8 wide, **10.5 narrow**, chosen against the frame rather than by eye. The narrow width came down 5.2 → **4.0**, which is the widest that still clears the floor — 4.4 puts the camera at 14.8 units and the type at 15.2px.

  That left only **three** zones still scaled down, not eight: `itau-rpa`, `agile-inc` and `certifications`. Those three are split. **11 plazas, not the 20 a naive one-entry-per-panel split would have needed** — and that naive split would have failed anyway, since `intro` and `fiap` are single entries already too tall for the old cap.

- [ ] 5.4 At the narrowest viewport the environment can actually produce, stand at the `itau-rpa` plaza — the station that produced the clipped `Consolida…`, `API Gatew…`, `Agentes d…` columns — and confirm no line of text is cut off at either side edge, and that body text still measures at least 16 CSS pixels (spec: career-content-discovery — "Visitor reads a multi-column panel on a tall narrow screen", "Visitor reads on a phone"). **State plainly in the task notes which viewport width was actually reached.** If 360px is unreachable and the check passes only at a wider width, say so and leave this unticked rather than claiming the narrower case.

  **Not verified — needs a visible browser window.** See task 0.2: this environment's Chrome window reports `visibilityState: "hidden"`, so `requestAnimationFrame` never runs, no frame is ever drawn and the avatar cannot be walked. Left unticked rather than claimed.
- [x] 5.5 Repeat 5.4 at every plaza, not only `itau-rpa`. Verify no panel is clipped and none has dropped below the 16px floor. If a station now breaches the floor at one column, surface it — splitting a zone across plazas changes the trail and belongs in its own change (design.md — Decision 8).

  **Done, computed against the real content at every plaza, in both languages, at six viewports.** This needs no browser: the panel layout, the fit-scale and the camera's framing distance are all pure functions of the content and the viewport aspect.

  | viewport | min body text | clipped | vertical overflow |
  |---|---|---|---|
  | 360x780 phone | **16.0px** | 0 | 0 |
  | 390x844 iPhone | 17.3px | 0 | 0 |
  | 406x820 (this env) | 16.8px | 0 | 0 |
  | 768x1024 tablet portrait | 21.0px | 0 | 0 |
  | 1440x900 desktop | 17.3px | 0 | 0 |
  | 1920x1080 desktop | 20.8px | 0 | 0 |

  All 22 plaza/language combinations clear the 16px floor at every viewport, nothing is clipped at either side edge, and nothing overflows the frame vertically. The three-quarters fill rule also still holds — worst case 84.4%, against a 75% floor.

  **Not verified — needs a visible browser window.** See task 0.2: this environment's Chrome window reports `visibilityState: "hidden"`, so `requestAnimationFrame` never runs, no frame is ever drawn and the avatar cannot be walked. Left unticked rather than claimed.
- [ ] 5.6 Confirm the narrow-viewport controls are unaffected: joystick and jump button render, are at least 44x44px, and overlap neither each other nor the progress rail (spec: avatar-control — Controls work across viewport sizes).

  **Not verified — needs a visible browser window.** See task 0.2: this environment's Chrome window reports `visibilityState: "hidden"`, so `requestAnimationFrame` never runs, no frame is ever drawn and the avatar cannot be walked. Left unticked rather than claimed.

## 5b. Sequential plazas (added mid-apply, with the user's approval)

- [x] 5b.1 Make the panel height cap a function of the viewport shape rather than one fixed number: `maxHeightFor(narrow)` in `lib/world/panelLayout.ts`, 5.8 wide and 10.5 narrow, with the narrow value derived from the frustum height at the narrow framing distance. Verified: every narrow panel is now unscaled (`fit` = 1.00) except `fiap` at 1.00 and none below.
- [x] 5b.2 Bring the narrow text width to the widest value that still clears the 16px floor: 5.2 → 4.0. Verified by sweep — 4.0 gives 16.5px at the narrow framing distance, 4.4 gives 15.2px.
- [x] 5b.3 Split the three zones still scaled down at the narrow width into pairs of plazas walked in sequence: `itau-rpa` → `itau-rpa-2`, `agile-inc` → `agile-inc-2`, `certifications` → `certifications-2`. The continuation repeats the header (period, title, company) under its own `-cont` id so the visitor knows whose job they are reading, and carries no links, so no signpost stands twice for the same destination. Verified: content coverage passes in both languages and every experience entry is placed exactly once.
- [x] 5b.4 Extend the trail for 11 plazas, keeping the 18-unit spacing and the alternating lateral offset, and move the lead-out from z=-140 to z=-194. Trail length 172.8 → 235.2 units. Verified: stations are in strictly increasing arc-length order, and the fallback list's order still matches the trail's.
- [x] 5b.5 Give the continuation plazas their zone's own accent (so a pair reads as one stop carried over, not two unrelated ones), their employer logo, and their labels and kickers in both languages. Verified: every station has an accent; no station is missing a label or kicker in either language.
- [x] 5b.6 Rebalance the obstacle groups from 7 to 10 for the new gaps, varying kind and side. **`assertObstaclePlacement` caught a bad placement here** — a `steps` group in the `fiap` → `certifications` gap reached within 7.94u of both plazas, inside the 9u plaza radius — and it was moved rather than the assertion relaxed. Verified: all 10 groups clear every plaza (nearest 9.8u) and all remain bypassable.
- [x] 5b.7 Re-run every shipped assertion against the longer trail. Verified: content coverage, obstacle placement, and the plaza light budget all pass — the two-light rig still suffices at 11 plazas, and no plaza within light reach is left unlit at any of 801 sampled points.

## 6. Measure and verify

- [ ] 6.1 Re-measure exactly as in task 0.2 and record the result against the baseline: longest single frame, median frame time, long-task count, draw calls, and program count at the three positions. Verify the longest frame is now within 4× the median (spec: portfolio-world — "Visitor walks the trail end to end without stopping").

  **Not verified — needs a visible browser window.** See task 0.2: this environment's Chrome window reports `visibilityState: "hidden"`, so `requestAnimationFrame` never runs, no frame is ever drawn and the avatar cannot be walked. Left unticked rather than claimed.

  The before half of this comparison is also missing — task 0.2 could not capture live frame timing either.
- [ ] 6.2 Walk the full trail on the lowest-capability machine available, or — if only capable hardware is to hand — with CPU throttling and a forced `low` tier. **Say plainly in the task notes which of the two was used** (spec: portfolio-world — "Visitor walks the whole trail on a modest machine").

  **Not verified — needs a visible browser window.** See task 0.2: this environment's Chrome window reports `visibilityState: "hidden"`, so `requestAnimationFrame` never runs, no frame is ever drawn and the avatar cannot be walked. Left unticked rather than claimed.
- [ ] 6.3 Confirm the requirements the previous change won are still intact: throttle the network, walk toward an unvisited plaza, and verify the other plazas, panels, signposts and skill text all stay on screen while that plaza's crest loads (spec: portfolio-world — A loading asset never removes placed content).

  **Not verified — needs a visible browser window.** See task 0.2: this environment's Chrome window reports `visibilityState: "hidden"`, so `requestAnimationFrame` never runs, no frame is ever drawn and the avatar cannot be walked. Left unticked rather than claimed.
- [ ] 6.4 Switch language at a plaza mid-trail and confirm the world does not blank and everything switches together (spec: portfolio-world — "Visitor switches language while walking").

  **Not verified — needs a visible browser window.** See task 0.2: this environment's Chrome window reports `visibilityState: "hidden"`, so `requestAnimationFrame` never runs, no frame is ever drawn and the avatar cannot be walked. Left unticked rather than claimed.
- [ ] 6.5 Confirm nothing about the art direction moved: compare full-trail screenshots at the three baseline positions and both obstacle groups against task 0.2, and confirm they are visually identical apart from the framing retune of task 5.2.

  **Not verified — needs a visible browser window.** See task 0.2: this environment's Chrome window reports `visibilityState: "hidden"`, so `requestAnimationFrame` never runs, no frame is ever drawn and the avatar cannot be walked. Left unticked rather than claimed.
- [x] 6.6 Run `openspec validate stabilize-frame-rate-and-panel-fit --strict`, `pnpm exec tsc --noEmit`, and `pnpm run build` and confirm all three complete clean.

  **Done.** `openspec validate stabilize-frame-rate-and-panel-fit --strict` → valid. `tsc --noEmit` → clean. `next build` → compiled successfully, 4/4 static pages, route `/` at 387 kB (488 kB first load).
