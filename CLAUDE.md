# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A pure-frontend Android PWA that compares the running costs of electric vs petrol/diesel vehicles. No build step, no framework, no backend. All logic is in vanilla JS/HTML/CSS and runs entirely in the browser.

## Development

Serve locally (required for service worker to register):
```
npm run serve
```
Then open `http://localhost:3000` in a browser or on an Android device via your machine's LAN IP.

Regenerate PNG icons after editing `icons/icon.svg`:
```
npm run icons
```
This runs `generate-icons.mjs` using the `sharp` package (dev dependency) to produce `icons/icon-192.png` and `icons/icon-512.png`.

## Architecture

All files are served as static assets — there is no server-side logic.

| File | Role |
|---|---|
| `index.html` | All markup; input IDs are the source of truth for `app.js` |
| `style.css` | All styles; no CSS framework |
| `app.js` | All calculation and DOM logic |
| `sw.js` | Service worker — cache-first strategy for offline use |
| `manifest.json` | PWA manifest — controls Android install behaviour |
| `icons/` | SVG source + generated 192px and 512px PNGs |
| `generate-icons.mjs` | One-off ESM script; run via `npm run icons` |

### How `app.js` works

The single `recalculate()` function is the heart of the app. Every input fires it via an `input` event listener. It:
1. Calls `calcEvCostPerMile()` and `calcFuelCostPerMile()` — both return `null` if inputs are incomplete.
2. Shows/hides per-vehicle result boxes based on which side has enough data.
3. Only renders the Comparison Summary section when **both** sides return a value.
4. Calls `buildBreakEvenHtml()` only when both purchase prices are provided.

### Key constants and defaults

- Imperial gallon = 4.546 L (default); US gallon = 3.785 L
- Fuel price unit defaults to **per litre** (not per gallon)
- Default currency: **£** (British Pound)
- CO₂ estimates are fixed constants: 0.21 kg/mile (petrol), 0.05 kg/mile (EV, UK grid)

### Break-even logic (four cases)

`buildBreakEvenHtml(evCpm, fuelCpm, evPurchase, fuelPurchase, annualMiles)`:

| Upfront cost | Per-mile cost | Result |
|---|---|---|
| EV ≤ fuel | EV ≤ fuel | "Immediate" — EV wins both |
| EV > fuel | EV ≥ fuel | "Never" — fuel wins both |
| EV > fuel | EV < fuel | Break-even = `priceDiff / savingsPerMile` miles |
| EV < fuel | EV > fuel | Fuel car catches up at `|priceDiff| / |savingsPerMile|` miles |

### PWA / service worker

The cache name is `ev-calc-v1` in `sw.js`. **Bump this string whenever deploying new file versions** — the activate handler deletes all caches whose name doesn't match, which is what forces clients to pick up updates.

The service worker must be registered from HTTPS or `localhost`; it will silently not register on plain HTTP.
