# Contributing

Thank you for improving the Agora documentation portal. This repo
accepts documentation fixes, content improvements, source changes for the docs
site, and issue reports that help maintainers reproduce documentation problems.

## Before You Start

- Search existing issues and pull requests before opening a duplicate.
- Keep changes focused. Separate unrelated documentation fixes into separate
  pull requests.
- Do not include secrets, private credentials, customer data, or confidential
  support details in issues, commits, screenshots, or pull requests.
- For security vulnerabilities, follow `SECURITY.md` instead of opening a public
  issue.

## Repository Setup

Use Node.js 22.12 or newer and Bun.

```bash
bun install
bun run dev
```

For focused content work, scope the docs graph to one subtree:

```bash
DOCS_DEV_SCOPE=en/ai/openai-realtime bun run dev:scope
```

## Content Contributions

The docs source of truth is `content/docs/{en,zh-CN}`.

- Follow `docs/agents/markdown-authoring-standard.md` for Markdown and MDX.
- Keep navigation updates in the nearest `meta.json` or `meta.yaml`.
- Put maintained OpenAPI sources in `content/openapi`; generated public copies
  under `public/openapi` are build outputs.
- Prefer precise, task-oriented language over broad marketing copy.
- Preserve locale intent. If a change affects both English and Chinese content,
  update both locales or explain the gap in the pull request.
- Add or update images only when they directly help readers complete a task.

## Code Contributions

- Use TypeScript, React function components, and ESM imports.
- Prefer existing components in `src/components/ui` and helpers in `src/lib`.
- Keep generated files such as `src/routeTree.gen.ts` out of manual edits unless
  route generation requires it.
- Avoid runtime filesystem reads from deployment functions. For OpenAPI source
  loading, use the bundled source-text pattern in
  `src/lib/openapi/source-text.server.ts`.

## Verification

Choose checks based on the change size and risk.

```bash
bun run test
bun run types:check
bun run lint
bun run build
```

For content-only edits, at minimum check the affected page in local dev or
scoped dev. For navigation, routing, OpenAPI, shell, or search changes, run the
full relevant checks and include the results in the pull request.

## Pull Requests

Pull requests should include:

- A concise summary of the change.
- Linked issues, if applicable.
- Verification commands and results.
- Screenshots or screen recordings for visible UI or docs-shell changes.
- Notes about locale gaps, migration compromises, or follow-up work.

By contributing, you agree that your contributions are licensed under the
repository license.
