# 中文全量索引补充验收

正式 review 后补修的边界、最新 49 项专项检查和本地 reviewed 发布记录见 `2026-10-09-cn-search-code-review.md`。以下保留先前 accepted 快照的验收过程；当前正式本地索引已更新到 local-cn-reviewed-20261009，仍为 64,065 条记录。

## 本轮结果

按 FAQ 元数据、固化发布配置、通用词排序、扩大覆盖验收顺序完成。最终导出 2,811 页、64,065 条章节记录，通过标准 prepare/promote 发布到本地 cn-kb-full-local。当前 http://127.0.0.1:3004/zh-CN/search 已使用该索引和更新后的 API；没有部署到生产或 K8s，没有提交或推送代码。

回执：dist/search/cn-accepted-final-release.json，revision=local-cn-accepted-final-20261009。上一版仍保留在 cn-kb-full-local__e761dceca1da4db28f209b957b28883f。

## 实施内容

1. FAQ：110 篇全部收录；将 catalog 产品、平台标签归一到本项目 ID，多产品使用 products，主 product 供展示。产品筛选匹配任一归属，RESTful FAQ 可以按平台检索。未知标签阻止导出。
2. 发布：生产 prepare 自动生成拆词、入口及产品/平台顺序字段，并应用版本化源码中的检索设置。回执摘要包含派生记录及设置。demo 基础设置与英文 Algolia 保持独立；使用对应构建的 dist/client 导出，并检查实际 HTML 锚点。
3. 排序：有限同义词、技术词容错、API 拆词固化；产品入口标题帮助泛产品词找到概览。产品/平台顺序仅用于相关性之后的排序，不是标题乘十的数值权重。未有可靠来源的 API 类别不猜测。
4. 章节：修复平台 Markdown 的外层缩进及表格内代码 fence 造成的章节吞并。旧 53,335 条快照有 2,086 个实际存在的目录锚点未独立入库；最终选定平台的真实目录章节遗漏为 0。

## 实际页面 API 验收

scripts/search/verify-local-cn.mjs：18 项明确目标检查通过、0 失败、6 项观察；110 篇 FAQ 没有漏收。完整结果与链接计数见 dist/search/cn-query-acceptance.json。返回排名是页面 API 聚合后的章节次序，不能替代引擎原始排名。

| 查询/筛选 | 目标及结果 |
| --- | --- |
| 云录制 / 云端录制 | 首条云端录制概览 |
| 发布消息 / 发送消息 | 首条 RTM 发送消息教程 |
| manualSOS + iOS | iOS API 目标第 1 位 |
| manualSOS 不限定平台 | Web 目标第 5 位，Android 首条 |
| removeHandler / remove Handler + Android | Conversational AI Android 目标第 3 位；RTC 同名方法在前 |
| 秀场 + showroom | 秀场概览第 1 位 |
| 屏幕共享 + csharp | C# 屏幕共享目标第 1 位 |
| React + web | React 基础概念第 1 位 |
| RTC + Android + 4.6.2 / 4.6.0 | 首屏无版本筛选违反 |
| query 方法返回 404 + cloud-recording + restful | 对应 FAQ 第 1 位 |
| 计时 + rtc | 多产品计费 FAQ 第 1 位，主产品为 local-server-recording 仍能按 rtc 找到 |
| 死锁问题 + rtm + android | 新恢复的 Android RTM 发布说明“改进”章节第 1 位 |

所有抽查目标和前五条页面链接 HTTP 成功、锚点存在于构建 HTML。容错样例 removeHander、manualSO、屏幕共亨及 API/SDK/RTC 仅记录观察，不计作相关性验收通过。
引擎对照的 8 项检查也通过；最终基线和候选的数据数量不同，不把这组对照当作单一策略的因果实验。

## 全量覆盖与剩余边界

完整审计见 2026-10-09-cn-search-coverage-audit.md：

- 64,065 个 ID 全部唯一；2,811 个索引页面均有 HTML。
- 62,395 个索引 fragment 中不存在的 HTML ID 为 0；选定平台的真实目录遗漏、平台元数据不匹配、仅属于错误平台的锚点均为 0。
- FAQ catalog 的产品/平台映射与记录一致；声明数字版本与索引版本一致。
- 源页面仍有 16 个目录链接缺少对应 HTML ID，以及 232 个跨平台面板重复锚点。后者仍需浏览器定位验证，锚点归属检查不能证明所有正文没有平台泄漏。
- 排除范围：21 个路由不在 sitemap、4,709 个路由不在导航搜索范围、167 个 canonical 页由平台变体替代、11 个空壳/组件目录页无有效正文。全量指既定公开导航契约，不等于全部源 MDX；扩大产品范围或增加组件目录入口需确认收录规则。
- SDK/API/RTC 等泛词、复杂自然语言查询、误召回及生产压力/故障恢复尚需进一步验收；本次没有声称搜索整体质量或生产发布已完成。

## 检查

7 个相关测试文件 45 项通过，types:check 与 git diff --check 通过。全量测试：35 失败、1,721 通过、2 跳过；补跑 mentor 提交 1c20dbc61 干净源码后，全部 35 项在基线重现，新增 0、消失 0。详细原因与影响见 cn-test-failure-audit 和 suite-failures 报告；已有失败不等于可忽略。

没有再次运行全站构建；本轮复用已有静态产物导出和验收。正式 CI 必须构建同一提交的完整静态站，再执行导出、覆盖审计和发布，不能把本地修补的构建产物直接视为可发布证明。
