# 中文发版说明折叠适配设计

日期：2026-10-19

状态：用户已于 2026-10-19 确认方案 A，进入实现与验证；追加授权最终推送并创建 PR。

## 固定基线

- 仓库：AgoraIO/docs-portal，远端默认分支为 `main`，不存在远端 `master`。
- 中文远端分支：`codex/cn-newdoc-html-api-migration`。
- 中文基线：`e463c842be1ed4a19ff68df26285d388451f6b8a`。
- 隔离工作区：`/Users/yangyixuan/.codex/worktrees/cn-release-notes-folding/docs-portal`。
- 工作分支：`codex/cn-release-notes-folding-20261019`。
- 英文参考：[PR #1111](https://github.com/AgoraIO/docs-portal/pull/1111)，2026-09-28 已合入 `main`。
- 参考 head：`3f20e5b422e40e2d22075c77d38eeee8d435ebf1`；合并提交：`9b635d23aedb106592b53707d74ac6d0932ba448`。
- 本轮获取的 main：`38576d41002d31fcd16c757d1762f2990b8f922d`。
- 中文基线预览：[RTC Android](http://127.0.0.1:3011/zh-CN/realtime-media/rtc/reference/release-notes/android)，使用 `VITE_DOCS_REGION=cn bun run dev --port 3011 --strictPort` 启动并经浏览器确认。
- 基线截图仅保存在本地忽略目录 `.agent/artifacts/cn-release-notes-20261019/`。

当前中文分支已有普通 Accordion，但没有参考 PR 的版本标题、openFirst、折叠目录处理和完整历史锚点展开能力。不能仅在中文 MDX 中加入 openFirst 属性。

## 目标

中文发版说明沿用英文 PR 的版本折叠语法、组件、样式及导航规则；正文、版本信息、发布顺序、链接和历史锚点保持完整。后续合入 main 时，中英文使用同一实现。

不在本次操作中更新发版事实、重新组织产品导航、整体合并 main 或合并分支。验证完成后推送工作分支，并创建以中文迁移分支为目标的 PR。

## 可行方案与推荐

| 方案 | 优点 | 代价与风险 |
| --- | --- | --- |
| A：移植 #1111 的必要共享能力，显式适配中文 MDX（推荐） | 沿用英文内容约定；改动可追溯；保留中文分支近期平台偏好修复 | 需要逐项适配共享代码及验证历史锚点；未来合并仍需处理重叠文件 |
| B：先将 main 整体合入中文工作分支，再适配中文 MDX | 获取 main 已有的共享实现及后续修正 | 引入大量本任务之外的变化，扩大回归和冲突处理范围 |

选择 A。以 #1111 的最终 diff 为主要依据，仅在当前中文代码上适配必要逻辑，不整体替换 mdx.tsx 或复制无关内容。实现前核对 main 后续对同一功能的修正；若确有必要依赖，记录并一并最小化移植。

## 用户可见行为

1. 每段版本历史使用 `<Accordions type="multiple" openFirst>`；进入页面或切换平台后动态展开该段源码中的首个版本，不写死版本号。
2. 可以同时展开多个版本；既有普通折叠块保持原有行为。
3. 版本标题保留原标题层级及 ID，显示折叠按钮和复制链接入口，样式沿用英文组件。中文标签通过现有本地化机制提供。
4. 目录保留版本入口；版本正文中的细分标题按 #1111 的规则不进入目录，正文及其锚点仍然存在。活动目录项与实际展开状态一致。
5. 点击目录、直接访问版本/子节/历史 section 锚点时，展开所属版本，等待布局更新后定位；支持编码后的中文 fragment。
6. 切换平台清理旧平台 fragment 和过时 platform 查询参数，保留其他查询参数；恢复新平台首个版本。不得破坏中文分支 #1213 的平台偏好保存及 URL 平台优先规则。
7. 兼容性说明、已知问题、公共提示等非版本内容保留在所属版本历史之外；日期型发布记录与英文同样折叠。

## 内容范围与边界

扫描发现 19 个相关页面，当前均未使用版本折叠；其中 Danmaku 页面只有 frontmatter，没有版本正文，保持原样。其余 18 个页面纳入逐项适配：

- AI 发版说明。
- RTC 发版说明：Android、iOS、macOS、Web、Windows、HarmonyOS、mini-program、Electron、Unity、Flutter、React Native、Unreal、Blueprint、React，共 14 个平台。
- RTC Web 插件：`rtc/build/extensions/web/release.mdx`，按插件分别组织版本历史。
- 云端录制、本地服务端录制、拉流、RTC Server SDK、RTM、RTSA。
- MetaKit、人像律动、实时转写、服务状态、用量分析。
- Fastboard、互动白板、灵动课堂、IoT aPaaS。

保持当前文件和平台分组结构，不为对齐英文而重命名中文路径。保留版本后缀如 beta/build，以及“之前”“前”等历史记录标题。单版本页面仍可使用同一约定，默认展开。

Fastboard 已有“示例代码”普通折叠块，适配后会位于版本内容之内；需验证嵌套展开、哈希归属及默认状态，不能将其误识别为版本。

## 共享实现

- `src/components/mdx.tsx`：复用 #1111 的 Accordion 标题封装、openFirst、多个展开值、平台重置和哈希展开。保留当前分支其余 MDX 参数、表格、链接、代码标签能力。
- `src/lib/docs-hash.ts`：引入哈希目标通知和布局提交后的定位，保留当前滚动容器与偏移规则。
- `src/components/docs-shell/DocsContent.tsx`：引入版本目录生成、隐藏细节标题、活动项判断与折叠状态观察；保留中文平台标识修复。
- `src/components/docs-shell/DocsContentBody.tsx`、`src/components/mdx/PlatformTabsGroup.tsx`：按参考 diff 核对状态重置及平台切换依赖，不覆盖当前平台偏好机制。
- `src/lib/mdx/accordion-toc.ts`：复用参考 PR 的版本标题提取，使服务端目录、搜索索引、机器可读 Markdown 使用同一版本元数据。
- `src/lib/docs-page.server.ts`、`src/lib/search/algolia-records.server.ts`、`src/lib/source.server.ts`：接入共享标题提取。参考 PR 的 Markdown 补全存在英文语言条件，中文出口也必须接入标题补全，同时保留中文既有源格式与链接处理语义。
- 包依赖仅按实际需要补齐。沿用中文分支已有 i18n；不为复制链接标签单独引入旧的翻译体系。
- 将版本折叠语法补入当前 Markdown authoring standard。

## 内容与锚点保真

先从既有处理链和实际页面确定版本及子标题 ID，再转换为显式的 Accordion id/value，保留既有 `<a id>` / `<section id>` 别名。平台重复版本、中文自动 slug、重复子标题后缀需按当前渲染规则处理，不能只凭版本名重新生成。

转换使用 Markdown/MDX 结构识别版本边界，跳过代码围栏、普通标题和普通折叠块。逐页比较转换前后版本顺序、正文、链接和锚点，避免批量文本替换误伤内容。未知结构先定位并单独处理，不静默丢弃。

## 验证策略

实现前基线：相关 MDX、DocsContent、docs-hash 测试 3 文件共 129 项通过；过程中出现一条 socket hang up 输出，未造成 Vitest 失败，不将它解释为功能通过的依据。

实现后：

1. 运行聚焦组件和集成测试，覆盖多个版本展开、动态首项、平台重置、版本和子节哈希、目录、搜索及中文机器可读 Markdown。
2. 内容保真检查覆盖所有适配页面及平台，确认版本/日期/正文/链接/锚点完整；正文中的普通折叠继续可用。
3. 浏览器桌面与移动端验证 RTC、AI、日期型更新记录及 Fastboard 嵌套折叠，记录文字结果，截图仅在本地忽略目录保存；在隔离的 global 区域预览验证英文页回归。
4. 运行 `bun run test`、`bun run types:check`、`bun run lint` 和 `VITE_DOCS_REGION=cn bun run build`；记录命令退出状态。遇到失败时固定基线复现，区分已有问题与新增问题。PR #1111 旧描述中的 31 项失败不能用作当前基线结论。
5. 保留可访问的本地预览，提供修改摘要、工作区/分支/SHA、页面链接和实际验证结果；需要查看测试截图时提供本地文件。

## 未来合入 main

按[合并执行指引](../agents/reports/2026-10-19-cn-release-notes-accordion-parity.md#后续合入-main)核对当前基线、共享模块、用户确认的标题订正及验收行为。该指引作为后续合并说明的维护入口，本设计记录原方案与权衡。

## 审阅点

用户已确认方案 A，以及覆盖全部现有中文版本历史（包含日期型记录和 RTC Web 插件）的范围。
