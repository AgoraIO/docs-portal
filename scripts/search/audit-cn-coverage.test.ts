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
