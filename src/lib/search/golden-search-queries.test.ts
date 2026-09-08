import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { liteClient } from 'algoliasearch/lite';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { loadDocsSearchIndex } from '../docs-page.server';
import { createAlgoliaDocsClient } from './algolia-client';
import {
  type AlgoliaDocsRecord,
  buildAlgoliaContentDocsRecords,
} from './algolia-records.server';
import {
  GLOBAL_GOLDEN_SEARCH_CASES,
  type GoldenSearchCase,
} from './golden-search-queries';
import { classifySearchIntent, type SearchIntent } from './search-intent';

vi.mock('algoliasearch/lite', () => ({
  liteClient: vi.fn(),
}));

type SourceHit = Record<string, unknown> & { objectID: string; url: string };

type GoldenClientResult = {
  canonicalKey?: string;
  id: string;
  platform?: string[];
  platformUrls?: Record<string, string>;
  recordKind: string;
  title: string;
  url: string;
};

type ApiCorpusEntry = {
  queries: readonly string[];
  symbol: string;
  kind: 'class' | 'enum' | 'interface' | 'member' | 'method' | 'type';
  namespace?: string;
  platformHits: readonly {
    label: string;
    namespace?: string;
    platform: string;
    symbol?: string;
    url: string;
    version?: string;
  }[];
};

/**
 * Independent query-to-route corpus. Target records are loaded from the real
 * English search index below; this map deliberately does not import or reuse
 * expectedUrl from the golden fixture.
 */
const DOC_TARGET_ROUTE_BY_QUERY: Readonly<Record<string, string>> = {
  'voice agent quickstart': '/en/ai/get-started/quickstart',
  'build a voice agent': '/en/ai/get-started/quickstart',
  'start and stop an agent': '/en/ai/build/start-stop-agent',
  'connect your own TTS service':
    '/en/ai/build/custom-model-integration/custom-tts',
  'cloud recording start': '/en/realtime-media/cloud-recording',
  'cloud recording REST API': '/en/api-reference/api-ref/cloud-recording',
  'record captions':
    '/en/realtime-media/speech-to-text/build/process-transcription-data/record-captions',
  'transcribe audio': '/en/realtime-media/speech-to-text',
  'join a channel': '/en/realtime-media/rtc/get-started-sdk',
  'join multiple channels':
    '/en/realtime-media/rtc/build/join-and-manage-channels/join-multiple-channels',
  'network quality':
    '/en/realtime-media/rtc/build/manage-connection-and-quality/in-call-quality-monitoring',
  'in-call quality monitoring':
    '/en/realtime-media/rtc/build/manage-connection-and-quality/in-call-quality-monitoring',
  'enable adaptive bitrate':
    '/en/realtime-media/rtmp-gateway/build/optimize-quality-and-monitor-events/enable-adaptive-bitrate',
  'stream channels':
    '/en/realtime-media/rtm/build/work-with-channels/stream-channel',
  'signaling quickstart': '/en/realtime-media/rtm/quickstart',
  'send a message':
    '/en/realtime-media/im/build/build-core-messaging/messages/send-receive-messages',
  'video call quickstart': '/en/realtime-media/rtc/get-started-sdk',
  'screen sharing':
    '/en/realtime-media/rtc/build/capture-and-render-video/screen-sharing',
  'mute remote audio':
    '/en/realtime-media/rtc/build/control-audio-and-devices/volume-control-and-mute',
  'token authentication':
    '/en/realtime-media/im/build/secure-access-and-authentication/authentication',
  'voice agent': '/en/ai/get-started/quickstart',
  'voice activity detection':
    '/en/realtime-media/rtc/build/enhance-the-audio-experience/voice-activity-detection',
  'conversational AI': '/en/api-reference/api-ref/conversational-ai',
  'cloud recording': '/en/realtime-media/cloud-recording',
  'real-time transcription': '/en/realtime-media/speech-to-text',
  'speech to text': '/en/realtime-media/speech-to-text',
  'video calling': '/en/api-reference/api-ref/rtc',
  'interactive live streaming':
    '/en/realtime-media/interactive-live-streaming/product-overview',
  'broadcast streaming':
    '/en/realtime-media/broadcast-streaming/product-overview',
  'flexible classroom':
    '/en/realtime-media/flexible-classroom/product-overview',
  'IoT SDK': '/en/realtime-media/iot/product-overview',
  'Agora CLI': '/en/introduction/agora-cli',
  'acquire resource ID': '/en/api-reference/api-ref/cloud-recording/acquire',
  'start cloud recording task':
    '/en/api-reference/api-ref/cloud-recording/start',
  'query recording status': '/en/api-reference/api-ref/cloud-recording/query',
  'error code 110': '/en/realtime-media/rtc/reference/error-codes',
  'black screen': '/en/api-reference/faq/quality/video_blank',
  'Bluetooth iOS': '/en/api-reference/faq/quality/ios_bluetooth',
  'HTTP basic authentication':
    '/en/api-reference/api-ref/cloud-recording/authentication',
  'billing policy': '/en/introduction/billing/billing-policies',
  'firewall requirements': '/en/introduction/firewall',
};

const EMPTY_QUERIES = new Set([
  'send streaming message',
  'foo bar baz',
  'xyznonexistent',
]);

const EXPECTED_DOCS_RETRIEVAL_QUERY = new Map([
  ['billing policy', 'billing policies'],
  ['real-time transcription', 'speech to text'],
  ['real time transcription', 'speech to text'],
]);

const EXPECTED_API_RETRIEVAL_QUERY = new Map([
  ['RtcEngine', 'AgoraRtcEngineKit'],
  ['RtcEngine class', 'AgoraRtcEngineKit'],
  ['joinChannel method', 'joinChannel'],
  ['renewToken api', 'renewToken'],
  ['setAudioProfile method', 'setAudioProfile'],
]);

function expectedDocsRetrievalQuery(query: string) {
  const retrievalQuery = classifySearchIntent(query).matchedPhrase ?? query;
  return EXPECTED_DOCS_RETRIEVAL_QUERY.get(retrievalQuery) ?? retrievalQuery;
}

function expectedApiRetrievalQuery(
  query: string,
  intent = classifySearchIntent(query).intent,
) {
  const retrievalQuery = classifySearchIntent(query).matchedPhrase ?? query;
  if (intent === 'support' || intent === 'product') return retrievalQuery;
  return EXPECTED_API_RETRIEVAL_QUERY.get(retrievalQuery) ?? retrievalQuery;
}

const NOISE_DOC_ROUTES = [
  '/en/api-reference/faq/account',
  '/en/api-reference/faq/integration',
  '/en/api-reference/faq/other',
  '/en/api-reference/faq/product',
  '/en/api-reference/faq/quality',
] as const;

const API_CORPUS: readonly ApiCorpusEntry[] = [
  {
    kind: 'method',
    namespace: 'RtcEngine',
    platformHits: [
      {
        label: 'Blueprint',
        namespace: 'IRtcEngine',
        platform: 'blueprint',
        url: 'https://api-ref.agora.io/en/video-sdk/blueprint/4.x/API/class_irtcengine.html#ariaid-title78',
      },
      {
        label: 'C++',
        namespace: 'IRtcEngine',
        platform: 'cpp',
        url: 'https://api-ref.agora.io/en/video-sdk/cpp/4.x/API/class_irtcengine.html#api_irtcengine_joinchannel2',
      },
    ],
    queries: ['joinChannel', 'joinChannel method'],
    symbol: 'joinChannel',
  },
  {
    kind: 'method',
    namespace: 'RtcEngine',
    platformHits: [
      {
        label: 'Android',
        namespace: 'IRtcEngine',
        platform: 'android',
        url: 'https://api-ref.agora.io/en/video-sdk/android/4.x/API/class_irtcengine.html#api_irtcengine_setaudioprofile2',
      },
      {
        label: 'C++',
        namespace: 'IRtcEngine',
        platform: 'cpp',
        url: 'https://api-ref.agora.io/en/video-sdk/cpp/4.x/API/class_irtcengine.html#api_irtcengine_setaudioprofile2',
      },
      {
        label: 'iOS',
        namespace: 'AgoraRtcEngineKit',
        platform: 'ios',
        url: 'https://api-ref.agora.io/en/video-sdk/ios/4.x/documentation/agorartckit/agorartcenginekit/setaudioprofile(_:)?language=objc#app-main',
      },
    ],
    queries: ['setAudioProfile', 'setAudioProfile method'],
    symbol: 'setAudioProfile',
  },
  {
    kind: 'interface',
    platformHits: [
      {
        label: 'Web',
        platform: 'web',
        url: 'https://api-ref.agora.io/en/video-sdk/web/4.x/interfaces/networkquality.html',
      },
    ],
    queries: ['NetworkQuality'],
    symbol: 'NetworkQuality',
  },
  {
    kind: 'member',
    namespace: 'RtcApiDataType',
    platformHits: [
      {
        label: 'Flutter',
        namespace: 'RtcApiDataType',
        platform: 'flutter',
        url: 'https://api-ref.agora.io/en/video-sdk/flutter/5.x/API/rtc_api_data_type.html#ariaid-title89',
        version: '5.x',
      },
    ],
    queries: ['AudioVolumeInfo'],
    symbol: 'AudioVolumeInfo',
  },
  {
    kind: 'type',
    platformHits: [
      {
        label: 'iOS',
        platform: 'ios',
        symbol: 'AgoraRtcEngineKit',
        url: 'https://api-ref.agora.io/en/video-sdk/ios/4.x/documentation/agorartckit/agorartcenginekit?language=objc#app-main',
      },
    ],
    queries: ['RtcEngine', 'RtcEngine class'],
    symbol: 'RtcEngine',
  },
  {
    kind: 'method',
    namespace: 'RtcEngine',
    platformHits: [
      {
        label: 'Android',
        namespace: 'IRtcEngine',
        platform: 'android',
        url: 'https://api-ref.agora.io/en/video-sdk/android/4.x/API/class_irtcengine.html#ariaid-title128',
      },
      {
        label: 'C++',
        namespace: 'IRtcEngine',
        platform: 'cpp',
        url: 'https://api-ref.agora.io/en/video-sdk/cpp/4.x/API/class_irtcengine.html#api_irtcengine_renewtoken',
      },
      {
        label: 'iOS',
        namespace: 'AgoraRtcEngineKit',
        platform: 'ios',
        url: 'https://api-ref.agora.io/en/video-sdk/ios/4.x/documentation/agorartckit/agorartcenginekit/renewtoken(_:)',
      },
      {
        label: 'Web',
        namespace: 'IAgoraRTCClient',
        platform: 'web',
        url: 'https://api-ref.agora.io/en/video-sdk/web/4.x/interfaces/iagorartcclient.html#renewtoken',
      },
    ],
    queries: ['renew token', 'renewToken api'],
    symbol: 'renewToken',
  },
];

const NOISE_API_CORPUS: readonly ApiCorpusEntry[] = [
  {
    kind: 'method',
    namespace: 'RtcEngine',
    platformHits: [
      {
        label: 'Android',
        platform: 'android',
        url: 'https://api-ref.agora.io/en/video-sdk/android/4.x/API/class_irtcengine.html#api_irtcengine_setremotevideostreamtype',
      },
    ],
    queries: [],
    symbol: 'setRemoteVideoStreamType',
  },
  {
    kind: 'method',
    namespace: 'RtcEngine',
    platformHits: [
      {
        label: 'Android',
        platform: 'android',
        url: 'https://api-ref.agora.io/en/video-sdk/android/4.x/API/class_irtcengine.html#api_irtcengine_enablevoiceaituner',
      },
    ],
    queries: [],
    symbol: 'enableVoiceAITuner',
  },
  {
    kind: 'method',
    namespace: 'RtcEngine',
    platformHits: [
      {
        label: 'Android',
        platform: 'android',
        url: 'https://api-ref.agora.io/en/video-sdk/android/4.x/API/class_irtcengine.html#api_irtcengine_setvoicebeautifierpreset',
      },
    ],
    queries: [],
    symbol: 'setVoiceBeautifierPreset',
  },
  {
    kind: 'enum',
    platformHits: [
      {
        label: 'Android',
        platform: 'android',
        url: 'https://api-ref.agora.io/en/video-sdk/android/4.x/API/enum_audioscenariotype.html',
      },
    ],
    queries: [],
    symbol: 'AudioScenarioType',
  },
  {
    kind: 'class',
    platformHits: [
      {
        label: 'Android',
        platform: 'android',
        url: 'https://api-ref.agora.io/en/video-sdk/android/4.x/API/class_videoencoderconfiguration.html',
      },
    ],
    queries: [],
    symbol: 'VideoEncoderConfiguration',
  },
];

const STABLE_WEB_NETWORK_QUALITY_URL =
  'https://api-ref.agora.io/en/video-sdk/web/4.x/interfaces/networkquality.html';

// Verified against the shared read-only API reference index on 2026-09-03.
// Unit tests remain offline and keep the observed live targets explicit.
const EXTERNALLY_VERIFIED_SDK_URL_ALLOWLIST = new Set([
  'https://api-ref.agora.io/en/video-sdk/blueprint/4.x/API/class_irtcengine.html#ariaid-title78',
  'https://api-ref.agora.io/en/video-sdk/ios/4.x/documentation/agorartckit/agorartcenginekit/setaudioprofile(_:)?language=objc#app-main',
  'https://api-ref.agora.io/en/video-sdk/flutter/5.x/API/rtc_api_data_type.html#ariaid-title89',
  'https://api-ref.agora.io/en/video-sdk/ios/4.x/documentation/agorartckit/agorartcenginekit?language=objc#app-main',
  'https://api-ref.agora.io/en/video-sdk/android/4.x/API/class_irtcengine.html#ariaid-title128',
]);

const REAL_SDK_TARGET_URLS = new Set([
  STABLE_WEB_NETWORK_QUALITY_URL,
  ...EXTERNALLY_VERIFIED_SDK_URL_ALLOWLIST,
]);

type IndexedDocsEntry = Record<string, unknown> & {
  breadcrumbs: string[];
  content?: string;
  objectType: 'docs' | 'openapi';
  title: string;
  url: string;
};

let englishSearchIndex: IndexedDocsEntry[] = [];
let hiddenSyncRecords: AlgoliaDocsRecord[] = [];

beforeAll(async () => {
  const inventory = JSON.parse(
    readFileSync(
      resolve(process.cwd(), 'src/lib/legacy-sitemap/new-docs-inventory.json'),
      'utf8',
    ),
  ) as {
    routes: Array<{
      routePath: string;
      sourceFilePath: string;
      title: string;
    }>;
  };
  const hiddenUrls = new Set([
    '/en/realtime-media/interactive-live-streaming/product-overview',
    '/en/realtime-media/broadcast-streaming/product-overview',
    '/en/api-reference/faq/quality/video_blank',
    '/en/api-reference/faq/quality/ios_bluetooth',
  ]);
  const hiddenPages = inventory.routes
    .filter(({ routePath }) => hiddenUrls.has(routePath))
    .map(({ routePath, sourceFilePath, title }) => ({
      content: readFileSync(resolve(process.cwd(), sourceFilePath), 'utf8'),
      title,
      url: routePath,
    }));
  hiddenSyncRecords = buildAlgoliaContentDocsRecords(
    hiddenPages,
    new Map([['en', new Map()]]),
  );
  englishSearchIndex = [
    ...((await loadDocsSearchIndex('en')) as IndexedDocsEntry[]),
    ...hiddenSyncRecords.map(toIndexedDocsEntry),
  ];
}, 30_000);

function toIndexedDocsEntry(record: AlgoliaDocsRecord): IndexedDocsEntry {
  return {
    breadcrumbs: record.breadcrumbs ?? [],
    content: record.structured.contents
      .map(({ content }) => content)
      .join('\n'),
    ...(record.description ? { description: record.description } : {}),
    objectType: record.extra_data.objectType,
    ...(record.extra_data.platform
      ? { platform: record.extra_data.platform }
      : {}),
    ...(record.extra_data.product
      ? { product: record.extra_data.product }
      : {}),
    tab: record.extra_data.tab,
    title: record.title,
    url: record.url,
  };
}

function indexedEntry(url: string) {
  return englishSearchIndex.find((entry) => entry.url === url);
}

function authoritativeRouteEntry(url: string) {
  return indexedEntry(url);
}

function targetDocsHit(query: string): SourceHit | undefined {
  const route = DOC_TARGET_ROUTE_BY_QUERY[query];
  const entry = route ? authoritativeRouteEntry(route) : undefined;
  if (!entry) return undefined;

  const queryTerms = query.toLowerCase().match(/[a-z0-9]+/gu) ?? [];
  const highlightedField = queryTerms.some((term) =>
    entry.title.toLowerCase().includes(term),
  )
    ? 'title'
    : 'content';

  return {
    ...entry,
    // Algolia response metadata is query-specific, while the source fields
    // above remain byte-for-byte sourced from the index or route inventory.
    _highlightResult: {
      [highlightedField]: {
        matchLevel: 'full',
        value:
          highlightedField === 'title'
            ? entry.title
            : (entry.content ?? entry.title),
      },
    },
    objectID: `target:${query}`,
  };
}

function competitiveDocsHits(query: string): SourceHit[] {
  if (query !== 'cloud recording REST API') return [];
  const entry = authoritativeRouteEntry('/en/realtime-media/cloud-recording');
  if (!entry) {
    throw new Error('Cloud Recording overview competition is absent');
  }
  return [
    {
      ...entry,
      _highlightResult: {
        title: { matchLevel: 'full', value: entry.title },
      },
      objectID: 'competition:cloud-recording-overview',
    },
  ];
}

function noiseDocsFor(intent: SearchIntent) {
  return NOISE_DOC_ROUTES.map((route, index) => {
    const entry = indexedEntry(route);
    if (!entry) {
      throw new Error(`Golden noise route is absent from the index: ${route}`);
    }
    return {
      ...entry,
      objectID: `noise-doc:${intent}:${index + 1}`,
    };
  });
}

function apiHit(
  entry: ApiCorpusEntry,
  platformHit: ApiCorpusEntry['platformHits'][number],
) {
  const symbol = platformHit.symbol ?? entry.symbol;
  const namespace = platformHit.namespace ?? entry.namespace;
  const version = platformHit.version ?? '4.x';
  const lvl0 = `API Reference ❯ Video Sdk ❯ ${platformHit.label} ❯ ${version} (current)`;
  const pageKindLabel = {
    class: 'Class',
    enum: 'Enum',
    interface: 'Interface',
    type: 'Type',
  } as const;
  const hierarchy =
    entry.kind === 'method'
      ? { lvl0, lvl1: `Class ${namespace}`, lvl2: symbol }
      : entry.kind === 'member'
        ? { lvl0, lvl1: symbol }
        : { lvl0, lvl1: `${pageKindLabel[entry.kind]} ${symbol}` };
  return {
    hierarchy,
    objectID: `${entry.queries.length === 0 ? 'noise-api-' : ''}${symbol}-${platformHit.platform}`,
    platform: platformHit.platform,
    product: 'video-sdk',
    url: platformHit.url,
    version,
  };
}

function sourceHitsFor(
  query: string,
  retrievalQuery: string,
  indexName: string,
  intent: SearchIntent,
) {
  if (indexName === 'docs_portal_en') {
    if (EMPTY_QUERIES.has(query)) return [];
    const target =
      retrievalQuery === expectedDocsRetrievalQuery(query)
        ? targetDocsHit(query)
        : undefined;
    return [
      ...(target ? [target] : []),
      ...competitiveDocsHits(query),
      ...noiseDocsFor(intent),
    ];
  }

  const targets = API_CORPUS.filter(({ queries }) =>
    queries.some(
      (candidate) => expectedApiRetrievalQuery(candidate) === retrievalQuery,
    ),
  );
  return [...targets, ...NOISE_API_CORPUS].flatMap((entry) =>
    entry.platformHits.map((platformHit) => apiHit(entry, platformHit)),
  );
}

function createGoldenClient(query: string, intent: SearchIntent) {
  const searchForHits = vi
    .fn()
    .mockImplementation(
      ({
        requests,
      }: {
        requests: Array<{ indexName: string; query: string }>;
      }) => {
        expect(requests.map(({ indexName }) => indexName)).toEqual([
          'docs_portal_en',
          'agora_APIRefSearch',
        ]);
        return Promise.resolve({
          results: requests.map((request) => {
            const expectedQuery =
              request.indexName === 'docs_portal_en'
                ? expectedDocsRetrievalQuery(query)
                : expectedApiRetrievalQuery(query, intent);
            expect(request.query).toBe(expectedQuery);
            return {
              hits: sourceHitsFor(
                query,
                request.query,
                request.indexName,
                intent,
              ),
            };
          }),
        });
      },
    );
  vi.mocked(liteClient).mockReturnValue({ searchForHits } as never);
  return createAlgoliaDocsClient({
    apiReferenceIndexName: 'agora_APIRefSearch',
    appId: 'app-id',
    indexName: 'docs_portal_en',
    locale: 'en',
    rankingV2: true,
    searchApiKey: 'search-key',
  });
}

function expectedTopThreeResult(
  results: GoldenClientResult[],
  goldenCase: GoldenSearchCase,
) {
  const topThree = results.slice(0, 3);
  return goldenCase.expectedCanonicalKey
    ? topThree.find(
        ({ canonicalKey }) => canonicalKey === goldenCase.expectedCanonicalKey,
      )
    : topThree.find((result) => resultContainsExpectedUrl(result, goldenCase));
}

function resultContainsExpectedUrl(
  result: GoldenClientResult,
  goldenCase: GoldenSearchCase,
) {
  if (!goldenCase.expectedUrl) return true;
  return (
    result.url === goldenCase.expectedUrl ||
    Object.values(result.platformUrls ?? {}).includes(goldenCase.expectedUrl)
  );
}

describe('Global search golden queries', () => {
  it('contains exactly the 54 approved online cases', () => {
    expect(GLOBAL_GOLDEN_SEARCH_CASES).toHaveLength(54);
  });

  it('covers every query with an independent real route, SDK symbol, or empty result', () => {
    const corpusQueries = new Set([
      ...Object.keys(DOC_TARGET_ROUTE_BY_QUERY),
      ...API_CORPUS.flatMap(({ queries }) => queries),
      ...EMPTY_QUERIES,
    ]);

    expect(corpusQueries).toEqual(
      new Set(GLOBAL_GOLDEN_SEARCH_CASES.map(({ query }) => query)),
    );
    expect(NOISE_DOC_ROUTES).toHaveLength(5);
    expect(NOISE_API_CORPUS).toHaveLength(5);
  });

  it('sources the four formerly missing targets directly from search sync records', () => {
    expect(hiddenSyncRecords.map(({ url }) => url)).toEqual([
      '/en/api-reference/faq/quality/ios_bluetooth',
      '/en/api-reference/faq/quality/video_blank',
      '/en/realtime-media/broadcast-streaming/product-overview',
      '/en/realtime-media/interactive-live-streaming/product-overview',
    ]);
    expect(
      [
        '/en/realtime-media/interactive-live-streaming/product-overview',
        '/en/realtime-media/broadcast-streaming/product-overview',
        '/en/api-reference/faq/quality/video_blank',
        '/en/api-reference/faq/quality/ios_bluetooth',
      ].map(indexedEntry),
    ).toEqual([
      expect.objectContaining({
        breadcrumbs: ['RTC', 'Interactive Live Streaming'],
      }),
      expect.objectContaining({ breadcrumbs: ['RTC', 'Broadcast Streaming'] }),
      expect.objectContaining({ breadcrumbs: ['Reference', 'FAQ', 'Quality'] }),
      expect.objectContaining({ breadcrumbs: ['Reference', 'FAQ', 'Quality'] }),
    ]);
  });

  it('keeps every relative expected route in an authoritative current source', () => {
    const relativeExpectedUrls = GLOBAL_GOLDEN_SEARCH_CASES.flatMap(
      ({ expectedUrl }) =>
        expectedUrl?.startsWith('/') ? [expectedUrl.split('#')[0]] : [],
    );
    const checkedRoutes = [
      ...relativeExpectedUrls,
      ...Object.values(DOC_TARGET_ROUTE_BY_QUERY),
      ...NOISE_DOC_ROUTES,
    ];

    expect(
      [...new Set(checkedRoutes)].filter(
        (url) => !authoritativeRouteEntry(url),
      ),
    ).toEqual([]);
  });

  it('resolves all five declared noise routes from the current index', () => {
    expect(NOISE_DOC_ROUTES).toHaveLength(5);
    expect(NOISE_DOC_ROUTES.map(indexedEntry)).not.toContain(undefined);
    expect(noiseDocsFor('unknown')).toHaveLength(NOISE_DOC_ROUTES.length);
  });

  it('tests the Cloud Recording REST API target against the real overview sibling', () => {
    const hits = sourceHitsFor(
      'cloud recording REST API',
      'cloud recording rest api',
      'docs_portal_en',
      'api-task',
    );

    expect(hits).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          url: '/en/realtime-media/cloud-recording',
        }),
        expect.objectContaining({
          url: '/en/api-reference/api-ref/cloud-recording',
        }),
      ]),
    );
  });

  it.each([
    ['error code 110', '/en/realtime-media/rtc/reference/error-codes'],
    [
      'HTTP basic authentication',
      '/en/api-reference/api-ref/cloud-recording/authentication',
    ],
    ['billing policy', '/en/introduction/billing/billing-policies'],
  ] as const)(
    'keeps authored reference %s as the guide kind from source metadata',
    (query, route) => {
      const goldenCase = GLOBAL_GOLDEN_SEARCH_CASES.find(
        (candidate) => candidate.query === query,
      );
      const sourceEntry = indexedEntry(route);

      expect(sourceEntry).toMatchObject({ objectType: 'docs', url: route });
      expect(goldenCase).toMatchObject({
        expectedKind: 'guide',
        expectedUrl: route,
      });
    },
  );

  it('keeps every relative expected title attached to its authoritative indexed route', () => {
    const mismatches = GLOBAL_GOLDEN_SEARCH_CASES.flatMap((goldenCase) => {
      if (!goldenCase.expectedUrl?.startsWith('/')) return [];
      const entry = authoritativeRouteEntry(
        goldenCase.expectedUrl.split('#')[0],
      );
      return entry &&
        goldenCase.expectedTitle &&
        entry.title
          .toLowerCase()
          .includes(goldenCase.expectedTitle.toLowerCase())
        ? []
        : [goldenCase.query];
    });

    expect(mismatches).toEqual([]);
  });

  it('anchors all six SDK target URLs in stable or explicitly verified evidence', () => {
    const fixtureSdkUrls = new Set(
      GLOBAL_GOLDEN_SEARCH_CASES.flatMap(({ expectedKind, expectedUrl }) =>
        expectedKind === 'sdk-symbol' && expectedUrl ? [expectedUrl] : [],
      ),
    );
    const stableClientFixture = readFileSync(
      resolve(process.cwd(), 'src/lib/search/algolia-client.test.ts'),
      'utf8',
    );

    expect(fixtureSdkUrls).toEqual(REAL_SDK_TARGET_URLS);
    expect(stableClientFixture).toContain(STABLE_WEB_NETWORK_QUALITY_URL);
    expect(EXTERNALLY_VERIFIED_SDK_URL_ALLOWLIST.size).toBe(5);
  });

  describe.each(GLOBAL_GOLDEN_SEARCH_CASES)('$query', (goldenCase) => {
    it(`classifies as ${goldenCase.expectedIntent}`, () => {
      expect(classifySearchIntent(goldenCase.query).intent).toBe(
        goldenCase.expectedIntent,
      );
    });

    it(`returns ${goldenCase.expectedKind} with the real target in the top three`, async () => {
      if (goldenCase.expectedKind !== 'empty') {
        const docsSourceHits = sourceHitsFor(
          goldenCase.query,
          expectedDocsRetrievalQuery(goldenCase.query),
          'docs_portal_en',
          goldenCase.expectedIntent,
        );
        expect(
          docsSourceHits.filter(({ objectID }) =>
            objectID.startsWith('noise-doc:'),
          ),
        ).toHaveLength(5);
      }

      const client = createGoldenClient(
        goldenCase.query,
        goldenCase.expectedIntent,
      );
      const results = (await client.search(
        goldenCase.query,
      )) as unknown as GoldenClientResult[];

      if (goldenCase.expectedKind === 'empty') {
        expect(results).toEqual([]);
        return;
      }

      const expectedResult = expectedTopThreeResult(results, goldenCase);
      expect(
        expectedResult,
        JSON.stringify(
          results.map(({ id, title, url }) => ({ id, title, url })),
        ),
      ).toMatchObject({
        recordKind: goldenCase.expectedKind,
      });
      expect(
        expectedResult && resultContainsExpectedUrl(expectedResult, goldenCase),
      ).toBe(true);
      expect(expectedResult?.title.toLowerCase()).toContain(
        goldenCase.expectedTitle?.toLowerCase(),
      );
      if (goldenCase.expectedCanonicalKey) {
        expect(expectedResult).toMatchObject({
          canonicalKey: goldenCase.expectedCanonicalKey,
        });
      }

      if (
        goldenCase.expectedIntent === 'task' ||
        goldenCase.expectedIntent === 'product' ||
        goldenCase.expectedIntent === 'support'
      ) {
        expect(
          results
            .slice(0, 5)
            .some((result) => result.recordKind === 'sdk-symbol'),
        ).toBe(false);
      }

      expect(results.some((result) => result.id.startsWith('noise-api-'))).toBe(
        false,
      );
      const canonicalKeys = results.flatMap((result) =>
        result.canonicalKey ? [result.canonicalKey] : [],
      );
      expect(new Set(canonicalKeys).size).toBe(canonicalKeys.length);
      if (goldenCase.expectedKind === 'sdk-symbol') {
        const apiCorpusEntry = API_CORPUS.find(({ queries }) =>
          queries.includes(goldenCase.query),
        );
        expect(new Set(expectedResult?.platform)).toEqual(
          new Set(apiCorpusEntry?.platformHits.map(({ platform }) => platform)),
        );
      }
    });
  });
});
