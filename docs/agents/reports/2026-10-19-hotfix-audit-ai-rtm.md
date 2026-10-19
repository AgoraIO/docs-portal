# 热更新 PR 覆盖审计：AI、RTM 及跨平台 API

审计日期：2026-10-19。目标基线：`7c6c60ead44406e69906c5c3808cd489784aa89e`。

结论：本组 11 个 PR 中，完整覆盖 3 个、部分覆盖 7 个、未覆盖 1 个。不能认为全部热更新已在 docs-portal 生效。

## 方法和边界

- 以原仓库 PR 的实际 diff 和固定 merge commit 为一手来源，逐项检查目标正文、平台分支、共享内容展开结果、SDK 下载数据和维护中的 OpenAPI；不以提交历史相似度作为覆盖依据。
- 本文所有目标路径相对于 docs-portal 根目录，行号固定于上述基线。源仓库只读；未读取环境变量文件，也未修改用户源工作区。
- “完整覆盖”指对应 PR 的用户可见修改均找到等价内容；不要求保留旧 Docusaurus JSX 或导航布局。“部分覆盖”表示至少存在明确反证；有新发版说明并不等于所有 API、平台或共享片段都已更新。
- 这是仓库内容审计，不是生产环境部署验证，也没有逐页渲染。OpenAPI 运行时使用 `src/lib/openapi/source-text.server.ts:11,54` 的中文 YAML bundled source；`src/lib/openapi/lanes.ts:81` 指向同一维护文件。工作树没有生成的 `public/openapi/conversational-ai/rest-api.zh-CN.yaml`，不能据此认定运行时内容缺失。

## 逐 PR 状态

| PR | 状态 | 最重要的结果 |
| --- | --- | --- |
| [#2064](https://github.com/AgoraIO/shengwang-doc-source/pull/2064) | 完整覆盖 | STT 首页 Demo 已改成国内地址。 |
| [#2063](https://github.com/AgoraIO/shengwang-doc-source/pull/2063) | 部分覆盖 | ASR 指南、Go/Python、OpenAPI 已更新；TypeScript API 仍声称 FengmingSTT 无参数。 |
| [#2067](https://github.com/AgoraIO/shengwang-doc-source/pull/2067) | 部分覆盖 | Web v2.3 发版说明有了，但 API、下载、退休政策仍留旧内容。 |
| [#2069](https://github.com/AgoraIO/shengwang-doc-source/pull/2069) | 部分覆盖 | 小程序主要指南已迁移；首页平台/下载入口和 API 限制平台边界未完整保留。 |
| [#2074](https://github.com/AgoraIO/shengwang-doc-source/pull/2074) | 部分覆盖 | v2.12 指南和客户端新 API 已有；共享安装片段、TS 工具配置、OpenAPI think append 等遗漏。 |
| [#2102](https://github.com/AgoraIO/shengwang-doc-source/pull/2102) | 完整覆盖 | 112 事件新指标命名与数组结构、示例均已迁移。 |
| [#2107](https://github.com/AgoraIO/shengwang-doc-source/pull/2107) | 未覆盖 | 三种 Agents SDK 安装命令仍固定旧版本。 |
| [#2101](https://github.com/AgoraIO/shengwang-doc-source/pull/2101) | 部分覆盖 | v2.13 指南、Go/Python、OpenAPI 已更新；TS API 未补上下文字段说明及公开类型别名。 |
| [#2110](https://github.com/AgoraIO/shengwang-doc-source/pull/2110) | 部分覆盖 | aPaaS 文字和导航已隐藏；源 PR 删除的架构图仍保留，未视觉核验图片。 |
| [#2118](https://github.com/AgoraIO/shengwang-doc-source/pull/2118) | 完整覆盖 | 小程序四个 API 的完整 event 参数、说明和示例均已迁移。 |
| [#2056](https://github.com/AgoraIO/shengwang-doc-source/pull/2056) | 部分覆盖 | Token 回调修改存在跨平台、同页不同回调不一致。 |

## #2064：STT 国内体验链接

源 merge：[`83262f3678ba6cb9b1cdba64793d761d6599306e`](https://github.com/AgoraIO/shengwang-doc-source/commit/83262f3678ba6cb9b1cdba64793d761d6599306e)。源只修改 `docs/speech-to-text/landing-page.mdx` 的在线体验链接。

目标 `content/docs/zh-CN/realtime-media/speech-to-text/index.mdx:15` 已使用 `https://stt-demo-cn.shengwang.cn/`，完整覆盖。另有 `get-started/quick-start.mdx:192` 保留 `stt-demo.agora.io`，但该页不属于此 PR 的修改范围，不能据此把该 PR 判为遗漏。

## #2063：ConvoAI v2.11 ASR 热词

源 merge：[`8a40a93329aec856e6ff0f2192e7ab1cd4ec2fd0`](https://github.com/AgoraIO/shengwang-doc-source/commit/8a40a93329aec856e6ff0f2192e7ab1cd4ec2fd0)。源涉及三种 Agents SDK API、导航、发版说明、新 ASR 热词指南和 REST YAML。

已覆盖：

- `content/docs/zh-CN/ai/release-notes.mdx:129` 起有 v2.11；`ai/build/custom-model-integration/asr-keywords.mdx:4,11,27,87,120` 有三种 SDK 和 REST 示例、SDK v2.6.0 前提、128 热词限制；同目录 `meta.json:5` 有导航。
- `content/docs/zh-CN/api-reference/conversational-ai/agent-go/index.mdx:800,807` 有可选 `FengmingSTTOptions` 和 `Keywords`；`agent-python/index.mdx:879,894` 有 `keywords`。
- `content/openapi/conversational-ai/rest-api.zh-CN.yaml:143` 起有 `asr.keywords`、vendor 条件、128 个上限。Python 使用 `asr.keywords` 而非原 PR 的 `asr.params.keywords`，是 #2074 后续修正，不是遗漏。

明确遗漏：`content/docs/zh-CN/api-reference/conversational-ai/agent-typescript/index.mdx:735` 的 FengmingSTT 小节仍写“无需任何参数”，`:740` 仍为 `new FengmingSTT()`，没有源 PR 新增的 `FengmingSTTOptions`、`keywords`、`additionalParams` 表。与同站 ASR 热词 TS 示例直接矛盾。

## #2067：RTM Web v2.3.0

源 merge：[`c8472ac50360d3ed02993fd87ae112ca45c00e2d`](https://github.com/AgoraIO/shengwang-doc-source/commit/c8472ac50360d3ed02993fd87ae112ca45c00e2d)。源涉及中英文 Web API、版本元信息、JS 错误码、快速开始、Presence、订阅语义、Token 示例和共享下载片段。

已覆盖例证：`content/docs/zh-CN/realtime-media/rtm/reference/release-notes.mdx:1659` 起包含 Web 2.3.0，`:1669` 有 Cloud Proxy 显式开启，`:1675` 有重复实例 `-10027`；`content/docs/zh-CN/api-reference/rtm/web/meta.json:2` 标题也标为 `Web API v2.3.0`。

明确遗漏：

- `content/docs/zh-CN/api-reference/rtm/web/configuration.mdx:11` 仍下载 v2.2.4，`:15` 版本示例仍 2.2.2；`:323` 仍说 8 种事件，`:332,398,428` 仍列举、监听、移除已删除的 `status`。缺源新增 `IntervalDetail` 和 `interval.totalOccupancy` 说明。
- `content/docs/zh-CN/api-reference/rtm/web/enumv.mdx:169,185` 仍保留源 PR 已删除的旧 `connectionreason`、`connectionstate` 章节。
- `content/docs/zh-CN/api-reference/rtm/web/channel.mdx` 未包含新增的 CONNECTING/DISCONNECTED/SUSPENDED 下缓存订阅、Presence 异步加入和取消订阅返回 `-11040` 语义。不能用其他平台 API 的相似说明代替 Web 分支覆盖。
- 共享 `_sdkdownload.mdx` 的更新未传播到 `content/docs/zh-CN/realtime-media/rtm/get-started/quick-start.mdx:1518`、`build/rtm-initialization/application-setup.mdx:48`；两者仍称 v2.2.4 为最新。新下载组件的数据源 `src/components/docs-overview/sdk-downloads-data.zh-cn.ts:1859` 也仍把 v2.2.4 标为最新。
- `content/docs/zh-CN/realtime-media/rtm/reference/sunset-policy.mdx:77` 起的 **JavaScript** 表仍从 v2.2.4 开始，没有源 PR 新增 v2.3.0；同文件其他原生平台的 2.3.0 行不能算 JS 覆盖。
- `content/docs/zh-CN/realtime-media/rtm/build/troubleshooting.mdx:623` 起的 Web 分支缺新增 `RTM_ERROR_DUPLICATE_USER_ID` 和 `RTM_ERROR_CHANNEL_SUBSCRIBE_CANCELED` 条目；`:1893` 的同名 canceled 错误在其他平台分支，不是 Web 证据。

本节已足以证伪完整覆盖；不把中文检查结论自动扩展为英文覆盖结论。

## #2069：RTM 微信小程序

源 merge：[`def3eac1345f015792dd57b3944ec8cb01cc3c98`](https://github.com/AgoraIO/shengwang-doc-source/commit/def3eac1345f015792dd57b3944ec8cb01cc3c98)。源新增小程序平台、首页文档/下载卡、独立指南和错误码，并给共用指南和 10 个共享符号文件补 mini-program 分支。

已覆盖：

- `content/docs/zh-CN/realtime-media/rtm/get-started/quick-start.mdx:5723` 起有 mini-program 分支，包括专用包、WASM、登录、Message Channel、13 个域名白名单和 API 范围提醒。
- `reference/capabilities-and-compatibility/feature-list.mdx:652`、`platform-support.mdx:175`、`reference/release-notes.mdx:3927` 分别保留小程序能力、测试设备、beta.0 发版说明。
- `build/messaging/send-message.mdx:342,651,999` 有小程序发送消息和包体限制分支；`build/authentication-and-connection/user-authentication.mdx:816`、`link-basic.mdx:1461`、`link-state.mdx:1471`、`build/message-design-and-history/history-message.mdx:953`、`build/troubleshooting.mdx:2662` 也有小程序分支。

未完整保留：

- `content/docs/zh-CN/realtime-media/rtm/index.mdx:18` 起的平台卡只有 Web、Android、iOS、Swift、C++、HarmonyOS、Unity、Flutter，没有源 PR 新增的小程序入口；`:65` 的介绍性文字没有带 `?platform=mini-program` 的快速开始链接。内容存在，不等于原新增平台入口生效。
- `src/components/docs-overview/sdk-downloads-data.zh-cn.ts` 没有 `shengwang-rtm-miniapp` / `2.3.0-beta.0` 下载项；源 PR 的小程序 npm 下载卡未在统一下载目录找到等价项。指南仍有专用包，所以不是整项未覆盖。
- 源 `api-limits.mdx` 明确对 mini-program 排除 Stream Channel 章节；目标统一改写后的 `content/docs/zh-CN/realtime-media/rtm/reference/usage-limits-and-errors/api-limits.mdx:5,50,83` 没有小程序不支持 Stream Channel 的排除说明，面向 RTM 2.x 客户端统一列出 Stream Channel 限制。此处平台边界不再与源 PR 的条件一致，需要补充明确适用范围。

注意：源 PR 并未新增一套独立小程序 API 参考，而是要求以包类型定义为准、借用 JS API 理解概念。因此“目标没有独立 mini-program API 目录”本身不作为遗漏。

## #2074：ConvoAI v2.12

源 merge：[`cf942e1c63405f9330d371c8210e440179fe9608`](https://github.com/AgoraIO/shengwang-doc-source/commit/cf942e1c63405f9330d371c8210e440179fe9608)。源涉及三种 SDK API、三端客户端组件、两篇新增指南、共享安装/结构片段、发版说明及 REST YAML。

已覆盖：

- `content/docs/zh-CN/ai/release-notes.mdx:28` 起有 v2.12；`ai/build/shape-the-conversation/rest-tool.mdx` 与 `filler-words.mdx` 都已迁移，`meta.json:8,9` 有导航。承接词被 #2101 后续 v2.13 修订属于正常后续覆盖。
- `content/docs/zh-CN/api-reference/conversational-ai/android/iconversationalaiapi.mdx:26,41`、`ios/conversationalaiapi.mdx:33,48`、`web/conversationalaiapi.mdx:46,60` 有 speak/think；对应三端 struct 和 enum 有新增消息结构与动作枚举。
- `content/openapi/conversational-ai/rest-api.zh-CN.yaml:118,389,2545` 有工具开关、工具列表及 inline_rest_tool schemas；承接词动态配置存在。

明确遗漏：

- 原 `docs/shared/convoai/component-integrate.mdx` 的 2.9.0 → 2.10.0 没有传播。`content/docs/zh-CN/ai/build/handle-runtime-events/event-notifications.mdx:51,71,76,101,107` 的 Android、CocoaPods、SPM、Web/React 都仍为 2.9.0。同类旧片段还在 `ai/build/harden-and-optimize/audio-setup.mdx`、`shape-the-conversation/manual-turn-control.mdx`、`shape-the-conversation/interrupt-agent.mdx`、`build/send-multimodal-messages.mdx` 及 API 参考中的重复指南。
- 原 `component-structure.mdx` 给 iOS 新增 `MessageModels.swift`、`MessagePayloadBuilder.swift`；目标 `content/docs/zh-CN/ai/build/transcripts.mdx:439` 仍旧写法，无这两个文件。
- `content/docs/zh-CN/api-reference/conversational-ai/agent-typescript/index.mdx:562` 起 LLM vendor 参数表缺源新增 `tools: LlmTool[]` 和相关说明；`:323` 起 Type aliases 缺 `FillerWordsContentGeneratedConfig`、`FillerWordsContentMode`、`LlmTool*`。Python `agent-python/index.mdx:374` 起也未保留源新增公开工具类型别名，尽管 `:692` 的 tools 参数已加入。
- 最关键的 REST 遗漏：`content/openapi/conversational-ai/rest-api.zh-CN.yaml:1603,1610,1616` 的三个 think action **仍没有 `append`**，也没有源新增的 enum/default；`:1637` 示例仍 interrupt/interrupt/ignore 而非 append。发版说明和客户端 enum 已有 append，不能代替生成 REST 页面使用的实际 YAML 更新。

源 PR 中的 `docs/superpowers/specs/...` 属原开发设计记录，不作为要求迁移到门户用户文档的内容。

## #2102：112 事件 metrics schema

源 merge：[`dc5be768a220cd6bd1d4ba664741f738ef730bf0`](https://github.com/AgoraIO/shengwang-doc-source/commit/dc5be768a220cd6bd1d4ba664741f738ef730bf0)。只修改 `docs/convoai/webhook/ncs-events.mdx`。

目标 `content/docs/zh-CN/api-reference/conversational-ai/rest-api/webhook/ncs-events.mdx:555,556` 使用 `e2elatencyms` 和 `segmentedlatencyms`，明确后者为 `{ name, latency }` 数组；`:595` 起示例为 940 和六项 latency 数组，包括 `llm_ftfs`。transport 也已改称指标，完整覆盖。

## #2107：Agents SDK 安装使用最新版本

源 merge：[`c201c2234334aab94cae46e98529e9dc8f6d1638`](https://github.com/AgoraIO/shengwang-doc-source/commit/c201c2234334aab94cae46e98529e9dc8f6d1638)。只修改快速开始中的三条安装依赖。

目标 `content/docs/zh-CN/ai/get-started/quick-start-agent.mdx` 的三条均未覆盖：

| 行 | 当前内容 | 源 PR 要求 |
| --- | --- | --- |
| 136 | `go get github.com/AgoraIO/agora-agents-go/v2@v2.4.0` | `...@latest` |
| 150 | `agora-agents==2.4.1` | `agora-agents` |
| 167 | `npm install agora-agents@2.4.0 dotenv@16.4.7` | `npm install agora-agents dotenv@16.4.7` |

其他页面没有锁版本的安装命令不能代替同一快速开始页面被指定修正的三条命令。它也与 ASR 热词指南要求 Agents SDK v2.6.0 及以上产生实际使用矛盾。

## #2101：ConvoAI v2.13 动态承接词

源 merge：[`56896c728432e3592701a6de850c94291a552c8e`](https://github.com/AgoraIO/shengwang-doc-source/commit/56896c728432e3592701a6de850c94291a552c8e)。涉及三种 SDK API、发版、承接词指南和 YAML。

已覆盖：

- `content/docs/zh-CN/ai/release-notes.mdx:5` 有 v2.13；`build/shape-the-conversation/filler-words.mdx:152,338,375,441,469` 等覆盖 20 词/字符、必须配置静态回退、上下文参数、边界值及 Unicode 历史计算规则。复杂表格说明已拆为 Slot，不能只看单元格占位就判缺失。
- `content/docs/zh-CN/api-reference/conversational-ai/agent-go/index.mdx:640,1268,1270` 和 `agent-python/index.mdx:376,378,380` 有静态回退、上下文字段及 Think append 常量。
- `content/openapi/conversational-ai/rest-api.zh-CN.yaml:628,2782,2803,2811,2820` 已改成 fixed_time_config、20 词/字符、上下文限制；不再暴露 filler fallback_strategy/trigger.mode，示例新增两字段。

遗漏：`content/docs/zh-CN/api-reference/conversational-ai/agent-typescript/index.mdx:323` 起只有静态回退和 Think 常量，未迁移源 PR 新增的 `context_message_limit`、`history_character_limit` 及取值/默认值说明，也没有源 PR 修订的公开类型别名段落。Python 的公开类型别名段落同样没有保留。指南里存在字段不代表三个 SDK API 页面全部覆盖。

## #2110：智能门铃隐藏 aPaaS

源 merge：[`77d8e0e67e1bcd60c8f3d37e3cc2a1f02a9a3e3f`](https://github.com/AgoraIO/shengwang-doc-source/commit/77d8e0e67e1bcd60c8f3d37e3cc2a1f02a9a3e3f)。源删除侧栏 aPaaS 入口、弱化首页云平台描述，并将产品介绍中双方案、旧架构图和比较表替换为 PaaS 指引。

目标 `content/docs/zh-CN/solutions/smart-doorbell/index.mdx:5,7,28` 已是设备端/客户端 SDK 和 PaaS 方案；`meta.json:5`、`build/meta.json:3` 没有 aPaaS 导航；目录内搜索无 aPaaS 引用。保留 PaaS-only 表本身属于等价重组。

但 `index.mdx:30` 仍引用源 PR 明确删除的同一旧图 `https://web-cdn.agora.io/docs-files/1666592737672`。因此严格按 changes 覆盖判部分。未视觉检查图像，不断言图内一定还含 aPaaS；后续应确认该图是否适宜保留，而不是不加判断地恢复或删除整个解决方案目录。

## #2118：小程序 API event 参数

源 merge：[`20cd4e0f9e560b203d51d7631aa9312645185ef3`](https://github.com/AgoraIO/shengwang-doc-source/commit/20cd4e0f9e560b203d51d7631aa9312645185ef3)。只修改 `html-docs/rtc/mini-program/classes/client.html` 中四个 update 方法。

目标 `content/docs/zh-CN/api-reference/rtc/mini-program/classes/client.mdx`：

| 方法 | 签名行 | 完整 event 说明行 | 示例行 |
| --- | --- | --- | --- |
| updatePlayerNetStatus | 2684 | 2704 | 2712 |
| updatePlayerStateChange | 2731 | 2751 | 2759 |
| updatePusherNetStatus | 2778 | 2793 | 2801 |
| updatePusherStateChange | 2820 | 2835 | 2843 |

四处均把参数名 detail 改为 event，明确传入 `e` 而非 `e.detail`，并有对应微信组件绑定/处理示例，完整覆盖。

## #2056：12 平台 renewToken 回调说明

源 merge：[`5d03551cf64cd057ccfe8d5b256d9c4778e8fbb1`](https://github.com/AgoraIO/shengwang-doc-source/commit/5d03551cf64cd057ccfe8d5b256d9c4778e8fbb1)。修改 12 个平台 HTML channel API 中的 Token 回调说明：明确 renewToken 无需先离开频道，可选重新入会；支持相应 API 的平台补更新结果回调。

以下目标均位于 `content/docs/zh-CN/api-reference/rtc/<平台>/(current)/channel.mdx`。必须分别核对 onRequestToken 与 onTokenPrivilegeWillExpire；同页出现一次新句不代表两处都更新。

| 平台 | 目标关键行 | 对本 PR 的覆盖 |
| --- | --- | --- |
| android | 2262 / 2335 | request 新；willExpire 仍旧，缺无需离会及结果回调说明。 |
| cpp-all-platforms | 2235 / 2308 | request 新；willExpire 仍旧。 |
| csharp-windows | 2127 / 2225 | 两处仍为“来传入新的 Token”及旧的并列离会步骤。 |
| electron | 1716 / 1802 | 两处已覆盖。 |
| flutter | 1669 / 1756 | 两处已覆盖。 |
| harmonyos | 1196 / 1279 | 两处已覆盖；附加结果回调说明是后续内容，不影响覆盖。 |
| react-native | 1709 / 1795 | 两处已覆盖。 |
| unity | 2009 / 2095 | 两处仍旧，缺无需离会及 OnRenewTokenResult 说明。 |
| unreal-blueprint | 2144 / 2229 | 两处仍旧，缺无需离会说明。 |
| unreal-cpp | 2360 / 2447 | 两处已覆盖。 |
| ios | 2397 / 2489 | request 有新句，但源 PR 修改的 willExpire 仍旧，不能判覆盖。 |
| macos | 2395 / 2487 | 同 iOS，源 PR 修改的 willExpire 仍旧。 |

这里审计的是源 PR 触及的 current API，不把历史 SDK 版本页面的旧语义混入判断。

## 后续处理建议（本审计未执行）

1. 优先同步 #2107 三条依赖命令、#2074 REST think append 和组件安装版本，消除按指南集成与 API 声明不一致的问题。
2. 按平台和回调逐项修复 #2056；按 Web 分支重同步 #2067，不能用其他 RTM 平台的同名字段替代。
3. 补齐 TS Agents API 的热词、工具和承接词上下文；检查共享片段所有展开副本。
4. 补小程序首页/SDK 下载入口并澄清 Stream 适用范围；人工检查智能门铃残留旧图。

本文件只记录研究结论，未修正文、未更新 SDK 依赖、未提交代码。
