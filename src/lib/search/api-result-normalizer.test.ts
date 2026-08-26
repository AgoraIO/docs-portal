import { describe, expect, it } from 'vitest';
import type {
  ApiSearchHit,
  CurrentVersionInput,
  NormalizedApiResult,
} from './api-result-normalizer';
import {
  admitApiHit,
  aggregateApiResults,
  normalizeApiHit,
} from './api-result-normalizer';
import { classifySearchIntent } from './search-intent';

const currentAndroidRenewToken = {
  _highlightResult: {
    hierarchy: {
      lvl1: { matchLevel: 'full', value: '<mark>renewToken</mark>' },
    },
    content: { matchLevel: 'none', value: 'renewToken' },
  },
  hierarchy: {
    lvl0: 'API Reference ❯ Video Sdk ❯ Android ❯ 4.x (current)',
    lvl1: 'renewToken',
  },
  objectID: 'android-renew-token-4',
  platform: 'android',
  product: 'video-sdk',
  url: 'https://api-ref.agora.io/en/video-sdk/android/4.x/interfaces/rtcengine.html#renewtoken',
  version: '4.x',
};

const webRenewToken = {
  hierarchy: {
    lvl0: 'API Reference ❯ Video Sdk ❯ Web ❯ 4.x (current)',
    lvl1: 'renewToken',
  },
  objectID: 'web-renew-token-4',
  platform: 'web',
  product: 'video-sdk',
  url: 'https://api-ref.agora.io/en/video-sdk/web/4.x/interfaces/rtcengine.html#renewtoken',
  version: '4.x',
};

const oldAndroidRenewToken = {
  hierarchy: {
    lvl0: 'API Reference ❯ Video Sdk ❯ Android ❯ 3.x',
    lvl1: 'renewToken',
  },
  objectID: 'android-renew-token-3',
  platform: 'android',
  product: 'video-sdk',
  url: 'https://api-ref.agora.io/en/video-sdk/android/3.x/interfaces/rtcengine.html#renewtoken',
  version: '3.x',
};

function intent(query: string) {
  return classifySearchIntent(query);
}

function normalizeValidApiHit(
  hit: ApiSearchHit,
  queryIntent: ReturnType<typeof intent>,
  current?: CurrentVersionInput,
): NormalizedApiResult {
  const result = normalizeApiHit(hit, queryIntent, current);
  if (!result) throw new Error('Expected a valid normalized API hit');
  return result;
}

describe('SDK API result normalization', () => {
  it('normalizes hierarchy, marks, platforms, and current version', () => {
    const result = normalizeValidApiHit(
      currentAndroidRenewToken,
      intent('renewToken'),
    );

    expect(result).toMatchObject({
      canonicalKey: 'video-sdk|rtcengine|renewtoken|member',
      displayTitle: 'renewToken',
      id: 'android-renew-token-4',
      isCurrentVersion: true,
      path: ['API Reference', 'Video SDK', 'Android', '4.x (current)'],
      platforms: ['android'],
      titleMatch: true,
      url: currentAndroidRenewToken.url,
      version: '4.x',
    });
  });

  it('aggregates platforms and chooses current version, respecting a platform filter', () => {
    const results = [
      normalizeValidApiHit(currentAndroidRenewToken, intent('renew token')),
      normalizeValidApiHit(webRenewToken, intent('renew token')),
      normalizeValidApiHit(oldAndroidRenewToken, intent('renew token')),
    ];

    expect(aggregateApiResults(results)).toEqual([
      expect.objectContaining({
        canonicalKey: 'video-sdk|rtcengine|renewtoken|member',
        isCurrentVersion: true,
        platforms: ['android', 'web'],
        url: currentAndroidRenewToken.url,
        version: '4.x',
      }),
    ]);

    expect(aggregateApiResults(results, 'android')[0]).toMatchObject({
      platforms: ['android', 'web'],
      url: currentAndroidRenewToken.url,
    });
  });

  it('does not merge same symbols from different classes or products', () => {
    const joinChannel = (product: string, className: string, id: string) =>
      normalizeValidApiHit(
        {
          hierarchy: {
            lvl0: `API Reference ❯ ${product} ❯ Android ❯ 4.x (current)`,
            lvl1: className,
            lvl2: 'joinChannel',
          },
          objectID: id,
          platform: 'android',
          product,
          url: `https://api-ref.agora.io/${product}/android/4.x/interfaces/${className}.html#joinchannel`,
          version: '4.x',
        },
        intent('joinChannel'),
      );

    const results = aggregateApiResults([
      joinChannel('video-sdk', 'rtcengine', 'video-join'),
      joinChannel('video-sdk', 'channel-media-options', 'video-channel'),
      joinChannel('voice-sdk', 'rtcengine', 'voice-join'),
    ]);

    expect(results).toHaveLength(3);
    expect(new Set(results.map((result) => result.canonicalKey)).size).toBe(3);
  });

  it.each(['AgoraRtcEngineKit', 'IRtcEngine', 'IAgoraRTCClient'])(
    'admits %s as an exact RtcEngine class alias',
    (classAlias) => {
      const normalized = normalizeValidApiHit(
        {
          hierarchy: {
            lvl0: 'API Reference ❯ Video Sdk ❯ iOS ❯ 4.x (current)',
            lvl1: `Class ${classAlias}`,
          },
          objectID: `class-${classAlias}`,
          platform: 'ios',
          product: 'video-sdk',
          url: `https://api-ref.agora.io/${classAlias}.html`,
          version: '4.x',
        },
        intent('RtcEngine'),
      );

      expect(admitApiHit(normalized, intent('RtcEngine'), false)).toBe(true);
      expect(normalized.canonicalKey).toBe('video-sdk|rtcengine|class');
    },
  );

  it.each(['renewToken', 'setAudioProfile'])(
    'aggregates Android, iOS, and Web %s results across root client aliases',
    (symbol) => {
      const platformHits = [
        {
          classAlias: 'IRtcEngine',
          label: 'Android',
          platform: 'android',
        },
        {
          classAlias: 'AgoraRtcEngineKit',
          label: 'iOS',
          platform: 'ios',
        },
        {
          classAlias: 'IAgoraRTCClient',
          label: 'Web',
          platform: 'web',
        },
      ].map(({ classAlias, label, platform }) =>
        normalizeValidApiHit(
          {
            hierarchy: {
              lvl0: `API Reference ❯ Video Sdk ❯ ${label} ❯ 4.x (current)`,
              lvl1: `Class ${classAlias}`,
              lvl2: symbol,
            },
            objectID: `${platform}-${symbol}`,
            platform,
            product: 'video-sdk',
            url: `https://api-ref.agora.io/${platform}/${classAlias}.html#${symbol.toLowerCase()}`,
            version: '4.x',
          },
          intent(symbol),
        ),
      );

      const results = aggregateApiResults(platformHits);

      expect(results).toHaveLength(1);
      expect(results[0]).toMatchObject({
        canonicalKey: `video-sdk|rtcengine|${symbol.toLowerCase()}|member`,
        platforms: ['android', 'ios', 'web'],
      });
    },
  );

  it('does not canonicalize similar non-root class names', () => {
    const create = (className: string) =>
      normalizeValidApiHit(
        {
          hierarchy: {
            lvl1: `Class ${className}`,
            lvl2: 'renewToken',
          },
          objectID: className,
          product: 'video-sdk',
          url: `https://api-ref.agora.io/${className}.html#renewtoken`,
        },
        intent('renewToken'),
      );

    expect(
      aggregateApiResults([create('IRtcEngine'), create('IRtcEngineEx')]),
    ).toHaveLength(2);
  });

  it('derives class and member identity from hierarchy levels without duplicating class pages', () => {
    const classPage = normalizeValidApiHit(
      {
        hierarchy: {
          lvl0: 'API Reference ❯ Video Sdk ❯ Android ❯ 4.x (current)',
          lvl1: 'Class RtcEngine',
        },
        objectID: 'rtc-engine-class',
        platform: 'android',
        product: 'video-sdk',
        url: 'https://api-ref.agora.io/en/video-sdk/android/4.x/interfaces/rtcengine.html',
        version: '4.x',
      },
      intent('RtcEngine'),
    );
    const member = normalizeValidApiHit(
      {
        hierarchy: {
          lvl0: 'API Reference ❯ Video Sdk ❯ Android ❯ 4.x (current)',
          lvl1: 'Class RtcEngine',
          lvl2: 'joinChannel',
        },
        objectID: 'rtc-engine-member',
        platform: 'android',
        product: 'video-sdk',
        url: 'https://api-ref.agora.io/en/video-sdk/android/4.x/interfaces/rtcengine.html#joinchannel',
        version: '4.x',
      },
      intent('joinChannel'),
    );

    expect(classPage.canonicalKey).toBe('video-sdk|rtcengine|class');
    expect(member.canonicalKey).toBe('video-sdk|rtcengine|joinchannel|member');
    expect(
      normalizeValidApiHit(
        {
          hierarchy: classPage.path.length
            ? { lvl0: classPage.path.join(' ❯ '), lvl1: 'Class RtcEngine' }
            : undefined,
          objectID: 'rtc-engine-class-alias',
          product: 'Video SDK',
          url: classPage.url,
        },
        intent('RtcEngine'),
      )?.canonicalKey,
    ).toBe('video-sdk|rtcengine|class');
  });

  it('uses a safe canonical identity for malformed hits', () => {
    expect(normalizeApiHit(null, intent('joinChannel'))).toBeUndefined();
    expect(normalizeApiHit(undefined, intent('joinChannel'))).toBeUndefined();
    expect(normalizeApiHit({}, intent('joinChannel'))).toBeUndefined();

    expect(
      normalizeApiHit({ objectID: 'a' }, intent('joinChannel')),
    ).toBeUndefined();
    expect(
      normalizeApiHit(
        { hierarchy: { lvl1: 'joinChannel' }, url: 'not a url' },
        intent('joinChannel'),
      ),
    ).toBeUndefined();
    expect(admitApiHit(null, intent('joinChannel'), false)).toBe(false);
    expect(admitApiHit(null, intent('speech to text'), true)).toBe(false);
    expect(admitApiHit({}, intent('speech to text'), true)).toBe(false);
    expect(admitApiHit({ objectID: 'a' }, intent('speech to text'), true)).toBe(
      false,
    );
  });

  it('normalizes Enum aliases and explicit member kinds', () => {
    const enumPage = normalizeValidApiHit(
      {
        hierarchy: {
          lvl0: 'API Reference ❯ Video Sdk ❯ Android ❯ 4.x (current)',
          lvl1: 'Enum NetworkQuality',
        },
        objectID: 'network-quality-enum',
        platform: 'android',
        product: 'video-sdk',
        url: 'https://api-ref.agora.io/en/video-sdk/android/4.x/enums/networkquality.html',
        version: '4.x',
      },
      intent('NetworkQuality'),
    );
    const method = normalizeValidApiHit(
      {
        hierarchy: {
          lvl0: 'API Reference ❯ Video Sdk ❯ Android ❯ 4.x (current)',
          lvl1: 'Class RtcEngine',
          lvl2: 'Function joinChannel',
        },
        objectID: 'join-channel-function',
        platform: 'android',
        product: 'video-sdk',
        url: 'https://api-ref.agora.io/en/video-sdk/android/4.x/interfaces/rtcengine.html#joinchannel',
        version: '4.x',
      },
      intent('joinChannel'),
    );

    expect(enumPage?.canonicalKey).toBe('video-sdk|networkquality|enum');
    expect(method?.canonicalKey).toBe('video-sdk|rtcengine|joinchannel|method');
  });

  it('admits an exact member symbol after normalization', () => {
    const normalized = normalizeValidApiHit(
      {
        hierarchy: {
          lvl1: 'Interface NetworkQuality',
          lvl2: 'uplinkNetworkQuality',
        },
        objectID: 'uplink-quality',
        product: 'video-sdk',
        url: 'https://api-ref.agora.io/interfaces/networkquality.html#uplinknetworkquality',
      },
      intent('uplinkNetworkQuality'),
    );
    expect(admitApiHit(normalized, intent('uplinkNetworkQuality'), false)).toBe(
      true,
    );
  });

  it('adds missing member anchors and preserves existing anchors', () => {
    const base = {
      hierarchy: {
        lvl1: 'Interface NetworkQuality',
        lvl2: 'uplinkNetworkQuality',
      },
      objectID: 'uplink-quality',
      product: 'video-sdk',
    };
    expect(
      normalizeValidApiHit(
        {
          ...base,
          url: 'https://api-ref.agora.io/interfaces/networkquality.html',
        },
        intent('uplinkNetworkQuality'),
      ).url,
    ).toBe(
      'https://api-ref.agora.io/interfaces/networkquality.html#uplinknetworkquality',
    );
    expect(
      normalizeValidApiHit(
        {
          ...base,
          hierarchy: {
            lvl1: 'Interface NetworkQuality',
            lvl2: 'foo_barNetworkQuality',
          },
          url: 'https://api-ref.agora.io/interfaces/networkquality.html',
        },
        intent('foo_barNetworkQuality'),
      ).url,
    ).toBe(
      'https://api-ref.agora.io/interfaces/networkquality.html#foo_barnetworkquality',
    );
    expect(
      normalizeValidApiHit(
        {
          ...base,
          url: 'https://api-ref.agora.io/interfaces/networkquality.html#existing-anchor',
        },
        intent('uplinkNetworkQuality'),
      ).url,
    ).toBe(
      'https://api-ref.agora.io/interfaces/networkquality.html#existing-anchor',
    );

    expect(
      normalizeValidApiHit(
        {
          hierarchy: {
            lvl1: 'Class IRtcEngine',
            lvl2: 'setParameters',
          },
          objectID: 'android-set-parameters',
          platform: 'android',
          product: 'video-sdk',
          url: 'https://api-ref.agora.io/android/class_irtcengine.html',
        },
        intent('setParameters'),
      ).url,
    ).toBe('https://api-ref.agora.io/android/class_irtcengine.html');
  });

  it('does not let URL basename class inference overwrite an explicit member kind', () => {
    const result = normalizeValidApiHit(
      {
        hierarchy: { lvl1: 'joinChannel' },
        kind: 'method',
        objectID: 'standalone-method',
        product: 'video-sdk',
        url: 'https://api-ref.agora.io/methods/joinChannel.html',
      },
      intent('joinChannel'),
    );
    expect(result.canonicalKey).toBe(
      'video-sdk|joinchannel|joinchannel|method',
    );
  });

  it('canonicalizes kind aliases before aggregation', () => {
    const create = (kind: 'Enum' | 'Enumeration', id: string) =>
      normalizeValidApiHit(
        {
          hierarchy: { lvl1: `${kind} NetworkQuality` },
          objectID: id,
          platform: 'android',
          product: 'video-sdk',
          url: `https://api-ref.agora.io/${id}/networkquality.html`,
        },
        intent('NetworkQuality'),
      );
    expect(
      aggregateApiResults([create('Enum', 'a'), create('Enumeration', 'b')]),
    ).toHaveLength(1);

    const createCallable = (kind: 'Function' | 'Method', id: string) =>
      normalizeValidApiHit(
        {
          hierarchy: {
            lvl1: 'Class RtcEngine',
            lvl2: `${kind} joinChannel`,
          },
          objectID: id,
          platform: 'android',
          product: 'video-sdk',
          url: `https://api-ref.agora.io/${id}/rtcengine.html#joinchannel`,
        },
        intent('joinChannel'),
      );
    expect(
      aggregateApiResults([
        createCallable('Function', 'function'),
        createCallable('Method', 'method'),
      ]),
    ).toHaveLength(1);
  });

  it('keeps product-less results distinct by URL identity', () => {
    const create = (productPath: string) =>
      normalizeValidApiHit(
        {
          hierarchy: { lvl1: 'joinChannel' },
          objectID: productPath,
          url: `https://api-ref.agora.io/${productPath}/rtcengine.html`,
        },
        intent('joinChannel'),
      );
    expect(create('product-a').canonicalKey).not.toBe(
      create('product-b').canonicalKey,
    );
    expect(create('a-b').canonicalKey).not.toBe(create('ab').canonicalKey);
  });

  it('normalizes relative and absolute URLs to the same class identity', () => {
    const create = (url: string) =>
      normalizeValidApiHit(
        {
          hierarchy: { lvl1: 'joinChannel' },
          objectID: url,
          product: 'video-sdk',
          url,
        },
        intent('joinChannel'),
      );
    expect(create('/interfaces/rtcengine.html#joinchannel').canonicalKey).toBe(
      create('https://api-ref.agora.io/interfaces/rtcengine.html#joinchannel')
        .canonicalKey,
    );
  });

  it('does not infer a platform segment as an API version', () => {
    const result = normalizeValidApiHit(
      {
        hierarchy: {
          lvl0: 'API Reference ❯ Video SDK ❯ Android',
          lvl1: 'joinChannel',
        },
        objectID: 'join-channel-no-version',
        platform: 'android',
        product: 'video-sdk',
        url: 'https://api-ref.agora.io/en/video-sdk/android/interfaces/rtcengine.html#joinchannel',
      },
      intent('joinChannel'),
    );
    expect(result?.version).toBeUndefined();
  });

  it('compares complete version tuples within the same major version', () => {
    const create = (version: string) =>
      normalizeValidApiHit(
        {
          hierarchy: { lvl1: 'renewToken' },
          objectID: version,
          platform: 'android',
          product: 'video-sdk',
          url: `https://api-ref.agora.io/video-sdk/${version}/rtcengine.html`,
          version,
        },
        intent('renew token'),
      );
    expect(
      aggregateApiResults([create('4.1.9'), create('4.6.0')])[0].version,
    ).toBe('4.6.0');
  });

  it('requires an explicit non-none Algolia matchLevel', () => {
    const result = normalizeValidApiHit(
      {
        _highlightResult: { content: { value: '<mark>renew</mark>' } },
        hierarchy: { lvl1: 'renewToken' },
        objectID: 'missing-level',
        product: 'video-sdk',
        url: 'https://api-ref.agora.io/video-sdk/rtcengine.html',
      },
      intent('unrelated'),
    );
    expect(result.contentMatch).toBe(false);
  });

  it('accepts a configured current path even when the hierarchy has no current marker', () => {
    const historical = normalizeValidApiHit(
      oldAndroidRenewToken,
      intent('renew token'),
      { currentPath: '/video-sdk/android/4.x/' },
    );

    expect(historical.isCurrentVersion).toBe(false);
    expect(
      normalizeValidApiHit(
        {
          ...currentAndroidRenewToken,
          hierarchy: {
            lvl0: 'API Reference ❯ Video Sdk ❯ Android ❯ 4.x',
            lvl1: 'renewToken',
          },
        },
        intent('renew token'),
        { currentPath: '/video-sdk/android/4.x/' },
      ).isCurrentVersion,
    ).toBe(true);

    const unmarkedCurrent = normalizeValidApiHit(
      {
        ...currentAndroidRenewToken,
        hierarchy: {
          lvl0: 'API Reference ❯ Video Sdk ❯ Android ❯ 4.x',
          lvl1: 'renewToken',
        },
      },
      intent('renew token'),
    );
    const unmarkedHistorical = normalizeValidApiHit(
      {
        ...oldAndroidRenewToken,
        hierarchy: {
          lvl0: 'API Reference ❯ Video Sdk ❯ Android ❯ 3.x',
          lvl1: 'renewToken',
        },
      },
      intent('renew token'),
    );
    expect(
      aggregateApiResults([unmarkedHistorical, unmarkedCurrent], undefined, {
        currentPath: '/video-sdk/android/4.x/',
      })[0],
    ).toMatchObject({
      isCurrentVersion: true,
      url: unmarkedCurrent.url,
    });

    const hierarchyCurrent = normalizeValidApiHit(
      {
        hierarchy: {
          lvl0: 'API Reference ❯ Video SDK ❯ Android ❯ 4.x',
          lvl1: 'renewToken',
        },
        objectID: 'hierarchy-current',
        platform: 'android',
        product: 'video-sdk',
        url: 'https://api-ref.agora.io/archive/rtcengine.html#renewtoken',
        version: '4.x',
      },
      intent('renew token'),
    );
    const higherHistorical = normalizeValidApiHit(
      {
        hierarchy: {
          lvl0: 'API Reference ❯ Video SDK ❯ Android ❯ 5.x',
          lvl1: 'renewToken',
        },
        objectID: 'higher-historical',
        platform: 'android',
        product: 'video-sdk',
        url: 'https://api-ref.agora.io/archive-v5/rtcengine.html#renewtoken',
        version: '5.x',
      },
      intent('renew token'),
    );
    expect(
      aggregateApiResults(
        [hierarchyCurrent, higherHistorical].filter(
          (result): result is NonNullable<typeof result> => Boolean(result),
        ),
        undefined,
        { currentPath: '/video-sdk/android/4.x/' },
      )[0],
    ).toMatchObject({ id: 'hierarchy-current', isCurrentVersion: true });
  });
});

describe('SDK API admission', () => {
  it('accepts exact and normalized API symbols', () => {
    const hit = normalizeValidApiHit(
      currentAndroidRenewToken,
      intent('renew token'),
    );
    const joinChannel = {
      ...currentAndroidRenewToken,
      hierarchy: {
        ...currentAndroidRenewToken.hierarchy,
        lvl1: 'joinChannel',
      },
    };

    expect(admitApiHit(joinChannel, intent('joinChannel'), false)).toBe(true);
    expect(
      admitApiHit(
        {
          ...joinChannel,
          hierarchy: {
            ...joinChannel.hierarchy,
            lvl1: 'onJoinChannelSuccess',
          },
        },
        intent('joinChannel'),
        false,
      ),
    ).toBe(false);
    expect(
      admitApiHit(currentAndroidRenewToken, intent('renew token'), false),
    ).toBe(true);
    expect(admitApiHit(hit, intent('renew token'), false)).toBe(true);
  });

  it('rejects partial matches and weak content-only matches', () => {
    const noisyHit = {
      ...currentAndroidRenewToken,
      _highlightResult: {
        content: { matchLevel: 'full', value: '<mark>foo</mark> bar' },
      },
      hierarchy: {
        lvl0: 'API Reference ❯ Video Sdk ❯ Android ❯ 4.x',
        lvl1: 'onFaceInfo',
      },
    };

    expect(admitApiHit(noisyHit, intent('foo bar baz'), false)).toBe(false);
    expect(admitApiHit(noisyHit, intent('speech to text'), false)).toBe(false);

    const missingJoinedMajorTerm = {
      ...currentAndroidRenewToken,
      hierarchy: {
        lvl0: 'API Reference ❯ Video Sdk ❯ Android ❯ 4.x',
        lvl1: 'renewThingToken',
      },
    };
    expect(
      admitApiHit(missingJoinedMajorTerm, intent('renew token'), false),
    ).toBe(false);
  });

  it('allows an explicitly selected API scope to bypass natural-language gating', () => {
    const hit = {
      ...currentAndroidRenewToken,
      hierarchy: {
        lvl0: 'API Reference ❯ Video Sdk ❯ Android ❯ 4.x',
        lvl1: 'onFaceInfo',
      },
    };

    expect(admitApiHit(hit, intent('speech to text'), true)).toBe(true);
  });

  it('normalizes platform aliases and picks the requested platform deterministically', () => {
    const android = normalizeValidApiHit(
      currentAndroidRenewToken,
      intent('renew token'),
    );
    const javascript = normalizeValidApiHit(
      {
        ...webRenewToken,
        platform: 'reactjs',
        url: webRenewToken.url.replace('/web/', '/reactjs/'),
      },
      intent('renew token'),
    );
    const unreal = normalizeValidApiHit(
      {
        ...webRenewToken,
        platform: 'unreal-engine',
        url: webRenewToken.url.replace('/web/', '/unreal-engine/'),
      },
      intent('renew token'),
    );
    const windows = normalizeValidApiHit(
      {
        ...webRenewToken,
        platform: 'windows-csharp',
        url: webRenewToken.url.replace('/web/', '/windows-csharp/'),
      },
      intent('renew token'),
    );

    expect(javascript.platforms).toEqual(['javascript']);
    expect(unreal.platforms).toEqual(['unreal']);
    expect(windows.platforms).toEqual(['windows']);
    expect(aggregateApiResults([javascript, android], 'reactjs')[0].url).toBe(
      javascript.url,
    );
    expect(aggregateApiResults([javascript, android])[0].url).toBe(android.url);
    expect(aggregateApiResults([javascript, android])[0].platforms).toEqual([
      'android',
      'javascript',
    ]);
    expect(
      aggregateApiResults([android, unreal, windows], 'unreal-engine')[0].url,
    ).toBe(unreal.url);
    expect(
      aggregateApiResults([android, unreal, windows], 'windows-cpp')[0].url,
    ).toBe(windows.url);

    for (const platformName of ['flutter', 'react-native', 'cpp', 'react-js']) {
      const platformResult = normalizeValidApiHit(
        {
          ...webRenewToken,
          platform: platformName,
          url: webRenewToken.url.replace('/web/', `/${platformName}/`),
        },
        intent('renew token'),
      );
      expect(
        aggregateApiResults([android, platformResult], platformName)[0].url,
      ).toBe(platformResult.url);
    }
  });

  it('chooses the same representative regardless of input ordering', () => {
    const first = normalizeValidApiHit(
      { ...currentAndroidRenewToken, objectID: 'z', url: '/z/rtcengine.html' },
      intent('renew token'),
    );
    const second = normalizeValidApiHit(
      { ...currentAndroidRenewToken, objectID: 'a', url: '/a/rtcengine.html' },
      intent('renew token'),
    );
    expect(aggregateApiResults([first, second])[0].url).toBe(
      '/a/rtcengine.html',
    );
    expect(aggregateApiResults([second, first])[0].url).toBe(
      '/a/rtcengine.html',
    );
  });
});
