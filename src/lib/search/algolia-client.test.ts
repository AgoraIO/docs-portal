import { liteClient } from 'algoliasearch/lite';
import { describe, expect, it, vi } from 'vitest';
import { createAlgoliaDocsClient } from './algolia-client';

vi.mock('algoliasearch/lite', () => ({
  liteClient: vi.fn(),
}));

describe('createAlgoliaDocsClient', () => {
  it('searches SDK API references alongside docs and normalizes their hierarchy', async () => {
    const searchForHits = vi.fn().mockResolvedValue({
      results: [
        {
          hits: [
            {
              objectID: 'guide',
              objectType: 'docs',
              title: 'In-call quality monitoring',
              url: '/en/realtime-media/video/in-call-quality',
            },
          ],
        },
        {
          hits: [
            {
              _highlightResult: {
                content: {
                  matchLevel: 'full',
                  value: 'The <mark>uplinkNetworkQuality</mark> property.',
                },
                hierarchy: {
                  lvl1: {
                    matchLevel: 'full',
                    value: '<mark>uplinkNetworkQuality</mark>',
                  },
                },
              },
              _snippetResult: {
                content: {
                  value: 'The <mark>uplinkNetworkQuality</mark> property.',
                },
              },
              content: 'The uplinkNetworkQuality property.',
              hierarchy: {
                lvl0: 'API Reference ❯ Video Sdk ❯ Web ❯ 4.x',
                lvl1: 'uplinkNetworkQuality',
              },
              objectID: 'api-property',
              platform: 'web',
              product: 'video-sdk',
              url: 'https://api-ref.agora.io/en/video-sdk/web/4.x/interfaces/NetworkQuality.html#uplinkNetworkQuality',
              version: '4.x',
            },
          ],
        },
      ],
    });
    vi.mocked(liteClient).mockReturnValue({ searchForHits } as never);

    const client = createAlgoliaDocsClient({
      apiReferenceIndexName: 'agora_APIRefSearch',
      appId: 'app-id',
      indexName: 'docs_portal_en',
      locale: 'en',
      platform: 'web',
      scope: { field: 'product', value: 'video' },
      searchApiKey: 'search-key',
    });

    const results = await client.search('networkquality');

    expect(searchForHits).toHaveBeenCalledWith({
      requests: [
        expect.objectContaining({
          filters: 'locale:en AND platform:web AND product:"video"',
          indexName: 'docs_portal_en',
        }),
        expect.objectContaining({
          filters: 'platform:web AND product:"video-sdk"',
          hitsPerPage: 5,
          indexName: 'agora_APIRefSearch',
          query: 'networkquality',
        }),
      ],
    });
    expect(results).toHaveLength(2);
    expect(results[0]).toMatchObject({
      id: 'api-property',
      objectType: 'sdk-api',
      path: ['API Reference', 'Video SDK', 'Web', '4.x'],
      platform: ['web'],
      product: 'video-sdk',
      snippet: 'The <mark>uplinkNetworkQuality</mark> property.',
      title: '<mark>uplinkNetworkQuality</mark>',
      url: 'https://api-ref.agora.io/en/video-sdk/web/4.x/interfaces/NetworkQuality.html#uplinkNetworkQuality',
      version: '4.x',
    });
    expect(results[1]).toMatchObject({ id: 'guide', objectType: 'docs' });
  });

  it('does not mix SDK API results into unsupported docs scopes', async () => {
    const searchForHits = vi.fn().mockResolvedValue({
      results: [{ hits: [] }],
    });
    vi.mocked(liteClient).mockReturnValue({ searchForHits } as never);

    const client = createAlgoliaDocsClient({
      apiReferenceIndexName: 'agora_APIRefSearch',
      appId: 'app-id',
      indexName: 'docs_portal_en',
      locale: 'en',
      scope: { field: 'tab', value: 'ai' },
      searchApiKey: 'search-key',
    });

    await client.search('start');

    expect(searchForHits).toHaveBeenCalledWith({
      requests: [
        expect.objectContaining({
          filters: 'locale:en AND tab:"ai"',
          indexName: 'docs_portal_en',
        }),
      ],
    });
  });

  it('maps portal RTC and JavaScript filters to API index facets', async () => {
    const searchForHits = vi.fn().mockResolvedValue({
      results: [
        { hits: [] },
        {
          hits: [
            {
              hierarchy: {
                lvl0: 'API Reference ❯ Video Sdk ❯ React.js ❯ 4.x',
                lvl1: 'NetworkQuality',
              },
              objectID: 'react-api',
              platform: 'reactjs',
              product: 'video-sdk',
              url: 'https://api-ref.agora.io/react-api',
            },
          ],
        },
      ],
    });
    vi.mocked(liteClient).mockReturnValue({ searchForHits } as never);

    const client = createAlgoliaDocsClient({
      apiReferenceIndexName: 'agora_APIRefSearch',
      appId: 'app-id',
      indexName: 'docs_portal_en',
      locale: 'en',
      platform: 'javascript',
      scope: { field: 'product', value: 'rtc' },
      searchApiKey: 'search-key',
    });

    const results = await client.search('networkquality');

    expect(searchForHits).toHaveBeenCalledWith({
      requests: [
        expect.objectContaining({
          filters: 'locale:en AND platform:javascript AND product:"rtc"',
        }),
        expect.objectContaining({
          filters:
            'platform:reactjs AND (product:"video-sdk" OR product:"voice-sdk")',
        }),
      ],
    });
    expect(results[0]).toMatchObject({
      objectType: 'sdk-api',
      platform: ['javascript'],
    });
  });

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
              breadcrumbs: ['RTC', 'Voice Calling'],
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
      breadcrumbs: ['RTC', 'Voice Calling'],
      id: 'first-chunk',
      objectType: 'docs',
      path: ['RTC', 'Voice Calling'],
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
              breadcrumbs: ['API Reference', 'Speech-to-Text'],
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
      path: ['API Reference', 'Speech-to-Text'],
    });
  });
});
