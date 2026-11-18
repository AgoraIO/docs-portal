import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import type { ReactNode } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PlatformPanel } from '@/components/mdx/PlatformTabsGroup';
import { AppProviders } from '@/components/providers/AppProviders';
import {
  appendApiReferenceTrail,
  readApiReferenceTrail,
} from '@/lib/api-reference-context';
import { DOCS_MAIN_SCROLL_RESTORATION_ID } from '@/lib/docs-scroll-restoration';
import { i18n } from '@/lib/i18n/i18n';
import { PLATFORM_DATASET_KEY } from '@/lib/platforms/preference';
import { PLATFORM_PREFERENCE_STORAGE_KEY } from '@/lib/platforms/registry';
import { DocsContent, DocsTableOfContents } from './DocsContent';
import { DocsMainColumn } from './DocsMainColumn';
import { DocsTocRail } from './DocsTocRail';
import { DocsCopyMenu } from './docs-copy-menu';

const clipboardWriteText = vi.fn();
const fetchMock = vi.fn();
const { captureDocsPageFeedbackMock } = vi.hoisted(() => ({
  captureDocsPageFeedbackMock: vi.fn(),
}));

vi.mock('@/lib/analytics/posthog', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/analytics/posthog')>()),
  captureDocsPageFeedback: captureDocsPageFeedbackMock,
  initializePostHog: vi.fn(),
}));

vi.mock('./DocsContentBody', () => ({
  DocsContentBody: ({ contentPath }: { contentPath: string }) => {
    if (contentPath === 'zh-CN/api-reference/source-with-api-links.mdx') {
      return (
        <div>
          <h3 id="options">Options</h3>
          <a href="/zh-CN/api-reference/class-options">Open options</a>
          <a
            href="/zh-CN/api-reference/enum-mode"
            target="_blank"
            rel="noopener"
          >
            Open mode in new tab
          </a>
          <a href="/zh-CN/api-reference/class-options" download>
            Download options
          </a>
          <a href="https://other.test/reference">External reference</a>
        </div>
      );
    }
    const articleLink =
      contentPath === 'en/introduction/source-with-docs-link.mdx'
        ? {
            href: '/en/api-reference/recipes',
            label: 'Open recipes from article',
          }
        : contentPath === 'en/introduction/source-with-openapi-link.mdx'
          ? {
              href: '/en/api-reference/rtc',
              label: 'Open RTC API from article',
            }
          : undefined;

    return (
      <div data-testid="docs-content-body">
        {contentPath}
        {articleLink ? (
          <a href={articleLink.href}>{articleLink.label}</a>
        ) : null}
      </div>
    );
  },
}));

vi.mock('@/components/mdx/PlatformTabsGroup', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/components/mdx/PlatformTabsGroup')>();

  return {
    ...actual,
    PlatformHeaderTabs: ({
      defaultPlatform,
      initialPlatform,
      platforms,
    }: {
      defaultPlatform?: string;
      initialPlatform?: string;
      platforms?: string;
    }) => (
      <div
        data-default-platform={defaultPlatform}
        data-initial-platform={initialPlatform}
        data-testid="platform-header-tabs"
      >
        {platforms}
      </div>
    ),
  };
});

vi.mock('../openapi/FumadocsOpenApiContent', () => ({
  FumadocsOpenApiContent: ({
    locale,
    pageProps,
  }: {
    locale?: string;
    pageProps: { operations?: { path: string }[] };
  }) => (
    <div data-locale={locale} data-testid="fumadocs-openapi-content">
      {pageProps.operations?.[0]?.path}
    </div>
  ),
}));

function renderWithRouter(
  children: ReactNode,
  initialEntry = `${window.location.pathname}${window.location.search}${window.location.hash}`,
) {
  window.history.replaceState(null, '', initialEntry);

  const rootRoute = createRootRoute({
    component: () => <Outlet />,
  });
  const component = () => <AppProviders>{children}</AppProviders>;
  const docsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/$locale/$tab/$slug',
    component,
  });
  const docsIndexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/$locale/$tab',
    component,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([docsRoute, docsIndexRoute]),
    history: createMemoryHistory({
      initialEntries: [initialEntry],
    }),
  });

  return render(<RouterProvider router={router} />);
}

describe('DocsContent', () => {
  it('restores the return link from a shared API URL in a fresh session', async () => {
    const href = appendApiReferenceTrail(
      '/zh-CN/api-reference/enum-multipathtype',
      new URL(
        '/zh-CN/api-reference/class-channelmediaoptions#prefermultipathtype',
        window.location.origin,
      ),
      'ChannelMediaOptions',
    );
    renderWithRouter(
      <DocsContent locale="zh-CN" title="MultipathType" toc={[]} />,
      href,
    );
    expect(
      await screen.findByRole('link', { name: '返回 ChannelMediaOptions' }),
    ).toHaveAttribute(
      'href',
      '/zh-CN/api-reference/class-channelmediaoptions#prefermultipathtype',
    );
  });

  it('makes native API link destinations shareable before clicking or copying', async () => {
    renderWithRouter(
      <DocsContent
        contentPath="zh-CN/api-reference/source-with-api-links.mdx"
        locale="zh-CN"
        title="Channel"
        toc={[]}
      />,
      '/zh-CN/api-reference/channel',
    );
    const options = await screen.findByRole('link', { name: 'Open options' });
    const mode = screen.getByRole('link', { name: 'Open mode in new tab' });
    for (const link of [options, mode]) {
      await waitFor(() => {
        expect(
          readApiReferenceTrail(
            new URL(link.getAttribute('href') ?? '', window.location.origin),
          ),
        ).toEqual([
          { href: '/zh-CN/api-reference/channel#options', title: 'Channel' },
        ]);
      });
    }
    expect(fireEvent.click(options, { ctrlKey: true })).toBe(true);
    expect(fireEvent.click(options, { metaKey: true })).toBe(true);
    expect(
      fireEvent(
        options,
        new MouseEvent('auxclick', {
          button: 1,
          bubbles: true,
          cancelable: true,
        }),
      ),
    ).toBe(true);
    expect(mode).toHaveAttribute('target', '_blank');
    expect(
      screen.getByRole('link', { name: 'Download options' }),
    ).toHaveAttribute('href', '/zh-CN/api-reference/class-options');
    expect(
      screen.getByRole('link', { name: 'External reference' }),
    ).toHaveAttribute('href', 'https://other.test/reference');

    // Lazy MDX and platform content can insert links after the initial render.
    const marker = document.createElement('a');
    marker.id = 'marker';
    options.parentElement?.prepend(marker);
    const later = document.createElement('a');
    later.href = '/zh-CN/api-reference/enum-later';
    later.textContent = 'Later API link';
    options.parentElement?.append(later);
    await waitFor(() => {
      expect(readApiReferenceTrail(new URL(later.href))).toEqual([
        { href: '/zh-CN/api-reference/channel#options', title: 'Channel' },
      ]);
    });
    expect(marker).not.toHaveAttribute('href');
  });

  Object.defineProperty(window.navigator, 'clipboard', {
    configurable: true,
    value: {
      writeText: clipboardWriteText,
    },
  });

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
    window.localStorage.removeItem(PLATFORM_PREFERENCE_STORAGE_KEY);
    delete document.documentElement.dataset[PLATFORM_DATASET_KEY];
    window.sessionStorage.clear();
    window.history.replaceState(null, '', '/en/introduction/about-agora');
  });

  afterEach(() => {
    window.localStorage.removeItem(PLATFORM_PREFERENCE_STORAGE_KEY);
    delete document.documentElement.dataset[PLATFORM_DATASET_KEY];
    vi.unstubAllGlobals();
  });

  it('gives the Chinese home page the full content area without article tools', async () => {
    const { container } = renderWithRouter(
      <DocsContent
        contentPath="zh-CN/introduction/index.mdx"
        locale="zh-CN"
        markdownUrl="/zh-CN/introduction.md"
        title="声网文档中心"
        toc={[{ title: '集成语音智能体', url: '#ai', depth: 2 }]}
      />,
      '/zh-CN/introduction',
    );

    expect(await screen.findByTestId('docs-content-body')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '声网文档中心' })).toHaveClass(
      'sr-only',
    );
    expect(container.querySelector('article')).toHaveClass('max-w-none');
    expect(container.querySelector('article > header')).toBeNull();
    expect(screen.queryByRole('button', { name: '复制页面' })).toBeNull();
    expect(screen.queryByTestId('docs-last-updated')).toBeNull();
    expect(screen.queryByRole('complementary')).toBeNull();
  });

  it('renders the copy page action for zh-CN public markdown content', async () => {
    renderWithRouter(
      <DocsContent
        contentPath="zh-CN/introduction/mcp-integrate.mdx"
        locale="zh-CN"
        markdownUrl="/zh-CN/introduction/mcp-integrate.md"
        slug="introduction/mcp-integrate"
        title="使用 MCP 集成"
        toc={[]}
      />,
      '/zh-CN/introduction/mcp-integrate',
    );

    expect(
      await screen.findByRole('heading', { name: '使用 MCP 集成' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '复制页面' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '复制页面更多操作' }),
    ).toBeInTheDocument();
  });

  it.each(['zh-CN', 'en'] as const)(
    'identifies the %s article language for scoped typography',
    async (locale) => {
      renderWithRouter(
        <DocsContent
          contentPath={`${locale}/introduction/about-agora.md`}
          locale={locale}
          slug="about-agora"
          title="About Agora"
          toc={[]}
        />,
      );

      expect(await screen.findByRole('article')).toHaveAttribute(
        'lang',
        locale,
      );
    },
  );

  it('uses a compact header-to-body gap on non-platform-tabs pages', async () => {
    renderWithRouter(
      <DocsContent
        contentPath="en/introduction/about-agora.md"
        description="Learn the platform basics."
        slug="about-agora"
        title="About Agora"
        toc={[]}
      />,
    );

    const article = await screen.findByRole('article');
    expect(article).toHaveClass('gap-4');
    expect(article).not.toHaveClass('gap-9');

    const header = article.querySelector('header');
    expect(header).toHaveClass('pb-4');
    expect(header).not.toHaveClass('pb-7');
  });

  it('renders title platform badges without changing the heading name', async () => {
    renderWithRouter(
      <DocsContent
        contentPath="zh-CN/realtime-media/rtc/build/extensions/web/overview.mdx"
        locale="zh-CN"
        slug="overview"
        title="插件概览"
        titlePlatforms={['web']}
        toc={[]}
      />,
    );

    expect(
      await screen.findByRole('heading', { name: '插件概览' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('适用平台')).toHaveTextContent('Web');
  });

  it('uses the saved preference instead of the previous page fallback dataset', async () => {
    window.localStorage.setItem(PLATFORM_PREFERENCE_STORAGE_KEY, 'flutter');
    document.documentElement.dataset[PLATFORM_DATASET_KEY] = 'android';

    renderWithRouter(
      <DocsContent
        body={{
          contentPath:
            'zh-CN/realtime-media/rtc/build/audio/audio-stream-filter.mdx',
          kind: 'mdx',
          platformTabs: {
            canonicalPlatform: 'web',
            defaultPlatform: 'flutter',
            platforms: '["android","flutter"]',
          },
        }}
        contentPath="zh-CN/realtime-media/rtc/build/audio/audio-stream-filter.mdx"
        locale="zh-CN"
        title="音强选流"
        titlePlatforms={['flutter']}
        toc={[]}
      />,
    );

    expect(await screen.findByLabelText('适用平台')).toHaveTextContent(
      'Flutter',
    );
  });

  it('uses the route-selected platform from the shared page context', async () => {
    renderWithRouter(
      <DocsContent
        body={{
          contentPath:
            'zh-CN/realtime-media/rtc/build/video/custom-video-rendering.mdx',
          kind: 'mdx',
          platformTabs: {
            canonicalPlatform: 'web',
            defaultPlatform: 'android',
            initialPlatform: 'windows',
            platforms: '["android","windows"]',
          },
        }}
        contentPath="zh-CN/realtime-media/rtc/build/video/custom-video-rendering.mdx"
        locale="zh-CN"
        title="自定义视频渲染"
        titlePlatforms={['android']}
        toc={[]}
      />,
    );

    expect(await screen.findByLabelText('适用平台')).toHaveTextContent(
      'Windows',
    );
  });

  it('updates version entries when a language tab changes', async () => {
    renderWithRouter(
      <AppProviders>
        <article>
          <div role="tabpanel" data-state="active" data-testid="cpp-panel">
            <h2 id="cpp-version" data-accordion-value="cpp-version">
              C++ version
            </h2>
          </div>
          <div role="tabpanel" data-state="inactive" data-testid="cs-panel">
            <h2 id="cs-version" data-accordion-value="cs-version">
              C# version
            </h2>
          </div>
          <DocsTableOfContents toc={[]} />
        </article>
      </AppProviders>,
    );
    expect(
      await screen.findByRole('link', { name: 'C++ version' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'C# version' }),
    ).not.toBeInTheDocument();
    screen.getByTestId('cpp-panel').setAttribute('data-state', 'inactive');
    screen.getByTestId('cs-panel').setAttribute('data-state', 'active');
    expect(
      await screen.findByRole('link', { name: 'C# version' }),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.queryByRole('link', { name: 'C++ version' }),
      ).not.toBeInTheDocument(),
    );
  });

  it('hides the dynamic return path when an API hierarchy breadcrumb is present', async () => {
    window.sessionStorage.setItem(
      'docs-portal:article-return:v1',
      JSON.stringify({
        createdAt: Date.now(),
        source: {
          href: '/zh-CN/api-reference/api',
          title: 'API 参考',
        },
        targetPage: '/zh-CN/api-reference/cloud-recording',
      }),
    );

    renderWithRouter(
      <DocsContent
        breadcrumb={[
          {
            title: 'API 参考',
            url: '/zh-CN/api-reference/api',
          },
          {
            title: '云端录制',
          },
          {
            title: 'RESTful API',
          },
        ]}
        contentPath="zh-CN/api-reference/api-ref/cloud-recording/index.mdx"
        locale="zh-CN"
        slug="cloud-recording"
        title="云端录制概览"
        toc={[]}
      />,
      '/zh-CN/api-reference/cloud-recording',
    );

    expect(await screen.findByLabelText('Breadcrumb')).toHaveTextContent(
      'API 参考/云端录制/RESTful API',
    );
    expect(
      screen.queryByRole('link', { name: '返回 API 参考' }),
    ).not.toBeInTheDocument();
  });

  it('keeps a guide return path when an API hierarchy breadcrumb is present', async () => {
    window.sessionStorage.setItem(
      'docs-portal:article-return:v1',
      JSON.stringify({
        createdAt: Date.now(),
        source: {
          href: '/zh-CN/realtime-media/cloud-recording/overview',
          title: '云端录制指南',
        },
        targetPage: '/zh-CN/api-reference/cloud-recording',
      }),
    );

    renderWithRouter(
      <DocsContent
        breadcrumb={[
          {
            title: 'API 参考',
            url: '/zh-CN/api-reference/api',
          },
          {
            title: '云端录制',
          },
          {
            title: 'RESTful API',
          },
        ]}
        contentPath="zh-CN/api-reference/api-ref/cloud-recording/index.mdx"
        locale="zh-CN"
        slug="cloud-recording"
        title="云端录制概览"
        toc={[]}
      />,
      '/zh-CN/api-reference/cloud-recording',
    );

    expect(
      await screen.findByRole('link', { name: /返回\s*云端录制指南/ }),
    ).toHaveAttribute('href', '/zh-CN/realtime-media/cloud-recording/overview');
  });

  it('uses the route locale for copy menu labels during server render', async () => {
    await i18n.changeLanguage('en');

    const html = renderToString(
      <AppProviders>
        <DocsCopyMenu
          locale="zh-CN"
          markdownUrl="/zh-CN/ai.md"
          slug="ai"
          title="智能体"
        />
      </AppProviders>,
    );

    expect(html).toContain('复制页面');
    expect(html).toContain('复制页面更多操作');
    expect(html).not.toContain('Copy Page');
  });

  it('renders zh-CN copy page menu actions with Chinese docs targets', async () => {
    renderWithRouter(
      <DocsCopyMenu
        locale="zh-CN"
        markdownUrl="/zh-CN/introduction/mcp-integrate.md"
        slug="introduction/mcp-integrate"
        title="使用 MCP 集成"
      />,
      '/zh-CN/introduction/mcp-integrate',
    );

    fireEvent.pointerDown(
      await screen.findByRole('button', { name: '复制页面更多操作' }),
      { button: 0 },
    );

    expect(await screen.findByText('AI 工具')).toBeInTheDocument();
    expect(screen.getByText('MCP')).toBeInTheDocument();
    expect(screen.getByText('其他')).toBeInTheDocument();
    for (const [name, href] of [
      ['打开 DeepSeek', 'https://chat.deepseek.com/'],
      ['打开豆包', 'https://www.doubao.com/chat/'],
      ['打开千问', 'https://www.qianwen.com/'],
      ['打开 Kimi', 'https://www.kimi.com/'],
    ]) {
      expect(screen.getByRole('menuitem', { name })).toHaveAttribute(
        'href',
        href,
      );
    }
    expect(screen.getByRole('menu')).not.toHaveTextContent(
      /ChatGPT|Claude|Codex|Cursor|Copilot/i,
    );
    expect(screen.getByRole('menu').innerHTML).not.toMatch(
      /chatgpt\.com|claude\.ai/,
    );
    expect(
      screen.queryByRole('menuitem', { name: '复制 MCP 命令' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', { name: '连接到 TRAE' }),
    ).toHaveAttribute('href', '/zh-CN/introduction/mcp-integrate');
    expect(
      screen.getByRole('menuitem', { name: '连接到 Kimi Code' }),
    ).toHaveAttribute('href', '/zh-CN/introduction/mcp-integrate');
    expect(
      screen.getByRole('menuitem', { name: '查看 Markdown' }),
    ).toHaveAttribute('href', '/zh-CN/introduction/mcp-integrate.md');
  });

  it('copies zh-CN MCP config without an unsupported CLI command', async () => {
    clipboardWriteText.mockReset();
    clipboardWriteText.mockResolvedValue(undefined);

    renderWithRouter(
      <DocsCopyMenu
        locale="zh-CN"
        markdownUrl="/zh-CN/introduction/mcp-integrate.md"
        slug="introduction/mcp-integrate"
        title="使用 MCP 集成"
      />,
      '/zh-CN/introduction/mcp-integrate',
    );

    fireEvent.pointerDown(
      await screen.findByRole('button', { name: '复制页面更多操作' }),
      { button: 0 },
    );

    fireEvent.click(
      await screen.findByRole('menuitem', { name: '复制 MCP 配置' }),
    );
    await waitFor(() => {
      expect(clipboardWriteText).toHaveBeenCalledWith(`{
  "mcpServers": {
    "shengwang-docs": {
      "url": "https://doc-mcp.shengwang.cn/mcp"
    }
  }
}`);
    });
  });

  it('copies the full Chinese page for domestic AI assistants and keeps their links available', async () => {
    const markdown = '# 声网 MCP\n\n使用声网官方文档配置 AI 编程助手。';
    fetchMock.mockResolvedValueOnce({
      ok: true,
      text: vi.fn().mockResolvedValue(markdown),
    });
    clipboardWriteText.mockReset();
    clipboardWriteText.mockResolvedValue(undefined);
    renderWithRouter(
      <DocsCopyMenu
        locale="zh-CN"
        markdownUrl="/zh-CN/introduction/mcp-integrate.md"
        slug="introduction/mcp-integrate"
        title="声网 MCP"
      />,
      '/zh-CN/introduction/mcp-integrate',
    );
    fireEvent.pointerDown(
      await screen.findByRole('button', { name: '复制页面更多操作' }),
      { button: 0 },
    );
    fireEvent.click(
      await screen.findByRole('menuitem', { name: '复制 AI 提问内容' }),
    );
    expect(
      await screen.findByRole('menuitem', { name: '已复制提问内容' }),
    ).toBeInTheDocument();
    expect(clipboardWriteText).toHaveBeenCalledWith(
      expect.stringContaining(markdown),
    );
    expect(clipboardWriteText).toHaveBeenCalledWith(
      expect.stringContaining('/zh-CN/introduction/mcp-integrate.md'),
    );
    expect(
      screen.getByRole('menuitem', { name: '打开豆包' }),
    ).toBeInTheDocument();
  });

  it.each([
    { ok: false },
    { ok: true, headers: new Headers({ 'content-type': 'text/html' }) },
  ])(
    'shows a retry message when the Chinese AI prompt cannot be copied (%j)',
    async (response) => {
      fetchMock.mockResolvedValueOnce(response);
      clipboardWriteText.mockReset();
      renderWithRouter(
        <DocsCopyMenu
          locale="zh-CN"
          markdownUrl="/zh-CN/introduction/mcp-integrate.md"
          slug="introduction/mcp-integrate"
          title="声网 MCP"
        />,
        '/zh-CN/introduction/mcp-integrate',
      );
      fireEvent.pointerDown(
        await screen.findByRole('button', { name: '复制页面更多操作' }),
        { button: 0 },
      );
      fireEvent.click(
        await screen.findByRole('menuitem', { name: '复制 AI 提问内容' }),
      );
      expect(await screen.findByRole('alert')).toHaveTextContent('复制失败');
      expect(clipboardWriteText).not.toHaveBeenCalled();
      expect(
        screen.getByRole('menuitem', { name: '查看 Markdown' }),
      ).toBeInTheDocument();
    },
  );
});

describe('DocsTableOfContents', () => {
  it('keeps the depth limit after deriving rendered and newly added headings', async () => {
    const fixture = (extra: boolean) => (
      <AppProviders>
        <article>
          <h3 id="member">Member</h3>
          <h4 id="detail">Declared In</h4>
          {extra ? <h4 id="new-detail">New detail</h4> : null}
        </article>
        <DocsTableOfContents
          toc={[{ depth: 3, title: 'Member', url: '#member' }]}
          tocMaxDepth={3}
        />
      </AppProviders>
    );
    const { rerender } = render(fixture(false));
    await waitFor(() =>
      expect(screen.getByRole('link', { name: 'Member' })).toBeInTheDocument(),
    );
    rerender(fixture(true));
    await waitFor(() => {
      expect(
        screen.queryByRole('link', { name: 'Declared In' }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('link', { name: 'New detail' }),
      ).not.toBeInTheDocument();
    });
    expect(document.getElementById('detail')).toBeInTheDocument();
    expect(document.getElementById('new-detail')).toBeInTheDocument();
  });

  it.each([
    '/realtime-media/rtm/reference/release-notes',
    '/zh-CN/realtime-media/rtm/reference/release-notes',
  ])(
    'shares the visible platform from a base page TOC (%s)',
    async (pathname) => {
      const previousUrl = window.location.href;
      try {
        window.history.replaceState({}, '', `${pathname}?from=overview`);
        render(
          <AppProviders>
            <article>
              <PlatformPanel platform="web">
                <h2 data-accordion-value="224-版-2" id="224-版-2">
                  2.2.4 版
                </h2>
              </PlatformPanel>
            </article>
            <DocsTableOfContents
              toc={[{ depth: 2, title: '2.2.4 版', url: '#224-版-2' }]}
            />
          </AppProviders>,
        );
        const link = screen.getByRole('link', { name: '2.2.4 版' });
        await waitFor(() =>
          expect(link).toHaveAttribute(
            'href',
            `${pathname}/web?from=overview#224-%E7%89%88-2`,
          ),
        );
        fireEvent.click(link);
        expect(window.location.pathname).toBe(`${pathname}/web`);
        expect(window.location.search).toBe('?from=overview');
        expect(window.location.hash).toBe('#224-%E7%89%88-2');
      } finally {
        window.history.replaceState({}, '', previousUrl);
      }
    },
  );

  it('updates shareable TOC links after the visible platform changes', async () => {
    const previousUrl = window.location.href;
    window.history.replaceState(
      {},
      '',
      '/realtime-media/rtm/reference/release-notes',
    );
    const toc = [{ depth: 2, title: '2.2.4 版', url: '#version' }];
    const fixture = (activePlatform: 'web' | 'android') => (
      <AppProviders>
        <article>
          <PlatformPanel activePlatform={activePlatform} platform="web">
            <h2 id="version">2.2.4 版</h2>
          </PlatformPanel>
          <PlatformPanel activePlatform={activePlatform} platform="android">
            <h2 id="version">2.2.4 版</h2>
          </PlatformPanel>
        </article>
        <DocsTableOfContents toc={toc} />
      </AppProviders>
    );
    try {
      const { rerender } = render(fixture('web'));
      const link = screen.getByRole('link', { name: '2.2.4 版' });
      await waitFor(() =>
        expect(link).toHaveAttribute(
          'href',
          '/realtime-media/rtm/reference/release-notes/web#version',
        ),
      );
      rerender(fixture('android'));
      await waitFor(() =>
        expect(link).toHaveAttribute(
          'href',
          '/realtime-media/rtm/reference/release-notes/android#version',
        ),
      );
    } finally {
      window.history.replaceState({}, '', previousUrl);
    }
  });

  it('clears the current item when the last open release is closed', async () => {
    const fixture = (state: 'open' | 'closed') => (
      <AppProviders>
        <article>
          <div data-state={state}>
            <h2 data-accordion-value="v213" id="v213">
              v2.13
            </h2>
          </div>
        </article>
        <DocsTableOfContents
          locale="zh-CN"
          toc={[{ depth: 3, title: 'v2.13', url: '#v213' }]}
        />
      </AppProviders>
    );
    const { rerender } = render(fixture('open'));
    const link = screen.getByRole('link', { name: 'v2.13' });

    await waitFor(() =>
      expect(link).toHaveAttribute('aria-current', 'location'),
    );
    rerender(fixture('closed'));

    await waitFor(() => {
      expect(link).not.toHaveAttribute('aria-current');
      expect(link).not.toHaveAttribute('data-visible');
    });
  });
});

describe('DocsPageFeedback placement', () => {
  it('captures helpfulness feedback without changing the local pressed state', async () => {
    renderWithRouter(
      <DocsMainColumn locale="en">
        <article>Body</article>
      </DocsMainColumn>,
    );

    const mobileFlow = await screen.findByTestId('docs-main-mobile-flow');
    const feedback = within(mobileFlow).getByTestId('docs-feedback');
    expect(screen.queryByTestId('docs-task-feedback')).not.toBeInTheDocument();
    const yesButton = within(feedback).getByRole('button', { name: 'Yes' });
    const noButton = within(feedback).getByRole('button', { name: 'No' });

    fireEvent.click(yesButton);

    expect(yesButton).toHaveAttribute('aria-pressed', 'true');
    expect(captureDocsPageFeedbackMock).toHaveBeenLastCalledWith({
      locale: 'en',
      value: 'yes',
    });

    fireEvent.click(noButton);

    expect(yesButton).toHaveAttribute('aria-pressed', 'false');
    expect(noButton).toHaveAttribute('aria-pressed', 'true');
    expect(captureDocsPageFeedbackMock).toHaveBeenLastCalledWith({
      locale: 'en',
      value: 'no',
    });
  });
});
