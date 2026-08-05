import type { Root } from 'fumadocs-core/page-tree';
import { describe, expect, it } from 'vitest';
import { buildDocsSearchNavigation } from './docs-search-navigation';

describe('buildDocsSearchNavigation', () => {
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
