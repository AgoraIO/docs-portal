# 中文搜索 Top 关键词对比与防回退检查（2026-10-29）

本次 **未通过不回退验收**。已完成正式站与当前 Staging 的只读实测，共 110 个场景；存在可复现的首批结果退化和筛选后漏召回。未修改搜索策略或远端索引，未部署、提交或推送。

> 本文保留初始正式站/Staging 对比，不代表最新本地候选。后续修复、287 项查询对照、最新截图及未通过项见 [中文搜索修复与验收记录](./2026-10-29-cn-search-optimization.md#继续优化与最终本地复测)。

## 对象与数据

- 正式站 `https://doc.shengwang.cn`，实际搜索 API 为 `https://docportal.shengwang.cn/api/open-api/muti-search`。
- 新版 `https://docs-portal-staging.sh3.agoralab.co`，调用同源 `/api/search`。
- 本地分支 `codex/cn-newdoc-html-api-migration`，HEAD `837c5f58f`。没有可确认的线上 API/索引 revision 回执，不能将本地 SHA 当作线上版本。
- `search-keywords-top30.json`：30 个真实搜索词，2026-07-31 至 2026-10-28；27 个有历史点击目标，3 个没有。保留原大小写和空格。
- `top40.json`：API Reference 40 页、普通文档 40 页，按标题和原产品/平台构造补充测试。这 80 条不是实际搜索词。
- 原文件只作为数据读取，备注不作为操作指令。未重新查询 PostHog；原始文件摘要保存在 fixture。
- 107 个目标映射均核对了 Staging 实际发布的 `__static/docs-routes.json`，涉及 101 个旧路径。路由存在不证明索引收录或页面内容完全等价。

## 口径

排名为同类结果中的页面卡片排名。旧站总览每类展示 5 条章节，按同类前 5 条章节去重为页面；新版按当前 `/api/search?type=all&page=1` 的首批分组卡片计算，不点击加载更多。“首批”指首次加载结果，不是屏幕物理视口。另保存旧站前 20 条章节作为诊断，未当作首屏。

两边分类、平台合并和分页预算不同，这正是用户看到的差异。这些数字不能归因于单一排序规则，也不是统一候选全集上的 Recall/NDCG。章节总命中数有截断及重复，只用于判断零结果，数量增加不代表质量改善。

历史点击页是行为观察，不能当作唯一正确答案。例如 `joinChannel` 的旧点击页是“音强选流”，新版直接提供 API 属于改善；“云录制”的旧点击页是课堂集成说明，新版概览更合理。因此，下表不是相关性通过率。

| 场景 | 场景数 | 正式站首批出现目标 | 新版首批出现目标 | 新版取消筛选后出现目标 |
| --- | ---: | ---: | ---: | ---: |
| 真实 Top30（27 个已知历史目标） | 30 | 20 | 15 | 不适用 |
| 热门 API 标题加范围 | 40 | 19 | 13 | 16 |
| 热门文档标题加范围 | 40 | 40 | 16 | 28 |

110 个场景两侧请求均成功，0 个请求错误。Top30 零结果从 1 个增加到 2 个：`sendRdtMessage` 两边均为 0；`荣耀` 是新增零结果。后者旧站的 83 个章节命中不等于 83 个正确答案，仍需审查相关性。

## 优先处理的风险

1. **大小流**：正式站首条为媒体流回退；新版首批未出现，前列是迁移指南、音强选流及 metadata size API，主题明显偏离。
2. **录制、rtm**：产品入口弱于章节或相近缩写。RTM 概览在产品文档组由 1 降至 6，RTMP 网关在前；“录制”原入口未进入新版首批。
3. **屏幕共享 JavaScript**：明确的平台词没有把对应教程置前，目标由 1 降至 3；`token` 的 RTC 鉴权教程由 2 降至 3。
4. **筛选漏召回**：24 个补充场景的目标在无筛选时可见，加产品/平台后消失。RTSA License 无筛选第 1，`product=rtsa&platform=c` 后消失；实名认证无筛选第 1（product 为 introduction），按 console 产品搜索为 0。需分别审查平台中立文档策略、产品归属和别名、索引元数据，不能统一归因于排序。
5. **分类和版本**：美颜旧站展示技术文档、API、FAQ，新版首批没有 API；部分方法查询中 Android 4.6.0 排在 current 前。当前分支有分族 multi-search，线上仍表现为混合首批，需核对前端、API、索引是否为匹配版本。

浏览器实际操作了两站搜索入口和“美颜”“大小流”结果页，并核对新版零结果。截图位于忽略目录 `.agent/artifacts/cn-search-top-20261029/`。没有做全量链接、锚点或问题解决率验收。

## Top30 逐词复核

“—”表示历史目标未在同类首批出现，或输入没有目标，不表示查询零结果。

| 关键词 | PV | 旧目标排名 | 新目标排名 | 判断 |
| --- | ---: | ---: | ---: | --- |
| 美颜 | 56 | 1 | 1 | 高级美颜保持首位。 |
| 屏幕共享 | 49 | 1 | 1 | 屏幕共享教程保持首位。 |
| 降噪 | 48 | 2 | 1 | AI 降噪教程提前。 |
| 水印 | 37 | — | — | 历史并列页两侧均未进入首批；不能判新增回退。 |
| joinChannel | 34 | 1 | — | 新版直接命中同名 API；旧点击页音强选流不是黄金答案。 |
| token | 28 | 2 | 3 | RTC 鉴权目标后移，新版首条为 RTM Token 服务器。 |
| 大小流 | 28 | 1 | — | 媒体流回退消失，前列主题偏离。 |
| 日志 | 26 | — | — | 新版日志 FAQ 相关；旧 quick-start 不是唯一答案。 |
| 云录制 | 25 | 1 | 3 | 新版首条为云端录制概览，优于旧课堂集成目标。 |
| 录制 | 25 | 1 | — | 云端录制入口消失，新版先出现 FAQ 和录制事件。 |
| rtm | 23 | 1 | 6 | RTM 概览后移，RTMP 网关提前。跨类另有 RTM API。 |
| startOrUpdateChannelMediaRelay | 22 | — | — | 新版直接命中同名 API，旧 Flutter 发版说明不是唯一答案。 |
| 云端转码 | 22 | 1 | 1 | 产品概览保持首位。 |
| simulcast | 21 | 2 | — | 新版命中相关 API，需结合 API/教程意图复核。 |
| 生成token | 21 | — | — | 两边偏向白板 Token，需明确产品意图。 |
| 混淆 | 19 | 3 | 3 | 历史目标保持；新版另有 R8/ProGuard 说明。 |
| 120 | 18 | — | — | 数字意图不明，不设唯一黄金页。 |
| audioScenario | 17 | — | — | 新版命中 AudioScenario 类型；未指定平台，不能强制 Electron。 |
| onConnectionStateChanged | 17 | 1 | 1 | API 可见，历史频道管理教程也在首批。 |
| sendRdtMessage | 17 | — | — | 两边均零结果，属存量缺口。 |
| 直播 | 17 | — | 2 | 新版有秀场概览及极速直播教程，宽泛词无唯一答案。 |
| createClient | 16 | 1 | 2 | 同名 API 均可见，新版 React 包装 API 在 Web API 前。 |
| enableAudioVolumeIndication | 16 | 1 | — | 新版同名 API 可见；历史 HarmonyOS 教程消失不等于相关性退化。 |
| onAudioVolumeIndication | 16 | 1 | 4 | 同名回调可见，旧版 4.6.0 在 current 前需复核。 |
| webrtc | 16 | 1 | 1 | Alexa/WebRTC 教程仍可见，宽泛词需更广意图集。 |
| setAudioProfile | 15 | 1 | — | 新版同名 API 可见，历史音质教程不是唯一答案。 |
| setupRemoteVideo | 15 | — | 7 | 历史 Electron 页新版可见，同名 API 两边可见。 |
| 屏幕共享 JavaScript | 15 | 1 | 3 | 教程后移，前列为清晰/流畅优化及浏览器兼容性。 |
| 荣耀 | 15 | — | — | 旧站 83 个章节命中，新版 0；旧结果相关性待审。 |
| RTC | 14 | 2 | — | 泛词无唯一标准；历史水晶球页面不是唯一黄金目标。 |

## 重跑与防回退

```sh
bun run search:quality:cn --out=.agent/artifacts/cn-search-top-rerun
bun run search:quality:cn --baseline=scripts/search/fixtures/cn-top-queries-20261029-baseline.json --out=.agent/artifacts/cn-search-top-rerun
```

其他候选站可加 `--candidate=https://候选站域名`。命令只查询公开 API，不需要 Meilisearch 管理密钥，不写入远端服务。最多同时发出 2 个请求。

返回码 0 才表示本套保守检查通过；1 表示需复核或修复。逐项检查目标消失、排名后移、新增零结果、原本存在的分类被挤出首批、请求错误、用例缺失；其他词改善不能抵消。历史目标或分类变化属于保守警报，可以在意图审查后调整评测用例，不能按旧点击硬编码排序。

指定 snapshot 后，同时检查相对正式站和相对冻结快照。fixture 摘要不同或 snapshot 缺少用例直接失败。冻结快照标记 `accepted: false`，记录的是现状，**不是已接受的质量标准**。默认输出位于忽略目录，不覆盖仓库中的冻结快照。

本轮有 152 个机器警报、涉及 92 个场景：目标消失 34、排名下降 7、新增零结果 15、分类缺失 96。一项可有多条警报，不能叫作 152 个已证实的相关性缺陷；Top30 人工判断见上表。

仓库现有发布由外部流水线 prepare/promote 管理。已经提供门禁命令和失败证据，**未改外部 Jenkins 发布配置**。要自动阻断发布，需要在候选站和索引就绪后、promote/切正式流量前执行，并要求返回码为 0。

- 用例：`scripts/search/fixtures/cn-top-queries-20261029.json`。
- 冻结快照：`scripts/search/fixtures/cn-top-queries-20261029-baseline.json`。
- 原始响应及取消筛选对照：`.agent/artifacts/cn-search-top-20261029/`。
- 详细 JSON：上述目录的 `comparison.json`，包含实测时间、请求状态、目标及各类前列结果。服务和索引之后可能变化。

## 验证

- 新增门禁测试先确认失败，再实现通过；5 项覆盖页面去重、单项回退不可被抵消、请求/用例缺失、新增零结果、分类丢失。
- `bun run test --maxWorkers=2`：316 个文件通过，4,963 项测试通过，2 项跳过，退出 0。运行中有 4 条 socket hang up 诊断，未造成失败。
- `node --check` 两个新增脚本通过。实时比较返回 1 是搜索效果未通过，不是测试代码失败。
- `bun run types:check` 通过，退出 0；`git diff --check` 通过。
- 最终按 package 命令带冻结快照再次实测（上海时间 2026-10-29 11:54:43）：110 项、0 请求错误、相对冻结快照 0 条新增警报、相对正式站仍有 152 条保守警报，退出 1。两次测试的全部目标排名一致，未因网络失败或一次性波动而判失败。最终完整证据另存于 `.agent/artifacts/cn-search-top-final/comparison.json`。

## 热门页面 80 项详情

以下为原热门标题加产品/平台的可发现性测试。文档合并或改名时需要记录变化，但不能直接等同于真实搜索词退化。新版不提供通用平台，4 项仅做产品筛选，不发送 `platform=general`，初次探测的 400 已排除。旧站 `agent-go` 缺少有效结果，不能据此证明新版改善。

“无筛选”保持标题、取消产品和平台，用于诊断；不是两侧范围一致的正式对照。

| ID | 标题 / 范围 | 正式站 | 新版 | 新版无筛选 | 目标页 |
| --- | --- | ---: | ---: | ---: | --- |
| popular-api-01 | API 概览 / rtc/android | - | - | - | [/api-reference/rtc/android/rtc-api-overview](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/android/rtc-api-overview) |
| popular-api-02 | 创建对话式智能体 / conversational-ai/restful | 1 | - | 1 | [/api-reference/api-ref/conversational-ai/join](https://docs-portal-staging.sh3.agoralab.co/api-reference/api-ref/conversational-ai/join) |
| popular-api-03 | 创建规则 / rtc/restful | 1 | - | 1 | [/api-reference/api-ref/rtc/create-ban-rule](https://docs-portal-staging.sh3.agoralab.co/api-reference/api-ref/rtc/create-ban-rule) |
| popular-api-04 | API 概览 / rtc/web | - | 3 | - | [/api-reference/rtc/web/overview](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/web/overview) |
| popular-api-05 | 频道相关 / rtc/android | - | 4 | - | [/api-reference/rtc/android/channel](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/android/channel) |
| popular-api-06 | 开始云端录制 / cloud-recording/restful | 1 | - | 1 | [/api-reference/api-ref/cloud-recording/start](https://docs-portal-staging.sh3.agoralab.co/api-reference/api-ref/cloud-recording/start) |
| popular-api-07 | 音频基础功能 / rtc/android | - | - | - | [/api-reference/rtc/android/audio/audio-basic](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/android/audio/audio-basic) |
| popular-api-08 | API 概览 / rtc/ios | - | 1 | - | [/api-reference/rtc/ios/rtc-api-overview](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/ios/rtc-api-overview) |
| popular-api-09 | API 概览 / rtc/windows | - | - | - | [/api-reference/rtc/cpp-all-platforms/rtc-api-overview](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/cpp-all-platforms/rtc-api-overview) |
| popular-api-10 | 视频基础功能 / rtc/android | - | - | - | [/api-reference/rtc/android/video/video-basic](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/android/video/video-basic) |
| popular-api-11 | 获取云端录制资源 / cloud-recording/restful | 1 | - | 1 | [/api-reference/api-ref/cloud-recording/acquire](https://docs-portal-staging.sh3.agoralab.co/api-reference/api-ref/cloud-recording/acquire) |
| popular-api-12 | Full SDK API 列表 / rtc/android | - | - | - | [/api-reference/rtc/android/rtc-interface-class](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/android/rtc-interface-class) |
| popular-api-13 | 网络及其他 / rtc/android | 2 | - | - | [/api-reference/rtc/android/network](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/android/network) |
| popular-api-14 | IAgoraRTC / rtc/web | 1 | - | - | [/api-reference/rtc/web/interfaces/iagorartc](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/web/interfaces/iagorartc) |
| popular-api-15 | API 概览 / rtsa/c | - | - | - | [/api-reference/rtsa/c/overview](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtsa/c/overview) |
| popular-api-16 | 查询用户列表 / rtc/restful | 1 | - | - | [/api-reference/api-ref/rtc/query-user-list](https://docs-portal-staging.sh3.agoralab.co/api-reference/api-ref/rtc/query-user-list) |
| popular-api-17 | IAgoraRTCClient / rtc/web | 1 | 2 | 2 | [/api-reference/rtc/web/interfaces/iagorartcclient](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/web/interfaces/iagorartcclient) |
| popular-api-18 | 发布和订阅 / rtc/android | - | - | - | [/api-reference/rtc/android/publishnsubscribe](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/android/publishnsubscribe) |
| popular-api-19 | 查询用户状态 / rtc/restful | 1 | - | 1 | [/api-reference/api-ref/rtc/query-user-status](https://docs-portal-staging.sh3.agoralab.co/api-reference/api-ref/rtc/query-user-status) |
| popular-api-20 | API 概览 / rtc-server-sdk/cpp | - | 1 | - | [/api-reference/rtc-server-sdk/cpp/overview](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc-server-sdk/cpp/overview) |
| popular-api-21 | 初始化相关 / rtc/android | - | - | - | [/api-reference/rtc/android/initialize](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/android/initialize) |
| popular-api-22 | 加入频道开始实时转录翻译 / speech-to-text/restful | 1 | - | 1 | [/api-reference/api-ref/speech-to-text/join](https://docs-portal-staging.sh3.agoralab.co/api-reference/api-ref/speech-to-text/join) |
| popular-api-23 | 发送消息 / rtm/restful | - | - | 1 | [/api-reference/api-ref/signaling/publish](https://docs-portal-staging.sh3.agoralab.co/api-reference/api-ref/signaling/publish) |
| popular-api-24 | 初始配置 / rtm/android | - | - | - | [/api-reference/rtm/toc-configuration/configuration](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtm/toc-configuration/configuration) |
| popular-api-25 | API 概览 / rtc/flutter | - | 1 | - | [/api-reference/rtc/flutter/rtc-api-overview](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/flutter/rtc-api-overview) |
| popular-api-26 | agora_rtc_api.h 文件参考 / rtsa/c | 1 | 1 | 1 | [/api-reference/rtsa/c/agora-rtc-api-8h](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtsa/c/agora-rtc-api-8h) |
| popular-api-27 | 创建 Converter / media-push/restful | 1 | - | 1 | [/api-reference/api-ref/media-push/create](https://docs-portal-staging.sh3.agoralab.co/api-reference/api-ref/media-push/create) |
| popular-api-28 | 创建项目 / console | 1 | 1 | 1 | [/api-reference/api-ref/console/create-project](https://docs-portal-staging.sh3.agoralab.co/api-reference/api-ref/console/create-project) |
| popular-api-29 | 创建云端播放器 / media-pull/restful | 1 | - | 1 | [/api-reference/api-ref/media-pull/create](https://docs-portal-staging.sh3.agoralab.co/api-reference/api-ref/media-pull/create) |
| popular-api-30 | 初始配置 / rtm/web | - | - | - | [/api-reference/rtm/toc-configuration/configuration](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtm/toc-configuration/configuration) |
| popular-api-31 | API 概览 / rtc/electron | - | 1 | - | [/api-reference/rtc/electron/rtc-api-overview](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/electron/rtc-api-overview) |
| popular-api-32 | API 概览 / rtc/harmonyos | - | 1 | - | [/api-reference/rtc/harmonyos/rtc-api-overview](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/harmonyos/rtc-api-overview) |
| popular-api-33 | API 概览 / rtc/mini-program | - | 1 | - | [/api-reference/rtc/mini-program/overview](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/mini-program/overview) |
| popular-api-34 | 查询主播列表 / rtc/restful | 1 | - | - | [/api-reference/api-ref/rtc/query-host-list](https://docs-portal-staging.sh3.agoralab.co/api-reference/api-ref/rtc/query-host-list) |
| popular-api-35 | 创建云端转码 / transcoding/restful | 1 | - | 1 | [/api-reference/api-ref/cloud-transcoding/create](https://docs-portal-staging.sh3.agoralab.co/api-reference/api-ref/cloud-transcoding/create) |
| popular-api-36 | 获取规则列表 / rtc/restful | 1 | - | 1 | [/api-reference/api-ref/rtc/get-ban-rule-list](https://docs-portal-staging.sh3.agoralab.co/api-reference/api-ref/rtc/get-ban-rule-list) |
| popular-api-37 | 获取频道通话列表 / analytics | 1 | - | 1 | [/api-reference/api-ref/agora-analytics/call-list](https://docs-portal-staging.sh3.agoralab.co/api-reference/api-ref/agora-analytics/call-list) |
| popular-api-38 | Go SDK API 参考 / conversational-ai/go | - | 1 | 3 | [/api-reference/conversational-ai/agent-go](https://docs-portal-staging.sh3.agoralab.co/api-reference/conversational-ai/agent-go) |
| popular-api-39 | API 概览 / rtc-server-sdk/java | - | 1 | - | [/api-reference/rtc-server-sdk/java/overview](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc-server-sdk/java/overview) |
| popular-api-40 | 查询项目的频道列表 / rtc/restful | 1 | - | - | [/api-reference/api-ref/rtc/query-channel-list](https://docs-portal-staging.sh3.agoralab.co/api-reference/api-ref/rtc/query-channel-list) |
| popular-docs-01 | 实现音视频互动 / rtc/android | 1 | 1 | 1 | [/realtime-media/rtc/get-started/quick-start](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtc/get-started/quick-start) |
| popular-docs-02 | 计费策略 / rtc/android | 1 | - | - | [/realtime-media/rtc/reference/billing-strategy](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtc/reference/billing-strategy) |
| popular-docs-03 | 下载 / rtc/android | 1 | 1 | 1 | [/realtime-media/rtc/reference/downloads](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtc/reference/downloads) |
| popular-docs-04 | 使用 Token 鉴权 / rtc/android | 1 | 1 | 1 | [/realtime-media/rtc/build/setup-and-access/token-authentication](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtc/build/setup-and-access/token-authentication) |
| popular-docs-05 | 产品概述 / conversational-ai/restful | 1 | - | 10 | [/ai](https://docs-portal-staging.sh3.agoralab.co/ai) |
| popular-docs-06 | 频道事件类型 / rtc/restful | 1 | 1 | 1 | [/api-reference/rtc/restful/webhook/events](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/restful/webhook/events) |
| popular-docs-07 | 跑通 API 示例项目 / rtc/android | 1 | 1 | 1 | [/realtime-media/rtc/get-started/run-demo](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtc/get-started/run-demo) |
| popular-docs-08 | 申请和使用 License / rtsa/c | 1 | - | 1 | [/realtime-media/rtsa/build/project-preparation/license](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtsa/build/project-preparation/license) |
| popular-docs-09 | 使用 RESTful API 实现对话式 AI 引擎 / conversational-ai/restful | 1 | - | 1 | [/ai/get-started/quick-start](https://docs-portal-staging.sh3.agoralab.co/ai/get-started/quick-start) |
| popular-docs-10 | 接收 Webhook 事件 / rtc/restful | 1 | 1 | 1 | [/api-reference/rtc/restful/webhook/receive-webhook](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/restful/webhook/receive-webhook) |
| popular-docs-11 | 发版说明 / rtc/android | 1 | 1 | 1 | [/realtime-media/rtc/reference/release-notes](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtc/reference/release-notes) |
| popular-docs-12 | 实现纯语音互动 / rtc/android | 1 | 1 | 1 | [/realtime-media/rtc/build/audio/audio-quick-start](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtc/build/audio/audio-quick-start) |
| popular-docs-13 | 实名认证 / console | 1 | - | 1 | [/introduction/user-guides/user-identity-verification](https://docs-portal-staging.sh3.agoralab.co/introduction/user-guides/user-identity-verification) |
| popular-docs-14 | 开始实时转录翻译 / speech-to-text/restful | 1 | - | 1 | [/realtime-media/speech-to-text/get-started/quick-start](https://docs-portal-staging.sh3.agoralab.co/realtime-media/speech-to-text/get-started/quick-start) |
| popular-docs-15 | 实现音视频互动 / rtc/web | 1 | 1 | 1 | [/realtime-media/rtc/get-started/quick-start](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtc/get-started/quick-start) |
| popular-docs-16 | 实现极速直播 / rtc/android | 1 | 1 | 1 | [/realtime-media/rtc/build/advanced-channel/ls-quick-start](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtc/build/advanced-channel/ls-quick-start) |
| popular-docs-17 | 计费说明 / conversational-ai/restful | 1 | - | - | [/api-reference/conversational-ai/rest-api/overview/billing](https://docs-portal-staging.sh3.agoralab.co/api-reference/conversational-ai/rest-api/overview/billing) |
| popular-docs-18 | 下载 / rtsa/c | 1 | - | 12 | [/realtime-media/rtsa/reference/downloads](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtsa/reference/downloads) |
| popular-docs-19 | 产品概述 / rtsa/c | 1 | - | 14 | [/realtime-media/rtsa](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtsa) |
| popular-docs-20 | 计费策略 / rtc/ios | 1 | - | - | [/realtime-media/rtc/reference/billing-strategy](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtc/reference/billing-strategy) |
| popular-docs-21 | 实现媒体流和信令传输 / rtsa/c | 1 | - | 1 | [/realtime-media/rtsa/build/media-and-signaling-transmission/implement-transmission](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtsa/build/media-and-signaling-transmission/implement-transmission) |
| popular-docs-22 | 开通服务 / cloud-recording/restful | 1 | - | - | [/api-reference/cloud-recording/restful/get-started/enable-service](https://docs-portal-staging.sh3.agoralab.co/api-reference/cloud-recording/restful/get-started/enable-service) |
| popular-docs-23 | 跑通 API 示例项目 / rtc/web | 1 | 1 | 1 | [/realtime-media/rtc/get-started/run-demo](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtc/get-started/run-demo) |
| popular-docs-24 | 跑通基于 C API 的 Linux 示例项目 / rtsa/c | 1 | - | 1 | [/realtime-media/rtsa/get-started/run-example](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtsa/get-started/run-example) |
| popular-docs-25 | 开通服务 / rtc/android | 1 | - | - | [/realtime-media/rtc/build/setup-and-access/enable-service](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtc/build/setup-and-access/enable-service) |
| popular-docs-26 | 开通服务 / rtc/web | 1 | - | - | [/realtime-media/rtc/build/setup-and-access/enable-service](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtc/build/setup-and-access/enable-service) |
| popular-docs-27 | 产品概述 / analytics | 1 | - | - | [/api-reference/analytics/general/overview/product-overview](https://docs-portal-staging.sh3.agoralab.co/api-reference/analytics/general/overview/product-overview) |
| popular-docs-28 | 使用 RESTful API 开始云端录制 / cloud-recording/restful | 1 | - | - | [/api-reference/cloud-recording/restful/get-started/quick-start](https://docs-portal-staging.sh3.agoralab.co/api-reference/cloud-recording/restful/get-started/quick-start) |
| popular-docs-29 | 使用 Agents SDK 实现对话式 AI 引擎 / conversational-ai/restful | 1 | - | 1 | [/ai/get-started/quick-start-agent](https://docs-portal-staging.sh3.agoralab.co/ai/get-started/quick-start-agent) |
| popular-docs-30 | 高级美颜 / rtc/android | 1 | 1 | 1 | [/realtime-media/rtc/build/video/advanced-beauty](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtc/build/video/advanced-beauty) |
| popular-docs-31 | 产品概述 / rtc/android | 1 | - | - | [/realtime-media/rtc](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtc) |
| popular-docs-32 | 单流和合流录制计费说明 / cloud-recording/restful | 1 | - | - | [/api-reference/cloud-recording/restful/overview/billing-strategy/billing](https://docs-portal-staging.sh3.agoralab.co/api-reference/cloud-recording/restful/overview/billing-strategy/billing) |
| popular-docs-33 | 什么是账单、结算与账户冻结？ / all | 1 | 1 | 1 | [/reference/faq/account/billing_account](https://docs-portal-staging.sh3.agoralab.co/reference/faq/account/billing_account) |
| popular-docs-34 | 回调事件概览 / cloud-recording/restful | 1 | - | - | [/api-reference/cloud-recording/restful/webhook/ncs-events](https://docs-portal-staging.sh3.agoralab.co/api-reference/cloud-recording/restful/webhook/ncs-events) |
| popular-docs-35 | 发版说明 / rtc/ios | 1 | 1 | 1 | [/realtime-media/rtc/reference/release-notes](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtc/reference/release-notes) |
| popular-docs-36 | 计费说明 / speech-to-text/restful | 1 | - | 12 | [/realtime-media/speech-to-text/reference/billing](https://docs-portal-staging.sh3.agoralab.co/realtime-media/speech-to-text/reference/billing) |
| popular-docs-37 | 付费方式 / rtc/android | 1 | - | 7 | [/realtime-media/rtc/reference/payment](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtc/reference/payment) |
| popular-docs-38 | 发版说明 / conversational-ai/restful | 1 | - | - | [/ai/release-notes](https://docs-portal-staging.sh3.agoralab.co/ai/release-notes) |
| popular-docs-39 | 减小 App 体积 / rtc/android | 1 | 1 | 1 | [/realtime-media/rtc/build/optimize-and-operate/reduce-app-size](https://docs-portal-staging.sh3.agoralab.co/realtime-media/rtc/build/optimize-and-operate/reduce-app-size) |
| popular-docs-40 | 实现 HTTP 基本认证 / rtc/restful | 1 | 1 | 1 | [/api-reference/rtc/restful/user-guides/http-basic-auth](https://docs-portal-staging.sh3.agoralab.co/api-reference/rtc/restful/user-guides/http-basic-auth) |
