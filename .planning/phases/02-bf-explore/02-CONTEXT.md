# Phase 2: /bf-explore - Context

**Gathered:** 2026-05-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Create `~/.claude/skills/bf-explore/SKILL.md` — a focused layout variation generator that fires on `/bf-explore` (or auto-trigger via layout exploration language) and outputs 2–3 meaningfully distinct, Bluefish-annotated HTML layout variations. Inherits the foundation via @include. Does not deliver prototype-ready code — that is Phase 3.

</domain>

<decisions>
## Implementation Decisions

### Trigger Language
- **D-01:** The `description:` field anchors on explicit layout exploration language — catches "show me layout variations", "explore layouts for this screen", "give me 3 layouts for X" — but NOT broader exploration intent like "explore this", "ideate on this", "what could this look like". The narrower trigger prevents collision with general design discussion or prototyping requests.
- **D-02:** The `description:` field explicitly mentions "HTML layout variations" (plural) to distinguish from `/bf-prototype`, which also produces HTML but as a single polished implementation to build on.

### Input Intake
- **D-03:** Hybrid intake — if the user provides any screen description or component context (in the `/bf-explore` message or in prior conversation), work immediately with it. If invoked bare (`/bf-explore` with no accompanying context), ask one clarifying question before generating.
- **D-04:** The single clarifying question asks only: "What screen or component are we exploring?" — no constraints or layout rules intake. Users can add those in follow-up or include them in their initial description.

### Token Annotation
- **D-05:** Every `var()` usage in CSS rules gets an inline comment showing the token path immediately after. Format: `background: var(--color-roles-primary-main); /* color-roles/primary/main */`. This is the literal format from EXPL-03. The `:root` block is a convenience for avoiding repetition — it does not substitute for per-usage annotation.
- **D-06:** Values without a clean token path get a ⚠️ flag with a brief reason: `/* ⚠️ no token — elevation TBD */`. This matches the gap-handling pattern already established in the foundation for DATA-03 and other known gaps.

### Figma MCP
- **D-07:** Opportunistic Figma MCP use — if the user has a Figma screen open or provides a URL, use `get_figma_data` to read component/frame info and use it to ground the layout variations. If no Figma context is available, proceed entirely from conversation context.
- **D-08:** If `get_figma_data` triggers a Code Connect prompt (known gap from foundation), acknowledge it inline with ⚠️ and continue with whatever was returned — same graceful gap-handling approach as the foundation skill.

### Claude's Discretion
- What constitutes "meaningfully distinct" variations is left to Claude's judgment. The reference bar is `explorations/variation-{a,b,c}.html` — variations at that level of layout/interaction difference are the target. Cosmetic changes (color swap, padding tweak) do not count.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Foundation Skill (inherited via @include)
- `~/.claude/skills/bluefish-design-system/SKILL.md` — authoritative shared context: token rules, accessibility standards, Figma MCP setup, component map, code output patterns. Must be @included at the top of the bf-explore skill body.
- `~/.claude/skills/bluefish-design-system/tokens.md` — full token reference; read on-demand when generating color/spacing values (not @included upfront)
- `~/.claude/skills/bluefish-design-system/type-styles.md` — typography tokens; read on-demand

### Reference Implementation
- `explorations/variation-a.html` — reference quality bar: icon rail + KPI strip layout; correct CSS var naming, Bluefish token coverage
- `explorations/variation-b.html` — reference quality bar: second layout pattern
- `explorations/variation-c.html` — reference quality bar: third layout pattern
- Output quality and token coverage must match or exceed these files (EXPL-04)

### Requirements Traceability
- `.planning/REQUIREMENTS.md` — EXPL-01 through EXPL-04; acceptance criteria for this phase
- `.planning/ROADMAP.md` — Phase 2 scope, success criteria, and dependency on Phase 1 foundation

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `explorations/variation-a.html`, `variation-b.html`, `variation-c.html` — fully worked HTML + inline CSS examples using Bluefish tokens. Study the token naming convention (`--color-roles-*`, `--scale-*`, `--radius-*`) and layout patterns. These are the output model.

### Established Patterns (from Phase 1)
- **@include pattern:** Command skills load the foundation via `@~/.claude/skills/bluefish-design-system/SKILL.md` — an @include directive after frontmatter, before the skill body (Phase 1 D-01).
- **On-demand support file reads:** Support files (tokens.md, type-styles.md, etc.) are NOT @included upfront — the skill instructs Claude to read them when the task requires it (Phase 1 D-02).
- **Foundation-owns-context-triggers:** The foundation `description:` handles general Bluefish design system questions. Command skills own specific workflow triggers (Phase 1 D-03).

### Integration Points
- Skill created at: `~/.claude/skills/bf-explore/SKILL.md` — new directory, no existing files
- Foundation at: `~/.claude/skills/bluefish-design-system/SKILL.md` — referenced via @include; not modified in this phase

</code_context>

<specifics>
## Specific Ideas

- The annotation format from EXPL-03 is exact and must appear in the skill's output rules: `background-color: var(--color-roles-primary-main); /* color-roles/primary/main */`
- The explorations reference set (variation-a/b/c) is both a quality bar AND a token-naming reference — the skill should point Claude at them as style examples, not just as a test to pass
- When bare-invoked, the single intake question is: "What screen or component are we exploring?" — no other intake questions

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 2-bf-explore*
*Context gathered: 2026-05-11*
