# Roadmap

**Project:** Bluefish Design System Skill System
**Phases:** 5 | **Requirements:** 15 (v1 + v1.1) | **Mode:** Vertical MVP

---

## Phase Summary

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|-----------------|
| 1 | Foundation | Clean shared context layer | FOUND-01, FOUND-02, FOUND-03 | 3 ✓ 2026-05-11 |
| 2 | /bf-explore | Working layout variation command | EXPL-01, EXPL-02, EXPL-03, EXPL-04 | 4 ✓ 2026-05-11 |
| 3 | /bf-prototype | 1/1 | Complete    | 2026-05-11 |
| 4 | /bf-spec | 3/3 | Complete    | 2026-06-11 |
| 5 | /bf-build | 1/3 | In Progress|  |

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

**Plans:** 1 plan

Plans:
- [x] 02-01-PLAN.md — Create bf-explore SKILL.md with intake gate, output rules, inline token annotation, and human verification ✓ 2026-05-11

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

**Plans:** 1/1 plans complete

Plans:
- [x] 03-01-PLAN.md — Create bf-prototype SKILL.md with three-path intake gate, HTML and Vite+MUI output rules, token compliance, and human verification

---

### Phase 4: /bf-spec
**Goal:** Team can type `/bf-spec` on any Figma screen and receive a structured engineering handoff doc — component inventory, token table, interaction notes, and accessibility section — generated via the three-tool Figma MCP sequence.
**Depends on:** Phase 3
**Requirements:** SPEC-01, SPEC-02
**Success Criteria** (what must be TRUE):
  1. `bf-spec/SKILL.md` exists at `~/.claude/skills/bf-spec/SKILL.md` and the skill is invocable via `/bf-spec`
  2. Skill executes the correct MCP sequence — `get_metadata` first, then `get_variable_defs`, then `get_design_context` per sub-component — without reversing order or skipping tools
  3. When `get_design_context` returns a Code Connect prompt instead of component data, the skill emits a `⚠️ Code Connect not configured` flag and continues — output is never blocked
  4. Skill fires correctly when user types `/bf-spec` or asks for a spec or handoff doc for a Bluefish screen
**Plans:** 3 plans | **Wave 1** (pre-work) → **Wave 2** (author SKILL.md) → **Wave 3** (human verify)

Plans:
- [x] 04-01-PLAN.md — Confirm foundation description exclusion clause + create bf-spec/ directory (pre-work)
- [x] 04-02-PLAN.md — Author bf-spec/SKILL.md (10 sections: frontmatter, @include, summary, support files, scope-inference intake, three-tool MCP sequence, screen mode rules, component mode rules, sub-component recursion, anti-patterns)
- [x] 04-03-PLAN.md — Human verify five scenarios (bare invoke, context invoke, auto-trigger, screen mode, component mode)

**Pre-work:** Update `bluefish-design-system` foundation description to exclude "spec" and "build" triggers before Phase 4 testing begins — handled by Plan 04-01

---

### Phase 5: /bf-build
**Goal:** Team can type `/bf-build` and receive a production-ready React/MUI component with full TypeScript props, Bluefish token compliance, and DATA-03 dual-path output — whether starting from a Figma frame or an existing `/bf-spec` output file.
**Depends on:** Phase 4
**Requirements:** BUILD-01, BUILD-02
**Success Criteria** (what must be TRUE):
  1. `bf-build/SKILL.md` exists at `~/.claude/skills/bf-build/SKILL.md` and the skill is invocable via `/bf-build`
  2. Path A works: Figma frame open → skill reads frame via MCP (`get_variable_defs` + `get_design_context`) and produces a TypeScript React component
  3. Path B works: existing `spec-[component].md` file provided → skill reads spec file and produces a TypeScript React component without requiring a Figma frame
  4. Skill fires correctly when user types `/bf-build` or asks to build or implement a Bluefish component from a spec or Figma frame
**Plans:** 1/3 plans executed

Plans:
- [x] 05-01-PLAN.md — Routing reclaim: 6 SKILL.md edits across bf-prototype/bf-spec/bluefish-design-system + 4 README.md changes (replacement + table row + usage example + install line)
- [ ] 05-02-PLAN.md — Author bf-build/SKILL.md with 10 sections (frontmatter, @include + fallback, summary, support files, intake, Figma Context Path A, Path B spec parsing, output rules, anti-patterns) + create ~/.claude/skills/bf-build symlink
- [ ] 05-03-PLAN.md — Human verify five scenarios (bare invoke, Path A Figma frame, Path B component spec, Path B screen spec inventory gate, Path B composite spec cross-reference auto-read)

**Pre-work:** Verify React version in Vite scaffold before authoring `forwardRef` rules (required in React 18, optional in React 19)

---

## v2 Phases (Future)

### Phase 6: Extended Commands + AI Insights
- `/bf-audit`: scan code for hardcoded values
- `/bf-tokens`: token lookup and design decision support
- `/bf-handoff`: spec + implementation notes for engineering
- AI Insights screen pattern library (KPI strip, trend charts, card grid, detail panel)

---

## Milestone: v1 Complete

**Definition:** All three phases complete, every v1 requirement checked off, `/bf-explore` and `/bf-prototype` in active use by the team.

**Gate:** Two real Bluefish screens prototyped and explored using the skills — output validated by design review.

---

## Milestone: v1.1 Complete

**Definition:** Phase 4 and Phase 5 complete, all four v1.1 requirements checked off (SPEC-01, SPEC-02, BUILD-01, BUILD-02), `/bf-spec` and `/bf-build` in active use by the team.

**Gate:** One real Bluefish screen carried end-to-end through `/bf-spec` → `/bf-build` — spec output verified by design review, component output compiles and matches Figma source.
