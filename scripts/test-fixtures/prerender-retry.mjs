import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const { prerender } = await import(
  new URL(
    '../prerender.js',
    import.meta.resolve('@tanstack/start-plugin-core/vite'),
  )
);
const mode = process.argv[2];
const output = await mkdtemp(join(tmpdir(), 'docs-prerender-retry-'));
const attempts = new Map();
const server = createServer((request, response) => {
  const count = (attempts.get(request.url) ?? 0) + 1;
  attempts.set(request.url, count);
  console.log(`REQUEST ${request.url} ${count}`);
  if (mode === 'permanent-reset' || (mode === 'reset-once' && count === 1)) {
    request.socket.resetAndDestroy();
    return;
  }
  response.setHeader('Content-Type', 'text/html');
  response.statusCode = mode === 'http-error' ? 500 : 200;
  response.end('<h1>Complete document</h1><a href="/doc">Same page</a>');
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
try {
  await prerender({
    startConfig: {
      pages: [{ path: '/doc' }, { path: '/other' }],
      router: { basepath: '/' },
      prerender: {
        enabled: true,
        autoStaticPathsDiscovery: false,
        crawlLinks: true,
        retryCount: 2,
        retryDelay: 1,
        failOnError: true,
        concurrency: 1,
      },
    },
    handler: {
      getClientOutputDirectory: () => output,
      getOrigin: () => origin,
      request: (path, options) =>
        fetch(new Request(new URL(path, origin), options)),
      close: async () => {
        server.closeAllConnections();
        await new Promise((resolve) => server.close(resolve));
      },
    },
  });
  for (const path of ['doc', 'other']) {
    assert.match(
      await readFile(join(output, path, 'index.html'), 'utf8'),
      /Complete document/,
    );
    assert.equal(attempts.get(`/${path}/`), mode === 'reset-once' ? 2 : 1);
  }
  console.log('COMPLETE: both HTML pages written exactly once');
} finally {
  server.closeAllConnections();
  server.close();
  await rm(output, { recursive: true, force: true });
}
