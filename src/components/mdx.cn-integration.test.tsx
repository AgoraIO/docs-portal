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
import { renderToString } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DOCS_HASH_TARGET_EVENT } from '@/lib/docs-hash';
import { PLATFORM_PREFERENCE_EVENT } from '@/lib/platforms/preference';
import { AccountGuidance } from './account-guidance/AccountGuidance';
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
  PlatformPageProvider,
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
  'data-language-label'?: string;
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
  target?: string;
  title: ReactNode;
}>;
type AccordionsComponent = ComponentType<{
  children: ReactNode;
  defaultValue?: string;
  openFirst?: boolean;
  type?: 'single' | 'multiple';
}>;
type AccordionComponent = ComponentType<{
  children: ReactNode;
  headingLevel?: 2 | 3 | 4;
  id?: string;
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
    const components = getMDXComponents(undefined, {
      locale: 'zh-CN',
    }) as Record<string, unknown>;
    const defaults = defaultMdxComponents as Record<string, unknown>;

    expect(components.img).not.toBe(defaults.img);
    expect(components.table).not.toBe(defaults.table);
    expect(components.DocsTable).toBe(components.table);
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

  it.each([false, true])(
    'gives simple parameter tables readable columns without reclassifying merged tables (merged: %s)',
    (merged) => {
      const Table = getMDXComponents(undefined, { locale: 'zh-CN' })
        .table as TableComponent;
      render(
        <Table>
          <thead>
            <tr>
              {['属性', '类型', '是否必填', '默认值', '描述'].map((label) => (
                <th key={label}>{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td rowSpan={merged ? 2 : undefined}>cloudProxy</td>
              <td>boolean</td>
              <td>选填</td>
              <td>false</td>
              <td>仅适用于 Message Channel。</td>
            </tr>
          </tbody>
        </Table>,
      );
      if (merged) {
        expect(screen.getByRole('table')).not.toHaveAttribute(
          'data-table-layout',
        );
      } else {
        expect(screen.getByRole('table')).toHaveAttribute(
          'data-table-layout',
          'parameters',
        );
      }
    },
  );

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

  it('renders native merged cells through the same accessible table container', () => {
    const Table = getMDXComponents(undefined, { locale: 'zh-CN' })
      .DocsTable as TableComponent;
    const { container } = render(
      <Table>
        <thead>
          <tr>
            <th colSpan={2}>参数</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td rowSpan={2}>option</td>
            <td>enable</td>
          </tr>
          <tr>
            <td>strength</td>
          </tr>
        </tbody>
      </Table>,
    );
    expect(
      screen.getByRole('region', { name: '可横向滚动的表格' }),
    ).toContainElement(screen.getByRole('table'));
    expect(container.querySelector('th')).toHaveAttribute('colspan', '2');
    expect(screen.getByText('option')).toHaveAttribute('rowspan', '2');
    expect(screen.getAllByText('option')).toHaveLength(1);
    expect(container.querySelectorAll('tbody tr')[1].children).toHaveLength(1);
  });

  it('marks SDK compliance callouts for platform download spacing', () => {
    const components = getMDXComponents(undefined, { locale: 'zh-CN' });
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
    const components = getMDXComponents(undefined, { locale: 'zh-CN' });
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

  it('renders explicitly sized inline icons without a zoom button', () => {
    const InlineImage = getMDXComponents(undefined, { locale: 'zh-CN' })
      .InlineImage as ComponentType<ComponentProps<'img'>>;

    expect(InlineImage).toBeTypeOf('function');
    render(
      <p>
        点击{' '}
        <InlineImage
          alt="运行"
          src="https://web-cdn.agora.io/docs-files/1687670569781"
          width={25}
        />{' '}
        开始编译。
      </p>,
    );

    const image = screen.getByRole('img', { name: '运行' });
    expect(image).toHaveAttribute('width', '25');
    expect(image).toHaveAttribute('referrerpolicy', 'no-referrer');
    expect(image).toHaveClass('inline-block', 'align-middle', 'm-0', 'h-auto');
    expect(image.closest('button')).toBeNull();
  });

  it('honors legacy inline icon heights without a width constraint', () => {
    const InlineImage = getMDXComponents(undefined, { locale: 'zh-CN' })
      .InlineImage as ComponentType<ComponentProps<'img'>>;
    render(
      <InlineImage
        alt="开始图标"
        src="https://web-cdn.agora.io/docs-files/1690171362896"
        height={20}
      />,
    );
    const image = screen.getByRole('img', { name: '开始图标' });
    expect(image).toHaveStyle({ height: '20px' });
    expect(image.style.width).toBe('');
    expect(image.closest('button')).toBeNull();
  });

  it('caps a screenshot height without limiting the zoom preview', async () => {
    const Image = getMDXComponents(undefined, { locale: 'zh-CN' })
      .DocsImage as ComponentType<
      ComponentProps<'img'> & { displayHeight?: string }
    >;
    render(
      <Image
        alt="Unity 场景列表"
        src="https://web-cdn.agora.io/docs-files/1691054049527"
        displayHeight="320px"
      />,
    );
    const thumbnail = screen.getByRole('img', { name: 'Unity 场景列表' });
    expect(thumbnail).toHaveStyle({
      maxHeight: '320px',
      width: 'auto',
      height: 'auto',
    });
    fireEvent.click(
      screen.getByRole('button', { name: 'Zoom image: Unity 场景列表' }),
    );
    const preview = within(await screen.findByRole('dialog')).getByRole('img', {
      name: 'Unity 场景列表',
    });
    expect(preview.style.maxHeight).toBe('');
  });

  it('sizes a documentation screenshot without shrinking the zoom preview', async () => {
    const Image = getMDXComponents(undefined, { locale: 'zh-CN' })
      .DocsImage as ComponentType<
      ComponentProps<'img'> & { displayWidth?: string }
    >;
    expect(Image).toBeTypeOf('function');

    render(
      <Image
        alt="在线 K 歌房界面"
        src="https://web-cdn.agora.io/docs-files/1696931506007"
        displayWidth="40%"
      />,
    );

    const thumbnail = screen.getByRole('img', { name: '在线 K 歌房界面' });
    const trigger = screen.getByRole('button', {
      name: 'Zoom image: 在线 K 歌房界面',
    });
    expect(trigger).toHaveStyle({ width: '40%' });
    expect(trigger).toHaveAttribute('data-docs-image');
    expect(thumbnail).toHaveAttribute('referrerpolicy', 'no-referrer');
    fireEvent.click(trigger);
    const dialog = await screen.findByRole('dialog');
    const preview = within(dialog).getByRole('img', {
      name: '在线 K 歌房界面',
    });
    expect(preview).toHaveAttribute('referrerpolicy', 'no-referrer');
    expect(preview.style.width).toBe('');
    expect(preview.closest('[data-docs-image]')).toBeNull();
  });

  it('marks external and new-window links while keeping same-window anchors plain', () => {
    const Anchor = getMDXComponents(undefined, { locale: 'zh-CN' })
      .a as AnchorComponent;
    render(
      <>
        <Anchor href="//example.com">Web link</Anchor>
        <Anchor href="#overview">Overview</Anchor>
        <Anchor href="mailto:help@example.com">Email</Anchor>
        <Anchor href="/downloads/sdk.zip" download>
          Download
        </Anchor>
      </>,
    );

    expect(
      screen.getByRole('link', { name: 'Web link' }).querySelector('svg'),
    ).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByRole('link', { name: 'Email' })).toHaveAttribute(
      'target',
      '_blank',
    );
    expect(
      screen
        .getByRole('link', { name: 'Email' })
        .querySelector('.docs-external-link-icon'),
    ).not.toBeNull();
    for (const name of ['Overview', 'Download']) {
      expect(
        screen.getByRole('link', { name }).querySelector('svg'),
      ).toBeNull();
    }
  });

  it('keeps card navigation arrows without document-link external indicators', () => {
    const Card = getMDXComponents(undefined, { contentPath: 'en/ai/index.md' })
      .Card as CardComponent;
    render(
      <>
        <Card title="External card" href="https://example.com" />
        <Card
          title="New-window card"
          href="/en/ai/quickstart"
          target="_blank"
        />
      </>,
    );
    for (const name of ['External card', 'New-window card']) {
      const card = screen.getByRole('link', { name: new RegExp(name) });
      expect(card).toHaveAttribute('target', '_blank');
      expect(card.querySelector('.docs-external-link-icon')).toBeNull();
      expect(card.querySelector('.docs-card-arrow')).not.toBeNull();
    }
  });

  it('guides Demo immediate-experience cards without changing source cards', async () => {
    window.history.replaceState({}, '', '/zh-CN/reference/demo/fastboard');
    const components = getMDXComponents(undefined, {
      contentPath: 'zh-CN/reference/demo/fastboard.mdx',
    });
    const Card = components.Card as CardComponent;

    render(
      <AccountGuidance enabled>
        <Card href="https://demo.whiteboard.agora.io/" title="立即体验" />
        <Card
          href="https://github.com/AgoraIO-Community/example"
          title="Demo 源码"
        />
      </AccountGuidance>,
    );

    const experience = screen.getByRole('link', { name: '立即体验' });
    expect(experience).toHaveAttribute('target', '_blank');
    expect(experience).toHaveAttribute('rel', 'noopener noreferrer');
    fireEvent.click(screen.getByRole('link', { name: 'Demo 源码' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.click(experience);
    expect(await screen.findByRole('dialog')).toHaveTextContent('Fastboard');
  });

  it('keeps a nested example accordion independent of the version history', () => {
    const components = getMDXComponents(undefined, { locale: 'zh-CN' });
    const Accordions = components.Accordions as AccordionsComponent;
    const Accordion = components.Accordion as AccordionComponent;
    render(
      <MDXAccordionProvider>
        <Accordions type="multiple" openFirst>
          <Accordion title="v2" id="v2" headingLevel={2} value="v2">
            <Accordions>
              <Accordion title="示例代码" value="example">
                Example source
              </Accordion>
            </Accordions>
          </Accordion>
          <Accordion title="v1" id="v1" headingLevel={2} value="v1">
            Older release
          </Accordion>
        </Accordions>
      </MDXAccordionProvider>,
    );
    const latest = screen.getByRole('button', { name: 'v2' });
    const example = screen.getByRole('button', { name: '示例代码' });
    expect(latest).toHaveAttribute('aria-expanded', 'true');
    expect(example).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(example);
    fireEvent.click(screen.getByRole('button', { name: 'v1' }));
    expect(latest).toHaveAttribute('aria-expanded', 'true');
    expect(example).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Example source')).toBeVisible();
  });

  it.each(['single', 'multiple'] as const)(
    'keeps closed release histories hidden without beforematch support (%s)',
    (type) => {
      const components = getMDXComponents(undefined, { locale: 'zh-CN' });
      const Accordions = components.Accordions as AccordionsComponent;
      const Accordion = components.Accordion as AccordionComponent;
      const content = (
        <MDXAccordionProvider>
          <Accordions type={type} defaultValue="new">
            <Accordion title="Latest" headingLevel={2} value="new">
              Latest release
            </Accordion>
            <Accordion title="Older" headingLevel={2} value="old">
              Historical identifier
            </Accordion>
          </Accordions>
        </MDXAccordionProvider>
      );
      const style = document.createElement('style');
      style.textContent = 'docs-accordion-body.block { display: block; }';
      document.head.append(style);
      const server = document.createElement('div');
      try {
        server.innerHTML = renderToString(content);
        document.body.append(server);
        const closed = server.querySelectorAll('docs-accordion-body')[1];
        expect(getComputedStyle(closed).display).toBe('none');
        server.remove();

        render(content);
        const body = screen
          .getByText('Historical identifier')
          .closest('docs-accordion-body') as HTMLElement;
        const trigger = screen.getByRole('button', { name: 'Older' });
        expect('onbeforematch' in body).toBe(false);
        expect(trigger).toHaveAttribute('aria-expanded', 'false');
        expect(getComputedStyle(body).display).toBe('none');
        fireEvent.click(trigger);
        expect(trigger).toHaveAttribute('aria-expanded', 'true');
        expect(getComputedStyle(body).display).toBe('block');
        fireEvent.click(trigger);
        expect(trigger).toHaveAttribute('aria-expanded', 'false');
        expect(getComputedStyle(body).display).toBe('none');
      } finally {
        server.remove();
        style.remove();
      }
    },
  );

  it.each(['single', 'multiple'] as const)(
    'reveals a browser-find match through the %s version history state',
    async (type) => {
      const original = Object.getOwnPropertyDescriptor(
        HTMLElement.prototype,
        'onbeforematch',
      );
      Object.defineProperty(HTMLElement.prototype, 'onbeforematch', {
        configurable: true,
        value: null,
      });
      const style = document.createElement('style');
      style.textContent = 'docs-accordion-body.block { display: block; }';
      document.head.append(style);
      try {
        const components = getMDXComponents(undefined, { locale: 'zh-CN' });
        const Accordions = components.Accordions as AccordionsComponent;
        const Accordion = components.Accordion as AccordionComponent;
        const content = (
          <MDXAccordionProvider>
            <Accordions type={type} defaultValue="new">
              <Accordion title="Latest" id="new" headingLevel={2} value="new">
                Latest release
              </Accordion>
              <Accordion title="Older" id="old" headingLevel={2} value="old">
                Historical identifier
              </Accordion>
            </Accordions>
          </MDXAccordionProvider>
        );
        expect(renderToString(content)).toContain('hidden=""');
        render(content);
        const older = screen
          .getByText('Historical identifier')
          .closest('docs-accordion-body');
        expect(older).toHaveAttribute('hidden', 'until-found');
        expect(getComputedStyle(older as HTMLElement).display).toBe('block');
        fireEvent(
          older as HTMLElement,
          new Event('beforematch', { bubbles: true }),
        );
        await waitFor(() => {
          expect(screen.getByRole('button', { name: 'Older' })).toHaveAttribute(
            'aria-expanded',
            'true',
          );
          expect(older).not.toHaveAttribute('hidden');
        });
        expect(screen.getByRole('button', { name: 'Latest' })).toHaveAttribute(
          'aria-expanded',
          type === 'multiple' ? 'true' : 'false',
        );
        fireEvent.click(screen.getByRole('button', { name: 'Latest' }));
        if (type === 'multiple') {
          fireEvent.click(screen.getByRole('button', { name: 'Older' }));
        }
        expect(older).toHaveAttribute('hidden', 'until-found');
        fireEvent(
          older as HTMLElement,
          new Event('beforematch', { bubbles: true }),
        );
        expect(screen.getByRole('button', { name: 'Older' })).toHaveAttribute(
          'aria-expanded',
          'true',
        );
      } finally {
        style.remove();
        if (original)
          Object.defineProperty(
            HTMLElement.prototype,
            'onbeforematch',
            original,
          );
        else Reflect.deleteProperty(HTMLElement.prototype, 'onbeforematch');
      }
    },
  );

  it.each([
    '/zh-CN/realtime-media/rtc/reference/release-notes',
    '/realtime-media/rtc/reference/release-notes/',
    '/en/realtime-media/video/reference/release-notes',
  ])(
    'includes the visible platform when sharing a release from %s',
    async (path) => {
      window.history.replaceState({}, '', `${path}?example=1#overview`);
      window.localStorage.setItem('docs-portal:platform:v1', 'web');
      const writeText = vi
        .spyOn(navigator.clipboard, 'writeText')
        .mockResolvedValue(undefined);
      const components = getMDXComponents(undefined, { locale: 'zh-CN' });
      const Accordions = components.Accordions as AccordionsComponent;
      const Accordion = components.Accordion as AccordionComponent;

      render(
        <PlatformPageProvider
          locale="zh-CN"
          canonicalPlatform="android"
          platforms='["android","web"]'
        >
          <MDXAccordionProvider>
            <Accordions type="multiple" openFirst>
              <Accordion title="v4.24.8" id="v4248" headingLevel={2}>
                Web release details
              </Accordion>
            </Accordions>
          </MDXAccordionProvider>
        </PlatformPageProvider>,
      );

      fireEvent.click(screen.getByRole('button', { name: 'docs.copyLink' }));

      await waitFor(() =>
        expect(writeText).toHaveBeenCalledWith(
          `${window.location.origin}${path.replace(/\/$/, '')}/web?example=1#v4248`,
        ),
      );
      expect(window.location.pathname).toBe(path);
      writeText.mockRestore();
    },
  );

  it('keeps the explicit platform when sharing with a conflicting saved preference', async () => {
    window.history.replaceState(
      {},
      '',
      '/zh-CN/realtime-media/rtc/reference/release-notes/web?platform=android&example=1',
    );
    window.localStorage.setItem('docs-portal:platform:v1', 'android');
    const writeText = vi
      .spyOn(navigator.clipboard, 'writeText')
      .mockResolvedValue(undefined);
    const components = getMDXComponents(undefined, { locale: 'zh-CN' });
    const Accordions = components.Accordions as AccordionsComponent;
    const Accordion = components.Accordion as AccordionComponent;

    render(
      <PlatformPageProvider
        locale="zh-CN"
        canonicalPlatform="android"
        initialPlatform="web"
        platforms='["android","web"]'
      >
        <MDXAccordionProvider>
          <Accordions type="multiple" openFirst>
            <Accordion title="v4.24.8" id="v4248" headingLevel={2}>
              Web release details
            </Accordion>
          </Accordions>
        </MDXAccordionProvider>
      </PlatformPageProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'docs.copyLink' }));

    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith(
        `${window.location.origin}/zh-CN/realtime-media/rtc/reference/release-notes/web?example=1#v4248`,
      ),
    );
    writeText.mockRestore();
  });

  it('does not add a saved platform to releases without page-level platform tabs', async () => {
    window.history.replaceState({}, '', '/en/ai/release-notes?example=1');
    window.localStorage.setItem('docs-portal:platform:v1', 'android');
    const writeText = vi
      .spyOn(navigator.clipboard, 'writeText')
      .mockResolvedValue(undefined);
    const components = getMDXComponents(undefined, { locale: 'zh-CN' });
    const Accordion = components.Accordion as AccordionComponent;

    render(
      <Accordion title="v2.0" id="v20" headingLevel={2}>
        Release details
      </Accordion>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'docs.copyLink' }));

    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith(
        `${window.location.origin}/en/ai/release-notes?example=1#v20`,
      ),
    );
    writeText.mockRestore();
  });

  it('expands the version containing an encoded Chinese subsection hash', async () => {
    window.history.replaceState(
      {},
      '',
      '/zh-CN/ai/release-notes#%E9%97%AE%E9%A2%98%E4%BF%AE%E5%A4%8D-1',
    );
    const components = getMDXComponents(undefined, { locale: 'zh-CN' });
    const Accordions = components.Accordions as AccordionsComponent;
    const Accordion = components.Accordion as AccordionComponent;
    render(
      <MDXAccordionProvider>
        <Accordions type="multiple" openFirst>
          <Accordion title="v2" id="v2" headingLevel={2} value="v2">
            Latest release
          </Accordion>
          <Accordion title="v1" id="v1" headingLevel={2} value="v1">
            <h3 id="问题修复-1">问题修复</h3>
          </Accordion>
        </Accordions>
      </MDXAccordionProvider>,
    );
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'v1' })).toHaveAttribute(
        'aria-expanded',
        'true',
      ),
    );
    expect(screen.getByRole('heading', { name: '问题修复' })).toBeVisible();
  });

  it.each(['initial', 'event'])(
    'reveals the ancestor language tab for an encoded release hash (%s)',
    async (trigger) => {
      sessionStorage.setItem('release-hash', 'tongxin');
      localStorage.setItem('release-hash', 'tongxin');
      const url = '#%E9%97%AE%E9%A2%98%E4%BF%AE%E5%A4%8D';
      window.history.replaceState(
        {},
        '',
        '/zh-CN/realtime-media/rtc/reference/release-notes/electron' +
          (trigger === 'initial' ? url : ''),
      );
      const components = getMDXComponents(undefined, { locale: 'zh-CN' });
      const Tabs = components.Tabs as TabsComponent;
      const TabsList = components.TabsList as ComponentType<{
        children: ReactNode;
      }>;
      const TabsTrigger = components.TabsTrigger as TabsChildComponent;
      const TabsContent = components.TabsContent as TabsChildComponent;
      const Accordions = components.Accordions as AccordionsComponent;
      const Accordion = components.Accordion as AccordionComponent;
      render(
        <MDXAccordionProvider>
          <Tabs defaultValue="electron" groupId="release-hash" persist>
            <TabsList>
              <TabsTrigger value="electron">Electron</TabsTrigger>
              <TabsTrigger value="tongxin">统信 OS</TabsTrigger>
            </TabsList>
            <TabsContent value="electron">
              <Accordions type="multiple" openFirst>
                <Accordion title="v2" id="v2" headingLevel={2} value="v2">
                  Latest release
                </Accordion>
                <Accordion title="v1" id="v1" headingLevel={2} value="v1">
                  <h3 id="问题修复">问题修复</h3>
                </Accordion>
              </Accordions>
            </TabsContent>
            <TabsContent value="tongxin">Tongxin release</TabsContent>
          </Tabs>
        </MDXAccordionProvider>,
      );
      if (trigger === 'event')
        act(() =>
          window.dispatchEvent(
            new CustomEvent(DOCS_HASH_TARGET_EVENT, { detail: url }),
          ),
        );
      await waitFor(() =>
        expect(screen.getByRole('tab', { name: 'Electron' })).toHaveAttribute(
          'aria-selected',
          'true',
        ),
      );
      expect(screen.getByRole('button', { name: 'v1' })).toHaveAttribute(
        'aria-expanded',
        'true',
      );
      expect(screen.getByRole('heading', { name: '问题修复' })).toBeVisible();
      expect(sessionStorage.getItem('release-hash')).toBe('electron');
    },
  );

  it('copies a platform-specific release link without changing reading location', async () => {
    window.history.replaceState(
      {},
      '',
      '/realtime-media/rtm/reference/release-notes?from=overview#latest',
    );
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
    const components = getMDXComponents(undefined, { locale: 'zh-CN' });
    const Accordion = components.Accordion as AccordionComponent;
    const Panel = components._PlatformPanel as PlatformPanelComponent;
    render(
      <Panel platform="web">
        <Accordion headingLevel={2} id="224-版-2" title="2.2.4 版">
          Release body
        </Accordion>
      </Panel>,
    );
    fireEvent.click(screen.getByRole('button', { name: /copy.?link/i }));
    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith(
        `${window.location.origin}/realtime-media/rtm/reference/release-notes/web?from=overview#224-%E7%89%88-2`,
      ),
    );
    expect(window.location.search).toBe('?from=overview');
    expect(window.location.hash).toBe('#latest');
  });

  it('shares a subsection heading with its platform and existing query', async () => {
    window.history.replaceState(
      {},
      '',
      '/realtime-media/rtm/reference/release-notes?from=overview',
    );
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
    const components = getMDXComponents(undefined, { locale: 'zh-CN' });
    const Heading = components.h3 as HeadingComponent;
    const Panel = components._PlatformPanel as PlatformPanelComponent;
    render(
      <Panel platform="web">
        <Heading id="升级必看-2">升级必看</Heading>
      </Panel>,
    );
    const heading = screen.getByRole('heading', { name: '升级必看' });
    await waitFor(() =>
      expect(within(heading).getByRole('link')).toHaveAttribute(
        'href',
        '/realtime-media/rtm/reference/release-notes/web?from=overview#%E5%8D%87%E7%BA%A7%E5%BF%85%E7%9C%8B-2',
      ),
    );
    fireEvent.click(
      within(heading).getByRole('button', { name: /copy.?link/i }),
    );
    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith(
        `${window.location.origin}/realtime-media/rtm/reference/release-notes/web?from=overview#%E5%8D%87%E7%BA%A7%E5%BF%85%E7%9C%8B-2`,
      ),
    );
  });

  it('preserves release category artwork when sharing a platform heading', async () => {
    window.history.replaceState(
      {},
      '',
      '/realtime-media/rtc/reference/release-notes?from=overview',
    );
    const writeText = vi
      .spyOn(navigator.clipboard, 'writeText')
      .mockResolvedValue(undefined);
    const components = getMDXComponents(undefined, {
      contentPath: 'zh-CN/realtime-media/rtc/reference/release-notes.mdx',
    });
    const Heading = components.h3 as HeadingComponent;
    const Panel = components._PlatformPanel as PlatformPanelComponent;
    render(
      <Panel platform="web">
        <Heading id="features">新增特性</Heading>
      </Panel>,
    );
    const heading = screen.getByRole('heading', { name: '新增特性', level: 3 });
    await waitFor(() =>
      expect(within(heading).getByRole('link')).toHaveAttribute(
        'href',
        '/realtime-media/rtc/reference/release-notes/web?from=overview#features',
      ),
    );
    expect(heading.querySelector('img')).toHaveAttribute(
      'src',
      '/img/release-notes/version-feature.png',
    );
    expect(heading.querySelector('img')).toHaveAttribute('aria-hidden', 'true');
    fireEvent.click(
      within(heading).getByRole('button', { name: /copy.?link/i }),
    );
    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith(
        `${window.location.origin}/realtime-media/rtc/reference/release-notes/web?from=overview#features`,
      ),
    );
    expect(window.location.pathname).toBe(
      '/realtime-media/rtc/reference/release-notes',
    );
    writeText.mockRestore();
  });

  it.each([
    ['新增特性', 'feature'],
    ['升级必看', 'compatibility'],
    ['改进', 'improve'],
    ['问题修复', 'bugfix'],
    ['已知问题和局限性', 'fix'],
    ['API 变更', 'api'],
  ])(
    'restores the legacy icon for %s without changing its anchor or accessible label',
    (label, category) => {
      const Heading = getMDXComponents(undefined, {
        contentPath: 'zh-CN/realtime-media/rtc/reference/release-notes.mdx',
      }).h3 as HeadingComponent;
      render(
        <Heading id="category">
          <strong>{label}</strong>
        </Heading>,
      );
      const heading = screen.getByRole('heading', { name: label, level: 3 });
      expect(heading).toHaveAttribute('id', 'category');
      expect(within(heading).getByRole('link')).toHaveAttribute(
        'href',
        '#category',
      );
      expect(heading.querySelector('img')).toHaveAttribute(
        'src',
        `/img/release-notes/version-${category}.png`,
      );
      expect(heading.querySelector('img')).toHaveAttribute('alt', '');
      expect(heading.querySelector('img')).toHaveAttribute(
        'aria-hidden',
        'true',
      );
      expect(
        within(heading).getByRole('button', { name: /copy anchor/i }),
      ).toBeInTheDocument();
    },
  );

  it('keeps release icons out of ordinary guides and feature detail headings', () => {
    const GuideHeading = getMDXComponents(undefined, {
      contentPath: 'zh-CN/realtime-media/rtc/build/quickstart.mdx',
    }).h3 as HeadingComponent;
    const ReleaseHeading = getMDXComponents(undefined, {
      contentPath: 'zh-CN/realtime-media/rtc/reference/release-notes.mdx',
    }).h4 as HeadingComponent;
    render(
      <>
        <GuideHeading>问题修复</GuideHeading>
        <ReleaseHeading>视频首帧体验优化</ReleaseHeading>
      </>,
    );
    expect(
      screen.getByRole('heading', { name: '问题修复' }).querySelector('img'),
    ).toBeNull();
    expect(
      screen
        .getByRole('heading', { name: '视频首帧体验优化' })
        .querySelector('img'),
    ).toBeNull();
  });

  it('renders API signatures and return values as scroll-safe rich blocks', () => {
    const components = getMDXComponents(undefined, {
      locale: 'zh-CN',
    }) as Record<string, unknown>;
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

  it('renders transformed platform groups with persisted preference fallback and hidden inactive panels', () => {
    window.localStorage.setItem('docs-portal:platform:v1', 'ios');

    const components = getMDXComponents(undefined, {
      locale: 'zh-CN',
    }) as Record<string, unknown>;
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

  it('uses a supported stored preference before the canonical page default', () => {
    window.localStorage.setItem('docs-portal:platform:v1', 'ios');

    render(
      <PlatformHeaderTabs
        locale="zh-CN"
        canonicalPlatform="web"
        defaultPlatform="android"
        platforms='["android","ios","web","flutter"]'
      />,
    );

    expect(screen.getByRole('tab', { name: 'iOS' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(window.localStorage.getItem('docs-portal:platform:v1')).toBe('ios');
  });

  it('keeps a supported stored preference when the canonical default changes', () => {
    window.localStorage.setItem('docs-portal:platform:v1', 'ios');

    const { rerender } = render(
      <PlatformHeaderTabs
        locale="zh-CN"
        canonicalPlatform="web"
        defaultPlatform="android"
        platforms='["android","ios","web"]'
      />,
    );

    expect(screen.getByRole('tab', { name: 'iOS' })).toHaveAttribute(
      'aria-selected',
      'true',
    );

    rerender(
      <PlatformHeaderTabs
        locale="zh-CN"
        canonicalPlatform="web"
        defaultPlatform="web"
        platforms='["android","ios","web"]'
      />,
    );

    expect(screen.getByRole('tab', { name: 'iOS' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('falls back to the page default when the stored preference is unsupported', () => {
    window.localStorage.setItem('docs-portal:platform:v1', 'ios');

    render(
      <PlatformHeaderTabs
        locale="zh-CN"
        canonicalPlatform="web"
        defaultPlatform="android"
        platforms='["android","web"]'
      />,
    );

    expect(screen.getByRole('tab', { name: 'Android' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(window.localStorage.getItem('docs-portal:platform:v1')).toBe('ios');
  });

  it('ignores unsupported preference events for the current platform group', () => {
    render(
      <PlatformHeaderTabs
        locale="zh-CN"
        canonicalPlatform="web"
        defaultPlatform="android"
        platforms='["android","web"]'
      />,
    );

    window.dispatchEvent(
      new CustomEvent(PLATFORM_PREFERENCE_EVENT, { detail: 'ios' }),
    );

    expect(screen.getByRole('tab', { name: 'Android' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('updates the selected tab when the route platform changes', () => {
    const { rerender } = render(
      <PlatformHeaderTabs
        locale="zh-CN"
        canonicalPlatform="web"
        initialPlatform="android"
        platforms='["android","ios","web"]'
      />,
    );

    expect(screen.getByRole('tab', { name: 'Android' })).toHaveAttribute(
      'aria-selected',
      'true',
    );

    rerender(
      <PlatformHeaderTabs
        locale="zh-CN"
        canonicalPlatform="web"
        initialPlatform="ios"
        platforms='["android","ios","web"]'
      />,
    );

    expect(screen.getByRole('tab', { name: 'iOS' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('reveals a hash-selected platform without discarding the deep link', async () => {
    const url =
      '/zh-CN/realtime-media/rtc/reference/error-code?from=legacy#%E9%94%99%E8%AF%AF%E7%A0%81';
    window.history.replaceState({}, '', url);
    window.localStorage.setItem('docs-portal:platform:v1', 'android');
    const components = getMDXComponents(undefined, {
      locale: 'zh-CN',
    }) as Record<string, unknown>;
    const Group = components._PlatformTabsGroup as PlatformGroupComponent;
    const Panel = components._PlatformPanel as PlatformPanelComponent;
    render(
      <PlatformPageProvider
        locale="zh-CN"
        canonicalPlatform="android"
        defaultPlatform="android"
        platforms='["android","ios"]'
      >
        <Group
          canonicalPlatform="android"
          groupMode="structured"
          tabsPlacement="header"
          platforms='["android","ios"]'
        >
          <Panel platform="android">
            <h2 id="android-section">Android body</h2>
          </Panel>
          <Panel platform="ios">
            <h2 id="错误码">iOS error codes</h2>
          </Panel>
        </Group>
      </PlatformPageProvider>,
    );
    await waitFor(() =>
      expect(screen.getByText('iOS error codes')).toBeVisible(),
    );
    expect(
      window.location.pathname + window.location.search + window.location.hash,
    ).toBe(url);
    act(() => {
      window.history.replaceState({}, '', '#android-section');
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });
    await waitFor(() => expect(screen.getByText('Android body')).toBeVisible());
    expect(window.location.hash).toBe('#android-section');
  });

  it.each(['lazy content', 'hash target event'])(
    'reveals the platform after %s arrives',
    async (trigger) => {
      window.history.replaceState(
        {},
        '',
        '/zh-CN/realtime-media/rtc/reference/error-code#late-ios',
      );
      const components = getMDXComponents(undefined, {
        locale: 'zh-CN',
      }) as Record<string, unknown>;
      const Group = components._PlatformTabsGroup as PlatformGroupComponent;
      const Panel = components._PlatformPanel as PlatformPanelComponent;
      const content = (ready: boolean) => (
        <Group
          canonicalPlatform="android"
          groupMode="structured"
          platforms='["android","ios"]'
        >
          <Panel platform="android">Android instructions</Panel>
          <Panel platform="ios">
            {ready ? (
              <h2 id="late-ios">Lazy iOS section</h2>
            ) : (
              <span>Loading</span>
            )}
          </Panel>
        </Group>
      );
      if (trigger === 'hash target event')
        window.history.replaceState({}, '', '#unknown');
      const view = render(content(trigger === 'hash target event'));
      expect(screen.getByText('Android instructions')).toBeVisible();
      if (trigger === 'lazy content') view.rerender(content(true));
      else
        act(() =>
          window.dispatchEvent(
            new CustomEvent(DOCS_HASH_TARGET_EVENT, { detail: '#late-ios' }),
          ),
        );
      await waitFor(() =>
        expect(screen.getByText('Lazy iOS section')).toBeVisible(),
      );
      expect(window.location.hash).toBe(
        trigger === 'lazy content' ? '#late-ios' : '#unknown',
      );
    },
  );

  it('uses URL platform as initial selection and pushes platform paths on tab click', () => {
    window.history.replaceState(
      {},
      '',
      '/en/realtime-media/rtc/quick-start/integrate-with-ai-tools/ios?platform=ios&example=1#token',
    );

    const components = getMDXComponents(undefined, {
      locale: 'zh-CN',
    }) as Record<string, unknown>;
    const Group = components._PlatformTabsGroup as PlatformGroupComponent;
    const Panel = components._PlatformPanel as PlatformPanelComponent;

    render(
      <>
        <PlatformHeaderTabs
          locale="zh-CN"
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
    expect(window.location.hash).toBe('');
    expect(window.location.search).toBe('?example=1');
    expect(
      screen.getByText('Android instructions').closest('section'),
    ).toBeVisible();
  });

  it('renders fenced code with shared chrome and its explicit language label', () => {
    const components = getMDXComponents(undefined, { locale: 'zh-CN' });
    const Pre = components.pre as CodeBlockPreComponent;

    render(
      <Pre className="language-bash" title="Install" data-language-label="Bash">
        <code>
          <span className="line">npm install @agora/sdk</span>
        </code>
      </Pre>,
    );

    const figure = screen.getByText('Bash').closest('figure');

    expect(figure).not.toBeNull();
    const codeBlock = figure as HTMLElement;
    expect(codeBlock).toBeInTheDocument();
    expect(codeBlock).toHaveClass('bg-fd-card');
    expect(codeBlock).toHaveClass('shadow-none');
    expect(codeBlock).toHaveAttribute('data-line-numbers', 'true');
    expect(within(codeBlock).getByText('Bash')).toBeInTheDocument();
    expect(within(codeBlock).queryByText('Install')).not.toBeInTheDocument();
    expect(
      within(codeBlock).getByRole('button', { name: 'Copy Text' }),
    ).toBeInTheDocument();
    expect(codeBlock).toHaveTextContent('npm install @agora/sdk');
  });

  it('shares one frame between the code tabs and their selected sample', () => {
    const components = getMDXComponents(undefined, { locale: 'zh-CN' });
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
    expect(screen.getByRole('tablist').closest('.docs-code-tabs')).toHaveClass(
      'border',
      'rounded-xl',
      'bg-fd-card',
    );
    expect(
      screen.getByText('print("hello")').closest('[role=tabpanel]'),
    ).toHaveClass('p-0');
    expect(
      screen.getByText('print("hello")').closest('figure'),
    ).toHaveAttribute('data-code-tabbed');
    expect(screen.getByText('console.log("hello")')).toBeInTheDocument();
    expect(
      screen.getByText('console.log("hello")').closest('[role=tabpanel]'),
    ).not.toBeVisible();
  });

  it('renders table parameter lists with nested fields inside the description cell', () => {
    const components = getMDXComponents(undefined, { locale: 'zh-CN' });
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

    expect(screen.getAllByText('Parameter')).toHaveLength(1);
    expect(screen.getAllByText('Description')).toHaveLength(1);

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
});
