import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router';
import { fireEvent, render, screen, within } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { AppProviders } from '@/components/providers/AppProviders';
import { DocsContent } from './DocsContent';
import { DocsMainColumn } from './DocsMainColumn';

vi.mock('./DocsContentBody.client', () => ({
  DocsContentBodyClient: ({ contentPath }: { contentPath: string }) => (
    <div data-testid="docs-content-body">{contentPath}</div>
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
  it('renders page breadcrumb, reading time, title, and description', async () => {
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
        readingTime={{
          minutes: 2,
          words: 360,
        }}
        slug="about-agora"
        title="About Agora"
        toc={[]}
      />,
    );

    expect(
      await screen.findByRole('heading', { name: 'About Agora' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Learn the platform basics.')).toBeInTheDocument();
    expect(screen.getByText('Reading time · 2 min')).toBeInTheDocument();

    const breadcrumb = screen.getByLabelText('Breadcrumb');
    expect(
      within(breadcrumb).getByRole('link', { name: 'Introduction' }),
    ).toHaveAttribute('href', '/en/introduction');
    expect(within(breadcrumb).getByText('About Agora')).toBeInTheDocument();
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
});
