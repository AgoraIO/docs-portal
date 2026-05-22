# Conversational AI OpenAPI Rendering Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render Conversational AI REST OpenAPI reference pages from the legacy `convoai.yaml` source while preserving the docs portal shell, static output, and AI-readable exports.

**Architecture:** Treat `content/**` as the single staging layer: authored docs stay in `content/docs/**`, OpenAPI sources stay in `content/openapi/**`, and legacy generated HTML remains deferred. The website consumes YAML from `content/openapi`, renders endpoint pages with local components keyed by `operationId`, publishes YAML to `/openapi/**` via build copy, and exposes generated endpoint Markdown through existing `llms` routes.

**Tech Stack:** TanStack Start, Vite/Nitro Vercel output, Fumadocs Core/MDX, `fumadocs-openapi` parser/source utilities only, local React/Tailwind docs-shell components, Node.js build scripts, Vitest.

---

## Source Decisions

- Scope is Conversational AI REST OpenAPI only.
- Source YAML comes from `/Users/czhen/Documents/GitHub/AgoraIO/shengwang-doc-source/html-docs/convoai/RESTful/convoai.yaml`.
- Staging source path is `content/openapi/conversational-ai/convoai.yaml`.
- Public YAML URL is `/openapi/conversational-ai/convoai.yaml`.
- `content/docs/**` remains the Fumadocs MDX/page-tree domain. Do not place OpenAPI YAML under `content/docs/**`, because Fumadocs MDX treats `.yaml` files under that tree as metadata files.
- Endpoint content is generated from YAML by `operationId`; do not generate full MDX shadow files for every endpoint.
- Optional human overrides live beside the OpenAPI source and are keyed by `operationId`.
- Do not use `fumadocs-ui` for OpenAPI page rendering. `fumadocs-openapi` may be used for schema parsing/source utilities, but page rendering belongs to local portal components.

## File Structure

- Create `content/openapi/conversational-ai/convoai.yaml`: staged OpenAPI source copied from the legacy docs repo.
- Create `content/openapi/conversational-ai/openapi.meta.json`: staging metadata for public URL, locales, route prefix, and override directory.
- Create `content/openapi/conversational-ai/overrides/.gitkeep`: placeholder for future `operationId` overrides.
- Create `scripts/sync-openapi-assets.mjs`: copies `content/openapi/**` YAML/JSON assets to `public/openapi/**`.
- Modify `package.json`: run the copy script before `vite build` and preserve existing scripts.
- Add dependency `fumadocs-openapi` at a version compatible with current `fumadocs-core@16.7.16`; prefer `10.7.1` or another verified compatible version, not latest if it requires newer `fumadocs-ui/core`.
- Create `src/lib/openapi/conversational-ai.ts`: declares schema id/path, operation route mapping, public YAML URL, and override contract.
- Create `src/lib/openapi/source.server.ts`: loads and dereferences the Conversational AI OpenAPI document and exposes typed operations by `operationId`.
- Create `src/lib/openapi/markdown.ts`: serializes an OpenAPI operation into canonical Markdown for `llms-full.txt` and raw markdown routes.
- Create `src/lib/openapi/page-source.server.ts`: converts OpenAPI operations into Fumadocs-compatible virtual page files or page records.
- Create `src/components/openapi/OpenApiOperationContent.tsx`: local renderer for endpoint pages, with no `fumadocs-ui` imports.
- Create `src/components/openapi/OpenApiOperationContent.test.tsx`: renderer smoke tests for method/path/parameters/body/responses.
- Modify `src/lib/source.server.ts`: merge MDX pages with OpenAPI virtual pages and make `getLLMText()` branch between MDX processed text and OpenAPI generated Markdown.
- Modify `src/lib/docs-page.server.ts`: return enough page kind data for `DocsContent` to choose MDX body vs OpenAPI renderer.
- Modify `src/components/docs-shell/DocsContent.tsx`: accept an OpenAPI payload and render `OpenApiOperationContent` for OpenAPI pages.
- Modify `src/routes/llms[.]mdx.docs.$.ts`: allow raw markdown for OpenAPI pages even though no physical `.mdx` file exists.
- Modify `src/lib/prerender-filter.ts`: continue excluding `/llms.mdx/docs/**`; keep ordinary OpenAPI docs pages prerenderable.
- Modify `.agents/skills/fumadocs-migration/SKILL.md`: reference the OpenAPI lane standard.
- Modify `.agents/skills/fumadocs-migration/references/standards.md`: add staging/source ownership and OpenAPI lane rules.
- Modify `.agents/skills/fumadocs-migration/references/legacy-casebook.md`: add RESTful/OpenAPI migration details and deferred SDK/generated HTML boundaries.
- Create `.agents/skills/fumadocs-migration/references/openapi-lane.md`: durable OpenAPI rendering/migration standard.

## Task 1: Stage The OpenAPI Source

**Files:**
- Create: `content/openapi/conversational-ai/convoai.yaml`
- Create: `content/openapi/conversational-ai/openapi.meta.json`
- Create: `content/openapi/conversational-ai/overrides/.gitkeep`
- Test: none

- [ ] **Step 1: Copy the legacy YAML**

Run:

```bash
mkdir -p content/openapi/conversational-ai/overrides
cp /Users/czhen/Documents/GitHub/AgoraIO/shengwang-doc-source/html-docs/convoai/RESTful/convoai.yaml content/openapi/conversational-ai/convoai.yaml
touch content/openapi/conversational-ai/overrides/.gitkeep
```

Expected: `content/openapi/conversational-ai/convoai.yaml` begins with `openapi: 3.1.0`.

- [ ] **Step 2: Add staging metadata**

Create `content/openapi/conversational-ai/openapi.meta.json`:

```json
{
  "id": "conversational-ai",
  "title": "Conversational AI REST API",
  "source": "convoai.yaml",
  "publicPath": "/openapi/conversational-ai/convoai.yaml",
  "routePrefix": "api-reference/conversational-ai/rest-api/agent",
  "overrideDir": "overrides",
  "locales": ["en", "zh-CN"],
  "operationRoutes": {
    "start-agent": "join",
    "stop-agent": "leave",
    "agent-update": "update",
    "query-agent-status": "query",
    "get-agent-list": "list",
    "agent-speak": "speak",
    "agent-interrupt": "interrupt",
    "agent-think": "think",
    "get-history": "history",
    "get-turns": "turns"
  }
}
```

- [ ] **Step 3: Verify operation IDs**

Run:

```bash
rg -n "operationId:" content/openapi/conversational-ai/convoai.yaml
```

Expected: the command lists exactly the 10 REST operation IDs in `operationRoutes`.

- [ ] **Step 4: Commit**

Run:

```bash
git add content/openapi/conversational-ai
git commit -m "feat: stage conversational ai openapi source"
```

Expected: commit includes only the staged OpenAPI source and metadata.

## Task 2: Publish YAML As A Static Asset

**Files:**
- Create: `scripts/sync-openapi-assets.mjs`
- Modify: `package.json`
- Test: `src/lib/openapi-assets.test.ts` if a helper is extracted; otherwise verify by command output.

- [ ] **Step 1: Write the copy script**

Create `scripts/sync-openapi-assets.mjs`:

```js
#!/usr/bin/env node

import { mkdir, readdir, copyFile, rm } from 'node:fs/promises';
import path from 'node:path';

const sourceRoot = path.resolve('content/openapi');
const publicRoot = path.resolve('public/openapi');
const allowedExtensions = new Set(['.yaml', '.yml', '.json']);

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(absolute)));
      continue;
    }
    if (entry.isFile() && allowedExtensions.has(path.extname(entry.name))) {
      files.push(absolute);
    }
  }

  return files;
}

await rm(publicRoot, { force: true, recursive: true });

for (const source of await walk(sourceRoot)) {
  const relative = path.relative(sourceRoot, source);
  const target = path.join(publicRoot, relative);
  await mkdir(path.dirname(target), { recursive: true });
  await copyFile(source, target);
  console.log(`copied ${relative}`);
}
```

- [ ] **Step 2: Wire the script into build**

Modify `package.json` scripts:

```json
{
  "scripts": {
    "openapi:sync": "node scripts/sync-openapi-assets.mjs",
    "build": "bun run openapi:sync && vite build"
  }
}
```

Keep existing scripts unchanged otherwise.

- [ ] **Step 3: Verify copy output**

Run:

```bash
bun run openapi:sync
test -f public/openapi/conversational-ai/convoai.yaml
head -n 1 public/openapi/conversational-ai/convoai.yaml
```

Expected: first line is `openapi: 3.1.0`.

- [ ] **Step 4: Commit**

Run:

```bash
git add package.json scripts/sync-openapi-assets.mjs public/openapi/conversational-ai/convoai.yaml
git commit -m "feat: publish openapi assets from content staging"
```

Expected: source remains under `content/openapi`; `public/openapi` is generated by script.

## Task 3: Load OpenAPI Operations

**Files:**
- Modify: `package.json`, lockfile
- Create: `src/lib/openapi/conversational-ai.ts`
- Create: `src/lib/openapi/source.server.ts`
- Test: `src/lib/openapi/source.server.test.ts`

- [ ] **Step 1: Install a compatible parser dependency**

Run:

```bash
bun add fumadocs-openapi@10.7.1
```

Expected: peer dependencies remain compatible with current `fumadocs-core@16.7.16`. If Bun resolves a version conflict, inspect `npm view fumadocs-openapi@10.7.1 peerDependencies --json` and choose the newest compatible version.

- [ ] **Step 2: Write failing loader tests**

Create `src/lib/openapi/source.server.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { getConversationalAiOperation } from './source.server';

describe('conversational ai openapi source', () => {
  it('loads operations by operationId', async () => {
    const operation = await getConversationalAiOperation('start-agent');

    expect(operation.operationId).toBe('start-agent');
    expect(operation.method).toBe('post');
    expect(operation.path).toBe('/v2/projects/{appid}/join');
    expect(operation.summary).toBe('创建对话式智能体');
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run:

```bash
bun run test src/lib/openapi/source.server.test.ts
```

Expected: FAIL because `source.server.ts` does not exist.

- [ ] **Step 4: Add OpenAPI constants**

Create `src/lib/openapi/conversational-ai.ts`:

```ts
export const CONVERSATIONAL_AI_OPENAPI_ID = 'conversational-ai';
export const CONVERSATIONAL_AI_OPENAPI_SOURCE =
  'content/openapi/conversational-ai/convoai.yaml';
export const CONVERSATIONAL_AI_OPENAPI_PUBLIC_URL =
  '/openapi/conversational-ai/convoai.yaml';
export const CONVERSATIONAL_AI_ROUTE_PREFIX = [
  'api-reference',
  'conversational-ai',
  'rest-api',
  'agent',
] as const;

export const conversationalAiOperationRoutes = {
  'start-agent': 'join',
  'stop-agent': 'leave',
  'agent-update': 'update',
  'query-agent-status': 'query',
  'get-agent-list': 'list',
  'agent-speak': 'speak',
  'agent-interrupt': 'interrupt',
  'agent-think': 'think',
  'get-history': 'history',
  'get-turns': 'turns',
} as const;

export type ConversationalAiOperationId =
  keyof typeof conversationalAiOperationRoutes;
```

- [ ] **Step 5: Implement operation loader**

Create `src/lib/openapi/source.server.ts` using `createOpenAPI`:

```ts
import { createOpenAPI } from 'fumadocs-openapi/server';
import type { HttpMethods, OperationObject } from 'fumadocs-openapi';
import {
  CONVERSATIONAL_AI_OPENAPI_ID,
  CONVERSATIONAL_AI_OPENAPI_SOURCE,
  type ConversationalAiOperationId,
} from './conversational-ai';

const openapi = createOpenAPI({
  input: {
    [CONVERSATIONAL_AI_OPENAPI_ID]: CONVERSATIONAL_AI_OPENAPI_SOURCE,
  },
});

export type LoadedOpenApiOperation = OperationObject & {
  method: HttpMethods;
  path: string;
  operationId: string;
};

export async function getConversationalAiSchema() {
  return openapi.getSchema(CONVERSATIONAL_AI_OPENAPI_ID);
}

export async function getConversationalAiOperation(
  operationId: ConversationalAiOperationId | string,
): Promise<LoadedOpenApiOperation> {
  const schema = await getConversationalAiSchema();

  for (const [path, pathItem] of Object.entries(schema.dereferenced.paths ?? {})) {
    for (const method of ['get', 'post', 'patch', 'delete', 'head', 'put'] as const) {
      const operation = pathItem?.[method];

      if (operation?.operationId === operationId) {
        return {
          ...operation,
          method,
          path,
          operationId,
        };
      }
    }
  }

  throw new Error(`Unknown Conversational AI operationId: ${operationId}`);
}
```

- [ ] **Step 6: Run loader test**

Run:

```bash
bun run test src/lib/openapi/source.server.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit**

Run:

```bash
git add package.json bun.lock src/lib/openapi
git commit -m "feat: load conversational ai openapi operations"
```

Expected: commit includes dependency and loader code/tests.

## Task 4: Generate Fumadocs Page Records

**Files:**
- Create: `src/lib/openapi/page-source.server.ts`
- Modify: `src/lib/source.server.ts`
- Test: `src/lib/openapi/page-source.server.test.ts`, `src/lib/docs-page.server.test.ts`

- [ ] **Step 1: Write failing virtual page tests**

Create `src/lib/openapi/page-source.server.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { getConversationalAiOpenApiVirtualPages } from './page-source.server';

describe('conversational ai openapi virtual pages', () => {
  it('creates localized page records for each operation route', async () => {
    const pages = await getConversationalAiOpenApiVirtualPages();
    const join = pages.find(
      (page) =>
        page.locale === 'en' &&
        page.slugs.join('/') ===
          'api-reference/conversational-ai/rest-api/agent/join',
    );

    expect(join).toMatchObject({
      operationId: 'start-agent',
      method: 'post',
      publicSourceUrl: '/openapi/conversational-ai/convoai.yaml',
      title: '创建对话式智能体',
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
bun run test src/lib/openapi/page-source.server.test.ts
```

Expected: FAIL because page-source module does not exist.

- [ ] **Step 3: Implement virtual page records**

Create `src/lib/openapi/page-source.server.ts`:

```ts
import { buildDocPath } from '@/lib/docs-routing';
import { SUPPORTED_LOCALES } from '@/lib/i18n/i18n-config';
import {
  CONVERSATIONAL_AI_OPENAPI_PUBLIC_URL,
  CONVERSATIONAL_AI_ROUTE_PREFIX,
  conversationalAiOperationRoutes,
} from './conversational-ai';
import { getConversationalAiOperation } from './source.server';

export type OpenApiVirtualPage = {
  description?: string;
  locale: string;
  method: string;
  operationId: string;
  path: string;
  publicSourceUrl: string;
  routeLeaf: string;
  slugs: string[];
  title: string;
  url: string;
};

export async function getConversationalAiOpenApiVirtualPages() {
  const pages: OpenApiVirtualPage[] = [];

  for (const [operationId, routeLeaf] of Object.entries(
    conversationalAiOperationRoutes,
  )) {
    const operation = await getConversationalAiOperation(operationId);

    for (const locale of SUPPORTED_LOCALES) {
      const slugs = [...CONVERSATIONAL_AI_ROUTE_PREFIX, routeLeaf];

      pages.push({
        description: operation.description,
        locale,
        method: operation.method,
        operationId,
        path: operation.path,
        publicSourceUrl: CONVERSATIONAL_AI_OPENAPI_PUBLIC_URL,
        routeLeaf,
        slugs,
        title: operation.summary ?? operationId,
        url: buildDocPath(locale, slugs[0], slugs.slice(1)),
      });
    }
  }

  return pages;
}
```

- [ ] **Step 4: Decide integration representation**

Before editing `source.server.ts`, inspect whether Fumadocs `loader()` can accept async OpenAPI virtual source in this repo without breaking synchronous route imports.

If it cannot, keep the MDX `source` as-is and add OpenAPI page lookup helpers used by `docs-page.server.ts`, search, and llms routes. Do not block on perfect Fumadocs `multiple()` integration if it creates async source initialization problems.

- [ ] **Step 5: Wire docs payload lookup**

Modify `src/lib/docs-page.server.ts` so `loadDocsPagePayload(locale, tab, slugSegments)` first tries existing MDX `source.getPage()`, then tries OpenAPI virtual pages when `tab === 'api-reference'`.

OpenAPI payload must include:

```ts
kind: 'openapi'
openapi: {
  operationId: string;
  method: string;
  path: string;
  publicSourceUrl: string;
}
```

Keep existing MDX payload shape for normal pages.

- [ ] **Step 6: Add docs payload test**

Extend `src/lib/docs-page.server.test.ts` with a mocked OpenAPI page and assert:

```ts
expect(payload).toMatchObject({
  activePath: '/en/api-reference/conversational-ai/rest-api/agent/join',
  activeTab: 'api-reference',
  kind: 'openapi',
  markdownUrl:
    '/llms.mdx/docs/en/api-reference/conversational-ai/rest-api/agent/join.mdx',
  openapi: {
    operationId: 'start-agent',
    method: 'post',
    path: '/v2/projects/{appid}/join',
    publicSourceUrl: '/openapi/conversational-ai/convoai.yaml',
  },
});
```

- [ ] **Step 7: Run tests**

Run:

```bash
bun run test src/lib/openapi/page-source.server.test.ts src/lib/docs-page.server.test.ts
```

Expected: PASS.

- [ ] **Step 8: Commit**

Run:

```bash
git add src/lib/openapi/page-source.server.ts src/lib/openapi/page-source.server.test.ts src/lib/docs-page.server.ts src/lib/docs-page.server.test.ts src/lib/source.server.ts
git commit -m "feat: expose openapi operations as docs pages"
```

Expected: OpenAPI pages are addressable without generating full MDX shadow files.

## Task 5: Render Endpoint Pages With Local Components

**Files:**
- Create: `src/components/openapi/OpenApiOperationContent.tsx`
- Create: `src/components/openapi/OpenApiOperationContent.test.tsx`
- Modify: `src/components/docs-shell/DocsContent.tsx`
- Test: `src/components/docs-shell/DocsContent.test.tsx`

- [ ] **Step 1: Write renderer tests**

Create `src/components/openapi/OpenApiOperationContent.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { OpenApiOperationContent } from './OpenApiOperationContent';

describe('OpenApiOperationContent', () => {
  it('renders method, path, source URL, and operation id', () => {
    render(
      <OpenApiOperationContent
        operation={{
          description: 'Create and start an agent.',
          method: 'post',
          operationId: 'start-agent',
          path: '/v2/projects/{appid}/join',
          publicSourceUrl: '/openapi/conversational-ai/convoai.yaml',
          title: 'Start a conversational AI agent',
        }}
      />,
    );

    expect(screen.getByText('POST')).toBeInTheDocument();
    expect(screen.getByText('/v2/projects/{appid}/join')).toBeInTheDocument();
    expect(screen.getByText('start-agent')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /OpenAPI source/i }),
    ).toHaveAttribute('href', '/openapi/conversational-ai/convoai.yaml');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
bun run test src/components/openapi/OpenApiOperationContent.test.tsx
```

Expected: FAIL because renderer does not exist.

- [ ] **Step 3: Implement minimal local renderer**

Create `src/components/openapi/OpenApiOperationContent.tsx`:

```tsx
import { ExternalLinkIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

type OpenApiOperationView = {
  description?: string;
  method: string;
  operationId: string;
  path: string;
  publicSourceUrl: string;
  title: string;
};

export function OpenApiOperationContent({
  operation,
}: {
  operation: OpenApiOperationView;
}) {
  return (
    <section className="not-prose flex flex-col gap-6">
      <div className="rounded-lg border border-[color:var(--line-soft)] bg-card p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              'inline-flex h-7 min-w-14 items-center justify-center rounded-md px-2 text-xs font-bold uppercase text-white',
              methodColor(operation.method),
            )}
          >
            {operation.method}
          </span>
          <code className="min-w-0 flex-1 overflow-x-auto text-sm text-[color:var(--ink-2)]">
            {operation.path}
          </code>
        </div>
        {operation.description ? (
          <p className="mt-4 text-sm leading-6 text-[color:var(--ink-3)]">
            {operation.description}
          </p>
        ) : null}
      </div>

      <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
        <div className="rounded-lg border border-[color:var(--line-soft)] bg-card p-3">
          <dt className="text-xs font-semibold uppercase text-[color:var(--ink-4)]">
            Operation ID
          </dt>
          <dd className="mt-1 font-mono text-[color:var(--ink-1)]">
            {operation.operationId}
          </dd>
        </div>
        <div className="rounded-lg border border-[color:var(--line-soft)] bg-card p-3">
          <dt className="text-xs font-semibold uppercase text-[color:var(--ink-4)]">
            Source
          </dt>
          <dd className="mt-1">
            <a
              className="inline-flex items-center gap-1.5 text-[color:var(--accent)] underline underline-offset-4"
              href={operation.publicSourceUrl}
            >
              OpenAPI source
              <ExternalLinkIcon className="size-3.5" />
            </a>
          </dd>
        </div>
      </dl>
    </section>
  );
}

function methodColor(method: string) {
  switch (method.toLowerCase()) {
    case 'get':
      return 'bg-emerald-600';
    case 'post':
      return 'bg-blue-600';
    case 'put':
    case 'patch':
      return 'bg-amber-600';
    case 'delete':
      return 'bg-red-600';
    default:
      return 'bg-slate-600';
  }
}
```

- [ ] **Step 4: Replace placeholder with schema sections**

Extend the renderer to include:

- Path parameters.
- Query parameters.
- Header/auth parameters.
- Request body schema.
- Response status/body schemas.
- Example request blocks if present.

Use local components only. Do not import `fumadocs-ui/*`.

- [ ] **Step 5: Wire DocsContent**

Modify `DocsContent` to accept:

```ts
kind?: 'mdx' | 'openapi';
openapi?: OpenApiOperationView;
```

Render `DocsContentBodyClient` only for MDX pages. Render `OpenApiOperationContent` for OpenAPI pages.

- [ ] **Step 6: Run component tests**

Run:

```bash
bun run test src/components/openapi/OpenApiOperationContent.test.tsx src/components/docs-shell/DocsContent.test.tsx
```

Expected: PASS.

- [ ] **Step 7: Commit**

Run:

```bash
git add src/components/openapi src/components/docs-shell/DocsContent.tsx src/components/docs-shell/DocsContent.test.tsx
git commit -m "feat: render openapi operations in local docs shell"
```

Expected: no `fumadocs-ui` imports added.

## Task 6: Add OperationId Overrides

**Files:**
- Create: `src/lib/openapi/overrides.server.ts`
- Test: `src/lib/openapi/overrides.server.test.ts`
- Modify: `src/components/openapi/OpenApiOperationContent.tsx`

- [ ] **Step 1: Write override contract tests**

Create `src/lib/openapi/overrides.server.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { parseOpenApiOverrideFrontmatter } from './overrides.server';

describe('openapi overrides', () => {
  it('accepts operationId keyed placement frontmatter', () => {
    expect(
      parseOpenApiOverrideFrontmatter({
        operationId: 'start-agent',
        placement: 'after-description',
      }),
    ).toEqual({
      operationId: 'start-agent',
      placement: 'after-description',
    });
  });

  it('rejects arbitrary placement names', () => {
    expect(() =>
      parseOpenApiOverrideFrontmatter({
        operationId: 'start-agent',
        placement: 'middle-of-nowhere',
      }),
    ).toThrow(/placement/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
bun run test src/lib/openapi/overrides.server.test.ts
```

Expected: FAIL because module does not exist.

- [ ] **Step 3: Implement override parser**

Create `src/lib/openapi/overrides.server.ts`:

```ts
import { z } from 'zod';

export const openApiOverridePlacements = [
  'before-operation',
  'after-description',
  'after-request',
  'after-response',
] as const;

const overrideFrontmatterSchema = z.object({
  operationId: z.string().min(1),
  placement: z.enum(openApiOverridePlacements),
});

export type OpenApiOverrideFrontmatter = z.infer<
  typeof overrideFrontmatterSchema
>;

export function parseOpenApiOverrideFrontmatter(value: unknown) {
  return overrideFrontmatterSchema.parse(value);
}
```

- [ ] **Step 4: Document override file shape in code comments**

Add a short comment in `overrides.server.ts`:

```ts
// Override files live under content/openapi/<api>/overrides and are keyed by
// operationId. They are supplemental content, not generated endpoint shadows.
```

- [ ] **Step 5: Wire override rendering**

Load override MDX only when a matching `operationId` exists. Render it at one of the allowed placements. If this adds meaningful complexity, keep the implementation behind a clearly named helper and land support in a follow-up task before any override files are added.

- [ ] **Step 6: Run tests**

Run:

```bash
bun run test src/lib/openapi/overrides.server.test.ts src/components/openapi/OpenApiOperationContent.test.tsx
```

Expected: PASS.

- [ ] **Step 7: Commit**

Run:

```bash
git add src/lib/openapi/overrides.server.ts src/lib/openapi/overrides.server.test.ts src/components/openapi/OpenApiOperationContent.tsx
git commit -m "feat: support operation id openapi overrides"
```

Expected: override layer is keyed by `operationId` and does not create route-owned content.

## Task 7: Generate Raw Markdown And llms Text

**Files:**
- Create: `src/lib/openapi/markdown.ts`
- Test: `src/lib/openapi/markdown.test.ts`
- Modify: `src/lib/source.server.ts`
- Modify: `src/routes/llms[.]mdx.docs.$.ts`
- Modify: `src/routes/llms-full[.]txt.ts`

- [ ] **Step 1: Write Markdown serializer tests**

Create `src/lib/openapi/markdown.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { renderOpenApiOperationMarkdown } from './markdown';

describe('renderOpenApiOperationMarkdown', () => {
  it('includes source traceability for agents', () => {
    const markdown = renderOpenApiOperationMarkdown({
      description: 'Create and start an agent.',
      method: 'post',
      operationId: 'start-agent',
      path: '/v2/projects/{appid}/join',
      publicSourceUrl: '/openapi/conversational-ai/convoai.yaml',
      title: 'Start a conversational AI agent',
      url: '/en/api-reference/conversational-ai/rest-api/agent/join',
    });

    expect(markdown).toContain('# Start a conversational AI agent');
    expect(markdown).toContain('POST /v2/projects/{appid}/join');
    expect(markdown).toContain('Operation ID: start-agent');
    expect(markdown).toContain(
      'OpenAPI: /openapi/conversational-ai/convoai.yaml',
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
bun run test src/lib/openapi/markdown.test.ts
```

Expected: FAIL because module does not exist.

- [ ] **Step 3: Implement serializer**

Create `src/lib/openapi/markdown.ts`:

```ts
type OpenApiMarkdownOperation = {
  description?: string;
  method: string;
  operationId: string;
  path: string;
  publicSourceUrl: string;
  title: string;
  url: string;
};

export function renderOpenApiOperationMarkdown(
  operation: OpenApiMarkdownOperation,
) {
  const lines = [
    `# ${operation.title} (${operation.url})`,
    '',
    `${operation.method.toUpperCase()} ${operation.path}`,
    '',
  ];

  if (operation.description) {
    lines.push(operation.description.trim(), '');
  }

  lines.push(
    '## Source',
    '',
    `- OpenAPI: ${operation.publicSourceUrl}`,
    `- Operation ID: ${operation.operationId}`,
    `- Method: ${operation.method.toUpperCase()}`,
    `- Path: ${operation.path}`,
    '',
  );

  return lines.join('\n');
}
```

Extend later in the task to include parameters, request body, responses, and examples.

- [ ] **Step 4: Branch `getLLMText`**

Modify `src/lib/source.server.ts` so:

- MDX pages continue returning `page.data.getText('processed')`.
- OpenAPI pages return `renderOpenApiOperationMarkdown()`.

If OpenAPI pages are not directly represented in Fumadocs `source`, add a separate `getDocsRawMarkdownByPath()` helper used by the raw markdown route.

- [ ] **Step 5: Update per-page raw markdown route**

Modify `src/routes/llms[.]mdx.docs.$.ts` to resolve OpenAPI virtual paths such as:

```text
en/api-reference/conversational-ai/rest-api/agent/join.mdx
```

Expected response contains generated Markdown even though no physical `.mdx` file exists.

- [ ] **Step 6: Update `llms-full.txt`**

Ensure `/llms-full.txt` includes OpenAPI operation Markdown. `/llms.txt` should list canonical page links, not YAML fragments.

- [ ] **Step 7: Run tests**

Run:

```bash
bun run test src/lib/openapi/markdown.test.ts src/lib/docs-page.server.test.ts
```

Expected: PASS.

- [ ] **Step 8: Commit**

Run:

```bash
git add src/lib/openapi/markdown.ts src/lib/openapi/markdown.test.ts src/lib/source.server.ts 'src/routes/llms[.]mdx.docs.$.ts' 'src/routes/llms-full[.]txt.ts'
git commit -m "feat: expose openapi pages in llms exports"
```

Expected: raw markdown and full llms exports include OpenAPI source traceability.

## Task 8: Preserve Navigation And Legacy Compatibility

**Files:**
- Modify: `content/docs/en/api-reference/conversational-ai/rest-api/agent/meta.json`
- Modify: `content/docs/zh-CN/api-reference/meta.json` or add nested zh-CN structure if needed
- Modify: route redirect helpers if top-level legacy pages remain
- Test: `src/lib/docs-routing.test.ts`, `src/lib/docs-tree.test.ts`

- [ ] **Step 1: Use nested canonical routes**

Canonical endpoint URLs should be:

```text
/en/api-reference/conversational-ai/rest-api/agent/join
/en/api-reference/conversational-ai/rest-api/agent/leave
/en/api-reference/conversational-ai/rest-api/agent/update
/en/api-reference/conversational-ai/rest-api/agent/query
/en/api-reference/conversational-ai/rest-api/agent/list
/en/api-reference/conversational-ai/rest-api/agent/speak
/en/api-reference/conversational-ai/rest-api/agent/interrupt
/en/api-reference/conversational-ai/rest-api/agent/think
/en/api-reference/conversational-ai/rest-api/agent/history
/en/api-reference/conversational-ai/rest-api/agent/turns
```

- [ ] **Step 2: Keep old top-level routes compatible**

For existing placeholder routes such as `/en/api-reference/start-agent`, either:

- Replace content with a redirect-like MDX page pointing to the canonical nested page, or
- Add loader redirect logic for legacy `operationId` top-level pages.

Do not duplicate endpoint content in the old route.

- [ ] **Step 3: Align sidebar order**

Keep `agent/meta.json` order:

```json
{
  "title": "Agent management",
  "pages": [
    "index",
    "join",
    "leave",
    "update",
    "query",
    "list",
    "speak",
    "interrupt",
    "think",
    "history",
    "turns"
  ]
}
```

- [ ] **Step 4: Run routing/tree tests**

Run:

```bash
bun run test src/lib/docs-routing.test.ts src/lib/docs-tree.test.ts
```

Expected: PASS and canonical endpoint routes appear in page tree.

- [ ] **Step 5: Commit**

Run:

```bash
git add content/docs src/lib src/routes
git commit -m "feat: canonicalize conversational ai api routes"
```

Expected: old endpoint placeholders do not contain duplicated endpoint details.

## Task 9: Update The Migration Skill

**Files:**
- Modify: `.agents/skills/fumadocs-migration/SKILL.md`
- Modify: `.agents/skills/fumadocs-migration/references/standards.md`
- Modify: `.agents/skills/fumadocs-migration/references/legacy-casebook.md`
- Create: `.agents/skills/fumadocs-migration/references/openapi-lane.md`
- Test: skill validation command

- [ ] **Step 1: Add OpenAPI lane reference**

Create `.agents/skills/fumadocs-migration/references/openapi-lane.md` with:

```md
# OpenAPI Lane Standard

## Content Staging

- `content/docs/**` is the Fumadocs MDX/page-tree compiler domain.
- `content/openapi/**` is the structured OpenAPI source-data domain.
- Legacy generated HTML is deferred and should not be moved into either domain as rendered output.
- Never put OpenAPI YAML under `content/docs/**`; Fumadocs MDX scans YAML there as metadata.

## Source And Publication

- Maintain OpenAPI YAML/JSON only under `content/openapi/**`.
- Publish `/openapi/**` from `content/openapi/**` with an automated build copy.
- Do not hand-maintain `public/openapi/**` as source.

## Endpoint Pages

- Endpoint docs are generated from OpenAPI by `operationId`.
- Do not generate full MDX shadow files for each endpoint.
- Optional human overrides live beside the OpenAPI source and are keyed by `operationId`.
- Supported override placements are `before-operation`, `after-description`, `after-request`, and `after-response`.

## Rendering

- Do not migrate legacy `RestfulRender` or `OpenapiRender`.
- Do not use `fumadocs-ui` as the OpenAPI page renderer in this portal.
- Use local docs-shell components for endpoint rendering.

## AI-Readable Exports

- `/llms.txt` links canonical docs pages.
- `/llms-full.txt` and per-page raw markdown include OpenAPI source URL, operationId, method, and path.
```

- [ ] **Step 2: Link the reference from `SKILL.md`**

Add to the References list:

```md
- `references/openapi-lane.md`: OpenAPI staging, endpoint generation, override, publication, and llms rules.
```

- [ ] **Step 3: Update standards**

In `references/standards.md`, replace the current OpenAPI section with the content-staging and OpenAPI lane rules from the new reference.

- [ ] **Step 4: Update legacy casebook**

In `references/legacy-casebook.md`, update `RESTful And OpenAPI` to say:

- Legacy `RestfulRender`/`OpenapiRender` are inputs only.
- OpenAPI YAML goes to `content/openapi/**`.
- Endpoint pages are generated by `operationId`.
- Generated full MDX endpoint shadows are forbidden.
- SDK/generated HTML API references remain deferred unless separately scoped.

- [ ] **Step 5: Validate skill**

Run:

```bash
python3 /Users/czhen/.codex/skills/.system/skill-creator/scripts/quick_validate.py .agents/skills/fumadocs-migration
rg -n "content/openapi|operationId|llms-full|fumadocs-ui|OpenAPI lane" .agents/skills/fumadocs-migration
```

Expected: validation passes and the grep finds all key rules.

- [ ] **Step 6: Commit**

Run:

```bash
git add .agents/skills/fumadocs-migration docs/superpowers/plans/2026-05-22-convoai-openapi-rendering.md
git commit -m "docs: define conversational ai openapi migration lane"
```

Expected: skill references and plan are versioned together.

## Task 10: End-To-End Verification

**Files:**
- No planned source edits unless verification reveals defects.

- [ ] **Step 1: Run type check**

Run:

```bash
bun run types:check
```

Expected: PASS.

- [ ] **Step 2: Run focused tests**

Run:

```bash
bun run test src/lib/openapi/source.server.test.ts src/lib/openapi/page-source.server.test.ts src/lib/openapi/markdown.test.ts src/lib/openapi/overrides.server.test.ts src/components/openapi/OpenApiOperationContent.test.tsx src/lib/docs-page.server.test.ts
```

Expected: PASS.

- [ ] **Step 3: Build**

Run:

```bash
bun run build
```

Expected: PASS.

- [ ] **Step 4: Inspect build artifacts**

Run:

```bash
test -f .vercel/output/static/openapi/conversational-ai/convoai.yaml
test -f .vercel/output/static/en/api-reference/conversational-ai/rest-api/agent/join/index.html
rg -n "openapi: 3.1.0" .vercel/output/static/openapi/conversational-ai/convoai.yaml
```

Expected: all files exist and YAML contains `openapi: 3.1.0`.

- [ ] **Step 5: Preview and curl**

Start preview:

```bash
bun run preview --host 127.0.0.1 --port 4173
```

In another shell:

```bash
curl -s http://127.0.0.1:4173/openapi/conversational-ai/convoai.yaml | head -n 1
curl -s http://127.0.0.1:4173/llms.txt | rg "api-reference/conversational-ai/rest-api/agent/join"
curl -s http://127.0.0.1:4173/llms-full.txt | rg "Operation ID: start-agent"
curl -s http://127.0.0.1:4173/llms.mdx/docs/en/api-reference/conversational-ai/rest-api/agent/join.mdx | rg "OpenAPI: /openapi/conversational-ai/convoai.yaml"
```

Expected:

- YAML curl prints `openapi: 3.1.0`.
- `llms.txt` links the canonical endpoint page.
- `llms-full.txt` includes `Operation ID: start-agent`.
- Raw markdown includes the OpenAPI source URL.

- [ ] **Step 6: Browser verification**

Open:

```text
http://127.0.0.1:4173/en/api-reference/conversational-ai/rest-api/agent/join
```

Expected:

- Page renders in the current docs shell.
- Method/path are visible.
- Request/response sections are visible.
- OpenAPI source link points to `/openapi/conversational-ai/convoai.yaml`.
- No obvious layout overflow in desktop and mobile widths.

- [ ] **Step 7: Check for forbidden imports**

Run:

```bash
rg -n "fumadocs-ui" src package.json
```

Expected: no new OpenAPI renderer imports from `fumadocs-ui`.

- [ ] **Step 8: Final commit**

Run:

```bash
git status --short
git add .
git commit -m "feat: render conversational ai openapi docs"
```

Expected: commit only after all verification steps pass.

## Deferred Work

- Server SDK and Client Toolkit reference rendering.
- `.docusaurus-ag/api-reference/convoai/{go,java,ios,android,typescript}` generated references.
- Other product OpenAPI YAML sources under `html-docs`.
- Legacy generated HTML API migration.
- Full pure-static generation of every `/llms.mdx/docs/**` Markdown file. The current contract is route-generated raw markdown under Nitro/Vercel.

## Risks

- `fumadocs-openapi` version compatibility may force choosing an older compatible release or using only its parser utilities.
- If OpenAPI virtual pages cannot be represented in synchronous Fumadocs `source`, keep them in a repo-owned page registry and integrate at docs payload/search/llms boundaries.
- The legacy YAML is Chinese-first. Locale-specific English endpoint copy may need future translation overrides, but this plan does not introduce generated MDX shadows to solve that.
