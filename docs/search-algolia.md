# Algolia search

Docs search is backed by the `docs_platform_aware_markdown` Algolia index.
The same index is intended to power the public Agora MCP server configured in
Algolia Public MCP.

## Environment

Client-side search:

```shell
VITE_ALGOLIA_APP_ID=...
VITE_ALGOLIA_SEARCH_API_KEY=...
VITE_ALGOLIA_INDEX_NAME=docs_platform_aware_markdown
```

Index sync:

```shell
ALGOLIA_APP_ID=...
ALGOLIA_ADMIN_API_KEY=...
ALGOLIA_INDEX_NAME=docs_platform_aware_markdown
```

## Sync

```shell
bun run search:sync
```

The sync script indexes regular docs and generated OpenAPI operation pages.
Records include `locale`, `product`, `platform`, `tab`, and `objectType`
facets so Algolia Public MCP can expose platform-aware documentation search.

## MCP

Create an Algolia Public MCP server in the Algolia Dashboard and expose the
`docs_platform_aware_markdown` index. If `mcp.agora.io` is required, point that
domain at a thin HTTP proxy that forwards Streamable HTTP requests to the
Algolia-managed MCP URL.
