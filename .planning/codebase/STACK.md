# Technology Stack

**Analysis Date:** 2026-05-07

## Languages

**Primary:**
- JavaScript (ES2020+) - All scripts; two distinct execution environments (see Runtime)

**Secondary:**
- HTML/CSS - Static UI explorations in `explorations/`

## Runtime

**Environment:**
- Two separate runtimes used depending on the script:
  1. **Figma Scripter plugin sandbox** — scripts run inside the Figma desktop/web app via the [Scripter plugin](https://www.figma.com/community/plugin/1047415198990688414/scripter). These have access to the `figma` global API but NOT Node.js built-ins (no `fs`, `path`, `import`).
  2. **Node.js CLI** — standalone scripts run with `node` directly on the host machine. These use ES module syntax (`import`/`export`) and standard Node.js built-ins.

**Figma Scripter scripts (no shebang, no imports):**
- `color-scale-generator.js`
- `token-exporter.js`
- `swatch-generator.js`
- `apply-color-tokens.js`
- `update-dataviz-contrast-tokens.js`

**Node.js CLI scripts (shebang `#!/usr/bin/env node`, ES module `import`):**
- `fix-onlight-contrast.js`
- `regenerate-palette-tokens.js`
- `wire-color-role-refs.js`

**Node.js Version:**
- v25.9.0 (detected on host)

**Package Manager:**
- None — no `package.json`, no lockfile. No dependencies to install.
- Node.js CLI scripts rely exclusively on Node.js built-in modules (`fs`, `path`, `os`).

## Frameworks

**Core:**
- None — pure vanilla JavaScript throughout. No framework dependencies.

**Testing:**
- None detected.

**Build/Dev:**
- None — no build step, no bundler, no transpilation. Scripts are run directly.

## Key Dependencies

**Critical:**
- `figma` global API — Provided at runtime by the Figma Scripter plugin sandbox. Covers: `figma.variables`, `figma.currentPage`, `figma.viewport`, `figma.createFrame()`, `figma.createText()`, `figma.createRectangle()`, `figma.loadFontAsync()`, `figma.notify()`. Not installable — available only inside Figma.

**Infrastructure:**
- `fs` (Node.js built-in) — File read/write for CLI token scripts (`fix-onlight-contrast.js`, `regenerate-palette-tokens.js`, `wire-color-role-refs.js`)
- `path` (Node.js built-in) — Path resolution in CLI scripts
- `os` (Node.js built-in) — `os.homedir()` to locate `~/bf-tokens/` token files

## Configuration

**Environment:**
- No environment variables used.
- CLI scripts accept optional positional arguments for input/output file paths; defaults to `~/bf-tokens/tokens/tokens.json` (or `~/bf-tokens/tokens.json` depending on script).

**Build:**
- No build config files.

## Platform Requirements

**Development:**
- Figma desktop or web app with the [Scripter plugin](https://www.figma.com/community/plugin/1047415198990688414/scripter) installed
- Node.js v18+ for CLI scripts (ES modules, `Math.cbrt`, standard built-ins)
- Token JSON file at `~/bf-tokens/` for CLI token manipulation scripts

**Production:**
- Not applicable — these are design tooling scripts, not a deployed application.

---

*Stack analysis: 2026-05-07*
