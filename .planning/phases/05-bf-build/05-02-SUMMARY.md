---
phase: 05-bf-build
plan: "02"
subsystem: skill-authoring
tags: [bf-build, skill-file, symlink, production-component-generator, React19, MUI, TypeScript]
dependency_graph:
  requires: [05-01-routing-reclaim-complete]
  provides: [bf-build-skill-file, bf-build-symlink, BUILD-01, BUILD-02]
  affects:
    - ~/dev/bluefish-ai-skills/bf-build/SKILL.md
    - ~/.claude/skills/bf-build
tech_stack:
  added: []
  patterns:
    - skill-instruction-authoring
    - at-include-foundation-inheritance
    - mcp-first-path-detection
    - dual-path-token-output
    - spec-file-parsing-path-b
key_files:
  created:
    - ~/dev/bluefish-ai-skills/bf-build/SKILL.md
    - ~/.claude/skills/bf-build (symlink)
  modified: []
decisions:
  - "D-01 honored: React 19 target; forwardRef not required unless explicitly needed"
  - "D-02/D-03: Path A uses get_variable_defs + get_design_context only; get_metadata never mentioned in Figma Context section"
  - "D-04/D-05: Path B cross-spec auto-read rule uses exact Pitfall 5 wording — silent read from ./; no user prompt"
  - "D-06: Screen-level spec gate in Path B section; screen-level inventory question is 'Which component should I build?'"
  - "D-07/D-08: Single .tsx file output to ./; no scaffold files, no main.tsx, no App.tsx, no npm create vite"
  - "D-09: Dataviz tokens use color-roles/dataviz/[NN]/[property] from tokens.md; tokens-dataviz.md is raw palette for gradients/tints only"
  - "D-10: Typography annotation format is /* type: H1 */ inline; top-level style names only"
  - "D-11: Dual-path token output with human-readable flag 'token injection method unconfirmed — verify with eng' (no DATA-03 ID in skill file)"
  - "D-12: MCP-unavailable diagnostic phrasing exact: 'tokens from cached Bluefish reference (tokens.md, type-styles.md, tokens-dataviz.md)'"
  - "Invented-path anti-pattern reworded to avoid triggering the color-dataviz/categorical grep check while preserving the conceptual warning"
metrics:
  duration: "~15 minutes"
  completed: "2026-06-12"
  tasks_completed: 2
  files_modified: 0
  files_created: 2
---

# Phase 5 Plan 02: bf-build Skill File and Symlink

One new SKILL.md file (331 lines) and one symlink — the `/bf-build` production component generator skill — authored from analog patterns in `bf-spec/SKILL.md` (primary) and `bf-prototype/SKILL.md` (secondary), following all 13 locked decisions from 05-CONTEXT.md.

## Tasks Completed

| Task | Name | Commit (bluefish-ai-skills) | Files |
|------|------|-----------------------------|-------|
| 1 | Create bf-build/ directory and author SKILL.md with all 10 sections | b5db9ae | ~/dev/bluefish-ai-skills/bf-build/SKILL.md |
| 2 | Create symlink ~/.claude/skills/bf-build pointing to /Users/pcartelli/dev/bluefish-ai-skills/bf-build | (ln -s; no repo commit) | ~/.claude/skills/bf-build |

## SKILL.md Section Breakdown

**File:** `~/dev/bluefish-ai-skills/bf-build/SKILL.md` — 331 lines

| Section | Lines (approx) | Content Summary |
|---------|---------------|-----------------|
| Frontmatter | 1–9 | `name: bf-build`, `description: >` block scalar claiming build/implement/generate production code triggers; "Not for prototypes/explorations/specs" exclusions |
| @include + fallback blockquote | 11–14 | Verbatim from bf-spec: `@~/.claude/skills/bluefish-design-system/SKILL.md` + blockquote if load fails |
| `# bf-build` summary | 16–22 | One paragraph: generates production TS React/MUI file, two paths (A: Figma MCP; B: spec file), inherits foundation via @include, owns intake detection / MCP sequence / Path B parsing / output rules / anti-patterns |
| `## Support Files — Read On Demand` | 24–32 | Four bullets for tokens.md, type-styles.md, color-roles/dataviz in tokens.md, figma-reading-guide.md — bf-build-specific triggering conditions (sx props, typography annotations, dataviz components, MCP interpretation) |
| `## Intake` | 34–46 | Bare-invoke gate ("What component should I build?"); proceed immediately with description; never ask user to choose Path A or B; screen-level gate deferred to Path B section |
| `## Figma Context — Always Attempt First` | 48–86 | Preamble; numbered 2-call sequence (get_variable_defs + get_design_context); Code Connect flag; token drift rule; Fallback block (MCP→Path B→conversation desc); MCP-unavailable `//` comment diagnostic with exact D-12 phrasing |
| `## Path B — Spec File Parsing` | 88–130 | H2/H3 spec structure documentation; cross-spec auto-read rule (exact Pitfall 5 wording); screen-level spec gate ("Which component should I build?"); component name derivation from H2 heading |
| `## Output Rules` | 132–277 | Single file only; filename Bluefish[ComponentName].tsx to ./; TypeScript interface extending MUI props; named export; MUI wrapping pattern; import type rule (CORRECT/INCORRECT examples); dual-path token output block with ⚠️ flag; dataviz token format; typography annotations; ARIA required; React 19 no-forwardRef note; MCP-unavailable comment placement; pre-return checklist reference (name-only, no bullet restatement); complete BluefishButton.tsx example |
| `## Anti-Patterns — Do Not Do These` | 279–331 | Seven bullets: no user path choice, no get_metadata call (bf-spec sequence), no scaffold files, no write to ~/.claude/skills/, dual-path required, no re-calling get_variable_defs, no inventing dataviz token paths |

## Symlink Verification

```
ls -la ~/.claude/skills/bf-build
→ lrwxr-xr-x@ 1 pcartelli staff 48 Jun 12 10:40 bf-build -> /Users/pcartelli/dev/bluefish-ai-skills/bf-build

readlink ~/.claude/skills/bf-build
→ /Users/pcartelli/dev/bluefish-ai-skills/bf-build (absolute path, no trailing slash)

test -f ~/.claude/skills/bf-build/SKILL.md → passes
grep -c '^name: bf-build' ~/.claude/skills/bf-build/SKILL.md → 1
```

All five bf-* skill symlinks now follow identical conventions (absolute source path, no trailing slash):
- bf-build → /Users/pcartelli/dev/bluefish-ai-skills/bf-build ← new
- bf-explore → /Users/pcartelli/dev/bluefish-ai-skills/bf-explore
- bf-prototype → /Users/pcartelli/dev/bluefish-ai-skills/bf-prototype
- bf-spec → /Users/pcartelli/dev/bluefish-ai-skills/bf-spec
- bluefish-design-system → /Users/pcartelli/dev/bluefish-ai-skills/bluefish-design-system

## Grep Verification Results

```
name: bf-build in frontmatter                         → found ✓
@include line present                                 → found ✓
fallback blockquote ("did not load above")            → found ✓
## Support Files — Read On Demand (exact heading)     → found ✓
## Intake                                             → found ✓
## Figma Context — Always Attempt First               → found ✓
## Path B — Spec File Parsing                         → found ✓
## Output Rules                                       → found ✓
## Anti-Patterns — Do Not Do These                    → found ✓
get_variable_defs                                     → found ✓
get_design_context                                    → found ✓
"planned, not yet available"                          → 0 results ✓
DATA-03                                               → 0 results ✓
"token injection method unconfirmed"                  → found ✓
"What component should I build"                       → found ✓
"Which component should I build"                      → found ✓
Bluefish[ComponentName].tsx                           → found ✓
color-roles/dataviz                                   → found ✓
color-dataviz/categorical                             → 0 results ✓
/* type:                                              → found ✓
import type                                           → found ✓
get_metadata (expect ≤3 lines, only in anti-patterns) → lines 303-306, anti-patterns only ✓
```

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Verify grep for `color-dataviz/categorical` would fail on anti-pattern bullet**

- **Found during:** Task 1 automated verification
- **Issue:** The plan's `<action>` section (section 9) explicitly instructs including an anti-pattern bullet: "Inventing token paths like `color-dataviz/categorical/*` for dataviz — read tokens.md color-roles/dataviz table before generating any chart code." However, the `<verify>` block included `! grep -q 'color-dataviz/categorical' ~/dev/bluefish-ai-skills/bf-build/SKILL.md` — a check that would fail if the exact string appeared anywhere in the file, including in the anti-pattern bullet itself. This is a contradiction in the plan specification.
- **Fix:** Rewrote the anti-pattern bullet to convey the same warning ("do not invent categorical or semantic dataviz paths") without using the exact `color-dataviz/categorical` string. The conceptual warning is fully preserved — the invented-path pattern is described in words that don't trigger the grep. The anti-pattern still instructs reading `tokens.md` and using `color-roles/dataviz/[NN]/[property]` as the correct format.
- **Files modified:** ~/dev/bluefish-ai-skills/bf-build/SKILL.md
- **Commit:** b5db9ae (part of main SKILL.md commit)

No other deviations. All locked decisions D-01 through D-12 are represented in the file exactly as specified. Section order, wording conventions, @include pattern, and anti-patterns structure all match the plan's requirements.

## Known Stubs

None. The SKILL.md is a complete skill instruction file. No hardcoded empty values, no placeholder text, no wired-but-missing data sources. The dual-path token output block is intentionally flagged with `⚠️ token injection method unconfirmed` per D-11 — this is the documented design decision, not a stub.

## Threat Flags

None. This plan creates a SKILL.md text file and a filesystem symlink. No network endpoints, no auth paths, no file access patterns changed, no schema changes.

## Self-Check

### Created files exist

- `~/dev/bluefish-ai-skills/bf-build/SKILL.md` — `test -f` passes ✓
- `~/.claude/skills/bf-build` (symlink) — `test -L` passes ✓
- `.planning/phases/05-bf-build/05-02-SUMMARY.md` — this file ✓

### Commits exist (bluefish-ai-skills repo)

- `b5db9ae` — Task 1: feat(05-02): create bf-build skill — production React/MUI component generator ✓
- Task 2 (symlink): `ln -s` command; symlink is a filesystem object, not tracked by git ✓

## Self-Check: PASSED
