# Phase 1: Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-08
**Phase:** 1-Foundation
**Areas discussed:** Foundation load mechanism, Foundation skill trigger, Support file audit depth

---

## Foundation Load Mechanism

### Q1: How should command skills access the foundation?

| Option | Description | Selected |
|--------|-------------|----------|
| @include in command skill | Command skill starts with `@~/.claude/skills/bluefish-design-system/SKILL.md`. Foundation loads inline at activation — no separate step. | ✓ |
| Read instruction inside skill | Command skill contains an explicit "Read foundation before proceeding" instruction. | |
| Both skills trigger independently | Foundation broad enough to co-trigger alongside command skill. | |

**User's choice:** @include in command skill (Recommended)
**Notes:** None

### Q2: Should support files be @included upfront or loaded on-demand?

| Option | Description | Selected |
|--------|-------------|----------|
| On-demand via Read instructions | Foundation keeps current pattern — instructions say when and why to read each file. | ✓ |
| @include all support files in foundation | Foundation @includes all support files upfront regardless of task. | |

**User's choice:** On-demand via Read instructions (Recommended)
**Notes:** Keeps context lean; only loads what the task needs.

### Q3: Where in command skill files does the @include appear?

| Option | Description | Selected |
|--------|-------------|----------|
| After frontmatter, before skill body | Frontmatter first, then @include foundation, then command workflow. | ✓ |
| After skill body | Command workflow first, foundation appended at end. | |

**User's choice:** After frontmatter, before skill body (Recommended)

---

## Foundation Skill Trigger

### Q1: What role should the foundation skill play in auto-triggering?

| Option | Description | Selected |
|--------|-------------|----------|
| Context-layer only — no independent trigger | Foundation not triggered directly; only via @include from command skills. | |
| General Bluefish context fallback | Foundation triggers for Bluefish questions that don't match a command skill. | |
| You decide | Claude picks whichever makes the skill system more predictable. | ✓ |

**User's choice:** You decide
**Claude's decision:** General Bluefish context fallback — foundation triggers for design system questions, token lookups, Figma reading, accessibility rules. Command skills (more specific) win when a workflow task is clearly described.

### Q2: What should the foundation description focus on?

| Option | Description | Selected |
|--------|-------------|----------|
| Design system context — tokens, a11y, conventions | Foundation fires for token questions, accessibility rules, Figma variable reading, component conventions. | ✓ |
| Keep broad — all Bluefish work | Foundation stays catch-all for anything Bluefish-related. | |

**User's choice:** Design system context — tokens, a11y, conventions (Recommended)
**Notes:** Command skills own workflow triggers (explore, prototype, spec, build).

---

## Support File Audit Depth

### Q1: How thorough should the support file audit be?

| Option | Description | Selected |
|--------|-------------|----------|
| Outline rename + obvious drift | Apply outline rename everywhere; fix obviously stale things found while reading. | ✓ |
| Full re-verification | Cross-check all token paths against current token system. | |
| Outline rename only | Apply documented rename and stop. | |

**User's choice:** Outline rename + obvious drift (Recommended)

### Q2: How should obvious drift be handled?

| Option | Description | Selected |
|--------|-------------|----------|
| Fix inline | Update files in place — they're authoritative. | |
| Flag and defer | Note drift but don't edit files in Phase 1. | ✓ |

**User's choice:** Flag and defer
**Notes:** "Flag and defer for now - we'll revise this later." User clarified they wanted to understand what the support files were before deciding.

---

## Claude's Discretion

- **Code Output section:** User did not select this as a discussion area. Claude decided the "## Code Output" section (MUI framework, prop→MUI table, token-to-code dual-path, wrapping pattern, verify checklist) stays in the foundation as shared context. Command skills inherit it via @include and may reference checklist items in their own instructions.

## Deferred Ideas

None — discussion stayed within phase scope.
