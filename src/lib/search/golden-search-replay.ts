import type { GoldenSearchCase } from './golden-search-queries';

export type GoldenReplayResult = {
  recordKind?: string;
  title: string;
  url: string;
};

export type GoldenReplayCaseResult = {
  actualUrls: string[];
  error?: string;
  expectedUrl?: string;
  passed: boolean;
  query: string;
};

export type GoldenReplayReport = {
  cases: GoldenReplayCaseResult[];
  failed: number;
  passed: number;
  total: number;
};

export async function replayGoldenSearchCases(
  goldenCases: readonly GoldenSearchCase[],
  search: (query: string) => Promise<readonly GoldenReplayResult[]>,
): Promise<GoldenReplayReport> {
  const cases: GoldenReplayCaseResult[] = [];

  for (const goldenCase of goldenCases) {
    try {
      const results = await search(goldenCase.query);
      const topThree = results.slice(0, 3);
      const expectedResult = goldenCase.expectedUrl
        ? topThree.find((result) => result.url === goldenCase.expectedUrl)
        : undefined;
      const passed =
        goldenCase.expectedKind === 'empty'
          ? results.length === 0
          : Boolean(
              expectedResult &&
                expectedResult.recordKind === goldenCase.expectedKind &&
                (!goldenCase.expectedTitle ||
                  expectedResult.title
                    .toLowerCase()
                    .includes(goldenCase.expectedTitle.toLowerCase())),
            );

      cases.push({
        actualUrls: topThree.map(({ url }) => url),
        ...(goldenCase.expectedUrl
          ? { expectedUrl: goldenCase.expectedUrl }
          : {}),
        passed,
        query: goldenCase.query,
      });
    } catch (error) {
      cases.push({
        actualUrls: [],
        error: error instanceof Error ? error.message : String(error),
        ...(goldenCase.expectedUrl
          ? { expectedUrl: goldenCase.expectedUrl }
          : {}),
        passed: false,
        query: goldenCase.query,
      });
    }
  }

  const passed = cases.filter((result) => result.passed).length;
  return {
    cases,
    failed: cases.length - passed,
    passed,
    total: cases.length,
  };
}
