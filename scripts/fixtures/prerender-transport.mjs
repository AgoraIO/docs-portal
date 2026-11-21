import { createServer } from 'node:http';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const [mode, output, retryCount = '2'] = process.argv.slice(2);
const { prerender } = await import(
  pathToFileURL(
    resolve('node_modules/@tanstack/start-plugin-core/dist/esm/prerender.js'),
  )
);
const attempts = {};
const server = createServer((request, response) => {
  const path = request.url;
  attempts[path] = (attempts[path] ?? 0) + 1;
  const broken = path.startsWith('/broken/');
  if (broken && mode === 'http-error') {
    response.writeHead(404).end('missing');
    return;
  }
  if (
    broken &&
    mode !== 'healthy' &&
    (mode === 'permanent' || attempts[path] === 1)
  ) {
    if (mode === 'body-reset') {
      response.writeHead(200, { 'content-type': 'text/html' });
      response.write('<html>partial');
      setTimeout(() => request.socket.resetAndDestroy(), 10);
    } else {
      request.socket.resetAndDestroy();
    }
    return;
  }
  response.writeHead(200, { 'content-type': 'text/html' });
  response.end(
    mode === 'crawl' && path === '/healthy/'
      ? '<html><a href="/broken/a">one</a><a href="/broken/a">duplicate</a></html>'
      : `<html><body>complete:${path}</body></html>`,
  );
});
await new Promise((done) => server.listen(0, '127.0.0.1', done));
const origin = `http://127.0.0.1:${server.address().port}`;
const startConfig = {
  router: { basepath: '/' },
  pages: [{ path: '/broken/a' }, { path: '/healthy' }, { path: '/broken/b' }],
  prerender: {
    enabled: true,
    crawlLinks: false,
    autoStaticPathsDiscovery: false,
    concurrency: 2,
    retryCount: Number(retryCount),
    retryDelay: 1,
    failOnError: true,
  },
};
if (mode === 'crawl') {
  startConfig.pages = [{ path: '/healthy' }];
  startConfig.prerender.crawlLinks = true;
}
try {
  await prerender({
    startConfig,
    handler: {
      getClientOutputDirectory: () => output,
      getOrigin: () => origin,
      request: (path, options) => fetch(new URL(path, origin), options),
      close: () =>
        new Promise((done) => {
          server.closeAllConnections();
          server.close(done);
        }),
    },
  });
  console.log(
    `RESULT:${JSON.stringify({ attempts, status: 'complete', pages: startConfig.pages.map((page) => page.path) })}`,
  );
} catch (error) {
  console.log(
    `RESULT:${JSON.stringify({ attempts, status: 'failed', message: error.message })}`,
  );
  process.exitCode = 1;
}
