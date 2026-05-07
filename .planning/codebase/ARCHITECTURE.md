<!-- refreshed: 2026-05-07 -->
# Architecture

**Analysis Date:** 2026-05-07

## System Overview

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Figma Scripter Runtime (plugin host)                      │
│     Scripts pasted directly — no bundler, no imports, no module system      │
├──────────────────────┬──────────────────────┬───────────────────────────────┤
│  color-scale-        │  swatch-             │  apply-color-tokens.js        │
│  generator.js        │  generator.js        │  token-exporter.js            │
│  (canvas authoring)  │  (canvas authoring)  │  (canvas mutation / export)   │
└──────────┬───────────┴──────────┬───────────┴──────────┬────────────────────┘
           │                      │                       │
           ▼                      ▼                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     figma.* Plugin API (provided by host)                    │
│   figma.variables.*   figma.currentPage.*   figma.createFrame/Text/Rect     │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                     Node.js CLI Scripts (run locally)                        │
├───────────────────────┬──────────────────────┬──────────────────────────────┤
│  regenerate-palette-  │  fix-onlight-        │  wire-color-role-refs.js     │
│  tokens.js            │  contrast.js         │  (token ref rewriting)       │
│  (batch OKLCH regen)  │  (a11y pass/fail)    │                              │
└──────────┬────────────┴──────────┬───────────┴──────────┬────────────────────┘
           │                       │                       │
           ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│               tokens.json  (W3C Design Token format, on disk)                │
│               Default path: ~/bf-tokens/tokens/tokens.json                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| color-scale-generator | Generate OKLCH tint/shade scale rows on the Figma canvas from a main color | `color-scale-generator.js` |
| swatch-generator | Read all local color variables and render a full swatch sheet (light + dark columns) | `swatch-generator.js` |
| token-exporter | Walk selected swatch row frames and emit W3C token JSON to the console | `token-exporter.js` |
| apply-color-tokens | Bind existing rectangle fills to matching Figma color variables using hint text and color fallback | `apply-color-tokens.js` |
| regenerate-palette-tokens | CLI: re-derive all dataviz palette steps from their `main` hex using OKLCH math | `regenerate-palette-tokens.js` |
| fix-onlight-contrast | CLI: pick the lightest shade step that passes WCAG AA (4.5:1) against the light role | `fix-onlight-contrast.js` |
| wire-color-role-refs | CLI: replace hardcoded hex values in color-roles tokens with palette token references | `wire-color-role-refs.js` |

## Pattern Overview

**Overall:** Single-file, standalone scripts — no shared modules, no build step.

**Key Characteristics:**
- Each script is self-contained: all helpers are defined inline within the file
- Figma Scripter scripts use the synchronous/async Figma Plugin API (`figma.*`) and are pasted directly into the Scripter plugin
- CLI scripts use Node.js ESM (`import fs from 'fs'`) and operate on a `tokens.json` file on disk
- OKLCH color math (linearize → L/C/H → tint/shade → gammaCompress) is duplicated across `color-scale-generator.js` and `regenerate-palette-tokens.js` — it is not extracted into a shared module
- No package.json, no dependencies, no test runner

## Layers

**Figma Scripter Layer (in-plugin):**
- Purpose: Authoring and mutating the live Figma canvas and its variable collections
- Location: `color-scale-generator.js`, `swatch-generator.js`, `token-exporter.js`, `apply-color-tokens.js`, `update-dataviz-contrast-tokens.js`
- Contains: figma API calls, canvas frame/rect/text creation, variable reads and writes
- Depends on: Figma plugin host environment (`figma` global)
- Used by: Designer running the Scripter plugin manually

**CLI Layer (local Node.js):**
- Purpose: Batch-processing of design token JSON files outside Figma
- Location: `regenerate-palette-tokens.js`, `fix-onlight-contrast.js`, `wire-color-role-refs.js`
- Contains: `fs` I/O, OKLCH math, W3C token tree manipulation
- Depends on: Node.js 18+ (ESM `import`), token JSON file at `~/bf-tokens/tokens/tokens.json`
- Used by: Developer running `node <script>.js` from the terminal

**Explorations Layer (static HTML):**
- Purpose: Visual UI prototype references (not part of the token pipeline)
- Location: `explorations/index.html`, `explorations/variation-a.html`, `explorations/variation-b.html`, `explorations/variation-c.html`
- Contains: Self-contained HTML/CSS UI concept pages
- Depends on: Nothing (no JS framework, no build)
- Used by: Design reference only

## Data Flow

### Primary Token Generation Path (Figma Scripter)

1. Designer selects source color frames on canvas (or sets `USE_PALETTE_VARIABLES = true`)
2. `color-scale-generator.js` reads main color(s) from frame fills or `palette/##/main` variables
3. OKLCH tint/shade functions compute 13 scale steps per hue
4. `buildRow()` creates Figma frame + rectangle + text nodes on the current page
5. Designer selects generated row frames and runs `token-exporter.js`
6. `token-exporter.js` walks swatch children, reads fill colors, and writes W3C JSON to `console.log`
7. Designer copies JSON from console into a `.tokens.json` file

### Variable Binding Path (apply-color-tokens)

1. Designer selects swatch frames on canvas
2. `apply-color-tokens.js` walks the selection depth-first up to 8 levels
3. For each rectangle: extract hint text (slash-path or bare-word) from sibling text nodes
4. Look up matching Figma color variable using three strategies in priority order:
   a. Slash-path hint → `findVarByHint()` with collection context from ancestor frame names
   b. Bare-word hint → same lookup
   c. Color fallback → `findVarByColor()` using exact hex, blended opacity, then fuzzy distance
5. If a variable is found, `figma.variables.setBoundVariableForPaint()` writes the binding

### CLI Token Refresh Path

1. `regenerate-palette-tokens.js` reads `tokens.json`, finds `palette/dataviz` groups
2. For each numeric group key, reads `main.$value` hex; derives all 12 steps via OKLCH
3. Writes updated token objects back to `tokens.json` in place
4. `wire-color-role-refs.js` reads `tokens.json`, replaces hex values in `color-roles/dataviz/light` and `/dark` with token references (e.g. `{01.main}`)
5. `fix-onlight-contrast.js` reads `tokens.json`, evaluates WCAG contrast for each `onLight` value, updates to the passing shade step or black

**State Management:**
- No persistent application state. Each script runs to completion and exits.
- Figma Scripter scripts mutate canvas state via the `figma.*` API.
- CLI scripts mutate a JSON file on disk (`tokens.json`).

## Key Abstractions

**OKLCH Color Pipeline:**
- Purpose: Perceptually uniform tint/shade generation so all hues carry equal visual weight
- Examples: `color-scale-generator.js` (lines 53–100), `regenerate-palette-tokens.js` (lines 11–61)
- Pattern: `rgbToOklch` → manipulate L/C/H → `oklchToRgb` → `gammaCompress`
- Note: Duplicated verbatim in both files — no shared module

**STEPS Definition:**
- Purpose: Declarative list of scale steps with their tint/shade transform functions
- Examples: `color-scale-generator.js` (line 14), `regenerate-palette-tokens.js` (line 66)
- Pattern: Array of `{ label, fn }` objects; `main` step is a pass-through (source of truth, never regenerated)

**Token Name as Path:**
- Purpose: Swatch frame names double as W3C token paths (`dv/01/500`)
- Examples: `token-exporter.js` (`setNested()` splits on `/`), `apply-color-tokens.js` (`expandHint()`)
- Pattern: `/`-delimited string; `setNested()` walks object path to write leaf value

**Collection Context:**
- Purpose: Disambiguate same-named variables (e.g. `primary/main`) across multiple Figma collections
- Examples: `apply-color-tokens.js` (`getCollectionContext()`, `mapForContext()`)
- Pattern: Walk ancestor frames for name `"Palette"` or `"Color Roles"` → choose the corresponding lookup Map

**Variable Lookup Maps:**
- Purpose: Fast O(1) resolution of hint strings to Figma variables
- Examples: `apply-color-tokens.js` (`mapPalette`, `mapColorRoles`, `mapAny`, `byHex`)
- Pattern: Built once at script start; keyed by normalized name (`norm()` strips spaces, dashes, underscores)

## Entry Points

**color-scale-generator.js:**
- Location: `color-scale-generator.js` (bottom of file, `await figma.loadFontAsync(...)` then branching on `USE_PALETTE_VARIABLES`)
- Triggers: Pasted into Figma Scripter and run manually
- Responsibilities: Load fonts, read source colors, call `buildRow()` for each hue

**swatch-generator.js:**
- Location: `swatch-generator.js` (`generateSwatches()` call at line 325)
- Triggers: Pasted into Figma Scripter and run manually
- Responsibilities: Read all local COLOR variables, render light + dark columns

**token-exporter.js:**
- Location: `token-exporter.js` (top-level `if/else` block, line 56)
- Triggers: Pasted into Figma Scripter with swatch row frames selected
- Responsibilities: Walk selected frames, build token tree, `console.log` JSON

**apply-color-tokens.js:**
- Location: `apply-color-tokens.js` (`for (const node of scope) walk(node, 0)` at line 356)
- Triggers: Pasted into Figma Scripter; runs on current selection or full page
- Responsibilities: Build variable lookup maps, walk canvas tree, bind fills to variables

**regenerate-palette-tokens.js:**
- Location: `regenerate-palette-tokens.js` (lines 83–113, main execution block)
- Triggers: `node regenerate-palette-tokens.js [input] [output]`
- Responsibilities: Read tokens.json, regenerate steps, write in place

**fix-onlight-contrast.js:**
- Location: `fix-onlight-contrast.js` (lines 32–81, main execution block)
- Triggers: `node fix-onlight-contrast.js [input] [output]`
- Responsibilities: Evaluate WCAG AA contrast, update `onLight` values

**wire-color-role-refs.js:**
- Location: `wire-color-role-refs.js` (lines 14–45, main execution block)
- Triggers: `node wire-color-role-refs.js [input] [output]`
- Responsibilities: Replace hex values in color-role token sets with palette token references

## Architectural Constraints

- **No module system (Scripter scripts):** `import`/`require` is unavailable inside Figma Scripter. All helpers must be defined in the same file. This forces duplication of OKLCH math across `color-scale-generator.js` and `regenerate-palette-tokens.js`.
- **ESM only (CLI scripts):** CLI scripts use `import` syntax and require Node.js 18+ with native ESM support. No `require()` fallback.
- **Global state:** No module-level singletons. `apply-color-tokens.js` builds Maps (`mapPalette`, `mapColorRoles`, `mapAny`, `byHex`) at script start, but these are scoped to a single execution.
- **Circular imports:** Not applicable — no module system used.
- **Execution model:** All scripts run synchronously top-to-bottom (or with `await` for Figma font loading). No event loop, no server.
- **`figma` global:** Available only inside the Figma Scripter plugin host. CLI scripts must not call `figma.*`.
- **Token file path:** CLI scripts default to `~/bf-tokens/tokens/tokens.json`. Alternate paths accepted as CLI args.

## Anti-Patterns

### OKLCH Math Duplication

**What happens:** The full OKLCH pipeline (`linearize`, `gammaCompress`, `rgbToOklch`, `oklchToRgb`, `tintOklch`, `shadeOklch`) is copied verbatim between `color-scale-generator.js` and `regenerate-palette-tokens.js`.

**Why it's wrong:** A bug fix or precision improvement in one file does not propagate to the other, creating silent divergence between what Figma renders and what the CLI regenerates.

**Do this instead:** Extract the math into a shared ES module (`color-math.js`) importable by CLI scripts, and document a paste-and-verify procedure for the Scripter version since it cannot use imports.

### No Input Validation on Token JSON

**What happens:** CLI scripts call `JSON.parse(fs.readFileSync(...))` with no try/catch. A malformed `tokens.json` causes an unhandled exception with no user-friendly message.

**Why it's wrong:** Silent failures are hard to debug in a token pipeline with multiple CLI steps.

**Do this instead:** Wrap file reads in try/catch and emit clear error messages, e.g. `console.error('Could not parse tokens.json:', e.message)`.

## Error Handling

**Strategy:** Defensive checks with early exits and `figma.notify()` warnings for Scripter scripts; unguarded I/O for CLI scripts.

**Patterns:**
- Scripter scripts check for empty selections and missing collections before proceeding: `if (!selection.length) { figma.notify('...'); }`
- `resolveVariableColor()` / `resolveVarColor()` return `null` on failure; callers skip with `continue`
- CLI scripts do not wrap `fs.readFileSync` or `JSON.parse` in try/catch
- `apply-color-tokens.js` provides a `DEBUG_LIST_VARS` flag to dump all variables and exit for troubleshooting

## Cross-Cutting Concerns

**Logging:** Scripter scripts use `figma.notify()` for summary toasts and `console.log()` / `print()` for detailed per-token output. CLI scripts use `console.log` and `console.warn`.

**Validation:** WCAG AA contrast (4.5:1) is the only domain validation, applied in `fix-onlight-contrast.js` and `update-dataviz-contrast-tokens.js`.

**Authentication:** Not applicable — no network calls, no external services.

---

*Architecture analysis: 2026-05-07*
