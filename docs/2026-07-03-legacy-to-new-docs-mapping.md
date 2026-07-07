# 旧站到新站文档映射表

来源讨论记录：`docs/superpowers/reports/2026-07-03-legacy-docs-mapping-discussion.md`

## 范围

这份表是第一版迁移映射表，按已确认的“可落地范围优先”策略整理：

- 面向中文站 `content/docs/zh-CN`。
- 优先覆盖当前新站已有栏目能明确承接的旧站内容。
- `best-practices` 不作为本次目标结构。
- API reference、HTML API、OpenAPI、shared 片段、资产迁移作为独立泳道处理。
- 本表只定义旧到新的目标位置和处理规则，不开始内容迁移。

## 状态说明

| 状态 | 含义 |
| --- | --- |
| `mapped` | 已有明确目标，可进入后续文件级迁移规划 |
| `needs-decision` | 语义基本明确，但路径、归属或拆分方式仍需人工确认 |
| `defer` | 本轮不迁移或等待后续独立规则 |
| `ignore` | 不作为正式内容迁移 |
| `ignore-empty` | 空文件或无有效内容，不迁移 |
| `fallback-default/defer` | 旧站默认稿存在，但同级已有正式平台稿，本轮不生成正式页面 |
| `defer-en` | 英文稿，当前 `zh-CN` 迁移不处理 |

## 普通文档目录映射

旧源根目录：`/Users/yejiayi/Documents/shengwang-doc-source/docs`

目标根目录：`content/docs/zh-CN`

| 旧站目录 | 旧站名称 | 新站目标根路径 | 状态 | 备注 |
| --- | --- | --- | --- | --- |
| `convoai` | 对话式 AI 引擎 | `ai` | `mapped` | 站内 ConvoAI 新 IA 已删除；按旧站路径迁入 `ai` 下，例如 `docs/convoai/user-guides/**` -> `content/docs/zh-CN/ai/user-guides/**` |
| `toybox` | 对话式 AI 开发套件 | `ai/device-kit` | `mapped` | 旧站 `run-r1` 与 Device Kit 占位匹配 |
| `aigc` | AIGC | `ai/aigc` | `mapped` | 已确认并入 AI |
| `rtc` | 实时互动 | `realtime-media/rtc` | `mapped` | 实时媒体核心能力 |
| `rtm2` | 实时消息 | `realtime-media/rtm` | `mapped` | 旧 `rtm2` 映射到新 `rtm` |
| `fusion-cdn` | 融合 CDN 直播 | `realtime-media/fusion-cdn` | `mapped` | 新站已有占位 |
| `rtsa` | 媒体流加速 | `realtime-media/rtsa` | `mapped` | 新站已有占位 |
| `whiteboard` | 互动白板 | `realtime-media/whiteboard` | `mapped` | 新站已有占位 |
| `speech-to-text` | 实时转录翻译 | `realtime-media/speech-to-text` | `mapped` | 新站已有占位 |
| `cloud-recording` | 云端录制 | `realtime-media/recording/cloud-recording` | `mapped` | 已确认与本地服务端录制在 `recording` 下平级 |
| `recording` | 本地服务端录制 | `realtime-media/recording/local-server-recording` | `mapped` | 已确认与云端录制在 `recording` 下平级 |
| `media-push` | 旁路推流 | `realtime-media/media-push` | `mapped` | 新站已有占位 |
| `media-pull` | 输入在线媒体流 | `realtime-media/media-pull` | `mapped` | 新站已有占位 |
| `cloud-transcoder` | 云端转码 | `realtime-media/transcoding` | `mapped` | 已确认压平到 `transcoding`，不保留 `cloud-transcoding` 二级目录 |
| `rtmp-gateway` | RTMP 网关 | `realtime-media/rtmp-gateway` | `mapped` | 新站已有占位 |
| `rtc-server-sdk` | RTC 服务端 SDK | `realtime-media/rtc-server-sdk` | `mapped` | 服务端实时媒体能力 |
| `sdk-extension` | SDK 拓展插件 | `realtime-media/sdk-extensions` | `mapped` | 旧单数映射到新复数 |
| `marketplace` | 云市场 | `realtime-media/marketplace` | `mapped` | 新站已有占位 |
| `online-ktv` | 在线 K 歌房 | `realtime-media/online-ktv` | `mapped` | 已确认不放 `solutions` |
| `danmaku` | 弹幕/互动相关 | `realtime-media/danmaku` | `mapped` | 旧入口未启用，但已确认仍需迁移 |
| `voip-callkit` | 微呼叫 | `solutions/voip-call` | `mapped` | 普通文档进 solutions |
| `flexible-classroom` | 灵动课堂 | `solutions/flexible-classroom` | `mapped` | 新站已有占位 |
| `meeting` | 灵动会议 | `solutions/meeting` | `mapped` | 新站已有占位 |
| `showroom` | 秀场直播 | `solutions/showroom` | `mapped` | 新站已有占位 |
| `one-to-one-live` | 1v1 私密房 | `solutions/one-to-one-live` | `mapped` | 已确认新增入口 |
| `chatroom` | 声动语聊 | `solutions/chatroom` | `mapped` | 已确认新增入口 |
| `game-voice` | 游戏语音 | `solutions/game-voice` | `mapped` | 新站已有占位 |
| `one-to-one-classroom` | 一对一互动教学 | `solutions/one-to-one-classroom` | `mapped` | 新站已有占位 |
| `small-classroom` | 一对 N 小班课 | `solutions/small-classroom` | `mapped` | 新站已有占位 |
| `breakout-classroom` | 超级小班课 | `solutions/breakout-classroom` | `mapped` | 新站已有占位 |
| `art-class` | 在线美术教学 | `solutions/art-class` | `mapped` | 新站已有占位 |
| `online-music-class` | 在线音乐教学 | `solutions/online-music-class` | `mapped` | 新站已有占位 |
| `digital-learning` | 教育信息化 | `solutions/digital-learning` | `mapped` | 已确认需要迁移 |
| `smart-doorbell` | 智能门铃 | `solutions/smart-doorbell` | `mapped` | 新站已有占位 |
| `smart-watch` | 智能手表 | `solutions/smart-watch` | `mapped` | 新站已有占位 |
| `smart-camera` | 智能摄像头 | `solutions/smart-camera` | `mapped` | 新站已有占位 |
| `teleoperation` | 平行操控 | `solutions/teleoperation` | `mapped` | 新站已有占位 |
| `iot-apaas` | 灵隼物联网云平台 | `solutions/iot-apaas` | `mapped` | 旧入口注释，但已确认仍需迁移 |
| `meta-world` | MetaWorld | `solutions/meta-world` | `mapped` | 旧入口注释，但已确认仍需迁移 |
| `status-page` | Status Page | `solutions/status-page` | `mapped` | 已确认放入 solutions |
| `console` | 控制台 | `introduction` | `mapped` | 普通文档按平台基础信息拆入 introduction；API 另进 `api-reference/console` |
| `analytics` | 水晶球 | `introduction/usage-analytics` | `mapped` | API 另进 `api-reference/analytics` |
| `conversion-ppt` | PPT 转码服务 | `solutions/ppt-transcoding` | `mapped` | API 另进 `api-reference/ppt-conversion-service` |
| `terms` | 条款 | `introduction/terms` | `mapped` | 已确认纳入新站文档 |
| `multi-usecase` | 多场景/方案 | `solutions/multi-usecase` | `mapped` | 已确认迁移到 solutions 下 |
| `agora-product` | 声网范文 | 不迁移 | `ignore` | 示例目录 |
| `dummy-product` | Dummy | 不迁移 | `ignore` | Dummy/测试目录一律不迁移，包括正文、API、OpenAPI、HTML API、shared 和元数据 |
| `shared` | 共享片段 | `shared-lane` | `defer` | 作为迁移依赖展开到引用处，不作为直接页面 |

## API Reference 目录映射

旧源根目录：`/Users/yejiayi/Documents/shengwang-doc-source/docs-api-reference`

目标根目录：`content/docs/zh-CN/api-reference`

| 旧 API 目录 | 旧站名称 | 新站目标根路径 | 状态 | 备注 |
| --- | --- | --- | --- | --- |
| `convoai` | 对话式 AI 引擎 | `api-reference/conversational-ai` | `mapped` | ConvoAI SDK/API 客户端类文档归入 `api-reference/conversational-ai/client-toolkit` |
| `aigc` | AIGC | `api-reference/conversational-ai/aigc` | `mapped` | 已确认归入 conversational-ai 大类并保留 `aigc` 子路径 |
| `rtc` | 实时互动 | `api-reference/rtc` | `mapped` | 新站已有对应 API 分类 |
| `rtm2` | 实时消息 | `api-reference/rtm` | `mapped` | 旧 `rtm2` 映射到新 `rtm` |
| `rtsa` | 媒体流加速 | `api-reference/rtsa` | `mapped` | 新站已有对应 API 分类 |
| `whiteboard` | 互动白板 | `api-reference/whiteboard` | `mapped` | 新站已有对应 API 分类 |
| `fastboard` | 互动白板 Fastboard | `api-reference/whiteboard/fastboard` | `mapped` | 旧站 alias 为 `whiteboard`，目标作为 whiteboard 子类 |
| `recording` | 本地服务端录制 | `api-reference/local-server-recording` | `mapped` | 新站已有对应 API 分类 |
| `cloud-recording` | 云端录制 | `api-reference/cloud-recording` | `mapped` | 新站已有对应 API 分类 |
| `rtc-server-sdk` | RTC 服务端 SDK | `api-reference/rtc-server-sdk` | `mapped` | 新站已有对应 API 分类 |
| `flexible-classroom` | 灵动课堂 | `api-reference/flexible-classroom` | `mapped` | 讨论记录已列入 API 产品目录映射 |
| `meeting` | 灵动会议 | `api-reference/meeting` | `mapped` | 新站已有对应 API 分类 |
| `iot-apaas` | 灵隼物联网云平台 | `api-reference/iot-apaas` | `mapped` | 讨论记录已列入 API 产品目录映射 |
| `one-to-one-live` | 1v1 私密房 | `api-reference/private-room` | `mapped` | 旧场景 API 归入 private-room |
| `agora-chat` | Agora Chat/IM | `api-reference/im` | `mapped` | 新站已有 `im` API 分类 |
| `agora-product` | 声网范文 | 不迁移 | `ignore` | 示例 |
| `dummy-product` | Dummy | 不迁移 | `ignore` | Dummy/测试目录一律不迁移 |
| `shared` | 共享片段 | `shared-lane` | `defer` | 作为依赖处理，不作为直接页面 |

## 普通文档路径转换规则

这些规则适用于 `docs/**` 中状态为 `mapped` 的普通文档。

| 旧路径模式 | 新路径模式 | 状态 | 备注 |
| --- | --- | --- | --- |
| `docs/<product>/landing-page.mdx` | `content/docs/zh-CN/<mapped-root>/index.md` | `mapped` | 产品/场景目录首页 |
| `docs/<product>/<subdir>/landing-page.mdx` | `content/docs/zh-CN/<mapped-root>/<subdir>/index.md` | `mapped` | 子目录首页 |
| `docs/<product>/landing-page.<platform>.mdx` | `content/docs/zh-CN/<mapped-root>/index.<platform>.md` | `mapped` | 多平台后缀按一平台一文件拆分 |
| `docs/<product>/_homepage_.mdx` | 不迁移 | `ignore` | 多数是旧站产品门户页/视觉首页，不覆盖新站 `index.md` |
| `docs/<product>/<path>/<file>.mdx` | `content/docs/zh-CN/<mapped-root>/<path>/<file>.mdx` | `mapped` | 保留原目录层级和普通文件名 |
| `docs/<product>/<path>/<file>.<platform>.mdx` | `content/docs/zh-CN/<mapped-root>/<path>/<file>.<platform>.mdx` | `mapped` | 平台信息保留在文件名后缀，不上提为平台目录 |
| `docs/<product>/<path>/<file>.<platform-a>.<platform-b>.mdx` | `content/docs/zh-CN/<mapped-root>/<path>/<file>.<platform-a>.mdx` 和 `.../<file>.<platform-b>.mdx` | `mapped` | 多平台后缀拆为多个目标文件 |
| `docs/shared/**`、`shared/**`、`@doc-shared` 引用 | 展开到引用它的目标页面 | `defer` | 不保留 `shared` 或 `shared/import` 作为新站内容结构 |

### 普通文档转换示例

| 旧路径 | 新路径 |
| --- | --- |
| `docs/rtc/landing-page.mdx` | `content/docs/zh-CN/realtime-media/rtc/index.md` |
| `docs/rtc/landing-page.javascript.mdx` | `content/docs/zh-CN/realtime-media/rtc/index.javascript.md` |
| `docs/rtc-server-sdk/landing-page.python.go.mdx` | Python 入口收敛到 `content/docs/zh-CN/realtime-media/rtc-server-sdk/index.mdx`，Go 保留 `content/docs/zh-CN/realtime-media/rtc-server-sdk/index.go.md` |
| `docs/chatroom/sdk/landing-page.mdx` | `content/docs/zh-CN/solutions/chatroom/sdk/index.md` |
| `docs/online-ktv/auikaraoke/landing-page.mdx` | `content/docs/zh-CN/realtime-media/online-ktv/auikaraoke/index.md` |
| `docs/rtc/basic-features/audio-profile.android.mdx` | `content/docs/zh-CN/realtime-media/rtc/basic-features/audio-profile.android.mdx` |
| `docs/rtc/basic-features/audio-profile.ios.macos.mdx` | `content/docs/zh-CN/realtime-media/rtc/basic-features/audio-profile.ios.mdx` 和 `content/docs/zh-CN/realtime-media/rtc/basic-features/audio-profile.macos.mdx` |

## API Reference 路径转换规则

这些规则适用于 `docs-api-reference/**`。

| 旧路径模式 | 新路径模式 | 状态 | 备注 |
| --- | --- | --- | --- |
| `docs-api-reference/<api-product>/<path>/<file>.mdx` | `content/docs/zh-CN/<mapped-api-root>/<path>/<file>.mdx` | `mapped` | API reference 是独立泳道，不套普通文档规则 |
| `docs-api-reference/<api-product>/<path>/<file>.<platform>.mdx` | `content/docs/zh-CN/<mapped-api-root>/<path>/<file>.<platform>.mdx` | `mapped` | 平台后缀保留在文件名里，不上提为平台目录 |
| `docs-api-reference/<api-product>/<path>/<file>.<platform-a>.<platform-b>.mdx` | `content/docs/zh-CN/<mapped-api-root>/<path>/<file>.<platform-a>.mdx` 和 `.../<file>.<platform-b>.mdx` | `mapped` | 多平台后缀按一平台一文件拆分 |
| `docs-api-reference/convoai/go-api/**` | `content/docs/zh-CN/api-reference/conversational-ai/client-toolkit/**` | `mapped` | ConvoAI 客户端工具链 |
| `docs-api-reference/convoai/java-api/**` | `content/docs/zh-CN/api-reference/conversational-ai/client-toolkit/**` | `mapped` | ConvoAI 客户端工具链 |
| `docs-api-reference/convoai/web-component/**` | `content/docs/zh-CN/api-reference/conversational-ai/client-toolkit/**` | `mapped` | ConvoAI 客户端工具链 |
| `docs-api-reference/convoai/android-component/**` | `content/docs/zh-CN/api-reference/conversational-ai/client-toolkit/**` | `mapped` | ConvoAI 客户端工具链 |
| `docs-api-reference/convoai/ios-component/**` | `content/docs/zh-CN/api-reference/conversational-ai/client-toolkit/**` | `mapped` | ConvoAI 客户端工具链 |
| `docs-api-reference/convoai/agent-sdk-api/**` | `content/docs/zh-CN/api-reference/conversational-ai/client-toolkit/**` | `mapped` | `agent-go`、`agent-python`、`agent-typescript` 作为独立后缀保留 |

### API Reference 转换示例

| 旧路径 | 新路径 |
| --- | --- |
| `docs-api-reference/convoai/go-api/client.go.mdx` | `content/docs/zh-CN/api-reference/conversational-ai/client-toolkit/client.go.mdx` |
| `docs-api-reference/aigc/aigcservice.android.mdx` | `content/docs/zh-CN/api-reference/conversational-ai/aigc/aigcservice.android.mdx` |
| `docs-api-reference/flexible-classroom/classroom-sdk.javascript.electron.mdx` | `content/docs/zh-CN/api-reference/flexible-classroom/classroom-sdk.javascript.mdx` 和 `content/docs/zh-CN/api-reference/flexible-classroom/classroom-sdk.electron.mdx` |
| `docs-api-reference/convoai/agent-sdk-api/overview.agent-go.mdx` | `content/docs/zh-CN/api-reference/conversational-ai/client-toolkit/overview.agent-go.mdx` |

## 特殊文件处理规则

| 旧文件或模式 | 新目标/状态 | 状态 | 备注 |
| --- | --- | --- | --- |
| `docs/flexible-classroom/_resources.mdx` | `fallback-default/defer` | `fallback-default/defer` | 同级已有 `resources.android.mdx`、`resources.ios.mdx`、`resources.javascript.mdx`、`resources.electron.mdx` |
| `docs/iot-apaas/_resources.mdx` | `content/docs/zh-CN/solutions/iot-apaas/resources.mdx` | `mapped` | 同级无平台资源页 |
| `docs/meeting/_resources.mdx` | `content/docs/zh-CN/solutions/meeting/resources.mdx` | `mapped` | 同级无平台资源页 |
| `docs/rtm2/_resources.mdx` | `content/docs/zh-CN/realtime-media/rtm/resources.mdx` | `mapped` | 同级无平台资源页 |
| `docs/toybox/_resources.mdx` | `content/docs/zh-CN/ai/device-kit/resources.mdx` | `mapped` | 同级无平台资源页 |
| `docs/rtc/api/_reference.mdx` | 不迁移 | `ignore-empty` | 空文件 |
| `docs/rtc/basic-features/_token-authentication.mdx` | `fallback-default/defer` | `fallback-default/defer` | 同级已有 10 个平台正式稿 |
| `docs/**/_release-notes-en*.mdx`、`docs/**/*-en*.mdx` | 暂不迁移 | `defer-en` | 当前 `zh-CN` 迁移默认不处理英文稿 |
| `docs/cloud-recording/_example/_*.mdx` | 不迁移 | `ignore` | 示例片段不作为正式页面 |
| `docs/marketplace/integrate-extensions/legacy/_*.mdx` | 不迁移 | `ignore` | 旧版扩展详情页不迁入 marketplace |
| `**/dummy-product/**`、`**/dummy*.mdx`、`**/dummy*.md` | 不迁移 | `ignore` | Dummy/测试内容一律不用，不生成目标文件或 redirect |
| 产品目录内其他 `_run-example`、`_demo`、`_billing` 等隐藏/片段页 | 不迁移 | `ignore` | 除已列明特殊规则外，不生成正式页面 |

## 独立泳道和后续规则

| 旧源 | 新目标 | 状态 | 备注 |
| --- | --- | --- | --- |
| `/Users/yejiayi/Documents/shengwang-doc-source/html-docs/**/*.yaml`、`/**/*.yml` | `content/openapi/<canonical-api-product>/<api-surface>.<locale>.yaml` | `mapped` | OpenAPI 源文件放入新站维护目录；产品名使用新站 canonical API 产品 ID，中文旧站源使用 `.zh-CN.yaml`，英文源使用 `.en.yaml`；后续构建再同步到 `public/openapi` |
| `/Users/yejiayi/Documents/shengwang-doc-source/html-docs/<product>/<platform-or-language>/**/*.html` | 暂不映射 | `defer` | SDK HTML API 映射先暂时不处理；已确认后续保留 `.html` 文件类型 |
| `/Users/yejiayi/Documents/shengwang-doc-source/html-docs/<product>/<platform-or-language>/**` SDK HTML 资产 | 暂不映射 | `defer` | 依赖资源随 SDK HTML API 后续统一处理 |
| `/Users/yejiayi/Documents/shengwang-doc-source/shared/**` | 展开到引用页面 | `defer` | 不作为直接页面；迁移时解析引用并内联 |
| `/Users/yejiayi/Documents/shengwang-doc-source/docs/shared/**` | 展开到引用页面 | `defer` | 不作为直接页面；迁移时解析引用并内联 |
| `/Users/yejiayi/Documents/shengwang-doc-source/docs/**/*_sidebar*.meta*.js`、`**/_platforms_.meta.js`、`**/_products_.meta.js` | 迁移清单元数据 | `mapped` | 不生成页面，但必须进入 CSV，确认这类旧站元数据文件需要迁移 |
| `/Users/yejiayi/Documents/shengwang-doc-source/docs-api-reference/**/*_sidebar*.meta*.js`、`**/_platforms_.meta.js`、`**/_products_.meta.js` | 迁移清单元数据 | `mapped` | 不生成页面，但必须进入 CSV，确认这类 API reference 元数据文件需要迁移 |
| 旧站图片与静态资源 | 不迁移 | `ignore` | 已确认不迁移图片；内容迁移时按页面需要改链、移除或替换引用，不单独建立资源迁移映射 |
| 旧 URL `/doc/...`、`/api-ref/...` | `docs/superpowers/reports/2026-07-03-legacy-file-redirects.csv` | `mapped` | 已确认需要文件级 redirect；由文件级映射派生旧 URL -> 新 URL |

## 文件级 Redirect 规则

需要生成机器可读的文件级迁移清单和 redirect 表，建议输出到 `docs/superpowers/reports/2026-07-03-legacy-file-redirects.csv`。

| 字段 | 说明 |
| --- | --- |
| `old_source_path` | 旧站源文件路径，例如 `docs/rtc/landing-page.mdx` |
| `old_url` | 旧站公开 URL，例如 `/doc/rtc/...` 或 `/api-ref/...` |
| `source_type` | `docs`、`docs-api-reference`、`openapi`、`html-api`、`shared`、`metadata`、`asset`；`asset` 默认不迁移 |
| `old_product` | 旧站产品/场景目录 |
| `old_platform` | 从文件名或旧路由解析的平台；无平台时为空 |
| `new_source_path` | 新站目标源文件路径；`ignore`、`defer` 时为空 |
| `new_url` | 新站公开 URL；`ignore`、`defer` 时为空 |
| `redirect_status` | `redirect`、`no-redirect`、`defer`、`ignore` |
| `http_status` | 默认 `301`；临时或待确认项为空 |
| `notes` | 平台拆分、shared 展开、英文稿 defer、隐藏页 ignore 等说明 |

生成规则：

- `mapped` 的普通文档和 API reference 页面必须生成一行或多行 redirect。
- 旧站 `.meta.js` 元数据文件必须进入 CSV，`source_type=metadata`，`redirect_status=no-redirect`，但不生成页面。
- 旧站产品元数据中被注释、未启用的产品目录，应在对应页面 `notes` 标明旧入口未启用。
- 多平台源文件拆成多个目标文件时，每个目标文件各生成一行 redirect。
- `landing-page.mdx`、子目录 `landing-page.mdx`、`landing-page.<platform>.mdx` 按本表首页规则生成新 URL。
- `_homepage_.mdx`、空文件、隐藏片段、示例片段等 `ignore` 项进入表，但 `new_url` 为空，`redirect_status` 为 `ignore`。
- API reference MDX 按 API reference 路径规则生成新 URL。
- OpenAPI YAML/YML 不直接生成页面 redirect；如旧站已有 RESTful API 公开页面，由 OpenAPI 渲染后的页面路径另行生成 redirect。
- SDK HTML API 当前 `defer`，暂不生成正式 redirect，只记录为 `defer`。
- shared 片段不生成 redirect；引用它的正式页面各自生成 redirect。

## 待确认项

| 主题 | 当前建议 | 需要确认的问题 |
| --- | --- | --- |
| SDK HTML API / Doxygen | 暂不映射；后续保留 `.html` 文件类型 | 后续再确定具体目标目录、导航入口和 redirect |
