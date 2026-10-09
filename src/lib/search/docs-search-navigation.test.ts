import type { Root } from 'fumadocs-core/page-tree';
import { describe, expect, it } from 'vitest';
import { buildDocsSearchNavigation } from './docs-search-navigation';

describe('buildDocsSearchNavigation', () => {
  it('includes CN FAQ links exposed by the component even when absent from the sidebar', () => {
    const navigation = buildDocsSearchNavigation({ name: 'Docs', children: [] }, 'zh-CN');
    expect(navigation.get('/zh-CN/reference/faq/integration/return_404'))
      .toEqual(['常见问题', '集成类']);
    expect(navigation.has('/zh-CN/reference/faq/integration/unlisted-private-page'))
      .toBe(false);
  });

  it('does not expand FAQ component links for the English search allowlist', () => {
    const navigation = buildDocsSearchNavigation({ name: 'Docs', children: [] }, 'en');
    expect(navigation.has('/zh-CN/reference/faq/integration/return_404'))
      .toBe(false);
    expect(navigation.has('/en/reference/faq/integration/return_404'))
      .toBe(false);
  });

  it('includes only pages present in the final tree with its real labels', () => {
    const tree: Root = {
      name: 'Docs',
      children: [
        {
          type: 'folder',
          name: 'RTC',
          root: true,
          children: [
            {
              type: 'folder',
              name: 'Reference',
              children: [
                {
                  type: 'page',
                  name: 'Pricing',
                  url: '/en/realtime-media/voice/reference/pricing',
                },
              ],
            },
          ],
        },
      ],
    };

    const navigation = buildDocsSearchNavigation(tree);

    expect(
      navigation.get('/en/realtime-media/voice/reference/pricing'),
    ).toEqual(['RTC', 'Reference']);
    expect(
      navigation.has('/en/realtime-media/voice/reference/billing-policies'),
    ).toBe(false);
  });
});
