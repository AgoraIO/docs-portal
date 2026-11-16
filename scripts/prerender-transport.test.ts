import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('installed TanStack prerender transport', () => {
  for (const [mode, retries] of [
    ['headers-reset', 2],
    ['body-reset', 2],
    ['permanent', 2],
    ['http-error', 2],
    ['permanent', 0],
    ['healthy', 2],
    ['crawl', 2],
  ] as const) {
    it(`${mode}, ${retries} retries: complete pages or reject without silent omissions`, () => {
      const output = mkdtempSync(join(tmpdir(), 'docs-prerender-'));
      try {
        const result = spawnSync(
          process.execPath,
          [
            'scripts/fixtures/prerender-transport.mjs',
            mode,
            output,
            String(retries),
          ],
          { encoding: 'utf8', timeout: 10_000 },
        );
        expect(result.error).toBeUndefined();
        const receipt = JSON.parse(result.stdout.split('RESULT:')[1]);
        if (mode === 'permanent' || mode === 'http-error') {
          expect(result.status).toBe(1);
          expect(receipt.status).toBe('failed');
          expect(receipt.message).toContain('/broken/a');
          expect(receipt.message).toContain('/broken/b');
          expect(receipt.attempts['/broken/a/']).toBe(retries + 1);
          expect(existsSync(join(output, 'broken/a/index.html'))).toBe(false);
          expect(result.stderr).not.toContain('triggerUncaughtException');
        } else {
          expect(result.status).toBe(0);
          expect(receipt.attempts['/broken/a/']).toBe(
            mode === 'healthy' ? 1 : 2,
          );
          if (mode !== 'crawl') {
            expect(receipt.attempts['/broken/b/']).toBe(
              mode === 'healthy' ? 1 : 2,
            );
          } else {
            expect(receipt.pages).toEqual(['/healthy', '/broken/a']);
          }
          for (const path of mode === 'crawl'
            ? ['broken/a']
            : ['broken/a', 'broken/b', 'healthy']) {
            expect(readFileSync(join(output, path, 'index.html'), 'utf8')).toBe(
              `<html><body>complete:/${path}/</body></html>`,
            );
          }
        }
        expect(receipt.attempts['/healthy/']).toBe(1);
      } finally {
        rmSync(output, { recursive: true, force: true });
      }
    });
  }
});
