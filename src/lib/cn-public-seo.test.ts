import { afterEach, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

it('publishes CN sitemap, canonical, sharing and Markdown URLs without the locale prefix', async () => {
  vi.stubEnv('VITE_DOCS_REGION', 'cn');
  vi.stubEnv('SITE_URL', 'https://docs.shengwang.cn');
  vi.resetModules();
  const { getSitemapUrls } = await import('./sitemap');
  const { createStaticSeoManifest, createStaticSeoHead } = await import(
    './static-seo'
  );
  const pages = [{ url: '/zh-CN/reference/sdks', title: 'SDK 下载' }];
  expect(getSitemapUrls({ pages })).toEqual([
    'https://docs.shengwang.cn/reference/sdks',
  ]);
  const [page] = createStaticSeoManifest({ pages });
  expect(page.url).toBe('/zh-CN/reference/sdks');
  expect(page.canonicalUrl).toBe('https://docs.shengwang.cn/reference/sdks');
  expect(page.markdownUrl).toBe('https://docs.shengwang.cn/reference/sdks.md');
  const head = createStaticSeoHead(page);
  expect(head.meta).toContainEqual({
    property: 'og:site_name',
    content: '声网文档中心',
  });
  expect(head.meta).toContainEqual({
    property: 'og:url',
    content: page.canonicalUrl,
  });
  const [platform] = createStaticSeoManifest({
    pages: [
      {
        url: '/zh-CN/realtime-media/rtc/build/video/screen-share/android',
        canonicalPath: '/zh-CN/realtime-media/rtc/build/video/screen-share',
        markdownPath:
          '/zh-CN/realtime-media/rtc/build/video/screen-share/android.md',
      },
    ],
  });
  expect(platform.canonicalUrl).toBe(
    'https://docs.shengwang.cn/realtime-media/rtc/build/video/screen-share',
  );
  expect(platform.markdownUrl).toBe(
    'https://docs.shengwang.cn/realtime-media/rtc/build/video/screen-share/android.md',
  );
});
