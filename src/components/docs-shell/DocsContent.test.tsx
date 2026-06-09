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
import { describe, expect, it, vi } from 'vitest';
import { AppProviders } from '@/components/providers/AppProviders';
import { DocsContent, DocsTableOfContents } from './DocsContent';
import { DocsMainColumn } from './DocsMainColumn';

vi.mock('./DocsContentBody', () => ({
  DocsContentBody: ({ contentPath }: { contentPath: string }) => (
    <div data-testid="docs-content-body">{contentPath}</div>
  ),
}));

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

function renderWithRouter(children: ReactNode) {
  const rootRoute = createRootRoute({
    component: () => <Outlet />,
  });
  const docsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/$locale/$tab/$slug',
    component: () => <AppProviders>{children}</AppProviders>,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([docsRoute]),
    history: createMemoryHistory({
      initialEntries: ['/en/introduction/about-agora'],
    }),
  });

  return render(<RouterProvider router={router} />);
}

describe('DocsContent', () => {
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
        markdownUrl="/llms.mdx/docs/en/introduction/about-agora.md"
        slug="about-agora"
        title="About Agora"
        toc={[]}
      />,
    );

    expect(
      await screen.findByRole('heading', { name: 'About Agora' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Learn the platform basics.')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'View as Markdown' }),
    ).toHaveAttribute('href', '/llms.mdx/docs/en/introduction/about-agora.md');
    expect(screen.queryByText(/Reading time/)).not.toBeInTheDocument();

    const breadcrumb = screen.getByLabelText('Breadcrumb');
    expect(
      within(breadcrumb).getByRole('link', { name: 'Introduction' }),
    ).toHaveAttribute('href', '/en/introduction');
    expect(within(breadcrumb).getByText('About Agora')).toBeInTheDocument();
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
        markdownUrl="/llms.mdx/docs/en/realtime-media/rtc/android/quick-start/integrate-with-ai-tools.md"
        slug="integrate-with-ai-tools"
        title="Integrate with AI tools"
        toc={[]}
      />,
    );

    const markdownLink = await screen.findByRole('link', {
      name: 'View as Markdown',
    });
    const androidTab = await screen.findByRole('tab', { name: 'Android' });

    expect(androidTab).toHaveAttribute(
      'href',
      '/en/realtime-media/rtc/quick-start/android/integrate-with-ai-tools',
    );
    expect(screen.getByRole('tab', { name: 'iOS' })).toHaveAttribute(
      'href',
      '/en/realtime-media/rtc/quick-start/ios/integrate-with-ai-tools',
    );
    expect(
      markdownLink.compareDocumentPosition(androidTab) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
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
  it('renders helpfulness feedback and reference-style pager cards', async () => {
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
      within(footer).getByText('Was this page helpful?'),
    ).toBeInTheDocument();

    const yesButton = within(footer).getByRole('button', { name: 'Yes' });
    const noButton = within(footer).getByRole('button', { name: 'No' });

    fireEvent.click(yesButton);

    expect(yesButton).toHaveAttribute('aria-pressed', 'true');
    expect(noButton).toHaveAttribute('aria-pressed', 'false');
    expect(
      within(footer).getByRole('link', { name: /Previous Previous Page/i }),
    ).toHaveAttribute('href', '/en/introduction/previous-page');
    expect(
      within(footer).getByRole('link', { name: /Next Next Page/i }),
    ).toHaveAttribute('href', '/en/introduction/next-page');
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
});
