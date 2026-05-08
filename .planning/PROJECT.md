# Bluefish Design System Skill System

## What This Is

A set of Claude Code skills that give the Bluefish product team zero-effort design language alignment. Designers and engineers invoke focused slash commands (`/bf-explore`, `/bf-prototype`, `/bf-spec`, `/bf-build`) and get Bluefish-compliant output — correct tokens, components, spacing, and WCAG standards — without manually loading token rules or design conventions each session.

The system has two layers: a shared foundation skill (`bluefish-design-system`) that holds all Bluefish context, and command skills that each handle a specific workflow stage.

## Core Value

Start a screen and the Bluefish design language just works — no manual token lookup, no per-session setup, no drift.

## Requirements

### Validated

- ✓ Token system defined (color-roles, scale, palette, dataviz) — existing
- ✓ WCAG AA rules documented with per-case recovery patterns — existing
- ✓ Figma reading guide (M3 mapping, component naming, property parsing) — existing
- ✓ Spec template defined (spec-template.md) — existing
- ✓ `explore this` workflow works end-to-end (confirmed by explorations/) — existing
- ✓ Prototype scaffold (Vite + MUI) documented in SKILL.md — existing

### Active

- [ ] Foundation layer refactored: shared context separated from command-specific workflow rules
- [ ] `/bf-explore` skill: focused layout variation generator with Bluefish token annotation
- [ ] `/bf-prototype` skill: Bluefish-aligned HTML or Vite+MUI prototype with interaction states
- [ ] `/bf-spec` skill: spec output from Figma screen via MCP (spec-template.md format)
- [ ] `/bf-build` skill: production React/MUI code with strict token compliance
- [ ] All four command skills are team-ready: clear triggers, correct output, consistent quality

### Out of Scope

- Figma scripter CLI tools (color-scale-generator, token-exporter, etc.) — separate project, separate repo
- Code Connect setup — engineering dependency, not a skill problem
- Token injection method (DATA-03) resolution — engineering dependency
- `/bf-audit`, `/bf-tokens`, `/bf-handoff` — v2, after core command skills are proven
- AI Insights–specific screen patterns — v2, after foundation and command skills are solid

## Context

**Current skill state:** A single monolithic `SKILL.md` at `~/.claude/skills/bluefish-design-system/` covers token rules, accessibility, Figma reading, and all three screen workflow modes (spec / build / explore) in one file. Support files (figma-reading-guide.md, spec-template.md, tokens.md, tokens-dataviz.md, type-styles.md) are solid and complete.

**What's been proven:** The `explore this` workflow works — `explorations/` contains three Bluefish-aligned HTML layout variations for an AI Insights dashboard, correctly using CSS custom properties matching token convention. This is the reference implementation.

**Active engineering gaps that affect the skill (not fixable here):**
- Code Connect not configured — `get_design_context` may interrupt with Code Connect prompt
- Token injection method unconfirmed (DATA-03) — code outputs use a dual-path `⚠️` pattern as interim workaround
- Figma M3→color-roles variable migration in progress — M3-style names still appear in some variables

**Design gaps documented in SKILL.md:**
- Elevation tokens undefined
- Dark mode contrastText fails WCAG AA on warning/info/success
- DV series 04, 10, 13, 25, 29 contrast failures on `main` background

## Constraints

- **Execution environment**: Claude Code skills only — no separate build, no package, no runtime
- **Foundation files**: `figma-reading-guide.md`, `spec-template.md`, `tokens.md`, `tokens-dataviz.md`, `type-styles.md` must remain authoritative and be referenced by command skills, not duplicated
- **Team-ready from day one**: every skill must have a clear trigger description, predictable output quality, and handle the Code Connect / DATA-03 gaps gracefully
- **Build and refactor together**: first command skill shapes the foundation split — don't refactor the foundation in isolation first

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Skill system over single monolithic skill | One trigger can't reliably cover design → prototype → spec → build across a team | — Pending |
| Build and refactor together | First command skill reveals where the foundation split actually belongs | — Pending |
| Start with `/bf-explore` or `/bf-prototype` | Explore has no Figma MCP dependency (simpler), but prototype is the most urgent current need | — Pending |
| Team-ready from day one, not solo-first | Small overhead now avoids rework when team adopts | — Pending |

---
*Last updated: 2026-05-08 after initialization*

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition:**
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone:**
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state
