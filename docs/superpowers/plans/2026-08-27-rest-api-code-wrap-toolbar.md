# REST API Code Wrap Toolbar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move `Wrap lines` into the code toolbar as an icon-only action and add an independent wrapping control to both Request and Response examples.

**Architecture:** Extend `OpenApiCodePreview` with a request/response role. The wrapper owns the local toggle and toolbar button, while CSS positions the icon in the existing tab row. `OpenApiExamplesRail` will only discover request viewports, so response wrapping remains natural-height and cannot change sticky request calculations.

**Tech Stack:** React, TypeScript, Vitest, Testing Library, Fumadocs OpenAPI generated tabs, CSS container queries, Biome.

---

### Task 1: Define the preview role contract with failing tests

**Files:**
- Modify: `src/components/openapi/OpenApiCodePreview.test.tsx`
- Modify: `src/components/openapi/FumadocsOpenApiContent.test.tsx`
- Modify: `src/components/openapi/OpenApiExamplesRail.test.tsx`

- [ ] **Step 1: Add the icon-only toolbar assertions**

In `OpenApiCodePreview.test.tsx`, update the existing toggle test to assert that
the button keeps the accessible name but has no visible text node, exposes a
`title` tooltip, and uses a stable toolbar class:

```tsx
const button = screen.getByRole('button', { name: 'Wrap lines' });
expect(button).toHaveClass('openapi-code-wrap-toggle');
expect(button).toHaveAttribute('title', 'Wrap lines');
expect(button.textContent).toBe('');
```

- [ ] **Step 2: Add request/response role assertions**

Render one preview with the default request role and one with
`codeRole="response"`.
Assert the roots expose `data-openapi-code-role="request"` and
`data-openapi-code-role="response"`. The response fixture may still mark its
viewport for shared wrapping CSS, but it must never receive the active request
viewport marker from `OpenApiExamplesRail`.

- [ ] **Step 3: Add the integration regression test before implementation**

In `FumadocsOpenApiContent.test.tsx`, render an operation with request and
response examples. Assert there are exactly two buttons named `Wrap lines`, one
inside `.openapi-request-examples` and one inside `.openapi-response-example`.
Click only the response button and assert its root has
`data-wrap-lines="true"` while the request root remains `false`.

- [ ] **Step 4: Add rail isolation assertions**

In `OpenApiExamplesRail.test.tsx`, provide one marked request viewport and one
response viewport. Assert the rail calculation observes only the request
viewport and applies `data-openapi-code-viewport-active` only to it.

- [ ] **Step 5: Run the new tests and verify they fail**

Run:

```bash
bun run test src/components/openapi/OpenApiCodePreview.test.tsx src/components/openapi/FumadocsOpenApiContent.test.tsx src/components/openapi/OpenApiExamplesRail.test.tsx
```

Expected: FAIL because Response is not wrapped, the button is text-based, and
the role/rail attributes do not exist yet.

- [ ] **Step 6: Commit the failing-test contract**

```bash
git add src/components/openapi/OpenApiCodePreview.test.tsx src/components/openapi/FumadocsOpenApiContent.test.tsx src/components/openapi/OpenApiExamplesRail.test.tsx
git commit -m "test: specify request and response wrap controls"
```

### Task 2: Implement the icon-only preview wrapper and role-aware viewport marking

**Files:**
- Modify: `src/components/openapi/OpenApiCodePreview.tsx`
- Modify: `src/components/openapi/OpenApiCodePreview.test.tsx`

- [ ] **Step 1: Add the role prop and stable root attributes**

Use a typed code role with request as the default:

```tsx
type OpenApiCodeRole = 'request' | 'response';

export function OpenApiCodePreview({
  children,
  codeRole = 'request',
  resetKey,
  wrapLabel = 'Wrap lines',
}: {
  children: ReactNode;
  codeRole?: OpenApiCodeRole;
  resetKey: string;
  wrapLabel?: string;
})
```

Set `data-openapi-code-role={codeRole}` on the root. Keep the current reset-key
behavior so both regions reset when the operation identity changes.

- [ ] **Step 2: Render the compact accessible control**

Replace the text button content with the existing `WrapText` icon and expose the
label through `aria-label` and `title`:

```tsx
<button
  aria-label={wrapLabel}
  aria-pressed={wrap}
  className="openapi-code-wrap-toggle"
  onClick={() => setWrap((value) => !value)}
  title={wrapLabel}
  type="button"
>
  <WrapText aria-hidden="true" className="size-3.5" />
</button>
```

Do not include the label as visible button text.

- [ ] **Step 3: Scope rail markers to Request previews**

Mark both roles with `data-openapi-code-viewport` so the shared wrapping CSS can
target either code block. The rail will scope its query to request-role
previews, so response viewports cannot be discovered by its active-viewport
selector.

- [ ] **Step 4: Run the focused component tests**

Run:

```bash
bun run test src/components/openapi/OpenApiCodePreview.test.tsx
```

Expected: PASS for icon-only rendering, tooltip/accessibility attributes, reset
behavior, and request-only viewport marking.

- [ ] **Step 5: Commit the wrapper change**

```bash
git add src/components/openapi/OpenApiCodePreview.tsx src/components/openapi/OpenApiCodePreview.test.tsx
git commit -m "feat: compact OpenAPI wrap control"
```

### Task 3: Add an independent Response preview wrapper

**Files:**
- Modify: `src/components/openapi/FumadocsOpenApiContent.tsx`
- Modify: `src/components/openapi/FumadocsOpenApiContent.test.tsx`

- [ ] **Step 1: Wrap response tabs with the response role**

In `OpenApiRightExamplesLayout`, replace the raw response slot with:

```tsx
<OpenApiCodePreview
  resetKey={`${getOpenApiCodePreviewResetKey(operation)}:response`}
  codeRole="response"
  wrapLabel={isZhCnLocale(locale) ? '自动换行' : 'Wrap lines'}
>
  {slots.responseTabs}
</OpenApiCodePreview>
```

Keep the existing Request wrapper and use the same localized label. The distinct
reset key prevents state leakage between the two wrapper instances.

- [ ] **Step 2: Verify independent interaction**

Extend the integration test from Task 1 to click Request and Response controls
separately, asserting each root changes only its own `data-wrap-lines` value.
Also assert the response code source text and copy button remain present.

- [ ] **Step 3: Verify operation reset behavior**

Render a second operation after enabling both controls and assert both new
preview roots start with `data-wrap-lines="false"`.

- [ ] **Step 4: Run integration tests**

```bash
bun run test src/components/openapi/FumadocsOpenApiContent.test.tsx
```

Expected: PASS, including existing generated-language and explicit-sample
coverage.

- [ ] **Step 5: Commit the response integration**

```bash
git add src/components/openapi/FumadocsOpenApiContent.tsx src/components/openapi/FumadocsOpenApiContent.test.tsx
git commit -m "feat: add response example wrap control"
```

### Task 4: Position toolbar controls and preserve response natural height

**Files:**
- Modify: `src/styles/app.css`
- Modify: `src/styles/app-css-regressions.test.ts`
- Modify: `src/components/openapi/OpenApiExamplesRail.tsx`
- Modify: `src/components/openapi/OpenApiExamplesRail.test.tsx`

- [ ] **Step 1: Add icon-toolbar positioning rules**

Make the preview wrapper the positioning context and remove the button from
normal flow:

```css
.openapi-code-preview {
  position: relative;
}

.openapi-code-wrap-toggle {
  position: absolute;
  inset-block-start: 3.2rem;
  inset-inline-end: 2.75rem;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  inline-size: 2rem;
  block-size: 2rem;
  border-radius: 0.375rem;
  color: var(--color-fd-muted-foreground);
}

.openapi-code-preview:has(> .openapi-code-sample-groups > select)
  .openapi-code-wrap-toggle {
  inset-block-start: 5.6rem;
}

.openapi-code-wrap-toggle:hover,
.openapi-code-wrap-toggle:focus-visible,
.openapi-code-preview[data-wrap-lines="true"] .openapi-code-wrap-toggle {
  background: var(--color-fd-accent);
  color: var(--color-fd-accent-foreground);
}
```

Use the existing border, focus, and dark-mode tokens rather than hard-coded
colors. Add a narrow-screen rule that keeps the icon inside the tab row without
introducing a new block row.

- [ ] **Step 2: Keep Response natural-height and out of rail calculations**

Add role-aware selectors:

```css
.openapi-code-preview[data-openapi-code-role="response"]
  [data-openapi-code-viewport] {
  /* biome-ignore lint/complexity/noImportantStyles: Override Fumadocs max-height for natural response examples. */
  max-block-size: none !important;
  overflow: visible;
}
```

Update `OpenApiExamplesRail` viewport queries to select only
`.openapi-code-preview[data-openapi-code-role="request"] [data-openapi-code-viewport]`.
The response code remains wrap-capable through the shared `data-wrap-lines`
rules, but cannot become the active constrained viewport or change the request
available-height calculation.

- [ ] **Step 3: Add CSS regression assertions**

In `src/styles/app-css-regressions.test.ts`, assert the stylesheet contains the
icon-only positioning, the active-state selector, and the response natural
height override. Assert the rail selector is request-role scoped.

- [ ] **Step 4: Run component and CSS tests**

```bash
bun run test src/components/openapi/OpenApiExamplesRail.test.tsx src/styles/app-css-regressions.test.ts
```

Expected: PASS with request-only sticky calculations and response natural-height
coverage.

- [ ] **Step 5: Commit the visual and rail behavior**

```bash
git add src/styles/app.css src/styles/app-css-regressions.test.ts src/components/openapi/OpenApiExamplesRail.tsx src/components/openapi/OpenApiExamplesRail.test.tsx
git commit -m "fix: align OpenAPI wrap control with code toolbar"
```

### Task 5: Run the complete focused suite and static checks

**Files:**
- Test: all changed OpenAPI component, library, and stylesheet tests

- [ ] **Step 1: Run the complete focused OpenAPI suite**

```bash
bun run test src/lib/openapi/anchors.test.ts src/lib/openapi/schema-tree.test.ts src/lib/openapi/response-view.test.ts src/components/openapi/OpenApiFieldRow.test.tsx src/components/openapi/OpenApiSchemaTree.test.tsx src/components/openapi/OpenApiResponses.test.tsx src/components/openapi/OpenApiCodePreview.test.tsx src/components/openapi/OpenApiExamplesRail.test.tsx src/components/openapi/FumadocsOpenApiContent.test.tsx src/styles/app-css-regressions.test.ts
```

Expected: all focused OpenAPI tests pass with zero failures.

- [ ] **Step 2: Run types and formatting checks**

```bash
bun run types:check
bunx biome check src/components/openapi/OpenApiCodePreview.tsx src/components/openapi/OpenApiCodePreview.test.tsx src/components/openapi/OpenApiExamplesRail.tsx src/components/openapi/OpenApiExamplesRail.test.tsx src/components/openapi/FumadocsOpenApiContent.tsx src/components/openapi/FumadocsOpenApiContent.test.tsx src/styles/app.css src/styles/app-css-regressions.test.ts
git diff --check
```

Expected: type check, Biome, and diff check all exit 0.

### Task 6: Validate the final Preview visually

**Files:**
- No repository files; save evidence under `/tmp/docs-portal-rest-api-renderer-preview/`

- [ ] **Step 1: Push the implementation branch and trigger Preview**

```bash
git push origin codex/rest-api-renderer-scanability
```

Use the existing repository Preview workflow and record the final commit SHA,
workflow run, and Preview URL.

- [ ] **Step 2: Capture Request/Response toolbar screenshots**

Using `agent-browser`, capture `join`, `leave`, and `turns` at 1440px. Verify:

- Request and Response each show one compact wrap icon.
- The icons sit in the code toolbar row, immediately left of Copy.
- No standalone `Wrap lines` text row remains.
- Clicking one icon does not toggle the other.
- Response wrapping removes horizontal overflow while preserving natural height.

- [ ] **Step 3: Capture responsive and theme screenshots**

Capture 1024px, 390px, and dark 1440px. Verify no page-level horizontal
overflow, no toolbar overlap, visible focus state, and the request sticky rail
still constrains only the Request viewport.

- [ ] **Step 4: Record runtime health**

Save fresh Preview `errors` and `console` output. Expected: empty arrays for
both.

- [ ] **Step 5: Update the verification manifest**

Update `/tmp/docs-portal-rest-api-renderer-preview/verification.md` with the
final SHA, URL, screenshot paths, measured toolbar positions, and test/build
results. Keep known unrelated full-repository baseline failures explicitly
separate from this focused change.
