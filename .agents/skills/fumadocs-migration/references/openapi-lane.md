# OpenAPI Lane Standard

## Content Staging

Treat `content/**` as the single staging layer for migrated docs content.

- `content/docs/**` is the Fumadocs MDX/page-tree compiler domain.
- `content/openapi/**` is the structured OpenAPI YAML/JSON source-data domain.
- Legacy generated HTML is deferred and should not be moved into either domain as rendered output.

Never put OpenAPI YAML under `content/docs/**`. In this repo, Fumadocs MDX scans `.yaml` files under `content/docs/**` as metadata files, so OpenAPI schemas can fail metadata validation or pollute the page tree.

## Source And Publication

Maintain OpenAPI YAML/JSON only under `content/openapi/**`.

Publish `/openapi/**` from `content/openapi/**` with an automated build copy. Do not hand-maintain `public/openapi/**` as source.

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

Optional human overrides live beside the OpenAPI source and are keyed by `operationId`:

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

## Rendering

Legacy `RestfulRender` and `OpenapiRender` are not migrated.

Do not use `fumadocs-ui` as the OpenAPI page renderer in this portal. `fumadocs-openapi` may be used for schema processing, page data, and source utilities, but endpoint rendering belongs to local docs-shell components.

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

## Verification

OpenAPI lane changes require more than `bun run types:check`.

Verify:

- `bun run build` succeeds.
- `.vercel/output/static/openapi/...` contains the published YAML.
- Ordinary endpoint docs pages are prerendered.
- `/llms.txt` links endpoint pages.
- `/llms-full.txt` or per-page raw markdown includes operation source traceability.
