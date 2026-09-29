## Why

The world still hitches while walking, and the previous change's own final check (`remove-parkour-polish-world`, task 7.5) left one legibility defect open. Both are now traced to specific causes rather than suspected:

- **Every station that mounts adds a `pointLight` to the scene.** Three.js keys its shader program cache on the light configuration, so the frame a station enters or leaves the mount window, *every material in the world recompiles its program*. Measured on the live scene: adding one point light compiled **10 new shader programs** and took **281.9 ms** in a single render, and a walk crosses a mount boundary **15 times**.
- **The scene graph is rebuilt from React state on every whole percent of progress.** `progressPercent` reaches the store roughly four times a second at walking speed. Each tick re-renders `World`, re-filters the whole prop table in `Decor`, produces new array identities for all five instanced batches, and so re-writes every instance matrix and recomputes five bounding spheres in a layout effect — synchronously, on the main thread, while the avatar is moving.
- **Nothing is compiled before it is first displayed.** A plaza's panel, its signposts and its crest all build their geometry and compile their shaders on the frame they first appear, which is the frame the visitor is walking toward them.
- **Trail projection scans all 481 curve samples and allocates a vector every frame**, where a local search seeded from the previous result is O(1) and allocates nothing.
- **A quality-tier step-down is itself a stall.** It changes `dpr`, the shadow map size, and the terrain tessellation at once, forcing a renderer and geometry rebuild — at the exact moment the frame rate is already in trouble.

Separately, `CameraRig` frames a station from `panelHeight` alone. On a tall, narrow viewport a panel that fits vertically still overflows horizontally: at the Itaú plaza on a 406px-wide viewport the entire second column reads `Consolida…`, `API Gatew…`, `Agentes d…`. That violates `career-content-discovery`'s "the text remains legible, is not clipped by the viewport edges", and it is the check the previous change deliberately left unticked rather than absorb.

## What Changes

**Frame-rate stability**

- Give the world a **fixed light budget**. Per-station `pointLight`s are replaced by a fixed number of reusable lights, repositioned and recoloured each frame toward the nearest stations, so the scene's light configuration never changes and no material ever recompiles mid-walk.
- **Decouple scene-graph mounting from React renders.** The mount window is evaluated against the live avatar position in the frame loop and only produces a React update when the mounted *set* actually changes, rather than on every percent of progress.
- **Make `Decor` recompute only when its content changes.** Instance matrices are written once per batch membership change, not on every progress tick.
- **Warm up shaders before first display**, so approaching an unvisited plaza does not compile its materials in the frame it becomes visible.
- **Make trail projection O(1) and allocation-free**, seeded from the previous frame's index.
- **Make a tier step-down cheap.** The knobs that force a renderer or geometry rebuild are separated from the knobs that are free to change, so the world can shed cost without a stall.

**Panel legibility**

- **Frame stations from the panel's width and the viewport's aspect as well as its height**, so a panel is never clipped by the left or right viewport edge.
- **Remove the narrow-viewport shape that cannot fit**, so a phone-width viewport is never handed a multi-column panel wider than the frame can hold.
- **Make the panel height cap a function of the viewport shape.** A single fixed cap was shrinking panels that a tall narrow frame had ample room for, and the fit-scale takes the type down with the panel — this, not the content, was most of why phone text was unreadable.
- **Walk three zones as two plazas each** (`itau-rpa`, `agile-inc`, `certifications`), which is what the readability requirement already prescribes for a zone that cannot be read from one panel. 11 plazas instead of 8; the trail keeps its spacing and simply gets longer.

**Non-goals.** No new mechanic, no new content, and no new art direction. Nothing a station *says* changes — the same career entries, in the same order, in both languages.

**Scope widened during apply, with the user's approval.** The trail's layout was originally a non-goal. Fixing the clipping without breaking the 16px floor turned out to be impossible at 360px within the existing plaza set — swept exhaustively over width x columns x height cap, the best achievable was 12.8px against a 16px floor — so the change now also splits three zones across sequential plazas, which is the remedy the readability requirement itself names. See design.md — Decisions 8 and 9.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `portfolio-world`: "Visual quality adapts to the device" gains a stronger, testable stability clause — the world must hold a continuous frame rate through the whole trail, with no freeze when a station enters or leaves the scene and no stall when the tier steps down.
- `career-content-discovery`: "Station content is readable" gains an explicit horizontal-fit clause, so panel legibility is a requirement of both dimensions rather than height alone.

## Impact

**Code**

- `components/world/World.tsx` — mounting no longer driven by store progress; light rig added.
- `components/world/Station.tsx` — per-station `pointLight` removed.
- `components/world/Decor.tsx`, `components/world/SkillMotes.tsx` — windowing source changes.
- `components/world/CameraRig.tsx` — framing distance derived from panel width and aspect.
- `components/world/StationPanel.tsx` — narrow shape table; viewport-aware height cap; publishes panel width.
- `lib/world/mountWindow.ts` — frame-driven windowing, and the decor slice.
- `lib/world/trail.ts` — projection search; the three new plazas and the longer curve.
- `lib/world/quality.ts` — tier knobs split by rebuild cost.
- `lib/world/panelLayout.ts` — shape tables and `fitShape` moved here from the component, so the panel-fit rule can be checked against the real content directly; per-viewport height cap.
- `lib/world/stations.ts`, `lib/world/theme.ts`, `lib/world/obstacles.ts` — the three continuation plazas, their accents and labels, and 10 obstacle groups instead of 7.
- New: `components/world/StationLights.tsx` (the fixed light rig) and `lib/world/plaza.ts` (plaza frame, light budget, and its assertion).

**Sequencing**

`remove-parkour-polish-world` is implemented but not archived, so `openspec/specs/` still describes the parkour detour and does not yet carry the requirements this change modifies. That change must be archived before this one's deltas are valid.

**Dependencies**

None added.
