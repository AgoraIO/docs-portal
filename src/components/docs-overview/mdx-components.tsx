import {
  ActivityIcon,
  AppleIcon,
  AppWindowIcon,
  ArrowDownToLineIcon,
  ArrowRightIcon,
  ArrowUpFromLineIcon,
  ArrowUpRightIcon,
  AtomIcon,
  AudioLinesIcon,
  BarChart3Icon,
  BlocksIcon,
  BotIcon,
  CaptionsIcon,
  CloudIcon,
  Code2Icon,
  CpuIcon,
  CuboidIcon,
  FilmIcon,
  Globe2Icon,
  GraduationCapIcon,
  HardDriveIcon,
  LaptopIcon,
  MessagesSquareIcon,
  MonitorIcon,
  MonitorSmartphoneIcon,
  NetworkIcon,
  NewspaperIcon,
  PhoneIcon,
  PresentationIcon,
  RadioIcon,
  RadioTowerIcon,
  ServerCogIcon,
  SmartphoneChargingIcon,
  SmartphoneIcon,
  TerminalSquareIcon,
  TicketIcon,
  TvIcon,
  VideoIcon,
  ZapIcon,
} from 'lucide-react';
import type { MDXComponents } from 'mdx/types';
import {
  lazy,
  type ReactNode,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  ReferenceFilterSelect,
  ReferenceFilterToggleGroup,
  ReferenceSearchInput,
} from '@/components/reference-center/ReferenceFilterControls';
import { Button } from '@/components/ui/button';
import {
  Tabs as UiTabs,
  TabsContent as UiTabsContent,
  TabsList as UiTabsList,
  TabsTrigger as UiTabsTrigger,
} from '@/components/ui/tabs';
import { cn } from '@/lib/cn';

const SdksCatalog = lazy(() =>
  import('./SdksCatalog').then((module) => ({
    default: module.SdksCatalog,
  })),
);

const ApiReferenceCards = lazy(() =>
  import('./ApiReferenceCards').then((module) => ({
    default: module.ApiReferenceCards,
  })),
);

const FaqLanding = lazy(() =>
  import('../faq/FaqLanding').then((module) => ({
    default: module.FaqLanding,
  })),
);

const FaqCategory = lazy(() =>
  import('../faq/FaqCategory').then((module) => ({
    default: module.FaqCategory,
  })),
);

const overviewActionContentPaths = new Set([
  'zh-CN/ai/aigc/index.mdx',
  'zh-CN/ai/index.mdx',
  'zh-CN/realtime-media/cloud-recording/index.mdx',
  'zh-CN/realtime-media/content-moderation/index.mdx',
  'zh-CN/realtime-media/danmaku/index.mdx',
  'zh-CN/realtime-media/fusion-cdn/index.mdx',
  'zh-CN/realtime-media/local-server-recording/index.mdx',
  'zh-CN/realtime-media/marketplace/index.mdx',
  'zh-CN/realtime-media/media-pull/index.mdx',
  'zh-CN/realtime-media/media-push/index.mdx',
  'zh-CN/realtime-media/rtc-server-sdk/index.mdx',
  'zh-CN/realtime-media/rtc/index.mdx',
  'zh-CN/realtime-media/rtmp-gateway/index.mdx',
  'zh-CN/realtime-media/rtsa/index.mdx',
  'zh-CN/realtime-media/sdk-extensions/metakit/index.mdx',
  'zh-CN/realtime-media/sdk-extensions/portrait-rhythm/index.mdx',
  'zh-CN/realtime-media/speech-to-text/index.mdx',
  'zh-CN/realtime-media/transcoding/index.mdx',
  'zh-CN/realtime-media/usage-analytics/index.mdx',
  'zh-CN/realtime-media/whiteboard/fastboard-sdk/index.mdx',
  'zh-CN/realtime-media/whiteboard/whiteboard-sdk/index.mdx',
  'zh-CN/solutions/chatroom/sdk/index.mdx',
  'zh-CN/solutions/chatroom/uikit/index.mdx',
  'zh-CN/solutions/flexible-classroom/index.mdx',
  'zh-CN/solutions/game-voice/index.mdx',
  'zh-CN/solutions/meeting/index.mdx',
  'zh-CN/solutions/meta-world/index.mdx',
  'zh-CN/solutions/one-to-one-live/custom-signaling/index.mdx',
  'zh-CN/solutions/one-to-one-live/rtm/index.mdx',
  'zh-CN/solutions/online-ktv/auikaraoke/index.mdx',
  'zh-CN/solutions/online-ktv/ktv-scenario/index.mdx',
  'zh-CN/solutions/online-ktv/online-ktv-sdk/index.mdx',
  'zh-CN/solutions/ppt-transcoding/index.mdx',
  'zh-CN/solutions/showroom/index.mdx',
  'zh-CN/solutions/status-page/index.mdx',
  'zh-CN/solutions/voip-call/index.mdx',
]);

export function getOverviewMDXComponents(contentPath?: string): MDXComponents {
  const ScopedOverviewActions = overviewActionContentPaths.has(
    contentPath ?? '',
  )
    ? OverviewActions
    : HiddenOverviewActions;

  return {
    ApiReferenceCards,
    CardGrid,
    FeatureCard,
    FaqLanding,
    FaqCategory,
    CapabilityGroupCard,
    CapabilityGroupGrid,
    CapabilityMatrix,
    DemoGallery,
    DemoMedia,
    DemoPlatform,
    DemoPlatformTabs,
    HelpHub,
    OverviewImageCard,
    OverviewImageCardGrid,
    OverviewActions: ScopedOverviewActions,
    OverviewLinkBanner,
    OverviewSpotlightCard,
    OverviewSpotlightGrid,
    OverviewToolkits,
    RecipesCatalog,
    RecipesGallery,
    SdksCatalog,
    SolutionCard,
    SolutionCardGrid,
    ToolkitGroup,
    ToolkitItem,
  } satisfies MDXComponents;
}

type OverviewAction = {
  href: string;
  label: string;
};

function OverviewActions({ actions }: { actions: OverviewAction[] }) {
  if (actions.length === 0) {
    return null;
  }

  return (
    <nav aria-label="相关资源" className="not-prose my-5 flex flex-wrap gap-3">
      {actions.map((action) => {
        const external = isExternalHref(action.href);

        return (
          <Button
            asChild
            key={`${action.label}-${action.href}`}
            variant="outline"
          >
            <a
              className="border-primary text-primary hover:border-primary hover:bg-primary/5 hover:text-primary"
              href={action.href}
              rel={external ? 'noreferrer noopener' : undefined}
              target={external ? '_blank' : undefined}
            >
              {action.label}
            </a>
          </Button>
        );
      })}
    </nav>
  );
}

function HiddenOverviewActions(_props: { actions: OverviewAction[] }) {
  return null;
}

type DemoPlatformOption = {
  label: string;
  value: string;
};

const demoPlatformIcons = {
  android: SmartphoneIcon,
  electron: AtomIcon,
  ios: AppleIcon,
  macos: LaptopIcon,
  web: Globe2Icon,
  windows: MonitorIcon,
};

export function DemoPlatformTabs({
  ariaLabel = '选择平台',
  children,
  defaultValue,
  platforms,
}: {
  ariaLabel?: string;
  children: ReactNode;
  defaultValue: string;
  platforms: DemoPlatformOption[];
}) {
  const values = useMemo(
    () => new Set(platforms.map((platform) => platform.value)),
    [platforms],
  );
  const fallbackValue = values.has(defaultValue)
    ? defaultValue
    : platforms.at(0)?.value;
  const [activePlatform, setActivePlatform] = useState(fallbackValue);

  useEffect(() => {
    const queryPlatform = new URLSearchParams(window.location.search).get(
      'platform',
    );

    if (queryPlatform && values.has(queryPlatform)) {
      setActivePlatform(queryPlatform);
    }
  }, [values]);

  if (!activePlatform) {
    return null;
  }

  const changePlatform = (nextPlatform: string) => {
    setActivePlatform(nextPlatform);

    const url = new URL(window.location.href);
    url.searchParams.set('platform', nextPlatform);
    window.history.replaceState(window.history.state, '', url);
  };

  return (
    <UiTabs
      className="my-6 gap-0"
      onValueChange={changePlatform}
      value={activePlatform}
    >
      <UiTabsList
        aria-label={ariaLabel}
        className="not-prose h-auto min-h-[46px] max-w-full justify-start gap-2 overflow-x-auto overflow-y-hidden rounded-full bg-muted p-1.5"
      >
        {platforms.map((platform) => {
          const PlatformIcon =
            demoPlatformIcons[
              platform.value.toLowerCase() as keyof typeof demoPlatformIcons
            ];

          return (
            <UiTabsTrigger
              className="h-[34px] min-w-[88px] rounded-full border border-transparent px-5 text-muted-foreground data-[state=active]:border-primary data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-none"
              key={platform.value}
              value={platform.value}
            >
              {PlatformIcon ? (
                <PlatformIcon aria-hidden className="size-4" />
              ) : null}
              {platform.label}
            </UiTabsTrigger>
          );
        })}
      </UiTabsList>
      {children}
    </UiTabs>
  );
}

export function DemoPlatform({
  children,
  value,
}: {
  children: ReactNode;
  value: string;
}) {
  return (
    <UiTabsContent className="mt-6" value={value}>
      {children}
    </UiTabsContent>
  );
}

export function DemoMedia({
  imageAlt,
  imageSrc,
  qrCodeAlt,
  qrCodeSrc,
  qrLabel,
}: {
  imageAlt: string;
  imageSrc: string;
  qrCodeAlt: string;
  qrCodeSrc: string;
  qrLabel: string;
}) {
  return (
    <div className="not-prose my-6 flex flex-col items-start gap-x-6 gap-y-3 sm:flex-row">
      <img
        alt={imageAlt}
        className="h-auto max-h-[500px] min-w-0 max-w-full shrink rounded-lg object-contain object-left"
        decoding="async"
        loading="lazy"
        src={imageSrc}
      />
      <figure className="m-0 w-[120px] shrink-0">
        <img
          alt={qrCodeAlt}
          className="block size-[120px]"
          decoding="async"
          loading="lazy"
          src={qrCodeSrc}
        />
        <figcaption className="mt-2 text-center text-xs text-muted-foreground">
          {qrLabel}
        </figcaption>
      </figure>
    </div>
  );
}

function CardGrid({ children }: { children: ReactNode }) {
  return (
    <div className="not-prose my-8 grid gap-4 sm:grid-cols-2">{children}</div>
  );
}

function FeatureCard({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <h3 className="m-0 text-base font-semibold text-foreground">{title}</h3>
      <div className="mt-2 text-sm leading-6 text-muted-foreground">
        {children}
      </div>
    </section>
  );
}

function CapabilityGroupGrid({ children }: { children: ReactNode }) {
  return (
    <section className="not-prose my-8 grid gap-4 sm:grid-cols-2">
      {children}
    </section>
  );
}

function CapabilityGroupCard({
  description,
  items,
  title,
}: {
  description: string;
  items: string[];
  title: string;
}) {
  return (
    <section className="rounded-[24px] border border-border bg-card p-6 shadow-sm">
      <h3 className="m-0 text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {items.map((item) => (
          <span
            className="rounded-md bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground"
            key={item}
          >
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}

type HelpHubCard = {
  cta: string;
  description: string;
  href: string;
  icon: 'blog' | 'discord' | 'stack-overflow' | 'status' | 'ticket';
  title: string;
};

type HelpHubLink = {
  href: string;
  label: string;
};

function HelpHub({
  cards,
  knowledgeBase,
  locale = 'en',
  topics,
}: {
  cards: HelpHubCard[];
  knowledgeBase: HelpHubLink[];
  locale?: 'en' | 'zh-CN';
  topics: HelpHubLink[];
}) {
  const copy =
    locale === 'zh-CN'
      ? {
          browseByTopic: '按主题浏览',
          intro: '选择最快的支持渠道，获取产品问题、服务状态和社区资源帮助。',
          popularKnowledgeBase: '热门知识库',
          quickAnswers: '快速解答',
        }
      : {
          browseByTopic: 'Browse By Topic',
          intro:
            'Choose the fastest path for product questions, service health, and community support.',
          popularKnowledgeBase: 'Popular Knowledge Base',
          quickAnswers: 'Quick answers',
        };

  return (
    <section className="not-prose my-8 space-y-5">
      <div className="rounded-[28px] border border-border bg-card p-5 shadow-sm sm:p-6">
        <div className="max-w-2xl">
          <p className="text-sm leading-6 text-muted-foreground">
            {copy.intro}
          </p>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <a
              className="group flex min-h-[11.5rem] flex-col rounded-[22px] border border-border bg-background px-4 py-4 transition-colors hover:border-primary/35 hover:bg-accent/35"
              href={card.href}
              key={card.title}
              rel={
                isExternalHref(card.href) ? 'noreferrer noopener' : undefined
              }
              target={isExternalHref(card.href) ? '_blank' : undefined}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="flex size-7 items-center justify-center rounded-md bg-muted text-foreground">
                  <HelpHubIcon kind={card.icon} />
                </span>
                <ArrowUpRightIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
              </div>
              <h4 className="mt-4 text-base font-semibold tracking-[-0.02em] text-foreground">
                {card.title}
              </h4>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {card.description}
              </p>
              <span className="mt-auto pt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                {card.cta}
              </span>
            </a>
          ))}
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.12fr)_minmax(18rem,0.88fr)]">
        <section className="rounded-[28px] border border-border bg-card p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {copy.popularKnowledgeBase}
            </h4>
            <span className="hidden text-[11px] uppercase tracking-[0.18em] text-muted-foreground sm:inline">
              {copy.quickAnswers}
            </span>
          </div>
          <ul className="mt-4 space-y-2">
            {knowledgeBase.map((item) => (
              <li key={item.label}>
                <a
                  className="group flex items-center justify-between gap-4 rounded-[16px] px-3 py-3 text-sm text-foreground transition-colors hover:bg-accent/45 hover:text-primary"
                  href={item.href}
                  rel={
                    isExternalHref(item.href)
                      ? 'noreferrer noopener'
                      : undefined
                  }
                  target={isExternalHref(item.href) ? '_blank' : undefined}
                >
                  <span className="leading-6">{item.label}</span>
                  <ArrowUpRightIcon className="size-4 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:text-foreground group-hover:opacity-100" />
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-[28px] border border-border bg-card p-5 shadow-sm sm:p-6">
          <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {copy.browseByTopic}
          </h4>
          <div className="mt-4 space-y-2">
            {topics.map((item) => (
              <a
                className="group flex items-center justify-between gap-4 rounded-[16px] border border-border bg-background px-4 py-3.5 text-sm text-foreground transition-colors hover:border-primary/40 hover:bg-accent/35 hover:text-primary"
                href={item.href}
                key={item.label}
                rel={
                  isExternalHref(item.href) ? 'noreferrer noopener' : undefined
                }
                target={isExternalHref(item.href) ? '_blank' : undefined}
              >
                <span>{item.label}</span>
                <ArrowRightIcon className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
              </a>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}

function HelpHubIcon({ kind }: { kind: HelpHubCard['icon'] }) {
  if (kind === 'ticket') {
    return <TicketIcon className="size-4" />;
  }

  if (kind === 'blog') {
    return <NewspaperIcon className="size-4" />;
  }

  if (kind === 'stack-overflow') {
    return <Code2Icon className="size-4" />;
  }

  if (kind === 'discord') {
    return <MessagesSquareIcon className="size-4" />;
  }

  return <ActivityIcon className="size-4" />;
}

function isExternalHref(href: string) {
  return href.startsWith('http://') || href.startsWith('https://');
}

type CapabilityMatrixRow = {
  description: string;
  items: string[];
  title: string;
};

function CapabilityMatrix({ rows }: { rows: CapabilityMatrixRow[] }) {
  return (
    <section className="not-prose my-8 overflow-hidden rounded-[24px] border border-border bg-card shadow-sm">
      <div className="grid grid-cols-1 border-b border-border bg-muted/30 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground sm:grid-cols-[220px_minmax(0,1fr)_260px] sm:gap-6 sm:px-6">
        <span>Capability area</span>
        <span>What it covers</span>
        <span>Includes</span>
      </div>
      {rows.map((row, index) => (
        <div
          className={cn(
            'grid grid-cols-1 gap-3 px-5 py-4 sm:grid-cols-[220px_minmax(0,1fr)_260px] sm:items-start sm:gap-6 sm:px-6',
            index > 0 && 'border-t border-border',
          )}
          key={row.title}
        >
          <h3 className="m-0 text-base font-semibold text-foreground">
            {row.title}
          </h3>
          <p className="m-0 text-sm leading-6 text-muted-foreground">
            {row.description}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {row.items.map((item) => (
              <span
                className="rounded-md bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground"
                key={item}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

function OverviewImageCardGrid({
  children,
  columns = 'three',
}: {
  children: ReactNode;
  columns?: 'three' | 'two';
}) {
  return (
    <section
      className={cn(
        'not-prose my-8 grid gap-4',
        columns === 'two'
          ? 'md:grid-cols-2 xl:grid-cols-2'
          : 'md:grid-cols-2 xl:grid-cols-3',
      )}
    >
      {children}
    </section>
  );
}

function OverviewImageCard({
  compact = false,
  description,
  href,
  imageAlt,
  imageSrc,
  title,
}: {
  compact?: boolean;
  description: string;
  href?: string;
  imageAlt: string;
  imageSrc: string;
  title: string;
}) {
  const content = (
    <>
      <div
        className={cn(
          'overflow-hidden border-b border-border bg-muted/40',
          compact ? 'aspect-[16/8]' : 'aspect-[16/10]',
        )}
      >
        <img
          alt={imageAlt}
          className={cn(
            'size-full object-cover',
            href &&
              'transition-transform duration-300 group-hover:scale-[1.02]',
          )}
          loading="lazy"
          src={imageSrc}
        />
      </div>
      <div className={cn(compact ? 'p-4' : 'p-5')}>
        <h3 className="m-0 text-base font-semibold text-foreground">{title}</h3>
        <p
          className={cn(
            'mt-2 text-sm text-muted-foreground',
            compact ? 'leading-5' : 'leading-6',
          )}
        >
          {description}
        </p>
      </div>
    </>
  );

  if (!href) {
    return (
      <section className="overflow-hidden rounded-[24px] border border-border bg-card shadow-sm">
        {content}
      </section>
    );
  }

  return (
    <a
      className="group overflow-hidden rounded-[24px] border border-border bg-card shadow-sm transition-colors hover:border-primary/40 hover:bg-accent/35"
      href={href}
    >
      {content}
    </a>
  );
}

function OverviewLinkBanner({
  description,
  href,
  title,
}: {
  description: string;
  href: string;
  title: string;
}) {
  return (
    <a
      className="group not-prose my-6 flex items-center justify-between gap-4 rounded-[24px] border border-border bg-card px-6 py-5 shadow-sm transition-colors hover:border-primary/40 hover:bg-accent/35"
      href={href}
    >
      <div className="min-w-0">
        <h3 className="m-0 text-lg font-semibold tracking-[-0.02em] text-foreground">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
      <ArrowRightIcon className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
    </a>
  );
}

function OverviewToolkits({ children }: { children: ReactNode }) {
  return (
    <section className="not-prose my-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {children}
    </section>
  );
}

function ToolkitGroup({
  title,
  children,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <section className="rounded-lg border border-border bg-card p-4">
      <h3 className="m-0 text-sm font-semibold text-foreground">{title}</h3>
      <div className="mt-3 grid gap-2">{children}</div>
    </section>
  );
}

type ToolkitIconKind =
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

function ToolkitItem({
  href,
  icon,
  label,
}: {
  href: string;
  icon: ToolkitIconKind;
  label: string;
}) {
  return (
    <a
      className="group flex min-h-10 items-center gap-2 rounded-md px-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
      href={href}
    >
      <span className="flex size-7 items-center justify-center rounded-md bg-muted text-foreground transition-colors group-hover:bg-background">
        <ToolkitIcon kind={icon} />
      </span>
      <span>{label}</span>
    </a>
  );
}

function ToolkitIcon({ kind }: { kind: ToolkitIconKind }) {
  if (kind === 'python') {
    return <BotIcon className="size-4" />;
  }

  if (kind === 'typescript' || kind === 'rest' || kind === 'go') {
    return <Code2Icon className="size-4" />;
  }

  if (kind === 'cli') {
    return <TerminalSquareIcon className="size-4" />;
  }

  if (kind === 'studio' || kind === 'web') {
    return <AppWindowIcon className="size-4" />;
  }

  if (kind === 'mcp') {
    return <CuboidIcon className="size-4" />;
  }

  if (kind === 'skills' || kind === 'messaging') {
    return <BlocksIcon className="size-4" />;
  }

  if (kind === 'android') {
    return <SmartphoneChargingIcon className="size-4" />;
  }

  if (kind === 'ios') {
    return <MonitorSmartphoneIcon className="size-4" />;
  }

  if (kind === 'rtc') {
    return <AudioLinesIcon className="size-4" />;
  }

  if (kind === 'stt') {
    return <ZapIcon className="size-4" />;
  }

  if (kind === 'server') {
    return <ServerCogIcon className="size-4" />;
  }

  return <Code2Icon className="size-4" />;
}

export type SolutionCardSize = 'compact' | 'large' | 'small';
type SolutionCardTitlePlacement = 'below-icon' | 'beside-icon';

function SolutionCardGrid({
  children,
  size = 'large',
}: {
  children: ReactNode;
  size?: SolutionCardSize;
}) {
  return (
    <section
      className={cn(
        'not-prose grid w-[var(--content-max)] max-w-full',
        size === 'compact'
          ? 'my-6 grid-cols-1 gap-3 md:grid-cols-3'
          : cn(
              'my-8 gap-4',
              size === 'small'
                ? 'grid-cols-[repeat(auto-fit,minmax(min(100%,19rem),1fr))]'
                : 'grid-cols-[repeat(auto-fit,minmax(min(100%,18rem),1fr))]',
            ),
      )}
    >
      {children}
    </section>
  );
}

export type SolutionCardIconKind =
  | 'ai'
  | 'analytics'
  | 'broadcast'
  | 'chat'
  | 'classroom'
  | 'cloud-recording'
  | 'device'
  | 'iot'
  | 'live-streaming'
  | 'media-pull'
  | 'media-push'
  | 'meeting'
  | 'messaging'
  | 'on-premise-recording'
  | 'rtc'
  | 'rtmp-gateway'
  | 'server-sdk'
  | 'signaling'
  | 'tools'
  | 'transcoding'
  | 'transcription'
  | 'video-calling'
  | 'voice-calling'
  | 'whiteboard';

type SolutionCardTone = 'blue' | 'green' | 'pink' | 'purple' | 'sand';

export type RecipeCatalogItemLink = {
  href: string;
  label: string;
};

export type RecipeCatalogGroupMeta = {
  description?: string;
  icon?: SolutionCardIconKind;
  title?: string;
};

export type RecipeCatalogItem = {
  category: string;
  description: string;
  href?: string;
  links?: RecipeCatalogItemLink[];
  product: string;
  stack?: string;
  tags?: string[];
  title: string;
  tone?: SolutionCardTone;
};

export type DemoCatalogItem = {
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
};

function SolutionCard({
  actions = [],
  description,
  href,
  icon,
  imageAlt,
  imageSrc,
  size = 'large',
  showDescription = true,
  tags = [],
  title,
  titlePlacement = 'below-icon',
  tone = 'blue',
}: {
  actions?: RecipeCatalogItemLink[];
  description: string;
  href?: string;
  icon?: SolutionCardIconKind;
  imageAlt?: string;
  imageSrc?: string;
  size?: SolutionCardSize;
  showDescription?: boolean;
  tags?: string[];
  title: string;
  titlePlacement?: SolutionCardTitlePlacement;
  tone?: SolutionCardTone;
}) {
  const isCompact = size === 'compact';
  const hasBesideIconTitle =
    titlePlacement === 'beside-icon' && !imageSrc && !isCompact;
  const cardClasses = cn(
    'group relative rounded-lg border border-border bg-card shadow-sm transition-colors hover:border-primary/40 hover:bg-accent/35',
    isCompact
      ? 'flex min-h-14 flex-row items-center gap-3 p-3'
      : hasBesideIconTitle
        ? 'flex min-h-36 flex-col p-5'
        : 'flex min-h-40 flex-col p-5',
    size === 'small' && 'min-h-32 p-4',
  );

  const content = isCompact ? (
    <>
      {icon ? (
        <span
          className={cn(
            'flex size-8 shrink-0 items-center justify-center rounded-lg',
            getSolutionToneClasses(tone),
          )}
        >
          <SolutionCardIcon kind={icon} />
        </span>
      ) : null}
      <h3 className="m-0 min-w-0 flex-1 text-sm font-semibold text-foreground">
        {title}
      </h3>
      {href ? (
        <ArrowRightIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
      ) : null}
    </>
  ) : (
    <>
      {imageSrc ? (
        <div className="mb-4 aspect-[39/20] overflow-hidden rounded-md bg-muted">
          <img
            alt={imageAlt ?? title}
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
            loading="lazy"
            src={imageSrc}
          />
        </div>
      ) : null}
      {imageSrc && href ? (
        <span className="absolute top-4 right-4 flex size-7 items-center justify-center rounded-full bg-background/85 text-muted-foreground shadow-sm ring-1 ring-border backdrop-blur transition-colors group-hover:text-foreground">
          <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      ) : null}
      {imageSrc ? null : (
        <div
          className={cn(
            'flex justify-between gap-3',
            hasBesideIconTitle ? 'items-center' : 'items-start',
          )}
        >
          {icon ? (
            <span
              className={cn(
                'flex size-10 items-center justify-center rounded-lg',
                hasBesideIconTitle && 'shrink-0',
                getSolutionToneClasses(tone),
                size === 'small' && 'size-9',
              )}
            >
              <SolutionCardIcon kind={icon} />
            </span>
          ) : (
            <span className={hasBesideIconTitle ? 'shrink-0' : undefined} />
          )}
          {hasBesideIconTitle ? (
            <h3 className="m-0 min-w-0 flex-1 text-base font-semibold text-foreground">
              {title}
            </h3>
          ) : null}
          {href ? (
            <ArrowRightIcon
              className={cn(
                'size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground',
                hasBesideIconTitle && 'shrink-0',
              )}
            />
          ) : null}
        </div>
      )}
      <div
        className={cn(
          hasBesideIconTitle
            ? 'mt-3 flex flex-1 flex-col justify-center'
            : 'mt-4 flex-1',
          imageSrc && 'mt-0',
        )}
      >
        {hasBesideIconTitle ? null : (
          <h3 className="m-0 text-base font-semibold text-foreground">
            {title}
          </h3>
        )}
        {showDescription && description ? (
          <p
            className={cn(
              hasBesideIconTitle ? 'mt-0' : 'mt-2',
              'text-sm leading-6 text-muted-foreground',
            )}
          >
            {description}
          </p>
        ) : null}
      </div>
      {actions.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {actions.map((action) => (
            <a
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              href={action.href}
              key={`${action.href}\u001f${action.label}`}
              rel={
                action.href.startsWith('http')
                  ? 'noreferrer noopener'
                  : undefined
              }
              target={action.href.startsWith('http') ? '_blank' : undefined}
            >
              <span>{action.label}</span>
              <ArrowRightIcon className="size-3.5" />
            </a>
          ))}
        </div>
      ) : null}
      {tags.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              className="rounded-md bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground"
              key={tag}
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}
    </>
  );

  if (!href || actions.length > 0) {
    return <section className={cardClasses}>{content}</section>;
  }

  return (
    <a className={cardClasses} href={href}>
      {content}
    </a>
  );
}

export function DemoGallery({
  allPlatformsLabel,
  allProductsLabel,
  allTagsLabel,
  clearFiltersLabel,
  emptyMessage,
  items,
  platformFilterLabel,
  platformLabel,
  productFilterLabel,
  productLabel,
  releaseDateLabel,
  resultCountLabel,
  searchPlaceholder,
  tagFilterLabel,
  versionLabel,
}: {
  allPlatformsLabel: string;
  allProductsLabel: string;
  allTagsLabel: string;
  clearFiltersLabel: string;
  emptyMessage: string;
  items: DemoCatalogItem[];
  platformFilterLabel: string;
  platformLabel: string;
  productFilterLabel: string;
  productLabel: string;
  releaseDateLabel: string;
  resultCountLabel: string;
  searchPlaceholder: string;
  tagFilterLabel: string;
  versionLabel: string;
}) {
  const [query, setQuery] = useState('');
  const [activeTag, setActiveTag] = useState(allTagsLabel);
  const [activeProduct, setActiveProduct] = useState(allProductsLabel);
  const [activePlatform, setActivePlatform] = useState(allPlatformsLabel);
  const deferredQuery = useDeferredValue(query);

  const tags = useMemo(
    () => [
      allTagsLabel,
      ...getUniqueValues(items.flatMap((item) => item.tags)),
    ],
    [allTagsLabel, items],
  );
  const products = useMemo(
    () => [
      allProductsLabel,
      ...getUniqueValues(items.flatMap((item) => item.products)),
    ],
    [allProductsLabel, items],
  );
  const platforms = useMemo(
    () => [
      allPlatformsLabel,
      ...getUniqueValues(items.flatMap((item) => item.platforms)),
    ],
    [allPlatformsLabel, items],
  );

  const filteredItems = useMemo(() => {
    const normalizedQuery = normalizeRecipeFilterValue(deferredQuery);

    return items.filter((item) => {
      if (activeTag !== allTagsLabel && !item.tags.includes(activeTag)) {
        return false;
      }
      if (
        activeProduct !== allProductsLabel &&
        !item.products.includes(activeProduct)
      ) {
        return false;
      }
      if (
        activePlatform !== allPlatformsLabel &&
        !item.platforms.includes(activePlatform)
      ) {
        return false;
      }
      if (!normalizedQuery) {
        return true;
      }

      return normalizeRecipeFilterValue(
        [
          item.title,
          item.description,
          item.releaseDate,
          item.version,
          ...item.tags,
          ...item.products,
          ...item.platforms,
        ].join(' '),
      ).includes(normalizedQuery);
    });
  }, [
    activePlatform,
    activeProduct,
    activeTag,
    allPlatformsLabel,
    allProductsLabel,
    allTagsLabel,
    deferredQuery,
    items,
  ]);

  const hasActiveFilters =
    query.length > 0 ||
    activeTag !== allTagsLabel ||
    activeProduct !== allProductsLabel ||
    activePlatform !== allPlatformsLabel;

  const resetFilters = () => {
    setQuery('');
    setActiveTag(allTagsLabel);
    setActiveProduct(allProductsLabel);
    setActivePlatform(allPlatformsLabel);
  };

  return (
    <section className="not-prose my-8 flex flex-col gap-6">
      <div className="flex flex-col gap-4 border-border border-b pb-5">
        <ReferenceSearchInput
          onChange={setQuery}
          placeholder={searchPlaceholder}
          value={query}
        />
        <div className="flex flex-wrap items-end gap-3">
          <ReferenceFilterSelect
            label={tagFilterLabel}
            onChange={setActiveTag}
            options={tags.map((tag) => ({ label: tag, value: tag }))}
            value={activeTag}
          />
          <ReferenceFilterSelect
            label={productFilterLabel}
            onChange={setActiveProduct}
            options={products.map((product) => ({
              label: product,
              value: product,
            }))}
            value={activeProduct}
          />
          <ReferenceFilterSelect
            label={platformFilterLabel}
            onChange={setActivePlatform}
            options={platforms.map((platform) => ({
              label: platform,
              value: platform,
            }))}
            value={activePlatform}
          />
          {hasActiveFilters ? (
            <Button onClick={resetFilters} type="button" variant="ghost">
              {clearFiltersLabel}
            </Button>
          ) : null}
          {filteredItems.length > 0 ? (
            <span className="ml-auto self-end text-sm text-muted-foreground">
              {filteredItems.length} {resultCountLabel}
            </span>
          ) : null}
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/35 p-8 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredItems.map((item) => (
            <a
              className="group relative overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-colors hover:border-primary/40 hover:bg-accent/35"
              href={item.href}
              key={item.href}
            >
              <div className="aspect-[7/4] overflow-hidden border-border border-b bg-muted">
                <img
                  alt={item.imageAlt}
                  className="size-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                  loading="lazy"
                  src={item.imageSrc}
                />
              </div>
              <span className="absolute top-3 right-3 flex size-8 items-center justify-center rounded-full bg-background/90 text-muted-foreground shadow-sm ring-1 ring-border backdrop-blur transition-colors group-hover:text-foreground">
                <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
              </span>
              <div className="p-5">
                <h2 className="m-0 text-base font-semibold text-foreground">
                  {item.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {item.description}
                </p>
                <dl className="mt-4 grid gap-1 text-xs text-muted-foreground">
                  <div className="flex gap-1">
                    <dt className="shrink-0 whitespace-nowrap font-medium text-foreground">
                      {platformLabel}：
                    </dt>
                    <dd className="m-0">{item.platforms.join('、')}</dd>
                  </div>
                  <div className="flex gap-1">
                    <dt className="shrink-0 whitespace-nowrap font-medium text-foreground">
                      {productLabel}：
                    </dt>
                    <dd className="m-0">{item.products.join('、')}</dd>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    <div className="flex gap-1">
                      <dt className="shrink-0 whitespace-nowrap font-medium text-foreground">
                        {releaseDateLabel}：
                      </dt>
                      <dd className="m-0">{item.releaseDate}</dd>
                    </div>
                    <div className="flex gap-1">
                      <dt className="shrink-0 whitespace-nowrap font-medium text-foreground">
                        {versionLabel}：
                      </dt>
                      <dd className="m-0">{item.version}</dd>
                    </div>
                  </div>
                </dl>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {item.tags.map((tag) => (
                    <span
                      className="rounded-md bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground"
                      key={tag}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}

export function RecipesCatalog({
  allCategoriesLabel,
  allProductsLabel,
  allStacksLabel,
  categoryFilterLabel,
  clearFiltersLabel,
  emptyMessage,
  groupByProduct = false,
  items,
  productGroups,
  productFilterLabel,
  searchPlaceholder,
  showCategoryFilter = true,
  showDescription = true,
  showTags = true,
  stackFilterLabel,
  stackQueryParam,
}: {
  allCategoriesLabel: string;
  allProductsLabel: string;
  allStacksLabel: string;
  categoryFilterLabel: string;
  clearFiltersLabel: string;
  emptyMessage: string;
  groupByProduct?: boolean;
  items: RecipeCatalogItem[];
  productGroups?: Record<string, RecipeCatalogGroupMeta>;
  productFilterLabel: string;
  searchPlaceholder: string;
  showCategoryFilter?: boolean;
  showDescription?: boolean;
  showTags?: boolean;
  stackFilterLabel: string;
  stackQueryParam?: string;
}) {
  const [query, setQuery] = useState('');
  const [activeProduct, setActiveProduct] = useState(allProductsLabel);
  const [activeCategory, setActiveCategory] = useState(allCategoriesLabel);
  const initialStack = useMemo(
    () => getInitialRecipeStack(items, allStacksLabel, stackQueryParam),
    [allStacksLabel, items, stackQueryParam],
  );
  const [activeStack, setActiveStack] = useState(initialStack);
  const deferredQuery = useDeferredValue(query);

  const products = useMemo(
    () => [
      allProductsLabel,
      ...getUniqueValues(items.map((item) => item.product)),
    ],
    [allProductsLabel, items],
  );
  const categories = useMemo(
    () => [
      allCategoriesLabel,
      ...getUniqueValues(items.map((item) => item.category)),
    ],
    [allCategoriesLabel, items],
  );
  const stacks = useMemo(
    () => [
      allStacksLabel,
      ...getUniqueValues(items.map((item) => item.stack).filter(Boolean)),
    ],
    [allStacksLabel, items],
  );

  const filteredItems = useMemo(() => {
    const normalizedQuery = normalizeRecipeFilterValue(deferredQuery);

    return items.filter((item) => {
      if (
        activeProduct !== allProductsLabel &&
        item.product !== activeProduct
      ) {
        return false;
      }

      if (
        activeCategory !== allCategoriesLabel &&
        item.category !== activeCategory
      ) {
        return false;
      }

      if (
        activeStack !== allStacksLabel &&
        (item.stack ?? '') !== activeStack
      ) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const haystack = normalizeRecipeFilterValue(
        [
          item.title,
          item.description,
          item.product,
          item.category,
          item.stack,
          ...(item.tags ?? []),
          ...(item.links?.map((link) => link.label) ?? []),
        ]
          .filter(Boolean)
          .join(' '),
      );

      return haystack.includes(normalizedQuery);
    });
  }, [
    activeCategory,
    activeProduct,
    activeStack,
    allCategoriesLabel,
    allProductsLabel,
    allStacksLabel,
    deferredQuery,
    items,
  ]);
  const hasActiveFilters =
    query.length > 0 ||
    activeProduct !== allProductsLabel ||
    activeCategory !== allCategoriesLabel ||
    activeStack !== allStacksLabel;
  const groupedItems = useMemo(() => {
    const groups = new Map<string, RecipeCatalogItem[]>();

    for (const item of filteredItems) {
      const entries = groups.get(item.product);

      if (entries) {
        entries.push(item);
      } else {
        groups.set(item.product, [item]);
      }
    }

    return [...groups.entries()].map(([product, items]) => ({
      items,
      product,
    }));
  }, [filteredItems]);

  return (
    <section className="not-prose my-8">
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="min-w-0 flex-1">
          <span className="sr-only">{searchPlaceholder}</span>
          <input
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40"
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
            type="search"
            value={query}
          />
        </label>
        {hasActiveFilters ? (
          <button
            className="h-10 rounded-md border border-border px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            onClick={() => {
              setQuery('');
              setActiveProduct(allProductsLabel);
              setActiveCategory(allCategoriesLabel);
              setActiveStack(allStacksLabel);
            }}
            type="button"
          >
            {clearFiltersLabel}
          </button>
        ) : null}
      </div>
      <div className="mt-5 grid gap-4">
        <RecipesCatalogFilterGroup
          activeValue={activeProduct}
          label={productFilterLabel}
          onSelect={setActiveProduct}
          values={products}
        />
        {showCategoryFilter ? (
          <RecipesCatalogFilterGroup
            activeValue={activeCategory}
            label={categoryFilterLabel}
            onSelect={setActiveCategory}
            values={categories}
          />
        ) : null}
        <RecipesCatalogFilterGroup
          activeValue={activeStack}
          label={stackFilterLabel}
          onSelect={setActiveStack}
          values={stacks}
        />
      </div>
      {filteredItems.length > 0 ? (
        groupByProduct ? (
          <div className="mt-8 space-y-8">
            {groupedItems.map((group) => (
              <section className="space-y-4" key={group.product}>
                <div className="flex items-start gap-3">
                  {(() => {
                    const productGroup = productGroups?.[group.product];

                    return productGroup?.icon ? (
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted text-foreground">
                        <SolutionCardIcon kind={productGroup.icon} />
                      </span>
                    ) : null;
                  })()}
                  <div className="min-w-0">
                    <h3 className="m-0 text-lg font-semibold text-foreground">
                      {productGroups?.[group.product]?.title ?? group.product}
                    </h3>
                    {productGroups?.[group.product]?.description ? (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {productGroups[group.product].description}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {group.items.map((item) => (
                    <SolutionCard
                      actions={item.links}
                      description={item.description}
                      href={item.href}
                      key={
                        item.href ??
                        `${item.product}-${item.stack ?? item.title}`
                      }
                      size="small"
                      showDescription={showDescription}
                      tags={
                        showTags
                          ? [
                              item.product,
                              item.category,
                              ...(item.stack ? [item.stack] : []),
                              ...(item.tags ?? []),
                              ...(item.links?.map((link) => link.label) ?? []),
                            ]
                          : []
                      }
                      title={item.title}
                      tone={item.tone ?? 'blue'}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <SolutionCardGrid size="small">
            {filteredItems.map((item) => (
              <SolutionCard
                actions={item.links}
                description={item.description}
                href={item.href}
                key={item.href ?? `${item.product}-${item.stack ?? item.title}`}
                size="small"
                showDescription={showDescription}
                tags={
                  showTags
                    ? [
                        item.product,
                        item.category,
                        ...(item.stack ? [item.stack] : []),
                        ...(item.tags ?? []),
                        ...(item.links?.map((link) => link.label) ?? []),
                      ]
                    : []
                }
                title={item.title}
                tone={item.tone ?? 'blue'}
              />
            ))}
          </SolutionCardGrid>
        )
      ) : (
        <div className="mt-6 rounded-lg border border-dashed border-border bg-muted/40 p-8 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </div>
      )}
    </section>
  );
}

function RecipesCatalogFilterGroup({
  activeValue,
  label,
  onSelect,
  values,
}: {
  activeValue: string;
  label: string;
  onSelect: (value: string) => void;
  values: string[];
}) {
  return (
    <fieldset className="m-0 grid min-w-0 border-0 p-0">
      <legend className="mb-2 p-0 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </legend>
      <div className="flex flex-wrap gap-2">
        {values.map((value) => (
          <button
            aria-pressed={value === activeValue}
            className={cn(
              'rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors',
              value === activeValue
                ? 'border-primary/30 bg-primary/10 text-foreground'
                : 'border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            )}
            key={value}
            onClick={() => onSelect(value)}
            type="button"
          >
            {value}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

const RECIPE_LEVELS = ['Beginner', 'Intermediate', 'Advanced'] as const;

function getRecipeLevel(item: RecipeCatalogItem) {
  return item.tags?.find((tag) =>
    (RECIPE_LEVELS as readonly string[]).includes(tag),
  );
}

function recipeKey(item: RecipeCatalogItem) {
  return item.href ?? `${item.product}-${item.stack ?? item.title}`;
}

function recipeTags(item: RecipeCatalogItem) {
  return [item.stack, getRecipeLevel(item)].filter(Boolean) as string[];
}

function RecipeGallerySelect({
  allLabel,
  label,
  onChange,
  options,
  value,
}: {
  allLabel: string;
  label: string;
  onChange: (value: string) => void;
  options: string[];
  value: string;
}) {
  return (
    <ReferenceFilterSelect
      label={label}
      onChange={onChange}
      options={options.map((option) => ({
        label: option === allLabel ? allLabel : option,
        value: option,
      }))}
      value={value}
    />
  );
}

export function RecipesGallery({
  allCategoriesLabel,
  allProductsLabel,
  allStacksLabel,
  categoryFilterLabel,
  clearFiltersLabel,
  emptyMessage,
  items,
  productFilterLabel,
  searchPlaceholder,
  stackFilterLabel,
  stackQueryParam,
}: {
  allCategoriesLabel: string;
  allProductsLabel: string;
  allStacksLabel: string;
  categoryFilterLabel: string;
  clearFiltersLabel: string;
  emptyMessage: string;
  items: RecipeCatalogItem[];
  productFilterLabel: string;
  searchPlaceholder: string;
  stackFilterLabel: string;
  stackQueryParam?: string;
}) {
  const allLevelsLabel = 'All levels';
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(allCategoriesLabel);
  const [activeProduct, setActiveProduct] = useState(allProductsLabel);
  const [activeStack, setActiveStack] = useState(() =>
    getInitialRecipeStack(items, allStacksLabel, stackQueryParam),
  );
  const [activeLevel, setActiveLevel] = useState(allLevelsLabel);
  const deferredQuery = useDeferredValue(query);

  const categories = useMemo(
    () => [
      allCategoriesLabel,
      ...getUniqueValues(items.map((item) => item.category)),
    ],
    [allCategoriesLabel, items],
  );
  const products = useMemo(
    () => [
      allProductsLabel,
      ...getUniqueValues(items.map((item) => item.product)),
    ],
    [allProductsLabel, items],
  );
  const stacks = useMemo(
    () => [
      allStacksLabel,
      ...getUniqueValues(items.map((item) => item.stack).filter(Boolean)),
    ],
    [allStacksLabel, items],
  );
  const levels = useMemo(
    () => [allLevelsLabel, ...getUniqueValues(items.map(getRecipeLevel))],
    [items],
  );

  const filteredItems = useMemo(() => {
    const normalizedQuery = normalizeRecipeFilterValue(deferredQuery);

    return items.filter((item) => {
      if (
        activeCategory !== allCategoriesLabel &&
        item.category !== activeCategory
      ) {
        return false;
      }
      if (
        activeProduct !== allProductsLabel &&
        item.product !== activeProduct
      ) {
        return false;
      }
      if (
        activeStack !== allStacksLabel &&
        (item.stack ?? '') !== activeStack
      ) {
        return false;
      }
      if (
        activeLevel !== allLevelsLabel &&
        getRecipeLevel(item) !== activeLevel
      ) {
        return false;
      }
      if (!normalizedQuery) {
        return true;
      }

      const haystack = normalizeRecipeFilterValue(
        [
          item.title,
          item.description,
          item.product,
          item.category,
          item.stack,
          ...(item.tags ?? []),
        ]
          .filter(Boolean)
          .join(' '),
      );
      return haystack.includes(normalizedQuery);
    });
  }, [
    activeCategory,
    activeLevel,
    activeProduct,
    activeStack,
    allCategoriesLabel,
    allProductsLabel,
    allStacksLabel,
    deferredQuery,
    items,
  ]);

  const hasActiveFilters =
    query.length > 0 ||
    activeCategory !== allCategoriesLabel ||
    activeProduct !== allProductsLabel ||
    activeStack !== allStacksLabel ||
    activeLevel !== allLevelsLabel;

  const resetFilters = () => {
    setQuery('');
    setActiveCategory(allCategoriesLabel);
    setActiveProduct(allProductsLabel);
    setActiveStack(allStacksLabel);
    setActiveLevel(allLevelsLabel);
  };

  const groupedByCategory = useMemo(
    () =>
      categories
        .filter((value) => value !== allCategoriesLabel)
        .map((category) => ({
          category,
          items: filteredItems.filter((item) => item.category === category),
        }))
        .filter((group) => group.items.length > 0),
    [allCategoriesLabel, categories, filteredItems],
  );

  return (
    <section className="not-prose my-8 flex flex-col gap-6">
      <div className="flex flex-col gap-4 border-border border-b pb-5">
        <ReferenceSearchInput
          onChange={setQuery}
          placeholder={searchPlaceholder}
          value={query}
        />
        <div className="flex flex-wrap items-end gap-3">
          <ReferenceFilterToggleGroup
            label={categoryFilterLabel}
            onChange={setActiveCategory}
            options={categories.map((category) => ({
              label: category,
              value: category,
            }))}
            value={activeCategory}
          />
          {products.length > 2 ? (
            <RecipeGallerySelect
              allLabel={allProductsLabel}
              label={productFilterLabel}
              onChange={setActiveProduct}
              options={products}
              value={activeProduct}
            />
          ) : null}
          <RecipeGallerySelect
            allLabel={allStacksLabel}
            label={stackFilterLabel}
            onChange={setActiveStack}
            options={stacks}
            value={activeStack}
          />
          {levels.length > 1 ? (
            <RecipeGallerySelect
              allLabel={allLevelsLabel}
              label="Level"
              onChange={setActiveLevel}
              options={levels}
              value={activeLevel}
            />
          ) : null}
          {hasActiveFilters ? (
            <Button onClick={resetFilters} type="button" variant="ghost">
              {clearFiltersLabel}
            </Button>
          ) : null}
          {filteredItems.length > 0 ? (
            <span className="ml-auto self-end text-sm text-muted-foreground">
              {filteredItems.length} recipes
            </span>
          ) : null}
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/35 p-8 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </div>
      ) : activeCategory === allCategoriesLabel ? (
        <div className="flex flex-col gap-8">
          {groupedByCategory.map((group) => (
            <section className="flex flex-col gap-3" key={group.category}>
              <div className="flex items-baseline gap-2">
                <h3 className="m-0 text-base font-semibold text-foreground">
                  {group.category}
                </h3>
                <span className="text-xs font-medium text-muted-foreground">
                  {group.items.length}
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {group.items.map((item) => (
                  <SolutionCard
                    description={item.description}
                    href={item.href}
                    key={recipeKey(item)}
                    size="small"
                    tags={recipeTags(item)}
                    title={item.title}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredItems.map((item) => (
            <SolutionCard
              description={item.description}
              href={item.href}
              key={recipeKey(item)}
              size="small"
              tags={recipeTags(item)}
              title={item.title}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function getUniqueValues(values: Array<string | undefined>) {
  return [
    ...new Set(values.filter((value): value is string => Boolean(value))),
  ];
}

function getInitialRecipeStack(
  items: RecipeCatalogItem[],
  fallback: string,
  queryParam?: string,
) {
  if (typeof window === 'undefined' || !queryParam) {
    return fallback;
  }

  const queryValue = new URLSearchParams(window.location.search).get(
    queryParam,
  );

  if (!queryValue) {
    return fallback;
  }

  const normalizedQueryValue = normalizeRecipeFilterValue(
    queryValue.replace(/-/g, ' '),
  );
  const matchingStack = getUniqueValues(
    items.map((item) => item.stack).filter(Boolean),
  ).find((stack) => {
    const normalizedStack = normalizeRecipeFilterValue(stack);

    return (
      normalizedStack === normalizedQueryValue ||
      normalizedStack.replace(/\s+/g, '-') ===
        normalizeRecipeFilterValue(queryValue)
    );
  });

  return matchingStack ?? fallback;
}

function normalizeRecipeFilterValue(value: string) {
  return value.trim().toLowerCase();
}

function getSolutionToneClasses(_tone: SolutionCardTone) {
  // Icon chips use a single theme-driven neutral surface so cards stay visually
  // consistent across the overview pages. Only the icon glyph varies by product.
  return 'bg-muted text-foreground';
}

export function SolutionCardIcon({ kind }: { kind: SolutionCardIconKind }) {
  const iconMap: Record<SolutionCardIconKind, ReactNode> = {
    ai: <BotIcon className="size-5" />,
    analytics: <BarChart3Icon className="size-5" />,
    broadcast: <TvIcon className="size-5" />,
    chat: <MessagesSquareIcon className="size-5" />,
    classroom: <GraduationCapIcon className="size-5" />,
    'cloud-recording': <CloudIcon className="size-5" />,
    device: <CuboidIcon className="size-5" />,
    iot: <CpuIcon className="size-5" />,
    'live-streaming': <RadioIcon className="size-5" />,
    'media-pull': <ArrowDownToLineIcon className="size-5" />,
    'media-push': <ArrowUpFromLineIcon className="size-5" />,
    meeting: <AppWindowIcon className="size-5" />,
    messaging: <BlocksIcon className="size-5" />,
    'on-premise-recording': <HardDriveIcon className="size-5" />,
    rtc: <AudioLinesIcon className="size-5" />,
    'rtmp-gateway': <RadioTowerIcon className="size-5" />,
    'server-sdk': <ServerCogIcon className="size-5" />,
    signaling: <NetworkIcon className="size-5" />,
    tools: <TerminalSquareIcon className="size-5" />,
    transcoding: <FilmIcon className="size-5" />,
    transcription: <CaptionsIcon className="size-5" />,
    'video-calling': <VideoIcon className="size-5" />,
    'voice-calling': <PhoneIcon className="size-5" />,
    whiteboard: <PresentationIcon className="size-5" />,
  };

  return iconMap[kind] ?? <AudioLinesIcon className="size-5" />;
}

type OverviewSpotlightSize = 'large' | 'small';

function OverviewSpotlightGrid({
  children,
  size = 'large',
}: {
  children: ReactNode;
  size?: OverviewSpotlightSize;
}) {
  return (
    <section
      className={cn(
        'not-prose my-8 grid gap-4',
        size === 'small' ? 'sm:grid-cols-3' : 'md:grid-cols-3',
      )}
    >
      {children}
    </section>
  );
}

type OverviewSpotlightVariant = 'checklist' | 'code' | 'platform';

function OverviewSpotlightCard({
  description,
  href,
  size = 'large',
  title,
  variant = 'platform',
}: {
  description?: string;
  href: string;
  size?: OverviewSpotlightSize;
  title: string;
  variant?: OverviewSpotlightVariant;
}) {
  return (
    <a
      className={cn(
        'group overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-colors hover:border-primary/40 hover:bg-accent/35',
        size === 'small' && 'text-sm',
      )}
      href={href}
    >
      <div
        aria-hidden="true"
        className={cn(
          'border-b border-border bg-muted/45 p-4',
          size === 'small' && 'p-3',
        )}
      >
        <div className="mb-3 flex gap-1.5">
          <span className="size-2 rounded-full bg-muted-foreground/35" />
          <span className="size-2 rounded-full bg-muted-foreground/25" />
          <span className="size-2 rounded-full bg-muted-foreground/20" />
        </div>
        <div className="min-h-24">
          {variant === 'platform' ? <OverviewSpotlightPlatformVisual /> : null}
          {variant === 'code' ? <OverviewSpotlightCodeVisual /> : null}
          {variant === 'checklist' ? (
            <OverviewSpotlightChecklistVisual />
          ) : null}
        </div>
      </div>
      <div className="flex items-start justify-between gap-3 p-4">
        <div className="min-w-0">
          <h3 className="m-0 text-base font-semibold text-foreground">
            {title}
          </h3>
          {description ? (
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        <ArrowRightIcon className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
      </div>
    </a>
  );
}

function OverviewSpotlightPlatformVisual() {
  return (
    <div className="grid gap-2">
      <div className="h-8 rounded-md bg-background shadow-sm" />
      <div className="grid grid-cols-2 gap-2">
        <div className="h-12 rounded-md bg-background shadow-sm" />
        <div className="h-12 rounded-md bg-background shadow-sm" />
      </div>
      <div className="h-3 w-2/3 rounded-full bg-primary/25" />
    </div>
  );
}

function OverviewSpotlightCodeVisual() {
  return (
    <div className="rounded-md bg-foreground p-3 font-mono text-[11px] leading-5 text-background">
      <div>session = AgentSession(</div>
      <div className="pl-3 opacity-80">rtc=&quot;voice&quot;,</div>
      <div className="pl-3 opacity-80">llm=&quot;realtime&quot;,</div>
      <div>)</div>
    </div>
  );
}

function OverviewSpotlightChecklistVisual() {
  return (
    <div className="grid gap-2">
      <div className="rounded-md bg-foreground px-3 py-2 font-mono text-[11px] text-background">
        &gt; create project
      </div>
      {['Project name', 'App ID', 'Certificate'].map((label) => (
        <div
          className="flex items-center gap-2 rounded-md bg-background px-3 py-2 text-xs text-muted-foreground shadow-sm"
          key={label}
        >
          <span className="size-2 rounded-full bg-primary/55" />
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
