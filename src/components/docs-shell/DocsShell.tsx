'use client';

import { ClientOnly, Link, useNavigate } from '@tanstack/react-router';
import type { TOCItemType } from 'fumadocs-core/toc';
import {
  CheckIcon,
  ChevronDownIcon,
  LanguagesIcon,
  MenuIcon,
  MoonIcon,
  SearchIcon,
  SunIcon,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/cn';
import { getDocsPagePayload } from '@/lib/docs-page';
import type { DocsSidebarHeader } from '@/lib/docs-nav-scope';
import { replaceDocLocale } from '@/lib/docs-routing';
import {
  isApiReferenceContentPath,
  isDeferredOrdinaryApiReferenceContentPath,
  isSidebarDeferredContentPath,
} from '@/lib/docs-source-buckets';
import {
  getDefaultDocsTabs,
  type DocsSidebarNode,
  type TabSummary,
} from '@/lib/docs-tree';
import {
  type AppLocale,
  DEFAULT_LOCALE,
  normalizeLocale,
  SUPPORTED_LOCALES,
} from '@/lib/i18n/i18n-config';
import { useTranslation } from '@/lib/i18n/react';
import { useLocale } from '@/lib/i18n/use-locale';
import { DocsCompactMenu } from './DocsCompactMenu';
import { DocsConfiguredIcon } from './DocsConfiguredIcon';
import { DocsMainColumn } from './DocsMainColumn';
import { DocsSearchDialog } from './DocsSearchDialog';
import { DocsSearchDialogHydrated } from './DocsSearchDialogHydrated';
import { DocsSidebar } from './DocsSidebar';
import { DocsTocRail } from './DocsTocRail';
import { DocsTableOfContentsHydrated } from './DocsTableOfContentsHydrated';

const MobileSidebarSheet = lazy(() =>
  import('./MobileSidebarSheet').then((module) => ({
    default: module.MobileSidebarSheet,
  })),
);

function shouldRenderLightweightPrerenderShell() {
  return process.env.TSS_PRERENDERING === 'true';
}

export type LocaleLink = {
  href: string;
  isActive: boolean;
  locale: AppLocale;
};

export function getDocsSidebarResetKey(
  activeTab: string,
  sidebarHeader?: DocsSidebarHeader,
) {
  if (!sidebarHeader) {
    return activeTab;
  }

  return [
    activeTab,
    sidebarHeader.title,
    sidebarHeader.backHref,
    sidebarHeader.versionSwitcher?.currentId ?? '',
  ].join('\0');
}

export function DocsShell({
  activePath,
  activeTab,
  children,
  contentPath,
  localeLinks,
  locale,
  previous,
  next,
  sidebar,
  sidebarHeader,
  tabs = [],
  toc,
  layoutMode = 'docs',
}: {
  activePath: string;
  activeTab: string;
  children: React.ReactNode;
  contentPath?: string;
  layoutMode?: 'docs' | 'openapi';
  localeLinks: LocaleLink[];
  locale: string;
  next?: { title: string; url: string };
  previous?: { title: string; url: string };
  sidebar: DocsSidebarNode[];
  sidebarHeader?: DocsSidebarHeader;
  tabs?: TabSummary[];
  toc: TOCItemType[];
}) {
  const { i18n } = useTranslation('common');
  const currentLocale = normalizeLocale(locale) ?? DEFAULT_LOCALE;
  const shouldUseLightweightPrerenderShell =
    shouldRenderLightweightPrerenderShell();
  const resolvedTabs =
    tabs.length > 0 ? tabs : getDefaultDocsTabs(currentLocale);
  const t = i18n.getFixedT(currentLocale, 'common');
  const { resolvedTheme, setTheme } = useTheme();
  const navigate = useNavigate();
  const { setLocale } = useLocale();
  const isDarkTheme = resolvedTheme === 'dark';
  const themeLabel = `${t('controls.theme.label')}: ${
    isDarkTheme ? t('controls.theme.dark') : t('controls.theme.light')
  }`;
  const shouldRenderInlineSearchDialog = import.meta.env.MODE === 'test';
  const headerRef = useRef<HTMLElement | null>(null);
  const [headerOffset, setHeaderOffset] = useState(0);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const [resolvedSidebar, setResolvedSidebar] = useState(sidebar);
  const sidebarResetKey = getDocsSidebarResetKey(activeTab, sidebarHeader);
  const shouldDeferToc = Boolean(
    contentPath &&
      (isDeferredOrdinaryApiReferenceContentPath(contentPath) ||
        (contentPath.split('/')[1] === 'api-reference' &&
          contentPath.split('/')[2] === 'rtc' &&
          contentPath.split('/')[3] === 'android')),
  );

  useLayoutEffect(() => {
    const node = headerRef.current;
    if (!node) {
      return;
    }

    const updateHeaderOffset = () => {
      setHeaderOffset(Math.ceil(node.getBoundingClientRect().height));
    };

    updateHeaderOffset();

    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(updateHeaderOffset)
        : null;
    resizeObserver?.observe(node);
    window.addEventListener('resize', updateHeaderOffset);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', updateHeaderOffset);
    };
  }, []);

  const shellOffsetStyle = {
    '--docs-shell-header-offset': `${headerOffset}px`,
    '--docs-shell-body-height': `calc(100svh - ${headerOffset}px)`,
  } as React.CSSProperties;
  const isOpenApiLayout = layoutMode === 'openapi';
  const shouldUseLightweightApiSidebar =
    import.meta.env.MODE !== 'test' &&
    contentPath !== undefined &&
    isApiReferenceContentPath(contentPath);
  const shouldHydrateDeferredSidebar =
    contentPath !== undefined && isSidebarDeferredContentPath(contentPath);

  useEffect(() => {
    setResolvedSidebar(sidebar);
  }, [sidebar]);

  useEffect(() => {
    if (!shouldHydrateDeferredSidebar || sidebar.length > 0) {
      return;
    }

    const localeSegment = activePath.split('/')[1];
    const tabSegment = activePath.split('/')[2];
    const slugSegments = activePath.split('/').slice(3).filter(Boolean);
    let cancelled = false;

    void getDocsPagePayload({
      data: {
        includeSidebar: true,
        locale: localeSegment,
        slugSegments,
        tab: tabSegment,
      },
    }).then((payload) => {
      if (cancelled || !payload || 'redirectUrl' in payload) {
        return;
      }

      setResolvedSidebar(payload.sidebar);
    });

    return () => {
      cancelled = true;
    };
  }, [activePath, shouldHydrateDeferredSidebar, sidebar]);

  return (
    <SidebarProvider
      className="block min-h-screen bg-background text-foreground"
      style={shellOffsetStyle}
    >
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header
          className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl"
          ref={headerRef}
        >
          <nav aria-label="Alternate sites" className="sr-only">
            {localeLinks.map((item) => (
              <a
                aria-current={item.isActive ? 'page' : undefined}
                href={item.href}
                hrefLang={item.locale}
                key={item.locale}
              >
                {item.locale}
              </a>
            ))}
          </nav>
          <div
            className="mx-auto flex h-[52px] w-full max-w-[1440px] items-center gap-3 px-4 sm:px-7"
            data-testid="docs-main-header-row"
          >
            <div className="flex min-w-0 items-center gap-3">
              <Sheet
                open={isMobileSheetOpen}
                onOpenChange={setIsMobileSheetOpen}
              >
                {shouldUseLightweightPrerenderShell ? (
                  <DocsPrerenderMobileMenuTrigger label={t('docs.openMenu')} />
                ) : (
                  <>
                    <SheetTrigger asChild>
                      <Button className="lg:hidden" size="icon" variant="ghost">
                        <MenuIcon />
                        <span className="sr-only">{t('docs.openMenu')}</span>
                      </Button>
                    </SheetTrigger>
                    <SheetContent
                      className="w-[88vw] max-w-sm gap-0 p-0"
                      side="left"
                    >
                      <SheetHeader className="border-b">
                        <SheetTitle>{t('app.name')}</SheetTitle>
                        <SheetDescription className="sr-only">
                          {t('docs.openMenu')}
                        </SheetDescription>
                      </SheetHeader>
                      {isMobileSheetOpen ? (
                        <Suspense fallback={null}>
                          <MobileSidebarSheet
                            activePath={activePath}
                            activeTab={activeTab}
                            currentLocale={currentLocale}
                            isDarkTheme={isDarkTheme}
                            localeLinks={localeLinks}
                            onSelectLocale={async (nextLocale) => {
                              await setLocale(nextLocale);
                              setIsMobileSheetOpen(false);
                              await navigate({
                                to:
                                  localeLinks.find(
                                    (item) => item.locale === nextLocale,
                                  )?.href ??
                                  replaceDocLocale(activePath, nextLocale),
                              });
                            }}
                            onSelectPath={() => setIsMobileSheetOpen(false)}
                            sidebar={resolvedSidebar}
                            sidebarHeader={sidebarHeader}
                            themeLabel={themeLabel}
                            tabs={resolvedTabs}
                            toggleTheme={() => {
                              setTheme(isDarkTheme ? 'light' : 'dark');
                              setIsMobileSheetOpen(false);
                            }}
                          />
                        </Suspense>
                      ) : null}
                    </SheetContent>
                  </>
                )}
              </Sheet>
              <div className="flex min-w-0 items-center gap-2.5">
                <Link
                  className="flex min-w-0 items-center text-[15px] font-semibold text-[color:var(--ink-1)]"
                  to="/"
                >
                  <span className="truncate">{t('app.name')}</span>
                </Link>
              </div>
            </div>
            <div className="flex-1" />
            <div className="flex items-center gap-2">
              <div
                className="lg:hidden"
                data-testid="docs-mobile-header-actions"
              >
                {shouldUseLightweightPrerenderShell ? (
                  <DocsPrerenderSearchTrigger
                    label={t('docs.searchPlaceholder')}
                    mode="mobile"
                  />
                ) : shouldRenderInlineSearchDialog ? (
                    <DocsSearchDialog
                      locale={currentLocale}
                      mode="mobile"
                      tabs={resolvedTabs}
                    />
                  ) : (
                    <DocsSearchDialogHydrated
                      locale={currentLocale}
                      mode="mobile"
                      tabs={resolvedTabs}
                    />
                  )}
              </div>
              <div
                className="hidden items-center gap-2 lg:flex"
                data-testid="docs-desktop-header-actions"
              >
                <div className="w-80">
                  {shouldUseLightweightPrerenderShell ? (
                    <DocsPrerenderSearchTrigger
                      label={t('docs.searchPlaceholder')}
                      mode="desktop"
                    />
                  ) : shouldRenderInlineSearchDialog ? (
                    <DocsSearchDialog
                      locale={currentLocale}
                      mode="desktop"
                      tabs={resolvedTabs}
                    />
                  ) : (
                    <DocsSearchDialogHydrated
                      locale={currentLocale}
                      mode="desktop"
                      tabs={tabs}
                    />
                  )}
                </div>
                {shouldUseLightweightPrerenderShell ? (
                  <DocsPrerenderSiteSwitcher
                    currentLocale={currentLocale}
                    localeLinks={localeLinks}
                  />
                ) : (
                  <LocaleSwitcher
                    currentLocale={currentLocale}
                    localeLinks={localeLinks}
                    onSelect={async (nextLocale) => {
                      await setLocale(nextLocale);
                      await navigate({
                        to:
                          localeLinks.find((item) => item.locale === nextLocale)
                            ?.href ?? replaceDocLocale(activePath, nextLocale),
                      });
                    }}
                    variant="desktop"
                  />
                )}
                {shouldUseLightweightPrerenderShell ? (
                  <>
                    <DocsPrerenderThemeTrigger
                      isDarkTheme={isDarkTheme}
                      label={themeLabel}
                    />
                    <DocsPrerenderGithubLink />
                  </>
                ) : (
                  <>
                    <Button
                      aria-label={themeLabel}
                      aria-pressed={isDarkTheme}
                      className="hidden text-[color:var(--ink-3)] hover:bg-[color:var(--docs-soft-fill)] hover:text-[color:var(--ink-1)] dark:hover:bg-[color:var(--docs-soft-fill)] lg:inline-flex lg:size-[34px] lg:rounded-lg"
                      onClick={() => setTheme(isDarkTheme ? 'light' : 'dark')}
                      size="icon"
                      type="button"
                      variant="ghost"
                    >
                      {isDarkTheme ? <SunIcon /> : <MoonIcon />}
                      <span className="sr-only">{themeLabel}</span>
                    </Button>
                    <Button
                      aria-label="GitHub"
                      asChild
                      className="hidden text-[color:var(--ink-3)] hover:bg-[color:var(--docs-soft-fill)] hover:text-[color:var(--ink-1)] dark:hover:bg-[color:var(--docs-soft-fill)] lg:inline-flex lg:size-[34px] lg:rounded-lg"
                      size="icon"
                      variant="ghost"
                    >
                      <a
                        href="https://github.com/Shengwang-Community/docs-portal"
                        rel="noreferrer"
                        target="_blank"
                      >
                        <GithubMarkIcon />
                      </a>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
          {shouldUseLightweightPrerenderShell ? (
            <DocsPrerenderTabsStrip
              activeTab={activeTab}
              tabs={resolvedTabs}
            />
          ) : (
            <nav
              className="hidden border-b border-border bg-background/80 backdrop-blur-xl md:block"
              data-testid="docs-tabs-strip"
            >
              <div className="mx-auto flex h-10 w-full max-w-[1440px] justify-start px-4 sm:px-6">
                <Tabs className="w-auto max-w-full" value={activeTab}>
                  <TabsList
                    className="max-w-full justify-start gap-0 overflow-visible px-0"
                    variant="line"
                  >
                    {resolvedTabs.map((tab) => (
                      <TabsTrigger asChild key={tab.id} value={tab.id}>
                        <Link
                          className="h-10 rounded-none px-3.5 text-[13.5px] font-medium after:!bottom-[-3px] data-[state=active]:font-semibold"
                          params={{}}
                          search={{}}
                          to={tab.url}
                        >
                          {tab.icon ? (
                            <span className="docs-tab-icon">
                              <DocsConfiguredIcon
                                className="size-3.5"
                                icon={tab.icon}
                              />
                            </span>
                          ) : null}
                          {tab.title}
                        </Link>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>
            </nav>
          )}
        </header>
        <div
          className={cn(
            'mx-auto grid w-full max-w-[1440px] min-w-0 grid-cols-1 px-4 lg:h-[var(--docs-shell-body-height)] lg:min-h-0 lg:grid-cols-[256px_minmax(0,1fr)] lg:overflow-hidden',
            isOpenApiLayout
              ? 'xl:grid-cols-[256px_minmax(0,1fr)]'
              : 'xl:grid-cols-[256px_minmax(0,1fr)_220px]',
          )}
          data-testid="docs-body-shell"
        >
          {shouldUseLightweightApiSidebar ? (
            <ClientOnly
              fallback={
                <DocsSidebarPrerenderFallback
                  activePath={activePath}
                  header={sidebarHeader}
                  nodes={resolvedSidebar}
                />
              }
            >
              <DocsSidebar
                activePath={activePath}
                header={sidebarHeader}
                nodes={resolvedSidebar}
                onSelectPath={() => setIsMobileSheetOpen(false)}
                resetKey={sidebarResetKey}
              />
            </ClientOnly>
          ) : (
            <DocsSidebar
              activePath={activePath}
              header={sidebarHeader}
              nodes={resolvedSidebar}
              onSelectPath={() => setIsMobileSheetOpen(false)}
              resetKey={sidebarResetKey}
            />
          )}
          <DocsMainColumn
            layoutMode={layoutMode}
            locale={currentLocale}
            next={next}
            previous={previous}
          >
            {children}
          </DocsMainColumn>
          {isOpenApiLayout ? null : (
            shouldDeferToc && contentPath ? (
              <DocsTocRail locale={currentLocale} toc={[]}>
                <DocsTableOfContentsHydrated
                  contentPath={contentPath}
                  locale={currentLocale}
                  toc={toc}
                />
              </DocsTocRail>
            ) : (
              <DocsTocRail locale={currentLocale} toc={toc} />
            )
          )}
        </div>
      </div>
    </SidebarProvider>
  );
}

function DocsSidebarPrerenderFallback({
  activePath,
  header,
  nodes,
}: {
  activePath: string;
  header?: DocsSidebarHeader;
  nodes: DocsSidebarNode[];
}) {
  return (
    <aside
      className="hidden h-full min-h-0 overflow-hidden border-r border-[color:var(--line-soft)] lg:flex"
      data-testid="docs-sidebar-prerender-fallback"
    >
      <div className="docs-scrollbar h-full min-h-0 overflow-y-auto pr-3">
        <div className="flex flex-col gap-4 py-6 pb-12">
          {header ? (
            <div className="flex flex-col gap-2 border-b border-[color:var(--line-soft)] pb-4">
              <a
                className="text-xs font-medium text-[color:var(--ink-4)] transition-colors hover:text-[color:var(--ink-2)]"
                href={header.backHref}
              >
                {header.backLabel}
              </a>
              <div className="text-sm font-semibold text-[color:var(--ink-1)]">
                {header.title}
              </div>
            </div>
          ) : null}
          <nav aria-label="Section navigation">
            <ul className="flex flex-col gap-1 text-sm">
              {nodes.map((node) => (
                <DocsSidebarPrerenderFallbackNode
                  activePath={activePath}
                  key={node.id}
                  node={node}
                />
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </aside>
  );
}

function DocsPrerenderSearchTrigger({
  label,
  mode = 'desktop',
}: {
  label: string;
  mode?: 'desktop' | 'mobile';
}) {
  if (mode === 'mobile') {
    return (
      <span
        aria-label={label}
        className="inline-flex size-9 items-center justify-center rounded-md"
        data-testid="docs-prerender-search-trigger-mobile"
      >
        <SearchIcon />
      </span>
    );
  }

  return (
    <span
      aria-label={label}
      className="inline-flex h-8 w-full items-center gap-1.5 rounded-md border border-[color:var(--line-soft)] px-3 text-sm text-muted-foreground"
      data-testid="docs-prerender-search-trigger-desktop"
    >
      <SearchIcon data-icon="inline-start" />
      <span>{label}</span>
      <kbd className="ml-auto">⌘K</kbd>
    </span>
  );
}

function DocsPrerenderThemeTrigger({
  isDarkTheme,
  label,
}: {
  isDarkTheme: boolean;
  label: string;
}) {
  return (
    <span
      className="hidden text-[color:var(--ink-3)] lg:inline-flex lg:size-[34px] lg:items-center lg:justify-center lg:rounded-lg"
      data-testid="docs-prerender-theme-trigger"
      title={label}
    >
      {isDarkTheme ? <SunIcon /> : <MoonIcon />}
      <span className="sr-only">{label}</span>
    </span>
  );
}

function DocsPrerenderGithubLink() {
  return (
    <a
      aria-label="GitHub"
      className="hidden text-[color:var(--ink-3)] lg:inline-flex lg:size-[34px] lg:items-center lg:justify-center lg:rounded-lg"
      data-testid="docs-prerender-github-link"
      href="https://github.com/Shengwang-Community/docs-portal"
      rel="noreferrer"
      target="_blank"
    >
      <GithubMarkIcon />
    </a>
  );
}

function DocsPrerenderMobileMenuTrigger({ label }: { label: string }) {
  return (
    <Button
      aria-label={label}
      className="lg:hidden"
      data-testid="docs-prerender-mobile-menu-trigger"
      size="icon"
      type="button"
      variant="ghost"
    >
      <MenuIcon />
      <span className="sr-only">{label}</span>
    </Button>
  );
}

function DocsPrerenderSiteSwitcher({
  currentLocale,
  localeLinks,
}: {
  currentLocale: AppLocale;
  localeLinks: LocaleLink[];
}) {
  const { i18n } = useTranslation('common');
  const t = i18n.getFixedT(currentLocale, 'common');

  return (
    <nav
      aria-label={t('controls.site.label')}
      className="flex items-center gap-2"
      data-testid="docs-prerender-site-switcher"
    >
      {localeLinks.map((item) => (
        <a
          aria-current={item.isActive ? 'page' : undefined}
          className={cn(
            'inline-flex h-8 items-center rounded-md px-2.5 text-[13px] text-muted-foreground',
            item.isActive && 'font-medium text-foreground',
          )}
          href={item.href}
          hrefLang={item.locale}
          key={item.locale}
        >
          {t(`controls.site.current.${item.locale}`)}
        </a>
      ))}
    </nav>
  );
}

function DocsPrerenderTabsStrip({
  activeTab,
  tabs,
}: {
  activeTab: string;
  tabs: TabSummary[];
}) {
  return (
    <nav
      className="hidden border-b border-border bg-background/80 backdrop-blur-xl md:block"
      data-testid="docs-tabs-strip"
    >
      <div className="mx-auto flex h-10 w-full max-w-[1440px] items-center gap-1 overflow-x-auto px-4 sm:px-6">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;

          return (
            <a
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'inline-flex h-10 shrink-0 items-center gap-1.5 border-b-2 border-transparent px-3.5 text-[13.5px] font-medium text-[color:var(--ink-3)]',
                isActive && 'border-[color:var(--accent-brand)] font-semibold text-[color:var(--ink-1)]',
              )}
              href={tab.url}
              key={tab.id}
            >
              {tab.icon ? (
                <span className="docs-tab-icon">
                  <DocsConfiguredIcon className="size-3.5" icon={tab.icon} />
                </span>
              ) : null}
              {tab.title}
            </a>
          );
        })}
      </div>
    </nav>
  );
}

function DocsSidebarPrerenderFallbackNode({
  activePath,
  node,
}: {
  activePath: string;
  node: DocsSidebarNode;
}) {
  if (node.type === 'page') {
    const isActive = node.url === activePath;

    return (
      <li>
        <a
          aria-current={isActive ? 'page' : undefined}
          className={cn(
            'block rounded-md px-3 py-2 leading-5 transition-colors',
            isActive
              ? 'bg-[color:var(--accent-brand-soft)] font-medium text-[color:var(--accent-brand)]'
              : 'text-[color:var(--ink-3)] hover:bg-[color:var(--docs-soft-fill)] hover:text-[color:var(--ink-1)]',
          )}
          href={node.url}
        >
          {node.title}
        </a>
      </li>
    );
  }

  return (
    <li className="flex flex-col gap-1">
      <div className="px-3 pt-3 pb-1 text-[11px] font-semibold tracking-[0.08em] text-[color:var(--ink-4)] uppercase">
        {node.title}
      </div>
      <ul className="flex flex-col gap-1">
        {node.children.map((child) => (
          <DocsSidebarPrerenderFallbackNode
            activePath={activePath}
            key={child.id}
            node={child}
          />
        ))}
      </ul>
    </li>
  );
}

function GithubMarkIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M12 2.25A9.75 9.75 0 0 0 8.92 21.26c.49.09.67-.21.67-.47v-1.68c-2.73.59-3.31-1.16-3.31-1.16-.45-1.14-1.09-1.44-1.09-1.44-.89-.61.07-.6.07-.6.98.07 1.5 1.01 1.5 1.01.88 1.49 2.3 1.06 2.86.81.09-.63.34-1.06.62-1.31-2.18-.25-4.48-1.09-4.48-4.85 0-1.07.38-1.95 1.01-2.64-.1-.25-.44-1.25.1-2.6 0 0 .83-.26 2.69 1.01A9.36 9.36 0 0 1 12 7.01c.83 0 1.65.11 2.43.33 1.86-1.27 2.68-1.01 2.68-1.01.54 1.35.2 2.35.1 2.6.63.69 1.01 1.57 1.01 2.64 0 3.77-2.3 4.6-4.49 4.84.35.3.67.91.67 1.83v2.55c0 .26.18.56.68.47A9.75 9.75 0 0 0 12 2.25Z" />
    </svg>
  );
}

export function LocaleSwitcher({
  currentLocale,
  localeLinks,
  onSelect,
  variant = 'all',
}: {
  currentLocale: AppLocale;
  localeLinks: LocaleLink[];
  onSelect: (locale: AppLocale) => Promise<void>;
  variant?: 'all' | 'desktop' | 'mobile';
}) {
  const { i18n } = useTranslation('common');
  const t = i18n.getFixedT(currentLocale, 'common');

  return (
    <>
      {variant !== 'mobile' ? (
        <DocsCompactMenu
          align="end"
          ariaLabel={t('controls.site.label')}
          panelClassName="w-48 p-1"
          button={({
            'aria-controls': ariaControls,
            'aria-expanded': ariaExpanded,
            onClick,
          }) => (
            <Button
              aria-controls={ariaControls}
              aria-expanded={ariaExpanded}
              aria-label={t('controls.site.label')}
              className="h-8 gap-1.5 rounded-md border border-transparent px-2.5 text-[13px] text-muted-foreground hover:border-border hover:bg-accent hover:text-accent-foreground"
              onClick={onClick}
              size="sm"
              variant="ghost"
            >
              <LanguagesIcon data-icon="inline-start" />
              <span>{t(`controls.site.current.${currentLocale}`)}</span>
              <ChevronDownIcon aria-hidden="true" className="opacity-60" />
            </Button>
          )}
        >
          <p className="px-2.5 py-2 text-xs leading-5 text-muted-foreground">
            {t('controls.site.description')}
          </p>
          <LocaleOptions
            currentLocale={currentLocale}
            localeLinks={localeLinks}
            onSelect={onSelect}
            scopeKey="desktop"
          />
        </DocsCompactMenu>
      ) : null}
      {variant !== 'desktop' ? (
        <DocsCompactMenu
          ariaLabel={t('controls.site.label')}
          panelClassName="w-48 p-1"
          button={({
            'aria-controls': ariaControls,
            'aria-expanded': ariaExpanded,
            onClick,
          }) => (
            <Button
              aria-controls={ariaControls}
              aria-expanded={ariaExpanded}
              aria-label={t('controls.site.label')}
              className="data-[state=open]:bg-accent data-[state=open]:text-accent-foreground"
              onClick={onClick}
              size="icon"
              variant="ghost"
            >
              <LanguagesIcon />
            </Button>
          )}
        >
          <p className="px-2.5 py-2 text-xs leading-5 text-muted-foreground">
            {t('controls.site.description')}
          </p>
          <LocaleOptions
            currentLocale={currentLocale}
            localeLinks={localeLinks}
            onSelect={onSelect}
            scopeKey="mobile"
          />
        </DocsCompactMenu>
      ) : null}
    </>
  );
}

function LocaleOptions({
  currentLocale,
  localeLinks,
  onSelect,
  scopeKey,
}: {
  currentLocale: AppLocale;
  localeLinks: LocaleLink[];
  onSelect: (locale: AppLocale) => Promise<void>;
  scopeKey: string;
}) {
  const { i18n } = useTranslation('common');
  const t = i18n.getFixedT(currentLocale, 'common');

  return (
    <div className="flex flex-col">
      {SUPPORTED_LOCALES.map((locale) => {
        const isActive = currentLocale === locale;
        const href =
          localeLinks.find((item) => item.locale === locale)?.href ??
          replaceDocLocale('/', locale);
        const label = t(`controls.site.options.${locale}`);

        return (
          <a
            aria-current={isActive ? 'page' : undefined}
            className="flex min-h-8 items-center justify-between rounded-md px-2.5 text-[13px] hover:bg-accent hover:text-accent-foreground"
            href={href}
            hrefLang={locale}
            key={`${scopeKey}-${locale}`}
            onClick={(event) => {
              event.preventDefault();
              void onSelect(locale);
            }}
          >
            <span className="min-w-0 truncate">{label}</span>
            {isActive ? <CheckIcon className="opacity-80" /> : null}
          </a>
        );
      })}
    </div>
  );
}
