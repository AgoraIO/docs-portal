# 中文旧站增量同步（2026-10-23）

## 固定基线与状态

- PR：[docs-portal #1291](https://github.com/AgoraIO/docs-portal/pull/1291)。
- 源：`shengwang-doc-source/master`，已同步起点 `5ff6834d544e9c647252540da97c574b2aeeef56`，本轮审计终点 `427a27358efd3f2eeb1b9dc6e841e828b9a53366`（旧站 0.0.535）。
- 上一轮 PR #1198 已合并，合并提交 `82d1138723ad805c7032a19880ada68b3c27e652`。
- 目标：`docs-portal/codex/cn-newdoc-html-api-migration`，本轮真实目标基线 `be9871602d5e5a6bd89b1b18944dae975e57259b`；分支 `codex/cn-master-hotfix-20261023`。
- `99e7f81b4` 是更早一轮历史目标基线，不用于本轮。当前是待合入批次，未合并或部署；不能仅据本报告提前推进有效同步基线。
- 核对范围为源增量，不宣称全部历史迁移页面已完成全页保真审计。

## 分类结果

源净变化 283 文件：53 项已同步，4 项已在目标中，224 项不需正文补丁，2 项暂缓。247 个 HarmonyOS HTML/API 文件包含 246 个 API 源与 1 个 TOC 首页，其中 222 个源的标题、描述和规范化正文前后一致；TOC 单独冻结和对照。

- License：RTSA、IoT 共享副本和微呼叫激活/续期 curl 显式使用 POST；RTSA 示例补齐有效 License 和 `--license`。
- ConvoAI：完整 v2.14 发版说明、Token/Basic Auth 鉴权、REST/RTC Token 的用途区分、401/403 解释、两份 Webhook 副本、被打断轮次的两个播放时长字段与示例。OpenAPI 仅补语义差异，保留已有 x-docs 结构、operationId、bundled source-text 与静态同步机制。
- HarmonyOS：完整 v4.6.3 发版说明、三个功能指南、开发环境/示例路径/SDK 准备步骤、Full/Voice 下载版本与 MD5、当前 API 语义差异和下架说明。新 API 按旧 TOC 嵌套目录放置，未重新生成或覆盖整个已有平台。改名字段的旧锚点保留。
- 历史 API 归档：源 #2128 的更正已有 4 组在目标中，不重复覆盖既有已验证替代地址；新增 HarmonyOS v4.4.2 历史入口由固定源元数据确定。

## 源文件 → 目标文件 → 图片 → 验证

完整机器可读记录见 [ledger](./cn-master-sync-20261023-ledger.json)，包含每个源文件的提交/PR、源前后 SHA-256、目标路径/哈希和处理原因；未同步项也不会从台账中消失。

| 源文件 | 目标文件 | 图片 | 状态 |
| --- | --- | --- | --- |
| `docs-api-reference/rtc/_platforms_.meta.js` | `content/docs/zh-CN/api-reference/rtc/web/meta.json`<br/>`content/docs/zh-CN/api-reference/rtc/harmonyos/meta.json`<br/>`content/docs/zh-CN/api-reference/rtc/react-native/meta.json` | 无新增 | 已同步 |
| `docs/convoai/api/response-code.mdx` | `content/docs/zh-CN/api-reference/conversational-ai/rest-api/api/response-code.mdx` | 无新增 | 已同步 |
| `docs/convoai/get-started/quick-start.mdx` | `content/docs/zh-CN/ai/get-started/quick-start.mdx` | 无新增 | 已同步 |
| `docs/convoai/overview/release-notes.mdx` | `content/docs/zh-CN/ai/release-notes.mdx` | 无新增 | 已同步 |
| `docs/convoai/user-guides/http-basic-auth.mdx` | `content/docs/zh-CN/ai/build/http-basic-auth.mdx` | 无新增 | 已同步 |
| `docs/convoai/webhook/ncs-events.mdx` | `content/docs/zh-CN/api-reference/conversational-ai/rest-api/webhook/ncs-events.mdx`<br/>`content/docs/zh-CN/ai/reference/event-types.mdx` | 无新增 | 已同步 |
| `docs/rtc/_sidebar_.meta.harmonyos.js` | `content/docs/zh-CN/realtime-media/rtc/build/audio/audio-effect-mixing.mdx`<br/>`content/docs/zh-CN/realtime-media/rtc/build/audio/voice-changer.mdx`<br/>`content/docs/zh-CN/realtime-media/rtc/build/advanced-channel/channel-encryption.mdx` | 无新增 | 已同步 |
| `docs/rtc/advanced-features/audio-effect-mixing.harmonyos.mdx` | `content/docs/zh-CN/realtime-media/rtc/build/audio/audio-effect-mixing.mdx` | 无新增 | 已同步 |
| `docs/rtc/advanced-features/channel-encryption.harmonyos.mdx` | `content/docs/zh-CN/realtime-media/rtc/build/advanced-channel/channel-encryption.mdx` | 无新增 | 已同步 |
| `docs/rtc/advanced-features/raw-video-data.harmonyos.mdx` | `content/docs/zh-CN/realtime-media/rtc/build/video/raw-video-data.mdx` | 无新增 | 已同步 |
| `docs/rtc/advanced-features/voice-changer.harmonyos.mdx` | `content/docs/zh-CN/realtime-media/rtc/build/audio/voice-changer.mdx` | 无新增 | 已同步 |
| `docs/rtc/basic-features/audio-profile.harmonyos.mdx` | `content/docs/zh-CN/realtime-media/rtc/build/audio/audio-profile.mdx` | 无新增 | 已同步 |
| `docs/rtc/basic-features/audio-quick-start.harmonyos.mdx` | `content/docs/zh-CN/realtime-media/rtc/build/audio/audio-quick-start.mdx` | 无新增 | 已同步 |
| `docs/rtc/basic-features/ls-quick-start.harmonyos.mdx` | `content/docs/zh-CN/realtime-media/rtc/build/advanced-channel/ls-quick-start.mdx` | 无新增 | 已同步 |
| `docs/rtc/basic-features/screen-share.harmonyos.mdx` | `content/docs/zh-CN/realtime-media/rtc/build/video/screen-share.mdx` | 无新增 | 已同步 |
| `docs/rtc/basic-features/video-profile.harmonyos.mdx` | `content/docs/zh-CN/realtime-media/rtc/build/video/video-profile.mdx` | 无新增 | 已同步 |
| `docs/rtc/basic-features/volume.harmonyos.mdx` | `content/docs/zh-CN/realtime-media/rtc/build/audio/volume.mdx` | 无新增 | 已同步 |
| `docs/rtc/get-started/quick-start.harmonyos.mdx` | `content/docs/zh-CN/realtime-media/rtc/get-started/quick-start.mdx` | 无新增 | 已同步 |
| `docs/rtc/get-started/run-demo.harmonyos.mdx` | `content/docs/zh-CN/realtime-media/rtc/get-started/run-demo.mdx` | 无新增 | 已同步 |
| `docs/rtc/overview/release-notes.harmonyos.mdx` | `content/docs/zh-CN/realtime-media/rtc/reference/release-notes.mdx` | 无新增 | 已同步 |
| `docs/rtc/resources.harmonyos.mdx` | `content/docs/zh-CN/realtime-media/rtc/reference/downloads/harmonyos.mdx`<br/>`src/components/docs-overview/sdk-downloads-data.zh-cn.ts` | 无新增 | 已同步 |
| `docs/rtsa/get-started/run-example.c.mdx` | `content/docs/zh-CN/realtime-media/rtsa/get-started/run-example.mdx` | 无新增 | 已同步 |
| `docs/shared/rtc/apiexamples.mdx` | `content/docs/zh-CN/realtime-media/rtc/reference/downloads/harmonyos.mdx` | 无新增 | 已同步 |
| `docs/shared/rtc/quick-start-pre-reqs.mdx` | `content/docs/zh-CN/realtime-media/rtc/get-started/quick-start.mdx`<br/>`content/docs/zh-CN/realtime-media/rtc/build/audio/audio-quick-start.mdx` | 无新增 | 已同步 |
| `docs/voip-callkit/get-started/start-video-call.mdx` | `content/docs/zh-CN/solutions/voip-call/get-started/start-video-call.mdx` | 无新增 | 已同步 |
| `docs/voip-callkit/user-guide/license.mdx` | `content/docs/zh-CN/solutions/voip-call/build/license.mdx` | 无新增 | 已同步 |
| `html-docs/convoai/RESTful/convoai.yaml` | `content/openapi/conversational-ai/rest-api.zh-CN.yaml` | 无新增 | 已同步 |
| `html-docs/rtc/HarmonyOS/API/class_livetranscoding.html` | `content/docs/zh-CN/api-reference/rtc/harmonyos/(current)/class-livetranscoding.mdx` | 无新增 | 已同步 |
| `html-docs/rtc/HarmonyOS/API/class_logconfig.html` | `content/docs/zh-CN/api-reference/rtc/harmonyos/(current)/class-logconfig.mdx` | 无新增 | 已同步 |
| `html-docs/rtc/HarmonyOS/API/class_rtcengineconfig.html` | `content/docs/zh-CN/api-reference/rtc/harmonyos/(current)/class-rtcengineconfig.mdx` | 无新增 | 已同步 |
| `html-docs/rtc/HarmonyOS/API/class_videocanvas.html` | `content/docs/zh-CN/api-reference/rtc/harmonyos/(current)/class-videocanvas.mdx` | 无新增 | 已同步 |
| `html-docs/rtc/HarmonyOS/API/class_videoframe.html` | `content/docs/zh-CN/api-reference/rtc/harmonyos/(current)/class-videoframe.mdx` | 无新增 | 已同步 |
| `html-docs/rtc/HarmonyOS/API/enum_audioeffectpreset.html` | `content/docs/zh-CN/api-reference/rtc/harmonyos/(current)/enum-audioeffectpreset.mdx` | 无新增 | 已同步 |
| `html-docs/rtc/HarmonyOS/API/enum_streamfallbackoptions.html` | `content/docs/zh-CN/api-reference/rtc/harmonyos/(current)/enum-streamfallbackoptions.mdx` | 无新增 | 已同步 |
| `html-docs/rtc/HarmonyOS/API/enum_voicebeautifierpreset.html` | `content/docs/zh-CN/api-reference/rtc/harmonyos/(current)/enum-voicebeautifierpreset.mdx` | 无新增 | 已同步 |
| `html-docs/rtc/HarmonyOS/API/rtc_api_data_type.html` | `content/docs/zh-CN/api-reference/rtc/harmonyos/(current)/rtc-api-data-type.mdx` | 无新增 | 已同步 |
| `html-docs/rtc/HarmonyOS/API/rtc_api_sunset.html` | `content/docs/zh-CN/api-reference/rtc/harmonyos/(current)/rtc-api-sunset.mdx` | 无新增 | 已同步 |
| `html-docs/rtc/HarmonyOS/API/rtc_interface_class.html` | `content/docs/zh-CN/api-reference/rtc/harmonyos/(current)/rtc-interface-class.mdx` | 无新增 | 已同步 |
| `html-docs/rtc/HarmonyOS/API/toc_audio_capture.html` | `content/docs/zh-CN/api-reference/rtc/harmonyos/(current)/audio/audio-capture.mdx` | 无新增 | 已同步 |
| `html-docs/rtc/HarmonyOS/API/toc_audio_device.html` | `content/docs/zh-CN/api-reference/rtc/harmonyos/(current)/device-management/audio-device.mdx` | 无新增 | 已同步 |
| `html-docs/rtc/HarmonyOS/API/toc_audio_effect.html` | `content/docs/zh-CN/api-reference/rtc/harmonyos/(current)/audio/audio-prenpost/audio-effect.mdx` | 无新增 | 已同步 |
| `html-docs/rtc/HarmonyOS/API/toc_audio_effect_file.html` | `content/docs/zh-CN/api-reference/rtc/harmonyos/(current)/play/audio-effect-file.mdx` | 无新增 | 已同步 |
| `html-docs/rtc/HarmonyOS/API/toc_audio_prenpost.html` | `content/docs/zh-CN/api-reference/rtc/harmonyos/(current)/audio/audio-prenpost/index.mdx` | 无新增 | 已同步 |
| `html-docs/rtc/HarmonyOS/API/toc_audio_route.html` | `content/docs/zh-CN/api-reference/rtc/harmonyos/(current)/device-management/audio-route.mdx` | 无新增 | 已同步 |
| `html-docs/rtc/HarmonyOS/API/toc_channel.html` | `content/docs/zh-CN/api-reference/rtc/harmonyos/(current)/channel.mdx` | 无新增 | 已同步 |
| `html-docs/rtc/HarmonyOS/API/toc_datastream.html` | `content/docs/zh-CN/api-reference/rtc/harmonyos/(current)/metadata/datastream.mdx` | 无新增 | 已同步 |
| `html-docs/rtc/HarmonyOS/API/toc_image_source.html` | `content/docs/zh-CN/api-reference/rtc/harmonyos/(current)/video/video-prenpro/image-source.mdx` | 无新增 | 已同步 |
| `html-docs/rtc/HarmonyOS/API/toc_network.html` | `content/docs/zh-CN/api-reference/rtc/harmonyos/(current)/network.mdx` | 无新增 | 已同步 |
| `html-docs/rtc/HarmonyOS/API/toc_video_basic.html` | `content/docs/zh-CN/api-reference/rtc/harmonyos/(current)/video/video-basic.mdx` | 无新增 | 已同步 |
| `html-docs/rtc/HarmonyOS/API/toc_video_custom_capturenrendering.html` | `content/docs/zh-CN/api-reference/rtc/harmonyos/(current)/video/video-custom-capturenrendering.mdx` | 无新增 | 已同步 |
| `html-docs/rtc/HarmonyOS/API/toc_video_enhance_option.html` | `content/docs/zh-CN/api-reference/rtc/harmonyos/(current)/video/video-prenpro/video-enhance-option.mdx` | 无新增 | 已同步 |
| `html-docs/rtc/HarmonyOS/index.html` | `content/docs/zh-CN/api-reference/rtc/harmonyos/(current)/meta.json`<br/>`content/docs/zh-CN/api-reference/rtc/harmonyos/(current)/audio/audio-prenpost/meta.json`<br/>`content/docs/zh-CN/api-reference/rtc/harmonyos/(current)/video/video-prenpro/meta.json` | 无新增 | 已同步 |
| `shared/rtsa/license.mdx` | `content/docs/zh-CN/realtime-media/rtsa/build/project-preparation/license.mdx`<br/>`content/docs/zh-CN/solutions/iot-apaas/build/setup-and-access/license.mdx` | 无新增 | 已同步 |

## 图片与外部资源

- 独立图片清单：[cn-master-sync-20261023-images.tsv](./cn-master-sync-20261023-images.tsv)。对源增量中的 Markdown/MDX 图片及 HTML 正文图片前后提取比较，没有新增或变更正文图片。未编造图床 URL，无需上传、回填或等待同事返回 URL。
- HarmonyOS Full 与 Voice ZIP 均返回 HTTP 200、`application/zip`。MD5 按源分别保留 `52b13901ba39f907d1c52bd642a57ab8`、`a1d6a77792811e23954645a6bc4590a5`；本轮未下载整包重算 MD5。
- HarmonyOS 4.4.2 归档返回 HTTP 200、`text/html`，URL 来自源 `_platforms_.meta.js` 的 `0.0.527`；实际从新站版本菜单点击后，归档 API 概览显示 v4.4.2，未推断其他版本 URL，不承诺外站长期可用性。

## 排除、暂缓与继承问题

- `docs/convoai/best-practice/cloud-3a.mdx` 和 `docs/convoai/user-guides/prepare-response.mdx`：不在旧站有效 sidebar 中，相关 OpenAPI 配置仍带“暂不对外展示”注释。保留为暂缓项，等待明确的公开范围；不新增可被搜索或导航发现的目标页面，不解开源 YAML 的私有注释。
- 旧站 `data/version.ts` 发布计数不迁移。`landing-page.harmonyos.mdx` 的旧 JSX 推荐卡片不直接复制，其版本事实由新站发布说明/下载数据/版本菜单承接。222 个 HTML 源无规范化正文差异，逐项标为 `not-required`。
- 变更页的 3 处既有失效锚点：HarmonyOS channel 的 `onRenewTokenResult` 两处、微呼叫 License 的事件 98 一处。在 `be9871602` 中均可复现，未新增接口定义或猜测修正。

## 一致性与检查

- 两份新增发版说明的完整正文，去除旧/新组件包装并忽略链接地址转换后与固定源相等；三个 HarmonyOS 指南和 Token 示例的代码块与固定源逐块一致。新字段与源 OpenAPI 对象逐字段相等；operationId 集合未变，public 同步文件与 maintained source 字节相等。
- 所有变更页面既有显式 ID 保留，没有新增重复显式 ID；旧站新增 TOC 的父子关系和顺序保留在新站 meta.json。
- `bun install --frozen-lockfile`、`bun run types:check`、`bun run openapi:sync`、`git diff --check`：通过。
- 50 个变更 MDX 使用仓库真实 `source.config.ts` 完整编译：50/50 通过。
- 200 项针对发版说明、OpenAPI、归档版本与 API 标题的测试通过。两个初次失败的新增版本/标题断言已按源版本增量和既有标题规则修正，未降低断言或测试超时。
- 最终全量 `bun run test`：4174 通过、3 失败、2 跳过。RTM USER 示例的两个失败已在未修改基线 worktree 复现；另一个为 retired-cn-docs 的 5 秒超时，独立重跑该文件 59/59 通过。保留本次全量失败事实，不将其写为全量通过。
- 中文变更 MDX 内部链接审计：新增断链 0，继承失效锚点 3；本轮 OpenAPI 文件的 55 个引用全部解析通过。
- `bun x biome check scripts/api-reference-historical-archives.test.ts src/components/docs-overview/sdk-downloads-data.zh-cn.ts`：通过。
- `agent-browser` 浏览器抽查：ConvoAI v2.14 与 HarmonyOS v4.6.3 折叠/平台选择、Token 文档、新增嵌套 API 导航、轮次响应示例及 v4.4.2 归档入口通过；所查本地页面未报告浏览器异常。截图和临时报告仅保存在 ignored `.agent/hotfix-20261023/`，未提交或托管截图。
- `bun run build`：通过（默认 global 区域，1194 个 payload、3356 个机器可读文件、3215 个路由 HTML），单独记录，不与中文产物混用。
- `VITE_DOCS_REGION=cn bun run build`：通过，exit 0；中文客户端、服务端编译与全站预渲染完成，生成 5865 个 payload、7048 个机器可读文件和 6799 个路由 HTML。中文发布路由清单包含本轮全部 50 个变更 MDX 路由；没有把默认 global 构建当作中文构建通过的证据。

## 下一轮起点

先核实本 PR 合并状态。合并后，以 `427a27358efd3f2eeb1b9dc6e841e828b9a53366` 作为下一轮源差异起点，并继续携带上述两个暂缓项。统一入口为 [cn-hotfix-checkpoint.md](./cn-hotfix-checkpoint.md) 和 [本轮 checkpoint](./cn-master-sync-20261023.json)。
