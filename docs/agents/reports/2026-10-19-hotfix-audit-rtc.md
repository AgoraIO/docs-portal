# 中文热更新 PR 覆盖审计：RTC 与 VoIP

审计日期：2026-10-19。目标基线：`docs-portal@7c6c60ead4`，工作分支 `codex/cn-hotfix-pr-coverage-audit`。本文件只记录审计，不修改产品正文。

## 范围、证据与口径

- 直接读取 `AgoraIO/shengwang-doc-source` 的 18 个 PR 实际 diff、合并 SHA，并检查目标仓库的 MDX、平台块、下载组件数据和 API `meta.json`，不是仅检查迁移提交历史。
- 清单冻结源快照：`5d03551cf64cd057ccfe8d5b256d9c4778e8fbb1`。另只读检查了本地 `origin/master@e91218031d7dd02ff84a66fc1b5f422a1cd28a64` 作补充，本文列出的关键遗漏/回退在这两个源快照上一致。
- 下文目标路径均相对 docs-portal 根目录；`API/` 代表 `content/docs/zh-CN/api-reference/rtc/`，`RTC/` 代表 `content/docs/zh-CN/realtime-media/rtc/`，`DL/` 代表 `src/components/docs-overview/`。行号固定于目标基线。
- “完整覆盖”允许最新版本被后续版本合理取代、旧链接迁到等价本地链接；“部分覆盖”表示确有内容已覆盖，但 PR 中仍有行为/信息未保留。版本标识可以由入口标题等价承载，不要求旧 UI 同构；PR 实际新增或修复的历史版本访问能力若没有承接，则另记遗漏。
- “后续源回退”单列，不算 portal 迁移遗漏。不能因为原热修复目前不在，就自动建议恢复它。
- 本审计不证明线上部署已生效，不包含浏览器逐页验收。测试通过不能证明文档语义齐全。

## 总览

18 项中：完整覆盖 11、部分覆盖 5、未覆盖 1、后续源回退 1；不适用 0、无法确认 0。#2094 已找到确定遗漏，因此是“部分覆盖”；并不表示其余所有 HTML 变更均已验收。

| PR | 状态 | 主要结论 | 源 merge SHA |
|---|---|---|---|
| [#2062](https://github.com/AgoraIO/shengwang-doc-source/pull/2062) | 完整覆盖 | Web 4.24.7 发版保留；最新下载/示例已被 4.24.9 覆盖；API 入口标题已标后续 4.24.8 | `8013e65bc94f8aa1eeecced937f23bd39d8a129e` |
| [#2060](https://github.com/AgoraIO/shengwang-doc-source/pull/2060) | 后续源回退 | #2094 将主屏幕轨道修复回退；portal 与冻结源一致，不计迁移遗漏 | `3c22c5d44e63d94852da03af67be9fa0f44b8349` |
| [#2068](https://github.com/AgoraIO/shengwang-doc-source/pull/2068) | 完整覆盖 | Android 编解码库名已加 lib 前缀 | `12a7bc77f4eb2dde17b585a959239b51b8e01dc5` |
| [#2070](https://github.com/AgoraIO/shengwang-doc-source/pull/2070) | 完整覆盖 | 8 平台 current LogConfig 自定义文件名指导均在 | `e695dd037d754273626d351b8626fa49b92e694f` |
| [#2072](https://github.com/AgoraIO/shengwang-doc-source/pull/2072) | 完整覆盖 | C++ metadata 超限截断说明已在 | `fdb5fce6c6cbc20ffc8e58a6e44981dfe6909c89` |
| [#2073](https://github.com/AgoraIO/shengwang-doc-source/pull/2073) | 完整覆盖 | HarmonyOS 文件名指导及默认路径已在 | `b831ad8af1692c3148b235bf21e0df7b615b7953` |
| [#2076](https://github.com/AgoraIO/shengwang-doc-source/pull/2076) | 完整覆盖 | 四平台共享高级美颜 2.0 素材范围说明已展开 | `3475d5602204015c8571c8de1de4c7c85cfee451` |
| [#2077](https://github.com/AgoraIO/shengwang-doc-source/pull/2077) | 部分覆盖 | Android/iOS/macOS 有截断说明，另 5 平台缺失 | `5745b93af59f63df5fa6f2ea6bfbc9cc25b75a60` |
| [#2082](https://github.com/AgoraIO/shengwang-doc-source/pull/2082) | 完整覆盖 | Web 4.24.8 发版和 API 入口版本标识已保留；最新下载/示例已 4.24.9 | `c1aa43fd12b5887585a97c24c8c3833e09ad286a` |
| [#2085](https://github.com/AgoraIO/shengwang-doc-source/pull/2085) | 部分覆盖 | Android/iOS 发版在、下载已 4.7.0；Android focal-length 事件缺失，历史 API 入口未保留 | `3a1614158a96e90e5a8345c95513b18b8eb407e9` |
| [#2088](https://github.com/AgoraIO/shengwang-doc-source/pull/2088) | 完整覆盖 | 两个 Web 接口的 String UID 链接已指向有效本地 FAQ | `e3c747679166aa38df446347911e8c87678310cc` |
| [#2084](https://github.com/AgoraIO/shengwang-doc-source/pull/2084) | 部分覆盖 | Flutter/RN 发版及 API 当前版本在；事件说明和最新下载版本缺失 | `2cc6b1b882d37829c45496f9ef3605fed5748285` |
| [#2089](https://github.com/AgoraIO/shengwang-doc-source/pull/2089) | 完整覆盖 | C++ DataStream 重载比较及发送限制均在 | `0c2d11ce174d3bedd053c9ac6ffbe875a0afbe82` |
| [#2090](https://github.com/AgoraIO/shengwang-doc-source/pull/2090) | 完整覆盖 | macOS 15 Beta FAQ、发版段落引用与四张资源图均不存在 | `a7f2c93fe44197923617755bade7c9f883cb3ac4` |
| [#2113](https://github.com/AgoraIO/shengwang-doc-source/pull/2113) | 未覆盖 | 四平台旧版本 API 入口及 0.0.492 映射均未提供 | `ec0ad467057ed56e4c5059bbccf98b5ce301bb9b` |
| [#2114](https://github.com/AgoraIO/shengwang-doc-source/pull/2114) | 完整覆盖 | VoIP callMiniApp 的八个 encryptionMode 文案全部正确 | `f4f72a7108e6e96dd761b941ad0667eb9eacfe5a` |
| [#2094](https://github.com/AgoraIO/shengwang-doc-source/pull/2094) | 部分覆盖 | Native 当前版本和新增类页在；小脸/眼角度、贴纸、字符串 API 等语义缺失 | `80b1000446bacab3f4937f5f1a6d177c5be6bee1` |
| [#2098](https://github.com/AgoraIO/shengwang-doc-source/pull/2098) | 部分覆盖 | 4.7.0 发版/下载在；美颜版本边界、ProGuard、按需 FFmpeg、FAQ 修订缺失 | `7c18a97504d2ffdd2d5eb00bca979735ec87c5f7` |

## 逐项核查

### #2062 / #2082：Web 4.24.7、4.24.8

来源分别见 [#2062 Files changed](https://github.com/AgoraIO/shengwang-doc-source/pull/2062/files)、[#2082 Files changed](https://github.com/AgoraIO/shengwang-doc-source/pull/2082/files)。两者均更新 8 个文件：发版、三个快速开始、下载、首页、Web landing、API 平台版本元数据。

- `RTC/reference/release-notes.mdx:5747` 的 v4.24.8、`:5751` 的 v4.24.7 与 PR 实际 diff 的发布日期和“内部改进”文字一致。#2082 的 PR body 曾写“尚未公开”，实际合入 diff 并没有这句，审计以 diff 为准。
- `RTC/get-started/quick-start.mdx:2434`、`RTC/build/audio/audio-quick-start.mdx:1623`、`RTC/build/advanced-channel/ls-quick-start.mdx:265` 的 CDN 与相邻本地脚本均升级为 4.24.9，属于后续版本取代，不应降回 4.24.7/8。
- `RTC/reference/downloads/web.mdx:19` 使用 `RtcSdkDownloads`；组件 `DL/RtcSdkDownloads.tsx:17` 优先 RTC 专用数据、再退回公共目录。Web 使用 `DL/sdk-downloads-data.zh-cn.ts:1570` 的 4.24.9 下载包。
- API 当前版本的等价标识：`API/web/overview.mdx:2` 的入口标题明确为 `Agora Web SDK API Reference v4.24.8`，并被 `API/web/meta.json:6` 的 overview 导航项消费。两次源 PR 的平台元数据 diff 只改 current 的版本标签，没有新增历史版本切换能力。因此 `API/web/meta.json:3` 的空 `navScope` 不构成本两项遗漏；不要求把旧版选择 UI 原样搬来，也不把后续 4.24.9 产品下载合理覆盖降回旧版本。

### #2060：屏幕采集主轨道修复被源 #2094 回退

[#2060 diff](https://github.com/AgoraIO/shengwang-doc-source/pull/2060/files) 原来修复 Windows `startScreenCapture [2/2]` 的 sourceType → publishScreenTrack / publishSecondaryScreenTrack / publishThirdScreenTrack / publishFourthScreenTrack 映射，并明确 ByDisplayId、ByWindowId、弃用 ScreenRect 只发布主轨道；macOS 同步主轨道指导。

- portal `API/cpp-all-platforms/(current)/video/screencapture.mdx:494` 仍让 [2/2] 使用 `publishScreenCaptureVideo`；`:563`、`:633`、`:743` 仍写主或次轨道。`API/macos/(current)/video/screencapture.mdx:201`、`:286` 也仍写主或次轨道。
- 反证/归因：[#2094 的 Cpp/macOS screencapture diff](https://github.com/AgoraIO/shengwang-doc-source/pull/2094/files) 明确删除 #2060 新增句子，恢复旧发布选项。冻结源 `5d03551...:html-docs/rtc/Cpp/API/toc_screencapture.html:412` / `:468` 与 macOS `:176` 仍是旧句，补查 `e912180...` 同样如此。
- 结论：修复没有在当前内容中保留，但原因在后续源生成回退，不能作为 portal 单独漏迁直接恢复；需要先由源/API owner 确认期望语义。

### #2068：Android 编解码库名

[#2068 diff](https://github.com/AgoraIO/shengwang-doc-source/pull/2068/files) 涉及 RTC reduce-app-size、共享 extension-details 和旧 agora-product 最佳实践的 Android `video_enc.so`/`video_dec.so` → `libvideo_enc.so`/`libvideo_dec.so`。

- `RTC/build/optimize-and-operate/reduce-app-size.mdx:791` 的 v4.6.2 新增核心库、`:807` 的可选库，以及 `:613`、`:1455`、`:2329` 等从共享 extension-details 展开的平台表均使用 lib 前缀；同文件各编码器表也均是 `libvideo_enc.so`。
- 对 `content/docs/zh-CN/**/*.mdx` 检查不带 lib 的精确 `.so` 名称，没有发现遗留。Apple `.xcframework`、Windows `.dll` 没有被错误改成 Android 命名。
- 旧 agora-product 的作者示例不是新站独立内容页；实际承载同一库名/插件明细的 RTC 表已核对，不要求复活旧示例页。

### #2070 / #2073：LogConfig

[#2070 diff](https://github.com/AgoraIO/shengwang-doc-source/pull/2070/files) 的 8 平台 current `class-logconfig.mdx` 均含“自定义路径必须包含日志文件名……只指定日志目录时追加分隔符”语义：Android `:31`、C++ `cpp-all-platforms:31`、iOS `:31`、macOS `:31`、Electron `:34`、Flutter `:39`、RN `react-native:34`、Unity `:45`（路径前缀均为 `API/<平台>/(current)/`）。

[#2073 diff](https://github.com/AgoraIO/shengwang-doc-source/pull/2073/files) 的 HarmonyOS 补丁在 `API/harmonyos/(current)/class-logconfig.mdx:34`，`:38` 默认路径明确为 `{context}.filesDir/agorasdk.log`。Android 本地 4.6.0 归档保留旧表述不算本 PR 缺失，因为源只修改 current。

### #2072 / #2077：metadata 超限截断

[#2072 diff](https://github.com/AgoraIO/shengwang-doc-source/pull/2072/files) 的 C++ 说明已在 `API/cpp-all-platforms/(current)/metadata/metadata-observer.mdx:190`，完整覆盖。

[#2077 diff](https://github.com/AgoraIO/shengwang-doc-source/pull/2077/files) 横跨 8 平台，当前仅 Android `API/android/(current)/metadata/metadata-observer.mdx:200`、iOS `:61`、macOS `:61` 有“如果超过该值，SDK 会截除超出部分”。下列 5 平台缺失：

- `API/electron/(current)/metadata/metadata-observer.mdx:85`：`sendMetaData` 正文没有新增超限截断说明。
- `API/flutter/(current)/metadata/metadata-observer.mdx:85`：`sendMetaData` 正文没有新增超限截断说明。
- `API/react-native/(current)/metadata/metadata-observer.mdx:85`：`sendMetaData` 正文没有新增超限截断说明。
- `API/unity/(current)/metadata/metadata-observer.mdx:82`、`:238`：`SendMetadata`、`OnReadyToSendMetadata` 均缺新增说明。
- `API/unreal-cpp/(current)/metadata/metadata-observer.mdx:196` 仍在“中设定的值。”结束，没有超限结果。

不是后续源回退：冻结源和补查 master 的上述五个平台 HTML 仍含新增句子；如冻结源 Flutter `toc_metadata_observer.html:76`、Unreal-cpp `:169`。全目录定向搜索确认新增完整短语只在 C++/Android/iOS/macOS 出现。

### #2076：基础美颜/美型与美妆素材边界

[#2076 diff](https://github.com/AgoraIO/shengwang-doc-source/pull/2076/files) 只修改共享 `new-beauty-intro.mdx`。新站已展开到 `RTC/build/video/advanced-beauty-460.mdx` 的 Android/iOS/macOS/Windows 四块：`:14`/`:15`、`:437`/`:438`、`:861`/`:862`、`:1285`/`:1286` 均说明基础美颜/美型直接调 API、美妆需支持提供合适 SDK 与素材。#2098 的后续版本边界问题另列，不影响此 PR 原改动存在。

### #2085：Android/iOS 4.6.4

[#2085 diff](https://github.com/AgoraIO/shengwang-doc-source/pull/2085/files) 的发版在 `RTC/reference/release-notes.mdx:66`（Android）、`:2076`（iOS），包含广角、iOS 27 横屏、回调和修复项；Android 后来的措辞精炼亦已体现。下载/Gradle/CocoaPods/SPM 已被 4.7.0 取代，目标证据是 `RTC/reference/downloads/android.mdx:47`、`ios.mdx:6` 及 `DL/rtc-sdk-downloads-data.zh-cn.ts:31` 起的版本/MD5/体积。

确定缺口：

- `API/android/(current)/video/video-basic.mdx:818` 的 `onLocalVideoEvent.event` 仍只有屏幕采集相关事件，没有 `LOCAL_VIDEO_EVENT_TYPE_CAMERA_FOCAL_LENGTH_APPLIED` 和 `...FALLBACK_TO_DEFAULT`。
- 冻结源 `html-docs/rtc/Android/API/toc_video_basic.html:869`、`:870` 仍有这两项，且 #2094 的合并产物也有，不能解释为后续源回退。
- `API/android/meta.json`、`API/ios/meta.json` 只提供 current（及 Android 的 4.6.0），没有源新增的 4.6.2 历史入口。archive URL 修复另见 #2113。

### #2084：Flutter/RN 4.6.4

[#2084 diff](https://github.com/AgoraIO/shengwang-doc-source/pull/2084/files) 的发版主体已在 `RTC/reference/release-notes.mdx:13776`（Flutter 6.6.4）和 `:15853`（RN 4.6.4），iOS 27/广角及各修复项均在。`API/flutter/meta.json:8`、`API/react-native/meta.json:8` 当前标签已为 6.6.4/4.6.4。

确定缺口：

- `API/flutter/(current)/enum-localvideoeventtype.mdx:27` 起和 `API/react-native/(current)/enum-localvideoeventtype.mdx` 枚举仍只有 1—4，缺值 5/6 的 FocalLengthApplied / FocalLengthFallbackToDefault。
- `API/flutter/(current)/video/video-basic.mdx:780` 与 `API/react-native/(current)/video/video-basic.mdx:806` 的 `onLocalVideoEvent` 仍只链接旧枚举，没有新增详细事件列表。
- 冻结源 Flutter `enum_localvideoeventtype.html:46`/`:50` 和 RN `:42`/`:46` 都含两项，未被 #2094 回退（#2094 本来也不涉及 Flutter/RN）。
- 两个下载页分别 `RTC/reference/downloads/flutter.mdx:11`、`react-native.mdx:11` 调用 RtcSdkDownloads；专用数据只覆盖四个 Native 平台，回退公共数据 `DL/sdk-downloads-data.zh-cn.ts:3943`、`:4228`，仍标 **6.6.2 / 4.6.2 最新**，而不是本 PR 的 6.6.4/4.6.4。这是有实际渲染路径的遗漏，不只是闲置旧变量。
- 历史 6.6.2/4.6.2 的 API 入口也缺失，见 #2113。

### #2088：Web String UID 链接

[#2088 diff](https://github.com/AgoraIO/shengwang-doc-source/pull/2088/files) 修复两页旧 404 链接。目标 `API/web/interfaces/iagorartcclient.mdx:1538` 和 `API/web/interfaces/iagorartc.mdx:2071`（另 `:2339` 同义处也一致）均指向 `/zh-CN/reference/faq/integration/string_uid`。目标文件 `content/docs/zh-CN/reference/faq/integration/string_uid.mdx` 存在。保留 Native 2.8/User Account 互通前提，不要求保留旧站绝对 URL。

### #2089：C++ DataStream

[#2089 diff](https://github.com/AgoraIO/shengwang-doc-source/pull/2089/files) 均在 `API/cpp-all-platforms/(current)/metadata/datastream.mdx`：`:107` 明确 [2/2] 与 [1/2] 比较及五秒丢弃行为，`:325`/`:326` 明确 5 通道共享 30 KB/s、每通道每秒 60 包/每包 1 KB；不是只在 Ex 方法有说明。

### #2090：移除 macOS 15 Beta

[#2090 diff](https://github.com/AgoraIO/shengwang-doc-source/pull/2090/files) 删除 FAQ、6 平台发版段落、4 张图及旧站脚本映射。对 `content/docs/zh-CN` 检查 `macos15-beta`、`macOS 15 Sequoia Beta`、`macOS 15.*Beta` 无残留；`public` 文件清单也无 `mac15beta-addkey/addlanguage/choosetemplate/setdisplayname`。旧 `scripts/agent` 映射机制不是 portal 使用的机制，删除该机制内部条目不适用，但所有对应对外内容删除已体现。

### #2113：历史 API archive 修复

[#2113 diff](https://github.com/AgoraIO/shengwang-doc-source/pull/2113/files) 只将 Android/iOS/RN v4.6.2、Flutter v6.6.2 的 archive 从 0.0.511 改为 0.0.492。

- `API/android/meta.json:5` 起只有 current 和 4.6.0；iOS/Flutter/RN 各自 `meta.json:5` 起只有 current。没有上述 4 个历史版本入口，相关 0.0.492 映射在目标配置也不存在。
- 因此不是“错误 URL 已删所以修复成功”，而是访问历史 API 的能力没有等价承接。标未覆盖；需决定恢复本地历史版本还是提供经过验证的 archive 外链，不能盲目复制旧 Docusaurus siteVersion 配置。
- 本次未向外请求 archive URL；不复用 PR 当时的 HTTP 200 结论来宣称今天仍可达。

### #2114：VoIP encryptionMode

[#2114 diff](https://github.com/AgoraIO/shengwang-doc-source/pull/2114/files) 八个值已完整体现在 `content/openapi/voip-callkit/call.zh-CN.yaml:617` 起：AES_128_XTS、AES_128_ECB、AES_256_XTS、SM4_128_ECB、AES_128_GCM、AES_256_GCM、AES_128_GCM2、AES_256_GCM2。默认 GCM2、盐要求和 NONE 指导均保留；目标不存在错误的 XTS1/GCM27/GCM28 等后缀。

### #2094：Native 4.7.0 生成 HTML（部分语义审计）

[#2094 Files changed](https://github.com/AgoraIO/shengwang-doc-source/pull/2094/files) 实际变更是 45 个 HTML 和 1 个平台元数据文件，PR body 中“生成 1225 文件”不是 1225 个不同内容变更。重点按新增类型、参数、枚举、下架说明、版本映射和已知热修复回退识别语义，忽略 ariaid、排版换行、生成导航/高亮差异。

已确认覆盖：

- Android/iOS/macOS/C++ current `meta.json:8` 均为 4.7.0。
- 四平台 `API/<平台>/(current)/class-ivideoeffectobject.mdx` 均已创建；C++ `enum-warncodetype.mdx:190` 已含 `WARN_ADM_RECORD_IS_OCCUPIED`。不能仅据类页存在或版本号正确推定整个生成 PR 已覆盖。

已确认遗漏：

- Android `class-faceshapeareaoptions.mdx:18` 起的代码及 `:63` 起的参数列表均缺 `FACE_SHAPE_AREA_FACESMALL=109`、`FACE_SHAPE_AREA_EYEANGLE=207`；源新增了这两个枚举和范围指导。C++ `enum-faceshapearea.mdx` 也未找到这两个新增语义。
- Android `enum-videoeffectnodeid.mdx:25` 起只列 BEAUTY/STYLE_MAKEUP/FILTER，缺 `STICKER=8`；冻结源同文件 HTML `:42` 已有 STICKER。
- 全四平台 current 文档中未找到 `setVideoEffectStringParam` 的实际方法章节或“设置视频效果的字符串参数”正文。`ios/(current)/class-ivideoeffectobject.mdx:14` 甚至记录 legacy related link 无目标路由，`:68` 仅保留方法名纯文本，不能算新增方法参考迁移完成。
- Android `onLocalVideoEvent` focal-length 两项仍缺，见 #2085。历史 4.6.4/4.6.2 的 archive 版本元数据也未完整保留，见 #2113。
- #2060 回退在源 diff 本身已发生，单列而不算 portal 漏迁。

核查边界：没有对全部 45 HTML 的每个段落、符号、返回值和重定向做机器可验证一对一语义等价验收；尤其大型 `rtc_api_sunset`、errorcode 和 interface-class 重排仍需后续专项完整审计。本结论仅保证上述明确覆盖/遗漏事实，不能据此声称其余均一致。

### #2098：Native 4.7.0 产品文档

[#2098 diff](https://github.com/AgoraIO/shengwang-doc-source/pull/2098/files) 实际合入日期为 **2026-09-22**，不是 PR body 中较早的 09-21 草稿。四平台发版已在 `RTC/reference/release-notes.mdx:8`、`:2022`、`:3977`、`:7530`；下载数据 `DL/rtc-sdk-downloads-data.zh-cn.ts:31`—`:138` 的版本、URL、MD5/体积及 Gradle/CocoaPods/SPM 指引已更新 4.7.0。

确定遗漏：

- `RTC/build/video/advanced-beauty.mdx:13`、`:53`、`:412` 仍限制“大于等于 v4.5.2.9 且小于 v4.6.0”，排除了 4.7.0；另外三平台块在 `:460`、`:911`、`:1362` 同样如此。与同站 4.7.0 发版推荐读此页直接冲突。源要求“v4.7.0 或 v4.5.x 中 v4.5.2.9 及以上”。
- `RTC/build/video/advanced-beauty-460.mdx:7`、`:12`、`:13` 仍写“自 v4.6.0 起”、限时免费及小于 4.6.0 一律去 Legacy，没有源新增的 2.1/2.0/Legacy 三段版本选择及免费措辞更新。四平台块均如此。
- `RTC/get-started/quick-start.mdx:80`、`RTC/build/audio/audio-quick-start.mdx:72` 仍仅列统一防混淆 keep 规则，没有“未启用 R8/ProGuard 无需配置”、AAR 自动 consumer rules/JAR 手动集成和精细化 Gradle 示例。两篇均不含 `consumer-proguard-rules.pro`。
- `RTC/build/optimize-and-operate/reduce-app-size.mdx` 未包含 Android `libagora_ffmpeg_extension.so`、iOS `AgoraffmpegExtension.xcframework` 两段按需 FFmpeg 指引及依赖/移除后系统原生播放能力说明；目标整篇搜索无新增库名。
- `content/docs/zh-CN/reference/faq/product/audio_format.mdx:50` 仍是旧 `ARM`/`FALC` 编解码器拼写，源 PR 已修正 `AMR`/`FLAC`；`:59`—`:61` 也仍是旧分开的 Android 系统限制/WMA 提示，未迁入本次调整后的统一 Lite SDK 条件说明。

## 可复核的只读命令

```sh
gh pr view <id> --repo AgoraIO/shengwang-doc-source --json title,mergeCommit,files,body
gh pr diff <id> --repo AgoraIO/shengwang-doc-source
git -C /Users/yejiayi/Documents/shengwang-doc-source show 5d03551cf64cd057ccfe8d5b256d9c4778e8fbb1:html-docs/rtc/Flutter/API/toc_metadata_observer.html
rg -n '截除超出部分' content/docs/zh-CN/api-reference/rtc --glob '*metadata-observer.mdx'
rg -n 'FocalLength|FOCAL_LENGTH' content/docs/zh-CN/api-reference/rtc --glob '*.mdx'
rg -n 'consumer-proguard|ffmpeg_extension|ffmpegExtension' content/docs/zh-CN/realtime-media/rtc
rg -n '4.6.2|6.6.2' src/components/docs-overview/sdk-downloads-data.zh-cn.ts
```

以上命令的缺失结果结合具体目标方法正文、源冻结快照与下载组件真实数据路径判定，不将单独一次关键词无命中视作全部审计。
