# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A vanilla JS Progressive Web App (PWA) that compares the running costs of electric vs petrol/diesel vehicles. No build step, no framework — just static files served directly.

## Commands

```bash
# Serve locally (auto-installs serve via npx)
npm run serve

# Regenerate PNG icons from icons/icon.svg (needs sharp installed)
npm run icons
# or: node generate-icons.mjs
```

Install dev dependencies first if icons need regenerating:
```bash
npm install
```

There are no tests and no linter configured.

## Architecture

All logic lives in three files:

- **`app.js`** — all calculation and DOM logic. `recalculate()` is the central function called on every input change. It calls `calcEvCostPerMile()` and `calcFuelCostPerMile()`, updates per-vehicle result boxes, then builds the comparison summary via `buildBreakEvenHtml()`. No state object — values are read directly from DOM inputs on each recalculation.
- **`index.html`** — single-page layout with Settings, EV card, Fuel card, Summary, and Actions sections. Registers the service worker inline.
- **`sw.js`** — cache-first service worker. The cache key is hardcoded as `ev-calc-v1`; bump this string when updating cached assets so old caches are evicted on activate.

**Icons**: `icons/icon.svg` is the source of truth. `generate-icons.mjs` uses `sharp` to rasterise it to 192×192 and 512×512 PNGs. Re-run whenever the SVG changes.

**PWA**: `manifest.json` sets `display: standalone` and `orientation: portrait`. The app is designed for mobile (Android) use.

## Key constants (app.js)

- `LITRES_PER_IMPERIAL_GALLON = 4.546` / `LITRES_PER_US_GALLON = 3.785` — unit conversion
- `CO2_FUEL_KG_PER_MILE = 0.21` / `CO2_EV_KG_PER_MILE = 0.05` — fixed CO₂ estimates used in the annual summary
- The `$` alias maps to `document.getElementById`
