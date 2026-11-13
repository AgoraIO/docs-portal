import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { createCnDocsSearchClient } from '@/lib/search/cn-search-client';
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
  it.each([
    { query: '鉴权', platform: undefined, expected: 'web' },
    { query: '鉴权', platform: 'android', expected: 'android' },
    { query: '鉴权 Android', platform: undefined, expected: 'android' },
  ])(
    'uses the same guide entrance and snippet as quick search ($query, $platform)',
    async ({ query, platform, expected }) => {
      const canonical = '/zh-CN/realtime-media/rtc/build/token-authentication';
      const groups = [
        {
          ...group,
          sections: ['android', 'web']
            .filter((variant) => !platform || variant === platform)
            .map((variant) => ({
              ...group.sections[0],
              id: variant,
              canonicalUrl: canonical,
              defaultPlatform: 'web',
              url: `${canonical}/${variant}#token`,
              platform: [variant],
              highlights: {
                ...group.sections[0].highlights,
                content: [{ text: `${variant}配置说明`, highlighted: false }],
              },
            })),
        },
      ];
      const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        Response.json({
          groups,
          totalHits: 1,
          totalPages: 1,
          page: 1,
          facets: {},
        }),
      );
      try {
        const quick = await createCnDocsSearchClient({ platform }).search(
          query,
        );
        const view = render(
          <SearchResultList
            groups={groups}
            query={query}
            platform={platform}
            productLabel={() => '实时互动'}
          />,
        );
        expect(
          view.container.querySelector('a.search-page-result-title'),
        ).toHaveAttribute('href', quick[0].url);
        expect(quick[0].url).toBe(`${canonical}/${expected}#token`);
        expect(view.container.querySelector('.line-clamp-2')).toHaveTextContent(
          `${expected}配置说明`,
        );
      } finally {
        fetchMock.mockRestore();
      }
    },
  );

  it('shows API members in the same order and with the same destinations as quick search', async () => {
    const groups = [
      {
        ...group,
        pageUrl: '/api-reference/rtc/android/channel',
        sections: ['joinChannel', 'leaveChannel'].map((symbol) => ({
          ...group.sections[0],
          id: symbol,
          sectionTitle: symbol,
          url: `/api-reference/rtc/android/channel#${symbol}`,
          highlights: {
            ...group.sections[0].highlights,
            sectionTitle: [{ text: symbol, highlighted: false }],
          },
        })),
      },
      {
        ...group,
        groupKey: 'second-api',
        pageUrl: '/api-reference/rtc/web/channel',
        sections: [
          {
            ...group.sections[0],
            id: 'web',
            url: '/api-reference/rtc/web/channel#join',
          },
        ],
      },
    ];
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      Response.json({
        groups,
        totalHits: 3,
        totalPages: 1,
        page: 1,
        facets: {},
      }),
    );
    try {
      const quick = await createCnDocsSearchClient({}).search('joinChannel');
      const view = render(
        <SearchResultList
          groups={groups}
          query="joinChannel"
          productLabel={() => '实时互动'}
        />,
      );
      expect(
        Array.from(
          view.container.querySelectorAll('a.search-page-result-title'),
        ).map((link) => link.getAttribute('href')),
      ).toEqual(quick.map((hit) => hit.url));
    } finally {
      fetchMock.mockRestore();
    }
  });

  it.each([
    'onTokenPrivilegeWillExpire',
    'login',
    'initialize',
    'destroy',
    'Initialize',
  ])(
    'makes the exact API member %s the primary destination, while keeping a page entrance',
    (symbol) => {
      const apiGroup = {
        ...group,
        pageUrl: '/api-reference/rtc/android/channel',
        title: '频道相关',
        sections: [
          {
            ...group.sections[0],
            url: `/api-reference/rtc/android/channel#${symbol.toLowerCase()}`,
            sectionTitle: symbol,
            highlights: {
              ...group.sections[0].highlights,
              sectionTitle: [{ text: symbol, highlighted: true }],
            },
          },
        ],
      };
      render(
        <SearchResultList
          groups={[apiGroup]}
          productLabel={() => '实时互动'}
          query={symbol}
        />,
      );
      expect(screen.getByRole('link', { name: symbol })).toHaveAttribute(
        'href',
        apiGroup.sections[0].url,
      );
      expect(screen.getByRole('link', { name: '查看整页' })).toHaveAttribute(
        'href',
        apiGroup.pageUrl,
      );
    },
  );
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
    fireEvent.click(screen.getByRole('link', { name: 'Token' }));
    expect(onSelectResult).toHaveBeenCalledWith(
      expect.anything(),
      group.sections[0].url,
      4,
      1,
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

    expect(screen.getByRole('link', { name: 'Token' })).toHaveAttribute(
      'href',
      '/zh-CN/realtime-media/rtc/build/token-authentication/android#token',
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
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
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

    expect(screen.getByRole('link', { name: 'Token' })).toHaveAttribute(
      'href',
      '/zh-CN/realtime-media/rtc/build/token-authentication/android#token',
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
