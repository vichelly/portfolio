## Context

See proposal.md — Why. What the world renders today, measured:

- **Materials**: every surface is `meshStandardMaterial` with a single `color` and `flatShading`. There are 20 such materials across `Avatar`, `Decor`, `Trail`, `Station`, `LinkSignpost` and `World`. No shader is customised anywhere.
- **Light**: one `directionalLight` at `[26, 34, 18]`, intensity 1.5, 2048² shadow map, plus `hemisphereLight` at 0.8 and `ambientLight` at 0.3. The sun sits high, so shadows are short and forms read flat.
- **Sky and fog**: `<color attach="background">` is one flat hex; `<fog>` is linear, 45 to 170, in a fourth hex close to the sky's. Ridges at different depths therefore wash into the same value.
- **Ground**: a single `planeGeometry args={[300, 340]}` at `y = -0.12`, one colour. The horizon is a straight line.
- **Type**: body 0.225 world units, heading 0.3, label 0.46; `LINE_HEIGHT` 1.4, `BLOCK_GAP` 0.16, `ENTRY_GAP` 0.6, `COLUMN_GAP` 0.9, panel `PADDING` 0.5. A panel taller than `MAX_HEIGHT` 6 is scaled down by `fit`, which shrinks the type further.
- **Renderer**: R3F's defaults — ACES Filmic tone mapping, sRGB output. No post-processing package is installed.

Constraints that shape the approach: the character controller, containment and the parkour course are settled and verified, and this work must not disturb them. There is no test runner; verification is by walking the built world with the Playwright harness already used for the previous change, which can read `window.__avatarState` and project world points to screen coordinates.

## Goals / Non-Goals

**Goals:**

- One palette and one light rig that a reader can name, applied everywhere, so the world reads as a place rather than a collection of primitives.
- Surface detail that costs nothing to download and does not tile.
- Station panels that are comfortable to read at the distance the camera actually holds.
- A quality ladder that makes the new work safe on a phone.

**Non-Goals:**

- No texture, model or audio files. The download budget stays where it is.
- No change to movement, containment, collision, the trail model or the parkour course.
- No change to what content exists or where it stands.
- No global illumination, reflections, or shadow techniques beyond the single shadow-casting sun.

## Decisions

### 1. Procedural detail by patching the standard material, not replacing it

Surface grain comes from `onBeforeCompile` on `MeshStandardMaterial`, injecting a shared GLSL chunk that perturbs `diffuseColor` from world position.

Patching rather than replacing keeps lights, shadows, fog and tone mapping working exactly as they do now — all of which a bare `ShaderMaterial` would forfeit and have to reimplement. A small library of three functions covers the world: `hash`/`value noise`, `fbm` (four octaves), and a `bands` helper for stratified stone.

Each material picks its detail from world position, never from UVs, so the ribbon geometry, the terrain and a rock all sample the same continuous field and no tiling can appear. Per-material uniforms control scale, contrast and a secondary tint:

| Surface | Detail |
| --- | --- |
| Trail | Fine grain at ~2u, plus a slow ~30u tonal drift so long stretches are not uniform |
| Terrain | fBm at ~40u tinted toward dry gold on height, dark green in hollows |
| Stone | `bands` along Y for strata, fBm veining across it, faces darkened by slope |
| Vegetation | Patchy tone at ~6u so no two trees read identically |

*Alternative considered*: `MeshStandardNodeMaterial` / TSL. Rejected — it implies the WebGPU renderer, which is a much larger change than this one.

*Alternative considered*: baking noise to a canvas texture at runtime. Rejected — it reintroduces UVs and therefore tiling, and costs memory that the shader path does not.

### 2. Terrain is displaced geometry, and it is visual only

The ground plane becomes a height field: a plane of ~160×180 segments whose vertices are displaced on the CPU at build time by the same fBm used in the shaders, so the silhouette and the surface detail agree.

Height is multiplied by a falloff on distance from the trail centreline:

```
falloff(d) = smoothstep(halfWidth(t) + 2, halfWidth(t) + 14, d)
```

Inside the corridor it is zero, so the walkable surface stays exactly flat and the trail ribbon meets the ground with no step. Beyond it, relief ramps in over 12 units.

**The controller is not told about any of this.** `groundYAt()` keeps returning 0 outside the parkour pit. That is safe precisely because containment already forbids the avatar from leaving the corridor — the relief only exists where the avatar cannot stand. Recording it here because it is the kind of shortcut that looks like a bug later: the terrain is scenery, and the day something lets the avatar walk on it, this decision has to be revisited.

### 3. Sky is a gradient dome with the sun in it

A large back-side sphere with a small shader: vertical gradient through four stops (horizon haze → amber → pale blue → deep zenith) plus a sun disc with a soft halo, positioned from the same vector as the `directionalLight` so the light and the visible sun cannot disagree.

Fog becomes `FogExp2` with its colour sampled from the *horizon* stop rather than the zenith, which is what makes distant ridges sit in front of the sky instead of dissolving into it. Density is tuned so the far end of the trail (~165u) is heavily veiled while the next station (~20u) is barely touched.

The sun moves to a low angle (~18° elevation) and its colour warms. The hemisphere fill drops to 0.45 and the ambient to 0.18, because long shadows and a graded sky do the work those two were compensating for.

### 4. Post-processing is a tier, not a default

`@react-three/postprocessing` provides `Bloom` (high luminance threshold, so only emissive surfaces bloom), `Vignette`, and `HueSaturation` + `BrightnessContrast` for grading. Contact shading comes from drei's `ContactShadows` under the avatar rather than SSAO — roughly a tenth of the cost for most of the perceived benefit at this art level.

### 5. One quality tier drives everything expensive

A `useQualityTier` hook returns `"low" | "medium" | "high"` from three inputs: viewport width, `devicePixelRatio`, and the unmasked renderer string via `WEBGL_debug_renderer_info` when available. drei's `PerformanceMonitor` then steps the tier *down* if the frame rate stays under target — never up, so it cannot oscillate.

| | low | medium | high |
| --- | --- | --- | --- |
| Post-processing | off | bloom + vignette | all effects |
| Shadow map | 1024 | 2048 | 2048 |
| Terrain segments | 60×70 | 120×135 | 160×180 |
| Dust particles | 0 | 120 | 300 |
| Decor props | half | full | full |
| `dpr` cap | 1.5 | 2 | 2 |

Every tier renders the same world with the same content; only fidelity moves.

### 6. Type is sized from the camera, not guessed

The on-screen height of a world-space glyph is:

```
pixels = worldSize × viewportHeight / (2 × distance × tan(fov / 2))
```

At fov 55° and a 860px viewport, with the station camera ~12u from the panel, today's 0.225 body works out to **15.5px** — and `fit` then scales it down further whenever a panel exceeds `MAX_HEIGHT`. That is the measured cause of the squinting.

The new scale targets ~20px at that distance, which solves to 0.29. Rounding, and rebalancing the rest around it:

| | now | new |
| --- | --- | --- |
| label | 0.46 | 0.58 |
| kicker | 0.24 | 0.30 |
| heading | 0.30 | 0.38 |
| meta | 0.20 | 0.25 |
| body | 0.225 | 0.30 |
| tags | 0.18 | 0.24 |

A dev-only assertion computes the formula for each mounted panel and warns when any panel's body text would land under 16px, so the guarantee is checked rather than hoped for.

### 7. Whitespace comes out of the gaps, not the margins

Bigger type in the same box would make panels taller, which `fit` would then shrink — undoing the gain. So the spacing comes down at the same time:

| | now | new |
| --- | --- | --- |
| `LINE_HEIGHT` | 1.4 | 1.26 |
| `PARAGRAPH_GAP` | 0.18 | 0.12 |
| `BLOCK_GAP` | 0.16 | 0.10 |
| `ENTRY_GAP` | 0.6 | 0.36 |
| `COLUMN_GAP` | 0.9 | 0.7 |
| `PADDING` | 0.5 | 0.34 |

The shape search gains a fill-ratio test beside its height test: a shape is accepted when `layout.height / (layout.height + 2 × PADDING) ≥ 0.75`, which is the spec's rule expressed as the thing the layout can actually check. `MAX_HEIGHT` rises to 6.6 because the camera also comes in slightly (station framing 8.6 → 7.6 behind), and between the two, `fit` should stay at 1 for every station the world currently has.

### 8. The palette moves into tokens with roles

`lib/world/theme.ts` keeps its shape but its values are re-grounded on the direction and gain the roles the new work needs: four sky stops, sun colour and direction, horizon haze, two terrain tints, two stone tints, and the existing station accents re-tuned to sit against warm ground rather than flat green.

## Risks / Trade-offs

- **`onBeforeCompile` is against three's private shader source** → the injections anchor on `#include` directives, which are stable across three's minor versions, and the patch is applied in one shared helper rather than scattered, so a break is one file to fix. The three version is pinned.
- **A displaced 160×180 plane is 28k vertices** → built once in a `useMemo`, never animated, and the segment count drops with the tier. Measured against the existing ~400 decor props, which already cost more in draw calls.
- **Bloom on a bright dawn sky can wash the whole frame** → the luminance threshold is set above the sky's brightest value, so only the emissive accents, eyes and colour timer cross it.
- **The quality tier can misjudge a device** → it only ever steps down, and every tier keeps the full experience; the worst case is a capable machine rendering a slightly cheaper world.
- **Bigger type plus tighter gaps could still overflow on the longest station** → the fill-ratio test and the dev assertion both run on every station at mount, so the failure surfaces during development rather than in front of a visitor.
- **Two changes to panel layout in a row** (the two-tier summary work, then this) → the summaries stay exactly as written; only the scale and spacing move.

## Migration Plan

No data, no routes, no persistence — this is presentation only. Sequence, each step leaving the world runnable:

1. Palette tokens and the light rig (visible change, no new systems).
2. Sky dome and fog.
3. The shared noise/material helper, applied to the trail first, then stone, vegetation, terrain.
4. Terrain height field with the trail falloff.
5. Type scale and spacing, with the dev assertion.
6. Particles and wind.
7. `@react-three/postprocessing` and the quality tier, last, so everything before it is already tuned at full fidelity.

Rollback is per-step `git revert`; step 7 is the only one that touches `package.json`.

## Open Questions

None that change the specs, the approach or the task breakdown. The exact noise scales, fog density and sun elevation are tuning values to settle by looking at the built world.
