import { describe, expect, it } from 'vitest';
import { source } from './source.server';

describe('fumadocs source loader', () => {
  it('resolves localized OpenAPI operation pages from the merged source', () => {
    const page = source.getPage(
      ['api-reference', 'api-ref', 'conversational-ai', 'join'],
      'en',
    );

    expect(page?.type).toBe('openapi');
    expect(page?.url).toBe(
      '/en/api-reference/api-ref/conversational-ai/join',
    );
    expect(page?.data._openapi?.method).toBe('post');
  });

  it('ignores internal proposal report JSON files when resolving docs pages', () => {
    const page = source.getPage(['solutions', 'agora-analytics'], 'en');

    expect(page?.type).toBe('page');
    expect(page?.url).toBe('/en/solutions/agora-analytics');
    expect(page?.data.title).toBe('Agora Analytics');
  });
});
