---
phase: 05-bf-build
plan: "01"
subsystem: skill-routing
tags: [routing-reclaim, skill-authoring, bf-build, bf-prototype, bf-spec, bluefish-design-system]
dependency_graph:
  requires: []
  provides: [routing-reclaim-complete, bf-build-trigger-exclusive]
  affects: [bf-prototype/SKILL.md, bf-spec/SKILL.md, bluefish-design-system/SKILL.md, README.md]
tech_stack:
  added: []
  patterns: [find-and-replace-edits, grep-verification]
key_files:
  created: []
  modified:
    - ~/dev/bluefish-ai-skills/bf-prototype/SKILL.md
    - ~/dev/bluefish-ai-skills/bf-spec/SKILL.md
    - ~/dev/bluefish-ai-skills/bluefish-design-system/SKILL.md
    - ~/dev/bluefish-ai-skills/README.md
decisions:
  - "D-13 routing reclaim executed — all 7 edits applied across 4 files before bf-build SKILL.md is authored in Plan 02"
  - "README install instructions kept in cp -r form per 05-RESEARCH.md Open Question 1 (external-team-facing)"
  - "bluefish-design-system description updated to enumerate 'explore, prototype, spec, or build task' — four-skill enumeration"
metrics:
  duration: "~10 minutes"
  completed: "2026-06-12"
  tasks_completed: 2
  files_modified: 4
---

# Phase 5 Plan 01: Routing Reclaim — Remove Interim bf-build Language

Seven concrete find-and-replace edits across four existing files in `~/dev/bluefish-ai-skills/` that remove all "planned, not yet available" and "until bf-build ships" interim language, so the bf-build skill (Plan 02) can exclusively claim build/implement trigger anchors with no routing conflict.

## Tasks Completed

| Task | Name | Commit (bluefish-ai-skills) | Files |
|------|------|-----------------------------|-------|
| 1 | Apply six SKILL.md routing reclaim edits | eaf722e | bf-prototype/SKILL.md, bf-spec/SKILL.md, bluefish-design-system/SKILL.md |
| 2 | Update README.md — replace known-limitation entry, add table row, usage example, install line | c4b4516 | README.md |

## Edits Applied

### Task 1 — Six SKILL.md edits across three files

**Edit 1 — bf-prototype/SKILL.md frontmatter (line 8)**
- Replaced: `(bf-build — planned, not yet available).`
- With: `(use bf-build).`

**Edit 2 — bf-prototype/SKILL.md anti-patterns section**
- Replaced: `Until /bf-build ships, the foundation skill handles build requests; offer this skill explicitly if the user wants something prototype-grade now.`
- With: `Use /bf-build for production component output.`

**Edit 3 — bf-spec/SKILL.md frontmatter (line 8)**
- Replaced: `planned, not yet available).`
- With: `use bf-build).`

**Edit 4 — bf-spec/SKILL.md anti-patterns section (lines 257-258, multi-line)**
- Replaced: `"implement" as standalone triggers. Until /bf-build ships, the foundation skill handles\n  build requests.`
- With: `"implement" as standalone triggers. Use /bf-build for production component output.`
- Note: edit required capturing the two-line span; single-line match failed, caught during execution

**Edit 5 — bluefish-design-system/SKILL.md frontmatter description**
- Replaced: `specific explore, prototype, or spec task — including build and implementation\n  requests until the dedicated bf-build skill ships.`
- With: `specific explore, prototype, spec, or build task.`

**Edit 6 — bluefish-design-system/SKILL.md Known Gaps section**
- Removed: entire line `- [ ] No /bf-build skill yet — build/implement requests are handled by this foundation (apply token + accessibility rules directly; offer bf-prototype for scaffolding) until Phase 5 ships.`
- Adjacent lines (Code Connect gap above, get_variable_defs gap below) left undisturbed

### Task 2 — Four README.md changes

**Replacement 1 — Known limitations bullet**
- Replaced: `- **No /bf-build yet** — production React/MUI component generation is planned...`
- With: `- **\`/bf-build\` output is a component file only** — no scaffold, no App.tsx, no main.tsx. Drop the generated .tsx file into your Vite+MUI project.`

**Insertion 1 — Skills table row**
- Added after bf-spec row: `| \`bf-build\` | \`/bf-build\` | Generates a production-ready TypeScript React/MUI component file from a Figma frame or spec file |`

**Insertion 2 — Usage section example**
- Added after /bf-spec usage block: **Build a production component:** code fence with `/bf-build the Button component` and trailing description mentioning `BluefishButton.tsx`

**Insertion 3 — Install section line**
- Added after `cp -r bf-spec ~/.claude/skills/`: `cp -r bf-build ~/.claude/skills/`

## Verification Results

All greps passed post-edit:

```
grep -r "planned, not yet available" ~/dev/bluefish-ai-skills/  → 0 results ✓
grep -rE "until.*bf-build.*ships" ~/dev/bluefish-ai-skills/     → 0 results ✓
grep -c "Use /bf-build for production component output" bf-prototype/SKILL.md → 1 ✓
grep -c "Use /bf-build for production component output" bf-spec/SKILL.md      → 1 ✓
grep -c "explore, prototype, spec, or build task" bluefish-design-system/SKILL.md → 1 ✓
grep -c "No /bf-build skill yet" bluefish-design-system/SKILL.md               → 0 ✓
grep -c "bf-build" README.md                                                   → 4 ✓ (>=3)
grep -c "output is a component file only" README.md                            → 1 ✓
grep -c "/bf-build the Button component" README.md                             → 1 ✓
grep -c "cp -r bf-build ~/.claude/skills/" README.md                          → 1 ✓
grep -c "BluefishButton.tsx" README.md                                         → 1 ✓
bf-build row after bf-spec in Skills table                                     → ok ✓
cp -r bf-build after cp -r bf-spec in Install section                         → ok ✓
```

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] bf-spec/SKILL.md anti-pattern bullet spanned two lines**
- **Found during:** Task 1, Edit 4
- **Issue:** The plan cited `Until /bf-build ships, the foundation skill handles build requests.` as a single-line string (per 05-RESEARCH.md lines 257-258 notation). The actual file had this text split across two lines with leading spaces: `...the foundation skill handles\n  build requests.`
- **Fix:** Extended the `old_string` to include both lines with the line break and leading whitespace; replacement collapsed to a single line
- **Files modified:** bf-spec/SKILL.md
- **Commit:** eaf722e

No other deviations. All six SKILL.md edits and four README.md changes applied exactly as specified in 05-RESEARCH.md and 05-PATTERNS.md.

## Known Stubs

None. This plan applies text edits only — no new code, no new UI, no data sources. All edits are complete in-place replacements or deletions.

## Threat Flags

None. This plan modifies skill instruction text files only. No network endpoints, no auth paths, no file access patterns, no schema changes.

## Self-Check

### Created files exist

- `.planning/phases/05-bf-build/05-01-SUMMARY.md` — this file ✓

### Commits exist (bluefish-ai-skills repo)

- `eaf722e` — Task 1 commit ✓
- `c4b4516` — Task 2 commit ✓

## Self-Check: PASSED
