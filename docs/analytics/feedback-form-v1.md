# 中文页底反馈：行为与采集契约

更新：2026-10-27。

## 投票与展开

- 首次点击“有 / 没有”立即记录帮助度并原地展开表单，收起或离开不撤销评价。
- 切换评价以后一次为准。帮助度分析沿用 `measurement-v1.sql` 的 `docs_feedback_facts`，按页面上下文取最后一条有效响应，不直接累计原始投票事件。
- 重复点击已选按钮只展开或收起，不产生重复投票。
- 正向展示 5 个原因，没有说明框；负向展示 6 个原因和选填说明。没有解决程度或评分量表。

## 提交规则

| 内容 | 操作 |
| --- | --- |
| 只有原因 | 点击“提交”才采集原因，不打开 GitHub |
| 原因与说明 | 采集原因，同时准备页面、帮助度、原因、说明及反馈编号的 GitHub Issue 创建页 |
| 只有非空说明 | 提交时补为 `other`，采集该原因，再进入 GitHub 流程 |
| 未填或只有空白字符 | 不产生详细反馈事件，帮助度投票仍保留 |

说明正文仅进入用户确认创建的 GitHub Issue，不进入分析事件。正负分支保存各自原因，隐藏分支的原因和文字不参与当前提交。

## 已提交记录不可修改

- 每次明确提交创建不可变快照与随机 UUID；SDK 的事件 UUID、`event_id`、`feedback_id` 使用同一个编号。
- 成功交给采集 SDK 后，表单替换为只读结果。继续访问 GitHub 的链接使用该快照，不重新读取可编辑状态，也不重复采集。
- 再次点击“有 / 没有”会创建空白表单。即使答案完全相同，也使用新的反馈编号，作为新反馈保存。
- 提交中禁用输入和评价按钮，防止双击、切换导致串数据。
- SDK 不可用或拒绝采集时保留草稿；不修改内容的重试复用原编号。超时后发生的延迟发送可按 UUID 去重。
- GitHub 新窗口被阻止时保留“继续在 GitHub 完成”链接。打开创建页不等于 Issue 已创建。

## 事件

事件名称：`docs_feedback_form_submitted`。它是独立的页面反馈记录，不复用旧问卷按 journey/question 覆盖答案的语义。

| 字段 | 含义 |
| --- | --- |
| `feedback_id` / `event_id` | 同一提交的稳定 UUID；新反馈使用新 UUID |
| `value` | `yes` 或 `no`，提交时帮助度快照 |
| `response` | 原因代码数组；仅允许当前分支的枚举值 |
| `has_comment` | 是否包含说明，不携带说明正文 |
| `feedback_destination` | `analytics` 或 `github`；后者代表交接方向，不代表 Issue 创建成功 |
| `canonical_path` | 使用 `measurementPath` 的规范文档路径，兼容历史 `/zh-CN` 身份；不带 query/hash |
| `feedback_scope` / `surface` | `page` / `content` |
| `prompt_version` | `inline-reasons-v1` |
| `occurred_at` | 首次提交快照时间；重试保持不变 |
| `traffic_type` / `test_run_id` | 非生产受控浏览器验证使用 `internal_test` 和指定运行标记 |

正向原因：`clear`、`useful_examples`、`solved_problem`、`easy_to_find`、`other`。

负向原因：`not_found`、`wrong_context`、`incorrect_or_outdated`、`unclear`、`steps_failed`、`other`。

原因统计按 `feedback_id` 去重传输副本；不得按“同一页面 + 相同原因”合并，否则会吞掉用户主动再提交的独立记录。新事件需单独查询，不会自动进入仅枚举旧事件名的 v1 问卷看板。

## 接收边界与配置

`captureDocsFeedbackSubmission` 返回成功代表 PostHog SDK 接受事件，SDK 接口不提供该次事件已存入查询库的确认。界面锁定的是不可变提交，不宣称 GitHub Issue 已创建。

浏览器使用 `VITE_POSTHOG_KEY`（Project API Key / project token）和 `VITE_POSTHOG_HOST`；管理 API key 保留在服务端或本地脚本。中文采集需 `VITE_DOCS_REGION=cn`、`VITE_DOCS_MEASUREMENT_ENABLED=true`。

传输白名单只增加 `feedback_id`、`has_comment`、`feedback_destination`。代码在调用 SDK 前显式挑选字段；不传页面标题、原始说明、完整 GitHub 链接等自由文本。

## 本次验证（2026-10-27）

- 最终 PR 分支基于最新中文开发分支，在不加载本地 `.env.local` 的独立工作区执行 `bun run test`：285 个文件通过，4,381 项通过、2 项跳过。
- `bun run types:check` 通过；`bun run lint` 无错误（仓库现有 warnings/infos）；改动文件 Biome 通过。
- 使用用户配置的 Project API Key，在 `feedback-submit-20261027` 内部测试会话验证了 3 条提交，UUID 均不同。两条相同正向原因各自独立；只有说明的负向反馈被归为 `other`，说明不在埋点参数中。
- 浏览器采集请求 `/i/v0/e/` 返回 HTTP 200。管理 API key 对配置项目 509917 返回 403，因此未做查询库读回，不宣称已用查询 API 查到这些事件。
- PostHog 会识别自动化环境；此次只在受控浏览器内临时设定 `opt_out_useragent_filter=true` 以发送内部测试，产品源码未关闭机器人过滤。
- GitHub 导航使用受控窗口替身核对完整预填内容，没有创建真实 Issue。
- 原始验证回执：忽略目录 `.agent/artifacts/feedback-submission-receipt.json`，不含密钥。

## 评价完成状态的视觉反馈

按用户最新确认，反馈栏保留原提问以及“有 / 没有”原文；选中的按钮改为实心底色和勾选图标，提供轻微点击动效，并尊重减少动画偏好。不额外显示“已记录”或完成提示行。选中状态在收起后保留。原因区域保留正向和负向各自的说明文字，选项标注为选填，后续按钮使用“提交 / 提交并前往 GitHub”，避免把即时评价与补充提交混为同一个动作。采集与重试边界仍按上文执行。
