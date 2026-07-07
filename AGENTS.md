# Repository Guidelines

## Project Structure & Module Organization

This is a TanStack Start documentation portal built with Fumadocs, React, Vite, and local shadcn/ui components. Route files live in `src/routes`, shared app logic in `src/lib`, UI components in `src/components`, and global styles in `src/styles/app.css`. Tests are colocated with source files as `*.test.ts` or `*.test.tsx`; shared test setup is in `src/test/setup.ts`.

Documentation content is the source of truth under `content/docs/{en,zh-CN}`. Top-level content folders map to header tabs, and each section uses `meta.json` for navigation. Static assets live in `public`; OpenAPI sources are maintained in `content/openapi` and synced to `public/openapi`.

For content syntax, follow `docs/agents/markdown-authoring-standard.md`. It is the minimum contract for callout fences, code tabs, platform variants, list continuations, images, and tables.

## Build, Test, and Development Commands

- `bun run dev` starts the local Vite dev server on port 3000.
- `bun run test` runs the Vitest suite with `happy-dom`.
- `bun run types:check` regenerates Fumadocs output and runs `tsc --noEmit`.
- `bun run lint` runs Biome checks on config and `src`.
- `bun run format` formats files with Biome.
- `bun run openapi:sync` copies maintained OpenAPI assets into `public/openapi`.
- `bun run build` syncs OpenAPI assets and creates the production build.

## Coding Style & Naming Conventions

Use TypeScript, React function components, and ESM imports. Biome enforces 2-space indentation and single quotes for JavaScript and TypeScript. Prefer existing local primitives in `src/components/ui` and helpers in `src/lib` before adding new abstractions. Keep generated files such as `src/routeTree.gen.ts` out of manual edits unless route generation requires it.

## Testing Guidelines

Use Vitest for unit and component tests. Name tests after the module they cover, for example `src/lib/docs-routing.test.ts` or `src/components/docs-shell/DocsShell.test.tsx`. Add focused tests for routing, MDX rendering, OpenAPI parsing, i18n behavior, and docs-shell interactions when touching those areas. Run `bun run test` and `bun run types:check` before handing off substantial changes.

## Commit & Pull Request Guidelines

Recent history uses short, direct subjects such as `feat: openAPI example`, `remove best practice`, and `update (#23)`. Keep commits scoped to one change and use a concise imperative summary; use a `feat:` prefix for new user-visible functionality. PRs should describe the changed docs or behavior, link relevant issues, list verification commands, and include screenshots for visible UI or docs-shell changes.

## Security & Configuration Tips

Do not commit secrets, tokens, or private service credentials. Keep environment-specific configuration outside tracked content. For OpenAPI work, avoid runtime filesystem reads from deployment functions; use the existing bundled source-text pattern in `src/lib/openapi/source-text.server.ts`.

## Agent skills

### Issue tracker

Issues and PRDs are tracked in GitHub Issues for `AgoraIO/docs-portal` (external PRs are not a triage surface). See `docs/agents/issue-tracker.md`.

### Triage labels

Triage uses the default five-label vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, and `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

This is a single-context repo with root `CONTEXT.md` and optional ADRs under `docs/adr/`. See `docs/agents/domain.md`.

### Markdown authoring

Docs content uses the minimum Markdown/Fumadocs syntax standard in `docs/agents/markdown-authoring-standard.md`. Check it before editing or migrating `content/docs/**`.

### OpenAPI migration

RESTful API YAML migration follows `docs/openapi-migration-playbook.md`. Check it before moving OpenAPI sources into `content/openapi/**` or exposing generated endpoint pages in the docs site.
