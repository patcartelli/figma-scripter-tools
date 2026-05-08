# Phase 1: Foundation — Research

**Researched:** 2026-05-08
**Domain:** Claude Code skill system — SKILL.md refactoring, @include directive, skill description triggers
**Confidence:** HIGH (all findings verified against live files and Claude Code changelog)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Command skills load the foundation via `@~/.claude/skills/bluefish-design-system/SKILL.md` — an @include directive positioned after the frontmatter block and before the command-specific skill body.
- **D-02:** Support files (tokens.md, type-styles.md, tokens-dataviz.md, figma-reading-guide.md, spec-template.md) are NOT @included upfront. The foundation keeps the current on-demand Read instruction pattern — Claude reads them when the task requires it, not on every skill activation.
- **D-03:** Foundation `description:` field focuses on design system context — token questions, accessibility rules, Figma variable reading, component conventions. It does NOT claim workflow tasks (explore, prototype, spec, build). Command skills (added in Phases 2–3) own those workflow triggers. Foundation acts as a context fallback for general Bluefish design system questions.
- **D-04:** Apply the outline token rename across all five support files: `outline/subtle` → `outline/default`, `outline/default` → `outline/outline-variant`. Any other obvious drift found while reading should be flagged inline (comment or note) but NOT corrected in Phase 1 — deferred to a future pass.

### Claude's Discretion

- **Code Output section:** Stays in the foundation as shared context. Command skills inherit it via @include. Command skills may reference or repeat specific checklist items — no duplication prohibition.

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FOUND-01 | Shared context layer refactored — SKILL.md contains only foundation; command-specific workflow logic extracted | Focus area 1: Skill file split analysis — exact section boundaries identified |
| FOUND-02 | Skill trigger descriptions rewritten — each skill's `description:` field is specific enough to auto-trigger correctly | Focus area 3: Description field research — trigger mechanics and character limits documented |
| FOUND-03 | Support files audited — outline rename applied, drift flagged | Focus area 2: Support file audit — complete diff table produced |
</phase_requirements>

---

## Summary

Phase 1 is a clean file-editing phase with no external dependencies and no new library installs. The work falls into three streams: (1) split the monolithic SKILL.md along an already-identified boundary, (2) rewrite the foundation's `description:` field to trigger for design system context questions only, and (3) apply the outline token rename across five support files.

The skill file split boundary is unambiguous: everything from frontmatter through `## Code Output` stays in the foundation. The `## Screen Workflow` section (lines 169–261) and its four sub-modes (Spec Output, Build Output, Prototype Output, Explore Output) move out entirely. `## Breaking Changes` and `## Known Gaps` stay in the foundation. One stale cross-reference in `## Known Gaps` will need updating when `## Screen Workflow` is removed (line 278 references "See Screen Workflow for handling instructions").

The @include directive is confirmed working in SKILL.md body text via the `@$HOME/...` path syntax — this is the established pattern used throughout all GSD skills in this codebase. D-01 specifies `@~/...` notation which is equivalent (`~` expands to `$HOME = /Users/pcartelli`). Either notation works; `@$HOME/...` is preferred for consistency with existing skills.

The support file audit found that `tokens.md` and `figma-reading-guide.md` already use the new token names correctly. The outline token rename in D-04 was already applied to the live token tables in tokens.md — but a migration note banner in tokens.md still uses the old names in the "before" side of the rename arrow. That banner is informational and should stay as-is (it documents history, not a live path). The `tokens-dataviz.md`, `type-styles.md`, and `spec-template.md` files have no outline token references at all. The only true FOUND-03 drift requiring action is the `Page Title` deprecation inconsistency between SKILL.md and `type-styles.md` — D-04 says flag but don't fix in Phase 1.

**Primary recommendation:** Execute in this order: (1) rewrite SKILL.md description, (2) extract Screen Workflow section, (3) fix the stale Known Gaps cross-reference, (4) scan support files and apply the audit stamp. No support file token renames are actually needed — the rename was already applied to the token tables in tokens.md.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Foundation shared context | Claude Code skill system | — | Single SKILL.md file; loaded by Claude on skill activation |
| Command skill loading | Claude Code @include directive | — | @$HOME path in skill body; Claude inlines content at activation time |
| Support file reading | On-demand Read tool | — | D-02: not @included upfront; read when task requires it |
| Token rename application | File edit (support files) | — | Static content correction; no runtime layer involved |
| Skill trigger selection | Claude model (description field matching) | User slash command | Model reads description fields and selects the most relevant skill |

---

## Focus Area 1: Skill File Split Analysis

### Sections That STAY in Foundation

| Lines | Section | Rationale |
|-------|---------|-----------|
| 1–7 | Frontmatter (name, description) | Identity of the foundation skill |
| 8–12 | `## About Bluefish` | Shared product context |
| 14–20 | `## Figma MCP Setup` | Shared MCP setup (applies to all command skills) |
| 22–42 | `## Live Token Grounding` | Shared grounding protocol — all commands need it |
| 44–81 | `## Token Convention — Critical` | Core token rules — all commands inherit these |
| 83–101 | `## Accessibility (WCAG AA)` | Non-negotiable across all command contexts |
| 104–113 | `## Component Map` | Shared MCP-driven component discovery |
| 115–168 | `## Code Output` | Shared output rules (Claude's Discretion: stays in foundation) |
| 262–261 | `## Breaking Changes` | Shared context, applies across all commands |
| 272–279 | `## Known Gaps` | Shared context, applies across all commands |

### Sections That MOVE to Command Skills

| Lines | Section | Destination |
|-------|---------|-------------|
| 169–206 | `## Screen Workflow` (routing logic: "spec this", "build this", "explore this") | Extracted; command skills own their own routing |
| 207–218 | `### Spec Output (spec this)` | Future /bf-spec skill (Phase 4+) |
| 219–223 | `### Build Output (build this)` | Future /bf-build skill (Phase 5+) |
| 224–249 | `### Prototype Output (prototype this)` | /bf-prototype skill (Phase 3) |
| 250–261 | `### Explore Output (explore this)` | /bf-explore skill (Phase 2) |

### Stale Cross-Reference to Fix

When `## Screen Workflow` is removed from the foundation, **line 278** in `## Known Gaps` becomes stale:

> `- [ ] Code Connect not configured ... Until complete, get_design_context will return a Code Connect interruption prompt. See Screen Workflow for handling instructions.`

The planner must update this line to remove the "See Screen Workflow for handling instructions" reference, or replace it with a note that command skills handle this (since command skills will inherit that workflow text).

### Section the planner must NOT move

`## Code Output` (lines 115–168) stays in the foundation per the Claude's Discretion decision. The `### Spec Output (build this)` sub-mode references it at line 221: "Follow all rules in ## Code Output." — that reference in the command skill text is fine because the command skill inherits the foundation via @include, so the section will exist in its context.

---

## Focus Area 2: Support File Audit — Outline Token Rename

### Audit Result: No Token Path Renames Required

The outline rename (D-04: `outline/subtle` → `outline/default`, `outline/default` → `outline/outline-variant`) was **already applied to the authoritative token tables** in `tokens.md`. The current live table rows are:

```
color-roles/outline/outline-variant  | #ACACAC | #3D3D3D | Visible border for component edges
color-roles/outline/default          | #E8E8E8 | #575757 | Subtle border for low-emphasis separation
```

These are the correct post-rename values. [VERIFIED: read live file]

### Per-File Audit Table

| File | Outline References Found | Action Required | Drift Flagged |
|------|--------------------------|----------------|--------------|
| `tokens.md` | Line 12: migration note banner uses old names in `outline/subtle → outline/default` format; lines 38–39: live table uses correct new names | Banner is informational history — no change needed | None beyond what's already flagged |
| `figma-reading-guide.md` | Lines 75–76: M3 mapping table correctly maps `md.sys.color.outline → color-roles/outline/outline-variant` and `md.sys.color.outline-variant → color-roles/outline/default` | Already correct | `1/color-roles` prefix usage (see below) |
| `type-styles.md` | None | No action | `Page Title` listed without deprecation note (see below) |
| `tokens-dataviz.md` | None | No action | `1/color-roles/dataviz/[NN]/[property]` path usage (see below) |
| `spec-template.md` | None | No action | None |

**Conclusion for FOUND-03:** The token rename is already applied to the live files. The audit confirms all five support files are rename-complete. No token path edits are required for D-04.

### Drift Items (Flag Only — D-04 says do not correct in Phase 1)

**Drift 1 — `type-styles.md` / `SKILL.md` inconsistency: Page Title deprecation**
- `type-styles.md` line 46: `> **Note:** Page Title was deprecated — use H4 instead.`
- `SKILL.md` line 75: still lists `Page Title` in the authoritative styles list without a deprecation note
- Impact: Claude will treat `Page Title` as valid when reading SKILL.md; type-styles.md contradicts this
- Action: Flag in Phase 1 audit stamp; correct in a future pass

**Drift 2 — `figma-reading-guide.md` line 56: `1/color-roles` and `1/scale` prefix**
- Text: `Only treat variables under 1/color-roles or 1/scale as authoritative.`
- The `1/` prefix is a Figma variable collection identifier (the variable group name in Figma Desktop), not a token path prefix for code output
- `tokens-dataviz.md` line 8 also uses this notation: `1/color-roles/dataviz/[NN]/[property]`
- This is Figma-context-specific and intentional, not a token path error. Claude uses it to know which Figma variable collections are authoritative. No change needed.
- However, the notation is potentially confusing for a new reader — worth documenting as a future clarity pass item

**Drift 3 — `SKILL.md` Known Gaps line 278: stale "Screen Workflow" cross-reference**
- Already captured in Focus Area 1 above. Must be fixed as part of the FOUND-01 work.

---

## Focus Area 3: Description Field Research

### How Claude Auto-Selects Skills

Claude Code exposes all installed skills' `name:` and `description:` frontmatter fields to the model at session start. The model reads user messages and determines whether a skill's description matches the task well enough to proactively invoke it (tracked as `"claude-proactive"` in the `invocation_trigger` attribute of the `claude_code.skill_activated` OpenTelemetry event). [VERIFIED: Claude Code changelog 2.1.126]

Skills can also be invoked explicitly with a slash command (`"user-slash"`) or invoked by another skill/agent (`"nested-skill"`).

**The `skillOverrides` setting** controls visibility: `off` hides from model and `/`, `user-invocable-only` hides from model only (slash-command only), `name-only` collapses description. [VERIFIED: Claude Code changelog]

### Description Character Limits

- Listing cap: **1,536 characters** (raised from 250 in a recent release). Descriptions longer than this trigger a startup warning. [VERIFIED: Claude Code changelog 2.1.126]
- Current foundation description: 162 characters — well within limit
- A description rewrite for the foundation should stay under 400 characters to be clear and scannable. No hard upper bound constraint at current cap, but shorter is better for model context efficiency.

### Trigger Design for the Foundation (D-03)

The foundation's description needs to:
1. Fire when a user asks about Bluefish tokens, accessibility rules, Figma reading, or component conventions
2. NOT fire for "explore this", "prototype this", "spec this", "build this" — those go to command skills in Phases 2–3

**Anti-pattern to avoid:** The current description says "Use when designing, prototyping, generating code, or speccing screens..." — this is too broad and will conflict with command skill triggers once those exist.

**Design principle:** Descriptions that include action verbs ("generate", "prototype", "explore") compete with command skills that own those verbs. The foundation description should use noun phrases describing the knowledge domain, not action verbs describing tasks.

**Recommended description pattern (MEDIUM confidence — apply with user validation):**

```yaml
description: >
  Bluefish design system reference. Use for token lookups, accessibility rules,
  Figma variable reading, component conventions, and code output standards.
  Activates for any question about the Bluefish design system that is not a
  specific explore, prototype, spec, or build task.
```

This description:
- Claims the knowledge domain (token, a11y, Figma, conventions)
- Explicitly excludes command skill verbs (explore, prototype, spec, build) to reduce trigger ambiguity once command skills exist
- Uses natural language that matches how a user would phrase a question: "what's the outline token?" or "how do I handle accessibility for charts?"

**Note:** Claude's skill selection is probabilistic — no description guarantees perfect routing. The foundation serves as the context fallback for design system questions; command skills own their specific task verbs.

---

## Focus Area 4: @include Directive

### Confirmed Syntax

The `@` file reference directive in SKILL.md body text resolves the referenced file's content inline when the skill is activated. [VERIFIED: observed in GSD skills throughout `~/.claude/skills/`]

**Two valid path forms:**
- `@$HOME/.claude/skills/bluefish-design-system/SKILL.md` — used by all GSD skills (preferred pattern in this codebase)
- `@~/.claude/skills/bluefish-design-system/SKILL.md` — equivalent (`~/` expands to `$HOME`); D-01 specifies this form; both work

**Verified example from `gsd-execute-phase/SKILL.md`:**
```
<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-phase.md
@$HOME/.claude/get-shit-done/references/ui-brand.md
</execution_context>
```

### Placement Rules

Based on all verified examples in this codebase:
- `@` directives appear **after the frontmatter block** (after the closing `---`)
- They appear in the skill body, typically inside a named XML-like container tag (e.g., `<execution_context>`)
- Multiple `@` directives on consecutive lines work (a parsing bug with consecutive `@~/` references was fixed; `@$HOME/` has no such reported issue)
- They are inlined at skill activation — the content appears in the model's context as if it were written there

### @include for Command Skills (D-01 Contract)

A command skill (e.g., bf-explore) should be structured as:

```yaml
---
name: bf-explore
description: "..."
---

<foundation>
@$HOME/.claude/skills/bluefish-design-system/SKILL.md
</foundation>

<workflow>
[command-specific instructions here]
</workflow>
```

The `<foundation>` wrapper tag is optional but recommended for clarity. The `@` path must be on its own line.

### Edge Cases the Planner Needs to Know

1. **File not found:** If the foundation SKILL.md path doesn't exist, the `@` directive fails silently or returns nothing — the command skill activates without foundation context. The foundation file must exist at the expected path before command skills reference it. Phase 1 keeps the foundation at `~/.claude/skills/bluefish-design-system/SKILL.md` (same path, refactored content), so this is not a risk for Phase 1.

2. **Binary/image files:** A past bug caused binary files included via `@include` in CLAUDE.md to load unexpectedly (fixed). SKILL.md files are text; no risk here.

3. **Consecutive `@~/` on adjacent lines:** A parser bug with markdown strikethrough interference was fixed for `@~/` paths. Using `@$HOME/` notation avoids any residual risk. [VERIFIED: Claude Code changelog 2.0.67]

---

## Focus Area 5: Command Skill Stubs

### Should Phase 1 Create Empty Stub SKILL.md Files?

**Recommendation: No.** [ASSUMED — based on @include behavior analysis]

Rationale:
- Phase 1 does not create any command skills. The `@include` directive in a command skill points to the foundation (`bluefish-design-system/SKILL.md`), not the other way around.
- The foundation file already exists at the correct path and will continue to exist after Phase 1 refactoring — same path, refactored content.
- There is no Phase 1 artifact that will reference `bf-explore/SKILL.md` or `bf-prototype/SKILL.md`. Those paths are only referenced within Phase 2 and Phase 3 skills, which don't exist yet.
- Creating empty stubs now adds files with no content and no description — they would appear in Claude's skill list as incomplete entries.

**The @include dependency runs in one direction:** command skills include the foundation, not the reverse. Phase 1 does not need to anticipate Phase 2/3 skill locations.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead |
|---------|-------------|-------------|
| Cross-skill context sharing | Manual copy-paste of foundation content into each command skill | `@$HOME/.claude/skills/bluefish-design-system/SKILL.md` @include directive |
| Token path correctness | Custom validation script | Verified token tables in `tokens.md` — read on demand |

---

## Common Pitfalls

### Pitfall 1: Removing the Screen Workflow Without Fixing the Known Gaps Cross-Reference
**What goes wrong:** After `## Screen Workflow` is deleted from foundation SKILL.md, line 278 still says "See Screen Workflow for handling instructions" — this reference becomes a dangling pointer that misleads future readers.
**How to avoid:** Update line 278 when extracting the Screen Workflow section. Replace with: "Command skills handle this interruption — see the relevant command skill's workflow instructions."

### Pitfall 2: Using @~/ Syntax on Consecutive Lines
**What goes wrong:** A parser bug (now fixed, but historical) caused `@~/` consecutive references to be misread due to markdown strikethrough interference (~~text~~ parsing).
**How to avoid:** Use `@$HOME/` notation, which is the established pattern in this codebase and avoids any residual parser edge case.

### Pitfall 3: Description Field That Competes With Future Command Skills
**What goes wrong:** If the foundation description includes verbs like "explore", "prototype", "spec", "build", Claude may route those tasks to the foundation instead of the dedicated command skills (Phases 2–3).
**How to avoid:** Rewrite the description to focus on noun-phrase knowledge domains, not task verbs. Explicitly exclude the workflow task verbs.

### Pitfall 4: Applying the Outline Token Rename to Files That Don't Need It
**What goes wrong:** The rename was already applied to the authoritative token tables in `tokens.md`. Re-applying it would produce incorrect values.
**How to avoid:** The audit confirms tokens.md tables already show `outline/outline-variant` and `outline/default` correctly. Only the migration note banner on line 12 uses the old names — but that's intentional documentation of the rename direction (old → new). Do not change that banner.

### Pitfall 5: Treating the `1/color-roles` Prefix in figma-reading-guide.md as a Token Path Error
**What goes wrong:** Misreading `Only treat variables under 1/color-roles or 1/scale as authoritative` as a stale token path prefix.
**How to avoid:** The `1/` is the Figma variable collection name (the group that contains Bluefish variables in Figma Desktop), not a prefix added to code token paths. It tells Claude which Figma variable collection is authoritative when reading Figma variables via MCP. This is correct and should not be changed.

---

## Support File Audit Findings — Complete Reference

### tokens.md
- **Outline table:** Lines 38–39 already use correct new names. No changes needed.
- **Migration note (line 12):** `outline/subtle` and `outline/default` appear in historical context ("is now renamed to"). Intentional — no change.
- **Other drift:** None found.
- **Status:** FOUND-03 complete for this file. [VERIFIED: read live file]

### figma-reading-guide.md
- **Outline table (lines 75–76):** Already correct — maps `md.sys.color.outline` → `color-roles/outline/outline-variant` and `md.sys.color.outline-variant` → `color-roles/outline/default`.
- **Other drift:** `1/color-roles` and `1/scale` prefix (line 56) — intentional Figma collection identifier, not a token path error.
- **Status:** FOUND-03 complete for this file. [VERIFIED: read live file]

### type-styles.md
- **Outline references:** None.
- **Other drift:** `Page Title` listed in table without deprecation note (line 46 has the note, but SKILL.md line 75 doesn't). Drift exists between files. Flag only per D-04 — do not correct in Phase 1.
- **Status:** FOUND-03 complete (no outline rename needed). Drift flagged. [VERIFIED: read live file]

### tokens-dataviz.md
- **Outline references:** None.
- **Other drift:** `1/color-roles/dataviz/[NN]/[property]` on line 8 — intentional Figma collection notation (same as figma-reading-guide.md). Not an error.
- **Status:** FOUND-03 complete for this file. [VERIFIED: read live file]

### spec-template.md
- **Outline references:** None.
- **Other drift:** None found.
- **Status:** FOUND-03 complete for this file. [VERIFIED: read live file]

---

## State of the Art

| Old Approach | Current Approach | Notes |
|--------------|------------------|-------|
| Monolithic SKILL.md with all workflow modes | Foundation SKILL.md + command skills via @include | Phase 1 establishes the split |
| `outline/subtle` token name | `outline/default` | Renamed 2026-04-29; already applied to token tables |
| `outline/default` token name | `outline/outline-variant` | Renamed 2026-04-29; already applied to token tables |
| `Page Title` type style | `H4` | Deprecated per type-styles.md; SKILL.md list not yet updated |
| Skill descriptions cap: 250 chars | Cap raised to 1,536 chars | Longer descriptions now supported without truncation warning |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Creating empty stub SKILL.md files for bf-explore/bf-prototype in Phase 1 is unnecessary because @include runs command→foundation, not foundation→command | Focus Area 5 | Low — no Phase 1 artifact references the missing stubs. If wrong, stubs can be added as a trivial Wave 0 task in Phase 2. |
| A2 | Recommended description field pattern (noun phrases, excluding workflow verbs) produces reliable foundation-only triggering | Focus Area 3 | Medium — Claude's skill selection is probabilistic. If routing is wrong after Phase 2 command skills exist, the description can be tuned. |

---

## Open Questions

1. **Known Gaps cross-reference repair wording**
   - What we know: line 278 must be updated to remove "See Screen Workflow for handling instructions"
   - What's unclear: should it say "see the command skill's workflow" (forward-referencing skills that don't exist yet) or just remove the trailing reference?
   - Recommendation: Remove the trailing reference in Phase 1. Add a note: "Command skills invoked for this frame will handle the Code Connect interruption." Command-specific handling will be documented in Phase 2/3 SKILL.md files.

2. **Foundation description testing**
   - What we know: the description field must trigger for design system questions but not for workflow tasks
   - What's unclear: without Phase 2/3 command skills installed, the foundation will route all Bluefish tasks regardless of description content — true routing can only be tested once command skills exist
   - Recommendation: Write the description to exclude workflow verbs now; accept that routing can be validated and tuned in Phase 2 once a second Bluefish skill exists to compete with the foundation.

---

## Environment Availability

Step 2.6: SKIPPED — Phase 1 is a purely file-editing phase. All work is edits to SKILL.md files in `~/.claude/skills/`. No external tools, CLIs, databases, or runtimes are required.

---

## Security Domain

Step: SKIPPED — This phase edits design system reference documentation files. No authentication, user data, cryptography, or network surface is involved. ASVS categories do not apply.

---

## Sources

### Primary (HIGH confidence)
- Live read of `/Users/pcartelli/.claude/skills/bluefish-design-system/SKILL.md` — all section boundaries and cross-references
- Live read of all five support files — complete outline token audit
- Live read of GSD skills (`gsd-execute-phase/SKILL.md`, `gsd-plan-phase/SKILL.md`) — @include directive syntax and placement
- `/Users/pcartelli/.claude/cache/changelog.md` — skill description character limits, `claude-proactive` trigger mechanism, `@~/` parsing fix history

### Secondary (MEDIUM confidence)
- Superpowers plugin `GEMINI.md` — confirms `@./` relative path form works in non-skill context files
- GSD skill body `@$HOME/` pattern — confirmed across 30+ GSD skill files

---

## Metadata

**Confidence breakdown:**
- Skill file split: HIGH — read line-by-line, boundaries are explicit
- Support file audit: HIGH — read all five files, grepped for all token variants
- @include syntax: HIGH — verified across 30+ GSD skills in live codebase
- Description trigger mechanics: MEDIUM — changelog confirms mechanism exists; exact routing behavior is probabilistic and not unit-testable until Phase 2 command skills exist
- Stub file recommendation: ASSUMED — based on @include direction analysis; low risk

**Research date:** 2026-05-08
**Valid until:** 2026-06-08 (stable domain — skill file mechanics change infrequently)

---

## RESEARCH COMPLETE
