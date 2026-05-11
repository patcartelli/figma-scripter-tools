# Phase 3: /bf-prototype - Research

**Researched:** 2026-05-11
**Domain:** Claude Code skill authoring — prototype generation command (HTML + Vite+MUI)
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Sub-mode Selection (HTML vs Vite+MUI)**
- D-01: Always ask the mode question upfront — even when screen context is provided. Single intake question: "Quick HTML prototype or runnable Vite+MUI app?" No inference from cues; explicit choice every time.
- D-02: If the user provides screen context in the `/bf-prototype` message: ask mode question → generate immediately (one question, then output).
- D-03: If invoked bare (`/bf-prototype` with no context): ask mode question first → then ask "What screen or component are we prototyping?" → generate. Maximum two intake questions; no additional intake beyond these.
- D-04: Default scope is a full page with nav shell — same approach as `explorations/variation-*.html`. The component being prototyped sits inside a complete-page context.
- D-05: Interaction state minimum: **default + hover + selected**. Active/focus/disabled may be added if relevant, but are not required.
- D-06: Vite+MUI deliverable: a single-screen scaffold (one `App.tsx` with the full screen). `npm run dev` works. No React Router, no multi-page setup.

**Trigger Language**
- D-07: The `description:` field anchors on "prototype" and "working prototype" language. Explicit `/bf-prototype` invocation always fires.
- D-08: Do NOT include "build", "implement", or "create" as standalone trigger phrases — they collide with future `/bf-build` (Phase 5).

**Figma Integration**
- D-09: Figma integration is opportunistic — same model as `/bf-explore`. If the user has Figma open or provides a URL, use it. If not, generate from conversation context.
- D-10: When Figma is open, call **both** `get_variable_defs` (live token values — authoritative) **and** `get_figma_data` (component structure). `get_variable_defs` result takes precedence over `tokens.md`.
- D-11: Code Connect prompt handling: same graceful fallback as `/bf-explore` — flag inline with `⚠️ Code Connect not configured — proceeding from conversation context` and continue.

**Carried Forward from Prior Phases**
- @include pattern: `@~/.claude/skills/bluefish-design-system/SKILL.md` immediately after frontmatter closing `---`.
- On-demand support reads: `tokens.md`, `type-styles.md`, `tokens-dataviz.md`, `figma-reading-guide.md` are NOT @included upfront — read only when needed.
- Token annotation: All `var()` usages in HTML prototype CSS annotated inline.
- Gap flagging: ⚠️ flag for missing tokens, elevation, DATA-03 dual-path.
- DATA-03 dual-path: For Vite+MUI, output both MUI theme extension form AND CSS custom property form with `/* ⚠️ token injection method unconfirmed — verify with eng */` flag.

### Claude's Discretion
- Token compliance pre-return checklist: Claude runs the foundation's 8-point checklist internally before returning output (no user-visible checklist step).
- MUI component selection: Claude infers from Figma component names + `figma-reading-guide.md` Step 3. If no clear MUI equivalent, flag: `/* ⚠️ no MUI equivalent for [name] — custom implementation required */`.
- `alignSelf: 'flex-start'` on selected-item backgrounds in nav components is required (inherited from foundation).

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PROT-01 | `/bf-prototype` SKILL.md created at `~/.claude/skills/bf-prototype/SKILL.md` with a prototype generation workflow | Structural pattern from bf-explore SKILL.md; frontmatter format from foundation; @include from Phase 1 D-01 |
| PROT-02 | HTML prototype mode — quick, no build step, full Bluefish token usage, interaction states via CSS or minimal JS | Reference HTML files define output structure; interaction states via CSS `:hover`, class toggle, or minimal `<script>` |
| PROT-03 | Vite+MUI scaffold mode — runnable prototype with `useState` for interaction states, MUI wrapping pattern, DM Sans, reset styles applied | Foundation SKILL.md code output section defines wrapping pattern; DATA-03 dual-path required |
| PROT-04 | All prototype output uses `color-roles` token paths, correct MUI components, required ARIA props — zero hardcoded hex or px literals | Foundation 8-point checklist; token annotation carried forward from EXPL-03 |
| PROT-05 | Skill fires correctly when a user asks to prototype a Bluefish screen or interaction | Discriminating phrase "prototype" / "working prototype" in frontmatter description; not "build" / "implement" |
</phase_requirements>

---

## Summary

Phase 3 creates a single new file: `~/.claude/skills/bf-prototype/SKILL.md`. This is a direct structural adaptation of the `/bf-explore` skill already delivered in Phase 2 — same frontmatter pattern, same @include placement, same support-files section, same Figma opportunistic pattern, same anti-patterns section. The core difference is the output rules, which must address two distinct sub-modes (HTML prototype and Vite+MUI scaffold) gated by an upfront mode question.

The HTML prototype mode is a constrained version of `/bf-explore` output: single prototype (not 2-3 variations), full-page nav shell scope, with CSS/JS interaction states on top of the explore annotation requirements. The Vite+MUI scaffold mode is new territory — the foundation SKILL.md specifies the wrapping pattern (`<BluefishButton>` wrapping `<Button>`), DATA-03 dual-path, and the MUI type-import rule that prevents Vite runtime errors. These are the two areas requiring the most precise specification in the plan.

The key planning risk is the intake gate logic. Unlike `/bf-explore` (binary: context or bare), `/bf-prototype` has a three-path intake: (1) bare invoke → mode question → screen question → generate; (2) invoke with screen context → mode question → generate; (3) every path starts with the mode question first. Getting this exactly right in the skill body text is what separates correct from broken behavior.

**Primary recommendation:** Author the SKILL.md as a direct structural adaptation of `/bf-explore` SKILL.md. Port every section verbatim except Intake (three-path logic), Figma Context (add `get_variable_defs`), Output Rules (split into HTML Mode and Vite+MUI Mode subsections), and the frontmatter description (anchor on "prototype" not "HTML layout variations").

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Skill invocation routing | Claude Code skill router | — | `description:` field in frontmatter drives auto-trigger; slash command is always explicit |
| Foundation context injection | Foundation SKILL.md (@include) | — | @include pulls bluefish-design-system at runtime; no duplication in bf-prototype |
| Intake gate logic | bf-prototype SKILL.md | — | Mode question + optional screen question are workflow rules, owned by the command skill |
| HTML prototype generation | Claude Code (runtime) | bf-prototype SKILL.md (rules) | Skill body specifies rules; Claude executes them at generation time |
| Vite+MUI scaffold generation | Claude Code (runtime) | bf-prototype SKILL.md (rules) | Skill body specifies wrapping pattern, DATA-03 dual-path, type import rule |
| Token compliance check | Claude Code (runtime) | Foundation 8-point checklist | Skill instructs Claude to run 8-point check before returning; check logic lives in foundation |
| Figma MCP token grounding | Figma Desktop + MCP tools | Foundation SKILL.md | D-10 requires both `get_variable_defs` + `get_figma_data`; priority order defined in foundation |

---

## Standard Stack

### Core
| Library/File | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `~/.claude/skills/bluefish-design-system/SKILL.md` | current | Foundation @include — token rules, a11y, Figma MCP, code output standards | Required by Phase 1 D-01; all command skills inherit from this |
| `~/.claude/skills/bf-explore/SKILL.md` | current | Structural analog — section order, section names, anti-patterns pattern | Phase 2 established this as the template for all bf-* command skills |

### Supporting (Read On Demand)
| File | Purpose | When to Read |
|------|---------|-------------|
| `~/.claude/skills/bluefish-design-system/tokens.md` | Color, spacing, radius token paths | When generating any CSS or MUI sx values |
| `~/.claude/skills/bluefish-design-system/type-styles.md` | Typography token paths and type style names | When setting any typography |
| `~/.claude/skills/bluefish-design-system/tokens-dataviz.md` | Dataviz series tokens | When output contains charts or data series |
| `~/.claude/skills/bluefish-design-system/figma-reading-guide.md` | MUI component inference from Figma names | When interpreting Figma MCP output |

[VERIFIED: direct file reads in this session]

---

## Architecture Patterns

### System Architecture Diagram

```
User message
    |
    v
Claude Code skill router
    |
    |-- description: "prototype" / "working prototype" match
    v
bf-prototype SKILL.md loads
    |
    v
@~/.claude/skills/bluefish-design-system/SKILL.md injected
    |
    v
Intake gate (always mode question first)
    |
    |-- "Quick HTML prototype" path
    |       |
    |       v
    |   [Optional: Figma MCP — get_variable_defs + get_figma_data]
    |       |
    |       v
    |   HTML Output Rules apply
    |       |-- Full-page nav shell structure (ref: variation-*.html)
    |       |-- Single prototype (not 2-3 variations)
    |       |-- CSS/JS interaction states (default + hover + selected)
    |       |-- Inline token annotation on every var()
    |       |-- ⚠️ gap flags on elevation, dataviz hex
    |       v
    |   Return: fenced ```html block
    |
    |-- "Runnable Vite+MUI app" path
            |
            v
        [Optional: Figma MCP — get_variable_defs + get_figma_data]
            |
            v
        Vite+MUI Output Rules apply
            |-- App.tsx wrapping pattern (<BluefishX> wrapping MUI components)
            |-- useState for interaction states (default, hover, selected)
            |-- DM Sans font import
            |-- MUI reset styles applied
            |-- DATA-03 dual-path output (theme extension form + CSS custom property form)
            |-- alignSelf: 'flex-start' on selected-item backgrounds
            |-- MUI type-only imports via `import type {}`
            |-- ⚠️ token injection method flag
            v
        Return: fenced ```tsx block (App.tsx content)
```

### Recommended Skill File Structure

```
~/.claude/skills/bf-prototype/SKILL.md
```

Single file, no subdirectory files needed. Support files live under `bluefish-design-system/` and are read on demand.

### Section Order (matches bf-explore exactly)

The bf-prototype SKILL.md MUST follow this section order, matching bf-explore's structure:

1. YAML frontmatter (with "prototype" / "working prototype" as discriminating phrases)
2. `@~/.claude/skills/bluefish-design-system/SKILL.md` (bare @include, no XML wrapper)
3. `# bf-prototype` heading + one-paragraph summary
4. `## Support Files — Read On Demand`
5. `## Intake` (three-path gate: always mode question first)
6. `## Figma Context (Opportunistic)` (both `get_variable_defs` AND `get_figma_data` — differs from bf-explore which only calls `get_figma_data`)
7. `## HTML Prototype Mode — Output Rules`
8. `## Vite+MUI Scaffold Mode — Output Rules`
9. `## Anti-Patterns — Do Not Do These`

[VERIFIED: direct read of `~/.claude/skills/bf-explore/SKILL.md`]

### Pattern 1: Frontmatter — Trigger Discrimination

**What:** The `description:` field is the auto-trigger routing key. For bf-prototype, it must anchor on "prototype" and "working prototype" and explicitly NOT include "build", "implement", or "create".

**When to use:** Required — this is the PROT-05 implementation.

**Example:**
```yaml
---
name: bf-prototype
description: >
  Generates a Bluefish prototype — either a quick HTML prototype or a runnable Vite+MUI
  single-screen scaffold. Use when the user asks to prototype a screen or interaction, or
  requests a working prototype of a Bluefish component. Not for layout explorations
  (use bf-explore) or production code (use bf-build).
---
```

The phrases "prototype", "working prototype", and "Vite+MUI" are the discriminating anchors. The negative scoping ("not for layout explorations", "not for production code") prevents collision with bf-explore and future bf-build.

[VERIFIED: direct read of bf-explore SKILL.md frontmatter; pattern confirmed]

### Pattern 2: @include Placement

**What:** Foundation @include appears as a bare line immediately after the frontmatter `---` close. No XML `<execution_context>` wrapper. One blank line before and after.

**When to use:** Required by Phase 1 D-01.

**Example:**
```markdown
---
[frontmatter yaml]
---

@~/.claude/skills/bluefish-design-system/SKILL.md

# bf-prototype
```

[VERIFIED: direct read of bf-explore SKILL.md lines 1-14]

### Pattern 3: Three-Path Intake Gate

**What:** Unlike bf-explore (binary: context or bare), bf-prototype always asks the mode question first — regardless of whether screen context was provided.

- Path A (invoke with screen context): mode question → generate immediately
- Path B (bare invoke): mode question → screen question → generate
- Maximum questions: 2

**When to use:** Required by D-01, D-02, D-03.

**Example:**
```markdown
## Intake

**Always ask the mode question first** (regardless of whether screen context was provided):

> "Quick HTML prototype or runnable Vite+MUI app?"

**If the user's `/bf-prototype` message included a screen description:** After receiving the mode answer, generate immediately — do not ask what screen.

**If invoked bare** (`/bf-prototype` with no context): After receiving the mode answer, ask exactly one follow-up:

> "What screen or component are we prototyping?"

Then generate. Do not ask any further questions. Maximum two intake questions total.
```

[VERIFIED: direct read of 03-CONTEXT.md D-01 through D-03]

### Pattern 4: Figma Context — Both MCP Tools

**What:** bf-prototype differs from bf-explore: when Figma is open, it calls BOTH `get_variable_defs` AND `get_figma_data`. `get_variable_defs` returns live token values (authoritative); `get_figma_data` returns component structure.

**When to use:** Required by D-10.

**Example:**
```markdown
## Figma Context (Opportunistic)

If the user has a Figma screen open in Figma Desktop or provides a Figma URL:

1. Call `get_variable_defs` to pull live token values — these are authoritative for the session
   and take precedence over `tokens.md` for color and scale values
2. Call `get_figma_data` to read component/frame structure
3. If either call triggers a Code Connect prompt: note it inline with
   `⚠️ Code Connect not configured — proceeding from conversation context`
   and continue with whatever data was returned before the prompt

If no Figma context is available: generate from conversation description; use `tokens.md` for
token values and flag with `/* ⚠️ live token data unavailable — using tokens.md */`.
```

[VERIFIED: direct read of 03-CONTEXT.md D-09, D-10, D-11; foundation SKILL.md Live Token Grounding section]

### Pattern 5: HTML Prototype Output Rules

**What:** HTML mode produces one complete prototype (not 2-3 variations like bf-explore). Same structural conventions as the variation-*.html reference files, same annotation requirement as EXPL-03, plus interaction states.

**Key differences from bf-explore:**
- Single prototype, not 2-3 variations
- Full-page nav shell is the default scope
- Interaction states required: default + hover + selected (via CSS classes or minimal JS toggle)
- Mode heading: `### HTML Prototype: [screen name]` instead of `### Variation A: ...`

**Interaction state implementation in HTML mode:**
- CSS `:hover` pseudo-class for hover states
- CSS class toggle via minimal inline `<script>` for selected states
- No external JS dependencies; no build step

**Example annotation pattern (carried forward from EXPL-03):**
```css
.nav-primary {
  color: var(--color-roles-text-secondary); /* color-roles/text/secondary */
  background: transparent;
}
.nav-primary.active {
  color: var(--color-roles-primary-main); /* color-roles/primary/main */
  background: var(--color-roles-primary-50); /* color-roles/primary/50 */
  align-self: flex-start; /* selected-item background sizing rule */
}
.nav-primary:hover {
  background: rgba(41,41,41,0.04); /* ⚠️ no token — action/hover state layer TBD */
}
```

[VERIFIED: direct read of variation-a.html, variation-b.html, variation-c.html; foundation SKILL.md token rules]

### Pattern 6: Vite+MUI Scaffold Output Rules

**What:** Vite+MUI mode produces a runnable single-screen scaffold. The wrapping pattern, type import rule, and DATA-03 dual-path are all defined in the foundation SKILL.md and must be referenced in the output rules.

**Critical requirements (all from foundation SKILL.md code output section):**

1. **MUI wrapping pattern:** Custom components wrap MUI components:
   ```tsx
   // Correct
   function BluefishButton(props: BluefishButtonProps) {
     return <Button {...props} />;
   }
   // Incorrect
   <Button sx={{ color: '#00414F' }} /> // no wrapping, hardcoded hex
   ```

2. **Type-only imports:** MUI type exports must use `import type`:
   ```tsx
   // Correct
   import Select, { type SelectChangeEvent } from '@mui/material/Select';
   // Incorrect — Vite throws runtime SyntaxError
   import Select, { SelectChangeEvent } from '@mui/material/Select';
   ```

3. **DATA-03 dual-path:** When using token paths in code, output both forms:
   ```tsx
   // If tokens inject as MUI theme extensions:
   sx={{ color: theme.palette.primary.main }} // color-roles/primary/main
   // If tokens inject as CSS custom properties:
   sx={{ color: 'var(--color-roles-primary-main)' }} // color-roles/primary/main
   /* ⚠️ token injection method unconfirmed — verify with eng */
   ```

4. **DM Sans font:** Import in `main.tsx` or `index.html`:
   ```html
   <link rel="preconnect" href="https://fonts.googleapis.com">
   <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
   ```
   Or in CSS: `font-family: 'DM Sans', system-ui, sans-serif;`

5. **MUI reset styles:** `<CssBaseline />` component included in `App.tsx` inside the MUI `ThemeProvider`.

6. **useState for interaction states:**
   ```tsx
   const [selectedNav, setSelectedNav] = useState<string>('ai-insights');
   // Used in render:
   <ListItemButton
     selected={selectedNav === 'ai-insights'}
     onClick={() => setSelectedNav('ai-insights')}
   />
   ```

7. **alignSelf: 'flex-start' on selected backgrounds:**
   ```tsx
   sx={{
     alignSelf: 'flex-start', // required — selected background hugs label, does not stretch
     borderRadius: '9999px',
   }}
   ```

8. **No React Router, no multi-page setup** — single `App.tsx` with the full screen.

[VERIFIED: direct read of foundation SKILL.md Code Output section, lines 119-169]

### Pattern 7: Token Compliance Pre-Return Checklist

**What:** The foundation defines an 8-point pre-return checklist. For bf-prototype, Claude runs this internally before returning output — no user-visible checklist step. The skill body should instruct Claude to apply this check to both HTML and Vite+MUI output.

**The 8 points (from foundation SKILL.md lines 155-168):**
1. All color values use `color-roles/...` paths — no hex
2. All spacing values use `scale/...` paths — no px literals
3. All typography uses top-level type styles only (no `web/` prefix, no nested `/` in style name)
4. Token paths as literal strings flagged with `/* ⚠️ token injection method unconfirmed — verify with eng */`
5. All interactive elements include required ARIA props
6. Known-gap values flagged: elevation, DV series contrast, dark mode contrastText
7. MUI type-only exports use `import type { ... }`
8. `get_screenshot` called for Figma node; visual discrepancies flagged

For HTML prototype mode: items 7 and 8 are N/A (no TSX, no screenshot comparison unless Figma is available). Items 1-6 fully apply.

[VERIFIED: direct read of foundation SKILL.md lines 154-168]

### Anti-Patterns to Avoid (bf-explore landmines that bf-prototype must NOT repeat)

These are issues discovered by examining bf-explore and the reference files that must be explicitly addressed in bf-prototype's anti-patterns section:

1. **Mode question skipped on contextual invocation:** Unlike bf-explore (which skips intake when context is provided), bf-prototype ALWAYS asks the mode question first. Forgetting this collapses D-01.

2. **Generating 2-3 variations instead of 1:** The planner must be explicit that HTML mode output is a SINGLE prototype. A planner or implementer familiar with bf-explore will default to 2-3 variations.

3. **get_figma_data only (not get_variable_defs too):** bf-explore calls only `get_figma_data`. bf-prototype requires BOTH. This must be explicit in the Figma Context section.

4. **Omitting alignSelf: 'flex-start' in Vite+MUI mode:** This is a foundation-inherited rule that is easy to miss in scaffold output. The skill must call it out explicitly.

5. **MUI type imports as value imports:** The `import type {}` rule is critical for Vite. A generated `App.tsx` that uses value imports for MUI types will throw a runtime `SyntaxError`. Must be in anti-patterns.

6. **DATA-03 single-path output:** Outputting only the MUI theme extension form (or only the CSS custom property form) is incorrect. Both forms required, with the ⚠️ flag.

7. **Trigger over-broadening on "build" / "implement" / "create":** These phrases collide with Phase 5 `/bf-build`. Must be in anti-patterns.

[VERIFIED: direct read of 03-CONTEXT.md, bf-explore SKILL.md Anti-Patterns section, foundation SKILL.md]

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Vite+MUI project scaffold structure | Custom file tree spec | Foundation wrapping pattern + existing Vite conventions | Foundation defines the pattern; Vite conventions are standard |
| Token compliance checking | Custom checklist in skill | Foundation 8-point pre-return checklist (inherited via @include) | Already defined; duplicating it creates drift |
| MUI component mapping | Custom component map | `get_figma_data` + `figma-reading-guide.md` Step 3 | Foundation defines MCP-driven discovery; static maps go stale |
| Interaction state logic | Custom state management system | CSS classes + minimal JS (HTML mode) or `useState` (Vite mode) | Phase scope is prototypes, not production; keep it minimal |

**Key insight:** bf-prototype inherits all compliance machinery from the foundation via @include. The skill body only needs to author the workflow-specific rules (intake gate, sub-mode output rules). Do not re-specify token rules, a11y rules, or Figma MCP setup — those are already injected.

---

## Common Pitfalls

### Pitfall 1: Mode Question Timing
**What goes wrong:** Skill skips the mode question when screen context is present (mirrors bf-explore's context-aware path, which skips intake).
**Why it happens:** CONTEXT.md D-02 says "ask mode question → generate immediately" when context is provided — the "immediately" refers to generating after the mode answer, not skipping the mode question.
**How to avoid:** The Intake section must explicitly state the mode question is ALWAYS first, regardless of context. The condition check is: does the message include screen context? If yes, generate AFTER mode question, no second question. If no, ask mode question, then screen question.
**Warning signs:** Intake section that says "if context provided, proceed immediately" — that's the bf-explore pattern, not bf-prototype.

### Pitfall 2: Single File vs. Full Scaffold
**What goes wrong:** Vite+MUI output is specified as only `App.tsx` content when the user needs to actually run it.
**Why it happens:** D-06 says "single-screen scaffold, one App.tsx" — this could be read as only outputting the App.tsx file content.
**How to avoid:** The skill should clarify what a runnable scaffold means: the skill outputs `App.tsx` content (the single screen), but the output rules should note that `main.tsx`, `index.html`, and DM Sans font loading are required for `npm run dev` to work. Either include them in the output or document what the user needs to add.
**Warning signs:** Vite+MUI output section that only specifies the App.tsx component tree without addressing font loading and entry point.

### Pitfall 3: Interaction States CSS-Only in HTML Mode
**What goes wrong:** Skill specifies only CSS pseudo-classes for interaction states, missing that "selected" state requires a class toggle.
**Why it happens:** CSS `:hover` is straightforward, but "selected" state on KPI cells, nav items, and tabs requires JavaScript class toggling — CSS alone can't persist a selected state.
**How to avoid:** Output rules must specify that HTML mode interaction states use: CSS `:hover` for hover, JS class toggle (minimal inline `<script>`) for selected. This is the pattern in the reference files (e.g., variation-a.html `.kpi-cell.active`).
**Warning signs:** Output rules that only mention CSS pseudo-classes without addressing selected state persistence.

### Pitfall 4: Missing get_variable_defs in Figma Section
**What goes wrong:** Figma Context section only calls `get_figma_data` (copied from bf-explore without adding `get_variable_defs`).
**Why it happens:** bf-explore only needs layout structure; bf-prototype also needs live token values for the generated code.
**How to avoid:** bf-prototype Figma Context section must explicitly list both calls and their priority: `get_variable_defs` first (authoritative for token values), `get_figma_data` second (component structure).
**Warning signs:** Figma section that mentions only `get_figma_data`.

### Pitfall 5: Vite+MUI Type Import Omission
**What goes wrong:** Generated App.tsx uses value imports for MUI type exports, causing a Vite runtime `SyntaxError`.
**Why it happens:** The `import type {}` requirement is a Vite-specific rule that is easy to miss when generating scaffold code. It's documented in the foundation but not obvious.
**How to avoid:** Anti-Patterns section must include this explicitly. Output rules for Vite+MUI mode should include a code example of correct vs. incorrect type imports.
**Warning signs:** Output rules that don't mention `import type {}` at all.

---

## Code Examples

Verified patterns from foundation and reference files:

### HTML Prototype: Nav Shell Structure (from variation-b.html + variation-c.html)
```html
<!-- Source: explorations/variation-b.html, variation-c.html -->
<body>
<header class="top-header" role="banner">
  <div class="header-logo"><div class="logo-mark" aria-hidden="true"></div>Insights</div>
  <div class="header-right">
    <!-- date picker, icon buttons, avatar -->
  </div>
</header>
<div class="body">
  <nav class="nav-rail" role="navigation" aria-label="Main navigation">
    <!-- nav items with .active class for selected state -->
    <div class="nav-primary active" tabindex="0">💡 AI Insights</div>
    <div class="nav-secondary active" aria-current="page" tabindex="0">Overview</div>
  </nav>
  <div class="content">
    <!-- page content here -->
  </div>
</div>
</body>
```

### HTML Prototype: Selected-Item Background (CSS)
```css
/* Source: explorations/variation-b.html nav-primary pattern */
.nav-primary {
  display: flex;
  align-items: center;
  gap: var(--scale-2); /* scale/2 */
  padding: var(--scale-3); /* scale/3 */
  border-radius: var(--radius-full); /* scale/radius/full */
  font-size: 15px;
  font-weight: 500;
  color: var(--color-roles-text-secondary); /* color-roles/text/secondary */
  cursor: pointer;
  align-self: flex-start; /* selected background sizing — hugs label, does not stretch */
}
.nav-primary.active {
  color: var(--color-roles-primary-main); /* color-roles/primary/main */
  background: var(--color-roles-primary-50); /* color-roles/primary/50 */
}
.nav-primary:hover {
  background: rgba(41,41,41,0.04); /* ⚠️ no token — action/hover state layer TBD */
}
```

### HTML Prototype: Minimal JS Toggle for Selected State
```html
<!-- Inline script for class toggle — no external JS dependencies -->
<script>
  document.querySelectorAll('.kpi-cell').forEach(cell => {
    cell.addEventListener('click', () => {
      document.querySelectorAll('.kpi-cell').forEach(c => c.classList.remove('active'));
      cell.classList.add('active');
    });
  });
</script>
```

### Vite+MUI: Wrapping Pattern (from foundation SKILL.md)
```tsx
// Source: foundation SKILL.md Code Output section
// BluefishButton wraps MUI Button with Bluefish props applied
import Button from '@mui/material/Button';

interface BluefishButtonProps {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}

function BluefishButton({ label, onClick, disabled }: BluefishButtonProps) {
  return (
    <Button
      variant="contained"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
    >
      {label}
    </Button>
  );
}
```

### Vite+MUI: DATA-03 Dual-Path Token Reference
```tsx
// Source: foundation SKILL.md Token-to-code mapping section
// Output BOTH forms; flag unconfirmed injection method

// If tokens inject as MUI theme extensions:
sx={{ color: theme.palette.primary.main }} // color-roles/primary/main

// If tokens inject as CSS custom properties:
sx={{ color: 'var(--color-roles-primary-main)' }} // color-roles/primary/main

/* ⚠️ token injection method unconfirmed — verify with eng */
```

### Vite+MUI: Correct Type-Only Import
```tsx
// Source: foundation SKILL.md Code Output item 7
// CORRECT — Vite does not throw SyntaxError
import Select, { type SelectChangeEvent } from '@mui/material/Select';

// INCORRECT — Vite throws runtime SyntaxError
import Select, { SelectChangeEvent } from '@mui/material/Select';
```

### Vite+MUI: useState for Interaction States
```tsx
// Source: 03-CONTEXT.md D-05, D-06; foundation wrapping pattern
import { useState } from 'react';

function App() {
  const [selectedNav, setSelectedNav] = useState<string>('ai-insights');
  const [selectedKpi, setSelectedKpi] = useState<string>('visibility');

  return (
    // nav item with selected state
    <ListItemButton
      selected={selectedNav === 'ai-insights'}
      onClick={() => setSelectedNav('ai-insights')}
      sx={{ alignSelf: 'flex-start', borderRadius: '9999px' }}
    >
      AI Insights
    </ListItemButton>
  );
}
```

---

## Reference HTML File Anatomy

The three reference HTML files define the structural conventions for HTML prototype mode. Key structural facts verified by direct read:

### Common Structure Across All Three
- Top-level header: `<header class="top-header" role="banner">` with `height: 76px`
- Body layout: flex row `<div class="body">` with nav + content
- Nav separator: either 56px icon rail (variation-a) or 222px text nav (b, c)
- DM Sans font: `font-family: 'DM Sans', system-ui, sans-serif;` on `body`
- `:root` block defines CSS custom properties with hex fallbacks
- Scale conventions: `--scale-1: 4px` through `--scale-6: 24px`
- Radius conventions: `--radius-sm: 4px`, `--radius-md: 8px`, `--radius-full: 9999px`

### Known Non-Token Vars in Reference Files
These reference vars (`--page-bg`, `--text-emphasis`, `--shadow-1`) are used in the reference files but have no token path in `tokens.md`. The skill must instruct Claude to use their defined-token equivalents and flag the gaps:
- `--page-bg: #FAFAFA` → use `color-roles/background/default` or flag if deviation
- `--text-emphasis: #3D3D3D` → use `color-roles/text/primary`
- `--shadow-1: 0 4px 8px rgba(0,0,0,0.08)` → always `/* ⚠️ no token — elevation undefined */`

[VERIFIED: direct read of variation-a.html, b.html, c.html :root blocks]

---

## Environment Availability

Step 2.6: SKIPPED — this phase creates a SKILL.md file only (skill authoring). No build tools, runtimes, databases, or CLI utilities are required to author the file. The skill itself references Vite+MUI as output targets for the user, but Phase 3 does not install, run, or configure Vite.

---

## Validation Architecture

`nyquist_validation: false` in `.planning/config.json` — section OMITTED per config.

[VERIFIED: direct read of .planning/config.json]

---

## Security Domain

This phase creates a SKILL.md that authors HTML and TSX output. No authentication, secrets, or data persistence involved. ASVS categories V5 (input validation) and V4 (access control) are not applicable to skill file authoring.

The generated output rules specify ARIA props (accessibility) and token compliance (no hardcoded values), but these are design standards, not security controls. Security domain: N/A for this phase.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Single monolithic skill with explore + prototype + spec logic | Separate command skills inheriting from shared foundation | Phase 1 (2026-05-11) | bf-prototype is a focused skill, not a fork of the old monolith |
| `get_figma_data` only for Figma grounding | `get_variable_defs` + `get_figma_data` together | Phase 2/3 context decisions | Live token values authoritative; component structure separate |
| `outline/subtle` token name | `outline/default` (post 2026-04-29 rename) | 2026-04-29 | Any prototype output using border tokens must use renamed path |
| `outline/default` token name | `outline/outline-variant` (post 2026-04-29 rename) | 2026-04-29 | Same — old names no longer exist in token system |

**Deprecated/outdated:**
- `outline/subtle`: renamed to `outline/default` — skill must not use old name in output examples
- `outline/default` (old): renamed to `outline/outline-variant` — same

[VERIFIED: direct read of foundation SKILL.md Breaking Changes section]

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | HTML mode minimal JS class toggle pattern (inline `<script>`) is the right approach for selected states; no user input on this | Pattern 5, Pitfall 3 | Planner could spec a different interaction approach; low risk — inline script is consistent with reference file patterns and "no build step" constraint |
| A2 | The Vite+MUI scaffold output is `App.tsx` content only (not full project scaffold), with a note about what else is needed | Pitfall 2, Pattern 6 | If user expects a full project scaffold, single-file output is insufficient. Planner should clarify the output contract in the skill body. |
| A3 | `get_variable_defs` is called before `get_figma_data` (priority order) | Pattern 4 | If order matters for MCP tools, reversed order could return stale token data. Low risk — both calls return independently; precedence is the live token value. |

**Claim A2 is the highest-priority clarification for the planner.** The skill body should explicitly define whether Vite+MUI mode outputs: (a) App.tsx content only, (b) App.tsx + main.tsx + index.html as separate fenced blocks, or (c) a file tree with instructions. Based on D-06 ("single-screen scaffold, one App.tsx"), option (a) is the intent, but the planner should make this explicit in the output rules.

---

## Open Questions (RESOLVED)

1. **Vite+MUI scaffold completeness**
   - What we know: D-06 says "one App.tsx with the full screen"; `npm run dev` must work.
   - What's unclear: Does the skill output only `App.tsx` content, or also `main.tsx`, `index.html`, and `package.json`? Without these, `npm run dev` cannot work from a fresh directory.
   - RESOLVED: Skill outputs App.tsx (primary screen block) + main.tsx (ThemeProvider/CssBaseline wiring) + index.html (DM Sans font link) as separate fenced blocks labelled by filename. App.tsx is the screen; the wiring files are infrastructure. This satisfies "npm run dev works" per Plan Section 8 Rule 3.

2. **Hover state token**
   - What we know: The reference files use `rgba(41,41,41,0.04)` for hover backgrounds, which has no clean token path. Foundation rule 5 says to use `color-roles/action/*` tokens for state layers.
   - What's unclear: Is there a `color-roles/action/hover` token that should be used in prototype output? The reference files don't use it; the foundation says it exists.
   - RESOLVED: Output rules use `color-roles/action/hover` (read from tokens.md on demand); flag with ⚠️ if the token is unavailable in the live Figma variables. `rgba(41,41,41,0.04)` without a flag is listed as an anti-pattern per Plan Section 7 Rule 7.

---

## Sources

### Primary (HIGH confidence)
- `~/.claude/skills/bf-explore/SKILL.md` — direct read; all section names, frontmatter format, @include placement, intake gate, Figma context pattern, anti-patterns
- `~/.claude/skills/bluefish-design-system/SKILL.md` — direct read; 8-point checklist, wrapping pattern, DATA-03 dual-path, type import rule, token rules, Figma Live Token Grounding
- `explorations/variation-a.html`, `b.html`, `c.html` — direct read; :root block structure, CSS var naming convention, nav shell HTML structure, known non-token vars
- `.planning/phases/03-bf-prototype/03-CONTEXT.md` — direct read; all locked decisions D-01 through D-11
- `.planning/phases/02-bf-explore/02-01-PLAN.md` — direct read; plan structure, acceptance criteria format, verification pattern
- `.planning/phases/02-bf-explore/02-PATTERNS.md` — direct read; analog pattern assignments, @include placement details

### Secondary (MEDIUM confidence)
- `.planning/REQUIREMENTS.md` — direct read; PROT-01 through PROT-05 acceptance criteria
- `.planning/ROADMAP.md` — direct read; Phase 3 success criteria and scope definition

### Tertiary (LOW confidence)
- None — all claims in this research are verified or cited.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all files directly read in this session
- Architecture: HIGH — section order and patterns verified against existing bf-explore analog
- Pitfalls: HIGH — derived from direct comparison of CONTEXT.md decisions against bf-explore patterns; no web search needed
- Code examples: HIGH — copied from directly-read source files (foundation SKILL.md, reference HTML files)

**Research date:** 2026-05-11
**Valid until:** Until any of the following change: foundation SKILL.md, bf-explore SKILL.md structure, CONTEXT.md decisions. Reference files (variation-*.html) are stable.
