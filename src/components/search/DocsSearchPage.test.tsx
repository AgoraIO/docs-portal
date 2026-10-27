import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { recordRecentPage } from '@/lib/recently-viewed';
import {
  type CnSearchPageResponse,
  loadCnSearchCatalog,
  searchCnDocsPage,
} from '@/lib/search/cn-search-page';
import { parseSearchPageState } from '@/lib/search/search-page-state';
import { DocsSearchPage } from './DocsSearchPage';
import { SearchHighlight } from './SearchResultList';

vi.mock('@/lib/search/cn-search-page', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/search/cn-search-page')>()),
  searchCnDocsPage: vi.fn(),
  loadCnSearchCatalog: vi.fn(),
}));
const empty: CnSearchPageResponse = {
  groups: [],
  totalHits: 0,
  totalPages: 0,
  page: 1,
  facets: {},
};

describe('DocsSearchPage', () => {
  it('shows product documentation before APIs and links to the complete API family', async () => {
    const groups = [
      {
        pageUrl: '/api-reference/rtc/android/video',
        title: '视频增强',
        version: '4.7.0',
      },
      {
        pageUrl: '/realtime-media/rtc/build/video/advanced-beauty/android',
        title: '高级美颜',
      },
    ].map((page) => ({
      ...page,
      product: 'rtc',
      platform: ['android'],
      docType: 'docs' as const,
      sections: [
        {
          id: page.pageUrl,
          sourceId: page.pageUrl,
          url: page.pageUrl,
          pageTitle: page.title,
          sectionTitle: page.title,
          content: page.title,
          snippet: page.title,
          headingPath: [page.title],
          locale: 'zh-CN',
          docType: 'docs' as const,
          audience: ['developer'],
          status: 'published' as const,
          hidden: false,
          highlights: {
            sectionTitle: [{ text: page.title, highlighted: false }],
            content: [{ text: page.title, highlighted: false }],
          },
        },
      ],
    }));
    vi.mocked(searchCnDocsPage).mockResolvedValue({
      ...empty,
      groups,
      totalHits: 2,
      totalPages: 1,
    });
    const onChange = vi.fn();
    render(
      <DocsSearchPage
        state={parseSearchPageState({ q: '高级美颜' })}
        onChange={onChange}
      />,
    );
    await screen.findByRole('link', { name: '高级美颜' });
    const sections = screen
      .getAllByRole('region')
      .filter((region) =>
        ['产品文档', 'API 文档'].includes(
          region.getAttribute('aria-label') ?? '',
        ),
      );
    expect(
      sections.map((section) => section.getAttribute('aria-label')),
    ).toEqual(['产品文档', 'API 文档']);
    expect(screen.queryByText('4.7.0')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '查看全部API 文档' }));
    expect(onChange).toHaveBeenCalledWith({ type: 'api', page: 1 });
  });

  it('keeps published alternatives selectable after a filtered direct visit', async () => {
    vi.mocked(loadCnSearchCatalog).mockResolvedValue({
      platform: { android: 20, harmonyos: 5, flutter: 8 },
      product: { rtc: 20, whiteboard: 5 },
    });
    vi.mocked(searchCnDocsPage).mockResolvedValue({
      ...empty,
      facets: { platform: { android: 1 }, product: { rtc: 1 } },
    });
    const onChange = vi.fn();
    render(
      <DocsSearchPage
        state={parseSearchPageState({
          q: 'joinChannel',
          product: 'rtc',
          platform: 'android',
        })}
        onChange={onChange}
      />,
    );
    expect(
      await screen.findByRole('option', { name: 'HarmonyOS' }),
    ).toBeEnabled();
    expect(screen.getByRole('option', { name: '互动白板' })).toBeEnabled();
    fireEvent.change(screen.getByRole('combobox', { name: '平台' }), {
      target: { value: 'harmonyos' },
    });
    expect(onChange).toHaveBeenCalledWith({
      platform: 'harmonyos',
      version: undefined,
    });
  });

  it('applies mobile filter changes only on confirmation and cancels drafts', async () => {
    const onChange = vi.fn();
    render(
      <DocsSearchPage
        state={parseSearchPageState({ q: 'joinChannel', platform: 'android' })}
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: '筛选 (1)' }));
    fireEvent.change(screen.getByRole('combobox', { name: '平台' }), {
      target: { value: 'harmonyos' },
    });
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: '关闭筛选' }));
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: '筛选 (1)' }));
    expect(screen.getByRole('combobox', { name: '平台' })).toHaveValue(
      'android',
    );
    fireEvent.change(screen.getByRole('combobox', { name: '平台' }), {
      target: { value: 'harmonyos' },
    });
    fireEvent.click(screen.getByRole('button', { name: '查看结果' }));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ platform: 'harmonyos', page: 1 }),
    );
  });

  it('shows recent CN pages with public or previous URLs and excludes other destinations', async () => {
    recordRecentPage({ title: '旧中文文档', url: '/zh-CN/realtime-media/rtc' });
    recordRecentPage({
      title: '新版中文文档',
      url: '/realtime-media/rtc/build/token-authentication',
    });
    recordRecentPage({ title: '英文文档', url: '/en/introduction' });
    recordRecentPage({
      title: '外部链接',
      url: 'https://example.com/realtime-media/rtc',
    });
    render(
      <DocsSearchPage state={parseSearchPageState({})} onChange={vi.fn()} />,
    );
    expect(
      await screen.findByRole('link', { name: '新版中文文档' }),
    ).toHaveAttribute('href', '/realtime-media/rtc/build/token-authentication');
    expect(screen.getByRole('link', { name: '旧中文文档' })).toHaveAttribute(
      'href',
      '/zh-CN/realtime-media/rtc',
    );
    expect(
      screen.queryByRole('link', { name: '英文文档' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: '外部链接' }),
    ).not.toBeInTheDocument();
  });

  it('does not expose versions or a publication hint, including legacy version links', async () => {
    vi.mocked(searchCnDocsPage).mockResolvedValue({
      ...empty,
      facets: { version: { '4.6.0': 1, '4.7.0': 2 } },
    });
    render(
      <DocsSearchPage
        state={parseSearchPageState({
          q: 'Token',
          product: 'rtc',
          platform: 'web',
          version: '4.6.0',
        })}
        onChange={vi.fn()}
      />,
    );
    await waitFor(() => expect(searchCnDocsPage).toHaveBeenCalled());
    expect(
      screen.queryByRole('combobox', { name: '版本' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('当前发布文档')).not.toBeInTheDocument();
    expect(screen.queryByText('4.6.0')).not.toBeInTheDocument();
  });

  it('merges legacy product aliases into one canonical option', async () => {
    vi.mocked(searchCnDocsPage).mockResolvedValue({
      ...empty,
      facets: {
        product: {
          'ppt-conversion-service': 1,
          'ppt-transcoding': 2,
          'micro-calling': 1,
          'voip-callkit': 2,
          analytics: 1,
          'agora-analytics': 1,
          'online-art-teaching': 1,
          'online-music-teaching': 1,
          overview: 1,
        },
      },
    });
    render(
      <DocsSearchPage
        state={parseSearchPageState({ q: 'Token' })}
        onChange={vi.fn()}
        productScopes={[
          {
            id: 'ppt-transcoding',
            label: 'PPT 转码服务',
            scope: { field: 'product', value: 'ppt-transcoding' },
          },
        ]}
      />,
    );
    await waitFor(() =>
      expect(
        screen.getByRole('option', { name: '在线美术教学' }),
      ).toBeInTheDocument(),
    );
    const labels = screen.getAllByRole('option').map((o) => o.textContent);
    expect(
      labels.filter((label) => label?.startsWith('PPT 转码服务')),
    ).toHaveLength(1);
    expect(screen.getByRole('option', { name: 'PPT 转码服务' })).toHaveValue(
      'ppt-transcoding',
    );
    expect(screen.getByRole('option', { name: '微呼叫' })).toHaveValue(
      'voip-call',
    );
    expect(screen.getByRole('option', { name: '水晶球' })).toHaveValue(
      'analytics',
    );
    expect(screen.getByRole('option', { name: '水晶球' })).toHaveValue(
      'analytics',
    );
    expect(
      screen.queryByRole('option', { name: '产品概览' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('option', { name: '介绍' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('option', { name: '参考文档' }),
    ).not.toBeInTheDocument();
  });
  beforeEach(() => {
    vi.mocked(searchCnDocsPage).mockResolvedValue(empty);
    vi.mocked(loadCnSearchCatalog).mockResolvedValue({});
    window.localStorage.clear();
  });
  afterEach(() => vi.clearAllMocks());

  it('labels canonical product facets and hides excluded products', async () => {
    const labels = [
      ['analytics', '水晶球'],
      ['chatroom', '声动语聊'],
      ['digital-learning', '教育信息化'],
      ['ppt-transcoding', 'PPT 转码服务'],
      ['one-to-one-live', '1v1 私密房'],
      ['voip-call', '微呼叫'],
    ];
    vi.mocked(searchCnDocsPage).mockResolvedValue({
      ...empty,
      facets: {
        product: {
          ...Object.fromEntries(labels.map(([id]) => [id, 1])),
          'ppt-conversion-service': 1,
          'micro-calling': 1,
          danmaku: 1,
        },
      },
    });
    const onChange = vi.fn();
    render(
      <DocsSearchPage
        state={parseSearchPageState({ q: 'Token' })}
        onChange={onChange}
      />,
    );
    for (const [id, label] of labels) {
      expect(await screen.findByRole('option', { name: label })).toHaveValue(
        id,
      );
    }
    expect(
      screen.queryByRole('option', { name: '弹幕玩法' }),
    ).not.toBeInTheDocument();
    fireEvent.change(screen.getByRole('combobox', { name: '产品' }), {
      target: { value: 'analytics' },
    });
    expect(onChange).toHaveBeenCalledWith({
      product: 'analytics',
      version: undefined,
    });
  });

  it('clears the submitted query and returns to the start state while keeping filters', async () => {
    function Harness() {
      const [state, setState] = useState(
        parseSearchPageState({ q: 'Token', product: 'rtc' }),
      );
      return (
        <DocsSearchPage
          state={state}
          onChange={(patch) =>
            setState((previous) => ({ ...previous, ...patch }))
          }
        />
      );
    }
    render(<Harness />);
    await screen.findByText('没有找到匹配的文档');
    fireEvent.click(screen.getByRole('button', { name: '清空关键词' }));
    expect(
      await screen.findByRole('heading', { name: '从一个关键词开始' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('searchbox')).toHaveValue('');
    expect(screen.queryByText('没有找到匹配的文档')).not.toBeInTheDocument();
    await waitFor(() =>
      expect(vi.mocked(searchCnDocsPage).mock.lastCall?.[0]).toMatchObject({
        q: '',
        product: 'rtc',
        page: 1,
      }),
    );
  });

  it('preserves submitted input and supports keyboard focus without an AI entry', async () => {
    const onChange = vi.fn();
    render(
      <DocsSearchPage
        state={parseSearchPageState({ q: 'Token' })}
        onChange={onChange}
      />,
    );
    await screen.findByText('没有找到匹配的文档');
    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value: 'manualSOS' } });
    fireEvent.submit(input.closest('form') as HTMLFormElement);
    expect(onChange).toHaveBeenCalledWith({ q: 'manualSOS', page: 1 });
    expect(input).toHaveValue('manualSOS');
    fireEvent.keyDown(document, { key: 'k', ctrlKey: true });
    expect(input).toHaveFocus();
    expect(screen.queryByText('AI 问答')).not.toBeInTheDocument();
  });

  it('aborts the old request and ignores its result after the query changes', async () => {
    let finishOld: (value: CnSearchPageResponse) => void = () => {};
    vi.mocked(searchCnDocsPage)
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            finishOld = resolve;
          }),
      )
      .mockResolvedValueOnce({ ...empty, totalHits: 7 });
    const onChange = vi.fn();
    const view = render(
      <DocsSearchPage
        state={parseSearchPageState({ q: 'old' })}
        onChange={onChange}
      />,
    );
    const oldSignal = vi.mocked(searchCnDocsPage).mock.calls[0][1];
    view.rerender(
      <DocsSearchPage
        state={parseSearchPageState({ q: 'new' })}
        onChange={onChange}
      />,
    );
    expect(oldSignal?.aborted).toBe(true);
    await screen.findByText('没有找到匹配的文档');
    await act(async () =>
      finishOld({
        ...empty,
        totalHits: 99,
        groups: [
          {
            pageUrl: '/realtime-media/rtc/old',
            title: '过期结果',
            platform: [],
            docType: 'docs',
            sections: [
              {
                id: 'old',
                sourceId: 'old',
                url: '/realtime-media/rtc/old',
                pageTitle: '过期结果',
                sectionTitle: '过期结果',
                content: '过期结果',
                snippet: '过期结果',
                headingPath: [],
                locale: 'zh-CN',
                docType: 'docs',
                audience: [],
                status: 'published',
                hidden: false,
                highlights: {
                  sectionTitle: [{ text: '过期结果', highlighted: false }],
                  content: [{ text: '过期结果', highlighted: false }],
                },
              },
            ],
          },
        ],
      }),
    );
    expect(
      screen.queryByRole('link', { name: '过期结果' }),
    ).not.toBeInTheDocument();
    expect(screen.getByText('没有找到匹配的文档')).toBeInTheDocument();
  });

  it('offers recovery for service errors and can retry the same URL', async () => {
    vi.mocked(searchCnDocsPage)
      .mockRejectedValueOnce(new Error('503'))
      .mockResolvedValueOnce(empty);
    render(
      <DocsSearchPage
        state={parseSearchPageState({ q: 'Token' })}
        onChange={vi.fn()}
      />,
    );
    await screen.findByRole('alert');
    expect(screen.queryByText('没有找到匹配的文档')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '重新搜索' }));
    await screen.findByText('没有找到匹配的文档');
    expect(searchCnDocsPage).toHaveBeenCalledTimes(2);
  });

  it('uses real facets and merges more chapters with recovery without changing the URL', async () => {
    vi.mocked(searchCnDocsPage).mockResolvedValue({
      ...empty,
      totalHits: 22,
      totalPages: 2,
      facets: { product: { rtc: 22 }, platform: { web: 22 } },
      groups: [
        {
          pageUrl: '/zh-CN/guide',
          title: 'RTC 指南',
          product: 'rtc',
          platform: ['web'],
          docType: 'docs',
          sections: [
            {
              id: 'one',
              sourceId: 'one',
              url: '/zh-CN/guide#token',
              pageTitle: 'RTC 指南',
              sectionTitle: 'Token',
              content: 'Token 说明',
              snippet: 'Token 说明',
              audience: ['developer'],
              headingPath: ['RTC 指南', 'Token'],
              locale: 'zh-CN',
              docType: 'docs',
              status: 'published',
              hidden: false,
              highlights: {
                sectionTitle: [{ text: 'Token', highlighted: true }],
                content: [{ text: 'Token 说明', highlighted: false }],
              },
            },
          ],
        },
      ],
    });
    const onChange = vi.fn();
    const view = render(
      <DocsSearchPage
        state={parseSearchPageState({ q: 'Token' })}
        onChange={onChange}
      />,
    );
    await screen.findByRole('link', { name: 'RTC 指南' });
    fireEvent.change(screen.getByRole('combobox', { name: '产品' }), {
      target: { value: 'rtc' },
    });
    expect(onChange).toHaveBeenCalledWith({
      product: 'rtc',
      version: undefined,
    });
    expect(screen.queryByText(/个章节匹配/)).not.toBeInTheDocument();
    const first = await vi.mocked(searchCnDocsPage).mock.results[0].value;
    const group = first.groups[0];
    vi.mocked(searchCnDocsPage)
      .mockRejectedValueOnce(new Error('503'))
      .mockResolvedValueOnce({
        ...first,
        page: 2,
        groups: [
          {
            ...group,
            sections: [
              {
                ...group.sections[0],
                id: 'two',
                url: '/zh-CN/guide#renew',
                sectionTitle: '续期',
                highlights: {
                  ...group.sections[0].highlights,
                  sectionTitle: [{ text: '续期', highlighted: false }],
                },
              },
            ],
          },
        ],
      });
    fireEvent.click(screen.getByRole('button', { name: '加载更多' }));
    await screen.findByRole('button', { name: '加载失败，重试' });
    expect(vi.mocked(searchCnDocsPage).mock.lastCall?.[0]).toMatchObject({
      page: 2,
    });
    expect(onChange).not.toHaveBeenCalledWith({ page: 2 });
    expect(screen.getAllByRole('link', { name: 'RTC 指南' })).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: '加载失败，重试' }));
    await screen.findByText('另 1 个命中章节');
    expect(screen.getAllByRole('link', { name: 'RTC 指南' })).toHaveLength(1);
    expect(screen.getByText('已展示 1 篇文档')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: '加载更多' }),
    ).not.toBeInTheDocument();
    vi.mocked(searchCnDocsPage).mockResolvedValueOnce(empty);
    view.rerender(
      <DocsSearchPage
        state={parseSearchPageState({ q: 'other' })}
        onChange={onChange}
      />,
    );
    await screen.findByText('没有找到匹配的文档');
    expect(
      screen.queryByRole('link', { name: 'RTC 指南' }),
    ).not.toBeInTheDocument();
    expect(vi.mocked(searchCnDocsPage).mock.lastCall?.[0]).toMatchObject({
      q: 'other',
      page: 1,
    });
    view.rerender(
      <DocsSearchPage
        state={parseSearchPageState({ q: 'Token' })}
        onChange={onChange}
      />,
    );
    await waitFor(() =>
      expect(vi.mocked(searchCnDocsPage).mock.lastCall?.[0]).toMatchObject({
        q: 'Token',
        page: 1,
      }),
    );
  });

  it('renders highlighted snippets as text rather than executing engine markup', () => {
    const view = render(
      <p>
        <SearchHighlight
          segments={[
            { text: '<img src=x onerror=alert(1)>', highlighted: false },
            { text: 'Token', highlighted: true },
          ]}
        />
      </p>,
    );
    expect(view.container.querySelector('img')).toBeNull();
    expect(view.container.querySelector('mark')).toHaveTextContent('Token');
    expect(view.container).toHaveTextContent('<img src=x onerror=alert(1)>');
  });
});
