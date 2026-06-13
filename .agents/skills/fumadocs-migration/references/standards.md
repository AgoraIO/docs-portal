# Fumadocs Content Standards

## Priority

Use target formats in this order:

1. Markdown native: headings, links, images, lists, code fences, and GFM tables.
2. Markdown/MDX directives parsed by remark/rehype.
3. Fumadocs MDX native features, including include.
4. New approved runtime widgets only when static syntax cannot express the content.

Legacy JSX is not a target format.

## Callouts

Use directive syntax in content:

```mdx
:::info[一个核心心智模型]
可以把 Agora 理解成实时互动层：它把人、设备、媒体、消息和 AI 服务放进同一个持续在线的会话上下文里。
:::
```

The renderer may map this to `fumadocs-ui`, a local component, or another component. The content source remains directive-first.

## Shared Content

Use Fumadocs include for reusable content:

```mdx
<include>./_shared/token-authentication.mdx</include>
```

The included file must already follow these standards. Do not keep `@shared` imports, `props.*`, `frontMatter.ag_platform`, or old runtime variables.

## Frontmatter

Current portal schema allows:

```yaml
---
title: Optional title
description: Optional description
icon: optional-icon
full: false
_openapi: {}
---
```

Delete legacy build artifacts such as `displayed_sidebar`, `ag_product`, `ag_platform`, `ag_product_label`, `ag_usecase`, and `ag_file_path`.

## Platform Variants

Platform differences default to static content structure:

```text
content/docs/zh-CN/realtime-media/rtm2/android/...
content/docs/zh-CN/realtime-media/rtm2/ios/...
content/docs/zh-CN/realtime-media/rtm2/javascript/...
```

Do not keep `<PlatformFilter>` or equivalent runtime filtering.

Use the repo's platform content blocks when one page intentionally combines shared prose with repeated platform-specific sections:

```mdx
Shared setup note.

<PlatformStructured platform="android">
### Install on Android

Use Gradle to add the SDK.
</PlatformStructured>

<PlatformStructured platform="javascript">
### Install with JavaScript

Use npm to add the SDK.
</PlatformStructured>

Shared follow-up note.

<PlatformInline platform="android">
Use `./gradlew assemble`.
</PlatformInline>

<PlatformInline platform="javascript">
Use `npm run build`.
</PlatformInline>
```

Rules:

- `PlatformStructured` and `PlatformInline` must appear as consecutive top-level flow siblings.
- Each consecutive group must contain at least two platforms.
- Do not duplicate the same platform key inside one group.
- Nested platform blocks are not supported in v1.
- These blocks are for platform-body variants, not tiny code-language toggles.

Code-language examples may still use tabs/directives when they describe one conceptual page.

Small same-section variants should use the existing Fumadocs-compatible tabs:

```mdx
<Tabs defaultValue="android" groupId="platform" persist>
  ...
</Tabs>
```

Generated code tabs may use `tabGroup`, which maps to `CodeBlockTabs` with persistence:

````mdx
```kotlin tab="Android" tabGroup="platform"
```
````

Do not introduce custom `PlatformTabs` components for migrations.

## Navigation Scopes And Versions

Use `navScope` in `meta.json` when a product or platform folder needs independent left navigation:

```json
{
  "title": "RTC",
  "navScope": {},
  "pages": ["index", "android"]
}
```

If the scope is versioned, declare versions on the scope folder and keep the real page order inside each version folder:

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

For API references whose versions differ by platform, place versions under the platform:

```text
content/docs/en/api-reference/rtc/android/
  meta.json
  (current)/
    meta.json
    overview.mdx
  4.6.0/
    meta.json
    overview.mdx
```

Routes:

```text
/en/api-reference/rtc/android/overview
/en/api-reference/rtc/android/4.6.0/overview
```

Do not add relative `$schema` paths to JSON content files. Fumadocs validates `meta.json` through the repo-local schema configured in `source.config.ts`.

## OpenAPI

OpenAPI YAML/JSON is source data. Preserve it for the OpenAPI lane instead of flattening it into ad hoc Markdown.

Use this staging split:

```text
content/docs/**     Fumadocs MDX/page-tree content and meta files.
content/openapi/**  OpenAPI YAML/JSON source data.
```

Do not put OpenAPI YAML under `content/docs/**`; Fumadocs MDX scans `.yaml` files in that tree as metadata.

Endpoint pages are generated from OpenAPI by `operationId`. Do not generate full MDX shadow files for each endpoint. The first Conversational AI renderer uses only `convoai.yaml`; override MDX is a deferred contract, not a first-version feature.

Publish public `/openapi/**` assets from `content/openapi/**` with an automated build copy. Do not hand-maintain or commit `public/openapi/**` as source.

Use an OpenAPI endpoint registry overlay instead of merging generated endpoints into the Fumadocs `source` object. Route leaves are mapped from `operationId` once, and route, sidebar, locale links, search, llms, and prerender paths are derived from that registry.

Do not use `fumadocs-ui` or external OpenAPI UI packages as this portal's OpenAPI page renderer. Rendering must use local docs-shell components and produce static API references with fully expanded schema path rows. See `references/openapi-lane.md` for the full contract.

## Plugins

Allowed plugins serve the new standard: directive parsing, Fumadocs include, heading IDs, code highlighting, link normalization, and image path normalization.

Do not add `rehype-raw`, legacy component aliases, or Docusaurus variable shims just to compile old content.

## Verification

Minimum gate:

```bash
bun run types:check
```

This runs `fumadocs-mdx && tsc --noEmit`. Add:

```bash
bun run docs:links
bun run test
bun run build
```

when the migration touches links, routes, shared code, or build behavior.

For generated API reference migrations, expand verification with:

- Check that the rebuilt folder tree matches the legacy TOC hierarchy.
- Spot-check notes, definition lists, and return-value sections for broken inline flow or flattened nested bullets.
- Spot-check legacy `xref` links in notes and parameter descriptions to ensure they remain clickable.
- If the repo publishes OpenAPI assets, sync `content/openapi/**` to `public/openapi/**` before the final build so prerender can fetch `/openapi/**`.
