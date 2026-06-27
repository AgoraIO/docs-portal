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

Three independent pieces:

1. **Group labels + regrouping (meta.json).** The Reference nav gains three
   section separators — `SDK API reference`, `REST API reference`, `Guides`. The
   existing REST lanes move under `REST API reference`; `Recipes`/`FAQ` move under
   `Guides`; `Overview`/`Download SDKs` stay at the top. This is meta.json
   editing only (`content/docs/en/api-reference/meta.json` and the `api-ref`
   grouping), no content moves.

2. **Agora Agents elevation (meta.json + rename).** Rename the
   `api-ref/server-sdk/` group title from "Server SDK" to **"Agora Agents"** and
   place it first within `SDK API reference`. Its `typescript`/`python`/`go`
   pages are unchanged in-portal content. (The Conversational AI **REST** API
   stays under `REST API reference`.)

3. **SDK API reference matrix (data-driven nav).** The per-product external
   platform links are driven by a new typed data module — a
   **product × platform → api-ref URL** matrix (priority-ordered), e.g.
   `src/lib/sdk-api-references.ts`:

   ```ts
   type SdkApiProduct = {
     label: string;            // "Voice & Video"
     iconKind: SolutionCardIconKind; // reuse the shared icon registry
     platforms: { label: string; url: string }[]; // url = hosted api-ref (latest major)
   };
   ```

   The Reference sidebar composes the `SDK API reference` section from this matrix
   (Agora Agents' in-portal pages first, then the external-link products),
   rendered as collapsible product groups with `external` platform leaves. The
   matrix is the single source of truth for the URLs, assembled from the
   `api-ref.agora.io` links already present in content plus the known SDK set;
   each link targets the current major version.

   This keeps ~50 external links in one maintainable, typed file rather than
   scattered meta.json external entries or empty folder stubs. The exact
   injection point (extend the nav builder in `docs-tree.ts` / the Reference
   payload vs. a dedicated sidebar section component) is a plan-level decision;
   the sidebar already renders `external`/`href` nodes
   (`DocsSidebarTree.tsx`, `docs-tree.ts`).

## Testing

- **Matrix data test:** every product has ≥1 platform; every `url` is an absolute
  `https://api-ref.agora.io/...` (Agora Agents excepted — in-portal); the order
  leads with Agora Agents then Voice & Video.
- **Nav composition test:** the Reference sidebar tree contains the three section
  separators in order; `Agora Agents` is the first SDK product with in-portal
  (non-external) children `TypeScript/Python/Go`; `Voice & Video` is second with
  `external` children whose `href` matches the matrix; the REST lanes appear
  under `REST API reference`; `Recipes`/`FAQ` under `Guides`.
- **Render test (`DocsSidebarTree`):** an external platform leaf renders an
  external link (e.g. `target`/`rel`/`↗` affordance) with the correct `href`.

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
