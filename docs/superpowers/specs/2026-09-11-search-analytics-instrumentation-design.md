# 站内搜索体验埋点与 PostHog 看板设计

## 目标

判断用户是否通过站内搜索找到答案，并定位问题属于：

- 缺少产品名、平台名、API 名称或错误码；
- 搜索索引覆盖不足；
- 结果排序或相关性不合理；
- 产品筛选、平台筛选或结果分组不清晰。

本阶段不做 V1/V2 并行对比。指标按时间、搜索意图、产品、平台和语言拆分，直接观察线上搜索体验变化。

## 非目标

- 不引入新的搜索算法或搜索结果排序逻辑；
- 不建设数据仓库；
- 不新增独立的查询改写、筛选变化或关闭搜索事件；
- 不把外部 API Reference 页面的点击误判为有效阅读。

## 当前埋点能力

项目已经通过 PostHog 发送以下事件：

- `docs_search_opened`
- `docs_search_completed`
- `docs_search_result_clicked`

现有事件可以直接支持搜索使用率、请求成功率和零结果率。由于缺少结果展示事件和一次搜索的统一关联 ID，当前无法可靠计算无点击率、CTR、即时命中率和有效落地率。

## 事件模型

### 搜索会话

用户每次打开搜索框生成一个 `search_session_id`。同一次打开到关闭搜索框属于同一个搜索会话。

### 搜索请求

每次非空 query 完成搜索后生成一个 `query_attempt_id`。结果展示、结果点击和有效落地都通过该 ID 关联到具体搜索请求。

用户连续输入时，只记录最终稳定 query 的完成事件，不记录每次键盘输入。

## 事件定义

本阶段只使用 5 个事件：现有 3 个事件加新增 2 个事件。

### `docs_search_opened`

触发时机：搜索框打开。

字段：

```text
search_session_id
locale
mode
trigger
current_path
```

### `docs_search_completed`

触发时机：一次有效搜索请求完成。

字段：

```text
search_session_id
query_attempt_id
query_text 或 query_hash
query_length
search_intent
locale
product_scope
platform_filter
search_provider
search_status
result_count
docs_result_count
api_result_count
api_available
latency_ms
```

### `docs_search_results_impressed`

触发时机：搜索结果已经实际渲染并展示给用户。每个 `query_attempt_id` 只发送一次。

字段：

```text
search_session_id
query_attempt_id
result_count
visible_result_count
first_result_type
first_result_source
has_platform_variants
result_group_order
```

该事件作为无点击率、CTR 和即时命中率的分母。

### `docs_search_result_clicked`

触发时机：用户点击搜索结果。

字段：

```text
search_session_id
query_attempt_id
href
result_rank
result_type
result_source
selected_platform
click_delay_ms
```

同一个 query 的第一次点击用于计算首次点击排名、Top 1/3/5 点击占比和即时命中率。

### `docs_search_landing_engaged`

触发时机：用户点击站内文档后产生有效阅读或开发行为。每次搜索落地只发送一次。

字段：

```text
search_session_id
query_attempt_id
href
dwell_time_ms
scroll_depth
code_copied
next_page_clicked
```

第一版有效落地条件：页面有效停留至少 10 秒，并且发生滚动、代码复制或继续浏览中的至少一项。

外部 API Reference 页面第一版只统计点击，不统计有效落地，除非该页面后续接入同一套 PostHog 事件。

## query 隐私处理

为了发现具体的零结果产品名、API 名称和错误码，普通技术 query 记录脱敏后的 `query_text`。检测到 Token、App ID、URL、长随机字符串等敏感模式时，只记录 `query_hash`，不记录原文。

所有 query 文本限制为最多 100 个字符。

## 指标定义

所有指标按“有效搜索请求”或“搜索会话”统计，不按键盘输入次数统计。

| 指标 | 计算方式 | 价值 | 实现状态 |
|---|---|---|---|
| 搜索使用率 | 发起有效搜索的用户 / 活跃用户 | 判断用户是否使用搜索 | 现有事件可支持 |
| 搜索请求成功率 | `search_status=success` / 全部完成请求 | 判断搜索服务是否稳定 | 现有 |
| 零结果率 | `result_count=0` / 成功请求 | 发现内容、关键词或索引缺失 | 现有 |
| 无点击率 | 有结果展示但无点击 / 结果展示 | 发现结果相关性、排序或展示问题 | 需新增结果展示事件 |
| 搜索结果 CTR | 至少点击一次 / 结果展示 | 衡量结果整体有效性 | 需新增结果展示事件和关联 ID |
| 即时命中率 | 结果展示后 10 秒内首次点击 / 结果展示 | 判断用户是否快速找到结果 | 需补展示和点击时间 |
| 首次点击排名 | 第一次点击的 `result_rank` | 判断用户找到答案需要翻到第几条 | 需补关联 ID |
| Top 1 点击占比 | 首次点击排名 ≤ 1 / 有点击搜索 | 判断第一条结果质量 | 需补关联 ID |
| Top 3 点击占比 | 首次点击排名 ≤ 3 / 有点击搜索 | 判断前三条结果质量 | 需补关联 ID |
| Top 5 点击占比 | 首次点击排名 ≤ 5 / 有点击搜索 | 判断用户是否需要继续翻找 | 需补关联 ID |
| 搜索后有效落地率 | 有效落地 / 至少点击一次 | 判断点击结果是否真正有用 | 需新增有效落地事件 |
| 搜索答案成功率 | 有效落地 / 有效搜索会话 | 直接衡量用户是否找到答案 | 需新增有效落地事件 |

## 推导指标

以下指标不新增独立事件：

- 查询改写率：同一个 `search_session_id` 下出现两个及以上 `query_attempt_id` 的会话 / 搜索会话；
- 筛选使用率：带有 `product_scope` 或 `platform_filter` 的完成请求 / 有效搜索请求；
- 平台选择率：`selected_platform` 有值的 API 点击 / 出现多平台结果的搜索；
- API 降级率：`api_available=false` 的双索引请求 / 双索引请求。

## PostHog 看板

### 图 1：搜索答案成功漏斗

```text
docs_search_opened
  → docs_search_completed
  → docs_search_results_impressed
  → docs_search_result_clicked
  → docs_search_landing_engaged
```

用于查看从打开搜索到有效落地的整体转化。

### 图 2：搜索指标趋势图

按日期展示以下指标：

- 零结果率；
- 无点击率；
- CTR；
- 即时命中率；
- Top 1/3/5 点击占比；
- 搜索后有效落地率；
- 搜索答案成功率。

不绘制 V1/V2 两条并行曲线，也不在图表中标记新版上线时间。

### 图 3：搜索问题拆分图

使用 PostHog Breakdown 将同一指标按以下字段拆开查看：

- `search_intent`：task、product、support、api-symbol、api-task；
- `product_scope`：产品范围；
- `platform_filter`：平台筛选；
- `locale`：语言。

例如把零结果率按 `search_intent` 拆开，可以判断问题主要发生在 API 查询、产品查询还是支持类查询。

### 表 1：高频零结果 query

字段：

```text
query_text
search_count
zero_result_rate
search_intent
locale
product_scope
platform_filter
```

用于发现需要补充的产品名、平台名、API 名称、错误码、FAQ 和搜索别名。

### 表 2：高频有结果但无点击 query

字段：

```text
query_text
search_count
result_count
no_click_rate
first_result_type
first_result_source
search_intent
```

用于发现结果排序、标题、摘要、结果分组和筛选体验问题。

## 实现边界

第一阶段需要修改：

- `src/lib/analytics/posthog.ts`：增加事件函数和安全字段处理；
- `src/components/docs-shell/DocsSearchDialog.tsx`：生成会话/请求 ID，发送结果展示和点击上下文；
- 文档页面入口或共享页面容器：关联搜索落地并发送有效阅读事件；
- 对应测试：验证事件触发时机、字段、会话关联和有效落地条件。

第一阶段不修改搜索排序、Algolia 请求、搜索结果 UI 或索引内容。

## 验证标准

- 打开一次搜索只产生一个 `search_session_id`；
- 同一 query 的完成、展示、点击和落地事件共享同一 `query_attempt_id`；
- 空 query 不产生完成事件；
- 有结果但未点击的 query 能被识别；
- 第一次点击的排名和点击延迟可计算；
- 站内页面满足有效阅读条件后只产生一次有效落地事件；
- 外部 API Reference 点击不会被错误计入站内有效阅读；
- 敏感 query 不以明文进入 PostHog；
- 现有搜索行为不受埋点改动影响。
