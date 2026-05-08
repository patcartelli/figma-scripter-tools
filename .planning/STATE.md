# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-05-08)

**Core value:** Start a screen and the Bluefish design language just works — no manual token lookup, no per-session setup, no drift.
**Current focus:** Phase 1 — Foundation

## Current Phase

**Phase 1: Foundation**
Status: Execution complete — 2/2 plans done, pending verification
Goal: Refactor `bluefish-design-system` into a clean shared context layer
Plans: `.planning/phases/01-foundation/01-01-PLAN.md`, `01-02-PLAN.md`
Last updated: 2026-05-08

## Phase Progress

| Phase | Name | Status |
|-------|------|--------|
| 1 | Foundation | Executing — 2/2 plans complete, verifying |
| 2 | /bf-explore | Not started |
| 3 | /bf-prototype | Not started |

## Decisions Log

| Date | Decision | Outcome |
|------|----------|---------|
| 2026-05-08 | Skill system over monolithic skill | Pending |
| 2026-05-08 | Build and refactor together (first command skill shapes foundation) | Pending |
| 2026-05-08 | Start v1 with /bf-explore and /bf-prototype; defer /bf-spec and /bf-build | Pending |
| 2026-05-08 | Vertical MVP structure — each phase delivers a working skill | Pending |
| 2026-05-08 | Team-ready from day one | Pending |

## Open Questions

- Which command skill should come first to best shape the foundation split: `/bf-explore` (simpler, no Figma MCP) or `/bf-prototype` (most urgent need)?
- Code Connect timeline — when can engineering unblock `/bf-spec`?
- DATA-03 resolution — token injection method confirmed as MUI theme extension or CSS custom properties?
