# 中文增量同步映射（2026-10-15）

源仓库：`shengwang-doc-source`，`master`，当前提交 `5ff6834d5`  
源同步基线：`5d03551cf`  
目标仓库：`docs-portal`，目标基线 `99e7f81b4`，目标分支 `codex/cn-newdoc-html-api-migration`  
目标迁移分支：`codex/cn-master-sync-20261015`

## 已同步文件

| 源提交 | 源文件 | 目标文件 | 目标位置 | 图片清单 | 结果 |
| --- | --- | --- | --- | --- | --- |
| `05ca2c5af` | `docs/rtc/overview/release-notes.javascript.mdx` | `content/docs/zh-CN/realtime-media/rtc/reference/release-notes.mdx` | Web `v4.24.9` | 无 | 已同步，链接改为中文 Web API 路由 |
| `05ca2c5af` | `docs/rtc/get-started/quick-start.javascript.mdx` | `content/docs/zh-CN/realtime-media/rtc/get-started/quick-start.mdx` | Web CDN 和本地脚本示例 | 无 | 已同步 `4.24.8` → `4.24.9` |
| `05ca2c5af` | `docs/rtc/basic-features/audio-quick-start.javascript.mdx` | `content/docs/zh-CN/realtime-media/rtc/build/audio/audio-quick-start.mdx` | Web CDN 和本地脚本示例 | 无 | 已同步 `4.24.8` → `4.24.9` |
| `05ca2c5af` | `docs/rtc/basic-features/ls-quick-start.javascript.mdx` | `content/docs/zh-CN/realtime-media/rtc/build/advanced-channel/ls-quick-start.mdx` | Web CDN 和本地脚本示例 | 无 | 已同步 `4.24.8` → `4.24.9` |
| `05ca2c5af` | `docs/rtc/resources.javascript.mdx` | `src/components/docs-overview/sdk-downloads-data.zh-cn.ts` | `video-sdk-web` 最新版本数据 | 无 | 已同步版本、下载 URL、npm URL 和发布日期 |
| `05ca2c5af` | `html-docs/rtc/Web/globals.html` | `content/docs/zh-CN/api-reference/rtc/web/globals.mdx` | `ScreenEncoderConfigurationPreset` 表格 | 无 | 已补充 1440p/4K 八个预设值 |
| `7d5d84700`, `f3f0638e5` | `docs/rtm2/user-guide/setup/api-limits.mdx` | `content/docs/zh-CN/realtime-media/rtm/reference/usage-limits-and-errors/api-limits.mdx` | 全文及 FAQ | 无 | 已按源最终版本同步；转换平台过滤器、FAQ 组件并保留小程序差异 |

## 图片 URL 清单

见 [`cn-master-sync-20261015-images.tsv`](./cn-master-sync-20261015-images.tsv)。本轮源增量没有新增或变更图片 URL，因此没有需要交给同事上传或回填的中文图床 URL。

## 已排除或待处理

| 源文件 | 原因 | 状态 |
| --- | --- | --- |
| `docs/rtc/_homepage_.mdx` | 旧站 JSX 首页版本卡片；新站 RTC 首页没有同构卡片，版本信息由发版说明和 SDK 下载数据承接。 | 排除并记录 |
| `docs/rtc/landing-page.javascript.mdx` | 旧站 Web 平台入口卡片；新站 IA 已重组，未新增旧布局。 | 排除并记录 |
| `docs-api-reference/rtc/_platforms_.meta.js` | 旧站平台/版本下拉元数据；新站 Web API 使用 `meta.json` 和 current 目录。 | 排除并记录 |
| `docs/superpowers/plans/2026-10-09-rtm-api-limitations.md`、`docs/superpowers/specs/2026-10-09-rtm-api-limitations-design.md` | 旧站工作过程文档，不是发布内容。 | 排除并记录 |

## 验证记录

### 内容与链接

- RTC Web `v4.24.9` 段落、8 个屏幕共享预设、三个 Web 快速开始中的 6 个脚本 URL，以及中文视频 Web SDK 下载数据均已与源增量逐项核对。
- RTM 限制页保留源最终版本的 9 个章节、表格、场景公式、重试代码和 10 个 FAQ；旧平台过滤器和 `<Detail>` 已转换，且明确保留小程序不支持 Stream Channel 的差异。
- 本次改动文件未残留 `PlatformFilter`、`Detail`、旧 `4.24.8` 脚本引用或旧站 Web API 路由；发版说明中的 `v4.24.8` 是上一版本标题，按源文档保留。
- 4.24.9 JS 和 ZIP 下载 URL 返回 HTTP 200，分别为 `application/javascript` 和 `application/zip`；npm 页面 URL 的命令行请求返回 HTTP 403，npm registry 的 `agora-rtc-sdk-ng/4.24.9` 返回 HTTP 200，页面 URL 仍需人工在浏览器确认。

### 检查结果

- `git diff --check`：通过。
- `bun install --frozen-lockfile`：通过；仅在隔离 worktree 安装依赖。
- `bun run types:check`：通过。
- `bun run test -- src/lib/docs-tree.test.ts src/lib/docs-static-manifest.test.ts`：通过，55 个测试通过。
- `bun run test -- src/lib/docs-page.server.test.ts src/lib/zh-cn-product-ia-standard.test.ts`：通过，387 个测试通过。
- `bun run test -- src/lib/docs-content-regressions.test.ts ...`：失败 2 项；失败项针对既有英文文档回归（Video get-started section 和 CodeBlockTab），不涉及本次修改文件。
- `bun scripts/audit-mdx-build-syntax.mjs --root=content/docs/zh-CN/realtime-media/rtm/reference/usage-limits-and-errors`：通过，2 个文件无问题。
- `bun scripts/audit-mdx-build-syntax.mjs --root=content/docs/zh-CN/realtime-media/rtc`：失败，报告 3 个既有文件中的 16 个问题；本次改动的 RTC 版本/链接补丁未命中报告。
- `bun run docs:links:cn-api:check`：失败，仓库已有 17 个中文文件包含可归一化链接；本次改动文件未发现新增可归一化链接。
- 图片清单：无新增或变更图片，无上传和回填任务。

