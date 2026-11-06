# Documentation Main and Preview versions

Status: in development on draft integration PR #1339. This portal feature
supports ordinary Markdown/MDX guides and generated OpenAPI reference pages.
The application registry contains product documentation only; demonstration
pages and mock OpenAPI sources are not published.

## Registered groups

Real ConvoAI configuration lives in `src/lib/convoai-doc-versions.ts` and is
included by `DOC_VERSION_SCOPES` in `src/lib/doc-versions.ts`.

| Group | Neutral entry | Topic mapping |
| --- | --- | --- |
| `convoai-guides` | `/en/ai/documentation-versions` | Sidebar-enrolled guide topics, including renamed-topic aliases |
| `convoai-api` | `/en/api-reference/api-ref/conversational-ai/documentation-versions` | Overview, authentication and status; other operations use overview fallback |
| `convoai-sdk` | `/en/api-reference/api-ref/server-sdk/documentation-versions` | Python, TypeScript and Go remain in the same language |

All three share the existing `convoai` preference key. Documentation IDs `v1`
(Main) and `v2` (Preview) identify documentation choices, not API protocol or
SDK package versions. Main is the default. Preview content is under the
corresponding `platform` root. Voice Agents is the shared SDK product; the
options identify Voice Agent API and Conversational AI Platform.

## Entry, selection and memory

| Arrival or action | Result | Saved choice |
| --- | --- | --- |
| First visit to a neutral entry | Main | Unchanged |
| Neutral entry with a valid saved choice | That documentation version | Unchanged |
| Explicit version URL, including a shared link | The URL's version | Unchanged |
| Choose an option in a document sidebar | Matching topic, or the target overview with an explanation | Updated for the preference key |
| Click Switch to Main in a Preview notice | Corresponding Main topic or overview | Updated for the preference key |
| Choose an option in the Reference catalog | Stay on the page and update its REST/SDK links | Updated for the preference key |
| Modifier click or open a version link in a new tab | The link's version | Unchanged |

Browser memory is a map under `agora-docs:document-versions:v1`, for example:

```json
{ "convoai": "v1" }
```

Only a deliberate normal selection writes it. Same-tab subscribers update
immediately; storage events update catalogs in other tabs. An open explicit
version URL stays pinned even when another tab changes memory. A later
ordinary entry restores the saved choice. Other keys remain independent.
Removed test registrations do not affect real choices and are not migrated
into the `convoai` key.

Preferences are local to an origin. Production, PR deployments and localhost
have separate storage. Invalid JSON or removed IDs fall back to the configured
default. If storage is blocked, selection memory lasts for the current page
session. Browser memory does not affect external AI/MCP requests.

## Placement and labels

Main and Preview use the same badge geometry, option check and product
explanation. Main is neutral; Preview uses the existing info color. Search
results and recent results use the same labels.

On desktop, the selector sits above the scoped navigation or under the
configured Reference section. Below 1024px it stays inside the collapsed
navigation sheet. Choosing a document closes the sheet; changing catalog
links in place keeps it open. The control is separate from Copy Page.

Preview pages also show a Fumadocs notice between the article header and body.
For real guides and REST pages, it says:

> You're reading the Conversational AI Platform (Preview) docs.

The notice includes Switch to Main. SDK pages identify the SDK documentation.
Main has no Preview notice. Missing-topic copy names the selected version,
for example: “No matching page in Preview. Showing its overview.”

## Configure a group

The registry is the source of truth, rather than an inferred URL pattern or
free-form frontmatter tag. Each group defines:

- A stable `id` and label, a neutral `entryUrl`, and distinct version roots.
- A `preferenceKey` when several groups must share a choice. Without one,
  the group ID is its key, including restricted-sidebar ownership.
- Matching version IDs, defaults, previous version and Preview statuses for
  groups sharing a key. Inconsistent registrations fail validation.
- `pages`, a map from stable topic keys to relative paths. Renamed paths can
  share a key. Anchors are supported for old single-page documentation.
- `restrictToMappedPages` when a legacy root also contains unrelated products.
  The registered subset inherits the version's `status: 'preview'`.
- `previousVersion` as the explicit notice destination, independently of the
  default. A group may default to Preview without returning to itself.
- `previewMessage` for product-specific notice copy.

The real guide's start-session topic maps as follows:

```ts
// Main
pages: { overview: '', 'start-session-guide': 'build/start-stop-agent' }
// Preview
pages: { overview: '', 'start-session-guide': 'get-started/start-stop-agent' }
```

Use the maintained real configuration and generated page map for the complete
set; this excerpt shows one topic mapping. A missing counterpart opens the
target's `overview` with `?versionFallback=1`. A group without an index can map
`overview` to a default document, as the SDK group does with Python.

Add a neutral MDX entry with explicit version links for readers without
JavaScript. Hydration restores the choice through a history replacement.
Locales need their own configured routes; the feature does not infer translated
counterparts or mark an entire header tab as Preview.

### Navigation and related content

`entryLinks` identifies ordinary navigation destinations that should resolve
through the neutral entry. Desktop header tabs and the mobile section picker
use `getDocVersionEntryHref`; introductory and REST catalog cards also use
neutral entries. Article links, search results and exports retain explicit
canonical URLs.

`catalog.rootUrl` and `catalog.sectionId` attach a control to a Reference
section. The ConvoAI catalog is `separator-Voice Agents` under
`/en/api-reference`. It remaps REST and all three SDK links for the shared key.
On an explicit SDK page, selecting switches the current language's document.

`sharedUrls` retains fixed shared articles that belong to no edition. `navigationUrls`
retains an edition's related links outside its root. Links do not register a
new group. The other edition's subtree must be removed even if it contains a
shared link. Independent products and unregistered pages have no version UI.

Main retains its overview, app, Studio and dedicated-device navigation without
the Platform subtree. Preview has its own topics and corresponding REST/SDK
links. Each edition has its own Pricing page (`reference/pricing` under its
root), and the switcher pairs them as one topic.
Main and Platform release notes are displayed separately while preserving the
source content.

### Maintain the page map and OpenAPI

`src/generated/convoai-doc-pages.ts` derives from explicit `meta.json` sidebar
membership, not every file on disk. After a sidebar change, run:

```bash
bun run convoai:mapping
bun run convoai:mapping:check
```

Both type checking and the static build enforce consistency. Edit the
sidebars/generator, not the generated map. Keep renamed guide aliases in
`convoai-doc-versions.ts`. REST operation equivalence is not inferred: only
explicitly paired overview/authentication/status topics map; other operations
use overview fallback until the content owners define equivalence.

Generated endpoints use maintained OpenAPI sources, lane IDs and distinct
public YAML paths in `src/lib/openapi/lanes.ts`. Bundle raw sources in
`src/lib/openapi/source-text.server.ts`; never read runtime deployment files
from the filesystem. Ordinary guides need no OpenAPI configuration.

## Search, exports and publication

Both real versions remain searchable at their distinct URLs; browsing choices
do not filter results. Production search keeps its configured provider and
indexes. Preview deployments use the bundled local index. Production indexing
uses the existing `search:sync` release step; PR previews do not write the
production Algolia index.

Markdown, canonical URLs, sitemaps and machine-readable exports follow the
explicit documentation URL, independently of localStorage. Examples:

- `/en/ai/platform/build/managed-mode.md`
- `/en/api-reference/api-ref/conversational-ai/platform/start-session.md`
- `/openapi/conversational-ai/rest-api-platform.en.yaml`
- `/llms/doc-versions-convoai-guides-v2.txt` and its `-full.txt` companion
- `/llms/doc-versions-convoai-api-v2.txt` and its `-full.txt` companion
- `/llms/doc-versions-convoai-sdk-v2.txt` and its `-full.txt` companion

Exported prose uses Main/Preview names; IDs remain in configuration and index
URLs. The old demonstration routes, mock YAML, their search records and their
version-specific indexes are removed from the published build. Test-only
registrations live under `src/test/fixtures` and are not imported by app code.

Source-content publication is a separate concern. Deferred original files may
remain directly accessible even when absent from navigation. Their release
scope, API/SDK availability, terminology and release claims are recorded for
content owners in the copy audit; implementation does not redefine them.

## Verify changes

Run `bun run test`, `bun run types:check`, changed-source lint and
`bun run build`. Check real guide, REST and SDK entry/switching paths, explicit
link precedence, cross-tab memory, renamed/missing topics, keyboard controls
and mobile-sheet closing. Confirm removed demonstrations are absent from
source routes, generated HTML/Markdown, search, sitemap, OpenAPI assets and
machine-readable indexes; hiding their navigation alone is insufficient.
