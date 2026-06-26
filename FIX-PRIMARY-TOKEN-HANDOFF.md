# Fix: rename `palette/color/light/primary/main` → `source`

> Paste into a GitHub issue (or PR description) on the repo that owns `tokens.json`
> (under `patcartelli/*` — fill in the exact repo/path below). Self-contained.

**Target repo:** `patcartelli/<TOKENS_REPO>`
**File:** `<path>/tokens.json`

---

## TL;DR

In `tokens.json`, the token set `palette/color/light` → `primary` stores its seed
color under a stop named **`main`**. Every other ramp in `palette/*` stores its
seed under **`source`**. Rename `primary`'s `main` stop to `source`. Value is
unchanged (`#005568`). One-key edit.

## Background — the naming convention

The design system uses two layers with deliberately different seed-stop names so
they don't collide in a flattened namespace:

| Layer | Seed / role stop | Meaning |
|---|---|---|
| `palette/*` | **`source`** | The raw seed color — the starting point a theme is built from. |
| `color-roles/*` | **`main`** | The semantic role token, aliased to the palette source (e.g. `color-roles/secondary/main` → `palette/secondary/source`). |

So `palette/secondary/source` and `color-roles/secondary/main` describe the same
color at different layers, without name collision.

## The problem

`palette/color/light/primary` is the lone exception — it uses `main` instead of
`source`:

```jsonc
// palette/color/light → primary  (CURRENT)
{
  "25":  { "$type": "color", "$value": "#F0F9FB" },
  // ... 50 ... 700 ...
  "main": { "$type": "color", "$value": "#005568" }   // ← should be "source"
}
```

Because `palette/.../primary/main` and `color-roles/light/primary/main` both
exist, they flatten to the same key (`primary.main`) in the theme's
`$figmaStyleReferences`. That ambiguity is exactly what the `source`/`main`
split is meant to avoid. Every sibling ramp (`secondary`, `error`, `warning`,
`success`, `info`, `neutral`) already uses `source` and is unaffected.

## The fix

In `tokens.json`, under `"palette/color/light"` → `"primary"`, rename the
`"main"` key to `"source"`:

```jsonc
// palette/color/light → primary  (FIXED)
{
  "25":  { "$type": "color", "$value": "#F0F9FB" },
  // ... 50 ... 700 ...
  "source": { "$type": "color", "$value": "#005568" }   // renamed from "main"
}
```

- **Value does not change** (`#005568`).
- Do **not** add a new stop — just rename the existing key.
- `primary` has no existing `source` stop, so there is nothing to overwrite.

## Why this is safe (verified against the current `tokens.json`)

- **No aliases reference `{primary.main}`.** All color-roles aliases for primary
  point at numbered stops (`{primary.500}`, `{primary.100}`, …). Renaming the
  seed stop breaks no alias.
- **No data loss** — value preserved, key renamed only.
- **Makes `primary` consistent** with all other `palette/*` ramps, which already
  use `source`.

## Verification checklist (after the edit)

- [ ] `palette/color/light/primary` has a `source` stop = `#005568` and **no**
      `main` stop.
- [ ] Grep confirms no remaining `{primary.main}` alias references:
      `grep -o '{primary.main}' tokens.json` returns nothing.
- [ ] Re-import via Tokens Studio: the published Figma style previously bound to
      the palette-layer `primary.main` may need to be re-pointed to
      `color-roles/light/primary/main` (the semantic role). This is how every
      other ramp already behaves, so the fix brings `primary` into line rather
      than introducing new work — but confirm the `primary` published style
      still resolves after sync.

## Out of scope

- The Figma Scripter generators (`generator-color-palette.js`,
  `generator-dataviz-palette.js`) already emit `source` for `palette/*` seed
  stops — no change needed there. This fix is purely the existing `tokens.json`
  data correction on GitHub.
