import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  buildLocalFragmentIndex,
  extractMdxAnchors,
  findBestFragmentAnchor,
  insertFragmentAliases,
  rewriteLocalFragmentLinks,
  targetPathToRoute,
} from './lib/api-center/local-fragment-index.mjs';

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => fs.rm(directory, { recursive: true, force: true })),
  );
});

describe('API Center local fragment index', () => {
  it('indexes explicit and generated heading anchors', () => {
    const anchors = extractMdxAnchors(
      '<a id="legacy"></a>\n## getPosition\n## getPosition\n',
    );
    expect([...anchors]).toEqual(['legacy', 'getposition', 'getposition-1']);
    expect(findBestFragmentAnchor(anchors, 'getPosition')).toBe('getposition');
  });

  it('indexes headings whose link labels contain bracketed overloads', () => {
    const anchors = extractMdxAnchors(
      '## [searchMusic [2/2]](/zh-CN/api-reference/rtc/android/play/drm#api_searchmusic2)\n',
    );
    expect([...anchors]).toEqual(['searchmusic-22']);
  });

  it('adds a stable legacy alias only when one heading matches', () => {
    const result = insertFragmentAliases(
      '## 功能\n\n### 获取歌曲标签类别\n',
      new Set(['获取歌曲标签']),
    );
    expect(result.inserted).toEqual(['获取歌曲标签']);
    expect(result.body).toContain(
      '<a id="获取歌曲标签"></a>\n### 获取歌曲标签类别',
    );
  });

  it('keeps insertion offsets stable when fenced code precedes a heading', () => {
    const aliasSource =
      '```ts\nconst longValue = true;\n```\n\n## 获取歌曲标签类别\n';
    const aliased = insertFragmentAliases(
      aliasSource,
      new Set(['获取歌曲标签']),
    );
    expect(aliased.body).toContain(
      '```\n\n<a id="获取歌曲标签"></a>\n## 获取歌曲标签类别',
    );
  });

  it('resolves grouped routes and rewrites or safely drops stale fragments', async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), 'fragment-index-'),
    );
    temporaryDirectories.push(repoRoot);
    await fs.mkdir(
      path.join(repoRoot, 'content/docs/zh-CN/api-reference/rtc'),
      {
        recursive: true,
      },
    );
    const targetPath =
      'content/docs/zh-CN/api-reference/rtc/(current)/channel.mdx';
    const fragmentIndex = await buildLocalFragmentIndex({
      repoRoot,
      virtualPages: [
        {
          targetPath,
          body: '<a id="api_irtcengine_renewtoken"></a>\n## renewToken\n',
        },
      ],
    });
    const result = await rewriteLocalFragmentLinks(
      '[renew](/zh-CN/api-reference/rtc/channel#renewToken)\n\n[old](/zh-CN/api-reference/rtc/channel#not-present)',
      {
        fragmentIndex,
        sourceRoute: '/zh-CN/api-reference/guide',
      },
    );

    expect(targetPathToRoute(targetPath)).toBe(
      '/zh-CN/api-reference/rtc/channel',
    );
    expect(result.body).toContain(
      '[renew](/zh-CN/api-reference/rtc/channel#renewtoken)',
    );
    expect(result.body).toContain('[old](/zh-CN/api-reference/rtc/channel)');
    expect(result.warnings).toHaveLength(2);
    expect(result.warnings.at(-1)?.unresolved).toBe(true);
  });
});
