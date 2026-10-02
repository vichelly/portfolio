# Baseline (before changes)

- node_modules: 1.2G · public: 3.4M · .next: 109M
- `npm ls --depth=0` lines: 268
- next build: `/` 387 kB route, **488 kB First Load JS**; shared 101 kB
- Frame trace / renderer.info: see section "Runtime" below (filled in task 1.2)

## Runtime (partial)
- Visible tab, high-refresh display: ~16,680 WebGL draw calls/s (~139 per frame at 120 fps), 121 rAF/s. No DevTools trace or `renderer.info` capture was taken, so tasks 1.2 and 5.1 stay open.
