import { describe, expect, it, vi } from 'vitest';

vi.mock('./site-region', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./site-region')>()),
  isPublishedDocsLocale: (locale: string) => locale === 'zh-CN',
}));
vi.mock('./source.server', () => ({
  source: {
    getPageTree: () => ({ name: 'Docs', children: [] }),
    getPages: () => ['return_404', 'unlisted-private-page'].map(slug => ({
      type: 'docs',
      path: `zh-CN/reference/faq/integration/${slug}.mdx`,
      slugs: ['zh-CN', 'reference', 'faq', 'integration', slug],
      url: `/zh-CN/reference/faq/integration/${slug}`,
      data: { title: slug, getText: async () => '公开问答正文。' },
    })),
  },
}));
vi.mock('./openapi/markdown', () => ({ getOpenApiMarkdownPages: async () => [] }));

import { loadDocsSearchIndex } from './docs-page.server';

describe('CN search component navigation', () => {
  it('exports linked FAQ content while excluding an unlisted sibling', async () => {
    const entries = await loadDocsSearchIndex('zh-CN');
    expect(entries).toEqual([
      expect.objectContaining({
        url: '/zh-CN/reference/faq/integration/return_404',
        content: '公开问答正文。',
        breadcrumbs: ['常见问题', '集成类'],
      }),
    ]);
  });
});
