import { writeFile } from 'node:fs/promises';
import type { GoldenReplayReport } from '../src/lib/search/golden-search-replay';

export async function writeReplayReport(
  report: GoldenReplayReport,
  outputPath: string | undefined,
  io: Pick<Console, 'error' | 'log'> = console,
) {
  const serializedReport = `${JSON.stringify(report, null, 2)}\n`;
  if (outputPath) {
    await writeFile(outputPath, serializedReport, 'utf8');
  }

  io.log(
    `Global Algolia replay: ${report.passed}/${report.total} passed, ${report.failed} failed.`,
  );
  for (const result of report.cases.filter(({ passed }) => !passed)) {
    io.error(
      JSON.stringify({
        actualUrls: result.actualUrls,
        error: result.error,
        expectedUrl: result.expectedUrl,
        query: result.query,
      }),
    );
  }

  return report.failed > 0 ? 1 : 0;
}
