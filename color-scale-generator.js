// ─── Color Scale Generator ───────────────────────────────────────────────────
// Select one or more source color frames, then run.
// Reads the text label inside each frame as the color name.
// Generates 8-step scale and places rows to the right of the selection.

const WHITE = { r: 1, g: 1, b: 1 };
const BLACK = { r: 0, g: 0, b: 0 };

// Step definitions: mix ratios from white → main → black
const STEPS = [
  { label: '25',   color: c => lerp(WHITE, c, 0.05) },
  { label: '50',   color: c => lerp(WHITE, c, 0.10) },
  { label: '100',  color: c => lerp(WHITE, c, 0.18) },
  { label: '200',  color: c => lerp(WHITE, c, 0.30) },
  { label: '300',  color: c => lerp(WHITE, c, 0.45) },
  { label: '400',  color: c => lerp(WHITE, c, 0.70) },
  { label: 'main', color: c => ({ ...c }) },
  { label: '500',  color: c => lerp(c, BLACK, 0.20) },
];

// Layout constants
const SW       = 120;  // swatch width
const CH       = 80;   // color block height
const LH       = 62;   // label block height
const H_GAP    = 8;    // gap between swatches
const V_GAP    = 32;   // gap between rows
const L_PAD    = 8;    // label internal padding
const OFFSET_X = 48;   // distance from source frames

// ─── Helpers ─────────────────────────────────────────────────────────────────

function lerp(a, b, t) {
  return {
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
  };
}

function toHex(c) {
  return '#' + [c.r, c.g, c.b]
    .map(v => Math.round(v * 255).toString(16).padStart(2, '0').toUpperCase())
    .join('');
}

function addText(parent, chars, fontSize, fontStyle, grayness, yOffset) {
  const t = figma.createText();
  t.fontName = { family: 'Inter', style: fontStyle };
  t.fontSize = fontSize;
  t.characters = chars;
  t.fills = [{ type: 'SOLID', color: { r: grayness, g: grayness, b: grayness } }];
  t.textAutoResize = 'WIDTH_AND_HEIGHT';
  t.x = L_PAD;
  t.y = yOffset;
  parent.appendChild(t);
  return t;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const selectedFrames = figma.currentPage.selection.filter(n => n.type === 'FRAME');

if (!selectedFrames.length) {
  figma.notify('⚠️ Select one or more source color frames first.');
} else {

  // Load fonts before any text creation
  await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });

  const maxRight = Math.max(...selectedFrames.map(f => f.x + f.width));
  const minTop   = Math.min(...selectedFrames.map(f => f.y));
  const startX   = maxRight + OFFSET_X;
  const rowWidth = STEPS.length * SW + (STEPS.length - 1) * H_GAP;
  const rowHeight = CH + LH;

  let rowY = minTop;
  let generated = 0;

  for (const srcFrame of selectedFrames) {
    const solidFill = srcFrame.fills.find(f => f.type === 'SOLID' && f.visible !== false);
    if (!solidFill) {
      figma.notify(`⚠️ Skipped "${srcFrame.name}" — no solid fill found.`);
      continue;
    }

    const main = { r: solidFill.color.r, g: solidFill.color.g, b: solidFill.color.b };

    // Read label from the first text node inside the frame
    const textNode = srcFrame.findOne(n => n.type === 'TEXT');
    const colorName = textNode ? textNode.characters.trim() : srcFrame.name;

    // Row container
    const rowFrame = figma.createFrame();
    rowFrame.name = colorName;
    rowFrame.fills = [];
    rowFrame.clipsContent = false;
    rowFrame.resize(rowWidth, rowHeight);
    rowFrame.x = startX;
    rowFrame.y = rowY;
    figma.currentPage.appendChild(rowFrame);

    let swatchX = 0;

    for (const step of STEPS) {
      const stepColor = step.color(main);
      const hex = toHex(stepColor);
      const tokenLabel = `${colorName}/${step.label}`;

      // Swatch container
      const swatch = figma.createFrame();
      swatch.name = tokenLabel;
      swatch.fills = [];
      swatch.clipsContent = false;
      swatch.resize(SW, rowHeight);
      swatch.x = swatchX;
      swatch.y = 0;
      rowFrame.appendChild(swatch);

      // Color block
      const colorBlock = figma.createRectangle();
      colorBlock.name = 'color';
      colorBlock.resize(SW, CH);
      colorBlock.x = 0;
      colorBlock.y = 0;
      colorBlock.fills = [{ type: 'SOLID', color: stepColor }];
      swatch.appendChild(colorBlock);

      // Label background
      const labelBlock = figma.createFrame();
      labelBlock.name = 'label';
      labelBlock.fills = [{ type: 'SOLID', color: WHITE }];
      labelBlock.clipsContent = false;
      labelBlock.resize(SW, LH);
      labelBlock.x = 0;
      labelBlock.y = CH;
      swatch.appendChild(labelBlock);

      // Step number  (bold, dark)
      const stepLabel = addText(labelBlock, step.label, 12, 'Medium', 0.10, L_PAD);

      // Hex value (regular, mid-gray)
      const hexLabel  = addText(labelBlock, hex, 10, 'Regular', 0.45, L_PAD + stepLabel.height + 3);

      // Token name (regular, light gray)
      addText(labelBlock, tokenLabel, 9, 'Regular', 0.65, L_PAD + stepLabel.height + 3 + hexLabel.height + 3);

      swatchX += SW + H_GAP;
    }

    rowY += rowHeight + V_GAP;
    generated++;
  }

  figma.notify(`✓ Generated ${generated} color scale${generated !== 1 ? 's' : ''}.`);
}
