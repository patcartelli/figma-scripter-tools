---
phase: 01-foundation
type: walking-skeleton
created: 2026-05-08
---

# Walking Skeleton — Bluefish Skill System

The Walking Skeleton for this project is the thinnest end-to-end architecture that
proves the @include inheritance chain works. When Phase 1 is complete, the system
architecture is established: one foundation file that all future command skills will
load via @include, with verified shared context and no workflow logic.

This document records the architectural decisions that subsequent phases build on without
renegotiating.

---

## What the Walking Skeleton Proves

The minimum provable slice for this skill system:

1. **Foundation file exists and is clean** — SKILL.md at the canonical path contains only
   shared context (tokens, a11y, Figma reading, component conventions, code output rules)
   with all workflow routing removed.

2. **Description field triggers correctly** — The foundation's `description:` field uses
   noun-phrase knowledge domains. Claude can select it for design system questions without
   conflicting with future command skill triggers.

3. **@include contract is established** — Future command skills (Phase 2: bf-explore,
   Phase 3: bf-prototype) know exactly where to point their @include directive and what
   content they will receive.

4. **Support files are audited and stamped** — All five support files are verified clean
   and consistent. The on-demand Read pattern is preserved.

Analogy to a web app Walking Skeleton: "DB read" → skill file read. "UI interaction" →
skill trigger (Claude reads description, selects skill). "Dev deployment" → skill activation
in Claude Code session.

---

## Architectural Decisions (Locked for v1)

### Skill System Architecture

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Foundation loading | @include directive in command skill body | D-01: established pattern in this codebase; content inlined at activation |
| @include path notation | `@$HOME/` (not `@~/`) | Avoids historical parser edge case with consecutive `@~/` lines; consistent with GSD skills |
| Support file loading | On-demand Read (not @include upfront) | D-02: avoids loading all support files on every skill activation |
| Foundation path | `~/.claude/skills/bluefish-design-system/SKILL.md` | Unchanged from original — same path, refactored content |
| Workflow routing | Command skills own their verbs (explore, prototype, spec, build) | D-03: foundation is context fallback only, not a workflow router |

### File Layout

```
~/.claude/skills/
  bluefish-design-system/          ← Foundation skill (Phase 1)
    SKILL.md                       ← Shared context layer; no workflow logic
    tokens.md                      ← On-demand: token color + spacing reference
    type-styles.md                 ← On-demand: typography reference
    tokens-dataviz.md              ← On-demand: dataviz palette reference
    figma-reading-guide.md         ← On-demand: Figma MCP reading guide
    spec-template.md               ← On-demand: spec output format
  bf-explore/                      ← Phase 2 (not yet created)
    SKILL.md                       ← @includes foundation; owns "explore" workflow
  bf-prototype/                    ← Phase 3 (not yet created)
    SKILL.md                       ← @includes foundation; owns "prototype" workflow
```

### @include Contract for Command Skills

Every command skill created in Phase 2+ MUST follow this structure:

```yaml
---
name: bf-[command]
description: "[noun-phrase description of what this command does]"
---

<foundation>
@$HOME/.claude/skills/bluefish-design-system/SKILL.md
</foundation>

<workflow>
[Command-specific instructions here]
</workflow>
```

Rules:
- `@$HOME/` notation (not `@~/`) — avoids parser edge case
- `@` path on its own line — required for directive resolution
- `<foundation>` wrapper tag is optional but recommended for clarity
- Command skills may repeat or reference Code Output checklist items — no prohibition

### Skill Trigger Design

| Skill | Trigger pattern | Does NOT claim |
|-------|----------------|----------------|
| `bluefish-design-system` | Token lookup, a11y rules, Figma variable reading, component conventions, code output standards | explore, prototype, spec, build |
| `bf-explore` (Phase 2) | Layout exploration, variations, "explore this" | spec, build, prototype |
| `bf-prototype` (Phase 3) | Prototype generation, "prototype this", runnable component | spec, build, explore |

### Support File Audit Protocol

For each support file, Phase 1 establishes this audit pattern:
- Read the full file before editing
- Verify specific known drift items against the live state
- Flag drift inline (comment/note) — do not correct in Phase 1
- Append a dated audit stamp to the bottom of the file

This stamp pattern should be reused in future phases when support files are updated.

---

## What Phase 2 Inherits

When Phase 2 (bf-explore) begins, it can assume:
1. Foundation SKILL.md at `~/.claude/skills/bluefish-design-system/SKILL.md` contains
   only shared context — safe to @include without pulling in explore/prototype workflow steps
2. Foundation `description:` field will not compete with bf-explore's trigger verbs
3. Five support files are verified clean with dated audit stamps
4. The Explore Output content (lines 250–261 in the original SKILL.md) was extracted
   in Phase 1 — Phase 2 must port this content into bf-explore/SKILL.md as its workflow

The Explore Output content that Phase 2 will need (ported from the original SKILL.md):
```
Deliver 2–3 variations as fenced HTML code blocks inline in the response. Each variation must:
- Represent a meaningfully distinct layout or interaction pattern — not cosmetic differences
- Annotate every Bluefish token and component inline:
  background-color: var(--color-roles-primary-main); /* color-roles/primary/main */
- Flag unresolved values: /* ⚠️ [value] — no token found */
```

Reference implementation for Phase 2: `explorations/variation-a.html`, `variation-b.html`,
`variation-c.html` in the figma-scripter-tools project root.

---

## What Phase 3 Inherits

When Phase 3 (bf-prototype) begins, it inherits everything Phase 2 inherits, plus the
explore pattern (two-step Figma → variation → prototype pipeline).

The Prototype Output content that Phase 3 will port from the original SKILL.md:
- Vite scaffold steps (npm create vite, npm install MUI, DM Sans font link, reset styles,
  index.css replacement, App.tsx wrapper)
- Prototype-specific rules: useState, alignSelf: 'flex-start' for selected item backgrounds,
  MUI icon stand-ins, npm run dev + get_screenshot visual comparison

---

## Drift Items Deferred to Future Phases

The following drift items were flagged in Phase 1 audit but NOT corrected (per D-04):

| Item | File | Action needed |
|------|------|---------------|
| `Page Title` listed in SKILL.md Token Convention without deprecation note | SKILL.md line 75 | Remove from SKILL.md type styles list; add note pointing to H4 |
| `Page Title` drift flag | type-styles.md | Already flagged in Phase 1 audit stamp |
| `1/color-roles` and `1/scale` prefix notation clarity | figma-reading-guide.md | Future clarity pass — explain Figma collection vs. token path distinction more explicitly |

---

## Phase 1 Completion Gate

The Walking Skeleton is proven when ALL of the following are true:

- [ ] `grep -c "## Screen Workflow" ~/.claude/skills/bluefish-design-system/SKILL.md` → 0
- [ ] `grep -c "## Code Output" ~/.claude/skills/bluefish-design-system/SKILL.md` → 1
- [ ] `grep -c "token lookups, accessibility rules" ~/.claude/skills/bluefish-design-system/SKILL.md` → 1
- [ ] `grep -c "Phase 1 Audit" ~/.claude/skills/bluefish-design-system/tokens.md` → 1
- [ ] `grep -c "Phase 1 Audit" ~/.claude/skills/bluefish-design-system/type-styles.md` → 1
- [ ] `grep -c "Phase 1 Audit" ~/.claude/skills/bluefish-design-system/tokens-dataviz.md` → 1
- [ ] `grep -c "Phase 1 Audit" ~/.claude/skills/bluefish-design-system/figma-reading-guide.md` → 1
- [ ] `grep -c "Phase 1 Audit" ~/.claude/skills/bluefish-design-system/spec-template.md` → 1
- [ ] Foundation is activatable in a new Claude Code session for a Bluefish design question
