## Context

The current app is a Next.js 15 (App Router) + React 19 site (`app/page.tsx`) composed of section components (`components/sections/*`) rendering static/animated 2D content, styled with Tailwind + Radix UI, with `framer-motion` for scroll animations. `three` and `@types/three` are already declared as dependencies but unused in code today. There are no existing 3D assets in `public/` (only 2D screenshots/placeholders). `next.config.mjs` disables image optimization and ignores TS/ESLint build errors, and there is no test suite in the repo. See `proposal.md` - Why for motivation.

## Goals / Non-Goals

**Goals:**
- Ship a single continuous 3D experience (no route-based page reloads) that satisfies all four capability specs.
- Keep the implementation achievable without a dedicated 3D artist (no external modeling pipeline dependency required to hit MVP).
- Keep the mobile experience performant on mid-range devices (low triangle counts, capped pixel ratio, lazy-loaded heavy modules).
- Preserve every existing career-content data point (experience, skills, certs, projects, contact) as structured data, decoupled from its old 2D presentation.

**Non-Goals:**
- SEO/crawlability of the 3D scene itself (explicitly deprioritized per proposal.md).
- Multiplayer, accounts, or persisted visitor progress across sessions.
- Photorealistic rendering, custom-authored character rigging/animation beyond simple procedural movement.
- Full physics simulation for the entire world - physics is scoped only to the optional parkour layer.

## Decisions

### 0. Guided narrative path + animated info panels (UX redesign)
Instead of free-roaming exploration between disconnected rooms, create a **guided journey path** through the world where:
- The avatar follows a designed walking path (visual trail/pathway) that connects content in a meaningful sequence
- Career information is revealed **along the path** in thematic order (timeline → skills → projects → optional parkour challenge)
- Info boxes are **3D-world-integrated animated panels** (floating holographic displays, sleek panels suspended in space) that fade in/slide in as the avatar approaches or completes a section
- No popups: panels animate into the scene, stay visible briefly, then fade/slide out as the user continues, keeping immersion unbroken
- Visual cues (glowing points, directional lights, subtle guidance) draw the avatar along the intended path without forcing movement

This transforms exploration from "click POIs in rooms" to "walk a curated journey that tells your career story interactively."

### 1. React Three Fiber (R3F) + drei on top of `three`
Use `@react-three/fiber` for the render loop and scene graph (declarative, integrates with React state/Next.js) and `@react-three/drei` for camera helpers, `useGLTF`/primitives, and pointer/keyboard utilities, instead of hand-rolling an imperative `three` scene inside a `useEffect`.
- **Alternative considered**: raw `three` imperative setup (more control, more boilerplate, harder to keep in sync with React state like "which info panel is open"). Rejected: R3F's declarative model fits Next.js/React better and is the de facto standard for this use case.

### 2. Single continuous scene; rooms are graph regions, not routes
The hub and all rooms live in one Three.js scene/canvas mounted once at the app root. "Entering a room" is a camera/visibility transition driven by the avatar's world position, not a Next.js route change.
- **Alternative considered**: one Next.js route per room (simpler code splitting per room). Rejected: violates the portfolio-world spec's "no full page reload between rooms" and avatar-state-preservation requirement, and would force a full WebGL context teardown/rebuild per navigation.
- Room content can still be code-split via dynamic `import()` for room-specific heavy assets (e.g., parkour physics), without splitting by route.

### 3. Avatar and rooms built from primitive/procedural low-poly geometry, not authored GLTF models
Build the Ultraman-inspired avatar (capsule/cone/box primitives, flat-shaded `MeshStandardMaterial`/`MeshToonMaterial`, bold color blocking) and room set-dressing from Three.js primitives and simple composed shapes, rather than requiring custom-modeled/animated GLTF assets.
- **Alternative considered**: sourcing free CC0 low-poly asset packs (e.g., Kenney.nl) for faster visual polish. Not rejected outright - can be layered in later for set-dressing (props, foliage) - but the avatar and core room shells should not depend on finding/fitting external assets to hit MVP, since asset availability/licensing is an external unknown. Primitive-based construction is the reliable MVP path; asset packs are an enhancement.

### 4. Movement: custom lightweight AABB/bounds collision, no physics engine for walking
Ground movement (WASD/joystick) uses simple 2D bounds-checking (clamping position within each room's walkable polygon/box) rather than a full physics engine.
- **Alternative considered**: running everything through `@react-three/rapier` from the start. Rejected for the base walking case: adds a WASM physics engine to the critical path for a feature (walking) that doesn't need real physics, hurting mobile load time.

### 5. Parkour layer lazy-loads `@react-three/rapier` on demand
Only the parkour-challenge capability pulls in `@react-three/rapier` (WASM-based physics for platforms, gravity, jump, collision), and it is dynamically imported so its cost is paid only if/when the visitor enters the parkour area.
- **Alternative considered**: a hand-rolled simple gravity/jump simulation (no physics engine) to avoid the dependency entirely. Rejected: platform-jump "feel" and collision correctness are hard to get right by hand and the parkour layer is explicitly optional/secondary, so its extra weight is acceptable when scoped to lazy load.

### 6. Unified input abstraction (`useMovementInput`)
A single hook normalizes keyboard events (desktop) and virtual-joystick drag output (mobile) into one `{x, y}` movement vector and a `jump` boolean, consumed identically by the avatar controller regardless of input device. Device/input-mode detection uses `matchMedia('(pointer: coarse)')` plus a touch-event fallback to decide whether to render the on-screen joystick, per the avatar-control spec.
- **Alternative considered**: separate movement code paths per device. Rejected: doubles the surface area for movement bugs and makes the two "must behave identically" scenarios in avatar-control harder to keep in sync.

### 7. Career content lives in typed data modules, independent of 3D components
Migrate the hard-coded arrays currently inline in `TimelineSection.tsx`, `ProjectsSection.tsx`, and `AboutSection.tsx` into plain data modules (e.g. `lib/content/experience.ts`, `lib/content/projects.ts`, `lib/content/skills.ts`, `lib/content/contact.ts`). Both the in-world points-of-interest panels and the non-game fallback list render from this same data, so there is exactly one source of truth per the career-content-discovery spec.
- **Alternative considered**: keeping content inline in the new 3D room components. Rejected: would duplicate data between the in-world panel and the required non-game fallback view, risking drift.

### 8. Non-game fallback is a plain HTML overlay, not a 3D interaction
The "skip to info" fallback (portfolio-world spec) is a standard DOM button + modal/menu rendered outside or above the `<Canvas>`, listing all career content data. It does not depend on WebGL, avatar movement, or camera state.
- **Alternative considered**: an in-world "fallback room" the avatar still has to walk to. Rejected: the spec requires reachability "independent of 3D movement" for visitors who cannot operate controls at all.

### 9. State management via a small Zustand store
A single store holds: avatar position/current-room, which info panel (if any) is open, and input-mode (touch/keyboard). Chosen over React Context for R3F's per-frame update pattern (avoids re-render storms from context updates on every frame).
- **Alternative considered**: React Context/useState only. Rejected: per-frame position updates through Context would cause excessive re-renders across the tree; Zustand's selector-based subscriptions avoid that.

## Risks / Trade-offs

- **[Risk]** Guided path could feel restrictive or on-rails, reducing player agency → **Mitigation**: path is a *suggestion* via visual/audio cues, not a hard barrier; player retains full 3D movement freedom; optional branching to explore parkour or revisit prior content.
- **[Risk]** Animated panel transitions could distract or feel cluttered if poorly timed → **Mitigation**: stagger animations, use easing curves, keep info on-screen long enough to read (typically 4-6 seconds), fade cleanly, test with real browser at target device performance.
- **[Risk]** WebGL performance on low-end/older mobile devices → **Mitigation**: low-poly (low triangle count) geometry, flat/toon shading (cheap to render), capped `devicePixelRatio` (e.g., max 2), only the hub + active room's geometry mounted at once, parkour physics lazy-loaded.
- **[Risk]** No 3D artist means visuals could look plain/generic if only primitives are used → **Mitigation**: lean on strong low-poly color design (bold palette, consistent silhouette language) rather than geometric complexity; leave room to layer in CC0 asset packs later as a follow-up, not a blocker.
- **[Risk]** Replacing the whole page is a breaking change with no gradual rollout → **Mitigation**: acceptable per explicit user direction ("tudo vai pro lixo"); previous implementation remains recoverable via git history, so rollback is a revert, not a rebuild.
- **[Risk]** Bundling `@react-three/rapier` (WASM) could still bloat the initial bundle if the dynamic import isn't isolated correctly → **Mitigation**: verify via bundle analysis that the parkour chunk is excluded from the initial `app/page.tsx` bundle before considering the parkour-challenge capability done.
- **[Risk]** Removing all indexable text content from the crawlable DOM (moving everything into a canvas + on-demand panels) could regress even baseline discoverability → **Mitigation**: the non-game fallback overlay (Decision 8) keeps career content as real DOM/HTML, not canvas-only, even though full SEO optimization is out of scope.
- **[Risk]** Touch and keyboard control parity drifting apart over time (bugs fixed on one path but not the other) → **Mitigation**: the shared `useMovementInput` abstraction (Decision 6) is the single point of truth for both input types.

## Migration Plan

No data migration is involved (static content only). Implementation sequence (elaborated further in tasks.md):
1. Scene shell: mount a single `<Canvas>` with journey path geometry, camera, and lighting; retire `app/page.tsx`'s section-based render tree.
2. Avatar + `useMovementInput` + camera-follow + world-bounds collision (avatar-control spec).
3. Content data modules + non-game fallback overlay (portfolio-world + career-content-discovery specs, minus in-world panels).
4. **Guided journey path**: define path waypoints, visual trail/markers, and progression logic (avatar position triggers next info panel).
5. **Animated info panels** as 3D world objects (floating planes with text/UI, positioned at path nodes); implement fade-in/slide-in animations and auto-dismiss timing.
6. Rooms/zones positioned along the path; points-of-interest trigger animated panel reveals as visitor progresses.
7. Parkour layer with lazy-loaded physics as optional branching challenge (parkour-challenge spec).
8. Mobile/perf pass: device-pixel-ratio cap, asset budget check, bundle-size verification for the parkour chunk.

**Rollback strategy**: standard git revert of the change's commits; no deployed data/state to unwind since the site is static content only.

## Open Questions

- Exact number and theming of rooms beyond the four named in the proposal (experience, skills, certifications, projects) - e.g., whether certifications gets its own room or lives inside the skills room - can be decided during task breakdown/implementation without affecting any spec requirement.
- Precise avatar color/silhouette details ("Ultraman-inspired" styling specifics) are a visual-design detail to finalize during implementation, not a behavioral requirement.
