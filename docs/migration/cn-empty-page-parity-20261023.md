# 中文空页与旧站展示一致性修复（2026-10-23）

## 基线与范围

- 源固定于 `shengwang-doc-source/master@427a27358efd3f2eeb1b9dc6e841e828b9a53366`；本轮重新 fetch 后 master 未前进。
- 复核起点：PR #1291 的 `9f7e9fc7e851b702d1771592530caa0fa90d5961`。目标最新 `b1cacdf38`（#1290、#1292）已无冲突合入，原同步目标基线 `be9871602` 保留用于追溯。
- 用户限定：隐藏目录和内部条目保持原样；公开页面以旧站展示、导航层级与正文为准。原有 6828 个中文生成路由结构审查发现的 28 个空 MDX URL 是本轮候选，不将 URL 存在等同于侧栏公开。

## 修复与保留

- HarmonyOS 音频前处理和后处理：旧站 Oxygen 解析器 `processSidebar` 将有子项的 TOC 节点输出为没有正文链接的 category。新站 meta 将 `index` 改为 `!index`，目录仅展开旧 TOC 中的“人声音效”；不改变子页正文。既有目录 URL 和 `toc_audio_prenpost` 锚点保留，直达时显示同一源 TOC 的子页链接。
- C# 摄像头管理：删除旧源没有的英文占位式 description；保持源标题、空正文、历史锚点和公开导航。
- HTTP 鉴权：删除重复 frontmatter description，完整保留旧源正文导语、代码和章节。
- HarmonyOS channel：按旧源两个 Token 回调的完整对应段落恢复措辞，去掉旧源没有的 onRenewTokenResult 说明，并将重入频道方法恢复为 joinChannelWithOptions；保留现有所有显式锚点。
- 24 个不在目标导航的候选文件均与审查起点逐字相同，没有补写、删除或开放入口。
- 3 个公开 C# 叶子页（摄像头管理、虚拟节拍器、人脸检测）的固定旧源也为空，保留原展示，不从其他平台拼接 API。线上浏览器逐页确认这三页也都只有标题和版本，并与固定源 HTML、源 index.html TOC 交叉核实。
- onAudioRouteChanged 的重复条目与首份空 routing 参数在旧源已有；按用户要求保持源展示与内容，本轮保留，需从原始 DITA/SDK 文档源确认后另行修订。

## 图片与逐项映射

没有新增或变更正文图片。原始图片 URL、本地路径、上传、回填和图片类型验证均不适用；没有生成或猜测图床地址。

| 源文件 | 目标文件 | 状态 / 验证 | 图片 URL |
| --- | --- | --- | --- |
| `html-docs/recording/cpp/classagora_1_1linuxsdk_1_1_i_engine_config.html` | `content/docs/zh-CN/api-reference/local-server-recording/cpp/legacy/(current)/classagora-1-1linuxsdk-1-1-i-engine-config.mdx` | 未列入导航；目标字节比较未变 | 无 |
| `html-docs/recording/cpp/classagora_1_1linuxsdk_1_1_i_engine.html` | `content/docs/zh-CN/api-reference/local-server-recording/cpp/legacy/(current)/classagora-1-1linuxsdk-1-1-i-engine.mdx` | 未列入导航；目标字节比较未变 | 无 |
| `html-docs/recording/cpp/namespaceagora.html` | `content/docs/zh-CN/api-reference/local-server-recording/cpp/legacy/(current)/namespaceagora.mdx` | 未列入导航；目标字节比较未变 | 无 |
| `html-docs/recording/Java/classio_1_1agora_1_1recording_1_1common_1_1_common.html` | `content/docs/zh-CN/api-reference/local-server-recording/java/legacy/(current)/classio-1-1agora-1-1recording-1-1common-1-1-common.mdx` | 未列入导航；目标字节比较未变 | 无 |
| `html-docs/recording/Java/namespaceio_1_1agora_1_1recording_1_1common.html` | `content/docs/zh-CN/api-reference/local-server-recording/java/legacy/(current)/namespaceio-1-1agora-1-1recording-1-1common.mdx` | 未列入导航；目标字节比较未变 | 无 |
| `html-docs/rtc/Csharp/API/toc_mobile_camera.html` | `content/docs/zh-CN/api-reference/rtc/csharp-windows/(current)/device-management/mobile-camera.mdx` | 公开叶子页；旧源正文也空，正文保持一致 | 无 |
| `html-docs/rtc/Csharp/API/toc_rhythmplayer.html` | `content/docs/zh-CN/api-reference/rtc/csharp-windows/(current)/play/rhythmplayer.mdx` | 公开叶子页；旧源正文也空，正文保持一致 | 无 |
| `html-docs/rtc/Csharp/API/toc_face_detection.html` | `content/docs/zh-CN/api-reference/rtc/csharp-windows/(current)/video/video-prenpro/face-detection.mdx` | 公开叶子页；旧源正文也空，正文保持一致 | 无 |
| `html-docs/rtc/HarmonyOS/API/toc_audio_prenpost.html` | `content/docs/zh-CN/api-reference/rtc/harmonyos/(current)/audio/audio-prenpost/index.mdx` | 已修复目录入口；子页及兼容 URL 验证通过 | 无 |
| `html-docs/rtc/HarmonyOS/API/class_musiccollection.html` | `content/docs/zh-CN/api-reference/rtc/harmonyos/(current)/class-musiccollection.mdx` | 未列入导航；目标字节比较未变 | 无 |
| `html-docs/rtc-server-sdk/cpp/classagora_1_1_optional.html` | `content/docs/zh-CN/api-reference/rtc-server-sdk/cpp/(current)/classagora-1-1-optional.mdx` | 未列入导航；目标字节比较未变 | 无 |
| `html-docs/rtc-server-sdk/cpp/namespaceagora_1_1commons_1_1cjson.html` | `content/docs/zh-CN/api-reference/rtc-server-sdk/cpp/(current)/namespaceagora-1-1commons-1-1cjson.mdx` | 未列入导航；目标字节比较未变 | 无 |
| `html-docs/rtc-server-sdk/cpp/namespaceagora_1_1internal_1_1swappable__impl.html` | `content/docs/zh-CN/api-reference/rtc-server-sdk/cpp/(current)/namespaceagora-1-1internal-1-1swappable-impl.mdx` | 未列入导航；目标字节比较未变 | 无 |
| `html-docs/rtc-server-sdk/cpp/namespaceagora_1_1internal.html` | `content/docs/zh-CN/api-reference/rtc-server-sdk/cpp/(current)/namespaceagora-1-1internal.mdx` | 未列入导航；目标字节比较未变 | 无 |
| `html-docs/rtc-server-sdk/cpp/namespaceagora_1_1media.html` | `content/docs/zh-CN/api-reference/rtc-server-sdk/cpp/(current)/namespaceagora-1-1media.mdx` | 未列入导航；目标字节比较未变 | 无 |
| `html-docs/rtc-server-sdk/cpp/namespaceagora_1_1signaling.html` | `content/docs/zh-CN/api-reference/rtc-server-sdk/cpp/(current)/namespaceagora-1-1signaling.mdx` | 未列入导航；目标字节比较未变 | 无 |
| `html-docs/rtc-server-sdk/cpp/namespacestd.html` | `content/docs/zh-CN/api-reference/rtc-server-sdk/cpp/(current)/namespacestd.mdx` | 未列入导航；目标字节比较未变 | 无 |
| `html-docs/rtc-server-sdk/cpp/structagora_1_1in__place__t.html` | `content/docs/zh-CN/api-reference/rtc-server-sdk/cpp/(current)/structagora-1-1in-place-t.mdx` | 未列入导航；目标字节比较未变 | 无 |
| `html-docs/rtc-server-sdk/cpp/structagora_1_1internal_1_1_copy_assignable.html` | `content/docs/zh-CN/api-reference/rtc-server-sdk/cpp/(current)/structagora-1-1internal-1-1-copy-assignable.mdx` | 未列入导航；目标字节比较未变 | 无 |
| `html-docs/rtc-server-sdk/cpp/structagora_1_1internal_1_1_copy_constructible.html` | `content/docs/zh-CN/api-reference/rtc-server-sdk/cpp/(current)/structagora-1-1internal-1-1-copy-constructible.mdx` | 未列入导航；目标字节比较未变 | 无 |
| `html-docs/rtc-server-sdk/cpp/structagora_1_1internal_1_1_move_assignable.html` | `content/docs/zh-CN/api-reference/rtc-server-sdk/cpp/(current)/structagora-1-1internal-1-1-move-assignable.mdx` | 未列入导航；目标字节比较未变 | 无 |
| `html-docs/rtc-server-sdk/cpp/structagora_1_1internal_1_1_move_constructible.html` | `content/docs/zh-CN/api-reference/rtc-server-sdk/cpp/(current)/structagora-1-1internal-1-1-move-constructible.mdx` | 未列入导航；目标字节比较未变 | 无 |
| `html-docs/rtc-server-sdk/java/namespaceio_1_1agora_1_1rtc.html` | `content/docs/zh-CN/api-reference/rtc-server-sdk/java/(current)/namespaceio-1-1agora-1-1rtc.mdx` | 未列入导航；目标字节比较未变 | 无 |
| `html-docs/whiteboard/Android/dir_243a4ba6b4f893d71afbb5a3e90552fa.html` | `content/docs/zh-CN/api-reference/whiteboard/whiteboard-sdk/android/(current)/dir-243a4ba6b4f893d71afbb5a3e90552fa.mdx` | 未列入导航；目标字节比较未变 | 无 |
| `html-docs/whiteboard/Android/dir_340c0ffa940b473f799cd5b0c256e868.html` | `content/docs/zh-CN/api-reference/whiteboard/whiteboard-sdk/android/(current)/dir-340c0ffa940b473f799cd5b0c256e868.mdx` | 未列入导航；目标字节比较未变 | 无 |
| `html-docs/whiteboard/Android/dir_4e254d624c24658fbc5d27800386d172.html` | `content/docs/zh-CN/api-reference/whiteboard/whiteboard-sdk/android/(current)/dir-4e254d624c24658fbc5d27800386d172.mdx` | 未列入导航；目标字节比较未变 | 无 |
| `html-docs/whiteboard/Android/dir_b8989817a9fe3fd6f75fb81e8578f096.html` | `content/docs/zh-CN/api-reference/whiteboard/whiteboard-sdk/android/(current)/dir-b8989817a9fe3fd6f75fb81e8578f096.mdx` | 未列入导航；目标字节比较未变 | 无 |
| `docs/danmaku/overview/release-notes.mdx` | `content/docs/zh-CN/realtime-media/danmaku/reference/release-notes.mdx` | 未列入导航；目标字节比较未变 | 无 |

逐文件源/目标 SHA-256 及验证状态保存在本地 ignored `.agent/hotfix-20261023/empty-parity-results.json`；既有增量台账中的受影响目标哈希同步更新。

## 验证

- `git diff --check`：通过。
- `bun run types:check`：通过。
- 本轮 4 个修改 MDX 使用真实 source.config.ts 编译：4/4 通过。
- 28 项分类与保留检查：24 项字节未变、3 项空正文未变、1 项目录入口修复；所有修改正文显式 ID 保留，图片引用未变。
- 实时 HTTP：目录兼容 URL、人声音效、HarmonyOS channel、HTTP 鉴权均 200 且有正文；两处失效的 onRenewTokenResult 引用已消除。
- 4 个修改 MDX 的 189 个链接审查：内部失效链接 0；修改前显式 ID 全部保留。两个 Token 更新段落的完整文字与 8 处源方法链接逐项一致。外部链接未重新逐一请求，不将未检查写为通过。
- 浏览器：目录显示为展开按钮（无 href），子页“人声音效”可访问且正文非空；旧站 C# 空页已抽查。
- 全量 `bun run test`：4192 通过、2 失败、2 跳过（274 文件中 273 通过）。失败仍是 rtm-pr2069-sync.test.ts 的两个 USER 示例断言，前轮已在未改基线复现；没有降低断言或超时。日志中还包含无本地 3000 登录服务的连接错误，准确保留全量失败结果。
- `VITE_DOCS_REGION=cn bun run build`：最终完整重跑通过，exit 0；生成 5865 个 payload、7048 个机器可读文件、6799 个路由 HTML。首轮在补齐源方法链接前主动中断，未将其中断状态计为通过。
- 生产 HTML 复核：目录兼容页、人声音效、HarmonyOS channel、HTTP 鉴权四页均有正文；兼容子页链接、两处 joinChannelWithOptions 链接、无失效回调链接及单次鉴权导语均通过。

## 误报更正与待处理

- 此前迁移报告称有 3 处继承失效锚点，应更正为 2 处 onRenewTokenResult 引用；事件 98 的真实 DOM 已有 `98-api_error`，原告警为链接检查器误报。两处真实引用现已按旧源修正。
- 3 个 C# 公开空页无可迁移的源正文，需要老站内容负责人在原始源中补齐后再同步；本轮不能据其他平台推断其 Windows API 能力。
- 隐藏页面不修改，不将其计为本轮未完成的内容补齐任务。
