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
import { docs } from '../../source.config';

export async function renderDocsMdx(source: string) {
  const configureMdx = docs.docs.mdxOptions;
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
          <Body components={getMDXComponents()} />
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
