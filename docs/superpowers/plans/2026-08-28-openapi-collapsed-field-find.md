# OpenAPI Collapsed Field Browser-Find Restoration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore native browser page search for collapsed OpenAPI schema fields and reveal a match by expanding its complete ancestor chain.

**Architecture:** Keep every schema row mounted and mark rows hidden by disclosure state with `hidden="until-found"`. A focused row wrapper owns the DOM attribute and `beforematch` listener, while `OpenApiSchemaTree` owns ancestor expansion through its existing `expandedRowIds` and `layout.parentIndex` state. A scoped CSS rule suppresses the only box decoration painted by a hidden schema-depth wrapper.

**Tech Stack:** React 19, TypeScript, CSS, Vitest, Testing Library, happy-dom, PostCSS regression tests, Bun, agent-browser.

---

## File map

- Modify `src/components/openapi/OpenApiSchemaTree.test.tsx`: encode the collapsed-but-findable contract, ancestor reveal behavior, sibling isolation, and updated visibility expectations.
- Modify `src/components/openapi/OpenApiSchemaTree.tsx`: keep collapsed rows mounted, attach `hidden="until-found"` and `beforematch`, and expand matched ancestors.
- Modify `src/styles/app-css-regressions.test.ts`: protect hidden schema rows from painted dividers.
- Modify `src/styles/app.css`: suppress the schema-depth wrapper border while it is hidden until found.

### Task 1: Restore findable collapsed schema rows

**Files:**
- Modify: `src/components/openapi/OpenApiSchemaTree.test.tsx`
- Modify: `src/components/openapi/OpenApiSchemaTree.tsx`

- [ ] **Step 1: Add the failing browser-find regression test**

In `src/components/openapi/OpenApiSchemaTree.test.tsx`, add this test after the independent-branch disclosure test:

```tsx
it('keeps collapsed fields findable and reveals only the matched ancestor chain', () => {
  renderTree();
  const tree = screen.getByTestId('openapi-schema-tree');
  fireEvent.click(
    within(tree).getByRole('button', { name: 'Collapse all schema fields' }),
  );

  const matchedRow = within(tree)
    .getByText('enabled')
    .closest('[data-openapi-schema-row]');
  const unrelatedRow = within(tree)
    .getByText('url')
    .closest('[data-openapi-schema-row]');

  expect(matchedRow).toHaveAttribute('hidden', 'until-found');
  expect(matchedRow).not.toBeVisible();
  expect(unrelatedRow).toHaveAttribute('hidden', 'until-found');

  fireEvent(matchedRow as HTMLElement, new Event('beforematch'));

  expect(matchedRow).not.toHaveAttribute('hidden');
  expect(matchedRow).toBeVisible();
  expect(
    within(tree).getByRole('button', {
      name: 'Collapse properties properties',
    }),
  ).toHaveAttribute('aria-expanded', 'true');
  expect(
    within(tree).getByRole('button', {
      name: 'Collapse optionalObject properties',
    }),
  ).toHaveAttribute('aria-expanded', 'true');
  expect(unrelatedRow).toHaveAttribute('hidden', 'until-found');
  expect(unrelatedRow).not.toBeVisible();

  fireEvent.click(
    within(tree).getByRole('button', {
      name: 'Collapse properties properties',
    }),
  );
  expect(matchedRow).toHaveAttribute('hidden', 'until-found');
  expect(matchedRow).not.toBeVisible();
});
```

Update existing assertions where a row is absent only because its ancestor is collapsed. Use `getByText(...).not.toBeVisible()` for `url`, `enabled`, `channel`, `token`, and `field`. Keep true data-absence assertions unchanged, including `null | null` and fields removed by a new schema or document identity.

Rename `removes collapsed parent descendants so one toolbar expansion restores the full branch` to `clears collapsed descendant disclosure so one toolbar expansion restores the full branch` because descendants will remain mounted.

- [ ] **Step 2: Run the component test and verify RED**

Run:

```bash
bun run test src/components/openapi/OpenApiSchemaTree.test.tsx
```

Expected: FAIL because collapsed fields such as `enabled` and `url` are not in the document and no row exposes `hidden="until-found"` or `beforematch` behavior.

- [ ] **Step 3: Add the findable row wrapper**

In `src/components/openapi/OpenApiSchemaTree.tsx`, add this component above `setRowExpanded`:

```tsx
function OpenApiFindableSchemaRow({
  children,
  className,
  hiddenUntilFound,
  onBeforeMatch,
  style,
}: {
  children: ReactNode;
  className: string;
  hiddenUntilFound: boolean;
  onBeforeMatch: () => void;
  style: CSSProperties;
}) {
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const row = rowRef.current;
    if (!row || !hiddenUntilFound) return;

    row.setAttribute('hidden', 'until-found');
    row.addEventListener('beforematch', onBeforeMatch);
    return () => row.removeEventListener('beforematch', onBeforeMatch);
  }, [hiddenUntilFound, onBeforeMatch]);

  return (
    <div
      className={className}
      data-openapi-schema-row=""
      hidden={hiddenUntilFound}
      ref={rowRef}
      style={style}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 4: Expand the ancestor chain on `beforematch`**

Inside `OpenApiSchemaTree`, before the empty-row return, add:

```tsx
function revealRow(index: number) {
  setExpandedRowIds((current) => {
    const next = new Set(current);
    for (
      let parent = layout.parentIndex[index];
      parent !== -1;
      parent = layout.parentIndex[parent]
    ) {
      next.add(anchorIds[parent]);
    }
    return next;
  });
}
```

Remove `if (!visibleFlags[index]) return null;`. Replace the existing schema-depth `<div>` wrapper with:

```tsx
<OpenApiFindableSchemaRow
  className={`openapi-schema-depth${row.depth > 0 ? ' openapi-schema-depth-nested' : ''}`}
  hiddenUntilFound={!visibleFlags[index]}
  key={row.path}
  onBeforeMatch={() => revealRow(index)}
  style={style}
>
```

Keep the nesting guides and `OpenApiFieldRow` content unchanged, then close with `</OpenApiFindableSchemaRow>`.

- [ ] **Step 5: Run the component test and verify GREEN**

Run:

```bash
bun run test src/components/openapi/OpenApiSchemaTree.test.tsx
```

Expected: PASS. The regression proves ancestor expansion, unrelated sibling isolation, and re-collapse behavior.

- [ ] **Step 6: Run adjacent OpenAPI component suites**

Run:

```bash
bun run test \
  src/components/openapi/OpenApiSchemaTree.test.tsx \
  src/components/openapi/OpenApiFieldRow.test.tsx \
  src/components/openapi/FumadocsOpenApiContent.test.tsx
```

Expected: all files pass. If `FumadocsOpenApiContent` contains collapsed-row absence assertions, update only those assertions to test invisibility; do not weaken assertions for fields truly absent from the schema.

- [ ] **Step 7: Format, check, and commit the component behavior**

Run:

```bash
bunx biome format --write \
  src/components/openapi/OpenApiSchemaTree.tsx \
  src/components/openapi/OpenApiSchemaTree.test.tsx
bunx biome check \
  src/components/openapi/OpenApiSchemaTree.tsx \
  src/components/openapi/OpenApiSchemaTree.test.tsx
git diff --check
```

Commit:

```bash
git add src/components/openapi/OpenApiSchemaTree.tsx \
  src/components/openapi/OpenApiSchemaTree.test.tsx
git commit -m "fix: restore collapsed OpenAPI field browser find"
```

Only add `FumadocsOpenApiContent.test.tsx` if Step 6 required assertion updates.

### Task 2: Prevent hidden findable rows from painting dividers

**Files:**
- Modify: `src/styles/app-css-regressions.test.ts`
- Modify: `src/styles/app.css`

- [ ] **Step 1: Write the failing CSS regression test**

In `uses list and schema-depth separators instead of complete row borders`, add:

```ts
expectDeclaration(
  getRuleBody('.openapi-schema-depth[hidden="until-found"]').rule,
  'border-block-start',
  '0',
);
```

- [ ] **Step 2: Run the CSS test and verify RED**

Run:

```bash
bun run test src/styles/app-css-regressions.test.ts
```

Expected: FAIL because the hidden schema-depth selector does not exist.

- [ ] **Step 3: Add the minimal hidden-row visual rule**

Immediately after `.openapi-schema-depth + .openapi-schema-depth`, add:

```css
.openapi-schema-depth[hidden="until-found"] {
  border-block-start: 0;
}
```

Do not move indentation or nesting-guide styles. The hidden wrapper has no block-axis padding; suppressing its own border prevents visual residue while its child content is skipped by content visibility.

- [ ] **Step 4: Run CSS and schema suites and verify GREEN**

Run:

```bash
bun run test \
  src/styles/app-css-regressions.test.ts \
  src/components/openapi/OpenApiSchemaTree.test.tsx
```

Expected: both files pass.

- [ ] **Step 5: Format, check, and commit the CSS protection**

Run:

```bash
bunx biome format --write src/styles/app.css src/styles/app-css-regressions.test.ts
bunx biome check src/styles/app.css src/styles/app-css-regressions.test.ts
git diff --check
```

Commit:

```bash
git add src/styles/app.css src/styles/app-css-regressions.test.ts
git commit -m "fix: hide collapsed OpenAPI find row dividers"
```

### Task 3: Verify integration and preserve branch behavior

**Files:**
- Verify only; no planned product-code modifications.

- [ ] **Step 1: Run focused OpenAPI tests**

```bash
bun run test \
  src/components/openapi/OpenApiSchemaTree.test.tsx \
  src/components/openapi/OpenApiFieldRow.test.tsx \
  src/components/openapi/FumadocsOpenApiContent.test.tsx \
  src/components/openapi/OpenApiExamplesRail.test.tsx \
  src/styles/app-css-regressions.test.ts
```

Expected: all focused tests pass with zero failures.

- [ ] **Step 2: Run type checking and changed-file lint**

```bash
bun run types:check
bunx biome check \
  src/components/openapi/OpenApiSchemaTree.tsx \
  src/components/openapi/OpenApiSchemaTree.test.tsx \
  src/styles/app.css \
  src/styles/app-css-regressions.test.ts
```

Expected: both commands pass. Include `FumadocsOpenApiContent.test.tsx` only if modified.

- [ ] **Step 3: Run the production build**

```bash
bun run build
```

Expected: build exits 0 and generates static route HTML. Existing chunk-size or route-file warnings are non-blocking.

- [ ] **Step 4: Verify the exact browser-find behavior**

Start `bun run dev`, then open `/en/api-reference/api-ref/conversational-ai/join` at `1440 × 900`. For `silence_config`, evaluate:

```js
const field = [...document.querySelectorAll('code')].find(
  (element) => element.textContent?.trim() === 'silence_config',
);
({
  exists: Boolean(field),
  hidden: field?.closest('[hidden="until-found"]') !== null,
  visibleText: document.body.innerText.includes('silence_config'),
});
```

Expected before match: `exists: true`, `hidden: true`, `visibleText: false`.

Dispatch:

```js
field
  ?.closest('[hidden="until-found"]')
  ?.dispatchEvent(new Event('beforematch'));
```

Expected: the target and all ancestors become visible; an unrelated field stays hidden; collapsing the branch restores `until-found`; no ghost divider or gap appears.

- [ ] **Step 5: Recheck examples rail and narrow layout**

At an operation container at least `59rem`, verify the document, examples rail, and request-code viewport keep independent scroll positions. Below `59rem`, verify the rail remains in normal flow and collapsed schema fields remain findable.

- [ ] **Step 6: Confirm final Git state**

```bash
git status --short --branch
git log -5 --oneline
git diff --check 084e18330..HEAD
```

Expected: worktree clean; implementation commits appear above `084e18330`; no whitespace errors.
