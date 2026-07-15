# AGENTS.md

## What This Is

React 19 SPA — Global Air Quality Index dashboard (no backend, no database, no tests). All data comes from the free Open-Meteo API (no API key needed).

## Commands

- `npm run dev` — Vite dev server
- `npm run build` — production build to `dist/`
- `npm run lint` — ESLint (only lint command; no typecheck, no formatter, no test runner)

No test suite exists. No `npm test` command.

## Tech Stack Quirks

- **Tailwind CSS v4** — uses the new `@tailwindcss/vite` plugin, NOT PostCSS. Configuration is in `src/index.css` via `@theme {}` blocks, not `tailwind.config.js`.
- **MapLibre GL** is the primary map library (used in `GlobalMap.jsx`). Leaflet is a dependency but not actively used in components.
- **No TypeScript** — all `.jsx` files. No `tsconfig.json`.
- **No environment variables** — API URLs are hardcoded in `src/data/aqiService.js`.

## Architecture

- `src/main.jsx` → `src/App.jsx` (react-router-dom v7, 6 routes)
- `src/context/AQIContext.jsx` — Provider fetches AQI for 307 cities in batches of 50, auto-refreshes every 10 min
- `src/data/aqiService.js` — all API calls (batch fetch, forecast, history, weather), AQI band/color helpers
- `src/data/cities.js` — hardcoded 307 world cities with lat/lng
- `src/data/mockData.js` — static fallback/placeholder data
- `src/pages/` — page-level components (Home, Dashboard, HeatMapPage, TrendsPage, SafetyGuide, Prediction)
- `src/components/dashboard/` — reusable dashboard widgets
- `src/components/landing/` — landing page components (GlobalMap, SearchBar, CountryRanking, CityDetailsPanel)
- `src/components/layout/` — Header, Footer, MenuDrawer

## Lint Config

ESLint flat config in `eslint.config.js`. Ignores `dist/`. Plugins: `react-hooks`, `react-refresh`. Files: `**/*.{js,jsx}`.
