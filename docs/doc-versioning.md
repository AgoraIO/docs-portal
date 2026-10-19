# Documentation versions

Documentation versions apply to registered groups of portal pages. They are
independent of SDK platform tabs, SDK search versions and OpenAPI `info.version`.
Existing product documentation has not been assigned new releases by this change.

## Try the mock API

Open `/en/api-reference/versioning-demo`, also linked from Reference overview
and near the top of the Reference sidebar under **API reference**. This family
is imaginary and labelled **Test current version** or **Test new version**.

1. The first visit opens v1. Open **List test widgets**, then select v2 in the
   page header. The target is `/en/api-reference/versioning-demo/v2/list-widgets`.
   Its schema uses `displayName`; v1 uses `legacyName`.
2. Open authentication and other sidebar links. Only the selected version's
   navigation appears, including **Migration** in v2 and **Legacy notes** in v1.
3. Switch versions from one of those exclusive topics. The target version's
   overview explains that the topic has no equivalent.
4. Reopen the neutral entry or refresh it. The same browser remembers the choice.
   A direct v1 link still opens v1 and does not overwrite the saved v2 choice.
5. Search for `widget`. Both releases appear with their version labels. Search
   for `widgetbaseline` or `widgetpreview` to find the corresponding release.
   Browsing preferences do not filter search results. Ordinary docs and SDK API
   search keep their existing behavior.
6. Repeat on a narrow viewport. The compact version row and **🧪 Preview** link
   remain visible above the page title without opening the mobile sidebar.
   The sidebar also offers version links directly below the API family name.

Inspect the current page's Copy/Open Markdown action and these fixed resources:

- `/en/api-reference/versioning-demo/v2/list-widgets.md`
- `/openapi/versioning-demo/v2.en.yaml`
- `/llms/doc-versions-test-api-v2.txt` — only v2 discovery links
- `/llms/doc-versions-test-api-v2-full.txt` — only v2 Markdown content
- `/llms.txt` and `/llms-full.txt` — all published versions with version labels

These resources do not depend on localStorage. Share a specific version's URL
with an AI client when it must use that release. Browser preferences are local
to the same origin; a preview deployment and production have separate storage.

## Register a real API family

1. Add a `DocVersionScope` in `src/lib/doc-versions.ts`: a stable scope ID,
   label, neutral `entryUrl`, `defaultVersion`, and version records. Each record
   owns a distinct `rootUrl` and a map from stable topic keys to relative URLs.
   Set `status: 'preview'` on prerelease docs to show the preview badge.
   The map can include anchors to map old single-page topics to new pages.
   Missing equivalents fall back to the target overview with a visible message.
2. Add the neutral entry and each version's overview/supporting Markdown pages
   under `content/docs/<locale>`. Each root needs an index page and `meta.json`
   listing its own pages. The version resolver selects that root's sidebar,
   including for nested pages and generated OpenAPI pages.
3. For generated endpoints, add separate OpenAPI sources and lane IDs per
   release in `src/lib/openapi/lanes.ts`. Keep `operationId` stable where the
   logical operation is shared. Register raw imports in
   `src/lib/openapi/source-text.server.ts`. Public YAML paths must be distinct.
4. Link product/catalog entry points to the neutral entry. Author ordinary
   within-version links against that version's URLs. Deliberate cross-version
   links should say which version they open. Existing legacy URLs can remain
   fixed to their original version; do not redirect them based on a preference.
5. Run `bun run test`, `bun run types:check`, `bun run lint`, and
   `bun run build`. Verify HTML, payload, sidebar, Markdown and OpenAPI assets
   for both versions, then test persistence and search in a browser.

The neutral entry renders real version links before JavaScript runs. Once
hydrated, it replaces that history entry with the stored choice, or the
configured default. Explicit version pages derive their content and navigation
from their URL. Only an intentional version selection writes the preference.

## Search and publication

Search keeps the existing Algolia and local search flows. Both releases are
indexed at distinct URLs and remain searchable together. The dialog adds the
release label from each result's URL, including recently viewed pages. It does
not add version filters, search scope controls or preview provider overrides.
SDK version labels keep their existing meaning.

New content reaches Algolia through the existing production `search:sync` step.
PR previews retain the existing search configuration and do not sync unpublished
content into the production index. To test mock search before publication, run
locally without Algolia credentials so the existing local search uses the branch's
built documents. No remote search index needs to be changed for that test.

LLM discovery groups are separated by family and release. Every version page's
Markdown identifies its release and links to its release index; each index
offers a release-specific bulk export. The global bulk export keeps all public
versions. Each substantive release retains its own canonical URL and sitemap
entry. External MCP services must explicitly choose a version or use these fixed
exports; changing portal browser state cannot change an external MCP request.
