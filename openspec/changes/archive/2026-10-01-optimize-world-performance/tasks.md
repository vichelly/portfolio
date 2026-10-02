## 1. Baseline

- [x] 1.1 Record baseline: `du -sh node_modules public .next`, `next build` first-load JS per route, and `npm ls --depth=0 | wc -l`; save numbers in the change folder as `baseline.md`
- [ ] 1.2 Capture a DevTools performance trace and `renderer.info` (calls, triangles) over a full walk at the detected tier; record in `baseline.md`

## 2. Remove dead weight

- [x] 2.1 Delete unreferenced `public/` images, `components/ui/`, `hooks/use-toast.ts`, `styles/`; verify `grep -r` finds no remaining reference and `npx tsc --noEmit` passes
- [x] 2.2 Remove every dependency not imported by `app/`, `components/world/`, `lib/` (keep three, @react-three/*, postprocessing, zustand, lucide-react, clsx, tailwind-merge, tailwindcss-animate if referenced by config, next, react); verify `npm install` and `next build` succeed
- [x] 2.3 Delete `pnpm-lock.yaml`; verify a clean `npm ci` works
- [x] 2.4 Remove the dead `v0-user-next.config` import and merge helper from `next.config.mjs`; verify `next build` succeeds

## 3. First-load path

- [x] 3.1 Remove `ThemeProvider`/`next-themes` and `components/theme-provider.tsx` from `layout.tsx`; verify page renders and no hydration warning in console
- [x] 3.2 Replace `next/font/google` Inter with `next/font/local`; verify Network tab shows no request to fonts.googleapis.com / gstatic and HUD text looks unchanged
- [x] 3.3 Remove `ignoreBuildErrors` / `ignoreDuringBuilds`; fix or configure whatever surfaces; verify `next build` and `next lint` pass

## 4. Idle cost

- [x] 4.1 Switch `Canvas` to `frameloop` driven by `document.visibilityState`, release held movement input on hide/blur; verify manually: hide tab mid-walk, return, avatar position unchanged and not moving
- [x] 4.2 Verify in the trace that no frames render while hidden

## 5. Measured runtime pass

- [ ] 5.1 From the baseline trace, list the top three per-frame costs; for each, implement a fix only if it shows a measurable gain, otherwise record "no change" in `baseline.md`
- [x] 5.2 Re-run section 1 measurements into `after.md` and verify bundle, install size and frame time did not regress

## 6. Regression check

- [ ] 6.1 Walk the full trail in the browser: all stations, crests, links, language switch and fallback menu work; progress reaches the end

## 7. Personal project: yt-to-mp3

- [x] 7.1 Add a `yt-to-mp3` entry (EN/PT, link to https://github.com/vichelly/yt-to-mp3) to `lib/content/experience.ts` and place it on the `fiap` station in `lib/world/stations.ts`; verify `assertContentCoverage()` passes and `npx tsc --noEmit` is clean
- [x] 7.2 Verify in the browser that the FIAP plaza shows both cards legibly with a working signpost, the fallback text view lists the project with its link, and language switching translates it
