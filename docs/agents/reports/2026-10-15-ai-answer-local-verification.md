# CN AI-Bot 本地问答链路验证

日期：2026-10-15。分支：`codex/cn-ai-bot-kb-demo`；基线 `11c8a658f`。实现提交：`2c87bab0b`、`dcb016d66`、`336ac5c18`、`2dbaee90f`。

## 交付

- 可注入检索/生成的问答编排器，校验 corpus、受控来源、产品/平台/版本/类型、原文片段和引用 ID；无证据不生成，未知引用拒绝回答。
- 独立 POST `/api/ai/answer`，普通与 service 路由树均注册。默认关闭；当前只实现显式 local-demo 的本地关键词摘录，production 拒绝启用。没有真实百炼检索或模型实现。
- 新版搜索页的可选问答面板，等待、取消、关闭、重试、无依据、引用与受限 Markdown 展示；默认入口隐藏。没有修改普通搜索 API、Meili 索引、导出或发布。
- 请求最大 16KiB、问题 2000 字符、最多 6 段/段 3000 字符、15 秒总时限，取消可打断等待。语料最多 100 篇/20MiB，无凭据、上传、云写入或收费服务调用。

运行方式及接入边界见 `docs/ai-kb-demo.md` 第三阶段。

## 验证结果

- 新增 34 项测试全部通过：编排 10、HTTP/本地适配 14、客户端 3、面板/安全渲染 6、新搜索页集成 1。
- 最终完整 `bun run test`：2953 项，2914 通过、37 失败、2 跳过。按文件路径和 fullName 与 Phase 1 的完整 37 项基线名单比较，新增失败 0、消失失败 0。仍是红色全仓门禁，不称全仓通过；每项失败名称见 `2026-10-15-ai-kb-phase1-verification.md` 完整基线清单。
- `bun run types:check`、`bun run build:service`、相关 17 个文件的 Biome 检查、`git diff --check` 通过。Biome 有一条测试字符串模板的 info，无错误。
- 真实构建产物启动：development + 显式 local-demo 配置，POST 返回 200、local-demo、摘录和引用；相同配置下 NODE_ENV=production 返回 503。临时服务已停止。
- 浏览器访问新版 `/zh-CN/search`，显式开启入口，完成打开面板、输入“旧内容”、提交、摘录及引用展示。截图 `/tmp/cn-ai-bot-local-answer-2026-10-15.png`。浏览器 smoke 使用 Phase 1 的 synthetic-offline-demo corpus；路径是合成示例，未用其验收真实文档来源或有效页面跳转。页面明确声明未接入百炼和模型。
- 当前本地没有配置可用的 Meili 搜索服务，浏览器普通搜索提示暂不可用。普通搜索模块/页面回归测试通过，但不据此声称本地真实索引端到端可用。

初次全仓执行与新增 deadline 测试的 RED 阶段重叠，出现 38 项失败，其中 37 为基线、1 为新增超时用例。修复后重新执行完整套件得到上述最终 37 项结果，未忽略该新增失败。

## 独立审查及修复

独立 reviewer 在 `11c8a658f..336ac5c18` 检查了来源/筛选、引用、异步旧响应、恶意 Markdown 和默认关闭/service 注册。发现 1 项 P2：原文截取可能从 fenced code 中间开始或截断结束围栏。两项真实适配器 + Markdown AST 复现用例先失败再通过；现在按完整 Markdown 块选摘录，过大的代码/列表/引用块跳过，不截断围栏。

浏览器另发现 srvx NodeRequest 无法直接交给 Node 原生 `new Request(req)`：Undici 的私有状态不兼容，原来返回 503。用真实 srvx NodeRequest 写复现测试，先 503 失败，再改为保留原请求流、独立传递 deadline signal，测试和实际构建产物均返回 200。临时诊断日志已移除。

暂缓 Minor：本地中文连续短语采用字面匹配，召回有限；这不是语义检索评测，后续百炼真实检索需单独验收。

## 决策、环境限制与剩余验收

- 延续用户批准的架构和“先不建库，继续本地链路”的明确指令，采用 native 执行，没有重复请求许可。代价：实现细节由当前分支和独立审查记录供复核。
- 真实同步 Task 5 保持未完成，本地摘录只验证工程链路。代价：KB 数据写入、Metadata、检索和模型回答质量仍需真实联调。
- worktree 的 node_modules 是外部软链接，Vite 默认加载边界拒绝实际存在的依赖文件。本次通过 `.superpowers` 临时配置允许当前 repo 和该依赖实际目录，未修改 tracked Vite/部署配置。代价：此 checkout 的本地启动需要临时配置或独立依赖安装。
- 过大的结构块直接跳过以保留代码结构。代价：本地 demo 可能返回 no-evidence；不能视为云端切块策略已定。
- 未 push、创建 PR、merge、部署；原 CN-NEWDOC 工作区未修改。没有创建 KB、API Key 或上传文档。
- 后续：同 revision 的已发布真实样本、百炼独立 KB/权限、真实 retrieve/模型适配、Metadata 筛选、真实链接及回答质量、CI/CD/网关与约定全量链路，分别验收。
