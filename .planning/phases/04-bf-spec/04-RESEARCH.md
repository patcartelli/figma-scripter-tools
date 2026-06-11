# Phase 4: /bf-spec - Research

**Researched:** 2026-06-11
**Domain:** Claude skill authoring — Figma MCP sequence, engineering handoff doc generation
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**D-01:** Skill infers scope from Figma selection: screen frame selected → screen mode; component instance selected → component mode. One skill, two sub-paths (not two separate intake questions).

**D-02:** Screen mode output: one file `spec-[screen-name].md` saved in the current working directory. Structure: `## Component Inventory` table at the top (list of all components found), then each component spec as a `## [Component Name]` section below it using `spec-template.md` format. All in one doc per invocation.

**D-03:** Component mode output: one file `spec-[component-name].md` saved in the current working directory. Matches the existing `spec-button.md` / `spec-chip.md` pattern exactly. Phase 5 `/bf-build` Path B reads this file directly.

**D-04:** Spec files saved in the current working directory (`./`) of the project — not in `~/.claude/skills/bluefish-design-system/`. The existing `spec-button.md` files in the foundation are reference examples; user-generated specs land in the project.

**D-05:** When bare-invoked (`/bf-spec` with no context), ask exactly one clarifying question: "What screen or component are you speccing?" — then proceed to the MCP sequence.

**D-06:** Always attempt Figma MCP first — even when context is provided in the invocation message. `get_variable_defs` + `get_metadata` + `get_design_context` are always tried before generating. Same pattern as `/bf-prototype`.

**D-07:** Conversation-only fallback is allowed. If MCP returns nothing, flag all token values with `⚠️`, emit MCP-unavailable diagnostic, and produce a partial spec. Output is never blocked by missing Figma data.

**D-08:** Use `get_design_context` (not `get_context_for_code_connect`) as the primary per-component deep-dive tool. The ROADMAP sequence stands: `get_metadata` → `get_variable_defs` → `get_design_context`.

**D-09:** `get_metadata` role is not fully known before implementation — call it first at the start of every invocation, use what it returns for screen/frame identity (name, page, frame context), and document in the skill what each response field maps to.

**D-10:** Screen mode MCP pattern: `get_metadata` once + `get_variable_defs` once for the screen → then `get_design_context` per component found. Token data from `get_variable_defs` is shared across all components in the screen (not re-fetched per component).

**D-11:** Recurse into sub-components only when they map to a named Bluefish/MUI component from `figma-reading-guide.md` Step 3. Custom layout containers and unnamed sub-layouts are treated as atomic and noted with `⚠️ custom layout — no Bluefish component match`.

**D-12:** Sub-component specs are inlined under the parent component's section as `### Sub-component: [Name]` subsections — not hoisted to top-level `##` sections.

**D-13:** If Code Connect interrupts a sub-component's `get_design_context` call: `⚠️ Code Connect not configured for [sub-component] — proceeding from conversation context` and continue. Never block output.

**Carried forward from prior phases:**
- `@include pattern`: `@~/.claude/skills/bluefish-design-system/SKILL.md` immediately after frontmatter closing `---`
- On-demand support reads: `tokens.md`, `type-styles.md`, `tokens-dataviz.md`, `figma-reading-guide.md` — NOT @included upfront
- `get_variable_defs` precedence: live Figma values take precedence over `tokens.md`
- Code Connect graceful fallback: flag inline and continue
- Token drift flagging: use live value and flag drift inline

### Claude's Discretion

- `get_metadata` field mapping: skill author determines how each response field maps to spec output (frame name → output filename, page name → Figma Reference section, etc.) when writing the skill.
- Component Inventory table format in screen mode: Claude determines column structure based on what `get_design_context` reliably returns (likely: Component Name, Category, MUI Equivalent, Section).
- Token compliance pre-return checklist: Claude runs the foundation's 8-point checklist internally before returning spec output.

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.

</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SPEC-01 | `/bf-spec` SKILL.md created at `~/.claude/skills/bf-spec/SKILL.md` with the three-tool Figma MCP sequence (`get_metadata` → `get_variable_defs` → `get_design_context`) as the core data-gathering mechanic | Full skill structure mapped below; MCP sequence order locked by D-08/D-10 |
| SPEC-02 | Skill fires correctly when user types `/bf-spec` or asks for a spec or handoff doc for a Bluefish screen | `description:` frontmatter pattern from prior skills documented; trigger discrimination rules provided |

</phase_requirements>

---

## Summary

Phase 4 delivers a single new file: `~/.claude/skills/bf-spec/SKILL.md`. This is a Claude skill authoring task — no packages to install, no code to compile, no external services to provision. The deliverable is a well-formed Markdown skill document that encodes a specific workflow into Claude's behavior whenever the `/bf-spec` command is invoked.

The skill's structure is already determined by precedent. The `bf-prototype` skill is the direct structural analog — it establishes the frontmatter format, `@include` pattern, Support Files section, Figma Context section (including MCP-unavailable diagnostic), Code Connect fallback, and Anti-Patterns section. Phase 4's job is to adapt that skeleton for the spec sequence: swap prototype output rules for spec output rules, replace the two-mode intake with scope-inference intake, and add the screen mode Component Inventory logic.

All output format decisions are already specified: `spec-template.md` defines the per-component section structure, the Field Mapping table in `spec-template.md` gives the explicit `get_design_context` → spec field translation rules, and the four reference spec files (`spec-button.md`, `spec-chip.md`, `spec-text-field.md`, `spec-autocomplete.md`) define the quality bar. The main authoring work is composing these existing pieces into a coherent, unambiguous skill workflow with clear screen mode vs. component mode branching.

One pre-work item gates testing: the `bluefish-design-system` SKILL.md `description:` frontmatter must be updated to exclude "spec" and "build" as trigger phrases before the new skill is tested. If this is not done first, the foundation skill will intercept `/bf-spec` invocations.

**Primary recommendation:** Author `bf-spec/SKILL.md` by adapting the `bf-prototype` skeleton, substituting the spec output rules, and adding the screen mode Component Inventory section. Execute the foundation description update as Wave 0 before any testing.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Skill invocation routing | Claude skill system (`description:` frontmatter) | — | `description:` field is parsed by Claude to match user intent to skill |
| MCP data gathering | Figma MCP tools (`get_metadata`, `get_variable_defs`, `get_design_context`) | Conversation fallback | MCP owns live Figma state; fallback applies when Desktop is closed |
| Scope inference (screen vs. component mode) | Skill workflow logic | `get_metadata` response | Skill reads MCP response to determine which output path to follow |
| Component Inventory construction (screen mode) | Skill workflow logic | `get_design_context` per component | Skill enumerates components from frame structure |
| Per-component spec generation | Skill workflow logic + `spec-template.md` | Foundation token rules | `spec-template.md` provides the field structure; foundation provides token/a11y rules |
| Token resolution | `get_variable_defs` (live) | `tokens.md` (fallback) | Live Figma values are authoritative; `tokens.md` is the fallback when MCP unavailable |
| Sub-component recursion | Skill workflow logic | `figma-reading-guide.md` Step 3 | Step 3 component category table defines which sub-components trigger recursion |
| Output file writing | Skill instructs Claude to write | — | Claude writes `spec-[name].md` to current working directory |
| Foundation inheritance | `@include` of `bluefish-design-system/SKILL.md` | — | Token rules, a11y standards, Figma MCP setup inherited via @include |

---

## Standard Stack

### Core

This phase has no external packages. The "stack" is the existing skill system.

| Asset | Location | Purpose | Source |
|-------|----------|---------|--------|
| `bf-prototype/SKILL.md` | `~/.claude/skills/bf-prototype/SKILL.md` | Structural template to adapt | [VERIFIED: read directly] |
| `bluefish-design-system/SKILL.md` | `~/.claude/skills/bluefish-design-system/SKILL.md` | Foundation inherited via @include | [VERIFIED: read directly] |
| `spec-template.md` | `~/.claude/skills/bluefish-design-system/spec-template.md` | Per-component output format + Field Mapping table | [VERIFIED: read directly] |
| `figma-reading-guide.md` | `~/.claude/skills/bluefish-design-system/figma-reading-guide.md` | Component category inference, M3 token mapping, recursion trigger list | [VERIFIED: read directly] |
| `spec-button.md` | `~/.claude/skills/bluefish-design-system/spec-button.md` | Quality bar reference for component mode output | [VERIFIED: read directly] |
| `spec-chip.md` | `~/.claude/skills/bluefish-design-system/spec-chip.md` | Quality bar reference | [VERIFIED: read directly] |
| `spec-text-field.md` | `~/.claude/skills/bluefish-design-system/spec-text-field.md` | Form control quality bar | [VERIFIED: exists in directory] |
| `spec-autocomplete.md` | `~/.claude/skills/bluefish-design-system/spec-autocomplete.md` | Composite component quality bar | [VERIFIED: read directly] |

### New File to Create

| File | Location | Content |
|------|----------|---------|
| `bf-spec/SKILL.md` | `~/.claude/skills/bf-spec/SKILL.md` | The Phase 4 deliverable |

---

## Package Legitimacy Audit

Not applicable — this phase installs no external packages. The deliverable is a Markdown skill file.

---

## Architecture Patterns

### Skill File Structure (from bf-prototype precedent)

```
~/.claude/skills/bf-spec/
└── SKILL.md
```

The skill file follows the same structure as `bf-prototype/SKILL.md`:

```
---
name: bf-spec
description: >
  [trigger description — see trigger discrimination section]
---

@~/.claude/skills/bluefish-design-system/SKILL.md

# bf-spec

[one-paragraph purpose + what is inherited vs. owned]

## Support Files — Read On Demand

[same 4 support files as bf-prototype; identical section]

## Intake

[scope-inference logic — screen vs. component mode from Figma selection]

## Figma Context — Always Attempt First

[get_metadata → get_variable_defs → get_design_context sequence]
[MCP-unavailable diagnostic]

## Screen Mode — Output Rules

[Component Inventory table + per-component spec sections]

## Component Mode — Output Rules

[single component spec file, spec-template.md format]

## Sub-Component Recursion Rules

[D-11 / D-12 / D-13 logic]

## Anti-Patterns — Do Not Do These

[critical failure modes to avoid]
```

### Pattern 1: Frontmatter + @include

Every command skill starts with YAML frontmatter followed immediately by the @include line. [VERIFIED: read bf-prototype/SKILL.md directly]

```yaml
---
name: bf-spec
description: >
  Generates a structured engineering handoff spec from a Figma screen or component.
  Use when the user types /bf-spec or asks for a spec, engineering handoff doc, or
  component inventory for a Bluefish screen. Not for prototypes (use bf-prototype)
  or layout explorations (use bf-explore).
---

@~/.claude/skills/bluefish-design-system/SKILL.md
```

**Trigger discrimination note:** The description must NOT include the words "spec" or "build" broadly — it must anchor on handoff doc and engineering spec language to avoid colliding with `/bf-build` (Phase 5). The `bluefish-design-system` foundation description must also be updated to exclude "spec" trigger language before this skill is tested (ROADMAP pre-work).

### Pattern 2: MCP Sequence — bf-spec variant

The bf-spec sequence differs from bf-prototype in one key way: `get_metadata` is called first (not in bf-prototype's sequence), and `get_design_context` is called per component (once per component, not once for the whole frame). [VERIFIED: locked in D-08, D-09, D-10]

```
Invocation start:
  1. get_metadata           ← once, for the selected frame/screen
     → use: frame name → output filename, page name → Figma Reference field
  2. get_variable_defs      ← once, for the selected frame
     → use: live token values (authoritative for all components in this session)
  3. [enumerate components from frame structure]
  4. for each component:
       get_design_context   ← once per component
       → use: Field Mapping table in spec-template.md to populate spec fields
```

### Pattern 3: Scope Inference (Screen vs. Component Mode)

Unlike bf-prototype (which asks a mode question), bf-spec infers scope from what Figma returns. [VERIFIED: D-01]

```
get_metadata response:
  ├── Frame/screen node selected → Screen mode
  │     Output: spec-[screen-name].md
  │     Structure: ## Component Inventory table + ## [Component] sections
  └── Component instance selected → Component mode
        Output: spec-[component-name].md
        Structure: matches spec-button.md pattern exactly
```

When invoked bare with no Figma context or when scope is ambiguous from MCP response, ask one question: "What screen or component are you speccing?"

### Pattern 4: Screen Mode Document Structure

[VERIFIED: D-02; column structure is Claude's discretion]

```markdown
# Spec: [Screen Name]

**Generated:** [date]
**Source:** [Figma page — from get_metadata]

## Component Inventory

| Component | Category | MUI Equivalent | Section |
|-----------|----------|----------------|---------|
| [name]    | [cat]    | [e.g., Button] | [##heading] |

---

## [Component Name]
[spec-template.md format — all required fields]

### Sub-component: [Name]
[inline sub-component spec — D-12]

---

## [Next Component Name]
...
```

### Pattern 5: MCP-Unavailable Diagnostic

Exact wording reused from bf-prototype — emit as first content line of the output spec file when no MCP call succeeded. [VERIFIED: read bf-prototype/SKILL.md directly]

```markdown
> ⚠️ Figma MCP unavailable — tokens from ~/.claude/skills/bluefish-design-system/{tokens.md, type-styles.md}; live values not verified
```

### Pattern 6: Warning Flag Vocabulary

Exact phrases from foundation and prior skills — must be reused verbatim: [VERIFIED: read bf-prototype/SKILL.md and bluefish-design-system/SKILL.md directly]

| Situation | Exact Flag Text |
|-----------|----------------|
| Code Connect intercept | `⚠️ Code Connect not configured — proceeding from conversation context` |
| Code Connect on sub-component | `⚠️ Code Connect not configured for [sub-component] — proceeding from conversation context` |
| MCP unavailable globally | `⚠️ Figma MCP unavailable — tokens from ~/.claude/skills/bluefish-design-system/{tokens.md, type-styles.md, tokens-dataviz.md}; live values not verified` |
| No token for value | `⚠️ no token for [value] — needs token` |
| Token drift | `⚠️ token drift — using live Figma value` |
| Elevation gap | `⚠️ elevation token undefined — omit elevation; flag for design review` |
| Token injection unconfirmed | `⚠️ token injection method unconfirmed — verify with eng` |
| Custom layout container | `⚠️ custom layout — no Bluefish component match` |
| Missing category | `⚠️ component type unclear — [name] — needs categorization` |

### Pattern 7: spec-template.md Field Mapping (the core per-component output rule)

The `spec-template.md` Field Mapping table defines exactly which `get_design_context` response field populates each spec section. The skill must reference this table rather than re-deriving the mapping. [VERIFIED: read spec-template.md directly]

Key rules from the table:
- `## [Component Name]` — use master component name from figma-reading-guide.md Step 1 (not auto-generated layer name)
- `**Category:**` — infer from figma-reading-guide.md Step 3
- `**Status:**` — always manual, always defaults to `Needs Review`
- `### Accessibility` — always manual judgment, never populated from MCP response; never left blank
- Component Name is the ONLY field that triggers a clarifying question; all other missing fields use fill-and-flag pattern silently

### Pattern 8: Sub-Component Recursion Logic

[VERIFIED: D-11, D-12, D-13; figma-reading-guide.md Step 3 confirmed]

Recursion trigger list (from figma-reading-guide.md Step 3):
- Navigation: `Nav`, `Navigation`, `Nav Rail`, `Header`, `Menu`, `Tab`, `Search`
- Buttons & Capsules: `Button`, `Btn`, `CTA`, `Capsule`, `Badge`, `Tag`, `Chip`
- Forms & Controls: `Input`, `Select`, `Dropdown`, `Checkbox`, `Radio`, `Toggle`, `Switch`, `Date`, `Control`
- Data & Charts: `Chart`, `Graph`, `Bar`, `Line`, `Pie`, `Donut`, `Sparkline`
- Feedback: `Alert`, `Toast`, `Banner`, `Message`, `Notification`, `Tooltip`
- Layout: `Card`, `Panel`, `Container`, `Modal`, `Drawer`, `Sheet`

Any sub-component whose name matches a category above → recurse, inline as `### Sub-component: [Name]`.
Any sub-component that does not match → flag with `⚠️ custom layout — no Bluefish component match` and treat as atomic.

### Anti-Patterns to Avoid

- **Mode question instead of scope inference:** bf-spec does NOT ask "screen or component mode?" — it reads the Figma selection to infer. Asking a mode question is the bf-prototype anti-pattern, not bf-spec.
- **Skipping `get_metadata`:** The MCP sequence for bf-spec starts with `get_metadata`. Calling `get_variable_defs` first (as in bf-prototype) is the wrong order here.
- **Re-calling `get_variable_defs` per component:** Token data from `get_variable_defs` is fetched once for the screen and shared across all components (D-10). Per-component re-fetch is wasteful and wrong.
- **Hoisting sub-component specs:** Sub-component specs are nested under `### Sub-component:` inside the parent's `## [Component]` section — not hoisted to top-level `##` sections (D-12).
- **Blocking output on Code Connect:** At no level (top-level or sub-component) does a Code Connect intercept block spec generation. Flag and continue (D-13).
- **Discarding partial MCP results:** If `get_design_context` returns data before a Code Connect prompt, use what was returned (same rule as bf-prototype).
- **Writing specs to `~/.claude/skills/bluefish-design-system/`:** User-generated specs write to `./` (current working directory), not the foundation skills directory (D-04).
- **Triggering on "build" or "implement":** These phrases belong to Phase 5 `/bf-build`. The bf-spec trigger anchors are "spec", "handoff doc", "engineering spec", "component inventory".
- **Omitting Accessibility section:** The `spec-template.md` marks Accessibility as `[Required — non-optional. Every spec must include this section, even for non-interactive components]`. It is never blank.
- **Asking follow-up questions beyond component name:** The Field Mapping table is explicit — component name is the ONLY field that triggers a clarifying question. All other missing fields use fill-and-flag silently.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Per-component output format | Custom section structure | `spec-template.md` exactly | The Field Mapping table in spec-template.md is already the complete spec → MCP response translation layer |
| Component category inference | Custom name-matching logic | `figma-reading-guide.md` Step 3 table | All component names and categories already enumerated |
| Token path translation | Custom hex-to-token logic | `get_variable_defs` + `tokens.md` fallback | Live values from MCP are authoritative; tokens.md covers fallback |
| Recursion trigger list | Custom sub-component detection | `figma-reading-guide.md` Step 3 | Same table governs which names trigger recursion |
| Warning flag wording | New flag text | Existing `⚠️` vocabulary (see Pattern 6 table) | Consistent flag language across all skills is a stated project convention |
| Foundation context | Inline token rules, a11y rules | `@include bluefish-design-system/SKILL.md` | @include is how all command skills inherit the foundation |

**Key insight:** Almost every decision in this skill is already resolved by existing artifacts. The skill author's job is composition and wire-up, not invention.

---

## Common Pitfalls

### Pitfall 1: MCP Sequence Order Confusion
**What goes wrong:** Skill calls `get_variable_defs` before `get_metadata`, copying the bf-prototype sequence.
**Why it happens:** bf-prototype's Figma Context section calls `get_variable_defs` then `get_design_context` — there is no `get_metadata` in that skill. The bf-spec sequence is different.
**How to avoid:** Write the Figma Context section with an explicit numbered list: (1) `get_metadata`, (2) `get_variable_defs`, (3) `get_design_context` per component. Add this as an Anti-Pattern.
**Warning signs:** Spec output uses frame name as section heading but the filename doesn't match the screen name — `get_metadata` data was not used for naming.

### Pitfall 2: Foundation Description Not Updated Before Testing
**What goes wrong:** During smoke test, typing `/bf-spec` triggers `bluefish-design-system` foundation instead of the new skill.
**Why it happens:** The foundation's `description:` field may still include "spec" or broad enough language to match handoff requests. The ROADMAP pre-work item gates testing.
**How to avoid:** Wave 0 of the plan must include the foundation description update as a required task before any testing task.
**Warning signs:** After creating bf-spec/SKILL.md, `/bf-spec` invocation produces a token lookup response instead of starting the MCP sequence.

### Pitfall 3: Scope Inference Fails on Bare Invocation
**What goes wrong:** Skill executes MCP calls when bare-invoked, gets no meaningful Figma context, and generates a spec for nothing.
**Why it happens:** The MCP always-attempt-first rule conflicts with bare invocation — there is no selection to read.
**How to avoid:** Add an explicit condition: if bare-invoked AND `get_metadata` returns empty/nil AND no prior conversation context → ask the one clarifying question before proceeding to MCP calls.
**Warning signs:** Output file named `spec-.md` or `spec-undefined.md` with empty sections.

### Pitfall 4: Component Mode vs. Screen Mode Output Shape Conflation
**What goes wrong:** Component mode output includes a Component Inventory table; screen mode output omits it.
**Why it happens:** The two modes have different document structures and the template doesn't make the distinction explicit.
**How to avoid:** The skill must have separate clearly-named sections for Screen Mode Output Rules and Component Mode Output Rules — matching the pattern in bf-prototype (HTML Mode vs. Vite+MUI Mode). Do not collapse into one "Output Rules" section.
**Warning signs:** A single-component spec (`spec-button.md`) starts with a Component Inventory table listing only itself.

### Pitfall 5: Accessibility Section Left Blank or Omitted
**What goes wrong:** Accessibility section missing from one or more component sections in a screen mode output.
**Why it happens:** Screen mode generates multiple component sections in one pass — easy to lose track of which sections received all required fields.
**How to avoid:** Pre-return checklist must explicitly include: "Every component section has a non-empty Accessibility block." Add this as an Anti-Pattern.
**Warning signs:** Any `## [Component Name]` section without an `### Accessibility` subsection.

### Pitfall 6: Sub-Component Specs Hoisted to Top Level
**What goes wrong:** A composite component's sub-components appear as top-level `## [Component]` sections instead of nested `### Sub-component: [Name]` subsections.
**Why it happens:** The screen mode output iterates components into `##` sections — sub-component discovery during a component's `get_design_context` call could incorrectly add to the top-level iteration.
**How to avoid:** The recursion rule (D-12) must be in a dedicated Sub-Component Recursion section with the explicit heading format `### Sub-component: [Name]`. Add nesting as an Anti-Pattern.
**Warning signs:** Screen mode output has more `##` sections than the Component Inventory table has rows.

---

## Code Examples

### Canonical Frontmatter + @include (from bf-prototype)

```yaml
---
name: bf-spec
description: >
  Generates a structured engineering handoff spec from a Figma screen or component.
  Use when the user types /bf-spec or asks for a spec, engineering handoff doc, or
  component inventory for a Bluefish screen or component. Not for prototypes (use
  bf-prototype), layout explorations (use bf-explore), or production code (use bf-build).
---

@~/.claude/skills/bluefish-design-system/SKILL.md
```

[VERIFIED: pattern from bf-prototype/SKILL.md, read directly]

### Support Files Section (identical to bf-prototype)

```markdown
## Support Files — Read On Demand

Do not read these at skill start. Read them only when the task requires it:

- Read `~/.claude/skills/bluefish-design-system/tokens.md` when resolving color, spacing, or radius token paths
- Read `~/.claude/skills/bluefish-design-system/type-styles.md` when populating the Type Styles section of a spec
- Read `~/.claude/skills/bluefish-design-system/tokens-dataviz.md` when speccing dataviz components
- Read `~/.claude/skills/bluefish-design-system/figma-reading-guide.md` when interpreting Figma MCP output or inferring component categories
```

[VERIFIED: pattern from bf-prototype/SKILL.md, read directly]

### MCP Sequence — bf-spec Order

```markdown
## Figma Context — Always Attempt First

Before generating any output, always attempt Figma MCP calls in this order:

1. Call `get_metadata` — identifies the selected frame: frame name, page, and context.
   Use frame name for the output filename (`spec-[frame-name].md`) and page name for
   the Figma Reference field in each component section.
2. Call `get_variable_defs` — pulls live token values. Authoritative for this session.
   These are shared across all components in the screen — do not re-call per component.
3. Call `get_design_context` — one call per component found in the frame structure.
   Use the Field Mapping table in spec-template.md to populate each spec section.
```

[VERIFIED: D-08, D-09, D-10 locked decisions]

### Token Drift Flag (from foundation)

```markdown
| `color-roles/primary/main` | Background fill — live: #005566, tokens.md: #00414F ⚠️ token drift — using live Figma value |
```

[VERIFIED: from bluefish-design-system/SKILL.md, read directly]

### Sub-Component Section Heading

```markdown
## Button Group

**Category:** Buttons & Capsules
...

### Sub-component: Button (Contained)

**Category:** Buttons & Capsules
...

### Sub-component: Button (Outlined)

...
```

[VERIFIED: D-12 locked decision]

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Spec workflow in foundation SKILL.md | Extracted to dedicated command skill | Phase 1 (2026-05-08) | Foundation is context-only; command skills own workflow |
| Single spec template for all components | `spec-template.md` with Field Mapping table | Phase 1 (2026-05-08) | Field mapping table removes ambiguity about where each spec field comes from |
| `get_context_for_code_connect` as alternative deep-dive | `get_design_context` is primary; Code Connect route is a known interrupt, not an alternative | D-08 locked 2026-06-11 | Simpler single path; Code Connect interrupt handled gracefully |
| `get_variable_defs` + `get_design_context` (two-tool sequence from bf-prototype) | Three-tool sequence: `get_metadata` first, then `get_variable_defs`, then `get_design_context` | Phase 4 (new) | `get_metadata` provides frame identity needed for screen-level filename and document header |

**Deprecated/outdated:**
- Screen Workflow section in foundation: removed in Phase 1. All workflow logic lives in command skills.
- `get_context_for_code_connect` as primary tool: superseded by `get_design_context` with graceful Code Connect fallback (D-08).

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `get_metadata` returns a frame name usable as an output filename | MCP Sequence Pattern, Pitfall 3 | Output filename would need to fall back to user-provided name; add fallback to the skill |
| A2 | `get_metadata` returns a Figma page name usable for the Figma Reference field | MCP Sequence Pattern | Figma Reference field may be empty; low risk — field is marked Optional in spec-template.md |
| A3 | `get_metadata` distinguishes between a screen/frame selection and a component instance selection reliably | Scope Inference Pattern | Scope inference may fail; skill should fall back to asking one clarifying question when scope is ambiguous |

[ASSUMED] tags apply to A1–A3 because `get_metadata` response shape is explicitly noted as unknown (D-09): "role is not fully known before implementation."

**All other claims in this research were verified by reading the existing skill files and locked decisions in CONTEXT.md.**

---

## Open Questions

1. **`get_metadata` response field names**
   - What we know: D-09 acknowledges the field mapping is unknown before implementation. The skill should document what it finds.
   - What's unclear: Whether `get_metadata` returns a node type indicator sufficient to distinguish screen frame from component instance, or whether the skill needs to infer from node structure.
   - Recommendation: Skill should attempt `get_metadata` and include a note to the skill author: "Document what each response field returns here after first run." Add a conditional branch: if selection type ambiguous → ask one clarifying question.

2. **Component Inventory table columns**
   - What we know: D-02 delegates column structure to Claude's discretion. Four likely columns identified: Component Name, Category, MUI Equivalent, Section.
   - What's unclear: Whether `get_design_context` reliably returns enough data to populate "MUI Equivalent" in all cases, or whether it needs to be inferred via figma-reading-guide.md Step 3 logic.
   - Recommendation: Define the table with those four columns; mark MUI Equivalent as best-effort (use figma-reading-guide.md inference; flag `⚠️` when no match found).

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Figma Desktop + MCP | `get_metadata`, `get_variable_defs`, `get_design_context` calls | [user-dependent at runtime] | — | Conversation fallback with `tokens.md`; MCP-unavailable diagnostic |
| `~/.claude/skills/bluefish-design-system/` | @include, on-demand support reads | ✓ | Phase 1 complete | — |
| `~/.claude/skills/bf-prototype/SKILL.md` | Structural template reference | ✓ | Phase 3 complete | — |
| `~/.claude/skills/bf-spec/` directory | Output location | ✗ (must be created) | — | Create in Wave 0 |

**Missing dependencies with no fallback:**
- `~/.claude/skills/bf-spec/` directory does not exist yet — must be created as Wave 0 before writing SKILL.md.

**Missing dependencies with fallback:**
- Figma Desktop: skill always attempts MCP first; fallback to conversation context is built into the workflow.

---

## Security Domain

Not applicable. This phase creates a Markdown skill file with no authentication, data persistence, network calls, or user input handling beyond Figma MCP tool invocations. No ASVS categories apply.

---

## Sources

### Primary (HIGH confidence)
- `~/.claude/skills/bf-prototype/SKILL.md` — read directly; primary structural analog
- `~/.claude/skills/bluefish-design-system/SKILL.md` — read directly; foundation context, @include pattern, warning flag vocabulary
- `~/.claude/skills/bluefish-design-system/spec-template.md` — read directly; output format and Field Mapping table
- `~/.claude/skills/bluefish-design-system/figma-reading-guide.md` — read directly; component categories, Step 3 recursion trigger list
- `~/.claude/skills/bluefish-design-system/spec-button.md` — read directly; component mode quality bar
- `~/.claude/skills/bluefish-design-system/spec-chip.md` — read directly; secondary quality bar
- `~/.claude/skills/bluefish-design-system/spec-autocomplete.md` — read directly; composite component quality bar
- `.planning/phases/04-bf-spec/04-CONTEXT.md` — read directly; all decisions D-01 through D-13

### Secondary (MEDIUM confidence)
- `.planning/REQUIREMENTS.md` — read directly; SPEC-01, SPEC-02 acceptance criteria
- `.planning/ROADMAP.md` — read directly; success criteria, pre-work item
- `.planning/STATE.md` — read directly; project history and open questions

### Tertiary (LOW confidence)
- A1–A3 assumptions about `get_metadata` response shape — training knowledge only; D-09 explicitly acknowledges this is unknown before implementation

---

## Metadata

**Confidence breakdown:**
- Skill structure: HIGH — direct precedent from bf-prototype (read directly)
- MCP sequence: HIGH — locked by D-08, D-09, D-10 in CONTEXT.md
- Output format: HIGH — spec-template.md and four reference spec files read directly
- `get_metadata` response shape: LOW — explicitly unknown per D-09; flagged in Assumptions Log

**Research date:** 2026-06-11
**Valid until:** Stable (skill authoring task; no external dependencies to drift)
