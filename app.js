'use strict';

const LITRES_PER_IMPERIAL_GALLON = 4.546;
const LITRES_PER_US_GALLON = 3.785;
const KM_PER_MILE = 1.60934;

// CO2 estimates: kg per mile
const CO2_FUEL_KG_PER_MILE = 0.21;   // avg petrol car
const CO2_EV_KG_PER_MILE   = 0.05;   // UK grid average

const $ = id => document.getElementById(id);

// Approximate WLTP figures (miles per kWh) for current UK models
const EV_PRESETS = [
  { group: 'Tesla',      label: 'Model 3 RWD (2024)',            milesPerKwh: 4.5 },
  { group: 'Tesla',      label: 'Model 3 Long Range AWD (2024)', milesPerKwh: 4.7 },
  { group: 'Tesla',      label: 'Model Y RWD (2024)',             milesPerKwh: 4.7 },
  { group: 'Tesla',      label: 'Model Y Long Range AWD (2024)', milesPerKwh: 4.2 },
  { group: 'Volkswagen', label: 'ID.3 Pro (58 kWh)',             milesPerKwh: 4.6 },
  { group: 'Volkswagen', label: 'ID.4 Pro (77 kWh)',             milesPerKwh: 3.6 },
  { group: 'Audi',       label: 'Q4 e-tron 40 (82 kWh)',         milesPerKwh: 3.6 },
  { group: 'Hyundai',    label: 'Ioniq 5 RWD (73 kWh)',          milesPerKwh: 4.1 },
  { group: 'Hyundai',    label: 'Ioniq 6 RWD (77 kWh)',          milesPerKwh: 4.3 },
  { group: 'Kia',        label: 'EV6 RWD (77 kWh)',              milesPerKwh: 4.3 },
  { group: 'Kia',        label: 'Niro EV (64 kWh)',              milesPerKwh: 3.9 },
  { group: 'Nissan',     label: 'Leaf 40 kWh',                   milesPerKwh: 4.7 },
  { group: 'Renault',    label: 'Megane E-Tech (60 kWh)',         milesPerKwh: 4.0 },
  { group: 'Renault',    label: 'Renault 5 E-Tech (52 kWh)',      milesPerKwh: 4.3 },
  { group: 'MG',         label: 'MG4 Standard Range (51 kWh)',   milesPerKwh: 4.3 },
  { group: 'MG',         label: 'MG4 Extended Range (64 kWh)',   milesPerKwh: 4.4 },
  { group: 'Peugeot',    label: 'e-208 (54 kWh)',                milesPerKwh: 4.1 },
  { group: 'Vauxhall',   label: 'Corsa Electric (54 kWh)',       milesPerKwh: 3.8 },
  { group: 'BMW',        label: 'i4 eDrive40 (84 kWh)',          milesPerKwh: 4.3 },
  { group: 'MINI',       label: 'Aceman E (54 kWh)',             milesPerKwh: 4.0 },
  { group: 'Volvo',      label: 'EX30 Single Motor (69 kWh)',    milesPerKwh: 4.3 },
  { group: 'BYD',        label: 'Seal (82 kWh)',                 milesPerKwh: 3.7 },
  { group: 'BYD',        label: 'Atto 3 (60 kWh)',              milesPerKwh: 3.5 },
];

function populateEvPresets() {
  const sel = $('evPreset');
  const groups = {};
  EV_PRESETS.forEach(p => { (groups[p.group] ??= []).push(p); });
  Object.entries(groups).forEach(([groupName, presets]) => {
    const og = document.createElement('optgroup');
    og.label = groupName;
    presets.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.milesPerKwh;
      opt.textContent = p.label;
      og.appendChild(opt);
    });
    sel.appendChild(og);
  });
}

function getLitresPerGallon() {
  return $('unitSystem').value === 'imperial'
    ? LITRES_PER_IMPERIAL_GALLON
    : LITRES_PER_US_GALLON;
}

function getCurrency() {
  return $('currency').value;
}

function fmt(value, decimals = 2) {
  return getCurrency() + value.toFixed(decimals);
}

function calcEvCostPerMile() {
  const efficiency = parseFloat($('evEfficiency').value);
  const price      = parseFloat($('electricityPrice').value);
  if (!efficiency || !price || efficiency <= 0) return null;
  return price / efficiency;
}

function calcFuelCostPerMile() {
  const mpg       = parseFloat($('fuelMpg').value);
  const fuelPrice = parseFloat($('fuelPrice').value);
  const priceUnit = $('fuelPriceUnit').value;
  if (!mpg || !fuelPrice || mpg <= 0) return null;

  const litresPerGallon = getLitresPerGallon();
  // Convert fuel price to per-gallon if needed
  const pricePerGallon = priceUnit === 'litre'
    ? fuelPrice * litresPerGallon
    : fuelPrice;

  return pricePerGallon / mpg;
}

function renderPrefixes() {
  const cur = getCurrency();
  ['evPricePrefix', 'evPurchasePrefix', 'fuelPricePrefix', 'fuelPurchasePrefix'].forEach(id => {
    $(id).textContent = cur;
  });
}

function buildBreakEvenHtml(evCpm, fuelCpm, evPurchase, fuelPurchase, annualMiles) {
  const priceDiff = evPurchase - fuelPurchase; // positive = EV costs more upfront
  const savingsPerMile = fuelCpm - evCpm;       // positive = EV cheaper per mile

  let html = '';

  if (priceDiff <= 0 && savingsPerMile >= 0) {
    html += `<div class="summary-block">
      <h3>Break-even</h3>
      <div class="summary-stat positive">Immediate</div>
      <div class="summary-label">EV is cheaper to buy and run</div>
    </div>`;
  } else if (priceDiff > 0 && savingsPerMile <= 0) {
    html += `<div class="summary-block">
      <h3>Break-even</h3>
      <div class="summary-stat negative">Never</div>
      <div class="summary-label">EV is more expensive to buy and run</div>
    </div>`;
  } else if (priceDiff > 0 && savingsPerMile > 0) {
    const breakEvenMiles = priceDiff / savingsPerMile;
    const milesLabel = breakEvenMiles >= 1000
      ? (breakEvenMiles / 1000).toFixed(1) + 'k miles'
      : Math.round(breakEvenMiles) + ' miles';

    html += `<div class="summary-block">
      <h3>Break-even distance</h3>
      <div class="summary-stat">${milesLabel}</div>
      <div class="summary-label">EV saves ${fmt(priceDiff)} upfront cost over ${milesLabel}</div>
    </div>`;

    if (annualMiles) {
      const years = breakEvenMiles / annualMiles;
      const yearsLabel = years < 1
        ? Math.round(years * 12) + ' months'
        : years.toFixed(1) + ' years';
      html += `<div class="summary-block">
        <h3>Break-even time</h3>
        <div class="summary-stat">${yearsLabel}</div>
        <div class="summary-label">Based on ${annualMiles.toLocaleString()} miles/year</div>
      </div>`;
    }
  } else {
    // EV cheaper upfront but more expensive per mile
    const breakEvenMiles = Math.abs(priceDiff) / Math.abs(savingsPerMile);
    const milesLabel = breakEvenMiles >= 1000
      ? (breakEvenMiles / 1000).toFixed(1) + 'k miles'
      : Math.round(breakEvenMiles) + ' miles';
    html += `<div class="summary-block">
      <h3>Break-even</h3>
      <div class="summary-stat">${milesLabel}</div>
      <div class="summary-label">Fuel car catches up after ${milesLabel} (EV cheaper upfront)</div>
    </div>`;
  }

  return html;
}

function recalculate() {
  renderPrefixes();

  const evCpm   = calcEvCostPerMile();
  const fuelCpm = calcFuelCostPerMile();

  // Per-vehicle result boxes
  if (evCpm !== null) {
    $('evCostPerMile').textContent = fmt(evCpm, 3);
    $('evCostPerKm').textContent   = fmt(evCpm / KM_PER_MILE, 3);
    $('evResult').hidden = false;
  } else {
    $('evResult').hidden = true;
  }

  if (fuelCpm !== null) {
    $('fuelCostPerMile').textContent = fmt(fuelCpm, 3);
    $('fuelCostPerKm').textContent   = fmt(fuelCpm / KM_PER_MILE, 3);
    $('fuelResult').hidden = false;
  } else {
    $('fuelResult').hidden = true;
  }

  // Summary — only show when both sides are filled in
  if (evCpm === null || fuelCpm === null) {
    $('summaryCard').hidden = true;
    return;
  }

  const annualMiles   = parseFloat($('annualMiles').value) || null;
  const evPurchase    = parseFloat($('evPurchasePrice').value)   || null;
  const fuelPurchase  = parseFloat($('fuelPurchasePrice').value) || null;

  const savingsPerMile = fuelCpm - evCpm;
  const evWins = savingsPerMile > 0;

  let content = '';

  // Winner banner
  if (savingsPerMile === 0) {
    content += `<div class="winner-banner">Both vehicles have the same cost per mile.</div>`;
  } else {
    const winner = evWins ? 'EV' : 'Fuel';
    const diff   = Math.abs(savingsPerMile);
    content += `<div class="winner-banner">
      ${winner} is cheaper to run by ${fmt(diff, 3)} per mile (${fmt(diff / KM_PER_MILE, 3)} per km)
    </div>`;
  }

  content += '<div class="summary-inner">';

  // Savings per mile
  content += `<div class="summary-block">
    <h3>Running cost difference</h3>
    <div class="summary-stat ${evWins ? 'positive' : 'negative'}">${fmt(Math.abs(savingsPerMile), 3)}/mile</div>
    <div class="summary-label">${evWins ? 'EV saves this per mile' : 'Fuel saves this per mile'}</div>
  </div>`;

  // Annual savings
  if (annualMiles) {
    const annualSavings = Math.abs(savingsPerMile) * annualMiles;
    content += `<div class="summary-block">
      <h3>Annual savings</h3>
      <div class="summary-stat ${evWins ? 'positive' : 'negative'}">${fmt(annualSavings, 0)}</div>
      <div class="summary-label">${evWins ? 'EV saves' : 'Fuel saves'} at ${annualMiles.toLocaleString()} miles/year</div>
    </div>`;

    // CO2
    const co2SavedPerMile = CO2_FUEL_KG_PER_MILE - CO2_EV_KG_PER_MILE;
    const annualCo2Saved  = co2SavedPerMile * annualMiles;
    content += `<div class="summary-block">
      <h3>CO₂ saved (EV vs petrol)</h3>
      <div class="summary-stat positive">${annualCo2Saved.toFixed(0)} kg/yr</div>
      <div class="summary-label">Approx. based on UK grid average</div>
    </div>`;
  }

  // Break-even
  if (evPurchase !== null && fuelPurchase !== null) {
    content += buildBreakEvenHtml(evCpm, fuelCpm, evPurchase, fuelPurchase, annualMiles);
  }

  content += '</div>';

  $('summaryContent').innerHTML = content;
  $('summaryCard').hidden = false;
}

function getResultsText() {
  const cur = getCurrency();
  const unit = $('unitSystem').value === 'imperial' ? 'Imperial' : 'US';
  const lines = [
    'EV vs Fuel Cost Comparison',
    '===========================',
    `Currency: ${cur}  |  Gallon type: ${unit}`,
    '',
  ];

  const evCpm   = calcEvCostPerMile();
  const fuelCpm = calcFuelCostPerMile();

  if (evCpm !== null) {
    lines.push(`EV cost per mile:   ${fmt(evCpm, 3)}`);
    lines.push(`EV cost per km:     ${fmt(evCpm / KM_PER_MILE, 3)}`);
    lines.push('');
  }
  if (fuelCpm !== null) {
    lines.push(`Fuel cost per mile: ${fmt(fuelCpm, 3)}`);
    lines.push(`Fuel cost per km:   ${fmt(fuelCpm / KM_PER_MILE, 3)}`);
    lines.push('');
  }

  const annualMiles = parseFloat($('annualMiles').value) || null;
  if (evCpm && fuelCpm && annualMiles) {
    const savings = Math.abs(fuelCpm - evCpm) * annualMiles;
    const winner  = fuelCpm > evCpm ? 'EV' : 'Fuel';
    lines.push(`Annual savings (${winner}): ${fmt(savings, 0)} at ${annualMiles.toLocaleString()} miles/year`);
  }

  lines.push('');
  lines.push(`Generated: ${new Date().toLocaleString()}`);
  return lines.join('\n');
}

// Wire up events
document.addEventListener('DOMContentLoaded', () => {
  populateEvPresets();

  $('evPreset').addEventListener('change', () => {
    const val = $('evPreset').value;
    if (val) {
      $('evEfficiency').value = val;
      recalculate();
    }
  });

  $('evEfficiency').addEventListener('input', () => { $('evPreset').value = ''; });

  const inputs = [
    'currency', 'unitSystem', 'annualMiles',
    'evEfficiency', 'electricityPrice', 'evPurchasePrice',
    'fuelMpg', 'fuelPrice', 'fuelPriceUnit', 'fuelPurchasePrice',
  ];
  inputs.forEach(id => $(id).addEventListener('input', recalculate));

  $('clearBtn').addEventListener('click', () => {
    ['annualMiles', 'evEfficiency', 'electricityPrice', 'evPurchasePrice',
     'fuelMpg', 'fuelPrice', 'fuelPurchasePrice'].forEach(id => { $(id).value = ''; });
    recalculate();
  });

  $('downloadBtn').addEventListener('click', () => {
    const text = getResultsText();
    const blob = new Blob([text], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'ev-fuel-comparison.txt';
    a.click();
    URL.revokeObjectURL(url);
  });

  recalculate();
});
