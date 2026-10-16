import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();
const inputRoot = path.join(repoRoot, 'docs/migration/redirect-inputs');

function readJson<T>(fileName: string): T {
  return JSON.parse(
    readFileSync(path.join(inputRoot, fileName), 'utf8'),
  ) as T;
}

describe('Shengwang redirect artifacts', () => {
  it('finalizes a checked candidate into equivalent redirect artifacts', () => {
    const output = execFileSync(
      process.execPath,
      ['scripts/finalize-shengwang-redirect-artifacts.mjs'],
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
      }>;
    }>('legacy-url-map-candidate-32883e92e9-2026-10-15.json');
    const finalMap = readJson<{
      generatedAt: string;
      snapshot: unknown;
      records: Array<{
        legacyPath: string;
        target: string;
        status: string;
      }>;
    }>('legacy-url-map.json');
    const vercel = readJson<
      Array<{ source: string; destination: string; statusCode: number }>
    >('legacy-url-redirects.vercel.json');
    const redirects = candidate.records.filter(
      (record) => record.status === 'candidate',
    );

    expect(finalMap.generatedAt).toBe(candidate.generatedAt);
    expect(finalMap.snapshot).toEqual(candidate.snapshot);
    expect(finalMap.records).toEqual(candidate.records);
    expect(vercel).toHaveLength(redirects.length);
    expect(vercel.every((rule) => rule.statusCode === 301)).toBe(true);
    expect(
      vercel.every((rule) =>
        redirects.some(
          (record) =>
            record.legacyPath === rule.source && record.target === rule.destination,
        ),
      ),
    ).toBe(true);

    const nginx = readFileSync(
      path.join(inputRoot, 'legacy-url-redirects.nginx.conf'),
      'utf8',
    );
    expect(nginx.match(/^location = /gm)?.length).toBe(redirects.length);
  });
});
