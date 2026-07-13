# zh-CN 全局产品 IA 迁移计划

## Goal

把 `content/docs/zh-CN/realtime-media` 与 `content/docs/zh-CN/solutions` 下的产品页统一到产品级四层 IA：`index`、`get-started`、`build`、`reference`。迁移时 `build` 内部必须按用户心智和任务流程重新分组，而不是机械沿用 `basic-features`、`advanced-features`、`user-guides`、`best-practices` 等历史目录。

## Scope

- In scope: zh-CN 实时与媒体、解决方案下的产品根目录。
- In scope: 产品根目录的 `meta.json`、内容文件移动、站内链接、旧路径重定向、迁移 CSV。
- Out of scope unless required by routing: 英文 IA、API reference 生成链、非产品聚合页的深度重写。

## Phases

1. [complete] 盘点产品根目录，区分“标准产品页”和“分类/平台聚合页”。
2. [complete] 为标准产品生成用户心智导向的 IA 映射：overview -> index、首跑 -> get-started、任务 -> build、查阅 -> reference。
3. [complete] 批量迁移文件和 `meta.json`，建立 build 内任务分组。
4. [complete] 补充旧路径到新路径的重定向，并更新迁移 CSV。
5. [complete] 全局验证：无禁用一级分组残留、移动后的旧路径均有重定向、站内链接无断链、新页面可渲染、测试和类型检查通过。

## Decisions

- 中文产品页一级分组固定为 `index`、`get-started`、`build`、`reference`。
- `build` 内分组按用户任务命名，例如“接入服务”“实现核心功能”“处理数据”“运营与优化”“接收事件通知”，具体由产品内容决定。
- `api`、`api-ref`、`webhook` 作为一级文件夹收敛到 `reference`；但“接收 Webhook/配置回调”这种操作型文档进入 `build`。
- 产品聚合页如果本身承载子产品列表，先不强行套四层产品 IA；只对真正的产品根目录应用该规范。
- 移动路径时必须同时更新站内链接，并为旧 URL 建立重定向兜底，避免迁移后断链。
- 智能门铃根 `index` 使用广义场景/产品概览；原 PaaS 概览迁移到 `build/paas/paas-overview`，避免产品根出现额外 `index-page`。
- scoped 链接审计以页面路由是否存在为迁移验收口径；hash anchor 命名问题单独记录，不阻塞本次路径迁移。

## Errors Encountered

| Error | Attempt | Resolution |
| --- | --- | --- |
