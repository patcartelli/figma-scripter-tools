# Bluefish Spec Output Template

Use this structure when generating a spec from a built screen or component. Fields marked **[Required]** must always be completed. Fields marked *[Optional]* may be omitted if not applicable.

---

## [Component Name]
*[Required] Use the master component name from Figma (Step 1 of figma-reading-guide.md). Do not use auto-generated layer names.*

**Category:** [from figma-reading-guide.md Step 3]
*[Required] One of: Navigation · Buttons & Capsules · Forms & Controls · Data & Charts · Feedback · Layout*

**Status:** Needs Review
*[Required] Default is **Needs Review**. Update when status changes: **Ready** = production-ready, all fields complete; **In Progress** = spec is partial or component is still being designed; **Needs Review** = designed but pending design sign-off or eng review.*

### Variants & States
*[Required] List all variants and interaction states present in the component. Example: "Default, Hover, Active, Disabled". If only one variant, write "Single variant".*

[list all variants and states present]

### Props
*[Required] One row per Figma component property. Type: `string`, `boolean`, or `enum`. Value: the specific value used in this instance. Available: all valid values for this property (from the component set's variants or component property definition).*

| Prop | Type | Value | Available | Notes |
|---|---|---|---|---|
| [prop name] | [string / boolean / enum] | [value used] | [all valid values] | |

### Tokens Used
*[Required] Include every color and spacing token applied. If a value has no token, flag with `/* ⚠️ no token for [value] — needs token */` in the Notes column.*

| Token | Role |
|---|---|
| color-roles/[name] | [how it's used] |
| scale/[name] | [how it's used] |

### Type Styles
*[Required if any text present] Use top-level style names only (no `/` in name). Reference `type-styles.md` for the authoritative list.*

| Element | Style |
|---|---|
| [element] | [style name from type-styles.md] |

### Accessibility
*[Required — non-optional. Every spec must include this section, even for non-interactive components.]*

- Role: [ARIA role — e.g., `role="button"`, `role="img"`. Write "Implicit / native element" if no explicit role needed.]
- Label: [aria-label value or labeling strategy — e.g., `aria-label="Submit"` or "Labeled by adjacent heading"]
- Keyboard: [keyboard interaction — e.g., "Enter/Space activates" or "Not interactive / no keyboard requirement"]
- Contrast: [pass / flag — flag format: `⚠️ contrast fails WCAG AA on [background] — [reason]`]

### Figma Reference
*[Optional] The component set name on the Figma page, if known. Example: "Button component set, Buttons page".*

[Component set name on Figma page, if known]

### Notes
*[Optional] Use for gaps, assumptions, flags, and architecture notes. Required content if applicable: architecture pattern (e.g., `Architecture: wrapping (interim — pending eng review).`), any ⚠️ flags that couldn't be resolved inline.*

[gaps, assumptions, flags]

---

## Field Mapping (from get_design_context)

Use this table when populating spec fields from a `get_design_context` response. Every field
must be filled or flagged — do not omit fields silently.

| Spec Field | Source in get_design_context Response | If Not Available |
|---|---|---|
| `## [Component Name]` | Component structure → master component name. Use figma-reading-guide.md Step 1 (master component name, not auto-generated layer name). | Ask: "What is the name of this component?" This is the ONLY field that triggers a clarifying question. |
| `**Category:**` | Infer from component name using figma-reading-guide.md Step 3 (Navigation, Buttons & Capsules, Forms & Controls, Data & Charts, Feedback, Layout). | `/* ⚠️ category not found — fill manually */` |
| `**Status:**` | Not available in response — always manual. | Default to `Needs Review`. |
| `### Variants & States` | Component structure → variant properties and states. | `/* ⚠️ variants not found in design context — fill manually */` |
| `### Props` | Component structure → Figma property list (Label=Value pairs) for Value column. For Available column: query the component set variants — each variant exposes the full value range per property. If component has no variants, Available = same as Value. | `/* ⚠️ props not found in design context — fill manually */` Note: for composite components (e.g. a nav panel built from heading, item, group primitives), fetch `get_design_context` for each sub-component separately — the composite's context will not expose sub-component props accurately. |
| `### Tokens Used` | Color values and design tokens + spacing/padding values. Translate hex values to `color-roles` token paths using live session tokens from `get_variable_defs`. | `/* ⚠️ no token for [value] — needs token */` in the Notes column. |
| `### Type Styles` | Typography specifications → map font family/size/weight to top-level style names via `type-styles.md`. | `/* ⚠️ type style not found — fill manually */` |
| `### Accessibility` | Not available in response — always requires manual judgment. | Fill with role, label, keyboard, and contrast assessment from component structure. Never leave blank. |
| `### Figma Reference` | Not in response. Use `get_metadata` separately if the component set location is needed. | Omit the field, or: `/* ⚠️ reference not available — check Figma manually */` |
| `### Notes` | Collect all `⚠️` flags that could not be resolved inline. | — |

**Fields that are always manual (never populated from design context):**
- `**Status:**` — set by the designer, not inferable from component data
- `### Accessibility` — requires human judgment; ARIA roles and keyboard behavior are not in the response

**Component name is the only field that triggers a clarifying question.** All other missing
fields use the fill-and-flag pattern silently — do not ask follow-up questions for category,
status, variants, props, tokens, type styles, or Figma reference.

---

## Phase 1 Audit — 2026-05-08

**Outline rename:** N/A — no outline token references in this file.
**Other drift:** None found.
**Status:** FOUND-03 complete for this file.
