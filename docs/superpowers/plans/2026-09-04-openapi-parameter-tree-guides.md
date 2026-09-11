# OpenAPI 参数父子层级与状态标签优化 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在现有 OpenAPI schema tree 中加入参考图风格的连续父级竖向引导线，并将 Required、Optional、Deprecated 统一放在参数行右侧。

**Architecture:** 保留现有递归 schema view、搜索和展开状态。每个 expandable node 的子节点统一放入 children wrapper，由 wrapper 的左边框表达连续层级；字段行只负责参数身份、描述和右侧状态区。Deprecated 从描述下方 metadata 移到字段行状态区，避免重复显示。

**Tech Stack:** React, TypeScript, Fumadocs schema UI, Tailwind utility classes, global CSS, Vitest, Testing Library, Biome.

---

### Task 1: 扩展字段行状态区并移除 Deprecated 重复 tag

**Files:** `src/components/openapi/OpenApiSchemaFieldRow.tsx`, `src/components/openapi/OpenApiSchema.tsx`, 对应两个测试文件。

- [ ] **Step 1: Write failing tests.** 在 `OpenApiSchemaFieldRow.test.tsx` 增加 required + deprecated fixture，断言两个 badge 都有 `openapi-schema-status` class、Deprecated 使用橙色 class，并位于 `.openapi-schema-field-row` 的参数行。增加 `OpenApiSchemaFieldRowLabels.deprecated`。
- [ ] **Step 2: Verify failure.** Run `/Users/yejiayi/.bun/bin/bun run test src/components/openapi/OpenApiSchemaFieldRow.test.tsx --testTimeout=20000`; expected FAIL because当前只有 Required/Optional。
- [ ] **Step 3: Implement.** 给 labels 增加 `deprecated`；在 FieldRow 的 `ms-auto` 状态区追加 Deprecated badge，Required/Optional 互斥，三者均使用 `openapi-schema-status`。参数行的核心结构保持：

  ```tsx
  <div className="ms-auto flex shrink-0 items-center gap-2">
    <Badge className="openapi-schema-status" variant={node.required ? 'default' : 'outline'}>
      {node.required ? labels.required : labels.optional}
    </Badge>
    {node.schema.deprecated ? (
      <Badge className="openapi-schema-status border-orange-200 bg-orange-50 text-orange-800">
        {labels.deprecated}
      </Badge>
    ) : null}
    {/* existing copy-link button */}
  </div>
  ```

  在 `OpenApiSchema.tsx` 加入翻译并删除 `renderRemainingInfoTags` 中的 Deprecated 普通 tag。
- [ ] **Step 4: Verify and commit.** Run `/Users/yejiayi/.bun/bin/bun run test src/components/openapi/OpenApiSchemaFieldRow.test.tsx src/components/openapi/OpenApiSchema.test.tsx --testTimeout=20000`; expected all pass. Commit with `git add src/components/openapi/OpenApiSchemaFieldRow.tsx src/components/openapi/OpenApiSchemaFieldRow.test.tsx src/components/openapi/OpenApiSchema.tsx src/components/openapi/OpenApiSchema.test.tsx && git commit -m "feat: align OpenAPI schema status badges"`。

### Task 2: 给递归子树增加连续竖向引导线

**Files:** `src/components/openapi/OpenApiSchemaTree.tsx`, `src/components/openapi/OpenApiSchemaTree.test.tsx`, `src/styles/app.css`, `src/styles/app-css-regressions.test.ts`。

- [ ] **Step 1: Write failing tests.** 构造至少两层嵌套 fixture，断言 expandable parent 的直接子内容被包在 `.openapi-schema-children` 中，wrapper 包含所有后代；嵌套 parent 有第二个 wrapper；折叠后 wrapper 仍保留 `hidden="until-found"` 和后代 DOM。
- [ ] **Step 2: Verify failure.** Run `/Users/yejiayi/.bun/bin/bun run test src/components/openapi/OpenApiSchemaTree.test.tsx --testTimeout=20000`; expected FAIL because expanded descendants 当前直接渲染数组。
- [ ] **Step 3: Implement wrappers.** 在 `renderNodes` 中让展开和折叠分支都输出相同的 wrapper：

  ```tsx
  const renderedChildren = renderNodes(node.children, nextSeen, revealHiddenDescendants);
  const descendants = expanded
    ? <div className="openapi-schema-children">{renderedChildren}</div>
    : <HiddenDescendants className="openapi-schema-children" onBeforeMatch={() => revealNode(node.id)}>
        {renderedChildren}
      </HiddenDescendants>;
  ```

  实际代码按现有 conditional JSX 格式化，但必须保证 expanded 与 hidden 两条路径都只有一个 children wrapper。`HiddenDescendants` 接收相同 class，同时保留 `hidden="until-found"`、`beforematch`、节点 id、搜索和 focus 行为。
- [ ] **Step 4: Implement CSS.** 在 `src/styles/app.css` 增加以下规则，使用逻辑属性支持现有语言方向：

  ```css
  .openapi-schema-children {
    position: relative;
    margin-inline-start: 16px;
    padding-inline-start: 16px;
    border-inline-start: 1px solid color-mix(in srgb, var(--ink-1) 14%, transparent);
  }

  .openapi-schema-children .openapi-schema-children {
    margin-inline-start: 16px;
  }
  ```

  不添加 `::before` 横向连接线。wrapper 必须位于父参数描述之后，保证边框贯穿所有子参数、描述、enum/metadata 和嵌套 wrapper；折叠时边框随 hidden wrapper 一起消失。
- [ ] **Step 5: Verify and commit.** CSS regression 断言上述 class、border 和 margin 存在且没有新横线。Run `/Users/yejiayi/.bun/bin/bun run test src/components/openapi/OpenApiSchemaTree.test.tsx src/styles/app-css-regressions.test.ts --testTimeout=20000`; expected all pass. Commit with `git add src/components/openapi/OpenApiSchemaTree.tsx src/components/openapi/OpenApiSchemaTree.test.tsx src/styles/app.css src/styles/app-css-regressions.test.ts && git commit -m "feat: add continuous OpenAPI schema guides"`。

### Task 3: 完成 join 集成回归覆盖

**Files:** `src/components/openapi/OpenApiSchema.test.tsx`, `src/components/openapi/FumadocsOpenApiContent.test.tsx`, `src/components/openapi/OpenApiSchemaFieldRow.test.tsx`。

- [ ] **Step 1: Add nested fixture.** 使用包含 `properties.provider.name`、`properties.channel` 的 request body，设置 provider 为 deprecated；断言根级 wrapper、嵌套 wrapper、折叠隐藏和三种状态 badge。
- [ ] **Step 2: Preserve join search.** 保留 `properties.channel`、`properties.remote_rtc_uids` 完整路径搜索和定位断言，并增加页面存在 `.openapi-schema-children` 的断言；不修改 OpenAPI source。
- [ ] **Step 3: Run related suite.** Run `/Users/yejiayi/.bun/bin/bun run test src/lib/openapi/schema-view.test.ts src/components/openapi/OpenApiSchemaFieldRow.test.tsx src/components/openapi/OpenApiSchemaTree.test.tsx src/components/openapi/OpenApiSchema.test.tsx src/components/openapi/FumadocsOpenApiContent.test.tsx src/styles/app-css-regressions.test.ts --testTimeout=20000`; expected all related tests pass。Commit the integration test changes with `git commit -m "test: cover OpenAPI parameter hierarchy styling"`。

### Task 4: 最终验证与浏览器检查

**Files:** 验证 Tasks 1–3 的所有变更文件。

- [ ] **Step 1: Run checks.** Run focused `node_modules/.bin/biome check` on the changed TS/TSX/CSS files, `/Users/yejiayi/.bun/bin/bun run types:check`, and `git diff --check`; expected all exit 0。
- [ ] **Step 2: Browser smoke.** 1440px 下确认父级线从描述后连续到最后一个后代、嵌套对象有平行线、badge 同行右对齐；390px 下确认无页面横向溢出、长字段可换行、折叠同时隐藏子内容和线、搜索 `properties.channel` 仍可定位。
- [ ] **Step 3: Scope review.** Run `git status --short --branch` and `git diff --stat 314ae1783..HEAD`; expected only planned OpenAPI tree、field row、tests 和 CSS changes，无 lockfile 或无关源文件。
