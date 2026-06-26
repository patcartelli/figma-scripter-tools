// ─── Brand Color Palette Generator (data-driven / exact) ─────────────────────
// Writes the curated brand ramps as Figma variables and renders a labeled
// swatch sheet. Reproduces the existing tokens.json values EXACTLY.
//
// Run inside the Figma Scripter plugin. Self-contained — no imports.
//
// ─── WHY THIS IS DATA-DRIVEN (not algorithmic) ───────────────────────────────
// The brand ramps were built in two passes: an original base scale
// (50,100,200,300,400,500) plus stops inserted by hand to expand the palette
// (25, 350, 450, 550, 600, 700 — tagged "new" in tokens.json). Because part of
// each ramp was authored by hand, no seed→ramp formula reproduces them exactly.
// So this script stores the curated values verbatim rather than computing them.
//
// FUTURE STATE → calculated steps. Once the tonal curve is finalized so every
// stop (including the hand-inserted ones) is computed from the seed, replace
// BRAND_RAMPS below with generation (see generator-dataviz-palette.js for the
// OKLCH engine) and drop the embedded hex values. Tracked as a known follow-up.
//
// The categorical generator (generator-dataviz-palette.js) is already fully
// calculated and should be kept as-is.

// ─── Curated brand data (verbatim from palette/color/light in tokens.json) ────
// Each ramp keeps its own stop set (neutral has no 550 and adds "black").
// "source" is the raw seed/anchor color. palette/* names it "source"; the
// color-roles/* layer references it as a "main" role token.

const BRAND_RAMPS = {
  primary: { source: '#005568',
    '25': '#F0F9FB', '50': '#E0F3F8', '100': '#CDE7EE', '200': '#B5E0E9', '300': '#99D1DE', '350': '#65A5B4', '400': '#317A8B', '450': '#185D6D', '500': '#00414F', '550': '#00272F', '600': '#00171C', '700': '#000A0C' },
  secondary: { source: '#0085CC',
    '25': '#EEF9FF', '50': '#DEF4FF', '100': '#C7E7F8', '200': '#B3DBF1', '300': '#91CEEF', '350': '#5DA1C3', '400': '#29749C', '450': '#1D5D7F', '500': '#114763', '550': '#0A2B3B', '600': '#061923', '700': '#030B0F' },
  error: { source: '#AB0D2F',
    '25': '#FEF6F8', '50': '#FEECF0', '100': '#FFDDE5', '200': '#FFCCD8', '300': '#F8BBC9', '350': '#C66378', '400': '#950B28', '450': '#7D0720', '500': '#650318', '550': '#3D020E', '600': '#230108', '700': '#0F0004' },
  success: { source: '#218336',
    '25': '#F4FBF8', '50': '#E8F6F0', '100': '#D1EEE1', '200': '#A3DCC3', '300': '#75CBA5', '350': '#44A87C', '400': '#148654', '450': '#117549', '500': '#0F653F', '550': '#093D26', '600': '#052316', '700': '#020F09' },
  warning: { source: '#DE8A02',
    '25': '#FEF9F5', '50': '#FCF3EB', '100': '#F8E7D8', '200': '#F1D0B1', '300': '#EBB889', '350': '#CE935C', '400': '#B16E2F', '450': '#9B6029', '500': '#855223', '550': '#503115', '600': '#2F1D0C', '700': '#140C05' },
  info: { source: '#128085',
    '25': '#F4FAFB', '50': '#E8F3F6', '100': '#D1E7EE', '200': '#9CDADD', '300': '#76C4C7', '350': '#4A9A9D', '400': '#1E7073', '450': '#116569', '500': '#045B5F', '550': '#023739', '600': '#012021', '700': '#010E0E' },
  neutral: { source: '#292929',
    '25': '#FCFBFB', '50': '#FAF9F9', '100': '#F9F7F6', '200': '#F0F0F0', '300': '#E8E8E8', '350': '#D2D2D2', '400': '#ACACAC', '450': '#818181', '500': '#575757', '600': '#3D3D3D', '700': '#1A1A1A', 'black': '#000000' },
};

// Order stops render in (top → bottom). "source" leads; unknown keys trail.
const STOP_ORDER = ['source', '25', '50', '100', '200', '300', '350', '400', '450', '500', '550', '600', '700', 'black'];

// ─── User config ──────────────────────────────────────────────────────────────

// Figma collection that receives the variables. Variables are named
// "<ramp>/<stop>" within it (e.g. "primary/25", "primary/source").
//
// ENGINEER — confirm how this maps to your Figma file before running. Two
// valid interpretations; pick one by editing the constants below:
//
//   (a) Literal collection named "palette/color/light", with variables
//       "primary/25", "primary/source", ...          ← current default
//
//   (b) Your real "palette" collection, with the path folded into the
//       variable name. In that case set COLLECTION_NAME = 'palette' and
//       VAR_PREFIX = 'color/light/' so variables land as
//       "color/light/primary/25", matching the Tokens Studio set path.
//
// Created if missing; existing variables are updated in place (re-run safe —
// see setColorVariable; stale variables are never auto-pruned).
const COLLECTION_NAME = 'palette/color/light';
const VAR_PREFIX      = '';   // e.g. 'color/light/' for interpretation (b)

const CONFIG = {
  swatchWidth:  120,
  colorHeight:   80,
  labelHeight:   40,
  gap:            8,
  columnGap:     24,
};

const WHITE = { r: 1, g: 1, b: 1 };

// ─── Color helpers ────────────────────────────────────────────────────────────

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.substring(0, 2), 16) / 255,
    g: parseInt(h.substring(2, 4), 16) / 255,
    b: parseInt(h.substring(4, 6), 16) / 255,
  };
}

// ─── Figma variables ──────────────────────────────────────────────────────────

function findOrCreateCollection(name) {
  const existing = figma.variables.getLocalVariableCollections().find(c => c.name === name);
  return existing || figma.variables.createVariableCollection(name);
}

// Create-or-update a COLOR variable by name (idempotent; no pruning).
function setColorVariable(collection, name, rgb) {
  let variable = figma.variables.getLocalVariables('COLOR')
    .find(v => v.variableCollectionId === collection.id && v.name === name);
  if (!variable) {
    variable = figma.variables.createVariable(name, collection, 'COLOR');
  }
  variable.setValueForMode(collection.defaultModeId, { r: rgb.r, g: rgb.g, b: rgb.b, a: 1 });
  return variable;
}

// ─── Fonts (Inter with graceful fallback) ─────────────────────────────────────

async function resolveFonts() {
  const tryLoad = async (f) => { try { await figma.loadFontAsync(f); return f; } catch (e) { return null; } };
  let medium  = await tryLoad({ family: 'Inter', style: 'Medium' });
  let regular = await tryLoad({ family: 'Inter', style: 'Regular' });
  if (!medium || !regular) {
    const tmp = figma.createText();
    const def = tmp.fontName;
    tmp.remove();
    await figma.loadFontAsync(def);
    medium  = medium  || def;
    regular = regular || def;
  }
  return { medium, regular };
}

// ─── Swatch rendering ─────────────────────────────────────────────────────────

function addText(parent, chars, size, font, grayness, x, y) {
  const t = figma.createText();
  t.fontName = font;
  t.fontSize = size;
  t.characters = chars;
  t.fills = [{ type: 'SOLID', color: { r: grayness, g: grayness, b: grayness } }];
  t.textAutoResize = 'WIDTH_AND_HEIGHT';
  t.x = x;
  t.y = y;
  parent.appendChild(t);
  return t;
}

function buildSwatch(parent, label, hex, variable, x, y, fonts) {
  const { swatchWidth: SW, colorHeight: CH, labelHeight: LH } = CONFIG;
  const PAD = 8;

  const swatch = figma.createFrame();
  swatch.name = label;
  swatch.fills = [];
  swatch.clipsContent = false;
  swatch.resize(SW, CH + LH);
  swatch.x = x;
  swatch.y = y;
  parent.appendChild(swatch);

  const rgb = hexToRgb(hex);
  const fill = { type: 'SOLID', color: { r: rgb.r, g: rgb.g, b: rgb.b } };
  const boundFill = figma.variables.setBoundVariableForPaint(fill, 'color', variable);

  const block = figma.createRectangle();
  block.name = 'color';
  block.resize(SW, CH);
  block.x = 0;
  block.y = 0;
  block.fills = [boundFill];
  swatch.appendChild(block);

  const labelBlock = figma.createFrame();
  labelBlock.name = 'label';
  labelBlock.fills = [{ type: 'SOLID', color: WHITE }];
  labelBlock.clipsContent = false;
  labelBlock.resize(SW, LH);
  labelBlock.x = 0;
  labelBlock.y = CH;
  swatch.appendChild(labelBlock);

  const nameText = addText(labelBlock, label, 12, fonts.medium, 0.10, PAD, PAD);
  addText(labelBlock, hex, 10, fonts.regular, 0.45, PAD, PAD + nameText.height + 2);

  return swatch;
}

// Returns a ramp's stops in canonical order (known stops first, then any extras).
function orderedStops(ramp) {
  const keys = Object.keys(ramp);
  return keys.sort((a, b) => {
    const ia = STOP_ORDER.indexOf(a), ib = STOP_ORDER.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function generate() {
  const fonts = await resolveFonts();
  const collection = findOrCreateCollection(COLLECTION_NAME);

  const { swatchWidth: SW, colorHeight: CH, labelHeight: LH, gap, columnGap } = CONFIG;
  const swatchH = CH + LH;

  const rampNames = Object.keys(BRAND_RAMPS);
  const maxRows   = Math.max(...rampNames.map(r => Object.keys(BRAND_RAMPS[r]).length));

  const totalW = rampNames.length * SW + (rampNames.length - 1) * columnGap;
  const totalH = 40 + maxRows * (swatchH + gap);

  const sheet = figma.createFrame();
  sheet.name = 'Brand Palette';
  sheet.fills = [];
  sheet.clipsContent = false;
  sheet.resize(totalW, totalH);
  sheet.x = figma.viewport.center.x - totalW / 2;
  sheet.y = figma.viewport.center.y - totalH / 2;
  figma.currentPage.appendChild(sheet);

  let totalVars = 0;

  for (let i = 0; i < rampNames.length; i++) {
    const rampName = rampNames[i];
    const ramp     = BRAND_RAMPS[rampName];
    const colX     = i * (SW + columnGap);

    addText(sheet, rampName, 14, fonts.medium, 0.10, colX, 0);

    let y = 40;
    for (const stop of orderedStops(ramp)) {
      const hex      = ramp[stop].toUpperCase();
      const rgb      = hexToRgb(hex);
      const variable = setColorVariable(collection, `${VAR_PREFIX}${rampName}/${stop}`, rgb);
      buildSwatch(sheet, stop, hex, variable, colX, y, fonts);
      totalVars++;
      y += swatchH + gap;
    }
  }

  figma.currentPage.selection = [sheet];
  figma.viewport.scrollAndZoomIntoView([sheet]);
  figma.notify(`✓ Wrote ${rampNames.length} brand ramps (${totalVars} variables) to "${COLLECTION_NAME}".`);
}

generate();
