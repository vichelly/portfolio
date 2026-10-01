# After changes

| | before | after |
|---|---|---|
| node_modules | 1.2G | 602M |
| `npm ls --depth=0` lines | 268 | 24 (incl. eslint dev deps) |
| public/ | 3.4M | 108K |
| First Load JS (`/`) | 488 kB | 490 kB |
| tsc / next build with checks on | checks suppressed | clean, 1 lint warning (Decor.tsx useMemo deps) |

First Load JS is flat: the removed code was never imported, so it was never bundled. The gain is install, dev and repo weight, plus the `public/` payload no longer being deployed.

Hidden-page cost (simulated `visibilitychange` on a visible tab): 0 draw calls in 2 s hidden, 16,680/s on resume, avatar position unchanged.

Fonts: both Inter weights load from `/fonts`, no request to Google.

Also: the movement input no longer runs its own rAF loop (event-driven now), and releases held keys on blur/hide.

## yt-to-mp3 card
FIAP's panel was already scaled to 0.51x at the wide layout before the project was added (long description, no summary). Short `summary` text on FIAP and on yt-to-mp3 brings the two-card panel to 0.96x-1.0x, in line with other stations.
