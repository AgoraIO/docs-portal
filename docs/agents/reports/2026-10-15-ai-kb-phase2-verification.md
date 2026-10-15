# AI KB 第二阶段本地实现与验收记录

日期：2026-10-15。工作区 `/Users/yuzhuopeng/.codex/worktrees/cn-ai-bot-kb-demo/docs-portal`，分支 `codex/cn-ai-bot-kb-demo`。Phase 2 基线 `7d70f8aa4`。原 CN-NEWDOC 工作区未修改；未 push/merge/deploy。

## 本地实现

- 官方接口示例驱动的百炼 HTTP 适配器：业务 envelope、上传凭据隔离、超时、分页、逐文档完成检查，写请求不自动重试。
- 目标指纹绑定的本地状态、同机排他锁、generation 校验、0600、fsync/rename；保存副作用意图及新旧远端 ID。
- 首次明确建库，之后仅导入变化文件；无变化零远端写；索引/检索双门槛；更新后清理旧受管文档并验证消失。
- preview/apply/resume CLI、只读 preflight、脱敏回执和输入/状态覆盖保护。

这份记录不代表真实云端验收通过。Metadata 完整语义在 corpus；云端只映射已确认字段，尚未验证标签筛选。

## 验证

初次本地定向回归：24 个文件，226 项测试全部通过（KB、scripts、普通搜索）；类型检查通过，Biome 26 文件通过，diff whitespace 检查通过。完整回归及独立审查结果见本记录后续补充。

实现前完整基线：2862 项，2823 通过、37 失败、2 跳过。失败名称与 Phase 1 记录一致，参见 [Phase 1 验证记录](2026-10-15-ai-kb-phase1-verification.md)。不把该红色基线报告成全仓通过。

## 云端与交付边界

没有创建 KB/类目/Key，没有上传/删除云数据，没有重置已有 Key。标准版向导此前显示 0.03 元/小时，模型/解析等可能另收费；实际付费创建前仍需明确费用与权限。账户登录信息不能代替 RAG API Key。

当前 worktree 没有完整发布构建；旧 demo 目录存在产物，但未找到可核实的同 revision 回执，不用旧产物冒充本次真实样本。暂未发起高成本全构建。后续需落实同 revision 普通文档、平台变体与 OpenAPI 样本。

CLI 尚未配置已验证的真实 retrieve verifier，因此上传与索引完成也只进入 verifying，非零退出且不更新成功投影。真实 MD5、ID 映射、任务协议、Metadata 检索筛选、回答引用及全量 CI/CD 均未验收。AI UI/模型问答是后续阶段。

## 实施取舍

- task helper 无执行位，手工保留同等 brief/RED/GREEN/ledger；不修改技能安装。代价为人工维护记录。
- selection 对完整范围可省略，对样本明确固定；换样本需新 scope，不能借此删除原范围内容。
- preflight 只证明读请求接受，不探测写权限；真正写权限留待隔离样本验证。
- 任务行的文件/文档映射采用官方示例可证明的路径，不相等就停止；如果真实返回不同，需要补可靠映射协议后验收。
- 未知写入无法找到唯一证据时停止人工对账，不按名字猜测、不盲重发；代价为部分失败不能全自动恢复。
- 不实现未经验证的 retrieve 接口，不伪造可检索结果；代价为当前 CLI 不能声称真实完整同步成功。

## 独立审查与修正

独立 reviewer 审查 `7d70f8aa4..dadce84c6`，自行复跑 226 项定向测试；无 Critical/Minor，提出三项 Important，均接受并修正：

1. 旧语料能反向覆盖新版：持久化接受的 revision/语料摘要，副作用前拒绝同 revision 内容漂移；不同 revision 默认拒绝，CLI 用 Git 祖先关系验证向前切换。pending 必须匹配原始整份语料。代价：浅历史或分叉需补齐历史或人工对账，不能自动回滚。
2. 中断 apply 回执误报 preview/零写入：执行前先写 applying/remoteWrites:null，子进程测试在替身 fetch 已被调用后 SIGKILL，验证仍保留 applying 和 lease 意图。
3. 安全错误/请求证据丢失：pending 保存筛选后的 errorCode/requestId；适配器提供成功 requestId 回调，CLI 先持久化再返回上层；回执包含这些字段，不含原始错误。

三项回归均观察到修正前失败，修正后通过；成功 requestId 收集另有 RED→GREEN 测试。修正后定向测试 230/230、types:check、Biome26文件通过。

reviewer 列出的未判断范围均保持原验收边界：真实付费资源与 Key 权限、MD5 与 ID 实测、retrieve/Metadata 真实效果、多机 CI 持久化、AI UI/API 与全量部署尚待完成；原有全仓失败另行按同名逐项比对，不计入本功能修复。

最终完整回归：2919 项，2880 通过、37 失败、2 跳过；37 项失败按文件/完整测试名与实现前基线集合完全一致，无新增失败。基线完整名单见 Phase 1 报告。完整套件仍为红色，不宣称全仓通过。
