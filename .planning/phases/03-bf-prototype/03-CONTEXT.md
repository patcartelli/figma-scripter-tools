# Phase 3: /bf-prototype - Context

**Gathered:** 2026-05-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Create `~/.claude/skills/bf-prototype/SKILL.md` — a prototype generator that fires on `/bf-prototype` (or auto-trigger via "prototype" language) and outputs either a quick HTML prototype or a runnable Vite+MUI single-screen scaffold. Inherits the Bluefish foundation via @include. Does not deliver production code — that is Phase 5 (/bf-build).

</domain>

<decisions>
## Implementation Decisions

### Sub-mode Selection (HTML vs Vite+MUI)
- **D-01:** Always ask the mode question upfront — even when screen context is provided. Single intake question: "Quick HTML prototype or runnable Vite+MUI app?" No inference from cues; explicit choice every time.
- **D-02:** If the user provides screen context in the `/bf-prototype` message: ask mode question → generate immediately (one question, then output).
- **D-03:** If invoked bare (`/bf-prototype` with no context): ask mode question first → then ask "What screen or component are we prototyping?" → generate. Maximum two intake questions; no additional intake beyond these.

### Prototype Scope
- **D-04:** Default scope is a full page with nav shell — same approach as `explorations/variation-*.html`. The component being prototyped sits inside a complete-page context (nav, content area, typical page chrome).
- **D-05:** Interaction state minimum: **default + hover + selected**. Active/focus/disabled states may be added if relevant to the component, but are not required.
- **D-06:** Vite+MUI deliverable: a single-screen scaffold (one `App.tsx` with the full screen). `npm run dev` works. No React Router, no multi-page setup — routing is out of scope for a prototype.

### Trigger Language
- **D-07:** The `description:` field anchors on "prototype" and "working prototype" language — catches "prototype this screen", "build a prototype of X", "I need a working prototype". Explicit `/bf-prototype` invocation also always fires.
- **D-08:** Do NOT include "build", "implement", or "create" as standalone trigger phrases — they are too close to production intent and would collide with future `/bf-build` (Phase 5).

### Figma Integration
- **D-09:** Figma integration is opportunistic — same model as `/bf-explore`. If the user has a Figma screen open in Figma Desktop or provides a URL, use it. If not, generate from conversation context.
- **D-10:** When Figma is open, call **both** `get_variable_defs` (live token values — authoritative per foundation) **and** `get_figma_data` (component structure). `get_variable_defs` result takes precedence over `tokens.md` for color and scale values.
- **D-11:** Code Connect prompt handling: same graceful fallback as `/bf-explore` — flag inline with `⚠️ Code Connect not configured — proceeding from conversation context` and continue with whatever was returned.

### Carried Forward from Prior Phases
- **@include pattern:** `@~/.claude/skills/bluefish-design-system/SKILL.md` immediately after frontmatter closing `---` (Phase 1 D-01).
- **On-demand support reads:** `tokens.md`, `type-styles.md`, `tokens-dataviz.md`, `figma-reading-guide.md` are NOT @included upfront — read only when needed (Phase 1 D-02).
- **Token annotation:** All `var()` usages in HTML prototype CSS annotated inline: `var(--color-roles-primary-main); /* color-roles/primary/main */` (Phase 2 D-05).
- **Gap flagging:** ⚠️ flag for missing tokens, elevation, DATA-03 dual-path (Phase 2 D-06).
- **DATA-03 dual-path:** For Vite+MUI, output both MUI theme extension form AND CSS custom property form with `/* ⚠️ token injection method unconfirmed — verify with eng */` flag (Phase 1).

### Claude's Discretion
- Token compliance pre-return checklist: Claude runs the foundation's 8-point checklist internally before returning output (no user-visible checklist step).
- MUI component selection: Claude infers from Figma component names + `figma-reading-guide.md` Step 3. If no clear MUI equivalent, flag: `/* ⚠️ no MUI equivalent for [name] — custom implementation required */`.
- `alignSelf: 'flex-start'` on selected-item backgrounds in nav components is required (inherited from foundation).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Foundation Skill (inherited via @include)
- `~/.claude/skills/bluefish-design-system/SKILL.md` — token rules, accessibility standards, Figma MCP setup, component map, code output standards, DATA-03 dual-path pattern, selected-item background rule
- `~/.claude/skills/bluefish-design-system/tokens.md` — full token reference; read on-demand for color/spacing/radius values
- `~/.claude/skills/bluefish-design-system/type-styles.md` — typography tokens; read on-demand
- `~/.claude/skills/bluefish-design-system/tokens-dataviz.md` — dataviz tokens; read on-demand when dataviz in output
- `~/.claude/skills/bluefish-design-system/figma-reading-guide.md` — MUI component inference, M3 mapping; read on-demand when Figma MCP used

### Reference Implementation
- `explorations/variation-a.html` — layout quality bar and full-page-with-nav-shell structure reference
- `explorations/variation-b.html` — second layout pattern reference
- `explorations/variation-c.html` — third layout pattern reference

### Prior Phase Analog
- `~/.claude/skills/bf-explore/SKILL.md` — structural analog for the command skill format: frontmatter, @include, Support Files section, Intake section, Figma Context section, Output Rules, Anti-Patterns

### Requirements Traceability
- `.planning/REQUIREMENTS.md` — PROT-01 through PROT-05; acceptance criteria for this phase
- `.planning/ROADMAP.md` — Phase 3 scope, success criteria, dependency on Phase 1 and Phase 2

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `explorations/variation-a.html`, `variation-b.html`, `variation-c.html` — full-page HTML prototypes using Bluefish tokens. Structural model for HTML prototype mode output.
- `~/.claude/skills/bf-explore/SKILL.md` — direct structural analog: same @include pattern, same support-files section, same figma-context section, same anti-patterns section. Phase 3 adapts this structure for prototype output rules.

### Established Patterns
- **@include + on-demand read pattern:** Foundation inherited via @include; support files listed in a "Support Files — Read On Demand" section. Both files follow this pattern.
- **Hybrid intake with mode-first gate:** Mode question asked first regardless of context; screen question follows only on bare invoke.
- **Figma opportunistic with dual-tool call:** `get_variable_defs` + `get_figma_data` when Figma is open; conversation-only fallback when not.

### Integration Points
- New skill at: `~/.claude/skills/bf-prototype/SKILL.md` — new directory, no existing files
- Foundation at: `~/.claude/skills/bluefish-design-system/SKILL.md` — referenced via @include; NOT modified in this phase
- `~/.claude/skills/bf-explore/SKILL.md` — read as structural analog during planning/implementation; NOT modified in this phase

</code_context>

<specifics>
## Specific Ideas

- Intake question wording for mode: "Quick HTML prototype or runnable Vite+MUI app?" (exact phrasing to use)
- Vite+MUI deliverable must work with `npm run dev` — DM Sans font, MUI reset styles, and the wrapping component pattern (e.g., `<BluefishButton>` wrapping MUI `<Button>`) are all inherited from the foundation
- HTML mode output rules should mirror `/bf-explore` output rules (fenced HTML blocks, inline token annotations) but with a single prototype rather than 2–3 variations

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 3-bf-prototype*
*Context gathered: 2026-05-11*
