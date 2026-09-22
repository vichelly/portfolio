## Why

The linear trail works, but it reads as a three.js demo rather than a game. Every surface in the world is one flat colour with `flatShading` — sand, stone, grass and bark differ only in hue, so nothing has grain, wear or weight. The sky is a single blue fill, the fog is one band of the same blue, and the light is a plain overhead directional with a hemisphere fill, which flattens every form it touches. Outside the trail the ground is a 300×340 plane at y=0, so the horizon has no shape. And the station panels, which carry the actual content, are set in type small enough that a visitor squints at them while roughly a third of each panel is empty space.

## What Changes

- Adopt one committed art direction — **dawn in a valley**, after Journey and Alto's Odyssey: low sun, long shadows, a sky that runs amber to pale blue, layered distance fog that separates the planes, warm sand and stone, and vegetation reading as dark silhouette. Replaces the current flat-blue-and-green scheme.
- **Give every surface procedural texture.** Material grain, tonal variation and wear are generated in shader code — fine noise on the trail, fBm veining on stone, patchy tone in vegetation — so the world gains detail with no texture files and no visible tiling.
- **Enlarge station type and tighten the panel.** Body and heading sizes go up, the gaps between blocks, entries and columns come down, and the panel's padding shrinks, so each panel is denser and easier to read at the same camera distance.
- Add a real sky and calibrated distance fog: a gradient dome with the sun in it, and fog tuned so each ridge line separates from the one behind it. (Implied by the chosen direction; the direction is not achievable without it.)
- **Give the ground shape.** The flat plane becomes a height field with hills and hollows outside the walkable corridor, blending down to meet the trail. The trail itself stays flat and walkable; nothing about movement or containment changes.
- **Put life in the air.** Dust motes drifting in the sunlight, vegetation swaying on a wind, and dust kicked up at the avatar's feet when it walks and when it lands.
- Add a light post-processing pass — subtle bloom on emissive surfaces, vignette, colour grading, and cheap contact shading — behind an automatic quality tier that disables it on small screens and weak GPUs. **New dependency**: `@react-three/postprocessing`.

## Capabilities

This change must be archived **after** `redesign-linear-journey`. That change is complete but not yet archived, so `openspec/specs/` is still empty; the `career-content-discovery` delta below is a MODIFIED operation and has nothing to modify until the predecessor lands its baseline.

### New Capabilities

None. The work refines how the existing world looks and reads, not what it does.

### Modified Capabilities

- `portfolio-world`: the art-direction requirement becomes specific — a named direction, procedural surface detail, sky and fog, ground relief — and gains a performance-tier requirement so the new work cannot cost the experience on a phone.
- `career-content-discovery`: the readability requirement tightens, in terms a reader can check: minimum on-screen type size and a bound on how much of a panel may be empty.

## Impact

- **New**: a shared material layer for the procedural surface shaders; a sky component; a terrain height field; particle systems for dust and wind; a quality-tier hook that decides what the device can afford.
- **Changed**: `lib/world/theme.ts` (palette re-grounded on the dawn direction), `components/world/World.tsx` (lighting, sky, fog, ground, post-processing), `components/world/Trail.tsx`, `components/world/Decor.tsx`, `components/world/Station.tsx`, `components/world/LinkSignpost.tsx`, `components/world/Avatar.tsx` (materials), `lib/world/panelLayout.ts` and `components/world/StationPanel.tsx` (type scale and spacing).
- **Dependencies**: adds `@react-three/postprocessing`. No texture, model or audio assets are added.
- **Not affected**: the trail model, the character controller, containment, the parkour course's layout and physics, the content data, the bilingual layer, and the fallback view. Movement and collision behaviour are unchanged by this work.
