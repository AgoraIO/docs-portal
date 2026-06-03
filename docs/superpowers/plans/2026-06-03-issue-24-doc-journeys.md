# Issue 24 Doc Journeys Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete GitHub issue #24 by making the two intended documentation journeys navigable end to end: Voice Agent home to quickstart to recipes/reference, and Realtime Media to RTC platform/version quickstart to RTC API Reference.

**Architecture:** Keep the solution content- and metadata-driven. Use existing Fumadocs pages, Markdown links, `meta.json` ordering, `navScope`, and existing MDX `Tabs` persistence. Do not add a custom journey router, hard-coded shell links, or page-specific runtime components. Browser validation verifies the visible journey from the user's point of view.

**Tech Stack:** Fumadocs MDX/Core, TanStack Start route loaders, Markdown/MDX content under `content/docs`, existing shadcn-backed MDX tabs/dropdowns, Vitest, `bun run docs:links`, `bun run types:check`, local browser on port 3000.

---

## Confirmed Scope

- Issue #24 is about two complete user journeys, not only the locale/version dropdown mechanics.
- Journey 1 from the issue comment:
  - `home -> voice ai quick start -> recipes -> reference`
- Journey 2 from the issue comment:
  - `realtime -> switch platform/version quickstart -> reference RTC API`
- The issue body is empty and the only details are in the June 1, 2026 comment.
- Existing completed work already covers the RTC Android API reference version scope:
  - `content/docs/{locale}/api-reference/rtc/android/(current)/**`
  - `content/docs/{locale}/api-reference/rtc/android/4.6.0/**`
  - `navScope` in `content/docs/{locale}/api-reference/rtc/android/meta.json`
  - current clean URLs and previous version URLs.
- Do not regress the current shadcn dropdown and MDX style work.
- Do not invent a separate custom platform selector component. Same-page platform variants use existing `Tabs` with `groupId` and `persist`.

## Current Gaps Found

- `content/docs/en/realtime-media/rtc/meta.json` lists `reference`, but `content/docs/en/realtime-media/rtc/reference/**` does not exist.
- `content/docs/zh-CN/realtime-media/rtc/reference/**` already exists and contains an API reference entry pointing to `/zh-CN/api-reference/rtc/android`.
- `content/docs/en/realtime-media/rtc/index.md` links to `reference`, which is currently missing.
- Voice Agent has quickstart, build, best practices, and reference sections, but no explicit `recipes` section name.
- The least invasive interpretation of `recipes` is the existing task/scenario pages under `content/docs/en/ai/build/**` and `content/docs/en/ai/best-practices/**`.
- Existing tests cover individual shell/version behavior, but there is no dedicated regression proving the two issue #24 journeys remain linked.

## Task 1: Add Content Journey Regression Tests

**Files:**
- Create: `src/lib/docs-journeys.test.ts`

- [ ] **Step 1: Write failing tests for the two issue journeys**

Create a content-level test that reads files from `content/docs` and checks required pages and links. Keep it filesystem-based so it catches missing Markdown files without needing a browser.

Test cases:

- Voice Agent journey:
  - `content/docs/en/introduction/index.mdx` links to either `/en/ai/get-started/quickstart` or `/en/ai/choose-your-path/quickstart-coding`.
  - The resolved quickstart page links to at least one recipe-like implementation page under `/en/ai/build/**` or `/en/ai/best-practices/**`.
  - The quickstart or recipe page links to Conversational AI API reference under `/en/api-reference/conversational-ai`.
- Realtime RTC journey:
  - `content/docs/en/realtime-media/index.md` links to `/en/realtime-media/rtc`.
  - `content/docs/en/realtime-media/rtc/index.md` links to a quick-start page and a reference page.
  - `content/docs/en/realtime-media/rtc/reference/api-reference/index.md` exists and links to `/en/api-reference/rtc/android`.
  - `content/docs/en/api-reference/rtc/android/meta.json` defines a `navScope.versions` entry for `current` and `4.6.0`.

Run:

```bash
bunx vitest run src/lib/docs-journeys.test.ts
```

Expected before implementation: FAIL because the English RTC reference folder is missing.

- [ ] **Step 2: Include zh-CN parity checks where content already exists**

Extend the test to assert:

- `content/docs/zh-CN/realtime-media/rtc/reference/api-reference/index.md` exists.
- It links to `/zh-CN/api-reference/rtc/android`.

Do not require full zh-CN Voice Agent parity in this task; the zh-CN AI tree currently uses a different legacy structure.

## Task 2: Complete English RTC Reference Landing

**Files:**
- Create: `content/docs/en/realtime-media/rtc/reference/meta.json`
- Create: `content/docs/en/realtime-media/rtc/reference/api-reference/meta.json`
- Create: `content/docs/en/realtime-media/rtc/reference/api-reference/index.md`
- Create: `content/docs/en/realtime-media/rtc/reference/rest-api.md`
- Create: `content/docs/en/realtime-media/rtc/reference/release-notes.md`
- Create: `content/docs/en/realtime-media/rtc/reference/migration-guide.md`
- Create: `content/docs/en/realtime-media/rtc/reference/billing.md`
- Create: `content/docs/en/realtime-media/rtc/reference/sdk-downloads.md`

- [ ] **Step 1: Mirror the existing zh-CN RTC reference structure in English**

Create English equivalents of the existing zh-CN reference pages. Keep the pages short and functional; the goal is to make the journey complete, not to author final long-form reference docs.

`content/docs/en/realtime-media/rtc/reference/meta.json`:

```json
{
  "title": "Reference",
  "pages": [
    "api-reference",
    "rest-api",
    "release-notes",
    "migration-guide",
    "billing",
    "sdk-downloads"
  ]
}
```

`content/docs/en/realtime-media/rtc/reference/api-reference/meta.json`:

```json
{
  "title": "API Reference",
  "pages": [
    "index"
  ]
}
```

`content/docs/en/realtime-media/rtc/reference/api-reference/index.md`:

```md
---
title: API Reference
description: API reference entry points for client-side Voice & Video capabilities.
---

RTC client API references are published under the global API Reference tab.

- [Android API Reference](/en/api-reference/rtc/android)
```

Create the remaining placeholder reference pages with matching titles and descriptions:

- `REST API`
- `Release notes`
- `Migration guide`
- `Billing`
- `SDK downloads`

Use plain Markdown only.

- [ ] **Step 2: Verify the existing RTC overview link resolves**

Run:

```bash
bunx vitest run src/lib/docs-journeys.test.ts
bun run docs:links
```

Expected:

- Journey test passes.
- Link audit no longer reports `content/docs/en/realtime-media/rtc/index.md` -> `reference` as missing.

## Task 3: Make The RTC Quickstart Carry Platform And Version Intent

**Files:**
- Modify: `content/docs/en/realtime-media/rtc/quick-start/build-from-scratch.md`
- Modify: `content/docs/en/realtime-media/rtc/quick-start/integrate-with-ai-tools.md`
- Optional parity: `content/docs/zh-CN/realtime-media/rtc/quick-start/*.md`

- [ ] **Step 1: Add a lightweight platform/version section to the RTC quickstart pages**

Use existing MDX tabs, not custom components. Add one short section to the most relevant quickstart page, preferably `build-from-scratch.md`:

```mdx
## Choose a client platform

<Tabs defaultValue="android" groupId="rtc-platform" persist>
<TabsList>
  <TabsTrigger value="android">Android</TabsTrigger>
  <TabsTrigger value="ios">iOS</TabsTrigger>
  <TabsTrigger value="web">Web</TabsTrigger>
</TabsList>

<TabsContent value="android">

Start with the Android client SDK docs, then use the API reference for exact classes, methods, and versioned SDK details.

- [Android API Reference](/en/api-reference/rtc/android)
- [Android API Reference v4.6.0](/en/api-reference/rtc/android/4.6.0)

</TabsContent>

<TabsContent value="ios">

iOS API reference content is not migrated into this portal yet. Use the global API Reference tab when the iOS lane is added.

</TabsContent>

<TabsContent value="web">

Web API reference content is not migrated into this portal yet. Use the global API Reference tab when the Web lane is added.

</TabsContent>
</Tabs>
```

If this feels too placeholder-heavy after browser review, keep only Android for this issue and leave iOS/Web out until their API references are present.

- [ ] **Step 2: Add a reference CTA from RTC quickstart to RTC API Reference**

Ensure the quickstart page has a visible final section:

```md
## Reference

- [RTC Android API Reference](/en/api-reference/rtc/android)
```

Do not use decorative cards. Plain Markdown links are enough.

- [ ] **Step 3: Verify MDX tabs still compile**

Run:

```bash
bunx vitest run src/components/mdx.test.tsx src/lib/docs-journeys.test.ts
bun run types:check
```

Expected: MDX tab tests and journey tests pass.

## Task 4: Strengthen Voice Agent Journey Links

**Files:**
- Modify: `content/docs/en/introduction/index.mdx`
- Modify: `content/docs/en/ai/index.md`
- Modify: `content/docs/en/ai/get-started/quickstart.mdx`
- Modify: `content/docs/en/ai/choose-your-path/quickstart-coding.mdx`

- [ ] **Step 1: Normalize the Voice Agent quickstart entry**

Pick one canonical quickstart URL for the journey. Recommended:

- Canonical quickstart: `/en/ai/choose-your-path/quickstart-coding`

Reasoning:

- The page title is `Voice agent quickstart`.
- It sits under `Start here`.
- It matches the issue comment's "voice ai quick start" wording better than the older `/en/ai/get-started/quickstart`.

Update `content/docs/en/introduction/index.mdx` and `content/docs/en/ai/index.md` to point primary Voice Agent quickstart links to `/en/ai/choose-your-path/quickstart-coding`.

Do not delete `/en/ai/get-started/quickstart`; leave it reachable for now.

- [ ] **Step 2: Add recipe-like next steps to the quickstart**

In both quickstart variants if both remain user-visible, make `Next steps` include clear recipe/task links:

```md
## Next steps

- [Start and stop an agent](../build/start-stop-agent.md)
- [Use presets](../build/presets.md)
- [Optimize latency](../best-practices/optimize-latency.md)
- [Audio setup](../best-practices/audio-setup.md)
- [REST API reference](../../api-reference/conversational-ai/rest-api/index.md)
```

Use the correct relative path per source file.

- [ ] **Step 3: Avoid renaming information architecture unless required**

Do not create `content/docs/en/ai/recipes/**` in this task. The current IA already has `Build` and `Best practices`; those are the recipe-like implementation pages. If product later insists on the visible word `Recipes`, handle it as a metadata/title pass after this journey is verified.

- [ ] **Step 4: Verify content links**

Run:

```bash
bunx vitest run src/lib/docs-journeys.test.ts
bun run docs:links
```

Expected: the Voice Agent journey test passes and no newly added links are missing.

## Task 5: Browser Validate The Two Journeys On Port 3000

**Files:**
- Read only unless browser validation exposes a bug

- [ ] **Step 1: Confirm the dev server**

The user has port 3000 open. Verify it responds:

```bash
curl -I http://127.0.0.1:3000/en/introduction
```

If it does not respond, ask the user before starting a new dev server because they explicitly said they opened port 3000.

- [ ] **Step 2: Validate Voice Agent journey**

Use browser automation against `http://127.0.0.1:3000`.

Path to verify:

1. `/en/introduction`
2. Click or directly inspect the link to `Voice agent quickstart`.
3. Land on `/en/ai/choose-your-path/quickstart-coding`.
4. Confirm the page exposes recipe/task links such as `Start and stop an agent`, `Use presets`, `Optimize latency`, or `Audio setup`.
5. Follow a recipe/task link.
6. Confirm that page exposes a reference link, or return to quickstart and follow `REST API reference`.
7. Land under `/en/api-reference/conversational-ai`.

Evidence to record:

- final URL
- visible H1
- the exact link labels found for quickstart, recipe/task, and reference
- browser console errors, if any

- [ ] **Step 3: Validate Realtime RTC journey**

Path to verify:

1. `/en/realtime-media`
2. Click `Voice & Video`.
3. Land on `/en/realtime-media/rtc`.
4. Click a quickstart link.
5. Confirm platform/version choices or Android API reference links are visible.
6. Follow `/en/api-reference/rtc/android`.
7. Open the version dropdown and confirm `v4.6.0` links to `/en/api-reference/rtc/android/4.6.0`.
8. Open `/en/api-reference/rtc/android/4.6.0` and confirm the page still shows the scoped Android navigation.

Evidence to record:

- final URL
- visible H1
- version dropdown labels
- browser console errors, if any

## Task 6: Final Verification And Commit

**Files:**
- All touched files

- [ ] **Step 1: Run focused verification**

Run:

```bash
bunx vitest run src/lib/docs-journeys.test.ts src/components/mdx.test.tsx src/lib/docs-nav-scope.test.ts src/lib/docs-page.server.test.ts
bun run docs:links
bun run types:check
git diff --check
```

Expected:

- Focused tests pass.
- New journey links are valid.
- Typecheck passes.
- Diff has no whitespace errors.

- [ ] **Step 2: Run build if time allows**

Run:

```bash
bun run build
```

Expected: build passes. If the dev server or OpenAPI asset fetch flakes, rerun once and record exact output.

- [ ] **Step 3: Commit**

Run:

```bash
git status --short
git add \
  src/lib/docs-journeys.test.ts \
  content/docs/en/introduction/index.mdx \
  content/docs/en/ai/index.md \
  content/docs/en/ai/get-started/quickstart.mdx \
  content/docs/en/ai/choose-your-path/quickstart-coding.mdx \
  content/docs/en/realtime-media/rtc/quick-start/build-from-scratch.md \
  content/docs/en/realtime-media/rtc/quick-start/integrate-with-ai-tools.md \
  content/docs/en/realtime-media/rtc/reference
git commit -m "fix: complete issue 24 docs journeys"
```

Do not include unrelated generated files unless `bun run types:check` updates required Fumadocs output and the repo normally tracks it.

## Acceptance Criteria

- From `/en/introduction`, a reader can reach the Voice Agent quickstart, then a recipe/task page, then Conversational AI API reference.
- From `/en/realtime-media`, a reader can reach RTC, then RTC quickstart, then RTC Android API reference.
- RTC Android API reference still exposes the version dropdown for current and `4.6.0`.
- English RTC `reference` folder exists because `rtc/meta.json` already lists it.
- Implementation uses Markdown/MDX and `meta.json`; no custom journey component or hard-coded shell logic is added.
- Existing MDX tabs/code styles and shadcn dropdown behavior do not regress.
