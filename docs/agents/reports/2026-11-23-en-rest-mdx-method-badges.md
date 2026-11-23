# English REST Markdown/MDX HTTP method badges

## Problem and expected behavior

The English product sidebar already renders colored method badges for generated OpenAPI operations. Authored REST references have the same HTTP semantics, but their sidebar entries have no method metadata. Media Push is an example: its Create, Delete, Update, Get and List entries are fragments of one Markdown article, rather than five generated pages.

Render the existing method label on each explicitly annotated REST link, on desktop and in the mobile navigation. Keep the article overview, authentication, type definitions and API limits free of method labels. Preserve page content, routes, fragments and product return context.

## Content contract

Single-operation MD/MDX pages declare a method in frontmatter:

```yaml
httpMethod: POST
```

Multi-operation articles declare methods by their existing TOC fragment, without the `#`:

```yaml
httpMethods:
  create-create-a-converter: POST
  delete-destroy-the-converter: DELETE
  update-update-the-converter: PATCH
  get-get-the-streaming-status-of-the-converter: GET
  list-query-the-converters-of-all-or-specified-channels-under-a-project: GET
```

Use uppercase `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS` or `TRACE`. The collection schema rejects unsupported values. Obtain each value from the documented HTTP request, not an operation name or an authentication example. When renaming a heading, update its mapping and verify the actual generated TOC.

A page with several endpoints has no single `httpMethod`. A fragment without an explicit mapping receives no badge, even if its containing page has a page-level method. This avoids labeling an overview or rate-limit section as an endpoint.

## Implementation

1. `source.config.ts` retains and validates both frontmatter fields in the MDX collection.
2. `withDocsHttpMethods` builds a URL lookup from authored pages, traverses the completed sidebar once, and resolves page methods or exact fragment methods. Existing OpenAPI node methods take precedence. External links are skipped.
3. `loadDocsPagePayload` applies the decorator for English after product REST menus and article outlines have been assembled. Static payload generation uses this same loader, so no runtime Markdown scanning or browser request is needed.
4. Existing `DocsSidebarTree` / `SidebarPageLabel` renders the resulting `node.method`. Color, wrapping, accessible labels, dark mode and mobile behavior are shared with English OpenAPI links. No new badge component, CSS or dependency is introduced.

Complexity is O(pages + sidebar nodes) per payload, using metadata already loaded for navigation. Chinese navigation is not decorated by this English rollout.

## Rollout

- 40 fragment entries: Media Push (5), Media Pull (4), Flexible Classroom (17), Agora Analytics (14).
- 12 single-operation MDX pages: Speech-to-Text v5/v6 (10 existing deprecated reference pages), Broadcast Streaming custom/standard recording entry-point settings (2).
- Overview/authentication pages and other multi-operation reference articles stay unannotated at page level. Other reference families can adopt this metadata when their existing navigation exposes individual operations. This change does not create new endpoint routes or expand additional article outlines.

## Validation

Focused tests cover nested fragments, page versus fragment isolation, OpenAPI precedence, external links, retained product context, and schema rejection of invalid methods. Real-source navigation tests check all four expanded article families against their generated TOCs and check STT methods against OpenAPI v7 coexistence. Run the full Vitest suite and type checks. Browser review covers Media Push, Media Pull, a single-operation MDX reference, existing Media Gateway OpenAPI badges, mobile navigation, dark theme, and fragment navigation. Local screenshots belong under ignored `.agent/artifacts/`, not in the PR.

### Results at main baseline `7b318fe2a`

- Focused navigation/schema/sidebar regressions: **62 passed** across 4 files.
- `bun run types:check`: passed.
- `bun run lint`: passed, with existing warnings.
- `bun run test`: **7,402 passed**, 15 failed, 24 skipped. All 15 failure names were reproduced in a separate unmodified main checkout using the same dependencies/environment: 7 OpenAPI component assertions, 7 redirect-script tests (Node 22.16 cannot import `.ts` in spawned scripts), and 1 content regression assertion. These are not attributed to this change.
- Visual smoke: 1440×1000 desktop Media Push/Pull and Media Gateway; 390×844 Media Push navigation in light/dark; STT v6 MDX in dark. Media Push fragment URL retained the product context and positioned the Update heading at approximately 155px with no horizontal page overflow. This is targeted browser verification, not a full API content audit.
- Screenshots and command logs are local-only under `.agent/artifacts/en-rest-mdx-method-badges/`.
