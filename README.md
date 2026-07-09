# Docs Portal

This repository powers the Agora documentation portal at
[docs.agora.io](https://docs.agora.io). It is a TanStack Start documentation
site built with Fumadocs, React, Vite, and local shadcn/ui components.

## What Is Here

- Product documentation in `content/docs/{en,zh-CN}`.
- OpenAPI source files in `content/openapi`.
- Static assets in `public`.
- Application routes in `src/routes`.
- Shared app logic in `src/lib`.
- UI components in `src/components`.
- Repository and contributor guidance in `docs/agents` and `CONTRIBUTING.md`.

## Content Layout

Documentation is grouped by locale and top-level navigation tab:

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

Each top-level folder maps to a header tab. Navigation inside a tab is driven by
`meta.json` or `meta.yaml` files.

## Prerequisites

- Node.js 22.12 or newer.
- Bun for local scripts and dependency installation.

Install dependencies:

```bash
bun install
```

## Development

Start the full local dev server:

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

## Authoring Docs

Docs content should follow the repo Markdown and MDX contract in
[docs/agents/markdown-authoring-standard.md](docs/agents/markdown-authoring-standard.md).
Use standard Markdown first, and use only the documented MDX primitives for
callouts, tabs, platform variants, images, tables, and list continuations.

For docs-owned screenshots and other static assets, upload to S3 with
`bun run assets:upload`. Follow the security and bucket-prefix rules in
[docs/agents/static-asset-upload.md](docs/agents/static-asset-upload.md).

## Contributing

Start with [CONTRIBUTING.md](CONTRIBUTING.md). It explains how to report docs
issues, propose content changes, run local checks, and open pull requests.

## Security

Do not open public issues for security vulnerabilities. Follow
[SECURITY.md](SECURITY.md) instead.

## License

This project is licensed under the Apache License 2.0. See [LICENSE](LICENSE).
