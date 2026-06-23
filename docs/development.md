# Development

This project is a TanStack Start documentation portal backed by Fumadocs
collections. The full docs graph is useful for production validation, but it is
larger than most local content-editing workflows need.

## Dev Modes

Use the default dev server when you need the complete site:

```bash
bun run dev
```

Use scoped dev when you are working inside one docs subtree:

```bash
DOCS_DEV_SCOPE=en/ai/openai-realtime bun run dev:scope
```

`DOCS_DEV_SCOPE` is relative to `content/docs`. The scope keeps:

- Markdown and MDX files under the scoped subtree.
- `meta.json` or `meta.yaml` files at the docs root and ancestor folders.
- `meta.json` or `meta.yaml` files inside the scoped subtree.

For example, `DOCS_DEV_SCOPE=en/ai/openai-realtime` includes
`content/docs/en/ai/openai-realtime/**/*.{md,mdx}` plus the root, `en`, `en/ai`,
and scoped subtree metadata files.

Scoped dev is intended for fast authoring and page-level checks. Use full dev or
the production build when validating cross-product navigation, all-locale
behavior, search coverage, OpenAPI navigation, or any change that touches shared
shell behavior.

## Script Reference

| Command | Purpose |
| --- | --- |
| `bun run dev` | Start the full Vite dev server. |
| `bun run dev:full` | Explicit alias for full dev. |
| `DOCS_DEV_SCOPE=<path> bun run dev:scope` | Start dev with a scoped Fumadocs collection. |
| `bun run test` | Run the Vitest suite. |
| `bun run types:check` | Regenerate Fumadocs output and run `tsc --noEmit`. |
| `bun run lint` | Run Biome checks on config and `src`. |
| `bun run openapi:sync` | Copy maintained OpenAPI assets into `public/openapi`. |
| `bun run docs:static-payload` | Generate static docs payload JSON with the static SPA flags enabled. |
| `bun run build:app:static` | Run the static SPA Vite build. |
| `bun run build:static` | Run OpenAPI sync, static payload generation, and app build. |
| `bun run build` | Production build entrypoint; currently delegates to `build:static`. |

## Verification Ladder

For content-only edits, start with the affected page in scoped dev, then run
focused tests if the touched area has them.

For source config, routing, navigation, OpenAPI, or shell changes, use:

```bash
bun x vitest run <focused test files>
bunx biome check <touched files>
bun run types:check
bun run build
```

When browser behavior matters, start a dev or preview server and test the actual
printed local URL. Vite may fall back to another port if the requested port is
busy.

## Production Build Flow

The production build is intentionally fuller than local scoped dev:

1. Sync OpenAPI assets from `content/openapi` to `public/openapi`.
2. Generate static docs payload JSON under `public/__static/docs`.
3. Build the static SPA app with the static experiment flags enabled.

Do not use scoped dev as production evidence. It is a local authoring tool, not
a full-site validation path.
