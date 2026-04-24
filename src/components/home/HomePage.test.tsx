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

  it('renders a protocol-inspired english docs landing page', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <HomePage />
      </I18nextProvider>,
    );

    const heading = screen.getByRole('heading', {
      name: 'Documentation that behaves like a product surface.',
    });

    expect(heading).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Open docs' })[0]).toHaveAttribute(
      'href',
      '/docs',
    );
    expect(
      screen.getAllByRole('link', { name: 'API reference' })[0],
    ).toHaveAttribute('href', '/api-ref');
    expect(
      screen.getByRole('heading', { name: 'Start with quickstart' }),
    ).toBeVisible();
    expect(
      screen.getByRole('heading', { name: 'Inspect the API surface' }),
    ).toBeVisible();
    expect(
      screen.getByRole('heading', { name: 'Use the markdown directly' }),
    ).toBeVisible();
    expect(screen.getByText('Current system')).toBeVisible();
    expect(screen.getByText('Fumadocs + TanStack + shadcn')).toBeVisible();
    expect(screen.queryByText('Shipping surface')).not.toBeInTheDocument();
  });

  it('renders a protocol-inspired chinese docs landing page', async () => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, 'zh-CN');
    await i18n.changeLanguage('zh-CN');

    render(
      <I18nextProvider i18n={i18n}>
        <HomePage />
      </I18nextProvider>,
    );

    const heading = await screen.findByRole('heading', {
      name: '像产品界面一样工作的文档系统。',
    });

    expect(heading).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: '进入文档' })[0]).toHaveAttribute(
      'href',
      '/docs',
    );
    expect(
      screen.getAllByRole('link', { name: 'API 参考' })[0],
    ).toHaveAttribute('href', '/api-ref');
    expect(screen.getByRole('heading', { name: '从快速开始进入' })).toBeVisible();
    expect(screen.getByRole('heading', { name: '查看接口表面' })).toBeVisible();
    expect(screen.getByRole('heading', { name: '直接消费 Markdown' })).toBeVisible();
    expect(screen.getByText('当前系统')).toBeVisible();
    expect(screen.getByText('Fumadocs + TanStack + shadcn')).toBeVisible();
    expect(screen.queryByText('交付界面')).not.toBeInTheDocument();
  });
});
