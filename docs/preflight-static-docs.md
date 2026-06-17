# Static Docs Preflight

This file is the release-preflight checklist and risk register for the current static-docs bundle-reduction branch.

It exists because the branch now relies on a custom production build contract:

- `bun run build:raw`
  - syncs OpenAPI assets
  - runs the plain Vite production build
- `bun run build`
  - runs `scripts/build-static-docs.mjs`
  - produces the final `.vercel/output` artifact expected by Vercel

Read this together with [docs/build-output.md](/Users/czhen/Documents/GitHub/Shengwang-Community/docs-portal/docs/build-output.md).

## Status

- Goal
  - Keep Vercel-hostable output while shrinking the normal docs server/runtime bundle.
- Current delivery state
  - OpenAPI-generated static assets are part of the production contract.
  - Ordinary docs mostly use slim prerender output plus a second-pass HTML patch flow.
  - A tactical exception list now exists for known heavyweight pages that do not reliably produce stable patched static HTML.

## Tactical Fix Recorded

The current branch contains a tactical fix for a CI failure in `scripts/build-static-docs.mjs`.

Problem observed:

- Some heavyweight MDX pages failed the `verifyPatchedStaticHtml` check in GitHub Actions.
- The failing pages were expected to have their slim-build skeleton replaced by full prerendered docs-body HTML.
- In practice, a subset of those pages did not reliably produce a stable body that the patch step could reuse.

Observed symptoms:

- Some generated `.html` files for heavyweight docs pages contained `\0` bytes inside serialized route-state/script payloads.
- Some pages fell back to shell-only output instead of a stable `<div class="docs-body">...</div>` block.
- This made the current second-pass HTML patch contract unreliable for those pages.

Current tactical response:

- The affected pages are explicitly kept on the hydrated-client-content path.
- Static HTML verification now treats those pages as allowed exceptions instead of failing the entire build.

This restores CI and keeps Vercel deployability, but it is not the final architecture.

## Known Exception Pages

These pages are currently treated as known heavyweight hydration exceptions:

- `en/realtime-media/video/build/ai-noise-suppression.mdx`
- `en/realtime-media/video/build/in-call-quality-monitoring.mdx`
- `en/realtime-media/video/build/play-media.mdx`
- `en/realtime-media/video/build/preload-channels.mdx`
- `en/realtime-media/video/build/receive-notifications.mdx`
- `en/realtime-media/video/build/screen-sharing.mdx`
- `en/realtime-media/video/build/use-an-extension.mdx`
- `en/realtime-media/video/build/voice-activity-detection.mdx`
- `en/realtime-media/cloud-recording/reference/common-errors.md`
- `en/realtime-media/im/agora-console/content-moderation-microsoft.md`

If these pages move, rename, split, or get IA remaps, update:

- `src/components/docs-shell/docs-content-hydration.ts`
- `scripts/build-static-docs.mjs`
- related tests

## Build Contract Checks

Before merging or releasing, verify:

- `bun run build`
  - completes successfully
  - produces `.vercel/output`
- `bunx vitest run scripts/build-static-docs.test.ts src/components/docs-shell/docs-content-hydration.test.ts`
  - passes
- `bun run types:check`
  - passes, or any unrelated existing failures are explicitly documented
- `public/generated/openapi`
  - is produced when runtime routes still read `/generated/openapi/...`
- `public/fonts/misans/*`
  - remains present
- `.env.local`
  - is not committed
- `tmp/`
  - is not committed

## Vercel Preflight

Before treating a deploy as good, verify all of the following from the preview deployment:

- Build succeeds on Vercel using the repository `build` command.
- The preview serves pages from the generated `.vercel/output`.
- Known heavyweight exception pages render usable content after hydration.
- Search/API/LLM routes that depend on `/generated/openapi/...` still work.
- No runtime filesystem assumptions were reintroduced for docs/OpenAPI inputs.

Recommended spot checks:

- one ordinary docs page that should be patched static HTML
- one AI docs page
- one OpenAPI page
- one known heavyweight hydration-exception page
- one `llms` or generated Markdown export route

## Risks We Know About

### 1. Patched static HTML is not a universal contract

The current `build-static-docs` strategy assumes:

- slim build produces shell plus skeleton
- full build produces reusable docs body
- second-pass script can patch the body back into slim output

That assumption is not true for every MDX page.

Impact:

- More large pages can break CI again.
- New `PlatformStructured`-heavy pages are especially likely to stress this boundary.

### 2. Heavy MDX pages can regress into hydration-only behavior

Some pages are now explicitly hydration exceptions.

Impact:

- They may remain deployable while still losing the "fully static body in shipped HTML" property.
- Regressions can hide behind successful builds unless preview behavior is checked.

### 3. Serialized route state in HTML is currently suspicious

At least some heavyweight pages produced generated HTML containing `\0` bytes in serialized route-state/script output during local investigation.

Impact:

- This is a sign that the current full-prerender output is not a clean static-body source for all pages.
- Even when CI is green, this area is still structurally fragile.

### 4. OpenAPI generated output remains part of deployability

`public/generated/openapi` is not disposable local cache while these consumers still exist:

- `src/routes/api/search.ts`
- `src/routes/llms-full[.]txt.ts`
- `src/routes/llms[.]txt.ts`
- `src/routes/llms[.]mdx.docs.$.ts`
- OpenAPI payload readers under `src/lib/openapi/**`

Impact:

- Any build simplification that removes this generation step can break Vercel deploys or runtime routes.

### 5. Fonts are part of the contract

`MiSans` was accidentally removed once and had to be restored.

Impact:

- Future "bundle cleanup" work must not treat `public/fonts/misans/*` or the `src/styles/app.css` font-face setup as disposable.

### 6. IA/path changes can invalidate exception lists silently

The tactical fix uses explicit content-path and output-path allowlists.

Impact:

- If navigation/content paths change, the exception list can drift out of sync and CI may fail again.

## Release Questions To Answer

Before calling this branch release-ready, answer these explicitly:

- Does Vercel preview build green on the current branch?
- Are the known heavyweight exception pages acceptable as hydration pages for now?
- Is the current deploy speed acceptable with the two-pass build?
- Are we comfortable shipping with explicit exception allowlists?

If any answer is "no", do not treat the tactical fix as the end state.

## Follow-up Work That Still Matters

### Near-term follow-up

- Keep the tactical exception list minimal and intentional.
- Add more preview verification around heavyweight docs pages.
- Document any new exceptions immediately when discovered.

### Required architectural follow-up

This branch still needs a cleaner answer for static docs:

- either define a narrower supported static-body scope and permanently exclude heavyweight interactive docs
- or replace the HTML-regex patch approach with a more explicit build artifact contract for docs bodies/payloads

The second option is the more correct long-term direction.

## Special Note For Platform Content

`PlatformStructured` is expected to appear more often.

Treat that as a pressure multiplier on the current approach:

- more platform-grouped content means larger and more stateful MDX pages
- larger and more stateful pages make the current second-pass body-patching flow less trustworthy

Any future rollout of more `PlatformStructured` content should include:

- explicit preview checks on representative heavy pages
- a re-check of whether the page should stay static or move to hydration
- a revisit of the long-term architecture if exception lists keep growing

## Owner Notes

If someone touches any of these areas, they should update this file in the same PR:

- `scripts/build-static-docs.mjs`
- `src/components/docs-shell/docs-content-hydration.ts`
- `public/generated/openapi` build behavior
- Vercel build contract
- exception-page lists
