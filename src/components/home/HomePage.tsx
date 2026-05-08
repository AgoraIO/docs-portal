import {
  ArrowRight,
  Bot,
  Boxes,
  Cable,
  Code2,
  Database,
  MessageSquareText,
  RadioTower,
  Search,
  ShieldCheck,
  Sparkles,
  Video,
  Waves,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { SiteFooter } from '@/components/home/SiteFooter';
import { cn } from '@/lib/cn';
import { loadHomeMarkdownPages, type MarkdownPage } from '@/lib/home-markdown';
import { useLocale } from '@/lib/i18n/use-locale';

type DomainKey =
  | 'overview'
  | 'ai'
  | 'rtc'
  | 'messaging'
  | 'media'
  | 'solutions'
  | 'reference';

type DomainPageKey =
  | 'overview-home'
  | 'overview-community'
  | 'overview-glossary'
  | 'ai-home'
  | 'ai-quickstart'
  | 'ai-agent'
  | 'rtc-home'
  | 'rtc-clients'
  | 'rtc-server'
  | 'messaging-home'
  | 'messaging-sync'
  | 'messaging-reference'
  | 'media-home'
  | 'media-recording'
  | 'media-transcoding'
  | 'solutions-home'
  | 'solutions-social'
  | 'solutions-education'
  | 'reference-home'
  | 'reference-api'
  | 'reference-security';

type DocLink = {
  label: string;
  href: string;
};

type PageSection = {
  title: string;
  body: string;
  links?: DocLink[];
};

type FeatureCardData = {
  body: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
};

type LeftGroup = {
  title: string;
  items: Array<{
    label: string;
    page: DomainPageKey;
  }>;
};

type PageContent = {
  title: string;
  description: string;
  eyebrow?: string;
  cards?: FeatureCardData[];
  sections?: PageSection[];
};

type DomainContent = {
  title: string;
  tabsLabel: string;
  leftGroups: LeftGroup[];
  pages: Record<DomainPageKey, PageContent>;
  defaultPage: DomainPageKey;
};

const topTabs: Array<{ key: DomainKey; href: string }> = [
  { key: 'overview', href: '/?domain=overview&page=overview-home' },
  { key: 'ai', href: '/?domain=ai&page=ai-home' },
  { key: 'rtc', href: '/?domain=rtc&page=rtc-home' },
  { key: 'messaging', href: '/?domain=messaging&page=messaging-home' },
  { key: 'media', href: '/?domain=media&page=media-home' },
  { key: 'solutions', href: '/?domain=solutions&page=solutions-home' },
  { key: 'reference', href: '/?domain=reference&page=reference-home' },
];

const referenceLinks = [
  { key: 'llms', href: '/llms.txt', icon: Bot },
  { key: 'full', href: '/llms-full.txt', icon: Database },
  { key: 'search', href: '/api/search', icon: Search },
  {
    key: 'markdown',
    href: '/llms.mdx/docs/convoai/restful/get-started/overview/content.md',
    icon: Code2,
  },
] as const;

const iconByKey = {
  message: MessageSquareText,
  sparkles: Sparkles,
  video: Video,
} as const;

function Brand() {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <div className="flex size-10 items-center justify-center rounded-2xl border border-border bg-card/90 shadow-[0_16px_40px_-28px_rgba(33,139,120,0.28)]">
        <div className="flex items-end gap-1">
          <span className="h-3.5 w-1 rounded-full bg-primary/75" />
          <span className="h-5.5 w-1 rounded-full bg-foreground" />
          <span className="h-2.5 w-1 rounded-full bg-border" />
        </div>
      </div>
      <div className="min-w-0">
        <p className="truncate text-[1.05rem] font-semibold tracking-[-0.02em] text-foreground">
          Agora Docs
        </p>
      </div>
    </div>
  );
}

export function HomePage({
  domain = 'overview',
  page,
}: {
  domain?: DomainKey;
  page?: string;
}) {
  const { t } = useTranslation('common');
  const { locale } = useLocale();
  const isZh = locale === 'zh-CN';
  const contentByDomain = getDomainContent(t);
  const activeDomain = contentByDomain[domain] ? domain : 'overview';
  const currentDomain = contentByDomain[activeDomain];
  const currentPage =
    page && page in currentDomain.pages
      ? (page as DomainPageKey)
      : currentDomain.defaultPage;
  const localeKey = locale === 'zh-CN' ? 'zh-CN' : 'en';
  const markdownPages = loadHomeMarkdownPages();
  const markdownOverride =
    currentPage === 'overview-home' || currentPage === 'ai-home'
      ? markdownPages?.[localeKey]?.[currentPage]
      : null;
  const normalizedMarkdownContent = markdownOverride
    ? normalizeMarkdownPage(markdownOverride)
    : null;
  const currentContent =
    normalizedMarkdownContent &&
    normalizedMarkdownContent.title &&
    normalizedMarkdownContent.title !== 'Untitled'
      ? normalizedMarkdownContent
      : currentDomain.pages[currentPage];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/75 bg-background/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[126rem] items-center justify-between gap-6 px-5 py-4 sm:px-7 lg:px-10">
          <div className="flex min-w-0 items-center gap-8">
            <a href="/?domain=overview&page=overview-home">
              <Brand />
            </a>
          </div>
          <div className="flex items-center gap-3">
            <a
              className="hidden rounded-xl border border-border/70 px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:inline-flex"
              href="/llms.txt"
            >
              <Sparkles className="mr-2 size-4" />
              {t('home.askAi')}
            </a>
            <a
              className="hidden rounded-xl border border-border/70 px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:inline-flex"
              href="/api/search"
            >
              <Search className="mr-2 size-4" />
              {t('home.search')}
            </a>
          </div>
        </div>
        <div className="mx-auto flex w-full max-w-[126rem] items-center gap-7 overflow-x-auto px-5 py-3 text-sm text-muted-foreground sm:px-7 lg:px-10">
          {topTabs.map((tab) => (
            <a
              className={cn(
                'whitespace-nowrap border-b border-transparent pb-1 transition-colors hover:text-foreground',
                tab.key === activeDomain && 'border-primary text-foreground',
              )}
              href={tab.href}
              key={tab.key}
            >
              {t(`home.tabs.${tab.key}`)}
            </a>
          ))}
        </div>
      </header>

      <main className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-[126rem] grid-cols-1 lg:grid-cols-[22rem_minmax(0,1fr)]">
        <aside className="hidden border-r border-border/75 px-8 py-10 lg:block">
          <div className="space-y-10">
            {currentDomain.leftGroups.map((group) => (
              <div key={group.title}>
                <p className="mb-4 text-[0.82rem] font-semibold uppercase tracking-[0.18em] text-foreground">
                  {group.title}
                </p>
                <div className="border-l border-border/75 pl-5">
                  <ul className="space-y-4">
                    {group.items.map((item) => (
                      <li key={item.page}>
                        <a
                          className={cn(
                            'text-[1.02rem] leading-7 text-muted-foreground transition-colors hover:text-foreground',
                            currentPage === item.page && 'font-medium text-primary',
                          )}
                          href={`/?domain=${activeDomain}&page=${item.page}`}
                        >
                          {item.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </aside>

        <div className="px-5 py-10 sm:px-7 lg:px-12 lg:py-14">
          <section className="grid gap-10 border-b border-border/75 pb-12">
            <div className="max-w-4xl">
              {currentContent.eyebrow ? (
                <Badge className="mb-5" variant="outline">
                  {currentContent.eyebrow}
                </Badge>
              ) : null}
              <h1
                className={cn(
                  'text-balance font-semibold text-foreground',
                  isZh
                    ? 'text-[2.2rem] leading-[1.18] tracking-[-0.02em] lg:text-[3.25rem]'
                    : 'text-[2.35rem] leading-[1.08] tracking-[-0.05em] lg:text-[3.65rem]',
                )}
              >
                {currentContent.title}
              </h1>
              <p
                className={cn(
                  'mt-5 max-w-3xl text-muted-foreground',
                  isZh ? 'text-[1.05rem] leading-8' : 'text-[1.06rem] leading-8',
                )}
              >
                {currentContent.description}
              </p>
            </div>
          </section>

          {currentContent.cards?.length ? (
            <section className="pt-12">
              <div className="mb-7 flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-[2rem] font-semibold tracking-[-0.02em] text-foreground">
                    {t('home.quickstart.title')}
                  </h2>
                  <p className="mt-2 text-[1rem] text-muted-foreground">
                    {t('home.quickstart.body')}
                  </p>
                </div>
              </div>

              <div className="grid gap-5 xl:grid-cols-3">
                {currentContent.cards.map((card) => (
                  <FeatureCard
                    body={card.body}
                    href={card.href}
                    icon={card.icon}
                    key={card.title}
                    title={card.title}
                  />
                ))}
              </div>
            </section>
          ) : null}

          {currentContent.sections?.length ? (
            <section className="border-t border-border/75 pt-12">
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                {currentContent.sections.map((section) => (
                  <Card className="overflow-hidden bg-card/90" key={section.title}>
                    <CardHeader className="pb-4">
                      <CardTitle className="text-[1.45rem]">{section.title}</CardTitle>
                      <CardDescription>{section.body}</CardDescription>
                    </CardHeader>
                    {section.links?.length ? (
                      <CardContent className="grid gap-3">
                        {section.links.map((link) => (
                          <a
                            className="flex items-center justify-between rounded-2xl border border-border/75 bg-background/70 px-4 py-3 transition-colors hover:bg-accent"
                            href={link.href}
                            key={link.label}
                          >
                            <span className="text-sm font-medium text-foreground">
                              {link.label}
                            </span>
                            <ArrowRight className="size-4 text-primary" />
                          </a>
                        ))}
                      </CardContent>
                    ) : null}
                  </Card>
                ))}
              </div>
            </section>
          ) : null}

          {activeDomain === 'reference' && currentPage === 'reference-home' ? (
            <section className="border-t border-border/75 pt-12">
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
                <Card className="overflow-hidden bg-card/90">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3 text-primary">
                      <ShieldCheck className="size-5" />
                      <span className="text-sm font-medium uppercase tracking-[0.16em]">
                        {t('home.references.eyebrow')}
                      </span>
                    </div>
                    <CardTitle className="text-[1.6rem]">
                      {t('home.references.title')}
                    </CardTitle>
                    <CardDescription>{t('home.references.body')}</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-3">
                    {referenceLinks.map((item) => {
                      const Icon = item.icon;

                      return (
                        <a
                          className="flex items-center justify-between rounded-2xl border border-border/75 bg-background/70 px-4 py-3 transition-colors hover:bg-accent"
                          href={item.href}
                          key={item.key}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex size-9 items-center justify-center rounded-xl border border-border/75 bg-card">
                              <Icon className="size-4 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                {t(`home.references.items.${item.key}.title`)}
                              </p>
                              <p className="text-xs leading-6 text-muted-foreground">
                                {t(`home.references.items.${item.key}.body`)}
                              </p>
                            </div>
                          </div>
                          <ArrowRight className="size-4 text-primary" />
                        </a>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>
            </section>
          ) : null}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function normalizeMarkdownPage(markdownPage: MarkdownPage) {
  return {
    cards:
      markdownPage.cards?.map((card) => ({
        ...card,
        icon: iconByKey[card.icon as keyof typeof iconByKey] ?? Sparkles,
      })) ?? [],
    description: markdownPage.description,
    eyebrow: markdownPage.eyebrow,
    sections: markdownPage.sections ?? [],
    title: markdownPage.title,
  };
}

function getDomainContent(t: (key: string) => string): Record<DomainKey, DomainContent> {
  return {
    overview: {
      title: t('home.tabs.overview'),
      tabsLabel: t('home.tabs.overview'),
      defaultPage: 'overview-home',
      leftGroups: [
        {
          title: t('home.sidebar.getStarted.title'),
          items: [
            { label: 'Overview', page: 'overview-home' },
            { label: t('home.sidebar.getStarted.items.videoCourse'), page: 'ai-quickstart' },
            { label: t('home.sidebar.getStarted.items.community'), page: 'overview-community' },
          ],
        },
        {
          title: t('home.sidebar.understanding.title'),
          items: [
            { label: t('home.sidebar.understanding.items.platformOverview'), page: 'platform-overview' },
            { label: t('home.sidebar.understanding.items.ai'), page: 'ai-domain' },
            { label: t('home.sidebar.understanding.items.rtc'), page: 'rtc-domain' },
            { label: t('home.sidebar.understanding.items.messaging'), page: 'messaging-domain' },
            { label: t('home.sidebar.understanding.items.media'), page: 'media-domain' },
            { label: t('home.sidebar.understanding.items.solutions'), page: 'solutions-domain' },
          ],
        },
        {
          title: t('home.sidebar.reference.title'),
          items: [
            { label: t('home.sidebar.reference.items.recipes'), page: 'glossary' },
            { label: t('home.sidebar.reference.items.roomApi'), page: 'api-reference' },
            { label: t('home.sidebar.reference.items.security'), page: 'security' },
          ],
        },
      ],
      pages: {
        'overview-home': {
          title: t('home.title'),
          description: t('home.description'),
          cards: [
            {
              title: t('home.featureCards.aiQuickstart.title'),
              body: t('home.featureCards.aiQuickstart.body'),
              href: '/?domain=ai&page=ai-quickstart',
              icon: Sparkles,
            },
            {
              title: t('home.featureCards.rtcQuickstart.title'),
              body: t('home.featureCards.rtcQuickstart.body'),
              href: '/?domain=rtc&page=rtc-home',
              icon: Video,
            },
            {
              title: t('home.featureCards.rtmQuickstart.title'),
              body: t('home.featureCards.rtmQuickstart.body'),
              href: '/?domain=messaging&page=messaging-home',
              icon: MessageSquareText,
            },
          ],
        },
        'overview-community': getPage(t, 'community'),
        glossary: getPage(t, 'glossary'),
        'platform-overview': getPage(t, 'platformOverview'),
        'ai-domain': getPage(t, 'aiDomain'),
        'rtc-domain': getPage(t, 'rtcDomain'),
        'messaging-domain': getPage(t, 'messagingDomain'),
        'media-domain': getPage(t, 'mediaDomain'),
        'solutions-domain': getPage(t, 'solutionsDomain'),
        'ai-quickstart': getPage(t, 'aiQuickstart'),
        'api-reference': getPage(t, 'apiReference'),
        security: getPage(t, 'security'),
        'ai-home': getPage(t, 'aiDomain'),
        'ai-agent': getPage(t, 'aiDomain'),
        'rtc-home': getPage(t, 'rtcDomain'),
        'rtc-clients': getPage(t, 'rtcDomain'),
        'rtc-server': getPage(t, 'rtcDomain'),
        'messaging-home': getPage(t, 'messagingDomain'),
        'messaging-sync': getPage(t, 'messagingDomain'),
        'messaging-reference': getPage(t, 'messagingDomain'),
        'media-home': getPage(t, 'mediaDomain'),
        'media-recording': getPage(t, 'mediaDomain'),
        'media-transcoding': getPage(t, 'mediaDomain'),
        'solutions-home': getPage(t, 'solutionsDomain'),
        'solutions-social': getPage(t, 'solutionsDomain'),
        'solutions-education': getPage(t, 'solutionsDomain'),
        'reference-home': getPage(t, 'apiReference'),
      },
    },
    ai: {
      title: t('home.tabs.ai'),
      tabsLabel: t('home.tabs.ai'),
      defaultPage: 'ai-home',
      leftGroups: [
        {
          title: t('home.tabs.ai'),
          items: [
            { label: t('home.pages.aiDomain.title'), page: 'ai-home' },
            { label: t('home.featureCards.aiQuickstart.title'), page: 'ai-quickstart' },
            { label: 'AI agent', page: 'ai-agent' },
          ],
        },
      ],
      pages: {
        'ai-home': getPage(t, 'aiDomain'),
        'ai-quickstart': getPage(t, 'aiQuickstart'),
        'ai-agent': {
          title: t('home.pages.aiAgent.title'),
          description: t('home.pages.aiAgent.description'),
          sections: [
            {
              title: t('home.pages.aiAgent.section1.title'),
              body: t('home.pages.aiAgent.section1.body'),
              links: [
                { href: '/llms.txt', label: t('home.pages.aiAgent.section1.link1') },
                { href: '/api/search', label: t('home.pages.aiAgent.section1.link2') },
              ],
            },
          ],
        },
        'overview-home': getPage(t, 'aiDomain'),
        'overview-community': getPage(t, 'community'),
        glossary: getPage(t, 'glossary'),
        'platform-overview': getPage(t, 'platformOverview'),
        'ai-domain': getPage(t, 'aiDomain'),
        'rtc-domain': getPage(t, 'rtcDomain'),
        'messaging-domain': getPage(t, 'messagingDomain'),
        'media-domain': getPage(t, 'mediaDomain'),
        'solutions-domain': getPage(t, 'solutionsDomain'),
        'api-reference': getPage(t, 'apiReference'),
        security: getPage(t, 'security'),
        'rtc-home': getPage(t, 'rtcDomain'),
        'rtc-clients': getPage(t, 'rtcDomain'),
        'rtc-server': getPage(t, 'rtcDomain'),
        'messaging-home': getPage(t, 'messagingDomain'),
        'messaging-sync': getPage(t, 'messagingDomain'),
        'messaging-reference': getPage(t, 'messagingDomain'),
        'media-home': getPage(t, 'mediaDomain'),
        'media-recording': getPage(t, 'mediaDomain'),
        'media-transcoding': getPage(t, 'mediaDomain'),
        'solutions-home': getPage(t, 'solutionsDomain'),
        'solutions-social': getPage(t, 'solutionsDomain'),
        'solutions-education': getPage(t, 'solutionsDomain'),
        'reference-home': getPage(t, 'apiReference'),
      },
    },
    rtc: {
      title: t('home.tabs.rtc'),
      tabsLabel: t('home.tabs.rtc'),
      defaultPage: 'rtc-home',
      leftGroups: [
        {
          title: t('home.tabs.rtc'),
          items: [
            { label: t('home.pages.rtcDomain.title'), page: 'rtc-home' },
            { label: t('home.pages.rtcClients.title'), page: 'rtc-clients' },
            { label: t('home.pages.rtcServer.title'), page: 'rtc-server' },
          ],
        },
      ],
      pages: {
        'rtc-home': getPage(t, 'rtcDomain'),
        'rtc-clients': getPage(t, 'rtcClients'),
        'rtc-server': getPage(t, 'rtcServer'),
        'overview-home': getPage(t, 'rtcDomain'),
        'overview-community': getPage(t, 'community'),
        glossary: getPage(t, 'glossary'),
        'platform-overview': getPage(t, 'platformOverview'),
        'ai-domain': getPage(t, 'aiDomain'),
        'rtc-domain': getPage(t, 'rtcDomain'),
        'messaging-domain': getPage(t, 'messagingDomain'),
        'media-domain': getPage(t, 'mediaDomain'),
        'solutions-domain': getPage(t, 'solutionsDomain'),
        'ai-quickstart': getPage(t, 'aiQuickstart'),
        'api-reference': getPage(t, 'apiReference'),
        security: getPage(t, 'security'),
        'ai-home': getPage(t, 'aiDomain'),
        'ai-agent': getPage(t, 'aiDomain'),
        'messaging-home': getPage(t, 'messagingDomain'),
        'messaging-sync': getPage(t, 'messagingDomain'),
        'messaging-reference': getPage(t, 'messagingDomain'),
        'media-home': getPage(t, 'mediaDomain'),
        'media-recording': getPage(t, 'mediaDomain'),
        'media-transcoding': getPage(t, 'mediaDomain'),
        'solutions-home': getPage(t, 'solutionsDomain'),
        'solutions-social': getPage(t, 'solutionsDomain'),
        'solutions-education': getPage(t, 'solutionsDomain'),
        'reference-home': getPage(t, 'apiReference'),
      },
    },
    messaging: {
      title: t('home.tabs.messaging'),
      tabsLabel: t('home.tabs.messaging'),
      defaultPage: 'messaging-home',
      leftGroups: [
        {
          title: t('home.tabs.messaging'),
          items: [
            { label: t('home.pages.messagingDomain.title'), page: 'messaging-home' },
            { label: t('home.pages.messagingSync.title'), page: 'messaging-sync' },
            { label: t('home.pages.messagingReference.title'), page: 'messaging-reference' },
          ],
        },
      ],
      pages: {
        'messaging-home': getPage(t, 'messagingDomain'),
        'messaging-sync': getPage(t, 'messagingSync'),
        'messaging-reference': getPage(t, 'messagingReference'),
        'overview-home': getPage(t, 'messagingDomain'),
        'overview-community': getPage(t, 'community'),
        glossary: getPage(t, 'glossary'),
        'platform-overview': getPage(t, 'platformOverview'),
        'ai-domain': getPage(t, 'aiDomain'),
        'rtc-domain': getPage(t, 'rtcDomain'),
        'messaging-domain': getPage(t, 'messagingDomain'),
        'media-domain': getPage(t, 'mediaDomain'),
        'solutions-domain': getPage(t, 'solutionsDomain'),
        'ai-quickstart': getPage(t, 'aiQuickstart'),
        'api-reference': getPage(t, 'apiReference'),
        security: getPage(t, 'security'),
        'ai-home': getPage(t, 'aiDomain'),
        'ai-agent': getPage(t, 'aiDomain'),
        'rtc-home': getPage(t, 'rtcDomain'),
        'rtc-clients': getPage(t, 'rtcDomain'),
        'rtc-server': getPage(t, 'rtcDomain'),
        'media-home': getPage(t, 'mediaDomain'),
        'media-recording': getPage(t, 'mediaDomain'),
        'media-transcoding': getPage(t, 'mediaDomain'),
        'solutions-home': getPage(t, 'solutionsDomain'),
        'solutions-social': getPage(t, 'solutionsDomain'),
        'solutions-education': getPage(t, 'solutionsDomain'),
        'reference-home': getPage(t, 'apiReference'),
      },
    },
    media: {
      title: t('home.tabs.media'),
      tabsLabel: t('home.tabs.media'),
      defaultPage: 'media-home',
      leftGroups: [
        {
          title: t('home.tabs.media'),
          items: [
            { label: t('home.pages.mediaDomain.title'), page: 'media-home' },
            { label: t('home.pages.mediaRecording.title'), page: 'media-recording' },
            { label: t('home.pages.mediaTranscoding.title'), page: 'media-transcoding' },
          ],
        },
      ],
      pages: {
        'media-home': getPage(t, 'mediaDomain'),
        'media-recording': getPage(t, 'mediaRecording'),
        'media-transcoding': getPage(t, 'mediaTranscoding'),
        'overview-home': getPage(t, 'mediaDomain'),
        'overview-community': getPage(t, 'community'),
        glossary: getPage(t, 'glossary'),
        'platform-overview': getPage(t, 'platformOverview'),
        'ai-domain': getPage(t, 'aiDomain'),
        'rtc-domain': getPage(t, 'rtcDomain'),
        'messaging-domain': getPage(t, 'messagingDomain'),
        'media-domain': getPage(t, 'mediaDomain'),
        'solutions-domain': getPage(t, 'solutionsDomain'),
        'ai-quickstart': getPage(t, 'aiQuickstart'),
        'api-reference': getPage(t, 'apiReference'),
        security: getPage(t, 'security'),
        'ai-home': getPage(t, 'aiDomain'),
        'ai-agent': getPage(t, 'aiDomain'),
        'rtc-home': getPage(t, 'rtcDomain'),
        'rtc-clients': getPage(t, 'rtcDomain'),
        'rtc-server': getPage(t, 'rtcDomain'),
        'messaging-home': getPage(t, 'messagingDomain'),
        'messaging-sync': getPage(t, 'messagingDomain'),
        'messaging-reference': getPage(t, 'messagingDomain'),
        'solutions-home': getPage(t, 'solutionsDomain'),
        'solutions-social': getPage(t, 'solutionsDomain'),
        'solutions-education': getPage(t, 'solutionsDomain'),
        'reference-home': getPage(t, 'apiReference'),
      },
    },
    solutions: {
      title: t('home.tabs.solutions'),
      tabsLabel: t('home.tabs.solutions'),
      defaultPage: 'solutions-home',
      leftGroups: [
        {
          title: t('home.tabs.solutions'),
          items: [
            { label: t('home.pages.solutionsDomain.title'), page: 'solutions-home' },
            { label: t('home.pages.solutionsSocial.title'), page: 'solutions-social' },
            { label: t('home.pages.solutionsEducation.title'), page: 'solutions-education' },
          ],
        },
      ],
      pages: {
        'solutions-home': getPage(t, 'solutionsDomain'),
        'solutions-social': getPage(t, 'solutionsSocial'),
        'solutions-education': getPage(t, 'solutionsEducation'),
        'overview-home': getPage(t, 'solutionsDomain'),
        'overview-community': getPage(t, 'community'),
        glossary: getPage(t, 'glossary'),
        'platform-overview': getPage(t, 'platformOverview'),
        'ai-domain': getPage(t, 'aiDomain'),
        'rtc-domain': getPage(t, 'rtcDomain'),
        'messaging-domain': getPage(t, 'messagingDomain'),
        'media-domain': getPage(t, 'mediaDomain'),
        'solutions-domain': getPage(t, 'solutionsDomain'),
        'ai-quickstart': getPage(t, 'aiQuickstart'),
        'api-reference': getPage(t, 'apiReference'),
        security: getPage(t, 'security'),
        'ai-home': getPage(t, 'aiDomain'),
        'ai-agent': getPage(t, 'aiDomain'),
        'rtc-home': getPage(t, 'rtcDomain'),
        'rtc-clients': getPage(t, 'rtcDomain'),
        'rtc-server': getPage(t, 'rtcDomain'),
        'messaging-home': getPage(t, 'messagingDomain'),
        'messaging-sync': getPage(t, 'messagingDomain'),
        'messaging-reference': getPage(t, 'messagingDomain'),
        'media-home': getPage(t, 'mediaDomain'),
        'media-recording': getPage(t, 'mediaDomain'),
        'media-transcoding': getPage(t, 'mediaDomain'),
        'reference-home': getPage(t, 'apiReference'),
      },
    },
    reference: {
      title: t('home.tabs.reference'),
      tabsLabel: t('home.tabs.reference'),
      defaultPage: 'reference-home',
      leftGroups: [
        {
          title: t('home.tabs.reference'),
          items: [
            { label: t('home.pages.apiReference.title'), page: 'reference-home' },
            { label: t('home.sidebar.reference.items.roomApi'), page: 'reference-api' },
            { label: t('home.sidebar.reference.items.security'), page: 'reference-security' },
          ],
        },
      ],
      pages: {
        'reference-home': getPage(t, 'apiReference'),
        'reference-api': getPage(t, 'apiReference'),
        'reference-security': getPage(t, 'security'),
        'overview-home': getPage(t, 'apiReference'),
        'overview-community': getPage(t, 'community'),
        glossary: getPage(t, 'glossary'),
        'platform-overview': getPage(t, 'platformOverview'),
        'ai-domain': getPage(t, 'aiDomain'),
        'rtc-domain': getPage(t, 'rtcDomain'),
        'messaging-domain': getPage(t, 'messagingDomain'),
        'media-domain': getPage(t, 'mediaDomain'),
        'solutions-domain': getPage(t, 'solutionsDomain'),
        'ai-quickstart': getPage(t, 'aiQuickstart'),
        'api-reference': getPage(t, 'apiReference'),
        security: getPage(t, 'security'),
        'ai-home': getPage(t, 'aiDomain'),
        'ai-agent': getPage(t, 'aiDomain'),
        'rtc-home': getPage(t, 'rtcDomain'),
        'rtc-clients': getPage(t, 'rtcDomain'),
        'rtc-server': getPage(t, 'rtcDomain'),
        'messaging-home': getPage(t, 'messagingDomain'),
        'messaging-sync': getPage(t, 'messagingDomain'),
        'messaging-reference': getPage(t, 'messagingDomain'),
        'media-home': getPage(t, 'mediaDomain'),
        'media-recording': getPage(t, 'mediaDomain'),
        'media-transcoding': getPage(t, 'mediaDomain'),
        'solutions-home': getPage(t, 'solutionsDomain'),
        'solutions-social': getPage(t, 'solutionsDomain'),
        'solutions-education': getPage(t, 'solutionsDomain'),
      },
    },
  };
}

function getPage(t: (key: string) => string, key: string): PageContent {
  return {
    title: t(`home.pages.${key}.title`),
    description: t(`home.pages.${key}.description`),
    sections: [
      {
        title: t(`home.pages.${key}.section1.title`),
        body: t(`home.pages.${key}.section1.body`),
        links: [
          t(`home.pages.${key}.section1.link1`, { defaultValue: '' }) ? { href: '/docs', label: t(`home.pages.${key}.section1.link1`) } : null,
          t(`home.pages.${key}.section1.link2`, { defaultValue: '' }) ? { href: '/docs', label: t(`home.pages.${key}.section1.link2`) } : null,
          t(`home.pages.${key}.section1.link3`, { defaultValue: '' }) ? { href: '/docs', label: t(`home.pages.${key}.section1.link3`) } : null,
        ].filter(Boolean) as DocLink[],
      },
      t(`home.pages.${key}.section2.title`, { defaultValue: '' })
        ? {
            title: t(`home.pages.${key}.section2.title`),
            body: t(`home.pages.${key}.section2.body`),
            links: [
              t(`home.pages.${key}.section2.link1`, { defaultValue: '' }) ? { href: '/docs', label: t(`home.pages.${key}.section2.link1`) } : null,
              t(`home.pages.${key}.section2.link2`, { defaultValue: '' }) ? { href: '/docs', label: t(`home.pages.${key}.section2.link2`) } : null,
              t(`home.pages.${key}.section2.link3`, { defaultValue: '' }) ? { href: '/docs', label: t(`home.pages.${key}.section2.link3`) } : null,
            ].filter(Boolean) as DocLink[],
          }
        : null,
    ].filter(Boolean) as PageSection[],
  };
}

function FeatureCard({
  body,
  href,
  icon: Icon,
  title,
}: FeatureCardData) {
  return (
    <a href={href}>
      <Card className="group h-full overflow-hidden bg-card/92 transition-transform duration-200 hover:-translate-y-0.5 hover:border-primary/30">
        <div className="relative h-52 overflow-hidden border-b border-border/70 bg-[linear-gradient(180deg,rgba(246,247,250,0.92),rgba(252,252,252,0.98))]">
          <div className="absolute left-0 right-0 top-0 h-4 bg-[linear-gradient(90deg,rgba(85,116,255,0.18),rgba(85,116,255,0.78),rgba(85,116,255,0.18))]" />
          <div className="absolute inset-x-8 top-8 rounded-[1.35rem] border border-border/70 bg-card/90 p-5 shadow-[0_22px_50px_-34px_rgba(23,27,28,0.35)]">
            <div className="mb-4 flex gap-2">
              <span className="size-3 rounded-full bg-border/80" />
              <span className="size-3 rounded-full bg-border/80" />
              <span className="size-3 rounded-full bg-border/80" />
            </div>
            <div className="rounded-xl border border-border/70 bg-background/75 px-4 py-3 text-sm text-muted-foreground">
              {body}
            </div>
          </div>
          <div className="absolute bottom-7 right-8 flex size-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/8 shadow-[0_25px_40px_-30px_rgba(22,127,109,0.5)]">
            <Icon className="size-7 text-primary" />
          </div>
        </div>
        <CardHeader className="gap-2">
          <CardTitle className="text-[1.28rem]">{title}</CardTitle>
          <CardDescription>{body}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-2 text-sm font-medium text-foreground">
          <span>{title}</span>
          <ArrowRight className="size-4 text-primary transition-transform group-hover:translate-x-0.5" />
        </CardContent>
      </Card>
    </a>
  );
}
