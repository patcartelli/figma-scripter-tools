/**
 * Color Token Swatch Generator — Collection-based
 * One section per Figma variable collection (COLOR variables only).
 * Within each section, modes render as side-by-side columns.
 * Each column is a transparent frame with a mode override applied so
 * bound variable fills resolve to the correct mode color.
 * Run in Figma Scripter.
 */

const CONFIG = {
  swatchWidth:  120,
  colorHeight:  80,
  labelHeight:  62,
  hGap:         8,
  vGap:         32,
  groupGap:     48,
  sectionGap:   120,
  columnGap:    120,
  labelPad:     8,
}

// Collections rendered first, in this order. Any others follow alphabetically.
const COLLECTION_ORDER = ['color-roles', 'data-viz', 'palette']

// --- Color Math Utilities ---

function hexToRgb(hex) {
  const h = hex.replace('#', '')
  return {
    r: parseInt(h.substring(0, 2), 16) / 255,
    g: parseInt(h.substring(2, 4), 16) / 255,
    b: parseInt(h.substring(4, 6), 16) / 255,
  }
}

function figmaColorToHex(c) {
  const toHex = v => Math.round(v * 255).toString(16).padStart(2, '0')
  return `#${toHex(c.r)}${toHex(c.g)}${toHex(c.b)}`.toUpperCase()
}

// --- Variable Resolution ---

function resolveColorForMode(variable, modeId) {
  let value = variable.valuesByMode[modeId]
  let hops = 10
  while (value && typeof value === 'object' && value.type === 'VARIABLE_ALIAS' && hops-- > 0) {
    const aliased = figma.variables.getVariableById(value.id)
    if (!aliased) return null
    const ac = figma.variables.getVariableCollectionById(aliased.variableCollectionId)
    if (!ac) return null
    value = aliased.valuesByMode[ac.defaultModeId]
  }
  return value && typeof value === 'object' && 'r' in value ? value : null
}

// --- Data Building ---

function collectionSortKey(name) {
  const lower = name.toLowerCase().replace(/[\s_]/g, '-')
  const idx = COLLECTION_ORDER.findIndex(o => lower === o || lower.startsWith(o))
  return idx >= 0 ? String(idx).padStart(4, '0') : `${COLLECTION_ORDER.length}_${lower}`
}

function buildCollectionSections() {
  const colorVars = figma.variables.getLocalVariables('COLOR')
  if (colorVars.length === 0) return []

  // Group variables by collection
  const collectionMap = new Map()
  for (const v of colorVars) {
    const collection = figma.variables.getVariableCollectionById(v.variableCollectionId)
    if (!collection) continue
    if (!collectionMap.has(collection.id)) {
      collectionMap.set(collection.id, { collection, variables: [] })
    }
    collectionMap.get(collection.id).variables.push(v)
  }

  const sections = []
  for (const { collection, variables } of collectionMap.values()) {
    // Build a mode column per mode: groups keyed by first name segment
    const modeColumns = collection.modes.map(mode => {
      const groupMap = new Map()
      for (const v of variables) {
        const rgba = resolveColorForMode(v, mode.modeId)
        if (!rgba) continue
        const hex   = figmaColorToHex(rgba)
        const alpha = rgba.a !== undefined ? rgba.a : 1
        const group = v.name.split('/')[0]
        if (!groupMap.has(group)) groupMap.set(group, [])
        groupMap.get(group).push({ name: v.name, hex, alpha, variable: v })
      }
      const groups = []
      for (const [groupName, tokens] of groupMap) {
        groups.push({ groupName, tokens })
      }
      return { modeName: mode.name, modeId: mode.modeId, groups }
    })
    sections.push({ collection, modeColumns })
  }

  sections.sort((a, b) =>
    collectionSortKey(a.collection.name).localeCompare(collectionSortKey(b.collection.name))
  )

  return sections
}

function widestGroupTokenCount(modeColumns) {
  let max = 0
  for (const col of modeColumns) {
    for (const g of col.groups) {
      if (g.tokens.length > max) max = g.tokens.length
    }
  }
  return max
}

// --- Swatch Creation ---

async function createSwatch(token, x, y, parent) {
  const { swatchWidth: SW, colorHeight: CH, labelHeight: LH, labelPad: PAD } = CONFIG
  const WHITE = { r: 1, g: 1, b: 1 }
  const DARK  = { r: 0.1, g: 0.1, b: 0.1 }
  const MID   = { r: 0.45, g: 0.45, b: 0.45 }
  const LIGHT = { r: 0.65, g: 0.65, b: 0.65 }

  const rgb = hexToRgb(token.hex)

  const container = figma.createFrame()
  container.name = token.name
  container.fills = []
  container.clipsContent = false
  container.resize(SW, CH + LH)
  container.x = x
  container.y = y
  parent.appendChild(container)

  // Color block — fill bound to the variable so mode overrides take effect
  const solidFill = { type: 'SOLID', color: { r: rgb.r, g: rgb.g, b: rgb.b }, opacity: token.alpha }
  const boundFill = figma.variables.setBoundVariableForPaint(solidFill, 'color', token.variable)

  const colorBlock = figma.createRectangle()
  colorBlock.name = 'color'
  colorBlock.resize(SW, CH)
  colorBlock.x = 0
  colorBlock.y = 0
  colorBlock.fills = [boundFill]
  container.appendChild(colorBlock)

  // Label area
  const labelBlock = figma.createFrame()
  labelBlock.name = 'label'
  labelBlock.fills = [{ type: 'SOLID', color: WHITE }]
  labelBlock.clipsContent = false
  labelBlock.resize(SW, LH)
  labelBlock.x = 0
  labelBlock.y = CH
  container.appendChild(labelBlock)

  const shortName = token.name.split('/').pop()

  const nameText = figma.createText()
  nameText.fontName = { family: 'Inter', style: 'Medium' }
  nameText.fontSize = 12
  nameText.characters = shortName
  nameText.fills = [{ type: 'SOLID', color: DARK }]
  nameText.textAutoResize = 'WIDTH_AND_HEIGHT'
  nameText.x = PAD
  nameText.y = PAD
  labelBlock.appendChild(nameText)

  const hexText = figma.createText()
  hexText.fontName = { family: 'Inter', style: 'Regular' }
  hexText.fontSize = 10
  const opacityLabel = token.alpha < 1 ? `  ${Math.round(token.alpha * 100)}%` : ''
  hexText.characters = token.hex + opacityLabel
  hexText.fills = [{ type: 'SOLID', color: MID }]
  hexText.textAutoResize = 'WIDTH_AND_HEIGHT'
  hexText.x = PAD
  hexText.y = PAD + nameText.height + 3
  labelBlock.appendChild(hexText)

  const fullNameText = figma.createText()
  fullNameText.fontName = { family: 'Inter', style: 'Regular' }
  fullNameText.fontSize = 9
  fullNameText.characters = token.name
  fullNameText.fills = [{ type: 'SOLID', color: LIGHT }]
  fullNameText.textAutoResize = 'WIDTH_AND_HEIGHT'
  fullNameText.x = PAD
  fullNameText.y = PAD + nameText.height + 3 + hexText.height + 3
  labelBlock.appendChild(fullNameText)

  return container
}

// --- Mode Column Rendering ---

async function renderModeColumn(modeColumn, collection, colX, colY) {
  const { swatchWidth: SW, colorHeight: CH, labelHeight: LH, hGap, vGap, groupGap } = CONFIG
  const swatchH = CH + LH

  // Transparent wrapper with mode override — all variable fills inside resolve to this mode
  const colFrame = figma.createFrame()
  colFrame.name = `${collection.name} / ${modeColumn.modeName}`
  colFrame.fills = []
  colFrame.clipsContent = false
  colFrame.x = colX
  colFrame.y = colY
  figma.currentPage.appendChild(colFrame)
  colFrame.setExplicitVariableModeForCollection(collection, modeColumn.modeId)

  let cursorY = 0
  let totalSwatches = 0

  // Mode name header
  const modeHeader = figma.createText()
  modeHeader.fontName = { family: 'Inter', style: 'Medium' }
  modeHeader.characters = modeColumn.modeName
  modeHeader.fontSize = 20
  modeHeader.x = 0
  modeHeader.y = cursorY
  colFrame.appendChild(modeHeader)
  cursorY += modeHeader.height + groupGap

  for (const group of modeColumn.groups) {
    const groupHeader = figma.createText()
    groupHeader.fontName = { family: 'Inter', style: 'Medium' }
    groupHeader.characters = group.groupName
    groupHeader.fontSize = 14
    groupHeader.x = 0
    groupHeader.y = cursorY
    colFrame.appendChild(groupHeader)
    cursorY += groupHeader.height + hGap

    for (let i = 0; i < group.tokens.length; i++) {
      await createSwatch(group.tokens[i], i * (SW + hGap), cursorY, colFrame)
      totalSwatches++
    }

    cursorY += swatchH + vGap + groupGap
  }

  const colW = Math.max(...modeColumn.groups.map(g => g.tokens.length), 1) * (SW + hGap) - hGap
  colFrame.resize(colW, cursorY)

  return { colFrame, totalSwatches, height: cursorY }
}

// --- Main ---

async function generateSwatches() {
  const sections = buildCollectionSections()
  if (sections.length === 0) {
    print('No COLOR variables found.')
    return
  }

  await figma.loadFontAsync({ family: 'Inter', style: 'Medium' })
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' })

  const { swatchWidth: SW, hGap, groupGap, sectionGap, columnGap } = CONFIG

  const allNodes    = []
  let totalSwatches = 0
  let totalGroups   = 0
  let cursorY       = figma.viewport.center.y
  const startX      = figma.viewport.center.x - 400

  for (const { collection, modeColumns } of sections) {
    // Section header (collection name)
    const sectionHeader = figma.createText()
    sectionHeader.fontName = { family: 'Inter', style: 'Medium' }
    sectionHeader.characters = collection.name
    sectionHeader.fontSize = 28
    sectionHeader.x = startX
    sectionHeader.y = cursorY
    figma.currentPage.appendChild(sectionHeader)
    allNodes.push(sectionHeader)
    cursorY += sectionHeader.height + groupGap

    // Each mode column width is based on the widest group in any mode
    const maxTokens = widestGroupTokenCount(modeColumns)
    const colW      = Math.max(maxTokens, 1) * (SW + hGap)

    let cursorX    = startX
    let maxColHeight = 0

    for (const modeColumn of modeColumns) {
      const result = await renderModeColumn(modeColumn, collection, cursorX, cursorY)
      allNodes.push(result.colFrame)
      totalSwatches += result.totalSwatches
      if (result.height > maxColHeight) maxColHeight = result.height
      cursorX += colW + columnGap
    }

    for (const col of modeColumns) totalGroups += col.groups.length
    cursorY += maxColHeight + sectionGap
  }

  figma.currentPage.selection = allNodes
  figma.viewport.scrollAndZoomIntoView(allNodes)
  print(`Generated ${totalSwatches} swatches in ${totalGroups} groups across ${sections.length} collections.`)
}

generateSwatches()
