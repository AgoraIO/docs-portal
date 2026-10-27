# 中文页底反馈：行为与采集契约

更新：2026-10-27。

## 投票与展开

- 首次点击“有 / 没有”立即记录帮助度并原地展开表单，收起或离开不撤销评价。
- 切换评价以后一次为准。帮助度分析沿用 `measurement-v1.sql` 的 `docs_feedback_facts`，按页面上下文取最后一条有效响应，不直接累计原始投票事件。
- 重复点击已选按钮只展开或收起，不产生重复投票。
- 正向展示 5 个原因，负向展示 6 个原因。两种评价展开后立即显示选填说明框，无需先勾选原因。原因和文字独立选填，没有解决程度或评分量表。

## 提交规则

| 内容 | 操作 |
| --- | --- |
| 只有原因 | 点击“提交”采集到 PostHog，原处显示感谢 |
| 原因与说明 | 将原因、说明、帮助度和页面路径一起采集到 PostHog，原处显示感谢 |
| 只有非空说明 | 采集说明及页面上下文，原因保持空数组，不自动补为 `other`，原处显示感谢 |
| 未填或只有空白字符 | 不产生详细反馈事件，帮助度投票仍保留 |

说明正文经首尾去空白、最多保留 2,000 字符后进入 PostHog 的 `comment` 字段，保留换行，与同一事件中的 `canonical_path`、`value`、`response` 和 `feedback_id` 对应。“提交”统一只发到 PostHog，不自动跳转或打开新窗口。提交成功后单独显示 GitHub 跟进引导；用户主动点击“在 GitHub 创建 Issue”才打开预填页面，需 GitHub 账号且 Issue 公开。正负分支分别保存各自原因和文字，切换评价不会把另一分支的草稿提交出去。

## 已提交记录不可修改

- 每次明确提交创建不可变快照与随机 UUID；SDK 的事件 UUID、`event_id`、`feedback_id` 使用同一个编号。
- 成功交给采集 SDK 后，表单替换为只读结果。继续访问 GitHub 的链接使用该快照，不重新读取可编辑状态，也不重复采集。
- 再次点击“有 / 没有”会创建空白表单。即使答案完全相同，也使用新的反馈编号，作为新反馈保存。
- 提交中禁用输入和评价按钮，防止双击、切换导致串数据。
- SDK 不可用或拒绝采集时保留草稿；不修改内容的重试复用原编号。超时后发生的延迟发送可按 UUID 去重。
- 站内反馈与 GitHub 跟进是两个明确动作。提交不会触发任何页面跳转；后续链接使用已提交快照预填页面、评价、原因和文字，点击不重复上报反馈。打开创建页不等于 Issue 已创建。

## 事件

事件名称：`docs_feedback_form_submitted`。它是独立的页面反馈记录，不复用旧问卷按 journey/question 覆盖答案的语义。

| 字段 | 含义 |
| --- | --- |
| `feedback_id` / `event_id` | 同一提交的稳定 UUID；新反馈使用新 UUID |
| `value` | `yes` 或 `no`，提交时帮助度快照 |
| `response` | 原因代码数组；仅允许当前分支的枚举值；只有说明时为空数组 |
| `comment` | 用户主动提交的说明正文，最多 2,000 字符并保留换行；未填写时为空字符串 |
| `has_comment` | `comment` 是否非空，由实际提交文字推导 |
| `feedback_destination` | 固定为 `analytics`，表示站内提交进入 PostHog；后续主动打开 GitHub 不改变已提交记录 |
| `canonical_path` | 使用 `measurementPath` 的规范文档路径，兼容历史 `/zh-CN` 身份；不带 query/hash |
| `feedback_scope` / `surface` | `page` / `content` |
| `prompt_version` | `inline-reasons-v2` |
| `occurred_at` | 首次提交快照时间；重试保持不变 |
| `traffic_type` / `test_run_id` | 非生产受控浏览器验证使用 `internal_test` 和指定运行标记 |

正向原因：`clear`、`useful_examples`、`solved_problem`、`easy_to_find`、`other`。

负向原因：`not_found`、`wrong_context`、`incorrect_or_outdated`、`unclear`、`steps_failed`、`other`。

原因统计按 `feedback_id` 去重传输副本；不得按“同一页面 + 相同原因”合并，否则会吞掉用户主动再提交的独立记录。新事件需单独查询，不会自动进入仅枚举旧事件名的 v1 问卷看板。

## 接收边界与配置

`captureDocsFeedbackSubmission` 返回成功代表 PostHog SDK 接受事件，SDK 接口不提供该次事件已存入查询库的确认。界面锁定的是不可变提交，不宣称 GitHub Issue 已创建。

浏览器使用 `VITE_POSTHOG_KEY`（Project API Key / project token）和 `VITE_POSTHOG_HOST`；管理 API key 保留在服务端或本地脚本。中文采集需 `VITE_DOCS_REGION=cn`、`VITE_DOCS_MEASUREMENT_ENABLED=true`。

传输边界只允许 `docs_feedback_form_submitted` 携带 `comment`，并再次执行 2,000 字符限制，避免通用字符串的 512 字符限制截断反馈。其他事件（包括自动采集和搜索事件）不能携带该字段。页面路径继续去除 query/hash，页面标题和完整 GitHub 链接不进入分析事件。

## 在 PostHog 查看文字与页面

在事件列表选择 `docs_feedback_form_submitted`，查看 `comment`、`canonical_path`、`value` 和 `response`。例如以下查询可按时间展示反馈文字和对应页面：

```sql
SELECT
  timestamp,
  properties.feedback_id AS feedback_id,
  properties.canonical_path AS page_path,
  properties.value AS helpfulness,
  properties.response AS reasons,
  properties.comment AS comment
FROM events
WHERE event = 'docs_feedback_form_submitted'
  AND properties.prompt_version = 'inline-reasons-v2'
  AND properties.traffic_type = 'visitor'
ORDER BY timestamp DESC
LIMIT 100
```

已有 v1 问卷看板不会自动包含这个独立事件。按页面查阅时使用 `canonical_path`，例如 `/zh-CN/realtime-media/rtc`；它是采集身份，中文公开 URL 可不带 `/zh-CN`。

## 验证边界

组件和采集测试覆盖正负分支立即显示说明框、原因和文字独立选填、草稿隔离、纯文字提交、重试编号、重复点击、页面路径清理，以及说明经过最终传输过滤后仍保留换行和 2,000 字符上限。SDK 接受事件和采集 HTTP 200 均不能单独证明查询库已入库。

## 评价完成状态的视觉反馈

按用户最新确认，反馈栏保留原提问以及“有 / 没有”原文；选中的按钮改为实心底色和勾选图标，提供轻微点击动效，并尊重减少动画偏好。不额外显示“已记录”或完成提示行。选中状态在收起后保留。原因区域保留正向和负向各自的说明文字，选项标注为选填，补充反馈按钮统一使用“提交”；完成后显示独立的 GitHub 跟进引导和“在 GitHub 创建 Issue”链接，明确需要 GitHub 账号，不自动跳转。采集与重试边界仍按上文执行。
