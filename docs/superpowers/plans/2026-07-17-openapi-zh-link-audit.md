# OpenAPI zh-CN Link Audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Chinese RESTful OpenAPI link audit gate, then use it to repair high-confidence legacy and broken links in `content/openapi/**/*.zh-CN.yaml` while listing uncertain replacements for user review.

**Architecture:** Extend the existing `scripts/audit-doc-links.mjs` audit instead of creating a separate parser. Add a focused OpenAPI source filter and a `legacy-shengwang-doc-host` violation that only applies to Chinese OpenAPI YAML, expose it through package scripts, then use the focused report to drive content edits and a review report.

**Tech Stack:** Node ESM script, Vitest, `package.json` scripts, OpenAPI lane registry from `src/lib/openapi/lanes.ts`, Markdown links embedded in YAML.

---

## File Structure

- Modify: `scripts/audit-doc-links.mjs`
  - Add OpenAPI source filtering that is independent from docs `sourcePaths`.
  - Add `legacyShengwangDocHostLinks` stats bucket.
  - Add `legacy-shengwang-doc-host` invalid-link classification.
  - Add CLI flag `--openapi-zh-only`.
- Modify: `scripts/audit-doc-links.test.ts`
  - Add focused tests for Chinese OpenAPI YAML filtering, legacy host failures, non-target source behavior, internal breakage, and lane-context relative endpoint resolution.
- Modify: `package.json`
  - Add `docs:links:openapi-zh` and `docs:links:openapi-zh:strict`.
- Modify: `content/openapi/**/*.zh-CN.yaml`
  - Replace only high-confidence legacy and broken links.
- Create: `docs/agents/reports/2026-07-17-openapi-zh-link-review.md`
  - List uncertain legacy links and any candidate removals for user review.

## Task 1: Add Focused Audit Tests

**Files:**
- Modify: `scripts/audit-doc-links.test.ts`

- [ ] **Step 1: Add tests for the Chinese OpenAPI-focused audit**

Add this test block after the existing `it('audits Markdown links embedded in OpenAPI YAML sources', ...)` test:

```ts
  it('audits only zh-CN OpenAPI YAML when openApiSourcePaths is provided', async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'docs-link-audit-'));
    tempDirs.push(tempRoot);
    const docsRoot = path.join(tempRoot, 'docs');
    const openApiRoot = path.join(tempRoot, 'openapi');

    await writeDoc(
      path.join(
        docsRoot,
        'zh-CN',
        'api-reference',
        'api-ref',
        'conversational-ai',
        'index.mdx',
      ),
      '# 对话式 AI API\n',
    );
    await writeDoc(
      path.join(
        docsRoot,
        'zh-CN',
        'api-reference',
        'api-ref',
        'conversational-ai',
        'join.mdx',
      ),
      '# 加入频道\n',
    );
    await writeDoc(path.join(docsRoot, 'zh-CN', 'ai', 'build', 'valid.mdx'));
    await writeDoc(path.join(docsRoot, 'en', 'ai', 'build', 'valid.mdx'));

    await writeDoc(
      path.join(openApiRoot, 'conversational-ai', 'rest-api.zh-CN.yaml'),
      [
        'openapi: 3.1.0',
        'info:',
        '  title: Test API',
        '  version: 1.0.0',
        'paths:',
        '  /v1/test:',
        '    get:',
        '      summary: Test',
        '      description: |',
        '        See [valid topic](/zh-CN/ai/build/valid).',
        '        See [missing topic](/zh-CN/ai/build/missing).',
        '        See [legacy host](https://doc.shengwang.cn/doc/convoai/restful/landing-page).',
        '        See [Join endpoint](join).',
      ].join('\n'),
    );
    await writeDoc(
      path.join(openApiRoot, 'conversational-ai', 'rest-api.en.yaml'),
      [
        'openapi: 3.1.0',
        'info:',
        '  title: Test API',
        '  version: 1.0.0',
        'paths:',
        '  /v1/test:',
        '    get:',
        '      summary: Test',
        '      description: |',
        '        See [legacy host](https://doc.shengwang.cn/doc/convoai/restful/landing-page).',
        '        See [missing topic](/en/ai/build/missing).',
      ].join('\n'),
    );

    const stats = auditDocsLinks({
      docsRoot,
      openApiSourcePaths: ['openapi/conversational-ai/rest-api.zh-CN.yaml'],
    });

    expect(stats.docsFiles).toBe(0);
    expect(stats.openapiFiles).toBe(1);
    expect(stats.legacyShengwangDocHostLinks).toEqual([
      expect.objectContaining({
        href: 'https://doc.shengwang.cn/doc/convoai/restful/landing-page',
        reason: 'legacy-shengwang-doc-host',
        sourcePath: 'openapi/conversational-ai/rest-api.zh-CN.yaml',
        target: 'https://doc.shengwang.cn/doc/convoai/restful/landing-page',
      }),
    ]);
    expect(stats.invalidInternalLinks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          href: '/zh-CN/ai/build/missing',
          reason: 'missing-internal-path',
          sourcePath: 'openapi/conversational-ai/rest-api.zh-CN.yaml',
        }),
        expect.objectContaining({
          href: 'https://doc.shengwang.cn/doc/convoai/restful/landing-page',
          reason: 'legacy-shengwang-doc-host',
          sourcePath: 'openapi/conversational-ai/rest-api.zh-CN.yaml',
        }),
      ]),
    );
    expect(stats.invalidInternalLinks).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          href: '/en/ai/build/missing',
          sourcePath: 'openapi/conversational-ai/rest-api.en.yaml',
        }),
      ]),
    );
    expect(stats.relativeMarkdownLinks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          href: 'join',
          normalizedHref:
            '/zh-CN/api-reference/api-ref/conversational-ai/join',
          resolution: 'openapi-route',
          sourcePath: 'openapi/conversational-ai/rest-api.zh-CN.yaml',
        }),
      ]),
    );
  });
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run:

```bash
bun run test scripts/audit-doc-links.test.ts -t "audits only zh-CN OpenAPI YAML"
```

Expected: FAIL with TypeScript or assertion errors because `openApiSourcePaths` and `legacyShengwangDocHostLinks` do not exist yet.

- [ ] **Step 3: Commit the failing test**

```bash
git add scripts/audit-doc-links.test.ts
git commit -m "test: cover zh openapi link audit"
```

## Task 2: Implement OpenAPI Source Filtering and Legacy Host Classification

**Files:**
- Modify: `scripts/audit-doc-links.mjs`
- Test: `scripts/audit-doc-links.test.ts`

- [ ] **Step 1: Extend the audit options typedef**

Change the typedef near the top of `scripts/audit-doc-links.mjs` to:

```js
/**
 * @typedef {object} AuditDocsLinksOptions
 * @property {string} [docsRoot]
 * @property {string} [openApiRoot]
 * @property {string[]} [sourcePaths]
 * @property {string[]} [openApiSourcePaths]
 */
```

- [ ] **Step 2: Add the new stats bucket**

In `createStats()`, add `legacyShengwangDocHostLinks: []` next to `legacyRootDocLinks`:

```js
    legacyRootDocLinks: [],
    legacyShengwangDocHostLinks: [],
```

- [ ] **Step 3: Split docs and OpenAPI source filtering**

Change the `auditDocsLinks` function signature and filter setup to:

```js
export function auditDocsLinks({
  docsRoot = path.join(process.cwd(), 'content', 'docs'),
  openApiRoot = getDefaultOpenApiRoot(docsRoot),
  sourcePaths,
  openApiSourcePaths,
} = {}) {
  const stats = createStats();
  const docsFiles = listMarkdownFiles(docsRoot);
  const existingContentPaths = new Set(
    docsFiles.map((file) => toContentPath(docsRoot, file)),
  );
  const existingRoutePaths = getExistingRoutePaths({
    docsRoot,
    existingContentPaths,
  });
  const docsPageIndex = createDocsPageIndex({
    docsFiles,
    docsRoot,
    existingRoutePaths,
  });
  const sourcePathFilter = sourcePaths ? new Set(sourcePaths) : null;
  const openApiSourcePathFilter = openApiSourcePaths
    ? new Set(openApiSourcePaths)
    : null;
```

Then change the docs loop guard to preserve the current overview-card behavior:

```js
  for (const filePath of docsFiles) {
    const sourcePath = toContentPath(docsRoot, filePath);

    if (openApiSourcePathFilter || (sourcePathFilter && !sourcePathFilter.has(sourcePath))) {
      continue;
    }
```

Then change the OpenAPI scan condition and per-file guard to:

```js
  if ((!sourcePathFilter || openApiSourcePathFilter) && fs.existsSync(openApiRoot)) {
    const openApiFiles = listOpenApiYamlFiles(openApiRoot);
    const openApiSourceContexts = getOpenApiSourceContexts();

    for (const filePath of openApiFiles) {
      const sourcePath = toOpenApiSourcePath(openApiRoot, filePath);

      if (
        openApiSourcePathFilter &&
        !openApiSourcePathFilter.has(sourcePath)
      ) {
        continue;
      }

      const sourceContextPath =
        openApiSourceContexts.get(sourcePath) ?? sourcePath;
```

- [ ] **Step 4: Add legacy Shengwang host detection helpers**

Add these helpers near `normalizeExternalTarget`:

```js
function isLegacyShengwangDocHostHref(href) {
  if (!/^https?:\/\//i.test(href)) {
    return false;
  }

  try {
    return new URL(href).host.toLowerCase() === 'doc.shengwang.cn';
  } catch {
    return false;
  }
}

function isZhCnOpenApiSourcePath(sourcePath) {
  return sourcePath.startsWith('openapi/') && /\.zh-CN\.ya?ml$/i.test(sourcePath);
}
```

- [ ] **Step 5: Classify legacy Shengwang links before external links**

In `classifyLink`, insert this block after the root `/doc/` handling and before the generic root/external handling:

```js
  if (
    isZhCnOpenApiSourcePath(sourcePath) &&
    isLegacyShengwangDocHostHref(href)
  ) {
    const entry = {
      href,
      reason: 'legacy-shengwang-doc-host',
      source: link.source,
      sourcePath,
      target: href,
    };

    stats.legacyShengwangDocHostLinks.push(entry);
    addInvalidLink(stats, {
      ...entry,
      type: 'internal',
    });
    return;
  }
```

- [ ] **Step 6: Include the new bucket in reports**

In `formatReport`, add the summary line:

```js
    `legacyShengwangDocHostLinks: ${stats.legacyShengwangDocHostLinks.length}`,
```

Place it after `legacyRootDocLinks`.

Add this section after `Sample legacy /doc/* links`:

```js
  appendInvalidSection(
    lines,
    'Legacy doc.shengwang.cn links in zh-CN OpenAPI',
    stats.legacyShengwangDocHostLinks,
    maxSamples,
  );
```

- [ ] **Step 7: Run the focused test and verify it passes**

Run:

```bash
bun run test scripts/audit-doc-links.test.ts -t "audits only zh-CN OpenAPI YAML"
```

Expected: PASS.

- [ ] **Step 8: Run the full audit test file**

Run:

```bash
bun run test scripts/audit-doc-links.test.ts
```

Expected: PASS. Existing overview-card focused tests must still skip OpenAPI files when only `sourcePaths` is provided.

- [ ] **Step 9: Commit the implementation**

```bash
git add scripts/audit-doc-links.mjs scripts/audit-doc-links.test.ts
git commit -m "feat: add zh openapi link audit filter"
```

## Task 3: Add CLI Flag and Package Scripts

**Files:**
- Modify: `scripts/audit-doc-links.mjs`
- Modify: `scripts/audit-doc-links.test.ts`
- Modify: `package.json`

- [ ] **Step 1: Export a helper for zh-CN OpenAPI source paths**

Add this helper after `toOpenApiSourcePath`:

```js
export function getZhCnOpenApiSourcePaths(openApiRoot) {
  if (!fs.existsSync(openApiRoot)) {
    return [];
  }

  return listOpenApiYamlFiles(openApiRoot)
    .map((filePath) => toOpenApiSourcePath(openApiRoot, filePath))
    .filter(isZhCnOpenApiSourcePath);
}
```

- [ ] **Step 2: Parse the CLI flag**

In `parseArgs`, add:

```js
    openapiZhOnly: args.includes('--openapi-zh-only'),
```

- [ ] **Step 3: Wire the CLI flag into `main()`**

Change the start of `main()` to:

```js
async function main() {
  const repoRoot = process.cwd();
  const docsRoot = path.join(repoRoot, 'content', 'docs');
  const openApiRoot = path.join(repoRoot, 'content', 'openapi');
  const options = parseArgs(process.argv.slice(2));
  const stats = auditDocsLinks({
    docsRoot,
    openApiRoot,
    ...(options.overviewCards
      ? { sourcePaths: OVERVIEW_CARD_SOURCE_PATHS }
      : {}),
    ...(options.openapiZhOnly
      ? { openApiSourcePaths: getZhCnOpenApiSourcePaths(openApiRoot) }
      : {}),
  });
```

- [ ] **Step 4: Add a CLI-focused test**

Add `getZhCnOpenApiSourcePaths` to the import list in `scripts/audit-doc-links.test.ts`:

```ts
  getZhCnOpenApiSourcePaths,
```

Add this test near the focused audit test:

```ts
  it('lists only zh-CN OpenAPI source paths for the focused CLI mode', async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'docs-link-audit-'));
    tempDirs.push(tempRoot);
    const openApiRoot = path.join(tempRoot, 'openapi');

    await writeDoc(path.join(openApiRoot, 'a', 'one.zh-CN.yaml'));
    await writeDoc(path.join(openApiRoot, 'a', 'one.en.yaml'));
    await writeDoc(path.join(openApiRoot, 'b', 'two.zh-CN.yml'));

    expect(getZhCnOpenApiSourcePaths(openApiRoot)).toEqual([
      'openapi/a/one.zh-CN.yaml',
      'openapi/b/two.zh-CN.yml',
    ]);
  });
```

- [ ] **Step 5: Add package scripts**

In `package.json`, add the scripts after `docs:links:strict`:

```json
    "docs:links:openapi-zh": "node scripts/audit-doc-links.mjs --openapi-zh-only",
    "docs:links:openapi-zh:strict": "node scripts/audit-doc-links.mjs --openapi-zh-only --fail-on-invalid",
```

- [ ] **Step 6: Run tests**

Run:

```bash
bun run test scripts/audit-doc-links.test.ts
```

Expected: PASS.

- [ ] **Step 7: Run the focused report**

Run:

```bash
bun run docs:links:openapi-zh -- --max-samples=20
```

Expected: report includes `openapiFiles: 15` and a nonzero `legacyShengwangDocHostLinks` count before content repair.

- [ ] **Step 8: Commit CLI and package scripts**

```bash
git add scripts/audit-doc-links.mjs scripts/audit-doc-links.test.ts package.json
git commit -m "feat: expose zh openapi link audit"
```

## Task 4: Generate Link Inventory and Review Report

**Files:**
- Create: `docs/agents/reports/2026-07-17-openapi-zh-link-review.md`
- Modify: `content/openapi/**/*.zh-CN.yaml` only in later tasks

- [ ] **Step 1: Extract unique legacy links**

Run:

```bash
python3 - <<'PY'
import re
from collections import defaultdict
from pathlib import Path

link_pattern = re.compile(r'(!?)\[([\s\S]*?)\]\((<[^>\n]+>|[^)\n]+)\)')
rows = defaultdict(lambda: {'count': 0, 'texts': set(), 'files': set()})

for file in sorted(Path('content/openapi').rglob('*.zh-CN.yaml')):
    text = file.read_text(encoding='utf-8')
    for match in link_pattern.finditer(text):
        label = re.sub(r'\s+', ' ', match.group(2)).strip()
        href = match.group(3).strip('<>').strip()
        if href.startswith(('https://doc.shengwang.cn', 'http://doc.shengwang.cn')):
            rows[href]['count'] += 1
            rows[href]['texts'].add(label)
            rows[href]['files'].add(file.as_posix())

for href, data in sorted(rows.items()):
    print(f"{data['count']}\t{', '.join(sorted(data['files']))}\t{'; '.join(sorted(data['texts']))}\t{href}")
PY
```

Expected: output lists the unique `doc.shengwang.cn` links in Chinese OpenAPI YAML.

- [ ] **Step 2: Run the focused audit for current invalid internal links**

Run:

```bash
bun run docs:links:openapi-zh -- --max-samples=200 > /tmp/openapi-zh-link-audit.txt
```

Expected: `/tmp/openapi-zh-link-audit.txt` includes `legacy-shengwang-doc-host` rows and `missing-internal-path` rows.

- [ ] **Step 3: Create the initial review report**

Create `docs/agents/reports/2026-07-17-openapi-zh-link-review.md` with this structure:

```md
# OpenAPI zh-CN Link Review

Generated from `content/openapi/**/*.zh-CN.yaml`.

## Summary

- Scope: Chinese RESTful OpenAPI YAML only.
- Rule: `doc.shengwang.cn` links must be replaced with current zh-CN routes or reviewed before removal.
- Removal policy: no link is removed without user approval.

## High-Confidence Replacements Applied

| Source | Old href | New href | Evidence |
| --- | --- | --- | --- |

## Needs User Review

| Source | Link text | Old href | Context | Suggested action |
| --- | --- | --- | --- | --- |

## Candidate Removals

| Source | Link text | Old href | Context | Reason removal is being considered |
| --- | --- | --- | --- | --- |
```

- [ ] **Step 4: Fill the report**

Use the inventory and focused audit output to fill `Needs User Review` with every legacy link that does not have a high-confidence replacement. Put any proposed removal in `Candidate Removals`, not in the YAML.

- [ ] **Step 5: Commit the inventory report**

```bash
git add docs/agents/reports/2026-07-17-openapi-zh-link-review.md
git commit -m "docs: add zh openapi link review report"
```

## Task 5: Apply High-Confidence Content Fixes

**Files:**
- Modify: `content/openapi/**/*.zh-CN.yaml`
- Modify: `docs/agents/reports/2026-07-17-openapi-zh-link-review.md`

- [ ] **Step 1: Build replacement candidates from current routes**

For each legacy link, check current targets with `rg`. Use exact or clearly equivalent matches:

```bash
rg -n "http-basic-auth|token-authentication|response-code|status-codes|enable-service|rest-availability|ncs-events|enable-ncs" content/docs/zh-CN content/openapi src/lib/openapi docs/migration/path-map.csv
```

Expected: each replacement has evidence from an existing current route, OpenAPI lane route, or migration mapping.

- [ ] **Step 2: Replace only high-confidence links**

Use direct edits in the relevant `content/openapi/**/*.zh-CN.yaml` files. Safe replacement examples:

```md
[使用 HTTP 认证](https://doc.shengwang.cn/doc/rtc/restful/user-guides/http-basic-auth)
```

can become:

```md
[使用 HTTP 认证](/zh-CN/api-reference/api-ref/console/authentication)
```

only if that route exists and the page is the intended current authentication page for the source product.

Same-lane endpoint links should stay short when the lane context resolves them:

```md
[响应状态码](status-codes)
```

Use an absolute `/zh-CN/api-reference/api-ref/...` route only when a short same-lane link would point to the wrong lane.

- [ ] **Step 3: Record applied replacements**

For every edited href, add a row under `High-Confidence Replacements Applied`:

```md
| `content/openapi/example/example.zh-CN.yaml` | `https://doc.shengwang.cn/doc/example/old` | `/zh-CN/example/new` | Current route exists and migration path-map points old page to new route. |
```

- [ ] **Step 4: Run the focused audit**

Run:

```bash
bun run docs:links:openapi-zh -- --max-samples=200
```

Expected: old links that were replaced no longer appear. Remaining `legacy-shengwang-doc-host` rows correspond to report rows under `Needs User Review` or `Candidate Removals`.

- [ ] **Step 5: Run the focused strict audit**

Run:

```bash
bun run docs:links:openapi-zh:strict -- --max-samples=200
```

Expected before user review is complete: FAIL if unresolved legacy or broken links remain. The failure is acceptable only when every remaining item is listed in `docs/agents/reports/2026-07-17-openapi-zh-link-review.md`.

- [ ] **Step 6: Commit high-confidence content fixes**

```bash
git add content/openapi docs/agents/reports/2026-07-17-openapi-zh-link-review.md
git commit -m "fix: repair zh openapi links"
```

## Task 6: Final Verification and Handoff

**Files:**
- Read: `scripts/audit-doc-links.mjs`
- Read: `package.json`
- Read: `docs/agents/reports/2026-07-17-openapi-zh-link-review.md`
- Read: `content/openapi/**/*.zh-CN.yaml`

- [ ] **Step 1: Run focused tests**

Run:

```bash
bun run test scripts/audit-doc-links.test.ts
```

Expected: PASS.

- [ ] **Step 2: Run focused non-strict audit**

Run:

```bash
bun run docs:links:openapi-zh -- --max-samples=200
```

Expected: report includes only Chinese OpenAPI YAML sources. If any invalid entries remain, each one is present in the review report.

- [ ] **Step 3: Run focused strict audit when review items are resolved**

Run:

```bash
bun run docs:links:openapi-zh:strict -- --max-samples=200
```

Expected after user-approved review handling: PASS. If the user has not yet approved uncertain replacements or removals, keep this command failing and clearly state that the remaining failures are awaiting user decision.

- [ ] **Step 4: Run type check for broad content changes**

Run when many YAML files changed:

```bash
bun run types:check
```

Expected: PASS.

- [ ] **Step 5: Confirm no generated public assets are staged**

Run:

```bash
git status --short public/openapi
```

Expected: no tracked `public/openapi` changes are listed.

- [ ] **Step 6: Final handoff**

Report:

- Commands run and pass/fail status.
- Number of legacy links repaired.
- Number of unresolved links in the review report.
- Whether any link removal is waiting for user approval.
- Files changed.

Commit any final report-only updates:

```bash
git add docs/agents/reports/2026-07-17-openapi-zh-link-review.md
git commit -m "docs: update zh openapi link review status"
```

Only run this final commit when the report changed after the previous commit.

## Self-Review

- Spec coverage: Tasks 1-3 implement the focused audit gate and package scripts. Tasks 4-5 cover high-confidence content fixes and the user-review list for uncertain links or removals. Task 6 covers focused and broad verification.
- Scope check: The plan only targets `content/openapi/**/*.zh-CN.yaml` for the new gate. It does not apply the rule to English OpenAPI or `content/docs/**`.
- Placeholder scan: The plan contains concrete file paths, code snippets, commands, expected results, and commit messages.
- Type consistency: The plan consistently uses `openApiSourcePaths`, `legacyShengwangDocHostLinks`, `legacy-shengwang-doc-host`, `getZhCnOpenApiSourcePaths`, and `--openapi-zh-only`.
