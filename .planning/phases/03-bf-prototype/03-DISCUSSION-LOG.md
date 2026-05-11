# Phase 3: /bf-prototype — Discussion Log

**Date:** 2026-05-11
**Areas discussed:** Sub-mode selection, Prototype scope, Trigger phrase, Figma integration

---

## Sub-mode Selection

**Q: How does the skill decide between HTML vs Vite+MUI?**
Options: Skill infers from cues / Always ask upfront / HTML-first, Vite on request
**Selected:** Always ask upfront

**Q: When screen context is present, still ask mode question?**
Options: Always ask mode first / Context can pre-answer it too
**Selected:** Always ask mode first

**Q: If user provides screen description in /bf-prototype message, what's the flow?**
Options: One question then generate / Two questions max
**Selected:** One question then generate

---

## Prototype Scope

**Q: How much of the screen should a prototype cover by default?**
Options: Full page with nav shell / Target component only / Claude decides from context
**Selected:** Full page with nav shell

**Q: Interaction states minimum?**
Options: Default + hover + selected / Default state only / All interactive states
**Selected:** Default + hover + selected

**Q: Vite+MUI deliverable?**
Options: Single-screen scaffold, no routing / Full Vite scaffold with routing
**Selected:** Single-screen scaffold, no routing

---

## Trigger Phrase

**Q: What phrase should anchor the bf-prototype description?**
Options: "prototype" or "working prototype" / "Vite+MUI scaffold" or "React prototype"
**Selected:** "prototype" or "working prototype"

**Q: Catch "build" or "implement" phrases too?**
Options: Stay narrower — "prototype" only / Catch "build" and "implement" too
**Selected:** Stay narrower — "prototype" only

---

## Figma Integration

**Q: How important is Figma context to the prototype skill?**
Options: Same as bf-explore — opportunistic / Actively prompt in Vite mode / Always opportunistic but prioritized
**Selected:** Same as bf-explore — opportunistic

**Q: If Figma open, call get_variable_defs in addition to get_figma_data?**
Options: Yes — call both / get_figma_data only
**Selected:** Yes — call both

---

*All decisions captured in 03-CONTEXT.md*
