# Reference Sidebar Reorganization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganize the en Reference sidebar into `Overview · Download SDKs · SDK API reference · REST API reference · Guides`, with Agora Agents first and per-product platform links (external to the hosted api-ref docs), using only meta.json.

**Architecture:** Pure meta.json. The sidebar already builds from meta.json via fumadocs → `docs-tree.ts`; the schema (`docs-meta-schema.ts`) already supports separators, `type:'group'`, and `{external,href,title}` links. No new nav code, no content files move (nested-path page refs are supported). The first task is a spike, because the group/external meta path is schema-defined but used by zero content today.

**Tech Stack:** fumadocs-mdx (meta.json schema + page tree), React (DocsSidebarTree), Vitest, TypeScript, `bun`.

---

## File Structure

- Modify: `content/docs/en/api-reference/meta.json` — the single composition point for the Reference nav (separators, SDK product groups, nested-path refs to lanes + Agora Agents).
- Modify: `content/docs/en/api-reference/api-ref/meta.json` — reconcile so lanes aren't double-listed; rename `server-sdk` title → "Agora Agents".
- Modify: `content/docs/en/api-reference/api-ref/server-sdk/meta.json` — title "Server SDK" → "Agora Agents".
- Test: `src/lib/docs-tree.test.ts` — unit-test that an external page-tree item becomes an `external` sidebar node.

No `.tsx`/`.ts` source changes are expected unless the spike (Task 1) reveals a bug in the unused meta path, in which case fix `src/lib/docs-meta-schema.ts` / `src/lib/docs-tree.ts`.

Scope: **en only** (zh-CN mirror is a later, separate effort per the spec). Phase 2 (landing page, per-product SDK pages) is out of scope.

---

### Task 1: Spike — prove the group + external meta path renders

**Files:**
- Modify: `content/docs/en/api-reference/meta.json`
- Test: `src/lib/docs-tree.test.ts`

- [ ] **Step 1: Unit test — an external page-tree item becomes an external sidebar node**

In `src/lib/docs-tree.test.ts`, add this test inside the `describe('docs tree helpers', …)` block. It uses the exported `pageTreeNodeToSidebarNodes` with a mock fumadocs folder node whose child is an external link, mirroring how fumadocs represents `{external,href,title}` after the schema transform:

```ts
  it('maps an external page-tree item to an external sidebar node', () => {
    const folder = {
      $id: 'voice-video-group',
      type: 'folder',
      name: 'Voice & Video',
      children: [
        {
          $id: 'vv-android',
          type: 'page',
          name: 'Android',
          url: 'https://api-ref.agora.io/en/video-sdk/android/4.x/index.html',
          external: true,
        },
      ],
    } as unknown as Parameters<typeof pageTreeNodeToSidebarNodes>[0];

    const nodes = pageTreeNodeToSidebarNodes(folder);
    const section = nodes.find((node) => node.type === 'section');
    const child = section && 'children' in section ? section.children[0] : undefined;

    expect(child).toMatchObject({
      type: 'page',
      external: true,
      href: 'https://api-ref.agora.io/en/video-sdk/android/4.x/index.html',
      title: 'Android',
    });
  });
```

- [ ] **Step 2: Run the unit test**

Run: `bun run test src/lib/docs-tree.test.ts -t "external sidebar node"`
Expected: PASS (the docs-tree layer already reads `item.external`/`item.url`). If it FAILS, the bug is in `docs-tree.ts`'s external handling — fix it minimally there before continuing.

- [ ] **Step 3: Author a one-product spike group in the real meta.json**

In `content/docs/en/api-reference/meta.json`, replace the `pages` array with this temporary spike (we expand it in Task 3):

```json
{
  "title": "Reference",
  "icon": "Wrench",
  "root": true,
  "pages": [
    "index",
    "sdks",
    "---SDK API reference---",
    {
      "type": "group",
      "title": "Voice & Video",
      "icon": "AudioLines",
      "collapsible": true,
      "pages": [
        { "external": true, "title": "Android", "href": "https://api-ref.agora.io/en/video-sdk/android/4.x/index.html" },
        { "external": true, "title": "Web", "href": "https://api-ref.agora.io/en/video-sdk/web/4.x/index.html" }
      ]
    },
    "recipes",
    "faq",
    "api-ref"
  ]
}
```

- [ ] **Step 4: Verify the round-trip renders (SSR)**

Run: `bun run dev` (note the port). Then:
`curl -s "http://127.0.0.1:<port>/en/api-reference/recipes" -o /tmp/spike.html` and
`grep -ac "api-ref.agora.io/en/video-sdk/android/4.x/index.html" /tmp/spike.html`

Expected: ≥1 — the external Voice & Video → Android link is present in the rendered sidebar, and a "Voice & Video" group label appears (`grep -ac "Voice &amp; Video" /tmp/spike.html` ≥1). Stop the dev server.

If the external href does NOT appear: the unused meta path has a gap in the
fumadocs/schema layer. Inspect `src/lib/docs-meta-schema.ts` (the
`docsMetaExternalPageLinkSchema` / `docsMetaPageGroupSchema` transforms) and how
`src/lib/docs-tree.ts` reads `item.external`; fix minimally so the link renders.
Do not build a parallel data-driven nav.

- [ ] **Step 5: Commit the spike**

```bash
git add src/lib/docs-tree.test.ts content/docs/en/api-reference/meta.json
git commit -m "spike: prove meta.json group + external links render in the Reference sidebar"
```

---

### Task 2: Inventory api-ref children and assemble the SDK product matrix

This is a content-assembly task governed by the spec's sourcing rules. It produces, as a working note committed to the plan-adjacent scratch, the **destination of every current `api-ref` child** and the **product → platform → URL** group entries.

**Files:**
- Create: `docs/superpowers/plans/2026-06-27-reference-sidebar-matrix.md` (working inventory — committed, used by Task 3).

- [ ] **Step 1: Enumerate every current `api-ref` child and assign a destination**

Run: `ls content/docs/en/api-reference/api-ref/` and record each entry's destination in the inventory file. Known mapping:
- REST lanes → **REST API reference**: `conversational-ai`, `rtc`, `broadcast-streaming`, `im` (Chat), `signaling`, `cloud-recording`, `cloud-transcoding`, `speech-to-text`, `rtmp-gateway` (Media Gateway), `whiteboard`, `media-pull`, `media-push`, `on-premise-recording`, `console`, `flexible-classroom`, `extensions-marketplace`, `agora-analytics`, `iot-channel-management-rest-api`.
- `server-sdk` → **SDK API reference** as **Agora Agents** (Task 3).
- `uikit-sdk` (the "Fastboard API", a Whiteboard SDK reference) → place under SDK API reference near Whiteboard, or under REST — decide and record (default: leave under REST API reference as a misc reference unless it is clearly an SDK class reference, in which case note it as a one-off SDK entry).
- `index` → the api-ref overview; record whether it is kept (as a REST overview) or folded into the Reference Overview.

No entry may be left without a recorded destination.

- [ ] **Step 2: Assemble the product → platform → URL matrix (verified-only)**

For each SDK product, collect the per-platform hosted api-ref URLs from the
existing links in content:
`grep -rhoE "https://api-ref\.agora\.io/[^\"')> ]+" content | sed -E 's#https://api-ref.agora.io/(en/)?##' | sort -u`

Apply the sourcing rules: **verified-only** (URL must appear in content / be confirmed live), **major-version index** (`…/N.x/index.html`), **gaps allowed and flagged** (omit a platform with no hosted ref; list any expected-but-missing product×platform in the inventory). Priority order: Agora Agents (in-portal, Task 3), then **Voice & Video**, then Signaling, Chat, Interactive Whiteboard, Media Player Kit, IoT, Flexible Classroom, Server Gateway, On-Premise Recording.

Record each product as a ready-to-paste meta.json `type:'group'` block (icon kind = the product's `SolutionCardIconKind`: Voice & Video `AudioLines`, Signaling `Network`, Chat `MessagesSquare`, Whiteboard `Presentation`, Media Player `TerminalSquare`, IoT `Cpu`, …). Example (Voice & Video):

```json
{
  "type": "group",
  "title": "Voice & Video",
  "icon": "AudioLines",
  "collapsible": true,
  "pages": [
    { "external": true, "title": "Android", "href": "https://api-ref.agora.io/en/video-sdk/android/4.x/index.html" },
    { "external": true, "title": "iOS",     "href": "https://api-ref.agora.io/en/video-sdk/ios/4.x/index.html" },
    { "external": true, "title": "Web",     "href": "https://api-ref.agora.io/en/video-sdk/web/4.x/index.html" }
  ]
}
```

- [ ] **Step 3: Commit the inventory**

```bash
git add -f docs/superpowers/plans/2026-06-27-reference-sidebar-matrix.md
git commit -m "docs: api-ref child inventory + SDK product-platform URL matrix"
```

---

### Task 3: Compose the full Reference meta.json + elevate Agora Agents

**Files:**
- Modify: `content/docs/en/api-reference/meta.json`
- Modify: `content/docs/en/api-reference/api-ref/server-sdk/meta.json`
- Modify: `content/docs/en/api-reference/api-ref/meta.json`

- [ ] **Step 1: Rename the Agora Agents group title**

In `content/docs/en/api-reference/api-ref/server-sdk/meta.json`, change `"title": "Server SDK"` to `"title": "Agora Agents"`. Leave its `pages` (`typescript`, `python`, `go`) unchanged.

- [ ] **Step 2: Compose the top-level Reference meta.json**

Replace `content/docs/en/api-reference/meta.json` `pages` with the full structure, pasting the product groups from the Task 2 matrix:

```json
{
  "title": "Reference",
  "icon": "Wrench",
  "root": true,
  "pages": [
    "index",
    "sdks",
    "---SDK API reference---",
    { "type": "group", "title": "Agora Agents", "icon": "Bot", "collapsible": true,
      "pages": ["api-ref/server-sdk/typescript", "api-ref/server-sdk/python", "api-ref/server-sdk/go"] },
    { "type": "group", "title": "Voice & Video", "icon": "AudioLines", "collapsible": true, "pages": [ /* matrix */ ] },
    { "type": "group", "title": "Signaling", "icon": "Network", "collapsible": true, "pages": [ /* matrix */ ] },
    { "type": "group", "title": "Chat", "icon": "MessagesSquare", "collapsible": true, "pages": [ /* matrix */ ] },
    { "type": "group", "title": "Interactive Whiteboard", "icon": "Presentation", "collapsible": true, "pages": [ /* matrix */ ] },
    { "type": "group", "title": "Media Player Kit", "icon": "TerminalSquare", "collapsible": true, "pages": [ /* matrix */ ] },
    { "type": "group", "title": "IoT", "icon": "Cpu", "collapsible": true, "pages": [ /* matrix */ ] },
    { "type": "group", "title": "Flexible Classroom", "icon": "GraduationCap", "collapsible": true, "pages": [ /* matrix */ ] },
    { "type": "group", "title": "Server Gateway", "icon": "ServerCog", "collapsible": true, "pages": [ /* matrix */ ] },
    { "type": "group", "title": "On-Premise Recording", "icon": "HardDrive", "collapsible": true, "pages": [ /* matrix */ ] },
    "---REST API reference---",
    "api-ref/conversational-ai",
    "api-ref/rtc",
    "api-ref/signaling",
    "api-ref/im",
    "api-ref/cloud-recording",
    "api-ref/cloud-transcoding",
    "api-ref/rtmp-gateway",
    "api-ref/media-pull",
    "api-ref/media-push",
    "api-ref/speech-to-text",
    "api-ref/agora-analytics",
    "api-ref/whiteboard",
    "api-ref/flexible-classroom",
    "api-ref/broadcast-streaming",
    "api-ref/console",
    "api-ref/extensions-marketplace",
    "api-ref/on-premise-recording",
    "api-ref/uikit-sdk",
    "api-ref/iot-channel-management-rest-api",
    "---Guides---",
    "recipes",
    "faq"
  ]
}
```

Replace each `/* matrix */` with the product's group `pages` from Task 2. (Drop "Download SDKs" stays as `"sdks"` at top, per the design.)

- [ ] **Step 3: Reconcile `api-ref/meta.json` to avoid double-listing**

The top-level meta now references each lane individually via `api-ref/<lane>`. So the parent must no longer also include `api-ref` as a folder. In `content/docs/en/api-reference/api-ref/meta.json`, this folder's own meta still orders its children for any folder-level rendering, but it must not duplicate entries in the Reference nav. Remove `server-sdk` from its `pages` (it is now surfaced as Agora Agents under SDK API reference), and confirm the top-level meta no longer lists the bare `"api-ref"` entry (it doesn't, per Step 2). Keep the lane order in `api-ref/meta.json` consistent with the REST group order in Step 2.

- [ ] **Step 4: Type-check and lint the JSON/source**

Run: `bunx tsc --noEmit -p tsconfig.json` (expect exit 0 — meta.json is validated by the zod schema at build; tsc catches any source issues if the spike required a fix).
Run: `bunx biome check content/docs/en/api-reference/meta.json content/docs/en/api-reference/api-ref/meta.json content/docs/en/api-reference/api-ref/server-sdk/meta.json` — expect no errors (format if needed with `--write`).

- [ ] **Step 5: Commit**

```bash
git add content/docs/en/api-reference/meta.json content/docs/en/api-reference/api-ref/meta.json content/docs/en/api-reference/api-ref/server-sdk/meta.json
git commit -m "feat: reorganize Reference sidebar (SDK/REST/Guides groups, Agora Agents first)"
```

---

### Task 4: Verify the composed Reference sidebar end-to-end

**Files:** (verification only)

- [ ] **Step 1: Build the source and run the dev server**

Run: `bun run dev` (note the port).

- [ ] **Step 2: Assert the composed structure in the rendered sidebar (SSR)**

`curl -s "http://127.0.0.1:<port>/en/api-reference/recipes" -o /tmp/ref.html`, then check:
- Section headers present: `grep -ac "SDK API reference" /tmp/ref.html`, `"REST API reference"`, `"Guides"` — each ≥1.
- Agora Agents group present with in-portal children: `grep -ac "Agora Agents" /tmp/ref.html` ≥1; the TypeScript/Python/Go links point to `/en/api-reference/api-ref/server-sdk/...` (in-portal, not `api-ref.agora.io`).
- Voice & Video external links present: `grep -ac "api-ref.agora.io/en/video-sdk" /tmp/ref.html` ≥1.
- REST lanes present under their group (e.g. `grep -ac "/en/api-reference/api-ref/rtc" /tmp/ref.html` ≥1).
- Recipes and FAQ present.
- No entry double-listed: spot-check that a lane (e.g. `conversational-ai`) appears once in the nav.

Stop the dev server.

- [ ] **Step 3: Run the full affected test suite**

Run: `bun run test src/lib/docs-tree.test.ts` (the spike unit test) and `bunx tsc --noEmit -p tsconfig.json`.
Expected: green / exit 0.

---

### Task 5: Manual review

- [ ] **Step 1: Browse the Reference section**

`bun run dev`, open `/en/api-reference`. Confirm: the sidebar shows Overview · Download SDKs · **SDK API reference** (Agora Agents first → TS/Python/Go in-portal; Voice & Video second → platforms `↗`; then the rest) · **REST API reference** (lanes) · **Guides** (Recipes, FAQ). Expand a few SDK products; confirm external `↗` links open the hosted refs and Agora Agents pages open in-portal. Flag any product×platform that is missing but expected (cross-check the Task 2 inventory). Stop the server.

---

## Self-Review

**Spec coverage:**
- Pure meta.json mechanism (groups + external + separators) → Tasks 1, 3. ✓
- Verification spike first (unused path) → Task 1. ✓
- Target IA (Overview · Download SDKs · SDK API reference · REST API reference · Guides) → Task 3 Step 2. ✓
- Agora Agents first, in-portal TS/Python/Go, renamed from "Server SDK" → Task 3 Steps 1-2. ✓
- Voice & Video second; flat priority-ordered products; server SDKs last → Task 3 Step 2 order. ✓
- External links per platform, verified-only, major-version index, gaps flagged → Task 2. ✓
- No content files move (nested-path refs) → Task 3 (refs like `api-ref/server-sdk/typescript`, `api-ref/rtc`). ✓
- Reconcile api-ref/meta.json double-listing → Task 3 Step 3. ✓
- Full inventory of every api-ref child → Task 2 Step 1. ✓
- Tests: spike unit + SSR composition checks → Tasks 1, 4. ✓
- en only; Phase 2 + zh-CN deferred → File Structure note. ✓

**Placeholder scan:** The `/* matrix */` markers in Task 3 Step 2 are deliberate insertion points filled from the Task 2 inventory (a content-assembly output), not unfinished plan text; every other step has concrete code/commands. The spike URLs are illustrative-but-valid api-ref paths; Task 2 replaces them with verified ones.

**Consistency:** meta.json keys (`type:'group'`, `collapsible`, `icon`, `external`, `href`, `title`) match `docs-meta-schema.ts`. Nested-path refs (`api-ref/<lane>`, `api-ref/server-sdk/<lang>`) match the existing nested-path pattern. Icon kinds match the shared `SolutionCardIcon` registry.
