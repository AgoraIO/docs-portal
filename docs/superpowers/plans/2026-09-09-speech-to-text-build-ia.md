# Speech-to-Text Build IA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganize the Chinese Speech-to-Text Build navigation around the approved developer lifecycle, move only affected Build pages, preserve all document names, add permanent redirects for moved URLs, and update every live internal reference to canonical paths.

**Architecture:** The Build root will contain four grouped categories and two direct pages. Existing MDX titles and source filenames stay unchanged. Only Build metadata, selected directories, live links, and redirect mappings change. The product root, Get started IA, Reference IA, and English content stay outside the IA change, although links from those areas to moved Chinese Build pages must be updated.

**Tech Stack:** Fumadocs meta.json, MDX, TanStack Start redirects, TypeScript/Vitest, Bun scripts, static docs checks.

---

## Scope and File Map

Modify only these responsibilities:

- Build metadata:
  - content/docs/zh-CN/realtime-media/speech-to-text/build/meta.json
  - build/setup-and-access/meta.json
  - build/start-and-manage/meta.json
  - build/process-transcription-data/meta.json
  - build/extend-and-optimize/meta.json
- Move the affected Chinese Build pages and keep their frontmatter titles unchanged.
- Update redirect behavior in:
  - src/lib/zh-cn-product-ia-redirects.ts
  - src/lib/docs-page.server.ts
- Update redirect and IA tests in:
  - src/lib/zh-cn-product-ia-standard.test.ts
  - src/lib/docs-page.server.test.ts
- Update live links in Chinese MDX, API reference metadata, API reference overview, and the Chinese OpenAPI sources.

Do not modify English Speech-to-Text IA, historical migration ledgers, generated legacy inventory/report JSON, or unrelated worktree changes. Do not hand-edit generated historical evidence.

## Task 1: Add Contract Tests First

**Files:**
- Modify: src/lib/zh-cn-product-ia-standard.test.ts
- Modify: src/lib/docs-page.server.test.ts

- [ ] **Step 1: Assert the approved Build metadata**

Add a test beside the existing Speech-to-Text IA tests:

~~~ts
it('uses the approved Chinese Speech-to-Text Build IA', () => {
  expect(readMeta(resolve(speechToTextRoot, 'build/meta.json'))).toMatchObject({
    title: '构建实时转录翻译',
    pages: [
      'setup-and-access',
      'start-and-manage',
      'process-transcription-data',
      'record-captions',
      'receive-webhook',
      'extend-and-optimize',
    ],
  });

  expect(
    readMeta(resolve(speechToTextRoot, 'build/setup-and-access/meta.json')),
  ).toMatchObject({
    title: '准备接入',
    pages: ['enable-service', 'http-basic-auth'],
  });

  expect(
    readMeta(resolve(speechToTextRoot, 'build/start-and-manage/meta.json')),
  ).toMatchObject({
    title: '启动和管理任务',
    pages: [
      'enable-from-client',
      'transcribe-specified-hosts',
      'translation',
      'update-service',
    ],
  });

  expect(
    readMeta(
      resolve(speechToTextRoot, 'build/process-transcription-data/meta.json'),
    ),
  ).toMatchObject({
    title: '处理转录翻译数据',
    pages: ['how-to-use-protobuf', 'render-captions', 'encrypt-captions'],
  });

  expect(
    readMeta(resolve(speechToTextRoot, 'build/extend-and-optimize/meta.json')),
  ).toMatchObject({
    title: '扩展与优化',
    pages: ['optimize-quality', 'audio-modality'],
  });
});
~~~

- [ ] **Step 2: Assert the unchanged non-Build IA**

Keep assertions for the existing product root, Get started, and Reference metadata. At minimum, assert:

~~~ts
expect(readMeta(resolve(speechToTextRoot, 'get-started/meta.json'))).toMatchObject({
  title: '快速开始',
  pages: ['quick-start'],
});

expect(readMeta(resolve(speechToTextRoot, 'reference/meta.json'))).toMatchObject({
  title: '参考',
  pages: expect.arrayContaining(['ncs-events']),
});
~~~

- [ ] **Step 3: Add moved-route redirect cases**

Add table-driven cases to src/lib/docs-page.server.test.ts. Each call must expect the new canonical URL and statusCode 301:

~~~ts
it.each([
  [
    ['speech-to-text', 'build', 'start-transcribing-and-translating', 'enable-service'],
    '/zh-CN/realtime-media/speech-to-text/build/setup-and-access/enable-service',
  ],
  [
    ['speech-to-text', 'build', 'start-transcribing-and-translating', 'http-basic-auth'],
    '/zh-CN/realtime-media/speech-to-text/build/setup-and-access/http-basic-auth',
  ],
  [
    ['speech-to-text', 'build', 'start-transcribing-and-translating', 'transcribe-specified-hosts'],
    '/zh-CN/realtime-media/speech-to-text/build/start-and-manage/transcribe-specified-hosts',
  ],
  [
    ['speech-to-text', 'build', 'start-transcribing-and-translating', 'translation'],
    '/zh-CN/realtime-media/speech-to-text/build/start-and-manage/translation',
  ],
  [
    ['speech-to-text', 'build', 'start-transcribing-and-translating', 'update-service'],
    '/zh-CN/realtime-media/speech-to-text/build/start-and-manage/update-service',
  ],
  [
    ['speech-to-text', 'build', 'process-transcription-data', 'record-captions'],
    '/zh-CN/realtime-media/speech-to-text/build/record-captions',
  ],
  [
    ['speech-to-text', 'build', 'monitor-events', 'receive-webhook'],
    '/zh-CN/realtime-media/speech-to-text/build/receive-webhook',
  ],
  [
    ['speech-to-text', 'build', 'extend-and-optimize', 'enable-from-client'],
    '/zh-CN/realtime-media/speech-to-text/build/start-and-manage/enable-from-client',
  ],
] as const)(
  '301 redirects moved Build route %j',
  async (segments, redirectUrl) => {
    await expect(
      loadDocsPagePayload('zh-CN', 'realtime-media', segments),
    ).resolves.toEqual({ redirectUrl, statusCode: 301 });
  },
);
~~~

- [ ] **Step 4: Run the tests and verify the expected red state**

Run:

~~~bash
bunx vitest run src/lib/zh-cn-product-ia-standard.test.ts src/lib/docs-page.server.test.ts
~~~

Expected: the new IA and redirect assertions fail because metadata, files, and redirect targets still use the old structure.

## Task 2: Move Build Pages and Rewrite Metadata

**Files:**
- Create: build/setup-and-access/meta.json
- Create: build/start-and-manage/meta.json
- Modify: build/meta.json
- Modify: build/process-transcription-data/meta.json
- Modify: build/extend-and-optimize/meta.json
- Move: the affected MDX pages listed below
- Delete: build/monitor-events/meta.json after its page is moved

- [ ] **Step 1: Move pages with git mv**

Run:

~~~bash
git mv content/docs/zh-CN/realtime-media/speech-to-text/build/start-transcribing-and-translating/enable-service.mdx content/docs/zh-CN/realtime-media/speech-to-text/build/setup-and-access/enable-service.mdx
git mv content/docs/zh-CN/realtime-media/speech-to-text/build/start-transcribing-and-translating/http-basic-auth.mdx content/docs/zh-CN/realtime-media/speech-to-text/build/setup-and-access/http-basic-auth.mdx
git mv content/docs/zh-CN/realtime-media/speech-to-text/build/start-transcribing-and-translating/transcribe-specified-hosts.mdx content/docs/zh-CN/realtime-media/speech-to-text/build/start-and-manage/transcribe-specified-hosts.mdx
git mv content/docs/zh-CN/realtime-media/speech-to-text/build/start-transcribing-and-translating/translation.mdx content/docs/zh-CN/realtime-media/speech-to-text/build/start-and-manage/translation.mdx
git mv content/docs/zh-CN/realtime-media/speech-to-text/build/start-transcribing-and-translating/update-service.mdx content/docs/zh-CN/realtime-media/speech-to-text/build/start-and-manage/update-service.mdx
git mv content/docs/zh-CN/realtime-media/speech-to-text/build/extend-and-optimize/enable-from-client.mdx content/docs/zh-CN/realtime-media/speech-to-text/build/start-and-manage/enable-from-client.mdx
git mv content/docs/zh-CN/realtime-media/speech-to-text/build/process-transcription-data/record-captions.mdx content/docs/zh-CN/realtime-media/speech-to-text/build/record-captions.mdx
git mv content/docs/zh-CN/realtime-media/speech-to-text/build/monitor-events/receive-webhook.mdx content/docs/zh-CN/realtime-media/speech-to-text/build/receive-webhook.mdx
~~~

Do not move how-to-use-protobuf.mdx, render-captions.mdx, encrypt-captions.mdx, optimize-quality.mdx, or audio-modality.mdx.

- [ ] **Step 2: Create grouped-category metadata**

Create setup-and-access/meta.json:

~~~json
{
  "title": "准备接入",
  "pages": ["enable-service", "http-basic-auth"]
}
~~~

Create start-and-manage/meta.json:

~~~json
{
  "title": "启动和管理任务",
  "pages": [
    "enable-from-client",
    "transcribe-specified-hosts",
    "translation",
    "update-service"
  ]
}
~~~

- [ ] **Step 3: Rewrite the Build root metadata**

Set build/meta.json to:

~~~json
{
  "title": "构建实时转录翻译",
  "pages": [
    "setup-and-access",
    "start-and-manage",
    "process-transcription-data",
    "record-captions",
    "receive-webhook",
    "extend-and-optimize"
  ]
}
~~~

The two direct pages must be listed directly in the Build root. Do not create wrapper metadata for them.

- [ ] **Step 4: Rewrite the remaining category metadata**

Set process-transcription-data/meta.json to:

~~~json
{
  "title": "处理转录翻译数据",
  "pages": ["how-to-use-protobuf", "render-captions", "encrypt-captions"]
}
~~~

Set extend-and-optimize/meta.json to:

~~~json
{
  "title": "扩展与优化",
  "pages": ["optimize-quality", "audio-modality"]
}
~~~

Remove the old monitor-events metadata after its page is moved. Do not edit page frontmatter titles.

- [ ] **Step 5: Run the metadata contract test**

~~~bash
bunx vitest run src/lib/zh-cn-product-ia-standard.test.ts
~~~

Expected: the Build tree assertions pass. Redirect assertions may remain red until Task 3.

## Task 3: Add Permanent Redirects

**Files:**
- Modify: src/lib/zh-cn-product-ia-redirects.ts
- Modify: src/lib/docs-page.server.ts
- Modify: src/lib/docs-page.server.test.ts
- Modify: src/lib/zh-cn-product-ia-standard.test.ts

- [ ] **Step 1: Add exact current-route mappings**

Add these source keys to ZH_CN_PRODUCT_IA_REDIRECTS:

~~~ts
'realtime-media/speech-to-text/build/start-transcribing-and-translating/enable-service':
  '/zh-CN/realtime-media/speech-to-text/build/setup-and-access/enable-service',
'realtime-media/speech-to-text/build/start-transcribing-and-translating/http-basic-auth':
  '/zh-CN/realtime-media/speech-to-text/build/setup-and-access/http-basic-auth',
'realtime-media/speech-to-text/build/start-transcribing-and-translating/transcribe-specified-hosts':
  '/zh-CN/realtime-media/speech-to-text/build/start-and-manage/transcribe-specified-hosts',
'realtime-media/speech-to-text/build/start-transcribing-and-translating/translation':
  '/zh-CN/realtime-media/speech-to-text/build/start-and-manage/translation',
'realtime-media/speech-to-text/build/start-transcribing-and-translating/update-service':
  '/zh-CN/realtime-media/speech-to-text/build/start-and-manage/update-service',
'realtime-media/speech-to-text/build/process-transcription-data/record-captions':
  '/zh-CN/realtime-media/speech-to-text/build/record-captions',
'realtime-media/speech-to-text/build/monitor-events/receive-webhook':
  '/zh-CN/realtime-media/speech-to-text/build/receive-webhook',
'realtime-media/speech-to-text/build/extend-and-optimize/enable-from-client':
  '/zh-CN/realtime-media/speech-to-text/build/start-and-manage/enable-from-client',
~~~

- [ ] **Step 2: Make these redirect payloads permanent**

Extend the existing Build redirect status predicate in src/lib/docs-page.server.ts so targets under the new Chinese Speech-to-Text Build paths return statusCode 301. Keep the existing RTM behavior unchanged and do not make unrelated redirect types permanent. Use a clearly named Speech-to-Text prefix set or a clearly named combined predicate.

- [ ] **Step 3: Update legacy source aliases**

In the zhCnSpeechToTextRedirects table in src/lib/docs-page.server.ts, update aliases for enable-service, HTTP authentication, task-management pages, record captions, client initiation, and Webhook setup to the new canonical paths. Keep the existing reference/ncs-events target unchanged.

- [ ] **Step 4: Complete the redirect tests**

Make Task 1 cases pass. Add legacy alias cases that assert the new target. Every moved current URL must assert the exact target and statusCode 301; unchanged Get started and Reference routes must retain their existing targets.

- [ ] **Step 5: Run redirect-focused tests**

~~~bash
bunx vitest run src/lib/docs-page.server.test.ts src/lib/zh-cn-product-ia-standard.test.ts src/routes/-docs-routing-guards.test.ts
~~~

Expected: moved current routes resolve to the new canonical path with status 301, while existing unrelated redirect cases remain green.

## Task 4: Update Live Internal References

**Files:**
- Modify every live content, configuration, source-code, or test file returned by the scoped search.
- Do not modify historical migration reports or generated inventory solely because they contain old routes.

- [ ] **Step 1: Inventory live matches**

Run:

~~~bash
rg -n '(/zh-CN|/en)/realtime-media/speech-to-text/build/(start-transcribing-and-translating|process-transcription-data|monitor-events|extend-and-optimize)' content src scripts vercel*.json --glob '!**/node_modules/**'
~~~

Classify matches as live site links, redirect/source mappings, test expectations, English unchanged routes, or historical/generated evidence.

- [ ] **Step 2: Replace moved Chinese links**

Use this replacement map for live Chinese links:

~~~text
start-transcribing-and-translating/enable-service -> setup-and-access/enable-service
start-transcribing-and-translating/http-basic-auth -> setup-and-access/http-basic-auth
start-transcribing-and-translating/transcribe-specified-hosts -> start-and-manage/transcribe-specified-hosts
start-transcribing-and-translating/translation -> start-and-manage/translation
start-transcribing-and-translating/update-service -> start-and-manage/update-service
process-transcription-data/record-captions -> record-captions
monitor-events/receive-webhook -> receive-webhook
extend-and-optimize/enable-from-client -> start-and-manage/enable-from-client
~~~

Update links in the Chinese quick start and reference pages as needed. This changes link targets only and does not change their navigation IA.

- [ ] **Step 3: Update API reference and OpenAPI links**

Update moved Chinese links in:

- content/docs/zh-CN/api-reference/speech-to-text/restful/api/meta.json
- content/docs/zh-CN/api-reference/api-ref/speech-to-text/index.mdx
- content/openapi/speech-to-text/v7.yaml
- content/openapi/speech-to-text/v7.zh-CN.yaml

Leave v7.en.yaml and English docs unchanged because only the Chinese Build IA is in scope.

- [ ] **Step 4: Update live source-code and test targets**

Update canonical targets in src/lib/docs-page.server.ts and
src/lib/zh-cn-product-ia-standard.test.ts. Keep historical path-map and
legacy inventory records intact unless an existing generator explicitly
rebuilds them.

- [ ] **Step 5: Prove that no live link uses a moved old path**

Run:

~~~bash
rg -n '/zh-CN/realtime-media/speech-to-text/build/(start-transcribing-and-translating|process-transcription-data/record-captions|monitor-events/receive-webhook|extend-and-optimize/enable-from-client)' content src scripts --glob '!**/node_modules/**' --glob '!docs/migration/**' --glob '!docs/agents/reports/**'
~~~

Expected: no live internal link matches. Redirect tables and explicit tests may still contain old paths as compatibility source keys.

## Task 5: Validate and Hand Off

- [ ] **Step 1: Run focused IA and redirect tests**

~~~bash
bunx vitest run src/lib/zh-cn-product-ia-standard.test.ts src/lib/docs-page.server.test.ts src/routes/-docs-routing-guards.test.ts
~~~

Expected: PASS for metadata order, unchanged non-Build IA, moved targets, and 301 payloads.

- [ ] **Step 2: Run the strict internal-link audit**

~~~bash
bun run docs:links:strict
~~~

Expected: PASS with no broken canonical links caused by the Build moves.

- [ ] **Step 3: Run TypeScript and MDX validation**

~~~bash
bun run types:check
~~~

Expected: PASS with generated Fumadocs output resolving the new Build tree and unchanged page titles.

- [ ] **Step 4: Run the production build**

~~~bash
bun run build
~~~

Expected: PASS, including the legacy redirect artifact check and static output for all new canonical pages.

- [ ] **Step 5: Review scope before commit**

~~~bash
git diff --stat
git diff --check
git status --short
~~~

Confirm the diff contains only Speech-to-Text Build IA/path/reference changes and required tests. Do not stage or revert pre-existing cloud-recording changes.

- [ ] **Step 6: Commit only the implementation files**

Use explicit paths when staging so unrelated worktree changes are excluded:

~~~bash
git add content/docs/zh-CN/realtime-media/speech-to-text \
  content/docs/zh-CN/api-reference/speech-to-text \
  content/openapi/speech-to-text/v7.yaml \
  content/openapi/speech-to-text/v7.zh-CN.yaml \
  src/lib/zh-cn-product-ia-redirects.ts \
  src/lib/docs-page.server.ts \
  src/lib/zh-cn-product-ia-standard.test.ts \
  src/lib/docs-page.server.test.ts
git commit -m "docs: reorganize speech-to-text build IA"
~~~

## Plan Self-Review

- Spec coverage: the plan covers the approved Build tree, two direct pages, unchanged non-Build IA, unchanged document names, canonical path moves, 301 redirects, live-link updates, and validation.
- Placeholder scan: no unfinished marker, unspecified file, or future decision remains.
- Type consistency: redirect mappings return the existing string target shape; docs-page.server returns the existing redirect payload with statusCode 301; tests assert that same payload.
- Scope check: English routes and historical migration data are explicitly excluded because only the Chinese Build IA is approved for change.
