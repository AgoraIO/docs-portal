import { render, screen } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { vi } from 'vitest';
import { i18n } from '@/lib/i18n/i18n';
import { DocsPageContent } from './DocsPageContent';

const guideToc = [
  { title: 'What you will build', url: '#what-you-will-build', depth: 2 },
  { title: 'Before you start', url: '#before-you-start', depth: 2 },
  { title: 'Steps', url: '#steps', depth: 2 },
  { title: 'Debug', url: '#debug', depth: 2 },
] as const;

vi.mock('fumadocs-ui/layouts/docs/page', () => ({
  DocsPage: ({
    children,
    className,
  }: {
    children: ReactNode;
    className?: string;
  }) => <div className={className}>{children}</div>,
  DocsBody: ({
    children,
    className,
  }: {
    children: ReactNode;
    className?: string;
  }) => <div className={className}>{children}</div>,
  DocsTitle: ({
    children,
    className,
  }: {
    children: ReactNode;
    className?: string;
  }) => <h1 className={className}>{children}</h1>,
  DocsDescription: ({
    children,
    className,
  }: {
    children: ReactNode;
    className?: string;
  }) => <p className={className}>{children}</p>,
}));

function renderDocsPageContent(node: ReactElement) {
  return render(<I18nextProvider i18n={i18n}>{node}</I18nextProvider>);
}

describe('DocsPageContent', () => {
  it('renders page title and description without duplicating lead content', () => {
    renderDocsPageContent(
      <DocsPageContent
        description="正文描述"
        markdownUrl="/llms.mdx/docs/example/content.md"
        title="正文标题"
        toc={[]}
      >
        <h1>正文标题</h1>
        <p>正文描述</p>
        <p>真正正文</p>
      </DocsPageContent>,
    );

    expect(screen.getAllByRole('heading', { name: '正文标题' })).toHaveLength(
      1,
    );
    expect(screen.getAllByText('正文描述')).toHaveLength(1);
    expect(screen.getByText('真正正文')).toBeVisible();
    expect(screen.queryByText('frontmatter.title')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Copy Markdown' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Open' })).toBeVisible();
    expect(screen.queryByText('Documentation')).not.toBeInTheDocument();
  });

  it('keeps non-duplicate leading content in the body', () => {
    renderDocsPageContent(
      <DocsPageContent
        description="页面描述"
        markdownUrl="/llms.mdx/docs/example/content.md"
        title="页面标题"
        toc={[]}
      >
        <p>不同的导语</p>
      </DocsPageContent>,
    );

    expect(screen.getByText('不同的导语')).toBeVisible();
  });

  it('removes duplicated description even when media appears before it', () => {
    renderDocsPageContent(
      <DocsPageContent
        description="页面描述"
        markdownUrl="/llms.mdx/docs/example/content.md"
        title="页面标题"
        toc={[]}
      >
        <h1>页面标题</h1>
        <img alt="Banner" src="/banner.png" />
        <p>页面描述</p>
        <p>正文开始</p>
      </DocsPageContent>,
    );

    expect(screen.getAllByText('页面描述')).toHaveLength(1);
    expect(screen.getByRole('img', { name: 'Banner' })).toBeVisible();
    expect(screen.getByText('正文开始')).toBeVisible();
  });

  it('removes duplicated leading description when frontmatter is truncated', () => {
    renderDocsPageContent(
      <DocsPageContent
        description="你可以借助 AI Coding Agent 更高效地集成声网产品。通过配置 Shengwang skills，Coding Agent 可获得面向声网产品的任务路由、接入流程和生成规则，并结合最新官方文档内容，在需求分析、产品接入、代..."
        markdownUrl="/llms.mdx/docs/example/content.md"
        title="使用 Skills 集成"
        toc={[]}
      >
        <h1>使用 Skills 集成</h1>
        <p>
          你可以借助 AI Coding Agent 更高效地集成声网产品。通过配置 Shengwang
          skills，Coding Agent
          可获得面向声网产品的任务路由、接入流程和生成规则，并结合最新官方文档内容，在需求分析、产品接入、代码生成和问题排查等场景中提供更准确、更高效的协助。
        </p>
        <p>正文开始</p>
      </DocsPageContent>,
    );

    expect(
      screen.getAllByText(/你可以借助 AI Coding Agent 更高效地集成声网产品/),
    ).toHaveLength(1);
    expect(screen.getByText('正文开始')).toBeVisible();
  });

  it('uses chinese labels for document actions', async () => {
    await i18n.changeLanguage('zh-CN');

    renderDocsPageContent(
      <DocsPageContent
        description="页面描述"
        markdownUrl="/llms.mdx/docs/example/content.md"
        title="正文标题"
        toc={[]}
      >
        <h1>正文标题</h1>
      </DocsPageContent>,
    );

    expect(screen.getByRole('button', { name: '复制 Markdown' })).toBeVisible();
    expect(screen.getByRole('button', { name: '打开' })).toBeVisible();

    await i18n.changeLanguage('en');
  });

  it('renders an in-this-guide block from toc items', () => {
    renderDocsPageContent(
      <DocsPageContent
        description="Guide summary"
        markdownUrl="/llms.mdx/docs/example/content.md"
        title="Guide title"
        toc={[...guideToc]}
      >
        <p>Guide body</p>
      </DocsPageContent>,
    );

    expect(
      screen.getByRole('heading', { name: 'In this guide' }),
    ).toBeVisible();
    expect(
      screen.getByRole('link', { name: 'What you will build' }),
    ).toHaveAttribute('href', '#what-you-will-build');
    expect(
      screen.getByRole('link', { name: 'Before you start' }),
    ).toHaveAttribute('href', '#before-you-start');
  });

  it('omits the guide block when toc is empty', () => {
    renderDocsPageContent(
      <DocsPageContent
        description="Guide summary"
        markdownUrl="/llms.mdx/docs/example/content.md"
        title="Guide title"
        toc={[]}
      >
        <p>Guide body</p>
      </DocsPageContent>,
    );

    expect(
      screen.queryByRole('heading', { name: 'In this guide' }),
    ).not.toBeInTheDocument();
  });
});
