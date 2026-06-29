// ─── Dataviz Categorical Palette Generator ───────────────────────────────────
// Generates perceptually uniform OKLCH ramps (25–700 + source) for categorical
// dataviz palettes from seed colors, writes them as Figma variables, and renders
// a labeled swatch sheet.
//
// Run inside the Figma Scripter plugin. Self-contained — no imports.
//
// Edit SEEDS and CONFIG below, then Run.

// ─── User config ──────────────────────────────────────────────────────────────

// Keyed by categorical palette number (string keys preserve leading zeros).
const SEEDS = {
  '10': '#1F932F',
  '11': '#8BE1F0',
  '12': '#F8A87A',
  '13': '#925BF5',
  // add more as needed, e.g. '14': '#......'
};

// Raw ramp values are written here, named "<num>/<stop>" (e.g. "10/25", "10/source").
//
// ENGINEER — confirm how this maps to your Figma file before running. Two
// valid interpretations; pick one by editing the constants below:
//
//   (a) Literal collection named "palette/categorical", with variables
//       "10/25", "10/source", ...                    ← current default
//
//   (b) Your real "palette" collection, with the path folded into the
//       variable name. In that case set:
//           PALETTE_COLLECTION = 'palette'
//       and VAR_PREFIX = 'categorical/' so variables land as
//       "categorical/10/25", matching the Tokens Studio set path.
//
// Created if missing; existing variables are updated in place (re-run safe —
// see setColorVariable; no pruning of stale variables).
const PALETTE_COLLECTION = 'palette/categorical';
const VAR_PREFIX         = '';   // e.g. 'categorical/' for interpretation (b)

// Display ordering for the swatch sheet sections (left → right by prefix match).
const COLLECTION_ORDER = ['color-roles/categorical', 'palette/categorical'];

const CONFIG = {
  swatchWidth:  120,
  colorHeight:   80,
  labelHeight:   40,
  hGap:           8,
  vGap:           8,
  groupGap:      24,
  sectionGap:    48,
  columnGap:     16,
};

// ─── Tonal ramp definition ────────────────────────────────────────────────────
// Fixed OKLCH lightness curve — light stops high in L, dark stops compressed
// toward near-black. The seed is the visual anchor (lands in the 450–500 region)
// and is also stored verbatim as the "source" stop (the raw starting point; not generated).
// Naming rule: palette/* names the seed "source"; the color-roles/* layer then
// references it as a "main" role token (e.g. color-roles/categorical/10/main →
// palette/categorical/10/source).

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

// OKLCH — perceptually uniform. Equal L looks equally bright across hues:
// essential for dataviz where categories must carry equal visual weight.
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

function tintOklch(c, t) {
  const [L, C, H] = rgbToOklch(c.r, c.g, c.b);
  return oklchToRgb(L + (1 - L) * t, C * (1 - t), H);
}

function shadeOklch(c, t) {
  const [L, C, H] = rgbToOklch(c.r, c.g, c.b);
  if (L <= 0.03) return { r: c.r, g: c.g, b: c.b };
  const targetL = L + (0.03 - L) * t;
  return oklchToRgb(targetL, C * (targetL / L), H);
}

function stepColor(seedRgb, step) {
  return step.kind === 'tint' ? tintOklch(seedRgb, step.t) : shadeOklch(seedRgb, step.t);
}

// ─── WCAG contrast math ───────────────────────────────────────────────────────

function relativeLuminance({ r, g, b }) {
  const lin = c => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function contrastRatio(c1, c2) {
  const [hi, lo] = [relativeLuminance(c1), relativeLuminance(c2)].sort((a, b) => b - a);
  return (hi + 0.05) / (lo + 0.05);
}

const MIN_CONTRAST     = 4.5;
const SHADE_CANDIDATES = ['500', '550', '600', '700'];
const BLACK_RGB        = { r: 0, g: 0, b: 0 };

// Returns the lightest shade step (500→550→600→700→black) that clears MIN_CONTRAST
// against lightRgb. Returns { stop, ratio } where stop is '500'/'550'/…/'black',
// or null when no candidate passes.
function pickDarkShade(seedRgb, lightRgb) {
  for (const stop of SHADE_CANDIDATES) {
    const step = STEPS.find(s => s.label === stop);
    if (!step) continue;
    const rgb = stepColor(seedRgb, step);
    const ratio = contrastRatio(rgb, lightRgb);
    if (ratio >= MIN_CONTRAST) return { stop, rgb, ratio };
  }
  // Last resort: pure black
  const ratio = contrastRatio(BLACK_RGB, lightRgb);
  if (ratio >= MIN_CONTRAST) return { stop: 'black', rgb: BLACK_RGB, ratio };
  return null;
}

// ─── Figma variables ──────────────────────────────────────────────────────────

function findOrCreateCollection(name) {
  const existing = figma.variables.getLocalVariableCollections().find(c => c.name === name);
  return existing || figma.variables.createVariableCollection(name);
}

// Create-or-update a COLOR variable by name within a collection.
// Only COLOR-type variables are written; other types are never touched.
// Idempotent on write: re-running updates existing variables in place rather
// than duplicating them. It does NOT prune — removing a seed from SEEDS and
// re-running leaves previously-created variables untouched (stale), never
// auto-deleted, since deleting referenced variables is the dangerous direction.
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

// ─── color-roles/categorical mapping (Bluefish — not yet defined) ─────────────
// TODO: define color-roles/categorical mappings
// Will map raw palette/categorical ramps to semantic roles in two collections
// (color-roles/categorical/light and color-roles/categorical/dark). The Bluefish
// team owns the final role structure; hook the role-writing + mode handling here.
//
// Naming: palette/* stores the seed as "source"; the color-roles/* role that
// references it is named "main" (e.g. color-roles/categorical/10/main →
// palette/categorical/10/source) so the two don't collide in a flattened namespace.
//
// Side-by-side light/dark mode columns require a Figma plan supporting variable modes.
function writeCategoricalRoles(/* paletteVarsByNumber, fonts, ... */) {
  // intentionally empty until the role structure is finalized
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function generate() {
  const fonts = await resolveFonts();
  const collection = findOrCreateCollection(PALETTE_COLLECTION);

  const { swatchWidth: SW, colorHeight: CH, labelHeight: LH, vGap, groupGap, columnGap } = CONFIG;
  const swatchH = CH + LH;

  // Numeric-aware ordering of palette keys (e.g. "01" < "02" < "10").
  const numbers = Object.keys(SEEDS).sort((a, b) => {
    const na = parseInt(a, 10), nb = parseInt(b, 10);
    return na !== nb ? na - nb : a.localeCompare(b);
  });

  const rows   = STEPS.length + 1;  // stops + source
  const totalW = numbers.length * SW + (numbers.length - 1) * columnGap;
  const totalH = 40 + rows * (swatchH + vGap);

  const sheet = figma.createFrame();
  sheet.name = 'Dataviz Categorical Palette';
  sheet.fills = [];
  sheet.clipsContent = false;
  sheet.resize(totalW, totalH);
  sheet.x = figma.viewport.center.x - totalW / 2;
  sheet.y = figma.viewport.center.y - totalH / 2;
  figma.currentPage.appendChild(sheet);

  const paletteVarsByNumber = {};
  let totalVars = 0;
  const contrastResults = [];  // { num, seedHex, stop, ratio, status }

  for (let i = 0; i < numbers.length; i++) {
    const num     = numbers[i];
    const seedHex = SEEDS[num].toUpperCase();
    const seedRgb = hexToRgb(seedHex);
    const colX    = i * (SW + columnGap);

    addText(sheet, num, 14, fonts.medium, 0.10, colX, 0);

    const vars = {};
    let y = 40;

    for (const step of STEPS) {
      const rgb = stepColor(seedRgb, step);
      const hex = toHex(rgb);
      const variable = setColorVariable(collection, `${VAR_PREFIX}${num}/${step.label}`, rgb);
      vars[step.label] = variable;
      buildSwatch(sheet, step.label, hex, variable, colX, y, fonts);
      totalVars++;
      y += swatchH + vGap;
    }

    // Contrast check: find the lightest shade that clears 4.5:1 against the 100 (light) step.
    // Used as the recommended dark role stop (e.g. for color-roles/categorical dark/onLight).
    const lightRgb = stepColor(seedRgb, STEPS.find(s => s.label === '100'));
    const found    = pickDarkShade(seedRgb, lightRgb);
    contrastResults.push({
      num,
      seedHex,
      stop:   found ? found.stop  : null,
      ratio:  found ? found.ratio : null,
      status: !found          ? 'UNFIXABLE'
            : found.stop === '500' ? 'PASS'
            :                     'BUMPED',
    });

    // source — raw seed hex, stored verbatim (the theme starting point; not generated).
    // palette/* names this stop "source"; color-roles/* references it as "main".
    const sourceVar = setColorVariable(collection, `${VAR_PREFIX}${num}/source`, seedRgb);
    vars.source = sourceVar;
    buildSwatch(sheet, 'source', seedHex, sourceVar, colX, y, fonts);
    totalVars++;

    paletteVarsByNumber[num] = vars;
  }

  // ─── Contrast report ────────────────────────────────────────────────────────
  const bumped    = contrastResults.filter(r => r.status === 'BUMPED');
  const unfixable = contrastResults.filter(r => r.status === 'UNFIXABLE');

  console.log('─── WCAG AA Contrast Report (dark shade on 100/light, ≥4.5:1) ───');
  console.log('series  seed      dark stop  ratio   status');
  for (const r of contrastResults) {
    const ratio  = r.ratio != null ? r.ratio.toFixed(2) + ':1' : '—';
    const stop   = r.stop ?? '—';
    const flag   = r.status === 'PASS' ? '✓' : r.status === 'BUMPED' ? '⚠ bumped' : '❌ unfixable';
    console.log(`  ${String(r.num).padEnd(6)}  ${r.seedHex}  ${stop.padEnd(9)}  ${ratio.padEnd(7)}  ${flag}`);
  }
  if (bumped.length === 0 && unfixable.length === 0) {
    console.log(`All ${contrastResults.length} series pass at 500. No bumps needed.`);
  } else {
    if (bumped.length)    console.log(`Bumped: ${bumped.map(r => r.num).join(', ')} — use ${bumped.map(r => r.stop).join('/')} for dark role`);
    if (unfixable.length) console.log(`UNFIXABLE: ${unfixable.map(r => r.num).join(', ')} — manual review required`);
  }
  console.log(JSON.stringify(contrastResults, null, 2));

  // Semantic role mappings — deferred until the Bluefish role structure lands.
  writeCategoricalRoles(/* paletteVarsByNumber, fonts */);

  figma.currentPage.selection = [sheet];
  figma.viewport.scrollAndZoomIntoView([sheet]);

  const contrastSummary = unfixable.length
    ? ` ❌ ${unfixable.length} unfixable — see console`
    : bumped.length
    ? ` ⚠️ ${bumped.length} bumped to ${[...new Set(bumped.map(r => r.stop))].join('/')} — see console`
    : ' — all contrast OK';
  figma.notify(`✓ Generated ${numbers.length} categorical ramps (${totalVars} variables) in "${PALETTE_COLLECTION}"${contrastSummary}.`);
}

generate();
