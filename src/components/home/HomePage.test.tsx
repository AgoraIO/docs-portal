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

  it('renders the knowledge-system landing copy in english', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <HomePage />
      </I18nextProvider>,
    );

    expect(
      screen.getByRole('heading', {
        name: "Agora's next-generation knowledge system",
      }),
    ).toBeInTheDocument();
    expect(
      screen
        .getByRole('heading', {
          name: "Agora's next-generation knowledge system",
        })
        .getAttribute('style'),
    ).toContain('font-family: var(--font-display)');
    expect(
      screen
        .getByRole('heading', {
          name: "Agora's next-generation knowledge system",
        })
        .getAttribute('style'),
    ).toContain('line-height: 0.92');
    expect(
      screen.getByRole('link', {
        name: 'Open docs',
      }),
    ).toHaveAttribute('href', '/docs');
    expect(
      screen.getByRole('heading', {
        name: 'Wiki',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: 'Tools',
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByText('Doc MCP')).toHaveLength(2);
  });

  it('renders the knowledge-system landing copy in chinese', async () => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, 'zh-CN');
    await i18n.changeLanguage('zh-CN');

    render(
      <I18nextProvider i18n={i18n}>
        <HomePage />
      </I18nextProvider>,
    );

    expect(
      await screen.findByRole('heading', {
        name: 'Agora 下一代知识系统',
      }),
    ).toBeInTheDocument();
    expect(
      (
        await screen.findByRole('heading', {
          name: 'Agora 下一代知识系统',
        })
      ).getAttribute('style'),
    ).toContain('font-family: var(--font-heading)');
    expect(
      (
        await screen.findByRole('heading', {
          name: 'Agora 下一代知识系统',
        })
      ).getAttribute('style'),
    ).toContain('line-height: 1.08');
    expect(
      screen.getByRole('link', {
        name: '进入文档',
      }),
    ).toHaveAttribute('href', '/docs');
    expect(
      screen.getByRole('heading', {
        name: 'Wiki',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: '工具',
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByText('Doc MCP')).toHaveLength(2);
  });
});
