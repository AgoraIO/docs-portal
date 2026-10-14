# 旧文档站到新文档站 Redirection 方案

- 日期：2026-10-14
- 状态：方案草案
- 旧站：<https://doc.shengwang.cn/>
- 新站：<https://docs.agora.io/zh-CN/>
- 旧站仓库：`shengwang-doc-source`
- 新站仓库：`docs-portal`

## 1. 目标

将旧站 `doc.shengwang.cn` 的公开文档 URL 平滑迁移到新站中文路径，并满足以下目标：

1. 搜索引擎将旧 URL 的权重转移到新 URL。
2. 用户收藏、搜索结果、外部文档引用和历史链接可以继续访问。
3. 新旧 URL 只发生一次跳转，并最终落到新站规范 URL。
4. 映射结果可追溯、可审计，并能在文档目录继续调整时重新生成。
5. 未完成迁移的页面不会被错误地跳转到新站首页。

## 2. 现状和约束

### 2.1 不能把历史迁移台账当作当前路由事实

docs-portal 在历史迁移后已经发生过多次目录和 IA 调整。历史映射文档、旧的迁移 CSV 和审计报告只能作为候选映射和迁移背景，不能直接作为本次上线的最终目标。

本次映射的目标来源必须是准备上线的 docs-portal commit 的实际构建产物。

### 2.2 新站尚未公开承接中文流量

新站正式发布前，`https://docs.agora.io/zh-CN/` 是否可访问不能作为映射生成的前置条件。映射应先在本地或 staging 环境完成；新站公开发布只负责最终线上验证。

目标站发布前必须确认：

- 中文 deployment 已启用；
- `VITE_DOCS_REGION=cn` 的构建产物包含中文页面；
- `/zh-CN/`、所有目标页面、搜索、sitemap 和机器可读输出均可访问；
- 新站不存在会指回旧站的兼容规则。

### 2.3 旧站入口层适合执行重定向

旧站当前通过 Nginx 代理静态内容和 OSS 发布版本。重定向应在旧站 Nginx、CDN 或边缘函数层执行，避免使用 HTML 跳转或客户端 JavaScript 跳转。

新站仓库中的 `/doc/*`、`/api-ref/*` 兼容路由需要在切换前删除或改为直接指向新站规范路径，否则可能形成旧站与新站之间的循环跳转。

## 3. 总体架构

```text
旧站 sitemap / 源码 / 访问日志
              │
              ▼
      旧 URL inventory
              │
              ├──────────────┐
              ▼              ▼
   当前目标 commit 构建产物   人工语义审核
              │              │
              └──────┬───────┘
                     ▼
             legacy-url-map
                     │
                     ▼
       Nginx / CDN / Edge 301 规则
                     │
                     ▼
             docs.agora.io/zh-CN
```

核心原则是：先生成并审核映射表，再将映射表编译为入口层规则。不要在 Nginx 配置中手工维护 URL 对。

## 4. 目标路由清单

### 4.1 生成时机

在准备上线的 docs-portal commit 上执行中文构建：

```bash
VITE_DOCS_REGION=cn bun run build:static
```

根据当前构建结果生成带 commit SHA 和生成时间的目标路由清单：

```text
target-routes-<commit-sha>.json
```

目标路由清单是本次重定向的目标真相源。每次目标站文档目录发生影响 URL 的变更，都需要重新生成。

### 4.2 清单内容

目标路由清单至少应覆盖：

- `content/docs/zh-CN/**` 生成的普通文档；
- `meta.json` 生成的目录入口；
- API Reference 页面；
- OpenAPI endpoint registry 生成的 endpoint 页面；
- FAQ、搜索、sitemap 和机器可读 Markdown；
- 页面规范 URL、页面类型和是否为重定向别名。

清单需要排除：

- 内部构建文件；
- 隐藏页面；
- 已明确废弃的页面；
- 仅作为别名的非规范 URL。

## 5. 旧 URL inventory

### 5.1 采集来源

切换前重新采集旧站，不使用历史快照直接代替当前数据：

1. 线上 `https://doc.shengwang.cn/sitemap.xml`；
2. 旧站源码中的 `docs/**`、`docs-api-reference/**`、`html-docs/**`；
3. 旧站构建结果中的公开 HTML 路径；
4. 旧站页面、站内搜索和导航中仍被引用的 URL；
5. 线上访问日志中的高频 URL、带查询参数 URL 和外部 Referer URL。

采集结果保存为带时间戳的快照：

```text
legacy-sitemap-<date>.xml
legacy-url-inventory-<date>.json
```

### 5.2 需要覆盖的 URL 家族

- `/doc/**`：普通产品文档；
- `/api-ref/**`：SDK API 和 REST API；
- `/faq/**`：FAQ 页面；
- `/basics/**`：术语、安全和基础信息；
- `/codebox/**`：代码示例入口；
- `/api-center`：API 总入口；
- `/search`：旧站搜索页；
- `/sitemap.xml`、`/robots.txt`；
- 其他通过日志或源码发现的公开入口。

静态资源、登录接口、内部 API 和构建产物不应套用文档页面的重定向规则，需要单独决定保留、迁移或下线。

## 6. 映射表设计

### 6.1 文件

建议生成：

```text
legacy-url-map.csv
legacy-url-map.json
```

JSON 用于程序和边缘规则生成，CSV 用于评审、筛选和人工补充说明。

### 6.2 字段

```text
old_url
old_path
old_query_match
new_url
status
preserve_query
mapping_type
target_commit
source_reference
review_owner
notes
```

### 6.3 状态

| 状态 | 含义 | 入口层行为 |
| --- | --- | --- |
| `redirect` | 目标页面已确认 | 返回 301 |
| `keep-temporary` | 目标尚未准备好，旧页面仍需服务 | 暂不跳转 |
| `410` | 内容已废弃且没有替代页面 | 返回 410 |
| `manual-review` | 需要产品或文档负责人确认 | 不得自动发布 |
| `ignore` | 资源、内部接口或构建文件 | 不生成页面重定向 |

### 6.4 映射优先级

1. 完整旧 URL（路径和查询参数）精确匹配；
2. 路径精确匹配；
3. 处理 `.html`、尾斜杠、URL 编码和大小写等历史变体；
4. 经过人工审核的语义映射；
5. 高置信度的产品级 fallback。

无法确认目标的 URL 不应默认跳转到新站首页。

## 7. 分类型映射策略

### 7.1 普通文档

普通文档根据旧页面的产品、平台、标题和内容，与当前目标路由清单匹配。新站 IA 发生变化时，映射必须记录语义依据和审核人。

示例结构：

```text
/doc/<legacy-product>/<legacy-platform>/<legacy-path>
→ /zh-CN/<current-canonical-path>
```

示例中的目标路径仅表示格式，实际目标必须来自当前构建产物。

### 7.2 API Reference

API Reference 需要独立处理：

- SDK API 按产品、语言和平台映射；
- REST API 按 OpenAPI `operationId` 或当前 endpoint registry 映射；
- 不使用简单的 `/api-ref/` 前缀替换；
- 没有新站目标的 SDK HTML API 暂标记为 `keep-temporary`，不要生成错误目标。

### 7.3 FAQ、basics 和 codebox

这些页面需要逐类确认目标 IA：

- 有明确等价页面：生成页面级 301；
- 目标内容尚未上线：`keep-temporary`；
- 内容已确认删除：`410`；
- 目标归属不明确：`manual-review`。

## 8. 入口层实现

### 8.1 推荐方式

在旧站的 Nginx、CDN 或边缘函数中加载生成的映射规则。规则必须在旧站代理 OSS 的通用 location 之前执行。

最终行为：

```text
GET https://doc.shengwang.cn/<old-path>
→ 301 Location: https://docs.agora.io/zh-CN/<canonical-path>
```

### 8.2 查询参数

- 只保留有明确用途的查询参数；
- 如果旧参数只是平台选择器，而新 URL 已表达平台，则删除旧参数；
- 需要保留的追踪参数应按白名单保留；
- 查询参数导致多个旧 URL 指向不同目标时，必须生成查询条件映射；
- fragment 不发送到服务端，目标 URL 不显式覆盖 fragment 时由浏览器继续处理。

### 8.3 特殊入口

建议单独定义：

- `/` → `/zh-CN/`；
- `/sitemap.xml` → 新站 sitemap；
- `/robots.txt` 指向新站 sitemap；
- `/search` → 新站中文搜索页；
- `/api-center` → 新站 Reference/API 总入口；
- `/codebox` 和 `/codebox/detail` → 等价示例入口，或按映射状态返回 410。

## 9. docs-portal 配套修改

切换前需要处理新站中的旧站兼容逻辑：

1. 删除当前指向 `doc.shengwang.cn` 的 `/doc/*` 和 `/api-ref/*` 规则；
2. 如果仍需支持残留的旧路径，让新站直接使用同一份 `legacy-url-map` 解析到规范 URL；
3. 禁止新站将请求再次发回旧站；
4. 将旧站 URL 映射单独归档，不与其他历史 URL 兼容模块混用；
5. 所有正式页面使用新的 canonical URL 和 sitemap。

## 10. 自动验证

每条 `redirect` 记录必须满足：

- 目标存在于目标 commit 的路由清单；
- 目标不是旧站域名；
- 最多一跳到达规范 URL；
- 不产生循环；
- 查询参数符合 `preserve_query` 规则；
- 目标页面返回 200。

建议使用以下方式验证：

```bash
curl -sS -D - -o /dev/null --max-redirs 0 \
  https://doc.shengwang.cn/doc/...

curl -sS -L -o /dev/null \
  -w '%{http_code} %{url_effective}\n' \
  https://doc.shengwang.cn/doc/...
```

CI 检查至少包括：

- 旧 URL inventory 中没有未决 URL；
- 所有 `redirect` 目标存在；
- 没有重复或冲突映射；
- 没有超过一次的重定向链；
- 没有旧站与新站互相跳转；
- `/doc`、`/api-ref`、FAQ、API、带查询参数 URL 均有抽样结果；
- sitemap、robots 和 canonical URL 一致。

## 11. 发布步骤

1. 冻结 docs-portal 目标 commit。
2. 构建中文站并生成 `target-routes-<commit-sha>.json`。
3. 重新采集旧站 sitemap、源码 URL 和访问日志。
4. 生成 `legacy-url-map.csv/json`。
5. 对 `manual-review` 项完成产品和文档负责人确认。
6. 编译 Nginx/CDN/Edge 规则。
7. 在本地或 staging 验证代表性 URL 和全量映射。
8. 发布新站中文版本。
9. 确认新站所有目标 URL 返回 200 后，启用旧站 301。
10. 更新旧站 robots 和 sitemap 指向。
11. 观察 2–4 周的 404、5xx、重定向环和高频旧 URL。
12. 旧站保留只读版本，确认无高价值遗漏后再下线内容服务。

## 12. 回滚

回滚入口层规则即可恢复旧站服务，不修改 DNS 作为第一回滚手段。上线前应保留：

- 旧站最后一个可用版本；
- 旧站原始 Nginx/CDN 配置；
- 本次生成的 URL inventory 和映射表；
- 本次目标站 commit 和构建产物；
- 301 规则发布版本。

灰度阶段使用 302 或测试域名，正式切换后再使用 301，避免过早产生浏览器和搜索引擎缓存。

## 13. 交付物

本方案落地后应形成以下文件或发布产物：

```text
target-routes-<commit-sha>.json
legacy-sitemap-<date>.xml
legacy-url-inventory-<date>.json
legacy-url-map.csv
legacy-url-map.json
generated-redirect-rules.conf
redirect-validation-report.md
cutover-runbook.md
```

最终上线依据是“当前目标 commit 的构建路由 + 当前旧站 URL inventory + 已审核的映射表”，历史迁移台账只作为参考和审计背景。
