# Requirements

**Project:** Bluefish Design System Skill System
**Scope:** v1.1 — /bf-spec + /bf-build | v1 — Foundation + /bf-explore + /bf-prototype

---

## v1 Requirements

### Foundation

- [ ] **FOUND-01**: Shared context layer refactored — `bluefish-design-system` SKILL.md contains only the shared foundation (token rules, a11y standards, Figma reading guide, component conventions); all command-specific workflow logic moved to dedicated command skills
- [ ] **FOUND-02**: Skill trigger descriptions rewritten — each skill's `description:` frontmatter field is specific enough that Claude auto-triggers the correct skill without a manual slash command
- [ ] **FOUND-03**: Support files audited — `tokens.md`, `type-styles.md`, `tokens-dataviz.md`, `figma-reading-guide.md`, and `spec-template.md` verified complete and consistent with current token state (outline rename applied, any other drift corrected)

### /bf-explore

- [x] **EXPL-01**: `/bf-explore` SKILL.md created at `~/.claude/skills/bf-explore/SKILL.md` with a focused layout variation workflow
- [x] **EXPL-02**: Skill generates 2–3 meaningfully distinct HTML layout variations (not cosmetic differences — distinct layout or interaction patterns)
- [x] **EXPL-03**: Every Bluefish value in output is annotated with its token path inline (`background-color: var(--color-roles-primary-main); /* color-roles/primary/main */`)
- [x] **EXPL-04**: Skill fires correctly when a user asks for layout explorations or variations on a Bluefish screen

### /bf-prototype

- [x] **PROT-01**: `/bf-prototype` SKILL.md created at `~/.claude/skills/bf-prototype/SKILL.md` with a prototype generation workflow
- [x] **PROT-02**: HTML prototype mode — quick, no build step, full Bluefish token usage, interaction states via CSS or minimal JS
- [x] **PROT-03**: Vite+MUI scaffold mode — runnable prototype with `useState` for interaction states, MUI wrapping pattern, DM Sans, reset styles applied
- [x] **PROT-04**: All prototype output uses `color-roles` token paths, correct MUI components, and required ARIA props — zero hardcoded hex or px literals
- [x] **PROT-05**: Skill fires correctly when a user asks to prototype a Bluefish screen or interaction

---

## v1.1 Requirements

### /bf-spec

- [ ] **SPEC-01**: `/bf-spec` SKILL.md created at `~/.claude/skills/bf-spec/SKILL.md` with the three-tool Figma MCP sequence (`get_metadata` → `get_variable_defs` → `get_design_context`) as the core data-gathering mechanic
- [ ] **SPEC-02**: Skill fires correctly when user types `/bf-spec` or asks for a spec or handoff doc for a Bluefish screen

### /bf-build

- [ ] **BUILD-01**: `/bf-build` SKILL.md created at `~/.claude/skills/bf-build/SKILL.md` supporting two intake paths — Path A: Figma frame open (reads via MCP), Path B: existing `/bf-spec` output file provided
- [ ] **BUILD-02**: Skill fires correctly when user types `/bf-build` or asks to build or implement a Bluefish component from a spec or Figma frame

---

## Future Requirements

- `/bf-spec` full handoff doc: component inventory, redline specs, interaction notes in spec-template.md format
- `/bf-spec` Code Connect graceful degradation: detects prompt interrupt, continues with `⚠️` flag
- `/bf-build` production output quality: named wrapper, TypeScript interface extending MUI types, DATA-03 dual-path enforcement
- `/bf-audit` skill — scan existing code for hardcoded values, suggest token replacements
- `/bf-tokens` skill — quick token lookup and design decision support
- `/bf-handoff` skill — combined spec + implementation notes for engineering
- AI Insights screen patterns — KPI strip, trend chart tabs, card grid, detail panel

---

## Out of Scope

- Figma scripter CLI tools (color-scale-generator, token-exporter, etc.) — separate project
- Code Connect setup — engineering dependency, not a skill problem
- Token injection method resolution (DATA-03) — engineering dependency
- Elevation token definition — design decision, not a skill problem
- Dark mode contrastText fix — design decision pending

---

## Traceability

| Requirement | Phase |
|-------------|-------|
| FOUND-01 | Phase 1 |
| FOUND-02 | Phase 1 |
| FOUND-03 | Phase 1 |
| EXPL-01 | Phase 2 |
| EXPL-02 | Phase 2 |
| EXPL-03 | Phase 2 |
| EXPL-04 | Phase 2 |
| PROT-01 | Phase 3 |
| PROT-02 | Phase 3 |
| PROT-03 | Phase 3 |
| PROT-04 | Phase 3 |
| PROT-05 | Phase 3 |
| SPEC-01 | Phase 4 |
| SPEC-02 | Phase 4 |
| BUILD-01 | Phase 5 |
| BUILD-02 | Phase 5 |
