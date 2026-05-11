---
phase: 03-bf-prototype
plan: 01
subsystem: ui
tags: [claude-skill, bluefish, figma-mcp, vite, mui, html-prototype]

requires:
  - phase: 01-foundation
    provides: bluefish-design-system SKILL.md with @include pattern, token rules, 8-point checklist
  - phase: 02-bf-explore
    provides: bf-explore SKILL.md as structural analog for command skill format

provides:
  - /bf-prototype command skill at ~/.claude/skills/bf-prototype/SKILL.md
  - HTML prototype mode with inline token annotation and CSS/JS interaction states
  - Vite+MUI scaffold mode with App.tsx + wiring files, DATA-03 dual-path, useState interaction states

affects: [05-bf-build, any future command skill referencing bf-prototype as structural analog]

tech-stack:
  added: []
  patterns:
    - "Always-attempt-MCP-first pattern: skill calls get_variable_defs + get_figma_data before generation regardless of user context"
    - "Token drift flagging: when live Figma value differs from tokens.md, use live value and annotate both with ⚠️ token drift comment"
    - "Three-path intake gate: mode question always first, screen question only on bare invoke"

key-files:
  created:
    - ~/.claude/skills/bf-prototype/SKILL.md
  modified: []

key-decisions:
  - "Figma MCP calls are always attempted before generation (not conditional on user mentioning Figma) — discovered during human verification that conditional gating caused MCP to be skipped"
  - "Token drift: live Figma value is authoritative; drift from tokens.md is flagged inline with both values"
  - "Three-path intake: mode question first regardless of context; screen question only on bare invoke (max 2 questions)"
  - "HTML mode: single prototype with nav shell scope, CSS :hover + JS class toggle for interaction states"
  - "Vite+MUI mode: App.tsx primary + main.tsx + index.html wiring blocks; DATA-03 dual-path on all token references"

patterns-established:
  - "MCP-first: always attempt get_variable_defs then get_figma_data before generating; gracefully fall back to tokens.md on failure"
  - "Token drift annotation: /* color-roles/primary/main — live: #005566, tokens.md: #00414F ⚠️ token drift — using live Figma value */"

requirements-completed: [PROT-01, PROT-02, PROT-03, PROT-04, PROT-05]

duration: 45min
completed: 2026-05-11
---

# Phase 3: /bf-prototype Summary

**`/bf-prototype` command skill delivering HTML prototype + Vite+MUI scaffold modes with always-first MCP grounding and token drift flagging**

## Performance

- **Duration:** ~45 min
- **Completed:** 2026-05-11
- **Tasks:** 2 (Task 1: write SKILL.md; Task 2: human verify)
- **Files modified:** 1

## Accomplishments

- `~/.claude/skills/bf-prototype/SKILL.md` created with all nine sections in correct order
- All 15 automated acceptance criteria pass (grep-verified)
- Human verification surfaced two issues — both fixed before sign-off:
  1. Figma MCP calls changed from conditional to always-attempt-first
  2. Token drift handling added with explicit inline annotation pattern
- PROT-01 through PROT-05 satisfied

## Files Created/Modified

- `~/.claude/skills/bf-prototype/SKILL.md` — complete command skill: frontmatter, @include, intake gate, Figma context (always-attempt), HTML mode output rules, Vite+MUI mode output rules, anti-patterns

## Decisions Made

- **MCP always-first (post-verification fix):** Human testing showed the "opportunistic" framing caused the skill to skip MCP when screen context was provided in the message. Changed to: always attempt `get_variable_defs` + `get_figma_data` before generating, fall back only if calls fail or return empty.
- **Token drift pattern:** `get_variable_defs` is authoritative; when its values diverge from `tokens.md`, skill flags both values inline so the discrepancy is visible in generated output.

## Deviations from Plan

### Fixes Applied During Human Verification

**1. Figma Context section — MCP gating**
- **Found during:** Task 2 human verification (test scenario #2)
- **Issue:** Section was conditional ("if Figma is open") — skill skipped MCP when user provided screen context in message
- **Fix:** Changed section to "Always Attempt First" with explicit pre-generation rule; added graceful fallback
- **Verification:** User re-tested and confirmed MCP called first

**2. Token drift — no handling specified**
- **Found during:** Task 2 human verification
- **Issue:** No guidance on what to do when live Figma token values differ from tokens.md
- **Fix:** Added `Token drift:` rule with inline annotation pattern showing both live and tokens.md values

---

**Total deviations:** 2 fixes (both surfaced and resolved during human verification gate)
**Impact:** Both fixes improve correctness; no scope change.

## Issues Encountered

None beyond the two items caught and fixed during human verification.

## Self-Check: PASSED

## Next Phase Readiness

- Phase 3 complete — v1 Bluefish skill system (bf-explore + bf-prototype) delivered
- Phase 4 depends on Code Connect timeline (engineering prerequisite for /bf-spec)
- Phase 5 (/bf-build) can proceed independently when ready

---
*Phase: 03-bf-prototype*
*Completed: 2026-05-11*
