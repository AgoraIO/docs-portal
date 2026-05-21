# Legacy Casebook

## Admonitions And Callouts

Legacy:

```mdx
<Admonition type="info" title="信息">
内容
</Admonition>
```

Target:

```mdx
:::info[信息]
内容
:::
```

Map `caution` and `warning` to `warning`, `danger` to `error`, `tip` to `ok` or the project-approved success/tip type.

## Shared Imports

Legacy:

```mdx
import Resolution from '@shared/common/resolution.mdx';
import * as topic from '@shared/rtm2/_topic.mdx';
```

Target:

```mdx
<include>../_shared/resolution.mdx</include>
```

If the shared file depends on `props.*` or `frontMatter.*`, statically expand or split it before including.

## Platform Filters

Legacy:

```mdx
<PlatformFilter platformList={['android']}>
Android-only content
</PlatformFilter>
```

Target: place the content in the Android page or directory during migration. Do not keep runtime platform filters.

## Tables

Legacy `Table`, `Tr`, and `Td` should become GFM tables whenever possible.

Use native HTML `<table>` only for real row spans, column spans, or block-heavy cells that Markdown cannot represent clearly. Do not keep React table components.

## Images

Legacy:

```mdx
<Image src="/img/rtc/echotest.svg" alt="设备质量检测流程图" width="50%" />
```

Target default:

```md
![设备质量检测流程图](/img/rtc/echotest.svg)
```

If width, inline behavior, or captions matter and no standard exists, mark `needs-image-standard` instead of preserving `<Image>`.

## Anchors And Headings

Legacy:

```mdx
### <a name="majorrelease"></a>主要版本 (Major Release)
<H2 className="anchor index-api-login" id="login">login</H2>
```

Target:

```mdx
### 主要版本 (Major Release) {#majorrelease}
## login {#login}
```

If the target renderer cannot support heading IDs for a specific case, place a standalone anchor before the heading. Do not rely on auto-generated slugs when existing fragment links must remain stable.

## API Reference MDX

Legacy API UI components such as `ApiSectionCard`, `OverloadMethodCollapse`, `OverloadMethodCollapsePanel`, generated `H2/H3`, and API-specific table wrappers are not migrated as JSX.

Prefer upstream structured API sources. If no source exists, convert conservatively to headings, tables, definition lists, code fences, and directives. Drop search/TOC-only classes and keep stable IDs.

## RESTful And OpenAPI

Legacy custom renderers such as `RestfulRender` and `OpenapiRender` are not migrated.

Keep OpenAPI YAML/JSON as source and route it to the Fumadocs OpenAPI lane. Ordinary REST guides that are prose can be migrated as Markdown/directive content.

## Generated HTML API Docs

Generated `html-docs` from DITA, Doxygen, TypeDoc, AppleDoc, DocC, or similar systems are deferred. Record product, platform, generator hint, source path, and status in the report.

Do not iframe or static-dump generated HTML into the new portal unless explicitly approved as a temporary exception.

## Metadata JS

Legacy `_sidebar_.meta.*.js`, `_platforms_.meta.js`, `_products_.meta.js`, and `_usecase_.meta.js` are inputs only.

Convert useful order and labels into `meta.json` and static directory structure. Do not keep executable metadata or template replacement behavior.

`ag-html-autogen` becomes a generated API deferral marker.

## Landing Pages And Cards

Legacy landing/card components such as `ProductOverview`, `QuickStartCard`, `RecommendCard`, `HotArticleCard`, `LinkCardV2`, and Ant Design `Row`/`Col` should not remain in content.

Use Markdown lists, standard links, or a project-approved cards directive. Mark complex landing pages as `needs-landing-page-normalization`.
