'use client';

import { SearchIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import type { TabSummary } from '@/lib/docs-tree';

export type SearchEntry = {
  description?: string;
  title: string;
  url: string;
};

export function DocsSearchDialog({
  pages,
  tabs,
}: {
  pages: SearchEntry[];
  tabs: TabSummary[];
}) {
  const { t } = useTranslation('common');
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        className="w-full justify-start rounded-md"
        onClick={() => setOpen(true)}
        size="sm"
        variant="outline"
      >
        <SearchIcon data-icon="inline-start" />
        {t('docs.search')}
      </Button>
      <CommandDialog
        className="max-w-2xl overflow-hidden border-border p-0"
        description={t('docs.searchDescription')}
        onOpenChange={setOpen}
        open={open}
        title={t('docs.search')}
      >
        <CommandInput placeholder={t('docs.searchPlaceholder')} />
        <CommandList>
          <CommandEmpty>{t('docs.searchEmpty')}</CommandEmpty>
          <CommandGroup heading={t('docs.tabsLabel')}>
            {tabs.map((tab) => (
              <CommandItem
                key={tab.url}
                onSelect={() => {
                  window.location.href = tab.url;
                  setOpen(false);
                }}
              >
                <div className="flex flex-col gap-1">
                  <span>{tab.title}</span>
                  {tab.description ? (
                    <span className="text-xs text-muted-foreground">
                      {tab.description}
                    </span>
                  ) : null}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading={t('docs.pagesLabel')}>
            {pages.map((page) => (
              <CommandItem
                key={page.url}
                onSelect={() => {
                  window.location.href = page.url;
                  setOpen(false);
                }}
              >
                <div className="flex flex-col gap-1">
                  <span>{page.title}</span>
                  {page.description ? (
                    <span className="text-xs text-muted-foreground">
                      {page.description}
                    </span>
                  ) : null}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
