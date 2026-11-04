import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import regressions from './fixtures/shengwang-jenkins-158-redirects.json';

const inputRoot = 'docs/migration/redirect-inputs';
const readJson = (file: string) =>
  JSON.parse(readFileSync(`${inputRoot}/${file}`, 'utf8'));
const candidate = readJson(
  'legacy-url-map-candidate-32883e92e9-2026-10-15.json',
);
const finalMap = readJson('legacy-url-map.json');
const vercel = readJson('legacy-url-redirects.vercel.json');
const nginx = readFileSync(
  `${inputRoot}/legacy-url-redirects.nginx.conf`,
  'utf8',
);
const appConfig = JSON.parse(readFileSync('vercel.json', 'utf8'));

describe('Jenkins #158 reviewed legacy redirects', () => {
  it('covers every broken destination and preserves the historical evidence', () => {
    expect(regressions).toHaveLength(97);
    expect(new Set(regressions.map((row) => row.oldTarget)).size).toBe(87);
    for (const row of regressions) {
      expect(
        candidate.records.find(
          (record: { legacyPath: string }) => record.legacyPath === row.source,
        )?.target,
      ).toBe(`/zh-CN${row.oldTarget}`);
    }
  });

  it.each(regressions)(
    'publishes $source directly to its current product, platform and chapter',
    ({ source, target }) => {
      expect(
        finalMap.records.find(
          (record: { legacyPath: string }) => record.legacyPath === source,
        ),
      ).toMatchObject({ target, status: 'candidate', preserveQuery: false });
      expect(vercel).toContainEqual({
        source,
        destination: target,
        statusCode: 301,
        preserveQueryParams: false,
      });
      expect(nginx).toContain(
        `location = ${source} {\n  return 301 ${target.includes('#') ? JSON.stringify(target) : target};\n}`,
      );
      const appIndex = appConfig.redirects.findIndex(
        (rule: { source: string }) => rule.source === source,
      );
      const fallbackIndex = appConfig.redirects.findIndex(
        (rule: { source: string }) =>
          rule.source.startsWith(
            source.startsWith('/api-ref/') ? '/api-ref/:path' : '/doc/:path',
          ),
      );
      expect(appConfig.redirects[appIndex]).toMatchObject({
        source,
        destination: target,
        statusCode: 301,
      });
      expect(appIndex).toBeLessThan(fallbackIndex);
    },
  );
});
