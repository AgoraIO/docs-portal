# docs-portal

`docs-portal` is a TanStack Start documentation portal built with `fumadocs-core`, `fumadocs-mdx`, and local `shadcn/ui` components.

## Architecture

- Content source of truth: `content/docs`
- Content pipeline: `fumadocs-mdx`
- Page tree, TOC, search data, and `llms.txt`: `fumadocs-core`
- App shell, navigation, search dialog, and theme handling: local app code with `shadcn/ui`

## Content Layout

The portal groups content by locale and top-level tab:

```text
content/docs/
  en/
    introduction/
    ai/
    realtime-media/
    api-reference/
  zh-CN/
    introduction/
    ai/
    realtime-media/
    api-reference/
```

Each top-level folder maps directly to a header tab. Navigation inside a tab is driven by `meta.json`.

## Development

Start the local dev server:

```bash
bun run dev
```

For focused content work, scope the Fumadocs collection to one subtree:

```bash
DOCS_DEV_SCOPE=en/ai/openai-realtime bun run dev:scope
```

Run verification:

```bash
bun run test
bun run types:check
bun run build
```

See [docs/development.md](docs/development.md) for script semantics, scoped dev
rules, and verification guidance.
