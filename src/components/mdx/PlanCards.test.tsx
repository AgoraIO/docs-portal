import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import type { ComponentType, ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { getMDXComponents } from '../mdx';
import { PlanCards, type PlanCardsProps, PricingCards } from './PlanCards';

const samplePlans = [
  {
    accent: 'blue' as const,
    cta: {
      href: '/zh-CN/realtime-media/rtm/reference/billing/billing-strategy',
      label: '查看计费说明',
    },
    description: '免费体验产品能力',
    features: ['每月消息数额度', '峰值连接数额度'],
    name: '体验套餐',
  },
  {
    accent: 'green' as const,
    badge: '推荐',
    description: '适合业务增长阶段',
    features: ['灵活选择套餐', '服务支持和 SLA 保障'],
    name: '自助套餐',
  },
  {
    accent: 'purple' as const,
    description: '适合高服务支持需求项目',
    features: ['架构指导', '用量折扣与合规支持'],
    name: '企业套餐',
  },
];

type PlanCardsComponent = ComponentType<PlanCardsProps>;

function renderWithDocsRouter(
  children: ReactNode,
  initialEntry = '/zh-CN/realtime-media/rtm',
) {
  const rootRoute = createRootRoute({
    component: () => (
      <>
        {children}
        <Outlet />
      </>
    ),
  });
  const docsIndexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/$locale/$tab',
    component: Outlet,
  });
  const docsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/$locale/$tab/$',
    component: Outlet,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([docsIndexRoute, docsRoute]),
    history: createMemoryHistory({
      initialEntries: [initialEntry],
    }),
  });

  return {
    router,
    ...render(<RouterProvider router={router} />),
  };
}

describe('PlanCards', () => {
  it('renders plan content and routes docs CTAs through TanStack Router', async () => {
    const { router } = renderWithDocsRouter(<PlanCards plans={samplePlans} />);

    expect(
      await screen.findByRole('heading', { name: '体验套餐' }),
    ).toBeInTheDocument();
    expect(screen.getByText('推荐')).toBeInTheDocument();
    expect(screen.getByText('服务支持和 SLA 保障')).toBeInTheDocument();
    const cta = await screen.findByRole('link', { name: '查看计费说明' });
    expect(cta).toHaveAttribute(
      'href',
      '/zh-CN/realtime-media/rtm/reference/billing/billing-strategy',
    );
    expect(screen.getAllByText('✓')).toHaveLength(6);

    await act(async () => {
      fireEvent.click(cta);
    });

    await waitFor(() => {
      expect(router.state.location.pathname).toBe(
        '/zh-CN/realtime-media/rtm/reference/billing/billing-strategy',
      );
    });
  });

  it('uses responsive three-column layout outside prose styling', () => {
    const { container } = render(
      <PlanCards plans={samplePlans.map(({ cta, ...plan }) => plan)} />,
    );

    expect(container.firstElementChild).toHaveClass('grid-cols-1');
    expect(container.firstElementChild).toHaveClass('md:grid-cols-3');
    expect(container.firstElementChild).toHaveClass('not-prose');
    expect(container.firstElementChild).toHaveAttribute(
      'data-plan-card-count',
      '3',
    );
  });

  it('supports ReactNode content without duplicate key warnings', () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    render(
      <PlanCards
        plans={[
          {
            description: <span>免费体验产品能力</span>,
            features: [<span key="a">每月消息数额度</span>],
            name: <span>体验套餐</span>,
          },
          {
            description: <span>适合业务增长阶段</span>,
            features: [<span key="b">服务支持和 SLA 保障</span>],
            name: <span>自助套餐</span>,
          },
        ]}
      />,
    );

    expect(screen.getByText('体验套餐')).toBeInTheDocument();
    expect(consoleError.mock.calls.flat().join('\n')).not.toContain('same key');
    consoleError.mockRestore();
  });

  it('keeps hash and external CTAs as raw anchors', () => {
    render(
      <PlanCards
        plans={[
          {
            cta: { href: '#billing', label: 'Jump' },
            features: ['Hash links stay raw'],
            name: 'Hash plan',
          },
          {
            cta: { href: 'https://example.com/pricing', label: 'External' },
            features: ['External links stay raw'],
            name: 'External plan',
          },
        ]}
      />,
    );

    expect(screen.getByRole('link', { name: 'Jump' })).toHaveAttribute(
      'href',
      '#billing',
    );
    expect(screen.getByRole('link', { name: 'External' })).toHaveAttribute(
      'href',
      'https://example.com/pricing',
    );
  });

  it('normalizes relative CTA links from the shared MDX component registry', async () => {
    const components = getMDXComponents(undefined, {
      contentPath: 'zh-CN/realtime-media/rtm/index.mdx',
    });
    const RegistryPlanCards = components.PlanCards as PlanCardsComponent;
    const RegistryPricingCards = components.PricingCards as PlanCardsComponent;

    expect(RegistryPlanCards).not.toBe(PlanCards);
    expect(RegistryPricingCards).not.toBe(PricingCards);

    const { router } = renderWithDocsRouter(
      <RegistryPlanCards
        plans={[
          {
            cta: {
              href: 'reference/billing/billing-strategy#billing-details',
              label: 'Relative CTA',
            },
            features: ['Relative doc links normalize from MDX context'],
            name: 'Relative plan',
          },
        ]}
      />,
    );

    const link = await screen.findByRole('link', { name: 'Relative CTA' });

    expect(link).toHaveAttribute(
      'href',
      '/zh-CN/realtime-media/rtm/reference/billing/billing-strategy#billing-details',
    );

    await act(async () => {
      fireEvent.click(link);
    });

    await waitFor(() => {
      expect(router.state.location.pathname).toBe(
        '/zh-CN/realtime-media/rtm/reference/billing/billing-strategy',
      );
      expect(router.state.location.hash).toBe('billing-details');
    });
  });
});
