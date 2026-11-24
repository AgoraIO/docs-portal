import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { compareSharedReference } from './check-api-reference-shared.mjs';

let temp: string;
let cn: string;
let global: string;
const write = (root: string, file: string, value: string) => {
  mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
  writeFileSync(path.join(root, file), value);
};
beforeEach(() => {
  temp = mkdtempSync(path.join(tmpdir(), 'api-shared-contract-'));
  cn = path.join(temp, 'cn');
  global = path.join(temp, 'global');
  for (const root of [cn, global]) {
    write(
      root,
      'scripts/api-reference-shared-files.json',
      JSON.stringify({
        files: ['scripts/api-reference-shared-files.json', 'shared.ts'],
        packageScripts: ['test:api-quality'],
      }),
    );
    write(root, 'shared.ts', 'export const shared = true;\n');
    write(
      root,
      'package.json',
      JSON.stringify({ scripts: { 'test:api-quality': 'vitest run shared' } }),
    );
  }
});
afterEach(() => rmSync(temp, { recursive: true, force: true }));

describe('cross-locale API reference contract', () => {
  it('accepts identical shared bytes while allowing regional content and commands', () => {
    write(cn, 'content/page.mdx', '中文');
    write(global, 'content/page.mdx', 'English');
    write(
      cn,
      'package.json',
      JSON.stringify({
        scripts: {
          'test:api-quality': 'vitest run shared',
          regional: 'cn-only',
        },
      }),
    );
    expect(compareSharedReference(cn, global).status).toBe('PASS');
  });
  it('fails divergent shared code and regression commands', () => {
    write(global, 'shared.ts', 'export const shared = false;\n');
    write(
      global,
      'package.json',
      JSON.stringify({ scripts: { 'test:api-quality': 'vitest run fewer' } }),
    );
    const report = compareSharedReference(cn, global);
    expect(report.status).toBe('FAIL');
    expect(
      report.files
        .filter((file: { equal: boolean }) => !file.equal)
        .map((file: { file: string }) => file.file),
    ).toEqual(['shared.ts', 'package.json#scripts.test:api-quality']);
  });
  it('fails a missing shared file instead of skipping it', () => {
    rmSync(path.join(global, 'shared.ts'));
    const report = compareSharedReference(cn, global);
    expect(report.status).toBe('FAIL');
    expect(
      report.files.find((file: { file: string }) => file.file === 'shared.ts')
        ?.right,
    ).toBeNull();
  });
  it('includes manifest changes in the comparison', () => {
    write(global, 'scripts/api-reference-shared-files.json', '{}');
    expect(compareSharedReference(cn, global).status).toBe('FAIL');
  });
  it('refuses to certify one checkout against itself', () => {
    expect(() => compareSharedReference(cn, cn)).toThrow(
      'two different checkouts',
    );
  });
  it('returns a nonzero CLI status when shared bytes diverge', () => {
    const script = path.resolve('scripts/check-api-reference-shared.mjs');
    const run = () =>
      spawnSync(process.execPath, [script, '--against', global], {
        cwd: cn,
        encoding: 'utf8',
      });
    expect(run().status).toBe(0);
    write(global, 'shared.ts', 'diverged');
    const failed = run();
    expect(failed.status).toBe(1);
    expect(JSON.parse(failed.stdout).status).toBe('FAIL');
  });
});
