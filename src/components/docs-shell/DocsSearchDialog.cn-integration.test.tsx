import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppProviders } from '@/components/providers/AppProviders';
import { RECENTLY_VIEWED_STORAGE_KEY } from '@/lib/recently-viewed';
import { createAlgoliaDocsClient } from '@/lib/search/algolia-client';
import { createCnDocsSearchClient } from '@/lib/search/cn-search-client';
import { DocsSearchDialog } from './DocsSearchDialog';

vi.mock('@/lib/search/algolia-client', () => ({
  createAlgoliaDocsClient: vi.fn(() => ({
    deps: ['mock-algolia'],
    search: vi.fn(),
  })),
}));

vi.mock('@/lib/search/cn-search-client', () => ({
  createCnDocsSearchClient: vi.fn(() => ({
    deps: ['mock-meilisearch'],
    search: vi.fn(),
  })),
}));

vi.mock('@/lib/search/cn-search-page', async (original) => ({
  ...(await original<typeof import('@/lib/search/cn-search-page')>()),
  loadCnSearchCatalog: vi.fn().mockResolvedValue({}),
}));

const loadPages = async () => [
  {
    description: 'Start here',
    title: 'Quick Start',
    url: '/en/ai/get-started/quickstart',
  },
];

describe('DocsSearchDialog', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.stubEnv('VITE_ALGOLIA_APP_ID', '');
    vi.stubEnv('VITE_ALGOLIA_SEARCH_API_KEY', '');
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it('keeps Chinese recent-page details hidden before a query', async () => {
    window.localStorage.setItem(
      RECENTLY_VIEWED_STORAGE_KEY,
      JSON.stringify([
        {
          description: '最近文档摘要',
          title: '最近文档',
          url: '/zh-CN/ai/recent-page',
        },
      ]),
    );
    const rootRoute = createRootRoute({ component: () => <Outlet /> });
    const docsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: '/$locale/$tab/$slug',
      component: () => (
        <AppProviders>
          <DocsSearchDialog loadPages={loadPages} locale="zh-CN" />
        </AppProviders>
      ),
    });
    const router = createRouter({
      routeTree: rootRoute.addChildren([docsRoute]),
      history: createMemoryHistory({
        initialEntries: ['/zh-CN/introduction/about-agora'],
      }),
    });

    render(<RouterProvider router={router} />);
    fireEvent.click(await screen.findByRole('button', { name: '搜索文档' }));
    expect(await screen.findByText('最近文档')).toBeInTheDocument();
    expect(screen.queryByTestId('search-active-detail')).toBeNull();
  });

  it('uses the search API for CN and navigates to the matched section anchor', async () => {
    vi.mocked(createCnDocsSearchClient).mockReturnValue({
      deps: ['mock-meilisearch'],
      search: vi.fn().mockResolvedValue([
        {
          content: '<mark>manualSOS</mark>',
          id: 'manual-sos',
          objectType: 'docs',
          path: ['Conversational AI API', 'manualSOS'],
          platform: ['web'],
          product: 'conversational-ai',
          version: '2.9.0',
          snippet: '手动触发 <mark>SOS</mark>。',
          title: '<mark>manualSOS</mark>',
          type: 'page',
          url: '/zh-CN/api-reference/conversational-ai/web/conversationalaiapi#manualsos',
        },
      ]),
    });

    const rootRoute = createRootRoute({ component: () => <Outlet /> });
    const docsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: '/$locale/$tab/$slug',
      component: () => (
        <AppProviders>
          <DocsSearchDialog
            loadPages={vi.fn().mockRejectedValue(new Error('not needed'))}
            locale="zh-CN"
            mode="desktop"
          />
        </AppProviders>
      ),
    });
    const router = createRouter({
      routeTree: rootRoute.addChildren([docsRoute]),
      history: createMemoryHistory({
        initialEntries: ['/zh-CN/introduction/about-agora'],
      }),
    });
    const navigateSpy = vi.spyOn(router, 'navigate');

    render(<RouterProvider router={router} />);
    fireEvent.click(await screen.findByRole('button', { name: '搜索文档' }));
    fireEvent.input(
      await screen.findByPlaceholderText('搜索文档、API、指南...'),
      { target: { value: 'manualSOS' } },
    );

    expect(createCnDocsSearchClient).toHaveBeenCalled();
    const manualSosLabels = await screen.findAllByText('manualSOS');
    expect(manualSosLabels.length).toBeGreaterThan(0);
    expect(screen.queryByText('2.9.0')).not.toBeInTheDocument();
    expect(screen.getAllByText('对话式 AI 引擎').length).toBeGreaterThan(0);
    fireEvent.click(manualSosLabels[0]);
    await waitFor(() => {
      expect(navigateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          to: '/zh-CN/api-reference/conversational-ai/web/conversationalaiapi#manualsos',
        }),
      );
    });
  });

  it('does not silently load the Orama page index when the CN search API is unavailable', async () => {
    vi.mocked(createCnDocsSearchClient).mockReturnValue({
      deps: [],
      search: vi.fn().mockRejectedValue(new Error('503')),
    });
    const loadPagesSpy = vi.fn().mockResolvedValue(loadPages());
    const rootRoute = createRootRoute({ component: () => <Outlet /> });
    const docsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: '/$locale/$tab/$slug',
      component: () => (
        <AppProviders>
          <DocsSearchDialog
            loadPages={loadPagesSpy}
            locale="zh-CN"
            mode="desktop"
          />
        </AppProviders>
      ),
    });
    const router = createRouter({
      routeTree: rootRoute.addChildren([docsRoute]),
      history: createMemoryHistory({
        initialEntries: ['/zh-CN/introduction/about-agora'],
      }),
    });

    render(<RouterProvider router={router} />);
    fireEvent.click(await screen.findByRole('button', { name: '搜索文档' }));
    fireEvent.input(
      await screen.findByPlaceholderText('搜索文档、API、指南...'),
      { target: { value: 'manualSOS' } },
    );

    expect(
      (await screen.findAllByText('搜索索引不可用。')).length,
    ).toBeGreaterThan(0);
    expect(loadPagesSpy).not.toHaveBeenCalled();
  });

  it.each([0, 1])(
    'closes CN search and restores focus to trigger %s without clearing its query',
    async (triggerIndex) => {
      const router = renderCnSearch(vi.fn().mockResolvedValue([]), true);
      render(<RouterProvider router={router} />);
      const triggers = await screen.findAllByRole('button', {
        name: '搜索文档',
      });
      const trigger = triggers[triggerIndex];
      fireEvent.click(trigger);
      fireEvent.input(
        await screen.findByPlaceholderText('搜索文档、API、指南...'),
        { target: { value: 'RTMP' } },
      );
      fireEvent.click(screen.getByRole('button', { name: '关闭' }));
      await waitFor(() => expect(trigger).toHaveFocus());
      expect(screen.queryByRole('dialog')).toBeNull();
      fireEvent.click(trigger);
      expect(
        await screen.findByPlaceholderText('搜索文档、API、指南...'),
      ).toHaveValue('RTMP');
    },
  );

  it.each(['metaKey', 'ctrlKey'] as const)(
    'returns to the previously focused element after cancelling a %s shortcut search',
    async (modifier) => {
      const router = renderCnSearch(vi.fn().mockResolvedValue([]));
      render(
        <>
          <input aria-label="文档中的输入框" />
          <RouterProvider router={router} />
        </>,
      );
      await screen.findByRole('button', { name: '搜索文档' });
      const previous = screen.getByRole('textbox', { name: '文档中的输入框' });
      previous.focus();
      fireEvent.keyDown(document, { key: 'k', [modifier]: true });
      const input = await screen.findByPlaceholderText(
        '搜索文档、API、指南...',
      );
      fireEvent.keyDown(input, { key: 'Escape' });
      await waitFor(() => expect(previous).toHaveFocus());
    },
  );

  it.each(['result', 'full search'])(
    'does not restore the old trigger focus when navigating to %s',
    async (destination) => {
      const router = renderCnSearch(
        vi.fn().mockResolvedValue([
          {
            id: 'gateway',
            title: 'RTMP 网关',
            content: 'RTMP 网关',
            type: 'page',
            url: '/zh-CN/realtime-media/rtmp-gateway',
          },
        ]),
      );
      const navigate = vi.spyOn(router, 'navigate');
      render(<RouterProvider router={router} />);
      const trigger = await screen.findByRole('button', { name: '搜索文档' });
      fireEvent.click(trigger);
      const input = await screen.findByPlaceholderText(
        '搜索文档、API、指南...',
      );
      fireEvent.input(input, { target: { value: 'RTMP' } });
      const result = await screen.findByRole('option', { name: /RTMP 网关/ });
      const focus = vi.spyOn(trigger, 'focus');
      fireEvent.click(
        destination === 'result'
          ? result
          : screen.getByRole('button', { name: '查看全部搜索结果' }),
      );
      await waitFor(() => expect(navigate).toHaveBeenCalled());
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
      // Radix restores focus after the content unmounts.
      await act(() => new Promise((resolve) => setTimeout(resolve, 10)));
      expect(focus).not.toHaveBeenCalled();
    },
  );

  it('retains the complete-response family order when the decisive API match is outside the three-item preview', async () => {
    const familyOrder = ['api', 'docs', 'faq'];
    const router = renderCnSearch(
      vi.fn().mockResolvedValue([
        ...['helperA', 'helperB', 'helperC'].map((title) => ({
          id: title,
          title,
          content: title,
          type: 'page',
          url: `/api-reference/rtc/android/channel#${title}`,
          familyOrder,
        })),
        {
          id: 'guide',
          title: '加入频道',
          content: '加入频道',
          type: 'page',
          url: '/realtime-media/rtc/build/join',
          familyOrder,
        },
      ]),
    );
    render(<RouterProvider router={router} />);
    fireEvent.click(await screen.findByRole('button', { name: '搜索文档' }));
    fireEvent.input(
      await screen.findByPlaceholderText('搜索文档、API、指南...'),
      { target: { value: 'joinChannel' } },
    );
    await screen.findByRole('option', { name: /helperA/ });
    expect(
      screen.getAllByRole('option').map((item) => item.textContent),
    ).toEqual([
      expect.stringContaining('helperA'),
      expect.stringContaining('helperB'),
      expect.stringContaining('helperC'),
      expect.stringContaining('加入频道'),
    ]);
  });

  it('keeps CN search text and published platform choices when reopening', async () => {
    const router = renderCnSearch(vi.fn().mockResolvedValue([]));
    render(<RouterProvider router={router} />);
    fireEvent.click(await screen.findByRole('button', { name: '搜索文档' }));
    fireEvent.click(await screen.findByRole('combobox', { name: '全部平台' }));
    for (const name of [
      '控制台',
      '小程序',
      '服务端 C++',
      'C#',
      '服务端 Java',
      '智能硬件',
    ]) {
      expect(await screen.findByRole('option', { name })).toBeInTheDocument();
    }
    fireEvent.click(screen.getByRole('option', { name: '服务端 C++' }));
    const input = await screen.findByPlaceholderText('搜索文档、API、指南...');
    fireEvent.input(input, { target: { value: 'Token' } });
    fireEvent.keyDown(document, { key: 'Escape' });
    fireEvent.click(await screen.findByRole('button', { name: '搜索文档' }));
    expect(
      await screen.findByPlaceholderText('搜索文档、API、指南...'),
    ).toHaveValue('Token');
    expect(screen.getByRole('combobox', { name: /C\+\+/ })).toBeInTheDocument();
  });

  it.each([false, true])(
    'submits CN Enter to full search regardless of whether results have arrived (%s)',
    async (ready) => {
      const result = {
        id: 'join',
        title: 'joinChannel',
        content: 'joinChannel',
        type: 'page' as const,
        url: '/zh-CN/api-reference/rtc/android/channel#joinchannel-12',
      };
      const search = ready
        ? vi.fn().mockResolvedValue([result])
        : vi.fn().mockImplementation(() => new Promise(() => {}));
      const router = renderCnSearch(search);
      const navigate = vi.spyOn(router, 'navigate');
      render(<RouterProvider router={router} />);
      fireEvent.click(await screen.findByRole('button', { name: '搜索文档' }));
      const input = await screen.findByPlaceholderText(
        '搜索文档、API、指南...',
      );
      fireEvent.input(input, { target: { value: 'joinChannel' } });
      await waitFor(() => expect(search).toHaveBeenCalled());
      if (ready) await screen.findAllByText('joinChannel');
      fireEvent.keyDown(input, { key: 'Enter' });
      await waitFor(() =>
        expect(navigate).toHaveBeenCalledWith(
          expect.objectContaining({
            href: '/zh-CN/search?q=joinChannel',
          }),
        ),
      );
    },
  );

  it('opens an explicitly keyboard-selected CN result and preserves its overload anchor', async () => {
    const router = renderCnSearch(
      vi.fn().mockResolvedValue([
        {
          id: 'join',
          title: 'joinChannel [2/2]',
          content: 'joinChannel [2/2]',
          type: 'page',
          url: '/zh-CN/api-reference/rtc/android/channel#joinchannel-22',
        },
      ]),
    );
    const navigate = vi.spyOn(router, 'navigate');
    render(<RouterProvider router={router} />);
    fireEvent.click(await screen.findByRole('button', { name: '搜索文档' }));
    const input = await screen.findByPlaceholderText('搜索文档、API、指南...');
    fireEvent.input(input, { target: { value: 'joinChannel' } });
    await screen.findAllByText('joinChannel [2/2]');
    await waitFor(() =>
      expect(
        screen.getByRole('option', { name: /joinChannel/ }),
      ).not.toHaveAttribute('aria-disabled', 'true'),
    );
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    await waitFor(() =>
      expect(navigate).toHaveBeenCalledWith(
        expect.objectContaining({
          to: '/zh-CN/api-reference/rtc/android/channel#joinchannel-22',
        }),
      ),
    );
  });

  it('keeps an IME confirmation Enter from navigating', async () => {
    const router = renderCnSearch(
      vi.fn().mockResolvedValue([
        {
          id: 'certificate',
          title: '管理鉴权方式',
          content: '主要证书',
          type: 'page',
          url: '/zh-CN/introduction/user-guides/manage-authentication',
        },
      ]),
    );
    const navigate = vi.spyOn(router, 'navigate');
    render(<RouterProvider router={router} />);
    fireEvent.click(await screen.findByRole('button', { name: '搜索文档' }));
    const input = await screen.findByPlaceholderText('搜索文档、API、指南...');
    fireEvent.compositionStart(input);
    fireEvent.input(input, { target: { value: '主要证书' } });
    fireEvent.keyDown(input, { key: 'ArrowDown', isComposing: true });
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true });
    expect(navigate).not.toHaveBeenCalled();
    fireEvent.compositionEnd(input, { data: '主要证书' });
    await waitFor(() =>
      expect(
        screen.getByRole('option', { name: /管理鉴权方式/ }),
      ).not.toHaveAttribute('aria-disabled', 'true'),
    );
    fireEvent.keyDown(input, { key: 'Enter' });
    await waitFor(() =>
      expect(navigate).toHaveBeenCalledWith(
        expect.objectContaining({
          href: '/zh-CN/search?q=%E4%B8%BB%E8%A6%81%E8%AF%81%E4%B9%A6',
        }),
      ),
    );
  });

  it.each(['docs', 'api', 'faq'] as const)(
    'groups CN matches and opens all %s results with the selected filters',
    async (family) => {
      const router = renderCnSearch(
        vi.fn().mockResolvedValue([
          {
            id: 'api',
            title: 'API match',
            content: 'API match',
            type: 'page',
            url: '/api-reference/rtc/android/method#api',
            snippet: 'API summary',
            familyTotalHits: 39,
          },
          {
            id: 'guide',
            title: 'Guide match',
            content: 'Guide match',
            type: 'page',
            url: '/realtime-media/rtc/guide/android#guide',
            snippet: 'Guide summary',
            familyTotalHits: 7,
          },
          {
            id: 'faq',
            title: 'FAQ match',
            content: 'FAQ match',
            type: 'page',
            url: '/reference/faq/integration/set_log_file#native',
            snippet: 'FAQ summary',
            familyTotalHits: 1,
          },
        ]),
      );
      const navigate = vi.spyOn(router, 'navigate');
      render(<RouterProvider router={router} />);
      fireEvent.click(await screen.findByRole('button', { name: '搜索文档' }));
      fireEvent.input(
        await screen.findByPlaceholderText('搜索文档、API、指南...'),
        { target: { value: 'getNtpWallTimeInMs' } },
      );
      await screen.findByRole('option', { name: /Guide match/ });
      fireEvent.click(screen.getByRole('combobox', { name: '全部产品' }));
      fireEvent.click(await screen.findByRole('option', { name: '实时互动' }));
      await screen.findByRole('combobox', { name: /实时互动/ });
      await waitFor(() =>
        expect(
          screen.queryByPlaceholderText('筛选产品…'),
        ).not.toBeInTheDocument(),
      );
      fireEvent.click(screen.getByRole('combobox', { name: '全部平台' }));
      fireEvent.click(await screen.findByRole('option', { name: 'Android' }));
      await screen.findByRole('combobox', { name: /Android/ });
      const docs = await screen.findByRole('group', { name: '技术文档' });
      expect(
        screen.queryByRole('button', { name: '完整搜索' }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Close' }),
      ).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: '关闭' })).toBeInTheDocument();
      const api = screen.getByRole('group', { name: 'API Reference' });
      const faq = screen.getByRole('group', { name: 'FAQ' });
      expect(within(docs).getByText('共 7 条结果')).toBeInTheDocument();
      expect(within(api).getByText('共 39 条结果')).toBeInTheDocument();
      expect(within(docs).getByText('Guide summary')).toBeInTheDocument();
      expect(within(api).getByText('API summary')).toBeInTheDocument();
      expect(within(faq).getByText('FAQ summary')).toBeInTheDocument();
      expect(screen.getAllByRole('option').map((e) => e.textContent)).toEqual([
        expect.stringContaining('Guide match'),
        expect.stringContaining('API match'),
        expect.stringContaining('FAQ match'),
      ]);
      expect(screen.queryByTestId('search-active-detail')).toBeInTheDocument();
      const action = screen.getByRole('button', {
        name:
          family === 'docs'
            ? '查看全部技术文档'
            : family === 'api'
              ? '查看全部API Reference'
              : '查看全部FAQ',
      });
      expect(fireEvent.keyDown(action, { key: 'Enter' })).toBe(true);
      expect(fireEvent.keyDown(action, { key: ' ' })).toBe(true);
      fireEvent.click(action);
      await waitFor(() =>
        expect(navigate).toHaveBeenCalledWith(
          expect.objectContaining({
            href: `/zh-CN/search?q=getNtpWallTimeInMs&product=rtc&platform=android&type=${family}`,
          }),
        ),
      );
    },
  );

  it('updates the CN floating preview from mouse and keyboard selection and removes it on close', async () => {
    const router = renderCnSearch(
      vi.fn().mockResolvedValue([
        {
          id: 'first',
          title: '返回值 A',
          content: '返回值 A',
          type: 'page',
          url: '/api-reference/rtc/flutter/screen#first',
          snippet: '返回 <mark>ScreenCaptureSourceInfo</mark> 数组。',
        },
        {
          id: 'second',
          title: '返回值 B',
          content: '返回值 B',
          type: 'page',
          url: '/api-reference/rtc/electron/screen#second',
          snippet: 'Electron 屏幕来源说明。',
        },
      ]),
    );
    render(<RouterProvider router={router} />);
    fireEvent.click(await screen.findByRole('button', { name: '搜索文档' }));
    const input = await screen.findByPlaceholderText('搜索文档、API、指南...');
    fireEvent.input(input, { target: { value: 'ScreenCaptureSourceInfo' } });
    await waitFor(() =>
      expect(screen.getByTestId('search-active-detail')).toHaveTextContent(
        '返回 ScreenCaptureSourceInfo 数组。',
      ),
    );
    fireEvent.pointerMove(screen.getByRole('option', { name: /返回值 B/ }), {
      pointerType: 'mouse',
    });
    await waitFor(() =>
      expect(screen.getByTestId('search-active-detail')).toHaveTextContent(
        'Electron 屏幕来源说明。',
      ),
    );
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    await waitFor(() =>
      expect(screen.getByTestId('search-active-detail')).toHaveTextContent(
        '返回 ScreenCaptureSourceInfo 数组。',
      ),
    );
    expect(
      screen.getByTestId('search-active-detail').querySelector('mark'),
    ).toHaveClass('search-page-mark');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(
      screen.queryByTestId('search-active-detail'),
    ).not.toBeInTheDocument();
  });

  it('keeps the empty document family visible when only API results match', async () => {
    const router = renderCnSearch(
      vi.fn().mockResolvedValue([
        {
          id: 'api-only',
          title: 'manualSOS',
          content: 'manualSOS',
          type: 'page',
          url: '/api-reference/rtc/android/method#manualsos',
          familyTotalHits: 9,
        },
      ]),
    );
    render(<RouterProvider router={router} />);
    fireEvent.click(await screen.findByRole('button', { name: '搜索文档' }));
    fireEvent.input(
      await screen.findByPlaceholderText('搜索文档、API、指南...'),
      { target: { value: 'manualSOS' } },
    );
    const docs = await screen.findByRole('group', { name: '技术文档' });
    expect(within(docs).getByText('共 0 条结果')).toBeInTheDocument();
    expect(within(docs).getByText('暂无相关技术文档')).toBeInTheDocument();
    expect(
      within(screen.getByRole('group', { name: 'API Reference' })).getAllByRole(
        'option',
      ),
    ).toHaveLength(1);
    expect(document.querySelector('[cmdk-empty]')).toBeNull();
  });

  it('starts an unfiltered search on another document and restores the source search on return', async () => {
    const router = renderCnSearch(vi.fn().mockResolvedValue([]));
    render(<RouterProvider router={router} />);
    fireEvent.click(await screen.findByRole('button', { name: '搜索文档' }));
    const input = await screen.findByPlaceholderText('搜索文档、API、指南...');
    fireEvent.input(input, { target: { value: 'joinChannel' } });
    fireEvent.click(screen.getByRole('combobox', { name: '全部平台' }));
    fireEvent.click(await screen.findByRole('option', { name: 'Android' }));
    fireEvent.keyDown(document, { key: 'Escape' });
    await act(() => router.navigate({ href: '/zh-CN/realtime-media/rtm' }));
    expect(
      screen.queryByRole('link', { name: '完整搜索' }),
    ).not.toBeInTheDocument();
    fireEvent.click(await screen.findByRole('button', { name: '搜索文档' }));
    expect(
      await screen.findByPlaceholderText('搜索文档、API、指南...'),
    ).toHaveValue('');
    expect(
      screen.getByRole('combobox', { name: '全部平台' }),
    ).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    await act(() => router.navigate({ href: '/zh-CN/realtime-media/flutter' }));
    fireEvent.click(await screen.findByRole('button', { name: '搜索文档' }));
    expect(
      await screen.findByPlaceholderText('搜索文档、API、指南...'),
    ).toHaveValue('joinChannel');
    expect(
      screen.getByRole('combobox', { name: /Android/ }),
    ).toBeInTheDocument();
  });

  it('restores the document search after the full search route unmounts the dialog', async () => {
    const router = renderCnSearch(vi.fn().mockResolvedValue([]));
    render(<RouterProvider router={router} />);
    fireEvent.click(await screen.findByRole('button', { name: '搜索文档' }));
    const input = await screen.findByPlaceholderText('搜索文档、API、指南...');
    fireEvent.input(input, { target: { value: 'Token' } });
    fireEvent.click(screen.getByRole('combobox', { name: '全部平台' }));
    fireEvent.click(await screen.findByRole('option', { name: 'Android' }));
    fireEvent.click(screen.getByRole('button', { name: '查看全部搜索结果' }));
    await screen.findByText('Full search route');
    await act(() => {
      router.history.back();
    });
    fireEvent.click(await screen.findByRole('button', { name: '搜索文档' }));
    expect(
      await screen.findByPlaceholderText('搜索文档、API、指南...'),
    ).toHaveValue('Token');
    expect(
      screen.getByRole('combobox', { name: /Android/ }),
    ).toBeInTheDocument();
  });

  it('shares the current document search between mobile and desktop triggers', async () => {
    const router = renderCnSearch(vi.fn().mockResolvedValue([]), true);
    render(<RouterProvider router={router} />);
    const triggers = await screen.findAllByRole('button', { name: '搜索文档' });
    fireEvent.click(triggers[1]);
    fireEvent.input(
      await screen.findByPlaceholderText('搜索文档、API、指南...'),
      { target: { value: 'Token' } },
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    fireEvent.click(triggers[0]);
    expect(
      await screen.findByPlaceholderText('搜索文档、API、指南...'),
    ).toHaveValue('Token');
  });

  it('filters CN quick search by HarmonyOS and carries the query and scope into full search', async () => {
    vi.mocked(createCnDocsSearchClient).mockReturnValue({
      deps: [],
      search: vi.fn().mockResolvedValue([]),
    });
    const rootRoute = createRootRoute({ component: () => <Outlet /> });
    const docsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: '/$locale/$tab/$slug',
      component: () => (
        <AppProviders>
          <DocsSearchDialog
            loadPages={loadPages}
            locale="zh-CN"
            mode="desktop"
            productScopes={[
              {
                id: 'rtc',
                label: '实时互动',
                scope: { field: 'product', value: 'rtc' },
              },
            ]}
          />
        </AppProviders>
      ),
    });
    const router = createRouter({
      routeTree: rootRoute.addChildren([docsRoute]),
      history: createMemoryHistory({
        initialEntries: ['/zh-CN/introduction/about-agora'],
      }),
    });
    const navigate = vi.spyOn(router, 'navigate');
    render(<RouterProvider router={router} />);
    fireEvent.click(await screen.findByRole('button', { name: '搜索文档' }));
    fireEvent.click(await screen.findByRole('combobox', { name: '全部产品' }));
    fireEvent.click(await screen.findByRole('option', { name: '实时互动' }));
    fireEvent.click(await screen.findByRole('combobox', { name: '全部平台' }));
    fireEvent.click(await screen.findByRole('option', { name: 'HarmonyOS' }));
    expect(createCnDocsSearchClient).toHaveBeenCalledWith(
      expect.objectContaining({ platform: 'harmonyos' }),
    );
    fireEvent.input(
      await screen.findByPlaceholderText('搜索文档、API、指南...'),
      { target: { value: 'Token' } },
    );
    expect(
      screen.queryByRole('radio', { name: 'AI 问答' }),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '查看全部搜索结果' }));
    await waitFor(() =>
      expect(navigate).toHaveBeenCalledWith(
        expect.objectContaining({
          href: '/zh-CN/search?q=Token&product=rtc&platform=harmonyos',
        }),
      ),
    );
  });
});

function renderCnSearch(
  search: ReturnType<typeof createCnDocsSearchClient>['search'],
  dual = false,
) {
  vi.mocked(createCnDocsSearchClient).mockReturnValue({ deps: [], search });
  const rootRoute = createRootRoute({ component: () => <Outlet /> });
  const docsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/$locale/$tab/$slug',
    component: () => (
      <AppProviders>
        <DocsSearchDialog loadPages={loadPages} locale="zh-CN" />
        {dual ? (
          <DocsSearchDialog
            loadPages={loadPages}
            locale="zh-CN"
            mode="mobile"
          />
        ) : null}
      </AppProviders>
    ),
  });
  const searchRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/$locale/search',
    component: () => <div>Full search route</div>,
  });
  return createRouter({
    routeTree: rootRoute.addChildren([docsRoute, searchRoute]),
    history: createMemoryHistory({
      initialEntries: ['/zh-CN/realtime-media/flutter'],
    }),
  });
}
