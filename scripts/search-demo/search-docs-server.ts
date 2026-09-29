import { createServer } from 'node:http';
import {
  createSearchDocsTool,
  type SearchDocsTool,
} from '../../src/lib/search/search-docs-tool';

export type { SearchDocsTool } from '../../src/lib/search/search-docs-tool';

export function createSearchDocsRequestHandler(tool: SearchDocsTool) {
  return async (request: Request): Promise<Response> => {
    const url = new URL(request.url);
    if (url.pathname !== '/api/search-docs') {
      return Response.json({ error: 'not found' }, { status: 404 });
    }
    if (request.method !== 'POST') {
      return Response.json(
        { error: 'method not allowed' },
        { status: 405, headers: { Allow: 'POST' } },
      );
    }

    let input: unknown;
    try {
      input = await request.json();
    } catch {
      return Response.json({ error: 'invalid JSON body' }, { status: 400 });
    }
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
      return Response.json(
        { error: 'invalid search_docs input' },
        { status: 400 },
      );
    }

    try {
      return Response.json(
        await tool.searchDocs(
          input as Parameters<SearchDocsTool['searchDocs']>[0],
        ),
      );
    } catch (error) {
      if (
        error instanceof Error &&
        /query|filter|locale|invalid search_docs input/.test(error.message)
      ) {
        return Response.json({ error: error.message }, { status: 400 });
      }
      return Response.json(
        { error: 'search service unavailable' },
        { status: 502 },
      );
    }
  };
}

async function readRequestBody(request: import('node:http').IncomingMessage) {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > 32 * 1024) throw new Error('request body too large');
    chunks.push(buffer);
  }
  return Buffer.concat(chunks).toString('utf8');
}

if (import.meta.main) {
  const port = Number(process.env.SEARCH_DOCS_PORT ?? 8787);
  const tool = createSearchDocsTool({
    host: process.env.MEILI_HOST ?? 'http://127.0.0.1:7700',
    masterKey: process.env.MEILI_MASTER_KEY ?? '',
  });
  const handler = createSearchDocsRequestHandler(tool);
  const server = createServer(async (request, response) => {
    try {
      const body = await readRequestBody(request);
      const requestUrl = `http://${request.headers.host ?? `127.0.0.1:${port}`}${request.url ?? '/'}`;
      const result = await handler(
        new Request(requestUrl, {
          method: request.method,
          headers: request.headers as Record<string, string>,
          body: body || undefined,
        }),
      );
      response.writeHead(result.status, Object.fromEntries(result.headers));
      response.end(await result.text());
    } catch (error) {
      response.writeHead(
        error instanceof Error && error.message === 'request body too large'
          ? 413
          : 400,
        {
          'content-type': 'application/json',
        },
      );
      response.end(JSON.stringify({ error: 'invalid request' }));
    }
  });
  server.listen(port, () => {
    console.log(`search_docs backend listening on http://127.0.0.1:${port}`);
  });
}
