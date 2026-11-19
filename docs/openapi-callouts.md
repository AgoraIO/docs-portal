# OpenAPI callout types

Use explicit severity metadata for documentation notices. Preserve their prose, links, lists and code; classify the notice when maintaining the source, rather than guessing severity from rendered words.

Operation and structured field notices use `x-docs-callouts` with a `type`. A notice that must stay inside a Markdown description uses an explicit blockquote marker:

```yaml
description: |-
  智能体在 RTC 频道内的用户 ID。

  > [!CAUTION]
  > 同一 `channel` 内的用户 ID 不可重复，否则智能体加入频道会失败。
```

| Marker | Meaning | Portal color / Chinese title |
| --- | --- | --- |
| `[!NOTE]` | Additional explanation | Blue / 说明 |
| `[!TIP]` | Recommendation | Green / 建议 |
| `[!CAUTION]` | Precaution or usage constraint | Orange / 注意 |
| `[!DANGER]` | Danger or error | Red / 危险 |

The renderer also supports INFO, SUCCESS, IMPORTANT, WARNING and ERROR. Their definitions live in `src/lib/openapi/remark-callouts.ts`; REST extension aliases live in the OpenAPI renderer. Existing explicit source types take precedence over wording such as “注意”.

Markers are consumed before rendering and apply to every locale. Untyped Chinese blockquotes remain readable as blue “说明” for compatibility, but maintained OpenAPI sources must declare their quote types; `remark-callouts.test.ts` checks the entire source collection. Ordinary English quotations remain quotations.

Use the existing [Markdown authoring standard](./agents/markdown-authoring-standard.md#callouts) for MDX guide callouts. Keep generated `public/openapi/**` assets out of commits.
