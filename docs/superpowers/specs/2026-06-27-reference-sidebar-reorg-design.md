# Reorganize the Reference sidebar (Phase 1 of the API-reference overhaul)

**Date:** 2026-06-27
**Status:** Approved, ready for implementation plan
**Phase:** 1 of 2. Phase 2 (the Reference landing page + per-product SDK API reference page layout) is a separate, later spec.

## Problem

The Reference section's left nav doesn't present API references coherently. Today
it is: `Overview · Recipes · Download SDKs · FAQ · API reference` (the last
expands to per-product REST lanes). The **SDK API references** (per-platform
class/method docs) are not in the nav at all — they're external links scattered
across the overview cards. REST and SDK references are mixed conceptually, and
the **Agora Agents** server SDK (the Conversational AI integration product, with
in-portal TypeScript/Python/Go references at `api-ref/server-sdk/`) is buried
under a generic "Server SDK" entry instead of being a first-class, top-priority
product. Inspiration: LiveKit's reference, which groups SDK references clearly.

## Decision

Reorganize the Reference sidebar into clearly-labeled groups, surface all SDK API
references (linking out to the hosted `api-ref.agora.io` docs where they live),
and lead with the highest-priority products. This phase changes navigation
structure and adds the SDK-API-reference nav; it does **not** redesign the
landing page or build per-product SDK pages (Phase 2).

## Target sidebar IA (Reference tab)

```
Reference
  Overview
  Download SDKs

  ── SDK API reference ──
  Agora Agents                 (Conversational AI server SDK; in-portal)
    TypeScript
    Python
    Go
  Voice & Video                (RTC client SDK; external ↗ per platform)
    Android · iOS · Web · macOS · Windows · Flutter · React Native · Unity · Electron
  Signaling
    Android · iOS · Web · Flutter · Unity
  Chat
    Android · iOS · Web · React Native · Flutter · Unity · Windows
  Interactive Whiteboard
    Android · iOS · Web
  Media Player Kit
    Android · iOS · macOS · Windows
  IoT
    Android · Linux
  Flexible Classroom
    Android · iOS · Web · Electron
  Server Gateway
    Linux C++ · Linux Java
  On-Premise Recording
    Linux C++

  ── REST API reference ──
  Conversational AI · RTC · Signaling · Chat · Cloud Recording · Cloud
  Transcoding · Media Gateway · Media Pull · Media Push · Speech-to-Text ·
  Analytics · Whiteboard · Flexible Classroom · Broadcast Streaming · Console ·
  Extensions Marketplace   (the existing OpenAPI lanes, unchanged content)

  ── Guides ──
  Recipes
  FAQ
```

Decisions baked in (from review):
- **Flat, priority-ordered SDK list**, not a strict Client/Server split — because
  Agora Agents (server-side) must outrank Voice & Video (client-side). Agents
  first, Voice & Video second, then the remaining client SDKs, then the two pure
  server SDKs (Server Gateway, On-Premise Recording) last.
- **Each product expands to its platforms** in the sidebar (4-level depth: group
  → product → platform), collapsed by default past the active item.
- **Agora Agents' children are in-portal pages** (TypeScript/Python/Go); every
  other product's children are **external links** (`↗`) to `api-ref.agora.io`.
- **Download SDKs stays top-level** (it's installs, a different task than API
  lookup).

## Mechanism

**Pure meta.json — no new nav code.** The sidebar is already built entirely from
meta.json, and the existing schema (`src/lib/docs-meta-schema.ts`) already
supports the three primitives this needs:

- **Section separators** — `"---SDK API reference---"` etc. (widely used today).
- **Collapsible groups** — `{ "type": "group", "title": …, "icon"?: …, "collapsible": true, "pages": [...] }`.
- **External page links** — `{ "external": true, "title": …, "href": "https://…" }`,
  which the schema transforms to the fumadocs external-link form; the page tree
  then yields `item.external = true`, and `DocsSidebarTree` already renders such
  nodes as `↗` links.

So the entire reorg is meta.json editing — **no content files move** (meta.json
`pages` support nested-path references like `api-ref/server-sdk/typescript`,
confirmed in existing content) — no data module, no nav-injection code, no empty
folder stubs (external links live directly in a group's `pages`). The top-level
`content/docs/en/api-reference/meta.json` becomes the single composition point
for the Reference nav. Because the existing `api-ref/meta.json` also lists the
lanes, the plan must reconcile double-listing (reference the lanes individually
from the top-level meta and drop/restructure the `api-ref` folder reference) —
sorted out during the spike.

1. **Regroup + separators.** In `content/docs/en/api-reference/meta.json`, order
   the Reference nav as `Overview · Download SDKs · ---SDK API reference--- · …SDK
   product groups… · ---REST API reference--- · …existing lanes… · ---Guides--- ·
   Recipes · FAQ`.

2. **Agora Agents elevation.** Rename the `api-ref/server-sdk/` group title from
   "Server SDK" to **"Agora Agents"** and place it first within `SDK API
   reference`. Its `typescript`/`python`/`go` pages stay as in-portal content
   (referenced from the SDK section). The Conversational AI **REST** API stays
   under `REST API reference`.

3. **SDK product groups.** Each client/server SDK product is a `type:'group'`
   (collapsible, reusing the shared product icon kinds) whose `pages` are the
   per-platform `external` links to `api-ref.agora.io`, priority-ordered: Agora
   Agents, Voice & Video, then the rest. Sourcing rules for the matrix:
   - **Verified-only:** include a platform leaf only when a real hosted api-ref
     URL exists (sourced from the `api-ref.agora.io` links already in content,
     confirmed live). Never invent or guess a URL.
   - **Major-version index:** each leaf points at the major-version index
     (`…/N.x/index.html`), which differs per product, so links survive patch
     releases.
   - **Gaps allowed, flagged:** a product simply omits platforms with no hosted
     ref (incomplete beats broken links); the plan lists any product×platform
     that was expected but had no findable URL, rather than dropping it silently.

**Full inventory required.** The plan must enumerate **every** current `api-ref`
child and give each a destination, so nothing is orphaned — the clean OpenAPI
lanes go under `REST API reference`; `server-sdk` becomes Agora Agents under `SDK
API reference`; and the loose pages (`uikit-sdk` = the Fastboard/Whiteboard SDK
reference, `iot-channel-management-rest-api`, `console`, the `index`) are each
explicitly placed or dropped, not silently lost.

**Caveat → verification spike (Task 1).** `type:'group'` and `external` meta
entries are schema-defined but used by **zero** content files today, so that
round-trip is unexercised. The plan must therefore start with a one-product spike
— author **Voice & Video** as a group with a couple of external platform links,
render the sidebar, and assert the tree contains `external` nodes with the correct
`href` and that the group/separator render. If the unused path has a bug, fix it
in `docs-meta-schema.ts`/`docs-tree.ts` (small) rather than building a parallel
data-driven nav. Only after the spike passes do we author the full matrix.

## Testing

- **Spike test (Task 1):** building the sidebar tree from a meta.json that has a
  `type:'group'` whose `pages` include `{external,title,href}` entries yields a
  group node with `external`/`href` children carrying the exact `href` — proving
  the unused meta path works (or pinpointing the fix).
- **Nav composition test:** the Reference sidebar tree contains the three section
  separators (`SDK API reference`, `REST API reference`, `Guides`) in order;
  `Agora Agents` is the first SDK product with in-portal (non-external) children
  `TypeScript/Python/Go`; `Voice & Video` is second with `external` children; the
  REST lanes appear under `REST API reference`; `Recipes`/`FAQ` under `Guides`.
- **Render test (`DocsSidebarTree`):** an external platform leaf renders an
  external link (`target`/`rel`/`↗` affordance) with the correct `href`; an
  in-portal Agora Agents leaf renders an internal link.

Manual check (once): load a Reference page; confirm the new grouped sidebar,
Agora Agents first expanding to TS/Python/Go (in-portal), Voice & Video second
expanding to external platform links, REST lanes grouped, Recipes/FAQ under
Guides.

## Out of scope (Phase 2, later)

- The Reference **landing page** redesign and the **per-product SDK API reference
  page** (the card layout).
- Bringing any externally-hosted SDK API docs in-portal.
- zh-CN nav (mirror after the en structure is validated).
- Reworking the Conversational AI REST lane or other REST content.
