# 中文 hotfix 新增文档 301 实施记录

日期：2026-11-18。基线：`e17fff8485d1d81c96103a52c499f791ff94e02c`；分支：`codex/cn-hotfix-new-doc-301`；目标：`codex/cn-newdoc-html-api-migration`。

已将[审计清单](./2026-11-18-hotfix-new-doc-redirect-audit-missing-301.csv)中的 703 个旧 URL 加入现有 reviewed 表。源集合与清单完全一致，既有 98 条 reviewed 映射保持不变。当前 703 条映射对应 475 个实际目标，其中 82 条根据已有多个 structured 平台正文直接选择平台路径；初始清单的 422 个目标按当时合并页统计，两者口径不同。

应用的 `/doc/*` 和 `/api-ref/*` loader 返回 HTTP 301，保留来源查询参数和有效锚点。Vercel 的 905 条常规 redirect 中包含全部 703 个精确入口，位于旧站兜底规则之前；Nginx 新规则使用 `$is_args$args` 保留查询参数。Vercel 旧站交付清单也将这批记录的 `preserveQueryParams` 设为 true。

原 2026-10-14 inventory、2026-10-15 candidate 及目标路由快照未改写。Finalizer 校验当前正文、透明路由分组及多平台 structured 虚拟路径，再追加 `reviewed-hotfix-addition` 记录。最终交付清单共 8,924 条：7,822 条 301、1,100 条退役、2 条无需跳转。

## 验证

- 新增源路径和平台路径先复现失败，再修复并通过回归；额外确认 Inline、单平台及未知平台不产生不存在的虚拟路径。
- 全部 703 条入口及其尾斜杠形式逐条调用实际 route loader，验证 301 状态和 Location；验证来源查询参数、重复参数和中文锚点。
- `bun run types:check`、`bun run shengwang-redirects:check`、`bun run legacy-redirects:check` 通过。
- 修改的 8 个脚本/路由/测试文件的 Biome 检查通过。全仓 lint 保留基线已有的 9 个 hook factory 错误，位于未改动的 `src/components/mdx.tsx`、`src/components/docs-shell/DocsShell.test.tsx`、`src/components/docs-shell/DocsSidebarTree.test.tsx`；另有 22 个 warning、3 个 info。本次未改变这些文件、依赖或 lint 规则。
- `bun run test --maxWorkers=4`：370 个文件通过、1 个跳过；6,113 项通过、23 项跳过、0 失败。
- 独立审查：`redirect_review`。发现的平台校验边界 P2 已修复并复核；独立 finalizer check 和 11 项 fixture 回归通过，未发现剩余问题。

## 范围边界

保留审计中已有覆盖的 57 条旧 URL；没有将 12 个待 #1443 合入的入口、2 个隐藏页、3 个无对应正文页、20 个退役入口或范围外项加入本批。#1443 仍未合并，RTM Web 两条映射暂用当前 `/best-practice/web/` 路径；与 #1443 合流时需改为其统一平台页，finalizer 当前目标检查会阻止指向已删除页面。

仅修改中文旧入口路由和交付产物，不修改 API 正文、渲染器或页面布局；未运行完整生产构建或浏览器逐页阅读。本地检查不表示生产已经部署这批规则。
