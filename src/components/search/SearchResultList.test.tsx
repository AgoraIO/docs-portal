import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { SearchPageGroup } from '@/lib/search/cn-search-page';
import { SearchResultList } from './SearchResultList';

const group: SearchPageGroup = {
  groupKey: 'canonical\u0000rtc\u0000docs\u0000',
  pageUrl: '/zh-CN/realtime-media/rtc/build/token-authentication',
  title: '使用 Token 鉴权',
  product: 'rtc',
  platform: ['android', 'ios', 'web'],
  availablePlatforms: ['android', 'ios', 'web'],
  docType: 'docs',
  sections: [
    {
      id: 'android',
      sourceId: 'android',
      canonicalUrl: '/zh-CN/realtime-media/rtc/build/token-authentication',
      availablePlatforms: ['android', 'ios', 'web'],
      url: '/zh-CN/realtime-media/rtc/build/token-authentication/android#token',
      pageTitle: '使用 Token 鉴权',
      sectionTitle: 'Token',
      content: 'Token 说明',
      snippet: 'Token 说明',
      headingPath: ['使用 Token 鉴权', 'Token'],
      locale: 'zh-CN',
      platform: ['android'],
      docType: 'docs',
      audience: ['developer'],
      status: 'published',
      hidden: false,
      highlights: {
        sectionTitle: [{ text: 'Token', highlighted: true }],
        content: [{ text: 'Token 说明', highlighted: false }],
      },
    },
  ],
};

describe('SearchResultList', () => {
  it('links unfiltered results to the canonical document and preserves section hash', () => {
    render(
      <SearchResultList groups={[group]} productLabel={() => '实时互动 RTC'} />,
    );

    expect(
      screen.getByRole('link', { name: '使用 Token 鉴权' }),
    ).toHaveAttribute(
      'href',
      '/zh-CN/realtime-media/rtc/build/token-authentication',
    );
    expect(
      screen
        .getAllByRole('link', { name: /Token/ })
        .find((link) => link.getAttribute('href')?.includes('#token')),
    ).toHaveAttribute(
      'href',
      '/zh-CN/realtime-media/rtc/build/token-authentication#token',
    );
    expect(screen.getByText('Android')).toBeInTheDocument();
    expect(screen.getByText('iOS')).toBeInTheDocument();
    expect(screen.getByText('Web')).toBeInTheDocument();
  });

  it('links platform-filtered results to the selected platform URL', () => {
    render(
      <SearchResultList
        groups={[
          {
            ...group,
            groupKey: 'platform\u0000rtc\u0000docs\u0000',
            pageUrl:
              '/zh-CN/realtime-media/rtc/build/token-authentication/android',
            platform: ['android'],
          },
        ]}
        platformFiltered
        productLabel={() => '实时互动 RTC'}
      />,
    );

    expect(
      screen.getByRole('link', { name: '使用 Token 鉴权' }),
    ).toHaveAttribute(
      'href',
      '/zh-CN/realtime-media/rtc/build/token-authentication/android',
    );
    expect(
      screen
        .getAllByRole('link', { name: /Token/ })
        .find((link) => link.getAttribute('href')?.includes('#token')),
    ).toHaveAttribute(
      'href',
      '/zh-CN/realtime-media/rtc/build/token-authentication/android#token',
    );
  });
});
