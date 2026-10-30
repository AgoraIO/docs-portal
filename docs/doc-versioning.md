# Documentation Preview and versions

Status: **in development**. This feature is opt-in. The current configuration
uses sample content; production guides and APIs have not been enrolled.

## Scope and behavior

Documentation Preview is a portal feature for ordinary Markdown/MDX guides,
tutorials, and generated OpenAPI reference pages. It is independent of SDK
platform tabs, SDK package versions, and OpenAPI `info.version`.

A document group owns its versioned routes and navigation. A **preference key**
identifies a rollout across groups. The current key is **`convoai-v3`**: its
sample API and sample guides share a selection. Another rollout uses another
key. Pages outside registered roots receive no version UI.

Version IDs identify documentation editions, not API protocol versions. The
route suffix need not equal the version ID: the guide demo uses `new` and
`previous` URLs, mapped to `v2` and `v1` respectively.

| Arrival or action | Result | Saved preference |
| --- | --- | --- |
| First visit to a neutral group entry | Configured default, currently v2 Preview | Unchanged |
| Neutral entry with a valid saved choice | That edition for the group's key | Unchanged |
| Explicit version URL, including a shared link | The URL's edition, even if local preference differs | Unchanged |
| Choose an edition in the sidebar | Matching topic in that edition | Updated for the preference key |
| Click **Return to previous docs.** | Matching previous topic | Updated for the preference key |
| Open a version link with a modifier or in a new tab | The link's edition | Unchanged |
| Topic has no equivalent in the selected edition | Target overview with an explanation | Updated only for a deliberate selection |

The sidebar selector has a **Documentation version** label, a neutral outlined
button, and a Preview badge when applicable. On desktop it sits above the
scoped document navigation. Below 1024px it appears **inside the collapsed
navigation sheet**, above the same page list. It does not appear beside Copy
Page or elsewhere in the article header.

Preview pages also show a compact Fumadocs notice between the article header
and body. It identifies the document group and offers a real return link.
Previous pages have no Preview notice. There is no site-wide Preview banner.

## Configuration

Register groups in `src/lib/doc-versions.ts`. This registry, rather than an
implicit URL convention or free-form frontmatter tag, is the source of truth.
The `status: 'preview'` tag belongs to a version record; all pages under that
record's root inherit the state.

```ts
{
  id: 'test-guides',                    // unique group / route owner
  label: 'Guide demo',
  preferenceKey: 'convoai-v3',           // shared rollout key
  entryUrl: '/en/introduction/versioning-demo',
  defaultVersion: 'v2',                 // Preview enabled by default
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

For generated endpoints only, add separate OpenAPI sources and lane IDs per
edition in `src/lib/openapi/lanes.ts`, preserve shared `operationId` identities,
and register bundled raw sources in `src/lib/openapi/source-text.server.ts`.
Public YAML paths must be distinct. Ordinary guides need none of this OpenAPI
configuration.

## Local memory and shared links

The browser stores a map under `agora-docs:document-versions:v1`, for example:

```json
{ "convoai-v3": "v1" }
```

Only a deliberate selection writes it. Choosing previous docs in the API demo
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

Both editions remain searchable at distinct URLs. Search retains its providers,
queries and index configuration; browsing preferences do not filter results.
New published content reaches Algolia through the existing production
`search:sync` step. PR previews do not sync unpublished content to production.
Local sample search can use the existing local provider without Algolia
credentials.

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

## Verification

Run `bun run test`, `bun run types:check`, `bun run lint`, and `bun run build`
when integrating a group. Check content, scoped navigation, Markdown and export
identity for ordinary guides and generated API pages; verify shared-key and
independent-key behavior, explicit-link precedence, renamed and missing topics,
keyboard operation, and desktop/mobile navigation in light and dark themes.
