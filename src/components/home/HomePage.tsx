import {
  BookOpenText,
  Braces,
  Globe2,
  Layers3,
  Search,
  Sparkles,
  SquareTerminal,
  Waypoints,
  Wrench,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PortalDocContent } from '@/components/home/PortalDocContent';
import { PortalSidebar } from '@/components/home/PortalSidebar';
import { SiteFooter } from '@/components/home/SiteFooter';
import { cn } from '@/lib/cn';
import { localizePortalData } from '@/lib/convoai-portal-localization';
import { useLocale } from '@/lib/i18n/use-locale';
import type { PortalTab } from '@/lib/convoai-portal.server';

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
  domain,
  page,
  portalData,
}: {
  domain?: string;
  page?: string;
  portalData: PortalTab[];
}) {
  const { t } = useTranslation('common');
  const { locale, setLocale } = useLocale();
  const localizedPortalData = localizePortalData(portalData, locale);
  const activeTab = resolveActiveTab(localizedPortalData, domain, page);
  const activeDoc = resolveActiveDoc(activeTab, page);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/75 bg-background/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[126rem] items-center justify-between gap-6 px-5 py-4 sm:px-7 lg:px-10">
          <a
            href={`/?domain=${localizedPortalData[0]?.key}&page=${localizedPortalData[0]?.docs[0]?.pageKey}`}
          >
            <Brand />
          </a>
          <div className="flex items-center gap-3">
            <button
              className="hidden rounded-xl border border-border/70 px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:inline-flex md:items-center"
              onClick={() => void setLocale(locale === 'zh-CN' ? 'en' : 'zh-CN')}
              type="button"
            >
              <Globe2 className="mr-2 size-4" />
              {locale === 'zh-CN'
                ? t('controls.language.english')
                : t('controls.language.chinese')}
            </button>
            <a
              className="hidden rounded-xl border border-border/70 px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:inline-flex"
              href="/docs/convoai/restful/mcp-integrate"
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
          {localizedPortalData.map((tab) => (
            <a
              className={cn(
                'inline-flex items-center gap-2 whitespace-nowrap border-b border-transparent pb-1 transition-colors hover:text-foreground',
                tab.key === activeTab.key && 'border-primary text-foreground',
              )}
              href={`/?domain=${tab.key}&page=${tab.docs[0]?.pageKey ?? ''}`}
              key={tab.key}
            >
              <TopTabIcon tabKey={tab.key} />
              {tab.label}
            </a>
          ))}
        </div>
      </header>

      <main className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-[126rem] grid-cols-1 lg:grid-cols-[22rem_minmax(0,1fr)] xl:grid-cols-[24rem_minmax(0,1fr)]">
        <PortalSidebar activeDoc={activeDoc} activeTab={activeTab} />

        <div className="px-5 py-10 sm:px-7 lg:px-10 lg:py-14 xl:px-12">
          <PortalDocContent
            description={activeDoc.description}
            markdownUrl={activeDoc.markdownUrl}
            path={activeDoc.path}
            title={activeDoc.title}
          />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

function resolveActiveTab(portalData: PortalTab[], domain?: string, page?: string) {
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
    const byPage = portalData.find((tab) =>
      tab.docs.some((doc) => doc.pageKey === page),
    );
    if (byPage) {
      return byPage;
    }
  }

  return portalData[0];
}

function resolveActiveDoc(tab: PortalTab, page?: string) {
  return tab.docs.find((doc) => doc.pageKey === page) ?? tab.docs[0];
}

function normalizeLegacyDomain(domain: string, page?: string) {
  if (domain !== 'docs') {
    return domain;
  }

  if (!page) {
    return domain;
  }

  if (page === 'get-started/quick-start-go' || page === 'get-started/quick-start-java') {
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

function TopTabIcon({ tabKey }: { tabKey: string }) {
  const className = 'size-4';

  switch (tabKey) {
    case 'docs':
      return <BookOpenText className={className} />;
    case 'skillmcp':
      return <Waypoints className={className} />;
    case 'sdks':
      return <SquareTerminal className={className} />;
    case 'recepies':
      return <Wrench className={className} />;
    case 'reference':
      return <Layers3 className={className} />;
    case 'api':
      return <Braces className={className} />;
    default:
      return <BookOpenText className={className} />;
  }
}
