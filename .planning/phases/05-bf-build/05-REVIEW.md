---
phase: 05-bf-build
reviewed: 2026-06-15T00:00:00Z
depth: standard
files_reviewed: 5
files_reviewed_list:
  - /Users/pcartelli/dev/bluefish-ai-skills/bf-prototype/SKILL.md
  - /Users/pcartelli/dev/bluefish-ai-skills/bf-spec/SKILL.md
  - /Users/pcartelli/dev/bluefish-ai-skills/bluefish-design-system/SKILL.md
  - /Users/pcartelli/dev/bluefish-ai-skills/README.md
  - /Users/pcartelli/dev/bluefish-ai-skills/bf-build/SKILL.md
findings:
  critical: 3
  warning: 6
  info: 4
  total: 13
status: fixed
fixed: 2026-06-15
---

# Phase 05: Code Review Report

**Reviewed:** 2026-06-15
**Depth:** standard
**Files Reviewed:** 5
**Status:** issues_found

## Summary

This phase introduced the `bf-build` skill and updated sibling skills (`bf-prototype`, `bf-spec`, `bluefish-design-system`) to route "build" / "implement" trigger phrases exclusively to `bf-build`. The routing update is largely successful — the anti-patterns sections in `bf-prototype` and `bf-spec` correctly disclaim those triggers, and `bf-build`'s frontmatter description accurately claims them.

However, three blocker-level defects were found: a contradictory Path B fallback trigger condition that makes the spec-file path unreachable under the stated MCP sequence, a `borderRadius` token expression in the `bf-build` complete example that uses the CSS custom-property form only (violating the dual-path mandate that bf-build itself declares), and an MCP call-order mismatch between the `bluefish-design-system` foundation default and the `bf-build` call sequence (the foundation document says to call `get_variable_defs` first as the default, which conflicts with `bf-spec` saying `get_metadata` first — but this conflict is correctly resolved by the foundation's "command skill's sequence wins" carve-out; the blocker is that `bf-build` inherits this without its own explicit call-order statement for the `get_design_context`-only fallback case).

Six warnings cover ambiguous intake branching, a routing gap for the `create` trigger verb, inconsistent terminology, and a missing explicit statement about what happens when both MCP and no spec file exist. Four informational items cover documentation gaps, deprecated trigger phrasing in README, and a redundant diagnostic rule.

---

## Critical Issues

### CR-01: Path B Fallback Condition Is Unreachable as Written

**File:** `/Users/pcartelli/dev/bluefish-ai-skills/bf-build/SKILL.md:76-88`

**Issue:** The Figma Context section states:

> "If both calls return nothing AND the user's message references a `spec-*.md` file, switch to Path B."

But the Intake section (lines 40–51) says: if the user's message includes a component description or spec file reference, skip intake questions and "proceed immediately to the Figma Context section." This means the MCP calls always fire first, even when the user explicitly provides a spec file. The fallback to Path B therefore only triggers when the user provides a spec file reference AND both MCP calls return nothing.

The real problem is that the condition is fragile and undocumented for the case where MCP succeeds but the Figma selection is a different component than the referenced spec file. When MCP returns data for a *different* component than the spec the user referenced, the skill has no instruction: should it use the live MCP data or the spec? No tie-breaker exists. An LLM following these instructions will make an unpredictable choice.

**Fix:** Add an explicit tie-breaker rule. Suggested addition after the fallback paragraph in Figma Context:

```
**Tie-breaker when MCP data and a spec file both exist:** Use the MCP data
(`get_variable_defs` + `get_design_context`) as the authoritative source. Reference the
spec file for fields that MCP does not return (Variants & States, Props, Accessibility).
Do NOT discard the spec file when MCP is also available — merge the two sources.
```

Also clarify the "bare invocation + Figma not open" dead-end at lines 40–45: the bare invocation path says "attempt MCP calls first" but if MCP returns nothing AND no spec is mentioned, the fallback says "generate from conversation description" — but there is no conversation description (invoked bare). The instruction at line 85: "generate from conversation description" is unreachable when invoked bare with no Figma connection. The intake question ("What component should I build?") at line 46 only fires after both MCP calls return nothing — this sequencing is correct but the fallback prose at line 85 should acknowledge this: when both MCP and conversation context are absent, the skill should ask, not silently generate.

---

### CR-02: Dual-Path Token Mandate Violated in bf-build's Own Complete Example

**File:** `/Users/pcartelli/dev/bluefish-ai-skills/bf-build/SKILL.md:271-298`

**Issue:** The Dual-Path Token Output rule (lines 204–218) explicitly mandates:

> "output both forms with the flag for every token path reference in `sx` props"

The complete example at lines 270–298 shows `backgroundColor` with dual forms (MUI theme extension commented + CSS custom-property inline), but `borderRadius` at line 293 is output in the CSS custom-property form only:

```tsx
borderRadius: 'var(--scale-radius-sm)', // scale/radius/sm
```

There is no MUI theme extension alternative shown for `borderRadius`. This single-path output directly contradicts the dual-path rule. An LLM trained on this example will learn to single-path `borderRadius` and other non-color token references.

**Fix:** Replace the `borderRadius` line in the example to show both forms:

```tsx
// If tokens inject as MUI theme extensions:
borderRadius: '4px', // scale/radius/sm — ⚠️ no MUI theme spacing API for radius; use px or CSS var
// If tokens inject as CSS custom properties:
// borderRadius: 'var(--scale-radius-sm)', // scale/radius/sm
/* ⚠️ token injection method unconfirmed — verify with eng */
```

Or alternatively, show `var(--scale-radius-sm)` in the comment form and the MUI alternative inline, consistent with the `backgroundColor` dual-path pattern above it.

---

### CR-03: `bf-build` Frontmatter Trigger Phrase "create" Not Claimed — Creates Routing Gap

**File:** `/Users/pcartelli/dev/bluefish-ai-skills/bf-build/SKILL.md:1-9` and `/Users/pcartelli/dev/bluefish-ai-skills/README.md:62-66`

**Issue:** The README (lines 62–66) lists natural-language trigger phrases:

```
- "layout variations for X" → /bf-explore
- "prototype this screen" or "working prototype of X" → /bf-prototype
- "spec for X" or "engineering handoff doc" → /bf-spec
```

There is no entry for `bf-build`. The frontmatter description of `bf-build` claims "build, implement, or generate production code" as triggers, but "create [component]" — a very common phrase — is not claimed anywhere in the skill set. None of the four skills claim "create" as a trigger. "Create a Button component" could be ambiguous between `bf-build` (production component) and `bf-prototype` (working prototype). The bf-prototype anti-patterns section mentions "build" and "implement" as reserved for bf-build but does not cover "create."

This is a routing gap: "create [component]" is unowned. An LLM routing on natural-language input will either default to the most recently loaded skill or make an unpredictable choice.

**Fix:** Add "create" to `bf-build`'s frontmatter description (alongside "build" and "implement"):

```yaml
description: >
  Generates a production-ready TypeScript React/MUI component file from a Figma frame or
  existing spec file. Use when the user types /bf-build or asks to build, implement, create,
  or generate production code for a Bluefish component. ...
```

And add a README trigger line:

```
- "build [component]", "implement [component]", or "create [component] component" → /bf-build
```

Also add a note to the bf-prototype anti-patterns section discouraging "create" as a prototype trigger to close the gap from both sides.

---

## Warnings

### WR-01: bf-build Intake — Bare Invocation Contradicts "Always Attempt MCP First" Rule

**File:** `/Users/pcartelli/dev/bluefish-ai-skills/bf-build/SKILL.md:40-51`

**Issue:** The intake rule says for a bare invocation "do not ask yet — proceed immediately to the Figma Context section and attempt MCP calls first." This is correct behavior. However the parenthetical "If `get_design_context` returns a component or frame name, derive the component name from it" conflicts with the next step in the Figma Context section (line 64) which says to derive the name "from the component name found in the response or from prior conversation context — NOT from a Figma frame name."

The Intake section says "component or frame name" (permissive). The Figma Context section says "NOT from a Figma frame name" (restrictive). These two instructions contradict each other when the MCP response returns a frame rather than a component instance.

**Fix:** Align the Intake section with the Figma Context section. Remove "or frame name" from the Intake bare-invocation description:

```
If `get_design_context` returns a component name, derive the component name from it and
proceed to output — no question needed.
```

---

### WR-02: `bf-spec` Frontmatter Description Contains Awkward Phrasing That May Confuse Routing

**File:** `/Users/pcartelli/dev/bluefish-ai-skills/bf-spec/SKILL.md:7-8`

**Issue:** The frontmatter description reads:

> "Not for prototypes (use bf-prototype), layout explorations (use bf-explore), or production code (bf-build — use bf-build)."

The parenthetical `(bf-build — use bf-build)` is redundant and grammatically inconsistent with the other two exclusions. More importantly, the double mention of "bf-build" could confuse skill routing logic that parses description text for skill names — the skill name appears twice in one exclusion clause, which is unusual and may cause an LLM parsing the description to weight `bf-build` unexpectedly.

**Fix:**

```yaml
description: >
  Generates a structured engineering handoff spec from a Figma screen or component.
  Use when the user types /bf-spec or asks for a spec, engineering handoff doc, or
  component inventory for a Bluefish screen or component. Not for prototypes (use
  bf-prototype), layout explorations (use bf-explore), or production code (use bf-build).
```

---

### WR-03: `bf-build` Does Not Instruct What to Do When MCP Succeeds But Returns a Screen Frame, Not a Component

**File:** `/Users/pcartelli/dev/bluefish-ai-skills/bf-build/SKILL.md:59-67`

**Issue:** The Figma Context section says to derive the component name "from the component name found in the response or from prior conversation context — NOT from a Figma frame name." This correctly rejects frame names. However there is no instruction for what to do when `get_design_context` returns a screen-level frame (not a component): should bf-build fall through to the Screen-Level Spec Gate path (asking "Which component should I build?")? Should it error? The omission leaves a reachable code path with no defined behavior.

A user with a screen frame selected in Figma Desktop invoking `/bf-build` will get unpredictable output — bf-build might generate a monolithic screen component, or ask a question, or silently fall back to generate from description.

**Fix:** Add a branch after line 67 in the Figma Context section:

```
**If `get_design_context` returns a screen/frame node, not a component instance:**
Treat this the same as the Screen-Level Spec Gate in Path B — present the frame's
component inventory (from `get_design_context`) and ask:

> "Which component should I build?"

Generate ONE `.tsx` file for the selected component only.
```

---

### WR-04: `bluefish-design-system` Foundation Calls Out `bf-explore` But bf-explore Is Not in the Review Scope and May Not Exist As Expected

**File:** `/Users/pcartelli/dev/bluefish-ai-skills/bluefish-design-system/SKILL.md:113`

**Issue:** The Component Map section (line 113) says: "When a build or explore task requires knowing which Figma components are present..." This is the only mention of "build" in the foundation skill, and it silently bundles `bf-build` behavior without directing to it. More importantly, the foundation skill's description (lines 1-8) says it "Activates for any question about the Bluefish design system that is not a specific explore, prototype, spec, or build task" — meaning `bluefish-design-system` should activate as a fallback after the four command skills decline. But the description lists "build task" as an exclusion, confirming the foundation knows about `bf-build`. The Component Map section, however, uses the verb "build" to describe foundation behavior itself rather than routing to `bf-build`. An LLM reading the Component Map section may attempt to perform a build task from within the foundation skill rather than handing off.

**Fix:** Reword the Component Map intro to avoid using "build" as a task verb:

```markdown
**Component discovery is MCP-driven.** When an explore or build task (handled by `/bf-explore`
or `/bf-build`) requires knowing which Figma components are present and what their MUI
equivalents are, this foundation data supports those queries. Use the following MCP sequence:
```

---

### WR-05: MCP Call Order Inconsistency Between bf-build and bf-prototype (Both Call `get_variable_defs` First, But for Different Reasons)

**File:** `/Users/pcartelli/dev/bluefish-ai-skills/bf-build/SKILL.md:59-60` and `/Users/pcartelli/dev/bluefish-ai-skills/bf-prototype/SKILL.md:47-48`

**Issue:** Both `bf-build` and `bf-prototype` call `get_variable_defs` before `get_design_context`. The foundation skill says the command skill's MCP sequence wins (line 28: "unless the invoking command skill defines its own MCP sequence...the command skill's sequence wins"). This is consistent. However, there is no stated reason in bf-build for calling `get_variable_defs` before `get_design_context` rather than the reverse, and the ordering is reversed from bf-spec (which calls `get_metadata` → `get_variable_defs` → `get_design_context`). The lack of rationale means a future editor may reorder the calls without understanding why `get_variable_defs` must precede `get_design_context` (token values must be known before interpreting component token references in the design context response).

**Fix:** Add a one-line rationale comment to the Figma Context section in bf-build:

```
1. Call `get_variable_defs` first — live token values must be loaded before interpreting
   token references in the `get_design_context` response. Call once; reuse throughout.
```

---

### WR-06: README Install Instructions List Four Skills But the Table Shows Five — Asymmetric Onboarding Risk

**File:** `/Users/pcartelli/dev/bluefish-ai-skills/README.md:11-19`

**Issue:** The Install section (lines 11–19) shows five `cp` commands, correctly including `bf-build`. The Skills table (lines 29–36) also correctly shows all five skills. However the "Usage" section natural-language trigger examples (lines 62–66) document only three skills (bf-explore, bf-prototype, bf-spec) with no trigger phrase example for bf-build. A user reading the Usage section as a reference after installation will not discover that `bf-build` triggers on natural-language "build"/"implement" phrasing — they may reach for `/bf-build` only via the slash command, defeating the auto-trigger behavior.

**Fix:** Add a `bf-build` usage example in the Usage section:

```markdown
**Build a production component:**
```
/bf-build the Button component
```
Claude reads the Figma frame via MCP (or parses `spec-button.md` if present) and writes
`BluefishButton.tsx` to your working directory.
```

And add a natural-language trigger line:

```
- "build [component]" or "implement [component]" → `/bf-build`
```

(Note: this issue is the README side of CR-03 — they are coupled but the README fix is lower severity since README is documentation rather than instruction logic.)

---

## Info

### IN-01: `bf-prototype` Anti-Patterns References "Planned /bf-build Skill" — Now Stale

**File:** `/Users/pcartelli/dev/bluefish-ai-skills/bf-prototype/SKILL.md:198`

**Issue:** The anti-patterns section says:

> "These phrases belong to the **planned** `/bf-build` skill."

Phase 05 delivered bf-build. The word "planned" is now stale and inaccurate. An LLM encountering "planned" may treat bf-build as a future capability and route build tasks back to bf-prototype as a fallback.

**Fix:** Remove "planned":

```
These phrases belong to the `/bf-build` skill.
```

---

### IN-02: `bf-spec` Anti-Patterns Also References "Planned /bf-build Skill" — Same Stale Phrasing

**File:** `/Users/pcartelli/dev/bluefish-ai-skills/bf-spec/SKILL.md:254`

**Issue:** Same stale "planned" qualifier as IN-01:

> "These phrases belong to the planned `/bf-build` skill."

**Fix:** Same as IN-01:

```
These phrases belong to the `/bf-build` skill.
```

---

### IN-03: `bf-build` Pre-Return Checklist Is a Pointer with No Content — Fragile

**File:** `/Users/pcartelli/dev/bluefish-ai-skills/bf-build/SKILL.md:263-266`

**Issue:** The Pre-Return Checklist section says:

> "Apply the foundation 8-point pre-return checklist (see `bluefish-design-system/SKILL.md` Code Output Standards — 'Before returning code, verify:') before returning the file. Do not restate the checklist bullets — the foundation is the single source of truth for them."

This pointer-only pattern works when the foundation SKILL.md is loaded. However, unlike bf-prototype and bf-spec which enumerate which checklist items apply to their mode (e.g., "items 1–6 apply; items 7–8 are N/A"), bf-build provides no such scoping. All 8 checklist items apply to bf-build (it generates .tsx files), so this is intentional — but item 8 ("Call `get_screenshot` for the original Figma node") is only possible when MCP is available. There is no instruction in bf-build about what to do with item 8 when MCP was unavailable (Path B or full fallback). bf-prototype and bf-spec both explicitly handle the N/A case for their respective items; bf-build is silent.

**Fix:** Add a note to the Pre-Return Checklist section:

```
Item 8 (screenshot comparison) applies only when MCP was available and `get_design_context`
returned data. If operating from Path B (spec file only) or full fallback, note item 8 as
unverifiable: `// ⚠️ screenshot comparison not performed — Figma MCP unavailable`.
```

---

### IN-04: `bluefish-design-system` "About Bluefish" Section Is Not Referenced by Any Skill

**File:** `/Users/pcartelli/dev/bluefish-ai-skills/bluefish-design-system/SKILL.md:12-16`

**Issue:** The "About Bluefish" section (lines 12–16) provides brand context. No command skill references it in its workflow, and the foundation skill itself does not instruct when to use it. It is load-bearing context but invisible — an LLM may or may not apply it to outputs depending on how strongly the @include pulls in the full foundation. This is not a bug in bf-build specifically, but the new skill did not add any application of brand context either.

**Fix (low priority):** Add a single sentence to the bf-build Output Rules preamble referencing brand tone — or note in "About Bluefish" that it applies to all output generating tasks:

```markdown
> Brand context: apply the clean, data-forward, professional design language described above
> to all component naming, comments, and code organization choices.
```

---

_Reviewed: 2026-06-15_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
