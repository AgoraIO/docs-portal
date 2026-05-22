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

Platform differences belong in static content structure:

```text
content/docs/zh-CN/realtime-media/rtm2/android/...
content/docs/zh-CN/realtime-media/rtm2/ios/...
content/docs/zh-CN/realtime-media/rtm2/javascript/...
```

Do not keep `<PlatformFilter>` or equivalent runtime filtering. Code-language examples may use tabs/directives when they describe one conceptual page.

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
