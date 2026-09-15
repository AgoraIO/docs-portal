# OpenAPI collapsed field browser-find restoration design

Status: Approved in conversation

Date: 2026-08-28

## Context

OpenAPI schema fields can be collapsed to keep long REST API references scannable. A browser page search must still be able to find a field inside a collapsed branch and reveal the complete ancestor chain.

Commit `8244e33c4` previously implemented this behavior by keeping collapsed rows in the DOM with `hidden="until-found"` and expanding their ancestors in response to `beforematch`. Commit `34594aade` then prevented hidden rows from painting separators or spacing.

The schema rendering rewrite in `6e0138aa6` moved disclosure behavior into `OpenApiSchemaTree`. Its current render loop returns `null` for rows whose ancestors are collapsed. Those fields no longer exist in the DOM, so browser find cannot match them.

The regression is reproducible on the branch preview with the Conversational AI `join` endpoint: `silence_config` is absent and unfindable while collapsed, then appears and becomes findable after expanding the schema.

## Goals

- Keep collapsed OpenAPI schema fields available to browser page search.
- Reveal the matched field by expanding every collapsed ancestor in its branch.
- Keep unrelated sibling branches collapsed.
- Preserve current disclosure defaults, expand/collapse-all behavior, hash-target expansion, schema indentation, nesting guides, responsive layout, and the examples rail.
- Prevent hidden findable rows from painting separators or vertical whitespace.

## Non-goals

- Adding a custom in-page search UI.
- Changing the `59rem` OpenAPI layout breakpoint or examples-rail scrolling.
- Changing OpenAPI row generation, type inference, array rendering, or source YAML.
- Polyfilling browsers that do not support `hidden="until-found"` and `beforematch`.

## Selected approach

Restore the historical browser-find protocol inside `OpenApiSchemaTree` rather than reverting the schema-tree rewrite.

Every schema row remains mounted. A row whose ancestor chain is collapsed receives `hidden="until-found"`. The row listens for `beforematch`; when the browser finds text in that row, the tree adds every ancestor ID from `layout.parentIndex` to `expandedRowIds`. React then rerenders the matched branch as visible.

The event and DOM attribute handling belong in a focused row wrapper because hooks cannot be called inside the tree's row loop. The wrapper owns:

- the row element ref;
- applying `hidden="until-found"` while collapsed;
- registering and removing `beforematch`; and
- rendering the existing schema-depth row content unchanged.

The tree owns ancestor expansion because it already owns `expandedRowIds`, `anchorIds`, and `layout.parentIndex`.

## Visual layout protection

`hidden="until-found"` uses content visibility rather than removing the element box. The hidden wrapper must not own painted borders or block-axis spacing.

The implementation must either:

- keep findability on a neutral outer wrapper and place all visual row geometry on an inner element; or
- explicitly suppress wrapper decorations while it has `hidden="until-found"`.

The chosen implementation must preserve current top-level separators, nested separators, indentation, and continuous nesting guides after expand and collapse. A regression test must cover the hidden-row geometry contract so the divider issue fixed by `34594aade` does not return.

## State behavior

- Ordinary user expansion and collapse continue to use `setRowExpanded`.
- `beforematch` adds all ancestors of the matched row without clearing other user-expanded branches.
- Collapsing an ancestor after a match hides the descendants with `until-found` again.
- Hash navigation continues to use `useOpenApiSchemaHashExpansion`; browser-find restoration does not replace or modify that path.
- Expand all continues to add every collapsible row ID; collapse all clears them.

## Testing

### Component regression

Add a focused `OpenApiSchemaTree` test with at least two nested sibling branches:

1. Confirm a deeply nested collapsed field exists in the DOM, has `hidden="until-found"`, and is not visible.
2. Confirm an unrelated collapsed field is also findable but hidden.
3. Fire `beforematch` on the target row.
4. Confirm the target is visible and every ancestor disclosure reports `aria-expanded="true"`.
5. Confirm the unrelated branch remains `hidden="until-found"`.
6. Collapse the target's ancestor and confirm the target returns to the findable hidden state.

Update existing disclosure tests that currently equate collapsed with “not in the document.” They should instead distinguish DOM presence from visibility.

### Visual/CSS regression

Verify hidden findable rows do not paint row borders, nesting guides, or block-axis spacing. Existing visible-row separator and indentation contracts must remain unchanged.

### Integration verification

- Run the `OpenApiSchemaTree` and OpenAPI content suites.
- Run CSS regression tests and type checking.
- On the Conversational AI `join` preview, confirm a collapsed unique field is absent from visible text but present as an `until-found` row; dispatching `beforematch` must reveal it and its ancestors.
- Recheck desktop examples-rail scrolling and narrow-layout schema disclosure to ensure this restoration is isolated.

## Success criteria

- Browser find can match a schema field without manually expanding its ancestors first.
- The matched field and full ancestor chain become visible.
- Unrelated branches remain collapsed.
- Collapsing the branch restores findability without visual residue.
- Existing schema disclosure, deep links, nesting guides, responsive behavior, and examples-rail tests continue to pass.
