import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { resolveExistingApiCenterTarget } from '../../scripts/lib/api-center/existing-targets.mjs';
import { parseCsv } from '../../scripts/lib/api-center/source-resolver.mjs';
import { isRetiredCnDocsPath } from './retired-cn-docs.mjs';

const { documents } = JSON.parse(
  readFileSync('docs/migration/cn-document-ownership.json', 'utf8'),
) as {
  documents: Array<{
    supersededSource: string;
    canonicalSource: string;
    legacyUrls: string[];
  }>;
};
const route = (source: string) =>
  `/${source
    .replace(/^content\/docs\//, '')
    .replace(/\.mdx?$/, '')
    .replace(/\/index$/, '')}`;

describe('Chinese document ownership', () => {
  it('keeps the RTM CSV ownership consistent with each source platform', () => {
    const platforms: Record<string, string> = {
      android: 'android',
      flutter: 'flutter',
      harmonyos: 'harmonyos',
      ios: 'ios',
      javascript: 'web',
      unity: 'unity',
      rn: 'react-native',
    };
    for (const file of [
      'docs/migration/path-map.csv',
      'docs/migration/migration-ledger.csv',
    ]) {
      for (const row of parseCsv(readFileSync(file, 'utf8'))) {
        const match = row.source_path?.match(
          /^docs-api-reference\/rtm2\/toc-(channel|configuration)\/\1\.(android|flutter|harmonyos|ios|javascript|unity|rn)\.mdx$/,
        );
        if (!match) continue;
        const route = `/zh-CN/api-reference/rtm/${platforms[match[2]]}/${match[1]}`;
        expect(row.target_path, row.source_path).toBe(
          `content/docs${route}.mdx`,
        );
        if ('new_url' in row) expect(row.new_url, row.source_path).toBe(route);
      }
    }
  });
  it('preserves the current published agent metrics wire format', () => {
    const source = readFileSync(
      'content/docs/zh-CN/ai/reference/event-types.mdx',
      'utf8',
    );
    expect(source).toContain('"e2elatencyms": 940');
    expect(source).toMatch(/"segmentedlatencyms":\s*\[/);
    expect(source).toContain('{"name": "llm_ftfs", "latency": 60}');
    expect(source).not.toContain('segmented_latency_ms');
  });

  it.each(documents)(
    'keeps one source for $supersededSource',
    ({ supersededSource, canonicalSource }) => {
      expect(existsSync(supersededSource), supersededSource).toBe(false);
      expect(existsSync(canonicalSource), canonicalSource).toBe(true);
    },
  );

  it('does not regenerate removed copies from old website URLs', () => {
    for (const doc of documents) {
      for (const url of doc.legacyUrls) {
        expect(resolveExistingApiCenterTarget(url), url).toEqual({
          targetPath: doc.canonicalSource,
          targetRoute: route(doc.canonicalSource),
        });
      }
    }
  });

  it('uses the platform source when reimporting the RTM legacy aggregates', () => {
    for (const [legacy, platform] of [
      ['javascript', 'web'],
      ['android', 'android'],
      ['ios', 'ios'],
      ['harmonyos', 'harmonyos'],
      ['flutter', 'flutter'],
      ['unity', 'unity'],
    ]) {
      for (const leaf of ['channel', 'configuration']) {
        expect(
          resolveExistingApiCenterTarget(
            `https://doc.shengwang.cn/api-ref/rtm2/${legacy}/toc-${leaf}/${leaf}`,
          ),
        ).toEqual({
          targetPath: `content/docs/zh-CN/api-reference/rtm/${platform}/${leaf}.mdx`,
          targetRoute: `/zh-CN/api-reference/rtm/${platform}/${leaf}`,
        });
      }
    }
  });

  it('has no published content linking to the removed document URLs', () => {
    const oldRoutes = documents.map((doc) => route(doc.supersededSource));
    const stale: string[] = [];
    for (const name of readdirSync('content/docs/zh-CN', { recursive: true })
      .map(String)
      .filter((file) => /\.mdx?$/.test(file))) {
      if (isRetiredCnDocsPath(`zh-CN/${name}`)) continue;
      const source = readFileSync(`content/docs/zh-CN/${name}`, 'utf8');
      for (const old of oldRoutes) {
        if (source.includes(old) || source.includes(old.replace('/zh-CN', '')))
          stale.push(`${name}: ${old}`);
      }
    }
    expect(stale).toEqual([]);
  }, 30000);
});
