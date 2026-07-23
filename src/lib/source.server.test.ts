import { describe, expect, it } from 'vitest';
import { getLLMText, getPlatformLLMText, source } from './source.server';

describe('fumadocs source loader', () => {
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

  it.each([
    'web',
    'electron',
  ])('keeps hidden Flexible Classroom %s Edu Store detail routes reachable', (platform) => {
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
      expect(page?.url).toBe(`/zh-CN/${slugs.join('/')}`);
    }
  });
});
