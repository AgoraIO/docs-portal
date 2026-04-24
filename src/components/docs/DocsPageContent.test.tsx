import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { i18n } from '@/lib/i18n/i18n';
import { DocsPageContent } from './DocsPageContent';

describe('DocsPageContent', () => {
  it('renders document body without duplicating frontmatter fields', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <DocsPageContent
          markdownUrl="/llms.mdx/docs/example/content.md"
          toc={[]}
        >
          <h1>正文标题</h1>
          <p>正文描述</p>
        </DocsPageContent>
      </I18nextProvider>,
    );

    expect(screen.getByRole('heading', { name: '正文标题' })).toBeVisible();
    expect(screen.getByText('正文描述')).toBeVisible();
    expect(screen.queryByText('frontmatter.title')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Copy Markdown' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Open' })).toBeVisible();
  });

  it('uses chinese labels for document actions', async () => {
    await i18n.changeLanguage('zh-CN');

    render(
      <I18nextProvider i18n={i18n}>
        <DocsPageContent
          markdownUrl="/llms.mdx/docs/example/content.md"
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
