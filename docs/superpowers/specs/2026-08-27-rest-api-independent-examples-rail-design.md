# REST API independent examples rail design

Status: Approved

Date: 2026-08-27

## Context

Generated REST API operation pages use a two-column desktop layout. The main column contains endpoint documentation, while the right rail contains authorization, request examples, and response examples.

The current implementation keeps the right rail sticky but lets it participate in the page's vertical scroll. It then measures the remaining viewport space at runtime and dynamically constrains only the active request-code viewport. On long endpoints such as Conversational AI `join`, this produces a small request example and makes the example rail harder to browse.

The legacy Agora reference uses a different model: the complete examples rail is a sticky, viewport-height scroll container, while its code block has a stable height ceiling. The main document and examples rail therefore have independent vertical scroll positions.

## Goals

- Give the desktop examples rail its own vertical scrollbar.
- Keep the rail visible and independently scrollable while the main document moves.
- Replace runtime request-code height calculation with a stable `24rem` ceiling.
- Preserve the current single-column behavior on tablet and mobile layouts.
- Preserve request scenario selection, language tabs, response tabs, copying, syntax highlighting, and OpenAPI rendering.
- Remove runtime layout measurement that is no longer required.

## Non-goals

- Redesigning OpenAPI field rows, schemas, responses, navigation, or page chrome.
- Making authorization, headings, selectors, or tabs separately sticky inside the examples rail.
- Splitting request and response examples into separate rail-level scroll containers.
- Changing OpenAPI content or source documents.
- Changing the desktop two-column breakpoint or column widths.

## Selected approach

Use the existing examples rail as one sticky desktop scroll container. Give the rail a viewport-relative maximum height and `overflow-y: auto`. Give marked request-code viewports a fixed `24rem` maximum block size. Remove the component logic that observes layout state and calculates a dynamic code height.

This matches the legacy interaction model while retaining the current visual language and component structure.

## Component responsibilities

### `OpenApiExamplesRail`

`OpenApiExamplesRail` remains the structural boundary around authorization and API examples. It does not measure descendants or manage scroll state.

The component becomes a presentational wrapper with:

- `.openapi-examples-rail-anchor`, which stretches to the height of the operation grid and defines the sticky containing area;
- `.openapi-examples-rail`, which becomes sticky and independently scrollable on desktop; and
- `.openapi-examples-rail-content`, which groups existing rail children without changing their rendering.

Remove the following runtime behavior:

- active code-viewport discovery and `data-openapi-code-viewport-active` mutation;
- `window.innerHeight`, code `scrollHeight`, and rail `scrollHeight` calculations;
- `--openapi-rail-available-height` and `--openapi-code-available-height` writes;
- the minimum-eight-code-line constraint threshold;
- `ResizeObserver` and window `resize` listeners;
- the sentinel, `IntersectionObserver`, `stuck` state, and `data-stuck`;
- `constrained` state and `data-constrained`; and
- the `stickyTop` prop and JavaScript sticky-offset synchronization, which have no production caller after measurement and sentinel logic are removed.

The docs shell already exposes `--docs-shell-header-offset` on an ancestor. `.openapi-operation` maps it to `--openapi-examples-sticky-top`, so CSS inheritance updates both the rail position and height when the legacy banner is shown or dismissed. No MutationObserver is needed for that behavior.

### `OpenApiCodePreview`

`OpenApiCodePreview` continues to mark code scroll viewports with `data-openapi-code-viewport`. It remains responsible for an individual long code sample's vertical and horizontal overflow. Request scenario selection, language tabs, copy controls, and syntax highlighting do not change.

## Desktop layout and scrolling

The independent rail applies only inside the existing `@container (min-width: 59rem)` desktop layout.

The rail uses:

```css
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
scrollbar-width: thin;
```

The `100vh` declaration is the fallback; browsers that support dynamic viewport units use the following `100dvh` declaration. The `1rem` subtraction maintains a 16px bottom gap.

The scrollbar is subtle and uses the existing documentation-shell scrollbar colors. It is visible only when the rail content exceeds the available height. `overscroll-behavior: contain` keeps wheel and trackpad input within the rail at its boundaries instead of unexpectedly moving the main document.

The anchor remains stretched across the operation grid, so the sticky rail stays bounded by the operation content rather than overlapping following page sections.

## Request and response example sizing

On desktop, every request example code viewport inside `.openapi-code-preview` uses a fixed `24rem` maximum block size. Short samples retain their natural height; long samples scroll inside the code viewport.

The examples rail may therefore expose two intentional scrolling levels:

1. the rail scrollbar moves between authorization, request examples, and response examples;
2. the request code scrollbar reads a long individual sample.

Response examples keep their current natural sizing and code behavior. The rail scrollbar provides access when the combined rail content is taller than the viewport.

## Tablet and mobile behavior

Below the `59rem` operation-container breakpoint:

- the operation layout remains a single column;
- the examples rail returns to normal document flow;
- the rail has no sticky positioning, viewport maximum height, or independent vertical overflow; and
- request code viewports retain the current `min(50dvh, 24rem)` maximum block size and horizontal overflow affordance.

This prevents nested page-level vertical scrolling on narrow screens.

## Accessibility and interaction

- Existing native selects, tabs, buttons, links, and copy controls retain their semantics and focus behavior.
- Scrollbars are not hidden and remain available to mouse, trackpad, and touch input.
- No focus trap or keyboard-navigation override is introduced.
- Changing request scenarios, languages, or response statuses must not reset the main document scroll position.
- The examples rail owns only presentation and scroll containment; it does not alter the OpenAPI data flow.

## Testing

### Component tests

Simplify `OpenApiExamplesRail.test.tsx` to cover the remaining structural contract. Remove tests for:

- active versus hidden code viewport selection;
- available-height formulas;
- minimum code-line thresholds;
- wide-layout measurement;
- constrained and stuck state transitions;
- resize and mutation recalculation; and
- observer cleanup that no longer exists.

Retain or add focused assertions that the component renders the anchor, rail, and content wrappers without runtime measurement attributes.

### CSS regression tests

Update `app-css-regressions.test.ts` to assert that:

- the desktop rail is sticky at `--openapi-examples-sticky-top`;
- the desktop rail has `100vh` and `100dvh` maximum-height declarations with a `1rem` bottom gap;
- the desktop rail uses independent vertical scrolling, contained overscroll, and a thin scrollbar;
- the desktop request-code maximum block size is `24rem`;
- no `data-constrained` or calculated code-height selector remains; and
- the narrow-layout request-code rule remains `min(50dvh, 24rem)` without rail-level independent scrolling.

### Manual verification

Verify the Conversational AI `join` operation at `1440 × 900` and `1280 × 720`:

1. Scroll the main document and confirm the right rail stays sticky.
2. Scroll the right rail and confirm the main document position does not change.
3. Scroll a long request sample and confirm the rail position does not change.
4. Switch request scenarios and curl, Python, and Node.js tabs.
5. Switch response status tabs.
6. Repeat with the legacy-docs banner shown and dismissed.
7. Check both sides of the `59rem` container breakpoint.
8. Confirm the tablet and mobile layout has no rail-level vertical scrollbar.

## Success criteria

- The desktop main document and examples rail have independent vertical scroll positions.
- A long request example can display up to `24rem` before its own scrollbar is needed.
- The examples rail remains within the visible viewport below the current docs-shell header offset, with a 16px bottom gap.
- Banner height changes update the rail position and available height through inherited CSS variables without JavaScript measurement.
- Tablet and mobile behavior remains unchanged.
- Existing OpenAPI interactions and rendering tests continue to pass.
