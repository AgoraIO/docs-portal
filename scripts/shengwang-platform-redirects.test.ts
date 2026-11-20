import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import regressions from './fixtures/shengwang-platform-redirects.json';
import { collectCurrentDocTargets } from './shengwang-redirect-targets.mjs';

const readJson = (file: string) => JSON.parse(readFileSync(file, 'utf8'));
const finalMap = readJson('docs/migration/redirect-inputs/legacy-url-map.json');
const vercel = readJson(
  'docs/migration/redirect-inputs/legacy-url-redirects.vercel.json',
);
const nginx = readFileSync(
  'docs/migration/redirect-inputs/legacy-url-redirects.nginx.conf',
  'utf8',
);
const appConfig = readJson('vercel.json');

describe('reviewed platform destinations from the cutover content audit', () => {
  it('covers all 81 distinct affected entrances with admitted current destinations', async () => {
    const targets = await collectCurrentDocTargets('content/docs/zh-CN');
    expect(regressions).toHaveLength(81);
    expect(new Set(regressions.map((row) => row.source)).size).toBe(81);
    for (const row of regressions) {
      expect(targets.has(row.target), row.target).toBe(true);
      expect(row.target.split('/')).toContain(row.platform);
    }
  });

  it.each(regressions)(
    'publishes $source to its reviewed $platform destination',
    ({ source, target }) => {
      expect(
        finalMap.records.find(
          (row: { legacyPath: string }) => row.legacyPath === source,
        ),
      ).toMatchObject({
        target,
        status: 'candidate',
        preserveQuery: false,
      });
      expect(vercel).toContainEqual({
        source,
        destination: target,
        statusCode: 301,
        preserveQueryParams: false,
      });
      expect(nginx).toContain(
        `location = ${source} {\n  return 301 ${target};\n}`,
      );
      const index = appConfig.redirects.findIndex(
        (row: { source: string }) => row.source === source,
      );
      const fallback = appConfig.redirects.findIndex(
        (row: { source: string }) =>
          row.source.startsWith(
            source.startsWith('/api-ref/') ? '/api-ref/:path' : '/doc/:path',
          ),
      );
      expect(index).toBeGreaterThanOrEqual(0);
      expect(index).toBeLessThan(fallback);
      expect(appConfig.redirects[index]).toEqual({
        source,
        destination: target,
        statusCode: 301,
      });
    },
  );
});
