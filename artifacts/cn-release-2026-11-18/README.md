# Chinese release integration verification

Application commit `54dc682e42d26f5a1d6211188485cf0c717ae409`. The English reference was `0b67002a116bcfb08ac27a783af35c0c51dec7ba` on `main`. The Chinese reference was `d0d326d6b64665512bff395321cca9c4c0b89ec5` on `codex/cn-newdoc-html-api-migration`. Both references are ancestors of the application commit. Packaging commit `d99ab6f5a` additionally excludes generated locale-root files from Docker inputs. A scratch-image build verified that the stale aliases are excluded and the public robots file is retained. Packaging commit `1550da6e0` also keeps nginx directory redirects relative to the public host. Both regional runtimes were exercised with this configuration. The evidence commit contains only files in this directory.

## What changed

The integration resolves all 105 initial conflicts, including shared navigation, search, redirects, MDX, OpenAPI, package versions, and build configuration. Both regional source-content trees match their respective input commits byte for byte. Exact paths and Git blob comparisons are available in the [conflict list](conflicted-files.txt), the [integration inventory](shared-surface-inventory.csv) and the [test results by area](shared-tests.csv).

## Built sites

| Check | English · compared with main | Chinese · compared with migration branch |
| --- | --- | --- |
| Generated HTML paths | 2,126, same set | 7,256, same set |
| Per-page Markdown | 2,125 byte-identical files | 7,282 byte-identical files |
| Article text and fragment IDs | 0 changes after whitespace normalization, 0 pages with lost stable IDs | 0 changes after whitespace normalization, 0 pages with lost stable IDs |
| Sitemap | 2,114 URLs on docs.agora.io | 7,228 URLs on docs.shengwang.cn |
| Full API browser sweep | 442 pages, 3,414 states, 0 route errors | 5,287 pages, 52,174 states, 0 route errors |
| Shared UI interactions | 9 of 9 passed | 9 of 9 passed |

Compared titles, all article headings, article and sidebar link targets, image sources, canonical and Open Graph URLs, robots, and header, sidebar and button text. The regional sitemaps retain the same paths. The CN canonical origin and robots sitemap now point to `docs.shengwang.cn`. The English full Markdown bundle contains the same lines in a different order. The English API renderer adds 5,475 compatibility anchors. Whitespace differs in 82 English API articles. The mobile header has minor spacing and banner line-wrap differences in the paired capture.

## Tests and remaining findings

The [site comparison](screenshots/checks-sites.jpg), [test and QA summary](screenshots/checks-tests.jpg) and [search results](screenshots/checks-search.jpg) are screenshots of the recorded checks.

- TypeScript passed. Biome completed with 75 warnings. Vitest passed 7,134 tests, failed 8 and skipped 23. All eight failing assertions also failed on the English reference (1,991 passed). Their full names are in the [machine-readable results](verification.json).
- The English API gate remains **FAIL** with 69 page-overflow findings and 84 table findings. The same browser harness on the English reference before #1445 found all of these on the same routes, viewports and themes. The reference ran 3,400 states. #1445 updates a separate Cloud Recording guide, included in the full-site content comparison. One example is captured [before](screenshots/english-api-finding-before.jpg) and [after](screenshots/english-api-finding-after.jpg).
- The Chinese API gate returned **PASS**. Source QA retained one allowlisted duplicate heading and found no new violations.
- The built Chinese link audit found 5 occurrences of the existing `#fastlogger` missing fragment in Fastboard Android release notes. The same target and referring page reproduce on the Chinese reference. The full-route source and rendered link comparisons cover the subsequent English-only UI fixes and the final CN routing changes. External sites and authenticated destinations are outside the built-link audit.
- All 1,775 previous redirect rules kept their destinations and status codes. All 90 original advanced routing rules were retained.

## Search and delivery checks

- Exported 59,797 sections from 2,744 CN pages and loaded them into an isolated local Meilisearch index. Scope includes the repository's navigation and product exclusions. The coverage audit found zero invalid indexed anchors and zero unexpected eligible pages without records. It also reported 167 duplicate IDs across platform panels.
- The 30 historical keywords returned HTTP 200 for all four categories (120 of 120 requests). 16 query/category combinations returned zero results. The [query grid](search-http-grid.json) records outcome and first result. Ranking and production relevance require separate acceptance.
- Stock nginx served the CN clean HTML and Markdown URLs, returned 404 for an unknown route and kept English routing isolated. All 2,946 distinct public search URL targets matched the corresponding HTML in the local build. The CN Node service was built separately and reported the application revision at `/api/health`. Production needs same-origin `/api/*` forwarding to that service.
- The MCP checks cover both setup guides. Markdown, sitemap and LLM exports were checked locally. Production domain, images, search, external MCP calls and KB ingestion remain release checks.
- On a reused checkout, a previous English build can leave its generated root `public/en.md` in a later CN output. The standalone CN reference omitted it. The Docker context now excludes both locale-root files and regenerates the active region. Use a clean checkout when running the non-container static build.

## Browser screenshots

Each of the first seven rows contains side-by-side captures. The baseline is on the left and the integrated site on the right. Desktop captures use 1440 × 1000 and mobile captures use 390 × 844. Other rows show the integrated site after the listed interaction.

| Surface | English | Chinese |
| --- | --- | --- |
| Home · desktop | [View](screenshots/en-home-desktop.jpg) | [View](screenshots/cn-home-desktop.jpg) |
| Home · mobile | [View](screenshots/en-home-mobile.jpg) | [View](screenshots/cn-home-mobile.jpg) |
| SDK catalog | [View](screenshots/en-sdks-desktop.jpg) | [View](screenshots/cn-sdks-desktop.jpg) |
| RTC guide | [View](screenshots/en-guide-desktop.jpg) | [View](screenshots/cn-guide-desktop.jpg) |
| OpenAPI · desktop | [View](screenshots/en-openapi-desktop.jpg) | [View](screenshots/cn-openapi-desktop.jpg) |
| OpenAPI · mobile | [View](screenshots/en-openapi-mobile.jpg) | [View](screenshots/cn-openapi-mobile.jpg) |
| Search dialog | [View](screenshots/en-search.jpg) | [View](screenshots/cn-search.jpg) |
| Search query and results | [View](screenshots/en-live-search.jpg) | [View](screenshots/cn-live-search.jpg) |
| FAQ filter | [View](screenshots/en-faq-filter.jpg) | [View](screenshots/cn-faq-filter.jpg) |
| Platform switch | [View](screenshots/en-platform-switch.jpg) | [View](screenshots/cn-platform-switch.jpg) |
| OpenAPI code tab | [View](screenshots/en-openapi-response.jpg) | [View](screenshots/cn-openapi-response.jpg) |
| Schema expansion | [View](screenshots/en-schema-expand.jpg) | [View](screenshots/cn-schema-expand.jpg) |
| Mobile navigation | [View](screenshots/en-mobile-menu.jpg) | [View](screenshots/cn-mobile-menu.jpg) |
| Copy Markdown | [View](screenshots/en-copy.jpg) | [View](screenshots/cn-copy.jpg) |
| Dark theme | [View](screenshots/en-theme.jpg) | [View](screenshots/cn-theme.jpg) |
| MCP setup guide | [View](screenshots/en-mcp-guide.jpg) | [View](screenshots/cn-mcp-guide.jpg) |

## CDN image publication — November 18

Uploaded 16 missing images (2,318,954 bytes) through OSS Browser 2 after checking each target object. All 16 public CDN downloads returned HTTP 200 with the expected image content type and matched the source SHA-256. Reused the existing Android QR image after verifying its SHA-256.

Replaced 48 local image references in 10 Chinese documents. The [completed mapping](cdn-upload-paths.csv) includes the 16 uploads and the reused image. The [download verification](cdn-verification.json) records the 16 uploaded objects.

Validation passed: URL substitutions reverse exactly to the previous document contents, reference counts match the supplied manifest, `bun run types:check`, and `git diff --check`. Final production page rendering remains part of release acceptance.
