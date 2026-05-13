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
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/cn';
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
  const { locale: activeLocale, setLocale } = useLocale();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1440px] items-center gap-3 px-4 py-3 sm:px-6">
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
              <Badge variant="secondary">{t('app.endorsement')}</Badge>
              <Link className="truncate text-sm font-semibold" to="/">
                {t('app.name')}
              </Link>
            </div>
          </div>
          <div className="hidden min-w-0 flex-1 lg:flex">
            <Tabs className="w-full" value={activeTab}>
              <TabsList className="w-full justify-start overflow-x-auto rounded-none bg-transparent p-0">
                {tabs.map((tab) => (
                  <TabsTrigger asChild key={tab.id} value={tab.id}>
                    <Link
                      className="h-10 rounded-none border-b-2 border-transparent px-4 data-[state=active]:border-foreground"
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
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden w-64 md:block">
              <DocsSearchDialog pages={pages} tabs={tabs} />
            </div>
            <LocaleSwitcher
              currentLocale={locale as AppLocale}
              onSelect={async (nextLocale) => {
                await setLocale(nextLocale);
                await navigate({
                  to: replaceDocLocale(activePath, nextLocale),
                });
              }}
              selectedLocale={activeLocale}
            />
            <Button
              onClick={() =>
                setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
              }
              size="icon"
              variant="ghost"
            >
              {resolvedTheme === 'dark' ? <SunIcon /> : <MoonIcon />}
              <span className="sr-only">{t('controls.theme.label')}</span>
            </Button>
          </div>
        </div>
      </header>
      <div className="mx-auto grid w-full max-w-[1440px] gap-0 lg:grid-cols-[280px_minmax(0,1fr)_240px]">
        <aside className="hidden border-r border-border lg:block">
          <Sidebar activePath={activePath} entries={sidebar} />
        </aside>
        <main className="min-w-0 px-4 py-8 sm:px-6 lg:px-10">{children}</main>
        <aside className="hidden border-l border-border xl:block">
          <ScrollArea className="h-[calc(100vh-73px)] px-6 py-8">
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
    </div>
  );
}

function LocaleSwitcher({
  currentLocale,
  onSelect,
  selectedLocale,
}: {
  currentLocale: AppLocale;
  onSelect: (locale: AppLocale) => Promise<void>;
  selectedLocale: AppLocale;
}) {
  const { t } = useTranslation('common');

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="icon" variant="ghost">
          <LanguagesIcon />
          <span className="sr-only">{t('controls.language.label')}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-44 p-1">
        <div className="flex flex-col gap-1">
          {SUPPORTED_LOCALES.map((locale) => {
            const isActive = selectedLocale === locale;
            const label =
              locale === 'zh-CN'
                ? t('controls.language.chinese')
                : t('controls.language.english');

            return (
              <Button
                className="justify-between rounded-xl"
                key={locale}
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
  );
}

function Sidebar({
  activePath,
  entries,
}: {
  activePath: string;
  entries: SidebarEntry[];
}) {
  return (
    <ScrollArea className="h-[calc(100vh-73px)]">
      <nav className="flex flex-col gap-1 p-4">
        {entries.map((entry) =>
          entry.type === 'separator' ? (
            <div
              className="px-3 py-3 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground"
              key={entry.id}
            >
              {entry.title.replaceAll('-', ' ')}
            </div>
          ) : (
            <Link
              className={cn(
                'rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
                entry.url === activePath && 'bg-accent text-accent-foreground',
              )}
              key={entry.id}
              params={{}}
              search={{}}
              to={entry.url}
            >
              {entry.title}
            </Link>
          ),
        )}
      </nav>
    </ScrollArea>
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
          <TabsList className="flex w-full flex-col items-stretch gap-1 bg-transparent p-0">
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
      <Sidebar activePath={activePath} entries={sidebar} />
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
