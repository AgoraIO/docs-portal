'use client';
import { create } from '@orama/orama';
import { useDocsSearch } from 'fumadocs-core/search/client';
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

function initOrama() {
  return create({
    schema: { _: 'string' },
    // https://docs.orama.com/docs/orama-js/supported-languages
    language: 'english',
  });
}

export default function DefaultSearchDialog(props: SharedProps) {
  const { locale } = useI18n(); // (optional) for i18n
  const { search, setSearch, query } = useDocsSearch({
    type: 'static',
    initOrama,
    locale,
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
