# Phase 5: bf-build — Pattern Map

**Mapped:** 2026-06-12
**Files analyzed:** 6 (1 new SKILL.md + 1 symlink + 4 edits)
**Analogs found:** 6 / 6

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `~/dev/bluefish-ai-skills/bf-build/SKILL.md` | skill-instruction | request-response | `~/.claude/skills/bf-spec/SKILL.md` | exact (same role, same MCP-first + fallback flow) |
| `~/.claude/skills/bf-build` (symlink) | config | — | existing `~/.claude/skills/bf-spec` symlink | exact |
| `~/dev/bluefish-ai-skills/bf-prototype/SKILL.md` | skill-instruction (edit) | request-response | self | n/a — targeted line edits |
| `~/dev/bluefish-ai-skills/bf-spec/SKILL.md` | skill-instruction (edit) | request-response | self | n/a — targeted line edits |
| `~/dev/bluefish-ai-skills/bluefish-design-system/SKILL.md` | skill-instruction (edit) | request-response | self | n/a — targeted line edits |
| `~/dev/bluefish-ai-skills/README.md` | documentation (edit) | — | self | n/a — targeted block replacement |

---

## Pattern Assignments

### `~/dev/bluefish-ai-skills/bf-build/SKILL.md` (skill-instruction, request-response)

**Primary analog:** `~/.claude/skills/bf-spec/SKILL.md`
**Secondary analog:** `~/.claude/skills/bf-prototype/SKILL.md` (code output rules, Vite+MUI patterns)

---

#### Frontmatter pattern
**Source:** `~/.claude/skills/bf-spec/SKILL.md` lines 1–9; `~/.claude/skills/bf-prototype/SKILL.md` lines 1–9

Both prior command skills use this exact frontmatter shape. bf-build MUST follow it. The `description:` field uses a `>` block scalar and ends with explicit "not for..." exclusions naming the other skills.

```yaml
---
name: bf-spec
description: >
  Generates a structured engineering handoff spec from a Figma screen or component.
  Use when the user types /bf-spec or asks for a spec, engineering handoff doc, or
  component inventory for a Bluefish screen or component. Not for prototypes (use
  bf-prototype), layout explorations (use bf-explore), or production code (bf-build —
  planned, not yet available).
---
```

**bf-build adaptation (verbatim from RESEARCH.md Pattern 2):**
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

Key: claim "build", "implement", "generate production code" as triggers. Never say "planned, not yet available". Include "not for..." exclusions.

---

#### @include + fallback blockquote pattern
**Source:** `~/.claude/skills/bf-spec/SKILL.md` lines 11–14; `~/.claude/skills/bf-prototype/SKILL.md` lines 11–14

These two lines are verbatim identical in all command skills. Copy exactly — no variation.

```markdown
@~/.claude/skills/bluefish-design-system/SKILL.md

> If the foundation content from `bluefish-design-system` did not load above, Read
> `~/.claude/skills/bluefish-design-system/SKILL.md` before proceeding.
```

---

#### Summary paragraph pattern
**Source:** `~/.claude/skills/bf-spec/SKILL.md` lines 16–23; `~/.claude/skills/bf-prototype/SKILL.md` lines 16–18

Pattern: `# [skill-name]` heading, then a single paragraph that (a) states what the skill generates, (b) names the two intake paths or modes if applicable, (c) says "Inherits all Bluefish foundation context ... from `bluefish-design-system` via the `@include` above", (d) states what this skill owns specifically.

```markdown
# bf-spec

Generates a structured engineering handoff spec for a Bluefish screen or component. Operates
in two modes inferred from the Figma selection: screen mode (component inventory + per-component
sections in one file) or component mode (single component spec file). Inherits all Bluefish
foundation context (token rules, accessibility standards, Figma MCP setup, component map) from
`bluefish-design-system` via the `@include` above. This skill owns the spec generation workflow
only — scope inference, MCP sequence, output rules per mode, and sub-component recursion.
```

**bf-build adaptation:** Replace "engineering handoff spec" with "production TypeScript React/MUI component file", replace "two modes" with "two intake paths (Path A: Figma MCP; Path B: spec file)", and replace owned-scope clause with "intake detection, MCP sequence, Path B spec parsing, output rules, and anti-patterns."

---

#### Support Files — Read On Demand pattern
**Source:** `~/.claude/skills/bf-spec/SKILL.md` lines 25–33; `~/.claude/skills/bf-prototype/SKILL.md` lines 20–27

Section heading is always `## Support Files — Read On Demand`. Opener is always "Do not read these at skill start. Read them only when the task requires it:". Four bullets, each starting "Read `~/.claude/skills/bluefish-design-system/[file]` when [condition]."

```markdown
## Support Files — Read On Demand

Do not read these at skill start. Read them only when the task requires it:

- Read `~/.claude/skills/bluefish-design-system/tokens.md` when resolving color, spacing, or radius token paths
- Read `~/.claude/skills/bluefish-design-system/type-styles.md` when populating the Type Styles section of a spec
- Read the `color-roles/dataviz` table in `~/.claude/skills/bluefish-design-system/tokens.md` when speccing dataviz components (`tokens-dataviz.md` is the raw source palette — only for gradients and custom tints)
- Read `~/.claude/skills/bluefish-design-system/figma-reading-guide.md` when interpreting Figma MCP output or inferring component categories
```

**bf-build adaptation:** Replace triggering conditions with component-generation equivalents (e.g., "when generating color or spacing token references in sx props" instead of "when resolving...token paths"). The four files and their roles stay identical.

---

#### Intake section pattern
**Source:** `~/.claude/skills/bf-spec/SKILL.md` lines 34–51; `~/.claude/skills/bf-prototype/SKILL.md` lines 29–41

Section heading: `## Intake`. Each skill defines a different intake gate. bf-spec never asks a mode question (infers from MCP); bf-prototype always asks first. bf-build has a third flavor: MCP-first path detection with no user choice, plus a bare-invocation question and a screen-level spec gate.

bf-spec bare-invocation pattern (for adaptation):
```markdown
**If invoked bare** (`/bf-spec` with no accompanying context): call `get_metadata` first —
the user's Figma selection is the answer to what is being specced. If it returns a meaningful
selection, proceed without asking anything. Only if it returns empty or nil AND there is no
prior conversation context, ask exactly one question:

> "What screen or component are you speccing?"
```

**bf-build adaptation:**
- If invoked bare with no component description: ask exactly one question ("What component should I build?")
- If invoked with a description: proceed immediately to MCP sequence
- Screen-level spec detection gate goes in `## Path B — Spec File Parsing`, not here
- Never ask the user to choose Path A or Path B

---

#### Figma Context — Always Attempt First pattern
**Source:** `~/.claude/skills/bf-spec/SKILL.md` lines 54–103; `~/.claude/skills/bf-prototype/SKILL.md` lines 44–71

Section heading: `## Figma Context — Always Attempt First`. Both skills share: preamble "Before generating any output, always attempt Figma MCP calls...", numbered MCP call sequence, Code Connect fallback inline-flag rule, token drift rule, Fallback section (when MCP fails), MCP-unavailable diagnostic (required blockquote).

**bf-prototype MCP sequence (2 calls — the bf-build model)** (lines 46–50):
```markdown
1. Call `get_variable_defs` — pulls live token values. These are authoritative and take precedence over `tokens.md` for color and scale values.
2. Call `get_design_context` — reads component/frame structure.
3. If either call triggers a Code Connect prompt: note it inline with `⚠️ Code Connect not configured — proceeding from conversation context` and continue with whatever data was returned before the prompt.
```

**bf-prototype token drift rule** (lines 51–54):
```markdown
**Token drift:** If a value returned by `get_variable_defs` differs from the same path in `tokens.md`, use the live Figma value and flag the drift inline:
```css
var(--color-roles-primary-main); /* color-roles/primary/main — live: #005566, tokens.md: #00414F ⚠️ token drift — using live Figma value */
```

**MCP-unavailable diagnostic — bf-prototype Vite+MUI form** (lines 67–69):
```tsx
{/* ⚠️ Figma MCP unavailable — tokens from cached Bluefish reference (tokens.md, type-styles.md, tokens-dataviz.md); live values not verified */}
```

**bf-build adaptation:** Use bf-prototype's 2-call sequence (`get_variable_defs` + `get_design_context`) — NOT bf-spec's 3-call sequence (which starts with `get_metadata`). MCP-unavailable diagnostic in bf-build goes as a `//` comment at the top of the generated `.tsx` file (not inside JSX, not in a markdown blockquote). Anti-pattern must explicitly state: "Calling `get_metadata` is the bf-spec sequence — bf-build does not call it."

---

#### Path B — Spec File Parsing pattern (NEW section — no direct analog)

This section has no direct analog in bf-spec or bf-prototype. Structure it with four subsections:

1. **Spec file format (H2/H3 structure)** — document the reliable parse structure from RESEARCH.md Pattern 5
2. **Cross-spec auto-read** — when `### Sub-component` references another spec file, read it silently
3. **Screen-level spec gate** — if `## Component Inventory` detected, present inventory and ask "Which component should I build?"
4. **Component name derivation** — extract from the `## [Component Name]` H2 heading

Reference structure to document (from RESEARCH.md Pattern 5):
```
## [Component Name]          ← component name + output filename source
### Variants & States        ← drives prop types and default states
### Props                    ← drives TypeScript interface props
### Tokens Used              ← drives sx token references
### Type Styles              ← drives typography annotations
### Accessibility            ← drives ARIA props (required, never blank)
### Figma Reference          ← informational only
### Sub-component: [Name]    ← recurse; potentially auto-read cross-spec
### Notes                    ← architecture notes, gaps
```

Cross-spec auto-read rule (exact wording per RESEARCH.md Pitfall 5): "When a `### Sub-component` section references another spec file (e.g., 'see spec-text-field.md'), **read that file from `./` before generating the sub-component code**. This read is silent — do not prompt the user."

Screen-level spec gate (exact wording per RESEARCH.md Pattern 6): If the spec file contains `## Component Inventory`, present the inventory table and ask exactly: "Which component should I build?"

---

#### Output Rules pattern
**Source:** `~/.claude/skills/bf-prototype/SKILL.md` lines 134–204 (Vite+MUI Scaffold Mode rules); `~/.claude/skills/bluefish-design-system/SKILL.md` lines 125–172 (Code Output section)

bf-prototype's Vite+MUI rules define the output conventions that bf-build adapts. Critical rules to copy and adapt:

**MUI wrapping pattern** (bf-prototype line 154):
```markdown
**MUI wrapping pattern (from foundation)**: Create named custom components that wrap MUI components internally. Example: `function BluefishButton(props) { return <Button {...props} /> }`. Do not use raw MUI components unwrapped.
```

**`import type {}` rule** (bf-prototype lines 178–180):
```markdown
**Type-only MUI imports**: MUI type exports MUST use `import type {}`. Vite throws a runtime SyntaxError if they are imported as values. Required pattern:
- CORRECT: `import Select, { type SelectChangeEvent } from '@mui/material/Select'`
- INCORRECT: `import Select, { SelectChangeEvent } from '@mui/material/Select'`
```

**Dual-path token output** (bf-prototype lines 170–176):
```tsx
// If tokens inject as MUI theme extensions:
sx={{ color: theme.palette.primary.main }} // color-roles/primary/main
// If tokens inject as CSS custom properties:
sx={{ color: 'var(--color-roles-primary-main)' }} // color-roles/primary/main
/* ⚠️ token injection method unconfirmed — verify with eng */
```

**Foundation 8-point pre-return checklist reference** (bluefish-design-system/SKILL.md lines 158–172):
```markdown
**Before returning code, verify:**
1. All color values use `color-roles/...` paths — no hex values
2. All spacing values use `scale/...` paths — no px literals
3. All typography uses top-level type styles only (no `web/` prefix, no nested `/` in style name)
4. If using token paths as literal strings, flagged with `/* ⚠️ token injection method unconfirmed — verify with eng */`
5. All interactive elements include required ARIA props (see Accessibility table)
6. Known-gap values flagged with `/* ⚠️ */` comments where applicable
7. MUI type-only exports use `import type { ... }`
8. Call `get_screenshot` for the original Figma node. Compare rendered output against it visually.
```

**bf-build Output Rules section differences from bf-prototype:**
- Output is ONE `.tsx` file only — no main.tsx, App.tsx, index.html, no scaffold command output
- Filename: `Bluefish[ComponentName].tsx` (PascalCase, Bluefish prefix), written to `./`
- Named export (`export function Bluefish[Name]`) — not default export
- Interface extends the correct MUI props type: `interface Bluefish[Name]Props extends [MUI]Props`
- MCP-unavailable diagnostic is a `//` comment at top of the `.tsx` file, before imports
- Typography annotation format: `/* type: H1 */` inline on sx prop, top-level style names only

**Complete TypeScript component structure to replicate** (from RESEARCH.md Pattern 4 + Code Examples):
```tsx
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

---

#### Anti-Patterns section pattern
**Source:** `~/.claude/skills/bf-spec/SKILL.md` lines 222–269; `~/.claude/skills/bf-prototype/SKILL.md` lines 190–204

Section heading: `## Anti-Patterns — Do Not Do These`. Each bullet is bold-titled with a description. bf-build's anti-patterns list combines items from both analogs plus three new items specific to bf-build (from RESEARCH.md Anti-Patterns section):

Key anti-patterns to include (with sources):
- "Asking the user to choose Path A or Path B" — path is inferred automatically (new to bf-build)
- "Calling `get_metadata` in bf-build" — that is bf-spec's sequence (new to bf-build, Pitfall 2)
- "Generating scaffold files (main.tsx, App.tsx, index.html)" — component file only (new, Pitfall 3)
- "Writing the output file to `~/.claude/skills/`" — adapted from bf-spec lines 249–252
- "Single-path token output" — adapted from bf-prototype line 197
- "Re-calling `get_variable_defs` per sub-component" — adapted from bf-spec line 232

---

### Routing Reclaim Edits (4 files)

These are targeted find-and-replace edits. Each is specified by the exact current text (grep-verified in RESEARCH.md) and exact replacement.

---

#### `~/dev/bluefish-ai-skills/bf-prototype/SKILL.md` — 2 edits

**Edit 1 — frontmatter description, line 8:**

Current text:
```
  (bf-build — planned, not yet available).
```
Replacement:
```
  (use bf-build).
```

**Edit 2 — anti-patterns section, line 198 (final bullet, partial):**

Current text (full sentence to replace):
```
Until `/bf-build` ships, the foundation skill handles build requests; offer this skill explicitly if the user wants something prototype-grade now.
```
Replacement:
```
Use `/bf-build` for production component output.
```

The surrounding bullet context (lines 197–198) for orientation:
```markdown
- **Trigger over-broadening on "build" / "implement" / "create"**: These phrases belong to the planned `/bf-build` skill. The discriminating trigger anchors are "prototype", "working prototype", and "clickable/interactive mockup" — not generic task verbs. Until `/bf-build` ships, the foundation skill handles build requests; offer this skill explicitly if the user wants something prototype-grade now.
```

---

#### `~/dev/bluefish-ai-skills/bf-spec/SKILL.md` — 2 edits

**Edit 1 — frontmatter description, line 8:**

Current text:
```
  planned, not yet available).
```
(Full line: `  bf-build — planned, not yet available).`)
Replacement:
```
  use bf-build).
```

**Edit 2 — anti-patterns section, lines 257–258 (final bullet, partial):**

Current text (sentence to replace at end of last bullet):
```
Until `/bf-build` ships, the foundation skill handles build requests.
```
Replacement:
```
Use `/bf-build` for production component output.
```

The surrounding bullet context (lines 255–258) for orientation:
```markdown
- **Triggering on "build" or "implement"**: These phrases belong to the planned `/bf-build`
  skill. The bf-spec trigger anchors are "spec", "handoff doc", "engineering spec",
  "component inventory". The frontmatter `description:` field MUST exclude "build" and
  "implement" as standalone triggers. Until `/bf-build` ships, the foundation skill handles
  build requests.
```

---

#### `~/dev/bluefish-ai-skills/bluefish-design-system/SKILL.md` — 2 edits

**Edit 1 — frontmatter description, lines 7–8:**

Current text (lines 6–9 for context):
```yaml
  Activates for any question about the Bluefish design system that is not a
  specific explore, prototype, or spec task — including build and implementation
  requests until the dedicated bf-build skill ships.
```
Replace lines 7–8 with — remove the "— including build and implementation requests until the dedicated bf-build skill ships" clause. End the description at "code output standards." Full replacement block:
```yaml
description: >
  Bluefish design system reference. Use for token lookups, accessibility rules,
  Figma variable reading, component conventions, and code output standards.
  Activates for any question about the Bluefish design system that is not a
  specific explore, prototype, spec, or build task.
```

**Edit 2 — Known Gaps section, line 194:**

Current text:
```markdown
- [ ] No `/bf-build` skill yet — build/implement requests are handled by this foundation (apply token + accessibility rules directly; offer bf-prototype for scaffolding) until Phase 5 ships.
```
Remove this line entirely. (The line immediately above is the Code Connect gap; the line immediately below is the `get_variable_defs` node-scope gap — neither should be disturbed.)

---

#### `~/dev/bluefish-ai-skills/README.md` — 1 block replacement

**Edit 1 — Known limitations section, line 74:**

Current text:
```markdown
- **No `/bf-build` yet** — production React/MUI component generation is planned. Until it ships, build requests are handled by the foundation skill's token and accessibility rules, with `bf-prototype` available for prototype-grade scaffolding.
```
Replace with:
```markdown
- **`/bf-build` output is a component file only** — no scaffold, no App.tsx, no main.tsx. Drop the generated `.tsx` file into your Vite+MUI project.
```

**Additional README changes (same edit task):** The planner must also add:
1. A `bf-build` row to the Skills table (after the `bf-spec` row):
   ```markdown
   | `bf-build` | `/bf-build` | Generates a production-ready TypeScript React/MUI component file from a Figma frame or spec file |
   ```
2. A `/bf-build` usage example to the Usage section (after the `/bf-spec` example):
   ```markdown
   **Build a production component:**
   ```
   /bf-build the Button component
   ```
   Claude reads the Figma frame via MCP (or parses `spec-button.md` if present) and writes `BluefishButton.tsx` to your working directory.
   ```
3. A `cp -r bf-build ~/.claude/skills/` install step in the Install section (after the `bf-spec` line).

---

## Shared Patterns

### @include + fallback blockquote (apply to bf-build/SKILL.md)
**Source:** `~/.claude/skills/bf-spec/SKILL.md` lines 11–14
```markdown
@~/.claude/skills/bluefish-design-system/SKILL.md

> If the foundation content from `bluefish-design-system` did not load above, Read
> `~/.claude/skills/bluefish-design-system/SKILL.md` before proceeding.
```
Verbatim. No variation. Appears immediately after the closing `---` of frontmatter, before the `# bf-build` heading.

---

### MCP-unavailable diagnostic phrasing (apply to bf-build/SKILL.md Figma Context section)
**Source:** `~/.claude/skills/bf-prototype/SKILL.md` lines 63–69
```
"tokens from cached Bluefish reference (tokens.md, type-styles.md, tokens-dataviz.md)"
```
Exact phrase. In bf-build, surface as a `//` comment at the top of the generated `.tsx` file:
```tsx
// ⚠️ Figma MCP unavailable — tokens from cached Bluefish reference (tokens.md, type-styles.md, tokens-dataviz.md); live values not verified
```

---

### ⚠️ flagging vocabulary (apply throughout bf-build/SKILL.md)
**Source:** `~/.claude/skills/bluefish-design-system/SKILL.md` lines 45–46, 64, 146–149; `~/.claude/skills/bf-prototype/SKILL.md` lines 53, 175
These exact strings must appear verbatim — do not paraphrase:
- `⚠️ Code Connect not configured — proceeding from conversation context`
- `⚠️ live token data unavailable — using tokens.md`
- `⚠️ no token for [value] — needs token`
- `⚠️ token drift — using live Figma value`
- `⚠️ token injection method unconfirmed — verify with eng`

---

### On-demand read pattern (apply to bf-build/SKILL.md Support Files section)
**Source:** `~/.claude/skills/bf-spec/SKILL.md` lines 25–33
"Do not read these at skill start. Read them only when the task requires it:" — exact opener. Four bullets citing `~/.claude/skills/bluefish-design-system/[file]`. The dataviz bullet must specify: `tokens-dataviz.md` is raw source palette only, for gradients/tints; `color-roles/dataviz` table in `tokens.md` is authoritative for chart series.

---

## No Analog Found

| File | Role | Data Flow | Reason |
|---|---|---|---|
| `## Path B — Spec File Parsing` section (within bf-build/SKILL.md) | skill-section | request-response | No prior skill parses spec files. New section; structure inferred from RESEARCH.md Pattern 5 and spec file examples |

Note: The section's content can be validated against `~/.claude/skills/bluefish-design-system/spec-autocomplete.md` and `spec-button.md` (reference spec examples showing the H2/H3 structure that Path B parses) — but those files describe the input to Path B, not the parser instructions.

---

## Metadata

**Analog search scope:** `~/.claude/skills/` (bf-spec, bf-prototype, bf-explore, bluefish-design-system), `~/dev/bluefish-ai-skills/README.md`
**Files read:** 6 (bf-spec/SKILL.md, bf-prototype/SKILL.md, bf-explore/SKILL.md lines 1–12, bluefish-design-system/SKILL.md, README.md, plus CONTEXT.md and RESEARCH.md)
**Pattern extraction date:** 2026-06-12
