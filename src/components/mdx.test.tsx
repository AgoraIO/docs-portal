import { act, fireEvent, render, screen, within } from '@testing-library/react';
import * as fumadocsTabs from 'fumadocs-ui/components/tabs';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { ComponentType, ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PLATFORM_PREFERENCE_EVENT } from '@/lib/platforms/preference';
import {
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
type CodeBlockPreComponent = ComponentType<{
  children: ReactNode;
  className?: string;
  title?: string;
  'data-line-numbers'?: boolean;
  'data-line-numbers-start'?: number | string;
}>;
type AnchorComponent = ComponentType<{
  children: ReactNode;
  href: string;
}>;
type ImageComponent = ComponentType<{
  alt?: string;
  src?: string;
}>;
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
}>;
type ParameterComponent = ComponentType<{
  children: ReactNode;
  defaultValue?: ReactNode;
  name?: ReactNode;
  nullable?: boolean;
  optional?: boolean;
  possibleValues?: ReactNode;
  required?: boolean;
  type?: ReactNode;
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

  it('uses Fumadocs MDX defaults except for repo-specific links and commands', () => {
    const components = getMDXComponents() as Record<string, unknown>;
    const defaults = defaultMdxComponents as Record<string, unknown>;

    expect(components.img).not.toBe(defaults.img);
    expect(components.table).toBe(defaults.table);
    expect(components.Card).not.toBe(defaults.Card);
    expect(components.Cards).toBe(defaults.Cards);
    expect(components.Callout).toBe(defaults.Callout);

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
    expect(components.h2).toBe(defaults.h2);
    expect(components.h3).toBe(defaults.h3);

    expect(components.Tabs).not.toBe(fumadocsTabs.Tabs);
    expect(components.Tab).toBe(fumadocsTabs.Tab);
    expect(components.TabsList).toBe(fumadocsTabs.TabsList);
    expect(components.TabsTrigger).toBe(fumadocsTabs.TabsTrigger);
    expect(components.TabsContent).not.toBe(fumadocsTabs.TabsContent);
  });

  it('opens MDX images in a zoom dialog', async () => {
    const components = getMDXComponents();
    const Image = components.img as ImageComponent;

    render(<Image alt="Product Architecture" src="/images/product.png" />);

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Zoom image: Product Architecture',
      }),
    );

    const dialog = await screen.findByRole('dialog');

    expect(dialog).toHaveTextContent('Product Architecture');
    expect(dialog).toHaveTextContent('Enlarged documentation image preview.');
    expect(
      within(dialog).getByRole('img', { name: 'Product Architecture' }),
    ).toHaveAttribute('src', '/images/product.png');
  });

  it('keeps relative docs links normalized', () => {
    const components = getMDXComponents(undefined, {
      contentPath: 'en/ai/index.md',
    });
    const Anchor = components.a as AnchorComponent;

    render(<Anchor href="get-started/quickstart.md">Quickstart</Anchor>);

    expect(screen.getByRole('link', { name: 'Quickstart' })).toHaveAttribute(
      'href',
      '/en/ai/get-started/quickstart',
    );
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

  it('supports legacy MDX Link components that pass destinations via to', () => {
    const components = getMDXComponents(undefined, {
      contentPath: 'en/realtime-media/broadcast-streaming/build/index.mdx',
    });
    const Link = components.Link as LegacyLinkComponent;

    render(<Link to="../index.mdx">SDK quickstart</Link>);

    expect(
      screen.getByRole('link', { name: 'SDK quickstart' }),
    ).toHaveAttribute('href', '/en/realtime-media/broadcast-streaming');
  });

  it('adds jump affordance and normalizes docs card links', () => {
    const components = getMDXComponents(undefined, {
      contentPath: 'en/ai/index.md',
    });
    const Card = components.Card as CardComponent;

    render(
      <Card
        description="Build and run a working voice agent in under 15 minutes."
        href="choose-your-path/quickstart-coding.mdx"
        title="Quickstart"
      />,
    );

    const card = screen.getByRole('link', { name: /Quickstart/i });

    expect(card).toHaveAttribute(
      'href',
      '/en/ai/choose-your-path/quickstart-coding',
    );
    expect(card).toHaveClass('docs-card-link');
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
          name="metadata"
          optional
          possibleValues="provider-specific object"
          type="object"
        >
          <p>Provider-specific metadata.</p>
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
    expect(screen.getAllByText('optional')).toHaveLength(2);
    expect(screen.getByText('Default value')).toBeVisible();
    expect(screen.getByText('{}')).toBeVisible();
    expect(screen.getByText('Possible values')).toBeVisible();
    expect(screen.getByText('provider-specific object')).toBeVisible();
    expect(screen.getByText('metadata.request_id')).toBeVisible();
    expect(screen.getAllByText('nullable')).toHaveLength(2);
    expect(screen.getByText('Optional request identifier.')).toBeVisible();
  });

  it('registers platform sentinels and internal platform renderers', () => {
    const components = getMDXComponents() as Record<string, unknown>;

    expect(components.RTCMinutesCalculator).toBeDefined();
    expect(components.PlatformInline).toBeDefined();
    expect(components.PlatformStructured).toBeDefined();
    expect(components.ParameterList).toBeDefined();
    expect(components.Parameter).toBeDefined();
    expect(components._PlatformTabsGroup).toBeDefined();
    expect(components._PlatformPanel).toBeDefined();
    expect(components.Slot).toBeUndefined();
  });

  it('exports parameter components for direct MDX imports', () => {
    const components = getMDXComponents() as Record<string, unknown>;

    expect(ParameterList).toBe(components.ParameterList);
    expect(Parameter).toBe(components.Parameter);
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

  it('renders compact header platforms, defaults to the first platform, and moves overflow into More', async () => {
    const components = getMDXComponents() as Record<string, unknown>;
    const Group = components._PlatformTabsGroup as PlatformGroupComponent;
    const Panel = components._PlatformPanel as PlatformPanelComponent;

    render(
      <>
        <PlatformHeaderTabs
          canonicalPlatform="web"
          defaultPlatform="android"
          platforms='["android","ios","macos","web","windows","flutter","react-native","unity"]'
        />
        <Group
          canonicalPlatform="web"
          defaultPlatform="android"
          groupMode="structured"
          platforms='["android","ios","macos","web","windows","flutter","react-native","unity"]'
          tabsPlacement="header"
        >
          <Panel platform="android">Android instructions</Panel>
          <Panel platform="web">Web instructions</Panel>
          <Panel platform="flutter">Flutter instructions</Panel>
        </Group>
      </>,
    );

    const tablist = screen.getByRole('tablist', { name: 'Platform' });
    const headerGroup = tablist.closest('[data-platform-header-tabs="true"]');
    const moreButton = screen.getByRole('button', { name: 'More platforms' });

    expect(headerGroup).toHaveClass('inline-flex');
    expect(headerGroup).toHaveClass('max-w-full');
    expect(headerGroup).toHaveClass('gap-4');
    expect(headerGroup).toHaveClass('overflow-visible');
    expect(tablist).toHaveClass('flex-1');
    expect(tablist).toHaveClass('overflow-x-auto');
    expect(tablist).toHaveClass('overflow-y-hidden');
    expect(tablist).toHaveClass('docs-scrollbar');
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
    expect(screen.queryByRole('tab', { name: 'macOS' })).toBeNull();
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

    expect(screen.getByRole('tab', { name: 'Flutter' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
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

  it('keeps an initial overflow platform visible as a selected header tab', () => {
    const originalScrollIntoView = window.HTMLElement.prototype.scrollIntoView;
    const scrollIntoView = vi.fn();
    window.HTMLElement.prototype.scrollIntoView = scrollIntoView;

    try {
      render(
        <PlatformHeaderTabs
          canonicalPlatform="web"
          initialPlatform="flutter"
          platforms='["android","ios","web","flutter","unity"]'
        />,
      );
    } finally {
      if (originalScrollIntoView) {
        window.HTMLElement.prototype.scrollIntoView = originalScrollIntoView;
      } else {
        delete (window.HTMLElement.prototype as Partial<HTMLElement>)
          .scrollIntoView;
      }
    }

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
    window.history.replaceState({}, '', '/en/ai/get-started/test-mdx-comps');

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

    expect(window.location.pathname).toBe('/en/ai/get-started/test-mdx-comps');
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
