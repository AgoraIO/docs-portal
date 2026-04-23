import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { afterEach } from 'vitest';
import { i18n } from '@/lib/i18n/i18n';
import { HomePage } from './HomePage';

describe('HomePage', () => {
  afterEach(async () => {
    await i18n.changeLanguage('en');
  });

  it('renders the editorial landing copy in english', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <HomePage />
      </I18nextProvider>,
    );

    expect(
      screen.getByRole('heading', {
        name: 'Build with Shengwang through a calmer, editorial docs experience',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: 'Open documentation',
      }),
    ).toHaveAttribute('href', '/docs');
  });

  it('renders the editorial landing copy in chinese', async () => {
    await i18n.changeLanguage('zh-CN');

    render(
      <I18nextProvider i18n={i18n}>
        <HomePage />
      </I18nextProvider>,
    );

    expect(
      screen.getByRole('heading', {
        name: '用更克制、更有编辑感的方式阅读声网开发文档',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: '进入文档',
      }),
    ).toHaveAttribute('href', '/docs');
  });
});
