# 中文产品参考导航分组 IA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 按已确认的顺序，为 RTM 和灵动课堂的中文参考导航创建物理分组目录，并为移动页面保留旧 URL 的 301 兼容性。

**Architecture:** 为两个产品创建物理参考分组目录，将对应页面和目录 `meta.json` 移入目录，并在现有中文产品 IA 重定向表中保留旧 URL。同步更新参考顺序测试和站内链接审计；页面正文内容不变。

**Tech Stack:** MDX 文件移动、JSON 导航元数据、TypeScript、Vitest、Bun。

---

### Task 1: 移动页面并创建物理参考分组目录

**Files:**
- Move: `content/docs/zh-CN/realtime-media/rtm/reference/api-limits.mdx` → `content/docs/zh-CN/realtime-media/rtm/reference/usage-limits-and-errors/api-limits.mdx`
- Move: `content/docs/zh-CN/realtime-media/rtm/reference/response-code.mdx` → `content/docs/zh-CN/realtime-media/rtm/reference/usage-limits-and-errors/response-code.mdx`
- Move: `content/docs/zh-CN/realtime-media/rtm/reference/feature-list.mdx` → `content/docs/zh-CN/realtime-media/rtm/reference/capabilities-and-compatibility/feature-list.mdx`
- Move: `content/docs/zh-CN/realtime-media/rtm/reference/platform-support.mdx` → `content/docs/zh-CN/realtime-media/rtm/reference/capabilities-and-compatibility/platform-support.mdx`
- Move: `content/docs/zh-CN/solutions/flexible-classroom/reference/call-api.mdx` → `content/docs/zh-CN/solutions/flexible-classroom/reference/api-usage-and-limits/call-api.mdx`
- Move: `content/docs/zh-CN/solutions/flexible-classroom/reference/response-code.mdx` → `content/docs/zh-CN/solutions/flexible-classroom/reference/api-usage-and-limits/response-code.mdx`
- Move: `content/docs/zh-CN/solutions/flexible-classroom/reference/quota.mdx` → `content/docs/zh-CN/solutions/flexible-classroom/reference/api-usage-and-limits/quota.mdx`
- Move: `content/docs/zh-CN/solutions/flexible-classroom/reference/basic-concept.mdx` → `content/docs/zh-CN/solutions/flexible-classroom/reference/capabilities-and-compatibility/basic-concept.mdx`
- Move: `content/docs/zh-CN/solutions/flexible-classroom/reference/platform-support.mdx` → `content/docs/zh-CN/solutions/flexible-classroom/reference/capabilities-and-compatibility/platform-support.mdx`
- Move: `content/docs/zh-CN/solutions/flexible-classroom/reference/tech-architect.mdx` → `content/docs/zh-CN/solutions/flexible-classroom/reference/capabilities-and-compatibility/tech-architect.mdx`
- Create: four group `meta.json` files in the new directories
- Modify: both parent `reference/meta.json` files

- [ ] **Step 1: Move the RTM pages and add directory metadata**

Move the four RTM pages into `usage-limits-and-errors` and `capabilities-and-compatibility`. Add directory metadata with titles `使用限制与错误处理` and `能力与兼容性`, and list child pages in the requested order. The parent pages must be ordered as `downloads`, service API, `usage-limits-and-errors`, `migration-guide`, `capabilities-and-compatibility`, `data-security`, `sunset-policy`.

- [ ] **Step 2: Move the Flexible Classroom pages and add directory metadata**

Move the six Flexible Classroom pages into `api-usage-and-limits` and `capabilities-and-compatibility`. Add directory metadata with titles `API 使用与限制` and `能力与兼容性`, and list child pages in the requested order. The parent pages must be ordered as `downloads`, service API, `api-usage-and-limits`, `migration`, `capabilities-and-compatibility`.

- [ ] **Step 3: Validate metadata and inspect the move diff**

Run `bunx fumadocs-mdx`, parse all six metadata files with Node, and run `git diff --check`.

Expected: all metadata parses successfully; each moved page exists only at its new location; the diff preserves page content and changes only paths and navigation metadata.

### Task 2: Add redirects and update site references

**Files:**
- Modify: `src/lib/zh-cn-product-ia-redirects.ts`
- Modify: `src/lib/zh-cn-product-ia-standard.test.ts`
- Modify: any Markdown, MDX, JSON, or TypeScript files found by the old-path scan

- [ ] **Step 1: Add exact old-to-new 301 mappings**

Add mappings for the ten moved pages to `ZH_CN_PRODUCT_IA_REDIRECTS`, including `realtime-media/rtm/reference/api-limits` → `/zh-CN/realtime-media/rtm/reference/usage-limits-and-errors/api-limits` and `solutions/flexible-classroom/reference/call-api` → `/zh-CN/solutions/flexible-classroom/reference/api-usage-and-limits/call-api`.

- [ ] **Step 2: Add route assertions for every moved page**

Extend the existing product page-move fixtures so each old path is absent, each new path exists, and the old URL resolves to `{ redirectUrl, statusCode: 301 }`.

- [ ] **Step 3: Scan and update internal references**

Search all tracked Markdown, MDX, JSON, and TypeScript files for the ten old `/zh-CN/.../reference/...` paths. Update first-party links and fixtures to the new canonical URLs, while leaving the explicit redirect source keys in `src/lib/zh-cn-product-ia-redirects.ts` as the compatibility record.

### Task 3: Update and run navigation and link regression tests

**Files:**
- Modify: `src/lib/zh-cn-reference-order.test.ts`
- Modify: `src/lib/zh-cn-product-ia-standard.test.ts`

- [ ] **Step 1: Update expected reference entries and folder assertions**

Replace the two expected flat arrays with the ordered folder entries, add both paths to `intentionallyChangedReferencePages`, and assert each new directory `meta.json` has the approved title and child-page order.

- [ ] **Step 2: Run focused navigation and redirect tests**

Run `bun run test -- src/lib/zh-cn-reference-order.test.ts src/lib/zh-cn-product-ia-standard.test.ts`.

Expected: all focused navigation and redirect cases pass, including exact ordering, moved-file existence, and old-to-new 301 checks.

- [ ] **Step 3: Run link, type, and whitespace checks**

Run `bun run docs:links:cn-api:check`, `bun run types:check`, and `git diff --check`.

Expected: the link audit and type checking pass, and the diff check reports no whitespace errors.

- [ ] **Step 4: Commit the implementation**

Run `git add content/docs/zh-CN/realtime-media/rtm/reference content/docs/zh-CN/solutions/flexible-classroom/reference src/lib/zh-cn-product-ia-redirects.ts src/lib/zh-cn-product-ia-standard.test.ts src/lib/zh-cn-reference-order.test.ts && git commit -m "docs: group zh-CN product reference navigation"`.
