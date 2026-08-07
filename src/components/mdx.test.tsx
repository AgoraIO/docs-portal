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
  within,
} from '@testing-library/react';
import * as fumadocsTabs from 'fumadocs-ui/components/tabs';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import type {
  AnchorHTMLAttributes,
  ComponentProps,
  ComponentType,
  ReactNode,
} from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PLATFORM_PREFERENCE_EVENT } from '@/lib/platforms/preference';
import {
  ApiReturns,
  ApiReturnType,
  ApiSignature,
  getMDXComponents,
  MDXAccordionProvider,
  Parameter,
  ParameterList,
} from './mdx';
import {
  PlatformHeaderTabs,
  PlatformTabsPlacementProvider,
} from './mdx/PlatformTabsGroup';

type TabsComponent = ComponentType<{
  children: ReactNode;
  defaultValue?: string;
  groupId?: string;
  items?: string[];
  persist?: boolean;
  value?: string;
}>;
type TabsChildComponent = ComponentType<{
  children: ReactNode;
  value: string;
}>;
type PlatformGroupComponent = ComponentType<{
  canonicalPlatform: string;
  children: ReactNode;
  defaultPlatform?: string;
  groupMode: 'inline' | 'structured';
  initialPlatform?: string;
  platforms: string;
  tabsPlacement?: 'inline' | 'header';
}>;
type PlatformPanelComponent = ComponentType<{
  children: ReactNode;
  platform: string;
}>;
type CalloutComponent = ComponentType<{
  children: ReactNode;
  title?: ReactNode;
  type?: 'info';
}>;
type CalloutContainerComponent = ComponentType<{
  children: ReactNode;
  type?: 'info';
}>;
type CalloutTitleComponent = ComponentType<{
  children: ReactNode;
}>;
type CodeBlockPreComponent = ComponentType<{
  children: ReactNode;
  className?: string;
  title?: string;
  'data-line-numbers'?: boolean;
  'data-line-numbers-start'?: number | string;
}>;
type AnchorComponent = ComponentType<
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    children: ReactNode;
    href: string;
  }
>;
type ImageComponent = ComponentType<{
  alt?: string;
  src?: string;
}>;
type TableComponent = ComponentType<ComponentProps<'table'>>;
type LegacyLinkComponent = ComponentType<{
  children: ReactNode;
  to: string;
}>;
type CardComponent = ComponentType<{
  description?: ReactNode;
  href?: string;
  title: ReactNode;
}>;
type AccordionsComponent = ComponentType<{
  children: ReactNode;
  defaultValue?: string;
}>;
type AccordionComponent = ComponentType<{
  children: ReactNode;
  title: ReactNode;
  value?: string;
}>;
type HeadingComponent = ComponentType<{
  children: ReactNode;
  id?: string;
}>;
type ParameterListComponent = ComponentType<{
  children: ReactNode;
  nullable?: boolean;
  optional?: boolean;
  required?: boolean;
  title?: ReactNode;
  variant?: 'cards' | 'table';
}>;
type ParameterComponent = ComponentType<{
  children?: ReactNode;
  defaultValue?: ReactNode;
  direction?: ReactNode;
  name?: ReactNode;
  nullable?: boolean;
  optional?: boolean;
  possibleValues?: ReactNode;
  required?: boolean;
  type?: ReactNode;
}>;
type ParameterTypeComponent = ComponentType<{
  children: ReactNode;
}>;
type ApiSignatureComponent = ComponentType<{
  children: ReactNode;
  labels?: string;
}>;
type ApiReturnsComponent = ComponentType<{
  children: ReactNode;
  title?: ReactNode;
}>;
type ApiReturnTypeComponent = ComponentType<{
  children: ReactNode;
}>;

function createStorageMock(): Storage {
  const values = new Map<string, string>();

  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => Array.from(values.keys()).at(index) ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(key, value),
  };
}

function renderWithMdxRouter(children: ReactNode, initialEntry = '/en/ai') {
  const rootRoute = createRootRoute({
    component: () => <Outlet />,
  });
  const component = () => children;
  const docsIndexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/$locale/$tab',
    component,
  });
  const docsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/$locale/$tab/$',
    component,
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

function createRect(width: number, height = 48): DOMRect {
  return {
    bottom: height,
    height,
    left: 0,
    right: width,
    top: 0,
    width,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  } as DOMRect;
}

function mockPlatformHeaderMeasurements({
  availableWidth,
  moreButtonWidth = 64,
  tabWidths,
}: {
  availableWidth: number;
  moreButtonWidth?: number;
  tabWidths: Record<string, number>;
}) {
  const originalGetBoundingClientRect =
    window.HTMLElement.prototype.getBoundingClientRect;

  return vi
    .spyOn(window.HTMLElement.prototype, 'getBoundingClientRect')
    .mockImplementation(function getBoundingClientRect(this: HTMLElement) {
      const measuredPlatform = this.dataset.platformTabMeasure;

      if (this.dataset.platformHeaderTabs === 'true') {
        return createRect(availableWidth);
      }

      if (this.dataset.platformMoreMeasure === 'true') {
        return createRect(moreButtonWidth);
      }

      if (measuredPlatform) {
        return createRect(tabWidths[measuredPlatform] ?? 0);
      }

      return originalGetBoundingClientRect.call(this);
    });
}

describe('common MDX registry', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/en/introduction/about-agora');

    const localStorage = createStorageMock();
    const sessionStorage = createStorageMock();

    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: localStorage,
    });
    Object.defineProperty(window, 'sessionStorage', {
      configurable: true,
      value: sessionStorage,
    });
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: localStorage,
    });
    Object.defineProperty(globalThis, 'sessionStorage', {
      configurable: true,
      value: sessionStorage,
    });
  });

  it('uses Fumadocs MDX defaults except for repo-specific interactive components', () => {
    const components = getMDXComponents() as Record<string, unknown>;
    const defaults = defaultMdxComponents as Record<string, unknown>;

    expect(components.img).not.toBe(defaults.img);
    expect(components.table).not.toBe(defaults.table);
    expect(components.Card).not.toBe(defaults.Card);
    expect(components.Cards).not.toBe(defaults.Cards);
    expect(components.Callout).not.toBe(defaults.Callout);
    expect(components.CalloutContainer).not.toBe(defaults.CalloutContainer);

    expect(components.a).not.toBe(defaults.a);
    expect(components.CommandBlock).toBeDefined();
    expect(components.CommandBlock).not.toBe(defaults.CommandBlock);

    expect(components.Accordion).toBeDefined();
    expect(components.Accordions).not.toBe(defaults.Accordions);
    expect(components.pre).not.toBe(defaults.pre);
    expect(components.CodeBlockTabs).not.toBe(defaults.CodeBlockTabs);
    expect(components.CodeBlockTabsList).not.toBe(defaults.CodeBlockTabsList);
    expect(components.CodeBlockTabsTrigger).toBe(defaults.CodeBlockTabsTrigger);
    expect(components.CodeBlockTab).not.toBe(defaults.CodeBlockTab);
    expect(components.h1).toBe(defaults.h1);
    expect(components.h2).not.toBe(defaults.h2);
    expect(components.h3).not.toBe(defaults.h3);

    expect(components.Tabs).not.toBe(fumadocsTabs.Tabs);
    expect(components.Tab).toBe(fumadocsTabs.Tab);
    expect(components.TabsList).toBe(fumadocsTabs.TabsList);
    expect(components.TabsTrigger).toBe(fumadocsTabs.TabsTrigger);
    expect(components.TabsContent).not.toBe(fumadocsTabs.TabsContent);
  });

  it('describes overflowing prose tables and exposes a pre-scroll cue', async () => {
    const components = getMDXComponents(undefined, { locale: 'zh-CN' });
    const Table = components.table as TableComponent;

    render(
      <Table>
        <tbody>
          <tr>
            <td>第一列</td>
            <td>第二列</td>
            <td>第三列</td>
          </tr>
        </tbody>
      </Table>,
    );

    const scrollRegion = screen.getByRole('region', {
      name: '可横向滚动的表格',
    });
    Object.defineProperties(scrollRegion, {
      clientWidth: { configurable: true, value: 320 },
      scrollWidth: { configurable: true, value: 640 },
    });
    fireEvent(window, new Event('resize'));

    await waitFor(() => {
      expect(scrollRegion).toHaveAttribute('tabindex', '0');
    });
    expect(scrollRegion).toHaveAccessibleDescription(
      '表格内容超出当前宽度，可横向滚动查看更多列。',
    );
    expect(scrollRegion.parentElement).toHaveAttribute(
      'data-table-overflow',
      'true',
    );
    expect(scrollRegion.parentElement).toHaveAttribute(
      'data-table-scroll-end',
      'false',
    );
  });

  it('marks SDK compliance callouts for platform download spacing', () => {
    const components = getMDXComponents();
    const CalloutContainer =
      components.CalloutContainer as CalloutContainerComponent;
    const CalloutTitle = components.CalloutTitle as CalloutTitleComponent;

    const { rerender } = render(
      <CalloutContainer type="info">
        <CalloutTitle>SDK 合规信息公示</CalloutTitle>
        合规说明
      </CalloutContainer>,
    );

    expect(document.querySelector('[data-sdk-compliance]')).toHaveAttribute(
      'data-sdk-compliance',
      'true',
    );

    rerender(
      <CalloutContainer type="info">
        <CalloutTitle>信息</CalloutTitle>
        普通说明
      </CalloutContainer>,
    );

    expect(screen.getByText('普通说明')).toBeInTheDocument();
    expect(document.querySelector('[data-sdk-compliance]')).toBeNull();
  });

  it('marks direct SDK compliance callouts for platform download spacing', () => {
    const components = getMDXComponents();
    const Callout = components.Callout as CalloutComponent;

    render(
      <Callout title="SDK 合规信息公示" type="info">
        合规说明
      </Callout>,
    );

    expect(document.querySelector('[data-sdk-compliance]')).toHaveAttribute(
      'data-sdk-compliance',
      'true',
    );
  });

  it('opens MDX images in a zoom dialog', async () => {
    const components = getMDXComponents();
    const Image = components.img as ImageComponent;

    render(
      <Image
        alt="Product Architecture"
        src="https://assets-docs.agora.io/images/product.png"
      />,
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Zoom image: Product Architecture',
      }),
    );

    const dialog = await screen.findByRole('dialog');

    expect(dialog).toHaveTextContent('Product Architecture');
    expect(dialog).toHaveTextContent('Enlarged documentation image preview.');
    const previewImage = within(dialog).getByRole('img', {
      name: 'Product Architecture',
    });

    expect(previewImage).toHaveAttribute(
      'src',
      'https://assets-docs.agora.io/images/product.png',
    );
    expect(dialog).toHaveClass('w-fit');
    expect(dialog).not.toHaveClass('w-full');
    expect(dialog).toHaveClass('justify-items-center');
  });

  it('routes normalized relative docs links through TanStack Router', async () => {
    const components = getMDXComponents(undefined, {
      contentPath: 'en/ai/index.md',
    });
    const Anchor = components.a as AnchorComponent;

    const { router } = renderWithMdxRouter(
      <Anchor href="get-started/quickstart.md">Quickstart</Anchor>,
    );

    const link = await screen.findByRole('link', { name: 'Quickstart' });

    expect(link).toHaveAttribute('href', '/en/ai/get-started/quickstart');
    await act(async () => {
      fireEvent.click(link);
    });

    await waitFor(() => {
      expect(router.state.location.pathname).toBe(
        '/en/ai/get-started/quickstart',
      );
    });
  });

  it('routes normalized root docs links through TanStack Router', async () => {
    const components = getMDXComponents(undefined, {
      contentPath: 'en/ai/index.md',
    });
    const Anchor = components.a as AnchorComponent;

    const { router } = renderWithMdxRouter(
      <Anchor href="/api-reference">API reference</Anchor>,
    );

    const link = await screen.findByRole('link', { name: 'API reference' });

    expect(link).toHaveAttribute('href', '/en/api-reference');
    await act(async () => {
      fireEvent.click(link);
    });

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/en/api-reference');
    });
  });

  it('keeps external markdown links compatible with standard anchors', () => {
    const components = getMDXComponents(undefined, {
      contentPath: 'en/ai/index.md',
    });
    const Anchor = components.a as AnchorComponent;

    render(<Anchor href="https://example.com/page.md">External</Anchor>);

    expect(screen.getByRole('link', { name: 'External' })).toHaveAttribute(
      'href',
      'https://example.com/page.md',
    );
  });

  it('keeps hash-only and opted-out links compatible with standard anchors', () => {
    const components = getMDXComponents(undefined, {
      contentPath: 'en/ai/index.md',
    });
    const Anchor = components.a as AnchorComponent;

    render(
      <>
        <Anchor href="#overview">Overview</Anchor>
        <Anchor href="get-started/quickstart.md" target="_blank">
          Targeted quickstart
        </Anchor>
        <Anchor download href="/downloads/sdk.zip">
          Download SDK
        </Anchor>
      </>,
    );

    expect(screen.getByRole('link', { name: 'Overview' })).toHaveAttribute(
      'href',
      '#overview',
    );
    expect(
      screen.getByRole('link', { name: 'Targeted quickstart' }),
    ).toHaveAttribute('href', '/en/ai/get-started/quickstart');
    expect(
      screen.getByRole('link', { name: 'Targeted quickstart' }),
    ).toHaveAttribute('target', '_blank');
    expect(screen.getByRole('link', { name: 'Download SDK' })).toHaveAttribute(
      'href',
      '/downloads/sdk.zip',
    );
    expect(screen.getByRole('link', { name: 'Download SDK' })).toHaveAttribute(
      'download',
    );
  });

  it('routes legacy MDX Link components through TanStack Router', async () => {
    const components = getMDXComponents(undefined, {
      contentPath: 'en/realtime-media/broadcast-streaming/build/index.mdx',
    });
    const Link = components.Link as LegacyLinkComponent;

    const { router } = renderWithMdxRouter(
      <Link to="../index.mdx">SDK quickstart</Link>,
      '/en/realtime-media/broadcast-streaming/build',
    );

    const link = await screen.findByRole('link', { name: 'SDK quickstart' });

    expect(link).toHaveAttribute(
      'href',
      '/en/realtime-media/broadcast-streaming',
    );
    await act(async () => {
      fireEvent.click(link);
    });

    await waitFor(() => {
      expect(router.state.location.pathname).toBe(
        '/en/realtime-media/broadcast-streaming',
      );
    });
  });

  it('routes normalized docs card links through TanStack Router', async () => {
    const components = getMDXComponents(undefined, {
      contentPath: 'en/ai/index.md',
    });
    const Card = components.Card as CardComponent;

    const { router } = renderWithMdxRouter(
      <Card
        description="Build and run a working voice agent in under 15 minutes."
        href="choose-your-path/quickstart-coding.mdx"
        title="Quickstart"
      />,
    );

    const card = await screen.findByRole('link', { name: /Quickstart/i });

    expect(card).toHaveAttribute(
      'href',
      '/en/ai/choose-your-path/quickstart-coding',
    );
    expect(card).toHaveClass('docs-card-link');
    await act(async () => {
      fireEvent.click(card);
    });

    await waitFor(() => {
      expect(router.state.location.pathname).toBe(
        '/en/ai/choose-your-path/quickstart-coding',
      );
    });
  });

  it('keeps only one MDX accordion open across separate roots', () => {
    const components = getMDXComponents();
    const Accordions = components.Accordions as AccordionsComponent;
    const Accordion = components.Accordion as AccordionComponent;

    render(
      <MDXAccordionProvider>
        <Accordions>
          <Accordion title="First dropdown">First body</Accordion>
        </Accordions>
        <Accordions>
          <Accordion title="Second dropdown">Second body</Accordion>
        </Accordions>
      </MDXAccordionProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'First dropdown' }));
    expect(screen.getByText('First body')).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Second dropdown' }));

    expect(screen.queryByText('First body')).not.toBeInTheDocument();
    expect(screen.getByText('Second body')).toBeVisible();
  });

  it('keeps default-open MDX accordions collapsible in shared page state', () => {
    const components = getMDXComponents();
    const Accordions = components.Accordions as AccordionsComponent;
    const Accordion = components.Accordion as AccordionComponent;

    render(
      <MDXAccordionProvider>
        <Accordions defaultValue="default-open">
          <Accordion title="Default open" value="default-open">
            Default body
          </Accordion>
        </Accordions>
      </MDXAccordionProvider>,
    );

    expect(screen.getByText('Default body')).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Default open' }));

    expect(screen.queryByText('Default body')).not.toBeInTheDocument();
  });

  it('renders headings with Fumadocs copy-anchor chrome', () => {
    const components = getMDXComponents();
    const Heading = components.h2 as HeadingComponent;

    render(<Heading id="install">Install Agora skills</Heading>);

    const heading = screen.getByRole('heading', {
      level: 2,
      name: 'Install Agora skills',
    });

    expect(heading).toHaveAttribute('id', 'install');
    expect(
      within(heading).getByRole('button', { name: /copy anchor/i }),
    ).toBeInTheDocument();
    expect(within(heading).getByRole('link')).toHaveAttribute(
      'href',
      '#install',
    );
  });

  it('uses Fumadocs tabs for normal MDX tabs', () => {
    const components = getMDXComponents();

    expect(components.Tabs).not.toBe(fumadocsTabs.Tabs);
    expect(components.Tab).toBe(fumadocsTabs.Tab);
    expect(components.TabsList).toBe(fumadocsTabs.TabsList);
    expect(components.TabsTrigger).toBe(fumadocsTabs.TabsTrigger);
    expect(components.TabsContent).not.toBe(fumadocsTabs.TabsContent);
  });

  it('renders structured parameter lists with nested fields and badges', () => {
    const components = getMDXComponents() as Record<string, unknown>;
    const ParameterList = components.ParameterList as ParameterListComponent;
    const Parameter = components.Parameter as ParameterComponent;
    const ParameterType = components.ParameterType as ParameterTypeComponent;

    render(
      <ParameterList title="params" required>
        <Parameter name="language" required type="string">
          Recognition language.
        </Parameter>
        <Parameter name="model" required={false} type="string">
          Recognition model.
        </Parameter>
        <Parameter
          defaultValue="{}"
          direction="[in]"
          name="metadata"
          optional
          possibleValues="provider-specific object"
        >
          <p>Provider-specific metadata.</p>
          <ParameterType>
            <a href="/en/api-reference/metadata">MetadataSchema</a>
          </ParameterType>
          <ParameterList nullable>
            <Parameter name="metadata.request_id" nullable type="string">
              Optional request identifier.
            </Parameter>
          </ParameterList>
        </Parameter>
      </ParameterList>,
    );

    expect(screen.getByText('params')).toBeVisible();
    expect(screen.getByText('language')).toBeVisible();
    expect(screen.getAllByText('string')).toHaveLength(3);
    expect(screen.getAllByText('required')).toHaveLength(2);
    expect(screen.getByText('model')).toBeVisible();
    expect(screen.getByText('metadata')).toBeVisible();
    expect(screen.getByText('[in]')).toBeVisible();
    expect(
      screen.getByRole('link', { name: 'MetadataSchema' }),
    ).toHaveAttribute('href', '/en/api-reference/metadata');
    expect(screen.getAllByText('optional')).toHaveLength(2);
    expect(screen.getByText('Default value')).toBeVisible();
    expect(screen.getByText('{}')).toBeVisible();
    expect(screen.getByText('Possible values')).toBeVisible();
    expect(screen.getByText('provider-specific object')).toBeVisible();
    expect(screen.getByText('metadata.request_id')).toBeVisible();
    expect(screen.getAllByText('nullable')).toHaveLength(2);
    expect(screen.getByText('Optional request identifier.')).toBeVisible();
  });

  it('renders API signatures and return values as scroll-safe rich blocks', () => {
    const components = getMDXComponents() as Record<string, unknown>;
    const Signature = components.ApiSignature as ApiSignatureComponent;
    const Returns = components.ApiReturns as ApiReturnsComponent;
    const ReturnType = components.ApiReturnType as ApiReturnTypeComponent;

    render(
      <>
        <Signature labels="extern static">
          <p>
            onPodium(userUuid: string, source?:{' '}
            <a href="/zh-CN/api-reference/podium-source">PodiumSource</a>):{' '}
            Promise&lt;void&gt;
          </p>
        </Signature>
        <Returns>
          <ReturnType>
            <p>
              Promise&lt;
              <a href="/zh-CN/api-reference/podium-result">PodiumResult</a>
              &gt;
            </p>
          </ReturnType>
          <p>上台操作完成后的结果。</p>
        </Returns>
      </>,
    );

    const signature = screen
      .getByText(/onPodium\(userUuid/)
      .closest('[data-api-signature]');
    const returns = screen.getByText('Returns').closest('[data-api-returns]');

    expect(signature).toBeInTheDocument();
    expect(signature?.querySelector('ul')).toBeNull();
    expect(within(signature as HTMLElement).getByText('extern')).toBeVisible();
    expect(within(signature as HTMLElement).getByText('static')).toBeVisible();
    expect(
      within(signature as HTMLElement).getByRole('link', {
        name: 'PodiumSource',
      }),
    ).toHaveAttribute('href', '/zh-CN/api-reference/podium-source');
    expect(returns).toHaveTextContent('Promise<PodiumResult>');
    expect(returns).toHaveTextContent('上台操作完成后的结果。');
    expect(
      within(returns as HTMLElement).getByRole('link', {
        name: 'PodiumResult',
      }),
    ).toHaveAttribute('href', '/zh-CN/api-reference/podium-result');
  });

  it('registers platform sentinels and internal platform renderers', () => {
    const components = getMDXComponents() as Record<string, unknown>;

    expect(components.RTCMinutesCalculator).toBeDefined();
    expect(components.PlatformInline).toBeDefined();
    expect(components.PlatformStructured).toBeDefined();
    expect(components.ParameterList).toBeDefined();
    expect(components.Parameter).toBeDefined();
    expect(components.ParameterType).toBeDefined();
    expect(components.ApiSignature).toBeDefined();
    expect(components.ApiReturns).toBeDefined();
    expect(components.ApiReturnType).toBeDefined();
    expect(components._PlatformTabsGroup).toBeDefined();
    expect(components._PlatformPanel).toBeDefined();
    expect(components.Slot).toBeUndefined();
  });

  it('exports parameter components for direct MDX imports', () => {
    const components = getMDXComponents() as Record<string, unknown>;

    expect(ParameterList).toBe(components.ParameterList);
    expect(Parameter).toBe(components.Parameter);
    expect(ApiSignature).toBe(components.ApiSignature);
    expect(ApiReturns).toBe(components.ApiReturns);
    expect(ApiReturnType).toBe(components.ApiReturnType);
  });

  it('renders transformed platform groups with persisted preference fallback and hidden inactive panels', () => {
    window.localStorage.setItem('docs-portal:platform:v1', 'ios');

    const components = getMDXComponents() as Record<string, unknown>;
    const Group = components._PlatformTabsGroup as PlatformGroupComponent;
    const Panel = components._PlatformPanel as PlatformPanelComponent;

    render(
      <Group
        canonicalPlatform="web"
        groupMode="structured"
        platforms='["web","android"]'
      >
        <Panel platform="web">
          <h2 id="web-install">Install Web SDK</h2>
        </Panel>
        <Panel platform="android">
          <h2 id="android-install">Install Android SDK</h2>
        </Panel>
      </Group>,
    );

    expect(screen.getByRole('tab', { name: 'Web' })).toHaveAttribute(
      'data-state',
      'active',
    );
    expect(screen.getByRole('tab', { name: 'Android' })).toHaveAttribute(
      'data-state',
      'inactive',
    );

    const activePanel = screen
      .getByText('Install Web SDK')
      .closest('[data-platform-panel="web"]');
    const inactivePanel = screen
      .getByText('Install Android SDK')
      .closest('[data-platform-panel="android"]');

    expect(activePanel).not.toHaveAttribute('hidden');
    expect(activePanel).toHaveAttribute('aria-hidden', 'false');
    expect(inactivePanel).toHaveAttribute('hidden');
    expect(inactivePanel).toHaveAttribute('aria-hidden', 'true');
  });

  it('hides the platform tablist when a group only has one platform', () => {
    const components = getMDXComponents() as Record<string, unknown>;
    const Group = components._PlatformTabsGroup as PlatformGroupComponent;
    const Panel = components._PlatformPanel as PlatformPanelComponent;

    render(
      <Group canonicalPlatform="web" groupMode="structured" platforms='["web"]'>
        <Panel platform="web">
          <h2 id="web-only">Web Only</h2>
        </Panel>
      </Group>,
    );

    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    expect(screen.getByText('Web Only')).toBeVisible();
  });

  it('keeps structured platform tabs out of prose without excluding panel Markdown', () => {
    const components = getMDXComponents() as Record<string, unknown>;
    const Group = components._PlatformTabsGroup as PlatformGroupComponent;
    const Panel = components._PlatformPanel as PlatformPanelComponent;

    render(
      <div className="prose">
        <Group
          canonicalPlatform="web"
          groupMode="structured"
          platforms='["web","android"]'
        >
          <Panel platform="web">
            <h2>Install Web SDK</h2>
            <p>
              Use <strong>npm</strong> to install the SDK.
            </p>
          </Panel>
          <Panel platform="android">
            <h2>Install Android SDK</h2>
          </Panel>
        </Group>
      </div>,
    );

    const heading = screen.getByRole('heading', { name: 'Install Web SDK' });
    const group = heading.closest('[data-platform-group="structured"]');
    const tablist = screen.getByRole('tablist');

    expect(group).toBeInTheDocument();
    expect(heading.closest('.not-prose')).toBeNull();
    expect(tablist.closest('.not-prose')).toBeInTheDocument();
  });

  it('omits the inline platform tab shell when tabs are rendered in the header', () => {
    const components = getMDXComponents() as Record<string, unknown>;
    const Group = components._PlatformTabsGroup as PlatformGroupComponent;
    const Panel = components._PlatformPanel as PlatformPanelComponent;

    render(
      <Group
        canonicalPlatform="web"
        groupMode="structured"
        platforms='["web","android"]'
        tabsPlacement="header"
      >
        <Panel platform="web">Web instructions</Panel>
        <Panel platform="android">Android instructions</Panel>
      </Group>,
    );

    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    expect(
      screen.getByText('Web instructions').closest('section'),
    ).toBeVisible();
    expect(
      screen.getByText('Android instructions').closest('section'),
    ).not.toBeVisible();

    act(() => {
      window.dispatchEvent(
        new CustomEvent(PLATFORM_PREFERENCE_EVENT, { detail: 'android' }),
      );
    });

    expect(
      screen.getByText('Android instructions').closest('section'),
    ).toBeVisible();
    expect(
      screen.getByText('Web instructions').closest('section'),
    ).not.toBeVisible();
  });

  it('renders measured header platforms, defaults to the first platform, and moves overflow into More', async () => {
    const measurements = mockPlatformHeaderMeasurements({
      availableWidth: 320,
      tabWidths: {
        android: 70,
        flutter: 72,
        ios: 34,
        macos: 62,
        'react-native': 112,
        unity: 52,
        web: 44,
        windows: 78,
      },
    });
    const components = getMDXComponents() as Record<string, unknown>;
    const Group = components._PlatformTabsGroup as PlatformGroupComponent;
    const Panel = components._PlatformPanel as PlatformPanelComponent;

    try {
      render(
        <>
          <PlatformHeaderTabs
            canonicalPlatform="web"
            defaultPlatform="android"
            platforms='["android","ios","web","macos","windows","flutter","react-native","unity"]'
          />
          <Group
            canonicalPlatform="web"
            defaultPlatform="android"
            groupMode="structured"
            platforms='["android","ios","web","macos","windows","flutter","react-native","unity"]'
            tabsPlacement="header"
          >
            <Panel platform="android">Android instructions</Panel>
            <Panel platform="web">Web instructions</Panel>
            <Panel platform="flutter">Flutter instructions</Panel>
          </Group>
        </>,
      );

      await waitFor(() => {
        expect(screen.queryByRole('tab', { name: 'macOS' })).toBeNull();
      });

      const tablist = screen.getByRole('tablist', { name: 'Platform' });
      const headerGroup = tablist.closest('[data-platform-header-tabs="true"]');
      const moreButton = screen.getByRole('button', {
        name: 'More platforms',
      });

      expect(headerGroup).toHaveClass('flex');
      expect(headerGroup).toHaveClass('w-full');
      expect(headerGroup).toHaveClass('max-w-full');
      expect(headerGroup).toHaveClass('gap-4');
      expect(headerGroup).toHaveClass('overflow-visible');
      expect(tablist).toHaveClass('flex-1');
      expect(tablist).toHaveClass('overflow-hidden');
      expect(moreButton.parentElement).toHaveClass('relative');
      expect(moreButton.parentElement).toHaveClass('shrink-0');
      expect(moreButton).not.toHaveClass('border-l');
      expect(moreButton).not.toHaveClass('pl-6');
      expect(screen.getByRole('tab', { name: 'Android' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Android' })).toHaveAttribute(
        'aria-selected',
        'true',
      );
      expect(screen.getByRole('tab', { name: 'iOS' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Web' })).toBeInTheDocument();
      expect(screen.queryByRole('tab', { name: 'Windows' })).toBeNull();
      expect(screen.queryByRole('tab', { name: 'Flutter' })).toBeNull();

      fireEvent.click(moreButton);

      const flutterItem = await screen.findByRole('menuitem', {
        name: 'Flutter',
      });

      expect(screen.getByRole('menu')).toBeVisible();
      expect(screen.getByRole('menuitem', { name: 'macOS' })).toBeVisible();
      expect(screen.getByRole('menuitem', { name: 'Windows' })).toBeVisible();
      expect(
        screen.getByRole('menuitem', { name: 'React Native' }),
      ).toBeVisible();
      expect(
        screen.getByText('Android instructions').closest('section'),
      ).toBeVisible();
      expect(
        screen.getByText('Flutter instructions').closest('section'),
      ).not.toBeVisible();
      expect(
        screen.getByRole('button', { name: 'More platforms' }),
      ).toHaveAttribute('data-state', 'inactive');

      fireEvent.click(flutterItem);

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: 'Flutter' })).toHaveAttribute(
          'aria-selected',
          'true',
        );
      });
      expect(
        screen.getByText('Flutter instructions').closest('section'),
      ).toBeVisible();
      expect(
        screen.getByText('Android instructions').closest('section'),
      ).not.toBeVisible();
      expect(
        screen.getByRole('button', { name: 'More platforms' }),
      ).toHaveAttribute('data-state', 'inactive');

      fireEvent.click(screen.getByRole('button', { name: 'More platforms' }));

      expect(screen.queryByRole('menuitem', { name: 'Flutter' })).toBeNull();
      expect(screen.getByRole('menuitem', { name: 'macOS' })).toBeVisible();
    } finally {
      measurements.mockRestore();
    }
  });

  it('does not show More when measured header platforms all fit', async () => {
    const measurements = mockPlatformHeaderMeasurements({
      availableWidth: 400,
      tabWidths: {
        android: 70,
        flutter: 72,
        ios: 34,
        web: 44,
      },
    });

    try {
      render(
        <PlatformHeaderTabs
          canonicalPlatform="web"
          defaultPlatform="android"
          platforms='["android","ios","web","flutter"]'
        />,
      );

      await waitFor(() => {
        expect(
          screen.queryByRole('button', { name: 'More platforms' }),
        ).toBeNull();
      });

      expect(screen.getByRole('tab', { name: 'Android' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'iOS' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Web' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Flutter' })).toBeInTheDocument();
    } finally {
      measurements.mockRestore();
    }
  });

  it('uses the canonical page default before stored preference without overwriting it', () => {
    window.localStorage.setItem('docs-portal:platform:v1', 'flutter');

    render(
      <PlatformHeaderTabs
        canonicalPlatform="web"
        defaultPlatform="android"
        platforms='["android","ios","web","flutter"]'
      />,
    );

    expect(screen.getByRole('tab', { name: 'Android' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(window.localStorage.getItem('docs-portal:platform:v1')).toBe(
      'flutter',
    );
  });

  it('updates canonical page defaults when the rendered payload changes', async () => {
    const { rerender } = render(
      <PlatformHeaderTabs
        canonicalPlatform="web"
        defaultPlatform="android"
        platforms='["android","ios","web","flutter"]'
      />,
    );

    expect(screen.getByRole('tab', { name: 'Android' })).toHaveAttribute(
      'aria-selected',
      'true',
    );

    rerender(
      <PlatformHeaderTabs
        canonicalPlatform="web"
        defaultPlatform="web"
        platforms='["android","ios","web","flutter"]'
      />,
    );

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Web' })).toHaveAttribute(
        'aria-selected',
        'true',
      );
    });
  });

  it('keeps an initial overflow platform visible as a selected header tab', () => {
    const originalScrollIntoView = window.HTMLElement.prototype.scrollIntoView;
    const scrollIntoView = vi.fn();
    const measurements = mockPlatformHeaderMeasurements({
      availableWidth: 304,
      tabWidths: {
        android: 70,
        flutter: 72,
        ios: 34,
        unity: 52,
        web: 44,
      },
    });
    window.HTMLElement.prototype.scrollIntoView = scrollIntoView;

    try {
      render(
        <PlatformHeaderTabs
          canonicalPlatform="web"
          initialPlatform="flutter"
          platforms='["android","ios","web","flutter","unity"]'
        />,
      );

      expect(screen.getByRole('tab', { name: 'Flutter' })).toHaveAttribute(
        'aria-selected',
        'true',
      );
      expect(scrollIntoView).toHaveBeenCalledWith({
        block: 'nearest',
        inline: 'nearest',
      });

      fireEvent.click(screen.getByRole('button', { name: 'More platforms' }));

      expect(screen.queryByRole('menuitem', { name: 'Flutter' })).toBeNull();
      expect(screen.getByRole('menuitem', { name: 'Unity' })).toBeVisible();
    } finally {
      measurements.mockRestore();
      if (originalScrollIntoView) {
        window.HTMLElement.prototype.scrollIntoView = originalScrollIntoView;
      } else {
        delete (window.HTMLElement.prototype as Partial<HTMLElement>)
          .scrollIntoView;
      }
    }
  });

  it('shares platform preference updates across multiple rendered groups', () => {
    const components = getMDXComponents() as Record<string, unknown>;
    const Group = components._PlatformTabsGroup as PlatformGroupComponent;
    const Panel = components._PlatformPanel as PlatformPanelComponent;

    render(
      <>
        <Group
          canonicalPlatform="web"
          groupMode="structured"
          platforms='["web","android"]'
        >
          <Panel platform="web">Group 1 Web</Panel>
          <Panel platform="android">Group 1 Android</Panel>
        </Group>
        <Group
          canonicalPlatform="web"
          groupMode="inline"
          platforms='["web","android"]'
        >
          <Panel platform="web">Group 2 Web</Panel>
          <Panel platform="android">Group 2 Android</Panel>
        </Group>
      </>,
    );

    fireEvent.mouseDown(screen.getAllByRole('tab', { name: 'Android' })[0], {
      button: 0,
      ctrlKey: false,
    });

    expect(
      screen.getByText('Group 1 Android').closest('section'),
    ).toBeVisible();
    expect(
      screen.getByText('Group 2 Android').closest('section'),
    ).toBeVisible();
    expect(document.documentElement.dataset.docsPlatform).toBe('android');
  });

  it('switches structured platform panels on normal click interaction', () => {
    const components = getMDXComponents() as Record<string, unknown>;
    const Group = components._PlatformTabsGroup as PlatformGroupComponent;
    const Panel = components._PlatformPanel as PlatformPanelComponent;

    render(
      <Group
        canonicalPlatform="web"
        groupMode="structured"
        platforms='["android","web"]'
      >
        <Panel platform="android">Android instructions</Panel>
        <Panel platform="web">Web instructions</Panel>
      </Group>,
    );

    fireEvent.click(screen.getByRole('tab', { name: 'Android' }));

    expect(
      screen.getByText('Android instructions').closest('section'),
    ).toBeVisible();
    expect(
      screen.getByText('Web instructions').closest('section'),
    ).not.toBeVisible();
  });

  it('does not push URL paths for inline platform tab groups', () => {
    window.history.replaceState({}, '', '/en/ai/get-started/quickstart');

    const components = getMDXComponents() as Record<string, unknown>;
    const Group = components._PlatformTabsGroup as PlatformGroupComponent;
    const Panel = components._PlatformPanel as PlatformPanelComponent;

    render(
      <Group
        canonicalPlatform="web"
        groupMode="inline"
        platforms='["web","android"]'
      >
        <Panel platform="web">Web inline</Panel>
        <Panel platform="android">Android inline</Panel>
      </Group>,
    );

    fireEvent.click(screen.getByRole('tab', { name: 'Android' }));

    expect(window.location.pathname).toBe('/en/ai/get-started/quickstart');
    expect(screen.getByText('Android inline').closest('section')).toBeVisible();
  });

  it('uses URL platform as initial selection and pushes platform paths on tab click', () => {
    window.history.replaceState(
      {},
      '',
      '/en/realtime-media/rtc/quick-start/integrate-with-ai-tools/ios',
    );

    const components = getMDXComponents() as Record<string, unknown>;
    const Group = components._PlatformTabsGroup as PlatformGroupComponent;
    const Panel = components._PlatformPanel as PlatformPanelComponent;

    render(
      <>
        <PlatformHeaderTabs
          canonicalPlatform="web"
          initialPlatform="ios"
          platforms='["web","ios","android"]'
        />
        <Group
          canonicalPlatform="web"
          groupMode="structured"
          initialPlatform="ios"
          platforms='["web","ios","android"]'
          tabsPlacement="header"
        >
          <Panel platform="web">Web instructions</Panel>
          <Panel platform="ios">iOS instructions</Panel>
          <Panel platform="android">Android instructions</Panel>
        </Group>
      </>,
    );

    expect(screen.getByRole('tab', { name: 'iOS' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(
      screen.getByText('iOS instructions').closest('section'),
    ).toBeVisible();

    fireEvent.click(screen.getByRole('tab', { name: 'Android' }));

    expect(window.location.pathname).toBe(
      '/en/realtime-media/rtc/quick-start/integrate-with-ai-tools/android',
    );
    expect(
      screen.getByText('Android instructions').closest('section'),
    ).toBeVisible();
  });

  it('passes URL platform through the placement context to body groups', () => {
    const components = getMDXComponents() as Record<string, unknown>;
    const Group = components._PlatformTabsGroup as PlatformGroupComponent;
    const Panel = components._PlatformPanel as PlatformPanelComponent;

    render(
      <PlatformTabsPlacementProvider initialPlatform="android" value="header">
        <Group
          canonicalPlatform="web"
          groupMode="structured"
          platforms='["web","android"]'
        >
          <Panel platform="web">Web instructions</Panel>
          <Panel platform="android">Android instructions</Panel>
        </Group>
      </PlatformTabsPlacementProvider>,
    );

    expect(
      screen.getByText('Android instructions').closest('section'),
    ).toBeVisible();
    expect(
      screen.getByText('Web instructions').closest('section'),
    ).not.toBeVisible();
  });

  it('hides a body group when the URL platform is not present in that group', () => {
    const components = getMDXComponents() as Record<string, unknown>;
    const Group = components._PlatformTabsGroup as PlatformGroupComponent;
    const Panel = components._PlatformPanel as PlatformPanelComponent;

    render(
      <PlatformTabsPlacementProvider initialPlatform="web" value="header">
        <Group
          canonicalPlatform="android"
          groupMode="structured"
          platforms='["android","ios"]'
        >
          <Panel platform="android">Android-only instructions</Panel>
          <Panel platform="ios">iOS-only instructions</Panel>
        </Group>
      </PlatformTabsPlacementProvider>,
    );

    expect(
      screen.queryByText('Android-only instructions'),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('iOS-only instructions')).not.toBeInTheDocument();
  });

  it('persists platform once during a complete mouse click sequence', () => {
    const components = getMDXComponents() as Record<string, unknown>;
    const Group = components._PlatformTabsGroup as PlatformGroupComponent;
    const Panel = components._PlatformPanel as PlatformPanelComponent;
    const preferenceEvents: string[] = [];

    const handlePreferenceChange = (event: Event) => {
      if (event instanceof CustomEvent) {
        preferenceEvents.push(event.detail);
      }
    };

    window.addEventListener(PLATFORM_PREFERENCE_EVENT, handlePreferenceChange);

    try {
      render(
        <Group
          canonicalPlatform="web"
          groupMode="structured"
          platforms='["android","web"]'
        >
          <Panel platform="android">Android instructions</Panel>
          <Panel platform="web">Web instructions</Panel>
        </Group>,
      );

      const androidTab = screen.getByRole('tab', { name: 'Android' });

      fireEvent.mouseDown(androidTab, {
        button: 0,
        ctrlKey: false,
      });
      fireEvent.click(androidTab);

      expect(preferenceEvents).toEqual(['android']);
      expect(window.localStorage.getItem('docs-portal:platform:v1')).toBe(
        'android',
      );
    } finally {
      window.removeEventListener(
        PLATFORM_PREFERENCE_EVENT,
        handlePreferenceChange,
      );
    }
  });

  it('persists the current platform when clicking the already active trigger', () => {
    const components = getMDXComponents() as Record<string, unknown>;
    const Group = components._PlatformTabsGroup as PlatformGroupComponent;
    const Panel = components._PlatformPanel as PlatformPanelComponent;

    render(
      <Group
        canonicalPlatform="web"
        groupMode="structured"
        platforms='["android","web"]'
      >
        <Panel platform="android">Android instructions</Panel>
        <Panel platform="web">Web instructions</Panel>
      </Group>,
    );

    fireEvent.click(screen.getByRole('tab', { name: 'Web' }));

    expect(window.localStorage.getItem('docs-portal:platform:v1')).toBe('web');
  });

  it('renders Fumadocs normal tab triggers', () => {
    const components = getMDXComponents();
    const Tabs = components.Tabs as TabsComponent;
    const TabsList = components.TabsList as TabsComponent;
    const TabsTrigger = components.TabsTrigger as TabsChildComponent;

    render(
      <Tabs defaultValue="mac">
        <TabsList>
          <TabsTrigger value="mac">macOS and Linux</TabsTrigger>
          <TabsTrigger value="windows">Windows PowerShell</TabsTrigger>
        </TabsList>
      </Tabs>,
    );

    const tablist = screen.getByRole('tablist');

    expect(tablist).toHaveClass('not-prose');
    expect(tablist).toHaveClass('overflow-x-auto');
  });

  it('selects the first normal tab when MDX omits defaultValue', () => {
    const components = getMDXComponents();
    const Tabs = components.Tabs as TabsComponent;
    const TabsList = components.TabsList as TabsComponent;
    const TabsTrigger = components.TabsTrigger as TabsChildComponent;
    const TabsContent = components.TabsContent as TabsChildComponent;
    const Pre = components.pre as CodeBlockPreComponent;

    render(
      <Tabs>
        <TabsList>
          <TabsTrigger value="mac-linux">macOS and Linux</TabsTrigger>
          <TabsTrigger value="windows-powershell">
            Windows PowerShell
          </TabsTrigger>
        </TabsList>
        <TabsContent value="mac-linux">
          <Pre>
            <code>Install with curl</code>
          </Pre>
        </TabsContent>
        <TabsContent value="windows-powershell">Install with irm</TabsContent>
      </Tabs>,
    );

    expect(screen.getByRole('tablist').parentElement).toHaveClass('bg-fd-card');
    expect(
      screen.getByText('Install with curl').closest('[role=tabpanel]'),
    ).toHaveClass('bg-fd-background');
    expect(
      screen.getByText('Install with curl').closest('[role=tabpanel]')
        ?.className,
    ).toContain('[&>figure:only-child]:bg-fd-card');
    expect(screen.getByText('Install with curl').closest('figure')).toHaveClass(
      'shadow-none',
    );
    expect(
      screen.getByRole('tab', { name: 'macOS and Linux' }),
    ).toHaveAttribute('data-state', 'active');
    expect(screen.getByText('Install with curl')).toBeVisible();
    expect(
      screen.getByRole('tab', { name: 'Windows PowerShell' }),
    ).toHaveAttribute('data-state', 'inactive');
  });

  it('adds hidden visible tab labels to section headings without changing anchor IDs', () => {
    const components = getMDXComponents();
    const Tabs = components.Tabs as TabsComponent;
    const TabsContent = components.TabsContent as TabsChildComponent;
    const TabsList = components.TabsList as TabsComponent;
    const TabsTrigger = components.TabsTrigger as TabsChildComponent;
    const Heading = components.h2 as ComponentType<{
      children: ReactNode;
      id?: string;
    }>;

    render(
      <Tabs defaultValue="client-errors">
        <TabsList>
          <TabsTrigger value="client-errors">Client toolkit</TabsTrigger>
          <TabsTrigger value="server-errors">Server REST API</TabsTrigger>
        </TabsList>
        <TabsContent value="client-errors">
          <Heading id="project-setup">Project setup</Heading>
        </TabsContent>
        <TabsContent value="server-errors">
          <Heading id="project-setup-1">Project setup</Heading>
        </TabsContent>
      </Tabs>,
    );

    const clientHeading = screen.getByRole('heading', {
      name: 'Project setup (Client toolkit)',
    });
    const serverHeading = screen.getByRole('heading', {
      hidden: true,
      name: 'Project setup (Server REST API)',
    });

    expect(clientHeading).toHaveAttribute('id', 'project-setup');
    expect(serverHeading).toHaveAttribute('id', 'project-setup-1');
    expect(screen.getByText('(Client toolkit)')).toHaveClass('sr-only');
    expect(screen.getByText('(Server REST API)')).toHaveClass('sr-only');
  });

  it('keeps nested tab labels scoped to their own tab group', () => {
    const components = getMDXComponents();
    const Tabs = components.Tabs as TabsComponent;
    const TabsContent = components.TabsContent as TabsChildComponent;
    const TabsList = components.TabsList as TabsComponent;
    const TabsTrigger = components.TabsTrigger as TabsChildComponent;
    const Heading = components.h2 as ComponentType<{
      children: ReactNode;
      id?: string;
    }>;

    render(
      <Tabs defaultValue="shared">
        <TabsList>
          <TabsTrigger value="shared">Outer platform</TabsTrigger>
        </TabsList>
        <TabsContent value="shared">
          <Heading id="outer-heading">Outer heading</Heading>
          <Tabs defaultValue="shared">
            <TabsList>
              <TabsTrigger value="shared">Inner language</TabsTrigger>
            </TabsList>
            <TabsContent value="shared">
              <Heading id="inner-heading">Inner heading</Heading>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>,
    );

    expect(
      screen.getByRole('heading', { name: 'Outer heading (Outer platform)' }),
    ).toHaveAttribute('id', 'outer-heading');
    expect(
      screen.getByRole('heading', { name: 'Inner heading (Inner language)' }),
    ).toHaveAttribute('id', 'inner-heading');
  });

  it('falls back when a controlled normal tab value is stale', () => {
    const components = getMDXComponents();
    const Tabs = components.Tabs as TabsComponent;
    const TabsList = components.TabsList as TabsComponent;
    const TabsTrigger = components.TabsTrigger as TabsChildComponent;
    const TabsContent = components.TabsContent as TabsChildComponent;

    render(
      <Tabs value="ios">
        <TabsList>
          <TabsTrigger value="android">Android</TabsTrigger>
          <TabsTrigger value="web">Web</TabsTrigger>
        </TabsList>
        <TabsContent value="android">Android instructions</TabsContent>
        <TabsContent value="web">Web instructions</TabsContent>
      </Tabs>,
    );

    expect(screen.getByRole('tab', { name: 'Android' })).toHaveAttribute(
      'data-state',
      'active',
    );
    expect(screen.getByText('Android instructions')).toBeVisible();
  });

  it('uses Fumadocs code block chrome with local state compatibility wrappers', () => {
    const components = getMDXComponents();
    const defaults = defaultMdxComponents;

    expect(components.CodeBlockTabs).not.toBe(defaults.CodeBlockTabs);
    expect(components.CodeBlockTabsList).not.toBe(defaults.CodeBlockTabsList);
    expect(components.CodeBlockTabsTrigger).toBe(defaults.CodeBlockTabsTrigger);
    expect(components.CodeBlockTab).not.toBe(defaults.CodeBlockTab);
    expect(components.pre).not.toBe(defaults.pre);
  });

  it('renders generated code tabs with Fumadocs chrome', () => {
    const components = getMDXComponents();
    const CodeBlockTabs = components.CodeBlockTabs as TabsComponent;
    const CodeBlockTabsList = components.CodeBlockTabsList as TabsComponent;
    const CodeBlockTabsTrigger =
      components.CodeBlockTabsTrigger as TabsChildComponent;

    render(
      <CodeBlockTabs defaultValue="python">
        <CodeBlockTabsList>
          <CodeBlockTabsTrigger value="python">Python</CodeBlockTabsTrigger>
          <CodeBlockTabsTrigger value="typescript">
            TypeScript
          </CodeBlockTabsTrigger>
        </CodeBlockTabsList>
      </CodeBlockTabs>,
    );

    const tablist = screen.getByRole('tablist');

    expect(tablist).toHaveClass('overflow-x-auto');
    expect(tablist).toHaveClass('bg-fd-card');
    expect(screen.getByRole('tab', { name: 'TypeScript' })).toHaveClass(
      'text-nowrap',
    );
  });

  it('exposes Fumadocs code block components for generated code tabs', () => {
    const components = getMDXComponents();

    expect(components.CodeBlockTabs).toBeDefined();
    expect(components.CodeBlockTabsList).toBeDefined();
    expect(components.CodeBlockTabsTrigger).toBeDefined();
    expect(components.CodeBlockTab).toBeDefined();
    expect(components.pre).toBeDefined();
  });

  it('renders fenced code with Fumadocs copy chrome', () => {
    const components = getMDXComponents();
    const Pre = components.pre as CodeBlockPreComponent;

    render(
      <Pre className="language-bash" title="Install">
        <code>
          <span className="line">npm install @agora/sdk</span>
        </code>
      </Pre>,
    );

    const figure = screen.getByText('Install').closest('figure');

    expect(figure).not.toBeNull();
    const codeBlock = figure as HTMLElement;
    expect(codeBlock).toBeInTheDocument();
    expect(codeBlock).toHaveClass('bg-fd-card');
    expect(codeBlock).toHaveClass('shadow-none');
    expect(codeBlock).toHaveAttribute('data-line-numbers', 'true');
    expect(within(codeBlock).getByText('Install')).toBeInTheDocument();
    expect(
      within(codeBlock).getByRole('button', { name: 'Copy Text' }),
    ).toBeInTheDocument();
    expect(codeBlock).toHaveTextContent('npm install @agora/sdk');
  });

  it('renders generated code tabs with Fumadocs grouped chrome', () => {
    const components = getMDXComponents();
    const CodeBlockTabs = components.CodeBlockTabs as TabsComponent;
    const CodeBlockTabsList = components.CodeBlockTabsList as TabsComponent;
    const CodeBlockTabsTrigger =
      components.CodeBlockTabsTrigger as TabsChildComponent;
    const CodeBlockTab = components.CodeBlockTab as TabsChildComponent;
    const Pre = components.pre as CodeBlockPreComponent;

    render(
      <CodeBlockTabs defaultValue="python" groupId="sdk" persist>
        <CodeBlockTabsList>
          <CodeBlockTabsTrigger value="python">Python</CodeBlockTabsTrigger>
          <CodeBlockTabsTrigger value="ts">TypeScript</CodeBlockTabsTrigger>
        </CodeBlockTabsList>
        <CodeBlockTab value="python">
          <Pre>
            <code>print("hello")</code>
          </Pre>
        </CodeBlockTab>
        <CodeBlockTab value="ts">
          <Pre>
            <code>console.log("hello")</code>
          </Pre>
        </CodeBlockTab>
      </CodeBlockTabs>,
    );

    expect(screen.getByRole('tab', { name: 'Python' })).toHaveAttribute(
      'data-state',
      'active',
    );
    expect(screen.getByRole('tab', { name: 'TypeScript' })).toHaveAttribute(
      'data-state',
      'inactive',
    );
    expect(screen.getByText('print("hello")').closest('figure')).toHaveClass(
      'bg-fd-card',
    );
    expect(
      screen.getByText('print("hello")').closest('[role=tabpanel]')?.className,
    ).toContain('[&>figure]:border-0');
    expect(
      screen.getByText('print("hello")').closest('[role=tabpanel]')?.className,
    ).toContain('[&>figure]:m-0');
    expect(screen.getByText('console.log("hello")')).toBeInTheDocument();
    expect(
      screen.getByText('console.log("hello")').closest('[role=tabpanel]'),
    ).not.toBeVisible();
  });

  it('switches generated code tabs when a trigger is clicked', () => {
    const components = getMDXComponents();
    const CodeBlockTabs = components.CodeBlockTabs as TabsComponent;
    const CodeBlockTabsList = components.CodeBlockTabsList as TabsComponent;
    const CodeBlockTabsTrigger =
      components.CodeBlockTabsTrigger as TabsChildComponent;
    const CodeBlockTab = components.CodeBlockTab as TabsChildComponent;
    const Pre = components.pre as CodeBlockPreComponent;

    render(
      <CodeBlockTabs defaultValue="npm">
        <CodeBlockTabsList>
          <CodeBlockTabsTrigger value="npm">npm</CodeBlockTabsTrigger>
          <CodeBlockTabsTrigger value="pnpm">pnpm</CodeBlockTabsTrigger>
        </CodeBlockTabsList>
        <CodeBlockTab value="npm">
          <Pre>
            <code>npm install @agora/voice-agent</code>
          </Pre>
        </CodeBlockTab>
        <CodeBlockTab value="pnpm">
          <Pre>
            <code>pnpm add @agora/voice-agent</code>
          </Pre>
        </CodeBlockTab>
      </CodeBlockTabs>,
    );

    fireEvent.mouseDown(screen.getByRole('tab', { name: 'pnpm' }), {
      button: 0,
      ctrlKey: false,
    });

    expect(screen.getByRole('tab', { name: 'npm' })).toHaveAttribute(
      'data-state',
      'inactive',
    );
    expect(screen.getByRole('tab', { name: 'pnpm' })).toHaveAttribute(
      'data-state',
      'active',
    );
    expect(
      screen
        .getByText('npm install @agora/voice-agent')
        .closest('[role=tabpanel]'),
    ).not.toBeVisible();
    expect(
      screen
        .getByText('pnpm add @agora/voice-agent')
        .closest('[role=tabpanel]'),
    ).toBeVisible();
  });

  it('preserves explicit generated code tab group syncing without the MDX page provider', () => {
    sessionStorage.clear();

    const components = getMDXComponents();
    const CodeBlockTabs = components.CodeBlockTabs as TabsComponent;
    const CodeBlockTabsList = components.CodeBlockTabsList as TabsComponent;
    const CodeBlockTabsTrigger =
      components.CodeBlockTabsTrigger as TabsChildComponent;
    const CodeBlockTab = components.CodeBlockTab as TabsChildComponent;
    const Pre = components.pre as CodeBlockPreComponent;

    render(
      <>
        <CodeBlockTabs defaultValue="python" groupId="explicit-sdk" persist>
          <CodeBlockTabsList>
            <CodeBlockTabsTrigger value="python">Python</CodeBlockTabsTrigger>
            <CodeBlockTabsTrigger value="ts">TypeScript</CodeBlockTabsTrigger>
          </CodeBlockTabsList>
          <CodeBlockTab value="python">
            <Pre>
              <code>first python sample</code>
            </Pre>
          </CodeBlockTab>
          <CodeBlockTab value="ts">
            <Pre>
              <code>first typescript sample</code>
            </Pre>
          </CodeBlockTab>
        </CodeBlockTabs>
        <CodeBlockTabs defaultValue="python" groupId="explicit-sdk" persist>
          <CodeBlockTabsList>
            <CodeBlockTabsTrigger value="python">Python</CodeBlockTabsTrigger>
            <CodeBlockTabsTrigger value="ts">TypeScript</CodeBlockTabsTrigger>
          </CodeBlockTabsList>
          <CodeBlockTab value="python">
            <Pre>
              <code>second python sample</code>
            </Pre>
          </CodeBlockTab>
          <CodeBlockTab value="ts">
            <Pre>
              <code>second typescript sample</code>
            </Pre>
          </CodeBlockTab>
        </CodeBlockTabs>
      </>,
    );

    const [firstTabs, secondTabs] = screen.getAllByRole('tablist');

    fireEvent.mouseDown(
      within(firstTabs).getByRole('tab', { name: 'TypeScript' }),
      {
        button: 0,
        ctrlKey: false,
      },
    );

    expect(
      within(firstTabs).getByRole('tab', { name: 'TypeScript' }),
    ).toHaveAttribute('data-state', 'active');
    expect(
      within(secondTabs).getByRole('tab', { name: 'TypeScript' }),
    ).toHaveAttribute('data-state', 'active');
    expect(sessionStorage.getItem('explicit-sdk')).toBe('ts');
    expect(
      screen.getByText('second typescript sample').closest('[role=tabpanel]'),
    ).toBeVisible();
  });

  it('syncs generated code tabs with the same values inside the MDX page provider', () => {
    const components = getMDXComponents();
    const CodeBlockTabs = components.CodeBlockTabs as TabsComponent;
    const CodeBlockTabsList = components.CodeBlockTabsList as TabsComponent;
    const CodeBlockTabsTrigger =
      components.CodeBlockTabsTrigger as TabsChildComponent;
    const CodeBlockTab = components.CodeBlockTab as TabsChildComponent;
    const Pre = components.pre as CodeBlockPreComponent;

    render(
      <MDXAccordionProvider>
        <CodeBlockTabs defaultValue="java">
          <CodeBlockTabsList>
            <CodeBlockTabsTrigger value="java">Java</CodeBlockTabsTrigger>
            <CodeBlockTabsTrigger value="kotlin">Kotlin</CodeBlockTabsTrigger>
          </CodeBlockTabsList>
          <CodeBlockTab value="java">
            <Pre>
              <code>first java sample</code>
            </Pre>
          </CodeBlockTab>
          <CodeBlockTab value="kotlin">
            <Pre>
              <code>first kotlin sample</code>
            </Pre>
          </CodeBlockTab>
        </CodeBlockTabs>
        <CodeBlockTabs defaultValue="java">
          <CodeBlockTabsList>
            <CodeBlockTabsTrigger value="kotlin">Kotlin</CodeBlockTabsTrigger>
            <CodeBlockTabsTrigger value="java">Java</CodeBlockTabsTrigger>
          </CodeBlockTabsList>
          <CodeBlockTab value="java">
            <Pre>
              <code>second java sample</code>
            </Pre>
          </CodeBlockTab>
          <CodeBlockTab value="kotlin">
            <Pre>
              <code>second kotlin sample</code>
            </Pre>
          </CodeBlockTab>
        </CodeBlockTabs>
      </MDXAccordionProvider>,
    );

    const [firstTabs, secondTabs] = screen.getAllByRole('tablist');

    fireEvent.mouseDown(
      within(firstTabs).getByRole('tab', { name: 'Kotlin' }),
      {
        button: 0,
        ctrlKey: false,
      },
    );

    expect(
      within(firstTabs).getByRole('tab', { name: 'Kotlin' }),
    ).toHaveAttribute('data-state', 'active');
    expect(
      within(secondTabs).getByRole('tab', { name: 'Kotlin' }),
    ).toHaveAttribute('data-state', 'active');
    expect(
      screen.getByText('first kotlin sample').closest('[role=tabpanel]'),
    ).toBeVisible();
    expect(
      screen.getByText('second kotlin sample').closest('[role=tabpanel]'),
    ).toBeVisible();
    expect(
      screen.getByText('second java sample').closest('[role=tabpanel]'),
    ).not.toBeVisible();
  });

  it('keeps generated code tabs local without the MDX page provider', () => {
    const components = getMDXComponents();
    const CodeBlockTabs = components.CodeBlockTabs as TabsComponent;
    const CodeBlockTabsList = components.CodeBlockTabsList as TabsComponent;
    const CodeBlockTabsTrigger =
      components.CodeBlockTabsTrigger as TabsChildComponent;
    const CodeBlockTab = components.CodeBlockTab as TabsChildComponent;
    const Pre = components.pre as CodeBlockPreComponent;

    render(
      <>
        <CodeBlockTabs defaultValue="java">
          <CodeBlockTabsList>
            <CodeBlockTabsTrigger value="java">Java</CodeBlockTabsTrigger>
            <CodeBlockTabsTrigger value="kotlin">Kotlin</CodeBlockTabsTrigger>
          </CodeBlockTabsList>
          <CodeBlockTab value="java">
            <Pre>
              <code>first local java sample</code>
            </Pre>
          </CodeBlockTab>
          <CodeBlockTab value="kotlin">
            <Pre>
              <code>first local kotlin sample</code>
            </Pre>
          </CodeBlockTab>
        </CodeBlockTabs>
        <CodeBlockTabs defaultValue="java">
          <CodeBlockTabsList>
            <CodeBlockTabsTrigger value="java">Java</CodeBlockTabsTrigger>
            <CodeBlockTabsTrigger value="kotlin">Kotlin</CodeBlockTabsTrigger>
          </CodeBlockTabsList>
          <CodeBlockTab value="java">
            <Pre>
              <code>second local java sample</code>
            </Pre>
          </CodeBlockTab>
          <CodeBlockTab value="kotlin">
            <Pre>
              <code>second local kotlin sample</code>
            </Pre>
          </CodeBlockTab>
        </CodeBlockTabs>
      </>,
    );

    const [firstTabs, secondTabs] = screen.getAllByRole('tablist');

    fireEvent.mouseDown(
      within(firstTabs).getByRole('tab', { name: 'Kotlin' }),
      {
        button: 0,
        ctrlKey: false,
      },
    );

    expect(
      within(firstTabs).getByRole('tab', { name: 'Kotlin' }),
    ).toHaveAttribute('data-state', 'active');
    expect(
      within(secondTabs).getByRole('tab', { name: 'Java' }),
    ).toHaveAttribute('data-state', 'active');
    expect(
      screen.getByText('first local kotlin sample').closest('[role=tabpanel]'),
    ).toBeVisible();
    expect(
      screen.getByText('second local java sample').closest('[role=tabpanel]'),
    ).toBeVisible();
  });

  it('keeps inactive generated code tab content mounted', () => {
    const components = getMDXComponents();
    const CodeBlockTabs = components.CodeBlockTabs as TabsComponent;
    const CodeBlockTabsList = components.CodeBlockTabsList as TabsComponent;
    const CodeBlockTabsTrigger =
      components.CodeBlockTabsTrigger as TabsChildComponent;
    const CodeBlockTab = components.CodeBlockTab as TabsChildComponent;
    const Pre = components.pre as CodeBlockPreComponent;

    render(
      <CodeBlockTabs defaultValue="python">
        <CodeBlockTabsList>
          <CodeBlockTabsTrigger value="python">Python</CodeBlockTabsTrigger>
          <CodeBlockTabsTrigger value="ts">TypeScript</CodeBlockTabsTrigger>
        </CodeBlockTabsList>
        <CodeBlockTab value="python">
          <Pre>
            <code>print("hello")</code>
          </Pre>
        </CodeBlockTab>
        <CodeBlockTab value="ts">
          <Pre>
            <code>console.log("hello")</code>
          </Pre>
        </CodeBlockTab>
      </CodeBlockTabs>,
    );

    const inactiveCodePanel = screen
      .getByText('console.log("hello")')
      .closest('[role=tabpanel]');

    expect(inactiveCodePanel).toBeInTheDocument();
    expect(inactiveCodePanel).not.toBeVisible();

    expect(screen.getByRole('tab', { name: 'TypeScript' })).toHaveAttribute(
      'data-state',
      'inactive',
    );
  });

  it('renders grouped MDX tabs without custom platform tabs', () => {
    const components = getMDXComponents();
    const Tabs = components.Tabs as TabsComponent;
    const TabsList = components.TabsList as TabsComponent;
    const TabsTrigger = components.TabsTrigger as TabsChildComponent;
    const TabsContent = components.TabsContent as TabsChildComponent;

    render(
      <Tabs defaultValue="android" groupId="platform" persist>
        <TabsList>
          <TabsTrigger value="android">Android</TabsTrigger>
          <TabsTrigger value="ios">iOS</TabsTrigger>
        </TabsList>
        <TabsContent value="android">Android instructions</TabsContent>
        <TabsContent value="ios">iOS instructions</TabsContent>
      </Tabs>,
    );

    expect(screen.getByRole('tab', { name: 'Android' })).toHaveAttribute(
      'data-state',
      'active',
    );
    expect(screen.getByRole('tab', { name: 'iOS' })).toHaveAttribute(
      'data-state',
      'inactive',
    );
  });

  it('falls back when persisted tab values no longer match current content', () => {
    window.localStorage.setItem('platform', 'ios');

    const components = getMDXComponents();
    const Tabs = components.Tabs as TabsComponent;
    const TabsList = components.TabsList as TabsComponent;
    const TabsTrigger = components.TabsTrigger as TabsChildComponent;
    const TabsContent = components.TabsContent as TabsChildComponent;

    render(
      <Tabs defaultValue="android" groupId="platform" persist>
        <TabsList>
          <TabsTrigger value="android">Android</TabsTrigger>
          <TabsTrigger value="web">Web</TabsTrigger>
        </TabsList>
        <TabsContent value="android">Android instructions</TabsContent>
        <TabsContent value="web">Web instructions</TabsContent>
      </Tabs>,
    );

    expect(screen.getByRole('tab', { name: 'Android' })).toHaveAttribute(
      'data-state',
      'active',
    );
    expect(screen.getByRole('tab', { name: 'Web' })).toHaveAttribute(
      'data-state',
      'inactive',
    );
  });

  it('renders nested parameters in a dedicated child region outside the parent description', () => {
    const components = getMDXComponents();
    const ParameterList = components.ParameterList as ParameterListComponent;
    const Parameter = components.Parameter as ParameterComponent;

    render(
      <ParameterList title="mllm" required>
        <Parameter name="messages" required={false} type="array[object]">
          <p>Conversation history items passed to the model.</p>
          <Parameter name="role" required type="string">
            The role of the message author.
          </Parameter>
          <Parameter name="content" required type="string">
            The message text.
          </Parameter>
        </Parameter>
      </ParameterList>,
    );

    const parent = screen
      .getByText('messages')
      .closest('[data-parameter-item]');

    expect(parent).toBeInTheDocument();

    const description = parent?.querySelector('[data-parameter-description]');
    const nestedParameters = parent?.querySelector('[data-parameter-children]');

    expect(description).toHaveTextContent(
      'Conversation history items passed to the model.',
    );
    expect(description).not.toHaveTextContent('role');
    expect(description).not.toHaveTextContent('content');
    expect(nestedParameters).toHaveTextContent('role');
    expect(nestedParameters).toHaveTextContent('content');
  });

  it('renders table parameter lists with nested fields inside the description cell', () => {
    const components = getMDXComponents();
    const ParameterList = components.ParameterList as ParameterListComponent;
    const Parameter = components.Parameter as ParameterComponent;
    const Returns = components.ApiReturns as ApiReturnsComponent;
    const ReturnType = components.ApiReturnType as ApiReturnTypeComponent;

    render(
      <ParameterList title="参数" variant="table">
        <Parameter name="callback" optional type="function">
          <p>具体的事件详情。</p>
          <Returns title="返回值">
            <ReturnType>nested callback void</ReturnType>
          </Returns>
          <ParameterList title="参数" variant="table">
            <Parameter name="evt" required type="object">
              <Parameter name="code" required type="number" />
            </Parameter>
          </ParameterList>
        </Parameter>
      </ParameterList>,
    );

    expect(screen.getAllByText('参数名')).toHaveLength(1);
    expect(screen.getAllByText('描述')).toHaveLength(1);

    const callback = screen
      .getByText('具体的事件详情。')
      .closest('[data-parameter-item]');
    const description = callback?.querySelector('[data-parameter-description]');
    const nestedParameters = callback?.querySelector(
      '[data-parameter-children]',
    );

    expect(callback).toHaveAttribute('data-parameter-variant', 'table');
    expect(description).toContainElement(nestedParameters as HTMLElement);
    expect(
      nestedParameters?.querySelector('[data-parameter-nested="true"]'),
    ).toBeInTheDocument();
    expect(description).toHaveTextContent('evt');
    expect(description).toHaveTextContent('code');
    expect(description).not.toHaveTextContent('返回值');
    expect(description).not.toHaveTextContent('nested callback void');
  });

  it('renders nested ParameterList blocks in the same dedicated child region', () => {
    const components = getMDXComponents();
    const ParameterList = components.ParameterList as ParameterListComponent;
    const Parameter = components.Parameter as ParameterComponent;

    render(
      <ParameterList title="llm" required>
        <Parameter name="config" required={false} type="object">
          Additional parameters passed to the vendor.
          <ParameterList title="params">
            <Parameter name="model" required type="string">
              The model to use.
            </Parameter>
          </ParameterList>
        </Parameter>
      </ParameterList>,
    );

    const parent = screen.getByText('config').closest('[data-parameter-item]');

    expect(parent).toBeInTheDocument();

    const description = parent?.querySelector('[data-parameter-description]');
    const nestedParameters = parent?.querySelector('[data-parameter-children]');

    expect(description).toHaveTextContent(
      'Additional parameters passed to the vendor.',
    );
    expect(description).not.toHaveTextContent('model');
    expect(nestedParameters).toHaveTextContent('params');
    expect(nestedParameters).toHaveTextContent('model');
  });

  it('renders comma-separated possible values as scannable chips', () => {
    const components = getMDXComponents();
    const ParameterList = components.ParameterList as ParameterListComponent;
    const Parameter = components.Parameter as ParameterComponent;

    render(
      <ParameterList title="turn_detection">
        <Parameter
          name="mode"
          possibleValues="agora_vad, server_vad"
          type="string"
        >
          Turn detection mode.
        </Parameter>
      </ParameterList>,
    );

    const possibleValues = screen.getByLabelText('Possible values for mode');

    expect(possibleValues).toHaveAttribute('data-parameter-possible-values');
    expect(within(possibleValues).getByText('agora_vad')).toBeInTheDocument();
    expect(within(possibleValues).getByText('server_vad')).toBeInTheDocument();
    expect(possibleValues).not.toHaveTextContent('agora_vad, server_vad');
  });

  it('keeps bracketed numeric ranges as a single possible value chip', () => {
    const components = getMDXComponents();
    const ParameterList = components.ParameterList as ParameterListComponent;
    const Parameter = components.Parameter as ParameterComponent;

    render(
      <ParameterList title="params">
        <Parameter name="pitch" possibleValues="[-0.75,0.75]" type="number">
          Pitch adjustment.
        </Parameter>
      </ParameterList>,
    );

    const possibleValues = screen.getByLabelText('Possible values for pitch');

    expect(
      within(possibleValues).getByText('[-0.75,0.75]'),
    ).toBeInTheDocument();
    expect(
      within(possibleValues).queryByText('[-0.75'),
    ).not.toBeInTheDocument();
    expect(within(possibleValues).queryByText('0.75]')).not.toBeInTheDocument();
  });

  it('does not expose overview-only widgets from the common registry by default', () => {
    const components = getMDXComponents() as Record<string, unknown>;

    expect(components.CardGrid).toBeUndefined();
    expect(components.FeatureCard).toBeUndefined();
    expect(components.SolutionCard).toBeUndefined();
    expect(components.SolutionCardGrid).toBeUndefined();
    expect(components.OverviewSpotlightGrid).toBeUndefined();
    expect(components.OverviewToolkits).toBeUndefined();
    expect(components.RecipesCatalog).toBeUndefined();
  });
});
