'use client';

import { Link, useNavigate } from '@tanstack/react-router';
import type { TOCItemType } from 'fumadocs-core/toc';
import {
  CheckIcon,
  ChevronDownIcon,
  LanguagesIcon,
  MenuIcon,
  MoonIcon,
  SunIcon,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useLayoutEffect, useRef, useState } from 'react';
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
import { type DocsLayoutMode, isWideDocsLayout } from '@/lib/docs-layout';
import type { DocsSidebarHeader } from '@/lib/docs-nav-scope';
import { replaceDocLocale } from '@/lib/docs-routing';
import type { SearchEntry } from '@/lib/docs-search';
import type { DocsSidebarNode, TabSummary } from '@/lib/docs-tree';
import {
  type AppLocale,
  DEFAULT_LOCALE,
  normalizeLocale,
  SUPPORTED_LOCALES,
} from '@/lib/i18n/i18n-config';
import { useLocale } from '@/lib/i18n/use-locale';
import { DocsConfiguredIcon } from './DocsConfiguredIcon';
import { DocsMainColumn } from './DocsMainColumn';
import { DocsSearchDialog } from './DocsSearchDialog';
import { DocsSidebar } from './DocsSidebar';
import { DocsSidebarHeaderBlock } from './DocsSidebarHeaderBlock';
import { DocsSiteFooter } from './DocsSiteFooter';
import { DocsTocRail } from './DocsTocRail';

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

export function DocsShell({
  activePath,
  activeTab,
  children,
  loadPages,
  localeLinks,
  locale,
  previous,
  next,
  sidebar,
  sidebarHeader,
  tabs,
  toc,
  layoutMode = 'docs',
}: {
  activePath: string;
  activeTab: string;
  children: React.ReactNode;
  loadPages: () => Promise<SearchEntry[]>;
  layoutMode?: DocsLayoutMode;
  localeLinks: LocaleLink[];
  locale: string;
  next?: { title: string; url: string };
  previous?: { title: string; url: string };
  sidebar: DocsSidebarNode[];
  sidebarHeader?: DocsSidebarHeader;
  tabs: TabSummary[];
  toc: TOCItemType[];
}) {
  const { i18n } = useTranslation('common');
  const currentLocale = normalizeLocale(locale) ?? DEFAULT_LOCALE;
  const t = i18n.getFixedT(currentLocale, 'common');
  const { resolvedTheme, setTheme } = useTheme();
  const navigate = useNavigate();
  const { setLocale } = useLocale();
  const isDarkTheme = resolvedTheme === 'dark';
  const themeLabel = `${t('controls.theme.label')}: ${
    isDarkTheme ? t('controls.theme.dark') : t('controls.theme.light')
  }`;
  const headerRef = useRef<HTMLElement | null>(null);
  const [headerOffset, setHeaderOffset] = useState(0);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const sidebarResetKey = getDocsSidebarResetKey(activeTab, sidebarHeader);

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
  const isWideLayout = isWideDocsLayout(layoutMode);
  const docsShellMaxWidthClassName = isWideLayout
    ? 'max-w-[1440px]'
    : 'max-w-[calc(256px+var(--content-max)+5rem+220px+2rem)]';

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
          <nav aria-label="Alternate languages" className="sr-only">
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
            className={cn(
              'mx-auto flex h-[52px] w-full items-center gap-3 px-4 sm:px-7',
              docsShellMaxWidthClassName,
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
                  className="w-[88vw] max-w-sm gap-0 p-0"
                  side="left"
                >
                  <SheetHeader className="border-b">
                    <SheetTitle>{t('app.name')}</SheetTitle>
                    <SheetDescription className="sr-only">
                      {t('docs.openMenu')}
                    </SheetDescription>
                  </SheetHeader>
                  <MobileSidebar
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
                          localeLinks.find((item) => item.locale === nextLocale)
                            ?.href ?? replaceDocLocale(activePath, nextLocale),
                      });
                    }}
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
                <DocsSearchDialog
                  loadPages={loadPages}
                  locale={currentLocale}
                  mode="mobile"
                  tabs={tabs}
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
                    tabs={tabs}
                  />
                </div>
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
                    href="https://github.com/Shengwang-Community/docs-portal"
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
                docsShellMaxWidthClassName,
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
        </header>
        <div
          className={cn(
            'mx-auto grid w-full min-w-0 grid-cols-1 px-4 lg:h-[var(--docs-shell-body-height)] lg:min-h-0 lg:grid-cols-[256px_minmax(0,1fr)] lg:overflow-hidden',
            docsShellMaxWidthClassName,
            isWideLayout
              ? 'xl:grid-cols-[256px_minmax(0,1fr)]'
              : 'xl:grid-cols-[256px_fit-content(calc(var(--content-max)+5rem))_220px]',
          )}
          data-testid="docs-body-shell"
        >
          <DocsSidebar
            activePath={activePath}
            header={sidebarHeader}
            nodes={sidebar}
            onSelectPath={() => setIsMobileSheetOpen(false)}
            resetKey={sidebarResetKey}
          />
          <DocsMainColumn
            layoutMode={layoutMode}
            locale={currentLocale}
            next={next}
            previous={previous}
            resetKey={activePath}
          >
            {children}
          </DocsMainColumn>
          {isWideLayout ? null : (
            <DocsTocRail locale={currentLocale} toc={toc} />
          )}
        </div>
        <DocsSiteFooter
          className={cn(
            'mx-auto hidden w-full shrink-0 lg:block',
            docsShellMaxWidthClassName,
          )}
          contentClassName="px-4 sm:px-6 lg:px-10"
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

function LocaleSwitcher({
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
  const currentSiteLabel =
    currentLocale === 'zh-CN'
      ? t('controls.site.china')
      : t('controls.site.global');

  return (
    <>
      {variant !== 'mobile' ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              aria-label={t('controls.site.label')}
              className="h-8 gap-1.5 rounded-md border border-transparent px-2.5 text-[13px] text-muted-foreground hover:border-border hover:bg-accent hover:text-accent-foreground data-[state=open]:border-border data-[state=open]:bg-accent data-[state=open]:text-accent-foreground"
              size="sm"
              variant="ghost"
            >
              <LanguagesIcon data-icon="inline-start" />
              <span>{currentSiteLabel}</span>
              <ChevronDownIcon aria-hidden="true" className="opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            aria-label={t('controls.site.label')}
            className="w-56 rounded-lg p-1"
          >
            <div className="px-2.5 py-2 text-xs leading-5 text-muted-foreground">
              {t('controls.site.description')}
            </div>
            <LocaleOptions
              currentLocale={currentLocale}
              localeLinks={localeLinks}
              onSelect={onSelect}
              scopeKey="desktop"
            />
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
      {variant !== 'desktop' ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              aria-label={t('controls.site.label')}
              className="data-[state=open]:bg-accent data-[state=open]:text-accent-foreground"
              size="icon"
              variant="ghost"
            >
              <LanguagesIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            aria-label={t('controls.site.label')}
            className="w-56 rounded-lg p-1"
          >
            <div className="px-2.5 py-2 text-xs leading-5 text-muted-foreground">
              {t('controls.site.description')}
            </div>
            <LocaleOptions
              currentLocale={currentLocale}
              localeLinks={localeLinks}
              onSelect={onSelect}
              scopeKey="mobile"
            />
          </DropdownMenuContent>
        </DropdownMenu>
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
    <DropdownMenuGroup>
      {SUPPORTED_LOCALES.map((locale) => {
        const isActive = currentLocale === locale;
        const href =
          localeLinks.find((item) => item.locale === locale)?.href ??
          replaceDocLocale('/', locale);
        const label =
          locale === 'zh-CN'
            ? t('controls.site.china')
            : t('controls.site.global');

        return (
          <DropdownMenuItem
            asChild
            className="min-h-8 cursor-pointer justify-between rounded-md px-2.5 text-[13px]"
            key={`${scopeKey}-${locale}`}
          >
            <a
              aria-current={isActive ? 'page' : undefined}
              href={href}
              hrefLang={locale}
              onClick={(event) => {
                event.preventDefault();
                void onSelect(locale);
              }}
            >
              <span className="min-w-0 truncate">{label}</span>
              {isActive ? <CheckIcon className="opacity-80" /> : null}
            </a>
          </DropdownMenuItem>
        );
      })}
    </DropdownMenuGroup>
  );
}

function MobileSidebar({
  activePath,
  activeTab,
  currentLocale,
  isDarkTheme,
  localeLinks,
  onSelectLocale,
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
  localeLinks: LocaleLink[];
  onSelectLocale: (locale: AppLocale) => Promise<void>;
  onSelectPath: () => void;
  sidebar: DocsSidebarNode[];
  sidebarHeader?: DocsSidebarHeader;
  themeLabel: string;
  tabs: TabSummary[];
  toggleTheme: () => void;
}) {
  const { i18n } = useTranslation('common');
  const t = i18n.getFixedT(currentLocale, 'common');

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ScrollArea className="min-h-0 flex-1 px-4 py-4">
        <div className="flex flex-col gap-6 pb-6">
          <div className="flex flex-col gap-2">
            <p className="px-1 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
              {t('docs.tabsLabel')}
            </p>
            <Tabs className="w-full" value={activeTab}>
              <TabsList
                className="flex h-auto w-full flex-col items-stretch gap-1 bg-transparent p-0"
                variant="line"
              >
                {tabs.map((tab) => (
                  <TabsTrigger asChild key={tab.id} value={tab.id}>
                    <Link
                      className="h-auto justify-start rounded-md px-3 py-2 text-sm"
                      onClick={onSelectPath}
                      params={{}}
                      search={{}}
                      to={tab.url}
                    >
                      {tab.title}
                    </Link>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
          <div className="flex flex-col gap-2">
            <p className="px-1 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
              {t('docs.pagesLabel')}
            </p>
            {sidebarHeader ? (
              <DocsSidebarHeaderBlock
                header={sidebarHeader}
                mode="mobile"
                onSelectPath={onSelectPath}
              />
            ) : null}
            <div className="flex flex-col gap-1">
              {sidebar.map((node) => (
                <MobileSidebarNode
                  activePath={activePath}
                  key={node.id}
                  node={node}
                  onSelectPath={onSelectPath}
                />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2 border-t border-border pt-4">
            <div className="flex items-center gap-2">
              <LocaleSwitcher
                currentLocale={currentLocale}
                localeLinks={localeLinks}
                onSelect={onSelectLocale}
                variant="desktop"
              />
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
  node,
  onSelectPath,
}: {
  activePath: string;
  node: DocsSidebarNode;
  onSelectPath: () => void;
}) {
  if (node.type === 'page') {
    return (
      <Link
        className={`rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent ${
          node.url === activePath
            ? 'bg-accent text-foreground'
            : 'text-muted-foreground'
        }`}
        onClick={onSelectPath}
        params={{}}
        search={{}}
        to={node.url}
      >
        {node.title}
      </Link>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <p className="mt-3 px-3 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
        {node.title.replaceAll('-', ' ')}
      </p>
      <div className="flex flex-col gap-1 pl-2">
        {node.children.map((child) => (
          <MobileSidebarNode
            activePath={activePath}
            key={child.id}
            node={child}
            onSelectPath={onSelectPath}
          />
        ))}
      </div>
    </div>
  );
}
