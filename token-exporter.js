// ─── Token Exporter ───────────────────────────────────────────────────────────
// Select row frames (e.g. "dv/01"), run script.
// Reads fill color from each swatch child, displays W3C token JSON in a panel.
//
// IMPORT ORDER: import this output into Figma BEFORE importing the semantic
// tokens (semantic-dv.light/dark.tokens.json). References like {dv.10.50}
// will fail if the scale tokens don't exist yet.

function toHex(r, g, b) {
  return '#' + [r, g, b]
    .map(v => Math.round(v * 255).toString(16).padStart(2, '0').toUpperCase())
    .join('');
}

function setNested(obj, keys, value) {
  let cur = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!cur[keys[i]]) cur[keys[i]] = {};
    cur = cur[keys[i]];
  }
  cur[keys[keys.length - 1]] = value;
}

// Resolves alpha from a variable bound to a fill's color, if present.
// Figma stores alpha in the variable's RGBA value, not in fill.opacity.
function resolveVariableAlpha(fill) {
  const alias = fill.boundVariables && fill.boundVariables.color;
  if (!alias) return null;
  const variable = figma.variables.getVariableById(alias.id);
  if (!variable) return null;
  const collection = figma.variables.getVariableCollectionById(variable.variableCollectionId);
  if (!collection) return null;
  const value = variable.valuesByMode[collection.modes[0].modeId];
  if (value && typeof value === 'object' && 'a' in value) return value.a;
  return null;
}

// Gets the solid fill from the node itself, or from a child named "color"
function getColorFill(node) {
  if (node.fills && node.fills.length) {
    const f = node.fills.find(f => f.type === 'SOLID' && f.visible !== false);
    if (f) return f;
  }
  if (node.children) {
    const colorChild = node.children.find(c => c.name === 'color');
    if (colorChild && colorChild.fills) {
      const f = colorChild.fills.find(f => f.type === 'SOLID' && f.visible !== false);
      if (f) return f;
    }
  }
  return null;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const selection = figma.currentPage.selection.filter(n => n.type === 'FRAME');

if (!selection.length) {
  figma.notify('⚠️ Select one or more row frames first.');
} else {
  const tokenTree = {};
  let count = 0;
  const skipped = [];

  for (const rowFrame of selection) {
    for (const swatch of (rowFrame.children || [])) {
      const name = swatch.name.trim();

      // Only process nodes with a token-path-style name (e.g. "dv/01/500")
      if (!name.includes('/')) continue;

      const fill = getColorFill(swatch);
      if (!fill) {
        skipped.push(name);
        continue;
      }

      const { r, g, b } = fill.color;
      const alpha = resolveVariableAlpha(fill) ?? (fill.opacity !== undefined ? fill.opacity : 1);

      setNested(tokenTree, name.split('/'), {
        "$type": "color",
        "$value": {
          "colorSpace": "srgb",
          "components": [r, g, b],
          "alpha": alpha,
          "hex": toHex(r, g, b)
        },
        "$extensions": {
          "com.figma.scopes": ["ALL_SCOPES"]
        }
      });

      count++;
    }
  }

  tokenTree["$extensions"] = { "com.figma.modeName": "light" };

  console.log(JSON.stringify(tokenTree, null, 2));
  figma.notify(`✓ ${count} token(s) logged.${skipped.length ? ` ${skipped.length} skipped (no fill).` : ''}`);
}
