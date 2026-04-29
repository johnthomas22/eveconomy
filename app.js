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
  { group: 'Nissan',     label: 'Leaf e+ 62 kWh (2022)',         milesPerKwh: 4.1 },
  { group: 'Nissan',     label: 'Leaf (2026, est.)',             milesPerKwh: 4.4 },
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

// Approximate WLTP combined MPG for top UK-selling petrol/diesel/hybrid models
const FUEL_PRESETS = [
  { group: 'Audi',        label: 'A3 35 TFSI (1.5 petrol)',          mpg: 47 },
  { group: 'Audi',        label: 'A3 35 TDI (2.0 diesel)',           mpg: 57 },
  { group: 'Audi',        label: 'A4 35 TFSI (1.5 petrol)',          mpg: 42 },
  { group: 'Audi',        label: 'A4 35 TDI (2.0 diesel)',           mpg: 54 },
  { group: 'Audi',        label: 'Q3 35 TFSI (1.5 petrol)',          mpg: 40 },
  { group: 'Audi',        label: 'Q5 40 TDI (2.0 diesel)',           mpg: 44 },
  { group: 'BMW',         label: '1 Series 118i (1.5 petrol)',        mpg: 46 },
  { group: 'BMW',         label: '1 Series 118d (2.0 diesel)',        mpg: 58 },
  { group: 'BMW',         label: '3 Series 320i (2.0 petrol)',        mpg: 42 },
  { group: 'BMW',         label: '3 Series 320d (2.0 diesel)',        mpg: 55 },
  { group: 'BMW',         label: '5 Series 520i (2.0 petrol)',        mpg: 42 },
  { group: 'BMW',         label: '5 Series 520d (2.0 diesel)',        mpg: 54 },
  { group: 'BMW',         label: 'X1 xDrive20i (2.0 petrol)',        mpg: 38 },
  { group: 'BMW',         label: 'X3 20i (2.0 petrol)',              mpg: 36 },
  { group: 'Dacia',       label: 'Sandero 1.0 TCe 90',               mpg: 52 },
  { group: 'Dacia',       label: 'Duster 1.0 TCe 90',                mpg: 44 },
  { group: 'Dacia',       label: 'Jogger 1.0 TCe 110',               mpg: 47 },
  { group: 'Ford',        label: 'Fiesta 1.0 EcoBoost 95',           mpg: 55 },
  { group: 'Ford',        label: 'Fiesta 1.0 EcoBoost 125',          mpg: 53 },
  { group: 'Ford',        label: 'Focus 1.0 EcoBoost 125',           mpg: 52 },
  { group: 'Ford',        label: 'Puma 1.0 EcoBoost 125 mHEV',       mpg: 52 },
  { group: 'Ford',        label: 'Kuga 1.5 EcoBoost 150',            mpg: 38 },
  { group: 'Ford',        label: 'Kuga PHEV 2.5 (CS mode)',          mpg: 35 },
  { group: 'Honda',       label: 'Jazz e:HEV 1.5 hybrid',            mpg: 62 },
  { group: 'Honda',       label: 'HR-V e:HEV 1.5 hybrid',            mpg: 52 },
  { group: 'Honda',       label: 'Civic e:HEV 2.0 hybrid',           mpg: 57 },
  { group: 'Hyundai',     label: 'i20 1.0 T-GDi 100',               mpg: 52 },
  { group: 'Hyundai',     label: 'i30 1.0 T-GDi 120',               mpg: 46 },
  { group: 'Hyundai',     label: 'Bayon 1.0 T-GDi 100',             mpg: 50 },
  { group: 'Hyundai',     label: 'Tucson 1.6 T-GDi 150',            mpg: 35 },
  { group: 'Hyundai',     label: 'Tucson HEV 1.6 230',              mpg: 46 },
  { group: 'Kia',         label: 'Stonic 1.0 T-GDi 120',            mpg: 44 },
  { group: 'Kia',         label: 'Ceed 1.5 T-GDi 160',              mpg: 43 },
  { group: 'Kia',         label: 'Niro HEV 1.6 GDi 141',            mpg: 60 },
  { group: 'Kia',         label: 'Sportage 1.6 T-GDi 150',          mpg: 38 },
  { group: 'Kia',         label: 'Sportage HEV 1.6 230',            mpg: 47 },
  { group: 'Land Rover',  label: 'Defender 90 P300',                 mpg: 28 },
  { group: 'Land Rover',  label: 'Discovery Sport P200',             mpg: 32 },
  { group: 'Land Rover',  label: 'Range Rover Evoque P200',          mpg: 32 },
  { group: 'Mazda',       label: 'Mazda2 1.5 SKYACTIV-G 75',         mpg: 52 },
  { group: 'Mazda',       label: 'Mazda3 2.0 SKYACTIV-X 186',        mpg: 47 },
  { group: 'Mazda',       label: 'CX-30 2.0 SKYACTIV-X 186',         mpg: 45 },
  { group: 'Mazda',       label: 'CX-5 2.0 SKYACTIV-G 165',          mpg: 38 },
  { group: 'Mercedes',    label: 'A-Class A180 (1.4 petrol)',         mpg: 48 },
  { group: 'Mercedes',    label: 'A-Class A200d (2.0 diesel)',        mpg: 60 },
  { group: 'Mercedes',    label: 'C-Class C200 (2.0 petrol)',         mpg: 42 },
  { group: 'Mercedes',    label: 'C-Class C220d (2.0 diesel)',        mpg: 57 },
  { group: 'Mercedes',    label: 'GLA 200 (1.4 petrol)',              mpg: 44 },
  { group: 'Mercedes',    label: 'GLC 300 (2.0 petrol)',              mpg: 35 },
  { group: 'Mitsubishi',  label: 'Outlander PHEV 2.0 (CS mode)',      mpg: 33 },
  { group: 'MINI',        label: 'Cooper 1.5 (136 hp)',               mpg: 50 },
  { group: 'MINI',        label: 'Cooper S 2.0 (178 hp)',             mpg: 44 },
  { group: 'MINI',        label: 'Countryman Cooper 1.5',             mpg: 44 },
  { group: 'Nissan',      label: 'Juke 1.0 DIG-T 114',               mpg: 42 },
  { group: 'Nissan',      label: 'Juke Hybrid 1.6 143',              mpg: 52 },
  { group: 'Nissan',      label: 'Qashqai 1.3 mHEV 140',             mpg: 42 },
  { group: 'Nissan',      label: 'Qashqai e-POWER 190',              mpg: 50 },
  { group: 'Peugeot',     label: '208 1.2 PureTech 75',              mpg: 57 },
  { group: 'Peugeot',     label: '208 1.2 PureTech 100',             mpg: 54 },
  { group: 'Peugeot',     label: '2008 1.2 PureTech 100',            mpg: 48 },
  { group: 'Peugeot',     label: '308 1.2 PureTech 130',             mpg: 48 },
  { group: 'Peugeot',     label: '3008 1.2 PureTech 130',            mpg: 44 },
  { group: 'Renault',     label: 'Clio 1.0 TCe 90',                  mpg: 55 },
  { group: 'Renault',     label: 'Clio E-Tech 145 hybrid',           mpg: 68 },
  { group: 'Renault',     label: 'Captur 1.0 TCe 90',                mpg: 48 },
  { group: 'Renault',     label: 'Captur E-Tech 145 hybrid',         mpg: 60 },
  { group: 'Renault',     label: 'Arkana E-Tech 145 hybrid',         mpg: 55 },
  { group: 'SEAT/Cupra',  label: 'SEAT Ibiza 1.0 TSI 95',            mpg: 54 },
  { group: 'SEAT/Cupra',  label: 'SEAT Leon 1.5 TSI 130',            mpg: 48 },
  { group: 'SEAT/Cupra',  label: 'SEAT Ateca 1.5 TSI 150',           mpg: 42 },
  { group: 'SEAT/Cupra',  label: 'Cupra Formentor 1.5 TSI 150',      mpg: 40 },
  { group: 'Skoda',       label: 'Fabia 1.0 MPI 80',                 mpg: 55 },
  { group: 'Skoda',       label: 'Fabia 1.0 TSI 95',                 mpg: 53 },
  { group: 'Skoda',       label: 'Kamiq 1.0 TSI 95',                 mpg: 48 },
  { group: 'Skoda',       label: 'Octavia 1.0 TSI 110',              mpg: 54 },
  { group: 'Skoda',       label: 'Octavia 2.0 TDI 115',              mpg: 59 },
  { group: 'Skoda',       label: 'Karoq 1.5 TSI 150',                mpg: 43 },
  { group: 'Toyota',      label: 'Aygo X 1.0 72',                    mpg: 52 },
  { group: 'Toyota',      label: 'Yaris Hybrid 1.5 116',             mpg: 68 },
  { group: 'Toyota',      label: 'Yaris Cross Hybrid 1.5',           mpg: 60 },
  { group: 'Toyota',      label: 'Corolla 1.8 Hybrid 122',           mpg: 57 },
  { group: 'Toyota',      label: 'Corolla 2.0 Hybrid 196',           mpg: 55 },
  { group: 'Toyota',      label: 'C-HR 1.8 Hybrid 122',             mpg: 57 },
  { group: 'Toyota',      label: 'C-HR 2.0 Hybrid 196',             mpg: 55 },
  { group: 'Toyota',      label: 'RAV4 Hybrid 2.5 222',              mpg: 47 },
  { group: 'Vauxhall',    label: 'Corsa 1.2 75',                     mpg: 54 },
  { group: 'Vauxhall',    label: 'Corsa 1.2 100',                    mpg: 52 },
  { group: 'Vauxhall',    label: 'Astra 1.2 Turbo 130',              mpg: 48 },
  { group: 'Vauxhall',    label: 'Mokka 1.2 Turbo 130',              mpg: 45 },
  { group: 'Vauxhall',    label: 'Grandland 1.2 Turbo 130',          mpg: 44 },
  { group: 'Volkswagen',  label: 'Polo 1.0 TSI 95',                  mpg: 55 },
  { group: 'Volkswagen',  label: 'Polo 1.0 TSI 110',                 mpg: 54 },
  { group: 'Volkswagen',  label: 'Golf 1.0 eTSI 110 (mHEV)',         mpg: 57 },
  { group: 'Volkswagen',  label: 'Golf 1.5 eTSI 150 (mHEV)',         mpg: 54 },
  { group: 'Volkswagen',  label: 'Golf 2.0 TDI 150',                 mpg: 57 },
  { group: 'Volkswagen',  label: 'T-Roc 1.0 TSI 115',                mpg: 48 },
  { group: 'Volkswagen',  label: 'Tiguan 1.5 eTSI 150',              mpg: 47 },
  { group: 'Volkswagen',  label: 'Passat 2.0 TDI 150',               mpg: 57 },
  { group: 'Volvo',       label: 'XC40 B3 (mild hybrid)',             mpg: 42 },
  { group: 'Volvo',       label: 'XC40 B4 (mild hybrid)',             mpg: 40 },
  { group: 'Volvo',       label: 'XC60 B4 (mild hybrid)',             mpg: 38 },
  { group: 'Volvo',       label: 'XC60 B5 (mild hybrid)',             mpg: 35 },
];

function buildGroupedSelect(sel, presets, valueKey) {
  const groups = {};
  presets.forEach(p => { (groups[p.group] ??= []).push(p); });
  Object.entries(groups).forEach(([groupName, items]) => {
    const og = document.createElement('optgroup');
    og.label = groupName;
    items.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p[valueKey];
      opt.textContent = p.label;
      og.appendChild(opt);
    });
    sel.appendChild(og);
  });
}

function populateEvPresets()   { buildGroupedSelect($('evPreset'),   EV_PRESETS,   'milesPerKwh'); }
function populateFuelPresets() { buildGroupedSelect($('fuelPreset'), FUEL_PRESETS, 'mpg'); }

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
  const cur         = getCurrency();
  const unit        = $('unitSystem').value === 'imperial' ? 'Imperial' : 'US';
  const annualMiles = parseFloat($('annualMiles').value) || null;
  const lines = ['EV vs Fuel Cost Comparison', '==========================='];
  if (annualMiles) lines.push(`Annual mileage:    ${annualMiles.toLocaleString()} miles/year`);
  lines.push(`Currency: ${cur}  |  Gallon: ${unit}`, '');

  // EV section
  lines.push('[ Electric Vehicle ]');
  const evPresetLabel = $('evPreset').selectedOptions[0]?.text;
  if (evPresetLabel && $('evPreset').value) lines.push(`Model:             ${evPresetLabel}`);
  const evEff   = parseFloat($('evEfficiency').value);
  const elecPx  = parseFloat($('electricityPrice').value);
  const evPurch = parseFloat($('evPurchasePrice').value);
  if (evEff)   lines.push(`Efficiency:        ${evEff} miles/kWh`);
  if (elecPx)  lines.push(`Electricity price: ${fmt(elecPx)}/kWh`);
  if (evPurch) lines.push(`Purchase price:    ${fmt(evPurch, 0)}`);
  const evCpm = calcEvCostPerMile();
  if (evCpm !== null) {
    lines.push(`Cost per mile:     ${fmt(evCpm, 3)}`);
    lines.push(`Cost per km:       ${fmt(evCpm / KM_PER_MILE, 3)}`);
  }
  lines.push('');

  // Fuel section
  lines.push('[ Petrol / Diesel ]');
  const fuelPresetLabel = $('fuelPreset').selectedOptions[0]?.text;
  if (fuelPresetLabel && $('fuelPreset').value) lines.push(`Model:             ${fuelPresetLabel}`);
  const fuelMpg   = parseFloat($('fuelMpg').value);
  const fuelPx    = parseFloat($('fuelPrice').value);
  const fuelUnit  = $('fuelPriceUnit').value;
  const fuelPurch = parseFloat($('fuelPurchasePrice').value);
  if (fuelMpg)   lines.push(`Fuel efficiency:   ${fuelMpg} MPG`);
  if (fuelPx)    lines.push(`Fuel price:        ${fmt(fuelPx)}/${fuelUnit}`);
  if (fuelPurch) lines.push(`Purchase price:    ${fmt(fuelPurch, 0)}`);
  const fuelCpm = calcFuelCostPerMile();
  if (fuelCpm !== null) {
    lines.push(`Cost per mile:     ${fmt(fuelCpm, 3)}`);
    lines.push(`Cost per km:       ${fmt(fuelCpm / KM_PER_MILE, 3)}`);
  }
  lines.push('');

  // Comparison summary
  if (evCpm !== null && fuelCpm !== null) {
    lines.push('[ Comparison ]');
    const savingsPerMile = fuelCpm - evCpm;
    const winner = savingsPerMile > 0 ? 'EV' : 'Fuel';
    lines.push(`${winner} is cheaper by ${fmt(Math.abs(savingsPerMile), 3)}/mile (${fmt(Math.abs(savingsPerMile) / KM_PER_MILE, 3)}/km)`);
    if (annualMiles) {
      const annualSavings = Math.abs(savingsPerMile) * annualMiles;
      lines.push(`Annual savings (${winner}): ${fmt(annualSavings, 0)}`);
      const co2Saved = (CO2_FUEL_KG_PER_MILE - CO2_EV_KG_PER_MILE) * annualMiles;
      lines.push(`CO2 saved (EV vs petrol): ${co2Saved.toFixed(0)} kg/yr`);
    }
    lines.push('');
  }

  lines.push(`Generated: ${new Date().toLocaleString()}`);
  return lines.join('\n');
}

// Wire up events
document.addEventListener('DOMContentLoaded', () => {
  populateEvPresets();
  populateFuelPresets();

  $('evPreset').addEventListener('change', () => {
    const val = $('evPreset').value;
    if (val) { $('evEfficiency').value = val; recalculate(); }
  });
  $('evEfficiency').addEventListener('input', () => { $('evPreset').value = ''; });

  $('fuelPreset').addEventListener('change', () => {
    const val = $('fuelPreset').value;
    if (val) { $('fuelMpg').value = val; recalculate(); }
  });
  $('fuelMpg').addEventListener('input', () => { $('fuelPreset').value = ''; });

  const inputs = [
    'currency', 'unitSystem', 'annualMiles',
    'evEfficiency', 'electricityPrice', 'evPurchasePrice',
    'fuelMpg', 'fuelPrice', 'fuelPriceUnit', 'fuelPurchasePrice',
  ];
  inputs.forEach(id => $(id).addEventListener('input', recalculate));

  $('clearBtn').addEventListener('click', () => {
    ['annualMiles', 'evEfficiency', 'electricityPrice', 'evPurchasePrice',
     'fuelMpg', 'fuelPrice', 'fuelPurchasePrice'].forEach(id => { $(id).value = ''; });
    $('evPreset').value = '';
    $('fuelPreset').value = '';
    recalculate();
  });

  $('downloadBtn').addEventListener('click', () => {
    const text = getResultsText();
    if (navigator.share) {
      navigator.share({ title: 'EV vs Fuel Cost Comparison', text }).catch(() => {});
    } else {
      const blob = new Blob([text], { type: 'text/plain' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = 'ev-fuel-comparison.txt';
      a.click();
      URL.revokeObjectURL(url);
    }
  });

  recalculate();
});
