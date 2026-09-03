import type { GoldenSearchCase } from './golden-search-queries';
import { normalizeSearchText } from './search-normalization';

export type GoldenReplayResult = {
  canonicalKey?: string;
  platformUrls?: Record<string, string>;
  recordKind?: string;
  title: string;
  url: string;
};

export type GoldenReplayCaseResult = {
  actualUrls: string[];
  error?: string;
  expectedUrl?: string;
  passed: boolean;
  previewBlocking: boolean;
  query: string;
};

export type GoldenReplayGateMode = 'all' | 'preview-blockers';

export type GoldenReplayGate = {
  failed: number;
  mode: GoldenReplayGateMode;
  passed: number;
  total: number;
};

export type GoldenReplayReport = {
  cases: GoldenReplayCaseResult[];
  failed: number;
  gate: GoldenReplayGate;
  passed: number;
  total: number;
};

export type GoldenReplayOptions = {
  gateMode?: GoldenReplayGateMode;
};

function comparableUrl(url: string) {
  return url.startsWith('/') ? url.split('#', 1)[0] : url;
}

function containsExpectedUrl(
  result: GoldenReplayResult,
  expectedUrl: string | undefined,
) {
  if (!expectedUrl) return true;
  const comparableExpectedUrl = comparableUrl(expectedUrl);
  return (
    comparableUrl(result.url) === comparableExpectedUrl ||
    Object.values(result.platformUrls ?? {}).some(
      (url) => comparableUrl(url) === comparableExpectedUrl,
    )
  );
}

export async function replayGoldenSearchCases(
  goldenCases: readonly GoldenSearchCase[],
  search: (query: string) => Promise<readonly GoldenReplayResult[]>,
  options: GoldenReplayOptions = {},
): Promise<GoldenReplayReport> {
  const cases: GoldenReplayCaseResult[] = [];

  for (const goldenCase of goldenCases) {
    try {
      const results = await search(goldenCase.query);
      const topThree = results.slice(0, 3);
      const expectedResult = goldenCase.expectedCanonicalKey
        ? topThree.find(
            (result) => result.canonicalKey === goldenCase.expectedCanonicalKey,
          )
        : topThree.find((result) =>
            containsExpectedUrl(result, goldenCase.expectedUrl),
          );
      const passed =
        goldenCase.expectedKind === 'empty'
          ? results.length === 0
          : Boolean(
              expectedResult &&
                expectedResult.recordKind === goldenCase.expectedKind &&
                containsExpectedUrl(expectedResult, goldenCase.expectedUrl) &&
                (!goldenCase.expectedTitle ||
                  normalizeSearchText(expectedResult.title).includes(
                    normalizeSearchText(goldenCase.expectedTitle),
                  )),
            );

      cases.push({
        actualUrls: topThree.map(({ url }) => url),
        ...(goldenCase.expectedUrl
          ? { expectedUrl: goldenCase.expectedUrl }
          : {}),
        passed,
        previewBlocking: goldenCase.previewBlocking === true,
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
        previewBlocking: goldenCase.previewBlocking === true,
        query: goldenCase.query,
      });
    }
  }

  const passed = cases.filter((result) => result.passed).length;
  const gateMode = options.gateMode ?? 'all';
  const gateCases =
    gateMode === 'preview-blockers'
      ? cases.filter(({ previewBlocking }) => previewBlocking)
      : cases;
  const gatePassed = gateCases.filter((result) => result.passed).length;
  return {
    cases,
    failed: cases.length - passed,
    gate: {
      failed: gateCases.length - gatePassed,
      mode: gateMode,
      passed: gatePassed,
      total: gateCases.length,
    },
    passed,
    total: cases.length,
  };
}
