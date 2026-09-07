# REST API Independent Examples Rail Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give desktop REST API example rails an independent viewport-height scrollbar and a stable `24rem` request-code height ceiling while preserving narrow-screen behavior.

**Architecture:** Reduce `OpenApiExamplesRail` to a presentational wrapper and move all sizing and scroll containment into the existing container-query CSS. The docs shell's inherited header-offset custom property drives sticky position and rail height without JavaScript measurement, observers, or runtime state.

**Tech Stack:** React 19, TypeScript, CSS container queries and logical properties, Vitest, Testing Library, PostCSS-based CSS regression tests, Biome, Bun.

---

## File map

- Modify `src/components/openapi/OpenApiExamplesRail.tsx`: remove runtime measurement and observer behavior; retain only the structural rail wrappers.
- Modify `src/components/openapi/OpenApiExamplesRail.test.tsx`: replace observer-heavy behavior tests with the presentational structure contract.
- Modify `src/styles/app.css`: add desktop rail scroll containment, set the request-code ceiling to `24rem`, and remove sentinel/constrained selectors.
- Modify `src/styles/app-css-regressions.test.ts`: encode the desktop rail, fixed code ceiling, and narrow-layout fallback contracts.

No new production files or abstractions are needed.

### Task 1: Make the examples rail presentational

**Files:**
- Modify: `src/components/openapi/OpenApiExamplesRail.test.tsx`
- Modify: `src/components/openapi/OpenApiExamplesRail.tsx`

- [ ] **Step 1: Replace the observer tests with a failing structural contract**

Replace `src/components/openapi/OpenApiExamplesRail.test.tsx` with:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { OpenApiExamplesRail } from './OpenApiExamplesRail';

describe('OpenApiExamplesRail', () => {
  it('renders a presentational rail without runtime measurement state', () => {
    render(
      <OpenApiExamplesRail>
        <div>Request examples</div>
      </OpenApiExamplesRail>,
    );

    const rail = screen.getByTestId('openapi-examples-rail');
    const anchor = rail.parentElement;
    const content = rail.firstElementChild;

    expect(anchor).toHaveClass('openapi-examples-rail-anchor');
    expect(rail).toHaveClass('openapi-examples-rail');
    expect(content).toHaveClass('openapi-examples-rail-content');
    expect(content).toContainElement(screen.getByText('Request examples'));
    expect(rail).not.toHaveAttribute('data-constrained');
    expect(rail).not.toHaveAttribute('data-stuck');
    expect(rail).not.toHaveAttribute('style');
    expect(
      document.querySelector('[data-openapi-examples-rail-sentinel]'),
    ).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the focused test and verify that it fails for the old runtime component**

Run:

```bash
bun run test src/components/openapi/OpenApiExamplesRail.test.tsx
```

Expected: FAIL because the current component renders `data-constrained`, `data-stuck`, and `[data-openapi-examples-rail-sentinel]`.

- [ ] **Step 3: Replace the component with the minimal structural wrapper**

Replace `src/components/openapi/OpenApiExamplesRail.tsx` with:

```tsx
import type { ReactNode } from 'react';

export function OpenApiExamplesRail({ children }: { children: ReactNode }) {
  return (
    <div className="openapi-examples-rail-anchor">
      <div
        className="openapi-examples-rail"
        data-testid="openapi-examples-rail"
      >
        <div className="openapi-examples-rail-content">{children}</div>
      </div>
    </div>
  );
}
```

This removes `stickyTop`, refs, state, active-viewport mutation, `ResizeObserver`, `MutationObserver`, `IntersectionObserver`, resize listeners, CSS-variable writes, and helper functions. Do not add a replacement hook: `--docs-shell-header-offset` already reaches the component through CSS inheritance.

- [ ] **Step 4: Run the focused test and verify that it passes**

Run:

```bash
bun run test src/components/openapi/OpenApiExamplesRail.test.tsx
```

Expected: PASS with 1 test and 0 failures.

- [ ] **Step 5: Run the component type/lint checks affected by the deleted prop and imports**

Run:

```bash
bun run types:check
bunx biome check src/components/openapi/OpenApiExamplesRail.tsx src/components/openapi/OpenApiExamplesRail.test.tsx
```

Expected: both commands exit 0 with no unused imports, missing props, or formatting errors.

- [ ] **Step 6: Commit the component simplification**

```bash
git add src/components/openapi/OpenApiExamplesRail.tsx src/components/openapi/OpenApiExamplesRail.test.tsx
git commit -m "refactor: simplify OpenAPI examples rail"
```

Expected: one commit containing only the rail component and its focused test.

### Task 2: Add desktop rail scrolling and the fixed request-code ceiling

**Files:**
- Modify: `src/styles/app-css-regressions.test.ts`
- Modify: `src/styles/app.css`

- [ ] **Step 1: Update the CSS regression tests before changing the stylesheet**

In `src/styles/app-css-regressions.test.ts`, replace the existing `caps only marked OpenAPI code viewports` and `defines the adaptive examples rail container layout` tests with:

```ts
  it('caps only marked OpenAPI code viewports with a stable desktop limit', () => {
    const viewport = getRuleBodyContaining(
      '.openapi-code-preview [data-openapi-code-viewport]',
    );
    const mobileViewport = getRuleBodyContainingInContainer(
      '[data-openapi-code-viewport]',
      '58.999rem',
    );

    expect(appCss).not.toContain(
      '.openapi-request-examples\n    [role="region"].fd-scroll-container',
    );
    expectDeclaration(viewport.rule, 'max-block-size', '24rem !important');
    expectDeclaration(viewport.rule, 'overflow', 'auto');
    expectDeclaration(viewport.rule, 'overscroll-behavior', 'contain');
    expectDeclaration(
      mobileViewport.rule,
      'max-block-size',
      'min(50dvh, 24rem) !important',
    );
    expect(mobileViewport.rule.parent?.type).toBe('atrule');
    expect((mobileViewport.rule.parent as postcss.AtRule).name).toBe(
      'container',
    );
  });

  it('defines the independent desktop examples rail layout', () => {
    const layout = getRuleBodyContainingInContainer(
      '.openapi-operation-layout',
      '59rem',
    );
    const rail = getRuleBodyContainingInContainer(
      '.openapi-examples-rail',
      '59rem',
    );
    const anchorInDesktop = getRuleBodyContainingInContainer(
      '.openapi-examples-rail-anchor',
      '59rem',
    );
    const maxBlockSizes = rail.rule.nodes
      .filter(
        (node): node is postcss.Declaration =>
          node.type === 'decl' && node.prop === 'max-block-size',
      )
      .map((node) => normalizeDeclarationValue(node.value));

    expectDeclaration(
      layout.rule,
      'grid-template-columns',
      'minmax(0, 1fr) clamp(320px, 32cqi, 400px)',
    );
    expectDeclaration(rail.rule, 'position', 'sticky');
    expectDeclaration(
      rail.rule,
      'top',
      'var(--openapi-examples-sticky-top, 48px)',
    );
    expect(maxBlockSizes).toEqual([
      'calc(100vh - var(--openapi-examples-sticky-top, 48px) - 1rem)',
      'calc(100dvh - var(--openapi-examples-sticky-top, 48px) - 1rem)',
    ]);
    expectDeclaration(rail.rule, 'overflow-y', 'auto');
    expectDeclaration(rail.rule, 'overscroll-behavior', 'contain');
    expectDeclaration(rail.rule, 'scrollbar-width', 'thin');
    expectDeclaration(
      rail.rule,
      'scrollbar-color',
      'color-mix(in srgb, var(--ink-1) 16%, transparent) transparent',
    );
    expectDeclaration(anchorInDesktop.rule, 'align-self', 'stretch');

    expect(
      getRuleBodyOutsideContainer('.openapi-examples-rail').rule.nodes,
    ).not.toContainEqual(expect.objectContaining({ prop: 'overflow-y' }));
    expect(appCss).not.toContain('data-constrained');
    expect(appCss).not.toContain('data-openapi-code-viewport-active');
    expect(appCss).not.toContain('data-openapi-examples-rail-sentinel');

    const anchor = getRuleBodyOutsideContainer('.openapi-examples-rail-anchor');
    expectDeclaration(anchor.rule, 'position', 'relative');
    expectDeclaration(anchor.rule, 'min-width', '0');
  });
```

- [ ] **Step 2: Run the CSS regression test and verify that it fails against the adaptive implementation**

Run:

```bash
bun run test src/styles/app-css-regressions.test.ts
```

Expected: FAIL because the desktop code ceiling is still `min(20vh, 11rem)`, the rail lacks viewport height and overflow declarations, and adaptive sentinel/constrained selectors remain.

- [ ] **Step 3: Replace the adaptive rail CSS with the independent rail rules**

In `src/styles/app.css`, delete the entire sentinel rule:

```css
.openapi-examples-rail-anchor > [data-openapi-examples-rail-sentinel] {
  position: absolute;
  inset-block-start: 0;
  inset-inline-start: 0;
  inline-size: 1px;
  block-size: 1px;
  pointer-events: none;
}
```

Inside `@container (min-width: 59rem)`, replace the current `.openapi-examples-rail` rule and delete the `.openapi-examples-rail[data-constrained="true"]` rule. The resulting desktop rules must be:

```css
    .openapi-examples-rail {
      position: sticky;
      top: var(--openapi-examples-sticky-top, 48px);
      max-block-size: calc(
        100vh - var(--openapi-examples-sticky-top, 48px) - 1rem
      );
      max-block-size: calc(
        100dvh - var(--openapi-examples-sticky-top, 48px) - 1rem
      );
      overflow-y: auto;
      overscroll-behavior: contain;
      scrollbar-color: color-mix(in srgb, var(--ink-1) 16%, transparent)
        transparent;
      scrollbar-width: thin;
    }

    .openapi-examples-rail-anchor {
      align-self: stretch;
    }
```

In the unlayered `.openapi-code-preview [data-openapi-code-viewport]` rule, replace only the desktop ceiling:

```css
.openapi-code-preview [data-openapi-code-viewport] {
  /* biome-ignore lint/complexity/noImportantStyles: Required to override Fumadocs viewport utility. */
  max-block-size: 24rem !important;
  overflow: auto;
  overscroll-behavior: contain;
}
```

Do not change the following `@container (max-width: 58.999rem)` rule; it must continue to override the code ceiling with `min(50dvh, 24rem) !important`.

- [ ] **Step 4: Run the CSS regression test and verify that it passes**

Run:

```bash
bun run test src/styles/app-css-regressions.test.ts
```

Expected: PASS with the updated fixed-height and independent-rail assertions.

- [ ] **Step 5: Run both focused suites together**

Run:

```bash
bun run test src/components/openapi/OpenApiExamplesRail.test.tsx src/styles/app-css-regressions.test.ts
```

Expected: both files pass with 0 failures.

- [ ] **Step 6: Format and lint the modified stylesheet and regression test**

Run:

```bash
bunx biome format --write src/styles/app.css src/styles/app-css-regressions.test.ts
bunx biome check src/styles/app.css src/styles/app-css-regressions.test.ts
```

Expected: formatting may rewrite CSS line wrapping; the final check exits 0. Re-run the focused CSS test after formatting if any declaration wrapping changed.

- [ ] **Step 7: Commit the scrolling behavior**

```bash
git add src/styles/app.css src/styles/app-css-regressions.test.ts
git commit -m "feat: add independent OpenAPI examples scroll"
```

Expected: one commit containing only the stylesheet and its regression contract.

### Task 3: Verify the integrated behavior

**Files:**
- No product-code modifications. If verification wording conflicts with measured behavior, only these verification documents may change:
  - `docs/superpowers/specs/2026-08-27-rest-api-independent-examples-rail-design.md`
  - `docs/superpowers/plans/2026-08-27-rest-api-independent-examples-rail.md`

**Fixed comparison baseline:** Use independent clean worktrees for the Head under verification and the pre-implementation baseline `8b6c1c8ba87a2be606eb284b4d2441d192fd48c0`. Use the same Bun version and `bun.lock` in both worktrees, run `bun install --frozen-lockfile` in each, and record the ref, command, exit code, and set difference for every comparison. Compare test failures by suite file and full test name, and lint diagnostics by file, rule, and message; never accept a count-only comparison.

- [ ] **Step 1: Run the full Vitest suite**

Run:

```bash
bun run test
```

Expected: relative to fixed baseline `8b6c1c8ba87a2be606eb284b4d2441d192fd48c0`, Head has no failing suite/test identity absent from the baseline and the failing set does not involve this task. Record both refs, commands, exit codes, and the identity set difference; a clean baseline should still pass in full.

- [ ] **Step 2: Run generated-type and TypeScript validation**

Run:

```bash
bun run types:check
```

Expected: Fumadocs generation and `tsc --noEmit` exit 0.

- [ ] **Step 3: Run repository lint checks**

Run:

```bash
bun run lint
```

Expected: relative to fixed baseline `8b6c1c8ba87a2be606eb284b4d2441d192fd48c0`, Head has no diagnostic identity absent from the baseline and the failing set does not involve this task. Record both refs, commands, exit codes, and the `file + rule + message` set difference; a clean baseline should still exit 0.

- [ ] **Step 4: Run the production build**

Run:

```bash
bun run build
```

Expected: Head exits 0. If Head fails, run the same command in the fixed baseline worktree and compare error identities; Head must introduce no error identity absent from the baseline.

- [ ] **Step 5: Start the local docs portal**

Run in a dedicated terminal:

```bash
bun run dev
```

Expected: Vite reports the local site at `http://localhost:3000`.

- [ ] **Step 6: Verify independent desktop scrolling at an operation container width of at least 59rem**

Open:

```text
http://localhost:3000/en/api-reference/api-ref/conversational-ai/join
```

At a `1440 × 900` viewport, confirm the operation container is at least `59rem` wide before running the desktop checks:

1. Leave the legacy-docs banner visible.
2. Scroll over the main request-body column and confirm the page moves while the sticky right rail retains its own scroll position.
3. Scroll over the right rail outside the code block and confirm authorization, request examples, and response examples move without changing the main document position.
4. Scroll inside the request code block and confirm the sample moves within its `24rem` ceiling without moving the rail.
5. Switch Basic, Saved, and Advanced request scenarios; switch curl, Python, and Node.js tabs; switch response status tabs.
6. Dismiss the legacy-docs banner and confirm the rail moves up and grows by the inherited header-offset difference.

Expected: all three scroll levels remain independent, controls remain usable, and the rail keeps a 16px viewport bottom gap.

- [ ] **Step 7: Verify the `<59rem` narrow fallback at 1280 × 720**

Set the viewport to `1280 × 720` and measure the operation container. If it is not below `59rem`, reduce the viewport or container width until the narrow branch applies. The 897px measurement from the 2026-08-27 verification record is evidence for that run only, not a permanent viewport condition.

Expected once the operation container is below `59rem`: the rail is static and in normal document flow with no rail scrollbar; request code uses `min(50dvh, 24rem)` (which computes to `360px` at a 720px viewport height); and response examples remain reachable through the main document.

- [ ] **Step 8: Verify the responsive boundary and narrow layout**

Resize the operation container across the existing `59rem` breakpoint, then check a phone-sized viewport.

Expected below `59rem`:

- the operation becomes one column;
- the examples rail is in normal document flow with no independent vertical scrollbar;
- request code uses `min(50dvh, 24rem)`; and
- the existing horizontal overflow affordance remains visible for wide code.

- [ ] **Step 9: Confirm the final Git state**

Run:

```bash
git status --short --branch
git log -5 --oneline
```

Expected: the worktree is clean; the latest verification-documentation correction commit appears above the two implementation commits; and those implementation commits appear above the original design and plan documentation commits.

### Verification record (2026-08-27)

- Product evidence ref: `45c1707c410c296a2df742ad8726c41e027269b6`; fixed baseline ref: `8b6c1c8ba87a2be606eb284b4d2441d192fd48c0`. Later commits modify only the design and plan verification documents, not product files, so the tested and built product tree is identical to `45c1707c410c296a2df742ad8726c41e027269b6`. Both were independent clean worktrees prepared with `bun install --frozen-lockfile`, Bun `1.3.9`, Node `v25.9.0`, and the same `bun.lock` SHA-256 `9bcce2bb0864a135746ba506dd086c90c4bcad839d439f1646cc1923e527c250`.
- Focused command `bun run test src/components/openapi/OpenApiExamplesRail.test.tsx src/styles/app-css-regressions.test.ts` exited 0 with 2 files and 16 tests passing. `bun run types:check` exited 0.
- Browser evidence at `1440 × 900` reached the `>=59rem` desktop branch: the rail was sticky with contained auto overflow and a thin scrollbar, the code viewport computed to `384px`, main/rail/code scroll positions were independent, and dismissing the banner changed rail top and available height through the inherited offset. The `1280 × 720` run measured an 897px operation container and therefore exercised the narrow branch; the rail was static with no independent overflow, the code viewport computed to `360px`, and response content remained reachable through the main document. A `390 × 844` run retained horizontal code overflow and computed a `384px` code ceiling.
- Test comparison commands were `bun run test -- --reporter=json --outputFile=/tmp/rest-api-head-vitest.json` at Head and `bun run test -- --reporter=json --outputFile=/tmp/rest-api-baseline-vitest.json` at Baseline; both exited 1. Head had 36 failing suite/test identities and Baseline had 37: Head-only set was empty, while Baseline-only contained `src/lib/source.server.test.ts — fumadocs source loader serializes the SDK catalog as concise machine-readable content`.
- Lint comparison commands were `bun run lint -- --reporter=json` in both worktrees; both exited 1. Each reported 22 errors, 12 warnings, and 4 infos. The normalized `file + rule + message` identity sets were identical (31 unique identities), so neither Head-only nor Baseline-only diagnostics existed.
- Head build command `bun run build` exited 0, generating static payloads, client/SSR output, and 3666 route HTML files; no baseline build was required.
