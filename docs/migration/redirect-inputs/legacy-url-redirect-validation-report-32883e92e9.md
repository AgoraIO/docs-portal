# Shengwang 301 映射验证报告

## 结论

本报告对应目标 commit `32883e92e9`，覆盖当前最终映射中的 8216 条 301 规则。

- 源 URL：8221 条，全部唯一；
- 301 候选：8216 条；
- `no-redirect`：5 条；
- `manual-review`：0 条；
- 8216 个目标均存在于目标路由快照或应用路由中；
- Vercel 和 Nginx 草稿均为 8216 条，并与最终映射逐条一致。

每条映射至少有一类适用证据支持。不同映射使用的证据类型不同，并不是每条映射都同时经过所有方法。

## 验证方法和原理

### 源 URL 唯一性

将所有旧 URL 规范化为路径并统计重复项，防止同一个请求被多条规则覆盖。

结果：8221 条源 URL 全部唯一，重复源路径为 0。

### 目标存在性

把目标路径去掉 fragment 后，与目标路由快照逐项比对；`/zh-CN/search` 作为应用路由单独加入允许清单。这个检查证明目标可路由，不单独证明页面语义相同。

结果：8216 个 301 目标全部存在。目标路由快照包含 7768 条，另有 1 条应用路由。

### 目标文档来源证据

读取目标 MDX 的 `_migration.sourceUrl`、`sourceUrls` 和 `sourcePath`，反向解析旧站路径，再与 `legacyPath` 比对。

结果：`current-sourceUrl-validated` 5076 条，其中 4965 条来自当前内容 frontmatter，111 条来自可解析的 `sourcePath`。

### 产品 IA 重定向表

对产品目录重组、页面改名和产品 IA 移动，使用当前产品 IA 重定向表中的明确目标。这类证据强于只比较末级 slug。

结果：`product-ia-redirect-validated` 1876 条。旧源码与目标内容交叉核对结果为：1573 条标题一致、82 条标题带产品或平台限定词但正文对应、131 条是产品根页、75 条是标题改名但正文/结构对应。

另外，旧站 `use-extension` 的 15 个源文件为空，目标是现有 RTC API 路由，按“旧站无正文、目标有 API 路由”处理。

### 产品根路径和页面叶子

将旧产品、平台和页面叶子与目标产品路由匹配，再用旧站源码、目标文件、标题和页面结构做语义核对。

当前剩余 `product-root-leaf-validated` 253 条：180 条标题一致、59 条是产品根页、1 条标题相关、13 条是正文高度重合的改名页；旧源码文件和目标文件均已找到。

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

置信度为高的记录 7899 条，中置信度记录 317 条。中置信度主要是剩余产品叶子规则和历史来源规则，均已做源码或既有迁移审计交叉核对。

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

Resolver 测试为 6/6。额外一致性检查确认最终 JSON、候选 JSON、Vercel 和 Nginx 的目标 commit、规则数量、源路径和目标路径一致。

## 边界

旧站尚未接入新的线上 301 配置，因此还没有执行测试环境的真实 HTTP 301 抽样。部署前仍需确认响应码、`Location`、跳转链和查询参数行为。

完整 `bun run lint` 仍有仓库现有的 Biome 配置、格式和 React Hook 诊断；这些诊断不涉及本次生成脚本或映射产物。
