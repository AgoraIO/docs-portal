# 中文文档测量 v1

本目录实现 [P0 方案](../designs/2026-10-19-cn-docs-measurement.md) 的共享计算协议。`measurement-v1.sql` 定义四种逻辑数据集；它们是查询 CTE，不是假称已物化的数据表。每个看板查询复用相同前缀。项目尚无已批准的 Data Catalog 定义，本期查询标记为 v1 待业务审核。

- 事件按 `event_id` 去重；先保留全部可观测过程，再左关联反馈，保留无反馈的未知。
- 过程起点来自每条事实携带的 `journey_started_at`，避免乱序丢失起点。30 分钟无活动分段，24 小时结果窗口。
- 反馈按问题分别取最后有效变化；重复同值不重置确认解决时间。最后答案变为未解决时撤销解决锚点。
- 完整解决率的分母只含 resolved/partial/not_resolved；not_verified 与无响应单列。
- 确认耗时包含反馈延迟，只统计最终 resolved 的有效样本；易用性为最后有效 1–5 分，4–5 为易用。
- 生产默认排除 staging、local、internal_test；同时核对实际 host。正式域名切换时须同步 SQL 允许的 host，不能只改环境标签。使用看板的 CN Docs Environment 与 CN Docs Traffic 两个变量一起切换测试范围，不能混入生产看板。
- 报告用 Asia/Shanghai 的完整自然日；未满 24 小时批次单列。无有效分母用 NULL 显示尚未测得，不补零或编造基线。
- 页面帮助度按页面视图；任务反馈按过程，不把一份过程反馈分摊到每篇文档。
- 搜索弹窗按章节行，完整搜索页按文档卡片。请求、翻页和重试不能当新逻辑搜索。
- `index_revision=null` 表示没有可靠索引身份；前端 SHA 只标识应用/内容发布，不能冒充索引版本。

`quality-cases.json` 是首批 20 个任务的检查清单。搜索和链接结果可自动检查；SDK 操作步骤与答案正确性需要产品审核。`not_reviewed` 不能计为通过。审阅人、版本和阻断级错误必须保留。

三个看板和八个 SQL insight 的实际 ID、URL、变量记录在 `posthog-artifacts.json`。SQL 由 `measurement-v1.sql` 前缀和 `report-selects.json` 的对应 SELECT 组成；修改共享规则时必须同步全部 insight。扫描起点随 From 变量变化，读取截至查询时刻的事实，再按过程开始日选取批次，保留 24 小时结果窗和窗口外回答。搜索诊断也按所属过程开始日筛选。默认 From=-15d、To=-1d，是 14 个已满 24 小时的完整上海自然日。通用日期/属性控件不直接改变这些 SQL；使用九个 CN Docs 变量。产品、平台、版本、发布、入口按实体是否出现相应上下文选择观察集合，保留集合内全部事实，避免先过滤掉反馈或分母。

`feedback-regression.sql` 是只在查询内生成的固定样本，不向事件表插入测试数据。它核验同一秒内反转答案、搜索修订清除旧文档归属、重复同值保留最早确认锚点。发生时间保留毫秒，归属随最后回答一并取 tuple，避免 nullable 字段跳过 NULL。

运行检索和链接冒烟核验：

```sh
python3 docs/analytics/check-quality.py \
  --base https://docs-portal-staging.sh3.agoralab.co \
  --out /tmp/cn-docs-quality.json
```

运行器检查前三个文档单位里的预期主题/章节、目标 HTTP 状态和静态正文锚点，保留源 SHA；不会写 PostHog 事件或把步骤正确性标成通过。未知版本不冒充通用版本，任务使用实际已发布的平台与版本。

公开采集 key 沿用部署仓库 Jenkins 环境；应用源码不添加管理凭据。开关只控制本期业务采集与反馈，现有基础 SDK 继续运行；中文全局发送出口始终去掉任意 URL 查询、hash、referrer 路径、未知属性和自动 DOM 内容。录屏关闭。查询含邮箱、电话、URL、长 token、JWT 或敏感键值时整条替换为 `[redacted]`，普通查询最多 120 字符。结构化原因不收集自由输入。

回退：构建 `VITE_DOCS_MEASUREMENT_ENABLED=false`，或部署前一前端镜像；staging 流水线保留原有索引/后端一致性与回退记录。prod 目前只准备参数，默认关闭本期功能。
