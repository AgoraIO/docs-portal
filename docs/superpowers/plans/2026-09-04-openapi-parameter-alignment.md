# OpenAPI 参数对齐 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (- [ ] ) syntax for tracking.

**Goal:** 让 OpenAPI schema tree 中有无子参数的同级字段使用一致的参数名起始位置，并让每个参数描述与自身参数名对齐。

**Architecture:** 只调整 OpenApiSchemaFieldRow 的字段行内部布局。保留 expandable Button、aria-expanded、状态区、children wrapper、native find、hash/copy link 和 schema 数据模型。所有行共享固定 leading gutter；leaf 使用 aria-hidden 的空 slot，description 使用同一 gutter offset。

**Tech Stack:** React, TypeScript, Fumadocs schema UI, Tailwind utility classes, Vitest, Testing Library, agent-browser.

---

## 文件职责与范围

- Modify src/components/openapi/OpenApiSchemaFieldRow.tsx：固定 chevron gutter、字段内容列和 description offset。
- Test src/components/openapi/OpenApiSchemaFieldRow.test.tsx：验证 expandable/leaf 的共同 gutter、description offset、键盘交互和无障碍。
- Test src/components/openapi/OpenApiSchemaTree.test.tsx：验证递归 tree 的局部展开、children guide 和 FieldRow 结构。
- Test src/components/openapi/OpenApiSchema.test.tsx：验证真实 schema 的同级字段结构和 Deprecated 删除线。
- Test src/components/openapi/FumadocsOpenApiContent.test.tsx：验证 join 页面中的 pipeline_id、properties、preset 字段结构。
- Modify src/styles/app.css：仅在 utility class 不足时增加字段 leading/description 稳定样式；保留已有 guide 规则。
- Test src/styles/app-css-regressions.test.ts：验证新增对齐样式和 guide 没有横向伪元素。

## Task 1：统一参数名的 chevron gutter

**Files:** OpenApiSchemaFieldRow.tsx、OpenApiSchemaFieldRow.test.tsx

- [ ] Step 1：写失败测试。

渲染一个 profile expandable node 和一个 pipeline_id leaf node。为两行增加 data-testid=expandable-leading 和 data-testid=leaf-leading，断言两者均有 openapi-schema-field-leading；两者都包含 data-openapi-field-gutter；expandable gutter 内有 Button，leaf gutter 内没有 Button。

同时断言 expandable 的按钮仍使用 name=Expand profile properties 和 aria-expanded=false，点击后变为 true。

~~~tsx
expect(screen.getByTestId('expandable-leading')).toHaveClass(
  'openapi-schema-field-leading',
);
expect(screen.getByTestId('leaf-leading')).toHaveClass(
  'openapi-schema-field-leading',
);
expect(
  screen.getByTestId('leaf-leading').querySelector(
    '[data-openapi-field-gutter] button',
  ),
).toBeNull();
~~~

- [ ] Step 2：运行红灯。

~~~bash
/Users/yejiayi/.bun/bin/bun run test src/components/openapi/OpenApiSchemaFieldRow.test.tsx --testTimeout=20000
~~~

Expected：FAIL，因为当前 leaf 没有 chevron slot 和共同 gutter。

- [ ] Step 3：实现固定 gutter。

在 FieldRow 顶部字段区域保留状态区不变，左侧改为固定两列：12px gutter 加 6px gap，再进入字段内容。expandable 的现有 Button 保留在 gutter/内容组合中；leaf 使用 aria-hidden=true 的 12px 空 span。字段内容包装为 openapi-schema-field-content。

~~~tsx
<div
  className="openapi-schema-field-leading flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1"
  data-testid={expandable ? 'expandable-leading' : 'leaf-leading'}
>
  <span
    aria-hidden={!expandable}
    className="flex size-3 shrink-0 items-center justify-center"
    data-openapi-field-gutter
  >
    {expandable ? (
      <Button
        aria-expanded={expanded}
        aria-label={`${expanded ? labels.collapse : labels.expand} ${node.name} ${labels.properties}`}
        onClick={() => onExpandedChange(!expanded)}
        size="sm"
        type="button"
        variant="ghost"
      >
        <ChevronRight className="size-3 shrink-0" />
      </Button>
    ) : null}
  </span>
  <div className="openapi-schema-field-content min-w-0 flex-1">
    {fieldIdentity}
  </div>
</div>
~~~

实际代码不得使用无法复制的省略号；保留现有 aria-label、onClick、copy link、status badge、type、variant 和 metadata。

- [ ] Step 4：验证并提交。

~~~bash
/Users/yejiayi/.bun/bin/bun run test src/components/openapi/OpenApiSchemaFieldRow.test.tsx --testTimeout=20000
node_modules/.bin/biome check src/components/openapi/OpenApiSchemaFieldRow.tsx src/components/openapi/OpenApiSchemaFieldRow.test.tsx
git diff --check
git add src/components/openapi/OpenApiSchemaFieldRow.tsx src/components/openapi/OpenApiSchemaFieldRow.test.tsx
git commit -m "fix: align OpenAPI parameter gutters"
~~~

## Task 2：让描述与参数名共用左边界

**Files:** OpenApiSchemaFieldRow.tsx、OpenApiSchemaFieldRow.test.tsx、OpenApiSchema.test.tsx、必要时 src/styles/app.css

- [ ] Step 1：写失败测试。

expandable 和 leaf 都传入描述，断言各自 description 使用 openapi-schema-description-offset，字段内容使用 openapi-schema-field-content。断言 expandable/leaf 描述 offset class 相同；Deprecated 字段的 name 有 line-through，但 type 和 description 没有。

~~~tsx
expect(screen.getByTestId('expandable-description')).toHaveClass(
  'openapi-schema-description-offset',
);
expect(screen.getByTestId('leaf-description')).toHaveClass(
  'openapi-schema-description-offset',
);
expect(screen.getByText('id')).toHaveClass('line-through');
expect(screen.getByText('string')).not.toHaveClass('line-through');
~~~

- [ ] Step 2：运行红灯。

~~~bash
/Users/yejiayi/.bun/bin/bun run test src/components/openapi/OpenApiSchemaFieldRow.test.tsx src/components/openapi/OpenApiSchema.test.tsx --testTimeout=20000
~~~

Expected：FAIL，因为当前 description 未使用共享 offset，字段行结构也未提供稳定内容 class。

- [ ] Step 3：实现 description offset。

保持字段名和 type 的视觉顺序，在 description 加 openapi-schema-description-offset。12px gutter + 6px gap 的实际偏移使用 1.125rem；优先用现有 Tailwind arbitrary utility，若需要可维护 selector，则在 app.css 增加：

~~~css
.openapi-schema-description-offset {
  padding-inline-start: 1.125rem;
}
~~~

description 必须继续使用 min-w-0、break-words 和 overflow-wrap:anywhere。不要给 type、status badge、copy link 或 allowed values 添加删除线/额外偏移。

- [ ] Step 4：验证并提交。

~~~bash
/Users/yejiayi/.bun/bin/bun run test src/components/openapi/OpenApiSchemaFieldRow.test.tsx src/components/openapi/OpenApiSchema.test.tsx --testTimeout=20000
node_modules/.bin/biome check src/components/openapi/OpenApiSchemaFieldRow.tsx src/components/openapi/OpenApiSchemaFieldRow.test.tsx src/components/openapi/OpenApiSchema.test.tsx src/styles/app.css
git diff --check
git add src/components/openapi/OpenApiSchemaFieldRow.tsx src/components/openapi/OpenApiSchemaFieldRow.test.tsx src/components/openapi/OpenApiSchema.test.tsx src/styles/app.css
git commit -m "fix: align OpenAPI parameter descriptions"
~~~

## Task 3：补齐 tree 和 join 集成回归

**Files:** OpenApiSchemaTree.test.tsx、FumadocsOpenApiContent.test.tsx、OpenApiSchema.test.tsx、app-css-regressions.test.ts

- [ ] Step 1：增加 tree 结构回归。

使用现有多层 fixture，断言 expandable 和 leaf 都有 leading gutter；折叠父节点后 children wrapper 仍有 hidden=until-found 和后代 DOM；展开 Button 的 aria-expanded 可切换。不要恢复 Filter Properties、match count 或全局 Expand/Collapse all。

- [ ] Step 2：增加 join 集成回归。

限定 Request Body schema tree，断言 pipeline_id、properties、preset 对应 row 均包含 openapi-schema-field-content 和 openapi-schema-description-offset；properties.channel 节点的 data-openapi-schema-path 仍存在。Request Body 和 Response Body 均没有 Filter Properties。

- [ ] Step 3：验证 CSS。

继续断言 .openapi-schema-children 的逻辑 border、桌面 16px、移动 8px、hidden 透明 border；遍历 PostCSS rule selector，所有包含 .openapi-schema-children 的 selector 不得含 ::before 或 ::after。若新增 description offset CSS，断言 padding-inline-start=1.125rem。

- [ ] Step 4：运行相关 suite 并提交。

~~~bash
/Users/yejiayi/.bun/bin/bun run test src/lib/openapi/schema-view.test.ts src/components/openapi/OpenApiSchemaFieldRow.test.tsx src/components/openapi/OpenApiSchemaTree.test.tsx src/components/openapi/OpenApiSchema.test.tsx src/components/openapi/FumadocsOpenApiContent.test.tsx src/styles/app-css-regressions.test.ts --testTimeout=20000
node_modules/.bin/biome check src/components/openapi/OpenApiSchemaTree.test.tsx src/components/openapi/FumadocsOpenApiContent.test.tsx src/components/openapi/OpenApiSchemaFieldRow.test.tsx src/components/openapi/OpenApiSchema.test.tsx src/styles/app-css-regressions.test.ts
git diff --check
git add src/components/openapi/OpenApiSchemaTree.test.tsx src/components/openapi/FumadocsOpenApiContent.test.tsx src/components/openapi/OpenApiSchema.test.tsx src/styles/app-css-regressions.test.ts
git commit -m "test: cover OpenAPI parameter alignment"
~~~

Expected：6 个测试文件全部通过，runtime 仅包含 FieldRow 对齐和必要 CSS。

## Task 4：最终验证与 PR 更新

**Files:** 验证 Tasks 1–3 全部文件。

- [ ] Step 1：运行静态检查。

~~~bash
/Users/yejiayi/.bun/bin/bun run types:check
node_modules/.bin/biome check src/components/openapi/OpenApiSchema.tsx src/components/openapi/OpenApiSchema.test.tsx src/components/openapi/OpenApiSchemaFieldRow.tsx src/components/openapi/OpenApiSchemaFieldRow.test.tsx src/components/openapi/OpenApiSchemaTree.tsx src/components/openapi/OpenApiSchemaTree.test.tsx src/components/openapi/FumadocsOpenApiContent.tsx src/components/openapi/FumadocsOpenApiContent.test.tsx src/lib/openapi/schema-view.ts src/lib/openapi/schema-view.test.ts src/styles/app.css src/styles/app-css-regressions.test.ts
git diff --check
git status --short --branch
~~~

Expected：全部 exit 0，worktree 无未提交变更或 lockfile。

- [ ] Step 2：启动隔离开发服务。

~~~bash
/Users/yejiayi/.bun/bin/bun run dev --host 127.0.0.1 --port 3017
~~~

验证结束后停止服务；若端口被占用，使用下一个可用端口。

- [ ] Step 3：浏览器验收。

打开 http://127.0.0.1:3017/en/api-reference/api-ref/conversational-ai/join，分别设置 1440×1000 与 390×844。用 agent-browser 检查：

~~~js
document.querySelectorAll('[placeholder="Filter Properties"]').length === 0
document.documentElement.scrollWidth === document.documentElement.clientWidth
~~~

在 1440px 下，取 pipeline_id、properties、preset 对应 field row 内第一个 code 和 description 的 getBoundingClientRect().left，三者名称 left 最大最小差小于 1px；每行 name left 与自身 description left 差小于 1px。确认可展开字段的 Button 可键盘操作，leaf gutter 不在 tab 顺序。

在 390px 下，确认无水平滚动，长字段可换行，children guide 仍为 8px margin/padding；折叠 children 仍保留 hidden=until-found 和后代 DOM；使用 Ctrl+F/Cmd+F 搜索 channel 或 remote_rtc_uids，确认原生查找可定位隐藏后代。

- [ ] Step 4：清理并更新 PR。

停止 dev server 和 agent-browser session，清理临时浏览器状态，运行：

~~~bash
git status --short --branch
git diff --stat 2267676b2..HEAD
git diff --check 2267676b2..HEAD
git push origin codex/pr-1034-readability-fixes
gh pr view 1063 --repo AgoraIO/docs-portal --json url,state,headRefName,baseRefName
~~~

Expected：PR #1063 head 更新，目标仍为 codex/rest-api-renderer-scanability-main；diff 仅包含参数对齐相关 FieldRow、必要 CSS 和测试。
