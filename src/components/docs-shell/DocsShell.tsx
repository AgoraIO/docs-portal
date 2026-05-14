'use client';

import { Link, useNavigate } from '@tanstack/react-router';
import type { TOCItemType } from 'fumadocs-core/toc';
import {
  CheckIcon,
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Sidebar as ShadcnSidebar,
  SidebarContent as ShadcnSidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { replaceDocLocale } from '@/lib/docs-routing';
import type { SidebarEntry, TabSummary } from '@/lib/docs-tree';
import { type AppLocale, SUPPORTED_LOCALES } from '@/lib/i18n/i18n-config';
import { useLocale } from '@/lib/i18n/use-locale';
import { DocsTableOfContents } from './DocsContent';
import { DocsSearchDialog, type SearchEntry } from './DocsSearchDialog';

export function DocsShell({
  activePath,
  activeTab,
  children,
  locale,
  pages,
  previous,
  next,
  sidebar,
  tabs,
  toc,
}: {
  activePath: string;
  activeTab: string;
  children: React.ReactNode;
  locale: string;
  pages: SearchEntry[];
  next?: { title: string; url: string };
  previous?: { title: string; url: string };
  sidebar: SidebarEntry[];
  tabs: TabSummary[];
  toc: TOCItemType[];
}) {
  const { t } = useTranslation('common');
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
  } as React.CSSProperties;
  const desktopRailStyle = {
    top: 'var(--docs-shell-header-offset)',
    height: 'calc(100svh - var(--docs-shell-header-offset))',
  } as React.CSSProperties;

  return (
    <SidebarProvider
      className="block min-h-screen bg-background text-foreground"
      style={shellOffsetStyle}
    >
      <header
        className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur"
        ref={headerRef}
      >
        <div
          className="mx-auto flex w-full max-w-[1440px] items-center gap-3 px-4 py-2.5 sm:px-6"
          data-testid="docs-main-header-row"
        >
          <div className="flex min-w-0 items-center gap-3">
            <Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
              <SheetTrigger asChild>
                <Button className="lg:hidden" size="icon" variant="ghost">
                  <MenuIcon />
                  <span className="sr-only">{t('docs.openMenu')}</span>
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[88vw] max-w-sm gap-0 p-0" side="left">
                <SheetHeader className="border-b">
                  <SheetTitle>{t('app.name')}</SheetTitle>
                </SheetHeader>
                <MobileSidebar
                  activePath={activePath}
                  activeTab={activeTab}
                  currentLocale={locale as AppLocale}
                  isDarkTheme={isDarkTheme}
                  onSelectLocale={async (nextLocale) => {
                    await setLocale(nextLocale);
                    setIsMobileSheetOpen(false);
                    await navigate({
                      to: replaceDocLocale(activePath, nextLocale),
                    });
                  }}
                  onSelectPath={() => setIsMobileSheetOpen(false)}
                  sidebar={sidebar}
                  themeLabel={themeLabel}
                  tabs={tabs}
                  toggleTheme={() => {
                    setTheme(isDarkTheme ? 'light' : 'dark');
                    setIsMobileSheetOpen(false);
                  }}
                />
              </SheetContent>
            </Sheet>
            <div className="flex min-w-0 items-center gap-3">
              <Link className="truncate text-sm font-semibold" to="/">
                {t('app.name')}
              </Link>
            </div>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <div className="lg:hidden" data-testid="docs-mobile-header-actions">
              <DocsSearchDialog mode="mobile" pages={pages} tabs={tabs} />
            </div>
            <div
              className="hidden items-center gap-2 lg:flex"
              data-testid="docs-desktop-header-actions"
            >
              <div className="w-44 sm:w-56 md:w-72">
                <DocsSearchDialog mode="desktop" pages={pages} tabs={tabs} />
              </div>
              <LocaleSwitcher
                currentLocale={locale as AppLocale}
                onSelect={async (nextLocale) => {
                  await setLocale(nextLocale);
                  await navigate({
                    to: replaceDocLocale(activePath, nextLocale),
                  });
                }}
                variant="desktop"
              />
              <Button
                aria-label={themeLabel}
                aria-pressed={isDarkTheme}
                className="hidden lg:inline-flex"
                onClick={() => setTheme(isDarkTheme ? 'light' : 'dark')}
                size="icon"
                variant="ghost"
              >
                {isDarkTheme ? <SunIcon /> : <MoonIcon />}
                <span className="sr-only">{themeLabel}</span>
              </Button>
            </div>
          </div>
        </div>
        <nav
          className="hidden border-t border-border lg:block"
          data-testid="docs-tabs-strip"
        >
          <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6">
            <Tabs className="w-full" value={activeTab}>
              <TabsList
                className="h-10 w-full justify-start gap-0 overflow-x-auto px-0"
                variant="line"
              >
                {tabs.map((tab) => (
                  <TabsTrigger asChild key={tab.id} value={tab.id}>
                    <Link
                      className="h-10 rounded-none px-4"
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
        </nav>
      </header>
      <div className="mx-auto flex w-full max-w-[1440px]">
        <DocsSidebar activePath={activePath} entries={sidebar} />
        <SidebarInset className="min-w-0 bg-background">
          <div className="px-4 py-8 sm:px-6 lg:px-10">{children}</div>
        </SidebarInset>
        <aside className="hidden w-[240px] shrink-0 border-l border-border xl:block">
          <ScrollArea className="px-6 py-8" style={desktopRailStyle}>
            <DocsTableOfContents toc={toc} />
          </ScrollArea>
        </aside>
      </div>
      {previous || next ? (
        <footer className="mx-auto flex w-full max-w-[1440px] justify-between gap-3 border-t border-border px-4 py-6 sm:px-6 lg:px-10">
          {previous ? (
            <FooterLink direction={t('docs.previous')} link={previous} />
          ) : (
            <div />
          )}
          {next ? (
            <FooterLink direction={t('docs.next')} link={next} />
          ) : (
            <div />
          )}
        </footer>
      ) : null}
    </SidebarProvider>
  );
}

function LocaleSwitcher({
  currentLocale,
  onSelect,
  variant = 'all',
}: {
  currentLocale: AppLocale;
  onSelect: (locale: AppLocale) => Promise<void>;
  variant?: 'all' | 'desktop' | 'mobile';
}) {
  const { t } = useTranslation('common');

  return (
    <>
      {variant !== 'mobile' ? (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              aria-label={t('controls.language.label')}
              className="gap-2 rounded-full px-3"
              size="sm"
              variant="outline"
            >
              <LanguagesIcon data-icon="inline-start" />
              <span>
                {currentLocale === 'zh-CN'
                  ? t('controls.language.chinese')
                  : t('controls.language.english')}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-44 p-1">
            <LocaleOptions
              currentLocale={currentLocale}
              onSelect={onSelect}
              scopeKey="desktop"
            />
          </PopoverContent>
        </Popover>
      ) : null}
      {variant !== 'desktop' ? (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              aria-label={t('controls.language.label')}
              size="icon"
              variant="ghost"
            >
              <LanguagesIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-44 p-1">
            <LocaleOptions
              currentLocale={currentLocale}
              onSelect={onSelect}
              scopeKey="mobile"
            />
          </PopoverContent>
        </Popover>
      ) : null}
    </>
  );
}

function LocaleOptions({
  currentLocale,
  onSelect,
  scopeKey,
}: {
  currentLocale: AppLocale;
  onSelect: (locale: AppLocale) => Promise<void>;
  scopeKey: string;
}) {
  const { t } = useTranslation('common');

  return (
    <div className="flex flex-col gap-1">
      {SUPPORTED_LOCALES.map((locale) => {
        const isActive = currentLocale === locale;
        const label =
          locale === 'zh-CN'
            ? t('controls.language.chinese')
            : t('controls.language.english');

        return (
          <Button
            className="justify-between rounded-xl"
            key={`${scopeKey}-${locale}`}
            onClick={() => void onSelect(locale)}
            variant={currentLocale === locale ? 'secondary' : 'ghost'}
          >
            <span>{label}</span>
            {isActive ? <CheckIcon className="size-4" /> : null}
          </Button>
        );
      })}
    </div>
  );
}

function DocsSidebar({
  activePath,
  entries,
}: {
  activePath: string;
  entries: SidebarEntry[];
}) {
  return (
    <ShadcnSidebar
      className="border-r border-border"
      collapsible="none"
      style={{
        top: 'var(--docs-shell-header-offset)',
        height: 'calc(100svh - var(--docs-shell-header-offset))',
      }}
      variant="inset"
    >
      <ShadcnSidebarContent>
        <ScrollArea
          style={{
            height: 'calc(100svh - var(--docs-shell-header-offset))',
          }}
        >
          <div className="px-2 py-4">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {entries.map((entry) =>
                    entry.type === 'separator' ? (
                      <SidebarGroupLabel className="mt-3 px-2" key={entry.id}>
                        {entry.title.replaceAll('-', ' ')}
                      </SidebarGroupLabel>
                    ) : (
                      <SidebarMenuItem key={entry.id}>
                        <SidebarMenuButton
                          asChild
                          isActive={entry.url === activePath}
                        >
                          <Link params={{}} search={{}} to={entry.url}>
                            <span>{entry.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ),
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </div>
        </ScrollArea>
      </ShadcnSidebarContent>
    </ShadcnSidebar>
  );
}

function MobileSidebar({
  activePath,
  activeTab,
  currentLocale,
  isDarkTheme,
  onSelectLocale,
  onSelectPath,
  sidebar,
  themeLabel,
  tabs,
  toggleTheme,
}: {
  activePath: string;
  activeTab: string;
  currentLocale: AppLocale;
  isDarkTheme: boolean;
  onSelectLocale: (locale: AppLocale) => Promise<void>;
  onSelectPath: () => void;
  sidebar: SidebarEntry[];
  themeLabel: string;
  tabs: TabSummary[];
  toggleTheme: () => void;
}) {
  const { t } = useTranslation('common');

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
            <div className="flex flex-col gap-1">
              {sidebar.map((entry) =>
                entry.type === 'separator' ? (
                  <p
                    className="mt-3 px-3 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground"
                    key={entry.id}
                  >
                    {entry.title.replaceAll('-', ' ')}
                  </p>
                ) : (
                  <Link
                    className={`rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent ${
                      entry.url === activePath
                        ? 'bg-accent text-foreground'
                        : 'text-muted-foreground'
                    }`}
                    key={entry.id}
                    onClick={onSelectPath}
                    params={{}}
                    search={{}}
                    to={entry.url}
                  >
                    {entry.title}
                  </Link>
                ),
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2 border-t border-border pt-4">
            <div className="flex items-center gap-2">
              <LocaleSwitcher
                currentLocale={currentLocale}
                onSelect={onSelectLocale}
                variant="desktop"
              />
              <Button
                aria-label={themeLabel}
                aria-pressed={isDarkTheme}
                onClick={toggleTheme}
                size="icon"
                variant="outline"
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

function FooterLink({
  direction,
  link,
}: {
  direction: string;
  link: { title: string; url: string };
}) {
  return (
    <Link
      className="flex min-w-0 max-w-sm flex-col gap-1 rounded-lg border border-border px-4 py-3 transition-colors hover:bg-accent"
      params={{}}
      search={{}}
      to={link.url}
    >
      <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
        {direction}
      </span>
      <span className="truncate text-sm font-medium text-foreground">
        {link.title}
      </span>
    </Link>
  );
}
