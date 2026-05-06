import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { afterEach, describe, expect, it } from 'vitest';
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
      name: 'Developer docs, organized like a workspace.',
    });

    expect(heading).toBeInTheDocument();
    expect(
      screen.getAllByRole('link', { name: 'Open docs' })[0],
    ).toHaveAttribute('href', '/en/docs');
    expect(
      screen.getAllByRole('link', { name: 'API reference' })[0],
    ).toHaveAttribute('href', '/en/api-ref');
    expect(screen.getByText('Start here')).toBeVisible();
    expect(screen.getByText('Primary workflow')).toBeVisible();
    expect(screen.getByText('Workspace guide')).toBeVisible();
    expect(
      screen.getByRole('heading', { name: 'Inspect the API surface' }),
    ).toBeVisible();
    expect(
      screen.getByRole('heading', { name: 'Use the markdown directly' }),
    ).toBeVisible();
    expect(screen.queryByText('Current system')).not.toBeInTheDocument();
    expect(
      screen.queryByText('Fumadocs + TanStack + shadcn'),
    ).not.toBeInTheDocument();
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
      name: '像知识工作区一样组织的开发文档',
    });

    expect(heading).toBeInTheDocument();
    expect(
      screen.getAllByRole('link', { name: '进入文档' })[0],
    ).toHaveAttribute('href', '/zh-CN/docs');
    expect(
      screen.getAllByRole('link', { name: 'API 参考' })[0],
    ).toHaveAttribute('href', '/zh-CN/api-ref');
    expect(screen.getByText('从这里开始')).toBeVisible();
    expect(screen.getByText('主要流程')).toBeVisible();
    expect(screen.getByText('工作区导览')).toBeVisible();
    expect(
      screen.getByRole('heading', { name: '查看 API 参考' }),
    ).toBeVisible();
    expect(
      screen.getByRole('heading', { name: '给 AI 使用 Markdown' }),
    ).toBeVisible();
    expect(screen.queryByText('当前系统')).not.toBeInTheDocument();
    expect(
      screen.queryByText('Fumadocs + TanStack + shadcn'),
    ).not.toBeInTheDocument();
  });
});
