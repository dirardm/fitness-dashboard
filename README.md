# Fitness Analytics Dashboard

A local-first fitness analytics web app that turns your exported CSV data into interactive charts, trends, and insights — without sending a single byte to any server.

---

## Features

### Workout Analysis

- Workout type distribution (doughnut chart)
- Weekly calorie burn (bar chart)
- Heart rate zone distribution — average % per zone across all sessions
- Recent workouts table with duration, distance, calories, avg HR, speed, and cadence
- **Personal Records** — max calories, longest distance, longest session, peak avg HR
- **Outlier detection** — flags unusual sessions by z-score (≥ 2.0σ)
- **ACWR chart** — Acute:Chronic Workload Ratio (7-day acute / 28-day chronic) with risk-zone colour coding: undertrained / optimal / overreaching

### Sleep Analysis

- Sleep duration by stage (light / deep / REM) as a stacked bar chart, last 14 nights
- Resting heart rate trend line
- Sleep stage distribution (doughnut)
- Summary stats: avg total sleep, avg deep sleep, avg REM
- Full metrics table: avg HR, HRV, respiratory rate, fragmentation index

### Heart Rate Analysis

- Per-session heart rate trace at 5-minute resolution
- Date selector to browse individual workout sessions
- Session stats: average, maximum, and minimum BPM

### Advanced Analytics

- **Intensity Score**, **Recovery Score**, and **Consistency Score** — composite metrics derived from zone data, sleep quality, and workout spacing
- Training load over time — calorie × duration × zone-intensity weighting
- Workout intensity distribution (low / moderate / high)
- Average HRV and linear trend direction
- Aggregate summary cards for workouts and sleep

### Dashboard & Correlations

- **Summary cards** — total workouts, total calories, avg sleep duration, avg HR at a glance
- **Weekly Trends** — sparkline stat cards for workouts/week, calories/week, avg sleep, avg HRV; week-over-week delta percentages; composite **Sleep Quality Score** (duration + deep + REM + HRV, 0–100)
- **Correlation Heatmap** — Pearson _r_ matrix between six metrics across matched workout + sleep dates (Calories, Avg HR, Sleep hrs, Deep hrs, HRV, Resting HR); colour-coded from negative (red) to positive (green)
- **Quick Previews** — condensed views of all three modules with links to full analysis pages

### Date Filtering

- Preset ranges: Last 7 days, 30 days, 90 days, 6 months, 1 year, All time
- Custom from/to date range via MUI DatePicker
- Selected range and preset persisted in `localStorage`

---

## Tech Stack

| Layer             | Library                    | Version |
| ----------------- | -------------------------- | ------- |
| UI framework      | React                      | 19      |
| Component library | MUI (Material UI)          | 9       |
| Date pickers      | MUI X Date Pickers         | 9       |
| Date adapter      | date-fns                   | 4       |
| Charts            | Chart.js + react-chartjs-2 | 4 / 5   |
| CSV parsing       | PapaParse                  | 5       |
| Routing           | React Router               | 7       |
| Build tool        | Vite                       | 8       |
| Language          | TypeScript                 | 6       |

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9

### Install & run

```bash
# from the repo root (monorepo layout)
cd apps/react/fitness-dashboard

npm install
npm run dev          # starts Vite dev server at http://localhost:5173
```

### Other commands

```bash
npm run build        # type-check then bundle to dist/
npm run preview      # serve the production build locally
npm run lint         # ESLint — warnings are treated as errors (max-warnings 0)
```

---

## CSV File Formats

Upload your files from the Dashboard page. All three files are optional — upload whichever you have. The app handles overlapping date ranges automatically.

### Workouts CSV

One row per workout session. Column names are **case-sensitive**.

| Column             | Type   | Example      | Notes                                             |
| ------------------ | ------ | ------------ | ------------------------------------------------- |
| `Date`             | string | `25/01/2025` | **DD/MM/YYYY**                                    |
| `Time`             | string | `07:30`      | Session start time                                |
| `Duration`         | string | `01:05:20`   | **HH:MM:SS**                                      |
| `Distance`         | number | `10.5`       | Kilometres                                        |
| `Avg speed`        | number | `9.7`        | km/h                                              |
| `Max speed`        | number | `14.2`       | km/h                                              |
| `Calories`         | number | `650`        | kcal                                              |
| `Steps`            | number | `9800`       |                                                   |
| `Avg HR`           | number | `148`        | BPM                                               |
| `Max HR`           | number | `172`        | BPM                                               |
| `Avg cadence`      | number | `85`         | steps/min                                         |
| `Max cadence`      | number | `98`         | steps/min                                         |
| `Perceived Effort` | number | `7`          | 1–10 scale                                        |
| `Zone 1 %`         | string | `12%`        | Time in HR zone 1                                 |
| `Zone 2 %`         | string | `35%`        |                                                   |
| `Zone 3 %`         | string | `28%`        |                                                   |
| `Zone 4 %`         | string | `20%`        |                                                   |
| `Zone 5 %`         | string | `5%`         |                                                   |
| `Workout Type`     | string | `Running`    | Free-text label (e.g. Running, Cycling, Strength) |
| `Source`           | string | `Polar`      | Device or app name                                |

### Sleep CSV

One row per night. Column names are **case-sensitive**.

| Column                   | Type   | Example      | Notes                                                  |
| ------------------------ | ------ | ------------ | ------------------------------------------------------ |
| `Night from`             | string | `25/01/2025` | **DD/MM/YYYY** — the calendar date the night _started_ |
| `Night to`               | string | `26/01/2025` | **DD/MM/YYYY**                                         |
| `From`                   | string | `22:45`      | Lights-out time                                        |
| `To`                     | string | `06:30`      | Wake time                                              |
| `Total sleep time (min)` | number | `462`        | Minutes                                                |
| `Light sleep (min)`      | number | `210`        | Minutes                                                |
| `Deep sleep (min)`       | number | `95`         | Minutes                                                |
| `REM (min)`              | number | `90`         | Minutes                                                |
| `avg HR`                 | number | `52`         | Resting HR during sleep (BPM)                          |
| `avg HR Variability`     | number | `58`         | HRV in ms                                              |
| `Respiratory rate`       | number | `14.8`       | Breaths per minute                                     |
| `Fragmentation`          | number | `22`         | Fragmentation index                                    |
| `Preceded workout`       | string | `Yes`        | Whether a workout preceded this sleep                  |
| `Workout date`           | string | `25/01/2025` | Date of the preceding workout                          |

### Heart Rate CSV (transposed format)

This file uses a **transposed** layout: rows are time slots, columns are workout dates. This is the native export format from Polar and similar devices.

```csv
Time,25/01/2025,26/01/2025,28/01/2025
00:00,62,58,65
00:05,64,60,63
00:10,85,92,78
00:15,132,115,108
...
```

| Element                  | Description                                                                     |
| ------------------------ | ------------------------------------------------------------------------------- |
| First column header      | `Time` — case-insensitive; the parser also tolerates the common `TIme` typo     |
| `Time` cell values       | Either `HH:MM` clock format or raw minutes as an integer                        |
| Remaining column headers | Session dates in `DD/MM/YYYY` — one column per recorded workout                 |
| Cell values              | Heart rate in BPM; readings outside 30–250 BPM are silently filtered as invalid |

Missing cells (no data for a given time slot on a given date) are handled gracefully.

---

## Screenshots
https://github.com/user-attachments/assets/b4daab59-1faf-4fa9-bb9d-c3990c949bdd


The above screencast showcases the functionalalities and features of the Fitness-Dashboard

> Coming soon: screenshots will be added here. The sections below show suggested captions.\_

| View       | Description                                                                  |
| ---------- | ---------------------------------------------------------------------------- |
| Dashboard  | Summary cards, Weekly Trends sparklines, Quick Previews, Correlation Heatmap |
| Workouts   | Full analysis with Personal Records and ACWR chart                           |
| Sleep      | Stage breakdown, resting HR trend, metrics table                             |
| Heart Rate | Per-session BPM trace with date selector                                     |

---

## Data Privacy

**All data processing happens entirely in your browser.**

- No CSV data is ever uploaded to a server or third-party service.
- No analytics, telemetry, or tracking scripts are included.
- The only data written outside memory is your **selected date range**, stored in `localStorage` on your own device.
- Clearing browser storage or opening the app in a private/incognito window leaves no trace of your fitness data.

The "Data stays local — never uploaded" notice in the sidebar is accurate by design, not just policy.

## Project Structure

```
fitness-dashboard/
├── index.html                      # Vite HTML entry point
├── vite.config.ts                  # Vite build configuration
├── tsconfig.json                   # Base TypeScript config
├── tsconfig.app.json               # App-specific TS config (src/)
├── tsconfig.node.json              # Node/tooling TS config (vite.config.ts)
├── eslint.config.js                # ESLint flat config
├── package.json
├── public/
│   └── vite.svg
└── src/
    ├── main.tsx                    # App entry point
    ├── App.tsx                     # Root component; lifts darkMode and data-array state
    ├── App.css                     # App-level styles
    ├── index.css                   # Global styles
    ├── theme.ts                    # MUI v9 theme definitions (light + dark variants)
    ├── vite-env.d.ts               # Vite client type declarations
    │
    ├── pages/                      # Top-level route pages
    │   ├── DashboardPage.tsx
    │   ├── WorkoutsPage.tsx
    │   ├── SleepPage.tsx
    │   └── HeartRatePage.tsx
    │
    ├── components/                 # Feature and shared UI components
    │   ├── layout/                 # Shell: sidebar, nav, dark-mode toggle
    │   ├── FileUpload.tsx          # CSV file ingestion UI
    │   ├── DateRangePicker.tsx     # Preset + custom date-range controls
    │   ├── SummaryView.tsx         # Top-of-dashboard summary cards
    │   ├── WeeklyTrends.tsx        # Sparkline stat cards with week-over-week deltas
    │   ├── CorrelationHeatmap.tsx  # Pearson r matrix across six metrics
    │   ├── WorkoutAnalysis.tsx     # Full workout charts and tables
    │   ├── SleepAnalysis.tsx       # Full sleep charts and tables
    │   ├── HeartRateAnalysis.tsx   # Per-session HR trace
    │   ├── AdvancedAnalytics.tsx   # Composite scores and training load
    │   ├── PersonalRecords.tsx     # PR cards (max calories, distance, etc.)
    │   ├── ACWRChart.tsx           # Acute:Chronic Workload Ratio chart
    │   ├── ChartModal.tsx          # Fullscreen chart expansion (shared)
    │   └── ErrorBoundary.tsx       # React error boundary wrapper
    │
    ├── context/
    │   └── DataContext.tsx         # React context for parsed data
    │
    ├── hooks/
    │   └── useLocalStorage.ts      # Typed localStorage hook (persists date range)
    │
    ├── utils/
    │   ├── csvParser.ts            # CSV parsing, validation, and data transformation
    │   ├── AdvancedAnalytics.ts    # Composite metrics: correlation, training load, scores
    │   ├── analytics.ts            # Supporting analytics helpers
    │   ├── chartSetup.ts           # Global Chart.js component registration
    │   ├── chartConfig.ts          # Shared Chart.js default options
    │   └── formatters.ts           # Display formatting utilities (dates, numbers, durations)
    │
    └── types/
        └── index.ts                # Single source of truth for all TypeScript interfaces
```

---

## Theming

The app ships with a custom **Catppuccin Mocha**-inspired dark palette applied via MUI v9 theming (`src/theme.ts`). A light/dark toggle in the sidebar switches between the two variants at runtime; the preference is not persisted across sessions by default.

### Catppuccin Mocha palette

| Role           | Token      | Hex       |
| -------------- | ---------- | --------- |
| Background     | Base       | `#1e1e2e` |
| Surface        | Surface 0  | `#313244` |
| Text           | Text       | `#cdd6f4` |
| Purple accent  | Mauve      | `#cba6f7` |
| Pink / error   | Red        | `#f38ba8` |
| Green / success| Green      | `#a6e3a1` |
| Yellow / warn  | Yellow     | `#f9e2af` |
| Blue / info    | Blue       | `#89b4fa` |

These colours are mapped to MUI theme tokens (`palette.primary`, `palette.error`, `palette.success`, etc.) so all MUI components inherit them automatically without per-component overrides.

---

## ⚠️ Disclaimer

**Use this application at your own risk.** The authors and contributors are not responsible for any injuries, health issues, data loss, or damages arising from the use of this software. Always consult a qualified professional before making health or fitness decisions based on this app's output.
