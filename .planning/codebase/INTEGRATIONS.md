# External Integrations

**Analysis Date:** 2026-05-07

## APIs & External Services

**Figma Plugin API:**
- Figma — All canvas manipulation, variable reading/writing, and swatch rendering
  - SDK/Client: `figma` global (injected by Scripter plugin sandbox — no npm package)
  - Auth: None required; inherits Figma session from the host app
  - Surfaces used:
    - `figma.variables.getLocalVariables('COLOR')` — read all local color variables
    - `figma.variables.getLocalVariableCollections()` — enumerate collections + modes
    - `figma.variables.getVariableById()` / `getVariableCollectionById()` — alias resolution
    - `figma.variables.setBoundVariableForPaint()` — apply variable to fill
    - `figma.variables.setBoundVariableForPaint` / `variable.setValueForMode()` — write variable values
    - `figma.currentPage.selection` — read/write selected nodes
    - `figma.currentPage.children` — walk the page tree
    - `figma.currentPage.appendChild()` — place generated frames/swatches
    - `figma.viewport.center` — position generated content at viewport
    - `figma.viewport.scrollAndZoomIntoView()` — zoom to generated content
    - `figma.createFrame()`, `figma.createRectangle()`, `figma.createText()` — create canvas nodes
    - `figma.loadFontAsync()` — load Inter Medium/Regular before text creation
    - `figma.notify()` — display in-app toast notifications
    - `figma.closePlugin()` — terminate plugin execution

## Data Storage

**Databases:**
- None.

**File Storage:**
- Local filesystem only (CLI scripts)
  - Default input path: `~/bf-tokens/tokens/tokens.json` (or `~/bf-tokens/tokens.json` — varies by script)
  - Default output path: same as input (in-place update)
  - File format: W3C Design Token JSON
  - Scripts that read/write files: `fix-onlight-contrast.js`, `regenerate-palette-tokens.js`, `wire-color-role-refs.js`

**Caching:**
- None.

## Authentication & Identity

**Auth Provider:**
- None — Figma Scripter scripts run in the authenticated Figma session automatically. CLI scripts require no auth.

## Monitoring & Observability

**Error Tracking:**
- None.

**Logs:**
- Figma Scripter scripts: `figma.notify()` for user-facing toasts; `console.log()` / `print()` to the Figma console (Plugins > Development > Open Console)
- CLI scripts: `console.log()` / `console.warn()` / `console.error()` to stdout/stderr

## CI/CD & Deployment

**Hosting:**
- Not applicable — no deployed service.

**CI Pipeline:**
- None.

## Environment Configuration

**Required env vars:**
- None.

**Secrets location:**
- Not applicable.

## Webhooks & Callbacks

**Incoming:**
- None.

**Outgoing:**
- None.

## External Font Dependency

- **Inter** font family (Medium, Regular) — must be available inside the Figma file for `figma.loadFontAsync()` to succeed. Required by `color-scale-generator.js` and `swatch-generator.js`. Not a network call — resolved from fonts available to the Figma document.

---

*Integration audit: 2026-05-07*
