import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import type { ComponentType, ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { DOCS_HASH_TARGET_EVENT } from '@/lib/docs-hash';
import { getOverviewMDXComponents } from './mdx-components';

type SolutionCardGridComponent = ComponentType<{
  children: ReactNode;
  size?: 'compact' | 'large' | 'small' | 'resource';
}>;
type SolutionCardComponent = ComponentType<{
  actions?: Array<{ href: string; label: string }>;
  description: string;
  href?: string;
  icon?:
    | 'ai'
    | 'classroom'
    | 'download'
    | 'play'
    | 'device'
    | 'meeting'
    | 'messaging'
    | 'rtc'
    | 'whiteboard';
  showDescription?: boolean;
  size?: 'compact' | 'large' | 'small' | 'resource';
  tags?: string[];
  title: string;
  titlePlacement?: 'below-icon' | 'beside-icon';
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
  newTabLabel?: string;
  description: string;
  href?: string;
  imageAlt: string;
  imageAspectRatio?: number;
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
  newTabLabel?: string;
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

  it('renders compact resource cards with their destinations and descriptions', () => {
    const components = getOverviewMDXComponents('zh-CN/introduction/index.mdx');
    const SolutionCardGrid =
      components.SolutionCardGrid as SolutionCardGridComponent;
    const SolutionCard = components.SolutionCard as SolutionCardComponent;
    render(
      <SolutionCardGrid size="resource">
        <SolutionCard
          title="SDK 下载"
          href="/zh-CN/reference/sdks"
          description="查找各平台 SDK 与集成资源"
          icon="download"
          size="resource"
        />
        <SolutionCard
          title="体验 Demo"
          href="/zh-CN/reference/demo"
          description="运行示例，体验声网能力"
          icon="play"
          size="resource"
        />
      </SolutionCardGrid>,
    );
    expect(screen.getByRole('link', { name: /SDK 下载/ })).toHaveAttribute(
      'href',
      '/zh-CN/reference/sdks',
    );
    expect(screen.getByRole('link', { name: /体验 Demo/ })).toHaveAttribute(
      'href',
      '/zh-CN/reference/demo',
    );
    expect(screen.getByText('查找各平台 SDK 与集成资源')).toBeVisible();
    expect(screen.getByText('运行示例，体验声网能力')).toBeVisible();
  });

  it('places the title beside the icon only when requested', () => {
    const components = getOverviewMDXComponents('zh-CN/introduction/index.mdx');
    const SolutionCard = components.SolutionCard as SolutionCardComponent;

    render(
      <>
        <SolutionCard
          description="Default description."
          href="/default"
          icon="rtc"
          title="Default card"
        />
        <SolutionCard
          description="Inline description."
          href="/inline"
          icon="rtc"
          title="Inline card"
          titlePlacement="beside-icon"
        />
      </>,
    );

    const defaultCard = screen.getByRole('link', { name: /Default card/i });
    const inlineCard = screen.getByRole('link', { name: /Inline card/i });
    const defaultChildren = Array.from(defaultCard.children);
    const inlineChildren = Array.from(inlineCard.children);
    const defaultContent = defaultChildren[1];
    const inlineContent = inlineChildren[1];

    expect(defaultCard).toHaveAttribute('href', '/default');
    expect(defaultCard).toHaveClass('min-h-40');
    expect(defaultChildren[0].querySelector('h3')).toBeNull();
    expect(defaultChildren[0].children[0]).not.toHaveClass('shrink-0');
    expect(defaultChildren[0].children[1]).not.toHaveClass('shrink-0');
    expect(defaultChildren[1].querySelector('h3')).toHaveTextContent(
      'Default card',
    );
    expect(defaultContent).not.toHaveClass('flex');
    expect(defaultContent).not.toHaveClass('flex-col');
    expect(defaultContent).not.toHaveClass('justify-center');

    expect(inlineCard).toHaveAttribute('href', '/inline');
    expect(inlineCard).toHaveClass('min-h-32');
    expect(inlineChildren[0].children).toHaveLength(3);
    expect(
      Array.from(inlineChildren[0].children).map((child) => child.localName),
    ).toEqual(['span', 'h3', 'svg']);
    expect(inlineChildren[0].children[0]).toHaveClass('shrink-0');
    expect(inlineChildren[0].children[1]).toHaveTextContent('Inline card');
    expect(inlineChildren[0].children[2]).toHaveClass('shrink-0');
    expect(inlineChildren[1]).toHaveTextContent('Inline description.');
    expect(inlineContent).toHaveClass('flex', 'flex-col', 'justify-center');
    expect(inlineContent).toHaveTextContent('Inline description.');
  });

  it('renders compact solution cards as dense title-only links', () => {
    const components = getOverviewMDXComponents('zh-CN/introduction/index.mdx');
    const SolutionCardGrid =
      components.SolutionCardGrid as SolutionCardGridComponent;
    const SolutionCard = components.SolutionCard as SolutionCardComponent;

    const { container } = render(
      <SolutionCardGrid size="compact">
        <SolutionCard
          description="多人实时协作、文档演示和白板互动能力。"
          href="/zh-CN/realtime-media/whiteboard"
          icon="whiteboard"
          showDescription={false}
          size="compact"
          title="互动白板"
        />
      </SolutionCardGrid>,
    );

    const link = screen.getByRole('link', { name: /互动白板/i });
    const compactChildren = Array.from(link.children);

    expect(link).toHaveAttribute('href', '/zh-CN/realtime-media/whiteboard');
    expect(
      screen.queryByText('多人实时协作、文档演示和白板互动能力。'),
    ).toBeNull();
    expect(container.querySelector('section')).toHaveClass(
      'my-6',
      'gap-3',
      'grid-cols-1',
      'md:grid-cols-3',
    );
    expect(link).toHaveClass('flex-row', 'items-center', 'min-h-14', 'p-3');
    expect(compactChildren).toHaveLength(3);
    expect(compactChildren.map((child) => child.localName)).toEqual([
      'span',
      'div',
      'svg',
    ]);
    expect(compactChildren[0].querySelector('svg')).not.toBeNull();
    expect(compactChildren[1]).toHaveTextContent('互动白板');
    expect(compactChildren[2].localName).toBe('svg');
  });

  it('supports multiple labeled actions that share one target', () => {
    const components = getOverviewMDXComponents('zh-CN/introduction/index.mdx');
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

  it('renders localized help hub copy for Chinese pages', () => {
    const components = getOverviewMDXComponents('zh-CN/introduction/index.mdx');
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
      screen.queryByText(
        '根据需要选择支持渠道：咨询产品问题、查看服务状态或浏览技术文章。',
      ),
    ).not.toBeInTheDocument();
    expect(screen.getByText('热门知识库')).toBeVisible();
    expect(screen.getByText('快速解答')).toBeVisible();
    expect(screen.getByText('按主题浏览')).toBeVisible();
    expect(screen.getByRole('link', { name: /声网博客/ })).toHaveAttribute(
      'href',
      'https://www.shengwang.cn/blog/',
    );
  });

  it('opens linked overview images in a new tab without a zoom button', () => {
    const components = getOverviewMDXComponents('zh-CN/introduction/index.mdx');
    const OverviewImageCard =
      components.OverviewImageCard as OverviewImageCardComponent;
    render(
      <OverviewImageCard
        description="在浏览器中体验语聊房和呼叫邀请。"
        href="https://rtm-demo.shengwang.cn?utm_source=docs&utm_medium=rtm_overview"
        imageAlt="RTM 在线体验"
        imageAspectRatio={1.75}
        imageSrc="/img/rtm2/online-demo.jpg"
        title="先在线体验 RTM"
        newTabLabel="在新标签页打开"
      />,
    );
    const link = screen.getByRole('link', { name: /先在线体验 RTM/ });
    expect(link).toHaveAttribute('target', '_blank');
    expect(
      within(link).getByRole('img', { name: '在新标签页打开' }),
    ).toBeVisible();
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(within(link).getByAltText('RTM 在线体验')).toBeVisible();
    expect(within(link).queryByRole('button')).not.toBeInTheDocument();
    expect(link).toHaveClass('block', 'not-prose');
    expect(within(link).getByAltText('RTM 在线体验').parentElement).toHaveStyle(
      { aspectRatio: '1.75' },
    );
  });

  it('renders Demo images and filters cards by supported platform', () => {
    const components = getOverviewMDXComponents('zh-CN/introduction/index.mdx');
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
    expect(screen.getByAltText('声动互娱 Demo 封面')).toHaveAttribute(
      'referrerpolicy',
      'no-referrer',
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

  it('opens online demos in a new tab and retains product and scenario filters', () => {
    const components = getOverviewMDXComponents('zh-CN/introduction/index.mdx');
    const DemoGallery = components.DemoGallery as DemoGalleryComponent;

    render(
      <DemoGallery
        newTabLabel="在新标签页打开"
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
            href: 'https://rtm-demo.shengwang.cn?utm_source=docs&utm_medium=demo_list',
            imageAlt: '实时消息 RTM Web Demo 封面',
            imageSrc:
              'https://assets-docs.agora.io/images/demo/rtm-web-demo-cover.png',
            platforms: ['Web'],
            products: ['实时消息 RTM'],
            releaseDate: '2026-04-10',
            tags: ['在线体验', '语聊房', '1V1 呼叫邀请'],
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
    expect(screen.getByAltText('声动互娱 Demo 封面')).toHaveAttribute(
      'referrerpolicy',
      'no-referrer',
    );
    expect(screen.getByRole('link', { name: /声动互娱/ })).toHaveAttribute(
      'href',
      '/zh-CN/reference/demo/shengdong-entertainment',
    );
    const internalLink = screen.getByRole('link', { name: /声动互娱/ });
    expect(internalLink).not.toHaveAttribute('target');
    const onlineLink = screen.getByRole('link', {
      name: /实时消息 RTM Web Demo/,
    });
    expect(onlineLink).toHaveAttribute('target', '_blank');
    expect(onlineLink).toHaveAttribute('rel', 'noopener noreferrer');
    expect(
      within(onlineLink).getByRole('img', { name: '在新标签页打开' }),
    ).toBeVisible();
    expect(within(onlineLink).getByTitle('在新标签页打开')).toBeVisible();
    expect(
      within(internalLink).queryByRole('img', { name: '在新标签页打开' }),
    ).not.toBeInTheDocument();
    fireEvent.change(screen.getByRole('combobox', { name: '产品与 SDK' }), {
      target: { value: '实时消息 RTM' },
    });
    fireEvent.change(screen.getByRole('combobox', { name: '标签' }), {
      target: { value: '1V1 呼叫邀请' },
    });
    expect(onlineLink).toBeVisible();
    expect(
      screen.queryByRole('link', { name: /声动互娱/ }),
    ).not.toBeInTheDocument();
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

    const components = getOverviewMDXComponents('zh-CN/introduction/index.mdx');
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

  it.each(['android-release', 'Android 更新内容'])(
    'reveals the Demo platform for initial and changing heading target %s',
    async (anchor) => {
      window.history.replaceState(
        {},
        '',
        `/zh-CN/reference/demo/agora-lab#${encodeURIComponent(anchor)}`,
      );
      const components = getOverviewMDXComponents(
        'zh-CN/introduction/index.mdx',
      );
      const DemoPlatformTabs =
        components.DemoPlatformTabs as DemoPlatformTabsComponent;
      const DemoPlatform = components.DemoPlatform as DemoPlatformComponent;
      const { container } = render(
        <DemoPlatformTabs
          defaultValue="ios"
          platforms={[
            { label: 'iOS', value: 'ios' },
            { label: 'Android', value: 'android' },
          ]}
        >
          <DemoPlatform value="ios">
            <h3 id="ios-release">iOS content</h3>
          </DemoPlatform>
          <DemoPlatform value="android">
            <h3 id={anchor}>Android content</h3>
          </DemoPlatform>
        </DemoPlatformTabs>,
      );
      const expectSelected = async (name: string) =>
        waitFor(() =>
          expect(screen.getByRole('tab', { name })).toHaveAttribute(
            'aria-selected',
            'true',
          ),
        );
      await expectSelected('Android');
      const iosPanel = container.querySelector('[data-demo-platform="ios"]');
      expect(iosPanel).toHaveAttribute('data-state', 'inactive');
      expect(iosPanel).toHaveClass('data-[state=inactive]:hidden');
      expect(screen.getByText('iOS content')).toBeInTheDocument();

      window.dispatchEvent(
        new CustomEvent(DOCS_HASH_TARGET_EVENT, { detail: '#ios-release' }),
      );
      await expectSelected('iOS');
      window.dispatchEvent(new Event('hashchange'));
      await expectSelected('Android');

      fireEvent.mouseDown(screen.getByRole('tab', { name: 'iOS' }), {
        button: 0,
        ctrlKey: false,
      });
      await expectSelected('iOS');
      expect(window.location.search).toBe('?platform=ios');
      expect(window.location.hash).toBe('');
    },
  );

  it('stacks Demo media on small screens and uses one row from sm', () => {
    const components = getOverviewMDXComponents('zh-CN/introduction/index.mdx');
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
    expect(screen.getByAltText('声网实验室 iOS Demo 界面')).toHaveAttribute(
      'referrerpolicy',
      'no-referrer',
    );
    expect(screen.getByAltText('声网实验室 iOS Demo 二维码')).toHaveAttribute(
      'referrerpolicy',
      'no-referrer',
    );
  });

  it('omits the recipe count when the gallery has no results', () => {
    const components = getOverviewMDXComponents('zh-CN/introduction/index.mdx');
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
});
