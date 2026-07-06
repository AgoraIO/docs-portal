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
import { AppProviders } from '@/components/providers/AppProviders';
import { DOCS_MAIN_SCROLL_RESTORATION_ID } from '@/lib/docs-scroll-restoration';
import { i18n } from '@/lib/i18n/i18n';
import { DocsContent, DocsTableOfContents } from './DocsContent';
import { DocsMainColumn } from './DocsMainColumn';
import { DocsTocRail } from './DocsTocRail';
import { DocsCopyMenu } from './docs-copy-menu';

const clipboardWriteText = vi.fn();
const fetchMock = vi.fn();
const { captureDocsPageFeedbackMock } = vi.hoisted(() => ({
  captureDocsPageFeedbackMock: vi.fn(),
}));

vi.mock('@/lib/analytics/posthog', () => ({
  captureDocsPageFeedback: captureDocsPageFeedbackMock,
  initializePostHog: vi.fn(),
}));

vi.mock('./DocsContentBody', () => ({
  DocsContentBody: ({ contentPath }: { contentPath: string }) => {
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
    pageProps,
  }: {
    pageProps: { operations?: { path: string }[] };
  }) => (
    <div data-testid="fumadocs-openapi-content">
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
  Object.defineProperty(window.navigator, 'clipboard', {
    configurable: true,
    value: {
      writeText: clipboardWriteText,
    },
  });

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
    window.sessionStorage.clear();
    window.history.replaceState(null, '', '/en/introduction/about-agora');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('hides a single-item breadcrumb that just repeats the page title', async () => {
    renderWithRouter(
      <DocsContent
        breadcrumb={[{ title: 'SDKs', url: '/en/api-reference/sdks' }]}
        contentPath="en/api-reference/sdks/index.mdx"
        slug="sdks"
        title="SDKs"
        toc={[]}
      />,
    );

    await screen.findByRole('heading', { level: 1, name: 'SDKs' });
    expect(screen.queryByLabelText('Breadcrumb')).not.toBeInTheDocument();
  });

  it('keeps a single-item breadcrumb that differs from the page title', async () => {
    renderWithRouter(
      <DocsContent
        breadcrumb={[{ title: 'API Reference', url: '/en/api-reference' }]}
        contentPath="en/api-reference/sdks/index.mdx"
        slug="sdks"
        title="SDKs"
        toc={[]}
      />,
    );

    expect(await screen.findByLabelText('Breadcrumb')).toBeInTheDocument();
  });

  it('renders page breadcrumb, LLM markdown link, title, and description', async () => {
    renderWithRouter(
      <DocsContent
        breadcrumb={[
          {
            title: 'Introduction',
            url: '/en/introduction',
          },
          {
            title: 'About Agora',
            url: '/en/introduction/about-agora',
          },
        ]}
        contentPath="en/introduction/about-agora.md"
        description="Learn the platform basics."
        markdownUrl="/en/introduction/about-agora.md"
        slug="about-agora"
        title="About Agora"
        toc={[]}
      />,
    );

    const title = await screen.findByRole('heading', { name: 'About Agora' });
    const copyButton = screen.getByRole('button', { name: 'Copy Page' });
    const copyMenuButton = screen.getByRole('button', {
      name: 'Copy Page more actions',
    });

    expect(title).toBeInTheDocument();
    expect(screen.getByText('Learn the platform basics.')).toBeInTheDocument();
    expect(copyButton).toBeInTheDocument();
    expect(copyMenuButton).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Copy Page' })).toHaveLength(
      1,
    );
    expect(
      title.compareDocumentPosition(copyButton) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(screen.queryByText(/Reading time/)).not.toBeInTheDocument();

    const breadcrumb = screen.getByLabelText('Breadcrumb');
    expect(
      within(breadcrumb).getByRole('link', { name: 'Introduction' }),
    ).toHaveAttribute('href', '/en/introduction');
    expect(within(breadcrumb).getByText('About Agora')).toBeInTheDocument();
  });

  it('does not render the copy page action when the locale has no public markdown content', async () => {
    renderWithRouter(
      <DocsContent
        contentPath="zh-CN/introduction/about-agora.md"
        locale="zh-CN"
        markdownUrl="/zh-CN/introduction/about-agora.md"
        slug="introduction/about-agora"
        title="About Agora"
        toc={[]}
      />,
      '/zh-CN/introduction/about-agora',
    );

    expect(
      await screen.findByRole('heading', { name: 'About Agora' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Copy Page' }),
    ).not.toBeInTheDocument();
  });

  it('renders MDX content in the server output without a skeleton', () => {
    const html = renderToString(
      <AppProviders>
        <DocsContent
          contentPath="en/introduction/about-agora.md"
          slug="about-agora"
          title="About Agora"
          toc={[]}
        />
      </AppProviders>,
    );

    expect(html).toContain('data-testid="docs-content-body"');
    expect(html).toContain('en/introduction/about-agora.md');
    expect(html).not.toContain('data-testid="docs-content-skeleton"');
  });

  it('renders OpenAPI content through the Fumadocs content component', async () => {
    renderWithRouter(
      <DocsContent
        body={{
          kind: 'openapi',
          pageProps: {
            operations: [
              {
                method: 'post',
                path: '/v2/projects/{appid}/join',
              },
            ],
            payload: {
              bundled: {
                info: {
                  title: 'Conversational AI Agent API Overview',
                },
                openapi: '3.2.0',
                paths: {},
              },
            },
          },
        }}
        slug="join"
        title="Start a conversational AI agent"
        toc={[]}
      />,
    );

    expect(
      await screen.findByTestId('fumadocs-openapi-content'),
    ).toHaveTextContent('/v2/projects/{appid}/join');
  });

  it('renders the generic header description for OpenAPI bodies', async () => {
    renderWithRouter(
      <DocsContent
        body={{
          kind: 'openapi',
          pageProps: {
            operations: [
              {
                method: 'post',
                path: '/v2/projects/{appid}/agents/{agentId}/instructions',
              },
            ],
            payload: {
              bundled: {
                info: {
                  title: 'Conversational AI Agent API Overview',
                },
                openapi: '3.2.0',
                paths: {},
              },
            },
          },
        }}
        description="Use this endpoint for the following scenarios: - **Implicit instruction injection**"
        slug="send-instruction"
        title="Send a custom instruction"
        toc={[]}
      />,
    );

    expect(
      await screen.findByRole('heading', { name: 'Send a custom instruction' }),
    ).toBeInTheDocument();
    expect(
      await screen.findByTestId('fumadocs-openapi-content'),
    ).toHaveTextContent('/v2/projects/{appid}/agents/{agentId}/instructions');
    expect(
      screen.getByText(
        'Use this endpoint for the following scenarios: - **Implicit instruction injection**',
      ),
    ).toBeInTheDocument();
  });

  it('renders the generic header description for MDX-authored pages', async () => {
    renderWithRouter(
      <DocsContent
        contentPath="en/introduction/about-agora.md"
        description="Learn the platform basics."
        slug="about-agora"
        title="About Agora"
        toc={[]}
      />,
    );

    expect(
      await screen.findByRole('heading', { name: 'About Agora' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Learn the platform basics.')).toBeInTheDocument();
  });

  it('uses a tight header-to-body gap on non-platform-tabs pages', async () => {
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
    expect(article).toHaveClass('gap-6');
    expect(article).not.toHaveClass('gap-9');

    const header = article.querySelector('header');
    expect(header).toHaveClass('pb-5');
    expect(header).not.toHaveClass('pb-7');
  });

  it('renders split-file platform group pages with tabbed panels', async () => {
    renderWithRouter(
      <DocsContent
        body={{
          canonicalPlatform: 'ios',
          contentPath: 'en/ai/get-started/platform-split/index.mdx',
          kind: 'platform-group',
          panels: [
            {
              contentPath: 'en/ai/get-started/platform-split/ios.mdx',
              platform: 'ios',
            },
            {
              contentPath: 'en/ai/get-started/platform-split/android.mdx',
              platform: 'android',
            },
          ],
          platformTabs: {
            canonicalPlatform: 'ios',
            platforms: '["ios","android"]',
          },
          platforms: ['ios', 'android'],
        }}
        locale="en"
        slug="platform-split"
        title="Split platform page"
        toc={[]}
      />,
    );

    expect(
      await screen.findByRole('heading', { name: 'Split platform page' }),
    ).toBeInTheDocument();
    expect(await screen.findByTestId('platform-header-tabs')).toHaveTextContent(
      '["ios","android"]',
    );
    expect(screen.getByText('en/ai/get-started/platform-split/index.mdx'));
    expect(screen.getByText('en/ai/get-started/platform-split/ios.mdx'));
  });

  it('renders openapi-layout content without the article max-width or mobile TOC', async () => {
    renderWithRouter(
      <DocsContent
        contentPath="en/api-reference/recipes/index.mdx"
        layoutMode="openapi"
        slug="recipes"
        title="Recipes"
        toc={[{ depth: 2, title: 'Browse all recipes', url: '#browse' }]}
      />,
    );

    const article = await screen.findByRole('article');

    expect(article).toHaveClass('max-w-none');
    expect(article).not.toHaveClass('max-w-[var(--content-max)]');
    expect(screen.queryByText('On this page')).not.toBeInTheDocument();
  });

  it('drops the article max-width and mobile TOC when hideToc is set in docs layout', async () => {
    renderWithRouter(
      <DocsContent
        contentPath="en/api-reference/recipes/index.mdx"
        hideToc
        layoutMode="docs"
        slug="recipes"
        title="Recipes"
        toc={[{ depth: 2, title: 'Browse all recipes', url: '#browse' }]}
      />,
    );

    const article = await screen.findByRole('article');

    expect(article).toHaveClass('max-w-none');
    expect(article).not.toHaveClass('max-w-[var(--content-max)]');
    expect(screen.queryByText('On this page')).not.toBeInTheDocument();
  });

  it('derives TOC items from rendered headings when the payload TOC is empty', async () => {
    renderWithRouter(
      <AppProviders>
        <article>
          <section hidden>
            <h2 id="android-only">Android only</h2>
          </section>
          <section>
            <h2 id="web-only">Web only</h2>
            <h3 id="web-details">Web details</h3>
          </section>
          <DocsTableOfContents toc={[]} />
        </article>
      </AppProviders>,
    );

    expect(
      await screen.findByRole('link', { name: 'Web only' }),
    ).toHaveAttribute('href', '#web-only');
    expect(screen.getByRole('link', { name: 'Web details' })).toHaveAttribute(
      'href',
      '#web-details',
    );
    expect(
      screen.queryByRole('link', { name: 'Android only' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('No headings on this page.'),
    ).not.toBeInTheDocument();
  });

  it('renders scope tabs in the content header when the sidebar header requests tabs presentation', async () => {
    renderWithRouter(
      <DocsContent
        contentPath="en/realtime-media/rtc/quick-start/android/integrate-with-ai-tools.md"
        description="Prototype page."
        sidebarHeader={{
          backHref: '/en/realtime-media/rtc',
          backLabel: 'Voice & Video',
          title: 'Quick Start',
          versionSwitcher: {
            currentId: 'android',
            presentation: 'tabs',
            versions: [
              {
                href: '/en/realtime-media/rtc/quick-start/android/integrate-with-ai-tools',
                id: 'android',
                label: 'Android',
              },
              {
                href: '/en/realtime-media/rtc/quick-start/ios/integrate-with-ai-tools',
                id: 'ios',
                label: 'iOS',
              },
            ],
          },
        }}
        markdownUrl="/en/realtime-media/rtc/android/quick-start/integrate-with-ai-tools.md"
        slug="integrate-with-ai-tools"
        title="Integrate with AI tools"
        toc={[]}
      />,
    );

    const androidTab = await screen.findByRole('tab', { name: 'Android' });
    const copyMenuButton = await screen.findByRole('button', {
      name: 'Copy Page more actions',
    });

    expect(androidTab).toHaveAttribute(
      'href',
      '/en/realtime-media/rtc/quick-start/android/integrate-with-ai-tools',
    );
    expect(screen.getByRole('tab', { name: 'iOS' })).toHaveAttribute(
      'href',
      '/en/realtime-media/rtc/quick-start/ios/integrate-with-ai-tools',
    );
    expect(
      copyMenuButton.compareDocumentPosition(androidTab) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it('renders page-level platform tabs in the content header before MDX body content', async () => {
    renderWithRouter(
      <DocsContent
        body={{
          contentPath: 'en/realtime-media/voice/quickstart.mdx',
          kind: 'mdx',
          platformTabs: {
            canonicalPlatform: 'web',
            defaultPlatform: 'android',
            initialPlatform: 'android',
            platforms: '["web","android"]',
          },
        }}
        description="Build a voice calling app."
        slug="quickstart"
        title="Quickstart"
        toc={[]}
      />,
    );

    const title = await screen.findByRole('heading', { name: 'Quickstart' });
    const tabs = await screen.findByTestId('platform-header-tabs');
    const body = await screen.findByTestId('docs-content-body');

    expect(tabs).toHaveTextContent('["web","android"]');
    expect(tabs).toHaveAttribute('data-default-platform', 'android');
    expect(tabs).toHaveAttribute('data-initial-platform', 'android');
    expect(
      title.compareDocumentPosition(tabs) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      tabs.compareDocumentPosition(body) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it('hides page-level platform tabs when the page opts out of platform labels', async () => {
    renderWithRouter(
      <DocsContent
        body={{
          contentPath: 'en/realtime-media/voice/quickstart.mdx',
          hidePlatformTabs: true,
          kind: 'mdx',
          platformTabs: {
            canonicalPlatform: 'web',
            initialPlatform: 'android',
            platforms: '["web","android"]',
          },
        }}
        description="Build a voice calling app."
        slug="quickstart"
        title="Quickstart"
        toc={[]}
      />,
    );

    await screen.findByRole('heading', { name: 'Quickstart' });
    await screen.findByTestId('docs-content-body');

    expect(
      screen.queryByTestId('platform-header-tabs'),
    ).not.toBeInTheDocument();
  });

  it('shows a return path on a docs page reached from a docs body link', async () => {
    const source = renderWithRouter(
      <DocsContent
        contentPath="en/introduction/source-with-docs-link.mdx"
        slug="about-agora"
        title="About Agora"
        toc={[]}
      />,
      '/en/introduction/about-agora',
    );

    fireEvent.click(
      await screen.findByRole('link', {
        name: 'Open recipes from article',
      }),
    );
    source.unmount();

    renderWithRouter(
      <DocsContent
        contentPath="en/api-reference/recipes/index.mdx"
        slug="recipes"
        title="Recipes"
        toc={[]}
      />,
      '/en/api-reference/recipes',
    );

    const returnLink = await screen.findByRole('link', {
      name: 'Back to About Agora',
    });

    expect(returnLink).toHaveAttribute('href', '/en/introduction/about-agora');
    expect(
      await screen.findByRole('heading', { name: 'Recipes' }),
    ).toBeInTheDocument();
  });

  it('shows a return path on an OpenAPI page reached from a docs body link', async () => {
    const source = renderWithRouter(
      <DocsContent
        contentPath="en/introduction/source-with-openapi-link.mdx"
        slug="about-agora"
        title="About Agora"
        toc={[]}
      />,
      '/en/introduction/about-agora',
    );

    fireEvent.click(
      await screen.findByRole('link', {
        name: 'Open RTC API from article',
      }),
    );
    source.unmount();

    renderWithRouter(
      <DocsContent
        body={{
          kind: 'openapi',
          pageProps: {
            operations: [
              {
                method: 'post',
                path: '/v1/rtc/channel',
              },
            ],
            payload: {
              bundled: {
                info: {
                  title: 'RTC REST API',
                },
                openapi: '3.2.0',
                paths: {},
              },
            },
          },
        }}
        slug="rtc"
        title="RTC REST API"
        toc={[]}
      />,
      '/en/api-reference/rtc',
    );

    expect(
      await screen.findByTestId('fumadocs-openapi-content'),
    ).toHaveTextContent('/v1/rtc/channel');
    expect(
      await screen.findByRole('link', { name: 'Back to About Agora' }),
    ).toHaveAttribute('href', '/en/introduction/about-agora');
  });

  it('does not render a stored return path when the source href is not an internal docs path', async () => {
    window.sessionStorage.setItem(
      'docs-portal:article-return:v1',
      JSON.stringify({
        createdAt: Date.now(),
        source: {
          href: 'javascript:alert(1)',
          title: 'Unsafe source',
        },
        targetPage: '/en/api-reference/recipes',
      }),
    );

    renderWithRouter(
      <DocsContent
        contentPath="en/api-reference/recipes/index.mdx"
        slug="recipes"
        title="Recipes"
        toc={[]}
      />,
      '/en/api-reference/recipes',
    );

    expect(
      await screen.findByRole('heading', { name: 'Recipes' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Back to Unsafe source' }),
    ).not.toBeInTheDocument();
  });

  it('does not show a return path after clicking a header breadcrumb link', async () => {
    const source = renderWithRouter(
      <DocsContent
        breadcrumb={[
          {
            title: 'API Reference',
            url: '/en/api-reference/recipes',
          },
          {
            title: 'About Agora',
            url: '/en/introduction/about-agora',
          },
        ]}
        contentPath="en/introduction/source-with-docs-link.mdx"
        slug="about-agora"
        title="About Agora"
        toc={[]}
      />,
      '/en/introduction/about-agora',
    );

    fireEvent.click(
      within(await screen.findByLabelText('Breadcrumb')).getByRole('link', {
        name: 'API Reference',
      }),
    );
    source.unmount();

    renderWithRouter(
      <DocsContent
        contentPath="en/api-reference/recipes/index.mdx"
        slug="recipes"
        title="Recipes"
        toc={[]}
      />,
      '/en/api-reference/recipes',
    );

    expect(
      await screen.findByRole('heading', { name: 'Recipes' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Back to About Agora' }),
    ).not.toBeInTheDocument();
  });

  it('renders copy page menu actions for AI tools, MCP, and markdown', async () => {
    renderWithRouter(
      <DocsCopyMenu
        locale="en"
        markdownUrl="/en/introduction/about-agora.md"
        slug="introduction/about-agora"
        title="About Agora"
      />,
    );

    fireEvent.pointerDown(
      await screen.findByRole('button', { name: 'Copy Page more actions' }),
      { button: 0 },
    );

    expect(await screen.findByText('AI tools')).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', { name: 'Open in ChatGPT' }),
    ).toHaveAttribute(
      'href',
      expect.stringContaining('https://chatgpt.com/?q='),
    );
    expect(
      screen.getByRole('menuitem', { name: 'Open in Claude' }),
    ).toHaveAttribute(
      'href',
      expect.stringContaining('https://claude.ai/new?q='),
    );
    expect(
      screen.getByRole('menuitem', { name: 'Connect to Cursor' }),
    ).toHaveAttribute('href', '/en/introduction/agora-mcp');
    expect(
      screen.getByRole('menuitem', { name: 'Connect to VS Code' }),
    ).toHaveAttribute('href', '/en/introduction/agora-mcp');
    expect(
      screen.getByRole('menuitem', { name: 'View as Markdown' }),
    ).toHaveAttribute('href', '/en/introduction/about-agora.md');
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
    expect(html).not.toContain('Copy Page');
  });

  it('copies MCP config and command from the copy page menu', async () => {
    clipboardWriteText.mockReset();
    clipboardWriteText.mockResolvedValue(undefined);

    renderWithRouter(
      <DocsCopyMenu
        locale="en"
        markdownUrl="/en/introduction/about-agora.md"
        slug="introduction/about-agora"
        title="About Agora"
      />,
    );

    fireEvent.pointerDown(
      await screen.findByRole('button', { name: 'Copy Page more actions' }),
      { button: 0 },
    );

    fireEvent.click(
      await screen.findByRole('menuitem', { name: 'Copy MCP Config' }),
    );
    await waitFor(() => {
      expect(clipboardWriteText).toHaveBeenCalledWith(`{
  "mcpServers": {
    "agora-docs": {
      "url": "https://mcp.agora.io"
    }
  }
}`);
    });

    fireEvent.pointerDown(
      screen.getByRole('button', { name: 'Copy Page more actions' }),
      { button: 0 },
    );
    fireEvent.click(
      await screen.findByRole('menuitem', { name: 'Copy MCP Command' }),
    );
    await waitFor(() => {
      expect(clipboardWriteText).toHaveBeenLastCalledWith(
        `code --add-mcp '{"name":"agora-docs","url":"https://mcp.agora.io"}'`,
      );
    });
    expect(
      screen.getByRole('button', { name: 'Copy Page' }),
    ).not.toHaveAttribute('data-copied');
  });

  it('copies the markdown content from the primary copy button', async () => {
    const markdown =
      '# About Agora\n\nAgora is a real-time engagement platform.';

    fetchMock.mockResolvedValueOnce({
      ok: true,
      text: vi.fn().mockResolvedValue(markdown),
    });
    clipboardWriteText.mockReset();
    clipboardWriteText.mockResolvedValue(undefined);

    renderWithRouter(
      <DocsCopyMenu
        locale="en"
        markdownUrl="/en/introduction/about-agora.md"
        slug="introduction/about-agora"
        title="About Agora"
      />,
    );

    fireEvent.click(await screen.findByRole('button', { name: 'Copy Page' }));

    await waitFor(() => {
      expect(clipboardWriteText).toHaveBeenCalledWith(markdown);
    });
    expect(fetchMock).toHaveBeenCalledWith('/en/introduction/about-agora.md', {
      credentials: 'same-origin',
    });
  });

  it('does not mark the page copied when markdown content cannot be fetched', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      text: vi.fn().mockResolvedValue('<h1>Not Found</h1>'),
    });
    clipboardWriteText.mockReset();
    clipboardWriteText.mockResolvedValue(undefined);

    renderWithRouter(
      <DocsCopyMenu
        locale="en"
        markdownUrl="/en/introduction/about-agora.md"
        slug="introduction/about-agora"
        title="About Agora"
      />,
    );

    const copyButton = await screen.findByRole('button', { name: 'Copy Page' });
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/en/introduction/about-agora.md',
        {
          credentials: 'same-origin',
        },
      );
    });
    expect(clipboardWriteText).not.toHaveBeenCalled();
    expect(copyButton).not.toHaveAttribute('data-copied');
  });

  it('uses a more visible success state after copying the page link', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      text: vi.fn().mockResolvedValue('# About Agora'),
    });
    clipboardWriteText.mockReset();
    clipboardWriteText.mockResolvedValue(undefined);

    renderWithRouter(
      <DocsCopyMenu
        locale="en"
        markdownUrl="/en/introduction/about-agora.md"
        slug="introduction/about-agora"
        title="About Agora"
      />,
    );

    fireEvent.click(await screen.findByRole('button', { name: 'Copy Page' }));

    const copyButton = await screen.findByRole('button', { name: 'Copy Page' });

    await waitFor(() => {
      expect(copyButton).toHaveTextContent('Copied');
    });
    expect(copyButton).toHaveAttribute('data-copied', 'true');
    expect(copyButton).toHaveAttribute('aria-live', 'polite');
    expect(copyButton).toHaveClass('bg-emerald-500/12');
    expect(copyButton).toHaveClass('ring-emerald-500/35');
  });
});

describe('DocsTableOfContents', () => {
  it('scrolls the desktop content container and marks the clicked item active', async () => {
    render(
      <AppProviders>
        <div
          data-testid="docs-main-desktop-scroll"
          style={{ height: 200, overflow: 'auto' }}
        >
          <h2 id="target-heading">Target heading</h2>
        </div>
        <DocsTableOfContents
          toc={[{ depth: 2, title: 'Target heading', url: '#target-heading' }]}
        />
      </AppProviders>,
    );

    const scrollContainer = screen.getByTestId('docs-main-desktop-scroll');
    const heading = document.getElementById('target-heading');
    const scrollTo = vi.fn();

    expect(heading).toBeInstanceOf(HTMLElement);
    Object.defineProperty(scrollContainer, 'scrollTop', {
      configurable: true,
      value: 10,
      writable: true,
    });
    Object.defineProperty(scrollContainer, 'scrollTo', {
      configurable: true,
      value: scrollTo,
    });
    vi.spyOn(scrollContainer, 'getBoundingClientRect').mockReturnValue({
      bottom: 300,
      height: 200,
      left: 0,
      right: 800,
      top: 100,
      width: 800,
      x: 0,
      y: 100,
      toJSON: () => ({}),
    });
    vi.spyOn(heading as HTMLElement, 'getBoundingClientRect').mockReturnValue({
      bottom: 260,
      height: 28,
      left: 0,
      right: 800,
      top: 240,
      width: 800,
      x: 0,
      y: 240,
      toJSON: () => ({}),
    });

    const link = screen.getByRole('link', { name: 'Target heading' });

    fireEvent.click(link);

    expect(scrollTo).toHaveBeenCalledWith({ behavior: 'smooth', top: 126 });
    expect(link).toHaveAttribute('aria-current', 'location');
  });

  it('renders the mobile table of contents as a collapsed disclosure by default', async () => {
    render(
      <AppProviders>
        <div
          data-testid="docs-main-desktop-scroll"
          style={{ height: 200, overflow: 'auto' }}
        >
          <h2 id="overview">Overview</h2>
          <h3 id="details">Details</h3>
        </div>
        <DocsTableOfContents
          sourceLinks={{
            editUrl:
              'https://github.com/AgoraIO/docs-portal/edit/main/content/docs/en/introduction/about-agora.md',
            viewUrl:
              'https://github.com/AgoraIO/docs-portal/blob/main/content/docs/en/introduction/about-agora.md',
          }}
          toc={[
            { depth: 2, title: 'Overview', url: '#overview' },
            { depth: 3, title: 'Details', url: '#details' },
          ]}
          variant="mobile"
        />
      </AppProviders>,
    );

    const toggle = await screen.findByRole('button', {
      name: 'On this page',
    });

    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('link', { name: 'Overview' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'Edit this page' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'View on GitHub' })).toBeNull();

    fireEvent.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('link', { name: 'Overview' })).toHaveAttribute(
      'href',
      '#overview',
    );
    expect(screen.getByRole('link', { name: 'Details' })).toHaveAttribute(
      'href',
      '#details',
    );
    expect(
      screen.getByRole('link', { name: 'Edit this page' }),
    ).toHaveAttribute(
      'href',
      'https://github.com/AgoraIO/docs-portal/edit/main/content/docs/en/introduction/about-agora.md',
    );
    expect(
      screen.getByRole('link', { name: 'View on GitHub' }),
    ).toHaveAttribute(
      'href',
      'https://github.com/AgoraIO/docs-portal/blob/main/content/docs/en/introduction/about-agora.md',
    );
  });

  it('uses localized docs source links for the table of contents actions', async () => {
    render(
      <AppProviders>
        <div
          data-testid="docs-main-desktop-scroll"
          style={{ height: 200, overflow: 'auto' }}
        >
          <h2 id="overview">概览</h2>
        </div>
        <DocsTableOfContents
          locale="zh-CN"
          sourceLinks={{
            editUrl:
              'https://github.com/AgoraIO/docs-portal/edit/main/content/docs/zh-CN/introduction/about-agora.md',
            viewUrl:
              'https://github.com/AgoraIO/docs-portal/blob/main/content/docs/zh-CN/introduction/about-agora.md',
          }}
          toc={[{ depth: 2, title: '概览', url: '#overview' }]}
          variant="mobile"
        />
      </AppProviders>,
    );

    fireEvent.click(await screen.findByRole('button', { name: '本页目录' }));

    expect(screen.getByRole('link', { name: '编辑此页' })).toHaveAttribute(
      'href',
      'https://github.com/AgoraIO/docs-portal/edit/main/content/docs/zh-CN/introduction/about-agora.md',
    );
    expect(
      screen.getByRole('link', { name: '在 GitHub 查看' }),
    ).toHaveAttribute(
      'href',
      'https://github.com/AgoraIO/docs-portal/blob/main/content/docs/zh-CN/introduction/about-agora.md',
    );
  });

  it('keeps mobile heading links interactive and collapses after a selection', async () => {
    render(
      <AppProviders>
        <div
          data-testid="docs-main-desktop-scroll"
          style={{ height: 200, overflow: 'auto' }}
        >
          <h2 id="target-heading">Target heading</h2>
        </div>
        <DocsTableOfContents
          toc={[{ depth: 2, title: 'Target heading', url: '#target-heading' }]}
          variant="mobile"
        />
      </AppProviders>,
    );

    const scrollContainer = screen.getByTestId('docs-main-desktop-scroll');
    const heading = document.getElementById('target-heading');
    const scrollTo = vi.fn();

    expect(heading).toBeInstanceOf(HTMLElement);
    Object.defineProperty(scrollContainer, 'scrollTop', {
      configurable: true,
      value: 10,
      writable: true,
    });
    Object.defineProperty(scrollContainer, 'scrollTo', {
      configurable: true,
      value: scrollTo,
    });
    vi.spyOn(scrollContainer, 'getBoundingClientRect').mockReturnValue({
      bottom: 300,
      height: 200,
      left: 0,
      right: 800,
      top: 100,
      width: 800,
      x: 0,
      y: 100,
      toJSON: () => ({}),
    });
    vi.spyOn(heading as HTMLElement, 'getBoundingClientRect').mockReturnValue({
      bottom: 260,
      height: 28,
      left: 0,
      right: 800,
      top: 240,
      width: 800,
      x: 0,
      y: 240,
      toJSON: () => ({}),
    });

    const toggle = await screen.findByRole('button', {
      name: 'On this page',
    });

    fireEvent.click(toggle);
    fireEvent.click(screen.getByRole('link', { name: 'Target heading' }));

    expect(scrollTo).toHaveBeenCalledWith({ behavior: 'smooth', top: 126 });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('link', { name: 'Target heading' })).toBeNull();
  });

  it('updates the active item from the desktop container scroll position', async () => {
    render(
      <AppProviders>
        <div
          data-testid="docs-main-desktop-scroll"
          style={{ height: 400, overflow: 'auto' }}
        >
          <h2 id="first-heading">First heading</h2>
          <h2 id="second-heading">Second heading</h2>
        </div>
        <DocsTableOfContents
          toc={[
            { depth: 2, title: 'First heading', url: '#first-heading' },
            { depth: 2, title: 'Second heading', url: '#second-heading' },
          ]}
        />
      </AppProviders>,
    );

    const scrollContainer = screen.getByTestId('docs-main-desktop-scroll');
    const firstHeading = document.getElementById('first-heading');
    const secondHeading = document.getElementById('second-heading');

    expect(firstHeading).toBeInstanceOf(HTMLElement);
    expect(secondHeading).toBeInstanceOf(HTMLElement);
    vi.spyOn(scrollContainer, 'getBoundingClientRect').mockReturnValue({
      bottom: 500,
      height: 400,
      left: 0,
      right: 800,
      top: 100,
      width: 800,
      x: 0,
      y: 100,
      toJSON: () => ({}),
    });
    vi.spyOn(
      firstHeading as HTMLElement,
      'getBoundingClientRect',
    ).mockReturnValue({
      bottom: 80,
      height: 28,
      left: 0,
      right: 800,
      top: 50,
      width: 800,
      x: 0,
      y: 50,
      toJSON: () => ({}),
    });
    vi.spyOn(
      secondHeading as HTMLElement,
      'getBoundingClientRect',
    ).mockReturnValue({
      bottom: 180,
      height: 28,
      left: 0,
      right: 800,
      top: 150,
      width: 800,
      x: 0,
      y: 150,
      toJSON: () => ({}),
    });

    fireEvent.scroll(scrollContainer);

    await waitFor(() => {
      expect(
        screen.getByRole('link', { name: 'Second heading' }),
      ).toHaveAttribute('aria-current', 'location');
    });
    expect(
      screen.getByRole('link', { name: 'Second heading' }),
    ).toHaveAttribute('data-primary', 'true');
  });

  it('marks every visible content section while keeping one primary aria-current item', async () => {
    render(
      <AppProviders>
        <div
          data-testid="docs-main-desktop-scroll"
          style={{ height: 400, overflow: 'auto' }}
        >
          <div className="prose" data-testid="article-body">
            <h2 id="first-heading">First heading</h2>
            <p>First content</p>
            <h2 id="second-heading">Second heading</h2>
            <p>Second content</p>
            <h2 id="third-heading">Third heading</h2>
          </div>
        </div>
        <DocsTableOfContents
          toc={[
            { depth: 2, title: 'First heading', url: '#first-heading' },
            { depth: 2, title: 'Second heading', url: '#second-heading' },
            { depth: 2, title: 'Third heading', url: '#third-heading' },
          ]}
        />
      </AppProviders>,
    );

    const scrollContainer = screen.getByTestId('docs-main-desktop-scroll');
    const article = screen.getByTestId('article-body');
    const firstHeading = document.getElementById('first-heading');
    const secondHeading = document.getElementById('second-heading');
    const thirdHeading = document.getElementById('third-heading');

    expect(firstHeading).toBeInstanceOf(HTMLElement);
    expect(secondHeading).toBeInstanceOf(HTMLElement);
    expect(thirdHeading).toBeInstanceOf(HTMLElement);

    vi.spyOn(scrollContainer, 'getBoundingClientRect').mockReturnValue({
      bottom: 500,
      height: 400,
      left: 0,
      right: 800,
      top: 100,
      width: 800,
      x: 0,
      y: 100,
      toJSON: () => ({}),
    });
    vi.spyOn(article, 'getBoundingClientRect').mockReturnValue({
      bottom: 900,
      height: 800,
      left: 0,
      right: 800,
      top: 100,
      width: 800,
      x: 0,
      y: 100,
      toJSON: () => ({}),
    });
    vi.spyOn(
      firstHeading as HTMLElement,
      'getBoundingClientRect',
    ).mockReturnValue({
      bottom: 80,
      height: 28,
      left: 0,
      right: 800,
      top: 50,
      width: 800,
      x: 0,
      y: 50,
      toJSON: () => ({}),
    });
    vi.spyOn(
      secondHeading as HTMLElement,
      'getBoundingClientRect',
    ).mockReturnValue({
      bottom: 180,
      height: 28,
      left: 0,
      right: 800,
      top: 150,
      width: 800,
      x: 0,
      y: 150,
      toJSON: () => ({}),
    });
    vi.spyOn(
      thirdHeading as HTMLElement,
      'getBoundingClientRect',
    ).mockReturnValue({
      bottom: 620,
      height: 28,
      left: 0,
      right: 800,
      top: 590,
      width: 800,
      x: 0,
      y: 590,
      toJSON: () => ({}),
    });

    fireEvent.scroll(scrollContainer);

    await waitFor(() => {
      expect(
        screen.getByRole('link', { name: 'First heading' }),
      ).toHaveAttribute('data-visible', 'true');
      expect(
        screen.getByRole('link', { name: 'Second heading' }),
      ).toHaveAttribute('data-visible', 'true');
    });
    expect(
      screen.getByRole('link', { name: 'Second heading' }),
    ).toHaveAttribute('aria-current', 'location');
    expect(
      screen.getByRole('link', { name: 'First heading' }),
    ).not.toHaveAttribute('aria-current');
    expect(
      screen.getByRole('link', { name: 'First heading' }),
    ).not.toHaveAttribute('data-primary', 'true');
    expect(
      screen.getByRole('link', { name: 'Third heading' }),
    ).not.toHaveAttribute('data-visible', 'true');
  });

  it('ignores hidden duplicate headings when tracking visible sections', async () => {
    render(
      <AppProviders>
        <div aria-hidden="true">
          <h2 id="first-heading">First heading</h2>
          <h2 id="second-heading">Second heading</h2>
        </div>
        <div
          data-testid="docs-main-desktop-scroll"
          style={{ height: 400, overflow: 'auto' }}
        >
          <div className="prose" data-testid="article-body">
            <h2 id="first-heading">First heading</h2>
            <h2 id="second-heading">Second heading</h2>
          </div>
        </div>
        <DocsTableOfContents
          toc={[
            { depth: 2, title: 'First heading', url: '#first-heading' },
            { depth: 2, title: 'Second heading', url: '#second-heading' },
          ]}
        />
      </AppProviders>,
    );

    const scrollContainer = screen.getByTestId('docs-main-desktop-scroll');
    const article = screen.getByTestId('article-body');
    const firstHeadingCandidates =
      document.querySelectorAll<HTMLElement>('#first-heading');
    const secondHeadingCandidates =
      document.querySelectorAll<HTMLElement>('#second-heading');
    const [hiddenFirstHeading, visibleFirstHeading] = firstHeadingCandidates;
    const [hiddenSecondHeading, visibleSecondHeading] = secondHeadingCandidates;

    vi.spyOn(hiddenFirstHeading, 'getClientRects').mockReturnValue({
      length: 0,
    } as DOMRectList);
    vi.spyOn(hiddenSecondHeading, 'getClientRects').mockReturnValue({
      length: 0,
    } as DOMRectList);
    vi.spyOn(visibleFirstHeading, 'getClientRects').mockReturnValue({
      length: 1,
    } as DOMRectList);
    vi.spyOn(visibleSecondHeading, 'getClientRects').mockReturnValue({
      length: 1,
    } as DOMRectList);
    vi.spyOn(scrollContainer, 'getBoundingClientRect').mockReturnValue({
      bottom: 500,
      height: 400,
      left: 0,
      right: 800,
      top: 100,
      width: 800,
      x: 0,
      y: 100,
      toJSON: () => ({}),
    });
    vi.spyOn(article, 'getBoundingClientRect').mockReturnValue({
      bottom: 600,
      height: 500,
      left: 0,
      right: 800,
      top: 100,
      width: 800,
      x: 0,
      y: 100,
      toJSON: () => ({}),
    });
    vi.spyOn(hiddenFirstHeading, 'getBoundingClientRect').mockReturnValue({
      bottom: 0,
      height: 0,
      left: 0,
      right: 0,
      top: 0,
      width: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    vi.spyOn(hiddenSecondHeading, 'getBoundingClientRect').mockReturnValue({
      bottom: 0,
      height: 0,
      left: 0,
      right: 0,
      top: 0,
      width: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    vi.spyOn(visibleFirstHeading, 'getBoundingClientRect').mockReturnValue({
      bottom: 140,
      height: 28,
      left: 0,
      right: 800,
      top: 112,
      width: 800,
      x: 0,
      y: 112,
      toJSON: () => ({}),
    });
    vi.spyOn(visibleSecondHeading, 'getBoundingClientRect').mockReturnValue({
      bottom: 320,
      height: 28,
      left: 0,
      right: 800,
      top: 292,
      width: 800,
      x: 0,
      y: 292,
      toJSON: () => ({}),
    });

    fireEvent.scroll(scrollContainer);

    await waitFor(() => {
      expect(
        screen.getByRole('link', { name: 'First heading' }),
      ).toHaveAttribute('data-visible', 'true');
      expect(
        screen.getByRole('link', { name: 'Second heading' }),
      ).toHaveAttribute('data-visible', 'true');
    });
  });
});

describe('DocsMainColumn', () => {
  it('keeps desktop content in normal page flow instead of a nested scroll viewport', async () => {
    renderWithRouter(
      <DocsMainColumn>
        <article>Body</article>
      </DocsMainColumn>,
    );

    const mainColumn = await screen.findByTestId('docs-main-column');
    const desktopContent = screen.getByTestId('docs-main-desktop-scroll');

    expect(mainColumn).toHaveClass('min-w-0', 'bg-background');
    expect(mainColumn).not.toHaveClass('h-full', 'min-h-0', 'overflow-hidden');
    expect(desktopContent).toHaveClass('hidden', 'lg:block');
    expect(desktopContent).not.toHaveClass(
      'docs-scrollbar',
      'h-full',
      'min-h-0',
      'overflow-y-auto',
    );
  });

  it('renders reference-style pager cards in the footer', async () => {
    renderWithRouter(
      <DocsMainColumn
        next={{ title: 'Next Page', url: '/en/introduction/next-page' }}
        previous={{
          title: 'Previous Page',
          url: '/en/introduction/previous-page',
        }}
      >
        <article>Body</article>
      </DocsMainColumn>,
    );

    const desktopScroll = await screen.findByTestId('docs-main-desktop-scroll');
    const footer = within(desktopScroll).getByTestId('docs-page-footer');
    expect(
      within(footer).getByRole('link', { name: /Previous Previous Page/i }),
    ).toHaveAttribute('href', '/en/introduction/previous-page');
    expect(
      within(footer).getByRole('link', { name: /Next Next Page/i }),
    ).toHaveAttribute('href', '/en/introduction/next-page');
  });

  it('does not reserve an empty pager column when only one page link exists', async () => {
    renderWithRouter(
      <DocsMainColumn
        next={{ title: 'Next Page', url: '/en/introduction/next-page' }}
      >
        <article>Body</article>
      </DocsMainColumn>,
    );

    const desktopScroll = await screen.findByTestId('docs-main-desktop-scroll');
    const footer = within(desktopScroll).getByTestId('docs-page-footer');
    const pager = within(footer).getByTestId('docs-pager');

    expect(
      within(pager).getByRole('link', { name: /Next Next Page/i }),
    ).toHaveAttribute('href', '/en/introduction/next-page');
    expect(
      within(pager).queryByRole('link', { name: /Previous/i }),
    ).not.toBeInTheDocument();
    expect(pager).toHaveClass('grid-cols-1');
    expect(pager).not.toHaveClass('sm:grid-cols-2');
    expect(pager.children).toHaveLength(1);
  });

  it('widens footer content in openapi layout', async () => {
    renderWithRouter(
      <DocsMainColumn layoutMode="openapi">
        <article>Body</article>
      </DocsMainColumn>,
    );

    const desktopScroll = await screen.findByTestId('docs-main-desktop-scroll');
    const footer = within(desktopScroll).getByTestId('docs-page-footer');

    expect(footer).toHaveClass('max-w-none');
    expect(footer).not.toHaveClass('max-w-[var(--content-max)]');
  });

  it('widens footer content when the main content fills the shell width', async () => {
    renderWithRouter(
      <DocsMainColumn contentFillsWidth>
        <article>Body</article>
      </DocsMainColumn>,
    );

    const desktopScroll = await screen.findByTestId('docs-main-desktop-scroll');
    const footer = within(desktopScroll).getByTestId('docs-page-footer');

    expect(footer).toHaveClass('max-w-none');
    expect(footer).not.toHaveClass('max-w-[var(--content-max)]');
  });

  it('keeps footer controls stacked and non-overlapping in the mobile flow', async () => {
    renderWithRouter(
      <DocsMainColumn
        next={{ title: 'Next Page', url: '/en/introduction/next-page' }}
        previous={{
          title: 'Previous Page',
          url: '/en/introduction/previous-page',
        }}
      >
        <article>Body</article>
      </DocsMainColumn>,
    );

    const mobileFlow = await screen.findByTestId('docs-main-mobile-flow');
    const footer = within(mobileFlow).getByTestId('docs-page-footer');
    const pager = within(footer).getByTestId('docs-pager');
    const feedback = within(footer).getByTestId('docs-feedback');

    expect(feedback).toHaveClass('flex-col', 'sm:flex-row');
    expect(pager).toHaveClass('grid-cols-1', 'sm:grid-cols-2');
  });

  it('keeps the mobile site footer outside the page footer semantics', async () => {
    renderWithRouter(
      <DocsMainColumn>
        <article>Body</article>
      </DocsMainColumn>,
    );

    const desktopScroll = await screen.findByTestId('docs-main-desktop-scroll');
    const pageFooter = within(desktopScroll).getByTestId('docs-page-footer');
    const mobileFlow = await screen.findByTestId('docs-main-mobile-flow');
    const siteFooter = within(mobileFlow).getByTestId('docs-site-footer');

    expect(
      within(desktopScroll).queryByTestId('docs-site-footer'),
    ).not.toBeInTheDocument();
    expect(pageFooter).not.toContainElement(siteFooter);
  });

  it('marks the desktop scroll region for router-managed scroll restoration', async () => {
    renderWithRouter(
      <DocsMainColumn resetKey="/en/introduction/about-agora">
        <article>Body</article>
      </DocsMainColumn>,
    );

    const desktopScroll = await screen.findByTestId('docs-main-desktop-scroll');
    expect(desktopScroll).toHaveAttribute(
      'data-scroll-restoration-id',
      DOCS_MAIN_SCROLL_RESTORATION_ID,
    );
  });

  it('does not override router scroll restoration when the reset key changes', async () => {
    const { rerender } = renderWithRouter(
      <DocsMainColumn resetKey="/en/introduction/about-agora">
        <article>First page</article>
      </DocsMainColumn>,
    );

    const desktopScroll = await screen.findByTestId('docs-main-desktop-scroll');
    const windowScrollTo = vi.fn();
    Object.defineProperty(window, 'scrollTo', {
      configurable: true,
      value: windowScrollTo,
      writable: true,
    });

    desktopScroll.scrollTop = 180;

    rerender(
      <DocsMainColumn resetKey="/en/introduction/quick-start">
        <article>Second page</article>
      </DocsMainColumn>,
    );

    expect(desktopScroll.scrollTop).toBe(180);
    expect(windowScrollTo).not.toHaveBeenCalled();
  });
});

describe('DocsTocRail', () => {
  it('keeps feedback out of the sticky toc rail while bounding long toc scroll', async () => {
    renderWithRouter(
      <DocsTocRail
        locale="en"
        toc={[{ depth: 2, title: 'First heading', url: '#first-heading' }]}
      />,
    );

    expect(await screen.findByText('On this page')).toBeInTheDocument();
    expect(screen.queryByTestId('docs-feedback')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Yes' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Send feedback' })).toBeNull();

    const tocRail = screen.getByTestId('docs-toc-rail');
    expect(tocRail).toHaveClass(
      'xl:sticky',
      'xl:top-[var(--docs-shell-header-offset)]',
      'xl:h-[var(--docs-shell-body-height)]',
      'xl:min-h-0',
    );
    expect(tocRail).not.toHaveClass('docs-scrollbar', 'overflow-y-auto');

    expect(screen.getByTestId('docs-toc-rail-scroll')).toHaveClass(
      'docs-scrollbar',
      'h-full',
      'min-h-0',
      'overflow-y-auto',
    );
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

  it('opens a feedback dialog with a prefilled issue link', async () => {
    window.history.replaceState(
      {},
      '',
      '/en/introduction/about-agora?platform=web#what-is',
    );

    renderWithRouter(
      <DocsMainColumn locale="en">
        <article>Body</article>
      </DocsMainColumn>,
    );

    const mobileFlow = await screen.findByTestId('docs-main-mobile-flow');
    const feedback = within(mobileFlow).getByTestId('docs-feedback');

    fireEvent.click(
      within(feedback).getByRole('button', { name: 'Send feedback' }),
    );
    fireEvent.click(await screen.findByLabelText('Suggestion'));
    fireEvent.change(
      screen.getByPlaceholderText(
        'Describe what is wrong, missing, confusing, or hard to use.',
      ),
      {
        target: {
          value: 'The setup step is missing a required parameter.',
        },
      },
    );

    const issueLink = screen.getByRole('link', { name: 'Open issue' });
    const href = issueLink.getAttribute('href') ?? '';
    const issueBody = new URL(href).searchParams.get('body') ?? '';

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(href).toContain('https://github.com/AgoraIO/docs-portal/issues/new');
    expect(issueBody).toContain(
      'Page: http://localhost:3000/en/introduction/about-agora?platform=web#what-is',
    );
    expect(issueBody).toContain('Feedback type: Suggestion');
    expect(issueBody).toContain(
      'The setup step is missing a required parameter.',
    );
  });

  it('shows helpfulness feedback in desktop and mobile page footers', async () => {
    renderWithRouter(
      <DocsMainColumn
        next={{ title: 'Next Page', url: '/en/introduction/next-page' }}
        previous={{
          title: 'Previous Page',
          url: '/en/introduction/previous-page',
        }}
      >
        <article>Body</article>
      </DocsMainColumn>,
    );

    const desktopScroll = await screen.findByTestId('docs-main-desktop-scroll');
    const desktopFooter = within(desktopScroll).getByTestId('docs-page-footer');
    expect(
      within(desktopFooter).getByTestId('docs-feedback'),
    ).toBeInTheDocument();

    const mobileFlow = await screen.findByTestId('docs-main-mobile-flow');
    const mobileFooter = within(mobileFlow).getByTestId('docs-page-footer');
    expect(
      within(mobileFooter).getByTestId('docs-feedback'),
    ).toBeInTheDocument();
  });
});
