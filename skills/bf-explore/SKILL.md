---
name: bf-explore
description: >
  Generates 2–3 meaningfully distinct HTML layout variations for a Bluefish screen.
  Use when the user asks for layout explorations, layout variations, or wants to see
  multiple HTML layout options for a Bluefish screen or component. Not for general
  design questions (use bluefish-design-system) or single prototype output (use bf-prototype).
---

@~/.claude/skills/bluefish-design-system/SKILL.md

# bf-explore

Generates 2–3 meaningfully distinct HTML layout variations for a Bluefish screen, with every Bluefish token annotated inline. Inherits all Bluefish foundation context (token rules, accessibility standards, Figma MCP setup, code output standards) from `bluefish-design-system` via the `@include` above. This skill owns the layout exploration workflow only.

## Support Files — Read On Demand

Do not read these at skill start. Read them only when the task requires it:

- Read `~/.claude/skills/bluefish-design-system/tokens.md` when generating CSS color, spacing, or radius token values
- Read `~/.claude/skills/bluefish-design-system/type-styles.md` when setting typography
- Read `~/.claude/skills/bluefish-design-system/tokens-dataviz.md` when generating dataviz colors
- Read `~/.claude/skills/bluefish-design-system/figma-reading-guide.md` when interpreting Figma MCP output

## Intake

**If the user provided a screen or component description** (in the /bf-explore message or in prior conversation context): proceed immediately to generation. Do not ask any clarifying questions.

**If invoked bare** (`/bf-explore` with no accompanying context): ask exactly one question:

> "What screen or component are we exploring?"

Do not ask additional questions. Do not request constraints, layout rules, or brand emphasis at intake — users can include those in their response or as follow-up. Generate 2–3 variations immediately after receiving the response.

## Figma Context (Opportunistic)

If the user has a Figma screen open in Figma Desktop or provides a Figma URL:

1. Call `get_figma_data` to read component/frame info
2. Use the returned structure to ground layout decisions (component names, hierarchy, content types)
3. If `get_figma_data` triggers a Code Connect prompt: note it inline with `⚠️ Code Connect not configured — proceeding from conversation context` and continue with whatever data was returned before the prompt

If no Figma context is available: generate entirely from conversation description.

## Style Reference

Study these files before generating — they define the layout quality bar, the `:root` CSS block convention, and the CSS custom property naming convention:

- `/Users/pcartelli/Desktop/figma-scripter-tools/explorations/variation-a.html` — 56px icon rail + KPI strip + full-width chart
- `/Users/pcartelli/Desktop/figma-scripter-tools/explorations/variation-b.html` — 222px text nav + rich card grid with embedded breakdown bars
- `/Users/pcartelli/Desktop/figma-scripter-tools/explorations/variation-c.html` — 222px text nav + KPI strip + 300px detail panel

**Important:** These reference files demonstrate layout quality and CSS var naming, but they do NOT have inline `/* token/path */` annotations on individual `var()` usages. Your output must EXCEED the reference files in annotation density — see the Output Rules below. The annotation requirement is the binding rule; the reference files are not.

## Output Rules

Generate **2–3 HTML layout variations**. Each variation:

1. **Format:** A complete, self-contained HTML document (`<!DOCTYPE html>`, `<head>` with `<style>` containing a `:root` block and CSS rules, `<body>` with the layout markup). Wrap each variation in a fenced ` ```html ` code block.

2. **Variation heading:** Prefix each fenced block with a heading line: `### Variation A: [short layout pattern name]` (then B, C).

3. **`:root` block:** Include a `:root` block at the top of `<style>` defining the CSS custom properties used, with hex fallbacks (matches the convention in `explorations/variation-a.html`). This is for standalone rendering — it does NOT substitute for inline annotation.

4. **Inline token annotation (EXPL-03, required on every `var()` usage):** Every `var()` call in every CSS rule must be followed immediately by an inline comment containing the canonical token path. Exact format:

   ```css
   .nav-rail {
     background: var(--color-roles-background-default); /* color-roles/background/default */
     border-right: 1px solid var(--color-roles-divider); /* color-roles/divider */
     padding: var(--scale-4); /* scale/4 */
   }
   ```

   A `:root` block does NOT satisfy this requirement. Even though the token path is implied by the var name, the inline comment must appear on every usage. Example of the exact annotation format:

   ```css
   background-color: var(--color-roles-primary-main); /* color-roles/primary/main */
   ```

5. **Gap flagging (D-06):** Any value without a clean token path must be flagged inline. Format:

   ```css
   .chart-panel {
     box-shadow: 0 4px 8px rgba(0,0,0,0.08); /* ⚠️ no token — elevation TBD */
   }
   ```

   Known gaps to flag automatically:
   - All `box-shadow` values → `/* ⚠️ no token — elevation undefined */`
   - Dataviz series hardcoded hex (e.g., `#D77D28`) → `/* ⚠️ dataviz series — use color-roles/dataviz/[NN]/main token when token injection is resolved */`
   - `--page-bg`, `--text-emphasis`, or other reference-file vars that have no token in `tokens.md` → prefer the defined token (`color-roles/background/default`, `color-roles/text/primary`) and flag any deviation.

6. **Structural distinctness (EXPL-02):** Variations must differ at the **nav model**, **information architecture**, and **interaction pattern** level. Cosmetic differences (color swap, padding change, font tweak) do NOT qualify. Aim for the spectrum demonstrated by the three reference files: different nav widths/models, different content layouts (strip vs. grid vs. detail panel), different interaction patterns (tooltip-on-hover vs. inline expand vs. master-detail slide-out).

7. **Accessibility:** Exploration HTML is not exempt from a11y requirements inherited from the foundation. Apply ARIA roles, labels, and `aria-current="page"` patterns demonstrated in `variation-a.html` (e.g., `role="banner"`, `aria-label`, `aria-current`).

8. **CSS variable naming convention:** Use the shortened CSS var names observed in the reference files: `--radius-sm`, `--radius-md`, `--radius-full` (not `--scale-radius-*`). The canonical token path in the inline comment still uses the full `scale/radius/sm` form.

## Anti-Patterns — Do Not Do These

- **Cosmetic-only variations:** Three layouts that differ only in color, padding, or font sizes. Variations must differ at the layout/IA level.
- **`:root` block as annotation substitute:** A well-annotated `:root` block does NOT satisfy EXPL-03. Every `var()` usage in every CSS rule needs its own inline `/* token/path */` comment.
- **Hardcoded hex without `⚠️` flag:** Any hex value (chart series colors, elevation, page background) without a token must carry a `/* ⚠️ no token — [reason] */` comment.
- **Multiple intake questions on bare invocation:** Exactly one question: "What screen or component are we exploring?" Nothing else at intake.
- **Trigger over-broadening:** Do not match general design questions, ideation requests, or single-prototype requests. The discriminating phrase is "HTML layout variations" (plural).
- **Discarding partial MCP results:** If `get_figma_data` returns data before a Code Connect prompt, use what was returned — do not abandon the response.
