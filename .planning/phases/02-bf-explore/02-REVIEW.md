---
phase: 02-bf-explore
reviewed: 2026-05-11T00:00:00Z
depth: standard
files_reviewed: 1
files_reviewed_list:
  - /Users/pcartelli/.claude/skills/bf-explore/SKILL.md
findings:
  critical: 2
  warning: 5
  info: 2
  total: 9
status: issues_found
---

# Phase 02: Code Review Report — bf-explore SKILL.md

**Reviewed:** 2026-05-11
**Depth:** standard
**Files Reviewed:** 1
**Status:** issues_found

## Summary

`bf-explore` is a well-structured skill with clear intake gating and detailed output rules. The inheritance from `bluefish-design-system` is the right pattern. However, there are two blockers: the Figma MCP workflow omits the `get_variable_defs` live-token call that the parent skill mandates, and the Style Reference section hardcodes absolute machine-local paths that will silently fail on any machine other than the author's. Five warnings address ambiguities that will produce inconsistent model behavior: the Code Connect inline note conflicts with the parent skill's tool name, the CSS var naming rule has an unresolved contradiction with the parent skill's token paths, the "opportunistic" Figma framing leaves the agent without a tie-breaker when context is partial, gap-flagging examples use a different `⚠️` suffix than the parent skill's canonical form, and no fallback annotation format is specified when a token path is genuinely unknown. Two info items cover minor clarity gaps.

---

## Critical Issues

### CR-01: Style Reference uses absolute machine-local file paths

**File:** `SKILL.md:49-51`
**Issue:** The Style Reference section instructs the model to read three files at paths beginning with `/Users/pcartelli/Desktop/figma-scripter-tools/explorations/...`. These paths are hard-coded to one specific machine. On any other machine, or if the project root moves, all three `Read` calls will fail silently — the model will proceed without the quality bar, CSS var naming convention, or `:root` block convention those files are meant to establish, producing lower-quality output with no error.

The bluefish-design-system skill correctly uses `~/.claude/skills/...` for its own support files. The exploration references should follow the same pattern or use a path relative to the project root that is resolved at runtime.

**Fix:** Replace the absolute paths with paths relative to the skill or project root, or use a tilde-relative path that resolves correctly regardless of machine:

```markdown
- `explorations/variation-a.html` — 56px icon rail + KPI strip + full-width chart
- `explorations/variation-b.html` — 222px text nav + rich card grid with embedded breakdown bars
- `explorations/variation-c.html` — 222px text nav + KPI strip + 300px detail panel
```

Instruct the model to resolve these relative to the project root provided in the session working directory. Alternatively, annotate with `[project-root]/explorations/...` and include a note that `[project-root]` is the cwd.

---

### CR-02: Figma MCP workflow omits mandatory `get_variable_defs` live-token call

**File:** `SKILL.md:37-43` (Figma Context section)
**Issue:** The inherited `bluefish-design-system` skill declares at line 28: "At the start of every session with Figma Desktop open, call `get_variable_defs` on the open node to pull live token values. **Live values are authoritative for the session.**" The `bf-explore` skill's Figma Context section overrides this workflow with only `get_figma_data` (structural data) and no mention of `get_variable_defs`. A model following `bf-explore`'s Figma workflow will skip the authoritative live-token pull and fall back to `tokens.md`, using static values that may be stale, without flagging the fallback per the parent skill's requirement (`/* ⚠️ live token data unavailable — using tokens.md */`).

This is a behavioral inconsistency between child and parent skills that will produce token annotation errors on every Figma-grounded generation.

**Fix:** Extend the Figma Context section to include the `get_variable_defs` call before `get_figma_data`:

```markdown
## Figma Context (Opportunistic)

If the user has a Figma screen open in Figma Desktop or provides a Figma URL:

1. Call `get_variable_defs` on the open node to pull live token values (per bluefish-design-system). Live values are authoritative — use them instead of `tokens.md`.
2. Call `get_figma_data` to read component/frame info.
3. Use the returned structure to ground layout decisions (component names, hierarchy, content types).
4. If `get_figma_data` triggers a Code Connect prompt: note it inline and continue with data returned before the prompt.

If `get_variable_defs` fails: read `tokens.md` and flag every token reference with `/* ⚠️ live token data unavailable — using tokens.md */`.
```

---

## Warnings

### WR-01: Code Connect inline note uses wrong tool name

**File:** `SKILL.md:41`
**Issue:** The Figma Context section says to note a Code Connect prompt with `⚠️ Code Connect not configured — proceeding from conversation context`. But the bluefish-design-system Known Gaps section (line 189) names the tool that triggers this as `get_design_context`, not `get_figma_data`. The parent skill also uses `get_design_context` in that context. If the correct tool name is `get_design_context`, then the bf-explore workflow calls the wrong tool entirely, and the Code Connect handling will never be encountered via `get_figma_data`. If `get_figma_data` is correct for the explore workflow, the inline warning message and the anti-pattern entry (line 107) are consistent with each other, but a clarifying note about why this skill uses a different tool than the parent would prevent model confusion.

**Fix:** Confirm the correct MCP tool for reading frame structure in an explore context. If it is `get_design_context` (consistent with parent), update lines 39 and 107 to use that name. If `get_figma_data` is intentionally different, add a one-line note explaining why.

---

### WR-02: CSS var naming rule conflicts with parent skill's token-to-code mapping

**File:** `SKILL.md:98`
**Issue:** Output Rule 8 states: "Use the shortened CSS var names observed in the reference files: `--radius-sm`, `--radius-md`, `--radius-full` (not `--scale-radius-*`)." The parent skill's token-to-code mapping (bluefish-design-system line 143) maps `scale/4` to `var(--scale-4)`, implying a `--scale-*` namespace for spacing. The reference files confirm `--scale-1` through `--scale-6` for spacing. But Rule 8 only addresses radius, leaving the model without a rule for spacing var names: should spacing be `--scale-4` (matching reference files and parent mapping) or some other shortened form? The inconsistency between "shortened names" and the parent's `--scale-*` convention is unresolved.

Additionally, the inline comment annotation format in Rule 4 shows `var(--scale-4); /* scale/4 */` (using `--scale-4`), which matches the parent. But Rule 8's "shortened CSS var names" framing may lead the model to invent further shortenings for spacing that break CSS resolution.

**Fix:** Extend Rule 8 to explicitly cover all token groups:

```markdown
**CSS variable naming convention:** Follow the conventions in the reference files:
- Spacing: `--scale-N` (e.g., `--scale-4`) — do NOT shorten further
- Radius: `--radius-sm`, `--radius-md`, `--radius-full` (NOT `--scale-radius-*`)
- Color: `--color-roles-[path-with-hyphens]` (e.g., `--color-roles-primary-main`)
Inline comments always use the full canonical token path (e.g., `/* scale/4 */`, `/* scale/radius/sm */`).
```

---

### WR-03: Gap-flagging `⚠️` comment suffix differs from parent skill's canonical form

**File:** `SKILL.md:85-91`
**Issue:** Rule 5 (Gap flagging) specifies two suffix forms:
- `/* ⚠️ no token — elevation TBD */` (line 85)
- `/* ⚠️ no token — elevation undefined */` (line 88, under "Known gaps")
- `/* ⚠️ dataviz series — use color-roles/dataviz/[NN]/main token when token injection is resolved */` (line 91)

The parent skill's canonical form (bluefish-design-system line 66) is: `/* ⚠️ no token for [value] — needs token */`. Rule 7 of the parent also states: `/* ⚠️ elevation token undefined — omit elevation; flag for design review */`. These forms conflict — the child skill produces different flag text than the parent, making it impossible for a downstream grep or audit to reliably find all flagged values.

**Fix:** Align the gap-flagging examples in Rule 5 with the parent skill's canonical forms:

```markdown
- All `box-shadow` values → `/* ⚠️ elevation token undefined — omit elevation; flag for design review */`
- Dataviz series hardcoded hex → `/* ⚠️ no token for [value] — needs token */`
```

Or explicitly document that bf-explore uses different suffixes and explain why.

---

### WR-04: "Opportunistic" Figma framing leaves no tie-breaker for partial context

**File:** `SKILL.md:37`
**Issue:** The Figma Context section heading says "Opportunistic" and describes two binary states: Figma open (full MCP workflow) vs. no Figma context (generate from description). There is no handling for the partial case: the user provides a Figma URL but Figma Desktop is not open, or `get_figma_data` returns a partial result (some components resolved, others not). The only partial-result handling is for Code Connect prompts (line 41), but that covers a different failure mode. Without a rule for partial structural data, the model may either halt waiting for complete data or silently generate from partial context without flagging which components were missing.

**Fix:** Add a partial-context rule:

```markdown
**Partial MCP results (non-Code-Connect):** If `get_figma_data` returns data for some components but errors on others, use what was returned and flag the gaps inline: `<!-- ⚠️ get_figma_data returned partial results — [component name] not resolved; generating from conversation context -->`. Do not halt generation.
```

---

### WR-05: No annotation format specified when a token path is genuinely unknown

**File:** `SKILL.md:64-79` (Output Rule 4)
**Issue:** Rule 4 (EXPL-03) mandates an inline `/* token/path */` comment on every `var()` usage. Rule 5 (D-06) covers values without a clean token path. But there is no rule for the case where a CSS property uses a var (e.g., a var defined in `:root`) whose token mapping is uncertain — i.e., the var exists but its canonical token path is not clearly resolvable. The reference files themselves use `--page-bg` and `--text-emphasis`, which the Anti-Patterns section (line 92) flags as non-token vars. If the model emits a `var(--page-bg)` usage (inherited from reference style), what annotation should follow? Rule 4 requires an annotation; Rule 5 covers hardcoded values but not custom-property-to-unknown-token situations.

**Fix:** Add a clause to Rule 4 covering vars without a confirmed token path:

```markdown
If a CSS custom property does not map to a confirmed token path (e.g., `--page-bg`, `--text-emphasis`), replace it with the correct token var and annotate, or flag inline: `var(--page-bg) /* ⚠️ no token mapping — prefer var(--color-roles-background-default) */`.
```

---

## Info

### IN-01: `@include` directive is undocumented — its behavior is implicit

**File:** `SKILL.md:10`
**Issue:** Line 10 uses `@~/.claude/skills/bluefish-design-system/SKILL.md` without explanation. The skill itself says the file "inherits" from bluefish-design-system "via the `@include` above" (line 14), but the directive syntax is never defined anywhere in this skill or (from inspection) in the bluefish-design-system skill. If this is a custom directive interpreted by the skill loader, its behavior — does it prepend the entire parent file? does it merge sections? does it make the parent's support-file rules active? — is assumed rather than stated. A reader (or a model cold-reading this skill) cannot verify that the inheritance actually loads the parent's token rules and accessibility standards without knowing the directive semantics.

This is low-risk if the loader behavior is consistent, but it creates a maintenance hazard: any change to the loader's `@` directive interpretation silently changes this skill's behavior.

**Fix:** Add a one-line comment immediately after the directive explaining what it does:

```markdown
@~/.claude/skills/bluefish-design-system/SKILL.md
<!-- Loads the full bluefish-design-system SKILL.md at this point — all token rules, a11y standards, and code output rules from that file apply to this skill. -->
```

---

### IN-02: "Study these files before generating" conflicts with on-demand loading model

**File:** `SKILL.md:47-53` (Style Reference section)
**Issue:** The Style Reference section says "Study these files before generating" (line 47), which implies eager loading. The Support Files section (lines 18-23) explicitly says "Do not read these at skill start. Read them only when the task requires it." These two instructions use opposite loading strategies. A model without a strong prior will need to choose which strategy applies to style references, and may either always-load all three exploration files (high context cost per invocation) or never load them (defeating the quality-bar purpose).

**Fix:** Clarify the loading trigger for Style Reference files:

```markdown
**Read these before generating your first variation** (not at skill start, but immediately before output):
```

This makes the intent unambiguous without changing the behavior.

---

_Reviewed: 2026-05-11_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
