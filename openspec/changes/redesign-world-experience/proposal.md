## Why

Three problems compound in the current build. First, the camera freezes its facing direction the instant the avatar enters the parkour detour (`avatarState.t` stops updating while `containment === "detour"`, and `CameraRig` derives its forward vector from that same `t` against the main trail curve), so as the visitor jumps sideways across platforms the camera keeps looking down the direction they entered from instead of where they are actually moving — the one place in the world where framing matters most for judging a jump. Second, the trail carries 8 stops (intro, Itaú, Agile inc, FEI, skills, certifications, projects, contact) and several — Itaú, skills, certifications — already pack more than one entry into a single in-world panel; `StationPanel`'s own fit logic (`fitShape` in `components/world/StationPanel.tsx`) shrinks type to keep the panel under `MAX_HEIGHT` whenever a station is dense, which silently violates the 16px body-text floor `career-content-discovery` already requires. Third, the content itself has drifted from the visitor's real resume: the FinOps figure is stale (`~R$3,500/mo` vs. the current 90.3% reduction, R$4,785→R$463/mo), the RAAS/Entra ID modernization at Itaú is missing entirely, and the FIAP AI postgraduate program isn't represented anywhere in the world.

## What Changes

- Fix the parkour camera: while `containment === "detour"`, `CameraRig` follows the avatar's actual heading and position within the detour arena (derived from `DETOUR_CURVE` / recent motion), instead of a main-trail `t` that stopped advancing at the moment of entry.
- Collapse the trail's content stops from 8 to 3 thematic zones — **Professional Experience** (most important, kept richest), **Education & Certifications**, and the existing **Parkour** detour (unchanged in role: optional, beside the trail, no career content inside it) — with `intro` and `contact` kept as bookends outside the count, as they already are structurally.
- Retire `skills` and `projects` as their own stations. Skills become ambient decorative typography drifting in the world (no panel, no plaza, not part of the walked content path). Projects are folded as short mentions inside the experience/education entry they belong to (the Scrum Day 2023 site and Agile School back-office inside the Agile inc entry, FEI's TCC inside the FEI entry) rather than standing as six separate reachable entries.
- Guarantee the existing 16px body-text floor instead of silently breaking it: when a zone's entries no longer fit one panel at readable size, split them across sequential plazas within that zone (one panel per entry) instead of shrinking type to force a fit.
- Update career content: correct the Itaú FinOps figure to the 90.3% AWS artifact-cost reduction (R$4,785→R$463/month), add the RAAS (Robot as a Service) login modernization — STS→Entra ID, Java/Spring Boot + JUnit backend on blue-green EC2, Angular 7→17 front-end rebuilt on the Itaú Design System, migration off a tradops account onto S3-backed DevOps — to the current Itaú role, and add the FIAP postgraduate in Artificial Intelligence (Mar–Aug 2026) as an Education & Certifications entry.
- **BREAKING** (internal only): `StationId` loses `skills`, `certifications`, and `projects` as distinct values; `lib/content/projects.ts` is no longer read by `lib/world/stations.ts`. Nothing external depends on these.

## Capabilities

### New Capabilities
(none)

### Modified Capabilities
- `portfolio-world`: the station-order requirement changes from the current 7-stop list to introduction, professional experience, education & certifications, contact, with skills no longer a station and projects no longer a station.
- `career-content-discovery`: the coverage requirement drops "every skill category" and "all six projects" as independently reachable station entries (skills become ambient, non-interactive typography; projects fold into the experience/education entry that produced them); the 16px/three-quarters-fill requirement gains teeth via a rule that a zone splits into multiple plazas rather than shrinking text to fit one.
- `parkour-challenge`: adds a camera requirement — while the avatar is inside the detour, the camera SHALL frame based on the avatar's actual movement within the course, not a frozen main-trail heading.

## Impact

- `components/world/CameraRig.tsx`, `lib/world/avatarState.ts`, `components/world/useCharacterController.ts`, `lib/world/trail.ts` (detour-relative heading/position for the camera).
- `lib/world/trail.ts` (`StationId`, `STATION_ANCHORS`, detour branch point), `lib/world/stations.ts` (station assembly, drops skills/certifications/projects as stations), `lib/world/panelLayout.ts` and `components/world/StationPanel.tsx` (multi-plaza split instead of shrink-to-fit).
- `lib/content/experience.ts` (FinOps figure, RAAS entry, FIAP entry), `lib/content/skills.ts` (consumed differently, as ambient text), `lib/content/projects.ts` (no longer a station source; content folded into experience/education instead).
- A new small component for ambient floating skill words in the 3D scene.
- `components/world/InfoPanel.tsx` / the non-3D fallback view, which must keep exposing every entry (including former project and skill items) even though they no longer have their own station.
