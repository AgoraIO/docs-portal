import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PortalDocContent } from './PortalDocContent';

vi.mock('@/components/docs/DocsSharedContent', () => ({
  DocsSharedContent: ({
    children,
    description,
    markdownUrl,
    path,
    title,
    toc,
  }: {
    children: React.ReactNode;
    description?: string;
    markdownUrl: string;
    path: string;
    title: string;
    toc: Array<{ title: string; url: string }>;
  }) => (
    <div
      data-description={description ?? ''}
      data-markdown-url={markdownUrl}
      data-path={path}
      data-testid="docs-shared-content"
      data-title={title}
    >
      {children}
    </div>
  ),
}));

vi.mock('@/components/mdx', () => ({
  getMDXComponents: () => ({}),
}));

vi.mock('fumadocs-ui/components/toc', () => ({
  TOCProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('fumadocs-ui/contexts/i18n', () => ({
  useI18n: () => ({
    text: {
      toc: '本页目录',
      tocNoHeadings: '当前页面没有标题。',
    },
  }),
}));

vi.mock('fumadocs-core/source/client', () => ({
  useFumadocsLoader: (value: unknown) => value,
}));

vi.mock('collections/browser', () => ({
  default: {
    docs: {
      createClientLoader: ({
        component,
      }: {
        component: (
          collection: {
            default: (props: { components: unknown }) => React.ReactNode;
            toc: Array<{ title: string; url: string }>;
          },
          props: {
            description?: string;
            markdownUrl: string;
            path: string;
            title: string;
          },
        ) => React.ReactNode;
      }) => ({
        useContent: (
          _path: string,
          props: {
            description?: string;
            markdownUrl: string;
            path: string;
            title: string;
          },
        ) =>
          component(
            {
              default: () => <div data-testid="mock-mdx">Mock MDX</div>,
              toc: [{ title: 'Section 1', url: '#section-1' }],
            },
            props,
          ),
      }),
    },
  },
}));

describe('PortalDocContent', () => {
  it('reuses shared docs content and renders a standalone toc for portal pages', () => {
    render(
      <PortalDocContent
        description="页面描述"
        markdownUrl="/llms.mdx/docs/convoai/restful/skills-integrate.md"
        path="docs/convoai/restful/skills-integrate.mdx"
        title="使用 Skills 集成"
      />,
    );

    const wrapper = screen.getByTestId('docs-shared-content');

    expect(wrapper).toHaveAttribute('data-title', '使用 Skills 集成');
    expect(wrapper).toHaveAttribute('data-description', '页面描述');
    expect(wrapper).toHaveAttribute(
      'data-markdown-url',
      '/llms.mdx/docs/convoai/restful/skills-integrate.md',
    );
    expect(wrapper).toHaveAttribute(
      'data-path',
      'docs/convoai/restful/skills-integrate.mdx',
    );
    expect(screen.getByText('本页目录')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Section 1' })).toHaveAttribute(
      'href',
      '#section-1',
    );
    expect(screen.getByTestId('mock-mdx')).toBeVisible();
  });
});
