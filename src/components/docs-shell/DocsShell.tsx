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
import { SidebarProvider } from '@/components/ui/sidebar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { replaceDocLocale } from '@/lib/docs-routing';
import type { DocsSidebarNode, TabSummary } from '@/lib/docs-tree';
import { type AppLocale, SUPPORTED_LOCALES } from '@/lib/i18n/i18n-config';
import { useLocale } from '@/lib/i18n/use-locale';
import { DocsMainColumn } from './DocsMainColumn';
import { DocsSearchDialog, type SearchEntry } from './DocsSearchDialog';
import { DocsSidebar } from './DocsSidebar';
import { DocsTocRail } from './DocsTocRail';

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
  sidebar: DocsSidebarNode[];
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
    '--docs-shell-body-height': `calc(100svh - ${headerOffset}px)`,
  } as React.CSSProperties;
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
          <div
            className="mx-auto flex h-[52px] w-full max-w-[1440px] items-center gap-3 px-4 sm:px-7"
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
              <div
                className="lg:hidden"
                data-testid="docs-mobile-header-actions"
              >
                <DocsSearchDialog mode="mobile" pages={pages} tabs={tabs} />
              </div>
              <div
                className="hidden items-center gap-2 lg:flex"
                data-testid="docs-desktop-header-actions"
              >
                <div className="w-80">
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
                  className="hidden lg:inline-flex lg:size-[34px] lg:rounded-lg"
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
            className="hidden border-t border-border md:block"
            data-testid="docs-tabs-strip"
          >
            <div className="mx-auto flex h-10 w-full max-w-[1440px] justify-start px-4 sm:px-6">
              <Tabs className="w-auto max-w-full" value={activeTab}>
                <TabsList
                  className="max-w-full justify-start gap-0 overflow-visible px-0"
                  variant="line"
                >
                  {tabs.map((tab) => (
                    <TabsTrigger asChild key={tab.id} value={tab.id}>
                      <Link
                        className="h-10 rounded-none px-3.5 text-[13.5px] font-medium data-[state=active]:font-semibold"
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
        <div
          className="mx-auto grid w-full max-w-[1440px] min-w-0 grid-cols-1 px-4 lg:h-[var(--docs-shell-body-height)] lg:grid-cols-[256px_minmax(0,1fr)] lg:overflow-hidden xl:grid-cols-[256px_minmax(0,1fr)_220px]"
          data-testid="docs-body-shell"
        >
          <DocsSidebar
            activePath={activePath}
            activeTab={activeTab}
            nodes={sidebar}
            onSelectPath={() => setIsMobileSheetOpen(false)}
          />
          <DocsMainColumn next={next} previous={previous}>
            {children}
          </DocsMainColumn>
          <DocsTocRail toc={toc} />
        </div>
      </div>
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
              className="h-8 gap-2 rounded-lg border-[color:var(--line-strong)] bg-card px-2.5 text-[13px] text-[color:var(--ink-2)]"
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
  sidebar: DocsSidebarNode[];
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
