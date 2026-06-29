# Bluefish Component Descriptions (MUI-sourced)

Paste-ready component descriptions for Bluefish Figma components that lacked one.
Source of truth: MUI canonical docs prose, adapted to the Bluefish description standard
(1–3 plain, declarative sentences). Generated for **BLU-20** (2026-06-29).

- **Pipeline:** gap list produced by [`component-description-audit.js`](./component-description-audit.js),
  cross-referenced against the BLU-19 MUI `components.json`
  ([patcartelli/mui-documentation](https://github.com/patcartelli/mui-documentation)).
- **Status:** all entries below have been pasted into Figma's component description field.
- **Sourcing note:** most MUI `components.json` `description` fields are empty, so descriptions
  are adapted from each component's canonical MUI docs prose. MUI **X** components (Date pickers,
  Charts) are not in the BLU-19 snapshot and were sourced from MUI X docs. Net-new charts with no
  MUI equivalent were sourced from the Bluefish chart documentation in Notion.

## Coverage

| Bucket | Count | Disposition |
|---|---|---|
| Described (MUI Material/System + Bluefish) | 38 sets/components | ✅ done |
| Described (MUI X Charts) | 7 | ✅ done |
| Described (Bluefish charts, from Notion) | 6 | ✅ done |
| Skipped — brand logos | 4 | no MUI source |
| Skipped — headers | 4 | product-specific |
| Skipped — nav destinations | 2 | not reusable components |
| Skipped — internal building blocks (leading `_`) | 39 | sub-parts, not documented |
| Skipped — icons | 2098 | out of scope |

## Open confirmations

- **Toggle naming** (Buttons): confirm which Figma component is the single tile vs. the group —
  the names look inverted relative to MUI (`ToggleButton` = single, `ToggleButtonGroup` = container).
- **`<FormGroup> | <RadioGroup>`** (Controls): MUI uses `RadioGroup`, not `FormGroup`, for radios.
  Confirm the variant is intentional.
- **`Chart - Polar`** (Graphs and Charts): mapped to MUI X `RadarChart`; confirm it isn't a radial bar.

---

## Descriptions by Figma page

### Accordion

| Component → MUI | Description | Flags |
|---|---|---|
| `<Accordion> \| Group` → Accordion (group) | A set of related accordions stacked as one unit, letting users expand and collapse sections of content. Configure whether several panels can stay open at once or only one at a time. | Single `<Accordion>` already described |

### Avatar

| Component → MUI | Description | Flags |
|---|---|---|
| `<Avatar>` → Avatar | Displays a person or entity as a circular image, icon, or set of initials. Use it in tables, lists, menus, and headers to identify an account or brand at a glance. | |

### Badge

| Component → MUI | Description | Flags |
|---|---|---|
| `<Badge>` → Badge | Overlays a small status marker, a count or a dot, on the top-right of its child element. Use it to signal unread items, notifications, or status on icons, avatars, and buttons. | Paste into both `<Badge>` and `<Badge> \| With Instance` |

### Buttons

| Component → MUI | Description | Flags |
|---|---|---|
| `Button Toggle` → ToggleButton | A selectable option shown as a titled tile with an optional caption, switching between selected and unselected states like a toggle. Use several together when users choose from a set of rich, described options. | |
| `Toggle Button` → ToggleButtonGroup | A row of toggle tiles where one option is selected at a time, forming a segmented choice control built from Button Toggle tiles. Use it for mutually exclusive selections that benefit from a title and caption per option. | ⚠️ Naming looks inverted vs MUI |

### Card

| Component → MUI | Description | Flags |
|---|---|---|
| `<CardActions>` → CardActions | The container for action buttons at the bottom of a card, such as confirm, dismiss, or a link. It keeps the actions aligned and evenly spaced across cards. | |

### Chips

| Component → MUI | Description | Flags |
|---|---|---|
| `Pill Chip` → Chip (variant) | A fully rounded, pill-shaped chip for compact, removable entries such as filters or selected values. It supports leading and trailing icons, including a delete control, in filled and outlined styles. | |
| `Graph Chip` → Chip (variant) | A chip that pairs a color indicator with a label to represent a data series, used as a chart legend or series filter. The colored dot matches the series color in the accompanying graph. | Dataviz legend usage |

### Controls

| Component → MUI | Description | Flags |
|---|---|---|
| `<RadioGroup>` → RadioGroup | Groups a set of radio buttons so the user selects exactly one option, wiring up shared selection state and keyboard navigation. Use it when options are mutually exclusive and all should be visible at once; otherwise use a Select. | |
| `<FormControlLabel> \| Switch` → FormControlLabel | Pairs a switch with a text label in one clickable control, so selecting the label toggles the switch. Use it wherever a switch needs a visible caption (the Checkbox and Radio variants follow the same pattern). | Checkbox/Radio variants already described |
| `<FormGroup>` → FormGroup | Wraps a set of related checkboxes or switches in a consistent vertical or horizontal layout, managing shared spacing and grouping. | Paste into `\| <Checkbox>`, `\| <Switch>`, `\| <RadioGroup>`. ⚠️ MUI uses RadioGroup for radios |

### Date Time

| Component → MUI X | Description | Flags |
|---|---|---|
| `<DateField>` → DateField | A text field for typing a date one section at a time (day, month, year) with the keyboard, without a calendar popup. Use it when users know the exact date and prefer fast keyboard entry. | MUI X, not in snapshot |
| `<DatePicker>` → DatePicker | The standard date picker for pointer devices, combining a text field with a calendar dropdown for choosing a single date. Use it as the default date control on desktop layouts. | MUI X, not in snapshot |
| `<MobileDatePicker>` → MobileDatePicker | A single-date picker optimized for touch, opening the calendar in a full modal dialog instead of a dropdown. Use it on mobile and touch-first layouts. | MUI X, not in snapshot |
| `<StaticDatePicker>` → StaticDatePicker | A calendar rendered inline and always visible, with no text field or popup. Use it when the date selection should sit directly in a page, panel, or popover. | MUI X, not in snapshot |
| `<DateRangeCalendar>` → DateRangeCalendar | An inline calendar that shows two months side by side for picking a start and end date, without a text field or popup. Use it when a range calendar should sit directly in the layout. | MUI X (Pro) |
| `<MobileDateRangePicker>` → MobileDateRangePicker | A date range picker optimized for touch, where users select the start and end dates in a full modal dialog. Use it on mobile and touch-first layouts. | MUI X (Pro) |
| `<StaticDateRangePicker>` → StaticDateRangePicker | An always-visible date range picker rendered inline, with no text field or popover. Use it to embed range selection directly in a page or panel. | MUI X (Pro) |
| `Date Input` → Bluefish (field + picker) | The Bluefish form field for selecting a date or date range, with a floating Select Date label, a masked value, and a calendar trigger that opens the picker. It carries the full set of input states (focus, disabled, error, success) and a Type for weekly stepping or range selection. | ⚠️ Bluefish-specific; no single MUI X equivalent. Closest: `DateField` / `DatePicker` field slot |

### Dialog / Modal

| Component → MUI | Description | Flags |
|---|---|---|
| `<DialogTitle>` → DialogTitle | The heading region at the top of a dialog, naming the task or decision it presents. Keep it short and action oriented. | |
| `<DialogActions>` → DialogActions | The action button row anchored at the bottom of a dialog, such as Confirm and Cancel. It aligns and spaces the buttons consistently, with the primary action last. | |

### Drawer

| Component → MUI | Description | Flags |
|---|---|---|
| `<DrawerTitle>` → Bluefish (mirrors DialogTitle) | The heading region at the top of a drawer, naming its contents or purpose. | ⚠️ Bluefish-specific; no MUI Drawer subcomponent |
| `<DrawerActions>` → Bluefish (mirrors DialogActions) | The action button row anchored at the bottom of a drawer, such as Apply and Cancel. It aligns and spaces the buttons consistently. | ⚠️ Bluefish-specific; no MUI Drawer subcomponent |

### Forms

| Component → MUI | Description | Flags |
|---|---|---|
| `<FormLabel>` → FormLabel | Labels a group of related form controls, such as the question a radio or checkbox group answers. It sits above the grouped controls and reflects the surrounding field's focus and error states. | |
| `<InputLabel>` → InputLabel | The text label for a single input or select. It names the field and moves between resting and floating positions as the field gains focus or a value. | |
| `<FormHelperText>` → FormHelperText | Supporting text shown beneath a form field for hints, formatting guidance, or validation messages. It adopts the field's error styling when the input is invalid. | |

### Graphs and Charts

| Component → MUI X | Description | Flags |
|---|---|---|
| `Chart - Bar` → BarChart | Compares values across categories using rectangular bars, with each bar's length proportional to its value. Use it to rank or contrast discrete groups such as campaigns or channels. | |
| `Chart - Donut` → PieChart (donut) | Shows how parts contribute to a whole as segments of a ring, leaving the center open for a total or label. Use it for proportional breakdowns with a small number of categories. | |
| `Chart - Scatterplot` → ScatterChart | Plots points by two numeric values to reveal correlation, clustering, or outliers across a dataset. Use it to compare two metrics across many items. | |
| `Chart - Heatmap` → Heatmap | Represents values across two dimensions as a grid of color-coded cells, where intensity encodes magnitude. Use it to surface patterns and concentrations in dense data. | MUI X (Pro) |
| `Chart - Polar` → RadarChart | Plots several metrics on axes radiating from a shared center, drawing a shape that profiles an item across dimensions. Use it to compare strengths and weaknesses across a fixed set of measures. | ⚠️ Confirm vs radial bar |
| `Chart - Evolution Filled Line` → LineChart (area) | Tracks a value over a continuous axis such as time, shading the area beneath the line to emphasize volume. Use it to show trends and momentum over a period. | |
| `Gauge` → Gauge | Shows a single value within a defined range as a radial dial, making progress toward a target easy to read at a glance. Use it for KPIs, scores, or utilization. | |

**Bluefish-sourced** (net-new charts, from the Notion chart documentation):

| Component → Notion source | Description | Flags |
|---|---|---|
| `Chart - Bar with Differences` → Bar/Column | A column chart that emphasizes the difference between two values, such as current versus prior period or actual versus target. Use it to make gains and shortfalls easy to read at a glance. Start the value axis at zero so the bar lengths compare honestly. | |
| `Chart - Card Summaries` → Card summary | A headline metric shown with light supporting context, such as a label or trend. Keep one primary number per card. Use it when a single value carries the story and a full chart would be overkill. | Sibling of the Surfaces card components |
| `Chart - Key` → Legend | A legend that maps each color or shape in a chart to its meaning. Pair it with charts that show multiple data series so viewers can tell them apart without relying on color alone. | "Key" = legend in Bluefish vocabulary |
| `Chart - Text` → Plaintext | A single value or short answer rendered as plain text, for when one number says it all. Use it instead of a chart when there is no pattern to show. | |
| `Chart - Wordcloud` → Word cloud | A cloud of words sized by frequency, giving a rough sense of which terms appear most across a body of text. It is imprecise, so pair it with a ranked table when exact counts matter. | |
| `Chart - Bubble Chat` → Verbatim Bubbles | A cluster of bubbles that surfaces qualitative verbatim quotes or feedback, each bubble holding one excerpt. Use it to convey the wording and sentiment of responses rather than their counts. Limit to roughly 8 to 10 items per view so quotes stay readable. | "Bubble Chat" = Verbatim Bubbles |

### List

| Component → MUI | Description | Flags |
|---|---|---|
| `<List>` → List | A continuous, vertical index of related items, text, icons, or controls, arranged in consistent rows. Use it for menus, settings panels, and content collections. | `<ListItem>` already described |
| `<ListSubheader>` → ListSubheader | A heading that labels a section within a list, such as a category or date group. It can stick to the top of the list while its section scrolls. | |

### Menus

| Component → MUI | Description | Flags |
|---|---|---|
| `Building Blocks/MenuList` → MenuList | A vertically arranged list of menu items, used as the inner content of a menu or popover. It manages roving keyboard focus across the items. | "Building Blocks/" prefix flags a composition piece |

### Search

| Component → MUI | Description | Flags |
|---|---|---|
| `Search Input` → TextField (search) | A compact text field for entering a search query, with a label and placeholder. It is the bare input used on its own or inside the larger Search Bar. | `Search Bar` already described |

### Table

| Component → MUI | Description | Flags |
|---|---|---|
| `<TableHead>` → TableHead | The header region of a table, containing the row of column labels. It establishes what each column holds and stays visually distinct from the table body. | |
| `<TableHeadRow>` → TableRow (in head) | The row of column header cells inside a table head. Each cell names a column and can carry sorting controls. | Maps to `TableRow` within `TableHead` |

### Timeline

| Component → MUI | Description | Flags |
|---|---|---|
| `<TimelineDot>` → TimelineDot | The marker that anchors a single event on a timeline. Use color or an icon to signal the event's type or status. | MUI Lab |
| `<TimelineItem>` → TimelineItem | A single entry on a timeline, pairing a dot and connector with the event's content. Stack multiple items to show a sequence of events over time. | MUI Lab |

### Utilities

| Component → MUI | Description | Flags |
|---|---|---|
| `<Typography>` → Typography | Renders text using the design system's type scale and styles. Set the visual style with the `variant` prop (H1–H6, Body1, Body2, Caption, Overline) so weight, size, and spacing stay consistent with the theme. | Confirm it's the type component, not a specimen |

---

## Sources

- MUI Material/System: BLU-19 `components.json` + canonical MUI docs prose.
- MUI X (Date pickers, Charts): MUI X documentation.
- Net-new charts: Bluefish chart documentation in Notion.
