# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server with HMR
npm run build     # Type-check then bundle to dist/
npm run lint      # ESLint (max-warnings: 0 — warnings are errors)
npm run preview   # Serve the production build locally
```

There are no tests configured.

## Architecture

React 19 + TypeScript + Vite app. State is lifted into `App.tsx` (no Redux or Context); `darkMode` and the three data arrays (`workoutData`, `sleepData`, `heartRateData`) live there and flow down through props.

**Data pipeline:**
1. User uploads three CSV files via `FileUpload`.
2. `src/utils/csvParser.ts` parses and validates them into typed objects (dates are DD/MM/YYYY).
3. `Dashboard` holds the parsed state and applies date-range filtering via `useMemo` before passing data to chart components.
4. `src/utils/AdvancedAnalytics.ts` computes derived metrics (correlation, training load, intensity/recovery/consistency scores).

**Key files:**
- `src/types/index.ts` — single source of truth for all TypeScript interfaces; update here first when the data model changes.
- `src/utils/chartSetup.ts` — registers Chart.js components globally; must be imported before any Chart.js chart renders.
- `src/utils/csvParser.ts` — all CSV parsing and data-transformation logic lives here.
- `src/components/Dashboard.tsx` — main layout, tab routing, and data-flow hub.

**Component conventions:**
- Many analysis components accept a `preview?: boolean` prop to render a condensed summary card instead of the full view.
- `ChartModal.tsx` provides fullscreen chart expansion and is reused across all analysis tabs.
- MUI `useMediaQuery` is used for responsive layout; prefer MUI breakpoints over custom media queries.
