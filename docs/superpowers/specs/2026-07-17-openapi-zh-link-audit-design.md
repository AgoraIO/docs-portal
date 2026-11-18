# OpenAPI zh-CN Link Audit Design

## Context

Chinese RESTful API reference content is maintained as OpenAPI YAML under
`content/openapi/**/*.zh-CN.yaml`. These files contain Markdown links that render
inside generated API reference pages. Current content includes legacy links to
`doc.shengwang.cn`, relative endpoint links, root docs links, and third-party
external links.

A read-only scan on 2026-07-17 found 15 Chinese OpenAPI YAML files with 425
Markdown links. Of those links, 160 point at `doc.shengwang.cn`, 97 are relative
links, and the existing docs link audit reports 63 invalid internal links from
Chinese OpenAPI YAML sources. The current general audit can scan OpenAPI links,
but it does not make `doc.shengwang.cn` a dedicated violation for this content
scope.

## Goals

- Add a Chinese OpenAPI-specific audit entry point.
- Prevent new `doc.shengwang.cn` links in `content/openapi/**/*.zh-CN.yaml`.
- Check Markdown links in `content/openapi/**/*.zh-CN.yaml` for internal
  breakage.
- Fix high-confidence existing legacy and broken links in Chinese OpenAPI YAML.
- Produce a reviewer-facing list for links that do not have a high-confidence
  replacement.

## Non-Goals

- Do not extend the new gate to English OpenAPI YAML.
- Do not extend the new gate to normal docs pages under `content/docs/**`.
- Do not silently remove links from YAML content.
- Do not hand-maintain generated `public/openapi/**` assets.
- Do not add product-specific routing branches outside the existing OpenAPI lane
  model.

## Rules

The new gate only applies to `content/openapi/**/*.zh-CN.yaml`.

Within that scope:

- `https://doc.shengwang.cn/...` and `http://doc.shengwang.cn/...` are invalid.
- Broken Markdown links are invalid.
- High-confidence legacy links should be rewritten to current zh-CN site routes.
- Same-lane endpoint links should resolve through the OpenAPI lane context.
- Third-party links are not prohibited by this gate, though external link checks
  may still be run separately.
- Any proposed link removal must be listed for user review before content is
  changed.

## Approach

Use the existing `scripts/audit-doc-links.mjs` machinery as the base because it
already knows how to parse Markdown links from OpenAPI YAML, resolve docs routes,
and derive generated OpenAPI routes from `src/lib/openapi/lanes.ts`.

Add a focused source filter for Chinese OpenAPI YAML. The filter should scan only
`content/openapi/**/*.zh-CN.yaml` while preserving each file's OpenAPI route
context so relative endpoint links still resolve correctly.

Add a new violation reason named `legacy-shengwang-doc-host`. It should be
emitted only when the source is a Chinese OpenAPI YAML file and the href host is
`doc.shengwang.cn`.

Expose the focused audit through package scripts:

```bash
docs:links:openapi-zh
docs:links:openapi-zh:strict
```

The non-strict command prints a report. The strict command exits nonzero when the
focused scan finds either broken internal links or `legacy-shengwang-doc-host`
violations.

## Content Repair Workflow

1. Extract unique Markdown links from `content/openapi/**/*.zh-CN.yaml`, grouped
   by file, href, link text, count, and nearby context.
2. Build high-confidence mappings using current zh-CN routes, OpenAPI lane
   routes, legacy redirect artifacts, and `docs/migration/path-map.csv`.
3. Apply only high-confidence replacements.
4. Keep uncertain legacy links unchanged and write them to a review report under
   `docs/agents/reports/`.
5. Include any candidate link removals in that report instead of removing them
   directly.
6. Run the focused audit. If review items remain, the strict audit should still
   report them until the user approves replacements or removals.

## Test Coverage

Update `scripts/audit-doc-links.test.ts` to cover:

- `doc.shengwang.cn` in `*.zh-CN.yaml` produces
  `legacy-shengwang-doc-host`.
- The same host outside `content/openapi/**/*.zh-CN.yaml` is not part of this
  focused rule.
- Broken internal links in Chinese OpenAPI YAML still produce
  `missing-internal-path`.
- Relative endpoint links in Chinese OpenAPI YAML resolve through the lane
  context.
- The focused strict mode exits nonzero when violations are present.

## Verification

Primary verification commands:

```bash
bun run test scripts/audit-doc-links.test.ts
bun run docs:links:openapi-zh
bun run docs:links:openapi-zh:strict
```

If content changes are broad or affect generated API rendering, also run:

```bash
bun run types:check
```

The local shell used during design did not have `node` or `bun` on `PATH`.
Implementation should first confirm the project runtime path. If the user's
normal shell does not expose the package manager, use the bundled Node runtime
available in the Codex desktop environment for direct script execution and
surface any remaining package-manager issue clearly.

## Deliverables

- Focused Chinese OpenAPI audit support in `scripts/audit-doc-links.mjs`.
- Package scripts for the focused audit in `package.json`.
- Focused tests in `scripts/audit-doc-links.test.ts`.
- High-confidence link fixes in `content/openapi/**/*.zh-CN.yaml`.
- A review report for unresolved legacy links and any proposed removals.

## Confirmed Decisions

The user has approved the scope and approach:

- Gate scope is only `content/openapi/**/*.zh-CN.yaml`.
- `doc.shengwang.cn` is invalid in that scope.
- High-confidence replacements can be applied.
- Uncertain links and any removals must be listed for user review.
