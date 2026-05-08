# Phase 1: Foundation - Context

**Gathered:** 2026-05-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Refactor `bluefish-design-system` SKILL.md into a clean shared context layer — token rules, accessibility standards, Figma reading guidance, component conventions, known gaps — with all command-specific workflow logic (spec this / build this / explore this / prototype this) extracted out. Rewrite the foundation's `description:` field and audit all five support files for the outline token rename.

</domain>

<decisions>
## Implementation Decisions

### Foundation Load Mechanism
- **D-01:** Command skills load the foundation via `@~/.claude/skills/bluefish-design-system/SKILL.md` — an @include directive positioned after the frontmatter block and before the command-specific skill body.
- **D-02:** Support files (tokens.md, type-styles.md, tokens-dataviz.md, figma-reading-guide.md, spec-template.md) are NOT @included upfront. The foundation keeps the current on-demand Read instruction pattern — Claude reads them when the task requires it, not on every skill activation.

### Foundation Skill Trigger
- **D-03:** Foundation `description:` field focuses on design system context — token questions, accessibility rules, Figma variable reading, component conventions. It does NOT claim workflow tasks (explore, prototype, spec, build). Command skills (added in Phases 2–3) own those workflow triggers. Foundation acts as a context fallback for general Bluefish design system questions.

### Support File Audit Scope
- **D-04:** Apply the outline token rename across all five support files: `outline/subtle` → `outline/default`, `outline/default` → `outline/outline-variant`. Any other obvious drift found while reading should be flagged inline (comment or note) but NOT corrected in Phase 1 — deferred to a future pass.

### Claude's Discretion
- **Code Output section**: The "## Code Output" section of the current SKILL.md (MUI framework, Figma prop→MUI prop table, token-to-code dual-path mapping, wrapping pattern, pre-return verify checklist) stays in the foundation as shared context. Command skills inherit it via @include. Command skills may reference or repeat specific checklist items within their own workflow instructions — no duplication prohibition on checklist points.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Skill Files Being Refactored
- `~/.claude/skills/bluefish-design-system/SKILL.md` — the monolithic skill being split. Current boundary: "## Screen Workflow" section and sub-modes (spec / build / prototype / explore) move to command skills. Everything above it stays in foundation.
- `~/.claude/skills/bluefish-design-system/tokens.md` — support file; apply outline rename, flag other drift
- `~/.claude/skills/bluefish-design-system/type-styles.md` — support file; apply outline rename, flag other drift
- `~/.claude/skills/bluefish-design-system/tokens-dataviz.md` — support file; apply outline rename, flag other drift
- `~/.claude/skills/bluefish-design-system/figma-reading-guide.md` — support file; apply outline rename, flag other drift
- `~/.claude/skills/bluefish-design-system/spec-template.md` — support file; apply outline rename, flag other drift

### Requirements Traceability
- `.planning/REQUIREMENTS.md` — FOUND-01, FOUND-02, FOUND-03 map to this phase; acceptance criteria defined there
- `.planning/ROADMAP.md` — Phase 1 scope and success criteria (§Phase 1: Foundation)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `explorations/variation-a.html`, `variation-b.html`, `variation-c.html` — reference HTML prototypes demonstrating correct Bluefish token annotation style (`var(--color-roles-primary-main); /* color-roles/primary/main */`). Not used in Phase 1 but are the reference implementation for Phase 2 /bf-explore.

### Established Patterns
- Current SKILL.md structure: frontmatter → shared context sections → "## Screen Workflow" (command-specific). The split follows this natural boundary — everything before "## Screen Workflow" is foundation; the workflow section and sub-modes move out.
- On-demand Read pattern for support files is already established in SKILL.md ("read tokens.md when generating code", "read type-styles.md for typography"). Preserve this pattern.

### Integration Points
- Command skills will be created at `~/.claude/skills/bf-explore/SKILL.md` (Phase 2) and `~/.claude/skills/bf-prototype/SKILL.md` (Phase 3). Phase 1 establishes the @include contract they'll use.
- Foundation SKILL.md stays at `~/.claude/skills/bluefish-design-system/SKILL.md` — same path, same skill name, refactored content.

</code_context>

<specifics>
## Specific Ideas

- Outline token rename is the only known correction to apply in Phase 1: `outline/subtle` → `outline/default` and `outline/default` → `outline/outline-variant` (documented in SKILL.md "## Breaking Changes" section, dated 2026-04-29).
- The "## Breaking Changes" section of SKILL.md should remain in the foundation — it's shared context, not workflow logic.
- The "## Known Gaps" section stays in foundation — it applies across all command contexts.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 1-Foundation*
*Context gathered: 2026-05-08*
