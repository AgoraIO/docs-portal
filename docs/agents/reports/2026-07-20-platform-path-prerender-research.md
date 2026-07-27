# Platform path prerender research

Date: 2026-07-20
Scope: Keep existing platform path URLs such as `/en/api-reference/api-ref/uikit-sdk/android`, while making their initial HTML readable without JavaScript.

## Conclusion

The proposed direction is technically sound. TanStack Start accepts explicit dynamic-path instances in its `pages` prerender configuration and renders them through the normal route loader, so platform paths can receive platform-specific loader state and SSR HTML without changing their URLs.

There is no framework or Vercel blocker. The implementation should:

1. Generate one published-route manifest before the Vite build, containing canonical routes and their supported platform view routes.
2. Feed every published route URL into TanStack Start's explicit `pages` list.
3. Keep each platform view canonical to its parent, but advertise its own platform Markdown URL.
4. Reuse the existing canonical static payload fallback during SSR instead of generating a duplicate JSON payload for every platform view.

The remaining risk is build scale, not correctness. A source scan found 291 English platform pages and 1,952 unique platform views. Expanding all of them would increase English HTML routes from roughly 1,135 to roughly 3,087, about 2.7 times the current route count. A focused build should therefore be the first integration gate, followed by one measured full Vercel preview build.

## Findings

### 1. Explicit platform paths can be prerendered with correct loader data

TanStack Start officially supports explicit entries in `tanstackStart({ pages: [{ path }] })`, including concrete instances of dynamic routes. Its documentation states that dynamic routes are excluded only from *automatic* discovery; they can still be prerendered when supplied or discovered through links. The output is static HTML at the configured path. [TanStack Start: Static Prerendering](https://github.com/TanStack/router/blob/main/docs/start/framework/react/guide/static-prerendering.md)

The portal already supplies an explicit page list and disables link crawling, so adding concrete platform paths to that list is the intended mechanism: [`vite.config.ts`](../../../vite.config.ts#L22-L63).

The route loader already resolves platform path suffixes correctly:

- When no physical page exists for the child path, `loadDocsPagePayload()` delegates to `resolvePlatformRoutePage()`: [`docs-page.server.ts`](../../../src/lib/docs-page.server.ts#L261-L293).
- The resolver validates that the final segment is a known platform and that the parent page actually contains that platform: [`platforms/route.ts`](../../../src/lib/platforms/route.ts#L23-L67).
- The resulting payload sets `initialPlatform` and uses the platform-specific Markdown URL: [`docs-page.server.ts`](../../../src/lib/docs-page.server.ts#L354-L423), [`docs-page.server.ts`](../../../src/lib/docs-page.server.ts#L444-L468).
- Existing tests confirm that Fastboard Android and iOS paths resolve without redirect, select the requested platform, and expose `/platform.md`: [`api-reference-fastboard-platform.test.ts`](../../../src/lib/api-reference-fastboard-platform.test.ts#L4-L35).

For the static deployment, the route loader uses `resolvePlatformStaticDocsPayload()`: [`$locale/$tab/$.tsx`](../../../src/routes/$locale/$tab/$.tsx#L42-L84). That helper already falls back from a missing child payload to the canonical parent payload, validates the platform, sets `initialPlatform`, and rewrites `markdownUrl`: [`docs-static-manifest.ts`](../../../src/lib/docs-static-manifest.ts#L120-L180). Its behavior is covered by focused tests: [`docs-static-manifest.test.ts`](../../../src/lib/docs-static-manifest.test.ts#L125-L173).

Therefore an explicit `/uikit-sdk/android` prerender request will execute the existing loader path and can produce platform-selected SSR HTML. No query parameter or redirect is required.

### 2. A unified manifest can be generated before Vite evaluates its config

The production pipeline is ordered as:

```text
docs:static-payload -> build:app:static -> build:route-html
```

See [`package.json`](../../../package.json#L9-L14). The payload step already bundles the Fumadocs source with Vite, can call `getPagePlatformKeys()`, and runs before the separate Vite application build: [`generate-static-docs-payload.mjs`](../../../scripts/generate-static-docs-payload.mjs#L42-L113), [`source.server.ts`](../../../src/lib/source.server.ts#L178-L197).

It is therefore feasible for that step to write an ignored generated manifest such as `public/__static/docs-routes.json`, and for `vite.config.ts` to read it synchronously during the following application build. This also gives payload generation, prerender selection, and static route HTML one route model instead of independent path reconstruction.

The manifest should distinguish resource identity from rendered view:

```ts
type PublishedDocsRoute = {
  url: string;
  canonicalPath: string;
  markdownPath: string;
  platform?: PlatformKey;
};
```

For example:

```json
{
  "url": "/en/api-reference/api-ref/uikit-sdk/android",
  "canonicalPath": "/en/api-reference/api-ref/uikit-sdk",
  "markdownPath": "/en/api-reference/api-ref/uikit-sdk/android.md",
  "platform": "android"
}
```

One practical constraint is that `public/__static` is ignored: [`.gitignore`](../../../.gitignore#L17). Directly invoking `build:app:static` from a clean checkout cannot depend on a committed manifest. The normal `bun run build` order is safe; the lower-level command should either fail clearly when the manifest is absent or fall back only for intentional development use.

### 3. Canonical and Markdown alternate must be separate metadata fields

The intended metadata for a platform view is:

```html
<link rel="canonical" href="https://docs.agora.io/en/api-reference/api-ref/uikit-sdk">
<link rel="alternate" type="text/markdown" href="https://docs.agora.io/en/api-reference/api-ref/uikit-sdk/android.md">
```

This matches the repository's ADR: canonical HTML remains the primary resource while per-page Markdown is a complementary machine-readable representation: [`0001-static-prerendered-docs-without-runtime-server.md`](../../../docs/adr/0001-static-prerendered-docs-without-runtime-server.md#L1-L5).

The current payload already contains both values in different fields: `activePath` is the parent canonical path, while `markdownUrl` is platform-specific: [`docs-page.server.ts`](../../../src/lib/docs-page.server.ts#L444-L468). The SEO API must preserve that distinction. Deriving the alternate mechanically as `canonical + '.md'` loses the platform selection.

The static SEO manifest used by `build:route-html` also needs `canonicalPath` and `markdownPath`; otherwise its postprocessing will overwrite the correct route-rendered head. The route HTML worker deliberately reapplies metadata after prerendering: [`generate-static-route-html.worker.ts`](../../../scripts/generate-static-route-html.worker.ts#L13-L39), [`static-route-html.ts`](../../../src/lib/static-route-html.ts#L3-L25).

Platform view URLs should not be added to `sitemap.xml` or `llms.txt` if the parent remains canonical. Their direct HTML remains readable, while discovery stays deduplicated around canonical resources and their Markdown alternates.

### 4. Build cost and payload strategy

Repository measurements from `content/docs/en`:

| Item | Count |
| --- | ---: |
| Markdown/MDX files | 1,135 |
| Files containing structured platform content | 291 |
| Unique platform views across those files | 1,952 |
| Approximate canonical + platform HTML routes | 3,087 |

These counts come from the current `origin/main` content at commit `92be1fe82dd53b9535e192f78166e8211113758b`. They are an upper-bound route estimate; the generated manifest remains the authoritative count because `getPagePlatformKeys()` applies the actual compiled-content rules.

Generating platform HTML has unavoidable cost because each URL must run through prerendering. Generating a full child JSON payload as well is avoidable: `resolvePlatformStaticDocsPayload()` is specifically designed to load the parent payload when the child is absent and apply platform state. Reusing that path avoids roughly 1,952 duplicate payload files and repeated `loadDocsPagePayload()` work.

This recommendation trades exact non-default platform TOCs in static JSON for the current fallback behavior, which clears a stale canonical TOC when necessary: [`docs-static-manifest.ts`](../../../src/lib/docs-static-manifest.ts#L164-L199). The article content and selected platform remain correct. If exact platform TOCs are a requirement, child payload generation can be added later and measured separately.

Vercel will serve only the contents of the configured output directory; this project publishes `dist/client`: [`vercel.json`](../../../vercel.json#L1-L4). Vercel documents that output-directory contents are served statically, so correctly emitted `.../android/index.html` files require no runtime function. [Vercel: Configuring a Build, Output Directory](https://vercel.com/docs/builds/configure-a-build#output-directory)

## Recommended verification

Do not start with a full build. Use this ladder:

1. Run the focused unit tests for published-route expansion, platform resolution, static fallback, SEO metadata, prerender selection, and route HTML validation.
2. Generate static artifacts once, then run the app build with:

   ```bash
   TSS_PRERENDER_PATHS=/en/api-reference/api-ref/uikit-sdk,/en/api-reference/api-ref/uikit-sdk/android,/en/api-reference/api-ref/uikit-sdk/ios,/en/api-reference/api-ref/uikit-sdk/web bun run build:app:static
   ```

3. Run `build:route-html` with the same environment and inspect only those four generated files.
4. Assert for each platform file:
   - non-empty `data-static-docs-body`;
   - requested platform content is initially selected;
   - canonical points to `/uikit-sdk`;
   - Markdown alternate points to `/uikit-sdk/<platform>.md`;
   - hydration keeps the path and selected platform.
5. Deploy a preview and repeat raw HTTP checks with JavaScript disabled or a crawler user agent.
6. Only after the focused proof passes, run one full preview build and record build duration, `dist/client` size, and generated `index.html` count against the current main deployment.

The existing focused selector is already tested: [`prerender-pages.test.ts`](../../../src/lib/prerender-pages.test.ts#L4-L16). The route HTML validator also rejects empty shells in production while allowing omitted pages during focused builds: [`static-route-html.ts`](../../../src/lib/static-route-html.ts#L14-L24), [`static-route-html.test.ts`](../../../src/lib/static-route-html.test.ts#L31-L88).

## Blockers

No correctness blocker was found. The only unresolved release question is whether the measured full-build time and output size remain acceptable after adding approximately 1,952 English platform HTML routes. That should be answered by one preview deployment after the focused Fastboard build passes, not by changing the URL design.

## Verification performed during research

The following focused suite passed on the current worktree:

```text
6 test files passed
31 tests passed
```

Command:

```bash
bun run test -- src/lib/api-reference-fastboard-platform.test.ts src/lib/docs-static-manifest.test.ts src/lib/prerender-content-routes.test.ts src/lib/prerender-pages.test.ts src/lib/static-seo.test.ts src/lib/static-route-html.test.ts
```
