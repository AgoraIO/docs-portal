'use client';

import { Link } from '@tanstack/react-router';
import type { TOCItemType } from 'fumadocs-core/toc';
import {
  CheckIcon,
  ChevronDownIcon,
  MenuIcon,
  MoonIcon,
  SunIcon,
  XIcon,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import type { DocsLayoutMode } from '@/lib/docs-layout';
import type { DocsSidebarHeader } from '@/lib/docs-nav-scope';
import { buildDocPath } from '@/lib/docs-routing';
import type { SearchEntry } from '@/lib/docs-search';
import type {
  DocsSidebarNode,
  ProductScope,
  TabSummary,
} from '@/lib/docs-tree';
import {
  type AppLocale,
  DEFAULT_LOCALE,
  normalizeLocale,
} from '@/lib/i18n/i18n-config';
import { legacyDocsBannerConfig } from '@/lib/shared';
import { AgoraLogoMark } from './AgoraLogoMark';
import { DocsConfiguredIcon } from './DocsConfiguredIcon';
import { DocsMainColumn } from './DocsMainColumn';
import { DocsSearchDialog } from './DocsSearchDialog';
import { DocsSidebar } from './DocsSidebar';
import { DocsSidebarHeaderBlock } from './DocsSidebarHeaderBlock';
import { DocsSiteFooter } from './DocsSiteFooter';
import { DocsTocRail } from './DocsTocRail';
import { getDocsSourceLinks } from './docs-source-links';

const DOCS_SHELL_MAX_WIDTH_CLASS_NAME =
  'max-w-[calc(256px+var(--content-max)+5rem+220px+2rem)]';
const DOCS_DESKTOP_GRID_CLASS_NAME =
  'xl:grid-cols-[256px_fit-content(calc(var(--content-max)+5rem))_220px]';
const DOCS_FILL_DESKTOP_GRID_CLASS_NAME = 'xl:grid-cols-[256px_minmax(0,1fr)]';
const ENABLED_DOCS_CHROME_LOCALES = new Set<AppLocale>([DEFAULT_LOCALE]);
export const LEGACY_DOCS_BANNER_DISMISSED_STORAGE_KEY =
  'agora-docs:legacy-docs-banner-dismissed';
const LEGACY_DOCS_BANNER_DISMISSED_STORAGE_VALUE = 'true';
const mobileSidebarGroupLabelClassName =
  'px-1 pb-0.5 text-xs font-medium uppercase leading-4 tracking-[0.14em] text-muted-foreground';
const mobilePageLinkClassName =
  'relative flex min-h-10 w-full min-w-0 max-w-full items-start gap-2 overflow-hidden rounded-md px-3 py-2.5 text-left text-sm leading-5 transition-colors before:absolute before:left-1 before:top-1/2 before:h-4 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:bg-transparent hover:bg-[color:var(--docs-soft-fill)] hover:text-[color:var(--ink-1)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 [&>span:first-child]:min-w-0 [&>span:first-child]:flex-1 [&>span:first-child]:break-words [&>span:first-child]:whitespace-normal [&>span:first-child]:[overflow-wrap:anywhere]';
const mobileActivePageLinkClassName =
  'bg-[color:var(--accent-brand-soft)] font-semibold text-[color:var(--accent-brand)] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--accent-brand)_22%,transparent)] before:bg-[color:var(--accent-brand)]';
const mobileInactivePageLinkClassName = 'text-muted-foreground';
const mobileSectionLabelClassName =
  'mt-4 flex min-w-0 max-w-full rounded-md px-2 py-1 text-xs font-semibold uppercase leading-4 tracking-[0.08em] text-muted-foreground [overflow-wrap:anywhere] data-[active=true]:text-[color:var(--ink-2)] [&>span]:min-w-0 [&>span]:break-words [&>span]:whitespace-normal [&>span]:[overflow-wrap:anywhere]';
const mobileSidebarNestedListClassNames = [
  'ml-2 flex min-w-0 max-w-full flex-col gap-1 border-l border-border/70 pl-2',
  'ml-1 flex min-w-0 max-w-full flex-col gap-1 border-l border-border/70 pl-2',
  'ml-0 flex min-w-0 max-w-full flex-col gap-1 border-l border-border/70 pl-2',
] as const;

type LocaleLink = {
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

function isLegacyDocsBannerDismissed() {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    return (
      window.localStorage.getItem(LEGACY_DOCS_BANNER_DISMISSED_STORAGE_KEY) ===
      LEGACY_DOCS_BANNER_DISMISSED_STORAGE_VALUE
    );
  } catch {
    return false;
  }
}

export function DocsShell({
  activePath,
  activeTab,
  children,
  contentPath,
  loadPages,
  localeLinks,
  locale,
  previous,
  next,
  productScopes,
  sidebar,
  sidebarHeader,
  tabs,
  toc,
  layoutMode = 'docs',
  hideToc = false,
}: {
  activePath: string;
  activeTab: string;
  children: React.ReactNode;
  contentPath?: string;
  loadPages: () => Promise<SearchEntry[]>;
  layoutMode?: DocsLayoutMode;
  hideToc?: boolean;
  localeLinks: LocaleLink[];
  locale: string;
  next?: { title: string; url: string };
  previous?: { title: string; url: string };
  productScopes?: ProductScope[];
  sidebar: DocsSidebarNode[];
  sidebarHeader?: DocsSidebarHeader;
  tabs: TabSummary[];
  toc: TOCItemType[];
}) {
  const { i18n } = useTranslation('common');
  const currentLocale = normalizeLocale(locale) ?? DEFAULT_LOCALE;
  const sourceLinks = getDocsSourceLinks(contentPath);
  const t = i18n.getFixedT(currentLocale, 'common');
  const { resolvedTheme, setTheme } = useTheme();
  const isDarkTheme = resolvedTheme === 'dark';
  const themeLabel = `${t('controls.theme.label')}: ${
    isDarkTheme ? t('controls.theme.dark') : t('controls.theme.light')
  }`;
  const headerRef = useRef<HTMLElement | null>(null);
  const [headerOffset, setHeaderOffset] = useState(0);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const [isLegacyDocsBannerVisible, setIsLegacyDocsBannerVisible] =
    useState(true);
  const sidebarResetKey = getDocsSidebarResetKey(activeTab, sidebarHeader);
  const homeHref = buildDocPath(currentLocale, 'introduction');
  const legacyDocsHref = legacyDocsBannerConfig.hrefs[currentLocale];
  const dismissLegacyDocsBannerLabel = t('docs.dismissLegacyDocsBanner');

  useEffect(() => {
    if (isLegacyDocsBannerDismissed()) {
      setIsLegacyDocsBannerVisible(false);
    }
  }, []);

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

  const dismissLegacyDocsBanner = () => {
    setIsLegacyDocsBannerVisible(false);

    try {
      window.localStorage.setItem(
        LEGACY_DOCS_BANNER_DISMISSED_STORAGE_KEY,
        LEGACY_DOCS_BANNER_DISMISSED_STORAGE_VALUE,
      );
    } catch {
      // The in-memory state still dismisses the banner when storage is blocked.
    }
  };

  const shellOffsetStyle = {
    '--docs-shell-header-offset': `${headerOffset}px`,
    '--docs-shell-body-height': `calc(100svh - ${headerOffset}px)`,
  } as React.CSSProperties;
  const isOpenApiLayout = layoutMode === 'openapi';
  // openapi and hideToc drop the toc rail and let content fill the grid; every
  // layout shares the same outer shell footprint so the sidebar/nav/content
  // align across page types.
  const contentFillsWidth = isOpenApiLayout || hideToc;
  const shellWidthClassName = DOCS_SHELL_MAX_WIDTH_CLASS_NAME;
  const desktopGridClassName = contentFillsWidth
    ? DOCS_FILL_DESKTOP_GRID_CLASS_NAME
    : DOCS_DESKTOP_GRID_CLASS_NAME;
  const docsChromeLocaleLinks = localeLinks.filter((item) =>
    ENABLED_DOCS_CHROME_LOCALES.has(item.locale),
  );

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
          {docsChromeLocaleLinks.length > 1 ? (
            <nav aria-label="Alternate languages" className="sr-only">
              {docsChromeLocaleLinks.map((item) => (
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
          ) : null}
          {isLegacyDocsBannerVisible ? (
            <div className="flex w-full items-center gap-2 border-b border-[color:color-mix(in_srgb,var(--accent-brand)_22%,transparent)] bg-[color:var(--accent-brand-soft)] px-2 py-1.5 sm:px-4">
              <a
                className="min-w-0 flex-1 whitespace-normal break-words px-2 py-0.5 text-center text-sm font-medium leading-5 text-[color:var(--accent-brand)] underline-offset-4 [overflow-wrap:anywhere] hover:underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                data-testid="legacy-docs-banner"
                href={legacyDocsHref}
                rel="noreferrer"
                target="_blank"
              >
                {t('docs.legacyDocsBanner')}
                <span className="sr-only"> ({t('docs.opensInNewTab')})</span>
              </a>
              <Button
                aria-label={dismissLegacyDocsBannerLabel}
                className="text-[color:var(--accent-brand)] hover:bg-[color:color-mix(in_srgb,var(--accent-brand)_12%,transparent)] hover:text-[color:var(--accent-brand)]"
                onClick={dismissLegacyDocsBanner}
                size="icon-xs"
                type="button"
                variant="ghost"
              >
                <XIcon />
                <span className="sr-only">{dismissLegacyDocsBannerLabel}</span>
              </Button>
            </div>
          ) : null}
          <div
            className={cn(
              'mx-auto flex h-[52px] w-full items-center gap-3 px-4 sm:px-7',
              shellWidthClassName,
            )}
            data-testid="docs-main-header-row"
          >
            <div className="flex min-w-0 items-center gap-3">
              <Sheet
                open={isMobileSheetOpen}
                onOpenChange={setIsMobileSheetOpen}
              >
                <SheetTrigger asChild>
                  <Button className="lg:hidden" size="icon" variant="ghost">
                    <MenuIcon />
                    <span className="sr-only">{t('docs.openMenu')}</span>
                  </Button>
                </SheetTrigger>
                <SheetContent
                  className="w-[min(92vw,24rem)] max-w-[calc(100vw-1rem)] gap-0 overflow-hidden p-0 sm:max-w-sm"
                  closeLabel={t('docs.close')}
                  data-testid="docs-mobile-sidebar-sheet"
                  side="left"
                >
                  <SheetHeader className="min-w-0 border-b pr-12">
                    <SheetTitle className="min-w-0">
                      <Link
                        className="inline-flex h-8 max-w-full min-w-0 items-center gap-2 rounded-sm text-[color:var(--ink-1)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                        onClick={() => setIsMobileSheetOpen(false)}
                        params={{}}
                        search={{}}
                        to={homeHref}
                      >
                        <span className="sr-only">{t('app.name')}</span>
                        <AgoraLogoMark
                          aria-hidden="true"
                          className="h-8 shrink-0 translate-y-2"
                        />
                        <span
                          aria-hidden="true"
                          className="truncate text-[15px] font-semibold"
                        >
                          Docs
                        </span>
                      </Link>
                    </SheetTitle>
                    <SheetDescription className="sr-only">
                      {t('docs.openMenu')}
                    </SheetDescription>
                  </SheetHeader>
                  <MobileSidebar
                    activePath={activePath}
                    activeTab={activeTab}
                    currentLocale={currentLocale}
                    isDarkTheme={isDarkTheme}
                    onSelectPath={() => setIsMobileSheetOpen(false)}
                    sidebar={sidebar}
                    sidebarHeader={sidebarHeader}
                    themeLabel={themeLabel}
                    tabs={tabs}
                    toggleTheme={() => {
                      setTheme(isDarkTheme ? 'light' : 'dark');
                      setIsMobileSheetOpen(false);
                    }}
                  />
                </SheetContent>
              </Sheet>
              <div className="flex min-w-0 items-center gap-2.5">
                <Link
                  className="flex h-8 min-w-0 items-center gap-2 text-[15px] font-semibold text-[color:var(--ink-1)]"
                  params={{}}
                  search={{}}
                  to={homeHref}
                >
                  <span className="sr-only">{t('app.name')}</span>
                  <AgoraLogoMark
                    aria-hidden="true"
                    className="h-8 shrink-0 translate-y-2"
                  />
                  <span aria-hidden="true" className="truncate">
                    Docs
                  </span>
                </Link>
              </div>
            </div>
            <div className="flex-1" />
            <div className="flex items-center gap-2">
              <div
                className="lg:hidden"
                data-testid="docs-mobile-header-actions"
              >
                <DocsSearchDialog
                  loadPages={loadPages}
                  locale={currentLocale}
                  mode="mobile"
                  productScopes={productScopes}
                />
              </div>
              <div
                className="hidden items-center gap-2 lg:flex"
                data-testid="docs-desktop-header-actions"
              >
                <div className="w-80">
                  <DocsSearchDialog
                    loadPages={loadPages}
                    locale={currentLocale}
                    mode="desktop"
                    productScopes={productScopes}
                  />
                </div>
                <Button
                  aria-label={themeLabel}
                  aria-pressed={isDarkTheme}
                  className="hidden text-[color:var(--ink-3)] hover:bg-[color:var(--docs-soft-fill)] hover:text-[color:var(--ink-1)] dark:hover:bg-[color:var(--docs-soft-fill)] lg:inline-flex lg:size-[34px] lg:rounded-lg"
                  onClick={() => setTheme(isDarkTheme ? 'light' : 'dark')}
                  size="icon"
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
                    href="https://github.com/AgoraIO/docs-portal"
                    rel="noreferrer"
                    target="_blank"
                  >
                    <GithubMarkIcon />
                  </a>
                </Button>
              </div>
            </div>
          </div>
          <nav
            className="hidden border-b border-border bg-background/80 backdrop-blur-xl md:block"
            data-testid="docs-tabs-strip"
          >
            <div
              className={cn(
                'mx-auto flex h-10 w-full justify-start px-4 sm:px-6',
                shellWidthClassName,
              )}
            >
              <Tabs className="w-auto max-w-full" value={activeTab}>
                <TabsList
                  className="max-w-full justify-start gap-0 overflow-visible px-0"
                  variant="line"
                >
                  {tabs.map((tab) => (
                    <TabsTrigger asChild key={tab.id} value={tab.id}>
                      <Link
                        className="group/tab h-10 rounded-none px-3.5 text-[13.5px] font-medium after:!bottom-[-3px]"
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
                        <span className="grid">
                          <span
                            aria-hidden
                            className="invisible col-start-1 row-start-1 font-semibold"
                          >
                            {tab.title}
                          </span>
                          <span className="col-start-1 row-start-1 group-data-[state=active]/tab:font-semibold">
                            {tab.title}
                          </span>
                        </span>
                      </Link>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </nav>
        </header>
        <div
          className={cn(
            'mx-auto grid w-full min-w-0 grid-cols-1 px-4 lg:grid-cols-[256px_minmax(0,1fr)] lg:items-start',
            shellWidthClassName,
            desktopGridClassName,
          )}
          data-testid="docs-body-shell"
        >
          <DocsSidebar
            activePath={activePath}
            header={sidebarHeader}
            locale={currentLocale}
            nodes={sidebar}
            onSelectPath={() => setIsMobileSheetOpen(false)}
            resetKey={sidebarResetKey}
          />
          <DocsMainColumn
            contentFillsWidth={contentFillsWidth}
            layoutMode={layoutMode}
            locale={currentLocale}
            next={next}
            previous={previous}
            resetKey={activePath}
          >
            {children}
          </DocsMainColumn>
          {contentFillsWidth ? null : (
            <DocsTocRail
              locale={currentLocale}
              sourceLinks={sourceLinks}
              toc={toc}
            />
          )}
        </div>
        <DocsSiteFooter
          className={cn(
            'mx-auto hidden w-full shrink-0 lg:block',
            shellWidthClassName,
          )}
          contentClassName="px-4 sm:px-6 lg:px-10"
          locale={currentLocale}
        />
      </div>
    </SidebarProvider>
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

function MobileSidebar({
  activePath,
  activeTab,
  currentLocale,
  isDarkTheme,
  onSelectPath,
  sidebar,
  sidebarHeader,
  themeLabel,
  tabs,
  toggleTheme,
}: {
  activePath: string;
  activeTab: string;
  currentLocale: AppLocale;
  isDarkTheme: boolean;
  onSelectPath: () => void;
  sidebar: DocsSidebarNode[];
  sidebarHeader?: DocsSidebarHeader;
  themeLabel: string;
  tabs: TabSummary[];
  toggleTheme: () => void;
}) {
  const { i18n } = useTranslation('common');
  const t = i18n.getFixedT(currentLocale, 'common');
  const currentTab = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <ScrollArea
        className="min-h-0 min-w-0 flex-1 overflow-hidden px-3 py-4 sm:px-4"
        data-testid="docs-mobile-sidebar-scroll"
      >
        <div className="flex min-w-0 max-w-full flex-col gap-6 overflow-x-hidden pb-6">
          {currentTab ? (
            <div className="flex min-w-0 flex-col gap-2">
              <p className={mobileSidebarGroupLabelClassName}>
                {t('docs.sectionPickerLabel')}
              </p>
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button
                    aria-label={`${t('docs.sectionPickerLabel')}: ${currentTab.title}`}
                    className="h-10 min-w-0 w-full justify-between gap-2 px-3 text-left text-sm font-medium"
                    data-testid="docs-mobile-section-picker"
                    type="button"
                    variant="outline"
                  >
                    <span className="min-w-0 truncate">{currentTab.title}</span>
                    <ChevronDownIcon
                      aria-hidden="true"
                      data-icon="inline-end"
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  aria-label={t('docs.sectionPickerLabel')}
                  className="max-h-72 w-[var(--radix-dropdown-menu-trigger-width)] rounded-lg p-1"
                >
                  <DropdownMenuGroup>
                    {tabs.map((tab) => {
                      const isCurrentTab = tab.id === activeTab;

                      return (
                        <DropdownMenuItem
                          asChild
                          className={cn(
                            'min-h-9 cursor-pointer justify-between rounded-md px-2.5 text-sm',
                            isCurrentTab
                              ? 'font-semibold text-[color:var(--accent-brand)]'
                              : undefined,
                          )}
                          key={tab.id}
                        >
                          <Link
                            aria-current={isCurrentTab ? 'page' : undefined}
                            onClick={onSelectPath}
                            params={{}}
                            search={{}}
                            to={tab.url}
                          >
                            <span className="min-w-0 truncate">
                              {tab.title}
                            </span>
                            {isCurrentTab ? (
                              <CheckIcon
                                aria-hidden="true"
                                className="opacity-80"
                              />
                            ) : null}
                          </Link>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : null}
          <div className="flex min-w-0 flex-col gap-2.5">
            <p className={mobileSidebarGroupLabelClassName}>
              {t('docs.pagesLabel')}
            </p>
            {sidebarHeader ? (
              <DocsSidebarHeaderBlock
                header={sidebarHeader}
                locale={currentLocale}
                mode="mobile"
                onSelectPath={onSelectPath}
              />
            ) : null}
            <div className="flex min-w-0 flex-col gap-1">
              {sidebar.map((node) => (
                <MobileSidebarNode
                  activePath={activePath}
                  depth={0}
                  key={node.id}
                  node={node}
                  onSelectPath={onSelectPath}
                />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2 border-t border-border pt-4">
            <div className="flex items-center gap-2">
              <Button
                aria-label={themeLabel}
                aria-pressed={isDarkTheme}
                onClick={toggleTheme}
                size="icon"
                variant="ghost"
              >
                {isDarkTheme ? <SunIcon /> : <MoonIcon />}
                <span className="sr-only">{themeLabel}</span>
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

function MobileSidebarNode({
  activePath,
  depth,
  node,
  onSelectPath,
}: {
  activePath: string;
  depth: number;
  node: DocsSidebarNode;
  onSelectPath: () => void;
}) {
  if (node.type === 'page') {
    const isActive = node.url === activePath;
    const content = (
      <>
        <span className="block min-w-0 flex-1 break-words whitespace-normal [overflow-wrap:anywhere]">
          {node.title}
        </span>
        {node.method ? (
          <span className="mt-0.5 shrink-0 rounded border border-current/20 px-1.5 py-0.5 font-mono text-[10px] leading-none text-[color:var(--ink-4)]">
            {node.method}
          </span>
        ) : null}
      </>
    );
    const className = cn(
      mobilePageLinkClassName,
      isActive
        ? mobileActivePageLinkClassName
        : mobileInactivePageLinkClassName,
    );

    if (node.external) {
      return (
        <a
          aria-current={isActive ? 'page' : undefined}
          className={className}
          href={node.href ?? node.url}
          onClick={onSelectPath}
          rel="noreferrer noopener"
          target="_blank"
        >
          {content}
        </a>
      );
    }

    return (
      <Link
        aria-current={isActive ? 'page' : undefined}
        className={className}
        onClick={onSelectPath}
        params={{}}
        search={node.search ?? {}}
        to={node.url}
      >
        {content}
      </Link>
    );
  }

  const hasActiveChild = node.children.some((child) =>
    isMobileSidebarNodeActive(child, activePath),
  );

  return (
    <div className="flex min-w-0 max-w-full flex-col gap-1">
      <p
        className={mobileSectionLabelClassName}
        data-active={hasActiveChild ? 'true' : undefined}
      >
        <span>{node.title.replaceAll('-', ' ')}</span>
      </p>
      <div className={getMobileSidebarNestedListClassName(depth)}>
        {node.children.map((child) => (
          <MobileSidebarNode
            activePath={activePath}
            depth={depth + 1}
            key={child.id}
            node={child}
            onSelectPath={onSelectPath}
          />
        ))}
      </div>
    </div>
  );
}

function getMobileSidebarNestedListClassName(depth: number) {
  return mobileSidebarNestedListClassNames[
    Math.min(depth, mobileSidebarNestedListClassNames.length - 1)
  ];
}

function isMobileSidebarNodeActive(
  node: DocsSidebarNode,
  activePath: string,
): boolean {
  if (node.type === 'page') {
    return node.url === activePath;
  }

  return node.children.some((child) =>
    isMobileSidebarNodeActive(child, activePath),
  );
}
