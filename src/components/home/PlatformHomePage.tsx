import {
  ArrowRight,
  AudioLines,
  Bot,
  Braces,
  Cable,
  ChevronRight,
  CloudCog,
  Gauge,
  Globe2,
  History,
  KeyRound,
  LayoutGrid,
  Library,
  MapPinned,
  MessageSquareText,
  MicVocal,
  Rocket,
  RadioTower,
  Search,
  ShieldCheck,
  Sparkles,
  WandSparkles,
  Webhook,
  Workflow,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HomeDocContent } from '@/components/home/HomeDocContent';
import { PortalDocContent } from '@/components/home/PortalDocContent';
import { PortalSidebar } from '@/components/home/PortalSidebar';
import { cn } from '@/lib/cn';
import { localizePortalData } from '@/lib/convoai-portal-localization';
import { loadHomeMarkdownPages } from '@/lib/home-markdown';
import { useLocale } from '@/lib/i18n/use-locale';
import type { PortalTab } from '@/lib/convoai-portal.server';

export const HOME_TABS = [
  'overview',
  'get-started',
  'ai',
  'realtime-media',
  'solutions',
  'api-reference',
  'best-practices',
] as const;

export type HomeTabKey = (typeof HOME_TABS)[number];

const OVERVIEW_EMBEDDED_DOC_PREFIX = 'overview-doc:';
const OVERVIEW_MARKDOWN_PAGE_ALIASES: Record<string, string> = {
  'overview-doc:docs:user-guides/audio-modality': 'overview-media-services',
  'overview-doc:docs:user-guides/custom-data': 'overview-messaging',
};
const AI_EMBEDDED_DOC_PREFIX = 'ai-doc:';
const AI_MARKDOWN_PAGE_ALIASES: Record<string, string> = {
  'landing-page': 'ai-overview',
};
const REALTIME_MEDIA_MARKDOWN_PAGE_ALIASES: Record<string, string> = {
  'user-guides/audio-modality': 'rm-overview',
};
type HomeMarkdownPageMap = ReturnType<typeof loadHomeMarkdownPages>[keyof ReturnType<
  typeof loadHomeMarkdownPages
>];
type HomeMarkdownPage = HomeMarkdownPageMap[string];

type Action = {
  href: string;
  label: string;
  variant: 'default' | 'outline';
};

type Callout = {
  body: string;
  title: string;
};

type CardItem = {
  body: string;
  href?: string;
  icon: LucideIcon;
  kicker?: string;
  linkLabel?: string;
  previewChips?: string[];
  previewText?: string;
  title: string;
  variant?: 'default' | 'quickstart';
};

type ResourceItem = {
  body: string;
  ctaLabel?: string;
  href: string;
  icon: LucideIcon;
  title: string;
};

type ResourceGroupItem = {
  href: string;
  icon: LucideIcon;
  label: string;
};

type ResourceGroup = {
  items: ResourceGroupItem[];
  title: string;
};

type Section =
  | {
      id: string;
      items: Callout[];
      title: string;
      type: 'triptych';
    }
  | {
      cards: CardItem[];
      columns?: 2 | 3 | 4;
      id: string;
      title: string;
      type: 'cards';
    }
  | {
      id: string;
      resources: ResourceItem[];
      title: string;
      type: 'resource-list';
    }
  | {
      actionHref: string;
      actionLabel: string;
      groups: ResourceGroup[];
      id: string;
      title: string;
      type: 'resource-groups';
    };

type SidebarItem = {
  active?: boolean;
  children?: SidebarItem[];
  expanded?: boolean;
  href: string;
  label: string;
  muted?: boolean;
  section?: boolean;
};

type SidebarGroup = {
  items: SidebarItem[];
  title: string;
};

type DocPageContent = {
  description?: string;
  heroActions?: Action[];
  heroEyebrow?: string;
  heroTitle: string;
  sections: Section[];
};

type TabConfig = {
  description: string;
  heroActions: Action[];
  heroEyebrow: string;
  heroTitle: string;
  label: string;
  pages?: Record<string, DocPageContent>;
  sections: Section[];
  sidebar: SidebarGroup[];
};

export function PlatformHomePage({
  domain,
  page,
  portalData,
  tab,
}: {
  domain?: string;
  page?: string;
  portalData?: PortalTab[];
  tab: HomeTabKey;
}) {
  const { locale, setLocale } = useLocale();
  const { t } = useTranslation('common');
  const isZh = locale === 'zh-CN';
  const [activeAnchor, setActiveAnchor] = useState('');

  useEffect(() => {
    const syncAnchor = () => {
      setActiveAnchor(window.location.hash || '');
    };

    syncAnchor();
    window.addEventListener('hashchange', syncAnchor);
    return () => window.removeEventListener('hashchange', syncAnchor);
  }, []);

  const activeSidebarKey = `${page ?? ''}${activeAnchor}`;
  const localizedPortalData = portalData
    ? localizePortalData(portalData, locale)
    : undefined;
  const portalState = localizedPortalData
    ? resolvePortalState(localizedPortalData, domain, page)
    : null;
  const isOverviewTab = tab === 'overview' && portalState === null;
  const overviewEmbeddedDoc =
    isOverviewTab && localizedPortalData
      ? resolveOverviewEmbeddedDoc(localizedPortalData, page)
      : null;
  const aiEmbeddedDoc =
    tab === 'ai' && localizedPortalData
      ? resolveAiEmbeddedDoc(localizedPortalData, page)
      : null;
  const activeEmbeddedDoc = overviewEmbeddedDoc ?? aiEmbeddedDoc;
  const homeMarkdownPages = loadHomeMarkdownPages();
  const markdownPageKey =
    tab === 'overview'
      ? resolveOverviewMarkdownPageKey(page, homeMarkdownPages[locale])
      : tab === 'ai'
        ? resolveAiMarkdownPageKey(page, homeMarkdownPages[locale])
        : tab === 'realtime-media'
          ? resolveRealtimeMediaMarkdownPageKey(page, homeMarkdownPages[locale])
        : null;
  const isMarkdownHomeTab =
    tab === 'overview' || tab === 'ai' || tab === 'realtime-media';
  const overviewMarkdownPageKey = isOverviewTab
    ? markdownPageKey
    : null;
  const activeTab = getTabConfig(locale, tab, page);
  const activePage =
    activeTab.pages?.[
      page ?? (isOverviewTab ? 'platform-overview' : '')
    ] ?? null;
  const markdownPage =
    markdownPageKey && homeMarkdownPages[locale]?.[markdownPageKey]
      ? homeMarkdownPages[locale][markdownPageKey]
      : null;
  const markdownTitle =
    markdownPage && isMarkdownHomeTab
      ? resolveSidebarLabel(
          activeTab.sidebar,
          markdownPageKey ?? page,
        ) ?? markdownPage.title
      : markdownPage?.title;
  const embeddedDocTitle =
    activeEmbeddedDoc && isMarkdownHomeTab
      ? resolveSidebarLabel(activeTab.sidebar, page) ?? activeEmbeddedDoc.title
      : activeEmbeddedDoc?.title;
  const display = activePage
    ? {
        description: activePage.description ?? activeTab.description,
        heroActions: activePage.heroActions ?? activeTab.heroActions,
        heroEyebrow: activePage.heroEyebrow ?? activeTab.heroEyebrow,
        heroTitle: activePage.heroTitle,
        sections: activePage.sections,
      }
    : {
        description: activeTab.description,
        heroActions: activeTab.heroActions,
        heroEyebrow: activeTab.heroEyebrow,
        heroTitle: activeTab.heroTitle,
        sections: activeTab.sections,
      };
  const tabList = HOME_TABS.filter((key) => key !== 'get-started').map((key) => ({
    key,
    label: getTabConfig(locale, key, page).label,
  }));
  const showOverviewGetStarted =
    isOverviewTab && (page ?? 'platform-overview') === 'platform-overview';

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/75 bg-background/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[126rem] items-center gap-4 px-5 py-4 sm:px-7 lg:px-10">
          <a className="flex min-w-0 items-center gap-3" href="/">
            <div className="flex size-10 items-center justify-center rounded-2xl border border-border bg-card/90 shadow-[0_16px_40px_-28px_rgba(33,139,120,0.28)]">
              <div className="flex items-end gap-1">
                <span className="h-3.5 w-1 rounded-full bg-primary/75" />
                <span className="h-5.5 w-1 rounded-full bg-foreground" />
                <span className="h-2.5 w-1 rounded-full bg-border" />
              </div>
            </div>
            <span className="text-[1.05rem] font-semibold tracking-[-0.02em] text-foreground">
              Agora Docs
            </span>
          </a>

          <div className="ml-auto flex items-center gap-3">
            <button
              className="hidden rounded-xl border border-border/70 px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:inline-flex md:items-center"
              onClick={() => void setLocale(isZh ? 'en' : 'zh-CN')}
              type="button"
            >
              <Globe2 className="mr-2 size-4" />
              {isZh ? t('controls.language.english') : t('controls.language.chinese')}
            </button>
            <a
              className="hidden rounded-xl border border-border/70 px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:inline-flex"
              href="/docs/convoai/restful/landing-page"
            >
              <Sparkles className="mr-2 size-4" />
              {isZh ? 'AI 入口' : 'AI Entry'}
            </a>
            <a
              className="inline-flex rounded-xl border border-border/70 px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              href="/api/search"
            >
              <Search className="mr-2 size-4" />
              {isZh ? '搜索' : 'Search'}
            </a>
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-[126rem] items-center gap-8 overflow-x-auto px-5 py-3 text-sm text-muted-foreground sm:px-7 lg:px-10">
              {tabList.map((item) => (
            <a
              className={cn(
                'inline-flex items-center whitespace-nowrap border-b border-transparent pb-1 transition-colors hover:text-foreground',
                item.key === tab && 'border-primary text-foreground',
              )}
              href={resolveTopTabHref(item.key)}
              key={item.key}
            >
              {item.label}
            </a>
          ))}
        </div>
      </header>

      <main
        className={cn(
          'mx-auto grid w-full max-w-[126rem] grid-cols-1',
          portalState || activeEmbeddedDoc
            ? 'lg:grid-cols-[16rem_minmax(0,1fr)]'
            : 'lg:grid-cols-[16rem_minmax(0,1fr)] xl:grid-cols-[16rem_minmax(0,1fr)_15rem]',
        )}
      >
        {portalState ? (
          <>
            <PortalSidebar
              activeDoc={portalState.activeDoc}
              activeTab={portalState.activeTab}
              homeTab={tab}
            />

            <div className="px-5 py-10 sm:px-7 lg:px-10 lg:py-14 xl:px-12">
              <div className="w-full max-w-none">
                <PortalDocContent
                  description={portalState.activeDoc.description}
                  markdownUrl={portalState.activeDoc.markdownUrl}
                  path={portalState.activeDoc.path}
                  title={portalState.activeDoc.title}
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <aside className="hidden border-r border-border/75 px-5 py-8 lg:block xl:px-6 xl:py-10">
              <div className="sticky top-[8.2rem] max-h-[calc(100vh-9rem)] overflow-y-auto pr-2">
                <nav className="space-y-7">
                  {activeTab.sidebar.map((group) => (
                    <section key={group.title}>
                      <p className="mb-2.5 text-[0.72rem] font-semibold tracking-[0.01em] text-foreground/88">
                        {group.title}
                      </p>
                      <OverviewSidebarList
                        activeKey={activeSidebarKey}
                        items={group.items}
                      />
                    </section>
                  ))}
                </nav>
              </div>
            </aside>

            {activeEmbeddedDoc ? (
              <div className="px-5 py-10 sm:px-7 lg:px-10 lg:py-14 xl:px-12">
                <div className="w-full max-w-none">
                  <PortalDocContent
                    description={activeEmbeddedDoc.description}
                    markdownUrl={activeEmbeddedDoc.markdownUrl}
                    path={activeEmbeddedDoc.path}
                    title={embeddedDocTitle ?? activeEmbeddedDoc.title}
                  />
                </div>
              </div>
            ) : markdownPage ? (
              <div className="px-5 py-10 sm:px-7 lg:px-10 lg:py-14 xl:px-12">
                <div className="w-full max-w-none">
                  <HomeDocContent
                    description={markdownPage.description}
                    locale={locale}
                    pageKey={markdownPageKey ?? page ?? ''}
                    title={markdownTitle ?? markdownPage.title}
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="px-5 py-10 sm:px-7 lg:px-10 lg:py-14 xl:px-12">
                  <article className="w-full max-w-[980px] space-y-9">
                    <section id="hero">
                      <div className="space-y-4.5">
                        <h1 className="max-w-[12ch] text-[2rem] font-semibold leading-[1.04] tracking-[-0.04em] text-foreground sm:text-[2.4rem]">
                          {display.heroTitle}
                        </h1>
                        <p className="max-w-[44ch] text-[0.96rem] leading-7 text-muted-foreground">
                          {display.description}
                        </p>
                      </div>
                    </section>

                    {showOverviewGetStarted ? (
                      <OverviewGetStartedShowcase isZh={isZh} />
                    ) : null}

                    {display.sections.map((section) =>
                      section.type === 'triptych' ? (
                        <section
                          className="rounded-[1.65rem] border border-border/70 bg-card/72 p-6"
                          id={section.id}
                          key={section.id}
                        >
                          <div className="mb-5 flex items-center gap-2">
                            <LayoutGrid className="size-4.5 text-primary" />
                            <h2 className="text-[1.18rem] font-semibold text-foreground">
                              {section.title}
                            </h2>
                          </div>
                          <div className="grid gap-4 lg:grid-cols-3">
                            {section.items.map((item) => (
                              <div
                                className="rounded-[1.3rem] border border-border/65 bg-background/76 p-5"
                                key={item.title}
                              >
                                <h3 className="text-[1rem] font-semibold text-foreground">
                                  {item.title}
                                </h3>
                                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                                  {item.body}
                                </p>
                              </div>
                            ))}
                          </div>
                        </section>
                      ) : section.type === 'resource-groups' ? (
                        <ResourceGroupsSection key={section.id} section={section} />
                      ) : section.type === 'resource-list' ? (
                        <ResourceListSection key={section.id} section={section} />
                      ) : Array.isArray(section.cards) ? (
                        <section id={section.id} key={section.id}>
                          <div className="mb-4 flex items-center gap-2">
                            <LayoutGrid className="size-4.5 text-primary" />
                            <h2 className="text-[1.18rem] font-semibold text-foreground">
                              {section.title}
                            </h2>
                          </div>
                          <div
                            className={cn(
                              'grid gap-4',
                              section.columns === 2 && 'md:grid-cols-2',
                              section.columns === 3 &&
                                'md:grid-cols-2 xl:grid-cols-3',
                              section.columns === 4 &&
                                'md:grid-cols-2 xl:grid-cols-4',
                            )}
                          >
                            {section.cards.map((card) => (
                              <ContentCard card={card} key={card.title} />
                            ))}
                          </div>
                        </section>
                      ) : null,
                    )}
                  </article>
                </div>

                <aside className="hidden xl:block">
                  <div className="sticky top-[8.8rem] max-h-[calc(100vh-10rem)] overflow-y-auto border-l border-border/70 pl-5 text-muted-foreground">
                    <h3 className="mb-3 text-[0.72rem] font-medium uppercase tracking-[0.12em]">
                      {isZh ? '本页目录' : 'On this page'}
                    </h3>
                    <ul className="space-y-1">
                      {buildToc({
                        ...activeTab,
                        description: display.description,
                        heroActions: display.heroActions,
                        heroEyebrow: display.heroEyebrow,
                        heroTitle: display.heroTitle,
                        sections: display.sections,
                      }).map((item) => (
                        <li key={item.href}>
                          <a
                            className="block rounded-lg px-3 py-1.5 text-[0.84rem] transition-colors hover:bg-accent/42 hover:text-foreground"
                            href={item.href}
                          >
                            {item.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </aside>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );

  function resolveTopTabHref(tabKey: HomeTabKey) {
    if (tabKey === 'overview') {
      return '/';
    }

    const fallback = tabHrefFallbacks[tabKey];
    if (fallback) {
      return `/?tab=${tabKey}&domain=${fallback.domain}&page=${fallback.page}`;
    }

    return `/?tab=${tabKey}`;
  }
}

const tabHrefFallbacks = {
  ai: {
    domain: 'home',
    page: 'ai-overview',
  },
  'api-reference': {
    domain: 'api',
    page: 'operations/start-agent',
  },
  'best-practices': {
    domain: 'recepies',
    page: 'user-guides/audio-modality',
  },
  'get-started': {
    domain: 'sdks',
    page: 'get-started/quick-start-go',
  },
  'realtime-media': {
    domain: 'home',
    page: 'rm-overview',
  },
  solutions: {
    domain: 'docs',
    page: 'user-guides/custom-data',
  },
} as const satisfies Partial<
  Record<HomeTabKey, { domain: string; page: string }>
>;

function ContentCard({ card }: { card: CardItem }) {
  if (card.variant === 'quickstart') {
    return <QuickstartCard card={card} />;
  }

  const CardIcon = card.icon;
  const className =
    'group block rounded-[1.45rem] border border-border/70 bg-card/72 p-5 transition-colors hover:bg-accent/28';
  const content = (
    <>
      <div className="mb-3 inline-flex rounded-2xl bg-primary/10 p-2.5 text-primary">
        <CardIcon className="size-4.5" />
      </div>
      {card.kicker ? (
        <p className="mb-2 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-primary/88">
          {card.kicker}
        </p>
      ) : null}
      <h3 className="text-[1rem] font-semibold text-foreground">{card.title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{card.body}</p>
      {card.href ? (
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
          {card.linkLabel ?? 'Explore'}
          <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      ) : null}
    </>
  );

  if (!card.href) {
    return <div className={className}>{content}</div>;
  }

  return (
    <a className={className} href={card.href}>
      {content}
    </a>
  );
}

function OverviewSidebarList({
  activeKey,
  items,
}: {
  activeKey: string;
  items: SidebarItem[];
}) {
  return (
    <ul className="space-y-1.5">
      {items.map((item) => (
        <OverviewSidebarItem activeKey={activeKey} item={item} key={item.label} />
      ))}
    </ul>
  );
}

function OverviewSidebarItem({
  activeKey,
  item,
}: {
  activeKey: string;
  item: SidebarItem;
}) {
  const hasChildren = (item.children?.length ?? 0) > 0;
  const isItemActive = getSidebarItemKey(item.href) === activeKey;
  const defaultExpanded = item.expanded ?? item.active ?? isItemActive ?? false;
  const [expanded, setExpanded] = useState(defaultExpanded);

  useEffect(() => {
    if (hasChildren) {
      setExpanded(item.expanded ?? item.active ?? isItemActive ?? false);
    }
  }, [hasChildren, isItemActive, item.active, item.expanded]);

  return (
    <li>
      {hasChildren ? (
        <button
          className={cn(
            'flex w-full items-center justify-between gap-3 rounded-2xl px-3 py-2 text-left text-[0.88rem] text-muted-foreground transition-colors hover:bg-accent/55 hover:text-foreground',
            item.section && 'mt-1 text-foreground/86',
          )}
          onClick={() => setExpanded((value) => !value)}
          type="button"
        >
          <span>{item.label}</span>
          <ChevronRight
            className={cn(
              'size-4 shrink-0 text-foreground/50 transition-transform',
              expanded && 'rotate-90',
            )}
          />
        </button>
      ) : (
        <a
          className={cn(
            'flex items-center rounded-2xl px-3 py-2 text-[0.88rem] text-muted-foreground transition-colors hover:bg-accent/55 hover:text-foreground',
            item.muted && 'pl-10 text-[0.9rem]',
            item.section && 'mt-1 text-foreground/86',
            isItemActive &&
              !item.section &&
              'bg-primary/12 text-foreground shadow-[inset_0_0_0_1px_rgba(16,185,129,0.14)]',
          )}
          href={item.href}
        >
          {item.label}
        </a>
      )}

      {hasChildren && expanded ? (
        <div className="mt-1 pl-0">
          <OverviewSidebarList activeKey={activeKey} items={item.children ?? []} />
        </div>
      ) : null}
    </li>
  );
}

function getSidebarItemKey(href: string) {
  const pageMatch = href.match(/[?&]page=([^&#]+)/);
  const hashMatch = href.match(/#(.+)$/);
  return `${pageMatch?.[1] ?? ''}${hashMatch ? `#${hashMatch[1]}` : ''}`;
}

function MarkdownDocView({
  page,
}: {
  page: HomeMarkdownPage;
}) {
  const blocks = parseMarkdownBlocks(page.rawBody);
  const resolvedTitle =
    page.title === 'Untitled' ? inferMarkdownDocTitle(blocks) ?? page.title : page.title;

  return (
    <article className="rounded-[1.55rem] border border-border/70 bg-card/72 px-7 py-8 sm:px-8">
      <div className="space-y-8">
        <header className="space-y-4 border-b border-border/70 pb-8">
          <h1 className="text-[2rem] font-semibold leading-[1.08] tracking-[-0.04em] text-foreground sm:text-[2.35rem]">
            {resolvedTitle}
          </h1>
          {page.description ? (
            <p className="max-w-[44rem] text-[1rem] leading-8 text-muted-foreground">
              {page.description}
            </p>
          ) : null}
        </header>

        {blocks.map((block) => {
          if (block.type === 'paragraph') {
            return (
              <p
                className="text-[1rem] leading-8 text-muted-foreground"
                key={block.text}
              >
                {block.text}
              </p>
            );
          }

          return (
            <section id={slugify(block.title)} key={block.title}>
              <h2 className="text-[1.3rem] font-semibold text-foreground">
                {block.title}
              </h2>
              <div className="mt-5 space-y-5 text-[1rem] leading-8 text-muted-foreground">
                {block.items.map((item) => {
                  if (item.type === 'heading') {
                    return (
                      <h3
                        className="pt-1 text-[1.08rem] font-semibold text-foreground"
                        key={`${block.title}-${item.text}`}
                      >
                        {item.text}
                      </h3>
                    );
                  }

                  if (item.type === 'list') {
                    return (
                      <ul
                        className="space-y-3 pl-5 marker:text-foreground/55"
                        key={`${block.title}-${item.items.join('|')}`}
                      >
                        {item.items.map((entry) => {
                          const link = parseInlineMarkdownLink(entry);
                          return (
                            <li key={entry}>
                              {link ? (
                                <a
                                  className="inline-flex items-center gap-2 font-medium text-primary transition-colors hover:text-foreground"
                                  href={link.href}
                                >
                                  {link.label}
                                  <ChevronRight className="size-4" />
                                </a>
                              ) : (
                                entry
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    );
                  }

                  return (
                    <p key={`${block.title}-${item.text}`}>{item.text}</p>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </article>
  );
}

function ResourceListSection({
  section,
}: {
  section: Extract<Section, { type: 'resource-list' }>;
}) {
  const resources = section.resources ?? [];

  return (
    <section id={section.id}>
      <div className="mb-4 flex items-center gap-2">
        <LayoutGrid className="size-4.5 text-primary" />
        <h2 className="text-[1.18rem] font-semibold text-foreground">
          {section.title}
        </h2>
      </div>
      <div className="overflow-hidden rounded-[1.65rem] border border-border/70 bg-card/76">
        {resources.map((resource, index) => {
          const ResourceIcon = resource.icon;

          return (
            <a
              className={cn(
                'group grid gap-3 px-5 py-5 transition-colors hover:bg-accent/22 md:grid-cols-[minmax(0,13rem)_minmax(0,1fr)_auto] md:items-center md:gap-5',
                index > 0 && 'border-t border-border/65',
              )}
              href={resource.href}
              key={resource.title}
            >
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/8 text-primary">
                  <ResourceIcon className="size-4.5" />
                </div>
                <h3 className="text-[1rem] font-semibold text-foreground">
                  {resource.title}
                </h3>
              </div>
              <p className="text-sm leading-7 text-muted-foreground">
                {resource.body}
              </p>
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                {resource.ctaLabel ?? 'Explore'}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </a>
          );
        })}
      </div>
    </section>
  );
}

function ResourceGroupsSection({
  section,
}: {
  section: Extract<Section, { type: 'resource-groups' }>;
}) {
  return (
    <section id={section.id}>
      <div className="mb-4 flex flex-col gap-3 border-b border-border/70 pb-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-[1.18rem] font-semibold text-foreground">
          {section.title}
        </h2>
        <a
          className="inline-flex items-center rounded-xl border border-border/70 bg-background px-3.5 py-2 text-[0.88rem] font-medium text-foreground transition-colors hover:bg-accent/30"
          href={section.actionHref}
        >
          {section.actionLabel}
        </a>
      </div>

      <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
        {section.groups.map((group) => (
          <div key={group.title}>
            <h3 className="mb-4 text-[0.76rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {group.title}
            </h3>
            <div className="space-y-4">
              {group.items.map((item) => {
                const ItemIcon = item.icon;

                return (
                  <a
                    className="group flex items-center gap-3 rounded-xl transition-colors hover:text-foreground"
                    href={item.href}
                    key={item.label}
                  >
                    <div className="flex size-12 items-center justify-center rounded-2xl border border-border/70 bg-background text-foreground/80 transition-colors group-hover:border-primary/20 group-hover:text-primary">
                      <ItemIcon className="size-5" />
                    </div>
                    <span className="text-[0.96rem] leading-7 text-foreground/92 group-hover:text-foreground">
                      {item.label}
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function OverviewGetStartedShowcase({ isZh }: { isZh: boolean }) {
  const cards: CardItem[] = isZh
    ? [
        {
          body: '在浏览器里快速搭起第一个智能体原型，先验证语音、提示词和基础链路。',
          href: '/?tab=ai',
          icon: Bot,
          linkLabel: '打开 AI 入口',
          previewChips: ['Builder', 'Voice', 'Preset'],
          previewText: 'Create your first agent right in the browser.',
          title: '智能体搭建器',
          variant: 'quickstart',
        },
        {
          body: '用代码按步骤跑通语音 AI 快速开始，建立第一条实时对话链路。',
          href: '/docs/convoai/restful/get-started/quick-start',
          icon: MicVocal,
          linkLabel: '查看快速开始',
          previewText:
            'session = AgentSession(...)\nstt = "realtime-stt"\nllm = "gpt-5"\ntts = "voice"',
          title: '语音 AI 快速开始',
          variant: 'quickstart',
        },
        {
          body: '让你常用的 coding agent 搜索 Agora 文档、生成代码并辅助排查集成问题。',
          href: '/?tab=overview&page=overview-community-resources',
          icon: Braces,
          linkLabel: '查看资源',
          previewText:
            '> create a voice AI app\n• searched Agora docs\n• read quickstart\n• wrote integration code',
          title: 'Coding Agent 支持',
          variant: 'quickstart',
        },
      ]
    : [
        {
          body: 'Prototype your first agent in the browser before you expand into full integration work.',
          href: '/?tab=ai',
          icon: Bot,
          linkLabel: 'Open AI entry',
          previewChips: ['Builder', 'Voice', 'Preset'],
          previewText: 'Create your first agent right in the browser.',
          title: 'Agent Builder',
          variant: 'quickstart',
        },
        {
          body: 'Follow the step-by-step voice AI quickstart and ship the first realtime conversation loop in code.',
          href: '/docs/convoai/restful/get-started/quick-start',
          icon: MicVocal,
          linkLabel: 'Read quickstart',
          previewText:
            'session = AgentSession(...)\nstt = "realtime-stt"\nllm = "gpt-5"\ntts = "voice"',
          title: 'Voice AI quickstart',
          variant: 'quickstart',
        },
        {
          body: 'Use your favorite coding agent to search Agora docs, generate code, and debug integrations faster.',
          href: '/?tab=overview&page=overview-community-resources',
          icon: Braces,
          linkLabel: 'Open resources',
          previewText:
            '> create a voice AI app\n• searched Agora docs\n• read quickstart\n• wrote integration code',
          title: 'Coding agent support',
          variant: 'quickstart',
        },
      ];

  return (
    <section id="get-started-showcase">
      <div className="mb-6">
        <h2 className="text-[2rem] font-semibold tracking-[-0.03em] text-foreground">
          {isZh ? '快速开始' : 'Get started'}
        </h2>
        <p className="mt-2 text-[1rem] leading-7 text-muted-foreground">
          {isZh
            ? '从这三个入口开始，先把第一条语音 AI 接入链路跑通。'
            : 'Start building with these first three entry points.'}
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <QuickstartCard card={card} key={card.title} />
        ))}
      </div>
    </section>
  );
}

function QuickstartCard({ card }: { card: CardItem }) {
  const CardIcon = card.icon;
  const label = card.linkLabel ?? 'Read next';

  return (
    <a
      className="group flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-border/70 bg-card/94 shadow-[0_18px_36px_-30px_rgba(15,23,42,0.12)] transition-transform hover:-translate-y-0.5 hover:border-primary/20"
      href={card.href}
    >
      <div className="flex h-[17.5rem] flex-col border-b border-border/55 bg-[linear-gradient(180deg,rgba(121,153,255,0.1),rgba(255,255,255,0.96)_26%,rgba(249,251,251,0.98))] p-5">
        <div className="mb-3 flex gap-2">
          <span className="size-2.5 rounded-full bg-border/65" />
          <span className="size-2.5 rounded-full bg-border/65" />
          <span className="size-2.5 rounded-full bg-border/65" />
        </div>
        <div className="relative h-[12rem] overflow-hidden rounded-[1rem] border border-border/55 bg-background/92 p-5">
          {card.previewChips && card.previewChips.length > 0 ? (
            <div className="mb-3 flex flex-wrap gap-2">
              {card.previewChips.map((chip) => (
                <span
                  className="rounded-full border border-border/50 bg-background/82 px-2.5 py-1 text-[0.68rem] font-medium text-muted-foreground"
                  key={chip}
                >
                  {chip}
                </span>
              ))}
            </div>
          ) : null}
          {card.previewText ? (
            <p className="max-w-[15rem] pr-16 text-[0.9rem] leading-8 text-muted-foreground whitespace-pre-line">
              {card.previewText}
            </p>
          ) : null}
          <div className="absolute right-4 bottom-4 flex size-14 items-center justify-center rounded-[1rem] border border-primary/16 bg-primary/6 text-primary shadow-[0_10px_20px_-16px_rgba(22,127,109,0.24)]">
            <CardIcon className="size-7" />
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-5 py-5">
        <h3 className="min-h-[2rem] truncate text-[1.12rem] font-semibold leading-8 tracking-[-0.03em] text-foreground">
          {card.title}
        </h3>
        <p className="mt-3 min-h-[6.5rem] text-[0.95rem] leading-8 text-muted-foreground">
          {card.body}
        </p>
        <span className="mt-auto inline-flex items-center gap-2 pt-4 text-[0.98rem] font-medium text-primary">
          {label}
          <ArrowRight className="size-4.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </a>
  );
}

function buildToc(tab: TabConfig) {
  const items = [
    {
      href: '#hero',
      label: tab.heroEyebrow,
    },
  ];

  if (tab.heroTitle === 'Agora Docs') {
    items.push({
      href: '#get-started-showcase',
      label: tab.heroEyebrow === '概览' ? '快速开始' : 'Get started',
    });
  }

  return [
    ...items,
    ...tab.sections.map((section) => ({
      href: `#${section.id}`,
      label: section.title,
    })),
  ];
}

function buildMarkdownToc(page: HomeMarkdownPage) {
  return (
    page.sections
      ?.filter((section) => section.title.trim().length > 0)
      .map((section) => ({
        href: `#${slugify(section.title)}`,
        label: section.title,
      })) ?? []
  );
}

function resolveSidebarLabel(
  groups: SidebarGroup[],
  page: string | undefined,
): string | null {
  if (!page) {
    return null;
  }

  for (const group of groups) {
    const match = findSidebarItemLabel(group.items, page);
    if (match) {
      return match;
    }
  }

  return null;
}

function findSidebarItemLabel(
  items: SidebarItem[],
  page: string,
): string | null {
  for (const item of items) {
    const itemPage = getOverviewPageFromHref(item.href);
    if (itemPage === page) {
      return item.label;
    }

    if (item.children) {
      const childMatch = findSidebarItemLabel(item.children, page);
      if (childMatch) {
        return childMatch;
      }
    }
  }

  return null;
}

function getOverviewPageFromHref(href: string) {
  const match = href.match(/[?&]page=([^&]+)/);
  return match?.[1] ?? null;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-');
}

function parseInlineMarkdownLink(value: string) {
  const match = value.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
  if (!match) {
    return null;
  }

  return {
    href: match[2],
    label: match[1],
  };
}

type MarkdownDocBlock =
  | {
      text: string;
      type: 'paragraph';
    }
  | {
      items: Array<
        | {
            text: string;
            type: 'paragraph';
          }
        | {
            text: string;
            type: 'heading';
          }
        | {
            items: string[];
            type: 'list';
          }
      >;
      title: string;
      type: 'section';
    };

function inferMarkdownDocTitle(blocks: MarkdownDocBlock[]) {
  const firstSection = blocks.find(
    (block): block is Extract<MarkdownDocBlock, { type: 'section' }> =>
      block.type === 'section' && block.title.trim().length > 0,
  );

  if (firstSection) {
    return firstSection.title.trim();
  }

  const firstParagraph = blocks.find(
    (block): block is Extract<MarkdownDocBlock, { type: 'paragraph' }> =>
      block.type === 'paragraph' && block.text.trim().length > 0,
  );

  return firstParagraph?.text.trim() ?? null;
}

function parseMarkdownBlocks(markdown: string): MarkdownDocBlock[] {
  const lines = markdown.split('\n');
  const blocks: MarkdownDocBlock[] = [];
  let currentSection: Extract<MarkdownDocBlock, { type: 'section' }> | null =
    null;
  let paragraphLines: string[] = [];
  let listItems: string[] = [];

  const flushParagraph = () => {
    if (paragraphLines.length === 0) {
      return;
    }

    const text = paragraphLines.join(' ').trim();
    paragraphLines = [];

    if (!text) {
      return;
    }

    if (currentSection) {
      currentSection.items.push({ text, type: 'paragraph' });
      return;
    }

    blocks.push({ text, type: 'paragraph' });
  };

  const flushList = () => {
    if (listItems.length === 0) {
      return;
    }

    if (currentSection) {
      currentSection.items.push({ items: listItems, type: 'list' });
    } else {
      blocks.push({
        text: listItems.join(' '),
        type: 'paragraph',
      });
    }

    listItems = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    if (line.startsWith('## ')) {
      flushParagraph();
      flushList();
      currentSection = {
        items: [],
        title: line.slice(3).trim(),
        type: 'section',
      };
      blocks.push(currentSection);
      continue;
    }

    if (line.startsWith('### ')) {
      flushParagraph();
      flushList();

      if (!currentSection) {
        currentSection = {
          items: [],
          title: 'Section',
          type: 'section',
        };
        blocks.push(currentSection);
      }

      currentSection.items.push({
        text: line.slice(4).trim(),
        type: 'heading',
      });
      continue;
    }

    if (line.startsWith('- ')) {
      flushParagraph();
      listItems.push(line.slice(2).trim());
      continue;
    }

    paragraphLines.push(line);
  }

  flushParagraph();
  flushList();

  return blocks;
}

function resolvePortalState(
  portalData: PortalTab[],
  domain?: string,
  page?: string,
) {
  if (!domain && !page) {
    return null;
  }

  const activeTab = resolvePortalActiveTab(portalData, domain, page);
  if (!activeTab) {
    return null;
  }

  const activeDoc =
    activeTab.docs.find((doc) => doc.pageKey === page) ?? activeTab.docs[0];

  if (!activeDoc) {
    return null;
  }

  return {
    activeDoc,
    activeTab,
  };
}

function resolveOverviewEmbeddedDoc(
  portalData: PortalTab[],
  page?: string,
) {
  if (page && OVERVIEW_MARKDOWN_PAGE_ALIASES[page]) {
    return null;
  }

  const decoded = decodeOverviewEmbeddedDocPage(page);
  if (!decoded) {
    return null;
  }

  const normalizedDomain = normalizeLegacyDomain(
    decoded.domain,
    decoded.pageKey,
  );
  const tab =
    portalData.find((item) => item.key === normalizedDomain) ??
    portalData.find((item) => item.key === decoded.domain);
  if (!tab) {
    return null;
  }

  return tab.docs.find((doc) => doc.pageKey === decoded.pageKey) ?? null;
}

function resolveAiEmbeddedDoc(
  portalData: PortalTab[],
  page?: string,
) {
  const decoded = decodeAiEmbeddedDocPage(page);
  if (!decoded) {
    return null;
  }

  const normalizedDomain = normalizeLegacyDomain(
    decoded.domain,
    decoded.pageKey,
  );
  const tab =
    portalData.find((item) => item.key === normalizedDomain) ??
    portalData.find((item) => item.key === decoded.domain);
  if (!tab) {
    return null;
  }

  return tab.docs.find((doc) => doc.pageKey === decoded.pageKey) ?? null;
}

function resolveOverviewMarkdownPageKey(
  page: string | undefined,
  pages: HomeMarkdownPageMap | undefined,
) {
  const aliasedPage = page ? OVERVIEW_MARKDOWN_PAGE_ALIASES[page] : null;
  if (aliasedPage && pages && aliasedPage in pages) {
    return aliasedPage;
  }

  if (
    !page ||
    !pages ||
    page === 'platform-overview' ||
    page.startsWith(OVERVIEW_EMBEDDED_DOC_PREFIX)
  ) {
    return null;
  }

  if (page in pages) {
    return page;
  }

  if (!page.startsWith('overview-')) {
    const legacyKey = `overview-${page}`;
    if (legacyKey in pages) {
      return legacyKey;
    }
  }

  return null;
}

function resolveAiMarkdownPageKey(
  page: string | undefined,
  pages: HomeMarkdownPageMap | undefined,
) {
  const aliasedPage = page ? AI_MARKDOWN_PAGE_ALIASES[page] : 'ai-overview';
  if (aliasedPage && pages && aliasedPage in pages) {
    return aliasedPage;
  }

  if (!page || !pages) {
    return null;
  }

  if (page in pages) {
    return page;
  }

  return null;
}

function resolveRealtimeMediaMarkdownPageKey(
  page: string | undefined,
  pages: HomeMarkdownPageMap | undefined,
) {
  const aliasedPage = page
    ? REALTIME_MEDIA_MARKDOWN_PAGE_ALIASES[page]
    : 'rm-overview';

  if (aliasedPage && pages && aliasedPage in pages) {
    return aliasedPage;
  }

  if (!page || !pages) {
    return null;
  }

  if (page in pages) {
    return page;
  }

  return null;
}

function decodeOverviewEmbeddedDocPage(page?: string) {
  if (!page?.startsWith(OVERVIEW_EMBEDDED_DOC_PREFIX)) {
    return null;
  }

  const rest = page.slice(OVERVIEW_EMBEDDED_DOC_PREFIX.length);
  const separator = rest.indexOf(':');
  if (separator === -1) {
    return null;
  }

  return {
    domain: rest.slice(0, separator),
    pageKey: rest.slice(separator + 1),
  };
}

function buildOverviewEmbeddedDocPage(domain: string, pageKey: string) {
  return `${OVERVIEW_EMBEDDED_DOC_PREFIX}${domain}:${pageKey}`;
}

function decodeAiEmbeddedDocPage(page?: string) {
  if (!page?.startsWith(AI_EMBEDDED_DOC_PREFIX)) {
    return null;
  }

  const rest = page.slice(AI_EMBEDDED_DOC_PREFIX.length);
  const separator = rest.indexOf(':');
  if (separator === -1) {
    return null;
  }

  return {
    domain: rest.slice(0, separator),
    pageKey: rest.slice(separator + 1),
  };
}

function buildAiEmbeddedDocPage(domain: string, pageKey: string) {
  return `${AI_EMBEDDED_DOC_PREFIX}${domain}:${pageKey}`;
}

function resolvePortalActiveTab(
  portalData: PortalTab[],
  domain?: string,
  page?: string,
) {
  if (domain) {
    const normalizedDomain = normalizeLegacyDomain(domain, page);
    const byNormalizedDomain = portalData.find(
      (tab) => tab.key === normalizedDomain,
    );
    if (byNormalizedDomain) {
      return byNormalizedDomain;
    }

    const byDomain = portalData.find((tab) => tab.key === domain);
    if (byDomain) {
      return byDomain;
    }
  }

  if (page) {
    return (
      portalData.find((tab) =>
        tab.docs.some((doc) => doc.pageKey === page),
      ) ?? null
    );
  }

  return null;
}

function normalizeLegacyDomain(domain: string, page?: string) {
  if (domain !== 'docs') {
    return domain;
  }

  if (!page) {
    return domain;
  }

  if (
    page === 'get-started/quick-start-go' ||
    page === 'get-started/quick-start-java'
  ) {
    return 'sdks';
  }

  if (
    [
      'user-guides/realtime-sub',
      'user-guides/audio-modality',
      'user-guides/short-term-memory',
      'user-guides/interrupt-agent',
      'user-guides/send-multimodal-message',
      'user-guides/listen-agent-events',
    ].includes(page)
  ) {
    return 'recepies';
  }

  return domain;
}

function getTabConfig(
  locale: 'en' | 'zh-CN',
  tab: HomeTabKey,
  page?: string,
): TabConfig {
  const isZh = locale === 'zh-CN';

  const labels = isZh
    ? {
        ai: 'AI',
        api: 'API 参考',
        best: '最佳实践',
        exploreMore: '探索更多',
        getStarted: '快速开始',
        overview: '介绍',
        platformInfo: '平台信息',
        realtime: '实时与媒体',
        solutions: '场景方案',
      }
    : {
        ai: 'AI',
        api: 'API Reference',
        best: 'Best Practices',
        exploreMore: 'Explore More',
        getStarted: 'Get Started',
        overview: 'Introduction',
        platformInfo: 'Platform Info',
        realtime: 'Realtime & Media',
        solutions: 'Solutions',
      };

  const exploreMore = [
    {
      href: `/?tab=overview&page=${buildOverviewEmbeddedDocPage('docs', 'get-started/quick-start')}`,
      label: labels.getStarted,
    },
    {
      href: `/?tab=overview&page=${buildOverviewEmbeddedDocPage('docs', 'landing-page')}`,
      label: labels.ai,
    },
    {
      href: `/?tab=overview&page=${buildOverviewEmbeddedDocPage('docs', 'user-guides/audio-modality')}`,
      label: labels.realtime,
    },
    {
      href: `/?tab=overview&page=${buildOverviewEmbeddedDocPage('api', 'operations/start-agent')}`,
      label: labels.api,
    },
  ];

  const commonActions = isZh
    ? [
        { href: '/docs/convoai/restful/get-started/quick-start', label: '开始接入', variant: 'default' as const },
        { href: '/docs/convoai/restful/overview/product-overview', label: '查看产品概览', variant: 'outline' as const },
      ]
    : [
        { href: '/docs/convoai/restful/get-started/quick-start', label: 'Start building', variant: 'default' as const },
        { href: '/docs/convoai/restful/overview/product-overview', label: 'View product overview', variant: 'outline' as const },
      ];

  const overviewMoreResourcesSection = {
    actionHref: '/docs/convoai/restful/resources',
    actionLabel: isZh ? '查看全部入口' : 'See all resources',
    groups: isZh
      ? [
          {
            items: [
              {
                href: '/docs/convoai/restful/get-started/quick-start',
                icon: Sparkles,
                label: '对话式 AI 快速开始',
              },
              {
                href: '/docs/convoai/restful/get-started/quick-start-go',
                icon: Cable,
                label: 'Go 服务端快速开始',
              },
              {
                href: '/docs/convoai/restful/get-started/quick-start-java',
                icon: Wrench,
                label: 'Java 服务端快速开始',
              },
            ],
            title: '快速开始',
          },
          {
            items: [
              {
                href: '/docs/convoai/restful/overview/product-overview',
                icon: Library,
                label: '产品概览',
              },
              {
                href: '/docs/convoai/restful/overview/concepts',
                icon: LayoutGrid,
                label: '关键概念',
              },
              {
                href: '/docs/convoai/restful/overview/release-notes',
                icon: History,
                label: '发版说明',
              },
              {
                href: '/docs/convoai/restful/overview/billing',
                icon: History,
                label: '计费说明',
              },
            ],
            title: '产品与平台',
          },
          {
            items: [
              {
                href: '/docs/convoai/restful/operations/start-agent',
                icon: Rocket,
                label: '创建智能体',
              },
              {
                href: '/?tab=api-reference',
                icon: Braces,
                label: 'API 参考',
              },
              {
                href: '/docs/convoai/restful/user-guides/http-basic-auth',
                icon: ShieldCheck,
                label: 'HTTP 基础认证',
              },
            ],
            title: '服务端接口',
          },
          {
            items: [
              {
                href: '/docs/convoai/restful/skills-integrate',
                icon: WandSparkles,
                label: 'Skills 集成',
              },
              {
                href: '/docs/convoai/restful/mcp-integrate',
                icon: Webhook,
                label: 'MCP 集成',
              },
              {
                href: '/docs/convoai/restful/resources',
                icon: Gauge,
                label: '资源与参考',
              },
            ],
            title: '工具与扩展',
          },
        ]
      : [
          {
            items: [
              {
                href: '/docs/convoai/restful/get-started/quick-start',
                icon: Sparkles,
                label: 'Voice AI quickstart',
              },
              {
                href: '/docs/convoai/restful/get-started/quick-start-go',
                icon: Cable,
                label: 'Go server quickstart',
              },
              {
                href: '/docs/convoai/restful/get-started/quick-start-java',
                icon: Wrench,
                label: 'Java server quickstart',
              },
            ],
            title: 'Quickstarts',
          },
          {
            items: [
              {
                href: '/docs/convoai/restful/overview/product-overview',
                icon: Library,
                label: 'Product overview',
              },
              {
                href: '/docs/convoai/restful/overview/concepts',
                icon: LayoutGrid,
                label: 'Core concepts',
              },
              {
                href: '/docs/convoai/restful/overview/release-notes',
                icon: History,
                label: 'Release notes',
              },
              {
                href: '/docs/convoai/restful/overview/billing',
                icon: History,
                label: 'Billing',
              },
            ],
            title: 'Product & platform',
          },
          {
            items: [
              {
                href: '/docs/convoai/restful/operations/start-agent',
                icon: Rocket,
                label: 'Create agent',
              },
              {
                href: '/?tab=api-reference',
                icon: Braces,
                label: 'API reference',
              },
              {
                href: '/docs/convoai/restful/user-guides/http-basic-auth',
                icon: ShieldCheck,
                label: 'HTTP basic auth',
              },
            ],
            title: 'Server APIs',
          },
          {
            items: [
              {
                href: '/docs/convoai/restful/skills-integrate',
                icon: WandSparkles,
                label: 'Skills integration',
              },
              {
                href: '/docs/convoai/restful/mcp-integrate',
                icon: Webhook,
                label: 'MCP integration',
              },
              {
                href: '/docs/convoai/restful/resources',
                icon: Gauge,
                label: 'Resources',
              },
            ],
            title: 'Tools & extensions',
          },
        ],
    id: 'more-resources',
    title: isZh ? '更多资源' : 'More resources',
    type: 'resource-groups' as const,
  };

  const configs: Record<HomeTabKey, TabConfig> = {
    overview: {
      description: isZh
        ? '对话式 AI / 语音通话 / 视频通话 / 互动直播 / 实时消息'
        : 'Conversational AI / Voice Calling / Video Calling / Interactive Live Streaming / Real-time Messaging',
      heroActions: isZh
        ? [
            { href: '/docs/convoai/restful/get-started/quick-start', label: '从 AI 开始', variant: 'default' },
            { href: '#choose-your-path', label: '浏览能力入口', variant: 'outline' },
          ]
        : [
            { href: '/docs/convoai/restful/get-started/quick-start', label: 'Start with AI', variant: 'default' },
            { href: '#choose-your-path', label: 'Explore capabilities', variant: 'outline' },
          ],
      heroEyebrow: isZh ? '概览' : 'Overview',
      heroTitle: isZh
        ? 'Agora Docs'
        : 'Agora Docs',
      label: labels.overview,
      pages: isZh
        ? {
            'platform-overview': {
              description: '对话式 AI / 语音通话 / 视频通话 / 互动直播 / 实时消息',
              heroActions: [
                { href: '/docs/convoai/restful/get-started/quick-start', label: '从 AI 开始', variant: 'default' },
                { href: '/?tab=realtime-media', label: '实时与媒体', variant: 'outline' },
              ],
              heroEyebrow: '概览',
              heroTitle: 'Agora Docs',
              sections: [
                {
                  cards: [
                    {
                      body: '从实时对话、ASR、TTS、模型接入和打断控制开始，构建第一条 AI 语音链路。',
                      href: '/?tab=ai',
                      icon: Bot,
                      title: '构建 AI 语音应用',
                    },
                    {
                      body: '聚焦低时延音频、媒体通道与语音交互，把实时体验做成稳定底座。',
                      href: '/?tab=realtime-media',
                      icon: RadioTower,
                      title: '构建实时音视频能力',
                    },
                    {
                      body: '串联消息、事件、Webhook 和状态同步，让业务流程更完整。',
                      href: '/docs/convoai/restful/user-guides/listen-agent-events',
                      icon: MessageSquareText,
                      title: '集成消息与协同',
                    },
                    {
                      body: '从录制、转录、媒体处理与交付链路切入，补齐生产环境中的媒体服务。',
                      href: '/docs/convoai/restful/user-guides/audio-modality',
                      icon: CloudCog,
                      title: '使用媒体处理服务',
                    },
                  ],
                  columns: 4,
                  id: 'choose-your-path',
                  title: '选择你的路径',
                  type: 'cards',
                },
                {
                  cards: [
                    {
                      body: 'ConvoAI、AIGC、实时转录翻译、Agent 集成与模型扩展。',
                      href: '/?tab=ai',
                      icon: Sparkles,
                      title: 'AI',
                    },
                    {
                      body: '实时语音、事件监听、低时延优化、交互中断与音频模态。',
                      href: '/?tab=realtime-media',
                      icon: AudioLines,
                      title: '实时与媒体',
                    },
                    {
                      body: '按业务目标组合能力，从客服、陪伴、教育到智能设备接入。',
                      href: '/?tab=solutions',
                      icon: Workflow,
                      title: '场景方案',
                    },
                    {
                      body: '控制台、鉴权、安全、版本更新与对开发者友好的稳定入口。',
                      href: '/?tab=best-practices',
                      icon: ShieldCheck,
                      title: '平台与实践',
                    },
                  ],
                  columns: 4,
                  id: 'browse-by-capability',
                  title: '按能力浏览',
                  type: 'cards',
                },
                overviewMoreResourcesSection,
              ],
            },
            'choose-your-path': {
              description: '根据你当前的目标，先进入最接近的能力域，再逐步下钻到产品、接口和运维文档。',
              heroEyebrow: '概览',
              heroTitle: '选择你的路径',
              sections: [
                {
                  cards: [
                    {
                      body: '从实时对话、ASR、TTS、模型接入和打断控制开始，构建第一条 AI 语音链路。',
                      href: '/?tab=ai',
                      icon: Bot,
                      title: '构建 AI 语音应用',
                    },
                    {
                      body: '聚焦低时延音频、媒体通道与语音交互，把实时体验做成稳定底座。',
                      href: '/?tab=realtime-media',
                      icon: RadioTower,
                      title: '构建实时音视频能力',
                    },
                    {
                      body: '串联消息、事件、Webhook 和状态同步，让业务流程更完整。',
                      href: '/docs/convoai/restful/user-guides/listen-agent-events',
                      icon: MessageSquareText,
                      title: '集成消息与协同',
                    },
                    {
                      body: '从录制、转录、媒体处理与交付链路切入，补齐生产环境中的媒体服务。',
                      href: '/docs/convoai/restful/user-guides/audio-modality',
                      icon: CloudCog,
                      title: '使用媒体处理服务',
                    },
                  ],
                  columns: 4,
                  id: 'path-grid',
                  title: '推荐路径',
                  type: 'cards',
                },
                {
                  items: [
                    {
                      body: '如果你要做 AI Native 语音体验，先进入 AI 能力页，再补齐接口和最佳实践。',
                      title: 'AI 优先路径',
                    },
                    {
                      body: '如果你已经有实时互动产品，优先从实时与媒体能力进入，再连接 AI 或消息能力。',
                      title: '实时互动路径',
                    },
                    {
                      body: '如果你在做业务系统协同，优先把消息、事件和状态同步链路理顺。',
                      title: '协同与控制路径',
                    },
                  ],
                  id: 'path-principles',
                  title: '路径判断原则',
                  type: 'triptych',
                },
              ],
            },
            'browse-by-capability': {
              description: '把平台按稳定能力域组织，帮助团队先理解边界，再进入具体产品目录。',
              heroEyebrow: '概览',
              heroTitle: '按能力浏览',
              sections: [
                {
                  cards: [
                    {
                      body: 'ConvoAI、AIGC、实时转录翻译、Agent 集成与模型扩展。',
                      href: '/?tab=ai',
                      icon: Sparkles,
                      title: 'AI',
                    },
                    {
                      body: '实时语音、事件监听、低时延优化、交互中断与音频模态。',
                      href: '/?tab=realtime-media',
                      icon: AudioLines,
                      title: '实时与媒体',
                    },
                    {
                      body: '按业务目标组合能力，从客服、陪伴、教育到智能设备接入。',
                      href: '/?tab=solutions',
                      icon: Workflow,
                      title: '场景方案',
                    },
                    {
                      body: '控制台、鉴权、安全、版本更新与对开发者友好的稳定入口。',
                      href: '/?tab=best-practices',
                      icon: ShieldCheck,
                      title: '平台与实践',
                    },
                  ],
                  columns: 4,
                  id: 'capability-grid',
                  title: '能力域',
                  type: 'cards',
                },
              ],
            },
            'product-matrix': {
              description: '用产品矩阵解释能力、产品与场景之间的关系，帮助用户知道下一步该进入哪个入口。',
              heroEyebrow: '平台信息',
              heroTitle: '产品矩阵',
              sections: [
                {
                  cards: [
                    {
                      body: '负责语音智能体、模型调用、上下文管理和实时交互。',
                      href: '/docs/convoai/restful/overview/product-overview',
                      icon: Bot,
                      title: 'AI 产品层',
                    },
                    {
                      body: '负责语音、视频、消息和状态同步的基础实时能力。',
                      href: '/?tab=realtime-media',
                      icon: RadioTower,
                      title: '实时互动层',
                    },
                    {
                      body: '负责录制、转码、转录、流媒体输入输出与交付。',
                      href: '/docs/convoai/restful/user-guides/audio-modality',
                      icon: CloudCog,
                      title: '媒体服务层',
                    },
                    {
                      body: '负责控制台、计费、安全、发版和运维治理入口。',
                      href: '/?tab=best-practices',
                      icon: ShieldCheck,
                      title: '平台治理层',
                    },
                  ],
                  columns: 4,
                  id: 'matrix-grid',
                  title: '矩阵视图',
                  type: 'cards',
                },
              ],
            },
            'pricing-access': {
              description: '把计费、权限、凭证和访问控制作为平台接入的基础条件，而不是散落在不同产品页面里。',
              heroEyebrow: '平台信息',
              heroTitle: '计费与权限',
              sections: [
                {
                  items: [
                    {
                      body: '先开通服务、获取 App ID 和客户密钥，再进入真正的接入动作。',
                      title: '接入前准备',
                    },
                    {
                      body: '按能力域和产品层理解哪些能力需要单独开通，避免跑到一半才发现权限缺失。',
                      title: '按能力理解权限',
                    },
                    {
                      body: '对外暴露接口前，先区分服务端密钥、客户端身份和临时凭证的边界。',
                      title: '区分凭证类型',
                    },
                  ],
                  id: 'pricing-setup',
                  title: '基础规则',
                  type: 'triptych',
                },
                {
                  cards: [
                    {
                      body: '查看当前对话式 AI 引擎的计费说明和能力开通方式。',
                      href: '/docs/convoai/restful/overview/billing',
                      icon: History,
                      title: 'ConvoAI 计费说明',
                    },
                    {
                      body: '从开通服务页进入，串起权限、App ID 和密钥准备工作。',
                      href: '/docs/convoai/restful/get-started/enable-service',
                      icon: KeyRound,
                      title: '开通服务',
                    },
                  ],
                  columns: 2,
                  id: 'pricing-links',
                  title: '相关入口',
                  type: 'cards',
                },
              ],
            },
            'security-compliance': {
              description: '围绕身份认证、回调安全、地理策略和生产接入边界整理安全与合规能力。',
              heroEyebrow: '平台信息',
              heroTitle: '安全与合规',
              sections: [
                {
                  cards: [
                    {
                      body: '为服务端接入补齐基础鉴权，降低接口暴露风险。',
                      href: '/docs/convoai/restful/user-guides/http-basic-auth',
                      icon: ShieldCheck,
                      title: 'HTTP 基础认证',
                    },
                    {
                      body: '结合区域访问控制限制服务覆盖范围，满足特定地区要求。',
                      href: '/docs/convoai/restful/best-practice/geofencing',
                      icon: MapPinned,
                      title: '区域访问控制',
                    },
                    {
                      body: '启用回调前先确认事件订阅、来源验证和数据处理范围。',
                      href: '/docs/convoai/restful/webhook/enable-ncs',
                      icon: Webhook,
                      title: '回调安全',
                    },
                  ],
                  columns: 3,
                  id: 'security-controls',
                  title: '关键控制项',
                  type: 'cards',
                },
              ],
            },
            'release-notes': {
              description: '发版说明帮助团队理解平台变化、接口更新和迁移节奏，不应该埋在单个产品介绍后面。',
              heroEyebrow: '平台信息',
              heroTitle: '发版说明',
              sections: [
                {
                  items: [
                    {
                      body: '优先关注会影响接口行为、事件字段和接入路径的版本变化。',
                      title: '先看高影响变更',
                    },
                    {
                      body: '对需要迁移的团队，把发版说明和最佳实践一起看，避免只看到功能新增。',
                      title: '和迁移建议配套阅读',
                    },
                    {
                      body: '保持产品、接口和生产运维层面的更新节奏一致，避免信息错位。',
                      title: '保持多层更新同步',
                    },
                  ],
                  id: 'release-principles',
                  title: '阅读建议',
                  type: 'triptych',
                },
                {
                  cards: [
                    {
                      body: '查看对话式 AI 引擎的最近发版和能力更新。',
                      href: '/docs/convoai/restful/overview/release-notes',
                      icon: History,
                      title: 'ConvoAI 发版说明',
                    },
                  ],
                  columns: 1,
                  id: 'release-links',
                  title: '最近更新',
                  type: 'cards',
                },
              ],
            },
          }
        : {
            'platform-overview': {
              description: 'Conversational AI / Voice Calling / Video Calling / Interactive Live Streaming / Real-time Messaging',
              heroActions: [
                { href: '/docs/convoai/restful/get-started/quick-start', label: 'Start with AI', variant: 'default' },
                { href: '/?tab=realtime-media', label: 'Realtime & Media', variant: 'outline' },
              ],
              heroEyebrow: 'Overview',
              heroTitle: 'Agora Docs',
              sections: [
                {
                  cards: [
                    {
                      body: 'Start from realtime conversation, ASR, TTS, model integration, and interruption control.',
                      href: '/?tab=ai',
                      icon: Bot,
                      title: 'Build an AI voice app',
                    },
                    {
                      body: 'Focus on low-latency audio, channel transport, and voice interaction as the core stack.',
                      href: '/?tab=realtime-media',
                      icon: RadioTower,
                      title: 'Build realtime audio & video',
                    },
                    {
                      body: 'Connect messaging, events, webhooks, and state sync into the business flow.',
                      href: '/docs/convoai/restful/user-guides/listen-agent-events',
                      icon: MessageSquareText,
                      title: 'Integrate messaging & collaboration',
                    },
                    {
                      body: 'Enter through recording, transcription, and media processing to complete production workflows.',
                      href: '/docs/convoai/restful/user-guides/audio-modality',
                      icon: CloudCog,
                      title: 'Use media processing services',
                    },
                  ],
                  columns: 4,
                  id: 'choose-your-path',
                  title: 'Choose your path',
                  type: 'cards',
                },
                {
                  cards: [
                    {
                      body: 'ConvoAI, AIGC, realtime transcription, agent integration, and model extensions.',
                      href: '/?tab=ai',
                      icon: Sparkles,
                      title: 'AI',
                    },
                    {
                      body: 'Realtime voice, event listening, latency optimization, interruption control, and audio modalities.',
                      href: '/?tab=realtime-media',
                      icon: AudioLines,
                      title: 'Realtime & Media',
                    },
                    {
                      body: 'Compose capabilities by outcome, from support and tutoring to smart-device experiences.',
                      href: '/?tab=solutions',
                      icon: Workflow,
                      title: 'Solutions',
                    },
                    {
                      body: 'Console, auth, security, release notes, and stable entry points for engineering teams.',
                      href: '/?tab=best-practices',
                      icon: ShieldCheck,
                      title: 'Platform & practices',
                    },
                  ],
                  columns: 4,
                  id: 'browse-by-capability',
                  title: 'Browse by capability',
                  type: 'cards',
                },
                overviewMoreResourcesSection,
              ],
            },
            'choose-your-path': {
              description: 'Start from the capability domain closest to your goal, then drill down into products, APIs, and operating guidance.',
              heroEyebrow: 'Overview',
              heroTitle: 'Choose your path',
              sections: [
                {
                  cards: [
                    {
                      body: 'Start from realtime conversation, ASR, TTS, model integration, and interruption control.',
                      href: '/?tab=ai',
                      icon: Bot,
                      title: 'Build an AI voice app',
                    },
                    {
                      body: 'Focus on low-latency audio, channel transport, and voice interaction as the core stack.',
                      href: '/?tab=realtime-media',
                      icon: RadioTower,
                      title: 'Build realtime audio & video',
                    },
                    {
                      body: 'Connect messaging, events, webhooks, and state sync into the business flow.',
                      href: '/docs/convoai/restful/user-guides/listen-agent-events',
                      icon: MessageSquareText,
                      title: 'Integrate messaging & collaboration',
                    },
                    {
                      body: 'Enter through recording, transcription, and media processing to complete production workflows.',
                      href: '/docs/convoai/restful/user-guides/audio-modality',
                      icon: CloudCog,
                      title: 'Use media processing services',
                    },
                  ],
                  columns: 4,
                  id: 'path-grid',
                  title: 'Recommended paths',
                  type: 'cards',
                },
                {
                  items: [
                    {
                      body: 'If you are building an AI-native voice experience, enter through AI first, then connect APIs and production guidance.',
                      title: 'AI-first path',
                    },
                    {
                      body: 'If you already own a realtime product, start from realtime and media, then connect AI or messaging afterward.',
                      title: 'Realtime-first path',
                    },
                    {
                      body: 'If your task is workflow and control logic, prioritize events, messaging, and state sync first.',
                      title: 'Workflow-first path',
                    },
                  ],
                  id: 'path-principles',
                  title: 'How to choose',
                  type: 'triptych',
                },
              ],
            },
            'browse-by-capability': {
              description: 'Organize the platform into stable capability domains so teams can understand boundaries before opening product trees.',
              heroEyebrow: 'Overview',
              heroTitle: 'Browse by capability',
              sections: [
                {
                  cards: [
                    {
                      body: 'ConvoAI, AIGC, realtime transcription, agent integration, and model extensions.',
                      href: '/?tab=ai',
                      icon: Sparkles,
                      title: 'AI',
                    },
                    {
                      body: 'Realtime voice, event listening, latency optimization, interruption control, and audio modalities.',
                      href: '/?tab=realtime-media',
                      icon: AudioLines,
                      title: 'Realtime & Media',
                    },
                    {
                      body: 'Compose capabilities by outcome, from support and tutoring to smart-device experiences.',
                      href: '/?tab=solutions',
                      icon: Workflow,
                      title: 'Solutions',
                    },
                    {
                      body: 'Console, auth, security, release notes, and stable entry points for engineering teams.',
                      href: '/?tab=best-practices',
                      icon: ShieldCheck,
                      title: 'Platform & practices',
                    },
                  ],
                  columns: 4,
                  id: 'capability-grid',
                  title: 'Capability domains',
                  type: 'cards',
                },
              ],
            },
            'product-matrix': {
              description: 'Use a product matrix to explain the relationship between capabilities, products, and scenarios so teams know where to go next.',
              heroEyebrow: 'Platform Info',
              heroTitle: 'Product Matrix',
              sections: [
                {
                  cards: [
                    {
                      body: 'Covers voice agents, model orchestration, context handling, and realtime interaction flows.',
                      href: '/docs/convoai/restful/overview/product-overview',
                      icon: Bot,
                      title: 'AI product layer',
                    },
                    {
                      body: 'Covers audio, video, messaging, and state synchronization as the realtime foundation.',
                      href: '/?tab=realtime-media',
                      icon: RadioTower,
                      title: 'Realtime engagement layer',
                    },
                    {
                      body: 'Covers recording, transcoding, transcription, streaming IO, and delivery workflows.',
                      href: '/docs/convoai/restful/user-guides/audio-modality',
                      icon: CloudCog,
                      title: 'Media services layer',
                    },
                    {
                      body: 'Covers console, billing, security, release notes, and operational governance surfaces.',
                      href: '/?tab=best-practices',
                      icon: ShieldCheck,
                      title: 'Platform operations layer',
                    },
                  ],
                  columns: 4,
                  id: 'matrix-grid',
                  title: 'Matrix view',
                  type: 'cards',
                },
              ],
            },
            'pricing-access': {
              description: 'Treat billing, entitlement, credentials, and access control as platform entry requirements rather than scattered product details.',
              heroEyebrow: 'Platform Info',
              heroTitle: 'Pricing & Access',
              sections: [
                {
                  items: [
                    {
                      body: 'Enable the service and collect App ID plus credentials before any meaningful integration work begins.',
                      title: 'Prepare access first',
                    },
                    {
                      body: 'Understand which domains and products require separate activation so you do not get blocked mid-integration.',
                      title: 'Map entitlements by capability',
                    },
                    {
                      body: 'Separate server secrets, client identity, and temporary credentials before exposing anything externally.',
                      title: 'Split credential responsibilities',
                    },
                  ],
                  id: 'pricing-setup',
                  title: 'Ground rules',
                  type: 'triptych',
                },
                {
                  cards: [
                    {
                      body: 'Open the current billing and entitlement guidance for Conversational AI Engine.',
                      href: '/docs/convoai/restful/overview/billing',
                      icon: History,
                      title: 'ConvoAI billing',
                    },
                    {
                      body: 'Follow the enable-service page to connect App ID, credentials, and project setup in one flow.',
                      href: '/docs/convoai/restful/get-started/enable-service',
                      icon: KeyRound,
                      title: 'Enable service',
                    },
                  ],
                  columns: 2,
                  id: 'pricing-links',
                  title: 'Related docs',
                  type: 'cards',
                },
              ],
            },
            'security-compliance': {
              description: 'Organize identity, callback security, regional policy, and production boundaries into one security and compliance surface.',
              heroEyebrow: 'Platform Info',
              heroTitle: 'Security & Compliance',
              sections: [
                {
                  cards: [
                    {
                      body: 'Add baseline authentication to server integrations before you scale access to production systems.',
                      href: '/docs/convoai/restful/user-guides/http-basic-auth',
                      icon: ShieldCheck,
                      title: 'HTTP basic auth',
                    },
                    {
                      body: 'Use regional controls to narrow access range and reduce compliance risk in specific geographies.',
                      href: '/docs/convoai/restful/best-practice/geofencing',
                      icon: MapPinned,
                      title: 'Regional controls',
                    },
                    {
                      body: 'Validate webhook subscriptions, source trust, and downstream data handling before enabling callbacks.',
                      href: '/docs/convoai/restful/webhook/enable-ncs',
                      icon: Webhook,
                      title: 'Webhook security',
                    },
                  ],
                  columns: 3,
                  id: 'security-controls',
                  title: 'Key controls',
                  type: 'cards',
                },
              ],
            },
            'release-notes': {
              description: 'Release notes help teams understand platform changes, interface updates, and migration cadence, and should not hide behind product intros.',
              heroEyebrow: 'Platform Info',
              heroTitle: 'Release Notes',
              sections: [
                {
                  items: [
                    {
                      body: 'Prioritize changes that affect interface behavior, callback structure, and integration flows.',
                      title: 'Start with high-impact updates',
                    },
                    {
                      body: 'Read release notes together with best-practice updates when teams need to migrate, not just with feature news.',
                      title: 'Pair changes with migration guidance',
                    },
                    {
                      body: 'Keep product, API, and operational updates aligned so teams do not read conflicting versions of the platform.',
                      title: 'Align updates across layers',
                    },
                  ],
                  id: 'release-principles',
                  title: 'How to read releases',
                  type: 'triptych',
                },
                {
                  cards: [
                    {
                      body: 'Open the latest release and capability updates for Conversational AI Engine.',
                      href: '/docs/convoai/restful/overview/release-notes',
                      icon: History,
                      title: 'ConvoAI release notes',
                    },
                  ],
                  columns: 1,
                  id: 'release-links',
                  title: 'Latest updates',
                  type: 'cards',
                },
              ],
            },
          },
      sections: [
        {
          cards: isZh
            ? [
                {
                  body: '从实时对话、ASR、TTS、模型接入和打断控制开始，构建第一条 AI 语音链路。',
                  href: '/?tab=ai',
                  icon: Bot,
                  title: '构建 AI 语音应用',
                },
                {
                  body: '聚焦低时延音频、媒体通道与语音交互，把实时体验做成稳定底座。',
                  href: '/?tab=realtime-media',
                  icon: RadioTower,
                  title: '构建实时音视频能力',
                },
                {
                  body: '串联消息、事件、Webhook 和状态同步，让业务流程更完整。',
                  href: '/docs/convoai/restful/user-guides/listen-agent-events',
                  icon: MessageSquareText,
                  title: '集成消息与协同',
                },
                {
                  body: '从录制、转录、媒体处理与交付链路切入，补齐生产环境中的媒体服务。',
                  href: '/docs/convoai/restful/user-guides/audio-modality',
                  icon: CloudCog,
                  title: '使用媒体处理服务',
                },
              ]
            : [
                {
                  body: 'Start with realtime conversation, ASR, TTS, model integration, and interruption control.',
                  href: '/?tab=ai',
                  icon: Bot,
                  title: 'Build an AI voice app',
                },
                {
                  body: 'Focus on low-latency audio, channel transport, and voice interaction as the core stack.',
                  href: '/?tab=realtime-media',
                  icon: RadioTower,
                  title: 'Build realtime audio & video',
                },
                {
                  body: 'Connect messaging, events, webhooks, and state sync into the business flow.',
                  href: '/docs/convoai/restful/user-guides/listen-agent-events',
                  icon: MessageSquareText,
                  title: 'Integrate messaging & collaboration',
                },
                {
                  body: 'Enter through recording, transcription, and media processing to complete production workflows.',
                  href: '/docs/convoai/restful/user-guides/audio-modality',
                  icon: CloudCog,
                  title: 'Use media processing services',
                },
              ],
          columns: 4,
          id: 'choose-your-path',
          title: isZh ? '选择你的路径' : 'Choose your path',
          type: 'cards',
        },
        {
          cards: isZh
            ? [
                {
                  body: 'ConvoAI、AIGC、实时转录翻译、Agent 集成与模型扩展。',
                  href: '/?tab=ai',
                  icon: Sparkles,
                  title: 'AI',
                },
                {
                  body: '实时语音、事件监听、低时延优化、交互中断与音频模态。',
                  href: '/?tab=realtime-media',
                  icon: AudioLines,
                  title: '实时与媒体',
                },
                {
                  body: '按业务目标组合能力，从客服、陪伴、教育到智能设备接入。',
                  href: '/?tab=solutions',
                  icon: Workflow,
                  title: '场景方案',
                },
                {
                  body: '控制台、鉴权、安全、版本更新与对开发者友好的稳定入口。',
                  href: '/?tab=best-practices',
                  icon: ShieldCheck,
                  title: '平台与实践',
                },
              ]
            : [
                {
                  body: 'ConvoAI, AIGC, realtime transcription, agent integration, and model extensions.',
                  href: '/?tab=ai',
                  icon: Sparkles,
                  title: 'AI',
                },
                {
                  body: 'Realtime voice, event listening, latency optimization, interruption control, and audio modalities.',
                  href: '/?tab=realtime-media',
                  icon: AudioLines,
                  title: 'Realtime & Media',
                },
                {
                  body: 'Compose capabilities by outcome, from support and tutoring to smart-device experiences.',
                  href: '/?tab=solutions',
                  icon: Workflow,
                  title: 'Solutions',
                },
                {
                  body: 'Console, auth, security, release notes, and stable entry points for engineering teams.',
                  href: '/?tab=best-practices',
                  icon: ShieldCheck,
                  title: 'Platform & practices',
                },
              ],
          columns: 4,
          id: 'browse-by-capability',
          title: isZh ? '按能力浏览' : 'Browse by capability',
          type: 'cards',
        },
        overviewMoreResourcesSection,
      ],
      sidebar: [
        {
          items: [
            {
              active: (page ?? 'platform-overview') === 'platform-overview',
              href: '/?tab=overview&page=platform-overview',
              label: isZh ? '概览' : 'Overview',
            },
            {
              active: page === 'overview-about-agora',
              href: '/?tab=overview&page=overview-about-agora',
              label: isZh ? '了解 Agora' : 'About Agora',
            },
            {
              active: page === 'overview-start-with-ai',
              href: '/?tab=overview&page=overview-start-with-ai',
              label: isZh ? '从 AI 开始' : 'Start with AI',
            },
            {
              active: page === 'overview-community-resources',
              href: '/?tab=overview&page=overview-community-resources',
              label: isZh ? '社区资源' : 'Community resources',
            },
          ],
          title: isZh ? '快速开始' : 'Get Started',
        },
        {
          items: [
            {
              active:
                page === 'overview-ai-agents' ||
                page === 'overview-browse-by-capability',
              href: '/?tab=overview&page=overview-ai-agents',
              label: isZh ? 'AI 智能体' : 'AI Agents',
            },
            {
              active:
                page === 'overview-realtime-audio-video' ||
                page === 'overview-product-matrix' ||
                page === 'overview-media-services',
              href: '/?tab=overview&page=overview-realtime-audio-video',
              label: isZh ? '实时音视频' : 'Realtime Audio & Video',
            },
            {
              active:
                page === 'overview-media-services' ||
                page === buildOverviewEmbeddedDocPage(
                  'docs',
                  'user-guides/audio-modality',
                ),
              href: '/?tab=overview&page=overview-media-services',
              label: isZh ? '媒体服务' : 'Media Services',
            },
            {
              active:
                page === 'overview-messaging' ||
                page === buildOverviewEmbeddedDocPage(
                  'docs',
                  'user-guides/custom-data',
                ),
              href: '/?tab=overview&page=overview-messaging',
              label: isZh ? '消息' : 'Messaging',
            },
            {
              active: page === 'overview-rtm',
              href: '/?tab=overview&page=overview-rtm',
              label: isZh ? '实时消息 RTM' : 'Realtime Messaging RTM',
            },
            {
              active: page === 'overview-speech-to-text',
              href: '/?tab=overview&page=overview-speech-to-text',
              label: isZh ? '实时转录翻译' : 'Realtime Transcription & Translation',
            },
            {
              active: page === 'overview-rtsa',
              href: '/?tab=overview&page=overview-rtsa',
              label: isZh ? '媒体流加速 RTSA' : 'Realtime Streaming Acceleration RTSA',
            },
            {
              active: page === 'overview-rtc-server-sdk',
              href: '/?tab=overview&page=overview-rtc-server-sdk',
              label: isZh ? 'RTC 服务端 SDK' : 'RTC Server SDK',
            },
            {
              active: page === 'overview-fusion-cdn',
              href: '/?tab=overview&page=overview-fusion-cdn',
              label: isZh ? '融合 CDN 直播' : 'Fusion CDN Live Streaming',
            },
            {
              active: page === 'overview-whiteboard',
              href: '/?tab=overview&page=overview-whiteboard',
              label: isZh ? '互动白板' : 'Interactive Whiteboard',
            },
          ],
          title: isZh ? '能力' : 'Capabilities',
        },
        {
          items: [
            {
              active: page === 'overview-general-account',
              href: '/?tab=overview&page=overview-general-account',
              label: isZh ? '账户' : 'Account',
            },
            {
              active: page === 'overview-general-projects',
              href: '/?tab=overview&page=overview-general-projects',
              label: isZh ? '项目' : 'Projects',
            },
            {
              active: page === 'overview-general-members-roles',
              href: '/?tab=overview&page=overview-general-members-roles',
              label: isZh ? '成员与角色' : 'Members and roles',
            },
            {
              active: page === 'overview-pricing-access',
              href: '/?tab=overview&page=overview-pricing-access',
              label: isZh ? '计费' : 'Billing',
            },
            {
              active: page === 'overview-general-usage-analytics',
              href: '/?tab=overview&page=overview-general-usage-analytics',
              label: isZh ? '用量分析' : 'Usage analytics',
            },
            {
              active: page === 'overview-general-security-privacy',
              href: '/?tab=overview&page=overview-general-security-privacy',
              label: isZh ? '隐私和安全' : 'Security and privacy',
            },
            {
              active: page === 'overview-general-support',
              href: '/?tab=overview&page=overview-general-support',
              label: isZh ? '客户支持' : 'Support',
            },
          ],
          title: isZh ? '管理' : 'Administration',
        },
      ],
    },
    'get-started': {
      description: isZh
        ? '把控制台开通、凭证获取、首个示例和服务端 SDK 入口串成一条第一次成功的最短路径。'
        : 'Turn service enablement, credentials, first demos, and server SDK access into the shortest path to first success.',
      heroActions: commonActions,
      heroEyebrow: isZh ? '快速开始' : 'Get Started',
      heroTitle: isZh
        ? '从凭证到第一条实时对话链路，尽快跑通。'
        : 'Go from credentials to your first realtime conversation loop.',
      label: labels.getStarted,
      sections: [
        {
          cards: isZh
            ? [
                {
                  body: '在控制台开通服务，准备 App ID、客户密钥和基础环境。',
                  href: '/docs/convoai/restful/get-started/enable-service',
                  icon: KeyRound,
                  title: '开通服务',
                },
                {
                  body: '用 RESTful API 创建智能体、加入频道并开始实时语音互动。',
                  href: '/docs/convoai/restful/get-started/quick-start',
                  icon: MicVocal,
                  title: 'RESTful 快速开始',
                },
                {
                  body: '如果你先从后端切入，优先从 Go 样例缩短第一个调用闭环。',
                  href: '/docs/convoai/restful/get-started/quick-start-go',
                  icon: Cable,
                  title: 'Go 服务端快速开始',
                },
                {
                  body: '对 Java 后端团队，保留一条更贴近现有工程栈的接入入口。',
                  href: '/docs/convoai/restful/get-started/quick-start-java',
                  icon: Wrench,
                  title: 'Java 服务端快速开始',
                },
              ]
            : [
                {
                  body: 'Enable the service in Console and prepare App ID plus credentials.',
                  href: '/docs/convoai/restful/get-started/enable-service',
                  icon: KeyRound,
                  title: 'Enable service',
                },
                {
                  body: 'Create the agent, join the channel, and start the realtime voice loop over RESTful APIs.',
                  href: '/docs/convoai/restful/get-started/quick-start',
                  icon: MicVocal,
                  title: 'RESTful quickstart',
                },
                {
                  body: 'If you begin from the backend, use the Go sample to shorten the first integration loop.',
                  href: '/docs/convoai/restful/get-started/quick-start-go',
                  icon: Cable,
                  title: 'Go server quickstart',
                },
                {
                  body: 'Keep a Java-friendly path for teams integrating from existing enterprise stacks.',
                  href: '/docs/convoai/restful/get-started/quick-start-java',
                  icon: Wrench,
                  title: 'Java server quickstart',
                },
              ],
          columns: 4,
          id: 'starting-paths',
          title: isZh ? '选择起步路径' : 'Choose a starting path',
          type: 'cards',
        },
        {
          items: isZh
            ? [
                {
                  body: '先决定你要从控制台、RESTful 还是服务端 SDK 起步，不要一开始就把所有链路混在一起。',
                  title: '先确定接入形态',
                },
                {
                  body: '把鉴权、错误码、回调事件和日志观察放进第一次联调，而不是等到出问题再补。',
                  title: '把验证步骤前置',
                },
                {
                  body: '接入成功之后，优先进入模型扩展、低时延优化和生产级配置，而不是继续堆更多示例。',
                  title: '尽快转向生产问题',
                },
              ]
            : [
                {
                  body: 'Choose whether to start from Console, RESTful APIs, or server SDKs instead of mixing all paths at once.',
                  title: 'Pick the integration shape first',
                },
                {
                  body: 'Bring auth, response codes, callback events, and logging into the first integration pass.',
                  title: 'Validate early',
                },
                {
                  body: 'After the first success, shift quickly into model extensions, latency work, and production settings.',
                  title: 'Move to production concerns fast',
                },
              ],
          id: 'first-build-checks',
          title: isZh ? '首次接入检查点' : 'First build checks',
          type: 'triptych',
        },
        {
          cards: isZh
            ? [
                {
                  body: '在服务端链路里补齐基础鉴权，减少首次联调中的安全问题。',
                  href: '/docs/convoai/restful/user-guides/http-basic-auth',
                  icon: ShieldCheck,
                  title: '鉴权与安全',
                },
                {
                  body: '如果需要接收状态变化和异步结果，尽早把事件监听链路接上。',
                  href: '/docs/convoai/restful/user-guides/listen-agent-events',
                  icon: Webhook,
                  title: '事件与回调',
                },
                {
                  body: '出问题时直接从响应码、限制和常见状态查询切入。',
                  href: '/?tab=api-reference',
                  icon: Braces,
                  title: '接口参考',
                },
              ]
            : [
                {
                  body: 'Add baseline auth early so the first server integration loop is safe enough to scale.',
                  href: '/docs/convoai/restful/user-guides/http-basic-auth',
                  icon: ShieldCheck,
                  title: 'Auth & security',
                },
                {
                  body: 'If you need async status and callbacks, wire events into the first pass instead of later.',
                  href: '/docs/convoai/restful/user-guides/listen-agent-events',
                  icon: Webhook,
                  title: 'Events & callbacks',
                },
                {
                  body: 'When the flow fails, jump directly into response codes, limits, and status endpoints.',
                  href: '/?tab=api-reference',
                  icon: Braces,
                  title: 'Reference surface',
                },
              ],
          columns: 3,
          id: 'next-steps',
          title: isZh ? '下一步' : 'Next steps',
          type: 'cards',
        },
      ],
      sidebar: [
        {
          items: [
            { active: true, href: '#hero', label: isZh ? '从这里开始' : 'Start Here' },
            { href: '#starting-paths', label: isZh ? '选择起步路径' : 'Choose your path' },
            { href: '#first-build-checks', label: isZh ? '首次接入检查点' : 'First build checks' },
          ],
          title: isZh ? '开始接入' : 'Get Started',
        },
        {
          items: [
            { href: '/docs/convoai/restful/get-started/enable-service', label: isZh ? '环境与权限' : 'Environment & access' },
            { href: '/docs/convoai/restful/get-started/quick-start-go', label: isZh ? '服务端 SDK' : 'Server SDK entry' },
            { href: '/?tab=best-practices', label: isZh ? '进入最佳实践' : 'Move to best practices' },
          ],
          title: isZh ? '继续构建' : 'Build Next',
        },
        {
          items: exploreMore,
          title: labels.exploreMore,
        },
      ],
    },
    ai: {
      description: isZh
        ? '围绕对话式 AI 引擎组织能力，而不是把模型、语音、上下文和中断控制拆散在文档树里。'
        : 'Organize the AI surface around the conversational engine instead of scattering models, voice, context, and interruption control across the tree.',
      heroActions: commonActions,
      heroEyebrow: labels.ai,
      heroTitle: isZh
        ? '把模型、语音与上下文编排成完整的对话式 AI。'
        : 'Turn models, voice, and context into a complete conversational AI loop.',
      label: labels.ai,
      sections: [
        {
          cards: isZh
            ? [
                {
                  body: '先理解引擎边界、实时链路与适用场景。',
                  href: '/docs/convoai/restful/overview/product-overview',
                  icon: Sparkles,
                  title: 'ConvoAI 产品概览',
                },
                {
                  body: '把自定义大模型接入到语音链路里，而不是局限于默认模型。',
                  href: '/docs/convoai/restful/user-guides/custom-llm',
                  icon: WandSparkles,
                  title: '接入自定义大模型',
                },
                {
                  body: '让智能体在多轮对话中保留短期上下文和业务信息。',
                  href: '/docs/convoai/restful/user-guides/short-term-memory',
                  icon: Library,
                  title: '短期记忆与上下文',
                },
                {
                  body: '把文本、音频和多模态消息纳入统一输入输出模型。',
                  href: '/docs/convoai/restful/user-guides/send-multimodal-message',
                  icon: Workflow,
                  title: '多模态消息',
                },
              ]
            : [
                {
                  body: 'Understand the engine boundary, realtime path, and target scenarios first.',
                  href: '/docs/convoai/restful/overview/product-overview',
                  icon: Sparkles,
                  title: 'ConvoAI overview',
                },
                {
                  body: 'Bring your own LLM into the voice path instead of staying inside defaults.',
                  href: '/docs/convoai/restful/user-guides/custom-llm',
                  icon: WandSparkles,
                  title: 'Custom LLM integration',
                },
                {
                  body: 'Keep short-term context and business data alive across multi-turn conversation.',
                  href: '/docs/convoai/restful/user-guides/short-term-memory',
                  icon: Library,
                  title: 'Memory & context',
                },
                {
                  body: 'Unify text, audio, and multimodal IO inside a single interaction model.',
                  href: '/docs/convoai/restful/user-guides/send-multimodal-message',
                  icon: Workflow,
                  title: 'Multimodal messages',
                },
              ],
          columns: 4,
          id: 'core-ai-capabilities',
          title: isZh ? '核心 AI 能力' : 'Core AI capabilities',
          type: 'cards',
        },
        {
          items: isZh
            ? [
                {
                  body: '音频模态、实时字幕和中断控制共同决定最终的语音体验质量。',
                  title: '语音交互不是单点能力',
                },
                {
                  body: '模型接入、上下文记忆和自定义数据决定智能体是否真的能贴近你的业务。',
                  title: '模型编排决定业务深度',
                },
                {
                  body: '如果要进入生产环境，事件监听、回调和观测能力必须在 AI 页面就露出来。',
                  title: 'AI 页面要面向生产',
                },
              ]
            : [
                {
                  body: 'Audio modality, realtime subtitles, and interruption control shape the actual quality of the voice experience.',
                  title: 'Voice interaction is a system',
                },
                {
                  body: 'Model orchestration, short-term memory, and custom data determine whether the agent fits the business.',
                  title: 'Model composition drives depth',
                },
                {
                  body: 'If the flow is heading to production, events, callbacks, and observability must already be visible from the AI surface.',
                  title: 'AI docs should be production-aware',
                },
              ],
          id: 'ai-design-principles',
          title: isZh ? '设计原则' : 'Design principles',
          type: 'triptych',
        },
        {
          cards: isZh
            ? [
                {
                  body: '通过音频模态、实时字幕与中断控制，构建像打电话一样自然的交互。',
                  href: '/docs/convoai/restful/user-guides/audio-modality',
                  icon: MicVocal,
                  title: '语音与多模态',
                },
                {
                  body: '用自定义数据、事件与回调把 AI 从 demo 推向业务流程。',
                  href: '/docs/convoai/restful/user-guides/custom-data',
                  icon: Webhook,
                  title: '数据与事件',
                },
                {
                  body: '进入接口操作、响应码和事件模型，完成真正可执行的集成。',
                  href: '/?tab=api-reference',
                  icon: Braces,
                  title: '进入 API 参考',
                },
              ]
            : [
                {
                  body: 'Use audio modality, realtime subtitles, and interruption control to make the interaction feel conversational.',
                  href: '/docs/convoai/restful/user-guides/audio-modality',
                  icon: MicVocal,
                  title: 'Voice & multimodal',
                },
                {
                  body: 'Bring custom data, events, and callbacks into the flow to move beyond the demo.',
                  href: '/docs/convoai/restful/user-guides/custom-data',
                  icon: Webhook,
                  title: 'Data & events',
                },
                {
                  body: 'Enter operations, response codes, and event models to complete the executable surface.',
                  href: '/?tab=api-reference',
                  icon: Braces,
                  title: 'Jump to API reference',
                },
              ],
          columns: 3,
          id: 'ai-entry-points',
          title: isZh ? '进入具体文档' : 'Entry points',
          type: 'cards',
        },
      ],
      sidebar: [
        {
          items: [
            {
              active: (page ?? 'ai-overview') === 'ai-overview' || page === 'landing-page',
              href: '/?tab=ai&page=ai-overview',
              label: isZh ? '概览' : 'Overview',
            },
            {
              active:
                page === 'ai-start-with-agent-studio' ||
                page === buildAiEmbeddedDocPage('docs', 'get-started/quick-start') ||
                page === buildAiEmbeddedDocPage('docs', 'get-started/enable-service') ||
                page === 'ai-choose-your-integration-path',
              children: [
                {
                  active: page === 'ai-start-with-agent-studio',
                  href: '/?tab=ai&page=ai-start-with-agent-studio',
                  label: isZh ? '从 Agent Studio 开始' : 'Start with Agent Studio',
                  muted: true,
                },
                {
                  active: page === buildAiEmbeddedDocPage('docs', 'get-started/quick-start'),
                  href: `/?tab=ai&page=${buildAiEmbeddedDocPage('docs', 'get-started/quick-start')}`,
                  label: isZh ? '语音 AI 快速开始' : 'Voice AI quickstart',
                  muted: true,
                },
                {
                  active: page === buildAiEmbeddedDocPage('docs', 'get-started/enable-service'),
                  href: `/?tab=ai&page=${buildAiEmbeddedDocPage('docs', 'get-started/enable-service')}`,
                  label: isZh ? '准备项目和凭证' : 'Set up project and credentials',
                  muted: true,
                },
                {
                  active: page === 'ai-choose-your-integration-path',
                  href: '/?tab=ai&page=ai-choose-your-integration-path',
                  label: isZh ? '选择你的接入路径' : 'Choose your integration path',
                  muted: true,
                },
              ],
              expanded:
                page === 'ai-start-with-agent-studio' ||
                page === buildAiEmbeddedDocPage('docs', 'get-started/quick-start') ||
                page === buildAiEmbeddedDocPage('docs', 'get-started/enable-service') ||
                page === 'ai-choose-your-integration-path',
              href: '/?tab=ai&page=ai-start-with-agent-studio',
              label: isZh ? '快速开始' : 'Quick start',
              section: true,
            },
          ],
          title: isZh ? '快速开始' : 'Get Started',
        },
        {
          items: [
            {
              href: `/?tab=ai&page=${buildAiEmbeddedDocPage('docs', 'overview/concepts')}`,
              label: isZh ? '智能体如何工作' : 'How agents work',
            },
            { href: '/?tab=ai&page=ai-agents-and-realtime-channels', label: isZh ? '智能体与实时频道' : 'Agents and realtime channels' },
            { href: '/?tab=ai&page=ai-agent-lifecycle', label: isZh ? '智能体生命周期' : 'Agent lifecycle' },
            { href: '/?tab=ai&page=ai-models-voice-and-context', label: isZh ? '模型、语音与上下文' : 'Models, voice, and context' },
            {
              href: `/?tab=ai&page=${buildAiEmbeddedDocPage('docs', 'webhook/ncs-events')}`,
              label: isZh ? '事件与 Webhook' : 'Events and webhooks',
            },
          ],
          title: isZh ? '核心概念' : 'Core Concepts',
        },
        {
          items: [
            { href: `/?tab=ai&page=${buildAiEmbeddedDocPage('docs', 'operations/start-agent')}`, label: isZh ? '创建并启动智能体' : 'Create and start an agent' },
            { href: '/?tab=ai&page=ai-configure-presets', label: isZh ? '配置预设' : 'Configure presets' },
            { href: `/?tab=ai&page=${buildAiEmbeddedDocPage('docs', 'user-guides/custom-llm')}`, label: isZh ? '配置 LLM' : 'Configure LLM' },
            { href: '/?tab=ai&page=ai-configure-asr-and-tts', label: isZh ? '配置 ASR 和 TTS' : 'Configure ASR and TTS' },
            { href: `/?tab=ai&page=${buildAiEmbeddedDocPage('docs', 'user-guides/interrupt-agent')}`, label: isZh ? '处理中断' : 'Handle interruption' },
            { href: `/?tab=ai&page=${buildAiEmbeddedDocPage('docs', 'user-guides/short-term-memory')}`, label: isZh ? '管理记忆与上下文' : 'Manage memory and context' },
            { href: `/?tab=ai&page=${buildAiEmbeddedDocPage('docs', 'operations/agent-speak')}`, label: isZh ? '发送自定义消息' : 'Send custom messages' },
            { href: `/?tab=ai&page=${buildAiEmbeddedDocPage('docs', 'operations/agent-think')}`, label: isZh ? '发送自定义指令' : 'Send custom commands' },
          ],
          title: isZh ? '构建' : 'Build',
        },
        {
          items: [
            { href: '/?tab=ai&page=ai-web-client', label: isZh ? 'Web 客户端' : 'Web client' },
            { href: '/?tab=ai&page=ai-mobile-client', label: isZh ? '移动端客户端' : 'Mobile client' },
            { href: `/?tab=ai&page=${buildAiEmbeddedDocPage('docs', 'user-guides/audio-modality')}`, label: isZh ? '实时音频' : 'Realtime audio' },
            { href: `/?tab=ai&page=${buildAiEmbeddedDocPage('docs', 'user-guides/realtime-sub')}`, label: isZh ? '转写与字幕' : 'Transcripts and subtitles' },
            { href: `/?tab=ai&page=${buildAiEmbeddedDocPage('docs', 'user-guides/custom-data')}`, label: isZh ? '业务数据' : 'Business data' },
            { href: '/?tab=ai&page=ai-device-ai', label: isZh ? '设备 AI' : 'Device AI' },
          ],
          title: isZh ? '接入' : 'Connect',
        },
        {
          items: [
            { href: '/?tab=ai&page=ai-test-an-agent', label: isZh ? '测试智能体' : 'Test an agent' },
            { href: `/?tab=ai&page=${buildAiEmbeddedDocPage('docs', 'operations/query-agent-status')}`, label: isZh ? '监控状态' : 'Monitor status' },
            { href: `/?tab=ai&page=${buildAiEmbeddedDocPage('docs', 'operations/get-turns')}`, label: isZh ? '对话轮次' : 'Conversation turns' },
            { href: `/?tab=ai&page=${buildAiEmbeddedDocPage('docs', 'api/response-code')}`, label: isZh ? '错误处理' : 'Error handling' },
            { href: `/?tab=ai&page=${buildAiEmbeddedDocPage('docs', 'user-guides/http-basic-auth')}`, label: isZh ? '鉴权与 Token' : 'Authentication and tokens' },
            { href: '/?tab=ai&page=ai-production-checklist', label: isZh ? '生产检查清单' : 'Production checklist' },
          ],
          title: isZh ? '运维' : 'Operate',
        },
        {
          items: [
            { href: '/?tab=api-reference', label: isZh ? 'REST API' : 'REST API' },
            { href: `/?tab=ai&page=${buildAiEmbeddedDocPage('docs', 'get-started/quick-start-go')}`, label: isZh ? 'Go SDK' : 'Go SDK' },
            { href: `/?tab=ai&page=${buildAiEmbeddedDocPage('docs', 'get-started/quick-start-java')}`, label: isZh ? 'Java SDK' : 'Java SDK' },
            { href: '/?tab=ai&page=ai-client-component-api', label: isZh ? '客户端组件 API' : 'Client component API' },
            { href: `/?tab=ai&page=${buildAiEmbeddedDocPage('docs', 'webhook/ncs-events')}`, label: isZh ? 'Webhook 事件' : 'Webhook events' },
            { href: `/?tab=ai&page=${buildAiEmbeddedDocPage('docs', 'api/response-code')}`, label: isZh ? '状态码' : 'Status codes' },
          ],
          title: isZh ? '参考' : 'Reference',
        },
      ],
    },
    'realtime-media': {
      description: isZh
        ? '这里承接实时互动链路里与音频、事件、媒体编排最相关的能力，让用户理解 AI 之外的底层实时体验。'
        : 'This section captures the audio, event, and media surfaces most relevant to the realtime interaction path beneath the AI layer.',
      heroActions: commonActions,
      heroEyebrow: labels.realtime,
      heroTitle: isZh
        ? '把实时语音、媒体通道和交互控制连成稳定底座。'
        : 'Connect realtime voice, media transport, and interaction control into one stable foundation.',
      label: labels.realtime,
      sections: [
        {
          cards: isZh
            ? [
                {
                  body: '决定用户与智能体共享怎样的音频链路与媒体能力。',
                  href: '/docs/convoai/restful/user-guides/audio-modality',
                  icon: AudioLines,
                  title: '音频模态',
                },
                {
                  body: '把字幕与语音链路接起来，作为实时互动中的文本侧反馈。',
                  href: '/docs/convoai/restful/user-guides/realtime-sub',
                  icon: MessageSquareText,
                  title: '实时字幕',
                },
                {
                  body: '支持中途打断、重新接管发言权和更自然的 turn-taking。',
                  href: '/docs/convoai/restful/user-guides/interrupt-agent',
                  icon: MicVocal,
                  title: '打断与轮次控制',
                },
                {
                  body: '通过事件监听把实时状态暴露给业务层和前端界面。',
                  href: '/docs/convoai/restful/user-guides/listen-agent-events',
                  icon: RadioTower,
                  title: '实时事件监听',
                },
              ]
            : [
                {
                  body: 'Define the audio path and voice surface shared by the user and the agent.',
                  href: '/docs/convoai/restful/user-guides/audio-modality',
                  icon: AudioLines,
                  title: 'Audio modality',
                },
                {
                  body: 'Connect subtitles into the voice path as the textual side-channel of realtime interaction.',
                  href: '/docs/convoai/restful/user-guides/realtime-sub',
                  icon: MessageSquareText,
                  title: 'Realtime subtitles',
                },
                {
                  body: 'Support interruption, turn re-entry, and a more natural form of turn-taking.',
                  href: '/docs/convoai/restful/user-guides/interrupt-agent',
                  icon: MicVocal,
                  title: 'Interruptions & turn-taking',
                },
                {
                  body: 'Expose realtime status to product logic and the client UI through event subscriptions.',
                  href: '/docs/convoai/restful/user-guides/listen-agent-events',
                  icon: RadioTower,
                  title: 'Realtime event listening',
                },
              ],
          columns: 4,
          id: 'realtime-surfaces',
          title: isZh ? '实时能力面' : 'Realtime surfaces',
          type: 'cards',
        },
        {
          cards: isZh
            ? [
                {
                  body: '调低端到端语音时延，让 AI 不像一段延迟播放的音频文件。',
                  href: '/docs/convoai/restful/best-practice/opt-latency',
                  icon: Gauge,
                  title: '低时延优化',
                },
                {
                  body: '结合地理围栏和区域访问控制，减少跨区域链路中的风险与不确定性。',
                  href: '/docs/convoai/restful/best-practice/geofencing',
                  icon: MapPinned,
                  title: '区域访问控制',
                },
                {
                  body: '在生产环境中通过回调和事件观测实时链路是否健康。',
                  href: '/docs/convoai/restful/webhook/ncs-events',
                  icon: Webhook,
                  title: '回调与观测',
                },
              ]
            : [
                {
                  body: 'Reduce end-to-end latency so the agent feels live instead of like delayed playback.',
                  href: '/docs/convoai/restful/best-practice/opt-latency',
                  icon: Gauge,
                  title: 'Latency optimization',
                },
                {
                  body: 'Use geofencing and regional controls to make cross-region deployments safer and more predictable.',
                  href: '/docs/convoai/restful/best-practice/geofencing',
                  icon: MapPinned,
                  title: 'Regional controls',
                },
                {
                  body: 'Observe the realtime path with callbacks and event subscriptions in production.',
                  href: '/docs/convoai/restful/webhook/ncs-events',
                  icon: Webhook,
                  title: 'Callbacks & observability',
                },
              ],
          columns: 3,
          id: 'media-operations',
          title: isZh ? '媒体与运维' : 'Media & operations',
          type: 'cards',
        },
      ],
      sidebar: [
        {
          items: [
            {
              active: (page ?? 'rm-overview') === 'rm-overview',
              href: '/?tab=realtime-media&page=rm-overview',
              label: isZh ? '概览' : 'Overview',
            },
            {
              active:
                page === 'rm-choose-your-product-path' ||
                page === 'rm-setup-service-and-credentials',
              children: [
                {
                  active: page === 'rm-choose-your-product-path',
                  href: '/?tab=realtime-media&page=rm-choose-your-product-path',
                  label: isZh ? '选择你的产品路径' : 'Choose your product path',
                  muted: true,
                },
                {
                  active: page === 'rm-setup-service-and-credentials',
                  href: '/?tab=realtime-media&page=rm-setup-service-and-credentials',
                  label: isZh ? '开通服务与准备凭证' : 'Set up service and credentials',
                  muted: true,
                },
              ],
              expanded:
                page === 'rm-choose-your-product-path' ||
                page === 'rm-setup-service-and-credentials',
              href: '/?tab=realtime-media&page=rm-choose-your-product-path',
              label: isZh ? '快速开始' : 'Quick start',
              section: true,
            },
          ],
          title: isZh ? '快速开始' : 'Quick start',
        },
        {
          items: [
            {
              active: page === 'rm-rtc',
              href: '/?tab=realtime-media&page=rm-rtc',
              label: isZh ? '实时互动 RTC' : 'RTC',
            },
            {
              active: page === 'rm-rtm',
              href: '/?tab=realtime-media&page=rm-rtm',
              label: isZh ? '实时消息 RTM' : 'RTM',
            },
            {
              active: page === 'rm-im',
              href: '/?tab=realtime-media&page=rm-im',
              label: isZh ? '即时通讯 IM' : 'Instant Messaging IM',
            },
            {
              active: page === 'rm-speech-to-text',
              href: '/?tab=realtime-media&page=rm-speech-to-text',
              label: isZh ? '实时转录翻译' : 'Realtime Transcription',
            },
            {
              active: page === 'rm-rtsa',
              href: '/?tab=realtime-media&page=rm-rtsa',
              label: isZh ? '媒体流加速 RTSA' : 'RTSA',
            },
          ],
          title: isZh ? '基础实时能力' : 'Foundational realtime capabilities',
        },
        {
          items: [
            {
              active: page === 'rm-whiteboard',
              href: '/?tab=realtime-media&page=rm-whiteboard',
              label: isZh ? '互动白板' : 'Interactive Whiteboard',
            },
            {
              active: page === 'rm-meeting',
              href: '/?tab=realtime-media&page=rm-meeting',
              label: isZh ? '灵动会议' : 'Flexible Meeting',
            },
            {
              active: page === 'rm-live-interaction',
              href: '/?tab=realtime-media&page=rm-live-interaction',
              label: isZh ? '直播互动' : 'Live interaction',
            },
            {
              active: page === 'rm-voip-call',
              href: '/?tab=realtime-media&page=rm-voip-call',
              label: isZh ? '微呼叫' : 'Micro Calling',
            },
          ],
          title: isZh ? '协作与互动' : 'Collaboration and interaction',
        },
        {
          items: [
            {
              active: page === 'rm-rtc-server-sdk',
              href: '/?tab=realtime-media&page=rm-rtc-server-sdk',
              label: isZh ? 'RTC 服务端 SDK' : 'RTC Server SDK',
            },
            {
              active: page === 'rm-sdk-extensions',
              href: '/?tab=realtime-media&page=rm-sdk-extensions',
              label: isZh ? 'SDK 拓展插件' : 'SDK extension plugins',
            },
            {
              active: page === 'rm-marketplace',
              href: '/?tab=realtime-media&page=rm-marketplace',
              label: isZh ? '云市场' : 'Marketplace',
            },
          ],
          title: isZh ? '服务端与扩展' : 'Server-side and extensions',
        },
        {
          items: [
            {
              active: page === 'rm-console',
              href: '/?tab=realtime-media&page=rm-console',
              label: isZh ? '控制台' : 'Console',
            },
            {
              active: page === 'rm-analytics',
              href: '/?tab=realtime-media&page=rm-analytics',
              label: isZh ? '水晶球' : 'Analytics',
            },
            {
              active: page === 'rm-status-page',
              href: '/?tab=realtime-media&page=rm-status-page',
              label: isZh ? 'Status Page' : 'Status Page',
            },
            {
              active: page === 'rm-billing',
              href: '/?tab=realtime-media&page=rm-billing',
              label: isZh ? '计费' : 'Billing',
            },
            {
              active: page === 'rm-security',
              href: '/?tab=realtime-media&page=rm-security',
              label: isZh ? '安全' : 'Security',
            },
          ],
          title: isZh ? '运维治理' : 'Governance and operations',
        },
        {
          items: [
            {
              active: page === 'rm-smart-devices',
              href: '/?tab=realtime-media&page=rm-smart-devices',
              label: isZh ? '智能设备' : 'Smart devices',
            },
            {
              active: page === 'rm-teleoperation',
              href: '/?tab=realtime-media&page=rm-teleoperation',
              label: isZh ? '远程操控' : 'Teleoperation',
            },
            {
              active: page === 'rm-education-classrooms',
              href: '/?tab=realtime-media&page=rm-education-classrooms',
              label: isZh ? '教育课堂系列' : 'Education classroom family',
            },
          ],
          title: isZh ? '设备与行业场景' : 'Device and industry scenarios',
        },
      ],
    },
    solutions: {
      description: isZh
        ? '把底层能力重新按业务目标讲给用户听，而不是让他们先理解所有产品边界。'
        : 'Reframe the same building blocks around business outcomes instead of requiring product-boundary knowledge up front.',
      heroActions: commonActions,
      heroEyebrow: labels.solutions,
      heroTitle: isZh
        ? '从客服、陪伴、教育到设备接入，按场景组织能力。'
        : 'Start from support, companionship, tutoring, and devices instead of raw infrastructure.',
      label: labels.solutions,
      sections: [
        {
          cards: isZh
            ? [
                {
                  body: '让智能体理解业务上下文、调取自定义知识，并通过语音完成客服流程。',
                  href: '/docs/convoai/restful/user-guides/custom-data',
                  icon: Bot,
                  title: '智能客服',
                },
                {
                  body: '用短期记忆、多轮对话和打断控制提升陪伴式语音体验。',
                  href: '/docs/convoai/restful/user-guides/short-term-memory',
                  icon: Sparkles,
                  title: '陪伴与聊天',
                },
                {
                  body: '把实时字幕和语音交互结合起来，适合练习、提示和学习过程反馈。',
                  href: '/docs/convoai/restful/user-guides/realtime-sub',
                  icon: MessageSquareText,
                  title: '教育与练习',
                },
                {
                  body: '结合音频模态和服务端接入路径，适合智能硬件和语音终端形态。',
                  href: '/docs/convoai/restful/user-guides/audio-modality',
                  icon: RadioTower,
                  title: '智能设备',
                },
              ]
            : [
                {
                  body: 'Let the agent understand business context, retrieve custom knowledge, and complete support flows over voice.',
                  href: '/docs/convoai/restful/user-guides/custom-data',
                  icon: Bot,
                  title: 'Customer support',
                },
                {
                  body: 'Use short-term memory, multi-turn conversation, and interruption control for companion-style experiences.',
                  href: '/docs/convoai/restful/user-guides/short-term-memory',
                  icon: Sparkles,
                  title: 'Companionship',
                },
                {
                  body: 'Combine realtime subtitles with voice interaction for tutoring, prompting, and live feedback.',
                  href: '/docs/convoai/restful/user-guides/realtime-sub',
                  icon: MessageSquareText,
                  title: 'Learning experiences',
                },
                {
                  body: 'Blend audio modality and server-side integration paths for smart devices and terminal products.',
                  href: '/docs/convoai/restful/user-guides/audio-modality',
                  icon: RadioTower,
                  title: 'Smart devices',
                },
              ],
          columns: 4,
          id: 'solution-patterns',
          title: isZh ? '场景模式' : 'Solution patterns',
          type: 'cards',
        },
        {
          items: isZh
            ? [
                {
                  body: '同一套产品能力可以重组为完全不同的场景，只要首页先以用户目标而不是产品目录为起点。',
                  title: '先按目标，而不是按产品理解',
                },
                {
                  body: '解决方案页最适合承接“适用场景、关键能力、推荐起步路径”三类信息。',
                  title: '解决方案页要承担选择作用',
                },
                {
                  body: '一旦用户选定方向，就应该顺滑下钻到快速开始、能力页和接口页。',
                  title: '场景页要能向下分发',
                },
              ]
            : [
                {
                  body: 'The same capabilities can be reshaped into very different solutions as long as the homepage starts from user goals.',
                  title: 'Start from goals, not products',
                },
                {
                  body: 'Solution pages work best when they carry use cases, key capabilities, and a recommended starting path.',
                  title: 'Solutions should support selection',
                },
                {
                  body: 'Once the direction is clear, the page should route smoothly into quickstarts, capabilities, and APIs.',
                  title: 'Solution pages should distribute downward',
                },
              ],
          id: 'solution-principles',
          title: isZh ? '场景页原则' : 'How solutions should work',
          type: 'triptych',
        },
      ],
      sidebar: [
        {
          items: [
            { active: true, href: '#hero', label: isZh ? '场景总览' : 'Solutions Overview' },
            { href: '#solution-patterns', label: isZh ? '场景模式' : 'Solution patterns' },
            { href: '#solution-principles', label: isZh ? '场景页原则' : 'Solution principles' },
          ],
          title: labels.solutions,
        },
        {
          items: [
            { href: '/docs/convoai/restful/user-guides/custom-data', label: isZh ? '客服与知识库' : 'Support & knowledge' },
            { href: '/docs/convoai/restful/user-guides/short-term-memory', label: isZh ? '陪伴与记忆' : 'Companionship & memory' },
            { href: '/docs/convoai/restful/user-guides/audio-modality', label: isZh ? '设备与音频接入' : 'Devices & voice' },
          ],
          title: isZh ? '推荐场景入口' : 'Recommended paths',
        },
        {
          items: exploreMore,
          title: labels.exploreMore,
        },
      ],
    },
    'api-reference': {
      description: isZh
        ? '当你已经知道要做什么，就不再需要解释，而需要直接可靠的接口、事件、错误码和限制入口。'
        : 'Once you know what you need to build, the value shifts from explanation to reliable access to operations, events, response codes, and limits.',
      heroActions: isZh
        ? [
            { href: '/docs/convoai/restful/operations/start-agent', label: '查看创建智能体 API', variant: 'default' },
            { href: '/docs/convoai/restful/api/response-code', label: '查看响应码', variant: 'outline' },
          ]
        : [
            { href: '/docs/convoai/restful/operations/start-agent', label: 'Open start-agent API', variant: 'default' },
            { href: '/docs/convoai/restful/api/response-code', label: 'Open response codes', variant: 'outline' },
          ],
      heroEyebrow: labels.api,
      heroTitle: isZh
        ? '接口、事件与限制应该永远可以直达。'
        : 'Operations, events, and limits should always be one hop away.',
      label: labels.api,
      sections: [
        {
          cards: isZh
            ? [
                {
                  body: '围绕智能体生命周期完成创建、更新、停止和状态查询。',
                  href: '/docs/convoai/restful/operations/start-agent',
                  icon: Bot,
                  title: '生命周期操作',
                },
                {
                  body: '控制发声、打断和思考等对话期行为。',
                  href: '/docs/convoai/restful/operations/agent-speak',
                  icon: MicVocal,
                  title: '对话控制',
                },
                {
                  body: '读取历史、轮次、事件和异步结果，补齐业务追踪链路。',
                  href: '/docs/convoai/restful/operations/get-history',
                  icon: History,
                  title: '历史与观测',
                },
                {
                  body: '通过回调和 NCS 事件把状态同步到业务系统。',
                  href: '/docs/convoai/restful/webhook/ncs-events',
                  icon: Webhook,
                  title: 'Webhook 与事件',
                },
              ]
            : [
                {
                  body: 'Handle creation, updates, stop operations, and status queries across the agent lifecycle.',
                  href: '/docs/convoai/restful/operations/start-agent',
                  icon: Bot,
                  title: 'Lifecycle operations',
                },
                {
                  body: 'Control speech, interruption, and thinking behavior inside the conversation loop.',
                  href: '/docs/convoai/restful/operations/agent-speak',
                  icon: MicVocal,
                  title: 'Conversation controls',
                },
                {
                  body: 'Read history, turns, events, and async results to complete the trace surface.',
                  href: '/docs/convoai/restful/operations/get-history',
                  icon: History,
                  title: 'History & observability',
                },
                {
                  body: 'Push state back into business systems through callbacks and NCS events.',
                  href: '/docs/convoai/restful/webhook/ncs-events',
                  icon: Webhook,
                  title: 'Webhooks & events',
                },
              ],
          columns: 4,
          id: 'reference-categories',
          title: isZh ? '参考分类' : 'Reference categories',
          type: 'cards',
        },
        {
          cards: isZh
            ? [
                {
                  body: '出现异常时先看响应码，再结合限制和状态接口缩小范围。',
                  href: '/docs/convoai/restful/api/response-code',
                  icon: Braces,
                  title: '响应码',
                },
                {
                  body: '了解配额、频率和语音资源约束，避免在联调阶段走进隐性限制。',
                  href: '/docs/convoai/restful/api/api-limits',
                  icon: Gauge,
                  title: '接口限制',
                },
                {
                  body: '查看可用 voice id，把 TTS 资源纳入稳定参考。',
                  href: '/docs/convoai/restful/api/voice-ids',
                  icon: AudioLines,
                  title: '语音资源 ID',
                },
              ]
            : [
                {
                  body: 'Start from response codes, then combine limits and status endpoints to reduce uncertainty quickly.',
                  href: '/docs/convoai/restful/api/response-code',
                  icon: Braces,
                  title: 'Response codes',
                },
                {
                  body: 'Understand quotas, rate controls, and voice limits before they surprise the integration.',
                  href: '/docs/convoai/restful/api/api-limits',
                  icon: Gauge,
                  title: 'API limits',
                },
                {
                  body: 'Use the stable voice ID list as a canonical reference for TTS resources.',
                  href: '/docs/convoai/restful/api/voice-ids',
                  icon: AudioLines,
                  title: 'Voice IDs',
                },
              ],
          columns: 3,
          id: 'error-limits',
          title: isZh ? '错误与限制' : 'Errors & limits',
          type: 'cards',
        },
      ],
      sidebar: [
        {
          items: [
            { active: true, href: '#hero', label: isZh ? '接口总览' : 'Reference Overview' },
            { href: '#reference-categories', label: isZh ? '参考分类' : 'Reference categories' },
            { href: '#error-limits', label: isZh ? '错误与限制' : 'Errors & limits' },
          ],
          title: labels.api,
        },
        {
          items: [
            { href: '/docs/convoai/restful/operations/start-agent', label: isZh ? '开始操作 API' : 'Start-agent API' },
            { href: '/docs/convoai/restful/webhook/enable-ncs', label: isZh ? '启用回调' : 'Enable webhook' },
            { href: '/docs/convoai/restful/api/response-code', label: isZh ? '响应码' : 'Response codes' },
          ],
          title: isZh ? '高频入口' : 'Frequent entry points',
        },
        {
          items: exploreMore,
          title: labels.exploreMore,
        },
      ],
    },
    'best-practices': {
      description: isZh
        ? '从安全、鉴权、低时延、音频设置和地理策略切入，把 demo 拉向生产可用。'
        : 'Move from demo into production readiness through security, auth, latency, audio settings, and regional policy.',
      heroActions: isZh
        ? [
            { href: '/docs/convoai/restful/best-practice/audio-settings', label: '查看音频设置', variant: 'default' },
            { href: '/docs/convoai/restful/best-practice/opt-latency', label: '查看低时延优化', variant: 'outline' },
          ]
        : [
            { href: '/docs/convoai/restful/best-practice/audio-settings', label: 'Open audio settings', variant: 'default' },
            { href: '/docs/convoai/restful/best-practice/opt-latency', label: 'Open latency guide', variant: 'outline' },
          ],
      heroEyebrow: labels.best,
      heroTitle: isZh
        ? '把可靠性、鉴权和性能前置，而不是上线前再补。'
        : 'Pull reliability, auth, and performance forward instead of treating them as launch-day cleanup.',
      label: labels.best,
      sections: [
        {
          cards: isZh
            ? [
                {
                  body: '在不同网络、设备和终端形态下，先把音频参数调到足够稳定。',
                  href: '/docs/convoai/restful/best-practice/audio-settings',
                  icon: AudioLines,
                  title: '音频设置',
                },
                {
                  body: '优先优化端到端延迟，让交互体验更接近自然实时对话。',
                  href: '/docs/convoai/restful/best-practice/opt-latency',
                  icon: Gauge,
                  title: '低时延优化',
                },
                {
                  body: '结合地理围栏与区域策略，降低跨地域部署中的合规与体验风险。',
                  href: '/docs/convoai/restful/best-practice/geofencing',
                  icon: MapPinned,
                  title: '区域策略',
                },
                {
                  body: '通过基础鉴权、回调和数据接入方式保证业务链路不会过早暴露风险。',
                  href: '/docs/convoai/restful/user-guides/http-basic-auth',
                  icon: ShieldCheck,
                  title: '安全与鉴权',
                },
              ]
            : [
                {
                  body: 'Tune audio parameters for different networks, devices, and terminal shapes before scaling.',
                  href: '/docs/convoai/restful/best-practice/audio-settings',
                  icon: AudioLines,
                  title: 'Audio settings',
                },
                {
                  body: 'Reduce end-to-end latency until the experience feels close to natural live conversation.',
                  href: '/docs/convoai/restful/best-practice/opt-latency',
                  icon: Gauge,
                  title: 'Latency optimization',
                },
                {
                  body: 'Use geofencing and regional policy to lower compliance and experience risk across geographies.',
                  href: '/docs/convoai/restful/best-practice/geofencing',
                  icon: MapPinned,
                  title: 'Regional strategy',
                },
                {
                  body: 'Bring auth, callbacks, and data access under control before the business flow grows.',
                  href: '/docs/convoai/restful/user-guides/http-basic-auth',
                  icon: ShieldCheck,
                  title: 'Security & auth',
                },
              ],
          columns: 4,
          id: 'production-guides',
          title: isZh ? '生产实践' : 'Production guides',
          type: 'cards',
        },
        {
          items: isZh
            ? [
                {
                  body: '最佳实践不应该和快速开始混在一起，它们回答的是“怎么上线”而不是“怎么跑通”。',
                  title: '和快速开始分层',
                },
                {
                  body: '如果一项建议会影响稳定性、成本或合规，它更适合放在最佳实践而不是产品介绍里。',
                  title: '承接高后果决策',
                },
                {
                  body: '最佳实践页也应该能继续下钻到接口和观测文档，而不是停留在原则层。',
                  title: '仍然要能继续执行',
                },
              ]
            : [
                {
                  body: 'Best practices should answer how to launch and operate, not how to reach the first demo.',
                  title: 'Stay separate from quickstarts',
                },
                {
                  body: 'If a recommendation changes stability, cost, or compliance, it belongs here more than in a product overview.',
                  title: 'Carry the higher-consequence decisions',
                },
                {
                  body: 'These pages should still route into APIs and observability docs instead of stopping at principles.',
                  title: 'Remain executable',
                },
              ],
          id: 'best-practice-principles',
          title: isZh ? '为什么独立成页' : 'Why this deserves its own tab',
          type: 'triptych',
        },
      ],
      sidebar: [
        {
          items: [
            { active: true, href: '#hero', label: isZh ? '最佳实践总览' : 'Best Practices Overview' },
            { href: '#production-guides', label: isZh ? '生产实践' : 'Production guides' },
            { href: '#best-practice-principles', label: isZh ? '为什么独立成页' : 'Why its own tab' },
          ],
          title: labels.best,
        },
        {
          items: [
            { href: '/docs/convoai/restful/user-guides/http-basic-auth', label: isZh ? '鉴权与安全' : 'Auth & security' },
            { href: '/docs/convoai/restful/webhook/enable-ncs', label: isZh ? '回调接入' : 'Webhook setup' },
            { href: '/docs/convoai/restful/overview/release-notes', label: isZh ? '发版说明' : 'Release notes' },
          ],
          title: isZh ? '常用入口' : 'Common entry points',
        },
        {
          items: exploreMore,
          title: labels.exploreMore,
        },
      ],
    },
  };

  return configs[tab];
}
