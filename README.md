# EV vs Fuel Cost Comparison

An Android PWA that compares the running costs of electric and petrol/diesel vehicles. Runs entirely in the browser — no backend, no framework, no build step.

## Features

- **Cost per mile/km** for both EV and fuel vehicles, calculated in real time as you type
- **Break-even analysis** — how many miles (or years) until the EV pays back its higher purchase price
- **Annual savings** based on your mileage
- **CO₂ comparison** using UK grid average figures
- **Configurable currency** — £, $, €, C$, A$ (defaults to £)
- **Imperial or US gallons** (defaults to Imperial / UK)
- **Fuel price per litre or per gallon** (defaults to per litre)
- **Offline support** via service worker — works after first load with no network
- **Installable on Android** — add to home screen from Chrome for a native-app feel

## Usage

Enter values on either or both sides; results appear immediately.

| Input | Where |
|---|---|
| EV efficiency (miles per kWh) | Electric Vehicle card |
| Electricity price (per kWh) | Electric Vehicle card |
| Fuel efficiency (MPG) | Petrol/Diesel card |
| Fuel price (per litre or gallon) | Petrol/Diesel card |
| Purchase prices | Either card (optional — needed for break-even) |
| Annual mileage | Settings bar (optional — needed for annual savings and break-even time) |

The Comparison Summary appears once both sides have enough data. Break-even analysis appears once both purchase prices are entered.

## Break-even cases

| Upfront cost | Per-mile cost | Result |
|---|---|---|
| EV ≤ fuel | EV ≤ fuel | Immediate — EV wins on both counts |
| EV > fuel | EV ≥ fuel | Never — fuel is cheaper to buy and run |
| EV > fuel | EV < fuel | Break-even at `price difference ÷ saving per mile` miles |
| EV < fuel | EV > fuel | Fuel catches up at `price difference ÷ extra cost per mile` miles |

## Running locally

Requires Node.js (for the dev server and icon generation only — the app itself has no runtime dependencies).

```bash
npm run serve
```

Open `http://localhost:3000` in a browser. Use your machine's LAN IP to test on an Android device on the same network. The service worker only registers on `localhost` or HTTPS.

## Deploying

The app is static files — drop the folder into any static host (Netlify, Vercel, Cloudflare Pages, GitHub Pages). The service worker requires HTTPS, which all of these provide.

After deploying a new version, bump the cache name in `sw.js`:

```js
const CACHE = 'ev-calc-v2'; // increment this on each deploy
```

This triggers the activate handler to delete the old cache and forces all clients to fetch fresh files.

## Icons

PNG icons are generated from `icons/icon.svg` using the `sharp` package:

```bash
npm run icons
```

This produces `icons/icon-192.png` and `icons/icon-512.png`. Run this after editing the SVG.

## File structure

```
index.html          — all markup
style.css           — all styles
app.js              — all calculation and DOM logic
sw.js               — service worker (cache-first, offline support)
manifest.json       — PWA manifest (Android install behaviour)
icons/
  icon.svg          — source icon
  icon-192.png      — Android install prompt
  icon-512.png      — Android splash screen
generate-icons.mjs  — icon generation script
```
