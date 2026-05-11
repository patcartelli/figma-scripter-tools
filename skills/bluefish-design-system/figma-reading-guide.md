# Bluefish Figma Reading Guide

Component documentation is sparse and layer naming is inconsistent. Follow these steps when reading Figma components via the MCP.

---

## Step 1 — Identify the real component name

Discard auto-named layers — `Frame [number]`, `Group [number]`, or purely numeric names are Figma auto-generation. The Figma MCP returns both the layer/instance name and the master component name. Use the master component name as the authoritative identifier, falling back to a manually renamed instance name, and only using a layer name if it is clearly intentional (not auto-generated).

---

## Step 2 — Parse the component name

`/` is a hierarchy separator. Parse left-to-right:

```
[Component Type] / [Variant or Layer] / [State or Modifier]
```

Examples:
- `Nav Rail/Secondary Layer` → type: Nav Rail, variant: Secondary Layer
- `Button/Primary/Default` → type: Button, variant: Primary, state: Default
- `Input/Text/Error` → type: Input, variant: Text, state: Error
- `Btn--primary-hov` → Button, Primary, Hover (legacy naming — flag for cleanup)

---

## Step 3 — Infer component category

| Name contains... | Category | Figma page |
|---|---|---|
| `Nav`, `Navigation`, `Nav Rail`, `Header`, `Menu`, `Tab`, `Search` | Navigation | Navigation pages |
| `Button`, `Btn`, `CTA`, `Capsule`, `Badge`, `Tag`, `Chip` | Buttons & Capsules | Buttons, Capsules |
| `Input`, `Select`, `Dropdown`, `Checkbox`, `Radio`, `Toggle`, `Switch`, `Date`, `Control` | Forms & Controls | Inputs and Selects, Controls |
| `Chart`, `Graph`, `Bar`, `Line`, `Pie`, `Donut`, `Sparkline` | Data & Charts | Graphs and Charts |
| `Alert`, `Toast`, `Banner`, `Message`, `Notification`, `Tooltip` | Feedback | Messaging |
| `Card`, `Panel`, `Container`, `Modal`, `Drawer`, `Sheet` | Layout | Containers |

No match: `/* ⚠️ component type unclear — [name] — needs categorization */`

---

## Step 4 — Interpret properties

- `Label=Value` format → intentional, parse as designed
- camelCase or shorthand → not yet cleaned up, infer from value
- `Has X` / `Is X` → boolean toggle
- `X Name` / `X Text` → string slot
- Ambiguous → note your interpretation in output

---

## Step 5 — Token references

Only treat variables under `1/color-roles` or `1/scale` as authoritative.

**Source of truth:** `tokens.json` in the `bluefish-tokens` repo (`color-roles/light` section) defines all authoritative `color-roles` paths and values. When in doubt, verify against that file.

**If Figma variables show M3-style names** (e.g. `md.sys.color.*`, `md.ref.palette.*`) — these are legacy Figma variable names; the token file uses `color-roles` naming. Map using this table, then verify the path exists in `tokens.json`:

| M3 variable name | Bluefish `color-roles` equivalent |
|---|---|
| `md.sys.color.primary` | `color-roles/primary/main` |
| `md.sys.color.on-primary` | `color-roles/primary/contrastText` |
| `md.sys.color.primary-container` | `color-roles/primary/light` |
| `md.sys.color.on-primary-container` | `color-roles/primary/contrastTextLight` |
| `md.sys.color.secondary` | `color-roles/secondary/main` |
| `md.sys.color.on-secondary` | `color-roles/secondary/contrastText` |
| `md.sys.color.error` | `color-roles/error/main` |
| `md.sys.color.on-error` | `color-roles/error/contrastText` |
| `md.sys.color.background` | `color-roles/background/default` |
| `md.sys.color.surface` | `color-roles/background/paper` |
| `md.sys.color.on-surface` | `color-roles/text/primary` |
| `md.sys.color.outline` | `color-roles/outline/outline-variant` |
| `md.sys.color.outline-variant` | `color-roles/outline/default` |

For names not in this table: infer the nearest `color-roles` equivalent from the semantic role, verify in `tokens.json`, and flag: `/* ⚠️ M3 variable [name] — mapped to [equivalent]; verify with design */`

Do not emit M3-style variable names in code output or specs.

---

## Component set boundaries

If variants appear as scattered frames rather than a component set, treat all frames sharing a base name as one component.

The Buttons page contains both Button and Capsule components. Capsules are pill-shaped — used for tags, filters, and status indicators.

---

## When documentation is missing

`/* ⚠️ no description found for [component name] — inferred from name/structure */`

---

## Phase 1 Audit — 2026-05-08

**Outline rename:** VERIFIED — M3 mapping table correctly maps
`md.sys.color.outline` → `color-roles/outline/outline-variant` and
`md.sys.color.outline-variant` → `color-roles/outline/default`.
**Other drift:** `1/color-roles` and `1/scale` prefix notation (line 56) —
intentional Figma variable collection identifier, not a token path error. No change.
**Status:** FOUND-03 complete for this file.
