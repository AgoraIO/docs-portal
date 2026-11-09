import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { getPublicDocsMarkdownResponse } from './docs-markdown.server';
import {
  isPermanentMovedDocsRedirect,
  resolveMovedDocsRedirect,
} from './docs-moved-redirects';
import { loadDocsPagePayload } from './docs-page.server';
import { resolveLegacySitemapRedirectPath } from './legacy-sitemap/redirects';

const oldSegments = ['iot', 'reference', 'communicate-with-rtc-sdk'];
const target =
  '/en/realtime-media/iot/build/send-messages/interoperate-with-rtc-sdk';

describe('IoT v1.9.7 documentation moves', () => {
  it.each(['', '.md'])(
    'permanently redirects the old guide%s in the app and deployment',
    async (suffix) => {
      const segments = [...oldSegments];
      segments[segments.length - 1] += suffix;
      expect(resolveMovedDocsRedirect('en', 'realtime-media', segments)).toBe(
        target + suffix,
      );
      expect(
        isPermanentMovedDocsRedirect('en', 'realtime-media', segments),
      ).toBe(true);
      expect(
        resolveMovedDocsRedirect('zh-CN', 'realtime-media', segments),
      ).toBeNull();
      for (const file of ['vercel.base.json', 'vercel.json']) {
        expect(JSON.parse(readFileSync(file, 'utf8')).redirects).toContainEqual(
          {
            source: `/en/realtime-media/${oldSegments.join('/')}${suffix}`,
            destination: target + suffix,
            statusCode: 301,
          },
        );
      }
      if (suffix) {
        const response = await getPublicDocsMarkdownResponse({
          locale: 'en',
          tab: 'realtime-media',
          slugSegments: segments,
        });
        expect(response?.status).toBe(301);
        expect(response?.headers.get('Location')).toBe(target + suffix);
      } else {
        await expect(
          loadDocsPagePayload('en', 'realtime-media', segments),
        ).resolves.toEqual({ redirectUrl: target, statusCode: 301 });
      }
    },
  );

  it.each(['android', 'linux-c'])(
    'sends the legacy %s entrance straight to the current guide',
    (platform) => {
      expect(
        resolveLegacySitemapRedirectPath(
          '/en/iot/reference/communicate_with_rtc_sdk',
          `?platform=${platform}`,
        ),
      ).toMatchObject({
        target,
        legacySearch: `?platform=${platform}`,
        preserveSearch: true,
      });
    },
  );
});
