---
name: bluefish-design-system
description: >
  Bluefish design system reference. Use for token lookups, accessibility rules,
  Figma variable reading, component conventions, and code output standards.
  Activates for any question about the Bluefish design system that is not a
  specific explore, prototype, spec, or build task.
---

# Bluefish Design System

## About Bluefish

Bluefish is an AI-powered marketing platform (Series A, NYC). The product serves marketing teams managing campaigns and content at scale. The design language is clean, data-forward, and professional — prioritizing clarity and efficiency over decoration.

---

## Figma MCP Setup

> See the Bluefish AI Assistant documentation for setup instructions.

The Figma MCP connects to whatever file is open in Figma Desktop — open the Bluefish pattern library before invoking. When reading Figma components, read `figma-reading-guide.md` before interpreting component properties.

---

## Live Token Grounding

At the start of every session with Figma Desktop open, call `get_variable_defs` on the open node to pull live token values. **Live values are authoritative for the session — use them instead of `tokens.md` for color and scale tokens.**

**Which node to open:** Have any node in the Bluefish pattern library file open in Figma Desktop.

> ⚠️ `get_variable_defs` is node-scoped in practice — it returns only variables applied to the selected node, not all variables in the file. State and interaction tokens (`_states/hover`, `action/focus`, etc.) may not appear if the selected frame is a static default state. When a token is absent from the result but exists in `tokens.md`, treat `tokens.md` as authoritative and do not flag it as missing — only flag values that appear in neither source.

**Normalize variable names before use:**
1. If Figma returns M3-style names (e.g. `md.sys.color.*`), map them using figma-reading-guide.md Step 5.
2. Live variable names come back without the `color-roles/` prefix (e.g. `primary/main`, `text/secondary`). Always prepend `color-roles/` in all spec and code output: `color-roles/primary/main`, `color-roles/text/secondary`.

**Fallback — use when any of these occur:**
- `get_variable_defs` returns a tool error
- Figma Desktop is not open
- Result is empty or nil

When falling back: read `tokens.md` and flag every token reference in output:
`/* ⚠️ live token data unavailable — using tokens.md */`

---

## Token Convention — Critical

Authoritative token groups:
- **`color-roles`** — semantic color (MUI `palette` naming: `main`, `light`, `dark`, `contrastText`)
- **`color-roles/dataviz`** — dataviz series color-roles
- **`scale`** — spacing, radius (subcategories)
- **`palette/color`** — raw UI color palette (reference only, not used in code directly)
- **`palette/dataviz`** — raw dataviz palette (reference only)

When generating code, read `tokens.md` for complete color, spacing, and radius token paths. When generating code or speccing typography, read `type-styles.md`. When generating code or specs involving data visualization, read `tokens-dataviz.md`.

**Two color modes:** Light is default. Use `color-roles` tokens for both — they resolve per mode automatically.

**Dark mode wiring:** Controlled via MUI `theme.palette.mode` — do not use hardcoded `@media (prefers-color-scheme)` queries for color switching.

**Rules — apply to every color, spacing, radius, and typography value in every code output. No exception for placeholder values, demo code, or in-progress work. If no token exists, flag with `/* ⚠️ no token for [value] — needs token */`:**
1. Always use the full path: `color-roles/primary/main`
2. Never hardcode hex, px, or arbitrary spacing
3. Missing token: `/* ⚠️ no token for [value] — needs token */`
4. Color tokens use MUI naming: `main` (primary shade), `light` (tint), `dark` (shade), `contrastText` (text on main)
5. State layers use `color-roles/action/*` tokens (`hover`, `selected`, `focus`, `active`, `disabled`), not raw opacity values
6. Dataviz series tokens: `color-roles/dataviz/[NN]/[property]` where property is `main`, `light`, `dark`, `contrast`, or `onLight` — use `contrast` for text on `main` background, `onLight` for text on `light` background. Never use a single hex for chart series colors.
7. Elevation tokens are undefined — do not use elevation values in code output. Flag with: `/* ⚠️ elevation token undefined — omit elevation; flag for design review */`
8. `color-roles/primary/main` is the correct semantic token for primary color in code (resolves to `#00414F`). Never use `palette/color/primary/500` directly in code output — it is a raw palette reference, not a semantic token.
9. When reading Figma variables with M3-style names (e.g. `md.sys.color.*`), map to `color-roles` equivalents. Do not emit M3-style names in code output.
10. Dark mode: `warning`, `info`, and `success` `contrastText` values fail WCAG AA — pending fix. Flag any dark-mode code using these combinations: `/* ⚠️ dark mode contrastText on warning/info/success fails WCAG AA — pending design fix */`

**Spacing scale gaps:** `scale/7` and `scale/9` are not defined. The scale jumps: `scale/6` (24px) → `scale/8` (32px) → `scale/10` (40px). If a design uses spacing values at those positions (28px or 36px), use the nearest defined scale value and flag: `/* ⚠️ no token for [value] — needs token */`

**Type Styles:**
- Only use top-level styles (no `/` in the name). Authoritative styles:
  `Page Title`, `H1`, `H2`, `H3`, `H4`, `H5`, `H6`, `Body1`, `Body2`,
  `Button L`, `Button M`, `Button S`,
  `Caption`, `Caption Med`, `Caption Em`, `Overline`
- Nested styles (e.g. `Typography/Heading/Large`) are not authoritative — flag them: `/* ⚠️ nested type style — use top-level style instead */`
- `web/`-prefixed styles (e.g. `web/H1`, `web/Body1`) are not authoritative — flag them: `/* ⚠️ web/ type style prefix invalid — use top-level style instead */`

---

## Accessibility (WCAG AA — non-negotiable)

| Requirement | Rule |
|---|---|
| Text contrast | 4.5:1 minimum |
| UI / large text contrast | 3:1 minimum |
| Focus states | Visible indicator on all interactive components |
| Labels | `aria-label` or `aria-labelledby` on unlabeled interactive elements |
| Keyboard | All interactions keyboard-accessible |

Per-category ARIA: Buttons → `role="button"`, `aria-disabled` · Navigation → `role="navigation"`, `aria-current="page"` · Forms → `<label htmlFor>`, `aria-describedby` · Feedback → `role="alert"` / `role="status"` · Charts → `role="img"` + `aria-label`

**DV series 04, 10, 13, 25, 29** — `contrast` token fails WCAG AA on `main` background. Recovery decision:
1. **Prefer:** use `onLight` token on `light` background — passes WCAG AA for all five series.
2. **If label must appear on `main` background:**
   - Series 13: use `#FFFFFF` as a text fallback on `main` (borderline 4.2:1 — flag for design review).
   - Series 04, 10, 25, 29: no accessible text-on-main option exists — flag for design review.
3. **Flag non-compliant usage:** `/* ⚠️ DV series [N] contrast fails WCAG AA on main — use onLight on light background */`

---

## Component Map

Component discovery is MCP-driven — there is no static component map file. When a build or explore task requires knowing which Figma components are present and what their MUI equivalents are, query the Figma MCP directly:

1. Fetch the target frame or page at sufficient depth to surface component instances
2. For each instance, read the `componentId`, `name`, and `description` fields
3. Use the component name and description to determine the MUI equivalent — or flag if no clear mapping exists: `/* ⚠️ no MUI equivalent for [component name] — custom implementation required */`
4. Read `figma-reading-guide.md` Step 3 for component category inference when name alone is ambiguous

---

## Code Output

**Framework:** React + MUI. Token paths map to CSS custom properties or MUI theme.

| Figma property | MUI prop |
|---|---|
| `Has Icon` (start / end) | `startIcon` / `endIcon` |
| `Is Disabled` | `disabled` |
| `Size=Large/Medium/Small` | `size` |
| `Variant=Contained/Outlined/Text` | `variant` |
| `Color=Primary/Secondary/Error` | `color` |

**Token-to-code mapping** — how Bluefish token paths translate to code references:

> Until eng confirms the injection mechanism (see DATA-03), use the following:
>
> **If tokens inject as MUI theme extensions:**
> - Color: `theme.palette.primary.main` for `color-roles/primary/main`
> - Spacing: `theme.spacing(n)` for `scale/n` (e.g., `theme.spacing(4)` for `scale/4`)
> - Typography: `theme.typography.body1.fontSize` for type style tokens
>
> **If tokens inject as CSS custom properties:**
> - Color: `var(--color-roles-primary-main)` for `color-roles/primary/main`
> - Spacing: `var(--scale-4)` for `scale/4`
>
> Flag any code using token paths as literal strings: `/* ⚠️ token injection method unconfirmed — verify with eng */`

**Selected/active item background sizing:** In Bluefish nav components, the selected item background pill hugs the label — it does not stretch to fill the container. Always use `alignSelf: 'flex-start'` (or equivalent) on the item wrapper. Never set `width: '100%'` on a selected item that has a background fill.

BEM applies to outer custom component class names only — do not apply BEM naming to MUI component internals (e.g., do not add BEM classes to `.MuiButton-root` or other MUI-managed elements). Accessibility props always included — never optional.

> **Props follow MUI API** — match MUI prop names and types as closely as possible.

**MUI architecture:** Use the wrapping pattern — create a named custom component (e.g., `<BluefishButton>`) that renders an MUI component internally with Bluefish props applied.

**Before returning code, verify:**
1. All color values use `color-roles/...` paths — no hex values
2. All spacing values use `scale/...` paths — no px literals
3. All typography uses top-level type styles only (no `web/` prefix, no nested `/` in style name)
4. If using token paths as literal strings, flagged with `/* ⚠️ token injection method unconfirmed — verify with eng */`
5. All interactive elements include required ARIA props (see Accessibility table)
6. Known-gap values flagged with `/* ⚠️ */` comments where applicable (elevation, DV series contrast, dark mode contrastText)
7. MUI type-only exports (e.g. `SelectChangeEvent`, `SelectProps`, `SxProps`) must use
   `import type { ... }` — Vite throws a runtime `SyntaxError` if they are imported as values.
   ✓ `import Select, { type SelectChangeEvent } from '@mui/material/Select'`
   ✗ `import Select, { SelectChangeEvent } from '@mui/material/Select'`
8. Call `get_screenshot` for the original Figma node. Compare rendered output against it
   visually. Flag discrepancies — do not report the component as complete if the visual
   output does not match.

When generating a spec, read `spec-template.md` for output format.

---

## Breaking Changes

**Outline token rename** (2026-04-29):
- `outline/subtle` → `outline/default` (subtle/light border — low-emphasis separation)
- `outline/default` → `outline/outline-variant` (visible component border — inputs, cards, buttons)

Update any existing usages. The old names no longer exist in the token system.

---

## Known Gaps

- [ ] Elevation tokens — to be defined. See Token Convention rule 7 for interim handling.
- [ ] Figma token migration in progress — Figma variables may still show M3-style names. `tokens.json` is the source of truth for `color-roles` paths; see `figma-reading-guide.md` Step 5 for mapping guidance.
- [ ] Dark mode contrastText fails WCAG AA on warning, info, success — pending fix. See Token Convention rule 10 for flagging pattern.
- [ ] DV series 04, 10, 13, 25, 29 — `contrast` token fails WCAG AA on `main`. See Accessibility section for the `onLight` workaround rule.
- [ ] Code Connect not configured — eng required to set up `.figma.tsx` mapping files and run `figma connect publish`. Until complete, `get_design_context` will return a Code Connect interruption prompt. Command skills invoked for this frame will handle the Code Connect interruption — see the relevant command skill's workflow instructions.
- [ ] `get_variable_defs` node-scope limitation — state/interaction tokens (`_states/*`, `action/*`) may not appear in results if the selected frame is a static default state. Cross-reference `tokens.md` before flagging a token as missing.
