import { createServer } from 'node:http';
import {
  type BailianSearchAnswerService,
  createBailianSearchAnswer,
} from '../../src/lib/ai/bailian-search-answer';
import { createSearchDocsTool } from '../../src/lib/search/search-docs-tool';

export type {
  BailianAnswer,
  BailianSearchAnswerService,
} from '../../src/lib/ai/bailian-search-answer';
export type AskDocsService = BailianSearchAnswerService;

const corsHeaders = {
  'Access-Control-Allow-Headers': 'content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Origin': '*',
};

function jsonResponse(
  body: unknown,
  status = 200,
  headers: Record<string, string> = {},
) {
  return Response.json(body, {
    status,
    headers: { ...corsHeaders, ...headers },
  });
}

export function createAskDocsRequestHandler(service: AskDocsService) {
  return async (request: Request): Promise<Response> => {
    const url = new URL(request.url);
    if (url.pathname !== '/api/ask-docs') {
      return jsonResponse({ error: 'not found' }, 404);
    }
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }
    if (request.method !== 'POST') {
      return jsonResponse({ error: 'method not allowed' }, 405, {
        Allow: 'POST, OPTIONS',
      });
    }

    let input: unknown;
    try {
      input = await request.json();
    } catch {
      return jsonResponse({ error: 'invalid JSON body' }, 400);
    }
    if (
      !input ||
      typeof input !== 'object' ||
      Array.isArray(input) ||
      typeof (input as { question?: unknown }).question !== 'string' ||
      !(input as { question: string }).question.trim()
    ) {
      return jsonResponse({ error: 'question is required' }, 400);
    }

    try {
      return jsonResponse(
        await service.ask((input as { question: string }).question),
      );
    } catch (error) {
      if (error instanceof Error && /question/.test(error.message)) {
        return jsonResponse({ error: error.message }, 400);
      }
      return jsonResponse({ error: 'AI service unavailable' }, 502);
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
  const port = Number(process.env.ASK_DOCS_PORT ?? 8788);
  const searchDocs = createSearchDocsTool({
    host: process.env.MEILI_HOST ?? 'http://127.0.0.1:7700',
    masterKey: process.env.MEILI_MASTER_KEY ?? '',
  });
  const service = createBailianSearchAnswer({
    apiKey: process.env.DASHSCOPE_API_KEY ?? '',
    model: process.env.BAILIAN_MODEL ?? 'qwen-plus',
    baseUrl: process.env.BAILIAN_BASE_URL,
    searchDocs,
  });
  const handler = createAskDocsRequestHandler(service);
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
        { 'content-type': 'application/json' },
      );
      response.end(JSON.stringify({ error: 'invalid request' }));
    }
  });
  server.listen(port, () => {
    console.log(`ask-docs backend listening on http://127.0.0.1:${port}`);
  });
}
