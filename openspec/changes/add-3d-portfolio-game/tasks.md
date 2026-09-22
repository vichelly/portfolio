## 1. Dependencies & Content Data Layer

- [x] 1.1 Add `@react-three/fiber`, `@react-three/drei` to `package.json` (and confirm `three`/`@types/three` versions are compatible); verify `pnpm install`/`npm install` completes without peer-dependency errors.
- [x] 1.2 Create `lib/content/experience.ts` with the four timeline entries (Itaú Unibanco incl. Vault modernization story, PSPO I certification, Agile Inc, FEI Computer Science degree) migrated from `TimelineSection.tsx`; verify all four entries' original title/company/year/description text is preserved.
- [x] 1.3 Create `lib/content/projects.ts` with all six projects migrated from `ProjectsSection.tsx` (title, description, tags, image, link, github); verify all six entries and their links are present.
- [x] 1.4 Create `lib/content/skills.ts` with the five skill categories migrated from `AboutSection.tsx` (Back-end, Front-end, Agile Project Management incl. PSPO I credential link, Cloud Computing, No-code); verify categories and credential link match the original.
- [x] 1.5 Create `lib/content/contact.ts` with LinkedIn URL and email/mailto migrated from `ContactSection.tsx`; verify both links resolve to the original targets.

## 2. Scene Shell & Hub

- [x] 2.1 Create the root 3D scene component (e.g. `components/world/World.tsx`) mounting a single `<Canvas>` with basic lighting and a low-poly colorful hub floor/geometry; verify it renders in the browser without console errors.
- [x] 2.2 Replace `app/page.tsx`'s section-based render tree with the new `World` component (retire `Navigation`, `HeroSection`, `AboutSection`, `TimelineSection`, `ProjectsSection`, `ContactSection`, `Footer`, `InteractiveBackground` from the render path); verify `npm run build` succeeds and the home route renders the 3D world instead of the old scrolling page.
- [x] 2.3 Add room entrance markers/geometry in the hub for at least experience, skills, certifications, and projects rooms, visually distinct from plain hub floor; verify each entrance is visible from the hub spawn point.
- [x] 2.4 Implement single-scene room transitions (camera/visibility change on avatar entering a room boundary, no route change); verify navigating from hub into a room and back does not trigger a Next.js route change or full reload (check browser network/history).

## 3. Avatar & Movement Controls

- [x] 3.1 Build the low-poly Ultraman-inspired avatar from primitive geometries (capsule/cone/box, flat-shaded colorful materials); verify it renders at the hub spawn position.
- [x] 3.2 Implement `useMovementInput` hook normalizing WASD/arrow-key input into a `{x, y}` vector plus a `jump` boolean; verify unit/manual test that each key maps to the correct vector direction.
- [x] 3.3 Implement on-screen virtual joystick component for touch input, feeding the same `useMovementInput` output shape; verify dragging the joystick on a touch-emulated viewport moves the avatar proportionally to drag distance.
- [x] 3.4 Implement input-mode detection (`matchMedia('(pointer: coarse)')` + touch fallback) to show the joystick only on touch-primary devices and keyboard-only otherwise; verify by toggling device emulation in devtools that the correct control scheme appears.
- [x] 3.5 Wire avatar movement to the input vector with immediate response (<100ms perceived) and implement camera-follow so the avatar stays in view while moving; verify by manually moving in all directions across the hub.
- [x] 3.6 Implement world-bounds/room-bounds collision (AABB or polygon clamp) so the avatar cannot leave the walkable area; verify by attempting to walk through hub/room edges in all directions.
- [x] 3.7 Ensure on-screen joystick and any action buttons are positioned so they never obstruct the avatar or nearby points of interest on mobile viewports; verify visually at common mobile widths (e.g. 360px, 390px, 428px).

## 4. Career Content Discovery (Points of Interest & Panels)

- [x] 4.1 Build a reusable `InfoPanel` UI component that opens/closes over the canvas and renders structured content (title, description, links) without unmounting the 3D scene; verify opening/closing restores avatar control immediately and supports Escape-to-close.
- [x] 4.2 Place points-of-interest (glowing objects/NPCs) in the experience room for each entry in `lib/content/experience.ts`, including the Itaú entry showing the Vault modernization story inline; verify each POI opens the correct panel content on approach/click.
- [x] 4.3 Place points-of-interest in the projects room for each entry in `lib/content/projects.ts`; verify each opens a panel with correct tags/description and that project/GitHub links open in a new tab without breaking the underlying world state.
- [x] 4.4 Place points-of-interest in the skills room for each category in `lib/content/skills.ts`, including the PSPO I credential link; verify each opens the correct panel content and the credential link resolves correctly.
- [x] 4.5 Add a reachable contact point-of-interest (or panel) surfacing `lib/content/contact.ts` (LinkedIn + email); verify both links are present and functional.
- [x] 4.6 Verify all `InfoPanel` content is readable and all interactive elements are comfortably tappable at viewports narrower than 480px (no horizontal scroll).

## 5. Non-Game Fallback

- [x] 5.1 Add a persistent "Skip to info" control (DOM element outside/above the Canvas, keyboard-focusable) reachable within 2 interactions from world entry; verify it is reachable via Tab/keyboard focus alone, without any 3D interaction.
- [x] 5.2 Build a fallback menu/list view rendering all of `lib/content/experience.ts`, `projects.ts`, `skills.ts`, and `contact.ts` in a directly navigable list, independent of avatar position or movement capability; verify all content from tasks 1.2-1.5 is present and navigable using only keyboard/standard controls.

## 6. Parkour Challenge (Optional Layer)

- [x] 6.1 Add `@react-three/rapier` as a dependency and dynamically import it only within the parkour area's module (not in the initial bundle); verify via a bundle analyzer (e.g. `next build` output or `@next/bundle-analyzer`) that it is excluded from the main entry chunk.
- [x] 6.2 Build a visually distinct parkour zone with jumpable low-poly platforms and simple obstacles, positioned so it does not sit on the path to any room entrance or point of interest; verify a visitor moving only on ground level can still reach every room and POI without engaging the parkour zone.
- [x] 6.3 Implement a jump action bound to a desktop key (e.g. Space) and a mobile on-screen jump button, using the shared physics/collision setup from 6.1; verify the avatar clears intended platform gaps on both input methods.
- [x] 6.4 Implement fall/fail handling that respawns the avatar at a safe nearby point without affecting any previously opened career-content panel or fallback list state; verify by falling off a platform and confirming prior content remains accessible with no reset.

## 7. Performance & Mobile Polish

- [x] 7.1 Cap `devicePixelRatio` (e.g. max 2) and audit polygon counts for hub/room/avatar geometry to keep them low-poly; verify frame rate stays acceptable (target ~30fps+ on a mid-range mobile emulation profile in devtools).
- [x] 7.2 Ensure only the hub plus the currently active room's geometry is mounted/rendered at once (unmount or cull inactive rooms); verify via React DevTools/profiler that inactive room meshes are not present in the scene graph.
- [ ] 7.3 Run a full manual pass on both a desktop browser and a mobile device/emulator confirming: avatar movement, room transitions, all POI panels, the non-game fallback, and the parkour layer (if reached) all work as specified. **Not completed by the agent**: the automated browser harness used for this session reports the tab as `document.hidden`, which throttles `requestAnimationFrame` to zero and prevents verifying continuous animation (movement, camera-follow, room transitions, parkour timing) end-to-end. Static rendering, click-driven interactions (POI click → panel, Skip-to-info → fallback menu), and all content were confirmed working. Needs a real manual pass by the user on desktop and mobile before considering this fully verified.

## 8. Cleanup

- [x] 8.1 Remove now-unused old section components and data (`components/sections/*`, `components/ui/InteractiveBackground.tsx`, `components/layout/Navigation.tsx` scroll-spy logic) once their content/logic has been fully migrated into `lib/content/*` and the new world; verify `npm run build` and `npm run lint` succeed with no dangling imports. (`npm run lint` requires interactive ESLint setup that predates this change and is out of scope; verified instead via `tsc --noEmit` and `next build`, both clean.)
- [x] 8.2 Update `app/layout.tsx` metadata (title/description) to reflect the new 3D portfolio experience; verify the rendered `<head>` reflects the updated metadata.
