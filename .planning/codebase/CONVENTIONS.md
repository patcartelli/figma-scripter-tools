# Coding Conventions

**Analysis Date:** 2026-05-07

## Script Types

This codebase contains two distinct script categories with different conventions:

**Figma Scripter scripts** (run inside Figma's plugin sandbox):
- `color-scale-generator.js`, `apply-color-tokens.js`, `swatch-generator.js`, `token-exporter.js`, `update-dataviz-contrast-tokens.js`
- No `import` statements — rely on the global `figma` API
- Use `print()` (Scripter built-in) and `figma.notify()` for output
- Single-file, self-contained, no module system

**Node.js CLI scripts** (run locally on token JSON files):
- `fix-onlight-contrast.js`, `regenerate-palette-tokens.js`, `wire-color-role-refs.js`
- Use ES module syntax (`import fs from 'fs'`)
- Shebang line: `#!/usr/bin/env node`
- `console.log` / `console.warn` / `console.error` for output

## Naming Patterns

**Files:**
- `kebab-case.js` throughout — e.g., `color-scale-generator.js`, `fix-onlight-contrast.js`
- Names describe the action performed, not the data type

**Functions:**
- `camelCase` for all functions — e.g., `buildRow`, `resolveVariableColor`, `getColorTokenSections`
- Names are verb-first and descriptive: `findVarByHint`, `processSwatchFrame`, `renderSections`
- Pure color-math helpers use short descriptive names: `linearize`, `gammaCompress`, `tintOklch`, `shadeOklch`, `toHex`

**Constants:**
- `SCREAMING_SNAKE_CASE` for module-level constants and configuration values — e.g., `STEPS`, `FUZZY_THRESHOLD`, `MIN_CONTRAST`, `SHADE_STEPS`, `WHITE`, `BLACK`
- Layout constants in `color-scale-generator.js` use aligned column formatting:
  ```js
  const SW       = 120;  // swatch width
  const CH       = 80;   // color block height
  const H_GAP    = 8;    // gap between swatches
  ```
- Configuration object pattern used in `swatch-generator.js`:
  ```js
  const CONFIG = {
    swatchWidth: 120,
    colorHeight: 80,
    hGap:        8,
    ...
  }
  ```

**Variables:**
- `camelCase` for local variables — e.g., `rowWidth`, `colorName`, `fillHex`
- Short single-letter aliases for destructured layout values: `const { swatchWidth: SW, colorHeight: CH } = CONFIG`
- Single-char loop variables (`v`, `f`) used in short closures

**Debug flags:**
- Top-of-file boolean constants used as feature flags: `const DEBUG_LIST_VARS = false;` (`apply-color-tokens.js`)
- Toggle constants like `USE_PALETTE_VARIABLES` used for mode switching (`color-scale-generator.js`)

## Code Style

**Formatting:**
- No automated formatter detected (no `.prettierrc`, `.eslintrc`, `biome.json`, or `package.json`)
- Indentation: 2 spaces throughout all scripts
- Semicolons: inconsistent — `color-scale-generator.js` and `apply-color-tokens.js` use them; `swatch-generator.js` omits them
- Single quotes used in Figma Scripter scripts; double quotes in `swatch-generator.js`
- Trailing commas used in object/array literals where convenient

**Linting:**
- No linting configuration detected

**Line length:**
- No enforced limit; most lines are kept under ~100 chars

## Section Header Comments

All scripts use ASCII-art section dividers to separate logical blocks. Two styles exist:

**Triple-dash style** (`color-scale-generator.js`, `regenerate-palette-tokens.js`, `fix-onlight-contrast.js`, `token-exporter.js`):
```js
// ─── Helpers ─────────────────────────────────────────────────────────────────
```

**Double-dash style** (`apply-color-tokens.js`):
```js
// ── Helpers ───────────────────────────────────────────────────────────────
```

**Dash style** (`swatch-generator.js`):
```js
// --- Color Math Utilities ---
```

All section headers run to approximately column 80. Use the triple-dash style (`// ─── Name ───...`) when adding new scripts, as it is the dominant pattern.

## Import Organization

**Figma Scripter scripts:** No imports — all APIs are global (`figma`, `print`).

**Node.js scripts:** Standard library only, no third-party deps. Always imported at the top:
```js
import fs   from 'fs';
import path from 'path';
import os   from 'os';
```
Use aligned spacing when multiple imports share the same column width (see `regenerate-palette-tokens.js`, `wire-color-role-refs.js`).

## Null / Guard Patterns

Early-return guard at top of function is the standard idiom:
```js
function resolveVariableColor(v) {
  const collection = figma.variables.getVariableCollectionById(v.variableCollectionId);
  if (!collection) return null;
  const value = v.valuesByMode[collection.modes[0].modeId];
  if (!value) return null;
  ...
  return (typeof value === 'object' && 'r' in value) ? value : null;
}
```

Nullish coalescing (`??`) used for default fallbacks:
```js
const alpha = resolveVariableAlpha(fill) ?? (fill.opacity !== undefined ? fill.opacity : 1);
```

`|| []` used as safe fallback on potentially-undefined children:
```js
for (const child of node.children || []) {
```

## Error Handling

**Figma Scripter scripts:**
- User-facing errors shown via `figma.notify('⚠️ ...')` or `figma.notify('❌ ...')`
- No thrown exceptions except in debug mode (`throw new Error('Debug mode...')`)
- Silent skip with `continue` and optional `figma.notify` for per-item failures
- One `try/catch` block used when calling mutable Figma APIs (`rect.fills = ...`) in `apply-color-tokens.js`:
  ```js
  try {
    rect.fills = newFills;
    stats.applied++;
    console.log(`[OK] ...`);
  } catch (e) {
    console.log(`[ERR] "${frame.name}": ${e.message}`);
    stats.notFound++;
  }
  ```

**Node.js scripts:**
- Fatal errors use `console.error` + `process.exit(1)` for missing input
- Non-fatal issues use `console.warn`
- No try/catch — file parsing failures are allowed to throw naturally

## Logging

**Figma Scripter scripts:**
- `figma.notify(...)` — brief toast at bottom of Figma UI (success/error summary)
- `console.log(...)` — detailed per-item output to Figma console (prefixed with `[OK]`, `[ERR]`, `[--]`)
- `print(...)` — Scripter-specific alias for `console.log`; used in `swatch-generator.js` and `color-scale-generator.js`

**Node.js scripts:**
- `console.log(...)` — tabular summary output with `✓` prefix on success
- `console.warn(...)` — non-fatal warnings (skipped items)
- `console.error(...)` — fatal errors before `process.exit(1)`

**Output format conventions:**
- Success line prefix: `✓ N items updated → /path/to/file`
- Skipped items listed inline: `Skipped (no main): 03, 07`
- Per-item matching log in `apply-color-tokens.js`: `[OK]`, `[ERR]`, `[--]` prefixes

## Function Design

**Size:** Functions are small and single-purpose. Color math functions (`linearize`, `gammaCompress`, `rgbToOklch`, `oklchToRgb`) are 3–10 lines. Builder/renderer functions (`buildRow`, `createSwatch`, `renderSections`) are 30–60 lines.

**Parameters:** Positional arguments preferred over options objects for pure functions. Layout functions accept explicit `(x, y)` coordinates.

**Return Values:**
- Color math functions return objects `{ r, g, b }` or arrays `[r, g, b]` — both forms are used across scripts (see below under Concerns)
- Lookup/resolver functions return the found value or `null`

**Pure color math:** Color conversion functions (`linearize`, `gammaCompress`, `rgbToOklch`, `oklchToRgb`, `tintOklch`, `shadeOklch`, `toHex`) are duplicated across multiple files rather than shared — each script is self-contained by design (Figma Scripter has no module system).

## Comments

**Inline comments** used heavily for numeric constants:
```js
const SW = 120;  // swatch width
```

**Block comments** above function groups or logic branches explain the algorithm, not the syntax:
```js
// Tint: lerp OKLCH lightness toward white (L=1), chroma toward 0. t=0 → main, t=1 → white.
```

**File-level header comments** at the top of every script describe purpose, modes, and usage:
```js
// ─── Token Exporter ───────────────────────────────────────────────────────────
// Select row frames (e.g. "dv/01"), run script.
// Reads fill color from each swatch child, displays W3C token JSON in a panel.
```

JSDoc is not used. Comments are plain `//` style prose.

## Module Design

Each script is fully self-contained — no shared modules, no imports between scripts. This is required for Figma Scripter compatibility (paste-and-run). Node.js scripts duplicate any needed color math from the Figma Scripter versions.

No barrel files or index modules.

---

*Convention analysis: 2026-05-07*
