# 中文 OpenAPI 暂缓修复链接清单

本清单记录 2026-07-21 明确暂缓处理的中文 OpenAPI 链接问题，后续恢复清理时从这里继续。

## 范围

- 源文件范围：`content/openapi/**/*.zh-CN.yaml`
- 当前 baseline：`docs/agents/reports/2026-07-17-openapi-zh-link-baseline.json`
- 暂缓总量：7 个分组，36 次 occurrence
- 暂缓原因：
  - `content/openapi/danmaku/danmaku.zh-CN.yaml` 当前明确不处理。
  - API Reference 迁移尚未完成，部分 `api-ref` 或 `/api-reference/` 目标页可能还不存在。

## 暂缓项

| # | 源文件 | 链接 | Audit 原因 | Occurrences | 行号 | 暂缓原因 | 后续处理建议 |
| ---: | --- | --- | --- | ---: | --- | --- | --- |
| 1 | `content/openapi/danmaku/danmaku.zh-CN.yaml` | `https://doc.shengwang.cn/api-ref/rtc/windows/API/toc_network#api_irtcengine_enableencryption` | `legacy-shengwang-doc-host` | 1 | 247 | Danmaku 文件当前明确不处理；该链接也属于 API Reference 内容。 | 恢复 Danmaku 清理后，如果新站已有 RTC Windows API Reference 等价路由，则替换为新站内链。 |
| 2 | `content/openapi/danmaku/danmaku.zh-CN.yaml` | `/zh-CN/realtime-media/danmaku/get-started/enable-service#获取开发参数` | `missing-internal-path` | 10 | 44, 96, 196, 310, 382, 453, 532, 720, 815, 868 | Danmaku 文件当前明确不处理。 | 找到或补齐当前 Danmaku enable-service 页面/锚点后，统一更新这些 App ID 引用。 |
| 3 | `content/openapi/danmaku/danmaku.zh-CN.yaml` | `/zh-CN/realtime-media/danmaku/response-code` | `missing-internal-path` | 2 | 31, 1004 | Danmaku 文件当前明确不处理。 | 找到或补齐当前 Danmaku 响应状态码页面后，更新两处引用。 |
| 4 | `content/openapi/danmaku/danmaku.zh-CN.yaml` | `/zh-CN/realtime-media/rtc/basic-features/token-authentication` | `missing-internal-path` | 2 | 241, 928 | Danmaku 文件当前明确不处理。 | 确认 Danmaku 应链接 RTC 通用 Token 文档还是 Danmaku 专属接入文档，再替换为当前路由。 |
| 5 | `content/openapi/danmaku/danmaku.zh-CN.yaml` | `/zh-CN/realtime-media/rtc/best-practice/rest-availability` | `missing-internal-path` | 10 | 40, 92, 192, 306, 378, 449, 528, 716, 811, 864 | Danmaku 文件当前明确不处理。 | 恢复 Danmaku 清理后，替换为当前 REST 服务高可用页面或 Danmaku 等价页面。 |
| 6 | `content/openapi/rtc/channel-management.zh-CN.yaml` | `/zh-CN/api-reference/response-code` | `missing-internal-path` | 9 | 129, 326, 453, 519, 639, 758, 859, 948, 1009 | API Reference 迁移尚未完成，目标页或 redirect 可能还不存在。 | API Reference 迁移补齐对应响应状态码页面/路由后再处理。 |
| 7 | `content/openapi/whiteboard/restful-wb.zh-CN.yaml` | `https://doc.shengwang.cn/api-ref/whiteboard/javascript/interfaces/displayer#screenshottocanvasasync` | `legacy-shengwang-doc-host` | 2 | 544, 610 | API Reference 迁移尚未完成，`api-ref` 内容可能还没有新站等价页。 | 新站有 `screenshotToCanvasAsync` 的白板 JavaScript API Reference 路由后替换；不要直接删除。 |

## 恢复处理时的验证命令

后续继续修复时建议先跑：

```bash
pnpm run docs:links:openapi-zh -- --max-samples=120
pnpm run docs:links:openapi-zh:baseline
```

继续修复前的当前预期 baseline 状态：

- `baselineEntries: 7`
- `invalidInternalLinks: 36`
- `legacyShengwangDocHostLinks: 3`
- `newOrIncreasedEntries: 0`
