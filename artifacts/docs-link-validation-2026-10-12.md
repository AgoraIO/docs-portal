# zh-CN 文档站内跳转验证报告

- 验证日期：2026-10-12
- 检查分支：`codex/cn-newdoc-html-api-migration`
- 检查范围：只扫描 `content/docs/zh-CN` 和中文 OpenAPI 源，并只在 `VITE_DOCS_REGION=cn` 运行时验证。
- 验证环境：`http://127.0.0.1:4174`（`VITE_DOCS_REGION=cn`）。

## 结论

中文专用运行时检查发现 8 个去重候选路径，其中 6 个返回 200、2 个返回 404。两个真实 404 是：

| 运行时 404 路径 | 中文源文件（最多 5 个） |
| --- | --- |
| `/zh-CN/realtime-media/rtc/build/get-started/quick-start` | zh-CN/realtime-media/rtc/build/extensions/web/noise-reduction.mdx<br>zh-CN/realtime-media/rtc/build/extensions/web/super-clarity.mdx<br>zh-CN/realtime-media/rtc/build/extensions/web/video-compositing.mdx<br>zh-CN/realtime-media/rtc/build/extensions/web/virtual-background.mdx<br>zh-CN/realtime-media/rtc/build/extensions/web/voice-activity-detection.mdx |
| `/zh-CN/solutions/iot-apaas/build/customize-and-extend/_` | zh-CN/solutions/iot-apaas/build/customize-and-extend/upgrade-ota.mdx |

静态源级审计还标记了 64 个无效内部链接、7 个未解析相对 Markdown 链接和 57 个缺失锚点候选；其中锚点候选去重后共 27 个页面/锚点组合，在 cn 运行时页面均为 200 且目标 `id` 存在。

## 静态审计

执行：`bun run docs:links:strict` 的 zh-CN 定向调用（只传入 zh-CN 文档源和中文 OpenAPI 源）。

| 指标 | 数量 |
| --- | ---: |
| zh-CN 文档文件 | 6708 |
| 中文 OpenAPI 文件 | 15 |
| 总链接 | 102724 |
| 无效内部链接 | 64 |
| 未解析相对 Markdown 链接 | 7 |
| 未解析根路径链接 | 0 |
| 缺失锚点候选 | 57 |
| 外部链接（未在本轮检查） | 7500 |

## 浏览器交互冒烟验证

- 中文首页 `/zh-CN/introduction` 可渲染，标题为“声网文档中心”。
- 中文首页搜索弹层可打开；主题按钮可从浅色切换为深色。
- 中文 RTC 快速开始页可渲染，页面加载无浏览器错误。
- 中文代表性导航和页面链接抽样 156 个，返回 200/307 的 156 个。

## 复验方法

- 递归扫描 `content/docs/zh-CN/**/*.md`、`*.mdx`，并使用审计脚本的中文 OpenAPI 源过滤。
- 从静态审计的 invalid internal、missing relative、missing root 集合提取路径，在 cn 服务逐条请求并记录状态；本轮共 8 个去重路径。
- 对 57 个锚点候选按目标页面去重后检查 HTML 的 `id` 属性；本轮共 27 个组合。
- 启动命令：`VITE_DOCS_REGION=cn bun run dev -- --host 127.0.0.1 --port 4174`。

## 判定

当前 zh-CN 仍有 2 个运行时 404 路径需要修复；静态审计的 64 个无效内部链接和 7 个相对链接也需要逐项确认。修复后应重新运行本报告中的中文定向审计和 cn 浏览器验证。
