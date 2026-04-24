import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { i18n } from '@/lib/i18n/i18n';
import { DocsPageContent } from './DocsPageContent';

describe('DocsPageContent', () => {
  it('renders page title and description without duplicating lead content', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <DocsPageContent
          description="正文描述"
          markdownUrl="/llms.mdx/docs/example/content.md"
          title="正文标题"
          toc={[]}
        >
          <h1>正文标题</h1>
          <p>正文描述</p>
          <p>真正正文</p>
        </DocsPageContent>
      </I18nextProvider>,
    );

    expect(screen.getAllByRole('heading', { name: '正文标题' })).toHaveLength(
      1,
    );
    expect(screen.getAllByText('正文描述')).toHaveLength(1);
    expect(screen.getByText('真正正文')).toBeVisible();
    expect(screen.queryByText('frontmatter.title')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Copy Markdown' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Open' })).toBeVisible();
  });

  it('keeps non-duplicate leading content in the body', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <DocsPageContent
          description="页面描述"
          markdownUrl="/llms.mdx/docs/example/content.md"
          title="页面标题"
          toc={[]}
        >
          <p>不同的导语</p>
        </DocsPageContent>
      </I18nextProvider>,
    );

    expect(screen.getByText('不同的导语')).toBeVisible();
  });

  it('removes duplicated description even when media appears before it', () => {
    render(
      <I18nextProvider i18n={i18n}>
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
        </DocsPageContent>
      </I18nextProvider>,
    );

    expect(screen.getAllByText('页面描述')).toHaveLength(1);
    expect(screen.getByRole('img', { name: 'Banner' })).toBeVisible();
    expect(screen.getByText('正文开始')).toBeVisible();
  });

  it('uses chinese labels for document actions', async () => {
    await i18n.changeLanguage('zh-CN');

    render(
      <I18nextProvider i18n={i18n}>
        <DocsPageContent
          description="页面描述"
          markdownUrl="/llms.mdx/docs/example/content.md"
          title="正文标题"
          toc={[]}
        >
          <h1>正文标题</h1>
        </DocsPageContent>
      </I18nextProvider>,
    );

    expect(screen.getByRole('button', { name: '复制 Markdown' })).toBeVisible();
    expect(screen.getByRole('button', { name: '打开' })).toBeVisible();

    await i18n.changeLanguage('en');
  });
});
