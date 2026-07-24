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

  it('matches only exact structured API fragments', () => {
    expect(
      findBestFragmentAnchor(
        new Set(['renewtoken']),
        'api_irtcengine_renewtoken',
      ),
    ).toBe('renewtoken');
    expect(
      findBestFragmentAnchor(
        new Set(['api_irtcengine_renewtoken']),
        'renewToken',
      ),
    ).toBe('api_irtcengine_renewtoken');
    expect(
      findBestFragmentAnchor(
        new Set(['configuration']),
        'api_irtcengine_setdirectcdnstreamingaudioconfiguration',
      ),
    ).toBeNull();
    expect(
      findBestFragmentAnchor(
        new Set([
          'api_irtcengine_setexternalvideosource',
          'setexternalvideosource',
        ]),
        'api_imediaengine_setexternalvideosource',
      ),
    ).toBe('setexternalvideosource');
  });

  it('indexes headings whose link labels contain bracketed overloads', () => {
    const anchors = extractMdxAnchors(
      '## [searchMusic [2/2]](/zh-CN/api-reference/rtc/android/play/drm#api_searchmusic2)\n',
    );
    expect([...anchors]).toEqual(['searchmusic-22']);
  });

  it('indexes headings after indented fenced code blocks', () => {
    const anchors = extractMdxAnchors(
      [
        '  ```shell',
        '  npm install',
        '```',
        '',
        '## Target section',
        '',
        '```ts',
        'const ready = true;',
        '```',
      ].join('\n'),
    );

    expect(anchors).toContain('target-section');
  });

  it('adds a stable legacy alias only when one heading matches', () => {
    const result = insertFragmentAliases(
      '## 功能\n\n### 获取歌曲标签类别\n',
      new Set(['获取歌曲标签']),
    );
    expect(result.inserted).toEqual(['获取歌曲标签']);
    expect(result.body).toContain(
      '<a id="获取歌曲标签"></a>\n\n### 获取歌曲标签类别',
    );
  });

  it('does not map a compound API type to a short embedded method name', () => {
    const result = insertFragmentAliases(
      '## Connect\n\n## Slide\n\n## NewBytedanceTTS\n',
      new Set(['RtcConnectionInfo', 'ISlideConfig', 'NewBytedance']),
    );

    expect(result.inserted).toEqual([]);
    expect(result.unresolved).toEqual([
      'RtcConnectionInfo',
      'ISlideConfig',
      'NewBytedance',
    ]);
  });

  it('maps structured Doxygen fragments to an exact heading', () => {
    const result = insertFragmentAliases(
      '## enableLocalAudio\n\n## enableLocalAudioEx\n',
      new Set(['class_enable_local_audio_method']),
    );

    expect(result.inserted).toEqual(['class_enable_local_audio_method']);
    expect(result.body).toContain(
      '<a id="class_enable_local_audio_method"></a>\n\n## enableLocalAudio',
    );
  });

  it('maps generated numeric suffixes to the matching specific heading', () => {
    const result = insertFragmentAliases(
      [
        '## Vendors',
        '',
        '### LLM vendors',
        '',
        '### STT vendors',
        '',
        '### Avatar vendors',
      ].join('\n'),
      new Set(['llm-vendors-1', 'stt-vendors-1', 'avatar-vendors-1']),
    );

    expect(result.body).toContain(
      '<a id="llm-vendors-1"></a>\n\n### LLM vendors',
    );
    expect(result.body).toContain(
      '<a id="stt-vendors-1"></a>\n\n### STT vendors',
    );
    expect(result.body).toContain(
      '<a id="avatar-vendors-1"></a>\n\n### Avatar vendors',
    );
  });

  it('adds a legacy alias at an explicitly selected canonical anchor', () => {
    const result = insertFragmentAliases(
      '---\ntitle: Constructors\n---\n<a id="newconstructor1"></a>\n\n## NewConstructor [1/2]\n',
      new Set(['legacyconstructor']),
      {
        canonicalAnchors: new Map([
          ['legacyconstructor', 'newconstructor1'],
        ]),
      },
    );

    expect(result.inserted).toEqual(['legacyconstructor']);
    expect(result.body).toContain(
      '---\n\n<a id="legacyconstructor"></a>\n\n<a id="newconstructor1"></a>',
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
      '```\n\n<a id="获取歌曲标签"></a>\n\n## 获取歌曲标签类别',
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

  it('preserves unresolved fragments when requested', async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), 'fragment-index-'),
    );
    temporaryDirectories.push(repoRoot);
    const targetPath = 'content/docs/zh-CN/guide.mdx';
    const fragmentIndex = await buildLocalFragmentIndex({
      repoRoot,
      virtualPages: [{ targetPath, body: '## Existing section\n' }],
    });
    const source = '[missing](/zh-CN/guide#missing-section)';
    const result = await rewriteLocalFragmentLinks(source, {
      fragmentIndex,
      preserveUnresolved: true,
      sourceRoute: '/zh-CN/source',
    });

    expect(result.body).toBe(source);
    expect(result.warnings).toEqual([
      {
        from: '/zh-CN/guide#missing-section',
        to: '/zh-CN/guide#missing-section',
        unresolved: true,
      },
    ]);
  });
});
