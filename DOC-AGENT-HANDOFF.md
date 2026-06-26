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
| [`generator-brand-palette.js`](generator-brand-palette.js) | Brand ramps → `palette/color/light` (**data-driven / exact**) |
| [`generator-dataviz-palette.js`](generator-dataviz-palette.js) | Categorical dataviz generator → `palette/categorical` (**calculated / OKLCH**) |
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

### 1. `generator-brand-palette.js` — brand ramps (Designer tool)

**What it does:** Writes the brand ramps (`primary`, `secondary`, `error`,
`success`, `warning`, `info`, `neutral`) as Figma variables in
`palette/color/light` and renders a labeled swatch sheet (one column per ramp,
swatches bound to their variables).

**Data-driven, not algorithmic — and why.** The brand ramps were built in two
passes: an original base scale (`50,100,200,300,400,500`) plus stops inserted by
hand to expand the palette (`25, 350, 450, 550, 600, 700`, tagged `"new"` in
tokens.json). Because part of each ramp was authored by hand, no seed→ramp
formula reproduces them exactly — so this script stores the curated values
verbatim (in the `BRAND_RAMPS` constant) and reproduces the file **bit-for-bit**.

> **Future state → calculated steps.** When the tonal curve is finalized so every
> stop (including the hand-inserted ones) is computed from the seed, `BRAND_RAMPS`
> should be replaced by generation (the OKLCH engine in
> `generator-dataviz-palette.js` is the basis). Document this as a known,
> intended follow-up, not a defect.

**Inputs (top of file):**
- `BRAND_RAMPS` — the curated ramp data (edit hex values here to change output)
- `COLLECTION_NAME` / `VAR_PREFIX` — where variables land. Two interpretations
  documented inline: (a) a literal collection named `palette/color/light`, or
  (b) the real `palette` collection with a name prefix. The engineer picks one.
- `CONFIG` — swatch layout (widths, gaps)

**Output:** Variables `<ramp>/<stop>` and `<ramp>/source` in the target
collection; a `Brand Palette` frame on the canvas. Each ramp keeps its own stop
set (e.g. `neutral` has no `550` and adds `black`). Re-running is **idempotent**
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
Designer runs a generator → Run
  • brand:       edit BRAND_RAMPS (curated values)  → palette/color/light
  • categorical: edit SEEDS (calculated from seed)  → palette/categorical
        ↓
Variables written to palette/* (seed/anchor stored as "source")
        ↓
(future) color-roles/* maps palette source → role "main"  [TODO, Bluefish]
        ↓
swatch-generator.js → visual swatch sheet of everything in the file
```

## Tone guidance

- **Designers:** assume Figma familiarity, no terminal. Spell out: open Scripter,
  paste, edit the data at the top (`BRAND_RAMPS` for brand, `SEEDS` for
  categorical), Run. Avoid jargon.
- **Engineers:** assume comfort with JS/JSON and the variable model. Focus on the
  constants contract, the `source`/`main` convention, the (a)/(b) collection
  mapping choice, and the data-driven-vs-calculated split (brand is curated today;
  categorical is computed; brand's future state is calculated).
- **Both:** the point of this toolset is consistent, auditable color tokens —
  curated for brand today, calculated for dataviz, with brand moving to
  calculated in the future. Surface that framing.
