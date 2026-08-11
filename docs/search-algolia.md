# Algolia search

Docs search uses two federated Algolia indexes:

- `docs_portal_en` contains portal documentation and REST OpenAPI pages.
- `agora_APIRefSearch` contains SDK API symbols managed by the API reference
  crawler.

The portal queries both indexes and displays SDK symbols in a separate API
Reference result group. The docs index is also intended to power the public
Agora MCP server configured in Algolia Public MCP.

## Environment

Client-side search:

```shell
VITE_ALGOLIA_APP_ID=...
VITE_ALGOLIA_SEARCH_API_KEY=...
# Optional override; defaults to agora_APIRefSearch.
VITE_ALGOLIA_API_REFERENCE_INDEX_NAME=...
```

Index sync:

```shell
ALGOLIA_ADMIN_API_KEY=...
ALGOLIA_INDEX_NAME=docs_portal_en
```

## Sync

```shell
bun run search:sync
```

`bun run build` runs this step after the static build. If
`VITE_ALGOLIA_APP_ID` or `ALGOLIA_ADMIN_API_KEY` is not configured, the sync
step is skipped so local and preview builds can still complete. This sync only
updates `docs_portal_en`; the SDK API reference index is managed separately by
its crawler. Set
`ALGOLIA_SYNC_DISABLED=true` to force-skip the step even when credentials are
available. The sync script indexes regular docs and generated OpenAPI operation
pages. Records include `locale`, `product`, `platform`, `tab`, and `objectType`
facets so Algolia Public MCP can expose platform-aware documentation search.

## MCP

Create an Algolia Public MCP server in the Algolia Dashboard and expose the
`docs_portal_en` index. If `mcp.agora.io` is required, point that
domain at a thin HTTP proxy that forwards Streamable HTTP requests to the
Algolia-managed MCP URL.
