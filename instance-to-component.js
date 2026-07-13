// Convert selected instances to main components
// Components land in a "converted" section; instances replace originals in-place

const selection = [...figma.currentPage.selection];

if (selection.length === 0) {
  console.log('No nodes selected.');
  return;
}

const PADDING = 40;

// Find or create the "converted" section
let section = figma.currentPage.children.find(
  n => n.type === 'SECTION' && n.name === 'converted'
);
if (!section) {
  section = figma.createSection();
  section.name = 'converted';
  // Position the section below the current selection's bounding box
  const instances = selection.filter(n => n.type === 'INSTANCE');
  if (instances.length > 0) {
    const bounds = getPageBounds(instances);
    section.x = bounds.x;
    section.y = bounds.y + bounds.height + 120;
  }
}

const skipped = [];

for (const node of selection) {
  if (node.type !== 'INSTANCE') {
    skipped.push(`"${node.name}" (type: ${node.type}) — skipped`);
    continue;
  }

  const name = node.mainComponent?.name ?? node.name;
  const parent = node.parent;
  const index = parent.children.indexOf(node);
  const x = node.x;
  const y = node.y;
  const width = node.width;
  const height = node.height;

  // 1. Detach the instance
  const frame = node.detachInstance();

  // 2. Recursively detach nested instances (no new components)
  detachNested(frame);

  // 3. Build the new component
  const component = figma.createComponent();
  component.name = name;
  component.resize(width, height);
  copyFrameProps(frame, component);

  for (const child of [...frame.children]) {
    component.appendChild(child);
  }
  frame.remove();

  // 4. Place the component into the "converted" section
  const pos = getNextPosition(section);
  section.appendChild(component);
  component.x = pos.x;
  component.y = pos.y;

  // 5. Place a new instance back at the original location
  const instance = component.createInstance();
  parent.insertChild(index, instance);
  instance.x = x;
  instance.y = y;

  console.log(`Converted "${name}"`);
}

if (skipped.length > 0) {
  console.log('\nSkipped:');
  for (const msg of skipped) console.log(' •', msg);
}

// --- Helpers ---

function getNextPosition(sec) {
  const COLS = 10;
  const children = sec.children;
  const count = children.length;
  const row = Math.floor(count / COLS);
  const col = count % COLS;

  // x: sum the widths of items already placed in this row
  let x = PADDING;
  for (let i = row * COLS; i < row * COLS + col; i++) {
    x += children[i].width + PADDING;
  }

  // y: sum the max heights of all completed rows above
  let y = PADDING;
  for (let r = 0; r < row; r++) {
    let rowMaxHeight = 0;
    for (let c = 0; c < COLS; c++) {
      const idx = r * COLS + c;
      if (idx < children.length) {
        rowMaxHeight = Math.max(rowMaxHeight, children[idx].height);
      }
    }
    y += rowMaxHeight + PADDING;
  }

  return { x, y };
}

function getPageBounds(nodes) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const n of nodes) {
    minX = Math.min(minX, n.absoluteBoundingBox.x);
    minY = Math.min(minY, n.absoluteBoundingBox.y);
    maxX = Math.max(maxX, n.absoluteBoundingBox.x + n.absoluteBoundingBox.width);
    maxY = Math.max(maxY, n.absoluteBoundingBox.y + n.absoluteBoundingBox.height);
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

function detachNested(node) {
  if (!('children' in node)) return;
  for (const child of [...node.children]) {
    if (child.type === 'INSTANCE') {
      detachNested(child.detachInstance());
    } else {
      detachNested(child);
    }
  }
}

function copyFrameProps(src, dest) {
  const props = [
    'fills', 'strokes', 'strokeWeight', 'strokeAlign',
    'opacity', 'blendMode', 'effects', 'clipsContent',
    'layoutMode', 'primaryAxisSizingMode', 'counterAxisSizingMode',
    'primaryAxisAlignItems', 'counterAxisAlignItems',
    'paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom',
    'itemSpacing',
  ];
  for (const prop of props) {
    try { dest[prop] = src[prop]; } catch (_) {}
  }
  if (src.cornerRadius !== figma.mixed) {
    dest.cornerRadius = src.cornerRadius;
  } else {
    dest.topLeftRadius = src.topLeftRadius;
    dest.topRightRadius = src.topRightRadius;
    dest.bottomLeftRadius = src.bottomLeftRadius;
    dest.bottomRightRadius = src.bottomRightRadius;
  }
}
