# Figma Scripter Tools

A collection of JavaScript scripts for use with the [Figma Scripter](https://www.figma.com/community/plugin/1047415198990688414/scripter) plugin to automate color token workflows.

## Scripts

### `color-scale-generator.js`
Select one or more source color frames (solid fill + text label), run the script. Generates an 8-step color scale per color and places labeled swatch rows next to the selection.

**Steps:** `25, 50, 100, 200, 300, 400, main, 500`
**Output:** Row frames named after the color label, with swatch children named `{colorName}/{step}` (e.g. `dv/02/50`)

### `token-exporter.js`
Select the row frames output by the scale generator, run the script. Reads fill colors and frame names, outputs W3C design token JSON to the Figma console.

**Output:** View at Plugins > Development > Open Console, then copy into a `.tokens.json` file.
**Import order:** Import scale tokens into Figma **before** semantic tokens — references like `{dv.10.50}` will fail otherwise.

### `swatch-generator.js`
Reads all local color variables from the file and generates a labeled swatch sheet, organized by section and group. Matches the visual layout of the color scale generator.

**Sections:** `Scale / Color`, `Color Roles`, `Other`

## Usage

1. Open Figma and install the [Scripter plugin](https://www.figma.com/community/plugin/1047415198990688414/scripter)
2. Open Scripter and paste the contents of the script you want to run
3. Follow the per-script instructions above
