import { evaluate } from '@mdx-js/mdx';
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { act, render } from '@testing-library/react';
import * as runtime from 'react/jsx-runtime';
import { getMDXComponents, MDXAccordionProvider } from '@/components/mdx';
import { AppProviders } from '@/components/providers/AppProviders';
import { createDocsMdxOptions } from '@/lib/mdx/docs-preset';

export async function renderDocsMdx(
  source: string,
  locale: 'en' | 'zh-CN' = 'zh-CN',
) {
  const configureMdx = createDocsMdxOptions(
    locale === 'zh-CN' ? 'cn' : 'global',
  );
  if (typeof configureMdx !== 'function') {
    throw new Error('Expected the documentation MDX compiler configuration.');
  }
  const { default: Body } = await evaluate(source, {
    ...(await configureMdx('bundler')),
    ...runtime,
    development: false,
  });
  const rootRoute = createRootRoute({
    component: () => (
      <AppProviders>
        <MDXAccordionProvider>
          <Body components={getMDXComponents(undefined, { locale })} />
        </MDXAccordionProvider>
      </AppProviders>
    ),
  });
  const router = createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });
  await router.load();
  return act(async () => render(<RouterProvider router={router} />));
}
