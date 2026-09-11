# OpenAPI Section Header Consistency Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the six REST API section headings—Path, Query, Header, Cookie, Request Body, and Response Body—share the current Request Body visual hierarchy while preserving their `h2` semantics, anchors, flat parameter lists, schema-tree behavior, and responsive layout.

**Architecture:** Add one local OpenAPI heading contract that can be used both by Fumadocs OpenAPI's `renderHeading` hook and by the project's custom Response Body renderer. The generated parameter/body headings will be identified by their stable ids and receive the same typography/spacing/anchor contract; the custom Response Body heading will use the same Fumadocs heading primitive. Keep parameter rows and schema-tree components unchanged except for the tests that lock their existing behavior.

**Tech Stack:** React 19, TypeScript, Fumadocs OpenAPI 11.2.2, Fumadocs UI 16.13.0, Tailwind v4 utility classes, Vitest, Testing Library, Biome, Vite preview, agent-browser.

---

## File map

- Create `src/components/openapi/OpenApiSectionHeading.tsx` — owns the section-id allowlist, shared heading class contract, generated-heading adapter, and custom `h2` renderer.
- Modify `src/components/openapi/FumadocsOpenApiContent.tsx:1-90,160-236,248-285` — register the Fumadocs `renderHeading` hook, apply the shared renderer to generated headings, and remove the id-specific Request/Response typography override.
- Modify `src/components/openapi/OpenApiResponses.tsx:1-100` — render the custom Response Body title with the shared `h2` component without changing accordion state or response schema rendering.
- Modify `src/styles/app.css:1090-1205,1334-1344` — define the shared heading typography/spacing contract and its mobile-safe wrapping rules without touching the existing schema guide-line rules.
- Modify `src/components/openapi/FumadocsOpenApiContent.test.tsx` — add focused assertions for all six heading ids, h2 semantics, class/anchor parity, and no parameter filter/expand affordances; update the existing heading assertions to the new contract.
- Modify `src/components/openapi/OpenApiResponses.test.tsx` — update the focused custom Response Body heading assertions to cover the shared `h2` and anchor contract.
- Inspect, but do not rewrite, `src/components/openapi/OpenApiSchemaTree.test.tsx`, `src/components/openapi/OpenApiSchema.test.tsx`, and `src/styles/app.css` schema-tree rules for regression coverage of continuous logical borders, `hidden="until-found"`, and mobile overflow.

## Task 1: Define the shared section-heading contract and write the failing component test

**Files:**
- Create: `src/components/openapi/OpenApiSectionHeading.tsx`
- Modify: `src/components/openapi/FumadocsOpenApiContent.test.tsx`

- [ ] **Step 1: Add a fixture that exposes every section type.**

In `FumadocsOpenApiContent.test.tsx`, add a small local page-props factory next to `makeMinimalOpenApiPageProps` so the test has one path parameter, one query parameter, one header parameter, one cookie parameter, a JSON request body, and a JSON response body. Use stable names (`pathId`, `queryLimit`, `traceId`, `sessionId`) and a nested request property (`properties.channel`) so the test also proves that the parameter section remains a flat list rather than becoming a schema search UI.

The OpenAPI operation used by the factory must have this shape:

```ts
parameters: [
  { in: 'path', name: 'pathId', required: true, schema: { type: 'string' } },
  { in: 'query', name: 'queryLimit', schema: { type: 'integer' } },
  { in: 'header', name: 'traceId', schema: { type: 'string' } },
  { in: 'cookie', name: 'sessionId', schema: { type: 'string' } },
],
requestBody: {
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: { channel: { type: 'string' } },
      },
    },
  },
},
responses: {
  '200': {
    description: 'OK',
    content: {
      'application/json': {
        schema: { type: 'object', properties: { ok: { type: 'boolean' } } },
      },
    },
  },
},
```

- [ ] **Step 2: Write the failing heading-contract test.**

Render the factory and assert all six ids, h2 semantics, and one shared class contract:

```ts
const sectionIds = [
  'parameters-path',
  'parameters-query',
  'parameters-header',
  'parameters-cookie',
  'request-body',
  'response-body',
];

for (const id of sectionIds) {
  const heading = document.getElementById(id);
  expect(heading?.tagName).toBe('H2');
  expect(heading).toHaveClass('openapi-section-heading');
  expect(heading?.querySelector(`a[href="#${id}"]`)).toBeTruthy();
}
```

Also assert the four parameter sections contain their named fields and contain no `Filter Properties`, `Expand all`, or `Collapse all` controls. Assert the request/response sections still contain the schema tree and an expandable control where the fixture provides a nested field.

- [ ] **Step 3: Run only the new test and verify it fails for the missing shared class/anchor.**

Run:

```bash
pnpm exec vitest run src/components/openapi/FumadocsOpenApiContent.test.tsx -t "uses one section heading contract"
```

Expected: FAIL because generated parameter headings do not yet have `openapi-section-heading`, and the custom Response Body heading does not yet expose the same anchor structure.

- [ ] **Step 4: Add the shared heading module.**

Implement `OpenApiSectionHeading.tsx` with the following public contract:

```tsx
import { Heading } from 'fumadocs-ui/components/heading';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export const OPENAPI_SECTION_HEADING_CLASS =
  'openapi-section-heading font-semibold text-2xl leading-7';

export const OPENAPI_SECTION_HEADING_IDS = new Set([
  'parameters-path',
  'parameters-query',
  'parameters-header',
  'parameters-cookie',
  'request-body',
  'response-body',
]);

export function renderOpenApiHeading(
  props: ComponentProps<'h1'>,
  depth: number,
) {
  const as = `h${depth}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  const className = OPENAPI_SECTION_HEADING_IDS.has(props.id ?? '')
    ? cn(props.className, OPENAPI_SECTION_HEADING_CLASS)
    : props.className;

  return <Heading {...props} as={as} className={className} />;
}

export function OpenApiSectionHeading({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id: string;
}) {
  return (
    <Heading
      as="h2"
      className={cn(OPENAPI_SECTION_HEADING_CLASS, className)}
      id={id}
    >
      {children}
    </Heading>
  );
}
```

The `Heading` primitive is intentional: it preserves Fumadocs' existing anchor link, copy behavior, keyboard focus, and accessible label. The id allowlist prevents unrelated operation, authorization, callback, or docs-section headings from inheriting this contract.

- [ ] **Step 5: Run the focused test and perform the task review checkpoint.**

Run:

```bash
pnpm exec vitest run src/components/openapi/FumadocsOpenApiContent.test.tsx -t "uses one section heading contract"
```

Expected: FAIL because Task 2 has not wired the shared renderer yet. Keep the test red and do not weaken assertions; Task 2 is the green implementation step.

Spec review checkpoint: verify the test covers all six required section ids, h2 semantics, shared class, anchor href, flat parameter rendering, and absence of parameter filters/expand buttons.

Code-quality review checkpoint: run `pnpm exec biome check src/components/openapi/OpenApiSectionHeading.tsx src/components/openapi/FumadocsOpenApiContent.test.tsx` and resolve import ordering, unsafe casts, or naming issues before committing.

- [ ] **Step 6: Commit the contract and red test.**

```bash
git add src/components/openapi/OpenApiSectionHeading.tsx src/components/openapi/FumadocsOpenApiContent.test.tsx
git commit -m "test: define OpenAPI section heading contract"
```

## Task 2: Wire generated and custom headings to the shared contract

**Files:**
- Modify: `src/components/openapi/FumadocsOpenApiContent.tsx:1-90,160-236,248-285`
- Modify: `src/components/openapi/OpenApiResponses.tsx:1-100`
- Modify: `src/components/openapi/FumadocsOpenApiContent.test.tsx`
- Modify: `src/components/openapi/OpenApiResponses.test.tsx`
- Modify: `src/styles/app.css:1090-1205,1334-1344`

- [ ] **Step 1: Register the generated-heading renderer.**

Import `renderOpenApiHeading` and `OPENAPI_SECTION_HEADING_CLASS` from `./OpenApiSectionHeading`. Add `renderHeading: renderOpenApiHeading` to the `createOpenAPIPage` options object. This uses Fumadocs' supported `renderHeading(props, depth)` hook, so generated Path/Query/Header/Cookie/Request Body headings keep their generated ids and remain semantic headings.

- [ ] **Step 2: Replace the custom Response Body title.**

Import `OpenApiSectionHeading` into `OpenApiResponses.tsx` and replace the local title markup:

```tsx
<h2 className={`mb-3 scroll-mt-24 ${OPENAPI_MAJOR_SECTION_HEADING_CLASS}`}>
  Response Body
</h2>
```

with:

```tsx
<OpenApiSectionHeading
  className="mb-3 scroll-mt-24"
  id={sectionId}
>
  Response Body
</OpenApiSectionHeading>
```

Keep `<section data-openapi-responses id={sectionId}>`, the response accordion buttons, selected media type state, hash expansion, and schema rendering unchanged. Remove the now-duplicated local `OPENAPI_MAJOR_SECTION_HEADING_CLASS` constant.

In `OpenApiResponses.test.tsx`, add the focused assertion to `renderResponses([view('200')])` coverage:

```ts
const heading = screen.getByRole('heading', { name: 'Response Body' });
expect(heading.tagName).toBe('H2');
expect(heading).toHaveClass('openapi-section-heading');
expect(heading.querySelector('a[href="#test-responses"]')).toBeTruthy();
expect(screen.getByRole('button', { name: '200 application/json' })).toBeInTheDocument();
```

This keeps the custom response component independently protected even when the page-level fixture is refactored.

- [ ] **Step 3: Remove the old body-only selector and centralize spacing/typography.**

Delete `OPENAPI_GENERATED_BODY_HEADING_CLASSES` from `FumadocsOpenApiContent.tsx` and stop spreading its four id-specific utility classes on `.openapi-operation`. Remove the corresponding class-array spread from the root container.

In `src/styles/app.css`, add the shared selector next to `.openapi-operation`:

```css
.openapi-operation .openapi-section-heading {
  margin-block: 0;
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.25;
  letter-spacing: 0;
}

.openapi-operation h2.openapi-section-heading > a {
  min-width: 0;
  overflow-wrap: anywhere;
}
```

Use `mb-3 scroll-mt-24` on the custom section heading and preserve the Fumadocs-generated `mt-10` body wrapper. For generated parameter headings, retain the package's existing section order and apply the shared class only; do not add wrappers, filter inputs, accordions, or new section borders. The `min-width`/`overflow-wrap` rule is required so long localized headings can wrap at 390px without creating page-level horizontal overflow.

- [ ] **Step 4: Run the focused component test and the existing OpenAPI response/schema tests.**

Run:

```bash
pnpm exec vitest run \
  src/components/openapi/FumadocsOpenApiContent.test.tsx \
  src/components/openapi/OpenApiResponses.test.tsx \
  src/components/openapi/OpenApiSchemaTree.test.tsx \
  src/components/openapi/OpenApiSchema.test.tsx
```

Expected: PASS. Existing response accordion behavior, request/response schema trees, native-find hidden descendants, local anchor ids, required/optional/deprecated status rows, and continuous logical guide lines must remain covered by the pre-existing assertions.

- [ ] **Step 5: Perform the task review checkpoint.**

Spec review: compare the implementation against the approved design. Confirm only the six allowlisted ids receive the section class; Path/Header/Query/Cookie remain flat; Request/Response retain schema interactions; no scrollbar, method badge, status badge, or guide-line code changed.

Code-quality review: run:

```bash
pnpm exec biome check \
  src/components/openapi/OpenApiSectionHeading.tsx \
  src/components/openapi/FumadocsOpenApiContent.tsx \
  src/components/openapi/OpenApiResponses.tsx \
  src/components/openapi/FumadocsOpenApiContent.test.tsx \
  src/components/openapi/OpenApiResponses.test.tsx \
  src/styles/app.css
git diff --check
```

Expected: no Biome diagnostics and no whitespace errors. Fix the implementation if either review finds duplicated heading contracts, broad selectors, or unintended changes to unrelated OpenAPI chrome.

- [ ] **Step 6: Commit the implementation.**

```bash
git add \
  src/components/openapi/OpenApiSectionHeading.tsx \
  src/components/openapi/FumadocsOpenApiContent.tsx \
  src/components/openapi/OpenApiResponses.tsx \
  src/styles/app.css \
  src/components/openapi/FumadocsOpenApiContent.test.tsx \
  src/components/openapi/OpenApiResponses.test.tsx
git commit -m "feat: unify OpenAPI section headings"
```

## Task 3: Add regression assertions for tree guides, status alignment, and mobile overflow

**Files:**
- Modify: `src/components/openapi/FumadocsOpenApiContent.test.tsx`
- Existing `src/components/openapi/OpenApiSchemaTree.test.tsx` coverage already verifies nested continuous guide-line containers and collapsed `hidden="until-found"` descendants; do not modify that file for this requirement.
- No style changes are expected in this task; return to Task 2 with a failing test if browser validation exposes a real overflow regression.

- [ ] **Step 1: Lock the existing parameter and schema invariants.**

Extend the focused page test with DOM assertions that:

```ts
expect(screen.queryByPlaceholderText('Filter Properties')).not.toBeInTheDocument();
expect(screen.queryByRole('button', { name: 'Expand all' })).not.toBeInTheDocument();
expect(screen.queryByRole('button', { name: 'Collapse all' })).not.toBeInTheDocument();

const requiredRow = screen.getByText('pathId').closest('.openapi-schema-field-row');
expect(requiredRow).toHaveTextContent('Required');
expect(requiredRow?.querySelector('.openapi-schema-status')).toBeInTheDocument();
```

Use an existing fixture with a deprecated field to assert its name still has `line-through`, and an existing nested schema fixture to assert the child wrapper has `.openapi-schema-children`, `border-inline-start`, and `hidden="until-found"` when collapsed. Do not assert a physical `border-left`; the implementation must remain logical-direction aware.

- [ ] **Step 2: Add a static CSS contract assertion without coupling tests to browser pixel values.**

Use the existing test convention for class-level DOM contracts to assert every heading has `openapi-section-heading`, `font-semibold`, `text-2xl`, and `leading-7`. Keep pixel/computed-style comparison in browser validation rather than relying on happy-dom layout.

- [ ] **Step 3: Run the targeted regression tests.**

Run:

```bash
pnpm exec vitest run \
  src/components/openapi/FumadocsOpenApiContent.test.tsx \
  src/components/openapi/OpenApiSchemaTree.test.tsx \
  src/components/openapi/OpenApiSchema.test.tsx
```

Expected: PASS with no new filter input in parameter sections, no loss of status badges or deprecated strike-through, and no loss of continuous nested logical borders.

- [ ] **Step 4: Perform the task review checkpoint.**

Spec review: verify the tests cover title consistency, parameter rendering, continuous vertical guides, and mobile overflow expectations from the approved design.

Code-quality review: run `pnpm exec biome check src/components/openapi src/styles/app.css` and inspect the diff for duplicated fixtures, selectors that target all OpenAPI h2 elements, or tests that depend on unstable generated ids.

- [ ] **Step 5: Commit the regression coverage.**

```bash
git add \
  src/components/openapi/FumadocsOpenApiContent.test.tsx \
  src/components/openapi/OpenApiSchemaTree.test.tsx \
  src/components/openapi/OpenApiSchema.test.tsx \
  src/styles/app.css
git commit -m "test: protect OpenAPI heading and tree layout"
```

## Task 4: Run repository verification and browser preview validation

**Files:**
- No source changes expected. If a command or browser check exposes a defect, return to the relevant task, add a failing test first, then repeat that task's review checkpoint before continuing.

- [ ] **Step 1: Run all required automated checks.**

Run:

```bash
pnpm exec vitest run
bun run types:check
bun run lint
git diff --check
```

Expected: all Vitest tests pass, TypeScript reports no errors, Biome reports no diagnostics, and `git diff --check` is clean.

- [ ] **Step 2: Start the local preview on the known validation port.**

Run:

```bash
bun run dev --host 127.0.0.1 --port 3011
```

Keep the process running for browser validation and record the actual preview URL `http://127.0.0.1:3011/en/api-reference/api-ref/conversational-ai/join` in the handoff.

- [ ] **Step 3: Validate desktop hierarchy and interaction with agent-browser.**

Open `http://127.0.0.1:3011/en/api-reference/api-ref/conversational-ai/join` at a 1440px-wide viewport. Verify:

1. Path, Query, Header, Cookie, Request Body, and Response Body are visually the same heading level as Request Body, each is an `h2`, and each anchor appears in the same position/style.
2. Parameter sections are flat lists with no Filter Properties, Expand all, or Collapse all controls.
3. Request/Response schema trees still expand/collapse, preserve `Required`/`Optional`/`Deprecated` right alignment, and keep deprecated field names struck through.
4. The parent guide line begins below the parent description and continues through the complete child subtree with no horizontal connector.
5. Allowed values and Default remain inside the field details alignment container.

Capture a desktop screenshot for the PR review.

- [ ] **Step 4: Validate mobile wrapping and overflow.**

Use a 390px-wide viewport on the same URL. Confirm:

1. All six headings can wrap naturally and their anchor controls remain reachable.
2. `document.documentElement.scrollWidth <= document.documentElement.clientWidth` and the page has no horizontal scrollbar.
3. Request/Response schema controls remain usable and nested vertical guides remain continuous.
4. Keyboard focus reaches a section anchor and a schema expandable button, with visible focus and valid `aria-expanded` on the latter.

Capture a mobile screenshot for the PR review.

- [ ] **Step 5: Perform the final spec and code-quality reviews.**

Spec review: check every item in `docs/superpowers/specs/2026-09-04-openapi-section-header-consistency-design.md`, including non-goals (no parameter filters, no schema-tree redesign, no scrollbar/method-badge changes).

Code-quality review: inspect `git diff HEAD~3..HEAD`, run `git status --short`, confirm only the planned files changed, and verify no generated file, OpenAPI source, secret, or unrelated parent-worktree edit was included.

- [ ] **Step 6: Report the completed verification.**

The final handoff must list modified files, exact Vitest/types/Biome commands and results, desktop/mobile browser observations, and the preview URL. If any check fails, report the failure and do not claim completion until the relevant task is fixed and re-verified.
