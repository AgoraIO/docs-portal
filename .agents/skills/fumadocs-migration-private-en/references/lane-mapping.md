# Lane Mapping

## Supported V1 Lanes

- `conversational-ai` -> `content/docs/en/ai/**` and `content/docs/en/api-reference/conversational-ai/**`
- `open-ai-integration` -> `content/docs/en/ai/openai-realtime/**` or adjacent approved AI routes
- `real-time-stt` -> `content/docs/en/api-reference/speech-to-text/**` and approved prose lanes

## Deferred Lanes

- `ten-agent`
- `ten-framework`

## Lane Classification Rules

- Classify from the source top-level product bucket first, then confirm against the target IA.
- A page in a deferred lane stays deferred even if some individual prose fragments look portable.
- If a source page mixes supported-lane prose with deferred-lane variables or widgets, defer the page unless the deferred fragment can be removed without changing meaning.
- Do not silently reroute unsupported lanes into nearby approved target folders just to make the content compile.

## _category_.json Mapping Guidance

- Use `_category_.json` labels as candidate `meta.json` titles, then reconcile them with the current English IA wording.
- Use `_category_.json` order as a starting point for `meta.json.pages`, but keep the target IA authoritative when the source structure conflicts with approved portal navigation.
- Convert nested source categories into nested target folders only when the hierarchy still improves target navigation.
- Do not copy Docusaurus-only metadata keys into `meta.json`.

## Shared And REST Decision Summary

- `@docs/shared/**`: prefer `<include>` for content-only fragments, otherwise statically expand or defer.
- `@site/src/components/rest-api/**`: first check whether the repo already has English OpenAPI source for that product and operation; send true endpoint reference content to the OpenAPI lane; rewrite prose-heavy pages as normal docs pages; defer mixed runtime-widget pages.

## Conversational AI REST Note

- `content/openapi/conversational-ai/convoai.en.yaml` already contains English operation definitions such as `start-agent`, `get-history`, and related agent-management endpoints.
- `content/openapi/conversational-ai/openapi.meta.json` already maps that source into the Conversational AI REST route family.
- If a source page such as `conversational-ai/rest-api/agent/join.mdx` or `history.mdx` exists but the target leaf page is missing, treat that as an OpenAPI route-generation or publication gap first, not proof that the endpoint needs hand-authored Markdown.

## Expansion And Deferral Policy

- `<Vpd />` and `<Vg />` may be expanded only when replacement text is explicit and stable for the target lane.
- If expansion would require product-specific runtime knowledge not encoded in the page, mark the page deferred.
- V1 support ends at the three supported lanes above; adding more lanes requires explicit source-specific rules, not case-by-case exceptions.
