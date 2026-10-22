import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { AppProviders } from '@/components/providers/AppProviders';
import { getCnPublicRouteRewrite } from '@/lib/cn-public-routing';
import { DocsContent } from './DocsContent';

vi.mock('@/lib/site-region', async (original) => ({
  ...(await original<typeof import('@/lib/site-region')>()),
  DOCS_REGION: 'cn',
}));
vi.mock('./DocsContentBody', () => ({
  DocsContentBody: ({ contentPath }: { contentPath: string }) =>
    contentPath.endsWith('source.mdx') ? (
      <a href="/zh-CN/api-reference/recipes">打开目标文章</a>
    ) : (
      <p>目标正文</p>
    ),
}));
afterEach(() => {
  window.sessionStorage.clear();
  window.history.replaceState(null, '', '/');
});

function page(path: string, source: boolean) {
  window.history.replaceState(null, '', path);
  const root = createRootRoute();
  const route = createRoute({
    getParentRoute: () => root,
    path: '$locale/$tab/$',
    component: () => (
      <AppProviders>
        <DocsContent
          contentPath={
            source
              ? 'zh-CN/introduction/source.mdx'
              : 'zh-CN/api-reference/recipes.mdx'
          }
          locale="zh-CN"
          title={source ? '来源文章' : '目标文章'}
          toc={[]}
        />
      </AppProviders>
    ),
  });
  const router = createRouter({
    routeTree: root.addChildren([route]),
    history: createMemoryHistory({ initialEntries: [path] }),
    rewrite: getCnPublicRouteRewrite('cn'),
  });
  return render(<RouterProvider router={router} />);
}

it.each(['/introduction/source', '/zh-CN/introduction/source'])(
  'keeps the return-to-article link across mixed public/content URLs from %s',
  async (sourcePath) => {
    const source = page(sourcePath, true);
    fireEvent.click(await screen.findByRole('link', { name: '打开目标文章' }));
    source.unmount();
    page('/api-reference/recipes', false);
    const back = await screen.findByRole('link', { name: /来源文章/ });
    expect(back).toHaveAttribute('href', sourcePath);
  },
);
