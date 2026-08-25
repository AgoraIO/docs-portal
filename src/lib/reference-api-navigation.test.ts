import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const docsRoot = path.join(process.cwd(), 'content', 'docs');
const sdkApiReference = '/en/api-reference/api-ref';

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

const sdkOnlyProducts = {
  'on-premise-recording': '/en/api-reference/api-ref/on-premise-recording',
  'rtc-server-sdk': '/en/api-reference/api-ref',
} as const;

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

function getNavigationEntries(pages: string[], label: string) {
  return pages.filter((page) => page.includes(`[${label}](`));
}

function routeExists(href: string) {
  const contentPath = path.join(docsRoot, ...href.split('/').filter(Boolean));
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
    const expectedProducts = [
      ...Object.keys(sdkAndRestProducts),
      ...Object.keys(restOnlyProducts),
      ...Object.keys(sdkOnlyProducts),
    ].sort();

    expect(actualProducts).toEqual(expectedProducts);
  });

  describe('SDK and REST products', () => {
    it.each(Object.entries(sdkAndRestProducts))(
      '%s links to the shared SDK catalog and its REST API',
      (product, restApiReference) => {
        const pages = readReferencePages(product);

        expect(getNavigationEntries(pages, 'SDK API reference')).toEqual([
          `[SDK API reference](${sdkApiReference})`,
        ]);
        expect(getNavigationEntries(pages, 'REST API')).toEqual([
          `[REST API](${restApiReference})`,
        ]);
      },
    );
  });

  describe('REST-only products', () => {
    it.each(Object.entries(restOnlyProducts))(
      '%s links only to its REST API',
      (product, restApiReference) => {
        const pages = readReferencePages(product);

        expect(getNavigationEntries(pages, 'REST API')).toEqual([
          `[REST API](${restApiReference})`,
        ]);
        expect(getNavigationEntries(pages, 'SDK API reference')).toEqual([]);
      },
    );
  });

  describe('SDK-only products', () => {
    it.each(Object.entries(sdkOnlyProducts))(
      '%s links only to its SDK API reference',
      (product, productSdkApiReference) => {
        const pages = readReferencePages(product);

        expect(getNavigationEntries(pages, 'SDK API reference')).toEqual([
          `[SDK API reference](${productSdkApiReference})`,
        ]);
        expect(getNavigationEntries(pages, 'REST API')).toEqual([]);
      },
    );
  });

  it('resolves every internal API navigation target to English docs content', () => {
    const apiTargets = new Set([
      sdkApiReference,
      ...Object.values(sdkAndRestProducts),
      ...Object.values(restOnlyProducts),
      ...Object.values(sdkOnlyProducts),
    ]);
    const unresolvedTargets = [...apiTargets].filter(
      (target) => !routeExists(target),
    );

    expect(unresolvedTargets).toEqual([]);
  });
});
