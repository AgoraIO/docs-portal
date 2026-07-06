# Broken Link Fix Playbook

Use this playbook when fixing broken links in docs content, OpenAPI YAML
descriptions, or generated API reference pages.

## Scope

The link audit covers Markdown and MDX files under `content/docs`, plus Markdown
links embedded in OpenAPI YAML files under `content/openapi`.

OpenAPI source files are reported with source paths such as
`openapi/conversational-ai/rest-api.en.yaml`. These links render inside API
reference pages, so prefer public docs routes over repository-relative paths.

## First Pass

Run the internal-link audit before editing:

```bash
bun run docs:links
```

For a failing gate, use strict mode:

```bash
bun run docs:links:strict
```

Read invalid rows in this shape:

```text
source: <content path> | target: <resolved href> | reason: <failure reason> | href: <raw href>
```

## Classify

Use these buckets before changing content:

- `missing-internal-path`: The target route does not exist. Fix the href, restore
  the page, or remove the link if there is no valid replacement.
- `missing-hash-anchor`: The target page exists, but the fragment does not.
  Update the fragment to the current heading ID, add an explicit anchor when the
  anchor is stable product API surface, or remove the fragment.
- `legacy-doc-root-path`: The link still points at an old `/doc/*` route. Replace
  it with the current localized docs route.
- External `4xx` or timeout: Verify in a browser when the host uses bot
  protection. Use an allowlist only for known flaky hosts or access-controlled
  documentation.

## Fix Rules

Prefer absolute localized docs routes for cross-page links:

```md
[Custom LLM](/en/ai/build/custom-model-integration/custom-llm)
```

Use relative links only within normal docs pages when the target is nearby and
the route is easy to reason about:

```md
[Quickstart](../get-started/quickstart)
```

Avoid relative links in OpenAPI YAML descriptions. The source file is not a docs
page, and generated operation pages can appear under several route leaves.

For generated OpenAPI endpoint links, include the locale and API reference root:

```md
[Start a conversational AI agent](/en/api-reference/api-ref/conversational-ai/join)
```

For generated OpenAPI status-code links, use the maintained status page:

```md
[status codes](/en/api-reference/api-ref/conversational-ai/status-codes)
```

For provider pages migrated from legacy Conversational AI paths, use the AI docs
namespace:

```md
[OpenAI](/en/ai/models/llm/openai)
[Listen to agent events](/en/ai/build/handle-runtime-events/webhooks)
```

When a legacy page has no exact migrated page, check
`src/lib/legacy-sitemap/redirects.json` and recent reports under
`docs/agents/reports/`. Only use semantic replacements when the redirect evidence
is high confidence.

## OpenAPI YAML Checklist

1. Extract Markdown links from the YAML source and inspect unique hrefs.
2. Replace legacy root links such as `/conversational-ai/...` with current
   `/en/ai/...` or `/en/api-reference/...` routes.
3. Replace API reference links missing a locale, such as
   `/api-reference/api-ref/...`, with `/en/api-reference/api-ref/...`.
4. Keep code-sample request URLs unchanged unless they are part of Markdown link
   syntax.
5. Re-run `bun run docs:links` and confirm the OpenAPI source no longer appears
   in invalid internal links.

Useful extraction command:

```bash
node <<'EOF'
const fs = require('fs');
const file = 'content/openapi/conversational-ai/rest-api.en.yaml';
const source = fs.readFileSync(file, 'utf8');
const links = new Map();
const pattern = /(!?)\[[\s\S]*?\]\((<[^>\n]+>|[^)\n]+)\)/g;
let match;
while ((match = pattern.exec(source))) {
  const href = match[2].replace(/^<|>$/g, '').trim();
  links.set(href, (links.get(href) ?? 0) + 1);
}
for (const [href, count] of links) console.log(`${count}\t${href}`);
EOF
```

## Verify

Run focused tests after changing audit behavior:

```bash
bun run test scripts/audit-doc-links.test.ts
```

Run the broad link audit after content changes:

```bash
bun run docs:links
```

Use external checking separately:

```bash
bun run docs:links:external
```

For substantial changes, also run:

```bash
bun run types:check
```
