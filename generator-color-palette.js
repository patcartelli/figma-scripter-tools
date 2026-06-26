// ─── Brand Color Palette Generator ───────────────────────────────────────────
// Generates tonal ramps (25–700 + source) for brand roles from seed colors,
// writes them as Figma variables, and renders a labeled swatch sheet.
//
// Run inside the Figma Scripter plugin. Self-contained — no imports.
//
// Edit SEEDS and CONFIG below, then Run.

// ─── User config ──────────────────────────────────────────────────────────────

const SEEDS = {
  primary:   '#005568',
  secondary: '#0085CC',
  error:     '#AB0D2F',
};

// Figma collection that receives the variables. Variables are named
// "<ramp>/<stop>" within it (e.g. "primary/25", "primary/source").
//
// ENGINEER — confirm how this maps to your Figma file before running. Two
// valid interpretations; pick one by editing the constant below:
//
//   (a) Literal collection named "palette/color/light", with variables
//       "primary/25", "primary/source", ...          ← current default
//
//   (b) Your real "palette" collection, with the path folded into the
//       variable name. In that case set:
//           COLLECTION_NAME = 'palette'
//       and change VAR_PREFIX below to 'color/light/' so variables land as
//       "color/light/primary/25", matching the Tokens Studio set path.
//
// If the collection doesn't exist it is created; existing variables are
// updated in place so re-running is safe (no duplicates — see setColorVariable).
const COLLECTION_NAME = 'palette/color/light';
const VAR_PREFIX      = '';   // e.g. 'color/light/' for interpretation (b)

const CONFIG = {
  swatchWidth:  120,
  colorHeight:   80,
  labelHeight:   40,
  gap:            8,
  columnGap:     24,
};

// ─── Tonal ramp definition ────────────────────────────────────────────────────
// Fixed OKLCH lightness curve. Tints lerp toward white, shades toward near-black.
// This is the same proven curve used across the design system's categorical
// palette; the seed lands in the 450–500 region. The seed is also stored
// verbatim as the "source" stop (the raw theme starting point — not generated).
// Naming rule: palette/* names the seed "source"; the color-roles/* layer then
// references it as a "main" role token (e.g. color-roles/secondary/main →
// palette/secondary/source).

const STEPS = [
  { label: '25',  kind: 'tint',  t: 0.95 },
  { label: '50',  kind: 'tint',  t: 0.90 },
  { label: '100', kind: 'tint',  t: 0.82 },
  { label: '200', kind: 'tint',  t: 0.70 },
  { label: '300', kind: 'tint',  t: 0.55 },
  { label: '350', kind: 'tint',  t: 0.45 },
  { label: '400', kind: 'tint',  t: 0.30 },
  { label: '450', kind: 'tint',  t: 0.13 },
  { label: '500', kind: 'shade', t: 0.35 },
  { label: '550', kind: 'shade', t: 0.55 },
  { label: '600', kind: 'shade', t: 0.75 },
  { label: '700', kind: 'shade', t: 0.95 },
];

const WHITE = { r: 1, g: 1, b: 1 };

// ─── Color math ───────────────────────────────────────────────────────────────

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.substring(0, 2), 16) / 255,
    g: parseInt(h.substring(2, 4), 16) / 255,
    b: parseInt(h.substring(4, 6), 16) / 255,
  };
}

function toHex(c) {
  return '#' + [c.r, c.g, c.b]
    .map(v => Math.round(v * 255).toString(16).padStart(2, '0').toUpperCase())
    .join('');
}

// OKLCH — perceptually uniform. Equal L looks equally bright across hues.
function linearize(c)     { return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
function gammaCompress(c) { return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055; }

function rgbToOklch(r, g, b) {
  const rl = linearize(r), gl = linearize(g), bl = linearize(b);
  const l = Math.cbrt(0.4122214708 * rl + 0.5363325363 * gl + 0.0514459929 * bl);
  const m = Math.cbrt(0.2119034982 * rl + 0.6806995451 * gl + 0.1073969566 * bl);
  const s = Math.cbrt(0.0883024619 * rl + 0.2817188376 * gl + 0.6299787005 * bl);
  const L =  0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s;
  const a =  1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s;
  const bv = 0.0259040371 * l + 0.1784937658 * m - 0.2040076308 * s;
  return [L, Math.sqrt(a * a + bv * bv), Math.atan2(bv, a)];
}

function oklchToRgb(L, C, H) {
  const a = C * Math.cos(H), bv = C * Math.sin(H);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * bv;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * bv;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * bv;
  const rl =  4.0767416621 * (l_*l_*l_) - 3.3077115913 * (m_*m_*m_) + 0.2309699292 * (s_*s_*s_);
  const gl = -1.2684380046 * (l_*l_*l_) + 2.6097574011 * (m_*m_*m_) - 0.3413193965 * (s_*s_*s_);
  const bl = -0.0041960863 * (l_*l_*l_) - 0.7034186147 * (m_*m_*m_) + 1.7076147010 * (s_*s_*s_);
  return {
    r: Math.max(0, Math.min(1, gammaCompress(rl))),
    g: Math.max(0, Math.min(1, gammaCompress(gl))),
    b: Math.max(0, Math.min(1, gammaCompress(bl))),
  };
}

// Tint toward white (L→1, C→0). t=0 → seed, t=1 → white.
function tintOklch(c, t) {
  const [L, C, H] = rgbToOklch(c.r, c.g, c.b);
  return oklchToRgb(L + (1 - L) * t, C * (1 - t), H);
}

// Shade toward near-black (L→0.03, C scaled). t=0 → seed, t=1 → near-black.
function shadeOklch(c, t) {
  const [L, C, H] = rgbToOklch(c.r, c.g, c.b);
  if (L <= 0.03) return { r: c.r, g: c.g, b: c.b };
  const targetL = L + (0.03 - L) * t;
  return oklchToRgb(targetL, C * (targetL / L), H);
}

function stepColor(seedRgb, step) {
  return step.kind === 'tint' ? tintOklch(seedRgb, step.t) : shadeOklch(seedRgb, step.t);
}

// ─── Figma variables ──────────────────────────────────────────────────────────

function findOrCreateCollection(name) {
  const existing = figma.variables.getLocalVariableCollections().find(c => c.name === name);
  return existing || figma.variables.createVariableCollection(name);
}

// Create-or-update a COLOR variable by name within a collection.
// Idempotent on write: re-running updates existing variables in place rather
// than duplicating them. Note it does NOT prune — if you remove a seed from
// SEEDS and re-run, variables created on a previous run are left untouched
// (stale), never auto-deleted. Pruning is intentionally omitted because
// deleting variables other nodes may reference is the dangerous direction.
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
    const def = tmp.fontName;             // a fresh node's default, single FontName
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

// Builds one swatch with its color block bound to `variable`.
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

// ─── Main ─────────────────────────────────────────────────────────────────────

async function generate() {
  const fonts = await resolveFonts();
  const collection = findOrCreateCollection(COLLECTION_NAME);

  const { swatchWidth: SW, colorHeight: CH, labelHeight: LH, gap, columnGap } = CONFIG;
  const swatchH = CH + LH;

  const ramps = Object.keys(SEEDS);
  const rows  = STEPS.length + 1;   // stops + source

  const totalW = ramps.length * SW + (ramps.length - 1) * columnGap;
  const totalH = 40 + rows * (swatchH + gap);

  const sheet = figma.createFrame();
  sheet.name = 'Brand Palette';
  sheet.fills = [];
  sheet.clipsContent = false;
  sheet.resize(totalW, totalH);
  sheet.x = figma.viewport.center.x - totalW / 2;
  sheet.y = figma.viewport.center.y - totalH / 2;
  figma.currentPage.appendChild(sheet);

  let totalVars = 0;

  for (let i = 0; i < ramps.length; i++) {
    const rampName = ramps[i];
    const seedHex  = SEEDS[rampName].toUpperCase();
    const seedRgb  = hexToRgb(seedHex);
    const colX     = i * (SW + columnGap);

    addText(sheet, rampName, 14, fonts.medium, 0.10, colX, 0);

    let y = 40;

    // Generated stops 25–700
    for (const step of STEPS) {
      const rgb = stepColor(seedRgb, step);
      const hex = toHex(rgb);
      const variable = setColorVariable(collection, `${VAR_PREFIX}${rampName}/${step.label}`, rgb);
      buildSwatch(sheet, step.label, hex, variable, colX, y, fonts);
      totalVars++;
      y += swatchH + gap;
    }

    // source — raw seed hex, stored verbatim (the theme starting point; not generated).
    // palette/* names this stop "source"; color-roles/* references it as "main".
    const sourceVar = setColorVariable(collection, `${VAR_PREFIX}${rampName}/source`, seedRgb);
    buildSwatch(sheet, 'source', seedHex, sourceVar, colX, y, fonts);
    totalVars++;
  }

  figma.currentPage.selection = [sheet];
  figma.viewport.scrollAndZoomIntoView([sheet]);
  figma.notify(`✓ Generated ${ramps.length} ramps (${totalVars} variables) in "${COLLECTION_NAME}".`);
}

generate();
