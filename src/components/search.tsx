'use client';
import { useDocsSearch } from 'fumadocs-core/search/client';
import { flexsearchStaticClient } from 'fumadocs-core/search/client/flexsearch-static';
import {
  SearchDialog,
  SearchDialogClose,
  SearchDialogContent,
  SearchDialogHeader,
  SearchDialogIcon,
  SearchDialogInput,
  SearchDialogList,
  SearchDialogOverlay,
  type SharedProps,
} from 'fumadocs-ui/components/dialog/search';
import { useI18n } from 'fumadocs-ui/contexts/i18n';
import { useMemo } from 'react';
import { toLocalizedPath } from '@/lib/locale-routes';

export default function DefaultSearchDialog(props: SharedProps) {
  const { locale } = useI18n(); // (optional) for i18n
  const client = useMemo(() => {
    if (typeof window === 'undefined') {
      return {
        search: async () => [],
        deps: [locale, 'ssr'],
      };
    }

    return flexsearchStaticClient({
      from: toLocalizedPath(locale as 'en' | 'zh-CN', '/api/search'),
      locale,
    });
  }, [locale]);

  const { search, setSearch, query } = useDocsSearch({
    client,
  });

  return (
    <SearchDialog
      search={search}
      onSearchChange={setSearch}
      isLoading={query.isLoading}
      {...props}
    >
      <SearchDialogOverlay className="bg-[rgba(15,23,42,0.08)] backdrop-blur-[3px] dark:bg-black/45" />
      <SearchDialogContent className="mint-search-dialog">
        <SearchDialogHeader className="border-b border-border/75 px-4 py-3">
          <SearchDialogIcon className="text-muted-foreground" />
          <SearchDialogInput className="text-base text-foreground placeholder:text-muted-foreground" />
          <SearchDialogClose className="border-border/70 bg-secondary/65 text-muted-foreground hover:bg-accent hover:text-foreground" />
        </SearchDialogHeader>
        <SearchDialogList
          className="mint-search-list"
          items={query.data !== 'empty' ? query.data : null}
        />
      </SearchDialogContent>
    </SearchDialog>
  );
}
