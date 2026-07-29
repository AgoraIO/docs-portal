import { fireEvent, render, screen, within } from '@testing-library/react';
import { type AnchorHTMLAttributes, createRef, type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SidebarProvider } from '@/components/ui/sidebar';
import type { DocsSidebarNode } from '@/lib/docs-tree';
import { DocsSidebar } from './DocsSidebar';
import { useTransientScrollbar } from './useTransientScrollbar';

vi.mock('./useTransientScrollbar', () => ({
  useTransientScrollbar: vi.fn(),
}));

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@tanstack/react-router')>();

  return {
    ...actual,
    Link: ({
      children,
      params: _params,
      search: _search,
      to,
      ...props
    }: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
      children: ReactNode;
      params?: unknown;
      search?: unknown;
      to: string;
    }) => (
      <a href={to} {...props}>
        {children}
      </a>
    ),
  };
});

const referenceNodes: DocsSidebarNode[] = [
  {
    id: 'sdk-downloads',
    title: 'SDK 下载',
    type: 'page',
    url: '/zh-CN/reference/sdks',
  },
  {
    id: 'recipes',
    title: 'Demo',
    type: 'page',
    url: '/zh-CN/reference/recipes',
  },
  {
    children: [
      {
        id: 'faq-integration',
        title: '集成类',
        type: 'page',
        url: '/zh-CN/reference/faq/integration',
      },
    ],
    collapsible: true,
    defaultOpen: false,
    id: 'faq',
    title: '常见问题',
    type: 'section',
    url: '/zh-CN/reference/faq',
  },
];

describe('DocsSidebar Reference navigation', () => {
  beforeEach(() => {
    vi.mocked(useTransientScrollbar).mockReturnValue({
      isScrollbarVisible: false,
      scrollContainerRef: createRef<HTMLDivElement>(),
      scrollToTop: vi.fn(),
    });
  });

  it('folds FAQ categories into the standard Reference tree', () => {
    render(
      <SidebarProvider>
        <DocsSidebar
          activePath="/zh-CN/reference/faq/integration"
          locale="zh-CN"
          nodes={referenceNodes}
          onSelectPath={() => {}}
          resetKey="reference"
        />
      </SidebarProvider>,
    );

    const faqToggle = screen.getByRole('button', { name: '常见问题' });
    const primaryGroup = faqToggle.closest('[data-sidebar="group"]');

    expect(primaryGroup).toBeInstanceOf(HTMLElement);
    const primaryLinks = within(primaryGroup as HTMLElement).getAllByRole(
      'link',
    );
    expect(primaryLinks.map((link) => link.textContent)).toEqual([
      'SDK 下载',
      'Demo',
    ]);

    for (const item of [...primaryLinks, faqToggle]) {
      expect(item.closest('[data-sidebar="menu-button"]')).toHaveClass(
        'text-[13px]',
        'font-medium',
        'text-[color:var(--ink-3)]',
      );
    }

    expect(faqToggle).toHaveAttribute('aria-expanded', 'false');
    expect(
      within(primaryGroup as HTMLElement).queryByRole('link', {
        name: '集成类',
      }),
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId('faq-category-nav')).not.toBeInTheDocument();

    fireEvent.click(faqToggle);

    expect(faqToggle).toHaveAttribute('aria-expanded', 'true');
    expect(
      within(primaryGroup as HTMLElement).getByRole('link', {
        name: '集成类',
      }),
    ).toBeVisible();
  });

  it('does not render the SDK product directory', () => {
    render(
      <SidebarProvider>
        <DocsSidebar
          activePath="/zh-CN/reference/sdks"
          locale="zh-CN"
          nodes={referenceNodes}
          onSelectPath={() => {}}
          resetKey="reference"
        />
      </SidebarProvider>,
    );

    expect(screen.getByRole('link', { name: 'SDK 下载' })).toBeVisible();
    expect(
      screen.queryByTestId('sdk-download-product-nav'),
    ).not.toBeInTheDocument();
  });
});
