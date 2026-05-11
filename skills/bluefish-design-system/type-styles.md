# Bluefish Typography Reference
*Last updated: 2026-04-15*

---

## Font Tokens (scale/font)

### Family
All roles use **DM Sans**. Token path: `scale/font/family/[role]`
Roles: `headings`, `body`, `button`, `caption`, `overline`, `label`, `link`, `base`

### Size
| Token | Value |
|---|---|
| `scale/font/size/xs` | 11px |
| `scale/font/size/sm` | 12px |
| `scale/font/size/base` | 14px |
| `scale/font/size/md` | 16px |
| `scale/font/size/md-lg` | 18px |
| `scale/font/size/lg` | 20px |
| `scale/font/size/xl` | 24px |
| `scale/font/size/2xl` | 32px |
| `scale/font/size/3xl` | 40px |

### Weight
| Token | Value |
|---|---|
| `scale/font/weight/regular` | 400 |
| `scale/font/weight/medium` | 500 |
| `scale/font/weight/semibold` | 600 |
| `scale/font/weight/bold` | 700 |

### Line Height
| Token | Value |
|---|---|
| `scale/font/line-height/tight` | 1.2 |
| `scale/font/line-height/base` | 1.5 |
| `scale/font/line-height/loose` | 1.75 |

---

## Type Style Mapping

Authoritative top-level styles only — no `/` in the name. See SKILL.md for rules on nested styles.

> **Note:** `Page Title` was deprecated — use `H4` instead.

> **Drift flag (Phase 1 audit, 2026-05-08):** SKILL.md § Token Convention — Critical
> still lists `Page Title` as an authoritative style without a deprecation note.
> Correct in a future pass — remove `Page Title` from the SKILL.md type styles list
> and replace with a note pointing to H4.

> **Note on BodyBody2 line height:** Figma shows 20/14px (ratio 1.43). No exact token match — mapped to `base` (1.5) as closest. If a tighter token is added to the scale, update these rows.

| Style | Size | Weight | Line Height |
|---|---|---|---|
| H1 | `3xl` | `bold` | `base` |
| H2 | `2xl` | `bold` | `base` |
| H3 | `xl` | `semibold` | `base` |
| H4 | `lg` | `semibold` | `base` |
| H5 | `md-lg` | `medium` | `base` |
| H6 | `md` | `medium` | `base` |
| Body1 | `base` | `regular` | `base` |
| Body2 | `base` | `semibold` | `base` |
| Button L | `md` | `medium` | `base` |
| Button M | `base` | `medium` | `base` |
| Button S | `base` | `medium` | `base` |
| Caption | `sm` | `regular` | `base` |
| Caption Med | `sm` | `medium` | `base` |
| Caption Em | `sm` | `semibold` | `base` |
| Overline | `sm` | `medium` | `base` |

---

## Phase 1 Audit — 2026-05-08

**Outline rename:** N/A — no outline token references in this file.
**Other drift:** `Page Title` listed in type style table; SKILL.md § Token Convention
still lists it as authoritative without a deprecation note. Drift flag added above
the table. Correct in a future pass (remove from SKILL.md type styles list).
**Status:** FOUND-03 complete (no rename needed). Drift flagged per D-04.
