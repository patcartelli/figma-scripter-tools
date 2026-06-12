# Phase 5: bf-build - Context

**Gathered:** 2026-06-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Create `~/dev/bluefish-ai-skills/bf-build/SKILL.md` (symlinked to `~/.claude/skills/bf-build/`) — a production React/MUI component generator. When invoked, the skill produces a TypeScript React component file (`.tsx`) written to the current working directory. Two intake paths: Path A (Figma frame + MCP) and Path B (existing `spec-[component].md` file). Inherits foundation context via `@include`. Does not produce prototypes, specs, or Storybook stories — that is other phases.

</domain>

<decisions>
## Implementation Decisions

### React Version + forwardRef Rule
- **D-01:** Target React 19. `forwardRef` is not required — refs work as regular props in React 19. Do not mandate `React.forwardRef()` wrappers unless a component explicitly needs ref forwarding for a specific API reason. The Vite scaffold template (`react-ts`) now ships React 19 by default; this is the team's target.

### Path Detection (Intake)
- **D-02:** MCP-first — always attempt `get_variable_defs` + `get_design_context` first (Path A). If MCP returns nothing and a spec file is referenced in the user's message, switch to Path B. Mirrors bf-prototype's Figma-context pattern. User is never asked to choose a path explicitly.
- **D-03:** MCP sequence for Path A: `get_variable_defs` + `get_design_context` per the ROADMAP success criterion 2. No `get_metadata` step in bf-build (unlike bf-spec which needs frame identity for filename derivation — bf-build derives its output filename from the component name, not the frame name).

### Path B — Spec File Parsing
- **D-04:** Sub-component spec format is confirmed reliable (per handoff): H2 component heading → `### Variants & States / Props / Tokens Used / Type Styles / Accessibility / Figma Reference` order, with `### Sub-component: [Name]` subsections. Path B parser can rely on this structure.
- **D-05:** Cross-referenced specs (e.g., `spec-autocomplete.md` cites `spec-text-field.md` in sub-component notes): **auto-read** the referenced spec file before generating the sub-component code. No user prompt. Produces complete output for composite components.
- **D-06:** Screen-level spec input (Component Inventory + multiple H2 component sections): present the inventory and ask "Which component should I build?" One `.tsx` file per invocation. Clean, focused; matches the "one spec in, one component out" mental model.

### Output Shape
- **D-07:** Single `.tsx` component file written to `./` (current working directory). Filename: `Bluefish[ComponentName].tsx` (PascalCase, `Bluefish` prefix). Contents: TypeScript interface extending the relevant MUI props, the named wrapper component, all token annotations inline, required ARIA props.
- **D-08:** No Vite scaffold, no Storybook story stub, no `App.tsx` wrapper in output — component file only. This is production code, not a runnable prototype.

### Token + Code Output (Binding from Handoff)
- **D-09:** Dataviz token format: `color-roles/dataviz/[NN]/[property]` from `tokens.md`. `tokens-dataviz.md` is the raw source palette (`palette/dataviz/dv/*`) for gradients/tints only — do not use it for standard chart series tokens.
- **D-10:** Typography annotation format: `/* type: H1 */` inline. Top-level style names only — no `/`-nested paths (e.g., `/* type: Body1 */`, never `/* type: Typography/Heading/Large */`).
- **D-11:** DATA-03 stays dual-path. Both MUI theme extension form (`theme.palette.primary.main`) AND CSS custom property form (`var(--color-roles-primary-main)`) in output, flagged with `/* ⚠️ token injection method unconfirmed — verify with eng */`. (DATA-03 label is internal to `.planning/` — strip from team-facing skill text.)
- **D-12:** MCP-unavailable diagnostic phrasing: "tokens from cached Bluefish reference (tokens.md, type-styles.md, tokens-dataviz.md)" — no install paths embedded.

### Build-Request Routing Reclaim (Concrete Task)
- **D-13:** Phase 5 must reclaim build/implement request routing from the interim state. Concrete updates required (these are plan tasks, not discussion gray areas):
  - Update all four command skill `description:` fields to remove "bf-build — planned, not yet available"
  - Remove foundation `description:` clause "including build and implementation requests until the dedicated bf-build skill ships"
  - Remove foundation Known Gaps entry about bf-build being planned
  - Update `~/dev/bluefish-ai-skills/README.md` to reflect bf-build as shipped

### Carried Forward from Prior Phases
- **@include pattern:** `@~/.claude/skills/bluefish-design-system/SKILL.md` immediately after frontmatter closing `---`, with the fallback blockquote (Phase 1 + portability pass).
- **On-demand support reads:** `tokens.md`, `type-styles.md`, `tokens-dataviz.md`, `figma-reading-guide.md` are NOT @included upfront — read only when needed (Phase 1).
- **`get_variable_defs` precedence:** Live Figma values take precedence over `tokens.md` for color and scale tokens (Phase 3).
- **Code Connect graceful fallback:** If `get_design_context` triggers a Code Connect prompt, flag inline with `⚠️ Code Connect not configured — proceeding from conversation context` and continue (locked in STATE.md).
- **Token drift flagging:** If live Figma value differs from `tokens.md`, use the live value and flag drift inline.
- **MUI wrapping pattern:** Named custom component wrapping MUI internally (e.g., `BluefishButton` wraps `Button`). Do not use raw MUI components unwrapped.
- **`import type {}` for MUI type exports:** Vite throws a runtime SyntaxError otherwise.
- **8-point pre-return checklist from foundation:** Apply before returning any code output (items 1–8 including screenshot comparison when applicable).

### Claude's Discretion
- TypeScript interface structure: extend the most appropriate MUI props type (e.g., `interface BluefishButtonProps extends ButtonProps`) — Claude determines the exact base type per component during implementation.
- MCP sequence depth for composite components (Path A): Claude determines when a sub-component warrants its own `get_design_context` call vs. being handled from the parent frame data.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Foundation Skill (inherited via @include)
- `~/.claude/skills/bluefish-design-system/SKILL.md` — token rules, accessibility standards, Figma MCP setup, component map, code output standards, DATA-03 dual-path pattern, 8-point pre-return checklist. MUST read before authoring any code output rules.
- `~/.claude/skills/bluefish-design-system/tokens.md` — full token reference including `color-roles/dataviz/*` table. Read on-demand.
- `~/.claude/skills/bluefish-design-system/type-styles.md` — typography tokens. Read on-demand.
- `~/.claude/skills/bluefish-design-system/figma-reading-guide.md` — MUI component inference (Step 3), M3 mapping, component naming rules.

### Prior Phase Analogs (structural reference)
- `~/.claude/skills/bf-spec/SKILL.md` — most recent direct analog: @include pattern, on-demand support reads, MCP sequence structure, Code Connect fallback, fallback diagnostic. Adapt the Figma Context section for bf-build's MCP sequence (`get_variable_defs` + `get_design_context` only — no `get_metadata`).
- `~/.claude/skills/bf-prototype/SKILL.md` — Vite+MUI code output patterns (MUI wrapping, `import type {}`, DM Sans, CssBaseline, token annotation inline style); useful for code output rules section. Also reference for MCP-unavailable diagnostic phrasing.

### Reference Spec Examples (Path B input quality bar)
- `~/.claude/skills/bluefish-design-system/spec-button.md` — canonical component spec; defines the H2/H3 structure Path B parses.
- `~/.claude/skills/bluefish-design-system/spec-autocomplete.md` — composite component with `### Sub-component` sections and cross-references to other spec files; use to validate Path B cross-spec auto-read behavior.
- `~/.claude/skills/bluefish-design-system/spec-template.md` — field mapping table (spec field → `get_design_context` source); useful for mapping Path A MCP output to output fields.

### Skill Repo (File Layout)
- `~/dev/bluefish-ai-skills/` — canonical source. Phase 5 must create `bf-build/` here and symlink to `~/.claude/skills/bf-build/`. See handoff D-layout note.
- `~/dev/bluefish-ai-skills/README.md` — must be updated when bf-build ships (routing reclaim task, D-13).

### Requirements Traceability
- `.planning/REQUIREMENTS.md` — BUILD-01, BUILD-02; acceptance criteria for this phase.
- `.planning/ROADMAP.md` — Phase 5 scope, success criteria (Path A and Path B), pre-work note (verify React version — resolved: React 19).
- `.planning/phases/05-bf-build/05-HANDOFF.md` — post-Phase-4 context: file layout change, review-pass binding decisions, open question status. MUST read before planning.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `~/.claude/skills/bf-spec/SKILL.md` — copy frontmatter structure, @include line, fallback blockquote, Support Files section, Figma Context section (MCP sequence + Code Connect fallback + fallback + MCP-unavailable diagnostic). Adapt Figma Context for bf-build's MCP sequence (no `get_metadata`; use component name for filename).
- `~/.claude/skills/bf-prototype/SKILL.md` — copy Vite+MUI code output rules: MUI wrapping pattern, `import type {}` rule, DM Sans loading, CssBaseline, token annotation inline CSS comment style, pre-return checklist reference, anti-patterns section structure.
- `~/.claude/skills/bluefish-design-system/spec-autocomplete.md` — reference for auto-read cross-spec behavior; shows what sub-component notes and cross-references look like in practice.

### Established Patterns
- **@include + on-demand read pattern:** Foundation inherited via @include; support files listed in "Support Files — Read On Demand" section. All prior command skills follow this — bf-build must too.
- **Always-attempt-MCP-first:** Figma MCP calls attempted before generating, even when context is provided. Fallback to spec file (Path B) when MCP unavailable.
- **⚠️ flagging vocabulary:** `⚠️ Code Connect not configured`, `⚠️ live token data unavailable`, `⚠️ no token for [value] — needs token`, `⚠️ token drift`, `⚠️ token injection method unconfirmed — verify with eng` — reuse exact phrasing from foundation and prior skills.
- **Portability pass (2026-06-12):** Internal planning IDs (D-xx, BUILD-xx, DATA-xx) are stripped from team-facing skill text — keep only in `.planning/` docs. Line-number references → heading references. Foundation include fallback blockquote included in all command skills.

### Integration Points
- New skill at: `~/dev/bluefish-ai-skills/bf-build/SKILL.md` — new directory inside the skill repo, symlinked to `~/.claude/skills/bf-build/`
- Foundation at: `~/.claude/skills/bluefish-design-system/SKILL.md` — referenced via @include; must be updated for routing reclaim (D-13) as part of this phase
- All four command skill `description:` fields must be updated (D-13) — `bf-explore`, `bf-prototype`, `bf-spec`, `bluefish-design-system`
- Path B reads spec files in the user's `./` (project working directory), not in `~/.claude/skills/`

</code_context>

<specifics>
## Specific Ideas

- Output filename convention: `Bluefish[ComponentName].tsx` — PascalCase, `Bluefish` prefix (consistent with the MUI wrapping pattern naming in the foundation)
- Path A MCP sequence: `get_variable_defs` + `get_design_context` — no `get_metadata` (component name for filename comes from component name in conversation or `get_design_context` response, not frame name)
- Cross-spec auto-read: when a Path B spec notes "see spec-text-field.md", read that file silently before generating the sub-component — same pattern as spec-autocomplete's relationship to spec-text-field
- Screen-level spec intake question (when Component Inventory is detected): "Which component should I build?" — present the Component Inventory table as context, let user name one
- React 19 confirmed: do not write `React.forwardRef()` wrappers unless the component explicitly needs ref forwarding for a specific API contract

</specifics>

<deferred>
## Deferred Ideas

- Storybook story stub output — could be a bf-build option or a separate `/bf-story` skill in v2
- Multi-component batch output from screen-level spec (build all at once) — deferred; one component per invocation is the v1 model
- `get_context_for_code_connect` vs `get_design_context` for Path A — Code Connect still unconfigured; degrade-gracefully decision stands; no action in Phase 5

</deferred>

---

*Phase: 05-bf-build*
*Context gathered: 2026-06-12*
