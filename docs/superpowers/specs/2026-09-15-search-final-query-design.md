# 最终搜索词埋点设计

## 目标

让搜索质量看板以用户完成一次搜索会话时的最后一个有效搜索词为准，避免输入过程中短暂停顿产生的半成品 query（例如 `stan d`）占据高频问题列表。

## 事件

新增 `docs_search_query_finalized`。每次打开的搜索框最多发送一次：

- 点击结果时，发送最后一个已完成 query，`finalization_reason` 为 `result_clicked`。
- 关闭搜索框但未点击结果时，发送最后一个已完成 query，`finalization_reason` 为 `closed`。
- 没有已完成的非空 query 时不发送。

事件沿用安全 query 文本处理，并携带 `search_session_id`、`query_attempt_id`、`result_count`、`results_impressed`、首条结果类型/来源和 `finalization_reason`。

## 看板口径

“高频零结果查询”使用该事件中 `result_count = 0` 的记录；“高频有结果但无点击查询”使用 `result_count > 0`、`results_impressed = true` 且 `finalization_reason = closed` 的记录。两张表都只统计最终搜索词。

## 边界

现有 `docs_search_completed`、展示和点击事件保持不变，继续用于性能与交互分析。新事件仅提供面向内容质量的最终 query 口径；上线前的历史事件不会被追溯转换。
