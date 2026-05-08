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

  it('renders the overview page in english', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <HomePage domain="overview" page="overview-home" />
      </I18nextProvider>,
    );

    expect(
      screen.getByRole('heading', { name: 'Agora Docs' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Get started' }),
    ).toBeVisible();
    expect(
      screen.getByRole('heading', { name: 'Conversational AI quickstart' }),
    ).toBeVisible();
    expect(
      screen.getByRole('link', { name: 'AI Agent' }),
    ).toHaveAttribute('href', '/?domain=ai&page=ai-home');
    expect(screen.getByText('Glossary')).toBeVisible();
    expect(screen.getByText('Security & compliance')).toBeVisible();
    expect(screen.getByText('隐私政策')).toBeVisible();
  });

  it('renders the AI domain homepage in chinese', async () => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, 'zh-CN');
    await i18n.changeLanguage('zh-CN');

    render(
      <I18nextProvider i18n={i18n}>
        <HomePage domain="ai" page="ai-home" />
      </I18nextProvider>,
    );

    expect(
      await screen.findByRole('heading', { name: '对话式 AI' }),
    ).toBeVisible();
    expect(screen.getByRole('heading', { name: '主要产品' })).toBeVisible();
    expect(screen.getByRole('heading', { name: '推荐内容结构' })).toBeVisible();
    expect(
      screen.getByRole('link', { name: '对话式 AI 快速开始' }),
    ).toHaveAttribute('href', '/?domain=ai&page=ai-quickstart');
    expect(screen.getByRole('link', { name: 'AI agent' })).toHaveAttribute(
      'href',
      '/?domain=ai&page=ai-agent',
    );
    expect(screen.getByText('隐私政策')).toBeVisible();
  });
});
