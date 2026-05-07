# Codebase Structure

**Analysis Date:** 2026-05-07

## Directory Layout

```
figma-scripter-tools/
├── color-scale-generator.js    # Figma Scripter: generate OKLCH color scale rows
├── swatch-generator.js         # Figma Scripter: render full swatch sheet from variables
├── token-exporter.js           # Figma Scripter: export swatch fills to W3C token JSON
├── apply-color-tokens.js       # Figma Scripter: bind fills to matching color variables
├── update-dataviz-contrast-tokens.js  # Figma Scripter: update contrast + onLight tokens in-plugin
├── regenerate-palette-tokens.js       # CLI Node.js: batch-regen dataviz palette steps from main
├── fix-onlight-contrast.js            # CLI Node.js: pick passing WCAG AA shade for onLight
├── wire-color-role-refs.js            # CLI Node.js: replace hex with palette token references
├── README.md
├── explorations/               # Static HTML UI prototypes (not part of token pipeline)
│   ├── index.html
│   ├── variation-a.html
│   ├── variation-b.html
│   └── variation-c.html
└── .planning/                  # GSD planning documents
    └── codebase/
```

## Directory Purposes

**Root (project root):**
- Purpose: All executable scripts live directly at the root — no src/ subdirectory
- Contains: Figma Scripter scripts (paste-and-run) and Node.js CLI scripts
- Key files: All `.js` files

**`explorations/`:**
- Purpose: Self-contained static HTML prototypes for UI layout concepts
- Contains: `index.html` (navigation), `variation-a/b/c.html` (distinct layout explorations)
- Generated: No — hand-authored
- Committed: Yes
- Relationship to scripts: None — these are visual references only, not part of the token pipeline

**`.planning/codebase/`:**
- Purpose: GSD codebase map documents (auto-generated)
- Contains: `ARCHITECTURE.md`, `STRUCTURE.md`, and other analysis docs
- Generated: Yes (by GSD map-codebase command)
- Committed: Yes

**`.claude/`:**
- Purpose: Claude Code local settings
- Contains: `settings.local.json`
- Committed: No (project-local only)

## Key File Locations

**Figma Scripter Scripts (in-plugin, paste-and-run):**
- `color-scale-generator.js`: Generates tint/shade scale rows on the Figma canvas
- `swatch-generator.js`: Renders all local color variables as a labeled swatch sheet
- `token-exporter.js`: Exports selected swatch row fills to W3C JSON via console
- `apply-color-tokens.js`: Binds swatch rectangle fills to matching Figma color variables
- `update-dataviz-contrast-tokens.js`: Updates `contrast` and `onLight` variables directly in the Figma file

**CLI Scripts (Node.js, run locally):**
- `regenerate-palette-tokens.js`: Regenerates all dataviz palette steps from `main` using OKLCH
- `fix-onlight-contrast.js`: Audits and corrects `onLight` values in the token JSON for WCAG AA
- `wire-color-role-refs.js`: Rewrites color-role token values from hardcoded hex to palette token refs

**Configuration:**
- No `package.json` — no dependencies
- No `tsconfig.json` — plain JavaScript
- No `.eslintrc` / `.prettierrc` — no linting configured

**Token Data (external, not in repo):**
- Default path: `~/bf-tokens/tokens/tokens.json` (referenced by CLI scripts)
- Alternate paths accepted as positional CLI arguments

## Naming Conventions

**Files:**
- Figma Scripter scripts: `kebab-case.js`, named for their primary action (e.g. `color-scale-generator.js`, `apply-color-tokens.js`)
- CLI scripts: `kebab-case.js`, prefixed with verb (e.g. `regenerate-`, `fix-`, `wire-`)
- HTML explorations: `kebab-case.html`

**Functions:**
- camelCase for all functions (e.g. `buildRow`, `tintOklch`, `resolveVariableColor`, `getColorTokenSections`)
- Verb-noun naming: `buildRow()`, `createSwatch()`, `renderSections()`, `findVarByHint()`, `resolveVarColor()`

**Variables:**
- SCREAMING_SNAKE_CASE for top-level constants: `USE_PALETTE_VARIABLES`, `STEPS`, `SW`, `CH`, `FUZZY_THRESHOLD`, `LIGHT_MAP`, `DARK_MAP`
- camelCase for local variables: `rowWidth`, `swatchX`, `tokenLabel`
- CONFIG object pattern in `swatch-generator.js`: `const CONFIG = { swatchWidth, colorHeight, ... }`

**Token Naming (design tokens):**
- Slash-delimited paths: `palette/dataviz/01/main`, `color-roles/dataviz/light`, `dv/01/500`
- Numeric group keys for dataviz groups: `01`, `02`, ... `30`
- Step labels: `25`, `50`, `100`, `200`, `300`, `350`, `400`, `450`, `main`, `500`, `550`, `600`, `700`

**Figma Canvas Nodes:**
- Row frames named after color (e.g. `"01"`, `"neutral"`)
- Swatch child frames named as token path: `"dv/01/500"`
- Inner nodes named by role: `"color"` (rectangle), `"label"` (frame)

## Where to Add New Code

**New Figma Scripter script:**
- Add as a new `.js` file at the project root (e.g. `my-new-script.js`)
- Define all helpers inline — no imports available in Scripter
- If OKLCH math is needed, copy the pipeline from `color-scale-generator.js` (lines 53–100)
- Use `figma.notify()` for user-facing messages, `console.log()` for debug output
- Add a shebang-free header comment block describing usage and mode flags

**New CLI script:**
- Add as a new `.js` file at the project root with `#!/usr/bin/env node` shebang
- Use ESM syntax: `import fs from 'fs'; import path from 'path'; import os from 'os';`
- Accept `input` and `output` paths as positional CLI args, defaulting to `~/bf-tokens/tokens/tokens.json`
- Pattern: `const [,, inputArg, outputArg] = process.argv;`

**New step in the token pipeline:**
- Palette math changes: edit `regenerate-palette-tokens.js` (STEPS array, lines 66–79)
- Color-role mapping changes: edit `wire-color-role-refs.js` (`LIGHT_MAP` / `DARK_MAP`, lines 20–21)
- Contrast policy changes: edit `fix-onlight-contrast.js` (`CANDIDATES` array, line 29)

**New swatch section:**
- `swatch-generator.js`: add a new `else if` branch in `getColorTokenSections()` (lines 93–102) to map a new variable name prefix to a section name

**New UI exploration:**
- Add `variation-x.html` to `explorations/` and link it from `explorations/index.html`

## Special Directories

**`explorations/`:**
- Purpose: Standalone HTML UI prototypes, unrelated to the token pipeline
- Generated: No
- Committed: Yes

**`.planning/`:**
- Purpose: GSD planning and codebase analysis documents
- Generated: Yes (by GSD tooling)
- Committed: Yes

---

*Structure analysis: 2026-05-07*
