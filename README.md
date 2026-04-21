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
- **Correlation Heatmap** — Pearson *r* matrix between six metrics across matched workout + sleep dates (Calories, Avg HR, Sleep hrs, Deep hrs, HRV, Resting HR); colour-coded from negative (red) to positive (green)
- **Quick Previews** — condensed views of all three modules with links to full analysis pages

### Date Filtering
- Preset ranges: Last 7 days, 30 days, 90 days, 6 months, 1 year, All time
- Custom from/to date range via MUI DatePicker
- Selected range and preset persisted in `localStorage`

---

## Tech Stack

| Layer | Library | Version |
|---|---|---|
| UI framework | React | 19 |
| Component library | MUI (Material UI) | 9 |
| Date pickers | MUI X Date Pickers | 9 |
| Date adapter | date-fns | 4 |
| Charts | Chart.js + react-chartjs-2 | 4 / 5 |
| CSV parsing | PapaParse | 5 |
| Routing | React Router | 7 |
| Build tool | Vite | 8 |
| Language | TypeScript | 6 |

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

| Column | Type | Example | Notes |
|---|---|---|---|
| `Date` | string | `25/01/2025` | **DD/MM/YYYY** |
| `Time` | string | `07:30` | Session start time |
| `Duration` | string | `01:05:20` | **HH:MM:SS** |
| `Distance` | number | `10.5` | Kilometres |
| `Avg speed` | number | `9.7` | km/h |
| `Max speed` | number | `14.2` | km/h |
| `Calories` | number | `650` | kcal |
| `Steps` | number | `9800` | |
| `Avg HR` | number | `148` | BPM |
| `Max HR` | number | `172` | BPM |
| `Avg cadence` | number | `85` | steps/min |
| `Max cadence` | number | `98` | steps/min |
| `Perceived Effort` | number | `7` | 1–10 scale |
| `Zone 1 %` | string | `12%` | Time in HR zone 1 |
| `Zone 2 %` | string | `35%` | |
| `Zone 3 %` | string | `28%` | |
| `Zone 4 %` | string | `20%` | |
| `Zone 5 %` | string | `5%` | |
| `Workout Type` | string | `Running` | Free-text label (e.g. Running, Cycling, Strength) |
| `Source` | string | `Polar` | Device or app name |

### Sleep CSV

One row per night. Column names are **case-sensitive**.

| Column | Type | Example | Notes |
|---|---|---|---|
| `Night from` | string | `25/01/2025` | **DD/MM/YYYY** — the calendar date the night *started* |
| `Night to` | string | `26/01/2025` | **DD/MM/YYYY** |
| `From` | string | `22:45` | Lights-out time |
| `To` | string | `06:30` | Wake time |
| `Total sleep time (min)` | number | `462` | Minutes |
| `Light sleep (min)` | number | `210` | Minutes |
| `Deep sleep (min)` | number | `95` | Minutes |
| `REM (min)` | number | `90` | Minutes |
| `avg HR` | number | `52` | Resting HR during sleep (BPM) |
| `avg HR Variability` | number | `58` | HRV in ms |
| `Respiratory rate` | number | `14.8` | Breaths per minute |
| `Fragmentation` | number | `22` | Fragmentation index |
| `Preceded workout` | string | `Yes` | Whether a workout preceded this sleep |
| `Workout date` | string | `25/01/2025` | Date of the preceding workout |

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

| Element | Description |
|---|---|
| First column header | `Time` — case-insensitive; the parser also tolerates the common `TIme` typo |
| `Time` cell values | Either `HH:MM` clock format or raw minutes as an integer |
| Remaining column headers | Session dates in `DD/MM/YYYY` — one column per recorded workout |
| Cell values | Heart rate in BPM; readings outside 30–250 BPM are silently filtered as invalid |

Missing cells (no data for a given time slot on a given date) are handled gracefully.

---

## Screenshots

> _Add screenshots here once the app is running. The sections below show suggested captions._

| View | Description |
|---|---|
| Dashboard | Summary cards, Weekly Trends sparklines, Quick Previews, Correlation Heatmap |
| Workouts | Full analysis with Personal Records and ACWR chart |
| Sleep | Stage breakdown, resting HR trend, metrics table |
| Heart Rate | Per-session BPM trace with date selector |

---

## Data Privacy

**All data processing happens entirely in your browser.**

- No CSV data is ever uploaded to a server or third-party service.
- No analytics, telemetry, or tracking scripts are included.
- The only data written outside memory is your **selected date range**, stored in `localStorage` on your own device.
- Clearing browser storage or opening the app in a private/incognito window leaves no trace of your fitness data.

The "Data stays local — never uploaded" notice in the sidebar is accurate by design, not just policy.
