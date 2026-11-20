import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const fixture = resolve('scripts/test-fixtures/prerender-retry.mjs');
function render(mode: string) {
  return spawnSync('node', [fixture, mode], {
    encoding: 'utf8',
    timeout: 15_000,
  });
}

describe('installed TanStack prerender retry contract', () => {
  it('recovers a real TCP reset and writes every page', () => {
    const result = render('reset-once');
    expect(result.status, result.stdout + result.stderr).toBe(0);
    expect(result.stdout).toContain(
      'COMPLETE: both HTML pages written exactly once',
    );
  });

  it('does not fetch successful or rediscovered pages twice', () => {
    const result = render('success');
    expect(result.status, result.stdout + result.stderr).toBe(0);
  });

  for (const mode of ['permanent-reset', 'http-error']) {
    it(`fails the build after bounded retries for ${mode}`, () => {
      const result = render(mode);
      expect(result.status).not.toBe(0);
      expect(result.signal).toBeNull();
      expect(result.stdout).toContain('REQUEST /doc/ 3');
      expect(result.stdout).not.toContain('REQUEST /doc/ 4');
      expect(result.stdout).not.toContain('COMPLETE:');
      expect(result.stderr).toContain(
        'Failed to prerender /doc after 3 attempts',
      );
    });
  }
});
