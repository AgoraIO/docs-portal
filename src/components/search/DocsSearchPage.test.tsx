import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  type CnSearchPageResponse,
  searchCnDocsPage,
} from '@/lib/search/cn-search-page';
import { parseSearchPageState } from '@/lib/search/search-page-state';
import { DocsSearchPage } from './DocsSearchPage';
import { SearchHighlight } from './SearchResultList';

vi.mock('@/lib/search/cn-search-page', () => ({ searchCnDocsPage: vi.fn() }));
const empty: CnSearchPageResponse = {
  groups: [],
  totalHits: 0,
  totalPages: 0,
  page: 1,
  facets: {},
};

describe('DocsSearchPage', () => {
  beforeEach(() => {
    vi.mocked(searchCnDocsPage).mockResolvedValue(empty);
    window.localStorage.clear();
  });
  afterEach(() => vi.clearAllMocks());

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
    await screen.findByText('7 个章节匹配');
    await act(async () => finishOld({ ...empty, totalHits: 99 }));
    expect(screen.queryByText('99 个章节匹配')).not.toBeInTheDocument();
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

  it('uses real facets, updates filters, and exposes pagination', async () => {
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
    render(
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
    fireEvent.click(screen.getByRole('button', { name: '下一页' }));
    expect(onChange).toHaveBeenCalledWith({ page: 2 });
    await waitFor(() =>
      expect(screen.getByText('22 个章节匹配')).toBeInTheDocument(),
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
