# Documentation Agent Handoff — figma-scripter-tools (color palette toolset)

You are writing documentation for a set of **Figma Scripter** scripts that
generate and visualize the design system's color palettes. The audience is
**mixed**: designers who paste scripts into Figma and click Run, and engineers
who maintain the scripts and the token conventions. Write clearly for both —
don't assume CLI knowledge for designers, don't assume Figma internals for
engineers.

All three scripts run **inside the [Figma Scripter plugin](https://www.figma.com/community/plugin/757836922707087356/scripter)**.
They are self-contained — no npm, no imports. A designer pastes the file, edits
the constants at the top, and clicks Run.

---

## Repository & scripts

**Repo:** https://github.com/patcartelli/figma-scripter-tools

**Scripts to document** (paths relative to repo root):

| File | Role |
|---|---|
| [`generator-color-palette.js`](generator-color-palette.js) | Brand ramp generator → `palette/color/light` |
| [`generator-dataviz-palette.js`](generator-dataviz-palette.js) | Categorical dataviz generator → `palette/categorical` |
| [`swatch-generator.js`](swatch-generator.js) | Visualizes existing COLOR variables on canvas |

Read each script's header comment and top-of-file constants (`SEEDS`, `CONFIG`,
`COLLECTION_NAME`/`PALETTE_COLLECTION`, `VAR_PREFIX`) — those are the
user-facing contract and the source of truth for the docs.

---

## What to produce

1. **README.md** — repo overview: what the toolset does, who it's for, the
   palette workflow, and the naming convention (below). Include a quick-start
   for the designer path.
2. **Per-script usage docs** — a section per script: purpose, inputs (the
   top-of-file constants), outputs (variables + canvas), how to run, caveats.

---

## The naming convention (document this prominently — it's the core rule)

The system has two color layers with deliberately different seed-stop names so
they never collide in a flattened namespace:

| Layer | Seed / role stop | Meaning |
|---|---|---|
| `palette/*` | **`source`** | The raw seed color — the starting point a theme is built from. |
| `color-roles/*` | **`main`** | The semantic role token, aliased to the palette source (e.g. `color-roles/secondary/main` → `palette/secondary/source`). |

Each ramp is a 12-stop tonal scale generated in OKLCH (perceptually uniform):

```
25, 50, 100, 200, 300, 350, 400, 450, 500, 550, 600, 700
```

plus a **`source`** stop holding the raw seed hex verbatim (never generated).
The seed lands visually in the 450–500 region.

---

## The three scripts

### 1. `generator-color-palette.js` — brand ramps (Designer tool)

**What it does:** Generates tonal ramps for brand roles (`primary`,
`secondary`, `error`, …) from seed colors and writes them as Figma variables in
the `palette/color/light` collection, plus renders a labeled swatch sheet on the
canvas (one column per ramp, swatches bound to their variables).

**Inputs (top of file):**
- `SEEDS` — object of `roleName: '#hex'` (one entry per ramp)
- `COLLECTION_NAME` / `VAR_PREFIX` — where variables land. Two interpretations
  documented inline: (a) a literal collection named `palette/color/light`, or
  (b) the real `palette` collection with a name prefix. The engineer picks one.
- `CONFIG` — swatch layout (widths, gaps)

**Output:** Variables `<ramp>/<stop>` and `<ramp>/source` in the target
collection; a `Brand Palette` frame on the canvas. Re-running is **idempotent**
(updates in place, no duplicates); it does **not** delete stale variables.

### 2. `generator-dataviz-palette.js` — categorical dataviz (Designer tool)

**What it does:** Same OKLCH engine, for categorical dataviz palettes keyed by
number. Writes raw ramps to `palette/categorical` and renders a swatch sheet
(one column per palette number, numeric-aware ordering so `01` precedes `10`).

**Inputs (top of file):**
- `SEEDS` — object of `'NN': '#hex'` (string keys preserve leading zeros)
- `PALETTE_COLLECTION` / `VAR_PREFIX` — same (a)/(b) choice as above
- `COLLECTION_ORDER`, `CONFIG` — display ordering and layout

**Output:** Variables `<num>/<stop>` and `<num>/source`; a
`Dataviz Categorical Palette` frame. Same idempotent, no-prune behavior.

**Not yet implemented (document as planned):**
- `color-roles/categorical/light` + `/dark` semantic role mappings — a `// TODO`
  placeholder (`writeCategoricalRoles`). The Bluefish team owns the final role
  structure; the seed `source` will be referenced there as a `main` role token.
- Contrast-checking for accessibility — a `// TODO` at the point where ramp
  values are finalized.

### 3. `swatch-generator.js` — visualize existing variables (Designer tool)

**What it does:** Reads all local COLOR variables already in the file and
renders a swatch sheet — **one section per collection**, and within each
section **one column per mode** (side-by-side), tokens grouped by first name
segment. Color blocks are bound to their variables (live-updating). Use this to
audit/visualize what's in the file, independent of the generators.

**Inputs:** none required — it reads the file's variables. `CONFIG` (layout) and
`COLLECTION_ORDER` (section order: color-roles → data-viz → palette → rest) at
the top.

**Output:** Swatch sections on the canvas; viewport scrolls to them.

**Caveat:** Side-by-side mode columns use `setExplicitVariableModeForCollection`,
which requires a Figma plan that supports variable modes. Single-mode
collections render on any plan.

---

## Shared notes (apply to all three)

- **Self-contained** Scripter scripts — paste and Run. No build step.
- **Fonts:** assume Inter; each script falls back to the file's default font if
  Inter isn't available.
- **OKLCH** is used for perceptual uniformity (equal lightness reads as equal
  brightness across hues) — important for dataviz equal-weighting and for
  consistent tonal ramps. The curve is verified to reproduce the existing
  approved categorical palette exactly.
- **Idempotent writes:** generators update variables in place on re-run; they
  never duplicate and never auto-delete.

## Workflow (how the pieces fit)

```
Designer sets SEEDS in a generator → Run
        ↓
Variables written to palette/* (seed stored as "source")
        ↓
(future) color-roles/* maps palette source → role "main"  [TODO, Bluefish]
        ↓
swatch-generator.js → visual swatch sheet of everything in the file
```

## Tone guidance

- **Designers:** assume Figma familiarity, no terminal. Spell out: open Scripter,
  paste, edit `SEEDS`, Run. Avoid jargon.
- **Engineers:** assume comfort with JS/JSON and the variable model. Focus on the
  constants contract, the `source`/`main` convention, and the (a)/(b) collection
  mapping choice.
- **Both:** the point of this toolset is consistent, auditable color tokens
  generated from a single seed per ramp. Surface that framing.
