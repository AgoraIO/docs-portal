import { describe, expect, it, vi } from 'vitest';

vi.mock('./site-region', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./site-region')>()),
  isPublishedDocsLocale: (locale: string) => locale === 'zh-CN',
}));
vi.mock('./source.server', () => ({
  source: {
    getPageTree: () => ({
      name: 'Docs',
      children: [
        ...['channel', '4.6.0/channel'].map((slug) => ({
          type: 'page',
          name: slug,
          url: `/zh-CN/api-reference/rtc/android/${slug}`,
        })),
      ],
    }),
    getPages: () =>
      ['return_404', 'unlisted-private-page']
        .map((slug) => ({
          type: 'docs',
          path: `zh-CN/reference/faq/integration/${slug}.mdx`,
          slugs: ['zh-CN', 'reference', 'faq', 'integration', slug],
          url: `/zh-CN/reference/faq/integration/${slug}`,
          data: { title: slug, getText: async () => '公开问答正文。' },
        }))
        .concat(
          ['channel', '4.6.0/channel'].map((slug) => ({
            type: 'docs',
            path: `zh-CN/api-reference/rtc/android/${slug}.mdx`,
            slugs: ['api-reference', 'rtc', 'android', ...slug.split('/')],
            url: `/zh-CN/api-reference/rtc/android/${slug}`,
            data: {
              title: 'joinChannel',
              getText: async () => 'joinChannel [1/2]',
            },
          })),
        ),
  },
}));
vi.mock('./openapi/markdown', () => ({
  getOpenApiMarkdownPages: async () => [],
}));

import { loadDocsSearchIndex } from './docs-page.server';

describe('CN search component navigation', () => {
  it('exports linked FAQ content while excluding an unlisted sibling', async () => {
    const entries = await loadDocsSearchIndex('zh-CN');
    expect(entries.filter((entry) => entry.url.includes('/faq/'))).toEqual([
      expect.objectContaining({
        url: '/zh-CN/reference/faq/integration/return_404',
        content: '公开问答正文。',
        breadcrumbs: ['常见问题', '集成类'],
      }),
    ]);
  });

  it('indexes only the configured current SDK body with its actual version', async () => {
    const entries = (await loadDocsSearchIndex('zh-CN')).filter((entry) =>
      entry.url.includes('/api-reference/rtc/android/'),
    );
    expect(entries).toEqual([
      expect.objectContaining({
        url: '/zh-CN/api-reference/rtc/android/channel',
        version: '4.7.0',
        content: 'joinChannel [1/2]',
      }),
    ]);
  });
});
