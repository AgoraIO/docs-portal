# 中文产品文档参考区排序实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 只调整中文产品文档各 `reference` section 中现有条目的顺序，形成“下载资源 → API → 配额/限制/错误码 → 迁移 → 概念/核心 → 其他”的一致顺序。

**Architecture:** 这是纯文档导航数据调整。逐个审阅 `content/docs/zh-CN/**/reference/meta.json`，只修改 `pages` 数组顺序；不移动页面文件，不改变 URL、页面标题、正文、站内链接或重定向。通过独立的 IA 测试固定排序结果，并验证条目结构与条目集合不变。

**Tech Stack:** JSON navigation metadata, TypeScript, Vitest, Fumadocs MDX.

---

## 设计依据与范围

- 设计文档：`docs/superpowers/specs/2026-09-20-zh-cn-product-reference-order-design.md`
- 产品参考导航范围：`content/docs/zh-CN/**/reference/meta.json`
- 排序优先级：
  1. 下载资源
  2. API 页面（客户端 API、服务端 API 和其他 API 保持现有相对顺序）
  3. 配额、限制与错误码
  4. 迁移指南
  5. 概念 / 核心说明
  6. 未归类的其他内容
- 同一类别内保持原有相对顺序。
- 现有 `group`、链接字符串、隐藏条目和页面结构保持不变；只移动它们在顶层 `pages` 数组中的位置。

## 文件边界

### 需要检查和可能修改的文件

- `content/docs/zh-CN/**/reference/meta.json`：产品参考区导航数据；只改 `pages` 顺序。
- `src/lib/zh-cn-reference-order.test.ts`：新增参考区排序回归测试，避免后续排序回退。

### 明确不修改的文件

- `content/docs/zh-CN/**` 下的页面正文文件。
- 任何页面文件的路径或 slug。
- 站内链接、重定向表和生成的路由文件。
- 当前 worktree 中已有的 `content/docs/zh-CN/introduction/**` 改动。

### Task 1: 盘点并建立参考条目分类清单

**Files:**
- Read: `content/docs/zh-CN/**/reference/meta.json`
- Read: `docs/superpowers/specs/2026-09-20-zh-cn-product-reference-order-design.md`

- [ ] **Step 1: 列出全部参考导航文件和顶层条目**

运行：

```bash
find content/docs/zh-CN -path '*/reference/meta.json' -print | sort
```

逐个查看每个文件的 `pages` 数组，记录下载、API、配额/限制/错误码、迁移、概念/核心和其他条目。

- [ ] **Step 2: 标记需要变更的文件**

只把至少有两个目标类别顺序需要调整的 `meta.json` 纳入修改范围。只有一个类别或已经符合顺序的文件不做无意义改写。

检查每个候选文件的条目集合，确认后续变更只会产生顺序差异。该步骤不修改文件，只形成实施时使用的文件清单。

### Task 2: 先添加排序回归测试

**Files:**
- Create: `src/lib/zh-cn-reference-order.test.ts`
- Test: `src/lib/zh-cn-reference-order.test.ts`

- [ ] **Step 1: 编写读取 metadata 的测试辅助类型**

测试需要支持现有的字符串条目、链接条目和 `group` 对象，不把对象扁平化。辅助读取逻辑使用 `readFileSync` 和 `JSON.parse`，并将每个顶层 `pages` 条目保留为可比较的 JSON 值。

- [ ] **Step 2: 写入被调整文件的期望顺序**

为 Task 1 标记的每个文件增加一条期望记录，记录完整的顶层 `pages` 数组。期望记录必须保留：

1. 原有条目的完整字符串或对象内容。
2. API 条目的现有相对顺序。
3. 每个 `group` 的完整对象和组内 `pages` 顺序。
4. 未归类条目在五类条目之后的原有相对顺序。

- [ ] **Step 3: 增加条目集合和结构不变断言**

测试除比较期望顺序外，还要比较调整前后的条目集合和序列化结构，确保本次变更不是新增、删除、重命名、拆分或重组条目。

- [ ] **Step 4: 运行新测试确认当前基线会暴露顺序差异**

运行：

```bash
bun run test -- src/lib/zh-cn-reference-order.test.ts
```

预期：当前未调整的 metadata 至少有顺序断言失败；测试失败原因应是条目顺序，而不是 JSON 解析、路径不存在或结构不匹配。

### Task 3: 按分类顺序调整 reference metadata

**Files:**
- Modify: Task 1 标记的 `content/docs/zh-CN/**/reference/meta.json` 文件

- [ ] **Step 1: 调整下载资源位置**

将现有下载资源条目移动到该 `pages` 数组最前面；多个下载条目保持原有相对顺序。不要修改条目内容或页面路径。

- [ ] **Step 2: 保留现有 API 条目顺序并放到下载之后**

将客户端 API、服务端 API 和其他 API 条目整体放到下载条目之后，保持它们原有的相对顺序。不要新建 API 父级分组，也不要调整已有条目的结构。

- [ ] **Step 3: 依次整理剩余四类条目**

按以下顺序放置现有条目：

```text
配额、限制与错误码
迁移指南
概念 / 核心说明
```

同一类别内保持现有相对顺序；未归类条目统一放在最后，也保持现有相对顺序。

- [ ] **Step 4: 检查每个 metadata 文件只发生顺序变化**

对每个修改文件执行 JSON 解析和条目集合比较。使用 `git diff` 确认没有标题、链接、slug、group 内部页面或其他字段变化：

```bash
git diff -- 'content/docs/zh-CN/**/reference/meta.json'
git diff --check
```

### Task 4: 验证并提交

**Files:**
- Test: `src/lib/zh-cn-reference-order.test.ts`
- Verify: all modified `content/docs/zh-CN/**/reference/meta.json`

- [ ] **Step 1: 运行参考区排序测试**

运行：

```bash
bun run test -- src/lib/zh-cn-reference-order.test.ts
```

预期：所有排序、条目集合和结构断言通过。

- [ ] **Step 2: 运行现有中文 IA 回归测试**

运行：

```bash
bun run test -- src/lib/zh-cn-product-ia-standard.test.ts -t 'showroom|flexible-classroom'
```

预期：现有相关 IA 测试通过；若完整测试仍报告基线中已存在的无关失败，单独记录，不修改无关内容。

- [ ] **Step 3: 运行类型检查和格式检查**

运行：

```bash
bun run types:check
git diff --check
```

- [ ] **Step 4: 验证没有路径或链接变化**

运行：

```bash
git diff --name-status HEAD
git diff -- 'content/docs/zh-CN/**/reference/meta.json'
```

验收：变更仅包含参考区 `meta.json` 和排序测试；没有页面 rename、正文修改、链接修改或重定向修改。

- [ ] **Step 5: 提交纯排序变更**

```bash
git add content/docs/zh-CN src/lib/zh-cn-reference-order.test.ts
git commit -m "docs: standardize zh-CN reference ordering"
```

## 验收标准

- 所有纳入范围的产品参考区都遵循五类优先、其他内容置后的顺序。
- API 条目只改变所在位置，不改变现有相对顺序或结构。
- 页面、URL、标题、链接、重定向和正文均未变化。
- 现有 `group` 条目及其内部页面顺序保持不变。
- 排序回归测试、类型检查和 diff 检查通过。
