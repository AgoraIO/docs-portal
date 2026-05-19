'use client';

import { useNavigate } from '@tanstack/react-router';
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
  mode = 'desktop',
  pages,
  tabs,
}: {
  mode?: 'desktop' | 'mobile';
  pages: SearchEntry[];
  tabs: TabSummary[];
}) {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  async function handleSelect(url: string) {
    setOpen(false);
    await navigate({
      to: url,
    });
  }

  return (
    <>
      {mode === 'mobile' ? (
        <Button
          aria-label={t('docs.search')}
          onClick={() => setOpen(true)}
          size="icon"
          variant="ghost"
        >
          <SearchIcon />
        </Button>
      ) : (
        <Button
          aria-label={t('docs.search')}
          className="docs-shell-search-trigger"
          onClick={() => setOpen(true)}
          size="sm"
          variant="outline"
        >
          <SearchIcon data-icon="inline-start" />
          <span>{t('docs.searchPlaceholder')}</span>
          <kbd>⌘K</kbd>
        </Button>
      )}
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
                onSelect={() => void handleSelect(tab.url)}
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
                onSelect={() => void handleSelect(page.url)}
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
