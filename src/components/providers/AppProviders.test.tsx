import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router';
import { render, screen } from '@testing-library/react';
import { useTheme } from 'next-themes';
import { useTranslation } from 'react-i18next';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '@/lib/i18n/i18n';
import { LOCALE_STORAGE_KEY } from '@/lib/i18n/i18n-config';
import { AppProviders } from './AppProviders';

function ProviderProbe() {
  const { i18n, t } = useTranslation('common');
  const theme = useTheme();

  return (
    <div
      data-language={i18n.language}
      data-theme-count={theme.themes.length}
      data-testid="provider-probe"
    >
      {t('app.name')}
    </div>
  );
}

describe('AppProviders', () => {
  afterEach(async () => {
    window.localStorage.removeItem(LOCALE_STORAGE_KEY);
    document.documentElement.lang = 'en';
    await i18n.changeLanguage('en');
  });

  it('mounts the shared i18n providers with the default locale', async () => {
    const rootRoute = createRootRoute({
      component: () => <Outlet />,
    });
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: '/',
      component: () => (
        <AppProviders>
          <ProviderProbe />
        </AppProviders>
      ),
    });
    const routeTree = rootRoute.addChildren([indexRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({
        initialEntries: ['/'],
      }),
    });

    render(<RouterProvider router={router} />);

    const probe = await screen.findByTestId('provider-probe');

    expect(probe).toHaveAttribute('data-language', 'en');
    expect(probe).toHaveAttribute('data-theme-count', '3');
    expect(probe).toHaveTextContent('Agora Docs');
  });

  it('syncs the document language with the active locale', async () => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, 'zh-CN');

    const rootRoute = createRootRoute({
      component: () => <Outlet />,
    });
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: '/',
      component: () => (
        <AppProviders>
          <ProviderProbe />
        </AppProviders>
      ),
    });
    const routeTree = rootRoute.addChildren([indexRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({
        initialEntries: ['/'],
      }),
    });

    render(<RouterProvider router={router} />);

    await screen.findByTestId('provider-probe');

    expect(document.documentElement).toHaveAttribute('lang', 'zh-CN');
  });
});
