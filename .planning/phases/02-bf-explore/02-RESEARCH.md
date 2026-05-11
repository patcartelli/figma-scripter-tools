# Phase 2: /bf-explore — Research

**Researched:** 2026-05-11
**Domain:** Claude Code skill authoring — layout variation generation with Bluefish design system token annotation
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** The `description:` field anchors on explicit layout exploration language — catches "show me layout variations", "explore layouts for this screen", "give me 3 layouts for X" — but NOT broader exploration intent like "explore this", "ideate on this", "what could this look like".
- **D-02:** The `description:` field explicitly mentions "HTML layout variations" (plural) to distinguish from `/bf-prototype`.
- **D-03:** Hybrid intake — if the user provides any screen description or component context, work immediately. If invoked bare, ask one clarifying question before generating.
- **D-04:** The single clarifying question: "What screen or component are we exploring?" — no constraints or layout rules intake.
- **D-05:** Every `var()` usage in CSS rules gets an inline comment immediately after: `background: var(--color-roles-primary-main); /* color-roles/primary/main */`. The `:root` block does not substitute for per-usage annotation.
- **D-06:** Values without a clean token path get a flag: `/* ⚠️ no token — [reason] */`.
- **D-07:** Opportunistic Figma MCP — if user has Figma screen open or provides URL, use `get_figma_data`. If no Figma context, proceed from conversation context only.
- **D-08:** If `get_figma_data` triggers a Code Connect prompt, acknowledge inline with ⚠️ and continue with whatever was returned.

### Claude's Discretion

- What constitutes "meaningfully distinct" variations is Claude's judgment. The reference bar is `explorations/variation-{a,b,c}.html` — variations at that level of layout/interaction difference are the target. Cosmetic changes (color swap, padding tweak) do not count.

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| EXPL-01 | `/bf-explore` SKILL.md created at `~/.claude/skills/bf-explore/SKILL.md` with a focused layout variation workflow | Skill file structure, @include pattern, and frontmatter conventions are fully established and verified from Phase 1 |
| EXPL-02 | Skill generates 2–3 meaningfully distinct HTML layout variations (not cosmetic differences) | Reference implementations in `explorations/variation-{a,b,c}.html` define the distinction bar; three clearly different nav/layout patterns are documented |
| EXPL-03 | Every Bluefish value in output is annotated with its token path inline | Exact annotation format confirmed from CONTEXT.md D-05; token-to-CSS-var naming convention confirmed from foundation SKILL.md |
| EXPL-04 | Skill fires correctly when a user asks for layout explorations or variations on a Bluefish screen | Trigger description pattern established, `description:` field mechanism validated by Phase 1 |
</phase_requirements>

---

## Summary

Phase 2 creates a single file: `~/.claude/skills/bf-explore/SKILL.md`. This skill inherits the Bluefish foundation via `@include` and owns the layout exploration workflow. The work is almost entirely content authoring — writing a well-structured SKILL.md with the correct frontmatter, @include directive, intake logic, output rules, and Bluefish token knowledge embedded. There is no code to compile, no dependencies to install, no runtime to configure.

The foundation (Phase 1) is verified complete. The `@include` pattern, on-demand file read pattern, and description-field routing strategy are all established and working. Phase 2 applies those patterns to a new dedicated skill file.

The critical research question — "what is the exact output model for this skill?" — is answered concretely by `explorations/variation-{a,b,c}.html`. Those files are not just a quality bar; they are the template for what good output looks like. The skill must instruct Claude to produce output at that level, and the annotation format (EXPL-03) supersedes the reference files because the reference files do NOT yet have per-usage inline comments — the skill output will exceed the reference files in annotation density.

**Primary recommendation:** Author the skill as a single SKILL.md with three logical sections: (1) frontmatter with focused trigger description, (2) @include of foundation + on-demand reads, (3) the explore workflow with intake, generation, and annotation rules. The reference files serve as in-skill style examples, pointed at explicitly by path.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Skill trigger routing | Claude Code agent (skills system) | — | `description:` field in frontmatter; soft-match by Claude when processing user intent |
| Layout variation generation | Claude (LLM reasoning) | — | No code executes; Claude generates HTML text guided by SKILL.md instructions |
| Token annotation | Claude (LLM reasoning) | Foundation SKILL.md (inherited) | Token rules live in foundation; the explore skill inherits them and adds per-usage annotation requirement |
| Figma context intake | Figma MCP (opportunistic) | Conversation context (fallback) | D-07: use MCP if available, generate from description if not |
| Output format enforcement | bf-explore SKILL.md instructions | — | Output rules (2–3 variations, fenced HTML blocks, annotation format) are defined in the skill |
| Token reference lookup | tokens.md, type-styles.md (on-demand read) | — | Not @included upfront; skill instructs Claude to read these files when generating token values |

---

## Standard Stack

### Core

| Component | Location | Purpose | Why Standard |
|-----------|----------|---------|--------------|
| bf-explore SKILL.md | `~/.claude/skills/bf-explore/SKILL.md` | Defines skill trigger and workflow | Claude Code skill system convention [VERIFIED: Phase 1 summary] |
| Foundation @include | `@~/.claude/skills/bluefish-design-system/SKILL.md` | Inherits token rules, a11y, Figma setup, code output standards | Established in Phase 1 D-01 [VERIFIED: 01-01-SUMMARY.md] |
| tokens.md (on-demand) | `~/.claude/skills/bluefish-design-system/tokens.md` | Token path reference for color, spacing, radius | On-demand read pattern from Phase 1 D-02 [VERIFIED: 01-01-SUMMARY.md] |
| type-styles.md (on-demand) | `~/.claude/skills/bluefish-design-system/type-styles.md` | Typography token reference | On-demand read pattern [VERIFIED: foundation SKILL.md] |

### Supporting References

| Component | Location | Purpose | When to Use |
|-----------|----------|---------|-------------|
| explorations/variation-a.html | Project repo | Style example — icon rail + KPI strip layout | Point Claude at this as a style reference in SKILL.md |
| explorations/variation-b.html | Project repo | Style example — rich card grid layout | Point Claude at this as a style reference in SKILL.md |
| explorations/variation-c.html | Project repo | Style example — detail panel layout | Point Claude at this as a style reference in SKILL.md |
| figma-reading-guide.md | `~/.claude/skills/bluefish-design-system/figma-reading-guide.md` | M3 mapping, component interpretation | On-demand when Figma MCP is used (D-07) |

### No Installation Required

This phase creates a markdown file only. No `npm install`, no build step, no package dependencies.

---

## Architecture Patterns

### System Architecture Diagram

```
User types /bf-explore [description?]
         |
         v
Claude Code skill router
  (matches description: "HTML layout variations" → bf-explore skill)
         |
         v
bf-explore SKILL.md loads
  @include → bluefish-design-system/SKILL.md (token rules, a11y, code output)
         |
         v
Intake gate
  ┌─ Has screen context in message/conversation? ──→ Proceed to generation
  └─ Bare invocation? ──→ Ask: "What screen or component are we exploring?"
                                    |
                                    v
                             User responds
         |
         v
Figma MCP (opportunistic)
  ┌─ Figma Desktop open / URL provided? ──→ get_figma_data → ground layout in component data
  │    └─ Code Connect prompt? ──→ ⚠️ flag inline, continue with partial data
  └─ No Figma context ──→ Proceed from conversation description only
         |
         v
Token reference (on-demand reads)
  tokens.md (color, spacing, radius values)
  type-styles.md (typography)
         |
         v
Generate 2–3 HTML layout variations
  Each variation: distinct layout/interaction pattern (not cosmetic diff)
  CSS output: every var() annotated → `var(--color-roles-primary-main); /* color-roles/primary/main */`
  Missing tokens → `/* ⚠️ no token — [reason] */`
  Format: fenced HTML code blocks, one per variation
         |
         v
Return variations to user
```

### Recommended Skill File Structure

```
~/.claude/skills/bf-explore/
└── SKILL.md           # Only file needed in Phase 2
```

The foundation skill directory is not modified in this phase:
```
~/.claude/skills/bluefish-design-system/
├── SKILL.md           # @included by bf-explore (read-only for Phase 2)
├── tokens.md          # On-demand read
├── type-styles.md     # On-demand read
├── tokens-dataviz.md  # On-demand read (if dataviz in output)
└── figma-reading-guide.md  # On-demand read (if Figma MCP used)
```

### Pattern 1: Skill Frontmatter Structure

**What:** YAML frontmatter with name, description, and optionally allowed-tools.
**When to use:** Every SKILL.md file.

```yaml
---
name: bf-explore
description: >
  Generates 2–3 meaningfully distinct HTML layout variations for a Bluefish screen.
  Use when the user asks for layout explorations, layout variations, or wants to see
  multiple HTML layout options for a Bluefish screen or component.
---
```

**Trigger language rationale (D-01 + D-02):**
- "layout variations" and "HTML layout" are the discriminators — they catch `explore layouts for X` but not `explore this` or `prototype this`
- The phrase "HTML layout variations" (plural) distinguishes from `/bf-prototype` which also produces HTML but as a single implementation
- The description should NOT contain action verbs like "explore" as standalone — it must anchor on the artifact type ("HTML layout variations") [VERIFIED: Phase 1 D-03 pattern]

### Pattern 2: @include + On-Demand Read Pattern

**What:** Load foundation via @include in skill body; load support files via explicit read instructions only when needed.
**When to use:** Every command skill. Established in Phase 1.

```markdown
@~/.claude/skills/bluefish-design-system/SKILL.md

---

## When to Read Support Files

Read these files on-demand only — do not load at skill start:
- `~/.claude/skills/bluefish-design-system/tokens.md` — when you need color, spacing, or radius token paths
- `~/.claude/skills/bluefish-design-system/type-styles.md` — when you need typography token values
- `~/.claude/skills/bluefish-design-system/figma-reading-guide.md` — when interpreting Figma MCP results
```

[VERIFIED: Phase 1 D-01, D-02 — confirmed in 01-01-SUMMARY.md patterns-established]

### Pattern 3: Inline Token Annotation (EXPL-03)

**What:** Every `var()` call in CSS rules followed immediately by an inline comment with the canonical token path.
**When to use:** Every CSS property in the explore skill's output.

```css
/* Correct — annotation immediately after var() on the same rule */
.nav-rail {
  background: var(--color-roles-background-default); /* color-roles/background/default */
  border-right: 1px solid var(--color-roles-divider); /* color-roles/divider */
  padding: var(--scale-4); /* scale/4 */
}

/* Correct — ⚠️ flag for values without a clean token path */
.card {
  box-shadow: 0 4px 8px rgba(0,0,0,0.08); /* ⚠️ no token — elevation TBD */
}

/* Correct — dataviz hex values with token flag */
.legend-dot {
  background: var(--color-roles-dataviz-01-main); /* color-roles/dataviz/01/main */
}
```

**Important distinction from reference files:** The `explorations/variation-{a,b,c}.html` files do NOT have these per-usage inline annotations — they predate the EXPL-03 requirement. The skill output must EXCEED the reference files in annotation density. The reference files are a quality bar for layout quality and token coverage, not for annotation format. [VERIFIED: grep confirms 0 annotation comments in all three reference files]

### Pattern 4: CSS Variable Naming Convention

**What:** Token paths use forward-slash notation in documentation; CSS custom property names use hyphen notation.
**Mapping rule:** Replace `/` with `-` and prepend `--`.

| Token path | CSS custom property |
|------------|---------------------|
| `color-roles/primary/main` | `var(--color-roles-primary-main)` |
| `color-roles/background/default` | `var(--color-roles-background-default)` |
| `color-roles/text/secondary` | `var(--color-roles-text-secondary)` |
| `scale/4` | `var(--scale-4)` |
| `scale/radius/md` | `var(--radius-md)` |
| `color-roles/divider` | `var(--color-roles-divider)` |

[VERIFIED: foundation SKILL.md Token-to-code mapping section; reference HTML files]

**Note on radius:** The reference files use `--radius-sm`, `--radius-md`, `--radius-full` — not `--scale-radius-sm`. The authoritative token path is `scale/radius/sm` but the CSS convention used in the reference files shortens to `--radius-*`. The skill should use the same shorthand CSS vars as the references for consistency. [VERIFIED: observed in variation-a.html :root block]

### Pattern 5: Variation Distinctness Bar

**What:** The three reference files define what "meaningfully distinct" means.
**When to use:** When generating variations, each must differ at the layout/nav/information architecture level.

| Variation | Layout Pattern | Nav Model | Key Distinction |
|-----------|----------------|-----------|-----------------|
| A (variation-a.html) | Icon rail + KPI strip + full-width chart | Narrow 56px icon rail with tooltips | Maximizes chart real estate; KPI strip is top-of-content |
| B (variation-b.html) | Full text nav + card grid | 222px text nav with hierarchy | Score cards with embedded breakdown bars; list-style data |
| C (variation-c.html) | Full text nav + KPI strip + detail panel | 222px text nav with hierarchy + 300px side panel | Compact strip + slide-out drill-down; master-detail pattern |

[VERIFIED: direct reading of explorations/ reference files]

These three represent the spectrum of distinction. New explorations should achieve similar structural divergence — if two variations share the same nav width, information density, and interaction model, they are too similar.

### Anti-Patterns to Avoid

- **Cosmetic-only variations:** Three layouts that differ only in color scheme, padding values, or font sizes — these are not distinct variations per D-01 / EXPL-02
- **Missing `:root` block:** The reference files use a `:root` CSS block to define token values with hex fallbacks. This is correct for standalone HTML exploration files that don't have a real token injection pipeline (DATA-03 is unresolved). The `:root` block is a rendering convenience, not a substitution for per-usage annotation comments.
- **Unannotated `:root` vars:** Do not assume the `:root` block substitutes for inline comments on `var()` usages. D-05 is explicit: per-usage annotation is required regardless of what the `:root` block contains.
- **Pre-generating without intake check:** The skill must gate on whether context was provided — bare `/bf-explore` must ask one question first (D-03).
- **Over-broad trigger description:** A description that catches "explore" broadly will collide with general ideation or `/gsd-explore` commands. Keep the trigger anchored to "HTML layout variations" specifically (D-01).
- **Discarding MCP partial results:** If `get_figma_data` returns something before hitting the Code Connect prompt, use what was returned — do not abort the MCP call result entirely (D-08).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Token reference | Custom token lookup table in skill body | `tokens.md` on-demand read | tokens.md is the authoritative source; duplicating it in the skill creates drift risk |
| Typography reference | Font/size/weight tables in skill body | `type-styles.md` on-demand read | Same — authoritative source is the support file |
| Figma interpretation rules | Custom M3-mapping logic in skill body | `figma-reading-guide.md` on-demand read | Foundation already has the complete mapping |
| Foundation context | Re-listing token rules, a11y, etc. in the explore skill body | `@include` of foundation SKILL.md | Foundation is the single source of truth; repeating it creates drift |

**Key insight:** The skill body should be thin — it defines the workflow, not the knowledge. All Bluefish knowledge lives in the foundation and support files. The explore skill orchestrates when and how to apply that knowledge.

---

## Common Pitfalls

### Pitfall 1: Reference Files Used as Annotation Model

**What goes wrong:** The planner or implementer treats `explorations/variation-{a,b,c}.html` as the annotation template and generates output without per-usage inline comments — because the reference files don't have them.

**Why it happens:** The reference files are labeled as the "quality bar" and the implementer reads them literally for annotation format.

**How to avoid:** The skill must explicitly state that the annotation requirement (EXPL-03) SUPERSEDES the reference files. The reference files define layout quality and token coverage; the SKILL.md output rules define annotation format. The skill output will have MORE annotation than the reference files — this is by design.

**Warning signs:** Generated HTML with `var()` calls but no inline `/* token-path */` comments.

### Pitfall 2: :root Block Substitutes for Inline Annotation

**What goes wrong:** The generated HTML has a well-annotated `:root` block but no inline comments after individual `var()` calls throughout the CSS.

**Why it happens:** The `:root` block pattern from the reference files is adopted wholesale and the implementer assumes it satisfies EXPL-03.

**How to avoid:** Skill output rules must explicitly state: "A `:root` block is for rendering convenience only — it does not satisfy the annotation requirement. Every `var()` usage in every CSS rule requires an inline comment immediately after."

**Warning signs:** Token annotations only appear in the `:root` block; CSS rules throughout the file use naked `var()` calls.

### Pitfall 3: Trigger Description Too Broad or Too Narrow

**What goes wrong (too broad):** The skill fires when the user asks general design questions, ideation questions, or when they invoke `/gsd-explore` — causing skill collisions.

**What goes wrong (too narrow):** The skill never auto-fires because the trigger only matches the exact string "/bf-explore" — users who describe a layout exploration need don't get the right skill.

**How to avoid:** The description field must contain "HTML layout variations" (plural) as a discriminating phrase, and should reference the concept of "2–3 variations" or "multiple layout options." This anchors it to the specific artifact type without being so narrow it fails to auto-trigger.

**Warning signs:** Description field that says "fires on /bf-explore command" only (too narrow) or "generates Bluefish design output" (too broad).

### Pitfall 4: Hardcoded Hex Values Without ⚠️ Flags

**What goes wrong:** The generated HTML uses hardcoded hex colors for chart series colors (dataviz), elevation-like values (box shadows), or page background — without flagging these as token gaps.

**Why it happens:** The reference files do use hardcoded hex for chart series colors (e.g., `#D77D28`, `#6E36D7`). The implementer copies this pattern without adding gap flags.

**How to avoid:** The skill must instruct Claude to flag all hardcoded hex values that don't correspond to a defined token. Dataviz colors should use `color-roles/dataviz/[NN]/main` CSS vars when possible; when a specific hex is needed for a chart rendering example, flag it: `/* ⚠️ dataviz series — use color-roles/dataviz/01/main token when token injection is resolved */`. The `--page-bg` and `--text-emphasis` vars in reference files also lack token grounding — these are known gaps; the skill should flag them.

**Warning signs:** Output with `stroke="#D77D28"` or `background:#FAFAFA` without any ⚠️ annotation.

### Pitfall 5: Intake Question Exceeds Single Question

**What goes wrong:** The skill asks multiple clarifying questions on bare invocation — screen, constraints, layout preferences, brand emphasis — before generating.

**Why it happens:** A thorough intake seems safer for quality.

**How to avoid:** D-04 is explicit: one question, "What screen or component are we exploring?" No additional intake. Users can add constraints in their response or in follow-up. The skill should generate immediately after the user responds to the single intake question.

**Warning signs:** Skill body with a structured intake form or multiple required fields before generation begins.

---

## Code Examples

### Correct Inline Annotation Format (EXPL-03)

```css
/* Source: CONTEXT.md D-05, confirmed exact format */
.kpi-cell.active {
  background: var(--color-roles-primary-50); /* color-roles/primary/50 */
  border-bottom: 3px solid var(--color-roles-primary-main); /* color-roles/primary/main */
}

.nav-icon.active {
  background: var(--color-roles-primary-50); /* color-roles/primary/50 */
  color: var(--color-roles-primary-main); /* color-roles/primary/main */
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

### Skill Frontmatter

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

### @include + On-Demand Read Instruction Block

```markdown
@~/.claude/skills/bluefish-design-system/SKILL.md

---

## Support Files — Read On Demand

Do not read these at skill start. Read them only when the task requires it:

- Read `~/.claude/skills/bluefish-design-system/tokens.md` when generating CSS token values
- Read `~/.claude/skills/bluefish-design-system/type-styles.md` when setting typography
- Read `~/.claude/skills/bluefish-design-system/figma-reading-guide.md` when interpreting Figma MCP output
```

### Intake Logic (Prose for SKILL.md)

```markdown
## Intake

**If the user provided a screen or component description** (in the /bf-explore message or in
prior conversation context): proceed immediately to generation.

**If invoked bare** (`/bf-explore` with no accompanying context): ask one question:
> "What screen or component are we exploring?"

Do not ask additional questions. Generate 2–3 variations after receiving the response.
```

### Figma MCP Guidance (Prose for SKILL.md)

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

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Monolithic SKILL.md with all workflows | Foundation @include + dedicated command skill | Phase 1 (2026-05-11) | bf-explore skill body is thin workflow-only; all Bluefish knowledge inherited |
| explore workflow inside bluefish-design-system SKILL.md | Standalone bf-explore SKILL.md | Phase 2 (this phase) | Separation of concerns; triggers are more precise |

**Known gaps that affect this phase:**
- Elevation tokens undefined — all `box-shadow` values must be flagged with `⚠️ elevation token undefined`
- DATA-03 (token injection method) unresolved — CSS custom properties path is the correct fallback for standalone HTML exploration files
- `--page-bg` and `--text-emphasis` CSS vars used in reference files have no token counterpart in tokens.md — flag these as `⚠️ no token — page background/emphasis text needs token definition`

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | The `@~/.claude/skills/...` @include directive syntax resolves correctly when the bf-explore skill is placed in `~/.claude/skills/bf-explore/SKILL.md` | Standard Stack | If Claude Code resolves @include relative to the current skill file rather than home-relative, the path would need adjustment. Phase 1 summary confirms the pattern but no bf-explore skill existed yet to confirm cross-skill @include. | 
| A2 | `--radius-sm`, `--radius-md`, `--radius-full` are the conventional CSS var names for radius tokens (not `--scale-radius-sm`) | Code Examples | If the convention is `--scale-radius-*`, the skill's output rules would need different var names. Verified from reference files; tokens.md uses `scale/radius/*` but CSS convention in reference files shortens to `--radius-*`. Low risk. |

**Risk assessment:** Both assumptions are LOW risk — A1 is based on verified Phase 1 patterns (the path `~/.claude/skills/bluefish-design-system/SKILL.md` is confirmed stable), and A2 is directly read from three reference files.

---

## Open Questions

1. **`--page-bg` and `--text-emphasis` token gaps**
   - What we know: Reference files use `--page-bg: #FAFAFA` and `--text-emphasis: #3D3D3D` as CSS vars with no corresponding token in tokens.md
   - What's unclear: Should the skill instruct Claude to use the nearest defined token (`color-roles/background/default` = `#FFFFFF` for backgrounds, `color-roles/text/primary` = `#292929` for text) or replicate the reference var names with a ⚠️ flag?
   - Recommendation: The skill should instruct Claude to prefer defined tokens (`color-roles/background/default`, `color-roles/text/primary`) and flag any deviation — do not perpetuate undocumented CSS vars from the reference files.

2. **`@include` cross-skill resolution**
   - What we know: The path `@~/.claude/skills/bluefish-design-system/SKILL.md` is the established pattern from Phase 1 context
   - What's unclear: Has this exact @include path been exercised in a live skill (not just planned)? Phase 1 verification confirms the foundation exists at the canonical path but no command skill existed yet to test the @include directive resolution.
   - Recommendation: The plan task should include a verification step — after creating the file, invoke `/bf-explore` and confirm it loads the foundation context.

---

## Environment Availability

Step 2.6: SKIPPED — this phase creates a markdown SKILL.md file with no external tool dependencies, no build step, and no runtime requirements. The only "environment" is the Claude Code skills directory, which is confirmed accessible at `~/.claude/skills/`.

---

## Validation Architecture

`workflow.nyquist_validation` is explicitly `false` in `.planning/config.json`. This section is omitted.

---

## Security Domain

No security surface area — this phase creates an LLM instruction file. No authentication, no data persistence, no API calls from code. Omitted.

---

## Sources

### Primary (HIGH confidence)

- `/Users/pcartelli/Desktop/figma-scripter-tools/.planning/phases/02-bf-explore/02-CONTEXT.md` — all locked decisions (D-01 through D-08)
- `~/.claude/skills/bluefish-design-system/SKILL.md` — foundation skill structure, @include expectations, token rules, code output standards
- `~/.claude/skills/bluefish-design-system/tokens.md` — complete token reference, scale/radius values, CSS var naming convention
- `/Users/pcartelli/Desktop/figma-scripter-tools/explorations/variation-a.html` — reference implementation: icon rail layout, :root block pattern, token CSS var names, ARIA usage
- `/Users/pcartelli/Desktop/figma-scripter-tools/explorations/variation-b.html` — reference implementation: rich card grid, full-text nav
- `/Users/pcartelli/Desktop/figma-scripter-tools/explorations/variation-c.html` — reference implementation: detail panel, master-detail pattern
- `/Users/pcartelli/Desktop/figma-scripter-tools/.planning/phases/01-foundation/01-01-SUMMARY.md` — confirmed Phase 1 patterns (foundation-owns-context, on-demand reads, @include path)
- `/Users/pcartelli/Desktop/figma-scripter-tools/.planning/phases/01-foundation/01-VERIFICATION.md` — confirmed Phase 1 artifacts verified; foundation path stable

### Secondary (MEDIUM confidence)

- `gsd-explore` SKILL.md (`~/.claude/skills/gsd-explore/SKILL.md`) — lateral reference for command skill frontmatter structure

### Tertiary (LOW confidence)

None — all findings verified against primary sources.

---

## Metadata

**Confidence breakdown:**
- Skill file structure: HIGH — directly verified from Phase 1 artifacts and existing skills
- @include pattern: HIGH — established and verified in Phase 1 summary
- Token annotation format: HIGH — exact format specified in CONTEXT.md D-05 and confirmed by reading reference files
- Trigger description language: HIGH — derived from D-01/D-02 decisions and verified Phase 1 description-field pattern
- Reference file layout patterns: HIGH — directly read all three variation HTML files
- Gap handling (DATA-03, elevation): HIGH — foundation SKILL.md documents these explicitly

**Research date:** 2026-05-11
**Valid until:** 2026-06-11 (stable — no external dependencies, all sources are local files)
