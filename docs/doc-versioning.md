# Documentation Preview and versions

Status: **in development**, on draft integration PR #1339. The English
Conversational AI guides, REST references and Python/TypeScript/Go SDK
references are registered, together with
isolated sample groups. Registration in this branch is not a production release.

## Scope and behavior

Documentation Preview is a portal feature for ordinary Markdown/MDX guides,
tutorials, and generated OpenAPI reference pages. It is independent of SDK
platform tabs, SDK package versions, and OpenAPI `info.version`.

A document group owns its versioned routes and navigation. A **preference key**
identifies a rollout across groups. The real ConvoAI guide, REST and SDK groups
currently share **`convoai`**. The sample API and guide groups share
**`convoai-v3`**. These keys stay separate so sample selections do not affect
real documentation. Renaming the real key is a release decision; do not change
it without deciding what happens to saved choices. Unregistered pages have no
version UI.

Version IDs identify documentation editions, not API protocol versions. The
route suffix need not equal the version ID: the guide demo uses `new` and
`previous` URLs, mapped to `v2` and `v1` respectively.

| Arrival or action | Result | Saved preference |
| --- | --- | --- |
| First visit to a neutral group entry | Configured default: Main for real ConvoAI; Preview for samples | Unchanged |
| Neutral entry with a valid saved choice | That edition for the group's key | Unchanged |
| Explicit version URL, including a shared link | The URL's edition, even if local preference differs | Unchanged |
| Choose an edition in the sidebar | Matching topic in that edition | Updated for the preference key |
| Click **Switch to Main.** in a Preview notice | Matching Main topic | Updated for the preference key |
| Choose an edition in the Reference catalog | Stay on the catalog; update its REST and SDK links | Updated for the preference key |
| Open a version link with a modifier or in a new tab | The link's edition | Unchanged |
| Topic has no equivalent in the selected edition | Target overview with an explanation | Updated only for a deliberate selection |

The sidebar selector has a **Documentation version** label, a neutral outlined
button, and the same badge component for both Main and Preview. Both badges
have the same size, weight and border; Main is neutral and Preview uses the
existing info color. The dropdown marks the selected option with a check and
explains the product under each version name. Search results and recent
results use the same badges. On desktop it sits above the scoped navigation
or inside the configured Reference catalog section. Below 1024px it appears **inside the collapsed
navigation sheet**, above the same page list. It does not appear beside Copy
Page or elsewhere in the article header.

Preview pages also show a compact Fumadocs notice between the article header
and body. It identifies the document group and offers a **Switch to Main.**
link. Missing-topic notices identify the destination by name, for example:
"No matching page in Preview. Showing its overview."
Main pages have no Preview notice. The real ConvoAI notice says, "You're
reading the Conversational AI Platform (Preview) docs." There is no site-wide
Preview banner or redundant "Documentation versions" back navigation.

## Configuration

Register generic groups in `src/lib/doc-versions.ts`. Real ConvoAI groups live
in `src/lib/convoai-doc-versions.ts` and are included in that registry. The
registry, rather than an
implicit URL convention or free-form frontmatter tag, is the source of truth.
The `status: 'preview'` tag belongs to a version record; all pages under that
record's root inherit the state unless `restrictToMappedPages` limits it to
explicitly enrolled topics.

```ts
{
  id: 'test-guides',                    // unique group / route owner
  label: 'Guide demo',
  preferenceKey: 'convoai-v3',           // shared rollout key
  entryUrl: '/en/introduction/versioning-demo',
  defaultVersion: 'v2',                 // Sample default; real ConvoAI uses v1
  previousVersion: 'v1',                // explicit return destination
  versions: [
    {
      id: 'v2',
      label: 'New docs',
      status: 'preview',
      rootUrl: '/en/introduction/versioning-demo/new',
      pages: { overview: '', setup: 'configure' },
    },
    {
      id: 'v1',
      label: 'Previous docs',
      rootUrl: '/en/introduction/versioning-demo/previous',
      pages: { overview: '', setup: 'setup' },
    },
  ],
}
```

- Use a stable `id` for each document group and a stable `preferenceKey` for
  each rollout. Without `preferenceKey`, the group ID is its preference key.
- Groups sharing a key must use the same version IDs, Preview statuses,
  default, and previous version. Labels, roots, navigation and topic paths
  can differ. Invalid or inconsistent registrations fail validation.
- `defaultVersion` and `previousVersion` serve different purposes. A Preview
  default must never make the return link point back to itself.
- Each edition owns a distinct canonical `rootUrl`. Add its ordinary content
  and `meta.json` beneath that root. The shared docs shell handles MDX and
  generated endpoint bodies through the same version controls.
- The `pages` map uses stable topic keys. Map renamed pages to the same key;
  anchors are supported for old single-page guides. Missing keys fall back
  to the target overview with `?versionFallback=1` and a visible explanation.
- Add a neutral entry with real version links for readers without JavaScript.
  Hydration restores the saved/default edition using a history replacement.
- Link catalogs to the neutral entry. Within-edition links use fixed edition
  URLs. Keep published legacy URLs pinned; do not redirect them by preference.
- A locale needs its own registered routes. The feature does not infer
  translated equivalents or apply Preview to an entire locale or header tab.

### Maintain the real ConvoAI groups

The groups are `convoai-guides`, `convoai-api` and `convoai-sdk`. Their edition
IDs are `v1` (Main) and `v2` (Preview); all default to Main at a neutral entry.
A direct `/en/ai/platform/**` or Platform API URL still opens Preview even
when the browser remembers Main.

- Main guide navigation keeps the existing Voice Agent overview, Voice agent
  in apps, Agent Studio and dedicated-device sections. It excludes the
  Platform subtree. Main release notes retain their existing content; Platform
  release notes are separate. Keeping Studio and Device Kit visible does not enroll
  those independent products in version switching.
- Preview guide navigation shows its own published topics, release notes,
  REST link, Pricing link and Python/TypeScript/Go SDK links.
- The Reference catalog has one selector under Voice Agents. On catalog
  pages it stays in place and updates all four links: REST, Python, TypeScript
  and Go. On a specific SDK page it switches the current language to its
  counterpart. The REST selector remains in its scoped sidebar. On mobile,
  these controls stay inside the collapsed navigation sheet.
- `previewMessage` supplies the product-specific notice. The selector uses
  `label`; Main and Preview each render once as a badge. Product descriptions
  explain the edition without replacing its name.
- `sharedUrls` keeps fixed shared articles in both editions. `navigationUrls`
  on an edition retains its related links outside the root, such as SDK docs.
  Links alone do not enroll a topic; the SDK family has its own explicit
  registration. Never retain the other
  edition's subtree just because it also contains a shared Pricing link.

`src/generated/convoai-doc-pages.ts` is generated from explicit `meta.json`
sidebar membership, not from all files found on disk. After a sidebar change:

```bash
bun run convoai:mapping
bun run convoai:mapping:check
```

Both `types:check` and `build:static` enforce manifest consistency. Edit the
sidebars or the generator, not the generated map. Keep guide aliases in
`src/lib/convoai-doc-versions.ts`: start/stop maps to the renamed start-session
guide, and custom information maps to personalization. Deferred source files
and the removed generic HTTP TTS page are excluded from switching.

API operation keys remain edition-specific until their equivalence is
confirmed. Only overview, authentication and status pages map across editions;
other operations fall back to the destination overview. When an OpenAPI
operation is removed, remove its sidebar entry too and regenerate the map.
The latest #1208 contract removes Speak, Inject context and Interrupt.

For generated endpoints only, add separate OpenAPI sources and lane IDs per
edition in `src/lib/openapi/lanes.ts`, preserve shared `operationId` identities,
and register bundled raw sources in `src/lib/openapi/source-text.server.ts`.
Public YAML paths must be distinct. Ordinary guides need none of this OpenAPI
configuration.

## Local memory and shared links

The browser stores a map under `agora-docs:document-versions:v1`, for example:

```json
{ "convoai": "v1" }
```

Only a deliberate selection writes it. Same-tab subscribers update after a
selection, and catalog views also update on storage changes from another tab.
An explicit version URL determines all visible controls for its rollout
without changing the saved choice. Choosing previous docs in the API demo
makes the guide demo's next neutral-entry visit open previous docs too. An
already-open version page stays pinned to its URL; changes in another tab do
not redirect it. A different preference key remains independent.

Share the canonical edition URL, not a browser-global `preview` query flag.
For example, a v2 link opens v2 for a reader who saved v1, while their next
neutral-entry visit still opens v1. Browser preferences are local to an origin;
production and preview deployments have separate storage. Invalid JSON and
removed edition IDs fall back to the configured default. When storage is
blocked, selection memory lasts only for the current page session.

## Try both content types

- API entry: `/en/api-reference/versioning-demo`
- API topic: `/en/api-reference/versioning-demo/v2/list-widgets`
- Ordinary guide entry: `/en/introduction/versioning-demo`
- Ordinary guide topic: `/en/introduction/versioning-demo/new/configure`

Both groups use `convoai-v3`. Start with empty storage to verify Preview is the
default. Switch the API topic to previous docs, open the guide entry, and check
that it opens the previous guide. Switch the guide to new docs to verify the
reverse direction. Confirm `setup` maps to `configure`, then share a new-guide
URL while the saved choice is previous. Repeat inside the mobile navigation
sheet and confirm the sheet closes after selecting a version.

The API sample also has edition-only **Migration** and **Legacy notes** topics
for checking overview fallback. Search for `widget`: both editions remain
searchable with their labels. `widgetbaseline` and `widgetpreview` identify
the mock API editions.

## Search, exports and publication

Both editions remain searchable at distinct URLs; browsing preferences do not
filter results. Production search keeps its existing provider and index
configuration. Preview deployments use the bundled local index so reviewers
can search unpublished content. New published content reaches Algolia through
the existing production `search:sync` step. PR previews do not sync unpublished
content to production. Local sample search can also use the local provider
without Algolia credentials.

Version identity follows the URL into Markdown, canonical routes, sitemaps,
and machine-readable exports. These resources never depend on localStorage:

- `/en/api-reference/versioning-demo/v2/list-widgets.md`
- `/en/introduction/versioning-demo/new/configure.md`
- `/openapi/versioning-demo/v2.en.yaml`
- `/llms/doc-versions-test-api-v2.txt` and its `-full.txt` companion
- `/llms/doc-versions-test-guides-v2.txt` and its `-full.txt` companion
- `/llms.txt` and `/llms-full.txt`, which include all published editions

External AI/MCP clients must choose a fixed edition URL or export. Changing a
portal browser preference cannot change an external request.

Exported prose uses the configured documentation names and Main/Preview labels.
Internal group and version IDs remain in configuration and index URLs; they are
not appended to the visible version name. In particular, `v1` and `v2` in the
version configuration do not identify an API protocol or SDK package release.

## Verification

Run `bun run test`, `bun run types:check`, `bun run lint`, and `bun run build`
when integrating a group. Check content, scoped navigation, Markdown and export
identity for ordinary guides and generated API pages; verify shared-key and
independent-key behavior, explicit-link precedence, renamed and missing topics,
keyboard operation, and desktop/mobile navigation in light and dark themes.

## Release decisions still open

The local integration retains these existing boundaries while product/content
owners confirm them:

- Whether all three Platform SDK languages and the current Preview guides
  are included in the first production release. The local integration can
  switch their existing content; this does not approve their publication.
- Whether the real preference key remains `convoai` or migrates to another key.
- Cross-edition REST operation equivalence. Until it is approved, unmapped
  operations fall back to the destination overview.
- Pricing has a shared fixed URL and uses the normal Main product navigation.
- Deferred files are not switch targets or edition bulk-export members, but
  can still be served directly and appear in general machine-readable indexes.
  Sidebar membership is not a publication or access-control rule. Confirm
  whether those files must be excluded from the entire build before release.
- Whether to remove the versioning demo pages and mock OpenAPI sources from
  the production build, and how to promote Preview from Main.
- Content approval, the release deadline, production search indexing and
  production deployment acceptance.

## Ordinary navigation entries and catalog configuration

`entryLinks` lists ordinary navigation destinations that should use the neutral
`entryUrl`. Desktop header tabs and the mobile section picker apply
`getDocVersionEntryHref`; the introductory Voice Agent card and the REST
catalog card also link to neutral entries. They restore the saved choice or
Main. Article links, search results, exports and canonical edition URLs remain
explicit, so receiving a shared link never changes a saved choice.

A scope can configure a catalog with `catalog.rootUrl` and `catalog.sectionId`.
The ConvoAI REST group attaches to `separator-Voice Agents` under
`/en/api-reference`. Catalog pages map links from all families sharing the key.
A selector on a specific document navigates to its corresponding topic;
selecting on the catalog changes its links without leaving the page.

SDK pages map by language. Their neutral entry is
`/en/api-reference/api-ref/server-sdk/documentation-versions`; it opens the
first listed SDK language, Python, in the selected edition. A family without
an index page can map its `overview` topic to a default document. It does not
need to invent an equivalent API operation or change an existing canonical URL.
