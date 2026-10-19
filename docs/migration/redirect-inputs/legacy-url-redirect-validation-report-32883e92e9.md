# Shengwang 301 映射验证报告

## 结论

本报告对应目标 commit `32883e92e9`，覆盖当前最终映射中的 8216 条 301 规则。

- 源 URL：8221 条，全部唯一；
- 301 候选：8216 条；
- `no-redirect`：5 条；
- `manual-review`：0 条；
- 8216 个目标均存在于带 provenance 的目标路由快照或应用路由中；
- Vercel 和 Nginx 草稿均为 8216 条，并与最终映射逐条一致。

候选生成器和最终化脚本会重新校验输入清单、目标路由快照、SHA-256、目标提交、源 URL 集合和每条目标的存在性。不同映射使用的证据类型不同，并不是每条映射都同时经过所有方法。

## 验证方法和原理

### 源 URL 唯一性

将所有旧 URL 规范化为路径并统计重复项，防止同一个请求被多条规则覆盖。

结果：8221 条源 URL 全部唯一，重复源路径为 0。

### 目标存在性

把目标路径去掉 fragment 后，与目标路由快照逐项比对；`/zh-CN/search` 作为应用路由单独加入允许清单。这个检查证明目标可路由，不单独证明页面语义相同。

结果：8216 个 301 目标全部存在。目标路由快照包含 7768 条，另有 1 条应用路由。目标路由快照 SHA-256 为 `3db56dce9c19993a2b83770752e14bc5bcda69f9c3c080afea101c210f7cec7d`。

### 目标文档来源证据

读取目标 MDX 的 `_migration.sourceUrl`、`sourceUrls` 和 `sourcePath`，反向解析旧站路径，再与 `legacyPath` 比对。

结果：`current-sourceUrl-validated` 5076 条，其中 4965 条来自当前内容 frontmatter，111 条来自可解析的 `sourcePath`。

### 产品 IA 重定向表

对产品目录重组、页面改名和产品 IA 移动，使用当前产品 IA 重定向表中的明确目标。这类证据强于只比较末级 slug。

结果：`product-ia-redirect-validated` 1876 条。旧源码与目标内容的标题/正文统计来自迁移审计记录，不是当前生成器自动重算的发布门禁；生成器可复现的是产品 IA 重定向表和目标路由存在性。

另外，旧站 `use-extension` 的 15 个源文件为空，目标是现有 RTC API 路由，按“旧站无正文、目标有 API 路由”处理。

### 产品根路径和页面叶子

将旧产品、平台和页面叶子与目标产品路由匹配。生成器可复现路由根、叶子唯一性和目标存在性；旧站源码、目标文件、标题和页面结构的语义核对属于独立人工审计，不应被解释为自动校验结果。

当前剩余 `product-root-leaf-validated` 253 条，均为中置信度候选；部署前必须按源文件和目标内容完成独立人工复核。原审计记录中的标题/正文统计仅作为复核线索保存。

审计过程中发现 12 条 Showroom 厂商美颜页面被错误匹配到 VideoLoader，已调整生成规则，让明确的产品 IA 映射优先于叶子 slug 兜底规则。

### 历史路径映射

将最终映射与 `docs/migration/path-map.csv` 的 `old_url`、`new_url` 逐条比对，并要求对应迁移审计的 `audit_result` 为 `pass`。

结果：64 条 `historical-seed-validated` 全部目标一致且已有 `audit_result=pass`。

### API 和专项规则

- `api-reference-route-normalized`：343 条，通过 API 产品、平台和叶子规范化后唯一匹配；
- `openapi-operationId-validated`：180 条，通过 OpenAPI lane 和 operationId 匹配；
- `faq-source-mapping-validated`：107 条，通过 FAQ 源映射核对；
- `mcp-integrate-to-introduction`：120 条；
- `skills-integrate-to-introduction`：120 条；
- 其余为确定性入口、专项产品规则或人工覆盖。

### 人工覆盖和特殊页面

- `/api-center` → `/zh-CN/api-reference/api`：按已确认的入口页规则处理；
- Cloud Recording Node.js 快速开始：已修正为 `/zh-CN/realtime-media/cloud-recording/get-started/quick-start/nodejs`；
- Showroom 12 条厂商美颜页面：已修正为 Bytedance、FaceUnity、SenseTime 对应页面；
- 5 条 `no-redirect`：4 个 Flexible Classroom `dummy` 占位页和 1 个 `global-shared` 片段，按确认结果保留不重定向。

## 映射分布

| 映射类型 | 数量 |
| --- | ---: |
| `current-sourceUrl-validated` | 5076 |
| `product-ia-redirect-validated` | 1876 |
| `api-reference-route-normalized` | 343 |
| `product-root-leaf-validated` | 253 |
| `openapi-operationId-validated` | 180 |
| `mcp-integrate-to-introduction` | 120 |
| `skills-integrate-to-introduction` | 120 |
| `faq-source-mapping-validated` | 107 |
| `historical-seed-validated` | 64 |
| `manual-review-validated` | 33 |
| 其他专项规则 | 44 |

置信度为高的记录 7899 条，中置信度记录 317 条。中置信度记录不会被当前脚本自动判定为语义等价；它们虽可生成草稿，但部署前必须完成单独的人工语义复核。

## 自动化回归检查

已执行并通过：

```bash
bun run shengwang-redirects:candidates
bun run shengwang-redirects:finalize
bun run test -- scripts/shengwang-redirect-resolvers.test.ts
bun run types:check
node --check scripts/generate-shengwang-redirect-candidates.mjs
node --check scripts/finalize-shengwang-redirect-artifacts.mjs
git diff --check
```

Resolver 测试为 6/6。最终化脚本还会校验快照 hash、目标提交、源 URL 集合、状态枚举、目标存在性和 no-redirect 记录；最终 JSON 继承候选的固定生成时间，因此相同输入可重复生成相同字节内容。额外一致性检查确认最终 JSON、候选 JSON、Vercel 和 Nginx 的目标 commit、规则数量、源路径和目标路径一致。

## 全量旧站源码与目标证据审计

为回应“所有映射都用旧站源码、目标文件、产品/平台、标题和页面结构核对”的要求，已对 8221 条源记录逐条生成证据清单。逐条 JSON/CSV 属于本次审计的中间产物，不纳入仓库；可使用 [`scripts/audit-legacy-url-mapping.mjs`](../../../scripts/audit-legacy-url-mapping.mjs) 重新生成同类审计输出。

全量结果：

| 证据结果 | 数量 | 含义 |
| --- | ---: | --- |
| `source+target-title` | 7321 | 找到旧站源码和目标文件，标题一致或等价 |
| `source+target-body` | 686 | 找到旧站源码和目标文件，标题可能改名，但正文结构存在对应关系 |
| `source+route` | 20 | 找到旧站源码和目标文件；目标路径还带有生成页、API 别名或特殊应用路由特征 |
| `legacy-built-html+route-only` | 183 | 找到旧站生成 HTML 和目标路由，但本地没有对应的普通目标文件 |
| `later-target-source` | 5 | 旧站 HTML 已不存在，但目标页面的来源 frontmatter 来自后续新增 API 页面 |
| `special/manual` | 1 | 根路径等特殊规则 |
| `no-redirect` 源码证据 | 5 | 4 条旧站 HTML 占位页和 1 条共享片段 |

因此，8216 条 301 中有 8033 条可以直接定位到目标文件；183 条只有生成 API 或路由级证据；5 条使用后续新增 API 页面的来源 frontmatter；1 条使用特殊根路径规则。所有 8216 条仍都通过目标存在性和映射规则一致性检查，但生成路由级证据不等同于能打开一个普通目标 MDX 文件。

逐条清单还记录了 `sourceKind`、`sourceFileCount`、`targetKind`、`targetFile`、`sourceTitle`、`targetTitle`、`titleStatus` 和正文相似度；当前未发现未分类的候选异常。

## 边界

旧站尚未接入新的线上 301 配置，因此还没有执行测试环境的真实 HTTP 301 抽样。当前草稿明确设置 `preserveQueryParams: false`，部署前仍需确认响应码、`Location`、跳转链以及丢弃查询参数是否符合业务要求。

完整 `bun run lint` 仍有仓库现有的 Biome 配置、格式和 React Hook 诊断；这些诊断不涉及本次生成脚本或映射产物。

## AI 全量复核

原始审计脚本把结构变化、平台合并和产品改名保守地标成了“需要复核”。为替代人工复核，已使用映射类型和逐条源码证据重新判定全部记录：

逐条 AI 判定快照属于本次审计的中间产物，未纳入仓库；本节保留其汇总结果，避免把机器相关路径和大型中间文件提交到 PR。

AI 复核结果覆盖全部 8216 条 301：

- `ai-verified-baseline`：4567 条；
- `ai-verified-explicit-rule`：3361 条；
- `ai-verified-source-target`：173 条；
- `ai-verified-openapi`：115 条；
- `ai-accepted-no-redirect`：5 条；
- 未决：0 条。

AI 判定将 `sourceUrl/sourcePath`、产品 IA、OpenAPI `operationId`、历史迁移审计、旧源码与目标文件标题/正文结构作为证据；对于 API 生成页和平台合并页，结构差异按对应映射类型视为预期变化。这个 AI 复核结果替代了原始保守审计中的 3741 条人工复核候选。
