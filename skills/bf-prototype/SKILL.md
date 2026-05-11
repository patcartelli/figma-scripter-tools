---
name: bf-prototype
description: >
  Generates a Bluefish prototype — either a quick HTML prototype or a runnable Vite+MUI
  single-screen scaffold. Use when the user asks to prototype a screen or interaction, or
  requests a working prototype of a Bluefish component. Not for layout explorations
  (use bf-explore) or production code (use bf-build).
---

@~/.claude/skills/bluefish-design-system/SKILL.md

# bf-prototype

Generates a Bluefish prototype in one of two modes: quick HTML prototype (no build step) or runnable Vite+MUI single-screen scaffold. Inherits all Bluefish foundation context (token rules, accessibility standards, Figma MCP setup, code output standards) from `bluefish-design-system` via the `@include` above. This skill owns the prototype generation workflow only — intake gate, sub-mode output rules, and interaction state requirements.

## Support Files — Read On Demand

Do not read these at skill start. Read them only when the task requires it:

- Read `~/.claude/skills/bluefish-design-system/tokens.md` when generating CSS color, spacing, or radius token values
- Read `~/.claude/skills/bluefish-design-system/type-styles.md` when setting typography
- Read `~/.claude/skills/bluefish-design-system/tokens-dataviz.md` when generating dataviz colors
- Read `~/.claude/skills/bluefish-design-system/figma-reading-guide.md` when interpreting Figma MCP output

## Intake

**Always ask the mode question first** — regardless of whether the user's message included a screen description or component context:

> "Quick HTML prototype or runnable Vite+MUI app?"

**If the user's `/bf-prototype` message included a screen or component description:** After receiving the mode answer, generate immediately. Do not ask what screen.

**If invoked bare** (`/bf-prototype` with no accompanying context): After receiving the mode answer, ask exactly one follow-up:

> "What screen or component are we prototyping?"

Then generate. Do not ask any further questions. Maximum two intake questions total.

## Figma Context — Always Attempt First

**Before generating any output**, always attempt Figma MCP calls. Do not skip this step even when the user's message already includes a screen description.

1. Call `get_variable_defs` — pulls live token values. These are authoritative and take precedence over `tokens.md` for color and scale values.
2. Call `get_figma_data` — reads component/frame structure.
3. If either call triggers a Code Connect prompt: note it inline with `⚠️ Code Connect not configured — proceeding from conversation context` and continue with whatever data was returned before the prompt.

**Token drift:** If a value returned by `get_variable_defs` differs from the same path in `tokens.md`, use the live Figma value and flag the drift inline:
```css
var(--color-roles-primary-main); /* color-roles/primary/main — live: #005566, tokens.md: #00414F ⚠️ token drift — using live Figma value */
```

**Fallback — use when MCP calls fail, return empty, or Figma Desktop is not open:**
Generate from conversation description; use `tokens.md` for token values and flag every token reference: `/* ⚠️ live token data unavailable — using tokens.md */`.

## HTML Prototype Mode — Output Rules

1. **Single prototype**: Deliver one complete, self-contained HTML document. NOT 2-3 variations (that is bf-explore's job). Wrap in a fenced ```html code block. Prefix with `### HTML Prototype: [screen name]`.

2. **Scope — full page with nav shell**: The prototype contains a complete page structure: top header (`<header class="top-header" role="banner">`), body row (`<div class="body">`), nav rail or side nav, and content area. The component being prototyped sits inside this chrome.

3. **`:root` block**: Include a `:root` block defining all CSS custom properties used, with hex fallbacks. This is for standalone rendering — it does NOT substitute for inline token annotation.

4. **Inline token annotation (required on every `var()` usage)**: Every `var()` call in every CSS rule must be followed immediately by an inline comment containing the canonical token path. Exact format: `var(--color-roles-primary-main); /* color-roles/primary/main */` — example:

   ```css
   .nav-rail {
     background: var(--color-roles-background-default); /* color-roles/background/default */
     border-right: 1px solid var(--color-roles-divider); /* color-roles/divider */
     padding: var(--scale-4); /* scale/4 */
   }
   ```

5. **Interaction states — default + hover + selected**: Implement all three states. Active/focus/disabled may be added if relevant to the component. Implementation:
   - `hover` state: CSS `:hover` pseudo-class
   - `selected` state: CSS class (e.g., `.active`) toggled by a minimal inline `<script>` block at the bottom of `<body>`. No external JS dependencies. Pattern:
     ```html
     <script>
       document.querySelectorAll('.kpi-cell').forEach(cell => {
         cell.addEventListener('click', () => {
           document.querySelectorAll('.kpi-cell').forEach(c => c.classList.remove('active'));
           cell.classList.add('active');
         });
       });
     </script>
     ```

6. **Selected-item background sizing**: Apply `align-self: flex-start` on any element with a selected-state background fill (nav items, tabs, KPI cells with active states). Never `width: 100%` on a selected background. This is inherited from the foundation — it is required.

7. **Gap flagging**: Any value without a clean token path must be flagged inline. Known automatic gaps:
   - All `box-shadow` values → `/* ⚠️ no token — elevation undefined */`
   - Hover state if using raw opacity (e.g., `rgba(41,41,41,0.04)`) → use `color-roles/action/hover` token instead; if unavailable, flag: `/* ⚠️ no token — action/hover state layer TBD */`
   - Reference-file vars without token paths: use `color-roles/background/default` instead of `--page-bg`; use `color-roles/text/primary` instead of `--text-emphasis`

8. **CSS variable naming convention**: Use shortened CSS var names matching the reference files: `--radius-sm`, `--radius-md`, `--radius-full` (not `--scale-radius-*`). The canonical token path in the inline comment still uses the full `scale/radius/sm` form.

9. **Accessibility**: Apply ARIA roles, labels, and `aria-current="page"` patterns. Required minimum: `role="banner"`, `role="navigation"` with `aria-label`, `aria-current="page"` on the active nav item, `aria-label` on all icon-only buttons.

10. **Token compliance pre-return check**: Before returning output, run the foundation's 8-point pre-return checklist internally. Items 7 (type imports) and 8 (screenshot comparison) are N/A for HTML mode — apply items 1–6.

## Vite+MUI Scaffold Mode — Output Rules

1. **Deliverable — App.tsx first**: The primary output is the complete `App.tsx` file content as a fenced ```tsx code block. This is the full single-screen component tree.

2. **Scope — single screen, no routing**: One `App.tsx` with the full screen. No React Router, no multi-page setup. Routing is out of scope for prototypes.

3. **Additional wiring output**: After the `App.tsx` block, include two additional fenced blocks with the minimum required wiring for `npm run dev` to work:
   - `main.tsx`: ThemeProvider + CssBaseline wrapping App. Include `import CssBaseline from '@mui/material/CssBaseline'` and `<CssBaseline />` inside the ThemeProvider.
   - `index.html` entry point excerpt: show the DM Sans font link tag. Exact tags:
     ```html
     <link rel="preconnect" href="https://fonts.googleapis.com">
     <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap" rel="stylesheet">
     ```
   Label each block clearly: `// main.tsx` and `<!-- index.html (font wiring only) -->`.

4. **MUI wrapping pattern (from foundation)**: Create named custom components that wrap MUI components internally. Example: `function BluefishButton(props) { return <Button {...props} /> }`. Do not use raw MUI components unwrapped. Do not apply Bluefish tokens directly as sx props on raw MUI components.

5. **useState for interaction states**: Use `useState` for all interactive states — nav selection, KPI cell selection, tab selection. Default + hover + selected required. Pattern:
   ```tsx
   const [selectedNav, setSelectedNav] = useState<string>('ai-insights');
   // In render:
   <ListItemButton
     selected={selectedNav === 'ai-insights'}
     onClick={() => setSelectedNav('ai-insights')}
     sx={{ alignSelf: 'flex-start', borderRadius: '9999px' }}
   >
   ```

6. **alignSelf: 'flex-start' on selected backgrounds**: Required on any component whose selected state renders a background fill. This is a foundation-inherited rule — do not omit it.

7. **DATA-03 dual-path token output**: For every token path reference in sx props, output both forms with the ⚠️ flag:
   ```tsx
   // If tokens inject as MUI theme extensions:
   sx={{ color: theme.palette.primary.main }} // color-roles/primary/main
   // If tokens inject as CSS custom properties:
   sx={{ color: 'var(--color-roles-primary-main)' }} // color-roles/primary/main
   /* ⚠️ token injection method unconfirmed — verify with eng */
   ```

8. **Type-only MUI imports**: MUI type exports MUST use `import type {}`. Vite throws a runtime SyntaxError if they are imported as values. Required pattern:
   - CORRECT: `import Select, { type SelectChangeEvent } from '@mui/material/Select'`
   - INCORRECT: `import Select, { SelectChangeEvent } from '@mui/material/Select'`

9. **DM Sans font**: Must be loaded. Include the Google Fonts link in `index.html` (shown in rule 3) or via CSS `@import`. Apply to `body` via MUI theme typography: `fontFamily: "'DM Sans', system-ui, sans-serif"`.

10. **MUI reset styles**: Include `<CssBaseline />` inside the ThemeProvider in `main.tsx`. This is required — do not omit.

11. **Gap flagging**: Apply the same ⚠️ gap flagging rules as HTML mode. Additionally: when no clear MUI equivalent exists for a Figma component, flag inline: `/* ⚠️ no MUI equivalent for [name] — custom implementation required */`

12. **Token compliance pre-return check**: Before returning output, run the full 8-point pre-return checklist from the foundation. All 8 items apply to Vite+MUI mode.

## Anti-Patterns — Do Not Do These

- **Mode question skipped when context is provided**: bf-prototype ALWAYS asks the mode question first, even when the user's message includes a screen description. Do not copy the bf-explore pattern (which skips intake when context is present). Skipping the mode question collapses D-01.
- **2–3 variations instead of one**: HTML mode output is a SINGLE prototype. Multiple variations are the job of bf-explore. Generating 2-3 is the wrong skill behavior.
- **`get_figma_data` only in Figma Context**: bf-prototype requires BOTH `get_variable_defs` (live token values — authoritative) AND `get_figma_data` (component structure). Using only `get_figma_data` omits the authoritative token source.
- **Missing `alignSelf: 'flex-start'` on selected backgrounds**: Any nav item, tab, or KPI cell with a selected-state background fill must use `alignSelf: 'flex-start'`. Omitting it causes the background to stretch to fill the container.
- **MUI type-only exports imported as values**: Using `import { SelectChangeEvent }` instead of `import { type SelectChangeEvent }` causes a Vite runtime SyntaxError. Always use `import type {}` for MUI type exports.
- **DATA-03 single-path output**: Outputting only the MUI theme extension form OR only the CSS custom property form is wrong. Both forms are required with the `⚠️ token injection method unconfirmed` flag.
- **Trigger over-broadening on "build" / "implement" / "create"**: These phrases collide with Phase 5 `/bf-build`. The discriminating trigger anchors are "prototype" and "working prototype" — not generic task verbs.
- **Hardcoded hex without `⚠️` flag**: Any hex value in output without a token must carry a `/* ⚠️ no token — [reason] */` comment. Zero bare hex literals allowed.
- **Discarding partial MCP results**: If `get_variable_defs` or `get_figma_data` returns data before a Code Connect prompt, use what was returned — do not abandon the response.
