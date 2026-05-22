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

## Rendering

Legacy `RestfulRender` and `OpenapiRender` are not migrated.

Use a separate Fumadocs version gate before renderer work when adopting the latest compatible Fumadocs packages. Keep that dependency upgrade isolated from OpenAPI rendering changes.

Do not use `fumadocs-ui` as the OpenAPI page renderer in this portal. `fumadocs-openapi` may be used for schema processing, page data, and source utilities, but endpoint rendering belongs to local docs-shell components.

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
