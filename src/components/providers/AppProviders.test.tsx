import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router';
import { render, screen } from '@testing-library/react';
import { useI18n } from 'fumadocs-ui/contexts/i18n';
import { useTranslation } from 'react-i18next';
import { AppProviders } from './AppProviders';

function ProviderProbe() {
  const { i18n, t } = useTranslation('common');
  const fumadocsI18n = useI18n();

  return (
    <div
      data-fumadocs-language={fumadocsI18n.locale}
      data-language={i18n.language}
      data-testid="provider-probe"
    >
      {t('app.name')}
    </div>
  );
}

describe('AppProviders', () => {
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
    expect(probe).toHaveAttribute('data-fumadocs-language', 'en');
    expect(probe).toHaveTextContent('Agora Docs');
  });
});
