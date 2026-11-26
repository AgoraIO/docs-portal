// @vitest-environment node
import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from 'node:http';
import { afterEach, expect, it, vi } from 'vitest';
import { createSearchIndexClient } from './meilisearch-index.server';

const realTimeout = AbortSignal.timeout.bind(AbortSignal);
afterEach(() => vi.restoreAllMocks());

async function withServer(
  handle: (
    request: IncomingMessage,
    response: ServerResponse,
  ) => Promise<void> | void,
  run: (origin: string) => Promise<void>,
) {
  const server = createServer((request, response) => {
    Promise.resolve(handle(request, response)).catch((error) =>
      response.destroy(error),
    );
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (!address || typeof address === 'string')
    throw new Error('Missing test port');
  try {
    await run(`http://127.0.0.1:${address.port}`);
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

function deadline() {
  // Exercise a real HTTP timeout without waiting for the production 30 seconds.
  vi.spyOn(AbortSignal, 'timeout').mockImplementation(() => realTimeout(200));
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  return vi.spyOn(console, 'error').mockImplementation(() => {});
}

function json(response: ServerResponse, value: unknown, status = 200) {
  response.writeHead(status, { 'content-type': 'application/json' });
  response.end(JSON.stringify(value));
}

it('recovers an accepted document batch whose acknowledgement times out without duplicating documents', async () => {
  deadline();
  const documents = new Map<string, unknown>();
  const payloads: string[] = [];
  await withServer(
    async (request, response) => {
      if (
        request.method === 'POST' &&
        request.url === '/indexes/docs_test/documents'
      ) {
        let payload = '';
        for await (const chunk of request) payload += chunk;
        payloads.push(payload);
        for (const document of JSON.parse(payload))
          documents.set(document.id, document);
        // The server accepted the first write, but the client never receives its task ID.
        if (payloads.length === 1) return;
        json(response, { taskUid: 4 }, 202);
      } else if (request.url === '/tasks/4')
        json(response, { status: 'succeeded' });
      else json(response, {}, 404);
    },
    async (host) => {
      const client = createSearchIndexClient({
        host,
        writeKey: 'test-write-key',
        taskKey: 'test-task-key',
      });
      await client.documents('docs_test', [{ id: 'one', title: 'Token' }]);
      expect([...documents.values()]).toEqual([{ id: 'one', title: 'Token' }]);
      expect(payloads).toHaveLength(2);
      expect(payloads[1]).toBe(payloads[0]);
    },
  );
});

it.each(['headers', 'body'])(
  'recovers a timed-out read before %s completion with a fresh request deadline',
  async (phase) => {
    deadline();
    let requests = 0;
    await withServer(
      (_request, response) => {
        if (++requests === 1) {
          if (phase === 'body') {
            response.writeHead(200, { 'content-type': 'application/json' });
            response.write('{"numberOfDocuments":');
          }
          return;
        }
        json(response, { numberOfDocuments: 12 });
      },
      async (host) => {
        const client = createSearchIndexClient({
          host,
          writeKey: 'test-write-key',
        });
        await expect(client.count('docs_test')).resolves.toBe(12);
        expect(requests).toBe(2);
      },
    );
  },
);

it.each(['headers', 'body'])(
  'preserves terminal transport diagnostics after repeated %s timeouts',
  async (phase) => {
    const terminal = deadline();
    let requests = 0;
    await withServer(
      (_request, response) => {
        requests++;
        if (phase === 'body') {
          response.writeHead(200, { 'content-type': 'application/json' });
          response.write('{"numberOfDocuments":');
        }
      },
      async (host) => {
        const client = createSearchIndexClient({
          host,
          writeKey: 'private-test-key',
        });
        let failure: unknown;
        try {
          await client.count('docs_test');
        } catch (error) {
          failure = error;
        }
        expect(requests).toBe(3);
        expect(String(failure)).toContain('GET /indexes/docs_test/stats');
        expect(String(failure)).toContain('3 attempts');
        expect(String(failure)).toContain('TimeoutError');
        expect(String(failure)).not.toContain('HTTP 200');
        expect(failure).toMatchObject({
          cause: { name: 'TimeoutError', code: 23 },
        });
        expect(terminal).toHaveBeenCalledOnce();
        const log = String(terminal.mock.calls[0][0]);
        expect(log).toMatch(/^\[search-index\] Request failed /);
        const details = JSON.parse(log.slice(log.indexOf('{')));
        expect(details).toMatchObject({
          method: 'GET',
          path: '/indexes/docs_test/stats',
          attempt: 3,
          payloadBytes: 0,
          error: 'TimeoutError',
          code: 23,
        });
        expect(details.elapsedMs).toBeGreaterThanOrEqual(100);
        if (phase === 'body') expect(details.status).toBe(200);
        else expect(details).not.toHaveProperty('status');
        expect(`${String(failure)} ${log}`).not.toContain('private-test-key');
      },
    );
  },
);

it.each(['swap', 'create', 'settings'] as const)(
  'records terminal diagnostics without retrying an accepted %s mutation whose response body times out',
  async (operation) => {
    const terminal = deadline();
    let mutations = 0;
    let payload = '';
    await withServer(
      async (request, response) => {
        for await (const chunk of request) payload += chunk;
        mutations++;
        response.writeHead(202, { 'content-type': 'application/json' });
        response.write('{"taskUid":');
      },
      async (host) => {
        const client = createSearchIndexClient({
          host,
          writeKey: 'private-test-key',
        });
        const request =
          operation === 'swap'
            ? client.swap('live', 'staged')
            : operation === 'create'
              ? client.createIndex('staged')
              : client.settings('staged');
        let failure: unknown;
        try {
          await request;
        } catch (error) {
          failure = error;
        }
        expect(mutations).toBe(1);
        expect(vi.mocked(console.warn)).not.toHaveBeenCalled();
        expect(String(failure)).toContain('TimeoutError');
        expect(String(failure)).not.toContain('HTTP 202');
        expect(failure).toMatchObject({
          cause: { name: 'TimeoutError', code: 23 },
        });
        expect(terminal).toHaveBeenCalledOnce();
        const log = String(terminal.mock.calls[0][0]);
        const details = JSON.parse(log.slice(log.indexOf('{')));
        expect(details).toMatchObject({
          method: operation === 'settings' ? 'PATCH' : 'POST',
          path:
            operation === 'swap'
              ? '/swap-indexes'
              : operation === 'create'
                ? '/indexes'
                : '/indexes/staged/settings',
          attempt: 1,
          payloadBytes: Buffer.byteLength(payload),
          error: 'TimeoutError',
          code: 23,
          status: 202,
        });
        expect(details.elapsedMs).toBeGreaterThanOrEqual(100);
        expect(details.payloadBytes).toBeGreaterThan(0);
        expect(`${String(failure)} ${log}`).not.toContain('private-test-key');
      },
    );
  },
);

it.each(['swap', 'create'] as const)(
  'does not repeat an ambiguous %s mutation after a timeout',
  async (operation) => {
    deadline();
    let mutations = 0;
    await withServer(
      async (request) => {
        for await (const _chunk of request) {
          /* Consume the accepted mutation. */
        }
        mutations++;
      },
      async (host) => {
        const client = createSearchIndexClient({
          host,
          writeKey: 'test-write-key',
        });
        await expect(
          operation === 'swap'
            ? client.swap('live', 'staged')
            : client.createIndex('staged'),
        ).rejects.toThrow();
        expect(mutations).toBe(1);
      },
    );
  },
);

it('fails authorization errors immediately without retrying', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  let requests = 0;
  await withServer(
    (_request, response) => {
      requests++;
      json(response, { message: 'Forbidden' }, 403);
    },
    async (host) => {
      const client = createSearchIndexClient({
        host,
        writeKey: 'test-write-key',
      });
      await expect(client.count('docs_test')).rejects.toThrow('HTTP 403');
      expect(requests).toBe(1);
    },
  );
});
