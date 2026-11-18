# 中文 RESTful 请求示例 URL 与 Query 对齐

日期：2026-11-17。实现基于 `472e0250ff2c4a61bf7a0f10a472628192b33f31`。本文保留提交前候选的验收记录，实际修复提交见本 PR；尚未发布。下列 head/build 回执是其所记录快照的证据，不能冒充后续 PR HEAD 的发布验收，提交后的 CI/预览需产生新的对应证据。

## 问题与修改

用户对比旧站与 staging 的 ConvoAI `list` 发现请求示例不同。排查覆盖当前发布的 14 条中文 RESTful lane、126 个 HTTP endpoint。9 页共遗漏 17 个 Query 参数，其中 8 页遗漏带默认值的参数，另 1 页遗漏没有 schema 的必填参数；另有 24 页的 Query 取样值不同，与 9 页有交集。补查全部请求 URL 后，又发现实时转录翻译 5 页的中文接入点仍为全球地址。

旧、新 YAML 的相关参数定义均保留；差异发生在请求代码生成阶段。旧站 `src/components/restful/utils.ts` 使用 `required || value || schema.default` 选择参数，以 `value || schema.default || ''` 取值。Fumadocs 默认示例生成没有采用同一规则。

本次在 `src/lib/openapi/request-examples.ts` 的中文 legacy 上下文中恢复该 Query 规则，覆盖 cURL、Python Requests、Node.js Fetch 共用的 URL 输入。保留未声明的 URL 参数和查询鉴权字段；参数引用及 path/operation 参数均由上下文读取。英文仍使用原有生成规则。参数、required、Header 示例和请求 Body 保持原样；另将 `content/openapi/speech-to-text/v7.zh-CN.yaml` 的唯一 server 从 `https://api.agora.io` 恢复为旧源的 `https://api.sd-rtn.com/cn`。旧 `html-docs/speech-to-text/RESTful/v7.yaml` 与现有中文快速开始等多处代码都明确使用这一中国区接入点，属于迁移来源保真修复；英文 YAML 未修改。

旧站对 `0` / `false` 使用 truthy 规则：可选参数没有其他真值时不显示，必填参数显示空值。此次明确保留既有输出，不借展示修复改变 API 语义。`metric` 保留为 `metric=`；权威 YAML 的 schema 补齐应由 API 内容负责人另行确认。

## 受影响页面

| 页面 | 恢复的旧站 Query 项 |
| --- | --- |
| `conversational-ai/list` | `state=2&limit=20` |
| `conversational-ai/turns` | `page_index=1&page_size=50` |
| `speech-to-text/list` | `state=2&limit=20` |
| `agora-analytics/call-list` | `page_no=1&page_size=20` |
| `agora-analytics/call-sessions` | `page_no=1&page_size=20&exclude_server_user=true` |
| `agora-analytics/realtime-usage-top20` | 必填的 `metric=` |
| `voip-callkit/list-expiring-licenses` | `page=1&size=100` |
| `voip-callkit/list-license-renewals` | `page=1&size=100` |
| `whiteboard/restful/list-rooms` | `limit=100` |

实时转录翻译的 `join/query/leave/update/list` 五页接入点同时恢复，路径和参数不变。

24 页取样差异也按同一规则恢复，包括旧站必填 Query 的空值。此处对齐 Query 的结构与值，不要求新旧代码格式、引号风格及 Header 示例占位符逐字相同。

## 独立预期与回归

`src/lib/openapi/fixtures/legacy-cn-request-queries.json` 固定了全部 126 页的旧站 Query 预期及规范化 URL 模板，记录旧仓库 `8fd46d74070a18dcb46ef943f6d6768590be9bca`、14 个旧 YAML 及旧 renderer 的 SHA-256。测试不调用修复后的上下文计算预期。

独立审阅者使用旧仓库 `convertYamlObjectByOperationId` 再次解析全部 126 页（包含引用和旧参数去重），并重新计算旧站 Query 预期：fixture 差异 0，全部源哈希匹配，未发现实际代码缺陷。新增 URL 模板从旧源的 server 与 operation path 构造，占位符规范化为 `:name`，并单独重新核对；不恢复旧渲染器意外编码的 `%7Bappid%7D`。旧解析器遇到重名参数时首次出现优先；新上下文遵循 operation 覆盖 path 的 OpenAPI 规则。现有 126 页没有同名 Query 冲突，因此不影响本次保真。

新增回归包括：

- 全部 126 页实际 Fumadocs 组件 SSR 的 cURL URL（接入点、路径、Query）与独立 fixture 比较。
- ConvoAI `list`、STT `list`、`call-list`、`realtime-usage-top20` 四页分别切换 cURL、Python、Node.js，检查默认值、取样覆盖及必填空值。
- 英文组件继续采用参数层显式示例。
- 单元检查 refs、继承、大小写、operation 覆盖、可选参数省略、0/false、输入不可变，以及查询鉴权与普通 Query 同名时的处理。

生成器、fixture 和测试已纳入共享文件清单；单元测试加入 `test:api-quality`。

## 验证记录

- 新测试在修复前失败，反映字段遗漏和错误取样；修复后聚焦测试 2 个文件、16 项全部通过。接入点回归单独经历失败（5 个 STT URL 不匹配）到通过。
- `bun run types:check` 通过，改动文件的 Biome 检查通过。
- 中、英文 source QA 均为 0 个新缺陷，2 个已记录的重复标题，0 个过期豁免。
- 接入点修正前的完整测试在隔离本机 `.env.local` 后通过：368 文件通过、1 文件跳过；6080 项通过、23 项跳过。命令为 `node node_modules/vitest/vitest.mjs run --config .agent/artifacts/request-example-audit-2026-11-17/clean.vitest.config.ts --maxWorkers=4`；该临时配置仅继承仓库配置并设置 `envDir: false`。
- 接入点修正前同样隔离本机环境后，现有 `test:api-quality` 定义的 42 文件、606 项测试全部通过。原始 `bun run test` / API 质量命令受本机 `.env.local` 注入的站点/搜索配置影响，分别出现 70 / 3 项失败；无需修改相关测试或站点逻辑，隔离环境即全部通过。
- 接入点修正前的中文生产构建通过：6170 payload、7442 machine-readable、7206 route HTML。默认 Chrome150 发生 Runtime.evaluate 超时，换用本机 Chrome157 并关闭后台节流后可继续全量检查，期间已完成的页面无新增问题；该旧候选扫描因接入点修正主动终止，不能作为最终候选的全量验收。
- 最终候选 source 指纹为 `933d9ba9c1832be9d824b041865a8a164237e82a0cdde29d437d7c64bf537a19`。隔离本机环境后，全套 6081 项通过、23 项跳过（368 文件通过、1 跳过），类型检查通过；双检出共享 49 项比对通过，独立 global 工作树 API 专项 607 项通过。
- 独立浏览器阅读已完成：9 页桌面/手机实际 Query 一致、无文档整体横溢，手机代码可局部滚到末尾；接入点修正后再读取 STT 五页，实际 cURL 均使用 `https://api.sd-rtn.com/cn`，路径与 Query 正确。原始记录见 ignored reader/report.md、reader/stt-url-review.md。截图、真实触屏及浏览器语言切换仍未认证，组件交互已覆盖。
- 全仓 lint 有 9 个既有错误，均在本次未修改的代码中；本次改动文件的 Biome 检查通过。
- 最终候选两区域构建与全量浏览器门禁的结果见下列收尾记录。

## 历史报告与发布边界

2026-11-04 的请求示例保真报告主要比较 Header、Body 和代码语法，没有完整比较 URL Query，因此该报告的“通过”不能证明 Query 保真。此次新增独立 fixture 与逐页 URL 比较，覆盖这一缺口。

当前 `origin/main` 的实现基线为 `0b3855c9e`，Fumadocs OpenAPI 为 12.5.4，尚无本次修改的 `request-examples.ts`；当前中文迁移分支使用 12.5.6。没有把中文迁移分支的其他共享实现或依赖复制进 main。缺少对应 legacy 上下文的版本差异需在主分支整合时单独处理。当前候选另建独立 global 验证工作树，使用相同 HEAD 与补丁：共享文件及命令 49 项比对通过；这证明当前候选的双检出一致，不代表旧 `origin/main` 已整合或其发布验收已完成。英文保持行为由双语 fixture 和当前候选的英文组件测试验证。

原始排查数据、失败/通过日志和浏览器结果保存在忽略目录 `.agent/artifacts/request-example-audit-2026-11-17/`，不提交截图或临时 QA 数据。

## 最终候选全球站验证

独立工作树 `/Users/yejiayi/.codex/worktrees/request-query-global-qa/docs-portal` 使用相同 HEAD 与 source 指纹，shared49、API607、types均通过。生产构建成功，build指纹 `73c9123c985b3d0cb83f0c652b0b5c69db36984ea89f77e2d5175d5ac8229ee1`，API inventory为397页。

全量浏览器门禁在启动前返回 **INCOMPLETE**：验收配置要求旧入口 `/en/realtime-media/cloud-recording/reference/restful-api`，其HTML存在且重定向到 `/en/api-reference/api-ref/cloud-recording`，但发布manifest只记录新canonical URL，旧入口不在inventory。此重定向逻辑在未改动的 `docs-page.server.ts` 中已有，本次没有改case、manifest或探针以跳过失败。不能声称全球站397页浏览器检查已通过。证据保存在 `.agent/artifacts/request-example-audit-2026-11-17/global-validation/current/`。

## 最终候选中文站全量验证

最终候选 source `933d9ba9c1832be9d824b041865a8a164237e82a0cdde29d437d7c64bf537a19`、build `b96084460de37d2439a42ffdbc6c416d34b67974d6368ecae390bd4a0087097b` 的中文生产构建与 scope=all 浏览器门禁 **PASS**：5282 页、52114 个实际视口/主题状态，0 issues、0 errors，跨页面代码框一致性检查通过。使用工具原有6种viewport×明暗主题规则，未修改inventory、探针、canary或PASS定义；Chrome157，自有隔离浏览器会话，8 workers，字体为应用声明URL的fixture（报告保存字体SHA/bytes）。这不认证生产CDN/CORS或真实触屏。

首次字体下载超时被保留为未完成记录；复用同一sealed build重试后取得此完整PASS。报告完整数据保存在 `.agent/artifacts/request-example-audit-2026-11-17/browser-cn-complete/browser.json`，汇总为 `cn-final-summary.json`。本次构建自动产生的日期清单已恢复为原工作树内容，恢复后source指纹仍与seal完全相同；没有提交生成HTML、截图或临时数据。

全球站仍为上述 **INCOMPLETE**，不能将中文PASS扩张为双区域全量PASS。全球验证工作树在拷回全部报告、manifest、两份HTML及397页inventory并核对SHA后已native archive，可通过聊天归档附件恢复；主目录修复随本 PR 提交待审阅，未发布。

收尾复核：主目录按最终 package 定义重跑 API 专项，42 文件、607 项全部通过（exit 0）；最终 Git 空白检查通过，source 指纹仍与中文 seal、全球候选一致。当前工作区只保留本任务的源码、回归 fixture/测试、命令清单和本验收记录，构建生成的日期清单已清理。提交前检查记录已保留，尚未发布。
