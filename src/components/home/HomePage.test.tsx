import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { afterEach } from 'vitest';
import { i18n } from '@/lib/i18n/i18n';
import { LOCALE_STORAGE_KEY } from '@/lib/i18n/i18n-config';
import { HomePage } from './HomePage';

describe('HomePage', () => {
  afterEach(async () => {
    await i18n.changeLanguage('en');
    window.localStorage.removeItem(LOCALE_STORAGE_KEY);
  });

  it('renders a restrained english docs landing page', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <HomePage />
      </I18nextProvider>,
    );

    const heading = screen.getByRole('heading', { name: 'Agora Docs' });

    expect(heading).toBeInTheDocument();
    expect(heading.getAttribute('style')).toContain(
      'font-family: var(--font-display)',
    );
    expect(heading.getAttribute('style')).toContain('line-height: 1.02');
    expect(screen.getByRole('link', { name: 'Open docs' })).toHaveAttribute(
      'href',
      '/docs',
    );
    expect(screen.getByRole('heading', { name: 'Product docs' })).toBeVisible();
    expect(
      screen.getByRole('heading', { name: 'API reference' }),
    ).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Agent tools' })).toBeVisible();
    expect(screen.getAllByText('Doc MCP')).toHaveLength(1);
  });

  it('renders a restrained chinese docs landing page', async () => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, 'zh-CN');
    await i18n.changeLanguage('zh-CN');

    render(
      <I18nextProvider i18n={i18n}>
        <HomePage />
      </I18nextProvider>,
    );

    const heading = await screen.findByRole('heading', { name: '声网文档' });

    expect(heading).toBeInTheDocument();
    expect(heading.getAttribute('style')).toContain(
      'font-family: var(--font-heading)',
    );
    expect(heading.getAttribute('style')).toContain('line-height: 1.02');
    expect(screen.getByRole('link', { name: '进入文档' })).toHaveAttribute(
      'href',
      '/docs',
    );
    expect(screen.getByRole('heading', { name: '产品文档' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'API 参考' })).toBeVisible();
    expect(screen.getByRole('heading', { name: '智能体工具' })).toBeVisible();
    expect(screen.getAllByText('Doc MCP')).toHaveLength(1);
  });
});
