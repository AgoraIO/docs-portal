# 中文产品文档中的 RESTful API 下拉目录

## 目标

调整中文产品文档中“服务端 API”的导航行为：保留现有 `/zh-CN/api-reference/` API 文档和 URL，同时让用户在产品文档 sidebar 中直接浏览并打开对应的 RESTful API 文档。

## 用户可见行为

- 仅影响 `zh-CN` 中文站，英文站保持现状。
- 产品文档 sidebar 中已有服务端 API 入口的产品，都显示一个默认收起的“服务端 API”折叠项。
- 点击折叠项后，在当前产品 sidebar 原地展开对应的 RESTful API 目录；产品正文保持不变。
- 展开的目录沿用对应 API 参考页已有的页面层级、标题和 HTTP method 标记。
- 同一产品存在多个服务端 API 入口时，每个入口分别展示并独立折叠自己的目录。
- 点击目录中的 API 页面后，正文打开对应的 `/zh-CN/api-reference/...` 文档，浏览器地址栏同步显示该 API 文档路径。
- 打开 API 正文后，左侧仍保持来源产品的 sidebar 和产品导航上下文；不切换为 API Center 的独立 sidebar。
- 当前 API 页面在产品 sidebar 的嵌套目录中显示为选中项，服务端 API 目录保持展开。
- 直接访问没有产品上下文的 `/zh-CN/api-reference/...` URL 时，继续使用现有 API Center sidebar。
- 桌面端和移动端提供一致的展开、收起和 API 页面打开行为；移动端打开 API 页面后关闭导航抽屉。

## 数据与路由约束

- 产品 metadata 继续声明服务端 API 的入口路径，不在产品 metadata 中重复维护完整 API endpoint 列表。
- 完整 API 目录继续以 API 参考 metadata 和 OpenAPI 配置为数据源。
- API 页面正文使用标准 API 文档路径；来源产品上下文仅用于恢复产品 sidebar，不改变正文 URL 语义或 canonical URL。
- 来源上下文只允许站内合法的中文产品文档路径。
- 当前已盘点的中文服务端 API 入口都应生成非空目录，包括 OpenAPI lane、scoped API sidebar、深层 API URL 和多个入口产品。
- 若未来新增入口无法解析出目录，保留原链接可用性，并通过测试暴露该入口缺少导航配置的问题。

## 已确认的嵌入导航例外

- RTM 的服务端 API 入口 `/zh-CN/api-reference/api-ref/signaling/publish` 继续显示为“服务端 API”折叠项，但嵌入时移除其内部的“RESTful API”section 标题，将该 section 的子页面直接展示在“服务端 API”下。
- RTMP 网关嵌入导航中隐藏 `/zh-CN/api-reference/api-ref/rtmp-gateway/restful` landing page，但保留其下的实际 API endpoint 页面。
- 白板嵌入导航中隐藏 `/zh-CN/api-reference/api-ref/whiteboard/restful` landing page，但保留其下的实际 API endpoint 页面。
- 以上例外仅作用于产品 sidebar 中的嵌入视图；直接访问对应 API 参考路径时，API 参考页的正文、sidebar 和 URL 均保持现状。

## 组件职责

- 服务端文档 payload：为产品页生成嵌套的服务端 API sidebar 节点，并为 API 子页面链接保留来源产品上下文。
- 桌面端 sidebar：复用现有 section 折叠能力展示嵌套 API 节点。
- 移动端 sidebar：支持无独立目标 URL 的可折叠 section，并沿用现有移动端页面链接行为。
- 文档 shell：当 API 正文携带有效产品上下文时，使用 API 正文数据和产品 sidebar 数据组合渲染；无上下文时不改变现有 API Center 行为。

## 测试验收

- 产品 payload 测试覆盖所有当前中文服务端 API 入口，验证每个入口都是可折叠 section 且 children 非空。
- 覆盖 RTC、RTM、对话式 AI、云端录制、Meeting、灵动课堂、在线 K 歌房、微呼叫等不同 API 目录类型。
- 桌面端组件测试验证默认收起、点击展开、多个入口独立折叠和子页面链接。
- 移动端组件测试验证同样的折叠行为以及打开子页面后导航抽屉关闭。
- 路由/payload 测试验证 API 正文路径、产品 sidebar 上下文和直接访问 API URL 的现有行为互不冲突。
- 现有 API Center sidebar、API 页面路由和英文 sidebar 测试继续通过。
- RTM 测试验证“服务端 API”下无重复的“RESTful API”section 标题且 endpoint 仍可见。
- RTMP 网关和白板测试验证指定 landing page 不出现在产品嵌入 sidebar 中，同时 endpoint 页面仍可见。
