import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router';
import { render, screen } from '@testing-library/react';
import type { AnchorHTMLAttributes, ComponentType, ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { getMDXComponents } from './mdx';

type AnchorComponent = ComponentType<
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    children: ReactNode;
    href: string;
  }
>;

function renderWithMdxRouter(children: ReactNode, initialEntry: string) {
  const rootRoute = createRootRoute({ component: () => <Outlet /> });
  const component = () => children;
  const docsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/$locale/$tab/$',
    component,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([docsRoute]),
    history: createMemoryHistory({ initialEntries: [initialEntry] }),
  });

  return render(<RouterProvider router={router} />);
}

describe('legacy MDX API anchors', () => {
  it('preserves Objective-C double-slash fragments in the rendered href', async () => {
    const href =
      '/zh-CN/api-reference/whiteboard/whiteboard-sdk/ios/classes/white-displayer#//api/name/addHighFrequencyEventListener:fireInterval:';
    const components = getMDXComponents(undefined, {
      contentPath:
        'zh-CN/api-reference/whiteboard/whiteboard-sdk/ios/classes/white-displayer.mdx',
    });
    const Anchor = components.a as AnchorComponent;

    renderWithMdxRouter(
      <Anchor href={href}>addHighFrequencyEventListener</Anchor>,
      '/zh-CN/api-reference/whiteboard/whiteboard-sdk/ios/classes/white-displayer',
    );

    expect(
      await screen.findByRole('link', {
        name: 'addHighFrequencyEventListener',
      }),
    ).toHaveAttribute('href', href);
  });
});
