# Phase 4: /bf-spec - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-11
**Phase:** 4-bf-spec
**Areas discussed:** Invocation scope + output structure, Intake gate + Figma first rule, get_design_context vs. get_context_for_code_connect, Composite component recursion depth

---

## Invocation Scope + Output Structure

### Q1: What does /bf-spec target?

| Option | Description | Selected |
|--------|-------------|----------|
| A whole screen | One doc with inventory + per-component sections | |
| A single component | One spec file per component like spec-button.md | |
| Either — skill infers from selection | Screen frame → screen mode; component instance → component mode | ✓ |

**User's choice:** Either — skill infers from what's selected

---

### Q2: Screen mode output format

| Option | Description | Selected |
|--------|-------------|----------|
| One file with inventory header + all specs inline | Single `spec-[screen-name].md`, inventory table up top, component sections below | ✓ |
| One inventory file + separate component files | `spec-[screen]-inventory.md` + individual `spec-[component].md` files | |
| You decide | Claude judges based on get_design_context response | |

**User's choice:** One file: inventory header + all component specs inline

---

### Q3: Component mode output

| Option | Description | Selected |
|--------|-------------|----------|
| One spec file: spec-[component-name].md | Matches existing spec-button.md pattern | ✓ |
| Spec output in chat only, no file saved | User saves manually | |

**User's choice:** One spec file: spec-[component-name].md

---

### Q4: Where spec files are saved

| Option | Description | Selected |
|--------|-------------|----------|
| ~/.claude/skills/bluefish-design-system/ | Co-located with foundation support files | |
| Current working directory (./) | Saved next to the code being implemented | ✓ |
| You decide based on context | Claude infers from working directory | |

**User's choice:** Current working directory (./) of the project

---

## Intake Gate + Figma First Rule

### Q1: Bare-invoke behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Ask "What screen or component are you speccing?" | Single clarifying question | ✓ |
| Attempt Figma MCP immediately, ask only if needed | Fire MCP first, then ask if nothing found | |

**User's choice:** Ask "What screen or component are you speccing?"

---

### Q2: Always attempt MCP first?

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — always attempt MCP first | Even when context is provided. Matches bf-prototype pattern. | ✓ |
| Only when Figma context is indicated | More forgiving for offline use | |

**User's choice:** Yes — always attempt MCP first

---

### Q3: Conversation-only fallback

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — flag with ⚠️ and continue | Same graceful degradation as bf-prototype | ✓ |
| No — require Figma to be open | Partial spec isn't useful enough | |

**User's choice:** Yes — flag everything with ⚠️ and continue

---

## get_design_context vs. get_context_for_code_connect

### Q1: Primary component deep-dive tool

| Option | Description | Selected |
|--------|-------------|----------|
| Stick with get_design_context | ROADMAP sequence stands, proven across prior skills | ✓ |
| Use get_context_for_code_connect instead | Code Connect-ready output, only if verified | |

**User's choice:** No — stick with get_design_context as primary

---

### Q2: get_metadata role

| Option | Description | Selected |
|--------|-------------|----------|
| Screen/frame identity — name, page, frame ID | Confirms what's selected before proceeding | |
| Try it first and see what it returns | Document field mapping in the skill | ✓ |
| Redundant — skip it | get_design_context returns identity info | |

**User's choice:** I'm not sure — try it first and see what it returns

---

### Q3: Screen mode MCP sequence

| Option | Description | Selected |
|--------|-------------|----------|
| get_metadata once + get_variable_defs once → get_design_context per component | Token data shared across all components | ✓ |
| Full sequence per component | Re-fetch token data for each component | |
| You decide | Claude optimizes based on actual call returns | |

**User's choice:** get_metadata once + get_variable_defs once, then get_design_context per component

---

## Composite Component Recursion Depth

### Q1: Stopping rule

| Option | Description | Selected |
|--------|-------------|----------|
| Only named Bluefish components (figma-reading-guide.md Step 3) | Known component → recurse; custom layout → atomic | ✓ |
| One level deep — immediate children of screen frame | Simple, predictable | |
| You decide — go as deep as needed | Claude uses judgment | |

**User's choice:** Only named Bluefish components (those in figma-reading-guide.md Step 3)

---

### Q2: Sub-component spec placement

| Option | Description | Selected |
|--------|-------------|----------|
| Inline as ### Sub-component: [Name] | Nested under parent section | ✓ |
| Separate ## section in same doc | Flat structure at same level as parent | |
| Cross-reference to existing spec file if one exists | Avoid regenerating what already exists | |

**User's choice:** Inline in the parent component's spec section

---

### Q3: Code Connect on sub-components

| Option | Description | Selected |
|--------|-------------|----------|
| Same rule as top-level: ⚠️ flag and continue | Consistent fallback behavior | ✓ |
| Skip the sub-component's spec section entirely | Note in parent's Notes section | |

**User's choice:** Same rule as top-level: ⚠️ flag and continue

---

## Claude's Discretion

- `get_metadata` field mapping — skill author determines how each response field maps to spec output when writing the skill
- Component Inventory table column structure — Claude determines based on what `get_design_context` reliably returns
- Token compliance pre-return checklist — run internally before returning output, no user-visible step

## Deferred Ideas

None — discussion stayed within phase scope.
