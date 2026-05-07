# Testing Patterns

**Analysis Date:** 2026-05-07

## Test Framework

**Runner:** None detected.

No test runner, test config, or test files exist in this repository. There is no `package.json`, no `jest.config.*`, no `vitest.config.*`, and no `*.test.js` or `*.spec.js` files.

**Assertion Library:** None.

**Run Commands:** Not applicable.

## Why No Tests Exist

The codebase consists entirely of Figma Scripter scripts (run interactively inside Figma's plugin sandbox) and small Node.js CLI utilities. The dominant Figma Scripter environment does not support a module system or testable exports — scripts are pasted into the Scripter panel and executed directly against a live Figma document. This makes conventional unit testing impractical for those scripts without significant refactoring.

The three Node.js scripts (`fix-onlight-contrast.js`, `regenerate-palette-tokens.js`, `wire-color-role-refs.js`) are small CLI tools (46–113 lines) that are manually verified by inspecting their terminal output and the resulting JSON files.

## What Is Manually Verified

Scripts output explicit success/failure summaries that serve as lightweight manual verification:

**Node.js scripts** print tabular output to stdout, e.g.:
```
Group  Light(100)  onLight chosen          Ratio
─────  ──────────  ──────────────────────  ─────
  01   #EEF2FF     step 500 (#4F46E5)      5.21
...
✓ 12 onLight values updated → ~/bf-tokens/tokens/tokens.json
```

**Figma Scripter scripts** use a structured console log prefix scheme:
```
[OK]  "primary/main" → [color-roles] primary/main  (#3B82F6 @ 100%)
[--]  "neutral/100"  — no match  #F9FAFB @ 100%  hints: [neutral/100]
[ERR] "dv/05/500": Cannot set fills on locked node
Done.  Applied: 47  |  Not found: 3  |  No fill: 2
```

**Debug mode** is available in `apply-color-tokens.js` via `const DEBUG_LIST_VARS = false` at line 16 — set to `true` to print all COLOR variables and exit early, allowing manual inspection of available token names.

## Testable Logic

The pure color math functions are the only logic well-suited to automated unit testing. They exist in multiple files:

- `color-scale-generator.js`: `linearize`, `gammaCompress`, `rgbToOklch`, `oklchToRgb`, `tintOklch`, `shadeOklch`, `toHex`, `lerp`
- `regenerate-palette-tokens.js`: same set, slightly different signatures (`tintOklch(r,g,b,t)` vs `tintOklch(c,t)`)
- `fix-onlight-contrast.js`: `linearize`, `luminance`, `contrast`
- `update-dataviz-contrast-tokens.js`: `linearize`, `luminance`, `contrastRatio`
- `apply-color-tokens.js`: `rgbToHex`, `blendOnWhite`, `colorDist`, `norm`, `expandHint`

These functions are currently embedded inside each script with no exports. To unit test them, they would need to be extracted into a shared module.

## Test File Organization

No test files exist. If tests were added, the recommended placement would be:

```
figma-scripter-tools/
├── __tests__/          # Test files
│   ├── color-math.test.js
│   ├── token-utils.test.js
│   └── ...
├── lib/                # Extracted shared logic (not yet present)
│   ├── color-math.js
│   └── token-utils.js
├── color-scale-generator.js
└── ...
```

## Coverage

**Requirements:** None enforced.

**Current state:** 0% automated test coverage across all scripts.

## Test Types

**Unit Tests:** Not present. Color math functions (`rgbToOklch`, `tintOklch`, `contrast`) are the highest-priority candidates — they are pure functions with deterministic outputs.

**Integration Tests:** Not present. Node.js CLI scripts could be integration-tested by running them against fixture JSON files and asserting output file contents.

**E2E Tests:** Not applicable. Figma Scripter scripts run inside Figma's plugin sandbox and cannot be executed outside of it without the Figma plugin API mock.

## Adding Tests (Guidance)

If tests are introduced, the recommended approach:

1. Extract shared color math into `lib/color-math.js` using ES module exports
2. Use Node's built-in test runner (`node:test`) or Vitest — no additional framework is needed for pure-function coverage
3. Node.js CLI scripts (`fix-onlight-contrast.js`, `regenerate-palette-tokens.js`, `wire-color-role-refs.js`) can be integration-tested with fixture JSON input files

Example structure for a color math test:
```js
import { rgbToOklch, tintOklch, toHex } from '../lib/color-math.js';
import { test } from 'node:test';
import assert from 'node:assert';

test('tintOklch lightens toward white', () => {
  const result = tintOklch(0.5, 0.2, 0.8, 0.9); // near-white t=0.9
  assert.ok(result[0] > 0.9, 'r should be near white');
});
```

---

*Testing analysis: 2026-05-07*
