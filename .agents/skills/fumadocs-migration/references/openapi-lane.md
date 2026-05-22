# OpenAPI Lane Standard

## Content Staging

Treat `content/**` as the single staging layer for migrated docs content.

- `content/docs/**` is the Fumadocs MDX/page-tree compiler domain.
- `content/openapi/**` is the structured OpenAPI YAML/JSON source-data domain.
- Legacy generated HTML is deferred and should not be moved into either domain as rendered output.

Never put OpenAPI YAML under `content/docs/**`. In this repo, Fumadocs MDX scans `.yaml` files under `content/docs/**` as metadata files, so OpenAPI schemas can fail metadata validation or pollute the page tree.

## Source And Publication

Maintain OpenAPI YAML/JSON only under `content/openapi/**`. Treat the YAML/JSON file as a portable content asset, not as a docs-portal page source file.

Publish `/openapi/**` from `content/openapi/**` with an automated build copy. Do not hand-maintain or commit `public/openapi/**` as source.

For Conversational AI REST, the staging source is:

```text
content/openapi/conversational-ai/convoai.yaml
```

The public source URL is:

```text
/openapi/conversational-ai/convoai.yaml
```

In docs-portal, `scripts/sync-openapi-assets.mjs` owns the build copy from
`content/openapi/**` to `public/openapi/**`, and `bun run build` must run that
copy before Vite/Nitro builds. `public/openapi/**` stays gitignored.

## Endpoint Pages

Endpoint docs are generated from OpenAPI by `operationId`.

Do not generate full MDX shadow files for each endpoint. Generated MDX shadows create a second content source that drifts from YAML.

For the first Conversational AI implementation, endpoint content comes only from `convoai.yaml`. Do not load `overrides/*.mdx` and do not migrate old endpoint Markdown into override files.

The future override contract is documented but deferred. If approved later, optional human overrides may live beside the OpenAPI source and be keyed by `operationId`:

```text
content/openapi/conversational-ai/overrides/start-agent.mdx
content/openapi/conversational-ai/overrides/agent-think.mdx
```

Override frontmatter must use an allowed placement:

```yaml
---
operationId: start-agent
placement: after-description
---
```

Allowed placements:

- `before-operation`
- `after-description`
- `after-request`
- `after-response`

Do not use overrides as a translation layer or as endpoint shadow content.

## Routing And IA

Use an OpenAPI endpoint registry overlay instead of merging generated endpoints into the Fumadocs `source` object.

- Fumadocs `source` remains the compiler/source for `content/docs/**` MDX-authored pages.
- The endpoint registry maps `operationId` to one human-chosen route leaf.
- Route, sidebar entries, locale links, search documents, llms entries, and prerender paths are derived from the same registry.
- Tests must fail when YAML operation IDs and registry entries drift.

For Conversational AI REST, canonical endpoint routes use the rebuilt bilingual IA:

```text
/{locale}/api-reference/conversational-ai/rest-api/agent/{routeLeaf}
```

Do not preserve current new-portal placeholder endpoint routes as compatibility routes. This is a rebuilt docs site; target IA is the contract.

English and Chinese should share the same IA skeleton. With a single locale-neutral `convoai.yaml`, both locale routes may render YAML text as-is. Do not backfill English schema prose from old endpoint Markdown. Locale-specific YAML or explicit overrides can be designed later.

For OpenAPI REST docs in docs-portal, the lane mapping lives in
`src/lib/openapi/lanes.ts`. Treat this file as a small YAML-to-docs-IA mapping
table, not as a large framework. One YAML source gets one lane record with:

- `id`: stable lane ID, for example `convoai` or `example`.
- `sourcePath`: source YAML under `content/openapi/**`.
- `publicSourceUrl`: published YAML URL under `/openapi/**`.
- `tab`: docs tab where generated endpoint pages live.
- `parentUrl`: locale-specific authored MDX page where endpoint children appear
  in the left navigation.
- `routePrefix`: locale-neutral endpoint page prefix, excluding `/{locale}`.
- `operations`: explicit `operationId -> routeLeaf + title` mapping.

When adding another YAML such as `example.yaml`, add another lane record. Do not
add product-specific helpers such as `getExampleEndpointUrl()`, and do not patch
`docs-page.server.ts`, search, markdown, llms, or prerender logic for each
product. These consumers must iterate the lane table.

The route loader first asks the Fumadocs MDX source for a page; only if that
misses should it resolve an OpenAPI endpoint from the lane table. This allows
`content/docs/**/meta.json` to list virtual endpoint leaves without requiring
physical `.md`/`.mdx` shadow files.

OpenAPI endpoint loaders must not construct a standalone docs-shell payload.
They should return endpoint content and metadata only. The normal docs page
loader owns shell integration: reuse the Fumadocs source-derived `sidebar`,
`tabs`, and `pages`, then overlay virtual endpoint leaves under the existing IA
parent. Identify that parent from stable IA paths or child page URLs, not from
fragile generated section IDs alone. Derive breadcrumb, locale links, previous
and next links, search documents, llms exports, and prerender paths from the
same registry plus the source-derived shell data.

Apply the same virtual endpoint overlay to both generated endpoint pages and
real MDX parent/index pages in the same API Reference tree. Users must see the
YAML-derived endpoint children when they enter from an authored page such as
`/en/api-reference/conversational-ai/rest-api/agent`, not only after they click
into `/agent/{endpoint}`. A split navigation model is migration debt and should
be caught with loader tests for both page kinds.

## Rendering

Legacy `RestfulRender` and `OpenapiRender` are not migrated.

Use a separate Fumadocs version gate before renderer work when adopting the latest compatible Fumadocs packages. Keep that dependency upgrade isolated from OpenAPI rendering changes.

Do not use `fumadocs-ui` as the OpenAPI page renderer in this portal. `fumadocs-openapi` may be used for schema processing, page data, and source utilities, but endpoint rendering belongs to local docs-shell components.

Do not import `fumadocs-openapi/ui` in docs-portal. The current implementation
uses local docs-shell rendering components and a server-side YAML loader
(`src/lib/openapi/source.server.ts`) that normalizes local `$ref` values into
JSON-serializable operation data. Keep the page payload serializable across
TanStack Start server/client boundaries.

The first renderer is a static API reference, not a Try It console or API explorer. It should render method, path, server/source link, auth hints, parameters, request body, responses, schemas, and examples without executing requests.

Render nested request and response contracts as a guarded recursive schema tree. Do not stop at first-level fields, and do not force deeply nested contracts into a wide flat table.

## AI-Readable Exports

`/llms.txt` links canonical docs pages, not YAML fragments.

`/llms-full.txt` and per-page raw markdown include source traceability:

```md
## Source

- OpenAPI: /openapi/conversational-ai/convoai.yaml
- Operation ID: start-agent
- Method: POST
- Path: /v2/projects/{appid}/join
```

OpenAPI endpoint pages must also produce search-index documents derived from YAML and the endpoint registry. Do not create MDX shadow files just to make search work.

In docs-portal, keep these surfaces derived from the registry and YAML:

- `/llms.txt`
- `/llms-full.txt`
- `/llms.mdx/docs/{path}.md`
- `/api/search`
- TanStack Start prerender page entries

## Verification

OpenAPI lane changes require the full OpenAPI lane acceptance gate, not only `bun run types:check`.

Verify:

- Fumadocs version gate passes before renderer work: `bun run types:check`, focused tests, and `bun run build`.
- Registry tests prove all YAML `operationId` values are mapped once.
- Renderer tests cover nested schema tree output for deep fields.
- `bun run build` succeeds.
- `.vercel/output/static/openapi/...` contains the published YAML.
- Ordinary endpoint docs pages are prerendered for English and Chinese canonical routes.
- `/llms.txt` links endpoint pages.
- `/llms-full.txt` or per-page raw markdown includes operation source traceability.
- `/api/search` can find generated endpoint pages.
- Browser verification shows the endpoint page renders without obvious layout overflow.
- `rg "fumadocs-ui|fumadocs-openapi/ui" src package.json` returns no matches.
- `git status --short public/openapi` is empty, while ignored status shows the generated copy is ignored.
- `content/openapi/**/overrides` contains no endpoint override files unless a later ADR explicitly enables overrides.
