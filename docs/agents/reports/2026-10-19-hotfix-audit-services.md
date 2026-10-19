# 热更新 PR 覆盖审计：RTSA、内容审核、录制与计费

## 范围与方法

- 审计日期：2026-10-19；目标固定基线：`7c6c60ead44406e69906c5c3808cd489784aa89e`。
- 逐个读取源仓库 `AgoraIO/shengwang-doc-source` PR 的实际 diff，并以如下 merge SHA 固定来源；使用 `git show <SHA> -- <path>` 复核大 PR，不以标题或迁移提交记录替代正文核对。
- 对照目标正文、平台分段、API 当前版本目录、SDK 下载组件数据、图片 blob、OpenAPI 维护源。此报告不证明线上部署已更新，也不验证收费政策本身是否正确。
- “完整覆盖”表示该 PR 的用户可见语义已覆盖；旧格式 JSX、计划/spec、Doxygen 样式与搜索资源不要求原样搬运。若新内容存在但相同源页面的另一条仍可访问入口落后，则标“部分覆盖”，明确说明入口差异。
- 本批 16 个 PR：完整覆盖 **10**，部分覆盖 **6**，未覆盖 **0**，不适用 **0**，无法确认 **0**。

## 逐 PR 结论与固定来源

| 源 PR | merge SHA | 结论 | 摘要 |
| --- | --- | --- | --- |
| [#2065](https://github.com/AgoraIO/shengwang-doc-source/pull/2065) | `7f279055760413d6ff194b09abe5e403f434610d` | 部分覆盖 | 两处回调字段已改为 clientRequest；开通前提仍是旧版技术支持流程，未呈现源 PR 中修改后的控制台说明。 |
| [#2075](https://github.com/AgoraIO/shengwang-doc-source/pull/2075) | `5241f1540f59eb0ea6dac0d8f360989ab8dfd9e0` | 完整覆盖 | 易盾工单应附登录域名、账号名称已存在。 |
| [#2086](https://github.com/AgoraIO/shengwang-doc-source/pull/2086) | `1632146a7cf2b96918e83f2365f572d87b6b156d` | 完整覆盖 | Android/iOS NCS 与 RESTful 误判的语义已存在，措辞已被 #2087 后续覆盖。 |
| [#2087](https://github.com/AgoraIO/shengwang-doc-source/pull/2087) | `b59ed0d36f6747e8b2c3b322e59a4c28e06a07bb` | 完整覆盖 | 两个平台使用最终“通信模式/互动直播模式”措辞。 |
| [#2083](https://github.com/AgoraIO/shengwang-doc-source/pull/2083) | `0aeb5cfc24cdc522731efd7ee8b741a5e986da3c` | 部分覆盖 | 发版说明与下载版本更新；核心教程、产品性能、平台支持及 C API 正文仍落后。 |
| [#2096](https://github.com/AgoraIO/shengwang-doc-source/pull/2096) | `79cfdbac2034423b6ab6b2224187637181e107e2` | 完整覆盖 | 18 个安全修复版下载 URL 全部存在于组件数据。 |
| [#2099](https://github.com/AgoraIO/shengwang-doc-source/pull/2099) | `e8cf6670e06d6f3ea980df1c8aa76ad86306b2b2` | 完整覆盖 | SKU 产品值 4：微呼叫已替换 2：RTSA。 |
| [#2106](https://github.com/AgoraIO/shengwang-doc-source/pull/2106) | `39036aadcbdf939c4de94930074c2e95624f4d23` | 部分覆盖 | Android/iOS 已引导自助开通，Web 平台缺整个前提条件。 |
| [#2105](https://github.com/AgoraIO/shengwang-doc-source/pull/2105) | `9d09bbe40c00f95198111e2c03e3672928218197` | 完整覆盖 | 单人转码推流统一采用多人连麦直播单价。 |
| [#2103](https://github.com/AgoraIO/shengwang-doc-source/pull/2103) | `f7d83f024f9b42ce62139580f198ba988e45a743` | 完整覆盖 | 控制台预授权步骤、白名单/消耗额度及截图均存在。 |
| [#2109](https://github.com/AgoraIO/shengwang-doc-source/pull/2109) | `0b84dbe284c918372c72c87fce5d6b3e346b1027` | 部分覆盖 | 产品计费页有机器人订阅费减免，API lane 计费副本遗漏。 |
| [#2108](https://github.com/AgoraIO/shengwang-doc-source/pull/2108) | `af6bffea6fda66b50097d3daa8779306296c471a` | 部分覆盖 | 三个集成入口已配置 CDN；发版说明全局提醒与减包体积前置引导遗漏。 |
| [#2112](https://github.com/AgoraIO/shengwang-doc-source/pull/2112) | `4c78ac9f009e45a37d7aa1279186c641ac7a6748` | 完整覆盖 | 截图计费链接指向 RTC 计费的对应锚点。 |
| [#2115](https://github.com/AgoraIO/shengwang-doc-source/pull/2115) | `ebe508362d57fe179a9daeaa46b230d887d8ade1` | 完整覆盖 | 指南与中文 OpenAPI 最小值均为 1，且解释关键帧限制。 |
| [#2091](https://github.com/AgoraIO/shengwang-doc-source/pull/2091) | `af693efea0f640e39659a64d230760abf7e79928` | 部分覆盖 | #1215 已补齐主产品线/Go/OpenAPI/旧版保存；API lane 的未标旧版副本仍是旧单流说明。 |
| [#2116](https://github.com/AgoraIO/shengwang-doc-source/pull/2116) | `afa65fdc5ac61cce21093f54b1501401f913668c` | 完整覆盖 | 源涉及的 11 个平台 current API 均含 4 处实时生效说明。 |

下文目标路径均相对仓库根目录；行号对应上述目标基线。

## 内容审核

### #2065：部分覆盖

源文件：`docs/content-moderation/integrate-extensions/audio-moderation-api.mdx`，3 个替换点。

- 已覆盖：`content/docs/zh-CN/realtime-media/content-moderation/build/audio-moderation-api.mdx:419`、`:721`，回调结构均明确为 `clientRequest`（不是旧的 `clientInfo`），保留 `cname`/`uid` 关联信息。
- 未对齐：同文件 `:35` 起仍要求“联系声网技术支持”并提供公司全称、邮箱；源 PR 对应段落是“在声网控制台的内容审核页面填写邮箱等必要信息”，且带开通服务与配置说明链接。目标未要求在这里提供回调地址，但并未呈现源修改后的控制台开通说明。
- 口径说明：若只考察“删除回调地址要求”这一最小语义，目标也不要求回调地址；本报告按完整替换段落保守记部分覆盖，不将两处已正确的回调字段误报为缺失。

### #2075：完整覆盖

源文件：`docs/content-moderation/get-started/enable-service.mdx`。

目标 `content/docs/zh-CN/realtime-media/content-moderation/enable-service.mdx:78` 已明确：问题反馈工单备注声网渠道客户，并附邮箱收到的登录域名和账号名称。

### #2106：部分覆盖，Web 分段遗漏

源改动位于共享的 `docs/shared/marketplace/video-moderation.mdx` 和 `video-moderation-2.mdx`。实际消费者包括网易易盾的 Android/iOS 与 JavaScript 页面；不是只核对共享文件名。

目标 `content/docs/zh-CN/realtime-media/content-moderation/build/netease-yidun-video-moderation.mdx`：

- Android `:24`、iOS `:108` 已要求先按 `/zh-CN/realtime-media/content-moderation/enable-service` 开通。
- Web 分段从 `:175` 开始，`:190` 只保留准备回调服务器的提示，`:193` 直接进入“实现步骤”；没有源 `video-moderation-2.mdx` 的“前提条件/开通服务”要求。
- 上游仍在 legacy 下引用两个共享文件的图谱、依图、数美视频审核页面在目标没有同名公开映射；本次确认的明确遗漏是仍公开的网易易盾 Web 段，不据此猜测应恢复已下线产品。

### #2112：完整覆盖

源文件：`docs/content-moderation/overview/billing.mdx`。

目标 `content/docs/zh-CN/realtime-media/content-moderation/reference/billing.mdx:82` 链到 `/zh-CN/realtime-media/rtc/reference/billing-strategy#本地截图上传`；对应目标 `content/docs/zh-CN/realtime-media/rtc/reference/billing-strategy.mdx:98` 有“本地截图上传”标题。未保留源旧的云端录制 snapshot-billing 链接。

## RTC 发版说明和 Android 集成

### #2086 / #2087：完整覆盖，前者已由后者覆盖

源文件均为 `docs/rtc/overview/release-notes.android.mdx`、`release-notes.ios.mdx`；修改的是 v4.6.4 中同一个问题。

目标 `content/docs/zh-CN/realtime-media/rtc/reference/release-notes.mdx` Android 分段起于 `:6`，v4.6.4 起于 `:66`，最终说明位于 `:92`；iOS 分段起于 `:2014`，v4.6.4 起于 `:2076`，最终说明位于 `:2100`。两处均是 #2087 的“通信模式”“NCS 和 RESTful API 返回的频道信息被错误识别为互动直播模式”，没有退回 #2086 前错误描述。

### #2108：部分覆盖

源 PR 涉及 5 个文件，目标逐项如下：

| 源范围 | 目标与证据 | 结论 |
| --- | --- | --- |
| 视频快速开始 Android | `content/docs/zh-CN/realtime-media/rtc/get-started/quick-start.mdx:95`、`:101`、`:116`、`:127` | 已改 Gradle 自动集成，保留 mavenCentral，并有新旧 AGP 两套 Maven CDN 配置。 |
| 纯语音快速开始 Android | `content/docs/zh-CN/realtime-media/rtc/build/audio/audio-quick-start.mdx:87`、`:93`、`:108`、`:119` | 同上。 |
| SDK 下载 Android | `content/docs/zh-CN/realtime-media/rtc/reference/downloads/android.mdx:6`、`:23`、`:34`、`:45` | CDN 与 Full/Lite 二选一说明存在；版本已进一步升级到 4.7.0，不要求退回源 PR 的 4.6.4。 |
| 减小 App 体积 Android | `content/docs/zh-CN/realtime-media/rtc/build/optimize-and-operate/reduce-app-size.mdx:44`、`:46`、`:746` | Gradle 术语已改；缺源 PR 新增“集成前先确保已添加声网 Maven CDN 仓库”及下载页锚点引导。 |
| Android 发版说明 | `content/docs/zh-CN/realtime-media/rtc/reference/release-notes.mdx:6` 起 | 源 PR 顶部新增“自 2026 年 9 月 14 日开始……需要额外配置声网 Maven CDN”的全局注意框；目标整个文件无 Maven CDN 或该日期的说明。 |

## RTSA

### #2083：部分覆盖，不能以 v1.10.1 标签认定 API 已升级

已覆盖：

- `content/docs/zh-CN/realtime-media/rtsa/reference/release-notes.mdx:6` 起含 1.10.1 全节，`:14` 起有 RTM 更名/消息参数，`:46` 有 TLS，后续含弱网、JPEG、G722、云代理等修复。
- `content/docs/zh-CN/realtime-media/rtsa/reference/downloads.mdx:20` 通过 `<ProductSdkDownloads product="rtsa" platform="c" />` 输出下载；`src/components/docs-overview/rtsa-sdk-downloads-data.zh-cn.ts:18` 起为 1.10.1，且由 #2096 后续安全版覆盖。
- `content/docs/zh-CN/api-reference/rtsa/c/meta.json:8` 的 current 标签为 v1.10.1；部分结构体如 `content/docs/zh-CN/api-reference/rtsa/c/(current)/structvideo-frame-info-t.mdx:80` 有 `sei_data`。

明确遗漏与反证：

| 源 PR 改动 | 目标旧内容证据 |
| --- | --- |
| 多频道离开时应传 Connection ID | `content/docs/zh-CN/realtime-media/rtsa/build/media-transmission/multi-channel.mdx:44`、`:45`、`:46` 仍传 `cname1/2/3`，`:88` 仍传 `cname`。 |
| BWE 方法增加 Connection，回调 connection_id_t，修正变量名、&& 边界和 L2/L3 | `content/docs/zh-CN/realtime-media/rtsa/build/media-transmission/bitrate-adaption.mdx:35` 仍无 CONNECTION_ID_ALL；`:38` 仍 const char *channel；`:42` 仍 curTargetBitRate；`:51` 仍 C 链式比较。 |
| RTM login/send/logout 更名、回调签名、消息类型、成功登录检查 | `content/docs/zh-CN/realtime-media/rtsa/build/media-and-signaling-transmission/implement-transmission.mdx:333`、`:335`、`:348`、`:355`、`:359`、`:371`、`:381` 均仍旧接口/签名；`:67` 日志参数 uid/conn_id 顺序也未修正。 |
| 云代理增加 TLS(4) | `content/docs/zh-CN/realtime-media/rtsa/build/network-and-region-access/cloud-proxy.mdx:34` 起仅 UDP 与 NONE。 |
| 产品性能新增三个平台实测表、删除旧包体积指标 | `content/docs/zh-CN/realtime-media/rtsa/index.mdx:61` 仍声称增量 <400 KB、内存 <2 MB；没有 12.189/47866.99 等源表数据。 |
| 平台兼容改 C99+AOSL、Linux/RTOS、MIPS/RISCV 等 | `content/docs/zh-CN/realtime-media/rtsa/reference/supported-platforms.mdx:6` 起仍 Linux/Android/HarmonyOS 旧表。 |
| C current API 新 RTM 方法、rtm_message_type_e、RTM Channel | `content/docs/zh-CN/api-reference/rtsa/c/(current)/agora-rtc-api-8h.mdx:3244` 仍 agora_rtc_login_rtm，`:3673` 仍 agora_rtc_send_rtm_data；current 目录无 agora_rtm_login / agora_rtm_publish / rtm_message_type_e。其 `overview.mdx:50`、`:52` 也列旧方法。源固定 SHA 的 HTML 明确包含新方法，不是仅发版说明宣称。 |
| C 版本选择器新增 v1.9.7 归档 | `content/docs/zh-CN/api-reference/rtsa/c/meta.json:5` 起只有 current，无 v1.9.7 选项。 |
| 更新教程的回调锚点 | data-stream `:104`、key-frame `:54`、stream-state `:83`/`:84` 仍旧 hash；产品概览 `index.mdx:29` 仍旧 audio_data_type_e / video_data_type_e 文本锚点。 |

此外源首页新增“最新版 v1.10.1 发布”卡片；目标 RTSA 概览使用通用“开始构建”卡片而没有该版本入口。这是信息架构差异，不能替代上表核心正文遗漏。

### #2096：完整覆盖

源 `docs/rtsa/resources.c.mdx` 更新 18 个下载 URL。直接从 `gh pr diff 2096` 提取 18 个新增 href，与 `src/components/docs-overview/rtsa-sdk-downloads-data.zh-cn.ts` 做字符串核对：**18/18 命中，缺失 0**。

目标数据 `:18` 至 `:154` 包含 `20260907` 的所有构建，涵盖 x86_64、aarch64、arm、armv6、armv5、mipsel、LiteOS、HarmonyOS；`ProductSdkDownloads.tsx:2` 导入这一 RTSA 数据集，正文下载页 `:20` 调用相应组件。不是仅在一份未消费数据里找到 URL。

### #2099：完整覆盖

源 `shared/rtsa/license.mdx` 的 SKU product 修改，对应 `content/docs/zh-CN/realtime-media/rtsa/build/project-preparation/license.mdx:157` 为 `4`: 微呼叫，保留 `1`: RTC，不再在此 SKU 列出 `2`: RTSA。

### #2103：完整覆盖，图片字节一致

目标同一 license 文件 `:71` 为控制台自助预授权，`:73`/`:74` 有 License > 预授权及导入 licenseKey，`:76` 引用 `/img/rtsa/preauthorization.png`，`:78` 说明加入白名单与额度消耗。

`public/img/rtsa/preauthorization.png` 存在；`git hash-object` 为 `893a557a2cf68abb030642ccaf666d14c535fac7`，与源 PR 新增图片 blob `893a557a2c` 一致。

## 推流计费与云端录制

### #2105：完整覆盖

源 `docs/media-push/overview/billing.mdx` 删除按转码前后属性是否变化的分支。

目标 `content/docs/zh-CN/realtime-media/media-push/reference/billing.mdx:88` 保留不转码 8 元/千分钟，`:89` 明确转码推流与多人连麦单价相同，无“视频属性无改变时仍 8 元”的旧分支。该链接已迁为本页规范路径；锚点未保留属于跳转精度差异，不改变此 PR 的计费语义。

### #2109：部分覆盖，主计费页与 API lane 副本不一致

- 主产品线已覆盖：`content/docs/zh-CN/realtime-media/cloud-recording/reference/billing-strategy/billing.mdx:23` 有“录制机器人的订阅费用会自动减免，不会额外计入实时音视频费用”。
- 未覆盖副本：`content/docs/zh-CN/api-reference/cloud-recording/restful/overview/billing-strategy/billing.mdx:33` 的提示列表仍直接从“同时录制多路音频流和视频流”开始，没有减免说明。
- 该副本不是自动认定的废文件：`content/docs/zh-CN/api-reference/cloud-recording/restful/meta.json:6` 仍将其列为导航项。主线程独立调用 `resolveZhCnProductIaRedirect`、`resolveMovedDocsRedirect`、`resolveStaticLegacySitemapRedirect`，对此 API lane 路径均返回 null；因此不能用主产品线已更新推定所有入口覆盖。

### #2115：完整覆盖

- 主产品指南：`content/docs/zh-CN/realtime-media/cloud-recording/build/recording-modes/snapshot.mdx:73` 为 `[1,3600]`，默认 10，并有“截图仅在视频关键帧时生成，实际截图间隔可能大于设置周期”。
- API lane 指南副本：`content/docs/zh-CN/api-reference/cloud-recording/restful/user-guides/snapshot.mdx:81` 同样已改。
- 中文 OpenAPI：`content/openapi/cloud-recording/cloud-recording.zh-CN.yaml:1209` 起，`captureInterval` 为 number，minimum 1、maximum 3600、default 10，description 含关键帧限制。
- `public/openapi` 不在该干净工作树中，由同步脚本构建生成；未把缺少 gitignored 生成目录误报为维护源遗漏。

### #2091：主产品线同步已生效，但全站仍部分覆盖

#1215 的主产品线同步经实际正文复核成立，不是仅凭合并记录下结论：

| 源改动范围 | 已覆盖证据 |
| --- | --- |
| 2026.10.08 v2 升级、raw、删除 streamMode/extensionServiceConfig、serviceScene、stranded | `content/docs/zh-CN/realtime-media/cloud-recording/reference/release-notes.mdx:21` 起；历史条目 `:113`、`:482` 链到旧版。 |
| 新单流指南、MP4/MP3 组合、Native/Web MP4 限制 | `content/docs/zh-CN/realtime-media/cloud-recording/build/recording-modes/individual-mode/set-individual.mdx:9` 有旧版入口，`:44` 起有组合表，`:113`/`:220` 为 mode/raw，`:261` 有 stranded；原 streamMode 示例已删除。 |
| 旧版页面保存 | 同目录 `legacy-set-individual.mdx` 存在；`build/manage-recorded-files/legacy-introduce-recorded-files.mdx` 存在，新文件介绍 `:7` 有旧版入口。 |
| 新文件命名、HLS/DASH、MP4/MP3、切片规则 | `content/docs/zh-CN/realtime-media/cloud-recording/build/manage-recorded-files/introduce-recorded-files.mdx:16`、`:24`、`:47`、`:49`、`:137`、`:156`。 |
| 回放 MP4 3 小时与页面 maxVideoDuration | `content/docs/zh-CN/realtime-media/cloud-recording/build/manage-recorded-files/playback.mdx:62`、`:66`。 |
| 导航改“实现单流录制”、隐藏不转码入口 | `content/docs/zh-CN/realtime-media/cloud-recording/build/recording-modes/individual-mode/meta.json` 只列 set-individual，新页标题已改。 |
| Go 默认 180 | `content/docs/zh-CN/api-reference/cloud-recording/go-api/struct.go.mdx:1225`。 |
| 中文 OpenAPI raw、文件类型、删除 streamMode、180、stranded | `content/openapi/cloud-recording/cloud-recording.zh-CN.yaml:648`、`:1192`、`:1193`、`:1204`、`:1329`、`:2044`。 |
| 源 _en-only 的 3 小时与 180 默认值 | `content/openapi/cloud-recording/cloud-recording.en.yaml:1754`、`:1884`。没有把英文 v1 整体强行改成中文 v2。 |

仍旧的 API lane 副本：

- `content/docs/zh-CN/api-reference/cloud-recording/restful/user-guides/individual-mode/set-individual.mdx:2` 仍题为“实现单流转码录制”，`:20` 仍是旧导语，`:38` 仍教 mode=individual，并继续保留 streamMode；没有新版/旧版身份提示或指向新指南的迁移入口。
- `content/docs/zh-CN/api-reference/cloud-recording/restful/user-guides/manage-file/introduce-recorded-files.mdx:31` 起的单流部分仍旧版 type/audio/video 命名，并非 source #2091 的 codec/raw 命名。虽然部分 3 小时数据已经更新，不能据此视为整体覆盖。
- 主线程调用 IA/moved redirect resolver，以上两路均 null/null；另对 set-individual 验证 static legacy sitemap resolver 也为 null。API lane 的目录中仍保留旧文档与互链，未明确跳转至主产品线新内容。

因此本项是“产品主线及 OpenAPI 已同步，重复 API 内容入口遗漏”，不应描述为 #1215 未同步或上游 raw 功能完全缺失。源 PR 自身的 AV1/单独 mp3 文案矛盾不作为迁移遗漏重复计数，见既有 `docs/agents/reports/2026-10-19-cloud-recording-pr2091-sync.md`。

## #2116：11 平台实时黑名单说明完整覆盖

源 HTML 11 个平台，每个平台新增 4 条：音频 blocklist、音频 Ex、视频 blocklist、视频 Ex。目标均在 `content/docs/zh-CN/api-reference/rtc/<平台>/(current)/publishnsubscribe.mdx`，逐文件检查得到 44 条。

| 目标平台 | 四处关键行号 |
| --- | --- |
| android | 1791、1845、2030、2083 |
| cpp-all-platforms | 1588、1644、1836、1892 |
| csharp-windows | 1029、1093、1289、1351 |
| electron | 1473、1536、1733、1796 |
| flutter | 1427、1488、1677、1738 |
| react-native | 1473、1536、1733、1796 |
| unity | 1534、1593、1780、1839 |
| unreal-blueprint | 1445、1510、1709、1772 |
| unreal-cpp | 1666、1730、1926、1988 |
| ios | 1595、1647、1825、1877 |
| macos | 1595、1647、1825、1877 |

每处均说明“黑名单设置实时生效。将已订阅用户加入黑名单后，该用户的音频/视频流也会停止订阅”。源修改的是 current HTML，未修改 Android 历史 4.6.0；不要求把新声明倒灌到未在源 PR 范围内的历史版本。

## 后续处理建议（本轮未执行）

1. 优先补齐 #2083 的 RTSA 核心教程、性能表、平台支持和 C API 真实版本；目前 v1.10.1 标签不足以保证用户读到新 API。
2. 补 #2106 Web 前提条件、#2108 两处新增引导，并核对 #2065 开通流程是否有意另行改写。
3. 对云端录制 API lane 冗余指南与计费副本做统一范围决策：同步正文，或明确重定向至产品主线。不能仅凭主产品线已更新将全站覆盖记满。

本报告仅新增审计文档，未修改业务文档、渲染逻辑、API、下载链接或源仓库工作区。
