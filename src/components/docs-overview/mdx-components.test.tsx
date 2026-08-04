import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import type { ComponentType, ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { getOverviewMDXComponents } from './mdx-components';

type SolutionCardGridComponent = ComponentType<{
  children: ReactNode;
  size?: 'large' | 'small';
}>;
type SolutionCardComponent = ComponentType<{
  actions?: Array<{ href: string; label: string }>;
  description: string;
  href?: string;
  icon?: 'ai' | 'classroom' | 'device' | 'meeting' | 'messaging' | 'rtc';
  size?: 'large' | 'small';
  tags?: string[];
  title: string;
  tone?: 'blue' | 'green' | 'pink' | 'purple' | 'sand';
}>;
type OverviewToolkitsComponent = ComponentType<{ children: ReactNode }>;
type ToolkitGroupComponent = ComponentType<{
  children: ReactNode;
  title: string;
}>;
type ToolkitItemComponent = ComponentType<{
  href: string;
  icon:
    | 'android'
    | 'cli'
    | 'go'
    | 'ios'
    | 'mcp'
    | 'messaging'
    | 'python'
    | 'rest'
    | 'rtc'
    | 'server'
    | 'skills'
    | 'stt'
    | 'studio'
    | 'typescript'
    | 'web';
  label: string;
}>;
type CardGridComponent = ComponentType<{ children: ReactNode }>;
type FeatureCardComponent = ComponentType<{
  children: ReactNode;
  title: string;
}>;
type CapabilityGroupGridComponent = ComponentType<{ children: ReactNode }>;
type CapabilityGroupCardComponent = ComponentType<{
  description: string;
  items: string[];
  title: string;
}>;
type CapabilityMatrixComponent = ComponentType<{
  rows: Array<{
    description: string;
    items: string[];
    title: string;
  }>;
}>;
type OverviewLinkBannerComponent = ComponentType<{
  description: string;
  href: string;
  title: string;
}>;
type OverviewActionsComponent = ComponentType<{
  actions: Array<{ href: string; label: string }>;
}>;
type OverviewImageCardGridComponent = ComponentType<{
  children: ReactNode;
  columns?: 'three' | 'two';
}>;
type OverviewImageCardComponent = ComponentType<{
  compact?: boolean;
  description: string;
  href?: string;
  imageAlt: string;
  imageSrc: string;
  title: string;
}>;
type HelpHubComponent = ComponentType<{
  cards: Array<{
    cta: string;
    description: string;
    href: string;
    icon: 'blog' | 'discord' | 'stack-overflow' | 'status' | 'ticket';
    title: string;
  }>;
  knowledgeBase: Array<{
    href: string;
    label: string;
  }>;
  locale?: 'en' | 'zh-CN';
  topics: Array<{
    href: string;
    label: string;
  }>;
}>;
type OverviewSpotlightCardComponent = ComponentType<{
  description?: string;
  href: string;
  size?: 'large' | 'small';
  title: string;
  variant?: 'checklist' | 'code' | 'platform';
}>;
type RecipesCatalogComponent = ComponentType<{
  allCategoriesLabel: string;
  allProductsLabel: string;
  allStacksLabel: string;
  categoryFilterLabel: string;
  clearFiltersLabel: string;
  emptyMessage: string;
  groupByProduct?: boolean;
  items: Array<{
    category: string;
    description: string;
    href?: string;
    links?: Array<{
      href: string;
      label: string;
    }>;
    product: string;
    stack?: string;
    tags?: string[];
    title: string;
    tone?: 'blue' | 'green' | 'pink' | 'purple' | 'sand';
  }>;
  productGroups?: Record<
    string,
    {
      description?: string;
      icon?: string;
      title?: string;
    }
  >;
  productFilterLabel: string;
  searchPlaceholder: string;
  showCategoryFilter?: boolean;
  showDescription?: boolean;
  showTags?: boolean;
  stackFilterLabel: string;
  stackQueryParam?: string;
}>;
type DemoGalleryComponent = ComponentType<{
  allPlatformsLabel: string;
  allProductsLabel: string;
  allTagsLabel: string;
  clearFiltersLabel: string;
  emptyMessage: string;
  items: Array<{
    description: string;
    href: string;
    imageAlt: string;
    imageSrc: string;
    platforms: string[];
    products: string[];
    releaseDate: string;
    tags: string[];
    title: string;
    version: string;
  }>;
  platformFilterLabel: string;
  platformLabel: string;
  productFilterLabel: string;
  productLabel: string;
  releaseDateLabel: string;
  resultCountLabel: string;
  searchPlaceholder: string;
  tagFilterLabel: string;
  versionLabel: string;
}>;
type DemoPlatformTabsComponent = ComponentType<{
  children: ReactNode;
  defaultValue: string;
  platforms: Array<{ label: string; value: string }>;
}>;
type DemoPlatformComponent = ComponentType<{
  children: ReactNode;
  value: string;
}>;
type DemoMediaComponent = ComponentType<{
  imageAlt: string;
  imageSrc: string;
  qrCodeAlt: string;
  qrCodeSrc: string;
  qrLabel: string;
}>;

describe('overview MDX components', () => {
  it('renders compact overview actions with working internal and external links', () => {
    const components = getOverviewMDXComponents('zh-CN/ai/aigc/index.mdx');
    const OverviewActions =
      components.OverviewActions as OverviewActionsComponent;

    render(
      <OverviewActions
        actions={[
          {
            href: '/zh-CN/reference/sdks?product=video',
            label: '下载',
          },
          {
            href: 'https://console.shengwang.cn/marketplace/list/all',
            label: '购买插件',
          },
        ]}
      />,
    );

    const downloadsLink = screen.getByRole('link', { name: '下载' });
    expect(downloadsLink).toHaveAttribute(
      'href',
      '/zh-CN/reference/sdks?product=video',
    );
    expect(downloadsLink).not.toHaveAttribute('target');

    const marketplaceLink = screen.getByRole('link', { name: '购买插件' });
    expect(marketplaceLink).toHaveAttribute(
      'href',
      'https://console.shengwang.cn/marketplace/list/all',
    );
    expect(marketplaceLink).toHaveAttribute('target', '_blank');
    expect(marketplaceLink).toHaveAttribute('rel', 'noreferrer noopener');
  });

  it('does not render overview actions outside approved overview pages', () => {
    const components = getOverviewMDXComponents(
      'zh-CN/realtime-media/rtc/reference/billing.mdx',
    );
    const OverviewActions =
      components.OverviewActions as OverviewActionsComponent;

    render(
      <OverviewActions
        actions={[
          {
            href: '/zh-CN/reference/sdks?product=video',
            label: '下载',
          },
        ]}
      />,
    );

    expect(screen.queryByRole('link', { name: '下载' })).toBeNull();
  });

  it('renders solution cards as overview widgets', () => {
    const components = getOverviewMDXComponents();
    const SolutionCardGrid =
      components.SolutionCardGrid as SolutionCardGridComponent;
    const SolutionCard = components.SolutionCard as SolutionCardComponent;

    const { container } = render(
      <SolutionCardGrid>
        <SolutionCard
          description="Build realtime voice experiences."
          href="/en/realtime-media/voice"
          icon="rtc"
          tags={['Voice', 'RTC']}
          title="Voice Calling"
          tone="blue"
        />
      </SolutionCardGrid>,
    );

    expect(
      screen.getByRole('link', { name: /Voice Calling/i }),
    ).toHaveAttribute('href', '/en/realtime-media/voice');
    expect(screen.getByText('Build realtime voice experiences.')).toBeVisible();
    expect(screen.getByText('Voice')).toBeVisible();
    expect(container.querySelector('section')).toHaveClass(
      'w-[var(--content-max)]',
      'max-w-full',
    );
  });

  it('supports multiple labeled actions that share one target', () => {
    const components = getOverviewMDXComponents();
    const SolutionCard = components.SolutionCard as SolutionCardComponent;
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    render(
      <SolutionCard
        actions={[
          { href: '/reference/configuration', label: 'Android' },
          { href: '/reference/configuration', label: 'iOS' },
        ]}
        description="One reference with platform variants."
        title="Configuration"
      />,
    );

    expect(screen.getByRole('link', { name: /Android/i })).toHaveAttribute(
      'href',
      '/reference/configuration',
    );
    expect(screen.getByRole('link', { name: /iOS/i })).toHaveAttribute(
      'href',
      '/reference/configuration',
    );
    expect(consoleError).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it('renders toolkit groups for the docs home overview', () => {
    const components = getOverviewMDXComponents();
    const OverviewToolkits =
      components.OverviewToolkits as OverviewToolkitsComponent;
    const ToolkitGroup = components.ToolkitGroup as ToolkitGroupComponent;
    const ToolkitItem = components.ToolkitItem as ToolkitItemComponent;

    render(
      <OverviewToolkits>
        <ToolkitGroup title="Agent frameworks">
          <ToolkitItem
            href="/en/ai/get-started/quickstart"
            icon="python"
            label="Python"
          />
        </ToolkitGroup>
      </OverviewToolkits>,
    );

    expect(screen.getByText('Agent frameworks')).toBeVisible();
    expect(screen.getByRole('link', { name: /Python/i })).toHaveAttribute(
      'href',
      '/en/ai/get-started/quickstart',
    );
  });

  it('renders the help hub layout for introduction resources', () => {
    const components = getOverviewMDXComponents();
    const HelpHub = components.HelpHub as HelpHubComponent;

    render(
      <HelpHub
        cards={[
          {
            cta: 'Create a ticket',
            description: 'Log in to submit a ticket through the Console.',
            href: 'https://agoraio.zendesk.com/hc/en-us',
            icon: 'ticket',
            title: 'Support tickets',
          },
        ]}
        knowledgeBase={[
          {
            href: '/en/introduction/support',
            label: 'How to implement basic HTTP authentication?',
          },
        ]}
        topics={[
          {
            href: '/en/introduction/support',
            label: 'Integration issues',
          },
        ]}
      />,
    );

    expect(
      screen.getByText(
        'Choose the fastest path for product questions, service health, and community support.',
      ),
    ).toBeVisible();
    expect(
      screen.getByRole('link', { name: /Support tickets/i }),
    ).toHaveAttribute('href', 'https://agoraio.zendesk.com/hc/en-us');
    expect(screen.getByText('Popular Knowledge Base')).toBeVisible();
    expect(
      screen.getByRole('link', {
        name: /How to implement basic HTTP authentication/i,
      }),
    ).toHaveAttribute('href', '/en/introduction/support');
    expect(
      screen.getByRole('link', { name: /Integration issues/i }),
    ).toHaveAttribute('href', '/en/introduction/support');
  });

  it('renders localized help hub copy for Chinese pages', () => {
    const components = getOverviewMDXComponents();
    const HelpHub = components.HelpHub as HelpHubComponent;

    render(
      <HelpHub
        locale="zh-CN"
        cards={[
          {
            cta: '查看博客',
            description: '阅读产品动态、技术实践和开发者案例。',
            href: 'https://www.shengwang.cn/blog/',
            icon: 'blog',
            title: '声网博客',
          },
        ]}
        knowledgeBase={[
          {
            href: '/zh-CN/reference/faq/quality/video_blank',
            label: '如何排查黑屏问题？',
          },
        ]}
        topics={[
          {
            href: '/zh-CN/reference/faq/integration',
            label: '集成问题',
          },
        ]}
      />,
    );

    expect(
      screen.getByText(
        '选择最快的支持渠道，获取产品问题、服务状态和社区资源帮助。',
      ),
    ).toBeVisible();
    expect(screen.getByText('热门知识库')).toBeVisible();
    expect(screen.getByText('快速解答')).toBeVisible();
    expect(screen.getByText('按主题浏览')).toBeVisible();
    expect(screen.getByRole('link', { name: /声网博客/ })).toHaveAttribute(
      'href',
      'https://www.shengwang.cn/blog/',
    );
  });

  it('renders feature cards for editorial introduction pages', () => {
    const components = getOverviewMDXComponents();
    const CardGrid = components.CardGrid as CardGridComponent;
    const FeatureCard = components.FeatureCard as FeatureCardComponent;

    render(
      <CardGrid>
        <FeatureCard title="Realtime audio and video apps">
          Build calling and classroom products.
        </FeatureCard>
      </CardGrid>,
    );

    expect(
      screen.getByText('Realtime audio and video apps'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Build calling and classroom products.'),
    ).toBeVisible();
  });

  it('renders capability group cards for grouped overview sections', () => {
    const components = getOverviewMDXComponents();
    const CapabilityGroupGrid =
      components.CapabilityGroupGrid as CapabilityGroupGridComponent;
    const CapabilityGroupCard =
      components.CapabilityGroupCard as CapabilityGroupCardComponent;

    render(
      <CapabilityGroupGrid>
        <CapabilityGroupCard
          description="Sessions where users exchange media or state in real time."
          items={['Voice & Video', 'Signaling']}
          title="Build live interaction"
        />
      </CapabilityGroupGrid>,
    );

    expect(screen.getByText('Build live interaction')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Sessions where users exchange media or state in real time.',
      ),
    ).toBeVisible();
    expect(screen.getByText('Voice & Video')).toBeVisible();
    expect(screen.getByText('Signaling')).toBeVisible();
  });

  it('renders capability matrix rows for structured overview sections', () => {
    const components = getOverviewMDXComponents();
    const CapabilityMatrix =
      components.CapabilityMatrix as CapabilityMatrixComponent;

    render(
      <CapabilityMatrix
        rows={[
          {
            description: 'Exchange media and state in real time.',
            items: ['Voice & Video', 'Signaling'],
            title: 'Build live interaction',
          },
        ]}
      />,
    );

    expect(screen.getByText('Capability area')).toBeVisible();
    expect(screen.getByText('What it covers')).toBeVisible();
    expect(screen.getByText('Includes')).toBeVisible();
    expect(screen.getByText('Build live interaction')).toBeVisible();
    expect(
      screen.getByText('Exchange media and state in real time.'),
    ).toBeVisible();
    expect(screen.getByText('Voice & Video')).toBeVisible();
    expect(screen.getByText('Signaling')).toBeVisible();
  });

  it('renders overview link banners for section-level entry points', () => {
    const components = getOverviewMDXComponents();
    const OverviewLinkBanner =
      components.OverviewLinkBanner as OverviewLinkBannerComponent;

    render(
      <OverviewLinkBanner
        description="See the full capability map for live interaction and media delivery."
        href="/en/realtime-media/overview"
        title="Explore Realtime & Media overview"
      />,
    );

    expect(
      screen.getByRole('link', { name: /Explore Realtime & Media overview/i }),
    ).toHaveAttribute('href', '/en/realtime-media/overview');
    expect(
      screen.getByText(
        'See the full capability map for live interaction and media delivery.',
      ),
    ).toBeVisible();
  });

  it('renders overview image cards as non-clickable showcases', () => {
    const components = getOverviewMDXComponents();
    const OverviewImageCardGrid =
      components.OverviewImageCardGrid as OverviewImageCardGridComponent;
    const OverviewImageCard =
      components.OverviewImageCard as OverviewImageCardComponent;

    render(
      <OverviewImageCardGrid>
        <OverviewImageCard
          description="Define how users exchange media inside a live session."
          imageAlt="Video calling overview"
          imageSrc="https://assets-docs.agora.io/images/video-calling/video-calling-overview.png"
          title="Build live interaction"
        />
      </OverviewImageCardGrid>,
    );

    expect(
      screen.queryByRole('link', { name: /Build live interaction/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(
        'Define how users exchange media inside a live session.',
      ),
    ).toBeVisible();
    expect(screen.getByAltText('Video calling overview')).toHaveAttribute(
      'src',
      'https://assets-docs.agora.io/images/video-calling/video-calling-overview.png',
    );
  });

  it('renders overview spotlight descriptions when provided', () => {
    const components = getOverviewMDXComponents();
    const OverviewSpotlightCard =
      components.OverviewSpotlightCard as OverviewSpotlightCardComponent;

    render(
      <OverviewSpotlightCard
        description="Run a working voice agent in under 15 minutes."
        href="/en/ai/choose-your-path/quickstart-coding"
        size="small"
        title="Voice agent quickstart"
        variant="code"
      />,
    );

    expect(
      screen.getByRole('link', { name: /Voice agent quickstart/i }),
    ).toHaveAttribute('href', '/en/ai/choose-your-path/quickstart-coding');
    expect(
      screen.getByText('Run a working voice agent in under 15 minutes.'),
    ).toBeVisible();
  });

  it('filters recipe catalog cards by selected category and search query', () => {
    const components = getOverviewMDXComponents();
    const RecipesCatalog = components.RecipesCatalog as RecipesCatalogComponent;

    render(
      <RecipesCatalog
        allCategoriesLabel="All recipe types"
        allProductsLabel="All products"
        allStacksLabel="All stacks"
        categoryFilterLabel="Recipe type"
        clearFiltersLabel="Clear filters"
        emptyMessage="No recipes match the current filters."
        items={[
          {
            category: 'Quickstart',
            description: 'Create a voice agent in Python.',
            href: '/en/api-reference/recipes/python-quickstart',
            product: 'Voice AI',
            stack: 'Python',
            title: 'Python Quickstart',
            tone: 'blue',
          },
          {
            category: 'Use case',
            description: 'A wellness-oriented scenario reference.',
            href: '/en/api-reference/recipes/wellness-coach',
            product: 'Voice AI',
            stack: 'Python',
            title: 'Wellness Coach',
            tone: 'pink',
          },
        ]}
        productFilterLabel="Product"
        searchPlaceholder="Search recipes"
        stackFilterLabel="Stack"
      />,
    );

    expect(
      screen.getByRole('link', { name: /Python Quickstart/i }),
    ).toBeVisible();
    expect(screen.getByRole('link', { name: /Wellness Coach/i })).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Use case' }));

    expect(
      screen.queryByRole('link', { name: /Python Quickstart/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Wellness Coach/i })).toBeVisible();

    fireEvent.change(screen.getByPlaceholderText('Search recipes'), {
      target: { value: 'nomatch' },
    });

    expect(
      screen.getByText('No recipes match the current filters.'),
    ).toBeVisible();
  });

  it('renders Demo images and filters cards by supported platform', () => {
    const components = getOverviewMDXComponents();
    const DemoGallery = components.DemoGallery as DemoGalleryComponent;

    render(
      <DemoGallery
        allPlatformsLabel="全部平台"
        allProductsLabel="全部产品"
        allTagsLabel="全部标签"
        clearFiltersLabel="清除筛选"
        emptyMessage="没有符合条件的 Demo。"
        items={[
          {
            description: '泛娱乐全场景体验。',
            href: '/zh-CN/reference/demo/shengdong-entertainment',
            imageAlt: '声动互娱 Demo 封面',
            imageSrc:
              'https://assets-docs.agora.io/images/demo/shengdong-entertainment-cover.jpg',
            platforms: ['iOS', 'Android'],
            products: ['实时互动 RTC'],
            releaseDate: '2023-12-27',
            tags: ['语聊房'],
            title: '声动互娱',
            version: '4.6.0',
          },
          {
            description: '多框架 Web 前端 Demo 合集。',
            href: '/zh-CN/reference/demo/rtm-web-demo',
            imageAlt: '实时消息 RTM Web Demo 封面',
            imageSrc:
              'https://assets-docs.agora.io/images/demo/rtm-web-demo-cover.png',
            platforms: ['Web'],
            products: ['实时消息 RTM'],
            releaseDate: '2026-04-10',
            tags: ['SDK 示例'],
            title: '实时消息 RTM Web Demo',
            version: '2.2.3',
          },
        ]}
        platformFilterLabel="平台"
        platformLabel="平台"
        productFilterLabel="产品与 SDK"
        productLabel="产品"
        releaseDateLabel="发布时间"
        resultCountLabel="个 Demo"
        searchPlaceholder="搜索 Demo"
        tagFilterLabel="标签"
        versionLabel="版本"
      />,
    );

    expect(screen.getByAltText('声动互娱 Demo 封面')).toHaveAttribute(
      'src',
      'https://assets-docs.agora.io/images/demo/shengdong-entertainment-cover.jpg',
    );
    expect(screen.getByRole('link', { name: /声动互娱/ })).toHaveAttribute(
      'href',
      '/zh-CN/reference/demo/shengdong-entertainment',
    );
    expect(screen.getByText('2 个 Demo')).toBeVisible();
    expect(screen.getAllByText('产品：')[0]).toHaveClass(
      'shrink-0',
      'whitespace-nowrap',
    );

    fireEvent.change(screen.getByRole('combobox', { name: '平台' }), {
      target: { value: 'Web' },
    });

    expect(
      screen.queryByRole('link', { name: /声动互娱/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /实时消息 RTM Web Demo/ }),
    ).toBeVisible();
    expect(screen.getByText('1 个 Demo')).toBeVisible();
  });

  it('renders the Demo platform switcher and keeps the selected platform in the URL', async () => {
    window.history.replaceState({}, '', '/zh-CN/reference/demo/agora-lab');

    const components = getOverviewMDXComponents();
    const DemoPlatformTabs =
      components.DemoPlatformTabs as DemoPlatformTabsComponent;
    const DemoPlatform = components.DemoPlatform as DemoPlatformComponent;

    render(
      <DemoPlatformTabs
        defaultValue="ios"
        platforms={[
          { label: 'iOS', value: 'ios' },
          { label: 'Android', value: 'android' },
        ]}
      >
        <DemoPlatform value="ios">iOS Demo</DemoPlatform>
        <DemoPlatform value="android">Android Demo</DemoPlatform>
      </DemoPlatformTabs>,
    );

    expect(screen.getByRole('tablist', { name: '选择平台' })).toBeVisible();
    expect(screen.getByRole('tab', { name: 'iOS' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByText('iOS Demo')).toBeVisible();

    fireEvent.mouseDown(screen.getByRole('tab', { name: 'Android' }), {
      button: 0,
      ctrlKey: false,
    });

    await waitFor(() =>
      expect(screen.getByRole('tab', { name: 'Android' })).toHaveAttribute(
        'aria-selected',
        'true',
      ),
    );
    expect(screen.getByText('Android Demo')).toBeVisible();
    expect(window.location.search).toBe('?platform=android');
  });

  it('stacks Demo media on small screens and uses one row from sm', () => {
    const components = getOverviewMDXComponents();
    const DemoMedia = components.DemoMedia as DemoMediaComponent;

    const { container } = render(
      <DemoMedia
        imageAlt="声网实验室 iOS Demo 界面"
        imageSrc="https://assets-docs.agora.io/images/demo/agora-lab-ios.webp"
        qrCodeAlt="声网实验室 iOS Demo 二维码"
        qrCodeSrc="https://assets-docs.agora.io/images/demo/agora-lab-ios-qr.png"
        qrLabel="iOS 平台扫码体验"
      />,
    );

    expect(container.firstElementChild).toHaveClass(
      'flex',
      'flex-col',
      'sm:flex-row',
    );
    expect(screen.getByAltText('声网实验室 iOS Demo 界面')).toHaveAttribute(
      'src',
      'https://assets-docs.agora.io/images/demo/agora-lab-ios.webp',
    );
    expect(screen.getByAltText('声网实验室 iOS Demo 二维码')).toHaveAttribute(
      'src',
      'https://assets-docs.agora.io/images/demo/agora-lab-ios-qr.png',
    );
    expect(screen.getByText('iOS 平台扫码体验')).toBeVisible();
  });

  it('omits the recipe count when the gallery has no results', () => {
    const components = getOverviewMDXComponents();
    const RecipesGallery = components.RecipesGallery as RecipesCatalogComponent;

    render(
      <RecipesGallery
        allCategoriesLabel="All recipe types"
        allProductsLabel="All products"
        allStacksLabel="All stacks"
        categoryFilterLabel="Recipe type"
        clearFiltersLabel="Clear filters"
        emptyMessage="No recipes match the current filters."
        items={[]}
        productFilterLabel="Product"
        searchPlaceholder="Search recipes"
        stackFilterLabel="Stack"
      />,
    );

    expect(screen.queryByText('0 recipes')).not.toBeInTheDocument();
  });

  it('names recipe catalog filter groups and selected filter controls', () => {
    const components = getOverviewMDXComponents();
    const RecipesCatalog = components.RecipesCatalog as RecipesCatalogComponent;

    render(
      <RecipesCatalog
        allCategoriesLabel="All reference types"
        allProductsLabel="All products"
        allStacksLabel="All platforms"
        categoryFilterLabel="Reference type"
        clearFiltersLabel="Clear filters"
        emptyMessage="No references match the current filters."
        items={[
          {
            category: 'Hosted SDK reference',
            description: 'Voice SDK for Android API reference.',
            href: '/en/api-reference/rtc/android/overview',
            product: 'Voice SDK',
            stack: 'Android',
            title: 'Android',
            tone: 'blue',
          },
        ]}
        productFilterLabel="Product"
        searchPlaceholder="Search references"
        stackFilterLabel="Platform"
      />,
    );

    expect(
      screen.getByRole('searchbox', { name: 'Search references' }),
    ).toBeVisible();

    const productGroup = screen.getByRole('group', { name: 'Product' });
    expect(
      within(productGroup).getByRole('button', { name: 'All products' }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(
      within(productGroup).getByRole('button', { name: 'Voice SDK' }),
    ).toHaveAttribute('aria-pressed', 'false');

    expect(screen.getByRole('group', { name: 'Reference type' })).toBeVisible();
    expect(screen.getByRole('group', { name: 'Platform' })).toBeVisible();
  });

  it('renders multiple version links inside a recipe catalog card', () => {
    const components = getOverviewMDXComponents();
    const RecipesCatalog = components.RecipesCatalog as RecipesCatalogComponent;

    render(
      <RecipesCatalog
        allCategoriesLabel="All reference types"
        allProductsLabel="All products"
        allStacksLabel="All platforms"
        categoryFilterLabel="Reference type"
        clearFiltersLabel="Clear filters"
        emptyMessage="No references match the current filters."
        groupByProduct={true}
        productGroups={{
          'Voice SDK': {
            description: 'This product uses the Voice SDK.',
            icon: 'voice-calling',
            title: 'Voice Calling',
          },
        }}
        items={[
          {
            category: 'Hosted SDK reference',
            description:
              'Voice SDK for Android API reference with current and previous major-version coverage.',
            links: [
              {
                href: 'https://api-ref.agora.io/en/voice-sdk/android/4.x/API/rtc_api_overview.html',
                label: '4.6.3 (Latest)',
              },
              {
                href: 'https://api-ref.agora.io/en/voice-sdk/android/3.x/index.html',
                label: '3.7.2.1',
              },
            ],
            product: 'Voice SDK',
            stack: 'Android',
            title: 'Android',
            tone: 'blue',
          },
          {
            category: 'Hosted SDK reference',
            description:
              'Voice SDK for iOS API reference with current and previous major-version coverage.',
            links: [
              {
                href: 'https://api-ref.agora.io/en/voice-sdk/ios/4.x/API/rtc_api_overview_ng.html',
                label: '4.6.2 (Latest)',
              },
            ],
            product: 'Voice SDK',
            stack: 'iOS',
            title: 'iOS',
            tone: 'blue',
          },
        ]}
        productFilterLabel="Product"
        searchPlaceholder="Search references"
        stackFilterLabel="Platform"
      />,
    );

    expect(screen.getByText('Voice Calling')).toBeVisible();
    expect(screen.getByText('This product uses the Voice SDK.')).toBeVisible();
    const productSection = screen
      .getAllByRole('heading', { level: 3, name: 'Voice Calling' })[0]
      ?.closest('section');
    expect(productSection).not.toBeNull();
    expect(
      within(productSection as HTMLElement).getAllByRole('heading', {
        level: 3,
        name: 'Android',
      })[0],
    ).toBeVisible();
    expect(
      within(productSection as HTMLElement).getAllByRole('heading', {
        level: 3,
        name: 'iOS',
      })[0],
    ).toBeVisible();
    expect(
      screen.getByRole('link', { name: /4\.6\.3 \(Latest\)/i }),
    ).toHaveAttribute(
      'href',
      'https://api-ref.agora.io/en/voice-sdk/android/4.x/API/rtc_api_overview.html',
    );
    expect(screen.getByRole('link', { name: /3\.7\.2\.1/i })).toHaveAttribute(
      'href',
      'https://api-ref.agora.io/en/voice-sdk/android/3.x/index.html',
    );
  });

  it('can hide recipe catalog tags without affecting action links', () => {
    const components = getOverviewMDXComponents();
    const RecipesCatalog = components.RecipesCatalog as RecipesCatalogComponent;

    render(
      <RecipesCatalog
        allCategoriesLabel="All reference types"
        allProductsLabel="All products"
        allStacksLabel="All platforms"
        categoryFilterLabel="Reference type"
        clearFiltersLabel="Clear filters"
        emptyMessage="No references match the current filters."
        groupByProduct={true}
        productGroups={{
          'Video SDK': {
            description: 'This product uses the Video SDK.',
            icon: 'video-calling',
            title: 'Video Calling',
          },
        }}
        items={[
          {
            category: 'Hosted SDK reference',
            description: 'Video SDK for Web API reference.',
            links: [
              {
                href: 'https://api-ref.agora.io/en/video-sdk/web/4.x/index.html',
                label: '4.24.3 (Latest)',
              },
            ],
            product: 'Video SDK',
            stack: 'Web',
            title: 'Web',
            tone: 'sand',
          },
        ]}
        productFilterLabel="Product"
        searchPlaceholder="Search references"
        showDescription={false}
        showTags={false}
        stackFilterLabel="Platform"
      />,
    );

    expect(
      screen.getByRole('link', { name: /4\.24\.3 \(Latest\)/i }),
    ).toBeVisible();
    expect(screen.getByText('Video Calling')).toBeVisible();
    expect(screen.getByText('This product uses the Video SDK.')).toBeVisible();
    const productSection = screen
      .getAllByRole('heading', { level: 3, name: 'Video Calling' })[0]
      ?.closest('section');
    expect(productSection).not.toBeNull();
    const card = within(productSection as HTMLElement)
      .getByText('Web')
      .closest('section');
    expect(card).not.toBeNull();
    expect(
      within(card as HTMLElement).queryByText(
        'Video SDK for Web API reference.',
      ),
    ).toBeNull();
    expect(within(card as HTMLElement).queryByText('Video SDK')).toBeNull();
    expect(
      within(card as HTMLElement).queryByText('Hosted SDK reference'),
    ).toBeNull();
    expect(
      within(card as HTMLElement).getByRole('heading', {
        level: 3,
        name: 'Web',
      }),
    ).toBeVisible();
  });

  it('can hide the category filter group', () => {
    const components = getOverviewMDXComponents();
    const RecipesCatalog = components.RecipesCatalog as RecipesCatalogComponent;

    render(
      <RecipesCatalog
        allCategoriesLabel="All reference types"
        allProductsLabel="All products"
        allStacksLabel="All platforms"
        categoryFilterLabel="Reference type"
        clearFiltersLabel="Clear filters"
        emptyMessage="No references match the current filters."
        items={[
          {
            category: 'In-portal',
            description: 'Signaling SDK API reference.',
            href: '/en/api-reference/api-ref/signaling',
            product: 'Signaling',
            stack: 'Multi-platform',
            title: 'Multi-platform',
            tone: 'blue',
          },
        ]}
        productFilterLabel="Product"
        searchPlaceholder="Search references"
        showCategoryFilter={false}
        stackFilterLabel="Platform"
      />,
    );

    expect(screen.getByText('Product')).toBeVisible();
    expect(screen.getByText('Platform')).toBeVisible();
    expect(screen.queryByText('Reference type')).toBeNull();
  });

  it('uses the platform query parameter as the initial SDK stack filter', () => {
    window.history.pushState(
      null,
      '',
      '/en/api-reference/sdks?platform=android',
    );

    const components = getOverviewMDXComponents();
    const RecipesCatalog = components.RecipesCatalog as RecipesCatalogComponent;

    render(
      <RecipesCatalog
        allCategoriesLabel="All download types"
        allProductsLabel="All SDKs"
        allStacksLabel="All platforms"
        categoryFilterLabel="Download type"
        clearFiltersLabel="Clear filters"
        emptyMessage="No SDKs match the current filters."
        items={[
          {
            category: 'Core SDK',
            description: 'Android voice package.',
            links: [
              {
                href: 'https://download.agora.io/sdk/release/android.zip',
                label: 'Direct download',
              },
            ],
            product: 'Voice SDK',
            stack: 'Android',
            title: 'Android Voice SDK 4.6.3',
          },
          {
            category: 'Core SDK',
            description: 'iOS voice package.',
            links: [
              {
                href: 'https://download.agora.io/sdk/release/ios.zip',
                label: 'Direct download',
              },
            ],
            product: 'Voice SDK',
            stack: 'iOS',
            title: 'iOS Voice SDK 4.6.2',
          },
        ]}
        productFilterLabel="SDK"
        searchPlaceholder="Search SDKs"
        stackFilterLabel="Platform"
        stackQueryParam="platform"
      />,
    );

    expect(screen.getByText('Android Voice SDK 4.6.3')).toBeVisible();
    expect(screen.queryByText('iOS Voice SDK 4.6.2')).not.toBeInTheDocument();
  });
});
