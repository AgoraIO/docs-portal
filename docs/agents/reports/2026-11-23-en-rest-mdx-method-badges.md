# English REST Markdown/MDX HTTP method badges

## Expected behavior

Every documented REST operation has its existing HTTP method badge in desktop and mobile navigation, including operations authored inside multi-endpoint MD/MDX articles. Supporting overview, authentication, status-code and API-limit topics retain ordinary labels. Existing OpenAPI methods remain authoritative.

## Content contract

A single-operation page declares `httpMethod: POST` in frontmatter. A multi-operation article declares its methods using existing TOC fragments, without the `#`:

```yaml
httpMethods:
  create-api: POST
  delete-api: DELETE
  list-api: GET
  update-api: PATCH
```

The schema accepts uppercase `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS` and `TRACE`. Values come from the documented Method/HTTP request declaration. A method in an authentication example does not make that supporting topic an operation. Preserve exact generated fragment IDs, including suffixes for repeated platform headings, when changing titles.

## Implementation

- `source.config.ts` validates and retains both fields. Metadata is authored content; methods are not inferred from prose, titles or the first cURL command at runtime.
- `loadDocsPagePayload` applies metadata after English product REST menus have been assembled. It resolves only the TOCs needed by the current sidebar and caches them per source object/platform.
- `withDocsHttpMethods` creates collapsible article groups containing an Overview and the explicitly mapped operations. Existing article outline links are reused without duplicates. Unresolved fragments are not invented. OpenAPI metadata and external links keep their existing behavior.
- For platform articles, the current supported platform is used. A general product menu selects the first platform with documented operations. Logical URLs retain the article identity for selection and product restoration, while `href` uses the canonical platform route and exact fragment. This links directly to the selected platform and fragment without relying on a compatibility `?platform=` redirect. The sidebar anchor respects that internal `href` override.
- Deep links to retained references absent from the global menu receive an article-local operation menu. This does not add retired products to the catalog or global navigation.
- Existing sidebar components and HTTP method colors render all labels. Static payloads use the same loader. No new renderer skin, dependency, endpoint route or API body transformation is introduced.

## Complete coverage inventory

The executable coverage check reads HTTP declarations independently of frontmatter, requires a mapping for each operation section, loads the real page payloads, and checks every method/fragment against the resulting sidebar. It also checks every published English OpenAPI endpoint. Platform variants are checked separately.

- **70 live authored reference pages**, with **408 operation destinations** including native platform variants.
- **86 generated OpenAPI endpoint pages**, retaining their existing method labels.
- **494 method-labelled destinations** in total, with **0 missing** in the final coverage export.
- The retained Cloud Recording condensed source redirects to the covered OpenAPI reference.

| Authored reference family | Live pages | Operation destinations |
| --- | ---: | ---: |
| agora-analytics | 1 | 14 |
| broadcast-streaming | 20 | 49 |
| console | 1 | 8 |
| extensions-marketplace | 2 | 7 |
| flexible-classroom | 1 | 17 |
| im | 24 | 263 |
| iot | 1 | 5 |
| marketplace | 2 | 7 |
| media-pull | 1 | 4 |
| media-push | 1 | 5 |
| speech-to-text | 10 | 10 |
| whiteboard | 6 | 19 |

The inventory includes the canonical API reference tree and live standalone REST references for Marketplace provisioning/usage, Whiteboard token generation and legacy IoT channel management. Guide examples, SDK functions, authentication examples and Console configuration procedures are supporting content rather than REST operation definitions.

## Validation and review

`src/lib/rest-method-coverage.test.ts` checks page-level metadata, per-operation declaration coverage, actual sidebar destinations, all six native Chat platform variants and all 86 OpenAPI endpoints. Unit tests cover nested links, platform destinations, product context, deduplication, OpenAPI precedence, external links and absent fragments. The Console rail test now checks its Overview plus eight endpoint entries.

All 55 document bodies changed in this follow-up compare byte-for-byte with the first PR commit after excluding frontmatter. Source QA reports 0 new defects and 0 obsolete debt allowances. Shared API body renderers/styles and the API QA shared-file manifest remain unchanged; this is an English navigation/content integration change.

The original full run at main `7b318fe2a` had 15 independently reproduced failures: seven OpenAPI component assertions, seven redirect-script tests under Node 22.16, and one content regression assertion. Updated full-suite results and command logs are retained locally. **Full-suite checkpoint at `04946fa1c`: 7,408 passed, the same 15 baseline failures, 24 skipped.** The subsequent callback-scope correction passed 10 focused tests plus type checks and lint. Method coverage is not a full semantic audit or a certification of the entire regional rendering matrix.

Manual smoke covers Chat desktop, native-platform links and hashes, Whiteboard mobile, Console, existing OpenAPI, and the local HTML review explorer. Independent human acceptance is pending review of this PR/preview; no independent reader's approval is claimed.

## Non-REST scope audit

SDK reference pages, ordinary quickstarts and pure overview/authentication topics were not given method metadata. Five changed source files live outside the canonical API-reference folder: Marketplace provisioning/usage, Whiteboard REST token generation, IoT REST channel management and a retained Cloud Recording REST reference. Their content describes HTTP interfaces; the Recording entry redirects to OpenAPI.

Two callback requirement sections in Broadcast Streaming had been included because their examples contain HTTP request lines. Those are requests to customer callback servers, so their `httpMethods` entries were removed. Coverage tests now explicitly exclude callback requirement examples and verify that SDK, authentication and introductory pages remain unlabelled. The current inventory is 494 operation destinations, rather than the 496 reported before this correction.

## Existing source discrepancies

Badges follow explicit request declarations. Existing examples disagree with those declarations in four retained sections: Flexible Classroom Get recording list (GET versus PATCH), Chat room Remove custom attributes (DELETE versus POST), Chat room Retrieving muted members (GET versus DELETE), and Chat room Modifying the announcement (POST versus GET). Their body text is preserved for API-owner review; this change does not silently resolve those semantic discrepancies.

## Local review

Start the app at `http://localhost:3100`. The local-only HTML explorer at `http://localhost:3102/review.html` shows the complete inventory, first-PR versus current method labels, document/platform/method filters, and a live embedded document. Its data comes from the actual coverage test export. Screenshots, HTML and logs stay under ignored `.agent/artifacts/en-rest-mdx-method-badges/`.
