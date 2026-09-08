# OpenAPI 示例滚动条优化 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans (recommended) to implement this plan task-by-task. Steps use checkbox (- [ ] ) syntax for tracking.

**Goal:** 让 OpenAPI examples rail 不再显示无意义的横向 scrollbar，并让代码块 scrollbar 默认隐藏、操作或滚动时短暂显示且更细。

**Architecture:** 复用 OpenApiCodePreview 现有的 MutationObserver 和 data-openapi-code-viewport 标记，为每个代码 viewport 绑定 scroll listener 和单个隐藏 timer，使用 data-scrollbar-visible 表达 transient state。CSS 只作用于 OpenAPI code viewport 和 examples rail；代码 viewport 保留自己的横向/纵向滚动，rail 通过可收缩宽度约束避免产生额外横向 scrollbar。

**Tech Stack:** React, TypeScript, CSS, Vitest, Testing Library, PostCSS, agent-browser.

---

## 文件职责与范围

- Modify src/components/openapi/OpenApiCodePreview.tsx：绑定动态代码 viewport 的 scroll listener，维护 transient scrollbar 状态并清理 timer。
- Test src/components/openapi/OpenApiCodePreview.test.tsx：覆盖初始/动态 viewport、scroll 显示、700ms 隐藏和卸载清理。
- Modify src/components/openapi/OpenApiExamplesRail.tsx：给 rail 及 content 增加可收缩宽度 class。
- Test src/components/openapi/OpenApiExamplesRail.test.tsx：覆盖 rail/content 的宽度约束 class。
- Modify src/styles/app.css：代码 scrollbar 默认隐藏/hover/focus/data 状态显示、WebKit 6px、corner；rail 宽度和横向溢出约束。
- Test src/styles/app-css-regressions.test.ts：验证新增 scrollbar/rail CSS 不影响 docs-scrollbar。
- Test src/components/openapi/FumadocsOpenApiContent.test.tsx：覆盖 examples rail 与 code viewport 的结构。
- 不修改 OpenAPI source、代码字符串、复制按钮、语言 tabs 或页面级滚动策略。

## Task 1：代码 viewport transient scrollbar 状态

Files: src/components/openapi/OpenApiCodePreview.tsx、src/components/openapi/OpenApiCodePreview.test.tsx

- [ ] Step 1：写失败测试。

在现有 CodeTabs fixture 中增加：

~~~tsx
it('shows a code viewport scrollbar while scrolling and hides it after a quiet period', () => {
  vi.useFakeTimers();
  try {
    render(<OpenApiCodePreview><CodeTabs /></OpenApiCodePreview>);
    const viewport = screen.getByText(/curl --request/)
      .closest('.fd-scroll-container') as HTMLElement;

    expect(viewport).not.toHaveAttribute('data-scrollbar-visible');
    viewport.dispatchEvent(new Event('scroll'));
    expect(viewport).toHaveAttribute('data-scrollbar-visible', '');
    vi.advanceTimersByTime(699);
    expect(viewport).toHaveAttribute('data-scrollbar-visible', '');
    vi.advanceTimersByTime(1);
    expect(viewport).not.toHaveAttribute('data-scrollbar-visible');
  } finally {
    vi.useRealTimers();
  }
});
~~~

再增加连续 scroll 会重置同一个 700ms timer 的测试。断言第二次 scroll 后 699ms 仍可见，再过 1ms 隐藏。

- [ ] Step 2：运行红灯。

~~~bash
/Users/yejiayi/.bun/bin/bun run test src/components/openapi/OpenApiCodePreview.test.tsx --testTimeout=20000
~~~

Expected：新增测试失败，因为当前 viewport 没有 scroll listener 和 data-scrollbar-visible。

- [ ] Step 3：实现绑定和清理。

在 OpenApiCodePreview 的 effect 内维护 Map<HTMLElement, number> timers 和 Map<HTMLElement, () => void> cleanups。bindViewport 的核心行为：

~~~tsx
const showScrollbar = () => {
  viewport.setAttribute('data-scrollbar-visible', '');
  const previous = timers.get(viewport);
  if (previous !== undefined) window.clearTimeout(previous);
  timers.set(viewport, window.setTimeout(() => {
    viewport.removeAttribute('data-scrollbar-visible');
    timers.delete(viewport);
  }, 700));
};
~~~

实现要求：

1. 初始 querySelectorAll 和 MutationObserver 新增 subtree 都调用 bindViewport。
2. 每个 viewport 只绑定一次 scroll listener，listener 使用 passive true。
3. effect cleanup 必须 disconnect observer、移除所有 listener、清理所有 timer 和 data-scrollbar-visible 属性。
4. 保持现有 data-openapi-code-viewport 标记和 tab 动态插入行为。
5. 不用 React state 驱动滚动显隐，避免滚动时重渲染 rail。

- [ ] Step 4：验证并提交。

~~~bash
/Users/yejiayi/.bun/bin/bun run test src/components/openapi/OpenApiCodePreview.test.tsx --testTimeout=20000
node_modules/.bin/biome check src/components/openapi/OpenApiCodePreview.tsx src/components/openapi/OpenApiCodePreview.test.tsx
git diff --check
git add src/components/openapi/OpenApiCodePreview.tsx src/components/openapi/OpenApiCodePreview.test.tsx
git commit -m "feat: reveal OpenAPI code scrollbars on scroll"
~~~

## Task 2：代码块 scrollbar CSS

Files: src/styles/app.css、src/styles/app-css-regressions.test.ts

- [ ] Step 1：写失败 CSS 测试。

使用 PostCSS 断言 OpenAPI code viewport：

~~~tsx
const viewport = getRuleBody(
  '.openapi-operation figure.shiki > .fd-scroll-container',
).rule;
expectDeclaration(viewport, 'scrollbar-width', 'thin');
expectDeclaration(viewport, 'scrollbar-color', 'transparent transparent');

const selectors = getSelectorsContaining(
  '.openapi-operation figure.shiki > .fd-scroll-container',
);
expect(selectors).toEqual(expect.arrayContaining([
  '.openapi-operation figure.shiki > .fd-scroll-container:hover',
  '.openapi-operation figure.shiki > .fd-scroll-container:focus-within',
  '.openapi-operation figure.shiki > .fd-scroll-container[data-scrollbar-visible]',
]));
~~~

同时断言对应 WebKit scrollbar 的 width/height 为 6px，corner background 为 transparent，且没有修改 docs-scrollbar 的既有声明。

- [ ] Step 2：运行红灯。

~~~bash
/Users/yejiayi/.bun/bin/bun run test src/styles/app-css-regressions.test.ts --testTimeout=20000
~~~

Expected：FAIL，因为现有 OpenAPI 规则只在移动 media 中设置 height 12px，默认 thumb 始终可见。

- [ ] Step 3：实现 CSS。

在 OpenAPI scoped code viewport 规则中加入：

~~~css
.openapi-operation figure.shiki > .fd-scroll-container {
  max-width: 100%;
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
}

.openapi-operation figure.shiki > .fd-scroll-container:hover,
.openapi-operation figure.shiki > .fd-scroll-container:focus-within,
.openapi-operation figure.shiki > .fd-scroll-container[data-scrollbar-visible] {
  scrollbar-color: color-mix(in srgb, var(--ink-4) 48%, transparent) transparent;
}

.openapi-operation figure.shiki > .fd-scroll-container::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.openapi-operation figure.shiki > .fd-scroll-container::-webkit-scrollbar-thumb {
  border: 1px solid transparent;
  border-radius: 999px;
  background: color-mix(in srgb, var(--ink-4) 48%, transparent);
  background-clip: padding-box;
}

.openapi-operation figure.shiki > .fd-scroll-container:not(:hover):not(:focus-within):not([data-scrollbar-visible])::-webkit-scrollbar-thumb {
  background: transparent;
}

.openapi-operation figure.shiki > .fd-scroll-container::-webkit-scrollbar-corner {
  background: transparent;
}
~~~

合并或删除现有移动端 12px scrollbar height 规则，避免后定义规则放大 scrollbar。保留 code viewport 的 overflow auto 和 overscroll-behavior contain。

- [ ] Step 4：验证并提交。

~~~bash
/Users/yejiayi/.bun/bin/bun run test src/styles/app-css-regressions.test.ts src/components/openapi/OpenApiCodePreview.test.tsx --testTimeout=20000
node_modules/.bin/biome check src/styles/app.css src/styles/app-css-regressions.test.ts
git diff --check
git add src/styles/app.css src/styles/app-css-regressions.test.ts
git commit -m "style: soften OpenAPI code scrollbars"
~~~

## Task 3：examples rail 宽度约束

Files: src/components/openapi/OpenApiExamplesRail.tsx、src/components/openapi/OpenApiExamplesRail.test.tsx、src/styles/app.css、src/styles/app-css-regressions.test.ts、src/components/openapi/FumadocsOpenApiContent.test.tsx

- [ ] Step 1：写失败测试。

断言 rail 和 content 有可收缩宽度 class：

~~~tsx
const rail = screen.getByTestId('openapi-examples-rail');
const content = screen.getByTestId('openapi-examples-rail-content');
expect(rail).toHaveClass('min-w-0', 'max-w-full');
expect(content).toHaveClass('min-w-0', 'max-w-full');
~~~

CSS regression 断言 rail 的 overflow-x 为 clip、overflow-y 为 auto，rail/content 的 min-width 为 0、max-width 为 100%。

- [ ] Step 2：运行红灯。

~~~bash
/Users/yejiayi/.bun/bin/bun run test src/components/openapi/OpenApiExamplesRail.test.tsx src/styles/app-css-regressions.test.ts --testTimeout=20000
~~~

Expected：FAIL，因为当前 rail/content 没有明确的 max-width 和横向溢出约束。

- [ ] Step 3：实现 rail 约束。

OpenApiExamplesRail 使用：

~~~tsx
<div className="openapi-examples-rail min-w-0 max-w-full" data-testid="openapi-examples-rail">
  <div className="openapi-examples-rail-content min-w-0 max-w-full" data-testid="openapi-examples-rail-content">
    {children}
  </div>
</div>
~~~

app.css 使用：

~~~css
.openapi-examples-rail,
.openapi-examples-rail-content {
  min-width: 0;
  max-width: 100%;
}

.openapi-examples-rail {
  overflow-x: clip;
  overflow-y: auto;
}
~~~

这只是消除 rail 内部没有横向滚动需求的溢出责任；代码 viewport 必须通过自身 overflow auto 处理长代码，不能依赖 rail 裁剪代码。保留 rail 的 sticky、max-block-size、overscroll-behavior 和 400px grid。

- [ ] Step 4：验证并提交。

~~~bash
/Users/yejiayi/.bun/bin/bun run test src/components/openapi/OpenApiExamplesRail.test.tsx src/components/openapi/FumadocsOpenApiContent.test.tsx src/styles/app-css-regressions.test.ts --testTimeout=20000
node_modules/.bin/biome check src/components/openapi/OpenApiExamplesRail.tsx src/components/openapi/OpenApiExamplesRail.test.tsx src/components/openapi/FumadocsOpenApiContent.test.tsx src/styles/app.css src/styles/app-css-regressions.test.ts
git diff --check
git add src/components/openapi/OpenApiExamplesRail.tsx src/components/openapi/OpenApiExamplesRail.test.tsx src/components/openapi/FumadocsOpenApiContent.test.tsx src/styles/app.css src/styles/app-css-regressions.test.ts
git commit -m "fix: contain OpenAPI examples rail width"
~~~

## Task 4：最终验证与浏览器验收

Files: 验证 Tasks 1–3 的全部变更文件。

- [ ] Step 1：运行相关测试和静态检查。

~~~bash
/Users/yejiayi/.bun/bin/bun run test src/lib/openapi/schema-view.test.ts src/components/openapi/OpenApiSchemaFieldRow.test.tsx src/components/openapi/OpenApiSchemaTree.test.tsx src/components/openapi/OpenApiSchema.test.tsx src/components/openapi/FumadocsOpenApiContent.test.tsx src/components/openapi/OpenApiCodePreview.test.tsx src/components/openapi/OpenApiExamplesRail.test.tsx src/styles/app-css-regressions.test.ts --testTimeout=20000
/Users/yejiayi/.bun/bin/bun run types:check
node_modules/.bin/biome check src/components/openapi/OpenApiCodePreview.tsx src/components/openapi/OpenApiCodePreview.test.tsx src/components/openapi/OpenApiExamplesRail.tsx src/components/openapi/OpenApiExamplesRail.test.tsx src/components/openapi/FumadocsOpenApiContent.tsx src/components/openapi/FumadocsOpenApiContent.test.tsx src/components/openapi/OpenApiSchema.tsx src/components/openapi/OpenApiSchemaFieldRow.tsx src/components/openapi/OpenApiSchemaTree.tsx src/components/openapi/OpenApiSchemaTree.test.tsx src/lib/openapi/schema-view.ts src/styles/app.css src/styles/app-css-regressions.test.ts
git diff --check
~~~

Expected：所有测试、类型检查和 Biome 通过。

- [ ] Step 2：启动隔离开发服务。

~~~bash
/Users/yejiayi/.bun/bin/bun run dev --host 127.0.0.1 --port 3019
~~~

使用 agent-browser 打开：
http://127.0.0.1:3019/en/api-reference/api-ref/conversational-ai/join

- [ ] Step 3：1440px 验收。

设置 1440×1000，检查：

~~~js
document.documentElement.scrollWidth === document.documentElement.clientWidth
document.querySelectorAll('.openapi-examples-rail').length === 1
document.querySelector('.openapi-examples-rail')?.getBoundingClientRect().width === 400
document.querySelectorAll('[data-openapi-code-viewport]').length > 0
document.querySelectorAll('[placeholder="Filter Properties"]').length === 0
~~~

在代码 viewport 未 hover/focus/scroll 时确认 scrollbar 颜色透明；dispatch scroll 后有 data-scrollbar-visible，700ms 后移除；确认 rail 没有横向 overflow。

- [ ] Step 4：390px 触摸/滚动验收。

设置 390×844，确认：

~~~js
document.documentElement.scrollWidth === document.documentElement.clientWidth
document.querySelector('.openapi-examples-rail')?.getBoundingClientRect().width <= 375
document.querySelectorAll('[placeholder="Filter Properties"]').length === 0
~~~

dispatch scroll 模拟触摸滚动，确认代码 viewport 短暂显示 data-scrollbar-visible 后隐藏。确认长代码仍可在 code viewport 内横向滚动，rail 不产生横向滚动。

- [ ] Step 5：清理和范围确认。

停止 dev server、agent-browser 和临时状态，然后运行：

~~~bash
git status --short --branch
git diff --stat b94014fd2..HEAD
git diff --check b94014fd2..HEAD
~~~

Expected：只包含 OpenApiCodePreview、OpenApiExamplesRail、app.css 和对应测试，不修改 OpenAPI YAML 或 lockfile。
