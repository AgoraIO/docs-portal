# 中文产品参考导航分组 IA 设计

## 目标

通过物理目录优化以下两个中文产品的“参考”导航，降低长列表的扫描成本，同时保留重要页面的直接可见性：

- `/zh-CN/realtime-media/rtm`
- `/zh-CN/solutions/flexible-classroom`

被分组的页面移动到新的目录，因此其规范 URL 会变化；旧 URL 通过现有中文产品 IA 重定向机制保留 301 兼容性。文档正文内容不修改。

## 已确认的导航结构

### 实时消息 RTM

直出页面：

- 下载
- 服务端 API
- 迁移指南
- 数据安全
- 退休政策

物理分组目录：

- `reference/usage-limits-and-errors/`
  - API 使用限制
  - 错误码
- `reference/capabilities-and-compatibility/`
  - 特性列表
  - 平台支持

### 灵动课堂

直出页面：

- 下载
- 服务端 API
- 升级指南

物理分组目录：

- `reference/api-usage-and-limits/`
  - 如何调用 API
  - 响应状态码
  - 配额限制
- `reference/capabilities-and-compatibility/`
  - 基本概念
  - 平台支持
  - 技术架构

## 约束与验收标准

- 为每个分组创建物理目录和目录内的 `meta.json`，并将对应文档移动到目录内。
- 上级 `reference/meta.json` 按确认的顺序引用页面和分组目录。
- 所有页面仍然保留在导航中；移动页面的新 URL 必须可直接加载。
- 为每个旧 URL 添加 301 重定向到新 URL，并保留查询参数和锚点。
- 更新仓库内指向旧路径的站内引用，不保留旧位置的内容副本。
- 直出页面保持用户无需展开即可看到。
- 不改变产品级导航中现有的发版说明、计费说明或账号与计费入口。
- 运行导航、重定向、站内链接和类型检查，确认生成的导航结构与上述列表一致。
