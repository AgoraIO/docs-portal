import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  isRetiredCnDocsPath,
  isRetiredCnLegacyDocsPath,
} from '../src/lib/retired-cn-docs.mjs';

const repoRoot = process.cwd();
const inputRoot = path.join(repoRoot, 'docs/migration/redirect-inputs');

function readJson<T>(fileName: string): T {
  return JSON.parse(readFileSync(path.join(inputRoot, fileName), 'utf8')) as T;
}

describe('Shengwang redirect artifacts', () => {
  it('records the exact publication retirement policy used to derive the map', () => {
    const finalMap = readJson<{
      retirementPolicy: { path: string; sha256: string };
    }>('legacy-url-map.json');
    expect(finalMap.retirementPolicy).toEqual({
      path: 'src/lib/retired-cn-docs.mjs',
      sha256: createHash('sha256')
        .update(
          readFileSync(path.join(repoRoot, 'src/lib/retired-cn-docs.mjs')),
        )
        .digest('hex'),
    });
  });
  it('keeps retired destinations explicitly unavailable instead of redirecting into a 404', () => {
    const candidate = readJson<{
      records: Array<{ legacyPath: string; target: string }>;
    }>('legacy-url-map-candidate-32883e92e9-2026-10-15.json');
    const finalMap = readJson<{
      records: Array<{
        legacyPath: string;
        target: string;
        status: string;
        mappingType: string;
      }>;
    }>('legacy-url-map.json');
    const bySource = new Map(
      finalMap.records.map((record) => [record.legacyPath, record]),
    );
    const retired = candidate.records.filter((record) =>
      isRetiredCnDocsPath(record.target),
    );
    expect(retired).toHaveLength(1076);
    for (const record of retired) {
      expect(bySource.get(record.legacyPath)).toMatchObject({
        target: '',
        status: 'retired',
        mappingType: 'retired-cn-docs',
      });
    }
    expect(
      finalMap.records
        .filter((record) => record.status === 'candidate')
        .some((record) => isRetiredCnDocsPath(`/zh-CN${record.target}`)),
    ).toBe(false);
  });

  it('marks the unchanged public search path as no-redirect in the final map', () => {
    const finalMap = readJson<{
      summary: { redirect: number; noRedirect: number };
      records: Array<{
        legacyPath: string;
        target: string;
        status: string;
        targetExists: boolean;
        mappingType: string;
        notes: string;
      }>;
    }>('legacy-url-map.json');
    const search = finalMap.records.find(
      (record) => record.legacyPath === '/search',
    );

    expect(search).toMatchObject({
      legacyPath: '/search',
      target: '',
      status: 'no-redirect',
      targetExists: false,
      mappingType: 'same-path-no-redirect',
    });
    expect(search?.notes).toContain('公开路径未变化，由新站直接服务');
    expect(finalMap.summary.redirect).toBe(7119);
    expect(finalMap.summary.noRedirect).toBe(2);
  });

  it('finalizes a checked candidate into equivalent redirect artifacts', () => {
    const output = execFileSync(
      process.execPath,
      ['scripts/finalize-shengwang-redirect-artifacts.mjs', '--check'],
      { cwd: repoRoot, encoding: 'utf8' },
    );
    expect(output).toContain('"manualReview": 0');

    const candidate = readJson<{
      generatedAt: string;
      snapshot: unknown;
      records: Array<{
        legacyPath: string;
        target: string;
        status: string;
        notes: string;
      }>;
    }>('legacy-url-map-candidate-32883e92e9-2026-10-15.json');
    const finalMap = readJson<{
      generatedAt: string;
      snapshot: unknown;
      targetUrlTransform: string;
      summary: { redirect: number; noRedirect: number };
      records: Array<{
        legacyPath: string;
        target: string;
        status: string;
      }>;
    }>('legacy-url-map.json');
    const vercel = readJson<
      Array<{
        source: string;
        destination: string;
        statusCode: number;
        preserveQueryParams: boolean;
      }>
    >('legacy-url-redirects.vercel.json');
    const originalRedirects = candidate.records.filter(
      (record) => record.status === 'candidate',
    );

    expect(finalMap.generatedAt).toBe(candidate.generatedAt);
    expect(finalMap.snapshot).toEqual(candidate.snapshot);
    expect(finalMap.targetUrlTransform).toBe('remove-zh-CN-prefix');
    expect(finalMap.summary.redirect).toBe(7119);
    expect(finalMap.summary.noRedirect).toBe(2);
    const expectedRecords = candidate.records.map((record) =>
      isRetiredCnLegacyDocsPath(record.legacyPath) ||
      isRetiredCnDocsPath(record.target)
        ? {
            ...record,
            target: '',
            status: 'retired',
            targetExists: false,
            mappingType: 'retired-cn-docs',
            notes: `${record.notes}；按 PR #1248 下线策略直接返回 HTTP 404，不生成 301。原始目标：${record.target || '无'}。`,
          }
        : record.legacyPath === '/search'
          ? {
              ...record,
              target: '',
              status: 'no-redirect',
              targetExists: false,
              mappingType: 'same-path-no-redirect',
              notes: `${record.notes}；公开路径未变化，由新站直接服务，无需重定向，查询参数交由应用处理。`,
            }
          : {
              ...record,
              target:
                record.target === '/zh-CN/realtime-media/rtc/reference/events'
                  ? '/api-reference/rtc/restful/webhook/events'
                  : record.target.replace(/^\/zh-CN\//, '/'),
            },
    );
    expect(finalMap.records).toEqual(expectedRecords);
    expect(originalRedirects).toHaveLength(8216);
    expect(
      finalMap.records.filter((record) => record.status === 'no-redirect'),
    ).toHaveLength(2);
    expect(
      finalMap.records.filter((record) => record.status === 'candidate'),
    ).toHaveLength(vercel.length);
    const expectedRules = new Map(
      expectedRecords
        .filter((record) => record.status === 'candidate')
        .map((record) => [record.legacyPath, record.target]),
    );
    const actualRules = new Map(
      vercel.map((rule) => [rule.source, rule.destination]),
    );
    expect(vercel.every((rule) => rule.statusCode === 301)).toBe(true);
    expect(vercel.some((rule) => rule.source === rule.destination)).toBe(false);
    expect(vercel).toHaveLength(7119);
    expect(vercel.every((rule) => rule.preserveQueryParams === false)).toBe(
      true,
    );
    expect(actualRules.size).toBe(vercel.length);
    expect(expectedRules.has('/search')).toBe(false);
    expect(actualRules).toEqual(expectedRules);

    const rtcEventsRules = vercel.filter((rule) =>
      /^\/doc\/rtc\/[^/]+\/webhook\/events$/.test(rule.source),
    );
    expect(rtcEventsRules).toHaveLength(15);
    expect(
      rtcEventsRules.every(
        (rule) =>
          rule.destination === '/api-reference/rtc/restful/webhook/events',
      ),
    ).toBe(true);

    const nginx = readFileSync(
      path.join(inputRoot, 'legacy-url-redirects.nginx.conf'),
      'utf8',
    );
    expect(nginx).toContain('# Target URL transform: remove-zh-CN-prefix.');
    const nginxRules = [
      ...nginx.matchAll(
        /^location = ([^\s]+) \{\n {2}return 301 ([^;]+);\n\}$/gm,
      ),
    ].map((match) => [match[1], match[2]] as const);
    expect(new Map(nginxRules).size).toBe(nginxRules.length);
    expect(new Map(nginxRules)).toEqual(expectedRules);

    const csvColumns = [
      'legacyUrl',
      'legacyPath',
      'legacyFamily',
      'target',
      'status',
      'confidence',
      'mappingType',
      'source',
      'targetExists',
      'preserveQuery',
      'notes',
    ];
    const expectedCsv = `${csvColumns.join(',')}\n${expectedRecords
      .map((record) =>
        csvColumns
          .map((column) => {
            const value = String(
              (record as Record<string, unknown>)[column] ?? '',
            );
            return /[",\n\r]/.test(value)
              ? `"${value.replaceAll('"', '""')}"`
              : value;
          })
          .join(','),
      )
      .join('\n')}\n`;
    expect(
      readFileSync(path.join(inputRoot, 'legacy-url-map.csv'), 'utf8'),
    ).toBe(expectedCsv);
  });
});
