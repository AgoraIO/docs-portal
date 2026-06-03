# Nav Scope And Versioned API Reference Design

## Context

The current `main` branch now includes RTC Android API reference content under `content/docs/{en,zh-CN}/api-reference/rtc/android/**`. This content is a real Fumadocs content tree, not an OpenAPI lane and not a legacy redirect. It is deep enough that exposing it directly in the `api-reference` tab sidebar would overwhelm the tab-level navigation.

Earlier sidebar work introduced hard-coded scoped navigation for AI device-kit content and changed shared sidebar item styling. That made product-specific behavior leak into the docs shell and contributed to broken left-nav styling. The replacement should keep the independent navigation capability, but express it through metadata and Fumadocs page-tree data instead of product-specific code.

## Goals

- Support independent left navigation scopes using Fumadocs `meta.json`.
- Support versioned API reference navigation with clean current-version URLs.
- Use the newly imported RTC Android API reference as the first real versioned sample.
- Preserve Fumadocs route-group behavior instead of altering the MDX compile lifecycle.
- Restore sidebar styling to a stable general-purpose baseline, with only narrow API-reference affordances where needed.
- Update the Fumadocs migration skill so future API reference imports follow the same structure.

## Non-Goals

- Do not build a global product/platform/version registry.
- Do not hard-code RTC, Android, AI, or device-kit as special sidebar products.
- Do not add JSON `$schema` links to `meta.json` files in this round.
- Do not solve search or `llms-full.txt` duplicate-version indexing in this round.
- Do not migrate other RTC API reference platforms yet.

## Metadata Model

Extend the standard Fumadocs meta schema with a lightweight optional `navScope` field:

```json
{
  "title": "Android API Reference",
  "navScope": {
    "defaultVersion": "current",
    "versions": [
      { "id": "current", "label": "v4.6.2", "path": "(current)" },
      { "id": "4.6.0", "label": "v4.6.0", "path": "4.6.0" }
    ]
  },
  "pages": ["(current)", "4.6.0"]
}
```

`navScope` exists means the folder starts an independent navigation scope. If `versions` is absent, the scope is not versioned. If `versions` is present, the scope is versioned. There is no `type` field; the folder location defines whether the scope is product-level, platform-level, or another future shape.

Schema extension belongs in a small repo-local TypeScript file, then `source.config.ts` should pass it through `defineDocs({ meta: { schema } })`. JSON files do not import this schema. Fumadocs validates them at build time.

## Content Structure

Move the current RTC Android API reference into the current route group and duplicate it for one previous version:

```text
content/docs/en/api-reference/rtc/android/
  meta.json
  (current)/
    meta.json
    index.mdx
    overview.mdx
    audio/...
  4.6.0/
    meta.json
    index.mdx
    overview.mdx
    audio/...
```

Repeat the same structure for `zh-CN`.

Current version URL examples:

```text
/en/api-reference/rtc/android
/en/api-reference/rtc/android/overview
/en/api-reference/rtc/android/audio/audio-basic
```

Previous version URL examples:

```text
/en/api-reference/rtc/android/4.6.0
/en/api-reference/rtc/android/4.6.0/overview
/en/api-reference/rtc/android/4.6.0/audio/audio-basic
```

The top-level `android/index.mdx` should not remain beside `(current)/index.mdx`, because both would resolve to the same clean URL. The `android` folder itself is a navigation scope container.

## Navigation Behavior

When rendering tab-level sidebars, a folder with `navScope` is compressed to a single page-like entry. Its href should point to the folder index or first available scoped page. This prevents huge product or API reference trees from leaking into the parent tab sidebar.

When rendering a page inside a `navScope`, use the nearest ancestor `navScope`. Nested scopes are allowed. For example:

```text
api-reference/rtc              navScope
api-reference/rtc/android      navScope with versions
```

On Android API reference pages, the Android scope wins because it is the nearest scope.

For a versioned scope, the scoped sidebar displays only the active version folder's contents. It does not display the version folder list itself. Current-version pages use the `(current)` folder while keeping clean URLs.

Back links follow this rule:

- If there is a parent `navScope`, link back to that scope.
- Otherwise link back to the tab root.

Version switching follows this rule:

- Try the same relative path in the target version.
- If the target version does not have that page, use the target version folder's first available page, usually `index` or `overview`.
- Switching to current removes the version URL segment.

Prev/next navigation and breadcrumbs should be scoped to the active `navScope` and active version folder. They should not cross from current to `4.6.0` or from a scoped API reference tree back into the full tab tree.

## UI Behavior

The existing sidebar header should carry scoped navigation details. Extend the header payload with an optional version switcher:

```ts
{
  backHref: "/en/api-reference/rtc",
  backLabel: "RTC",
  title: "Android API Reference",
  versionSwitcher: {
    currentId: "current",
    versions: [
      { id: "current", label: "v4.6.2", href: "/en/api-reference/rtc/android/overview" },
      { id: "4.6.0", label: "v4.6.0", href: "/en/api-reference/rtc/android/4.6.0/overview" }
    ]
  }
}
```

Use the existing `Popover`, `Button`, and icon primitives for the version selector. Do not add a new design system dependency. The selector appears in both desktop and mobile sidebar headers. If a scope has no `versions`, no selector is shown.

The sidebar item style should return to a stable general-purpose layout. Product-specific title overrides and AI-specific sidebar transforms should be removed or replaced with metadata-driven behavior. Long API reference labels may retain narrow wrapping behavior, but that behavior should be based on API/reference characteristics, not product names.

## Platform Tabs

Platform differences in guide pages should use Fumadocs-compatible tabs, not a custom `PlatformTabs` component. Enhance existing `Tabs` and `CodeBlockTabs` wrappers to support `persist` and `groupId`, matching Fumadocs code tab semantics.

Supported examples:

```mdx
<Tabs defaultValue="android" groupId="platform" persist>
  ...
</Tabs>
```

and generated code tabs:

````mdx
```kotlin tab="Android" tabGroup="platform"
```
````

This is separate from API reference platform folders such as `api-reference/rtc/android`, where platform is part of the information architecture.

## Skill Updates

Update `.agents/skills/fumadocs-migration` so future migrations follow this model:

- Product or platform folders can declare `navScope`.
- API reference versions live under the relevant platform folder when versions differ by platform.
- Current version should use `(current)` when clean URLs are required.
- The scope folder lists version folders in `pages`; the version folder owns the real sidebar page order.
- Platform tabs with `persist` and `groupId` are preferred for same-page guide variants.
- Runtime platform filters and custom Docusaurus metadata remain disallowed.

## Verification

Minimum verification after implementation:

- `bun run types:check`
- Targeted tests for meta schema, scope detection, sidebar compression, version URL mapping, scoped breadcrumbs, and prev/next behavior.
- Component tests for sidebar header version selector in desktop/mobile sidebar contexts.
- A focused build or route smoke check for:
  - `/en/api-reference/rtc/android/overview`
  - `/en/api-reference/rtc/android/4.6.0/overview`
  - `/zh-CN/api-reference/rtc/android/overview`
  - `/zh-CN/api-reference/rtc/android/4.6.0/overview`

Search and `llms-full.txt` may include duplicate current and `4.6.0` content in this round. That is acceptable for the version-navigation test fixture.
