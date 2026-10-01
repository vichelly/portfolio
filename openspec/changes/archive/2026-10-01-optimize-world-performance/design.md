## Context

See proposal.md - Why. Findings from review (all verified against the tree):

- `app/`, `components/world/`, `lib/` import only: react, next, three, `@react-three/{fiber,drei,postprocessing}`, zustand, lucide-react (2 uses), clsx, tailwind-merge, next-themes (layout only). Nothing imports `components/ui/*` or `hooks/use-toast`.
- `public/` holds ~3.2 MB of project screenshots no code references; only `fonts/`, `logos/`, `favicon.png` are used (`lib/world/preload.ts`, `panelLayout.ts`).
- `npx tsc --noEmit` is clean, so `ignoreBuildErrors` hides nothing today but would hide future regressions.
- `layout.tsx` loads Inter from Google via `next/font` while the 3D text already uses local Inter woff files.
- Render path is already batched/windowed; per-frame `useFrame` count is ~20 callbacks. No evidence yet of a dominant remaining runtime cost, hence measure first.

## Goals / Non-Goals

**Goals:**
- Smaller install, build and first-load payload with zero visible change.
- Zero render cost while hidden.
- Verifiable numbers before/after.

**Non-Goals:**
- Changing quality tiers, shadows, post-processing, art or content.
- Moving to a different 3D stack, SSR for the canvas, or code-splitting the canvas (it is the whole page).
- Re-encoding the logos (already <8 KB each).

## Decisions

1. **Delete rather than tree-shake the shadcn kit.** The kit is not imported, so it adds nothing to the client bundle but does cost type-check, install and confusion. Remove files and dependencies together. *Alternative:* keep for future use - rejected, `shadcn add` restores any component on demand. Keep `components.json` and `lib/utils.ts`.
2. **Drop `next-themes`.** Fixed palette, `defaultTheme="system"` does nothing visible and injects an inline script. Set `<html>` without the provider. *Alternative:* keep - rejected, dead code on every load.
3. **Local font via `next/font/local`** pointing at `public/fonts/inter-latin-{400,600}.woff`. Reuses files already fetched by the world; removes the Google dependency. Move the files under `app/fonts/` only if `next/font/local` needs a relative path (it does); keep the `public/` copies for troika, which needs URLs, or point both at one place via a build-time copy - simplest is keeping both and accepting 60 KB duplication.
4. **Pause via `frameloop`.** Drive `Canvas frameloop` between `"always"` and `"never"` from `document.visibilityState`. Browsers already throttle rAF in hidden tabs, but the avatar integrator and mount window still tick on resume with large deltas; `"never"` plus clamped delta (already `min(delta, 1/20)` in Dust and controller) makes resume clean. Also clear held-key state on `visibilitychange`/`blur`. *Alternative:* rely on browser rAF throttling - rejected, doesn't release held keys.
5. **Enable build checks, fix what surfaces.** Remove both `ignore*` flags; if lint config is absent, add minimal `next/core-web-vitals` rather than disabling.
6. **Runtime tweaks only when measured.** Use Chrome DevTools performance trace over one full walk (before/after) and `renderer.info` draw calls. Candidate: `SkillMotes` per-frame loops over all mounted children; skip when fully faded or off-screen. Anything without a measurable gain is dropped.
7. **Single package manager: npm** (the one used in this session, `package-lock.json` present and newer-compatible). Remove `pnpm-lock.yaml`.

## Risks / Trade-offs

- [Removing a dep that Tailwind/PostCSS config references] → run `next build` and `tsc` after each removal batch.
- [Removing images the user keeps for a future "projects" section] → the content model has no project images today; list the files in the PR and keep them recoverable via git history.
- [Enabling build checks fails the build on latent lint errors] → fix or add targeted config in the same change.
- [`frameloop="never"` can freeze if visibility event is missed] → also resume on `focus`; verify manually.
- [Font swap shifts metrics] → same Inter family/weights, check the HUD visually.

## Migration Plan

Do the change in small commits: deletions, deps, layout/font, build flags, pause, measured tweaks. Each commit builds. Rollback is `git revert` of the commit in question.
