# Phase 4: /bf-spec - Context

**Gathered:** 2026-06-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Create `~/.claude/skills/bf-spec/SKILL.md` — a Figma → engineering handoff doc generator. When invoked, the skill reads a screen or component via the three-tool Figma MCP sequence (`get_metadata` → `get_variable_defs` → `get_design_context` per component) and produces a structured spec document using `spec-template.md` as the output format. Two sub-paths: screen mode (component inventory + per-component sections in one file) and component mode (single component spec file). Does not produce prototype or production code — that is Phase 5.

</domain>

<decisions>
## Implementation Decisions

### Invocation Scope + Output Structure
- **D-01:** Skill infers scope from Figma selection: screen frame selected → screen mode; component instance selected → component mode. One skill, two sub-paths (not two separate intake questions).
- **D-02:** Screen mode output: one file `spec-[screen-name].md` saved in the current working directory. Structure: `## Component Inventory` table at the top (list of all components found), then each component spec as a `## [Component Name]` section below it using `spec-template.md` format. All in one doc per invocation.
- **D-03:** Component mode output: one file `spec-[component-name].md` saved in the current working directory. Matches the existing `spec-button.md` / `spec-chip.md` pattern exactly. Phase 5 `/bf-build` Path B reads this file directly.
- **D-04:** Spec files saved in the current working directory (`./`) of the project — not in `~/.claude/skills/bluefish-design-system/`. The existing `spec-button.md` files in the foundation are reference examples; user-generated specs land in the project.

### Intake Gate + Figma First Rule
- **D-05:** When bare-invoked (`/bf-spec` with no context), ask exactly one clarifying question: "What screen or component are you speccing?" — then proceed to the MCP sequence.
- **D-06:** Always attempt Figma MCP first — even when context is provided in the invocation message. `get_variable_defs` + `get_metadata` + `get_design_context` are always tried before generating. Same pattern as `/bf-prototype`.
- **D-07:** Conversation-only fallback is allowed. If MCP returns nothing, flag all token values with `⚠️`, emit MCP-unavailable diagnostic, and produce a partial spec. Output is never blocked by missing Figma data.

### MCP Sequence
- **D-08:** Use `get_design_context` (not `get_context_for_code_connect`) as the primary per-component deep-dive tool. The ROADMAP sequence stands: `get_metadata` → `get_variable_defs` → `get_design_context`.
- **D-09:** `get_metadata` role is not fully known before implementation — call it first at the start of every invocation, use what it returns for screen/frame identity (name, page, frame context), and document in the skill what each response field maps to.
- **D-10:** Screen mode MCP pattern: `get_metadata` once + `get_variable_defs` once for the screen → then `get_design_context` per component found. Token data from `get_variable_defs` is shared across all components in the screen (not re-fetched per component).

### Composite Component Recursion
- **D-11:** Recurse into sub-components only when they map to a named Bluefish/MUI component from `figma-reading-guide.md` Step 3 (Button, TextField, Chip, Select, Autocomplete, etc.). Custom layout containers and unnamed sub-layouts are treated as atomic and noted with `⚠️ custom layout — no Bluefish component match`.
- **D-12:** Sub-component specs are inlined under the parent component's section as `### Sub-component: [Name]` subsections — not hoisted to top-level `##` sections. Keeps each component spec self-contained.
- **D-13:** If Code Connect interrupts a sub-component's `get_design_context` call: same rule as top-level — `⚠️ Code Connect not configured for [sub-component] — proceeding from conversation context` and continue. Never block output.

### Carried Forward from Prior Phases
- **@include pattern:** `@~/.claude/skills/bluefish-design-system/SKILL.md` immediately after frontmatter closing `---` (Phase 1 D-01).
- **On-demand support reads:** `tokens.md`, `type-styles.md`, `tokens-dataviz.md`, `figma-reading-guide.md` are NOT @included upfront — read only when needed (Phase 1 D-02).
- **`get_variable_defs` precedence:** Live Figma values from `get_variable_defs` take precedence over `tokens.md` for all token paths (Phase 3).
- **Code Connect graceful fallback:** If `get_design_context` triggers a Code Connect prompt, flag inline with `⚠️ Code Connect not configured — proceeding from conversation context` and continue (locked in STATE.md, Phase 3).
- **Token drift flagging:** If live Figma value differs from `tokens.md`, use the live value and flag the drift inline (Phase 3).

### Claude's Discretion
- `get_metadata` field mapping: skill author determines how each response field maps to spec output (frame name → output filename, page name → Figma Reference section, etc.) when writing the skill.
- Component Inventory table format in screen mode: Claude determines column structure based on what `get_design_context` reliably returns (likely: Component Name, Category, MUI Equivalent, Section).
- Token compliance pre-return checklist: Claude runs the foundation's 8-point checklist internally before returning spec output.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Foundation Skill (inherited via @include)
- `~/.claude/skills/bluefish-design-system/SKILL.md` — token rules, accessibility standards, Figma MCP setup, component map, code output standards, DATA-03 dual-path pattern
- `~/.claude/skills/bluefish-design-system/spec-template.md` — the output format for every component spec section. Field mapping table (from `get_design_context` → spec fields) is in this file. MUST read before planning.
- `~/.claude/skills/bluefish-design-system/figma-reading-guide.md` — MUI component inference (Step 3), M3 mapping, component naming rules. Defines which sub-components trigger recursion (D-11).
- `~/.claude/skills/bluefish-design-system/tokens.md` — full token reference; read on-demand
- `~/.claude/skills/bluefish-design-system/type-styles.md` — typography tokens; read on-demand

### Reference Spec Examples (output quality bar)
- `~/.claude/skills/bluefish-design-system/spec-button.md` — complete per-component spec example; this is the quality bar for component mode output
- `~/.claude/skills/bluefish-design-system/spec-chip.md` — second spec example
- `~/.claude/skills/bluefish-design-system/spec-text-field.md` — form control example
- `~/.claude/skills/bluefish-design-system/spec-autocomplete.md` — composite component example

### Prior Phase Analog
- `~/.claude/skills/bf-prototype/SKILL.md` — direct structural analog: @include pattern, Support Files section, Figma Context section with always-attempt-MCP-first rule, MCP-unavailable diagnostic, Code Connect graceful fallback, anti-patterns section structure
- `~/.claude/skills/bf-explore/SKILL.md` — secondary structural analog

### Requirements Traceability
- `.planning/REQUIREMENTS.md` — SPEC-01, SPEC-02; acceptance criteria for this phase
- `.planning/ROADMAP.md` — Phase 4 scope, success criteria, pre-work note (update foundation description to exclude "spec" trigger before testing)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `~/.claude/skills/bf-prototype/SKILL.md` — copy the frontmatter structure, @include line, Support Files section, Figma Context section (including MCP-unavailable diagnostic pattern), Code Connect fallback rule, and Anti-Patterns section. Adapt Figma Context section for the spec sequence (get_metadata + get_variable_defs + get_design_context per component).
- `~/.claude/skills/bluefish-design-system/spec-template.md` — the Field Mapping table (spec field → `get_design_context` source) is directly usable as the skill's per-component output rules. No redesign needed.
- `spec-button.md`, `spec-chip.md`, `spec-text-field.md`, `spec-autocomplete.md` — concrete examples that show exactly what a correct per-component section looks like.

### Established Patterns
- **@include + on-demand read pattern:** Foundation inherited via @include; support files listed in a "Support Files — Read On Demand" section. All prior command skills follow this.
- **Always-attempt-MCP-first:** Figma MCP calls attempted before generating, even when context is provided. Fallback to conversation context when MCP unavailable.
- **⚠️ flagging vocabulary:** `⚠️ Code Connect not configured`, `⚠️ live token data unavailable`, `⚠️ no token for [value]`, `⚠️ token drift` — reuse exact phrasing from foundation and prior skills for consistency.

### Integration Points
- New skill at: `~/.claude/skills/bf-spec/SKILL.md` — new directory, no existing files
- Foundation at: `~/.claude/skills/bluefish-design-system/SKILL.md` — referenced via @include; NOT modified in this phase (except description update per ROADMAP pre-work)
- Phase 5 `/bf-build` reads component mode output (`spec-[component-name].md`) as Path B — file format must match what Phase 5 expects

</code_context>

<specifics>
## Specific Ideas

- Screen mode output filename: `spec-[screen-name].md` — screen name comes from `get_metadata` response (frame name or what user specified when bare-invoked)
- Component mode output filename: `spec-[component-name].md` — component name from `get_design_context` response Step 1 (master component name per `figma-reading-guide.md`)
- Component Inventory section (screen mode only): a table at the top of the doc listing all components found before the per-component spec sections
- Sub-component spec heading format: `### Sub-component: [Name]` nested inside the parent `## [Component Name]` section
- ROADMAP pre-work: before Phase 4 testing, update `bluefish-design-system` `description:` frontmatter to exclude "spec" and "build" as triggers (to avoid collision when `/bf-spec` is live)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 4-bf-spec*
*Context gathered: 2026-06-11*
