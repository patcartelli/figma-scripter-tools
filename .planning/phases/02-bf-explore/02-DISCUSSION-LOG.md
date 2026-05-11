# Phase 2: /bf-explore - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-11
**Phase:** 2-bf-explore
**Areas discussed:** Trigger language, Input intake, Token annotation format, Figma MCP stance

---

## Trigger Language

| Option | Description | Selected |
|--------|-------------|----------|
| Layout explorations | Catches explicit layout/variation language only — "show me layout options", "explore variations for this screen" | ✓ |
| Any Bluefish screen exploration | Broader intent — "explore this", "what could this look like", "ideate on..." | |
| Explicit slash command only | No auto-trigger; description: field is minimal | |

**User's choice:** Layout explorations
**Notes:** Narrower trigger prevents collision with general design discussion and prototyping requests.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — 'HTML layout variations' in description | Makes the explore vs. prototype distinction explicit in the trigger | ✓ |
| No — variation count is enough | "2–3 variations" framing already signals exploration | |

**User's choice:** Yes — include "HTML layout variations" in the description field
**Notes:** Both skills produce HTML; the "variations" + "layout" language is the differentiator.

---

## Input Intake

| Option | Description | Selected |
|--------|-------------|----------|
| Work immediately with what's in the conversation | No intake step; user provides description inline or in prior context | |
| Structured intake — ask before generating | Always asks: screen, constraints, what to avoid | |
| Hybrid — ask only if nothing provided | If user provided context, work immediately; if bare invocation, ask one question | ✓ |

**User's choice:** Hybrid
**Notes:** Balances speed with reliability. Most invocations will have context.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Just the screen/component | "What screen or component are we exploring?" — one question, then generate | ✓ |
| Screen + constraints together | Two things in one prompt | |
| You decide | Claude's discretion | |

**User's choice:** Just the screen/component
**Notes:** Constraints can be added by user in follow-up. Keep intake minimal.

---

## Token Annotation Format

| Option | Description | Selected |
|--------|-------------|----------|
| Comment after every var() in CSS rules | `background: var(--color-roles-primary-main); /* color-roles/primary/main */` — matches EXPL-03 literally | ✓ |
| Annotated :root block only | Cleaner output; annotate :root vars but not individual usages | |

**User's choice:** Comment after every var() in CSS rules
**Notes:** The reference explorations are the quality bar, not the annotation model. EXPL-03 is literal.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — ⚠️ flag + explanation | Non-token values get `/* ⚠️ no token — [reason] */` | ✓ |
| No — just use clean tokens | Enforce token-only output; no flags | |

**User's choice:** Yes — ⚠️ flag + explanation
**Notes:** Consistent with DATA-03 and elevation gap handling already in the foundation.

---

## Figma MCP Stance

| Option | Description | Selected |
|--------|-------------|----------|
| Explicitly skip MCP | "Do not call Figma MCP. Generate from conversation context only." | |
| Opportunistic — use if available | If user has Figma screen open or provides URL, use get_figma_data; otherwise proceed from description | ✓ |
| Inherit silently | Don't override foundation's MCP guidance | |

**User's choice:** Opportunistic — use if available
**Notes:** Better output when Figma is present; no dependency when it's not.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Acknowledge + continue | On Code Connect interrupt, ⚠️ inline and proceed with what was returned | ✓ |
| Skip MCP on Code Connect prompt | Abort MCP call entirely, fall back to description-only | |

**User's choice:** Acknowledge + continue
**Notes:** Same graceful gap handling as the foundation. Don't discard partial MCP results.

---

## Claude's Discretion

- What constitutes "meaningfully distinct" layout variations is left to Claude's judgment, using the `explorations/variation-{a,b,c}.html` reference set as the bar. Cosmetic changes (color swap, padding tweak) do not qualify.

## Deferred Ideas

None — discussion stayed within phase scope.
