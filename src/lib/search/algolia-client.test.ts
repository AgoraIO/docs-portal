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
              url: 'https://api-ref.agora.io/en/video-sdk/web/4.x/interfaces/networkquality.html',
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
      title: 'NetworkQuality › <mark>uplinkNetworkQuality</mark>',
      url: 'https://api-ref.agora.io/en/video-sdk/web/4.x/interfaces/networkquality.html#uplinknetworkquality',
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

  it('preserves API page titles and existing member anchors', async () => {
    const searchForHits = vi.fn().mockResolvedValue({
      results: [
        { hits: [] },
        {
          hits: [
            {
              hierarchy: {
                lvl0: 'API Reference ❯ Video Sdk ❯ Web ❯ 4.x',
                lvl1: 'Interface NetworkQuality',
              },
              objectID: 'interface-page',
              platform: 'web',
              url: 'https://api-ref.agora.io/en/video-sdk/web/4.x/interfaces/networkquality.html',
            },
            {
              hierarchy: {
                lvl0: 'API Reference ❯ Video Sdk ❯ Web ❯ 4.x',
                lvl1: 'uplinkNetworkQuality',
              },
              objectID: 'anchored-member',
              platform: 'web',
              url: 'https://api-ref.agora.io/en/video-sdk/web/4.x/interfaces/networkquality.html#existing-anchor',
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
      searchApiKey: 'search-key',
    });

    const results = await client.search('networkquality');

    expect(results[0]).toMatchObject({
      title: 'Interface NetworkQuality',
      url: 'https://api-ref.agora.io/en/video-sdk/web/4.x/interfaces/networkquality.html',
    });
    expect(results[1]).toMatchObject({
      title: 'NetworkQuality › uplinkNetworkQuality',
      url: 'https://api-ref.agora.io/en/video-sdk/web/4.x/interfaces/networkquality.html#existing-anchor',
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

  describe('ranking v2', () => {
    function createClient(
      overrides: Partial<Parameters<typeof createAlgoliaDocsClient>[0]> = {},
    ) {
      return createAlgoliaDocsClient({
        apiReferenceIndexName: 'agora_APIRefSearch',
        appId: 'app-id',
        indexName: 'docs_portal_en',
        locale: 'en',
        rankingV2: true,
        searchApiKey: 'search-key',
        ...overrides,
      });
    }

    function docsHit(
      overrides: Record<string, unknown> = {},
    ): Record<string, unknown> {
      return {
        objectID: 'guide',
        objectType: 'docs',
        title: 'Voice agent quickstart',
        url: '/en/voice-ai/voice-agents/quickstart',
        ...overrides,
      };
    }

    function apiHit(
      overrides: Record<string, unknown> = {},
    ): Record<string, unknown> {
      return {
        _highlightResult: {
          hierarchy: {
            lvl1: { matchLevel: 'full', value: '<mark>joinChannel</mark>' },
          },
        },
        _snippetResult: {
          content: {
            value: 'Call <mark>joinChannel</mark> to enter the channel.',
          },
        },
        content: 'Call joinChannel to enter the channel.',
        hierarchy: {
          lvl0: 'API Reference ❯ Video Sdk ❯ Web ❯ 4.x (current)',
          lvl1: 'joinChannel',
        },
        objectID: 'join-channel',
        platform: 'web',
        product: 'video-sdk',
        url: 'https://api-ref.agora.io/en/video-sdk/web/4.x/interfaces/rtcengine.html#joinchannel',
        version: '4.x',
        ...overrides,
      };
    }

    function federatedResponse({
      apiHits = [],
      docsHits = [docsHit()],
    }: {
      apiHits?: Record<string, unknown>[];
      docsHits?: Record<string, unknown>[];
    } = {}) {
      return {
        results: [{ hits: docsHits }, { hits: apiHits }],
      };
    }

    it('对普通文档查询在首次请求中联合检索 Docs 和 SDK API', async () => {
      const searchForHits = vi.fn().mockResolvedValue(federatedResponse());
      vi.mocked(liteClient).mockReturnValue({ searchForHits } as never);

      const client = createClient();
      const results = await client.search('voice agent quickstart');

      expect(searchForHits).toHaveBeenCalledTimes(1);
      expect(searchForHits).toHaveBeenCalledWith({
        requests: [
          expect.objectContaining({
            indexName: 'docs_portal_en',
            query: 'voice agent quickstart',
          }),
          expect.objectContaining({
            indexName: 'agora_APIRefSearch',
            query: 'voice agent quickstart',
          }),
        ],
      });
      expect(results[0]).toMatchObject({
        id: 'guide',
        title: 'Voice agent quickstart',
      });
      expect(client.getLastStatus()).toEqual({
        api: 'success',
        docs: 'success',
      });
    });

    it('requests both indexes with strict API parameters and ranks an exact symbol first', async () => {
      const searchForHits = vi.fn().mockResolvedValue({
        results: [
          {
            hits: [
              docsHit({
                objectID: 'join-guide',
                title: 'Join a channel',
                url: '/en/video-calling/get-started/join-a-channel',
              }),
            ],
          },
          { hits: [apiHit()] },
        ],
      });
      vi.mocked(liteClient).mockReturnValue({ searchForHits } as never);

      const client = createClient();
      const results = await client.search('joinChannel');

      expect(searchForHits).toHaveBeenCalledTimes(1);
      expect(searchForHits).toHaveBeenCalledWith({
        requests: [
          expect.objectContaining({
            indexName: 'docs_portal_en',
            minWordSizefor1Typo: 5,
            query: 'joinChannel',
            typoTolerance: 'min',
          }),
          expect.objectContaining({
            hitsPerPage: 20,
            indexName: 'agora_APIRefSearch',
            query: 'joinChannel',
            queryType: 'prefixAll',
            removeWordsIfNoResults: 'none',
            typoTolerance: false,
          }),
        ],
      });
      expect(results[0]).toMatchObject({
        content: '<mark>joinChannel</mark>',
        id: 'join-channel',
        objectType: 'sdk-api',
        snippet: 'Call <mark>joinChannel</mark> to enter the channel.',
        title: '<mark>joinChannel</mark>',
      });
      expect(client.getLastStatus()).toEqual({
        api: 'success',
        docs: 'success',
      });
    });

    it.each([
      ['setAudioProfile method', 'setAudioProfile', 'set-audio-profile', false],
      ['renewToken api', 'renewToken', 'renew-token', false],
      ['joinChannel method', 'joinChannel', 'join-channel', false],
      ['RtcEngine class', 'Class AgoraRtcEngineKit', 'rtc-engine', true],
    ])(
      'strictly admits %s by API identity and puts it before documentation',
      async (query, rawSymbol, objectID, aliasesExactMatch) => {
        const searchForHits = vi.fn().mockResolvedValue({
          results: [
            { hits: [docsHit()] },
            {
              hits: [
                apiHit({
                  _highlightResult: {
                    hierarchy: {
                      lvl1: {
                        matchLevel: 'full',
                        value: `<mark>${rawSymbol}</mark>`,
                      },
                    },
                  },
                  hierarchy: {
                    lvl0: 'API Reference ❯ Video SDK ❯ iOS ❯ 4.x (current)',
                    lvl1: rawSymbol,
                  },
                  objectID,
                  platform: 'ios',
                  url:
                    rawSymbol === 'Class AgoraRtcEngineKit'
                      ? 'https://api-ref.agora.io/en/video-sdk/ios/4.x/API/class_agorartcenginekit.html'
                      : 'https://api-ref.agora.io/en/video-sdk/ios/4.x/API/class_irtcengine.html',
                }),
              ],
            },
          ],
        });
        vi.mocked(liteClient).mockReturnValue({ searchForHits } as never);

        const results = await createClient().search(query);

        expect(searchForHits).toHaveBeenCalledTimes(1);
        expect(results[0]).toMatchObject({
          aliasesExactMatch,
          id: objectID,
          objectType: 'sdk-api',
          titleExactMatch: !aliasesExactMatch,
        });
        expect(results[1]).toMatchObject({ id: 'guide' });
      },
    );

    it('does not admit a weak API hit for a modifier query without an API identity', async () => {
      const searchForHits = vi.fn().mockResolvedValue({
        results: [
          {
            hits: [docsHit({ objectID: 'audio-guide', title: 'Audio guide' })],
          },
          {
            hits: [
              apiHit({
                _highlightResult: {
                  hierarchy: {
                    lvl1: {
                      matchLevel: 'full',
                      value: '<mark>AudioVolumeInfo</mark>',
                    },
                  },
                },
                hierarchy: {
                  lvl0: 'API Reference ❯ Video SDK ❯ Web ❯ 4.x (current)',
                  lvl1: 'AudioVolumeInfo',
                },
                objectID: 'audio-volume-info',
              }),
            ],
          },
        ],
      });
      vi.mocked(liteClient).mockReturnValue({ searchForHits } as never);

      const results = await createClient().search('audio method');

      expect(results).toEqual([
        expect.objectContaining({ id: 'audio-guide', objectType: 'docs' }),
      ]);
    });

    it.each([
      ['RtcEngine.joinChannel', true],
      ['use RtcEngine.joinChannel method', true],
      ['MediaEngine.joinChannel', false],
    ])(
      'matches qualified API identity %s only for the containing class',
      async (query, shouldAdmit) => {
        const searchForHits = vi.fn().mockResolvedValue({
          results: [
            { hits: [docsHit()] },
            {
              hits: [
                apiHit({
                  _highlightResult: {
                    hierarchy: {
                      lvl1: {
                        matchLevel: 'full',
                        value: '<mark>Class IRtcEngine</mark>',
                      },
                      lvl2: {
                        matchLevel: 'full',
                        value: '<mark>joinChannel</mark>',
                      },
                    },
                  },
                  hierarchy: {
                    lvl0: 'API Reference ❯ Video SDK ❯ Web ❯ 4.x (current)',
                    lvl1: 'Class IRtcEngine',
                    lvl2: 'joinChannel',
                  },
                  objectID: 'rtc-engine-join-channel',
                  url: 'https://api-ref.agora.io/en/video-sdk/web/4.x/interfaces/irtcengine.html#joinchannel',
                }),
              ],
            },
          ],
        });
        vi.mocked(liteClient).mockReturnValue({ searchForHits } as never);

        const results = await createClient().search(query);

        expect(results.map(({ id }) => id)).toEqual(
          shouldAdmit ? ['rtc-engine-join-channel', 'guide'] : ['guide'],
        );
        if (shouldAdmit) {
          expect(results[0]).toMatchObject({
            aliasesExactMatch: true,
            titleExactMatch: false,
          });
        }
      },
    );

    it('searches the API index for an explicit symbol query with a modifier', async () => {
      const searchForHits = vi.fn().mockResolvedValue(
        federatedResponse({
          apiHits: [
            apiHit({
              _highlightResult: {
                hierarchy: {
                  lvl1: {
                    matchLevel: 'full',
                    value: '<mark>setAudioProfile</mark>',
                  },
                },
              },
              hierarchy: {
                lvl0: 'API Reference ❯ Video Sdk ❯ Web ❯ 4.x (current)',
                lvl1: 'setAudioProfile',
              },
              objectID: 'set-audio-profile',
              url: 'https://api-ref.agora.io/en/video-sdk/web/4.x/interfaces/rtcengine.html#setaudioprofile',
            }),
          ],
        }),
      );
      vi.mocked(liteClient).mockReturnValue({ searchForHits } as never);

      const client = createClient();
      const results = await client.search('setAudioProfile method');

      expect(searchForHits).toHaveBeenCalledTimes(1);
      expect(searchForHits).toHaveBeenCalledWith({
        requests: [
          expect.objectContaining({ indexName: 'docs_portal_en' }),
          expect.objectContaining({
            indexName: 'agora_APIRefSearch',
            query: 'setAudioProfile',
          }),
        ],
      });
      expect(results).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'set-audio-profile',
            objectType: 'sdk-api',
          }),
        ]),
      );
    });

    it('rejects a longer API symbol for an explicit symbol query with a modifier', async () => {
      const searchForHits = vi.fn().mockResolvedValue({
        results: [
          { hits: [docsHit()] },
          {
            hits: [
              apiHit({
                _highlightResult: {
                  hierarchy: {
                    lvl1: {
                      matchLevel: 'full',
                      value: '<mark>preRenewToken</mark>',
                    },
                  },
                },
                hierarchy: {
                  lvl0: 'API Reference ❯ Video Sdk ❯ Web ❯ 4.x (current)',
                  lvl1: 'preRenewToken',
                },
                objectID: 'pre-renew-token',
              }),
            ],
          },
        ],
      });
      vi.mocked(liteClient).mockReturnValue({ searchForHits } as never);

      const client = createClient();
      const results = await client.search('renewToken api');

      expect(results.map(({ id }) => id)).toEqual(['guide']);
    });

    it('keeps Documentation before API Reference for API task queries', async () => {
      const searchForHits = vi.fn().mockResolvedValue(
        federatedResponse({
          apiHits: [
            apiHit({
              _highlightResult: {
                hierarchy: {
                  lvl1: {
                    matchLevel: 'full',
                    value: '<mark>renewToken</mark>',
                  },
                },
              },
              hierarchy: {
                lvl0: 'API Reference ❯ Video Sdk ❯ Web ❯ 4.x (current)',
                lvl1: 'renewToken',
              },
              objectID: 'renew-token',
            }),
          ],
          docsHits: [
            docsHit({
              objectID: 'renew-guide',
              title: 'Renew token guide',
            }),
          ],
        }),
      );
      vi.mocked(liteClient).mockReturnValue({ searchForHits } as never);

      const client = createClient();
      const results = await client.search('renew token');

      expect(results.map(({ id }) => id)).toEqual([
        'renew-guide',
        'renew-token',
      ]);
    });

    it('keeps both federated sections when Documentation fills its limit', async () => {
      const searchForHits = vi.fn().mockResolvedValue({
        results: [
          {
            hits: Array.from({ length: 10 }, (_, index) =>
              docsHit({
                objectID: `renew-guide-${index}`,
                title: `Renew token guide ${index}`,
              }),
            ),
          },
          {
            hits: [
              apiHit({
                _highlightResult: {
                  hierarchy: {
                    lvl1: {
                      matchLevel: 'full',
                      value: '<mark>renewToken</mark>',
                    },
                  },
                },
                hierarchy: {
                  lvl0: 'API Reference ❯ Video Sdk ❯ Web ❯ 4.x (current)',
                  lvl1: 'renewToken',
                },
                objectID: 'renew-token',
              }),
            ],
          },
        ],
      });
      vi.mocked(liteClient).mockReturnValue({ searchForHits } as never);

      const client = createClient();
      const results = await client.search('renew token');

      expect(results).toHaveLength(11);
      expect(results.at(-1)).toMatchObject({ id: 'renew-token' });
    });

    it('uses retrieval aliases in requests while retaining original-query intent behavior', async () => {
      const searchForHits = vi.fn().mockResolvedValue(
        federatedResponse({
          apiHits: [
            apiHit({
              _highlightResult: {
                hierarchy: {
                  lvl1: {
                    matchLevel: 'full',
                    value: '<mark>Class AgoraRtcEngineKit</mark>',
                  },
                },
              },
              hierarchy: {
                lvl0: 'API Reference ❯ Video Sdk ❯ iOS ❯ 4.x (current)',
                lvl1: 'Class AgoraRtcEngineKit',
              },
              objectID: 'agora-rtc-engine-kit',
              platform: 'ios',
              url: 'https://api-ref.agora.io/en/video-sdk/ios/4.x/API/class_agorartcenginekit.html',
            }),
          ],
        }),
      );
      vi.mocked(liteClient).mockReturnValue({ searchForHits } as never);

      const client = createClient();
      const results = await client.search('RtcEngine');

      expect(searchForHits).toHaveBeenCalledTimes(1);
      expect(searchForHits).toHaveBeenCalledWith({
        requests: [
          expect.objectContaining({
            indexName: 'docs_portal_en',
            query: 'RtcEngine',
          }),
          expect.objectContaining({
            indexName: 'agora_APIRefSearch',
            query: 'AgoraRtcEngineKit',
          }),
        ],
      });
      expect(results[0]).toMatchObject({
        canonicalKey: 'video-sdk|rtcengine|class',
        id: 'agora-rtc-engine-kit',
        recordKind: 'sdk-symbol',
      });
    });

    it.each([
      {
        apiSymbol: 'iOS',
        docId: 'bluetooth-ios-guide',
        docTitle: 'Bluetooth iOS troubleshooting',
        query: 'Bluetooth iOS API',
      },
      {
        apiSymbol: 'IoT',
        docId: 'iot-sdk-guide',
        docTitle: 'IoT SDK overview',
        query: 'IoT SDK API',
      },
      {
        apiSymbol: 'iOS',
        docId: 'ios-api-guide',
        docTitle: 'How to use the iOS API',
        query: 'how to use iOS API',
      },
      {
        apiSymbol: 'IoT',
        docId: 'iot-api-guide',
        docTitle: 'How to use the IoT SDK API',
        query: 'how to use IoT SDK API',
      },
      {
        apiSymbol: 'IoT',
        docId: 'configure-iot-api-guide',
        docTitle: 'Configure the IoT SDK API',
        query: 'configure IoT SDK API',
      },
    ])(
      'keeps the full $query retrieval query and rejects an intent-conflicting exact API hit',
      async ({ apiSymbol, docId, docTitle, query }) => {
        const searchForHits = vi.fn().mockResolvedValue(
          federatedResponse({
            apiHits: [
              apiHit({
                _highlightResult: {
                  hierarchy: {
                    lvl1: {
                      matchLevel: 'full',
                      value: `<mark>${apiSymbol}</mark>`,
                    },
                  },
                },
                hierarchy: {
                  lvl0: 'API Reference ❯ Video SDK ❯ Web ❯ 4.x (current)',
                  lvl1: apiSymbol,
                },
                objectID: `${apiSymbol.toLowerCase()}-api`,
              }),
            ],
            docsHits: [docsHit({ objectID: docId, title: docTitle })],
          }),
        );
        vi.mocked(liteClient).mockReturnValue({ searchForHits } as never);

        const results = await createClient().search(query);

        expect(searchForHits).toHaveBeenCalledTimes(1);
        expect(searchForHits).toHaveBeenCalledWith({
          requests: [
            expect.objectContaining({
              indexName: 'docs_portal_en',
              query,
            }),
            expect.objectContaining({
              indexName: 'agora_APIRefSearch',
              query,
            }),
          ],
        });
        expect(results.map(({ id }) => id)).toEqual([docId]);
        expect(results[0]).toMatchObject({ id: docId, recordKind: 'guide' });
      },
    );

    it.each(['iOS', 'IoT', 'ReactNative', 'ReactJS', 'React-JS', 'VideoSdk'])(
      'rejects the same-named API hit for direct domain query %s',
      async (query) => {
        const docId = `docs-${query.toLowerCase()}`;
        const searchForHits = vi.fn().mockResolvedValue(
          federatedResponse({
            apiHits: [
              apiHit({
                _highlightResult: {
                  hierarchy: {
                    lvl1: {
                      matchLevel: 'full',
                      value: `<mark>${query}</mark>`,
                    },
                  },
                },
                hierarchy: {
                  lvl0: 'API Reference ❯ Video SDK ❯ Web ❯ 4.x (current)',
                  lvl1: query,
                },
                objectID: `api-${query.toLowerCase()}`,
              }),
            ],
            docsHits: [docsHit({ objectID: docId, title: query })],
          }),
        );
        vi.mocked(liteClient).mockReturnValue({ searchForHits } as never);

        const results = await createClient().search(query);

        expect(searchForHits).toHaveBeenCalledWith({
          requests: [
            expect.objectContaining({
              indexName: 'docs_portal_en',
              query,
            }),
            expect.objectContaining({
              indexName: 'agora_APIRefSearch',
              query,
            }),
          ],
        });
        expect(results.map(({ id }) => id)).toEqual([docId]);
      },
    );

    it.each(['ReactJS', 'React-JS'])(
      'admits direct platform alias query %s API hit first in explicit API Reference scope',
      async (query) => {
        const apiId = `api-${query.toLowerCase()}`;
        const docsId = `docs-${query.toLowerCase()}`;
        const searchForHits = vi.fn().mockResolvedValue(
          federatedResponse({
            apiHits: [
              apiHit({
                hierarchy: {
                  lvl0: 'API Reference ❯ Video SDK ❯ Web ❯ 4.x (current)',
                  lvl1: query,
                },
                objectID: apiId,
              }),
            ],
            docsHits: [docsHit({ objectID: docsId, title: query })],
          }),
        );
        vi.mocked(liteClient).mockReturnValue({ searchForHits } as never);

        const results = await createClient({
          scope: { field: 'tab', value: 'api-reference' },
        }).search(query);

        expect(searchForHits).toHaveBeenCalledWith({
          requests: [
            expect.objectContaining({ query }),
            expect.objectContaining({ query }),
          ],
        });
        expect(results.map(({ id }) => id)).toEqual([apiId, docsId]);
      },
    );

    it('admits a direct platform query API hit first in explicit API Reference scope', async () => {
      const searchForHits = vi.fn().mockResolvedValue(
        federatedResponse({
          apiHits: [
            apiHit({
              hierarchy: {
                lvl0: 'API Reference ❯ Video SDK ❯ iOS ❯ 4.x (current)',
                lvl1: 'iOS',
              },
              objectID: 'ios-api',
              platform: 'ios',
            }),
          ],
          docsHits: [docsHit({ objectID: 'ios-docs', title: 'iOS' })],
        }),
      );
      vi.mocked(liteClient).mockReturnValue({ searchForHits } as never);

      const results = await createClient({
        scope: { field: 'tab', value: 'api-reference' },
      }).search('iOS');

      expect(searchForHits).toHaveBeenCalledWith({
        requests: [
          expect.objectContaining({ query: 'iOS' }),
          expect.objectContaining({ query: 'iOS' }),
        ],
      });
      expect(results.map(({ id }) => id)).toEqual(['ios-api', 'ios-docs']);
    });

    it('preserves exact API identity retrieval inside explicit API Reference scope', async () => {
      const searchForHits = vi.fn().mockResolvedValue(
        federatedResponse({
          apiHits: [
            apiHit({
              _highlightResult: {
                hierarchy: {
                  lvl1: { matchLevel: 'full', value: '<mark>iOS</mark>' },
                },
              },
              hierarchy: {
                lvl0: 'API Reference ❯ Video SDK ❯ iOS ❯ 4.x (current)',
                lvl1: 'iOS',
              },
              objectID: 'ios-api',
              platform: 'ios',
            }),
          ],
          docsHits: [
            docsHit({
              objectID: 'bluetooth-ios-guide',
              title: 'Bluetooth iOS troubleshooting',
            }),
          ],
        }),
      );
      vi.mocked(liteClient).mockReturnValue({ searchForHits } as never);

      const results = await createClient({
        scope: { field: 'tab', value: 'api-reference' },
      }).search('Bluetooth iOS API');

      expect(searchForHits).toHaveBeenCalledTimes(1);
      expect(searchForHits).toHaveBeenCalledWith({
        requests: [
          expect.objectContaining({
            indexName: 'docs_portal_en',
            query: 'Bluetooth iOS API',
          }),
          expect.objectContaining({
            indexName: 'agora_APIRefSearch',
            query: 'Bluetooth iOS API',
          }),
        ],
      });
      expect(results.map(({ id }) => id)).toEqual([
        'ios-api',
        'bluetooth-ios-guide',
      ]);
      expect(results[0]).toMatchObject({
        id: 'ios-api',
        recordKind: 'sdk-symbol',
        titleExactMatch: false,
      });
    });

    it('gives an API-task matched phrase priority over a conflicting lexical identity', async () => {
      const searchForHits = vi.fn().mockResolvedValue(
        federatedResponse({
          apiHits: [
            apiHit({
              _highlightResult: {
                hierarchy: {
                  lvl1: {
                    matchLevel: 'full',
                    value: '<mark>setAudioProfile</mark>',
                  },
                },
              },
              hierarchy: {
                lvl0: 'API Reference ❯ Video SDK ❯ Web ❯ 4.x (current)',
                lvl1: 'setAudioProfile',
              },
              objectID: 'set-audio-profile',
            }),
            apiHit({
              _highlightResult: {
                hierarchy: {
                  lvl1: {
                    matchLevel: 'full',
                    value: '<mark>renewToken</mark>',
                  },
                },
              },
              hierarchy: {
                lvl0: 'API Reference ❯ Video SDK ❯ Web ❯ 4.x (current)',
                lvl1: 'renewToken',
              },
              objectID: 'renew-token',
            }),
          ],
          docsHits: [
            docsHit({
              objectID: 'renew-guide',
              title: 'Renew token guide',
            }),
          ],
        }),
      );
      vi.mocked(liteClient).mockReturnValue({ searchForHits } as never);

      const results = await createClient().search(
        'renew token setAudioProfile method',
      );

      expect(searchForHits).toHaveBeenCalledTimes(1);
      expect(searchForHits).toHaveBeenCalledWith({
        requests: [
          expect.objectContaining({ query: 'renew token' }),
          expect.objectContaining({ query: 'renew token' }),
        ],
      });
      expect(results.map(({ id }) => id)).toEqual([
        'renew-guide',
        'renew-token',
      ]);
      expect(results[1]).toMatchObject({
        id: 'renew-token',
        recordKind: 'sdk-symbol',
        titleExactMatch: false,
      });
      expect(results.some(({ id }) => id === 'set-audio-profile')).toBe(false);
    });

    it.each([
      ['billing policy', 'billing policies'],
      ['real-time transcription', 'speech to text'],
      ['real time transcription', 'speech to text'],
    ])('uses docs retrieval alias %s -> %s', async (query, retrievalQuery) => {
      const searchForHits = vi.fn().mockResolvedValue(federatedResponse());
      vi.mocked(liteClient).mockReturnValue({ searchForHits } as never);

      const client = createClient();
      await client.search(query);

      expect(searchForHits).toHaveBeenCalledWith({
        requests: [
          expect.objectContaining({
            indexName: 'docs_portal_en',
            query: retrievalQuery,
          }),
          expect.objectContaining({
            indexName: 'agora_APIRefSearch',
            query,
          }),
        ],
      });
    });

    it('treats call syntax as an exact API symbol alias ahead of an exact docs title', async () => {
      const searchForHits = vi.fn().mockResolvedValue(
        federatedResponse({
          apiHits: [apiHit()],
          docsHits: [
            docsHit({
              objectID: 'join-channel-docs',
              title: 'joinChannel()',
              url: '/en/reference/join-channel',
            }),
          ],
        }),
      );
      vi.mocked(liteClient).mockReturnValue({ searchForHits } as never);

      const client = createClient();
      const results = await client.search('joinChannel()');

      expect(results.map(({ id }) => id)).toEqual([
        'join-channel',
        'join-channel-docs',
      ]);
    });

    it('drops a weak API hit after an api-task query requests the API index', async () => {
      const searchForHits = vi.fn().mockResolvedValue(
        federatedResponse({
          docsHits: [],
          apiHits: [
            apiHit({
              _highlightResult: {
                hierarchy: {
                  lvl1: {
                    matchLevel: 'full',
                    value: '<mark>setAudioProfile</mark>',
                  },
                },
              },
              hierarchy: {
                lvl0: 'API Reference ❯ Video Sdk ❯ Web ❯ 4.x (current)',
                lvl1: 'setAudioProfile',
              },
              objectID: 'set-audio-profile',
              url: 'https://api-ref.agora.io/en/video-sdk/web/4.x/interfaces/rtcengine.html#setaudioprofile',
            }),
          ],
        }),
      );
      vi.mocked(liteClient).mockReturnValue({ searchForHits } as never);

      const client = createClient();

      await expect(client.search('renew token')).resolves.toEqual([]);
      expect(searchForHits).toHaveBeenCalledTimes(1);
      expect(client.getLastStatus()).toEqual({
        api: 'success',
        docs: 'success',
      });
    });

    it('drops content-only docs hits for an api-task query', async () => {
      const searchForHits = vi.fn().mockResolvedValue(
        federatedResponse({
          docsHits: [
            docsHit({
              _highlightResult: {
                content: {
                  matchLevel: 'full',
                  value:
                    'Reference notes for <mark>send streaming message</mark>.',
                },
                section: { matchLevel: 'none', value: 'References' },
                title: { matchLevel: 'none', value: 'Media streams' },
              },
              content: 'Reference notes for send streaming message.',
              objectID: 'content-only-reference',
              section: 'References',
              title: 'Media streams',
              url: '/en/reference/media-streams',
            }),
          ],
        }),
      );
      vi.mocked(liteClient).mockReturnValue({ searchForHits } as never);

      const client = createClient();

      await expect(client.search('send streaming message')).resolves.toEqual(
        [],
      );
    });

    it('drops api-task docs when title, section, and breadcrumbs match only one query term', async () => {
      const searchForHits = vi.fn().mockResolvedValue(
        federatedResponse({
          docsHits: [
            docsHit({
              breadcrumbs: ['API Reference', 'Video SDK', 'Web'],
              objectID: 'platform-message-reference',
              section: 'Messages',
              title: 'Web platform reference',
              url: '/en/api-reference/video-sdk/web/messages',
            }),
          ],
        }),
      );
      vi.mocked(liteClient).mockReturnValue({ searchForHits } as never);

      const client = createClient();

      await expect(client.search('send streaming message')).resolves.toEqual(
        [],
      );
    });

    it('keeps api-task docs when ordinary terms collectively match title, section, and breadcrumbs', async () => {
      const searchForHits = vi.fn().mockResolvedValue(
        federatedResponse({
          docsHits: [
            docsHit({
              breadcrumbs: ['API Reference', 'Cloud Recording'],
              objectID: 'query-recording-status',
              section: 'Cloud Recording',
              title: 'Query status',
              url: '/en/cloud-recording/restful-api/query-status',
            }),
          ],
        }),
      );
      vi.mocked(liteClient).mockReturnValue({ searchForHits } as never);

      const client = createClient();
      const results = await client.search('query recording status');

      expect(results[0]).toMatchObject({
        id: 'query-recording-status',
        sectionMatch: true,
        title: 'Query status',
      });
    });

    it('keeps an api-task document when a required term is supplied by the section', async () => {
      const searchForHits = vi.fn().mockResolvedValue(
        federatedResponse({
          docsHits: [
            docsHit({
              breadcrumbs: ['API Reference', 'Cloud Recording'],
              objectID: 'query-recording-section-status',
              section: 'Status',
              title: 'Query recording',
              url: '/en/cloud-recording/restful-api/query-status',
            }),
          ],
        }),
      );
      vi.mocked(liteClient).mockReturnValue({ searchForHits } as never);

      const client = createClient();
      const results = await client.search('query recording status');

      expect(results[0]).toMatchObject({
        id: 'query-recording-section-status',
        section: 'Status',
        sectionMatch: true,
      });
    });

    it('uses the REST API route context when admitting an API overview', async () => {
      const searchForHits = vi.fn().mockResolvedValue({
        results: [
          {
            hits: [
              docsHit({
                breadcrumbs: ['Reference', 'Cloud Recording'],
                objectID: 'cloud-recording-api-overview',
                title: 'Cloud Recording Overview',
                url: '/en/api-reference/api-ref/cloud-recording',
              }),
            ],
          },
          { hits: [] },
        ],
      });
      vi.mocked(liteClient).mockReturnValue({ searchForHits } as never);

      const client = createClient();
      const results = await client.search('cloud recording REST API');

      expect(results[0]).toMatchObject({
        id: 'cloud-recording-api-overview',
        recordKind: 'guide',
      });
    });

    it.each([
      'how to renew token',
      'please renew token',
      'how do I renew token',
      'can you please renew token',
      'we need the renew token API method',
      'renew token REST API',
      'help me find docs for renew token',
      'where is the documentation for renew token',
      'how should I renew token',
    ])('returns the exact API target for decorated query %s', async (query) => {
      const searchForHits = vi.fn().mockResolvedValue(
        federatedResponse({
          docsHits: [],
          apiHits: [
            apiHit({
              _highlightResult: {
                hierarchy: {
                  lvl1: {
                    matchLevel: 'full',
                    value: '<mark>renewToken</mark>',
                  },
                },
              },
              hierarchy: {
                lvl0: 'API Reference ❯ Video SDK ❯ Web ❯ 4.x (current)',
                lvl1: 'renewToken',
              },
              objectID: `renew-token:${query}`,
            }),
          ],
        }),
      );
      vi.mocked(liteClient).mockReturnValue({ searchForHits } as never);

      const client = createClient();
      const results = await client.search(query);

      expect(results[0]).toMatchObject({
        canonicalKey: 'video-sdk|rtcengine|renewtoken|member',
        id: `renew-token:${query}`,
      });
      expect(searchForHits).toHaveBeenCalledTimes(1);
      expect(searchForHits).toHaveBeenCalledWith({
        requests: [
          expect.objectContaining({ query: 'renew token' }),
          expect.objectContaining({ query: 'renew token' }),
        ],
      });
    });

    it.each([
      'the cloud recording REST API',
      'show me the cloud recording REST API',
      'I want the cloud recording REST API',
      'could you tell me the cloud recording REST API',
      'where are the docs for the cloud recording REST API',
    ])(
      'keeps semantic REST and API terms for decorated docs query %s',
      async (query) => {
        const searchForHits = vi.fn().mockResolvedValue(
          federatedResponse({
            docsHits: [
              docsHit({
                breadcrumbs: ['Cloud Recording'],
                objectID: 'cloud-recording-rest-api',
                title: 'Cloud Recording RESTful API',
                url: '/en/realtime-media/cloud-recording/reference/restful-api',
              }),
            ],
          }),
        );
        vi.mocked(liteClient).mockReturnValue({ searchForHits } as never);

        const client = createClient();
        const results = await client.search(query);

        expect(results[0]).toMatchObject({
          id: 'cloud-recording-rest-api',
          title: 'Cloud Recording RESTful API',
        });
        expect(searchForHits).toHaveBeenNthCalledWith(1, {
          requests: [
            expect.objectContaining({ query: 'cloud recording rest api' }),
            expect.objectContaining({ query: 'cloud recording rest api' }),
          ],
        });
      },
    );

    it('rejects real renew-token callbacks around the exact SDK symbol', async () => {
      const searchForHits = vi.fn().mockResolvedValue(
        federatedResponse({
          docsHits: [],
          apiHits: [
            apiHit({
              _highlightResult: {
                hierarchy: {
                  lvl1: {
                    matchLevel: 'full',
                    value: '<mark>onRenewTokenResult</mark>',
                  },
                },
              },
              hierarchy: {
                lvl0: 'API Reference ❯ Video SDK ❯ Web ❯ 4.x (current)',
                lvl1: 'onRenewTokenResult',
              },
              objectID: 'on-renew-token-result',
            }),
            apiHit({
              _highlightResult: {
                hierarchy: {
                  lvl1: {
                    matchLevel: 'full',
                    value: '<mark>renewToken</mark>',
                  },
                },
              },
              hierarchy: {
                lvl0: 'API Reference ❯ Video SDK ❯ Web ❯ 4.x (current)',
                lvl1: 'renewToken',
              },
              objectID: 'renew-token-exact',
            }),
          ],
        }),
      );
      vi.mocked(liteClient).mockReturnValue({ searchForHits } as never);

      const client = createClient();
      const results = await client.search('renew token');

      expect(results.map(({ id }) => id)).toEqual(['renew-token-exact']);
    });

    it('does not let the short ID term match inside video', async () => {
      const searchForHits = vi.fn().mockResolvedValue(
        federatedResponse({
          docsHits: [
            docsHit({
              objectID: 'acquire-video-resource',
              title: 'Acquire video resource',
              url: '/en/reference/acquire-video-resource',
            }),
          ],
        }),
      );
      vi.mocked(liteClient).mockReturnValue({ searchForHits } as never);

      const client = createClient();

      await expect(client.search('acquire resource ID')).resolves.toEqual([]);
    });

    it.each(['setAudioProfile', 'renewToken'])(
      'aggregates real-like Android, iOS, and Web %s hits',
      async (symbol) => {
        const searchForHits = vi.fn().mockResolvedValue(
          federatedResponse({
            docsHits: [],
            apiHits: [
              apiHit({
                _highlightResult: {
                  hierarchy: {
                    lvl1: {
                      matchLevel: 'full',
                      value: `<mark>${symbol}</mark>`,
                    },
                  },
                },
                hierarchy: {
                  lvl0: 'API Reference ❯ Video SDK ❯ Android ❯ 4.x (current)',
                  lvl1: symbol,
                },
                objectID: `android-${symbol}`,
                platform: 'android',
                url: 'https://api-ref.agora.io/en/video-sdk/android/4.x/API/class_irtcengine.html',
              }),
              apiHit({
                _highlightResult: {
                  hierarchy: {
                    lvl1: {
                      matchLevel: 'full',
                      value: `<mark>${symbol}</mark>(_:)`,
                    },
                  },
                },
                hierarchy: {
                  lvl0: 'API Reference ❯ Video SDK ❯ iOS ❯ 4.x (current)',
                  lvl1: `${symbol}(_:)`,
                },
                objectID: `ios-${symbol}`,
                platform: 'ios',
                url: `https://api-ref.agora.io/en/video-sdk/ios/4.x/documentation/agorartckit/agorartcenginekit/${symbol.toLowerCase()}(_:)`,
              }),
              apiHit({
                _highlightResult: {
                  hierarchy: {
                    lvl1: {
                      matchLevel: 'full',
                      value: `<mark>${symbol}</mark>`,
                    },
                  },
                },
                hierarchy: {
                  lvl0: 'API Reference ❯ Video SDK ❯ Web ❯ 4.x (current)',
                  lvl1: symbol,
                },
                objectID: `web-${symbol}`,
                platform: 'web',
                url: 'https://api-ref.agora.io/en/video-sdk/web/4.x/interfaces/iagorartcclient.html',
              }),
            ],
          }),
        );
        vi.mocked(liteClient).mockReturnValue({ searchForHits } as never);

        const client = createClient();
        const results = await client.search(symbol);

        expect(results).toHaveLength(1);
        expect(results[0]).toMatchObject({
          canonicalKey: `video-sdk|rtcengine|${symbol.toLowerCase()}|member`,
          platform: ['android', 'ios', 'web'],
        });
      },
    );

    it('keeps content-only api-task docs when the API request fails', async () => {
      const searchForHits = vi
        .fn()
        .mockResolvedValueOnce({
          results: [
            {
              hits: [
                docsHit({
                  _highlightResult: {
                    content: {
                      matchLevel: 'full',
                      value: 'Call <mark>renew token</mark> after expiry.',
                    },
                    section: { matchLevel: 'none', value: 'Authentication' },
                    title: {
                      matchLevel: 'none',
                      value: 'Authentication workflow',
                    },
                  },
                  content: 'Call renew token after expiry.',
                  objectID: 'renew-token-workflow',
                  section: 'Authentication',
                  title: 'Authentication workflow',
                  url: '/en/realtime-media/rtc/authentication-workflow',
                }),
              ],
            },
            { error: 'bad' },
          ],
        })
        .mockRejectedValueOnce(new Error('API index unavailable'));
      vi.mocked(liteClient).mockReturnValue({ searchForHits } as never);

      const client = createClient();
      const results = await client.search('renew token');

      expect(results).toEqual([
        expect.objectContaining({
          id: 'renew-token-workflow',
          snippet: 'Call renew token after expiry.',
        }),
      ]);
      expect(client.getLastStatus()).toEqual({
        api: 'error',
        docs: 'success',
      });
    });

    it('still drops content-only api-task docs when the API request succeeds with a weak hit', async () => {
      const searchForHits = vi.fn().mockResolvedValue(
        federatedResponse({
          docsHits: [
            docsHit({
              _highlightResult: {
                content: {
                  matchLevel: 'full',
                  value: 'Call <mark>renew token</mark> after expiry.',
                },
              },
              content: 'Call renew token after expiry.',
              objectID: 'renew-token-content-only',
              title: 'Authentication workflow',
              url: '/en/realtime-media/rtc/authentication-workflow',
            }),
          ],
          apiHits: [
            apiHit({
              hierarchy: {
                lvl0: 'API Reference ❯ Video Sdk ❯ Web ❯ 4.x (current)',
                lvl1: 'setAudioProfile',
              },
              objectID: 'weak-set-audio-profile',
            }),
          ],
        }),
      );
      vi.mocked(liteClient).mockReturnValue({ searchForHits } as never);

      const client = createClient();

      await expect(client.search('renew token')).resolves.toEqual([]);
      expect(client.getLastStatus()).toEqual({
        api: 'success',
        docs: 'success',
      });
    });

    it.each([
      ['acquire resource ID', 'Acquire a resource ID'],
      ['start cloud recording task', 'Start a cloud recording task'],
    ])('keeps title-matched api-task docs for %s', async (query, title) => {
      const searchForHits = vi.fn().mockResolvedValue(
        federatedResponse({
          docsHits: [
            docsHit({
              _highlightResult: {
                title: { matchLevel: 'full', value: title },
              },
              objectID: `docs:${query}`,
              title,
              url: `/en/api-reference/${query.replaceAll(' ', '-')}`,
            }),
          ],
        }),
      );
      vi.mocked(liteClient).mockReturnValue({ searchForHits } as never);

      const client = createClient();
      const results = await client.search(query);

      expect(results[0]).toMatchObject({ id: `docs:${query}`, title });
    });

    it('在 API 子结果无效时仅重试 API，且空结果仍视为成功', async () => {
      const searchForHits = vi
        .fn()
        .mockResolvedValueOnce({
          results: [{ hits: [docsHit()] }, { error: 'bad' }],
        })
        .mockResolvedValueOnce({ results: [{ hits: [] }] });
      vi.mocked(liteClient).mockReturnValue({ searchForHits } as never);

      const client = createClient();
      const results = await client.search('joinChannel');

      expect(searchForHits).toHaveBeenCalledTimes(2);
      expect(searchForHits).toHaveBeenNthCalledWith(2, {
        requests: [
          expect.objectContaining({
            indexName: 'agora_APIRefSearch',
            query: 'joinChannel',
          }),
        ],
      });
      expect(results).toHaveLength(1);
      expect(results[0]).toMatchObject({ id: 'guide' });
      expect(client.getLastStatus()).toEqual({
        api: 'success',
        docs: 'success',
      });
    });

    it('在 Docs 与 API 子结果都无效时不重试 API', async () => {
      const searchForHits = vi.fn().mockResolvedValue({
        results: [{ error: 'docs bad' }, { error: 'api bad' }],
      });
      vi.mocked(liteClient).mockReturnValue({ searchForHits } as never);

      const client = createClient();

      await expect(client.search('joinChannel')).rejects.toThrow('docs bad');
      expect(searchForHits).toHaveBeenCalledTimes(1);
      expect(client.getLastStatus()).toEqual({ api: 'error', docs: 'error' });
    });

    it('在 Docs 子结果无效而 API 成功时不重试 API', async () => {
      const searchForHits = vi.fn().mockResolvedValue({
        results: [{ error: 'docs bad' }, { hits: [apiHit()] }],
      });
      vi.mocked(liteClient).mockReturnValue({ searchForHits } as never);

      const client = createClient();

      await expect(client.search('joinChannel')).rejects.toThrow('docs bad');
      expect(searchForHits).toHaveBeenCalledTimes(1);
      expect(client.getLastStatus()).toEqual({
        api: 'success',
        docs: 'error',
      });
    });

    it('在联合请求被拒绝后仅重试 Docs，并将 API 标记为失败', async () => {
      const searchForHits = vi
        .fn()
        .mockRejectedValueOnce(new Error('Combined request failed'))
        .mockResolvedValueOnce({ results: [{ hits: [docsHit()] }] });
      vi.mocked(liteClient).mockReturnValue({ searchForHits } as never);

      const client = createClient();

      await expect(client.search('joinChannel')).resolves.toEqual([
        expect.objectContaining({ id: 'guide' }),
      ]);
      expect(searchForHits).toHaveBeenCalledTimes(2);
      expect(searchForHits).toHaveBeenNthCalledWith(2, {
        requests: [expect.objectContaining({ indexName: 'docs_portal_en' })],
      });
      expect(client.getLastStatus()).toEqual({
        api: 'error',
        docs: 'success',
      });
    });

    it('在联合请求和 Docs 重试都失败时抛出 Docs 错误', async () => {
      const combinedError = new Error('Combined request failed');
      const docsError = new Error('Docs index unavailable');
      const searchForHits = vi
        .fn()
        .mockRejectedValueOnce(combinedError)
        .mockRejectedValueOnce(docsError);
      vi.mocked(liteClient).mockReturnValue({ searchForHits } as never);

      const client = createClient();

      await expect(client.search('joinChannel')).rejects.toBe(docsError);
      expect(searchForHits).toHaveBeenCalledTimes(2);
      expect(searchForHits).toHaveBeenNthCalledWith(2, {
        requests: [expect.objectContaining({ indexName: 'docs_portal_en' })],
      });
      expect(client.getLastStatus()).toEqual({ api: 'error', docs: 'error' });
    });

    it('不会为格式正确的空 API 结果重试', async () => {
      const searchForHits = vi.fn().mockResolvedValue(federatedResponse());
      vi.mocked(liteClient).mockReturnValue({ searchForHits } as never);

      const client = createClient();
      await client.search('voice agent quickstart');

      expect(searchForHits).toHaveBeenCalledTimes(1);
      expect(client.getLastStatus()).toEqual({
        api: 'success',
        docs: 'success',
      });
    });

    it('does not let an older failed search overwrite the latest successful status', async () => {
      let rejectOldSearch: ((reason: Error) => void) | undefined;
      const oldSearchResult = new Promise<never>((_resolve, reject) => {
        rejectOldSearch = reject;
      });
      let rejectOldDocsRetry: ((reason: Error) => void) | undefined;
      const oldDocsRetry = new Promise<never>((_resolve, reject) => {
        rejectOldDocsRetry = reject;
      });
      const searchForHits = vi
        .fn()
        .mockReturnValueOnce(oldSearchResult)
        .mockResolvedValueOnce(federatedResponse())
        .mockReturnValueOnce(oldDocsRetry);
      vi.mocked(liteClient).mockReturnValue({ searchForHits } as never);

      const client = createClient();
      const oldSearch = client.search('voice agent quickstart');
      await expect(client.search('screen sharing')).resolves.toHaveLength(1);
      expect(client.getLastStatus()).toEqual({
        api: 'success',
        docs: 'success',
      });

      rejectOldSearch?.(new Error('Old combined request failed'));
      await vi.waitFor(() => expect(rejectOldDocsRetry).toBeTypeOf('function'));
      const oldDocsError = new Error('Old docs retry failed');
      rejectOldDocsRetry?.(oldDocsError);
      await expect(oldSearch).rejects.toBe(oldDocsError);
      expect(client.getLastStatus()).toEqual({
        api: 'success',
        docs: 'success',
      });
    });

    it('keeps API Reference results first for an explicit scope without an API identity', async () => {
      const searchForHits = vi.fn().mockResolvedValue({
        results: [
          { hits: [docsHit()] },
          {
            hits: [
              apiHit({
                _highlightResult: {
                  hierarchy: {
                    lvl1: {
                      matchLevel: 'full',
                      value: '<mark>AudioVolumeInfo</mark>',
                    },
                  },
                },
                hierarchy: {
                  lvl0: 'API Reference ❯ Video SDK ❯ Web ❯ 4.x (current)',
                  lvl1: 'AudioVolumeInfo',
                },
                objectID: 'audio-volume-info',
              }),
            ],
          },
        ],
      });
      vi.mocked(liteClient).mockReturnValue({ searchForHits } as never);

      const client = createClient({
        scope: { field: 'tab', value: 'api-reference' },
      });
      const results = await client.search('voice agent quickstart');

      expect(searchForHits).toHaveBeenCalledTimes(1);
      expect(searchForHits).toHaveBeenCalledWith({
        requests: [
          expect.objectContaining({ indexName: 'docs_portal_en' }),
          expect.objectContaining({ indexName: 'agora_APIRefSearch' }),
        ],
      });
      expect(results.map(({ id }) => id)).toEqual([
        'audio-volume-info',
        'guide',
      ]);
      expect(results[0]).toMatchObject({
        aliasesExactMatch: false,
        titleExactMatch: false,
      });
    });

    it('严格接纳与无文档查询匹配的 API 结果', async () => {
      const searchForHits = vi.fn().mockResolvedValue(
        federatedResponse({
          docsHits: [],
          apiHits: [
            apiHit({
              _highlightResult: {
                hierarchy: {
                  lvl1: {
                    matchLevel: 'full',
                    value: '<mark>Class RtcEngine</mark>',
                  },
                },
              },
              _snippetResult: {
                content: {
                  value: 'The <mark>RtcEngine</mark> class.',
                },
              },
              hierarchy: {
                lvl0: 'API Reference ❯ Video Sdk ❯ Web ❯ 4.x (current)',
                lvl1: 'Class RtcEngine',
              },
              objectID: 'rtc-engine',
              url: 'https://api-ref.agora.io/en/video-sdk/web/4.x/interfaces/rtcengine.html',
            }),
          ],
        }),
      );
      vi.mocked(liteClient).mockReturnValue({ searchForHits } as never);

      const client = createClient();
      const results = await client.search('RtcEngine API');

      expect(results).toEqual([
        expect.objectContaining({
          id: 'rtc-engine',
          objectType: 'sdk-api',
          snippet: 'The <mark>RtcEngine</mark> class.',
          title: '<mark>Class RtcEngine</mark>',
        }),
      ]);
    });

    it('includes the feature flag in dependencies', () => {
      const searchForHits = vi.fn();
      vi.mocked(liteClient).mockReturnValue({ searchForHits } as never);

      const client = createClient();

      expect(client.deps).toContain(true);
    });
  });

  it('preserves legacy multi-search and API-first ordering when ranking v2 is disabled', async () => {
    const searchForHits = vi.fn().mockResolvedValue({
      results: [
        { hits: [{ objectID: 'guide', title: 'Guide', url: '/en/guide' }] },
        {
          hits: [
            {
              hierarchy: { lvl1: 'joinChannel' },
              objectID: 'api',
              url: 'https://api-ref.agora.io/joinChannel',
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
      rankingV2: false,
      searchApiKey: 'search-key',
    });
    const results = await client.search('joinChannel');

    expect(searchForHits).toHaveBeenCalledTimes(1);
    expect(searchForHits).toHaveBeenCalledWith({
      requests: [
        expect.objectContaining({ indexName: 'docs_portal_en' }),
        expect.objectContaining({
          hitsPerPage: 5,
          indexName: 'agora_APIRefSearch',
        }),
      ],
    });
    expect(results.map((result) => result.id)).toEqual(['api', 'guide']);
  });
});
