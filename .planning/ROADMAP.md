# Roadmap

**Project:** Bluefish Design System Skill System
**Phases:** 3 | **Requirements:** 11 (v1) | **Mode:** Vertical MVP

---

## Phase Summary

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|-----------------|
| 1 | Foundation | Clean shared context layer | FOUND-01, FOUND-02, FOUND-03 | 3 |
| 2 | /bf-explore | Working layout variation command | EXPL-01, EXPL-02, EXPL-03, EXPL-04 | 4 |
| 3 | /bf-prototype | Working prototype command | PROT-01, PROT-02, PROT-03, PROT-04, PROT-05 | 4 |

---

## Phase Details

### Phase 1: Foundation
**Goal:** Refactor `bluefish-design-system` into a clean shared context layer that command skills can inherit from — no workflow logic, just the authoritative Bluefish reference.
**Mode:** mvp

**Requirements:** FOUND-01, FOUND-02, FOUND-03

**Plans:** 2 plans

Plans:
- [x] 01-01-PLAN.md — Refactor SKILL.md: rewrite description, remove Screen Workflow, fix stale cross-reference ✓ 2026-05-08
- [x] 01-02-PLAN.md — Audit all five support files: verify outline rename, attach audit stamps, flag drift ✓ 2026-05-08

**Success Criteria:**
1. `bluefish-design-system` SKILL.md contains only shared context — any team member reading it can understand the design system without seeing command-specific workflow steps
2. Each skill's `description:` field is specific enough to auto-trigger without a slash command (test: describe a task to Claude without typing a command and verify the right skill fires)
3. All five support files verified — outline token rename applied, no stale token paths, type styles consistent with current Figma state

**Scope:**
- Audit current `SKILL.md` for what is truly shared vs. command-specific
- Extract `explore this`, `build this`, `spec this`, `prototype this` workflow sections → to be moved into command skills in Phases 2–3
- Rewrite foundation `SKILL.md` to be context-only: token rules, a11y, Figma reading, component conventions, known gaps
- Audit and update support files: tokens.md, type-styles.md, tokens-dataviz.md, figma-reading-guide.md, spec-template.md
- Rewrite `description:` fields for all existing skills

**Dependencies:** None

**Plans:** 2 plans | **Wave 1** (all plans parallel — zero file overlap)
- `01-01-PLAN.md` — Refactor SKILL.md (description + Screen Workflow removal + stale ref fix) | FOUND-01, FOUND-02
- `01-02-PLAN.md` — Audit 5 support files (verify outline rename, flag drift) | FOUND-03

---

### Phase 2: /bf-explore
**Goal:** Team can type `/bf-explore` (or describe an exploration need) and receive 2–3 meaningfully distinct, Bluefish-annotated HTML layout variations.
**Mode:** mvp

**Requirements:** EXPL-01, EXPL-02, EXPL-03, EXPL-04

**Success Criteria:**
1. `/bf-explore` skill exists and is invocable via slash command
2. Output contains 2–3 distinct HTML variations with meaningfully different layout or interaction patterns (not cosmetic tweaks)
3. Every Bluefish token value in output is annotated inline — no unannotated color, spacing, or radius values
4. Validated against the existing `explorations/` reference: output quality and token coverage matches or exceeds those files

**Scope:**
- Create `~/.claude/skills/bf-explore/SKILL.md`
- Port `explore this` workflow from current SKILL.md (Phase 1 will have extracted it)
- Define trigger: fires on explicit `/bf-explore` OR when user describes a layout exploration need for a Bluefish screen
- Output rules: 2–3 variations as fenced HTML blocks, inline token annotations, `⚠️` flags for missing tokens
- Reference implementation: `explorations/variation-a.html`, `variation-b.html`, `variation-c.html`

**Dependencies:** Phase 1 (foundation SKILL.md refactored, shared context clean)

---

### Phase 3: /bf-prototype
**Goal:** Team can type `/bf-prototype` and receive a working Bluefish prototype — either a quick HTML prototype or a runnable Vite+MUI app — with zero hardcoded hex or px values.
**Mode:** mvp

**Requirements:** PROT-01, PROT-02, PROT-03, PROT-04, PROT-05

**Success Criteria:**
1. `/bf-prototype` skill exists and is invocable via slash command
2. HTML prototype mode delivers a working, styled prototype in one session with correct token usage
3. Vite+MUI mode delivers a runnable prototype (`npm run dev`) with interaction states and MUI wrapping pattern applied
4. Token compliance check: grep output for hex patterns — zero matches outside of `⚠️` flagged exceptions

**Scope:**
- Create `~/.claude/skills/bf-prototype/SKILL.md`
- Port `prototype this` workflow from current SKILL.md (Phase 1 will have extracted it)
- Two sub-modes: HTML (quick) and Vite+MUI (interactive) — user selects or skill infers from context
- Interaction state rules: `useState` for interactive states, `alignSelf: flex-start` for selected item backgrounds
- Token compliance pre-return checklist (inline, not as a separate step)
- Handle Code Connect / DATA-03 gaps gracefully (dual-path output + `⚠️` flags)
- Trigger: fires on explicit `/bf-prototype` OR when user asks to prototype a Bluefish screen

**Dependencies:** Phase 1 (foundation clean), Phase 2 (explore pattern informs structure)

---

## v2 Phases (Future)

### Phase 4: /bf-spec
Spec output from Figma screen via MCP. Blocked on Code Connect configuration (engineering dependency). Define spec when Code Connect blocker has a resolution timeline.

### Phase 5: /bf-build
Production React/MUI code generation. Blocked on token injection method confirmation (DATA-03). Define spec when engineering confirms the injection mechanism.

### Phase 6: Extended Commands + AI Insights
- `/bf-audit`: scan code for hardcoded values
- `/bf-tokens`: token lookup and design decision support
- `/bf-handoff`: spec + implementation notes for engineering
- AI Insights screen pattern library (KPI strip, trend charts, card grid, detail panel)

---

## Milestone: v1 Complete

**Definition:** All three phases complete, every v1 requirement checked off, `/bf-explore` and `/bf-prototype` in active use by the team.

**Gate:** Two real Bluefish screens prototyped and explored using the skills — output validated by design review.
