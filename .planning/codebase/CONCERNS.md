# Codebase Concerns

**Analysis Date:** 2026-05-07

## Tech Debt

**Duplicated OKLCH color math:**
- Issue: Color scale math copy-pasted between `color-scale-generator.js` and `regenerate-palette-tokens.js` — any fix must be applied in both places
- Files: `color-scale-generator.js`, `regenerate-palette-tokens.js`
- Impact: Silent drift between the two implementations over time; bugs fixed in one won't be fixed in the other
- Fix approach: Extract shared OKLCH math into a common utility module

**Duplicated WCAG contrast functions:**
- Issue: WCAG contrast calculation reimplemented in two separate scripts
- Files: `fix-onlight-contrast.js`, `update-dataviz-contrast-tokens.js`
- Impact: Same drift risk as above; contrast logic may behave differently
- Fix approach: Extract into shared `contrast-utils.js`

**Variable alias resolution reimplemented 3 ways:**
- Issue: Each script reimplements alias resolution with different behavior; only `apply-color-tokens.js` has a cycle guard
- Files: `color-scale-generator.js`, `swatch-generator.js`, `apply-color-tokens.js`
- Impact: Unguarded scripts will crash on circular aliases
- Fix approach: Centralize alias resolution with cycle guard in shared utility

## Known Bugs

**README scale step mismatch:**
- Symptoms: README documents 8 scale steps; generator actually produces 13 (steps 350, 450, 550, 600, 700 undocumented)
- Files: `README.md`, `color-scale-generator.js`
- Trigger: Any use of the generator will produce undocumented tokens
- Workaround: None — documentation is just wrong

**`fix-onlight-contrast.js` writes raw hex instead of token refs:**
- Symptoms: Script computes `chosen.ref` (the variable alias to write) but actually writes `chosen.hex` (raw hex value) — silently defeats `wire-color-role-refs.js`
- Files: `fix-onlight-contrast.js`
- Trigger: Every run of fix-onlight-contrast
- Workaround: Run `wire-color-role-refs.js` after to re-establish refs, but they'll be overwritten on next run

**`apply-color-tokens.js` overwrites all solid fills:**
- Symptoms: Script replaces all visible solid fills on a matched rectangle, not just the target fill
- Files: `apply-color-tokens.js`
- Trigger: Any frame with multiple solid fills on a rectangle
- Workaround: Use single-fill rectangles only

## Security Considerations

**Hardcoded path inconsistency:**
- Risk: `fix-onlight-contrast.js` and `wire-color-role-refs.js` use different default paths (`~/bf-tokens/` vs `~/bf-tokens/tokens/`) — one will silently fail against a fresh checkout
- Files: `fix-onlight-contrast.js`, `wire-color-role-refs.js`
- Current mitigation: None
- Recommendations: Centralize path config; add existence check with clear error message

## Performance Bottlenecks

**No significant performance issues detected** for a scripting tool of this size.

## Fragile Areas

**`isSwatchFrame` heuristic:**
- Files: `swatch-generator.js`
- Why fragile: False-positives on any frame containing a rectangle + text, regardless of intent
- Safe modification: Add additional structural checks (e.g., naming conventions, specific child count)
- Test coverage: None

**Alias cycle guard missing in two scripts:**
- Files: `color-scale-generator.js` (`resolveVariableColor`), `swatch-generator.js` (`resolveColorByMode`)
- Why fragile: A circular alias will cause infinite recursion / crash
- Safe modification: Add visited-set guard (see `apply-color-tokens.js` for reference implementation)
- Test coverage: None

## Dependencies at Risk

**`print()` global:**
- Risk: `print()` is a Figma Scripter-only global; not available in the standard Plugin API or Node.js
- Impact: Scripts using `print()` cannot be migrated to standard Figma plugins or run in Node.js
- Migration plan: Replace with `console.log()` which works in both environments

**No `package.json` module type declaration:**
- Risk: Three Node.js scripts use ES module syntax without `"type": "module"` in package.json
- Impact: Will fail with `SyntaxError: Cannot use import statement` in Node.js without explicit `.mjs` extension or package config
- Migration plan: Add `package.json` with `"type": "module"`

## Missing Critical Features

**No shared utility layer:**
- Problem: Color math, contrast calculation, and alias resolution are each duplicated across 2-3 scripts
- Blocks: Safe refactoring, consistent behavior, single bug-fix point

## Test Coverage Gaps

**Zero tests across all scripts:**
- What's not tested: Every function in all 8 scripts
- Files: `color-scale-generator.js`, `swatch-generator.js`, `apply-color-tokens.js`, `token-exporter.js`, `fix-onlight-contrast.js`, `regenerate-palette-tokens.js`, `update-dataviz-contrast-tokens.js`, `wire-color-role-refs.js`
- Risk: Any change can silently break behavior; the `fix-onlight-contrast.js` ref/hex bug above went undetected
- Priority: High — especially for shared math utilities once extracted

---

*Concerns audit: 2026-05-07*
