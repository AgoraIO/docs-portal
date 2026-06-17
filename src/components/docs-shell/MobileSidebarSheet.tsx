'use client';

import { Link } from '@tanstack/react-router';
import { MoonIcon, SunIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { DocsSidebarHeader } from '@/lib/docs-nav-scope';
import type { DocsSidebarNode, TabSummary } from '@/lib/docs-tree';
import type { AppLocale } from '@/lib/i18n/i18n-config';
import { useTranslation } from '@/lib/i18n/react';
import type { LocaleLink } from './DocsShell';
import { LocaleSwitcher } from './DocsShell';
import { DocsSidebarHeaderBlock } from './DocsSidebarHeaderBlock';

export function MobileSidebarSheet({
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
            ? 'bg-accent text-accent-foreground'
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
      <p className="px-3 py-1 text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
        {node.title}
      </p>
      {node.children.map((child) => (
        <MobileSidebarNode
          activePath={activePath}
          key={child.id}
          node={child}
          onSelectPath={onSelectPath}
        />
      ))}
    </div>
  );
}
