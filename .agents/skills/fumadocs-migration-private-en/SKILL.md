---
name: fumadocs-migration-private-en
description: Use when migrating docs from /Users/czhen/Documents/GitHub/AgoraIO/Doc-Source-Private into docs-portal Fumadocs content for the English site, applying private-source routing, shared-content, and audit rules.
---

# Fumadocs Migration For Doc-Source-Private

Use this skill when the source root is `/Users/czhen/Documents/GitHub/AgoraIO/Doc-Source-Private`.

This is a source-specific entrypoint for the private English docs source. Reuse the shared `.agents/skills/fumadocs-migration` rules conceptually, but treat this source as a different migration contract rather than a thin `/en/**` variant.

## Workflow

1. Inspect the target IA in `content/docs/en/**`.
2. Load shared rules from `.agents/skills/fumadocs-migration/references/standards.md`.
3. Load shared rewrite guidance from `.agents/skills/fumadocs-migration/references/legacy-casebook.md`.
4. Load shared audit status guidance from `.agents/skills/fumadocs-migration/references/report-schema.md`.
5. Load `references/private-source.md`.
6. Load `references/lane-mapping.md`.
7. Run the audit script with the private-source profile.
8. Classify the source lane as supported or deferred before editing.
9. Verify with `bun run types:check`, and add `bun run test` or `bun run build` when routing, code, or shell behavior changes are involved.

## Hard Rules

- Do not assume `_category_.json` maps 1:1 to current `content/docs/en/**` folders.
- Do not preserve `@docs/shared/**` imports in migrated content.
- Do not preserve `@site/src/components/rest-api/**` JSX in migrated content.
- Do not claim unsupported product lanes are covered; mark them with deferred statuses.
- Treat `ten-agent` and `ten-framework` as deferred unless product-specific rules are added.
- Treat `conversational-ai`, `open-ai-integration`, and `real-time-stt` as the only V1 supported lanes.
- Treat `<Vpd />` and `<Vg />` as source-private variables, not portable syntax.
- Expand `<Vpd />` and `<Vg />` only when the product text is unambiguous in the target page context; otherwise mark the page or fragment deferred.
- Convert `_category_.json` labels and ordering into static `meta.json`; do not keep executable metadata or runtime label substitution.
- Route `@docs/shared/**` to Fumadocs `<include>` only when the shared fragment is content-only. If the fragment depends on runtime variables, props, or product context, statically expand it or defer the page.
- Use the `@site/src/components/rest-api/**` decision path from `references/private-source.md` to choose between OpenAPI lane migration and prose/reference rewrite. Do not carry source-private REST JSX into the portal.
- For Conversational AI REST routes, check `content/openapi/conversational-ai/convoai.en.yaml` and `content/openapi/conversational-ai/openapi.meta.json` before rewriting any endpoint page. If the operation already exists in the English OpenAPI source, treat the source MDX as route wiring or supplemental prose input, not as the primary endpoint content source.

## Scope

Supported V1 lanes:

- `conversational-ai`
- `open-ai-integration`
- `real-time-stt`

Deferred lanes:

- `ten-agent`
- `ten-framework`

Reason: deferred lanes rely more heavily on source-private variables, product landing patterns, and bespoke widgets that do not yet have stable migration rules.

## References

Load all of these for private-source work:

- Shared standards: `.agents/skills/fumadocs-migration/references/standards.md`
- Shared rewrite rules: `.agents/skills/fumadocs-migration/references/legacy-casebook.md`
- Shared audit schema: `.agents/skills/fumadocs-migration/references/report-schema.md`
- Private source contract: `references/private-source.md`
- Lane taxonomy and mapping: `references/lane-mapping.md`
