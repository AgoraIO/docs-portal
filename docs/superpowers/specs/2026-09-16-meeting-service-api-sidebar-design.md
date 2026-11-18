# Meeting 服务端 API 导航设计

## 目标

调整 `/zh-CN/realtime-media/meeting` 的“参考”导航，将“服务端 API”从直接跳转按钮改为默认收起的下拉分组，并把同一参考 section 下的三个相关页面归入该分组。

## 导航结构

“参考”下保留一个名为“服务端 API”的可折叠 section，section 本身不直接跳转，默认保持收起。其子项按以下顺序显示：

1. 如何调用 API（`call-api`）
2. 创建房间（现有服务端 API 链接）
3. 查询录制列表（现有服务端 API 链接）

其它参考页面及其顺序保持不变，现有页面 URL 不变。

## 实现与验证

在 `content/docs/zh-CN/realtime-media/meeting/reference/meta.json` 中使用仓库现有的可折叠 section 元数据表达上述结构。新增或调整回归测试，验证 section 的标题、默认收起状态、子项顺序和三个目标 URL；运行对应 Vitest 测试，并按内容变更规范运行类型检查。

