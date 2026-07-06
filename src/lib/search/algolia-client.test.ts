import { liteClient } from 'algoliasearch/lite';
import { describe, expect, it, vi } from 'vitest';
import { createAlgoliaDocsClient } from './algolia-client';

vi.mock('algoliasearch/lite', () => ({
  liteClient: vi.fn(),
}));

describe('createAlgoliaDocsClient', () => {
  it('deduplicates repeated section hits and keeps searchable context fields', async () => {
    const searchForHits = vi.fn().mockResolvedValue({
      results: [
        {
          hits: [
            {
              _highlightResult: {
                content: {
                  matchLevel: 'full',
                  value: 'Enable <mark>VAD</mark> on Web.',
                },
                section: { matchLevel: 'none', value: 'Implement the logic' },
                title: {
                  matchLevel: 'full',
                  value: '<mark>Voice</mark> Activity Detection',
                },
              },
              _snippetResult: {
                content: {
                  value: '…enable <mark>VAD</mark> on Web for calls…',
                },
              },
              breadcrumbs: ['realtime-media', 'voice'],
              content: 'Enable VAD on Web.',
              objectID: 'first-chunk',
              objectType: 'docs',
              platform: ['web'],
              product: 'voice',
              section: 'Implement the logic',
              section_id: 'implement-the-logic',
              tab: 'realtime-media',
              title: 'Voice Activity Detection',
              url: '/en/realtime-media/voice/vad',
            },
            {
              content: 'Another matching paragraph from the same section.',
              objectID: 'second-chunk',
              platform: ['web'],
              product: 'voice',
              section: 'Implement the logic',
              section_id: 'implement-the-logic',
              title: 'Voice Activity Detection',
              url: '/en/realtime-media/voice/vad',
            },
            {
              content: 'Type options for VAD.',
              objectID: 'type-section',
              platform: ['web'],
              product: 'voice',
              section: 'Type definitions',
              section_id: 'type-definitions',
              title: 'Voice Activity Detection',
              url: '/en/realtime-media/voice/vad',
            },
          ],
        },
      ],
    });
    vi.mocked(liteClient).mockReturnValue({ searchForHits } as never);

    const client = createAlgoliaDocsClient({
      appId: 'app-id',
      indexName: 'docs_portal_en',
      locale: 'en',
      platform: 'web',
      searchApiKey: 'search-key',
    });

    const results = await client.search('vad');

    expect(searchForHits).toHaveBeenCalledWith({
      requests: [
        expect.objectContaining({
          attributesToSnippet: ['content:25', 'section:20'],
          distinct: 1,
          filters: 'locale:en AND platform:web',
          indexName: 'docs_portal_en',
          optionalFilters: [
            'category:default<score=2>',
            'category:deprecated<score=1>',
          ],
          query: 'vad',
        }),
      ],
    });
    expect(results).toHaveLength(2);
    expect(results[0]).toMatchObject({
      breadcrumbs: ['realtime-media', 'voice'],
      id: 'first-chunk',
      objectType: 'docs',
      path: ['Realtime Media', 'Voice'],
      platform: ['web'],
      product: 'voice',
      section: 'Implement the logic',
      snippet: '…enable <mark>VAD</mark> on Web for calls…',
      tab: 'realtime-media',
      title: '<mark>Voice</mark> Activity Detection',
      url: '/en/realtime-media/voice/vad#implement-the-logic',
    });
    expect(results[1]).toMatchObject({
      id: 'type-section',
      section: 'Type definitions',
      url: '/en/realtime-media/voice/vad#type-definitions',
    });
  });

  it("preserves Algolia's server ranking without re-sorting client-side", async () => {
    // Ranking is the server's job (textual relevance + category
    // optionalFilters). The client must return hits in the order Algolia gave
    // them — re-sorting here could fight the server (e.g. lift a glossary
    // heading match above a demoted-but-relevant feature page).
    const searchForHits = vi.fn().mockResolvedValue({
      results: [
        {
          hits: [
            {
              _highlightResult: {
                content: {
                  matchLevel: 'full',
                  value: 'a <mark>dual</mark> stream feature',
                },
                title: { matchLevel: 'none', value: 'Simulcasting' },
              },
              objectID: 'feature',
              objectType: 'docs',
              title: 'Simulcasting',
              url: '/en/realtime-media/video/build/simulcasting',
            },
            {
              _highlightResult: {
                section: {
                  matchLevel: 'full',
                  value: '<mark>Dual</mark> stream',
                },
                title: { matchLevel: 'none', value: 'Glossary' },
              },
              objectID: 'glossary',
              objectType: 'docs',
              section: 'Dual stream',
              section_id: 'dual-stream',
              title: 'Glossary',
              url: '/en/realtime-media/video/reference/glossary',
            },
          ],
        },
      ],
    });
    vi.mocked(liteClient).mockReturnValue({ searchForHits } as never);

    const client = createAlgoliaDocsClient({
      appId: 'app-id',
      indexName: 'docs_portal_en',
      locale: 'en',
      searchApiKey: 'search-key',
    });

    const results = await client.search('dual stream');

    // Order matches the input; the glossary heading match is NOT lifted above
    // the feature page Algolia ranked first.
    expect(results.map((entry) => entry.id)).toEqual(['feature', 'glossary']);
  });

  it('falls back to the description when only the title matched, and humanizes acronym path segments', async () => {
    const searchForHits = vi.fn().mockResolvedValue({
      results: [
        {
          hits: [
            {
              _highlightResult: {
                content: {
                  matchLevel: 'none',
                  value: 'Unrelated leading body text.',
                },
                title: {
                  matchLevel: 'full',
                  value: '<mark>Start</mark> a Real-time STT agent',
                },
              },
              // Algolia returns a content snippet even when content did not match.
              _snippetResult: {
                content: {
                  value: 'Unrelated leading body text with no highlight…',
                },
              },
              description: 'Create and start a real-time STT agent.',
              objectID: 'title-only',
              objectType: 'openapi',
              title: 'Start a Real-time STT agent',
              url: '/en/api-reference/api-ref/speech-to-text/join',
            },
          ],
        },
      ],
    });
    vi.mocked(liteClient).mockReturnValue({ searchForHits } as never);

    const client = createAlgoliaDocsClient({
      appId: 'app-id',
      indexName: 'docs_portal_en',
      locale: 'en',
      searchApiKey: 'search-key',
    });

    const results = await client.search('start');

    expect(results[0]).toMatchObject({
      // Body snippet is ignored because content did not match; the clean
      // description is shown instead of an unrelated leading-body excerpt.
      snippet: 'Create and start a real-time STT agent.',
      // Trailing page slug ("join") dropped; "api-ref" and "stt" uppercased.
      path: ['API Reference', 'API Ref', 'Speech To Text'],
    });
  });
});
