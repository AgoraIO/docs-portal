'use client';

import { Link } from '@tanstack/react-router';
import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/cn';
import { type DocsLayoutMode, isWideDocsLayout } from '@/lib/docs-layout';
import {
  type AppLocale,
  DEFAULT_LOCALE,
  normalizeLocale,
} from '@/lib/i18n/i18n-config';
import { DocsPageFeedback } from './DocsPageFeedback';
import { DocsSiteFooter } from './DocsSiteFooter';
import { useTransientScrollbar } from './useTransientScrollbar';

export function DocsMainColumn({
  children,
  layoutMode = 'docs',
  locale = DEFAULT_LOCALE,
  next,
  previous,
  resetKey,
}: {
  children: React.ReactNode;
  layoutMode?: DocsLayoutMode;
  locale?: AppLocale | string;
  next?: { title: string; url: string };
  previous?: { title: string; url: string };
  resetKey?: string;
}) {
  const { isScrollbarVisible, scrollContainerRef, scrollToTop } =
    useTransientScrollbar<HTMLDivElement>();
  const previousResetKey = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!resetKey) {
      return;
    }

    if (previousResetKey.current && previousResetKey.current !== resetKey) {
      scrollToTop();
      window.scrollTo({
        behavior: 'auto',
        top: 0,
      });
    }

    previousResetKey.current = resetKey;
  }, [resetKey, scrollToTop]);

  return (
    <main
      className="h-full min-h-0 min-w-0 flex-1 overflow-hidden bg-background"
      data-testid="docs-main-column"
    >
      <div
        className="px-4 py-8 sm:px-6 lg:hidden lg:px-10"
        data-testid="docs-main-mobile-flow"
      >
        <div className="min-w-0">{children}</div>
        <DocsPageFooter
          includeFeedback
          layoutMode={layoutMode}
          locale={locale}
          next={next}
          previous={previous}
        />
        <DocsSiteFooter />
      </div>
      <div
        className={cn(
          'docs-scrollbar hidden h-full min-h-0 overflow-y-auto lg:block',
          isScrollbarVisible && 'docs-scrollbar-visible',
        )}
        data-testid="docs-main-desktop-scroll"
        ref={scrollContainerRef}
      >
        <div className="flex min-h-full flex-col px-4 py-8 sm:px-6 lg:px-10">
          <div className="min-w-0 flex-1">{children}</div>
          <DocsPageFooter
            layoutMode={layoutMode}
            locale={locale}
            next={next}
            previous={previous}
          />
          <DocsSiteFooter
            className="lg:w-[var(--docs-site-footer-width)]"
            contentClassName="px-0"
            style={{
              marginLeft: isWideDocsLayout(layoutMode)
                ? 'calc(-1 * 1rem)'
                : 'calc(-1 * var(--docs-site-footer-offset))',
            }}
          />
        </div>
      </div>
    </main>
  );
}

function DocsPageFooter({
  includeFeedback = false,
  layoutMode = 'docs',
  locale,
  next,
  previous,
}: {
  includeFeedback?: boolean;
  layoutMode?: DocsLayoutMode;
  locale: AppLocale | string;
  next?: { title: string; url: string };
  previous?: { title: string; url: string };
}) {
  const { i18n } = useTranslation('common');
  const t = i18n.getFixedT(normalizeLocale(locale) ?? DEFAULT_LOCALE, 'common');

  return (
    <footer
      className={cn(
        'mt-10 flex flex-col gap-5 border-t border-[color:var(--line-soft)] pt-6',
        isWideDocsLayout(layoutMode)
          ? 'max-w-none'
          : 'max-w-[var(--content-max)]',
      )}
      data-testid="docs-page-footer"
    >
      {includeFeedback ? <DocsPageFeedback locale={locale} /> : null}
      {previous || next ? (
        <div
          className="grid grid-cols-1 gap-3 sm:grid-cols-2"
          data-testid="docs-pager"
        >
          {previous ? (
            <FooterLink direction={t('docs.previous')} link={previous} />
          ) : (
            <div />
          )}
          {next ? (
            <FooterLink align="end" direction={t('docs.next')} link={next} />
          ) : (
            <div />
          )}
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
