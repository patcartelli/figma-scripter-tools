# Phase 2: /bf-explore - Pattern Map

**Mapped:** 2026-05-11
**Files analyzed:** 1 new file to create
**Analogs found:** 4 / 1 (multiple analogs for the single file)

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `~/.claude/skills/bf-explore/SKILL.md` | skill (command workflow) | request-response (text generation) | `~/.claude/skills/gsd-sketch/SKILL.md` | role-match |

**Secondary analogs ranked:**

| Analog | Match Type | Why Useful |
|--------|------------|------------|
| `~/.claude/skills/gsd-sketch/SKILL.md` | role-match (closest) | Produces 2–3 HTML variants; intake gate; same artifact type |
| `~/.claude/skills/gsd-explore/SKILL.md` | role-match | Socratic intake pattern; bare-invocation handling |
| `~/.claude/skills/bluefish-design-system/SKILL.md` | foundation (@include target) | Exact frontmatter format; token/a11y context inherited |
| `~/.claude/skills/gsd-ui-phase/SKILL.md` | role-match | Multi-@include composition; on-demand read pattern |

---

## Pattern Assignments

### `~/.claude/skills/bf-explore/SKILL.md` (skill, request-response)

**Primary analog:** `~/.claude/skills/gsd-sketch/SKILL.md`
**Foundation (inherited):** `~/.claude/skills/bluefish-design-system/SKILL.md`

---

#### Frontmatter pattern

**Source:** `~/.claude/skills/gsd-sketch/SKILL.md` (lines 1–17) + `~/.claude/skills/bluefish-design-system/SKILL.md` (lines 1–8)

The frontmatter uses YAML fencing, a `name:` field matching the command slug, and a `description:` field written as a **noun-phrase anchored to the artifact type** — not action verbs. The `allowed-tools:` list is optional; if omitted, Claude Code applies defaults.

```yaml
---
name: gsd-sketch
description: "Sketch UI/design ideas with throwaway HTML mockups, or propose what to sketch next (frontier mode)"
argument-hint: "[design idea to explore] [--quick] [--text] [--wrap-up] or [frontier]"
allowed-tools:
  - Read
  - Write
  ...
---
```

**For bf-explore, use the description pattern from RESEARCH.md Pattern 1 exactly** — the discriminating phrase "HTML layout variations" (plural) must appear. Do not use `argument-hint` (bf-explore has no structured argument). Do not use `allowed-tools` unless Figma MCP tools need to be enumerated:

```yaml
---
name: bf-explore
description: >
  Generates 2–3 meaningfully distinct HTML layout variations for a Bluefish screen.
  Use when the user asks for layout explorations, layout variations, or wants to see
  multiple HTML layout options for a Bluefish screen or component. Not for general
  design questions (use bluefish-design-system) or single prototype output (use bf-prototype).
---
```

---

#### @include composition pattern

**Source:** `~/.claude/skills/gsd-sketch/SKILL.md` (lines 33–40) + `~/.claude/skills/gsd-ui-phase/SKILL.md` (lines 24–27)

Command skills load dependencies via `@` directives in an `<execution_context>` block. Multiple `@` references are stacked vertically — each resolves and injects its content in order. No `@include` keyword is used; the `@path` syntax is the directive.

`gsd-sketch` example (lines 33–40):
```markdown
<execution_context>
@$HOME/.claude/get-shit-done/workflows/sketch.md
@$HOME/.claude/get-shit-done/workflows/sketch-wrap-up.md
@$HOME/.claude/get-shit-done/references/ui-brand.md
@$HOME/.claude/get-shit-done/references/sketch-theme-system.md
@$HOME/.claude/get-shit-done/references/sketch-interactivity.md
@$HOME/.claude/get-shit-done/references/sketch-tooling.md
@$HOME/.claude/get-shit-done/references/sketch-variant-patterns.md
</execution_context>
```

`gsd-ui-phase` example (lines 24–27):
```markdown
<execution_context>
@$HOME/.claude/get-shit-done/workflows/ui-phase.md
@$HOME/.claude/get-shit-done/references/ui-brand.md
</execution_context>
```

**For bf-explore** — the foundation is the only `@` reference. On-demand support files are NOT listed here; they are referenced as prose instructions in the skill body (RESEARCH.md Pattern 2). Note: Phase 2 CONTEXT.md uses the `@~/.claude/...` home-tilde form; RESEARCH.md confirms this is the established convention:

```markdown
@~/.claude/skills/bluefish-design-system/SKILL.md
```

The bf-explore SKILL.md uses a free-form markdown body rather than the `<execution_context>` XML tag pattern (which wraps a workflow file reference). Because bf-explore IS the workflow (no separate workflow file), the `@` directive appears directly at the top of the skill body, followed by inline prose sections.

---

#### Intake gate pattern

**Source:** `~/.claude/skills/gsd-sketch/SKILL.md` (lines 43–59) + `~/.claude/skills/gsd-explore/SKILL.md` (lines 14–22)

`gsd-sketch` uses `$ARGUMENTS` parsing with flag routing:
```markdown
<context>
Design idea: $ARGUMENTS
...
</context>

<process>
Parse the first token of $ARGUMENTS:
- If it is `--wrap-up`: ...
- Otherwise: execute the sketch workflow end-to-end.
</process>
```

`gsd-explore` uses an optional topic argument with implicit bare-invocation handling:
```markdown
Accepts an optional topic argument: `/gsd-explore authentication strategy`
```

**For bf-explore** — no `$ARGUMENTS` flag routing is needed (D-03/D-04). The intake gate is binary: context present → generate; bare invocation → ask one question. Copy this prose pattern for the skill body:

```markdown
## Intake

**If the user provided a screen or component description** (in the /bf-explore message or in
prior conversation context): proceed immediately to generation.

**If invoked bare** (`/bf-explore` with no accompanying context): ask one question:
> "What screen or component are we exploring?"

Do not ask additional questions. Generate 2–3 variations after receiving the response.
```

---

#### On-demand support file read pattern

**Source:** `~/.claude/skills/bluefish-design-system/SKILL.md` (lines 56–57) + RESEARCH.md Pattern 2

The foundation skill demonstrates the on-demand read instruction for its own support files:
```markdown
When generating code, read `tokens.md` for complete color, spacing, and radius token paths.
When generating code or speccing typography, read `type-styles.md`. When generating code or
specs involving data visualization, read `tokens-dataviz.md`.
```

**For bf-explore** — this pattern is extended into an explicit named section in the skill body (RESEARCH.md Pattern 2). Support file paths are absolute:

```markdown
## Support Files — Read On Demand

Do not read these at skill start. Read them only when the task requires it:

- Read `~/.claude/skills/bluefish-design-system/tokens.md` when generating CSS token values
- Read `~/.claude/skills/bluefish-design-system/type-styles.md` when setting typography
- Read `~/.claude/skills/bluefish-design-system/figma-reading-guide.md` when interpreting Figma MCP output
```

---

#### Token annotation pattern (EXPL-03)

**Source:** `explorations/variation-a.html` (lines 1–68) — the `:root` block and CSS body

The reference files establish the CSS custom property naming convention and `:root` block structure. The `:root` block (lines 7–23 of variation-a.html) defines tokens with hex fallbacks:

```css
:root {
  --color-roles-background-default: #FFFFFF;
  --color-roles-background-level2: #F0F0F0;
  --color-roles-text-secondary: #575757;
  --color-roles-primary-main: #00414F;
  --color-roles-primary-50: #E0F3F8;
  --color-roles-divider: #E8E8E8;
  --color-roles-success-dark: #0F653F;
  --color-roles-success-light: #E8F6F0;
  --scale-1: 4px; --scale-2: 8px; --scale-3: 12px; --scale-4: 16px; --scale-6: 24px;
  --radius-sm: 4px; --radius-md: 8px; --radius-full: 9999px;
}
```

**Critical:** The reference files do NOT have inline `/* token-path */` comments on individual `var()` usages. The skill output rules must state that EXPL-03 supersedes the reference files on annotation density. The annotation format is defined in CONTEXT.md D-05 — copy it verbatim into the skill:

```css
/* Required output format — every var() in every CSS rule gets this annotation */
.kpi-cell.active {
  background: var(--color-roles-primary-50); /* color-roles/primary/50 */
  border-bottom: 3px solid var(--color-roles-primary-main); /* color-roles/primary/main */
}

.delta-badge {
  background: var(--color-roles-success-light); /* color-roles/success/light */
  color: var(--color-roles-success-dark); /* color-roles/success/dark */
  padding: 2px var(--scale-2); /* scale/2 */
  border-radius: var(--radius-full); /* scale/radius/full */
}

/* Gap handling */
.chart-panel {
  box-shadow: 0 4px 8px rgba(0,0,0,0.08); /* ⚠️ no token — elevation undefined */
}
```

**Known gaps to flag in output (from RESEARCH.md):**
- `--page-bg` and `--text-emphasis` vars used in reference files have no token in tokens.md — skill instructs Claude to use defined tokens (`color-roles/background/default`, `color-roles/text/primary`) and flag deviations
- `box-shadow` / elevation: always `/* ⚠️ no token — elevation undefined */`
- Dataviz hardcoded hex: `/* ⚠️ dataviz series — use color-roles/dataviz/[NN]/main token when token injection is resolved */`

---

#### Variation distinctness pattern

**Source:** `explorations/variation-a.html`, `variation-b.html`, `variation-c.html`

The three reference files establish what "meaningfully distinct" means. The skill body must name these files explicitly as style references and document the structural divergence bar:

| Variation | Nav Model | Information Architecture | Interaction Pattern |
|-----------|-----------|--------------------------|---------------------|
| A (variation-a.html) | 56px icon rail | KPI strip top + full-width chart | Tooltip on hover; tab rail for time range |
| B (variation-b.html) | 222px text nav | Card grid with embedded breakdown bars | List-style data density |
| C (variation-c.html) | 222px text nav | KPI strip + 300px side detail panel | Master-detail slide-out |

The skill body should reference these files by path as the quality bar:

```markdown
## Style Reference

Study these files before generating — they define the layout quality bar and CSS var naming:
- `/Users/pcartelli/Desktop/figma-scripter-tools/explorations/variation-a.html` — icon rail + KPI strip
- `/Users/pcartelli/Desktop/figma-scripter-tools/explorations/variation-b.html` — full-text nav + card grid
- `/Users/pcartelli/Desktop/figma-scripter-tools/explorations/variation-c.html` — full-text nav + detail panel

Variations must differ at the **nav model**, **information architecture**, and **interaction pattern** level.
Cosmetic differences (color swap, padding change) do not qualify as distinct variations.
```

---

#### Figma MCP opportunistic pattern

**Source:** `~/.claude/skills/bluefish-design-system/SKILL.md` (lines 19–45) — the Live Token Grounding section

The foundation establishes the MCP-opportunistic pattern: attempt the MCP call, handle the known Code Connect gap gracefully, fall back to conversation context:

```markdown
At the start of every session with Figma Desktop open, call `get_variable_defs` on the open
node to pull live token values. **Live values are authoritative for the session.**
...
⚠️ `get_variable_defs` is node-scoped in practice...
```

And for Code Connect:
```markdown
- [ ] Code Connect not configured — eng required to set up `.figma.tsx` mapping files ...
  Command skills invoked for this frame will handle the Code Connect interruption —
  see the relevant command skill's workflow instructions.
```

**For bf-explore** — the skill body owns the Code Connect interruption handling (per foundation Known Gaps, last line). The prose section:

```markdown
## Figma Context (Opportunistic)

If the user has a Figma screen open in Figma Desktop or provides a Figma URL:
1. Call `get_figma_data` to read component/frame info
2. Use the returned structure to ground layout decisions (component names, hierarchy, content types)
3. If `get_figma_data` triggers a Code Connect prompt: note it inline with
   `⚠️ Code Connect not configured — proceeding from conversation context` and continue
   with whatever data was returned before the prompt

If no Figma context is available: generate entirely from conversation description.
```

---

#### Output format pattern

**Source:** `~/.claude/skills/gsd-sketch/SKILL.md` (objective block, lines 19–30)

`gsd-sketch` specifies the output artifact type and quantity explicitly in the objective:
```markdown
Each sketch produces 2-3 variants for comparison. Sketches live in `.planning/sketches/`...
```

**For bf-explore** — the output format rules go in the skill body. Each variation is a fenced HTML block, not a file write. The skill must specify:

```markdown
## Output Format

Generate 2–3 HTML layout variations. Each variation:
- Is a complete, self-contained HTML file (DOCTYPE, head with :root block and CSS, body)
- Uses fenced HTML code blocks (```html ... ```) — one block per variation
- Begins with a variation heading: `### Variation A: [layout pattern name]`
- Has every `var()` usage in every CSS rule annotated with its token path: `var(--token-name); /* token/path */`
- Flags every value without a token path: `/* ⚠️ no token — [reason] */`
- Follows the :root block pattern from the reference files (hex fallbacks for standalone rendering)
- Achieves structural distinctness: nav model, information architecture, and interaction pattern
  must differ across variations — cosmetic changes alone are not sufficient
```

---

## Shared Patterns

### Frontmatter description routing
**Source:** `~/.claude/skills/bluefish-design-system/SKILL.md` (lines 1–8)
**Applies to:** bf-explore frontmatter `description:` field

The foundation uses noun-phrase knowledge domains as its description. Command skills use artifact-type anchored descriptions. The discriminating phrase for bf-explore is "HTML layout variations" (plural) — this prevents trigger collision with general ideation or `/bf-prototype` (single HTML output).

```yaml
description: >
  Bluefish design system reference. Use for token lookups, accessibility rules,
  Figma variable reading, component conventions, and code output standards.
  Activates for any question about the Bluefish design system that is not a
  specific explore, prototype, spec, or build task.
```

### Token gap flagging
**Source:** `~/.claude/skills/bluefish-design-system/SKILL.md` (lines 62–74)
**Applies to:** All `var()` usages and hardcoded values in bf-explore output

```markdown
Rules — apply to every color, spacing, radius, and typography value in every code output.
No exception for placeholder values, demo code, or in-progress work.
If no token exists, flag with `/* ⚠️ no token for [value] — needs token */`
```

Specific gap rules bf-explore inherits:
- Elevation: `/* ⚠️ elevation token undefined — omit elevation; flag for design review */`
- Dataviz series: use `color-roles/dataviz/[NN]/main` CSS var; flag if hardcoded hex required
- Dark mode contrastText on warning/info/success: flag per rule 10

### Accessibility requirements
**Source:** `~/.claude/skills/bluefish-design-system/SKILL.md` (lines 88–104)
**Applies to:** All HTML generated by bf-explore

ARIA requirements apply to exploration HTML exactly as they apply to production code — the reference files demonstrate this (e.g., `role="banner"`, `aria-label="Settings"`, `aria-current="page"` in variation-a.html lines 73–80). The skill output rules should reinforce that exploration HTML is not exempt from a11y requirements.

---

## No Analog Found

No files fall into this category. The single file (`~/.claude/skills/bf-explore/SKILL.md`) has strong structural analogs in the skills system. The content is novel (bf-explore workflow logic) but the file structure, frontmatter format, @include pattern, and intake gate pattern are all directly extractable from existing skills.

---

## Metadata

**Analog search scope:** `~/.claude/skills/` (all subdirectories); `explorations/` (reference HTML files); `.planning/phases/01-foundation/` (Phase 1 patterns)
**Files scanned:** 7 (4 skill SKILL.md files + foundation SKILL.md + 1 reference HTML + Phase 1 summary)
**Pattern extraction date:** 2026-05-11
