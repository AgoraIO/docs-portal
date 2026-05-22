# Conversational AI OpenAPI Rendering Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render Conversational AI REST endpoint reference pages from `convoai.yaml` with static docs pages, searchable endpoint content, public YAML output, and AI-readable markdown exports.

**Architecture:** Keep `content/docs/**` as the Fumadocs MDX-authored page domain and `content/openapi/**` as the portable OpenAPI source-data domain. Use an OpenAPI endpoint registry overlay, not a Fumadocs source fork, to derive endpoint routes, sidebar entries, locale links, search documents, llms entries, and prerender paths from `operationId -> routeLeaf`. The first renderer is a static API reference backed only by `convoai.yaml`; it does not implement Try It/API explorer behavior or MDX overrides.

**Tech Stack:** TanStack Start, Vite/Nitro Vercel output, Fumadocs Core/MDX latest gate, `fumadocs-openapi` latest parser/source utilities, local React/Tailwind docs-shell components, Node.js build scripts, Vitest, Biome.

---

## Confirmed Scope

- Source YAML: `/Users/czhen/Documents/GitHub/AgoraIO/shengwang-doc-source/html-docs/convoai/RESTful/convoai.yaml`.
- Staged YAML: `content/openapi/conversational-ai/convoai.yaml`.
- Public YAML URL: `/openapi/conversational-ai/convoai.yaml`.
- Public YAML is generated during build and must not be committed under `public/openapi/**`.
- Endpoint canonical route shape: `/{locale}/api-reference/conversational-ai/rest-api/agent/{routeLeaf}`.
- Supported locales: `en`, `zh-CN`.
- Single locale-neutral YAML for first version. English pages may render YAML prose as-is; do not backfill old English endpoint MDX as schema translation.
- Route leafs are manually mapped once from `operationId` and tested against YAML coverage.
- Endpoint leaves are generated pages, not MDX-authored pages. Do not create full `join.md`, `leave.md`, or other endpoint shadow files.
- Existing new-portal placeholder endpoint routes are not compatibility requirements. Remove placeholder endpoint content rather than redirecting it.
- First renderer is read-only static API reference: method, path, server/source, auth, parameters, request body, responses, schemas, and examples.
- First renderer does not implement `overrides/*.mdx`.
- OpenAPI endpoint pages must be prerendered, searchable, included in `/llms.txt`, included in `/llms-full.txt`, and available through per-page raw markdown routes.
- Do not import `fumadocs-ui` or `fumadocs-openapi/ui` in OpenAPI page rendering.

## File Structure

- Modify `package.json`, lockfile: upgrade to current Fumadocs packages and add `fumadocs-openapi`.
- Modify `vite.config.ts`: run OpenAPI prerender paths derived from registry.
- Modify `.gitignore`: ignore generated `public/openapi/`.
- Create `content/openapi/conversational-ai/convoai.yaml`: staged source copied from legacy repo.
- Create `content/openapi/conversational-ai/openapi.meta.json`: API id, source, public URL, route prefix, locales.
- Create `content/openapi/conversational-ai/overrides/.gitkeep`: future extension placeholder only.
- Create `scripts/sync-openapi-assets.mjs`: copy YAML/JSON from `content/openapi/**` to `public/openapi/**`.
- Create `src/lib/openapi/conversational-ai.ts`: route registry, operation metadata, canonical URL helpers, prerender paths.
- Create `src/lib/openapi/source.server.ts`: load and normalize OpenAPI operations.
- Create `src/lib/openapi/schema-tree.ts`: turn OpenAPI schemas into guarded recursive field-tree data.
- Create `src/lib/openapi/markdown.ts`: serialize endpoint pages to raw Markdown and llms text.
- Create `src/lib/openapi/search.ts`: create OpenAPI search documents.
- Create `src/lib/openapi/docs-page.server.ts`: adapt registry operations into docs page payload fragments.
- Create `src/components/openapi/OpenApiOperationContent.tsx`: local static renderer.
- Create tests beside each OpenAPI module and renderer.
- Modify `src/lib/docs-page.server.ts`: resolve MDX-authored pages first, then OpenAPI endpoint overlay.
- Modify `src/components/docs-shell/DocsContent.tsx`: render MDX body or OpenAPI body by payload kind.
- Modify route components under `src/routes/$locale/$tab/`: pass OpenAPI payload to `DocsContent`.
- Modify `src/routes/llms[.]txt.ts`, `src/routes/llms-full[.]txt.ts`, `src/routes/llms[.]mdx.docs.$.ts`: include OpenAPI endpoint outputs.
- Modify `src/routes/api/search.ts`: include OpenAPI endpoint documents.
- Modify `content/docs/en/api-reference/conversational-ai/rest-api/agent/meta.json`: keep endpoint leaf order but let overlay supply leaf pages.
- Create `content/docs/zh-CN/api-reference/conversational-ai/**`: bilingual IA skeleton container pages and meta files.
- Delete current top-level placeholder endpoint files from `content/docs/en/api-reference/*.md` and `content/docs/zh-CN/api-reference/*.md` when they are generated endpoint placeholders.
- Modify `.agents/skills/fumadocs-migration/references/openapi-lane.md`: keep implementation result aligned with this plan.

## Task 0: Fumadocs Version Gate

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `bun.lock`
- Test: existing test suite

- [ ] **Step 1: Upgrade Fumadocs packages and install OpenAPI package**

Run:

```bash
bun add fumadocs-core@16.9.0 fumadocs-mdx@15.0.7 fumadocs-openapi@10.9.0
```

Expected: `package.json` lists `fumadocs-core@16.9.0`, `fumadocs-mdx@15.0.7`, and `fumadocs-openapi@10.9.0`.

- [ ] **Step 2: Run type generation and typecheck**

Run:

```bash
bun run types:check
```

Expected: PASS. If Fumadocs MDX output or types fail, fix this upgrade before touching OpenAPI rendering.

- [ ] **Step 3: Run existing tests**

Run:

```bash
bun run test
```

Expected: PASS.

- [ ] **Step 4: Run production build**

Run:

```bash
bun run build
```

Expected: PASS.

- [ ] **Step 5: Commit version gate**

Run:

```bash
git add package.json package-lock.json bun.lock
git commit -m "chore: upgrade fumadocs packages"
```

Expected: commit contains only dependency and lockfile changes required by the Fumadocs version gate.

## Task 1: Stage Conversational AI OpenAPI Source

**Files:**
- Create: `content/openapi/conversational-ai/convoai.yaml`
- Create: `content/openapi/conversational-ai/openapi.meta.json`
- Create: `content/openapi/conversational-ai/overrides/.gitkeep`
- Modify: `.gitignore`
- Test: none

- [ ] **Step 1: Copy the legacy YAML**

Run:

```bash
mkdir -p content/openapi/conversational-ai/overrides
cp /Users/czhen/Documents/GitHub/AgoraIO/shengwang-doc-source/html-docs/convoai/RESTful/convoai.yaml content/openapi/conversational-ai/convoai.yaml
touch content/openapi/conversational-ai/overrides/.gitkeep
```

Expected: `content/openapi/conversational-ai/convoai.yaml` starts with `openapi: 3.1.0` or the same BOM-prefixed OpenAPI header as the legacy source.

- [ ] **Step 2: Add source metadata**

Create `content/openapi/conversational-ai/openapi.meta.json`:

```json
{
  "id": "conversational-ai",
  "title": "Conversational AI REST API",
  "source": "convoai.yaml",
  "publicPath": "/openapi/conversational-ai/convoai.yaml",
  "routePrefix": "api-reference/conversational-ai/rest-api/agent",
  "locales": ["en", "zh-CN"]
}
```

Expected: no `overrideDir` behavior is implemented in this version. The empty `overrides/` directory is only a future extension placeholder.

- [ ] **Step 3: Ignore generated public OpenAPI assets**

Append to `.gitignore` if absent:

```gitignore
/public/openapi/
```

Expected: `public/openapi/**` cannot become a committed second source.

- [ ] **Step 4: Verify operation IDs**

Run:

```bash
rg -n "operationId:" content/openapi/conversational-ai/convoai.yaml
```

Expected: exactly these 10 operation IDs are present: `start-agent`, `stop-agent`, `agent-update`, `query-agent-status`, `get-agent-list`, `agent-speak`, `agent-interrupt`, `agent-think`, `get-history`, `get-turns`.

- [ ] **Step 5: Commit source staging**

Run:

```bash
git add .gitignore content/openapi/conversational-ai
git commit -m "feat: stage conversational ai openapi source"
```

Expected: commit includes staged OpenAPI source, metadata, `.gitkeep`, and `.gitignore`.

## Task 2: Publish OpenAPI Assets During Build

**Files:**
- Create: `scripts/sync-openapi-assets.mjs`
- Modify: `package.json`
- Test: manual script check

- [ ] **Step 1: Create asset sync script**

Create `scripts/sync-openapi-assets.mjs`:

```js
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const sourceRoot = path.join(repoRoot, 'content', 'openapi');
const publicRoot = path.join(repoRoot, 'public', 'openapi');

const copied = [];

if (!fs.existsSync(sourceRoot)) {
  process.exit(0);
}

fs.rmSync(publicRoot, { force: true, recursive: true });
copyOpenApiAssets(sourceRoot, publicRoot);

for (const file of copied) {
  console.log(`copied ${file}`);
}

function copyOpenApiAssets(fromDir, toDir) {
  for (const entry of fs.readdirSync(fromDir, { withFileTypes: true })) {
    const fromPath = path.join(fromDir, entry.name);
    const toPath = path.join(toDir, entry.name);

    if (entry.isDirectory()) {
      copyOpenApiAssets(fromPath, toPath);
      continue;
    }

    if (!/\.(ya?ml|json)$/i.test(entry.name)) {
      continue;
    }

    fs.mkdirSync(path.dirname(toPath), { recursive: true });
    fs.copyFileSync(fromPath, toPath);
    copied.push(path.relative(repoRoot, toPath));
  }
}
```

- [ ] **Step 2: Add npm scripts**

Modify `package.json` scripts:

```json
{
  "openapi:sync": "node scripts/sync-openapi-assets.mjs",
  "build": "bun run openapi:sync && vite build"
}
```

Preserve all existing scripts.

- [ ] **Step 3: Run sync script**

Run:

```bash
bun run openapi:sync
test -f public/openapi/conversational-ai/convoai.yaml
git status --short public/openapi
```

Expected: copied file exists locally, and `git status` does not show it because `/public/openapi/` is ignored.

- [ ] **Step 4: Commit asset publication script**

Run:

```bash
git add package.json scripts/sync-openapi-assets.mjs
git commit -m "feat: publish openapi assets during build"
```

Expected: commit does not include `public/openapi/**`.

## Task 3: Build The Endpoint Route Registry

**Files:**
- Create: `src/lib/openapi/conversational-ai.ts`
- Create: `src/lib/openapi/conversational-ai.test.ts`
- Test: `src/lib/openapi/conversational-ai.test.ts`

- [ ] **Step 1: Write registry tests**

Create `src/lib/openapi/conversational-ai.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  CONVERSATIONAL_AI_OPERATION_ROUTES,
  getConversationalAiEndpointUrl,
  getConversationalAiPrerenderPaths,
} from './conversational-ai';

describe('conversational ai endpoint registry', () => {
  it('maps operation IDs to route leaves once', () => {
    expect(CONVERSATIONAL_AI_OPERATION_ROUTES).toEqual({
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
    });
  });

  it('builds canonical endpoint URLs', () => {
    expect(getConversationalAiEndpointUrl('en', 'start-agent')).toBe(
      '/en/api-reference/conversational-ai/rest-api/agent/join',
    );
    expect(getConversationalAiEndpointUrl('zh-CN', 'start-agent')).toBe(
      '/zh-CN/api-reference/conversational-ai/rest-api/agent/join',
    );
  });

  it('derives prerender paths from the registry', () => {
    expect(getConversationalAiPrerenderPaths()).toContain(
      '/en/api-reference/conversational-ai/rest-api/agent/join',
    );
    expect(getConversationalAiPrerenderPaths()).toHaveLength(20);
  });
});
```

- [ ] **Step 2: Run tests and verify failure**

Run:

```bash
bun run test src/lib/openapi/conversational-ai.test.ts
```

Expected: FAIL because module does not exist.

- [ ] **Step 3: Implement registry**

Create `src/lib/openapi/conversational-ai.ts`:

```ts
import type { AppLocale } from '@/lib/i18n/i18n-config';

export const CONVERSATIONAL_AI_OPENAPI_SOURCE_PATH =
  'content/openapi/conversational-ai/convoai.yaml';

export const CONVERSATIONAL_AI_PUBLIC_OPENAPI_URL =
  '/openapi/conversational-ai/convoai.yaml';

export const CONVERSATIONAL_AI_ROUTE_PREFIX =
  'api-reference/conversational-ai/rest-api/agent';

export const CONVERSATIONAL_AI_OPERATION_ROUTES = {
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

export const CONVERSATIONAL_AI_OPERATION_TITLES = {
  en: {
    'start-agent': 'Start a conversational AI agent',
    'stop-agent': 'Stop a conversational AI agent',
    'agent-update': 'Update agent configuration',
    'query-agent-status': 'Query agent status',
    'get-agent-list': 'Retrieve a list of agents',
    'agent-speak': 'Broadcast a message using TTS',
    'agent-interrupt': 'Interrupt the agent',
    'agent-think': 'Send a custom instruction',
    'get-history': 'Retrieve agent history',
    'get-turns': 'Query conversation turn information',
  },
  'zh-CN': {
    'start-agent': '创建对话式智能体',
    'stop-agent': '停止对话式智能体',
    'agent-update': '更新智能体配置',
    'query-agent-status': '查询智能体状态',
    'get-agent-list': '获取智能体列表',
    'agent-speak': '播报自定义消息',
    'agent-interrupt': '打断智能体',
    'agent-think': '发送自定义指令',
    'get-history': '获取智能体短期记忆',
    'get-turns': '查询对话轮次信息',
  },
} as const;

export type ConversationalAiOperationId =
  keyof typeof CONVERSATIONAL_AI_OPERATION_ROUTES;

export function getConversationalAiEndpointUrl(
  locale: AppLocale,
  operationId: ConversationalAiOperationId,
) {
  return `/${locale}/${CONVERSATIONAL_AI_ROUTE_PREFIX}/${
    CONVERSATIONAL_AI_OPERATION_ROUTES[operationId]
  }`;
}

export function getConversationalAiPrerenderPaths() {
  return (['en', 'zh-CN'] as const).flatMap((locale) =>
    Object.keys(CONVERSATIONAL_AI_OPERATION_ROUTES).map((operationId) =>
      getConversationalAiEndpointUrl(
        locale,
        operationId as ConversationalAiOperationId,
      ),
    ),
  );
}
```

- [ ] **Step 4: Run tests**

Run:

```bash
bun run test src/lib/openapi/conversational-ai.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit registry**

Run:

```bash
git add src/lib/openapi/conversational-ai.ts src/lib/openapi/conversational-ai.test.ts
git commit -m "feat: add conversational ai endpoint registry"
```

## Task 4: Load And Normalize OpenAPI Operations

**Files:**
- Create: `src/lib/openapi/source.server.ts`
- Create: `src/lib/openapi/source.server.test.ts`
- Test: `src/lib/openapi/source.server.test.ts`

- [ ] **Step 1: Write loader tests**

Create `src/lib/openapi/source.server.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  getConversationalAiOperation,
  getConversationalAiOperations,
} from './source.server';

describe('openapi source loader', () => {
  it('loads conversational ai operations by operationId', async () => {
    const operations = await getConversationalAiOperations();

    expect(operations.map((operation) => operation.operationId)).toContain(
      'start-agent',
    );
    expect(operations).toHaveLength(10);
  });

  it('normalizes method, path, and request body', async () => {
    const operation = await getConversationalAiOperation('start-agent');

    expect(operation.method).toBe('POST');
    expect(operation.path).toBe('/v2/projects/{appid}/join');
    expect(operation.requestBody?.contentTypes).toContain('application/json');
  });
});
```

- [ ] **Step 2: Run tests and verify failure**

Run:

```bash
bun run test src/lib/openapi/source.server.test.ts
```

Expected: FAIL because loader does not exist.

- [ ] **Step 3: Implement loader**

Implement `src/lib/openapi/source.server.ts` using `fumadocs-openapi` server/parser utilities where they fit. If the package API is not suitable for this local static renderer, use its lower-level schema utilities plus a YAML parser, but keep the exported contract below:

```ts
export type NormalizedOpenApiOperation = {
  description?: string;
  method: string;
  operationId: string;
  parameters: unknown[];
  path: string;
  requestBody?: {
    contentTypes: string[];
    content: Record<string, unknown>;
  };
  responses: Record<string, unknown>;
  security?: unknown;
  servers: { description?: string; url: string }[];
  summary?: string;
};

export async function getConversationalAiOperations(): Promise<
  NormalizedOpenApiOperation[]
>;

export async function getConversationalAiOperation(
  operationId: string,
): Promise<NormalizedOpenApiOperation>;
```

Implementation requirements:
- Read `content/openapi/conversational-ai/convoai.yaml`.
- Resolve `$ref` enough for rendering parameters and schema trees.
- Cache parsed document in module scope.
- Throw a descriptive error for unknown operation IDs.

- [ ] **Step 4: Add operation coverage test**

Extend `source.server.test.ts`:

```ts
import { CONVERSATIONAL_AI_OPERATION_ROUTES } from './conversational-ai';

it('keeps registry operation IDs in sync with YAML', async () => {
  const operations = await getConversationalAiOperations();
  const fromYaml = operations.map((operation) => operation.operationId).sort();
  const fromRegistry = Object.keys(CONVERSATIONAL_AI_OPERATION_ROUTES).sort();

  expect(fromRegistry).toEqual(fromYaml);
});
```

- [ ] **Step 5: Run tests**

Run:

```bash
bun run test src/lib/openapi/source.server.test.ts src/lib/openapi/conversational-ai.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit loader**

Run:

```bash
git add src/lib/openapi/source.server.ts src/lib/openapi/source.server.test.ts
git commit -m "feat: load conversational ai openapi operations"
```

## Task 5: Build Recursive Schema Tree Data

**Files:**
- Create: `src/lib/openapi/schema-tree.ts`
- Create: `src/lib/openapi/schema-tree.test.ts`
- Test: `src/lib/openapi/schema-tree.test.ts`

- [ ] **Step 1: Write schema tree tests**

Create `src/lib/openapi/schema-tree.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { getConversationalAiOperation } from './source.server';
import { buildOpenApiSchemaTree } from './schema-tree';

describe('openapi schema tree', () => {
  it('renders nested object and array fields', async () => {
    const operation = await getConversationalAiOperation('start-agent');
    const schema =
      operation.requestBody?.content['application/json']?.schema;

    const tree = buildOpenApiSchemaTree(schema);
    const paths = flattenPaths(tree);

    expect(paths).toContain('properties');
    expect(paths.some((path) => path.includes('llm'))).toBe(true);
    expect(paths.some((path) => path.includes('system_messages'))).toBe(true);
  });

  it('guards recursion depth and cycles', () => {
    const schema: Record<string, unknown> = { type: 'object' };
    schema.properties = { self: schema };

    expect(() => buildOpenApiSchemaTree(schema)).not.toThrow();
  });
});

function flattenPaths(nodes: { children?: unknown[]; path: string }[]): string[] {
  return nodes.flatMap((node) => [
    node.path,
    ...flattenPaths((node.children ?? []) as { children?: unknown[]; path: string }[]),
  ]);
}
```

Expected: adjust the exact deep field assertion after inspecting normalized schema output, but keep the intent: a nested `start-agent` field beyond the first level must be present.

- [ ] **Step 2: Run tests and verify failure**

Run:

```bash
bun run test src/lib/openapi/schema-tree.test.ts
```

Expected: FAIL because schema tree module does not exist.

- [ ] **Step 3: Implement schema tree builder**

Create `src/lib/openapi/schema-tree.ts`:

```ts
export type OpenApiSchemaTreeNode = {
  children: OpenApiSchemaTreeNode[];
  defaultValue?: unknown;
  deprecated?: boolean;
  description?: string;
  enumValues?: unknown[];
  name: string;
  path: string;
  required: boolean;
  type: string;
};
```

Implementation requirements:
- Support `object.properties`, `array.items`, `required`, `enum`, `default`, `oneOf`, `anyOf`, `allOf`.
- Include a cycle guard using `WeakSet<object>`.
- Include a max traversal depth fallback of at least 12 to avoid runaway rendering.
- Mark default expanded depth in renderer, not in this data builder.

- [ ] **Step 4: Run tests**

Run:

```bash
bun run test src/lib/openapi/schema-tree.test.ts src/lib/openapi/source.server.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit schema tree**

Run:

```bash
git add src/lib/openapi/schema-tree.ts src/lib/openapi/schema-tree.test.ts
git commit -m "feat: build openapi schema trees"
```

## Task 6: Render Static OpenAPI Endpoint Pages

**Files:**
- Create: `src/components/openapi/OpenApiOperationContent.tsx`
- Create: `src/components/openapi/OpenApiOperationContent.test.tsx`
- Modify: `src/components/docs-shell/DocsContent.tsx`
- Modify: `src/routes/$locale/$tab/$.tsx`
- Modify: `src/routes/$locale/$tab/index.tsx`
- Test: renderer tests and existing docs content tests

- [ ] **Step 1: Write renderer tests**

Create `src/components/openapi/OpenApiOperationContent.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AppProviders } from '@/components/providers/AppProviders';
import { OpenApiOperationContent } from './OpenApiOperationContent';

describe('OpenApiOperationContent', () => {
  it('renders method, path, source link, and schema tree fields', () => {
    render(
      <AppProviders>
        <OpenApiOperationContent
          operation={{
            description: '创建一个对话式智能体实例。',
            method: 'POST',
            operationId: 'start-agent',
            path: '/v2/projects/{appid}/join',
            requestBody: {
              contentTypes: ['application/json'],
              content: {},
            },
            responses: {},
            parameters: [],
            servers: [{ url: 'https://api.agora.io/cn/api/conversational-ai-agent' }],
            summary: '创建对话式智能体',
          }}
          publicSourceUrl="/openapi/conversational-ai/convoai.yaml"
          requestSchemaTree={[
            {
              children: [],
              name: 'name',
              path: 'name',
              required: true,
              type: 'string',
            },
          ]}
          responseSchemaTrees={{}}
        />
      </AppProviders>,
    );

    expect(screen.getByText('POST')).toBeInTheDocument();
    expect(screen.getByText('/v2/projects/{appid}/join')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /OpenAPI source/i }),
    ).toHaveAttribute('href', '/openapi/conversational-ai/convoai.yaml');
    expect(screen.getByText('name')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests and verify failure**

Run:

```bash
bun run test src/components/openapi/OpenApiOperationContent.test.tsx
```

Expected: FAIL because component does not exist.

- [ ] **Step 3: Implement renderer**

Implement `OpenApiOperationContent` as local React/Tailwind components.

Requirements:
- No `fumadocs-ui` or `fumadocs-openapi/ui` imports.
- No Try It controls, credential inputs, or live request execution.
- Render method/path, source URL, operationId, servers, auth/security hints, parameters, request body, response statuses, examples, and schema tree.
- Use stable responsive layout. Avoid wide tables for nested schema fields.
- Default schema tree expansion depth: first 2 levels expanded; deeper levels collapsible.

- [ ] **Step 4: Modify docs content rendering contract**

Update `DocsContent` props to accept a discriminated content payload:

```ts
type DocsContentBody =
  | { kind: 'mdx'; contentPath: string }
  | { kind: 'openapi'; operationPayload: OpenApiOperationPayload };
```

Keep MDX rendering behavior unchanged for existing pages.

- [ ] **Step 5: Update route components**

Modify `src/routes/$locale/$tab/$.tsx` and `src/routes/$locale/$tab/index.tsx` to pass the new body payload to `DocsContent`.

- [ ] **Step 6: Run renderer and docs content tests**

Run:

```bash
bun run test src/components/openapi/OpenApiOperationContent.test.tsx src/components/docs-shell/DocsContent.test.tsx
```

Expected: PASS.

- [ ] **Step 7: Commit renderer shell**

Run:

```bash
git add src/components/openapi src/components/docs-shell/DocsContent.tsx 'src/routes/$locale/$tab/$.tsx' 'src/routes/$locale/$tab/index.tsx'
git commit -m "feat: render static openapi endpoint content"
```

## Task 7: Resolve OpenAPI Overlay Pages In Docs Payloads

**Files:**
- Create: `src/lib/openapi/docs-page.server.ts`
- Create: `src/lib/openapi/docs-page.server.test.ts`
- Modify: `src/lib/docs-page.server.ts`
- Test: `src/lib/docs-page.server.test.ts`, `src/lib/openapi/docs-page.server.test.ts`

- [ ] **Step 1: Write overlay payload tests**

Create `src/lib/openapi/docs-page.server.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { loadOpenApiEndpointPage } from './docs-page.server';

describe('openapi docs page payload', () => {
  it('loads canonical endpoint route payloads', async () => {
    const page = await loadOpenApiEndpointPage(
      'en',
      'api-reference',
      ['conversational-ai', 'rest-api', 'agent', 'join'],
    );

    expect(page).toMatchObject({
      activePath: '/en/api-reference/conversational-ai/rest-api/agent/join',
      activeTab: 'api-reference',
      body: {
        kind: 'openapi',
      },
      markdownUrl:
        '/llms.mdx/docs/en/api-reference/conversational-ai/rest-api/agent/join.md',
      title: 'Start a conversational AI agent',
    });
  });
});
```

- [ ] **Step 2: Run tests and verify failure**

Run:

```bash
bun run test src/lib/openapi/docs-page.server.test.ts
```

Expected: FAIL because module does not exist.

- [ ] **Step 3: Implement overlay page adapter**

Implement `loadOpenApiEndpointPage(locale, tab, slugSegments)`:
- Return `null` unless route matches `api-reference/conversational-ai/rest-api/agent/{routeLeaf}`.
- Map `routeLeaf` back to `operationId`.
- Load normalized operation.
- Build request/response schema trees.
- Build breadcrumbs, title, description, markdown URL, locale links, navigation, and TOC.
- Build `pages` and sidebar additions from endpoint registry.

- [ ] **Step 4: Integrate with `loadDocsPagePayload`**

Modify `src/lib/docs-page.server.ts`:
- Try existing MDX `source.getPage(...)` first.
- If no MDX page exists, call `loadOpenApiEndpointPage(...)`.
- Keep fallback-to-first-child behavior for MDX folders.

- [ ] **Step 5: Add docs payload regression test**

Extend `src/lib/docs-page.server.test.ts` to mock the OpenAPI adapter and assert `loadDocsPagePayload()` returns overlay payload when Fumadocs `source.getPage()` returns `undefined`.

- [ ] **Step 6: Run tests**

Run:

```bash
bun run test src/lib/openapi/docs-page.server.test.ts src/lib/docs-page.server.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit overlay payload integration**

Run:

```bash
git add src/lib/openapi/docs-page.server.ts src/lib/openapi/docs-page.server.test.ts src/lib/docs-page.server.ts src/lib/docs-page.server.test.ts
git commit -m "feat: resolve openapi endpoint pages"
```

## Task 8: Rebuild Bilingual API Reference IA

**Files:**
- Modify: `content/docs/en/api-reference/conversational-ai/rest-api/agent/meta.json`
- Delete: `content/docs/en/api-reference/conversational-ai/rest-api/agent/{join,leave,update,query,list,speak,interrupt,think,history,turns}.md*`
- Delete: `content/docs/en/api-reference/{start-agent,stop-agent,agent-update,query-agent-status,get-agent-list,agent-speak,agent-interrupt,agent-think,get-history,get-turns}.md`
- Create: `content/docs/zh-CN/api-reference/conversational-ai/index.md`
- Create: `content/docs/zh-CN/api-reference/conversational-ai/meta.json`
- Create: `content/docs/zh-CN/api-reference/conversational-ai/rest-api/index.md`
- Create: `content/docs/zh-CN/api-reference/conversational-ai/rest-api/meta.json`
- Create: `content/docs/zh-CN/api-reference/conversational-ai/rest-api/agent/index.md`
- Create: `content/docs/zh-CN/api-reference/conversational-ai/rest-api/agent/meta.json`
- Modify: `content/docs/zh-CN/api-reference/meta.json`
- Delete: `content/docs/zh-CN/api-reference/{start-agent,stop-agent,agent-update,query-agent-status,get-agent-list,agent-speak,agent-interrupt,agent-think,get-history,get-turns}.md`
- Test: docs route and build tests

- [ ] **Step 1: Remove endpoint shadow files**

Run:

```bash
rm content/docs/en/api-reference/conversational-ai/rest-api/agent/join.md \
  content/docs/en/api-reference/conversational-ai/rest-api/agent/leave.md \
  content/docs/en/api-reference/conversational-ai/rest-api/agent/update.md \
  content/docs/en/api-reference/conversational-ai/rest-api/agent/query.md \
  content/docs/en/api-reference/conversational-ai/rest-api/agent/list.md \
  content/docs/en/api-reference/conversational-ai/rest-api/agent/speak.md \
  content/docs/en/api-reference/conversational-ai/rest-api/agent/interrupt.md \
  content/docs/en/api-reference/conversational-ai/rest-api/agent/think.mdx \
  content/docs/en/api-reference/conversational-ai/rest-api/agent/history.md \
  content/docs/en/api-reference/conversational-ai/rest-api/agent/turns.md \
  content/docs/en/api-reference/start-agent.md \
  content/docs/en/api-reference/stop-agent.md \
  content/docs/en/api-reference/agent-update.md \
  content/docs/en/api-reference/query-agent-status.md \
  content/docs/en/api-reference/get-agent-list.md \
  content/docs/en/api-reference/agent-speak.md \
  content/docs/en/api-reference/agent-interrupt.md \
  content/docs/en/api-reference/agent-think.md \
  content/docs/en/api-reference/get-history.md \
  content/docs/en/api-reference/get-turns.md \
  content/docs/zh-CN/api-reference/start-agent.md \
  content/docs/zh-CN/api-reference/stop-agent.md \
  content/docs/zh-CN/api-reference/agent-update.md \
  content/docs/zh-CN/api-reference/query-agent-status.md \
  content/docs/zh-CN/api-reference/get-agent-list.md \
  content/docs/zh-CN/api-reference/agent-speak.md \
  content/docs/zh-CN/api-reference/agent-interrupt.md \
  content/docs/zh-CN/api-reference/agent-think.md \
  content/docs/zh-CN/api-reference/get-history.md \
  content/docs/zh-CN/api-reference/get-turns.md
```

Expected: endpoint leaves still resolve through OpenAPI overlay, not MDX files.

- [ ] **Step 2: Create Chinese IA skeleton**

Create the Chinese `conversational-ai` REST container pages and meta files matching the English tree. Container pages can be concise prose; endpoint leaves are listed in `agent/meta.json` but no endpoint leaf files are created.

Use `content/docs/zh-CN/api-reference/conversational-ai/rest-api/agent/meta.json`:

```json
{
  "title": "智能体管理",
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

- [ ] **Step 3: Update top-level Chinese API Reference meta**

Modify `content/docs/zh-CN/api-reference/meta.json` so it points to `conversational-ai` instead of flat endpoint placeholders.

- [ ] **Step 4: Run typecheck**

Run:

```bash
bun run types:check
```

Expected: PASS. Fumadocs MDX must not fail because endpoint leaf meta entries have no physical MDX files; if Fumadocs requires physical files for meta pages, keep endpoint leaves out of meta and inject them in sidebar from registry instead.

- [ ] **Step 5: Commit IA rebuild**

Run:

```bash
git add content/docs/en/api-reference content/docs/zh-CN/api-reference
git commit -m "feat: rebuild conversational ai api reference ia"
```

## Task 9: Add LLM Markdown Exports

**Files:**
- Create: `src/lib/openapi/markdown.ts`
- Create: `src/lib/openapi/markdown.test.ts`
- Modify: `src/routes/llms[.]txt.ts`
- Modify: `src/routes/llms-full[.]txt.ts`
- Modify: `src/routes/llms[.]mdx.docs.$.ts`
- Test: markdown tests and route handler tests if existing pattern supports them

- [ ] **Step 1: Write Markdown serializer tests**

Create `src/lib/openapi/markdown.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { getConversationalAiOperation } from './source.server';
import { serializeOpenApiOperationMarkdown } from './markdown';

describe('openapi markdown serializer', () => {
  it('includes source traceability and operation basics', async () => {
    const operation = await getConversationalAiOperation('start-agent');
    const markdown = serializeOpenApiOperationMarkdown({
      locale: 'en',
      operation,
      title: 'Start a conversational AI agent',
      url: '/en/api-reference/conversational-ai/rest-api/agent/join',
    });

    expect(markdown).toContain(
      '# Start a conversational AI agent (/en/api-reference/conversational-ai/rest-api/agent/join)',
    );
    expect(markdown).toContain(
      '- OpenAPI: /openapi/conversational-ai/convoai.yaml',
    );
    expect(markdown).toContain('- Operation ID: start-agent');
    expect(markdown).toContain('- Method: POST');
    expect(markdown).toContain('- Path: /v2/projects/{appid}/join');
  });
});
```

- [ ] **Step 2: Run tests and verify failure**

Run:

```bash
bun run test src/lib/openapi/markdown.test.ts
```

Expected: FAIL because serializer does not exist.

- [ ] **Step 3: Implement Markdown serializer**

Create `src/lib/openapi/markdown.ts`:
- Serialize title, summary/description, source traceability, servers, auth, parameters, request schema tree, response schema trees, and examples.
- Keep output deterministic for `llms-full.txt`.

- [ ] **Step 4: Update llms routes**

Modify:
- `/llms.txt`: append canonical OpenAPI endpoint page links after `llms(source).index()`.
- `/llms-full.txt`: append serialized OpenAPI endpoint markdown for all locale endpoint pages.
- `/llms.mdx/docs/$`: if no MDX page exists, resolve the splat as an OpenAPI endpoint raw markdown path.

Use `.md` suffix for generated raw markdown URLs:

```text
/llms.mdx/docs/en/api-reference/conversational-ai/rest-api/agent/join.md
```

- [ ] **Step 5: Run tests**

Run:

```bash
bun run test src/lib/openapi/markdown.test.ts
bun run types:check
```

Expected: PASS.

- [ ] **Step 6: Commit llms integration**

Run:

```bash
git add src/lib/openapi/markdown.ts src/lib/openapi/markdown.test.ts 'src/routes/llms[.]txt.ts' 'src/routes/llms-full[.]txt.ts' 'src/routes/llms[.]mdx.docs.$.ts'
git commit -m "feat: export openapi endpoint markdown"
```

## Task 10: Add Search Documents

**Files:**
- Create: `src/lib/openapi/search.ts`
- Create: `src/lib/openapi/search.test.ts`
- Modify: `src/routes/api/search.ts`
- Test: `src/lib/openapi/search.test.ts`

- [ ] **Step 1: Write search document tests**

Create `src/lib/openapi/search.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { getOpenApiSearchDocuments } from './search';

describe('openapi search documents', () => {
  it('creates searchable endpoint documents', async () => {
    const documents = await getOpenApiSearchDocuments();
    const startAgent = documents.find((doc) => doc.id.includes('start-agent'));

    expect(startAgent).toMatchObject({
      url: '/en/api-reference/conversational-ai/rest-api/agent/join',
    });
    expect(startAgent?.content).toContain('start-agent');
    expect(startAgent?.content).toContain('/v2/projects/{appid}/join');
  });
});
```

- [ ] **Step 2: Run tests and verify failure**

Run:

```bash
bun run test src/lib/openapi/search.test.ts
```

Expected: FAIL because module does not exist.

- [ ] **Step 3: Implement search document builder**

Create `src/lib/openapi/search.ts`:
- Generate one document per locale per operation.
- Include title, operationId, method, path, summary, description, parameter names, schema field names, and response codes.
- Return canonical URL from endpoint registry.

- [ ] **Step 4: Integrate `/api/search`**

Modify `src/routes/api/search.ts`:
- Keep existing MDX source search.
- Add OpenAPI endpoint documents.
- If `createFromSource(source)` cannot merge custom documents directly, wrap the route with a small combined response that preserves current search behavior and appends endpoint matches for the query parameter used by the existing search client.

- [ ] **Step 5: Run tests and typecheck**

Run:

```bash
bun run test src/lib/openapi/search.test.ts
bun run types:check
```

Expected: PASS.

- [ ] **Step 6: Commit search integration**

Run:

```bash
git add src/lib/openapi/search.ts src/lib/openapi/search.test.ts src/routes/api/search.ts
git commit -m "feat: index openapi endpoint pages"
```

## Task 11: Add OpenAPI Prerender Paths

**Files:**
- Modify: `vite.config.ts`
- Modify: `src/lib/prerender-filter.ts`
- Modify: `src/lib/prerender-filter.test.ts`
- Test: prerender-filter tests and build

- [ ] **Step 1: Add prerender path tests**

Modify `src/lib/prerender-filter.test.ts`:

```ts
import { getConversationalAiPrerenderPaths } from './openapi/conversational-ai';

it('includes openapi endpoint canonical routes for static generation', () => {
  expect(getConversationalAiPrerenderPaths()).toContain(
    '/en/api-reference/conversational-ai/rest-api/agent/join',
  );
  expect(getConversationalAiPrerenderPaths()).toContain(
    '/zh-CN/api-reference/conversational-ai/rest-api/agent/join',
  );
});
```

- [ ] **Step 2: Configure TanStack prerender**

Modify `vite.config.ts` to import `getConversationalAiPrerenderPaths()` and pass the derived paths to the TanStack Start prerender config using the supported field for this installed version. Prefer a direct `pages`/`routes` field if available; otherwise enable `autoStaticPathsDiscovery` and add a testable static path discovery hook according to the current TanStack Start API.

Do not hand-write endpoint URLs in `vite.config.ts`.

- [ ] **Step 3: Run tests**

Run:

```bash
bun run test src/lib/prerender-filter.test.ts
```

Expected: PASS.

- [ ] **Step 4: Commit prerender integration**

Run:

```bash
git add vite.config.ts src/lib/prerender-filter.ts src/lib/prerender-filter.test.ts
git commit -m "feat: prerender openapi endpoint pages"
```

## Task 12: Run OpenAPI Lane Acceptance Gate

**Files:**
- No new source files expected
- Test: full verification

- [ ] **Step 1: Run focused tests**

Run:

```bash
bun run test src/lib/openapi/conversational-ai.test.ts src/lib/openapi/source.server.test.ts src/lib/openapi/schema-tree.test.ts src/lib/openapi/docs-page.server.test.ts src/lib/openapi/markdown.test.ts src/lib/openapi/search.test.ts src/components/openapi/OpenApiOperationContent.test.tsx src/lib/docs-page.server.test.ts src/lib/prerender-filter.test.ts
```

Expected: PASS.

- [ ] **Step 2: Run all tests**

Run:

```bash
bun run test
```

Expected: PASS.

- [ ] **Step 3: Run typecheck**

Run:

```bash
bun run types:check
```

Expected: PASS.

- [ ] **Step 4: Run production build**

Run:

```bash
bun run build
```

Expected: PASS.

- [ ] **Step 5: Inspect static output**

Run:

```bash
test -f .vercel/output/static/openapi/conversational-ai/convoai.yaml
test -f .vercel/output/static/en/api-reference/conversational-ai/rest-api/agent/join/index.html
test -f .vercel/output/static/zh-CN/api-reference/conversational-ai/rest-api/agent/join/index.html
rg -n "openapi: 3.1.0|openapi:" .vercel/output/static/openapi/conversational-ai/convoai.yaml
```

Expected: all files exist.

- [ ] **Step 6: Preview and curl routes**

Start preview:

```bash
bun run preview --host 127.0.0.1 --port 4173
```

In another shell:

```bash
curl -s http://127.0.0.1:4173/openapi/conversational-ai/convoai.yaml | head -n 1
curl -s http://127.0.0.1:4173/llms.txt | rg "api-reference/conversational-ai/rest-api/agent/join"
curl -s http://127.0.0.1:4173/llms-full.txt | rg "Operation ID: start-agent"
curl -s http://127.0.0.1:4173/llms.mdx/docs/en/api-reference/conversational-ai/rest-api/agent/join.md | rg "OpenAPI: /openapi/conversational-ai/convoai.yaml"
```

Expected: YAML, llms index, llms full text, and raw markdown route all respond correctly.

- [ ] **Step 7: Verify search route**

Run the actual query format used by the search client. At minimum verify that searching `start-agent`, `join`, or `agent_rtc_uid` returns the canonical endpoint URL.

Expected: `/en/api-reference/conversational-ai/rest-api/agent/join` appears in search results.

- [ ] **Step 8: Browser verify desktop and mobile**

Open:

```text
http://127.0.0.1:4173/en/api-reference/conversational-ai/rest-api/agent/join
http://127.0.0.1:4173/zh-CN/api-reference/conversational-ai/rest-api/agent/join
```

Expected:
- Page renders in the current docs shell.
- Method/path are visible.
- OpenAPI source link points to `/openapi/conversational-ai/convoai.yaml`.
- Request and response sections are visible.
- Deep schema tree fields are readable and do not cause layout overflow on desktop or mobile.

- [ ] **Step 9: Check forbidden imports and generated source drift**

Run:

```bash
rg -n "fumadocs-ui|fumadocs-openapi/ui" src package.json
git status --short public/openapi
find content/openapi/conversational-ai/overrides -type f ! -name .gitkeep
```

Expected:
- No OpenAPI renderer imports from `fumadocs-ui` or `fumadocs-openapi/ui`.
- `public/openapi` is ignored and not staged.
- No override MDX files are present.

- [ ] **Step 10: Final commit**

Run:

```bash
git status --short
git add .
git commit -m "feat: render conversational ai openapi docs"
```

Expected: commit only after the full OpenAPI lane acceptance gate passes.

## Deferred Work

- Locale-specific OpenAPI YAML sources.
- MDX override rendering and placement support.
- Interactive Try It/API explorer.
- Server SDK and Client Toolkit generated reference rendering.
- Other product OpenAPI YAML sources under `html-docs`.
- Legacy generated HTML API migration.
