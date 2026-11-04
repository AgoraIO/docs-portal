import { spawnSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, expect, it } from 'vitest';

const temporaryDirectories: string[] = [];
afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((dir) => rm(dir, { recursive: true, force: true })),
  );
});

it('rejects retained SDK history in an index snapshot even when its HTML and anchors still exist', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'cn-history-index-'));
  temporaryDirectories.push(root);
  const current = '/zh-CN/api-reference/rtc/android/channel';
  const history = '/zh-CN/api-reference/rtc/android/4.6.0/channel';
  await mkdir(path.join(root, '__static/docs-search'), { recursive: true });
  await writeFile(
    path.join(root, '__static/docs-routes.json'),
    JSON.stringify([
      { url: current, canonicalPath: current, version: '4.7.0' },
      // Retained history stays readable but is not an active publication.
      { url: history, canonicalPath: history },
    ]),
  );
  await writeFile(
    path.join(root, '__static/docs-search/zh-CN.json'),
    JSON.stringify([{ url: current }]),
  );
  for (const url of [current, history]) {
    await mkdir(path.join(root, url), { recursive: true });
    await writeFile(
      path.join(root, url, 'index.html'),
      '<h2 id="joinchannel">joinChannel</h2>',
    );
  }
  await writeFile(
    path.join(root, 'sitemap.xml'),
    `<urlset>${[current, history].map((url) => `<url><loc>https://docs.example${url}</loc></url>`).join('')}</urlset>`,
  );
  await writeFile(
    path.join(root, 'records.json'),
    JSON.stringify(
      [current, history].map((url, index) => ({
        id: String(index),
        url: `${url}#joinchannel`,
        canonicalUrl: url,
        locale: 'zh-CN',
        docType: 'docs',
        version: index === 0 ? '4.7.0' : '4.6.0',
      })),
    ),
  );
  const reportPath = path.join(root, 'report.json');
  const result = spawnSync(
    process.execPath,
    [
      'scripts/search/audit-cn-coverage.mjs',
      `--records=${path.join(root, 'records.json')}`,
      `--html=${root}`,
      `--out=${reportPath}`,
    ],
    { encoding: 'utf8' },
  );
  const report = JSON.parse(await readFile(reportPath, 'utf8'));
  expect(result.status, result.stderr).toBe(1);
  expect(report.findings.nonSearchableRecords).toEqual([
    `${history.replace('/zh-CN', '')}#joinchannel`,
  ]);
  expect(report.findings.missingHtml).toEqual([]);
  expect(report.findings.invalidIndexedAnchors).toEqual([]);
  expect(report.findings.routeVersionMismatch).toEqual([]);
});

it('accepts the published platform, OpenAPI and FAQ records from the same search snapshot', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'cn-published-index-'));
  temporaryDirectories.push(root);
  const routes = [
    {
      url: '/zh-CN/realtime-media/rtc/build/token-authentication/ios',
      canonicalPath: '/zh-CN/realtime-media/rtc/build/token-authentication',
      platform: 'ios',
      version: '4.7.0',
      docType: 'docs',
    },
    {
      url: '/zh-CN/api-reference/api-ref/cloud-recording/start',
      canonicalPath: '/zh-CN/api-reference/api-ref/cloud-recording/start',
      docType: 'openapi',
    },
    {
      url: '/zh-CN/reference/faq/account/billing_basis',
      canonicalPath: '/zh-CN/reference/faq/account/billing_basis',
      docType: 'docs',
    },
  ];
  await mkdir(path.join(root, '__static/docs-search'), { recursive: true });
  await writeFile(
    path.join(root, '__static/docs-routes.json'),
    JSON.stringify(routes),
  );
  await writeFile(
    path.join(root, '__static/docs-search/zh-CN.json'),
    JSON.stringify(routes.map((route) => ({ url: route.canonicalPath }))),
  );
  for (const route of routes) {
    await mkdir(path.join(root, route.url), { recursive: true });
    await writeFile(
      path.join(root, route.url, 'index.html'),
      '<h2 id="details">说明</h2>',
    );
  }
  await writeFile(
    path.join(root, 'sitemap.xml'),
    `<urlset>${routes.map((route) => `<url><loc>https://docs.example${route.url}</loc></url>`).join('')}</urlset>`,
  );
  await writeFile(
    path.join(root, 'records.json'),
    JSON.stringify(
      routes.map((route, index) => ({
        id: String(index),
        url: `${route.url.replace('/zh-CN', '')}#details`,
        canonicalUrl: route.canonicalPath.replace('/zh-CN', ''),
        locale: 'zh-CN',
        docType: route.docType,
        platform: route.platform ? [route.platform] : undefined,
        version: route.version,
      })),
    ),
  );
  const reportPath = path.join(root, 'report.json');
  const result = spawnSync(
    process.execPath,
    [
      'scripts/search/audit-cn-coverage.mjs',
      `--records=${path.join(root, 'records.json')}`,
      `--html=${root}`,
      `--out=${reportPath}`,
    ],
    { encoding: 'utf8' },
  );
  expect(result.status, result.stderr).toBe(0);
  const report = JSON.parse(await readFile(reportPath, 'utf8'));
  expect(report.findings.nonSearchableRecords).toEqual([]);
  expect(report.counts.checkedPages).toBe(3);
});

it.each(['/zh-CN', ''])(
  'audits unprefixed results against %s build artifacts',
  async (prefix) => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'cn-url-audit-'));
    temporaryDirectories.push(root);
    const publicPath = '/realtime-media/rtc/build/token-authentication/ios';
    const buildPath = `${prefix}${publicPath}`;
    const canonicalPath = `${prefix}/realtime-media/rtc/build/token-authentication`;
    await mkdir(path.join(root, '__static/docs-search'), { recursive: true });
    await mkdir(path.join(root, buildPath, 'index.html', '..'), {
      recursive: true,
    });
    await writeFile(
      path.join(root, buildPath, 'index.html'),
      '<h2 id="token">Token</h2>',
    );
    await writeFile(
      path.join(root, '__static/docs-routes.json'),
      JSON.stringify([
        { url: buildPath, canonicalPath, platform: 'ios', version: '4.6.0' },
      ]),
    );
    await writeFile(
      path.join(root, '__static/docs-search/zh-CN.json'),
      JSON.stringify([{ url: canonicalPath }]),
    );
    await writeFile(
      path.join(root, 'sitemap.xml'),
      `<urlset><url><loc>https://docs.example${buildPath}</loc></url></urlset>`,
    );
    await writeFile(
      path.join(root, 'records.json'),
      JSON.stringify([
        {
          id: 'token',
          url: `${publicPath}#token`,
          canonicalUrl: '/realtime-media/rtc/build/token-authentication',
          locale: 'zh-CN',
          platform: ['ios'],
          version: '4.6.0',
          docType: 'docs',
        },
      ]),
    );
    const reportPath = path.join(root, 'report.json');
    const result = spawnSync(
      process.execPath,
      [
        'scripts/search/audit-cn-coverage.mjs',
        `--records=${path.join(root, 'records.json')}`,
        `--html=${root}`,
        `--out=${reportPath}`,
      ],
      { encoding: 'utf8' },
    );
    expect(result.status, result.stderr).toBe(0);
    const report = JSON.parse(await readFile(reportPath, 'utf8'));
    expect(report.counts).toMatchObject({
      checkedPages: 1,
      fragments: 1,
      platformVariantPages: 1,
    });
    expect(report.findings.unknownRoutes).toEqual([]);
    expect(report.findings.invalidIndexedAnchors).toEqual([]);
  },
);

it.each(['/zh-CN', ''])(
  'reports excluded products separately for %s build paths',
  async (prefix) => {
    const { result, report } = await auditProductFixture(prefix);
    expect(result.status, result.stderr).toBe(0);
    expect(report.exclusions.excludedProducts).toEqual([
      '/api-reference/api-ref/danmaku/start-cloud-game',
    ]);
    expect(report.coverageExceptions.unexpectedEligibleWithoutRecords).toEqual(
      [],
    );
  },
);

it('still blocks missing records for a non-excluded product with a similar name', async () => {
  const missing = '/api-reference/api-ref/danmaku-extra/start-cloud-game';
  const { result, report } = await auditProductFixture('', { missing });
  expect(result.status).toBe(1);
  expect(report.coverageExceptions.unexpectedEligibleWithoutRecords).toEqual([
    missing,
  ]);
});

it('blocks excluded products that leak into the exported records', async () => {
  const { result, report } = await auditProductFixture('', {
    indexExcluded: true,
  });
  expect(result.status).toBe(1);
  expect(report.findings.excludedProductRecords).toEqual([
    '/api-reference/api-ref/danmaku/start-cloud-game#game',
  ]);
});

async function auditProductFixture(
  prefix: string,
  {
    missing,
    indexExcluded = false,
  }: { missing?: string; indexExcluded?: boolean } = {},
) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'cn-product-audit-'));
  temporaryDirectories.push(root);
  const ordinary = '/api-reference/rtc/android/channel';
  const excluded = '/api-reference/api-ref/danmaku/start-cloud-game';
  const urls = [ordinary, excluded, ...(missing ? [missing] : [])];
  await mkdir(path.join(root, '__static/docs-search'), { recursive: true });
  for (const url of urls) {
    await mkdir(path.join(root, `${prefix}${url}`), { recursive: true });
    await writeFile(
      path.join(root, `${prefix}${url}`, 'index.html'),
      '<h2 id="game">Game</h2>',
    );
  }
  await writeFile(
    path.join(root, '__static/docs-routes.json'),
    JSON.stringify(
      urls.map((url) => ({
        url: `${prefix}${url}`,
        canonicalPath: `${prefix}${url}`,
      })),
    ),
  );
  await writeFile(
    path.join(root, '__static/docs-search/zh-CN.json'),
    JSON.stringify(urls.map((url) => ({ url: `${prefix}${url}` }))),
  );
  await writeFile(
    path.join(root, 'sitemap.xml'),
    `<urlset>${urls.map((url) => `<url><loc>https://docs.example${prefix}${url}</loc></url>`).join('')}</urlset>`,
  );
  const records = [ordinary, ...(indexExcluded ? [excluded] : [])].map(
    (url) => ({
      id: url,
      url: `${url}#game`,
      canonicalUrl: url,
      locale: 'zh-CN',
      docType: 'docs',
    }),
  );
  const recordsPath = path.join(root, 'records.json');
  const reportPath = path.join(root, 'report.json');
  await writeFile(recordsPath, JSON.stringify(records));
  const result = spawnSync(
    process.execPath,
    [
      'scripts/search/audit-cn-coverage.mjs',
      `--records=${recordsPath}`,
      `--html=${root}`,
      `--out=${reportPath}`,
    ],
    { encoding: 'utf8' },
  );
  return { result, report: JSON.parse(await readFile(reportPath, 'utf8')) };
}
