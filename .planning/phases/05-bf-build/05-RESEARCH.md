# Phase 05: bf-build — Research

**Researched:** 2026-06-12
**Domain:** Claude Code skill authoring — TypeScript React/MUI component generator
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**D-01:** Target React 19. `forwardRef` wrappers not required. Vite `react-ts` template now ships React 19 by default.
**D-02:** MCP-first — attempt `get_variable_defs` + `get_design_context` first (Path A). If MCP returns nothing and a spec file is referenced, switch to Path B. User never asked to choose a path.
**D-03:** MCP sequence for Path A: `get_variable_defs` + `get_design_context` only. No `get_metadata`. Output filename derived from component name, not frame name.
**D-04:** Sub-component spec format (`### Sub-component: [Name]`) is confirmed reliable. Path B parser can rely on H2 heading → `### Variants & States / Props / Tokens Used / Type Styles / Accessibility / Figma Reference` order.
**D-05:** Cross-referenced specs: auto-read the referenced spec file before generating sub-component code. No user prompt.
**D-06:** Screen-level spec input: present inventory, ask "Which component should I build?" — one `.tsx` file per invocation.
**D-07:** Output: `Bluefish[ComponentName].tsx` written to `./`. TypeScript interface extending relevant MUI props, named wrapper component, inline token annotations, required ARIA props.
**D-08:** No Vite scaffold, no Storybook story stub, no `App.tsx` wrapper — component file only.
**D-09:** Dataviz token format: `color-roles/dataviz/[NN]/[property]` from `tokens.md`. `tokens-dataviz.md` is raw source palette for gradients/tints only.
**D-10:** Typography annotation format: `/* type: H1 */` inline. Top-level style names only.
**D-11:** DATA-03 stays dual-path. Both MUI theme extension form AND CSS custom property form, flagged with `/* ⚠️ token injection method unconfirmed — verify with eng */`.
**D-12:** MCP-unavailable diagnostic: "tokens from cached Bluefish reference (tokens.md, type-styles.md, tokens-dataviz.md)".
**D-13:** Phase 5 must reclaim build/implement routing. Concrete updates: update all four command skill `description:` fields, remove foundation description's "build and implementation requests" interim clause, remove foundation Known Gaps bf-build entry, update README.

### Carried-Forward Decisions (binding)
- `@include` pattern: `@~/.claude/skills/bluefish-design-system/SKILL.md` immediately after frontmatter `---`, with fallback blockquote
- On-demand support reads: `tokens.md`, `type-styles.md`, `tokens-dataviz.md`, `figma-reading-guide.md` NOT @included upfront
- `get_variable_defs` precedence: live Figma values over `tokens.md`
- Code Connect graceful fallback: flag inline `⚠️ Code Connect not configured — proceeding from conversation context`, never block
- Token drift flagging: use live value, flag inline
- MUI wrapping pattern: named custom component wrapping MUI internally
- `import type {}` for MUI type exports — Vite runtime SyntaxError otherwise
- 8-point pre-return checklist from foundation: apply before returning code output

### Claude's Discretion
- TypeScript interface structure: extend most appropriate MUI props type per component
- MCP sequence depth for composite components (Path A): Claude determines when sub-component warrants its own `get_design_context` call

### Deferred Ideas (OUT OF SCOPE)
- Storybook story stub output
- Multi-component batch output from screen-level spec
- `get_context_for_code_connect` vs `get_design_context` for Path A
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| BUILD-01 | `/bf-build` SKILL.md created at `~/.claude/skills/bf-build/SKILL.md` supporting Path A (Figma frame + MCP) and Path B (existing spec file) | Skill structure defined below; all locked decisions documented; structural analogs (bf-spec, bf-prototype) fully read |
| BUILD-02 | Skill fires correctly when user types `/bf-build` or asks to build or implement a Bluefish component | Frontmatter description pattern established from prior skills; routing reclaim tasks enumerated |
</phase_requirements>

---

## Summary

Phase 5 delivers one artifact: `~/dev/bluefish-ai-skills/bf-build/SKILL.md`, symlinked to `~/.claude/skills/bf-build/`. This is a SKILL.md authoring task, not a software development task. The deliverable is a Claude Code skill instruction file that tells Claude how to generate production TypeScript React/MUI components when invoked.

The research base is unusually strong. All four structural analogs (`bf-explore`, `bf-prototype`, `bf-spec`, `bluefish-design-system`) are fully in place and have been read in this session. The exact sections bf-build needs, the precise wording conventions, the `⚠️` flagging vocabulary, the @include pattern, and the anti-patterns section structure are all documented and verified by reading live files. No invention required — bf-build assembles its sections by adapting proven patterns from these four sources.

The secondary task — routing reclaim — has exactly seven concrete file edits across four files, all verified by grep. These are the "interim language" removals that signal bf-build has shipped.

**Primary recommendation:** Structure bf-build SKILL.md with 10 sections mirroring bf-spec (same section order, adapted content): frontmatter + @include + summary + Support Files + Intake + Figma Context + Path B Spec Parsing + Output Rules + Anti-Patterns. Then execute the 7 routing reclaim edits. Create the symlink with `ln -s`.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Skill instruction authoring | SKILL.md document | — | Claude reads SKILL.md at runtime; the file IS the skill logic |
| Foundation context (tokens, a11y) | `bluefish-design-system/SKILL.md` (via @include) | Read-on-demand support files | Foundation owns shared rules; bf-build inherits them |
| MCP data gathering (Path A) | Figma MCP tools (`get_variable_defs`, `get_design_context`) | Fallback to tokens.md | Live Figma data is authoritative; tokens.md is fallback only |
| Spec file parsing (Path B) | User's `./` working directory (spec-*.md files) | Auto-read cross-referenced spec files | Spec files generated by bf-spec live in user's project directory |
| Component code output | Generated `.tsx` file in `./` | — | Single named file per invocation; no scaffold, no App.tsx |
| Routing reclaim | 4 skill files + README | — | 7 specific edits across `bf-prototype`, `bf-spec`, `bluefish-design-system`, `README.md` |

---

## Standard Stack

### No New Packages

Phase 5 installs no npm packages. It creates a SKILL.md file. The packages listed below are what the SKILL.md will reference in its output instructions (the scaffold command users will run after receiving the skill's output).

### Referenced in Skill Output Instructions

| Package | Version | Purpose | Notes |
|---------|---------|---------|-------|
| `react` | ^19.2.6 [VERIFIED: npm registry] | Target React version | Vite react-ts template now ships ^19.2.6 |
| `react-dom` | ^19.2.6 [VERIFIED: npm registry] | React DOM | Paired with react |
| `@mui/material` | 9.1.1 [VERIFIED: npm registry] | MUI v9 component library | Supports React 17/18/19 per peer deps |
| `@emotion/react` | 11.14.0 [VERIFIED: npm registry] | MUI styling engine | Required peer dep |
| `@emotion/styled` | 11.14.1 [VERIFIED: npm registry] | MUI styled components | Required peer dep |
| `typescript` | 6.0.3 [VERIFIED: npm registry] | Type checking | Vite react-ts template includes it |
| `@types/react` | 19.2.17 [VERIFIED: npm registry] | React types | Still available; React 19 ships own types but @types/react still published |

**Scaffold command (for skill output instructions, verbatim from bf-prototype precedent):**
```
npm create vite@latest my-component -- --template react-ts && npm install @mui/material @emotion/react @emotion/styled
```

### React 19 forwardRef Clarification

`forwardRef` is NOT required in React 19. Refs are passed as regular props. `React.forwardRef()` still exists (no removal in 19.x) but is not needed for the wrapping pattern. Decision D-01 is confirmed. [VERIFIED: npm registry — `create-vite@9.0.7` with `--template react-ts` scaffolds `react: ^19.2.6`]

---

## Package Legitimacy Audit

Phase 5 installs no new packages — it creates a SKILL.md file. No package legitimacy gate required.

The packages listed above are referenced in skill output instructions only (the scaffold command the user runs). All are well-established packages with multi-year histories. No slopcheck verification needed for reference-only mentions.

---

## Architecture Patterns

### System Architecture Diagram

```
User types /bf-build (or describes a build task)
           │
           ▼
   bf-build/SKILL.md loaded by Claude
           │
           ▼
    Intake Gate
    ─────────────────────────────────────────────
    No description? → ask "What component?"
    Screen-level spec detected? → ask "Which component?"
    Description present? → proceed immediately
           │
           ▼
    Path Detection (MCP-first, no user choice)
    ─────────────────────────────────────────────
    Attempt get_variable_defs
    Attempt get_design_context
    │                          │
    MCP succeeded              MCP returned nothing
    (Path A)                   AND spec file referenced
                               (Path B)
           │                          │
           ▼                          ▼
    Path A: Read frame         Path B: Read spec-[name].md
    live token values          H2 component heading
    component structure        Sub-components auto-read
    derive component name      cross-referenced spec files
           │                          │
           └──────────┬───────────────┘
                      ▼
           Generate TypeScript Component
           ─────────────────────────────
           interface Bluefish[Name]Props extends [MUI]Props
           function Bluefish[Name](props) wraps MUI component
           Inline token annotations (dual-path DATA-03)
           ARIA props required
           ⚠️ flags for gaps
                      │
                      ▼
           8-point pre-return checklist
                      │
                      ▼
           Write Bluefish[ComponentName].tsx to ./
```

### Recommended File Layout

```
~/dev/bluefish-ai-skills/
├── bf-build/
│   └── SKILL.md          ← Phase 5 creates this
├── bf-explore/
│   └── SKILL.md
├── bf-prototype/
│   └── SKILL.md
├── bf-spec/
│   └── SKILL.md
├── bluefish-design-system/
│   ├── SKILL.md
│   ├── tokens.md
│   ├── type-styles.md
│   ├── tokens-dataviz.md
│   ├── figma-reading-guide.md
│   ├── spec-template.md
│   ├── spec-button.md
│   ├── spec-autocomplete.md
│   └── spec-chip.md, spec-text-field.md
└── README.md              ← Phase 5 updates this
```

### Pattern 1: SKILL.md Section Order

All command skills use this section order. bf-build MUST follow it:

1. Frontmatter (`name:`, `description:`) + closing `---`
2. `@~/.claude/skills/bluefish-design-system/SKILL.md` (inline @include)
3. Fallback blockquote (portability — if @include failed, instruct manual read)
4. `# bf-build` heading + one-paragraph summary
5. `## Support Files — Read On Demand`
6. `## Intake`
7. `## Figma Context — Always Attempt First` (Path A)
8. `## Path B — Spec File Parsing` (new to bf-build; no analog in bf-spec/bf-prototype)
9. `## Output Rules`
10. `## Anti-Patterns — Do Not Do These`

The `## Path B — Spec File Parsing` section is new — bf-spec and bf-prototype have no equivalent because they don't parse spec files. This is where the H2/H3 structure parsing rules, cross-spec auto-read logic, and screen-level intake question live.

### Pattern 2: Frontmatter Description

Established pattern from prior skills:

```yaml
---
name: bf-build
description: >
  Generates a production-ready TypeScript React/MUI component file from a Figma frame or
  existing spec file. Use when the user types /bf-build or asks to build, implement, or
  generate production code for a Bluefish component. Output: a single .tsx file written
  to the working directory. Not for prototypes (use bf-prototype), layout explorations
  (use bf-explore), or specs (use bf-spec).
---
```

Key requirements for this description:
- Must explicitly claim "build", "implement", "generate production code" — these are the trigger anchors released from the interim routing
- Must NOT say "planned, not yet available"
- Must have "not for..." exclusions pointing to the other three skills [CITED: existing skill frontmatter pattern verified by reading all four live SKILL.md files]

### Pattern 3: @include + Fallback Blockquote

```markdown
@~/.claude/skills/bluefish-design-system/SKILL.md

> If the foundation content from `bluefish-design-system` did not load above, Read
> `~/.claude/skills/bluefish-design-system/SKILL.md` before proceeding.
```

Verbatim from bf-spec and bf-prototype. Copy exactly. [CITED: live skill files verified 2026-06-12]

### Pattern 4: TypeScript Component Structure

The output `.tsx` file bf-build generates follows this structure:

```tsx
// Source: MUI wrapping pattern (foundation SKILL.md Code Output section)
import Button, { type ButtonProps } from '@mui/material/Button';

interface BluefishButtonProps extends ButtonProps {
  // Additional Bluefish-specific props here if needed
}

export function BluefishButton(props: BluefishButtonProps) {
  const { ...rest } = props;
  return (
    <Button
      {...rest}
      sx={{
        // If tokens inject as MUI theme extensions:
        backgroundColor: 'primary.main', // color-roles/primary/main
        // If tokens inject as CSS custom properties:
        // backgroundColor: 'var(--color-roles-primary-main)', // color-roles/primary/main
        /* ⚠️ token injection method unconfirmed — verify with eng */
        borderRadius: 'var(--scale-radius-sm)', // scale/radius/sm
        /* ⚠️ token injection method unconfirmed — verify with eng */
        ...props.sx,
      }}
    />
  );
}
```

[CITED: foundation SKILL.md Code Output section, bf-prototype Vite+MUI mode rules]

Key rules for the generated file:
- Named export (`export function Bluefish[Name]`) — not default export
- Interface extends the correct MUI props type (e.g., `ButtonProps`, `AutocompleteProps`)
- `import type {}` for MUI type-only exports
- Dual-path token comments with `⚠️` flag on every `sx` token reference
- ARIA props included (required, never optional)
- Filename: `Bluefish[ComponentName].tsx` — PascalCase, Bluefish prefix
- Written to `./` (user's CWD) — NOT to `~/.claude/skills/`

### Pattern 5: Path B Spec Parsing Structure

Path B reads a `spec-[component].md` file from the user's `./`. The H2/H3 structure is confirmed reliable:

```
## [Component Name]          ← component name + output filename source

**Category:** [...]
**Status:** [...]

### Variants & States        ← drives prop types and default states
### Props                    ← drives TypeScript interface props
### Tokens Used              ← drives sx token references
### Type Styles              ← drives typography annotations
### Accessibility            ← drives ARIA props (required, never blank)
### Figma Reference          ← informational only
### Sub-component: [Name]    ← recurse, potentially auto-read cross-spec
### Notes                    ← architecture notes, gaps
```

When a `### Sub-component: [Name]` section contains a note like "full spec in `spec-text-field.md`": **auto-read `spec-text-field.md` from `./` before generating the sub-component code**. Do not prompt the user. [CITED: spec-autocomplete.md verified by reading the live file 2026-06-12]

### Pattern 6: Screen-Level Spec Handling

A screen-level spec file (generated by `/bf-spec` in screen mode) starts with:
```markdown
# Spec: [Screen Name]
**Generated:** [date]
**Source:** [page]

## Component Inventory
| Component | Category | MUI Equivalent | Section |
```

When bf-build detects a `## Component Inventory` table at the top of a Path B spec file, it must:
1. Present the inventory to the user (quote the table)
2. Ask exactly: "Which component should I build?"
3. Generate ONE `.tsx` file for the selected component only

### Anti-Patterns to Avoid

- **Asking the user to choose Path A or Path B** — path is inferred automatically (MCP-first; fall back to spec file if MCP empty and spec referenced)
- **Using `get_metadata` in bf-build** — that is bf-spec's sequence. bf-build filename comes from component name, not frame name
- **Generating scaffold files** (main.tsx, App.tsx, index.html) — bf-build output is the component `.tsx` file only; production code, not a runnable app
- **Writing the output file to `~/.claude/skills/`** — component files go to user's `./`; the skills directory is for reference examples only
- **Single-path token output** — DATA-03 is still unresolved; both forms required with `⚠️` flag
- **Calling `get_variable_defs` multiple times per session** — call once; reuse values for all sub-components

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Token rules, accessibility standards | Custom rule set | Foundation SKILL.md via @include | Foundation is the single source of truth; bf-build inherits it completely |
| MUI type exports | Custom type definitions | `import type {}` from `@mui/material/[Component]` | MUI ships correct types; hand-rolling causes drift |
| Figma-to-token mapping | Custom mapping logic | `figma-reading-guide.md` (on-demand read) | figma-reading-guide.md Step 3 is the authoritative category/component mapping |
| Dataviz token paths | Inventing paths | `tokens.md` `color-roles/dataviz` table | Handoff review found invented paths caused wrong/inaccessible chart colors |
| 8-point pre-return checklist | Custom checklist | Foundation pre-return checklist (reference it, don't restate it) | Checklist is maintained in foundation; restating causes drift |

**Key insight:** bf-build authors skill instructions, not runtime logic. Every "don't hand-roll" risk here is a risk of bf-build's SKILL.md instructing Claude to invent things that already have authoritative sources.

---

## Routing Reclaim — Enumerated Edit Targets

This is the D-13 concrete task. Exactly 7 edits across 4 files:

| File | Location | Current Text | Replacement |
|------|----------|--------------|-------------|
| `bf-prototype/SKILL.md` | Frontmatter description, line 8 | `(bf-build — planned, not yet available).` | `(use bf-build).` |
| `bf-prototype/SKILL.md` | Anti-patterns section, ~line 198 | "Until `/bf-build` ships, the foundation skill handles build requests; offer this skill explicitly if the user wants something prototype-grade now." | "Use `/bf-build` for production component output." |
| `bf-spec/SKILL.md` | Frontmatter description, line 8 | `(bf-build — planned, not yet available).` | `(use bf-build).` |
| `bf-spec/SKILL.md` | Anti-patterns section, ~line 257-258 | "Until `/bf-build` ships, the foundation skill handles build requests." | "Use `/bf-build` for production component output." |
| `bluefish-design-system/SKILL.md` | Frontmatter description, lines 7-8 | `— including build and implementation requests until the dedicated bf-build skill ships.` | Remove this clause entirely; end the description at "code output standards." |
| `bluefish-design-system/SKILL.md` | Known Gaps, line 194 | `- [ ] No '/bf-build' skill yet — build/implement requests are handled by this foundation...` | Remove this line entirely |
| `README.md` | Known limitations, line 74 | `- **No '/bf-build' yet** — production React/MUI component generation is planned...` | Replace with a `/bf-build` entry in the skills table and usage section |

**README also needs:** Add `bf-build` to the Skills table (new row), add a `/bf-build` usage example to the Usage section, add the install `cp -r bf-build ~/.claude/skills/` step. [CITED: README.md read 2026-06-12 — current table has 4 skills, needs 5th row]

**Symlink creation command:**
```bash
ln -s /Users/pcartelli/dev/bluefish-ai-skills/bf-build ~/.claude/skills/bf-build
```
Pattern confirmed by inspecting existing symlinks: `bf-spec -> /Users/pcartelli/dev/bluefish-ai-skills/bf-spec` (absolute path, no trailing slash). [VERIFIED: `ls -la ~/.claude/skills/` output 2026-06-12]

---

## Common Pitfalls

### Pitfall 1: Invented Token Paths

**What goes wrong:** SKILL.md instructs Claude to emit token paths that don't exist (e.g., the review found `color-dataviz/categorical/*` in bf-prototype before the fix).
**Why it happens:** Claude generates plausible-sounding paths from training data rather than reading the authoritative source.
**How to avoid:** SKILL.md must explicitly instruct "read `tokens.md` for dataviz token paths" before generating any chart code. The on-demand read instruction must be specific and non-optional for dataviz components.
**Warning signs:** Any `color-dataviz/` prefix (wrong); any `categorical/` in token paths (wrong); nested paths like `color-roles/primary/500` (wrong — raw palette, not semantic).

### Pitfall 2: Wrong MCP Sequence

**What goes wrong:** bf-build inadvertently copies bf-spec's `get_metadata`-first pattern.
**Why it happens:** bf-spec is the direct structural analog; its Figma Context section starts with `get_metadata`. bf-build's Path A sequence is `get_variable_defs` + `get_design_context` (same as bf-prototype) — no `get_metadata`.
**How to avoid:** The SKILL.md `## Figma Context` section must explicitly list ONLY `get_variable_defs` + `get_design_context`. No `get_metadata`. Add an anti-pattern entry: "Calling `get_metadata` is the bf-spec sequence — bf-build does not call it."
**Warning signs:** Any mention of `get_metadata` in bf-build's Figma Context section.

### Pitfall 3: Output Scope Creep

**What goes wrong:** SKILL.md instructs Claude to emit main.tsx, App.tsx, index.html alongside the component — copying bf-prototype's output pattern.
**Why it happens:** bf-prototype is the code output analog; its output rules describe full scaffold files.
**How to avoid:** Output rules section must say explicitly: "One `.tsx` file only — the component file. Do NOT emit main.tsx, App.tsx, index.html, or scaffold commands."
**Warning signs:** D-08 is clear: component file only. Production code, not runnable prototype.

### Pitfall 4: Screen-Level Spec Silent Failure

**What goes wrong:** Path B receives a screen-level spec with a Component Inventory table, and Claude generates code for all components or silently picks one.
**Why it happens:** No intake gate for the screen-level case; Claude completes the task without surfacing the ambiguity.
**How to avoid:** SKILL.md Path B section must have an explicit rule: "If the spec file contains `## Component Inventory`, present the inventory table and ask 'Which component should I build?' before generating anything."
**Warning signs:** Multi-component output from a single `/bf-build` invocation.

### Pitfall 5: Cross-Spec Auto-Read Missing

**What goes wrong:** For a composite component like Autocomplete, the sub-component section says "full spec in `spec-text-field.md`" but Claude generates the TextField sub-component from training data instead of reading the spec.
**Why it happens:** The auto-read instruction in the SKILL.md isn't explicit enough; Claude treats the reference note as informational.
**How to avoid:** Path B section must say: "When a `### Sub-component` section references another spec file (e.g., 'see spec-text-field.md'), **read that file from `./` before generating the sub-component code**. This read is silent — do not prompt the user."
**Warning signs:** Sub-component tokens or props that don't match what's in the referenced spec file.

### Pitfall 6: Routing Reclaim Partial Completion

**What goes wrong:** Only the new bf-build skill is created, but the "bf-build — planned, not yet available" language remains in other skills' descriptions.
**Why it happens:** The routing reclaim edits are easy to miss as "optional cleanup."
**How to avoid:** D-13 is a concrete plan task, not optional. All 7 edits are required before the phase passes BUILD-02. Until the foundation's description stops claiming it handles build requests, two skills compete for the same trigger.
**Warning signs:** `grep -r "bf-build.*planned\|not yet available" ~/.claude/skills/` returns any results after Phase 5 completes.

---

## Code Examples

### Output File — Complete Pattern

```tsx
// Source: foundation SKILL.md Code Output section + bf-prototype Vite+MUI Mode rules
// File: BluefishButton.tsx (written to ./)

import Button, { type ButtonProps } from '@mui/material/Button';

interface BluefishButtonProps extends ButtonProps {
  // No additional props for this component — extends ButtonProps fully
}

export function BluefishButton(props: BluefishButtonProps) {
  return (
    <Button
      {...props}
      sx={{
        // If tokens inject as MUI theme extensions:
        backgroundColor: props.variant === 'contained' ? 'primary.main' : undefined,
        // color-roles/primary/main
        // If tokens inject as CSS custom properties:
        // backgroundColor: props.variant === 'contained'
        //   ? 'var(--color-roles-primary-main)'
        //   : undefined,
        /* ⚠️ token injection method unconfirmed — verify with eng */
        borderRadius: 'var(--scale-radius-sm)', // scale/radius/sm
        /* ⚠️ token injection method unconfirmed — verify with eng */
        ...props.sx,
      }}
    />
  );
}
```

### MCP-Unavailable Diagnostic (TSX format, analogous to bf-prototype)

```tsx
// Source: bf-prototype Vite+MUI mode Figma Context section
{/* ⚠️ Figma MCP unavailable — tokens from cached Bluefish reference (tokens.md, type-styles.md, tokens-dataviz.md); live values not verified */}
```

In bf-build, this should appear as a comment at the top of the generated `.tsx` file (not inside JSX).

### import type Pattern

```tsx
// Source: foundation SKILL.md, bf-prototype anti-patterns
// CORRECT:
import Autocomplete, { type AutocompleteProps } from '@mui/material/Autocomplete';
import Select, { type SelectChangeEvent } from '@mui/material/Select';

// INCORRECT (Vite runtime SyntaxError):
import Autocomplete, { AutocompleteProps } from '@mui/material/Autocomplete';
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `React.forwardRef()` wrapper required | Refs pass as regular props (React 19) | React 19.0 (2024) | No `forwardRef` boilerplate in bf-build output |
| bf-build "planned" interim routing | Foundation + other skills each claim build requests | Phase 4 review, Jun 2026 | 7 specific edits needed to reclaim routing |
| `color-dataviz/categorical/*` paths | `color-roles/dataviz/[NN]/[property]` from tokens.md | Review fix d0f29d2, Jun 2026 | SKILL.md must cite tokens.md for dataviz, never invent paths |
| Sub-component spec format informal | `### Sub-component: [Name]` sections confirmed canonical | Phase 4 review, Jun 2026 | Path B parser can rely on structure |
| MCP sequence includes `get_metadata` | bf-build uses `get_variable_defs` + `get_design_context` only | Decided in CONTEXT.md D-03 | Component name comes from conversation/response, not frame name |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `forwardRef` is not required in React 19 — refs pass as regular props | Standard Stack | Low: D-01 is locked. `forwardRef` still exists in React 19 so even if wrong, it's a style issue not a bug. Vite scaffold confirms React ^19.2.6 is the target. |
| A2 | MUI 9.x supports React 19 | Standard Stack | Low: `npm view @mui/material peerDependencies` shows `react: ^17.0.0 \|\| ^18.0.0 \|\| ^19.0.0`. [VERIFIED: npm registry] |
| A3 | Path B spec files always live in the user's `./` working directory | Architecture Patterns | Medium: CONTEXT.md code_context section says "Path B reads spec files in the user's `./`". Could be wrong if user invokes from a different dir. SKILL.md should say "from `./`" not hardcode a path. |

**If this table is near-empty:** All claims in this research were verified against live source files (all four existing SKILL.md files, npm registry, live directory listing) or locked decisions from CONTEXT.md.

---

## Open Questions

1. **README install instructions — symlink vs. cp**
   - What we know: Current README says `cp -r bf-explore ~/.claude/skills/`. Actual installation is via symlinks (confirmed by `ls -la ~/.claude/skills/`).
   - What's unclear: Should the README be updated to show the `ln -s` symlink approach for internal use, or keep the `cp` form for external team members who clone and don't have the `~/dev/` path?
   - Recommendation: Keep `cp -r` instructions in README (external-team-facing); use `ln -s` in the plan task for internal installation. This matches what the existing skills do.

2. **bf-build frontmatter `not yet available` vs. anti-patterns section**
   - What we know: Both bf-prototype and bf-spec have the interim language in two places: frontmatter description AND an anti-patterns body section.
   - What's unclear: The anti-patterns entries say "Until `/bf-build` ships, the foundation skill handles build requests" — after bf-build ships, this line should be updated to "Use `/bf-build` for production component output." The exact new wording should match the bf-build description's trigger language.
   - Recommendation: Planner should specify exact replacement text for each anti-pattern edit.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| `~/dev/bluefish-ai-skills/` git repo | File layout (phase 5 creates `bf-build/` here) | ✓ | commit d0f29d2 | — |
| `~/.claude/skills/` directory | Symlink target | ✓ | n/a | — |
| `ln` (symlink creation) | Symlink task | ✓ | macOS built-in | — |
| `bf-spec/SKILL.md` | Routing reclaim edit | ✓ | Verified 2026-06-12 | — |
| `bf-prototype/SKILL.md` | Routing reclaim edit | ✓ | Verified 2026-06-12 | — |
| `bluefish-design-system/SKILL.md` | Routing reclaim edit + @include source | ✓ | Verified 2026-06-12 | — |
| `README.md` | Routing reclaim edit | ✓ | Verified 2026-06-12 | — |

**Missing dependencies with no fallback:** None.

---

## Validation Architecture

> `nyquist_validation` is explicitly `false` in `.planning/config.json` — this section is skipped.

---

## Security Domain

This phase has no security surface. It creates a SKILL.md text file and edits existing SKILL.md files. No network calls, no data storage, no auth, no user input processing. Security domain section is not applicable.

---

## Sources

### Primary (HIGH confidence)

- Live SKILL.md files read directly: `bf-spec/SKILL.md`, `bf-prototype/SKILL.md`, `bf-explore/SKILL.md`, `bluefish-design-system/SKILL.md` — all verified 2026-06-12 via Read tool
- Live spec example files: `spec-autocomplete.md`, `spec-button.md` — verified 2026-06-12
- `spec-template.md` — field mapping and output structure verified 2026-06-12
- npm registry: `create-vite@9.0.7`, `react@19.2.7`, `@mui/material@9.1.1`, `@types/react@19.2.17` — all verified via `npm view` 2026-06-12
- `npm create vite@latest --template react-ts` — scaffolded to temp dir; confirmed `react: ^19.2.6` in package.json 2026-06-12
- `ls -la ~/dev/bluefish-ai-skills/` and `ls -la ~/.claude/skills/` — directory structure verified 2026-06-12
- `grep` on all four skill files for routing reclaim targets — line numbers confirmed 2026-06-12
- `.planning/config.json` — `nyquist_validation: false` confirmed 2026-06-12

### Secondary (MEDIUM confidence)

- `05-HANDOFF.md` — post-Phase-4 context including review-fix decisions (binding per CONTEXT.md)
- `05-CONTEXT.md` — locked decisions from discuss-phase (authoritative for this planning session)

### Tertiary (LOW confidence)

- None. All claims were verified against live source files or locked decisions.

---

## Metadata

**Confidence breakdown:**
- Skill structure: HIGH — all analog SKILL.md files read; section order, wording conventions, @include pattern all verified
- Routing reclaim targets: HIGH — grep-confirmed with line numbers on all 4 files
- React 19 / package versions: HIGH — verified via npm registry + live scaffold
- Path B parsing rules: HIGH — spec-autocomplete.md and spec-template.md read directly
- TypeScript component template: HIGH — foundation Code Output section + bf-prototype rules are the authoritative sources; both read

**Research date:** 2026-06-12
**Valid until:** 2026-09-12 (stable skill/npm ecosystem; MUI/React versions may advance but the patterns are stable)
