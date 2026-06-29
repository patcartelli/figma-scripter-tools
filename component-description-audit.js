// ─── Component Description Audit ────────────────────────────────────────────────
// Read-only. Scans the whole file for main components and component sets, then
// reports which ones are MISSING a description, bucketed by what's actually
// documentable. Writes nothing to the document.
//
// Usage: paste into Scripter, run. View results at
// Plugins > Development > Open Console. Copy the JSON block at the bottom and
// paste it back to confirm the gap list.
//
// Note: description lives on the COMPONENT_SET (variant container), so variants
// are audited once at the set level. Standalone COMPONENTs (not inside a set)
// are audited individually. Instances on the canvas are ignored — only main
// components count.

if (figma.loadAllPagesAsync) await figma.loadAllPagesAsync();

// Pages whose contents are not documentable MUI components:
//  - Icons: ~2100 individual icon glyphs, out of scope for descriptions
//  - Colors / Typography / Spacing: foundation swatches & specimens, not components
const EXCLUDE_PAGES = new Set(['Icons', 'Colors', 'Typography', 'Spacing']);
const CHART_PAGES = new Set(['Graphs and Charts']);

const described = [];
const buckets = { describable: [], internal: [], charts: [] };
let iconsCount = 0;

const classify = (page, row) => {
  if (page === 'Icons') { iconsCount++; return; }
  if (EXCLUDE_PAGES.has(page)) return;
  if (CHART_PAGES.has(page)) { buckets.charts.push(row); return; }
  // Leading underscore = Figma convention for internal / private building blocks
  if (row.name.startsWith('_')) { buckets.internal.push(row); return; }
  buckets.describable.push(row);
};

for (const page of figma.root.children) {
  if (page.type !== 'PAGE') continue;
  const pageName = page.name.trim();

  // Component sets — description lives on the set, not the child variants
  for (const set of page.findAllWithCriteria({ types: ['COMPONENT_SET'] })) {
    if (set.remote) continue;
    const row = { page: pageName, name: set.name, type: 'SET' };
    if (set.description && set.description.trim()) described.push(row);
    else classify(pageName, row);
  }

  // Standalone components not contained in a set
  for (const comp of page.findAllWithCriteria({ types: ['COMPONENT'] })) {
    if (comp.remote) continue;
    if (comp.parent && comp.parent.type === 'COMPONENT_SET') continue;
    const row = { page: pageName, name: comp.name, type: 'COMPONENT' };
    if (comp.description && comp.description.trim()) described.push(row);
    else classify(pageName, row);
  }
}

const sortKey = r => `${r.page} ${r.name}`;
const byKey = (a, b) => sortKey(a).localeCompare(sortKey(b));
[described, buckets.describable, buckets.internal, buckets.charts].forEach(a => a.sort(byKey));

const fmt = rows => rows
  .map(r => `  ${r.type === 'SET' ? '[SET]' : '[CMP]'} [${r.page}] ${r.name}`)
  .join('\n');

console.log(`\n=== ICONS (excluded, out of scope): ${iconsCount} ===`);

console.log(`\n=== DESCRIBABLE GAP (${buckets.describable.length}) — MUI-mapped, needs description ===`);
console.log(fmt(buckets.describable));

console.log(`\n=== CHARTS (${buckets.charts.length}) — flag: verify MUI X mapping vs net-new ===`);
console.log(fmt(buckets.charts));

console.log(`\n=== INTERNAL / building-block (${buckets.internal.length}) — leading "_", likely skip ===`);
console.log(fmt(buckets.internal));

console.log('\n=== COPY BELOW: gap list JSON ===');
console.log(JSON.stringify({
  describedCount: described.length,
  iconsExcluded: iconsCount,
  describable: buckets.describable,
  charts: buckets.charts,
  internal: buckets.internal,
}, null, 2));

figma.notify(`✓ ${buckets.describable.length} describable · ${buckets.charts.length} charts · ${buckets.internal.length} internal · ${iconsCount} icons`);
