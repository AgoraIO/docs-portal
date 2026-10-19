import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Link,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { afterEach, beforeEach, expect, it } from 'vitest';
import {
  PlatformHeaderTabs,
  PlatformPageProvider,
  PlatformPanel,
  PlatformTabsGroup,
} from '@/components/mdx/PlatformTabsGroup';
import { i18n } from '@/lib/i18n/i18n';
import {
  PLATFORM_PREFERENCE_STORAGE_KEY,
  type PlatformKey,
} from '@/lib/platforms/registry';
import { DocsContent } from './DocsContent';

// Use the real page platform owner, header, MDX panels, and badge consumer.
// Navigation changes only the supplied page's available platforms.
const pagePlatforms = {
  supported: '["android","ios"]',
  restricted: '["android","web"]',
};

function FixturePage({
  initialPlatform,
  name,
}: {
  initialPlatform?: PlatformKey;
  name: keyof typeof pagePlatforms;
}) {
  const platforms = pagePlatforms[name];
  return (
    <PlatformPageProvider
      canonicalPlatform="android"
      defaultPlatform="android"
      initialPlatform={initialPlatform}
      platforms={platforms}
    >
      <DocsContent
        locale="zh-CN"
        title="Platform example"
        titlePlatforms={['android']}
        toc={[]}
      />
      <PlatformHeaderTabs
        canonicalPlatform="android"
        defaultPlatform="android"
        initialPlatform={initialPlatform}
        platforms={platforms}
      />
      <PlatformTabsGroup
        canonicalPlatform="android"
        defaultPlatform="android"
        groupMode="structured"
        initialPlatform={initialPlatform}
        platforms={platforms}
        tabsPlacement="header"
      >
        <PlatformPanel platform="android">Android instructions</PlatformPanel>
        {name === 'supported' ? (
          <PlatformPanel platform="ios">iOS instructions</PlatformPanel>
        ) : (
          <PlatformPanel platform="web">Web instructions</PlatformPanel>
        )}
      </PlatformTabsGroup>
    </PlatformPageProvider>
  );
}

function createNavigation(initialEntry = '/zh-CN/solutions/supported') {
  const rootRoute = createRootRoute({
    component: () => (
      <>
        <nav>
          {[
            ['supported', 'Supported page'],
            ['restricted', 'Restricted page'],
            ['overview', 'Overview'],
            ['ios', 'Explicit iOS page'],
          ].map(([page, label]) => (
            <Link
              key={page}
              params={{ locale: 'zh-CN', tab: 'solutions', _splat: page }}
              to="/$locale/$tab/$"
            >
              {label}
            </Link>
          ))}
        </nav>
        <Outlet />
      </>
    ),
  });
  const pageRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/zh-CN/solutions/$page',
    component: () => {
      const { page } = pageRoute.useParams();
      return page === 'overview' ? (
        <h1>Overview</h1>
      ) : (
        <FixturePage
          initialPlatform={page === 'ios' ? 'ios' : undefined}
          name={page === 'restricted' ? 'restricted' : 'supported'}
        />
      );
    },
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([pageRoute]),
    history: createMemoryHistory({
      initialEntries: [initialEntry],
    }),
  });
  render(
    <I18nextProvider i18n={i18n}>
      <RouterProvider router={router} />
    </I18nextProvider>,
  );
  return router;
}

beforeEach(() => {
  window.localStorage.clear();
  delete document.documentElement.dataset.docsPlatform;
  window.history.replaceState({}, '', '/zh-CN/solutions/supported');
});

afterEach(cleanup);

it('restores iOS tab, badge and MDX body after fallback and a non-platform page', async () => {
  window.localStorage.setItem(PLATFORM_PREFERENCE_STORAGE_KEY, 'ios');
  const router = createNavigation();
  await act(() => router.load());
  expect(screen.getByRole('tab', { name: 'iOS' })).toHaveAttribute(
    'aria-selected',
    'true',
  );

  fireEvent.click(screen.getByRole('link', { name: 'Restricted page' }));
  await screen.findByRole('tab', { name: 'Web' });
  expect(screen.getByLabelText('适用平台')).toHaveTextContent('Android');
  expect(screen.getByText('Android instructions')).toBeVisible();
  expect(window.localStorage.getItem(PLATFORM_PREFERENCE_STORAGE_KEY)).toBe(
    'ios',
  );

  fireEvent.click(screen.getByRole('link', { name: 'Overview' }));
  await screen.findByRole('heading', { name: 'Overview' });
  fireEvent.click(screen.getByRole('link', { name: 'Supported page' }));
  const iosTab = await screen.findByRole('tab', { name: 'iOS' });
  expect(iosTab).toHaveAttribute('aria-selected', 'true');
  expect(screen.getByLabelText('适用平台')).toHaveTextContent('iOS');
  expect(screen.getByText('iOS instructions')).toBeVisible();
  expect(screen.getByText('Android instructions')).not.toBeVisible();
  expect(window.localStorage.getItem(PLATFORM_PREFERENCE_STORAGE_KEY)).toBe(
    'ios',
  );
});

it('restores a saved preference when a reused page adds support for it', async () => {
  window.localStorage.setItem(PLATFORM_PREFERENCE_STORAGE_KEY, 'ios');
  const router = createNavigation('/zh-CN/solutions/restricted');
  await act(() => router.load());
  expect(screen.getByRole('tab', { name: 'Android' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  fireEvent.click(screen.getByRole('link', { name: 'Supported page' }));
  const iosTab = await screen.findByRole('tab', { name: 'iOS' });
  expect(iosTab).toHaveAttribute('aria-selected', 'true');
  expect(screen.getByLabelText('适用平台')).toHaveTextContent('iOS');
  expect(screen.getByText('iOS instructions')).toBeVisible();
  expect(screen.getByText('Android instructions')).not.toBeVisible();
  expect(window.localStorage.getItem(PLATFORM_PREFERENCE_STORAGE_KEY)).toBe(
    'ios',
  );
});

it('saves an explicit click on the fallback platform instead of the old preference', async () => {
  window.localStorage.setItem(PLATFORM_PREFERENCE_STORAGE_KEY, 'ios');
  const router = createNavigation('/zh-CN/solutions/restricted');
  await act(() => router.load());
  fireEvent.click(screen.getByRole('tab', { name: 'Android' }));
  expect(window.localStorage.getItem(PLATFORM_PREFERENCE_STORAGE_KEY)).toBe(
    'android',
  );
  fireEvent.click(screen.getByRole('link', { name: 'Supported page' }));
  await screen.findByRole('tab', { name: 'iOS' });
  expect(screen.getByRole('tab', { name: 'Android' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  expect(screen.getByLabelText('适用平台')).toHaveTextContent('Android');
  expect(screen.getByText('Android instructions')).toBeVisible();
  expect(screen.getByText('iOS instructions')).not.toBeVisible();
});

it('uses an explicit route platform ahead of the saved preference', async () => {
  window.localStorage.setItem(PLATFORM_PREFERENCE_STORAGE_KEY, 'android');
  const router = createNavigation();
  await act(() => router.load());
  fireEvent.click(screen.getByRole('link', { name: 'Explicit iOS page' }));
  await screen.findByRole('tab', { name: 'iOS', selected: true });
  expect(screen.getByLabelText('适用平台')).toHaveTextContent('iOS');
  expect(screen.getByText('iOS instructions')).toBeVisible();
  expect(screen.getByText('Android instructions')).not.toBeVisible();
  expect(window.localStorage.getItem(PLATFORM_PREFERENCE_STORAGE_KEY)).toBe(
    'ios',
  );
});
