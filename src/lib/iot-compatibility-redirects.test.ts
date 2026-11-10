import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { getPublicDocsMarkdownResponse } from './docs-markdown.server';
import {
  isPermanentMovedDocsRedirect,
  resolveMovedDocsRedirect,
} from './docs-moved-redirects';
import { loadDocsPagePayload } from './docs-page.server';
import { resolveLegacySitemapRedirectPath } from './legacy-sitemap/redirects';
import { resolveStaticLegacySitemapRedirect } from './legacy-sitemap/static-redirects';

const target =
  '/en/realtime-media/iot/build/send-messages/interoperate-with-rtc-sdk';
const oldPaths = [
  'realtime-media/iot/reference/communicate-with-rtc-sdk',
  'iot/reference/communicate_with_rtc_sdk',
];

describe('IoT compatibility guide moves', () => {
  it.each(oldPaths)(
    'redirects %s and its Markdown address directly to the current guide',
    async (path) => {
      const [tab, ...segments] = path.split('/');
      for (const suffix of ['', '.md']) {
        const slugs = [...segments];
        slugs[slugs.length - 1] += suffix;
        expect(resolveMovedDocsRedirect('en', tab, slugs)).toBe(
          target + suffix,
        );
        expect(isPermanentMovedDocsRedirect('en', tab, slugs)).toBe(true);
        expect(resolveMovedDocsRedirect('zh-CN', tab, slugs)).toBeNull();
        for (const config of ['vercel.base.json', 'vercel.json']) {
          expect(
            JSON.parse(readFileSync(config, 'utf8')).redirects,
          ).toContainEqual({
            source: `/en/${path}${suffix}`,
            destination: target + suffix,
            statusCode: 301,
          });
        }
      }
      await expect(loadDocsPagePayload('en', tab, segments)).resolves.toEqual({
        redirectUrl: target,
        statusCode: 301,
      });
      const markdownSlugs = [...segments];
      markdownSlugs[markdownSlugs.length - 1] += '.md';
      const response = await getPublicDocsMarkdownResponse({
        locale: 'en',
        tab,
        slugSegments: markdownSlugs,
      });
      expect(response?.status).toBe(301);
      expect(response?.headers.get('Location')).toBe(`${target}.md`);
    },
  );

  it.each(['android', 'linux-c'])(
    'updates the old-site %s mapping and static fallback without a redirect chain',
    (platform) => {
      const path = '/en/iot/reference/communicate_with_rtc_sdk';
      expect(
        resolveLegacySitemapRedirectPath(path, `?platform=${platform}`),
      ).toMatchObject({ target, preserveSearch: true });
      expect(
        resolveStaticLegacySitemapRedirect(path, `?platform=${platform}`),
      ).toEqual({ redirectUrl: target, preserveSearch: true });
    },
  );

  it('preserves historical section anchors and leaves the canonical guide reachable', () => {
    const guide = readFileSync(`content/docs${target}.mdx`, 'utf8');
    for (const id of [
      'set-up-rtc-sdk-for-nativethird-party-frameworks',
      'set-up-video-sdk-for-nativethird-party-frameworks',
      'set-up-video-sdk-for-web',
      'set-up-video-sdk-for-embedded-systems',
    ])
      expect(guide).toContain(`id="${id}"`);
    expect(
      resolveMovedDocsRedirect(
        'en',
        'realtime-media',
        target.split('/').slice(3),
      ),
    ).toBeNull();
  });
});
