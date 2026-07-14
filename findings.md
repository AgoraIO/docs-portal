# zh-CN 全局产品 IA 迁移发现

- 试点产品 `content/docs/zh-CN/realtime-media/speech-to-text` 已迁移到 `index`、`get-started`、`build`、`reference`。
- 试点里更合理的 build 分组是按任务流拆分：开始转写与翻译、处理转写数据、扩展与优化、接收事件通知。
- 初步扫描显示实时与媒体、解决方案下仍有大量历史一级分组：`overview`、`basic-features`、`advanced-features`、`user-guides`、`user-guide`、`best-practices`、`best-practice`、`api`、`api-ref`、`webhook`。
- 不是所有目录都应强套产品 IA：`realtime-media/online-ktv`、`recording`、`sdk-extensions`、`usage-analytics`、`whiteboard`、`solutions/chatroom`、`solutions/multi-usecase`、`solutions/one-to-one-live` 等更像聚合节点或包含多个子产品/方案，需要先区分。
- 全局迁移生成了 `src/lib/zh-cn-product-ia-redirects.ts`，为 zh-CN 实时与媒体、解决方案旧 IA 路径提供产品级重定向。
- 断链审计覆盖 `content/docs/zh-CN/realtime-media` 与 `content/docs/zh-CN/solutions` 下 759 个文件、21636 个链接；过滤 OpenAPI/FAQ/资源类虚拟路径后，页面路由级断链为 0。
- 审计仍发现 111 个 hash anchor 警告；这些目标页面可打开，属于锚点命名/标题生成问题，不是本次移动路径造成的页面 404。
