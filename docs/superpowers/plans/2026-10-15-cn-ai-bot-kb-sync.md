# CN AI-Bot 百炼增量同步 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将已实现的离线语料/增量计划接到新建独立百炼 demo 库，支持可追踪的样本导入、更新、受管删除和失败恢复。

**Architecture:** 保留 Phase 1 corpus 和纯 planner。新增百炼协议适配器、目标绑定的持久化状态与排他锁、同步状态机和显式 CLI。先保存意图再写远端；解析/索引及可检索验证完成后更新成功投影；结果未知时停止自动写入并要求对账。

**Tech Stack:** TypeScript ESM、Bun、Vitest、Node crypto/fs、原生 fetch，无新增云 SDK。

**Spec:** `docs/superpowers/specs/2026-10-15-cn-ai-bot-kb-demo-design.md` 第 3–5、8–9 节；具体已核实协议见 `docs/agents/reports/2026-10-15-ai-kb-phase2-contract.md`。

## Global Constraints

- 在 `codex/cn-ai-bot-kb-demo` 的 `5dad5ced7` 上继续，不切换原有 CN-NEWDOC，不恢复旧搜索代码。
- 普通搜索的界面、查询 API、索引及发布方式延续现状。
- 用户已选择新建独立 demo KB；名称建议 `cn-ai-bot-demo`，只在北京地域、当前已确认业务空间创建。独立上传类目同名，不接管已有库。
- 控制台已展示标准版 0.03 元/小时；真实创建前须取得费用确认，且不能声称涵盖模型/解析等全部费用。API Key 的专用名称不等于按 KB 限权。
- 首次只用明确选定的少量已发布真实文档，完整样本 selection 固定；正式全量另设 scope/目标，不能拿样本状态删除全量内容。
- 凭据不进入仓库、命令参数、日志或回执。已有 Key 不重置。创建凭据、授权变更遵守平台确认要求。
- 本计划的本地状态仅保证同机单进程串行；外部 CI 的持久化后端、多机锁和部署另外验收，不宣称本地文件等同 CI 状态。
- 官方文档 fixture 测试与真实账号实测分别记录。缺真实凭据或协议不匹配时保留未验收状态，不用 mock 冒充成功。
- 更新采用新增新版本后清理受管旧版本，可能短暂双版本，不承诺原子替换。删除仅针对持久化状态记录且确认归属的 demo 对象。

## Review Focus

1. HTTP 200 但业务失败、不同接口组 envelope 差异：不推进成功状态（Task 1）。
2. 任意写请求发送后、保存返回 ID 前进程退出：恢复时对账或停止，不盲目重发（Task 2/3）。
3. 旧计划、不同 KB/业务空间/selection、并发两个 CLI：拿锁重读并拒绝不匹配（Task 2/4）。
4. 任务 COMPLETED 但逐篇失败/缺页、上传成功但不可检索：不得标记同步成功（Task 1/3）。
5. 更新新版本成功后旧版本清理失败：保留新旧 ID 和 cleanup-pending，后续只继续清理，不重复上传（Task 3）。

## 文件与接口

| 文件 | 职责 |
| --- | --- |
| `src/lib/ai-kb/bailian-config.ts` + `.test.ts` | 目标配置、域名/来源 URL 校验、稳定目标身份 |
| `src/lib/ai-kb/bailian-client.server.ts` + `.test.ts` | HTTP 协议、按接口组验证 envelope、超时及分页；不直接修改状态 |
| `src/lib/ai-kb/sync-state.server.ts` + `.test.ts` | 本地快照、写意图、锁、generation 与成功状态投影 |
| `src/lib/ai-kb/sync.server.ts` + `.test.ts` | 计划执行和状态转换，注入适配器、时钟、校验器 |
| `scripts/ai-kb/preflight-cn.ts` | 只读验证目标和权限，不写云数据 |
| `scripts/ai-kb/sync-cn.ts` + `.test.ts` | 预览、初始化/执行/恢复 CLI 和脱敏回执 |
| `docs/ai-kb-demo.md` | 配置、运行与恢复手册 |
| `docs/agents/reports/2026-10-15-ai-kb-phase2-verification.md` | 真实/模拟验收分开记录 |

内部方法：

```ts
export type KbTarget = {
  schema: 1; environment: 'local-demo'; region: 'cn-beijing';
  workspaceId: string; categoryId: string; indexId?: string;
  name: string; origin: string; scope: string; selection: string[];
};
export type RemoteDocument = {
  fileId: string; documentId: string; jobId: string;
};
export type PendingOperation = {
  id: string; sourceId: string; desiredHash: string;
  phase: 'prepared' | 'uploading' | 'registered' | 'importing'
    | 'verifying' | 'cleanup-pending' | 'done' | 'needs-reconciliation';
  fileId?: string; documentId?: string; jobId?: string;
  oldRemote: RemoteDocument[]; newRemote: RemoteDocument[];
};
```

`fileId`、`documentId`、`jobId` 分别存储，不以示例值相同为由混用。target identity 对 environment/region/workspaceId/categoryId/indexId/scope/selection 的规范序列化取摘要；bootstrap 从无 indexId 绑定到明确新 ID 只允许一次，保留运行 ID 与创建回执。

### Task 1: 配置、只读 preflight 与百炼协议适配

- [ ] 写失败测试，覆盖目标域名只由 workspaceId/region 构造；origin 必须 HTTPS 且无凭据/query/hash；库列表、文件列表和任务状态按接口自己的分页字段调用；业务失败不能通过。

```ts
it('rejects a business failure returned with HTTP 200', async () => {
  const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({
    code: 'InvalidParameter', status: 400, message: 'bad input',
  }), { status: 200 }));
  const client = createBailianClient({ workspaceId: 'llm-test', apiKey: 'test-only-key', fetch: fetcher });
  await expect(client.listFiles({ categoryId: 'cate-test' })).rejects.toThrow('InvalidParameter');
});
```

- [ ] Run `bun run test src/lib/ai-kb/bailian-config.test.ts src/lib/ai-kb/bailian-client.server.test.ts`；预期新增模块尚未存在而失败。
- [ ] 实现 `createBailianClient({workspaceId,apiKey,fetch?,timeoutMs?})`，方法：`listFiles({categoryId,fileName?,nextToken?})`、`lease({categoryId,fileName,bytes})`、`putFile({lease,bytes})`、`registerFile({leaseId,categoryId,tags,originalFileUrl})`、`createIndex({name,fileIds})`、`submitImport({indexId,fileIds})`、`jobPage({indexId,jobId,page})`、`documentPage({indexId,page})`、`deleteDocuments({indexId,documentIds})`。具体 body/path/envelope 按已核实报告及各官方页面逐项定义，响应运行时校验。
- [ ] 租约 MD5 先按文档文字 Base64 构造；返回协议差异显式报错，禁止尝试多种编码重复写。PUT 仅发送返回 headers 与原始 bytes，不携带 Bearer、不跟随跨域重定向、不打印预签名 URL。所有写请求零自动重试；只读查询可有限退避。
- [ ] 明确 `DATA_CENTER_FILE/docIds`，拒绝空文件列表；逐页 task rows/documents 去重，重复页、total_count 不一致或未覆盖目标均失败，不将未知状态当 FINISH。
- [ ] 补上传 headers 隔离、分页、COMPLETED+逐篇失败、缺失 ID、错误 JSON、超时、401/429/5xx 测试，全部通过后提交 `feat: add Bailian KB protocol adapter`。

### Task 2: 目标绑定的持久化状态与进程锁

- [ ] 用临时目录写失败测试：跨进程锁竞争、持久化后重新打开、CAS 旧 generation、错误目标拒绝、不完整 JSON 拒绝、锁释放。

```ts
it('rejects another writer and preserves committed state across reopen', async () => {
  const first = await openSyncStore({ directory, target });
  await expect(openSyncStore({ directory, target })).rejects.toThrow(/lock/i);
  await first.save({ ...first.snapshot, generation: 1 }, 0);
  await first.close();
  const reopened = await openSyncStore({ directory, target });
  expect(reopened.snapshot.generation).toBe(1);
  await reopened.close();
});
```

- [ ] Run `bun run test src/lib/ai-kb/sync-state.server.test.ts`；预期模块缺失失败。
- [ ] 实现 `openSyncStore({directory,target})` 返回 `snapshot/save(next,expectedGeneration)/close()`。目录显式指定并限制本地磁盘；锁文件 exclusive create，正常退出释放，崩溃锁不按时间自动抢占。快照使用同目录临时文件、fsync、rename、目录 fsync，文件权限 0600。不得将 Key 或预签名 URL 写进快照。
- [ ] 每条 pending 保留写意图、来源和目标摘要、新旧对象 ID、调用阶段与经过筛选的错误码/requestId；不保存任意服务端错误全文。成功投影兼容 Phase 1 `KbSuccessfulState`，只有 done 条目进入投影。
- [ ] 每次远端副作用前保存阶段与意图，返回 ID 后立即持久化。存储失败立即停止后续云操作；恢复时看到未完成写意图进入对账，不能重新当作 prepared。
- [ ] 补断电式中断、原快照不可变、符号链接目录/输入覆盖防护、错误 indexId 和 selection 测试，绿后提交 `feat: persist KB sync intent and target state`。

### Task 3: 增量同步与保守恢复状态机

- [ ] 写端到端状态机失败测试，fake adapter 记录可观察的远端调用序列和现存对象；不是只断言内部函数被调用。

```ts
it('resumes old-version cleanup without uploading the new version again', async () => {
  const adapter = fakeBailian({ failFirstDeletion: true });
  await expect(runKbSync({ corpus, store, adapter, verify })).rejects.toThrow();
  const uploads = adapter.uploaded.length;
  await runKbSync({ corpus, store, adapter, verify });
  expect(adapter.uploaded).toHaveLength(uploads);
  expect(adapter.liveDocumentIds()).toEqual(store.successfulDocumentIds());
});
```

- [ ] Run `bun run test src/lib/ai-kb/sync.server.test.ts`；预期模块缺失失败。
- [ ] 实现 `runKbSync({corpus,store,adapter,verify,deleteApproval?})`。持锁重读投影后调用既有 `planKbSync`，不接受外部旧 plan 直接执行。无变化零远端写入。
- [ ] 首次 bootstrap 保存创建意图，仅导入本次明确 IDs；创建响应与 jobId 持久化。超时未知创建不重试、不按同名库自动接管。类别和 KB ID 必须由控制台/明确响应绑定。
- [ ] 新增：上传→注册→导入→逐文档 FINISH→`verify({target,document,remote})` 通过→done。更新：先完成新版本，再清理受管旧版本并查询确认消失，最后 done。清理失败保留 cleanup-pending 与双版本 ID。
- [ ] 对登记/导入未知结果，分页读取已有目标对象与任务证据；证据必须唯一且与持久化意图匹配。仅名称相同、MD5字段不存在或找不到记录均不足以证明可以重试；无法确认就持久化 needs-reconciliation 并非零退出，保持旧成功状态。禁止声称 exactly-once。
- [ ] 真实 verifier 必须基于已验证的 retrieve 接口或控制台实际检索回执；无 verifier 不写 successful。直接检索协议不足时允许导入保持 verifying，但不得把其投影为已成功。
- [ ] 删除入口只接受本次目标的受管文档 ID，必须存在显式审阅的删除集合并和重算计划完全一致；空/不完整 corpus、scope 不同、数量异常下降均停。Phase 1 的 deletionBlocked 不自动解除。真实不可恢复删除另遵平台确认规则。
- [ ] 补 Task Review Focus 2/4/5、首次创建未知、部分成功重启、清理响应为空但旧对象仍存在、证据歧义测试；绿后提交 `feat: execute recoverable KB document deltas`。

### Task 4: CLI、预览与回执

- [ ] 通过真实 Bun 子进程运行临时状态目录写失败测试：预览零云写、缺 Key 时失败且不泄露值、错误 scope/indexId 失败、进程锁和中断后的恢复。

```ts
expect(preview.status).toBe(0);
expect(preview.receipt.remoteWrites).toBe(0);
expect(missingKey.status).not.toBe(0);
expect(JSON.stringify(missingKey)).not.toContain(testApiKey);
```

- [ ] Run `bun run test scripts/ai-kb/sync-cn.test.ts`；预期入口不存在失败。
- [ ] 增加 `kb:preflight:cn` 和 `kb:sync:cn` 命令。参数为 `--config/--corpus/--state-dir/--receipt`，执行必须显式 `--apply`，否则只预览；Key 仅来自 `BAILIAN_API_KEY` 环境变量。preflight 仅读当前目标和权限，不建库/类目/上传。
- [ ] 不直接接受 scope 或 indexId 的覆盖参数绕过状态目标绑定。缺失状态不能自动假定现有远端空库；bootstrap 为明确的新库模式。回执记录 revision/target identity/counts/status/requestIds，不包含 Key/租约 URL。
- [ ] 文档给出 preview、apply、resume、needs-reconciliation 和崩溃锁人工检查说明。sample selection 调整需要显式新 scope，不能复用原状态删旧样本。
- [ ] 测试绿后提交 `feat: add explicit KB sync CLI and receipts`。

### Task 5: 独立账号样本验证与交接

- [ ] 确认可调用的 RAG API Key 注入途径，不重置旧 Key、不在聊天发送明文；若需新建专用 Key，在最终提交创建前确认精确权限和作用域。
- [ ] 在用户已授权的新建独立 demo 目标下准备类目与 KB。库 API 创建需非空首批 fileIds；若用 UI 创建则记录真实库 ID，不另重复 API bootstrap。
- [ ] 从同一 revision 的真实发布产物选择普通文档、平台变体与 OpenAPI 样本并导出；保留来源/revision/selection。无可核实产物则报告真实语料验收未完成，不把合成 fixture 当替代。
- [ ] 实测 MD5 编码、响应 envelope、fileId/doc_id/jobId、解析/索引与可检索验证、Metadata 可写字段和筛选；把真实字段形状脱敏后补协议 fixture。与官方示例冲突时先停写、记录事实并修正适配器测试。
- [ ] 验证首导、无变化、仅 revision 变化、修改一个样本、受管删除、断点恢复；更新完成后旧内容不再召回。删除只在这次 demo 的明确对象范围内操作。
- [ ] Run `bun run test src/lib/ai-kb scripts/ai-kb src/lib/search`、`bun run types:check`、完整 `bun run test`、针对变更的 Biome 和 `git diff --check`。完整失败与 `5dad5ced7` 已记录 37 个失败逐项比较。
- [ ] 独立整体审查后修正重要问题，保存 `2026-10-15-ai-kb-phase2-verification.md`；区分本地测试、账号实测、外部 CI/CD，提交阶段报告，不自动 push/merge/deploy。

## 计划自审与执行方式

- 复用已批准总体设计；没有重写普通搜索或扩大到 AI UI。
- 五项 Review Focus 分别落实到对应测试；配置、协议、存储、执行、CLI 的职责分别可测。
- 云端 Metadata 和检索尚未实测的部分以显式验收 gate 表达，不伪造已支持能力。
- 结果未知无法自动判定时安全停止，是当前 demo 的明确限制；该限制必须出现在回执及交接，不称自动恢复全部情况。
- 延续 Native 执行方式，末尾一次独立审查。先完成本地可测实现，再进行明确目标的真实写入；凭据配置不阻塞纯协议/存储测试。

## 2026-10-15 执行检查点

Task 1–4 的本地实现、测试与独立整体审查修正已完成；见 Phase 2 verification 报告。Task 5 的真实云端/同 revision 样本验收仍未完成，待 API Key、费用和实际目标绑定落实。上述未勾选的实测条目不以本地 fixture 替代；不把此检查点称为第二阶段整体完成。
