# 历史中文 hotfix 新增文档的 301 清单

核查日期：2026-11-18。按用户要求，仅整理清单，没有修改重定向配置或发布任何规则。 本文保留清单阶段的快照；用户随后授权实施，结果见[301 实施记录](./2026-11-18-hotfix-new-doc-redirect-implementation.md)。

结论：找到 **703 个待补 301 的旧 URL**，对应 **422 个不同的新站目标**。其中指南/平台入口/共享副本 340 个 URL、59 个目标，API 参考 363 个 URL、363 个目标。URL 数量包含平台展开和共享副本，不等于新写了 703 篇文档。

交付文件：

- [待补 301 明细（703 行）](./2026-11-18-hotfix-new-doc-redirect-audit-missing-301.csv)：每行包含文档名、旧 URL、新 URL、平台、源/目标 PR、源文件与说明。
- [完整核查清单（798 行）](./2026-11-18-hotfix-new-doc-redirect-audit.csv)：同时保留已有覆盖、待合入、隐藏页面、未迁移空页及退役排除项。

## 按历史同步批次归类

| 源站 PR | 新站落点 PR | 文档/入口 | 待补旧 URL | 不同目标数 |
| --- | --- | --- | --- | --- |
| [#2111](https://github.com/AgoraIO/shengwang-doc-source/pull/2111) | [#1291](https://github.com/AgoraIO/docs-portal/pull/1291) | RTC 鸿蒙 4.6.3：3 篇指南的平台版本、9 个 API 入口 | 12 | 12 |
| [#2121](https://github.com/AgoraIO/shengwang-doc-source/pull/2121) | [#1338](https://github.com/AgoraIO/docs-portal/pull/1338) | 白板 / Fastboard 新功能指南及鸿蒙继承入口 | 110 | 51 |
| [#2121](https://github.com/AgoraIO/shengwang-doc-source/pull/2121) | [#1338](https://github.com/AgoraIO/docs-portal/pull/1338) | 白板 Android / iOS / Web / HarmonyOS 新 API 页面 | 352 | 352 |
| [#2132](https://github.com/AgoraIO/shengwang-doc-source/pull/2132) | [#1407](https://github.com/AgoraIO/docs-portal/pull/1407) | Linux Server C++ 视频 Metadata 指南、IMetadataObserver 与 Metadata | 3 | 3 |
| [#2133](https://github.com/AgoraIO/shengwang-doc-source/pull/2133) | [#1175](https://github.com/AgoraIO/docs-portal/pull/1175) / [#1407](https://github.com/AgoraIO/docs-portal/pull/1407) | AI 快速接入 / CLI 在各产品、各平台的旧站副本 | 224 | 2 |
| [#2146](https://github.com/AgoraIO/shengwang-doc-source/pull/2146) | [#1398](https://github.com/AgoraIO/docs-portal/pull/1398) / [#1406](https://github.com/AgoraIO/docs-portal/pull/1406) / [#1434](https://github.com/AgoraIO/docs-portal/pull/1434) | RTM Web 语聊房、1V1 呼叫邀请 | 2 | 2 |

白板的 110 个指南 URL 中，85 个对应源站新增 MDX 文件（平台文件合并为 32 个新站目标）；另 25 个是新增 HarmonyOS 平台后继承的通用入口。目标同步 PR 实际新增了 26 个指南 MDX，其余是既有正文增加平台或继承入口。实现 301 时，这些新增的公开入口也需要覆盖。

## 优先核对的普通指南

| 文档 | 旧路径 | 当前新路径 |
| --- | --- | --- |
| 发送和接收视频 Metadata | `/doc/rtc-server-sdk/cpp/advanced-features/video-metadata` | `/realtime-media/rtc-server-sdk/build/video-metadata` |
| 播放音效或音乐文件 | `/doc/rtc/harmonyos/advanced-features/audio-effect-mixing` | `/realtime-media/rtc/build/audio/audio-effect-mixing` |
| 媒体流加密 | `/doc/rtc/harmonyos/advanced-features/channel-encryption` | `/realtime-media/rtc/build/advanced-channel/channel-encryption` |
| 设置人声效果 | `/doc/rtc/harmonyos/advanced-features/voice-changer` | `/realtime-media/rtc/build/audio/voice-changer` |
| 1V1 呼叫邀请场景 | `/doc/rtm2/javascript/best-practice/one-to-one-call` | `/realtime-media/rtm/best-practice/web/one-to-one-call` |
| 语聊房场景 | `/doc/rtm2/javascript/best-practice/voice-room` | `/realtime-media/rtm/best-practice/web/voice-room` |

RTM Web 的两个目标是当前中文分支的路径。未合并的 #1443 将 Web 和 Native 合为统一平台页；届时目标应改为 `/realtime-media/rtm/best-practice/voice-room?platform=web` 和 `/realtime-media/rtm/best-practice/one-to-one-call?platform=web`，避免把 301 指向随后移走的 `/web/` 页面。

AI 工具包副本逐 URL 展开在 CSV 中；排除退役命名空间后，112 个 `/agora-cli` URL 指向 `/introduction/agora-cli`，112 个 `/start-with-ai` URL 指向 `/introduction/start-with-ai`。共享正文先前已在新站存在，后续旧站新增副本仍产生了需要承接的新 URL。

## 白板 / Fastboard 指南按目标合并

以下保留每个新站目标的文档名、旧入口数及平台；精确路径见 CSV。平台名沿用旧站名称，`javascript` 对应新站 Web。

| 文档 | 新站目标 | 旧入口数 | 旧平台 |
| --- | --- | --- | --- |
| 声网 MCP | `/introduction/mcp-integrate` | 2 | harmonyos |
| 声网 Skills | `/introduction/skills-integrate` | 2 | harmonyos |
| 基本概念 | `/realtime-media/whiteboard/concepts` | 2 | harmonyos |
| Fastboard SDK 概览 | `/realtime-media/whiteboard/fastboard-sdk` | 2 | harmonyos |
| 背景图加载与恢复 | `/realtime-media/whiteboard/fastboard-sdk/build/appliance-plugin/background-image-recovery` | 3 | android / ios / javascript |
| 自定义教具与样式 | `/realtime-media/whiteboard/fastboard-sdk/build/appliance-plugin/custom-tools` | 3 | android / ios / javascript |
| 公共事件监听与元素查询 | `/realtime-media/whiteboard/fastboard-sdk/build/appliance-plugin/events-and-query` | 1 | javascript |
| Auto Shape：一笔绘制图形 | `/realtime-media/whiteboard/fastboard-sdk/build/appliance-plugin/extended-features` | 3 | android / ios / javascript |
| 教具插件介绍与启用 | `/realtime-media/whiteboard/fastboard-sdk/build/appliance-plugin/overview` | 3 | android / ios / javascript |
| 扩展 API 与配置 | `/realtime-media/whiteboard/fastboard-sdk/build/extend-whiteboard/api-extension` | 3 | android / ios / javascript |
| 使用文档转换服务 | `/realtime-media/whiteboard/fastboard-sdk/build/extend-whiteboard/convert-files` | 1 | harmonyos |
| 课件按需加载 | `/realtime-media/whiteboard/fastboard-sdk/build/extend-whiteboard/courseware-lazy-loading` | 3 | android / ios / javascript |
| 动态配置 | `/realtime-media/whiteboard/fastboard-sdk/build/extend-whiteboard/dynamic-config` | 1 | javascript |
| 本地日志 | `/realtime-media/whiteboard/fastboard-sdk/build/extend-whiteboard/local-log` | 3 | android / ios / javascript |
| 统一笔记 | `/realtime-media/whiteboard/fastboard-sdk/build/extend-whiteboard/unified-notes` | 3 | android / ios / javascript |
| 统一页面控制 | `/realtime-media/whiteboard/fastboard-sdk/build/extend-whiteboard/unified-page-control` | 3 | android / ios / javascript |
| 开启和配置互动白板服务 | `/realtime-media/whiteboard/fastboard-sdk/build/setup-and-access/enable-service` | 1 | harmonyos |
| 生成和使用 Token | `/realtime-media/whiteboard/fastboard-sdk/build/setup-and-access/generate-token` | 1 | harmonyos |
| 计费说明 | `/realtime-media/whiteboard/fastboard-sdk/reference/billing` | 1 | harmonyos |
| PPT 转换效果支持情况 | `/realtime-media/whiteboard/fastboard-sdk/reference/convert-ppt` | 1 | harmonyos |
| QPS 计费说明 | `/realtime-media/whiteboard/fastboard-sdk/reference/qps-pricing` | 1 | harmonyos |
| 响应状态码 | `/realtime-media/whiteboard/fastboard-sdk/reference/response-code` | 1 | harmonyos |
| 方案对比 | `/realtime-media/whiteboard/solution-compare` | 2 | harmonyos |
| 互动白板 SDK 概览 | `/realtime-media/whiteboard/whiteboard-sdk` | 2 | harmonyos |
| 背景图加载与恢复 | `/realtime-media/whiteboard/whiteboard-sdk/build/appliance-plugin/background-image-recovery` | 4 | android / harmonyos / ios / javascript |
| 自定义教具与样式 | `/realtime-media/whiteboard/whiteboard-sdk/build/appliance-plugin/custom-tools` | 4 | android / harmonyos / ios / javascript |
| 公共事件监听与元素查询 | `/realtime-media/whiteboard/whiteboard-sdk/build/appliance-plugin/events-and-query` | 1 | javascript |
| Auto Shape：一笔绘制图形 | `/realtime-media/whiteboard/whiteboard-sdk/build/appliance-plugin/extended-features` | 4 | android / harmonyos / ios / javascript |
| 教具插件介绍与启用 | `/realtime-media/whiteboard/whiteboard-sdk/build/appliance-plugin/overview` | 4 | android / harmonyos / ios / javascript |
| 使用文档转换服务 | `/realtime-media/whiteboard/whiteboard-sdk/build/extend-whiteboard/convert-files` | 1 | harmonyos |
| 课件接入 | `/realtime-media/whiteboard/whiteboard-sdk/build/extend-whiteboard/courseware-integration` | 4 | android / harmonyos / ios / javascript |
| 课件按需加载 | `/realtime-media/whiteboard/whiteboard-sdk/build/extend-whiteboard/courseware-lazy-loading` | 4 | android / harmonyos / ios / javascript |
| 动态配置 | `/realtime-media/whiteboard/whiteboard-sdk/build/extend-whiteboard/dynamic-config` | 4 | android / harmonyos / ios / javascript |
| 本地日志 | `/realtime-media/whiteboard/whiteboard-sdk/build/extend-whiteboard/local-log` | 4 | android / harmonyos / ios / javascript |
| 新版 API 与多窗口课件控制 | `/realtime-media/whiteboard/whiteboard-sdk/build/extend-whiteboard/native-api-extension` | 4 | android / harmonyos / ios / javascript |
| 预加载 | `/realtime-media/whiteboard/whiteboard-sdk/build/extend-whiteboard/preload` | 3 | android / harmonyos / ios |
| 统一笔记 | `/realtime-media/whiteboard/whiteboard-sdk/build/extend-whiteboard/unified-notes` | 4 | android / harmonyos / ios / javascript |
| 统一页面控制 | `/realtime-media/whiteboard/whiteboard-sdk/build/extend-whiteboard/unified-page-control` | 4 | android / harmonyos / ios / javascript |
| 多窗口模式 | `/realtime-media/whiteboard/whiteboard-sdk/build/manage-whiteboard/multi-window` | 1 | javascript |
| 使用白板工具 | `/realtime-media/whiteboard/whiteboard-sdk/build/manage-whiteboard/use-tools-wb` | 1 | harmonyos |
| 开启和配置互动白板服务 | `/realtime-media/whiteboard/whiteboard-sdk/build/setup-and-access/enable-service` | 1 | harmonyos |
| 应对防火墙限制 | `/realtime-media/whiteboard/whiteboard-sdk/build/setup-and-access/firewall` | 1 | harmonyos |
| 生成 Token | `/realtime-media/whiteboard/whiteboard-sdk/build/setup-and-access/generate-token` | 1 | harmonyos |
| 加入白板房间 | `/realtime-media/whiteboard/whiteboard-sdk/get-started/join-room-wb` | 1 | harmonyos |
| 计费说明 | `/realtime-media/whiteboard/whiteboard-sdk/reference/billing` | 1 | harmonyos |
| PPT 转换效果支持情况 | `/realtime-media/whiteboard/whiteboard-sdk/reference/convert-ppt` | 1 | harmonyos |
| 下载 | `/realtime-media/whiteboard/whiteboard-sdk/reference/downloads` | 1 | harmonyos |
| 从 Netless 迁移 | `/realtime-media/whiteboard/whiteboard-sdk/reference/migrate-from-netless` | 1 | harmonyos |
| QPS 计费说明 | `/realtime-media/whiteboard/whiteboard-sdk/reference/qps-pricing` | 1 | harmonyos |
| 发版说明 | `/realtime-media/whiteboard/whiteboard-sdk/reference/release-notes-wb` | 1 | harmonyos |
| 响应状态码 | `/realtime-media/whiteboard/whiteboard-sdk/reference/response-code` | 1 | harmonyos |

## 已进入既有交付清单，不重复列作缺项

以下 57 个旧 URL 已在 `legacy-url-map.json`、Vercel 导出及 Nginx 导出中存在 301。这里只确认交付文件覆盖，不表示生产已加载这些规则；当前应用的普通 `/doc/*` 回退仍是跳回旧站的 308。

| 新增文档/入口 | 源站 PR | 旧 URL 数 |
| --- | --- | --- |
| 自定义 TTS / 自定义 TTS（Agent） | [#2038](https://github.com/AgoraIO/shengwang-doc-source/pull/2038) / [#2045](https://github.com/AgoraIO/shengwang-doc-source/pull/2045) | 2 |
| ASR 热词 | [#2063](https://github.com/AgoraIO/shengwang-doc-source/pull/2063) | 1 |
| 承接词 / 自定义工具 | [#2074](https://github.com/AgoraIO/shengwang-doc-source/pull/2074)（承接词后续 [#2101](https://github.com/AgoraIO/shengwang-doc-source/pull/2101)） | 2 |
| RTM 小程序指南与继承平台入口 | [#2069](https://github.com/AgoraIO/shengwang-doc-source/pull/2069) | 42 |
| 云录制 Legacy 单流设置 / 文件介绍 | [#2091](https://github.com/AgoraIO/shengwang-doc-source/pull/2091) | 2 |
| RTC 四个 Native 平台 VideoEffectObject | [#2094](https://github.com/AgoraIO/shengwang-doc-source/pull/2094) | 4 |
| RTC Windows/C++ WARN_CODE_TYPE | [#2094](https://github.com/AgoraIO/shengwang-doc-source/pull/2094) | 1 |
| RTSA video_sei_t | [#2083](https://github.com/AgoraIO/shengwang-doc-source/pull/2083) | 1 |
| RTC Android / C++ LocalAccessPointConfiguration | [#2054](https://github.com/AgoraIO/shengwang-doc-source/pull/2054) | 2 |

## 需要单列的 38 个 URL

| 状态 | 数量 | 处理边界 |
| --- | --- | --- |
| 等待 [#1443](https://github.com/AgoraIO/docs-portal/pull/1443) 合入 | 12 | RTM Native 5 平台 × 2 篇最佳实践、在线状态 FAQ、RTC Web IAgoraRTCServicePlugin。目标已核对最新 PR 树，当前中文分支尚无这些新正文。 |
| 隐藏页面发布策略 | 2 | 配置云端 3A / 让智能体更快回复：旧站当前 sitemap 已列出，新站正文存在，但导航仍以 ! 隐藏；应先确认是否纳入公开跳转。 |
| 没有对应新页 | 3 | 白板 AssetsHttpsOptions、DeviceType、Web GlobalState：迁移台账排除了空类型或辅助页，需决定保留页面还是映射至具体替代正文。 |
| 退役命名空间 | 20 | 灵动课堂、融合 CDN、SDK 插件旧入口遵守现有 404 策略，不生成 301。 |
| 非产品文档 | 1 | /global-shared/KdBATRVgnfQp，排除。 |

尚未合入的 12 条、隐藏的 2 条及无对应正文的 3 条，在完整 CSV 中都给出旧 URL 和当前已知目标/问题；没有混入“待补 301”文件。

## 核查方法与证据边界

- 固定目标：`docs-portal@472e0250ff2c4a61bf7a0f10a472628192b33f31`，分支 `codex/cn-newdoc-html-api-migration`。
- 固定源端点：`shengwang-doc-source@b9aa4166a265ad2693ced2ce36ea4a7d5e21e826`（0.0.546）。读取 Git 对象，不使用源仓库工作区的修改。
- 回查初次 hotfix #940 的新增 TTS 页及 LocalAccessPointConfiguration API 页，以及该批源端点之后至 0.0.546 的 first-parent 新增源文件；交叉核对 #1185、#1198、#1291、#1338、#1407、#1434 的映射台账。新站 #1443 的状态通过 GitHub 确认为 OPEN，核对到 head `b9900b93183eeb21078634b0eb93587db91d7d86`。
- 2026-11-18 下载旧站 [sitemap](https://doc.shengwang.cn/sitemap.xml)：8,961 个不同 URL。与 2026-10-14 的 8,221 条旧 inventory 比较，新增 741 个 URL；再补入历史 hotfix 已纳入旧 inventory 的新增文档/平台入口，合计检查 798 个源 URL。
- 对照 `src/lib/shengwang-guide-redirects.json`、`vercel.json`、`docs/migration/redirect-inputs/legacy-url-map.json` 和维护台账。703 个待补源路径均未出现在已有显式 301 中；对应目标均找到当前中文内容文件，且不是自跳转。
- 57 条已有覆盖的导出规则逐条核对 Vercel/Nginx 两种产物。20 条退役入口逐条用 `retired-cn-docs.mjs` 的现行规则复核。
- 本次“旧站公开入口”的逐 URL 证据是当前生产 sitemap；没有对全部 URL 执行正文、HTTP 状态、平台面板及锚点的浏览器验收。正文提取代理未成功返回有效页面，因此没有把它作为上线/正文验证证据。
- 新站目标以公开的无 `/zh-CN` 前缀路径记录，沿用现有 301 导出约定。平台单列；实施时应保留旧平台语义，对合并的平台页核对 `?platform=`，并保留有效查询参数/锚点。
- 本次是页级 URL 清单，不是全站 301 发布验收，也未证明目标分支已在生产提供服务。没有修改配置、运行应用构建或发布重定向。

完整 CSV 的行数、唯一源路径、目标文件存在性、当前退役策略以及已有导出规则的验证均已通过。原始 sitemap、计算记录和只读审计脚本留在忽略目录 `.agent/artifacts/hotfix-redirect-audit-20261118/`。
