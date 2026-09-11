# Fumadocs-aligned OpenAPI schema design

Date: 2026-08-31

Status: Approved through PR #1034 review direction and issue #1041

Scope: Replace the parallel OpenAPI field renderer with the official Fumadocs Schema UI while retaining the reusable behavior developed in PR #1034.

## Context

PR #1034 improved the examples rail, syntax highlighting, response organization, localization, anchors, and regression coverage. Its field presentation moved in the opposite architectural direction: `schemaUI.render` replaced Fumadocs' Schema UI with a local recursive tree, local field rows, local disclosure state, and a large CSS contract.

At a 480 px viewport, the Conversational AI `join` route renders at approximately 10,149 px on the PR head versus 5,325 px in production. The PR renderer also places every flattened schema row into the page layout and does not expose Fumadocs' property filter.

Issue #1041 establishes the replacement direction: Fumadocs owns schema information architecture and interaction; Agora owns the visual tokens and the product-specific operation composition.

## Approaches considered

### 1. Use the official Schema UI at the existing Fumadocs seam

Replace the global custom-tree override with a narrow adapter that composes the official `generateSchemaUI` and `SchemaUI` exports. Render request bodies and parameters through the slots produced by `createOpenAPIPage`, and pass the same `ctx.SchemaUI` module into the retained response-status presentation.

This is the selected approach. It restores the upstream property filter, compact field rows, restrained `*` and `?` semantics, nested-type navigation, and upstream schema parsing without discarding the accepted examples rail or response organization.

### 2. Wrap the official schema data in another local renderer

Import `generateSchemaUI` or the official Schema implementation and rebuild the rows locally from its generated model.

This would share parsing with Fumadocs but keep a parallel interaction and styling implementation. The interface would remain shallow and upgrades would still require comparing two renderers, so this approach is rejected.

### 3. Restyle the current custom tree

Reduce padding, replace badges, and add a property filter to `OpenApiSchemaTree`.

This might reduce page height, but it does not address the duplicate renderer, nested navigation drift, or upgrade cost identified in review. This approach is rejected.

## Architecture and seam

`createOpenAPIPage` is the schema-rendering seam. Its official `SchemaUI` module is a deep module: callers provide the schema and usage mode, while Fumadocs owns filtering, type navigation, requiredness, metadata, anchors, and schema-shape handling. The local adapter may compose the supported official `SchemaUI` and `generateSchemaUI` exports, but it must not render property rows or own disclosure state.

The local operation module retains only product-specific composition:

- the responsive examples rail;
- explicit Agora code-sample groups and syntax highlighting;
- the English response-status accordion and media-type selection;
- Agora documentation extensions and callouts;
- locale-specific generated chrome;
- endpoint execution remaining disabled.

Request body schemas and parameters use the official Fumadocs slots. The response-status module receives the official `SchemaUI` interface from the render context and uses it for the selected response schema. This keeps the custom response organization without reimplementing schema behavior.

Response headers remain a narrow local adapter because they are composed inside the Agora-specific response accordion rather than an upstream schema slot. Their presentation follows the same compact separator grammar and uses restrained semantics.

## Localization

`FumadocsOpenApiContent` wraps the generated page with `@fuma-translate/react`'s `TranslationProvider`. English uses an empty translation map. Chinese supplies the official schema keys for filtering, metadata, deprecation, and empty search results.

`DocsContent` passes its normalized locale into `FumadocsOpenApiContent`, so direct production rendering and component tests use the same locale path.

## Styling

Fumadocs remains the source of truth for DOM structure, density, responsive composition, focus behavior, and dark-mode states. Agora styling is applied through existing semantic `--color-fd-*` and portal tokens in `src/styles/app.css`.

The implementation removes CSS tied to `.openapi-schema-tree`, `.openapi-schema-depth`, disclosure guides, field badges, and the mobile badge stack. Any remaining overrides must target stable official attributes or structural selectors and must not recreate a card around every property.

## Navigation and discoverability

Official Fumadocs field links use the schema root anchor plus encoded `path` and `s-highlight` query parameters. This becomes the canonical nested-schema navigation model.

The retained page-level hash synchronization continues to support normal heading and response-section hashes. Tests should verify official field link generation and navigation rather than preserving the deleted custom per-row hash format.

Property filtering is the supported way to locate fields in the currently displayed object. Nested objects are discoverable through the official interactive type control and its focused filter.

To preserve browser-find for nested field names, the adapter builds a presentation-free search index from the same official generated schema data. Nested names remain in neutral `hidden="until-found"` nodes. A `beforematch` event writes the official `path` and `s-highlight` query state, remounts the official `SchemaUI`, and lets its supported deep-link protocol open and focus the containing object. The bridge renders no duplicate field details, cards, badges, or schema layout.

## Testing

Primary tests render `FumadocsOpenApiContent` and assert user-visible behavior through its external interface:

- request and parameter schemas expose `Filter Properties`;
- filtering narrows visible properties and clearing restores them;
- required and optional state use `*` and `?`, not badges;
- nested object types open the official type-navigation surface;
- response-status organization uses the official Schema UI for the selected schema;
- locale-specific schema labels are supplied through the translation provider;
- examples rail, code samples, response tabs, and source-driven extensions remain intact.

Delete component tests for `OpenApiSchemaTree` and `OpenApiFieldRow` when those modules are deleted. Presentation-neutral schema normalization tests remain only where still consumed by Markdown, search indexing, or response normalization.

## Success criteria

- Any local `schemaUI.render` adapter delegates field generation and rendering to official Fumadocs exports and contains no property-row implementation.
- Request schemas, response schemas, and parameters use the official Fumadocs Schema UI.
- Property filtering and official nested-type navigation work with keyboard focus.
- Browser find on a nested field name opens the official containing object without painting a hidden duplicate row.
- The 480 px `join` route is materially shorter than PR #1034 and has no document-level horizontal overflow.
- The examples rail remains sticky at the accepted desktop container threshold and returns to document flow below it.
- English response grouping, code samples, localization, dark mode, and Agora documentation extensions remain functional.
- Focused tests, the full test suite, type checking, linting, and production build pass.
