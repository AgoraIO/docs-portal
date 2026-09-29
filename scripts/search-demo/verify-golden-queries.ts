import { readFile } from 'node:fs/promises';
import { createSearchDocsTool } from '../../src/lib/search/search-docs-tool';
import {
  evaluateGoldenQuery,
  type GoldenQuery,
  type GoldenQueryResult,
} from './golden-query-check';

export type GoldenQuerySearchTool = {
  searchDocs(input: {
    query: string;
    product?: string;
    platform?: string[];
    version?: string;
  }): Promise<{ results: Array<{ url: string }> }>;
};

export async function runGoldenQueries(
  fixtures: readonly GoldenQuery[],
  searchDocs: GoldenQuerySearchTool,
): Promise<GoldenQueryResult[]> {
  const checks: GoldenQueryResult[] = [];
  for (const fixture of fixtures) {
    const response = await searchDocs.searchDocs({
      query: fixture.query,
      ...(fixture.product ? { product: fixture.product } : {}),
      ...(fixture.platform ? { platform: [fixture.platform] } : {}),
      ...(fixture.version ? { version: fixture.version } : {}),
    });
    checks.push(evaluateGoldenQuery(fixture, response.results));
  }
  return checks;
}

export type AiCitationCheck = {
  query: string;
  expectedUrl: string;
  cited: boolean;
};

export async function verifyAiCitations(
  baseUrl: string,
  fixtures: readonly GoldenQuery[],
): Promise<AiCitationCheck[]> {
  const checks: AiCitationCheck[] = [];
  for (const fixture of fixtures) {
    const response = await fetch(`${baseUrl.replace(/\/$/, '')}/api/ask-docs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: fixture.question ?? fixture.query,
      }),
    });
    if (!response.ok)
      throw new Error(`AI demo failed (HTTP ${response.status})`);
    const result = (await response.json()) as {
      citations?: Array<{ url?: string }>;
    };
    checks.push({
      query: fixture.query,
      expectedUrl: fixture.expectedUrl,
      cited: !!result.citations?.some(
        (citation) => citation.url === fixture.expectedUrl,
      ),
    });
  }
  return checks;
}

async function readFixtures(): Promise<GoldenQuery[]> {
  const source = await readFile(
    new URL('./fixtures/cn-kb-golden-queries.json', import.meta.url),
    'utf8',
  );
  return JSON.parse(source) as GoldenQuery[];
}

if (import.meta.main) {
  const fixtures = await readFixtures();
  const searchDocs = createSearchDocsTool({
    host: process.env.MEILI_HOST ?? 'http://127.0.0.1:7700',
    masterKey: process.env.MEILI_MASTER_KEY ?? '',
  });
  const searchChecks = await runGoldenQueries(fixtures, searchDocs);
  console.log('CN search Golden Query results');
  console.log(JSON.stringify(searchChecks, null, 2));
  if (searchChecks.some((check) => !check.matched)) {
    process.exitCode = 1;
  }

  if (process.env.ASK_DOCS_URL) {
    const aiChecks = await verifyAiCitations(
      process.env.ASK_DOCS_URL,
      fixtures,
    );
    console.log('AI citation results');
    console.log(JSON.stringify(aiChecks, null, 2));
    if (aiChecks.some((check) => !check.cited)) process.exitCode = 1;
  } else {
    console.log(
      'AI citation check skipped; set ASK_DOCS_URL=http://127.0.0.1:8788 to enable it.',
    );
  }
}
