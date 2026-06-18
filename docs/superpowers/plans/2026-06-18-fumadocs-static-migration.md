# Fumadocs Static Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move docs-portal to Fumadocs/TanStack Start static deployment so Vercel no longer packages the docs graph into a >250 MB serverless function.

**Architecture:** Follow Fumadocs static deployment guidance with TanStack Start SPA mode and Vercel static output. Keep the existing `DocsShell` and Fumadocs loader semantics by generating static JSON payloads from the server loader at build time, then serving a static SPA shell without Nitro/Vercel Functions. Do not prerender the whole 2,000+ page tree in this first migration; it is too unstable for this repo and is not required to close the 250 MB serverless function limit.

**Tech Stack:** TanStack Start, Fumadocs, Vite, Nitro/Vercel, Vitest, Bun.

---

## Files

- Modify: `package.json` to make production build opt into static mode and generate payloads before `vite build`.
- Modify: `vite.config.ts` to enable TanStack Start SPA shell output in static mode and disable Nitro in that mode.
- Create: `vercel.json` to deploy `dist/client` as static output with an SPA rewrite.
- Modify: `src/routes/$locale/$tab/index.tsx` and `src/routes/$locale/$tab/$.tsx` to fetch generated payload JSON in static mode.
- Create/modify: `scripts/generate-static-docs-payload.mjs` to generate `public/__static/docs/**/*.json` from `loadDocsPagePayload`.
- Create/modify: `src/lib/docs-static-manifest.ts` and `src/lib/docs-static-manifest.test.ts` to keep payload path and fetch behavior testable.

## Tasks

### Task 1: Lock Official Static Build Contract

- [x] **Step 1: Add static mode to the production build**

Run: `bun run build`

Expected after this task: build runs with `TSS_SPA_STATIC_EXPERIMENT=true` and `VITE_TSS_SPA_STATIC_EXPERIMENT=true`.

- [x] **Step 2: Configure TanStack Start SPA prerender**

Expected `vite.config.ts` behavior:

```ts
tanstackStart({
  pages: isSpaStaticExperiment ? [] : prerenderPages,
  spa: {
    enabled: true,
    prerender: {
      crawlLinks: false,
      outputPath: '/index.html',
    },
  },
});
```

Static mode must not include `nitro({ preset: 'vercel' })`; otherwise Vercel packages the docs graph into `__server.func` and the 250 MB limit still applies.

### Task 2: Replace Runtime Docs Payload With Static Payload

- [x] **Step 1: Generate payload JSON**

Run: `bun run docs:static-payload`

Expected: `public/__static/docs/en/.../*.json` and `public/__static/docs/zh-CN/.../*.json` exist.

- [x] **Step 2: Load static payloads in docs routes**

Expected: when `VITE_TSS_SPA_STATIC_EXPERIMENT=true`, docs route loaders call `readStaticDocsPayload`; otherwise they keep the existing server functions.

- [x] **Step 3: Verify focused tests**

Run: `bun x vitest run src/lib/docs-static-manifest.test.ts src/lib/docs-route-preload.test.ts`

Expected: both test files pass.

### Task 3: Static Vercel Output

- [x] **Step 1: Add static Vercel routing**

Expected `vercel.json` behavior:

```json
{
  "buildCommand": "bun run build",
  "outputDirectory": "dist/client",
  "framework": null,
  "rewrites": [
    {
      "source": "/((?!_build/|assets/|__static/|images/|openapi/|favicon.ico|robots.txt|sitemap.xml).*)",
      "destination": "/index.html"
    }
  ]
}
```

- [x] **Step 2: Defer `/api/search` migration**

Recommended answer: keep the existing dynamic handler in source but do not rely on it for static deployment. Fumadocs `staticGET()` exported a search payload large enough to crash this repo's build with `RangeError: Invalid string length`, so static search needs a separate split-index follow-up.

### Task 4: Build And Vercel-Shape Verification

- [x] **Step 1: Run production build**

Run:

```bash
NODE_OPTIONS='--max-old-space-size=8192' bun run build
```

Actual: build completes, generates 2298 static payload files, and prerenders only `/`.

- [x] **Step 2: Build Vercel output locally**

Run:

```bash
NODE_OPTIONS='--max-old-space-size=8192' vercel build
```

Actual: Vercel Build Output API succeeds and `.vercel/output/functions` does not exist.

- [x] **Step 3: Check serverless function size**

Run:

```bash
test ! -d .vercel/output/functions
```

Actual: no functions directory exists, so the Vercel 250 MB unzipped serverless function limit is no longer in the deployment path.

- [x] **Step 4: Deploy prebuilt output with Vercel CLI**

Run:

```bash
vercel deploy --prebuilt --archive=tgz
```

Actual: deploy succeeds as `dpl_3rBUFKT1pUaeXGbmFoJYouJJHLkH`, alias `https://perf-optimization.vercel.app`. Plain `vercel deploy --prebuilt` hit Vercel upload request limits; `--archive=tgz` is required for this large static output.
