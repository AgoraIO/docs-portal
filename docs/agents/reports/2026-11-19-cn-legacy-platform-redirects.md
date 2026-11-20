# 中文旧链接的平台与 SDK 跳转修复

81 个旧链接进入新站后丢失了来源平台或 SDK 类型，导致 Web/iOS 等用户看到默认 Android 内容，或 Java 用户看到 C++/RESTful API。修复在已有审核映射中为这 81 个入口指定当前规范平台地址，应用路由及生成的 Nginx/Vercel 配置使用同一映射。

## 任务复核

- 按用户要求从刚拉取的 `main` 建立修复分支，固定基点为 `da0574f14b70f3579689dc129faf3eae8d245eb9`。
- 对照原内容审计及当前源码复核全部 81 个入口；它们在此基点均未有审核覆盖，81 个目标均有当前内容或有效平台变体。
- 这 81 项适合修复跳转，不需要修改正文、SDK/API 签名或公共渲染器。合理共用的 Native 错误码和已经正确的新目录变更不在本次修复清单内。
- 使用 `src/lib/shengwang-guide-redirects.json` 现有维护入口，原 813 条审核覆盖保持不变。

| 产品范围 | 修复入口数 |
| --- | ---: |
| RTC | 59 |
| RTM | 16 |
| 录制 | 4 |
| AIGC | 2 |
| 合计 | 81 |

## 关键目标

| 旧链接 | 修复后的新站路径 |
| --- | --- |
| `/doc/rtc/javascript/get-started/quick-start` | `/realtime-media/rtc/get-started/quick-start/web` |
| `/doc/rtc/javascript/error-code` | `/realtime-media/rtc/reference/error-code/web` |
| `/doc/rtc/mini-program/error-code` | `/realtime-media/rtc/reference/error-code/mini-program` |
| `/api-ref/rtm2/javascript/toc-message/message` | `/api-reference/rtm/web/message` |
| `/doc/cloud-recording/restful/get-started/quick-start-java` | `/realtime-media/cloud-recording/get-started/quick-start/java` |
| `/doc/recording/java/resources` | `/realtime-media/local-server-recording/reference/downloads/server-java` |

React、React Native、Unreal C++/Blueprint 及服务端 Java 按现有目标平台键核对，未把旧平台名直接拼接成未经验证的 URL。完整入口与目标在 [81 条回归夹具](../../../scripts/fixtures/shengwang-platform-redirects.json)。

生成产物的语义差异恰为这 81 个目标变更，未删除既有映射；原 1,100 条下线记录及历史候选/路由快照保持不变。应用路由沿用原有查询串及 hash 保留行为；历史 Nginx/Vercel 映射保留原来的参数策略。

## 验证

代码检查点：`239dc2697e68a8a88931d1676548d9870501ac80`。

- 先复现失败：旧 Web 快速开始的应用路由返回旧 host 的 308，发布映射也没有 `/web`。添加第一条审核覆盖后，回归由失败转为通过。
- 6 个相关测试文件、370 项测试通过，涵盖全部 81 条应用入口、尾斜杠、重复查询参数、中文 hash、目标存在性、Nginx/Vercel 一致性及 fallback 优先级。
- 中文 `types:check` 通过。
- `shengwang-redirects:check`、`legacy-redirects:check` 和 `git diff --check` 通过。
- `lint` 无错误；保留基点已有 81 个 warning、1 个 info。新增文件单独 Biome 检查通过。
- 全量：448 个文件，7,353 项通过、8 项失败、24 项跳过。8 个失败已在独立、干净的同一 main 基点重跑并逐项匹配：`FumadocsOpenApiContent.test.tsx` 7 项英文渲染断言，`docs-content-regressions.test.ts` 1 项旧内容占位符断言；本修复没有新增失败。
- 浏览器验证：81/81 通过。每条导航前均保存 Android 偏好，然后从旧入口进入，核对最终规范地址、可见平台和正文；RTM Web 消息 API 另核对 `Promise<PublishResponse>`，Web 错误码核对 `INVALID_PARAMS`，Java 快速开始核对 Java SDK 内容。4 条冷启动加载超时在编译缓存就绪后重试均通过。验收使用公开可见状态，内部 DOM dataset 仅作诊断。

本机 Node 22.16 执行含 TypeScript 导入的发布校验时使用 `NODE_OPTIONS=--experimental-strip-types`，未为本地环境修改项目命令或依赖。

## Standards

独立规范审查：0 个可执行发现。确认仅新增 81 条审核映射及对应回归，既有配置和参数策略保持一致；无文档化规范违规或需要处理的代码异味。

## Spec

独立需求审查：0 个可执行发现。确认 81 个任务在 main 上仍需要修复，目标均对应既有正文或非空平台块；平台别名、RTM JavaScript 签名和生成产物均符合任务要求，无正文重写或其他范围扩张。

两项审查均固定比较上述代码检查点与 main 基点；本文件仅补充验收记录。

## 发布边界

这是仓库内的修复与本地验收，尚未合并或部署。上线时需要部署包含这些覆盖规则的新站及相应的生成配置；旧域名 CDN 当前返回的跨域 302 属于入口层配置，未在本次源码修复中改动。生产环境仍需在发布后复验最终 301、规范平台地址与正文。

本地浏览器 JSON、完整测试日志及基点对照日志保存在忽略的 `.agent/artifacts/legacy-platform-redirects/` 和 `.agent/tasks/legacy-platform-redirects/`，不提交截图或原始流量数据。
