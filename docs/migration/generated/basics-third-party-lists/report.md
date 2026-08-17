# Legacy Docs Migration Sample Report

- Source root: `/Users/yejiayi/Documents/shengwang-doc-source`
- Output: `/Users/yejiayi/.config/superpowers/worktrees/docs-portal/migrate-third-party-compliance-pages/docs/migration/generated/basics-third-party-lists`
- Path map: `/Users/yejiayi/.config/superpowers/worktrees/docs-portal/migrate-third-party-compliance-pages/docs/migration/path-map.csv`
- Component map: `/Users/yejiayi/.config/superpowers/worktrees/docs-portal/migrate-third-party-compliance-pages/docs/migration/component-map.yaml` (99 known components)

## Counts

| Status | Count |
| --- | ---: |
| needs_review | 2 |

## Component Usage

| Name | Family | Target | Status | Count |
| --- | --- | --- | --- | ---: |
| `Td` |  | `gfm-table-or-slot-table` | `automated-with-review` | 77 |
| `Tr` |  | `gfm-table-or-slot-table` | `automated-with-review` | 11 |
| `Table` |  | `gfm-table-or-slot-table` | `automated-with-review` | 3 |

## Syntax Pattern Usage

| Name | Target | Status | Count |
| --- | --- | --- | ---: |
| `rawHtml` | `markdown-native-or-slot` | `automated-with-review` | 2 |

## Files

| Source | Platform | Target | Status | Issues | Components | Syntax patterns | Shared dependencies |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `docs-basics/security/flexible-classroom-sdk-third-party.mdx` |  | `content/docs/zh-CN/introduction/security/sdk-compliance/flexible-classroom-sdk-third-party.mdx` | needs_review | `normalized-html-table`<br />`normalized-table-header:flexibleClassroomAndroidThirdPartyTable`<br />`normalized-table-header:flexibleClassroomIosThirdPartyTable` | `Td (56)`<br />`Tr (8)`<br />`Table (2)` | `rawHtml (1)` |  |
| `docs-basics/security/speech-to-text-third-party.mdx` |  | `content/docs/zh-CN/realtime-media/speech-to-text/reference/third-party-services.mdx` | needs_review | `normalized-html-table`<br />`normalized-table-header:speechToTextThirdPartyTable` | `Td (21)`<br />`Tr (3)`<br />`Table (1)` | `rawHtml (1)` |  |
