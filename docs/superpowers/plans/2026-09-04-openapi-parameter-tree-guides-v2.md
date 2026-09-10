# OpenAPI 参数状态与查找交互优化 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 移除 Request Body 和 Response Body 中的 `Filter Properties`，保留浏览器原生查找，并统一参数状态视觉。

**Architecture:** 保留递归 schema view、children wrapper、`hidden="until-found"`、`beforematch`、手动展开、hash reveal 和 copy link。删除 `OpenApiSchemaTree` 中只服务于自定义 filter 的 query、计数和搜索展开状态；由 FieldRow 负责状态 badge 和 Deprecated 删除线。

**Tech Stack:** React, TypeScript, Fumadocs schema UI, Tailwind utility classes, Vitest, Testing Library, PostCSS, agent-browser.

---

## 文件职责

- `src/components/openapi/OpenApiSchemaTree.tsx`：移除 filter toolbar 和搜索状态，保留递归节点、局部展开、`hidden="until-found"`、`beforematch` 和 reveal。
- `src/components/openapi/OpenApiSchemaFieldRow.tsx`：渲染字段身份、方案 A 状态 badge、Deprecated 删除线、描述、enum、metadata 和 copy link。
- `src/components/openapi/OpenApiSchema.tsx`：删除 filter labels 和 Deprecated 重复 metadata，保留状态 labels 和 schema navigation wiring。
- `src/components/openapi/OpenApiSchemaTree.test.tsx`、`OpenApiSchema.test.tsx`、`FumadocsOpenApiContent.test.tsx`：验证 Request/Response/join 行为。
- `src/components/openapi/OpenApiSchemaFieldRow.test.tsx`：验证状态颜色、删除线和窄屏样式边界。
- `src/styles/app.css`、`src/styles/app-css-regressions.test.ts`：维护 children guide 的桌面/移动样式和无横向伪元素约束。

## Task 1：移除 schema 自定义 filter

**Files:**

- Modify: `src/components/openapi/OpenApiSchemaTree.tsx`
- Modify: `src/components/openapi/OpenApiSchema.tsx`
- Test: `src/components/openapi/OpenApiSchemaTree.test.tsx`
- Test: `src/components/openapi/OpenApiSchema.test.tsx`
- Test: `src/components/openapi/FumadocsOpenApiContent.test.tsx`

- [ ] **Step 1: 写失败测试。**

在 Tree 测试中追加：

```tsx
expect(screen.queryByRole('searchbox', { name: 'Filter properties' })).toBeNull();
expect(screen.queryByRole('button', { name: 'Expand all' })).toBeNull();
expect(screen.queryByRole('button', { name: 'Collapse all' })).toBeNull();
expect(screen.getByRole('button', { name: 'Expand advanced properties' })).toBeInTheDocument();
```

在 Request Body 和 Response Body 测试中，分别限定各自 schema 容器并断言：

```tsx
expect(container.querySelector('input[placeholder="Filter Properties"]')).toBeNull();
expect(container.querySelector('[data-openapi-schema-fields]')).toBeInTheDocument();
```

- [ ] **Step 2: 运行红灯。**

```bash
/Users/yejiayi/.bun/bin/bun run test src/components/openapi/OpenApiSchemaTree.test.tsx src/components/openapi/OpenApiSchema.test.tsx src/components/openapi/FumadocsOpenApiContent.test.tsx --testTimeout=20000
```

Expected: FAIL，因为当前 Tree 仍渲染 filter input 和 Expand/Collapse all。

- [ ] **Step 3: 删除 filter 状态和 toolbar。**

在 `OpenApiSchemaTree.tsx` 中删除 `Input`、`KeyboardEvent`、`filterOpenApiSchemaView`、`query`、`filterResult`、`isSearching`、`searchExpandedIds`、`searchCollapsedIds`、`preSearchExpandedIds`、`pendingFocusId` 及搜索专用函数。保留 `expandedIds`、`highlightedId`、`revealTarget` 和 `beforematch` 所需的 `findNodeChain`/ `revealNode`。revealNode 的目标行为是：

```tsx
const revealNode = useCallback(
  (nodeId: string) => {
    const chain = findNodeChain((node) => node.id === nodeId);
    if (chain.length === 0) return;
    setExpandedIds((current) => new Set([...current, ...chain.map((node) => node.id)]));
  },
  [findNodeChain],
);
```

`renderNodes` 不再过滤节点或渲染 match path；每个 expandable node 仍输出 `.openapi-schema-children` 或带相同 class 的 `HiddenDescendants`，并保留 `onBeforeMatch={() => revealNode(node.id)}`。删除 Tree toolbar，只返回 schema fields container。

从 `OpenApiSchemaTreeLabels` 和 `getOpenApiSchemaLabels` 删除 `filter`、`match`、`matches`、`noMatches`，保留 `expand`、`collapse`、`required`、`optional`、`deprecated` 和 `allowedValues`。

- [ ] **Step 4: 保留局部展开和 native find 回归。**

```tsx
fireEvent.click(screen.getByRole('button', { name: 'Expand advanced properties' }));
expect(screen.getByText('advancedChild')).toBeVisible();
fireEvent.click(screen.getByRole('button', { name: 'Collapse advanced properties' }));
expect(screen.getByText('advancedChild')).not.toBeVisible();
expect(getRow(advanced).querySelector(':scope > [data-openapi-schema-hidden-children][hidden="until-found"]')).toBeInTheDocument();
```

不要删除 `data-openapi-schema-path`、hash reveal、copy link、`beforematch` 或隐藏后代 DOM 测试。

- [ ] **Step 5: 验证并提交。**

```bash
/Users/yejiayi/.bun/bin/bun run test src/components/openapi/OpenApiSchemaTree.test.tsx src/components/openapi/OpenApiSchema.test.tsx src/components/openapi/FumadocsOpenApiContent.test.tsx --testTimeout=20000
node_modules/.bin/biome check src/components/openapi/OpenApiSchemaTree.tsx src/components/openapi/OpenApiSchema.tsx src/components/openapi/OpenApiSchemaTree.test.tsx src/components/openapi/OpenApiSchema.test.tsx src/components/openapi/FumadocsOpenApiContent.test.tsx
git diff --check
git add src/components/openapi/OpenApiSchemaTree.tsx src/components/openapi/OpenApiSchema.tsx src/components/openapi/OpenApiSchemaTree.test.tsx src/components/openapi/OpenApiSchema.test.tsx src/components/openapi/FumadocsOpenApiContent.test.tsx
git commit -m "feat: remove OpenAPI schema filter toolbar"
```

## Task 2：实现方案 A 状态颜色和 Deprecated 删除线

**Files:**

- Modify: `src/components/openapi/OpenApiSchemaFieldRow.tsx`
- Modify: `src/components/openapi/OpenApiSchema.tsx`
- Test: `src/components/openapi/OpenApiSchemaFieldRow.test.tsx`
- Test: `src/components/openapi/OpenApiSchema.test.tsx`

- [ ] **Step 1: 写失败测试。**

Deprecated fixture 必须包含合法 schema 基础字段。断言：

```tsx
expect(screen.getByText('id')).toHaveClass('line-through');
expect(screen.getByText('string')).not.toHaveClass('line-through');
expect(screen.getByText('The user identifier.')).not.toHaveClass('line-through');
expect(within(row).getByText('Required')).toHaveClass('openapi-schema-status', 'border-red-200', 'bg-red-50', 'text-red-700');
expect(within(row).getByText('Optional')).toHaveClass('openapi-schema-status', 'border-border', 'bg-muted', 'text-muted-foreground');
expect(within(row).getByText('Deprecated')).toHaveClass('openapi-schema-status', 'border-orange-200', 'bg-orange-50', 'text-orange-800');
```

- [ ] **Step 2: 运行红灯。**

```bash
/Users/yejiayi/.bun/bin/bun run test src/components/openapi/OpenApiSchemaFieldRow.test.tsx src/components/openapi/OpenApiSchema.test.tsx --testTimeout=20000
```

Expected: FAIL，因为当前 Required 使用默认 primary 样式，Deprecated 没有方案 A 背景，字段名没有删除线。

- [ ] **Step 3: 实现状态样式。**

字段名只在 deprecated 时增加删除线：

```tsx
<code
  className={cn(
    'min-w-0 break-words font-mono text-sm font-semibold [overflow-wrap:anywhere]',
    node.schema.deprecated && 'line-through decoration-2',
  )}
>
  {node.name}
</code>
```

三个 badge 均使用 `variant="outline"` 和 `openapi-schema-status`。Required 使用 `border-red-200 bg-red-50 text-red-700`，Optional 使用 `border-border bg-muted text-muted-foreground`，Deprecated 使用 `border-orange-200 bg-orange-50 text-orange-800`；暗色类提供对应的 dark 版本。状态区继续使用 `ms-auto flex shrink-0`，copy link、type、描述和 allowed values 保持原结构。

- [ ] **Step 4: 删除 Deprecated 重复 tag 并提交。**

`renderRemainingInfoTags` 只返回现有 schema info tags，不再将 `node.schema.deprecated` 追加到描述下方；labels 保留：

```tsx
deprecated: translate('Deprecated', 'Deprecated'),
```

```bash
/Users/yejiayi/.bun/bin/bun run test src/components/openapi/OpenApiSchemaFieldRow.test.tsx src/components/openapi/OpenApiSchema.test.tsx --testTimeout=20000
node_modules/.bin/biome check src/components/openapi/OpenApiSchemaFieldRow.tsx src/components/openapi/OpenApiSchema.tsx src/components/openapi/OpenApiSchemaFieldRow.test.tsx src/components/openapi/OpenApiSchema.test.tsx
git diff --check
git add src/components/openapi/OpenApiSchemaFieldRow.tsx src/components/openapi/OpenApiSchema.tsx src/components/openapi/OpenApiSchemaFieldRow.test.tsx src/components/openapi/OpenApiSchema.test.tsx
git commit -m "feat: clarify OpenAPI parameter statuses"
```

## Task 3：补齐 join 集成和 CSS 回归

**Files:**

- Modify: `src/components/openapi/OpenApiSchema.test.tsx`
- Modify: `src/components/openapi/FumadocsOpenApiContent.test.tsx`
- Modify: `src/components/openapi/OpenApiSchemaFieldRow.test.tsx`
- Modify: `src/components/openapi/OpenApiSchemaTree.test.tsx`
- Modify: `src/styles/app-css-regressions.test.ts`

- [ ] **Step 1: 覆盖 join 的两处 schema。**

使用现有 join bundled document，不修改 YAML。Request Body 和 Response Body 都断言没有 `input[placeholder="Filter Properties"]`；Request Body 还断言 `properties.channel`、`properties.remote_rtc_uids` 的字段节点和 `data-openapi-schema-path` 保持存在。

- [ ] **Step 2: 覆盖状态和 native find。**

FieldRow/Schema fixture 断言 Required、Optional、Deprecated 的文字、颜色 class、Deprecated 字段名删除线、type/description 无删除线、Deprecated 不重复渲染；Tree fixture 断言折叠 children wrapper 仍有 `hidden="until-found"` 和后代 DOM，手动展开按钮仍有正确 `aria-expanded`。

- [ ] **Step 3: 让 CSS 无横向连接线断言有效。**

使用 PostCSS `walkRules` 收集 selector，而不是在 `rule.nodes` 中寻找伪元素 declaration：

```tsx
const guideSelectors: string[] = [];
appCssRoot.walkRules((rule) => {
  const selector = normalizeSelector(rule.selector);
  if (selector.includes('.openapi-schema-children')) guideSelectors.push(selector);
});
for (const selector of guideSelectors) {
  expect(selector).not.toContain('::before');
  expect(selector).not.toContain('::after');
}
```

同时保留桌面 `16px`、移动 `8px`、逻辑 border 和 `[hidden]` 透明 border 的断言。

- [ ] **Step 4: 运行相关 suite 并提交。**

```bash
/Users/yejiayi/.bun/bin/bun run test src/lib/openapi/schema-view.test.ts src/components/openapi/OpenApiSchemaFieldRow.test.tsx src/components/openapi/OpenApiSchemaTree.test.tsx src/components/openapi/OpenApiSchema.test.tsx src/components/openapi/FumadocsOpenApiContent.test.tsx src/styles/app-css-regressions.test.ts --testTimeout=20000
node_modules/.bin/biome check src/components/openapi/OpenApiSchema.test.tsx src/components/openapi/FumadocsOpenApiContent.test.tsx src/components/openapi/OpenApiSchemaFieldRow.test.tsx src/components/openapi/OpenApiSchemaTree.test.tsx src/styles/app-css-regressions.test.ts
git diff --check
git add src/components/openapi/OpenApiSchema.test.tsx src/components/openapi/FumadocsOpenApiContent.test.tsx src/components/openapi/OpenApiSchemaFieldRow.test.tsx src/components/openapi/OpenApiSchemaTree.test.tsx src/styles/app-css-regressions.test.ts
git commit -m "test: cover OpenAPI native find and status polish"
```

Expected: 6 个测试文件全部通过；runtime 和 OpenAPI source 无新增变更。

## Task 4：最终静态和浏览器验证

**Files:** 验证 Tasks 1–3 的全部变更文件。

- [ ] **Step 1: 运行最终静态检查。**

```bash
/Users/yejiayi/.bun/bin/bun run types:check
node_modules/.bin/biome check src/components/openapi/OpenApiSchema.tsx src/components/openapi/OpenApiSchema.test.tsx src/components/openapi/OpenApiSchemaFieldRow.tsx src/components/openapi/OpenApiSchemaFieldRow.test.tsx src/components/openapi/OpenApiSchemaTree.tsx src/components/openapi/OpenApiSchemaTree.test.tsx src/components/openapi/FumadocsOpenApiContent.tsx src/components/openapi/FumadocsOpenApiContent.test.tsx src/lib/openapi/schema-view.ts src/lib/openapi/schema-view.test.ts src/styles/app.css src/styles/app-css-regressions.test.ts
git diff --check
git status --short --branch
```

Expected：TypeScript、Biome 和 diff check exit 0；无 lockfile 或生成文件。

- [ ] **Step 2: 启动隔离服务。**

```bash
/Users/yejiayi/.bun/bin/bun run dev --host 127.0.0.1 --port 3015
```

若端口被占用，使用下一个可用端口并记录 URL；验证结束后停止服务。

- [ ] **Step 3: 1440px 浏览器验收。**

打开开发服务实际端口对应的 `http://127.0.0.1:3015/en/api-reference/api-ref/conversational-ai/join`；如果 3015 被占用，则使用启动命令输出的下一个可用端口。设置 1440×1000，用 agent-browser 检查：

```js
document.documentElement.scrollWidth === document.documentElement.clientWidth
document.querySelectorAll('[placeholder="Filter Properties"]').length === 0
document.querySelector('[data-openapi-method]')?.textContent?.trim() === 'POST'
document.querySelector('.openapi-examples-rail')?.getBoundingClientRect().width === 400
getComputedStyle(document.querySelector('.openapi-schema-children')).marginInlineStart === '16px'
```

视觉确认 Required 红色、Optional 灰色、Deprecated 橙色右对齐；Deprecated 名称有删除线；引导线从父级描述后连续贯穿后代。

- [ ] **Step 4: 390px 浏览器验收。**

切换到 390×844，确认 Request Body 和 Response Body 都没有 filter；点击局部展开按钮，并使用浏览器原生 `Ctrl+F`/`Cmd+F` 搜索 `channel` 或 `remote_rtc_uids`，确认隐藏后代可被定位并展开祖先。检查：

```js
document.documentElement.scrollWidth === document.documentElement.clientWidth
document.querySelectorAll('[placeholder="Filter Properties"]').length === 0
Array.from(document.querySelectorAll('.openapi-schema-children')).slice(0, 3).every((node) => {
  const style = getComputedStyle(node);
  return style.marginInlineStart === '8px' && style.paddingInlineStart === '8px';
})
```

- [ ] **Step 5: 清理并完成范围检查。**

停止 dev server 和 agent-browser session，然后运行：

```bash
git status --short --branch
git diff --stat 314ae1783..HEAD
git diff --check 314ae1783..HEAD
```

Expected：只包含 OpenAPI tree、FieldRow、OpenApiSchema、相关测试和 CSS；不包含 OpenAPI YAML、lockfile 或无关业务文件。
