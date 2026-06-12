# Phase 5: bf-build - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-12
**Phase:** 05-bf-build
**Areas discussed:** forwardRef rule, Path detection, Cross-spec references, Output shape, Screen-spec scope

---

## Pre-Work: Handoff Review

Before gray area selection, the user requested a review of `05-HANDOFF.md`. That file documented binding decisions from the post-Phase-4 external review pass (file layout change, token/typography corrections, routing reclaim task, confirmed spec structure). Those decisions were folded in as locked context before discussion — no re-asking.

---

## forwardRef Rule

| Option | Description | Selected |
|--------|-------------|----------|
| React 19 | forwardRef is optional — refs work as regular props. npm create vite@latest defaults to React 19. | ✓ |
| React 18 | forwardRef required for ref-forwarding. | |
| Support both | Always wrap in forwardRef (works in both versions) with optional comment. | |

**User's choice:** React 19
**Notes:** Team is targeting React 19. Skill will not mandate forwardRef wrappers.

---

## Path Detection

| Option | Description | Selected |
|--------|-------------|----------|
| MCP-first, spec as fallback | Always attempt get_variable_defs + get_design_context first. If MCP returns nothing and a spec file is provided, switch to Path B. User never asked. | ✓ |
| Message-first: prefer spec if mentioned | If message includes a spec filename, go directly to Path B without MCP attempt. | |
| Ask the user | On every invocation, ask: 'Figma frame open or building from a spec file?' | |

**User's choice:** MCP-first, spec as fallback
**Notes:** Mirrors bf-prototype's Figma-context pattern.

---

## Cross-Spec References

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-read referenced specs | When spec-autocomplete.md notes 'see spec-text-field.md', bf-build reads spec-text-field.md automatically. No user prompt. | ✓ |
| Build from top-level spec only | Ignore cross-references; flag missing detail with ⚠️. | |
| Ask the user | When cross-reference detected, ask whether to read it. | |

**User's choice:** Auto-read referenced specs
**Notes:** Produces complete output for composite components without interrupting the user.

---

## Output Shape

| Option | Description | Selected |
|--------|-------------|----------|
| Component file written to disk | Single .tsx file written to ./. TypeScript interface + named wrapper + token annotations. No scaffold. | ✓ |
| Full Vite file set | BluefishButton.tsx + App.tsx + scaffold command. Runnable immediately. | |
| Code block in conversation | Fenced TSX block only. User copies. No files written. | |

**User's choice:** Component file written to disk
**Notes:** Production component only — no Vite scaffold, no story stub.

---

## Screen-Spec Scope

| Option | Description | Selected |
|--------|-------------|----------|
| One component per invocation | If screen-level spec, present Component Inventory and ask which to build. One .tsx file per run. | ✓ |
| Build all components | Iterate Component Inventory and write a .tsx file per component. | |
| You decide / skip | Handle in planning. | |

**User's choice:** One component per invocation
**Notes:** Matches "one spec in, one component out" mental model; avoids token limit issues on large screens.

---

## Claude's Discretion

- TypeScript interface base type selection (e.g., `extends ButtonProps` vs `extends ButtonBaseProps`) — Claude determines per component during implementation.
- MCP sequence depth for composite components (Path A) — Claude determines when sub-components warrant their own `get_design_context` call.

## Deferred Ideas

- Storybook story stub output — noted for v2 or a separate `/bf-story` skill
- Multi-component batch output from screen-level spec — v1 is one component per invocation
- `get_context_for_code_connect` vs `get_design_context` — no change from current graceful-degrade approach
