# OpenAPI Metadata Value Style Design

## Background

The schema metadata rows currently use mixed treatments: `Allowed values` renders several small code chips, while `Default` and `Range` are plain text. The label column also uses a muted, fixed-width layout. This makes the three constraint types look unrelated and makes it harder to scan the value itself.

## Approved decisions

- Use one value-container visual language for `Allowed values`, `Default`, and `Range`.
- Render each label as bold, dark text with a literal colon: `Default:`.
- Start the value immediately after its own label and colon; do not insert a gap between the label and value container.
- Do not align values to one fixed global column. Each value begins directly after the width of its own label, matching the supplied reference image.
- Use a light gray border, subtle gray background, small radius, and blue bold monospace text for the value container.
- Render `Allowed values` as one overall container with comma-separated values rather than separate bordered chips.
- Keep metadata rows on one inline flow. If a value is too long, it wraps inside the available value area without causing page-level horizontal overflow.
- Do not change schema parsing, ordering, default/range semantics, field status badges, or the schema tree.

## Visual contract

```text
Allowed values: [GLOBAL, NORTH_AMERICA, EUROPE, ASIA, INDIA, JAPAN]
Default:        [byok]
Range:          [0, 259200]
```

The brackets above represent the visual value container, not literal characters that must be added to every scalar. The implementation should preserve the existing value text for scalar defaults and ranges while using the same container styling. `Allowed values` may show comma separators inside its single container.

Required CSS/DOM hooks:

- `.openapi-schema-metadata-row` remains the row boundary.
- `.openapi-schema-metadata-label` becomes bold/dark and includes `:` in rendered text.
- `.openapi-schema-metadata-value` becomes an inline-flex value container with max-width and wrapping behavior.
- `.openapi-schema-allowed-values` uses the same value-container contract; its child values do not render independent borders.
- Existing `.openapi-schema-metadata`, field-details alignment, logical schema guide lines, and mobile break-word rules remain intact.

## Component/data flow

`OpenApiSchema` continues to produce `OpenApiSchemaMetadataItem[]` through `getOpenApiSchemaMetadataItems`. `OpenApiSchemaMetadata` owns the label colon and value-container wrapper. `OpenApiSchemaAllowedValues` only changes its presentation from many bordered code tokens to one bordered container with comma-separated inline values. No OpenAPI source or schema-view type changes are required.

## Responsive and accessibility behavior

- Labels and values are rendered in the same inline row whenever the available width permits.
- On narrow screens, the row may wrap naturally, but the value container must stay within the row's available width and use `overflow-wrap: anywhere`.
- Label text remains readable without relying on color alone.
- Value text remains selectable text, not an image or pseudo-element.
- Existing metadata DOM order and schema field anchors remain unchanged.

## Testing

- Update `OpenApiSchemaMetadata.test.tsx` to assert label text includes a colon, each value is immediately adjacent in the row DOM, and all metadata values use the shared value-container class.
- Update `OpenApiSchemaFieldRow.test.tsx` and `OpenApiSchema.test.tsx` to assert allowed values use one shared container, preserve value ordering/content, and retain Default/Range/Allowed values metadata ordering.
- Add class-level assertions for bold labels, value-container border/background/blue monospace styles, inline flow, and wrapping classes.
- Preserve tests for deprecated strike-through, Required/Optional/Deprecated badges, continuous logical child borders, `hidden="until-found"`, and responsive shrinkability.
- Browser-check the actual join endpoint at desktop and 390px widths for same-row adjacency, no extra gap after the colon, value wrapping, and no horizontal page overflow.

## Non-goals

- No changes to `Filter Properties`, section headings, endpoint method badges, examples rail, scrollbars, or schema tree interaction.
- No changes to API data, metadata sort order, translation keys, or allowed-value semantics.
