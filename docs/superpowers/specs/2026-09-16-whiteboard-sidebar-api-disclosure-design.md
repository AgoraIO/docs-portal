# 白板 SDK 服务端 API Sidebar 展开状态设计

## 问题

互动白板页面同时展示互动白板 SDK 和 Fastboard SDK 两个导航区。两个导航区的“服务端 API”都嵌入相同的 RESTful API 页面 URL。打开其中任意 RESTful API 详情页时，Sidebar 当前仅按 URL 判断活动节点，导致两个同 URL 节点同时展开。

## 目标

- 打开互动白板 SDK 来源的 RESTful API 页面时，只展开互动白板 SDK 下的“服务端 API”。
- 打开 Fastboard SDK 来源的 RESTful API 页面时，只展开 Fastboard SDK 下的“服务端 API”。
- 不改变两个 SDK 共享的 API 页面内容、链接地址或普通页面的自动展开行为。

## 方案

服务端 API 嵌入节点的页面通过 `search.from` 保存产品 Sidebar 路径，并通过 `search.fromScope` 保存嵌入它们的 SDK 路径。API 详情页恢复产品 Sidebar 时，将两个上下文值传入展开判断：对于 API 详情页，只有同时满足当前 URL、`search.from` 和 `search.fromScope` 的页面节点才被视为活动节点；普通没有来源标记的节点继续按 URL 匹配。这样可以在根页面上两个 SDK 共享同一 `from` 路径时，仍区分两个导航分支，同时保持两个 SDK 共享的 API 内容和 Sidebar 结构不变。

## 验证

- 增加产品 Sidebar 恢复逻辑的单元测试，验证相同 API URL 在不同 `from` 来源下只展开对应节点。
- 运行相关 Vitest 测试，并运行类型检查。
