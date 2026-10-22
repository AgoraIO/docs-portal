# 中文文档无序列表缩进修复

日期：2026-10-22。分支：`codex/cn-newdoc-html-api-migration`，实施基线：`b33d5ebe3`。

## 结果

- 读取旧仓库全部 2,355 份 Markdown/MDX 文件，包括隐藏目录中的文档，忽略 `.git` 与依赖目录。
- 扫描新站 6,719 份中文 Markdown/MDX 文件、4,677 个顶层表格 Slot 定义。其中 3,180 个包含无序列表。
- 对照旧单元格、共享引用和平台内容后，修复 250 个文档中的 2,178 个槽位。最初筛出的 651 个槽位均完成核对和修复。
- 正文差异仅为行首缩进；文案、数值、顺序、链接、空行和元信息不变。
- 232 个修复后的槽位仍含有源内容支持的真实子列表，未统一拉平。
- 最终重新审计：0 个待修复、0 个文件需要变更；2,956 个槽位已验证一致，224 个未能安全建立来源对照的槽位保留原样。

224 是安全跳过数，不是已确认错误数：160 个缺少页面与旧源的可靠映射，60 个无法与当前旧源文字精确对应，4 个仅能匹配到无关页面。完整位置和原因保存在本地审计 JSON 中。正文列表与嵌套 Slot 的容器缩进不套用顶层表格去缩进规则。

## 根因

旧源 `shared/cloud-recording/pcw.mdx:35` 中 SD、HD、FHD 都缩进 6 个空格；`shared/cloud-recording/stream-number-limit.mdx` 的对应项目都缩进 4 个空格。

迁移函数 `normalizeSlotDefinitionContent` 直接对整个字符串调用 `.trim()`，只清除第一项前的空格，后续项目的容器排版空格仍留在 Markdown 中。它们被解析成子列表，随后正常的嵌套列表 CSS 又向右缩进一层。

浏览器修复前的 SD、HD、FHD 文字起点分别为 492px、508px、508px，差 16px。修复后两张配额表共 16 个单元格均为三个同级项目，起点差为 0px。

## 修改

- `scripts/migrate-legacy-docs.mjs`：在 Slot 内容转换和首尾清理前移除整块公共缩进，保留项目间相对缩进。
- `scripts/migrate-legacy-docs.test.ts`：通过实际转换入口验证 4、6、8 空格容器缩进，以及真实多层列表、续行和有序子列表。
- `scripts/audit-legacy-list-indentation.mjs`：逐项查对旧单元格；根据迁移元数据、path-map、产品内编码文件名、对应副本和共享依赖确定来源，必要时调用实际页面迁移入口展开旧内容。只有可证明的缩进差异可写回。
- `scripts/audit-legacy-list-indentation.test.ts`：覆盖来源冲突、后续编辑保留、真实层级、内容指纹、只读默认模式和幂等性。
- `scripts/fixtures/legacy-list-indentation-reviews.json`：逐项核对过的改名、动态字典与新版 SDK 例外；校验旧源单元格和目标修改前后的 SHA-256，避免以后套用到不同内容。
- `content/docs/zh-CN/**`：250 个文档，仅行首缩进。

生产 CSS、运行时渲染器及英文正文均未修改。

## 来源和内容保护

审计保留旧源位置、指纹、单元格原文、转换结果、目标前后内容，以及共享依赖指纹。自动比较可忽略已迁移链接的目标地址和等价 MDX 转义，但写回只取旧源证明的行首缩进，原有目标文字和 URL 保持原样。

全文或完整列表行无法对应、来源层级有冲突、包含代码块或只有无关来源时，不自动修改。人工核对的例外另有冻结的内容指纹。代码围栏中的示例以及嵌套 Slot 不作为顶层待修复定义。

同时比较 Markdown 块结构，避免为了无视觉差异的空格进行无关修改。写回逐文件断言：移除行首空白后，修改前后必须逐字相同。

## 验证

- `git diff --check` 通过；`git diff --ignore-all-space --numstat -- content/docs` 无输出。
- 迁移与表格 Slot 定向测试：221 个通过。
- `bun run types:check` 通过。
- 250 份修改过的 MDX 均通过 MDX 编译（包含 GFM、directive 和实际 Table Slot 插件），无编译失败。
- 审计再次运行无文件差异。
- 浏览器：配额页两张表的 16 个单元格均对齐；RTM Storage 表保留两个同级父项及两个真实子项，父项 x=923px，子项 x=939px。
- 390px 窄屏下页面无横向溢出，表格仍在自身容器内横向滚动。普通正文列表的 5 段长文本跨 2–5 行，续行与首行起点差均为 0px。

本地 `.env.local` 启用了中国站模式。直接全量运行时出现 68 个失败、3,625 个通过、2 个跳过，涉及英文站预期、区域路由、搜索等。已在独立的未修改 `b33d5ebe3` 基线副本中，用相同中国站模式复现其中全部 22 个路由／索引失败。

显式全局模式复测：3,693 个通过、2 个跳过、1 个失败。唯一失败是 `src/routes/-__root.test.ts` 的中国站品牌/favicon 切换用例；在未修改的 `b33d5ebe3` 基线全局模式下也复现相同用例失败。因此本次相关回归和类型检查通过，但不将全量套件表述为全绿。

临时基线副本位于 `/Users/yangyixuan/.codex/worktrees/list-indent-baseline/docs-portal`。验证后调用归档工具，应用返回 `This worktree is protected by a pinned task or workspace`，因此保留该副本；未绕过保护删除。JSON 证据另保存在主工作区。

```bash
VITE_DOCS_REGION=global bun run test src scripts --maxWorkers=4 --exclude '**/.agent/**' --exclude '**/outputs/**'
```

排除项用于避免 Vitest 误扫描工作区既有的本地快照与产物，未排除任何受维护的 `src` 或 `scripts` 测试。

## 本地产物与复跑

产物均保存在忽略的 `.agent/artifacts/list-indentation/`：

- `applied.json`：实施时每处修改的旧源证据及前后内容。
- `audit.json`：最终只读复查、保留位置及原因。
- `tests-global.json`：全局模式测试结果。
- `baseline-global-root.json`：未修改基线的同名失败用例。
- `mdx-compile.json`：250 份修改文档的 MDX 编译结果。
- `before-quota.png` / `after-quota.png`：配额页面前后截图。
- `after-real-nesting.png` / `after-mobile.png`：真实层级和窄屏截图。

```bash
node scripts/audit-legacy-list-indentation.mjs --source=/absolute/path/to/shengwang-doc-source
# 只有核对并准备写回时才添加 --apply；默认仅生成本地报告。
```

审计需要本地旧源；普通网站构建、类型检查和回归测试不需要访问该旧仓库。

## 其他观察

配额源文中的 `SD:100` 还会被现有 directive 语法解释，导致某个单元格的 `:100` 不显示；RTM 源内容中未转义的 `> 0` 还会呈现为引用。这些是独立于列表缩进的既有内容语法问题，本次保持原文并记录，未混入缩进回填。
