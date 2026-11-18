// @vitest-environment node
import { createHash } from 'node:crypto';
import { createServer, type Server } from 'node:http';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { probeUrls } from './lib/cn-link-audit/network.mjs';

let server: Server;
let base: string;
let active = 0;
let peak = 0;
const hits = new Map<string, number>();
const html =
  '<!doctype html><title>Docs</title><main data-static-docs-body><h2 id="中文">Hello</h2><a name="legacy"></a></main>';

beforeAll(async () => {
  server = createServer((req, res) => {
    const path = req.url ?? '/';
    hits.set(path, (hits.get(path) ?? 0) + 1);
    if (path.startsWith('/slow') || path.startsWith('/concurrency')) {
      if (path.startsWith('/concurrency')) {
        active++;
        peak = Math.max(peak, active);
        res.on('close', () => {
          active--;
        });
      }
      setTimeout(() => res.end('okay'), 80);
      return;
    }
    if (path === '/retry' && hits.get(path) === 1) {
      res.writeHead(503).end();
      return;
    }
    if (path.startsWith('/status/')) {
      res.writeHead(Number(path.split('/').at(-1))).end();
      return;
    }
    if (
      path === '/redirect' ||
      path === '/login-redirect' ||
      path === '/loop'
    ) {
      res
        .writeHead(302, {
          location:
            path === '/redirect'
              ? '/docs#legacy'
              : path === '/loop'
                ? '/loop'
                : '/login',
        })
        .end();
      return;
    }
    if (path.startsWith('/chain/')) {
      res
        .writeHead(302, {
          location: `/chain/${Number(path.split('/').at(-1)) + 1}`,
        })
        .end();
      return;
    }
    if (path === '/clear-fragment') {
      res.writeHead(302, { location: '/docs#' }).end();
      return;
    }
    if (path === '/body-stall') {
      res.writeHead(200, { 'content-type': 'text/html' });
      res.write('<html>');
      return;
    }
    if (path === '/login-doc') {
      res.setHeader('content-type', 'text/html');
      res.end(
        '<html><head><title>登录服务</title></head><body><article><h1>登录服务</h1><div data-static-docs-body>登录服务的 SDK 使用文档。</div></article></body></html>',
      );
      return;
    }
    if (path === '/percent-id') {
      res.setHeader('content-type', 'text/html');
      res.end(
        '<html><main data-static-docs-body><h1 id="a%20b">Doc</h1></main></html>',
      );
      return;
    }
    if (path === '/disguised-html') {
      res.setHeader('content-type', 'image/png');
      res.end('<html><title>Docs</title><body>SPA</body></html>');
      return;
    }
    if (path === '/fake-download') {
      res.writeHead(200, { 'content-type': 'application/octet-stream' });
      res.end('<!doctype html><title>404 - Not Found</title>');
      return;
    }
    if (path === '/binary') {
      res.writeHead(200, {
        'content-type': 'application/zip',
        'content-length': '999999999',
      });
      res.write('PK');
      return;
    }
    if (path === '/empty') {
      res
        .writeHead(200, {
          'content-type': 'application/zip',
          'content-length': '0',
        })
        .end();
      return;
    }
    res.setHeader('content-type', 'text/html; charset=utf-8');
    if (path === '/error') res.end('<title>404 - Page not found</title>');
    else if (path === '/challenge') res.end('<title>Just a moment...</title>');
    else if (path === '/branded-auth')
      res.end(
        '<title>Acme</title><form><label>Password<input type="password"></label><button>Continue</button></form>',
      );
    else if (path === '/branded-challenge')
      res.end(
        '<title>Acme</title><form id="challenge-form">Checking your browser</form>',
      );
    else if (path === '/javascript-shell')
      res.end(
        '<title>Acme docs</title><style>body { color: red }</style><div id="root"></div><noscript>Enable JavaScript</noscript><script>bootstrap()</script>',
      );
    else if (path === '/hidden-shell')
      res.end(
        '<title>Acme docs</title><div hidden><p>Hidden</p><img src="/pixel.png"></div><span style="display:none">Loading</span><script>bootstrap()</script>',
      );
    else if (path === '/static-media')
      res.end('<title>Photo</title><img src="/photo.png" alt="A photograph">');
    else if (path === '/static-text')
      res.end('<title>Acme</title><p>Available documentation.</p>');
    else if (path === '/large') res.end(html.repeat(100));
    else res.end(html);
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (!address || typeof address === 'string')
    throw new Error('Missing fixture address');
  base = `http://127.0.0.1:${address.port}`;
});
beforeEach(() => {
  hits.clear();
  peak = 0;
});
afterAll(async () => {
  server.closeAllConnections();
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

describe('bounded link probes', () => {
  it('deduplicates fragments, preserves queries and extracts decoded HTML anchors and evidence', async () => {
    const urls = [
      `${base}/docs#%E4%B8%AD%E6%96%87`,
      `${base}/docs#legacy`,
      `${base}/docs?q=1`,
    ];
    const results = await probeUrls(urls);
    expect(hits.get('/docs')).toBe(1);
    expect(hits.get('/docs?q=1')).toBe(1);
    for (const url of urls) {
      expect(results.get(url)).toMatchObject({
        status: 'valid',
        httpStatus: 200,
        hasDocsBody: true,
        contentTitle: 'Docs',
        contentDigest: expect.stringMatching(/^[a-f0-9]{64}$/),
        anchors: ['中文', 'legacy'],
        digest: createHash('sha256').update(html).digest('hex'),
      });
      expect(Number.isNaN(Date.parse(results.get(url).checkedAt))).toBe(false);
    }
  });

  it('keeps a missing external fragment unverified', async () => {
    const url = `${base}/docs#client-generated`;
    expect((await probeUrls([url])).get(url)).toMatchObject({
      status: 'unverified',
      reason: 'fragment-not-in-html',
    });
  });

  it('distinguishes broken statuses from unavailable evidence and retries transient responses', async () => {
    const urls = [404, 410, 401, 403, 429, 500].map(
      (code) => `${base}/status/${code}`,
    );
    urls.push(`${base}/retry`);
    const results = await probeUrls(urls);
    expect(urls.map((url) => results.get(url).status)).toEqual([
      'broken',
      'broken',
      'unverified',
      'unverified',
      'unverified',
      'unverified',
      'valid',
    ]);
    expect(hits.get('/retry')).toBe(2);
  });

  it('records redirects and refuses login redirects and redirect loops', async () => {
    const urls = ['/redirect', '/login-redirect', '/loop'].map(
      (path) => base + path,
    );
    const results = await probeUrls(urls, { maxRedirects: 2 });
    expect(results.get(urls[0])).toMatchObject({
      status: 'valid',
      finalUrl: `${base}/docs#legacy`,
      redirects: [
        { from: `${base}/redirect`, to: `${base}/docs#legacy`, status: 302 },
      ],
    });
    expect(results.get(urls[1])).toMatchObject({
      status: 'unverified',
      reason: 'login-redirect',
    });
    expect(results.get(urls[2])).toMatchObject({
      status: 'unverified',
      reason: 'redirect-loop',
    });
  });

  it('detects error HTML and bot challenges despite successful HTTP statuses', async () => {
    const urls = ['/error', '/challenge'].map((path) => base + path);
    const results = await probeUrls(urls);
    expect(results.get(urls[0])).toMatchObject({
      status: 'broken',
      reason: 'error-page',
    });
    expect(results.get(urls[1])).toMatchObject({
      status: 'unverified',
      reason: 'access-challenge',
    });
  });

  it('bounds HTML bytes and request time without downloading binary bodies', async () => {
    const urls = ['/large', '/slow', '/binary', '/empty'].map(
      (path) => base + path,
    );
    const results = await probeUrls(urls, {
      maxBytes: 200,
      timeoutMs: 25,
      retries: 0,
    });
    expect(results.get(urls[0])).toMatchObject({
      status: 'unverified',
      reason: 'body-too-large',
    });
    expect(results.get(urls[1])).toMatchObject({
      status: 'unverified',
      reason: 'timeout',
    });
    expect(results.get(urls[2])).toMatchObject({
      status: 'valid',
      reason: 'reachable-resource',
      contentType: 'application/zip',
    });
    expect(results.get(urls[3])).toMatchObject({
      status: 'unverified',
      reason: 'empty-response',
    });
  });

  it('limits simultaneous requests to a host and reports each unique original URL', async () => {
    const urls = Array.from(
      { length: 6 },
      (_, index) => `${base}/concurrency?${index}`,
    );
    const progress: unknown[] = [];
    await probeUrls(urls, {
      concurrency: 4,
      hostConcurrency: 2,
      onProgress: (event: unknown) => progress.push(event),
    });
    expect(peak).toBeLessThanOrEqual(2);
    expect(peak).toBe(2);
    expect(progress).toHaveLength(6);
  });

  it('limits redirect chains and body reads, including HTML disguised as a download', async () => {
    const urls = ['/chain/0', '/body-stall', '/fake-download'].map(
      (path) => base + path,
    );
    const results = await probeUrls(urls, {
      timeoutMs: 40,
      retries: 0,
      maxRedirects: 2,
    });
    expect(results.get(urls[0])).toMatchObject({
      status: 'unverified',
      reason: 'too-many-redirects',
    });
    expect(results.get(urls[0]).redirects).toHaveLength(2);
    expect(results.get(urls[1])).toMatchObject({
      status: 'unverified',
      reason: 'timeout',
    });
    expect(results.get(urls[2])).toMatchObject({
      status: 'broken',
      reason: 'error-page',
      contentType: 'application/octet-stream',
    });
  });

  it('honors a redirect that explicitly clears the original fragment', async () => {
    const url = `${base}/clear-fragment#absent`;
    expect((await probeUrls([url])).get(url)).toMatchObject({
      status: 'valid',
      finalUrl: `${base}/docs#`,
    });
  });

  it('reports invalid inputs and rejects zero concurrency rather than silently skipping', async () => {
    const results = await probeUrls(['no URL', 'mailto:someone@example.com']);
    expect([...results.values()].map((result) => result.reason)).toEqual([
      'invalid-http-url',
      'invalid-http-url',
    ]);
    await expect(
      probeUrls([`${base}/docs`], { concurrency: 0 }),
    ).rejects.toThrow('Invalid concurrency');
  });
});

it('does not URL decode actual DOM IDs', async () => {
  const target = `${base}/percent-id#a%20b`;
  const result = (await probeUrls([target])).get(target);
  expect(result?.status).toBe('unverified');
  expect(result?.anchors).toContain('a%20b');
  expect(result?.anchors).not.toContain('a b');
});
it('exposes actual HTML sniffing even if its declared MIME type is an image', async () => {
  const target = `${base}/disguised-html`;
  expect((await probeUrls([target])).get(target)).toMatchObject({
    detectedHtml: true,
    contentType: 'image/png',
  });
});

it('keeps branded authentication and challenge pages unverified', async () => {
  const urls = ['/branded-auth', '/branded-challenge'].map(
    (path) => base + path,
  );
  const results = await probeUrls(urls);
  expect(results.get(urls[0])).toMatchObject({
    status: 'unverified',
    reason: 'authentication-required',
  });
  expect(results.get(urls[1])).toMatchObject({
    status: 'unverified',
    reason: 'access-challenge',
  });
});

it('requires browser verification for shells without visible body content', async () => {
  const urls = ['/javascript-shell', '/hidden-shell'].map(
    (path) => base + path,
  );
  const results = await probeUrls(urls);
  for (const url of urls)
    expect(results.get(url)).toMatchObject({
      status: 'unverified',
      reason: 'javascript-shell',
    });
});

it('still accepts ordinary static text and visible media pages', async () => {
  const urls = ['/static-text', '/static-media'].map((path) => base + path);
  const results = await probeUrls(urls);
  for (const url of urls)
    expect(results.get(url)).toMatchObject({
      status: 'valid',
      reason: 'reachable-html',
    });
});

it('does not confuse an actual documentation article about login with an auth challenge', async () => {
  const url = `${base}/login-doc`;
  expect((await probeUrls([url])).get(url)).toMatchObject({
    status: 'valid',
    hasDocsBody: true,
    contentTitle: '登录服务',
  });
});

describe('network fragment protocols', () => {
  it('keeps SPA hash routes unverified instead of treating them as missing DOM anchors', async () => {
    const url = `${base}/docs#/guide`;
    expect((await probeUrls([url])).get(url)).toMatchObject({
      status: 'unverified',
      reason: 'spa-route-needs-content-verification',
    });
  });

  it('accepts GitHub aliases only with real HTML anchors and both code range endpoints', async () => {
    const { networkFragmentFailure } = await import(
      './lib/cn-link-audit/network.mjs'
    );
    const anchors = ['user-content-安装', 'LC36', 'LC40'];
    expect(
      networkFragmentFailure(
        'https://github.com/org/repo#%E5%AE%89%E8%A3%85',
        anchors,
      ),
    ).toBeUndefined();
    expect(
      networkFragmentFailure('https://github.com/org/repo#L36-L40', anchors),
    ).toBeUndefined();
    expect(
      networkFragmentFailure('https://github.com/org/repo#L36', anchors),
    ).toBeUndefined();
    for (const url of [
      'https://github.com/org/repo#L36-L41',
      'https://github.com/org/repo#L40-L36',
      'https://github.com/org/repo#missing',
      'https://example.com/org/repo#安装',
      'https://example.com/org/repo#L36',
      'https://github.com.example.com/org/repo#L36',
    ])
      expect(networkFragmentFailure(url, anchors)).toEqual({
        status: 'unverified',
        reason: 'fragment-not-in-html',
      });
    expect(
      networkFragmentFailure('https://github.com/org/repo#L36-L40', [
        'L36-L40',
      ]),
    ).toEqual({ status: 'unverified', reason: 'fragment-not-in-html' });
    expect(
      networkFragmentFailure('https://example.com/#/guide', ['/guide']),
    ).toEqual({
      status: 'unverified',
      reason: 'spa-route-needs-content-verification',
    });
  });
});

describe('GitHub exact and mixed line endpoints', () => {
  it.each([
    ['L36', 'L40'],
    ['L36', 'LC40'],
    ['LC36', 'L40'],
  ])('accepts real endpoint IDs %s and %s', async (start, end) => {
    const { networkFragmentFailure } = await import(
      './lib/cn-link-audit/network.mjs'
    );
    expect(
      networkFragmentFailure('https://github.com/org/repo#L36', [start]),
    ).toBeUndefined();
    expect(
      networkFragmentFailure('https://github.com/org/repo#L36-L40', [
        start,
        end,
      ]),
    ).toBeUndefined();
    expect(
      networkFragmentFailure('https://github.com/org/repo#L36-L40', [start]),
    ).toMatchObject({ reason: 'fragment-not-in-html' });
    expect(
      networkFragmentFailure('https://github.com/org/repo#L40-L36', [
        start,
        end,
      ]),
    ).toMatchObject({ reason: 'fragment-not-in-html' });
  });
});
