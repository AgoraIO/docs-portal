# Docs Shell Platform Content Discussion

Date: 2026-06-12
Repo: `docs-portal`
Related issue: `#62`

## Context

Issue `#62` currently contains four short bullets:

- compact left nav
- expand B group will collapse A group
- sub nav switch animation
- multi-platform tabs

The first three read as docs-shell navigation polish work.

The fourth item turned out to mean something more specific:

- not route-level platform switching
- not sidebar/nav-scope platform switching
- but a page-level platform selector for platform-specific content blocks inside the same document

## What is already clarified

### 1. Scope of item 3

`sub nav switch animation` should be interpreted broadly rather than narrowly.

It likely includes:

- nav group expand/collapse animation
- sub-nav scope switch animation where applicable
- platform/version switch transition behavior where applicable

So this should be treated as a general navigation interaction polish item, not just a single accordion animation.

### 2. Scope of item 4

The new platform component should control page-internal platform-specific content.

It should **not**:

- change route
- change sidebar scope
- act as the existing nav-scope version/platform tabs

It should:

- appear inside the document page
- sit near the top of the page content flow, below the title/toolbar area and before the relevant body content
- allow switching among platform-specific content variants within the same page
- persist the user’s selected platform across other platform-enabled pages

### 3. Persist behavior

The preference should be persisted globally, effectively as one site-wide platform preference.

Current leaning:

- one shared persisted key such as `platform`
- not per-product keys like `realtime-media-platform` vs `ai-platform`

Reason:

- simpler mental model
- matches the user expectation of “remember my last chosen platform when I visit another platform-enabled page”
- avoids early fragmentation unless product-line platform sets prove incompatible later

### 4. Authoring goal

The authoring model should feel content-native.

The user does **not** want authors to wrap content in explicit UI-first structures like:

```mdx
<Tabs>
  <Tab value="android">...</Tab>
  <Tab value="javascript">...</Tab>
</Tabs>
```

The preferred direction is:

- authors mark individual content blocks as belonging to a platform
- the renderer groups consecutive sibling blocks automatically
- the rendered result shows tabs inline in the document flow

That means the written MDX should describe content ownership, not UI chrome.

## Example the user proposed

The user suggested a shape like:

```mdx
---
title: test platform
description: test
---

# test platform

<article platform='android'> ... </article>

<article platform='javascript'> ... </article>

common content

<article platform='android'> ... </article>

<article platform='javascript'> ... </article>
```

Desired rendering:

- first platform pair becomes one tab group near the top of that content section
- common content renders normally
- second platform pair becomes another tab group later in the page
- neither group requires an explicit wrapper in authored MDX

## Design reaction to that idea

### What seems right about it

The underlying idea is strong:

- platform-specific blocks should look like normal body content
- grouping should be inferred from nearby sibling blocks
- authors should not write extra wrapper UI just to get tabs

### What seems risky about using raw `<article platform=\"...\">`

Using literal HTML `article` for this purpose is probably the wrong long-term contract.

Reasons:

- `article` has real semantic meaning unrelated to platform content
- it is ambiguous in MDX/AST transforms
- later linting, extraction, validation, and migration would be harder
- future contributors may use `article` normally and accidentally trigger platform logic

## Recommended direction so far

### Authoring primitive

Use a dedicated lightweight MDX component, for example:

```mdx
<PlatformContent platform="android">
  ...
</PlatformContent>

<PlatformContent platform="javascript">
  ...
</PlatformContent>
```

This preserves the “no explicit wrapper” goal while keeping the syntax explicit and machine-readable.

### Rendering rule

The renderer should scan page content for **consecutive sibling** `PlatformContent` nodes.

When it finds a consecutive run, it should:

1. collect those siblings into one implicit platform group
2. render a tab strip above that group
3. render only the active platform block for that group
4. leave non-platform content untouched

This gives the desired page flow:

- tabs appear inline where relevant
- common content stays between platform groups
- authors do not manually declare group containers

### Grouping rule

Recommended rule:

- only group **consecutive siblings**

Not recommended:

- implicitly pairing separated platform blocks across unrelated content

Reason:

- consecutive grouping is predictable
- easier to explain to authors
- easier to lint and debug
- avoids surprising merges across normal prose

### Persistence rule

Recommended behavior:

- all platform groups read the same persisted platform preference
- each group shows only the platforms that actually exist in that group
- if the persisted platform is unavailable in the current group, fall back to the first available platform for that group

Example:

- persisted preference is `android`
- current group only has `ios` and `javascript`
- current group should default to its first available supported option instead of showing empty content

## Strong recommendation on i18n and keys

The user mentioned that platform key/i18n maintenance could live “on the MDX side”.

Current recommendation is **not** to do that.

Instead:

- MDX should only store canonical platform keys such as `android`, `ios`, `javascript`, `flutter`
- the portal should own a platform registry that maps:
  - key
  - localized label
  - ordering
  - optional icon metadata

Reasons:

- avoids repeated translation drift in content files
- keeps labels consistent across locales and pages
- makes sorting and future icon support easier
- separates content meaning from UI presentation

## Reuse strategy

The component should probably reuse the existing tabs primitive or a headless-tabs-like foundation.

Current preference:

- reuse existing `Tabs` behavior where practical
- wrap it in a dedicated platform abstraction rather than exposing generic tabs directly to authors

That means the final implementation can still be built from:

- current tabs primitive
- a small platform registry
- a content grouping layer

But the authoring contract stays platform-specific, not generic-tab-specific.

## Likely architecture

High-level architecture under discussion:

1. `PlatformContent` MDX component or marker node
2. content transform/grouping layer that detects consecutive sibling platform blocks
3. `PlatformTabsGroup` renderer used internally by the docs page
4. shared persisted platform state hook/store
5. platform registry for labels, order, and optional icons

## Open questions still worth discussing

### 1. Component name / syntax

Candidate syntax:

```mdx
<PlatformContent platform="android">...</PlatformContent>
```

Open question:

- should the author-facing name be `PlatformContent`
- or something shorter like `Platform`
- or a directive-based syntax instead of JSX

### 2. Allowed platforms

Need to decide:

- do we allow any arbitrary string key
- or validate against a fixed registry and surface authoring errors early

Current leaning:

- validate against a known registry

### 3. Where grouping happens

Need to decide:

- runtime React child scanning
- MDX compile-time transform
- remark/rehype plugin phase

No final choice yet.

### 4. Nested support

Need to decide whether platform blocks are only allowed at top-level page flow positions, or whether they may appear inside:

- list items
- callouts
- tab panels
- accordions

This matters a lot for implementation complexity.

### 5. SSR and hydration behavior

Need to decide:

- whether the initial server render should respect the persisted client value
- or always render a deterministic default and then hydrate to persisted preference on the client

### 6. Relationship to existing nav-scope platform tabs

Need to document clearly:

- this new page-internal platform selector is not the same thing as the current nav-scope platform/version tabs
- both may coexist in the same product area
- naming and placement must avoid user confusion

## Current recommendation to take forward

If continuing this design, the strongest current proposal is:

- create a dedicated page-level platform content system
- use explicit per-block platform markers such as `PlatformContent`
- automatically group consecutive sibling blocks into implicit tab groups
- persist one global platform preference
- keep platform keys in MDX and labels/i18n in a portal-owned registry
- build the UI on top of the existing tabs primitive, but do not expose raw generic tabs as the authoring API

## Short summary for review

The main design move is:

- treat platform as a lightweight content annotation, not a wrapper-driven UI structure

The main implementation caution is:

- avoid overloading native HTML tags like `article`

The main unresolved area is:

- exactly where the grouping/transform should happen and how strict the allowed authoring surface should be
