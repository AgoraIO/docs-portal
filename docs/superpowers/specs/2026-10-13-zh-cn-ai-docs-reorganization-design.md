# zh-CN 对话式 AI 文档重组设计

## 目标

调整 zh-CN 对话式 AI 文档的信息架构，同时保持已有外部链接可用：

- 隐藏 `custom-tts` 和 `start-stop-agent` 的导航入口，但保留页面和直接访问能力。
- 将 `custom-tts-agent.mdx` 的页面标题改为“接入自定义 TTS 服务”。
- 将 `rest-tool.mdx` 和 `asr-keywords.mdx` 移到 `ai/build/`，使其 URL 变为 `/zh-CN/ai/build/...`。
- 更新仓库内引用，并为旧 URL 提供永久重定向。

## 现状与约束

- 文档内容位于 `content/docs/zh-CN/ai`，导航由同目录下的 `meta.json` 控制。
- `meta.json` 中以 `!` 开头的页面会从导航隐藏，但页面仍可通过 URL 访问。
- `custom-tts` 和 `start-stop-agent` 当前位于 `ai/build`；`start-stop-agent` 在导航中同时有隐藏和可见条目，需要删除可见重复项。
- `rest-tool` 和 `asr-keywords` 当前位于 `ai/user-guides`，目标是物理移动到 `ai/build`，而不是仅在导航中跨目录引用。
- 当前路由支持在 `src/lib/docs-page.server.ts` 中为已移动文档返回重定向负载；路由层会据此执行跳转。
- 生成文件不手工编辑，由现有 MDX/文档生成命令更新。

## 方案

### 内容与导航

1. 将以下文件移动到 `content/docs/zh-CN/ai/build/`：

   - `user-guides/rest-tool.mdx` → `build/rest-tool.mdx`
   - `user-guides/asr-keywords.mdx` → `build/asr-keywords.mdx`

2. 在 `ai/user-guides/meta.json` 中移除这两个页面。
3. 在 `ai/build/meta.json` 中加入 `asr-keywords` 和 `rest-tool`，保留现有开发与集成分类。
4. 将 `custom-tts` 改为 `!custom-tts`，并删除 `start-stop-agent` 的可见重复项，仅保留 `!start-stop-agent`。
5. 将 `custom-tts-agent.mdx` frontmatter 的 `title` 改为 `接入自定义 TTS 服务`，文件名和 URL 保持不变。

### 引用与兼容性

1. 将仓库内指向旧路径的 zh-CN 链接改为新路径，至少覆盖发布说明和 OpenAPI 中文源文本。
2. 在 AI 文档重定向解析中增加：

   - `/zh-CN/ai/user-guides/rest-tool` → `/zh-CN/ai/build/rest-tool`
   - `/zh-CN/ai/user-guides/asr-keywords` → `/zh-CN/ai/build/asr-keywords`

   使用永久重定向，保留查询参数和锚点的现有路由行为。
3. 为两条重定向增加服务端负载测试，并更新受文件路径影响的回归测试引用。

## 验证

- 运行针对 docs page redirect、文档树和内容回归的 Vitest 测试。
- 运行 `bun run docs:links:cn-api:check` 检查中文 API 链接。
- 运行 `bun run types:check`，确保 MDX 生成、路由树和 TypeScript 检查通过。
- 在 `VITE_DOCS_REGION=cn` 本地预览中确认：
  - 新 URL 返回正确页面；
  - 旧 URL 返回永久重定向；
  - `custom-tts` 与 `start-stop-agent` 仍可直接访问但不出现在导航；
  - 页面标题显示为“接入自定义 TTS 服务”。

## 非目标

- 不修改英文站点的 AI 文档结构。
- 不删除任何文档内容。
- 不改变 `custom-tts-agent` 的文件名或 URL。
