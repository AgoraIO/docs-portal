import { describe, expect, it } from 'vitest';
import { getLLMText, getPlatformLLMText, source } from './source.server';

describe('fumadocs source loader', () => {
  it.each([
    { slugs: ['ai', 'release-notes'], version: 'v2.13', id: 'v213' },
    {
      slugs: [
        'realtime-media',
        'cloud-recording',
        'reference',
        'release-notes',
      ],
      version: '2026.10.08',
      id: '20261008',
    },
  ])(
    'keeps Chinese version headings in machine-readable $slugs',
    async ({ slugs, version, id }) => {
      const page = source.getPage(slugs, 'zh-CN');
      expect(page).toBeDefined();
      if (!page) throw new Error('Missing Chinese release notes');

      const markdown = await getLLMText(page);
      expect(markdown).toContain(`## ${version} [#${id}]`);
      expect(markdown).toContain('该版本');
    },
  );

  it.each([
    { platform: 'android' as const, id: 'v470' },
    { platform: 'ios' as const, id: 'v470-1' },
  ])(
    'preserves Chinese $platform version IDs and filters other platforms in Markdown',
    async ({ platform, id }) => {
      const page = source.getPage(
        ['realtime-media', 'rtc', 'reference', 'release-notes'],
        'zh-CN',
      );
      expect(page).toBeDefined();
      if (!page) throw new Error('Missing Chinese RTC release notes');

      const markdown = await getPlatformLLMText(page, platform);
      expect(markdown).toContain(`## v4.7.0 [#${id}]`);
      expect(markdown).toContain('声网高级美颜 2.1');
      expect(markdown).not.toContain('title="v2.5.1"');
      expect(markdown).not.toContain('_PlatformPanel');
    },
    30_000,
  );

  it('resolves localized OpenAPI operation pages from the merged source', () => {
    const page = source.getPage(
      ['api-reference', 'api-ref', 'conversational-ai', 'join'],
      'en',
    );

    expect(page?.type).toBe('openapi');
    expect(page?.url).toBe('/en/api-reference/api-ref/conversational-ai/join');
    expect(page?.data._openapi?.method).toBe('post');
  });

  it('ignores internal proposal report JSON files when resolving docs pages', () => {
    const page = source.getPage(
      ['realtime-media', 'agora-analytics', 'product-overview'],
      'en',
    );

    expect(page?.type).toBe('docs');
    expect(page?.url).toBe(
      '/en/realtime-media/agora-analytics/product-overview',
    );
    expect(page?.data.title).toBe('Agora Analytics overview');
    expect(
      source.getPage(
        ['realtime-media', 'agora-analytics', '_proposal-report'],
        'en',
      ),
    ).toBeUndefined();
  });

  it.each(['web', 'electron'])(
    'keeps retired Flexible Classroom %s Edu Store detail sources unpublished',
    (platform) => {
      const detailRoutes = [
        ['modules', 'agora-edu-core-src-configs-index'],
        ['classes', 'agora-edu-core-src-configs-index-du-classroom-config'],
        ['interfaces', 'agora-edu-core-src-configs-index-hiteboard-defaults'],
        ['enums', 'agora-edu-core-src-configs-index-latform'],
      ];

      for (const detailRoute of detailRoutes) {
        const slugs = [
          'api-reference',
          'flexible-classroom',
          platform,
          'api-reference',
          'edu-store',
          ...detailRoute,
        ];
        const page = source.getPage(slugs, 'zh-CN');
        expect(page).toBeUndefined();
      }
    },
  );
});
