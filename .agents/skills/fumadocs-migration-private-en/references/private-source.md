# Doc-Source-Private Source Contract

## Source Characteristics

- Product-bucketed top-level folders such as `conversational-ai`, `open-ai-integration`, and `real-time-stt`.
- `_category_.json` files that define source navigation labels and order.
- Shared content imported through `@docs/shared/**`.
- Code or prose fragments under `assets/code/**`.
- Source-private variables such as `<Vpd />` and `<Vg />`.
- Docusaurus or site JSX under `@site/src/components/rest-api/**`.

## Private-Source Workflow

1. Identify the source lane from the top-level product folder.
2. Check whether the lane is V1-supported or deferred before migrating any page.
3. Extract navigation intent from `_category_.json`, then map it into static `meta.json` for the target IA.
4. Audit every `@docs/shared/**` import and decide whether it can become a content-only `<include>` or needs static expansion.
5. Audit every `@site/src/components/rest-api/**` import and choose the correct decision path before touching body content.
6. Audit every `<Vpd />` and `<Vg />` occurrence and either expand it to explicit product text or defer the page if the text is ambiguous.
7. Treat `assets/code/**` as supporting source material for tabs or inline examples, not as direct content imports.

## Rewrite Rules

- Replace `@docs/shared/**` imports with `<include>` when the shared fragment is content-only.
- If the shared fragment depends on runtime variables or product props, statically expand it or mark the page deferred.
- Convert `_category_.json` order and label into static `meta.json`.
- Treat `assets/code/**` as source fragments that may need inlining or generated tabs, not direct content-page imports.
- Expand `<Vpd />` and `<Vg />` to explicit product text only when the replacement is unambiguous; otherwise mark deferred.

## _category_.json To meta.json

- Treat `_category_.json` as source navigation input, not as an output format to preserve.
- Carry forward stable human-facing labels and page ordering into `meta.json`.
- Rebuild nested source categories as real folders plus `meta.json` where the target IA still needs that hierarchy.
- Drop Docusaurus-specific keys, generated slugs, and runtime behaviors that do not exist in Fumadocs.
- Do not assume a source category folder must remain a target route segment if the current English IA already uses a different approved route.

## Shared Content Handling

- `@docs/shared/**` is allowed only as a migration input signal.
- Prefer `<include>` when the shared file is already content-only after normalization.
- If a shared fragment contains source-private variables, branch logic, or product props, inline and normalize it in the target page or create a target-side shared partial that no longer depends on runtime substitution.
- If the fragment cannot be normalized without new product rules, mark the page deferred instead of preserving source behavior.

## REST API Decision Path

- If `@site/src/components/rest-api/**` wraps true endpoint or schema reference content backed by OpenAPI, route the page to the OpenAPI lane.
- If it wraps prose with a few request or response examples, rewrite the page as ordinary Markdown or MDX reference content.
- If the source mixes product widgets, runtime props, and REST JSX in a way that prevents a clear split, mark the page deferred and record why.
- Do not preserve `@site/src/components/rest-api/**` imports or add compatibility wrappers in the portal.

## OpenAPI-Backed REST Checks

- Before rewriting a private-source REST endpoint page, check whether the target repo already has English OpenAPI source for the same product.
- For Conversational AI, inspect:
  - `content/openapi/conversational-ai/convoai.en.yaml`
  - `content/openapi/conversational-ai/openapi.meta.json`
- If the operation already exists in the English OpenAPI source, the migration task is usually one of these:
  - verify that the generated route is wired correctly
  - add or fix surrounding prose pages such as authentication or status-code guides
  - record a route-generation or renderer gap if the target leaf page is missing
- Do not rewrite a large `RestAPILayout` page into hand-authored endpoint Markdown when the English OpenAPI source already covers the same operation.

## Deferred Variable Policy

- `<Vpd />` and `<Vg />` are expansion markers, not target syntax.
- Expand them only when the surrounding page clearly names the exact product text that should replace them.
- If multiple plausible product names exist, or the variable affects shared content reused across lanes, defer the page or fragment until product-specific rules exist.
- For V1, repeated unresolved `<Vpd />` and `<Vg />` usage is a strong signal that the lane should stay deferred.
