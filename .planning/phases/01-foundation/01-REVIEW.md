---
phase: 01-foundation
reviewed: 2026-05-08T00:00:00Z
depth: standard
files_reviewed: 6
files_reviewed_list:
  - /Users/pcartelli/.claude/skills/bluefish-design-system/SKILL.md
  - /Users/pcartelli/.claude/skills/bluefish-design-system/tokens.md
  - /Users/pcartelli/.claude/skills/bluefish-design-system/type-styles.md
  - /Users/pcartelli/.claude/skills/bluefish-design-system/tokens-dataviz.md
  - /Users/pcartelli/.claude/skills/bluefish-design-system/figma-reading-guide.md
  - /Users/pcartelli/.claude/skills/bluefish-design-system/spec-template.md
findings:
  critical: 0
  warning: 5
  info: 3
  total: 8
status: issues_found
---

# Phase 01: Code Review Report

**Reviewed:** 2026-05-08
**Depth:** standard
**Files Reviewed:** 6
**Status:** issues_found

## Summary

Six Bluefish design system skill files were reviewed: the index (SKILL.md) and five support files (tokens.md, type-styles.md, tokens-dataviz.md, figma-reading-guide.md, spec-template.md). All five support files received Phase 1 Audit stamps dated 2026-05-08. SKILL.md received no stamp.

The audit stamps are structurally consistent and the outline token rename is correctly reflected everywhere. No Screen Workflow or sub-mode references survive. Cross-file references to `.md` files all resolve to files that exist in the skill directory.

Five warnings were found: one known-but-unfixed SKILL.md type style inconsistency (Page Title), one WCAG guidance issue for dataviz series 13 that misleads the agent into producing a non-compliant value, one spacing gap documentation gap (scale/11), one missing-flag on dataviz series 15 contrast, and one typo in the type-styles.md drift note. Three info items cover the absent SKILL.md audit stamp, the Button M/S identical type properties, and a forward-reference to DATA-03 with no resolution path.

---

## Warnings

### WR-01: SKILL.md lists `Page Title` as an authoritative type style — it is deprecated

**File:** `SKILL.md:79`
**Issue:** The Type Styles section of SKILL.md lists `Page Title` as an authoritative top-level style alongside H1–H6 and the rest. `type-styles.md` marks it deprecated and redirects to H4, but SKILL.md was not updated. An agent reading only SKILL.md (the normal fast path) will emit `Page Title` in specs and code. The drift was identified in the type-styles.md audit stamp but was deferred rather than fixed.
**Fix:** Remove `Page Title` from the SKILL.md type style list and add a parenthetical note: `H4` (replaces deprecated `Page Title`).

```
  `H1`, `H2`, `H3`, `H4` (replaces deprecated `Page Title`), `H5`, `H6`, `Body1`, `Body2`,
```

---

### WR-02: Series 13 WCAG guidance recommends a value that fails WCAG AA without labeling it as non-compliant

**File:** `SKILL.md:102`
**Issue:** The dataviz accessibility recovery block says: "Series 13: use `#FFFFFF` as a text fallback on `main` (borderline 4.2:1 — flag for design review)." The guidance frames `#FFFFFF` as an actionable fallback. 4.2:1 is below the 4.5:1 WCAG AA minimum for normal text — it is not a compliant option. An agent following this instruction will produce a spec or code comment that endorses a WCAG-failing value with only a soft "flag for design review" attached. The accessible path (onLight on light background, which passes) is listed first but the series 13 carve-out then walks it back.
**Fix:** Reframe to make clear that `#FFFFFF` on `main` also fails AA. Remove the implied endorsement:

```
   - Series 13: no accessible text-on-main option exists (best available is #FFFFFF at 4.2:1,
     still below WCAG AA). Flag for design review: use onLight on light background instead.
     /* ⚠️ DV series 13 contrast fails WCAG AA on main — use onLight on light background */
```

---

### WR-03: Spacing gap documentation in SKILL.md omits the scale/11 gap

**File:** `SKILL.md:75`
**Issue:** SKILL.md states: "scale/7 and scale/9 are not defined. The scale jumps: scale/6 (24px) → scale/8 (32px) → scale/10 (40px)." The description stops at scale/10 but tokens.md defines scale/12 (48px). By the same logic, scale/11 (44px) is also undefined, but SKILL.md does not mention it. An agent given a design value of 44px will not find a gap-handling rule and may silently emit an untokenized value.
**Fix:** Extend the gap statement:

```
**Spacing scale gaps:** `scale/7`, `scale/9`, and `scale/11` are not defined. The scale
jumps: `scale/6` (24px) → `scale/8` (32px) → `scale/10` (40px) → `scale/12` (48px).
If a design uses spacing values at those positions (28px, 36px, or 44px), use the nearest
defined scale value and flag: `/* ⚠️ no token for [value] — needs token */`
```

---

### WR-04: Dataviz series 15 contrast token is not flagged despite likely WCAG AA failure

**File:** `tokens.md:164`
**Issue:** Series 15 has `contrast = #333EBD` on `main = #404EEC`. Both values are in the indigo/blue range with similar luminance — the contrast ratio between them is almost certainly below 4.5:1, yet no note appears in the tokens.md table (the Notes column is empty) and series 15 is absent from the failing-series list in both tokens.md (line 181 footnote) and SKILL.md (line 99). Every other series with a confirmed failure carries a note; series 15 carries none.
**Fix:** Compute the actual ratio. If it fails WCAG AA, add the flag to the tokens.md table row and add `15` to the failing-series lists in both tokens.md and SKILL.md:

```
| `dataviz/15` | `#404EEC` | `#DDDFFC` | `#333EBD` | `#333EBD` | `#333EBD` | contrast/main ~X.X:1 — VERIFY |
```

And update SKILL.md line 99:
```
**DV series 04, 10, 13, 15, 25, 29** — `contrast` token fails WCAG AA ...
```

---

### WR-05: Typo in type-styles.md drift note — "BodyBody2" should be "Body2"

**File:** `type-styles.md:53`
**Issue:** The note reads: "**Note on BodyBody2 line height:**" — the word "BodyBody2" is a concatenation error. This is in a drift note that an agent may read to understand the mapping decision for Body2's line height.
**Fix:** Correct the label:

```
> **Note on Body2 line height:** Figma shows 20/14px (ratio 1.43). No exact token match ...
```

---

## Info

### IN-01: SKILL.md has no Phase 1 Audit stamp — Page Title drift was not caught by the SKILL.md pass

**File:** `SKILL.md` (no audit section)
**Issue:** All five support files received a `## Phase 1 Audit — 2026-05-08` section. SKILL.md did not. The Page Title inconsistency (WR-01) was detected by the type-styles.md auditor and flagged as deferred, but because SKILL.md itself was not audited, the fix was never applied. Future audit passes should include SKILL.md explicitly.
**Fix:** Add an audit stamp to SKILL.md after the Breaking Changes/Known Gaps section, and use it to track the Page Title fix (WR-01).

---

### IN-02: Button M and Button S have identical type properties in type-styles.md

**File:** `type-styles.md:66-67`
**Issue:** Both `Button M` and `Button S` are defined as `base` / `medium` / `base` (14px / 500 / 1.5). If the size distinction is intentional (e.g., the difference is padding, not font metrics), the table is correct but carries no explanatory note. If the values are wrong, specs and code will produce identically-sized button labels for M and S.
**Fix:** Add a note confirming the font-metric identity is intentional:

```
| Button M | `base` | `medium` | `base` | Same font metrics as Button S; size distinction is padding only |
| Button S | `base` | `medium` | `base` | Same font metrics as Button M; size distinction is padding only |
```

---

### IN-03: DATA-03 referenced in SKILL.md Code Output section with no resolution path

**File:** `SKILL.md:133`
**Issue:** The token-to-code mapping section begins with "Until eng confirms the injection mechanism (see DATA-03)". DATA-03 is an external ticket reference with no URL, no description, and no fallback escalation path if it remains unresolved. An agent cannot act on this reference and a human reader has no way to locate it.
**Fix:** Either add a brief description of what DATA-03 covers and a link, or replace the ticket reference with a plain-language description:

```
> Until eng confirms whether tokens inject as MUI theme extensions or CSS custom properties
> (pending eng decision — check #eng-design-system Slack or the token injection ADR),
> use the following:
```

---

_Reviewed: 2026-05-08_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
