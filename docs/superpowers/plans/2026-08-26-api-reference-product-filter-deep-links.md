# API Reference Product Filter Deep Links Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every English Realtime Media `SDK API reference` jump open the API Reference catalog with the originating product already selected.

**Architecture:** Add an explicit `productQueryParam` input to `RecipesCatalog`, parallel to the existing platform initialization hook, so only opted-in catalogs read product state from the URL. Keep the 12 product-guide mappings in the centralized sidebar registry by changing each `sdkUrl` to a filtered catalog URL; the catalog component matches those stable kebab-case values against its actual `items[].product` values.

**Tech Stack:** TypeScript, React 19, Fumadocs MDX, Vitest, Testing Library, Bun, Vite, `agent-browser`.

> **Approved RTC/Voice amendment:** The catalog no longer treats `Realtime Communication (Voice only)` as a product. Voice and RTC entries share Product=`Realtime Communication`; API items carry SDK=`Voice SDK` or `RTC SDK`. The unified Voice quickstart deep-links to `?product=realtime-communication&sdk=voice`, while other RTC pages use only `?product=realtime-communication`. This amendment supersedes the Voice-only product examples in the original steps below.

---

### Task 1: Initialize the catalog product filter from the URL

**Files:**
- Modify: `src/components/docs-overview/mdx-components.test.tsx:100-145`
- Modify: `src/components/docs-overview/mdx-components.test.tsx:680-770`
- Modify: `src/components/docs-overview/mdx-components.tsx:731-780`
- Modify: `src/components/docs-overview/mdx-components.tsx:1390-1435`
- Modify: `content/docs/en/api-reference/api-ref/index.mdx:6-20`

- [ ] **Step 1: Extend the test-only component type**

Add the optional prop to `RecipesCatalogComponent`:

```ts
productQueryParam?: string;
```

- [ ] **Step 2: Add a valid product deep-link test**

Set the URL before rendering:

```ts
window.history.pushState(
  null,
  '',
  '/en/api-reference/api-ref?product=realtime-communication-voice-only',
);
```

Render `RecipesCatalog` with `productQueryParam="product"` and these items:

```ts
items={[
  {
    category: 'Hosted SDK reference',
    description: 'Voice SDK for Android.',
    product: 'Realtime Communication (Voice only)',
    stack: 'Android',
    title: 'Voice Android',
  },
  {
    category: 'Hosted SDK reference',
    description: 'RTC SDK for Android.',
    product: 'Realtime Communication',
    stack: 'Android',
    title: 'RTC Android',
  },
]}
```

Assert:

```ts
const productGroup = screen.getByRole('group', { name: 'Product' });

expect(
  within(productGroup).getByRole('button', {
    name: 'Realtime Communication (Voice only)',
  }),
).toHaveAttribute('aria-pressed', 'true');
expect(screen.getByText('Voice Android')).toBeVisible();
expect(screen.queryByText('RTC Android')).not.toBeInTheDocument();
```

This test proves matching of parentheses and multi-word values.

- [ ] **Step 3: Add fallback and opt-in tests**

Add a table-driven test that renders with `productQueryParam="product"` at each URL:

```text
/en/api-reference/api-ref
/en/api-reference/api-ref?product=
/en/api-reference/api-ref?product=unknown-product
```

For missing, empty, and unknown values, assert `All products` is pressed and cards from two different products remain visible.

Add another test that renders the same URL without `productQueryParam`. Assert `All products` remains pressed and both cards remain visible. This proves other RecipesCatalog consumers do not acquire implicit URL behavior.

- [ ] **Step 4: Add initial-product plus manual-platform composition test**

Open:

```text
/en/api-reference/api-ref?product=signaling
```

Render Signaling Android, Signaling iOS, and Chat Android items with `productQueryParam="product"`. Assert both Signaling cards are initially visible and Chat is absent. Click the `Android` platform button and assert only Signaling Android remains.

Capture the initial search string before clicking:

```ts
const initialSearch = window.location.search;
```

After selecting Android and then another product, assert:

```ts
fireEvent.click(screen.getByRole('button', { name: 'Chat' }));
expect(window.location.search).toBe(initialSearch);
```

Also assert the Chat Android card is visible after selecting Chat, proving the UI changed while the URL did not.

This proves filter controls remain local state.

- [ ] **Step 5: Run the new tests and verify RED**

```bash
bun run test src/components/docs-overview/mdx-components.test.tsx -t "product query|product deep link"
```

Expected: tests fail because `RecipesCatalog` does not accept or read `productQueryParam`.

- [ ] **Step 6: Implement product query initialization**

Add `productQueryParam` to the component destructuring and prop type. Change product state initialization to:

```ts
const [activeProduct, setActiveProduct] = useState(() =>
  getInitialRecipeProduct(items, allProductsLabel, productQueryParam),
);
```

Add these helpers next to `getInitialRecipeStack`:

```ts
function getInitialRecipeProduct(
  items: RecipeCatalogItem[],
  fallback: string,
  queryParam?: string,
) {
  if (typeof window === 'undefined' || !queryParam) {
    return fallback;
  }

  const queryValue = new URLSearchParams(window.location.search).get(
    queryParam,
  );

  if (!queryValue) {
    return fallback;
  }

  const normalizedQueryValue = normalizeRecipeProductQueryValue(queryValue);
  const matchingProduct = getUniqueValues(
    items.map((item) => item.product),
  ).find(
    (product) =>
      normalizeRecipeProductQueryValue(product) === normalizedQueryValue,
  );

  return matchingProduct ?? fallback;
}

function normalizeRecipeProductQueryValue(value: string) {
  return normalizeRecipeFilterValue(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
```

Do not alter `getInitialRecipeStack` or make product selection update browser history.

- [ ] **Step 7: Opt the API Reference catalog into product deep links**

Add this prop to the top-level `RecipesCatalog` in `content/docs/en/api-reference/api-ref/index.mdx`:

```mdx
productQueryParam="product"
```

- [ ] **Step 8: Run tests and verify GREEN**

```bash
bun run test src/components/docs-overview/mdx-components.test.tsx -t "product query|product deep link"
bun run test src/components/docs-overview/mdx-components.test.tsx -t "platform query parameter"
bun run types:check
```

Expected: new product tests and existing platform initialization test pass.

- [ ] **Step 9: Commit catalog product initialization**

```bash
git add src/components/docs-overview/mdx-components.tsx src/components/docs-overview/mdx-components.test.tsx content/docs/en/api-reference/api-ref/index.mdx
git commit -m "feat: initialize API catalog product filters"
```

### Task 2: Generate filtered SDK sidebar URLs

**Files:**
- Modify: `src/lib/reference-api-navigation.test.ts`
- Modify: `src/lib/realtime-media-api-reference-links.ts`
- Modify: `src/lib/docs-page.server.test.ts:3335-3460`

- [ ] **Step 1: Define the exact SDK URL mapping in the navigation test**

Replace the single `sdkApiReference` value with:

```ts
const sdkProductFilters = {
  rtc: 'realtime-communication',
  voice: 'realtime-communication-voice-only',
  video: 'realtime-communication',
  'broadcast-streaming': 'realtime-communication',
  'interactive-live-streaming': 'realtime-communication',
  rtm: 'signaling',
  im: 'chat',
  whiteboard: 'interactive-whiteboard',
  'flexible-classroom': 'flexible-classroom',
  iot: 'iot-sdk',
  'on-premise-recording': 'on-premise-recording',
  'rtc-server-sdk': 'server-gateway',
} as const;

function sdkCatalogUrl(product: string) {
  return `/en/api-reference/api-ref?product=${product}`;
}
```

Build expected SDK URLs with `sdkCatalogUrl(sdkProductFilters[productSlug])`. Keep the REST URL matrix unchanged.

Update `routeExists` so query parameters do not become part of the content path:

```ts
const pathname = href.split(/[?#]/, 1)[0];
const contentPath = path.join(
  docsRoot,
  ...pathname.split('/').filter(Boolean),
);
```

- [ ] **Step 2: Update representative final-payload expectations**

Update SDK node URLs in `docs-page.server.test.ts`:

```ts
// Video / RTC family
'/en/api-reference/api-ref?product=realtime-communication'

// Whiteboard
'/en/api-reference/api-ref?product=interactive-whiteboard'

// On-Premise Recording
'/en/api-reference/api-ref?product=on-premise-recording'
```

Each SDK node keeps `external: true`, `linked: true`, and matching `href`, `id`, and `url`. REST node expectations remain unchanged.

- [ ] **Step 3: Run tests and verify RED**

```bash
bun run test src/lib/reference-api-navigation.test.ts
bun run test src/lib/docs-page.server.test.ts -t "adds a linked API Reference entry"
```

Expected: failures show existing generic or dedicated SDK URLs instead of filtered catalog URLs.

- [ ] **Step 4: Update all 12 registry SDK targets**

Add a small URL helper in `realtime-media-api-reference-links.ts`:

```ts
function sdkCatalogUrl(product: string) {
  return `${GENERIC_SDK_API_REFERENCE_URL}?product=${product}`;
}
```

Set every SDK-capable product's `sdkUrl` using the approved mapping. Examples:

```ts
{
  productSlug: 'voice',
  restUrl: '/en/api-reference/api-ref/rtc',
  sdkUrl: sdkCatalogUrl('realtime-communication-voice-only'),
},
{
  productSlug: 'on-premise-recording',
  sdkUrl: sdkCatalogUrl('on-premise-recording'),
},
```

Do not change any REST URL, product classification, sidebar node behavior, or ordering.

- [ ] **Step 5: Run tests and verify GREEN**

```bash
bun run test src/lib/reference-api-navigation.test.ts
bun run test src/lib/docs-page.server.test.ts -t "adds a linked API Reference entry"
bun run test src/components/docs-shell/DocsSidebarTree.test.tsx -t "linked external SDK API jumps|linked external REST API jumps|linked internal jumps"
bun run types:check
```

Expected: registry mapping, final payload, renderer contracts, and types pass.

- [ ] **Step 6: Commit filtered SDK URLs**

```bash
git add src/lib/reference-api-navigation.test.ts src/lib/realtime-media-api-reference-links.ts src/lib/docs-page.server.test.ts
git commit -m "feat: deep link API catalog product filters"
```

### Task 3: Verify, preview, and update PR #1028

**Files:**
- Runtime screenshot: `/tmp/api-catalog-rtc-filter.png`
- Runtime screenshot: `/tmp/api-catalog-voice-filter.png`
- Runtime screenshot: `/tmp/api-catalog-on-premise-filter.png`

- [ ] **Step 1: Run final automated verification**

```bash
bun run test src/components/docs-overview/mdx-components.test.tsx -t "product query|product deep link|platform query parameter"
bun run test src/lib/reference-api-navigation.test.ts
bun run test src/lib/docs-page.server.test.ts -t "adds a linked API Reference entry"
bun run test src/components/docs-shell/DocsSidebarTree.test.tsx -t "linked external SDK API jumps|linked external REST API jumps|linked internal jumps"
bun run types:check
bunx biome check src/components/docs-overview/mdx-components.tsx src/components/docs-overview/mdx-components.test.tsx src/lib/realtime-media-api-reference-links.ts src/lib/reference-api-navigation.test.ts src/lib/docs-page.server.test.ts
git diff --check origin/main...HEAD
bun run test
bun run lint
```

Expected: all task-focused tests and types pass. Record the repository's unrelated full-test and lint baselines without attributing them to this work.

- [ ] **Step 2: Run final two-axis code review**

Use fixed point `origin/main`. Spec review checks all 12 mappings, Voice-only separation, RTC-family sharing, On-Premise migration, invalid fallback, opt-in behavior, and initial-state-only URL semantics. Quality review checks normalization, hydration compatibility with the existing stack pattern, route verification with query strings, test reliability, and absence of product-specific conditionals in the catalog component.

- [ ] **Step 3: Start the local docs site and verify deep links**

Start:

```bash
bun run dev -- --host 127.0.0.1 --port 4310
```

Use `agent-browser` session `api-product-filter`, viewport `1440 × 1000`, light mode. Read its skill first; use `agent-browser --help` only if the installed 0.25.4 CLI cannot load `core`.

From each product guide, click `SDK API reference` and verify the new tab URL, selected Product button, and visible product group:

```text
RTC
→ ?product=realtime-communication
→ Realtime Communication selected

Voice-only quickstart (`/en/realtime-media/rtc/voice-quickstart`)
→ ?product=realtime-communication-voice-only
→ Realtime Communication (Voice only) selected

Signaling
→ ?product=signaling
→ Signaling selected

On-Premise Recording
→ ?product=on-premise-recording
→ On-Premise Recording selected
```

Verify unrelated product headings/cards are absent. On one sample, change Platform and Product controls and confirm `window.location.search` remains unchanged.

- [ ] **Step 4: Capture and inspect filtered catalog screenshots**

Capture the API catalog, with the selected Product filter and resulting platform cards visible:

```text
/tmp/api-catalog-rtc-filter.png
/tmp/api-catalog-voice-filter.png
/tmp/api-catalog-on-premise-filter.png
```

Inspect all three images for selected-state visibility, correct product heading, multiple expected platform cards, readable labels, and no overlap or clipping. Re-capture any image that does not prove the selected filter and result set together.

Run browser errors/console, close the browser session, stop the dev server, and confirm port 4310 is released.

- [ ] **Step 5: Push and update the existing PR**

```bash
git fetch origin main
git push origin codex/api-reference-guide-links
gh pr view 1028 --json url,baseRefName,headRefName,state
```

Update PR #1028 with product deep-link behavior, mapping/test results, browser verification, and refreshed screenshots. Keep the worktree for review feedback.
