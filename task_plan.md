# zh-CN 实时与媒体、解决方案 IA 调整计划

## Goal

使用 JTBD 和任务路径 IA 审查并调整 `content/docs/zh-CN/realtime-media` 与 `content/docs/zh-CN/solutions` 下每个产品目录的左侧导航。必须保留产品内主干顺序 `get-started/quickstart -> build -> reference`，只在各主干分组内部移动、重排或归并文档；如文档明显放错主干，可移动到正确主干。所有路径变化必须修改源文档中的内部链接，不通过新增 redirect 映射掩盖。

## Scope

- In scope: `content/docs/zh-CN/realtime-media/**` 与 `content/docs/zh-CN/solutions/**` 的产品目录 IA、`meta.json`、必要的源文档移动和内部链接更新。
- In scope: 指向被移动页面的跨产品/跨范围中文内部链接修正。
- Out of scope: 其他产品线 IA、英文文档、API reference 生成链、redirect 表新增。

## Product Directory Checklist

### Realtime Media

- [x] `realtime-media/danmaku`
- [x] `realtime-media/fusion-cdn`
- [x] `realtime-media/marketplace`
- [x] `realtime-media/media-pull`
- [x] `realtime-media/media-push`
- [x] `realtime-media/recording/cloud-recording`
- [x] `realtime-media/recording/local-server-recording`
- [x] `realtime-media/rtc`
- [x] `realtime-media/rtc-server-sdk`
- [x] `realtime-media/rtm`
- [x] `realtime-media/rtmp-gateway`
- [x] `realtime-media/rtsa`
- [x] `realtime-media/sdk-extensions/metakit`
- [x] `realtime-media/sdk-extensions/portrait-rhythm`
- [x] `realtime-media/speech-to-text`
- [x] `realtime-media/transcoding`
- [x] `realtime-media/usage-analytics`
- [x] `realtime-media/whiteboard/fastboard-sdk`
- [x] `realtime-media/whiteboard/whiteboard-sdk`

### Solutions

- [x] `solutions/art-class`
- [x] `solutions/breakout-classroom`
- [x] `solutions/chatroom/sdk`
- [x] `solutions/chatroom/uikit`
- [x] `solutions/digital-learning/course-delivery`
- [x] `solutions/digital-learning/course-resource`
- [x] `solutions/digital-learning/school-resource`
- [x] `solutions/flexible-classroom`
- [x] `solutions/game-voice`
- [x] `solutions/iot-apaas`
- [x] `solutions/meeting`
- [x] `solutions/meta-world`
- [x] `solutions/multi-usecase/non-scenario-based`
- [x] `solutions/multi-usecase/scenario-based`
- [x] `solutions/multi-usecase/ui-solution`
- [x] `solutions/one-to-one-classroom`
- [x] `solutions/one-to-one-live/custom-signaling`
- [x] `solutions/one-to-one-live/rtm`
- [x] `solutions/online-ktv/auikaraoke`
- [x] `solutions/online-ktv/ktv-scenario`
- [x] `solutions/online-ktv/online-ktv-sdk`
- [x] `solutions/online-music-class`
- [x] `solutions/ppt-transcoding`
- [x] `solutions/showroom`
- [x] `solutions/small-classroom`
- [x] `solutions/smart-camera`
- [x] `solutions/smart-doorbell`
- [x] `solutions/smart-watch`
- [x] `solutions/status-page`
- [x] `solutions/teleoperation`
- [x] `solutions/voip-call`

## Phases

1. [complete] 恢复当前分支上下文，确认 RTM/RTC 已按源文档移动方式完成，且未依赖 redirect。
2. [complete] 逐个审查剩余产品目录的 `meta.json` 和页面标题，记录 IA 问题与调整原则。
3. [complete] 对实时与媒体剩余产品执行 IA 重排、必要源文件移动和源链接更新。
4. [complete] 对解决方案产品执行 IA 重排、必要源文件移动和源链接更新。
5. [complete] 运行断链检查、`bun run types:check`、`git diff --check`，并抽检本地预览。
6. [complete] 输出每个产品目录的当前问题、调整原则、调整后结构、链接修改摘要。
7. [complete] 使用 JTBD 和信息气味审查实时与媒体、解决方案中文文档标题，修改误导、过泛或命名不一致的标题，并同步引用文字。
8. [complete] 运行标题调整后的导航、链接、类型和 whitespace 验证。

## Decisions

- 不新增、不依赖 redirect 映射；路径变化必须更新源文档里的内部链接。
- 保留产品内 `get-started -> build -> reference` 主干顺序和命名。
- `get-started` 优先承载产品介绍、适用场景、前置条件、快速开始、最小可运行路径。
- `build` 优先按任务路径排序：核心能力开发、功能配置、进阶能力、调试测试、上线运维、最佳实践。
- `reference` 优先按查阅路径排序：API、参数、错误码、兼容性、限制、FAQ、术语。
- 只改实时与媒体、解决方案 IA；其他范围只允许因被移动页面产生的内部链接修正。

## Errors Encountered

| Error | Attempt | Resolution |
| --- | --- | --- |
| 旧计划包含“补充 redirect”验收口径 | 恢复上下文时发现 | 已重写计划，当前任务禁止新增 redirect，只改源文档和源链接 |
