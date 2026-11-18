# 中文 hotfix 新增文档 301 实施记录

日期：2026-11-18。分支：`codex/cn-hotfix-new-doc-301`；目标：`codex/cn-newdoc-html-api-migration`；PR：[#1444](https://github.com/AgoraIO/docs-portal/pull/1444)。

## 当前范围：包含先行合入的 #1443

用户后续明确 [#1443](https://github.com/AgoraIO/docs-portal/pull/1443) 会先合入，因此在初始 703 条上增加该 PR 的 12 条旧入口，合计 **715 条**。新增部分为 5 个 RTM Native 平台 × 2 篇最佳实践、在线状态 FAQ，以及 RTC Web IAgoraRTCServicePlugin API。

[当前已配置清单（715 行）](./2026-11-18-hotfix-new-doc-redirect-implemented.csv)逐项记录最终目标。715 条源地址由原审计中的 703 个缺项和 12 个 pending 项组成，当前对应 487 个实际目标；94 条明确选择 structured 平台路径。原审计两个 CSV 保留初始快照与当时状态。

本地验证基线为中文分支 `e17fff8485d1d81c96103a52c499f791ff94e02c` 加上 #1443 head `b9900b93183eeb21078634b0eb93587db91d7d86`。本地已整合该前置内容，GitHub 上未执行合并。合并顺序是 **先 #1443，再 #1444**；#1444 在前置 PR 合入前会包含其内容，前置合入后应使用最新中文目标分支核对最终差异。

RTM Web 两条旧 URL 已改为 `/realtime-media/rtm/best-practice/{voice-room,one-to-one-call}/web`；Android/iOS/HarmonyOS/C++/Swift 分别指向相同统一页面的对应平台路径，不再依赖已被 #1443 移走的 `/best-practice/web/` 文件。

## 行为与交付

`/doc/*`、`/api-ref/*` 及新增 `/faq/*` loader 从 reviewed 表读取目标并返回 301，保留来源查询参数和有效锚点。未知 FAQ 继续返回 404。新 FAQ 路由的 route tree 由 Vite 自动生成。

应用与 Vercel/Nginx 交付清单保持同一份 reviewed 映射。原有 98 条 reviewed 映射保持不变（本轮调整的是上一批新增的两条 Web 映射）。当前 reviewed 共 813 条，常规 Vercel redirect 共 919 条（含 #1443 增加的两条旧 Web 路径兼容规则）。新 Nginx 规则使用 `$is_args$args` 保留查询参数。

2026-10-14 inventory、2026-10-15 candidate 及目标路由快照未改写。Finalizer 校验当前正文、透明路由分组及多个有效 structured 平台构成的虚拟路径，再追加增量记录。最终交付清单共 8,936 条：7,834 条 301、1,100 条退役、2 条无需跳转。

## 验证

- 本轮先复现旧 Web 目标在 #1443 基线上不存在，再补齐 12 条和调整两条 Web 路径。
- 全部 715 条入口与尾斜杠形式逐条验证实际 route loader 的 301 和 Location；覆盖未知 FAQ 404、重复查询参数和中文锚点。
- 本轮定向 3 文件、37 项通过；类型检查与两个 redirect 产物检查通过。
- 上一批验证快照（提交 `27707bdb9`，仅 703 条）：370 个文件通过、1 个跳过，6,113 项通过、23 项跳过；类型、产物检查及修改文件 Biome 通过。该结果不代替本轮包含 #1443 的验证。
- 全仓 lint 仍有 9 个基线 hook factory 错误、22 个 warning、3 个 info；redirect 修改文件检查通过，不宣称完整 lint 通过。
- 本轮独立审查复核通过：12 条新增及两条 Web 调整与真实目标、三个运行时入口和交付产物一致；独立两套 redirect check 与 3 文件 37 项测试通过。本轮 `bun run test --maxWorkers=4`：372 个文件通过、1 个跳过，6,162 项通过、23 项跳过、0 失败。

## 范围边界

已有覆盖的 57 条旧 URL 不重复添加；隐藏的 2 页、无对应正文的 3 页、20 个退役入口和范围外项仍未纳入。本轮独有改动为旧入口跳转和交付产物；#1443 的正文仅作为前置内容集成，未另改其语义。未运行完整生产构建或浏览器逐页阅读，未部署。
