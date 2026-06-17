# Build Output Contract

This repo does not currently use a plain `vite build` as its top-level production contract.

For release checks, known risks, and the current tactical exception list, also read [docs/preflight-static-docs.md](/Users/czhen/Documents/GitHub/Shengwang-Community/docs-portal/docs/preflight-static-docs.md).

## Build entrypoints

- `bun run build:raw`
  - Runs `bun run openapi:sync`
  - Then runs `vite build`
- `bun run build`
  - Runs `node scripts/build-static-docs.mjs`
  - This is the production build entry used to produce `.vercel/output`

## What each output directory means

- `public/openapi`
  - Synced input assets copied from `content/openapi`
  - Produced by `scripts/sync-openapi-assets.mjs`
- `public/generated/openapi`
  - Generated static exports consumed by runtime routes and components
  - Produced by the OpenAPI static-export pipeline in this branch
  - Includes:
    - `search-documents.json`
    - `markdown-pages.json`
    - `page-payloads/**`
    - `llms-mdx-docs/**`
- `.vercel/output`
  - Final deploy artifact inspected for Vercel compatibility and bundle size

## Why `public/generated/openapi` exists

This directory is not hand-authored docs content. It is generated build output used to move parts of the OpenAPI experience away from heavier runtime computation.

Current consumers include:

- `src/routes/api/search.ts`
- `src/routes/llms-full[.]txt.ts`
- `src/routes/llms[.]txt.ts`
- `src/routes/llms[.]mdx.docs.$.ts`
- OpenAPI page payload readers under `src/lib/openapi/**`

If these routes or helpers request `/generated/openapi/...`, the production build must generate matching files.

## Vercel implication

Vercel uses the repo's configured build command. In the current branch, that means Vercel will follow `bun run build`, not just `vite build`.

So:

- if runtime code depends on `/generated/openapi/...`, Vercel must run a build flow that produces those files
- if the project should stop depending on generated OpenAPI static exports, remove the runtime consumers as well as the generator

Do not treat `public/generated/openapi` as disposable local cache unless the consuming runtime code has already been removed.

## Static-docs build flow

`scripts/build-static-docs.mjs` currently does more than a single build:

1. runs a slim build
2. runs a full build
3. restores the slim output
4. patches static docs HTML with fuller prerendered body content
5. prunes or optimizes selected static assets

When investigating Vercel regressions or output-size changes, inspect the final `.vercel/output` on disk rather than assuming the first build pass reflects the shipped artifact.
