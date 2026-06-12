# Phase 5 Handoff — /bf-build Pre-Work Context

**Created:** 2026-06-12
**From:** External review + fix session on the team repo (outside GSD workflow)
**Consumes into:** `/gsd:discuss-phase 5`
**Phase 4 status:** Complete ✓ (3/3 plans, human-verified 2026-06-11) — but see "Phase 4 behavior changed post-verify" below.

---

## What happened since Phase 4 closed

The skill repo was handed to the Bluefish team at `https://github.com/patcartelli/bluefish-ai-skills`. Two external review passes (skill-level, then data/exemplar-level with three parallel reviewers) ran against it on 2026-06-11/12, and all fixes were applied and pushed. Repo is clean and in sync at commit `d0f29d2`.

Commits since Phase 4 verify:

| Commit | What |
|---|---|
| `3bf0a61` | bf-spec added to repo; README covers all four skills; `.claude/` gitignored |
| `6da4a1d` | Portability pass: bf-explore reference HTML vendored into `bf-explore/references/`, planning decision-IDs (D-xx, EXPL-xx, DATA-xx) stripped from team-facing skill text, line-number refs → heading refs, foundation-include fallback blockquote added to all command skills |
| `037d138` | bf-spec intake reorder (see below) — verified by 3-scenario test battery |
| `d0f29d2` | Second review pass: token-path corrections, exemplar alignment, a11y data fixes |

## ⚠️ File layout changed — affects how Phase 5 writes bf-build

Canonical skill source is now the git repo `~/dev/bluefish-ai-skills/`, with symlinks from `~/.claude/skills/{bf-explore,bf-prototype,bf-spec,bluefish-design-system}`. **Phase 5 must create `bf-build/` inside `~/dev/bluefish-ai-skills/` and symlink it into `~/.claude/skills/`** — not write a loose directory like Phase 4 originally did.

## ⚠️ Phase 4 behavior changed post-verify

The 04-03 human verify validated five scenarios; one has since been deliberately changed (commit `037d138`): **bare `/bf-spec` now calls `get_metadata` FIRST** and only asks "What screen or component are you speccing?" if the selection is empty and there's no conversation context. (Previously it asked before any MCP call.) Re-verified by scenario tests; the "bare invoke" UAT scenario description in Phase 4 artifacts is stale. Two smaller changes: MCP-down output now derives the filename from the user's description and emits `**Source:** ⚠️ source page unknown — Figma MCP unavailable`; Code Connect flags are scoped to actual Code Connect prompt interruptions only.

## Decisions made during review that bind Phase 5

1. **Dataviz token source (corrected):** chart-series tokens are `color-roles/dataviz/[NN]/[property]` defined in **tokens.md**; `tokens-dataviz.md` is the raw source palette (`palette/dataviz/dv/*`) for gradients/tints only. bf-prototype previously mandated a nonexistent `color-dataviz/categorical/*` format — fixed. bf-build must emit `color-roles/dataviz/*` paths.
2. **Typography annotation format:** `/* type: H1 */` style — top-level style names only, never `/`-nested paths.
3. **Build-request routing (interim):** every skill description now says "bf-build — planned, not yet available"; the foundation explicitly catches build/implement requests in the meantime (its description, a Known Gaps entry, and a README known-limitations entry all say so). **Phase 5 must reclaim these:** update all four skill descriptions, the foundation Known Gaps entry, the foundation description's "including build and implementation requests until bf-build ships" clause, and the README — this is a concrete task to put in the Phase 5 plan so the interim routing doesn't linger.
4. **Sub-component spec format is now real:** `spec-autocomplete.md` was restructured to actually use `### Sub-component: [Name]` sections (it previously contradicted the bf-spec rule that cites it). All spec examples now open with `## [Component Name]` (H2), matching the template. **Path B's parser can rely on:** H2 component heading → `### Variants & States / Props / Tokens Used / Type Styles / Accessibility / Figma Reference / ### Sub-component: [Name] / ### Notes` order.
5. **Diagnostics no longer embed install paths:** the MCP-unavailable comment is now "tokens from cached Bluefish reference (tokens.md, …)". bf-build should use the same phrasing.
6. **MCP-order precedence:** the foundation now defers to the invoking command skill's MCP sequence. bf-build should declare its own sequence explicitly (Path A presumably `get_variable_defs` + `get_design_context`; ROADMAP success criterion 2 says so).
7. **Vite runnability:** bf-prototype now emits a scaffold command (`npm create vite@latest … --template react-ts`) alongside App.tsx/main.tsx. bf-build's output-completeness bar should be at least this (likely full file set since it's production code).

## Open questions — status after review

| Question | Status |
|---|---|
| DATA-03 token injection (MUI theme vs CSS custom props) | **Still open.** Dual-path output with `⚠️ token injection method unconfirmed` flag reaffirmed and kept in bf-prototype + foundation. Note: the "DATA-03" label was stripped from team-facing skill text — keep the ID in .planning only. |
| React 18 (forwardRef) vs React 19 | **Untouched — resolve in discuss-phase.** |
| Screen-level scoping: single doc vs multiple files | **Effectively answered by Phase 4:** screen mode ships ONE file (`spec-[screen].md` with Component Inventory + per-component H2 sections). Path B should parse that single-doc format; decide in discuss-phase whether bf-build builds one component per invocation or iterates the inventory. |
| `get_context_for_code_connect` vs `get_design_context` | **Still open.** Code Connect remains unconfigured (Known Gap); the degrade-gracefully decision stands and is encoded in all skills' flag patterns. |
| Composite recursion stopping rule | **Phase 4 shipped one-level recursion**; deeper composites are noted in the parent spec's `### Notes` as candidates for their own `/bf-spec` run. Path B will therefore encounter specs that reference other specs (e.g. spec-autocomplete points to spec-text-field.md) — decide how bf-build resolves those references. |

## Known data gaps that will affect bf-build output quality

- `Button M` and `Button S` resolve to identical values in type-styles.md — suspected data error (S likely `sm`), flagged there and in foundation Known Gaps. Verify in Figma before bf-build maps button sizes.
- Dataviz contrast failures are now SIX series: 04, 10, 13, **15**, 25, 29 (15 was newly found at 1.4:1; series 13's old "4.2:1" figure was mis-attributed — 4.2 is its white-on-main fallback). Recovery rules in foundation + tokens.md.
- Elevation tokens still undefined; dark-mode contrastText on warning/info/success still fails AA. Both flagged-output patterns unchanged.

## Loose ends (not Phase 5 blockers)

- `color-scale-generator.js` has an uncommitted change in this repo (flagged by GSD status) — commit or stash before advancing.
- The foundation's Figma MCP setup pointer ("see the Bluefish AI Assistant documentation") and the `tokens.json` / `bluefish-tokens` repo references still have no links a new hire can follow.
- Review-fix learnings worth extracting via `/gsd:extract-learnings`: the two review passes caught invented token paths and exemplar/rule contradictions that "verify against the file you cite" planning checks would have prevented.
