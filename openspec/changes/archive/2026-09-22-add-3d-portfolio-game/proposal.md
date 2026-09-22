## Why

The current portfolio is a conventional scrolling single-page site (Hero/About/Timeline/Projects/Contact). It reads fine but doesn't differentiate the developer from any other fullstack portfolio, and doesn't demonstrate 3D/WebGL skill. The owner wants visitors to have a fun, memorable experience discovering his experience (Itaú Unibanco, the Vault login modernization, prior roles, skills, certifications, and projects) by walking a low-poly avatar around an explorable 3D world, with an optional parkour/challenge layer for visitors who want to stick around longer. SEO is explicitly not a priority for this change (LinkedIn already serves that purpose) — the priority is a fun, easy-to-use interactive experience that still makes all career information trivially easy to find.

## What Changes

- **BREAKING**: Replace the existing scrolling single-page portfolio (`app/page.tsx` and its section components) with a 3D explorable-world experience as the site's primary interface.
- Add a Three.js/React Three Fiber powered 3D scene with a central hub area connecting to several themed rooms (e.g. experience, skills, certifications, projects), rendered in a colorful low-poly art style.
- Add a controllable low-poly humanoid avatar (Ultraman-inspired silhouette) that the visitor moves around the world.
- Add keyboard (WASD/arrow) controls for desktop and an on-screen virtual joystick / touch controls for mobile, so the experience works on both.
- Add interactive points of interest inside rooms (glowing objects/NPCs) that, on approach/click, open an info panel/modal surfacing the underlying career content (experience entries, the Vault modernization story, skills, certifications, and the 6 existing project entries) woven naturally into the relevant room rather than isolated into a dedicated "Vault room."
- Add an optional, clearly secondary parkour/challenge layer (jumpable platforms, simple physics-based obstacles) within or adjacent to the hub for visitors who want extra engagement; it must not gate access to any career information.
- Preserve all existing career content (About text, Timeline entries, the 6 Projects with their links, Contact info) — it is re-presented through the 3D UI, not deleted.
- Remove or retire the previous section-scrolling presentation (Navigation scroll-spy, HeroSection eye-tracking gimmick, TimelineSection, ProjectsSection, ContactSection, InteractiveBackground) in favor of the 3D scene and its in-world/UI equivalents.

## Capabilities

### New Capabilities
- `portfolio-world`: The 3D hub-and-rooms world itself — scene composition, room layout, low-poly art direction, hub navigation between rooms, and the always-available fallback way to reach every piece of career content without playing the game (accessibility/discoverability guarantee).
- `avatar-control`: Avatar rendering and movement — keyboard control scheme, touch/virtual-joystick control scheme, camera behavior, collision with the world bounds, and responsiveness across desktop and mobile viewports.
- `career-content-discovery`: The interaction model for surfacing career information in-world — proximity/click triggers, info panel/modal content and structure, and the mapping of existing career data (experience, skills, certifications, projects, the Vault case study) to rooms/points of interest.
- `parkour-challenge`: The optional secondary game layer — jumpable platforms, physics/obstacle behavior, and the rule that it is discoverable but never blocks access to career-content-discovery.

### Modified Capabilities
(none — this is a greenfield spec-driven repo with no existing capabilities under `openspec/specs/`)

## Impact

- **Affected code**: `app/page.tsx`, `app/layout.tsx` (metadata/layout wrapper), all of `components/sections/*` (Hero/About/Timeline/Projects/Contact — retired or repurposed as data sources), `components/ui/InteractiveBackground.tsx`, `components/layout/Navigation.tsx` and `Footer.tsx` (scroll-spy nav no longer applies), `components/ui/ProjectCard.tsx` and `TimelineItem.tsx` (content shape likely reused as data feeding the new in-world panels).
- **New dependencies**: `three`, `@react-three/fiber`, `@react-three/drei` (and a physics library such as `@react-three/rapier` or `cannon-es` if the parkour layer needs real physics) will be added to `package.json`. `@types/three` may already be assumed present per the user's own description; verify and add if missing.
- **Assets**: New low-poly 3D models/textures for the avatar, hub, and rooms are required (not present in `public/` today, which only has 2D screenshots/placeholders).
- **Performance/mobile**: Introduces a WebGL render loop and touch input handling that the current static/animated page doesn't have; needs to run acceptably on mid-range mobile devices.
- **Out of scope**: Search engine optimization work, multiplayer/backend features, and account/auth systems are explicitly not part of this change.
