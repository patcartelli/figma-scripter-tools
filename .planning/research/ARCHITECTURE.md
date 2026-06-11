# Architecture Research

**Project:** Bluefish Design System Skill System — v1.1 Specifications
**Researched:** 2026-06-11
**Confidence:** HIGH — all findings drawn directly from current skill source files

---

## Skill System Architecture (Current)

The system uses a two-layer inheritance model enforced by Claude Code's `@include` directive.

**Layer 1 — Foundation (`bluefish-design-system/SKILL.md`)**
Context-only. Contains token rules, accessibility standards, Figma MCP setup, code output
standards, component map strategy, and known design gaps. No workflow logic. Fires on
general design-system questions that are not explicitly an explore, prototype, spec, or
build task.

**Layer 2 — Command Skills**
Each command skill opens with `@~/.claude/skills/bluefish-design-system/SKILL.md`, which
inlines the full foundation context at skill load time. The command skill then owns its
specific workflow: intake gate, output rules, anti-patterns.

Current command skills:
- `~/.claude/skills/bf-explore/SKILL.md` — 2–3 HTML layout variations
- `~/.claude/skills/bf-prototype/SKILL.md` — single HTML or Vite+MUI prototype

**Support file pattern**
Five authoritative support files live in `bluefish-design-system/`:

| File | When read | By whom |
|---|---|---|
| `tokens.md` | On demand, when generating color/spacing/radius | All command skills |
| `type-styles.md` | On demand, when setting typography | All command skills |
| `tokens-dataviz.md` | On demand, when generating dataviz colors | All command skills |
| `figma-reading-guide.md` | On demand, when interpreting Figma MCP output | All command skills |
| `spec-template.md` | On demand, when generating a spec | bf-spec (primary), others if needed |

The "read on demand, not at start" pattern is established by both bf-explore and bf-prototype.
bf-spec and bf-build must follow the same pattern — do not read all support files eagerly.

**Pre-built component spec files**
Four component specs already exist in `bluefish-design-system/`:
- `spec-button.md`, `spec-chip.md`, `spec-text-field.md`, `spec-autocomplete.md`

These are reference outputs — examples of what /bf-spec produces. bf-spec can reference
them as a quality bar and bf-build can reference them as an alternative input path when
a Figma frame is unavailable or a spec already exists.

---

## /bf-spec: Integration Points

**Foundation inheritance**
`@~/.claude/skills/bluefish-design-system/SKILL.md` at the top of SKILL.md. This is
identical to how bf-explore and bf-prototype work. No changes to foundation needed.

**figma-reading-guide.md (primary integration)**
/bf-spec is the most Figma-MCP-dependent skill in the system. It uses the reading guide
for every stage of its workflow:
- Step 1: resolving master component name (the only field that triggers a clarifying question)
- Step 2: parsing `/`-separated component hierarchy
- Step 3: inferring component category (Navigation, Buttons & Capsules, etc.)
- Step 4: interpreting Figma property key=value pairs for the Props table
- Step 5: mapping M3-style variable names to `color-roles` paths

Read rule: "Read `figma-reading-guide.md` when interpreting Figma MCP output" — same
on-demand trigger used by bf-explore and bf-prototype.

**spec-template.md (primary integration)**
bf-spec owns the spec output format. The template defines every required and optional
field, the field-mapping table from `get_design_context` response fields, and the
fill-and-flag rules for missing data. bf-spec reads spec-template.md at generation time
and follows its structure exactly.

Read rule: "Read `spec-template.md` when generating a spec" — existing rule already
present in the foundation's Code Output section. bf-spec makes this rule actionable.

**tokens.md**
Read on demand when populating the "Tokens Used" table. Live `get_variable_defs` values
take precedence; tokens.md is the fallback, flagged with
`/* ⚠️ live token data unavailable — using tokens.md */`.

**Existing component spec files as reference corpus**
spec-button.md, spec-chip.md, spec-text-field.md, spec-autocomplete.md already exist.
/bf-spec should treat these as quality bar examples. When building its output rules
section, it should note: "Output must match the structure and flag density shown in
`spec-button.md` — that file is a verified reference implementation."

**Code Connect handling (critical integration point)**
Code Connect is not configured. The `get_design_context` call will trigger a Code Connect
interruption prompt. bf-spec must handle this at the workflow level — not rely on the
foundation's generic note — with an explicit graceful degradation path (see section below).

---

## /bf-build: Integration Points

**Foundation inheritance**
Same `@~/.claude/skills/bluefish-design-system/SKILL.md` include. Foundation's Code
Output section (token-to-code mapping, MUI wrapping pattern, DATA-03 dual-path output,
pre-return checklist, type-only import rule, screenshot comparison rule) is the primary
driver of bf-build behavior.

**tokens.md (primary integration)**
bf-build generates production React/MUI code. Every token reference must use a valid
`color-roles`, `scale`, or dataviz path. tokens.md is the authoritative source when
live Figma values are unavailable.

**tokens-dataviz.md**
Read on demand when the component involves charts, gauges, sparklines, or series colors.

**type-styles.md**
Read on demand when applying typography — must map to top-level style names and apply
the platform weight constraint.

**figma-reading-guide.md**
Read on demand when interpreting Figma MCP output for component props and structure.
bf-build needs prop and token data from Figma to produce accurate TypeScript interfaces.

**DATA-03 dual-path output (critical constraint)**
Token injection method is unconfirmed. bf-build must emit both the MUI theme extension
form and the CSS custom property form for every token reference in sx props, flagged with
`/* ⚠️ token injection method unconfirmed — verify with eng */`. This pattern is already
fully specified in the foundation's Code Output section and in bf-prototype's Vite+MUI
output rules — bf-build inherits and enforces it strictly.

**MUI wrapping pattern (critical constraint)**
All components follow the `<BluefishButton>` wrapping architecture. bf-build enforces
this, never emitting raw MUI components with Bluefish sx overrides directly.

---

## /bf-spec → /bf-build Data Flow

**Question: can /bf-build consume /bf-spec output? Should it?**

Yes on both counts, but as an optional path, not a hard dependency.

**Why the relationship makes sense**
/bf-spec produces a structured document with exactly the fields bf-build needs:
- Props table → TypeScript interface
- Tokens Used table → sx prop token references
- Type Styles table → typography wiring
- Variants & States → component state logic
- Accessibility section → required ARIA props and keyboard behavior

A /bf-build invocation against a spec file can skip the Figma MCP calls entirely — all
necessary data is already extracted, mapped to correct token paths, and flagged. This
matters because Code Connect is absent and `get_design_context` is unreliable.

**Two intake paths for /bf-build**

Path A — Figma frame available:
```
get_variable_defs → get_design_context → [handle Code Connect] → read figma-reading-guide.md
→ extract props + tokens → generate TypeScript + React
```

Path B — Spec file available:
```
Read spec-[component].md → extract Props, Tokens Used, Type Styles, Accessibility
→ generate TypeScript + React
```

bf-build's intake gate should ask: "Do you have a Figma frame open, or a spec file for
this component?" and branch accordingly. It should not force a Figma MCP call when the
user already has a spec.

**Spec-to-code field mapping**

| Spec field | bf-build output |
|---|---|
| Props table | TypeScript `interface BluefishXxxProps` |
| Tokens Used | sx prop token paths (both dual-path forms) |
| Type Styles | `theme.typography` refs or sx typography |
| Variants & States | `useState` for interactive states, conditional sx |
| Accessibility | `aria-*` props, `role`, keyboard handler |
| Notes / architecture field | Wrapping pattern confirmation |

**Should /bf-build depend on /bf-spec?**
No hard dependency. /bf-build should work without a spec file — it can extract the same
data from Figma MCP directly. The spec-file path is an optimization, not a prerequisite.
This keeps Phase 4 (/bf-spec) and Phase 5 (/bf-build) independently executable.

---

## New Files Required

| File | Type | Notes |
|---|---|---|
| `~/.claude/skills/bf-spec/SKILL.md` | New skill | Phase 4 deliverable |
| `~/.claude/skills/bf-build/SKILL.md` | New skill | Phase 5 deliverable |

No new support files are required in `bluefish-design-system/`. All necessary context
(spec-template.md, figma-reading-guide.md, tokens.md, type-styles.md,
tokens-dataviz.md) is already present and authoritative.

---

## Modified Files

**`~/.claude/skills/bluefish-design-system/SKILL.md`**
Two small updates needed:

1. Update `description:` frontmatter. Currently ends with: "Activates for any question
   about the Bluefish design system that is not a specific explore, prototype, spec, or
   build task." The words "spec" and "build" are already present — this is forward-looking
   and requires no change.

2. The Code Output section already contains: "When generating a spec, read
   `spec-template.md` for output format." This is correct. No duplication needed.

3. Known Gaps section already documents the Code Connect situation. bf-spec will reference
   this but add its own workflow-level handling.

**Assessment:** Foundation SKILL.md needs no substantive edits for Phase 4 or 5.
The architecture anticipated these skills correctly.

**`~/.claude/skills/bluefish-design-system/spec-template.md`**
No changes needed. The Field Mapping table (from `get_design_context` response) is
complete and covers all bf-spec workflow needs. The fill-and-flag rules are correctly
specified.

**`~/.claude/skills/bf-explore/SKILL.md`, `~/.claude/skills/bf-prototype/SKILL.md`**
No changes. The anti-patterns section of bf-prototype already flags the collision risk:
"Trigger over-broadening on 'build' / 'implement' / 'create' — these phrases collide
with Phase 5 /bf-build." This is documented but not yet enforced by bf-build's
description field. When bf-build is created, verify that its trigger description does not
collide with bf-prototype's trigger anchors ("prototype", "working prototype").

---

## Suggested Build Order

**Phase 4: /bf-spec first. Phase 5: /bf-build second.**

Rationale:

1. **Spec output is bf-build's optional input.** Building bf-spec first lets Phase 5
   define and test the spec-file intake path in bf-build. If bf-build is built first,
   that path has to be retrofitted.

2. **Figma MCP complexity is higher in bf-spec.** bf-spec must handle the full
   component inventory workflow — multiple `get_design_context` calls per sub-component,
   composite component decomposition, the Code Connect interruption. Solving this first
   surfaces any Figma MCP edge cases before they affect bf-build.

3. **Token extraction is shared work.** bf-spec's token extraction logic (live
   `get_variable_defs` + tokens.md fallback + M3 mapping) is a superset of what bf-build
   needs. Building bf-spec first validates the extraction pattern.

4. **DATA-03 uncertainty affects both skills equally.** Building bf-build second means
   the token injection uncertainty is still unresolved — the dual-path output pattern
   handles this regardless of order. No ordering advantage here.

5. **Existing spec files are already reference implementations.** spec-button.md,
   spec-chip.md, spec-text-field.md, spec-autocomplete.md exist. bf-spec can validate
   against these on day one. bf-build has no equivalent reference corpus yet — building
   bf-spec first lets the team generate a few more component specs as bf-build inputs
   before Phase 5 starts.

**Within Phase 4, the suggested plan structure:**
- Plan 1: Create bf-spec SKILL.md with intake gate, Figma MCP workflow, Code Connect
  graceful degradation, spec-template.md output format, and screen-level vs.
  component-level scoping rules
- No additional plans needed — single-file deliverable, analogous to bf-explore and
  bf-prototype phases (each delivered in 1 plan)

---

## Code Connect Graceful Degradation

This is the central design challenge for /bf-spec. The foundation documents the gap but
leaves handling to command skills. bf-spec must define this explicitly.

**What happens without Code Connect**

When `get_design_context` is called on a frame that lacks Code Connect bindings, Figma
returns a prompt asking the user to set up Code Connect rather than returning component
data. This interrupts the spec workflow before any data is extracted.

bf-prototype handles this with a one-liner: note the interruption inline and continue
from conversation context. bf-spec cannot use the same lightweight recovery because it
depends on structural component data — there is no "conversation context" fallback for a
component inventory.

**Three-tier degradation model for bf-spec**

Tier 1 — Code Connect present (not current reality, but design for it):
`get_design_context` returns full component bindings. Full spec with all fields populated.
No manual flags needed beyond normal token gaps.

Tier 2 — Code Connect absent, Figma MCP returns partial data:
`get_design_context` triggers the Code Connect prompt but returns some frame/layer data
before it. Use whatever was returned. Call `get_variable_defs` separately — this call
is not Code Connect-gated and returns variable/token data reliably. Proceed with the
spec using available data. Flag every field that required Code Connect data:
`/* ⚠️ Code Connect not configured — [field] populated from layer structure only; verify with design */`

Tier 3 — Figma Desktop not open or MCP unavailable:
No frame data available. bf-spec must ask the user for the component name (the one
permitted clarifying question per spec-template.md). Then produce a skeletal spec with
all required fields present but populated with fill-and-flag placeholders. The skeletal
spec is a valid handoff artifact — it tells engineering exactly what is unknown.

**Specific behaviors to define in bf-spec SKILL.md**

- Explicitly call `get_variable_defs` before `get_design_context` — variable data is
  not Code Connect-gated and should always be attempted first.
- Do not abandon the spec if `get_design_context` triggers the Code Connect prompt.
  Extract whatever layer/component data appeared before the prompt.
- The component name clarifying question (from spec-template.md Field Mapping) remains
  the only permitted intake question — even in Tier 3, all other missing fields use
  fill-and-flag, not additional questions.
- Screen-level vs. component-level scoping: when the user points at a full screen,
  bf-spec should produce a component inventory (list of components present) plus
  individual specs for each identified component, rather than treating the screen as a
  single component. This is the most valuable output when Figma MCP is available.
  When MCP is unavailable, scope narrows to a single named component.
- `get_variable_defs` node-scope limitation (documented in foundation): state and
  interaction tokens may not appear if the selected frame is a static default state.
  Cross-reference tokens.md before flagging a token as missing — same rule as all
  other skills.

**What /bf-spec should NOT do**

- Block output waiting for Code Connect to be configured. It is an engineering dependency
  out of scope for the skill.
- Ask follow-up questions when design context is missing. Use fill-and-flag per
  spec-template.md.
- Require a spec file as input to operate — that is bf-build's optional path, not a
  bf-spec constraint.
