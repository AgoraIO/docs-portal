'use client';

import { Link } from '@tanstack/react-router';
import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/cn';
import type { DocsLayoutMode } from '@/lib/docs-layout';
import { DOCS_MAIN_SCROLL_RESTORATION_ID } from '@/lib/docs-scroll-restoration';
import {
  type AppLocale,
  DEFAULT_LOCALE,
  normalizeLocale,
} from '@/lib/i18n/i18n-config';
import { DocsPageFeedback } from './DocsPageFeedback';
import { DocsSiteFooter } from './DocsSiteFooter';

export function DocsMainColumn({
  children,
  contentFillsWidth = false,
  layoutMode = 'docs',
  locale = DEFAULT_LOCALE,
  next,
  previous,
  resetKey,
}: {
  children: React.ReactNode;
  contentFillsWidth?: boolean;
  layoutMode?: DocsLayoutMode;
  locale?: AppLocale | string;
  next?: { title: string; url: string };
  previous?: { title: string; url: string };
  resetKey?: string;
}) {
  return (
    <main
      className="min-w-0 flex-1 bg-background"
      data-testid="docs-main-column"
    >
      <div
        className="px-4 py-8 sm:px-6 lg:p-0"
        data-testid="docs-main-mobile-flow"
      >
        <div
          data-scroll-restoration-id={DOCS_MAIN_SCROLL_RESTORATION_ID}
          data-testid="docs-main-desktop-scroll"
          data-reset-key={resetKey}
        >
          <div className="flex min-w-0 flex-col lg:px-10 lg:py-8">
            <div className="min-w-0">{children}</div>
            <DocsPageFooter
              contentFillsWidth={contentFillsWidth}
              includeFeedback
              layoutMode={layoutMode}
              locale={locale}
              next={next}
              previous={previous}
            />
          </div>
        </div>
        <DocsSiteFooter
          className="relative left-1/2 w-screen -translate-x-1/2 lg:hidden"
          locale={locale}
        />
      </div>
    </main>
  );
}

function DocsPageFooter({
  contentFillsWidth = false,
  includeFeedback = false,
  layoutMode = 'docs',
  locale,
  next,
  previous,
}: {
  contentFillsWidth?: boolean;
  includeFeedback?: boolean;
  layoutMode?: DocsLayoutMode;
  locale: AppLocale | string;
  next?: { title: string; url: string };
  previous?: { title: string; url: string };
}) {
  const { i18n } = useTranslation('common');
  const t = i18n.getFixedT(normalizeLocale(locale) ?? DEFAULT_LOCALE, 'common');
  const footerFillsWidth = contentFillsWidth || layoutMode === 'openapi';

  return (
    <footer
      className={cn(
        'mt-10 flex flex-col gap-5 border-t border-[color:var(--line-soft)] pt-6',
        footerFillsWidth ? 'max-w-none' : 'max-w-[var(--content-max)]',
      )}
      data-testid="docs-page-footer"
    >
      {includeFeedback ? <DocsPageFeedback locale={locale} /> : null}
      {previous || next ? (
        <div
          className={cn(
            'grid grid-cols-1 gap-3',
            previous && next ? 'sm:grid-cols-2' : null,
          )}
          data-testid="docs-pager"
        >
          {previous ? (
            <FooterLink direction={t('docs.previous')} link={previous} />
          ) : null}
          {next ? (
            <FooterLink align="end" direction={t('docs.next')} link={next} />
          ) : null}
        </div>
      ) : null}
    </footer>
  );
}

function FooterLink({
  align = 'start',
  direction,
  link,
}: {
  align?: 'start' | 'end';
  direction: string;
  link: { title: string; url: string };
}) {
  return (
    <Link
      className={cn(
        'flex min-w-0 flex-1 flex-col rounded-lg border border-[color:var(--line-soft)] bg-card px-4 py-3 text-sm transition-colors hover:border-[color:var(--line-strong)] hover:bg-[color:var(--surface-muted)]',
        align === 'end' && 'items-end text-right',
      )}
      params={{}}
      search={{}}
      to={link.url}
    >
      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--ink-4)]">
        {direction}
      </span>
      <span className="max-w-full truncate font-medium text-[color:var(--ink-1)]">
        {align === 'start' ? (
          <ArrowLeftIcon className="mr-1.5 inline size-3.5" />
        ) : null}
        {link.title}
        {align === 'end' ? (
          <ArrowRightIcon className="ml-1.5 inline size-3.5" />
        ) : null}
      </span>
    </Link>
  );
}
