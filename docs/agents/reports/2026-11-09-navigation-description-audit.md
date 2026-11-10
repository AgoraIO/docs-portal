# 英文导航入口摘要逐页对照

日期：2026-11-09。语义审查快照：`16d726924889345812ae91c76a1bf228f5a9e08a`。

本报告仅覆盖英文。中文文档、OpenAPI 自动生成端点、外部 API 参考站，以及只有直接 URL、没有下述导航入口的文档均不在范围内。PR #1400 先前附带的四处中文修改已撤回。

## 入口清单及覆盖

使用网站实际的 `canonicalSource`、`getTabSummaries` 和 `loadDocsPagePayload` 枚举入口，递归收集顶部导航、侧栏、SDK/文档版本切换，以及源文件中显式的页面卡片与目录链接。相对链接用页面渲染器使用的 `normalizeDocsHref` 归一化；FAQ 分类使用实际的 `faqItems` 目录数据。站内新窗口链接仍计入，不能因为 `external` 展示标记就把本站文档误当成外部 API 站排除。

对卡片和目录补齐后的清单再次递归，入口集合没有新增或移除，完成闭包检查。每个入口逐项读取摘要断言，并回到正文说明、章节、代码或枚举属性寻找对应依据；没有用关键词命中或自动默认值代替语义判断。

| 范围 | 入口 URL | 独立源文件 |
| --- | ---: | ---: |
| 英文 Realtime & Media | 379 | 379 |
| 其他英文产品、介绍、参考及 FAQ | 449 | 446 |
| 合计 | **828** | **825** |

Fastboard 的总览及 Android/iOS/Web 入口共用同一源文件，分别保留 URL 记录。共 687 个非空摘要，141 个入口没有摘要。

完整逐页证据见 [coverage JSON](2026-11-09-navigation-description-coverage.json)。828 个入口各有且仅有一条记录，包含源文件、URL、审查时摘要、判定、正文行号与原文短句，以及导航来源。全部引文与审查快照源文件核对，文件哈希也保留在记录中。

## 逐页结果

| 审查时判定 | 数量 | 含义 |
| --- | ---: | --- |
| consistent | 659 | 摘要的具体主张有该页正文支持，未见功能或方向矛盾 |
| mismatch | 2 | 两处 Cloud Proxy 摘要与正文放行要求矛盾，已补修 |
| generic | 11 | 通用概念/参考类摘要，没有足够具体的能力断言；不算明确验证功能正确 |
| missing | 141 | 无非空摘要，没有摘要可作语义比较；不算通过 |
| uncertain | 15 | 正文不足以支持摘要的全部范围或主张，单独保留待核实 |
| 合计 | **828** | 全部已落账，没有未记录的清单内页面 |

这里的 consistent 是文档内部一致性结论，不是对服务端行为、供应商能力、性能指标或线上部署作独立认证。

## 已补修的两处摘要

RTC 与 Signaling 的 Cloud Proxy IP 页第 3 行均写成只需放行“其中一个 IP”。RTC 正文第 29–30 行及 Signaling 正文第 31–32 行明确要求：限制媒体区域时添加对应区域的 IP，未限制区域时添加所有 IP。原摘要会误导防火墙配置。

- [RTC Cloud Proxy IP](../../../content/docs/en/realtime-media/rtc/reference/cloud-proxy-allowed-ips.mdx)
- [Signaling Cloud Proxy IP](../../../content/docs/en/realtime-media/rtm/reference/cloud-proxy-allowed-ips.mdx)

两页摘要统一为：

> Configure the IP addresses and ports your firewall must allow for Agora Cloud Proxy.

IP、端口表及放行规则正文保持不变。逐页 JSON 保留原摘要和审查结论，并另记 `resolution.descriptionAfter`，避免覆盖审计依据。

## 单独补修的正文串用

[Interactive Whiteboard 核心概念](../../../content/docs/en/realtime-media/whiteboard/reference/core-concepts.mdx)第 6 行把白板介绍成“在云端录制音视频并保存供点播”，实际是 [Cloud Recording](../../../content/docs/en/realtime-media/cloud-recording/index.mdx) 的能力。

依据 [白板总览](../../../content/docs/en/realtime-media/whiteboard/index.mdx)第 5 行，将这一句改为共享数字画布上的绘画、标注与文档共享实时视觉协作。该页通用摘要和其他正文保持不变。此项单列正文纠错，没有混入两处摘要冲突计数。

## 15 个待核实项

以下各项在 JSON 中有单独的逐页证据。没有把“正文缺少佐证”直接当成产品功能不存在，也没有为了凑成全部通过而自动改写产品事实。

- RTC 自定义音频、原始音频、自定义视频、原始视频四页共用涵盖音视频的摘要，但各页正文仅覆盖其中一种媒体，可考虑按页面主题收窄。
- Speech-to-Text 总览的 `most accurate` 最高级准确率表述没有本文可验证的比较依据。
- Chat、Flexible Classroom 两个下载页摘要承诺安装说明，正文主要是 demo 和示例源码下载。
- Whiteboard 定价页摘要还涵盖停服政策，但该主题在本页主要由额外链接承载。
- DeepAR 摘要包含 face touch-up 等能力清单，本文示例不足以完整确认，需要产品或效果资源依据。
- Cloud Recording、Cloud Transcoding、Media Pull 三页事件通知摘要泛称 channel events，正文分别针对具体服务任务事件，建议明确服务名称。
- IoT 定价页主要提供咨询和许可证入口，未直接说明摘要承诺的完整计费模型。
- Analytics 支持平台页正文是 RTC 收发流及 VP8/H.264 浏览器兼容矩阵，疑似拷贝内容，需要真实 Analytics 支持矩阵确认。
- Conversational AI REST 总览摘要包含请求排错，但正文主要是接口索引，排错覆盖范围尚不明确。

上述数量按 URL 计数：四个媒体页、两个下载页、三个事件通知页和其余六页，共 15 页。

## 无法对比的导航目标

发现一个站内卡片目标 `/en/realtime-media/on-premise-recording/build/authentication-workflow` 无法由当前页面加载器解析，没有正文可比较，未计入 828 个已解析入口，也没有标为通过。逐页 JSON 的 `unresolvedNavigation` 保留此项。

已跳过 OpenAPI 自动生成端点和外部站点，不请求其正文。初轮源文件扫描中未列入上述导航清单的条目，不继承到本报告的覆盖声明。

## 验证记录

- 入口闭包重跑无新增或移除：828 个英文 URL。
- 两份独立审阅账本合并后与入口清单集合完全相等，没有重复 URL 或缺漏。
- 828 条记录均有源文件正文证据，全部行号、短引文及哈希与审查快照相符；所有证据均在 frontmatter 之后。
- 中文文件已恢复至 PR 修改前的状态，最终差异应不包含 `content/docs/zh-CN/**`。
- `bun run types:check` 通过。
- 完整 Vitest：1971 项中 1957 通过、14 失败。将失败的文件名与测试名和先前未修改快照的结果逐项比较，14 项完全一致，没有新增失败。
- 两处新增摘要替换和一处白板正文替换均通过精确差异检查，没有更改 IP/端口表或其他说明。
- 在本地浏览器核对两个 Cloud Proxy 页的可见摘要及 meta description，并确认白板核心概念页显示新的视觉协作导语，不再显示云录制能力承诺；本地截图保存在忽略目录 `.agent/artifacts/`。
- 逐页 JSON 的全部源文件哈希、证据行号与引文均通过 `git archive` 审查快照校验；报告文件链接解析通过。
- `git diff --check` 通过。
- 原始修复的验证记录见 [初轮报告](2026-11-09-description-consistency-audit.md)。没有运行完整生产构建或外部 API 行为验证。
