# 中文文档产品名称迁移问题清单

日期：2026-10-21。

状态：用户批准的 65 篇修复已完成；9 篇待确认命名差异未修改。下方清单及正文样例保留修复前的盘点证据。

## 实施结果与验证

- 按机器可读清单定点修复 55 篇、98 处正文行及 14 篇 description，去重 65 篇；同时校正这些行中替换名称两侧的中英文空格。未重跑历史整页迁移。
- 新增[共享名称解析器](../../../scripts/lib/legacy-product-labels.mjs)，迁移和审计均读取权威产品元数据：显式名称优先，其次源仓库产品配置；仅缺少源配置文件时使用指定提交的离线快照。未知显示名称明确报错；仅使用内部标识时不触发显示名称解析。不执行输入元数据中的 JavaScript。
- 修复清单：[cn-product-label-repair.json](../../../scripts/fixtures/cn-product-label-repair.json)。源配置快照：[legacy-products.meta.js.txt](../../../scripts/fixtures/legacy-products.meta.js.txt)。独立复核确认快照与指定源提交逐字一致。
- 独立复核确认：按清单逐行应用到 HEAD 后，与这 65 篇的工作区内容完全一致。结构化核查确认所有链接目标、图片 URL、代码块和行内代码不变，9 篇待确认文档逐字不变。
- 回归测试先红后绿：首次运行新增 151 项测试，旧实现 149 项失败；最终迁移、审计、API Center 相关 5 个测试文件合计 **284 项通过**。
- 全量盘点重跑：扫描 6720 篇，已确认名称错误剩余 0 篇、RTMP 描述错误剩余 0 篇，候选文档解析失败 0 篇。
- `bun run types:check` 通过；`git diff --check` 通过。
- 浏览器抽查：云端录制、旁路推流、输入在线媒体流、RTMP 网关开通页及智能摄像头快速开始页均显示正确中文名称。截图只保存在忽略目录 `.agent/artifacts/cn-product-label-*.png`，未作为发布资源或托管链接加入仓库。
- `VITE_DOCS_REGION=global bun run test` 完整运行结果：265 个文件中 257 通过、8 失败；3679 项中 **3668 通过、9 失败、2 跳过**。不能将本次验证描述为全量测试全绿。
- 其中 6 项超时涉及发布说明、内容回归、链接检查、API 目录和退役页面检查。以 `--maxWorkers=1 --testTimeout=60000` 复跑相应测试集合，**87 项通过、168 项因筛选跳过**，无失败。
- 剩余失败：云端录制 `reference/meta.json` 的原有导航排序断言缺少 `ncs-events`；CN 品牌断言受全局测试区域覆盖影响；Algolia 测试受本机 `docs_portal_scratch` 索引配置影响。前者已单独复现，并验证相关测试与 metadata 均与 HEAD 一致。这些内容不在本次修复范围，未改动导航或 `.env.local`。
- PR 仅包含本次修复范围；工作区中其他并行改动保持原样。

## 结论与范围

- 对照源：`shengwang-doc-source origin/master`，提交 `08f70ebd14f548e3b1cb74d1534ca7b579e54f1e`。
- 扫描当前 `content/docs/zh-CN/**` 下全部 6720 个 Markdown/MDX 文件，包括产品指南、场景方案、API 参考和参考资料。
- 已确认名称参数展开错误：55 篇，98 处问题行，涉及 25 个产品或场景。问题行不是字符串出现次数；同一行可能包含多个错误名称。
- 最初提到的云端录制、旁路推流、输入在线媒体流、RTMP 网关共涉及 15 篇、40 处问题行。
- 单独确认 RTMP 网关描述串产品：14 篇，均把 RTMP 网关写成“实时消息 RTM”。与正文问题重叠 4 篇。
- 两类已确认错误合计去重 65 篇。
- 另有 9 篇教学文档存在命名差异：4 篇使用“在线音乐课堂”、5 篇使用“在线美术课堂”，与源配置的“在线音乐教学”“在线美术教学”不同，单列待确认；未计入上述 65 篇。

## 方法与边界

1. 读取源仓库 `master` 的 [产品名称配置](https://github.com/AgoraIO/shengwang-doc-source/blob/08f70ebd14f548e3b1cb74d1534ca7b579e54f1e/docs/_products_.meta.js)，搜索页面和共享片段中的 `frontMatter.ag_product_label` / `props.ag_product_label`。
2. 全量检索当前中文内容的内部产品标识，再使用 `remark-parse + remark-mdx` 解析候选文档，只核查实际正文文本节点。候选文档解析失败数：0。
3. 对正文命中行与源页面、共享片段逐行比对，确认是产品显示名称参数产生的内部标识，不把单纯关键词命中算作错误。
4. 排除 URL、图片路径、图标 key、MDX 属性、代码块、行内代码、API 参数与成员名、注释和英文术语示例。行内代码命中也已复核，没有确认的同根因错误。
5. API 参考中的参数 `rtc`、`recording`、`whiteboard` 等不属于产品名称，不修改。英文内容不属于本次中文名称盘点范围。
6. 下表列出当前实际存在的文档路径，不使用迁移控制表中已经过时的目标路径。

## 根因

源文档没有直接写入英文标识，例如：

```mdx
本文介绍如何开通{frontMatter.ag_product_label}服务。
```

旧站根据 `productModel.label` 注入中文名称，见 [simple-doc-processor.js](https://github.com/AgoraIO/shengwang-doc-source/blob/08f70ebd14f548e3b1cb74d1534ca7b579e54f1e/plugins/plugin-content-docs-ag/doc-factory/processor/simple-doc-processor.js#L219)。迁移时批量调用未传入源中文名称，而本地硬编码名称表只覆盖少数产品，最终走到内部标识回退：

```js
return sourceLabel ?? PRODUCT_LABELS.get(product) ?? product;
```

修复前的相关代码位置（诊断记录）；当前实现已改用上方共享名称解析器：

- [迁移脚本](../../../scripts/migrate-legacy-docs.mjs)原 `PRODUCT_LABELS` 常量及批量调用。
- [当前变量展开与名称解析](../../../scripts/migrate-legacy-docs.mjs#L1248)。
- [当前审计源加载](../../../scripts/audit-single-doc-fidelity.mjs#L245)及[名称解析](../../../scripts/audit-single-doc-fidelity.mjs#L370)。

旧审计也使用同一份不完整的名称表，源侧和目标侧同时错误展开为内部标识，形成漏检。例如云端录制开通文档的[历史审计报告](../../../docs/migration/generated/full-redirect-pass-1-audit/docs__cloud-recording__get-started__enable-service.mdx__all__51f78ea4__to__content__docs__zh-CN__realtime-media__recording__cloud-recording__get-started__enable-service.md)曾记录 44 条完全匹配、0 条变化。

## 按产品汇总

| 内部标识 | 源配置显示名称 | 文档数 | 问题行数 |
| --- | --- | ---: | ---: |
| `media-pull` | 输入在线媒体流 | 5 | 12 |
| `smart-camera` | 智能摄像头 | 5 | 13 |
| `smart-doorbell` | 智能门铃 | 5 | 13 |
| `one-to-one-live` | 1v1 私密房 | 4 | 4 |
| `rtmp-gateway` | RTMP 网关 | 4 | 9 |
| `cloud-recording` | 云端录制 | 3 | 9 |
| `cloud-transcoder` | 云端转码 | 3 | 4 |
| `media-push` | 旁路推流 | 3 | 10 |
| `showroom` | 秀场直播 | 3 | 3 |
| `fusion-cdn` | 融合 CDN 直播 | 2 | 2 |
| `game-voice` | 游戏语音 | 2 | 2 |
| `online-ktv` | 在线 K 歌房 | 2 | 2 |
| `whiteboard` | 互动白板 | 2 | 2 |
| `conversion-ppt` | PPT 转码服务 | 1 | 1 |
| `convoai` | 对话式 AI 引擎 | 1 | 1 |
| `danmaku` | 弹幕玩法 | 1 | 1 |
| `meeting` | 灵动会议 | 1 | 1 |
| `meta-world` | MetaWorld | 1 | 1 |
| `rtc` | 实时互动 | 1 | 2 |
| `rtc-server-sdk` | RTC 服务端 SDK | 1 | 1 |
| `rtm2` | 实时消息 | 1 | 1 |
| `rtsa` | 媒体流加速 | 1 | 1 |
| `smart-watch` | 智能手表 | 1 | 1 |
| `toybox` | 对话式 AI 开发套件 | 1 | 1 |
| `voip-callkit` | 微呼叫 | 1 | 1 |

源配置中 `danmaku`、`meta-world` 的导航定义目前被注释，但旧内容仍存在；仅沿用其历史显示名称做盘点，不改变产品导航或发布状态。

## 已确认正文问题：最初四个产品（15 篇）

| 序号 | 当前文档 | 标题 | 应修复名称 | 问题行 |
| ---: | --- | --- | --- | --- |
| 1 | [realtime-media/cloud-recording/build/optimize-and-operate/checklist.mdx](../../../content/docs/zh-CN/realtime-media/cloud-recording/build/optimize-and-operate/checklist.mdx#L5) | 集成检查清单 | `cloud-recording` → 云端录制 | 5 |
| 2 | [realtime-media/cloud-recording/build/optimize-and-operate/rest-availability.mdx](../../../content/docs/zh-CN/realtime-media/cloud-recording/build/optimize-and-operate/rest-availability.mdx#L15) | 保障 REST 服务高可用 | `cloud-recording` → 云端录制 | 15 |
| 3 | [realtime-media/cloud-recording/build/setup-and-access/enable-service.mdx](../../../content/docs/zh-CN/realtime-media/cloud-recording/build/setup-and-access/enable-service.mdx#L7) | 开通云端录制服务 | `cloud-recording` → 云端录制 | 7、25、70、72、74、78、82 |
| 4 | [realtime-media/media-pull/build/checklist.mdx](../../../content/docs/zh-CN/realtime-media/media-pull/build/checklist.mdx#L5) | 集成检查清单 | `media-pull` → 输入在线媒体流 | 5 |
| 5 | [realtime-media/media-pull/build/enable-service.mdx](../../../content/docs/zh-CN/realtime-media/media-pull/build/enable-service.mdx#L7) | 开通服务 | `media-pull` → 输入在线媒体流 | 7、25、52、54、56、60、64 |
| 6 | [realtime-media/media-pull/build/http-basic-auth.mdx](../../../content/docs/zh-CN/realtime-media/media-pull/build/http-basic-auth.mdx#L168) | 实现 HTTP 基本认证 | `media-pull` → 输入在线媒体流 | 168 |
| 7 | [realtime-media/media-pull/build/rest-availability.mdx](../../../content/docs/zh-CN/realtime-media/media-pull/build/rest-availability.mdx#L9) | 保障 REST 服务高可用 | `media-pull` → 输入在线媒体流 | 9、15 |
| 8 | [realtime-media/media-pull/reference/quota.mdx](../../../content/docs/zh-CN/realtime-media/media-pull/reference/quota.mdx#L24) | 配额限制 | `media-pull` → 输入在线媒体流 | 24 |
| 9 | [realtime-media/media-push/build/enable-media-push/enable-service.mdx](../../../content/docs/zh-CN/realtime-media/media-push/build/enable-media-push/enable-service.mdx#L7) | 开通声网服务 | `media-push` → 旁路推流 | 7、25、50、52、54、58、62 |
| 10 | [realtime-media/media-push/build/monitor-and-maintain-media-push/checklist.mdx](../../../content/docs/zh-CN/realtime-media/media-push/build/monitor-and-maintain-media-push/checklist.mdx#L5) | 集成检查清单 | `media-push` → 旁路推流 | 5 |
| 11 | [realtime-media/media-push/reference/quota.mdx](../../../content/docs/zh-CN/realtime-media/media-push/reference/quota.mdx#L22) | 配额限制 | `media-push` → 旁路推流 | 22、24 |
| 12 | [realtime-media/rtmp-gateway/build/checklist.mdx](../../../content/docs/zh-CN/realtime-media/rtmp-gateway/build/checklist.mdx#L5) | 集成检查清单 | `rtmp-gateway` → RTMP 网关 | 5 |
| 13 | [realtime-media/rtmp-gateway/build/enable-service.mdx](../../../content/docs/zh-CN/realtime-media/rtmp-gateway/build/enable-service.mdx#L7) | 开通声网服务 | `rtmp-gateway` → RTMP 网关 | 7、37、39、41、45、49 |
| 14 | [realtime-media/rtmp-gateway/build/http-auth.mdx](../../../content/docs/zh-CN/realtime-media/rtmp-gateway/build/http-auth.mdx#L86) | 实现 HTTP 安全认证 | `rtmp-gateway` → RTMP 网关 | 86 |
| 15 | [realtime-media/rtmp-gateway/reference/quota.mdx](../../../content/docs/zh-CN/realtime-media/rtmp-gateway/reference/quota.mdx#L27) | 配额限制 | `rtmp-gateway` → RTMP 网关 | 27 |

## 已确认正文问题：其他产品与场景（40 篇）

| 序号 | 当前文档 | 标题 | 应修复名称 | 问题行 |
| ---: | --- | --- | --- | --- |
| 1 | [ai/device-kit/reference/enable-services.mdx](../../../content/docs/zh-CN/ai/device-kit/reference/enable-services.mdx#L27) | 开通服务 | `toybox` → 对话式 AI 开发套件 | 27 |
| 2 | [ai/get-started/enable-service.mdx](../../../content/docs/zh-CN/ai/get-started/enable-service.mdx#L25) | 开通服务 | `convoai` → 对话式 AI 引擎 | 25 |
| 3 | [realtime-media/danmaku/build/setup-and-access/enable-service.mdx](../../../content/docs/zh-CN/realtime-media/danmaku/build/setup-and-access/enable-service.mdx#L25) | 开通弹幕服务 | `danmaku` → 弹幕玩法 | 25 |
| 4 | [realtime-media/fusion-cdn/build/enable-service.mdx](../../../content/docs/zh-CN/realtime-media/fusion-cdn/build/enable-service.mdx#L9) | 开通服务 | `fusion-cdn` → 融合 CDN 直播 | 9 |
| 5 | [realtime-media/fusion-cdn/reference/quota.mdx](../../../content/docs/zh-CN/realtime-media/fusion-cdn/reference/quota.mdx#L9) | 配额限制 | `fusion-cdn` → 融合 CDN 直播 | 9 |
| 6 | [realtime-media/meeting/reference/response-code.mdx](../../../content/docs/zh-CN/realtime-media/meeting/reference/response-code.mdx#L5) | 响应状态码 | `meeting` → 灵动会议 | 5 |
| 7 | [realtime-media/ppt-transcoding/build/setup-and-access/enable-service.mdx](../../../content/docs/zh-CN/realtime-media/ppt-transcoding/build/setup-and-access/enable-service.mdx#L25) | 开通服务 | `conversion-ppt` → PPT 转码服务 | 25 |
| 8 | [realtime-media/rtc-server-sdk/build/enable-service.mdx](../../../content/docs/zh-CN/realtime-media/rtc-server-sdk/build/enable-service.mdx#L7) | 开通声网服务 | `rtc-server-sdk` → RTC 服务端 SDK | 7 |
| 9 | [realtime-media/rtc/build/setup-and-access/enable-service.mdx](../../../content/docs/zh-CN/realtime-media/rtc/build/setup-and-access/enable-service.mdx#L7) | 开通服务 | `rtc` → 实时互动 | 7、68 |
| 10 | [realtime-media/rtm/build/rtm-initialization/enable-service.mdx](../../../content/docs/zh-CN/realtime-media/rtm/build/rtm-initialization/enable-service.mdx#L7) | 开通服务 | `rtm2` → 实时消息 | 7 |
| 11 | [realtime-media/rtsa/build/project-preparation/enable-service.mdx](../../../content/docs/zh-CN/realtime-media/rtsa/build/project-preparation/enable-service.mdx#L4) | 开通声网服务 | `rtsa` → 媒体流加速 | 4 |
| 12 | [realtime-media/transcoding/build/enable-service.mdx](../../../content/docs/zh-CN/realtime-media/transcoding/build/enable-service.mdx#L7) | 开通服务 | `cloud-transcoder` → 云端转码 | 7 |
| 13 | [realtime-media/transcoding/build/rest-availability.mdx](../../../content/docs/zh-CN/realtime-media/transcoding/build/rest-availability.mdx#L19) | 保障 REST 服务高可用 | `cloud-transcoder` → 云端转码 | 19 |
| 14 | [realtime-media/transcoding/reference/quota.mdx](../../../content/docs/zh-CN/realtime-media/transcoding/reference/quota.mdx#L61) | 配额限制 | `cloud-transcoder` → 云端转码 | 61、63 |
| 15 | [realtime-media/whiteboard/fastboard-sdk/build/setup-and-access/enable-service.mdx](../../../content/docs/zh-CN/realtime-media/whiteboard/fastboard-sdk/build/setup-and-access/enable-service.mdx#L25) | 开启和配置互动白板服务 | `whiteboard` → 互动白板 | 25 |
| 16 | [realtime-media/whiteboard/whiteboard-sdk/build/setup-and-access/enable-service.mdx](../../../content/docs/zh-CN/realtime-media/whiteboard/whiteboard-sdk/build/setup-and-access/enable-service.mdx#L25) | 开启和配置互动白板服务 | `whiteboard` → 互动白板 | 25 |
| 17 | [solutions/game-voice/build/enable-service.mdx](../../../content/docs/zh-CN/solutions/game-voice/build/enable-service.mdx#L7) | 开通服务 | `game-voice` → 游戏语音 | 7 |
| 18 | [solutions/game-voice/reference/api.mdx](../../../content/docs/zh-CN/solutions/game-voice/reference/api.mdx#L5) | 客户端 API | `game-voice` → 游戏语音 | 5 |
| 19 | [solutions/meta-world/build/enable-service.mdx](../../../content/docs/zh-CN/solutions/meta-world/build/enable-service.mdx#L5) | 开通元语聊服务 | `meta-world` → MetaWorld | 5 |
| 20 | [solutions/one-to-one-live/custom-signaling/build/customize-and-extend/audio-scenario.mdx](../../../content/docs/zh-CN/solutions/one-to-one-live/custom-signaling/build/customize-and-extend/audio-scenario.mdx#L5) | 设置优质音频体验 | `one-to-one-live` → 1v1 私密房 | 5 |
| 21 | [solutions/one-to-one-live/custom-signaling/build/setup-and-access/enable-service.mdx](../../../content/docs/zh-CN/solutions/one-to-one-live/custom-signaling/build/setup-and-access/enable-service.mdx#L7) | 开通一对一直播服务 | `one-to-one-live` → 1v1 私密房 | 7 |
| 22 | [solutions/one-to-one-live/rtm/build/customize-and-extend/audio-scenario.mdx](../../../content/docs/zh-CN/solutions/one-to-one-live/rtm/build/customize-and-extend/audio-scenario.mdx#L5) | 设置优质音频体验 | `one-to-one-live` → 1v1 私密房 | 5 |
| 23 | [solutions/one-to-one-live/rtm/build/setup-and-access/enable-service.mdx](../../../content/docs/zh-CN/solutions/one-to-one-live/rtm/build/setup-and-access/enable-service.mdx#L7) | 开通一对一直播服务 | `one-to-one-live` → 1v1 私密房 | 7 |
| 24 | [solutions/online-ktv/ktv-scenario/build/setup-and-access/enable-service.mdx](../../../content/docs/zh-CN/solutions/online-ktv/ktv-scenario/build/setup-and-access/enable-service.mdx#L7) | 开通场景化 API 方案服务 | `online-ktv` → 在线 K 歌房 | 7 |
| 25 | [solutions/online-ktv/online-ktv-sdk/build/setup-and-access/enable-service.mdx](../../../content/docs/zh-CN/solutions/online-ktv/online-ktv-sdk/build/setup-and-access/enable-service.mdx#L7) | 开通 PaaS 方案服务 | `online-ktv` → 在线 K 歌房 | 7 |
| 26 | [solutions/showroom/build/audio-scenario.mdx](../../../content/docs/zh-CN/solutions/showroom/build/audio-scenario.mdx#L5) | 设置优质音频体验 | `showroom` → 秀场直播 | 5 |
| 27 | [solutions/showroom/build/enable-service.mdx](../../../content/docs/zh-CN/solutions/showroom/build/enable-service.mdx#L7) | 开通服务 | `showroom` → 秀场直播 | 7 |
| 28 | [solutions/showroom/reference/api.mdx](../../../content/docs/zh-CN/solutions/showroom/reference/api.mdx#L5) | 客户端 API | `showroom` → 秀场直播 | 5 |
| 29 | [solutions/smart-camera/build/amazon-alexa.mdx](../../../content/docs/zh-CN/solutions/smart-camera/build/amazon-alexa.mdx#L7) | 与 Amazon Alexa 互通 | `smart-camera` → 智能摄像头 | 7、24、113、123 |
| 30 | [solutions/smart-camera/build/enable-service.mdx](../../../content/docs/zh-CN/solutions/smart-camera/build/enable-service.mdx#L7) | 开通服务 | `smart-camera` → 智能摄像头 | 7 |
| 31 | [solutions/smart-camera/build/google-assistant.mdx](../../../content/docs/zh-CN/solutions/smart-camera/build/google-assistant.mdx#L7) | 与 Google Assistant 互通 | `smart-camera` → 智能摄像头 | 7 |
| 32 | [solutions/smart-camera/get-started/quick-start.mdx](../../../content/docs/zh-CN/solutions/smart-camera/get-started/quick-start.mdx#L7) | 构建智能摄像头场景 | `smart-camera` → 智能摄像头 | 7、9、16、23、38 |
| 33 | [solutions/smart-camera/reference/advanced-feature.mdx](../../../content/docs/zh-CN/solutions/smart-camera/reference/advanced-feature.mdx#L5) | 告警通知和设备控制 | `smart-camera` → 智能摄像头 | 5、7 |
| 34 | [solutions/smart-doorbell/build/amazon-alexa.mdx](../../../content/docs/zh-CN/solutions/smart-doorbell/build/amazon-alexa.mdx#L7) | 与 Amazon Alexa 互通 | `smart-doorbell` → 智能门铃 | 7、24、113、123 |
| 35 | [solutions/smart-doorbell/build/google-assistant.mdx](../../../content/docs/zh-CN/solutions/smart-doorbell/build/google-assistant.mdx#L7) | 与 Google Assistant 互通 | `smart-doorbell` → 智能门铃 | 7 |
| 36 | [solutions/smart-doorbell/build/quick-start.mdx](../../../content/docs/zh-CN/solutions/smart-doorbell/build/quick-start.mdx#L7) | 构建智能门铃场景 | `smart-doorbell` → 智能门铃 | 7、9、16、23、38 |
| 37 | [solutions/smart-doorbell/build/setup-and-access/enable-service.mdx](../../../content/docs/zh-CN/solutions/smart-doorbell/build/setup-and-access/enable-service.mdx#L7) | 开通服务 | `smart-doorbell` → 智能门铃 | 7 |
| 38 | [solutions/smart-doorbell/reference/advanced-feature.mdx](../../../content/docs/zh-CN/solutions/smart-doorbell/reference/advanced-feature.mdx#L5) | 告警通知和设备控制 | `smart-doorbell` → 智能门铃 | 5、7 |
| 39 | [solutions/smart-watch/build/setup-and-access/enable-service.mdx](../../../content/docs/zh-CN/solutions/smart-watch/build/setup-and-access/enable-service.mdx#L7) | 开通服务 | `smart-watch` → 智能手表 | 7 |
| 40 | [solutions/voip-call/build/enable-service.mdx](../../../content/docs/zh-CN/solutions/voip-call/build/enable-service.mdx#L25) | 开通服务 | `voip-callkit` → 微呼叫 | 25 |

## RTMP 网关描述串产品（14 篇）

以下均只需将描述中的“实时消息 RTM”改为“RTMP 网关”。这是另一类内容生成错误；不把它解释为前述产品标识回退问题。

| 序号 | 当前文档 | 错误位置 |
| ---: | --- | --- |
| 1 | [realtime-media/rtmp-gateway/build/call-api.mdx](../../../content/docs/zh-CN/realtime-media/rtmp-gateway/build/call-api.mdx#L3) | 第 3 行 description |
| 2 | [realtime-media/rtmp-gateway/build/checklist.mdx](../../../content/docs/zh-CN/realtime-media/rtmp-gateway/build/checklist.mdx#L3) | 第 3 行 description |
| 3 | [realtime-media/rtmp-gateway/build/enable-ncs.mdx](../../../content/docs/zh-CN/realtime-media/rtmp-gateway/build/enable-ncs.mdx#L3) | 第 3 行 description |
| 4 | [realtime-media/rtmp-gateway/build/enable-service.mdx](../../../content/docs/zh-CN/realtime-media/rtmp-gateway/build/enable-service.mdx#L3) | 第 3 行 description |
| 5 | [realtime-media/rtmp-gateway/build/http-auth.mdx](../../../content/docs/zh-CN/realtime-media/rtmp-gateway/build/http-auth.mdx#L3) | 第 3 行 description |
| 6 | [realtime-media/rtmp-gateway/build/rest-availability.mdx](../../../content/docs/zh-CN/realtime-media/rtmp-gateway/build/rest-availability.mdx#L3) | 第 3 行 description |
| 7 | [realtime-media/rtmp-gateway/build/rtmp-domain-switch.mdx](../../../content/docs/zh-CN/realtime-media/rtmp-gateway/build/rtmp-domain-switch.mdx#L3) | 第 3 行 description |
| 8 | [realtime-media/rtmp-gateway/get-started/use-gateway.mdx](../../../content/docs/zh-CN/realtime-media/rtmp-gateway/get-started/use-gateway.mdx#L3) | 第 3 行 description |
| 9 | [realtime-media/rtmp-gateway/index.mdx](../../../content/docs/zh-CN/realtime-media/rtmp-gateway/index.mdx#L3) | 第 3 行 description |
| 10 | [realtime-media/rtmp-gateway/reference/billing.mdx](../../../content/docs/zh-CN/realtime-media/rtmp-gateway/reference/billing.mdx#L3) | 第 3 行 description |
| 11 | [realtime-media/rtmp-gateway/reference/ncs-events.mdx](../../../content/docs/zh-CN/realtime-media/rtmp-gateway/reference/ncs-events.mdx#L3) | 第 3 行 description |
| 12 | [realtime-media/rtmp-gateway/reference/payment.mdx](../../../content/docs/zh-CN/realtime-media/rtmp-gateway/reference/payment.mdx#L3) | 第 3 行 description |
| 13 | [realtime-media/rtmp-gateway/reference/quota.mdx](../../../content/docs/zh-CN/realtime-media/rtmp-gateway/reference/quota.mdx#L3) | 第 3 行 description |
| 14 | [realtime-media/rtmp-gateway/reference/response-code.mdx](../../../content/docs/zh-CN/realtime-media/rtmp-gateway/reference/response-code.mdx#L3) | 第 3 行 description |

这批描述由提交 `a1b5a2ee28c` 引入（通过开通文档的 `git blame` 确认）；本次未定位到仍被保留的描述生成脚本，不推断其具体字符串匹配实现。

## 待确认命名差异（9 篇，不混入已确认错误）

源产品配置 `online-music-class` 的名称是“在线音乐教学”，而迁移脚本硬编码成“在线音乐课堂”。当前以下 4 篇保留了后者。是否统一回源名称，需要明确命名口径；不能把同义词差异直接作为确定性错误批量修改。

| 当前文档 | 涉及行 | 差异 |
| --- | --- | --- |
| [solutions/online-music-class/get-started/quick-start.mdx](../../../content/docs/zh-CN/solutions/online-music-class/get-started/quick-start.mdx#L3) | 3 | 在线音乐课堂 → 在线音乐教学（待确认） |
| [solutions/online-music-class/build/setup-and-access/enable-service.mdx](../../../content/docs/zh-CN/solutions/online-music-class/build/setup-and-access/enable-service.mdx#L3) | 3、7 | 在线音乐课堂 → 在线音乐教学（待确认） |
| [solutions/online-music-class/build/extend-karaoke/fish-eye.mdx](../../../content/docs/zh-CN/solutions/online-music-class/build/extend-karaoke/fish-eye.mdx#L3) | 3 | 在线音乐课堂 → 在线音乐教学（待确认） |
| [solutions/online-music-class/reference/downloads/index.mdx](../../../content/docs/zh-CN/solutions/online-music-class/reference/downloads/index.mdx#L3) | 3 | 在线音乐课堂 → 在线音乐教学（待确认） |

另外 5 篇在线美术教学文档的 description 使用了“在线美术课堂”，也单列为命名口径差异：

| 当前文档 | 涉及行 | 差异 |
| --- | --- | --- |
| [solutions/art-class/get-started/quick-start.mdx](../../../content/docs/zh-CN/solutions/art-class/get-started/quick-start.mdx#L3) | 3 | 在线美术课堂 → 在线美术教学（待确认） |
| [solutions/art-class/build/trapezoid-correction.mdx](../../../content/docs/zh-CN/solutions/art-class/build/trapezoid-correction.mdx#L3) | 3 | 在线美术课堂 → 在线美术教学（待确认） |
| [solutions/art-class/build/brightness-correction.mdx](../../../content/docs/zh-CN/solutions/art-class/build/brightness-correction.mdx#L3) | 3 | 在线美术课堂 → 在线美术教学（待确认） |
| [solutions/art-class/build/enable-service.mdx](../../../content/docs/zh-CN/solutions/art-class/build/enable-service.mdx#L3) | 3 | 在线美术课堂 → 在线美术教学（待确认） |
| [solutions/art-class/reference/downloads/index.mdx](../../../content/docs/zh-CN/solutions/art-class/reference/downloads/index.mdx#L3) | 3 | 在线美术课堂 → 在线美术教学（待确认） |

另一个潜在问题是迁移脚本将 `art-class` 硬编码为“灵动课堂”，源配置为“在线美术教学”。目前唯一对应开通介绍位于 [art-class/build/enable-service.mdx 第 7 行](../../../content/docs/zh-CN/solutions/art-class/build/enable-service.mdx#L7)的注释中，不是发布可见正文，未计入 55 篇正文错误；修复名称解析时应纠正这个潜在映射。

## 逐文档源证据与正文样例

每条给出当前问题样例和源证据。完整问题行已列在上方清单中。共享模板中的参数经调用页面的产品上下文展开，不能把共享模板本身的目录名当产品名称。

### ai/device-kit/reference/enable-services.mdx

- 当前第 27 行：\\|为\\|使\\|用\\|t\\|o\\|y\\|b\\|o\\|x\\|服\\|务\\|创\\|建\\|项\\|目\\|时\\|，\\|项\\|目\\|类\\|型\\|选\\|择\\|*\\|*\\|通\\|用\\|项\\|目\\|*\\|*\\|。\\|
- 应显示：对话式 AI 开发套件。
- 源证据：[docs/toybox/get-started/enable-service.mdx:22](https://github.com/AgoraIO/shengwang-doc-source/blob/08f70ebd14f548e3b1cb74d1534ca7b579e54f1e/docs/toybox/get-started/enable-service.mdx#L22)。

### ai/get-started/enable-service.mdx

- 当前第 25 行：\\|为\\|使\\|用\\|c\\|o\\|n\\|v\\|o\\|a\\|i\\|服\\|务\\|创\\|建\\|项\\|目\\|时\\|，\\|项\\|目\\|类\\|型\\|选\\|择\\|*\\|*\\|通\\|用\\|项\\|目\\|*\\|*\\|。\\|
- 应显示：对话式 AI 引擎。
- 源证据：[docs/convoai/get-started/enable-service.mdx:22](https://github.com/AgoraIO/shengwang-doc-source/blob/08f70ebd14f548e3b1cb74d1534ca7b579e54f1e/docs/convoai/get-started/enable-service.mdx#L22)。

### realtime-media/cloud-recording/build/optimize-and-operate/checklist.mdx

- 当前第 5 行：\\|参\\|考\\|以\\|下\\|表\\|格\\|，\\|快\\|速\\|确\\|认\\|每\\|条\\|检\\|查\\|项\\|是\\|否\\|符\\|合\\|集\\|成\\|要\\|求\\|，\\|以\\|保\\|证\\|c\\|l\\|o\\|u\\|d\\|-\\|r\\|e\\|c\\|o\\|r\\|d\\|i\\|n\\|g\\|服\\|务\\|的\\|可\\|靠\\|性\\|。\\|
- 应显示：云端录制。
- 源证据：[docs/cloud-recording/best-practices/checklist.mdx:5](https://github.com/AgoraIO/shengwang-doc-source/blob/08f70ebd14f548e3b1cb74d1534ca7b579e54f1e/docs/cloud-recording/best-practices/checklist.mdx#L5)。

### realtime-media/cloud-recording/build/optimize-and-operate/rest-availability.mdx

- 当前第 15 行：\\|如\\|需\\|比\\|故\\|障\\|迁\\|移\\|更\\|高\\|的\\|质\\|量\\|保\\|障\\|，\\|你\\|可\\|以\\|采\\|用\\|多\\|路\\|任\\|务\\|保\\|障\\|策\\|略\\|。\\|每\\|路\\|c\\|l\\|o\\|u\\|d\\|-\\|r\\|e\\|c\\|o\\|r\\|d\\|i\\|n\\|g\\|任\\|务\\|单\\|独\\|计\\|费\\|，\\|计\\|费\\|方\\|式\\|详\\|见\\|[\\|单\\|流\\|和\\|合\\|流\\|录\\|制\\|计\\|费\\|]\\|(\\|/\\|z\\|h\\|-\\|C\\|N\\|/\\|r\\|e\\|a\\|l\\|t\\|i\\|m\\|e\\|-\\|m\\|e\\|d\\|i\\|a\\|/\\|c\\|l\\|o\\|u\\|d\\|-\\|r\\|e\\|c\\|o\\|r\\|d\\|i\\|n\\|g\\|/\\|r\\|e\\|f\\|e\\|r\\|e\\|n\\|c\\|e\\|/\\|b\\|i\\|l\\|l\\|i\\|n\\|g\\|-\\|s\\|t\\|r\\|a\\|t\\|e\\|g\\|y\\|/\\|b\\|i\\|l\\|l\\|i\\|n\\|g\\|)\\|。\\|实\\|现\\|步\\|骤\\|如\\|下\\|：\\|
- 应显示：云端录制。
- 源证据：[docs/cloud-recording/best-practices/rest-availability.mdx:15](https://github.com/AgoraIO/shengwang-doc-source/blob/08f70ebd14f548e3b1cb74d1534ca7b579e54f1e/docs/cloud-recording/best-practices/rest-availability.mdx#L15)。

### realtime-media/cloud-recording/build/setup-and-access/enable-service.mdx

- 当前第 7 行：\\|本\\|文\\|介\\|绍\\|如\\|何\\|开\\|通\\|c\\|l\\|o\\|u\\|d\\|-\\|r\\|e\\|c\\|o\\|r\\|d\\|i\\|n\\|g\\|服\\|务\\|。\\|
- 应显示：云端录制。
- 源证据：[docs/cloud-recording/get-started/enable-service.mdx:12](https://github.com/AgoraIO/shengwang-doc-source/blob/08f70ebd14f548e3b1cb74d1534ca7b579e54f1e/docs/cloud-recording/get-started/enable-service.mdx#L12)。

### realtime-media/danmaku/build/setup-and-access/enable-service.mdx

- 当前第 25 行：\\|为\\|使\\|用\\|d\\|a\\|n\\|m\\|a\\|k\\|u\\|服\\|务\\|创\\|建\\|项\\|目\\|时\\|，\\|项\\|目\\|类\\|型\\|选\\|择\\|*\\|*\\|通\\|用\\|项\\|目\\|*\\|*\\|。\\|
- 应显示：弹幕玩法。
- 源证据：[docs/danmaku/get-started/enable-service.mdx:21](https://github.com/AgoraIO/shengwang-doc-source/blob/08f70ebd14f548e3b1cb74d1534ca7b579e54f1e/docs/danmaku/get-started/enable-service.mdx#L21)。

### realtime-media/fusion-cdn/build/enable-service.mdx

- 当前第 9 行：\\|本\\|文\\|介\\|绍\\|如\\|何\\|开\\|通\\|f\\|u\\|s\\|i\\|o\\|n\\|-\\|c\\|d\\|n\\|服\\|务\\|。\\|
- 应显示：融合 CDN 直播。
- 源证据：[docs/fusion-cdn/get-started/enable-service.mdx:19](https://github.com/AgoraIO/shengwang-doc-source/blob/08f70ebd14f548e3b1cb74d1534ca7b579e54f1e/docs/fusion-cdn/get-started/enable-service.mdx#L19)。

### realtime-media/fusion-cdn/reference/quota.mdx

- 当前第 9 行：\\|针\\|对\\|每\\|个\\|声\\|网\\|账\\|号\\|，\\|f\\|u\\|s\\|i\\|o\\|n\\|-\\|c\\|d\\|n\\| \\|服\\|务\\|的\\|每\\|秒\\|请\\|求\\|数\\|（\\|Q\\|P\\|S\\|）\\|上\\|限\\|为\\| \\|5\\|0\\| \\|次\\|/\\|秒\\|。\\|
- 应显示：融合 CDN 直播。
- 源证据：[docs/fusion-cdn/quota.mdx:11](https://github.com/AgoraIO/shengwang-doc-source/blob/08f70ebd14f548e3b1cb74d1534ca7b579e54f1e/docs/fusion-cdn/quota.mdx#L11)。

### realtime-media/media-pull/build/checklist.mdx

- 当前第 5 行：\\|参\\|考\\|以\\|下\\|表\\|格\\|，\\|快\\|速\\|确\\|认\\|每\\|条\\|检\\|查\\|项\\|是\\|否\\|符\\|合\\|集\\|成\\|要\\|求\\|，\\|以\\|保\\|证\\|m\\|e\\|d\\|i\\|a\\|-\\|p\\|u\\|l\\|l\\|服\\|务\\|的\\|可\\|靠\\|性\\|。\\|
- 应显示：输入在线媒体流。
- 源证据：[docs/media-pull/best-practices/checklist.mdx:5](https://github.com/AgoraIO/shengwang-doc-source/blob/08f70ebd14f548e3b1cb74d1534ca7b579e54f1e/docs/media-pull/best-practices/checklist.mdx#L5)。

### realtime-media/media-pull/build/enable-service.mdx

- 当前第 7 行：\\|本\\|文\\|介\\|绍\\|如\\|何\\|开\\|通\\|m\\|e\\|d\\|i\\|a\\|-\\|p\\|u\\|l\\|l\\|服\\|务\\|。\\|
- 应显示：输入在线媒体流。
- 源证据：[docs/media-pull/get-started/enable-service.mdx:10](https://github.com/AgoraIO/shengwang-doc-source/blob/08f70ebd14f548e3b1cb74d1534ca7b579e54f1e/docs/media-pull/get-started/enable-service.mdx#L10)。

### realtime-media/media-pull/build/http-basic-auth.mdx

- 当前第 168 行：\\|1\\|.\\| \\|参\\|考\\| \\|[\\|R\\|E\\|S\\|T\\|f\\|u\\|l\\| \\|A\\|P\\|I\\| \\|说\\|明\\|]\\|(\\|/\\|z\\|h\\|-\\|C\\|N\\|/\\|a\\|p\\|i\\|-\\|r\\|e\\|f\\|e\\|r\\|e\\|n\\|c\\|e\\|/\\|a\\|p\\|i\\|-\\|r\\|e\\|f\\|/\\|m\\|e\\|d\\|i\\|a\\|-\\|p\\|u\\|l\\|l\\|/\\|c\\|r\\|e\\|a\\|t\\|e\\|)\\| \\|集\\|成\\| \\|m\\|e\\|d\\|i\\|a\\|-\\|p\\|u\\|l\\|l\\| \\|服\\|务\\|。\\|
- 应显示：输入在线媒体流。
- 源证据：[docs/media-pull/user-guides/http-basic-auth.mdx:13](https://github.com/AgoraIO/shengwang-doc-source/blob/08f70ebd14f548e3b1cb74d1534ca7b579e54f1e/docs/media-pull/user-guides/http-basic-auth.mdx#L13)。

### realtime-media/media-pull/build/rest-availability.mdx

- 当前第 9 行：\\|针\\|对\\|网\\|络\\|故\\|障\\|，\\|以\\|及\\|非\\|声\\|网\\|云\\|、\\|非\\|声\\|网\\|软\\|件\\|设\\|施\\|和\\|不\\|可\\|抗\\|力\\|等\\|因\\|素\\|导\\|致\\|的\\| \\|m\\|e\\|d\\|i\\|a\\|-\\|p\\|u\\|l\\|l\\| \\|中\\|断\\|，\\|声\\|网\\|服\\|务\\|为\\|了\\|保\\|证\\|更\\|好\\|的\\|用\\|户\\|体\\|验\\|，\\|提\\|供\\|自\\|动\\|故\\|障\\|迁\\|移\\|服\\|务\\|，\\|该\\|服\\|务\\|会\\|在\\|尽\\|量\\|短\\|的\\|时\\|间\\|内\\|完\\|成\\|迁\\|移\\|（\\|预\\|计\\| \\|4\\| \\|分\\|钟\\|内\\|）\\|，\\|迁\\|移\\|期\\|间\\| \\|m\\|e\\|d\\|i\\|a\\|-\\|p\\|u\\|l\\|l\\| \\|任\\|务\\|中\\|断\\|，\\|可\\|能\\|导\\|致\\|部\\|分\\|数\\|据\\|丢\\|失\\|。\\|
- 应显示：输入在线媒体流。
- 源证据：[docs/media-pull/best-practices/rest-availability.mdx:12](https://github.com/AgoraIO/shengwang-doc-source/blob/08f70ebd14f548e3b1cb74d1534ca7b579e54f1e/docs/media-pull/best-practices/rest-availability.mdx#L12)。

### realtime-media/media-pull/reference/quota.mdx

- 当前第 24 行：\\|在\\|有\\|并\\|发\\|任\\|务\\|场\\|景\\|下\\|，\\|m\\|e\\|d\\|i\\|a\\|-\\|p\\|u\\|l\\|l\\| \\|服\\|务\\|的\\|每\\|秒\\|请\\|求\\|数\\|不\\|能\\|超\\|过\\|最\\|大\\|并\\|发\\|任\\|务\\|数\\|的\\| \\|1\\|0\\|%\\|。\\|
- 应显示：输入在线媒体流。
- 源证据：[docs/media-pull/quota.mdx:61](https://github.com/AgoraIO/shengwang-doc-source/blob/08f70ebd14f548e3b1cb74d1534ca7b579e54f1e/docs/media-pull/quota.mdx#L61)。

### realtime-media/media-push/build/enable-media-push/enable-service.mdx

- 当前第 7 行：\\|本\\|文\\|介\\|绍\\|如\\|何\\|开\\|通\\|m\\|e\\|d\\|i\\|a\\|-\\|p\\|u\\|s\\|h\\|服\\|务\\|。\\|
- 应显示：旁路推流。
- 源证据：[docs/media-push/get-started/enable-service.mdx:10](https://github.com/AgoraIO/shengwang-doc-source/blob/08f70ebd14f548e3b1cb74d1534ca7b579e54f1e/docs/media-push/get-started/enable-service.mdx#L10)。

### realtime-media/media-push/build/monitor-and-maintain-media-push/checklist.mdx

- 当前第 5 行：\\|参\\|考\\|以\\|下\\|表\\|格\\|，\\|快\\|速\\|确\\|认\\|每\\|条\\|检\\|查\\|项\\|是\\|否\\|符\\|合\\|集\\|成\\|要\\|求\\|，\\|以\\|保\\|证\\|m\\|e\\|d\\|i\\|a\\|-\\|p\\|u\\|s\\|h\\|服\\|务\\|的\\|可\\|靠\\|性\\|。\\|
- 应显示：旁路推流。
- 源证据：[docs/media-push/best-practices/checklist.mdx:5](https://github.com/AgoraIO/shengwang-doc-source/blob/08f70ebd14f548e3b1cb74d1534ca7b579e54f1e/docs/media-push/best-practices/checklist.mdx#L5)。

### realtime-media/media-push/reference/quota.mdx

- 当前第 22 行：\\|针\\|对\\|每\\|个\\|声\\|网\\|账\\|号\\|，\\|m\\|e\\|d\\|i\\|a\\|-\\|p\\|u\\|s\\|h\\|服\\|务\\|的\\|每\\|秒\\|请\\|求\\|数\\| \\|(\\|Q\\|P\\|S\\|,\\| \\|Q\\|u\\|e\\|r\\|i\\|e\\|s\\| \\|P\\|e\\|r\\| \\|S\\|e\\|c\\|o\\|n\\|d\\|)\\| \\|上\\|限\\|为\\| \\|5\\|0\\| \\|次\\|/\\|秒\\|。\\|超\\|出\\|限\\|制\\|速\\|率\\|时\\|会\\|返\\|回\\|状\\|态\\|码\\| \\|`\\|4\\|2\\|9\\| \\|(\\|T\\|o\\|o\\| \\|M\\|a\\|n\\|y\\| \\|R\\|e\\|q\\|u\\|e\\|s\\|t\\|s\\|)\\|`\\|。\\|
- 应显示：旁路推流。
- 源证据：[docs/media-push/quota.mdx:61](https://github.com/AgoraIO/shengwang-doc-source/blob/08f70ebd14f548e3b1cb74d1534ca7b579e54f1e/docs/media-push/quota.mdx#L61)。

### realtime-media/meeting/reference/response-code.mdx

- 当前第 5 行：\\|在\\|调\\|用\\|m\\|e\\|e\\|t\\|i\\|n\\|g\\| \\|R\\|E\\|S\\|T\\|f\\|u\\|l\\| \\|A\\|P\\|I\\| \\|过\\|程\\|中\\|，\\|你\\|可\\|能\\|收\\|到\\|如\\|下\\| \\|H\\|T\\|T\\|P\\| \\|响\\|应\\|状\\|态\\|码\\|：\\|
- 应显示：灵动会议。
- 源证据：[docs/meeting/response-code.restful.mdx:5](https://github.com/AgoraIO/shengwang-doc-source/blob/08f70ebd14f548e3b1cb74d1534ca7b579e54f1e/docs/meeting/response-code.restful.mdx#L5)。

### realtime-media/ppt-transcoding/build/setup-and-access/enable-service.mdx

- 当前第 25 行：\\|为\\|使\\|用\\|c\\|o\\|n\\|v\\|e\\|r\\|s\\|i\\|o\\|n\\|-\\|p\\|p\\|t\\|服\\|务\\|创\\|建\\|项\\|目\\|时\\|，\\|项\\|目\\|类\\|型\\|选\\|择\\|*\\|*\\|通\\|用\\|项\\|目\\|*\\|*\\|。\\|
- 应显示：PPT 转码服务。
- 源证据：[docs/conversion-ppt/get-started/enable-service.mdx:21](https://github.com/AgoraIO/shengwang-doc-source/blob/08f70ebd14f548e3b1cb74d1534ca7b579e54f1e/docs/conversion-ppt/get-started/enable-service.mdx#L21)。

### realtime-media/rtc-server-sdk/build/enable-service.mdx

- 当前第 7 行：\\|本\\|文\\|介\\|绍\\|如\\|何\\|开\\|通\\|r\\|t\\|c\\|-\\|s\\|e\\|r\\|v\\|e\\|r\\|-\\|s\\|d\\|k\\|服\\|务\\|。\\|
- 应显示：RTC 服务端 SDK。
- 源证据：[docs/rtc-server-sdk/get-started/enable-service.mdx:10](https://github.com/AgoraIO/shengwang-doc-source/blob/08f70ebd14f548e3b1cb74d1534ca7b579e54f1e/docs/rtc-server-sdk/get-started/enable-service.mdx#L10)。

### realtime-media/rtc/build/setup-and-access/enable-service.mdx

- 当前第 7 行：\\|本\\|文\\|介\\|绍\\|如\\|何\\|开\\|通\\|r\\|t\\|c\\|服\\|务\\|。\\|
- 应显示：实时互动。
- 源证据：[docs/rtc/get-started/enable-service.mdx:11](https://github.com/AgoraIO/shengwang-doc-source/blob/08f70ebd14f548e3b1cb74d1534ca7b579e54f1e/docs/rtc/get-started/enable-service.mdx#L11)。

### realtime-media/rtm/build/rtm-initialization/enable-service.mdx

- 当前第 7 行：\\|本\\|文\\|介\\|绍\\|如\\|何\\|开\\|通\\|r\\|t\\|m\\|2\\| \\|(\\|R\\|T\\|M\\|)\\| \\|服\\|务\\|。\\|
- 应显示：实时消息。
- 源证据：[docs/rtm2/get-started/enable-service.mdx:12](https://github.com/AgoraIO/shengwang-doc-source/blob/08f70ebd14f548e3b1cb74d1534ca7b579e54f1e/docs/rtm2/get-started/enable-service.mdx#L12)。

### realtime-media/rtmp-gateway/build/checklist.mdx

- 当前第 5 行：\\|参\\|考\\|以\\|下\\|表\\|格\\|，\\|快\\|速\\|确\\|认\\|每\\|条\\|检\\|查\\|项\\|是\\|否\\|符\\|合\\|集\\|成\\|要\\|求\\|，\\|以\\|保\\|证\\| \\|r\\|t\\|m\\|p\\|-\\|g\\|a\\|t\\|e\\|w\\|a\\|y\\|服\\|务\\|的\\|可\\|靠\\|性\\|。\\|
- 应显示：RTMP 网关。
- 源证据：[docs/rtmp-gateway/best-practices/checklist.mdx:5](https://github.com/AgoraIO/shengwang-doc-source/blob/08f70ebd14f548e3b1cb74d1534ca7b579e54f1e/docs/rtmp-gateway/best-practices/checklist.mdx#L5)。

### realtime-media/rtmp-gateway/build/enable-service.mdx

- 当前第 7 行：\\|本\\|文\\|介\\|绍\\|如\\|何\\|开\\|通\\| \\|r\\|t\\|m\\|p\\|-\\|g\\|a\\|t\\|e\\|w\\|a\\|y\\|服\\|务\\|。\\|
- 应显示：RTMP 网关。
- 源证据：[docs/rtmp-gateway/get-started/enable-service.mdx:9](https://github.com/AgoraIO/shengwang-doc-source/blob/08f70ebd14f548e3b1cb74d1534ca7b579e54f1e/docs/rtmp-gateway/get-started/enable-service.mdx#L9)。

### realtime-media/rtmp-gateway/build/http-auth.mdx

- 当前第 86 行：\\|1\\|.\\| \\|参\\|考\\| \\|[\\|A\\|P\\|I\\| \\|文\\|档\\|]\\|(\\|/\\|z\\|h\\|-\\|C\\|N\\|/\\|a\\|p\\|i\\|-\\|r\\|e\\|f\\|e\\|r\\|e\\|n\\|c\\|e\\|/\\|a\\|p\\|i\\|-\\|r\\|e\\|f\\|/\\|r\\|t\\|m\\|p\\|-\\|g\\|a\\|t\\|e\\|w\\|a\\|y\\|/\\|c\\|r\\|e\\|a\\|t\\|e\\|-\\|s\\|t\\|r\\|e\\|a\\|m\\|i\\|n\\|g\\|-\\|k\\|e\\|y\\|)\\|集\\|成\\| \\|r\\|t\\|m\\|p\\|-\\|g\\|a\\|t\\|e\\|w\\|a\\|y\\|服\\|务\\|。\\|
- 应显示：RTMP 网关。
- 源证据：[docs/rtmp-gateway/user-guides/http-auth.mdx:86](https://github.com/AgoraIO/shengwang-doc-source/blob/08f70ebd14f548e3b1cb74d1534ca7b579e54f1e/docs/rtmp-gateway/user-guides/http-auth.mdx#L86)。

### realtime-media/rtmp-gateway/reference/quota.mdx

- 当前第 27 行：\\|在\\|有\\|并\\|发\\|任\\|务\\|场\\|景\\|下\\|，\\|r\\|t\\|m\\|p\\|-\\|g\\|a\\|t\\|e\\|w\\|a\\|y\\|服\\|务\\|的\\|每\\|秒\\|请\\|求\\|数\\|不\\|能\\|超\\|过\\|最\\|大\\|并\\|发\\|任\\|务\\|数\\|的\\| \\|1\\|0\\|%\\|。\\|
- 应显示：RTMP 网关。
- 源证据：[docs/rtmp-gateway/quota.mdx:24](https://github.com/AgoraIO/shengwang-doc-source/blob/08f70ebd14f548e3b1cb74d1534ca7b579e54f1e/docs/rtmp-gateway/quota.mdx#L24)。

### realtime-media/rtsa/build/project-preparation/enable-service.mdx

- 当前第 4 行：\\|本\\|文\\|介\\|绍\\|如\\|何\\|开\\|通\\|r\\|t\\|s\\|a\\|服\\|务\\|。\\|
- 应显示：媒体流加速。
- 源证据：[docs/rtsa/get-started/enable-service.mdx:11](https://github.com/AgoraIO/shengwang-doc-source/blob/08f70ebd14f548e3b1cb74d1534ca7b579e54f1e/docs/rtsa/get-started/enable-service.mdx#L11)。

### realtime-media/transcoding/build/enable-service.mdx

- 当前第 7 行：\\|本\\|文\\|介\\|绍\\|如\\|何\\|开\\|通\\|c\\|l\\|o\\|u\\|d\\|-\\|t\\|r\\|a\\|n\\|s\\|c\\|o\\|d\\|e\\|r\\|服\\|务\\|。\\|
- 应显示：云端转码。
- 源证据：[docs/cloud-transcoder/get-started/enable-service.mdx:7](https://github.com/AgoraIO/shengwang-doc-source/blob/08f70ebd14f548e3b1cb74d1534ca7b579e54f1e/docs/cloud-transcoder/get-started/enable-service.mdx#L7)。

### realtime-media/transcoding/build/rest-availability.mdx

- 当前第 19 行：\\|如\\|需\\|比\\|故\\|障\\|迁\\|移\\|更\\|高\\|的\\|质\\|量\\|保\\|障\\|，\\|你\\|可\\|以\\|采\\|用\\|多\\|路\\|任\\|务\\|保\\|障\\|策\\|略\\|。\\|每\\|路\\|c\\|l\\|o\\|u\\|d\\|-\\|t\\|r\\|a\\|n\\|s\\|c\\|o\\|d\\|e\\|r\\|任\\|务\\|单\\|独\\|计\\|费\\|，\\|计\\|费\\|方\\|式\\|详\\|见\\|[\\|计\\|费\\|说\\|明\\|]\\|(\\|/\\|z\\|h\\|-\\|C\\|N\\|/\\|r\\|e\\|a\\|l\\|t\\|i\\|m\\|e\\|-\\|m\\|e\\|d\\|i\\|a\\|/\\|t\\|r\\|a\\|n\\|s\\|c\\|o\\|d\\|i\\|n\\|g\\|)\\|。\\|实\\|现\\|步\\|骤\\|如\\|下\\|：\\|
- 应显示：云端转码。
- 源证据：[docs/cloud-transcoder/best-practices/rest-availability.mdx:23](https://github.com/AgoraIO/shengwang-doc-source/blob/08f70ebd14f548e3b1cb74d1534ca7b579e54f1e/docs/cloud-transcoder/best-practices/rest-availability.mdx#L23)。

### realtime-media/transcoding/reference/quota.mdx

- 当前第 61 行：\\|针\\|对\\|每\\|个\\|声\\|网\\|账\\|号\\|，\\|c\\|l\\|o\\|u\\|d\\|-\\|t\\|r\\|a\\|n\\|s\\|c\\|o\\|d\\|e\\|r\\|服\\|务\\|的\\|每\\|秒\\|请\\|求\\|数\\|（\\|Q\\|P\\|S\\|，\\|Q\\|u\\|e\\|r\\|i\\|e\\|s\\| \\|P\\|e\\|r\\| \\|S\\|e\\|c\\|o\\|n\\|d\\|）\\|上\\|限\\|为\\| \\|1\\|0\\| \\|次\\|/\\|秒\\|。\\|超\\|出\\|限\\|制\\|速\\|率\\|时\\|会\\|返\\|回\\|状\\|态\\|码\\| \\|`\\|4\\|2\\|9\\| \\|(\\|T\\|o\\|o\\| \\|M\\|a\\|n\\|y\\| \\|R\\|e\\|q\\|u\\|e\\|s\\|t\\|s\\|)\\|`\\|。\\|
- 应显示：云端转码。
- 源证据：[docs/cloud-transcoder/quota.mdx:71](https://github.com/AgoraIO/shengwang-doc-source/blob/08f70ebd14f548e3b1cb74d1534ca7b579e54f1e/docs/cloud-transcoder/quota.mdx#L71)。

### realtime-media/whiteboard/fastboard-sdk/build/setup-and-access/enable-service.mdx

- 当前第 25 行：\\|为\\|使\\|用\\|w\\|h\\|i\\|t\\|e\\|b\\|o\\|a\\|r\\|d\\|服\\|务\\|创\\|建\\|项\\|目\\|时\\|，\\|项\\|目\\|类\\|型\\|选\\|择\\|*\\|*\\|通\\|用\\|项\\|目\\|*\\|*\\|。\\|
- 应显示：互动白板。
- 源证据：[docs/whiteboard/fastboard-sdk/get-started/enable-service.mdx:19](https://github.com/AgoraIO/shengwang-doc-source/blob/08f70ebd14f548e3b1cb74d1534ca7b579e54f1e/docs/whiteboard/fastboard-sdk/get-started/enable-service.mdx#L19)。

### realtime-media/whiteboard/whiteboard-sdk/build/setup-and-access/enable-service.mdx

- 当前第 25 行：\\|为\\|使\\|用\\|w\\|h\\|i\\|t\\|e\\|b\\|o\\|a\\|r\\|d\\|服\\|务\\|创\\|建\\|项\\|目\\|时\\|，\\|项\\|目\\|类\\|型\\|选\\|择\\|*\\|*\\|通\\|用\\|项\\|目\\|*\\|*\\|。\\|
- 应显示：互动白板。
- 源证据：[docs/whiteboard/fastboard-sdk/get-started/enable-service.mdx:19](https://github.com/AgoraIO/shengwang-doc-source/blob/08f70ebd14f548e3b1cb74d1534ca7b579e54f1e/docs/whiteboard/fastboard-sdk/get-started/enable-service.mdx#L19)。

### solutions/game-voice/build/enable-service.mdx

- 当前第 7 行：\\|本\\|文\\|介\\|绍\\|如\\|何\\|开\\|通\\|g\\|a\\|m\\|e\\|-\\|v\\|o\\|i\\|c\\|e\\|服\\|务\\|。\\|
- 应显示：游戏语音。
- 源证据：[docs/game-voice/get-started/enable-service.mdx:12](https://github.com/AgoraIO/shengwang-doc-source/blob/08f70ebd14f548e3b1cb74d1534ca7b579e54f1e/docs/game-voice/get-started/enable-service.mdx#L12)。

### solutions/game-voice/reference/api.mdx

- 当前第 5 行：\\|本\\|页\\|介\\|绍\\|g\\|a\\|m\\|e\\|-\\|v\\|o\\|i\\|c\\|e\\|中\\|高\\|频\\|调\\|用\\|的\\|实\\|时\\|互\\|动\\| \\|R\\|T\\|C\\| \\|A\\|P\\|I\\|。\\|
- 应显示：游戏语音。
- 源证据：[docs/game-voice/api.mdx:5](https://github.com/AgoraIO/shengwang-doc-source/blob/08f70ebd14f548e3b1cb74d1534ca7b579e54f1e/docs/game-voice/api.mdx#L5)。

### solutions/meta-world/build/enable-service.mdx

- 当前第 5 行：\\|本\\|文\\|介\\|绍\\|如\\|何\\|开\\|通\\|m\\|e\\|t\\|a\\|-\\|w\\|o\\|r\\|l\\|d\\|服\\|务\\|。\\|
- 应显示：MetaWorld。
- 源证据：[docs/meta-world/get-started/enable-service.mdx:14](https://github.com/AgoraIO/shengwang-doc-source/blob/08f70ebd14f548e3b1cb74d1534ca7b579e54f1e/docs/meta-world/get-started/enable-service.mdx#L14)。

### solutions/one-to-one-live/custom-signaling/build/customize-and-extend/audio-scenario.mdx

- 当前第 5 行：\\|o\\|n\\|e\\|-\\|t\\|o\\|-\\|o\\|n\\|e\\|-\\|l\\|i\\|v\\|e\\|中\\|，\\|优\\|质\\|的\\|音\\|频\\|体\\|验\\|至\\|关\\|重\\|要\\|。\\|
- 应显示：1v1 私密房。
- 源证据：[docs/shared/showroom/audio-scenario.mdx:5](https://github.com/AgoraIO/shengwang-doc-source/blob/08f70ebd14f548e3b1cb74d1534ca7b579e54f1e/docs/shared/showroom/audio-scenario.mdx#L5)。

### solutions/one-to-one-live/custom-signaling/build/setup-and-access/enable-service.mdx

- 当前第 7 行：\\|本\\|文\\|介\\|绍\\|如\\|何\\|开\\|通\\|o\\|n\\|e\\|-\\|t\\|o\\|-\\|o\\|n\\|e\\|-\\|l\\|i\\|v\\|e\\|服\\|务\\|。\\|
- 应显示：1v1 私密房。
- 源证据：[docs/one-to-one-live/custom-signaling/get-started/enable-service.mdx:12](https://github.com/AgoraIO/shengwang-doc-source/blob/08f70ebd14f548e3b1cb74d1534ca7b579e54f1e/docs/one-to-one-live/custom-signaling/get-started/enable-service.mdx#L12)。

### solutions/one-to-one-live/rtm/build/customize-and-extend/audio-scenario.mdx

- 当前第 5 行：\\|o\\|n\\|e\\|-\\|t\\|o\\|-\\|o\\|n\\|e\\|-\\|l\\|i\\|v\\|e\\|中\\|，\\|优\\|质\\|的\\|音\\|频\\|体\\|验\\|至\\|关\\|重\\|要\\|。\\|
- 应显示：1v1 私密房。
- 源证据：[docs/shared/showroom/audio-scenario.mdx:5](https://github.com/AgoraIO/shengwang-doc-source/blob/08f70ebd14f548e3b1cb74d1534ca7b579e54f1e/docs/shared/showroom/audio-scenario.mdx#L5)。

### solutions/one-to-one-live/rtm/build/setup-and-access/enable-service.mdx

- 当前第 7 行：\\|本\\|文\\|介\\|绍\\|如\\|何\\|开\\|通\\| \\|o\\|n\\|e\\|-\\|t\\|o\\|-\\|o\\|n\\|e\\|-\\|l\\|i\\|v\\|e\\| \\|服\\|务\\|。\\|
- 应显示：1v1 私密房。
- 源证据：[docs/one-to-one-live/custom-signaling/get-started/enable-service.mdx:12](https://github.com/AgoraIO/shengwang-doc-source/blob/08f70ebd14f548e3b1cb74d1534ca7b579e54f1e/docs/one-to-one-live/custom-signaling/get-started/enable-service.mdx#L12)。

### solutions/online-ktv/ktv-scenario/build/setup-and-access/enable-service.mdx

- 当前第 7 行：\\|本\\|文\\|介\\|绍\\|如\\|何\\|开\\|通\\|o\\|n\\|l\\|i\\|n\\|e\\|-\\|k\\|t\\|v\\|服\\|务\\|。\\|
- 应显示：在线 K 歌房。
- 源证据：[docs/online-ktv/ktv-scenario/get-started/enable-service.mdx:10](https://github.com/AgoraIO/shengwang-doc-source/blob/08f70ebd14f548e3b1cb74d1534ca7b579e54f1e/docs/online-ktv/ktv-scenario/get-started/enable-service.mdx#L10)。

### solutions/online-ktv/online-ktv-sdk/build/setup-and-access/enable-service.mdx

- 当前第 7 行：\\|本\\|文\\|介\\|绍\\|如\\|何\\|开\\|通\\| \\|o\\|n\\|l\\|i\\|n\\|e\\|-\\|k\\|t\\|v\\| \\|服\\|务\\|。\\|
- 应显示：在线 K 歌房。
- 源证据：[docs/online-ktv/ktv-scenario/get-started/enable-service.mdx:10](https://github.com/AgoraIO/shengwang-doc-source/blob/08f70ebd14f548e3b1cb74d1534ca7b579e54f1e/docs/online-ktv/ktv-scenario/get-started/enable-service.mdx#L10)。

### solutions/showroom/build/audio-scenario.mdx

- 当前第 5 行：\\|s\\|h\\|o\\|w\\|r\\|o\\|o\\|m\\|中\\|，\\|优\\|质\\|的\\|音\\|频\\|体\\|验\\|至\\|关\\|重\\|要\\|。\\|
- 应显示：秀场直播。
- 源证据：[docs/shared/showroom/audio-scenario.mdx:5](https://github.com/AgoraIO/shengwang-doc-source/blob/08f70ebd14f548e3b1cb74d1534ca7b579e54f1e/docs/shared/showroom/audio-scenario.mdx#L5)。

### solutions/showroom/build/enable-service.mdx

- 当前第 7 行：\\|本\\|文\\|介\\|绍\\|如\\|何\\|开\\|通\\|s\\|h\\|o\\|w\\|r\\|o\\|o\\|m\\|服\\|务\\|。\\|
- 应显示：秀场直播。
- 源证据：[docs/showroom/get-started/enable-service.mdx:13](https://github.com/AgoraIO/shengwang-doc-source/blob/08f70ebd14f548e3b1cb74d1534ca7b579e54f1e/docs/showroom/get-started/enable-service.mdx#L13)。

### solutions/showroom/reference/api.mdx

- 当前第 5 行：\\|本\\|页\\|介\\|绍\\|s\\|h\\|o\\|w\\|r\\|o\\|o\\|m\\|中\\|高\\|频\\|调\\|用\\|的\\|实\\|时\\|互\\|动\\| \\|R\\|T\\|C\\| \\|A\\|P\\|I\\|。\\|
- 应显示：秀场直播。
- 源证据：[docs/showroom/api.mdx:5](https://github.com/AgoraIO/shengwang-doc-source/blob/08f70ebd14f548e3b1cb74d1534ca7b579e54f1e/docs/showroom/api.mdx#L5)。

### solutions/smart-camera/build/amazon-alexa.mdx

- 当前第 7 行：\\|你\\|可\\|以\\|通\\|过\\|这\\|种\\|方\\|式\\|为\\|s\\|m\\|a\\|r\\|t\\|-\\|c\\|a\\|m\\|e\\|r\\|a\\|场\\|景\\|增\\|加\\|智\\|能\\|设\\|备\\|。\\|
- 应显示：智能摄像头。
- 源证据：[shared/smart-camera/amazon-alexa.mdx:1](https://github.com/AgoraIO/shengwang-doc-source/blob/08f70ebd14f548e3b1cb74d1534ca7b579e54f1e/shared/smart-camera/amazon-alexa.mdx#L1)。

### solutions/smart-camera/build/enable-service.mdx

- 当前第 7 行：\\|本\\|文\\|介\\|绍\\|如\\|何\\|开\\|通\\|s\\|m\\|a\\|r\\|t\\|-\\|c\\|a\\|m\\|e\\|r\\|a\\|服\\|务\\|。\\|
- 应显示：智能摄像头。
- 源证据：[docs/smart-camera/get-started/enable-service.mdx:10](https://github.com/AgoraIO/shengwang-doc-source/blob/08f70ebd14f548e3b1cb74d1534ca7b579e54f1e/docs/smart-camera/get-started/enable-service.mdx#L10)。

### solutions/smart-camera/build/google-assistant.mdx

- 当前第 7 行：\\|你\\|可\\|以\\|通\\|过\\|这\\|种\\|方\\|式\\|为\\|s\\|m\\|a\\|r\\|t\\|-\\|c\\|a\\|m\\|e\\|r\\|a\\|场\\|景\\|增\\|加\\|智\\|能\\|设\\|备\\|。\\|
- 应显示：智能摄像头。
- 源证据：[shared/smart-camera/amazon-alexa.mdx:1](https://github.com/AgoraIO/shengwang-doc-source/blob/08f70ebd14f548e3b1cb74d1534ca7b579e54f1e/shared/smart-camera/amazon-alexa.mdx#L1)。

### solutions/smart-camera/get-started/quick-start.mdx

- 当前第 7 行：\\|本\\|文\\|介\\|绍\\|s\\|m\\|a\\|r\\|t\\|-\\|c\\|a\\|m\\|e\\|r\\|a\\|场\\|景\\|的\\|构\\|建\\|流\\|程\\|。\\|
- 应显示：智能摄像头。
- 源证据：[shared/smart-camera/quick-start.mdx:1](https://github.com/AgoraIO/shengwang-doc-source/blob/08f70ebd14f548e3b1cb74d1534ca7b579e54f1e/shared/smart-camera/quick-start.mdx#L1)。

### solutions/smart-camera/reference/advanced-feature.mdx

- 当前第 5 行：\\|本\\|文\\|介\\|绍\\|如\\|何\\|实\\|现\\|s\\|m\\|a\\|r\\|t\\|-\\|c\\|a\\|m\\|e\\|r\\|a\\|场\\|景\\|的\\|进\\|阶\\|功\\|能\\|：\\|
- 应显示：智能摄像头。
- 源证据：[shared/smart-camera/advanced-feature.mdx:1](https://github.com/AgoraIO/shengwang-doc-source/blob/08f70ebd14f548e3b1cb74d1534ca7b579e54f1e/shared/smart-camera/advanced-feature.mdx#L1)。

### solutions/smart-doorbell/build/amazon-alexa.mdx

- 当前第 7 行：\\|你\\|可\\|以\\|通\\|过\\|这\\|种\\|方\\|式\\|为\\|s\\|m\\|a\\|r\\|t\\|-\\|d\\|o\\|o\\|r\\|b\\|e\\|l\\|l\\|场\\|景\\|增\\|加\\|智\\|能\\|设\\|备\\|。\\|
- 应显示：智能门铃。
- 源证据：[shared/smart-camera/amazon-alexa.mdx:1](https://github.com/AgoraIO/shengwang-doc-source/blob/08f70ebd14f548e3b1cb74d1534ca7b579e54f1e/shared/smart-camera/amazon-alexa.mdx#L1)。

### solutions/smart-doorbell/build/google-assistant.mdx

- 当前第 7 行：\\|你\\|可\\|以\\|通\\|过\\|这\\|种\\|方\\|式\\|为\\|s\\|m\\|a\\|r\\|t\\|-\\|d\\|o\\|o\\|r\\|b\\|e\\|l\\|l\\|场\\|景\\|增\\|加\\|智\\|能\\|设\\|备\\|。\\|
- 应显示：智能门铃。
- 源证据：[shared/smart-camera/amazon-alexa.mdx:1](https://github.com/AgoraIO/shengwang-doc-source/blob/08f70ebd14f548e3b1cb74d1534ca7b579e54f1e/shared/smart-camera/amazon-alexa.mdx#L1)。

### solutions/smart-doorbell/build/quick-start.mdx

- 当前第 7 行：\\|本\\|文\\|介\\|绍\\|s\\|m\\|a\\|r\\|t\\|-\\|d\\|o\\|o\\|r\\|b\\|e\\|l\\|l\\|场\\|景\\|的\\|构\\|建\\|流\\|程\\|。\\|
- 应显示：智能门铃。
- 源证据：[shared/smart-camera/quick-start.mdx:1](https://github.com/AgoraIO/shengwang-doc-source/blob/08f70ebd14f548e3b1cb74d1534ca7b579e54f1e/shared/smart-camera/quick-start.mdx#L1)。

### solutions/smart-doorbell/build/setup-and-access/enable-service.mdx

- 当前第 7 行：\\|本\\|文\\|介\\|绍\\|如\\|何\\|开\\|通\\|s\\|m\\|a\\|r\\|t\\|-\\|d\\|o\\|o\\|r\\|b\\|e\\|l\\|l\\|服\\|务\\|。\\|
- 应显示：智能门铃。
- 源证据：[docs/smart-doorbell/enable-service.mdx:10](https://github.com/AgoraIO/shengwang-doc-source/blob/08f70ebd14f548e3b1cb74d1534ca7b579e54f1e/docs/smart-doorbell/enable-service.mdx#L10)。

### solutions/smart-doorbell/reference/advanced-feature.mdx

- 当前第 5 行：\\|本\\|文\\|介\\|绍\\|如\\|何\\|实\\|现\\|s\\|m\\|a\\|r\\|t\\|-\\|d\\|o\\|o\\|r\\|b\\|e\\|l\\|l\\|场\\|景\\|的\\|进\\|阶\\|功\\|能\\|：\\|
- 应显示：智能门铃。
- 源证据：[shared/smart-camera/advanced-feature.mdx:1](https://github.com/AgoraIO/shengwang-doc-source/blob/08f70ebd14f548e3b1cb74d1534ca7b579e54f1e/shared/smart-camera/advanced-feature.mdx#L1)。

### solutions/smart-watch/build/setup-and-access/enable-service.mdx

- 当前第 7 行：\\|本\\|文\\|介\\|绍\\|如\\|何\\|开\\|通\\|s\\|m\\|a\\|r\\|t\\|-\\|w\\|a\\|t\\|c\\|h\\|服\\|务\\|。\\|
- 应显示：智能手表。
- 源证据：[docs/smart-watch/get-started/enable-service.mdx:10](https://github.com/AgoraIO/shengwang-doc-source/blob/08f70ebd14f548e3b1cb74d1534ca7b579e54f1e/docs/smart-watch/get-started/enable-service.mdx#L10)。

### solutions/voip-call/build/enable-service.mdx

- 当前第 25 行：\\|为\\|使\\|用\\|v\\|o\\|i\\|p\\|-\\|c\\|a\\|l\\|l\\|k\\|i\\|t\\|服\\|务\\|创\\|建\\|项\\|目\\|时\\|，\\|项\\|目\\|类\\|型\\|选\\|择\\|*\\|*\\|通\\|用\\|项\\|目\\|*\\|*\\|。\\|
- 应显示：微呼叫。
- 源证据：[docs/voip-callkit/get-started/enable-service.mdx:22](https://github.com/AgoraIO/shengwang-doc-source/blob/08f70ebd14f548e3b1cb74d1534ca7b579e54f1e/docs/voip-callkit/get-started/enable-service.mdx#L22)。


## 统一修复评估

可以统一修复，建议按已确认 65 篇组织为一次有边界的变更，分为正文修正、描述修正和迁移防回归三个部分：

1. **正文：**按上述 55 篇、98 处问题行定点替换为源配置的显示名称，保留已有中文标题和其他内容。按中文名称恢复自然空格，不调整 API 参数或示例。
2. **描述：**仅修正 RTMP 网关 14 篇的 description，不顺带重写描述文案。
3. **迁移：**从权威产品元数据建立完整显示名称映射，并让迁移和审计共享一致的解析规则；允许调用方显式传入权威名称。无法解析的显示名称应报错或列为需处理项，不能静默回退为内部标识。
4. **审计：**期望值必须取自独立的源产品配置，不能继续依赖同一个错误兜底表。覆盖直接正文变量与共享组件 props 两条路径。
5. **不重跑整批历史迁移：**现有文档已经过 IA 和人工润色，整页重新生成会覆盖无关变更；本次应定点修正文案。
6. **不可改动：**文件路径、路由、重定向、链接目标、图片地址、图标 key、代码示例、API 方法名/参数、生成 API 内容及历史审计快照。
7. **待确认项：**9 篇在线音乐教学/在线美术教学文档的命名差异独立决策，不影响先处理已确认 65 篇。

### 建议验收

- 上述 55 篇的 98 处问题行均恢复正确显示名称；再次扫描无已确认的内部标识正文残留。
- RTMP 网关上述 14 篇的描述不再出现“实时消息 RTM”。
- 迁移测试覆盖这 25 个产品/场景、直接变量、共享 props、未知名称处理；源配置与输出逐一核对。
- 对修改前后的链接、图片 URL、代码块和行内代码做结构化比对，确保不变。
- 运行相关迁移/审计测试、`bun run test` 和 `bun run types:check`。
- 浏览器抽查最初四篇开通文档及智能设备共享模板页面，确认产品名称和控制台操作步骤正确。

以上为修复前批准的评估与验收方案，实际执行结果见文首“实施结果与验证”。盘点辅助脚本位于本地忽略目录 `.agent/artifacts/product-label-inventory.mjs`，可运行 `node .agent/artifacts/product-label-inventory.mjs report` 复核剩余问题。
