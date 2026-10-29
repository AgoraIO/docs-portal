import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterContextProvider,
} from '@tanstack/react-router';
import { act } from '@testing-library/react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, expect, it, vi } from 'vitest';
import { AppProviders } from '@/components/providers/AppProviders';
import { DocsShell } from './DocsShell';

const theme = vi.hoisted(() => ({
  resolvedTheme: undefined as string | undefined,
  setTheme: vi.fn(),
}));
vi.mock('next-themes', () => ({
  useTheme: () => theme,
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}));

afterEach(() => {
  theme.resolvedTheme = undefined;
});

it('hydrates a saved dark theme without replacing the prerendered article', async () => {
  const router = createRouter({
    routeTree: createRootRoute(),
    history: createMemoryHistory({ initialEntries: ['/en/introduction'] }),
  });
  const app = (
    <RouterContextProvider router={router}>
      <AppProviders>
        <DocsShell
          activePath="/en/introduction"
          activeTab="introduction"
          locale="en"
          localeLinks={[]}
          loadPages={async () => []}
          sidebar={[]}
          tabs={[
            {
              id: 'introduction',
              title: 'Introduction',
              url: '/en/introduction',
              icon: 'BookOpen',
            },
          ]}
          toc={[]}
        >
          <article>Keep this reference body</article>
        </DocsShell>
      </AppProviders>
    </RouterContextProvider>
  );
  const container = document.createElement('div');
  container.innerHTML = renderToString(app);
  document.body.append(container);
  const article = container.querySelector('article');
  theme.resolvedTheme = 'dark';
  const errors: unknown[] = [];
  let root!: ReturnType<typeof hydrateRoot>;
  try {
    await act(async () => {
      root = hydrateRoot(container, app, {
        onRecoverableError: (error) => errors.push(error),
      });
    });
    expect(errors).toEqual([]);
    expect(container.querySelector('article')).toBe(article);
    expect(
      container.querySelector('button[aria-label="Theme: Dark"]'),
    ).not.toBeNull();
  } finally {
    await act(async () => root?.unmount());
    container.remove();
  }
});
