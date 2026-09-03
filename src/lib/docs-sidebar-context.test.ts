import { describe, expect, it } from 'vitest';
import { parseProductSidebarContext } from './docs-sidebar-context';

describe('product sidebar context', () => {
  it('accepts a same-locale product pathname', () => {
    expect(
      parseProductSidebarContext(
        '?from=%2Fzh-CN%2Frealtime-media%2Frtc',
        'zh-CN',
      ),
    ).toEqual({
      locale: 'zh-CN',
      pathname: '/zh-CN/realtime-media/rtc',
      slugSegments: ['rtc'],
      tab: 'realtime-media',
    });
  });

  it.each([
    '?from=https%3A%2F%2Fevil.example%2Fdocs',
    '?from=%2Fen%2Frealtime-media%2Frtc',
    '?from=%2Fzh-CN%2Fapi-reference%2Fapi-ref%2Frtc',
    '?from=%2Fzh-CN%2Funknown%2Frtc',
    '?from=%2Fzh-CN%2Frealtime-media',
  ])('rejects invalid product context %s', (search) => {
    expect(parseProductSidebarContext(search, 'zh-CN')).toBeNull();
  });

  it('normalizes a trailing slash and ignores unrelated search parameters', () => {
    expect(
      parseProductSidebarContext(
        '?platform=web&from=%2Fzh-CN%2Fsolutions%2Fmeeting%2F',
        'zh-CN',
      ),
    ).toEqual({
      locale: 'zh-CN',
      pathname: '/zh-CN/solutions/meeting',
      slugSegments: ['meeting'],
      tab: 'solutions',
    });
  });
});
