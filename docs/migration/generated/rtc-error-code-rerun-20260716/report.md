# Legacy Docs Migration Sample Report

- Source root: `/Users/yangyixuan/Documents/GitHub/shengwang-doc-source`
- Output: `/Users/yangyixuan/Documents/GitHub/docs-portal-cn-newdoc-preview-20260716/docs/migration/generated/rtc-error-code-rerun-20260716`
- Path map: `/Users/yangyixuan/Documents/GitHub/docs-portal-cn-newdoc-preview-20260716/docs/migration/path-map.csv`
- Component map: `/Users/yangyixuan/Documents/GitHub/docs-portal-cn-newdoc-preview-20260716/docs/migration/component-map.yaml` (99 known components)

## Counts

| Status | Count |
| --- | ---: |
| needs_review | 4 |

## Component Usage

| Name | Family | Target | Status | Count |
| --- | --- | --- | --- | ---: |
| `Td` |  | `gfm-table-or-slot-table` | `automated-with-review` | 320 |
| `Tr` |  | `gfm-table-or-slot-table` | `automated-with-review` | 132 |
| `Table` |  | `gfm-table-or-slot-table` | `automated-with-review` | 16 |
| `Admonition` |  | `directive-callout` | `automated` | 6 |

## Syntax Pattern Usage

| Name | Target | Status | Count |
| --- | --- | --- | ---: |
| `rawHtml` | `markdown-native-or-slot` | `automated-with-review` | 3 |
| `tableHeaderExport` | `gfm-table-header` | `automated` | 3 |
| `sharedImports` | `include-or-static-expand` | `automated-with-review` | 2 |
| `runtimeVariables` | `static-evaluate-before-write` | `automated-with-review` | 1 |

## 引用检查

| 文档 | 内容 |
| --- | --- |
| `docs/rtc/error-code.javascript.mdx` | 断链 10: `/api-ref/rtc/javascript/interfaces/iagorartcclient#setclientrole`, `/api-ref/rtc/javascript/interfaces/iagorartcclient#startLiveStreaming`, `/api-ref/rtc/javascript/interfaces/iagorartcclient#stopLiveStreaming` 等 7 项 |

## Files

| Source | Platform | Target | Status | Issues | Components | Syntax patterns | Shared dependencies |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `docs/rtc/error-code.mdx` |  | `content/docs/zh-CN/realtime-media/rtc/reference/error-code.mdx` | needs_review | `normalized-html-table`<br />`normalized-table-header:tableHeaderWidth`<br />`normalized-table-slot`<br />`normalized-table-header:TableHeader0b37lwwa1m`<br />`normalized-table-header:TableHeadersnf9g824n8`<br />`normalized-table-header:TableHeaderhn9jo4kh6l` | `Td (86)`<br />`Tr (43)`<br />`Table (4)`<br />`Admonition (3)` | `rawHtml (1)`<br />`runtimeVariables (1)`<br />`sharedImports (1)`<br />`tableHeaderExport (1)` | `docs/shared/rtc/error-code.mdx` |
| `docs/rtc/error-code.javascript.mdx` | `javascript` | `content/docs/zh-CN/realtime-media/rtc/reference/error-code.mdx` | needs_review | `normalized-html-table`<br />`normalized-table-header:TableHeader24cvz65ipq`<br />`normalized-table-header:TableHeader09wm8m6er8`<br />`normalized-table-header:TableHeaderrkz9mhya1q`<br />`normalized-table-header:TableHeaderxb3xa3biys`<br />`normalized-table-header:TableHeadern1t68jgqa9`<br />`normalized-table-header:TableHeader3sr3k79ske`<br />`normalized-table-header:TableHeadercw27gsdgm1`<br />`normalized-table-header:TableHeaderkbk1p7aglx`<br />`normalized-table-header:TableHeaderg6cxztzwco`<br />`normalized-table-header:TableHeadera1b4v4uu5n`<br />`断链:10` | `Td (133)`<br />`Tr (46)`<br />`Table (10)` | `rawHtml (1)`<br />`tableHeaderExport (1)` |  |
| `docs/rtc/error-code.mini-program.mdx` | `mini-program` | `content/docs/zh-CN/realtime-media/rtc/reference/error-code.mdx` | needs_review | `normalized-html-table`<br />`normalized-table-header:TableHeaderdgethlfze5`<br />`normalized-table-slot` | `Td (45)`<br />`Tr (15)`<br />`Table (1)` | `tableHeaderExport (1)` |  |
| `docs/rtc-server-sdk/error-code.mdx` |  | `content/docs/zh-CN/realtime-media/rtc-server-sdk/reference/error-code.mdx` | needs_review | `normalized-html-table`<br />`normalized-table-header:tableHeaderWidth`<br />`normalized-table-slot` | `Td (56)`<br />`Tr (28)`<br />`Admonition (3)`<br />`Table (1)` | `rawHtml (1)`<br />`sharedImports (1)` | `docs/shared/rtc-server-sdk/error-code.mdx` |

