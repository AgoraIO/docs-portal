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
            <Sheet>
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
                  sidebar={sidebar}
                  tabs={tabs}
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
            />
            <Button
              aria-label={themeLabel}
              aria-pressed={isDarkTheme}
              onClick={() => setTheme(isDarkTheme ? 'light' : 'dark')}
              size="icon"
              variant="ghost"
            >
              {isDarkTheme ? <SunIcon /> : <MoonIcon />}
              <span className="sr-only">{themeLabel}</span>
            </Button>
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
}: {
  currentLocale: AppLocale;
  onSelect: (locale: AppLocale) => Promise<void>;
}) {
  const { t } = useTranslation('common');

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            aria-label={t('controls.language.label')}
            className="hidden gap-2 rounded-full px-3 md:inline-flex"
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
                  key={`desktop-${locale}`}
                  onClick={() => void onSelect(locale)}
                  variant={currentLocale === locale ? 'secondary' : 'ghost'}
                >
                  <span>{label}</span>
                  {isActive ? <CheckIcon className="size-4" /> : null}
                </Button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            aria-label={t('controls.language.label')}
            className="md:hidden"
            size="icon"
            variant="ghost"
          >
            <LanguagesIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-44 p-1">
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
                  key={`mobile-${locale}`}
                  onClick={() => void onSelect(locale)}
                  variant={currentLocale === locale ? 'secondary' : 'ghost'}
                >
                  <span>{label}</span>
                  {isActive ? <CheckIcon className="size-4" /> : null}
                </Button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </>
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
  sidebar,
  tabs,
}: {
  activePath: string;
  activeTab: string;
  sidebar: SidebarEntry[];
  tabs: TabSummary[];
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ScrollArea className="border-b border-border px-4 py-4">
        <Tabs className="w-full" value={activeTab}>
          <TabsList
            className="flex w-full flex-col items-stretch gap-1 bg-transparent p-0"
            variant="line"
          >
            {tabs.map((tab) => (
              <TabsTrigger asChild key={tab.id} value={tab.id}>
                <Link
                  className="justify-start rounded-md px-3 py-2"
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
      </ScrollArea>
      <DocsSidebar activePath={activePath} entries={sidebar} />
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
