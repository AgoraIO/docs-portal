# 新旧文档站替换后的数据指标观察方案

## 目标

旧站替换为 docs-portal 后，分别获取旧站和新站的同口径数据，供后续 AI 读取并写入飞书表格。PostHog 中不创建新旧对比 Dashboard；两边保留独立数据，通过统一的指标定义、事件字段和时间口径进行比较。

本方案以当前旧站的两个 PostHog Dashboard 为基准：

- `356588`：文档站流量数据
- `380966`：文档站搜索数据

旧站数据主要来自 `https://doc.shengwang.cn`，项目为 `142880`。

## 当前状态与前置问题

docs-portal 已经实现了结构化的页面、搜索和交互事件，主要代码位于 [`src/lib/analytics/posthog.ts`](/Users/yejiayi/Documents/docs-portal/src/lib/analytics/posthog.ts)。当前事件包括：

- `docs_page_viewed`
- `docs_page_not_found`
- `docs_search_opened`
- `docs_search_completed`
- `docs_search_query_finalized`
- `docs_search_results_impressed`
- `docs_search_result_clicked`
- `docs_search_landing_engaged`
- `docs_code_copied`
- `docs_code_tab_changed`
- `docs_toc_clicked`
- `docs_platform_changed`
- `docs_link_clicked`
- `docs_page_feedback`
- `docs_journey_step`

当前最大的缺口是 `captureStructuredDocsEvent` 对非英文事件直接返回。若本次替换目标是旧 `doc.shengwang.cn` 中文站和新 docs-portal 的 zh-CN 站，必须先放行 zh-CN，否则新站无法产生可比较的结构化指标。

此外，生产部署需要稳定注入 `VITE_DEPLOY_VERSION`，并为事件增加明确的 `site_id` 或 `site_version`，以区分：

- `legacy-docs`
- `docs-portal`

## 统一数据口径

所有新旧数据都应使用以下口径：

- 时区：`Asia/Singapore`
- 测试账号过滤：沿用旧 Dashboard 的过滤规则
- 时间范围：查询时明确写入起止日期，不依赖 Dashboard 的相对时间默认值
- 访问量：区分 Pageview、Session 和结果点击，不混用三者
- 站点：使用 `site_id` 区分旧站和新站
- 语言：使用 `locale` / `docs_locale` 区分 `zh-CN` 和 `en`
- 版本：使用 `deploy_version` 记录新站发布版本

建议所有结构化事件包含以下公共字段：

| 字段 | 用途 |
| --- | --- |
| `site_id` | 区分 `legacy-docs` 和 `docs-portal` |
| `locale` / `docs_locale` | 区分站点语言 |
| `docs_environment` | 区分 preview、production |
| `deploy_version` | 标识具体发布版本 |
| `docs_pathname` | 文档路径 |
| `content_id` | 稳定的内容 ID |
| `product` | 规范化产品分类 |
| `page_type` | 页面类型，如 API、FAQ、教程 |
| `platform` | Android、iOS、Web 等平台 |

## 流量指标映射

| 需要观察的指标 | docs-portal 埋点 | 旧 Dashboard 指标 | 指标定义 |
| --- | --- | --- | --- |
| 总 Pageview | `$pageview`、`docs_page_viewed` | PageView 曲线图 | 指定时间范围内的页面访问总数，建议以 `$pageview` 保持与旧站直接对齐，以 `docs_page_viewed` 提供页面维度 |
| 独立 Session | `docs_page_viewed` | 搜索使用率分母 | 按 `$session_id` 去重，用作搜索使用率和点击率的分母 |
| 产品访问量 | `docs_page_viewed` | 产品点击排行 | 按 `product` 或 `docs_product` 聚合 Pageview |
| 场景访问量 | `docs_page_viewed` | 场景点击排行 | 按统一后的场景分类聚合 Pageview |
| Top 50 文档 | `docs_page_viewed` | Top50 浏览文档 | 按 `pathname`、`content_id` 或 `title` 聚合 Pageview |
| RESTful API 排行 | `docs_page_viewed` | RESTful API 浏览排行 | 过滤 `page_type = sdk-api-reference` 后按产品或路径聚合 |
| FAQ 排行 | `docs_page_viewed` | Top50 浏览 FAQ | 过滤 `page_type = faq-troubleshooting` 后按路径聚合 |
| ConvoAI 文档排行 | `docs_page_viewed` | ConvoAI Top50 浏览文档 | 过滤对应 ConvoAI 产品后按文档路径聚合 |
| 404 数量 | `docs_page_not_found` | 旧 Dashboard 未覆盖 | 统计 404 总数、404 率和 Top404 路径，作为迁移质量指标 |

## 搜索指标映射

| 需要观察的指标 | docs-portal 埋点 | 旧 Dashboard 指标 | 指标定义 |
| --- | --- | --- | --- |
| 搜索打开率 | `docs_search_opened` | 搜索整体使用率 | 去重搜索 Session 数 / 去重站点 Session 数 |
| 搜索完成率 | `docs_search_completed` | 旧站搜索行为 | `search_status = success` 的搜索数 / 搜索尝试数 |
| 搜索结果展示数 | `docs_search_results_impressed` | 搜索结果点击率分母 | 实际展示结果的搜索次数或 Session 数 |
| 搜索结果点击率 | `docs_search_result_clicked` | 搜索结果点击率 | 发生结果点击的搜索次数 / 结果展示搜索次数 |
| 前 5 条结果点击率 | `docs_search_result_clicked` | 搜索前 5 条结果点击率 | `result_rank <= 5` 的点击数 / 搜索次数 |
| 即时搜索点击 | `docs_search_result_clicked` | 即时搜索结果点击 | 需要增加 `search_surface = instant` |
| 全量搜索点击 | `docs_search_result_clicked` | 全量搜索结果点击 | 需要增加 `search_surface = full` |
| 空结果率 | `docs_search_completed` | 旧 Dashboard 未覆盖 | `result_count = 0` 的成功搜索数 / 成功搜索数 |
| 搜索错误率 | `docs_search_completed` | 旧 Dashboard 未覆盖 | `search_status = error` 的搜索数 / 搜索尝试数 |
| 搜索延迟 | `docs_search_completed` | 旧 Dashboard 未覆盖 | `latency_ms` 的平均值、P50、P95 |
| 文档/API 结果比例 | `docs_search_completed` | 旧 Dashboard 未覆盖 | 使用 `docs_result_count` 和 `api_result_count` 计算 |
| 搜索服务来源 | `docs_search_completed` | 旧 Dashboard 未覆盖 | 按 `search_provider = algolia/local` 分组 |
| 搜索结果类型 | `docs_search_result_clicked` | 旧 Dashboard 未覆盖 | 按 `result_type = docs/sdk-api` 分组 |

### AI 搜索指标

旧搜索 Dashboard 中包含以下 AI 指标：

- ASK AI 使用率
- 传统搜索 vs AI 使用率
- 搜索与 Ask AI 点击量
- AI 点赞/点踩

如果 docs-portal 上线时没有 AI 搜索功能，这些指标应在飞书表格中标记为 `N/A`，不要通过普通搜索事件伪造。若新站后续提供 AI 搜索，需要新增：

- `docs_ai_opened`
- `docs_ai_result_clicked`
- `docs_ai_feedback`

## 搜索事件字段

搜索事件应统一包含以下字段：

| 字段 | 用途 |
| --- | --- |
| `search_session_id` | 关联同一次搜索会话 |
| `query_attempt_id` | 关联一次具体查询尝试 |
| `search_surface` | `instant`、`full`、`api` |
| `query_length` | 搜索词长度 |
| `query_text` / `query_hash` | 非敏感搜索词或敏感词哈希 |
| `result_count` | 返回结果数量 |
| `result_rank` | 被点击结果的排名 |
| `result_type` | 文档、SDK/API 等结果类型 |
| `result_source` | Algolia 或本地索引 |
| `docs_result_count` | 文档结果数量 |
| `api_result_count` | API 结果数量 |
| `search_status` | `success` 或 `error` |
| `latency_ms` | 搜索耗时 |
| `locale` | 搜索语言 |
| `product_scope` | 产品过滤器 |
| `platform_filter` | 平台过滤器 |

当前搜索实现已经有大部分字段；需要补充或确认的是 `search_surface`，并确保 zh-CN 事件能够发送。

## 新站额外质量指标

这些指标不一定需要与旧 Dashboard 一一对应，但建议在替换后持续观察：

| 指标 | 埋点 | 观察目的 |
| --- | --- | --- |
| 404 数量和 404 率 | `docs_page_not_found` | 发现迁移遗漏和错误跳转 |
| 页面反馈率 | `docs_page_feedback` | 判断内容是否有帮助 |
| 代码复制次数 | `docs_code_copied` | 判断代码示例使用情况 |
| 目录点击 | `docs_toc_clicked` | 判断页面内部导航使用情况 |
| 平台切换 | `docs_platform_changed` | 判断平台内容需求 |
| 文章内链点击 | `docs_link_clicked` | 判断文档导航路径 |
| Console/GitHub/下载点击 | `docs_link_clicked` | 判断文档到开发入口的转化 |
| 文档浏览路径 | `docs_journey_step` | 分析用户从入口到目标文档的路径 |

## 飞书数据输出格式

后续 AI 从 PostHog 分别读取旧站和新站数据时，建议统一输出以下字段：

```text
site_id
locale
metric_key
metric_name
date_range
value
unit
filters
source_event
source_dashboard
fetched_at
```

第一批必须对齐的指标：

1. 总 Pageview
2. 独立 Session 数
3. 产品/场景访问量
4. Top 50 文档
5. RESTful API Top 10
6. FAQ Top 50
7. 搜索使用率
8. 搜索结果点击率
9. 前 5 条结果点击率
10. 空结果率
11. 搜索延迟
12. 文档/API 结果比例
13. 404 数量和 404 率
14. 页面反馈率

## 实施顺序

- [ ] 放开 zh-CN 结构化事件发送
- [ ] 增加 `site_id` 或 `site_version`
- [ ] 在生产部署中注入 `VITE_DEPLOY_VERSION`
- [ ] 增加 `search_surface`
- [ ] 确认产品、场景、API、FAQ 的分类映射
- [ ] 固化各指标的分子、分母和时间范围
- [ ] 在预发布环境验证所有事件和字段
- [ ] 上线后生成新站第一版基线数据
- [ ] 由 AI 分别读取旧站、新站数据并写入飞书

PostHog 中不创建新旧对比 Dashboard。对比逻辑放在数据抽取和飞书表格层完成。
