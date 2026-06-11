---
phase: 04-bf-spec
plan: "02"
subsystem: skills
tags: [claude-skills, bluefish, figma, bf-spec, spec-generation, mcp]

# Dependency graph
requires:
  - phase: 04-01
    provides: "~/.claude/skills/bf-spec/ directory created (empty) — SKILL.md can be written"
  - phase: 03-bf-prototype
    provides: "bf-prototype/SKILL.md as structural template; @include pattern; MCP-first rule; Code Connect fallback"
provides:
  - "~/.claude/skills/bf-spec/SKILL.md — spec generation command skill, 10 sections, all acceptance criteria passing"
  - "bf-spec skill fires on /bf-spec, 'spec', 'handoff doc', 'engineering spec', 'component inventory'"
  - "Three-tool MCP sequence (get_metadata → get_variable_defs → get_design_context) encoded in Figma Context section"
  - "Screen mode and component mode output rules with spec-template.md field mapping references"
  - "Sub-component recursion rules (D-11, D-12, D-13) — figma-reading-guide.md Step 3 trigger list"
affects:
  - 04-03 (human checkpoint — smoke tests this skill's invocation and output quality)
  - 05 (bf-build reads component mode spec output as Path B input — file format established here)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Scope inference from Figma selection (get_metadata) instead of mode-question intake"
    - "Three-tool MCP sequence: get_metadata (once) → get_variable_defs (once, shared) → get_design_context (per component)"
    - "Sub-component recursion bounded by figma-reading-guide.md Step 3 category match"
    - "MCP-unavailable diagnostic as Markdown blockquote (not HTML/JSX comment — spec output is Markdown)"
    - "Sub-component sections inlined as ### Sub-component: [Name] under parent ## [Component Name]"

key-files:
  created:
    - "~/.claude/skills/bf-spec/SKILL.md — spec generation command skill (10 sections)"
  modified: []

key-decisions:
  - "No mode question in Intake — bf-spec infers screen vs. component mode from get_metadata response (D-01)"
  - "get_metadata called first in MCP sequence (before get_variable_defs) to provide frame identity for filename and document header (D-08, D-09)"
  - "get_variable_defs called once per invocation and shared across all components — never re-fetched per component (D-10)"
  - "Sub-component recursion depth bounded at one level by default; deeper composites become their own /bf-spec invocations (D-11)"
  - "MCP-unavailable diagnostic is a Markdown blockquote (not HTML comment) because bf-spec output is Markdown spec docs, not HTML/TSX"

patterns-established:
  - "Pattern: bf-spec Intake section opens with 'Do not ask a mode question.' — this is the explicit anti-pattern guard distinguishing bf-spec from bf-prototype"
  - "Pattern: Figma Context section uses 4-step numbered list: get_metadata (scope inference) → get_variable_defs → get_design_context per component → Code Connect fallback"
  - "Pattern: All spec output references spec-template.md and figma-reading-guide.md by file path rather than re-listing their contents inline"

requirements-completed: [SPEC-01, SPEC-02]

# Metrics
duration: 15min
completed: 2026-06-11
---

# Phase 4 Plan 02: bf-spec SKILL.md Summary

**10-section bf-spec command skill with scope-inference intake, three-tool MCP sequence (get_metadata → get_variable_defs → get_design_context), screen/component mode output rules, and sub-component recursion rules — all 30 acceptance criteria passing**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-06-11T14:00:00Z
- **Completed:** 2026-06-11T14:15:00Z
- **Tasks:** 1
- **Files modified:** 1 (new file — `~/.claude/skills/bf-spec/SKILL.md`)

## Accomplishments

- Wrote `~/.claude/skills/bf-spec/SKILL.md` with all 10 sections in correct order: frontmatter → @include → heading + summary → Support Files → Intake (scope-inference, no mode question) → Figma Context (three-tool MCP sequence) → Screen Mode Output Rules → Component Mode Output Rules → Sub-Component Recursion Rules → Anti-Patterns
- All 30 acceptance criteria pass: section presence, section ordering (line numbers strictly increasing), MCP sequence order, flag vocabulary, reference paths, and trigger discrimination
- Encoded D-01 through D-13 locked decisions; SPEC-01 and SPEC-02 satisfied at the source-artifact level

## Task Commits

Each task was committed atomically:

1. **Task 1: Write bf-spec SKILL.md (10 sections, exact order)** — skill file written to `~/.claude/skills/bf-spec/SKILL.md`; not a git-tracked file (skills directory is outside the repo)

**Plan metadata:** see final commit hash below

## Files Created/Modified

- `~/.claude/skills/bf-spec/SKILL.md` — new file; 10-section spec generation command skill; not git-tracked (outside repo)

## Decisions Made

- **MCP-unavailable diagnostic uses Markdown blockquote.** bf-prototype uses HTML `<!-- -->` / JSX `{/* */}` comments for its diagnostic because output is HTML/TSX. bf-spec output is Markdown spec docs, so the diagnostic is a `> blockquote` at the top of the spec file. This is consistent with the plan interfaces block specification.
- **Section 9 (Sub-Component Recursion) written as paragraph blocks, not a numbered list.** The 5 blocks (recursion trigger rule, non-matching rule, inline heading format, Code Connect on sub-component, depth note) are written as prose paragraphs rather than numbered items. This matches the content structure better and avoids conflating them with the numbered output rules in Sections 7 and 8.
- **figma-reading-guide.md trigger list NOT re-listed inline.** Section 9 references `figma-reading-guide.md` Step 3 by file path and lists the 6 category names (Navigation, Buttons & Capsules, etc.) only as orientation context. The authoritative table stays in the guide file per D-11 requirement.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None. All files from Plan 01 pre-work were in place. The directory `~/.claude/skills/bf-spec/` existed (created by Plan 01). All acceptance criteria grepped clean on first write.

## Threat Surface Scan

No new network endpoints, auth paths, file access patterns, or schema changes introduced. The deliverable is a Markdown skill instruction file. T-04-02 (trigger collision with bf-build) mitigated — description field contains "Not for ... production code (use bf-build)" which anchors bf-build exclusion; 0 standalone "build" or "implement" occurrences in description lines. T-04-03 (spec output path) mitigated — skill instructs writing to `./` and Anti-Patterns section explicitly forbids writing to `~/.claude/skills/bluefish-design-system/`.

## Known Stubs

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- `~/.claude/skills/bf-spec/SKILL.md` exists with all 10 sections — Plan 03 human checkpoint can smoke test the skill
- Foundation routing confirmed (from Plan 01): bluefish-design-system description already excludes "spec" triggers — no interception
- Component mode output format (spec-[component-name].md, spec-template.md structure) established — Phase 5 /bf-build Path B can depend on this format

---

## Self-Check

**File existence:**
- `~/.claude/skills/bf-spec/SKILL.md` — FOUND

**Acceptance criteria key results (all passed):**
- name: bf-spec — 1 match
- @include line — 1 match
- All 10 section headings — 1 each
- Do not ask a mode question — 1 match
- What screen or component are you speccing? — 1 match
- get_metadata — 10 matches (requirement: ≥3)
- get_variable_defs — 6 matches (requirement: ≥2)
- get_design_context — 9 matches (requirement: ≥3)
- MCP sequence order (get_metadata before get_variable_defs) — OK
- MCP sequence order (get_variable_defs before get_design_context) — OK
- Sub-component heading format — 4 matches
- Component Inventory — 4 matches
- current working directory — 3 matches
- Code Connect not configured — 3 matches (requirement: ≥2)
- custom layout flag — 1 match
- MCP unavailable flag — 1 match
- spec-template.md — 9 matches (requirement: ≥2)
- figma-reading-guide.md — 5 matches (requirement: ≥2)
- description excludes standalone build/implement — 0 matches (PASS)
- Only 1 @include line — 1 match
- No duplicate Anti-Patterns — 1 match
- Section ordering strictly increasing: 30 → 48 → 94 → 137 → 175 → 201

## Self-Check: PASSED

---

*Phase: 04-bf-spec*
*Completed: 2026-06-11*
