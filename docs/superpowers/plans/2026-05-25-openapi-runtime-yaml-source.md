# OpenAPI Runtime YAML Source Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix client-side navigation to generated OpenAPI endpoint pages on Vercel by removing runtime file-system reads of `content/openapi/**`.

**Architecture:** Keep `content/openapi/**` as the single maintained source and `/openapi/**` as the public copied asset. For server rendering and TanStack loaders, import YAML with Vite `?raw` into a server-only source registry so the YAML text is bundled into the function. The OpenAPI normalizer consumes YAML text, not a runtime path.

**Tech Stack:** TanStack Start, Vite raw imports, Vitest, `js-yaml`, `@apidevtools/swagger-parser`, docs-portal OpenAPI lane registry.

---

### Task 1: Prove Runtime Loader Must Not Depend On `process.cwd()` Files

**Files:**
- Modify: `src/lib/openapi/source.server.test.ts`
- Modify: `src/lib/openapi/source.server.ts`

- [ ] **Step 1: Write the failing test**

Add a regression test that changes the Node current working directory to a temporary folder with no `content/` or `public/` copy, then loads `start-agent`:

```ts
it('loads bundled YAML when runtime cwd has no content or public folders', async () => {
  const originalCwd = process.cwd();
  const runtimeCwd = await fs.mkdtemp(
    path.join(os.tmpdir(), 'docs-openapi-runtime-'),
  );

  try {
    process.chdir(runtimeCwd);

    const operation = await getOpenApiOperation(lane, 'start-agent');

    expect(operation.method).toBe('POST');
    expect(operation.path).toBe('/v2/projects/{appid}/join');
  } finally {
    process.chdir(originalCwd);
    await fs.rm(runtimeCwd, { force: true, recursive: true });
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test src/lib/openapi/source.server.test.ts`

Expected before implementation: FAIL with `ENOENT` for either `public/openapi/...` or `content/openapi/...`.

- [ ] **Step 3: Add a YAML text source contract**

Change `src/lib/openapi/source.server.ts` so `loadDereferencedOpenApiDocument` reads YAML text from a lane source function instead of `fs.readFile(process.cwd())`.

Minimal implementation shape:

```ts
import { getOpenApiSourceText } from './source-text.server';

async function loadDereferencedOpenApiDocument(
  lane: OpenApiLane,
): Promise<OpenApiDocument> {
  const document = yaml.load(getOpenApiSourceText(lane));
  // existing SwaggerParser.dereference call remains unchanged
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun run test src/lib/openapi/source.server.test.ts`

Expected: PASS, including the new runtime-cwd regression test.

### Task 2: Bundle Maintained YAML Into Server Runtime

**Files:**
- Create: `src/lib/openapi/source-text.server.ts`
- Modify: `src/lib/openapi/lanes.ts`
- Modify: `src/lib/openapi/lanes.test.ts`

- [ ] **Step 1: Add server-only raw YAML registry**

Create `src/lib/openapi/source-text.server.ts`:

```ts
import convoAiOpenApiYaml from '../../../content/openapi/conversational-ai/convoai.yaml?raw';
import type { OpenApiLane } from './lanes';

const OPENAPI_SOURCE_TEXT: Record<string, string> = {
  'content/openapi/conversational-ai/convoai.yaml': convoAiOpenApiYaml,
};

export function getOpenApiSourceText(lane: OpenApiLane) {
  const source = OPENAPI_SOURCE_TEXT[lane.sourcePath];

  if (!source) {
    throw new Error(`Missing bundled OpenAPI source for lane "${lane.id}"`);
  }

  return source;
}
```

- [ ] **Step 2: Remove runtime source path from lane contract**

Remove `runtimeSourcePath` from `OpenApiLane` and the `convoai` lane. `sourcePath` remains the maintained source key. `publicSourceUrl` remains the user-facing source link.

- [ ] **Step 3: Update lane tests**

Update `src/lib/openapi/lanes.test.ts` so it no longer expects `runtimeSourcePath`. Keep assertions for `sourcePath` and `publicSourceUrl`.

- [ ] **Step 4: Run focused tests**

Run: `bun run test src/lib/openapi/lanes.test.ts src/lib/openapi/source.server.test.ts`

Expected: PASS.

### Task 3: Verify Vercel Function Bundle No Longer Contains Runtime YAML File Reads

**Files:**
- Modify: none expected.

- [ ] **Step 1: Run typecheck**

Run: `bun run types:check`

Expected: exit 0.

- [ ] **Step 2: Run build**

Run: `bun run build`

Expected: exit 0.

- [ ] **Step 3: Inspect output**

Run:

```bash
rg "content/openapi/conversational-ai/convoai.yaml|public/openapi/conversational-ai/convoai.yaml|fs\\.readFile\\(" -n .vercel/output/functions/__server.func/_ssr/source.server-*.mjs
```

Expected: no `fs.readFile(process.cwd()...)` in the OpenAPI source server bundle. The string `content/openapi/conversational-ai/convoai.yaml` may remain only as the registry key or error context.

- [ ] **Step 4: Confirm public YAML is still published**

Run:

```bash
ls -l .vercel/output/static/openapi/conversational-ai/convoai.yaml
```

Expected: file exists.

### Task 4: Commit Locally Only

**Files:**
- Commit only changed source/test/plan files.

- [ ] **Step 1: Review diff**

Run: `git diff --check && git diff --stat && git status --short`

Expected: no whitespace errors; only planned files changed.

- [ ] **Step 2: Commit without push**

Run:

```bash
git add src/lib/openapi/lanes.ts src/lib/openapi/lanes.test.ts src/lib/openapi/source.server.ts src/lib/openapi/source.server.test.ts src/lib/openapi/source-text.server.ts docs/superpowers/plans/2026-05-25-openapi-runtime-yaml-source.md
git commit -m "fix: bundle openapi yaml for runtime loaders"
```

Expected: local commit created. Do not run `git push`.
