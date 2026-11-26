# 中文搜索修复与验收记录

## 当前结论

> 2026-11-04 最新追加：C++/C# 已从“仅区分语言”继续优化为“SDK 下载/接入入口优先”。请看文末“C++ / C# 入口排序追加优化”，本轮最新语言排序手测使用 **3149 开发预览**；3170 保留上一轮前端发布产物，不作为本轮最新前端构建证明。用户已于 11-04 要求提交并创建 PR，交付分支为 `codex/cn-search-quality-fixes`；部署和复测交接见 [build 与复测交接](./2026-11-04-cn-search-build-retest-handoff.md)。尚未部署。

本轮已完成本地候选修复、全量语料对照及页面抽查；尚未达到 Staging 发布验收，不能签署“搜索绝不回退”。改动基于 `codex/cn-newdoc-html-api-migration` 的 `837c5f58f5b8a59105e7c083a39d627d5032cb31`，下文按时间保留本地诊断过程；最新交付状态以 [build 与复测交接](./2026-11-04-cn-search-build-retest-handoff.md) 为准，尚未完成 Staging 发布验收。

执行顺序为用户确认的：环境版本 → 合并问题 → 分类和核心问题 → 全链路 → 本地与 Staging 复测。仅中文普通搜索，保留现有 Meilisearch、搜索界面和全量快照发布链路。

最新进展已同步到下方七类问题表及操作步骤。详细日志、候选标识和 10 张新增截图见 [继续优化与最终本地复测](#继续优化与最终本地复测)；明确标为“上一候选”的图片和测试记录仅保留作历史对照。

| 项目 | 最新状态 |
| --- | --- |
| 本轮新增修复 | C++/C# 区分、语言查询的严格平台筛选、正文说明摘要、录制自然语言召回、搜索发布页 React 418；此前大小流/RTM/audioScenario 等改善保留 |
| 本地验证 | 整合前 5,036 条通过、2 条跳过，302 次查询无新增零结果；整合最新基线后需使用文末 PR 交付复查结果，不能把此前统计作为最终整合版结论。历史覆盖待办仍未关闭 |
| 待复测/签收项 | 严格历史目标/排名告警、4 个屏幕共享 FAQ 零结果变化、旧路径承接和部分排序；此前 20 项目录覆盖告警须在整合 #1342 后重新审计，不视为已确认仍存在。不能确认“绝不回退” |
| 部署协作 | 用户没有 Staging/Jenkins 权限；由有权限的小伙伴协助发布最终同一 SHA 的前端、API 和索引并提供回执。用户已要求提交 PR 并通知协作 build/复测，尚未部署；11-04 已复查 Staging API/FAQ 分类返回 200，但尚未确认最终候选及匹配索引已部署 |

本地发布预览：[大小流搜索](http://127.0.0.1:3170/search?q=%E5%A4%A7%E5%B0%8F%E6%B5%81&type=all&page=1)。本轮搜索路由发布构建和 API 构建通过；全站全路由的最终干净构建、覆盖审计与 Staging 发布仍须完成。

## 输入与判断口径

- 叶佳易《搜索效果对比报告.md》及 `search-comparison-details.json`；杨怡璇《搜索的测试报告/搜索测试汇总与研发整改交接-2026-10-29.md》及原始证据；本会话的 Top 查询对比工具。
- `search-keywords-top30.json` 是 30 个实际搜索词；`top40.json` 是 40 个 API 热门页面及 40 个文档热门页面，不是 80 个实际搜索关键词。用热门标题生成的查询属于补充场景。
- 旧站是任务完成能力的对照；历史点击页面是意图线索，不是唯一正确答案。附件中的建议不自动成为实现指令。“核心入口 Top5”尚不是统一批准的硬门槛。
- 不以接口 200、单测通过、结果总量变多或平均排名改善来替代相关性验收；一个词的改善不能抵消另一词的真实退步。

## 环境核对

| 层次 | 本轮证据 | 仍缺的信息 |
| --- | --- | --- |
| GitHub 中文分支 | fetch 成功，本地与远端均为 `837c5f58f5b8a59105e7c083a39d627d5032cb31` | 最终发布需冻结新提交及干净构建 |
| Staging 静态站 | `https://docs-portal-staging.sh3.agoralab.co/__docs-release.json` 返回 `12a04c8ff1b0236d7d09a5dadd757332cb7b875b` | 与本次候选不是同一版本 |
| Staging API | 原始 Top30 × all/docs/api/faq：all/docs 各 30 次 200；api/faq 各 30 次 400 `Invalid search parameters`；旧别名 openapi 可返回 200 | 实际后端 SHA、网关目标 |
| Staging 索引 | all 响应缺少当前的 `familyTotalHits`，仍包含 Android 4.6.0 路径；health 只有 `status:ok` | 索引 release、records/settings 校验和 |
| 部署配置 | Chrome 已登录并读取 Bitbucket `ADUC/web-monorepo` 的 `hci-master`、`helm/docs-portal`；配置由同次 Jenkins 构建协调页面、服务及索引 | 配置文件不证明发布已实际执行 |
| 部署回执 | README 指向 Jenkins `docs-portal-2026/hci-master/108/console` | Jenkins 返回 Kong `Your IP address is not allowed`，无法读取执行回执 |

上表为此前取得的环境记录，不是本地候选已部署的证明。此前“Bitbucket 需要登录”的判断来自内嵌浏览器，已纠正：Chrome 可以访问 Bitbucket，无需再次登录。Jenkins 曾返回 IP 限制；用户已明确本人没有 Staging/Jenkins 权限，后续发布及回执由有权限的小伙伴协助，见 [部署交接](../../cn-search-deployment-handoff.md)。

已确认前端参数与运行时服务契约不匹配，但不能仅凭行为推断实际后端 SHA。当前源码已支持 api/faq，不能把 UI 改回旧参数来掩盖部署错配。

## 合并问题与处理结果

| ID | 原始问题 | 本地处理与复测 | 尚待验收 |
| --- | --- | --- | --- |
| S01 | API/FAQ 持续 400 | 保留正确 parser；完整本地 API/FAQ 分类可用，原始 Top30 四分类 120 次请求全部 200；11-04 已复查 Staging joinChannel 的 API/FAQ 请求也返回 200，此前 400 属于历史现象 | 最终候选仍需匹配前端、服务及索引的发布回执，并进行原词原视图复测 |
| S02 | 大小流默认 Top10 没有核心指南 | 技术词、同义词及说明章节标题参与检索；当前先显示“术语库 → 双流模式”，再显示“多人视频场景 → 发流端开启双流模式”，随后才是发版说明；实际点击配置章节正常，相关 FAQ 保留 | 历史“媒体流回退”退出全部视图首批；需确认更直接的 Web 配置指南是否可作为替代，不能自行修改基线；补充词“双流”仍有集成注意事项靠前 |
| S03 | rtm 被 RTMP 挤占，录制入口靠后 | 为缺引言的有效指南补页面标题入口；产品根页从真实标题派生 productCode/productTitle 排序字段。rtm/RTM→RTM 概览第 1，RTMP→RTMP 概览第 1，录制→云端录制概览第 1、本地录制概览第 2，RTC→RTC 概览第 1 | 保留热门页面及泛词的逐项质量审查，不以这些样例证明全量无回退 |
| S04 | audioScenario 示例先于定义/配置说明 | 精确 API 定义保持优先；产品文档对完整标识符优先匹配，无指南结果时恢复前缀搜索。当前首条为“设置音频编码属性 → 一对一互动教学”，不再首先匹配 AudioScenarioAPI 辅助项目 | “audioScenario 示例”仍走原多词匹配，未新增专门的示例意图排序器，不能宣称所有配置/示例场景已验收 |
| S05 | 屏幕共享 JavaScript 点击落到 Android | 从明确运行平台词推导 web 等筛选并保留共享记录；显式筛选优先，多平台歧义及独立平台词保持原词。原始 JavaScript 查询第 1 为 `/screen-share/web`，点击/刷新后 Web 被选中，正文包含 createScreenVideoTrack | TypeScript/Swift 等语言词保持原始查询，指南仍分别位于第 2/3；四个带平台屏幕共享查询 FAQ 变为零结果，必须单独审查 |
| S06 | 旧 SDK 版本优先且无版本区分 | 全量新快照 routeVersionMismatch=0；沿用仅收录当前发布 SDK 版本、界面不显示版本标签的既有策略 | 线上仍是旧索引证据；新快照发布后再核验，未新增历史版本搜索功能 |
| S07 | 摘要暴露生成组件、部分锚点异常 | 清理组件标签，并补清理完整/裁切的代码围栏分组属性，保留高亮和正常正文；audioScenario 页面不再显示 tabGroup 标记。无无效索引锚点；已点击抽查双流章节及 Web 落地 | 覆盖审计退出 1：20 项目录章节未收录仍存在；另有跨平台目录及重复 ID 待处理。不能把有限点击当作全部锚点验收 |

`荣耀`、`120` 意图仍不清楚；`sendRdtMessage` 在同语料前后均无结果，内容支持待核实，不伪造召回。两份报告的 5 词/9 词统计口径不同，不相加。

## 七类问题在页面上是什么样：截图与手动复测

这七类是对两位同学报告的归纳，**不是七个都已修好的问题**。本节把页面现象、可见改善和未完成项放在一起，方便照着点。截图没有修改页面内容或伪造结果。

**图片来源和环境：**

- “修复前原图”来自杨怡璇提供的 `Downloads/搜索的测试报告/Top30搜索差分回归-2026-10-29/screenshots/`，已复制到本项目忽略目录。原文件名中的 `new` 指当时的新文档站，**不代表本次修复后的版本**。
- 叶佳易报告中的部分图片仍指向她电脑上的 `/Users/yejiayi/...`，本机没有相应文件；不能把这些失效路径当作已附图。
- “本地修复后”使用 `http://127.0.0.1:3149` 和本轮隔离索引；较早截图来自 Chrome，新补拍来自当前内嵌浏览器，窗口宽度不同会改变布局，不是本轮修改了搜索 UI。
- S01 的对照图为本次再次访问 Staging 并实际点击分类拍摄，标记为“Staging 现状”，不是冒充同事原始截图。S01/S06 尚未完成线上发布验收。
- 图片都保存在 `.agent/artifacts/cn-search-optimization-20261029/screenshots/`，按仓库要求保持忽略，不提交 Git；下方使用绝对本地路径，供本机报告预览。分享 Markdown 文件时需要同时携带本地图片。

| 类别 | 用户原来在页面看到什么 | 当前状态 |
| --- | --- | --- |
| S01 分类可用性 | 能搜到结果，但点“API 文档”或“FAQ”后整块变成“搜索暂时不可用” | 本地可用；11-04 Staging API/FAQ 请求已为 200，下面 400 截图属于历史记录 |
| S02 大小流 | 搜视频大小流，却优先出现迁移、音强选流或 Metadata 大小，找不到核心指南 | 当前概念和双流配置章节先于发版说明；历史目标替换仍待签收 |
| S03 产品入口排序 | 搜 rtm 却先见 RTMP；搜录制却先见事件、文件介绍 | 本地 RTM、录制产品入口提前，仍需整体回归 |
| S04 精确技术词 | 搜 audioScenario，先看见几个示例项目，定义在后面 | 精确 API 定义优先，产品文档首条为场景配置说明；多词示例查询未专项验收 |
| S05 平台落地 | 输入 JavaScript，点开却选中了 Android，正文也是 Android | 本地原词已打开 Web，刷新仍为 Web |
| S06 API 版本 | 相同 Android API 出现两张近似卡片，第一张链接带旧版本 4.6.0 | 本地新快照仅当前版；线上索引尚待统一 |
| S07 摘要和锚点 | 摘要里出现 `<_Platform…` 等内部组件文字；部分点击定位体验异常 | 组件和代码围栏属性已清理；覆盖审计仍有 20 项目录章节问题，全部锚点未签收 |

### S01：API／FAQ 400，指的是“切换分类后搜索报错”

**先解释名词：**这里的“API 文档”是搜索框下方的内容分类按钮；“FAQ”是常见问题分类。“400”是后台拒绝这次请求的状态码，用户在页面上看到的是“搜索暂时不可用”，通常看不到数字 400。这与“没有匹配文档”不同，也不表示那些 API 方法本身坏了。

操作：打开 [Staging 的 joinChannel 搜索](https://docs-portal-staging.sh3.agoralab.co/search?q=joinChannel&type=all&page=1)，点击搜索框下面的“API 文档”，再点“FAQ”。此前补拍两者出现下图错误，对应请求返回 `Invalid search parameters`；11-04 两类请求已为 200，不应再按旧图描述当前线上状态。最终候选及实际后端版本仍待发布回执核实。

**此前的 Staging 400 截图：选中了 API 文档，但结果区显示“搜索暂时不可用”；不是 11-04 当前状态。**

![S01 Staging API 分类仍不可用](/Users/yuzhuopeng/Documents/Codex/2026-09-16/zh-g/docs-portal/.agent/artifacts/cn-search-optimization-20261029/screenshots/before/staging-api-error-recheck.jpg)

**此前的 Staging 400 截图：切换 FAQ 后也是同一错误；不是 11-04 当前状态。**

![S01 Staging FAQ 分类仍不可用](/Users/yuzhuopeng/Documents/Codex/2026-09-16/zh-g/docs-portal/.agent/artifacts/cn-search-optimization-20261029/screenshots/before/staging-faq-error-recheck.jpg)

**本地对照：**打开 [本地 joinChannel](http://127.0.0.1:3149/search?q=joinChannel&type=all&page=1)，点击同样的“API 文档”和“FAQ”，应出现对应卡片，而不是报错。这里验证的是本地现有契约可用，不是本次新增了一项 parser 修复，也不能证明 Staging 已恢复。

![S01 本地 API 分类有正常结果](/Users/yuzhuopeng/Documents/Codex/2026-09-16/zh-g/docs-portal/.agent/artifacts/cn-search-optimization-20261029/screenshots/after/joinchannel-api-page.jpg)

![S01 本地 FAQ 分类有正常结果](/Users/yuzhuopeng/Documents/Codex/2026-09-16/zh-g/docs-portal/.agent/artifacts/cn-search-optimization-20261029/screenshots/after/joinchannel-faq-page.jpg)

### S02：大小流，“指南能打开、FAQ 保留”具体怎么点

**修复前：**输入“大小流”，首屏出现迁移指南、音强选流等，API 卡片大量匹配的是 Metadata 的数据大小；这些不等于视频大流/小流的使用指南。

![S02 修复前大小流结果，来自同事原图](/Users/yuzhuopeng/Documents/Codex/2026-09-16/zh-g/docs-portal/.agent/artifacts/cn-search-optimization-20261029/screenshots/before/Q07-new-search.png)

**本地操作 A，验证指南：**

1. 打开 [本地大小流搜索](http://127.0.0.1:3149/search?q=%E5%A4%A7%E5%B0%8F%E6%B5%81&type=all&page=1)，保持“全部文档”。
2. 当前产品文档第一张为“术语库 → 双流模式”，第二张为“多人视频场景 → 1. 发流端开启双流模式”；点击第二张的蓝色章节名。
3. 核对 Web 指南正文的 `enableDualStream`、`setLowStreamParameter` 和订阅大小流步骤。本次真实点击已定位到该章节；这篇是 Web 指南，不代表其他平台也适用。“双流”是同一路视频提供大流、小流两种规格的机制。

**最新默认结果：**概念和配置章节已在发版说明前；相关 FAQ 仍可见。历史目标“媒体流回退”退出首批，是否接受替代仍需文档同学确认。

![S02 最新大小流结果：概念和配置章节靠前](/Users/yuzhuopeng/Documents/Codex/2026-09-16/zh-g/docs-portal/.agent/artifacts/cn-search-optimization-20261029/screenshots/continued/dual-stream-all.jpg)

**上一候选的历史对照：**当时“媒体流回退”第 4，发版说明前两位；以下两张图不代表现在的排名或当前操作步骤。

![S02 本地大小流默认结果，媒体流回退第4](/Users/yuzhuopeng/Documents/Codex/2026-09-16/zh-g/docs-portal/.agent/artifacts/cn-search-optimization-20261029/screenshots/after/dual-stream-local.jpg)

**点击后的真实指南：**正文包含上述双流配置方法；这是对页面是否解决任务的检查，不只是检查链接能否返回 200。

![S02 媒体流回退指南中的双流配置正文](/Users/yuzhuopeng/Documents/Codex/2026-09-16/zh-g/docs-portal/.agent/artifacts/cn-search-optimization-20261029/screenshots/after/dual-stream-guide-local.jpg)

**本地操作 B，验证 FAQ 没被一起丢掉：**回到搜索页，保持关键词“大小流”，点击搜索框下方的“FAQ”，应出现“如何处理视频模糊问题？”。点击进入后，可以看到检查接收到大流还是小流的建议。“保留”指这条相关问答在优化后仍然搜得到，不是让你执行收藏操作。

可直接打开 [大小流 FAQ 视图](http://127.0.0.1:3149/search?q=%E5%A4%A7%E5%B0%8F%E6%B5%81&type=faq&page=1)。

![S02 大小流 FAQ 中仍能找到视频模糊问题](/Users/yuzhuopeng/Documents/Codex/2026-09-16/zh-g/docs-portal/.agent/artifacts/cn-search-optimization-20261029/screenshots/after/dual-stream-faq-local.jpg)

### S03：产品入口排序，是本次实际改善的排序问题

**可以理解为修复排序，但范围是已验证的产品入口。**不是给几个词写死第一名；本轮补齐有效页面的标题索引，并让产品根页的真实产品名参与排序。不能由此推断所有搜索词的排序都已经修好。

**RTM 修复前：**输入 `rtm`，最先出现 RTMP 网关，真正的“实时消息 RTM 概览”在后面。

![S03 修复前 rtm 优先出现 RTMP，来自同事原图](/Users/yuzhuopeng/Documents/Codex/2026-09-16/zh-g/docs-portal/.agent/artifacts/cn-search-optimization-20261029/screenshots/before/Q11-new-search.png)

**RTM 修复后：**打开 [本地 rtm](http://127.0.0.1:3149/search?q=rtm&type=all&page=1)，第一张应为“实时消息 RTM 概览”。再把词换成 `RTMP`，确认“RTMP 网关概览”仍排第一，避免只改善 RTM 却损害 RTMP。

![S03 本地 rtm 第一条为实时消息 RTM 概览](/Users/yuzhuopeng/Documents/Codex/2026-09-16/zh-g/docs-portal/.agent/artifacts/cn-search-optimization-20261029/screenshots/after/rtm-local.jpg)

**录制修复前：**优先出现“录制服务事件”“录制模块事件”“录制文件介绍”，产品概览靠后。

![S03 修复前录制搜索，来自同事原图](/Users/yuzhuopeng/Documents/Codex/2026-09-16/zh-g/docs-portal/.agent/artifacts/cn-search-optimization-20261029/screenshots/before/Q10-new-search.png)

**录制修复后：**打开 [本地录制](http://127.0.0.1:3149/search?q=%E5%BD%95%E5%88%B6&type=all&page=1)，前两张应为“云端录制概览”“本地服务端录制概览”；点击能进入各自产品介绍。

![S03 本地录制产品概览提前](/Users/yuzhuopeng/Documents/Codex/2026-09-16/zh-g/docs-portal/.agent/artifacts/cn-search-optimization-20261029/screenshots/after/recording-local.jpg)

### S04：audioScenario，定义被示例项目挡在后面

**修复前：**前三个产品文档入口都落在“设置优质音频体验 → 示例项目”；API 定义虽存在，但显示在下面。

![S04 修复前 audioScenario 先展示示例项目，来自同事原图](/Users/yuzhuopeng/Documents/Codex/2026-09-16/zh-g/docs-portal/.agent/artifacts/cn-search-optimization-20261029/screenshots/before/Q18-new-search.png)

**修复后怎么测：**打开 [本地 audioScenario](http://127.0.0.1:3149/search?q=audioScenario&type=all&page=1)，最先展示 API 文档组，其中有 `AudioScenario` 枚举及说明；再搜索 `AudioScenario`、`joinChannel()`，也应优先看到精确 API。进入任意文档按 `⌘K` 搜 `joinChannel`，弹窗中也要优先展示 API，避免两个入口表现不同。

![S04 本地 audioScenario 的 API 定义提前](/Users/yuzhuopeng/Documents/Codex/2026-09-16/zh-g/docs-portal/.agent/artifacts/cn-search-optimization-20261029/screenshots/after/audio-scenario-local.jpg)

![S04 本地弹窗的 joinChannel API 优先](/Users/yuzhuopeng/Documents/Codex/2026-09-16/zh-g/docs-portal/.agent/artifacts/cn-search-optimization-20261029/screenshots/after/joinchannel-modal.jpg)

**产品文档的最新改善：**上面两张为上一候选的 API/弹窗截图。现在切到 [audioScenario 产品文档](http://127.0.0.1:3149/search?q=audioScenario&type=docs&page=1)，第一张为“设置音频编码属性 → 一对一互动教学”，包含实际场景配置；不再首先匹配更长的 AudioScenarioAPI 辅助项目名。

![S04 最新产品文档优先展示场景配置](/Users/yuzhuopeng/Documents/Codex/2026-09-16/zh-g/docs-portal/.agent/artifacts/cn-search-optimization-20261029/screenshots/continued/audio-scenario-docs.jpg)

**尚待验收：**加“示例”的多词查询仍按原有规则检索，未新增专门的示例意图排序器；API 定义、指南配置和示例需求要分别验收。

### S05：输入 JavaScript，却点进 Android 内容

**修复前：**原查询是“屏幕共享 JavaScript”，但点开后的平台为 Android；下图可见 Android 标签被选中。单独这张落地图不能证明查询来源，来源由同事 Q28 的搜索、点击记录及问题报告关联。

![S05 修复前点击后选中了 Android，来自同事原图](/Users/yuzhuopeng/Documents/Codex/2026-09-16/zh-g/docs-portal/.agent/artifacts/cn-search-optimization-20261029/screenshots/before/Q28-confirm-default-android.png)

**修复后操作：**打开 [本地原始 JavaScript 查询](http://127.0.0.1:3149/search?q=%E5%B1%8F%E5%B9%95%E5%85%B1%E4%BA%AB%20JavaScript&type=all&page=1)，先保持全部平台，点击第一条“屏幕共享”，不要先手动切 Web 来绕过原问题。应打开 `/realtime-media/rtc/build/video/screen-share/web`，Web 标签被选中；刷新后仍为 Web，正文可见 `createScreenVideoTrack` 和浏览器屏幕共享步骤。

![S05 本地原查询返回 Web 屏幕共享](/Users/yuzhuopeng/Documents/Codex/2026-09-16/zh-g/docs-portal/.agent/artifacts/cn-search-optimization-20261029/screenshots/after/javascript-search-local.jpg)

![S05 本地点击刷新后仍为 Web 正文](/Users/yuzhuopeng/Documents/Codex/2026-09-16/zh-g/docs-portal/.agent/artifacts/cn-search-optimization-20261029/screenshots/after/javascript-web-landing.jpg)

**边界：**带平台词查询的 FAQ 零结果变化仍待审查；本例通过不代表任意语言/平台组合均已验收。

### S06：相同 API 两张 Android 卡片，第一张实际指向旧版

**修复前：**搜索 `enableAudioVolumeIndication`，出现两张几乎相同的 Android“音频基础功能”卡片，卡片上看不出哪个当前、哪个历史版。

![S06 修复前重复 Android API 卡片，来自同事原图](/Users/yuzhuopeng/Documents/Codex/2026-09-16/zh-g/docs-portal/.agent/artifacts/cn-search-optimization-20261029/screenshots/before/Q23-new-search.png)

截图只能证明卡片重复，**旧版本的判断另有链接证据**：同事 `raw/Q23-new.json` 的前两张 Android 卡片分别指向 `/api-reference/rtc/android/4.6.0/audio/audio-basic` 和 `/api-reference/rtc/android/audio/audio-basic`。本地候选第二种当前路径的记录元数据为 `version: 4.7.0`。摘录保存于 [版本证据 JSON](/Users/yuzhuopeng/Documents/Codex/2026-09-16/zh-g/docs-portal/.agent/artifacts/cn-search-optimization-20261029/screenshots/version-evidence.json)。

**本地怎么测：**搜索该原词，切“API 文档”，平台选 Android；窄窗口先点“筛选”再选 Android。也可打开 [对应的 Android API 视图](http://127.0.0.1:3149/search?q=enableAudioVolumeIndication&platform=android&type=api&page=1)。查看精确方法命中的卡片，点击 `enableAudioVolumeIndication` 应进入当前路径 `/api-reference/rtc/android/audio/audio-basic#enableaudiovolumeindication`。其他相关方法/目录卡片仍可存在，不要求整个列表只剩一张卡片。

![S06 本地当前 Android API 视图](/Users/yuzhuopeng/Documents/Codex/2026-09-16/zh-g/docs-portal/.agent/artifacts/cn-search-optimization-20261029/screenshots/after/current-android-api-local.jpg)

这里的本地图加了 Android/API 筛选，用于核对目标，不与修复前全部视图直接比较名次。**本轮没有增加版本标签或历史版切换**；采用现有“索引仅收录当前发布 SDK 版”的策略。版本正确性还要依赖新索引审计与部署回执，不能只看截图；Staging 问题尚未关闭。

### S07：摘要里露出组件代码，以及点击后的定位

**摘要修复前：**同事的 `webrtc` 原图里，“浏览器兼容性和已知问题”卡片摘要直接显示 `<_PlatformTabsGroup…`、`<_PlatformPanel…`，用户看到的是内部组件标记，而不是可读说明。它们不是用户需要理解的 API。

![S07 修复前 webrtc 摘要出现内部组件标记，来自同事原图](/Users/yuzhuopeng/Documents/Codex/2026-09-16/zh-g/docs-portal/.agent/artifacts/cn-search-optimization-20261029/screenshots/before/Q25-new-search.png)

**摘要修复后怎么测：**搜索 `webrtc`，点击“产品文档”分类，找到“浏览器兼容性和已知问题”。其摘要现在是“声网 Web SDK 是一款基于 WebRTC 技术的实时音视频 SDK……”等正常文字。该分类比默认总览展示更多卡片，方便找到同一文档；不是用换词来避开问题。

![S07 本地 webrtc 产品文档视图，同一浏览器兼容性卡片摘要正常](/Users/yuzhuopeng/Documents/Codex/2026-09-16/zh-g/docs-portal/.agent/artifacts/cn-search-optimization-20261029/screenshots/after/webrtc-docs-clean-local.jpg)

**锚点怎么测：**在 S06 的 Android API 结果中点击蓝色方法名 `enableAudioVolumeIndication`，应跳到方法定义附近，而不仅是打开章节顶部。本次补拍时该方法标题距视口顶部约 134 像素，URL hash 为 `#enableaudiovolumeindication`，下图能直接看到方法标题和参数正文。

![S07 本地点击 API 方法后定位在定义附近](/Users/yuzhuopeng/Documents/Codex/2026-09-16/zh-g/docs-portal/.agent/artifacts/cn-search-optimization-20261029/screenshots/after/current-api-anchor-local.jpg)

**证据边界：**同事报告里有些锚点初次异常随后自行恢复，且部分没有取得截图；本节不补造“修复前坏锚点”图片。本轮没有逐一修复所有锚点，已有的目录/重复 ID 审计项也仍保留，不能从这张成功样例推断全部定位都正常。

### 本次补图时的运行恢复说明

补拍开始时，本地 Meilisearch 进程已退出，3149 页面因此曾返回 `502 Search service unavailable`。已用同一 v1.12.8 二进制、原 DB 和原候选索引恢复，未重新造数据、未改应用源码。随后重新取得并检查了本节新增的成功截图。此本地进程问题与 S01 的 Staging 分类参数 400 分别记录；本节不把临时本地失败图冒充原报告证据，也不把旧成功图当作当前运行状态的证明。


## 全链路变更及边界

1. **正文提取**：先确认实际可读的非代码正文；无引言指南优先使用维护的描述，无描述时取真实首段作为页面标题入口。空 H1/纯代码章节不凭元数据制造入口。无描述的 API 符号章节维持逐符号收录，避免把第一个符号误当全页说明；这是一项明确的范围裁决。
2. **索引与排序**：产品字段来自真实根页标题，非查询→URL 置顶表；大小流使用术语同义词，并为说明章节加入标题检索字段。保留原 rankingRules 次序，未采用会损害录制入口的全局 exactness 优先实验或全指南正文提权。
3. **查询与平台**：只推导明确的运行平台，JavaScript 对应 Web；Swift、TypeScript、Java、C++ 等保持字面查询。共享无平台记录参与自动及手动平台筛选；适用平台来自发布元数据，展示时不虚构平台标签。产品文档的完整标识符匹配及无结果时的前缀回退见最新修复记录。
4. **分组展示**：多个界面共用同一意图判断，避免后端 API 已领先但前端固定产品文档优先导致用户看不到。普通词仍按原分类顺序展示。
5. **发布**：需要重建 records、应用新 settings 并以完整快照发布；仅重启 API 或修改前端不能补出缺失的页面入口。

## 上一候选的验证证据

证据目录：`.agent/artifacts/cn-search-optimization-20261029/`。其中引擎、截图、原始查询和日志均在忽略目录，不提交、不上传截图链接。

| 检查 | 该候选结果 | 限制 |
| --- | --- | --- |
| `bun run test` | 317 文件通过；5,002 条通过、2 条跳过；退出 0 | `final-full-tests.log`；日志含 socket hang up 输出，但无失败用例 |
| `bun run types:check` | 退出 0 | `final-types.log` |
| 改动 TS/TSX Biome | 15 文件检查通过 | 与最终源代码一致 |
| 中文静态构建 | 完整 `build:static` 退出 0，6,832 route HTML | 构建期间源码曾继续修改；用于固定语料对照，不等于最终待发布提交的干净构建 |
| 同语料导出 | 2,561 个索引页面；基线 57,560 条，候选 57,894 条，净增 334 | 冻结 HEAD 提取器与候选提取器读取同批构建产物 |
| 覆盖审计 | 无效收录锚点、错误 TOC 目标、平台错配、版本错配、排除产品混入均为 0；未知符合条件无记录页面为 0 | 原有 missingTOC 20、otherPlatformTOC 97、duplicateIDs 153 与基线相同；8 个无正文目录已列明 |
| 隔离真实引擎 | 官方 Meilisearch v1.12.8，127.0.0.1:7749，独立 DB/索引 | 不写正式引擎；receipt 见 `reviewed-candidate-receipt.json` |
| 原词分类接口 | Top30 × 四分类 120 次本地 HTTP 请求，全部 200 | `local-top30-http.json`；不代表相关性全部通过 |
| 扩展查询观察 | 43 词 × 四分类 172 项返回记录 | `reviewed-candidate-queries.json`；包括 TypeScript、Swift、平台 API、大小写及括号 |
| 精确 API 保留 | 9 个有精确匹配的原始 API 查询，基线已展示的精确页面/章节对丢失 0；sendRdtMessage 两边均为 0 | 只覆盖这些观察项，不推及所有 API |
| 页面抽查 | 弹窗 joinChannel/Android API 优先；完整页 API/FAQ；RTM、录制、大小流结果及核心指南点击；JavaScript→Web 点击/刷新 | 截图按场景命名；不是全量人工验收 |

只调用本地隔离测试服务；预览 `http://127.0.0.1:3149/search?q=rtm`。

独立代码审查提出的语言过滤退步、前后端意图不一致、API 命名形态、空页入口和裁切标签问题均已处理并做针对性复验。审查记录为 `.agent/artifacts/search-final-review.md`；其中审查时的候选与最终候选不同，不能把该记录误作最终通过意见。

## 回退验收与未完成项

目前发布结论为 **未通过/未签收**，不是“已确认无回退”。

- 历史目标严格对照曾得到 83 个正式站告警、3 个快照告警、1 个旧站请求异常。这是较早候选的记录，不是最终候选缺陷数：混合了历史目标映射、热门标题合成查询、真实排序差异及平台 URL 变化。不能全部判为缺陷，也不能全部豁免；最终冻结提交需重新执行并逐项处理。
- 已识别的口径问题：JavaScript 原目标为规范页，正确 `/web` 落地被工具算成丢目标；RTC 的历史到达页是用量分析而非唯一意图；云录制的历史到达页是课堂集成；准确 API 查询需要同时检查精确符号、指南可达性及平台，不能只看一个历史 URL。
- 需要保留复核的排序项包括 token 指南、createClient 的 Web 与 React 配套 Web 副本次序、enableAudioVolumeIndication 指南，以及大小流/音频场景的说明入口。不得直接改断言或放宽阈值使告警变绿。
- 最终候选比同语料基线新增 4 个零 FAQ 视图：屏幕共享 JavaScript/Web/Android/iOS。旧结果含 Electron 无法共享窗口、Flutter 调试及摄像头等部分匹配；新筛选减少跨平台干扰，但不能据此自动认定所有被去掉的 FAQ 都无价值。需结合用户任务复核。
- 最终发布前先冻结代码 SHA，完成干净构建、索引导出及对应 records/settings 校验和；取得 Jenkins 发布回执，确认前端 SHA、API SHA、索引 revision/release 一致；用相同原词、分类、平台条件在 Staging 复测，保存排序、最终链接、点击/刷新和截图证据。
- 任一分类报错、已确认相关目标丢失、错误平台/失效落地、精确 API 改善退步均阻止放行。模糊意图应澄清并记录，不能用自动平均分掩盖。

本轮没有触发 Jenkins、合并分支、部署服务或 promote 索引。


## 继续优化与最终本地复测

本节记录用户确认继续后的候选，仍未提交、推送或部署。用户本人没有 Staging/Jenkins 权限，部署和部署版本回执由有权限的小伙伴协助；无需让用户申请登录或提供密钥。交接流程见 [中文搜索部署交接](../../cn-search-deployment-handoff.md)。

### 本次继续改了什么

| 环节 | 调整 | 具体作用和边界 |
| --- | --- | --- |
| 指南章节排序 | 在页面入口标题之后，加入真实的说明章节标题检索字段；排除发版说明和示例、注意事项等辅助层级 | 大小流的概念/双流配置章节有机会先于发版说明；未全局压低所有发版说明，也未给任何查询绑定 URL |
| 中文术语 | 大小流、双流关联“大流/小流/双流模式”；产品概述、产品概览关联“概览” | 统一维护术语差异；实际相关性仍以逐词结果和点击为准 |
| 完整技术标识符 | 裸搜单个 camelCase/PascalCase/snake_case 名称时，产品文档优先按完整词匹配；完全无指南结果时才恢复前缀检索 | `audioScenario` 参数与 `AudioScenarioAPI` 辅助项目名区分；不影响 API/FAQ 查询；普通 Token/License 不套用该规则 |
| 手动平台筛选 | 指定 C、RESTful 等平台时，保留未限定平台的共享文档；RESTful 两种已有平台 ID 同时兼容 | 解决 RTSA License、生成的 REST API 被筛掉的问题；共享文档不伪造平台标签 |
| 平台索引来源 | 从同次发布 payload 读取维护的适用平台；平台变体路由优先，API 语言和明确运行端同时保留，OpenAPI 归 RESTful | Web 专属指南不能因缺标签作为共享文档混入 Android；不依据正文偶然出现的 Android/Web 单词猜适用平台 |

没有采用“将所有指南正文整体提权”的实验：真实引擎对照发现它会挤掉原有有用指南。最终保留的是章节标题字段，不包含 `guideContent` 正文加权字段，原 rankingRules 顺序保持。

“audioScenario 示例”是多词查询，本轮未新增专门的示例意图排序器，不能声称该场景已专项优化。“精确 API 定义优先”和“产品文档里优先解释/配置”是两个独立检查。

### 本地查询对照与未关闭的质量告警

真实 Meilisearch v1.12.8 上完成 287 项：原 Top30 + Top40 标题共 110 项、43 词 × 四分类 172 项、5 个补充意图项。相比上一轮候选，新增零结果为 0；与冻结 HEAD 语料基线及上一候选分别对照，已展示的精确 API 页面/章节对丢失均为 0。这些是观察范围内的结果，不等于所有 API 或全部搜索意图已经通过。

- 大小流：本次产品文档首批先出现“术语库 → 双流模式”，再出现“多人视频场景 → 发流端开启双流模式”，随后才是发版说明；历史指定的“媒体流回退”退出全部视图首批预算。是否接受更直接的配置指南替代旧目标，必须由文档同学确认，未偷偷替换基线。
- audioScenario：API 仍优先显示定义；产品文档首条为“设置音频编码属性 → 一对一互动教学”，能看到具体场景配置，不再首先匹配 `AudioScenarioAPI` 辅助项目。追加“示例”仍走原多词匹配，暂未专门验收通过。
- RTM、RTMP、录制：各自概览入口保持；“初始配置”加 RTM/Android 或 RTM/Web 筛选能找到对应当前 API 页。
- 大小流和双流：FAQ 均保留“如何处理视频模糊问题？”；双流产品文档仍有多个解决方案“集成注意事项”靠前，未把这个补充词宣称为排序完全解决。
- “混淆”的历史语聊房目标从上一候选第 3 后移至第 4，其他产品的防混淆说明提前。相关目标仍可见，但这项排序变化未签收，不能被其他词改善抵消。
- 原 Top40 中有 27 个此前未进入同类首批的目标现在进入首批；这不代表 27 个都完成人工相关性验收。仍有 14 个严格历史目标缺失，详见下表。

严格口径继续使用原 fixture 和未通过的观测快照。当前与**已保存的旧站观测**比较有 33 条告警，与初始 Staging 快照比较有 4 条告警；它们可能包含同一查询的多个分类差异，不是缺陷数，也不是新做了一次正式站全量实测。4 条快照告警分别是混淆目标后移、setupRemoteVideo 历史 Electron 页退出首批、JavaScript 历史规范路径被 Web 路径承接、Web API 概览排序后移。后两项及 React/Web 副本排序需继续复核，未通过门禁。

相比冻结 HEAD，同样保留 4 个新增零 FAQ 视图：屏幕共享 JavaScript/Web/Android/iOS。旧集合包含跨平台问题和一般视频质量 FAQ；过滤减少噪音并不能自动证明没有丢有用答案，仍请文档同学逐条确认。sendRdtMessage 两边均无结果，未伪造内容。

原始证据：`continued-final.json`、`continued-final-queries.json`、`continued-final-delta.json`、`continued-final-api-preservation.json`、`continued-final-quality.json`。对照使用记录中的 indexUid；发布仍需最终 Git SHA。

### 需要共同确认的内容与目标（不改旧基线消除告警）

Top40 的严格历史路径仍有 14 个目标未出现在同类首批结果；下表给出排查现状，不能全部视为代码故障，也不能直接豁免。原 fixture 保持不变。

| 场景 ID | 现状 | 下一步由谁确认 |
| --- | --- | --- |
| popular-api-09 | Windows 筛选对应的历史目标是 C++ all-platforms API；索引平台为 cpp，Windows 下未召回 | 文档同学确认 C++ 跨平台 API 应如何标注运行端，再补明确元数据；不猜支持列表 |
| popular-api-15 | 查询“API 概览”，当前 RTSA 目标标题为“RTSA C API 参考”，首批主要命中头文件参考 | 文档同学确认概览页名称/入口意图，开发再决定标题同义关系或排序规则 |
| popular-api-16 / 34 / 40 | 查询用户/主播/频道列表的旧目标未收录；当前导航没有这三个生成端点，不能因静态文件存在就强行纳入 | 内容负责人确认是否继续支持、是否需要恢复导航及内容 |
| popular-api-24 / 30 | 旧目标是 RTM 通用配置重定向；Android 与 Web 现均能找到各自当前“初始配置”页，旧路径严格比较仍报警 | 文档同学确认替代目标；确认后再有记录地更新用例 |
| popular-docs-13 | 实名认证当前归 introduction，历史筛选产品 console 不在搜索产品选项内 | 确认控制台入门内容的产品归属与验收筛选，不将全部 introduction 别名为 console |
| popular-docs-17 | 对话式 AI 计费已迁移到 `/ai/reference/pricing`，旧 API 路径仍在用例中 | 确认新目标和应使用的内容分类 |
| popular-docs-22 / 28 | 云端录制旧开通服务/REST 快速开始已由 `/realtime-media/cloud-recording/get-started/quick-start/*` 承接 | 确认当前快速开始是否覆盖旧用户任务及不同语言平台 |
| popular-docs-27 | 历史 analytics 产品概述 API 路径与当前“水晶球概览”导航不同 | 确认水晶球的新入口能否作为等价承接 |
| popular-docs-32 | 云端录制计费当前位于 `/realtime-media/cloud-recording/reference/billing-strategy/billing` | 确认新目标及分类/平台范围 |
| popular-docs-34 | 云端录制回调概览当前位于 `/realtime-media/cloud-recording/reference/ncs-events`，属于产品文档 | 确认新目标及由 API 分类转产品文档的验收口径 |

以上路径说明以当前构建及索引排查为据，不代表已取得文档负责人的签收。`荣耀`、`120`、泛搜 Token 的产品意图也仍需共同定义。

### 页面复测发现的追加摘要修复

实际打开 `audioScenario` 的产品文档视图时，“优化端到端对话延迟”等摘要仍出现 `iOS tabGroup="language"`。根因是原清理只移除了代码围栏及语言名，保留了围栏后的分组属性；不是搜索排序问题。

追加清理完整或裁切至属性中间的代码围栏元数据，保留高亮、正文及普通文字中的 `tabGroup` 变量。针对性测试先失败再通过；页面复查未再显示该标记。检查的是 UI 实际使用的 `highlights.content`，原始 `content` 保留 Markdown 源文并不等于界面泄漏。原始对照见 `continued-snippet-ui-evidence.json`。

追加修复后再次运行 287 项，页面/章节顺序及命中数变化为 0；未重新建索引，因为此处只处理查询后的展示摘要。最新查询文件为 `continued-post-snippet.json`。

### 最终本地检查结果

| 检查 | 本次结果 | 证据与限制 |
| --- | --- | --- |
| 全量单测 | **318 文件、5,015 条通过，2 条跳过，退出 0** | `continued-snippet-full-tests.log`；包含追加摘要用例。日志有 socket hang up 输出，但没有失败用例 |
| 类型检查 | 退出 0 | `continued-snippet-types.log` |
| 改动 TS/TSX 检查 | 19 文件通过，退出 0；diff 空白检查通过 | `continued-snippet-biome.log`；未修改仓库全局格式规则 |
| 中文全量静态构建 | 退出 0，6,832 个 route HTML | `continued-final-build-retry.log`；此后仅追加搜索 API 调用的摘要清理及其测试，未再次运行整个静态构建；最终发布 SHA 仍须执行干净的完整流水线 |
| 最终独立 API 构建 | 摘要追加修复后重建，退出 0 | `continued-snippet-service-build.log`；实际启动 `.output/server/index.mjs` 验证 |
| 同次构建导出 | 57,894 条记录、2,561 页面；与引擎验证输入逐字节一致 | `continued-final-export.log`、`continued-final-records-consistency.json`；records 文件 SHA256 `774625d4eb028dc339f39518a4a7a8ceeef14406643de9d097bae2726f380ae2` |
| 覆盖审计 | **退出 1，未通过**；20 个 genuineMissingToc 与基线相同 | `continued-final-coverage-audit.json`；无效索引锚点、坏 TOC 目标、平台错配、错误面板、版本错配、排除产品混入均为 0；otherPlatformToc 97、duplicateIdsAcrossPanels 153 也与基线相同。既有问题不等于门禁可以跳过 |
| 真实引擎查询 | 287 项；相对上一候选无新增零结果，已展示精确 API 页面/章节无丢失 | `continued-final-receipt.json`；索引 `local_continued_final__b36a2e5ed55b46398df4a712d8fda964`；追加摘要后顺序/数量变化 0，见 `continued-snippet-rank-consistency.json` |
| 最终构建 API 的 HTTP 检查 | Top30 × all/docs/api/faq 共 120 次，全部 200；音频展示摘要无分组属性泄漏 | `continued-snippet-built-service-http.json`；200 只证明可用性，严格质量告警仍然保留 |
| 实际页面点击 | API/FAQ 分类、大小流配置章节与 FAQ、RTSA License+C、RESTful 端点、JavaScript→Web 点击/刷新 | 下面的新截图；不是全量页面或所有锚点的人工验收 |

中断前并行构建/测试曾造成 5 个 suite 加载失败：静态生成阶段的 Fumadocs 动态集合缓存与普通测试加载不兼容。此次在构建完成后重新生成普通缓存，串行运行类型检查和全量测试，最终通过；未改应用代码去掩盖这个缓存问题。自动生成的更新时间文件已恢复，未混入搜索 diff。

### 最新页面截图与复测步骤

本节全部来自本机 `127.0.0.1:3149` 的当前隔离索引；它们是新增截图，前面七类中的旧候选截图仍保留作历史。图片目录为忽略的 `.agent/artifacts/cn-search-optimization-20261029/screenshots/continued/`，不提交、不上传。

**1. 搜“大小流”，保持“全部文档”。** 现在先看到术语解释和双流配置步骤，再是发版说明。点击第二张的“1. 发流端开启双流模式”，应打开含 `enableDualStream`、`setLowStreamParameter` 的 Web 指南；本次实际点击后章节标题距视口顶部约 134px。适用性仍需注意：这篇是 Web 指南，不等于 Android 也适用这篇。

![最新大小流搜索：概念和配置章节先于发版说明](/Users/yuzhuopeng/Documents/Codex/2026-09-16/zh-g/docs-portal/.agent/artifacts/cn-search-optimization-20261029/screenshots/continued/dual-stream-all.jpg)

![点击双流配置章节后的真实指南](/Users/yuzhuopeng/Documents/Codex/2026-09-16/zh-g/docs-portal/.agent/artifacts/cn-search-optimization-20261029/screenshots/continued/dual-stream-guide.jpg)

**2. 同一个词切“FAQ”。** “如何处理视频模糊问题？”仍可见，摘要包含检查收到大流还是小流的排查建议。

![大小流 FAQ 仍保留视频模糊排查](/Users/yuzhuopeng/Documents/Codex/2026-09-16/zh-g/docs-portal/.agent/artifacts/cn-search-optimization-20261029/screenshots/continued/dual-stream-faq.jpg)

**3. 搜 `audioScenario`，切“产品文档”。** 第一张为“设置音频编码属性 → 一对一互动教学”，可展开其他场景；这是场景选择和配置的说明，不是要求产品文档复制 API 参数列表。

![audioScenario 优先出现实际配置说明](/Users/yuzhuopeng/Documents/Codex/2026-09-16/zh-g/docs-portal/.agent/artifacts/cn-search-optimization-20261029/screenshots/continued/audio-scenario-docs.jpg)

**4. 搜 `joinChannel`，依次点击“API 文档”和“FAQ”。** 两者均显示各自卡片，不能出现“搜索暂时不可用”。这是本地当前契约可用性的验证；Staging 尚未发布此候选。

![实际切换 API 分类后有结果](/Users/yuzhuopeng/Documents/Codex/2026-09-16/zh-g/docs-portal/.agent/artifacts/cn-search-optimization-20261029/screenshots/continued/joinchannel-api.jpg)

![实际切换 FAQ 分类后有结果](/Users/yuzhuopeng/Documents/Codex/2026-09-16/zh-g/docs-portal/.agent/artifacts/cn-search-optimization-20261029/screenshots/continued/joinchannel-faq.jpg)

**5. 验证筛选不误删共享页。** 搜“申请和使用 License”，产品选“媒体流加速”、平台选 C、分类选产品文档，仍可见对应指南；搜“创建对话式智能体”，产品选对话式 AI 引擎、平台选服务端（URL 参数 restful）、分类选 API，首张为对应生成端点。

![RTSA 和 C 筛选下 License 指南仍可见](/Users/yuzhuopeng/Documents/Codex/2026-09-16/zh-g/docs-portal/.agent/artifacts/cn-search-optimization-20261029/screenshots/continued/rtsa-license-c.jpg)

![RESTful 筛选下生成端点仍可见](/Users/yuzhuopeng/Documents/Codex/2026-09-16/zh-g/docs-portal/.agent/artifacts/cn-search-optimization-20261029/screenshots/continued/restful-api.jpg)

**6. 搜“屏幕共享 JavaScript”，点第一张屏幕共享。** 本次真实点击进入 `/screen-share/web`；刷新后截图仍为 Web 标签选中。该样例不能替代其余平台和全部锚点验收。

![JavaScript 搜索命中 Web 指南](/Users/yuzhuopeng/Documents/Codex/2026-09-16/zh-g/docs-portal/.agent/artifacts/cn-search-optimization-20261029/screenshots/continued/javascript-search-web.jpg)

![点击后刷新仍保持 Web](/Users/yuzhuopeng/Documents/Codex/2026-09-16/zh-g/docs-portal/.agent/artifacts/cn-search-optimization-20261029/screenshots/continued/javascript-web-refresh.jpg)

### 当前交付与发布结论

本地新增修复及证据已落盘，预览页继续保留；仍未提交、推送、部署或切换远端索引。**不回退验收仍未通过**：严格目标/排名告警、20 项既有目录章节审计、4 个屏幕共享 FAQ 零结果变化、旧路径承接及剩余排序需要处理或取得有依据的共同判断。不能以本地 5,015 条测试通过替代这些验收。

有权限的小伙伴后续需按部署交接发布同一最终 SHA 的静态前端、API 和索引，并提供 Jenkins、前端 SHA、API revision、索引 release 及 records/settings 校验和。S01 线上分类 400 和 S06 旧索引混入须在匹配版本上线后重测，当前不能关闭。

## 2026-11-04：PR #1368 的本地与 Staging 逐项页面对照

本节是最新实际页面观察；之前的 Staging 400 截图属于历史记录。当前 joinChannel 的 API/FAQ 请求均已返回 200，不能继续写成“线上仍 400”。本轮已完成本地代码修复和发布构建页面验证；Staging 快照未更新部署。

Staging 前端 revision：`6edf1e79e8ddad1d7162752388a718cb1557603d`；本地 `http://127.0.0.1:3170` 为发布构建预览，基线 `837c5f58f5b8a59105e7c083a39d627d5032cb31` 加未提交修复。两边后端和索引尚未对齐，不能把环境差异直接解释为代码根因。

原测试报告：[PR #1368](https://github.com/AgoraIO/docs-portal/pull/1368)。本机交互对照页：[逐项查看截图及测试入口](http://127.0.0.1:3168/)，需本机对照服务运行；持久文件为下方忽略目录内的 `index.html`。

| 报告项 | Staging 实际页面 | 本地实际页面 | 判断 |
| --- | --- | --- | --- |
| ISSUE-001：摘要里出现文档内部标记 | 仍有两处 tabGroup="language"，夹在代码片段中。 | 摘要改为手动模式的调用条件和生效说明，不再拼接 Kotlin/Swift/JavaScript 代码；完整代码仍可搜索。 | 本地已修复，待你手测 |
| ISSUE-002：C++ 和 C# 搜出来一样 | 本次页面快照中，C++ 与 C# 的结果区文本和顺序完全相同。 | C# 首篇为下载→通过 NuGet 集成 SDK (C#)；C++ 首篇为下载→下载 SDK (C++)。API 分组首两篇均为对应语言的 API 概览和 API 列表。选 C# 平台也保留明确 C# 的 Windows 接入章节。 | 本地 SDK 入口排序已优化 |
| ISSUE-003：产品名没有优先找到产品入口 | 第一篇“实时消息 SDK 合规使用说明”；首批未见 RTM 概览。 | 第一篇“实时消息 RTM 概览”；本例的产品入口排序已有改善。快速开始的完整体验仍需验收。 | 本地已有改善 |
| ISSUE-004：教程被发版说明挡在默认结果外 | 全部文档：发版说明、插件发版说明；产品文档：教程排第 3。 | 全部文档和产品文档两个视图，“使用虚拟背景插件”均排第 1。 | 本地已有改善 |
| ISSUE-005：刷新时 React 报 418 | 基线已有 6 条；直接打开后 7 条，两次刷新后分别 8、9 条，即每次新增 1 条。结果仍能显示。 | 本地发布构建修复前可复现；修复后直接打开 Token、刷新两次，错误均为 0。带 C# 平台/API 分类直接打开和刷新也正常。 | 本地发布构建已修复 |
| GAP-001：灵动课堂产品入口未见 | 首批为专递课堂、名师课堂、RTC 概览等；筛选列表未列出灵动课堂。 | 源码存在，但按既定退役策略排除公开页面与搜索入口，属于预期行为。 | 已确认：既定下线范围 |
| 补充观察 #25：“如何开启云端录制”仍偏向字幕与排错 | 第一篇录制字幕；第二篇快速开始云端录制，匹配章节为排查错误。 | 产品文档前两篇为“开通云端录制服务”和“快速开始云端录制”，不再以字幕或排错为第一入口。 | 本地操作入口已提前 |

### 逐项操作与截图

以下为浏览器真实页面截图，统一 1280px 内容宽度；常规图只保留前 720px，摘要细节图裁自完整截图。没有替换或伪造页面文字。仅对照报告的 5 项问题、1 项已确认下线范围以及正文第 25 组补充观察，不替代原始 Top30/热门页面的完整回归。

#### ISSUE-001：摘要里出现文档内部标记

**问题：**搜 manualSOS，产品文档摘要中出现 tabGroup="language"，还把不同语言的代码拼接在一起。

**操作：**搜 manualSOS → 保持全部文档 → 找到产品文档分组 → 读“手动控制说话开始和结束”的摘要。

**看哪里：**看“产品文档”中的第一张卡片；下图是从完整页面裁出的该分组，方便直接看摘要。

**当前处理：**请阅读说明摘要，再点击章节确认上下文；部署时同步导出 summary 字段的新索引。

**manualSOS 摘要**

[Staging 测试入口](https://docs-portal-staging.sh3.agoralab.co/search?q=manualSOS&type=all&page=1)：仍有两处 tabGroup="language"，夹在代码片段中。

![ISSUE-001 manualSOS 摘要 Staging](/Users/yuzhuopeng/Documents/Codex/2026-09-16/zh-g/docs-portal/.agent/artifacts/pr1368-review/visual-comparison/manualsos-staging-detail.jpg)

[本地 测试入口](http://127.0.0.1:3170/search?q=manualSOS&type=all&page=1)：摘要改为手动模式的调用条件和生效说明，不再拼接 Kotlin/Swift/JavaScript 代码；完整代码仍可搜索。

![ISSUE-001 manualSOS 摘要 本地](/Users/yuzhuopeng/Documents/Codex/2026-09-16/zh-g/docs-portal/.agent/artifacts/pr1368-review/visual-comparison/manualsos-local-detail.jpg)

#### ISSUE-002：C++ 和 C# 搜出来一样

**问题：**用户搜的是不同编程语言，结果却都优先出现“C 端用户计费策略推荐”。

**操作：**保持全部产品、全部平台、全部文档 → 搜 C++ → 改搜 C# → 对照结果区顺序。

**看哪里：**对照 C++ 与 C# 的结果，再看 C# 平台筛选后的结果；原来的 C 端计费不应出现。

**当前处理：**入口根据真实章节标题与平台识别，未配置文档 URL 置顶；点击和刷新已验证 Windows 落地。当前产品文档在前是因为直接 SDK 下载入口优先，API 分组不会固定放在所有文档前面。

**搜索 C++**

[Staging 测试入口](https://docs-portal-staging.sh3.agoralab.co/search?q=C%2B%2B&type=all&page=1)：本次页面快照中，C++ 与 C# 的结果区文本和顺序完全相同。

![ISSUE-002 搜索 C++ Staging](/Users/yuzhuopeng/Documents/Codex/2026-09-16/zh-g/docs-portal/.agent/artifacts/pr1368-review/visual-comparison/cpp-staging.jpg)

[本地 测试入口](http://127.0.0.1:3149/search?q=C%2B%2B&type=all&page=1)：C# 首篇为下载→通过 NuGet 集成 SDK (C#)；C++ 首篇为下载→下载 SDK (C++)。API 分组首两篇均为对应语言的 API 概览和 API 列表。选 C# 平台也保留明确 C# 的 Windows 接入章节。

![ISSUE-002 搜索 C++ 本地](/Users/yuzhuopeng/Documents/Codex/2026-09-16/zh-g/docs-portal/.agent/artifacts/pr1368-review/visual-comparison/cpp-local.jpg)

**搜索 C#**

[Staging 测试入口](https://docs-portal-staging.sh3.agoralab.co/search?q=C%23&type=all&page=1)：本次页面快照中，C++ 与 C# 的结果区文本和顺序完全相同。

![ISSUE-002 搜索 C# Staging](/Users/yuzhuopeng/Documents/Codex/2026-09-16/zh-g/docs-portal/.agent/artifacts/pr1368-review/visual-comparison/csharp-staging.jpg)

[本地 测试入口](http://127.0.0.1:3149/search?q=C%23&type=all&page=1)：C# 首篇为下载→通过 NuGet 集成 SDK (C#)；C++ 首篇为下载→下载 SDK (C++)。API 分组首两篇均为对应语言的 API 概览和 API 列表。选 C# 平台也保留明确 C# 的 Windows 接入章节。

![ISSUE-002 搜索 C# 本地](/Users/yuzhuopeng/Documents/Codex/2026-09-16/zh-g/docs-portal/.agent/artifacts/pr1368-review/visual-comparison/csharp-local.jpg)

**选择 C# 平台**

[Staging 测试入口](https://docs-portal-staging.sh3.agoralab.co/search?q=C%23&type=all&platform=csharp&page=1)：本次页面快照中，C++ 与 C# 的结果区文本和顺序完全相同。

![ISSUE-002 选择 C# 平台 Staging](/Users/yuzhuopeng/Documents/Codex/2026-09-16/zh-g/docs-portal/.agent/artifacts/pr1368-review/visual-comparison/csharp-filter-staging.jpg)

[本地 测试入口](http://127.0.0.1:3149/search?q=C%23&type=all&page=1&platform=csharp)：C# 首篇为下载→通过 NuGet 集成 SDK (C#)；C++ 首篇为下载→下载 SDK (C++)。API 分组首两篇均为对应语言的 API 概览和 API 列表。选 C# 平台也保留明确 C# 的 Windows 接入章节。

![ISSUE-002 选择 C# 平台 本地](/Users/yuzhuopeng/Documents/Codex/2026-09-16/zh-g/docs-portal/.agent/artifacts/pr1368-review/visual-comparison/csharp-filter-local.jpg)

#### ISSUE-003：产品名没有优先找到产品入口

**问题：**搜“实时消息”，先看到合规说明、Demo、其他产品内容，首批没有 RTM 产品概览。

**操作：**搜“实时消息” → 全部文档 → 对照产品文档第一篇及首批内容。

**看哪里：**只比较“产品文档”分组的第一篇，不跨 API / FAQ 组混算排名。

**当前处理：**本地改善进入同版本部署后的复测清单，不能直接关闭 Staging 问题。

**实时消息 · 全部文档**

[Staging 测试入口](https://docs-portal-staging.sh3.agoralab.co/search?q=%E5%AE%9E%E6%97%B6%E6%B6%88%E6%81%AF&type=all&page=1)：第一篇“实时消息 SDK 合规使用说明”；首批未见 RTM 概览。

![ISSUE-003 实时消息 · 全部文档 Staging](/Users/yuzhuopeng/Documents/Codex/2026-09-16/zh-g/docs-portal/.agent/artifacts/pr1368-review/visual-comparison/rtm-name-staging.jpg)

[本地 测试入口](http://127.0.0.1:3170/search?q=%E5%AE%9E%E6%97%B6%E6%B6%88%E6%81%AF&type=all&page=1)：第一篇“实时消息 RTM 概览”；本例的产品入口排序已有改善。快速开始的完整体验仍需验收。

![ISSUE-003 实时消息 · 全部文档 本地](/Users/yuzhuopeng/Documents/Codex/2026-09-16/zh-g/docs-portal/.agent/artifacts/pr1368-review/visual-comparison/rtm-name-local.jpg)

#### ISSUE-004：教程被发版说明挡在默认结果外

**问题：**搜“虚拟背景”想找配置教程，Staging 的全部文档视图只显示两篇发版说明。

**操作：**搜“虚拟背景” → 看全部文档的产品区 → 点击“产品文档” → 再看教程位置。

**看哪里：**先看“全部文档”，再切换下面“产品文档”。教程在 Staging 产品分类第 3，说明并非完全没有收录。

**当前处理：**保留本地结果，部署匹配索引后按两个视图复测；目前不把问题归因于某一处裁剪代码。

**全部文档：默认首批**

[Staging 测试入口](https://docs-portal-staging.sh3.agoralab.co/search?q=%E8%99%9A%E6%8B%9F%E8%83%8C%E6%99%AF&type=all&page=1)：全部文档：发版说明、插件发版说明；产品文档：教程排第 3。

![ISSUE-004 全部文档：默认首批 Staging](/Users/yuzhuopeng/Documents/Codex/2026-09-16/zh-g/docs-portal/.agent/artifacts/pr1368-review/visual-comparison/virtual-all-staging.jpg)

[本地 测试入口](http://127.0.0.1:3170/search?q=%E8%99%9A%E6%8B%9F%E8%83%8C%E6%99%AF&type=all&page=1)：全部文档和产品文档两个视图，“使用虚拟背景插件”均排第 1。

![ISSUE-004 全部文档：默认首批 本地](/Users/yuzhuopeng/Documents/Codex/2026-09-16/zh-g/docs-portal/.agent/artifacts/pr1368-review/visual-comparison/virtual-all-local.jpg)

**产品文档：教程已收录**

[Staging 测试入口](https://docs-portal-staging.sh3.agoralab.co/search?q=%E8%99%9A%E6%8B%9F%E8%83%8C%E6%99%AF&type=docs&page=1)：全部文档：发版说明、插件发版说明；产品文档：教程排第 3。

![ISSUE-004 产品文档：教程已收录 Staging](/Users/yuzhuopeng/Documents/Codex/2026-09-16/zh-g/docs-portal/.agent/artifacts/pr1368-review/visual-comparison/virtual-docs-staging.jpg)

[本地 测试入口](http://127.0.0.1:3170/search?q=%E8%99%9A%E6%8B%9F%E8%83%8C%E6%99%AF&type=docs&page=1)：全部文档和产品文档两个视图，“使用虚拟背景插件”均排第 1。

![ISSUE-004 产品文档：教程已收录 本地](/Users/yuzhuopeng/Documents/Codex/2026-09-16/zh-g/docs-portal/.agent/artifacts/pr1368-review/visual-comparison/virtual-docs-local.jpg)

#### ISSUE-005：刷新时 React 报 418

**问题：**直接打开或刷新 Token 搜索页，React 检测到服务端与浏览器渲染不一致。

**操作：**直接打开 Token 搜索地址 → 等结果显示 → 刷新一次 → 再刷新一次 → 对照每次新增的日志。

**看哪里：**这不是页面错误弹窗：结果仍可见。看下方浏览器错误计数与原始日志，不能靠截图判断有无 418。

**当前处理：**静态 HTML 先以相同空查询状态完成水合，再应用真实 URL。部署匹配前端后复测；不以开发服务无报错替代发布构建验证。

**Token · 直接打开及刷新**

[Staging 测试入口](https://docs-portal-staging.sh3.agoralab.co/search?q=Token&type=all&page=1)：基线已有 6 条；直接打开后 7 条，两次刷新后分别 8、9 条，即每次新增 1 条。结果仍能显示。

![ISSUE-005 Token · 直接打开及刷新 Staging](/Users/yuzhuopeng/Documents/Codex/2026-09-16/zh-g/docs-portal/.agent/artifacts/pr1368-review/visual-comparison/token-staging.jpg)

[本地 测试入口](http://127.0.0.1:3170/search?q=Token&type=all&page=1)：本地发布构建修复前可复现；修复后直接打开 Token、刷新两次，错误均为 0。带 C# 平台/API 分类直接打开和刷新也正常。

![ISSUE-005 Token · 直接打开及刷新 本地](/Users/yuzhuopeng/Documents/Codex/2026-09-16/zh-g/docs-portal/.agent/artifacts/pr1368-review/visual-comparison/token-local.jpg)

日志按累计值记录：Staging `6 → 7 → 8 → 9`，本地 `0 → 0 → 0 → 0`。直接打开及两次刷新均新增 1 条 Staging 418；两边结果仍可见。本地发布构建修复前已复现、修复后无新增；最终线上仍需同版本部署复测。

[原始浏览器错误日志](/Users/yuzhuopeng/Documents/Codex/2026-09-16/zh-g/docs-portal/.agent/artifacts/pr1368-review/visual-comparison/hydration-rounds.json)

#### GAP-001：灵动课堂产品入口未见

**问题：**旧站有灵动课堂入口；本次新站首批只看到教育信息化与 RTC 等内容。

**操作：**搜“灵动课堂” → 看产品文档首批 → 打开“全部产品” → 核对是否有灵动课堂选项。

**看哪里：**看前几篇的标题；另有产品筛选展开截图与文本，可核对两边列表均未列出灵动课堂。

**当前处理：**向测试同学说明 PR #1248 的下线决定；只有负责人改变产品范围后才讨论恢复。

**灵动课堂 · 默认结果**

[Staging 测试入口](https://docs-portal-staging.sh3.agoralab.co/search?q=%E7%81%B5%E5%8A%A8%E8%AF%BE%E5%A0%82&type=all&page=1)：首批为专递课堂、名师课堂、RTC 概览等；筛选列表未列出灵动课堂。

![GAP-001 灵动课堂 · 默认结果 Staging](/Users/yuzhuopeng/Documents/Codex/2026-09-16/zh-g/docs-portal/.agent/artifacts/pr1368-review/visual-comparison/flexible-classroom-staging.jpg)

[本地 测试入口](http://127.0.0.1:3149/search?q=%E7%81%B5%E5%8A%A8%E8%AF%BE%E5%A0%82&type=all&page=1)：源码存在，但按既定退役策略排除公开页面与搜索入口，属于预期行为。

![GAP-001 灵动课堂 · 默认结果 本地](/Users/yuzhuopeng/Documents/Codex/2026-09-16/zh-g/docs-portal/.agent/artifacts/pr1368-review/visual-comparison/flexible-classroom-local.jpg)

**展开产品筛选**

[Staging 测试入口](https://docs-portal-staging.sh3.agoralab.co/search?q=%E7%81%B5%E5%8A%A8%E8%AF%BE%E5%A0%82&type=all&page=1)：首批为专递课堂、名师课堂、RTC 概览等；筛选列表未列出灵动课堂。

![GAP-001 展开产品筛选 Staging](/Users/yuzhuopeng/Documents/Codex/2026-09-16/zh-g/docs-portal/.agent/artifacts/pr1368-review/visual-comparison/flexible-products-staging.jpg)

[本地 测试入口](http://127.0.0.1:3149/search?q=%E7%81%B5%E5%8A%A8%E8%AF%BE%E5%A0%82&type=all&page=1)：源码存在，但按既定退役策略排除公开页面与搜索入口，属于预期行为。

![GAP-001 展开产品筛选 本地](/Users/yuzhuopeng/Documents/Codex/2026-09-16/zh-g/docs-portal/.agent/artifacts/pr1368-review/visual-comparison/flexible-products-local.jpg)

#### 补充观察 #25：“如何开启云端录制”仍偏向字幕与排错

**问题：**这是报告正文的补充观察，未被单列为 ISSUE：自然语言想找开启步骤，结果先出现录制字幕。

**操作：**搜完整句“如何开启云端录制” → 全部文档 → 看产品文档前两篇及蓝色章节链接。

**看哪里：**左侧是修复前字幕/排错；右侧看开通与快速开始两个操作入口。

**当前处理：**请确认“开启”是开通服务还是启动录制任务；两个直接入口均保留可见，不固定写死某篇置顶。

**完整自然语言查询**

[Staging 测试入口](https://docs-portal-staging.sh3.agoralab.co/search?q=%E5%A6%82%E4%BD%95%E5%BC%80%E5%90%AF%E4%BA%91%E7%AB%AF%E5%BD%95%E5%88%B6&type=all&page=1)：第一篇录制字幕；第二篇快速开始云端录制，匹配章节为排查错误。

![补充观察 #25 完整自然语言查询 Staging](/Users/yuzhuopeng/Documents/Codex/2026-09-16/zh-g/docs-portal/.agent/artifacts/pr1368-review/visual-comparison/natural-recording-staging.jpg)

[本地 测试入口](http://127.0.0.1:3170/search?q=%E5%A6%82%E4%BD%95%E5%BC%80%E5%90%AF%E4%BA%91%E7%AB%AF%E5%BD%95%E5%88%B6&type=all&page=1)：产品文档前两篇为“开通云端录制服务”和“快速开始云端录制”，不再以字幕或排错为第一入口。

![补充观察 #25 完整自然语言查询 本地](/Users/yuzhuopeng/Documents/Codex/2026-09-16/zh-g/docs-portal/.agent/artifacts/pr1368-review/visual-comparison/natural-recording-local.jpg)

证据目录：`/Users/yuzhuopeng/Documents/Codex/2026-09-16/zh-g/docs-portal/.agent/artifacts/pr1368-review/visual-comparison`。截图与 QA 文件保持忽略，不提交 Git、不上传到 PR。

## 2026-11-04：本轮本地修复、手测与待确认清单

### 修复范围与提交状态

本轮针对 PR #1368 在当前本地仍能复现的问题继续修复；没有改变灵动课堂既定下线范围，没有操作 Staging/Jenkins。当前分支 `codex/cn-newdoc-html-api-migration`，基线 `837c5f58f5b8a59105e7c083a39d627d5032cb31`，本会话的搜索优化仍为未提交工作区改动。按用户要求先交付本地手测，收到反馈后再提交；未推送、未部署。

| 本轮问题 | 原因与处理 | 当前可见结果 |
| --- | --- | --- |
| C++ 和 C# 结果相同，误匹配 C 端计费 | 引擎分词丢失语言符号；查询与索引统一生成 `cplusplus` / `csharp` 语言词，展示文字不变 | 两个查询返回不同语言相关文档，不再以 C 端计费作为首批匹配。默认哪篇 SDK 入口应第一，仍待确认 |
| 搜 C#，选 C# 平台后仍混入无平台文档 | 原筛选允许平台为空的共享页；仅对语言意图查询收紧为明确平台匹配 | C# 筛选后出现 C#“关键概念”和 C# Windows API。产品文档在上面本身不是错误，要看内容是否属于 C# |
| manualSOS 摘要夹杂多语言代码及 tabGroup | 原来直接从全部可检索正文裁摘要；新增独立说明摘要，保留行内参数名，剔除代码围栏和代码标签页 | 产品卡片显示手动模式调用条件及生效说明，完整代码仍保留在检索正文中 |
| 代码标签页有空行时仍泄漏代码 | HTML 标签页被 Markdown 解析器切段；在独立摘要解析前移除整个代码容器，保持原始章节偏移 | HTTP 基本认证的示例章节摘要只显示 Authorization 说明。支持 CodeBlockTab、CodeBlockTabs、CodeBlockTabsContent 三种容器；真实语料有 152 条摘要更新 |
| “如何开启云端录制”先出现字幕/排错 | 补通用的“开启→开始/开通/启用”同义关系，并加入词典 | 产品文档前两篇为“开通云端录制服务”“快速开始云端录制”；已点击第一篇并确认开通步骤正文正常 |
| 发布构建直接打开搜索页报 React 418 | 静态 HTML 为统一空搜索页，浏览器首帧却使用 URL 查询/筛选，导致水合树不同；先完成一致的初始渲染，再应用真实 URL 状态 | 修复前本地发布构建可复现；修复后 Token 直接打开及两次刷新均无新增错误。C# + C# 平台 + API 分类直接访问和刷新也正常 |

以上采用查询、索引字段、摘要提取和渲染初始化的共用规则，没有给单个测试词配置文档 URL 置顶。曾试过全局严格平台筛选，真实回归发现 RTSA 演示/计费等 4 项变成零结果，已经撤回该做法；仅语言查询收紧，普通共享文档继续保留。

此前本地已有的修复继续保留：RTM/RTMP 各自产品概览优先，虚拟背景教程优先，大小流概念/配置先于发版说明，audioScenario 精确 API 和指南配置说明提前，JavaScript 屏幕共享打开 Web，当前版本索引及 API/FAQ 分类可用。它们不全是本轮新增修改。

### 现在请这样手动测试

**主测试入口是 `http://127.0.0.1:3170`，为本地发布构建；`3149` 是开发服务。** 两者使用同一个本地隔离引擎/候选索引，均不是 Staging。对照图入口：[逐项看修复前后截图](http://127.0.0.1:3168/)。对照左侧保留 11-04 的 Staging 快照，右侧已补拍当前本地发布页；不要把左侧旧图当成已经部署本轮代码。

| 测试入口 | 页面操作 | 主要看什么 |
| --- | --- | --- |
| [C++](http://127.0.0.1:3170/search?q=C%2B%2B&type=all&page=1) / [C#](http://127.0.0.1:3170/search?q=C%23&type=all&page=1) | 来回比较两个词；C# 页面点“展开”再选 C# 平台 | 两个查询结果不同、没有 C 端计费误匹配；筛选后为 C# 相关内容。裸搜的 SDK 首推质量请给反馈 |
| [C# 平台](http://127.0.0.1:3170/search?q=C%23&type=all&platform=csharp&page=1) | 对照不选平台的页面，再切 API 文档 | 产品区可以有正确的 C#“关键概念”，API 区是 C# Windows；不以“API 必须排在所有产品文档上面”作为门槛 |
| [manualSOS](http://127.0.0.1:3170/search?q=manualSOS&type=all&page=1) | 找产品文档分组，阅读第一篇摘要，再点击章节 | 说明调用条件和生效行为，不再是多语言代码拼接或 tabGroup 字样；API 的优先展示保留 |
| [如何开启云端录制](http://127.0.0.1:3170/search?q=%E5%A6%82%E4%BD%95%E5%BC%80%E5%90%AF%E4%BA%91%E7%AB%AF%E5%BD%95%E5%88%B6&type=all&page=1) | 看产品区前两篇，分别打开 | “开通云端录制服务”和“快速开始云端录制”。请确认你希望开通服务还是启动录制任务优先 |
| [Token](http://127.0.0.1:3170/search?q=Token&type=all&page=1) | 直接打开，再刷新两次 | 查询和结果保留；React 418 需看浏览器日志，不能只凭页面仍显示结果判断 |
| [实时消息](http://127.0.0.1:3170/search?q=%E5%AE%9E%E6%97%B6%E6%B6%88%E6%81%AF&type=all&page=1) / [虚拟背景](http://127.0.0.1:3170/search?q=%E8%99%9A%E6%8B%9F%E8%83%8C%E6%99%AF&type=all&page=1) | 保持全部文档 | 各自产品区第一篇为 RTM 概览、使用虚拟背景插件 |
| [大小流](http://127.0.0.1:3170/search?q=%E5%A4%A7%E5%B0%8F%E6%B5%81&type=all&page=1) | 看产品区前两篇，打开配置章节 | 先术语库“双流模式”，再“多人视频场景→发流端开启双流模式”，均先于发版说明 |
| [audioScenario](http://127.0.0.1:3170/search?q=audioScenario&type=all&page=1) | 查看 API 和产品文档，再改搜 audioScenario 示例 | API 直接定义优先；产品文档第一篇为“设置音频编码属性”。加“示例”时不要求与裸搜相同排序，示例最佳目标仍待确认 |
| [joinChannel](http://127.0.0.1:3170/search?q=joinChannel&type=all&page=1) | 依次点击 API 文档、FAQ | 两个分类都显示结果，不能出现“搜索暂时不可用” |

请反馈“关键词 + 产品/平台/类型筛选 + 哪张卡片不合理 + 你希望找到哪篇”。反馈可以是排序选择；无需重新整理测试报告。

**当前修复后的 manualSOS 产品说明摘要（真实页面裁切）：**

![manualSOS 修复后的说明摘要](/Users/yuzhuopeng/Documents/Codex/2026-09-16/zh-g/docs-portal/.agent/artifacts/pr1368-review/visual-comparison/manualsos-local-detail.jpg)

**C# 语言平台筛选（真实页面）：**

![C# 平台筛选后](/Users/yuzhuopeng/Documents/Codex/2026-09-16/zh-g/docs-portal/.agent/artifacts/pr1368-review/visual-comparison/csharp-filter-local.jpg)

**录制自然语言查询（真实页面）：**

![录制自然语言查询](/Users/yuzhuopeng/Documents/Codex/2026-09-16/zh-g/docs-portal/.agent/artifacts/pr1368-review/visual-comparison/natural-recording-local.jpg)

### 需要确认或协作的清单

| 事项 | 当前事实 / 为什么未直接改 | 谁来确认或继续处理 |
| --- | --- | --- |
| 裸搜 C# / C++ 的第一篇目标 | 已按用户“继续优化”追加处理：优先对应语言 SDK 下载/接入入口，API 分组优先概览/列表，详见文末追加章节 | 本地实现及页面点击已验证，待用户手测签收；不再停留在仅区分语言阶段 |
| “如何开启云端录制” | 开通服务与发起任务是两个操作；现已让开通和快速开始都可见 | 用户/文档同学确认哪个是该查询的首要任务 |
| 大小流 / audioScenario 的验收目标 | 当前概念、配置已提前；是否概念或操作优先、示例查询具体对应哪篇，以及旧目标“媒体流回退”的替代关系尚未签收 | 用户/文档同学确认目标，更新验收用例，不能擅自改历史答案来消除告警 |
| 共享页的平台适用范围 | 无平台标签不等于适用于所有 SDK；全局排除又会误伤计费、许可证等共享页 | 文档元数据审查；当前仅收紧语言查询，其他共享页保持兼容 |
| 历史基线与覆盖审计 | 既有严格排名告警、4 个屏幕共享 FAQ 零结果变化、20 项目录章节覆盖告警、旧路径承接等尚未完成签收 | 开发继续核对最新合入分支（含已合入 #1342 的覆盖修复），整合后执行最终全量构建/覆盖与回归；这些是工程待办，不能仅靠产品确认关闭 |
| Staging 一致性和发布验收 | 本地修复没有自动出现在 Staging；前端、API、索引三个层次必须匹配；此前 400 是历史现象，11-04 API/FAQ 已返回 200 | 有权限的小伙伴按部署交接文档发布并给 SHA / 索引回执，再用同词同视图复测。用户无 Jenkins/Staging 权限 |
| 灵动课堂 | 源码仍在，但已合入 #1248 明确不发布/不搜索 | 属于既定范围，不恢复入口；不代表已确认该商业服务停止运营，也不作为本轮新增搜索缺陷 |

### 本轮验证与边界

- 全量测试：**5,029 通过、2 跳过、0 失败**；`bun run types:check`、`bun run lint`、`git diff --check` 通过。代码检查有 19 个既有 warning、5 个 info，不表述为零告警。
- 搜索 API 发布构建通过。静态应用构建通过，**仅预渲染 `/` 与 `/zh-CN/search` 两条路由**，用于验证搜索页 React 水合；不等于本轮最终全站全路由发布通过。
- 本地真实引擎语料 **57,894 条记录 / 2,561 页**。最后代码容器修补以同一已导出的语料重算摘要，匹配 57,894 条 ID，仅 152 条摘要变化；保留原始内容、URL、平台和先前的 HTML 锚点验收记录，没有伪造新全站 HTML 验证。
- **302 次查询无请求错误、相对本轮修复前无新增零结果**；**110 个既有目标样本未发现新增丢失/名次下降**。最后摘要重算前后 302 次查询分组、页面及章节顺序相同。这里只能说明本轮本地相对回归，不能关闭旧站对照中的全部历史问题。
- React 页面实测：发布构建修复前复现 418；修复后 Token 直接打开和两次刷新日志均为 0，C# 平台/API 分类直接打开和刷新也无新增。曾误读浏览器缓存的旧构建，已改本地预览为不缓存并核验当前构建；不把旧缓存报错当作修复后的验证结果。
- 当前独立测试索引：`local_november_summary__b869cc1d827440989aed275c28b2c11d`；receipt 的 revision 为本地诊断标识 `november-summary`，**不是 Git 提交号，也不是生产发布回执**。
- 本轮证据：`.agent/artifacts/search-local-20261104/`，包含 `full-tests.json`、`types-final.log`、`lint-final.log`、`static-build.log`、`service-build.log`、`summary-queries.json`、`summary-query-delta.json`、`target-delta.json`、`production-hydration-after.json`、`production-filtered-hydration-after.json`、`november-summary-receipt.json`。截图和 QA 数据保持忽略，不提交或上传。

## 2026-11-04：C++ / C# 入口排序追加优化

用户指出裸搜语言名时，本地产品文档首批仍不是直接入口。本轮继续优化语言导航意图，沿用同一份 57,894 条真实语料，未增加依赖、未写死文档 URL、未修改 Staging。

### 根因与修复

1. 原 `languageTerms` 同时覆盖标题、平台与正文，能区分 C++/C#，但不能区分“该语言的 SDK 入口”和“示例中恰好用了该语言”。本轮从真实章节标题及平台派生入口字段，SDK 下载/集成、快速开始、API 概览/列表优先；仅正文提及语言不作为 SDK 入口。迁移、升级和发版说明不作为首次接入入口。
2. 默认查询只允许默认平台副本，Windows 下的“下载 SDK (C++)”“通过 NuGet 集成 SDK (C#)”因此没有进入候选。本轮仅对裸语言导航查询（含 `C# SDK` / `C++ SDK`）额外允许明确的语言 SDK 入口副本，不开放所有平台副本。其他普通查询保持原筛选方式。
3. 返回结果保留真实 Windows / C++ 平台 URL 和锚点，不能把 Windows 章节改链到默认 Web 页。C# / C++ 平台筛选也允许标题明确标示该语言的 SDK 入口，不将它们当作任意无标签共享页放行。
4. 分组顺序参考当前实际命中的入口：直接 SDK 下载/接入说明可以让产品文档在前；只有 API 具备更直接入口时 API 分组在前。全页、弹窗及客户端传输均保留入口信息，未固定“语言名一律 API 在前”。复杂功能查询不套用裸语言导航排序。

### 当前真实结果与手动测试

**本轮最新前端请使用 3149 开发预览。** 搜索 API 已重新构建，连接同一隔离索引；3170 是上一轮前端发布产物，本轮没有重新执行静态应用构建，不能把其前端当作最新语言分组实现的发布验收。

| 查询/操作 | 现在应该看到 | 已验证 |
| --- | --- | --- |
| [裸搜 C#](http://127.0.0.1:3149/search?q=C%23&type=all&page=1) | 产品区第一篇“下载→通过 NuGet 集成 SDK (C#)”；API 区先“API 概览”“API 列表”，HTTP 认证示例降到下载入口之后 | 真实页面与截图；点击 NuGet 章节并刷新，仍落在 Windows 页对应章节 |
| [裸搜 C++](http://127.0.0.1:3149/search?q=C%2B%2B&type=all&page=1) | 产品区第一篇“下载→下载 SDK (C++)”，随后有 RTM/本地录制/RTC 服务端 SDK 的接入入口；API 区先 RTC C++ 的“API 概览”“API 列表” | 真实页面与截图；点击并刷新后保留 Windows C++ 下载章节，没有 C 端计费误匹配，不再以泛 RTM 概览作为首篇 |
| [C# 平台筛选](http://127.0.0.1:3149/search?q=C%23&type=all&page=1&platform=csharp) | NuGet C# 入口仍可见，保留 Windows 标签；其他产品命中为明确 C# 的“关键概念”，API 为 C# Windows | 真实页面切换 API 分类后，概览/列表仍在前 |
| [C++ API 分类](http://127.0.0.1:3149/search?q=C%2B%2B&type=api&page=1) | C++ 的 API 概览/列表优先，保留各产品可选入口 | 已通过真实引擎查询及页面点击，进入 RTC C++ API 概览（v4.7.0） |

产品文档在前本身不是缺陷：当前是直接 SDK 下载入口先于 API 分组，而不是 HTTP 示例或泛产品概览挡在前面。HTTP 示例仍能搜到，没有因为只出现语言就从索引删除。

![C# 最新入口排序](/Users/yuzhuopeng/Documents/Codex/2026-09-16/zh-g/docs-portal/.agent/artifacts/pr1368-review/visual-comparison/csharp-local.jpg)

![C++ 最新入口排序](/Users/yuzhuopeng/Documents/Codex/2026-09-16/zh-g/docs-portal/.agent/artifacts/pr1368-review/visual-comparison/cpp-local.jpg)

### 最新验证与交付状态

- 最终全量测试 **5,036 通过、2 跳过、0 失败**；类型检查、代码检查、API 构建及 `git diff --check` 通过。第一轮全量运行期间新增了迁移入口的失败用例，出现过该用例失败；完成修复后的最终全量重新运行已全绿，记录分别保留在 `full-tests.json` 与 `full-tests-final.json`，不把中间运行当最终结果。
- 新索引执行同一组 **302 次查询：0 请求错误、0 新增零结果**。只有 C++/C# 的 all/docs/api 与语言平台筛选共 8 项场景顺序变化，其他 **294 项的分组、页面、章节顺序一致**。该结果相对上一轮本地候选，不替代与旧站、Staging 的最终验收。
- 最终本地隔离索引 `local_language_final__b060d39950a142428457b09f4478538b`。入口字段由准备索引步骤从同一真实记录重新派生，API 查询与索引设置需一起发布。
- 证据：`.agent/artifacts/search-language-20261104/`；最终查询文件为 `.agent/artifacts/search-local-20261104/language-final-queries.json`，准备回执为该目录的 `language-final-receipt.json`。所有 QA 图片及日志保持忽略，不提交。
- 原 [逐项截图对照页](http://127.0.0.1:3168/) 已更新 C++/C# 三个本地场景及测试链接；Staging 仍为 11-04 的对照快照。其他场景保留上一轮发布预览证据，页面已说明来源。
- 原有覆盖审计、历史目标签收、最新合入分支整合和 Staging 一致部署待办仍有效。当前仍未提交、未推送、未部署；用户手测后处理反馈再提交。


## 2026-11-04：PR 交付复查

用户已要求提交 PR 并通过飞书通知叶佳易协助 build 和复测。本地分支 `codex/cn-search-quality-fixes` 已整合目标分支 `4495f8e1da55472c593af4e30b172ae481079486`，保留上游渲染章节覆盖、摘要标记清理、非默认平台检索及全词匹配等修复。上文“未提交/等待手测”描述均为相应阶段的历史记录。

合并后同一旧语料 302 次查询无请求错误，但相对整合前有 162 项顺序变化、8 项新增零结果；同一候选索引使用最新上游原查询代码，这 8 项也均为零。本轮查询逻辑相对该原查询无新增零结果，但这不能替代最新全量内容导出和发布验收。具体场景、待确认任务和部署顺序见 [build 与复测交接](./2026-11-04-cn-search-build-retest-handoff.md)。不要继续把整合前的 294 项顺序不变或历史覆盖告警数量视为最终版本结论。

新增证据在忽略目录 `.agent/artifacts/search-pr-20261104/`，包含整合版检查日志、隔离引擎集成测试、查询变化及同索引归因记录。尚未操作 Jenkins、Staging 部署或正式域名切流。

最终提交前检查：整合版全量测试 **5,593 通过、6 跳过、0 失败**，另单独开启的真实引擎集成测试 **4/4 通过**；类型检查、lint 和搜索 API 构建通过。最终全站静态 build / 覆盖审计 / Staging 复测待协作完成。


## 2026-11-12：API 查询通用排序

本轮将准确 API 名称识别及技术文档正文用法权重推广到同类查询，未按单个接口或文档 URL 置顶。规则、Top30 回归、全量本地索引及发布边界见 [通用修复验收记录](2026-11-12-cn-search-api-intent-ranking.md)。交付分支为 `codex/cn-search-api-intent-ranking`，当前已完成本地候选验证，Staging 尚未部署；对照截图保存在该记录说明的忽略目录中。
