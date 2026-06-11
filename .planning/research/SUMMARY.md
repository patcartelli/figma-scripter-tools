# Research Summary — v1.1 Specifications

**Synthesized:** 2026-06-11
**Sources:** STACK.md, FEATURES.md, ARCHITECTURE.md, PITFALLS.md

---

## TL;DR

- **Code Connect is not a blocker.** The Figma MCP provides sufficient data for `/bf-spec` without it (`get_metadata` + `get_variable_defs` + `get_design_context`). Code Connect enriches output when configured; the skill must degrade gracefully when it is not.
- **Tool call order is a hard constraint for `/bf-spec`:** `get_metadata` → `get_variable_defs` → `get_design_context` (per sub-component). Reversing this causes truncation and missed components.
- **`/bf-build` needs zero new dependencies.** It is a pure reasoning skill that extends the Vite + React 18 + MUI v5 + TypeScript 5 stack from `/bf-prototype`. DATA-03 dual-path output is still required.
- **Phase 4 before Phase 5 is the correct build order.** The spec output is the optional input for the build skill, and Figma MCP complexity is higher in `/bf-spec` — surface edge cases there before they affect `/bf-build`.
- **Foundation SKILL.md needs no edits.** The architecture already anticipated both skills. Two new files only: `bf-spec/SKILL.md` and `bf-build/SKILL.md`.

---

## Stack Additions

### What's actually new in v1.1

**Figma MCP tool sequence (new for `/bf-spec`)**
The correct three-tool sequence, in order:
1. `get_metadata` — full frame inventory (layer IDs, names, types); lightweight, won't truncate
2. `get_variable_defs` — live token values (color, spacing, radius); not Code Connect-gated
3. `get_design_context` — layout, variants, annotations; call per sub-component to avoid truncation

Additional tool: `get_context_for_code_connect` is available without Code Connect configured and returns richer component metadata (property definitions, variant trees) than `get_design_context` alone. Use it for component deep-dives.

**Code Connect answer**
Code Connect is an engineering repo-level setup, not a skill dependency. Build `/bf-spec` for the "no Code Connect" path as primary. When `get_design_context` triggers a Code Connect prompt, detect it (presence of strings like "figma connect publish", "Code Connect", "set up") and emit `⚠️ Code Connect not configured — component names inferred from layer structure` then continue. Never block. When Code Connect is eventually configured by engineering, the skill picks up the enriched output automatically — no skill changes required.

**`/bf-build` dependencies**
No new libraries, no new MCP tools, no Code Connect requirement. Output pattern: `ComponentName/ComponentName.tsx` + `ComponentName.types.ts` + `index.ts`. DATA-03 dual-path with `⚠️` annotation carries over from `/bf-prototype`. No Storybook stories, no unit tests — those are v2.

---

## Feature Table Stakes

### /bf-spec

Every spec output must include all of the following; missing any one makes the doc unusable for engineering.

| Feature | Why Required |
|---------|-------------|
| Component inventory — all components in frame | Engineers can't build what they don't know exists |
| All variants AND interaction states per component | Happy-path-only is the most common handoff failure |
| Token table with full `color-roles/` and `scale/` paths | Prevents hardcoding; engineers can't look up tokens without this |
| Type style table per component | Typography is the second most hardcoded value after color |
| Accessibility section (role, label, keyboard, contrast) | Non-negotiable WCAG AA; never inferrable from design — always requires authoring |
| Prop table with type, current value, AND all available values | Engineers need the full enum, not just the state shown |
| Status field (default: Needs Review) | Engineers can't tell if the spec is stable enough to build against |
| Figma master component name (not layer name) | Layer names are auto-generated and unstable |
| `⚠️` gap flags for every unresolved value | Unresolved must be visible, not silent |

### /bf-build

Every production component output must include all of the following without exception.

| Feature | Why Required |
|---------|-------------|
| Named custom component wrapping MUI (`<BluefishX>`) | Raw MUI with inline sx overrides is not team-acceptable output |
| TypeScript prop interface (explicit `interface`, no `any`) | Missing prop types cause type errors at integration time |
| Full `color-roles/` token paths for all color values | Zero hex values — invariant from foundation |
| Full `scale/` token paths for all spacing/radius | Zero px literals — invariant from foundation |
| Top-level type styles only (no `web/` prefix) | Established foundation rule |
| DATA-03 dual-path output with `⚠️` flag per sx token reference | Token injection method unconfirmed — both MUI theme form and CSS custom property form required |
| ARIA props on all interactive elements | Non-negotiable accessibility |
| `import type` for all MUI type-only exports | Missing this is a Vite build-time SyntaxError |
| `⚠️` flags for all known gaps (elevation, dark mode failures, DV series) | Production code with silent gaps ships broken behavior |
| Visual comparison via `get_screenshot` before declaring complete | Component can't be complete if it doesn't match Figma source |
| `displayName` assignment on the custom component | Zero-cost; expected in production React |

---

## Feature Differentiators

### /bf-spec

**Most valuable:** Interaction notes written for code, not for design review. "Click → emits `onSelect(id: string)` to parent" is what engineers need; "button highlights when pressed" is not. Generic spec tools generate redlines. `/bf-spec` generates implementation guidance.

Additional differentiators:
- Conditional display rules (only visible when user has admin role; shows after count > 10) — these don't exist in Figma and must be authored from context
- Edge case inventory: empty, loading, error, truncation at max character count — distinct from variants
- Screen-level inventory that surfaces cross-component dependencies a per-component spec misses
- Explicit MUI component mapping per inventory item ("MUI `<Button>` variant='contained' color='primary'", not "a button")
- M3 → `color-roles` mapping: engineers never see M3 variable names in spec output
- Token drift callout: when live `get_variable_defs` differs from `tokens.md`, the discrepancy is surfaced before build
- Known-gap callout section at screen level (not buried in inline flags)

### /bf-build

**Most valuable:** Props that extend MUI's own interface (`interface BluefishButtonProps extends ButtonProps`). An engineer receiving this can see the full API contract and knows the wrapper is a proper superset of MUI — not a leaky wrapper that needs rewriting on first use.

Additional differentiators:
- `React.forwardRef` on components used in Tooltip/Popper/transition containers (breaks silently without it)
- `sx` prop passthrough (`sx?: SxProps<Theme>` in interface, spread to underlying MUI component)
- Documented token override points: comment showing where theme-level overrides go when DATA-03 resolves
- Explicit empty/loading/error state props when Figma spec called for these states
- Storybook-ready prop structure (named values, not config objects) — zero Storybook dependency required

---

## Architecture Decision: Build Order

**Phase 4 = /bf-spec. Phase 5 = /bf-build.**

This order is correct for five independent reasons:

1. **Spec is bf-build's optional input.** Building `/bf-spec` first lets Phase 5 define and test the spec-file intake path. If `/bf-build` is built first, that path must be retrofitted.

2. **Figma MCP complexity is higher in `/bf-spec`.** Multi-tool sequence, Code Connect interrupt handling, composite component decomposition, screen-level vs. component-level scoping — all solved in Phase 4 before they affect Phase 5.

3. **Token extraction work is shared.** The `get_variable_defs` + `tokens.md` fallback + M3 mapping logic is a superset of what `/bf-build` needs. Validating it in Phase 4 means Phase 5 inherits a tested pattern.

4. **Existing spec files are reference implementations.** `spec-button.md`, `spec-chip.md`, `spec-text-field.md`, `spec-autocomplete.md` already exist. `/bf-spec` can validate against them on day one. Building `/bf-spec` first also generates additional specs as Phase 5 inputs before the build skill is needed.

5. **Each phase is one file.** Both skills deliver a single `SKILL.md`. No plan subdivision required — each phase maps to one plan.

**Intake paths for `/bf-build` (both must be supported):**
- Path A: Figma frame open → `get_variable_defs` → `get_design_context` → TypeScript + React
- Path B: Spec file available → read `spec-[component].md` → TypeScript + React

Neither path is a prerequisite for the other. Phase 4 and Phase 5 are independently executable.

---

## Watch Out For

Ranked by probability × impact:

**1. Code Connect prompt interrupt (HIGH × HIGH — /bf-spec)**
`get_design_context` returns an instructional prompt instead of component data when Code Connect is unconfigured. Spec generation stalls with no output if the skill does not detect and bypass it. Mitigation: detect by string match ("figma connect publish", "Code Connect", "set up"), emit the `⚠️` flag, continue with `figma-reading-guide.md` inference.

**2. DATA-03 dual-path dropped mid-file (HIGH × HIGH — /bf-build)**
The dual-path `⚠️` requirement applies to every token reference in sx props. Generated code consistently applies it to the first few references then silently drops it. Mitigation: pre-return checklist must grep for at least one `⚠️ token injection method unconfirmed` comment — if zero appear, the file must be corrected before return.

**3. Single-state spec from default-state selection (HIGH × MEDIUM — /bf-spec)**
The selected Figma frame is a static snapshot of the default state. Interaction tokens will not appear in `get_variable_defs`. Mitigation: explicit all-states requirement in the skill workflow — enumerate all states from the component set, not just the selected frame. Cross-reference `tokens.md` before flagging any token as absent.

**4. MUI type-only exports imported as values (MEDIUM × HIGH — /bf-build)**
`SelectChangeEvent`, `SelectProps`, `SxProps`, `AutocompleteChangeReason`, `ButtonProps` imported as values produce a Vite runtime SyntaxError at build time only. Mitigation: name these specific exports in the pre-return checklist — a general "check type imports" rule is not actionable enough.

**5. Skill trigger collision between /bf-prototype and /bf-build (MEDIUM × MEDIUM — integration)**
`/bf-prototype` documents that "build", "implement", "create" collide with `/bf-build`. This must be reciprocal. The `bluefish-design-system` foundation skill description exclusions must also be updated to include "spec" and "build" before the new skills are published. Mitigation: front-load trigger conditions and exclusions in the first 250 characters of both new skill descriptions; update foundation description in Phase 4.

---

## Open Questions

Items Phase 4 planning must resolve before writing `bf-spec/SKILL.md`:

1. **Screen-level scoping output format.** When invoked on a full screen, should `/bf-spec` produce one document with a component inventory header plus per-component spec sections, or multiple separate spec files? Architecture research recommends the former, but `spec-template.md` implications need confirmation.

2. **`get_context_for_code_connect` placement in the workflow.** This tool returns richer component metadata than `get_design_context` for individual component calls and works without Code Connect. Phase 4 planning must decide whether it replaces or supplements `get_design_context` for component deep-dives.

3. **Composite component recursion stopping rule.** Per-sub-component `get_design_context` calls are required for composites. The skill needs an explicit rule for how deep recursion goes before a sub-component becomes its own separate `/bf-spec` invocation.

4. **Foundation description update timing.** The `bluefish-design-system` foundation description must exclude "spec" and "build" before Phase 4 testing begins — otherwise the foundation intercepts test invocations. This is a one-line change that must happen at the start of Phase 4, not Phase 5.

5. **React version in Vite scaffold (Phase 5 blocker).** `React.forwardRef` is optional in React 19 but required in React 18. The scaffold's React version is unconfirmed. Phase 5 planning must verify this before authoring the build skill.

---

## Confidence Assessment

| Area | Confidence | Basis |
|------|-----------|-------|
| Figma MCP tool behavior | HIGH | Official Figma developer docs |
| Code Connect interrupt behavior | HIGH | Official docs + confirmed forum reports |
| `/bf-build` stack (no new deps) | HIGH | Direct extension of validated `/bf-prototype` stack |
| Token compliance rules | HIGH | Drawn from existing, working foundation SKILL.md |
| `get_design_context` framework param behavior | HIGH | Confirmed by Figma forum bug report |
| Code Connect enrichment path | MEDIUM | Documented in official docs; untested against live Bluefish library |
| `get_context_for_code_connect` without Code Connect | MEDIUM | Behavior confirmed in docs; not tested on Bluefish frames |
| React version in Vite scaffold | LOW | Not confirmed in research — must be verified before Phase 5 |

**Overall: HIGH confidence for Phase 4. One unresolved dependency (React version) for Phase 5.**

---

## Sources

- [Tools and Prompts | Figma Developer Docs](https://developers.figma.com/docs/figma-mcp-server/tools-and-prompts/) — HIGH
- [Code Connect Integration | Figma Developer Docs](https://developers.figma.com/docs/figma-mcp-server/code-connect-integration/) — HIGH
- [Code Connect Introduction | Figma Developer Docs](https://developers.figma.com/docs/code-connect/) — HIGH
- [Guide to the Figma MCP Server | Figma Help Center](https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Figma-MCP-server) — HIGH
- [Add Custom Rules | Figma Developer Docs](https://developers.figma.com/docs/figma-mcp-server/add-custom-rules/) — HIGH
- [Figma MCP known client issues](https://developers.figma.com/docs/figma-mcp-server/mcp-clients-issues/) — HIGH
- [get_design_context framework param behavior (forum)](https://forum.figma.com/report-a-problem-6/figma-mcp-with-code-connect-doesn-t-return-the-right-framework-in-get-design-context-53081) — HIGH
- [Code Connect map vs design context separation (forum)](https://forum.figma.com/ask-the-community-7/can-t-get-code-connect-map-info-from-figma-remote-mcp-server-48389) — HIGH
- [Claude Code skill trigger collision bug (GitHub)](https://github.com/anthropics/claude-code/issues/13586) — HIGH
- [LLM design system token compliance failures](https://hvpandya.com/llm-design-systems) — MEDIUM
- Existing skill files: `~/.claude/skills/bluefish-design-system/SKILL.md`, `bf-prototype/SKILL.md`, `bf-explore/SKILL.md` — HIGH
