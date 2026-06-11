# Stack Research: /bf-spec and /bf-build Skills

**Researched:** 2026-06-11
**Overall confidence:** HIGH (Figma MCP behavior), MEDIUM (Code Connect integration specifics)

---

## Summary

The Figma MCP server exposes `get_design_context`, `get_metadata`, and `get_variable_defs` tools that together provide sufficient data for `/bf-spec` without Code Connect. Code Connect is optional — it enriches the output with real component implementation snippets from the codebase, but the base MCP data (layer tree, tokens, layout, variants) is fully accessible without it. `/bf-build` requires no new dependencies: it operates on the spec output and existing bluefish-design-system context, using standard React + MUI + TypeScript patterns already validated by `/bf-prototype`.

---

## Code Connect: What It Is

Code Connect is a Figma feature that maps design components in your Figma library to the real source code components in your repository. Two setup paths exist:

**Code Connect CLI** — Runs locally in your repo. Uses TypeScript template files to define how code snippets render, supporting property mappings (e.g., Figma variant "filled" → MUI `variant="contained"`). More precise, developer-controlled.

**Code Connect UI** — Runs inside Figma. Connects design components to code paths with GitHub integration. Language-agnostic, visual, no terminal required.

Both paths feed into the Figma MCP server. Once connected, any Figma component instance that appears in a frame will have its Code Connect mapping attached to the MCP output.

**What Code Connect adds to MCP output:** When the MCP processes a frame containing connected components, it generates `CodeConnectSnippet` wrapper objects in its context. Each snippet contains:
- The component's current Figma property values (variant, boolean props, text content)
- Import statement for the mapped code component
- Actual rendered usage snippet from the codebase
- Any custom instructions attached to the mapping

**The critical point:** Code Connect is a *repository-level engineering setup* — someone must configure it against the actual codebase. It is not something a Claude Code skill can configure or invoke. The PROJECT.md notes explicitly: "Code Connect setup — engineering dependency, not a skill problem" and "Code Connect not configured — `get_design_context` may interrupt with Code Connect prompt."

---

## Figma MCP: What get_design_context Returns

The Figma MCP exposes 18 tools. The three relevant to `/bf-spec` are:

### get_metadata
- Returns sparse XML: layer IDs, names, types, positions, sizes — no styling
- Best use: component inventory pass on a full screen (lightweight, won't truncate)
- Returns the full node hierarchy, making it the right first call on a large frame

### get_design_context
- Default output: React + Tailwind JSX representing the Figma selection
- Always returns React + Tailwind regardless of `clientFrameworks` parameter — the framework flavor is driven by prompt instruction, not the parameter
- Includes: layer hierarchy, frame dimensions, component instances and their variants, colors, typography styles, spacing values, border radius, auto-layout constraints, flex direction, alignment, responsive behavior, asset references
- Also includes Figma annotation attributes: `data-development-annotations` and `data-content-annotations` embedded in elements
- Large selections can truncate — recommended workflow is `get_metadata` first to map the tree, then `get_design_context` on specific subsections

**Without Code Connect:** Returns pure design data — tokens, structure, layout constraints, component names from the Figma layer tree, variant values, and annotation attributes. No connection to actual source code.

**With Code Connect:** Returns everything above plus `CodeConnectSnippet` wrappers for mapped components: import statements, real usage snippets from the codebase, property mappings from Figma variants to code props.

### get_variable_defs
- Returns variables and styles used in the selection: colors, spacing, typography, border radius
- Includes names and values — critical for mapping Figma variable names to Bluefish token names

### Additional relevant tools (no Code Connect dependency)
- `get_screenshot` — visual reference of the selection; useful for `/bf-spec` visual annotation
- `get_context_for_code_connect` — retrieves structured component metadata (properties, variants, descendant tree) — works without Code Connect being fully configured, provides richer component data than `get_design_context` alone
- `search_design_system` — searches library components and tokens (remote, requires Figma Pro)

---

## /bf-spec Integration Path

### Without Code Connect (current state — what to build for)

The MCP provides enough data to produce a complete spec document without Code Connect. The workflow:

1. **`get_metadata`** on the full frame — builds component inventory: layer names, types, positions. Identifies all component instances by name.
2. **`get_variable_defs`** on the selection — extracts all token references: color variables, spacing, type styles. Cross-reference against `tokens.md` to map to Bluefish token names.
3. **`get_design_context`** on sections — gets layout structure, spacing values, variant states, annotation attributes. Run per component group to avoid truncation.
4. **`get_screenshot`** — visual reference for the handoff doc.
5. Apply `figma-reading-guide.md` to interpret M3 component naming and property conventions.
6. Apply `spec-template.md` to format the output.

**What `/bf-spec` can produce without Code Connect:**
- Component inventory (names, types, variants in use)
- Token mapping (Figma variable names → Bluefish token names)
- Layout redlines (spacing, sizing, alignment from auto-layout)
- Interaction notes (from annotation attributes and variant names)
- Handoff doc in `spec-template.md` format

**What's missing without Code Connect:**
- Real import paths and component usage snippets from the codebase
- Explicit mapping of Figma variant props to TypeScript prop names
- The code-side implementation reference

This missing piece is acceptable for `/bf-spec` — the spec's job is design → handoff doc, not code generation. `/bf-build` handles the code side.

### With Code Connect (future enhancement, not blocking)

When Code Connect is configured by engineering, the skill picks up automatically — `get_design_context` returns enriched output with component snippets. The skill can then include actual import paths and prop mappings in the spec output. No skill change required to support this; the skill should be written to use the enriched data if present, fall through to design-only data if not.

### The "Code Connect prompt interrupt" issue

The PROJECT.md notes that `get_design_context` "may interrupt with Code Connect prompt." Based on research, this appears to be a UI/UX behavior in the Figma desktop MCP where the tool asks if you want to set up Code Connect when it detects unconnected library components. This is a runtime interruption in the agent loop, not a hard failure — the skill needs a handling instruction: if the MCP prompts for Code Connect setup, decline and proceed with design-only context.

---

## /bf-build: Stack Requirements

`/bf-build` takes a spec (from `/bf-spec` or manually described) and produces a production React component. No new dependencies required beyond what `/bf-prototype` already uses.

### Component output pattern

```
ComponentName/
  ComponentName.tsx        — component implementation
  ComponentName.types.ts   — TypeScript props interface
  index.ts                 — named export only
```

### TypeScript props interface pattern

```typescript
// ComponentName.types.ts
export interface ComponentNameProps {
  variant?: 'primary' | 'secondary';   // map from Figma variant names
  label: string;
  disabled?: boolean;
  onClick?: () => void;
}
```

Props derive from the Figma component's variant/property names as parsed by `figma-reading-guide.md`. Boolean props follow the `is`/`has` convention if present in Figma properties.

### Token usage pattern (dual-path ⚠️)

The DATA-03 gap means token injection is unresolved at the engineering level. `/bf-build` continues the dual-path pattern established by `/bf-prototype`:

```typescript
// ⚠️ DATA-03: token injection method unresolved
// Path A — MUI theme tokens (use if ThemeProvider is configured with Bluefish theme)
sx={{ color: 'primary.main', bgcolor: 'background.paper' }}

// Path B — CSS custom properties (use if tokens.css is imported globally)
sx={{ color: 'var(--bf-color-primary)', bgcolor: 'var(--bf-color-surface)' }}
```

The skill must emit the ⚠️ annotation and both paths, matching the pattern in `/bf-prototype`.

### MUI component mapping

Map from Figma M3 component names (as documented in `figma-reading-guide.md`) to MUI equivalents:
- `Button` → `<Button variant="contained|outlined|text">`
- `TextField` → `<TextField>`
- `Card` → `<Card><CardContent>`
- `NavigationBar` → custom with `<BottomNavigation>`
- `Chip` → `<Chip>`

The `figma-reading-guide.md` already covers M3-to-MUI mappings. `/bf-build` skill should reference it directly rather than duplicating.

### TypeScript and MUI versions

No version change from `/bf-prototype`. Vite + React 18 + MUI v5 + TypeScript 5 remain the validated stack. `/bf-build` produces component files that drop into this scaffold.

---

## Recommendations

**1. Build /bf-spec for "no Code Connect" as the primary path.** The MCP delivers everything needed: layer tree via `get_metadata`, tokens via `get_variable_defs`, layout + variants + annotations via `get_design_context`. Write the skill to produce spec-template.md output from these three tools. Code Connect enrichment should be handled as a transparent upgrade — if the MCP returns snippets, include them; if not, omit that section.

**2. Handle the Code Connect interrupt explicitly in the skill.** The skill must instruct: "If the Figma MCP prompts to configure Code Connect, decline and continue with available design data." This prevents the agent from stalling.

**3. Tool call order matters — enforce it in the skill.** `get_metadata` first (inventory), `get_variable_defs` second (token map), `get_design_context` last on subsections (detail). Reversing this order causes truncation and missed components on large screens.

**4. /bf-build needs no new dependencies.** It is purely a Claude Code reasoning skill — reads the spec, applies `figma-reading-guide.md` + `tokens.md` + MUI mapping rules, outputs TypeScript files. No new libraries, no new MCP tools, no Code Connect dependency.

**5. Bluefish custom rules file.** Figma's MCP custom rules system (via CLAUDE.md or project rules) can instruct `get_design_context` to prefer Bluefish token names over raw Tailwind classes. This is a configuration addition to the skill system, not a new dependency — the `bluefish-design-system` SKILL.md already serves this function. Verify the skill invocation path ensures these rules are loaded before any MCP call.

**6. get_context_for_code_connect is available without Code Connect being configured.** This tool returns structured component metadata (property definitions, variant trees, descendant instances). It is misnamed — it works on any component node regardless of Code Connect status and provides richer data than `get_design_context` for component-level spec work. Include it in the `/bf-spec` tool call sequence for component deep-dives.

---

## What NOT to Add

**Do not add Code Connect CLI as a dependency.** It is an engineering repo setup, out of scope per PROJECT.md. The skill must work without it.

**Do not add a separate Figma REST API integration.** The MCP covers all needed data. A direct REST API call (Figma API v1) would require API key management, is not available within a Claude Code skill context, and duplicates what the MCP already provides.

**Do not add a new MCP server.** The Figma MCP is already the integration point. Third-party MCP servers (e.g., figma-console-mcp) add complexity and introduce external dependencies the team would need to maintain. The native Figma MCP provides sufficient data.

**Do not add Storybook generation to /bf-build v1.** Storybook stories require local execution, dependency installation, and a working Vite scaffold — all engineering-level setup. The skill should output the component + types + index only. Stories are v2.

**Do not version-lock MUI or React in the skill.** The skill references the existing Vite + MUI scaffold. Version pinning belongs in package.json, not in the skill instructions.

---

## Sources

- [Code Connect Integration | Figma Developer Docs](https://developers.figma.com/docs/figma-mcp-server/code-connect-integration/) — HIGH confidence
- [Tools and Prompts | Figma Developer Docs](https://developers.figma.com/docs/figma-mcp-server/tools-and-prompts/) — HIGH confidence
- [Code Connect Introduction | Figma Developer Docs](https://developers.figma.com/docs/code-connect/) — HIGH confidence
- [Guide to the Figma MCP Server | Figma Help Center](https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Figma-MCP-server) — HIGH confidence
- [Add Custom Rules | Figma Developer Docs](https://developers.figma.com/docs/figma-mcp-server/add-custom-rules/) — HIGH confidence
- [Create Skills for Figma MCP | Figma Developer Docs](https://developers.figma.com/docs/figma-mcp-server/create-skills/) — HIGH confidence
- [figma/mcp-server-guide | GitHub](https://github.com/figma/mcp-server-guide/) — MEDIUM confidence (official but example-focused)
- [southleft/figma-console-mcp-skills | GitHub](https://github.com/southleft/figma-console-mcp-skills) — MEDIUM confidence (third-party reference)
- [Complete Guide to Figma MCP Integration | Garima Dua, Medium](https://garimadua.medium.com/the-complete-guide-to-figmas-mcp-integration-from-design-to-code-7e20d792b053) — LOW confidence (community article, unverified claims)
