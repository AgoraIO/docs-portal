import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
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
  it('reports the visible global rank after an earlier result family', () => {
    const onSelectResult = vi.fn((event: { preventDefault(): void }) =>
      event.preventDefault(),
    );
    render(
      <SearchResultList
        groups={[group]}
        productLabel={() => '实时互动'}
        onSelectResult={onSelectResult}
        rankOffset={3}
      />,
    );
    fireEvent.click(screen.getByRole('link', { name: '使用 Token 鉴权' }));
    expect(onSelectResult).toHaveBeenCalledWith(
      expect.anything(),
      group.pageUrl,
      4,
    );
  });
  it('distinguishes the React companion Web reference from the standalone Web SDK', () => {
    render(
      <SearchResultList
        groups={[
          {
            ...group,
            groupKey: 'react-web',
            pageUrl:
              '/api-reference/rtc/react-sdk/web-sdk/interfaces/iagorartcclient',
            title: 'Interface IAgoraRTCClient',
            platform: ['web'],
            version: '4.22.0',
          },
          {
            ...group,
            groupKey: 'web',
            pageUrl: '/api-reference/rtc/web/interfaces/iagorartcclient',
            title: 'Interface IAgoraRTCClient',
            platform: ['web'],
            version: '4.24.9',
          },
        ]}
        productLabel={() => '实时互动 RTC'}
      />,
    );
    expect(screen.getByText('React SDK 配套 Web SDK')).toBeInTheDocument();
    expect(screen.getByText('Web SDK')).toBeInTheDocument();
    expect(screen.queryByText('4.22.0')).not.toBeInTheDocument();
    expect(screen.queryByText('4.24.9')).not.toBeInTheDocument();
  });

  it('preserves the matched platform and section hash without a platform filter', () => {
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
      '/zh-CN/realtime-media/rtc/build/token-authentication/android#token',
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
