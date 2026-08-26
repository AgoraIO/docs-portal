import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  getRealtimeMediaApiReferenceLinks,
  realtimeMediaApiReferenceLinks,
} from './realtime-media-api-reference-links';

const docsRoot = path.join(process.cwd(), 'content', 'docs');
const sdkApiReference = '/en/api-reference/api-ref';
const sdkProductFilters = {
  rtc: 'realtime-communication',
  voice: 'realtime-communication-voice-only',
  video: 'realtime-communication',
  'broadcast-streaming': 'realtime-communication',
  'interactive-live-streaming': 'realtime-communication',
  rtm: 'signaling',
  im: 'chat',
  whiteboard: 'interactive-whiteboard',
  'flexible-classroom': 'flexible-classroom',
  iot: 'iot-sdk',
  'on-premise-recording': 'on-premise-recording',
  'rtc-server-sdk': 'server-gateway',
} as const;

function sdkCatalogUrl(product: keyof typeof sdkProductFilters) {
  return `${sdkApiReference}?product=${sdkProductFilters[product]}`;
}

const sdkAndRestProducts = {
  rtc: '/en/api-reference/api-ref/rtc',
  voice: '/en/api-reference/api-ref/rtc',
  video: '/en/api-reference/api-ref/rtc',
  'broadcast-streaming': '/en/api-reference/api-ref/rtc',
  'interactive-live-streaming': '/en/api-reference/api-ref/rtc',
  rtm: '/en/api-reference/api-ref/signaling',
  im: '/en/api-reference/api-ref/im',
  whiteboard: '/en/api-reference/api-ref/whiteboard',
  'flexible-classroom':
    '/en/api-reference/api-ref/flexible-classroom/classroom-rest-api',
  iot: '/en/api-reference/api-ref/iot-channel-management-rest-api',
} as const;

const restOnlyProducts = {
  'cloud-recording': '/en/api-reference/api-ref/cloud-recording',
  transcoding: '/en/api-reference/api-ref/cloud-transcoding',
  'speech-to-text': '/en/api-reference/api-ref/speech-to-text',
  'media-pull': '/en/api-reference/api-ref/media-pull',
  'media-push': '/en/api-reference/api-ref/media-push',
  'rtmp-gateway': '/en/api-reference/api-ref/rtmp-gateway',
  'agora-analytics':
    '/en/api-reference/api-ref/agora-analytics/analytics-rest-api',
  marketplace: '/en/api-reference/api-ref/extensions-marketplace/provisioning',
} as const;

const sdkOnlyProducts = ['on-premise-recording', 'rtc-server-sdk'] as const;

const expectedLinks = [
  ...Object.entries(sdkAndRestProducts).map(([productSlug, restUrl]) => ({
    productSlug,
    restUrl,
    sdkUrl: sdkCatalogUrl(productSlug as keyof typeof sdkProductFilters),
  })),
  ...Object.entries(restOnlyProducts).map(([productSlug, restUrl]) => ({
    productSlug,
    restUrl,
  })),
  ...sdkOnlyProducts.map((productSlug) => ({
    productSlug,
    sdkUrl: sdkCatalogUrl(productSlug),
  })),
];
const expectedProducts = expectedLinks.map(({ productSlug }) => productSlug);

function readReferencePages(product: string) {
  const metaPath = path.join(
    docsRoot,
    'en',
    'realtime-media',
    product,
    'reference',
    'meta.json',
  );
  const meta = JSON.parse(readFileSync(metaPath, 'utf8')) as {
    pages: string[];
  };

  return meta.pages;
}

function routeExists(href: string) {
  const routePath = href.split(/[?#]/, 1)[0];
  const contentPath = path.join(
    docsRoot,
    ...routePath.split('/').filter(Boolean),
  );
  const candidates = [
    `${contentPath}.md`,
    `${contentPath}.mdx`,
    path.join(contentPath, 'index.md'),
    path.join(contentPath, 'index.mdx'),
  ];

  return candidates.some((candidate) => existsSync(candidate));
}

describe('product API reference navigation', () => {
  it('classifies every realtime media product with reference metadata', () => {
    const realtimeMediaRoot = path.join(docsRoot, 'en', 'realtime-media');
    const actualProducts = readdirSync(realtimeMediaRoot, {
      withFileTypes: true,
    })
      .filter(
        (entry) =>
          entry.isDirectory() &&
          existsSync(
            path.join(realtimeMediaRoot, entry.name, 'reference', 'meta.json'),
          ),
      )
      .map((entry) => entry.name)
      .sort();
    expect(actualProducts).toEqual([...expectedProducts].sort());
  });

  it('matches the centralized API reference link registry', () => {
    expect(realtimeMediaApiReferenceLinks).toEqual(expectedLinks);
  });

  it.each([
    '/en/realtime-media/rtc/voice-quickstart',
    '/en/realtime-media/rtc/voice-quickstart?platform=android',
    '/en/realtime-media/rtc/voice-quickstart#download-the-sdk',
  ])(
    'uses the voice-only SDK filter for the unified voice quickstart at %s',
    (activePath) => {
      expect(getRealtimeMediaApiReferenceLinks(activePath)).toEqual({
        productSlug: 'rtc',
        restUrl: '/en/api-reference/api-ref/rtc',
        sdkUrl: sdkCatalogUrl('voice'),
      });
    },
  );

  it.each([
    '/en/realtime-media/rtc',
    '/en/realtime-media/rtc/android/quick-start/build-from-scratch',
    '/en/realtime-media/rtc/voice-quickstart-extra',
    '/en/realtime-media/rtc/voice-quickstart/build',
  ])('keeps the full RTC SDK filter for %s', (activePath) => {
    expect(getRealtimeMediaApiReferenceLinks(activePath)).toEqual({
      productSlug: 'rtc',
      restUrl: '/en/api-reference/api-ref/rtc',
      sdkUrl: sdkCatalogUrl('rtc'),
    });
  });

  it.each(expectedProducts)('%s metadata does not own API jumps', (product) => {
    const apiJumps = readReferencePages(product).filter(
      (page) =>
        typeof page === 'string' &&
        (page.startsWith('[SDK API reference](') ||
          page.startsWith('[REST API](')),
    );

    expect(apiJumps).toEqual([]);
  });

  it('resolves every internal API navigation target to English docs content', () => {
    const apiTargets = new Set(
      realtimeMediaApiReferenceLinks
        .flatMap((links) => [
          'restUrl' in links ? links.restUrl : undefined,
          'sdkUrl' in links ? links.sdkUrl : undefined,
        ])
        .filter((target) => target !== undefined),
    );
    const unresolvedTargets = [...apiTargets].filter(
      (target) => !routeExists(target),
    );

    expect(unresolvedTargets).toEqual([]);
  });
});
