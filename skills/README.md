# Bluefish Claude Skills

Claude Code skills for the Bluefish design system. Install these to use `/bf-explore` and `/bf-prototype` in any Claude Code session.

## What's included

| Skill | Command | What it does |
|---|---|---|
| `bluefish-design-system` | (foundation) | Token rules, accessibility standards, Figma MCP setup — inherited by all other skills |
| `bf-explore` | `/bf-explore` | Generates 2–3 HTML layout variations for a screen |
| `bf-prototype` | `/bf-prototype` | Generates a single HTML prototype or Vite+MUI scaffold |

## Install

Copy the `skills/` folder contents into `~/.claude/skills/`:

```bash
cp -r skills/bluefish-design-system ~/.claude/skills/
cp -r skills/bf-explore ~/.claude/skills/
cp -r skills/bf-prototype ~/.claude/skills/
```

Restart Claude Code. The skills load automatically in any new conversation.

## Usage

**Explore layouts:**
```
/bf-explore the AI Insights overview screen with KPI strip and chart
```

**Generate a prototype:**
```
/bf-prototype the campaign list screen
```
Claude will ask: *"Quick HTML prototype or runnable Vite+MUI app?"* — choose **HTML prototype** for standalone browser testing.

Both commands also trigger automatically if you describe what you want without using a slash command:
- "layout variations for X" → `/bf-explore`
- "prototype this screen" or "working prototype of X" → `/bf-prototype`

## Figma Desktop

Neither command requires Figma Desktop, but connecting it improves token accuracy:

1. Open Figma Desktop with the Bluefish pattern library file
2. Select any frame before invoking a command
3. Claude reads live token values from `get_variable_defs` and component structure from `get_figma_data`

If Figma Desktop isn't open, Claude falls back to the cached `tokens.md` file and generates from your description.

## Known limitations

- **Code Connect not configured** — Figma component structure data triggers a Code Connect prompt. Claude notes this inline and continues. Output is still valid.
- **Token drift** — Live Figma token values may differ from `tokens.md`. Claude uses the live value and flags discrepancies with `⚠️ token drift`.
- **Vite+MUI mode** requires `npm install && npm run dev` — for engineer use, not solo designer testing.

## Support files (bluefish-design-system)

These files are read on demand — Claude loads them only when needed, not at skill start:

| File | When Claude reads it |
|---|---|
| `tokens.md` | Generating any CSS color, spacing, or radius value |
| `type-styles.md` | Setting typography |
| `tokens-dataviz.md` | Output includes charts or data series |
| `figma-reading-guide.md` | Interpreting Figma MCP output |
| `spec-template.md` | Writing a component spec |
