## Why

The 3D world's render path is already heavily tuned (batched decor, mount windowing, tiered quality). What still makes the project heavy sits around it: roughly 3.2 MB of unreferenced images in `public/`, about 50 unused shadcn components and the ~30 dependencies behind them, a theme provider and a remote Google font the world never needs, two competing lockfiles, and a build that suppresses type and lint errors although `tsc` is currently clean. The world also keeps rendering at full cost when the tab is hidden. A code review turned these up, and none of them need new features to fix.

## What Changes

- Remove dead weight: unreferenced `public/` images (`gastlybusters.png`, `scrumday.png`, `workaround.png`, `API-Spring.png`, `linkreader.png`, `pr.png`, `projectspringpr.png`, `placeholder*`), the unused `components/ui/`, `hooks/use-toast.ts`, `styles/`, and every dependency no source file imports (Radix packages, recharts, framer-motion, react-hook-form, zod, sonner, vaul, cmdk, embla, date-fns, and the rest).
- Remove `ThemeProvider` / `next-themes` (the world has a single fixed palette) and replace the `next/font/google` Inter with the already-bundled local `inter-latin-*.woff` files, so first paint no longer depends on a third-party font fetch.
- Keep one package manager: drop the stale lockfile.
- Stop suppressing errors in `next.config.mjs` (`ignoreBuildErrors`, `ignoreDuringBuilds`) now that the project type-checks, and delete the dead `v0-user-next.config` import.
- Pause the render loop while the page is hidden, and resume without a time jump (physics delta is already clamped).
- Replace per-frame work that can be done once or less often: mote billboarding/bobbing only for on-screen motes, and a measured pass over `useFrame` callbacks for per-frame allocations. Each runtime change must be justified by a before/after measurement, not by estimate.
- Add a repeatable measurement step (bundle size, frames) so the savings are verified instead of assumed.

- Add the personal project yt-to-mp3 (Python CLI and web UI that downloads a YouTube video's audio as MP3 with yt-dlp and ffmpeg, including age-restricted videos via the user's own logged-in browser cookies) as a card on the FIAP station, with a link to its repository.

Apart from that one added card, no change to the trail, stations, controls, or art direction.

## Capabilities

### New Capabilities
- `world-performance`: load weight and idle-cost guarantees for the portfolio page (what is shipped to the visitor, and what the world costs when nobody is looking at it).

### Modified Capabilities

None. Existing capabilities' requirements are unchanged.

## Impact

- Code: `app/layout.tsx`, `next.config.mjs`, `package.json`, lockfiles, `components/world/World.tsx`, `components/world/SkillMotes.tsx`, plus deletions under `components/ui/`, `hooks/`, `styles/`, `public/`.
- Dependencies: large reduction in `dependencies`; `three`, `@react-three/*`, `postprocessing`, `zustand`, `lucide-react`, `clsx`, `tailwind-merge`, Next/React/Tailwind stay.
- Risk: deleting files/deps that something references indirectly (Tailwind config, `components.json`); mitigated by build + type-check gates in tasks.
