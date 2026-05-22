# OpenAPI Renderer V2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Keep every commit compiling and testable; do not commit intentional RED states.

**Goal:** Replace the failed `fumadocs-openapi` UI experiment with a local OpenAPI endpoint renderer v2 that keeps the docs shell, uses a server-only OpenAPI parser for dereferencing, and renders polished endpoint pages from `convoai.yaml`.

**Architecture:** OpenAPI lane ownership stays in `src/lib/openapi/lanes.ts`; it remains the single source for routes, sidebar overlay, locale links, search, llms, and prerender paths. `@apidevtools/swagger-parser` is used only in server/data code to dereference YAML into normalized operation data. React components consume parser-free serializable payload types from shared local modules. The UI remains local and embedded inside `DocsShell`; no external OpenAPI renderer may own routing, navigation, shell layout, or docs IA.

**Tech Stack:** TanStack Start, Fumadocs MDX/core source, local React components, Tailwind CSS, `js-yaml`, `@apidevtools/swagger-parser`, Vitest, Biome, Bun.

---

## Non-Negotiables

- No `fumadocs-openapi` package, CSS import, UI import, or server import remains after this migration.
- No Redoc, Scalar, Swagger UI, Stoplight Elements, or RapiDoc for first-party endpoint pages in this iteration.
- Parser dependencies stay in server/data code. Client components and routes must not import `.server` modules for OpenAPI payload types.
- OpenAPI endpoint pages stay inside the existing docs shell and left nav.
- `layoutMode: 'openapi'` hides the generic TOC rail and reserves width for API content.
- Sidebar endpoint items keep HTTP method badges derived from YAML.
- Renderer v2 is static only: no Try It, proxy route, auth/token input, request execution, Execute, Send request, or Try button.
- Schema rows are fully expanded by default and render as path rows such as `properties.llm.url`.
- `convoai.yaml` remains the only first-version source; the lane model must still support adding another YAML later without special-casing ConvoAI into shell code.

## Visual Quality Bar

Renderer v2 must be visually designed, not merely functional. Use the Fumadocs OpenAPI `createPlanet` page as the benchmark:

```text
https://fumadocs.dev/docs/openapi/createPlanet
```

Borrow the successful layout patterns without importing `fumadocs-openapi/ui`:

- compact operation metadata followed by method/path bar.
- portal left docs navigation with method badges.
- desktop two-column API body: main content on the left, sticky `Code & Examples` on the right.
- no generic docs TOC rail on OpenAPI pages.
- section rhythm: Authorization, path/header/query parameters, request body, responses, examples.
- quiet dense rows, not raw YAML dumps, not large decorative cards.
- language tabs and copy affordances on code blocks.
- request and response examples shown in the right panel without layout shift.
- schema rows show path/name, `?` or required marker, type, enum/default/example/format/range metadata, and description.
- long method/path/schema values wrap or scroll cleanly without clipping or overlap.
- typography is compact inside panels; no hero-scale headings inside the API surface.

Browser verification is required before completion. A page that passes tests but looks like a plain table dump is not acceptable.

## File Structure

- `package.json`
  - Remove `fumadocs-openapi`.
  - Add `@apidevtools/swagger-parser`.
- `bun.lock`
  - Refresh with Bun dependency commands.
- `package-lock.json`
  - Refresh only if repo policy/tests require it. If changed by package tooling, commit it; otherwise do not hand-edit.
- `src/lib/openapi/payload.ts`
  - New parser-free shared serializable types: `NormalizedOpenApiOperation`, parameters, media, responses, schema rows, examples, `OpenApiOperationPayload`.
- `src/lib/openapi/source.server.ts`
  - Own YAML loading, parser/dereference, operation lookup, server-side normalization, and parser cache.
  - Must not import UI renderer packages.
- `src/lib/openapi/schema-tree.ts`
  - Keep schema normalization and add robust flattened row support for renderer v2.
- `src/lib/openapi/examples.ts`
  - New static example generator for request/response bodies, cURL, and JavaScript `fetch`.
- `src/components/openapi/OpenApiOperationContent.tsx`
  - Local renderer v2 entry point.
- `src/components/openapi/OpenApiOperationContent.test.tsx`
  - Renderer tests for header, parameters, schema rows, examples, copy buttons, and absence of execute UI.
- `src/components/openapi/OpenApiRichOperationContent.tsx`
  - Delete.
- `src/components/openapi/OpenApiRichOperationContentBody.tsx`
  - Delete.
- `src/lib/openapi/types.ts`
  - Delete if it only wraps `fumadocs-openapi`; otherwise replace with `payload.ts` and remove all external-renderer types.
- `src/lib/openapi/docs-page.server.ts`
  - Return local renderer payload: operation + schema rows + generated examples + source URL.
- `src/components/docs-shell/DocsContent.tsx`
  - Import and render `OpenApiOperationContent`.
- `src/styles/app.css`
  - Remove `fumadocs-openapi/css/preset.css`.
  - Add only scoped `.openapi-operation` styles if Tailwind utilities are insufficient.
- `.agents/skills/fumadocs-migration/SKILL.md`
- `.agents/skills/fumadocs-migration/references/openapi-lane.md`
  - Standardize local renderer v2 and server-only parser boundary.

## Commit Safety

Before every commit:

```bash
git status --short
git diff -- <files-to-commit>
```

Only commit files touched by the current task. Do not include unrelated user edits. Do not commit a checkpoint unless the focused tests for that checkpoint and `bun run types:check` pass, except when the plan explicitly says the RED test is run before implementation and no commit happens in between.

---

### Task 1: Replace External Renderer Contracts With Local Shared Payload Types

**Files:**
- Create/Modify: `src/lib/openapi/payload.ts`
- Modify: `src/lib/openapi/source.server.ts`
- Modify: `src/lib/openapi/docs-page.server.ts`
- Modify: `src/lib/openapi/docs-page.server.test.ts`
- Modify: `src/components/docs-shell/DocsContent.tsx`
- Restore/Modify: `src/components/openapi/OpenApiOperationContent.tsx`
- Restore/Modify: `src/components/openapi/OpenApiOperationContent.test.tsx`
- Delete: `src/components/openapi/OpenApiRichOperationContent.tsx`
- Delete: `src/components/openapi/OpenApiRichOperationContentBody.tsx`
- Delete/Replace: `src/lib/openapi/types.ts`
- Modify: `src/styles/app.css`

- [ ] **Step 1: Inspect current external-renderer surface**

Run:

```bash
rg "fumadocs-openapi|OpenApiRichOperationContent|clientPayload|getOpenApiClientPagePayload|getOpenApiOperationLocator|OpenAPIServer|Document" src package.json
git status --short
```

Record which files currently depend on the failed experiment. This step is read-only.

- [ ] **Step 2: Add parser-free payload module**

Create `src/lib/openapi/payload.ts`. It must not import `.server` modules or parser packages.

Minimum shape:

```ts
export type OpenApiHttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'OPTIONS'
  | 'HEAD';

export type OpenApiJsonValue =
  | null
  | boolean
  | number
  | string
  | OpenApiJsonValue[]
  | { [key: string]: OpenApiJsonValue };

export type OpenApiParameter = {
  description?: string;
  in: 'path' | 'query' | 'header' | 'cookie';
  name: string;
  required: boolean;
  schema?: unknown;
};

export type NormalizedOpenApiMedia = {
  example?: unknown;
  examples?: Record<string, { value?: unknown }>;
  schema?: unknown;
};

export type NormalizedOpenApiOperation = {
  description?: string;
  method: OpenApiHttpMethod;
  operationId: string;
  parameters: OpenApiParameter[];
  path: string;
  requestBody?: {
    content: Record<string, NormalizedOpenApiMedia>;
    contentTypes: string[];
    description?: string;
    required: boolean;
  };
  responses: Record<
    string,
    {
      content?: Record<string, NormalizedOpenApiMedia>;
      description?: string;
    }
  >;
  security?: unknown[];
  servers: { url: string }[];
  summary: string;
};

export type OpenApiSchemaRow = {
  defaultValue?: OpenApiJsonValue;
  deprecated?: boolean;
  depth: number;
  description?: string;
  enumValues?: OpenApiJsonValue[];
  example?: OpenApiJsonValue;
  format?: string;
  maximum?: number;
  minimum?: number;
  name: string;
  nullable?: boolean;
  path: string;
  readOnly?: boolean;
  required: boolean;
  type: string;
  writeOnly?: boolean;
};

export type OpenApiExamples = {
  curl: string;
  javascript: string;
  requestBodyJson?: unknown;
  responseBodyJson?: unknown;
  responseStatus?: string;
};

export type OpenApiOperationPayload = {
  examples: OpenApiExamples;
  operation: NormalizedOpenApiOperation;
  publicSourceUrl: string;
  requestSchemaRows: OpenApiSchemaRow[];
  responseSchemaRows: Record<string, OpenApiSchemaRow[]>;
};
```

- [ ] **Step 3: Rewire imports to shared payload**

Update server/data code and renderer code so components import types from `@/lib/openapi/payload`, not from `@/lib/openapi/source.server`.

Forbidden after this step:

```bash
rg "@/lib/openapi/.*\\.server|\\.server" src/components src/routes
```

Expected: no component/route OpenAPI type imports from `.server` files.

- [ ] **Step 4: Restore a compiling local renderer placeholder**

Restore `src/components/openapi/OpenApiOperationContent.tsx` as a compiling component. It can be visually simple in Task 1, but it must render real payload fields and define no missing helper references.

Minimum implementation:

```tsx
import type { OpenApiOperationPayload } from '@/lib/openapi/payload';

export function OpenApiOperationContent({
  operation,
  publicSourceUrl,
}: OpenApiOperationPayload) {
  return (
    <div className="not-prose openapi-operation">
      <p>{operation.summary}</p>
      <p>
        <strong>{operation.method}</strong> <code>{operation.path}</code>
      </p>
      <a href={publicSourceUrl}>OpenAPI source</a>
    </div>
  );
}

export type { OpenApiOperationPayload };
```

- [ ] **Step 5: Remove rich renderer files and external payload contract**

Delete:

```text
src/components/openapi/OpenApiRichOperationContent.tsx
src/components/openapi/OpenApiRichOperationContentBody.tsx
```

Remove or replace `src/lib/openapi/types.ts` only after all imports have moved to `payload.ts`.

In `src/lib/openapi/source.server.ts`, remove the external-renderer exports and helpers completely:

```text
getOpenApiServer
createOpenApiServer
getOpenApiClientPagePayload
getOpenApiOperationLocator
OpenApiClientPagePayload
OpenApiOperationLocator
OpenAPIServer
Document
```

- [ ] **Step 6: Rewire `DocsContent`**

Replace `OpenApiRichOperationContent` imports/usages with `OpenApiOperationContent`.

- [ ] **Step 7: Update tests for local payload**

In `src/lib/openapi/docs-page.server.test.ts`, assert no `clientPayload` exists:

```ts
expect(page.body.kind).toBe('openapi');
expect(page.body.operationPayload).toMatchObject({
  operation: {
    method: 'POST',
    path: '/v2/projects/{appid}/join',
  },
  publicSourceUrl: '/openapi/conversational-ai/convoai.yaml',
});
expect(page.body.operationPayload).not.toHaveProperty('clientPayload');
```

In `src/components/openapi/OpenApiOperationContent.test.tsx`, add a minimal render test for method/path/source link.

- [ ] **Step 8: Remove preset CSS import**

In `src/styles/app.css`, remove:

```css
@import "fumadocs-openapi/css/preset.css";
```

Remove `.openapi-rich-content` styles or rename them only if they are still useful for `.openapi-operation`.

- [ ] **Step 9: Verify compile-safe checkpoint**

Run:

```bash
bun run test src/lib/openapi/docs-page.server.test.ts src/components/docs-shell/DocsContent.test.tsx src/components/openapi/OpenApiOperationContent.test.tsx
bun run types:check
rg "fumadocs-openapi|OpenApiRichOperationContent|getOpenApiClientPagePayload|getOpenApiOperationLocator|OpenAPIServer|clientPayload" src package.json
rg "@/lib/openapi/.*\\.server|\\.server" src/components src/routes
```

Expected:

- tests pass.
- type check passes.
- forbidden external-renderer/client payload query returns no matches.
- `.server` boundary query returns no component/route matches.

- [ ] **Step 10: Commit**

```bash
git status --short
git diff -- src/lib/openapi src/components src/styles/app.css package.json
git add src/lib/openapi/payload.ts src/lib/openapi/source.server.ts src/lib/openapi/docs-page.server.ts src/lib/openapi/docs-page.server.test.ts src/components/docs-shell/DocsContent.tsx src/components/openapi src/styles/app.css
git commit -m "refactor: restore local openapi renderer contract"
```

---

### Task 2: Swap Dependency and Add Server-Only Swagger Parser Dereferencing

**Files:**
- Modify: `package.json`
- Modify: `bun.lock`
- Modify: `package-lock.json` only if tooling changes it
- Modify: `src/lib/openapi/source.server.ts`
- Test: `src/lib/openapi/source.server.test.ts`

- [ ] **Step 1: Write dereference tests**

Add tests that exercise behavior parser dereferencing must provide. Prefer a small local fixture inside the test if `convoai.yaml` does not contain a stable composed-schema case.

Minimum assertions:

```ts
it('dereferences local parameter refs before normalization', async () => {
  const operation = await getOpenApiOperation(lane, 'start-agent');

  expect(operation.parameters).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ in: 'header', name: 'Authorization' }),
      expect.objectContaining({ in: 'path', name: 'appid' }),
    ]),
  );
});

it('serializes normalized operations without parser objects', async () => {
  const operation = await getOpenApiOperation(lane, 'start-agent');

  expect(JSON.parse(JSON.stringify(operation))).toMatchObject({
    operationId: 'start-agent',
    method: 'POST',
    path: '/v2/projects/{appid}/join',
  });
});
```

- [ ] **Step 2: Verify RED before implementation**

Run:

```bash
bun run test src/lib/openapi/source.server.test.ts
```

If both tests pass because existing YAML is simple, add one explicit `$ref` or `allOf` fixture test before proceeding.

- [ ] **Step 3: Change dependencies**

Run:

```bash
bun remove fumadocs-openapi
bun add @apidevtools/swagger-parser
```

Then inspect:

```bash
git diff -- package.json bun.lock package-lock.json
```

If `package-lock.json` was not changed by tooling, do not force an edit. If repo verification requires it later, refresh it with the repo's package-manager policy and commit the resulting lock diff.

- [ ] **Step 4: Implement dereferenced document cache**

In `src/lib/openapi/source.server.ts`:

```ts
import SwaggerParser from '@apidevtools/swagger-parser';

const documentCache = new Map<string, Promise<OpenApiDocument>>();

async function getOpenApiDocument(lane: OpenApiLane): Promise<OpenApiDocument> {
  const cached = documentCache.get(lane.id);

  if (cached) {
    return cached;
  }

  const next = loadDereferencedOpenApiDocument(lane);
  documentCache.set(lane.id, next);
  return next;
}

async function loadDereferencedOpenApiDocument(
  lane: OpenApiLane,
): Promise<OpenApiDocument> {
  const sourcePath = getOpenApiDocumentPath(lane);
  return (await SwaggerParser.dereference(sourcePath, {
    dereference: { circular: 'ignore' },
  })) as OpenApiDocument;
}
```

Route operation loading through `getOpenApiDocument(lane)`. Remove the old `loadOpenApiDocument()` if no tests use it.

- [ ] **Step 5: Verify parser boundary**

Run:

```bash
rg "@apidevtools/swagger-parser" src/components src/routes
rg "@apidevtools/swagger-parser" src/lib/openapi
rg "fumadocs-openapi" src package.json bun.lock package-lock.json
```

Expected:

- no parser import in components/routes.
- parser import only in server/data layer, normally `src/lib/openapi/source.server.ts`.
- no `fumadocs-openapi` in `src` or `package.json`; lockfile matches are allowed only if transitive and explainable, otherwise investigate.

- [ ] **Step 6: Run tests and type check**

```bash
bun run test src/lib/openapi/source.server.test.ts src/lib/openapi/lanes.test.ts src/lib/openapi/docs-page.server.test.ts
bun run types:check
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git status --short
git diff -- package.json bun.lock package-lock.json src/lib/openapi/source.server.ts src/lib/openapi/source.server.test.ts
git add package.json bun.lock src/lib/openapi/source.server.ts src/lib/openapi/source.server.test.ts
git add package-lock.json || true
git commit -m "feat: dereference openapi sources server side"
```

---

### Task 3: Add Robust Fully Expanded Schema Rows

**Files:**
- Modify: `src/lib/openapi/schema-tree.ts`
- Modify: `src/lib/openapi/payload.ts`
- Test: `src/lib/openapi/schema-tree.test.ts`

- [ ] **Step 1: Write schema row tests**

Add tests for:

- nested path rows: `properties.llm.url`.
- required isolation: a parent object's `required` list must not mark unrelated descendants required.
- arrays: `items.*` paths are represented clearly.
- `allOf` required merging after dereference/normalization.
- nullable/type arrays.
- `readOnly` excluded or flagged for request usage and `writeOnly` excluded or flagged for response usage.
- `format`, `minimum`, `maximum`, `default`, `example`, enum metadata.

Example required-isolation test:

```ts
it('does not leak parent required fields into child object properties', () => {
  const rows = buildOpenApiSchemaRows({
    type: 'object',
    required: ['profile'],
    properties: {
      profile: {
        type: 'object',
        properties: {
          avatar: { type: 'string' },
        },
      },
    },
  });

  expect(rows).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ path: 'profile', required: true }),
      expect.objectContaining({ path: 'profile.avatar', required: false }),
    ]),
  );
});
```

- [ ] **Step 2: Verify RED**

```bash
bun run test src/lib/openapi/schema-tree.test.ts
```

Expected: FAIL until `buildOpenApiSchemaRows` and metadata extraction are implemented.

- [ ] **Step 3: Implement row builder**

Implement `buildOpenApiSchemaRows(schema, options?)` in `schema-tree.ts`. It may reuse the current tree builder only if requiredness and metadata are correct; otherwise fix the tree builder first.

Rules:

- every row has stable `path`, `name`, `depth`, `type`, `required`.
- depth is used for subtle visual grouping only; the full path is always rendered.
- object child requiredness is based on that object's own `required` list.
- arrays use a clear path segment such as `items` or `field[]`.
- composed schemas merge displayable properties where practical.
- row metadata includes enum/default/example/format/range/nullable/readOnly/writeOnly/deprecated.

- [ ] **Step 4: Run focused tests**

```bash
bun run test src/lib/openapi/schema-tree.test.ts src/lib/openapi/markdown.test.ts src/lib/openapi/search.test.ts
bun run types:check
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git status --short
git diff -- src/lib/openapi/schema-tree.ts src/lib/openapi/schema-tree.test.ts src/lib/openapi/payload.ts
git add src/lib/openapi/schema-tree.ts src/lib/openapi/schema-tree.test.ts src/lib/openapi/payload.ts
git commit -m "feat: flatten openapi schema rows"
```

---

### Task 4: Generate Static Request and Response Examples

**Files:**
- Create: `src/lib/openapi/examples.ts`
- Create: `src/lib/openapi/examples.test.ts`
- Modify: `src/lib/openapi/docs-page.server.ts`
- Modify: `src/lib/openapi/docs-page.server.test.ts`
- Modify: `src/lib/openapi/payload.ts`

- [ ] **Step 1: Write example generator tests**

Create `src/lib/openapi/examples.test.ts` covering:

- media `examples.*.value` beats generated fallback.
- media `example` beats schema fallback.
- schema `example` beats type fallback.
- default beats placeholder.
- request fallback includes required object fields first.
- request fallback skips `readOnly`.
- response fallback skips `writeOnly`.
- enum uses the first enum value.
- object fallback is capped: request optional cap 5, response top-level cap 8.
- cURL and JavaScript include method, URL, content type, auth header placeholder, and JSON body only when a body exists.

Run:

```bash
bun run test src/lib/openapi/examples.test.ts
```

Expected: FAIL because `examples.ts` does not exist.

- [ ] **Step 2: Implement `createOpenApiExamples()`**

Create `src/lib/openapi/examples.ts` using only parser-free payload types:

```ts
import type {
  NormalizedOpenApiMedia,
  NormalizedOpenApiOperation,
  OpenApiExamples,
} from './payload';
```

Rules:

- request body priority:
  1. media `examples.*.value`
  2. media `example`
  3. schema field `example`
  4. generated fallback
- response body priority is the same.
- request generation skips `readOnly`; response generation skips `writeOnly`.
- object request fallback includes required fields first; optional fields capped at 5 when no required fields exist.
- response top-level object fallback capped at 8 fields.
- default wins over generated placeholder.
- enum uses first enum value.
- strings use format-aware placeholders where obvious (`uri`, `email`, `date-time`), otherwise `'string'`.

- [ ] **Step 3: Implement cURL and JavaScript generators**

Target cURL shape:

```bash
curl -X POST "https://api.agora.io/cn/api/conversational-ai-agent/v2/projects/{appid}/join" \
  -H "Content-Type: application/json" \
  -H "Authorization: agora token=\"<your-token>\"" \
  -d '{
  "name": "string"
}'
```

Target JavaScript shape:

```ts
const response = await fetch(
  'https://api.agora.io/cn/api/conversational-ai-agent/v2/projects/{appid}/join',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'agora token="<your-token>"',
    },
    body: JSON.stringify({
      name: 'string',
    }),
  },
);

const data = await response.json();
```

- [ ] **Step 4: Attach examples and schema rows to endpoint payload**

In `src/lib/openapi/docs-page.server.ts`, local payload should be:

```ts
const requestSchema =
  operation.requestBody?.content['application/json']?.schema;
const responseSchemaRows = Object.fromEntries(
  Object.entries(operation.responses).map(([status, response]) => [
    status,
    buildOpenApiSchemaRows(response.content?.['application/json']?.schema),
  ]),
);

const body: DocsContentBody = {
  kind: 'openapi',
  operationPayload: {
    examples: createOpenApiExamples(operation),
    operation,
    publicSourceUrl: route.lane.publicSourceUrl,
    requestSchemaRows: buildOpenApiSchemaRows(requestSchema, {
      usage: 'request',
    }),
    responseSchemaRows,
  },
};
```

- [ ] **Step 5: Update docs page payload tests**

Assert:

```ts
expect(page).toMatchObject({
  body: {
    kind: 'openapi',
    operationPayload: {
      examples: {
        curl: expect.stringContaining('curl -X POST'),
        javascript: expect.stringContaining('fetch('),
      },
      operation: {
        method: 'POST',
        path: '/v2/projects/{appid}/join',
      },
      publicSourceUrl: '/openapi/conversational-ai/convoai.yaml',
      requestSchemaRows: expect.arrayContaining([
        expect.objectContaining({ path: expect.any(String) }),
      ]),
    },
  },
});
```

- [ ] **Step 6: Run focused tests**

```bash
bun run test src/lib/openapi/examples.test.ts src/lib/openapi/docs-page.server.test.ts src/lib/openapi/schema-tree.test.ts
bun run types:check
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git status --short
git diff -- src/lib/openapi/examples.ts src/lib/openapi/examples.test.ts src/lib/openapi/docs-page.server.ts src/lib/openapi/docs-page.server.test.ts src/lib/openapi/payload.ts
git add src/lib/openapi/examples.ts src/lib/openapi/examples.test.ts src/lib/openapi/docs-page.server.ts src/lib/openapi/docs-page.server.test.ts src/lib/openapi/payload.ts
git commit -m "feat: generate static openapi examples"
```

---

### Task 5: Build the Polished Renderer V2 UI

**Files:**
- Modify: `src/components/openapi/OpenApiOperationContent.tsx`
- Modify: `src/components/openapi/OpenApiOperationContent.test.tsx`
- Modify: `src/styles/app.css`

- [ ] **Step 1: Re-open visual benchmark**

Before implementation:

```bash
agent-browser --session openapi-reference open https://fumadocs.dev/docs/openapi/createPlanet
agent-browser --session openapi-reference snapshot -i -c -d 5
agent-browser --session openapi-reference screenshot /tmp/fumadocs-create-planet-reference.png
agent-browser --session openapi-reference close
```

Expected: screenshot confirms compact operation header and right `Code & Examples` panel. If URL redirects, use the final URL and update this plan if needed.

- [ ] **Step 2: Write renderer tests**

Tests must assert:

- compact method/path header.
- source link.
- Authorization section when header auth/security parameter exists.
- path/header/query parameter rows with type, required/optional marker, description.
- request schema row such as `properties.llm.url`.
- enum/default/format/range metadata renders when present in rows.
- response status sections render schema rows.
- `Code & Examples` renders cURL, JavaScript, and response example.
- copy buttons exist for code blocks.
- no execute/send/try controls exist.

Run:

```bash
bun run test src/components/openapi/OpenApiOperationContent.test.tsx
```

Expected: FAIL until UI is implemented.

- [ ] **Step 3: Implement component structure**

Implement these local helpers in `OpenApiOperationContent.tsx`:

- `OperationHeader`
- `MethodBadge`
- `AuthorizationSection`
- `ParametersSection`
- `ParameterRows`
- `SchemaSection`
- `SchemaRowsTable`
- `ResponsesSection`
- `ExamplesPanel`
- `CodeTabs`
- `CopyButton`
- `JsonPreview`
- `ResponseExample`

All helpers stay local unless the file becomes unmaintainable; if extracted, extract only into `src/components/openapi/*` and keep the same tests.

- [ ] **Step 4: Operation header visual contract**

- overline row: `Operation ID: start-agent`.
- optional summary/description, compact.
- method badge + path code in one compact bordered bar.
- `OpenAPI source` action uses `ExternalLinkIcon`.
- no text clipping at mobile widths; path may horizontally scroll inside the bar.

- [ ] **Step 5: Parameter and Authorization sections**

Rules:

- `Authorization` gets its own compact section when an auth/header parameter is present.
- path, header, query, cookie parameters group by location.
- rows show `name`, optional `?` when not required, type, default/example/enum/format/range metadata, and description.
- required path params use a compact required indicator; avoid big badges.
- layout is dense and scannable, with no nested cards.

- [ ] **Step 6: Schema rows table**

Rules:

- all rows visible by default.
- display full `path`.
- show required/optional marker, type, enum/default/example/format/range/nullable/deprecated metadata.
- use subtle depth signal for first 2 levels only; deep hierarchy is carried by full path.
- long paths use `break-all` or controlled horizontal overflow; no clipped text.
- no accordion forest.

- [ ] **Step 7: Responses section**

Rules:

- each response status appears as a compact status row/section.
- response description appears when present.
- response body schema rows use the same `SchemaRowsTable`.
- empty responses render a terse empty state, not a large card.

- [ ] **Step 8: Examples panel**

Rules:

- sticky on desktop with `top: var(--openapi-sticky-top)`.
- panel width around 380-420px on desktop and full width on mobile.
- tabs for `cURL`, `JavaScript`, and `Response`.
- code area has stable min height so tab switching does not jump.
- copy affordance on each code block using `CopyIcon`/`CheckIcon`.
- no request execution UI.

- [ ] **Step 9: Scoped styles**

In `src/styles/app.css`, replace old rich-renderer styles with scoped local styles only:

```css
.openapi-operation {
  --openapi-sticky-top: calc(var(--docs-shell-header-offset, 0px) + 1rem);
  width: min(100%, 1120px);
}

.openapi-operation :where(pre, code) {
  font-family: var(--font-mono);
}
```

Add extra scoped rules only for code scrollbar/copy button polish if utilities are insufficient.

- [ ] **Step 10: Run focused renderer tests**

```bash
bun run test src/components/openapi/OpenApiOperationContent.test.tsx src/components/docs-shell/DocsShell.test.tsx
bun run types:check
```

Expected: PASS.

- [ ] **Step 11: Browser visual verification with a real server**

Start a fresh server; do not test a stale preview.

Option A, production preview:

```bash
bun run build
bun run preview --host 127.0.0.1 --port 4173
```

Option B, dev server if production build is intentionally deferred:

```bash
bun run dev --host 127.0.0.1 --port 5173
```

Then open the matching URL:

```bash
agent-browser --session docs-openapi-v2 open http://127.0.0.1:4173/en/api-reference/conversational-ai/rest-api/agent/join
agent-browser --session docs-openapi-v2 snapshot -i -c -d 5
agent-browser --session docs-openapi-v2 screenshot /tmp/docs-openapi-v2-join.png
agent-browser --session docs-openapi-v2 close
```

Expected visual outcome:

- page reads like a designed API reference, not a raw table dump.
- right sticky panel is visually comparable to the Fumadocs reference's Code & Examples column.
- schema rows are dense and readable, with long paths wrapping cleanly.
- tabs do not resize the panel or shift the page.
- no generic docs TOC rail.
- no in-app instructional text explaining the layout.

If this comparison fails, fix the renderer before committing.

- [ ] **Step 12: Commit**

```bash
git status --short
git diff -- src/components/openapi/OpenApiOperationContent.tsx src/components/openapi/OpenApiOperationContent.test.tsx src/styles/app.css
git add src/components/openapi/OpenApiOperationContent.tsx src/components/openapi/OpenApiOperationContent.test.tsx src/styles/app.css
git commit -m "feat: render openapi endpoint pages locally"
```

---

### Task 6: Preserve Shell Integration, Sidebar Method Badges, and Generated Surfaces

**Files:**
- Modify as needed: `src/lib/docs-page.server.ts`
- Modify as needed: `src/lib/docs-tree.ts`
- Modify as needed: `src/components/docs-shell/DocsSidebarTree.tsx`
- Modify as needed: `src/components/docs-shell/DocsShell.tsx`
- Modify as needed: `src/routes/$locale/$tab/route.tsx`
- Tests: `src/lib/docs-page.server.test.ts`
- Tests: `src/components/docs-shell/DocsSidebarTree.test.tsx`
- Tests: `src/components/docs-shell/DocsShell.test.tsx`
- Tests: `src/lib/prerender-filter.test.ts`

- [ ] **Step 1: Verify shell layout tests**

Ensure tests cover:

```tsx
expect(screen.queryByTestId('docs-toc-rail')).not.toBeInTheDocument();
expect(screen.getByTestId('docs-body-shell')).toHaveClass(
  'xl:grid-cols-[256px_minmax(0,1fr)]',
);
```

- [ ] **Step 2: Verify sidebar method badge tests**

Ensure tests assert the accessible link contains title plus method and the visible method badge uses monospace styling:

```tsx
expect(
  screen.getByRole('link', {
    name: /Start a conversational AI agent POST/,
  }),
).toBeInTheDocument();
expect(screen.getByText('POST')).toHaveClass('font-mono');
```

- [ ] **Step 3: Verify route/layout data flow**

Check:

- route passes `layoutMode` to `DocsShell`.
- normal MDX pages use `layoutMode: 'docs'`.
- OpenAPI endpoint pages use `layoutMode: 'openapi'`.
- endpoint overlay items include `method`.
- search, llms, and prerender paths remain lane-derived, not hard-coded.

- [ ] **Step 4: Run focused shell/generated-surface tests**

```bash
bun run test src/lib/docs-page.server.test.ts src/components/docs-shell/DocsShell.test.tsx src/components/docs-shell/DocsSidebarTree.test.tsx src/lib/prerender-filter.test.ts
bun run types:check
```

Expected: PASS.

- [ ] **Step 5: Commit only if files changed**

```bash
git status --short
git diff -- src/lib/docs-page.server.ts src/lib/docs-tree.ts src/components/docs-shell/DocsSidebarTree.tsx src/components/docs-shell/DocsShell.tsx 'src/routes/$locale/$tab/route.tsx' src/lib/docs-page.server.test.ts src/components/docs-shell/DocsSidebarTree.test.tsx src/components/docs-shell/DocsShell.test.tsx src/lib/prerender-filter.test.ts
git add src/lib/docs-page.server.ts src/lib/docs-tree.ts src/components/docs-shell/DocsSidebarTree.tsx src/components/docs-shell/DocsShell.tsx 'src/routes/$locale/$tab/route.tsx' src/lib/docs-page.server.test.ts src/components/docs-shell/DocsSidebarTree.test.tsx src/components/docs-shell/DocsShell.test.tsx src/lib/prerender-filter.test.ts
git commit -m "feat: integrate openapi renderer with docs shell"
```

If no files changed, do not create an empty commit.

---

### Task 7: Update Migration Skill Standard

**Files:**
- Modify: `.agents/skills/fumadocs-migration/SKILL.md` if summary wording needs it
- Modify: `.agents/skills/fumadocs-migration/references/openapi-lane.md`

- [ ] **Step 1: Search the whole skill folder**

```bash
rg "fumadocs-openapi|Scalar|Redoc|Swagger UI|Stoplight|RapiDoc|OpenAPI" .agents/skills/fumadocs-migration
```

Use the results to update all stale wording, not only the reference file.

- [ ] **Step 2: Rewrite rendering standard**

In `.agents/skills/fumadocs-migration/references/openapi-lane.md`, standardize:

```md
OpenAPI lane owns IA, publication, search, llms exports, prerender paths, and endpoint routing.

OpenAPI renderer v2 is a local docs-portal renderer. It consumes normalized operation data, fully expanded schema rows, and static examples derived from YAML. It must not use external OpenAPI UI renderers as the shell or endpoint body renderer.

A server-only OpenAPI parser/dereferencer such as `@apidevtools/swagger-parser` is allowed in `src/lib/openapi/*.server.ts` or equivalent data-layer files. Parser dependencies must not be imported by client components, routes, or shared browser modules.

Do not use `fumadocs-openapi/ui`, Redoc, Scalar, Swagger UI, Stoplight Elements, or RapiDoc for first-party endpoint pages unless a later ADR replaces renderer v2.

Use Fumadocs OpenAPI pages only as visual references, especially the `createPlanet` API page:

```text
https://fumadocs.dev/docs/openapi/createPlanet
```

Do not import or depend on the Fumadocs OpenAPI UI implementation to achieve that look. Recreate the relevant API documentation patterns locally: compact method/path header, dense parameter/body sections, a desktop two-column layout, and a sticky Code & Examples panel.
```

- [ ] **Step 3: Document first-renderer behavior**

Add or keep:

- no Try It.
- no proxy route.
- no auth/token input.
- no request execution button.
- cURL + JavaScript `fetch`.
- response example.
- full schema expansion via path rows.
- OpenAPI layout mode hides generic TOC rail.
- method badges in left nav.
- any additional YAML follows the lane config pattern; do not hard-code per-YAML behavior into shell components.

- [ ] **Step 4: Update verification section**

Verification must include:

```md
- `rg "fumadocs-openapi|@scalar/api-reference|redoc|swagger-ui|@stoplight/elements|rapidoc" src package.json bun.lock package-lock.json` returns no first-party dependency/import matches unless a later ADR explicitly replaces renderer v2.
- `rg "@apidevtools/swagger-parser" src/components src/routes` returns no matches; parser usage stays server/data-layer only.
- `rg "@/lib/openapi/.*\\.server|\\.server" src/components src/routes` returns no OpenAPI component/route type imports from `.server` files.
```

- [ ] **Step 5: Run skill-doc checks**

```bash
rg "fumadocs-openapi|@scalar/api-reference|redoc|swagger-ui|@stoplight/elements|rapidoc" .agents/skills/fumadocs-migration
```

Expected: no wording that recommends external OpenAPI UI renderers for first-party endpoint pages. Mentions are allowed only in "do not use" verification/rules.

- [ ] **Step 6: Commit**

```bash
git status --short
git diff -- .agents/skills/fumadocs-migration/SKILL.md .agents/skills/fumadocs-migration/references/openapi-lane.md
git add .agents/skills/fumadocs-migration/SKILL.md .agents/skills/fumadocs-migration/references/openapi-lane.md
git commit -m "docs: standardize local openapi renderer"
```

---

### Task 8: Acceptance Verification

**Files:**
- No source changes expected unless verification exposes a bug.

- [ ] **Step 1: Run focused OpenAPI suite**

```bash
bun run test src/lib/openapi/lanes.test.ts src/lib/openapi/source.server.test.ts src/lib/openapi/docs-page.server.test.ts src/lib/openapi/markdown.test.ts src/lib/openapi/search.test.ts src/lib/openapi/schema-tree.test.ts src/lib/openapi/examples.test.ts src/lib/docs-page.server.test.ts src/lib/prerender-filter.test.ts src/components/docs-shell/DocsContent.test.tsx src/components/docs-shell/DocsShell.test.tsx src/components/docs-shell/DocsSidebarTree.test.tsx src/components/openapi/OpenApiOperationContent.test.tsx
```

Expected: PASS.

- [ ] **Step 2: Run type check**

```bash
bun run types:check
```

Expected: PASS.

- [ ] **Step 3: Run production build**

```bash
bun run build
```

Expected: PASS. Existing chunk-size warnings are acceptable; import-protection errors are not.

- [ ] **Step 4: Check forbidden renderer imports and dependencies**

```bash
rg "fumadocs-openapi|@scalar/api-reference|redoc|swagger-ui|@stoplight/elements|rapidoc" src package.json bun.lock package-lock.json
```

Expected: no first-party dependency/import matches. Lockfile transitive matches must be investigated and explained.

- [ ] **Step 5: Check parser boundary**

```bash
rg "@apidevtools/swagger-parser" src/components src/routes
rg "@/lib/openapi/.*\\.server|\\.server" src/components src/routes
rg "@apidevtools/swagger-parser" src/lib/openapi
```

Expected:

- no parser import in components/routes.
- no OpenAPI component/route type imports from `.server` files.
- parser appears only in server/data-layer code, normally `src/lib/openapi/source.server.ts`.

- [ ] **Step 6: Check static YAML publication**

```bash
ls -l .vercel/output/static/openapi/conversational-ai/convoai.yaml
git status --short public/openapi
git status --ignored --short public/openapi | head -20
```

Expected:

- built YAML exists.
- `git status --short public/openapi` is empty.
- ignored status shows generated `public/openapi/`.

- [ ] **Step 7: Check prerendered endpoints without hard-coded counts**

Derive expected endpoint paths from lane config/YAML, then compare them with built output. Use an existing helper if present; otherwise use a one-off Node script that imports lane route data.

Minimum output inspection:

```bash
find .vercel/output/static/en/api-reference/conversational-ai/rest-api/agent -maxdepth 2 -type f -name index.html | sort
find .vercel/output/static/zh-CN/api-reference/conversational-ai/rest-api/agent -maxdepth 2 -type f -name index.html | sort
```

Expected: every lane-defined endpoint route plus the parent `agent/index.html` exists for both locales.

- [ ] **Step 8: Run preview and HTTP checks**

Start preview:

```bash
bun run preview --host 127.0.0.1 --port 4173
```

In another shell:

```bash
curl -fsS http://127.0.0.1:4173/openapi/conversational-ai/convoai.yaml | sed -n '1,12p'
curl -fsS http://127.0.0.1:4173/en/api-reference/conversational-ai/rest-api/agent/join | rg -a "Start a conversational AI agent|OpenAPI source|/v2/projects|POST|curl -X POST|const response = await fetch|properties\\.llm"
curl -fsS http://127.0.0.1:4173/llms.txt | rg "conversational-ai/rest-api/agent/join|Start a conversational AI agent"
curl -fsS http://127.0.0.1:4173/llms.mdx/docs/en/api-reference/conversational-ai/rest-api/agent/join.md | rg "OpenAPI: /openapi/conversational-ai/convoai.yaml|Operation ID: start-agent|Method: POST|Path: /v2/projects/\\{appid\\}/join"
curl -fsS 'http://127.0.0.1:4173/api/search?query=start-agent&locale=en' -o /tmp/docs-portal-search.json
node -e "const fs=require('fs'); const items=JSON.parse(fs.readFileSync('/tmp/docs-portal-search.json','utf8')); const matches=items.filter(x=>String(x.url).includes('/api-reference/conversational-ai/rest-api/agent/join')); console.log(matches.length); if (!matches.length) process.exit(1);"
```

Expected: all commands succeed; search prints `1` or greater.

- [ ] **Step 9: Browser verification**

```bash
agent-browser --session docs-openapi-v2 open http://127.0.0.1:4173/en/api-reference/conversational-ai/rest-api/agent/join
agent-browser --session docs-openapi-v2 snapshot -i -c -d 5
agent-browser --session docs-openapi-v2 screenshot /tmp/docs-openapi-v2-join.png
agent-browser --session docs-openapi-v2 close
```

Expected snapshot includes:

- left nav item `Start a conversational AI agent POST`.
- page heading/summary for `Start a conversational AI agent`.
- method/path header `POST /v2/projects/{appid}/join`.
- Authorization or header parameter section when YAML exposes it.
- `Code & Examples`.
- cURL example.
- JavaScript example.
- response example.
- expanded schema path rows such as `properties.llm.url`.
- no `Execute`, `Send request`, or `Try it` button.
- no generic docs TOC rail.

Visual acceptance:

- reference screenshot and local screenshot are checked side by side.
- local page has a clear two-column API layout on desktop.
- right examples panel is sticky and polished.
- schema rows look like API field rows, not a raw table dump.
- no overlap/clipping/layout shift is visible.

- [ ] **Step 10: Final commit if verification required fixes**

If fixes were needed:

```bash
git status --short
git diff -- <changed-files>
git add <changed-files>
git commit -m "fix: verify openapi renderer v2"
```

If no fixes were needed, do not create an empty commit.
