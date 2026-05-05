/**
 * Color Token Swatch Generator
 * Reads all local color variables and generates labeled swatches.
 * Light Mode and Dark Mode render as side-by-side columns.
 * Each group row is as wide as the number of tokens in that group.
 * Run in Figma Scripter.
 */

const CONFIG = {
  swatchWidth: 120,
  colorHeight: 80,
  labelHeight: 62,
  hGap:        8,
  vGap:        32,
  groupGap:    48,
  sectionGap:  80,
  columnGap:   120,
  labelPad:    8,
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

function findModeInCollection(collection, modeName) {
  const lower = modeName.toLowerCase()
  return collection.modes.find(m => m.name.toLowerCase() === lower)
    || collection.modes.find(m => m.name.toLowerCase().includes(lower))
    || collection.modes[0]
}

function resolveColorByMode(v, modeName) {
  const collection = figma.variables.getVariableCollectionById(v.variableCollectionId)
  if (!collection) return null

  const mode = findModeInCollection(collection, modeName)
  const value = v.valuesByMode[mode.modeId]
  if (!value) return null

  if (typeof value === "object" && "type" in value && value.type === "VARIABLE_ALIAS") {
    const aliased = figma.variables.getVariableById(value.id)
    if (!aliased) return null
    return resolveColorByMode(aliased, modeName)
  }

  if (typeof value === "object" && "r" in value && "g" in value && "b" in value) {
    return value
  }
  return null
}

function getColorTokenSections(modeName) {
  const colorVars = figma.variables.getLocalVariables("COLOR")
  if (colorVars.length === 0) return []

  const isDark = modeName.toLowerCase() === "dark"
  const sectionMap = new Map()

  for (const v of colorVars) {
    if (isDark) {
      const collection = figma.variables.getVariableCollectionById(v.variableCollectionId)
      if (!collection) continue
      const hasDark = collection.modes.some(m => m.name.toLowerCase().includes("dark"))
      if (!hasDark) continue
    }

    const rgba = resolveColorByMode(v, modeName)
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

function maxTokenCount(sections) {
  let max = 0
  for (const section of sections) {
    for (const group of section.groups) {
      if (group.tokens.length > max) max = group.tokens.length
    }
  }
  return max
}

// --- Rendering ---

async function createSwatch(token, x, y) {
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
  figma.currentPage.appendChild(container)

  const colorBlock = figma.createRectangle()
  colorBlock.name = "color"
  colorBlock.resize(SW, CH)
  colorBlock.x = 0
  colorBlock.y = 0
  colorBlock.fills = [{ type: "SOLID", color: { r: rgb.r, g: rgb.g, b: rgb.b }, opacity: token.alpha }]
  container.appendChild(colorBlock)

  const labelBlock = figma.createFrame()
  labelBlock.name = "label"
  labelBlock.fills = [{ type: "SOLID", color: WHITE }]
  labelBlock.clipsContent = false
  labelBlock.resize(SW, LH)
  labelBlock.x = 0
  labelBlock.y = CH
  container.appendChild(labelBlock)

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
  const opacityLabel = token.alpha < 1 ? `  ${Math.round(token.alpha * 100)}%` : ""
  hexText.characters = token.hex + opacityLabel
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

async function renderSections(sections, startX, startY) {
  const { swatchWidth: SW, colorHeight: CH, labelHeight: LH, hGap, vGap, groupGap, sectionGap } = CONFIG
  const swatchH = CH + LH

  let cursorY = startY
  const allNodes = []
  let totalSwatches = 0
  let totalGroups = 0

  for (const section of sections) {
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

      const header = figma.createText()
      header.fontName = { family: "Inter", style: "Medium" }
      header.characters = group.groupName
      header.fontSize = 16
      header.x = startX
      header.y = cursorY
      figma.currentPage.appendChild(header)
      allNodes.push(header)
      cursorY += header.height + hGap

      // One row per group — width determined by token count
      for (let i = 0; i < group.tokens.length; i++) {
        const x = startX + i * (SW + hGap)
        const swatch = await createSwatch(group.tokens[i], x, cursorY)
        allNodes.push(swatch)
        totalSwatches++
      }

      cursorY += swatchH + vGap + groupGap
    }

    cursorY += sectionGap
  }

  return { allNodes, totalSwatches, totalGroups, endY: cursorY }
}

async function generateSwatches() {
  const lightSections = getColorTokenSections("light")
  const darkSections  = getColorTokenSections("dark")

  if (lightSections.length === 0 && darkSections.length === 0) {
    print("No color variables found.")
    return
  }

  await figma.loadFontAsync({ family: "Inter", style: "Medium" })
  await figma.loadFontAsync({ family: "Inter", style: "Regular" })

  const { swatchWidth: SW, colorHeight: CH, labelHeight: LH, hGap, groupGap, columnGap } = CONFIG

  // Column widths based on the widest group in each mode
  const lightColW = maxTokenCount(lightSections) * (SW + hGap)
  const darkColW  = maxTokenCount(darkSections)  * (SW + hGap)
  const totalW    = lightColW + columnGap + darkColW

  const lightX = figma.viewport.center.x - totalW / 2
  const darkX  = lightX + lightColW + columnGap
  const startY = figma.viewport.center.y
  const allNodes = []
  let totalSwatches = 0
  let totalGroups   = 0

  // Mode headers — same Y, each column's X
  const lightHeader = figma.createText()
  lightHeader.fontName = { family: "Inter", style: "Medium" }
  lightHeader.characters = "Light Mode"
  lightHeader.fontSize = 32
  lightHeader.x = lightX
  lightHeader.y = startY
  figma.currentPage.appendChild(lightHeader)
  allNodes.push(lightHeader)

  const darkHeader = figma.createText()
  darkHeader.fontName = { family: "Inter", style: "Medium" }
  darkHeader.characters = "Dark Mode"
  darkHeader.fontSize = 32
  darkHeader.x = darkX
  darkHeader.y = startY
  figma.currentPage.appendChild(darkHeader)
  allNodes.push(darkHeader)

  const contentY = startY + Math.max(lightHeader.height, darkHeader.height) + groupGap

  const lightResult = await renderSections(lightSections, lightX, contentY)
  allNodes.push(...lightResult.allNodes)
  totalSwatches += lightResult.totalSwatches
  totalGroups   += lightResult.totalGroups

  if (darkSections.length > 0) {
    const darkResult = await renderSections(darkSections, darkX, contentY)
    allNodes.push(...darkResult.allNodes)
    totalSwatches += darkResult.totalSwatches
    totalGroups   += darkResult.totalGroups
  } else {
    print("No dark mode collections found — skipping Dark Mode section.")
  }

  figma.currentPage.selection = allNodes
  figma.viewport.scrollAndZoomIntoView(allNodes)
  print(`Generated ${totalSwatches} swatches in ${totalGroups} groups.`)
}

generateSwatches()
