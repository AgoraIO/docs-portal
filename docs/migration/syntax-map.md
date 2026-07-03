# Migration Syntax Map

This file is the old-to-new syntax dictionary for migration. It answers: "When legacy content uses this syntax or component, what should the target docs-portal content use instead?"

Do not use this file for per-page progress, path choices, or human IA decisions. Put progress in `migration-ledger.csv`, addresses in `path-map.csv`, and approved decisions in `decisions.md`.

The machine-readable companion is `component-map.yaml`. Migration scripts should load that file for component names, automation status, review flags, component families, and false-positive patterns. This Markdown file explains the same contract for humans.

## How To Use This Map

1. Scan the source item for legacy syntax and components.
2. Record the found patterns in the ledger row's `legacy_syntax` field.
3. Apply the matching target pattern from this file.
4. If no mapping exists, add a proposed mapping here only when it is reusable. Otherwise mark the ledger row `blocked` or `needs_review`.
5. If the mapping requires human judgment, record the final decision in `decisions.md` and reference it from the ledger row.

## Summary Table

| Legacy Pattern | Target Pattern | Batchable | Risk | Notes |
| --- | --- | --- | --- | --- |
| `<Admonition>` | Directive callout fences | yes | low | Map old types to approved callout types. |
| Docusaurus `Tabs` / `TabItem` | Code fence tabs or approved MDX tabs | partial | medium | Choose based on whether panes contain only code or mixed content. |
| `<PlatformFilter>` and platform wrappers | Separate files/folders or `PlatformStructured` / `PlatformInline` | partial | high | Requires platform grouping judgment. |
| `@shared` imports | Approved include files or static expansion | partial | high | Resolve nested dependencies before final migration. |
| Legacy `<Image>` | Markdown image syntax | partial | medium | Width/caption cases may need a standard or review. |
| `Table` / `Tr` / `Td` | GFM tables or table `Slot` pattern | partial | medium | Rowspan/colspan/block cells need review. |
| JSX heading or anchor tags | Stable heading IDs or compatibility anchors | partial | medium | Preserve existing fragment links. |
| `<Detail>` | Existing `Accordions` / `Accordion` | partial | medium | Preserve heading text and anchors inside the expanded body. |
| `Row` / `Col` plus `LinkCardV2` or card families | Existing `Cards` / `Card`, Markdown links, or lists | partial | high | Remove layout wrappers; choose cards only for real navigation groups. |
| Release-note components | Markdown heading hierarchy | yes | low | `VersionSection` -> `##`, `VersionTitle` -> `###`, `ListTitle` -> `####`; drop `icon`. |
| Landing/card components | Markdown links, lists, or approved overview components | no | high | Needs IA and design judgment. |
| API reference JSX components | Structured API source, generated-reference conversion, or conservative MDX | partial | high | Do not preserve API UI JSX. |
| `RestfulRender` / `OpenapiRender` | OpenAPI lane | partial | high | Keep YAML/JSON under `content/openapi/**`. |
| `html-docs/**` generated HTML | Fumadocs folders, `meta.json`, and MDX pages | partial | high | Direct migration, not iframe/static dump. |
| Legacy metadata JS | `meta.json` and static directory structure | partial | medium | Preserve order and labels, not executable JS. |
| Legacy frontmatter fields | Allowed current frontmatter only | yes | low | Remove build-injected legacy fields. |

## Callouts

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

Rules:

- Use only `note`, `info`, `tip`, `warning`, and `error`.
- Map `caution` and `warning` to `warning`.
- Map `danger` to `error`.
- Do not leave nested or four-colon callouts unless the authoring standard is updated.

## Tabs

Legacy:

```mdx
<Tabs>
  <TabItem value="npm" label="npm">
    npm install package
  </TabItem>
  <TabItem value="yarn" label="yarn">
    yarn add package
  </TabItem>
</Tabs>
```

Target for code-only alternatives:

````mdx
```bash tab="npm" tabGroup="package-manager"
npm install package
```

```bash tab="yarn" tabGroup="package-manager"
yarn add package
```
````

Target for mixed prose panes: use approved MDX `Tabs`, `TabsList`, `TabsTrigger`, and `TabsContent` exactly as described in `docs/agents/markdown-authoring-standard.md`.

Rules:

- Use code fence tabs for small code/example alternatives.
- Use MDX tabs only when panes contain prose, lists, images, or multiple code fences.
- Do not invent `CodeTabs`, `PlatformTabs`, or Docusaurus `TabItem` syntax.

## Details And Accordions

Legacy:

```mdx
<Detail title="错误码说明">
内容
</Detail>
```

Target:

```mdx
<Accordions>
<Accordion title="错误码说明">

内容

</Accordion>
</Accordions>
```

Rules:

- Use the existing `Accordions` and `Accordion` primitives.
- Preserve headings, anchors, lists, and code blocks inside the expanded body.
- If the old detail block is only hiding optional reference detail, review the target information architecture before collapsing a large section.

## Release Notes

Legacy examples:

- `VersionSection`
- `VersionTitle`
- `ListTitle`

Target:

```md
## v1.2.3

### 新增功能

#### iOS
```

Rules:

- Convert `VersionSection` to a level-2 Markdown heading.
- Convert `VersionTitle` to a level-3 Markdown heading.
- Convert `ListTitle` to a level-4 Markdown heading.
- Drop decorative props such as `icon`.
- Keep version/date text, section order, lists, and anchors.
- Do not introduce release-note runtime components.

## Platform Variants

Legacy:

```mdx
<PlatformFilter platformList={['android']}>
Android-only content
</PlatformFilter>
```

Target options:

| Source Shape | Target |
| --- | --- |
| Whole page differs by platform | Separate platform files or folders. |
| Source IA is already split by platform | Preserve static platform route structure. |
| One page mixes shared prose with repeated platform sections | Consecutive top-level `PlatformStructured` or `PlatformInline` blocks. |
| Small language or package-manager code alternatives | Code fence tabs, not platform blocks. |

Rules:

- Platform blocks must be top-level page flow.
- Do not nest platform blocks in lists, callouts, tables, tabs, or other platform blocks.
- Do not duplicate the same platform key inside one consecutive group.
- If grouping is unclear, mark the ledger row `needs_review`.

## Shared Content

Legacy:

```mdx
import Resolution from '@shared/common/resolution.mdx';

<Resolution />
```

Target:

```mdx
<include>../_shared/resolution.mdx</include>
```

Or statically expand the shared content when the shared file is source-specific, product-specific, or depends on runtime props.

Rules:

- Resolve multi-layer shared chains before marking the page `done`.
- Do not keep `@shared`, `@docs/shared`, `props.*`, `frontMatter.*`, or legacy runtime variables in final content.
- Record every shared dependency chain in the ledger or a dedicated audit report when it affects migration risk.

## Images

Legacy:

```mdx
<Image src="https://assets-docs.agora.io/img/rtc/echotest.svg" alt="设备质量检测流程图" width="50%" />
```

Target default:

```md
![设备质量检测流程图](https://assets-docs.agora.io/img/rtc/echotest.svg)
```

Rules:

- Use Markdown image syntax when possible.
- Preserve useful alt text.
- If width, caption, inline placement, or sizing is content-critical, mark `needs-image-standard` or `needs_review`.

## Tables And Table Slots

Legacy:

```mdx
<Table>
  <Tr>
    <Td>参数</Td>
    <Td>说明</Td>
  </Tr>
</Table>
```

Target:

```md
| 参数 | 说明 |
| --- | --- |
| appId | 项目 App ID。 |
```

Target for a table cell that must preserve block content:

```mdx
| 参数 | 说明 |
| --- | --- |
| options | <Slot name="options" /> |

<Slot for="options">

- aaa
- bbb

</Slot>
```

Rules:

- Prefer GFM tables.
- Use the approved table `Slot` pattern when a table cell needs lists, callouts, code fences, or multiple paragraphs and the tabular shape must be preserved.
- Put `<Slot for="...">` immediately after the table that references it.
- Use native HTML `<table>` only for real row spans or column spans that Markdown and Slot cannot represent clearly.
- Do not preserve React table components.

## Anchors And Headings

Legacy:

```mdx
### <a name="majorrelease"></a>主要版本
<H2 className="anchor index-api-login" id="login">login</H2>
```

Target options:

```mdx
### 主要版本 {#majorrelease}
## login {#login}
```

Or, when heading IDs are not accepted for a specific route:

```mdx
<a id="login"></a>

## login
```

Rules:

- Preserve stable fragment IDs used by legacy links.
- Do not rely on auto-generated slugs when old anchors are externally reachable.
- Escape MDX-sensitive literal `<`, `>`, `{`, and `}` outside code spans or code fences.

## Landing And Card Components

Legacy examples:

- `ProductOverview`
- `QuickStartCard`
- `RecommendCard`
- `HotArticleCard`
- `LinkCardV2`
- Ant Design `Row` / `Col`

Target:

- Markdown lists and links for simple navigation.
- Existing `Cards` / `Card` primitives only for real navigation card groups.
- Approved overview components only when the target repository already uses them for that page type.
- A dedicated design/IA decision for complex landing pages.

Rules:

- Do not leave marketing/card JSX in content.
- Remove `Row` and `Col` when they only provide visual layout around card components.
- Do not turn a source page into a short summary unless the ledger action is `rewrite` and review accepts it.

## API Reference JSX

Legacy examples:

- `ApiSectionCard`
- `OverloadMethodCollapse`
- `OverloadMethodCollapsePanel`
- generated `H2` / `H3`
- `Glossary`
- `Status`
- `Stateitem`
- API-specific table wrappers
- `RestfulRender`
- `OpenapiRender`

Target:

- Prefer upstream structured API or OpenAPI source.
- For OpenAPI YAML/JSON, use the OpenAPI lane under `content/openapi/**`.
- For generated HTML API references, convert `html-docs/**` into Fumadocs folders, `meta.json`, and MDX pages.
- If no structured source exists, convert conservatively to headings, tables, definition lists, code fences, and directives.

Rules:

- Do not keep legacy API UI JSX.
- Treat `H2`, `H3`, `Glossary`, `Status`, and `Stateitem` as content syntax or generated-reference migration work, not as JS-to-MDX runtime components.
- Preserve stable IDs, inline links, code spans, notes, parameter tables, return values, related references, and nested lists.
- Treat non-code inline HTML as MDX-unsafe until normalized.

## Metadata And Frontmatter

Legacy inputs:

- `_sidebar_.meta.*.js`
- `_platforms_.meta.js`
- `_products_.meta.js`
- `_usecase_.meta.js`
- `_category_.json`
- legacy frontmatter fields such as `displayed_sidebar`, `ag_product`, `ag_platform`, `ag_usecase`, and `ag_file_path`

Target:

- `meta.json` for labels, order, `navScope`, and version structure.
- Current allowed frontmatter only.

Rules:

- Convert useful order and labels into static metadata.
- Do not migrate executable metadata or template replacement behavior.
- Do not add relative JSON `$schema` paths to migrated `meta.json` files.
