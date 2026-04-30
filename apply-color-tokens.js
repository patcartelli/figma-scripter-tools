// Figma Scripter: Apply Color Variable Tokens to Palette Swatches
//
// Disambiguates same-named tokens (e.g. "primary/main") across collections
// by walking up each swatch frame's ancestor chain for a frame named:
//   "Palette"     → prefers [palette/color] and [palette/dataviz]
//   "Color Roles" → prefers [color-roles] and [color-roles/dataviz]
//
// Text hint matching:
//   - Slash paths ("neutral/main", "primary/_states/hover") → tried first
//   - Bare words ("divider", "white") → tried if no slash-path match
//   - Hex strings ("#FFFFFF") → always ignored
//   - Numbers only ("100", "500") → ignored
//
// Debug: set DEBUG_LIST_VARS = true to print all COLOR variables and exit.

const DEBUG_LIST_VARS = false;
const FUZZY_THRESHOLD = 4; // max RGB Euclidean distance for color fallback

// ── Helpers ───────────────────────────────────────────────────────────────

function rgbToHex({ r, g, b }) {
  return [r, g, b]
    .map(v => Math.round(v * 255).toString(16).padStart(2, '0'))
    .join('').toUpperCase();
}

function blendOnWhite(hex, opacity) {
  const n = parseInt(hex, 16);
  const r = Math.round(((n >> 16) & 255) * opacity + 255 * (1 - opacity));
  const g = Math.round(((n >> 8)  & 255) * opacity + 255 * (1 - opacity));
  const b = Math.round((n & 255)  * opacity + 255 * (1 - opacity));
  return [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase();
}

function colorDist(hexA, hexB) {
  const na = parseInt(hexA, 16), nb = parseInt(hexB, 16);
  const dr = ((na >> 16) & 255) - ((nb >> 16) & 255);
  const dg = ((na >> 8)  & 255) - ((nb >> 8)  & 255);
  const db = (na & 255)  - (nb & 255);
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

// Normalize: lowercase, strip spaces and dashes/underscores (not slashes).
function norm(s) {
  return s.toLowerCase().replace(/\s+/g, '').replace(/[-_]/g, '');
}

// ── Hint expansion ────────────────────────────────────────────────────────
// Converts shorthand hint text into candidate variable name strings.

function expandHint(hint) {
  const variants = [hint];

  // dv03 (bare, no suffix) → dv/03, dv/03/main, 03/main
  const dvBareMatch = hint.match(/^dv(\d+)$/i);
  if (dvBareMatch) {
    const num = dvBareMatch[1];
    variants.push(`dv/${num}/main`, `dv/${num}`, `${num}/main`, `${num}`);
  }

  // dv03/xxx (compact) → dv/03/xxx, dataviz/03/xxx, 03/xxx
  const dvCompactMatch = hint.match(/^dv(\d+)\/(.*)/i);
  if (dvCompactMatch) {
    const num = dvCompactMatch[1], rest = dvCompactMatch[2];
    variants.push(`dv/${num}/${rest}`, `dataviz/${num}/${rest}`, `${num}/${rest}`);
  }

  // dv/01/xxx → dataviz/01/xxx, 01/xxx
  const dvSlashMatch = hint.match(/^dv\/(\d+)\/(.*)/i);
  if (dvSlashMatch) {
    const num = dvSlashMatch[1], rest = dvSlashMatch[2];
    variants.push(`dataviz/${num}/${rest}`, `${num}/${rest}`);
  }

  // primary/_states/hover → primary/states/hover (strip leading _ on segment)
  variants.push(hint.replace(/\/_/g, '/'));

  return [...new Set(variants)];
}

// ── Variable lookup maps ──────────────────────────────────────────────────
// Three maps: one per collection group + one universal fallback.
//   palette     → [palette/color], [palette/dataviz]
//   colorRoles  → [color-roles], [color-roles/dataviz]
//   any         → everything (used when no ancestor context is found)

const allVars = figma.variables.getLocalVariables('COLOR');

if (DEBUG_LIST_VARS) {
  console.log(`Found ${allVars.length} COLOR variables:\n`);
  for (const v of allVars) {
    const col = figma.variables.getVariableCollectionById(v.variableCollectionId);
    const rgba = resolveVarColor(v);
    const hex  = rgba ? rgbToHex(rgba) : '??????';
    console.log(`  [${col ? col.name : '?'}]  ${v.name}  →  #${hex}`);
  }
  throw new Error('Debug mode — set DEBUG_LIST_VARS = false to run normally.');
}

// Resolve a variable's color, following alias chains.
function resolveVarColor(variable) {
  const collection = figma.variables.getVariableCollectionById(variable.variableCollectionId);
  if (!collection) return null;
  let value = variable.valuesByMode[collection.defaultModeId];
  let hops = 10;
  while (value && typeof value === 'object' && value.type === 'VARIABLE_ALIAS' && hops-- > 0) {
    const av = figma.variables.getVariableById(value.id);
    if (!av) break;
    const ac = figma.variables.getVariableCollectionById(av.variableCollectionId);
    if (!ac) break;
    value = av.valuesByMode[ac.defaultModeId];
  }
  return value && typeof value === 'object' && 'r' in value ? value : null;
}

// Add a variable to a lookup map under all relevant name keys.
function indexVar(map, variable, collectionName) {
  const fullName = collectionName ? `${collectionName}/${variable.name}` : variable.name;

  for (const nameStr of [fullName, variable.name]) {
    const key = norm(nameStr);
    if (!map.has(key)) map.set(key, variable);

    // Also index every trailing sub-path: "primary/main", "main"
    const parts = nameStr.split('/');
    for (let i = 1; i < parts.length; i++) {
      const subKey = norm(parts.slice(i).join('/'));
      if (!map.has(subKey)) map.set(subKey, variable);
    }
  }
}

const mapPalette    = new Map(); // palette/color + palette/dataviz
const mapColorRoles = new Map(); // color-roles + color-roles/dataviz
const mapAny        = new Map(); // all variables
const byHex         = new Map(); // hex → variable[] (for color fallback)

for (const variable of allVars) {
  const col     = figma.variables.getVariableCollectionById(variable.variableCollectionId);
  const colName = col ? col.name : '';
  const colNorm = colName.toLowerCase().replace(/\s+/g, '').replace(/[-_]/g, '');

  // Route to collection-specific map
  if (colNorm.startsWith('palette')) {
    indexVar(mapPalette, variable, colName);
  } else if (colNorm.startsWith('colorroles') || colNorm.startsWith('color-roles')) {
    indexVar(mapColorRoles, variable, colName);
  }
  indexVar(mapAny, variable, colName);

  // Index by resolved hex for color fallback
  const rgba = resolveVarColor(variable);
  if (rgba) {
    const hex = rgbToHex(rgba);
    if (!byHex.has(hex)) byHex.set(hex, []);
    byHex.get(hex).push(variable);
  }
}

// ── Collection context ────────────────────────────────────────────────────
// Walk up the ancestor chain to find "Palette" or "Color Roles".

function getCollectionContext(node) {
  let current = node.parent;
  while (current && current.type !== 'PAGE') {
    const name = current.name.toLowerCase().trim();
    if (name === 'palette') return 'palette';
    if (name === 'color roles') return 'color-roles';
    current = current.parent;
  }
  return null;
}

function mapForContext(context) {
  if (context === 'palette')      return mapPalette;
  if (context === 'color-roles')  return mapColorRoles;
  return mapAny;
}

// ── Variable resolution ───────────────────────────────────────────────────

function findVarByHint(hint, context) {
  const primary   = mapForContext(context);
  const fallback  = mapAny;
  const variants  = expandHint(hint);
  const prefixes  = ['', 'color-roles/', 'color-roles/dataviz/', 'palette/color/', 'palette/dataviz/'];

  for (const map of [primary, fallback]) {
    for (const variant of variants) {
      for (const prefix of prefixes) {
        const key = norm(prefix + variant);
        if (map.has(key)) return map.get(key);
      }
    }
  }
  return null;
}

function findVarByColor(fillHex, effectiveOpacity, context) {
  const maps = context ? [mapForContext(context), mapAny] : [mapAny];

  // Exact fill color
  if (byHex.has(fillHex)) {
    const matches = byHex.get(fillHex);
    if (matches.length === 1) return matches[0];
    // Ambiguous — try to prefer the context collection
    if (context) {
      const preferred = mapForContext(context);
      const found = matches.find(v => preferred.has(norm(v.name)));
      if (found) return found;
    }
  }

  // Blended effective color (opacity tint on white)
  if (effectiveOpacity < 0.999) {
    const blended = blendOnWhite(fillHex, effectiveOpacity);
    if (byHex.has(blended)) {
      const matches = byHex.get(blended);
      if (matches.length === 1) return matches[0];
    }
  }

  // Fuzzy match — only if unambiguous
  let best = null, bestDist = Infinity;
  for (const [styleHex, vars] of byHex) {
    const d = colorDist(fillHex, styleHex);
    if (d < bestDist && d <= FUZZY_THRESHOLD) {
      bestDist = d;
      best = vars.length === 1 ? vars[0] : null;
    }
  }
  return best;
}

// ── Swatch frame processing ───────────────────────────────────────────────

const stats = { applied: 0, notFound: 0, noFill: 0 };

function isHex(t)     { return /^#[0-9a-f]{3,8}$/i.test(t); }
function isNumeric(t) { return /^\d+$/.test(t); }

function processSwatchFrame(frame) {
  const rects   = [];
  const allText = [];

  function gather(node, depth) {
    for (const child of node.children || []) {
      if (child.type === 'RECTANGLE')           rects.push(child);
      else if (child.type === 'TEXT')           allText.push(child.characters.trim());
      else if (depth < 2 && 'children' in child) gather(child, depth + 1);
    }
  }
  gather(frame, 0);

  if (rects.length === 0) return;

  // Slash-path hints tried first, then bare words as fallback
  const slashHints = allText.filter(t => t.includes('/') && !isHex(t));
  const bareHints  = allText.filter(t => !t.includes('/') && !isHex(t) && !isNumeric(t) && t.length > 1);

  // Determine collection context from ancestor frame names
  const context = getCollectionContext(frame);

  for (const rect of rects) {
    if (!rect.fills || rect.fills.length === 0) { stats.noFill++; continue; }

    const solidFill = rect.fills.find(f => f.type === 'SOLID' && f.visible !== false);
    if (!solidFill) { stats.noFill++; continue; }

    const fillHex        = rgbToHex(solidFill.color);
    const fillOpacity    = solidFill.opacity  !== undefined ? solidFill.opacity  : 1;
    const nodeOpacity    = rect.opacity       !== undefined ? rect.opacity       : 1;
    const effectiveOpacity = fillOpacity * nodeOpacity;

    let variable = null;

    // 1. Slash-path hints (most specific)
    for (const hint of slashHints) {
      variable = findVarByHint(hint, context);
      if (variable) break;
    }

    // 2. Bare-word hints (e.g. "divider", "white")
    if (!variable) {
      for (const hint of bareHints) {
        variable = findVarByHint(hint, context);
        if (variable) break;
      }
    }

    // 3. Color fallback
    if (!variable) {
      variable = findVarByColor(fillHex, effectiveOpacity, context);
    }

    if (variable) {
      try {
        const newFills = rect.fills.map(f =>
          f === solidFill || (f.type === 'SOLID' && f.visible !== false)
            ? figma.variables.setBoundVariableForPaint(f, 'color', variable)
            : f
        );
        rect.fills = newFills;
        stats.applied++;

        const col     = figma.variables.getVariableCollectionById(variable.variableCollectionId);
        const colName = col ? col.name : '?';
        const ctx     = context ? ` (ctx: ${context})` : '';
        console.log(`[OK] "${frame.name}" → [${colName}] ${variable.name}${ctx}  (#${fillHex} @ ${Math.round(effectiveOpacity * 100)}%)`);
      } catch (e) {
        console.log(`[ERR] "${frame.name}": ${e.message}`);
        stats.notFound++;
      }
    } else {
      stats.notFound++;
      const hints = [...slashHints, ...bareHints].join(', ') || '(none)';
      const ctx   = context ? ` ctx:${context}` : '';
      console.log(`[--] "${frame.name}"${ctx} — no match  #${fillHex} @ ${Math.round(effectiveOpacity * 100)}%  hints: [${hints}]`);
    }
  }
}

// ── Walk the scope ────────────────────────────────────────────────────────

function isSwatchFrame(node) {
  if (!('children' in node)) return false;
  let hasRect = false, hasText = false;
  for (const child of node.children) {
    if (child.type === 'RECTANGLE') hasRect = true;
    if (child.type === 'TEXT')      hasText = true;
    if (hasRect && hasText) return true;
    if ('children' in child) {
      for (const grand of child.children) {
        if (grand.type === 'RECTANGLE') hasRect = true;
        if (grand.type === 'TEXT')      hasText = true;
        if (hasRect && hasText) return true;
      }
    }
  }
  return false;
}

function walk(node, depth) {
  if (depth > 8 || !('children' in node)) return;
  if (isSwatchFrame(node)) {
    processSwatchFrame(node);
    return;
  }
  for (const child of node.children) walk(child, depth + 1);
}

const scope = figma.currentPage.selection.length > 0
  ? figma.currentPage.selection
  : figma.currentPage.children;

for (const node of scope) walk(node, 0);

// ── Summary ───────────────────────────────────────────────────────────────

console.log('');
console.log(`Done.  Applied: ${stats.applied}  |  Not found: ${stats.notFound}  |  No fill: ${stats.noFill}`);
if (stats.notFound > 0) {
  console.log('Tip: [--] lines show unmatched swatches. Set DEBUG_LIST_VARS = true to inspect available variables.');
}
