export type GoldenQuery = {
  query: string;
  platform?: string;
  product?: string;
  version?: string;
  expectedUrl: string;
  question?: string;
};

export type GoldenQueryResult = {
  query: string;
  expectedUrl: string;
  matched: boolean;
  rank: number | null;
};

export function evaluateGoldenQuery(
  fixture: GoldenQuery,
  results: readonly { url: string }[],
): GoldenQueryResult {
  const index = results.findIndex(
    (result) => result.url === fixture.expectedUrl,
  );
  return {
    query: fixture.query,
    expectedUrl: fixture.expectedUrl,
    matched: index >= 0,
    rank: index >= 0 ? index + 1 : null,
  };
}
