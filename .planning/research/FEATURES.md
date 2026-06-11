# Features Research

**Project:** Bluefish Design System Skill System — v1.1 Milestone (/bf-spec + /bf-build)
**Researched:** 2026-06-11
**Scope:** Table stakes, differentiators, and anti-features for `/bf-spec` and `/bf-build` command skills

---

## /bf-spec: Table Stakes

Every spec output must include these. Missing any makes the doc unusable for engineering.

| Feature | Why It's Table Stakes | Complexity | Notes |
|---------|----------------------|------------|-------|
| Component inventory (all components in the screen) | Engineers can't build what they don't know exists | Low | Driven by `get_design_context` MCP call |
| All variants and interaction states per component | Most common handoff failure point — happy path only causes rework | Low-Med | Requires speccing non-default states explicitly (hover, active, disabled, focus, error, loading) |
| Token table per component (`color-roles/`, `scale/`) | Engineers can't look up tokens themselves without this — prevents hardcoding | Low | Use field mapping from `spec-template.md` |
| Type style table per component | Typography is the second most commonly hardcoded value after color | Low | Top-level styles only from `type-styles.md` |
| Accessibility section (role, label, keyboard, contrast) | Non-negotiable WCAG AA requirement — already in `spec-template.md` | Low | Always manual — never inferrable from design context |
| Prop table with type, current value, and all available values | Engineers need the full enum, not just the one state shown | Low | Straight from component set — `spec-template.md` format |
| Status field (Needs Review / Ready / In Progress) | Without this, engineers can't tell if the spec is stable enough to build against | Low | Default to Needs Review |
| Figma component name (master component, not layer name) | Layer names are auto-generated; only master names are stable references | Low | Step 1 of `figma-reading-guide.md` |
| Gap flags for unresolved values (`⚠️` pattern) | Engineers need to know what's confirmed vs. pending — unresolved should be visible, not silent | Low | Already established in foundation |

---

## /bf-spec: Differentiators

What makes this spec skill exceptional vs. generic spec output.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Interaction notes that specify code behavior, not just visual state | "→ Opens confirmation modal" vs. "hover state shown" — engineers need events and consequences, not just pixels | Med | Requires inferring from design intent; must be explicit about what is inferred |
| Conditional display rules | "Only visible when user has admin role" / "Shows after count > 10" — these don't exist in Figma, must be authored from context | Med | When MCP context doesn't tell you, state the assumption and flag it |
| Edge case inventory | Empty state, loading state, error state, truncation at max character count — distinct from variants | Med | These require explicit frames in Figma OR explicit notes that design needs to provide them |
| Screen-level component inventory (all components, not just focused one) | `/bf-spec` on a whole screen surfaces dependencies a per-component spec misses | Med | Use `get_design_context` at screen/frame level first, then recurse into sub-components |
| Explicit MUI component mapping per inventory item | Engineers don't want "a button" — they want "MUI `<Button>` variant='contained' color='primary'" | Low-Med | Leverages `figma-reading-guide.md` Step 3 and the component map section from foundation |
| Known-gap callout section | Elevation undefined, DATA-03 unresolved, dark mode contrastText failures — surfaced prominently, not buried in inline flags | Low | This is the "Notes" section of `spec-template.md` elevated to screen level |
| M3 → color-roles mapping surface | When live Figma returns M3-style variable names, the spec translates them to `color-roles` paths — engineer never sees M3 names | Low | Already defined in `figma-reading-guide.md` Step 5; spec must apply it |
| Token drift callout | If live `get_variable_defs` value differs from `tokens.md`, the spec surfaces the discrepancy explicitly so eng and design can resolve it before build | Low | Already a pattern in `bf-prototype` — same discipline for spec |

**The most valuable differentiator:** Interaction notes with code-level specificity. Generic spec tools generate redlines; `/bf-spec` generates implementation guidance. "Click → navigates to /settings/billing" is more valuable to an engineer than a 16px measurement annotation.

---

## /bf-spec: Anti-features

Scope creep risks to explicitly exclude.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Responsive breakpoint specs | Out of scope for Bluefish screen patterns at this stage; no responsive token system exists | Flag as a gap if layout clearly needs responsive treatment |
| Animation / motion specs | No motion token system; no established Bluefish motion language to spec from | Flag if component has transition behavior; note "motion undefined — pending design" |
| Copy deck / final text content | Editorial review process is separate from design spec | Render placeholder/Lorem text inline; do not finalize copy in spec output |
| Multiple output formats (Markdown + JSON + comments) | Two output formats doubles the maintenance burden for zero additional value in the current workflow | Spec-template.md Markdown format is the single output format |
| Per-pixel redline annotations | Modern Figma Dev Mode auto-generates measurements; manual redlining is obsolete | Use token paths and component names instead of pixel values |
| Figma link embedding | Session-scoped MCP access doesn't produce stable shareable links | Note the component set and page name; let engineer open Figma directly |
| Responsive / mobile variants | Not part of Bluefish screen patterns yet | Omit; flag if user requests it as out-of-scope |

---

## /bf-build: Table Stakes

Every production component output must include these without exception.

| Feature | Why It's Table Stakes | Complexity | Notes |
|---------|----------------------|------------|-------|
| Named custom component wrapping MUI (e.g., `<BluefishButton>`) | The wrapping pattern is the established Bluefish architecture — raw MUI components are not team-acceptable output | Low | Already defined in foundation SKILL.md |
| TypeScript prop interface (explicit `interface` or `type`) | Production components without prop types cause downstream type errors at integration time | Low | Every prop must be typed; booleans, enums, and string literals preferred over `string` |
| Full `color-roles/` token paths for all color values | The invariant from foundation — no hex, no raw palette references | Low | Already established; build inherits it |
| Full `scale/` token paths for all spacing/radius | Same as color — zero px literals | Low | Same |
| Top-level type styles only | No `web/` prefix, no nested style names, no `Page Title` | Low | Same |
| DATA-03 dual-path output with `⚠️` flag | Token injection is unconfirmed — both MUI theme extension form AND CSS custom property form, same as `bf-prototype` | Low | `⚠️ token injection method unconfirmed — verify with eng` on every sx block using token paths as strings |
| ARIA props on all interactive elements | Non-negotiable accessibility requirement | Low | Buttons, inputs, nav, charts — each has its required ARIA pattern from foundation |
| Import type for MUI type-only exports | Vite runtime SyntaxError if omitted — this is a build-breaking omission | Low | `import Select, { type SelectChangeEvent }` — already a foundation rule |
| `⚠️` flags for every known gap (elevation, dark mode contrastText, DV series contrast failures) | Production code with silent gaps ships broken behavior | Low | Already established — elevation, DV 04/10/13/25/29, dark mode warning/info/success |
| Visual comparison against Figma screenshot via `get_screenshot` | Component can't be called complete if it doesn't match the Figma source | Low | Rule 8 from foundation code output checklist — apply this for build, not just prototype |
| `displayName` assignment on the custom component | Debuggability in React DevTools — zero-cost and expected in production code | Low | `BluefishButton.displayName = 'BluefishButton'` |

---

## /bf-build: Differentiators

What makes this build skill exceptional vs. prototype-quality code that engineers have to rework.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Props that extend MUI's own prop interface for the underlying component | `interface BluefishButtonProps extends ButtonProps { ... }` — engineer can use all MUI props plus Bluefish-specific ones without prop drilling | Med | Requires knowing the MUI component's exported props type — look up via Context7 or docs |
| `React.forwardRef` on custom components used inside other components | Components that need to accept refs (used in Tooltip, Popper, transition containers) break silently without it | Med | Note: React 19 makes this optional — but current Vite+MUI scaffold hasn't confirmed React version; include by default and flag with note |
| `sx` prop passthrough so callers can extend styling | Callers must be able to pass `sx` to a Bluefish wrapper — without this the wrapper becomes a dead end | Low | Add `sx?: SxProps<Theme>` to the prop interface; spread into the underlying MUI component |
| Storybook-ready prop structure | Props as explicit named values (not config objects or render props) means the component is immediately Storybook-compatible without rework | Low | This is a structural discipline, not a Storybook dependency |
| Documented token override points | Comment in code showing where theme-level overrides would go if the token injection method changes — lowers future migration cost | Low | `// theme.components.MuiButton.styleOverrides.root — override here when DATA-03 resolved` |
| Explicit empty / loading / error state props | `isLoading?: boolean`, `isEmpty?: boolean`, `error?: string` where the Figma spec called for these states | Med | Requires reading the spec; `/bf-build` should consume `/bf-spec` output as its input context |
| `children` typed explicitly, not `React.ReactNode` as a catch-all | `React.ReactNode` is correct but `ReactElement` or `string` is more precise when the component has a known content shape | Low-Med | Only applies when the content model is constrained |

**The most valuable differentiator:** Props that extend MUI's own interface. An engineer receiving `interface BluefishButtonProps extends ButtonProps` can immediately see the full API contract and knows the custom component is a proper superset of MUI, not a leaky wrapper.

---

## /bf-build: Anti-features

What to explicitly not include in build output.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Unit tests in the output | Tests are a separate engineering artifact; generating them in a skill session adds scope and usually produces tests that need rewriting | Flag "tests not included — write unit tests for [these states]" |
| Storybook stories in the output | Same as tests — separate artifact; including them extends the session and adds unreviewable code | Same — flag as a follow-on task |
| Multiple component files per session | One component per build session — clean handoff, reviewable output | If a screen requires multiple components, recommend running `/bf-build` per component |
| State management beyond component-local state | Redux, Zustand, Context — out of scope; component should be stateless or use `useState` for local interaction only | Flag props that should come from the calling context: `selectedId: string` (caller owns) vs `isOpen: boolean` (component owns) |
| CSS Modules or Emotion styled() for production output | Adds a styling layer that conflicts with the MUI wrapping pattern and theme system | Use `sx` prop for component-scoped styles; use `theme.components` for global overrides |
| Inline `style` prop | Not theme-aware, not responsive, not token-compatible | Always `sx` |
| Hard-coded component dimensions (fixed width/height) | Design system components should not be fixed-size — they adapt to their container | Use `width: '100%'`, flexbox, or let MUI handle sizing; only hardcode when Figma spec explicitly requires it |
| Error boundary wrapping the component | Error boundaries are app-level infrastructure, not component-level responsibility | Document that the component does not handle its own errors; calling context owns that |

---

## Handoff Quality Criteria

What makes a `/bf-spec` doc actually useful to an engineer vs. one that creates questions.

**A useful handoff doc answers these five questions without follow-up:**

1. **What components exist?** — Complete inventory with MUI equivalents and Figma master component names. Not "a card" — "MUI `<Card>` implementing `Panel/Detail/Default`, category: Layout."

2. **What states does each component have?** — Every variant AND every interaction state. Hover, active, focus, disabled, loading, error, empty. If a state isn't specced, the engineer either skips it or invents it.

3. **What tokens does it use?** — Full path, role, and any `⚠️` flags. Engineers should be able to open `tokens.md` and look up every value without design.

4. **How does it behave on interaction?** — Not just what it looks like, but what happens: "Click → emits `onSelect(id: string)` to parent" or "Enter key → submits form." This is the most commonly missing piece.

5. **What is unresolved?** — A spec that hides gaps (elevation undefined, contrast failure, token drift) causes bugs. A spec that surfaces gaps with `⚠️` flags lets the engineer make informed decisions.

**Quality signals that distinguish a useful handoff doc:**

- No state undocumented: if hover exists in Figma, it's in the spec. If a loading state should exist but isn't in Figma, the spec flags it.
- Interaction notes are written for code, not for design review: "onClick triggers state transition" not "button highlights when pressed."
- The Notes/Gaps section is the most useful section in the doc — it contains the decisions engineers would otherwise have to interrupt design for.
- Every token path is full and canonical: `color-roles/primary/main` not "primary blue."
- The accessibility section is never empty — even a static display component documents its ARIA role and whether it has keyboard interaction.

**Quality signals that a handoff doc is generic/useless:**

- Only the default state is documented.
- Token table contains hex values instead of token paths.
- Accessibility section says "follows WCAG AA" without specifying role, label, or keyboard behavior.
- No notes or gaps section.
- Props table lists prop names but not available values (enum range).

---

## React/MUI Production Quality Criteria

What separates production output from prototype-quality code that needs rework before shipping.

**Structural criteria:**

| Criterion | Prototype Quality | Production Quality |
|-----------|------------------|-------------------|
| Component shape | Function component, props passed inline | Named export with explicit `interface Props` extending MUI's type for the underlying component |
| Styling | `sx` with hardcoded values | `sx` with token paths, `⚠️` dual-path for DATA-03 |
| Ref handling | Not forwarded | `React.forwardRef` on components that are children of Tooltip, Popper, or transition containers |
| `sx` passthrough | Props fixed — no override | `sx?: SxProps<Theme>` in interface, spread to underlying MUI component |
| `displayName` | Absent | Set explicitly: `BluefishButton.displayName = 'BluefishButton'` |
| Type imports | Mixed value/type imports | All MUI type-only exports use `import type {}` |
| State handling | `useState` for everything | Local states (isOpen, isHovered) owned by component; derived states (selectedId, data) passed as props |
| Prop interface | `any` or implicit | Explicit typed interface, no `any`, enums use TypeScript union types |
| Known gaps | Silently hardcoded or omitted | Every gap has an inline `⚠️` comment with the specific reason |
| Visual match | Not verified | `get_screenshot` comparison performed; discrepancies flagged before declaring complete |

**The single most common rework trigger:** Props that don't extend MUI's own props type. When an engineer wraps `<BluefishButton>` in a Tooltip, if `ref` isn't forwarded and `sx` isn't passable, the engineer has to rework the component API. This is the difference between a component that integrates and one that needs a rewrite on first use.

**The single most common production correctness bug:** Missing `import type {}` for MUI type exports in a Vite build. The component renders fine in dev but throws a SyntaxError at build time. This is a zero-cost fix that must be enforced at generation time.

---

## Skill Dependencies

| Dependency | Direction | Notes |
|------------|-----------|-------|
| `/bf-spec` inherits from `bluefish-design-system` | Required | Same `@include` pattern as `bf-explore` and `bf-prototype` |
| `/bf-build` inherits from `bluefish-design-system` | Required | Same pattern |
| `/bf-build` consumes `/bf-spec` output as input context | Recommended, not required | Highest-fidelity build output comes from feeding the spec doc as context; skill should prompt for this if not provided |
| `spec-template.md` is the output contract for `/bf-spec` | Hard constraint | Not duplicated in command skill — referenced via support file pattern |
| `figma-reading-guide.md` Step 5 (M3 mapping) | Required at read time | Both skills need this when MCP returns M3-style variable names |
| `tokens.md`, `type-styles.md`, `tokens-dataviz.md` | On-demand reads | Same pattern as `bf-prototype` — not at skill start |
| DATA-03 dual-path pattern | Required for `/bf-build` | Token injection unconfirmed — both forms required with `⚠️` flag, same as `bf-prototype` |
| Code Connect gap handling | Required for both | Same `⚠️ Code Connect not configured — proceeding from conversation context` pattern |

---

## Phase Complexity Assessment

| Phase | Complexity Driver | Simple Parts | Hard Parts |
|-------|------------------|-------------|------------|
| `/bf-spec` | Moderate | Spec template exists; field mapping from MCP is defined; `⚠️` flag patterns established | Interaction notes require inference from design intent; sub-component recursion for composite components; screen-level vs. component-level inventory distinction |
| `/bf-build` | Moderate-High | Token compliance rules established; wrapping pattern established; MUI type import rules established | Props extending MUI types correctly; forwardRef determination logic; DATA-03 dual-path in JSX (more complex than CSS); visual comparison verification step |

`/bf-spec` builds on a fully-defined template and established MCP reading patterns — complexity is in the interaction notes and gap surfacing, not the structure.

`/bf-build` has higher complexity because production TypeScript prop design requires more judgment than CSS token annotation. The DATA-03 dual-path in JSX (sx props) is more verbose than in CSS and requires consistent formatting.
