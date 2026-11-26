# 中文旧站增量同步设计（2026-10-15）

## 目标

- 以 `shengwang-doc-source@origin/master`（`5ff6834d5`）为中文内容事实基准。
- 以目标分支的同步记录 `docs/migration/cn-master-sync-20261010.md` 为基线：源 `5d03551cf`，目标 `99e7f81b4`。
- 只把基线之后能安全映射到 `docs-portal` 中文内容的变更同步到 `content/docs/zh-CN`，并保留从源文件、目标文件到验证结果的映射。
- 保留正文、标题、示例、代码、表格、链接、顺序和平台语义；只做新站语法所需的确定性转换。

## 非目标

- 不修改英文内容、非中文导航、前端组件实现或旧站生成 HTML。
- 不覆盖目标分支已有的新站适配；发生冲突时按目标文件当前语义做最小补丁。
- 不猜测或生成中文图床 URL。当前增量审计未发现新增或变更图片，仍建立独立图片清单并明确记录“无新增图片”。

## 已确认的增量

源基线 `5d03551cf..5ff6834d5` 只有以下三个内容提交：

1. `05ca2c5af`：RTC Web SDK 4.24.9 中文安装、下载、入口和 Web 发版说明更新，同时变更旧站 Web API 平台元数据及生成的 `html-docs/rtc/Web/globals.html`。
2. `7d5d84700`：RTM 2.x 中文 `api-limits.mdx` 大幅重写。
3. `f3f0638e5`：移除 RTM 限制页中不受支持的 Top N Console 说明。

## 推荐方案

采用“目标语义页面最小补丁 + 可审计清单”的方案：

- 将 Web 4.24.9 的正文变化映射到已有中文页面，不复制旧站首页 JSX 或 Docusaurus 布局。
- 将 RTM API 限制页以源文件最终版本为内容基准，去除无效的 `@shared` import 和旧 `PlatformFilter` 包装；把常见问题的 `<Detail>` 转成新站支持的 Markdown 标题/段落（或经标准允许的折叠组件），不删减问答内容。
- 将旧站 Web API 生成 HTML 的 8 个预设值补到现有中文 `globals.mdx` 表格；不把 HTML 文件本身复制到目标仓库。
- 由中文 SDK 下载数据文件承接旧站 `resources.javascript.mdx` 的版本、下载地址和发布日期，避免修改无关的英文或语音产品数据。

### 方案比较

| 方案 | 做法 | 优点 | 风险 | 结论 |
| --- | --- | --- | --- | --- |
| A | 直接复制旧站文件并批量替换语法 | 快 | 会覆盖新站目录/平台适配，保留不支持的 JSX/过滤器 | 不采用 |
| B | 逐文件映射到现有中文页面，按新站标准做最小转换 | 可追溯、保留新站 IA、冲突面小 | 需要逐项核对链接和平台块 | **推荐** |
| C | 只同步版本号和摘要，API/限制页延期 | 改动少 | 丢失源正文、表格和示例，不满足一比一要求 | 不采用 |

## 源文件到目标文件映射

### 直接同步或最小补丁

| 源文件 | 目标文件 | 处理 |
| --- | --- | --- |
| `docs/rtc/overview/release-notes.javascript.mdx` | `content/docs/zh-CN/realtime-media/rtc/reference/release-notes.mdx` | 在现有 `<PlatformStructured platform="web">` 内新增完整 `v4.24.9` 段落，保留新增特性、改进、问题修复和 API 变更；将旧链接改为目标 Web API 路由。 |
| `docs/rtc/get-started/quick-start.javascript.mdx` | `content/docs/zh-CN/realtime-media/rtc/get-started/quick-start.mdx` | 将 Web 平台两处 `AgoraRTC_N-4.24.8.js` 更新为 `4.24.9`，保留周围新站平台结构。 |
| `docs/rtc/basic-features/audio-quick-start.javascript.mdx` | `content/docs/zh-CN/realtime-media/rtc/build/audio/audio-quick-start.mdx` | 同步两处 Web CDN/本地脚本版本号。 |
| `docs/rtc/basic-features/ls-quick-start.javascript.mdx` | `content/docs/zh-CN/realtime-media/rtc/build/advanced-channel/ls-quick-start.mdx` | 同步两处 Web CDN/本地脚本版本号。 |
| `docs/rtc/resources.javascript.mdx` | `src/components/docs-overview/sdk-downloads-data.zh-cn.ts` 中 `video-sdk-web` | 更新中文视频 Web SDK 的最新版本、下载 URL、npm URL 和发布日期；不改语音 SDK 或英文数据。 |
| `html-docs/rtc/Web/globals.html` | `content/docs/zh-CN/api-reference/rtc/web/globals.mdx` | 将 1440p/4K 八个预设值补入现有表格；这是生成 HTML 到现有 API MDX 的确定性内容映射。 |
| `docs/rtm2/user-guide/setup/api-limits.mdx` | `content/docs/zh-CN/realtime-media/rtm/reference/usage-limits-and-errors/api-limits.mdx` | 以源最终版本完整迁移正文、表格、公式、代码和 FAQ；移除仅旧站使用的 `PlatformFilter` 和未使用 import，转换 `<Detail>`，保留现有 `meta.json` 导航。 |

### 记录但不直接迁移

| 源文件 | 原因 | 承接或后续建议 |
| --- | --- | --- |
| `docs/rtc/_homepage_.mdx` | 旧站首页 JSX 版本卡片；新站 RTC 首页没有同构版本卡片。 | 版本信息由发版说明和中文 SDK 下载数据承接；不新增旧首页布局。 |
| `docs/rtc/landing-page.javascript.mdx` | 旧站 Web 平台入口推荐卡片；新站 RTC 首页 IA 已重组。 | 发版说明/下载页已提供同等入口；如产品要求首页显式版本卡片，另开 IA 变更。 |
| `docs-api-reference/rtc/_platforms_.meta.js` | 旧站平台/版本下拉元数据；新站 Web API 使用 `meta.json` 与 current 目录，不存在同构版本下拉。 | 不改目标导航；在报告中记录旧元数据已审计。 |
| `docs/superpowers/plans/2026-10-09-rtm-api-limitations.md`、`docs/superpowers/specs/2026-10-09-rtm-api-limitations-design.md` | 旧站工作过程文档，不是发布内容。 | 不迁移。 |

## 语法与平台转换

- 保持 RTC 发版说明的现有 Web `PlatformStructured` 连续平台块，不新建页面或重复标题。
- 所有图片使用 Markdown 语法；本次无新增或变更图片。
- RTM 限制页的通用正文不需要平台过滤；移除 `PlatformFilter` 包装后保留其内部内容。FAQ 使用新站可解析的 Markdown 结构，避免遗留 `<Detail>`。
- 代码块补齐新站允许的语言标记；表格只保留简单单行单元格。
- 旧站链接逐条转换为目标中文绝对路由或当前页相对路由，并运行内部链接审计。

## 图片清单与交接

实现阶段单独创建 `docs/migration/cn-master-sync-20261015-images.tsv`，字段为：`source_url`、`source_path`、`target_file`、`target_location`、`upload_status`、`cn_cdn_url`、`validation`。本次初始清单只有表头和 `NO_NEW_OR_CHANGED_IMAGES` 记录；如果后续发现图片引用变化，先交给同事上传，再回填返回 URL，使用 HTTP 响应状态、`Content-Type` 和图片签名验证可访问性。

## 变更映射与一致性验证

实现阶段创建 `docs/migration/cn-master-sync-20261015-mapping.md`，逐行记录源文件、源提交、目标文件、目标位置、图片清单行、处理方式和验证结果。验证分为：

1. 文本/结构：源增量关键段落、标题、表格行、代码和链接与目标对应；API 预设值逐项核对。
2. 链接：新站内部路由、锚点和外部下载链接检查；不得把旧站 `/doc` 或旧 HTML 路由直接留在中文内容中。
3. 图片：仅对清单中的变更项验证 URL 和图片类型；本次预期为空。
4. 质量命令：`git diff --check`、相关中文内容测试、`bun run types:check`。报告明确区分通过、失败和依赖/环境阻塞。

## 边界与待确认项

- `RtcSdkDownloads` 由中文数据文件渲染下载版本；若 4.24.9 下载包或 npm URL 返回异常，保留源 URL 并在报告中标记人工确认，不猜测替代地址。
- 目标分支当前依赖状态可能影响 `bun run types:check`；若失败，保留完整日志和失败原因。
- 如果迁移过程中发现源文件包含本次 diff 之外的未迁移中文段落，停止覆盖并在映射表中列为待处理项。
