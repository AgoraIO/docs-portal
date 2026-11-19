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

After Vercel publishes a Global release, GitHub Actions starts the
`Global production search` workflow for the deployed commit. While the index updates,
direct page links serve the release and search results can reflect earlier content.

To retry a failed sync or replay, rerun the failed search job in GitHub Actions.
If the deploy summary reports a dispatch failure, use the full SHA from the
successful production deployment as `DEPLOYED_SHA`.

```shell
gh workflow run global-search.yml --ref release/prod -f release_sha="$DEPLOYED_SHA"
```

The workflow checks the requested SHA against the current release branch before
writing to Algolia. Run the sync locally with the following command.

```shell
bun run search:sync
```

After synchronization, replay the 54 approved Global queries against the live
Docs and SDK API indexes:

```shell
bun run search:replay -- --out=global-search-replay.json
```

The command uses the same client-side credentials and V2 search path as the
portal. Production runs it after sync with the default strict gate, so all 54
cases determine the exit status. Preview also executes and reports all 54 cases,
but passes `--gate=preview-blockers` so only the four review blockers determine
its exit status. The optional JSON output is suitable for retaining as rollout
evidence.

The local sync skips indexing when `VITE_ALGOLIA_APP_ID` or
`ALGOLIA_ADMIN_API_KEY` is missing. The production search workflow reports
missing credentials as an error. The sync updates the docs index. A separate
crawler maintains the SDK API reference index. Set
`ALGOLIA_SYNC_DISABLED=true` to force-skip the step even when credentials are
available. The sync script indexes regular docs and generated OpenAPI operation
pages. Records include `locale`, `product`, `platform`, `tab`, and `objectType`
facets so Algolia Public MCP can expose platform-aware documentation search.

## MCP

Create an Algolia Public MCP server in the Algolia Dashboard and expose the
`docs_portal_en` index. If `mcp.agora.io` is required, point that
domain at a thin HTTP proxy that forwards Streamable HTTP requests to the
Algolia-managed MCP URL.
