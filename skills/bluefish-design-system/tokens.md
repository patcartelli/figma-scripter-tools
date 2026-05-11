# Bluefish Token Reference
*Last updated: 2026-05-04 — Synced to tokens.json: background/default dark, text/primary dark, divider dark, action/disabledBackground (light + dark), action opacity table corrected for dark mode, background/subtle added*

---

## color-roles

Token names follow MUI's `palette` API. Each token includes a description for LLM/agentic use.

**Two modes:** Light is default. Dark values apply when `theme.palette.mode === 'dark'`.

> **Outline token rename:** `outline/subtle` is now `outline/default`; old `outline/default` is now `outline/outline-variant`. Update any existing usages.

### Background

| Token | Light | Dark | Description |
|---|---|---|---|
| `color-roles/background/default` | `#FFFFFF` | `#1A1A1A` | Default page background |
| `color-roles/background/paper` | `#F9F7F6` | `#3D3D3D` | Elevated surface (cards, dialogs, popovers) |
| `color-roles/background/subtle` | — | `#292929` | Dark-mode-only: subtle background for inset areas and app chrome |
| `color-roles/background/level1` | `#F9F7F6` | `#3D3D3D` | Low-emphasis container (page sections, sidebars) |
| `color-roles/background/level2` | `#F0F0F0` | `#3D3D3D` | Default container (cards, panels) |
| `color-roles/background/level3` | `#E8E8E8` | `#575757` | High-emphasis container (selected rows, active panels) |

### Text

| Token | Light | Dark | Description |
|---|---|---|---|
| `color-roles/text/primary` | `#292929` | `#F9F7F6` | Primary text and icon color |
| `color-roles/text/secondary` | `#575757` | `#E8E8E8` | Secondary text for captions, labels, supporting content |
| `color-roles/text/disabled` | `#ACACAC` | `#575757` | Text color for disabled or inactive elements |

### Divider + Outline

| Token | Light | Dark | Description |
|---|---|---|---|
| `color-roles/divider` | `#E8E8E8` | `#3D3D3D` | Separator color for horizontal rules, list dividers |
| `color-roles/outline/outline-variant` | `#ACACAC` | `#3D3D3D` | Visible border for component edges (inputs, cards, buttons) |
| `color-roles/outline/default` | `#E8E8E8` | `#575757` | Subtle border for low-emphasis separation (table rows, card edges) |

### Primary

| Token | Light | Dark | Description |
|---|---|---|---|
| `color-roles/primary/main` | `#00414F` | `#FFFFFF` | Primary brand color for buttons, links, and key interactive elements |
| `color-roles/primary/dark` | `#00414F` | `#CDE7EE` | Darkest primary shade for high-emphasis text on light backgrounds |
| `color-roles/primary/light` | `#F0F9FB` | `#317A8B` | Lightest primary tint for hover backgrounds and low-emphasis containers |
| `color-roles/primary/50` | `#E0F3F8` | `#317A8B` | Light primary background for banners, alerts, highlighted sections |
| `color-roles/primary/contrastText` | `#CDE7EE` | `#00414F` | Text and icon color readable on primary/main backgrounds |
| `color-roles/primary/contrastTextLight` | `#00414F` | `#E0F3F8` | Text and icon color readable on primary/light and primary/50 backgrounds |

### Secondary

| Token | Light | Dark | Description |
|---|---|---|---|
| `color-roles/secondary/main` | `#0085CC` | `#FFFFFF` | Secondary brand color for supporting interactive elements and links |
| `color-roles/secondary/light` | `#DEF4FF` | `#317A8B` | Lightest secondary tint for backgrounds and low-emphasis fills |
| `color-roles/secondary/dark` | `#114763` | `#99D1DE` | Darkest secondary shade for text on light backgrounds |
| `color-roles/secondary/contrastText` | `#FFFFFF` | `#00414F` | Text and icon color readable on secondary/main backgrounds |

### Error

| Token | Light | Dark | Description |
|---|---|---|---|
| `color-roles/error/main` | `#AB0D2F` | `#F8BBC9` | Error state color for validation errors, destructive actions, and alerts |
| `color-roles/error/light` | `#FEECF0` | `#FEECF0` | Light error background for error banners and inline validation |
| `color-roles/error/dark` | `#650318` | `#650318` | Dark error shade for error text on light backgrounds |
| `color-roles/error/contrastText` | `#FFFFFF` | `#650318` | Text and icon color readable on error/main backgrounds |

### Warning

| Token | Light | Dark | Description |
|---|---|---|---|
| `color-roles/warning/main` | `#DE8A02` | `#EBB889` | Warning state color for caution indicators and non-blocking alerts |
| `color-roles/warning/light` | `#FCF3EB` | `#FCF3EB` | Light warning background for warning banners and notices |
| `color-roles/warning/dark` | `#855223` | `#855223` | Dark warning shade for warning text on light backgrounds |
| `color-roles/warning/contrastText` | `#FFFFFF` | `#855223` | Text readable on warning/main — dark mode 3.6:1, pending fix |

### Success

| Token | Light | Dark | Description |
|---|---|---|---|
| `color-roles/success/main` | `#218336` | `#75CBA5` | Success state color for confirmations and positive feedback |
| `color-roles/success/light` | `#E8F6F0` | `#E8F6F0` | Light success background for banners and positive indicators |
| `color-roles/success/dark` | `#0F653F` | `#0F653F` | Dark success shade for text on light backgrounds |
| `color-roles/success/contrastText` | `#FFFFFF` | `#0F653F` | Text readable on success/main — dark mode 3.7:1, pending fix |

### Info

| Token | Light | Dark | Description |
|---|---|---|---|
| `color-roles/info/main` | `#128085` | `#76C4C7` | Info state color for informational messages and neutral status |
| `color-roles/info/light` | `#E8F3F6` | `#E8F3F6` | Light info background for banners and contextual hints |
| `color-roles/info/dark` | `#045B5F` | `#045B5F` | Dark info shade for text on light backgrounds |
| `color-roles/info/contrastText` | `#FFFFFF` | `#045B5F` | Text readable on info/main — dark mode 3.9:1, pending fix |

### Neutral

| Token | Light | Dark | Description |
|---|---|---|---|
| `color-roles/neutral/main` | `#292929` | `#E8E8E8` | Neutral foreground for low-emphasis UI elements |
| `color-roles/neutral/light` | `#F9F7F6` | `#F9F7F6` | Neutral tint for low-emphasis backgrounds |
| `color-roles/neutral/dark` | `#575757` | `#575757` | Dark neutral for text on neutral/light backgrounds |
| `color-roles/neutral/contrastText` | `#FFFFFF` | `#575757` | Text readable on neutral/main backgrounds |

### Per-Color States (`_states`)

Each color palette has a `_states` subgroup with interaction overlays derived from that color's `main`. Opacity values differ between light and dark modes.

| Token pattern | Light | Dark | Description |
|---|---|---|---|
| `color-roles/[color]/_states/hover` | `[color]/main` at 4% | at 8% | Hover overlay on [color]-tinted components |
| `color-roles/[color]/_states/selected` | `[color]/main` at 8% | at 16% | Selected state overlay (chips, list items) |
| `color-roles/[color]/_states/focus` | `[color]/main` at 12% | at 12% | Focus overlay for mouse-initiated focus |
| `color-roles/[color]/_states/focusVisible` | `[color]/main` at 30% | at 30% | Keyboard focus ring (WCAG 2.4.7) |
| `color-roles/[color]/_states/outlinedBorder` | `[color]/main` at 50% | at 50% | Border color for outlined variant buttons and inputs |

Applied to: `primary`, `secondary`, `error`, `warning`, `success`, `info`, `neutral`.

### Action (Global)

Neutral interaction states not tied to a specific color. Base color and opacity differ between modes.

| Token | Light | Dark | Description |
|---|---|---|---|
| `color-roles/action/hover` | `#292929` at 4% | `#FFFFFF` at 8% | Hover overlay for neutral interactive elements |
| `color-roles/action/selected` | `#292929` at 8% | `#FFFFFF` at 16% | Selected state for neutral interactive elements |
| `color-roles/action/focus` | `#292929` at 12% | `#FFFFFF` at 12% | Focus overlay for neutral interactive elements |
| `color-roles/action/active` | `#292929` at 16% | `#FFFFFF` at 56% | Active/pressed state overlay for neutral interactive elements |
| `color-roles/action/disabled` | `#292929` at 38% | `#FFFFFF` at 38% | Semi-transparent overlay on disabled elements |
| `color-roles/action/disabledBackground` | `#E8E8E8` | `#3D3D3D` | Solid background fill for disabled inputs, buttons, controls |

---

## Data Visualization Color-Roles

Token path: `color-roles/dataviz/[NN]/[property]`

Each series provides 5 properties:
- **`main`** — primary series color; use as chart fill or background swatch
- **`light`** — tinted background for tooltips, hover states, legends
- **`dark`** — darker shade for strokes or secondary fills
- **`contrast`** — text/icon color for use ON TOP of `main` as background
- **`onLight`** — text/icon color for use ON TOP of `light` as background

> Source palette: `palette/dataviz/dv/[NN]/[stop]` — see `tokens-dataviz.md` for full scale.

| Series | main | light | dark | contrast | onLight | Notes |
|---|---|---|---|---|---|---|
| `dataviz/01` | `#177085` | `#D5E5E9` | `#125A6A` | `#F3F8F9` | `#125A6A` | |
| `dataviz/02` | `#F76F21` | `#FEE5D7` | `#C6591B` | `#292929` | `#292929` | |
| `dataviz/03` | `#B698EC` | `#F2ECFC` | `#927ABD` | `#292929` | `#292929` | |
| `dataviz/04` | `#E63BC0` | `#FADCF4` | `#B82F9A` | `#292929` | `#292929` | contrast/main 4.0:1 |
| `dataviz/05` | `#81A3FF` | `#E8EEFF` | `#6782CC` | `#292929` | `#292929` | |
| `dataviz/06` | `#6CB291` | `#E5F1EB` | `#568E74` | `#292929` | `#292929` | |
| `dataviz/07` | `#D77D28` | `#F8E8D8` | `#AC6420` | `#292929` | `#292929` | |
| `dataviz/08` | `#FF5454` | `#FFE0E0` | `#CC4343` | `#292929` | `#292929` | |
| `dataviz/09` | `#6E36D7` | `#E5DBF8` | `#582BAC` | `#FFFFFF` | `#582BAC` | |
| `dataviz/10` | `#1F932F` | `#D7ECD9` | `#197625` | `#FFFFFF` | `#197625` | contrast/main 4.0:1 |
| `dataviz/11` | `#8BE1F0` | `#EAFAFC` | `#6FB4C0` | `#292929` | `#292929` | |
| `dataviz/12` | `#F8A87A` | `#FEEFE7` | `#C68662` | `#292929` | `#292929` | |
| `dataviz/13` | `#925BF5` | `#EBE1FD` | `#7549C4` | `#7549C4` | `#7549C4` | contrast/main 4.2:1; consider #FFFFFF on main |
| `dataviz/14` | `#ED98DA` | `#FCECF8` | `#BE7AAE` | `#292929` | `#292929` | |
| `dataviz/15` | `#404EEC` | `#DDDFFC` | `#333EBD` | `#333EBD` | `#333EBD` | |
| `dataviz/16` | `#BEE4D2` | `#F3FAF7` | `#98B6A8` | `#292929` | `#292929` | |
| `dataviz/17` | `#F9B804` | `#FEF2D2` | `#C79303` | `#292929` | `#292929` | |
| `dataviz/18` | `#8B2525` | `#EAD8D8` | `#6F1E1E` | `#FFFFFF` | `#6F1E1E` | |
| `dataviz/19` | `#9155A5` | `#EBE0EF` | `#744484` | `#FFFFFF` | `#744484` | |
| `dataviz/20` | `#A0DE89` | `#EEF9EA` | `#80B26E` | `#292929` | `#292929` | |
| `dataviz/21` | `#36B8D0` | `#DBF2F7` | `#2B93A6` | `#292929` | `#292929` | |
| `dataviz/22` | `#CB4A00` | `#F6DFD1` | `#A33C00` | `#FFFFFF` | `#A33C00` | |
| `dataviz/23` | `#3615AC` | `#DBD5F0` | `#2B118A` | `#FFFFFF` | `#2B118A` | |
| `dataviz/24` | `#E56FCA` | `#FAE5F5` | `#B759A2` | `#292929` | `#292929` | |
| `dataviz/25` | `#6B72BE` | `#E4E6F3` | `#565B98` | `#FFFFFF` | `#565B98` | contrast/main 4.4:1 |
| `dataviz/26` | `#72E2AF` | `#E6FAF1` | `#5BB58C` | `#292929` | `#292929` | |
| `dataviz/27` | `#FF9E3D` | `#FFEEDC` | `#CC7F31` | `#292929` | `#292929` | |
| `dataviz/28` | `#D92D2D` | `#F8D9D9` | `#AE2424` | `#FFFFFF` | `#AE2424` | |
| `dataviz/29` | `#CD40E6` | `#F6DDFA` | `#A433B8` | `#FFFFFF` | `#A433B8` | contrast/main 3.8:1; onLight/light 4.4:1 |
| `dataviz/30` | `#20530E` | `#D7E0D4` | `#1A430B` | `#FFFFFF` | `#1A430B` | |

> **Contrast flags — series 04, 10, 13, 25, 29:** The `contrast` token fails WCAG AA (4.5:1) on `main`. Prefer placing labels on `light` backgrounds using `onLight` where possible. For series 13, use `#FFFFFF` as a fallback for text directly on `main`.

---

## scale

> Typography tokens (font family, size, weight, line height) have moved to `type-styles.md`.

### Spacing
Numeric scale — token path: `scale/[n]`

| Token | Value |
|---|---|
| `scale/1` | 4px |
| `scale/2` | 8px |
| `scale/3` | 12px |
| `scale/4` | 16px |
| `scale/5` | 20px |
| `scale/6` | 24px |
| `scale/8` | 32px |
| `scale/10` | 40px |
| `scale/12` | 48px |

### Radius

| Token | Value |
|---|---|
| `scale/radius/none` | 0 |
| `scale/radius/xs` | 2px |
| `scale/radius/sm` | 4px |
| `scale/radius/md` | 8px |
| `scale/radius/lg` | 16px |
| `scale/radius/full` | 9999px (pill) |

---

## Phase 1 Audit — 2026-05-08

**Outline rename:** VERIFIED — `outline/outline-variant` and `outline/default` present
in live table. Migration note banner (line 12) uses old names intentionally
(documents rename direction) — no change needed.
**Other drift:** None found.
**Status:** FOUND-03 complete for this file.
