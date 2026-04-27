/**
 * Color Token Swatch Generator
 * Reads all local color variables and generates labeled swatches
 * matching the Color Scale generator thumbnail layout.
 * Run in Figma Scripter.
 */

const CONFIG = {
  swatchWidth:   120,
  colorHeight:   80,
  labelHeight:   62,
  hGap:          8,
  vGap:          32,
  groupGap:      48,
  sectionGap:    80,
  labelPad:      8,
  columnsPerRow: 8,
}

// --- Color Math Utilities ---

function hexToRgb(hex) {
  const h = hex.replace("#", "")
  return {
    r: parseInt(h.substring(0, 2), 16) / 255,
    g: parseInt(h.substring(2, 4), 16) / 255,
    b: parseInt(h.substring(4, 6), 16) / 255,
  }
}

function figmaColorToHex(c) {
  const toHex = (v) => Math.round(v * 255).toString(16).padStart(2, "0")
  return `#${toHex(c.r)}${toHex(c.g)}${toHex(c.b)}`.toUpperCase()
}

// --- Variable Reading & Grouping ---

function resolveColor(v) {
  const collection = figma.variables.getVariableCollectionById(v.variableCollectionId)
  if (!collection) return null
  const modeId = collection.modes[0].modeId
  const value = v.valuesByMode[modeId]
  if (!value) return null

  if (typeof value === "object" && "type" in value && value.type === "VARIABLE_ALIAS") {
    const aliased = figma.variables.getVariableById(value.id)
    if (!aliased) return null
    return resolveColor(aliased)
  }

  if (typeof value === "object" && "r" in value && "g" in value && "b" in value) {
    return value
  }
  return null
}

function getColorTokenSections() {
  const colorVars = figma.variables.getLocalVariables("COLOR")
  if (colorVars.length === 0) {
    print("No color variables found.")
    return []
  }

  const sectionMap = new Map()

  for (const v of colorVars) {
    const rgba = resolveColor(v)
    if (!rgba) {
      print(`Skipping ${v.name} — could not resolve color value`)
      continue
    }
    const hex = figmaColorToHex(rgba)
    const alpha = (rgba.a !== undefined) ? rgba.a : 1
    const parts = v.name.split("/")

    let sectionName
    let groupName

    if (parts[0] === "scale" && parts[1] === "color") {
      sectionName = "Scale / Color"
      groupName = parts.length > 2 ? parts[2] : "ungrouped"
    } else if (parts[0] === "color-roles") {
      sectionName = "Color Roles"
      groupName = parts.length > 1 ? parts[1] : "ungrouped"
    } else {
      sectionName = "Other"
      groupName = parts[0]
    }

    if (!sectionMap.has(sectionName)) sectionMap.set(sectionName, new Map())
    const groupMap = sectionMap.get(sectionName)
    if (!groupMap.has(groupName)) groupMap.set(groupName, [])
    groupMap.get(groupName).push({ name: v.name, hex, alpha })
  }

  const sectionOrder = ["Scale / Color", "Color Roles", "Other"]
  const sections = []

  for (const sectionName of sectionOrder) {
    const groupMap = sectionMap.get(sectionName)
    if (!groupMap) continue

    const groups = []
    for (const [groupName, tokens] of groupMap) {
      groups.push({ groupName, tokens })
    }
    sections.push({ sectionName, groups })
  }

  return sections
}

// --- Rendering ---

async function createSwatch(token, x, y) {
  const { swatchWidth: SW, colorHeight: CH, labelHeight: LH, labelPad: PAD } = CONFIG
  const WHITE = { r: 1, g: 1, b: 1 }
  const DARK  = { r: 0.1, g: 0.1, b: 0.1 }
  const MID   = { r: 0.45, g: 0.45, b: 0.45 }
  const LIGHT = { r: 0.65, g: 0.65, b: 0.65 }

  const rgb = hexToRgb(token.hex)

  // Outer container
  const container = figma.createFrame()
  container.name = token.name
  container.fills = []
  container.clipsContent = false
  container.resize(SW, CH + LH)
  container.x = x
  container.y = y
  figma.currentPage.appendChild(container)

  // Color block
  const colorBlock = figma.createRectangle()
  colorBlock.name = "color"
  colorBlock.resize(SW, CH)
  colorBlock.x = 0
  colorBlock.y = 0
  colorBlock.fills = [{ type: "SOLID", color: { r: rgb.r, g: rgb.g, b: rgb.b }, opacity: token.alpha }]
  container.appendChild(colorBlock)

  // Label block
  const labelBlock = figma.createFrame()
  labelBlock.name = "label"
  labelBlock.fills = [{ type: "SOLID", color: WHITE }]
  labelBlock.clipsContent = false
  labelBlock.resize(SW, LH)
  labelBlock.x = 0
  labelBlock.y = CH
  container.appendChild(labelBlock)

  // Short name — last segment of the token path (e.g. "main", "light", "500")
  const shortName = token.name.split("/").pop()

  const nameText = figma.createText()
  nameText.fontName = { family: "Inter", style: "Medium" }
  nameText.fontSize = 12
  nameText.characters = shortName
  nameText.fills = [{ type: "SOLID", color: DARK }]
  nameText.textAutoResize = "WIDTH_AND_HEIGHT"
  nameText.x = PAD
  nameText.y = PAD
  labelBlock.appendChild(nameText)

  const hexText = figma.createText()
  hexText.fontName = { family: "Inter", style: "Regular" }
  hexText.fontSize = 10
  hexText.characters = token.hex
  hexText.fills = [{ type: "SOLID", color: MID }]
  hexText.textAutoResize = "WIDTH_AND_HEIGHT"
  hexText.x = PAD
  hexText.y = PAD + nameText.height + 3
  labelBlock.appendChild(hexText)

  const fullNameText = figma.createText()
  fullNameText.fontName = { family: "Inter", style: "Regular" }
  fullNameText.fontSize = 9
  fullNameText.characters = token.name
  fullNameText.fills = [{ type: "SOLID", color: LIGHT }]
  fullNameText.textAutoResize = "WIDTH_AND_HEIGHT"
  fullNameText.x = PAD
  fullNameText.y = PAD + nameText.height + 3 + hexText.height + 3
  labelBlock.appendChild(fullNameText)

  return container
}

async function generateSwatches() {
  const sections = getColorTokenSections()
  if (sections.length === 0) {
    print("No color variables found.")
    return
  }

  await figma.loadFontAsync({ family: "Inter", style: "Medium" })
  await figma.loadFontAsync({ family: "Inter", style: "Regular" })

  const { swatchWidth: SW, colorHeight: CH, labelHeight: LH, hGap, vGap, groupGap, sectionGap, columnsPerRow } = CONFIG
  const swatchH = CH + LH

  const startX = figma.viewport.center.x - ((columnsPerRow * (SW + hGap)) / 2)
  let cursorY = figma.viewport.center.y

  const allNodes = []
  let totalSwatches = 0
  let totalGroups = 0

  for (const section of sections) {
    // Section header
    const sectionHeader = figma.createText()
    sectionHeader.fontName = { family: "Inter", style: "Medium" }
    sectionHeader.characters = section.sectionName
    sectionHeader.fontSize = 24
    sectionHeader.x = startX
    sectionHeader.y = cursorY
    figma.currentPage.appendChild(sectionHeader)
    allNodes.push(sectionHeader)
    cursorY += sectionHeader.height + groupGap

    for (const group of section.groups) {
      totalGroups++

      // Group header
      const header = figma.createText()
      header.fontName = { family: "Inter", style: "Medium" }
      header.characters = group.groupName
      header.fontSize = 16
      header.x = startX
      header.y = cursorY
      figma.currentPage.appendChild(header)
      allNodes.push(header)
      cursorY += header.height + hGap

      // Swatches in grid
      for (let i = 0; i < group.tokens.length; i++) {
        const col = i % columnsPerRow
        const row = Math.floor(i / columnsPerRow)
        const x = startX + col * (SW + hGap)
        const y = cursorY + row * (swatchH + vGap)

        const swatch = await createSwatch(group.tokens[i], x, y)
        allNodes.push(swatch)
        totalSwatches++
      }

      const totalRows = Math.ceil(group.tokens.length / columnsPerRow)
      cursorY += totalRows * (swatchH + vGap) + groupGap
    }

    cursorY += sectionGap
  }

  figma.currentPage.selection = allNodes
  figma.viewport.scrollAndZoomIntoView(allNodes)
  print(`Generated ${totalSwatches} swatches in ${totalGroups} groups across ${sections.length} sections.`)
}

generateSwatches()
