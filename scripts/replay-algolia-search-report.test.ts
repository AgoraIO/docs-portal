import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import type { GoldenReplayReport } from '../src/lib/search/golden-search-replay';
import { writeReplayReport } from './replay-algolia-search-report';

describe('writeReplayReport', () => {
  it('writes the complete failure report before returning a non-zero exit code', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'algolia-replay-report-'));
    const outputPath = join(tempDir, 'report.json');
    const report = {
      cases: [
        {
          actualUrls: ['/en/unrelated'],
          expectedUrl: '/en/expected',
          passed: false,
          query: 'expected query',
        },
      ],
      failed: 1,
      passed: 0,
      total: 1,
    } satisfies GoldenReplayReport;
    const io = { error: vi.fn(), log: vi.fn() };

    try {
      const exitCode = await writeReplayReport(report, outputPath, io);

      expect(JSON.parse(await readFile(outputPath, 'utf8'))).toEqual(report);
      expect(exitCode).toBe(1);
    } finally {
      await rm(tempDir, { force: true, recursive: true });
    }
  });
});
