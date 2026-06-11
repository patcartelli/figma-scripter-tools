# Pitfalls Research

**Project:** Bluefish Design System Skill System — v1.1 /bf-spec and /bf-build
**Researched:** 2026-06-11
**Scope:** Integration pitfalls when adding /bf-spec and /bf-build to an existing skill system

---

## /bf-spec Pitfalls

### Code Connect Failure Modes

**What breaks when Code Connect is absent:**
`get_design_context` does not error silently — it returns a prompt or partial response that interrupts the skill workflow. Confirmed behavior: without Code Connect `.figma.tsx` mapping files published, `get_design_context` generates generic React + Tailwind output rather than Bluefish component code. The `clientFrameworks` / `clientLanguages` parameters documented in the Figma MCP API do not drive actual output framework — the tool defaults to React + Tailwind regardless. This means any `/bf-spec` workflow that passes `get_design_context` output to fill spec fields without checking the framework is consuming wrong-framework code snippets.

**Specific failure modes to handle:**

1. **Code Connect prompt interrupt.** When the user's Figma Desktop has no Code Connect mapping for the selected frame, `get_design_context` returns an instructional prompt about setting up Code Connect rather than component data. If the skill does not detect and bypass this, it stalls waiting for component data that will not arrive. The `bf-prototype` skill handles this correctly with `⚠️ Code Connect not configured — proceeding from conversation context`. `/bf-spec` must do the same.

2. **Silent partial return.** `get_design_context` may return structural data (layer names, frame hierarchy, positioning) without any Code Connect component mappings. A skill that treats this partial return as complete spec data will produce a spec that lists generic Figma layer names instead of component names and lacks variant/prop enumeration. This is the highest-probability quiet failure for spec quality.

3. **Token limit exceeded.** Complex Figma frames can produce `get_design_context` responses exceeding 25,000 tokens (the default Claude Code MCP output cap). The tool returns a truncation error: `"MCP tool 'get_design_context' response exceeds maximum allowed tokens"`. A spec built on a truncated response will silently miss components from the bottom of the frame. `/bf-spec` must verify that the component inventory count is plausible given frame complexity — if the frame has 12 visible component regions and the spec lists 4, the response was likely truncated.

4. **Node ID invalidation.** Editing a Figma file between opening it in Desktop and invoking `/bf-spec` can invalidate node IDs, causing `get_design_context` to return `"The node ID provided was invalid"`. The skill must handle this as a fallback trigger, not an unrecoverable error.

5. **`get_code_connect_map` is separate from `get_design_context`.** Even when Code Connect is configured, `get_design_context` does not automatically include component mapping data in its response. The correct workflow requires calling `get_code_connect_map` separately and cross-referencing the two results. A `/bf-spec` workflow that only calls `get_design_context` and expects Code Connect mappings to appear will miss them even after Code Connect is configured.

**Graceful handling strategy:**
Call `get_design_context` and check the response. If the response contains instructional text about Code Connect setup (strings like "set up Code Connect" or "figma connect publish"), treat it as a Code Connect prompt interrupt: note `⚠️ Code Connect not configured — component names inferred from layer structure` and continue. If the response is empty or an error, fall back to `get_variable_defs` + `figma-reading-guide.md` component inference. Never block spec generation on Code Connect availability.

---

### Spec Quality Drift

**What makes spec output degrade:**

1. **Layer names instead of component names.** When Code Connect is absent, `get_design_context` returns Figma layer structure. Layer names in the Bluefish library are frequently auto-generated (`Frame 42`, `Group 17`) or legacy (`Btn--primary-hov`). If `/bf-spec` uses layer names directly as component names, the spec becomes meaningless for engineering. `figma-reading-guide.md` Step 1 covers this, but it must be explicitly required in the `/bf-spec` workflow — not left as optional context inherited from the foundation.

2. **Single-state specs.** The most common spec quality failure is documenting only the default state of a component. Bluefish components like Button have 5 states (Default, Hover, Focus, Active, Disabled) and 3 variants × 4 colors = 12 variant combinations. A spec that only documents the visible default state is incomplete for production use. `/bf-spec` must enumerate all states observed in the Figma frame OR all states defined in the component set, not just the state that appears in the selected frame.

3. **Token guessing instead of token reading.** When `get_variable_defs` is not called or returns empty (because the selected node is a static default state and interaction tokens are not applied), the skill may infer token names from visual color values. This produces specs with approximate or invented token paths. The existing `tokens.md` fallback pattern handles this, but the spec skill must be explicit: call `get_variable_defs` on the selected node AND cross-reference against `tokens.md` — never infer token paths from hex values alone.

4. **Accessibility section left generic.** `spec-template.md` marks the Accessibility section as `[Required — non-optional]`, but without explicit enforcement rules in `/bf-spec`, the skill tends to produce generic ARIA descriptions ("role=button, enter activates") instead of component-specific ones (correct `aria-describedby` wiring for error states, `aria-expanded` on dropdowns, `aria-current="page"` on nav items). The foundation's per-category ARIA table from `SKILL.md` must be explicitly referenced per component category during spec generation.

5. **Composite component collapse.** `spec-template.md` documents this: for composite components (e.g., a nav panel built from heading, item, and group primitives), `get_design_context` returns the composite's context, not sub-component props. A `/bf-spec` workflow that generates one spec entry for the whole panel will miss prop tables for each sub-component. The correct approach is to call `get_design_context` per sub-component separately — this must be explicit in the skill workflow, not inherited from the template.

6. **M3 token names in spec output.** During the active Figma variable migration, `get_variable_defs` may return M3-style names (`md.sys.color.primary`). If `/bf-spec` emits these in the Tokens Used table without running the mapping from `figma-reading-guide.md` Step 5, the spec will be incorrect and cause confusion when engineers reference `tokens.md`. The M3 → color-roles mapping must be enforced as a pre-output step in the spec skill, not just a mention in foundation context.

---

### Figma MCP Limitations

**What `get_design_context` can reliably return (with Code Connect absent):**
- Frame and layer tree structure (depth-limited)
- Absolute positions and sizes of elements
- Typography assignments (font family, size, weight — but not mapped to type style names)
- Fill colors as hex values (not token paths)
- Component instance names and master component names (when correctly set)
- Spacing/padding as computed px values (not token paths)

**What it cannot reliably return without Code Connect:**
- Bluefish component prop enumerations (`variant`, `color`, `size` ranges)
- Token paths for colors or spacing (returns hex/px, not `color-roles/...` or `scale/...`)
- Interaction state data (the selected frame is a static snapshot; hover/focus/disabled states are in separate Figma frames)
- Component set variant trees (the full Available values column in the Props table)
- Accessibility roles and keyboard behavior (always requires manual judgment)

**`get_variable_defs` scope limitation (already documented in foundation):**
Returns only variables applied to the selected node — not all file variables. State tokens (`_states/hover`, `action/focus`) will be absent if the selected frame is the default state. `/bf-spec` must not infer that missing tokens do not exist; cross-reference `tokens.md` before flagging any token as absent.

**Practical implication for `/bf-spec`:**
The Props table (Figma property → MUI prop mapping) and Tokens Used table will always require partial manual fill when Code Connect is unconfigured. The spec skill must use the fill-and-flag pattern from `spec-template.md` aggressively — every unpopulated cell gets a `/* ⚠️ not available — fill manually */` flag. A spec that leaves cells blank is worse than one with explicit flags; blank cells are invisible gaps.

---

## /bf-build Pitfalls

### Token Compliance Failures

**How hardcoded values sneak in:**

1. **MUI default theme leakage.** MUI components have default theme values for spacing, color, and typography. When `/bf-build` generates a component without explicit token overrides for every visual property, MUI's defaults fill in — producing pixels and hex values that bypass the Bluefish token system entirely. This is silent: the component renders correctly in isolation but uses wrong values. The pre-return checklist (items 1–6 from the foundation) must grep output before returning, not as an optional quality step.

2. **DATA-03 single-path collapse.** The dual-path `⚠️` pattern is required for every token path reference in sx props. The single highest-frequency compliance failure in generated code is outputting only the MUI theme extension form (`theme.palette.primary.main`) without the CSS custom property fallback form — or vice versa. When the skill generates a long component with many token references, the dual-path requirement tends to be applied to the first few and then dropped for the remainder. The pre-return check must verify at least one `⚠️ token injection method unconfirmed` comment appears per file — if zero appear, the dual-path rule was silently dropped.

3. **sx prop arithmetic.** When a component needs spacing that isn't a clean `scale/N` value (e.g., combining padding and an icon gap), generated code may produce `sx={{ p: '12px 16px' }}` or `sx={{ mt: 1.5 }}` (MUI's spacing multiplier). Both bypass the token system. MUI's `theme.spacing()` syntax with integer arguments (`theme.spacing(4)`) is the correct form. If a layout requires a spacing gap not in the scale, flag it — do not silently use a multiplier.

4. **Typography as raw CSS.** Generated components often inline typography as `sx={{ fontSize: '0.875rem', fontWeight: 500 }}` instead of mapping to MUI theme typography tokens. The type-styles.md mapping to MUI theme typography variants must be explicit in the build skill — `variant="body2"` is not the same as setting `fontSize` literally, and the wrapping pattern must pass the variant through, not override it with sx.

5. **Border and divider as hardcoded strings.** `border: '1px solid #E8E8E8'` is the most common form of token bypass in generated components. The token path is `color-roles/outline/default` → `var(--color-roles-outline-default)`. The build skill must specifically call out border properties as a token compliance concern — they are invisible in visual review but present in grep.

6. **Elevation omitted without flag.** Elevation tokens are undefined in the Bluefish system. When a design includes a card or panel with a visible shadow, generated code tends to either hardcode `box-shadow: 0 2px 8px rgba(0,0,0,0.1)` (compliance violation) or silently omit the shadow (visual discrepancy without a flag). The correct behavior is to include the `⚠️ elevation token undefined` comment where a shadow would appear. If this is not explicit in the build skill workflow, elevation handling is inconsistent across different invocations.

---

### MUI Anti-patterns

**Common MUI misuse in generated components:**

1. **Raw MUI components instead of wrapping pattern.** The foundation mandates creating `<BluefishButton>` that wraps `<Button>`. Generated code frequently shortcuts this by using raw MUI components with sx overrides applied inline. This breaks the wrapping contract: if the component is used in multiple places, token updates require touching every usage site rather than one wrapper. The wrapping pattern must be stated as a hard requirement in the build skill — not just inherited from foundation context.

2. **BEM classes on MUI internals.** The foundation explicitly prohibits applying BEM class names to MUI internal elements (`.MuiButton-root`, etc.). Generated code has a tendency to add classes like `.bluefish-button__icon` to the MUI icon slot, which breaks when MUI's internal class structure changes. BEM applies to the outer custom component wrapper only.

3. **`sx` prop as sole styling mechanism.** Using `sx` for all styling instead of `styled()` or theme overrides creates verbose, hard-to-read component files when a component has many visual states. For production components (unlike prototypes), complex state styling (hover, disabled, selected backgrounds) belongs in a `styled(MuiComponent)` call or theme component overrides, not accumulated `sx` conditions.

4. **Missing `import type` for MUI type exports.** This is documented in the foundation and confirmed as a Vite runtime SyntaxError source. MUI exports like `SelectChangeEvent`, `SelectProps`, `SxProps`, `AutocompleteChangeReason` are type-only and must use `import type { ... }`. Generated code commonly imports these as values. The build skill must include this as a named pre-return check item — it is not caught by visual review.

5. **`color` prop with non-Bluefish values.** MUI's `color` prop accepts `'primary'`, `'secondary'`, `'error'`, `'warning'`, `'info'`, `'success'`, `'inherit'`. Generated code sometimes passes values like `'brand'` or `'teal'` that do not exist in the MUI palette API and silently fall back to MUI default colors. Only `color` values that are registered in the MUI theme via `palette` extension are valid.

6. **`ThemeProvider` scope errors in component files.** A `/bf-build` output component file should not include its own `ThemeProvider` wrapper. The theme provider belongs in `main.tsx` (established in the prototype scaffold). Generated components that include their own `ThemeProvider` will nest theme contexts, causing tokens to resolve incorrectly or creating duplicate provider trees.

---

### TypeScript Quality

**Common TypeScript anti-patterns in generated components:**

1. **Props typed as `any`.** LLM-generated components frequently use `any` for complex prop types (e.g., callback signatures, data shape props, event handler types). This defeats TypeScript's purpose. For `/bf-build` output, all props must be explicitly typed. Use `React.MouseEvent<HTMLButtonElement>` for click handlers, not `any`. Use `React.ReactNode` for children slots, not `any`.

2. **Missing `React.FC` vs function declaration consistency.** Generated components oscillate between `const Foo: React.FC<Props> = (props) => ...` and `function Foo(props: Props): JSX.Element`. The wrapping pattern implied by the foundation uses named function declarations — this should be consistent within `/bf-build` output.

3. **Interface vs type alias inconsistency.** MUI APIs use interfaces extensively. Generated wrapper components should extend MUI prop interfaces where appropriate (e.g., `interface BluefishButtonProps extends ButtonProps { ... }`) rather than duplicating prop definitions. Duplicating creates drift when MUI updates.

4. **Enum types instead of string unions.** Generated code sometimes uses TypeScript `enum` for variant/size/color prop values. MUI's API uses string literal unions, and enums do not compose cleanly with MUI's existing type system. Use `type Variant = 'contained' | 'outlined' | 'text'`, not `enum Variant`.

5. **Non-null assertion overuse.** When working with optional Figma data (component names, prop values that may be undefined), generated TypeScript tends to use `!` (non-null assertion) rather than proper null guards. This produces code that passes TypeScript but throws at runtime when values are actually missing.

6. **Default prop values not typed narrowly enough.** A component with `color?: string` should be `color?: 'primary' | 'secondary' | 'error'` — the broad type allows values that will silently break MUI rendering. The build skill must derive prop type narrowing from the MUI API for each component, not from the Figma property type alone.

---

## Integration Pitfalls

### Foundation File Duplication

**Risk of copying instead of referencing:**

The foundation files (`figma-reading-guide.md`, `spec-template.md`, `tokens.md`, `tokens-dataviz.md`, `type-styles.md`) are authoritative and must remain in `~/.claude/skills/bluefish-design-system/`. Both `/bf-spec` and `/bf-build` must reference them via `@~/.claude/skills/bluefish-design-system/SKILL.md` (the `@include` mechanism) and explicit "read on demand" file references in the skill workflow — they must never contain inline copies of token tables, type style tables, or the spec template.

**How duplication happens:** When writing a `/bf-spec` skill, it is tempting to inline the spec template structure directly into the skill SKILL.md rather than pointing to `spec-template.md`. This creates two sources of truth. When `spec-template.md` is updated (e.g., new required fields added, outline token rename applied), the inlined copy in `/bf-spec` silently diverges.

**Detection signal:** If `/bf-spec/SKILL.md` contains a Markdown table with columns `| Prop | Type | Value | Available | Notes |`, the template has been duplicated. The skill should contain the instruction "read `spec-template.md` for output format" — not the format itself.

**Token table duplication is the higher-risk form.** If `/bf-build/SKILL.md` contains a table of token paths and hex values (e.g., `| color-roles/primary/main | #00414F |`), it will drift the moment `tokens.md` is updated. Token values belong exclusively in `tokens.md`.

---

### Skill Trigger Ambiguity

**When /bf-spec and /bf-build might fire incorrectly:**

1. **Verb collision with existing skills.** The existing skills have documented trigger anti-patterns. `/bf-prototype` explicitly guards against "build" and "implement" colliding with `/bf-build`. `/bf-build` must reciprocally guard against "prototype" colliding with `/bf-prototype`. The description field for `/bf-build` must include an explicit exclusion: "Not for prototypes (use bf-prototype) or spec generation (use bf-spec)."

2. **"Spec this" vs "build this" ambiguity.** A user typing "spec this component" or "build this component" without a slash command can fire either skill. The discriminating signal for `/bf-spec` is output format (spec-template.md handoff document) and Figma-as-input. For `/bf-build`, it is production React/TypeScript code as output and stricter token compliance than prototype mode. The description fields must encode these as output-type discriminators, not task-verb discriminators.

3. **Description field truncation.** Claude Code truncates skill descriptions at 250 characters in the listing. If the key auto-trigger condition is buried past character 250 in the description, it will not be seen during skill selection. Both `/bf-spec` and `/bf-build` descriptions must front-load their primary trigger condition and exclusions within the first 250 characters.

4. **`bluefish-design-system` over-triggering as a catch-all.** The foundation skill's description is "Bluefish design system reference. Use for token lookups, accessibility rules, Figma variable reading, component conventions, and code output standards. Activates for any question about the Bluefish design system that is not a specific explore, prototype, spec, or build task." The "spec" and "build" exclusions in the foundation description must be updated when `/bf-spec` and `/bf-build` are added — before that update, the foundation will intercept spec and build requests.

5. **"Handoff doc" phrasing fires /bf-spec instead of /bf-build.** Users may ask for a "spec and handoff" when they mean production code. If `/bf-spec`'s description includes "handoff doc," it will intercept these requests. The handoff document framing belongs in the output description ("produces a handoff-ready spec document"), not the trigger description ("fires when user asks for handoff").

---

## Prevention Strategies

### P1: Code Connect interrupt — explicit detection and bypass (applies to /bf-spec)

In the `/bf-spec` workflow, after calling `get_design_context`, check the response for Code Connect setup instructions before using any content. If the response contains instructional text about Code Connect (presence of strings like "figma connect publish", "Code Connect", "set up"), emit `⚠️ Code Connect not configured — component names inferred from layer structure, props not available` and continue with `figma-reading-guide.md`-based component inference. Do not ask the user to set up Code Connect — that is an engineering dependency tracked separately. Never block spec generation on Code Connect availability.

### P2: Dual-call MCP pattern for spec generation (applies to /bf-spec)

Always call both `get_variable_defs` AND `get_design_context` for spec generation. `get_variable_defs` provides token values (live authority). `get_design_context` provides structure. Neither alone is sufficient. For composite components, call `get_design_context` per sub-component — do not rely on the composite frame's context response to expose sub-component props.

### P3: Token compliance grep before return (applies to /bf-build)

The pre-return checklist must be stated as a mandatory internal verification step in the build skill workflow, not just inherited from the foundation. Specifically: (1) zero `#` hex values outside `⚠️`-flagged exceptions, (2) zero raw `px` spacing values outside `⚠️`-flagged exceptions, (3) at least one `⚠️ token injection method unconfirmed` comment per file confirming the dual-path rule was applied. If the checklist passes, return. If it fails, self-correct before returning.

### P4: Wrapping pattern enforcement (applies to /bf-build)

State the MUI wrapping pattern as a hard constraint in the `/bf-build` skill, not just as inherited foundation context. Every generated production component must: (1) be a named wrapper (`<BluefishX>`), (2) not use raw MUI components directly in the consuming render tree, (3) not include its own `ThemeProvider`. Verify these three conditions before returning.

### P5: M3 token name normalization pre-output (applies to /bf-spec and /bf-build)

Run the M3 → color-roles mapping from `figma-reading-guide.md` Step 5 as a mandatory pre-output step whenever the spec or build output was generated from live Figma MCP data. Any `md.sys.color.*` or `md.ref.palette.*` string in the output is a hard error — do not return until they are replaced with `color-roles/...` equivalents.

### P6: All-states requirement for spec (applies to /bf-spec)

The spec skill must explicitly require that the Variants & States section enumerates all states in the component set — not just the state visible in the selected Figma frame. Pattern: "List all variants and interaction states present in the component. If only one variant/state is visible in the selected frame, note it and query the component set separately for the full list." Without this rule, every spec produced from a default-state selection will be single-state.

### P7: Foundation file reference, not duplication (applies to both)

Both `/bf-spec/SKILL.md` and `/bf-build/SKILL.md` must use "read on demand" patterns pointing to foundation files (same pattern as `bf-explore` and `bf-prototype`). No token tables, no type style tables, no spec template markup inside the command skill SKILL.md files. Validate this during skill file creation by checking that the word "color-roles/" does not appear in the skill body except in examples.

### P8: Description field ordering for trigger precision (applies to both)

Write both descriptions so the primary trigger condition appears in the first 50 characters and the primary exclusions appear before character 250. The description field is the sole selector mechanism for auto-triggering — if the discriminating content is not visible in the truncated listing, trigger failures will be frequent and silent.

### P9: `import type` enforcement for MUI types (applies to /bf-build)

List specific MUI type-only exports as named items in the pre-return checklist: `SelectChangeEvent`, `SelectProps`, `SxProps`, `AutocompleteChangeReason`, `ButtonProps`. These are the most common sources of Vite runtime SyntaxError. Including them by name (rather than as a general "type imports" rule) makes the check actionable.

### P10: Screenshot comparison as completion gate (applies to /bf-build)

The foundation's pre-return checklist item 8 is `call get_screenshot for the original Figma node — compare rendered output against it visually — flag discrepancies`. This step is critical for `/bf-build` production output and must be stated explicitly in the skill workflow. The most common quality failure in production component generation is structural divergence from the Figma source that is invisible to token compliance checks.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|---|---|---|
| /bf-spec intake | Code Connect prompt interrupt stalls generation | Detect interrupt signal, emit ⚠️ flag, continue — P1 |
| /bf-spec component inventory | Layer names used instead of master component names | Explicit figma-reading-guide.md Step 1 enforcement in skill |
| /bf-spec Variants & States | Single-state spec from default-state frame selection | All-states requirement — P6 |
| /bf-spec Tokens Used | M3-style names emitted in output | Pre-output M3 normalization pass — P5 |
| /bf-spec composite components | Sub-component props absent from spec | Per-sub-component get_design_context calls — P2 |
| /bf-build token compliance | MUI default theme values leak through | Pre-return compliance grep — P3 |
| /bf-build token compliance | DATA-03 dual-path dropped mid-file | At least one ⚠️ comment verification in checklist — P3 |
| /bf-build MUI wrapping | Raw MUI components in render tree | Wrapping pattern as hard constraint — P4 |
| /bf-build TypeScript | MUI type-only exports imported as values | Named type export checklist — P9 |
| /bf-build visual fidelity | Structural divergence invisible to token grep | Screenshot comparison gate — P10 |
| Integration | Foundation files duplicated inside skill SKILL.md | File reference validation during authoring — P7 |
| Integration | Trigger collision between /bf-prototype and /bf-build | Explicit exclusions in both skill descriptions — P8 |
| Integration | bluefish-design-system intercepts spec/build tasks | Update foundation description exclusions before publishing new skills |

---

## Sources

- Figma MCP tools and prompts documentation: https://developers.figma.com/docs/figma-mcp-server/tools-and-prompts/
- Figma MCP known client issues: https://developers.figma.com/docs/figma-mcp-server/mcp-clients-issues/
- `get_design_context` framework parameter behavior (forum): https://forum.figma.com/report-a-problem-6/figma-mcp-with-code-connect-doesn-t-return-the-right-framework-in-get-design-context-53081
- Code Connect map vs design context separation (forum): https://forum.figma.com/ask-the-community-7/can-t-get-code-connect-map-info-from-figma-remote-mcp-server-48389
- Claude Code skill trigger collision bug (GitHub): https://github.com/anthropics/claude-code/issues/13586
- LLM design system token compliance failures: https://hvpandya.com/llm-design-systems
- Existing skill files: `~/.claude/skills/bluefish-design-system/SKILL.md`, `bf-prototype/SKILL.md`, `bf-explore/SKILL.md`
- Phase 3 UAT gap documentation: `.planning/phases/03-bf-prototype/03-UAT.md`
