import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { expect, it } from 'vitest';

it.each([
  'ready',
  'missing',
  'soft-404',
  'redirect-to-prefixed',
  'external-redirect',
  'old-index',
  'missing-url',
  'query-preserved',
  'dropped-query',
])(
  'checks the deployed public destinations before promotion: %s',
  async (scenario) => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'cn-public-url-check-'));
    const requests: string[] = [];
    const canonicalUrl = '/realtime-media/rtc/build/token-authentication';
    const query = ['query-preserved', 'dropped-query'].includes(scenario)
      ? '?platform=ios'
      : '';
    const html =
      '<!doctype html><html><body><h1>Token</h1><h2 id="token">生成 Token</h2></body></html>';
    const routes = [canonicalUrl, `${canonicalUrl}/ios`].map((url) => ({
      url: `/zh-CN${url}`,
      canonicalPath: `/zh-CN${canonicalUrl}`,
    }));
    await mkdir(path.join(root, '__static'), { recursive: true });
    await writeFile(
      path.join(root, '__static/docs-routes.json'),
      JSON.stringify(routes),
    );
    for (const route of routes) {
      await mkdir(path.join(root, `.${route.url}`), { recursive: true });
      await writeFile(path.join(root, `.${route.url}/index.html`), html);
    }
    const server = createServer((req, res) => {
      const requestUrl = req.url ?? '/';
      const request = new URL(requestUrl, 'http://localhost');
      requests.push(requestUrl);
      res.setHeader('content-type', 'text/html; charset=utf-8');
      if (scenario === 'missing') res.statusCode = 404;
      else if (
        scenario === 'redirect-to-prefixed' ||
        scenario === 'external-redirect'
      ) {
        res.statusCode = 301;
        res.setHeader(
          'location',
          scenario === 'external-redirect'
            ? 'https://evil.example/'
            : `/zh-CN${requestUrl}`,
        );
      } else if (!request.pathname.endsWith('/')) {
        res.statusCode = 301;
        res.setHeader(
          'location',
          `${request.pathname}/${scenario === 'dropped-query' ? '' : request.search}`,
        );
      }
      res.end(
        scenario === 'soft-404' ? '<html><h1>Not found</h1></html>' : html,
      );
    });
    await new Promise<void>((resolve) =>
      server.listen(0, '127.0.0.1', resolve),
    );
    try {
      const address = server.address() as { port: number };
      await writeFile(
        path.join(root, 'records.json'),
        JSON.stringify([
          {
            url:
              scenario === 'missing-url'
                ? undefined
                : `${scenario === 'old-index' ? '/zh-CN' : ''}${canonicalUrl}/ios${query}#token`,
            canonicalUrl,
            locale: 'zh-CN',
          },
          {
            url: `${canonicalUrl}/ios${query}#renew-token`,
            canonicalUrl,
            locale: 'zh-CN',
          },
        ]),
      );
      const reportPath = path.join(root, 'report.json');
      const { code, stderr } = await new Promise<{
        code: number | null;
        stderr: string;
      }>((resolve, reject) => {
        const child = spawn(process.execPath, [
          'scripts/search/verify-cn-public-urls.mjs',
          `--origin=http://127.0.0.1:${address.port}`,
          `--records=${path.join(root, 'records.json')}`,
          `--html=${root}`,
          `--out=${reportPath}`,
        ]);
        let stderr = '';
        child.stderr.on('data', (data) => {
          stderr += data;
        });
        child.once('error', reject);
        child.once('exit', (code) => resolve({ code, stderr }));
      });
      if (scenario === 'ready' || scenario === 'query-preserved') {
        expect(code, stderr).toBe(0);
        const report = JSON.parse(await readFile(reportPath, 'utf8'));
        expect(report).toMatchObject({
          status: 'PASS',
          checked: 2,
          failures: [],
        });
        expect(requests).toHaveLength(4);
        if (query)
          expect(
            requests.filter((url) => url.includes('platform=ios')),
          ).toHaveLength(2);
      } else {
        expect(code).not.toBe(0);
        if (scenario === 'old-index' || scenario === 'missing-url') {
          expect(requests).toEqual([]);
          expect(stderr).toContain('Re-export the complete index');
        } else {
          const report = JSON.parse(await readFile(reportPath, 'utf8'));
          expect(report.status).toBe('FAIL');
          expect(report.failures.length).toBeGreaterThan(0);
          if (scenario === 'soft-404')
            expect(report.failures[0].error).toContain(
              'Public HTML must match',
            );
        }
      }
    } finally {
      server.closeAllConnections();
      await new Promise<void>((resolve) => server.close(() => resolve()));
      await rm(root, { recursive: true, force: true });
    }
  },
);
