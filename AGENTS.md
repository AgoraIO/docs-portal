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

## Vercel Preview Deploys & Stable Aliases

Do not use bare `npx vercel` for local previews; remote builds can fail the `legacy-redirects:check` step. Prefer the prebuilt flow used by CI:

```bash
npx vercel pull --yes --environment=preview
npx vercel build
npx vercel deploy --prebuilt --archive=tgz
```

Each deploy gets a unique `*.vercel.app` URL that does not update on the next push. When a feature or partner needs a **stable preview domain**, assign a static alias after deploy (always scope to the `agoraio` team):

```bash
npx vercel alias set https://<deployment-id>-agoraio.vercel.app <stable-name>.vercel.app --scope agoraio
```

Example for a long-lived branch preview:

```bash
npx vercel alias set https://docs-portal-4j75x931n-agoraio.vercel.app docs-portal-banner.vercel.app --scope agoraio
```

Re-run the alias command after every new deploy so the stable name keeps pointing at the latest build. Do **not** overwrite `docs-portal-mocha.vercel.app` (or `VERCEL_MAIN_PREVIEW_ALIAS`); that alias is reserved for the `main` preview.

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
